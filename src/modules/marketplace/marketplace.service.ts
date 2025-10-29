import { PrismaClient, ListingStatus, OrderStatus, DisputeStatus, PaymentStatus, TransactionType, PaymentMethodType, PriceStructureType, ListingType } from '@prisma/client';
import {
  CreateListingRequest,
  UpdateListingRequest,
  ListingFilters,
  AddToCartRequest,
  UpdateCartItemRequest,
  CreateOrderRequest,
  UpdateOrderRequest,
  CreateReviewRequest,
  CreateDisputeRequest,
  UpdateDisputeRequest,
  OrderFilters,
  ListingResponse,
  OrderResponse,
  CartItemResponse,
  ReviewResponse,
  DisputeResponse,
  SellerStats,
  BuyerStats,
  MarketplaceStats,
  PaginationParams,
  PaginatedResponse,
  SearchListingsParams,
  MARKETPLACE_CONSTANTS
} from './marketplace.types';
import { AppError } from '../../middleware/error';
import { ActivityLoggerService } from '../../services/activityLogger.service';
import { PaymentService } from '../payments/payment.service';
import { NotificationService } from '../../services/notification.service';
import { emailService } from '../../services/email.service';
import logger from '../../utils/logger';

const prisma = new PrismaClient();
const paymentService = new PaymentService();

export class MarketplaceService {
  // ============= LISTING METHODS =============

