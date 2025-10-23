import { Router } from 'express';
import { discoverController } from './discover.controller';
import { optionalAuth } from '../../middleware/auth';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();

/**
 * GET /v2/discover/filters
 * Get all available filter options and enums
 * Public endpoint - no auth required
 */
router.get(
  '/filters',
  asyncHandler(discoverController.getFilterOptions.bind(discoverController))
);

/**
 * GET /v2/discover
 * Main discover endpoint - returns sections or search results
 * Public endpoint with optional authentication for personalization
 */
router.get(
  '/',
  optionalAuth,
  asyncHandler(discoverController.discover.bind(discoverController))
);

/**
 * GET /v2/discover/trending
 * Get trending content
 */
router.get(
  '/trending',
  optionalAuth,
  asyncHandler(discoverController.getTrending.bind(discoverController))
);

/**
 * GET /v2/discover/nearby
 * Get nearby content (requires lat/lng)
 */
router.get(
  '/nearby',
  optionalAuth,
  asyncHandler(discoverController.getNearby.bind(discoverController))
);

export default router;
