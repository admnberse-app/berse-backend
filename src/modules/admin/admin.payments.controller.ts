import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../types';
import { sendSuccess } from '../../utils/response';
import adminPaymentsService from './admin.payments.service';

class AdminPaymentsController {
  /**
   * GET /v2/admin/payments/stats
   * Get payment statistics for dashboard
   */
  async getPaymentStats(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { startDate, endDate } = req.query;

      const start = startDate ? new Date(startDate as string) : undefined;
      const end = endDate ? new Date(endDate as string) : undefined;

      const stats = await adminPaymentsService.getPaymentStatistics(start, end);
      sendSuccess(res, stats, 'Payment statistics retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /v2/admin/payments
   * Get all payment transactions with filters and pagination
   */
  async getAllPayments(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const sortBy = (req.query.sortBy as string) || 'createdAt';
      const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

      const filters = {
        search: req.query.search as string,
        transactionType: req.query.type as string,
        status: req.query.status as string,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
        paymentMethod: req.query.paymentMethod as string,
      };

      const result = await adminPaymentsService.getPaymentTransactions({
        page,
        limit,
        filters,
        sortBy,
        sortOrder,
      });

      sendSuccess(res, result, 'Payment transactions retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /v2/admin/payments/:id
   * Get detailed transaction information
   */
  async getPaymentDetails(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const transaction = await adminPaymentsService.getTransactionDetails(id);
      sendSuccess(res, transaction, 'Transaction details retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /v2/admin/payments/methods/stats
   * Get payment method usage statistics
   */
  async getPaymentMethodStats(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { startDate, endDate } = req.query;

      const start = startDate ? new Date(startDate as string) : undefined;
      const end = endDate ? new Date(endDate as string) : undefined;

      const stats = await adminPaymentsService.getPaymentMethodStats(start, end);
      sendSuccess(res, stats, 'Payment method statistics retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

export default new AdminPaymentsController();
