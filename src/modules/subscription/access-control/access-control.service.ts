/**
 * Access Control Service
 * Handles dual-gating logic: Subscription + Trust Level
 */

import { prisma } from '../../../config/database';
import {
  FeatureCode,
  FeatureAccess,
  UpgradeOptions,
  SubscriptionTier,
  TrustLevel,
  UserAccessSummary,
  UserSubscriptionInfo,
  UserTrustInfo,
  SubscriptionStatus,
  FEATURE_REQUIREMENTS,
  getTrustLevelFromScore,
  subscriptionTierMeetsRequirement,
  trustLevelMeetsRequirement,
  TIER_PRICING,
  getTrustLevelMinScore,
  TRUST_LEVEL_INFO
} from '../subscription.types';

class AccessControlService {
  /**
   * Check if user can access a specific feature
   * Core dual-gating logic: subscription + trust
   */
  async canAccessFeature(
    userId: string,
    featureCode: FeatureCode
  ): Promise<FeatureAccess> {
    try {
      // Get user with subscription and trust data
      const user = await this.getUserWithAccessData(userId);

      if (!user) {
        return {
          allowed: false,
          reason: 'User not found',
        };
      }

      // Get feature requirements
      const requirements = FEATURE_REQUIREMENTS[featureCode];

      if (!requirements) {
        return {
          allowed: false,
          reason: 'Invalid feature code',
        };
      }

      // Check subscription requirement
      const subscriptionCheck = this.checkSubscriptionRequirement(
        user.subscription,
        requirements.subscriptionTier
      );

      // Check trust requirement
      const trustCheck = this.checkTrustRequirement(
        user.trustScore,
        user.trustLevel,
        requirements.minTrustLevel,
        requirements.minTrustScore
      );

      // Both must pass
      const allowed = subscriptionCheck.allowed && trustCheck.allowed;

      // Generate response
      if (allowed) {
        return { allowed: true };
      }

      // Determine what's blocking access
      let blockedBy: 'subscription' | 'trust' | 'both';
      if (!subscriptionCheck.allowed && !trustCheck.allowed) {
        blockedBy = 'both';
      } else if (!subscriptionCheck.allowed) {
        blockedBy = 'subscription';
      } else {
        blockedBy = 'trust';
      }

      return {
        allowed: false,
        reason: this.generateBlockedReason(subscriptionCheck, trustCheck),
        blockedBy,
        upgradeOptions: await this.generateUpgradeOptions(
          user,
          subscriptionCheck,
          trustCheck,
          requirements
        ),
      };
    } catch (error) {
      console.error('Access control error:', error);
      return {
        allowed: false,
        reason: 'Error checking feature access',
      };
    }
  }

  /**
   * Get complete access summary for user
   */
  /**
   * Get feature availability for frontend (optimized, cached)
   * Returns all features organized by category with their states
   */
  async getFeatureAvailability(userId: string): Promise<any> {
    try {
      const user = await this.getUserWithAccessData(userId);

      if (!user) {
        return null;
      }

      const trustScore = user.trustScore;
      const trustLevel = getTrustLevelFromScore(trustScore) as TrustLevel;
      const currentTrustInfo = TRUST_LEVEL_INFO[trustLevel];
      
      // Calculate next trust level progress
      const nextLevel = trustLevel === TrustLevel.STARTER ? TrustLevel.TRUSTED : 
                        trustLevel === TrustLevel.TRUSTED ? TrustLevel.LEADER : null;
      const nextLevelScore = nextLevel ? getTrustLevelMinScore(nextLevel) : 100;
      const percentToNext = nextLevel ? Math.round(((trustScore - getTrustLevelMinScore(trustLevel)) / 
                           (nextLevelScore - getTrustLevelMinScore(trustLevel))) * 100) : 100;

      const result = {
        user: {
          id: user.id,
          subscription: {
            tier: user.subscription.tier,
            tierName: user.subscription.tierName,
            status: user.subscription.status,
            expiresAt: user.subscription.currentPeriodEnd,
            isTrialing: !!(user.subscription as any).trialEnd && new Date((user.subscription as any).trialEnd) > new Date(),
          },
          trust: {
            score: trustScore,
            level: trustLevel,
            levelName: currentTrustInfo.name,
            vouchCount: user._count?.vouchesReceived || 0,
            progress: {
              currentLevel: trustLevel,
              nextLevel,
              percentToNext,
              pointsToNext: nextLevel ? nextLevelScore - trustScore : 0,
            },
          },
        },
        features: {
          events: await this.getCategoryFeatures(userId, [
            'events:view',
            'events:join',
            'events:create',
          ]),
          marketplace: await this.getCategoryFeatures(userId, [
            'marketplace:view',
            'marketplace:join',
            'marketplace:create',
          ]),
          communities: await this.getCategoryFeatures(userId, [
            'communities:view',
            'communities:join',
            'communities:create',
            'communities:moderate',
            'communities:admin',
          ]),
          homesurf: await this.getCategoryFeatures(userId, [
            'homesurf:view',
            'homesurf:join',
            'homesurf:create',
          ]),
          berseguide: await this.getCategoryFeatures(userId, [
            'berseguide:view',
            'berseguide:join',
            'berseguide:create',
          ]),
          services: await this.getCategoryFeatures(userId, [
            'services:view',
            'services:join',
            'services:create',
          ]),
          mentorship: await this.getCategoryFeatures(userId, [
            'mentorship:view',
            'mentorship:join',
            'mentorship:create',
          ]),
          social: await this.getCategoryFeatures(userId, [
            'connections:create',
            'messages:create',
            'vouches:create',
          ]),
          rewards: await this.getCategoryFeatures(userId, [
            'rewards:earn',
            'rewards:redeem',
          ]),
        },
        cacheKey: `features:${userId}`,
        cacheTTL: 300, // 5 minutes
        generatedAt: new Date().toISOString(),
      };

      return result;
    } catch (error) {
      console.error('Get feature availability error:', error);
      return null;
    }
  }

