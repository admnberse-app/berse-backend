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

      // Update topic statistics
      await updateTopicStats(topicId);

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
      const { feedbackId } = req.params;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      // Check if feedback belongs to user
      const feedback = await prisma.cardGameFeedback.findFirst({
        where: { 
          id: feedbackId,
          userId 
        },
      });

      if (!feedback) {
        throw new AppError('Feedback not found or access denied', 404);
      }

      // Delete feedback
      await prisma.cardGameFeedback.delete({
        where: { id: feedbackId },
      });

      // Update topic statistics
      await updateTopicStats(feedback.topicId);

      sendSuccess(res, null, 'Feedback deleted successfully');
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