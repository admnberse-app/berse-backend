import crypto from 'crypto';
import { prisma } from '../config/database';
import { POINT_VALUES } from '../types';
import { NotificationService } from './notification.service';

export class PointsService {
  static async awardPoints(
    userId: string,
    action: keyof typeof POINT_VALUES,
    description?: string
  ): Promise<void> {
    const points = POINT_VALUES[action];
    
    const user = await prisma.$transaction(async (tx: any) => {
      // Update user's total points
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          totalPoints: {
            increment: points,
          },
        },
        select: { totalPoints: true },
      });

      // Create point history entry
      await tx.pointHistory.create({
        data: {
          id: crypto.randomUUID(),
          userId,
          points,
          action,
          description: description || `Earned ${points} points for ${action}`,
        },
      });

      return updatedUser;
    });

    // Send notification for major milestones
    const milestones = [100, 500, 1000, 2500, 5000, 10000];
    const newTotal = user.totalPoints;
    const previousTotal = newTotal - points;
    
    // Check if we crossed a milestone
    const crossedMilestone = milestones.find(
      milestone => previousTotal < milestone && newTotal >= milestone
    );

    if (crossedMilestone) {
      await NotificationService.createNotification({
        userId,
        type: 'POINTS',
        title: `\ud83c\udf89 ${crossedMilestone} Points Milestone!`,
        message: `Amazing! You've reached ${crossedMilestone} points. Keep up the great work!`,
        actionUrl: '/gamification/dashboard',
        priority: 'high',
        metadata: {
          milestone: crossedMilestone,
          currentPoints: newTotal,
        },
      });
    }
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
          id: crypto.randomUUID(),
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
        pointHistories: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
      },
    });

    return user;
  }
}