/**
 * Admin Subscription Routes
 * Admin endpoints for managing subscription tiers dynamically
 */

import { Router } from 'express';
import adminSubscriptionController from '../../controllers/admin/subscription.admin.controller';
import { authenticate } from '../../middleware/auth';
// TODO: Add admin role check middleware
// import { requireRole } from '../../middlewares/role.middleware';

const router = Router();

// All routes require authentication + admin role
// TODO: Add requireRole('admin') middleware when implemented

/**
 * GET /api/admin/subscriptions/tiers
 * Get all subscription tiers with full details
 */
router.get('/tiers', authenticate, adminSubscriptionController.getAllTiers);

/**
 * POST /api/admin/subscriptions/tiers
 * Create new subscription tier
 */
router.post('/tiers', authenticate, adminSubscriptionController.createTier);

/**
 * PUT /api/admin/subscriptions/tiers/:id
 * Update subscription tier (full update)
 */
router.put('/tiers/:id', authenticate, adminSubscriptionController.updateTier);

/**
 * PUT /api/admin/subscriptions/tiers/:id/pricing
 * Update only pricing
 */
router.put('/tiers/:id/pricing', authenticate, adminSubscriptionController.updatePricing);

/**
 * PUT /api/admin/subscriptions/tiers/:id/features
 * Update only features
 */
router.put('/tiers/:id/features', authenticate, adminSubscriptionController.updateFeatures);

/**
 * DELETE /api/admin/subscriptions/tiers/:id
 * Deactivate tier (soft delete)
 */
router.delete('/tiers/:id', authenticate, adminSubscriptionController.deactivateTier);

/**
 * GET /api/admin/subscriptions/stats
 * Get subscription statistics
 */
router.get('/stats', authenticate, adminSubscriptionController.getStats);

/**
 * GET /api/admin/subscriptions/users/:userId
 * Get user's subscription history
 */
router.get('/users/:userId', authenticate, adminSubscriptionController.getUserSubscription);

export default router;
