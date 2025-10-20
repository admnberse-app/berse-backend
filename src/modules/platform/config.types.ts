/**
 * TypeScript type definitions for platform configuration
 * These types ensure type safety when working with dynamic configs
 */

// ============================================================================
// Config Categories
// ============================================================================

export enum ConfigCategory {
  TRUST_FORMULA = 'TRUST_FORMULA',
  TRUST_LEVELS = 'TRUST_LEVELS',
  FEATURE_GATING = 'FEATURE_GATING',
  ACCOUNTABILITY_RULES = 'ACCOUNTABILITY_RULES',
  BADGE_DEFINITIONS = 'BADGE_DEFINITIONS',
  TRUST_DECAY = 'TRUST_DECAY',
  VOUCH_ELIGIBILITY = 'VOUCH_ELIGIBILITY',
  ACTIVITY_WEIGHTS = 'ACTIVITY_WEIGHTS',
}

export enum ConfigKey {
  // Trust Formula
  WEIGHTS = 'weights',
  
  // Trust Levels
  LEVELS = 'levels',
  
  // Feature Gating
  FEATURES = 'features',
  
  // Accountability
  RULES = 'rules',
  
  // Badges
  BADGES = 'badges',
  
  // Decay
  DECAY_RULES = 'decay_rules',
  
  // Vouch Eligibility
  ELIGIBILITY_CRITERIA = 'eligibility_criteria',
  
  // Activity Weights
  ACTIVITY_POINTS = 'activity_points',
}

// ============================================================================
// Trust Formula Configuration
// ============================================================================

export interface VouchBreakdown {
  primaryWeight: number;      // Primary vouches weight (default: 0.12)
  secondaryWeight: number;    // Secondary vouches weight (default: 0.12)
  communityWeight: number;    // Community vouches weight (default: 0.16)
}

export interface TrustFormulaConfig {
  vouchWeight: number;         // Overall vouch score weight (default: 0.40)
  activityWeight: number;      // Activity score weight (default: 0.30)
  trustMomentWeight: number;   // Trust moments weight (default: 0.30)
  vouchBreakdown: VouchBreakdown;
}

// ============================================================================
// Trust Levels Configuration
// ============================================================================

export interface TrustLevel {
  level: number;              // Level number (0-5)
  name: string;               // Display name (e.g., "Starter", "Leader")
  minScore: number;           // Minimum trust score percentage
  maxScore: number;           // Maximum trust score percentage
  description: string;        // User-facing description
  color: string;              // UI color code
}

export interface TrustLevelsConfig {
  levels: TrustLevel[];
}

// ============================================================================
// Feature Gating Configuration
// ============================================================================

export interface FeatureRequirement {
  requiredScore: number;      // Minimum trust score percentage required
  feature: string;            // Feature name for error messages
}

export interface FeatureGatingConfig {
  features: {
    // Events
    createEvent: FeatureRequirement;
    publishEvent: FeatureRequirement;
    hostPaidEvent: FeatureRequirement;
    createRecurringEvent: FeatureRequirement;
    
    // Communities
    createCommunity: FeatureRequirement;
    moderateCommunity: FeatureRequirement;
    createCommunityEvent: FeatureRequirement;
    
    // Marketplace
    createListing: FeatureRequirement;
    createPremiumListing: FeatureRequirement;
    acceptPayments: FeatureRequirement;
    
    // Services
    createService: FeatureRequirement;
    createPremiumService: FeatureRequirement;
    offerPaidService: FeatureRequirement;
    
    // Vouching
    vouchOthers: FeatureRequirement;
    secondaryVouch: FeatureRequirement;
    communityVouch: FeatureRequirement;
    
    // Advanced Features
    createAnnouncement: FeatureRequirement;
    sendMassMessage: FeatureRequirement;
    accessAnalytics: FeatureRequirement;
    createPoll: FeatureRequirement;
    scheduleContent: FeatureRequirement;
    
    // Platform Features
    requestVerification: FeatureRequirement;
    applyForGuide: FeatureRequirement;
    nominateForAward: FeatureRequirement;
  };
}

