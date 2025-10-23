# Subscription Module

Complete subscription management system for Berse app with dual-gating (Subscription Tier + Trust Level).

## 📁 Structure

```
subscription/
├── subscription.types.ts              # TypeScript types & enums
├── subscription.service.ts            # Core subscription logic
├── subscription.controller.ts         # HTTP request handlers
├── subscription.routes.ts             # API endpoints
├── subscription.utils.ts              # Helper functions
├── index.ts                          # Module exports
├── access-control/
│   └── access-control.service.ts     # Dual-gating access control
├── payments/
│   └── subscription-payment.service.ts # Payment gateway integration
└── README.md                          # This file
```

## 🎯 Features

### **Subscription Tiers**
- **FREE** - Basic access (MYR 0/month)
- **BASIC** - Enhanced features (MYR 30/month)
- **PREMIUM** - Full access (MYR 50/month)

### **Core Functionality**
1. **Tier Management**
   - List all subscription tiers
   - Get tier details and features
   - Compare tiers

2. **User Subscriptions**
   - Create/upgrade/downgrade subscriptions
   - Cancel subscriptions (immediate or end-of-period)
   - Manage trial periods
   - Track subscription history

3. **Access Control** (Dual-Gating)
   - Subscription tier requirements
   - Trust level requirements
   - Feature-based permissions
   - Usage limits tracking

4. **Payment Integration**
   - Xendit & Stripe support
   - Payment intent creation
   - Webhook handling
   - Invoice generation

5. **Benefits & Features**
   - Feature access checking
   - Usage tracking per period
   - Benefit comparison
   - Upgrade suggestions

## 🚀 API Endpoints

### **Public Routes**
```
GET  /api/subscriptions/tiers              # List all tiers
GET  /api/subscriptions/tiers/:tierCode    # Get tier details
```

### **Authenticated Routes**
```
GET  /api/subscriptions/my                    # Get current subscription
POST /api/subscriptions/subscribe             # Create subscription
PUT  /api/subscriptions/upgrade               # Upgrade tier
POST /api/subscriptions/cancel                # Cancel subscription
POST /api/subscriptions/check-feature         # Check feature access
GET  /api/subscriptions/access-summary        # Get complete access overview
GET  /api/subscriptions/usage/:featureCode    # Get feature usage
GET  /api/subscriptions/stats                 # Get subscription stats
POST /api/subscriptions/calculate-upgrade     # Calculate upgrade cost
```

## 💡 Usage Examples

### **Check User Subscription**
```typescript
import { SubscriptionService } from './modules/subscription';

const subscription = await SubscriptionService.getUserSubscription(userId);
console.log(subscription.tier); // FREE, BASIC, or PREMIUM
```

### **Check Feature Access (Dual-Gating)**
```typescript
import { AccessControlService, FeatureCode } from './modules/subscription';

const access = await AccessControlService.canAccessFeature(
  userId,
  FeatureCode.CREATE_PAID_EVENTS
);

if (access.allowed) {
  // User can create paid events
} else {
  console.log(access.reason); // e.g., "Requires PREMIUM subscription AND Leader trust level"
  console.log(access.upgradeOptions); // Suggestions for upgrading
}
```

### **Create Subscription with Payment**
```typescript
import { SubscriptionPaymentService, PaymentGateway } from './modules/subscription';

const paymentIntent = await SubscriptionPaymentService.createSubscriptionPayment({
  userId,
  tierCode: 'PREMIUM',
  billingCycle: 'MONTHLY',
  gateway: PaymentGateway.STRIPE,
});

// Redirect user to paymentIntent.metadata.checkoutUrl
```

## 🔐 Access Control System

The subscription module implements a **dual-gating system**:

### **1. Subscription Tier Requirements**
Features can require a specific subscription tier:
```typescript
{
  [FeatureCode.CREATE_EVENTS]: {
    subscriptionTier: SubscriptionTier.BASIC
  }
}
```

### **2. Trust Level Requirements**
Features can also require a minimum trust level:
```typescript
{
  [FeatureCode.HOST_EVENTS]: {
    subscriptionTier: SubscriptionTier.BASIC,
    minTrustLevel: TrustLevel.LEADER  // 61-100% trust score
  }
}
```

### **Trust Levels**
- 🌱 **Starter** (0-30%) - New members building trust
- ✅ **Trusted** (31-60%) - Verified and active members
- ⭐ **Leader** (61-100%) - Trusted leaders and contributors

## 📊 Database Schema

### **SubscriptionTier**
```prisma
model SubscriptionTier {
  id            String
  tierCode      String @unique
  tierName      String
  price         Float
  billingCycle  String
  features      Json
  trialDays     Int
  isActive      Boolean
  isPublic      Boolean
}
```

### **UserSubscription**
```prisma
model UserSubscription {
  id                    String
  userId                String
  tierId                String
  status                SubscriptionStatus
  currentPeriodStart    DateTime
  currentPeriodEnd      DateTime
  cancelAt              DateTime?
  trialEnd              DateTime?
  gatewaySubscriptionId String?
}
```

### **SubscriptionPayment**
```prisma
model SubscriptionPayment {
  id                   String
  subscriptionId       String
  userId               String
  amount               Float
  status               PaymentStatus
  billingPeriodStart   DateTime
  billingPeriodEnd     DateTime
  gatewayInvoiceId     String?
  paidAt               DateTime?
}
```

### **FeatureUsage**
```prisma
model FeatureUsage {
  id             String
  userId         String
  featureCode    String
  usedAt         DateTime
  periodStart    DateTime
  periodEnd      DateTime
  metadata       Json?
}
```

## 🔧 Configuration

### **Environment Variables**
```env
# Payment Gateways
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
XENDIT_SECRET_KEY=xnd_test_...
XENDIT_WEBHOOK_TOKEN=...

# Subscription Settings
DEFAULT_TRIAL_DAYS=14
ALLOW_IMMEDIATE_CANCELLATION=true
```

## 🧪 Testing

```bash
# Run subscription tests
npm test -- subscription

# Test specific functionality
npm test -- subscription.service.test.ts
npm test -- access-control.service.test.ts
```

## 📝 Future Enhancements

- [ ] Coupon/promo code support
- [ ] Family/team subscriptions
- [ ] Annual billing with discounts
- [ ] Grace period for failed payments
- [ ] Subscription pause/resume
- [ ] Referral credits
- [ ] Enterprise tier
- [ ] Custom tier creation (admin)

## 🤝 Integration Points

### **Other Modules**
- **User Module** - User profiles & trust scores
- **Events Module** - Event creation limits
- **Marketplace Module** - Listing limits
- **Payments Module** - Payment processing
- **Communities Module** - Community limits

### **Middleware**
```typescript
import { requireSubscription, requireFeature } from './modules/subscription/middleware';

// Protect route by subscription tier
router.post('/events', requireSubscription(SubscriptionTier.BASIC), createEvent);

// Protect route by feature access
router.post('/events/paid', requireFeature(FeatureCode.CREATE_PAID_EVENTS), createPaidEvent);
```

## 📞 Support

For issues or questions about the subscription module:
- Check the [main documentation](../../README.md)
- Review API endpoints in Swagger: `/api-docs`
- Contact: tech@berse.app

---

**Last Updated:** October 2025  
**Version:** 1.0.0  
**Module Status:** ✅ Production Ready
