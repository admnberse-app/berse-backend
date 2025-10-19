# Marketplace API Documentation

## Overview
The Marketplace API provides a complete e-commerce platform for users to buy and sell items within the Bersemuka community. It includes listings management, shopping cart, order processing with integrated payment gateway, reviews, and dispute resolution.

**Base URL:** `/v2/marketplace`

---

## Authentication
Most endpoints require JWT authentication via Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

Public endpoints (no auth required):
- Search listings
- Get listing details
- Discovery endpoints (trending, nearby)
- All metadata endpoints

---

## Table of Contents
1. [Listings](#listings)
2. [Cart](#cart)
3. [Orders](#orders)
4. [Reviews](#reviews)
5. [Disputes](#disputes)
6. [Stats](#stats)
7. [Discovery](#discovery)
8. [Metadata](#metadata)

---

## Listings

### Upload Listing Images
**POST** `/upload-images`
- **Auth Required:** Yes
- **Description:** Upload one or multiple images for a marketplace listing
- **Content-Type:** `multipart/form-data`
- **Max Files:** 10 images per request
- **Max Size:** 5MB per image
- **Supported Formats:** JPEG, PNG, GIF, WebP

**Form Data:**
```
images: [File, File, File, ...]
```

**Example cURL:**
```bash
curl -X POST "https://api.bersemuka.com/v2/marketplace/upload-images" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "images=@photo1.jpg" \
  -F "images=@photo2.jpg" \
  -F "images=@photo3.jpg"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "imageKeys": [
      "marketplace/userId/1760867198186-abc123.jpg",
      "marketplace/userId/1760867198186-def456.jpg",
      "marketplace/userId/1760867198186-ghi789.jpg"
    ],
    "imageUrls": [
      "https://cdn.bersemuka.com/marketplace/userId/1760867198186-abc123.jpg",
      "https://cdn.bersemuka.com/marketplace/userId/1760867198186-def456.jpg",
      "https://cdn.bersemuka.com/marketplace/userId/1760867198186-ghi789.jpg"
    ],
    "count": 3
  },
  "message": "3 image(s) uploaded successfully"
}
```

**Important Notes:**
- `imageKeys`: Use these when creating/updating listings - they are stored in the database
- `imageUrls`: Full CDN URLs for preview/display purposes
- Database stores only keys/paths, API responses automatically convert to full URLs

### Create Listing
**POST** `/listings`
- **Auth Required:** Yes
- **Description:** Create a new marketplace listing

> **Note:** Upload images first using the `/upload-images` endpoint, then use the returned `imageKeys` in the `images` array.

**Request Body:**
```json
{
  "title": "Vintage Camera",
  "description": "Classic film camera in excellent condition",
  "category": "Electronics",
  "price": 250.00,
  "currency": "MYR",
  "quantity": 1,
  "location": "Kuala Lumpur",
  "images": [
    "marketplace/userId/1760867198186-abc123.jpg",
    "marketplace/userId/1760867198186-def456.jpg"
  ],
  "status": "ACTIVE"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "listing_id",
    "userId": "user_id",
    "title": "Vintage Camera",
    "description": "Classic film camera in excellent condition",
    "category": "Electronics",
    "price": 250.00,
    "currency": "MYR",
    "quantity": 1,
    "location": "Kuala Lumpur",
    "images": ["https://example.com/image1.jpg"],
    "status": "ACTIVE",
    "createdAt": "2025-10-19T08:00:00.000Z",
    "updatedAt": "2025-10-19T08:00:00.000Z",
    "seller": {
      "id": "user_id",
      "fullName": "John Doe",
      "username": "johndoe",
      "trustScore": 85
    },
    "stats": {
      "viewCount": 0,
      "cartCount": 0
    }
  }
}
```

### Search Listings
**GET** `/listings`
- **Auth Required:** No
- **Description:** Search and filter marketplace listings

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20, max: 100)
- `search` (string) - Search in title and description
- `category` (string) - Filter by category
- `minPrice` (number)
- `maxPrice` (number)
- `location` (string)
- `status` (string) - DRAFT, ACTIVE, SOLD, EXPIRED, REMOVED
- `userId` (string) - Filter by seller
- `sortBy` (string) - createdAt, price, title
- `sortOrder` (string) - asc, desc

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "listing_id",
      "title": "Vintage Camera",
      "price": 250.00,
      "currency": "MYR",
      "category": "Electronics",
      "location": "Kuala Lumpur",
      "images": ["https://example.com/image1.jpg"],
      "status": "ACTIVE",
      "seller": {
        "id": "user_id",
        "fullName": "John Doe",
        "username": "johndoe",
        "trustScore": 85
      },
      "stats": {
        "viewCount": 25,
        "cartCount": 3
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasMore": true
  }
}
```

### Get My Listings
**GET** `/listings/my`
- **Auth Required:** Yes
- **Description:** Get all listings created by the authenticated user

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)
- `status` (string) - Filter by status

**Response:** Same format as Search Listings

### Get Listing Details
**GET** `/listings/:id`
- **Auth Required:** No
- **Description:** Get detailed information about a specific listing

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "listing_id",
    "userId": "user_id",
    "title": "Vintage Camera",
    "description": "Classic film camera in excellent condition",
    "category": "Electronics",
    "price": 250.00,
    "currency": "MYR",
    "quantity": 1,
    "location": "Kuala Lumpur",
    "images": ["https://example.com/image1.jpg"],
    "status": "ACTIVE",
    "createdAt": "2025-10-19T08:00:00.000Z",
    "updatedAt": "2025-10-19T08:00:00.000Z",
    "seller": {
      "id": "user_id",
      "fullName": "John Doe",
      "username": "johndoe",
      "trustScore": 85,
      "profilePicture": "https://example.com/profile.jpg"
    },
    "stats": {
      "viewCount": 25,
      "cartCount": 3,
      "averageRating": 4.5,
      "totalReviews": 10
    }
  }
}
```

### Update Listing
**PUT** `/listings/:id`
- **Auth Required:** Yes (must be listing owner)
- **Description:** Update listing details

**Request Body:** Same as Create Listing (all fields optional)

**Response:** Same format as Get Listing Details

### Delete Listing
**DELETE** `/listings/:id`
- **Auth Required:** Yes (must be listing owner)
- **Description:** Delete a listing

**Response:**
```json
{
  "success": true,
  "message": "Listing deleted successfully"
}
```

---

## Cart

### Add to Cart
**POST** `/cart`
- **Auth Required:** Yes
- **Description:** Add an item to shopping cart

**Request Body:**
```json
{
  "listingId": "listing_id",
  "quantity": 2
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "cart_item_id",
    "userId": "user_id",
    "listingId": "listing_id",
    "quantity": 2,
    "addedAt": "2025-10-19T08:00:00.000Z",
    "listing": {
      "id": "listing_id",
      "title": "Vintage Camera",
      "price": 250.00,
      "currency": "MYR",
      "images": ["https://example.com/image1.jpg"],
      "status": "ACTIVE",
      "quantity": 5,
      "seller": {
        "id": "seller_id",
        "fullName": "John Doe",
        "username": "johndoe"
      }
    }
  }
}
```

### Get Cart
**GET** `/cart`
- **Auth Required:** Yes
- **Description:** Get all items in user's cart

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "cart_item_id",
      "quantity": 2,
      "addedAt": "2025-10-19T08:00:00.000Z",
      "listing": {
        "id": "listing_id",
        "title": "Vintage Camera",
        "price": 250.00,
        "currency": "MYR",
        "images": ["https://example.com/image1.jpg"],
        "status": "ACTIVE",
        "quantity": 5,
        "seller": {
          "id": "seller_id",
          "fullName": "John Doe",
          "username": "johndoe"
        }
      }
    }
  ]
}
```

### Update Cart Item
**PUT** `/cart/:itemId`
- **Auth Required:** Yes
- **Description:** Update quantity of a cart item

**Request Body:**
```json
{
  "quantity": 3
}
```

**Response:** Same format as Add to Cart

### Remove from Cart
**DELETE** `/cart/:itemId`
- **Auth Required:** Yes
- **Description:** Remove specific item from cart

**Response:**
```json
{
  "success": true,
  "message": "Item removed from cart"
}
```

### Clear Cart
**DELETE** `/cart`
- **Auth Required:** Yes
- **Description:** Remove all items from cart

**Response:**
```json
{
  "success": true,
  "message": "Cart cleared successfully"
}
```

---

## Orders

### Create Order (Checkout)
**POST** `/orders`
- **Auth Required:** Yes
- **Description:** Create an order and initiate payment

**Request Body:**
```json
{
  "listingId": "listing_id",
  "quantity": 1,
  "shippingAddress": {
    "fullName": "John Doe",
    "addressLine1": "123 Main Street",
    "addressLine2": "Apt 4B",
    "city": "Kuala Lumpur",
    "state": "Wilayah Persekutuan",
    "postalCode": "50200",
    "country": "Malaysia",
    "phone": "+60123456789"
  },
  "notes": "Please handle with care",
  "providerId": "provider_id",
  "paymentMethodId": "pm_id"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "order_id",
    "listingId": "listing_id",
    "buyerId": "buyer_id",
    "sellerId": "seller_id",
    "quantity": 1,
    "unitPrice": 250.00,
    "subtotal": 250.00,
    "shippingFee": 0,
    "totalAmount": 250.00,
    "currency": "MYR",
    "paymentTransactionId": "transaction_id",
    "paymentStatus": "PENDING",
    "platformFee": 12.50,
    "sellerPayout": 237.50,
    "status": "PENDING",
    "shippingAddress": {
      "fullName": "John Doe",
      "addressLine1": "123 Main Street",
      "city": "Kuala Lumpur",
      "state": "Wilayah Persekutuan",
      "postalCode": "50200",
      "country": "Malaysia",
      "phone": "+60123456789"
    },
    "createdAt": "2025-10-19T08:00:00.000Z",
    "listing": {
      "id": "listing_id",
      "title": "Vintage Camera",
      "images": ["https://example.com/image1.jpg"]
    },
    "buyer": {
      "id": "buyer_id",
      "fullName": "Jane Smith",
      "username": "janesmith"
    },
    "seller": {
      "id": "seller_id",
      "fullName": "John Doe",
      "username": "johndoe"
    },
    "paymentIntent": {
      "transactionId": "transaction_id",
      "clientSecret": "https://checkout.xendit.co/web/xxx",
      "expiresAt": "2025-10-20T08:00:00.000Z"
    }
  }
}
```

### Get Purchases
**GET** `/orders/purchases`
- **Auth Required:** Yes
- **Description:** Get all orders where user is the buyer

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)
- `status` (string) - Filter by order status

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "order_id",
      "totalAmount": 250.00,
      "status": "DELIVERED",
      "paymentStatus": "SUCCEEDED",
      "createdAt": "2025-10-19T08:00:00.000Z",
      "listing": {
        "id": "listing_id",
        "title": "Vintage Camera",
        "images": ["https://example.com/image1.jpg"]
      },
      "seller": {
        "id": "seller_id",
        "fullName": "John Doe",
        "username": "johndoe"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "totalPages": 1,
    "hasMore": false
  }
}
```

### Get Sales
**GET** `/orders/sales`
- **Auth Required:** Yes
- **Description:** Get all orders where user is the seller

**Query Parameters:** Same as Get Purchases

**Response:** Same format as Get Purchases

### Get Order Details
**GET** `/orders/:id`
- **Auth Required:** Yes (must be buyer or seller)
- **Description:** Get detailed order information

**Response:** Same format as Create Order (without paymentIntent)

### Update Order
**PUT** `/orders/:id`
- **Auth Required:** Yes (seller only)
- **Description:** Update order status and tracking

**Request Body:**
```json
{
  "status": "SHIPPED",
  "trackingNumber": "TRACK123456",
  "notes": "Shipped via Pos Malaysia"
}
```

**Response:** Same format as Get Order Details

### Cancel Order
**POST** `/orders/:id/cancel`
- **Auth Required:** Yes (buyer or seller)
- **Description:** Cancel an order

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "order_id",
    "status": "CANCELED",
    "canceledAt": "2025-10-19T08:30:00.000Z"
  }
}
```

---

## Reviews

### Create Review
**POST** `/reviews`
- **Auth Required:** Yes
- **Description:** Create a review for a completed order

**Request Body:**
```json
{
  "orderId": "order_id",
  "revieweeId": "seller_id",
  "rating": 5,
  "comment": "Excellent seller! Item as described."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "review_id",
    "orderId": "order_id",
    "reviewerId": "reviewer_id",
    "revieweeId": "reviewee_id",
    "rating": 5,
    "comment": "Excellent seller! Item as described.",
    "createdAt": "2025-10-19T08:00:00.000Z",
    "reviewer": {
      "id": "reviewer_id",
      "fullName": "Jane Smith",
      "username": "janesmith"
    },
    "reviewee": {
      "id": "reviewee_id",
      "fullName": "John Doe",
      "username": "johndoe"
    },
    "order": {
      "id": "order_id",
      "listing": {
        "id": "listing_id",
        "title": "Vintage Camera"
      }
    }
  }
}
```

### Get Reviews Received
**GET** `/reviews/received`
- **Auth Required:** Yes
- **Description:** Get all reviews received as a seller

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "review_id",
      "rating": 5,
      "comment": "Excellent seller!",
      "createdAt": "2025-10-19T08:00:00.000Z",
      "reviewer": {
        "id": "reviewer_id",
        "fullName": "Jane Smith",
        "username": "janesmith"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 10,
    "totalPages": 1,
    "hasMore": false
  }
}
```

