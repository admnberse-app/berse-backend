import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { sendSuccess } from '../utils/response';
import { PointsService } from '../services/points.service';
import { AppError } from '../middleware/error';

export class PointsController {
  static async getUserPoints(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.params.id || req.user?.id!;

      const pointsData = await PointsService.getUserPoints(userId);

      if (!pointsData) {
        throw new AppError('User not found', 404);
      }

      sendSuccess(res, pointsData);
    } catch (error) {
      next(error);
    }
  }

  static async manualPointsUpdate(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, points, action, description } = req.body;

      if (points > 0) {
        await PointsService.awardPoints(userId, action || 'MANUAL', description);
      } else if (points < 0) {
        await PointsService.deductPoints(userId, Math.abs(points), description);
      }

      sendSuccess(res, null, 'Points updated successfully');
    } catch (error) {
      next(error);
    }
  }
}