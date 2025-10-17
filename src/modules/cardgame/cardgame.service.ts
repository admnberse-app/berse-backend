import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error';
import { 
  SubmitFeedbackRequest,
  UpdateFeedbackRequest,
  AddReplyRequest,
  FeedbackQuery,
  FeedbackResponse,
  ReplyResponse,
  StatsResponse,
  TopicAnalyticsResponse,
  UserStatsResponse,
  PaginatedFeedbackResponse
} from './cardgame.types';
import logger from '../../utils/logger';
import { Prisma } from '@prisma/client';

export class CardGameService {
  
  // ============================================================================
  // FEEDBACK OPERATIONS
  // ============================================================================
  
  /**
   * Submit feedback for a card game question
   */
  static async submitFeedback(
    userId: string, 
    data: SubmitFeedbackRequest
  ): Promise<FeedbackResponse> {
    // Validate rating
    if (data.rating < 1 || data.rating > 5) {
      throw new AppError('Rating must be between 1 and 5', 400);
    }

    // Create feedback
    const feedback = await prisma.cardGameFeedback.create({
      data: {
        userId,
        topicId: data.topicId,
        sessionNumber: data.sessionNumber,
        questionId: data.questionId,
        rating: data.rating,
        comment: data.comment || null,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            profile: {
              select: {
                profilePicture: true,
              },
            },
          },
        },
        _count: {
          select: {
            cardGameUpvotes: true,
            cardGameReplies: true,
          },
        },
      },
    });

    // Update topic statistics asynchronously
    this.updateTopicStats(data.topicId).catch((err) => {
      logger.error(`Error updating topic stats for ${data.topicId}:`, err);
    });

    return this.formatFeedback(feedback);
  }

  /**
   * Get all feedback with filters and pagination
   */
  static async getFeedback(
    query: FeedbackQuery,
    currentUserId?: string
  ): Promise<PaginatedFeedbackResponse> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.CardGameFeedbackWhereInput = {};
    
    if (query.filters) {
      if (query.filters.topicId) where.topicId = query.filters.topicId;
      if (query.filters.userId) where.userId = query.filters.userId;
      if (query.filters.sessionNumber) where.sessionNumber = query.filters.sessionNumber;
      if (query.filters.questionId) where.questionId = query.filters.questionId;
      
      if (query.filters.minRating) {
        where.rating = { ...where.rating as any, gte: query.filters.minRating };
      }
      if (query.filters.maxRating) {
        where.rating = { ...where.rating as any, lte: query.filters.maxRating };
      }
      
      if (query.filters.hasComments !== undefined) {
        where.comment = query.filters.hasComments ? { not: null } : null;
      }
      
      if (query.filters.startDate || query.filters.endDate) {
        where.createdAt = {};
        if (query.filters.startDate) {
          where.createdAt.gte = new Date(query.filters.startDate);
        }
        if (query.filters.endDate) {
          where.createdAt.lte = new Date(query.filters.endDate);
        }
      }
    }

    // Build orderBy clause
    const orderBy: Prisma.CardGameFeedbackOrderByWithRelationInput = {};
    if (query.sortBy === 'upvotes') {
      orderBy.cardGameUpvotes = { _count: query.sortOrder || 'desc' };
    } else {
      orderBy[query.sortBy || 'createdAt'] = query.sortOrder || 'desc';
    }

    // Get feedback
    const [feedbackList, total] = await Promise.all([
      prisma.cardGameFeedback.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              profile: {
                select: {
                  profilePicture: true,
                },
              },
            },
          },
          cardGameUpvotes: currentUserId
            ? {
                where: { userId: currentUserId },
                select: { userId: true },
              }
            : false,
          cardGameReplies: {
            include: {
              user: {
                select: {
                  id: true,
                  fullName: true,
                  profile: {
                    select: {
                      profilePicture: true,
                    },
                  },
                },
              },
            },
            orderBy: { createdAt: 'asc' },
          },
          _count: {
            select: {
              cardGameUpvotes: true,
              cardGameReplies: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.cardGameFeedback.count({ where }),
    ]);

    const formattedFeedback = feedbackList.map((feedback) =>
      this.formatFeedback(feedback, currentUserId)
    );

    return {
      data: formattedFeedback,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Get feedback by ID
   */
  static async getFeedbackById(
    feedbackId: string,
    currentUserId?: string
  ): Promise<FeedbackResponse> {
    const feedback = await prisma.cardGameFeedback.findUnique({
      where: { id: feedbackId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            profile: {
              select: {
                profilePicture: true,
              },
            },
          },
        },
        cardGameUpvotes: currentUserId
          ? {
              where: { userId: currentUserId },
              select: { userId: true },
            }
          : true,
        cardGameReplies: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                profile: {
                  select: {
                    profilePicture: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        _count: {
          select: {
            cardGameUpvotes: true,
            cardGameReplies: true,
          },
        },
      },
    });

    if (!feedback) {
      throw new AppError('Feedback not found', 404);
    }

    return this.formatFeedback(feedback, currentUserId);
  }

  /**
   * Update feedback
   */
  static async updateFeedback(
    feedbackId: string,
    userId: string,
    data: UpdateFeedbackRequest
  ): Promise<FeedbackResponse> {
    // Check ownership
    const existing = await prisma.cardGameFeedback.findUnique({
      where: { id: feedbackId },
    });

    if (!existing) {
      throw new AppError('Feedback not found', 404);
    }

    if (existing.userId !== userId) {
      throw new AppError('You can only update your own feedback', 403);
    }

    // Validate rating if provided
    if (data.rating && (data.rating < 1 || data.rating > 5)) {
      throw new AppError('Rating must be between 1 and 5', 400);
    }

    // Update feedback
    const updated = await prisma.cardGameFeedback.update({
      where: { id: feedbackId },
      data: {
        rating: data.rating,
        comment: data.comment,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            profile: {
              select: {
                profilePicture: true,
              },
            },
          },
        },
        _count: {
          select: {
            cardGameUpvotes: true,
            cardGameReplies: true,
          },
        },
      },
    });

    // Update topic statistics
    this.updateTopicStats(existing.topicId).catch((err) => {
      logger.error(`Error updating topic stats:`, err);
    });

    return this.formatFeedback(updated);
  }

  /**
   * Delete feedback
   */
  static async deleteFeedback(feedbackId: string, userId: string): Promise<void> {
    const feedback = await prisma.cardGameFeedback.findUnique({
      where: { id: feedbackId },
    });

    if (!feedback) {
      throw new AppError('Feedback not found', 404);
    }

    if (feedback.userId !== userId) {
      throw new AppError('You can only delete your own feedback', 403);
    }

    await prisma.cardGameFeedback.delete({
      where: { id: feedbackId },
    });

    // Update topic statistics
    this.updateTopicStats(feedback.topicId).catch((err) => {
      logger.error(`Error updating topic stats:`, err);
    });
  }

  // ============================================================================
  // UPVOTE OPERATIONS
  // ============================================================================

  /**
   * Toggle upvote on feedback
   */
  static async toggleUpvote(
    feedbackId: string,
    userId: string
  ): Promise<{ hasUpvoted: boolean; upvoteCount: number }> {
    // Check if feedback exists
    const feedback = await prisma.cardGameFeedback.findUnique({
      where: { id: feedbackId },
    });

    if (!feedback) {
      throw new AppError('Feedback not found', 404);
    }

    // Check if user already upvoted
    const existingUpvote = await prisma.cardGameUpvote.findUnique({
      where: {
        userId_feedbackId: {
          userId,
          feedbackId,
        },
      },
    });

    let hasUpvoted: boolean;

    if (existingUpvote) {
      // Remove upvote
      await prisma.cardGameUpvote.delete({
        where: { id: existingUpvote.id },
      });
      hasUpvoted = false;
    } else {
      // Add upvote
      await prisma.cardGameUpvote.create({
        data: {
          userId,
          feedbackId,
        },
      });
      hasUpvoted = true;
    }

    // Get updated upvote count
    const upvoteCount = await prisma.cardGameUpvote.count({
      where: { feedbackId },
    });

    return { hasUpvoted, upvoteCount };
  }

  // ============================================================================
  // REPLY OPERATIONS
  // ============================================================================

  /**
   * Add reply to feedback
   */
  static async addReply(
    feedbackId: string,
    userId: string,
    data: AddReplyRequest
  ): Promise<ReplyResponse> {
    // Check if feedback exists
    const feedback = await prisma.cardGameFeedback.findUnique({
      where: { id: feedbackId },
    });

    if (!feedback) {
      throw new AppError('Feedback not found', 404);
    }

    if (!data.text || data.text.trim().length === 0) {
      throw new AppError('Reply text is required', 400);
    }

    const reply = await prisma.cardGameReply.create({
      data: {
        userId,
        feedbackId,
        text: data.text.trim(),
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            profile: {
              select: {
                profilePicture: true,
              },
            },
          },
        },
      },
    });

    return this.formatReply(reply);
  }

  /**
   * Delete reply
   */
  static async deleteReply(replyId: string, userId: string): Promise<void> {
    const reply = await prisma.cardGameReply.findUnique({
      where: { id: replyId },
    });

    if (!reply) {
      throw new AppError('Reply not found', 404);
    }

    if (reply.userId !== userId) {
      throw new AppError('You can only delete your own replies', 403);
    }

    await prisma.cardGameReply.delete({
      where: { id: replyId },
    });
  }

  // ============================================================================
  // STATISTICS OPERATIONS
  // ============================================================================

  /**
   * Get topic statistics
   */
  static async getTopicStats(topicId: string): Promise<StatsResponse> {
    const stats = await prisma.cardGameStat.findUnique({
      where: { topicId },
    });

    if (!stats) {
      // Return empty stats if none exist
      return {
        id: '',
        topicId,
        totalSessions: 0,
        averageRating: 0,
        totalFeedback: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        ratingDistribution: [],
      };
    }

    // Get rating distribution
    const ratingDistribution = await prisma.cardGameFeedback.groupBy({
      by: ['rating'],
      where: { topicId },
      _count: { rating: true },
    });

    return {
      ...stats,
      ratingDistribution: ratingDistribution.map((item) => ({
        rating: item.rating,
        count: item._count.rating,
      })),
    };
  }

  /**
   * Get all topics statistics
   */
  static async getAllTopicsStats(): Promise<StatsResponse[]> {
    const statsList = await prisma.cardGameStat.findMany({
      orderBy: { averageRating: 'desc' },
    });

    return statsList;
  }

  /**
   * Get detailed topic analytics
   */
  static async getTopicAnalytics(topicId: string): Promise<TopicAnalyticsResponse> {
    const [feedbackData, uniqueUsers, topQuestions] = await Promise.all([
      prisma.cardGameFeedback.findMany({
        where: { topicId },
        select: {
          rating: true,
          createdAt: true,
          userId: true,
        },
      }),
      prisma.cardGameFeedback.findMany({
        where: { topicId },
        distinct: ['userId'],
        select: { userId: true },
      }),
      prisma.cardGameFeedback.groupBy({
        by: ['questionId'],
        where: { topicId },
        _avg: { rating: true },
        _count: { questionId: true },
        orderBy: { _avg: { rating: 'desc' } },
        take: 10,
      }),
    ]);

    const totalFeedback = feedbackData.length;
    const uniqueUsersCount = uniqueUsers.length;
    const averageRating =
      totalFeedback > 0
        ? feedbackData.reduce((sum, f) => sum + f.rating, 0) / totalFeedback
        : 0;

    // Calculate unique sessions
    const uniqueSessions = new Set(
      feedbackData.map((f) => `${f.userId}-${f.createdAt.toDateString()}`)
    ).size;

    // TODO: Calculate completion rate based on expected questions
    const completionRate = 0; // Placeholder

    return {
      topicId,
      totalSessions: uniqueSessions,
      uniqueUsers: uniqueUsersCount,
      totalFeedback,
      averageRating: parseFloat(averageRating.toFixed(2)),
      completionRate,
      topQuestions: topQuestions.map((q) => ({
        questionId: q.questionId,
        averageRating: q._avg.rating || 0,
        feedbackCount: q._count.questionId,
      })),
      ratingTrend: [], // TODO: Implement trend calculation
    };
  }

  /**
   * Get user statistics
   */
  static async getUserStats(userId: string): Promise<UserStatsResponse> {
    const [feedbackData, repliesCount, upvotesReceived, topTopics] = await Promise.all([
      prisma.cardGameFeedback.findMany({
        where: { userId },
        select: {
          topicId: true,
          sessionNumber: true,
          rating: true,
        },
      }),
      prisma.cardGameReply.count({
        where: { userId },
      }),
      prisma.cardGameUpvote.count({
        where: {
          cardGameFeedbacks: { userId },
        },
      }),
      prisma.cardGameFeedback.groupBy({
        by: ['topicId'],
        where: { userId },
        _avg: { rating: true },
        _count: { topicId: true },
        orderBy: { _count: { topicId: 'desc' } },
        take: 5,
      }),
    ]);

    const totalFeedback = feedbackData.length;
    const uniqueTopics = new Set(feedbackData.map((f) => f.topicId)).size;
    const uniqueSessions = new Set(
      feedbackData.map((f) => `${f.topicId}-${f.sessionNumber}`)
    ).size;
    const averageRating =
      totalFeedback > 0
        ? feedbackData.reduce((sum, f) => sum + f.rating, 0) / totalFeedback
        : 0;

    return {
      userId,
      totalSessions: uniqueSessions,
      totalFeedback,
      averageRating: parseFloat(averageRating.toFixed(2)),
      topicsCompleted: uniqueTopics,
      repliesGiven: repliesCount,
      upvotesReceived,
      topTopics: topTopics.map((t) => ({
        topicId: t.topicId,
        feedbackCount: t._count.topicId,
        averageRating: t._avg.rating || 0,
      })),
    };
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  /**
   * Update topic statistics
   */
  private static async updateTopicStats(topicId: string): Promise<void> {
    try {
      const feedbackData = await prisma.cardGameFeedback.findMany({
        where: { topicId },
        select: {
          rating: true,
          sessionNumber: true,
          userId: true,
        },
      });

      if (feedbackData.length === 0) {
        // Delete stats if no feedback exists
        await prisma.cardGameStat.deleteMany({
          where: { topicId },
        });
        return;
      }

      const totalFeedback = feedbackData.length;
      const totalRating = feedbackData.reduce((sum, f) => sum + f.rating, 0);
      const averageRating = totalRating / totalFeedback;

      // Count unique sessions
      const uniqueSessions = new Set(
        feedbackData.map((f) => `${f.userId}-${f.sessionNumber}`)
      ).size;

      // Update or create stats
      await prisma.cardGameStat.upsert({
        where: { topicId },
        update: {
          totalSessions: uniqueSessions,
          averageRating: parseFloat(averageRating.toFixed(2)),
          totalFeedback,
        },
        create: {
          topicId,
          totalSessions: uniqueSessions,
          averageRating: parseFloat(averageRating.toFixed(2)),
          totalFeedback,
        },
      });
    } catch (error) {
      logger.error(`Error updating topic stats for ${topicId}:`, error);
      throw error;
    }
  }

  /**
   * Format feedback response
   */
  private static formatFeedback(feedback: any, currentUserId?: string): FeedbackResponse {
    return {
      id: feedback.id,
      userId: feedback.userId,
      topicId: feedback.topicId,
      sessionNumber: feedback.sessionNumber,
      questionId: feedback.questionId,
      rating: feedback.rating,
      comment: feedback.comment,
      createdAt: feedback.createdAt,
      updatedAt: feedback.updatedAt,
      user: feedback.user,
      upvoteCount: feedback._count?.cardGameUpvotes || 0,
      hasUpvoted: currentUserId
        ? feedback.cardGameUpvotes?.some((u: any) => u.userId === currentUserId) || false
        : false,
      replies: feedback.cardGameReplies?.map((r: any) => this.formatReply(r)),
      _count: feedback._count,
    };
  }

  /**
   * Format reply response
   */
  private static formatReply(reply: any): ReplyResponse {
    return {
      id: reply.id,
      userId: reply.userId,
      feedbackId: reply.feedbackId,
      text: reply.text,
      createdAt: reply.createdAt,
      updatedAt: reply.updatedAt,
      user: reply.user,
    };
  }
}
