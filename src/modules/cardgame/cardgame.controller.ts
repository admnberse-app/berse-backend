import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../types';
import { CardGameService } from './cardgame.service';
import { sendSuccess } from '../../utils/response';
import {
  SubmitFeedbackRequest,
  UpdateFeedbackRequest,
  AddReplyRequest,
  FeedbackQuery,
} from './cardgame.types';
import logger from '../../utils/logger';

export class CardGameController {
  
  // ============================================================================
  // FEEDBACK ENDPOINTS
  // ============================================================================
  
  /**
   * Submit feedback for a card game question
   * @route POST /v2/cardgame/feedback
   */
  static async submitFeedback(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const data: SubmitFeedbackRequest = req.body;

      const feedback = await CardGameService.submitFeedback(userId, data);

      logger.info(`Feedback submitted: ${feedback.id} by user ${userId}`);
      sendSuccess(res, feedback, 'Feedback submitted successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all feedback with filters
   * @route GET /v2/cardgame/feedback
   */
  static async getFeedback(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      const query: FeedbackQuery = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
        sortBy: req.query.sortBy as any,
        sortOrder: req.query.sortOrder as any,
        filters: {
          topicId: req.query.topicId as string,
          userId: req.query.userId as string,
          sessionNumber: req.query.sessionNumber ? parseInt(req.query.sessionNumber as string) : undefined,
          questionId: req.query.questionId as string,
          minRating: req.query.minRating ? parseInt(req.query.minRating as string) : undefined,
          maxRating: req.query.maxRating ? parseInt(req.query.maxRating as string) : undefined,
          hasComments: req.query.hasComments === 'true' ? true : req.query.hasComments === 'false' ? false : undefined,
          startDate: req.query.startDate as string,
          endDate: req.query.endDate as string,
        },
      };

      const result = await CardGameService.getFeedback(query, userId);

      sendSuccess(res, result, 'Feedback retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get feedback by ID
   * @route GET /v2/cardgame/feedback/:id
   */
  static async getFeedbackById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      const feedback = await CardGameService.getFeedbackById(id, userId);

      sendSuccess(res, feedback, 'Feedback retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update feedback
   * @route PATCH /v2/cardgame/feedback/:id
   */
  static async updateFeedback(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const data: UpdateFeedbackRequest = req.body;

      const feedback = await CardGameService.updateFeedback(id, userId, data);

      logger.info(`Feedback updated: ${id} by user ${userId}`);
      sendSuccess(res, feedback, 'Feedback updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete feedback
   * @route DELETE /v2/cardgame/feedback/:id
   */
  static async deleteFeedback(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      await CardGameService.deleteFeedback(id, userId);

      logger.info(`Feedback deleted: ${id} by user ${userId}`);
      sendSuccess(res, null, 'Feedback deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  // ============================================================================
  // UPVOTE ENDPOINTS
  // ============================================================================

  /**
   * Toggle upvote on feedback
   * @route POST /v2/cardgame/feedback/:id/upvote
   */
  static async toggleUpvote(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const result = await CardGameService.toggleUpvote(id, userId);

      logger.info(`Upvote toggled on feedback ${id} by user ${userId}: ${result.hasUpvoted}`);
      sendSuccess(res, result, result.hasUpvoted ? 'Upvote added' : 'Upvote removed');
    } catch (error) {
      next(error);
    }
  }

  // ============================================================================
  // REPLY ENDPOINTS
  // ============================================================================

  /**
   * Add reply to feedback
   * @route POST /v2/cardgame/feedback/:id/replies
   */
  static async addReply(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const data: AddReplyRequest = req.body;

      const reply = await CardGameService.addReply(id, userId, data);

      logger.info(`Reply added to feedback ${id} by user ${userId}`);
      sendSuccess(res, reply, 'Reply added successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete reply
   * @route DELETE /v2/cardgame/replies/:id
   */
  static async deleteReply(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      await CardGameService.deleteReply(id, userId);

      logger.info(`Reply deleted: ${id} by user ${userId}`);
      sendSuccess(res, null, 'Reply deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  // ============================================================================
  // STATISTICS ENDPOINTS
  // ============================================================================

  /**
   * Get topic statistics
   * @route GET /v2/cardgame/stats/topics/:topicId
   */
  static async getTopicStats(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { topicId } = req.params;

      const stats = await CardGameService.getTopicStats(topicId);

      sendSuccess(res, stats, 'Topic statistics retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all topics statistics
   * @route GET /v2/cardgame/stats/topics
   */
  static async getAllTopicsStats(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await CardGameService.getAllTopicsStats();

      sendSuccess(res, stats, 'All topics statistics retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get detailed topic analytics
   * @route GET /v2/cardgame/analytics/topics/:topicId
   */
  static async getTopicAnalytics(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { topicId } = req.params;

      const analytics = await CardGameService.getTopicAnalytics(topicId);

      sendSuccess(res, analytics, 'Topic analytics retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user statistics
   * @route GET /v2/cardgame/stats/users/:userId
   * @route GET /v2/cardgame/stats/me (for current user)
   */
  static async getUserStats(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.params.userId || req.user!.id;

      const stats = await CardGameService.getUserStats(userId);

      sendSuccess(res, stats, 'User statistics retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}
