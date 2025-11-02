/**
 * Feature Usage Tracking Service
 * Records and tracks user feature usage for subscription limits
 */

import { prisma } from '../config/database';
import { FeatureCode } from '../types/subscription.types';

export interface RecordUsageParams {
  userId: string;
  subscriptionId?: string;
  featureCode: FeatureCode;
  entityType: string;
  entityId?: string;
  metadata?: Record<string, any>;
}

class FeatureUsageService {
  /**
   * Record a feature usage event
   */
  async recordFeatureUsage(params: RecordUsageParams): Promise<void> {
    try {
      const {
        userId,
        subscriptionId,
        featureCode,
        entityType,
        entityId,
        metadata,
      } = params;

      // Calculate current period (monthly)
      const now = new Date();
      const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

      await prisma.featureUsage.create({
        data: {
          userId,
          subscriptionId,
          featureCode: featureCode as string,
          entityType,
          entityId,
          usedAt: now,
          periodStart,
          periodEnd,
          metadata: metadata || null,
        },
      });

      console.log(`[FeatureUsage] Recorded: ${featureCode} for user ${userId}`);
    } catch (error) {
      console.error('[FeatureUsage] Failed to record usage:', error);
      // Don't throw - usage tracking shouldn't break the main flow
    }
  }

  /**
   * Get usage count for a specific feature in current period
   */
  async getUsageCount(
    userId: string,
    featureCode: FeatureCode,
    periodStart?: Date
  ): Promise<number> {
    try {
      const start = periodStart || new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      const end = new Date(start.getFullYear(), start.getMonth() + 1, 0, 23, 59, 59, 999);

      return await prisma.featureUsage.count({
        where: {
          userId,
          featureCode: featureCode as string,
          usedAt: {
            gte: start,
            lte: end,
          },
        },
      });
    } catch (error) {
      console.error('[FeatureUsage] Failed to get usage count:', error);
      return 0;
    }
  }

  /**
   * Get all usage for a user in current period
   */
  async getUserUsage(userId: string, periodStart?: Date) {
    try {
      const start = periodStart || new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      const end = new Date(start.getFullYear(), start.getMonth() + 1, 0, 23, 59, 59, 999);

      const usage = await prisma.featureUsage.findMany({
        where: {
          userId,
          usedAt: {
            gte: start,
            lte: end,
          },
        },
        orderBy: { usedAt: 'desc' },
      });

      // Group by feature code
      const grouped: Record<string, number> = {};
      usage.forEach(u => {
        grouped[u.featureCode] = (grouped[u.featureCode] || 0) + 1;
      });

      return grouped;
    } catch (error) {
      console.error('[FeatureUsage] Failed to get user usage:', error);
      return {};
    }
  }

  /**
   * Check if user has reached limit for a feature
   */
  async hasReachedLimit(
    userId: string,
    featureCode: FeatureCode,
    limit: number
  ): Promise<boolean> {
    if (limit === -1) return false; // Unlimited
    
    const count = await this.getUsageCount(userId, featureCode);
    return count >= limit;
  }

  /**
   * Bulk record usage (for batch operations)
   */
  async recordBulkUsage(records: RecordUsageParams[]): Promise<void> {
    try {
      const now = new Date();
      const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

      await prisma.featureUsage.createMany({
        data: records.map(r => ({
          userId: r.userId,
          subscriptionId: r.subscriptionId,
          featureCode: r.featureCode as string,
          entityType: r.entityType,
          entityId: r.entityId,
          usedAt: now,
          periodStart,
          periodEnd,
          metadata: r.metadata || null,
        })),
      });

      console.log(`[FeatureUsage] Bulk recorded ${records.length} usages`);
    } catch (error) {
      console.error('[FeatureUsage] Failed to bulk record usage:', error);
    }
  }

  /**
   * Delete usage records for an entity (when entity is deleted)
   */
  async deleteEntityUsage(entityType: string, entityId: string): Promise<void> {
    try {
      await prisma.featureUsage.deleteMany({
        where: {
          entityType,
          entityId,
        },
      });

      console.log(`[FeatureUsage] Deleted usage for ${entityType}:${entityId}`);
    } catch (error) {
      console.error('[FeatureUsage] Failed to delete entity usage:', error);
    }
  }
}

// Export singleton instance
const featureUsageService = new FeatureUsageService();
export default featureUsageService;
