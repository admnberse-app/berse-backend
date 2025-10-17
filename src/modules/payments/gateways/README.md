# Payment Gateway Abstraction Layer

## Overview

The payment gateway abstraction layer provides a **provider-agnostic interface** for payment processing. This architecture allows you to:

- ✅ Switch between payment providers (Xendit, Stripe, PayPal, etc.) without changing business logic
- ✅ Support multiple payment providers simultaneously
- ✅ Route transactions to different providers based on rules (amount, currency, country, etc.)
- ✅ Add new payment providers by implementing a single interface
- ✅ Test different providers without affecting production code

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Payment Service Layer                     │
│              (Business Logic - Provider Agnostic)            │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              PaymentGatewayFactory                           │
│        (Provider Selection & Instance Management)            │
└────────────────────────┬────────────────────────────────────┘
                         │
          ┌──────────────┼──────────────┐
          │              │              │
          ▼              ▼              ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   Xendit     │ │   Stripe     │ │   PayPal     │
│   Gateway    │ │   Gateway    │ │   Gateway    │
└──────────────┘ └──────────────┘ └──────────────┘
```

## Core Components

### 1. AbstractPaymentGateway

Base class that defines the interface all payment providers must implement.

**Key Methods:**
- `createPaymentIntent()` - Initialize a payment
- `confirmPayment()` - Confirm a payment
- `capturePayment()` - Capture authorized payment
- `cancelPayment()` - Cancel/void a payment
- `refundPayment()` - Process a refund
- `createCustomer()` - Create customer profile
- `addPaymentMethod()` - Store payment method
- `createPayout()` - Transfer funds to recipient
- `verifyWebhookSignature()` - Validate webhooks
- `calculateFees()` - Get provider fees

### 2. PaymentGatewayFactory

Manages gateway instances and provider selection.

**Key Methods:**
- `getGatewayByProviderId(providerId)` - Get specific provider
- `getGatewayByProviderCode(code)` - Get by code ('xendit', 'stripe')
- `getDefaultGateway()` - Get default provider
- `getGatewayByRouting(context)` - Dynamic provider selection based on rules
- `validateProviderSupport()` - Check if provider supports operation

### 3. Provider Implementations

#### XenditGateway
- Primary payment provider for Southeast Asia
- Supports: Cards, E-wallets (GrabPay, ShopeePay, OVO, etc.), Bank Transfers, QRIS
- Currencies: IDR, PHP, THB, VND, MYR, SGD, USD

#### StripeGateway
- Global payment provider
- Supports: Cards, Apple Pay, Google Pay, Bank Accounts, Buy Now Pay Later
- Currencies: 135+ currencies worldwide

## Database Schema

The system uses three main models:

### PaymentProvider
```prisma
model PaymentProvider {
  id                   String   @id @default(cuid())
  providerCode         String   @unique // 'xendit', 'stripe', etc.
  providerName         String
  providerType         String   // 'GATEWAY', 'PROCESSOR', 'WALLET'
  supportedCountries   String[]
  supportedCurrencies  String[]
  configuration        Json     // API keys, settings
  feeStructure         Json     // Fee calculation rules
  capabilities         Json     // Supported features
  webhookConfig        Json     // Webhook settings
  isActive             Boolean  @default(true)
  isDefault            Boolean  @default(false)
  priorityOrder        Int      @default(0)
}
```

### PaymentProviderRouting
```prisma
model PaymentProviderRouting {
  id          String  @id @default(cuid())
  ruleName    String
  providerId  String
  conditions  Json    // Routing conditions
  priority    Int     // Lower = higher priority
  isActive    Boolean @default(true)
  provider    PaymentProvider @relation(fields: [providerId])
}
```

### PaymentTransaction
```prisma
model PaymentTransaction {
  id                      String   @id @default(cuid())
  providerId              String
  gatewayTransactionId    String?  @unique
  gatewayPaymentMethodId  String?
  gatewayMetadata         Json?    // Provider-specific data
  status                  TransactionStatus
  // ... other fields
  provider                PaymentProvider @relation(fields: [providerId])
}
```

## Usage Examples

### 1. Basic Payment Flow

```typescript
import { PaymentGatewayFactory } from '../gateways';

