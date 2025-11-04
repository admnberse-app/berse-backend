import { UserBadge, Badge, Vouch } from '@prisma/client';

// ==================== PROFILE ENRICHMENT INTERFACES ====================

export interface VerificationBadges {
  email: boolean;
  phone: boolean;
  identity: boolean;
  address: boolean;
}

export interface TrustMetrics {
  trustLevel: string; // starter, trusted, leader
  trustScore: number; // 0-100
  isVerified: boolean;
  verificationBadges: VerificationBadges;
}

export interface UserStats {
  eventsAttended: number;
  eventsHosted: number;
  vouchesReceived: number;
  vouchesGiven: number;
  servicesProvided: number;
  communitiesJoined: number;
  totalPoints: number;
}

export interface ConnectionStats {
  totalConnections: number;
  averageRating?: number;
  totalReviewsReceived: number;
  totalReviewsGiven: number;
  connectionQuality: number;
  trustChainDepth: number;
}

export interface BadgeInfo {
  type: string;
  name: string;
  description: string;
  imageUrl?: string;
  earnedAt: Date;
  category?: string;
  tier?: string;
}

export interface VouchSummary {
  primary: number;
  secondary: number;
  community: number;
  total: number;
}

export interface UserProfileData {
  displayName?: string;
  bio?: string;
  shortBio?: string;
  profession?: string;
  age?: number;
  gender?: string;
  personalityType?: string;
  interests: string[];
  languages: string[];
  travelStyle?: string;
  website?: string;
  instagramHandle?: string;
  linkedinHandle?: string;
}

export interface MutualData {
  connections: number;
  communities: number;
  events?: number;
}

export interface EnrichedUserProfile {
  // Core identity
  id: string;
  fullName: string;
  username?: string;
  profilePicture?: string;
  
  // Profile details
  profile: UserProfileData;
  
  // Trust & verification
  trust: TrustMetrics;
  
  // Statistics
  stats: UserStats;
  
  // Connection stats
  connectionStats: ConnectionStats | null;
  
  // Badges
  badges: BadgeInfo[];
  
  // Vouches summary
  vouches: VouchSummary;
  
  // Social context (if logged in user provided)
  mutualConnections?: number;
  mutualCommunities?: number;
  mutualEvents?: number;
  
  // Activity
  lastSeenAt?: Date;
  memberSince: Date;
  
  // Response metrics
  responseRate?: number;
  averageResponseTime?: number;
}

// ==================== ENRICHMENT OPTIONS ====================

export interface ProfileEnrichmentOptions {
  includePrivateFields?: boolean;
  requestingUserId?: string; // For mutual connections
  includeServiceStats?: boolean;
  includeBadges?: boolean;
  includeVouches?: boolean;
  includeConnectionStats?: boolean;
  cacheDuration?: number; // seconds, default 300 (5 minutes)
}

// ==================== VOUCH DETAILS ====================

export interface VouchDetails extends Vouch {
  voucher?: {
    id: string;
    fullName: string;
    profilePicture?: string;
    trustLevel: string;
  };
}

// ==================== TRUST CHAIN ====================

export interface TrustChainMember {
  voucherId: string;
  voucherName: string;
  voucherPhoto?: string;
  vouchType: 'PRIMARY' | 'SECONDARY' | 'COMMUNITY';
  message?: string;
  approvedAt: Date;
  voucherTrustScore?: number;
  voucherTrustLevel?: string;
}

// ==================== MUTUAL CONNECTIONS ====================

export interface MutualConnection {
  id: string;
  fullName: string;
  profilePicture?: string;
  username?: string;
  connectionType?: string; // FRIEND, ACQUAINTANCE, etc.
  trustLevel?: string;
}

// ==================== BADGE WITH PROGRESS ====================

export interface BadgeWithProgress extends BadgeInfo {
  progress?: number; // 0-100 percentage
  requiredCount?: number;
  currentCount?: number;
  nextTier?: string;
}

// ==================== ACTIVITY SUMMARY ====================

export interface ActivitySummary {
  isActive: boolean;
  lastSeenAt?: Date;
  lastActiveAt?: Date;
  activityLevel: 'Very Active' | 'Active' | 'Occasional' | 'Inactive';
  responseRate?: number;
  averageResponseTime?: number; // hours
  typicalResponseTimeRange?: string; // "within 2 hours", "within 1 day"
}

// ==================== SOCIAL PROOF ====================

export interface SocialProof {
  totalConnections: number;
  mutualConnections?: number;
  mutualCommunities?: number;
  totalReviews: number;
  averageRating?: number;
  vouchesReceived: number;
  eventsAttended: number;
  communitiesJoined: number;
  trustScore: number;
  trustLevel: string;
  memberSince: Date;
  badges: BadgeInfo[];
}

// ==================== REPUTATION SCORE ====================

export interface ReputationScore {
  overall: number; // 0-100 composite score
  trust: number; // Trust score (0-100)
  reliability: number; // Based on response rate, completion rate
  quality: number; // Based on reviews, ratings
  engagement: number; // Based on activity, connections
  experience: number; // Based on years, sessions/guests
  breakdown: {
    trustScore: { value: number; weight: number };
    reviewRating: { value: number; weight: number };
    responseRate: { value: number; weight: number };
    completionRate: { value: number; weight: number };
    activityLevel: { value: number; weight: number };
    vouchCount: { value: number; weight: number };
  };
}