  async createListing(userId: string, data: CreateListingRequest): Promise<ListingResponse> {
    // Validate images count
    if (data.images && data.images.length > MARKETPLACE_CONSTANTS.MAX_IMAGES_PER_LISTING) {
      throw new AppError(
        `Maximum ${MARKETPLACE_CONSTANTS.MAX_IMAGES_PER_LISTING} images allowed`, 
        400
      );
    }

    const listing = await prisma.marketplaceListing.create({
      data: {
        userId,
        type: data.type || ListingType.PRODUCT,
        title: data.title,
        description: data.description,
        category: data.category,
        quantity: data.quantity,
        location: data.location,
        images: data.images || [],
        status: data.status || ListingStatus.DRAFT,
        pricingOptions: {
          create: {
            pricingType: PaymentMethodType.MONEY,
            priceStructure: PriceStructureType.FIXED,
            price: data.price,
            currency: data.currency || MARKETPLACE_CONSTANTS.CURRENCY,
            isDefault: true,
            displayOrder: 1
          }
        }
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            username: true,
            trustScore: true
          }
        },
        pricingOptions: true,
        priceHistory: true
      }
    });

    // Update user stat for listing creation
    try {
      const { UserStatService } = await import('../user/user-stat.service');
      await UserStatService.incrementListingsPosted(userId);
    } catch (error) {
      console.error('Failed to update user stat for listing creation:', error);
    }

    // Log activity

    return this.formatListingResponse(listing);
  }

  async updateListing(
    listingId: string, 
    userId: string, 
    data: UpdateListingRequest
  ): Promise<ListingResponse> {
    // Check ownership
    const existingListing = await prisma.marketplaceListing.findUnique({
      where: { id: listingId }
    });

    if (!existingListing) {
      throw new AppError('Listing not found', 404);
    }

    if (existingListing.userId !== userId) {
      throw new AppError('You do not have permission to update this listing', 403);
    }

    // Track price change in pricingOptions if needed
    const existingPricing = await prisma.marketplacePricingOption.findFirst({
      where: { listingId, isDefault: true }
    });
    
    if (data.price && existingPricing && data.price !== existingPricing.price) {
      await prisma.listingPriceHistory.create({
        data: {
          listingId,
          price: data.price,
          currency: data.currency || existingPricing.currency || MARKETPLACE_CONSTANTS.CURRENCY,
          reason: 'Price updated by seller'
        }
      });
    }

    // Update pricing option if price changed
    if (data.price !== undefined || data.currency !== undefined) {
      const defaultPricing = await prisma.marketplacePricingOption.findFirst({
        where: { listingId, isDefault: true }
      });
      
      if (defaultPricing) {
        await prisma.marketplacePricingOption.update({
          where: { id: defaultPricing.id },
          data: {
            price: data.price,
            currency: data.currency
          }
        });
      }
    }

    const listing = await prisma.marketplaceListing.update({
      where: { id: listingId },
      data: {
        title: data.title,
        description: data.description,
        category: data.category,
        quantity: data.quantity,
        location: data.location,
        images: data.images,
        status: data.status
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            username: true,
            trustScore: true
          }
        },
        pricingOptions: true,
        priceHistory: true
      }
    });

    // Check for low stock and send notification (threshold: 5 items)
    if (data.quantity !== undefined && data.quantity > 0 && data.quantity <= 5) {
      // Only notify if quantity was higher before (don't spam on every update)
      if (existingListing.quantity > 5 || existingListing.quantity > data.quantity) {
        await NotificationService.notifyLowStock(
          userId,
          listing.title,
          listingId,
          data.quantity
        );
      }
    }

    // Log activity - TODO: Implement marketplace activity logging

    return this.formatListingResponse(listing);
  }

  async getListing(listingId: string, userId?: string): Promise<ListingResponse> {
    const listing = await prisma.marketplaceListing.findUnique({
      where: { id: listingId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            username: true,
            trustScore: true
          }
        },
        priceHistory: {
          orderBy: { changedAt: 'desc' },
          take: 10
        }
      }
    });

    if (!listing) {
      throw new AppError('Listing not found', 404);
    }

    // Get average rating for seller
    const reviews = await prisma.marketplaceReview.findMany({
      where: { revieweeId: listing.userId },
      select: { rating: true }
    });

    const averageRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : undefined;

    // Check if listing is in user's cart
    let isInCart = false;
    if (userId) {
      const cartItem = await prisma.marketplaceCartItem.findFirst({
        where: {
          userId,
          listingId
        }
      });
      isInCart = !!cartItem;
    }

    // Get other listings from same seller (max 6)
    const otherListingsFromSeller = await prisma.marketplaceListing.findMany({
      where: {
        userId: listing.userId,
        id: { not: listingId },
        status: ListingStatus.ACTIVE
      },
      select: {
        id: true,
        title: true,
        images: true,
        status: true,
        location: true,
        category: true,
        createdAt: true,
        pricingOptions: true
      },
      take: 6,
      orderBy: { createdAt: 'desc' }
    });

    // Get similar listings (same category, different seller, exclude current user)
    const similarWhere: any = {
      category: listing.category,
      id: { not: listingId },
      userId: { not: listing.userId },
      status: ListingStatus.ACTIVE
    };
    
    // Also exclude authenticated user's own listings from similar listings
    if (userId && userId !== listing.userId) {
      similarWhere.AND = [
        { userId: { not: listing.userId } },
        { userId: { not: userId } }
      ];
      delete similarWhere.userId;
    }

    const similarListings = await prisma.marketplaceListing.findMany({
      where: similarWhere,
      select: {
        id: true,
        title: true,
        images: true,
        status: true,
        location: true,
        category: true,
        createdAt: true,
        pricingOptions: true
      },
      take: 6,
      orderBy: { createdAt: 'desc' }
    });

    return {
      ...this.formatListingResponse(listing),
      averageRating,
      totalReviews: reviews.length,
      isInCart,
      otherListingsFromSeller: otherListingsFromSeller.map(l => this.formatListingPreview(l)),
      similarListings: similarListings.map(l => this.formatListingPreview(l))
    };
  }

  async searchListings(params: SearchListingsParams): Promise<PaginatedResponse<ListingResponse>> {
    const {
      query,
      category,
      minPrice,
      maxPrice,
      location,
      status,
      sellerId,
      excludeUserId,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = params;

    const where: any = {
      status: status || ListingStatus.ACTIVE
    };

    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } }
      ];
    }

    if (category) where.category = category;
    if (sellerId) where.userId = sellerId;
    if (excludeUserId) where.userId = { not: excludeUserId };
    if (location) where.location = { contains: location, mode: 'insensitive' };
    
    // Price filtering now needs to be done via pricingOptions relation
    // TODO: Implement price filtering with pricingOptions join

    const [listings, total] = await Promise.all([
      prisma.marketplaceListing.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              username: true,
              trustScore: true
            }
          }
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.marketplaceListing.count({ where })
    ]);

    const formattedListings = listings.map(listing => this.formatListingResponse(listing));

    return {
      data: formattedListings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total
      }
    };
  }

  async deleteListing(listingId: string, userId: string): Promise<void> {
    const listing = await prisma.marketplaceListing.findUnique({
      where: { id: listingId }
    });

    if (!listing) {
      throw new AppError('Listing not found', 404);
    }

    if (listing.userId !== userId) {
      throw new AppError('You do not have permission to delete this listing', 403);
    }

    // Check for active orders
    const activeOrders = await prisma.marketplaceOrder.count({
      where: {
        listingId,
        status: {
          in: [OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.SHIPPED]
        }
      }
    });

    if (activeOrders > 0) {
      throw new AppError('Cannot delete listing with active orders', 400);
    }

    await prisma.marketplaceListing.delete({
      where: { id: listingId }
    });

    // Log activity
  }

  // ============= CART METHODS =============

  async addToCart(userId: string, data: AddToCartRequest): Promise<CartItemResponse> {
    // Check listing exists and is active
    const listing = await prisma.marketplaceListing.findUnique({
      where: { id: data.listingId }
    });

    if (!listing) {
      throw new AppError('Listing not found', 404);
    }

    if (listing.status !== ListingStatus.ACTIVE) {
      throw new AppError('This listing is not available', 400);
    }

    if (listing.userId === userId) {
      throw new AppError('You cannot add your own listing to cart', 400);
    }

    // Check quantity availability
    if (listing.quantity && data.quantity > listing.quantity) {
      throw new AppError('Requested quantity not available', 400);
    }

    // Check cart size
    const cartCount = await prisma.marketplaceCartItem.count({
      where: { userId }
    });

    if (cartCount >= MARKETPLACE_CONSTANTS.MAX_CART_ITEMS) {
      throw new AppError(`Cart cannot exceed ${MARKETPLACE_CONSTANTS.MAX_CART_ITEMS} items`, 400);
    }

    // Create or update cart item
    const cartItem = await prisma.marketplaceCartItem.upsert({
      where: {
        userId_listingId: {
          userId,
          listingId: data.listingId
        }
      },
      create: {
        userId,
        listingId: data.listingId,
        quantity: data.quantity
      },
      update: {
        quantity: { increment: data.quantity }
      },
      include: {
        marketplaceListings: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                username: true
              }
            }
          }
        }
      }
    });

    // Notify seller about item added to cart
    if (cartItem.marketplaceListings.userId) {
      await NotificationService.notifyItemAddedToCart(
        cartItem.marketplaceListings.userId,
        cartItem.marketplaceListings.title,
        cartItem.marketplaceListings.id
      );
    }

    return this.formatCartItemResponse(cartItem);
  }

  async getCart(userId: string): Promise<CartItemResponse[]> {
    const cartItems = await prisma.marketplaceCartItem.findMany({
      where: { userId },
      include: {
        marketplaceListings: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                username: true
              }
            }
          }
        }
      },
      orderBy: { addedAt: 'desc' }
    });

    return cartItems.map(item => this.formatCartItemResponse(item));
  }

  async updateCartItem(
    itemId: string, 
    userId: string, 
    data: UpdateCartItemRequest
  ): Promise<CartItemResponse> {
    const cartItem = await prisma.marketplaceCartItem.findUnique({
      where: { id: itemId }
    });

    if (!cartItem) {
      throw new AppError('Cart item not found', 404);
    }

    if (cartItem.userId !== userId) {
      throw new AppError('You do not have permission to update this cart item', 403);
    }

    // Check quantity availability
    const listing = await prisma.marketplaceListing.findUnique({
      where: { id: cartItem.listingId }
    });

    if (listing?.quantity && data.quantity > listing.quantity) {
      throw new AppError('Requested quantity not available', 400);
    }

    const updatedItem = await prisma.marketplaceCartItem.update({
      where: { id: itemId },
      data: { quantity: data.quantity },
      include: {
        marketplaceListings: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                username: true
              }
            }
          }
        }
      }
    });

    return this.formatCartItemResponse(updatedItem);
  }

  async removeFromCart(itemId: string, userId: string): Promise<void> {
    const cartItem = await prisma.marketplaceCartItem.findUnique({
      where: { id: itemId }
    });

    if (!cartItem) {
      throw new AppError('Cart item not found', 404);
    }

    if (cartItem.userId !== userId) {
      throw new AppError('You do not have permission to remove this cart item', 403);
    }

    await prisma.marketplaceCartItem.delete({
      where: { id: itemId }
    });
  }

  async clearCart(userId: string): Promise<void> {
    await prisma.marketplaceCartItem.deleteMany({
      where: { userId }
    });
  }

  // ============= ORDER METHODS =============

  async createOrder(userId: string, data: CreateOrderRequest): Promise<OrderResponse> {
    // Get listing details with pricing
    const listing = await prisma.marketplaceListing.findUnique({
      where: { id: data.listingId },
      include: { 
        user: true,
        pricingOptions: true
      }
    });

    if (!listing) {
      throw new AppError('Listing not found', 404);
    }

    if (listing.status !== ListingStatus.ACTIVE) {
      throw new AppError('This listing is not available', 400);
    }

    if (listing.userId === userId) {
      throw new AppError('You cannot purchase your own listing', 400);
    }

    // Check quantity
    if (listing.quantity && data.quantity > listing.quantity) {
      throw new AppError('Requested quantity not available', 400);
    }

    // Get default pricing option
    const defaultPricing = listing.pricingOptions.find(p => p.isDefault) || listing.pricingOptions[0];
    if (!defaultPricing || !defaultPricing.price) {
      throw new AppError('Listing has no valid pricing', 400);
    }

    // Calculate amounts
    const unitPrice = defaultPricing.price;
    const subtotal = unitPrice * data.quantity;
    const shippingFee = listing.shippingFee || 0;
    const platformFee = subtotal * (MARKETPLACE_CONSTANTS.PLATFORM_FEE_PERCENTAGE / 100);
    const sellerPayout = subtotal - platformFee;
    const totalAmount = subtotal + shippingFee;

    // Create payment intent
    const paymentIntent = await paymentService.createPaymentIntent(userId, {
      amount: totalAmount,
      currency: defaultPricing.currency || MARKETPLACE_CONSTANTS.CURRENCY,
      transactionType: TransactionType.MARKETPLACE_ORDER,
      referenceType: 'MARKETPLACE_ORDER',
      referenceId: '', // Will be updated with order ID
      providerId: data.providerId,
      description: `Purchase: ${listing.title}`,
      metadata: {
        listingId: data.listingId,
        quantity: data.quantity,
        sellerId: listing.userId,
      },
    });

    // Create order
    const order = await prisma.marketplaceOrder.create({
      data: {
        listingId: data.listingId,
        pricingOptionId: defaultPricing.id,
        buyerId: userId,
        sellerId: listing.userId,
        orderType: listing.type,
        quantity: data.quantity,
        pricingType: defaultPricing.pricingType,
        priceStructure: defaultPricing.priceStructure,
        unitPrice,
        subtotal,
        shippingFee,
        totalAmount,
        platformFee,
        sellerPayout,
        currency: defaultPricing.currency || MARKETPLACE_CONSTANTS.CURRENCY,
        shippingAddress: data.shippingAddress,
        buyerNotes: data.notes,
        status: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
        paymentTransactionId: paymentIntent.transactionId,
      },
      include: {
        marketplaceListings: {
          select: {
            id: true,
            title: true,
            images: true
          }
        },
        users_marketplace_orders_buyerIdTousers: {
          select: {
            id: true,
            fullName: true,
            username: true,
          }
        },
        users_marketplace_orders_sellerIdTousers: {
          select: {
            id: true,
            fullName: true,
            username: true,
          }
        }
      }
    });

    // Update payment transaction with order ID
    await prisma.paymentTransaction.update({
      where: { id: paymentIntent.transactionId },
      data: { referenceId: order.id },
    });

    // Remove from cart if exists
    await prisma.marketplaceCartItem.deleteMany({
      where: {
        userId,
        listingId: data.listingId
      }
    });

    // Notify seller about new order
    await NotificationService.notifyNewOrder(
      order.sellerId,
      order.users_marketplace_orders_buyerIdTousers.fullName,
      order.marketplaceListings.title,
      order.id,
      order.totalAmount,
      order.currency
    );

    // Log activity

    // Return order with payment intent details
    const orderResponse = this.formatOrderResponse(order);
    return {
      ...orderResponse,
      paymentIntent: {
        transactionId: paymentIntent.transactionId,
        clientSecret: paymentIntent.clientSecret,
        expiresAt: paymentIntent.expiresAt,
      },
    };
  }

  async getOrder(orderId: string, userId: string): Promise<OrderResponse> {
    const order = await prisma.marketplaceOrder.findUnique({
      where: { id: orderId },
      include: {
        marketplaceListings: {
          select: {
            id: true,
            title: true,
            images: true
          }
        },
        users_marketplace_orders_buyerIdTousers: {
          select: {
            id: true,
            fullName: true,
            username: true,
          }
        },
        users_marketplace_orders_sellerIdTousers: {
          select: {
            id: true,
            fullName: true,
            username: true,
          }
        },
        reviews: true,
        marketplaceDisputes: true
      }
    });

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    // Check permission
    if (order.buyerId !== userId && order.sellerId !== userId) {
      throw new AppError('You do not have permission to view this order', 403);
    }

    return this.formatOrderResponse(order);
  }

  /**
   * Get my Marketplace items (listings + orders)
   */
  async getMyMarketplace(
    userId: string,
    filters?: {
      filter?: 'active' | 'past' | 'all';
      status?: any;
      type?: 'purchases' | 'sales' | 'listings' | 'all';
    }
  ): Promise<{
    listings: any[];
    purchases: any[];
    sales: any[];
  }> {
    try {
      const { filter = 'all', status, type = 'all' } = filters || {};

      let listings: any[] = [];
      let purchases: any[] = [];
      let sales: any[] = [];

      // Fetch listings if requested
      if (type === 'listings' || type === 'all') {
        const listingWhere: any = { userId: userId };
        
        if (status) {
          listingWhere.status = status;
        } else if (filter === 'active') {
          listingWhere.status = 'ACTIVE';
        } else if (filter === 'past') {
          listingWhere.status = { in: ['SOLD', 'DELETED'] };
        }

        listings = await prisma.marketplaceListing.findMany({
          where: listingWhere,
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                username: true,
                profile: {
                  select: {
                    profilePicture: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        });
      }

      // Fetch purchases if requested
      if (type === 'purchases' || type === 'all') {
        const purchaseWhere: any = { buyerId: userId };
        
        if (status) {
          purchaseWhere.status = status;
        } else if (filter === 'active') {
          purchaseWhere.status = { in: ['PENDING', 'CONFIRMED', 'SHIPPED'] };
        } else if (filter === 'past') {
          purchaseWhere.status = { in: ['DELIVERED', 'CANCELED', 'REFUNDED'] };
        }

        purchases = await prisma.marketplaceOrder.findMany({
          where: purchaseWhere,
          include: {
            marketplaceListings: {
              select: {
                id: true,
                title: true,
                images: true,
              },
            },
            users_marketplace_orders_sellerIdTousers: {
              select: {
                id: true,
                fullName: true,
                username: true,
                profile: {
                  select: {
                    profilePicture: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        });
      }

      // Fetch sales if requested
      if (type === 'sales' || type === 'all') {
        const salesWhere: any = { sellerId: userId };
        
        if (status) {
          salesWhere.status = status;
        } else if (filter === 'active') {
          salesWhere.status = { in: ['PENDING', 'CONFIRMED', 'SHIPPED'] };
        } else if (filter === 'past') {
          salesWhere.status = { in: ['DELIVERED', 'CANCELED', 'REFUNDED'] };
        }

        sales = await prisma.marketplaceOrder.findMany({
          where: salesWhere,
          include: {
            marketplaceListings: {
              select: {
                id: true,
                title: true,
                images: true,
              },
            },
            users_marketplace_orders_buyerIdTousers: {
              select: {
                id: true,
                fullName: true,
                username: true,
                profile: {
                  select: {
                    profilePicture: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        });
      }

      return {
        listings: listings.map(this.formatListingResponse),
        purchases: purchases.map(this.formatOrderResponse),
        sales: sales.map(this.formatOrderResponse),
      };
    } catch (error) {
      logger.error('Failed to get my Marketplace', { error, userId, filters });
      throw error;
    }
  }

  async getUserOrders(
    userId: string,
    role: 'buyer' | 'seller',
    params: PaginationParams & { status?: OrderStatus }
  ): Promise<PaginatedResponse<OrderResponse>> {
    const { page = 1, limit = 20, status, sortBy = 'createdAt', sortOrder = 'desc' } = params;

    const where: any = role === 'buyer' ? { buyerId: userId } : { sellerId: userId };
    if (status) where.status = status;

    const [orders, total] = await Promise.all([
      prisma.marketplaceOrder.findMany({
        where,
        include: {
          marketplaceListings: {
            select: {
              id: true,
              title: true,
              images: true
            }
          },
          users_marketplace_orders_buyerIdTousers: {
            select: {
              id: true,
              fullName: true,
              username: true,
            }
          },
          users_marketplace_orders_sellerIdTousers: {
            select: {
              id: true,
              fullName: true,
              username: true,
            }
          }
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.marketplaceOrder.count({ where })
    ]);

    const formattedOrders = orders.map(order => this.formatOrderResponse(order));

    return {
      data: formattedOrders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total
      }
    };
  }

  async updateOrder(
    orderId: string, 
    userId: string, 
    data: UpdateOrderRequest
  ): Promise<OrderResponse> {
    const order = await prisma.marketplaceOrder.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    // Only seller can update order
    if (order.sellerId !== userId) {
      throw new AppError('You do not have permission to update this order', 403);
    }

    // Validate status transitions
    if (data.status) {
      this.validateOrderStatusTransition(order.status, data.status);
    }

    const updateData: any = {
      trackingNumber: data.trackingNumber,
      notes: data.notes
    };

    if (data.status) {
      updateData.status = data.status;
      
      // Update timestamps
      if (data.status === OrderStatus.CONFIRMED) updateData.confirmedAt = new Date();
      if (data.status === OrderStatus.SHIPPED) updateData.shippedAt = new Date();
      if (data.status === OrderStatus.DELIVERED) updateData.deliveredAt = new Date();
      if (data.status === OrderStatus.CANCELED) updateData.canceledAt = new Date();
    }

    const updatedOrder = await prisma.marketplaceOrder.update({
      where: { id: orderId },
      data: updateData,
      include: {
        marketplaceListings: {
          select: {
            id: true,
            title: true,
            images: true
          }
        },
        users_marketplace_orders_buyerIdTousers: {
          select: {
            id: true,
            fullName: true,
            username: true,
            email: true,
          }
        },
        users_marketplace_orders_sellerIdTousers: {
          select: {
            id: true,
            fullName: true,
            username: true,
          }
        }
      }
    });

    // Update listing quantity if delivered
    if (data.status === OrderStatus.DELIVERED) {
      await prisma.marketplaceListing.update({
        where: { id: order.listingId },
        data: {
          quantity: {
            decrement: order.quantity
          }
        }
      });

      // Mark as SOLD if quantity reaches 0
      const listing = await prisma.marketplaceListing.findUnique({
        where: { id: order.listingId },
        select: { quantity: true, userId: true, title: true }
      });

      if (listing?.quantity === 0) {
        await prisma.marketplaceListing.update({
          where: { id: order.listingId },
          data: { status: ListingStatus.SOLD }
        });

        // Notify seller about sold out listing
        if (listing.userId) {
          await NotificationService.notifyListingSoldOut(
            listing.userId,
            listing.title,
            order.listingId
          );
        }
      }

      // Notify buyer about delivery
      await NotificationService.notifyOrderDelivered(
        updatedOrder.buyerId,
        updatedOrder.marketplaceListings.title,
        updatedOrder.id
      );
    }

    // Notify buyer about shipment
    if (data.status === OrderStatus.SHIPPED) {
      await NotificationService.notifyOrderShipped(
        updatedOrder.buyerId,
        updatedOrder.marketplaceListings.title,
        updatedOrder.id,
        data.trackingNumber
      );

      // Log shipping activity
      await ActivityLoggerService.logMarketplaceOrderShipped(
        updatedOrder.sellerId,
        updatedOrder.id,
        data.trackingNumber
      ).catch((error) => {
        console.error('Failed to log order shipped:', error);
      });

      // Send shipping notification email
      if (data.trackingNumber && updatedOrder.users_marketplace_orders_buyerIdTousers.email) {
        try {
          await emailService.sendShippingNotification(
            updatedOrder.users_marketplace_orders_buyerIdTousers.email,
            {
              buyerName: updatedOrder.users_marketplace_orders_buyerIdTousers.fullName,
              orderId: updatedOrder.id,
              itemTitle: updatedOrder.marketplaceListings.title,
              carrier: 'Standard Shipping', // TODO: Get from order data if available
              trackingNumber: data.trackingNumber,
              trackingUrl: `https://track.example.com/${data.trackingNumber}`, // TODO: Build actual tracking URL
              estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            }
          );
        } catch (error) {
          console.error('Failed to send shipping notification:', error);
        }
      }
    }

    // Log activity

    return this.formatOrderResponse(updatedOrder);
  }

  async cancelOrder(orderId: string, userId: string): Promise<OrderResponse> {
    const order = await prisma.marketplaceOrder.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    // Buyer or seller can cancel
    if (order.buyerId !== userId && order.sellerId !== userId) {
      throw new AppError('You do not have permission to cancel this order', 403);
    }

    // Can only cancel pending or confirmed orders
    if (order.status !== OrderStatus.PENDING && order.status !== OrderStatus.CONFIRMED) {
      throw new AppError('Cannot cancel order in current status', 400);
    }

    const updatedOrder = await prisma.marketplaceOrder.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.CANCELED,
        canceledAt: new Date()
      },
      include: {
        marketplaceListings: {
          select: {
            id: true,
            title: true,
            images: true
          }
        },
        users_marketplace_orders_buyerIdTousers: {
          select: {
            id: true,
            fullName: true,
            username: true,
          }
        },
        users_marketplace_orders_sellerIdTousers: {
          select: {
            id: true,
            fullName: true,
            username: true,
          }
        }
      }
    });

    // Notify the other party about cancellation
    const canceledBy = userId === order.buyerId ? 'buyer' : 'seller';
    const notifyUserId = userId === order.buyerId ? order.sellerId : order.buyerId;
    
    await NotificationService.notifyOrderCanceled(
      notifyUserId,
      updatedOrder.marketplaceListings.title,
      updatedOrder.id,
      canceledBy
    );

    // Log cancellation activity
    await ActivityLoggerService.logMarketplaceOrderCancelled(
      userId,
      updatedOrder.id,
      `Cancelled by ${canceledBy}`
    ).catch((error) => {
      console.error('Failed to log order cancellation:', error);
    });

    return this.formatOrderResponse(updatedOrder);
  }

  // ============= REVIEW METHODS =============

  async createReview(userId: string, data: CreateReviewRequest): Promise<ReviewResponse> {
    // Get order
    const order = await prisma.marketplaceOrder.findUnique({
      where: { id: data.orderId },
      include: { marketplaceListings: true }
    });

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    // Can only review after delivery
    if (order.status !== OrderStatus.DELIVERED) {
      throw new AppError('Can only review delivered orders', 400);
    }

    // Check if user is part of the transaction
    if (order.buyerId !== userId && order.sellerId !== userId) {
      throw new AppError('You are not part of this transaction', 403);
    }

    // Validate reviewee
    if (data.revieweeId !== order.buyerId && data.revieweeId !== order.sellerId) {
      throw new AppError('Reviewee must be buyer or seller', 400);
    }

    if (data.revieweeId === userId) {
      throw new AppError('You cannot review yourself', 400);
    }

    // Check if already reviewed
    const existingReview = await prisma.marketplaceReview.findUnique({
      where: {
        orderId_reviewerId: {
          orderId: data.orderId,
          reviewerId: userId
        }
      }
    });

    if (existingReview) {
      throw new AppError('You have already reviewed this order', 400);
    }

    const review = await prisma.marketplaceReview.create({
      data: {
        orderId: data.orderId,
        reviewerId: userId,
        revieweeId: data.revieweeId,
        rating: data.rating,
        comment: data.comment
      },
      include: {
        users_marketplace_reviews_reviewerIdTousers: {
          select: {
            id: true,
            fullName: true,
            username: true,
          }
        },
        users_marketplace_reviews_revieweeIdTousers: {
          select: {
            id: true,
            fullName: true,
            username: true,
          }
        },
        marketplace_orders: {
          select: {
            id: true,
            marketplaceListings: {
              select: {
                id: true,
                title: true
              }
            }
          }
        }
      }
    });

    // Notify reviewee about new review
    await NotificationService.notifyNewReview(
      data.revieweeId,
      review.users_marketplace_reviews_reviewerIdTousers.fullName,
      review.marketplace_orders.marketplaceListings.title,
      data.rating,
      review.id
    );

    // Award points for positive review
    if (data.rating >= 4) {
      // TODO: Award points to reviewee
    }

    // Log activity

    return this.formatReviewResponse(review);
  }

  async getUserReviews(
    userId: string,
    role: 'reviewer' | 'reviewee',
    params: PaginationParams
  ): Promise<PaginatedResponse<ReviewResponse>> {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = params;

    const where = role === 'reviewer' ? { reviewerId: userId } : { revieweeId: userId };

    const [reviews, total] = await Promise.all([
      prisma.marketplaceReview.findMany({
        where,
        include: {
          users_marketplace_reviews_reviewerIdTousers: {
            select: {
              id: true,
              fullName: true,
              username: true,
            }
          },
          users_marketplace_reviews_revieweeIdTousers: {
            select: {
              id: true,
              fullName: true,
              username: true,
            }
          },
          marketplace_orders: {
            select: {
              id: true,
              marketplaceListings: {
                select: {
                  id: true,
                  title: true
                }
              }
            }
          }
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.marketplaceReview.count({ where })
    ]);

    const formattedReviews = reviews.map(review => this.formatReviewResponse(review));

    return {
      data: formattedReviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total
      }
    };
  }

  // ============= DISPUTE METHODS =============

  async createDispute(userId: string, data: CreateDisputeRequest): Promise<DisputeResponse> {
    // Get order
    const order = await prisma.marketplaceOrder.findUnique({
      where: { id: data.orderId }
    });

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    // Check if user is part of transaction
    if (order.buyerId !== userId && order.sellerId !== userId) {
      throw new AppError('You are not part of this transaction', 403);
    }

    // Check if already disputed
    const existingDispute = await prisma.marketplaceDispute.findFirst({
      where: {
        orderId: data.orderId,
        status: { in: [DisputeStatus.OPEN, DisputeStatus.UNDER_REVIEW] }
      }
    });

    if (existingDispute) {
      throw new AppError('Order already has an open dispute', 400);
    }

    const dispute = await prisma.marketplaceDispute.create({
      data: {
        orderId: data.orderId,
        initiatedBy: userId,
        reason: data.reason,
        status: DisputeStatus.OPEN
      },
      include: {
        marketplace_orders: {
          include: {
            marketplaceListings: {
              select: {
                id: true,
                title: true
              }
            },
            users_marketplace_orders_buyerIdTousers: {
              select: {
                id: true,
                fullName: true,
                username: true
              }
            },
            users_marketplace_orders_sellerIdTousers: {
              select: {
                id: true,
                fullName: true,
                username: true
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            fullName: true,
            username: true
          }
        }
      }
    });

    // Update order status
    await prisma.marketplaceOrder.update({
      where: { id: data.orderId },
      data: { status: OrderStatus.DISPUTED }
    });

    // Notify both parties about dispute
    const listingTitle = dispute.marketplace_orders.marketplaceListings.title;
    const buyerId = dispute.marketplace_orders.buyerId;
    const sellerId = dispute.marketplace_orders.sellerId;
    
    // Notify buyer
    await NotificationService.notifyDisputeCreated(
      buyerId,
      data.orderId,
      listingTitle,
      dispute.id,
      userId === buyerId
    );
    
    // Notify seller
    await NotificationService.notifyDisputeCreated(
      sellerId,
      data.orderId,
      listingTitle,
      dispute.id,
      userId === sellerId
    );

    // Log activity

    return this.formatDisputeResponse(dispute);
  }

  async updateDispute(
    disputeId: string, 
    userId: string, 
    data: UpdateDisputeRequest
  ): Promise<DisputeResponse> {
    const dispute = await prisma.marketplaceDispute.findUnique({
      where: { id: disputeId },
      include: { marketplace_orders: true }
    });

    if (!dispute) {
      throw new AppError('Dispute not found', 404);
    }

    // Only admin or involved parties can update
    // For now, allow involved parties to update
    const order = dispute.marketplace_orders;
    if (order.buyerId !== userId && order.sellerId !== userId) {
      throw new AppError('You do not have permission to update this dispute', 403);
    }

    const updateData: any = {};
    if (data.status) {
      updateData.status = data.status;
      if (data.status === DisputeStatus.RESOLVED || data.status === DisputeStatus.CLOSED) {
        updateData.resolvedAt = new Date();
      }
    }
    if (data.resolution) updateData.resolution = data.resolution;

    const updatedDispute = await prisma.marketplaceDispute.update({
      where: { id: disputeId },
      data: updateData,
      include: {
        marketplace_orders: {
          include: {
            marketplaceListings: {
              select: {
                id: true,
                title: true
              }
            },
            users_marketplace_orders_buyerIdTousers: {
              select: {
                id: true,
                fullName: true,
                username: true
              }
            },
            users_marketplace_orders_sellerIdTousers: {
              select: {
                id: true,
                fullName: true,
                username: true
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            fullName: true,
            username: true
          }
        }
      }
    });

    // Notify both parties if dispute resolved
    if (data.status === DisputeStatus.RESOLVED && data.resolution) {
      const listingTitle = updatedDispute.marketplace_orders.marketplaceListings.title;
      const buyerId = updatedDispute.marketplace_orders.buyerId;
      const sellerId = updatedDispute.marketplace_orders.sellerId;
      
      // Notify buyer
      await NotificationService.notifyDisputeResolved(
        buyerId,
        updatedDispute.marketplace_orders.id,
        listingTitle,
        disputeId,
        data.resolution
      );
      
      // Notify seller
      await NotificationService.notifyDisputeResolved(
        sellerId,
        updatedDispute.marketplace_orders.id,
        listingTitle,
        disputeId,
        data.resolution
      );
    }

    // Log activity

    return this.formatDisputeResponse(updatedDispute);
  }

  async getDispute(disputeId: string, userId: string): Promise<DisputeResponse> {
    const dispute = await prisma.marketplaceDispute.findUnique({
      where: { id: disputeId },
      include: {
        marketplace_orders: {
          include: {
            marketplaceListings: {
              select: {
                id: true,
                title: true
              }
            },
            users_marketplace_orders_buyerIdTousers: {
              select: {
                id: true,
                fullName: true,
                username: true
              }
            },
            users_marketplace_orders_sellerIdTousers: {
              select: {
                id: true,
                fullName: true,
                username: true
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            fullName: true,
            username: true
          }
        }
      }
    });

    if (!dispute) {
      throw new AppError('Dispute not found', 404);
    }

    // Check permission
    const order = dispute.marketplace_orders;
    if (order.buyerId !== userId && order.sellerId !== userId) {
      throw new AppError('You do not have permission to view this dispute', 403);
    }

    return this.formatDisputeResponse(dispute);
  }

  // ============= DISCOVERY METHODS =============

  async getTrendingListings(
    params: PaginationParams & { category?: string; location?: string }
  ): Promise<PaginatedResponse<ListingResponse>> {
    const { page = 1, limit = 20, category, location } = params;

    const where: any = {
      status: ListingStatus.ACTIVE
    };

    if (category) where.category = category;
    if (location) where.location = { contains: location, mode: 'insensitive' };

    // Get listings with view counts from saved items as proxy for views
    // Rank by number of times added to cart + created recently
    const [listings, total] = await Promise.all([
      prisma.marketplaceListing.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              username: true,
              trustScore: true
            }
          },
          _count: {
            select: {
              marketplaceCartItems: true
            }
          }
        },
        orderBy: [
          // Prioritize listings with more cart adds and orders
          { createdAt: 'desc' }
        ],
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.marketplaceListing.count({ where })
    ]);

    // Sort by engagement (cart items as proxy for popularity)
    const sortedListings = listings.sort((a, b) => {
      const aEngagement = (a._count?.marketplaceCartItems || 0);
      const bEngagement = (b._count?.marketplaceCartItems || 0);
      return bEngagement - aEngagement;
    });

    const formattedListings = sortedListings.map(listing => this.formatListingResponse(listing));

    return {
      data: formattedListings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total
      }
    };
  }

  async getRecommendedListings(
    userId: string,
    params: PaginationParams & { category?: string }
  ): Promise<PaginatedResponse<ListingResponse>> {
    const { page = 1, limit = 20, category } = params;

    // Get user profile to understand interests
    const userProfile = await prisma.userProfile.findUnique({
      where: { userId },
      select: { interests: true }
    });

    // Get user's community IDs (simple reference, no need for full data)
    const userCommunityIds = await prisma.communityMember.findMany({
      where: { userId },
      select: { communityId: true }
    });

    const where: any = {
      status: ListingStatus.ACTIVE,
      userId: { not: userId } // Don't recommend own listings
    };

    if (category) where.category = category;

    // Get listings matching user interests or community types
    const [listings, total] = await Promise.all([
      prisma.marketplaceListing.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              username: true,
              trustScore: true
            }
          },
          _count: {
            select: {
              marketplaceCartItems: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit * 3 // Get more to filter/rank
      }),
      prisma.marketplaceListing.count({ where })
    ]);

    // Rank by relevance to user interests
    const rankedListings = listings
      .map(listing => {
        let relevanceScore = 0;

        // Match based on user interests
        if (userProfile?.interests && Array.isArray(userProfile.interests)) {
          const listingText = `${listing.title} ${listing.description} ${listing.category}`.toLowerCase();
          userProfile.interests.forEach((interest: any) => {
            if (listingText.includes(interest.toLowerCase())) {
              relevanceScore += 2;
            }
          });
        }

        // Boost newer listings slightly
        const daysSinceCreation = (Date.now() - new Date(listing.createdAt).getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceCreation < 7) relevanceScore += 1;

        return { ...listing, relevanceScore };
      })
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice((page - 1) * limit, page * limit);

    const formattedListings = rankedListings.map(listing => this.formatListingResponse(listing));

    return {
      data: formattedListings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total
      }
    };
  }

  async getNearbyListings(
    location: string,
    params: PaginationParams & { category?: string }
  ): Promise<PaginatedResponse<ListingResponse>> {
    const { page = 1, limit = 20, category } = params;

    const where: any = {
      status: ListingStatus.ACTIVE,
      location: { contains: location, mode: 'insensitive' }
    };

    if (category) where.category = category;

    const [listings, total] = await Promise.all([
      prisma.marketplaceListing.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              username: true,
              trustScore: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.marketplaceListing.count({ where })
    ]);

    const formattedListings = listings.map(listing => this.formatListingResponse(listing));

    return {
      data: formattedListings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total
      }
    };
  }

  // ============= STATS METHODS =============

  async getSellerStats(sellerId: string): Promise<SellerStats> {
    const [
      totalListings,
      activeListings,
      soldListings,
      totalOrders,
      completedOrders,
      revenueData,
      reviews
    ] = await Promise.all([
      prisma.marketplaceListing.count({ where: { userId: sellerId } }),
      prisma.marketplaceListing.count({ 
        where: { userId: sellerId, status: ListingStatus.ACTIVE } 
      }),
      prisma.marketplaceListing.count({ 
        where: { userId: sellerId, status: ListingStatus.SOLD } 
      }),
      prisma.marketplaceOrder.count({ where: { sellerId } }),
      prisma.marketplaceOrder.count({ 
        where: { sellerId, status: OrderStatus.DELIVERED } 
      }),
      prisma.marketplaceOrder.aggregate({
        where: { sellerId, status: OrderStatus.DELIVERED },
        _sum: { sellerPayout: true }
      }),
      prisma.marketplaceReview.findMany({
        where: { revieweeId: sellerId },
        select: { rating: true }
      })
    ]);

    const averageRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    const pendingPayouts = await prisma.marketplaceOrder.aggregate({
      where: { 
        sellerId, 
        status: OrderStatus.DELIVERED,
        paymentStatus: PaymentStatus.SUCCEEDED
        // TODO: Add payout status check
      },
      _sum: { sellerPayout: true }
    });

    return {
      totalListings,
      activeListings,
      soldListings,
      totalOrders,
      completedOrders,
      totalRevenue: revenueData._sum.sellerPayout || 0,
      averageRating,
      totalReviews: reviews.length,
      pendingPayouts: pendingPayouts._sum.sellerPayout || 0
    };
  }

  async getBuyerStats(buyerId: string): Promise<BuyerStats> {
    const [totalOrders, completedOrders, spentData, reviewsGiven, reviewsReceived] = await Promise.all([
      prisma.marketplaceOrder.count({ where: { buyerId } }),
      prisma.marketplaceOrder.count({ 
        where: { buyerId, status: OrderStatus.DELIVERED } 
      }),
      prisma.marketplaceOrder.aggregate({
        where: { buyerId, paymentStatus: PaymentStatus.SUCCEEDED },
        _sum: { totalAmount: true }
      }),
      prisma.marketplaceReview.count({ where: { reviewerId: buyerId } }),
      prisma.marketplaceReview.findMany({
        where: { revieweeId: buyerId },
        select: { rating: true }
      })
    ]);

    const averageRating = reviewsReceived.length > 0
      ? reviewsReceived.reduce((sum, r) => sum + r.rating, 0) / reviewsReceived.length
      : 0;

    return {
      totalOrders,
      completedOrders,
      totalSpent: spentData._sum.totalAmount || 0,
      reviewsGiven,
      averageRating
    };
  }

  /**
   * Get general marketplace statistics
   */
  async getMarketplaceStats(userId?: string): Promise<MarketplaceStats> {
    // Get total listings count
    const totalListings = await prisma.marketplaceListing.count();

    // Get active listings count
    const activeListings = await prisma.marketplaceListing.count({
      where: { status: ListingStatus.ACTIVE }
    });

    // Get total orders count
    const totalOrders = await prisma.marketplaceOrder.count();

    // Get total revenue (successful payments only)
    const revenueData = await prisma.marketplaceOrder.aggregate({
      where: {
        paymentStatus: PaymentStatus.SUCCEEDED
      },
      _sum: {
        totalAmount: true
      },
      _avg: {
        totalAmount: true
      }
    });

    const totalRevenue = revenueData._sum.totalAmount || 0;
    const averageOrderValue = revenueData._avg.totalAmount || 0;

    // Get top categories
    const categoryStats = await prisma.marketplaceListing.groupBy({
      by: ['category'],
      where: {
        category: { not: null },
        status: { in: [ListingStatus.ACTIVE, ListingStatus.SOLD] }
      },
      _count: {
        category: true
      },
      orderBy: {
        _count: {
          category: 'desc'
        }
      },
      take: 5
    });

    // Get revenue per category
    const categoryRevenue = await prisma.marketplaceOrder.groupBy({
      by: ['listingId'],
      where: {
        paymentStatus: PaymentStatus.SUCCEEDED
      },
      _sum: {
        totalAmount: true
      }
    });

    // Map listings to categories for revenue calculation
    const listingCategories = await prisma.marketplaceListing.findMany({
      where: {
        id: { in: categoryRevenue.map(cr => cr.listingId) }
      },
      select: {
        id: true,
        category: true
      }
    });

    const categoryRevenueMap = new Map<string, number>();
    categoryRevenue.forEach(cr => {
      const listing = listingCategories.find(l => l.id === cr.listingId);
      if (listing?.category) {
        const current = categoryRevenueMap.get(listing.category) || 0;
        categoryRevenueMap.set(listing.category, current + (cr._sum.totalAmount || 0));
      }
    });

    const topCategories = categoryStats.map(cat => ({
      category: cat.category || 'Uncategorized',
      count: cat._count.category,
      revenue: categoryRevenueMap.get(cat.category || '') || 0
    }));

    return {
      totalListings,
      activeListings,
      totalOrders,
      totalRevenue,
      averageOrderValue,
      topCategories
    };
  }

  // ============= HELPER METHODS =============

  private formatListingResponse(listing: any): ListingResponse {
    // Convert image keys to full URLs
    const { storageService } = require('../../services/storage.service');
    const images = listing.images?.map((key: string) => 
      key.startsWith('http') ? key : storageService.getPublicUrl(key)
    ) || [];

    return {
      ...listing,
      images,
      seller: listing.user
    };
  }

  private formatListingPreview(listing: any): any {
    // Convert image keys to full URLs
    const { storageService } = require('../../services/storage.service');
    const images = listing.images?.map((key: string) => 
      key.startsWith('http') ? key : storageService.getPublicUrl(key)
    ) || [];

    return {
      ...listing,
      images
    };
  }

  private formatOrderResponse(order: any): OrderResponse {
    return {
      ...order,
      listing: order.marketplaceListings,
      buyer: order.users_marketplace_orders_buyerIdTousers,
      seller: order.users_marketplace_orders_sellerIdTousers,
      review: order.reviews?.[0],
      disputes: order.marketplaceDisputes
    };
  }

  private formatCartItemResponse(item: any): CartItemResponse {
    // Convert image keys to full URLs
    const { storageService } = require('../../services/storage.service');
    const images = item.marketplaceListings.images?.map((key: string) => 
      key.startsWith('http') ? key : storageService.getPublicUrl(key)
    ) || [];

    // Get default pricing
    const defaultPricing = item.marketplaceListings.pricingOptions?.find((p: any) => p.isDefault) 
      || item.marketplaceListings.pricingOptions?.[0];

    return {
      ...item,
      listing: {
        id: item.marketplaceListings.id,
        title: item.marketplaceListings.title,
        price: defaultPricing?.price,
        currency: defaultPricing?.currency,
        images,
        status: item.marketplaceListings.status,
        quantity: item.marketplaceListings.quantity,
        seller: item.marketplaceListings.user,
        pricingOptions: item.marketplaceListings.pricingOptions
      }
    };
  }

  private formatReviewResponse(review: any): ReviewResponse {
    return {
      ...review,
      reviewer: review.users_marketplace_reviews_reviewerIdTousers,
      reviewee: review.users_marketplace_reviews_revieweeIdTousers,
      order: {
        id: review.marketplace_orders.id,
        listing: review.marketplace_orders.marketplaceListings
      }
    };
  }

  private formatDisputeResponse(dispute: any): DisputeResponse {
    return {
      ...dispute,
      order: {
        id: dispute.marketplace_orders.id,
        listing: dispute.marketplace_orders.marketplaceListings,
        buyer: dispute.marketplace_orders.users_marketplace_orders_buyerIdTousers,
        seller: dispute.marketplace_orders.users_marketplace_orders_sellerIdTousers
      },
      initiator: dispute.user
    };
  }

  private validateOrderStatusTransition(current: OrderStatus, next: OrderStatus): void {
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.CART]: [],
      [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELED],
      [OrderStatus.CONFIRMED]: [OrderStatus.SHIPPED, OrderStatus.CANCELED],
      [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
      [OrderStatus.DELIVERED]: [OrderStatus.REFUNDED, OrderStatus.DISPUTED],
      [OrderStatus.CANCELED]: [],
      [OrderStatus.REFUNDED]: [],
      [OrderStatus.DISPUTED]: [OrderStatus.REFUNDED, OrderStatus.DELIVERED]
    };

    if (!validTransitions[current]?.includes(next)) {
      throw new AppError(
        `Cannot transition from ${current} to ${next}`,
        400
      );
    }
  }

  // ============= METADATA METHODS =============

  getCategories() {
    return MARKETPLACE_CONSTANTS.LISTING_CATEGORIES.map(category => ({
      value: category,
      label: category
    }));
  }

  getListingStatuses() {
    return [
      { value: 'DRAFT', label: 'Draft', description: 'Listing is being prepared' },
      { value: 'ACTIVE', label: 'Active', description: 'Listing is live and available for purchase' },
      { value: 'SOLD', label: 'Sold', description: 'Listing has been sold' },
      { value: 'EXPIRED', label: 'Expired', description: 'Listing has expired' },
      { value: 'REMOVED', label: 'Removed', description: 'Listing has been removed by user or admin' }
    ];
  }

  getOrderStatuses() {
    return [
      { value: 'CART', label: 'In Cart', description: 'Item is in shopping cart' },
      { value: 'PENDING', label: 'Pending', description: 'Order placed, awaiting payment confirmation' },
      { value: 'CONFIRMED', label: 'Confirmed', description: 'Payment confirmed, awaiting shipment' },
      { value: 'SHIPPED', label: 'Shipped', description: 'Order has been shipped' },
      { value: 'DELIVERED', label: 'Delivered', description: 'Order has been delivered' },
      { value: 'CANCELED', label: 'Canceled', description: 'Order has been canceled' },
      { value: 'REFUNDED', label: 'Refunded', description: 'Order has been refunded' },
      { value: 'DISPUTED', label: 'Disputed', description: 'Order is under dispute' }
    ];
  }

  getPaymentStatuses() {
    return [
      { value: 'PENDING', label: 'Pending', description: 'Payment is pending' },
      { value: 'PROCESSING', label: 'Processing', description: 'Payment is being processed' },
      { value: 'SUCCEEDED', label: 'Succeeded', description: 'Payment completed successfully' },
      { value: 'FAILED', label: 'Failed', description: 'Payment failed' },
      { value: 'CANCELED', label: 'Canceled', description: 'Payment was canceled' },
      { value: 'REFUNDED', label: 'Refunded', description: 'Payment has been refunded' },
      { value: 'PARTIALLY_REFUNDED', label: 'Partially Refunded', description: 'Payment has been partially refunded' }
    ];
  }

  getCurrencies() {
    return [
      { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit', isDefault: true },
      { code: 'USD', symbol: '$', name: 'US Dollar', isDefault: false },
      { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', isDefault: false },
      { code: 'EUR', symbol: '€', name: 'Euro', isDefault: false }
    ];
  }

  getConstants() {
    return {
      maxImagesPerListing: MARKETPLACE_CONSTANTS.MAX_IMAGES_PER_LISTING,
      maxCartItems: MARKETPLACE_CONSTANTS.MAX_CART_ITEMS,
      maxQuantityPerItem: MARKETPLACE_CONSTANTS.MAX_QUANTITY_PER_ITEM,
      minRating: MARKETPLACE_CONSTANTS.MIN_RATING,
      maxRating: MARKETPLACE_CONSTANTS.MAX_RATING,
      orderExpiryDays: MARKETPLACE_CONSTANTS.ORDER_EXPIRY_DAYS,
      platformFeePercentage: MARKETPLACE_CONSTANTS.PLATFORM_FEE_PERCENTAGE,
      defaultCurrency: MARKETPLACE_CONSTANTS.CURRENCY
    };
  }
}

export const marketplaceService = new MarketplaceService();
