import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { Prisma } from '@prisma/client';
import { prisma } from '../../config/database';
import { sendSuccess } from '../../utils/response';
import { AppError } from '../../middleware/error';
import logger from '../../utils/logger';

/**
 * Two-Phase Onboarding System
 * 
 * Phase 1: App Preview (Pre-Authentication)
 * - Brief introduction to the app (3-4 screens)
 * - Anonymous tracking with sessionId
 * - Shown before login/registration
 * 
 * Phase 2: User Setup (Post-Authentication)
 * - Personalized onboarding after registration/verification
 * - Profile completion, network setup, community joining, etc.
 * - Tracked per authenticated user
 */
export class OnboardingV2Controller {
  
  // ============================================================================
  // APP PREVIEW (Pre-Authentication)
  // ============================================================================
  
  /**
   * Get app preview screens (unauthenticated)
   * @route GET /v2/onboarding/app-preview/screens
   */
  static async getAppPreviewScreens(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const screens = await prisma.appPreviewScreen.findMany({
        where: { isActive: true },
        orderBy: { screenOrder: 'asc' },
        select: {
          id: true,
          screenOrder: true,
          title: true,
          subtitle: true,
          description: true,
          imageUrl: true,
          videoUrl: true,
          animationUrl: true,
          iconName: true,
          ctaText: true,
          ctaAction: true,
          backgroundColor: true,
          textColor: true,
          isSkippable: true,
          metadata: true,
        },
      });

      logger.info('App preview screens fetched', { count: screens.length });
      sendSuccess(res, { screens }, 'App preview screens retrieved successfully');
    } catch (error) {
      logger.error('Failed to fetch app preview screens', { error });
      next(error);
    }
  }

  /**
   * Track app preview screen action (unauthenticated)
   * @route POST /v2/onboarding/app-preview/track
   */
  static async trackAppPreviewAction(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { screenId, action, sessionId, timeSpentSeconds, deviceInfo, appVersion } = req.body;

      if (!screenId) {
        throw new AppError('Screen ID is required', 400);
      }

      if (!action) {
        throw new AppError('Action is required', 400);
      }

      const screen = await prisma.appPreviewScreen.findUnique({
        where: { id: screenId },
      });

      if (!screen) {
        throw new AppError('App preview screen not found', 404);
      }

      // Create analytics record (anonymous tracking)
      await prisma.appPreviewAnalytic.create({
        data: {
          id: crypto.randomUUID(),
          screenId,
          sessionId: sessionId || crypto.randomUUID(), // Generate if not provided
          userId: null, // Anonymous at this point
          viewed: action === 'view',
          viewedAt: action === 'view' ? new Date() : null,
          completed: action === 'complete',
          completedAt: action === 'complete' ? new Date() : null,
          skipped: action === 'skip',
          skippedAt: action === 'skip' ? new Date() : null,
          timeSpentSeconds: timeSpentSeconds || null,
          deviceInfo: deviceInfo || null,
          appVersion: appVersion || null,
        },
      });

      logger.info('App preview action tracked', { screenId, action, sessionId });
      sendSuccess(res, { sessionId }, 'App preview action tracked successfully');
    } catch (error) {
      logger.error('Failed to track app preview action', { error });
      next(error);
    }
  }

  /**
   * Link anonymous app preview analytics to user account (called after registration)
   * @route POST /v2/onboarding/app-preview/link-user
   */
  static async linkAppPreviewToUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const { sessionId } = req.body;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      if (!sessionId) {
        throw new AppError('Session ID is required', 400);
      }

      // Update all analytics records with this sessionId to link to the user
      const result = await prisma.appPreviewAnalytic.updateMany({
        where: {
          sessionId,
          userId: null, // Only update records not yet linked
        },
        data: {
          userId,
        },
      });

      logger.info('App preview analytics linked to user', { 
        userId, 
        sessionId, 
        recordsUpdated: result.count 
      });

      sendSuccess(res, { recordsLinked: result.count }, 'App preview analytics linked to user account');
    } catch (error) {
      logger.error('Failed to link app preview analytics', { error });
      next(error);
    }
  }

  /**
   * Get app preview analytics (admin)
   * @route GET /v2/onboarding/app-preview/analytics
   */
  static async getAppPreviewAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { startDate, endDate, screenId } = req.query;

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

      // Get aggregated stats per screen
      const analytics = await prisma.appPreviewAnalytic.groupBy({
        by: ['screenId'],
        where: filter,
        _count: { id: true },
        _sum: { timeSpentSeconds: true },
      });

      // Get screen details
      const screenIds = analytics.map((a) => a.screenId);
      const screens = await prisma.appPreviewScreen.findMany({
        where: { id: { in: screenIds } },
        select: { id: true, title: true, screenOrder: true },
      });

      const screenMap = new Map(screens.map((s) => [s.id, s]));

      // Get detailed stats per screen
      const detailedStats = await Promise.all(
        analytics.map(async (analytic) => {
          const screen = screenMap.get(analytic.screenId);
          const screenFilter = { ...filter, screenId: analytic.screenId };

          const [viewed, completed, skipped, uniqueSessions, linkedUsers] = await Promise.all([
            prisma.appPreviewAnalytic.count({ where: { ...screenFilter, viewed: true } }),
            prisma.appPreviewAnalytic.count({ where: { ...screenFilter, completed: true } }),
            prisma.appPreviewAnalytic.count({ where: { ...screenFilter, skipped: true } }),
            prisma.appPreviewAnalytic.findMany({
              where: screenFilter,
              distinct: ['sessionId'],
              select: { sessionId: true },
            }),
            prisma.appPreviewAnalytic.count({ 
              where: { ...screenFilter, userId: { not: null } } 
            }),
          ]);

          return {
            screenId: analytic.screenId,
            screenTitle: screen?.title || 'Unknown',
            screenOrder: screen?.screenOrder || 0,
            totalInteractions: analytic._count.id,
            uniqueSessions: uniqueSessions.length,
            linkedToUsers: linkedUsers,
            viewedCount: viewed,
            completedCount: completed,
            skippedCount: skipped,
            completionRate: viewed > 0 ? (completed / viewed) * 100 : 0,
            skipRate: viewed > 0 ? (skipped / viewed) * 100 : 0,
            conversionRate: uniqueSessions.length > 0 ? (linkedUsers / uniqueSessions.length) * 100 : 0,
            avgTimeSpentSeconds: analytic._sum.timeSpentSeconds
              ? analytic._sum.timeSpentSeconds / analytic._count.id
              : 0,
          };
        })
      );

      detailedStats.sort((a, b) => a.screenOrder - b.screenOrder);

      // Overall stats
      const totalSessions = await prisma.appPreviewAnalytic.findMany({
        where: filter,
        distinct: ['sessionId'],
        select: { sessionId: true },
      });

      const convertedUsers = await prisma.appPreviewAnalytic.count({
        where: { ...filter, userId: { not: null } },
      });

      const overallStats = {
        totalSessions: totalSessions.length,
        convertedToUsers: convertedUsers,
        conversionRate: totalSessions.length > 0 ? (convertedUsers / totalSessions.length) * 100 : 0,
      };

      logger.info('App preview analytics retrieved');
      sendSuccess(res, { overallStats, screenStats: detailedStats }, 'App preview analytics retrieved');
    } catch (error) {
      logger.error('Failed to get app preview analytics', { error });
      next(error);
    }
  }

  // ============================================================================
  // USER SETUP (Post-Authentication)
  // ============================================================================

  /**
   * Get user setup screens (authenticated)
   * @route GET /v2/onboarding/user-setup/screens
   */
  static async getUserSetupScreens(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      // Get all active user setup screens
      const screens = await prisma.userSetupScreen.findMany({
        where: { isActive: true },
        orderBy: { screenOrder: 'asc' },
        select: {
          id: true,
          screenOrder: true,
          screenType: true,
          title: true,
          subtitle: true,
          description: true,
          imageUrl: true,
          videoUrl: true,
          iconName: true,
          ctaText: true,
          ctaAction: true,
          ctaUrl: true,
          backgroundColor: true,
          textColor: true,
          isRequired: true,
          isSkippable: true,
          requiredFields: true,
          metadata: true,
        },
      });

      // Get user's completion status for each screen
      const analytics = await prisma.userSetupAnalytic.findMany({
        where: {
          userId,
          screenId: { in: screens.map((s) => s.id) },
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

      const analyticsMap = new Map(analytics.map((a) => [a.screenId, a]));

      const screensWithStatus = screens.map((screen) => {
        const analytic = analyticsMap.get(screen.id);
        return {
          ...screen,
          status: {
            viewed: analytic?.viewed || false,
            viewedAt: analytic?.viewedAt || null,
            completed: analytic?.completed || false,
            completedAt: analytic?.completedAt || null,
            skipped: analytic?.skipped || false,
            skippedAt: analytic?.skippedAt || null,
          },
        };
      });

      logger.info('User setup screens fetched', { userId, count: screens.length });
      sendSuccess(res, { screens: screensWithStatus }, 'User setup screens retrieved successfully');
    } catch (error) {
      logger.error('Failed to fetch user setup screens', { error });
      next(error);
    }
  }

  /**
   * Track user setup screen action (authenticated)
   * @route POST /v2/onboarding/user-setup/track
   */
  static async trackUserSetupAction(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const { screenId, action, timeSpentSeconds, actionsTaken, deviceInfo, appVersion } = req.body;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      if (!screenId) {
        throw new AppError('Screen ID is required', 400);
      }

      if (!action) {
        throw new AppError('Action is required', 400);
      }

      const screen = await prisma.userSetupScreen.findUnique({
        where: { id: screenId },
      });

      if (!screen) {
        throw new AppError('User setup screen not found', 404);
      }

      // Check if record exists for this user and screen
      const existing = await prisma.userSetupAnalytic.findUnique({
        where: {
          screenId_userId: {
            screenId,
            userId,
          },
        },
      });

      const updateData: any = {
        timeSpentSeconds: timeSpentSeconds || null,
        deviceInfo: deviceInfo || null,
        appVersion: appVersion || null,
      };

      if (action === 'view') {
        updateData.viewed = true;
        updateData.viewedAt = new Date();
      } else if (action === 'complete') {
        updateData.completed = true;
        updateData.completedAt = new Date();
        updateData.actionsTaken = actionsTaken || null;
      } else if (action === 'skip') {
        updateData.skipped = true;
        updateData.skippedAt = new Date();
      }

      if (existing) {
        // Update existing record
        await prisma.userSetupAnalytic.update({
          where: { id: existing.id },
          data: updateData,
        });
      } else {
        // Create new record
        await prisma.userSetupAnalytic.create({
          data: {
            id: crypto.randomUUID(),
            screenId,
            userId,
            ...updateData,
          },
        });
      }

      logger.info('User setup action tracked', { userId, screenId, action });
      sendSuccess(res, null, 'User setup action tracked successfully');
    } catch (error) {
      logger.error('Failed to track user setup action', { error });
      next(error);
    }
  }

  /**
   * Get user setup completion status (authenticated)
   * @route GET /v2/onboarding/user-setup/status
   */
  static async getUserSetupStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      // Get all active screens
      const activeScreens = await prisma.userSetupScreen.findMany({
        where: { isActive: true },
        select: { 
          id: true, 
          screenOrder: true, 
          screenType: true,
          title: true,
          isRequired: true,
        },
        orderBy: { screenOrder: 'asc' },
      });

      // Get user's analytics records
      const analytics = await prisma.userSetupAnalytic.findMany({
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

      const analyticsMap = new Map(analytics.map((a) => [a.screenId, a]));

      const screenStatus = activeScreens.map((screen) => {
        const analytic = analyticsMap.get(screen.id);
        return {
          screenId: screen.id,
          screenOrder: screen.screenOrder,
          screenType: screen.screenType,
          title: screen.title,
          isRequired: screen.isRequired,
          viewed: analytic?.viewed || false,
          viewedAt: analytic?.viewedAt || null,
          completed: analytic?.completed || false,
          completedAt: analytic?.completedAt || null,
          skipped: analytic?.skipped || false,
          skippedAt: analytic?.skippedAt || null,
        };
      });

      const totalScreens = activeScreens.length;
      const requiredScreens = activeScreens.filter((s) => s.isRequired).length;
      const viewedCount = screenStatus.filter((s) => s.viewed).length;
      const completedCount = screenStatus.filter((s) => s.completed).length;
      const skippedCount = screenStatus.filter((s) => s.skipped).length;
      const requiredCompletedCount = screenStatus.filter(
        (s) => s.isRequired && s.completed
      ).length;

      // User setup is complete if all required screens are completed
      const isCompleted = requiredScreens > 0 
        ? requiredCompletedCount === requiredScreens 
        : completedCount === totalScreens;

      logger.info('User setup status retrieved', { userId, isCompleted });
      sendSuccess(
        res,
        {
          userId,
          isCompleted,
          totalScreens,
          requiredScreens,
          viewedCount,
          completedCount,
          skippedCount,
          requiredCompletedCount,
          progress: totalScreens > 0 ? (completedCount / totalScreens) * 100 : 0,
          requiredProgress: requiredScreens > 0 ? (requiredCompletedCount / requiredScreens) * 100 : 100,
          screens: screenStatus,
        },
        'User setup status retrieved successfully'
      );
    } catch (error) {
      logger.error('Failed to get user setup status', { error });
      next(error);
    }
  }

  /**
   * Mark user setup as completed (authenticated)
   * @route POST /v2/onboarding/user-setup/complete
   */
  static async completeUserSetup(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      // Get all required screens
      const requiredScreens = await prisma.userSetupScreen.findMany({
        where: { isActive: true, isRequired: true },
        select: { id: true },
      });

      // Check if all required screens are completed
      const completedRequired = await prisma.userSetupAnalytic.count({
        where: {
          userId,
          screenId: { in: requiredScreens.map((s) => s.id) },
          completed: true,
        },
      });

      if (completedRequired < requiredScreens.length) {
        throw new AppError(
          `Please complete all required setup steps. ${completedRequired}/${requiredScreens.length} completed.`,
          400
        );
      }

      // Mark all screens as completed (including optional ones)
      const allScreens = await prisma.userSetupScreen.findMany({
        where: { isActive: true },
        select: { id: true },
      });

      for (const screen of allScreens) {
        await prisma.userSetupAnalytic.upsert({
          where: {
            screenId_userId: {
              screenId: screen.id,
              userId,
            },
          },
          update: {
            completed: true,
            completedAt: new Date(),
          },
          create: {
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

      logger.info('User setup completed', { userId });
      sendSuccess(res, null, 'User setup completed successfully');
    } catch (error) {
      logger.error('Failed to complete user setup', { error });
      next(error);
    }
  }

  /**
   * Get user setup analytics (admin)
   * @route GET /v2/onboarding/user-setup/analytics
   */
  static async getUserSetupAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { startDate, endDate, screenId, screenType } = req.query;

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

      // Get screen filter
      const screenFilter: any = { isActive: true };
      if (screenType) {
        screenFilter.screenType = screenType as string;
      }

      const screens = await prisma.userSetupScreen.findMany({
        where: screenFilter,
        select: { id: true, title: true, screenOrder: true, screenType: true, isRequired: true },
      });

      const screenIds = screens.map((s) => s.id);
      const screenMap = new Map(screens.map((s) => [s.id, s]));

      // Get detailed stats per screen
      const detailedStats = await Promise.all(
        screenIds.map(async (screenId) => {
          const screen = screenMap.get(screenId);
          const analyticsFilter = { ...filter, screenId };

          const [total, viewed, completed, skipped] = await Promise.all([
            prisma.userSetupAnalytic.count({ where: analyticsFilter }),
            prisma.userSetupAnalytic.count({ where: { ...analyticsFilter, viewed: true } }),
            prisma.userSetupAnalytic.count({ where: { ...analyticsFilter, completed: true } }),
            prisma.userSetupAnalytic.count({ where: { ...analyticsFilter, skipped: true } }),
          ]);

          const timeStats = await prisma.userSetupAnalytic.aggregate({
            where: { ...analyticsFilter, timeSpentSeconds: { not: null } },
            _avg: { timeSpentSeconds: true },
            _sum: { timeSpentSeconds: true },
          });

          return {
            screenId,
            screenTitle: screen?.title || 'Unknown',
            screenType: screen?.screenType || 'TUTORIAL',
            screenOrder: screen?.screenOrder || 0,
            isRequired: screen?.isRequired || false,
            totalUsers: total,
            viewedCount: viewed,
            completedCount: completed,
            skippedCount: skipped,
            completionRate: viewed > 0 ? (completed / viewed) * 100 : 0,
            skipRate: viewed > 0 ? (skipped / viewed) * 100 : 0,
            avgTimeSpentSeconds: timeStats._avg.timeSpentSeconds || 0,
          };
        })
      );

      detailedStats.sort((a, b) => a.screenOrder - b.screenOrder);

      // Overall stats
      const totalUsers = await prisma.userSetupAnalytic.findMany({
        where: filter,
        distinct: ['userId'],
        select: { userId: true },
      });

      const allScreens = screens.length;
      const requiredScreens = screens.filter((s) => s.isRequired).length;

      const usersWhoCompleted = await prisma.$queryRaw<Array<{ userId: string; completedCount: bigint }>>(
        Prisma.sql`SELECT "userId", COUNT(DISTINCT "screenId") as "completedCount"
         FROM "user_setup_analytics"
         WHERE "completed" = true
         GROUP BY "userId"
         HAVING COUNT(DISTINCT "screenId") >= ${requiredScreens > 0 ? requiredScreens : allScreens}`
      );

      const overallStats = {
        uniqueUsers: totalUsers.length,
        totalScreens: allScreens,
        requiredScreens,
        usersWhoCompleted: usersWhoCompleted.length,
        overallCompletionRate: totalUsers.length > 0 ? (usersWhoCompleted.length / totalUsers.length) * 100 : 0,
      };

      logger.info('User setup analytics retrieved');
      sendSuccess(res, { overallStats, screenStats: detailedStats }, 'User setup analytics retrieved');
    } catch (error) {
      logger.error('Failed to get user setup analytics', { error });
      next(error);
    }
  }
}