// ============================================================================
// Accountability Configuration
// ============================================================================

export interface ImpactMultipliers {
  TRUST_MOMENT_NEGATIVE: number;      // Default: 1.0
  EVENT_NO_SHOW: number;              // Default: 1.5
  DISPUTE_RESOLVED_AGAINST: number;   // Default: 2.0
  TRUST_MOMENT_POSITIVE: number;      // Default: 1.0
  COMMUNITY_CONTRIBUTION: number;     // Default: 1.2
  EVENT_COMPLETION: number;           // Default: 1.0
  SERVICE_COMPLETION: number;         // Default: 1.0
}

export interface AccountabilityConfig {
  penaltyDistribution: number;        // % of penalty distributed to vouchers (default: 0.40)
  rewardDistribution: number;         // % of reward distributed to vouchers (default: 0.20)
  impactMultipliers: ImpactMultipliers;
}

// ============================================================================
// Badge Definitions Configuration
// ============================================================================

export interface BadgeTiers {
  bronze: number;     // Threshold for bronze tier
  silver: number;     // Threshold for silver tier
  gold: number;       // Threshold for gold tier
  platinum: number;   // Threshold for platinum tier
}

export interface BadgeDefinition {
  type: string;           // Badge type (e.g., "VOUCHER", "CONNECTOR")
  name: string;           // Display name
  description: string;    // User-facing description
  icon: string;           // Icon identifier
  tiers: BadgeTiers;
}

export interface BadgeConfig {
  badges: BadgeDefinition[];
}

// ============================================================================
// Trust Decay Configuration
// ============================================================================

export interface DecayRule {
  inactivityDays: number;       // Days of inactivity before this rule applies
  decayRatePerWeek: number;     // Percentage decay per week (e.g., 0.01 = 1%)
  description: string;          // Human-readable description
}

export interface TrustDecayConfig {
  rules: DecayRule[];
  minimumScore: number;         // Floor for trust score (default: 0)
  warningThreshold: number;     // Days before decay to send warning (default: 7)
}

// ============================================================================
// Vouch Offer Eligibility Configuration
// ============================================================================

export interface VouchEligibilityConfig {
  minEventsAttended: number;        // Minimum events attended (default: 5)
  minMembershipDays: number;        // Minimum days as community member (default: 90)
  maxNegativeFeedback: number;      // Maximum negative feedback allowed (default: 0)
  offerExpirationDays: number;      // Days until offer expires (default: 30)
  checkFrequency: string;           // How often to check eligibility (default: "daily")
}

// ============================================================================
// Activity Weights Configuration
// ============================================================================

export interface ActivityWeightsConfig {
  eventAttended: number;            // Points for attending event (default: 2)
  communityJoined: number;          // Points for joining community (default: 1)
  serviceCreated: number;           // Points for creating service (default: 3)
  eventHosted: number;              // Points for hosting event (default: 5)
  communityModerated: number;       // Points for moderating community (default: 4)
  marketplaceSale: number;          // Points for marketplace sale (default: 3)
  connectionMade: number;           // Points for new connection (default: 1)
  vouchGiven: number;               // Points for vouching someone (default: 2)
  maxActivityScore: number;         // Maximum activity score (default: 100)
}

// ============================================================================
// Generic Config Types
// ============================================================================

export type ConfigValue = 
  | TrustFormulaConfig
  | TrustLevelsConfig
  | FeatureGatingConfig
  | AccountabilityConfig
  | BadgeConfig
  | TrustDecayConfig
  | VouchEligibilityConfig
  | ActivityWeightsConfig;

export interface ConfigWithMetadata {
  id: string;
  category: ConfigCategory;
  key: ConfigKey | string;
  value: ConfigValue;
  description?: string;
  updatedBy?: string;
  updatedAt: Date;
  version: number;
  createdAt: Date;
}

export interface ConfigHistoryEntry {
  id: string;
  configId: string;
  category: string;
  key: string;
  oldValue: ConfigValue;
  newValue: ConfigValue;
  changedBy: string;
  changedAt: Date;
  reason?: string;
}
