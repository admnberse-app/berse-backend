import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error';
import logger from '../../utils/logger';
import {
  TrustScoreDetail,
  TrustScoreBreakdown,
  VouchesComponent,
  ActivityComponent,
  TrustMomentsComponent,
  NextLevelInfo,
  TrustScoreSuggestions,
  RecentUpdate,
  VouchSummary,
  TrustScoreHistory,
  ScoreHistoryItem,
} from './trust-score.types';
import { VouchStatus, VouchType, ConnectionStatus } from '@prisma/client';

export class TrustScoreUserService {
  
  /**
   * Get comprehensive trust score detail for a user
   */
  static async getTrustScoreDetail(
    userId: string,
    requesterId?: string,
    includeBreakdown: boolean = true,
    includeHistory: boolean = false,
    historyDays: number = 30
  ): Promise<TrustScoreDetail> {
    try {
      // Get user with trust score
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          trustScore: true,
          trustLevel: true,
          updatedAt: true,
        },
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Calculate score change (last 30 days)
      const scoreChange = await this.calculateScoreChange(userId, historyDays);

      // Get breakdown if requested
      const breakdown = includeBreakdown 
        ? await this.getScoreBreakdown(userId)
        : {} as TrustScoreBreakdown;

      // Get next level info
      const nextLevel = this.getNextLevelInfo(user.trustScore, user.trustLevel);

      const result: TrustScoreDetail = {
        userId: user.id,
        currentScore: user.trustScore,
        trustLevel: user.trustLevel,
        scoreChange,
        lastCalculatedAt: user.updatedAt,
        breakdown,
        nextLevel,
      };

      return result;
    } catch (error) {
      logger.error('Error getting trust score detail:', error);
      throw error;
    }
  }

  /**
   * Get detailed breakdown of trust score components
   */
  private static async getScoreBreakdown(userId: string): Promise<TrustScoreBreakdown> {
    try {
      // Get vouch config
      const config = await prisma.vouchConfig.findFirst({
        orderBy: { createdAt: 'desc' },
      });

      const [vouches, activity, trustMoments] = await Promise.all([
        this.getVouchesComponent(userId, config),
        this.getActivityComponent(userId),
        this.getTrustMomentsComponent(userId),
      ]);

      return {
        vouches,
        activity,
        trustMoments,
      };
    } catch (error) {
      logger.error('Error getting score breakdown:', error);
      throw error;
    }
  }

  /**
   * Get vouches component breakdown
   */
  private static async getVouchesComponent(userId: string, config: any): Promise<VouchesComponent> {
    try {
      // Get active vouches with voucher details
      const vouches = await prisma.vouch.findMany({
        where: {
          voucheeId: userId,
          status: { in: [VouchStatus.APPROVED, VouchStatus.ACTIVE] },
        },
        include: {
          users_vouches_voucherIdTousers: {
            select: {
              id: true,
              fullName: true,
              username: true,
              trustScore: true,
              trustLevel: true,
              profile: {
                select: {
                  profilePicture: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      const primaryVouchWeight = config?.primaryVouchWeight || 30.0;
      const secondaryVouchWeight = config?.secondaryVouchWeight || 30.0;
      const communityVouchWeight = config?.communityVouchWeight || 40.0;

      // Filter by type
      const primaryVouches = vouches.filter(v => v.vouchType === VouchType.PRIMARY);
      const secondaryVouches = vouches.filter(v => v.vouchType === VouchType.SECONDARY);
      const communityVouches = vouches.filter(v => v.vouchType === VouchType.COMMUNITY);

      // Calculate scores
      const primaryScore = primaryVouches.length > 0 ? primaryVouchWeight * 0.4 : 0;
      const secondaryCount = Math.min(secondaryVouches.length, 3);
      const secondaryScore = (secondaryVouchWeight * 0.4) * (secondaryCount / 3);
      const communityCount = Math.min(communityVouches.length, 2);
      const communityScore = (communityVouchWeight * 0.4) * (communityCount / 2);

      const totalScore = primaryScore + secondaryScore + communityScore;

      // Map vouches to summary format
      const mapVouches = (vouchList: typeof vouches): VouchSummary[] => {
        return vouchList.map(v => ({
          id: v.id,
          voucherId: v.voucherId,
          voucherName: v.users_vouches_voucherIdTousers.fullName,
          voucherUsername: v.users_vouches_voucherIdTousers.username || undefined,
          voucherProfilePicture: v.users_vouches_voucherIdTousers.profile?.profilePicture || undefined,
          voucherTrustScore: v.users_vouches_voucherIdTousers.trustScore,
          voucherTrustLevel: v.users_vouches_voucherIdTousers.trustLevel,
          vouchType: v.vouchType,
          message: v.message || undefined,
          vouchedAt: v.createdAt,
          communityId: v.communityId || undefined,
          communityName: undefined, // We'll need to fetch community separately if needed
        }));
      };

      return {
        score: Math.round(totalScore * 10) / 10,
        maxScore: 40,
        percentage: Math.round((totalScore / 40) * 100),
        components: {
          primary: {
            score: Math.round(primaryScore * 10) / 10,
            maxScore: 12,
            count: primaryVouches.length,
            maxCount: 1,
            vouches: mapVouches(primaryVouches),
          },
          secondary: {
            score: Math.round(secondaryScore * 10) / 10,
            maxScore: 12,
            count: secondaryVouches.length,
            maxCount: 3,
            vouches: mapVouches(secondaryVouches),
          },
          community: {
            score: Math.round(communityScore * 10) / 10,
            maxScore: 16,
            count: communityVouches.length,
            maxCount: 2,
            vouches: mapVouches(communityVouches),
          },
        },
      };
    } catch (error) {
      logger.error('Error getting vouches component:', error);
      throw error;
    }
  }

  /**
   * Get activity component breakdown
   */
  private static async getActivityComponent(userId: string): Promise<ActivityComponent> {
    try {
      const stats = await prisma.userStat.findUnique({
        where: { userId },
      });

      if (!stats) {
        return {
          score: 0,
          maxScore: 30,
          percentage: 0,
          components: {
            eventsAttended: { score: 0, maxScore: 10, count: 0, targetCount: 5 },
            eventsHosted: { score: 0, maxScore: 9, count: 0, targetCount: 3 },
            communitiesJoined: { score: 0, maxScore: 6, count: 0, targetCount: 3 },
            servicesProvided: { score: 0, maxScore: 5, count: 0, targetCount: 5 },
          },
        };
      }

      const eventsAttendedScore = Math.min(stats.eventsAttended * 2, 10);
      const eventsHostedScore = Math.min(stats.eventsHosted * 3, 9);
      const communitiesScore = Math.min(stats.communitiesJoined * 2, 6);
      const servicesScore = Math.min(stats.servicesProvided * 1, 5);

      const totalScore = Math.min(
        eventsAttendedScore + eventsHostedScore + communitiesScore + servicesScore,
        30
      );

      return {
        score: totalScore,
        maxScore: 30,
        percentage: Math.round((totalScore / 30) * 100),
        components: {
          eventsAttended: {
            score: eventsAttendedScore,
            maxScore: 10,
            count: stats.eventsAttended,
            targetCount: 5,
          },
          eventsHosted: {
            score: eventsHostedScore,
            maxScore: 9,
            count: stats.eventsHosted,
            targetCount: 3,
          },
          communitiesJoined: {
            score: communitiesScore,
            maxScore: 6,
            count: stats.communitiesJoined,
            targetCount: 3,
          },
          servicesProvided: {
            score: servicesScore,
            maxScore: 5,
            count: stats.servicesProvided,
            targetCount: 5,
          },
        },
      };
    } catch (error) {
      logger.error('Error getting activity component:', error);
      throw error;
    }
  }

  /**
   * Get trust moments component breakdown
   */
  private static async getTrustMomentsComponent(userId: string): Promise<TrustMomentsComponent> {
    try {
      const trustMoments = await prisma.trustMoment.findMany({
        where: {
          receiverId: userId,
          isPublic: true,
        },
      });

      if (trustMoments.length === 0) {
        return {
          score: 0,
          maxScore: 30,
          percentage: 0,
          statistics: {
            totalMoments: 0,
            averageRating: 0,
            ratingScore: 0,
            quantityBonus: 0,
            distribution: {
              fiveStar: 0,
              fourStar: 0,
              threeStar: 0,
              twoStar: 0,
              oneStar: 0,
            },
            sentiment: {
              positive: 0,
              positivePercentage: 0,
              neutral: 0,
              neutralPercentage: 0,
              negative: 0,
              negativePercentage: 0,
            },
            byMomentType: {},
            topTags: [],
          },
        };
      }

      // Calculate average rating
      const totalRating = trustMoments.reduce((sum, tm) => sum + tm.rating, 0);
      const averageRating = totalRating / trustMoments.length;
      const ratingScore = (averageRating / 5) * 30;
      const quantityBonus = Math.min(trustMoments.length * 0.3, 3);
      const totalScore = Math.min(ratingScore + quantityBonus, 30);

      // Rating distribution
      const distribution = {
        fiveStar: trustMoments.filter(tm => tm.rating === 5).length,
        fourStar: trustMoments.filter(tm => tm.rating === 4).length,
        threeStar: trustMoments.filter(tm => tm.rating === 3).length,
        twoStar: trustMoments.filter(tm => tm.rating === 2).length,
        oneStar: trustMoments.filter(tm => tm.rating === 1).length,
      };

      // Sentiment breakdown
      const positive = distribution.fiveStar + distribution.fourStar;
      const neutral = distribution.threeStar;
      const negative = distribution.twoStar + distribution.oneStar;
      const total = trustMoments.length;

      // By moment type
      const byMomentType: Record<string, number> = {};
      trustMoments.forEach(tm => {
        const type = tm.momentType || 'general';
        byMomentType[type] = (byMomentType[type] || 0) + 1;
      });

      // Top tags
      const tagCounts: Record<string, number> = {};
      trustMoments.forEach(tm => {
        if (tm.tags && Array.isArray(tm.tags)) {
          (tm.tags as string[]).forEach(tag => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          });
        }
      });

      const topTags = Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([tag, count]) => ({ tag, count }));

      return {
        score: Math.round(totalScore * 10) / 10,
        maxScore: 30,
        percentage: Math.round((totalScore / 30) * 100),
        statistics: {
          totalMoments: trustMoments.length,
          averageRating: Math.round(averageRating * 10) / 10,
          ratingScore: Math.round(ratingScore * 10) / 10,
          quantityBonus: Math.round(quantityBonus * 10) / 10,
          distribution,
          sentiment: {
            positive,
            positivePercentage: Math.round((positive / total) * 100),
            neutral,
            neutralPercentage: Math.round((neutral / total) * 100),
            negative,
            negativePercentage: Math.round((negative / total) * 100),
          },
          byMomentType,
          topTags,
        },
      };
    } catch (error) {
      logger.error('Error getting trust moments component:', error);
      throw error;
    }
  }

  /**
   * Calculate score change over a period
   */
  private static async calculateScoreChange(userId: string, days: number = 30): Promise<any> {
    try {
      // For now, return null as we don't have historical data yet
      // This will be implemented in Phase 3 with TrustScoreHistory table
      return null;
    } catch (error) {
      logger.error('Error calculating score change:', error);
      return null;
    }
  }

  /**
   * Get next level information
   */
  private static getNextLevelInfo(currentScore: number, currentLevel: string): NextLevelInfo {
    const levels = [
      { name: 'new', threshold: 0 },
      { name: 'starter', threshold: 20 },
      { name: 'growing', threshold: 40 },
      { name: 'established', threshold: 60 },
      { name: 'trusted', threshold: 75 },
      { name: 'elite', threshold: 90 },
    ];

    const currentIndex = levels.findIndex(l => l.name === currentLevel);
    const nextLevel = currentIndex < levels.length - 1 ? levels[currentIndex + 1] : null;

    const currentThreshold = levels[currentIndex]?.threshold || 0;
    const nextThreshold = nextLevel?.threshold || null;
    const pointsNeeded = nextThreshold ? Math.max(0, nextThreshold - currentScore) : 0;
    const progress = nextThreshold 
      ? Math.round(((currentScore - currentThreshold) / (nextThreshold - currentThreshold)) * 100)
      : 100;

    // Generate suggestions based on score gaps
    const suggestions: string[] = [];
    if (pointsNeeded > 0) {
      if (pointsNeeded <= 5) {
        suggestions.push('You\'re almost there! Keep up the good work');
      }
      suggestions.push('Continue participating in events and communities');
      suggestions.push('Maintain your high ratings from connections');
    }

    return {
      current: currentLevel,
      next: nextLevel?.name || null,
      currentThreshold,
      nextThreshold,
      pointsNeeded,
      progress,
      suggestions,
    };
  }

  /**
   * Get personalized suggestions to improve trust score
   */
  static async getSuggestions(userId: string): Promise<TrustScoreSuggestions> {
    try {
      const detail = await this.getTrustScoreDetail(userId, userId, true, false);
      const breakdown = detail.breakdown;

      const suggestions: any[] = [];
      const quickWins: any[] = [];

      // Vouches suggestions
      if (breakdown.vouches) {
        const { primary, secondary, community } = breakdown.vouches.components;
        
        if (primary.count === 0) {
          suggestions.push({
            category: 'vouches',
            action: 'get_primary_vouch',
            title: 'Get a primary vouch',
            description: 'Ask someone who knows you well to vouch for you',
            potentialPoints: 12,
            priority: 'high',
            actionUrl: '/vouches/request',
          });
        }

        if (secondary.count < secondary.maxCount) {
          const remaining = secondary.maxCount - secondary.count;
          suggestions.push({
            category: 'vouches',
            action: 'get_secondary_vouch',
            title: `Get ${remaining} more secondary vouch${remaining > 1 ? 'es' : ''}`,
            description: 'Ask trusted connections to vouch for you',
            potentialPoints: Math.round((12 / 3) * remaining),
            priority: 'high',
            actionUrl: '/vouches/request',
          });
        }

        if (community.count < community.maxCount) {
          const remaining = community.maxCount - community.count;
          suggestions.push({
            category: 'vouches',
            action: 'join_community',
            title: `Join ${remaining} more active communit${remaining > 1 ? 'ies' : 'y'}`,
            description: 'Community vouches are earned automatically after 90 days of active membership',
            potentialPoints: Math.round((16 / 2) * remaining),
            priority: 'medium',
            actionUrl: '/communities',
          });
        }
      }

      // Activity suggestions
      if (breakdown.activity) {
        const { eventsAttended, eventsHosted, communitiesJoined, servicesProvided } = breakdown.activity.components;

        if (eventsAttended.count < eventsAttended.targetCount) {
          quickWins.push({
            title: 'Attend an event this week',
            points: 2,
            effort: 'low',
          });
        }

        if (eventsHosted.count < eventsHosted.targetCount) {
          suggestions.push({
            category: 'activity',
            action: 'host_event',
            title: `Host ${eventsHosted.targetCount - eventsHosted.count} more event${eventsHosted.targetCount - eventsHosted.count > 1 ? 's' : ''}`,
            description: 'Hosting events shows leadership and community engagement',
            potentialPoints: 3,
            priority: 'medium',
            actionUrl: '/events/create',
          });
        }

        if (communitiesJoined.count < communitiesJoined.targetCount) {
          quickWins.push({
            title: `Join ${communitiesJoined.targetCount - communitiesJoined.count} more communit${communitiesJoined.targetCount - communitiesJoined.count > 1 ? 'ies' : 'y'}`,
            points: 2 * (communitiesJoined.targetCount - communitiesJoined.count),
            effort: 'low',
          });
        }

        if (servicesProvided.count < servicesProvided.targetCount) {
          suggestions.push({
            category: 'activity',
            action: 'offer_service',
            title: 'Offer a service to the community',
            description: 'Share your skills and expertise with others',
            potentialPoints: 1,
            priority: 'low',
            actionUrl: '/services/create',
          });
        }
      }

      // Trust moments suggestions
      if (breakdown.trustMoments && breakdown.trustMoments.statistics.averageRating < 4.5) {
        suggestions.push({
          category: 'trustMoments',
          action: 'improve_rating',
          title: 'Focus on delivering great experiences',
          description: 'Higher ratings from connections boost your trust score',
          potentialPoints: 5,
          priority: 'high',
          actionUrl: null,
        });
      }

      return {
        currentScore: detail.currentScore,
        currentLevel: detail.trustLevel,
        nextLevel: detail.nextLevel.next,
        pointsToNextLevel: detail.nextLevel.pointsNeeded,
        suggestions: suggestions.slice(0, 5),
        quickWins: quickWins.slice(0, 3),
      };
    } catch (error) {
      logger.error('Error getting suggestions:', error);
      throw error;
    }
  }

  /**
   * Get recent updates affecting trust score
   */
  static async getRecentUpdates(userId: string, limit: number = 10): Promise<RecentUpdate[]> {
    try {
      const updates: RecentUpdate[] = [];

      // Get recent trust moments
      const recentTrustMoments = await prisma.trustMoment.findMany({
        where: { receiverId: userId },
        include: {
          giver: {
            select: {
              id: true,
              fullName: true,
              username: true,
              profile: {
                select: {
                  profilePicture: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      });

      recentTrustMoments.forEach(tm => {
        updates.push({
          id: `tm_${tm.id}`,
          timestamp: tm.createdAt,
          type: 'trust_moment',
          description: `Trust moment received from @${tm.giver.username || tm.giver.fullName}`,
          impact: {
            points: tm.rating >= 4 ? 2 : 1,
            component: 'trustMoments',
          },
          relatedEntity: {
            type: 'trust_moment',
            id: tm.id,
            rating: tm.rating,
            giver: {
              id: tm.giver.id,
              fullName: tm.giver.fullName,
              username: tm.giver.username || undefined,
              profilePicture: tm.giver.profile?.profilePicture || undefined,
            },
          },
        });
      });

      // Get recent vouches
      const recentVouches = await prisma.vouch.findMany({
        where: {
          voucheeId: userId,
          status: { in: [VouchStatus.APPROVED, VouchStatus.ACTIVE] },
        },
        include: {
          users_vouches_voucherIdTousers: {
            select: {
              id: true,
              fullName: true,
              username: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 3,
      });

      recentVouches.forEach(v => {
        const points = v.vouchType === VouchType.PRIMARY ? 12 
                     : v.vouchType === VouchType.SECONDARY ? 4 
                     : 8;
        updates.push({
          id: `vouch_${v.id}`,
          timestamp: v.createdAt,
          type: 'vouch_received',
          description: `Received ${v.vouchType.toLowerCase()} vouch from @${v.users_vouches_voucherIdTousers.username || v.users_vouches_voucherIdTousers.fullName}`,
          impact: {
            points,
            component: 'vouches',
          },
        });
      });

      // Sort by timestamp and limit
      return updates
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, limit);
    } catch (error) {
      logger.error('Error getting recent updates:', error);
      throw error;
    }
  }

  /**
   * Get user stats
   */
  static async getUserStats(userId: string): Promise<any> {
    try {
      const stats = await prisma.userStat.findUnique({
        where: { userId },
      });

      if (!stats) {
        // Create default stats if not found
        return {
          userId,
          eventsAttended: 0,
          eventsHosted: 0,
          vouchesGiven: 0,
          vouchesReceived: 0,
          listingsPosted: 0,
          servicesProvided: 0,
          communitiesJoined: 0,
          totalPoints: 0,
          lastCalculatedAt: new Date(),
        };
      }

      return stats;
    } catch (error) {
      logger.error('Error getting user stats:', error);
      throw error;
    }
  }

  /**
   * Get trust score history
   */
  static async getTrustScoreHistory(
    userId: string,
    startDate?: Date,
    endDate?: Date,
    granularity: 'daily' | 'weekly' | 'monthly' = 'daily'
  ): Promise<any> {
    try {
      // Verify user exists
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, trustScore: true },
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Default date range: last 30 days
      const end = endDate || new Date();
      const start = startDate || new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Fetch history records
      const historyRecords = await prisma.trustScoreHistory.findMany({
        where: {
          userId,
          timestamp: {
            gte: start,
            lte: end,
          },
        },
        orderBy: {
          timestamp: 'asc',
        },
      });

      // If no history, return current score as single entry
      if (historyRecords.length === 0) {
        return {
          userId,
          history: [
            {
              timestamp: new Date(),
              score: user.trustScore,
              change: 0,
              reason: 'Current score',
            },
          ],
          summary: {
            startScore: user.trustScore,
            endScore: user.trustScore,
            totalChange: 0,
            highestScore: user.trustScore,
            lowestScore: user.trustScore,
            averageScore: user.trustScore,
            periodDays: Math.ceil((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)),
          },
        };
      }

      // Calculate summary statistics
      const scores = historyRecords.map(h => h.score);
      const startScore = historyRecords[0].score;
      const endScore = historyRecords[historyRecords.length - 1].score;
      const totalChange = endScore - startScore;
      const highestScore = Math.max(...scores);
      const lowestScore = Math.min(...scores);
      const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;

      return {
        userId,
        history: historyRecords.map(h => ({
          timestamp: h.timestamp,
          score: h.score,
          change: h.change,
          previousScore: h.previousScore,
          reason: h.reason,
          component: h.component,
          relatedEntityType: h.relatedEntityType,
          relatedEntityId: h.relatedEntityId,
        })),
        summary: {
          startScore,
          endScore,
          totalChange,
          highestScore,
          lowestScore,
          averageScore: Math.round(averageScore * 100) / 100,
          periodDays: Math.ceil((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)),
        },
      };
    } catch (error) {
      logger.error('Error getting trust score history:', error);
      throw error;
    }
  }

  /**
   * Record trust score change in history
   */
  static async recordScoreChange(
    userId: string,
    newScore: number,
    previousScore: number,
    reason: string,
    component?: 'vouches' | 'activity' | 'trustMoments',
    relatedEntityType?: string,
    relatedEntityId?: string,
    metadata?: any
  ): Promise<void> {
    try {
      const change = newScore - previousScore;

      await prisma.trustScoreHistory.create({
        data: {
          userId,
          score: newScore,
          change,
          previousScore,
          reason,
          component,
          relatedEntityType,
          relatedEntityId,
          metadata,
        },
      });

      logger.info(`Trust score history recorded for user ${userId}: ${previousScore} → ${newScore} (${change >= 0 ? '+' : ''}${change})`);
    } catch (error) {
      logger.error('Error recording score change:', error);
      // Don't throw - history recording should not break the main flow
    }
  }

  /**
   * Get comprehensive trust dashboard
   */
  static async getTrustDashboard(userId: string): Promise<any> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          fullName: true,
          trustScore: true,
          trustLevel: true,
        },
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Get rank percentile
      const totalUsers = await prisma.user.count({
        where: { status: 'ACTIVE', deletedAt: null },
      });

      const usersWithHigherScore = await prisma.user.count({
        where: {
          status: 'ACTIVE',
          deletedAt: null,
          trustScore: { gt: user.trustScore },
        },
      });

      const percentile = totalUsers > 0 ? ((totalUsers - usersWithHigherScore) / totalUsers) * 100 : 0;

      // Recent changes (last 7 days)
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const recentChanges = await prisma.trustScoreHistory.findMany({
        where: {
          userId,
          timestamp: { gte: sevenDaysAgo },
        },
        orderBy: { timestamp: 'desc' },
        take: 10,
      });

      // Get suggestions
      const suggestions = await this.getSuggestions(userId);

      // Get accountability impact (if user is a voucher)
      const accountabilityImpact = await prisma.accountabilityLog.aggregate({
        where: {
          voucherId: userId,
          isProcessed: true,
        },
        _sum: { impactValue: true },
        _count: true,
      });

      // Check for upcoming decay
      const lastActivity = await this.getLastActivityDate(userId);
      const inactiveDays = Math.floor((Date.now() - lastActivity.getTime()) / (24 * 60 * 60 * 1000));
      const decayWarning = inactiveDays >= 23 && inactiveDays < 30 ? {
        daysUntilDecay: 30 - inactiveDays,
        message: `Your trust score will start decaying in ${30 - inactiveDays} days due to inactivity`,
      } : null;

      return {
        user: {
          id: user.id,
          fullName: user.fullName,
          trustScore: user.trustScore,
          trustLevel: user.trustLevel,
        },
        rank: {
          percentile: Math.round(percentile * 10) / 10,
          position: usersWithHigherScore + 1,
          totalUsers,
        },
        recentChanges: recentChanges.map(c => ({
          timestamp: c.timestamp,
          change: c.change,
          reason: c.reason,
          newScore: c.score,
        })),
        suggestions,
        accountabilityImpact: {
          totalImpact: accountabilityImpact._sum.impactValue || 0,
          affectedVouchees: accountabilityImpact._count || 0,
        },
        decayWarning,
        lastActivity: {
          date: lastActivity,
          daysAgo: inactiveDays,
        },
      };
    } catch (error) {
      logger.error('Error getting trust dashboard:', error);
      throw error;
    }
  }

  /**
   * Get leaderboard
   */
  static async getLeaderboard(
    requesterId?: string,
    type: 'global' | 'community' | 'friends' = 'global',
    communityId?: string,
    limit: number = 100
  ): Promise<any> {
    try {
      let users: any[] = [];

      if (type === 'global') {
        // Global leaderboard
        users = await prisma.user.findMany({
          where: {
            status: 'ACTIVE',
            deletedAt: null,
            trustScore: { gt: 0 },
          },
          select: {
            id: true,
            fullName: true,
            username: true,
            trustScore: true,
            trustLevel: true,
          },
          orderBy: { trustScore: 'desc' },
          take: limit,
        });
      } else if (type === 'community' && communityId) {
        // Community-specific leaderboard
        const members = await prisma.communityMember.findMany({
          where: {
            communityId,
            isApproved: true,
            user: {
              status: 'ACTIVE',
              deletedAt: null,
            },
          },
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                username: true,
                trustScore: true,
                trustLevel: true,
              },
            },
          },
          take: limit,
        });

        users = members
          .map(m => m.user)
          .sort((a, b) => b.trustScore - a.trustScore)
          .slice(0, limit);
      } else if (type === 'friends' && requesterId) {
        // Friends leaderboard
        const connections = await prisma.userConnection.findMany({
          where: {
            OR: [
              { initiatorId: requesterId },
              { receiverId: requesterId },
            ],
            status: ConnectionStatus.ACCEPTED,
          },
          include: {
            users_user_connections_initiatorIdTousers: {
              select: {
                id: true,
                fullName: true,
                username: true,
                trustScore: true,
                trustLevel: true,
              },
            },
            users_user_connections_receiverIdTousers: {
              select: {
                id: true,
                fullName: true,
                username: true,
                trustScore: true,
                trustLevel: true,
              },
            },
          },
        });

        users = connections
          .map(c => c.initiatorId === requesterId ? c.users_user_connections_receiverIdTousers : c.users_user_connections_initiatorIdTousers)
          .sort((a, b) => b.trustScore - a.trustScore)
          .slice(0, limit);
      }

      // Add user's own rank if not in top list
      let userRank = null;
      if (requesterId) {
        const requester = users.find(u => u.id === requesterId);
        if (!requester) {
          const user = await prisma.user.findUnique({
            where: { id: requesterId },
            select: {
              id: true,
              fullName: true,
              username: true,
              trustScore: true,
              trustLevel: true,
            },
          });

          if (user) {
            const higherScores = await prisma.user.count({
              where: {
                status: 'ACTIVE',
                deletedAt: null,
                trustScore: { gt: user.trustScore },
              },
            });

            userRank = {
              rank: higherScores + 1,
              user: {
                id: user.id,
                username: user.username || 'Anonymous',
                trustScore: user.trustScore,
                trustLevel: user.trustLevel,
              },
            };
          }
        }
      }

      // Anonymize for privacy (show username or "Anonymous")
      const leaderboard = users.map((user, index) => ({
        rank: index + 1,
        username: user.username || `User${user.id.slice(-4)}`,
        trustScore: Math.round(user.trustScore * 10) / 10,
        trustLevel: user.trustLevel,
        isMe: requesterId === user.id,
      }));

      return {
        type,
        communityId: type === 'community' ? communityId : undefined,
        leaderboard,
        userRank,
        total: leaderboard.length,
        cacheTimestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('Error getting leaderboard:', error);
      throw error;
    }
  }

  /**
   * Helper: Get last activity date
   */
  private static async getLastActivityDate(userId: string): Promise<Date> {
    const [lastEvent, lastTrustMoment, lastListing, lastConnection] = await Promise.all([
      prisma.eventParticipant.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true },
      }),
      prisma.trustMoment.findFirst({
        where: { giverId: userId },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true },
      }),
      prisma.marketplaceListing.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true },
      }),
      prisma.userConnection.findFirst({
        where: {
          OR: [{ initiatorId: userId }, { receiverId: userId }],
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
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { createdAt: true },
      });
      return user?.createdAt || new Date();
    }

    return new Date(Math.max(...dates.map(d => d.getTime())));
  }

  /**
   * Get trust badges for a user
   */
  static async getTrustBadges(userId: string): Promise<any> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          fullName: true,
          trustScore: true,
          createdAt: true,
        },
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      const badges: any[] = [];

      // Badge 1: First Vouch (has at least 1 approved vouch)
      const vouchCount = await prisma.vouch.count({
        where: {
          voucheeId: userId,
          status: { in: ['APPROVED', 'ACTIVE'] },
        },
      });

      if (vouchCount >= 1) {
        badges.push({
          id: 'first-vouch',
          name: 'First Vouch',
          description: 'Received your first vouch from the community',
          icon: '🎖️',
          earnedAt: await prisma.vouch.findFirst({
            where: {
              voucheeId: userId,
              status: { in: ['APPROVED', 'ACTIVE'] },
            },
            orderBy: { approvedAt: 'asc' },
            select: { approvedAt: true },
          }).then(v => v?.approvedAt || null),
          tier: 'bronze',
        });
      }

      // Badge 2: Trusted Member (50%+ trust score)
      if (user.trustScore >= 50) {
        badges.push({
          id: 'trusted-member',
          name: 'Trusted Member',
          description: 'Achieved 50%+ trust score through consistent positive actions',
          icon: '⭐',
          earnedAt: await prisma.trustScoreHistory.findFirst({
            where: {
              userId,
              score: { gte: 50 },
            },
            orderBy: { timestamp: 'asc' },
            select: { timestamp: true },
          }).then(h => h?.timestamp || null),
          tier: 'silver',
        });
      }

      // Badge 3: Community Leader (76%+ trust score)
      if (user.trustScore >= 76) {
        badges.push({
          id: 'community-leader',
          name: 'Community Leader',
          description: 'Achieved 76%+ trust score and unlocked all platform features',
          icon: '👑',
          earnedAt: await prisma.trustScoreHistory.findFirst({
            where: {
              userId,
              score: { gte: 76 },
            },
            orderBy: { timestamp: 'asc' },
            select: { timestamp: true },
          }).then(h => h?.timestamp || null),
          tier: 'gold',
        });
      }

      // Badge 4: Perfect Record (no negative feedback for 90+ days)
      const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
      const negativeFeedback = await prisma.trustMoment.count({
        where: {
          receiverId: userId,
          rating: { lte: 2 },
          createdAt: { gte: ninetyDaysAgo },
        },
      });

      const daysSinceCreation = Math.floor((Date.now() - user.createdAt.getTime()) / (24 * 60 * 60 * 1000));

      if (negativeFeedback === 0 && daysSinceCreation >= 90) {
        badges.push({
          id: 'perfect-record',
          name: 'Perfect Record',
          description: 'Maintained zero negative feedback for 90+ days',
          icon: '💎',
          earnedAt: new Date(user.createdAt.getTime() + 90 * 24 * 60 * 60 * 1000),
          tier: 'platinum',
        });
      }

      // Badge 5: Accountability Hero (helped 5+ vouchees succeed)
      const positiveImpacts = await prisma.accountabilityLog.count({
        where: {
          voucherId: userId,
          impactType: 'POSITIVE',
          isProcessed: true,
        },
      });

      if (positiveImpacts >= 5) {
        badges.push({
          id: 'accountability-hero',
          name: 'Accountability Hero',
          description: 'Helped 5+ vouchees succeed through positive influence',
          icon: '🦸',
          earnedAt: await prisma.accountabilityLog.findFirst({
            where: {
              voucherId: userId,
              impactType: 'POSITIVE',
              isProcessed: true,
            },
            orderBy: { processedAt: 'asc' },
            skip: 4, // Get the 5th one
            select: { processedAt: true },
          }).then(log => log?.processedAt || null),
          tier: 'gold',
        });
      }

      // Additional badges based on achievements
      const stats = await prisma.userStat.findUnique({
        where: { userId },
      });

      if (stats) {
        // Event Enthusiast (attended 25+ events)
        if (stats.eventsAttended >= 25) {
          badges.push({
            id: 'event-enthusiast',
            name: 'Event Enthusiast',
            description: 'Attended 25+ community events',
            icon: '🎉',
            earnedAt: null,
            tier: 'silver',
          });
        }

        // Community Builder (joined 10+ communities)
        if (stats.communitiesJoined >= 10) {
          badges.push({
            id: 'community-builder',
            name: 'Community Builder',
            description: 'Active member of 10+ communities',
            icon: '🏘️',
            earnedAt: null,
            tier: 'silver',
          });
        }

        // Service Provider (provided 10+ services)
        if (stats.servicesProvided >= 10) {
          badges.push({
            id: 'service-provider',
            name: 'Service Provider',
            description: 'Provided 10+ services to the community',
            icon: '🛠️',
            earnedAt: null,
            tier: 'bronze',
          });
        }
      }

      return {
        userId,
        totalBadges: badges.length,
        badges: badges.sort((a, b) => {
          const tierOrder = { platinum: 0, gold: 1, silver: 2, bronze: 3 };
          return tierOrder[a.tier as keyof typeof tierOrder] - tierOrder[b.tier as keyof typeof tierOrder];
        }),
        progress: {
          nextBadge: this.getNextBadgeProgress(user.trustScore, vouchCount, positiveImpacts, stats),
        },
      };
    } catch (error) {
      logger.error('Error getting trust badges:', error);
      throw error;
    }
  }

  /**
   * Helper: Get progress toward next badge
   */
  private static getNextBadgeProgress(
    trustScore: number,
    vouchCount: number,
    positiveImpacts: number,
    stats: any
  ): any {
    // Check what badges are missing and provide progress
    if (vouchCount === 0) {
      return {
        badge: 'First Vouch',
        description: 'Get your first vouch from the community',
        progress: 0,
        target: 1,
      };
    }

    if (trustScore < 50) {
      return {
        badge: 'Trusted Member',
        description: 'Reach 50% trust score',
        progress: Math.round(trustScore),
        target: 50,
      };
    }

    if (trustScore < 76) {
      return {
        badge: 'Community Leader',
        description: 'Reach 76% trust score',
        progress: Math.round(trustScore),
        target: 76,
      };
    }

    if (positiveImpacts < 5) {
      return {
        badge: 'Accountability Hero',
        description: 'Help 5 vouchees succeed',
        progress: positiveImpacts,
        target: 5,
      };
    }

    if (stats && stats.eventsAttended < 25) {
      return {
        badge: 'Event Enthusiast',
        description: 'Attend 25 events',
        progress: stats.eventsAttended,
        target: 25,
      };
    }

    return {
      badge: 'All badges earned!',
      description: 'You\'ve earned all available badges. Keep up the great work!',
      progress: 100,
      target: 100,
    };
  }
}
