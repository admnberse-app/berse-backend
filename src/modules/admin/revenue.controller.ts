import { Request, Response } from 'express';
import { RevenueService } from '../../services/revenue.service';
import { sendSuccess, sendError } from '../../utils/response';
import logger from '../../utils/logger';
import { AppError } from '../../middleware/error';

/**
 * Admin Revenue Controller
 * Handles admin endpoints for platform revenue tracking and analytics
 */
export class AdminRevenueController {
  
  /**
   * @route   GET /api/admin/revenue/summary
   * @desc    Get platform revenue summary
   * @access  Admin only
   */
  static async getRevenueSummary(req: Request, res: Response): Promise<void> {
    try {
      const { startDate, endDate, transactionType, currency } = req.query;

      const filters: any = {};
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);
      if (transactionType) filters.transactionType = transactionType as string;
      if (currency) filters.currency = currency as string;

      const summary = await RevenueService.getPlatformRevenueSummary(filters);

      sendSuccess(res, summary, 'Platform revenue summary retrieved successfully');
    } catch (error) {
      logger.error('[AdminRevenueController] Failed to get revenue summary:', error);
      sendError(res, error);
    }
  }

  /**
   * @route   GET /api/admin/revenue/details
   * @desc    Get detailed platform revenue breakdown
   * @access  Admin only
   */
  static async getRevenueDetails(req: Request, res: Response): Promise<void> {
    try {
      const { startDate, endDate, transactionType, currency, limit, offset } = req.query;

      const filters: any = {};
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);
      if (transactionType) filters.transactionType = transactionType as string;
      if (currency) filters.currency = currency as string;
      if (limit) filters.limit = parseInt(limit as string);
      if (offset) filters.offset = parseInt(offset as string);

      const details = await RevenueService.getPlatformRevenueDetails(filters);

      sendSuccess(res, details, 'Platform revenue details retrieved successfully');
    } catch (error) {
      logger.error('[AdminRevenueController] Failed to get revenue details:', error);
      sendError(res, error);
    }
  }

  /**
   * @route   GET /api/admin/revenue/analytics
   * @desc    Get revenue analytics by time period
   * @access  Admin only
   */
  static async getRevenueAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { period, startDate, endDate, transactionType } = req.query;

      if (!period || !['daily', 'weekly', 'monthly'].includes(period as string)) {
        throw new AppError('Invalid period. Must be: daily, weekly, or monthly', 400);
      }

      const filters: any = {};
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);
      if (transactionType) filters.transactionType = transactionType as string;

      const analytics = await RevenueService.getRevenueAnalytics(
        period as 'daily' | 'weekly' | 'monthly',
        filters
      );

      sendSuccess(res, analytics, 'Revenue analytics retrieved successfully');
    } catch (error) {
      logger.error('[AdminRevenueController] Failed to get revenue analytics:', error);
      sendError(res, error);
    }
  }

  /**
   * @route   GET /api/admin/revenue/pending-sync
   * @desc    Check for payments that haven't been distributed to platform payouts
   * @access  Admin only
   */
  static async getPendingRevenueSync(req: Request, res: Response): Promise<void> {
    try {
      const pendingSync = await RevenueService.getPendingRevenueSync();

      sendSuccess(res, pendingSync, 'Pending revenue sync checked successfully');
    } catch (error) {
      logger.error('[AdminRevenueController] Failed to check pending revenue sync:', error);
      sendError(res, error);
    }
  }

  /**
   * @route   GET /api/admin/revenue/comparison
   * @desc    Compare revenue between two time periods
   * @access  Admin only
   */
  static async getRevenueComparison(req: Request, res: Response): Promise<void> {
    try {
      const { currentStart, currentEnd, previousStart, previousEnd } = req.query;

      if (!currentStart || !currentEnd || !previousStart || !previousEnd) {
        throw new AppError('All date parameters are required: currentStart, currentEnd, previousStart, previousEnd', 400);
      }

      const comparison = await RevenueService.getRevenueComparison(
        {
          start: new Date(currentStart as string),
          end: new Date(currentEnd as string),
        },
        {
          start: new Date(previousStart as string),
          end: new Date(previousEnd as string),
        }
      );

      sendSuccess(res, comparison, 'Revenue comparison retrieved successfully');
    } catch (error) {
      logger.error('[AdminRevenueController] Failed to get revenue comparison:', error);
      sendError(res, error);
    }
  }
}
