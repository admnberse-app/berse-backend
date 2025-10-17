import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../types';
import { GamificationService } from './gamification.service';
import { BadgeService } from '../../services/badge.service';
import { PointsService } from '../../services/points.service';
import { sendSuccess } from '../../utils/response';
import { AppError } from '../../middleware/error';

export class GamificationController {
  // ================== Dashboard ==================

  static async getDashboard(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id!;
      const dashboard = await GamificationService.getDashboard(userId);
      sendSuccess(res, dashboard);
    } catch (error) {
      next(error);
    }
  }

  static async getUserDashboard(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;
      const dashboard = await GamificationService.getDashboard(userId);
      sendSuccess(res, dashboard);
    } catch (error) {
      next(error);
    }
  }

  // ================== Badges ==================

  static async getAllBadges(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const badges = await BadgeService.getAllBadges();
      sendSuccess(res, { badges, total: badges.length });
    } catch (error) {
      next(error);
    }
  }

  static async getBadgeById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const badge = await BadgeService.getBadgeById(id);
      
      if (!badge) {
        throw new AppError('Badge not found', 404);
      }
      
      sendSuccess(res, badge);
    } catch (error) {
      next(error);
    }
  }

  static async getUserBadges(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;
      const badges = await BadgeService.getUserBadges(userId);
      sendSuccess(res, { badges, total: badges.length });
    } catch (error) {
      next(error);
    }
  }

  static async getMyBadges(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id!;
      const badges = await BadgeService.getUserBadges(userId);
      sendSuccess(res, { badges, total: badges.length });
    } catch (error) {
      next(error);
    }
  }

  static async getBadgeProgress(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id!;
      const progress = await BadgeService.getBadgeProgress(userId);
      const earned = progress.filter((p) => p.isEarned);
      
      sendSuccess(res, {
        progress,
        earnedCount: earned.length,
        totalCount: progress.length,
      });
    } catch (error) {
      next(error);
    }
  }

  static async awardBadge(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, badgeType } = req.body;
      await BadgeService.awardBadge(userId, badgeType);
      sendSuccess(res, null, 'Badge awarded successfully');
    } catch (error) {
      next(error);
    }
  }

  static async revokeBadge(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { badgeId, userId } = req.params;
      const success = await BadgeService.revokeBadge(userId, badgeId);
      
      if (!success) {
        throw new AppError('Badge not found or already revoked', 404);
      }
      
      sendSuccess(res, null, 'Badge revoked successfully');
    } catch (error) {
      next(error);
    }
  }

  // ================== Points ==================

  static async getMyPoints(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id!;
      const points = await PointsService.getUserPoints(userId);
      sendSuccess(res, points);
    } catch (error) {
      next(error);
    }
  }

  static async getPointsHistory(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id!;
      const { action, startDate, endDate, limit, offset } = req.query;

      const points = await PointsService.getUserPoints(userId);
      let history = points?.pointHistories || [];

      // Apply filters
      if (action) {
        history = history.filter((h: any) => h.action === action);
      }
      if (startDate) {
        const start = new Date(startDate as string);
        history = history.filter((h: any) => h.createdAt >= start);
      }
      if (endDate) {
        const end = new Date(endDate as string);
        history = history.filter((h: any) => h.createdAt <= end);
      }

      // Apply pagination
      const limitNum = limit ? parseInt(limit as string) : 50;
      const offsetNum = offset ? parseInt(offset as string) : 0;
      const paginatedHistory = history.slice(offsetNum, offsetNum + limitNum);

      sendSuccess(res, {
        history: paginatedHistory,
        total: history.length,
        totalPoints: points?.totalPoints || 0,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getUserPoints(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;
      const points = await PointsService.getUserPoints(userId);
      sendSuccess(res, points);
    } catch (error) {
      next(error);
    }
  }

  static async awardPoints(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, points, action, description } = req.body;
      await PointsService.awardPoints(userId, action, description || `Manually awarded ${points} points`);
      sendSuccess(res, null, 'Points awarded successfully');
    } catch (error) {
      next(error);
    }
  }

  static async deductPoints(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, points, description } = req.body;
      await PointsService.deductPoints(userId, points, description);
      sendSuccess(res, null, 'Points deducted successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getPointActions(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const actions = GamificationService.getPointActions();
      sendSuccess(res, { actions, total: actions.length });
    } catch (error) {
      next(error);
    }
  }

  // ================== Rewards ==================

  static async getRewards(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      const filters = {
        category: req.query.category as string | undefined,
        minPoints: req.query.minPoints ? parseInt(req.query.minPoints as string) : undefined,
        maxPoints: req.query.maxPoints ? parseInt(req.query.maxPoints as string) : undefined,
        isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined,
        canAfford: req.query.canAfford === 'true',
      };

      const result = await GamificationService.getRewards(filters, userId);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async getRewardById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const reward = await GamificationService.getRewardById(id);
      
      if (!reward) {
        throw new AppError('Reward not found', 404);
      }
      
      sendSuccess(res, reward);
    } catch (error) {
      next(error);
    }
  }

  static async createReward(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = req.body;
      const reward = await GamificationService.createReward(data);
      sendSuccess(res, reward, 'Reward created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateReward(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const data = req.body;
      const reward = await GamificationService.updateReward(id, data);
      sendSuccess(res, reward, 'Reward updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async deleteReward(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await GamificationService.deleteReward(id);
      sendSuccess(res, null, 'Reward deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  static async redeemReward(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id!;
      const { rewardId } = req.body;
      const redemption = await GamificationService.redeemReward(userId, rewardId);
      sendSuccess(res, redemption, 'Reward redeemed successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async getMyRedemptions(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id!;
      const redemptions = await GamificationService.getUserRedemptions(userId);
      sendSuccess(res, { redemptions, total: redemptions.length });
    } catch (error) {
      next(error);
    }
  }

  static async getRedemptionById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const redemption = await GamificationService.getRedemptionById(id);
      
      if (!redemption) {
        throw new AppError('Redemption not found', 404);
      }
      
      sendSuccess(res, redemption);
    } catch (error) {
      next(error);
    }
  }

  static async updateRedemptionStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;
      const redemption = await GamificationService.updateRedemptionStatus(id, status, notes);
      sendSuccess(res, redemption, 'Redemption status updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getRewardCategories(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await GamificationService.getRewardCategories();
      sendSuccess(res, { categories, total: categories.length });
    } catch (error) {
      next(error);
    }
  }

  // ================== Leaderboards ==================

  static async getPointsLeaderboard(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters = {
        limit: req.query.limit ? parseInt(req.query.limit as string) : 50,
        offset: req.query.offset ? parseInt(req.query.offset as string) : 0,
        timeframe: req.query.timeframe as 'all' | 'month' | 'week' | 'day' | undefined,
      };

      const result = await GamificationService.getPointsLeaderboard(filters);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async getTrustScoreLeaderboard(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters = {
        limit: req.query.limit ? parseInt(req.query.limit as string) : 50,
        offset: req.query.offset ? parseInt(req.query.offset as string) : 0,
        timeframe: req.query.timeframe as 'all' | 'month' | 'week' | 'day' | undefined,
      };

      const result = await GamificationService.getTrustScoreLeaderboard(filters);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async getBadgesLeaderboard(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters = {
        limit: req.query.limit ? parseInt(req.query.limit as string) : 50,
        offset: req.query.offset ? parseInt(req.query.offset as string) : 0,
        timeframe: req.query.timeframe as 'all' | 'month' | 'week' | 'day' | undefined,
      };

      const result = await GamificationService.getBadgesLeaderboard(filters);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async getEventsLeaderboard(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters = {
        limit: req.query.limit ? parseInt(req.query.limit as string) : 50,
        offset: req.query.offset ? parseInt(req.query.offset as string) : 0,
        timeframe: req.query.timeframe as 'all' | 'month' | 'week' | 'day' | undefined,
      };

      const result = await GamificationService.getEventsLeaderboard(filters);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async getConnectionsLeaderboard(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters = {
        limit: req.query.limit ? parseInt(req.query.limit as string) : 50,
        offset: req.query.offset ? parseInt(req.query.offset as string) : 0,
        timeframe: req.query.timeframe as 'all' | 'month' | 'week' | 'day' | undefined,
      };

      const result = await GamificationService.getConnectionsLeaderboard(filters);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async getReferralsLeaderboard(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters = {
        limit: req.query.limit ? parseInt(req.query.limit as string) : 50,
        offset: req.query.offset ? parseInt(req.query.offset as string) : 0,
        timeframe: req.query.timeframe as 'all' | 'month' | 'week' | 'day' | undefined,
      };

      const result = await GamificationService.getReferralsLeaderboard(filters);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  // ================== Platform Statistics ==================

  static async getPlatformStats(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await GamificationService.getPlatformStats();
      sendSuccess(res, stats);
    } catch (error) {
      next(error);
    }
  }
}