### Get Reviews Given
**GET** `/reviews/given`
- **Auth Required:** Yes
- **Description:** Get all reviews given as a buyer

**Query Parameters:** Same as Get Reviews Received

**Response:** Same format as Get Reviews Received

---

## Disputes

### Create Dispute
**POST** `/disputes`
- **Auth Required:** Yes
- **Description:** Create a dispute for an order

**Request Body:**
```json
{
  "orderId": "order_id",
  "reason": "Item not as described",
  "description": "The item received does not match the listing description"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "dispute_id",
    "orderId": "order_id",
    "initiatedBy": "user_id",
    "reason": "Item not as described",
    "status": "OPEN",
    "resolution": null,
    "createdAt": "2025-10-19T08:00:00.000Z",
    "order": {
      "id": "order_id",
      "listing": {
        "id": "listing_id",
        "title": "Vintage Camera"
      },
      "buyer": {
        "id": "buyer_id",
        "fullName": "Jane Smith",
        "username": "janesmith"
      },
      "seller": {
        "id": "seller_id",
        "fullName": "John Doe",
        "username": "johndoe"
      }
    },
    "initiator": {
      "id": "user_id",
      "fullName": "Jane Smith",
      "username": "janesmith"
    }
  }
}
```

### Get Dispute
**GET** `/disputes/:id`
- **Auth Required:** Yes (buyer, seller, or admin)
- **Description:** Get dispute details

