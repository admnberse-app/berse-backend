import { prisma } from '../../../config/database';
import { AppError } from '../../../middleware/error';
import { TrustScoreService } from '../trust';
import { ConnectionStatus } from '@prisma/client';
import logger from '../../../utils/logger';
import {
  CreateTrustMomentInput,
  UpdateTrustMomentInput,
  TrustMomentQuery,
  TrustMomentResponse,
  PaginatedTrustMomentsResponse,
  TrustMomentStats,
} from './trust-moment.types';

/**
 * Trust Moment Service
 * Manages event-specific feedback and trust moments between connections
 */
export class TrustMomentService {
  
  /**
   * Format trust moment response with relations
   */
  private static formatTrustMomentResponse(moment: any): TrustMomentResponse {
    return {
      id: moment.id,
      connectionId: moment.connectionId,
      giverId: moment.giverId,
      receiverId: moment.receiverId,
      eventId: moment.eventId || undefined,
      momentType: moment.momentType,
      rating: moment.rating,
      feedback: moment.feedback || undefined,
      experienceDescription: moment.experienceDescription || undefined,
      tags: moment.tags,
      isPublic: moment.isPublic,
      isVerified: moment.isVerified,
      verificationSource: moment.verificationSource || undefined,
      trustImpact: moment.trustImpact,
      createdAt: moment.createdAt.toISOString(),
      updatedAt: moment.updatedAt.toISOString(),
      giver: moment.giver ? {
        id: moment.giver.id,
        fullName: moment.giver.fullName,
        username: moment.giver.username || undefined,
        profilePicture: moment.giver.profile?.profilePicture || undefined,
        trustScore: moment.giver.trustScore,
        trustLevel: moment.giver.trustLevel,
      } : undefined,
      receiver: moment.receiver ? {
        id: moment.receiver.id,
        fullName: moment.receiver.fullName,
        username: moment.receiver.username || undefined,
        profilePicture: moment.receiver.profile?.profilePicture || undefined,
        trustScore: moment.receiver.trustScore,
        trustLevel: moment.receiver.trustLevel,
      } : undefined,
      event: moment.event ? {
        id: moment.event.id,
        title: moment.event.title,
        type: moment.event.type,
        date: moment.event.date.toISOString(),
        location: moment.event.location,
      } : undefined,
    };
  }

  /**
   * Calculate trust impact based on rating
   * Positive ratings increase score, negative ratings decrease
   */
  private static calculateTrustImpact(rating: number): number {
    // Rating 1-2: Negative impact (-5 to -2.5 points)
    // Rating 3: Neutral (0 points)
    // Rating 4-5: Positive impact (+2.5 to +5 points)
    if (rating <= 2) {
      return -5 + (rating - 1) * 2.5;
    } else if (rating === 3) {
      return 0;
    } else {
      return 2.5 + (rating - 4) * 2.5;
    }
  }

