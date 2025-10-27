import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../types';
import { CardGameService } from './cardgame.service';
import { sendSuccess } from '../../utils/response';
import {
  SubmitFeedbackRequest,
  UpdateFeedbackRequest,
  AddReplyRequest,
  FeedbackQuery,
  CreateTopicRequest,
  UpdateTopicRequest,
  CreateQuestionRequest,
  UpdateQuestionRequest,
  StartSessionRequest,
  CompleteSessionRequest,
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

  /**
   * Reply to another reply (nested reply)
   * @route POST /v2/cardgame/replies/:id/replies
   */
  static async replyToReply(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const data: AddReplyRequest = req.body;

      const reply = await CardGameService.replyToReply(id, userId, data);

      logger.info(`Nested reply added to reply ${id} by user ${userId}`);
      sendSuccess(res, reply, 'Reply added successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Toggle upvote on a reply
   * @route POST /v2/cardgame/replies/:id/upvote
   */
  static async toggleReplyUpvote(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const result = await CardGameService.toggleReplyUpvote(id, userId);

      logger.info(`Upvote toggled on reply ${id} by user ${userId}: ${result.hasUpvoted}`);
      sendSuccess(res, result, result.hasUpvoted ? 'Upvote added' : 'Upvote removed');
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

  // ============================================================================
  // TOPIC ENDPOINTS
  // ============================================================================

  /**
   * Get all topics
   * @route GET /v2/cardgame/topics
   */
  static async getTopics(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const activeOnly = req.query.activeOnly === 'true';
      const includeStats = req.query.includeStats !== 'false'; // Default to true
      const topics = await CardGameService.getTopics(includeStats, activeOnly);

      sendSuccess(res, topics, 'Topics retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get topic by ID
   * @route GET /v2/cardgame/topics/:topicId
   */
  static async getTopicById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { topicId } = req.params;
      const topic = await CardGameService.getTopicById(topicId);

      sendSuccess(res, topic, 'Topic retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create new topic (Admin only)
   * @route POST /v2/cardgame/admin/topics
   */
  static async createTopic(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data: CreateTopicRequest = req.body;
      const topic = await CardGameService.createTopic(data);

      logger.info(`Topic created: ${topic.id} by admin ${req.user!.id}`);
      sendSuccess(res, topic, 'Topic created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update topic (Admin only)
   * @route PATCH /v2/cardgame/admin/topics/:id
   */
  static async updateTopic(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const data: UpdateTopicRequest = req.body;
      const topic = await CardGameService.updateTopic(id, data);

      logger.info(`Topic updated: ${id} by admin ${req.user!.id}`);
      sendSuccess(res, topic, 'Topic updated successfully');
    } catch (error) {
      next(error);
    }
  }

  // ============================================================================
  // QUESTION ENDPOINTS
  // ============================================================================

  /**
   * Get questions for a topic session
   * @route GET /v2/cardgame/topics/:topicId/sessions/:sessionNumber/questions
   */
  static async getSessionQuestions(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { topicId, sessionNumber } = req.params;
      const sessionNum = parseInt(sessionNumber);
      const activeOnly = req.query.activeOnly === 'true';

      const questions = await CardGameService.getSessionQuestions(topicId, sessionNum, activeOnly);

      sendSuccess(res, questions, 'Session questions retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create new question (Admin only)
   * @route POST /v2/cardgame/admin/questions
   */
  static async createQuestion(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data: CreateQuestionRequest = req.body;
      const question = await CardGameService.createQuestion(data);

      logger.info(`Question created: ${question.id} for topic ${data.topicId} by admin ${req.user!.id}`);
      sendSuccess(res, question, 'Question created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update question (Admin only)
   * @route PATCH /v2/cardgame/admin/questions/:id
   */
  static async updateQuestion(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const data: UpdateQuestionRequest = req.body;
      const question = await CardGameService.updateQuestion(id, data);

      logger.info(`Question updated: ${id} by admin ${req.user!.id}`);
      sendSuccess(res, question, 'Question updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete question (Admin only) - Soft delete
   * @route DELETE /v2/cardgame/admin/questions/:id
   */
  static async deleteQuestion(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await CardGameService.deleteQuestion(id);

      logger.info(`Question soft deleted: ${id} by admin ${req.user!.id}`);
      sendSuccess(res, null, 'Question deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  // ============================================================================
  // SESSION ENDPOINTS
  // ============================================================================

  /**
   * Start a new session
   * @route POST /v2/cardgame/sessions/start
   */
  static async startSession(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const data: StartSessionRequest = req.body;

      const session = await CardGameService.startSession(userId, data);

      logger.info(`Session started: ${session.id} for user ${userId}, topic ${data.topicId}, session ${data.sessionNumber}`);
      sendSuccess(res, session, 'Session started successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Complete a session
   * @route PATCH /v2/cardgame/sessions/:id/complete
   */
  static async completeSession(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const data: CompleteSessionRequest = req.body;

      const session = await CardGameService.completeSession(id, userId, data);

      logger.info(`Session completed: ${id} by user ${userId}`);
      sendSuccess(res, session, 'Session completed successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get incomplete sessions for current user
   * @route GET /v2/cardgame/sessions/incomplete
   */
  static async getIncompleteSessions(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const sessions = await CardGameService.getIncompleteSessions(userId);

      sendSuccess(res, sessions, 'Incomplete sessions retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all sessions for current user
   * @route GET /v2/cardgame/users/me/sessions
   */
  static async getUserSessions(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const topicId = req.query.topicId as string | undefined;

      const sessions = await CardGameService.getUserSessions(userId, topicId);

      sendSuccess(res, sessions, 'User sessions retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get session progress
   * @route GET /v2/cardgame/sessions/:id/progress
   */
  static async getSessionProgress(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const progress = await CardGameService.getSessionProgress(id, userId);

      sendSuccess(res, progress, 'Session progress retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get session summary
   * @route GET /v2/cardgame/sessions/:topicId/:sessionNumber/summary
   */
  static async getSessionSummary(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { topicId, sessionNumber } = req.params;
      const userId = req.user!.id;
      const sessionNum = parseInt(sessionNumber);

      const summary = await CardGameService.getSessionSummary(userId, topicId, sessionNum);

      sendSuccess(res, summary, 'Session summary retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  // ============================================================================
  // QUESTION ENDPOINTS
  // ============================================================================

  /**
   * Get all questions in a topic with stats
   * @route GET /v2/cardgame/topics/:topicId/questions
   */
  static async getTopicQuestions(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { topicId } = req.params;
      const userId = req.user?.id;

      const questions = await CardGameService.getTopicQuestions(topicId, userId);

      sendSuccess(res, questions, 'Topic questions retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all feedback for a specific question
   * @route GET /v2/cardgame/questions/:questionId/feedback
   */
  static async getQuestionFeedback(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { questionId } = req.params;
      const userId = req.user?.id;
      
      const query: FeedbackQuery = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
        sortBy: (req.query.sortBy as any) || 'upvotes', // Default to upvotes
        sortOrder: (req.query.sortOrder as any) || 'desc',
      };

      const result = await CardGameService.getQuestionFeedback(questionId, userId, query);

      sendSuccess(res, result, 'Question feedback retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}
