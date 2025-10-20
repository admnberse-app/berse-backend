# Subscriptions API Documentation

**Base URL:** `https://api.berse-app.com/api` or `/v2`  
**Version:** 2.1.0  
**Last Updated:** October 21, 2025

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Subscription Tiers](#subscription-tiers)
4. [Public Endpoints](#public-endpoints)
5. [User Endpoints](#user-endpoints)
6. [Access Control Endpoints](#access-control-endpoints)
7. [Admin Endpoints](#admin-endpoints)
8. [Webhook Endpoints](#webhook-endpoints)
9. [Error Handling](#error-handling)
10. [Payment Flow](#payment-flow)
11. [Testing](#testing)

---

## Overview

The Subscription API implements a **dual-gating system** that combines:
- **Subscription Tier** (FREE, BASIC, PREMIUM) - Determines WHAT features are accessible
- **Trust Score** (0-100%) - Determines HOW MUCH users can use features

### Key Features
- ✅ Three subscription tiers with monthly/yearly billing
- ✅ 35+ feature codes with granular access control
- ✅ Admin dynamic configuration (no code deployments for pricing changes)
- ✅ Dual payment gateway support (Xendit for SEA, Stripe for global)
- ✅ Webhook-based payment confirmation
- ✅ Prorated billing for upgrades

### Pricing Structure

| Tier | Monthly | Yearly | Savings |
|------|---------|--------|---------|
| **FREE** | RM 0 | RM 0 | - |
| **BASIC** | RM 30 | RM 300 | 17% |
| **PREMIUM** | RM 50 | RM 500 | 17% |

---

## Authentication

Most endpoints require JWT authentication.

**Header:**
```http
Authorization: Bearer <jwt_token>
```

**Public Endpoints** (no auth required):
- `GET /api/subscriptions/tiers`
- `GET /api/subscriptions/tiers/:tierCode`

**Admin Endpoints** require additional admin role verification.

---

## Subscription Tiers

### Tier Codes
```typescript
enum SubscriptionTier {
  FREE = 'FREE',
  BASIC = 'BASIC',
  PREMIUM = 'PREMIUM'
}
```

### Billing Cycles
```typescript
enum BillingCycle {
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY'
}
```

### Subscription Status
```typescript
enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',           // Subscription is active
  TRIALING = 'TRIALING',       // Free trial period
  PAST_DUE = 'PAST_DUE',       // Payment failed
  CANCELED = 'CANCELED',       // User canceled
  EXPIRED = 'EXPIRED',         // Billing period ended
  PAUSED = 'PAUSED',           // Temporarily paused
  INCOMPLETE = 'INCOMPLETE'    // Payment pending
}
```

---

## Public Endpoints

### 1. Get All Subscription Tiers

**Endpoint:** `GET /api/subscriptions/tiers`

**Description:** Retrieve all active subscription tiers with pricing and features.

**Authentication:** None required

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "tier_free_123",
      "tierCode": "FREE",
      "name": "Free Plan",
      "description": "Perfect for getting started with Berse",
      "price": 0,
      "currency": "MYR",
      "billingCycle": "MONTHLY",
      "features": {
        "maxEventsPerMonth": 3,
        "maxEventPhotos": 1,
        "maxCommunitiesOwned": 0,
        "maxCommunitiesJoined": 5,
        "maxVouchesPerMonth": 2,
        "maxDirectMessages": 10,
        "maxGroupChats": 2,
        "maxSavedSearches": 3,
        "cardGameUnlocksPerMonth": 1,
        "prioritySupport": false,
        "customBranding": false,
        "advancedAnalytics": false,
        "dataExport": false
      },
      "enabledFeatures": [
        "BROWSE_EVENTS",
        "JOIN_EVENTS",
        "VIEW_PROFILES",
        "CARDGAME_VIEW"
      ],
      "isActive": true,
      "displayOrder": 1,
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-10-21T00:00:00Z"
    },
    {
      "id": "tier_basic_456",
      "tierCode": "BASIC",
      "name": "Basic Plan",
      "description": "Great for active community members",
      "price": 30,
      "currency": "MYR",
      "billingCycle": "MONTHLY",
      "features": {
        "maxEventsPerMonth": 10,
        "maxEventPhotos": 5,
        "maxCommunitiesOwned": 2,
        "maxCommunitiesJoined": 20,
        "maxVouchesPerMonth": 10,
        "maxDirectMessages": 100,
        "maxGroupChats": 10,
        "maxSavedSearches": 10,
        "cardGameUnlocksPerMonth": 5,
        "prioritySupport": false,
        "customBranding": false,
        "advancedAnalytics": false,
        "dataExport": true
      },
      "enabledFeatures": [
        "BROWSE_EVENTS",
        "JOIN_EVENTS",
        "CREATE_EVENTS",
        "EVENT_PHOTO_UPLOAD",
        "HOSTING_CALENDAR",
        "CREATE_COMMUNITIES",
        "CARDGAME_UNLOCK_OWN",
        "GIVE_VOUCH",
        "DIRECT_MESSAGING",
        "CITY_SEARCH"
      ],
      "isActive": true,
      "displayOrder": 2
    }
  ]
}
```

---

### 2. Get Specific Tier Details

**Endpoint:** `GET /api/subscriptions/tiers/:tierCode`

**Description:** Get detailed information about a specific tier.

**Parameters:**
- `tierCode` (path) - Tier code: `FREE`, `BASIC`, or `PREMIUM`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "tier_basic_456",
    "tierCode": "BASIC",
    "name": "Basic Plan",
    "price": 30,
    "features": { ... },
    "enabledFeatures": [ ... ]
  }
}
```

**Error (404):**
```json
{
  "success": false,
  "error": "Tier not found"
}
```

---

## User Endpoints

### 3. Get My Subscription

**Endpoint:** `GET /api/subscriptions/my`

**Authentication:** Required

**Description:** Get the authenticated user's current subscription details.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "sub_789",
    "userId": "user_123",
    "tierCode": "BASIC",
    "status": "ACTIVE",
    "billingCycle": "MONTHLY",
    "currentPeriodStart": "2025-10-01T00:00:00Z",
    "currentPeriodEnd": "2025-11-01T00:00:00Z",
    "canceledAt": null,
    "tier": {
      "tierCode": "BASIC",
      "name": "Basic Plan",
      "price": 30,
      "features": { ... }
    }
  }
}
```

---

### 4. Subscribe to Tier

**Endpoint:** `POST /api/subscriptions/subscribe`

**Authentication:** Required

**Description:** Create a new subscription. FREE tier activates immediately. Paid tiers return a payment intent.

**Request Body:**
```json
{
  "tierCode": "BASIC",
  "billingCycle": "MONTHLY",
  "paymentGateway": "XENDIT"  // Required for paid tiers: "XENDIT" or "STRIPE"
}
```

**Response (FREE tier):**
```json
{
  "success": true,
  "data": {
    "id": "sub_123",
    "tierCode": "FREE",
    "status": "ACTIVE",
    "tier": { ... }
  }
}
```

**Response (PAID tier):**
```json
{
  "success": true,
  "data": {
    "subscription": {
      "id": "sub_456",
      "tierCode": "BASIC",
      "status": "INCOMPLETE",
      "tier": { ... }
    },
    "payment": {
      "id": "xendit_inv_789",
      "amount": 30,
      "currency": "MYR",
      "status": "pending",
      "gatewayId": "xendit_inv_789",
      "gateway": "XENDIT",
      "metadata": {
        "checkoutUrl": "https://checkout.xendit.co/web/xyz123"
      }
    }
  }
}
```

**Flow for Paid Tiers:**
1. Call this endpoint with `paymentGateway`
2. Redirect user to `payment.metadata.checkoutUrl`
3. User completes payment
4. Payment gateway sends webhook to `/api/webhooks/payment/{gateway}`
5. Subscription status updates to `ACTIVE`
6. User gains access to features

**Validation Errors:**
```json
{
  "success": false,
  "error": "Tier code is required"
}
```

```json
{
  "success": false,
  "error": "Payment gateway is required for paid tiers"
}
```

---

### 5. Upgrade Subscription

**Endpoint:** `PUT /api/subscriptions/upgrade`

**Authentication:** Required

**Description:** Upgrade to a higher tier with prorated billing.

**Request Body:**
```json
{
  "newTierCode": "PREMIUM",
  "paymentGateway": "STRIPE"  // Required for paid upgrades
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "subscription": {
      "id": "sub_456",
      "tierCode": "PREMIUM",
      "status": "ACTIVE"
    },
    "payment": {
      "id": "stripe_cs_xyz",
      "amount": 20,  // Prorated amount
      "currency": "MYR",
      "metadata": {
        "checkoutUrl": "https://checkout.stripe.com/..."
      }
    }
  }
}
```

---

### 6. Cancel Subscription

**Endpoint:** `POST /api/subscriptions/cancel`

**Authentication:** Required

**Description:** Cancel the active subscription. User retains access until end of billing period.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "sub_456",
    "status": "CANCELED",
    "canceledAt": "2025-10-21T10:30:00Z",
    "currentPeriodEnd": "2025-11-01T00:00:00Z",
    "message": "Subscription canceled. Access remains until 2025-11-01."
  }
}
```

---

### 7. Calculate Upgrade Cost

**Endpoint:** `POST /api/subscriptions/upgrade/calculate`

**Authentication:** Required

**Description:** Calculate the prorated cost to upgrade to a higher tier.

**Request Body:**
```json
{
  "newTierCode": "PREMIUM"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "currentTier": "BASIC",
    "newTier": "PREMIUM",
    "currentPrice": 30,
    "newPrice": 50,
    "proratedAmount": 18.50,
    "daysRemaining": 11,
    "nextBillingDate": "2025-11-01T00:00:00Z"
  }
}
```

---

## Access Control Endpoints

### 8. Check Feature Access

**Endpoint:** `POST /api/subscriptions/access/check`

**Authentication:** Required

**Description:** Check if the user has access to a specific feature (dual-gating check).

**Request Body:**
```json
{
  "feature": "CREATE_EVENTS"
}
```

**Response (Access Granted):**
```json
{
  "success": true,
  "data": {
    "feature": "CREATE_EVENTS",
    "hasAccess": true,
    "reason": "User has BASIC subscription (required: BASIC) and trust score 35% meets Trusted requirement (26-50%)",
    "subscriptionRequired": "BASIC",
    "trustRequired": "trusted",
    "trustScore": 35
  }
}
```

**Response (Access Denied - Subscription):**
```json
{
  "success": true,
  "data": {
    "feature": "ADVANCED_ANALYTICS",
    "hasAccess": false,
    "reason": "Requires PREMIUM subscription (current: BASIC)",
    "subscriptionRequired": "PREMIUM",
    "upgradeUrl": "/api/subscriptions/tiers/PREMIUM"
  }
}
```

**Response (Access Denied - Trust):**
```json
{
  "success": true,
  "data": {
    "feature": "COMMUNITY_MANAGEMENT",
    "hasAccess": false,
    "reason": "Requires Scout trust level (51-75%) but current trust is 35%",
    "trustRequired": "scout",
    "trustScore": 35,
    "trustGap": 16
  }
}
```

---

### 9. Get Access Summary

**Endpoint:** `GET /api/subscriptions/access/summary`

**Authentication:** Required

**Description:** Get complete overview of user's subscription, trust, and accessible features.

**Response:**
```json
{
  "success": true,
  "data": {
    "subscription": {
      "tierCode": "BASIC",
      "status": "ACTIVE",
      "currentPeriodEnd": "2025-11-01T00:00:00Z"
    },
    "trustLevel": "trusted",
    "trustScore": 35,
    "accessibleFeatures": [
      "BROWSE_EVENTS",
      "JOIN_EVENTS",
      "CREATE_EVENTS",
      "EVENT_PHOTO_UPLOAD",
      "HOSTING_CALENDAR",
      "GIVE_VOUCH",
      "DIRECT_MESSAGING"
    ],
    "featureDetails": [
      {
        "feature": "CREATE_EVENTS",
        "hasAccess": true,
        "subscriptionMet": true,
        "trustMet": true
      },
      {
        "feature": "ADVANCED_ANALYTICS",
        "hasAccess": false,
        "subscriptionMet": false,
        "trustMet": true,
        "upgradeRequired": "PREMIUM"
      }
    ]
  }
}
```

---

### 10. Get Feature Usage Stats

**Endpoint:** `GET /api/subscriptions/usage/:feature`

**Authentication:** Required

**Description:** Check current usage against feature limits (e.g., events created this month).

**Parameters:**
- `feature` (path) - Feature code (e.g., `CREATE_EVENTS`)

**Response:**
```json
{
  "success": true,
  "data": {
    "feature": "CREATE_EVENTS",
    "currentUsage": 7,
    "limit": 10,
    "remaining": 3,
    "resetDate": "2025-11-01T00:00:00Z",
    "percentage": 70
  }
}
```

---

### 11. Get Subscription Stats

**Endpoint:** `GET /api/subscriptions/stats`

**Authentication:** Required

**Description:** Get user's subscription statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "currentTier": "BASIC",
    "subscriptionAge": 45,  // days
    "lifetimeValue": 60,    // RM
    "upcomingRenewal": "2025-11-01T00:00:00Z",
    "featuresUsed": 12,
    "featuresAvailable": 18
  }
}
```

---

## Admin Endpoints

**Base Path:** `/api/admin/subscriptions`

**Authentication:** Required (Admin role)

### 12. Get All Tiers (Admin)

**Endpoint:** `GET /api/admin/subscriptions/tiers`

**Description:** Get all tiers including inactive ones.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "tierCode": "FREE",
      "isActive": true,
      ...
    },
    {
      "tierCode": "ENTERPRISE",
      "isActive": false,
      ...
    }
  ]
}
```

---

### 13. Create Tier (Admin)

**Endpoint:** `POST /api/admin/subscriptions/tiers`

**Request Body:**
```json
{
  "tierCode": "ENTERPRISE",
  "name": "Enterprise Plan",
  "description": "For large organizations",
  "price": 200,
  "currency": "MYR",
  "billingCycle": "MONTHLY"
}
```

---

### 14. Update Tier (Admin)

**Endpoint:** `PUT /api/admin/subscriptions/tiers/:tierCode`

**Request Body:**
```json
{
  "name": "Basic Plan (Updated)",
  "description": "New description",
  "isActive": true,
  "displayOrder": 2
}
```

---

### 15. Update Tier Pricing (Admin)

**Endpoint:** `PUT /api/admin/subscriptions/tiers/:tierCode/pricing`

**Description:** Update pricing for a tier. Affects new subscriptions only.

**Request Body:**
```json
{
  "price": 25,
  "currency": "MYR"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "tierCode": "BASIC",
    "price": 25,
    "previousPrice": 30,
    "effectiveDate": "2025-10-21T10:30:00Z"
  }
}
```

---

### 16. Update Tier Features (Admin)

**Endpoint:** `PUT /api/admin/subscriptions/tiers/:tierCode/features`

**Description:** Update feature limits and capabilities.

**Request Body:**
```json
{
  "features": {
    "maxEventsPerMonth": 15,
    "maxEventPhotos": 10,
    "prioritySupport": true
  },
  "enabledFeatures": [
    "BROWSE_EVENTS",
    "CREATE_EVENTS",
    "ADVANCED_SEARCH"
  ]
}
```

---

### 17. Deactivate Tier (Admin)

**Endpoint:** `POST /api/admin/subscriptions/tiers/:tierCode/deactivate`

**Description:** Deactivate a tier (hide from public, existing subscriptions unaffected).

---

### 18. Get Admin Statistics (Admin)

**Endpoint:** `GET /api/admin/subscriptions/stats`

**Response:**
```json
{
  "success": true,
  "data": {
    "totalSubscriptions": 1250,
    "activeSubscriptions": 1100,
    "monthlyRevenue": 38000,
    "tierBreakdown": {
      "FREE": 800,
      "BASIC": 250,
      "PREMIUM": 50
    },
    "conversionRate": {
      "freeToBasic": 31.25,
      "basicToPremium": 20
    },
    "churnRate": 5.2
  }
}
```

---

### 19. Get User Subscription (Admin)

**Endpoint:** `GET /api/admin/subscriptions/users/:userId`

**Description:** View any user's subscription details.

---

## Webhook Endpoints

**Important:** Webhooks are called by payment gateways, not by clients.

### 20. Xendit Webhook

**Endpoint:** `POST /api/webhooks/payment/xendit`

**Headers:**
```
x-callback-token: <XENDIT_WEBHOOK_TOKEN>
```

**Events Handled:**
- `PAID` - Payment successful → Activate subscription
- `EXPIRED` - Invoice expired → Mark as expired
- `FAILED` - Payment failed → Mark subscription as PAST_DUE

---

### 21. Stripe Webhook

**Endpoint:** `POST /api/webhooks/payment/stripe`

**Headers:**
```
stripe-signature: <signature>
```

**Events Handled:**
- `checkout.session.completed` - Payment successful
- `invoice.payment_failed` - Payment failed
- `customer.subscription.deleted` - Subscription canceled

---

## Error Handling

### Common Error Responses

**400 Bad Request:**
```json
{
  "success": false,
  "error": "Invalid tier code"
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "error": "Authentication required"
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "error": "Admin access required"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "error": "Subscription not found"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "error": "Failed to create subscription",
  "message": "Internal server error"
}
```

---

## Payment Flow

### Complete Purchase Flow

```
1. User selects tier
   ↓
2. Frontend: POST /api/subscriptions/subscribe
   {
     "tierCode": "BASIC",
     "billingCycle": "MONTHLY",
     "paymentGateway": "XENDIT"
   }
   ↓
3. Backend creates payment intent
   ↓
4. Response includes checkoutUrl
   ↓
5. Frontend redirects to checkoutUrl
   ↓
6. User completes payment at gateway
   ↓
7. Gateway sends webhook to /api/webhooks/payment/xendit
   ↓
8. Backend updates subscription status → ACTIVE
   ↓
9. User can now access BASIC features
```

### Feature Access Check Flow

```
1. User attempts action (e.g., create event)
   ↓
2. Backend: Check feature access
   - Get user subscription (BASIC)
   - Get user trust score (35%)
   - Check CREATE_EVENTS requirements:
     * Subscription: BASIC ✓
     * Trust: Trusted (26-50%) ✓
   ↓
3. Grant access → User creates event
```

---

## Testing

### Test Mode Setup

#### Xendit Test Mode
```bash
# Use test API keys
XENDIT_SECRET_KEY=xnd_development_...
XENDIT_PUBLIC_KEY=xnd_public_development_...
```

**Test Cards:**
- Success: `4000000000000002`
- Failure: `4000000000000069`

#### Stripe Test Mode
```bash
# Use test API keys
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
```

**Test Cards:**
- Success: `4242424242424242`
- Declined: `4000000000000002`

### Testing Webhooks

**Xendit:**
```bash
curl -X POST http://localhost:8000/api/webhooks/payment/test \
  -H "Content-Type: application/json" \
  -d '{
    "gateway": "XENDIT",
    "eventType": "PAID",
    "mockData": {
      "id": "test_invoice_123",
      "status": "PAID"
    }
  }'
```

**Stripe CLI:**
```bash
stripe listen --forward-to localhost:8000/api/webhooks/payment/stripe
stripe trigger checkout.session.completed
```

---

## Feature Codes Reference

### Events Features
- `BROWSE_EVENTS` - View event listings
- `JOIN_EVENTS` - Join/RSVP to events
- `CREATE_EVENTS` - Create new events
- `EDIT_OWN_EVENTS` - Edit own events
- `DELETE_OWN_EVENTS` - Delete own events
- `EVENT_PHOTO_UPLOAD` - Upload event photos
- `EVENT_PHOTO_UPLOAD_MULTIPLE` - Upload multiple photos
- `EVENT_QR_CHECKIN` - QR code check-in
- `EVENT_ANALYTICS` - View event analytics

### Calendar Features
- `HOSTING_CALENDAR` - Calendar for hosted events
- `CALENDAR_EXPORT` - Export calendar data

### Community Features
- `CREATE_COMMUNITIES` - Create communities
- `JOIN_COMMUNITIES` - Join communities
- `COMMUNITY_MANAGEMENT` - Manage communities
- `COMMUNITY_ANALYTICS` - Community analytics

### Card Game Features
- `CARDGAME_VIEW` - View card game
- `CARDGAME_UNLOCK_OWN` - Unlock own cards
- `CARDGAME_UNLOCK_MULTIPLE` - Unlock multiple cards
- `CARDGAME_CUSTOMIZE` - Customize cards

### Social Features
- `GIVE_VOUCH` - Give vouches
- `VOUCH_MULTIPLE` - Multiple vouches
- `VIEW_PROFILES` - View user profiles
- `ADVANCED_SEARCH` - Advanced search
- `SAVED_SEARCHES` - Save searches

### Messaging Features
- `DIRECT_MESSAGING` - Direct messages
- `GROUP_MESSAGING` - Group chats
- `PRIORITY_MESSAGING` - Priority messaging

### Discovery Features
- `CITY_SEARCH` - City-based search
- `ADVANCED_FILTERS` - Advanced filters
- `RECOMMENDATIONS` - Personalized recommendations

### Analytics Features
- `BASIC_ANALYTICS` - Basic analytics
- `ADVANCED_ANALYTICS` - Advanced analytics
- `EXPORT_DATA` - Export user data

### Admin Features
- `VERIFY_USERS` - Verify user accounts
- `MODERATE_CONTENT` - Moderate content

---

## Rate Limits

| Endpoint Type | Rate Limit | Window |
|---------------|------------|--------|
| Public endpoints | 100 req/min | Per IP |
| Authenticated endpoints | 200 req/min | Per user |
| Admin endpoints | 500 req/min | Per admin |
| Webhook endpoints | 1000 req/min | Per gateway |

---

## Support

For API issues:
- Check Swagger UI: `https://api.berse-app.com/api-docs`
- Review logs for error details
- Test with payment gateway test modes
- Contact: api-support@berse-app.com

---

**Documentation Version:** 1.0  
**API Version:** 2.1.0  
**Last Updated:** October 21, 2025
