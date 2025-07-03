import { prisma } from '../config/database';
import { POINT_VALUES } from '../types';

export class PointsService {
  static async awardPoints(
    userId: string,
    action: keyof typeof POINT_VALUES,
    description?: string
  ): Promise<void> {
    const points = POINT_VALUES[action];
    
    await prisma.$transaction(async (tx: any) => {
      // Update user's total points
      await tx.user.update({
        where: { id: userId },
        data: {
          totalPoints: {
            increment: points,
          },
        },
      });

      // Create point history entry
      await tx.pointHistory.create({
        data: {
          userId,
          points,
          action,
          description: description || `Earned ${points} points for ${action}`,
        },
      });
    });
  }

  static async deductPoints(
    userId: string,
    points: number,
    description: string
  ): Promise<void> {
    await prisma.$transaction(async (tx: any) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
      });

      if (!user || user.totalPoints < points) {
        throw new Error('Insufficient points');
      }

      await tx.user.update({
        where: { id: userId },
        data: {
          totalPoints: {
            decrement: points,
          },
        },
      });

      await tx.pointHistory.create({
        data: {
          userId,
          points: -points,
          action: 'REDEMPTION',
          description,
        },
      });
    });
  }

  static async getUserPoints(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        totalPoints: true,
        pointsHistory: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
      },
    });

    return user;
  }
}