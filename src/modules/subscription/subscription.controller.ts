/**
 * Subscription Controller
 * Handles HTTP requests for subscription management
 */

import { Response } from 'express';
import { AuthRequest } from '../../middlewares/featureAccess.middleware';
import subscriptionService from './subscription.service';
import accessControlService from './access-control/access-control.service';
import subscriptionPaymentService, { PaymentGateway } from './payments/subscription-payment.service';
import { FeatureCode, SubscriptionTier, BillingCycle } from './subscription.types';

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
   * Get current user's subscription
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

      const subscription = await subscriptionService.getUserSubscription(req.user.id);

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
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to upgrade subscription',
      });
    }
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
   * GET /api/subscriptions/features/availability
   * Get all feature availability in one optimized call
   * This endpoint is designed for frontend to fetch once and cache
   */
  async getFeatureAvailability(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.id) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
        return;
      }

      const availability = await accessControlService.getFeatureAvailability(req.user.id);

      if (!availability) {
        res.status(404).json({
          success: false,
          error: 'User not found',
        });
        return;
      }

      // Set cache headers (5 minutes)
      res.set('Cache-Control', 'private, max-age=300');

      res.status(200).json({
        success: true,
        data: availability,
      });
    } catch (error) {
      console.error('Get feature availability error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch feature availability',
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

      const cost = await subscriptionService.calculateUpgradeCost(
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
