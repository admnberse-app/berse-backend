require('dotenv').config({ path: require('path').join(__dirname, '../../../.env.local') });
require('dotenv').config({ path: require('path').join(__dirname, '../../../.env') });

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const paymentProviders = [
  {
    providerCode: 'xendit',
    providerName: 'Xendit',
    providerType: 'GATEWAY',
    supportedCountries: ['MY', 'SG', 'ID', 'PH', 'TH', 'VN'],
    supportedCurrencies: ['MYR', 'SGD', 'IDR', 'PHP', 'THB', 'VND', 'USD'],
    isActive: true,
    isDefault: true, // Set Xendit as default for Malaysia
    priorityOrder: 1,
    configuration: {
      apiKey: process.env.XENDIT_SECRET_KEY || '',
      publicKey: process.env.XENDIT_PUBLIC_KEY || '',
      webhookSecret: process.env.XENDIT_WEBHOOK_TOKEN || '',
      environment: process.env.XENDIT_ENVIRONMENT || 'test',
      apiVersion: '2020-10-31',
      timeout: 30000,
      retryAttempts: 3,
      invoiceDuration: 86400, // 24 hours
      successRedirectUrl: process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL}/payment/success` : undefined,
      failureRedirectUrl: process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL}/payment/failed` : undefined,
    },
    feeStructure: {
      // Xendit fee structure for Malaysia
      cards: {
        domestic: {
          percentage: 2.9,
          fixed: 1.5,
          currency: 'MYR',
        },
        international: {
          percentage: 3.9,
          fixed: 1.5,
          currency: 'MYR',
        },
      },
      ewallets: {
        grabpay: {
          percentage: 2.0,
          fixed: 0,
          currency: 'MYR',
        },
        shopeepay: {
          percentage: 2.0,
          fixed: 0,
          currency: 'MYR',
        },
        touchngo: {
          percentage: 2.0,
          fixed: 0,
          currency: 'MYR',
        },
      },
      bankTransfer: {
        percentage: 0,
        fixed: 2.0,
        currency: 'MYR',
      },
      qris: {
        percentage: 0.7,
        fixed: 0,
        currency: 'MYR',
      },
    },
    capabilities: {
      supportedPaymentMethods: [
        'card',
        'bank_transfer',
        'ewallet_grabpay',
        'ewallet_shopeepay',
        'ewallet_touchngo',
        'qris',
        'fpx',
      ],
      features: {
        invoices: true,
        paymentLinks: true,
        recurringPayments: false,
        refunds: true,
        payouts: true,
        splitPayments: false,
        savedCards: true,
        threeDSecure: true,
      },
      webhooks: {
        invoicePaid: true,
        invoiceExpired: true,
        invoiceFailed: true,
        disbursementCompleted: true,
      },
    },
    webhookConfig: {
      url: process.env.API_URL ? `${process.env.API_URL}/api/webhooks/payment/xendit` : undefined,
      events: [
        'invoice.paid',
        'invoice.expired',
        'invoice.payment_failed',
        'disbursement.completed',
      ],
      verificationMethod: 'callback_token',
    },
  },
];

export async function seedPaymentProviders() {
  console.log('\n💳 Seeding payment provider configurations...');
  
  // Don't delete existing providers, just upsert
  for (const provider of paymentProviders) {
    const existing = await prisma.paymentProvider.findUnique({
      where: { providerCode: provider.providerCode },
    });

    if (existing) {
      console.log(`📝 Updating existing provider: ${provider.providerName}`);
      await prisma.paymentProvider.update({
        where: { providerCode: provider.providerCode },
        data: {
          ...provider,
          // Merge configuration to preserve any custom settings
          configuration: {
            ...((existing.configuration as any) || {}),
            ...(provider.configuration as any),
          },
        },
      });
    } else {
      console.log(`✨ Creating new provider: ${provider.providerName}`);
      await prisma.paymentProvider.create({
        data: provider,
      });
    }
  }
  
  const count = await prisma.paymentProvider.count();
  console.log(`✅ Payment providers seeded successfully (${count} total providers)`);
  
  // Show current configuration
  const xenditProvider = await prisma.paymentProvider.findUnique({
    where: { providerCode: 'xendit' },
    select: {
      id: true,
      providerName: true,
      isActive: true,
      isDefault: true,
      supportedCurrencies: true,
      supportedCountries: true,
    },
  });
  
  if (xenditProvider) {
    console.log('\n📋 Xendit Provider Configuration:');
    console.log(`   ID: ${xenditProvider.id}`);
    console.log(`   Active: ${xenditProvider.isActive ? '✅' : '❌'}`);
    console.log(`   Default: ${xenditProvider.isDefault ? '✅' : '❌'}`);
    console.log(`   Currencies: ${xenditProvider.supportedCurrencies.join(', ')}`);
    console.log(`   Countries: ${xenditProvider.supportedCountries.join(', ')}`);
  }
}

async function main() {
  await seedPaymentProviders();
}

if (require.main === module) {
  main()
    .catch((e) => {
      console.error('❌ Payment provider seed failed:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
