import { 
  TrustFormulaConfig, 
  TrustLevelsConfig, 
  FeatureGatingConfig, 
  BadgeConfig,
  TrustDecayConfig,
  VouchEligibilityConfig,
  ActivityWeightsConfig,
  AccountabilityConfig
} from './config.types';

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Configuration Validation Utilities
 * 
 * Validates platform configuration before updates to ensure:
 * - Data integrity
 * - Business rule compliance
 * - System stability
 */
export class ConfigValidator {
  /**
   * Validate Trust Formula configuration
   * 
   * Rules:
   * - All weights must sum to 1.0 (100%)
   * - Each weight must be between 0-1
   * - Vouch breakdown weights must sum to vouchWeight
   */
  static validateTrustFormula(config: TrustFormulaConfig): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate main weights sum to 1.0 (100%)
    const totalWeight = config.vouchWeight + config.activityWeight + config.trustMomentWeight;
    if (Math.abs(totalWeight - 1.0) > 0.0001) {
      errors.push(
        `Trust formula weights must sum to 100%. Current: ${(totalWeight * 100).toFixed(2)}% ` +
        `(vouch: ${(config.vouchWeight * 100).toFixed(0)}%, activity: ${(config.activityWeight * 100).toFixed(0)}%, trustMoments: ${(config.trustMomentWeight * 100).toFixed(0)}%)`
      );
    }

    // Validate individual weight ranges
    const weights = [
      { name: 'vouchWeight', value: config.vouchWeight },
      { name: 'activityWeight', value: config.activityWeight },
      { name: 'trustMomentWeight', value: config.trustMomentWeight },
    ];

    for (const weight of weights) {
      if (weight.value < 0 || weight.value > 1) {
        errors.push(`${weight.name} must be between 0-100%. Current: ${(weight.value * 100).toFixed(0)}%`);
      }
    }

    // Validate vouch breakdown weights sum to vouchWeight
    const vouchBreakdownTotal = 
      config.vouchBreakdown.primaryWeight + 
      config.vouchBreakdown.secondaryWeight + 
      config.vouchBreakdown.communityWeight;

    if (Math.abs(vouchBreakdownTotal - config.vouchWeight) > 0.0001) {
      errors.push(
        `Vouch breakdown weights must sum to vouchWeight (${(config.vouchWeight * 100).toFixed(0)}%). Current: ${(vouchBreakdownTotal * 100).toFixed(2)}% ` +
        `(primary: ${(config.vouchBreakdown.primaryWeight * 100).toFixed(0)}%, secondary: ${(config.vouchBreakdown.secondaryWeight * 100).toFixed(0)}%, community: ${(config.vouchBreakdown.communityWeight * 100).toFixed(0)}%)`
      );
    }

    // Validate individual vouch breakdown weight ranges
    const vouchWeights = [
      { name: 'primaryWeight', value: config.vouchBreakdown.primaryWeight },
      { name: 'secondaryWeight', value: config.vouchBreakdown.secondaryWeight },
      { name: 'communityWeight', value: config.vouchBreakdown.communityWeight },
    ];

    for (const weight of vouchWeights) {
      if (weight.value < 0 || weight.value > 1) {
        errors.push(`${weight.name} must be between 0-100%. Current: ${(weight.value * 100).toFixed(0)}%`);
      }
    }

