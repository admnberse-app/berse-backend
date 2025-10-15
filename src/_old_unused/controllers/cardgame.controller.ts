import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { sendSuccess, sendError } from '../utils/response';
import { AppError } from '../middleware/error';
import { AuthRequest } from '../types';

export class CardGameController {
  // Submit feedback for a question
  static async submitFeedback(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const { topicId, sessionNumber, questionId, rating, comment } = req.body;

      // Validate input
      if (!topicId || !sessionNumber || !questionId || !rating) {
        throw new AppError('Missing required fields', 400);
      }

      if (rating < 1 || rating > 5) {
        throw new AppError('Rating must be between 1 and 5', 400);
      }

      // Create feedback
      const feedback = await prisma.cardGameFeedback.create({
        data: {
          userId,
          topicId,
          sessionNumber,
          questionId,
          rating,
          comment: comment || null,
        },
      });

      // Update topic statistics asynchronously (don't wait for it)
      updateTopicStats(topicId).catch(err => {
        console.error('Error updating topic stats:', err);
      });

      sendSuccess(res, feedback, 'Feedback submitted successfully');
    } catch (error) {
      next(error);
    }
  }

  // Get all feedback for a user
  static async getUserFeedback(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const feedback = await prisma.cardGameFeedback.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });

      sendSuccess(res, feedback, 'User feedback retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  // Get feedback for a specific topic
  static async getTopicFeedback(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { topicId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const feedback = await prisma.cardGameFeedback.findMany({
        where: { 
          topicId,
          userId 
        },
        orderBy: { createdAt: 'desc' },
      });

      sendSuccess(res, feedback, 'Topic feedback retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  // Get statistics for all topics
  static async getTopicStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await prisma.cardGameStats.findMany({
        orderBy: { averageRating: 'desc' },
      });

      sendSuccess(res, stats, 'Topic statistics retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  // Delete feedback
  static async deleteFeedback(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      const userEmail = req.user?.email;
      const { feedbackId } = req.params;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      // Check if user is admin
      const isAdmin = userEmail === 'zaydmahdaly@ahlumran.org' || req.user?.role === 'ADMIN';

      // Find the feedback
      const feedback = await prisma.cardGameFeedback.findFirst({
        where: { 
          id: feedbackId
        },
      });

      if (!feedback) {
        throw new AppError('Feedback not found', 404);
      }

      // Check if user owns the feedback or is admin
      if (feedback.userId !== userId && !isAdmin) {
        throw new AppError('Access denied', 403);
      }

      // Delete feedback
      await prisma.cardGameFeedback.delete({
        where: { id: feedbackId },
      });

      // Update topic statistics asynchronously (don't wait for it)
      updateTopicStats(feedback.topicId).catch(err => {
        console.error('Error updating topic stats after deletion:', err);
      });

      sendSuccess(res, null, 'Feedback deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  // Get all feedback for a topic (public/community view)
  static async getAllTopicFeedback(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { topicId } = req.params;
      const userId = req.user?.id;
      
      const feedback = await prisma.cardGameFeedback.findMany({
        where: {
          topicId
        },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              profilePicture: true
            }
          },
          upvotes: {
            select: {
              userId: true
            }
          },
          replies: {
            include: {
              user: {
                select: {
                  id: true,
                  fullName: true,
                  profilePicture: true
                }
              }
            },
            orderBy: {
              createdAt: 'asc'
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      // Transform data to include upvote counts and user's upvote status
      const transformedFeedback = feedback.map(item => ({
        ...item,
        upvoteCount: item.upvotes.length,
        hasUpvoted: userId ? item.upvotes.some(upvote => upvote.userId === userId) : false
      }));

      sendSuccess(res, transformedFeedback, 'All topic feedback retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  // Toggle upvote on feedback
  static async toggleUpvote(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { feedbackId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      // Check if user already upvoted
      const existingUpvote = await prisma.cardGameUpvote.findUnique({
        where: {
          userId_feedbackId: {
            userId,
            feedbackId
          }
        }
      });

      if (existingUpvote) {
        // Remove upvote
        await prisma.cardGameUpvote.delete({
          where: {
            id: existingUpvote.id
          }
        });

        sendSuccess(res, { hasUpvoted: false }, 'Upvote removed');
      } else {
        // Add upvote
        await prisma.cardGameUpvote.create({
          data: {
            userId,
            feedbackId
          }
        });

        sendSuccess(res, { hasUpvoted: true }, 'Upvote added');
      }
    } catch (error) {
      next(error);
    }
  }

  // Add reply to feedback
  static async addReply(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { feedbackId } = req.params;
      const { text } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      if (!text || text.trim().length === 0) {
        throw new AppError('Reply text is required', 400);
      }

      const reply = await prisma.cardGameReply.create({
        data: {
          userId,
          feedbackId,
          text: text.trim()
        },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              profilePicture: true
            }
          }
        }
      });

      sendSuccess(res, reply, 'Reply added successfully');
    } catch (error) {
      next(error);
    }
  }
}

// Helper function to update topic statistics
async function updateTopicStats(topicId: string): Promise<void> {
  try {
    // Get all feedback for this topic
    const feedbacks = await prisma.cardGameFeedback.findMany({
      where: { topicId },
      select: { rating: true },
    });

    if (feedbacks.length === 0) {
      // Delete stats if no feedback exists
      await prisma.cardGameStats.deleteMany({
        where: { topicId },
      });
      return;
    }

    // Calculate statistics
    const totalFeedback = feedbacks.length;
    const totalRating = feedbacks.reduce((sum, f) => sum + f.rating, 0);
    const averageRating = totalRating / totalFeedback;

    // Count unique sessions
    const uniqueSessions = await prisma.cardGameFeedback.findMany({
      where: { topicId },
      select: { sessionNumber: true, userId: true },
      distinct: ['sessionNumber', 'userId'],
    });

    // Update or create stats
    await prisma.cardGameStats.upsert({
      where: { topicId },
      update: {
        totalSessions: uniqueSessions.length,
        averageRating,
        totalFeedback,
      },
      create: {
        topicId,
        totalSessions: uniqueSessions.length,
        averageRating,
        totalFeedback,
      },
    });
  } catch (error) {
    console.error('Error updating topic stats:', error);
  }
}