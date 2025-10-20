/**
 * Subscription Utilities
 * Helper functions for subscription and trust management
 */

import {
  SubscriptionTier,
  TrustLevel,
  FeatureCode,
  getTrustLevelFromScore,
  getTrustLevelMinScore,
  getTrustLevelMaxScore,
  TIER_PRICING,
  TRUST_LEVEL_INFO,
  FEATURE_REQUIREMENTS,
} from '../types/subscription.types';

/**
 * Format currency amount
 */
export function formatCurrency(amount: number, currency: string = 'MYR'): string {
  return `${currency} ${amount.toFixed(2)}`;
}

/**
 * Get tier display name with emoji
 */
export function getTierDisplayName(tier: SubscriptionTier): string {
  const emojis = {
    [SubscriptionTier.FREE]: '🆓',
    [SubscriptionTier.BASIC]: '⭐',
    [SubscriptionTier.PREMIUM]: '👑',
  };

  return `${emojis[tier]} ${tier}`;
}

/**
 * Get trust level display name with emoji
 */
export function getTrustLevelDisplayName(level: TrustLevel): string {
  const info = TRUST_LEVEL_INFO[level];
  return `${info.emoji} ${info.name}`;
}

/**
 * Calculate trust score progress within current level
 */
export function getTrustLevelProgress(score: number): {
  level: TrustLevel;
  progress: number;
  nextLevel?: TrustLevel;
  pointsToNext?: number;
} {
  const level = getTrustLevelFromScore(score);
  const min = getTrustLevelMinScore(level);
  const max = getTrustLevelMaxScore(level);

  const progress = ((score - min) / (max - min)) * 100;

  // Get next level
  const levels = [TrustLevel.STARTER, TrustLevel.TRUSTED, TrustLevel.SCOUT, TrustLevel.LEADER];
  const currentIndex = levels.indexOf(level);
  const nextLevel = currentIndex < levels.length - 1 ? levels[currentIndex + 1] : undefined;
  const pointsToNext = nextLevel ? getTrustLevelMinScore(nextLevel) - score : undefined;

  return {
    level,
    progress: Math.round(progress),
    nextLevel,
    pointsToNext,
  };
}

/**
 * Get feature requirement description
 */
export function getFeatureRequirementDescription(featureCode: FeatureCode): string {
  const req = FEATURE_REQUIREMENTS[featureCode];

  const parts: string[] = [];

  if (req.subscriptionTier) {
    parts.push(`${req.subscriptionTier} subscription`);
  }

  if (req.minTrustLevel) {
    const info = TRUST_LEVEL_INFO[req.minTrustLevel];
    parts.push(`${info.name} trust level (${info.scoreRange})`);
  }

  if (req.minTrustScore) {
    parts.push(`${req.minTrustScore}% trust score`);
  }

  return parts.length > 0 ? parts.join(' + ') : 'No requirements';
}

/**
 * Get all features accessible at a tier + trust level combination
 */
export function getAccessibleFeatures(
  tier: SubscriptionTier,
  trustLevel: TrustLevel
): FeatureCode[] {
  const accessible: FeatureCode[] = [];

  for (const [featureKey, requirements] of Object.entries(FEATURE_REQUIREMENTS)) {
    const feature = featureKey as FeatureCode;

    // Check subscription requirement
    const subReq = requirements.subscriptionTier;
    const subOk = !subReq || tierMeetsRequirement(tier, subReq);

    // Check trust requirement
    const trustReq = requirements.minTrustLevel;
    const trustOk = !trustReq || trustLevelMeetsRequirement(trustLevel, trustReq);

    if (subOk && trustOk) {
      accessible.push(feature);
    }
  }

  return accessible;
}

/**
 * Get tier comparison
 */
export function compareTiers(tier1: SubscriptionTier, tier2: SubscriptionTier): {
  cheaper: SubscriptionTier;
  expensive: SubscriptionTier;
  priceDiff: number;
  percentDiff: number;
} {
  const price1 = TIER_PRICING[tier1].monthly;
  const price2 = TIER_PRICING[tier2].monthly;

  const cheaper = price1 < price2 ? tier1 : tier2;
  const expensive = price1 > price2 ? tier1 : tier2;
  const priceDiff = Math.abs(price1 - price2);
  const percentDiff = ((priceDiff / Math.min(price1, price2)) * 100) || 0;

  return {
    cheaper,
    expensive,
    priceDiff,
    percentDiff: Math.round(percentDiff),
  };
}

