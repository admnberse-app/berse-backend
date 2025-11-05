import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error';
import { getProfilePictureUrl } from '../../utils/image.helpers';
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
  MainPageResponse,
  LeaderboardQuery,
  LeaderboardResponse,
  PopularQuestionsQuery,
  PopularQuestionsResponse,
  TopicDetailResponse,
  StartSessionResponse,
  SubmitAnswerRequest,
  SubmitAnswerResponse,
  CompleteSessionRequest as CompleteSessionRequestNew,
  SessionSummaryResponse,
  DetailedStatsQuery,
  DetailedStatsResponse,
} from './cardgame.types';
import logger from '../../utils/logger';
import { Prisma } from '@prisma/client';
import { NotificationService } from '../../services/notification.service';

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
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
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
    let newUpvoteCount: number;

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
      select: { upvoteCount: true, questionText: true },
    });

    newUpvoteCount = updatedFeedback?.upvoteCount || 0;

    // Send notification if upvoted and reached popular threshold (10+ upvotes)
    if (hasUpvoted) {
      const popularThresholds = [10, 25, 50, 100];
      if (popularThresholds.includes(newUpvoteCount)) {
        NotificationService.notifyCardGameFeedbackPopular(
          feedback.userId,
          feedbackId,
          feedback.topicTitle,
          newUpvoteCount,
          updatedFeedback?.questionText || ''
        ).catch((err) => {
          logger.error('Failed to send card game feedback popular notification:', err);
        });
      }
    }

    return { hasUpvoted, upvoteCount: newUpvoteCount };
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
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
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

    // Send notification to feedback owner (async, don't wait)
    NotificationService.notifyCardGameReply(
      feedback.userId,
      reply.user.fullName,
      userId,
      reply.text,
      feedbackId,
      feedback.topicTitle
    ).catch((err) => {
      logger.error('Failed to send card game reply notification:', err);
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
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
          },
        },
        cardGameFeedbacks: {
          select: {
            id: true,
            topicTitle: true,
          },
        },
      },
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

    // Send notification to parent reply owner (async, don't wait)
    NotificationService.notifyCardGameNestedReply(
      parentReply.userId,
      reply.user.fullName,
      userId,
      reply.text,
      parentReplyId,
      parentReply.feedbackId,
      parentReply.cardGameFeedbacks.topicTitle
    ).catch((err) => {
      logger.error('Failed to send card game nested reply notification:', err);
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
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
          },
        },
        cardGameFeedbacks: {
          select: {
            id: true,
            topicTitle: true,
          },
        },
      },
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
    let newUpvoteCount: number;

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

    newUpvoteCount = updatedReply?.upvoteCount || 0;

    // Send notification if upvoted (not on un-upvote)
    if (hasUpvoted) {
      // Get upvoter's name
      const upvoter = await prisma.user.findUnique({
        where: { id: userId },
        select: { fullName: true },
      });

      // Send upvote notification (async, don't wait)
      NotificationService.notifyCardGameReplyUpvote(
        reply.userId,
        upvoter?.fullName || 'Someone',
        userId,
        replyId,
        reply.feedbackId,
        newUpvoteCount,
        reply.cardGameFeedbacks.topicTitle
      ).catch((err) => {
        logger.error('Failed to send card game reply upvote notification:', err);
      });

      // Check for milestone notifications (10, 25, 50, 100 upvotes)
      const milestones = [10, 25, 50, 100];
      if (milestones.includes(newUpvoteCount)) {
        NotificationService.notifyCardGameReplyMilestone(
          reply.userId,
          replyId,
          reply.feedbackId,
          newUpvoteCount,
          reply.cardGameFeedbacks.topicTitle,
          reply.text
        ).catch((err) => {
          logger.error('Failed to send card game reply milestone notification:', err);
        });
      }
    }

    return { hasUpvoted, upvoteCount: newUpvoteCount };
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

    // Fetch question texts for top questions
    const questionIds = topQuestions.map(q => q.questionId);
    const questions = await prisma.cardGameQuestion.findMany({
      where: { id: { in: questionIds } },
      select: { id: true, questionText: true },
    });
    const questionTextMap = new Map(questions.map(q => [q.id, q.questionText]));

    return {
      topicId,
      totalSessions: uniqueSessions,
      uniqueUsers: uniqueUsersCount,
      totalFeedback,
      averageRating: parseFloat(averageRating.toFixed(2)),
      completionRate,
      topQuestions: topQuestions.map((q) => ({
        questionId: q.questionId,
        questionText: questionTextMap.get(q.questionId) || '',
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
      user: feedback.user ? {
        ...feedback.user,
        profile: feedback.user.profile ? {
          ...feedback.user.profile,
          profilePicture: getProfilePictureUrl(feedback.user.profile.profilePicture),
        } : null,
      } : null,
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
      user: reply.user ? {
        ...reply.user,
        profile: reply.user.profile ? {
          ...reply.user.profile,
          profilePicture: getProfilePictureUrl(reply.user.profile.profilePicture),
        } : null,
      } : null,
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
  static async getTopics(includeStats = false, activeOnly = true) {
    const topics = await prisma.cardGameTopic.findMany({
      where: activeOnly ? { isActive: true } : undefined,
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
      include: {
        topic: {
          select: {
            id: true,
            title: true,
            totalSessions: true,
          },
        },
      },
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

    const completed = await prisma.cardGameSession.update({
      where: { id: sessionId },
      data: {
        completedAt: new Date(),
        averageRating: data.averageRating,
      },
      include: {
        topic: true,
      },
    });

    // Send session completion notification (async, don't wait)
    if (data.averageRating) {
      NotificationService.notifyCardGameSessionComplete(
        userId,
        session.topic.title,
        session.topic.id,
        session.sessionNumber,
        session.topic.totalSessions,
        data.averageRating
      ).catch((err) => {
        logger.error('Failed to send card game session complete notification:', err);
      });
    }

    return completed;
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

  // ============================================================================
  // NEW MAIN PAGE ENDPOINT
  // ============================================================================

  /**
   * Get consolidated main page data
   */
  static async getMainPage(userId: string): Promise<MainPageResponse> {
    const [userStats, incompleteSession, topics, leaderboard, popularQuestions] = await Promise.all([
      this.getUserStatsSummary(userId),
      this.getIncompleteSession(userId),
      this.getTopicsWithProgress(userId),
      this.getLeaderboardSummary('overall'),
      this.getPopularQuestionsPreview(),
    ]);

    return {
      userStats,
      incompleteSession,
      topics,
      leaderboard,
      popularQuestions,
    };
  }

  /**
   * Get user stats summary with time periods
   */
  private static async getUserStatsSummary(userId: string) {
    const now = new Date();
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get streak info
    const streak = await prisma.cardGameStreak.findUnique({
      where: { userId },
    });

    // Get all-time stats
    const [allSessions, allFeedback, allReplies, allUpvotes, topicsCompleted] = await Promise.all([
      prisma.cardGameSession.count({ where: { userId, completedAt: { not: null } } }),
      prisma.cardGameFeedback.count({ where: { userId } }),
      prisma.cardGameReply.count({ where: { userId } }),
      prisma.cardGameUpvote.count({ where: { cardGameFeedbacks: { userId } } }),
      prisma.cardGameSession.findMany({
        where: { userId, completedAt: { not: null } },
        distinct: ['topicId'],
        select: { topicId: true },
      }),
    ]);

    const allFeedbackData = await prisma.cardGameFeedback.findMany({
      where: { userId },
      select: { rating: true },
    });
    const allAvgRating = allFeedbackData.length > 0
      ? allFeedbackData.reduce((sum, f) => sum + f.rating, 0) / allFeedbackData.length
      : 0;

    // Get time period stats
    const [last7DaysStats, last30DaysStats, thisMonthStats] = await Promise.all([
      this.getStatsByPeriod(userId, last7Days),
      this.getStatsByPeriod(userId, last30Days),
      this.getStatsByPeriod(userId, thisMonthStart),
    ]);

    return {
      summary: {
        totalSessions: allSessions,
        totalFeedback: allFeedback,
        totalReplies: allReplies,
        upvotesReceived: allUpvotes,
        averageRating: parseFloat(allAvgRating.toFixed(2)),
        currentStreak: streak?.currentStreak || 0,
        topicsCompleted: topicsCompleted.length,
      },
      timePeriods: {
        last7Days: last7DaysStats,
        last30Days: last30DaysStats,
        thisMonth: thisMonthStats,
      },
    };
  }

  /**
   * Get stats for a specific time period
   */
  private static async getStatsByPeriod(userId: string, startDate: Date) {
    const [sessions, feedback, replies, upvotes] = await Promise.all([
      prisma.cardGameSession.count({
        where: { userId, completedAt: { gte: startDate, not: null } },
      }),
      prisma.cardGameFeedback.count({
        where: { userId, createdAt: { gte: startDate } },
      }),
      prisma.cardGameReply.count({
        where: { userId, createdAt: { gte: startDate } },
      }),
      prisma.cardGameUpvote.count({
        where: {
          cardGameFeedbacks: { userId },
          createdAt: { gte: startDate },
        },
      }),
    ]);

    const feedbackData = await prisma.cardGameFeedback.findMany({
      where: { userId, createdAt: { gte: startDate } },
      select: { rating: true },
    });

    const avgRating = feedbackData.length > 0
      ? feedbackData.reduce((sum, f) => sum + f.rating, 0) / feedbackData.length
      : 0;

    return {
      totalSessions: sessions,
      totalFeedback: feedback,
      totalReplies: replies,
      upvotesReceived: upvotes,
      averageRating: parseFloat(avgRating.toFixed(2)),
    };
  }

  /**
   * Get incomplete session info
   */
  private static async getIncompleteSession(userId: string) {
    const incomplete = await prisma.cardGameSession.findFirst({
      where: {
        userId,
        completedAt: null,
        status: { in: ['in-progress', 'not-started'] },
      },
      include: {
        topic: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { startedAt: 'desc' },
    });

    if (!incomplete) return null;

    const percentage = incomplete.totalQuestions > 0
      ? Math.round((incomplete.questionsAnswered / incomplete.totalQuestions) * 100)
      : 0;

    return {
      id: incomplete.id,
      topicId: incomplete.topicId,
      topicTitle: incomplete.topic.title,
      sessionNumber: incomplete.sessionNumber,
      progress: {
        questionsAnswered: incomplete.questionsAnswered,
        totalQuestions: incomplete.totalQuestions,
        percentage,
      },
      startedAt: incomplete.startedAt,
    };
  }

  /**
   * Get topics with user progress
   */
  private static async getTopicsWithProgress(userId: string) {
    const topics = await prisma.cardGameTopic.findMany({
      where: { isActive: true },
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
    });

    const topicsWithProgress = await Promise.all(
      topics.map(async (topic) => {
        // Get community stats
        const [stats, userSessions] = await Promise.all([
          prisma.cardGameStat.findUnique({ where: { topicId: topic.id } }),
          prisma.cardGameSession.findMany({
            where: { userId, topicId: topic.id, completedAt: { not: null } },
            select: { sessionNumber: true, completedAt: true },
            orderBy: { sessionNumber: 'asc' },
          }),
        ]);

        // Find most popular session
        const sessionFeedbackCounts = await prisma.cardGameFeedback.groupBy({
          by: ['sessionNumber'],
          where: { topicId: topic.id },
          _count: { id: true },
          orderBy: { _count: { id: 'desc' } },
          take: 1,
        });

        const completedSessions = userSessions.length;
        const lastCompleted = userSessions[userSessions.length - 1];
        const progressPercentage = Math.round((completedSessions / topic.totalSessions) * 100);
        const nextSession = completedSessions < topic.totalSessions ? completedSessions + 1 : null;

        return {
          id: topic.id,
          title: topic.title,
          description: topic.description || undefined,
          gradient: topic.gradient || undefined,
          totalSessions: topic.totalSessions,
          totalQuestions: 0, // TODO: Calculate from questions
          isActive: topic.isActive,
          displayOrder: topic.displayOrder,
          stats: {
            communitySessions: stats?.totalSessions || 0,
            averageRating: stats?.averageRating || 0,
            totalFeedback: stats?.totalFeedback || 0,
          },
          userProgress: {
            sessionsCompleted: completedSessions,
            progressPercentage,
            nextSession,
            lastCompletedAt: lastCompleted?.completedAt,
          },
          popularSession: sessionFeedbackCounts[0]
            ? {
                sessionNumber: sessionFeedbackCounts[0].sessionNumber,
                feedbackCount: sessionFeedbackCounts[0]._count.id,
              }
            : undefined,
        };
      })
    );

    return topicsWithProgress;
  }

  /**
   * Get leaderboard summary (top 10 + current user)
   */
  private static async getLeaderboardSummary(type: string = 'overall') {
    // Get top 10 users based on overall score
    const topUsers = await this.calculateLeaderboard(type, 1, 10);
    
    return {
      topUsers: topUsers.slice(0, 10),
      currentUser: topUsers[0] || {
        rank: 0,
        userId: '',
        fullName: '',
        score: 0,
        breakdown: {},
      },
    };
  }

  /**
   * Get popular questions preview
   */
  private static async getPopularQuestionsPreview() {
    const popularQuestions = await this.getPopularQuestionsWithEngagement(1, 5);
    return popularQuestions;
  }

  // ============================================================================
  // LEADERBOARD ENDPOINTS
  // ============================================================================

  /**
   * Get full leaderboard with pagination
   */
  static async getLeaderboard(query: LeaderboardQuery, currentUserId: string): Promise<LeaderboardResponse> {
    const page = query.page || 1;
    const limit = query.limit || 10; // Default 10 for "others" section
    const type = query.type || 'overall';
    const timePeriod = query.timePeriod || 'all-time';

    const allUsers = await this.calculateLeaderboard(type, page, 10000, timePeriod);
    
    // Always get top 3
    const top3 = allUsers.slice(0, 3);
    
    // Paginate the rest (starting from rank 4)
    const remainingUsers = allUsers.slice(3);
    const skip = (page - 1) * limit;
    const others = remainingUsers.slice(skip, skip + limit);
    
    // Find current user's position in the full leaderboard
    let currentUser = allUsers.find(u => u.userId === currentUserId);
    
    // If user not found in the leaderboard, fetch their rank separately
    if (!currentUser) {
      currentUser = await this.getCurrentUserRank(currentUserId, type, timePeriod);
    }

    return {
      type,
      timePeriod,
      top3,
      others,
      currentUser,
      pagination: {
        page,
        limit,
        total: remainingUsers.length, // Total users excluding top 3
        totalPages: Math.ceil(remainingUsers.length / limit),
        hasNext: skip + limit < remainingUsers.length,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Calculate leaderboard rankings
   */
  private static async calculateLeaderboard(
    type: string,
    page: number,
    limit: number,
    timePeriod: string = 'all-time'
  ) {
    const timeFilter = this.getTimeFilter(timePeriod);

    let users: any[] = [];

    switch (type) {
      case 'most-sessions':
        users = await prisma.cardGameSession.groupBy({
          by: ['userId'],
          where: timeFilter.gte ? { completedAt: { not: null, gte: timeFilter.gte } } : { completedAt: { not: null } },
          _count: { id: true },
          orderBy: { _count: { id: 'desc' } },
        }) as any;
        break;

      case 'most-feedback':
        users = await prisma.cardGameFeedback.groupBy({
          by: ['userId'],
          where: timeFilter.gte ? { createdAt: timeFilter } : {},
          _count: { id: true },
          orderBy: { _count: { id: 'desc' } },
        }) as any;
        break;

      case 'most-replies':
        users = await prisma.cardGameReply.groupBy({
          by: ['userId'],
          where: timeFilter.gte ? { createdAt: timeFilter } : {},
          _count: { id: true },
          orderBy: { _count: { id: 'desc' } },
        }) as any;
        break;

      case 'most-upvotes':
        users = await prisma.cardGameUpvote.groupBy({
          by: ['feedbackId'],
          where: timeFilter.gte ? { createdAt: timeFilter } : {},
        }) as any;
        // Group by feedback owner
        const feedbackIds = users.map(u => u.feedbackId);
        const upvoteFeedbackList = await prisma.cardGameFeedback.findMany({
          where: { id: { in: feedbackIds } },
          select: { userId: true, id: true },
        });
        const upvotesByUser = upvoteFeedbackList.reduce((acc: any, f) => {
          acc[f.userId] = (acc[f.userId] || 0) + 1;
          return acc;
        }, {});
        users = Object.entries(upvotesByUser).map(([userId, count]) => ({
          userId,
          _count: { id: count },
        }));
        break;

      case 'highest-rating':
        users = await prisma.cardGameFeedback.groupBy({
          by: ['userId'],
          where: timeFilter.gte ? { createdAt: timeFilter } : {},
          _avg: { rating: true },
          _count: { id: true },
          orderBy: { _avg: { rating: 'desc' } },
        }) as any;
        break;

      default: // overall
        // Calculate composite score
        const [sessionsData, feedbackData, repliesData, upvotesData] = await Promise.all([
          prisma.cardGameSession.groupBy({
            by: ['userId'],
            where: timeFilter.gte ? { completedAt: { not: null, gte: timeFilter.gte } } : { completedAt: { not: null } },
            _count: { id: true },
          }) as any,
          prisma.cardGameFeedback.groupBy({
            by: ['userId'],
            where: timeFilter.gte ? { createdAt: timeFilter } : {},
            _count: { id: true },
            _avg: { rating: true },
          }) as any,
          prisma.cardGameReply.groupBy({
            by: ['userId'],
            _count: { id: true },
          }) as any,
          prisma.cardGameUpvote.findMany({
            where: timeFilter.gte ? { createdAt: timeFilter } : {},
            select: { feedbackId: true },
          }),
        ]);

        // Get upvotes by user
        const upvoteFeedbackIds = upvotesData.map(u => u.feedbackId);
        const overallFeedbackList = await prisma.cardGameFeedback.findMany({
          where: { id: { in: upvoteFeedbackIds } },
          select: { userId: true },
        });
        const upvotesByUser2 = overallFeedbackList.reduce((acc: any, f) => {
          acc[f.userId] = (acc[f.userId] || 0) + 1;
          return acc;
        }, {});

        // Combine all metrics
        const userScores = new Map<string, number>();
        sessionsData.forEach((s: any) => {
          const current = userScores.get(s.userId) || 0;
          userScores.set(s.userId, current + s._count.id * 10); // 10 points per session
        });
        feedbackData.forEach((f: any) => {
          const current = userScores.get(f.userId) || 0;
          userScores.set(f.userId, current + (f._count?.id || 0) * 5); // 5 points per feedback
        });
        repliesData.forEach((r: any) => {
          const current = userScores.get(r.userId) || 0;
          userScores.set(r.userId, current + r._count.id * 3); // 3 points per reply
        });
        Object.entries(upvotesByUser2).forEach(([userId, count]: any) => {
          const current = userScores.get(userId) || 0;
          userScores.set(userId, current + count * 2); // 2 points per upvote
        });

        users = Array.from(userScores.entries())
          .map(([userId, score]) => ({ userId, score }))
          .sort((a, b) => b.score - a.score);
        break;
    }

    // Get user details
    const userIds = users.map((u: any) => u.userId);
    const userDetails = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        fullName: true,
        profile: {
          select: { profilePicture: true },
        },
      },
    });

    // Format response
    const formatted = await Promise.all(
      users.map(async (user: any, index: number) => {
        const userDetail = userDetails.find(u => u.id === user.userId);
        const breakdown = await this.getUserBreakdown(user.userId, timePeriod);

        return {
          rank: index + 1,
          userId: user.userId,
          fullName: userDetail?.fullName || 'Unknown',
          profilePicture: getProfilePictureUrl(userDetail?.profile?.profilePicture),
          score: user.score || user._count?.id || user._avg?.rating || 0,
          breakdown,
        };
      })
    );

    return formatted;
  }

  /**
   * Get current user's rank
   */
  private static async getCurrentUserRank(userId: string, type: string, timePeriod: string) {
    const allUsers = await this.calculateLeaderboard(type, 1, 10000, timePeriod);
    const userIndex = allUsers.findIndex(u => u.userId === userId);
    
    if (userIndex >= 0) {
      return allUsers[userIndex];
    }

    // User not in leaderboard - fetch user details
    const userDetail = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        profile: {
          select: { profilePicture: true },
        },
      },
    });

    const breakdown = await this.getUserBreakdown(userId, timePeriod);
    return {
      rank: allUsers.length + 1,
      userId,
      fullName: userDetail?.fullName || '',
      profilePicture: getProfilePictureUrl(userDetail?.profile?.profilePicture),
      score: 0,
      breakdown,
    };
  }

  /**
   * Get user breakdown stats
   */
  private static async getUserBreakdown(userId: string, timePeriod: string) {
    const timeFilter = this.getTimeFilter(timePeriod);

    const [sessions, feedback, replies, upvotes, feedbackData] = await Promise.all([
      prisma.cardGameSession.count({
        where: { userId, completedAt: { not: null, ...timeFilter } },
      }),
      prisma.cardGameFeedback.count({
        where: { userId, createdAt: timeFilter },
      }),
      prisma.cardGameReply.count({
        where: { userId, createdAt: timeFilter },
      }),
      prisma.cardGameUpvote.count({
        where: {
          cardGameFeedbacks: { userId },
          createdAt: timeFilter,
        },
      }),
      prisma.cardGameFeedback.findMany({
        where: { userId, createdAt: timeFilter },
        select: { rating: true },
      }),
    ]);

    const avgRating = feedbackData.length > 0
      ? feedbackData.reduce((sum, f) => sum + f.rating, 0) / feedbackData.length
      : 0;

    return {
      sessions,
      feedback,
      replies,
      upvotes,
      averageRating: parseFloat(avgRating.toFixed(2)),
    };
  }

  /**
   * Get time filter for queries
   */
  private static getTimeFilter(timePeriod: string) {
    const now = new Date();
    switch (timePeriod) {
      case 'weekly':
        return { gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
      case 'monthly':
        return { gte: new Date(now.getFullYear(), now.getMonth(), 1) };
      default:
        return {};
    }
  }

  // ============================================================================
  // POPULAR QUESTIONS ENDPOINTS
  // ============================================================================

  /**
   * Get popular questions with engagement scoring
   */
  static async getPopularQuestions(query: PopularQuestionsQuery): Promise<PopularQuestionsResponse> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const questions = await this.getPopularQuestionsWithEngagement(page, limit, query);
    const total = await this.getPopularQuestionsCount(query);

    return {
      data: questions,
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
   * Get popular questions with engagement calculation
   */
  private static async getPopularQuestionsWithEngagement(
    page: number = 1,
    limit: number = 20,
    query?: PopularQuestionsQuery
  ) {
    const timeFilter = query?.timePeriod ? this.getTimeFilter(query.timePeriod) : {};
    const skip = (page - 1) * limit;

    // Get questions with stats
    const whereClause: any = { isActive: true };
    if (query?.topicId) {
      whereClause.topicId = query.topicId;
    }

    const questions = await prisma.cardGameQuestion.findMany({
      where: whereClause,
      include: {
        topic: {
          select: { id: true, title: true },
        },
      },
    });

    // Calculate engagement for each question
    const questionsWithEngagement = await Promise.all(
      questions.map(async (question) => {
        const [feedbackCount, upvotes, replies, ratings] = await Promise.all([
          prisma.cardGameFeedback.count({
            where: { questionId: question.id, createdAt: timeFilter },
          }),
          prisma.cardGameUpvote.count({
            where: {
              cardGameFeedbacks: { questionId: question.id },
              createdAt: timeFilter,
            },
          }),
          prisma.cardGameReply.count({
            where: {
              cardGameFeedbacks: { questionId: question.id },
              createdAt: timeFilter,
            },
          }),
          prisma.cardGameFeedback.aggregate({
            where: { questionId: question.id, createdAt: timeFilter },
            _avg: { rating: true },
          }),
        ]);

        const avgRating = ratings._avg.rating || 0;
        
        // Engagement score: weighted formula
        const engagementScore =
          feedbackCount * 0.3 +
          upvotes * 0.3 +
          replies * 0.25 +
          avgRating * 0.15 * 100;

        // Get top comments
        const topComments = await prisma.cardGameFeedback.findMany({
          where: { questionId: question.id, comment: { not: null } },
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                profile: { select: { profilePicture: true } },
              },
            },
          },
          orderBy: { upvoteCount: 'desc' },
          take: 3,
        });

        return {
          id: question.id,
          questionText: question.questionText,
          topicId: question.topicId,
          topicTitle: question.topic.title,
          sessionNumber: question.sessionNumber,
          questionOrder: question.questionOrder,
          stats: {
            totalFeedback: feedbackCount,
            totalUpvotes: upvotes,
            totalReplies: replies,
            averageRating: parseFloat(avgRating.toFixed(2)),
            engagementScore: parseFloat(engagementScore.toFixed(2)),
          },
          topComments: topComments.map(c => ({
            id: c.id,
            comment: c.comment || '',
            upvoteCount: c.upvoteCount,
            user: {
              id: c.user.id,
              fullName: c.user.fullName,
              profilePicture: c.user.profile?.profilePicture,
            },
          })),
          hasMoreComments: feedbackCount > 3,
        };
      })
    );

    // Sort by engagement score
    const sortBy = query?.sortBy || 'engagement';
    questionsWithEngagement.sort((a, b) => {
      switch (sortBy) {
        case 'feedback':
          return b.stats.totalFeedback - a.stats.totalFeedback;
        case 'upvotes':
          return b.stats.totalUpvotes - a.stats.totalUpvotes;
        case 'replies':
          return b.stats.totalReplies - a.stats.totalReplies;
        case 'rating':
          return b.stats.averageRating - a.stats.averageRating;
        default:
          return b.stats.engagementScore - a.stats.engagementScore;
      }
    });

    return questionsWithEngagement.slice(skip, skip + limit);
  }

  /**
   * Get total count of popular questions
   */
  private static async getPopularQuestionsCount(query?: PopularQuestionsQuery) {
    const whereClause: any = { isActive: true };
    if (query?.topicId) {
      whereClause.topicId = query.topicId;
    }

    return await prisma.cardGameQuestion.count({ where: whereClause });
  }

  // ============================================================================
  // TOPIC DETAIL WITH LOCK/UNLOCK
  // ============================================================================

  /**
   * Get topic detail with lock/unlock logic
   */
  static async getTopicDetail(
    topicId: string,
    userId: string,
    sessionNumber?: number
  ): Promise<TopicDetailResponse> {
    const topic = await prisma.cardGameTopic.findUnique({
      where: { id: topicId },
    });

    if (!topic) {
      throw new AppError('Topic not found', 404);
    }

    const [userProgress, sessions, communityStats] = await Promise.all([
      this.getUserTopicProgress(userId, topicId),
      this.getSessionStatuses(userId, topicId),
      this.getCommunityTopicStats(topicId),
    ]);

    // Get current session detail if sessionNumber provided
    let currentSessionDetail = null;
    if (sessionNumber) {
      const sessionStatus = sessions.find(s => s.sessionNumber === sessionNumber);
      if (sessionStatus?.status === 'completed') {
        currentSessionDetail = await this.getSessionDetail(userId, topicId, sessionNumber);
      }
    }

    return {
      topic: {
        id: topic.id,
        title: topic.title,
        description: topic.description || undefined,
        gradient: topic.gradient || undefined,
        totalSessions: topic.totalSessions,
        totalQuestions: 0, // TODO: Calculate from questions
        isActive: topic.isActive,
      },
      userProgress,
      sessions,
      communityStats,
      currentSessionDetail,
    };
  }

  /**
   * Get user's topic progress
   */
  private static async getUserTopicProgress(userId: string, topicId: string) {
    const sessions = await prisma.cardGameSession.findMany({
      where: { userId, topicId, completedAt: { not: null } },
      select: { sessionNumber: true, completedAt: true },
      orderBy: { sessionNumber: 'asc' },
    });

    const topic = await prisma.cardGameTopic.findUnique({
      where: { id: topicId },
      select: { totalSessions: true },
    });

    const completedSessions = sessions.length;
    const totalSessions = topic?.totalSessions || 0;
    const progressPercentage = totalSessions > 0
      ? Math.round((completedSessions / totalSessions) * 100)
      : 0;
    const nextSessionNumber = completedSessions < totalSessions ? completedSessions + 1 : null;
    const lastCompleted = sessions[sessions.length - 1];

    return {
      completedSessions,
      totalSessions,
      progressPercentage,
      nextSessionNumber,
      lastCompletedAt: lastCompleted?.completedAt,
    };
  }

  /**
   * Get session statuses (completed/in-progress/locked)
   */
  private static async getSessionStatuses(userId: string, topicId: string) {
    const topic = await prisma.cardGameTopic.findUnique({
      where: { id: topicId },
      select: { totalSessions: true },
    });

    if (!topic) return [];

    const userSessions = await prisma.cardGameSession.findMany({
      where: { userId, topicId },
      select: {
        sessionNumber: true,
        status: true,
        completedAt: true,
        startedAt: true,
        questionsAnswered: true,
        totalQuestions: true,
        averageRating: true,
      },
    });

    // Get feedback data for completed sessions to calculate summary stats
    const completedSessionNumbers = userSessions
      .filter(s => s.completedAt)
      .map(s => s.sessionNumber);

    const userFeedbackBySessions = await prisma.cardGameFeedback.groupBy({
      by: ['sessionNumber'],
      where: {
        userId,
        topicId,
        sessionNumber: { in: completedSessionNumbers },
      },
      _count: {
        id: true,
        comment: true,
      },
      _sum: {
        upvoteCount: true,
      },
      _avg: {
        rating: true,
      },
    });

    // Get replies count for each completed session
    const repliesBySession = await Promise.all(
      completedSessionNumbers.map(async (sessionNum) => {
        const count = await prisma.cardGameReply.count({
          where: {
            cardGameFeedbacks: {
              userId,
              topicId,
              sessionNumber: sessionNum,
            },
          },
        });
        return { sessionNumber: sessionNum, repliesCount: count };
      })
    );

    // Get community averages for completed sessions
    const communityStatsBySessions = await prisma.cardGameFeedback.groupBy({
      by: ['sessionNumber'],
      where: {
        topicId,
        sessionNumber: { in: completedSessionNumbers },
      },
      _avg: {
        rating: true,
      },
    });

    const statuses = [];
    const questionsPerSession = 5; // Default, will be calculated from session questions

    for (let i = 1; i <= topic.totalSessions; i++) {
      const userSession = userSessions.find(s => s.sessionNumber === i);
      
      if (userSession?.completedAt) {
        const feedbackStats = userFeedbackBySessions.find(f => f.sessionNumber === i);
        const repliesData = repliesBySession.find(r => r.sessionNumber === i);
        const communityStats = communityStatsBySessions.find(c => c.sessionNumber === i);

        // Calculate percentile
        const yourPercentile = feedbackStats?._avg.rating
          ? await this.calculatePercentile(userId, topicId, i, feedbackStats._avg.rating)
          : 0;

        statuses.push({
          sessionNumber: i,
          status: 'completed' as const,
          completedAt: userSession.completedAt,
          questionsCount: questionsPerSession,
          yourAverageRating: userSession.averageRating || undefined,
          summary: {
            commentsGiven: feedbackStats?._count.comment || 0,
            upvotesReceived: feedbackStats?._sum.upvoteCount || 0,
            repliesReceived: repliesData?.repliesCount || 0,
            communityAverage: parseFloat((communityStats?._avg.rating || 0).toFixed(2)),
            yourPercentile,
          },
        });
      } else if (userSession?.status === 'in-progress') {
        statuses.push({
          sessionNumber: i,
          status: 'in-progress' as const,
          startedAt: userSession.startedAt,
          questionsCount: questionsPerSession,
          questionsAnswered: userSession.questionsAnswered,
          totalQuestions: userSession.totalQuestions,
        });
      } else {
        statuses.push({
          sessionNumber: i,
          status: 'locked' as const,
          questionsCount: questionsPerSession,
        });
      }
    }

    return statuses;
  }

  /**
   * Get community topic stats
   */
  private static async getCommunityTopicStats(topicId: string) {
    const [uniqueUsers, sessions, feedback, ratings] = await Promise.all([
      prisma.cardGameSession.findMany({
        where: { topicId, completedAt: { not: null } },
        distinct: ['userId'],
        select: { userId: true },
      }),
      prisma.cardGameSession.count({
        where: { topicId, completedAt: { not: null } },
      }),
      prisma.cardGameFeedback.count({ where: { topicId } }),
      prisma.cardGameFeedback.aggregate({
        where: { topicId },
        _avg: { rating: true },
      }),
    ]);

    return {
      totalUsers: uniqueUsers.length,
      totalSessions: sessions,
      totalFeedback: feedback,
      averageRating: parseFloat((ratings._avg.rating || 0).toFixed(2)),
    };
  }

  /**
   * Get session detail (questions with responses)
   */
  private static async getSessionDetail(userId: string, topicId: string, sessionNumber: number) {
    const session = await prisma.cardGameSession.findUnique({
      where: {
        userId_topicId_sessionNumber: { userId, topicId, sessionNumber },
      },
    });

    if (!session || !session.completedAt) {
      return null;
    }

    // Get user's feedback for this session
    const userFeedback = await prisma.cardGameFeedback.findMany({
      where: { userId, topicId, sessionNumber },
      include: {
        _count: {
          select: { cardGameUpvotes: true, cardGameReplies: true },
        },
      },
    });

    // Get questions
    const questions = await prisma.cardGameQuestion.findMany({
      where: { topicId, sessionNumber, isActive: true },
      orderBy: { questionOrder: 'asc' },
    });

    // Get community responses for each question
    const questionsWithResponses = await Promise.all(
      questions.map(async (question) => {
        const userResponse = userFeedback.find(f => f.questionId === question.id);
        
        const [stats, ratingDist, topResponses] = await Promise.all([
          prisma.cardGameFeedback.aggregate({
            where: { questionId: question.id },
            _count: { id: true },
            _avg: { rating: true },
          }),
          this.getRatingDistribution(question.id),
          prisma.cardGameFeedback.findMany({
            where: { questionId: question.id, comment: { not: null } },
            include: {
              user: {
                select: {
                  id: true,
                  fullName: true,
                  profile: { select: { profilePicture: true } },
                },
              },
              cardGameUpvotes: userId
                ? { where: { userId }, select: { userId: true } }
                : false,
            },
            orderBy: { upvoteCount: 'desc' },
            take: 10,
          }),
        ]);

        const upvotes = await prisma.cardGameUpvote.count({
          where: { cardGameFeedbacks: { questionId: question.id } },
        });

        const replies = await prisma.cardGameReply.count({
          where: { cardGameFeedbacks: { questionId: question.id } },
        });

        return {
          id: question.id,
          questionOrder: question.questionOrder,
          questionText: question.questionText,
          isLocked: false, // Unlocked since session is completed
          yourResponse: userResponse
            ? {
                feedbackId: userResponse.id,
                rating: userResponse.rating,
                comment: userResponse.comment || undefined,
                upvotesReceived: userResponse._count.cardGameUpvotes,
                repliesReceived: userResponse._count.cardGameReplies,
                createdAt: userResponse.createdAt,
                canEdit: true,
                canDelete: true,
              }
            : undefined,
          stats: {
            totalFeedback: stats._count.id,
            averageRating: parseFloat((stats._avg.rating || 0).toFixed(2)),
            totalUpvotes: upvotes,
            totalReplies: replies,
            ratingDistribution: ratingDist,
          },
          topCommunityResponses: topResponses.map(r => ({
            feedbackId: r.id,
            userId: r.userId,
            user: {
              fullName: r.user.fullName,
              profilePicture: r.user.profile?.profilePicture,
            },
            rating: r.rating,
            comment: r.comment || undefined,
            upvoteCount: r.upvoteCount,
            hasUpvoted: userId
              ? (r.cardGameUpvotes as any[])?.some((u: any) => u.userId === userId) || false
              : false,
            replyCount: 0, // TODO: Add reply count
            createdAt: r.createdAt,
          })),
          hasMoreResponses: stats._count.id > 10,
          totalResponses: stats._count.id,
        };
      })
    );

    // Calculate session stats
    const avgRating = userFeedback.length > 0
      ? userFeedback.reduce((sum, f) => sum + f.rating, 0) / userFeedback.length
      : 0;
    const commentsGiven = userFeedback.filter(f => f.comment).length;
    const upvotesReceived = userFeedback.reduce((sum, f) => sum + f._count.cardGameUpvotes, 0);
    const repliesReceived = userFeedback.reduce((sum, f) => sum + f._count.cardGameReplies, 0);

    // Get community average
    const communityAvg = await prisma.cardGameFeedback.aggregate({
      where: { topicId, sessionNumber },
      _avg: { rating: true },
    });

    const yourPercentile = await this.calculatePercentile(userId, topicId, sessionNumber, avgRating);

    return {
      sessionNumber,
      status: session.status || 'completed',
      completedAt: session.completedAt,
      yourStats: {
        questionsAnswered: userFeedback.length,
        yourAverageRating: parseFloat(avgRating.toFixed(2)),
        commentsGiven,
        upvotesReceived,
        repliesReceived,
      },
      sessionCommunityStats: {
        totalResponses: await prisma.cardGameFeedback.count({ where: { topicId, sessionNumber } }),
        communityAverage: parseFloat((communityAvg._avg.rating || 0).toFixed(2)),
        yourPercentile,
      },
      questions: questionsWithResponses,
    };
  }

  /**
   * Get rating distribution for a question
   */
  private static async getRatingDistribution(questionId: string) {
    const ratings = await prisma.cardGameFeedback.groupBy({
      by: ['rating'],
      where: { questionId },
      _count: { rating: true },
    });

    const distribution: any = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratings.forEach(r => {
      distribution[r.rating] = r._count.rating;
    });

    return distribution;
  }

  /**
   * Calculate user's percentile in a session
   */
  private static async calculatePercentile(
    userId: string,
    topicId: string,
    sessionNumber: number,
    userAvgRating: number
  ) {
    const allRatings = await prisma.cardGameFeedback.groupBy({
      by: ['userId'],
      where: { topicId, sessionNumber },
      _avg: { rating: true },
    });

    const ratingsBelow = allRatings.filter(r => (r._avg.rating || 0) < userAvgRating).length;
    const percentile = allRatings.length > 0
      ? Math.round((ratingsBelow / allRatings.length) * 100)
      : 50;

    return percentile;
  }

  // ============================================================================
  // NEW SESSION GAMEPLAY WITH TIMING
  // ============================================================================

  /**
   * Start a new session (enhanced version)
   */
  static async startSessionNew(
    userId: string,
    topicId: string,
    sessionNumber: number,
    deviceInfo?: { platform: string; os: string; appVersion: string }
  ): Promise<StartSessionResponse> {
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

    // Check if session already exists
    let session = await prisma.cardGameSession.findUnique({
      where: {
        userId_topicId_sessionNumber: { userId, topicId, sessionNumber },
      },
    });

    if (session?.completedAt) {
      throw new AppError('Session already completed', 409);
    }

    // Get questions for this session
    const questions = await prisma.cardGameQuestion.findMany({
      where: { topicId, sessionNumber, isActive: true },
      orderBy: { questionOrder: 'asc' },
    });

    if (questions.length === 0) {
      throw new AppError('No questions found for this session', 404);
    }

    // Create or update session
    if (!session) {
      session = await prisma.cardGameSession.create({
        data: {
          userId,
          topicId,
          sessionNumber,
          totalQuestions: questions.length,
          questionsAnswered: 0,
          status: 'in-progress',
          devicePlatform: deviceInfo?.platform,
          deviceOS: deviceInfo?.os,
          appVersion: deviceInfo?.appVersion,
          lastActivityAt: new Date(),
        },
      });
    } else {
      session = await prisma.cardGameSession.update({
        where: { id: session.id },
        data: {
          status: 'in-progress',
          lastActivityAt: new Date(),
        },
      });
    }

    // Get already answered questions
    const answeredFeedback = await prisma.cardGameFeedback.findMany({
      where: { userId, topicId, sessionNumber },
      select: { questionId: true, rating: true, comment: true, createdAt: true },
    });

    const questionsInfo = questions.map(q => {
      const answer = answeredFeedback.find(f => f.questionId === q.id);
      return {
        id: q.id,
        questionOrder: q.questionOrder,
        questionText: q.questionText,
        isActive: q.isActive,
        isAnswered: !!answer,
        yourAnswer: answer
          ? {
              rating: answer.rating,
              comment: answer.comment || undefined,
              submittedAt: answer.createdAt,
            }
          : undefined,
      };
    });

    const questionsAnswered = answeredFeedback.length;
    const percentage = questions.length > 0
      ? Math.round((questionsAnswered / questions.length) * 100)
      : 0;
    const lastAnsweredOrder = answeredFeedback.length > 0
      ? Math.max(...answeredFeedback.map(f => {
          const q = questions.find(qu => qu.id === f.questionId);
          return q?.questionOrder || 0;
        }))
      : null;
    const nextQuestionOrder = questionsInfo.find(q => !q.isAnswered)?.questionOrder;

    return {
      session: {
        id: session.id,
        userId: session.userId,
        topicId: session.topicId,
        topicTitle: topic.title,
        sessionNumber: session.sessionNumber,
        status: session.status || 'in-progress',
        startedAt: session.startedAt,
        completedAt: session.completedAt || undefined,
        totalQuestions: session.totalQuestions,
        questionsAnswered,
        totalDuration: session.totalDuration || undefined,
        totalDurationFormatted: session.totalDuration
          ? this.formatDuration(session.totalDuration)
          : undefined,
      },
      questions: questionsInfo,
      progress: {
        canResume: questionsAnswered > 0 && questionsAnswered < questions.length,
        lastAnsweredQuestion: lastAnsweredOrder,
        percentage,
        nextQuestionOrder,
        canContinue: questionsAnswered < questions.length,
      },
    };
  }

  /**
   * Submit answer with timing data
   */
  static async submitAnswerWithTiming(
    userId: string,
    sessionId: string,
    data: SubmitAnswerRequest
  ): Promise<SubmitAnswerResponse> {
    // Get session
    const session = await prisma.cardGameSession.findUnique({
      where: { id: sessionId },
      include: { topic: true },
    });

    if (!session) {
      throw new AppError('Session not found', 404);
    }

    if (session.userId !== userId) {
      throw new AppError('You can only submit answers to your own session', 403);
    }

    if (session.completedAt) {
      throw new AppError('Session already completed', 400);
    }

    // Validate timing
    if (data.timing.timeSpentSeconds < 10) {
      throw new AppError('Minimum time per question is 10 seconds', 400);
    }

    if (data.timing.timeSpentSeconds > 3600) {
      throw new AppError('Maximum time per question is 1 hour', 400);
    }

    // Validate rating
    if (data.rating < 1 || data.rating > 5) {
      throw new AppError('Rating must be between 1 and 5', 400);
    }

    // Get question
    const question = await prisma.cardGameQuestion.findUnique({
      where: { id: data.questionId },
    });

    if (!question) {
      throw new AppError('Question not found', 404);
    }

    // Check if already answered
    const existing = await prisma.cardGameFeedback.findFirst({
      where: {
        userId,
        questionId: data.questionId,
        topicId: session.topicId,
        sessionNumber: session.sessionNumber,
      },
    });

    if (existing) {
      throw new AppError('Question already answered', 409);
    }

    // Create feedback with timing data
    const feedback = await prisma.cardGameFeedback.create({
      data: {
        userId,
        topicId: session.topicId,
        topicTitle: session.topic.title,
        sessionNumber: session.sessionNumber,
        questionId: data.questionId,
        questionText: question.questionText,
        rating: data.rating,
        comment: data.comment || null,
        isHelpful: data.isHelpful !== undefined ? data.isHelpful : true,
        questionViewedAt: new Date(data.timing.questionViewedAt),
        answerStartedAt: new Date(data.timing.answerStartedAt),
        answerSubmittedAt: new Date(data.timing.answerSubmittedAt),
        timeSpentSeconds: data.timing.timeSpentSeconds,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            profile: { select: { profilePicture: true } },
          },
        },
        _count: {
          select: { cardGameUpvotes: true, cardGameReplies: true },
        },
      },
    });

    // Update session progress
    const questionsAnswered = await prisma.cardGameFeedback.count({
      where: { userId, topicId: session.topicId, sessionNumber: session.sessionNumber },
    });

    await prisma.cardGameSession.update({
      where: { id: sessionId },
      data: {
        questionsAnswered,
        lastActivityAt: new Date(),
      },
    });

    const percentage = session.totalQuestions > 0
      ? Math.round((questionsAnswered / session.totalQuestions) * 100)
      : 0;
    const canComplete = questionsAnswered >= session.totalQuestions;
    const nextQuestionOrder = canComplete ? null : data.questionOrder + 1;

    return {
      feedback: this.formatFeedback(feedback),
      sessionProgress: {
        sessionId,
        questionsAnswered,
        totalQuestions: session.totalQuestions,
        percentage,
        nextQuestionOrder,
        canComplete,
      },
    };
  }

  /**
   * Complete session with summary
   */
  static async completeSessionWithSummary(
    userId: string,
    sessionId: string,
    data: CompleteSessionRequestNew
  ): Promise<SessionSummaryResponse> {
    // Get session
    const session = await prisma.cardGameSession.findUnique({
      where: { id: sessionId },
      include: { topic: true },
    });

    if (!session) {
      throw new AppError('Session not found', 404);
    }

    if (session.userId !== userId) {
      throw new AppError('You can only complete your own session', 403);
    }

    if (session.completedAt) {
      throw new AppError('Session already completed', 400);
    }

    // Verify all questions answered
    const questionsAnswered = await prisma.cardGameFeedback.count({
      where: {
        userId,
        topicId: session.topicId,
        sessionNumber: session.sessionNumber,
      },
    });

    if (questionsAnswered < session.totalQuestions) {
      throw new AppError('All questions must be answered before completing session', 400);
    }

    // Calculate average rating
    const avgRating = await prisma.cardGameFeedback.aggregate({
      where: {
        userId,
        topicId: session.topicId,
        sessionNumber: session.sessionNumber,
      },
      _avg: { rating: true },
    });

    // Update session
    const completedSession = await prisma.cardGameSession.update({
      where: { id: sessionId },
      data: {
        completedAt: new Date(),
        status: 'completed',
        totalDuration: data.totalDuration,
        averageRating: avgRating._avg.rating || undefined,
        devicePlatform: data.deviceInfo?.platform || session.devicePlatform,
        deviceOS: data.deviceInfo?.os || session.deviceOS,
        appVersion: data.deviceInfo?.appVersion || session.appVersion,
      },
    });

    // Update streak
    await this.updateStreak(userId);

    // Check and unlock achievements
    const newAchievements = await this.checkAndUnlockAchievements(userId);

    // Generate summary
    const summary = await this.generateSessionSummary(
      userId,
      session.topicId,
      session.sessionNumber,
      completedSession,
      newAchievements
    );

    // Update topic statistics
    this.updateTopicStats(session.topicId).catch((err) => {
      logger.error(`Error updating topic stats:`, err);
    });

    return summary;
  }

  /**
   * Generate session summary
   */
  private static async generateSessionSummary(
    userId: string,
    topicId: string,
    sessionNumber: number,
    session: any,
    newAchievements: any[]
  ): Promise<SessionSummaryResponse> {
    // Get user's feedback for this session
    const feedback = await prisma.cardGameFeedback.findMany({
      where: { userId, topicId, sessionNumber },
      include: {
        _count: { select: { cardGameUpvotes: true, cardGameReplies: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Calculate user stats
    const avgRating = feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length;
    const commentsGiven = feedback.filter(f => f.comment).length;
    const avgTimePerQuestion = feedback
      .filter(f => f.timeSpentSeconds)
      .reduce((sum, f) => sum + (f.timeSpentSeconds || 0), 0) / feedback.length;
    const totalWords = feedback
      .filter(f => f.comment)
      .reduce((sum, f) => sum + (f.comment?.split(/\s+/).length || 0), 0);
    const longestResponse = Math.max(
      ...feedback.map(f => f.comment?.length || 0),
      0
    );
    const helpfulQuestionsCount = feedback.filter(f => f.isHelpful).length;

    // Get community comparison
    const communityAvg = await prisma.cardGameFeedback.aggregate({
      where: { topicId, sessionNumber },
      _avg: { rating: true },
      _count: { id: true },
    });

    const communityFeedback = await prisma.cardGameFeedback.groupBy({
      by: ['userId'],
      where: { topicId, sessionNumber },
      _avg: { rating: true },
    });

    const ratingsBelow = communityFeedback.filter(
      r => (r._avg.rating || 0) < avgRating
    ).length;
    const percentile = communityFeedback.length > 0
      ? Math.round((ratingsBelow / communityFeedback.length) * 100)
      : 50;

    const ratingDiff = avgRating - (communityAvg._avg.rating || 0);
    let comparison: 'above' | 'same' | 'slightly_above' | 'slightly_below' | 'below';
    if (Math.abs(ratingDiff) < 0.1) comparison = 'same';
    else if (ratingDiff > 0.5) comparison = 'above';
    else if (ratingDiff > 0) comparison = 'slightly_above';
    else if (ratingDiff < -0.5) comparison = 'below';
    else comparison = 'slightly_below';

    // Get community average comments
    const communityComments = await prisma.cardGameFeedback.aggregate({
      where: { topicId, sessionNumber, comment: { not: null } },
      _count: { id: true },
    });
    const communityAvgComments = communityFeedback.length > 0
      ? communityComments._count.id / communityFeedback.length
      : 0;

    const engagementMessage =
      commentsGiven > communityAvgComments
        ? 'You provided more detailed reflections than average'
        : commentsGiven === 0
        ? 'Try adding comments to share your thoughts'
        : 'Your engagement is on par with the community';

    // Get streak info
    const streak = await prisma.cardGameStreak.findUnique({
      where: { userId },
    });

    const streakMessage =
      (streak?.currentStreak || 0) > 1
        ? `${streak?.currentStreak} day streak! Keep it going! 🔥`
        : 'Complete another session tomorrow to start a streak';

    // Check if there's a next session
    const topic = await prisma.cardGameTopic.findUnique({
      where: { id: topicId },
    });
    const hasNextSession = sessionNumber < (topic?.totalSessions || 0);

    // Generate insights
    const insights = this.generatePersonalizedInsights(feedback, avgTimePerQuestion, commentsGiven);

    // Question breakdown
    const questionBreakdown = feedback.map(f => ({
      questionOrder: 0, // TODO: Get actual order
      questionText: f.questionText,
      yourRating: f.rating,
      timeSpent: f.timeSpentSeconds || 0,
      timeSpentFormatted: this.formatDuration(f.timeSpentSeconds || 0),
      commentLength: f.comment?.length || 0,
      hasComment: !!f.comment,
    }));

    return {
      summary: {
        session: {
          id: session.id,
          userId: session.userId,
          topicId: session.topicId,
          topicTitle: session.topic.title,
          sessionNumber: session.sessionNumber,
          status: session.status,
          startedAt: session.startedAt,
          completedAt: session.completedAt,
          totalQuestions: session.totalQuestions,
          questionsAnswered: feedback.length,
          totalDuration: session.totalDuration,
          totalDurationFormatted: session.totalDuration
            ? this.formatDuration(session.totalDuration)
            : undefined,
        },
        yourStats: {
          questionsAnswered: feedback.length,
          averageRating: parseFloat(avgRating.toFixed(2)),
          commentsGiven,
          averageTimePerQuestion: Math.round(avgTimePerQuestion),
          totalWords,
          longestResponse,
          helpfulQuestionsCount,
        },
        questionBreakdown,
        communityComparison: {
          totalCompletions: communityFeedback.length,
          yourRating: parseFloat(avgRating.toFixed(2)),
          communityAverage: parseFloat((communityAvg._avg.rating || 0).toFixed(2)),
          percentile,
          ratingDifference: parseFloat(ratingDiff.toFixed(2)),
          comparison,
          engagementComparison: {
            yourComments: commentsGiven,
            communityAverage: parseFloat(communityAvgComments.toFixed(1)),
            message: engagementMessage,
          },
        },
        achievements: newAchievements,
        streaks: {
          currentStreak: streak?.currentStreak || 0,
          longestStreak: streak?.longestStreak || 0,
          streakMessage,
          lastActiveDate: streak?.lastActiveDate,
        },
        nextSteps: {
          hasNextSession,
          nextSessionNumber: hasNextSession ? sessionNumber + 1 : undefined,
          nextSessionTitle: hasNextSession ? topic?.title : undefined,
          canStartNextSession: hasNextSession,
          unlocked: {
            communityInsights: true,
            message: 'You can now view community responses for this session',
          },
        },
        insights,
      },
    };
  }

  /**
   * Generate personalized insights
   */
  private static generatePersonalizedInsights(
    feedback: any[],
    avgTimePerQuestion: number,
    commentsGiven: number
  ) {
    const insights: any[] = [];

    // Reflection depth
    if (commentsGiven >= feedback.length * 0.8) {
      insights.push({
        type: 'reflection_depth',
        message: 'Excellent reflection depth! You provided thoughtful comments on most questions.',
      });
    } else if (commentsGiven < feedback.length * 0.3) {
      insights.push({
        type: 'reflection_depth',
        message: 'Try adding more comments to deepen your reflections and connect with others.',
      });
    }

    // Rating pattern
    const ratings = feedback.map(f => f.rating);
    const variance = this.calculateVariance(ratings);
    if (variance < 0.5) {
      insights.push({
        type: 'rating_pattern',
        message: 'Your ratings are consistent. Consider exploring a wider range of perspectives.',
      });
    }

    // Time investment
    if (avgTimePerQuestion > 120) {
      insights.push({
        type: 'time_investment',
        message: 'You took your time with each question - great for deep reflection!',
      });
    } else if (avgTimePerQuestion < 30) {
      insights.push({
        type: 'time_investment',
        message: 'Quick completion! Consider spending more time for deeper insights.',
      });
    }

    // Engagement level
    if (commentsGiven >= feedback.length * 0.9) {
      insights.push({
        type: 'engagement_level',
        message: 'Highly engaged! Your detailed responses add value to the community.',
      });
    }

    return insights;
  }

  /**
   * Calculate variance
   */
  private static calculateVariance(numbers: number[]) {
    if (numbers.length === 0) return 0;
    const mean = numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
    const squaredDiffs = numbers.map(n => Math.pow(n - mean, 2));
    return squaredDiffs.reduce((sum, n) => sum + n, 0) / numbers.length;
  }

  /**
   * Format duration in seconds to readable string
   */
  private static formatDuration(seconds: number): string {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes < 60) {
      return remainingSeconds > 0
        ? `${minutes}m ${remainingSeconds}s`
        : `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  }

  // ============================================================================
  // STREAK SYSTEM
  // ============================================================================

  /**
   * Update user's streak
   */
  private static async updateStreak(userId: string) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    let streak = await prisma.cardGameStreak.findUnique({
      where: { userId },
    });

    if (!streak) {
      // Create new streak
      streak = await prisma.cardGameStreak.create({
        data: {
          userId,
          currentStreak: 1,
          longestStreak: 1,
          lastActiveDate: today,
        },
      });
    } else {
      const lastActive = new Date(streak.lastActiveDate);
      const lastActiveDate = new Date(
        lastActive.getFullYear(),
        lastActive.getMonth(),
        lastActive.getDate()
      );

      const daysDiff = Math.floor(
        (today.getTime() - lastActiveDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysDiff === 0) {
        // Same day, no update
        return streak;
      } else if (daysDiff === 1) {
        // Consecutive day
        const newStreak = streak.currentStreak + 1;
        const newLongest = Math.max(newStreak, streak.longestStreak);
        streak = await prisma.cardGameStreak.update({
          where: { userId },
          data: {
            currentStreak: newStreak,
            longestStreak: newLongest,
            lastActiveDate: today,
          },
        });
      } else {
        // Streak broken
        streak = await prisma.cardGameStreak.update({
          where: { userId },
          data: {
            currentStreak: 1,
            lastActiveDate: today,
          },
        });
      }
    }

    return streak;
  }

  // ============================================================================
  // ACHIEVEMENT SYSTEM
  // ============================================================================

  /**
   * Check and unlock achievements
   */
  private static async checkAndUnlockAchievements(userId: string) {
    // Get all achievements
    const allAchievements = await prisma.cardGameAchievement.findMany();

    // Get user's unlocked achievements
    const unlockedAchievements = await prisma.userCardGameAchievement.findMany({
      where: { userId },
      select: { achievementId: true },
    });

    const unlockedIds = new Set(unlockedAchievements.map(a => a.achievementId));
    const newlyUnlocked: any[] = [];

    for (const achievement of allAchievements) {
      if (unlockedIds.has(achievement.id)) continue;

      const criteria = achievement.criteria as any;
      const unlocked = await this.checkAchievementCriteria(userId, criteria);

      if (unlocked) {
        await prisma.userCardGameAchievement.create({
          data: {
            userId,
            achievementId: achievement.id,
          },
        });

        newlyUnlocked.push({
          id: achievement.id,
          code: achievement.code,
          title: achievement.title,
          description: achievement.description,
          icon: achievement.icon,
          isNew: true,
          unlockedAt: new Date(),
        });
      }
    }

    return newlyUnlocked;
  }

  /**
   * Check if achievement criteria is met
   */
  private static async checkAchievementCriteria(userId: string, criteria: any): Promise<boolean> {
    try {
      switch (criteria.type) {
        case 'sessions_completed':
          const sessionsCount = await prisma.cardGameSession.count({
            where: { userId, completedAt: { not: null } },
          });
          return sessionsCount >= criteria.value;

        case 'feedback_count':
          const feedbackCount = await prisma.cardGameFeedback.count({
            where: { userId },
          });
          return feedbackCount >= criteria.value;

        case 'streak_days':
          const streak = await prisma.cardGameStreak.findUnique({
            where: { userId },
          });
          return (streak?.currentStreak || 0) >= criteria.value;

        case 'upvotes_received':
          const upvotes = await prisma.cardGameUpvote.count({
            where: { cardGameFeedbacks: { userId } },
          });
          return upvotes >= criteria.value;

        case 'topics_completed':
          const topics = await prisma.cardGameSession.findMany({
            where: { userId, completedAt: { not: null } },
            distinct: ['topicId'],
          });
          return topics.length >= criteria.value;

        default:
          return false;
      }
    } catch (error) {
      logger.error('Error checking achievement criteria:', error);
      return false;
    }
  }

  // ============================================================================
  // DETAILED STATS ENDPOINT
  // ============================================================================

  /**
   * Get detailed user stats
   */
  static async getDetailedStats(
    userId: string,
    query: DetailedStatsQuery
  ): Promise<DetailedStatsResponse> {
    const timePeriod = query.timePeriod || 'all-time';
    const timeFilter = this.getTimeFilter(timePeriod);

    // Get summary stats
    const summary = await this.getUserStatsSummary(userId);

    // Get session completion rate
    const [started, completed] = await Promise.all([
      prisma.cardGameSession.count({ where: { userId } }),
      prisma.cardGameSession.count({ where: { userId, completedAt: { not: null } } }),
    ]);
    const completionRate = started > 0 ? (completed / started) * 100 : 0;

    // Get rating distribution
    const ratingDist = await prisma.cardGameFeedback.groupBy({
      by: ['rating'],
      where: { userId, createdAt: timeFilter },
      _count: { rating: true },
    });

    // Get top topics
    const topTopics = await prisma.cardGameSession.groupBy({
      by: ['topicId'],
      where: { userId, completedAt: { not: null, ...timeFilter } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5,
    });

    const topTopicsWithDetails = await Promise.all(
      topTopics.map(async (t) => {
        const topic = await prisma.cardGameTopic.findUnique({
          where: { id: t.topicId },
        });
        const avgRating = await prisma.cardGameFeedback.aggregate({
          where: { userId, topicId: t.topicId },
          _avg: { rating: true },
        });
        const lastSession = await prisma.cardGameSession.findFirst({
          where: { userId, topicId: t.topicId, completedAt: { not: null } },
          orderBy: { completedAt: 'desc' },
        });

        return {
          topicId: t.topicId,
          topicTitle: topic?.title || 'Unknown',
          sessionsCompleted: t._count.id,
          averageRating: parseFloat((avgRating._avg.rating || 0).toFixed(2)),
          lastActivity: lastSession?.completedAt || new Date(),
        };
      })
    );

    // Get engagement timeline (last 30 days)
    const timeline: any[] = [];
    // TODO: Implement timeline calculation

    // Get achievements
    const userAchievements = await prisma.userCardGameAchievement.findMany({
      where: { userId },
      include: { achievement: true },
      orderBy: { unlockedAt: 'desc' },
    });

    const achievements = userAchievements.map(ua => ({
      id: ua.achievement.id,
      code: ua.achievement.code,
      title: ua.achievement.title,
      description: ua.achievement.description,
      icon: ua.achievement.icon,
      isNew: false,
      unlockedAt: ua.unlockedAt,
    }));

    // Get streak
    const streak = await prisma.cardGameStreak.findUnique({
      where: { userId },
    });

    // Calculate community rank percentile
    const communityRankPercentile = 50; // TODO: Calculate actual percentile

    return {
      userId,
      timePeriod,
      summary: summary.summary,
      sessionCompletionRate: {
        completed,
        started,
        rate: parseFloat(completionRate.toFixed(2)),
      },
      ratingDistribution: ratingDist.map(r => ({
        rating: r.rating,
        count: r._count.rating,
      })),
      topTopics: topTopicsWithDetails,
      engagementTimeline: timeline,
      achievements,
      streaks: {
        currentStreak: streak?.currentStreak || 0,
        longestStreak: streak?.longestStreak || 0,
        streakMessage: '',
        lastActiveDate: streak?.lastActiveDate,
      },
      communityRankPercentile,
    };
  }

  /**
   * Get community feedback for a specific question with session lock (unlocked after completion)
   */
  static async getQuestionFeedbackWithLock(
    userId: string,
    topicId: string,
    sessionNumber: number,
    questionId: string,
    options: {
      page?: number;
      limit?: number;
      sortBy?: 'upvotes' | 'recent' | 'rating' | 'replies';
      minRating?: number;
      hasComments?: boolean;
    } = {}
  ) {
    // Check if user has completed this session
    const session = await prisma.cardGameSession.findFirst({
      where: {
        userId,
        topicId,
        sessionNumber,
        status: 'completed',
      },
    });

    if (!session) {
      throw new AppError('You must complete this session to view community responses', 403);
    }

    // Get question details
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

    if (!question || question.topicId !== topicId || question.sessionNumber !== sessionNumber) {
      throw new AppError('Question not found', 404);
    }

    // Get user's own response
    const yourResponse = await prisma.cardGameFeedback.findFirst({
      where: {
        userId,
        topicId,
        sessionNumber,
        questionId,
      },
      include: {
        cardGameUpvotes: {
          select: { userId: true },
        },
        cardGameReplies: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    // Build query filters
    const where: any = {
      topicId,
      sessionNumber,
      questionId,
    };

    if (options.minRating) {
      where.rating = { gte: options.minRating };
    }

    if (options.hasComments) {
      where.comment = { not: null };
    }

    // Get total count
    const totalFeedback = await prisma.cardGameFeedback.count({ where });

    // Build orderBy based on sortBy option
    let orderBy: any = { createdAt: 'desc' }; // default: recent

    if (options.sortBy === 'upvotes') {
      orderBy = { upvoteCount: 'desc' }; // Use cached field
    } else if (options.sortBy === 'rating') {
      orderBy = { rating: 'desc' };
    } else if (options.sortBy === 'replies') {
      orderBy = { cardGameReplies: { _count: 'desc' } };
    }

    // Pagination
    const page = options.page || 1;
    const limit = options.limit || 20;
    const skip = (page - 1) * limit;

    // Get feedback with pagination
    const feedback = await prisma.cardGameFeedback.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
          },
        },
        cardGameUpvotes: {
          select: { userId: true },
        },
        cardGameReplies: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
          take: 3, // Show only top 3 replies
        },
      },
      orderBy,
      skip,
      take: limit,
    });

    // Get question stats
    const allFeedback = await prisma.cardGameFeedback.findMany({
      where: {
        topicId,
        sessionNumber,
        questionId,
      },
      select: {
        rating: true,
        upvoteCount: true,
        cardGameReplies: {
          select: { id: true },
        },
      },
    });

    const totalUpvotes = allFeedback.reduce((sum, f) => sum + f.upvoteCount, 0);
    const totalReplies = allFeedback.reduce((sum, f) => sum + f.cardGameReplies.length, 0);
    const averageRating = allFeedback.length > 0
      ? allFeedback.reduce((sum, f) => sum + f.rating, 0) / allFeedback.length
      : 0;

    // Rating distribution
    const ratingDistribution = {
      1: allFeedback.filter(f => f.rating === 1).length,
      2: allFeedback.filter(f => f.rating === 2).length,
      3: allFeedback.filter(f => f.rating === 3).length,
      4: allFeedback.filter(f => f.rating === 4).length,
      5: allFeedback.filter(f => f.rating === 5).length,
    };

    // Transform feedback data
    const transformedFeedback = feedback.map(f => ({
      id: f.id,
      userId: f.userId,
      user: f.user,
      rating: f.rating,
      comment: f.comment,
      upvoteCount: f.upvoteCount,
      hasUpvoted: f.cardGameUpvotes.some(u => u.userId === userId),
      replyCount: f.cardGameReplies.length,
      replies: f.cardGameReplies.map(r => ({
        id: r.id,
        userId: r.userId,
        user: r.user,
        text: r.text,
        createdAt: r.createdAt,
      })),
      createdAt: f.createdAt,
    }));

    return {
      question: {
        id: question.id,
        questionText: question.questionText,
        topicId: question.topicId,
        topicTitle: question.topic.title,
        sessionNumber: question.sessionNumber,
        questionOrder: question.questionOrder,
      },
      yourResponse: yourResponse ? {
        id: yourResponse.id,
        rating: yourResponse.rating,
        comment: yourResponse.comment,
        upvoteCount: yourResponse.upvoteCount,
        hasUpvoted: yourResponse.cardGameUpvotes.some(u => u.userId === userId),
        replyCount: yourResponse.cardGameReplies.length,
        replies: yourResponse.cardGameReplies,
        createdAt: yourResponse.createdAt,
      } : null,
      stats: {
        totalFeedback: allFeedback.length,
        averageRating: parseFloat(averageRating.toFixed(2)),
        totalUpvotes,
        totalReplies,
        ratingDistribution,
      },
      feedback: transformedFeedback,
      pagination: {
        page,
        limit,
        total: totalFeedback,
        totalPages: Math.ceil(totalFeedback / limit),
        hasNext: page < Math.ceil(totalFeedback / limit),
        hasPrev: page > 1,
      },
    };
  }
}


