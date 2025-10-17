# Payment Module

## 📋 Overview

The Payment module manages all payment transactions, payment methods, refunds, payouts, and integrations with payment providers (Stripe, PayPal, etc.). It supports multiple transaction types, fee calculations, and webhook handling.

## ✅ Implementation Status

### Payment Transactions 🚧 SKELETON
- 🚧 Create payment intent
- 🚧 Confirm payment
- 🚧 Capture authorized payments
- 🚧 Refund payments
- 🚧 Get transaction history with filters
- 🚧 Get transaction details

### Payment Methods 🚧 SKELETON
- 🚧 Add payment method (card, bank account, ewallet)
- 🚧 Update payment method (set as default)
- 🚧 Delete payment method
- 🚧 Get user's payment methods
- 🚧 Tokenization via payment gateway

### Payouts 🚧 SKELETON
- 🚧 Automatic payout distribution
- 🚧 Payout scheduling and release dates
- 🚧 Get payout history
- 🚧 Background job for payout processing

### Fee Management 🚧 SKELETON
- 🚧 Platform fee calculation (configurable)
- 🚧 Gateway fee calculation
- 🚧 Fee breakdown display
- 🚧 Dynamic fee routing based on rules

### Webhooks 🚧 SKELETON
- 🚧 Webhook signature verification
- 🚧 Event handling (payment success, failure, refund)
- 🚧 Automatic transaction status updates
- 🚧 Retry logic for failed webhooks

## 📁 Module Structure

```
src/modules/payments/
├── payment.types.ts       # TypeScript interfaces ✅
├── payment.validators.ts  # Express validators ✅
├── payment.service.ts     # Business logic (SKELETON) 🚧
├── payment.controller.ts  # HTTP handlers (SKELETON) 🚧
├── payment.routes.ts      # Express routes (SKELETON) 🚧
├── index.ts               # Module exports ✅
└── README.md              # This file ✅
```

## 🔌 API Endpoints

### Payment Transactions
- `POST /v2/payments/intent` - Create payment intent
- `POST /v2/payments/confirm` - Confirm payment
- `POST /v2/payments/:transactionId/capture` - Capture authorized payment
- `POST /v2/payments/:transactionId/refund` - Refund payment
- `GET /v2/payments/transactions` - Get user's transactions
- `GET /v2/payments/:transactionId` - Get transaction details

### Payment Methods
- `POST /v2/payments/methods` - Add payment method
- `GET /v2/payments/methods` - Get payment methods
- `PUT /v2/payments/methods/:paymentMethodId` - Update payment method
- `DELETE /v2/payments/methods/:paymentMethodId` - Delete payment method

### Payouts
- `GET /v2/payments/payouts` - Get user's payouts

### Fee Calculation
- `POST /v2/payments/calculate-fees` - Calculate transaction fees

### Webhooks
- `POST /v2/payments/webhooks/:provider` - Handle provider webhooks

## 🔗 Integration Points

### With Events Module
- Event ticket purchases (TransactionType: TICKET_SALE)
- Ticket refunds
- Revenue tracking for event hosts

### With Marketplace Module
- Product purchases (TransactionType: MARKETPLACE_PURCHASE)
- Seller payouts
- Buyer refunds

### With Services Module
- Service bookings (TransactionType: SERVICE_PAYMENT)
- Provider payouts
- Booking cancellations

### With Subscriptions Module
- Subscription payments (TransactionType: SUBSCRIPTION)
- Recurring billing
- Subscription cancellations

### With Notifications Module
- Payment success/failure notifications
- Refund notifications
- Payout notifications
- Payment reminders

## 📊 Database Schema

```prisma
model PaymentTransaction {
  id                     String              @id @default(cuid())
  userId                 String
  transactionType        TransactionType
  referenceType          String
  referenceId            String
  amount                 Float
  currency               String              @default("MYR")
  platformFee            Float               @default(0.0)
  gatewayFee             Float               @default(0.0)
  totalFees              Float               @default(0.0)
  netAmount              Float               @default(0.0)
  providerId             String
  gatewayTransactionId   String              @unique
  gatewayPaymentMethodId String?
  gatewayMetadata        Json?
  status                 PaymentStatus       @default(PENDING)
  failureReason          String?
  processedAt            DateTime?
  refundedAmount         Float?              @default(0.0)
  refundedAt             DateTime?
  refundReason           String?
  description            String?
  metadata               Json?
  createdAt              DateTime            @default(now())
  updatedAt              DateTime            @updatedAt
  
  provider               PaymentProvider     @relation(fields: [providerId], references: [id])
  user                   User                @relation(fields: [userId], references: [id])
  payoutDistributions    PayoutDistribution[]
  fees                   TransactionFee[]
}

enum TransactionType {
  TICKET_SALE
  MARKETPLACE_PURCHASE
  SERVICE_PAYMENT
  SUBSCRIPTION
  DONATION
  REFUND
}

enum PaymentStatus {
  PENDING
  PROCESSING
  AUTHORIZED
  COMPLETED
  FAILED
  CANCELLED
  REFUNDED
  PARTIALLY_REFUNDED
}
```

## 🎯 Implementation Priorities

### Phase 1: Core Payment Flow (High Priority)
1. Create payment intent with Stripe integration
2. Confirm payment and update status
3. Get transaction history
4. Basic fee calculation

### Phase 2: Payment Methods (High Priority)
5. Add/delete payment methods
6. Set default payment method
7. List payment methods

### Phase 3: Refunds & Captures (Medium Priority)
8. Full and partial refunds
9. Capture authorized payments
10. Refund transaction updates

### Phase 4: Payouts (Medium Priority)
11. Automatic payout distribution
12. Scheduled payout releases
13. Background job for payout processing
14. Payout history

### Phase 5: Advanced Features (Low Priority)
15. Multiple payment provider support (Stripe, PayPal, etc.)
16. Dynamic provider routing
17. Webhook handling for all providers
18. Advanced fee configurations
19. Payment analytics and reporting

## 🚀 Next Steps

1. **Implement PaymentService methods** - Start with Stripe integration
2. **Add payment provider adapters** - Create abstract payment gateway interface
3. **Integrate webhooks** - Set up endpoint for payment status updates
4. **Add fee configuration** - Create platform fee config UI/API
5. **Implement payout distribution** - Automate revenue splits
6. **Write unit tests** - Test payment flows and edge cases
7. **Create API documentation** - Add to `docs/api-v2/PAYMENTS_API.md`
8. **Register routes** - Add to `src/routes/v2/index.ts`

## 📝 TODO Comments

Each service method has detailed TODO comments explaining:
- Gateway API integration steps
- Database operations needed
- Fee calculation logic
- Status transitions
- Webhook event handling
- Error handling strategies

Use these as implementation guides when building out the actual functionality.

## 🔐 Security Considerations

- Never store raw payment method data (use tokenization)
- Validate webhook signatures from payment providers
- Use HTTPS for all payment endpoints
- Implement idempotency keys for duplicate prevention
- Log all payment transactions for audit
- Encrypt sensitive gateway credentials
- Rate limit payment endpoints
- Require authentication for all payment operations
- Validate transaction ownership before refunds
- Implement fraud detection rules

## 💳 Supported Payment Providers

### Stripe (Priority 1)
- Credit/debit cards
- Apple Pay, Google Pay
- Bank transfers
- Subscriptions

### PayPal (Priority 2)
- PayPal balance
- Credit/debit cards
- Bank accounts

### Local Payment Methods (Future)
- FPX (Malaysia)
- GrabPay
- Touch 'n Go eWallet
- Boost
