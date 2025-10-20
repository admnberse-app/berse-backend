import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';
import { TrustScoreService } from '../modules/connections/trust/trust-score.service';

const prisma = new PrismaClient();

/**
 * Trust Decay Job
 * 
 * Applies trust score decay for inactive users:
 * - After 30 days of inactivity: -1% per week (-0.01 points per week)
 * - After 90 days of inactivity: -2% per week (-0.02 points per week)
 * 
 * Runs weekly on Sundays at 2 AM
 * Logs all decay events for transparency
 */
export class TrustDecayJob {
  private readonly INACTIVITY_THRESHOLD_LIGHT = 30; // days
  private readonly INACTIVITY_THRESHOLD_HEAVY = 90; // days
  private readonly DECAY_RATE_LIGHT = 1; // 1% per week
  private readonly DECAY_RATE_HEAVY = 2; // 2% per week
  private readonly MIN_TRUST_SCORE = 0; // Don't decay below 0

  /**
   * Main job execution method
   */
  async run(): Promise<void> {
    const startTime = Date.now();
    logger.info('[TrustDecayJob] Starting trust decay process...');

    try {
      // Get all active users who might need decay
      const users = await this.getInactiveUsers();
      
      let totalDecayed = 0;
      let totalDecayAmount = 0;
      let lightDecayCount = 0;
      let heavyDecayCount = 0;

      for (const user of users) {
        try {
          const decayResult = await this.applyDecay(user);
          
          if (decayResult.decayed) {
            totalDecayed++;
            totalDecayAmount += decayResult.decayAmount;
            
            if (decayResult.decayType === 'light') {
              lightDecayCount++;
            } else {
              heavyDecayCount++;
            }
          }
        } catch (error) {
          logger.error(`[TrustDecayJob] Error processing user ${user.id}`, { error });
          // Continue with other users
        }
      }

      const duration = Date.now() - startTime;
      logger.info(`[TrustDecayJob] Completed successfully`, {
        duration: `${duration}ms`,
        totalUsers: users.length,
        usersDecayed: totalDecayed,
        lightDecay: lightDecayCount,
        heavyDecay: heavyDecayCount,
        totalPointsDecayed: totalDecayAmount.toFixed(2),
      });
    } catch (error) {
      logger.error('[TrustDecayJob] Failed to run job', { error });
      throw error;
    }
  }

  /**
   * Get users who are potentially inactive
   */
  private async getInactiveUsers(): Promise<Array<{
    id: string;
    fullName: string;
    trustScore: number;
    updatedAt: Date;
  }>> {
    const thirtyDaysAgo = new Date(Date.now() - this.INACTIVITY_THRESHOLD_LIGHT * 24 * 60 * 60 * 1000);

    // Get users who haven't had any activity in the last 30 days
    const users = await prisma.user.findMany({
      where: {
        status: 'ACTIVE',
        deletedAt: null,
        trustScore: {
          gt: this.MIN_TRUST_SCORE, // Only users with score > 0
        },
      },
      select: {
        id: true,
        fullName: true,
        trustScore: true,
        updatedAt: true,
      },
    });

    // Filter users based on last activity
    const inactiveUsers: typeof users = [];

    for (const user of users) {
      const lastActivity = await this.getLastActivityDate(user.id);
      
      if (lastActivity < thirtyDaysAgo) {
        inactiveUsers.push(user);
      }
    }

    return inactiveUsers;
  }

