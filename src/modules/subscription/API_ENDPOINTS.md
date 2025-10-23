# Subscription Module - API Endpoints Documentation

## Base URL
```
Production: https://api.berse.app
Development: http://localhost:3000
```

## Authentication
Most endpoints require authentication via Bearer token in the Authorization header:
```
Authorization: Bearer <access_token>
```

---

## 📍 Endpoints Overview

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/subscriptions/tiers` | ❌ | List all subscription tiers |
| GET | `/api/subscriptions/tiers/:tierCode` | ❌ | Get specific tier details |
| GET | `/api/subscriptions/my` | ✅ | Get current user's subscription |
| POST | `/api/subscriptions/subscribe` | ✅ | Create/subscribe to a tier |
| PUT | `/api/subscriptions/upgrade` | ✅ | Upgrade to higher tier |
| POST | `/api/subscriptions/cancel` | ✅ | Cancel subscription |
| POST | `/api/subscriptions/reactivate` | ✅ | Reactivate canceled subscription |
| POST | `/api/subscriptions/check-feature` | ✅ | Check feature access |
| GET | `/api/subscriptions/access-summary` | ✅ | Get complete access summary |
| GET | `/api/subscriptions/usage/:featureCode` | ✅ | Get feature usage stats |
| GET | `/api/subscriptions/stats` | ✅ | Get subscription statistics |
| POST | `/api/subscriptions/calculate-upgrade` | ✅ | Calculate upgrade cost |

---

## 🔓 Public Endpoints

### 1. Get All Subscription Tiers

**Endpoint:** `GET /api/subscriptions/tiers`

**Description:** Retrieve all active and public subscription tiers.

**Request:**
```bash
curl -X GET https://api.berse.app/api/subscriptions/tiers
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "tier_free_001",
      "tierCode": "FREE",
      "tierName": "Free",
      "description": "Basic access to Berse community",
      "price": 0,
      "currency": "MYR",
      "billingCycle": "MONTHLY",
      "features": {
        "maxEventsPerMonth": 5,
        "maxConnections": 50,
        "profileBoost": false,
        "customBadges": false,
        "prioritySupport": false,
        "analytics": false,
        "eventAccess": {
          "canView": true,
          "canJoin": true,
          "canCreate": true,
          "canHost": false,
          "maxEventsPerMonth": 5,
          "canCreatePaidEvents": false
        },
        "marketplaceAccess": {
          "canBuy": false,
          "canSell": false,
          "maxListings": 0
        },
        "communityAccess": {
          "canJoin": true,
          "canCreate": false,
          "maxCommunities": 3
        }
      },
      "displayOrder": 0,
      "isActive": true,
      "isPublic": true,
      "trialDays": 0
    },
    {
      "id": "tier_basic_001",
      "tierCode": "BASIC",
      "tierName": "Basic",
      "description": "Enhanced features for active community members",
      "price": 30,
      "currency": "MYR",
      "billingCycle": "MONTHLY",
      "features": {
        "maxEventsPerMonth": 20,
        "maxConnections": 200,
        "profileBoost": true,
        "customBadges": false,
        "prioritySupport": false,
        "analytics": false,
        "eventAccess": {
          "canView": true,
          "canJoin": true,
          "canCreate": true,
          "canHost": true,
          "maxEventsPerMonth": 20,
          "canCreatePaidEvents": false
        },
        "marketplaceAccess": {
          "canBuy": true,
          "canSell": false,
          "maxListings": 5
        },
        "communityAccess": {
          "canJoin": true,
          "canCreate": true,
          "maxCommunities": 10
        }
      },
      "displayOrder": 1,
      "isActive": true,
      "isPublic": true,
      "trialDays": 14
    }
  ]
}
```

---

### 2. Get Specific Tier Details

**Endpoint:** `GET /api/subscriptions/tiers/:tierCode`

**Description:** Get detailed information about a specific subscription tier.

**Parameters:**
- `tierCode` (path) - Tier code: `FREE` or `BASIC`

**Request:**
```bash
curl -X GET https://api.berse.app/api/subscriptions/tiers/BASIC
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "tier_basic_001",
    "tierCode": "BASIC",
    "tierName": "Basic",
    "description": "Enhanced features for active community members",
    "price": 30,
    "currency": "MYR",
    "billingCycle": "MONTHLY",
    "features": { /* ... full features object ... */ },
    "displayOrder": 1,
    "isActive": true,
    "isPublic": true,
    "trialDays": 14
  }
}
```

**Error Response:** `404 Not Found`
```json
{
  "success": false,
  "error": "Tier not found"
}
```

---

## 🔐 Authenticated Endpoints

### 3. Get My Subscription

**Endpoint:** `GET /api/subscriptions/my`

**Description:** Get the current user's active subscription information.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request:**
```bash
curl -X GET https://api.berse.app/api/subscriptions/my \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "sub_xyz123",
    "userId": "user_abc456",
    "tier": "BASIC",
    "tierName": "Basic",
    "status": "ACTIVE",
    "currentPeriodStart": "2025-10-01T00:00:00.000Z",
    "currentPeriodEnd": "2025-11-01T00:00:00.000Z",
    "cancelAt": null,
    "trialEnd": null,
    "features": {
      "maxEventsPerMonth": 20,
      "maxConnections": 200,
      "profileBoost": true,
      "customBadges": false,
      "prioritySupport": false,
      "analytics": false
    }
  }
}
```

**Status Values:**
- `ACTIVE` - Subscription is active
- `TRIALING` - In trial period
- `PAST_DUE` - Payment failed
- `CANCELED` - Canceled (may still be active until period end)
- `EXPIRED` - Subscription has ended
- `PAUSED` - Temporarily paused
- `INCOMPLETE` - Payment incomplete

---

### 4. Subscribe to Tier

**Endpoint:** `POST /api/subscriptions/subscribe`

**Description:** Create a new subscription to a tier. For paid tiers, initiates payment flow.

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "tierCode": "BASIC",
  "billingCycle": "MONTHLY",
  "paymentGateway": "STRIPE"
}
```

