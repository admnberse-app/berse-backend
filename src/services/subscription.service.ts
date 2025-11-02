/**
 * Subscription Service
 * Handles subscription tier management and operations
 */

import { prisma } from '../config/database';
import {
  SubscriptionTier,
  BillingCycle,
  SubscriptionStatus,
  UserSubscriptionInfo,
  SubscriptionTierDetails,
  TIER_PRICING,
  TierFeatures,
  DEFAULT_FREE_TIER_FEATURES,
} from '../types/subscription.types';
import { NotificationService } from './notification.service';
import { emailService } from './email.service';

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
        tier: subscription.tiers.tierCode as SubscriptionTier,
        tierName: subscription.tiers.tierName,
        status: subscription.status as SubscriptionStatus,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
        cancelAt: subscription.cancelAt || undefined,
        trialEnd: subscription.trialEnd || undefined,
        features: subscription.tiers.features as any,
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

      return {
        id: subscription.id,
        userId: subscription.userId,
        tier: subscription.tiers.tierCode as SubscriptionTier,
        tierName: subscription.tiers.tierName,
        status: subscription.status as SubscriptionStatus,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
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
      const currentTiers = [SubscriptionTier.FREE, SubscriptionTier.BASIC];
      const currentIndex = currentTiers.indexOf(current.tier);
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
      });

      if (!subscription) {
        throw new Error('Subscription not found');
      }

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
  calculateUpgradeCost(
    currentTier: SubscriptionTier,
    targetTier: SubscriptionTier,
    billingCycle: BillingCycle = BillingCycle.MONTHLY
  ): number {
    const cycleKey = billingCycle === BillingCycle.MONTHLY ? 'monthly' : 'annual';
    
    const currentPrice = TIER_PRICING[currentTier][cycleKey];
    const targetPrice = TIER_PRICING[targetTier][cycleKey];

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

      // Calculate total spent from successful payments
      const payments = await prisma.subscriptionPayment.findMany({
        where: {
          userId,
          status: 'SUCCEEDED',
        },
      });

      const totalSpent = payments.reduce((sum, payment) => sum + payment.amount, 0);
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

  /**
   * Get subscription payment history
   */
  async getSubscriptionPayments(userId: string, options?: {
    limit?: number;
    offset?: number;
    status?: string;
  }) {
    try {
      const where: any = { userId };
      if (options?.status) {
        where.status = options.status;
      }

      const [payments, total] = await Promise.all([
        prisma.subscriptionPayment.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          take: options?.limit || 20,
          skip: options?.offset || 0,
          include: {
            subscriptions: {
              include: { tiers: true },
            },
          },
        }),
        prisma.subscriptionPayment.count({ where }),
      ]);

      // Calculate summary
      const allPayments = await prisma.subscriptionPayment.findMany({
        where: { userId },
        select: {
          amount: true,
          status: true,
          paidAt: true,
          dueDate: true,
        },
      });

      const summary = {
        totalPayments: allPayments.length,
        totalAmount: allPayments
          .filter(p => p.status === 'SUCCEEDED')
          .reduce((sum, p) => sum + p.amount, 0),
        successfulPayments: allPayments.filter(p => p.status === 'SUCCEEDED').length,
        failedPayments: allPayments.filter(p => p.status === 'FAILED').length,
        pendingPayments: allPayments.filter(p => p.status === 'PENDING').length,
        lastPaymentDate: allPayments
          .filter(p => p.paidAt)
          .sort((a, b) => (b.paidAt?.getTime() || 0) - (a.paidAt?.getTime() || 0))[0]?.paidAt,
        nextPaymentDate: allPayments
          .filter(p => p.status === 'PENDING')
          .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())[0]?.dueDate,
      };

      return {
        payments: payments.map(p => ({
          id: p.id,
          subscriptionId: p.subscriptionId,
          amount: p.amount,
          currency: p.currency,
          status: p.status,
          billingPeriodStart: p.billingPeriodStart,
          billingPeriodEnd: p.billingPeriodEnd,
          dueDate: p.dueDate,
          paidAt: p.paidAt || undefined,
          failedAt: p.failedAt || undefined,
          failureReason: p.failureReason || undefined,
          paymentTransactionId: p.paymentTransactionId || undefined,
          gatewayInvoiceId: p.gatewayInvoiceId || undefined,
          createdAt: p.createdAt,
          tier: p.subscriptions?.tiers?.tierName,
        })),
        total,
        summary,
      };
    } catch (error) {
      console.error('Get subscription payments error:', error);
      throw error;
    }
  }

  /**
   * Get subscription invoices (alias for payments with invoice format)
   */
  async getSubscriptionInvoices(userId: string, options?: {
    limit?: number;
    offset?: number;
  }) {
    try {
      const result = await this.getSubscriptionPayments(userId, options);
      
      return {
        invoices: result.payments.map(payment => ({
          invoiceId: payment.id,
          invoiceNumber: `INV-${payment.id.slice(-8).toUpperCase()}`,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
          billingPeriod: {
            start: payment.billingPeriodStart,
            end: payment.billingPeriodEnd,
          },
          dueDate: payment.dueDate,
          paidAt: payment.paidAt,
          tier: payment.tier,
          gatewayInvoiceId: payment.gatewayInvoiceId,
          downloadUrl: payment.gatewayInvoiceId 
            ? `/api/subscriptions/invoices/${payment.id}/download` 
            : undefined,
        })),
        total: result.total,
        summary: result.summary,
      };
    } catch (error) {
      console.error('Get subscription invoices error:', error);
      throw error;
    }
  }

  /**
   * Get user subscription with payment details
   */
  async getSubscriptionWithPayments(userId: string) {
    try {
      const subscription = await this.getUserSubscription(userId);
      if (!subscription) {
        return null;
      }

      // Get last payment
      const lastPayment = await prisma.subscriptionPayment.findFirst({
        where: {
          userId,
          status: 'SUCCEEDED',
        },
        orderBy: { paidAt: 'desc' },
      });

      // Get upcoming/pending payment
      const upcomingPayment = await prisma.subscriptionPayment.findFirst({
        where: {
          userId,
          subscriptionId: subscription.id !== 'default-free' ? subscription.id : undefined,
          status: 'PENDING',
          dueDate: { gte: new Date() },
        },
        orderBy: { dueDate: 'asc' },
      });

      // Get failed payment that can be retried
      const failedPayment = await prisma.subscriptionPayment.findFirst({
        where: {
          userId,
          subscriptionId: subscription.id !== 'default-free' ? subscription.id : undefined,
          status: 'FAILED',
        },
        orderBy: { failedAt: 'desc' },
      });

      // Get subscription record for billing cycle info
      const subscriptionRecord = subscription.id !== 'default-free'
        ? await prisma.userSubscription.findUnique({
            where: { id: subscription.id },
          })
        : null;

      // Check if there's a payment that can be retried
      const canRetryPayment = failedPayment !== null || (upcomingPayment && upcomingPayment.status === 'PENDING');
      const paymentToRetry = failedPayment || upcomingPayment;

      return {
        ...subscription,
        nextBillingDate: upcomingPayment?.dueDate,
        nextBillingAmount: upcomingPayment?.amount,
        canRetryPayment,
        lastPayment: lastPayment ? {
          id: lastPayment.id,
          subscriptionId: lastPayment.subscriptionId,
          amount: lastPayment.amount,
          currency: lastPayment.currency,
          status: lastPayment.status,
          billingPeriodStart: lastPayment.billingPeriodStart,
          billingPeriodEnd: lastPayment.billingPeriodEnd,
          dueDate: lastPayment.dueDate,
          paidAt: lastPayment.paidAt || undefined,
          paymentTransactionId: lastPayment.paymentTransactionId || undefined,
          createdAt: lastPayment.createdAt,
        } : undefined,
        upcomingPayment: upcomingPayment ? {
          id: upcomingPayment.id,
          subscriptionId: upcomingPayment.subscriptionId,
          amount: upcomingPayment.amount,
          currency: upcomingPayment.currency,
          status: upcomingPayment.status,
          billingPeriodStart: upcomingPayment.billingPeriodStart,
          billingPeriodEnd: upcomingPayment.billingPeriodEnd,
          dueDate: upcomingPayment.dueDate,
          createdAt: upcomingPayment.createdAt,
          gatewayInvoiceUrl: upcomingPayment.gatewayInvoiceId ? await this.getPaymentCheckoutUrl(upcomingPayment.id) : undefined,
        } : undefined,
        failedPayment: failedPayment ? {
          id: failedPayment.id,
          subscriptionId: failedPayment.subscriptionId,
          amount: failedPayment.amount,
          currency: failedPayment.currency,
          status: failedPayment.status,
          billingPeriodStart: failedPayment.billingPeriodStart,
          billingPeriodEnd: failedPayment.billingPeriodEnd,
          dueDate: failedPayment.dueDate,
          failedAt: failedPayment.failedAt || undefined,
          failureReason: failedPayment.failureReason || undefined,
          createdAt: failedPayment.createdAt,
        } : undefined,
      };
    } catch (error) {
      console.error('Get subscription with payments error:', error);
      throw error;
    }
  }

  /**
   * Send upcoming payment reminders (to be called by cron job)
   * Sends reminders 3 days before billing date
   */
  async sendUpcomingPaymentReminders() {
    try {
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
      
      const fourDaysFromNow = new Date();
      fourDaysFromNow.setDate(fourDaysFromNow.getDate() + 4);

      // Find all pending payments due in 3 days
      const upcomingPayments = await prisma.subscriptionPayment.findMany({
        where: {
          status: 'PENDING',
          dueDate: {
            gte: threeDaysFromNow,
            lt: fourDaysFromNow,
          },
        },
        include: {
          user: true,
          subscriptions: {
            include: { tiers: true },
          },
        },
      });

      console.log(`Sending ${upcomingPayments.length} upcoming payment reminders`);

      for (const payment of upcomingPayments) {
        if (!payment.user || !payment.subscriptions) continue;

        const tierName = payment.subscriptions.tiers.tierName;
        const userName = payment.user.fullName || payment.user.email;

        // Send in-app notification
        NotificationService.notifyUpcomingSubscriptionPayment(
          payment.userId,
          tierName,
          payment.amount,
          payment.currency,
          payment.dueDate
        ).catch(err => console.error('Failed to send upcoming payment notification:', err));

        // Send email
        emailService.sendUpcomingSubscriptionPayment(
          payment.user.email,
          {
            userName,
            tierName,
            amount: payment.amount,
            currency: payment.currency,
            billingDate: payment.dueDate.toLocaleDateString(),
            paymentMethod: payment.subscriptions.paymentProviderId || 'Saved payment method',
            manageSubscriptionUrl: `${process.env.FRONTEND_URL}/subscriptions/my`,
          }
        ).catch(err => console.error('Failed to send upcoming payment email:', err));
      }

      return upcomingPayments.length;
    } catch (error) {
      console.error('Send upcoming payment reminders error:', error);
      throw error;
    }
  }

  /**
   * Get payment checkout URL for retry
   */
  private async getPaymentCheckoutUrl(paymentId: string): Promise<string | undefined> {
    try {
      const payment = await prisma.subscriptionPayment.findUnique({
        where: { id: paymentId },
      });

      if (!payment?.gatewayInvoiceId) {
        return undefined;
      }

      // For now, return a placeholder. This should integrate with actual payment gateway
      // to retrieve the checkout URL from Xendit/Stripe
      return `${process.env.PAYMENT_GATEWAY_URL}/checkout/${payment.gatewayInvoiceId}`;
    } catch (error) {
      console.error('Get payment checkout URL error:', error);
      return undefined;
    }
  }

  /**
   * Retry failed subscription payment
   */
  async retrySubscriptionPayment(userId: string, paymentId: string) {
    try {
      const payment = await prisma.subscriptionPayment.findFirst({
        where: {
          id: paymentId,
          userId,
          status: { in: ['FAILED', 'PENDING'] },
        },
        include: {
          subscriptions: {
            include: { tiers: true },
          },
        },
      });

      if (!payment) {
        throw new Error('Payment not found or cannot be retried');
      }

      // If payment already has a gateway invoice URL, return it
      if (payment.gatewayInvoiceId) {
        const checkoutUrl = await this.getPaymentCheckoutUrl(payment.id);
        return {
          paymentId: payment.id,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
          checkoutUrl,
          gatewayInvoiceId: payment.gatewayInvoiceId,
        };
      }

      // Otherwise, create a new payment intent
      // This would integrate with subscription-payment.service.ts
      // For now, return payment details
      return {
        paymentId: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        tierName: payment.subscriptions.tiers.tierName,
        needsNewPaymentIntent: true,
      };
    } catch (error) {
      console.error('Retry subscription payment error:', error);
      throw error;
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

    return {
      id: 'default-free',
      userId,
      tier: SubscriptionTier.FREE,
      tierName: 'Free',
      status: SubscriptionStatus.ACTIVE as any,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      features: (freeTier?.features as TierFeatures) || DEFAULT_FREE_TIER_FEATURES,
    };
  }
}

export default new SubscriptionService();
