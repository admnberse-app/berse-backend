-- Payment Gateway Database Setup
-- Run these SQL commands to configure payment providers and routing rules

-- ============================================================================
-- 1. XENDIT PROVIDER (Primary for Southeast Asia)
-- ============================================================================

INSERT INTO "PaymentProvider" (
  "id",
  "providerCode",
  "providerName",
  "providerType",
  "supportedCountries",
  "supportedCurrencies",
  "configuration",
  "feeStructure",
  "capabilities",
  "webhookConfig",
  "isActive",
  "isDefault",
  "priorityOrder",
  "createdAt",
  "updatedAt"
) VALUES (
  'provider_xendit_001',
  'xendit',
  'Xendit',
  'GATEWAY',
  ARRAY['MY', 'SG', 'ID', 'PH', 'TH', 'VN'],
  ARRAY['MYR', 'SGD', 'IDR', 'PHP', 'THB', 'VND', 'USD'],
  '{
    "apiKey": "xnd_public_development_...",
    "secretKey": "xnd_development_...",
    "webhookSecret": "whsec_...",
    "environment": "test",
    "apiVersion": "2023-10-16",
    "timeout": 30000,
    "retryAttempts": 3,
    "autoCapture": true
  }'::jsonb,
  '{
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
      },
      "shopeepay": {
        "percentage": 2.0,
        "fixed": 0
      }
    },
    "bank_transfer": {
      "percentage": 0,
      "fixed": 5000,
      "currency": "IDR"
    }
  }'::jsonb,
  '{
    "paymentMethods": [
      "card",
      "bank_transfer",
      "ewallet_grabpay",
      "ewallet_shopeepay",
      "ewallet_dana",
      "ewallet_ovo",
      "ewallet_linkaja",
      "qris",
      "direct_debit"
    ],
    "features": [
      "payment_intent",
      "refund",
      "payout",
      "recurring",
      "tokenization",
      "3ds",
      "webhook"
    ],
    "limits": {
      "minAmount": 1,
      "maxAmount": 1000000,
      "dailyLimit": 10000000
    }
  }'::jsonb,
  '{
    "url": "https://api.berseapp.com/webhooks/payment/xendit",
    "events": [
      "invoice.paid",
      "invoice.expired",
      "invoice.payment_failed",
      "disbursement.completed",
      "disbursement.failed"
    ],
    "secret": "whsec_..."
  }'::jsonb,
  true,
  true,
  1,
  NOW(),
  NOW()
);

-- ============================================================================
-- 2. STRIPE PROVIDER (Optional - for global coverage)
-- ============================================================================

INSERT INTO "PaymentProvider" (
  "id",
  "providerCode",
  "providerName",
  "providerType",
  "supportedCountries",
  "supportedCurrencies",
  "configuration",
  "feeStructure",
  "capabilities",
  "webhookConfig",
  "isActive",
  "isDefault",
  "priorityOrder",
  "createdAt",
  "updatedAt"
) VALUES (
  'provider_stripe_001',
  'stripe',
  'Stripe',
  'GATEWAY',
  ARRAY['US', 'GB', 'CA', 'AU', 'SG', 'MY', 'EU'],
  ARRAY['USD', 'EUR', 'GBP', 'AUD', 'CAD', 'SGD', 'MYR', 'JPY'],
  '{
    "apiKey": "sk_test_...",
    "secretKey": "sk_test_...",
    "webhookSecret": "whsec_...",
    "environment": "test",
    "apiVersion": "2023-10-16",
    "timeout": 30000,
    "retryAttempts": 3,
    "autoCapture": false
  }'::jsonb,
  '{
    "card": {
      "domestic": {
        "percentage": 2.9,
        "fixed": 0.30,
        "currency": "USD"
      },
      "international": {
        "percentage": 3.9,
        "fixed": 0.30,
        "currency": "USD"
      }
    },
    "apple_pay": {
      "percentage": 2.9,
      "fixed": 0.30,
      "currency": "USD"
    },
    "google_pay": {
      "percentage": 2.9,
      "fixed": 0.30,
      "currency": "USD"
    }
  }'::jsonb,
  '{
    "paymentMethods": [
      "card",
      "apple_pay",
      "google_pay",
      "bank_account",
      "sepa_debit",
      "ideal",
      "giropay",
      "klarna",
      "afterpay",
      "affirm"
    ],
    "features": [
      "payment_intent",
      "refund",
      "payout",
      "recurring",
      "tokenization",
      "3ds",
      "webhook",
      "connect"
    ],
    "limits": {
      "minAmount": 0.50,
      "maxAmount": 999999,
      "dailyLimit": null
    }
  }'::jsonb,
  '{
    "url": "https://api.berseapp.com/webhooks/payment/stripe",
    "events": [
      "payment_intent.succeeded",
      "payment_intent.payment_failed",
      "charge.refunded",
      "transfer.created",
      "transfer.failed"
    ],
    "secret": "whsec_..."
  }'::jsonb,
  false,
  false,
  2,
  NOW(),
  NOW()
);

-- ============================================================================
-- 3. ROUTING RULES
-- ============================================================================

