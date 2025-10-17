import { Request, Response } from 'express';
import { marketplaceService } from './marketplace.service';
import { AppError } from '../../middleware/error';
import {
  CreateListingRequest,
  UpdateListingRequest,
  AddToCartRequest,
  UpdateCartItemRequest,
  CreateOrderRequest,
  UpdateOrderRequest,
  CreateReviewRequest,
  CreateDisputeRequest,
  UpdateDisputeRequest,
  SearchListingsParams
} from './marketplace.types';

export class MarketplaceController {
  // ============= LISTING ENDPOINTS =============

  /**
   * @swagger
   * /api/v2/marketplace/listings:
   *   post:
   *     summary: Create a new marketplace listing
   *     tags: [Marketplace]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [title, price]
   *             properties:
   *               title:
   *                 type: string
   *               description:
   *                 type: string
   *               category:
   *                 type: string
   *               price:
   *                 type: number
   *               currency:
   *                 type: string
   *               quantity:
   *                 type: integer
   *               location:
   *                 type: string
   *               images:
   *                 type: array
   *                 items:
   *                   type: string
   *               status:
   *                 type: string
   *                 enum: [DRAFT, ACTIVE]
   *     responses:
   *       201:
   *         description: Listing created successfully
   *       400:
   *         description: Invalid input
   *       401:
   *         description: Unauthorized
   */
  async createListing(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const data: CreateListingRequest = req.body;

      const listing = await marketplaceService.createListing(userId, data);

      res.status(201).json({
        success: true,
        data: listing
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * @swagger
   * /api/v2/marketplace/listings/{id}:
   *   put:
   *     summary: Update a listing
   *     tags: [Marketplace]
   *     security:
   *       - bearerAuth: []
   */
  async updateListing(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const data: UpdateListingRequest = req.body;

      const listing = await marketplaceService.updateListing(id, userId, data);

      res.json({
        success: true,
        data: listing
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * @swagger
   * /api/v2/marketplace/listings/{id}:
   *   get:
   *     summary: Get a listing by ID
   *     tags: [Marketplace]
   */
  async getListing(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const listing = await marketplaceService.getListing(id);

      res.json({
        success: true,
        data: listing
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * @swagger
   * /api/v2/marketplace/listings:
   *   get:
   *     summary: Search marketplace listings
   *     tags: [Marketplace]
   */
  async searchListings(req: Request, res: Response) {
    try {
      const params: SearchListingsParams = {
        query: req.query.query as string,
        category: req.query.category as string,
        minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
        maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
        location: req.query.location as string,
        status: req.query.status as any,
        sellerId: req.query.sellerId as string,
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        sortBy: req.query.sortBy as any,
        sortOrder: req.query.sortOrder as any
      };

      const result = await marketplaceService.searchListings(params);

      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * @swagger
   * /api/v2/marketplace/listings/{id}:
   *   delete:
   *     summary: Delete a listing
   *     tags: [Marketplace]
   *     security:
   *       - bearerAuth: []
   */
  async deleteListing(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      await marketplaceService.deleteListing(id, userId);

      res.json({
        success: true,
        message: 'Listing deleted successfully'
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * @swagger
   * /api/v2/marketplace/listings/my:
   *   get:
   *     summary: Get current user's listings
   *     tags: [Marketplace]
   *     security:
   *       - bearerAuth: []
   */
  async getMyListings(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const status = req.query.status as any;

      const result = await marketplaceService.searchListings({
        sellerId: userId,
        status,
        page,
        limit
      });

      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      throw error;
    }
  }

  // ============= CART ENDPOINTS =============

  /**
   * @swagger
   * /api/v2/marketplace/cart:
   *   post:
   *     summary: Add item to cart
   *     tags: [Marketplace]
   *     security:
   *       - bearerAuth: []
   */
  async addToCart(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const data: AddToCartRequest = req.body;

      const cartItem = await marketplaceService.addToCart(userId, data);

      res.status(201).json({
        success: true,
        data: cartItem
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * @swagger
   * /api/v2/marketplace/cart:
   *   get:
   *     summary: Get user's cart
   *     tags: [Marketplace]
   *     security:
   *       - bearerAuth: []
   */
  async getCart(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const cartItems = await marketplaceService.getCart(userId);

      res.json({
        success: true,
        data: cartItems
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * @swagger
   * /api/v2/marketplace/cart/{itemId}:
   *   put:
   *     summary: Update cart item quantity
   *     tags: [Marketplace]
   *     security:
   *       - bearerAuth: []
   */
  async updateCartItem(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { itemId } = req.params;
      const data: UpdateCartItemRequest = req.body;

      const cartItem = await marketplaceService.updateCartItem(itemId, userId, data);

      res.json({
        success: true,
        data: cartItem
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * @swagger
   * /api/v2/marketplace/cart/{itemId}:
   *   delete:
   *     summary: Remove item from cart
   *     tags: [Marketplace]
   *     security:
   *       - bearerAuth: []
   */
  async removeFromCart(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { itemId } = req.params;

      await marketplaceService.removeFromCart(itemId, userId);

      res.json({
        success: true,
        message: 'Item removed from cart'
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * @swagger
   * /api/v2/marketplace/cart:
   *   delete:
   *     summary: Clear entire cart
   *     tags: [Marketplace]
   *     security:
   *       - bearerAuth: []
   */
  async clearCart(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      await marketplaceService.clearCart(userId);

      res.json({
        success: true,
        message: 'Cart cleared successfully'
      });
    } catch (error) {
      throw error;
    }
  }

  // ============= ORDER ENDPOINTS =============

  /**
   * @swagger
   * /api/v2/marketplace/orders:
   *   post:
   *     summary: Create an order
   *     tags: [Marketplace]
   *     security:
   *       - bearerAuth: []
   */
  async createOrder(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const data: CreateOrderRequest = req.body;

      const order = await marketplaceService.createOrder(userId, data);

      res.status(201).json({
        success: true,
        data: order
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * @swagger
   * /api/v2/marketplace/orders/{id}:
   *   get:
   *     summary: Get order by ID
   *     tags: [Marketplace]
   *     security:
   *       - bearerAuth: []
   */
  async getOrder(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const order = await marketplaceService.getOrder(id, userId);

      res.json({
        success: true,
        data: order
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * @swagger
   * /api/v2/marketplace/orders/purchases:
   *   get:
   *     summary: Get user's purchases
   *     tags: [Marketplace]
   *     security:
   *       - bearerAuth: []
   */
  async getPurchases(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const status = req.query.status as any;

      const result = await marketplaceService.getUserOrders(userId, 'buyer', {
        page,
        limit,
        status
      });

      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * @swagger
   * /api/v2/marketplace/orders/sales:
   *   get:
   *     summary: Get user's sales
   *     tags: [Marketplace]
   *     security:
   *       - bearerAuth: []
   */
  async getSales(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const status = req.query.status as any;

      const result = await marketplaceService.getUserOrders(userId, 'seller', {
        page,
        limit,
        status
      });

      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * @swagger
   * /api/v2/marketplace/orders/{id}:
   *   put:
   *     summary: Update order status
   *     tags: [Marketplace]
   *     security:
   *       - bearerAuth: []
   */
  async updateOrder(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const data: UpdateOrderRequest = req.body;

      const order = await marketplaceService.updateOrder(id, userId, data);

      res.json({
        success: true,
        data: order
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * @swagger
   * /api/v2/marketplace/orders/{id}/cancel:
   *   post:
   *     summary: Cancel an order
   *     tags: [Marketplace]
   *     security:
   *       - bearerAuth: []
   */
  async cancelOrder(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const order = await marketplaceService.cancelOrder(id, userId);

      res.json({
        success: true,
        data: order
      });
    } catch (error) {
      throw error;
    }
  }

  // ============= REVIEW ENDPOINTS =============

  /**
   * @swagger
   * /api/v2/marketplace/reviews:
   *   post:
   *     summary: Create a review
   *     tags: [Marketplace]
   *     security:
   *       - bearerAuth: []
   */
  async createReview(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const data: CreateReviewRequest = req.body;

      const review = await marketplaceService.createReview(userId, data);

      res.status(201).json({
        success: true,
        data: review
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * @swagger
   * /api/v2/marketplace/reviews/received:
   *   get:
   *     summary: Get reviews received by user
   *     tags: [Marketplace]
   *     security:
   *       - bearerAuth: []
   */
  async getReviewsReceived(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;

      const result = await marketplaceService.getUserReviews(userId, 'reviewee', {
        page,
        limit
      });

      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * @swagger
   * /api/v2/marketplace/reviews/given:
   *   get:
   *     summary: Get reviews given by user
   *     tags: [Marketplace]
   *     security:
   *       - bearerAuth: []
   */
  async getReviewsGiven(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;

      const result = await marketplaceService.getUserReviews(userId, 'reviewer', {
        page,
        limit
      });

      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      throw error;
    }
  }

  // ============= DISPUTE ENDPOINTS =============

  /**
   * @swagger
   * /api/v2/marketplace/disputes:
   *   post:
   *     summary: Create a dispute
   *     tags: [Marketplace]
   *     security:
   *       - bearerAuth: []
   */
  async createDispute(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const data: CreateDisputeRequest = req.body;

      const dispute = await marketplaceService.createDispute(userId, data);

      res.status(201).json({
        success: true,
        data: dispute
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * @swagger
   * /api/v2/marketplace/disputes/{id}:
   *   get:
   *     summary: Get dispute by ID
   *     tags: [Marketplace]
   *     security:
   *       - bearerAuth: []
   */
  async getDispute(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const dispute = await marketplaceService.getDispute(id, userId);

      res.json({
        success: true,
        data: dispute
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * @swagger
   * /api/v2/marketplace/disputes/{id}:
   *   put:
   *     summary: Update dispute
   *     tags: [Marketplace]
   *     security:
   *       - bearerAuth: []
   */
  async updateDispute(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const data: UpdateDisputeRequest = req.body;

      const dispute = await marketplaceService.updateDispute(id, userId, data);

      res.json({
        success: true,
        data: dispute
      });
    } catch (error) {
      throw error;
    }
  }

  // ============= STATS ENDPOINTS =============

  /**
   * @swagger
   * /api/v2/marketplace/stats/seller:
   *   get:
   *     summary: Get seller statistics
   *     tags: [Marketplace]
   *     security:
   *       - bearerAuth: []
   */
  async getSellerStats(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const stats = await marketplaceService.getSellerStats(userId);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * @swagger
   * /api/v2/marketplace/stats/buyer:
   *   get:
   *     summary: Get buyer statistics
   *     tags: [Marketplace]
   *     security:
   *       - bearerAuth: []
   */
  async getBuyerStats(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const stats = await marketplaceService.getBuyerStats(userId);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      throw error;
    }
  }
}

export const marketplaceController = new MarketplaceController();