  /**
   * Get features for a category
   */
  private async getCategoryFeatures(userId: string, features: FeatureCode[]): Promise<Record<string, any>> {
    const result: Record<string, any> = {};

    for (const feature of features) {
      const access = await this.canAccessFeature(userId, feature);
      
      if (access.allowed) {
        result[feature] = { enabled: true };
        
        // Add usage limits if applicable
        if (this.hasUsageLimits(feature)) {
          const usage = await this.checkFeatureUsage(userId, feature);
          result[feature].limits = {
            maxPerMonth: usage.limit,
            used: usage.used,
            remaining: usage.remaining,
          };
        }
      } else {
        result[feature] = {
          enabled: false,
          reason: access.reason,
        };

        // Add upgrade requirements
        if (access.upgradeOptions?.subscriptionNeeded) {
          result[feature].upgradeRequired = {
            tier: access.upgradeOptions.subscriptionNeeded.requiredTier,
            cost: access.upgradeOptions.subscriptionNeeded.upgradeCost,
            currency: access.upgradeOptions.subscriptionNeeded.currency,
          };
        }

        if (access.upgradeOptions?.trustNeeded) {
          result[feature].trustRequired = {
            current: access.upgradeOptions.trustNeeded.currentScore,
            required: access.upgradeOptions.trustNeeded.requiredScore,
            level: access.upgradeOptions.trustNeeded.requiredLevel,
          };
        }
      }
    }

    return result;
  }

  /**
   * Check if feature has usage limits
   */
  private hasUsageLimits(feature: FeatureCode): boolean {
    return [
      'events:create',
      'communities:join',
      'communities:create',
      'marketplace:create',
      'connections:create',
      'vouches:create',
    ].includes(feature);
  }

  async getUserAccessSummary(userId: string): Promise<UserAccessSummary | null> {
    try {
      const user = await this.getUserWithAccessData(userId);

      if (!user) {
        return null;
      }

      const subscription = user.subscription;
      const trust = {
        userId: user.id,
        trustScore: user.trustScore,
        trustLevel: getTrustLevelFromScore(user.trustScore) as TrustLevel,
        vouchCount: user._count?.vouchesReceived || 0,
        momentCount: user._count?.trustMomentsReceived || 0,
        eventCount: user.stats?.eventsAttended || 0,
      };

      // Check all features
      const allFeatures: FeatureCode[] = [
        'events:view', 'events:join', 'events:create',
        'marketplace:view', 'marketplace:join', 'marketplace:create',
        'communities:view', 'communities:join', 'communities:create', 'communities:moderate', 'communities:admin',
        'homesurf:view', 'homesurf:join', 'homesurf:create',
        'berseguide:view', 'berseguide:join', 'berseguide:create',
        'services:view', 'services:join', 'services:create',
        'mentorship:view', 'mentorship:join', 'mentorship:create',
        'connections:create', 'messages:create', 'vouches:create',
        'rewards:earn', 'rewards:redeem',
      ];
      const accessibleFeatures: FeatureCode[] = [];
      const lockedFeatures: any[] = [];

      for (const feature of allFeatures) {
        const access = await this.canAccessFeature(userId, feature);
        if (access.allowed) {
          accessibleFeatures.push(feature);
        } else {
          lockedFeatures.push({
            feature,
            reason: access.reason || 'Access denied',
            upgradeOptions: access.upgradeOptions || {},
          });
        }
      }

      return {
        subscription,
        trust,
        accessibleFeatures,
        lockedFeatures,
      };
    } catch (error) {
      console.error('Get access summary error:', error);
      return null;
    }
  }

