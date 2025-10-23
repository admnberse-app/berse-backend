/**
 * Dashboard Controller
 * Handles HTTP requests for dashboard endpoints
 */

import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../types';
import { DashboardService } from './dashboard.service';
import { sendSuccess } from '../../utils/response';
import { AppError } from '../../middleware/error';

const dashboardService = new DashboardService();

export class DashboardController {
  /**
   * GET /v2/dashboard/summary
   * Get comprehensive dashboard overview
   */
  static async getSummary(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError('Unauthorized', 401);
      }

      const summary = await dashboardService.getDashboardSummary(userId);
      
      sendSuccess(res, summary, 'Dashboard summary retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /v2/dashboard/communities
   * Get user's communities with role information
   */
  static async getMyCommunities(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError('Unauthorized', 401);
      }

      const limit = parseInt(req.query.limit as string) || 50;

      const communities = await dashboardService.getMyCommunities(userId, limit);
      
      const summary = {
        total: communities.length,
        admin: communities.filter(c => c.userRole === 'admin').length,
        member: communities.filter(c => c.userRole === 'member').length,
      };

      sendSuccess(
        res,
        { communities, summary },
        'Communities retrieved successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /v2/dashboard/events
   * Get user's events (hosting and attending)
   */
  static async getMyEvents(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError('Unauthorized', 401);
      }

      const status = (req.query.status as 'upcoming' | 'past' | 'all') || 'upcoming';
      const limit = parseInt(req.query.limit as string) || 50;

      const events = await dashboardService.getMyEvents(userId, status, limit);
      
      const summary = {
        total: events.length,
        hosting: events.filter(e => e.userRole === 'host').length,
        attending: events.filter(e => e.userRole === 'attendee').length,
        upcoming: status === 'upcoming' ? events.length : 0,
      };

      sendSuccess(
        res,
        { events, summary },
        'Events retrieved successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /v2/dashboard/listings
   * Get user's marketplace listings
   */
  static async getMyListings(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError('Unauthorized', 401);
      }

      const status = req.query.status as 'active' | 'sold' | 'draft' | 'archived' | undefined;
      const limit = parseInt(req.query.limit as string) || 50;

      const listings = await dashboardService.getMyListings(userId, status, limit);
      
      const summary = {
        total: listings.length,
        active: listings.filter(l => l.status === 'active').length,
        sold: listings.filter(l => l.status === 'sold').length,
        draft: listings.filter(l => l.status === 'draft').length,
      };

      sendSuccess(
        res,
        { listings, summary },
        'Listings retrieved successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /v2/dashboard/activity
   * Get user's recent activity feed
   */
  static async getActivity(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError('Unauthorized', 401);
      }

      const limit = parseInt(req.query.limit as string) || 20;

      const activities = await dashboardService.getRecentActivity(userId, limit);

      sendSuccess(
        res,
        { activities, hasMore: activities.length === limit },
        'Activity feed retrieved successfully'
      );
    } catch (error) {
      next(error);
    }
  }
}
