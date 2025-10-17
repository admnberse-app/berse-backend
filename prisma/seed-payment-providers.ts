/**
 * Payment Gateway Provider Seeding
 * 
 * This script seeds payment providers and routing rules for the payment gateway abstraction layer.
 * Run this after the main seed to set up Xendit and optional providers like Stripe.
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('💳 Starting payment provider seed...\n');

  // ============================================================================
  // 1. CLEAR EXISTING DATA
  // ============================================================================
  console.log('🧹 Clearing existing payment provider data...');
  await prisma.paymentProviderRouting.deleteMany({});
  await prisma.paymentProvider.deleteMany({});
  console.log('✅ Existing data cleared\n');

  // ============================================================================
  // 2. XENDIT PROVIDER (Primary for Southeast Asia)
  // ============================================================================
  console.log('📦 Creating Xendit provider...');
  
  const xenditProvider = await prisma.paymentProvider.create({
    data: {
      providerCode: 'xendit',
      providerName: 'Xendit',
      providerType: 'GATEWAY',
      supportedCountries: ['MY', 'SG', 'ID', 'PH', 'TH', 'VN'],
      supportedCurrencies: ['MYR', 'SGD', 'IDR', 'PHP', 'THB', 'VND', 'USD'],
      configuration: {
        apiKey: process.env.XENDIT_PUBLIC_KEY || 'xnd_public_development_...',
        secretKey: process.env.XENDIT_SECRET_KEY || 'xnd_development_...',
        webhookSecret: process.env.XENDIT_WEBHOOK_SECRET || 'whsec_...',
        environment: process.env.NODE_ENV === 'production' ? 'live' : 'test',
        apiVersion: '2023-10-16',
        timeout: 30000,
        retryAttempts: 3,
        autoCapture: true,
      },
      feeStructure: {
        card: {
          domestic: {
            percentage: 2.9,
            fixed: 1.50,
            currency: 'MYR',
          },
          international: {
            percentage: 3.9,
            fixed: 1.50,
            currency: 'MYR',
          },
        },
        ewallet: {
          grabpay: { percentage: 2.0, fixed: 0 },
          shopeepay: { percentage: 2.0, fixed: 0 },
          dana: { percentage: 2.0, fixed: 0 },
          ovo: { percentage: 2.0, fixed: 0 },
        },
        bank_transfer: {
          percentage: 0,
          fixed: 5000,
          currency: 'IDR',
        },
      },
      capabilities: {
        paymentMethods: [
          'card',
          'bank_transfer',
          'ewallet_grabpay',
          'ewallet_shopeepay',
          'ewallet_dana',
          'ewallet_ovo',
          'ewallet_linkaja',
          'qris',
          'direct_debit',
        ],
        features: [
          'payment_intent',
          'refund',
          'payout',
          'recurring',
          'tokenization',
          '3ds',
          'webhook',
        ],
        limits: {
          minAmount: 1,
          maxAmount: 1000000,
          dailyLimit: 10000000,
        },
      },
      webhookConfig: {
        url: process.env.XENDIT_WEBHOOK_URL || 'https://api.berseapp.com/webhooks/payment/xendit',
        events: [
          'invoice.paid',
          'invoice.expired',
          'invoice.payment_failed',
          'disbursement.completed',
          'disbursement.failed',
        ],
        secret: process.env.XENDIT_WEBHOOK_SECRET || 'whsec_...',
      },
      isActive: true,
      isDefault: true,
      priorityOrder: 1,
    },
  });

  console.log(`✅ Xendit provider created: ${xenditProvider.id}\n`);

  // ============================================================================
  // 3. STRIPE PROVIDER (Optional - for global coverage)
  // ============================================================================
  console.log('📦 Creating Stripe provider (optional)...');
  
  const stripeProvider = await prisma.paymentProvider.create({
    data: {
      providerCode: 'stripe',
      providerName: 'Stripe',
      providerType: 'GATEWAY',
      supportedCountries: ['US', 'GB', 'CA', 'AU', 'SG', 'MY', 'EU'],
      supportedCurrencies: ['USD', 'EUR', 'GBP', 'AUD', 'CAD', 'SGD', 'MYR', 'JPY'],
      configuration: {
        apiKey: process.env.STRIPE_SECRET_KEY || 'sk_test_...',
        secretKey: process.env.STRIPE_SECRET_KEY || 'sk_test_...',
        webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || 'whsec_...',
        environment: process.env.NODE_ENV === 'production' ? 'live' : 'test',
        apiVersion: '2023-10-16',
        timeout: 30000,
        retryAttempts: 3,
        autoCapture: false,
      },
      feeStructure: {
        card: {
          domestic: {
            percentage: 2.9,
            fixed: 0.30,
            currency: 'USD',
          },
          international: {
            percentage: 3.9,
            fixed: 0.30,
            currency: 'USD',
          },
        },
        apple_pay: { percentage: 2.9, fixed: 0.30, currency: 'USD' },
        google_pay: { percentage: 2.9, fixed: 0.30, currency: 'USD' },
      },
      capabilities: {
        paymentMethods: [
          'card',
          'apple_pay',
          'google_pay',
          'bank_account',
          'sepa_debit',
          'ideal',
          'giropay',
          'klarna',
          'afterpay',
          'affirm',
        ],
        features: [
          'payment_intent',
          'refund',
          'payout',
          'recurring',
          'tokenization',
          '3ds',
          'webhook',
          'connect',
        ],
        limits: {
          minAmount: 0.50,
          maxAmount: 999999,
          dailyLimit: null,
        },
      },
      webhookConfig: {
        url: process.env.STRIPE_WEBHOOK_URL || 'https://api.berseapp.com/webhooks/payment/stripe',
        events: [
          'payment_intent.succeeded',
          'payment_intent.payment_failed',
          'charge.refunded',
          'transfer.created',
          'transfer.failed',
        ],
        secret: process.env.STRIPE_WEBHOOK_SECRET || 'whsec_...',
      },
      isActive: false, // Disabled by default
      isDefault: false,
      priorityOrder: 2,
    },
  });

  console.log(`✅ Stripe provider created (disabled): ${stripeProvider.id}\n`);

  // ============================================================================
  // 4. ROUTING RULES
  // ============================================================================
  console.log('🔀 Creating routing rules...');

  const routingRules = [
    {
      ruleName: 'High Value Transactions',
      providerId: stripeProvider.id,
      conditions: {
        amount: { min: 5000 },
      },
      priority: 1,
      isActive: false, // Disabled by default (enable when Stripe is active)
    },
    {
      ruleName: 'Indonesia Payments',
      providerId: xenditProvider.id,
      conditions: {
        currency: 'IDR',
      },
      priority: 2,
      isActive: true,
    },
    {
      ruleName: 'Malaysia Card Payments',
      providerId: xenditProvider.id,
      conditions: {
        country: 'MY',
        currency: { in: ['MYR', 'SGD'] },
        paymentMethod: 'card',
      },
      priority: 3,
      isActive: true,
    },
    {
      ruleName: 'E-Wallet Payments',
      providerId: xenditProvider.id,
      conditions: {
        paymentMethod: { regex: '^ewallet_' },
      },
      priority: 4,
      isActive: true,
    },
    {
      ruleName: 'Small Transactions',
      providerId: xenditProvider.id,
      conditions: {
        amount: { max: 10 },
      },
      priority: 5,
      isActive: true,
    },
    {
      ruleName: 'Philippine Payments',
      providerId: xenditProvider.id,
      conditions: {
        currency: 'PHP',
      },
      priority: 6,
      isActive: true,
    },
    {
      ruleName: 'Singapore Payments',
      providerId: xenditProvider.id,
      conditions: {
        currency: 'SGD',
      },
      priority: 7,
      isActive: true,
    },
  ];

  for (const rule of routingRules) {
    await prisma.paymentProviderRouting.create({ data: rule });
  }

  console.log(`✅ ${routingRules.length} routing rules created\n`);

  // ============================================================================
  // 5. VERIFICATION
  // ============================================================================
  console.log('🔍 Verifying setup...\n');

  const providers = await prisma.paymentProvider.findMany({
    select: {
      providerCode: true,
      providerName: true,
      isActive: true,
      isDefault: true,
      priorityOrder: true,
      supportedCurrencies: true,
      supportedCountries: true,
    },
    orderBy: { priorityOrder: 'asc' },
  });

  console.log('📊 Payment Providers:');
  console.table(
    providers.map(p => ({
      Code: p.providerCode,
      Name: p.providerName,
      Active: p.isActive ? '✅' : '❌',
      Default: p.isDefault ? '⭐' : '',
      Priority: p.priorityOrder,
      Currencies: p.supportedCurrencies.length,
      Countries: p.supportedCountries.length,
    }))
  );

  const rules = await prisma.paymentProviderRouting.findMany({
    include: { provider: { select: { providerName: true } } },
    orderBy: { priority: 'asc' },
  });

  console.log('\n📋 Routing Rules:');
  console.table(
    rules.map(r => ({
      Rule: r.ruleName,
      Provider: r.provider.providerName,
      Priority: r.priority,
      Active: r.isActive ? '✅' : '❌',
      Conditions: JSON.stringify(r.conditions).substring(0, 50) + '...',
    }))
  );

  // ============================================================================
  // SUMMARY
  // ============================================================================
  console.log('\n' + '='.repeat(70));
  console.log('✅ PAYMENT PROVIDER SEED COMPLETED');
  console.log('='.repeat(70));
  console.log('\n📊 Summary:');
  console.log(`   • ${providers.length} payment providers configured`);
  console.log(`   • ${rules.length} routing rules created`);
  console.log(`   • Default provider: Xendit`);
  console.log(`   • Active providers: ${providers.filter(p => p.isActive).length}`);
  console.log(`   • Active rules: ${rules.filter(r => r.isActive).length}`);

  console.log('\n💡 Next Steps:');
  console.log('   1. Update environment variables with production API keys');
  console.log('   2. Configure webhook endpoints in provider dashboards');
  console.log('   3. Test payment flow with Xendit test mode');
  console.log('   4. Enable Stripe provider if needed (update isActive to true)');
  console.log('   5. Adjust routing rules based on business requirements');

  console.log('\n📖 Documentation:');
  console.log('   • Gateway README: src/modules/payments/gateways/README.md');
  console.log('   • Quick Reference: PAYMENT_GATEWAY_QUICKREF.md');
  console.log('   • Implementation Guide: PAYMENT_GATEWAY_ABSTRACTION_COMPLETE.md');

  console.log('\n🔐 Environment Variables Needed:');
  console.log('   XENDIT_PUBLIC_KEY=xnd_public_production_...');
  console.log('   XENDIT_SECRET_KEY=xnd_production_...');
  console.log('   XENDIT_WEBHOOK_SECRET=whsec_...');
  console.log('   XENDIT_WEBHOOK_URL=https://api.berseapp.com/webhooks/payment/xendit');
  console.log('   STRIPE_SECRET_KEY=sk_live_... (optional)');
  console.log('   STRIPE_WEBHOOK_SECRET=whsec_... (optional)');
  console.log('   STRIPE_WEBHOOK_URL=https://api.berseapp.com/webhooks/payment/stripe');

  console.log('\n🎉 Payment gateway abstraction layer is ready!\n');
}

main()
  .catch((e) => {
    console.error('❌ Payment provider seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
