import { prisma } from '../../../config/database';
import logger from '../../../utils/logger';
import { VouchStatus, VouchType } from '@prisma/client';

/**
 * Trust Score Calculation Service
 * 
 * Trust Score Composition (out of 100):
 * - 40% from Vouches:
 *   - 30% from Primary vouch (1 max)
 *   - 30% from Secondary vouches (3 max, ~10% each)
 *   - 40% from Community vouches (2 max, ~20% each)
 * - 30% from Activity Participation
 * - 30% from Trust Moments (feedback from connections)
 */
export class TrustScoreService {
  
  /**
   * Calculate and update trust score for a user
   */
  static async calculateTrustScore(userId: string): Promise<number> {
    try {
      // Get vouch config
      const config = await prisma.vouchConfig.findFirst({
        orderBy: { createdAt: 'desc' },
      });

      if (!config) {
        logger.warn('No vouch config found, using defaults');
      }

      // Calculate each component
      const vouchScore = await this.calculateVouchScore(userId, config);
      const activityScore = await this.calculateActivityScore(userId);
      const trustMomentsScore = await this.calculateTrustMomentsScore(userId);

      // Total score (out of 100)
      const totalScore = vouchScore + activityScore + trustMomentsScore;
      const finalScore = Math.min(Math.max(totalScore, 0), 100); // Clamp between 0-100

      // Determine trust level based on score
      const trustLevel = this.determineTrustLevel(finalScore);

      // Update user's trust score and level
      await prisma.user.update({
        where: { id: userId },
        data: {
          trustScore: finalScore,
          trustLevel,
        },
      });

      logger.info(`Trust score updated for user ${userId}: ${finalScore} (${trustLevel})`);

      return finalScore;
    } catch (error) {
      logger.error(`Error calculating trust score for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Calculate vouch score component (40% of total)
   */
  private static async calculateVouchScore(
    userId: string,
    config: any
  ): Promise<number> {
    try {
      // Get active vouches
      const vouches = await prisma.vouch.findMany({
        where: {
          voucheeId: userId,
          status: { in: [VouchStatus.APPROVED, VouchStatus.ACTIVE] },
        },
      });

      const primaryVouchWeight = config?.primaryVouchWeight || 30.0;
      const secondaryVouchWeight = config?.secondaryVouchWeight || 30.0;
      const communityVouchWeight = config?.communityVouchWeight || 40.0;

      let primaryScore = 0;
      let secondaryScore = 0;
      let communityScore = 0;

      // Count vouches by type
      const primaryVouches = vouches.filter(v => v.vouchType === VouchType.PRIMARY);
      const secondaryVouches = vouches.filter(v => v.vouchType === VouchType.SECONDARY);
      const communityVouches = vouches.filter(v => v.vouchType === VouchType.COMMUNITY);

      // Primary vouch (max 1, worth 30% of vouch score = 12% of total)
      if (primaryVouches.length > 0) {
        primaryScore = primaryVouchWeight * (40 / 100); // 30% of 40% = 12%
      }

      // Secondary vouches (max 3, worth 30% of vouch score = 12% of total, ~4% each)
      const secondaryCount = Math.min(secondaryVouches.length, 3);
      if (secondaryCount > 0) {
        secondaryScore = (secondaryVouchWeight * (40 / 100)) * (secondaryCount / 3);
      }

      // Community vouches (max 2, worth 40% of vouch score = 16% of total, ~8% each)
      const communityCount = Math.min(communityVouches.length, 2);
      if (communityCount > 0) {
        communityScore = (communityVouchWeight * (40 / 100)) * (communityCount / 2);
      }

      const totalVouchScore = primaryScore + secondaryScore + communityScore;

      logger.debug(`Vouch score for user ${userId}: ${totalVouchScore} (P:${primaryScore}, S:${secondaryScore}, C:${communityScore})`);

      return totalVouchScore;
    } catch (error) {
      logger.error('Error calculating vouch score:', error);
      return 0;
    }
  }

  /**
   * Calculate activity participation score (30% of total)
   */
  private static async calculateActivityScore(userId: string): Promise<number> {
    try {
      // Get user stats
      const stats = await prisma.userStat.findUnique({
        where: { userId },
      });

      if (!stats) {
        return 0;
      }

      // Scoring factors (weighted contributions to 30%)
      const eventsAttendedScore = Math.min(stats.eventsAttended * 2, 10); // Max 10 points (5 events)
      const eventsHostedScore = Math.min(stats.eventsHosted * 3, 9); // Max 9 points (3 events)
      const communitiesScore = Math.min(stats.communitiesJoined * 2, 6); // Max 6 points (3 communities)
      const servicesScore = Math.min(stats.servicesProvided * 1, 5); // Max 5 points (5 services)

      const totalActivityScore = Math.min(
        eventsAttendedScore + eventsHostedScore + communitiesScore + servicesScore,
        30
      );

      logger.debug(`Activity score for user ${userId}: ${totalActivityScore}`);

      return totalActivityScore;
    } catch (error) {
      logger.error('Error calculating activity score:', error);
      return 0;
    }
  }

  /**
   * Calculate trust moments score (30% of total)
   */
  private static async calculateTrustMomentsScore(userId: string): Promise<number> {
    try {
      // Get trust moments (feedback) received
      const trustMoments = await prisma.trustMoment.findMany({
        where: {
          receiverId: userId,
          isPublic: true,
        },
      });

      if (trustMoments.length === 0) {
        return 0;
      }

      // Calculate average rating (1-5 scale)
      const totalRating = trustMoments.reduce((sum, tm) => sum + tm.rating, 0);
      const averageRating = totalRating / trustMoments.length;

      // Convert to score out of 30
      // 5 stars = 30 points, 4 stars = 24 points, etc.
      const ratingScore = (averageRating / 5) * 30;

      // Bonus for quantity (up to 3 points for having 10+ trust moments)
      const quantityBonus = Math.min(trustMoments.length * 0.3, 3);

      const totalTrustMomentsScore = Math.min(ratingScore + quantityBonus, 30);

      logger.debug(`Trust moments score for user ${userId}: ${totalTrustMomentsScore} (avg rating: ${averageRating})`);

      return totalTrustMomentsScore;
    } catch (error) {
      logger.error('Error calculating trust moments score:', error);
      return 0;
    }
  }

  /**
   * Determine trust level based on score
   */
  private static determineTrustLevel(score: number): string {
    if (score >= 90) return 'elite';
    if (score >= 75) return 'trusted';
    if (score >= 60) return 'established';
    if (score >= 40) return 'growing';
    if (score >= 20) return 'starter';
    return 'new';
  }

  /**
   * Recalculate trust scores for multiple users
   */
  static async recalculateTrustScores(userIds: string[]): Promise<void> {
    try {
      for (const userId of userIds) {
        await this.calculateTrustScore(userId);
      }
      logger.info(`Recalculated trust scores for ${userIds.length} users`);
    } catch (error) {
      logger.error('Error recalculating trust scores:', error);
    }
  }

  /**
   * Trigger trust score update (event-driven)
   */
  static async triggerTrustScoreUpdate(
    userId: string,
    reason: string
  ): Promise<void> {
    try {
      logger.info(`Triggering trust score update for user ${userId}: ${reason}`);
      await this.calculateTrustScore(userId);
    } catch (error) {
      logger.error('Error triggering trust score update:', error);
    }
  }
}