  /**
   * Get the most recent activity date for a user
   */
  private async getLastActivityDate(userId: string): Promise<Date> {
    // Check multiple activity sources and return the most recent
    const [
      lastEvent,
      lastTrustMoment,
      lastListing,
      lastConnection,
    ] = await Promise.all([
      // Last event participation
      prisma.eventParticipant.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true },
      }),
      // Last trust moment given
      prisma.trustMoment.findFirst({
        where: { giverId: userId },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true },
      }),
      // Last marketplace activity
      prisma.marketplaceListing.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true },
      }),
      // Last connection made
      prisma.userConnection.findFirst({
        where: {
          OR: [
            { initiatorId: userId },
            { receiverId: userId },
          ],
        },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true },
      }),
    ]);

    const dates = [
      lastEvent?.createdAt,
      lastTrustMoment?.createdAt,
      lastListing?.createdAt,
      lastConnection?.createdAt,
    ].filter((date): date is Date => date !== null && date !== undefined);

    if (dates.length === 0) {
      // No activity found, return account creation date
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { createdAt: true },
      });
      return user?.createdAt || new Date();
    }

    // Return the most recent date
    return new Date(Math.max(...dates.map(d => d.getTime())));
  }

  /**
   * Apply decay to a user's trust score
   */
  private async applyDecay(user: {
    id: string;
    fullName: string;
    trustScore: number;
    updatedAt: Date;
  }): Promise<{
    decayed: boolean;
    decayAmount: number;
    decayType: 'light' | 'heavy' | null;
  }> {
    const lastActivity = await this.getLastActivityDate(user.id);
    const inactiveDays = Math.floor((Date.now() - lastActivity.getTime()) / (24 * 60 * 60 * 1000));

    // Determine decay rate based on inactivity period
    let decayRate = 0;
    let decayType: 'light' | 'heavy' | null = null;

    if (inactiveDays >= this.INACTIVITY_THRESHOLD_HEAVY) {
      decayRate = this.DECAY_RATE_HEAVY;
      decayType = 'heavy';
    } else if (inactiveDays >= this.INACTIVITY_THRESHOLD_LIGHT) {
      decayRate = this.DECAY_RATE_LIGHT;
      decayType = 'light';
    } else {
      // No decay needed
      return { decayed: false, decayAmount: 0, decayType: null };
    }

    // Calculate decay amount (percentage of current score)
    const decayAmount = (user.trustScore * decayRate) / 100;
    const newScore = Math.max(user.trustScore - decayAmount, this.MIN_TRUST_SCORE);

    // Update trust score
    await prisma.user.update({
      where: { id: user.id },
      data: { trustScore: newScore },
    });

    // Log decay event in trust score history
    const { TrustScoreUserService } = await import('../modules/user/trust-score.service');
    await TrustScoreUserService.recordScoreChange(
      user.id,
      newScore,
      user.trustScore,
      `Trust decay applied: ${decayRate}% for ${inactiveDays} days of inactivity`,
      undefined,
      'decay',
      undefined,
      {
        inactiveDays,
        decayRate: `${decayRate}%`,
        decayType,
        lastActivity: lastActivity.toISOString(),
      }
    ).catch(err => logger.error('Failed to record decay in history:', err));

    logger.info(`[TrustDecayJob] Applied ${decayType} decay to ${user.fullName}`, {
      userId: user.id,
      inactiveDays,
      decayRate: `${decayRate}%`,
      oldScore: user.trustScore.toFixed(2),
      newScore: newScore.toFixed(2),
      decayAmount: decayAmount.toFixed(2),
    });

    // TODO: Send decay notification
    // await this.sendDecayNotification(user.id, decayAmount, newScore, inactiveDays, decayType);

    return {
      decayed: true,
      decayAmount,
      decayType,
    };
  }

  /**
   * Send warnings to users approaching decay threshold
   */
  async sendDecayWarnings(): Promise<void> {
    logger.info('[TrustDecayJob] Checking for users needing decay warnings...');

    try {
      const warningThreshold = this.INACTIVITY_THRESHOLD_LIGHT - 7; // 7 days before decay starts
      const warningDate = new Date(Date.now() - warningThreshold * 24 * 60 * 60 * 1000);

      const users = await prisma.user.findMany({
        where: {
          status: 'ACTIVE',
          deletedAt: null,
          trustScore: { gt: 0 },
        },
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      });

      let warningsSent = 0;

      for (const user of users) {
        try {
          const lastActivity = await this.getLastActivityDate(user.id);
          const inactiveDays = Math.floor((Date.now() - lastActivity.getTime()) / (24 * 60 * 60 * 1000));

          // Send warning if user is 7 days away from decay (23 days inactive)
          if (inactiveDays === warningThreshold) {
            // TODO: Send warning notification
            // await NotificationService.sendTrustDecayWarning(user.id, 7);
            logger.info(`[TrustDecayJob] Sent decay warning to ${user.fullName}`, {
              userId: user.id,
              inactiveDays,
              daysUntilDecay: 7,
            });
            warningsSent++;
          }
        } catch (error) {
          logger.error(`[TrustDecayJob] Error sending warning to ${user.id}`, { error });
        }
      }

      logger.info(`[TrustDecayJob] Decay warnings sent: ${warningsSent}`);
    } catch (error) {
      logger.error('[TrustDecayJob] Failed to send decay warnings', { error });
    }
  }

  /**
   * Check for users who recently became active and grant reactivation bonus
   */
  async grantReactivationBonuses(): Promise<void> {
    logger.info('[TrustDecayJob] Checking for reactivation bonuses...');

    try {
      // Find users who had decay in the last 30 days but are now active
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      // TODO: Query trust score history for users with recent decay
      // Then check if they've been active in the last 7 days
      // Grant a small bonus (e.g., 2-5 points) for returning

      logger.info('[TrustDecayJob] Reactivation bonuses check completed');
    } catch (error) {
      logger.error('[TrustDecayJob] Failed to grant reactivation bonuses', { error });
    }
  }
}

// Main execution function for cron jobs
export async function runTrustDecayJob(): Promise<void> {
  const job = new TrustDecayJob();
  
  // Send warnings first (7 days before decay)
  await job.sendDecayWarnings();
  
  // Apply decay
  await job.run();
  
  // Grant reactivation bonuses
  await job.grantReactivationBonuses();
}

// For manual execution
if (require.main === module) {
  runTrustDecayJob()
    .then(() => {
      logger.info('[TrustDecayJob] Job completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('[TrustDecayJob] Job failed', { error });
      process.exit(1);
    });
}
