/**
 * Subscription & Trust Level Types
 * Defines types for dual-gating system (Subscription + Trust)
 */

// ============================================================================
// ENUMS
// ============================================================================

/**
 * Subscription tier codes
 */
export enum SubscriptionTier {
  FREE = 'FREE',
  BASIC = 'BASIC'
}

/**
 * Trust level tiers
 * Based on points: 0-30 (Starter), 31-60 (Trusted), 61-100 (Leader)
 */
export enum TrustLevel {
  STARTER = 'starter',      // 0-30 points
  TRUSTED = 'trusted',      // 31-60 points
  LEADER = 'leader'         // 61-100 points
}

/**
 * Feature codes for access control
 */
export enum FeatureCode {
  // Events
  VIEW_EVENTS = 'VIEW_EVENTS',
  JOIN_EVENTS = 'JOIN_EVENTS',
  CREATE_EVENTS = 'CREATE_EVENTS',
  HOST_EVENTS = 'HOST_EVENTS',
  CREATE_PAID_EVENTS = 'CREATE_PAID_EVENTS',

  // Marketplace
  VIEW_MARKETPLACE = 'VIEW_MARKETPLACE',
  BUY_MARKETPLACE = 'BUY_MARKETPLACE',
  SELL_MARKETPLACE = 'SELL_MARKETPLACE',

  // Travel & Stays
  JOIN_TRAVEL = 'JOIN_TRAVEL',
  HOST_TRAVEL = 'HOST_TRAVEL',

  // HomeSurf (Accommodation Hosting)
  HOMESURF_GUEST = 'HOMESURF_GUEST',  // Book/request accommodation
  HOMESURF_HOST = 'HOMESURF_HOST',    // Host/offer accommodation

  // BerseGuide (Local Tour Guide)
  BERSEGUIDE_GUEST = 'BERSEGUIDE_GUEST',  // Book/request tours
  BERSEGUIDE_HOST = 'BERSEGUIDE_HOST',    // Provide tours/guide services

  // Services
  USE_SERVICE_MATCHING_CLIENT = 'USE_SERVICE_MATCHING_CLIENT',
  OFFER_PROFESSIONAL_SERVICES = 'OFFER_PROFESSIONAL_SERVICES',
  
  // Mentorship
  SEEK_MENTORSHIP = 'SEEK_MENTORSHIP',
  PROVIDE_MENTORSHIP = 'PROVIDE_MENTORSHIP',

  // Community
  JOIN_COMMUNITIES = 'JOIN_COMMUNITIES',
  CREATE_COMMUNITIES = 'CREATE_COMMUNITIES',
  MODERATE_COMMUNITIES = 'MODERATE_COMMUNITIES',
  ADMIN_COMMUNITIES = 'ADMIN_COMMUNITIES',

  // Social
  SEND_CONNECTIONS = 'SEND_CONNECTIONS',
  SEND_MESSAGES = 'SEND_MESSAGES',
  VOUCH_FOR_USERS = 'VOUCH_FOR_USERS',

  // Advanced
  FUNDRAISING = 'FUNDRAISING',
  PLATFORM_AMBASSADOR = 'PLATFORM_AMBASSADOR',
  REVENUE_SHARING = 'REVENUE_SHARING',
  CUSTOM_BADGES = 'CUSTOM_BADGES',
  ANALYTICS = 'ANALYTICS',
  PRIORITY_SUPPORT = 'PRIORITY_SUPPORT'
}

/**
 * Billing cycle options
 */
export enum BillingCycle {
  MONTHLY = 'MONTHLY',
  ANNUAL = 'ANNUAL'
}

/**
 * Re-export Prisma's SubscriptionStatus enum to ensure type compatibility
 */
import { SubscriptionStatus } from '@prisma/client';
export { SubscriptionStatus };

// ============================================================================
// INTERFACES
// ============================================================================

/**
 * Marketplace access configuration
 */
export interface MarketplaceAccess {
  canBuy: boolean;
  canSell: boolean;
  maxTransactionAmount?: number; // Max per transaction (for safety)
  maxListings?: number;          // Max active listings
  maxMonthlyTransactions?: number;
}

/**
 * Travel & stays access configuration
 */
