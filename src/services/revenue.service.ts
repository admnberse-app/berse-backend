import { PaymentStatus, PayoutStatus } from '@prisma/client';
import logger from '../utils/logger';
import { AppError } from '../middleware/error';
import prisma from '../lib/prisma';

/**
 * Revenue Service
 * Handles platform revenue tracking, analytics, and reporting
 */
export class RevenueService {
  
  /**
   * Get platform revenue summary
   * Fetches total platform fees collected across all transaction types
   */
  static async getPlatformRevenueSummary(filters?: {
    startDate?: Date;
    endDate?: Date;
    transactionType?: string;
    currency?: string;
  }) {
    try {
      const whereClause: any = {
        recipientType: 'platform',
        status: PayoutStatus.RELEASED,
      };

      if (filters?.startDate || filters?.endDate) {
        whereClause.releasedAt = {};
        if (filters.startDate) whereClause.releasedAt.gte = filters.startDate;
        if (filters.endDate) whereClause.releasedAt.lte = filters.endDate;
      }

      if (filters?.currency) {
        whereClause.currency = filters.currency;
      }

      // Get total platform revenue
      const totalRevenue = await prisma.payoutDistribution.aggregate({
        where: whereClause,
        _sum: {
          amount: true,
        },
        _count: {
          _all: true,
        },
      });

      // Group by transaction type
      const revenueByType = await prisma.payoutDistribution.groupBy({
        by: ['metadata'],
        where: whereClause,
        _sum: {
          amount: true,
        },
        _count: {
          _all: true,
        },
      });

      // Extract transaction types from metadata
      const typeBreakdown = revenueByType.map((item) => {
        const metadata = item.metadata as any;
        return {
          transactionType: metadata?.transactionType || 'UNKNOWN',
          totalAmount: item._sum.amount || 0,
          count: item._count._all,
        };
      });

      // Aggregate by transaction type
      const aggregatedByType: Record<string, { totalAmount: number; count: number }> = {};
      typeBreakdown.forEach((item) => {
        if (!aggregatedByType[item.transactionType]) {
          aggregatedByType[item.transactionType] = { totalAmount: 0, count: 0 };
        }
        aggregatedByType[item.transactionType].totalAmount += item.totalAmount;
        aggregatedByType[item.transactionType].count += item.count;
      });

      logger.info('[RevenueService] Platform revenue summary fetched', {
        totalRevenue: totalRevenue._sum.amount,
        transactionCount: totalRevenue._count._all,
      });

      return {
        totalRevenue: totalRevenue._sum.amount || 0,
        transactionCount: totalRevenue._count._all,
        currency: filters?.currency || 'MYR',
        breakdown: Object.entries(aggregatedByType).map(([type, data]) => ({
          transactionType: type,
          revenue: data.totalAmount,
          count: data.count,
        })),
        period: {
          startDate: filters?.startDate,
          endDate: filters?.endDate,
        },
      };
    } catch (error) {
      logger.error('[RevenueService] Failed to get platform revenue summary:', error);
      throw error instanceof AppError ? error : new AppError('Failed to fetch revenue summary', 500);
    }
  }

  /**
   * Get detailed platform revenue breakdown
   * Returns individual platform fee payouts with transaction details
   */
  static async getPlatformRevenueDetails(filters?: {
    startDate?: Date;
    endDate?: Date;
    transactionType?: string;
    currency?: string;
    limit?: number;
    offset?: number;
  }) {
    try {
      const whereClause: any = {
        recipientType: 'platform',
        status: PayoutStatus.RELEASED,
      };

      if (filters?.startDate || filters?.endDate) {
        whereClause.releasedAt = {};
        if (filters.startDate) whereClause.releasedAt.gte = filters.startDate;
        if (filters.endDate) whereClause.releasedAt.lte = filters.endDate;
      }

      if (filters?.currency) {
        whereClause.currency = filters.currency;
      }

      const limit = filters?.limit || 50;
      const offset = filters?.offset || 0;

      const [payouts, totalCount] = await Promise.all([
        prisma.payoutDistribution.findMany({
          where: whereClause,
          include: {
            paymentTransactions: {
              select: {
                id: true,
                transactionType: true,
                amount: true,
                currency: true,
                referenceType: true,
                referenceId: true,
                createdAt: true,
                userId: true,
              },
            },
          },
          orderBy: {
            releasedAt: 'desc',
          },
          take: limit,
          skip: offset,
        }),
        prisma.payoutDistribution.count({ where: whereClause }),
      ]);

      logger.info('[RevenueService] Platform revenue details fetched', {
        count: payouts.length,
        totalCount,
      });

      return {
        payouts: payouts.map((payout) => ({
          id: payout.id,
          amount: payout.amount,
          currency: payout.currency,
          releasedAt: payout.releasedAt,
          transactionType: (payout.metadata as any)?.transactionType,
          transaction: payout.paymentTransactions,
          metadata: payout.metadata,
        })),
        totalCount,
        limit,
        offset,
        hasMore: totalCount > offset + limit,
      };
    } catch (error) {
      logger.error('[RevenueService] Failed to get platform revenue details:', error);
      throw error instanceof AppError ? error : new AppError('Failed to fetch revenue details', 500);
    }
  }

