import { prisma } from '../../config/database';
import { BadgeService } from '../../services/badge.service';
import { PointsService } from '../../services/points.service';
import { NotificationService } from '../../services/notification.service';
import { POINT_VALUES } from '../../types';
import {
  GamificationDashboard,
  RewardFilters,
  LeaderboardFilters,
  LeaderboardEntry,
  PlatformGamificationStats,
  BadgeProgress,
  RewardInfo,
  RedemptionInfo,
} from './gamification.types';
import { AppError } from '../../middleware/error';
import { RedemptionStatus, BadgeType } from '@prisma/client';

export class GamificationService {
  // ================== Dashboard ==================

  static async getDashboard(userId: string): Promise<GamificationDashboard> {
    const [pointsData, badgesData, rewardsData, leaderboardData, statsData] = await Promise.all([
      this.getUserPointsInfo(userId),
      this.getUserBadgesInfo(userId),
      this.getUserRewardsInfo(userId),
      this.getUserLeaderboardRanks(userId),
      this.getUserStats(userId),
    ]);

    return {
      points: pointsData,
      badges: badgesData,
      rewards: rewardsData,
      leaderboard: leaderboardData,
      stats: statsData,
    };
  }

  private static async getUserPointsInfo(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { totalPoints: true },
    });

    const recentHistory = await prisma.pointHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const rank = await this.getPointsRank(userId);

    return {
      total: user?.totalPoints || 0,
      rank,
      recentEarnings: recentHistory,
    };
  }

  private static async getUserBadgesInfo(userId: string) {
    const earned = await BadgeService.getUserBadges(userId);
    const progress = await BadgeService.getBadgeProgress(userId);

    return {
      total: earned.length,
      earned: earned.map((ub: any) => ({
        ...ub.badges,
        earnedAt: ub.earnedAt,
        userBadgeId: ub.id,
      })),
      progress,
    };
  }

  private static async getUserRewardsInfo(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { totalPoints: true },
    });

    const activeRewards = await prisma.reward.count({
      where: { isActive: true, quantity: { gt: 0 } },
    });

    const canAfford = await prisma.reward.count({
      where: {
        isActive: true,
        quantity: { gt: 0 },
        pointsRequired: { lte: user?.totalPoints || 0 },
      },
    });

    const recentRedemptions = await prisma.redemption.findMany({
      where: { userId },
      include: { rewards: true },
      orderBy: { redeemedAt: 'desc' },
      take: 5,
    });

    return {
      availableCount: activeRewards,
      canAffordCount: canAfford,
      recentRedemptions: recentRedemptions.map((r: any) => ({
        ...r,
        reward: r.rewards,
      })),
    };
  }

  private static async getUserLeaderboardRanks(userId: string) {
    const [pointsRank, trustScoreRank, badgesRank] = await Promise.all([
      this.getPointsRank(userId),
      this.getTrustScoreRank(userId),
      this.getBadgesRank(userId),
    ]);

    return {
      pointsRank,
      trustScoreRank,
      badgesRank,
    };
  }

  private static async getUserStats(userId: string) {
    const [eventsCount, connectionsCount, user, profileCompletion] = await Promise.all([
      prisma.eventRsvp.count({ where: { userId } }),
      prisma.userConnection.count({
        where: {
          OR: [{ initiatorId: userId }, { receiverId: userId }],
          status: 'ACCEPTED',
        },
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { trustScore: true },
      }),
      prisma.profileCompletionStatus.findUnique({
        where: { userId },
        select: { completionScore: true },
      }),
    ]);

    return {
      eventsAttended: eventsCount,
      connectionsCount,
      trustScore: user?.trustScore || 0,
      profileCompletion: profileCompletion?.completionScore || 0,
    };
  }

  // ================== Rewards ==================

  static async getRewards(filters: RewardFilters, userId?: string) {
    const where: any = {};

    if (filters.category) {
      where.category = filters.category;
    }

    if (filters.minPoints !== undefined || filters.maxPoints !== undefined) {
      where.pointsRequired = {};
      if (filters.minPoints !== undefined) where.pointsRequired.gte = filters.minPoints;
      if (filters.maxPoints !== undefined) where.pointsRequired.lte = filters.maxPoints;
    }

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    } else {
      // Default to active rewards only
      where.isActive = true;
      where.quantity = { gt: 0 };
    }

    // Filter by what user can afford
    if (filters.canAfford && userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { totalPoints: true },
      });
      if (user) {
        where.pointsRequired = {
          ...where.pointsRequired,
          lte: user.totalPoints,
        };
      }
    }

    const rewards = await prisma.reward.findMany({
      where,
      orderBy: { pointsRequired: 'asc' },
    });

    const total = await prisma.reward.count({ where });

    let userPoints: number | undefined;
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { totalPoints: true },
      });
      userPoints = user?.totalPoints;
    }

    return { rewards, total, userPoints };
  }

  static async getRewardById(rewardId: string): Promise<RewardInfo | null> {
    return prisma.reward.findUnique({
      where: { id: rewardId },
    });
  }

  static async createReward(data: {
    title: string;
    description: string;
    pointsRequired: number;
    category: string;
    partner: string;
    quantity: number;
    imageUrl?: string;
  }): Promise<RewardInfo> {
    return prisma.reward.create({
      data: {
        title: data.title,
        description: data.description,
        pointsRequired: data.pointsRequired,
        category: data.category,
        partner: data.partner,
        quantity: data.quantity,
        imageUrl: data.imageUrl,
        isActive: true,
      },
    });
  }

  static async updateReward(
    rewardId: string,
    data: {
      title?: string;
      description?: string;
      pointsRequired?: number;
      category?: string;
      partner?: string;
      quantity?: number;
      imageUrl?: string;
      isActive?: boolean;
    }
  ): Promise<RewardInfo> {
    return prisma.reward.update({
      where: { id: rewardId },
      data,
    });
  }

  static async deleteReward(rewardId: string): Promise<boolean> {
    await prisma.reward.delete({
      where: { id: rewardId },
    });
    return true;
  }

  static async redeemReward(userId: string, rewardId: string): Promise<RedemptionInfo> {
    const reward = await prisma.reward.findUnique({
      where: { id: rewardId },
    });

    if (!reward) {
      throw new AppError('Reward not found', 404);
    }

    if (!reward.isActive || reward.quantity <= 0) {
      throw new AppError('Reward not available', 400);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { totalPoints: true },
    });

    if (!user || user.totalPoints < reward.pointsRequired) {
      throw new AppError('Insufficient points', 400);
    }

    // Create redemption in transaction
    const redemption = await prisma.$transaction(async (tx: any) => {
      // Deduct points
      await PointsService.deductPoints(userId, reward.pointsRequired, `Redeemed: ${reward.title}`);

      // Create redemption record
      const redemption = await tx.redemption.create({
        data: {
          userId,
          rewardId,
          status: RedemptionStatus.PENDING,
        },
        include: {
          rewards: true,
        },
      });

      // Update reward quantity
      await tx.reward.update({
        where: { id: rewardId },
        data: {
          quantity: {
            decrement: 1,
          },
        },
      });

      return redemption;
    });

    // Send reward redemption notification
    await NotificationService.createNotification({
      userId,
      type: 'POINTS',
      title: '🎁 Reward Redeemed!',
      message: `You've successfully redeemed ${reward.title} for ${reward.pointsRequired} points!`,
      actionUrl: '/rewards',
      priority: 'normal',
      relatedEntityId: redemption.id,
      relatedEntityType: 'reward_redemption',
      metadata: {
        rewardId: reward.id,
        rewardTitle: reward.title,
        pointsSpent: reward.pointsRequired,
        category: reward.category,
      },
    });

    return redemption;
  }

  static async getUserRedemptions(userId: string): Promise<RedemptionInfo[]> {
    const redemptions = await prisma.redemption.findMany({
      where: { userId },
      include: {
        rewards: true,
      },
      orderBy: { redeemedAt: 'desc' },
    });
    return redemptions.map((r: any) => ({ ...r, reward: r.rewards }));
  }

  static async getRedemptionById(redemptionId: string): Promise<RedemptionInfo | null> {
    const redemption = await prisma.redemption.findUnique({
      where: { id: redemptionId },
      include: {
        rewards: true,
      },
    });
    if (!redemption) return null;
    return { ...(redemption as any), reward: (redemption as any).rewards };
  }

  static async updateRedemptionStatus(
    redemptionId: string,
    status: RedemptionStatus,
    notes?: string
  ): Promise<RedemptionInfo> {
    const redemption = await prisma.redemption.update({
      where: { id: redemptionId },
      data: {
        status,
        notes,
        processedAt: new Date(),
      },
      include: {
        rewards: true,
      },
    });
    return { ...(redemption as any), reward: (redemption as any).rewards };
  }

  static async getRewardCategories(): Promise<string[]> {
    const rewards = await prisma.reward.findMany({
      where: { isActive: true },
      select: { category: true },
      distinct: ['category'],
    });
    return rewards.map((r) => r.category);
  }

  // ================== Leaderboards ==================

  static async getPointsLeaderboard(filters: LeaderboardFilters): Promise<{
    leaderboard: LeaderboardEntry[];
    total: number;
    currentUserRank?: number;
  }> {
    const limit = filters.limit || 50;
    const offset = filters.offset || 0;

    const users = await prisma.user.findMany({
      where: {
        status: 'ACTIVE',
        deletedAt: null,
      },
      select: {
        id: true,
        fullName: true,
        totalPoints: true,
        profile: {
          select: {
            profilePicture: true,
          },
        },
      },
      orderBy: {
        totalPoints: 'desc',
      },
      take: limit,
      skip: offset,
    });

    const leaderboard: LeaderboardEntry[] = users.map((user, index) => ({
      userId: user.id,
      userName: user.fullName,
      userImage: user.profile?.profilePicture || undefined,
      value: user.totalPoints,
      rank: offset + index + 1,
    }));

    const total = await prisma.user.count({
      where: {
        status: 'ACTIVE',
        deletedAt: null,
      },
    });

    return { leaderboard, total };
  }

  static async getTrustScoreLeaderboard(filters: LeaderboardFilters) {
    const limit = filters.limit || 50;
    const offset = filters.offset || 0;

    const users = await prisma.user.findMany({
      where: {
        status: 'ACTIVE',
        deletedAt: null,
      },
      select: {
        id: true,
        fullName: true,
        trustScore: true,
        profile: {
          select: {
            profilePicture: true,
          },
        },
      },
      orderBy: {
        trustScore: 'desc',
      },
      take: limit,
      skip: offset,
    });

    const leaderboard: LeaderboardEntry[] = users.map((user, index) => ({
      userId: user.id,
      userName: user.fullName,
      userImage: user.profile?.profilePicture || undefined,
      value: user.trustScore,
      rank: offset + index + 1,
    }));

    const total = await prisma.user.count({
      where: {
        status: 'ACTIVE',
        deletedAt: null,
      },
    });

    return { leaderboard, total };
  }

  static async getBadgesLeaderboard(filters: LeaderboardFilters) {
    const limit = filters.limit || 50;
    const offset = filters.offset || 0;

    const badgeCounts = await prisma.userBadge.groupBy({
      by: ['userId'],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: limit,
      skip: offset,
    });

    const userIds = badgeCounts.map((bc) => bc.userId);
    const users = await prisma.user.findMany({
      where: {
        id: { in: userIds },
        status: 'ACTIVE',
        deletedAt: null,
      },
      select: {
        id: true,
        fullName: true,
        profile: {
          select: {
            profilePicture: true,
          },
        },
      },
    });

    const userMap = new Map(users.map((u) => [u.id, u]));

    const leaderboard: LeaderboardEntry[] = badgeCounts
      .map((bc, index) => {
        const user = userMap.get(bc.userId);
        if (!user) return null;
        return {
          userId: user.id,
          userName: user.fullName,
          userImage: user.profile?.profilePicture,
          value: bc._count.id,
          rank: offset + index + 1,
        };
      })
      .filter((entry) => entry !== null) as LeaderboardEntry[];

    const total = await prisma.userBadge.groupBy({
      by: ['userId'],
    });

    return { leaderboard, total: total.length };
  }

  static async getEventsLeaderboard(filters: LeaderboardFilters) {
    const limit = filters.limit || 50;
    const offset = filters.offset || 0;

    const eventCounts = await prisma.eventRsvp.groupBy({
      by: ['userId'],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: limit,
      skip: offset,
    });

    const userIds = eventCounts.map((ec) => ec.userId);
    const users = await prisma.user.findMany({
      where: {
        id: { in: userIds },
        status: 'ACTIVE',
        deletedAt: null,
      },
      select: {
        id: true,
        fullName: true,
        profile: {
          select: {
            profilePicture: true,
          },
        },
      },
    });

    const userMap = new Map(users.map((u) => [u.id, u]));

    const leaderboard: LeaderboardEntry[] = eventCounts
      .map((ec, index) => {
        const user = userMap.get(ec.userId);
        if (!user) return null;
        return {
          userId: user.id,
          userName: user.fullName,
          userImage: user.profile?.profilePicture,
          value: ec._count.id,
          rank: offset + index + 1,
        };
      })
      .filter((entry) => entry !== null) as LeaderboardEntry[];

    const total = await prisma.eventRsvp.groupBy({
      by: ['userId'],
    });

    return { leaderboard, total: total.length };
  }

  static async getConnectionsLeaderboard(filters: LeaderboardFilters) {
    const limit = filters.limit || 50;
    const offset = filters.offset || 0;

    const stats = await prisma.connectionStat.findMany({
      where: {
        users: {
          status: 'ACTIVE',
          deletedAt: null,
        },
      },
      select: {
        userId: true,
        totalConnections: true,
        users: {
          select: {
            fullName: true,
            profile: {
              select: {
                profilePicture: true,
              },
            },
          },
        },
      },
      orderBy: {
        totalConnections: 'desc',
      },
      take: limit,
      skip: offset,
    });

    const leaderboard: LeaderboardEntry[] = stats.map((stat, index) => ({
      userId: stat.userId,
      userName: stat.users.fullName,
      userImage: stat.users.profile?.profilePicture,
      value: stat.totalConnections,
      rank: offset + index + 1,
    }));

    const total = await prisma.connectionStat.count({
      where: {
        users: {
          status: 'ACTIVE',
          deletedAt: null,
        },
      },
    });

    return { leaderboard, total };
  }

  static async getReferralsLeaderboard(filters: LeaderboardFilters) {
    const limit = filters.limit || 50;
    const offset = filters.offset || 0;

    const stats = await prisma.referralStat.findMany({
      where: {
        users: {
          status: 'ACTIVE',
          deletedAt: null,
        },
      },
      select: {
        userId: true,
        totalActivated: true,
        users: {
          select: {
            fullName: true,
            profile: {
              select: {
                profilePicture: true,
              },
            },
          },
        },
      },
      orderBy: {
        totalActivated: 'desc',
      },
      take: limit,
      skip: offset,
    });

    const leaderboard: LeaderboardEntry[] = stats.map((stat, index) => ({
      userId: stat.userId,
      userName: stat.users.fullName,
      userImage: stat.users.profile?.profilePicture,
      value: stat.totalActivated,
      rank: offset + index + 1,
    }));

    const total = await prisma.referralStat.count({
      where: {
        users: {
          status: 'ACTIVE',
          deletedAt: null,
        },
      },
    });

    return { leaderboard, total };
  }

  // ================== Ranking Helpers ==================

  private static async getPointsRank(userId: string): Promise<number> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { totalPoints: true },
    });

    if (!user) return 0;

    const rank = await prisma.user.count({
      where: {
        totalPoints: { gt: user.totalPoints },
        status: 'ACTIVE',
        deletedAt: null,
      },
    });

    return rank + 1;
  }

  private static async getTrustScoreRank(userId: string): Promise<number> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { trustScore: true },
    });

    if (!user) return 0;

    const rank = await prisma.user.count({
      where: {
        trustScore: { gt: user.trustScore },
        status: 'ACTIVE',
        deletedAt: null,
      },
    });

    return rank + 1;
  }

  private static async getBadgesRank(userId: string): Promise<number> {
    const userBadgeCount = await prisma.userBadge.count({
      where: { userId },
    });

    const higherCounts = await prisma.userBadge.groupBy({
      by: ['userId'],
      _count: {
        id: true,
      },
      having: {
        id: {
          _count: {
            gt: userBadgeCount,
          },
        },
      },
    });

    return higherCounts.length + 1;
  }

  // ================== Platform Statistics ==================

  static async getPlatformStats(): Promise<PlatformGamificationStats> {
    const [
      totalPoints,
      totalBadges,
      totalRedemptions,
      activeUsers,
      badgeStats,
      rewardStats,
      pointsDistribution,
    ] = await Promise.all([
      prisma.pointHistory.aggregate({
        _sum: {
          points: true,
        },
        where: {
          points: { gt: 0 },
        },
      }),
      prisma.userBadge.count(),
      prisma.redemption.count(),
      prisma.user.count({
        where: {
          status: 'ACTIVE',
          deletedAt: null,
        },
      }),
      this.getMostPopularBadge(),
      this.getMostRedeemedReward(),
      this.getPointsDistribution(),
    ]);

    const averagePoints = activeUsers > 0 ? (totalPoints._sum.points || 0) / activeUsers : 0;

    return {
      totalPointsAwarded: totalPoints._sum.points || 0,
      totalBadgesEarned: totalBadges,
      totalRewardsRedeemed: totalRedemptions,
      activeUsers,
      averagePointsPerUser: Math.round(averagePoints),
      mostPopularBadge: badgeStats,
      mostRedeemedReward: rewardStats,
      pointsDistribution,
    };
  }

  private static async getMostPopularBadge(): Promise<{ type: BadgeType; count: number }> {
    const result = await prisma.userBadge.groupBy({
      by: ['badgeId'],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 1,
    });

    if (result.length === 0) {
      return { type: BadgeType.FIRST_FACE, count: 0 };
    }

    const badge = await prisma.badge.findUnique({
      where: { id: result[0].badgeId },
    });

    return {
      type: badge?.type || BadgeType.FIRST_FACE,
      count: result[0]._count.id,
    };
  }

  private static async getMostRedeemedReward(): Promise<{ title: string; count: number }> {
    const result = await prisma.redemption.groupBy({
      by: ['rewardId'],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 1,
    });

    if (result.length === 0) {
      return { title: 'None', count: 0 };
    }

    const reward = await prisma.reward.findUnique({
      where: { id: result[0].rewardId },
    });

    return {
      title: reward?.title || 'Unknown',
      count: result[0]._count.id,
    };
  }

  private static async getPointsDistribution() {
    const [range1, range2, range3, range4] = await Promise.all([
      prisma.user.count({
        where: {
          totalPoints: { gte: 0, lte: 100 },
          status: 'ACTIVE',
          deletedAt: null,
        },
      }),
      prisma.user.count({
        where: {
          totalPoints: { gte: 101, lte: 500 },
          status: 'ACTIVE',
          deletedAt: null,
        },
      }),
      prisma.user.count({
        where: {
          totalPoints: { gte: 501, lte: 1000 },
          status: 'ACTIVE',
          deletedAt: null,
        },
      }),
      prisma.user.count({
        where: {
          totalPoints: { gt: 1000 },
          status: 'ACTIVE',
          deletedAt: null,
        },
      }),
    ]);

    return {
      '0-100': range1,
      '101-500': range2,
      '501-1000': range3,
      '1001+': range4,
    };
  }

  // ================== Point Actions ==================

  static getPointActions() {
    return Object.entries(POINT_VALUES).map(([action, points]) => ({
      action,
      points,
      description: this.getActionDescription(action),
      category: this.getActionCategory(action),
    }));
  }

  private static getActionDescription(action: string): string {
    const descriptions: Record<string, string> = {
      REGISTER: 'Welcome bonus for new users',
      COMPLETE_PROFILE_BASIC: 'Complete basic profile information',
      COMPLETE_PROFILE_FULL: 'Complete full profile (100%)',
      VERIFY_EMAIL: 'Verify your email address',
      VERIFY_PHONE: 'Verify your phone number',
      UPLOAD_PROFILE_PHOTO: 'Upload a profile photo',
      ATTEND_EVENT: 'Attend an event',
      HOST_EVENT: 'Host an event',
      RSVP_EVENT: 'RSVP to an event',
      CANCEL_RSVP: 'Penalty for canceling RSVP',
      JOIN_TRIP: 'Join a travel trip',
      CAFE_MEETUP: 'Attend a cafe meetup',
      ILM_EVENT: 'Attend an ILM event',
      VOLUNTEER: 'Volunteer at an event',
      DONATE: 'Make a donation',
      FIRST_CONNECTION: 'Make your first connection',
      MAKE_CONNECTION: 'Make a new connection',
      RECEIVE_CONNECTION: 'Receive a connection request',
      VOUCH_SOMEONE: 'Vouch for someone',
      RECEIVE_VOUCH: 'Receive a vouch',
      GIVE_TRUST_MOMENT: 'Give a trust moment',
      RECEIVE_POSITIVE_TRUST_MOMENT: 'Receive a positive trust moment',
      JOIN_COMMUNITY: 'Join a community',
      COMMUNITY_PARTICIPATION: 'Participate in community activities',
      BECOME_MODERATOR: 'Become a community moderator',
      REFERRAL: 'Successfully refer a friend',
      REFEREE_SIGNUP: 'Sign up using a referral code',
      SUBMIT_CARD_GAME_FEEDBACK: 'Submit card game feedback',
      RECEIVE_HELPFUL_VOTE: 'Receive a helpful vote on feedback',
      REPLY_TO_FEEDBACK: 'Reply to card game feedback',
      FIRST_LISTING: 'Create your first marketplace listing',
      COMPLETE_TRANSACTION: 'Complete a marketplace transaction',
      RECEIVE_POSITIVE_REVIEW: 'Receive a positive review',
      EARN_BADGE: 'Earn a new badge',
      REACH_TRUST_MILESTONE: 'Reach a trust score milestone',
      MAINTAIN_STREAK_WEEK: 'Maintain a weekly activity streak',
      MAINTAIN_STREAK_MONTH: 'Maintain a monthly activity streak',
      RECEIVE_NEGATIVE_TRUST_MOMENT: 'Penalty for negative trust moment',
      REPORT_VALIDATED: 'Penalty for validated report against you',
      SPAM_DETECTED: 'Penalty for spam activity',
    };
    return descriptions[action] || action;
  }

  private static getActionCategory(action: string): string {
    if (action.startsWith('COMPLETE_PROFILE') || action.startsWith('VERIFY') || action.startsWith('UPLOAD')) {
      return 'Profile';
    }
    if (action.includes('EVENT') || action.includes('TRIP') || action.includes('VOLUNTEER')) {
      return 'Events';
    }
    if (action.includes('CONNECTION') || action.includes('VOUCH') || action.includes('TRUST')) {
      return 'Social';
    }
    if (action.includes('COMMUNITY')) {
      return 'Community';
    }
    if (action.includes('REFERRAL') || action.includes('REFEREE')) {
      return 'Referrals';
    }
    if (action.includes('CARD_GAME') || action.includes('FEEDBACK')) {
      return 'Card Game';
    }
    if (action.includes('LISTING') || action.includes('TRANSACTION') || action.includes('REVIEW')) {
      return 'Marketplace';
    }
    if (action.includes('BADGE') || action.includes('MILESTONE') || action.includes('STREAK')) {
      return 'Achievements';
    }
    if (action.includes('NEGATIVE') || action.includes('REPORT') || action.includes('SPAM')) {
      return 'Penalties';
    }
    return 'Other';
  }
}
