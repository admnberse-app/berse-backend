import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../types';
import { sendSuccess } from '../../utils/response';
import { AppError } from '../../middleware/error';
import { TrustScoreUserService } from './trust-score.service';
import logger from '../../utils/logger';

export class TrustScoreController {
  
  /**
   * Get trust score detail
   * @route GET /v2/users/:userId/trust-score
   */
  static async getTrustScoreDetail(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;
      const requesterId = req.user?.id;
      
      // Query parameters
      const includeBreakdown = req.query.includeBreakdown === 'true' || req.query.includeBreakdown === undefined;
      const includeHistory = req.query.includeHistory === 'true';
      const historyDays = parseInt(req.query.historyDays as string) || 30;

      // Check if user can view this profile
      const isOwnProfile = userId === requesterId;
      const isPublicView = !isOwnProfile;

      // For now, allow viewing any user's trust score (public info)
      // In production, you might want to add privacy settings

      const detail = await TrustScoreUserService.getTrustScoreDetail(
        userId,
        requesterId,
        includeBreakdown,
        includeHistory,
        historyDays
      );

      sendSuccess(res, detail);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get trust score suggestions
   * @route GET /v2/users/:userId/trust-score/suggestions
   */
  static async getSuggestions(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;
      const requesterId = req.user?.id;

      // Only allow viewing own suggestions
      if (userId !== requesterId) {
        throw new AppError('You can only view your own suggestions', 403);
      }

      const suggestions = await TrustScoreUserService.getSuggestions(userId);
      sendSuccess(res, suggestions);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get recent trust score updates
   * @route GET /v2/users/:userId/trust-score/recent-updates
   */
  static async getRecentUpdates(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;
      const requesterId = req.user?.id;
      const limit = parseInt(req.query.limit as string) || 10;

      // Only allow viewing own updates
      if (userId !== requesterId) {
        throw new AppError('You can only view your own updates', 403);
      }

      const updates = await TrustScoreUserService.getRecentUpdates(userId, limit);
      
      sendSuccess(res, {
        updates,
        pagination: {
          total: updates.length,
          page: 1,
          limit,
          totalPages: 1,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user stats
   * @route GET /v2/users/:userId/stats
   */
  static async getUserStats(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;
      const requesterId = req.user?.id;

      // Check if user can view these stats
      // For now, allow public viewing of stats
      const stats = await TrustScoreUserService.getUserStats(userId);
      
      sendSuccess(res, stats);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get trust score history
   * @route GET /v2/users/:userId/trust-score/history
   */
  static async getTrustScoreHistory(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;
      const requesterId = req.user?.id;

      // Only allow viewing own history
      if (userId !== requesterId) {
        throw new AppError('You can only view your own score history', 403);
      }

      // Parse query parameters
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      const granularity = (req.query.granularity as 'daily' | 'weekly' | 'monthly') || 'daily';

      const history = await TrustScoreUserService.getTrustScoreHistory(
        userId,
        startDate,
        endDate,
        granularity
      );

      sendSuccess(res, history);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get trust dashboard
   * @route GET /v2/users/:userId/trust-dashboard
   */
  static async getTrustDashboard(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;
      const requesterId = req.user?.id;

      // Only allow viewing own dashboard
      if (userId !== requesterId) {
        throw new AppError('You can only view your own trust dashboard', 403);
      }

      const dashboard = await TrustScoreUserService.getTrustDashboard(userId);
      sendSuccess(res, dashboard);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get trust leaderboard
   * @route GET /v2/trust/leaderboard
   */
  static async getLeaderboard(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const requesterId = req.user?.id;
      const type = (req.query.type as 'global' | 'community' | 'friends') || 'global';
      const communityId = req.query.communityId as string | undefined;
      const limit = parseInt(req.query.limit as string) || 100;

      const leaderboard = await TrustScoreUserService.getLeaderboard(
        requesterId,
        type,
        communityId,
        limit
      );

      sendSuccess(res, leaderboard);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get trust badges
   * @route GET /v2/users/:userId/badges
   */
  static async getBadges(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;

      const badges = await TrustScoreUserService.getTrustBadges(userId);
      sendSuccess(res, badges);
    } catch (error) {
      next(error);
    }
  }
}
