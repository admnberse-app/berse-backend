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
  PaginatedFeedbackResponse,
  CreateTopicRequest,
  UpdateTopicRequest,
  CreateQuestionRequest,
  UpdateQuestionRequest,
  StartSessionRequest,
  CompleteSessionRequest,
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

    // Validate question exists if questionId is provided
    if (data.questionId) {
      const question = await prisma.cardGameQuestion.findFirst({
        where: {
          id: data.questionId,
          topicId: data.topicId,
          isActive: true,
        },
      });

      if (!question) {
        throw new AppError('Invalid question ID for this topic', 400);
      }

      // Auto-fill questionText if not provided
      if (!data.questionText) {
        data.questionText = question.questionText;
      }
    }

    // Get topic title if not provided
    if (!data.topicTitle) {
      const topic = await prisma.cardGameTopic.findUnique({
        where: { id: data.topicId },
      });
      if (topic) {
        data.topicTitle = topic.title;
      }
    }

    // Create feedback
    const feedback = await prisma.cardGameFeedback.create({
      data: {
        userId,
        topicId: data.topicId,
        topicTitle: data.topicTitle,
        sessionNumber: data.sessionNumber,
        questionId: data.questionId,
        questionText: data.questionText,
        rating: data.rating,
        comment: data.comment || null,
        isHelpful: data.isHelpful !== undefined ? data.isHelpful : true,
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

    // Update session progress asynchronously
    this.updateSessionProgress(userId, data.topicId, data.sessionNumber).catch((err) => {
      logger.error(`Error updating session progress:`, err);
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

    // Build orderBy clause using cached upvoteCount field
    const orderBy: Prisma.CardGameFeedbackOrderByWithRelationInput = {};
    if (query.sortBy === 'upvotes') {
      orderBy.upvoteCount = query.sortOrder || 'desc';
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
          where: { parentReplyId: null },
          include: this.getReplyInclude(currentUserId),
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
      // Remove upvote and decrement count
      await prisma.$transaction([
        prisma.cardGameUpvote.delete({
          where: { id: existingUpvote.id },
        }),
        prisma.cardGameFeedback.update({
          where: { id: feedbackId },
          data: { upvoteCount: { decrement: 1 } },
        }),
      ]);
      hasUpvoted = false;
    } else {
      // Add upvote and increment count
      await prisma.$transaction([
        prisma.cardGameUpvote.create({
          data: {
            userId,
            feedbackId,
          },
        }),
        prisma.cardGameFeedback.update({
          where: { id: feedbackId },
          data: { upvoteCount: { increment: 1 } },
        }),
      ]);
      hasUpvoted = true;
    }

    // Get updated count from cached field
    const updatedFeedback = await prisma.cardGameFeedback.findUnique({
      where: { id: feedbackId },
      select: { upvoteCount: true },
    });

    return { hasUpvoted, upvoteCount: updatedFeedback?.upvoteCount || 0 };
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

  /**
   * Reply to another reply (nested reply)
   */
  static async replyToReply(
    parentReplyId: string,
    userId: string,
    data: AddReplyRequest
  ): Promise<ReplyResponse> {
    // Verify parent reply exists
    const parentReply = await prisma.cardGameReply.findUnique({
      where: { id: parentReplyId },
    });

    if (!parentReply) {
      throw new AppError('Parent reply not found', 404);
    }

    // Prevent deeply nested replies (max 2 levels: reply -> reply -> reply)
    if (parentReply.parentReplyId) {
      throw new AppError('Cannot reply to a nested reply. Reply to the parent reply instead.', 400);
    }

    // Create the nested reply
    const reply = await prisma.cardGameReply.create({
      data: {
        userId,
        feedbackId: parentReply.feedbackId,
        parentReplyId,
        text: data.text,
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

    return reply;
  }

  /**
   * Toggle upvote on a reply
   */
  static async toggleReplyUpvote(
    replyId: string,
    userId: string
  ): Promise<{ hasUpvoted: boolean; upvoteCount: number }> {
    // Check if reply exists
    const reply = await prisma.cardGameReply.findUnique({
      where: { id: replyId },
    });

    if (!reply) {
      throw new AppError('Reply not found', 404);
    }

    // Check if already upvoted
    const existingUpvote = await prisma.cardGameReplyUpvote.findUnique({
      where: {
        userId_replyId: {
          userId,
          replyId,
        },
      },
    });

    let hasUpvoted: boolean;

    if (existingUpvote) {
      // Remove upvote and decrement count
      await prisma.$transaction([
        prisma.cardGameReplyUpvote.delete({
          where: { id: existingUpvote.id },
        }),
        prisma.cardGameReply.update({
          where: { id: replyId },
          data: { upvoteCount: { decrement: 1 } },
        }),
      ]);
      hasUpvoted = false;
    } else {
      // Add upvote and increment count
      await prisma.$transaction([
        prisma.cardGameReplyUpvote.create({
          data: {
            userId,
            replyId,
          },
        }),
        prisma.cardGameReply.update({
          where: { id: replyId },
          data: { upvoteCount: { increment: 1 } },
        }),
      ]);
      hasUpvoted = true;
    }

    // Get updated count from cached field
    const updatedReply = await prisma.cardGameReply.findUnique({
      where: { id: replyId },
      select: { upvoteCount: true },
    });

    return { hasUpvoted, upvoteCount: updatedReply?.upvoteCount || 0 };
  }

  /**
   * Helper to get reply include object with nested replies and upvote info
   * Optimized: Uses cached upvoteCount field for fast sorting
   */
  private static getReplyInclude(currentUserId?: string, includeNested: boolean = true) {
    const baseInclude = {
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
      cardGameReplyUpvotes: currentUserId
        ? {
            where: { userId: currentUserId },
            select: { userId: true },
          }
        : false,
      _count: {
        select: {
          childReplies: true,
        },
      },
    };

    if (includeNested) {
      return {
        ...baseInclude,
        childReplies: {
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
            cardGameReplyUpvotes: currentUserId
              ? {
                  where: { userId: currentUserId },
                  select: { userId: true },
                }
              : false,
          },
          orderBy: { createdAt: 'asc' as const },
        },
      };
    }

    return baseInclude;
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
      topicTitle: feedback.topicTitle,
      sessionNumber: feedback.sessionNumber,
      questionId: feedback.questionId,
      questionText: feedback.questionText,
      rating: feedback.rating,
      comment: feedback.comment,
      isHelpful: feedback.isHelpful,
      createdAt: feedback.createdAt,
      updatedAt: feedback.updatedAt,
      user: feedback.user,
      upvoteCount: feedback.upvoteCount || 0,
      hasUpvoted: currentUserId
        ? feedback.cardGameUpvotes?.some((u: any) => u.userId === currentUserId) || false
        : false,
      replies: feedback.cardGameReplies?.map((r: any) => this.formatReply(r, currentUserId)),
      _count: feedback._count,
    };
  }

  /**
   * Format reply response
   */
  private static formatReply(reply: any, currentUserId?: string): ReplyResponse {
    return {
      id: reply.id,
      userId: reply.userId,
      feedbackId: reply.feedbackId,
      parentReplyId: reply.parentReplyId,
      text: reply.text,
      upvoteCount: reply.upvoteCount || 0,
      hasUpvoted: currentUserId
        ? reply.cardGameReplyUpvotes?.some((u: any) => u.userId === currentUserId) || false
        : false,
      createdAt: reply.createdAt,
      updatedAt: reply.updatedAt,
      user: reply.user,
      childReplies: reply.childReplies?.map((r: any) => this.formatReply(r, currentUserId)),
      _count: reply._count,
    };
  }

  // ============================================================================
  // TOPIC OPERATIONS
  // ============================================================================

  /**
   * Get all active topics
   */
  static async getTopics(includeStats = false) {
    const topics = await prisma.cardGameTopic.findMany({
      where: { isActive: true },
      orderBy: [
        { displayOrder: 'asc' },
        { createdAt: 'asc' },
      ],
    });

    if (!includeStats) {
      return topics;
    }

    // Include stats for each topic
    const topicsWithStats = await Promise.all(
      topics.map(async (topic) => {
        const stats = await prisma.cardGameStat.findUnique({
          where: { topicId: topic.id },
        });

        return {
          ...topic,
          stats: stats || {
            totalSessions: 0,
            averageRating: 0,
            totalFeedback: 0,
          },
        };
      })
    );

    return topicsWithStats;
  }

  /**
   * Get a single topic by ID
   */
  static async getTopicById(topicId: string, userId?: string) {
    const topic = await prisma.cardGameTopic.findUnique({
      where: { id: topicId },
    });

    if (!topic) {
      throw new AppError('Topic not found', 404);
    }

    // Get stats
    const stats = await prisma.cardGameStat.findUnique({
      where: { topicId },
    });

    // Get user's progress if userId provided
    let userProgress;
    if (userId) {
      const sessions = await prisma.cardGameSession.findMany({
        where: {
          userId,
          topicId,
        },
        orderBy: { sessionNumber: 'asc' },
      });

      const completedSessions = sessions.filter((s) => s.completedAt).length;
      const lastSession = sessions[sessions.length - 1];
      const canContinue = completedSessions < topic.totalSessions;

      userProgress = {
        sessionsCompleted: completedSessions,
        lastSessionDate: lastSession?.startedAt,
        canContinue,
        nextSessionNumber: canContinue ? completedSessions + 1 : null,
      };
    }

    return {
      ...topic,
      stats: stats || { totalSessions: 0, averageRating: 0, totalFeedback: 0 },
      userProgress,
    };
  }

  /**
   * Create a new topic (Admin only)
   */
  static async createTopic(data: {
    id: string;
    title: string;
    description?: string;
    gradient?: string;
    totalSessions: number;
    displayOrder?: number;
  }) {
    // Check if topic already exists
    const existing = await prisma.cardGameTopic.findUnique({
      where: { id: data.id },
    });

    if (existing) {
      throw new AppError('Topic with this ID already exists', 409);
    }

    const topic = await prisma.cardGameTopic.create({
      data: {
        id: data.id,
        title: data.title,
        description: data.description,
        gradient: data.gradient,
        totalSessions: data.totalSessions,
        displayOrder: data.displayOrder || 0,
        isActive: true,
      },
    });

    // Initialize stats
    await prisma.cardGameStat.create({
      data: {
        topicId: topic.id,
        totalSessions: 0,
        averageRating: 0,
        totalFeedback: 0,
      },
    });

    return topic;
  }

  /**
   * Update a topic (Admin only)
   */
  static async updateTopic(
    topicId: string,
    data: {
      title?: string;
      description?: string;
      gradient?: string;
      totalSessions?: number;
      isActive?: boolean;
      displayOrder?: number;
    }
  ) {
    const topic = await prisma.cardGameTopic.findUnique({
      where: { id: topicId },
    });

    if (!topic) {
      throw new AppError('Topic not found', 404);
    }

    return await prisma.cardGameTopic.update({
      where: { id: topicId },
      data,
    });
  }

  // ============================================================================
  // QUESTION OPERATIONS
  // ============================================================================

  /**
   * Get questions for a specific session
   */
  static async getSessionQuestions(topicId: string, sessionNumber: number, activeOnly: boolean = true) {
    // Verify topic exists
    const topic = await prisma.cardGameTopic.findUnique({
      where: { id: topicId },
    });

    if (!topic) {
      throw new AppError('Topic not found', 404);
    }

    if (sessionNumber < 1 || sessionNumber > topic.totalSessions) {
      throw new AppError('Invalid session number', 400);
    }

    const whereClause: any = {
      topicId,
      sessionNumber,
    };

    if (activeOnly) {
      whereClause.isActive = true;
    }

    const questions = await prisma.cardGameQuestion.findMany({
      where: whereClause,
      orderBy: { questionOrder: 'asc' },
    });

    return {
      topicId,
      topicTitle: topic.title,
      sessionNumber,
      totalQuestions: questions.length,
      questions,
    };
  }

  /**
   * Create a new question (Admin only)
   */
  static async createQuestion(data: {
    topicId: string;
    sessionNumber: number;
    questionOrder: number;
    questionText: string;
  }) {
    // Verify topic exists
    const topic = await prisma.cardGameTopic.findUnique({
      where: { id: data.topicId },
    });

    if (!topic) {
      throw new AppError('Topic not found', 404);
    }

    if (data.sessionNumber < 1 || data.sessionNumber > topic.totalSessions) {
      throw new AppError('Invalid session number', 400);
    }

    // Check if question already exists at this position
    const existing = await prisma.cardGameQuestion.findUnique({
      where: {
        topicId_sessionNumber_questionOrder: {
          topicId: data.topicId,
          sessionNumber: data.sessionNumber,
          questionOrder: data.questionOrder,
        },
      },
    });

    if (existing) {
      throw new AppError('Question already exists at this position', 409);
    }

    return await prisma.cardGameQuestion.create({
      data: {
        topicId: data.topicId,
        sessionNumber: data.sessionNumber,
        questionOrder: data.questionOrder,
        questionText: data.questionText,
        isActive: true,
      },
    });
  }

  /**
   * Update a question (Admin only)
   */
  static async updateQuestion(
    questionId: string,
    data: {
      questionText?: string;
      isActive?: boolean;
    }
  ) {
    const question = await prisma.cardGameQuestion.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      throw new AppError('Question not found', 404);
    }

    return await prisma.cardGameQuestion.update({
      where: { id: questionId },
      data,
    });
  }

  /**
   * Delete a question (Admin only)
   */
  static async deleteQuestion(questionId: string) {
    const question = await prisma.cardGameQuestion.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      throw new AppError('Question not found', 404);
    }

    // Soft delete by setting isActive to false
    return await prisma.cardGameQuestion.update({
      where: { id: questionId },
      data: { isActive: false },
    });
  }

  // ============================================================================
  // SESSION OPERATIONS
  // ============================================================================

  /**
   * Start a new session
   */
  static async startSession(
    userId: string,
    data: {
      topicId: string;
      sessionNumber: number;
      totalQuestions: number;
    }
  ) {
    // Verify topic exists
    const topic = await prisma.cardGameTopic.findUnique({
      where: { id: data.topicId },
    });

    if (!topic) {
      throw new AppError('Topic not found', 404);
    }

    if (data.sessionNumber < 1 || data.sessionNumber > topic.totalSessions) {
      throw new AppError('Invalid session number', 400);
    }

    // Check if session already exists
    const existing = await prisma.cardGameSession.findUnique({
      where: {
        userId_topicId_sessionNumber: {
          userId,
          topicId: data.topicId,
          sessionNumber: data.sessionNumber,
        },
      },
    });

    if (existing) {
      // Return existing session if not completed
      if (!existing.completedAt) {
        return existing;
      }
      throw new AppError('Session already completed', 409);
    }

    return await prisma.cardGameSession.create({
      data: {
        userId,
        topicId: data.topicId,
        sessionNumber: data.sessionNumber,
        totalQuestions: data.totalQuestions,
        questionsAnswered: 0,
      },
      include: {
        topic: true,
      },
    });
  }

  /**
   * Complete a session
   */
  static async completeSession(
    sessionId: string,
    userId: string,
    data: {
      averageRating?: number;
    }
  ) {
    const session = await prisma.cardGameSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new AppError('Session not found', 404);
    }

    // Verify ownership
    if (session.userId !== userId) {
      throw new AppError('You can only complete your own sessions', 403);
    }

    if (session.completedAt) {
      throw new AppError('Session already completed', 400);
    }

    return await prisma.cardGameSession.update({
      where: { id: sessionId },
      data: {
        completedAt: new Date(),
        averageRating: data.averageRating,
      },
      include: {
        topic: true,
      },
    });
  }

  /**
   * Get incomplete sessions for a user
   */
  static async getIncompleteSessions(userId: string) {
    return await prisma.cardGameSession.findMany({
      where: {
        userId,
        completedAt: null,
      },
      include: {
        topic: true,
      },
      orderBy: { startedAt: 'desc' },
    });
  }

  /**
   * Get all sessions for a user
   */
  static async getUserSessions(userId: string, topicId?: string) {
    const where: Prisma.CardGameSessionWhereInput = { userId };
    if (topicId) {
      where.topicId = topicId;
    }

    return await prisma.cardGameSession.findMany({
      where,
      include: {
        topic: true,
      },
      orderBy: [
        { topicId: 'asc' },
        { sessionNumber: 'asc' },
      ],
    });
  }

  /**
   * Get session progress
   */
  static async getSessionProgress(sessionId: string, userId: string) {
    const session = await prisma.cardGameSession.findUnique({
      where: { id: sessionId },
      include: {
        topic: true,
      },
    });

    if (!session) {
      throw new AppError('Session not found', 404);
    }

    // Verify ownership
    if (session.userId !== userId) {
      throw new AppError('You can only view your own session progress', 403);
    }

    // Verify ownership
    if (session.userId !== userId) {
      throw new AppError('You can only view your own session progress', 403);
    }

    const percentage = session.totalQuestions > 0
      ? (session.questionsAnswered / session.totalQuestions) * 100
      : 0;

    return {
      ...session,
      progress: {
        percentage: Math.round(percentage),
        isComplete: !!session.completedAt,
        canResume: !session.completedAt,
      },
    };
  }

  /**
   * Get session summary
   */
  static async getSessionSummary(
    userId: string,
    topicId: string,
    sessionNumber: number
  ) {
    const session = await prisma.cardGameSession.findUnique({
      where: {
        userId_topicId_sessionNumber: {
          userId,
          topicId,
          sessionNumber,
        },
      },
      include: {
        topic: true,
      },
    });

    if (!session) {
      throw new AppError('Session not found', 404);
    }

    // Get user's feedback for this session
    const feedback = await prisma.cardGameFeedback.findMany({
      where: {
        userId,
        topicId,
        sessionNumber,
      },
      include: {
        _count: {
          select: {
            cardGameUpvotes: true,
            cardGameReplies: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Calculate stats
    const questionsAnswered = feedback.length;
    const averageRating = questionsAnswered > 0
      ? feedback.reduce((sum, f) => sum + f.rating, 0) / questionsAnswered
      : 0;
    const commentsCount = feedback.filter((f) => f.comment).length;

    // Get community average for comparison
    const communityFeedback = await prisma.cardGameFeedback.aggregate({
      where: {
        topicId,
        sessionNumber,
      },
      _avg: {
        rating: true,
      },
    });

    return {
      session,
      feedback,
      stats: {
        totalQuestions: session.totalQuestions,
        questionsAnswered,
        averageRating: Math.round(averageRating * 10) / 10,
        commentsCount,
      },
      communityComparison: {
        yourRating: averageRating,
        communityAverage: communityFeedback._avg.rating || 0,
        percentile: 0, // TODO: Calculate percentile
      },
    };
  }

  /**
   * Update session progress when feedback is submitted
   */
  static async updateSessionProgress(
    userId: string,
    topicId: string,
    sessionNumber: number
  ) {
    const session = await prisma.cardGameSession.findUnique({
      where: {
        userId_topicId_sessionNumber: {
          userId,
          topicId,
          sessionNumber,
        },
      },
    });

    if (!session || session.completedAt) {
      return; // Session doesn't exist or already completed
    }

    // Count feedback for this session
    const feedbackCount = await prisma.cardGameFeedback.count({
      where: {
        userId,
        topicId,
        sessionNumber,
      },
    });

    // Calculate average rating
    const avgRating = await prisma.cardGameFeedback.aggregate({
      where: {
        userId,
        topicId,
        sessionNumber,
      },
      _avg: {
        rating: true,
      },
    });

    // Update session
    await prisma.cardGameSession.update({
      where: { id: session.id },
      data: {
        questionsAnswered: feedbackCount,
        averageRating: avgRating._avg.rating || undefined,
        // Auto-complete if all questions answered
        completedAt: feedbackCount >= session.totalQuestions
          ? new Date()
          : undefined,
      },
    });
  }

  // ============================================================================
  // QUESTION METHODS
  // ============================================================================

  /**
   * Get all questions in a topic with stats
   */
  static async getTopicQuestions(topicId: string, currentUserId?: string) {
    // Verify topic exists
    const topic = await prisma.cardGameTopic.findUnique({
      where: { id: topicId },
    });

    if (!topic) {
      throw new AppError('Topic not found', 404);
    }

    // Get all questions for this topic
    const questions = await prisma.cardGameQuestion.findMany({
      where: { topicId, isActive: true },
      orderBy: [
        { sessionNumber: 'asc' },
        { questionOrder: 'asc' },
      ],
    });

    // Get feedback stats for each question
    const questionStats = await Promise.all(
      questions.map(async (question) => {
        const stats = await prisma.cardGameFeedback.aggregate({
          where: { questionId: question.id },
          _count: { id: true },
          _avg: { rating: true },
        });

        const upvoteCount = await prisma.cardGameUpvote.count({
          where: {
            cardGameFeedbacks: {
              questionId: question.id,
            },
          },
        });

        // Check if current user has answered this question
        let userAnswer = null;
        if (currentUserId) {
          userAnswer = await prisma.cardGameFeedback.findFirst({
            where: {
              questionId: question.id,
              userId: currentUserId,
            },
            select: {
              id: true,
              rating: true,
              comment: true,
              createdAt: true,
            },
          });
        }

        return {
          id: question.id,
          topicId: question.topicId,
          sessionNumber: question.sessionNumber,
          questionOrder: question.questionOrder,
          questionText: question.questionText,
          stats: {
            totalFeedback: stats._count.id,
            averageRating: stats._avg.rating ? Math.round(stats._avg.rating * 10) / 10 : 0,
            totalUpvotes: upvoteCount,
          },
          userAnswer,
        };
      })
    );

    return {
      topicId,
      topicTitle: topic.title,
      totalQuestions: questions.length,
      questions: questionStats,
    };
  }

  /**
   * Get all feedback for a specific question (sorted by upvotes)
   */
  static async getQuestionFeedback(
    questionId: string,
    currentUserId: string | undefined,
    query: FeedbackQuery
  ): Promise<PaginatedFeedbackResponse> {
    // Verify question exists
    const question = await prisma.cardGameQuestion.findUnique({
      where: { id: questionId },
      include: {
        topic: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!question) {
      throw new AppError('Question not found', 404);
    }

    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    // Build where clause for this question
    const where: Prisma.CardGameFeedbackWhereInput = {
      questionId,
    };

    // Build orderBy - default to upvotes descending using cached field
    const orderBy: Prisma.CardGameFeedbackOrderByWithRelationInput = {};
    if (query.sortBy === 'upvotes' || !query.sortBy) {
      orderBy.upvoteCount = 'desc';
    } else if (query.sortBy === 'rating') {
      orderBy.rating = query.sortOrder || 'desc';
    } else {
      orderBy.createdAt = query.sortOrder || 'desc';
    }

    // Determine whether to include nested replies (default: true)
    const includeNested = query.includeNested !== false;

    // Get feedback with all relations
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
            where: { parentReplyId: null },
            include: this.getReplyInclude(currentUserId, includeNested),
            orderBy: [
              { upvoteCount: 'desc' },
              { createdAt: 'asc' },
            ],
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

    return {
      data: feedbackList.map((feedback) => this.formatFeedback(feedback)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
      meta: {
        questionId: question.id,
        questionText: question.questionText,
        topicId: question.topic.id,
        topicTitle: question.topic.title,
        sessionNumber: question.sessionNumber,
      },
    };
  }
}
