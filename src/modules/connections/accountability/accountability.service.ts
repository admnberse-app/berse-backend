import { prisma } from '../../../config/database';
import { AccountabilityImpact } from '@prisma/client';
import { AppError } from '../../../middleware/error';
import { TrustScoreService } from '../trust/trust-score.service';
import { NotificationService } from '../../../services/notification.service';
import logger from '../../../utils/logger';

/**
 * Accountability Service
 * Implements the accountability chain where vouchers are affected by their vouchees' behavior
 * Formula:
 * - Negative behavior: Voucher penalty = vouchee penalty × 0.4
 * - Positive behavior: Voucher reward = vouchee reward × 0.2
 */
export class AccountabilityService {
  /**
   * Record an accountability event (doesn't process immediately)
   */
  static async recordAccountabilityEvent(
    voucheeId: string,
    impactType: AccountabilityImpact,
    impactValue: number,
    reason: string,
    relatedEntityType?: string,
    relatedEntityId?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      // Find all active vouchers for this vouchee
      const vouches = await prisma.vouch.findMany({
        where: {
          voucheeId,
          status: { in: ['APPROVED', 'ACTIVE'] },
        },
        select: {
          id: true,
          voucherId: true,
          vouchType: true,
        },
      });

      if (vouches.length === 0) {
        logger.info(`No active vouchers found for vouchee ${voucheeId}, skipping accountability`);
        return;
      }

      // Create accountability log for each voucher
      const accountabilityLogs = vouches.map(vouch => ({
        voucherId: vouch.voucherId,
        voucheeId,
        chainId: vouch.id,
        impactType,
        impactValue,
        description: reason,
        relatedEntityType,
        relatedEntityId,
        metadata: metadata ? metadata : undefined,
        isProcessed: false,
      }));

      await prisma.accountabilityLog.createMany({
        data: accountabilityLogs,
      });

      logger.info(
        `Recorded ${accountabilityLogs.length} accountability events for vouchee ${voucheeId}`
      );

      // Process accountability immediately for real-time impact
      const createdLogs = await prisma.accountabilityLog.findMany({
        where: {
          voucheeId,
          isProcessed: false,
        },
        orderBy: { occurredAt: 'desc' },
        take: accountabilityLogs.length,
      });

      for (const log of createdLogs) {
        await this.processAccountability(log.id);
      }
    } catch (error) {
      logger.error('Error recording accountability event:', error);
      throw new AppError('Failed to record accountability event', 500);
    }
  }

  /**
   * Process a single accountability event and apply impact to voucher
   */
  static async processAccountability(logId: string): Promise<void> {
    try {
      const log = await prisma.accountabilityLog.findUnique({
        where: { id: logId },
        include: {
          voucher: {
            select: {
              id: true,
              fullName: true,
              trustScore: true,
            },
          },
          vouchee: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
      });

      if (!log) {
        throw new AppError('Accountability log not found', 404);
      }

      if (log.isProcessed) {
        logger.info(`Accountability log ${logId} already processed`);
        return;
      }

      // Calculate voucher impact based on vouchee impact
      let voucherImpact = 0;
      
      if (log.impactType === AccountabilityImpact.NEGATIVE) {
        // Negative: Voucher gets 40% of the penalty
        voucherImpact = log.impactValue * 0.4;
      } else if (log.impactType === AccountabilityImpact.POSITIVE) {
        // Positive: Voucher gets 20% of the reward
        voucherImpact = log.impactValue * 0.2;
      }
      // NEUTRAL has no impact on voucher

      // Apply trust score impact to voucher
      if (voucherImpact !== 0) {
        const previousScore = log.voucher.trustScore;
        const newScore = Math.max(0, Math.min(100, previousScore + voucherImpact));

        await prisma.user.update({
          where: { id: log.voucherId },
          data: { trustScore: newScore },
        });

        // Record score change in history
        const { TrustScoreUserService } = await import('../../user/trust-score.service');
        await TrustScoreUserService.recordScoreChange(
          log.voucherId,
          newScore,
          previousScore,
          `Accountability: ${log.vouchee.fullName}'s ${log.impactType.toLowerCase()} behavior`,
          'activity',
          log.relatedEntityType || 'accountability',
          log.relatedEntityId || logId,
          {
            voucheeId: log.voucheeId,
            voucheeName: log.vouchee.fullName,
            impactType: log.impactType,
            voucheeImpact: log.impactValue,
            voucherImpact,
          }
        );

        logger.info(
          `Applied accountability impact to voucher ${log.voucherId}: ${voucherImpact} (${previousScore} → ${newScore})`
        );

        // Notify voucher about the impact
        await this.notifyVoucherAboutImpact(
          log.voucherId,
          log.voucheeId,
          log.vouchee.fullName,
          log.impactType,
          voucherImpact,
          log.description || 'Behavior impact'
        );
      }

      // Mark as processed
      await prisma.accountabilityLog.update({
        where: { id: logId },
        data: {
          isProcessed: true,
          processedAt: new Date(),
        },
      });

      logger.info(`Processed accountability log ${logId}`);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Error processing accountability:', error);
      throw new AppError('Failed to process accountability', 500);
    }
  }

  /**
   * Get accountability impact summary for a user (as voucher)
   */
  static async getAccountabilityImpact(
    userId: string
  ): Promise<{
    totalLogs: number;
    positiveCount: number;
    negativeCount: number;
    neutralCount: number;
    totalImpact: number;
    vouchees: Array<{
      voucheeId: string;
      voucheeName: string;
      logCount: number;
      totalImpact: number;
      lastOccurredAt: Date;
    }>;
    recentLogs: Array<{
      id: string;
      voucheeName: string;
      impactType: AccountabilityImpact;
      impactValue: number;
      description: string | null;
      occurredAt: Date;
      isProcessed: boolean;
    }>;
  }> {
    try {
      const logs = await prisma.accountabilityLog.findMany({
        where: { voucherId: userId },
        include: {
          vouchee: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
        orderBy: { occurredAt: 'desc' },
      });

      const totalLogs = logs.length;
      const positiveCount = logs.filter(l => l.impactType === AccountabilityImpact.POSITIVE).length;
      const negativeCount = logs.filter(l => l.impactType === AccountabilityImpact.NEGATIVE).length;
      const neutralCount = logs.filter(l => l.impactType === AccountabilityImpact.NEUTRAL).length;

      // Calculate total impact
      const totalImpact = logs.reduce((sum, log) => {
        if (log.impactType === AccountabilityImpact.NEGATIVE) {
          return sum + log.impactValue * 0.4;
        } else if (log.impactType === AccountabilityImpact.POSITIVE) {
          return sum + log.impactValue * 0.2;
        }
        return sum;
      }, 0);

      // Group by vouchee
      const voucheeMap = new Map<
        string,
        {
          voucheeId: string;
          voucheeName: string;
          logCount: number;
          totalImpact: number;
          lastOccurredAt: Date;
        }
      >();

      logs.forEach(log => {
        const existing = voucheeMap.get(log.voucheeId);
        let impact = 0;
        if (log.impactType === AccountabilityImpact.NEGATIVE) {
          impact = log.impactValue * 0.4;
        } else if (log.impactType === AccountabilityImpact.POSITIVE) {
          impact = log.impactValue * 0.2;
        }

        if (existing) {
          existing.logCount++;
          existing.totalImpact += impact;
          if (log.occurredAt > existing.lastOccurredAt) {
            existing.lastOccurredAt = log.occurredAt;
          }
        } else {
          voucheeMap.set(log.voucheeId, {
            voucheeId: log.voucheeId,
            voucheeName: log.vouchee.fullName,
            logCount: 1,
            totalImpact: impact,
            lastOccurredAt: log.occurredAt,
          });
        }
      });

      const vouchees = Array.from(voucheeMap.values()).sort(
        (a, b) => b.lastOccurredAt.getTime() - a.lastOccurredAt.getTime()
      );

      const recentLogs = logs.slice(0, 10).map(log => ({
        id: log.id,
        voucheeName: log.vouchee.fullName,
        impactType: log.impactType,
        impactValue: log.impactValue,
        description: log.description,
        occurredAt: log.occurredAt,
        isProcessed: log.isProcessed,
      }));

      return {
        totalLogs,
        positiveCount,
        negativeCount,
        neutralCount,
        totalImpact: Math.round(totalImpact * 100) / 100,
        vouchees,
        recentLogs,
      };
    } catch (error) {
      logger.error('Error getting accountability impact:', error);
      throw new AppError('Failed to get accountability impact', 500);
    }
  }

  /**
   * Get accountability history for a user (as vouchee)
   */
  static async getAccountabilityHistory(
    userId: string,
    options?: {
      page?: number;
      limit?: number;
      impactType?: AccountabilityImpact;
    }
  ): Promise<{
    logs: Array<{
      id: string;
      voucherName: string;
      impactType: AccountabilityImpact;
      impactValue: number;
      description: string | null;
      occurredAt: Date;
      isProcessed: boolean;
    }>;
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    try {
      const page = options?.page || 1;
      const limit = options?.limit || 20;
      const skip = (page - 1) * limit;

      const where: any = { voucheeId: userId };
      if (options?.impactType) {
        where.impactType = options.impactType;
      }

      const [logs, total] = await Promise.all([
        prisma.accountabilityLog.findMany({
          where,
          include: {
            voucher: {
              select: {
                fullName: true,
              },
            },
          },
          orderBy: { occurredAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.accountabilityLog.count({ where }),
      ]);

      return {
        logs: logs.map(log => ({
          id: log.id,
          voucherName: log.voucher.fullName,
          impactType: log.impactType,
          impactValue: log.impactValue,
          description: log.description,
          occurredAt: log.occurredAt,
          isProcessed: log.isProcessed,
        })),
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Error getting accountability history:', error);
      throw new AppError('Failed to get accountability history', 500);
    }
  }

  /**
   * Notify voucher about accountability impact
   */
  private static async notifyVoucherAboutImpact(
    voucherId: string,
    voucheeId: string,
    voucheeName: string,
    impactType: AccountabilityImpact,
    impact: number,
    description: string
  ): Promise<void> {
    try {
      const impactText = impact > 0 ? `+${impact.toFixed(1)}` : impact.toFixed(1);
      const emoji = impactType === AccountabilityImpact.POSITIVE ? '🌟' : '⚠️';
      
      await NotificationService.createNotification({
        userId: voucherId,
        type: 'VOUCH',
        title: `${emoji} Accountability Impact`,
        message: `${voucheeName}'s ${impactType.toLowerCase()} behavior affected your trust score by ${impactText} points. ${description}`,
        metadata: {
          type: 'accountability_impact',
          voucheeId,
          voucheeName,
          impactType,
          impact,
          description,
        },
        actionUrl: `/connections/${voucheeId}`,
      });

      logger.info(`Notified voucher ${voucherId} about accountability impact from ${voucheeId}`);
    } catch (error) {
      logger.error('Error notifying voucher about impact:', error);
      // Don't throw - notification failure shouldn't stop accountability processing
    }
  }

  /**
   * Process all unprocessed accountability logs (for batch jobs)
   */
  static async processUnprocessedLogs(): Promise<number> {
    try {
      const unprocessedLogs = await prisma.accountabilityLog.findMany({
        where: { isProcessed: false },
        orderBy: { occurredAt: 'asc' },
      });

      logger.info(`Found ${unprocessedLogs.length} unprocessed accountability logs`);

      let processed = 0;
      for (const log of unprocessedLogs) {
        try {
          await this.processAccountability(log.id);
          processed++;
        } catch (error) {
          logger.error(`Failed to process accountability log ${log.id}:`, error);
        }
      }

      logger.info(`Processed ${processed} of ${unprocessedLogs.length} accountability logs`);
      return processed;
    } catch (error) {
      logger.error('Error processing unprocessed logs:', error);
      throw new AppError('Failed to process unprocessed logs', 500);
    }
  }
}
