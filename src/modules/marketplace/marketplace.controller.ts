import { Request, Response } from 'express';
import { marketplaceService } from './marketplace.service';
import { AppError } from '../../middleware/error';
import logger from '../../utils/logger';
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
   *     description: |
   *       Create a new marketplace listing.
   *       
   *       **Steps to create a listing with images:**
   *       1. First upload images using POST /v2/marketplace/upload-images
   *       2. Use the returned `imageKeys` (not full URLs) in the `images` array when creating the listing
   *       3. API will automatically convert keys to full CDN URLs in responses
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
   *                 example: "iPhone 13 Pro Max"
   *               description:
   *                 type: string
   *                 example: "Excellent condition, barely used. Includes original box and accessories."
   *               category:
   *                 type: string
   *                 example: "Electronics"
   *               price:
   *                 type: number
   *                 example: 4500
   *               currency:
   *                 type: string
   *                 example: "MYR"
   *               quantity:
   *                 type: integer
   *                 example: 1
   *               location:
   *                 type: string
   *                 example: "Kuala Lumpur"
   *               images:
   *                 type: array
   *                 items:
   *                   type: string
   *                 description: Array of image keys/paths from upload endpoint (not full URLs)
   *                 example: ["marketplace/userId/timestamp-hash1.jpg", "marketplace/userId/timestamp-hash2.jpg"]
   *               status:
   *                 type: string
   *                 enum: [DRAFT, ACTIVE]
   *                 example: "ACTIVE"
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
      const userId = (req as any).user?.userId;
      const listing = await marketplaceService.getListing(id, userId);

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
      const userId = (req as any).user?.userId;
      const params: SearchListingsParams = {
        query: req.query.query as string,
        category: req.query.category as string,
        minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
        maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
        location: req.query.location as string,
        status: req.query.status as any,
        sellerId: req.query.sellerId as string,
        excludeUserId: userId,
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
   * Get my Marketplace items
   * GET /api/v2/marketplace/my?filter=active&type=all&status=ACTIVE
   */
  async getMyMarketplace(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { filter, status, type } = req.query;

      const data = await marketplaceService.getMyMarketplace(userId, {
        filter: filter as any,
        status: status as any,
        type: type as any,
      });

      res.json({
        success: true,
        data,
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
   * /v2/marketplace/stats:
   *   get:
   *     summary: Get general marketplace statistics
   *     tags: [Marketplace]
   *     responses:
   *       200:
   *         description: Marketplace statistics retrieved successfully
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
   *                     totalListings:
   *                       type: integer
   *                       example: 1250
   *                     activeListings:
   *                       type: integer
   *                       example: 856
   *                     totalOrders:
   *                       type: integer
   *                       example: 523
   *                     totalRevenue:
   *                       type: number
   *                       example: 125430.50
   *                     averageOrderValue:
   *                       type: number
   *                       example: 239.75
   *                     topCategories:
   *                       type: array
   *                       items:
   *                         type: object
   *                         properties:
   *                           category:
   *                             type: string
   *                           count:
   *                             type: integer
   *                           revenue:
   *                             type: number
   */
  async getMarketplaceStats(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const stats = await marketplaceService.getMarketplaceStats(userId);

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

  // ============= DISCOVERY ENDPOINTS =============

  /**
   * @swagger
   * /api/v2/marketplace/discovery/trending:
   *   get:
   *     summary: Get trending marketplace listings
   *     tags: [Marketplace - Discovery]
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *       - in: query
   *         name: category
   *         schema:
   *           type: string
   *       - in: query
   *         name: location
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Trending listings retrieved successfully
   */
  async getTrendingListings(req: Request, res: Response) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const category = req.query.category as string;
      const location = req.query.location as string;

      const result = await marketplaceService.getTrendingListings({
        page,
        limit,
        category,
        location
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
   * /api/v2/marketplace/discovery/recommended:
   *   get:
   *     summary: Get recommended marketplace listings based on user interests
   *     tags: [Marketplace - Discovery]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *       - in: query
   *         name: category
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Recommended listings retrieved successfully
   *       401:
   *         description: Unauthorized
   */
  async getRecommendedListings(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const category = req.query.category as string;

      const result = await marketplaceService.getRecommendedListings(userId, {
        page,
        limit,
        category
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
   * /api/v2/marketplace/discovery/nearby:
   *   get:
   *     summary: Get nearby marketplace listings
   *     tags: [Marketplace - Discovery]
   *     parameters:
   *       - in: query
   *         name: location
   *         required: true
   *         schema:
   *           type: string
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *       - in: query
   *         name: category
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Nearby listings retrieved successfully
   *       400:
   *         description: Location parameter required
   */
  async getNearbyListings(req: Request, res: Response) {
    try {
      const location = req.query.location as string;

      if (!location) {
        throw new AppError('Location parameter is required', 400);
      }

      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const category = req.query.category as string;

      const result = await marketplaceService.getNearbyListings(location, {
        page,
        limit,
        category
      });

      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      throw error;
    }
  }

  // ============= METADATA ENDPOINTS =============

  /**
   * @swagger
   * /api/v2/marketplace/metadata/categories:
   *   get:
   *     summary: Get all marketplace listing categories
   *     description: Returns list of all available product categories for filtering and listing creation
   *     tags: [Marketplace - Metadata]
   *     responses:
   *       200:
   *         description: List of listing categories
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       value:
   *                         type: string
   *                         example: "Electronics"
   *                       label:
   *                         type: string
   *                         example: "Electronics"
   */
  async getCategories(req: Request, res: Response) {
    try {
      res.json({
        success: true,
        data: marketplaceService.getCategories()
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * @swagger
   * /api/v2/marketplace/metadata/listing-statuses:
   *   get:
   *     summary: Get all listing status options
   *     description: Returns all possible listing statuses with descriptions
   *     tags: [Marketplace - Metadata]
   *     responses:
   *       200:
   *         description: List of listing statuses
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       value:
   *                         type: string
   *                         example: "ACTIVE"
   *                       label:
   *                         type: string
   *                         example: "Active"
   *                       description:
   *                         type: string
   *                         example: "Listing is live and available for purchase"
   */
  async getListingStatuses(req: Request, res: Response) {
    try {
      res.json({
        success: true,
        data: marketplaceService.getListingStatuses()
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * @swagger
   * /api/v2/marketplace/metadata/order-statuses:
   *   get:
   *     summary: Get all order status options
   *     description: Returns all possible order statuses with descriptions for tracking
   *     tags: [Marketplace - Metadata]
   *     responses:
   *       200:
   *         description: List of order statuses
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       value:
   *                         type: string
   *                         example: "DELIVERED"
   *                       label:
   *                         type: string
   *                         example: "Delivered"
   *                       description:
   *                         type: string
   *                         example: "Order has been delivered"
   */
  async getOrderStatuses(req: Request, res: Response) {
    try {
      res.json({
        success: true,
        data: marketplaceService.getOrderStatuses()
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * @swagger
   * /api/v2/marketplace/metadata/payment-statuses:
   *   get:
   *     summary: Get all payment status options
   *     description: Returns all possible payment statuses for transaction tracking
   *     tags: [Marketplace - Metadata]
   *     responses:
   *       200:
   *         description: List of payment statuses
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       value:
   *                         type: string
   *                         example: "SUCCEEDED"
   *                       label:
   *                         type: string
   *                         example: "Succeeded"
   *                       description:
   *                         type: string
   *                         example: "Payment completed successfully"
   */
  async getPaymentStatuses(req: Request, res: Response) {
    try {
      res.json({
        success: true,
        data: marketplaceService.getPaymentStatuses()
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * @swagger
   * /api/v2/marketplace/metadata/currencies:
   *   get:
   *     summary: Get supported currencies
   *     description: Returns all currencies supported for marketplace transactions
   *     tags: [Marketplace - Metadata]
   *     responses:
   *       200:
   *         description: List of supported currencies
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       code:
   *                         type: string
   *                         example: "MYR"
   *                       symbol:
   *                         type: string
   *                         example: "RM"
   *                       name:
   *                         type: string
   *                         example: "Malaysian Ringgit"
   *                       isDefault:
   *                         type: boolean
   *                         example: true
   */
  async getCurrencies(req: Request, res: Response) {
    try {
      res.json({
        success: true,
        data: marketplaceService.getCurrencies()
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * @swagger
   * /api/v2/marketplace/metadata/constants:
   *   get:
   *     summary: Get marketplace constants (limits, fees, etc)
   *     description: Returns marketplace configuration including limits, fees, and default values
   *     tags: [Marketplace - Metadata]
   *     responses:
   *       200:
   *         description: Marketplace configuration constants
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
   *                     maxImagesPerListing:
   *                       type: number
   *                       example: 10
   *                     maxCartItems:
   *                       type: number
   *                       example: 50
   *                     maxQuantityPerItem:
   *                       type: number
   *                       example: 100
   *                     minRating:
   *                       type: number
   *                       example: 1
   *                     maxRating:
   *                       type: number
   *                       example: 5
   *                     orderExpiryDays:
   *                       type: number
   *                       example: 30
   *                     platformFeePercentage:
   *                       type: number
   *                       example: 5
   *                     defaultCurrency:
   *                       type: string
   *                       example: "MYR"
   */
  async getConstants(req: Request, res: Response) {
    try {
      res.json({
        success: true,
        data: marketplaceService.getConstants()
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Upload listing image(s)
   * @route POST /v2/marketplace/upload-images
   */
  async uploadListingImages(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        throw new AppError('No image files provided', 400);
      }

      // Check max images limit
      const MAX_IMAGES = 10; // MARKETPLACE_CONSTANTS.MAX_IMAGES_PER_LISTING
      if (files.length > MAX_IMAGES) {
        throw new AppError(`Maximum ${MAX_IMAGES} images allowed per upload`, 400);
      }

      // Upload all images to storage
      const { storageService } = await import('../../services/storage.service');
      
      const uploadPromises = files.map(file =>
        storageService.uploadFile(file, 'marketplace', {
          optimize: true,
          isPublic: true,
          userId,
        })
      );

      const uploadResults = await Promise.all(uploadPromises);

      // Store only the keys (paths), not full URLs
      // The frontend/app will construct full URLs using CDN endpoint
      const imageKeys = uploadResults.map(result => result.key);
      const imageUrls = uploadResults.map(result => result.url);

      logger.info('Marketplace images uploaded', {
        userId,
        count: imageKeys.length,
        keys: imageKeys,
        urls: imageUrls,
      });

      res.json({
        success: true,
        data: {
          imageKeys,  // Use these when creating listings
          imageUrls,  // Full URLs for preview/reference
          count: imageKeys.length
        },
        message: `${imageKeys.length} image(s) uploaded successfully`
      });
    } catch (error) {
      throw error;
    }
  }
}

export const marketplaceController = new MarketplaceController();
