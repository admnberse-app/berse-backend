import { Request, Response } from 'express';
import { AccountabilityService } from './accountability.service';
import { AppError } from '../../../middleware/error';

export class AccountabilityController {
  /**
   * GET /api/v2/accountability/history/:userId
   * Get accountability history for a user (as vouchee)
   */
  async getAccountabilityHistory(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { page, limit, impactType } = req.query;

      // Verify user is authenticated and accessing their own data or is admin
      const authenticatedUserId = req.user?.id;
      if (authenticatedUserId !== userId && req.user?.role !== 'ADMIN') {
        throw new AppError('You can only view your own accountability history', 403);
      }

      const result = await AccountabilityService.getAccountabilityHistory(userId, {
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        impactType: impactType as any,
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Failed to get accountability history',
        });
      }
    }
  }

  /**
   * GET /api/v2/accountability/impact/:userId
   * Get accountability impact summary for a user (as voucher)
   */
  async getAccountabilityImpact(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      // Verify user is authenticated and accessing their own data or is admin
      const authenticatedUserId = req.user?.id;
      if (authenticatedUserId !== userId && req.user?.role !== 'ADMIN') {
        throw new AppError('You can only view your own accountability impact', 403);
      }

      const result = await AccountabilityService.getAccountabilityImpact(userId);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Failed to get accountability impact',
        });
      }
    }
  }

  /**
   * POST /api/v2/accountability/process/:logId
   * Process a specific accountability log (admin only)
   */
  async processAccountabilityLog(req: Request, res: Response) {
    try {
      const { logId } = req.params;

      // Verify user is admin
      if (req.user?.role !== 'ADMIN') {
        throw new AppError('Only admins can manually process accountability logs', 403);
      }

      await AccountabilityService.processAccountability(logId);

      res.json({
        success: true,
        message: 'Accountability log processed successfully',
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Failed to process accountability log',
        });
      }
    }
  }

  /**
   * POST /api/v2/accountability/process-all
   * Process all unprocessed accountability logs (admin only)
   */
  async processAllUnprocessedLogs(req: Request, res: Response) {
    try {
      // Verify user is admin
      if (req.user?.role !== 'ADMIN') {
        throw new AppError('Only admins can process all accountability logs', 403);
      }

      const processed = await AccountabilityService.processUnprocessedLogs();

      res.json({
        success: true,
        message: `Processed ${processed} accountability logs`,
        data: { processed },
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Failed to process accountability logs',
        });
      }
    }
  }
}

export const accountabilityController = new AccountabilityController();
