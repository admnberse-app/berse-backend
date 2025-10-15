import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { prisma } from '../config/database';
import { sendSuccess } from '../utils/response';
import { AppError } from '../middleware/error';
import { PointsService } from '../services/points.service';

export class RewardsController {
  static async getRewards(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { category, minPoints, maxPoints } = req.query;

      const where: any = {
        isActive: true,
      };

      if (category) {
        where.category = category;
      }

      if (minPoints || maxPoints) {
        where.pointsRequired = {};
        if (minPoints) where.pointsRequired.gte = parseInt(minPoints as string);
        if (maxPoints) where.pointsRequired.lte = parseInt(maxPoints as string);
      }

      const rewards = await prisma.reward.findMany({
        where,
        orderBy: { pointsRequired: 'asc' },
      });

      sendSuccess(res, rewards);
    } catch (error) {
      next(error);
    }
  }

  static async createReward(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { title, description, pointsRequired, category, partner, quantity, imageUrl } = req.body;

      const reward = await prisma.reward.create({
        data: {
          title,
          description,
          pointsRequired,
          category,
          partner,
          quantity,
          imageUrl,
        },
      });

      sendSuccess(res, reward, 'Reward created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async redeemReward(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id!;
      const { rewardId } = req.body;

      const reward = await prisma.reward.findUnique({
        where: { id: rewardId },
      });

      if (!reward) {
        throw new AppError('Reward not found', 404);
      }

      if (!reward.isActive || reward.quantity <= 0) {
        throw new AppError('Reward not available', 400);
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { totalPoints: true },
      });

      if (!user || user.totalPoints < reward.pointsRequired) {
        throw new AppError('Insufficient points', 400);
      }

      // Create redemption
      const redemption = await prisma.$transaction(async (tx: any) => {
        // Deduct points
        await PointsService.deductPoints(userId, reward.pointsRequired, `Redeemed: ${reward.title}`);

        // Create redemption record
        const redemption = await tx.redemption.create({
          data: {
            userId,
            rewardId,
          },
          include: {
            reward: true,
          },
        });

        // Update reward quantity
        await tx.reward.update({
          where: { id: rewardId },
          data: {
            quantity: {
              decrement: 1,
            },
          },
        });

        return redemption;
      });

      sendSuccess(res, redemption, 'Reward redeemed successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async getUserRedemptions(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id!;

      const redemptions = await prisma.redemption.findMany({
        where: { userId },
        include: {
          reward: true,
        },
        orderBy: { redeemedAt: 'desc' },
      });

      sendSuccess(res, redemptions);
    } catch (error) {
      next(error);
    }
  }

  static async updateRedemptionStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;

      const redemption = await prisma.redemption.update({
        where: { id },
        data: {
          status,
          notes,
          processedAt: new Date(),
        },
        include: {
          user: {
            select: {
              fullName: true,
              email: true,
            },
          },
          reward: true,
        },
      });

      sendSuccess(res, redemption, 'Redemption status updated');
    } catch (error) {
      next(error);
    }
  }
}