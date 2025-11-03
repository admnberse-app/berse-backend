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
        title: `🎉 ${crossedMilestone} Points Milestone!`,
        message: `Amazing! You've reached ${crossedMilestone} points. Keep up the great work!`,
        actionUrl: '/gamification/dashboard',
        priority: 'high',
        metadata: {
          milestone: crossedMilestone,
          currentPoints: newTotal,
        },
      });

      // Send dedicated milestone notification
      NotificationService.notifyPointsMilestone(
        userId,
        crossedMilestone,
        newTotal
      ).catch(err => console.error('Failed to send points milestone notification:', err));
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

  static async getUserPointsWithStats(userId: string) {
    const [user, pointStats, recentHistory, categoryBreakdown] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          totalPoints: true,
          createdAt: true,
        },
      }),
      prisma.pointHistory.aggregate({
        where: { userId },
        _sum: {
          points: true,
        },
        _count: {
          id: true,
        },
      }),
      prisma.pointHistory.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 20,
        select: {
          id: true,
          points: true,
          action: true,
          description: true,
          createdAt: true,
        },
      }),
      prisma.pointHistory.groupBy({
        by: ['action'],
        where: { userId },
        _sum: {
          points: true,
        },
        _count: {
          id: true,
        },
        orderBy: {
          _sum: {
            points: 'desc',
          },
        },
      }),
    ]);

    // Calculate earned vs spent
    const earned = await prisma.pointHistory.aggregate({
      where: { userId, points: { gt: 0 } },
      _sum: { points: true },
    });

    const spent = await prisma.pointHistory.aggregate({
      where: { userId, points: { lt: 0 } },
      _sum: { points: true },
    });

    // Get monthly breakdown for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyBreakdown = await prisma.pointHistory.groupBy({
      by: ['createdAt'],
      where: {
        userId,
        createdAt: { gte: sixMonthsAgo },
      },
      _sum: { points: true },
      _count: { id: true },
    });

    // Group by month
    const monthlyStats = monthlyBreakdown.reduce((acc: any, item) => {
      const monthKey = new Date(item.createdAt).toISOString().slice(0, 7); // YYYY-MM
      if (!acc[monthKey]) {
        acc[monthKey] = { earned: 0, spent: 0, transactions: 0 };
      }
      const points = item._sum.points || 0;
      if (points > 0) {
        acc[monthKey].earned += points;
      } else {
        acc[monthKey].spent += Math.abs(points);
      }
      acc[monthKey].transactions += item._count.id;
      return acc;
    }, {});

    // Top earning actions
    const topActions = categoryBreakdown
      .filter((item) => (item._sum.points || 0) > 0)
      .slice(0, 5)
      .map((item) => ({
        action: item.action,
        totalPoints: item._sum.points || 0,
        count: item._count.id,
        averagePoints: Math.round((item._sum.points || 0) / item._count.id),
      }));

    // Calculate rank
    const rank = await prisma.user.count({
      where: {
        totalPoints: { gt: user?.totalPoints || 0 },
        status: 'ACTIVE',
        deletedAt: null,
      },
    });

    return {
      totalPoints: user?.totalPoints || 0,
      lifetime: {
        earned: earned._sum.points || 0,
        spent: Math.abs(spent._sum.points || 0),
        transactions: pointStats._count.id,
      },
      rank: rank + 1,
      recentHistory,
      topEarningActions: topActions,
      monthlyStats,
      categoryBreakdown: categoryBreakdown.map((item) => ({
        action: item.action,
        totalPoints: item._sum.points || 0,
        count: item._count.id,
        category: this.getCategoryForAction(item.action),
      })),
      memberSince: user?.createdAt,
    };
  }

  private static getCategoryForAction(action: string): string {
    if (action.startsWith('COMPLETE_PROFILE') || action.startsWith('VERIFY') || action.startsWith('UPLOAD')) {
      return 'Profile';
    }
    if (action.includes('EVENT') || action.includes('TRIP') || action.includes('VOLUNTEER')) {
      return 'Events';
    }
    if (action.includes('CONNECTION') || action.includes('VOUCH') || action.includes('TRUST')) {
      return 'Social';
    }
    if (action.includes('COMMUNITY')) {
      return 'Community';
    }
    if (action.includes('REFERRAL') || action.includes('REFEREE')) {
      return 'Referrals';
    }
    if (action.includes('REDEMPTION')) {
      return 'Redemptions';
    }
    return 'Other';
  }
}