-- Rule 1: High-value transactions to Stripe (if enabled)
INSERT INTO "PaymentProviderRouting" (
  "id",
  "ruleName",
  "providerId",
  "conditions",
  "priority",
  "isActive",
  "createdAt",
  "updatedAt"
) VALUES (
  'routing_high_value',
  'High Value Transactions',
  'provider_stripe_001',
  '{
    "amount": {
      "min": 5000
    }
  }'::jsonb,
  1,
  false,  -- Disabled by default (enable when Stripe is configured)
  NOW(),
  NOW()
);

-- Rule 2: Indonesian payments to Xendit
INSERT INTO "PaymentProviderRouting" (
  "id",
  "ruleName",
  "providerId",
  "conditions",
  "priority",
  "isActive",
  "createdAt",
  "updatedAt"
) VALUES (
  'routing_indonesia',
  'Indonesia Payments',
  'provider_xendit_001',
  '{
    "currency": "IDR"
  }'::jsonb,
  2,
  true,
  NOW(),
  NOW()
);

-- Rule 3: Malaysian card payments to Xendit
INSERT INTO "PaymentProviderRouting" (
  "id",
  "ruleName",
  "providerId",
  "conditions",
  "priority",
  "isActive",
  "createdAt",
  "updatedAt"
) VALUES (
  'routing_malaysia_cards',
  'Malaysia Card Payments',
  'provider_xendit_001',
  '{
    "country": "MY",
    "currency": {
      "in": ["MYR", "SGD"]
    },
    "paymentMethod": "card"
  }'::jsonb,
  3,
  true,
  NOW(),
  NOW()
);

-- Rule 4: E-wallet payments to Xendit
INSERT INTO "PaymentProviderRouting" (
  "id",
  "ruleName",
  "providerId",
  "conditions",
  "priority",
  "isActive",
  "createdAt",
  "updatedAt"
) VALUES (
  'routing_ewallets',
  'E-Wallet Payments',
  'provider_xendit_001',
  '{
    "paymentMethod": {
      "regex": "^ewallet_"
    }
  }'::jsonb,
  4,
  true,
  NOW(),
  NOW()
);

-- Rule 5: Small transactions (under $10) to Xendit
INSERT INTO "PaymentProviderRouting" (
  "id",
  "ruleName",
  "providerId",
  "conditions",
  "priority",
  "isActive",
  "createdAt",
  "updatedAt"
) VALUES (
  'routing_small_transactions',
  'Small Transactions',
  'provider_xendit_001',
  '{
    "amount": {
      "max": 10
    }
  }'::jsonb,
  5,
  true,
  NOW(),
  NOW()
);

-- ============================================================================
-- 4. VERIFY SETUP
-- ============================================================================

-- Check providers
SELECT 
  "providerCode",
  "providerName",
  "isActive",
  "isDefault",
  "priorityOrder",
  array_length("supportedCurrencies", 1) as currency_count,
  array_length("supportedCountries", 1) as country_count
FROM "PaymentProvider"
ORDER BY "priorityOrder";

-- Check routing rules
SELECT 
  "ruleName",
  "priority",
  "isActive",
  "conditions"::text,
  p."providerName"
FROM "PaymentProviderRouting" r
JOIN "PaymentProvider" p ON r."providerId" = p."id"
ORDER BY "priority";

-- ============================================================================
-- 5. PRODUCTION SETUP CHECKLIST
-- ============================================================================

/*
Before deploying to production:

1. Update Xendit Configuration:
   - Replace test API keys with production keys
   - Update environment to "live"
   - Configure production webhook URL
   - Test webhook signature verification

2. Update Stripe Configuration (if using):
   - Replace test API keys with production keys
   - Update environment to "live"
   - Configure production webhook URL
   - Enable if needed: SET "isActive" = true

3. Review Routing Rules:
   - Enable/disable rules based on business needs
   - Adjust priority order
   - Test routing logic with different scenarios

4. Security:
   - Ensure API keys are stored securely
   - Enable webhook signature verification
   - Configure HTTPS endpoints only
   - Set up monitoring and alerts

5. Testing:
   - Test payment flow end-to-end
   - Test webhook handling
   - Test fee calculation
   - Test refund processing
   - Test payout distribution
   - Test error handling

6. Monitoring:
   - Set up gateway health checks
   - Monitor transaction success rates
   - Track fee accuracy
   - Monitor webhook delivery
   - Set up alerts for failures
*/

-- ============================================================================
-- 6. COMMON QUERIES
-- ============================================================================

-- Find default provider
SELECT * FROM "PaymentProvider" WHERE "isDefault" = true;

-- Get provider by code
SELECT * FROM "PaymentProvider" WHERE "providerCode" = 'xendit';

-- Get active routing rules
SELECT * FROM "PaymentProviderRouting" 
WHERE "isActive" = true 
ORDER BY "priority";

-- Count transactions per provider
SELECT 
  p."providerName",
  COUNT(*) as transaction_count,
  SUM(t."amount") as total_amount,
  SUM(t."gatewayFee") as total_fees
FROM "PaymentTransaction" t
JOIN "PaymentProvider" p ON t."providerId" = p."id"
GROUP BY p."providerName";

-- Get failed transactions by provider
SELECT 
  p."providerName",
  t."status",
  COUNT(*) as count
FROM "PaymentTransaction" t
JOIN "PaymentProvider" p ON t."providerId" = p."id"
WHERE t."status" IN ('FAILED', 'CANCELLED')
GROUP BY p."providerName", t."status";
