/**
 * Default configuration values for platform configs
 * These serve as fallbacks when database values are not available
 */

import {
  ConfigCategory,
  ConfigKey,
  TrustFormulaConfig,
  TrustLevelsConfig,
  FeatureGatingConfig,
  AccountabilityConfig,
  BadgeConfig,
  TrustDecayConfig,
  VouchEligibilityConfig,
  ActivityWeightsConfig,
} from './config.types';

// ============================================================================
// Default Trust Formula Configuration
// ============================================================================

const DEFAULT_TRUST_FORMULA: TrustFormulaConfig = {
  vouchWeight: 0.40,
  activityWeight: 0.30,
  trustMomentWeight: 0.30,
  vouchBreakdown: {
    primaryWeight: 0.12,
    secondaryWeight: 0.12,
    communityWeight: 0.16,
  },
};

// ============================================================================
// Default Trust Levels Configuration
// ============================================================================

const DEFAULT_TRUST_LEVELS: TrustLevelsConfig = {
  levels: [
    {
      level: 0,
      name: 'Starter',
      minScore: 0,
      maxScore: 30,
      description: 'New to the platform - building trust',
      color: '#9CA3AF', // gray
    },
    {
      level: 1,
      name: 'Trusted',
      minScore: 31,
      maxScore: 60,
      description: 'Trusted member - active contributor',
      color: '#34D399', // green
    },
    {
      level: 2,
      name: 'Leader',
      minScore: 61,
      maxScore: 100,
      description: 'Community leader - platform ambassador',
      color: '#A855F7', // purple
    },
  ],
};

// ============================================================================
// Default Feature Gating Configuration
// ============================================================================

const DEFAULT_FEATURE_GATING: FeatureGatingConfig = {
  features: {
    // Events
    createEvent: { requiredScore: 31, feature: 'create events' },
    publishEvent: { requiredScore: 31, feature: 'publish events' },
    hostPaidEvent: { requiredScore: 31, feature: 'host paid events' },
    createRecurringEvent: { requiredScore: 31, feature: 'create recurring events' },
    
    // Communities
    createCommunity: { requiredScore: 61, feature: 'create communities' },
    moderateCommunity: { requiredScore: 31, feature: 'moderate communities' },
    createCommunityEvent: { requiredScore: 31, feature: 'create community events' },
    
    // Marketplace
    createListing: { requiredScore: 31, feature: 'create marketplace listings' },
    createPremiumListing: { requiredScore: 61, feature: 'create premium listings' },
    acceptPayments: { requiredScore: 31, feature: 'accept payments' },
    
    // Services
    createService: { requiredScore: 31, feature: 'create services' },
    createPremiumService: { requiredScore: 61, feature: 'create premium services' },
    offerPaidService: { requiredScore: 31, feature: 'offer paid services' },
    
    // Vouching
    vouchOthers: { requiredScore: 31, feature: 'vouch for others' },
    secondaryVouch: { requiredScore: 31, feature: 'provide secondary vouches' },
    communityVouch: { requiredScore: 61, feature: 'provide community vouches' },
    
    // Advanced Features
    createAnnouncement: { requiredScore: 61, feature: 'create announcements' },
    sendMassMessage: { requiredScore: 61, feature: 'send mass messages' },
    accessAnalytics: { requiredScore: 31, feature: 'access analytics' },
    createPoll: { requiredScore: 31, feature: 'create polls' },
    scheduleContent: { requiredScore: 31, feature: 'schedule content' },
    
    // Platform Features
    requestVerification: { requiredScore: 31, feature: 'request verification' },
    applyForGuide: { requiredScore: 61, feature: 'apply for guide role' },
    nominateForAward: { requiredScore: 61, feature: 'nominate for awards' },
  },
};

// ============================================================================
// Default Accountability Configuration
// ============================================================================

const DEFAULT_ACCOUNTABILITY: AccountabilityConfig = {
  penaltyDistribution: 0.40, // 40% of penalty to vouchers
  rewardDistribution: 0.20,  // 20% of reward to vouchers
  impactMultipliers: {
    TRUST_MOMENT_NEGATIVE: 1.0,
    EVENT_NO_SHOW: 1.5,
    DISPUTE_RESOLVED_AGAINST: 2.0,
    TRUST_MOMENT_POSITIVE: 1.0,
    COMMUNITY_CONTRIBUTION: 1.2,
    EVENT_COMPLETION: 1.0,
    SERVICE_COMPLETION: 1.0,
  },
};

// ============================================================================
// Default Badge Definitions
// ============================================================================

