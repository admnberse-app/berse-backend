import { BadgeType, RedemptionStatus } from '@prisma/client';

// ================== Badge Types ==================

export interface BadgeInfo {
  id: string;
  type: BadgeType;
  name: string;
  description: string;
  criteria: string;
  imageUrl: string | null;
}

export interface UserBadgeInfo extends BadgeInfo {
  earnedAt: Date;
  userBadgeId: string;
}

export interface BadgeProgress {
  badge: BadgeInfo;
  isEarned: boolean;
  currentProgress: number;
  requiredProgress: number;
  percentage: number;
  nextMilestone?: string;
}

export interface BadgeCheckResult {
  badgeType: BadgeType;
  earned: boolean;
  progress: number;
  required: number;
}

// ================== Points Types ==================

export interface PointHistoryEntry {
  id: string;
  points: number;
  action: string;
  description: string | null;
  createdAt: Date;
}

export interface UserPointsInfo {
  totalPoints: number;
  history: PointHistoryEntry[];
  rank?: number;
}

export interface PointAction {
  action: string;
  points: number;
  description: string;
  category: string;
}

export interface LeaderboardEntry {
  userId: string;
  userName: string;
  userImage?: string;
  value: number;
  rank: number;
}

// ================== Rewards Types ==================

export interface RewardInfo {
  id: string;
  title: string;
  description: string;
  pointsRequired: number;
  category: string;
  partner: string;
  quantity: number;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RedemptionInfo {
  id: string;
  status: RedemptionStatus;
  notes: string | null;
  redeemedAt: Date;
  processedAt: Date | null;
  reward: RewardInfo;
  userId: string;
}

export interface RedeemRewardRequest {
  rewardId: string;
}

export interface CreateRewardRequest {
  title: string;
  description: string;
  pointsRequired: number;
  category: string;
  partner: string;
  quantity: number;
  imageUrl?: string;
}

export interface UpdateRewardRequest {
  title?: string;
  description?: string;
  pointsRequired?: number;
  category?: string;
  partner?: string;
  quantity?: number;
  imageUrl?: string;
  isActive?: boolean;
}

export interface UpdateRedemptionStatusRequest {
  status: RedemptionStatus;
  notes?: string;
}

// ================== Dashboard Types ==================

export interface GamificationDashboard {
  points: {
    total: number;
    rank: number;
    recentEarnings: PointHistoryEntry[];
  };
  badges: {
    total: number;
    earned: UserBadgeInfo[];
    progress: BadgeProgress[];
  };
  rewards: {
    availableCount: number;
    canAffordCount: number;
    recentRedemptions: RedemptionInfo[];
  };
  leaderboard: {
    pointsRank: number;
    trustScoreRank: number;
    badgesRank: number;
  };
  stats: {
    eventsAttended: number;
    connectionsCount: number;
    trustScore: number;
    profileCompletion: number;
  };
}

// ================== Query/Filter Types ==================

export interface RewardFilters {
  category?: string;
  minPoints?: number;
  maxPoints?: number;
  isActive?: boolean;
  canAfford?: boolean;
}

export interface PointHistoryFilters {
  action?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

export interface LeaderboardFilters {
  limit?: number;
  offset?: number;
  timeframe?: 'all' | 'month' | 'week' | 'day';
}

// ================== Admin Types ==================

export interface AwardPointsRequest {
  userId: string;
  points: number;
  action: string;
  description?: string;
}

export interface AwardBadgeRequest {
  userId: string;
  badgeType: BadgeType;
}

export interface RevokeBadgeRequest {
  userId: string;
  badgeType: BadgeType;
}

// ================== Statistics Types ==================

export interface PlatformGamificationStats {
  totalPointsAwarded: number;
  totalBadgesEarned: number;
  totalRewardsRedeemed: number;
  activeUsers: number;
  averagePointsPerUser: number;
  mostPopularBadge: {
    type: BadgeType;
    count: number;
  };
  mostRedeemedReward: {
    title: string;
    count: number;
  };
  pointsDistribution: {
    '0-100': number;
    '101-500': number;
    '501-1000': number;
    '1001+': number;
  };
}

// ================== Response Types ==================

export interface BadgeListResponse {
  badges: BadgeInfo[];
  total: number;
}

export interface UserBadgeListResponse {
  badges: UserBadgeInfo[];
  total: number;
}

export interface BadgeProgressResponse {
  progress: BadgeProgress[];
  earnedCount: number;
  totalCount: number;
}

export interface RewardListResponse {
  rewards: RewardInfo[];
  total: number;
  userPoints?: number;
}

export interface RedemptionListResponse {
  redemptions: RedemptionInfo[];
  total: number;
}

export interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[];
  currentUserRank?: number;
  total: number;
}