// Get default gateway (Xendit)
const gateway = await PaymentGatewayFactory.getDefaultGateway();

// Create payment intent
const intent = await gateway.createPaymentIntent({
  amount: 100.00,
  currency: 'MYR',
  description: 'Event ticket purchase',
  metadata: {
    userId: 'user123',
    eventId: 'event456',
  },
});

// Client receives intent.clientSecret and completes payment

// Confirm payment
const result = await gateway.confirmPayment(intent.intentId);

if (result.status === 'COMPLETED') {
  // Payment successful
  await processOrder();
}
```

### 2. Using Specific Provider

```typescript
// Use Stripe instead of default
const stripeGateway = await PaymentGatewayFactory.getGatewayByProviderCode('stripe');

const intent = await stripeGateway.createPaymentIntent({
  amount: 50.00,
  currency: 'USD',
  description: 'Premium subscription',
});
```

### 3. Dynamic Provider Routing

```typescript
// Automatically select provider based on rules
const gateway = await PaymentGatewayFactory.getGatewayByRouting({
  amount: 500.00,
  currency: 'MYR',
  country: 'MY',
  paymentMethod: 'card',
});

// Factory evaluates routing rules and returns appropriate gateway
const intent = await gateway.createPaymentIntent({...});
```

### 4. Processing Refund

```typescript
const gateway = await PaymentGatewayFactory.getDefaultGateway();

const refund = await gateway.refundPayment({
  transactionId: 'txn_123',
  amount: 50.00, // Partial refund
  reason: 'Customer requested refund',
  metadata: {
    refundRequestId: 'ref_789',
  },
});
```

### 5. Webhook Handling

```typescript
app.post('/webhooks/payment/:provider', async (req, res) => {
  const { provider } = req.params;
  const signature = req.headers['x-webhook-signature'] as string;
  
  // Get provider gateway
  const gateway = await PaymentGatewayFactory.getGatewayByProviderCode(provider);
  
  // Verify webhook signature
  const isValid = await gateway.verifyWebhookSignature({
    signature,
    payload: req.body,
    headers: req.headers,
  });
  
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  // Parse webhook event
  const event = await gateway.parseWebhookEvent(req.body);
  
  // Handle event
  await handlePaymentWebhook(event);
  
  res.status(200).json({ received: true });
});
```

## Provider Routing Rules

Configure routing rules in the database to automatically select providers:

### Example: Route by Amount
```sql
INSERT INTO "PaymentProviderRouting" (
  "ruleName",
  "providerId",
  "conditions",
  "priority"
) VALUES (
  'High Value Transactions',
  'stripe_provider_id',
  '{"amount": {"min": 1000}}',
  1
);
```

### Example: Route by Currency
```sql
INSERT INTO "PaymentProviderRouting" (
  "ruleName",
  "providerId",
  "conditions",
  "priority"
) VALUES (
  'Indonesian Payments',
  'xendit_provider_id',
  '{"currency": "IDR"}',
  2
);
```

### Example: Complex Routing
```sql
INSERT INTO "PaymentProviderRouting" (
  "ruleName",
  "providerId",
  "conditions",
  "priority"
) VALUES (
  'Malaysia Cards',
  'xendit_provider_id',
  '{
    "country": "MY",
    "paymentMethod": "card",
    "currency": {"in": ["MYR", "SGD"]}
  }',
  3
);
```

## Adding a New Payment Provider

To add a new provider (e.g., PayPal):

### Step 1: Create Gateway Implementation

```typescript
// src/modules/payments/gateways/PayPalGateway.ts
import { AbstractPaymentGateway, ProviderConfig } from './AbstractPaymentGateway';

export class PayPalGateway extends AbstractPaymentGateway {
  constructor(config: ProviderConfig) {
    super(config, 'paypal');
    // Initialize PayPal SDK
  }

  async createPaymentIntent(data: PaymentIntentData): Promise<PaymentIntentResult> {
    // Implement PayPal payment creation
  }