const DEFAULT_BADGES: BadgeConfig = {
  badges: [
    {
      type: 'VOUCHER',
      name: 'Trusted Voucher',
      description: 'Vouched for others in the community',
      icon: 'shield-check',
      tiers: { bronze: 1, silver: 5, gold: 15, platinum: 50 },
    },
    {
      type: 'CONNECTOR',
      name: 'Super Connector',
      description: 'Built meaningful connections',
      icon: 'users',
      tiers: { bronze: 5, silver: 25, gold: 100, platinum: 500 },
    },
    {
      type: 'COMMUNITY_BUILDER',
      name: 'Community Builder',
      description: 'Active in multiple communities',
      icon: 'building-community',
      tiers: { bronze: 3, silver: 10, gold: 25, platinum: 50 },
    },
    {
      type: 'EVENT_ENTHUSIAST',
      name: 'Event Enthusiast',
      description: 'Attended numerous events',
      icon: 'calendar-star',
      tiers: { bronze: 5, silver: 20, gold: 50, platinum: 150 },
    },
    {
      type: 'TRUST_LEADER',
      name: 'Trust Leader',
      description: 'Maintained high trust score',
      icon: 'trophy',
      tiers: { bronze: 51, silver: 76, gold: 90, platinum: 95 },
    },
    {
      type: 'RELIABLE',
      name: 'Always Reliable',
      description: 'Excellent attendance record',
      icon: 'clock-check',
      tiers: { bronze: 5, silver: 15, gold: 30, platinum: 100 },
    },
    {
      type: 'IMPACT_MAKER',
      name: 'Impact Maker',
      description: 'Created positive accountability impact',
      icon: 'heart-handshake',
      tiers: { bronze: 5, silver: 20, gold: 50, platinum: 150 },
    },
    {
      type: 'LONG_STANDING',
      name: 'Long-Standing Member',
      description: 'Active member for extended period',
      icon: 'hourglass',
      tiers: { bronze: 30, silver: 90, gold: 180, platinum: 365 }, // days
    },
  ],
};

// ============================================================================
// Default Trust Decay Configuration
// ============================================================================

const DEFAULT_TRUST_DECAY: TrustDecayConfig = {
  rules: [
    {
      inactivityDays: 30,
      decayRatePerWeek: 0.01, // -1% per week
      description: 'Light decay after 30 days of inactivity',
    },
    {
      inactivityDays: 90,
      decayRatePerWeek: 0.02, // -2% per week
      description: 'Heavy decay after 90 days of inactivity',
    },
  ],
  minimumScore: 0,
  warningThreshold: 7, // Send warning 7 days before decay
};

// ============================================================================
// Default Vouch Eligibility Configuration
// ============================================================================

const DEFAULT_VOUCH_ELIGIBILITY: VouchEligibilityConfig = {
  minEventsAttended: 5,
  minMembershipDays: 90,
  maxNegativeFeedback: 0,
  offerExpirationDays: 30,
  checkFrequency: 'daily',
};

// ============================================================================
// Default Activity Weights Configuration
// ============================================================================

const DEFAULT_ACTIVITY_WEIGHTS: ActivityWeightsConfig = {
  eventAttended: 2,
  communityJoined: 1,
  serviceCreated: 3,
  eventHosted: 5,
  communityModerated: 4,
  marketplaceSale: 3,
  connectionMade: 1,
  vouchGiven: 2,
  maxActivityScore: 100,
};

// ============================================================================
// Export All Defaults
// ============================================================================

export function getDefaultConfigs(): Record<string, Record<string, any>> {
  return {
    [ConfigCategory.TRUST_FORMULA]: {
      [ConfigKey.WEIGHTS]: DEFAULT_TRUST_FORMULA,
    },
    [ConfigCategory.TRUST_LEVELS]: {
      [ConfigKey.LEVELS]: DEFAULT_TRUST_LEVELS,
    },
    [ConfigCategory.FEATURE_GATING]: {
      [ConfigKey.FEATURES]: DEFAULT_FEATURE_GATING,
    },
    [ConfigCategory.ACCOUNTABILITY_RULES]: {
      [ConfigKey.RULES]: DEFAULT_ACCOUNTABILITY,
    },
    [ConfigCategory.BADGE_DEFINITIONS]: {
      [ConfigKey.BADGES]: DEFAULT_BADGES,
    },
    [ConfigCategory.TRUST_DECAY]: {
      [ConfigKey.DECAY_RULES]: DEFAULT_TRUST_DECAY,
    },
    [ConfigCategory.VOUCH_ELIGIBILITY]: {
      [ConfigKey.ELIGIBILITY_CRITERIA]: DEFAULT_VOUCH_ELIGIBILITY,
    },
    [ConfigCategory.ACTIVITY_WEIGHTS]: {
      [ConfigKey.ACTIVITY_POINTS]: DEFAULT_ACTIVITY_WEIGHTS,
    },
  };
}

// Export individual defaults for direct access
export {
  DEFAULT_TRUST_FORMULA,
  DEFAULT_TRUST_LEVELS,
  DEFAULT_FEATURE_GATING,
  DEFAULT_ACCOUNTABILITY,
  DEFAULT_BADGES,
  DEFAULT_TRUST_DECAY,
  DEFAULT_VOUCH_ELIGIBILITY,
  DEFAULT_ACTIVITY_WEIGHTS,
};
