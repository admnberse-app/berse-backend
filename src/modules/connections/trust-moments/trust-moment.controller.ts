import { Response, NextFunction } from 'express';
import { TrustMomentService } from './trust-moment.service';
import { AuthRequest } from '../../../types';
import { TrustMomentQuery } from './trust-moment.types';

/**
 * Trust Moment Controller
 * Handles HTTP requests for trust moment operations
 */
export class TrustMomentController {
  
  /**
   * Create a trust moment
   * @route POST /v2/connections/:connectionId/trust-moments
   */
  static async createTrustMoment(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { connectionId } = req.params;
      
      const moment = await TrustMomentService.createTrustMoment(userId, {
        ...req.body,
        connectionId,
      });

      res.status(201).json({
        success: true,
        message: 'Trust moment created successfully',
        data: moment,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get a single trust moment
   * @route GET /v2/trust-moments/:momentId
   */
  static async getTrustMoment(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { momentId } = req.params;

      const moment = await TrustMomentService.getTrustMoment(userId, momentId);

      res.status(200).json({
        success: true,
        data: moment,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update a trust moment
   * @route PATCH /v2/trust-moments/:momentId
   */
  static async updateTrustMoment(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { momentId } = req.params;

      const moment = await TrustMomentService.updateTrustMoment(userId, momentId, req.body);

      res.status(200).json({
        success: true,
        message: 'Trust moment updated successfully',
        data: moment,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a trust moment
   * @route DELETE /v2/trust-moments/:momentId
   */
  static async deleteTrustMoment(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { momentId } = req.params;

      await TrustMomentService.deleteTrustMoment(userId, momentId);

      res.status(200).json({
        success: true,
        message: 'Trust moment deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all trust moments for user (both received and given)
   * @route GET /v2/users/:userId/trust-moments
   */
  static async getUserTrustMoments(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;

      const query: TrustMomentQuery = {
        page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
        momentType: req.query.momentType as string | undefined,
        eventId: req.query.eventId as string | undefined,
        minRating: req.query.minRating ? parseInt(req.query.minRating as string, 10) : undefined,
        maxRating: req.query.maxRating ? parseInt(req.query.maxRating as string, 10) : undefined,
        isPublic: req.query.isPublic === 'true' ? true : req.query.isPublic === 'false' ? false : undefined,
        sortBy: req.query.sortBy as any,
        sortOrder: req.query.sortOrder as any,
      };

      const result = await TrustMomentService.getUserTrustMoments(userId, query);

      res.status(200).json({
        success: true,
        data: result.moments,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get trust moments received by user
   * @route GET /v2/users/:userId/trust-moments/received
   */
  static async getTrustMomentsReceived(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;

      const query: TrustMomentQuery = {
        page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
        momentType: req.query.momentType as string | undefined,
        eventId: req.query.eventId as string | undefined,
        minRating: req.query.minRating ? parseInt(req.query.minRating as string, 10) : undefined,
        maxRating: req.query.maxRating ? parseInt(req.query.maxRating as string, 10) : undefined,
        isPublic: req.query.isPublic === 'true' ? true : req.query.isPublic === 'false' ? false : undefined,
        sortBy: req.query.sortBy as any,
        sortOrder: req.query.sortOrder as any,
      };

      const result = await TrustMomentService.getTrustMomentsReceived(userId, query);

      res.status(200).json({
        success: true,
        data: result.moments,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get trust moments given by user
   * @route GET /v2/users/:userId/trust-moments/given
   */
  static async getTrustMomentsGiven(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;

      const query: TrustMomentQuery = {
        page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
        momentType: req.query.momentType as string | undefined,
        eventId: req.query.eventId as string | undefined,
        minRating: req.query.minRating ? parseInt(req.query.minRating as string, 10) : undefined,
        maxRating: req.query.maxRating ? parseInt(req.query.maxRating as string, 10) : undefined,
        isPublic: req.query.isPublic === 'true' ? true : req.query.isPublic === 'false' ? false : undefined,
        sortBy: req.query.sortBy as any,
        sortOrder: req.query.sortOrder as any,
      };

      const result = await TrustMomentService.getTrustMomentsGiven(userId, query);

      res.status(200).json({
        success: true,
        data: result.moments,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get trust moments for a specific event
   * @route GET /v2/events/:eventId/trust-moments
   */
  static async getTrustMomentsForEvent(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { eventId } = req.params;

      const query: TrustMomentQuery = {
        page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
        minRating: req.query.minRating ? parseInt(req.query.minRating as string, 10) : undefined,
        maxRating: req.query.maxRating ? parseInt(req.query.maxRating as string, 10) : undefined,
        sortBy: req.query.sortBy as any,
        sortOrder: req.query.sortOrder as any,
      };

      const result = await TrustMomentService.getTrustMomentsForEvent(userId, eventId, query);

      res.status(200).json({
        success: true,
        data: result.moments,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get trust moment statistics for user
   * @route GET /v2/users/:userId/trust-moments/stats
   */
  static async getTrustMomentStats(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;

      const stats = await TrustMomentService.getTrustMomentStats(userId);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Check if logged-in user can create trust moment with target user
   * @route GET /v2/users/:userId/trust-moments/can-create
   */
  static async canCreateTrustMoment(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const currentUserId = req.user!.id;
      const { userId: targetUserId } = req.params;

      const result = await TrustMomentService.canCreateTrustMoment(currentUserId, targetUserId);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get popular tags across all trust moments
   * @route GET /v2/trust-moments/popular-tags
   */
  static async getPopularTags(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
      const momentType = req.query.momentType as string | undefined;
      const minOccurrences = req.query.minOccurrences ? parseInt(req.query.minOccurrences as string, 10) : undefined;

      const tags = await TrustMomentService.getPopularTags({
        limit,
        momentType,
        minOccurrences,
      });

      res.status(200).json({
        success: true,
        data: tags,
      });
    } catch (error) {
      next(error);
    }
  }
}
