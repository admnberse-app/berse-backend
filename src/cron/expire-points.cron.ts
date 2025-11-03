import * as cron from 'node-cron';
import { PointsService } from '../services/points.service';
import { POINT_EXPIRY_CONFIG } from '../config/points-expiry.config';
import logger from '../utils/logger';

/**
 * Cron job to expire points that have passed their expiry date
 * Runs daily at 3:00 AM UTC
 */
export class PointExpiryCron {
  private static job: cron.ScheduledTask | null = null;
  private static isRunning = false;

  /**
   * Start the cron job
   */
  static start(): void {
    if (this.job) {
      logger.info('Point expiry cron job is already running');
      return;
    }

    // Schedule: Daily at 3:00 AM UTC
    this.job = cron.schedule(POINT_EXPIRY_CONFIG.CRON_SCHEDULE, async () => {
      await this.executeExpiryTask();
    });

    logger.info(`✅ Point expiry cron job started (${POINT_EXPIRY_CONFIG.CRON_SCHEDULE})`);
  }

  /**
   * Stop the cron job
   */
  static stop(): void {
    if (this.job) {
      this.job.stop();
      this.job = null;
      logger.info('Point expiry cron job stopped');
    }
  }

  /**
   * Execute the point expiry task
   * Processes in batches with delay to avoid database overload
   * Also sends expiry warning notifications
   */
  static async executeExpiryTask(): Promise<void> {
    if (this.isRunning) {
      logger.warn('Point expiry task is already running. Skipping this execution.');
      return;
    }

    this.isRunning = true;
    const startTime = Date.now();
    
    try {
      logger.info('🔄 Starting point expiry task...');

      // Step 1: Send expiry warnings (30, 7, 1 day)
      try {
        const warnings30 = await PointsService.sendExpiryWarnings(30);
        const warnings7 = await PointsService.sendExpiryWarnings(7);
        const warnings1 = await PointsService.sendExpiryWarnings(1);
        
        const totalWarnings = warnings30 + warnings7 + warnings1;
        if (totalWarnings > 0) {
          logger.info(`📧 Sent ${totalWarnings} expiry warning notifications (30d: ${warnings30}, 7d: ${warnings7}, 1d: ${warnings1})`);
        }
      } catch (error) {
        logger.error('Failed to send expiry warnings:', error);
        // Continue with expiry process even if warnings fail
      }

      // Step 2: Expire points
      let totalExpired = 0;
      let totalPointsExpired = 0;
      let batchNumber = 1;
      let hasMore = true;

      while (hasMore) {
        try {
          const result = await PointsService.expirePoints(
            POINT_EXPIRY_CONFIG.BATCH_PROCESSING.BATCH_SIZE
          );

          if (result.expired === 0) {
            hasMore = false;
          } else {
            totalExpired += result.expired;
            totalPointsExpired += result.pointsExpired;

            logger.info(
              `Batch ${batchNumber}: Expired ${result.expired} records (${result.pointsExpired} points)`
            );

            batchNumber++;

            // Add delay between batches to avoid overwhelming database
            if (hasMore) {
              await this.delay(POINT_EXPIRY_CONFIG.BATCH_PROCESSING.BATCH_DELAY_MS);
            }
          }
        } catch (error) {
          logger.error(`Error in batch ${batchNumber}:`, error);
          // Continue with next batch even if one fails
          hasMore = false;
        }
      }

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);

      if (totalExpired > 0) {
        logger.info(
          `✅ Point expiry task completed: ${totalExpired} records expired, ${totalPointsExpired} points total (${duration}s)`
        );
      } else {
        logger.info(`✅ Point expiry task completed: No points to expire (${duration}s)`);
      }

    } catch (error) {
      logger.error('❌ Point expiry task failed:', error);
      throw error;
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Manually trigger the expiry task (for testing/admin)
   */
  static async runNow(): Promise<void> {
    logger.info('⚡ Manually triggering point expiry task...');
    await this.executeExpiryTask();
  }

  /**
   * Delay helper for batching
   */
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get job status
   */
  static getStatus(): { isScheduled: boolean; isRunning: boolean; schedule: string } {
    return {
      isScheduled: this.job !== null,
      isRunning: this.isRunning,
      schedule: POINT_EXPIRY_CONFIG.CRON_SCHEDULE,
    };
  }
}