  /**
   * Check feature usage against limits
   */
  async checkFeatureUsage(
    userId: string,
    featureCode: FeatureCode,
    periodStart: Date = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  ): Promise<{
    canUse: boolean;
    used: number;
    limit: number;
    remaining: number;
  }> {
    try {
      // Get current month usage
      const periodEnd = new Date(periodStart.getFullYear(), periodStart.getMonth() + 1, 0);

      const usage = await prisma.featureUsage.count({
        where: {
          userId,
          featureCode: featureCode as string,
          usedAt: {
            gte: periodStart,
            lte: periodEnd,
          },
        },
      });

      // Get user's limit based on subscription
      const user = await this.getUserWithAccessData(userId);
      const limit = this.getFeatureLimit(user?.subscription, featureCode);

      const remaining = limit === -1 ? Infinity : Math.max(0, limit - usage);
      const canUse = limit === -1 || usage < limit;

      return {
        canUse,
        used: usage,
        limit,
        remaining: limit === -1 ? -1 : remaining,
      };
    } catch (error) {
      console.error('Check feature usage error:', error);
      return { canUse: false, used: 0, limit: 0, remaining: 0 };
    }
  }

  // ========================================================================
  // PRIVATE HELPER METHODS
  // ========================================================================

  /**
   * Get user with all access-related data
   */
  private async getUserWithAccessData(userId: string) {
    return await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscriptions: {
          where: { status: 'ACTIVE' },
          include: { tiers: true },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        stats: true,
        _count: {
          select: {
            vouchesReceived: true,
            trustMomentsReceived: true,
          },
        },
      },
    }).then(user => {
      if (!user) return null;

      const activeSubscription = user.subscriptions[0];
      const tier = activeSubscription?.tiers;

      return {
        id: user.id,
        trustScore: user.trustScore,
        trustLevel: user.trustLevel,
        stats: user.stats,
        _count: user._count,
        subscription: {
          id: activeSubscription?.id || 'none',
          userId: user.id,
          tierCode: tier?.tierCode || 'FREE',
          status: (activeSubscription?.status as SubscriptionStatus) || SubscriptionStatus.ACTIVE,
          billingCycle: tier?.billingCycle || 'MONTHLY',
          currentPeriodStart: activeSubscription?.currentPeriodStart || new Date(),
          currentPeriodEnd: activeSubscription?.currentPeriodEnd || new Date(),
          canceledAt: activeSubscription?.canceledAt,
          createdAt: activeSubscription?.createdAt || new Date(),
          updatedAt: activeSubscription?.updatedAt || new Date(),
          tier: {
            tierCode: tier?.tierCode || 'FREE',
            name: tier?.tierName || 'Free',
            price: tier?.price || 0,
            currency: tier?.currency || 'MYR',
            billingCycle: tier?.billingCycle || 'MONTHLY',
          },
          // Legacy fields for backward compatibility
          tierName: tier?.tierName || 'Free',
          features: tier?.features as any || {},
        },
      };
    });
  }

  /**
   * Check if subscription meets requirement
   */
  private checkSubscriptionRequirement(
    subscription: UserSubscriptionInfo,
    required?: SubscriptionTier
  ): { allowed: boolean; reason?: string } {
    // No requirement = allowed
    if (!required) {
      return { allowed: true };
    }

    const current = subscription.tierCode as SubscriptionTier;
    const allowed = subscriptionTierMeetsRequirement(current, required);

    if (!allowed) {
      return {
        allowed: false,
        reason: `Requires ${required} subscription (you have ${current})`,
      };
    }

    return { allowed: true };
  }

  /**
   * Check if trust level meets requirement
   */
  private checkTrustRequirement(
    trustScore: number,
    trustLevel: string,
    requiredLevel?: TrustLevel,
    requiredScore?: number
  ): { allowed: boolean; reason?: string } {
    // No requirement = allowed
    if (!requiredLevel && !requiredScore) {
      return { allowed: true };
    }

    const currentLevel = getTrustLevelFromScore(trustScore) as TrustLevel;

    // Check level requirement
    if (requiredLevel) {
      const allowed = trustLevelMeetsRequirement(currentLevel, requiredLevel);
      if (!allowed) {
        return {
          allowed: false,
          reason: `Requires ${requiredLevel} trust level (you are ${currentLevel})`,
        };
      }
    }

    // Check score requirement
    if (requiredScore && trustScore < requiredScore) {
      return {
        allowed: false,
        reason: `Requires ${requiredScore}% trust score (you have ${trustScore}%)`,
      };
    }

    return { allowed: true };
  }

  /**
   * Generate reason message for blocked access
   */
  private generateBlockedReason(
    subscriptionCheck: { allowed: boolean; reason?: string },
    trustCheck: { allowed: boolean; reason?: string }
  ): string {
    if (!subscriptionCheck.allowed && !trustCheck.allowed) {
      return `${subscriptionCheck.reason} AND ${trustCheck.reason}`;
    }
    return subscriptionCheck.reason || trustCheck.reason || 'Access denied';
  }

  /**
   * Generate upgrade options
   */
  private async generateUpgradeOptions(
    user: any,
    subscriptionCheck: { allowed: boolean },
    trustCheck: { allowed: boolean },
    requirements: any
  ): Promise<UpgradeOptions> {
    const options: UpgradeOptions = {};

    // Subscription upgrade needed
    if (!subscriptionCheck.allowed && requirements.subscriptionTier) {
      const currentTier = user.subscription.tier;
      const requiredTier = requirements.subscriptionTier;
      
      // Fetch actual price from database
      const tierData = await prisma.subscriptionTier.findFirst({
        where: { tierCode: requiredTier, isActive: true },
        select: { price: true, currency: true }
      });
      
      const upgradeCost = tierData?.price || TIER_PRICING[requiredTier].monthly;
      const currency = tierData?.currency || 'MYR';

      options.subscriptionNeeded = {
        currentTier,
        requiredTier,
        upgradeCost,
        currency,
      };
    }

    // Trust upgrade needed
    if (!trustCheck.allowed) {
      const currentLevel = getTrustLevelFromScore(user.trustScore) as TrustLevel;
      const requiredLevel = requirements.minTrustLevel || TrustLevel.TRUSTED;
      const requiredScore = requirements.minTrustScore || getTrustLevelMinScore(requiredLevel);

      options.trustNeeded = {
        currentLevel,
        currentScore: user.trustScore,
        requiredLevel,
        requiredScore,
        estimatedDays: this.estimateTrustBuildingDays(user.trustScore, requiredScore),
        suggestedActions: this.getSuggestedTrustActions(currentLevel, requiredLevel),
      };
    }

    return options;
  }

  /**
   * Estimate days to build trust
   */
  private estimateTrustBuildingDays(current: number, target: number): number {
    const gap = target - current;
    // Rough estimate: 2% per week with active participation
    const weeksNeeded = Math.ceil(gap / 2);
    return weeksNeeded * 7;
  }

  /**
   * Get suggested actions to build trust
   */
  private getSuggestedTrustActions(current: TrustLevel, target: TrustLevel): string[] {
    const actions: string[] = [];

    switch (target) {
      case TrustLevel.TRUSTED:
        actions.push('Attend 5-8 events');
        actions.push('Get 2-3 vouches from connections');
        actions.push('Complete your profile fully');
        actions.push('Join and participate in communities');
        break;
      case TrustLevel.LEADER:
        actions.push('Attend 15+ events');
        actions.push('Get all vouches (1 primary, 3 secondary, 2 community)');
        actions.push('Host multiple events with positive reviews');
        actions.push('Contribute consistently to communities');
        actions.push('Demonstrate leadership in your communities');
        break;
    }

    return actions;
  }

  /**
   * Get feature limit from subscription
   */
  private getFeatureLimit(subscription: UserSubscriptionInfo | undefined, feature: FeatureCode): number {
    if (!subscription || !subscription.features) {
      return 0;
    }

    const features = subscription.features;

    // Map feature to limit
    switch (feature) {
      case 'events:create':
        return features.eventAccess?.maxEventsPerMonth || 0;
      case 'marketplace:create':
        return features.marketplaceAccess?.maxListings || 0;
      case 'services:create':
        return features.serviceAccess?.maxActiveServices || 0;
      case 'communities:join':
        return features.communityAccess?.maxCommunities || 0;
      default:
        return -1; // Unlimited or not applicable
    }
  }
}

export default new AccessControlService();
