import { prisma } from '../../../config/database';
import { AppError } from '../../../middleware/error';
import {
  SendConnectionRequestInput,
  RespondToConnectionRequestInput,
  RemoveConnectionInput,
  WithdrawConnectionRequestInput,
  BlockUserInput,
  UnblockUserInput,
  UpdateConnectionInput,
  ConnectionQuery,
  MutualConnectionsQuery,
  ConnectionSuggestionsQuery,
  ConnectionResponse,
  ConnectionStatsResponse,
  MutualConnectionsResponse,
  ConnectionSuggestionResponse,
  PaginatedConnectionsResponse,
  BlockedUserResponse,
  PaginatedBlockedUsersResponse,
  UserBasicInfo,
} from './connection.types';
import { ConnectionStatus, Prisma } from '@prisma/client';
import logger from '../../../utils/logger';
import { NotificationService } from '../../../services/notification.service';

export class ConnectionService {
  
  // ============================================================================
  // CONNECTION REQUEST OPERATIONS
  // ============================================================================
  
  /**
   * Get connection status between two users
   */
  static async getConnectionStatus(
    userId: string,
    otherUserId: string
  ): Promise<'CONNECTED' | 'PENDING' | 'BLOCKED' | 'NONE'> {
    try {
      // Check if blocked
      const blockExists = await prisma.userBlock.findFirst({
        where: {
          OR: [
            { blockerId: userId, blockedId: otherUserId },
            { blockerId: otherUserId, blockedId: userId },
          ],
        },
      });

      if (blockExists) {
        return 'BLOCKED';
      }

      // Check connection
      const connection = await prisma.userConnection.findFirst({
        where: {
          OR: [
            { initiatorId: userId, receiverId: otherUserId },
            { initiatorId: otherUserId, receiverId: userId },
          ],
        },
        select: { status: true },
      });

      if (!connection) {
        return 'NONE';
      }

      if (connection.status === ConnectionStatus.ACCEPTED) {
        return 'CONNECTED';
      }

      if (connection.status === ConnectionStatus.PENDING) {
        return 'PENDING';
      }

      return 'NONE';
    } catch (error) {
      logger.error('Error getting connection status:', error);
      return 'NONE';
    }
  }

