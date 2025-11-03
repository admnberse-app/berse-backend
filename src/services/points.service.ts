import crypto from 'crypto';
import { prisma } from '../config/database';
import { POINT_VALUES } from '../types';
import { NotificationService } from './notification.service';
import { calculateExpiryDate, isExemptFromExpiry, POINT_EXPIRY_CONFIG } from '../config/points-expiry.config';
import logger from '../utils/logger';

export class PointsService {
  static async awardPoints(
    userId: string,
    action: keyof typeof POINT_VALUES,
    description?: string
  ): Promise<void> {
    const points = POINT_VALUES[action];
    
    const user = await prisma.$transaction(async (tx: any) => {
      // Get user's trust level for expiry calculation
      const userData = await tx.user.findUnique({
        where: { id: userId },
        select: { trustLevel: true, totalPoints: true },
      });

      // Calculate expiry date based on trust level
      const now = new Date();
      const expiresAt = calculateExpiryDate(now, userData?.trustLevel || 'starter', action);

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

      // Create point history entry with expiry date
      await tx.pointHistory.create({
        data: {
          id: crypto.randomUUID(),
          userId,
          points,
          action,
          description: description || `Earned ${points} points for ${action}`,
          expiresAt,
          expired: false,
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

  /**
   * Get points expiring within a specified number of days
   */
  static async getExpiringPoints(userId: string, daysAhead: number = 30) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    const expiringPoints = await prisma.pointHistory.findMany({
      where: {
        userId,
        expired: false,
        expiresAt: {
          lte: futureDate,
          gte: new Date(),
        },
      },
      orderBy: { expiresAt: 'asc' },
      select: {
        id: true,
        points: true,
        action: true,
        createdAt: true,
        expiresAt: true,
      },
    });

    const totalExpiring = expiringPoints.reduce((sum, p) => sum + p.points, 0);
    const nextExpiryDate = expiringPoints[0]?.expiresAt || null;

    return {
      points: expiringPoints,
      totalExpiring,
      nextExpiryDate,
      daysUntilNextExpiry: nextExpiryDate 
        ? Math.ceil((nextExpiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        : null,
    };
  }

  /**
   * Get available (non-expired, non-spent) points for a user
   */
  static async getAvailablePoints(userId: string): Promise<number> {
    const result = await prisma.pointHistory.aggregate({
      where: {
        userId,
        expired: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      _sum: {
        points: true,
      },
    });

    return result._sum.points || 0;
  }

  /**
   * Expire points that have passed their expiry date (called by cron job)
   */
  static async expirePoints(batchSize: number = 5000): Promise<{ expired: number; pointsExpired: number }> {
    const now = new Date();
    
    const pointsToExpire = await prisma.pointHistory.findMany({
      where: {
        expired: false,
        expiresAt: { lt: now },
      },
      select: { id: true, userId: true, points: true },
      take: batchSize,
    });

    if (pointsToExpire.length === 0) {
      return { expired: 0, pointsExpired: 0 };
    }

    // Check minimum balance exemption
    const exemptUsers = new Set<string>();
    for (const point of pointsToExpire) {
      const available = await this.getAvailablePoints(point.userId);
      if (isExemptFromExpiry(available)) {
        exemptUsers.add(point.userId);
      }
    }

    const pointIdsToExpire = pointsToExpire
      .filter(p => !exemptUsers.has(p.userId))
      .map(p => p.id);

    if (pointIdsToExpire.length === 0) {
      return { expired: 0, pointsExpired: 0 };
    }

    const userExpiredPoints = new Map<string, number>();
    pointsToExpire
      .filter(p => !exemptUsers.has(p.userId))
      .forEach(p => {
        const current = userExpiredPoints.get(p.userId) || 0;
        userExpiredPoints.set(p.userId, current + p.points);
      });

    await prisma.$transaction(async (tx: any) => {
      await tx.pointHistory.updateMany({
        where: { id: { in: pointIdsToExpire } },
        data: { expired: true, expiredAt: now },
      });

      for (const [userId, points] of userExpiredPoints) {
        await tx.user.update({
          where: { id: userId },
          data: { pointsExpired: { increment: points } },
        });
      }
    });

    const totalPointsExpired = Array.from(userExpiredPoints.values()).reduce((sum, p) => sum + p, 0);

    // Send expiry notifications
    for (const [userId, points] of userExpiredPoints) {
      await this.notifyPointsExpired(userId, points);
    }

    return { expired: pointIdsToExpire.length, pointsExpired: totalPointsExpired };
  }

  /**
   * Send warning notifications for points expiring soon
   * Should be called daily by a separate notification cron job
   */
  static async sendExpiryWarnings(daysAhead: 30 | 7 | 1): Promise<number> {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + daysAhead);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    // Find points expiring in the target window
    const expiringPoints = await prisma.pointHistory.groupBy({
      by: ['userId'],
      where: {
        expired: false,
        expiresAt: {
          gte: targetDate,
          lt: nextDay,
        },
      },
      _sum: { points: true },
    });

    let notificationsSent = 0;

    for (const group of expiringPoints) {
      const points = group._sum.points || 0;
      if (points > 0) {
        await this.notifyPointsExpiring(group.userId, points, daysAhead);
        notificationsSent++;
      }
    }

    logger.info(`Sent ${notificationsSent} expiry warnings for ${daysAhead} days ahead`);
    return notificationsSent;
  }

  /**
   * Send notification when points are expiring soon
   */
  private static async notifyPointsExpiring(
    userId: string,
    points: number,
    daysAhead: number
  ): Promise<void> {
    try {
      const timeframe = daysAhead === 1 ? 'tomorrow' : `in ${daysAhead} days`;
      
      await NotificationService.createNotification({
        userId,
        type: 'POINTS',
        title: '⏰ Points Expiring Soon',
        message: `${points} points will expire ${timeframe}. Use them before they're gone!`,
        actionUrl: '/gamification/points',
        priority: daysAhead === 1 ? 'high' : daysAhead === 7 ? 'normal' : 'low',
        metadata: {
          points,
          daysAhead,
          type: 'points_expiry_warning',
        },
      });
    } catch (error) {
      logger.error('Failed to send points expiry warning notification', {
        userId,
        points,
        daysAhead,
        error,
      });
    }
  }

  /**
   * Send notification when points have expired
   */
  private static async notifyPointsExpired(userId: string, points: number): Promise<void> {
    try {
      await NotificationService.createNotification({
        userId,
        type: 'POINTS',
        title: '❌ Points Expired',
        message: `${points} points have expired. Keep earning and using points to avoid future expiry!`,
        actionUrl: '/gamification/points',
        priority: 'normal',
        metadata: {
          points,
          type: 'points_expired',
        },
      });
    } catch (error) {
      logger.error('Failed to send points expired notification', {
        userId,
        points,
        error,
      });
    }
  }

  /**
   * Spend points (FIFO - oldest first)
   */
  static async spendPoints(userId: string, pointsToSpend: number, description: string): Promise<void> {
    const available = await this.getAvailablePoints(userId);
    
    if (available < pointsToSpend) {
      throw new Error(`Insufficient points. Available: ${available}, Requested: ${pointsToSpend}`);
    }

    await prisma.$transaction(async (tx: any) => {
      const availablePointHistory = await tx.pointHistory.findMany({
        where: {
          userId,
          expired: false,
          points: { gt: 0 },
          expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: 'asc' },
        select: { id: true, points: true },
      });

      let remaining = pointsToSpend;
      const spentPointIds: string[] = [];

      for (const point of availablePointHistory) {
        if (remaining <= 0) break;
        spentPointIds.push(point.id);
        remaining -= point.points;
      }

      await tx.pointHistory.updateMany({
        where: { id: { in: spentPointIds } },
        data: { expired: true, expiredAt: new Date() },
      });

      await tx.user.update({
        where: { id: userId },
        data: { pointsSpent: { increment: pointsToSpend } },
      });

      await tx.pointHistory.create({
        data: {
          id: crypto.randomUUID(),
          userId,
          points: -pointsToSpend,
          action: 'REDEMPTION',
          description,
          expired: true,
          expiredAt: new Date(),
        },
      });
    });
  }
}

