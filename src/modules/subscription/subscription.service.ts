/**
 * Subscription Service
 * Handles subscription tier management and operations
 */

import { prisma } from '../../config/database';
import { NotificationService } from '../../services/notification.service';
import {
  SubscriptionTier,
  BillingCycle,
  SubscriptionStatus,
  UserSubscriptionInfo,
  SubscriptionTierDetails,
  TIER_PRICING,
  TierFeatures,
  DEFAULT_FREE_TIER_FEATURES,
} from './subscription.types';

class SubscriptionService {
  /**
   * Get all active subscription tiers
   */
  async getAllTiers(): Promise<SubscriptionTierDetails[]> {
    try {
      const tiers = await prisma.subscriptionTier.findMany({
        where: { isActive: true, isPublic: true },
        orderBy: { displayOrder: 'asc' },
      });

      return tiers.map(tier => this.mapTierToDetails(tier));
    } catch (error) {
      console.error('Get all tiers error:', error);
      return [];
    }
  }

  /**
   * Get specific tier by code
   */
  async getTierByCode(tierCode: SubscriptionTier): Promise<SubscriptionTierDetails | null> {
    try {
      const tier = await prisma.subscriptionTier.findFirst({
        where: { tierCode, isActive: true },
      });

      return tier ? this.mapTierToDetails(tier) : null;
    } catch (error) {
      console.error('Get tier error:', error);
      return null;
    }
  }

  /**
   * Get user's active subscription
   */
  async getUserSubscription(userId: string): Promise<UserSubscriptionInfo | null> {
    try {
      const subscription = await prisma.userSubscription.findFirst({
        where: {
          userId,
          status: SubscriptionStatus.ACTIVE,
        },
        include: { tiers: true },
        orderBy: { createdAt: 'desc' },
      });

      if (!subscription) {
        // Return FREE tier as default
        return this.getDefaultFreeSubscription(userId);
      }

      return {
        id: subscription.id,
        userId: subscription.userId,
        tierCode: subscription.tiers.tierCode,
        status: subscription.status as SubscriptionStatus,
        billingCycle: subscription.tiers.billingCycle,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
        canceledAt: subscription.canceledAt,
        createdAt: subscription.createdAt,
        updatedAt: subscription.updatedAt,
        tier: {
          tierCode: subscription.tiers.tierCode,
          name: subscription.tiers.tierName,
          price: subscription.tiers.price,
          currency: subscription.tiers.currency,
          billingCycle: subscription.tiers.billingCycle,
        },
      };
    } catch (error) {
      console.error('Get user subscription error:', error);
      return null;
    }
  }

  /**
   * Create new subscription for user
   */
  async createSubscription(
    userId: string,
    tierCode: SubscriptionTier,
    billingCycle: BillingCycle = BillingCycle.MONTHLY
  ): Promise<UserSubscriptionInfo | null> {
    try {
      // Get tier details
      const tier = await prisma.subscriptionTier.findFirst({
        where: { tierCode, isActive: true },
      });

      if (!tier) {
        throw new Error('Invalid tier code');
      }

      // Cancel existing active subscriptions
      await prisma.userSubscription.updateMany({
        where: {
          userId,
          status: SubscriptionStatus.ACTIVE,
        },
        data: { status: SubscriptionStatus.CANCELED, canceledAt: new Date() },
      });

      // Calculate period dates
      const now = new Date();
      const periodEnd = new Date(now);
      if (billingCycle === BillingCycle.MONTHLY) {
        periodEnd.setMonth(periodEnd.getMonth() + 1);
      } else {
        periodEnd.setFullYear(periodEnd.getFullYear() + 1);
      }

      // Calculate trial end if applicable
      const trialEnd = tier.trialDays && tier.trialDays > 0
        ? new Date(now.getTime() + tier.trialDays * 24 * 60 * 60 * 1000)
        : undefined;

      // Create new subscription
      const subscription = await prisma.userSubscription.create({
        data: {
          userId,
          tierId: tier.id,
          status: trialEnd ? SubscriptionStatus.TRIALING : SubscriptionStatus.ACTIVE,
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          trialStart: trialEnd ? now : undefined,
          trialEnd,
        },
        include: { tiers: true },
      });

      // Send notification
      NotificationService.notifySubscriptionActivated(
        userId,
        tier.tierName,
        periodEnd
      ).catch(err => console.error('Failed to send subscription activation notification:', err));

      return {
        id: subscription.id,
        userId: subscription.userId,
        tierCode: subscription.tiers.tierCode,
        status: subscription.status as SubscriptionStatus,
        billingCycle: subscription.tiers.billingCycle,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
        canceledAt: subscription.canceledAt,
        createdAt: subscription.createdAt,
        updatedAt: subscription.updatedAt,
        tier: {
          tierCode: subscription.tiers.tierCode,
          name: subscription.tiers.tierName,
          price: subscription.tiers.price,
          currency: subscription.tiers.currency,
          billingCycle: subscription.tiers.billingCycle,
        },
        // Legacy fields for backward compatibility
        tierName: subscription.tiers.tierName,
        trialEnd: subscription.trialEnd || undefined,
        features: subscription.tiers.features as any,
      };
    } catch (error) {
      console.error('Create subscription error:', error);
      return null;
    }
  }