/**
 * Get suggested tier based on user needs
 */
export function suggestTier(
  desiredFeatures: FeatureCode[],
  currentTrustLevel: TrustLevel
): {
  recommendedTier: SubscriptionTier;
  reason: string;
  unlockableFeatures: FeatureCode[];
  blockedByTrust: FeatureCode[];
} {
  // Count features per tier
  const tierCounts = {
    [SubscriptionTier.FREE]: 0,
    [SubscriptionTier.BASIC]: 0,
    [SubscriptionTier.PREMIUM]: 0,
  };

  const blockedByTrust: FeatureCode[] = [];

  for (const feature of desiredFeatures) {
    const req = FEATURE_REQUIREMENTS[feature];

    // Check if blocked by trust
    if (req.minTrustLevel && !trustLevelMeetsRequirement(currentTrustLevel, req.minTrustLevel)) {
      blockedByTrust.push(feature);
      continue;
    }

    // Count for each tier
    if (!req.subscriptionTier || req.subscriptionTier === SubscriptionTier.FREE) {
      tierCounts[SubscriptionTier.FREE]++;
    }
    if (!req.subscriptionTier || tierMeetsRequirement(SubscriptionTier.BASIC, req.subscriptionTier)) {
      tierCounts[SubscriptionTier.BASIC]++;
    }
    if (!req.subscriptionTier || tierMeetsRequirement(SubscriptionTier.PREMIUM, req.subscriptionTier)) {
      tierCounts[SubscriptionTier.PREMIUM]++;
    }
  }

  // Determine recommended tier
  let recommendedTier: SubscriptionTier;
  let reason: string;

  if (tierCounts[SubscriptionTier.FREE] === desiredFeatures.length) {
    recommendedTier = SubscriptionTier.FREE;
    reason = 'All desired features available on Free tier';
  } else if (tierCounts[SubscriptionTier.BASIC] === desiredFeatures.length) {
    recommendedTier = SubscriptionTier.BASIC;
    reason = 'Basic tier unlocks all desired features';
  } else {
    recommendedTier = SubscriptionTier.PREMIUM;
    reason = 'Premium tier required for advanced features';
  }

  const unlockableFeatures = getAccessibleFeatures(recommendedTier, currentTrustLevel);

  return {
    recommendedTier,
    reason,
    unlockableFeatures,
    blockedByTrust,
  };
}

/**
 * Calculate days until subscription period ends
 */
export function getDaysUntilPeriodEnd(periodEnd: Date): number {
  const now = new Date();
  const diff = periodEnd.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * Check if subscription is in trial
 */
export function isInTrial(trialEnd?: Date): boolean {
  if (!trialEnd) return false;
  return new Date() < trialEnd;
}

/**
 * Format subscription status for display
 */
export function formatSubscriptionStatus(status: string, cancelAt?: Date, trialEnd?: Date): string {
  if (isInTrial(trialEnd)) {
    const days = getDaysUntilPeriodEnd(trialEnd!);
    return `Trial (${days} days left)`;
  }

  if (cancelAt) {
    const days = getDaysUntilPeriodEnd(cancelAt);
    return `Canceling (${days} days left)`;
  }

  return status;
}

// ============================================================================
// PRIVATE HELPERS
// ============================================================================

function tierMeetsRequirement(current: SubscriptionTier, required: SubscriptionTier): boolean {
  const tiers = [SubscriptionTier.FREE, SubscriptionTier.BASIC, SubscriptionTier.PREMIUM];
  return tiers.indexOf(current) >= tiers.indexOf(required);
}

function trustLevelMeetsRequirement(current: TrustLevel, required: TrustLevel): boolean {
  const levels = [TrustLevel.STARTER, TrustLevel.TRUSTED, TrustLevel.SCOUT, TrustLevel.LEADER];
  return levels.indexOf(current) >= levels.indexOf(required);
}
