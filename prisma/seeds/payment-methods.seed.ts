/**
 * Payment Method Configuration Seeding
 * 
 * Seeds initial payment methods including:
 * - Xendit (online gateway)
 * - Malaysian banks (Maybank, CIMB, RHB, Public Bank, Hong Leong)
 * - E-wallets (TNG, GrabPay)
 * 
 * Run: npx ts-node prisma/seeds/payment-methods.seed.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const paymentMethods = [
  // ============================================================================
  // ONLINE GATEWAY - Xendit
  // ============================================================================
  {
    methodType: 'gateway',
    methodCode: 'xendit',
    methodName: 'Xendit',
    displayName: 'Online Payment (Card, E-Wallet, Bank)',
    description: 'Pay online with credit/debit card, e-wallet, or online banking',
    category: 'online_gateway',
    iconUrl: null,
    displayOrder: 1,
    isActive: true,
    isDefault: true,
    availableCountries: ['MY', 'SG', 'ID', 'PH', 'TH', 'VN'],
    availableCurrencies: ['MYR', 'SGD', 'IDR', 'PHP', 'THB', 'VND', 'USD'],
    providerId: null, // Will be set during seed (link to PaymentProvider)
    accountDetails: null,
    requiresProof: false,
    autoApprove: true,
    processingTime: 'Instant',
    feePercentage: 2.9,
    feeFixed: 1.5,
    minAmount: 1,
    maxAmount: null,
  },

  // ============================================================================
  // MANUAL BANK TRANSFERS - Malaysia
  // ============================================================================
  {
    methodType: 'manual_bank',
    methodCode: 'bank_maybank',
    methodName: 'Maybank',
    displayName: 'Bank Transfer - Maybank',
    description: 'Transfer to our Maybank account',
    category: 'bank_transfer',
    iconUrl: 'https://cdn.berse-app.com/payment-methods/maybank.png',
    displayOrder: 10,
    isActive: true,
    isDefault: false,
    availableCountries: ['MY'],
    availableCurrencies: ['MYR'],
    providerId: null,
    accountDetails: {
      bankName: 'Maybank',
      accountName: 'Berse Technology Sdn Bhd',
      accountNumber: '1234567890',
      swiftCode: 'MBBEMYKL',
      branchName: 'KL Sentral Branch',
      instructions: 'Please include the reference code in your transfer description. Upload proof of payment after transfer.',
    },
    requiresProof: true,
    autoApprove: false,
    processingTime: '1-2 hours during business hours',
    feePercentage: 0,
    feeFixed: 0,
    minAmount: 10,
    maxAmount: 50000,
  },
  {
    methodType: 'manual_bank',
    methodCode: 'bank_cimb',
    methodName: 'CIMB Bank',
    displayName: 'Bank Transfer - CIMB',
    description: 'Transfer to our CIMB Bank account',
    category: 'bank_transfer',
    iconUrl: 'https://cdn.berse-app.com/payment-methods/cimb.png',
    displayOrder: 11,
    isActive: true,
    isDefault: false,
    availableCountries: ['MY'],
    availableCurrencies: ['MYR'],
    providerId: null,
    accountDetails: {
      bankName: 'CIMB Bank',
      accountName: 'Berse Technology Sdn Bhd',
      accountNumber: '9876543210',
      swiftCode: 'CIBBMYKL',
      branchName: 'Bangsar Branch',
      instructions: 'Please include the reference code in your transfer description. Upload proof of payment after transfer.',
    },
    requiresProof: true,
    autoApprove: false,
    processingTime: '1-2 hours during business hours',
    feePercentage: 0,
    feeFixed: 0,
    minAmount: 10,
    maxAmount: 50000,
  },
  {
    methodType: 'manual_bank',
    methodCode: 'bank_rhb',
    methodName: 'RHB Bank',
    displayName: 'Bank Transfer - RHB',
    description: 'Transfer to our RHB Bank account',
    category: 'bank_transfer',
    iconUrl: 'https://cdn.berse-app.com/payment-methods/rhb.png',
    displayOrder: 12,
    isActive: true,
    isDefault: false,
    availableCountries: ['MY'],
    availableCurrencies: ['MYR'],
    providerId: null,
    accountDetails: {
      bankName: 'RHB Bank',
      accountName: 'Berse Technology Sdn Bhd',
      accountNumber: '1122334455',
      branchName: 'Petaling Jaya Branch',
      instructions: 'Please include the reference code in your transfer description. Upload proof of payment after transfer.',
    },
    requiresProof: true,
    autoApprove: false,
    processingTime: '1-2 hours during business hours',
    feePercentage: 0,
    feeFixed: 0,
    minAmount: 10,
    maxAmount: 50000,
  },
  {
    methodType: 'manual_bank',
    methodCode: 'bank_public',
    methodName: 'Public Bank',
    displayName: 'Bank Transfer - Public Bank',
    description: 'Transfer to our Public Bank account',
    category: 'bank_transfer',
    iconUrl: 'https://cdn.berse-app.com/payment-methods/public-bank.png',
    displayOrder: 13,
    isActive: true,
    isDefault: false,
    availableCountries: ['MY'],
    availableCurrencies: ['MYR'],
    providerId: null,
    accountDetails: {
      bankName: 'Public Bank',
      accountName: 'Berse Technology Sdn Bhd',
      accountNumber: '5566778899',
      branchName: 'KLCC Branch',
      instructions: 'Please include the reference code in your transfer description. Upload proof of payment after transfer.',
    },
    requiresProof: true,
    autoApprove: false,
    processingTime: '1-2 hours during business hours',
    feePercentage: 0,
    feeFixed: 0,
    minAmount: 10,
    maxAmount: 50000,
  },
  {
    methodType: 'manual_bank',
    methodCode: 'bank_hongleong',
    methodName: 'Hong Leong Bank',
    displayName: 'Bank Transfer - Hong Leong',
    description: 'Transfer to our Hong Leong Bank account',
    category: 'bank_transfer',
    iconUrl: 'https://cdn.berse-app.com/payment-methods/hong-leong.png',
    displayOrder: 14,
    isActive: true,
    isDefault: false,
    availableCountries: ['MY'],
    availableCurrencies: ['MYR'],
    providerId: null,
    accountDetails: {
      bankName: 'Hong Leong Bank',
      accountName: 'Berse Technology Sdn Bhd',
      accountNumber: '6677889900',
      branchName: 'Bukit Bintang Branch',
      instructions: 'Please include the reference code in your transfer description. Upload proof of payment after transfer.',
    },
    requiresProof: true,
    autoApprove: false,
    processingTime: '1-2 hours during business hours',
    feePercentage: 0,
    feeFixed: 0,
    minAmount: 10,
    maxAmount: 50000,
  },

  // ============================================================================
  // MANUAL E-WALLETS - Malaysia
  // ============================================================================
  {
    methodType: 'manual_ewallet',
    methodCode: 'ewallet_tng',
    methodName: 'Touch n Go eWallet',
    displayName: 'TNG eWallet',
    description: 'Transfer using Touch n Go eWallet',
    category: 'ewallet',
    iconUrl: 'https://cdn.berse-app.com/payment-methods/tng.png',
    displayOrder: 20,
    isActive: true,
    isDefault: false,
    availableCountries: ['MY'],
    availableCurrencies: ['MYR'],
    providerId: null,
    accountDetails: {
      walletType: 'TNG',
      accountName: 'Berse Support',
      phoneNumber: '+60123456789',
      qrCodeUrl: 'https://cdn.berse-app.com/payment-qr/tng-qr.png',
      instructions: 'Scan QR code or send to phone number. Upload screenshot of successful transfer.',
    },
    requiresProof: true,
    autoApprove: false,
    processingTime: '1-2 hours during business hours',
    feePercentage: 0,
    feeFixed: 0,
    minAmount: 5,
    maxAmount: 10000,
  },
  {
    methodType: 'manual_ewallet',
    methodCode: 'ewallet_grabpay',
    methodName: 'GrabPay',
    displayName: 'GrabPay eWallet',
    description: 'Transfer using GrabPay',
    category: 'ewallet',
    iconUrl: 'https://cdn.berse-app.com/payment-methods/grabpay.png',
    displayOrder: 21,
    isActive: false, // Disabled by default
    isDefault: false,
    availableCountries: ['MY', 'SG'],
    availableCurrencies: ['MYR', 'SGD'],
    providerId: null,
    accountDetails: {
      walletType: 'GrabPay',
      accountName: 'Berse Support',
      phoneNumber: '+60123456789',
      instructions: 'Send payment to phone number. Upload screenshot of successful transfer.',
    },
    requiresProof: true,
    autoApprove: false,
    processingTime: '1-2 hours during business hours',
    feePercentage: 0,
    feeFixed: 0,
    minAmount: 5,
    maxAmount: 10000,
  },
];

async function main() {
  console.log('🌱 Seeding payment methods...\n');

  // Get Xendit provider ID if exists
  const xenditProvider = await prisma.paymentProvider.findUnique({
    where: { providerCode: 'xendit' },
  });

  if (xenditProvider) {
    console.log(`✅ Found Xendit provider: ${xenditProvider.id}`);
    // Update Xendit method with provider ID
    const xenditMethod = paymentMethods.find(m => m.methodCode === 'xendit');
    if (xenditMethod) {
      xenditMethod.providerId = xenditProvider.id;
    }
  }

  // Upsert payment methods
  let created = 0;
  let updated = 0;

  for (const method of paymentMethods) {
    const existing = await prisma.paymentMethodConfig.findUnique({
      where: { methodCode: method.methodCode },
    });

    if (existing) {
      await prisma.paymentMethodConfig.update({
        where: { methodCode: method.methodCode },
        data: method,
      });
      updated++;
      console.log(`♻️  Updated: ${method.displayName}`);
    } else {
      await prisma.paymentMethodConfig.create({
        data: method,
      });
      created++;
      console.log(`✨ Created: ${method.displayName}`);
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log('✅ PAYMENT METHODS SEED COMPLETED');
  console.log('='.repeat(70));
  console.log(`\n📊 Summary:`);
  console.log(`   • ${created} methods created`);
  console.log(`   • ${updated} methods updated`);
  console.log(`   • ${paymentMethods.length} total methods`);

  // Show active methods
  const activeMethods = await prisma.paymentMethodConfig.findMany({
    where: { isActive: true },
    orderBy: { displayOrder: 'asc' },
  });

  console.log(`\n✅ Active Payment Methods (${activeMethods.length}):`);
  activeMethods.forEach(m => {
    const icon = m.isDefault ? '⭐' : '  ';
    console.log(`   ${icon} ${m.displayName} (${m.methodCode})`);
  });

  console.log('\n💡 Next Steps:');
  console.log('   1. Update bank account details in admin dashboard');
  console.log('   2. Upload payment method icons to CDN');
  console.log('   3. Test payment flow with each method');
  console.log('   4. Configure notification templates for manual payments');
  console.log('\n');
}

main()
  .catch((e) => {
    console.error('❌ Payment methods seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