**Parameters:**
- `tierCode` (required) - `FREE` or `BASIC`
- `billingCycle` (optional) - `MONTHLY` or `ANNUAL` (default: `MONTHLY`)
- `paymentGateway` (required for paid tiers) - `STRIPE` or `XENDIT`

**Request:**
```bash
curl -X POST https://api.berse.app/api/subscriptions/subscribe \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tierCode": "BASIC",
    "billingCycle": "MONTHLY",
    "paymentGateway": "STRIPE"
  }'
```

**Response (FREE tier):** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "sub_xyz123",
    "userId": "user_abc456",
    "tier": "FREE",
    "tierName": "Free",
    "status": "ACTIVE",
    "currentPeriodStart": "2025-10-24T00:00:00.000Z",
    "currentPeriodEnd": "2025-11-24T00:00:00.000Z",
    "features": { /* ... */ }
  }
}
```

**Response (PAID tier):** `201 Created`
```json
{
  "success": true,
  "data": {
    "subscription": {
      "id": "sub_xyz123",
      "userId": "user_abc456",
      "tier": "BASIC",
      "tierName": "Basic",
      "status": "TRIALING",
      "currentPeriodStart": "2025-10-24T00:00:00.000Z",
      "currentPeriodEnd": "2025-11-24T00:00:00.000Z",
      "trialEnd": "2025-11-07T00:00:00.000Z"
    },
    "payment": {
      "id": "pi_xyz123",
      "amount": 30,
      "currency": "MYR",
      "status": "pending",
      "gatewayId": "stripe_cs_abc123",
      "gateway": "STRIPE",
      "metadata": {
        "checkoutUrl": "https://checkout.stripe.com/c/pay/cs_abc123"
      }
    }
  }
}
```

**Error Responses:**

`400 Bad Request` - Invalid tier or missing payment gateway
```json
{
  "success": false,
  "error": "Payment gateway is required for paid tiers"
}
```

`409 Conflict` - Already subscribed
```json
{
  "success": false,
  "error": "User already has an active subscription"
}
```

---

### 5. Upgrade Subscription

**Endpoint:** `PUT /api/subscriptions/upgrade`

**Description:** Upgrade to a higher tier subscription.

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "tierCode": "BASIC"
}
```

**Request:**
```bash
curl -X PUT https://api.berse.app/api/subscriptions/upgrade \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tierCode": "BASIC"
  }'
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Subscription upgraded successfully",
  "data": {
    "id": "sub_xyz123",
    "userId": "user_abc456",
    "tier": "BASIC",
    "tierName": "Basic",
    "status": "ACTIVE",
    "currentPeriodStart": "2025-10-24T00:00:00.000Z",
    "currentPeriodEnd": "2025-11-24T00:00:00.000Z",
    "features": { /* ... */ }
  }
}
```

**Error Response:** `400 Bad Request`
```json
{
  "success": false,
  "error": "Not an upgrade - use downgrade method instead"
}
```

---

### 6. Cancel Subscription

**Endpoint:** `POST /api/subscriptions/cancel`

