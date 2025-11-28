import { Router } from 'express';
import { marketplaceController } from './marketplace.controller';
import { authenticateToken } from '../../middleware/auth';
import { handleValidationErrors } from '../../middleware/validation';
import { uploadImage } from '../../middleware/upload';
import { requireTrustLevel } from '../../middleware/trust-level.middleware';
import {
  createListingValidator,
  updateListingValidator,
  listingIdValidator,
  searchListingsValidator,
  addToCartValidator,
  updateCartItemValidator,
  cartItemIdValidator,
  createOrderValidator,
  updateOrderValidator,
  orderIdValidator,
  searchOrdersValidator,
  createReviewValidator,
  reviewIdValidator,
  createDisputeValidator,
  updateDisputeValidator,
  disputeIdValidator
} from './marketplace.validators';

const router = Router();

// ============= PROFILE & ELIGIBILITY ROUTES =============

/**
 * @swagger
 * /v2/marketplace/eligibility:
 *   get:
 *     summary: Check marketplace selling eligibility
 *     description: Check if user meets requirements to create marketplace listings (trust score 51+)
 *     tags: [Marketplace]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Eligibility status and requirements
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/eligibility',
  authenticateToken,
  marketplaceController.checkEligibility.bind(marketplaceController)
);

/**
 * @swagger
 * /v2/marketplace/dashboard:
 *   get:
 *     summary: Get marketplace dashboard
 *     description: Get personalized marketplace dashboard with user stats, recent activity, and pending actions
 *     tags: [Marketplace]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data with profile info, stats, and activity
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/dashboard',
  authenticateToken,
  marketplaceController.getDashboard.bind(marketplaceController)
);

// ============= IMAGE UPLOAD ROUTE (must be before listing routes) =============

/**
 * @swagger
 * /v2/marketplace/upload-images:
 *   post:
 *     summary: Upload marketplace listing images
 *     description: Upload one or multiple images for a marketplace listing. Returns array of image URLs to be used in listing creation/update.
 *     tags: [Marketplace]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Image files to upload (max 10 images, 5MB each)
 *     responses:
 *       200:
 *         description: Images uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     imageKeys:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: Storage keys/paths to use when creating listings
 *                       example: ["marketplace/userId/timestamp-hash1.jpg", "marketplace/userId/timestamp-hash2.jpg"]
 *                     imageUrls:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: Full CDN URLs for preview/reference
 *                       example: ["https://cdn.example.com/marketplace/userId/timestamp-hash1.jpg", "https://cdn.example.com/marketplace/userId/timestamp-hash2.jpg"]
 *                     count:
 *                       type: integer
 *                       example: 2
 *                 message:
 *                   type: string
 *                   example: "2 image(s) uploaded successfully"
 *       400:
 *         description: No images provided or too many images
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/upload-images',
  authenticateToken,
  uploadImage.array('images', 10), // max 10 images
  marketplaceController.uploadListingImages.bind(marketplaceController)
);

// ============= MY MARKETPLACE ROUTE =============

/**
 * @swagger
 * /v2/marketplace/my:
 *   get:
 *     summary: Get my Marketplace items (listings, purchases, sales)
 *     description: Consolidated endpoint to fetch user's marketplace activity including listings they're selling, purchases they made, and sales they completed
 *     tags: [Marketplace]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: filter
 *         schema:
 *           type: string
 *           enum: [active, past, all]
 *           default: all
 *         description: Time-based filter - active (ongoing), past (completed/canceled), or all
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Specific status filter (overrides filter param)
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [listings, purchases, sales, all]
 *           default: all
 *         description: Filter by item type
 *     responses:
 *       200:
 *         description: User's marketplace items categorized by type
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     listings:
 *                       type: array
 *                       items:
 *                         type: object
 *                       description: Items user is selling
 *                     purchases:
 *                       type: array
 *                       items:
 *                         type: object
 *                       description: Items user has purchased
 *                     sales:
 *                       type: array
 *                       items:
 *                         type: object
 *                       description: Items user has sold
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/my',
  authenticateToken,
  marketplaceController.getMyMarketplace.bind(marketplaceController)
);

// ============= LISTING ROUTES =============

router.post(
  '/listings',
  authenticateToken,
  requireTrustLevel(60, 'create marketplace listings'),
  createListingValidator,
  handleValidationErrors,
  marketplaceController.createListing.bind(marketplaceController)
);

router.get(
  '/listings',
  searchListingsValidator,
  handleValidationErrors,
  marketplaceController.searchListings.bind(marketplaceController)
);

router.get(
  '/listings/my',
  authenticateToken,
  marketplaceController.getMyListings.bind(marketplaceController)
);

router.get(
  '/listings/:id',
  listingIdValidator,
  handleValidationErrors,
  marketplaceController.getListing.bind(marketplaceController)
);

router.put(
  '/listings/:id',
  authenticateToken,
  updateListingValidator,
  handleValidationErrors,
  marketplaceController.updateListing.bind(marketplaceController)
);

router.delete(
  '/listings/:id',
  authenticateToken,
  listingIdValidator,
  handleValidationErrors,
  marketplaceController.deleteListing.bind(marketplaceController)
);

// ============= CART ROUTES =============

router.post(
  '/cart',
  authenticateToken,
  addToCartValidator,
  handleValidationErrors,
  marketplaceController.addToCart.bind(marketplaceController)
);

router.get(
  '/cart',
  authenticateToken,
  marketplaceController.getCart.bind(marketplaceController)
);

router.put(
  '/cart/:itemId',
  authenticateToken,
  updateCartItemValidator,
  handleValidationErrors,
  marketplaceController.updateCartItem.bind(marketplaceController)
);

router.delete(
  '/cart/:itemId',
  authenticateToken,
  cartItemIdValidator,
  handleValidationErrors,
  marketplaceController.removeFromCart.bind(marketplaceController)
);

router.delete(
  '/cart',
  authenticateToken,
  marketplaceController.clearCart.bind(marketplaceController)
);

// ============= ORDER ROUTES =============

router.post(
  '/orders',
  authenticateToken,
  createOrderValidator,
  handleValidationErrors,
  marketplaceController.createOrder.bind(marketplaceController)
);

router.get(
  '/orders/purchases',
  authenticateToken,
  searchOrdersValidator,
  handleValidationErrors,
  marketplaceController.getPurchases.bind(marketplaceController)
);

router.get(
  '/orders/sales',
  authenticateToken,
  searchOrdersValidator,
  handleValidationErrors,
  marketplaceController.getSales.bind(marketplaceController)
);

router.get(
  '/orders/:id',
  authenticateToken,
  orderIdValidator,
  handleValidationErrors,
  marketplaceController.getOrder.bind(marketplaceController)
);

router.put(
  '/orders/:id',
  authenticateToken,
  updateOrderValidator,
  handleValidationErrors,
  marketplaceController.updateOrder.bind(marketplaceController)
);

router.post(
  '/orders/:id/cancel',
  authenticateToken,
  orderIdValidator,
  handleValidationErrors,
  marketplaceController.cancelOrder.bind(marketplaceController)
);

// ============= REVIEW ROUTES =============

router.post(
  '/reviews',
  authenticateToken,
  createReviewValidator,
  handleValidationErrors,
  marketplaceController.createReview.bind(marketplaceController)
);

router.get(
  '/reviews/received',
  authenticateToken,
  marketplaceController.getReviewsReceived.bind(marketplaceController)
);

router.get(
  '/reviews/given',
  authenticateToken,
  marketplaceController.getReviewsGiven.bind(marketplaceController)
);

// ============= DISPUTE ROUTES =============

router.post(
  '/disputes',
  authenticateToken,
  createDisputeValidator,
  handleValidationErrors,
  marketplaceController.createDispute.bind(marketplaceController)
);

router.get(
  '/disputes/:id',
  authenticateToken,
  disputeIdValidator,
  handleValidationErrors,
  marketplaceController.getDispute.bind(marketplaceController)
);

router.put(
  '/disputes/:id',
  authenticateToken,
  updateDisputeValidator,
  handleValidationErrors,
  marketplaceController.updateDispute.bind(marketplaceController)
);

// ============= STATS ROUTES =============

/**
 * @swagger
 * /v2/marketplace/stats:
 *   get:
 *     summary: Get general marketplace statistics
 *     description: Returns overall marketplace statistics including total listings, orders, revenue, and top categories
 *     tags: [Marketplace]
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 */
router.get(
  '/stats',
  marketplaceController.getMarketplaceStats.bind(marketplaceController)
);