**Response:** Same format as Create Dispute

### Update Dispute
**PUT** `/disputes/:id`
- **Auth Required:** Yes (admin or involved parties)
- **Description:** Update dispute status and resolution

**Request Body:**
```json
{
  "status": "RESOLVED",
  "resolution": {
    "action": "REFUND",
    "amount": 250.00,
    "notes": "Full refund processed to buyer"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "dispute_id",
    "status": "RESOLVED",
    "resolution": {
      "action": "REFUND",
      "amount": 250.00,
      "notes": "Full refund processed to buyer"
    },
    "resolvedAt": "2025-10-19T09:00:00.000Z"
  }
}
```

---

## Stats

### Get Seller Stats
**GET** `/stats/seller`
- **Auth Required:** Yes
- **Description:** Get seller statistics for dashboard

**Response:**
```json
{
  "success": true,
  "data": {
    "totalListings": 15,
    "activeListings": 10,
    "soldListings": 5,
    "totalOrders": 20,
    "completedOrders": 18,
    "totalRevenue": 5000.00,
    "averageRating": 4.7,
    "totalReviews": 15,
    "pendingPayouts": 250.00
  }
}
```

### Get Buyer Stats
**GET** `/stats/buyer`
- **Auth Required:** Yes
- **Description:** Get buyer statistics for dashboard

