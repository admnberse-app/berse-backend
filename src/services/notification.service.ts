import { prisma } from '../config/database';
import { NotificationType } from '@prisma/client';
import logger from '../utils/logger';

interface CreateNotificationData {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string;
  metadata?: any;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  relatedEntityId?: string;
  relatedEntityType?: string;
  expiresAt?: Date;
}

/**
 * Notification Service
 * Handles in-app notifications for users
 */
export class NotificationService {
  /**
   * Create a single notification
   */
  static async createNotification(data: CreateNotificationData) {
    try {
      return await prisma.notification.create({
        data: {
          userId: data.userId,
          type: data.type,
          title: data.title,
          message: data.message,
          actionUrl: data.actionUrl,
          metadata: data.metadata || {},
          priority: data.priority || 'normal',
          relatedEntityId: data.relatedEntityId,
          relatedEntityType: data.relatedEntityType,
          expiresAt: data.expiresAt,
          channels: ['in_app'], // Can be extended to include 'email', 'push', etc.
        },
      });
    } catch (error) {
      logger.error('Failed to create notification', {
        userId: data.userId,
        type: data.type,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      // Don't throw - notification failure shouldn't break the main flow
      return null;
    }
  }

  /**
   * Create bulk notifications for multiple users
   */
  static async createBulkNotifications(
    userIds: string[],
    notificationData: Omit<CreateNotificationData, 'userId'>
  ) {
    try {
      const notifications = userIds.map(userId => ({
        userId,
        type: notificationData.type,
        title: notificationData.title,
        message: notificationData.message,
        actionUrl: notificationData.actionUrl,
        metadata: notificationData.metadata || {},
        priority: notificationData.priority || 'normal',
        relatedEntityId: notificationData.relatedEntityId,
        relatedEntityType: notificationData.relatedEntityType,
        expiresAt: notificationData.expiresAt,
        channels: ['in_app'],
      }));

      return await prisma.notification.createMany({
        data: notifications,
      });
    } catch (error) {
      logger.error('Failed to create bulk notifications', {
        userCount: userIds.length,
        type: notificationData.type,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return null;
    }
  }

  /**
   * Get user notifications with pagination
   */
  static async getUserNotifications(
    userId: string, 
    options: { page?: number; limit?: number; unreadOnly?: boolean } = {}
  ) {
    const page = options.page || 1;
    const limit = options.limit || 20;
    const offset = (page - 1) * limit;

    const whereClause: any = { userId };
    if (options.unreadOnly) {
      whereClause.readAt = null;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.notification.count({
        where: whereClause,
      }),
      prisma.notification.count({
        where: { userId, readAt: null },
      }),
    ]);

    return {
      notifications,
      total,
      unreadCount,
      hasMore: offset + limit < total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: string, userId: string) {
    return await prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId,
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });
  }

  /**
   * Mark all user notifications as read
   */
  static async markAllAsRead(userId: string) {
    return await prisma.notification.updateMany({
      where: {
        userId,
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });
  }

  /**
   * Delete a notification
   */
  static async deleteNotification(notificationId: string, userId: string) {
    return await prisma.notification.deleteMany({
      where: {
        id: notificationId,
        userId,
      },
    });
  }

  /**
   * Delete all user notifications
   */
  static async deleteAllNotifications(userId: string) {
    return await prisma.notification.deleteMany({
      where: { userId },
    });
  }

  /**
   * Delete all read notifications
   */
  static async deleteAllRead(userId: string) {
    const result = await prisma.notification.deleteMany({
      where: { 
        userId,
        readAt: { not: null },
      },
    });
    return result.count;
  }

  /**
   * Get unread notification count
   */
  static async getUnreadCount(userId: string): Promise<number> {
    return await prisma.notification.count({
      where: {
        userId,
        readAt: null,
      },
    });
  }

  // ============================================================================
  // NOTIFICATION TEMPLATES
  // ============================================================================

  /**
   * Notify user about successful registration
   */
  static async notifyRegistrationSuccess(userId: string, userName: string) {
    return await this.createNotification({
      userId,
      type: 'SYSTEM',
      title: 'Welcome to Berse! 🎉',
      message: `Hi ${userName}! Your account has been created successfully. Start exploring and connecting with the community!`,
      actionUrl: '/explore',
      priority: 'high',
      metadata: {
        event: 'registration_success',
      },
    });
  }

  /**
   * Notify user to verify their email
   */
  static async notifyEmailVerificationRequired(userId: string, userName: string) {
    return await this.createNotification({
      userId,
      type: 'SYSTEM',
      title: '📧 Verify Your Email',
      message: `Hi ${userName}! Please verify your email address to unlock all features. Check your inbox for the verification link.`,
      actionUrl: '/settings/account',
      priority: 'high',
      metadata: {
        event: 'email_verification_required',
        reminder: true,
      },
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });
  }

  /**
   * Notify user about successful email verification
   */
  static async notifyEmailVerified(userId: string, userName: string) {
    return await this.createNotification({
      userId,
      type: 'SYSTEM',
      title: '✅ Email Verified!',
      message: `Great news ${userName}! Your email has been verified. You now have full access to all features.`,
      actionUrl: '/explore',
      priority: 'normal',
      metadata: {
        event: 'email_verified',
      },
    });
  }

  /**
   * Notify user about connection request received
   */
  static async notifyConnectionRequest(userId: string, senderName: string, senderId: string) {
    return await this.createNotification({
      userId,
      type: 'SYSTEM',
      title: 'New Connection Request',
      message: `${senderName} wants to connect with you!`,
      actionUrl: `/connections/requests`,
      priority: 'normal',
      relatedEntityId: senderId,
      relatedEntityType: 'connection_request',
      metadata: {
        event: 'connection_request',
        senderId,
        senderName,
      },
    });
  }

  /**
   * Notify user about connection request accepted
   */
  static async notifyConnectionAccepted(userId: string, accepterName: string, accepterId: string) {
    return await this.createNotification({
      userId,
      type: 'SYSTEM',
      title: 'Connection Accepted! 🤝',
      message: `${accepterName} accepted your connection request!`,
      actionUrl: `/profile/${accepterId}`,
      priority: 'normal',
      relatedEntityId: accepterId,
      relatedEntityType: 'connection_accepted',
      metadata: {
        event: 'connection_accepted',
        accepterId,
        accepterName,
      },
    });
  }

  /**
   * Notify user about new event
   */
  static async notifyNewEvent(userId: string, eventTitle: string, eventId: string, hostName: string) {
    return await this.createNotification({
      userId,
      type: 'EVENT',
      title: 'New Event Available',
      message: `${hostName} created: ${eventTitle}`,
      actionUrl: `/events/${eventId}`,
      priority: 'normal',
      relatedEntityId: eventId,
      relatedEntityType: 'event',
      metadata: {
        event: 'new_event',
        eventId,
        eventTitle,
        hostName,
      },
    });
  }

  /**
   * Notify user about points earned
   */
  static async notifyPointsEarned(userId: string, points: number, reason: string) {
    return await this.createNotification({
      userId,
      type: 'POINTS',
      title: 'Points Earned! 🎁',
      message: `You earned ${points} points for ${reason}`,
      actionUrl: '/rewards',
      priority: 'low',
      metadata: {
        event: 'points_earned',
        points,
        reason,
      },
    });
  }

  /**
   * Notify user about vouch received
   */
  static async notifyVouchReceived(userId: string, voucherName: string, voucherId: string, vouchType: string) {
    return await this.createNotification({
      userId,
      type: 'VOUCH',
      title: 'New Vouch Received! ⭐',
      message: `${voucherName} vouched for you as a ${vouchType}`,
      actionUrl: `/profile/${voucherId}`,
      priority: 'normal',
      relatedEntityId: voucherId,
      relatedEntityType: 'vouch',
      metadata: {
        event: 'vouch_received',
        voucherId,
        voucherName,
        vouchType,
      },
    });
  }

  /**
   * Notify user about password change
   */
  static async notifyPasswordChanged(userId: string, userName: string) {
    return await this.createNotification({
      userId,
      type: 'SYSTEM',
      title: '🔒 Password Changed',
      message: `Hi ${userName}, your password was recently changed. If this wasn't you, please contact support immediately.`,
      actionUrl: '/settings/security',
      priority: 'high',
      metadata: {
        event: 'password_changed',
        security: true,
      },
    });
  }

  /**
   * Notify user about suspicious login attempt
   */
  static async notifySecurityAlert(userId: string, message: string, details?: any) {
    return await this.createNotification({
      userId,
      type: 'SYSTEM',
      title: '⚠️ Security Alert',
      message,
      actionUrl: '/settings/security',
      priority: 'urgent',
      metadata: {
        event: 'security_alert',
        security: true,
        details,
      },
    });
  }

  /**
   * Send system announcement to all users
   */
  static async sendSystemAnnouncement(
    title: string,
    message: string,
    actionUrl?: string,
    priority: 'low' | 'normal' | 'high' | 'urgent' = 'normal'
  ) {
    // Get all active users
    const users = await prisma.user.findMany({
      where: {
        status: 'ACTIVE',
        deletedAt: null,
      },
      select: { id: true },
    });

    const userIds = users.map(u => u.id);

    return await this.createBulkNotifications(userIds, {
      type: 'SYSTEM',
      title,
      message,
      actionUrl,
      priority,
      metadata: {
        event: 'system_announcement',
        broadcast: true,
      },
    });
  }
}
