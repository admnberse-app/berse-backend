/**
 * Subscription Routes
 * API endpoints for subscription management
 */

import { Router } from 'express';
import subscriptionController from '../controllers/subscription.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// ============================================================================
// PUBLIC ROUTES (No authentication required)
// ============================================================================

/**
 * GET /subscriptions/tiers
 * Get all available subscription tiers
 */
router.get('/tiers', subscriptionController.getTiers);

/**
 * GET /subscriptions/tiers/:tierCode
 * Get specific tier details
 */
router.get('/tiers/:tierCode', subscriptionController.getTierDetails);

// ============================================================================
// AUTHENTICATED ROUTES
// ============================================================================

/**
 * GET /subscriptions/my
 * Get current user's subscription
 */
router.get('/my', authenticate, subscriptionController.getMySubscription);

/**
 * POST /subscriptions/subscribe
 * Create new subscription
 * Body: { tierCode: string, billingCycle?: 'MONTHLY' | 'ANNUAL' }
 */
router.post('/subscribe', authenticate, subscriptionController.subscribe);

/**
 * PUT /subscriptions/upgrade
 * Upgrade to higher tier
 * Body: { tierCode: string }
 */
router.put('/upgrade', authenticate, subscriptionController.upgrade);

/**
 * POST /subscriptions/downgrade
 * Downgrade to lower tier (with confirmation warning)
 * Body: { tierCode: string, confirmed?: boolean }
 */
router.post('/downgrade', authenticate, subscriptionController.downgrade);

/**
 * POST /subscriptions/cancel
 * Cancel subscription
 * Body: { immediately?: boolean }
 */
router.post('/cancel', authenticate, subscriptionController.cancel);

/**
 * POST /subscriptions/check-feature
 * Check if user can access a feature
 * Body: { featureCode: string }
 */
router.post('/check-feature', authenticate, subscriptionController.checkFeature);

/**
 * GET /subscriptions/features/availability
 * Get all feature availability in one optimized call (RECOMMENDED)
 * Returns subscription status, trust level, and all feature states
 * Frontend should call this once and cache the result
 */
router.get('/features/availability', authenticate, subscriptionController.getFeatureAvailability);

/**
 * GET /subscriptions/access-summary
 * Get complete access summary (subscription + trust + features)
 */
router.get('/access-summary', authenticate, subscriptionController.getAccessSummary);

/**
 * GET /subscriptions/usage/:featureCode
 * Get feature usage for current period
 */
router.get('/usage/:featureCode', authenticate, subscriptionController.getFeatureUsage);

/**
 * GET /subscriptions/stats
 * Get subscription statistics
 */
router.get('/stats', authenticate, subscriptionController.getStats);

/**
 * GET /subscriptions/payments
 * Get subscription payment history
 * Query: { limit?: number, offset?: number, status?: string }
 */
router.get('/payments', authenticate, subscriptionController.getPayments);

/**
 * GET /subscriptions/invoices
 * Get subscription invoices (billing history)
 * Query: { limit?: number, offset?: number }
 */
router.get('/invoices', authenticate, subscriptionController.getInvoices);

/**
 * POST /subscriptions/retry-payment
 * Retry failed or pending subscription payment
 * Body: { paymentId: string }
 */
router.post('/retry-payment', authenticate, subscriptionController.retryPayment);

/**
 * POST /subscriptions/calculate-upgrade
 * Calculate upgrade cost
 * Body: { targetTier: string, billingCycle?: 'MONTHLY' | 'ANNUAL' }
 */
router.post('/calculate-upgrade', authenticate, subscriptionController.calculateUpgradeCost);

export default router;