**Response:**
```json
{
  "success": true,
  "data": {
    "totalOrders": 25,
    "completedOrders": 23,
    "totalSpent": 3500.00,
    "reviewsGiven": 20,
    "averageRating": 4.5
  }
}
```

---

## Discovery

### Get Trending Listings
**GET** `/discovery/trending`
- **Auth Required:** No
- **Description:** Get trending/popular listings

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)
- `category` (string)
- `location` (string)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "listing_id",
      "title": "Vintage Camera",
      "price": 250.00,
      "currency": "MYR",
      "category": "Electronics",
      "location": "Kuala Lumpur",
      "images": ["https://example.com/image1.jpg"],
      "status": "ACTIVE",
      "seller": {
        "id": "seller_id",
        "fullName": "John Doe",
        "username": "johndoe",
        "trustScore": 85
      },
      "stats": {
        "viewCount": 150,
        "cartCount": 25
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3,
    "hasMore": true
  }
}
```

### Get Recommended Listings
**GET** `/discovery/recommended`
- **Auth Required:** Yes
- **Description:** Get personalized listing recommendations

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "listing_id",
      "title": "Vintage Camera",
      "price": 250.00,
      "relevanceScore": 0.85,
      "seller": {
        "id": "seller_id",
        "fullName": "John Doe",
        "username": "johndoe"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 30,
    "totalPages": 2,
    "hasMore": true
  }
}
```

