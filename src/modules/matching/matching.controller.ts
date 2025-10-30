import { Request, Response } from 'express';
import { matchingService } from './matching.service';
import { sendSuccess, sendError } from '../../utils/response';
import { SwipeAction } from '@prisma/client';
import { DiscoveryFilters } from './matching.types';

export class MatchingController {
  /**
   * Get discovery users
   * @route GET /v2/matching/discover
   */
  async getDiscoveryUsers(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      
      const filters: DiscoveryFilters = {
        minAge: req.query.minAge ? parseInt(req.query.minAge as string) : undefined,
        maxAge: req.query.maxAge ? parseInt(req.query.maxAge as string) : undefined,
        distance: req.query.distance ? parseInt(req.query.distance as string) : undefined,
        gender: req.query.gender as string,
        interests: req.query.interests ? (req.query.interests as string).split(',') : undefined,
        city: req.query.city as string,
        onlyVerified: req.query.onlyVerified === 'true',
        minTrustScore: req.query.minTrustScore ? parseFloat(req.query.minTrustScore as string) : undefined,
      };

      const latitude = req.query.latitude ? parseFloat(req.query.latitude as string) : undefined;
      const longitude = req.query.longitude ? parseFloat(req.query.longitude as string) : undefined;
      const sessionId = req.query.sessionId as string | undefined;

      const result = await matchingService.getDiscoveryUsers(
        userId,
        filters,
        latitude,
        longitude,
        sessionId
      );

      sendSuccess(res, result, 'Discovery users retrieved successfully');
    } catch (error: any) {
      sendError(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Record swipe action
   * @route POST /v2/matching/swipe
   */
  async recordSwipe(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { targetUserId, action, sessionId } = req.body;

      const result = await matchingService.recordSwipe(userId, {
        targetUserId,
        action,
        sessionId,
      });

      sendSuccess(res, result, 'Swipe recorded successfully');
    } catch (error: any) {
      sendError(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Mark connection request as sent
   * @route POST /v2/matching/connection-sent
   */
  async markConnectionSent(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { targetUserId, connectionId } = req.body;

      await matchingService.markConnectionSent(userId, targetUserId, connectionId);

      sendSuccess(res, null, 'Connection status updated');
    } catch (error: any) {
      sendError(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Get swipe statistics
   * @route GET /v2/matching/stats
   */
  async getSwipeStats(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const stats = await matchingService.getSwipeStats(userId);

      sendSuccess(res, stats, 'Swipe statistics retrieved successfully');
    } catch (error: any) {
      sendError(res, error.message, error.statusCode || 500);
    }
  }
}

export const matchingController = new MatchingController();
