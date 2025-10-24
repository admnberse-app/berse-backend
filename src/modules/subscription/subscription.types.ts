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
  BASIC = 'BASIC',
  PREMIUM = 'PREMIUM'
}

/**
 * Trust level tiers
 */
export enum TrustLevel {
  STARTER = 'starter',      // 0-30%
  TRUSTED = 'trusted',      // 31-60%
  LEADER = 'leader'         // 61-100%
}

/**
 * Resource types for feature access control
 */
export enum Resource {
  EVENTS = 'events',
  MARKETPLACE = 'marketplace',
  COMMUNITIES = 'communities',
  HOMESURF = 'homesurf',
  BERSEGUIDE = 'berseguide',
  SERVICES = 'services',
  MENTORSHIP = 'mentorship',
  MESSAGES = 'messages',
  CONNECTIONS = 'connections',
  VOUCHES = 'vouches',
  REWARDS = 'rewards',
}

/**
 * Action types for feature access control
 */
export enum Action {
  VIEW = 'view',        // Browse/Read
  JOIN = 'join',        // Participate/Book/Buy (consumer role)
  CREATE = 'create',    // Create new & become provider (provider role)
  MODERATE = 'moderate',// Moderate others' content (communities)
  ADMIN = 'admin',      // Full admin control (communities)
  EARN = 'earn',        // Earn points (rewards only)
  REDEEM = 'redeem',    // Redeem rewards (rewards only)
}

/**
 * Feature codes using resource:action pattern
 * Examples: 'events:view', 'marketplace:create', 'communities:join'
 */
export type FeatureCode =
  // Events
  | 'events:view'
  | 'events:join'       // Attend/RSVP to event
  | 'events:create'     // Create & host event
  
  // Marketplace
  | 'marketplace:view'
  | 'marketplace:join'  // Buy/purchase items
  | 'marketplace:create' // List items for sale
  
  // Communities
  | 'communities:view'
  | 'communities:join'  // Join as member
  | 'communities:create' // Create new community
  | 'communities:moderate' // Moderate others' content
  | 'communities:admin'    // Full admin access
  
  // HomeSurf (homestay hosting)
  | 'homesurf:view'     // Browse homestay listings
  | 'homesurf:join'     // Book/stay as guest
  | 'homesurf:create'   // Offer your home as host
  
  // BerseGuide (local tour guides)
  | 'berseguide:view'   // Browse guide listings
  | 'berseguide:join'   // Book a guide as traveler
  | 'berseguide:create' // Offer guide services
  
  // Services (professional services)
  | 'services:view'
  | 'services:join'     // Hire services
  | 'services:create'   // Offer services
  
  // Mentorship
  | 'mentorship:view'
  | 'mentorship:join'   // Seek mentor
  | 'mentorship:create' // Offer mentorship
  
  // Social
  | 'messages:create'
  | 'connections:create'
  | 'vouches:create'
  
  // Rewards
  | 'rewards:earn'      // Earn points (FREE + BASIC)
  | 'rewards:redeem';   // Redeem rewards (BASIC only)

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
  tierCode: string;
  status: SubscriptionStatus;
  billingCycle?: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  canceledAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
  tier: {
    tierCode: string;
    name: string;
    price: number;
    currency: string;
    billingCycle: string;
  };
  
  // Legacy fields for backward compatibility (deprecated)
  tierName?: string;
  cancelAt?: Date;
  trialEnd?: Date;
  features?: any;
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
 * Feature requirement mappings using resource:action pattern
 * Defines subscription tier and trust level requirements for each feature
 */
export const FEATURE_REQUIREMENTS: Record<FeatureCode, AccessRequirements> = {
  // Events - FREE can view/join, BASIC can create/host
  'events:view': {},
  'events:join': { minTrustLevel: TrustLevel.STARTER },
  'events:create': { subscriptionTier: SubscriptionTier.BASIC, minTrustLevel: TrustLevel.TRUSTED },

  // Marketplace - FREE can view/buy, BASIC can sell
  'marketplace:view': {},
  'marketplace:join': { minTrustLevel: TrustLevel.TRUSTED },
  'marketplace:create': { subscriptionTier: SubscriptionTier.BASIC, minTrustLevel: TrustLevel.LEADER },

  // Communities - FREE can join (max 2), BASIC unlimited + can create
  'communities:view': {},
  'communities:join': { minTrustLevel: TrustLevel.STARTER },
  'communities:create': { subscriptionTier: SubscriptionTier.BASIC, minTrustLevel: TrustLevel.TRUSTED },
  'communities:moderate': { minTrustLevel: TrustLevel.TRUSTED },
  'communities:admin': { minTrustLevel: TrustLevel.LEADER },

  // HomeSurf - FREE can book stays, BASIC can host
  'homesurf:view': {},
  'homesurf:join': { minTrustLevel: TrustLevel.TRUSTED },
  'homesurf:create': { subscriptionTier: SubscriptionTier.BASIC, minTrustLevel: TrustLevel.LEADER },

  // BerseGuide - FREE can book guides, BASIC can offer tours
  'berseguide:view': {},
  'berseguide:join': { minTrustLevel: TrustLevel.TRUSTED },
  'berseguide:create': { subscriptionTier: SubscriptionTier.BASIC, minTrustLevel: TrustLevel.LEADER },

  // Services - FREE can hire, BASIC can offer
  'services:view': {},
  'services:join': { minTrustLevel: TrustLevel.TRUSTED },
  'services:create': { subscriptionTier: SubscriptionTier.BASIC, minTrustLevel: TrustLevel.LEADER },

  // Mentorship - FREE can seek, BASIC can provide
  'mentorship:view': {},
  'mentorship:join': { minTrustLevel: TrustLevel.TRUSTED },
  'mentorship:create': { subscriptionTier: SubscriptionTier.BASIC, minTrustLevel: TrustLevel.LEADER },

  // Social - Messages, connections, vouches
  'connections:create': { minTrustLevel: TrustLevel.TRUSTED },
  'messages:create': { minTrustLevel: TrustLevel.STARTER },
  'vouches:create': { minTrustLevel: TrustLevel.TRUSTED },

  // Rewards - FREE can earn, BASIC can redeem
  'rewards:earn': {},
  'rewards:redeem': { subscriptionTier: SubscriptionTier.BASIC },
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
    monthly: 29.99,
    annual: 299.99  // 16.67% discount (10 months price)
  }
};

/**
 * Trust level descriptions
 */
export const TRUST_LEVEL_INFO = {
  [TrustLevel.STARTER]: {
    name: 'Starter',
    scoreRange: '0-30%',
    description: 'New member building trust',
    emoji: '🌱'
  },
  [TrustLevel.TRUSTED]: {
    name: 'Trusted',
    scoreRange: '31-60%',
    description: 'Verified and active community member',
    emoji: '✅'
  },
  [TrustLevel.LEADER]: {
    name: 'Leader',
    scoreRange: '61-100%',
    description: 'Trusted leader and contributor',
    emoji: '⭐'
  }
};
