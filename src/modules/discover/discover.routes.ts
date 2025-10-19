import { Router } from 'express';
import { discoverController } from './discover.controller';
import { optionalAuth } from '../../middleware/auth';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Discover
 *   description: Unified discover/explore feed combining events, communities, and marketplace
 */

/**
 * GET /v2/discover/feed
 * Get unified discover feed with personalization
 * Public endpoint with optional authentication for personalization
 */
router.get(
  '/feed',
  optionalAuth,
  discoverController.getDiscoverFeed.bind(discoverController)
);

export default router;