  /**
   * Upgrade user's subscription
   */
  async upgradeSubscription(
    userId: string,
    newTierCode: SubscriptionTier
  ): Promise<UserSubscriptionInfo | null> {
    try {
      // Get current subscription
      const current = await this.getUserSubscription(userId);
      if (!current) {
        return await this.createSubscription(userId, newTierCode);
      }

      // Check if it's actually an upgrade
      const currentTiers = [SubscriptionTier.FREE, SubscriptionTier.BASIC, SubscriptionTier.PREMIUM];
      const currentIndex = currentTiers.indexOf(current.tierCode as SubscriptionTier);
      const newIndex = currentTiers.indexOf(newTierCode);

      if (newIndex <= currentIndex) {
        throw new Error('Not an upgrade - use downgrade method instead');
      }

      // Create new subscription (will cancel old one)
      return await this.createSubscription(userId, newTierCode);
    } catch (error) {
      console.error('Upgrade subscription error:', error);
      return null;
    }
  }

  /**
   * Downgrade user's subscription
   */
  async downgradeSubscription(
    userId: string,
    newTierCode: SubscriptionTier
  ): Promise<UserSubscriptionInfo | null> {
    try {
      const current = await this.getUserSubscription(userId);
      if (!current) {
        throw new Error('No active subscription to downgrade');
      }

      // Set to cancel at end of current period
      await prisma.userSubscription.update({
        where: { id: current.id },
        data: { 
          cancelAt: current.currentPeriodEnd,
          status: SubscriptionStatus.ACTIVE, // Keep active until period ends
        },
      });

      // Schedule new tier to start at end of period
      // Note: This would need a background job to activate
      // For now, return current subscription
      return current;
    } catch (error) {
      console.error('Downgrade subscription error:', error);
      return null;
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionId: string, immediately: boolean = false): Promise<boolean> {
    try {
      const subscription = await prisma.userSubscription.findUnique({
        where: { id: subscriptionId },
        include: { tiers: true },
      });

      if (!subscription) {
        throw new Error('Subscription not found');
      }

      const endsAt = immediately ? new Date() : subscription.currentPeriodEnd;

      if (immediately) {
        // Cancel immediately
        await prisma.userSubscription.update({
          where: { id: subscriptionId },
          data: {
            status: SubscriptionStatus.CANCELED,
            canceledAt: new Date(),
          },
        });
      } else {
        // Cancel at end of period
        await prisma.userSubscription.update({
          where: { id: subscriptionId },
          data: {
            cancelAt: subscription.currentPeriodEnd,
          },
        });
      }

      // Send notification
      NotificationService.notifySubscriptionCanceled(
        subscription.userId,
        subscription.tiers.tierName,
        endsAt
      ).catch(err => console.error('Failed to send subscription cancellation notification:', err));

      return true;
    } catch (error) {
      console.error('Cancel subscription error:', error);
      return false;
    }
  }

  /**
   * Renew subscription (move to next period)
   */
  async renewSubscription(subscriptionId: string): Promise<boolean> {
    try {
      const subscription = await prisma.userSubscription.findUnique({
        where: { id: subscriptionId },
        include: { tiers: true },
      });

      if (!subscription) {
        throw new Error('Subscription not found');
      }

      // Calculate new period
      const newStart = subscription.currentPeriodEnd;
      const newEnd = new Date(newStart);
      
      // Assume monthly for now (would check billing cycle)
      newEnd.setMonth(newEnd.getMonth() + 1);

      await prisma.userSubscription.update({
        where: { id: subscriptionId },
        data: {
          currentPeriodStart: newStart,
          currentPeriodEnd: newEnd,
          cancelAt: null, // Clear any cancellation
        },
      });

      return true;
    } catch (error) {
      console.error('Renew subscription error:', error);
      return false;
    }
  }

  /**
   * Calculate upgrade cost
   */
  async calculateUpgradeCost(
    currentTier: SubscriptionTier,
    targetTier: SubscriptionTier,
    billingCycle: BillingCycle = BillingCycle.MONTHLY
  ): Promise<number> {
    // Fetch actual prices from database
    const [currentTierData, targetTierData] = await Promise.all([
      prisma.subscriptionTier.findFirst({
        where: { tierCode: currentTier, isActive: true },
        select: { price: true, billingCycle: true }
      }),
      prisma.subscriptionTier.findFirst({
        where: { tierCode: targetTier, isActive: true },
        select: { price: true, billingCycle: true }
      })
    ]);

    // Fallback to hardcoded values if not found
    const cycleKey = billingCycle === BillingCycle.MONTHLY ? 'monthly' : 'annual';
    const currentPrice = currentTierData?.price || TIER_PRICING[currentTier][cycleKey];
    const targetPrice = targetTierData?.price || TIER_PRICING[targetTier][cycleKey];

    return targetPrice - currentPrice;
  }

  /**
   * Get subscription statistics
   */
  async getSubscriptionStats(userId: string): Promise<{
    totalSpent: number;
    memberSince: Date;
    currentStreak: number;
    lifetimeValue: number;
  } | null> {
    try {
      const subscriptions = await prisma.userSubscription.findMany({
        where: { userId },
        orderBy: { createdAt: 'asc' },
      });

      if (subscriptions.length === 0) {
        return null;
      }

      // Calculate total spent (would need payment records)
      const totalSpent = 0; // Placeholder

      const memberSince = subscriptions[0].createdAt;
      const currentStreak = 0; // Placeholder - calculate consecutive months

      return {
        totalSpent,
        memberSince,
        currentStreak,
        lifetimeValue: totalSpent,
      };
    } catch (error) {
      console.error('Get subscription stats error:', error);
      return null;
    }
  }

  // ========================================================================
  // PRIVATE HELPER METHODS
  // ========================================================================

  /**
   * Map database tier to SubscriptionTierDetails
   */
  private mapTierToDetails(tier: any): SubscriptionTierDetails {
    return {
      id: tier.id,
      tierCode: tier.tierCode as SubscriptionTier,
      tierName: tier.tierName,
      description: tier.description,
      price: tier.price,
      currency: tier.currency,
      billingCycle: tier.billingCycle as BillingCycle,
      features: tier.features as any,
      displayOrder: tier.displayOrder,
      isActive: tier.isActive,
      isPublic: tier.isPublic,
      trialDays: tier.trialDays || 0,
    };
  }

  /**
   * Get default FREE subscription for users without subscription
   */
  private async getDefaultFreeSubscription(userId: string): Promise<UserSubscriptionInfo> {
    const freeTier = await this.getTierByCode(SubscriptionTier.FREE);
    const now = new Date();
    
    // Calculate period end based on billing cycle
    const billingCycle = freeTier?.billingCycle || 'MONTHLY';
    const periodEnd = new Date(now);
    if (billingCycle === BillingCycle.MONTHLY) {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    } else {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    }

    return {
      id: 'default-free',
      userId,
      tierCode: 'FREE',
      status: SubscriptionStatus.ACTIVE as any,
      billingCycle: billingCycle,
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      canceledAt: null,
      createdAt: now,
      updatedAt: now,
      tier: {
        tierCode: 'FREE',
        name: freeTier?.tierName || 'Free',
        price: freeTier?.price || 0,
        currency: freeTier?.currency || 'MYR',
        billingCycle: billingCycle,
      },
    };
  }
}

export default new SubscriptionService();