  /**
   * Get revenue analytics by time period
   * Daily, weekly, or monthly aggregation
   */
  static async getRevenueAnalytics(period: 'daily' | 'weekly' | 'monthly', filters?: {
    startDate?: Date;
    endDate?: Date;
    transactionType?: string;
  }) {
    try {
      const whereClause: any = {
        recipientType: 'platform',
        status: PayoutStatus.RELEASED,
      };

      if (filters?.startDate || filters?.endDate) {
        whereClause.releasedAt = {};
        if (filters.startDate) whereClause.releasedAt.gte = filters.startDate;
        if (filters.endDate) whereClause.releasedAt.lte = filters.endDate;
      }

      const payouts = await prisma.payoutDistribution.findMany({
        where: whereClause,
        select: {
          amount: true,
          currency: true,
          releasedAt: true,
          metadata: true,
        },
        orderBy: {
          releasedAt: 'asc',
        },
      });

      // Group by time period
      const analytics: Record<string, { revenue: number; count: number }> = {};

      payouts.forEach((payout) => {
        if (!payout.releasedAt) return;

        let periodKey: string;
        const date = new Date(payout.releasedAt);

        switch (period) {
          case 'daily':
            periodKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
            break;
          case 'weekly':
            const weekStart = new Date(date);
            weekStart.setDate(date.getDate() - date.getDay());
            periodKey = weekStart.toISOString().split('T')[0];
            break;
          case 'monthly':
            periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            break;
        }

        if (!analytics[periodKey]) {
          analytics[periodKey] = { revenue: 0, count: 0 };
        }

        analytics[periodKey].revenue += payout.amount;
        analytics[periodKey].count += 1;
      });

      const result = Object.entries(analytics)
        .map(([period, data]) => ({
          period,
          revenue: data.revenue,
          transactionCount: data.count,
        }))
        .sort((a, b) => a.period.localeCompare(b.period));

      logger.info('[RevenueService] Revenue analytics fetched', {
        period,
        dataPoints: result.length,
      });

      return {
        period,
        data: result,
        totalRevenue: result.reduce((sum, item) => sum + item.revenue, 0),
        totalTransactions: result.reduce((sum, item) => sum + item.transactionCount, 0),
      };
    } catch (error) {
      logger.error('[RevenueService] Failed to get revenue analytics:', error);
      throw error instanceof AppError ? error : new AppError('Failed to fetch revenue analytics', 500);
    }
  }

  /**
   * Get pending revenue (from SUCCEEDED payments not yet in payout_distributions)
   * This helps identify if any payments haven't been distributed yet
   */
  static async getPendingRevenueSync() {
    try {
      // Get successful transactions
      const successfulTransactions = await prisma.paymentTransaction.findMany({
        where: {
          status: PaymentStatus.SUCCEEDED,
          platformFee: {
            gt: 0,
          },
        },
        select: {
          id: true,
          platformFee: true,
          currency: true,
          transactionType: true,
          createdAt: true,
        },
      });

      // Get existing platform payouts
      const existingPayouts = await prisma.payoutDistribution.findMany({
        where: {
          recipientType: 'platform',
        },
        select: {
          paymentTransactionId: true,
          amount: true,
        },
      });

      const existingPayoutMap = new Map(
        existingPayouts.map((p) => [p.paymentTransactionId, p.amount])
      );

      // Find transactions without platform payouts
      const missingPayouts = successfulTransactions.filter(
        (t) => !existingPayoutMap.has(t.id)
      );

      const totalPendingRevenue = missingPayouts.reduce(
        (sum, t) => sum + (t.platformFee || 0),
        0
      );

      logger.info('[RevenueService] Pending revenue sync checked', {
        missingPayouts: missingPayouts.length,
        totalPendingRevenue,
      });

      return {
        missingPayoutsCount: missingPayouts.length,
        totalPendingRevenue,
        transactions: missingPayouts.map((t) => ({
          transactionId: t.id,
          platformFee: t.platformFee,
          currency: t.currency,
          transactionType: t.transactionType,
          createdAt: t.createdAt,
        })),
      };
    } catch (error) {
      logger.error('[RevenueService] Failed to check pending revenue sync:', error);
      throw error instanceof AppError ? error : new AppError('Failed to check pending revenue', 500);
    }
  }

  /**
   * Get revenue comparison between periods
   */
  static async getRevenueComparison(currentPeriod: { start: Date; end: Date }, previousPeriod: { start: Date; end: Date }) {
    try {
      const [currentRevenue, previousRevenue] = await Promise.all([
        this.getPlatformRevenueSummary({ startDate: currentPeriod.start, endDate: currentPeriod.end }),
        this.getPlatformRevenueSummary({ startDate: previousPeriod.start, endDate: previousPeriod.end }),
      ]);

      const growth = previousRevenue.totalRevenue > 0
        ? ((currentRevenue.totalRevenue - previousRevenue.totalRevenue) / previousRevenue.totalRevenue) * 100
        : 0;

      const transactionGrowth = previousRevenue.transactionCount > 0
        ? ((currentRevenue.transactionCount - previousRevenue.transactionCount) / previousRevenue.transactionCount) * 100
        : 0;

      return {
        current: currentRevenue,
        previous: previousRevenue,
        growth: {
          revenue: growth,
          transactions: transactionGrowth,
        },
      };
    } catch (error) {
      logger.error('[RevenueService] Failed to get revenue comparison:', error);
      throw error instanceof AppError ? error : new AppError('Failed to compare revenue', 500);
    }
  }
}