export interface TravelAccess {
  canJoin: boolean;
  canHost: boolean;
  maxMonthlyBookings?: number;
  canHostHomestay: boolean;
  canBeHomestayGuest: boolean;
}

/**
 * Service access configuration
 */
export interface ServiceAccess {
  canUseAsClient: boolean;
  canOfferServices: boolean;
  maxActiveServices?: number;
}

/**
 * Mentorship access configuration
 */
export interface MentorshipAccess {
  canSeek: boolean;
  canMentor: boolean;
  maxMentees?: number;
  maxMentors?: number;
}

/**
 * Event access configuration
 */
export interface EventAccess {
  canView: boolean;
  canJoin: boolean;
  canCreate: boolean;
  canHost: boolean;
  maxEventsPerMonth: number;
  maxHostedPerMonth?: number;
  canCreatePaidEvents: boolean;
}

/**
 * Community access configuration
 */
export interface CommunityAccess {
  canJoin: boolean;
  canCreate: boolean;
  canModerate: boolean;
  canAdmin: boolean;
  maxCommunities?: number;
}

/**
 * Complete tier features structure
 */
export interface TierFeatures {
  // Basic features
  maxEventsPerMonth: number;
  maxConnections: number;
  profileBoost: boolean;
  customBadges: boolean;
  prioritySupport: boolean;
  analytics: boolean;

  // Trust-based feature configs
  eventAccess: EventAccess;
  marketplaceAccess: MarketplaceAccess;
  travelAccess: TravelAccess;
  serviceAccess: ServiceAccess;
  mentorshipAccess: MentorshipAccess;
  communityAccess: CommunityAccess;

  // Advanced features
  fundraisingAccess: boolean;
  platformAmbassador: boolean;
  revenueSharing: boolean;
  customEventPages: boolean;
}

/**
 * Default FREE tier features
 */
export const DEFAULT_FREE_TIER_FEATURES: TierFeatures = {
  maxEventsPerMonth: 5,
  maxConnections: 50,
  profileBoost: false,
  customBadges: false,
  prioritySupport: false,
  analytics: false,
  eventAccess: {
    canView: true,
    canJoin: true,
    canCreate: true,
    canHost: false,
    maxEventsPerMonth: 5,
    maxHostedPerMonth: 0,
    canCreatePaidEvents: false,
  },
  marketplaceAccess: {
    canBuy: false,
    canSell: false,
    maxTransactionAmount: 0,
    maxListings: 0,
    maxMonthlyTransactions: 0,
  },
  travelAccess: {
    canJoin: false,
    canHost: false,
    maxMonthlyBookings: 0,
    canHostHomestay: false,
    canBeHomestayGuest: false,
  },
  serviceAccess: {
    canUseAsClient: false,
    canOfferServices: false,
    maxActiveServices: 0,
  },
  mentorshipAccess: {
    canSeek: true,
    canMentor: false,
    maxMentees: 0,
    maxMentors: 1,
  },
  communityAccess: {
    canCreate: false,
    canJoin: true,
    canModerate: false,
    canAdmin: false,
    maxCommunities: 3,
  },
  fundraisingAccess: false,
  platformAmbassador: false,
  revenueSharing: false,
  customEventPages: false,
};

/**
 * Access requirements for a feature
 */
export interface AccessRequirements {
  subscriptionTier?: SubscriptionTier;  // null = any tier
  minTrustLevel?: TrustLevel;           // null = no trust required
  minTrustScore?: number;               // Specific % required
}

/**
 * Feature access check result
 */
export interface FeatureAccess {
  allowed: boolean;
  reason?: string;
  blockedBy?: 'subscription' | 'trust' | 'both';
  upgradeOptions?: UpgradeOptions;
}

/**
 * Upgrade options when access is denied
 */
export interface UpgradeOptions {
  subscriptionNeeded?: {
    currentTier: SubscriptionTier;
    requiredTier: SubscriptionTier;
    upgradeCost: number;
    currency: string;
  };
  trustNeeded?: {
    currentLevel: TrustLevel;
    currentScore: number;
    requiredLevel: TrustLevel;
    requiredScore: number;
    estimatedDays?: number;
    suggestedActions: string[];
  };
}

/**
 * User subscription info
 */
export interface UserSubscriptionInfo {
  id: string;
  userId: string;
  tier: SubscriptionTier;
  tierName: string;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAt?: Date;
  trialEnd?: Date;
  features: TierFeatures;
}

