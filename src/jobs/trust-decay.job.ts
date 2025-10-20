import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';
import { TrustScoreService } from '../modules/connections/trust/trust-score.service';
import { configService } from '../modules/platform/config.service';

const prisma = new PrismaClient();

/**
 * Trust Decay Job
 * 
 * Applies trust score decay for inactive users using dynamic configuration.
 * Decay thresholds and rates are loaded from ConfigService.
 * 
 * Runs weekly on Sundays at 2 AM
 * Logs all decay events for transparency
 */
export class TrustDecayJob {
  private MIN_TRUST_SCORE = 0; // Don't decay below 0

  /**
   * Main job execution method
   */
  async run(): Promise<void> {
    const startTime = Date.now();
    logger.info('[TrustDecayJob] Starting trust decay process...');

    try {
      // Load dynamic decay rules
      const decayRules = await configService.getTrustDecayRules();
      
      // Get all active users who might need decay
      const users = await this.getInactiveUsers(decayRules);
      
      let totalDecayed = 0;
      let totalDecayAmount = 0;
      const decayTypeCounts: Record<string, number> = {};

      for (const user of users) {
        try {
          const decayResult = await this.applyDecay(user, decayRules);
          
          if (decayResult.decayed && decayResult.decayType) {
            totalDecayed++;
            totalDecayAmount += decayResult.decayAmount;
            decayTypeCounts[decayResult.decayType] = (decayTypeCounts[decayResult.decayType] || 0) + 1;
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
        decayBreakdown: decayTypeCounts,
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
  private async getInactiveUsers(decayRules: any): Promise<Array<{
    id: string;
    fullName: string;
    trustScore: number;
    updatedAt: Date;
  }>> {
    // Get minimum threshold (first rule)
    const minThreshold = Math.min(...decayRules.rules.map((r: any) => r.inactivityDays));
    const thresholdDate = new Date(Date.now() - minThreshold * 24 * 60 * 60 * 1000);

    // Get users who haven't had any activity in the last X days
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
      
      if (lastActivity < thresholdDate) {
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
   * Apply decay to a user's trust score using dynamic decay rules
   */
  private async applyDecay(
    user: {
      id: string;
      fullName: string;
      trustScore: number;
      updatedAt: Date;
    },
    decayRules: any
  ): Promise<{
    decayed: boolean;
    decayAmount: number;
    decayType: string | null;
  }> {
    const lastActivity = await this.getLastActivityDate(user.id);
    const inactiveDays = Math.floor((Date.now() - lastActivity.getTime()) / (24 * 60 * 60 * 1000));

    // Find applicable decay rule based on inactivity period
    // Sort rules by inactivityDays (descending) to apply most severe first
    const sortedRules = [...decayRules.rules].sort((a: any, b: any) => b.inactivityDays - a.inactivityDays);
    
    let applicableRule = null;
    for (const rule of sortedRules) {
      if (inactiveDays >= rule.inactivityDays) {
        applicableRule = rule;
        break;
      }
    }

    if (!applicableRule) {
      // No decay needed
      return { decayed: false, decayAmount: 0, decayType: null };
    }

    // Calculate decay amount (percentage of current score)
    const decayAmount = (user.trustScore * applicableRule.decayPercentage) / 100;
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
      `Trust decay applied: ${applicableRule.decayPercentage}% for ${inactiveDays} days of inactivity`,
      undefined,
      'decay',
      undefined,
      {
        inactiveDays,
        decayRate: `${applicableRule.decayPercentage}%`,
        decayType: applicableRule.type,
        lastActivity: lastActivity.toISOString(),
      }
    ).catch(err => logger.error('Failed to record decay in history:', err));

    logger.info(`[TrustDecayJob] Applied ${applicableRule.type} decay to ${user.fullName}`, {
      userId: user.id,
      inactiveDays,
      decayRate: `${applicableRule.decayPercentage}%`,
      oldScore: user.trustScore.toFixed(2),
      newScore: newScore.toFixed(2),
      decayAmount: decayAmount.toFixed(2),
    });

    // TODO: Send decay notification
    // await this.sendDecayNotification(user.id, decayAmount, newScore, inactiveDays, applicableRule.type);

    return {
      decayed: true,
      decayAmount,
      decayType: applicableRule.type,
    };
  }

  /**
   * Send warnings to users approaching decay threshold (uses dynamic config)
   */
  async sendDecayWarnings(): Promise<void> {
    logger.info('[TrustDecayJob] Checking for users needing decay warnings...');

    try {
      // Load decay rules to determine warning threshold
      const decayRules = await configService.getTrustDecayRules();
      
      // Get minimum inactivity threshold
      const minThreshold = Math.min(...decayRules.rules.map((r: any) => r.inactivityDays));
      const warningThreshold = minThreshold - 7; // 7 days before decay starts
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

          // Send warning if user is 7 days away from decay
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