  /**
   * Send a connection request
   */
  static async sendConnectionRequest(
    userId: string,
    data: SendConnectionRequestInput
  ): Promise<ConnectionResponse> {
    try {
      // Prevent self-connection
      if (userId === data.receiverId) {
        throw new AppError('You cannot connect with yourself', 400);
      }

      // Check if receiver exists
      const receiver = await prisma.user.findUnique({
        where: { id: data.receiverId },
        select: { id: true, status: true },
      });

      if (!receiver) {
        throw new AppError('User not found', 404);
      }

      if (receiver.status !== 'ACTIVE') {
        throw new AppError('Cannot send connection request to this user', 400);
      }

      // Check if user is blocked or has blocked the receiver
      const blockExists = await prisma.userBlock.findFirst({
        where: {
          OR: [
            { blockerId: userId, blockedId: data.receiverId },
            { blockerId: data.receiverId, blockedId: userId },
          ],
        },
      });

      if (blockExists) {
        throw new AppError('Cannot send connection request', 403);
      }

      // Check if connection already exists
      const existingConnection = await prisma.userConnection.findFirst({
        where: {
          OR: [
            { initiatorId: userId, receiverId: data.receiverId },
            { initiatorId: data.receiverId, receiverId: userId },
          ],
        },
      });

      if (existingConnection) {
        if (existingConnection.status === ConnectionStatus.ACCEPTED) {
          throw new AppError('You are already connected', 400);
        }
        if (existingConnection.status === ConnectionStatus.PENDING) {
          throw new AppError('Connection request already sent', 400);
        }
        if (existingConnection.status === ConnectionStatus.REMOVED) {
          // Check cooldown period
          if (existingConnection.canReconnectAt && new Date() < existingConnection.canReconnectAt) {
            const daysLeft = Math.ceil(
              (existingConnection.canReconnectAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
            );
            throw new AppError(
              `You can reconnect with this user in ${daysLeft} days`,
              400
            );
          }
        }
      }

      // Create connection request
      const connection = await prisma.userConnection.create({
        data: {
          initiatorId: userId,
          receiverId: data.receiverId,
          status: ConnectionStatus.PENDING,
          message: data.message,
          relationshipType: data.relationshipType,
          relationshipCategory: data.relationshipCategory,
          howWeMet: data.howWeMet,
        },
        include: {
          users_user_connections_receiverIdTousers: {
            select: {
              id: true,
              fullName: true,
              username: true,
              trustScore: true,
              trustLevel: true,
              profile: {
                select: { profilePicture: true },
              },
              location: {
                select: { currentCity: true, countryOfResidence: true },
              },
            },
          },
        },
      });

      // Update connection stats for both users
      await Promise.all([
        this.updateConnectionStats(userId),
        this.updateConnectionStats(data.receiverId),
      ]);

      // Send notification to receiver
      const senderUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { fullName: true, username: true },
      });
      
      if (senderUser) {
        await NotificationService.notifyConnectionRequest(
          data.receiverId,
          senderUser.fullName || senderUser.username || 'Someone',
          userId
        );
      }

      logger.info(`Connection request sent from ${userId} to ${data.receiverId}`);

      return this.formatConnectionResponse(connection, userId);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Error sending connection request:', error);
      throw new AppError('Failed to send connection request', 500);
    }
  }

  /**
   * Respond to a connection request (accept/reject)
   */
  static async respondToConnectionRequest(
    userId: string,
    data: RespondToConnectionRequestInput
  ): Promise<ConnectionResponse> {
    try {
      const connection = await prisma.userConnection.findUnique({
        where: { id: data.connectionId },
      });

      if (!connection) {
        throw new AppError('Connection request not found', 404);
      }

      // Verify user is the receiver
      if (connection.receiverId !== userId) {
        throw new AppError('You can only respond to requests sent to you', 403);
      }

      if (connection.status !== ConnectionStatus.PENDING) {
        throw new AppError('Connection request has already been responded to', 400);
      }

      const now = new Date();
      const updateData: Prisma.UserConnectionUpdateInput = {
        respondedAt: now,
      };

      if (data.action === 'accept') {
        updateData.status = ConnectionStatus.ACCEPTED;
        updateData.connectedAt = now;
      } else {
        updateData.status = ConnectionStatus.REJECTED;
      }

      const updatedConnection = await prisma.userConnection.update({
        where: { id: data.connectionId },
        data: updateData,
        include: {
          users_user_connections_initiatorIdTousers: {
            select: {
              id: true,
              fullName: true,
              username: true,
              trustScore: true,
              trustLevel: true,
              profile: { select: { profilePicture: true } },
              location: { select: { currentCity: true, countryOfResidence: true } },
            },
          },
          users_user_connections_receiverIdTousers: {
            select: {
              id: true,
              fullName: true,
              username: true,
            },
          },
        },
      });

      if (data.action === 'accept') {
        // Update stats for both users
        await Promise.all([
          this.updateConnectionStats(connection.initiatorId),
          this.updateConnectionStats(connection.receiverId),
        ]);

        // Calculate mutual connections
        await this.calculateMutualConnections(data.connectionId);
        
        // Send notification to initiator
        const accepterName = updatedConnection.users_user_connections_receiverIdTousers?.fullName || 
                            updatedConnection.users_user_connections_receiverIdTousers?.username || 
                            'Someone';
        await NotificationService.notifyConnectionAccepted(
          connection.initiatorId,
          accepterName,
          userId
        );
      } else {
        // Send notification to initiator about rejection
        const rejecterName = updatedConnection.users_user_connections_receiverIdTousers?.fullName || 
                            updatedConnection.users_user_connections_receiverIdTousers?.username || 
                            'Someone';
        NotificationService.notifyConnectionRejected(
          connection.initiatorId,
          rejecterName,
          userId
        ).catch(err => logger.error('Failed to send connection rejected notification:', err));
      }

      logger.info(
        `Connection request ${data.action}ed: ${data.connectionId} by ${userId}`
      );

      return this.formatConnectionResponse(updatedConnection, userId);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Error responding to connection request:', error);
      throw new AppError('Failed to respond to connection request', 500);
    }
  }

  /**
   * Withdraw a pending connection request
   */
  static async withdrawConnectionRequest(
    userId: string,
    data: WithdrawConnectionRequestInput
  ): Promise<void> {
    try {
      const connection = await prisma.userConnection.findUnique({
        where: { id: data.connectionId },
      });

      if (!connection) {
        throw new AppError('Connection request not found', 404);
      }

      if (connection.initiatorId !== userId) {
        throw new AppError('You can only withdraw requests you initiated', 403);
      }

      if (connection.status !== ConnectionStatus.PENDING) {
        throw new AppError('Only pending requests can be withdrawn', 400);
      }

      const updatedConnection = await prisma.userConnection.update({
        where: { id: data.connectionId },
        data: { status: ConnectionStatus.CANCELED },
        include: {
          users_user_connections_initiatorIdTousers: {
            select: { id: true, fullName: true, username: true }
          },
        },
      });

      await this.updateConnectionStats(userId);

      // Notify receiver that request was canceled
      const senderName = updatedConnection.users_user_connections_initiatorIdTousers?.fullName || 
                        updatedConnection.users_user_connections_initiatorIdTousers?.username || 
                        'Someone';
      NotificationService.notifyConnectionRequestCanceled(
        connection.receiverId,
        senderName,
        userId
      ).catch(err => logger.error('Failed to send connection request canceled notification:', err));

      logger.info(`Connection request withdrawn: ${data.connectionId} by ${userId}`);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Error withdrawing connection request:', error);
      throw new AppError('Failed to withdraw connection request', 500);
    }
  }

  /**
   * Remove an existing connection
   */
  static async removeConnection(
    userId: string,
    data: RemoveConnectionInput
  ): Promise<void> {
    try {
      const connection = await prisma.userConnection.findUnique({
        where: { id: data.connectionId },
      });

      if (!connection) {
        throw new AppError('Connection not found', 404);
      }

      // Verify user is part of the connection
      if (connection.initiatorId !== userId && connection.receiverId !== userId) {
        throw new AppError('You are not part of this connection', 403);
      }

      if (connection.status !== ConnectionStatus.ACCEPTED) {
        throw new AppError('Can only remove accepted connections', 400);
      }

      // Get cooldown days from config
      const config = await prisma.vouchConfig.findFirst({
        orderBy: { createdAt: 'desc' },
      });
      const cooldownDays = config?.reconnectionCooldownDays || 30;
      const canReconnectAt = new Date();
      canReconnectAt.setDate(canReconnectAt.getDate() + cooldownDays);

      const updatedConnection = await prisma.userConnection.update({
        where: { id: data.connectionId },
        data: {
          status: ConnectionStatus.REMOVED,
          removedAt: new Date(),
          removedBy: userId,
          canReconnectAt,
        },
        include: {
          users_user_connections_initiatorIdTousers: {
            select: { id: true, fullName: true, username: true }
          },
          users_user_connections_receiverIdTousers: {
            select: { id: true, fullName: true, username: true }
          },
        },
      });

      // Update stats for both users
      await Promise.all([
        this.updateConnectionStats(connection.initiatorId),
        this.updateConnectionStats(connection.receiverId),
      ]);

      // Notify the other user about connection removal
      const otherUserId = connection.initiatorId === userId ? connection.receiverId : connection.initiatorId;
      const removerUser = connection.initiatorId === userId 
        ? updatedConnection.users_user_connections_initiatorIdTousers
        : updatedConnection.users_user_connections_receiverIdTousers;
      const removerName = removerUser?.fullName || removerUser?.username || 'Someone';
      
      NotificationService.notifyConnectionRemoved(
        otherUserId,
        removerName,
        userId
      ).catch(err => logger.error('Failed to send connection removed notification:', err));

      logger.info(`Connection removed: ${data.connectionId} by ${userId}`);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Error removing connection:', error);
      throw new AppError('Failed to remove connection', 500);
    }
  }

  /**
   * Update connection details
   */
  static async updateConnection(
    userId: string,
    data: UpdateConnectionInput
  ): Promise<ConnectionResponse> {
    try {
      const connection = await prisma.userConnection.findUnique({
        where: { id: data.connectionId },
      });

      if (!connection) {
        throw new AppError('Connection not found', 404);
      }

      // Verify user is part of the connection
      if (connection.initiatorId !== userId && connection.receiverId !== userId) {
        throw new AppError('You are not part of this connection', 403);
      }

      if (connection.status !== ConnectionStatus.ACCEPTED) {
        throw new AppError('Can only update accepted connections', 400);
      }

      const updateData: Prisma.UserConnectionUpdateInput = {};
      if (data.relationshipType !== undefined)
        updateData.relationshipType = data.relationshipType;
      if (data.relationshipCategory !== undefined)
        updateData.relationshipCategory = data.relationshipCategory;
      if (data.howWeMet !== undefined) updateData.howWeMet = data.howWeMet;
      if (data.tags !== undefined) updateData.tags = data.tags;

      const updatedConnection = await prisma.userConnection.update({
        where: { id: data.connectionId },
        data: updateData,
        include: {
          users_user_connections_initiatorIdTousers: {
            select: {
              id: true,
              fullName: true,
              username: true,
              trustScore: true,
              trustLevel: true,
              profile: { select: { profilePicture: true } },
              location: { select: { currentCity: true, countryOfResidence: true } },
            },
          },
          users_user_connections_receiverIdTousers: {
            select: {
              id: true,
              fullName: true,
              username: true,
              trustScore: true,
              trustLevel: true,
              profile: { select: { profilePicture: true } },
              location: { select: { currentCity: true, countryOfResidence: true } },
            },
          },
        },
      });

      logger.info(`Connection updated: ${data.connectionId} by ${userId}`);

      return this.formatConnectionResponse(updatedConnection, userId);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Error updating connection:', error);
      throw new AppError('Failed to update connection', 500);
    }
  }

  // ============================================================================
  // CONNECTION RETRIEVAL OPERATIONS
  // ============================================================================

  /**
   * Get user's connections with filters
   */
  static async getConnections(
    userId: string,
    query: ConnectionQuery
  ): Promise<PaginatedConnectionsResponse> {
    try {
      const page = query.page || 1;
      const limit = query.limit || 20;
      const skip = (page - 1) * limit;
      const sortBy = query.sortBy || 'createdAt';
      const sortOrder = query.sortOrder || 'desc';

      const where: Prisma.UserConnectionWhereInput = {};

      // Apply direction filter
      if (query.direction === 'sent') {
        where.initiatorId = userId;
      } else if (query.direction === 'received') {
        where.receiverId = userId;
      } else {
        // Default: both directions
        where.OR = [{ initiatorId: userId }, { receiverId: userId }];
      }

      if (query.status) {
        where.status = query.status;
      }

      if (query.relationshipCategory) {
        where.relationshipCategory = query.relationshipCategory;
      }

      if (query.search) {
        where.OR = [
          {
            users_user_connections_initiatorIdTousers: {
              OR: [
                { fullName: { contains: query.search, mode: 'insensitive' } },
                {
                  AND: [
                    { username: { contains: query.search, mode: 'insensitive' } },
                    { privacy: { searchableByUsername: true } },
                  ],
                },
              ],
            },
          },
          {
            users_user_connections_receiverIdTousers: {
              OR: [
                { fullName: { contains: query.search, mode: 'insensitive' } },
                {
                  AND: [
                    { username: { contains: query.search, mode: 'insensitive' } },
                    { privacy: { searchableByUsername: true } },
                  ],
                },
              ],
            },
          },
        ];
      }

      const [connections, totalCount, stats] = await Promise.all([
        prisma.userConnection.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
          include: {
            users_user_connections_initiatorIdTousers: {
              select: {
                id: true,
                fullName: true,
                username: true,
                trustScore: true,
                trustLevel: true,
                profile: { select: { profilePicture: true, bio: true } },
                location: { select: { currentCity: true, countryOfResidence: true } },
              },
            },
            users_user_connections_receiverIdTousers: {
              select: {
                id: true,
                fullName: true,
                username: true,
                trustScore: true,
                trustLevel: true,
                profile: { select: { profilePicture: true, bio: true } },
                location: { select: { currentCity: true, countryOfResidence: true } },
              },
            },
          },
        }),
        prisma.userConnection.count({ where }),
        this.getConnectionStats(userId),
      ]);

      return {
        connections: connections.map((conn) => this.formatConnectionResponse(conn, userId)),
        totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        stats,
      };
    } catch (error) {
      logger.error('Error getting connections:', error);
      throw new AppError('Failed to get connections', 500);
    }
  }

  /**
   * Get a single connection by ID
   */
  static async getConnectionById(
    userId: string,
    connectionId: string
  ): Promise<ConnectionResponse> {
    try {
      const connection = await prisma.userConnection.findUnique({
        where: { id: connectionId },
        include: {
          users_user_connections_initiatorIdTousers: {
            select: {
              id: true,
              fullName: true,
              username: true,
              trustScore: true,
              trustLevel: true,
              profile: { select: { profilePicture: true, bio: true } },
              location: { select: { currentCity: true, countryOfResidence: true } },
            },
          },
          users_user_connections_receiverIdTousers: {
            select: {
              id: true,
              fullName: true,
              username: true,
              trustScore: true,
              trustLevel: true,
              profile: { select: { profilePicture: true, bio: true } },
              location: { select: { currentCity: true, countryOfResidence: true } },
            },
          },
        },
      });

      if (!connection) {
        throw new AppError('Connection not found', 404);
      }

      // Verify user is part of the connection
      if (connection.initiatorId !== userId && connection.receiverId !== userId) {
        throw new AppError('You are not part of this connection', 403);
      }

      return this.formatConnectionResponse(connection, userId);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Error getting connection:', error);
      throw new AppError('Failed to get connection', 500);
    }
  }

  /**
   * Get connection stats for a user
   */
  static async getConnectionStats(userId: string): Promise<ConnectionStatsResponse> {
    try {
      let stats = await prisma.connectionStat.findUnique({
        where: { userId },
      });

      if (!stats) {
        // Create stats if they don't exist
        stats = await this.updateConnectionStats(userId);
      }

      return {
        totalConnections: stats.totalConnections,
        pendingRequests: stats.pendingRequests,
        sentRequests: stats.sentRequests,
        professionalConnections: stats.professionalConnections,
        friendConnections: stats.friendConnections,
        familyConnections: stats.familyConnections,
        mentorConnections: stats.mentorConnections,
        travelConnections: stats.travelConnections,
        communityConnections: stats.communityConnections,
        averageRating: stats.averageRating || undefined,
      };
    } catch (error) {
      logger.error('Error getting connection stats:', error);
      throw new AppError('Failed to get connection stats', 500);
    }
  }

  /**
   * Get mutual connections between two users
   */
  static async getMutualConnections(
    userId: string,
    query: MutualConnectionsQuery
  ): Promise<MutualConnectionsResponse> {
    try {
      const page = query.page || 1;
      const limit = query.limit || 20;
      const skip = (page - 1) * limit;

      // Get user's connections
      const userConnections = await prisma.userConnection.findMany({
        where: {
          OR: [{ initiatorId: userId }, { receiverId: userId }],
          status: ConnectionStatus.ACCEPTED,
        },
        select: { initiatorId: true, receiverId: true },
      });

      const userConnectionIds = userConnections.map((conn) =>
        conn.initiatorId === userId ? conn.receiverId : conn.initiatorId
      );

      // Get other user's connections
      const otherUserConnections = await prisma.userConnection.findMany({
        where: {
          OR: [{ initiatorId: query.userId }, { receiverId: query.userId }],
          status: ConnectionStatus.ACCEPTED,
        },
        select: { initiatorId: true, receiverId: true },
      });

      const otherUserConnectionIds = otherUserConnections.map((conn) =>
        conn.initiatorId === query.userId ? conn.receiverId : conn.initiatorId
      );

      // Find mutual connection IDs
      const mutualIds = userConnectionIds.filter((id) =>
        otherUserConnectionIds.includes(id)
      );

      const totalCount = mutualIds.length;
      const paginatedIds = mutualIds.slice(skip, skip + limit);

      // Get user details for mutual connections
      const users = await prisma.user.findMany({
        where: { id: { in: paginatedIds } },
        select: {
          id: true,
          fullName: true,
          username: true,
          trustScore: true,
          trustLevel: true,
          profile: { select: { profilePicture: true } },
          location: { select: { currentCity: true, countryOfResidence: true } },
        },
      });

      const mutualConnections: UserBasicInfo[] = users.map((user) => ({
        id: user.id,
        fullName: user.fullName,
        username: user.username || undefined,
        profilePicture: user.profile?.profilePicture || undefined,
        trustScore: user.trustScore,
        trustLevel: user.trustLevel,
        location: user.location
          ? {
              currentCity: user.location.currentCity || undefined,
              countryOfResidence: user.location.countryOfResidence || undefined,
            }
          : undefined,
      }));

      return {
        mutualConnections,
        totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      };
    } catch (error) {
      logger.error('Error getting mutual connections:', error);
      throw new AppError('Failed to get mutual connections', 500);
    }
  }

  /**
   * Get connection suggestions for a user
   */
  static async getConnectionSuggestions(
    userId: string,
    query: ConnectionSuggestionsQuery
  ): Promise<ConnectionSuggestionResponse[]> {
    try {
      const page = query.page || 1;
      const limit = query.limit || 10;
      const skip = (page - 1) * limit;

      // Get user's existing connections
      const existingConnections = await prisma.userConnection.findMany({
        where: {
          OR: [{ initiatorId: userId }, { receiverId: userId }],
          status: { in: [ConnectionStatus.ACCEPTED, ConnectionStatus.PENDING] },
        },
        select: { initiatorId: true, receiverId: true },
      });

      const excludeIds = [
        userId,
        ...existingConnections.map((conn) =>
          conn.initiatorId === userId ? conn.receiverId : conn.initiatorId
        ),
      ];

      // Get blocked users
      const blockedUsers = await prisma.userBlock.findMany({
        where: {
          OR: [{ blockerId: userId }, { blockedId: userId }],
        },
        select: { blockedId: true, blockerId: true },
      });

      excludeIds.push(
        ...blockedUsers.map((block) =>
          block.blockerId === userId ? block.blockedId : block.blockerId
        )
      );

      // TODO: Implement sophisticated suggestion algorithm
      // For now, return users with mutual connections or communities

      const suggestions: ConnectionSuggestionResponse[] = [];

      // Simple implementation - can be enhanced
      const potentialConnections = await prisma.user.findMany({
        where: {
          id: { notIn: excludeIds },
          status: 'ACTIVE',
          // Only suggest users with verified emails (filters out test accounts)
          security: {
            emailVerifiedAt: { not: null },
          },
          // Only suggest users with public profiles
          privacy: {
            profileVisibility: 'public',
          },
        },
        take: limit,
        skip,
        select: {
          id: true,
          fullName: true,
          username: true,
          trustScore: true,
          trustLevel: true,
          profile: { select: { profilePicture: true } },
          location: { select: { currentCity: true, countryOfResidence: true } },
        },
      });

      for (const user of potentialConnections) {
        suggestions.push({
          user: {
            id: user.id,
            fullName: user.fullName,
            username: user.username || undefined,
            profilePicture: user.profile?.profilePicture || undefined,
            trustScore: user.trustScore,
            trustLevel: user.trustLevel,
            location: user.location
              ? {
                  currentCity: user.location.currentCity || undefined,
                  countryOfResidence: user.location.countryOfResidence || undefined,
                }
              : undefined,
          },
          reason: 'Suggested based on platform activity',
          score: 0.5,
        });
      }

      return suggestions;
    } catch (error) {
      logger.error('Error getting connection suggestions:', error);
      throw new AppError('Failed to get connection suggestions', 500);
    }
  }

  // ============================================================================
  // BLOCK/UNBLOCK OPERATIONS
  // ============================================================================

  /**
   * Block a user
   */
  static async blockUser(userId: string, data: BlockUserInput): Promise<void> {
    try {
      if (userId === data.userId) {
        throw new AppError('You cannot block yourself', 400);
      }

      // Check if user exists
      const userToBlock = await prisma.user.findUnique({
        where: { id: data.userId },
      });

      if (!userToBlock) {
        throw new AppError('User not found', 404);
      }

      // Check if already blocked
      const existingBlock = await prisma.userBlock.findFirst({
        where: {
          blockerId: userId,
          blockedId: data.userId,
        },
      });

      if (existingBlock) {
        throw new AppError('User is already blocked', 400);
      }

      // Create block
      await prisma.userBlock.create({
        data: {
          blockerId: userId,
          blockedId: data.userId,
          reason: data.reason,
        },
      });

      // Remove any existing connections
      await prisma.userConnection.updateMany({
        where: {
          OR: [
            { initiatorId: userId, receiverId: data.userId },
            { initiatorId: data.userId, receiverId: userId },
          ],
          status: { not: ConnectionStatus.REMOVED },
        },
        data: {
          status: ConnectionStatus.REMOVED,
          removedAt: new Date(),
          removedBy: userId,
        },
      });

      await this.updateConnectionStats(userId);

      logger.info(`User ${userId} blocked user ${data.userId}`);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Error blocking user:', error);
      throw new AppError('Failed to block user', 500);
    }
  }

  /**
   * Unblock a user
   */
  static async unblockUser(userId: string, data: UnblockUserInput): Promise<void> {
    try {
      const block = await prisma.userBlock.findFirst({
        where: {
          blockerId: userId,
          blockedId: data.userId,
        },
      });

      if (!block) {
        throw new AppError('User is not blocked', 404);
      }

      await prisma.userBlock.delete({
        where: { id: block.id },
      });

      logger.info(`User ${userId} unblocked user ${data.userId}`);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Error unblocking user:', error);
      throw new AppError('Failed to unblock user', 500);
    }
  }

  /**
   * Get list of blocked users
   */
  static async getBlockedUsers(
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedBlockedUsersResponse> {
    try {
      const skip = (page - 1) * limit;

      const [blocks, totalCount] = await Promise.all([
        prisma.userBlock.findMany({
          where: { blockerId: userId },
          skip,
          take: limit,
          orderBy: { blockedAt: 'desc' },
          include: {
            users_user_blocks_blockedIdTousers: {
              select: {
                id: true,
                fullName: true,
                username: true,
                trustScore: true,
                trustLevel: true,
                profile: { select: { profilePicture: true } },
                location: { select: { currentCity: true, countryOfResidence: true } },
              },
            },
          },
        }),
        prisma.userBlock.count({ where: { blockerId: userId } }),
      ]);

      const blockedUsers: BlockedUserResponse[] = blocks.map((block) => ({
        id: block.id,
        blockedId: block.blockedId,
        reason: block.reason || undefined,
        createdAt: block.blockedAt.toISOString(),
        blockedUser: {
          id: block.users_user_blocks_blockedIdTousers.id,
          fullName: block.users_user_blocks_blockedIdTousers.fullName,
          username: block.users_user_blocks_blockedIdTousers.username || undefined,
          profilePicture:
            block.users_user_blocks_blockedIdTousers.profile?.profilePicture || undefined,
          trustScore: block.users_user_blocks_blockedIdTousers.trustScore,
          trustLevel: block.users_user_blocks_blockedIdTousers.trustLevel,
          location: block.users_user_blocks_blockedIdTousers.location
            ? {
                currentCity:
                  block.users_user_blocks_blockedIdTousers.location.currentCity || undefined,
                countryOfResidence:
                  block.users_user_blocks_blockedIdTousers.location.countryOfResidence ||
                  undefined,
              }
            : undefined,
        },
      }));

      return {
        blockedUsers,
        totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      };
    } catch (error) {
      logger.error('Error getting blocked users:', error);
      throw new AppError('Failed to get blocked users', 500);
    }
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  /**
   * Update connection stats for a user
   */
  private static async updateConnectionStats(userId: string) {
    try {
      const [
        totalConnections,
        pendingRequests,
        sentRequests,
        connectionsByCategory,
      ] = await Promise.all([
        prisma.userConnection.count({
          where: {
            OR: [{ initiatorId: userId }, { receiverId: userId }],
            status: ConnectionStatus.ACCEPTED,
          },
        }),
        prisma.userConnection.count({
          where: {
            receiverId: userId,
            status: ConnectionStatus.PENDING,
          },
        }),
        prisma.userConnection.count({
          where: {
            initiatorId: userId,
            status: ConnectionStatus.PENDING,
          },
        }),
        prisma.userConnection.groupBy({
          by: ['relationshipCategory'],
          where: {
            OR: [{ initiatorId: userId }, { receiverId: userId }],
            status: ConnectionStatus.ACCEPTED,
          },
          _count: true,
        }),
      ]);

      const categoryCounts: any = {
        professionalConnections: 0,
        friendConnections: 0,
        familyConnections: 0,
        mentorConnections: 0,
        travelConnections: 0,
        communityConnections: 0,
      };

      connectionsByCategory.forEach((item) => {
        if (item.relationshipCategory === 'professional') {
          categoryCounts.professionalConnections = item._count;
        } else if (item.relationshipCategory === 'friend') {
          categoryCounts.friendConnections = item._count;
        } else if (item.relationshipCategory === 'family') {
          categoryCounts.familyConnections = item._count;
        } else if (item.relationshipCategory === 'mentor') {
          categoryCounts.mentorConnections = item._count;
        } else if (item.relationshipCategory === 'travel') {
          categoryCounts.travelConnections = item._count;
        } else if (item.relationshipCategory === 'community') {
          categoryCounts.communityConnections = item._count;
        }
      });

      return await prisma.connectionStat.upsert({
        where: { userId },
        create: {
          userId,
          totalConnections,
          pendingRequests,
          sentRequests,
          ...categoryCounts,
        },
        update: {
          totalConnections,
          pendingRequests,
          sentRequests,
          ...categoryCounts,
          lastCalculatedAt: new Date(),
        },
      });
    } catch (error) {
      logger.error('Error updating connection stats:', error);
      throw error;
    }
  }

  /**
   * Calculate mutual connections for a connection
   */
  private static async calculateMutualConnections(connectionId: string) {
    try {
      const connection = await prisma.userConnection.findUnique({
        where: { id: connectionId },
      });

      if (!connection) return;

      // Get connections for both users
      const [initiatorConnections, receiverConnections] = await Promise.all([
        prisma.userConnection.findMany({
          where: {
            OR: [
              { initiatorId: connection.initiatorId },
              { receiverId: connection.initiatorId },
            ],
            status: ConnectionStatus.ACCEPTED,
          },
          select: { initiatorId: true, receiverId: true },
        }),
        prisma.userConnection.findMany({
          where: {
            OR: [
              { initiatorId: connection.receiverId },
              { receiverId: connection.receiverId },
            ],
            status: ConnectionStatus.ACCEPTED,
          },
          select: { initiatorId: true, receiverId: true },
        }),
      ]);

      const initiatorConnectionIds = initiatorConnections.map((conn) =>
        conn.initiatorId === connection.initiatorId
          ? conn.receiverId
          : conn.initiatorId
      );

      const receiverConnectionIds = receiverConnections.map((conn) =>
        conn.initiatorId === connection.receiverId
          ? conn.receiverId
          : conn.initiatorId
      );

      const mutualFriendsCount = initiatorConnectionIds.filter((id) =>
        receiverConnectionIds.includes(id)
      ).length;

      // Get mutual communities
      const [initiatorCommunities, receiverCommunities] = await Promise.all([
        prisma.communityMember.findMany({
          where: { userId: connection.initiatorId },
          select: { communityId: true },
        }),
        prisma.communityMember.findMany({
          where: { userId: connection.receiverId },
          select: { communityId: true },
        }),
      ]);

      const mutualCommunitiesCount = initiatorCommunities.filter((ic) =>
        receiverCommunities.some((rc) => rc.communityId === ic.communityId)
      ).length;

      // Update connection with mutual counts
      await prisma.userConnection.update({
        where: { id: connectionId },
        data: {
          mutualFriendsCount,
          mutualCommunitiesCount,
        },
      });
    } catch (error) {
      logger.error('Error calculating mutual connections:', error);
    }
  }

  // ============================================================================
  // ACTIVITY DISCOVERY
  // ============================================================================

  /**
   * Get recent activities from user's connections or public feed
   * Shows what people are doing (events, trips, communities, etc.)
   */
  static async getRecentActivities(
    userId: string,
    options: {
      limit?: number;
      activityTypes?: string[];
      offset?: number;
      scope?: 'connections' | 'public' | 'community' | 'nearby';
    } = {}
  ): Promise<{
    activities: any[];
    totalCount: number;
    hasMore: boolean;
  }> {
    try {
      const { limit = 20, activityTypes, offset = 0, scope = 'public' } = options;

      let targetUserIds: string[] | undefined;

      // Determine which users' activities to show based on scope
      if (scope === 'connections') {
        // Only show activities from accepted connections
        const connections = await prisma.userConnection.findMany({
          where: {
            OR: [
              { initiatorId: userId, status: ConnectionStatus.ACCEPTED },
              { receiverId: userId, status: ConnectionStatus.ACCEPTED },
            ],
          },
          select: {
            initiatorId: true,
            receiverId: true,
          },
        });

        targetUserIds = connections.map((conn) =>
          conn.initiatorId === userId ? conn.receiverId : conn.initiatorId
        );

        if (targetUserIds.length === 0) {
          return {
            activities: [],
            totalCount: 0,
            hasMore: false,
          };
        }
      } else if (scope === 'community') {
        // Show activities from users in the same communities
        const userCommunities = await prisma.communityMember.findMany({
          where: { userId },
          select: { communityId: true },
        });

        const communityIds = userCommunities.map((cm) => cm.communityId);

        if (communityIds.length > 0) {
          const communityMembers = await prisma.communityMember.findMany({
            where: {
              communityId: { in: communityIds },
              userId: { not: userId }, // Exclude self
            },
            select: { userId: true },
          });

          targetUserIds = [...new Set(communityMembers.map((cm) => cm.userId))];
        } else {
          targetUserIds = [];
        }

        if (targetUserIds.length === 0) {
          return {
            activities: [],
            totalCount: 0,
            hasMore: false,
          };
        }
      } else if (scope === 'nearby') {
        // Show activities from users in the same city
        const currentUser = await prisma.user.findUnique({
          where: { id: userId },
          select: {
            location: {
              select: {
                currentCity: true,
              },
            },
          },
        });

        if (currentUser?.location?.currentCity) {
          const nearbyUsers = await prisma.userLocation.findMany({
            where: {
              currentCity: currentUser.location.currentCity,
              userId: { not: userId }, // Exclude self
            },
            select: { userId: true },
            take: 500, // Limit to prevent massive queries
          });

          targetUserIds = nearbyUsers.map((u) => u.userId);
        } else {
          targetUserIds = [];
        }

        if (targetUserIds.length === 0) {
          return {
            activities: [],
            totalCount: 0,
            hasMore: false,
          };
        }
      }
      // For 'public' scope, targetUserIds remains undefined (show all users)

      // Build activity filter
      const activityWhere: any = {
        visibility: 'public',
        userId: { not: userId }, // Exclude own activities
      };

      // Apply user filter based on scope
      if (targetUserIds !== undefined) {
        activityWhere.userId = { in: targetUserIds, not: userId };
      }

      if (activityTypes && activityTypes.length > 0) {
        activityWhere.activityType = { in: activityTypes };
      }

      // Get total count
      const totalCount = await prisma.userActivity.count({
        where: activityWhere,
      });

      // Fetch activities
      const activities = await prisma.userActivity.findMany({
        where: activityWhere,
        include: {
          users: {
            select: {
              id: true,
              fullName: true,
              username: true,
              profile: {
                select: {
                  profilePicture: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      });

      // Enrich activities with entity details
      const enrichedActivities = await Promise.all(
        activities.map(async (activity) => {
          let entityDetails = null;

          try {
            // Fetch entity details based on type
            switch (activity.entityType) {
              case 'event':
                entityDetails = await prisma.event.findUnique({
                  where: { id: activity.entityId },
                  select: {
                    id: true,
                    title: true,
                    date: true,
                    location: true,
                    type: true,
                    images: true,
                  },
                });
                break;

              case 'community':
                entityDetails = await prisma.community.findUnique({
                  where: { id: activity.entityId },
                  select: {
                    id: true,
                    name: true,
                    description: true,
                    logoUrl: true,
                    coverImageUrl: true,
                    interests: true,
                  },
                });
                break;

              case 'trip':
                entityDetails = await prisma.travelTrip.findUnique({
                  where: { id: activity.entityId },
                  select: {
                    id: true,
                    title: true,
                    cities: true,
                    countries: true,
                    startDate: true,
                    endDate: true,
                    coverImage: true,
                  },
                });
                break;

              case 'berseguide_session':
                entityDetails = await prisma.berseGuideBooking.findUnique({
                  where: { id: activity.entityId },
                  select: {
                    id: true,
                    preferredDate: true,
                    agreedDate: true,
                    numberOfPeople: true,
                    status: true,
                  },
                });
                break;

              case 'homesurf_stay':
                entityDetails = await prisma.homeSurfBooking.findUnique({
                  where: { id: activity.entityId },
                  select: {
                    id: true,
                    checkInDate: true,
                    checkOutDate: true,
                    status: true,
                  },
                });
                break;

              case 'marketplace_listing':
                entityDetails = await prisma.marketplaceListing.findUnique({
                  where: { id: activity.entityId },
                  select: {
                    id: true,
                    title: true,
                    images: true,
                    category: true,
                    pricingOptions: {
                      select: {
                        price: true,
                        currency: true,
                        pricingType: true,
                      },
                      take: 1,
                    },
                  },
                });
                break;
            }
          } catch (error) {
            logger.error(`Error fetching entity details for ${activity.entityType}:`, error);
          }

          return {
            id: activity.id,
            activityType: activity.activityType,
            entityType: activity.entityType,
            entityId: activity.entityId,
            entityDetails,
            createdAt: activity.createdAt.toISOString(),
            user: {
              id: activity.users.id,
              fullName: activity.users.fullName,
              username: activity.users.username,
              profilePicture: activity.users.profile?.profilePicture,
            },
          };
        })
      );

      return {
        activities: enrichedActivities,
        totalCount,
        hasMore: offset + limit < totalCount,
      };
    } catch (error) {
      logger.error('Error fetching recent activities:', error);
      throw new AppError('Failed to fetch recent activities', 500);
    }
  }

  /**
   * Format connection response
   */
  private static formatConnectionResponse(connection: any, currentUserId: string): ConnectionResponse {
    const isInitiator = connection.initiatorId === currentUserId;
    const otherUser = isInitiator
      ? connection.users_user_connections_receiverIdTousers
      : connection.users_user_connections_initiatorIdTousers;

    return {
      id: connection.id,
      initiatorId: connection.initiatorId,
      receiverId: connection.receiverId,
      status: connection.status,
      message: connection.message || null,
      relationshipType: connection.relationshipType || null,
      relationshipCategory: connection.relationshipCategory || null,
      howWeMet: connection.howWeMet || null,
      mutualFriendsCount: connection.mutualFriendsCount,
      mutualCommunitiesCount: connection.mutualCommunitiesCount,
      createdAt: connection.createdAt.toISOString(),
      respondedAt: connection.respondedAt?.toISOString() || null,
      connectedAt: connection.connectedAt?.toISOString() || null,
      removedAt: connection.removedAt?.toISOString() || null,
      removedBy: connection.removedBy || null,
      canReconnectAt: connection.canReconnectAt?.toISOString() || null,
      otherUser: {
        id: otherUser.id,
        fullName: otherUser.fullName,
        username: otherUser.username || undefined,
        profilePicture: otherUser.profile?.profilePicture || undefined,
        bio: otherUser.profile?.bio || undefined,
        trustScore: otherUser.trustScore,
        trustLevel: otherUser.trustLevel,
        location: otherUser.location
          ? {
              currentCity: otherUser.location.currentCity || undefined,
              countryOfResidence: otherUser.location.countryOfResidence || undefined,
            }
          : undefined,
      },
      isInitiator,
    };
  }
}
