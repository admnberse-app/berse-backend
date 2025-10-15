import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
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
}
