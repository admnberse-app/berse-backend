# Payment Gateway Quick Reference

## Quick Start

### 1. Install Dependencies
```bash
# Xendit SDK (required)
npm install xendit-node

# Stripe SDK (optional)
npm install stripe
```

### 2. Configure Database
```bash
# Run the setup script
psql -d your_database -f scripts/setup-payment-providers.sql

# Or import from your database client
```

### 3. Update Environment Variables
```bash
# .env
XENDIT_PUBLIC_KEY=xnd_public_production_...
XENDIT_SECRET_KEY=xnd_production_...
XENDIT_WEBHOOK_SECRET=whsec_...

# Optional: Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 4. Use in Code
```typescript
import { PaymentGatewayFactory } from './gateways';

// Get default gateway
const gateway = await PaymentGatewayFactory.getDefaultGateway();

// Create payment
const intent = await gateway.createPaymentIntent({
  amount: 100,
  currency: 'MYR',
  description: 'Event ticket',
});

// Client uses intent.clientSecret to complete payment

// Confirm payment
const result = await gateway.confirmPayment(intent.intentId);
```

## Common Operations

### Create Payment Intent
```typescript
const gateway = await PaymentGatewayFactory.getDefaultGateway();

const intent = await gateway.createPaymentIntent({
  amount: 100.00,
  currency: 'MYR',
  description: 'Event ticket purchase',
  customerId: 'cust_123', // optional
  paymentMethodId: 'pm_123', // optional
  metadata: {
    userId: 'user_123',
    eventId: 'event_456',
  },
});

// Returns:
// {
//   intentId: 'inv_xxx',
//   clientSecret: 'xxx_secret',
//   status: 'PENDING',
//   amount: 100.00,
//   currency: 'MYR',
//   paymentUrl: 'https://...',
// }
```

### Process Refund
```typescript
const gateway = await PaymentGatewayFactory.getGatewayByProviderId(providerId);

const refund = await gateway.refundPayment({
  transactionId: 'txn_123',
  amount: 50.00, // optional, defaults to full refund
  reason: 'Customer requested refund',
  metadata: { refundRequestId: 'ref_789' },
});
```

### Handle Webhook
```typescript
import { PaymentGatewayFactory } from './gateways';

