import { Router } from 'express';
import { marketplaceController } from './marketplace.controller';
import { authenticateToken } from '../../middleware/auth';
import { handleValidationErrors } from '../../middleware/validation';
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

// ============= LISTING ROUTES =============

router.post(
  '/listings',
  authenticateToken,
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

export default router;
