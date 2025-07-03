import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { sendSuccess } from '../utils/response';
import { BadgeService } from '../services/badge.service';

export class BadgeController {
  static async getUserBadges(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.params.id || req.user?.id!;

      const badges = await BadgeService.getUserBadges(userId);

      sendSuccess(res, badges);
    } catch (error) {
      next(error);
    }
  }
}