  /**
   * Create a trust moment (feedback after shared experience)
   */
  static async createTrustMoment(
    giverId: string,
    data: CreateTrustMomentInput
  ): Promise<TrustMomentResponse> {
    try {
      const { connectionId, receiverId, eventId, momentType, rating, feedback, experienceDescription, tags, isPublic } = data;

      // 1. Validate giver is not receiver
      if (giverId === receiverId) {
        throw new AppError('You cannot create a trust moment for yourself', 400);
      }

      // 2. Validate connection exists and is accepted
      const connection = await prisma.userConnection.findUnique({
        where: { id: connectionId },
      });

      if (!connection) {
        throw new AppError('Connection not found', 404);
      }

      if (connection.status !== ConnectionStatus.ACCEPTED) {
        throw new AppError('You can only create trust moments for accepted connections', 400);
      }

      // Validate giver is part of this connection
      if (connection.initiatorId !== giverId && connection.receiverId !== giverId) {
        throw new AppError('You are not part of this connection', 403);
      }

      // Validate receiver is part of this connection
      if (connection.initiatorId !== receiverId && connection.receiverId !== receiverId) {
        throw new AppError('Receiver is not part of this connection', 400);
      }

      // 3. If eventId provided, validate event participation
      if (eventId) {
        const [giverParticipant, receiverParticipant] = await Promise.all([
          prisma.eventParticipant.findFirst({
            where: { userId: giverId, eventId, checkedInAt: { not: null } },
          }),
          prisma.eventParticipant.findFirst({
            where: { userId: receiverId, eventId, checkedInAt: { not: null } },
          }),
        ]);

        if (!giverParticipant || !receiverParticipant) {
          throw new AppError('Both users must have attended the event to leave event-based feedback', 400);
        }
      }

      // 4. Check for duplicate trust moment (same connection, giver, and event)
      if (eventId) {
        const existingMoment = await prisma.trustMoment.findUnique({
          where: {
            connectionId_giverId_eventId: {
              connectionId,
              giverId,
              eventId,
            },
          },
        });

        if (existingMoment) {
          throw new AppError('You have already left feedback for this event with this connection', 409);
        }
      }

      // 5. Validate rating
      if (rating < 1 || rating > 5) {
        throw new AppError('Rating must be between 1 and 5', 400);
      }

      // 6. Calculate trust impact
      const trustImpact = this.calculateTrustImpact(rating);

      // 7. Create trust moment
      const moment = await prisma.trustMoment.create({
        data: {
          connectionId,
          giverId,
          receiverId,
          eventId: eventId || null,
          momentType: momentType || 'general',
          rating,
          feedback: feedback || null,
          experienceDescription: experienceDescription || null,
          tags: tags || [],
          isPublic: isPublic !== undefined ? isPublic : true,
          trustImpact,
        },
        include: {
          giver: {
            include: {
              profile: {
                select: { profilePicture: true },
              },
            },
          },
          receiver: {
            include: {
              profile: {
                select: { profilePicture: true },
              },
            },
          },
          event: true,
        },
      });

      logger.info(`Trust moment created: ${moment.id} from ${giverId} to ${receiverId}`);

      // 8. Trigger async trust score update for receiver
      TrustScoreService.triggerTrustScoreUpdate(
        receiverId,
        `Trust moment received from ${moment.giver.fullName}`
      ).catch(error => logger.error('Failed to update trust score:', error));

      return this.formatTrustMomentResponse(moment);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Error creating trust moment:', error);
      throw new AppError('Failed to create trust moment', 500);
    }
  }

  /**
   * Get a single trust moment by ID
   */
  static async getTrustMoment(userId: string, momentId: string): Promise<TrustMomentResponse> {
    try {
      const moment = await prisma.trustMoment.findUnique({
        where: { id: momentId },
        include: {
          giver: {
            include: {
              profile: {
                select: { profilePicture: true },
              },
            },
          },
          receiver: {
            include: {
              profile: {
                select: { profilePicture: true },
              },
            },
          },
          event: true,
        },
      });

      if (!moment) {
        throw new AppError('Trust moment not found', 404);
      }

      // Check visibility
      if (!moment.isPublic && moment.giverId !== userId && moment.receiverId !== userId) {
        throw new AppError('You do not have permission to view this trust moment', 403);
      }

      return this.formatTrustMomentResponse(moment);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Error getting trust moment:', error);
      throw new AppError('Failed to get trust moment', 500);
    }
  }

  /**
   * Update trust moment
   */
  static async updateTrustMoment(
    userId: string,
    momentId: string,
    data: UpdateTrustMomentInput
  ): Promise<TrustMomentResponse> {
    try {
      // 1. Find existing moment
      const existingMoment = await prisma.trustMoment.findUnique({
        where: { id: momentId },
      });

      if (!existingMoment) {
        throw new AppError('Trust moment not found', 404);
      }

      // 2. Verify user is the giver
      if (existingMoment.giverId !== userId) {
        throw new AppError('Only the feedback giver can update this trust moment', 403);
      }

      // 3. Validate rating if provided
      if (data.rating !== undefined && (data.rating < 1 || data.rating > 5)) {
        throw new AppError('Rating must be between 1 and 5', 400);
      }

      // 4. Recalculate trust impact if rating changed
      let trustImpact = existingMoment.trustImpact;
      if (data.rating !== undefined && data.rating !== existingMoment.rating) {
        trustImpact = this.calculateTrustImpact(data.rating);
      }

      // 5. Update trust moment
      const updatedMoment = await prisma.trustMoment.update({
        where: { id: momentId },
        data: {
          rating: data.rating,
          feedback: data.feedback !== undefined ? data.feedback : undefined,
          experienceDescription: data.experienceDescription !== undefined ? data.experienceDescription : undefined,
          tags: data.tags !== undefined ? data.tags : undefined,
          isPublic: data.isPublic !== undefined ? data.isPublic : undefined,
          trustImpact,
        },
        include: {
          giver: {
            include: {
              profile: {
                select: { profilePicture: true },
              },
            },
          },
          receiver: {
            include: {
              profile: {
                select: { profilePicture: true },
              },
            },
          },
          event: true,
        },
      });

      logger.info(`Trust moment updated: ${momentId}`);

      // 6. Trigger async trust score update if rating changed
      if (data.rating !== undefined && data.rating !== existingMoment.rating) {
        TrustScoreService.triggerTrustScoreUpdate(
          existingMoment.receiverId,
          'Trust moment rating updated'
        ).catch(error => logger.error('Failed to update trust score:', error));
      }

      return this.formatTrustMomentResponse(updatedMoment);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Error updating trust moment:', error);
      throw new AppError('Failed to update trust moment', 500);
    }
  }

