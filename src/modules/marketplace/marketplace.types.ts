import { 
  MarketplaceListing, 
  MarketplaceOrder, 
  MarketplaceCartItem, 
  MarketplaceReview, 
  MarketplaceDispute,
  ListingPriceHistory,
  ListingStatus,
  OrderStatus,
  DisputeStatus,
  PaymentStatus
} from '@prisma/client';

// ============= REQUEST TYPES =============

export interface CreateListingRequest {
  title: string;
  description?: string;
  category?: string;
  price: number;
  currency?: string;
  quantity?: number;
  location?: string;
  images?: string[];
  status?: ListingStatus;
}

export interface UpdateListingRequest {
  title?: string;
  description?: string;
  category?: string;
  price?: number;
  currency?: string;
  quantity?: number;
  location?: string;
  images?: string[];
  status?: ListingStatus;
}

export interface ListingFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  status?: ListingStatus;
  userId?: string;
  search?: string;
}

export interface AddToCartRequest {
  listingId: string;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

export interface CreateOrderRequest {
  listingId: string;
  quantity: number;
  shippingAddress: {
    fullName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
  };
  notes?: string;
}

export interface UpdateOrderRequest {
  status?: OrderStatus;
  trackingNumber?: string;
  notes?: string;
}

export interface CreateReviewRequest {
  orderId: string;
  revieweeId: string;
  rating: number;
  comment?: string;
}

export interface CreateDisputeRequest {
  orderId: string;
  reason: string;
}

export interface UpdateDisputeRequest {
  status?: DisputeStatus;
  resolution?: any;
}

export interface OrderFilters {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  buyerId?: string;
  sellerId?: string;
  listingId?: string;
  fromDate?: Date;
  toDate?: Date;
}

// ============= RESPONSE TYPES =============

export interface ListingResponse extends MarketplaceListing {
  seller: {
    id: string;
    fullName: string;
    username: string;
    trustScore?: number;
  };
  priceHistory?: ListingPriceHistory[];
  averageRating?: number;
  totalReviews?: number;
}

export interface OrderResponse extends MarketplaceOrder {
  listing: {
    id: string;
    title: string;
    images: string[];
  };
  buyer: {
    id: string;
    fullName: string;
    username: string;
    
  };
  seller: {
    id: string;
    fullName: string;
    username: string;
    
  };
  review?: MarketplaceReview;
  disputes?: MarketplaceDispute[];
}

export interface CartItemResponse extends MarketplaceCartItem {
  listing: {
    id: string;
    title: string;
    price: number;
    currency: string;
    images: string[];
    status: ListingStatus;
    quantity?: number;
    seller: {
      id: string;
      fullName: string;
      username: string;
    };
  };
}

export interface ReviewResponse extends MarketplaceReview {
  reviewer: {
    id: string;
    fullName: string;
    username: string;
    
  };
  reviewee: {
    id: string;
    fullName: string;
    username: string;
    
  };
  order: {
    id: string;
    listing: {
      id: string;
      title: string;
    };
  };
}

export interface DisputeResponse extends MarketplaceDispute {
  order: {
    id: string;
    listing: {
      id: string;
      title: string;
    };
    buyer: {
      id: string;
      fullName: string;
      username: string;
    };
    seller: {
      id: string;
      fullName: string;
      username: string;
    };
  };
  initiator: {
    id: string;
    fullName: string;
    username: string;
  };
}

export interface SellerStats {
  totalListings: number;
  activeListings: number;
  soldListings: number;
  totalOrders: number;
  completedOrders: number;
  totalRevenue: number;
  averageRating: number;
  totalReviews: number;
  pendingPayouts: number;
}

export interface BuyerStats {
  totalOrders: number;
  completedOrders: number;
  totalSpent: number;
  reviewsGiven: number;
  averageRating: number;
}

export interface MarketplaceStats {
  totalListings: number;
  activeListings: number;
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  topCategories: Array<{
    category: string;
    count: number;
    revenue: number;
  }>;
}

// ============= PAGINATION =============

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

// ============= SEARCH =============

export interface SearchListingsParams extends PaginationParams {
  query?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  status?: ListingStatus;
  sellerId?: string;
}

// ============= NOTIFICATIONS =============

export interface MarketplaceNotification {
  type: 'ORDER_PLACED' | 'ORDER_CONFIRMED' | 'ORDER_SHIPPED' | 'ORDER_DELIVERED' | 
        'ORDER_CANCELED' | 'REVIEW_RECEIVED' | 'DISPUTE_OPENED' | 'DISPUTE_RESOLVED' |
        'LISTING_SOLD' | 'PAYMENT_RECEIVED';
  orderId?: string;
  listingId?: string;
  userId: string;
  message: string;
  metadata?: any;
}

// ============= CONSTANTS =============

export const MARKETPLACE_CONSTANTS = {
  MAX_IMAGES_PER_LISTING: 10,
  MAX_CART_ITEMS: 50,
  MAX_QUANTITY_PER_ITEM: 100,
  MIN_RATING: 1,
  MAX_RATING: 5,
  ORDER_EXPIRY_DAYS: 30,
  PLATFORM_FEE_PERCENTAGE: 5,
  CURRENCY: 'MYR',
  LISTING_CATEGORIES: [
    'Electronics',
    'Fashion',
    'Home & Garden',
    'Sports & Outdoors',
    'Books & Media',
    'Toys & Games',
    'Health & Beauty',
    'Automotive',
    'Other'
  ]
} as const;

export type ListingCategory = typeof MARKETPLACE_CONSTANTS.LISTING_CATEGORIES[number];