/**
 * User trust info
 */
export interface UserTrustInfo {
  userId: string;
  trustScore: number;
  trustLevel: TrustLevel;
  vouchCount: number;
  momentCount: number;
  eventCount: number;
}

/**
 * Complete user access summary
 */
export interface UserAccessSummary {
  subscription: UserSubscriptionInfo;
  trust: UserTrustInfo;
  accessibleFeatures: FeatureCode[];
  lockedFeatures: {
    feature: FeatureCode;
    reason: string;
    upgradeOptions: UpgradeOptions;
  }[];
}

/**
 * Subscription tier details (full)
 */
export interface SubscriptionTierDetails {
  id: string;
  tierCode: SubscriptionTier;
  tierName: string;
  description: string;
  price: number;
  currency: string;
  billingCycle: BillingCycle;
  features: TierFeatures;
  displayOrder: number;
  isActive: boolean;
  isPublic: boolean;
  trialDays: number;
}

/**
 * Feature usage tracking
 */
export interface FeatureUsage {
  featureCode: FeatureCode;
  usedThisMonth: number;
  limitPerMonth: number;
  canUse: boolean;
  remainingUses?: number;
}

/**
 * Subscription payment/invoice info
 */
export interface SubscriptionPaymentInfo {
  id: string;
  subscriptionId: string;
  amount: number;
  currency: string;
  status: string; // PaymentStatus from Prisma
  billingPeriodStart: Date;
  billingPeriodEnd: Date;
  dueDate: Date;
  paidAt?: Date;
  failedAt?: Date;
  failureReason?: string;
  paymentTransactionId?: string;
  gatewayInvoiceId?: string;
  createdAt: Date;
}

/**
 * User subscription with payment details
 */
export interface UserSubscriptionWithPayments extends UserSubscriptionInfo {
  nextBillingDate?: Date;
  nextBillingAmount?: number;
  canRetryPayment?: boolean;
  lastPayment?: SubscriptionPaymentInfo;
  upcomingPayment?: SubscriptionPaymentInfo & { gatewayInvoiceUrl?: string };
  failedPayment?: SubscriptionPaymentInfo;
}

/**
 * Subscription payment summary
 */