  /**
   * Delete trust moment
   */
  static async deleteTrustMoment(userId: string, momentId: string): Promise<void> {
    try {
      // 1. Find existing moment
      const existingMoment = await prisma.trustMoment.findUnique({
        where: { id: momentId },
      });

      if (!existingMoment) {
        throw new AppError('Trust moment not found', 404);
      }

      // 2. Verify user is the giver
      if (existingMoment.giverId !== userId) {
        throw new AppError('Only the feedback giver can delete this trust moment', 403);
      }

      // 3. Delete trust moment
      await prisma.trustMoment.delete({
        where: { id: momentId },
      });

      logger.info(`Trust moment deleted: ${momentId}`);

      // 4. Trigger async trust score update
      TrustScoreService.triggerTrustScoreUpdate(
        existingMoment.receiverId,
        'Trust moment deleted'
      ).catch(error => logger.error('Failed to update trust score:', error));
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Error deleting trust moment:', error);
      throw new AppError('Failed to delete trust moment', 500);
    }
  }

  /**
   * Get trust moments received by user (paginated)
   */
  static async getTrustMomentsReceived(
    userId: string,
    query: TrustMomentQuery
  ): Promise<PaginatedTrustMomentsResponse> {
    try {
      const {
        page = 1,
        limit = 20,
        momentType,
        eventId,
        minRating,
        maxRating,
        isPublic,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = query;

      const skip = (page - 1) * limit;

      // Build where clause
      const where: any = {
        receiverId: userId,
      };

      if (momentType) where.momentType = momentType;
      if (eventId) where.eventId = eventId;
      if (isPublic !== undefined) where.isPublic = isPublic;
      if (minRating !== undefined || maxRating !== undefined) {
        where.rating = {};
        if (minRating !== undefined) where.rating.gte = minRating;
        if (maxRating !== undefined) where.rating.lte = maxRating;
      }

      // Execute queries
      const [moments, total] = await Promise.all([
        prisma.trustMoment.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
          include: {
            giver: {
              include: {
                profile: {
                  select: { profilePicture: true },
                },
              },
            },
            receiver: {
              include: {
                profile: {
                  select: { profilePicture: true },
                },
              },
            },
            event: true,
          },
        }),
        prisma.trustMoment.count({ where }),
      ]);

      return {
        moments: moments.map(m => this.formatTrustMomentResponse(m)),
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Error getting trust moments received:', error);
      throw new AppError('Failed to get trust moments received', 500);
    }
  }

  /**
   * Get trust moments given by user (paginated)
   */
  static async getTrustMomentsGiven(
    userId: string,
    query: TrustMomentQuery
  ): Promise<PaginatedTrustMomentsResponse> {
    try {
      const {
        page = 1,
        limit = 20,
        momentType,
        eventId,
        minRating,
        maxRating,
        isPublic,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = query;

      const skip = (page - 1) * limit;

      // Build where clause
      const where: any = {
        giverId: userId,
      };

      if (momentType) where.momentType = momentType;
      if (eventId) where.eventId = eventId;
      if (isPublic !== undefined) where.isPublic = isPublic;
      if (minRating !== undefined || maxRating !== undefined) {
        where.rating = {};
        if (minRating !== undefined) where.rating.gte = minRating;
        if (maxRating !== undefined) where.rating.lte = maxRating;
      }

      // Execute queries
      const [moments, total] = await Promise.all([
        prisma.trustMoment.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
          include: {
            giver: {
              include: {
                profile: {
                  select: { profilePicture: true },
                },
              },
            },
            receiver: {
              include: {
                profile: {
                  select: { profilePicture: true },
                },
              },
            },
            event: true,
          },
        }),
        prisma.trustMoment.count({ where }),
      ]);

      return {
        moments: moments.map(m => this.formatTrustMomentResponse(m)),
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Error getting trust moments given:', error);
      throw new AppError('Failed to get trust moments given', 500);
    }
  }

