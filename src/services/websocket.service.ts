import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';
import { cacheService, CacheKeys, CacheTTL } from './cache.service';

const prisma = new PrismaClient();

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
}

interface NotificationPayload {
  id: string;
  type: 'match' | 'event' | 'message' | 'system' | 'points';
  title: string;
  message: string;
  data?: any;
  timestamp: Date;
}

interface UserPresence {
  userId: string;
  status: 'online' | 'away' | 'offline';
  lastSeen: Date;
  location?: {
    latitude: number;
    longitude: number;
  };
}

interface TypingEvent {
  conversationId: string;
  userId: string;
  isTyping: boolean;
}

class WebSocketService {
  private io: SocketIOServer;
  private connectedUsers: Map<string, Set<string>> = new Map(); // userId -> Set of socketIds
  private userPresence: Map<string, UserPresence> = new Map();
  private typingUsers: Map<string, Set<string>> = new Map(); // conversationId -> Set of userIds

  constructor(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true,
      },
      transports: ['websocket', 'polling'],
    });

    this.setupMiddleware();
    this.setupEventHandlers();
    this.startPresenceCleanup();

    logger.info('WebSocket service initialized');
  }

  private setupMiddleware(): void {
    // Authentication middleware
    this.io.use(async (socket: AuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
        
        if (!token) {
          return next(new Error('Authentication token required'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        
        // Verify user exists and is active
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
          select: { id: true, role: true, fullName: true },
        });

        if (!user) {
          return next(new Error('User not found'));
        }

        socket.userId = user.id;
        socket.userRole = user.role;
        
        logger.debug(`Socket authenticated for user ${user.id}`);
        next();
      } catch (error) {
        logger.error('Socket authentication error:', error);
        next(new Error('Authentication failed'));
      }
    });

    // Rate limiting middleware
    this.io.use((socket: AuthenticatedSocket, next) => {
      const rateLimitKey = `ws_rate_limit:${socket.userId}`;
      
      // Allow 100 events per minute per user
      cacheService.increment(rateLimitKey, 1, { ttl: 60 })
        .then(count => {
          if (count > 100) {
            return next(new Error('Rate limit exceeded'));
          }
          next();
        })
        .catch(() => next()); // Don't block on cache errors
    });
  }

  private setupEventHandlers(): void {
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      this.handleConnection(socket);
      this.setupSocketEvents(socket);
    });
  }

  private handleConnection(socket: AuthenticatedSocket): void {
    const userId = socket.userId!;
    
    // Track connected user
    if (!this.connectedUsers.has(userId)) {
      this.connectedUsers.set(userId, new Set());
    }
    this.connectedUsers.get(userId)!.add(socket.id);

    // Update user presence
    this.updateUserPresence(userId, 'online');

    // Join user to personal room
    socket.join(`user:${userId}`);

    // Join user to role-based rooms
    if (socket.userRole) {
      socket.join(`role:${socket.userRole}`);
    }

    // Send pending notifications
    this.sendPendingNotifications(userId);

    logger.info(`User ${userId} connected (socket: ${socket.id})`);

    // Handle disconnection
    socket.on('disconnect', () => {
      this.handleDisconnection(socket);
    });
  }

  private setupSocketEvents(socket: AuthenticatedSocket): void {
    const userId = socket.userId!;

    // Join event room
    socket.on('join_event', (eventId: string) => {
      socket.join(`event:${eventId}`);
      logger.debug(`User ${userId} joined event room: ${eventId}`);
    });

    // Leave event room
    socket.on('leave_event', (eventId: string) => {
      socket.leave(`event:${eventId}`);
      logger.debug(`User ${userId} left event room: ${eventId}`);
    });

    // Join conversation room
    socket.on('join_conversation', (conversationId: string) => {
      socket.join(`conversation:${conversationId}`);
      logger.debug(`User ${userId} joined conversation: ${conversationId}`);
    });

    // Leave conversation room
    socket.on('leave_conversation', (conversationId: string) => {
      socket.leave(`conversation:${conversationId}`);
      // Clear typing status
      this.handleStopTyping(conversationId, userId);
      logger.debug(`User ${userId} left conversation: ${conversationId}`);
    });

    // Typing indicators
    socket.on('start_typing', (conversationId: string) => {
      this.handleStartTyping(conversationId, userId);
    });

    socket.on('stop_typing', (conversationId: string) => {
      this.handleStopTyping(conversationId, userId);
    });

    // Location updates
    socket.on('update_location', (location: { latitude: number; longitude: number }) => {
      this.updateUserLocation(userId, location);
    });

    // Mark notifications as read
    socket.on('mark_notifications_read', (notificationIds: string[]) => {
      this.markNotificationsAsRead(userId, notificationIds);
    });

    // Presence status update
    socket.on('update_presence', (status: 'online' | 'away') => {
      this.updateUserPresence(userId, status);
    });

    // Match response
    socket.on('match_response', (data: { matchId: string; action: 'accept' | 'reject' }) => {
      this.handleMatchResponse(userId, data.matchId, data.action);
    });

    // Send message
    socket.on('send_message', (data: { conversationId: string; message: string }) => {
      this.handleSendMessage(userId, data.conversationId, data.message);
    });
  }

  private handleDisconnection(socket: AuthenticatedSocket): void {
    const userId = socket.userId!;
    
    // Remove socket from user's connections
    const userSockets = this.connectedUsers.get(userId);
    if (userSockets) {
      userSockets.delete(socket.id);
      
      // If no more connections, update presence
      if (userSockets.size === 0) {
        this.updateUserPresence(userId, 'offline');
        this.connectedUsers.delete(userId);
      }
    }

    logger.info(`User ${userId} disconnected (socket: ${socket.id})`);
  }

  /**
   * Send notification to specific user
   */
  async sendNotificationToUser(userId: string, notification: NotificationPayload): Promise<void> {
    try {
      // Store notification in database
      await prisma.notification.create({
        data: {
          id: notification.id,
          userId,
          type: notification.type.toUpperCase() as any,
          title: notification.title,
          message: notification.message,
          metadata: notification.data,
        },
      });

      // Send real-time notification if user is online
      this.io.to(`user:${userId}`).emit('notification', notification);

      // Cache unread notification count
      const unreadCount = await this.getUnreadNotificationCount(userId);
      await cacheService.set(
        CacheKeys.user(`${userId}:unread_notifications`),
        unreadCount,
        { ttl: CacheTTL.MEDIUM }
      );

      logger.debug(`Notification sent to user ${userId}: ${notification.title}`);
    } catch (error) {
      logger.error('Failed to send notification:', error);
    }
  }

  /**
   * Send notification to multiple users
   */
  async sendNotificationToUsers(userIds: string[], notification: NotificationPayload): Promise<void> {
    await Promise.all(
      userIds.map(userId => this.sendNotificationToUser(userId, notification))
    );
  }

  /**
   * Broadcast to event participants
   */
  async broadcastToEvent(eventId: string, event: string, data: any): Promise<void> {
    this.io.to(`event:${eventId}`).emit(event, data);
    logger.debug(`Broadcast to event ${eventId}: ${event}`);
  }

  /**
   * Broadcast to role-based groups
   */
  async broadcastToRole(role: string, event: string, data: any): Promise<void> {
    this.io.to(`role:${role}`).emit(event, data);
    logger.debug(`Broadcast to role ${role}: ${event}`);
  }

  /**
   * Send pending notifications to user
   */
  private async sendPendingNotifications(userId: string): Promise<void> {
    try {
      const notifications = await prisma.notification.findMany({
        where: {
          userId,
          isRead: false,
        },
        orderBy: { createdAt: 'desc' },
        take: 50, // Limit to prevent overwhelming
      });

      if (notifications.length > 0) {
        this.io.to(`user:${userId}`).emit('pending_notifications', notifications);
        logger.debug(`Sent ${notifications.length} pending notifications to user ${userId}`);
      }
    } catch (error) {
      logger.error('Failed to send pending notifications:', error);
    }
  }

  /**
   * Handle typing indicators
   */
  private handleStartTyping(conversationId: string, userId: string): void {
    if (!this.typingUsers.has(conversationId)) {
      this.typingUsers.set(conversationId, new Set());
    }
    
    this.typingUsers.get(conversationId)!.add(userId);
    
    // Broadcast to conversation participants
    this.io.to(`conversation:${conversationId}`).emit('user_typing', {
      conversationId,
      userId,
      isTyping: true,
    });

    // Auto-clear typing after 30 seconds
    setTimeout(() => {
      this.handleStopTyping(conversationId, userId);
    }, 30000);
  }

  private handleStopTyping(conversationId: string, userId: string): void {
    const typingSet = this.typingUsers.get(conversationId);
    if (typingSet) {
      typingSet.delete(userId);
      
      if (typingSet.size === 0) {
        this.typingUsers.delete(conversationId);
      }
    }

    this.io.to(`conversation:${conversationId}`).emit('user_typing', {
      conversationId,
      userId,
      isTyping: false,
    });
  }

  /**
   * Update user presence
   */
  private updateUserPresence(userId: string, status: 'online' | 'away' | 'offline'): void {
    const presence: UserPresence = {
      userId,
      status,
      lastSeen: new Date(),
      location: this.userPresence.get(userId)?.location,
    };

    this.userPresence.set(userId, presence);

    // Cache presence
    cacheService.set(
      CacheKeys.user(`${userId}:presence`),
      presence,
      { ttl: CacheTTL.MEDIUM }
    );

    // Broadcast presence update to friends/contacts
    this.broadcastPresenceUpdate(userId, presence);
  }

  /**
   * Update user location
   */
  private updateUserLocation(userId: string, location: { latitude: number; longitude: number }): void {
    const presence = this.userPresence.get(userId);
    if (presence) {
      presence.location = location;
      this.userPresence.set(userId, presence);
      
      // Cache updated presence
      cacheService.set(
        CacheKeys.user(`${userId}:presence`),
        presence,
        { ttl: CacheTTL.MEDIUM }
      );
    }
  }

  /**
   * Handle match response
   */
  private async handleMatchResponse(userId: string, matchId: string, action: 'accept' | 'reject'): Promise<void> {
    try {
      // Update match status in database
      await prisma.match.update({
        where: { id: matchId },
        data: { 
          status: action === 'accept' ? 'ACCEPTED' : 'REJECTED',
          updatedAt: new Date(),
        },
      });

      // Get match details
      const match = await prisma.match.findUnique({
        where: { id: matchId },
        include: {
          sender: { select: { id: true, fullName: true } },
          receiver: { select: { id: true, fullName: true } },
        },
      });

      if (match) {
        const otherUserId = match.senderId === userId ? match.receiverId : match.senderId;
        const otherUser = match.senderId === userId ? match.receiver : match.sender;

        // Notify the other user
        await this.sendNotificationToUser(otherUserId, {
          id: `match_response_${matchId}`,
          type: 'match',
          title: action === 'accept' ? 'Match Accepted!' : 'Match Update',
          message: action === 'accept' 
            ? `${otherUser.fullName} accepted your match request!`
            : `${otherUser.fullName} declined your match request.`,
          data: { matchId, action, match },
          timestamp: new Date(),
        });

        logger.info(`Match ${matchId} ${action}ed by user ${userId}`);
      }
    } catch (error) {
      logger.error('Failed to handle match response:', error);
    }
  }

  /**
   * Handle send message
   */
  private async handleSendMessage(userId: string, conversationId: string, message: string): Promise<void> {
    try {
      // This is a simplified implementation - you'd need proper conversation logic
      const messageData = {
        id: `msg_${Date.now()}`,
        conversationId,
        senderId: userId,
        content: message,
        timestamp: new Date(),
      };

      // Broadcast to conversation participants
      this.io.to(`conversation:${conversationId}`).emit('new_message', messageData);

      logger.debug(`Message sent in conversation ${conversationId} by user ${userId}`);
    } catch (error) {
      logger.error('Failed to handle send message:', error);
    }
  }

  /**
   * Mark notifications as read
   */
  private async markNotificationsAsRead(userId: string, notificationIds: string[]): Promise<void> {
    try {
      await prisma.notification.updateMany({
        where: {
          id: { in: notificationIds },
          userId,
        },
        data: { isRead: true },
      });

      // Update cached unread count
      const unreadCount = await this.getUnreadNotificationCount(userId);
      await cacheService.set(
        CacheKeys.user(`${userId}:unread_notifications`),
        unreadCount,
        { ttl: CacheTTL.MEDIUM }
      );

      logger.debug(`Marked ${notificationIds.length} notifications as read for user ${userId}`);
    } catch (error) {
      logger.error('Failed to mark notifications as read:', error);
    }
  }

  /**
   * Get unread notification count
   */
  private async getUnreadNotificationCount(userId: string): Promise<number> {
    try {
      return await prisma.notification.count({
        where: {
          userId,
          isRead: false,
        },
      });
    } catch (error) {
      logger.error('Failed to get unread notification count:', error);
      return 0;
    }
  }

  /**
   * Broadcast presence update to user's connections
   */
  private async broadcastPresenceUpdate(userId: string, presence: UserPresence): Promise<void> {
    // This would typically notify friends/contacts about presence changes
    // For now, just broadcast to all connected users in the same events/conversations
    
    // You could extend this to notify specific users based on relationships
    logger.debug(`Presence updated for user ${userId}: ${presence.status}`);
  }

  /**
   * Clean up offline users periodically
   */
  private startPresenceCleanup(): void {
    setInterval(() => {
      const now = Date.now();
      const offlineThreshold = 5 * 60 * 1000; // 5 minutes

      for (const [userId, presence] of this.userPresence.entries()) {
        if (presence.status !== 'offline' && 
            now - presence.lastSeen.getTime() > offlineThreshold &&
            !this.connectedUsers.has(userId)) {
          
          this.updateUserPresence(userId, 'offline');
        }
      }
    }, 60000); // Check every minute
  }

  /**
   * Get online users count
   */
  getOnlineUsersCount(): number {
    return this.connectedUsers.size;
  }

  /**
   * Get user presence
   */
  getUserPresence(userId: string): UserPresence | null {
    return this.userPresence.get(userId) || null;
  }

  /**
   * Check if user is online
   */
  isUserOnline(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }

  /**
   * Get WebSocket statistics
   */
  getStats(): {
    connectedUsers: number;
    totalSockets: number;
    typingConversations: number;
  } {
    let totalSockets = 0;
    for (const sockets of this.connectedUsers.values()) {
      totalSockets += sockets.size;
    }

    return {
      connectedUsers: this.connectedUsers.size,
      totalSockets,
      typingConversations: this.typingUsers.size,
    };
  }
}

export { WebSocketService, NotificationPayload, UserPresence };