  // Implement all other required methods...
}
```

### Step 2: Register in Factory

```typescript
// src/modules/payments/gateways/PaymentGatewayFactory.ts
import { PayPalGateway } from './PayPalGateway';

private static createGateway(providerCode: string, config: ProviderConfig) {
  switch (providerCode.toLowerCase()) {
    case 'xendit':
      return new XenditGateway(config);
    case 'stripe':
      return new StripeGateway(config);
    case 'paypal':
      return new PayPalGateway(config); // Add this
    default:
      throw new AppError(`Unsupported provider: ${providerCode}`, 400);
  }
}
```

### Step 3: Add to Database

```sql
INSERT INTO "PaymentProvider" (
  "providerCode",
  "providerName",
  "providerType",
  "supportedCountries",
  "supportedCurrencies",
  "configuration",
  "isActive"
) VALUES (
  'paypal',
  'PayPal',
  'GATEWAY',
  ARRAY['US', 'GB', 'CA', 'AU'],
  ARRAY['USD', 'EUR', 'GBP', 'CAD', 'AUD'],
  '{"apiKey": "xxx", "secretKey": "xxx", "environment": "live"}',
  true
);
```

### Step 4: Export from Index

```typescript
// src/modules/payments/gateways/index.ts
export * from './PayPalGateway';
```

That's it! Your new provider is now integrated and can be used throughout the system.

## Switching Between Providers

### Option 1: Change Default Provider
```sql
-- Disable current default
UPDATE "PaymentProvider" SET "isDefault" = false WHERE "isDefault" = true;

-- Enable new default
UPDATE "PaymentProvider" SET "isDefault" = true WHERE "providerCode" = 'stripe';
```

### Option 2: Update Routing Rules
```sql
-- Change priority to prefer Stripe
UPDATE "PaymentProviderRouting" 
SET "priority" = 1 
WHERE "providerId" = (SELECT "id" FROM "PaymentProvider" WHERE "providerCode" = 'stripe');
```

### Option 3: Code-Level Selection
```typescript
// Explicitly use Stripe
const gateway = await PaymentGatewayFactory.getGatewayByProviderCode('stripe');
```

## Fee Calculation

Each gateway calculates its own fees:

```typescript
const gateway = await PaymentGatewayFactory.getDefaultGateway();

const fees = await gateway.calculateFees(100.00, 'MYR');
// {
//   platformFee: 0,      // Calculated separately by your business logic
//   gatewayFee: 3.40,    // Provider's fee (e.g., 2.9% + MYR 1.50)
//   totalFees: 3.40
// }

// Store fees in transaction
await prisma.paymentTransaction.create({
  data: {
    amount: 100.00,
    gatewayFee: fees.gatewayFee,
    platformFee: calculatePlatformFee(100.00), // Your logic
    // ...
  },
});
```

## Testing

### Mock Gateway for Testing

```typescript
// tests/mocks/MockPaymentGateway.ts
import { AbstractPaymentGateway } from '../../src/modules/payments/gateways';

export class MockPaymentGateway extends AbstractPaymentGateway {
  constructor() {
    super({ apiKey: 'mock', environment: 'test' }, 'mock');
  }

  async createPaymentIntent(data: PaymentIntentData): Promise<PaymentIntentResult> {
    return {
      intentId: 'mock_intent_123',
      clientSecret: 'mock_secret',
      status: 'PENDING',
      amount: data.amount,
      currency: data.currency,
    };
  }

  // Implement other methods with mock responses...
}
```

### Unit Testing

```typescript
import { MockPaymentGateway } from './mocks/MockPaymentGateway';