    // Warnings for extreme values
    if (config.vouchWeight < 0.20) {
      warnings.push(`Vouch weight is quite low (${(config.vouchWeight * 100).toFixed(0)}%). Consider if vouches should have more impact.`);
    }
    if (config.activityWeight > 0.50) {
      warnings.push(`Activity weight is quite high (${(config.activityWeight * 100).toFixed(0)}%). This might overvalue activity compared to vouches.`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate Trust Levels configuration
   * 
   * Rules:
   * - Levels must cover 0-100% range without gaps
   * - No overlapping ranges
   * - Levels must be in ascending order
   * - Each level must have required fields
   */
  static validateTrustLevels(config: TrustLevelsConfig): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Sort levels by minScore to check for gaps/overlaps
    const sortedLevels = [...config.levels].sort((a, b) => a.minScore - b.minScore);

    // Validate first level starts at 0
    if (sortedLevels[0].minScore !== 0) {
      errors.push(`First trust level must start at 0%. Current: ${sortedLevels[0].minScore}%`);
    }

    // Validate last level ends at or before 100
    const lastLevel = sortedLevels[sortedLevels.length - 1];
    if (lastLevel.maxScore !== 100) {
      errors.push(`Last trust level must end at 100%. Current: ${lastLevel.maxScore}%`);
    }

    // Check for gaps and overlaps
    for (let i = 0; i < sortedLevels.length - 1; i++) {
      const current = sortedLevels[i];
      const next = sortedLevels[i + 1];

      // Validate range
      if (current.minScore >= current.maxScore) {
        errors.push(`Level "${current.name}" has invalid range: ${current.minScore}-${current.maxScore}%`);
      }

      // Check for gaps
      if (current.maxScore + 1 !== next.minScore) {
        errors.push(
          `Gap detected between levels "${current.name}" (${current.maxScore}%) and "${next.name}" (${next.minScore}%)`
        );
      }

      // Check for overlaps
      if (current.maxScore >= next.minScore) {
        errors.push(
          `Overlap detected between levels "${current.name}" (${current.minScore}-${current.maxScore}%) ` +
          `and "${next.name}" (${next.minScore}-${next.maxScore}%)`
        );
      }
    }

    // Validate required fields
    for (const level of config.levels) {
      if (!level.name || level.name.trim() === '') {
        errors.push(`Trust level at ${level.minScore}-${level.maxScore}% is missing a name`);
      }
      if (!level.color || level.color.trim() === '') {
        errors.push(`Trust level "${level.name}" is missing a color`);
      }
      // Note: icon is not in TrustLevel interface, skip validation
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate Feature Gating configuration
   * 
   * Rules:
   * - Required trust scores must be between 0-100
   * - Feature keys must be valid strings
   * - Descriptions should be provided
   */
  static validateFeatureGating(config: FeatureGatingConfig): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Convert features object to array for iteration
    const featureEntries = Object.entries(config.features);

    for (const [featureKey, feature] of featureEntries) {
      // Validate trust score range
      if (feature.requiredScore < 0 || feature.requiredScore > 100) {
        errors.push(
          `Feature "${featureKey}" has invalid trust score requirement: ${feature.requiredScore}%. Must be 0-100%`
        );
      }

      // Validate feature name
      if (!feature.feature || feature.feature.trim() === '') {
        warnings.push(`Feature "${featureKey}" is missing a feature name`);
      }

      // Check for unreasonably high requirements
      if (feature.requiredScore > 90) {
        warnings.push(
          `Feature "${featureKey}" requires ${feature.requiredScore}% trust score. ` +
          `This is very high and might exclude most users.`
        );
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate Badge Definitions configuration
   * 
   * Rules:
   * - Tier thresholds must be in ascending order (bronze < silver < gold < platinum)
   * - Thresholds must be non-negative
   * - Each badge must have required fields
   */
  static validateBadgeDefinitions(config: BadgeConfig): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    for (const badge of config.badges) {
      // Validate required fields
      if (!badge.name || badge.name.trim() === '') {
        errors.push(`Badge type "${badge.type}" is missing a name`);
      }
      if (!badge.description || badge.description.trim() === '') {
        warnings.push(`Badge "${badge.name}" is missing a description`);
      }
      if (!badge.icon || badge.icon.trim() === '') {
        warnings.push(`Badge "${badge.name}" is missing an icon`);
      }

      // Validate tier thresholds are non-negative
      const tiers = [
        { name: 'bronze', value: badge.tiers.bronze },
        { name: 'silver', value: badge.tiers.silver },
        { name: 'gold', value: badge.tiers.gold },
        { name: 'platinum', value: badge.tiers.platinum },
      ];

      for (const tier of tiers) {
        if (tier.value < 0) {
          errors.push(`Badge "${badge.name}" has negative ${tier.name} threshold: ${tier.value}`);
        }
      }

      // Validate ascending order
      if (badge.tiers.bronze > badge.tiers.silver) {
        errors.push(
          `Badge "${badge.name}" has bronze threshold (${badge.tiers.bronze}) higher than silver (${badge.tiers.silver})`
        );
      }
      if (badge.tiers.silver > badge.tiers.gold) {
        errors.push(
          `Badge "${badge.name}" has silver threshold (${badge.tiers.silver}) higher than gold (${badge.tiers.gold})`
        );
      }
      if (badge.tiers.gold > badge.tiers.platinum) {
        errors.push(
          `Badge "${badge.name}" has gold threshold (${badge.tiers.gold}) higher than platinum (${badge.tiers.platinum})`
        );
      }

      // Warning for unreasonable thresholds
      if (badge.tiers.bronze === 0) {
        warnings.push(`Badge "${badge.name}" has bronze tier at 0. Consider if this is too easy to achieve.`);
      }
    }

    // Check for duplicate badge types
    const badgeTypes = config.badges.map(b => b.type);
    const duplicates = badgeTypes.filter((type, index) => badgeTypes.indexOf(type) !== index);
    if (duplicates.length > 0) {
      errors.push(`Duplicate badge types found: ${duplicates.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate Trust Decay Rules configuration
   * 
   * Rules:
   * - Inactivity days must be positive
   * - Decay rates must be between 0-1 (representing 0-100%)
   * - Rules should be in ascending order of severity
   */
  static validateTrustDecayRules(config: TrustDecayConfig): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Sort rules by inactivityDays to check ordering
    const sortedRules = [...config.rules].sort((a, b) => a.inactivityDays - b.inactivityDays);

    for (const rule of config.rules) {
      // Validate inactivity days
      if (rule.inactivityDays <= 0) {
        errors.push(`Decay rule has invalid inactivity period: ${rule.inactivityDays} days`);
      }

      // Validate decay rate (should be between 0-1, e.g., 0.01 = 1%)
      if (rule.decayRatePerWeek < 0 || rule.decayRatePerWeek > 1) {
        errors.push(
          `Decay rule has invalid decay rate: ${rule.decayRatePerWeek}. Must be 0-1 (e.g., 0.01 = 1%)`
        );
      }

      // Validate description
      if (!rule.description || rule.description.trim() === '') {
        warnings.push(`Decay rule for ${rule.inactivityDays} days is missing a description`);
      }
    }

    // Check that longer inactivity has higher decay
    for (let i = 0; i < sortedRules.length - 1; i++) {
      const current = sortedRules[i];
      const next = sortedRules[i + 1];

      if (current.decayRatePerWeek > next.decayRatePerWeek) {
        warnings.push(
          `Decay rule ordering issue: ${current.inactivityDays} days (${current.decayRatePerWeek * 100}% decay) ` +
          `has higher decay than ${next.inactivityDays} days (${next.decayRatePerWeek * 100}% decay). ` +
          `Consider if longer inactivity should have higher decay.`
        );
      }
    }

    // Validate minimumScore
    if (config.minimumScore < 0) {
      errors.push(`minimumScore must be non-negative. Current: ${config.minimumScore}`);
    }

    // Validate warningThreshold
    if (config.warningThreshold < 0) {
      errors.push(`warningThreshold must be non-negative. Current: ${config.warningThreshold}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate Vouch Eligibility Criteria configuration
   * 
   * Rules:
   * - Minimum values must be non-negative
   * - Requirements should be achievable
   */
  static validateVouchEligibilityCriteria(config: VouchEligibilityConfig): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate minEventsAttended
    if (config.minEventsAttended < 0) {
      errors.push(`minEventsAttended must be non-negative. Current: ${config.minEventsAttended}`);
    }
    if (config.minEventsAttended > 50) {
      warnings.push(
        `minEventsAttended is quite high (${config.minEventsAttended}). This might make eligibility very difficult to achieve.`
      );
    }

    // Validate minMembershipDays
    if (config.minMembershipDays < 0) {
      errors.push(`minMembershipDays must be non-negative. Current: ${config.minMembershipDays}`);
    }
    if (config.minMembershipDays > 365) {
      warnings.push(
        `minMembershipDays is quite high (${config.minMembershipDays} days / ${Math.round(config.minMembershipDays / 30)} months). ` +
        `This might make eligibility very difficult to achieve.`
      );
    }

    // Validate maxNegativeFeedback
    if (config.maxNegativeFeedback < 0) {
      errors.push(`maxNegativeFeedback must be non-negative. Current: ${config.maxNegativeFeedback}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate Activity Weights configuration
   * 
   * Rules:
   * - All weights must be non-negative
   * - Weights should be reasonable (0-100 range)
   */
  static validateActivityWeights(config: ActivityWeightsConfig): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const activities = [
      { name: 'eventAttended', value: config.eventAttended },
      { name: 'communityJoined', value: config.communityJoined },
      { name: 'serviceCreated', value: config.serviceCreated },
      { name: 'eventHosted', value: config.eventHosted },
      { name: 'communityModerated', value: config.communityModerated },
      { name: 'marketplaceSale', value: config.marketplaceSale },
      { name: 'connectionMade', value: config.connectionMade },
      { name: 'vouchGiven', value: config.vouchGiven },
      { name: 'maxActivityScore', value: config.maxActivityScore },
    ];

    for (const activity of activities) {
      // Validate non-negative
      if (activity.value < 0) {
        errors.push(`${activity.name} weight must be non-negative. Current: ${activity.value}`);
      }

      // Warning for extreme values
      if (activity.value > 100) {
        warnings.push(
          `${activity.name} weight is quite high (${activity.value}). Consider if this provides too much impact.`
        );
      }

      if (activity.value === 0 && activity.name !== 'maxActivityScore') {
        warnings.push(
          `${activity.name} weight is 0. This activity will have no impact on trust score calculations.`
        );
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate Accountability Rules configuration
   * 
   * Rules:
   * - Distribution percentages must be between 0-1 (0-100%)
   */
  static validateAccountabilityRules(config: AccountabilityConfig): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate penalty distribution
    if (config.penaltyDistribution < 0 || config.penaltyDistribution > 1) {
      errors.push(
        `penaltyDistribution must be between 0-1 (0-100%). Current: ${config.penaltyDistribution}`
      );
    }

    // Validate reward distribution
    if (config.rewardDistribution < 0 || config.rewardDistribution > 1) {
      errors.push(
        `rewardDistribution must be between 0-1 (0-100%). Current: ${config.rewardDistribution}`
      );
    }

    // Warning if voucher gets very little accountability
    if (config.penaltyDistribution < 0.25) {
      warnings.push(
        `Voucher penalty share is quite low (${config.penaltyDistribution * 100}%). ` +
        `This might not incentivize vouchers to choose vouchees carefully.`
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate any configuration by category
   */
  static validate(category: string, config: any): ValidationResult {
    switch (category) {
      case 'TRUST_FORMULA':
        return this.validateTrustFormula(config as TrustFormulaConfig);
      case 'TRUST_LEVELS':
        return this.validateTrustLevels(config as TrustLevelsConfig);
      case 'FEATURE_GATING':
        return this.validateFeatureGating(config as FeatureGatingConfig);
      case 'BADGE_DEFINITIONS':
        return this.validateBadgeDefinitions(config as BadgeConfig);
      case 'TRUST_DECAY':
        return this.validateTrustDecayRules(config as TrustDecayConfig);
      case 'VOUCH_ELIGIBILITY':
        return this.validateVouchEligibilityCriteria(config as VouchEligibilityConfig);
      case 'ACTIVITY_WEIGHTS':
        return this.validateActivityWeights(config as ActivityWeightsConfig);
      case 'ACCOUNTABILITY_RULES':
        return this.validateAccountabilityRules(config as AccountabilityConfig);
      default:
        return {
          isValid: false,
          errors: [`Unknown configuration category: ${category}`],
          warnings: [],
        };
    }
  }
}