### Get Nearby Listings
**GET** `/discovery/nearby`
- **Auth Required:** No
- **Description:** Get listings near a specific location

**Query Parameters:**
- `location` (string, required) - City or area name
- `page` (number, default: 1)
- `limit` (number, default: 20)
- `category` (string)

**Response:** Same format as Get Trending Listings

---

## Metadata

### Get Categories
**GET** `/metadata/categories`
- **Auth Required:** No
- **Description:** Get all available listing categories

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "value": "Electronics",
      "label": "Electronics"
    },
    {
      "value": "Fashion",
      "label": "Fashion"
    },
    {
      "value": "Home & Garden",
      "label": "Home & Garden"
    },
    {
      "value": "Sports & Outdoors",
      "label": "Sports & Outdoors"
    },
    {
      "value": "Books & Media",
      "label": "Books & Media"
    },
    {
      "value": "Toys & Games",
      "label": "Toys & Games"
    },
    {
      "value": "Health & Beauty",
      "label": "Health & Beauty"
    },
    {
      "value": "Automotive",
      "label": "Automotive"
    },
    {
      "value": "Other",
      "label": "Other"
    }
  ]
}
```

### Get Listing Statuses
**GET** `/metadata/listing-statuses`
- **Auth Required:** No
- **Description:** Get all listing status options

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "value": "DRAFT",
      "label": "Draft",
      "description": "Listing is being prepared"
    },
    {
      "value": "ACTIVE",
      "label": "Active",
      "description": "Listing is live and available for purchase"
    },
    {
      "value": "SOLD",
      "label": "Sold",
      "description": "Listing has been sold"
    },
    {
      "value": "EXPIRED",
      "label": "Expired",
      "description": "Listing has expired"
    },
    {
      "value": "REMOVED",
      "label": "Removed",
      "description": "Listing has been removed by user or admin"
    }
  ]
}
```

### Get Order Statuses
**GET** `/metadata/order-statuses`
- **Auth Required:** No
- **Description:** Get all order status options

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "value": "CART",
      "label": "In Cart",
      "description": "Item is in shopping cart"
    },
    {
      "value": "PENDING",
      "label": "Pending",
      "description": "Order placed, awaiting payment confirmation"
    },
    {
      "value": "CONFIRMED",
      "label": "Confirmed",
      "description": "Payment confirmed, awaiting shipment"
    },
    {
      "value": "SHIPPED",
      "label": "Shipped",
      "description": "Order has been shipped"
    },
    {
      "value": "DELIVERED",
      "label": "Delivered",
      "description": "Order has been delivered"
    },
    {
      "value": "CANCELED",
      "label": "Canceled",
      "description": "Order has been canceled"
    },
    {
      "value": "REFUNDED",
      "label": "Refunded",
      "description": "Order has been refunded"
    },
    {
      "value": "DISPUTED",
      "label": "Disputed",
      "description": "Order is under dispute"
    }
  ]
}
```

### Get Payment Statuses
**GET** `/metadata/payment-statuses`
- **Auth Required:** No
- **Description:** Get all payment status options

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "value": "PENDING",
      "label": "Pending",
      "description": "Payment is pending"
    },
    {
      "value": "PROCESSING",
      "label": "Processing",
      "description": "Payment is being processed"
    },
    {
      "value": "SUCCEEDED",
      "label": "Succeeded",
      "description": "Payment completed successfully"
    },
    {
      "value": "FAILED",
      "label": "Failed",
      "description": "Payment failed"
    },
    {
      "value": "CANCELED",
      "label": "Canceled",
      "description": "Payment was canceled"
    },
    {
      "value": "REFUNDED",
      "label": "Refunded",
      "description": "Payment has been refunded"
    },
    {
      "value": "PARTIALLY_REFUNDED",
      "label": "Partially Refunded",
      "description": "Payment has been partially refunded"
    }
  ]
}
```