router.get(
  '/stats/seller',
  authenticateToken,
  marketplaceController.getSellerStats.bind(marketplaceController)
);

router.get(
  '/stats/buyer',
  authenticateToken,
  marketplaceController.getBuyerStats.bind(marketplaceController)
);

// ============= DISCOVERY ROUTES =============

router.get(
  '/discovery/trending',
  marketplaceController.getTrendingListings.bind(marketplaceController)
);

router.get(
  '/discovery/recommended',
  authenticateToken,
  marketplaceController.getRecommendedListings.bind(marketplaceController)
);

router.get(
  '/discovery/nearby',
  marketplaceController.getNearbyListings.bind(marketplaceController)
);

// ============= METADATA ROUTES =============

router.get(
  '/metadata/categories',
  marketplaceController.getCategories.bind(marketplaceController)
);

router.get(
  '/metadata/listing-statuses',
  marketplaceController.getListingStatuses.bind(marketplaceController)
);

router.get(
  '/metadata/order-statuses',
  marketplaceController.getOrderStatuses.bind(marketplaceController)
);

router.get(
  '/metadata/payment-statuses',
  marketplaceController.getPaymentStatuses.bind(marketplaceController)
);

router.get(
  '/metadata/currencies',
  marketplaceController.getCurrencies.bind(marketplaceController)
);

router.get(
  '/metadata/constants',
  marketplaceController.getConstants.bind(marketplaceController)
);

export default router;