**Description:** Cancel the current subscription. Can be immediate or at end of billing period.

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "immediately": false
}
```

**Parameters:**
- `immediately` (optional) - If `true`, cancels immediately. If `false`, cancels at period end (default: `false`)

**Request:**
```bash
curl -X POST https://api.berse.app/api/subscriptions/cancel \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "immediately": false
  }'
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Subscription will be canceled at end of billing period"
}
```

**Error Response:** `400 Bad Request`
```json
{
  "success": false,
  "error": "No active subscription to cancel"
}
```

---

### 7. Check Feature Access

**Endpoint:** `POST /api/subscriptions/check-feature`

**Description:** Check if the user can access a specific feature (dual-gating: subscription + trust).

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "featureCode": "HOST_EVENTS"
}
```

**Feature Codes:**
- Events: `VIEW_EVENTS`, `JOIN_EVENTS`, `CREATE_EVENTS`, `HOST_EVENTS`
- Marketplace: `VIEW_MARKETPLACE`, `BUY_MARKETPLACE`, `SELL_MARKETPLACE`
- Travel: `JOIN_TRAVEL`, `HOST_TRAVEL`, `HOMESTAY_GUEST`, `HOMESTAY_HOST`
- Services: `USE_SERVICE_MATCHING_CLIENT`, `OFFER_PROFESSIONAL_SERVICES`
- Mentorship: `SEEK_MENTORSHIP`, `PROVIDE_MENTORSHIP`
- Community: `JOIN_COMMUNITIES`, `CREATE_COMMUNITIES`, `MODERATE_COMMUNITIES`, `ADMIN_COMMUNITIES`
- Social: `SEND_CONNECTIONS`, `SEND_MESSAGES`, `VOUCH_FOR_USERS`
- Advanced: `FUNDRAISING`, `PLATFORM_AMBASSADOR`, `REVENUE_SHARING`

**Request:**
```bash
curl -X POST https://api.berse.app/api/subscriptions/check-feature \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "featureCode": "HOST_EVENTS"
  }'
```

**Response (Allowed):** `200 OK`
```json
{
  "success": true,
  "data": {
    "allowed": true
  }
}
```

**Response (Denied):** `200 OK`
```json
{
  "success": true,
  "data": {
    "allowed": false,
    "reason": "Requires BASIC subscription AND Trusted trust level",
    "blockedBy": "both",
    "upgradeOptions": {
      "subscriptionNeeded": {
        "currentTier": "FREE",
        "requiredTier": "BASIC",
        "upgradeCost": 30,
        "currency": "MYR"
      },
      "trustNeeded": {
        "currentLevel": "starter",
        "currentScore": 25,
        "requiredLevel": "trusted",
        "requiredScore": 31,
        "estimatedDays": 21,
        "suggestedActions": [
          "Attend 5-8 events",
          "Get 2-3 vouches from connections",
          "Complete your profile fully",
          "Join and participate in communities"
        ]
      }
    }
  }
}
```

---

### 8. Get Access Summary

**Endpoint:** `GET /api/subscriptions/access-summary`

**Description:** Get complete access summary including subscription, trust level, and all feature access.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request:**
```bash
curl -X GET https://api.berse.app/api/subscriptions/access-summary \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "subscription": {
      "id": "sub_xyz123",
      "tier": "BASIC",
      "tierName": "Basic",
      "status": "ACTIVE",
      "currentPeriodStart": "2025-10-01T00:00:00.000Z",
      "currentPeriodEnd": "2025-11-01T00:00:00.000Z",
      "features": { /* ... */ }
    },
    "trust": {
      "userId": "user_abc456",
      "trustScore": 45,
      "trustLevel": "trusted",
      "vouchCount": 3,
      "momentCount": 5,
      "eventCount": 8
    },
    "accessibleFeatures": [
      "VIEW_EVENTS",
      "JOIN_EVENTS",
      "CREATE_EVENTS",
      "VIEW_MARKETPLACE",
      "BUY_MARKETPLACE",
      "JOIN_COMMUNITIES",
      "CREATE_COMMUNITIES",
      "SEND_MESSAGES"
    ],
    "lockedFeatures": [
      {
        "feature": "SELL_MARKETPLACE",
        "reason": "Requires BASIC subscription",
        "upgradeOptions": {
          "subscriptionNeeded": {
            "currentTier": "FREE",
            "requiredTier": "BASIC",
            "upgradeCost": 30,
            "currency": "MYR"
          }
        }
      },
      {
        "feature": "HOST_TRAVEL",
        "reason": "Requires Leader trust level",
        "upgradeOptions": {
          "trustNeeded": {
            "currentLevel": "trusted",
            "currentScore": 45,
            "requiredLevel": "leader",
            "requiredScore": 61,
            "estimatedDays": 56,
            "suggestedActions": [
              "Attend 15+ events",
              "Get all vouches (1 primary, 3 secondary, 2 community)",
              "Host multiple events with positive reviews",
              "Contribute consistently to communities",
              "Demonstrate leadership in your communities"
            ]
          }
        }
      }
    ]
  }
}
```