### Get Currencies
**GET** `/metadata/currencies`
- **Auth Required:** No
- **Description:** Get supported currencies

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "code": "MYR",
      "symbol": "RM",
      "name": "Malaysian Ringgit",
      "isDefault": true
    },
    {
      "code": "USD",
      "symbol": "$",
      "name": "US Dollar",
      "isDefault": false
    },
    {
      "code": "SGD",
      "symbol": "S$",
      "name": "Singapore Dollar",
      "isDefault": false
    },
    {
      "code": "EUR",
      "symbol": "€",
      "name": "Euro",
      "isDefault": false
    }
  ]
}
```

### Get Constants
**GET** `/metadata/constants`
- **Auth Required:** No
- **Description:** Get marketplace configuration constants

**Response:**
```json
{
  "success": true,
  "data": {
    "maxImagesPerListing": 10,
    "maxCartItems": 50,
    "maxQuantityPerItem": 100,
    "minRating": 1,
    "maxRating": 5,
    "orderExpiryDays": 30,
    "platformFeePercentage": 5,
    "defaultCurrency": "MYR"
  }
}
```

---

## Payment Flow

1. **Create Order** - POST `/orders`
   - Creates order with `PENDING` status
   - Creates payment intent via payment gateway
   - Returns `clientSecret` (Xendit/Stripe checkout URL)

2. **Frontend Payment** - User completes payment on gateway hosted page

3. **Webhook** - Payment gateway sends webhook to backend
   - Updates payment transaction: `PENDING` → `SUCCEEDED`
   - Updates order: `paymentStatus` → `SUCCEEDED`, `status` → `CONFIRMED`
   - Sets `confirmedAt` timestamp
   - Triggers payout to seller

4. **Order Fulfillment**
   - Seller updates status: `CONFIRMED` → `SHIPPED` → `DELIVERED`
   - Buyer can leave review after delivery

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "success": false,
  "error": "Error message description"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid auth token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## Business Rules

### Listings
- Maximum 10 images per listing
- Price must be greater than 0
- Draft listings are only visible to owner
- Sold listings cannot be purchased

### Cart
- Maximum 50 items per cart
- Cannot add own listings to cart
- Quantity cannot exceed available stock
- Cart items auto-removed after order creation

### Orders
- Platform fee: 5% of subtotal
- Seller receives: Subtotal - Platform Fee
- Orders auto-expire after 30 days (configurable)
- Cannot cancel orders after shipment

### Reviews
- Only allowed for `DELIVERED` orders
- Rating: 1-5 stars (integer)
- One review per order
- Cannot review own listings

### Disputes
- Can be created for any order
- Resolution requires admin action
- Possible resolutions: REFUND, REPLACEMENT, NO_ACTION

---

## Rate Limiting

All endpoints are subject to rate limiting:
- **Public endpoints:** 100 requests/minute
- **Authenticated endpoints:** 200 requests/minute
- **Write operations (POST/PUT/DELETE):** 50 requests/minute

---

## Webhooks

### Payment Confirmation
When payment is confirmed by the gateway:

**Payload:**
```json
{
  "event": "payment.succeeded",
  "data": {
    "transactionId": "transaction_id",
    "orderId": "order_id",
    "amount": 250.00,
    "currency": "MYR"
  }
}
```

**Actions:**
- Updates order status to `CONFIRMED`
- Updates payment status to `SUCCEEDED`
- Initiates seller payout

---

## SDK Examples

### JavaScript/TypeScript

#### Upload Images and Create Listing
```typescript
// Step 1: Upload images first
const uploadImages = async (files: File[]) => {
  const formData = new FormData();
  files.forEach(file => formData.append('images', file));

  const response = await fetch('https://api.bersemuka.com/v2/marketplace/upload-images', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  const { data } = await response.json();
  return data.imageKeys; // Array of storage keys/paths
};

// Step 2: Create listing with image keys
const createListing = async (imageKeys: string[]) => {
  const response = await fetch('https://api.bersemuka.com/v2/marketplace/listings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: 'Vintage Camera',
      description: 'Classic film camera in excellent condition',
      category: 'Electronics',
      price: 250.00,
      currency: 'MYR',
      quantity: 1,
      location: 'Kuala Lumpur',
      images: imageKeys, // Use image keys, not full URLs
      status: 'ACTIVE'
    })
  });

  return await response.json();
};