  /**
   * Get trust moments for a specific event
   */
  static async getTrustMomentsForEvent(
    userId: string,
    eventId: string,
    query: TrustMomentQuery
  ): Promise<PaginatedTrustMomentsResponse> {
    try {
      const {
        page = 1,
        limit = 20,
        minRating,
        maxRating,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = query;

      const skip = (page - 1) * limit;

      // Build where clause
      const where: any = {
        eventId,
        isPublic: true, // Only show public trust moments for events
      };

      if (minRating !== undefined || maxRating !== undefined) {
        where.rating = {};
        if (minRating !== undefined) where.rating.gte = minRating;
        if (maxRating !== undefined) where.rating.lte = maxRating;
      }

      // Execute queries
      const [moments, total] = await Promise.all([
        prisma.trustMoment.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
          include: {
            giver: {
              include: {
                profile: {
                  select: { profilePicture: true },
                },
              },
            },
            receiver: {
              include: {
                profile: {
                  select: { profilePicture: true },
                },
              },
            },
            event: true,
          },
        }),
        prisma.trustMoment.count({ where }),
      ]);

      return {
        moments: moments.map(m => this.formatTrustMomentResponse(m)),
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Error getting trust moments for event:', error);
      throw new AppError('Failed to get trust moments for event', 500);
    }
  }

  /**
   * Calculate trust moment statistics for user
   */
  static async getTrustMomentStats(userId: string): Promise<TrustMomentStats> {
    try {
      // Get all received moments
      const received = await prisma.trustMoment.findMany({
        where: { receiverId: userId },
        include: {
          giver: {
            include: {
              profile: {
                select: { profilePicture: true },
              },
            },
          },
          event: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      // Get all given moments
      const given = await prisma.trustMoment.findMany({
        where: { giverId: userId },
      });

      // Calculate received statistics
      const totalReceived = received.length;
      const averageRatingReceived = totalReceived > 0
        ? received.reduce((sum, m) => sum + m.rating, 0) / totalReceived
        : 0;

      // Rating distribution
      const ratingDistribution = {
        oneStar: received.filter(m => m.rating === 1).length,
        twoStar: received.filter(m => m.rating === 2).length,
        threeStar: received.filter(m => m.rating === 3).length,
        fourStar: received.filter(m => m.rating === 4).length,
        fiveStar: received.filter(m => m.rating === 5).length,
      };

      // By moment type
      const byMomentTypeReceived: Record<string, number> = {};
      received.forEach(m => {
        byMomentTypeReceived[m.momentType] = (byMomentTypeReceived[m.momentType] || 0) + 1;
      });

      // Top tags
      const tagCounts: Record<string, number> = {};
      received.forEach(m => {
        m.tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      });
      const topTags = Object.entries(tagCounts)
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Positive/Neutral/Negative counts
      const positiveCount = received.filter(m => m.rating >= 4).length;
      const neutralCount = received.filter(m => m.rating === 3).length;
      const negativeCount = received.filter(m => m.rating <= 2).length;

      // Recent moments
      const recentMoments = received.slice(0, 5).map(m => this.formatTrustMomentResponse(m));

      // Given statistics
      const totalGiven = given.length;
      const averageRatingGiven = totalGiven > 0
        ? given.reduce((sum, m) => sum + m.rating, 0) / totalGiven
        : 0;

      const byMomentTypeGiven: Record<string, number> = {};
      given.forEach(m => {
        byMomentTypeGiven[m.momentType] = (byMomentTypeGiven[m.momentType] || 0) + 1;
      });

      // Trust impact
      const totalTrustImpact = received.reduce((sum, m) => sum + m.trustImpact, 0);
      const fromPositive = received.filter(m => m.rating >= 4).reduce((sum, m) => sum + m.trustImpact, 0);
      const fromNeutral = received.filter(m => m.rating === 3).reduce((sum, m) => sum + m.trustImpact, 0);
      const fromNegative = received.filter(m => m.rating <= 2).reduce((sum, m) => sum + m.trustImpact, 0);

      return {
        received: {
          total: totalReceived,
          averageRating: Math.round(averageRatingReceived * 100) / 100,
          ratingDistribution,
          byMomentType: byMomentTypeReceived,
          topTags,
          positiveCount,
          neutralCount,
          negativeCount,
          recentMoments,
        },
        given: {
          total: totalGiven,
          averageRating: Math.round(averageRatingGiven * 100) / 100,
          byMomentType: byMomentTypeGiven,
        },
        trustImpact: {
          total: Math.round(totalTrustImpact * 100) / 100,
          fromPositive: Math.round(fromPositive * 100) / 100,
          fromNeutral: Math.round(fromNeutral * 100) / 100,
          fromNegative: Math.round(fromNegative * 100) / 100,
        },
      };
    } catch (error) {
      logger.error('Error getting trust moment stats:', error);
      throw new AppError('Failed to get trust moment statistics', 500);
    }
  }
}
