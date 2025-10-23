/**
 * Subscription Routes
 * API endpoints for subscription management
 */

import { Router } from 'express';
import subscriptionController from './subscription.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

// ============================================================================
// PUBLIC ROUTES (No authentication required)
// ============================================================================

/**
 * GET /api/subscriptions/tiers
 * Get all available subscription tiers
 */
router.get('/tiers', subscriptionController.getTiers);

/**
 * GET /api/subscriptions/tiers/:tierCode
 * Get specific tier details
 */
router.get('/tiers/:tierCode', subscriptionController.getTierDetails);

// ============================================================================
// AUTHENTICATED ROUTES
// ============================================================================

/**
 * GET /api/subscriptions/my
 * Get current user's subscription
 */
router.get('/my', authenticate, subscriptionController.getMySubscription);

/**
 * POST /api/subscriptions/subscribe
 * Create new subscription
 * Body: { tierCode: string, billingCycle?: 'MONTHLY' | 'ANNUAL' }
 */
router.post('/subscribe', authenticate, subscriptionController.subscribe);

/**
 * PUT /api/subscriptions/upgrade
 * Upgrade to higher tier
 * Body: { tierCode: string }
 */
router.put('/upgrade', authenticate, subscriptionController.upgrade);

/**
 * POST /api/subscriptions/cancel
 * Cancel subscription
 * Body: { immediately?: boolean }
 */
router.post('/cancel', authenticate, subscriptionController.cancel);

/**
 * POST /api/subscriptions/check-feature
 * Check if user can access a feature
 * Body: { featureCode: string }
 */
router.post('/check-feature', authenticate, subscriptionController.checkFeature);

/**
 * GET /api/subscriptions/access-summary
 * Get complete access summary (subscription + trust + features)
 */
router.get('/access-summary', authenticate, subscriptionController.getAccessSummary);

/**
 * GET /api/subscriptions/usage/:featureCode
 * Get feature usage for current period
 */
router.get('/usage/:featureCode', authenticate, subscriptionController.getFeatureUsage);

/**
 * GET /api/subscriptions/stats
 * Get subscription statistics
 */
router.get('/stats', authenticate, subscriptionController.getStats);

/**
 * POST /api/subscriptions/calculate-upgrade
 * Calculate upgrade cost
 * Body: { targetTier: string, billingCycle?: 'MONTHLY' | 'ANNUAL' }
 */
router.post('/calculate-upgrade', authenticate, subscriptionController.calculateUpgradeCost);

export default router;
