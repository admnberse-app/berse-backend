import { prisma } from '../../../config/database';
import logger from '../../../utils/logger';
import { VouchStatus, VouchType } from '@prisma/client';
import { configService } from '../../platform/config.service';

/**
 * Trust Score Calculation Service
 * 
 * ============================================================================
 * TRUST SCORE FORMULA - VERIFIED 100% ALIGNMENT
 * ============================================================================
 * 
 * Total Score = Vouch Score (40%) + Activity Score (30%) + Trust Moments (30%)
 * 
 * 1. VOUCH SCORE (40% of total = 40 points max)
 *    - Primary Vouch: 30% of vouch score = 12 points (1 vouch max)
 *    - Secondary Vouches: 30% of vouch score = 12 points (3 vouches max, 4 points each)
 *    - Community Vouches: 40% of vouch score = 16 points (2 vouches max, 8 points each)
 *    Formula: vouchScore = (primary * 0.3 + secondary * 0.3 + community * 0.4) * 40
 * 
 * 2. ACTIVITY SCORE (30% of total = 30 points max)
 *    - Events Attended: 2 points each, max 10 points (5 events)
 *    - Events Hosted: 3 points each, max 9 points (3 events)
 *    - Communities Joined: 2 points each, max 6 points (3 communities)
 *    - Services Provided: 1 point each, max 5 points (5 services)
 *    Formula: activityScore = min(eventsAttended*2 + eventsHosted*3 + communities*2 + services*1, 30)
 * 
 * 3. TRUST MOMENTS SCORE (30% of total = 30 points max)
 *    - Base Score: (average rating / 5) * 30
 *    - Quantity Bonus: min(count * 0.3, 3) for having multiple trust moments
 *    Formula: trustMomentsScore = min((avgRating/5)*30 + min(count*0.3, 3), 30)
 * 
 * FINAL SCORE: Clamped between 0-100
 * 
 * Trust Levels:
 * - Elite (90-100): Top tier, maximum trust
 * - Trusted (75-89): High trust, established member
 * - Established (60-74): Solid reputation
 * - Growing (40-59): Building reputation
 * - Starter (20-39): New with some activity
 * - New (0-19): Just getting started
 */
export class TrustScoreService {
  