// Usage
const imageFiles = [file1, file2, file3]; // From file input
const imageKeys = await uploadImages(imageFiles);
const listing = await createListing(imageKeys);
```

#### Create Order
```typescript
// Create Order
const response = await fetch('https://api.bersemuka.com/v2/marketplace/orders', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    listingId: 'listing_123',
    quantity: 1,
    shippingAddress: {
      fullName: 'John Doe',
      addressLine1: '123 Main St',
      city: 'Kuala Lumpur',
      state: 'Wilayah Persekutuan',
      postalCode: '50200',
      country: 'Malaysia',
      phone: '+60123456789'
    }
  })
});

const { data } = await response.json();
// Redirect user to data.paymentIntent.clientSecret for payment
window.location.href = data.paymentIntent.clientSecret;
```

### Mobile (React Native)

#### Upload Images from Camera/Gallery
```typescript
import { launchImageLibrary } from 'react-native-image-picker';
import DocumentPicker from 'react-native-document-picker';

// Pick multiple images
const pickImages = async () => {
  const result = await launchImageLibrary({
    mediaType: 'photo',
    selectionLimit: 10, // Max 10 images
    quality: 0.8
  });

  if (result.assets) {
    return result.assets;
  }
};

// Upload to server
const uploadListingImages = async (images) => {
  const formData = new FormData();
  
  images.forEach((image) => {
    formData.append('images', {
      uri: image.uri,
      type: image.type || 'image/jpeg',
      name: image.fileName || `photo_${Date.now()}.jpg`
    });
  });

  const response = await fetch('https://api.bersemuka.com/v2/marketplace/upload-images', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'multipart/form-data'
    },
    body: formData
  });

  const { data } = await response.json();
  return data.imageKeys; // Array of storage keys/paths
};

// Full workflow
const createListingWithImages = async () => {
  const selectedImages = await pickImages();
  const imageKeys = await uploadListingImages(selectedImages);
  
  // Create listing
  const response = await fetch('https://api.bersemuka.com/v2/marketplace/listings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: 'Vintage Camera',
      description: 'Classic film camera',
      category: 'Electronics',
      price: 250.00,
      currency: 'MYR',
      quantity: 1,
      images: imageKeys, // Use image keys, not full URLs
      status: 'ACTIVE'
    })
  });

  return await response.json();
};
```

#### Get Metadata on App Launch
```typescript
// Get Metadata on App Launch
const fetchMetadata = async () => {
  const [categories, statuses, currencies, constants] = await Promise.all([
    fetch('https://api.bersemuka.com/v2/marketplace/metadata/categories'),
    fetch('https://api.bersemuka.com/v2/marketplace/metadata/order-statuses'),
    fetch('https://api.bersemuka.com/v2/marketplace/metadata/currencies'),
    fetch('https://api.bersemuka.com/v2/marketplace/metadata/constants')
  ]);
  
  return {
    categories: await categories.json(),
    statuses: await statuses.json(),
    currencies: await currencies.json(),
    constants: await constants.json()
  };
};
```

---

## Changelog

### Version 2.0 (Current)
- Added `/upload-images` endpoint for multiple image uploads (up to 10 images per request)
- Enhanced listing creation workflow with dedicated image upload step
- Images stored as keys/paths in database, automatically converted to full CDN URLs in API responses
- Added payment gateway integration
- Added metadata endpoints for dynamic configuration
- Added discovery endpoints (trending, recommended, nearby)
- Added seller/buyer statistics
- Enhanced order tracking with timestamps
- Added dispute resolution system

---

## Support

For API support, contact: api-support@bersemuka.com