describe('Payment Service', () => {
  it('should create payment intent', async () => {
    const gateway = new MockPaymentGateway();
    const intent = await gateway.createPaymentIntent({
      amount: 100,
      currency: 'MYR',
    });
    
    expect(intent.status).toBe('PENDING');
    expect(intent.amount).toBe(100);
  });
});
```

## Security Considerations

### 1. API Key Storage
- Store API keys in `PaymentProvider.configuration` (encrypted JSON)
- Never expose API keys in responses
- Use environment-specific keys (test/live)

### 2. Webhook Verification
- Always verify webhook signatures before processing
- Use provider-specific webhook secrets
- Log all webhook events for audit trail

### 3. Amount Validation
- Validate amounts before sending to gateway
- Check min/max transaction limits
- Handle currency conversion carefully

### 4. PCI Compliance
- Never store raw card numbers
- Use tokenization (payment methods)
- Let gateways handle sensitive data

## Monitoring & Logging

Each gateway logs operations:

```typescript
logger.info('[Xendit] Creating payment intent for amount: 100.00 MYR');
logger.error('[Stripe] Failed to process refund:', error);
```

Monitor gateway health:

```typescript
const gateway = await PaymentGatewayFactory.getDefaultGateway();
const isHealthy = await gateway.healthCheck();

if (!isHealthy) {
  logger.alert('Payment gateway is down!');
  // Switch to backup provider or notify team
}
```

## Configuration Reference

### Provider Configuration (JSON)

```json
{
  "apiKey": "xnd_production_...",
  "secretKey": "...",
  "webhookSecret": "...",
  "environment": "live",
  "apiVersion": "2023-10-16",
  "timeout": 30000,
  "retryAttempts": 3,
  "customSettings": {
    "autoCapture": true,
    "send3DSecure": true
  }
}
```

### Fee Structure (JSON)

```json
{
  "card": {
    "domestic": {
      "percentage": 2.9,
      "fixed": 1.50,
      "currency": "MYR"
    },
    "international": {
      "percentage": 3.9,
      "fixed": 1.50,
      "currency": "MYR"
    }
  },
  "ewallet": {
    "grabpay": {
      "percentage": 2.0,
      "fixed": 0
    }
  }
}
```

### Webhook Configuration (JSON)

```json
{
  "url": "https://api.berseapp.com/webhooks/payment/xendit",
  "events": [
    "invoice.paid",
    "invoice.expired",
    "payment.succeeded",
    "payment.failed"
  ],
  "secret": "whsec_...",
  "retryAttempts": 3
}
```

## Best Practices

1. **Always Use Factory** - Don't instantiate gateways directly
2. **Cache Gateway Instances** - Factory handles caching automatically
3. **Handle Provider Failures** - Implement fallback logic
4. **Log All Operations** - Maintain audit trail
5. **Validate Before Processing** - Check provider support
6. **Use Webhooks** - Don't rely only on API responses
7. **Test Both Providers** - Regularly test all configured providers
8. **Monitor Fees** - Track actual vs calculated fees
9. **Keep SDKs Updated** - Update provider SDKs regularly
10. **Document Provider-Specific Quirks** - Each provider has unique behaviors

## Troubleshooting

### Provider Not Found
```
Error: Payment provider not found: xendit
```
**Solution**: Add provider to database or check `providerCode`

### Provider Not Active
```
Error: Payment provider is not active: Stripe
```
**Solution**: Update provider's `isActive` field to `true`

### No Default Provider
```
Error: No default payment provider configured
```
**Solution**: Set one provider's `isDefault` to `true`

### Unsupported Currency
```
Provider Xendit does not support currency: EUR
```
**Solution**: Use different provider or add currency support

### Webhook Signature Verification Failed
```
Invalid webhook signature
```
**Solution**: Check webhook secret matches provider configuration

## Next Steps

1. **Implement Xendit SDK Integration**
   - Install: `npm install xendit-node`
   - Complete TODOs in `XenditGateway.ts`

2. **Implement Stripe SDK Integration**
   - Install: `npm install stripe`
   - Complete TODOs in `StripeGateway.ts`

3. **Configure Providers in Database**
   - Add Xendit configuration
   - Add Stripe configuration (optional)
   - Set up routing rules

4. **Update Payment Service**
   - Replace direct API calls with gateway factory
   - Implement fee calculation
   - Add webhook handlers

5. **Test Integration**
   - Test payment flow with Xendit test mode
   - Test provider switching
   - Test routing rules

6. **Deploy**
   - Set production API keys
   - Configure production webhooks
   - Monitor gateway health