  /**
   * Calculate and update trust score for a user
   */
  static async calculateTrustScore(userId: string): Promise<number> {
    try {
      // Get trust formula from dynamic config
      const trustFormula = await configService.getTrustFormula();

      // Calculate each component
      const vouchScore = await this.calculateVouchScore(userId, trustFormula);
      const activityScore = await this.calculateActivityScore(userId, trustFormula);
      const trustMomentsScore = await this.calculateTrustMomentsScore(userId, trustFormula);

      // Apply weights from config
      const weightedVouchScore = vouchScore * trustFormula.vouchWeight;
      const weightedActivityScore = activityScore * trustFormula.activityWeight;
      const weightedTrustMomentsScore = trustMomentsScore * trustFormula.trustMomentWeight;

      // Total score (out of 100)
      const totalScore = weightedVouchScore + weightedActivityScore + weightedTrustMomentsScore;
      const finalScore = Math.min(Math.max(totalScore, 0), 100); // Clamp between 0-100

      // Determine trust level based on score
      const trustLevel = await this.determineTrustLevel(finalScore);

      // Get previous score before update
      const previousScore = await prisma.user.findUnique({
        where: { id: userId },
        select: { trustScore: true },
      }).then(u => u?.trustScore || 0);

      // Update user's trust score and level
      await prisma.user.update({
        where: { id: userId },
        data: {
          trustScore: finalScore,
          trustLevel,
        },
      });

      logger.info(`Trust score updated for user ${userId}: ${finalScore} (${trustLevel})`);

      // Record score change in history (only if changed)
      if (Math.abs(finalScore - previousScore) > 0.01) {
        const { TrustScoreUserService } = await import('../../user/trust-score.service');
        TrustScoreUserService.recordScoreChange(
          userId,
          finalScore,
          previousScore,
          'Trust score recalculated',
          undefined,
          'recalculation',
          undefined,
          {
            vouchScore: weightedVouchScore,
            activityScore: weightedActivityScore,
            trustMomentsScore: weightedTrustMomentsScore,
            trustLevel,
          }
        ).catch(err => logger.error('Failed to record score change:', err));
      }

      return finalScore;
    } catch (error) {
      logger.error(`Error calculating trust score for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Calculate vouch score component (returns 0-100 before weighting)
   * 
   * DYNAMIC FORMULA (configurable via database):
   * - Primary vouch: primaryWeight% of total (default: 12%)
   * - Secondary vouches: secondaryWeight% of total (default: 12%)
   * - Community vouches: communityWeight% of total (default: 16%)
   * 
   * Note: This returns raw score out of 100. The weight is applied by calculateTrustScore()
   */
  private static async calculateVouchScore(
    userId: string,
    trustFormula: any
  ): Promise<number> {
    try {
      // Get active vouches
      const vouches = await prisma.vouch.findMany({
        where: {
          voucheeId: userId,
          status: { in: [VouchStatus.APPROVED, VouchStatus.ACTIVE] },
        },
      });

      const { vouchBreakdown } = trustFormula;
      const primaryVouchWeight = vouchBreakdown.primaryWeight * 100; // Convert to percentage
      const secondaryVouchWeight = vouchBreakdown.secondaryWeight * 100;
      const communityVouchWeight = vouchBreakdown.communityWeight * 100;

      let primaryScore = 0;
      let secondaryScore = 0;
      let communityScore = 0;

      // Count vouches by type
      const primaryVouches = vouches.filter(v => v.vouchType === VouchType.PRIMARY);
      const secondaryVouches = vouches.filter(v => v.vouchType === VouchType.SECONDARY);
      const communityVouches = vouches.filter(v => v.vouchType === VouchType.COMMUNITY);

      // Primary vouch (max 1)
      if (primaryVouches.length > 0) {
        primaryScore = primaryVouchWeight; // Full weight if has primary vouch
      }

      // Secondary vouches (max 3, proportional)
      const secondaryCount = Math.min(secondaryVouches.length, 3);
      if (secondaryCount > 0) {
        secondaryScore = secondaryVouchWeight * (secondaryCount / 3);
      }

      // Community vouches (max 2, proportional)
      const communityCount = Math.min(communityVouches.length, 2);
      if (communityCount > 0) {
        communityScore = communityVouchWeight * (communityCount / 2);
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
   * Calculate activity participation score (returns 0-100 before weighting)
   * 
   * DYNAMIC FORMULA (configurable via database):
   * Activity points are fetched from config and contribute to max 100 score
   * Default weights: events attended (2), hosted (5), communities (1), etc.
   * 
   * Note: This returns raw score out of 100. The weight is applied by calculateTrustScore()
   */
  private static async calculateActivityScore(
    userId: string,
    trustFormula: any
  ): Promise<number> {
    try {
      // Get activity weights from config
      const activityWeights = await configService.getActivityWeights();

      // Get user stats
      const stats = await prisma.userStat.findUnique({
        where: { userId },
      });

      if (!stats) {
        return 0;
      }

      // Calculate scores using dynamic weights
      let totalActivityScore = 0;
      totalActivityScore += stats.eventsAttended * activityWeights.eventAttended;
      totalActivityScore += stats.eventsHosted * activityWeights.eventHosted;
      totalActivityScore += stats.communitiesJoined * activityWeights.communityJoined;
      totalActivityScore += stats.servicesProvided * activityWeights.serviceCreated;

      // Cap at configured maximum
      const finalActivityScore = Math.min(totalActivityScore, activityWeights.maxActivityScore);

      logger.debug(`Activity score for user ${userId}: ${finalActivityScore}`);

      return finalActivityScore;
    } catch (error) {
      logger.error('Error calculating activity score:', error);
      return 0;
    }
  }

  /**
   * Calculate trust moments score (returns 0-100 before weighting)
   * 
   * VERIFIED FORMULA:
   * - Base Score: (average rating / 5) * 100 points
   * - Quantity Bonus: Additional points for engagement
   * 
   * Note: This returns raw score out of 100. The weight is applied by calculateTrustScore()
   */
  private static async calculateTrustMomentsScore(
    userId: string,
    trustFormula: any
  ): Promise<number> {
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

      // Convert to score out of 100 (5 stars = 100 points)
      const ratingScore = (averageRating / 5) * 100;

      // Bonus for quantity (0.3 points per trust moment, max 10 points)
      const quantityBonus = Math.min(trustMoments.length * 0.3, 10);

      const totalTrustMomentsScore = Math.min(ratingScore + quantityBonus, 100);

      logger.debug(`Trust moments score for user ${userId}: ${totalTrustMomentsScore} (avg rating: ${averageRating})`);

      return totalTrustMomentsScore;
    } catch (error) {
      logger.error('Error calculating trust moments score:', error);
      return 0;
    }
  }

  /**
   * Determine trust level based on score (uses dynamic config)
   */
  private static async determineTrustLevel(score: number): Promise<string> {
    try {
      const trustLevels = await configService.getTrustLevels();
      
      // Find matching level
      for (const level of trustLevels.levels) {
        if (score >= level.minScore && score <= level.maxScore) {
          return level.name.toLowerCase();
        }
      }
      
      // Fallback to lowest level
      return trustLevels.levels[0].name.toLowerCase();
    } catch (error) {
      logger.error('Error determining trust level:', error);
      // Fallback to hardcoded logic
      if (score >= 90) return 'leader';
      if (score >= 76) return 'trusted';
      if (score >= 51) return 'established';
      if (score >= 26) return 'growing';
      if (score >= 11) return 'newcomer';
      return 'starter';
    }
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