---

### 9. Get Feature Usage

**Endpoint:** `GET /api/subscriptions/usage/:featureCode`

**Description:** Get usage statistics for a specific feature in the current billing period.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Parameters:**
- `featureCode` (path) - Feature code to check usage for

**Request:**
```bash
curl -X GET https://api.berse.app/api/subscriptions/usage/CREATE_EVENTS \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "featureCode": "CREATE_EVENTS",
    "canUse": true,
    "used": 12,
    "limit": 20,
    "remaining": 8
  }
}
```

**Response (Unlimited):**
```json
{
  "success": true,
  "data": {
    "featureCode": "CREATE_EVENTS",
    "canUse": true,
    "used": 45,
    "limit": -1,
    "remaining": -1
  }
}
```

---

### 10. Get Subscription Stats

**Endpoint:** `GET /api/subscriptions/stats`

**Description:** Get user's subscription statistics and history.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request:**
```bash
curl -X GET https://api.berse.app/api/subscriptions/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "totalSpent": 450,
    "memberSince": "2024-03-15T00:00:00.000Z",
    "currentStreak": 9,
    "lifetimeValue": 450
  }
}
```

---

### 11. Calculate Upgrade Cost

**Endpoint:** `POST /api/subscriptions/calculate-upgrade`

**Description:** Calculate the cost to upgrade to a target tier.

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "targetTier": "BASIC",
  "billingCycle": "MONTHLY"
}
```

**Request:**
```bash
curl -X POST https://api.berse.app/api/subscriptions/calculate-upgrade \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "targetTier": "BASIC",
    "billingCycle": "MONTHLY"
  }'
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "currentTier": "FREE",
    "targetTier": "BASIC",
    "billingCycle": "MONTHLY",
    "upgradeCost": 30,
    "currency": "MYR"
  }
}
```

---

## 📱 Response Codes

| Code | Description |
|------|-------------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Missing or invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource conflict |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server error |

---

## 🔄 Webhook Events

Subscription events are sent to registered webhook URLs:

### Subscription Created
```json
{
  "event": "subscription.created",
  "data": {
    "subscriptionId": "sub_xyz123",
    "userId": "user_abc456",
    "tier": "PREMIUM",
    "status": "TRIALING"
  }
}
```

### Subscription Activated
```json
{
  "event": "subscription.activated",
  "data": {
    "subscriptionId": "sub_xyz123",
    "userId": "user_abc456",
    "tier": "PREMIUM"
  }
}
```

### Subscription Canceled
```json
{
  "event": "subscription.canceled",
  "data": {
    "subscriptionId": "sub_xyz123",
    "userId": "user_abc456",
    "canceledAt": "2025-10-24T00:00:00.000Z"
  }
}
```

### Payment Succeeded
```json
{
  "event": "payment.succeeded",
  "data": {
    "subscriptionId": "sub_xyz123",
    "userId": "user_abc456",
    "amount": 50,
    "currency": "MYR"
  }
}
```

### Payment Failed
```json
{
  "event": "payment.failed",
  "data": {
    "subscriptionId": "sub_xyz123",
    "userId": "user_abc456",
    "reason": "Insufficient funds"
  }
}
```

---

## 💡 Testing

### Development Environment
```bash
BASE_URL=http://localhost:3000
```

### Using Postman/Insomnia

1. Import the collection from `/docs/postman/subscription.collection.json`
2. Set environment variable: `base_url` = `http://localhost:3000`
3. Set environment variable: `token` = your access token

### Using cURL

```bash
# Set your token
export TOKEN="your_access_token_here"

# Get all tiers
curl http://localhost:3000/api/subscriptions/tiers

# Get my subscription
curl http://localhost:3000/api/subscriptions/my \
  -H "Authorization: Bearer $TOKEN"

# Check feature access
curl -X POST http://localhost:3000/api/subscriptions/check-feature \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"featureCode": "CREATE_EVENTS"}'
```

---

## 🔒 Security

- All authenticated endpoints require valid JWT tokens
- Rate limiting: 100 requests per 15 minutes per IP
- Payment data is never stored - handled by payment gateways
- Webhook signatures are verified before processing

---

## 📝 Notes

1. **Trial Periods**: BASIC tier includes 14-day free trial
2. **Proration**: Upgrades are prorated based on remaining time in billing cycle
3. **Cancellation**: Canceled subscriptions remain active until period end
4. **Limits**: `-1` indicates unlimited access
5. **Trust Levels**: Feature access requires both subscription AND trust level requirements

---

**Version:** 1.0.0  
**Last Updated:** October 2025  
**Support:** api-support@berse.app
