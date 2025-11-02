/**
 * Subscription Controller
 * Handles HTTP requests for subscription management
 */

import { Response } from 'express';
import { AuthRequest } from '../middlewares/featureAccess.middleware';
import subscriptionService from '../services/subscription.service';
import accessControlService from '../services/accessControl.service';
import subscriptionPaymentService, { PaymentGateway } from '../services/payments/subscription-payment.service';
import { FeatureCode, SubscriptionTier, BillingCycle } from '../types/subscription.types';

class SubscriptionController {
  /**
   * GET /api/subscriptions/tiers
   * Get all available subscription tiers
   */
  async getTiers(req: AuthRequest, res: Response) {
    try {
      const tiers = await subscriptionService.getAllTiers();

      res.status(200).json({
        success: true,
        data: tiers,
      });
    } catch (error) {
      console.error('Get tiers error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch subscription tiers',
      });
    }
  }

  /**
   * GET /api/subscriptions/tiers/:tierCode
   * Get specific tier details
   */
  async getTierDetails(req: AuthRequest, res: Response) {
    try {
      const { tierCode } = req.params;

      const tier = await subscriptionService.getTierByCode(tierCode as SubscriptionTier);

      if (!tier) {
        res.status(404).json({
          success: false,
          error: 'Tier not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: tier,
      });
    } catch (error) {
      console.error('Get tier details error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch tier details',
      });
    }
  }

  /**
   * GET /api/subscriptions/my
   * Get current user's subscription with payment details
   */
  async getMySubscription(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.id) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
        return;
      }

      const subscription = await subscriptionService.getSubscriptionWithPayments(req.user.id);

      res.status(200).json({
        success: true,
        data: subscription,
      });
    } catch (error) {
      console.error('Get my subscription error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch subscription',
      });
    }
  }

  /**
   * POST /api/subscriptions/subscribe
   * Create new subscription (with payment)
   */
  async subscribe(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.id) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
        return;
      }

      const { tierCode, billingCycle, paymentGateway } = req.body;

      if (!tierCode) {
        res.status(400).json({
          success: false,
          error: 'Tier code is required',
        });
        return;
      }

      // Validate tier code
      if (!Object.values(SubscriptionTier).includes(tierCode)) {
        res.status(400).json({
          success: false,
          error: 'Invalid tier code',
        });
        return;
      }

      // Validate billing cycle if provided
      if (billingCycle && !Object.values(BillingCycle).includes(billingCycle)) {
        res.status(400).json({
          success: false,
          error: 'Invalid billing cycle',
        });
        return;
      }

      // FREE tier doesn't require payment
      if (tierCode === SubscriptionTier.FREE) {
        const subscription = await subscriptionService.createSubscription(
          req.user.id,
          tierCode,
          billingCycle || BillingCycle.MONTHLY
        );

        res.status(201).json({
          success: true,
          data: subscription,
        });
        return;
      }

      // PAID tiers require payment gateway
      if (!paymentGateway) {
        res.status(400).json({
          success: false,
          error: 'Payment gateway is required for paid tiers',
        });
        return;
      }

      // Create payment intent
      const paymentIntent = await subscriptionPaymentService.createSubscriptionPayment({
        userId: req.user.id,
        tierCode,
        billingCycle: billingCycle || BillingCycle.MONTHLY,
        gateway: paymentGateway,
      });

      // Create pending subscription
      const subscription = await subscriptionService.createSubscription(
        req.user.id,
        tierCode,
        billingCycle || BillingCycle.MONTHLY
      );

      res.status(201).json({
        success: true,
        data: {
          subscription,
          payment: paymentIntent,
        },
      });
    } catch (error: any) {
      console.error('Subscribe error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to create subscription',
      });
    }
  }

  /**
   * PUT /api/subscriptions/upgrade
   * Upgrade subscription to higher tier
```
  }

  /**
   * PUT /api/subscriptions/upgrade
   * Upgrade subscription to higher tier
   */
  async upgrade(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.id) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
        return;
      }

      const { tierCode } = req.body;

      if (!tierCode) {
        res.status(400).json({
          success: false,
          error: 'Tier code is required',
        });
        return;
      }

      const subscription = await subscriptionService.upgradeSubscription(
        req.user.id,
        tierCode
      );

      if (!subscription) {
        res.status(500).json({
          success: false,
          error: 'Failed to upgrade subscription',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: subscription,
        message: 'Subscription upgraded successfully',
      });
    } catch (error: any) {
      console.error('Upgrade error:', error);
      
      // Check if it's a downgrade attempt
      if (error.message?.includes('Not an upgrade')) {
        res.status(400).json({
          success: false,
          error: 'This is a downgrade. Use POST /subscriptions/downgrade instead.',
          isDowngrade: true,
        });
        return;
      }
      
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to upgrade subscription',
      });
    }
  }

  /**
   * POST /api/subscriptions/downgrade
   * Downgrade subscription to lower tier (with warnings)
   */
  async downgrade(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.id) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
        return;
      }

      const { tierCode, confirmed } = req.body;

      if (!tierCode) {
        res.status(400).json({
          success: false,
          error: 'Tier code is required',
        });
        return;
      }

      // Get current subscription to show warning
      const currentSub = await subscriptionService.getUserSubscription(req.user.id);
      if (!currentSub || currentSub.tier === SubscriptionTier.FREE) {
        res.status(400).json({
          success: false,
          error: 'No active paid subscription to downgrade',
        });
        return;
      }

      // Check if it's actually a downgrade
      const tierHierarchy = [SubscriptionTier.FREE, SubscriptionTier.BASIC];
      const currentIndex = tierHierarchy.indexOf(currentSub.tier);
      const newIndex = tierHierarchy.indexOf(tierCode as SubscriptionTier);

      if (newIndex >= currentIndex) {
        res.status(400).json({
          success: false,
          error: 'This is not a downgrade. Use PUT /subscriptions/upgrade instead.',
        });
        return;
      }

      // If not confirmed, return warning
      if (!confirmed) {
        // Get feature differences
        const currentTier = await subscriptionService.getTierByCode(currentSub.tier);
        const newTier = await subscriptionService.getTierByCode(tierCode as SubscriptionTier);

        res.status(200).json({
          success: false,
          requiresConfirmation: true,
          warning: {
            message: 'Downgrading will limit your access to premium features',
            currentTier: currentSub.tier,
            newTier: tierCode,
            effectiveDate: currentSub.currentPeriodEnd,
            remainingDays: Math.ceil(
              (currentSub.currentPeriodEnd.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
            ),
            lostFeatures: this.getFeatureDifferences(currentTier, newTier),
            instructions: 'To proceed, send the same request with "confirmed": true',
          },
        });
        return;
      }

      // Proceed with downgrade
      const subscription = await subscriptionService.downgradeSubscription(
        req.user.id,
        tierCode as SubscriptionTier
      );

      if (!subscription) {
        res.status(500).json({
          success: false,
          error: 'Failed to downgrade subscription',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: subscription,
        message: `Subscription will downgrade to ${tierCode} at end of current period`,
      });
    } catch (error: any) {
      console.error('Downgrade error:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to downgrade subscription',
      });
    }
  }

  /**
   * Helper: Get feature differences between tiers
   */
  private getFeatureDifferences(currentTier: any, newTier: any): string[] {
    if (!currentTier?.features || !newTier?.features) return [];

    const lost: string[] = [];
    const currentFeatures = currentTier.features as any;
    const newFeatures = newTier.features as any;

    // Check each feature
    Object.keys(currentFeatures).forEach(feature => {
      if (currentFeatures[feature] && !newFeatures[feature]) {
        // Convert camelCase to readable format
        const readable = feature
          .replace(/([A-Z])/g, ' $1')
          .replace(/^./, str => str.toUpperCase())
          .trim();
        lost.push(readable);
      }
    });

    return lost;
  }

  /**
   * POST /api/subscriptions/cancel
   * Cancel subscription
   */
  async cancel(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.id) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
        return;
      }

      const { immediately } = req.body;

      // Get current subscription
      const subscription = await subscriptionService.getUserSubscription(req.user.id);

      if (!subscription || subscription.id === 'default-free') {
        res.status(400).json({
          success: false,
          error: 'No active subscription to cancel',
        });
        return;
      }

      const success = await subscriptionService.cancelSubscription(
        subscription.id,
        immediately
      );

      if (!success) {
        res.status(500).json({
          success: false,
          error: 'Failed to cancel subscription',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: immediately
          ? 'Subscription canceled immediately'
          : 'Subscription will be canceled at end of billing period',
      });
    } catch (error) {
      console.error('Cancel subscription error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to cancel subscription',
      });
    }
  }

  /**
   * POST /api/subscriptions/check-feature
   * Check if user can access a specific feature
   */
  async checkFeature(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.id) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
        return;
      }

      const { featureCode } = req.body;

      if (!featureCode) {
        res.status(400).json({
          success: false,
          error: 'Feature code is required',
        });
        return;
      }

      const access = await accessControlService.canAccessFeature(
        req.user.id,
        featureCode as FeatureCode
      );

      res.status(200).json({
        success: true,
        data: access,
      });
    } catch (error) {
      console.error('Check feature error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to check feature access',
      });
    }
  }

  /**
   * GET /api/subscriptions/access-summary
   * Get complete access summary for user
   */
  async getAccessSummary(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.id) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
        return;
      }

      const summary = await accessControlService.getUserAccessSummary(req.user.id);

      if (!summary) {
        res.status(404).json({
          success: false,
          error: 'User not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: summary,
      });
    } catch (error) {
      console.error('Get access summary error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch access summary',
      });
    }
  }

  /**
   * GET /api/subscriptions/usage/:featureCode
   * Check feature usage for current period
   */
  async getFeatureUsage(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.id) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
        return;
      }

      const { featureCode } = req.params;

      if (!featureCode) {
        res.status(400).json({
          success: false,
          error: 'Feature code is required',
        });
        return;
      }

      const usage = await accessControlService.checkFeatureUsage(
        req.user.id,
        featureCode as FeatureCode
      );

      res.status(200).json({
        success: true,
        data: usage,
      });
    } catch (error) {
      console.error('Get feature usage error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch feature usage',
      });
    }
  }

  /**
   * GET /api/subscriptions/stats
   * Get subscription statistics
   */
  async getStats(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.id) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
        return;
      }

      const stats = await subscriptionService.getSubscriptionStats(req.user.id);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error('Get subscription stats error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch subscription stats',
      });
    }
  }

  /**
   * GET /api/subscriptions/payments
   * Get subscription payment history
   */
  async getPayments(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.id) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
        return;
      }

      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      const status = req.query.status as string;

      const result = await subscriptionService.getSubscriptionPayments(req.user.id, {
        limit,
        offset,
        status,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Get subscription payments error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch subscription payments',
      });
    }
  }

  /**
   * GET /api/subscriptions/invoices
   * Get subscription invoices (billing history)
   */
  async getInvoices(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.id) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
        return;
      }

      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;

      const result = await subscriptionService.getSubscriptionInvoices(req.user.id, {
        limit,
        offset,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Get subscription invoices error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch subscription invoices',
      });
    }
  }

  /**
   * POST /api/subscriptions/retry-payment
   * Retry failed or pending subscription payment
   */
  async retryPayment(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.id) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
        return;
      }

      const { paymentId } = req.body;

      if (!paymentId) {
        res.status(400).json({
          success: false,
          error: 'Payment ID is required',
        });
        return;
      }

      const result = await subscriptionService.retrySubscriptionPayment(req.user.id, paymentId);

      res.status(200).json({
        success: true,
        data: result,
        message: result.checkoutUrl 
          ? 'Payment checkout URL retrieved. Complete payment to activate subscription.'
          : 'Payment retry initiated. Please complete payment.',
      });
    } catch (error: any) {
      console.error('Retry payment error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to retry payment',
      });
    }
  }

  /**
   * POST /api/subscriptions/calculate-upgrade
   * Calculate cost for upgrading to a tier
   */
  async calculateUpgradeCost(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.id) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
        return;
      }

      const { targetTier, billingCycle } = req.body;

      if (!targetTier) {
        res.status(400).json({
          success: false,
          error: 'Target tier is required',
        });
        return;
      }

      // Get current subscription
      const currentSubscription = await subscriptionService.getUserSubscription(req.user.id);

      if (!currentSubscription) {
        res.status(404).json({
          success: false,
          error: 'No active subscription found',
        });
        return;
      }

      const cost = subscriptionService.calculateUpgradeCost(
        currentSubscription.tier,
        targetTier,
        billingCycle || BillingCycle.MONTHLY
      );

      res.status(200).json({
        success: true,
        data: {
          currentTier: currentSubscription.tier,
          targetTier,
          billingCycle: billingCycle || BillingCycle.MONTHLY,
          upgradeCost: cost,
          currency: 'MYR',
        },
      });
    } catch (error) {
      console.error('Calculate upgrade cost error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to calculate upgrade cost',
      });
    }
  }
}

export default new SubscriptionController();