app.post('/webhooks/payment/:provider', async (req, res) => {
  try {
    const gateway = await PaymentGatewayFactory
      .getGatewayByProviderCode(req.params.provider);
    
    // Verify webhook signature
    const isValid = await gateway.verifyWebhookSignature({
      signature: req.headers['x-webhook-signature'] as string,
      payload: req.body,
    });
    
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid signature' });
    }
    
    // Parse webhook event
    const event = await gateway.parseWebhookEvent(req.body);
    
    // Handle event based on type
    switch (event.eventType) {
      case 'payment_succeeded':
        await handlePaymentSuccess(event.data);
        break;
      case 'payment_failed':
        await handlePaymentFailure(event.data);
        break;
      case 'refund_completed':
        await handleRefundCompleted(event.data);
        break;
    }
    
    res.status(200).json({ received: true });
  } catch (error) {
    logger.error('Webhook processing failed:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

### Dynamic Provider Selection
```typescript
// Let the system choose the best provider
const gateway = await PaymentGatewayFactory.getGatewayByRouting({
  amount: 500,
  currency: 'MYR',
  country: 'MY',
  paymentMethod: 'card',
  userId: 'user_123',
});

const intent = await gateway.createPaymentIntent({...});
```

### Calculate Fees
```typescript
const gateway = await PaymentGatewayFactory.getDefaultGateway();

const fees = await gateway.calculateFees(100.00, 'MYR');
// Returns:
// {
//   platformFee: 0,       // Your platform fee (calculated separately)
//   gatewayFee: 3.40,     // Provider's fee (2.9% + 1.50)
//   totalFees: 3.40,
// }

// Store in transaction
const transaction = await prisma.paymentTransaction.create({
  data: {
    amount: 100.00,
    gatewayFee: fees.gatewayFee,
    platformFee: yourPlatformFee,
    // ...
  },
});
```

## Provider Management

### Switch Default Provider
```typescript
// Option 1: Database update
UPDATE "PaymentProvider" 
SET "isDefault" = false 
WHERE "isDefault" = true;

UPDATE "PaymentProvider" 
SET "isDefault" = true 
WHERE "providerCode" = 'stripe';

// Clear cache
PaymentGatewayFactory.clearCache();
```

### Add Routing Rule
```typescript
// Route high-value transactions to Stripe
INSERT INTO "PaymentProviderRouting" (
  "ruleName",
  "providerId",
  "conditions",
  "priority"
) VALUES (
  'High Value to Stripe',
  'provider_stripe_id',
  '{"amount": {"min": 1000}}',
  1
);
```

### Get All Active Providers
```typescript
const providers = await PaymentGatewayFactory.getAllActiveProviders();
// [
//   {
//     id: 'provider_xendit_001',
//     name: 'Xendit',
//     code: 'xendit',
//     type: 'GATEWAY',
//     supportedCurrencies: ['MYR', 'SGD', 'IDR', ...],
//     supportedCountries: ['MY', 'SG', 'ID', ...],
//   },
//   ...
// ]
```

### Validate Provider Support
```typescript
const isSupported = await PaymentGatewayFactory.validateProviderSupport(
  'provider_xendit_001',
  'MYR',
  'MY'
);

if (!isSupported) {
  throw new Error('Provider does not support MYR in Malaysia');
}
```

## Testing

### Mock Gateway for Tests
```typescript
import { AbstractPaymentGateway } from '../gateways';

class MockPaymentGateway extends AbstractPaymentGateway {
  constructor() {
    super({ apiKey: 'mock', environment: 'test' }, 'mock');
  }

  async createPaymentIntent(data) {
    return {
      intentId: 'mock_intent_123',
      clientSecret: 'mock_secret',
      status: 'PENDING',
      amount: data.amount,
      currency: data.currency,
    };
  }

  async confirmPayment(intentId) {
    return {
      intentId,
      status: 'COMPLETED',
      amount: 100,
      currency: 'MYR',
    };
  }

  // Implement other methods with mock responses...
}

// Use in tests
describe('Payment Flow', () => {
  it('should create payment intent', async () => {
    const gateway = new MockPaymentGateway();
    const intent = await gateway.createPaymentIntent({
      amount: 100,
      currency: 'MYR',
    });
    
    expect(intent.status).toBe('PENDING');
  });
});
```

## Error Handling

### Gateway Errors
```typescript
try {
  const gateway = await PaymentGatewayFactory.getDefaultGateway();
  const intent = await gateway.createPaymentIntent({...});
} catch (error) {
  if (error.message.includes('not found')) {
    // Provider not configured
    logger.error('Payment provider not configured');
  } else if (error.message.includes('not active')) {
    // Provider disabled
    logger.error('Payment provider is disabled');
  } else {
    // Gateway error
    logger.error('Payment gateway error:', error);
  }
}
```

### Provider Fallback
```typescript
async function createPaymentWithFallback(data) {
  // Try primary provider
  try {
    const gateway = await PaymentGatewayFactory.getDefaultGateway();
    return await gateway.createPaymentIntent(data);
  } catch (error) {
    logger.warn('Primary provider failed, trying fallback');
    
    // Try fallback provider
    const fallbackGateway = await PaymentGatewayFactory
      .getGatewayByProviderCode('stripe');
    return await fallbackGateway.createPaymentIntent(data);
  }
}
```

## Monitoring

### Health Check
```typescript
import { PaymentGatewayFactory } from './gateways';

async function checkGatewayHealth() {
  const providers = await PaymentGatewayFactory.getAllActiveProviders();
  
  for (const provider of providers) {
    const gateway = await PaymentGatewayFactory.getGatewayByProviderId(provider.id);
    const isHealthy = await gateway.healthCheck();
    
    if (!isHealthy) {
      logger.alert(`Payment gateway ${provider.name} is down!`);
      // Send alert to ops team
    }
  }
}

// Run health check every 5 minutes
setInterval(checkGatewayHealth, 5 * 60 * 1000);
```

### Transaction Monitoring
```typescript
// Get transaction stats by provider
const stats = await prisma.paymentTransaction.groupBy({
  by: ['providerId', 'status'],
  _count: true,
  _sum: {
    amount: true,
    gatewayFee: true,
  },
  where: {
    createdAt: {
      gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
    },
  },
});

// Alert on high failure rate
const failureRate = calculateFailureRate(stats);
if (failureRate > 0.05) { // > 5% failure rate
  logger.alert('High payment failure rate detected');
}
```

## Configuration Reference

### Provider Configuration
```json
{
  "apiKey": "public_key_or_publishable_key",
  "secretKey": "secret_api_key",
  "webhookSecret": "webhook_verification_secret",
  "environment": "test" | "live",
  "apiVersion": "2023-10-16",
  "timeout": 30000,
  "retryAttempts": 3,
  "autoCapture": true,
  "send3DSecure": true
}
```

### Routing Conditions
```json
{
  // Exact match
  "currency": "MYR",
  "country": "MY",
  
  // Range match
  "amount": {
    "min": 100,
    "max": 1000
  },
  
  // Array match
  "currency": {
    "in": ["MYR", "SGD", "USD"]
  },
  
  // Regex match
  "paymentMethod": {
    "regex": "^ewallet_"
  }
}
```

## Payment Flow Diagram

```
1. Client → Backend: Request payment
   ↓
2. Backend → Factory: Get gateway
   ↓
3. Factory → Database: Load provider config
   ↓
4. Factory: Instantiate gateway (Xendit/Stripe)
   ↓
5. Gateway → Provider API: Create payment intent
   ↓
6. Provider API → Gateway: Return intent + secret
   ↓
7. Gateway → Backend: Return standardized result
   ↓
8. Backend → Database: Save transaction
   ↓
9. Backend → Client: Return clientSecret + intentId
   ↓
10. Client → Provider: Complete payment with clientSecret
   ↓
11. Provider → Backend: Webhook notification
   ↓
12. Backend → Gateway: Verify signature
   ↓
13. Gateway → Backend: Parsed event
   ↓
14. Backend → Database: Update transaction status
   ↓
15. Backend → Client: Send confirmation
```

## Troubleshooting

### Issue: Provider Not Found
```
Error: Payment provider not found: xendit
```
**Solution:** Run database setup script to add providers

### Issue: No Default Provider
```
Error: No default payment provider configured
```
**Solution:** Set one provider as default:
```sql
UPDATE "PaymentProvider" SET "isDefault" = true WHERE "providerCode" = 'xendit';
```

### Issue: Currency Not Supported
```
Provider Xendit does not support currency: EUR
```
**Solution:** Use different provider or add currency to supported list

### Issue: Webhook Verification Failed
```
Invalid webhook signature
```
**Solution:** 
1. Check webhook secret in provider config
2. Verify webhook URL matches provider settings
3. Ensure HTTPS is enabled

### Issue: Gateway Cache Stale
```
Using old configuration after update
```
**Solution:**
```typescript
PaymentGatewayFactory.clearCache('provider_id');
// or
PaymentGatewayFactory.clearCache(); // clear all
```

## Performance Tips

1. **Gateway Caching**: Factory automatically caches gateway instances
2. **Database Queries**: Routing rules are cached per request
3. **Webhook Processing**: Process webhooks asynchronously
4. **Health Checks**: Run periodically, not per transaction
5. **Provider Selection**: Use routing rules instead of manual selection

## Security Checklist

- [ ] API keys stored in encrypted configuration
- [ ] Webhook signatures verified on all endpoints
- [ ] HTTPS enforced for all webhooks
- [ ] Rate limiting on payment endpoints
- [ ] Audit logging for all transactions
- [ ] PCI compliance for card data
- [ ] Regular security audits
- [ ] Monitor for suspicious patterns

## Next Steps

1. Install Xendit SDK: `npm install xendit-node`
2. Complete TODOs in XenditGateway.ts
3. Run database setup: `scripts/setup-payment-providers.sql`
4. Configure webhooks in Xendit dashboard
5. Test in development environment
6. Update payment.service.ts to use gateways
7. Deploy to production
