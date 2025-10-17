import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { Prisma } from '@prisma/client';
import { prisma } from '../../config/database';
import { sendSuccess } from '../../utils/response';
import { AppError } from '../../middleware/error';
import logger from '../../utils/logger';

export class OnboardingController {
  /**
   * Get all active onboarding screens
   * @route GET /v2/onboarding/screens
   */
  static async getOnboardingScreens(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const screens = await prisma.onboardingScreen.findMany({
        where: {
          isActive: true,
        },
        orderBy: {
          screenOrder: 'asc',
        },
        select: {
          id: true,
          screenOrder: true,
          title: true,
          subtitle: true,
          description: true,
          imageUrl: true,
          videoUrl: true,
          ctaText: true,
          ctaAction: true,
          ctaUrl: true,
          backgroundColor: true,
          isSkippable: true,
          targetAudience: true,
          metadata: true,
        },
      });

      logger.info('Onboarding screens fetched', { count: screens.length });
      sendSuccess(res, { screens }, 'Onboarding screens retrieved successfully');
    } catch (error) {
      logger.error('Failed to fetch onboarding screens', { error });
      next(error);
    }
  }

  /**
   * Track onboarding screen view
   * @route POST /v2/onboarding/track
   */
  static async trackOnboardingView(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { screenId, action, userId } = req.body;

      if (!screenId) {
        throw new AppError('Screen ID is required', 400);
      }

      const screen = await prisma.onboardingScreen.findUnique({
        where: { id: screenId },
      });

      if (!screen) {
        throw new AppError('Onboarding screen not found', 404);
      }

      // Create analytics record
      await prisma.onboardingAnalytic.create({
        data: {
          id: crypto.randomUUID(),
          screenId,
          userId: userId || null,
          viewed: action === 'view',
          viewedAt: action === 'view' ? new Date() : null,
          skipped: action === 'skip',
          skippedAt: action === 'skip' ? new Date() : null,
          completed: action === 'complete',
          completedAt: action === 'complete' ? new Date() : null,
        },
      });

      logger.info('Onboarding action tracked', { screenId, action, userId });
      sendSuccess(res, null, 'Onboarding action tracked successfully');
    } catch (error) {
      logger.error('Failed to track onboarding action', { error });
      next(error);
    }
  }

  /**
   * Mark onboarding as completed (for authenticated users)
   * @route POST /v2/onboarding/complete
   */
  static async completeOnboarding(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      // Mark onboarding as completed by tracking a completion event for all screens
      const screens = await prisma.onboardingScreen.findMany({
        where: { isActive: true },
        select: { id: true },
      });

      // Create completion records for all screens
      for (const screen of screens) {
        // Check if record exists
        const existing = await prisma.onboardingAnalytic.findFirst({
          where: {
            screenId: screen.id,
            userId,
          },
        });

        if (existing) {
          // Update existing record
          await prisma.onboardingAnalytic.update({
            where: { id: existing.id },
            data: {
              completed: true,
              completedAt: new Date(),
            },
          });
        } else {
          // Create new record
          await prisma.onboardingAnalytic.create({
            data: {
              id: crypto.randomUUID(),
              screenId: screen.id,
              userId,
              viewed: true,
              viewedAt: new Date(),
              completed: true,
              completedAt: new Date(),
            },
          });
        }
      }

      logger.info('Onboarding completed', { userId });
      sendSuccess(res, null, 'Onboarding completed successfully');
    } catch (error) {
      logger.error('Failed to complete onboarding', { error });
      next(error);
    }
  }

  /**
   * Get onboarding status for the authenticated user
   * @route GET /v2/onboarding/status
   */
  static async getOnboardingStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      // Get all active screens
      const activeScreens = await prisma.onboardingScreen.findMany({
        where: { isActive: true },
        select: { id: true, screenOrder: true, title: true },
        orderBy: { screenOrder: 'asc' },
      });

      // Get user's analytics records
      const analytics = await prisma.onboardingAnalytic.findMany({
        where: {
          userId,
          screenId: { in: activeScreens.map((s) => s.id) },
        },
        select: {
          screenId: true,
          viewed: true,
          viewedAt: true,
          completed: true,
          completedAt: true,
          skipped: true,
          skippedAt: true,
        },
      });

      const analyticsMap = new Map(
        analytics.map((a) => [a.screenId, a])
      );

      const screenStatus = activeScreens.map((screen) => {
        const analytic = analyticsMap.get(screen.id);
        return {
          screenId: screen.id,
          screenOrder: screen.screenOrder,
          title: screen.title,
          viewed: analytic?.viewed || false,
          viewedAt: analytic?.viewedAt || null,
          completed: analytic?.completed || false,
          completedAt: analytic?.completedAt || null,
          skipped: analytic?.skipped || false,
          skippedAt: analytic?.skippedAt || null,
        };
      });

      const totalScreens = activeScreens.length;
      const viewedCount = screenStatus.filter((s) => s.viewed).length;
      const completedCount = screenStatus.filter((s) => s.completed).length;
      const skippedCount = screenStatus.filter((s) => s.skipped).length;

      const isCompleted = completedCount === totalScreens || 
                         (viewedCount + skippedCount >= totalScreens);

      logger.info('Onboarding status retrieved', { userId, isCompleted });
      sendSuccess(
        res,
        {
          userId,
          isCompleted,
          totalScreens,
          viewedCount,
          completedCount,
          skippedCount,
          progress: totalScreens > 0 ? (completedCount / totalScreens) * 100 : 0,
          screens: screenStatus,
        },
        'Onboarding status retrieved successfully'
      );
    } catch (error) {
      logger.error('Failed to get onboarding status', { error });
      next(error);
    }
  }

  /**
   * Get onboarding analytics (admin endpoint)
   * @route GET /v2/onboarding/analytics
   */
  static async getOnboardingAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { startDate, endDate, screenId } = req.query;

      // Build filter
      const filter: any = {};
      if (startDate) {
        filter.createdAt = { ...filter.createdAt, gte: new Date(startDate as string) };
      }
      if (endDate) {
        filter.createdAt = { ...filter.createdAt, lte: new Date(endDate as string) };
      }
      if (screenId) {
        filter.screenId = screenId as string;
      }

      // Get analytics summary
      const analytics = await prisma.onboardingAnalytic.groupBy({
        by: ['screenId'],
        where: filter,
        _count: {
          id: true,
        },
        _sum: {
          timeSpentSeconds: true,
        },
      });

      // Get screen details
      const screenIds = analytics.map((a) => a.screenId);
      const screens = await prisma.onboardingScreen.findMany({
        where: { id: { in: screenIds } },
        select: { id: true, title: true, screenOrder: true },
      });

      const screenMap = new Map(screens.map((s) => [s.id, s]));

      // Get detailed stats per screen
      const detailedStats = await Promise.all(
        analytics.map(async (analytic) => {
          const screen = screenMap.get(analytic.screenId);
          const screenFilter = { ...filter, screenId: analytic.screenId };

          const [viewed, completed, skipped] = await Promise.all([
            prisma.onboardingAnalytic.count({ where: { ...screenFilter, viewed: true } }),
            prisma.onboardingAnalytic.count({ where: { ...screenFilter, completed: true } }),
            prisma.onboardingAnalytic.count({ where: { ...screenFilter, skipped: true } }),
          ]);

          return {
            screenId: analytic.screenId,
            screenTitle: screen?.title || 'Unknown',
            screenOrder: screen?.screenOrder || 0,
            totalInteractions: analytic._count.id,
            viewedCount: viewed,
            completedCount: completed,
            skippedCount: skipped,
            completionRate: viewed > 0 ? (completed / viewed) * 100 : 0,
            skipRate: viewed > 0 ? (skipped / viewed) * 100 : 0,
            avgTimeSpentSeconds: analytic._sum.timeSpentSeconds
              ? analytic._sum.timeSpentSeconds / analytic._count.id
              : 0,
          };
        })
      );

      // Sort by screen order
      detailedStats.sort((a, b) => a.screenOrder - b.screenOrder);

      // Get overall stats
      const totalUsers = await prisma.onboardingAnalytic.findMany({
        where: filter,
        distinct: ['userId'],
        select: { userId: true },
      });

      const uniqueUsers = totalUsers.filter((u) => u.userId).length;

      // Get completion stats
      const allScreens = await prisma.onboardingScreen.count({ where: { isActive: true } });
      const usersWhoCompleted = await prisma.$queryRaw<Array<{ userId: string; completedCount: bigint }>>(
        Prisma.sql`SELECT "userId", COUNT(DISTINCT "screenId") as "completedCount"
         FROM "onboarding_analytics"
         WHERE "completed" = true AND "userId" IS NOT NULL
         GROUP BY "userId"
         HAVING COUNT(DISTINCT "screenId") >= ${allScreens}`
      );

      const overallStats = {
        uniqueUsers,
        totalScreens: allScreens,
        usersWhoCompleted: usersWhoCompleted.length,
        overallCompletionRate: uniqueUsers > 0 ? (usersWhoCompleted.length / uniqueUsers) * 100 : 0,
      };

      logger.info('Onboarding analytics retrieved');
      sendSuccess(
        res,
        {
          overallStats,
          screenStats: detailedStats,
        },
        'Onboarding analytics retrieved successfully'
      );
    } catch (error) {
      logger.error('Failed to get onboarding analytics', { error });
      next(error);
    }
  }
}