export interface SubscriptionPaymentSummary {
  totalPayments: number;
  totalAmount: number;
  successfulPayments: number;
  failedPayments: number;
  pendingPayments: number;
  lastPaymentDate?: Date;
  nextPaymentDate?: Date;
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Check if trust score qualifies for trust level
 */
export function getTrustLevelFromScore(score: number): TrustLevel {
  if (score >= 61) return TrustLevel.LEADER;
  if (score >= 31) return TrustLevel.TRUSTED;
  return TrustLevel.STARTER;
}

/**
 * Get trust level minimum score
 */
export function getTrustLevelMinScore(level: TrustLevel): number {
  switch (level) {
    case TrustLevel.LEADER: return 61;
    case TrustLevel.TRUSTED: return 31;
    case TrustLevel.STARTER: return 0;
  }
}

/**
 * Get trust level maximum score
 */
export function getTrustLevelMaxScore(level: TrustLevel): number {
  switch (level) {
    case TrustLevel.LEADER: return 100;
    case TrustLevel.TRUSTED: return 60;
    case TrustLevel.STARTER: return 30;
  }
}

/**
 * Check if trust level meets requirement
 */
export function trustLevelMeetsRequirement(
  current: TrustLevel,
  required: TrustLevel
): boolean {
  const levels = [TrustLevel.STARTER, TrustLevel.TRUSTED, TrustLevel.LEADER];
  const currentIndex = levels.indexOf(current);
  const requiredIndex = levels.indexOf(required);
  return currentIndex >= requiredIndex;
}

/**
 * Check if subscription tier meets requirement
 */
export function subscriptionTierMeetsRequirement(
  current: SubscriptionTier,
  required: SubscriptionTier
): boolean {
  const tiers = [SubscriptionTier.FREE, SubscriptionTier.BASIC];
  const currentIndex = tiers.indexOf(current);
  const requiredIndex = tiers.indexOf(required);
  return currentIndex >= requiredIndex;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Feature requirement mappings
 */
export const FEATURE_REQUIREMENTS: Record<FeatureCode, AccessRequirements> = {
  // Events
  [FeatureCode.VIEW_EVENTS]: {},
  [FeatureCode.JOIN_EVENTS]: { minTrustLevel: TrustLevel.STARTER },
  [FeatureCode.CREATE_EVENTS]: { subscriptionTier: SubscriptionTier.BASIC, minTrustLevel: TrustLevel.TRUSTED },
  [FeatureCode.HOST_EVENTS]: { subscriptionTier: SubscriptionTier.BASIC, minTrustLevel: TrustLevel.TRUSTED },
  [FeatureCode.CREATE_PAID_EVENTS]: { subscriptionTier: SubscriptionTier.BASIC, minTrustLevel: TrustLevel.LEADER },

  // Marketplace
  [FeatureCode.VIEW_MARKETPLACE]: {},
  [FeatureCode.BUY_MARKETPLACE]: { subscriptionTier: SubscriptionTier.BASIC, minTrustLevel: TrustLevel.TRUSTED },
  [FeatureCode.SELL_MARKETPLACE]: { subscriptionTier: SubscriptionTier.BASIC, minTrustLevel: TrustLevel.TRUSTED },

  // Travel
  [FeatureCode.JOIN_TRAVEL]: { subscriptionTier: SubscriptionTier.BASIC, minTrustLevel: TrustLevel.TRUSTED },
  [FeatureCode.HOST_TRAVEL]: { subscriptionTier: SubscriptionTier.BASIC, minTrustLevel: TrustLevel.TRUSTED },

  // HomeSurf (Accommodation Hosting)
  [FeatureCode.HOMESURF_GUEST]: { subscriptionTier: SubscriptionTier.BASIC, minTrustLevel: TrustLevel.TRUSTED },
  [FeatureCode.HOMESURF_HOST]: { subscriptionTier: SubscriptionTier.BASIC, minTrustLevel: TrustLevel.TRUSTED },

  // BerseGuide (Local Tour Guide)
  [FeatureCode.BERSEGUIDE_GUEST]: { subscriptionTier: SubscriptionTier.BASIC, minTrustLevel: TrustLevel.TRUSTED },
  [FeatureCode.BERSEGUIDE_HOST]: { subscriptionTier: SubscriptionTier.BASIC, minTrustLevel: TrustLevel.TRUSTED },

  // Services  
  [FeatureCode.USE_SERVICE_MATCHING_CLIENT]: { subscriptionTier: SubscriptionTier.BASIC, minTrustLevel: TrustLevel.TRUSTED },
  [FeatureCode.OFFER_PROFESSIONAL_SERVICES]: { subscriptionTier: SubscriptionTier.BASIC, minTrustLevel: TrustLevel.LEADER },

  // Mentorship
  [FeatureCode.SEEK_MENTORSHIP]: { subscriptionTier: SubscriptionTier.BASIC, minTrustLevel: TrustLevel.TRUSTED },
  [FeatureCode.PROVIDE_MENTORSHIP]: { subscriptionTier: SubscriptionTier.BASIC, minTrustLevel: TrustLevel.LEADER },

  // Community
  [FeatureCode.JOIN_COMMUNITIES]: { minTrustLevel: TrustLevel.STARTER },
  [FeatureCode.CREATE_COMMUNITIES]: { subscriptionTier: SubscriptionTier.BASIC, minTrustLevel: TrustLevel.TRUSTED },
  [FeatureCode.MODERATE_COMMUNITIES]: { minTrustLevel: TrustLevel.TRUSTED },
  [FeatureCode.ADMIN_COMMUNITIES]: { minTrustLevel: TrustLevel.LEADER },

  // Social
  [FeatureCode.SEND_CONNECTIONS]: { minTrustLevel: TrustLevel.TRUSTED },
  [FeatureCode.SEND_MESSAGES]: { minTrustLevel: TrustLevel.STARTER },
  [FeatureCode.VOUCH_FOR_USERS]: { minTrustLevel: TrustLevel.TRUSTED },

  // Advanced (BASIC tier only)
  [FeatureCode.FUNDRAISING]: { subscriptionTier: SubscriptionTier.BASIC, minTrustLevel: TrustLevel.LEADER },
  [FeatureCode.PLATFORM_AMBASSADOR]: { subscriptionTier: SubscriptionTier.BASIC, minTrustLevel: TrustLevel.LEADER },
  [FeatureCode.REVENUE_SHARING]: { subscriptionTier: SubscriptionTier.BASIC, minTrustLevel: TrustLevel.LEADER },
  [FeatureCode.CUSTOM_BADGES]: { subscriptionTier: SubscriptionTier.BASIC, minTrustLevel: TrustLevel.LEADER },
  [FeatureCode.ANALYTICS]: { subscriptionTier: SubscriptionTier.BASIC, minTrustLevel: TrustLevel.TRUSTED },
  [FeatureCode.PRIORITY_SUPPORT]: { subscriptionTier: SubscriptionTier.BASIC, minTrustLevel: TrustLevel.TRUSTED }
};

/**
 * Tier pricing (in MYR)
 */
export const TIER_PRICING = {
  [SubscriptionTier.FREE]: {
    monthly: 0,
    annual: 0
  },
  [SubscriptionTier.BASIC]: {
    monthly: 30,
    annual: 300  // 17% discount
  }
};

/**
 * Trust level descriptions
 */
export const TRUST_LEVEL_INFO = {
  [TrustLevel.STARTER]: {
    name: 'Starter',
    scoreRange: '0-30 points',
    description: 'New member, building trust',
    emoji: '🌱',
    badge: 'Green leaf'
  },
  [TrustLevel.TRUSTED]: {
    name: 'Trusted',
    scoreRange: '31-60 points',
    description: 'Active member, proven trustworthy',
    emoji: '⭐',
    badge: 'Yellow star'
  },
  [TrustLevel.LEADER]: {
    name: 'Leader',
    scoreRange: '61-100 points',
    description: 'Highly trusted, community pillar',
    emoji: '👑',
    badge: 'Gold crown'
  }
};

/**
 * Features available per subscription tier
 * Organized by tier for easy reference
 */
export const TIER_FEATURES = {
  [SubscriptionTier.FREE]: {
    name: 'Free',
    price: 0,
    features: [
      'VIEW_EVENTS',
      'JOIN_EVENTS',
      'VIEW_MARKETPLACE',
      'JOIN_COMMUNITIES',
      'SEND_MESSAGES',
      'SEND_CONNECTIONS',
      'VOUCH_FOR_USERS',
      'JOIN_TRAVEL',
    ] as FeatureCode[],
    description: 'Basic access to view and participate in events and communities',
  },
  [SubscriptionTier.BASIC]: {
    name: 'Basic',
    price: 30,
    features: [
      // All FREE features plus:
      'CREATE_EVENTS',
      'HOST_EVENTS',
      'BUY_MARKETPLACE',
      'SELL_MARKETPLACE',
      'CREATE_COMMUNITIES',
      'HOST_TRAVEL',
      'HOMESURF_GUEST',
      'HOMESURF_HOST',
      'BERSEGUIDE_GUEST',
      'BERSEGUIDE_HOST',
      'CREATE_PAID_EVENTS',
      'USE_SERVICE_MATCHING_CLIENT',
      'OFFER_PROFESSIONAL_SERVICES',
      'SEEK_MENTORSHIP',
      'PROVIDE_MENTORSHIP',
      'FUNDRAISING',
      'PLATFORM_AMBASSADOR',
      'REVENUE_SHARING',
      'CUSTOM_BADGES',
      'ANALYTICS',
      'PRIORITY_SUPPORT',
    ] as FeatureCode[],
    description: 'Full platform access: host events, sell items, create communities, use HomeSurf/BerseGuide, monetize events, professional services, mentorship, revenue sharing, analytics, and priority support',
  }
};

/**
 * Quick reference: What each tier unlocks
 */
export const TIER_HIGHLIGHTS = {
  [SubscriptionTier.FREE]: [
    'View and join events',
    'Browse marketplace',
    'Join communities',
    'Send messages',
    'Make connections',
  ],
  [SubscriptionTier.BASIC]: [
    'Host events (free & paid)',
    'Buy & sell on marketplace',
    'Create communities',
    'Use HomeSurf (guest & host)',
    'Use BerseGuide (guest & host)',
    'Host travel trips',
    'Offer professional services',
    'Mentorship programs',
    'Revenue sharing',
    'Platform analytics',
    'Priority support',
  ]
};
