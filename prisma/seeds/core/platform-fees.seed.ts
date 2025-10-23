require('dotenv').config({ path: require('path').join(__dirname, '../../../.env') });

import { PrismaClient, TransactionType } from '@prisma/client';

const prisma = new PrismaClient();

const feeConfigs = [
  {
    configName: 'Event Ticket Fee',
    transactionType: TransactionType.EVENT_TICKET,
    feePercentage: 10.0,
    feeFixed: 1.0,
    minFee: 1.0,
    maxFee: 50.0,
    currency: 'MYR',
    recipientType: 'platform',
    isActive: true,
    priority: 1,
    description: 'Platform fee for event ticket sales',
  },
  {
    configName: 'Marketplace Fee',
    transactionType: TransactionType.MARKETPLACE_ORDER,
    feePercentage: 5.0,
    feeFixed: 0.5,
    minFee: 0.5,
    currency: 'MYR',
    recipientType: 'platform',
    isActive: true,
    priority: 1,
    description: 'Platform fee for marketplace transactions',
  },
  {
    configName: 'Subscription Fee',
    transactionType: TransactionType.SUBSCRIPTION,
    feePercentage: 0.0,
    feeFixed: 0.0,
    currency: 'MYR',
    recipientType: 'platform',
    isActive: true,
    priority: 1,
    description: 'No additional fee for subscriptions',
  },
];

export async function seedPlatformFees() {
  console.log('\n💰 Seeding platform fee configurations...');
  
  await prisma.platformFeeConfig.deleteMany({});
  
  for (const config of feeConfigs) {
    await prisma.platformFeeConfig.create({ data: config });
  }
  
  const count = await prisma.platformFeeConfig.count();
  console.log(`✅ ${count} platform fee configurations seeded successfully`);
}

async function main() {
  await seedPlatformFees();
}

if (require.main === module) {
  main()
    .catch((e) => {
      console.error('❌ Platform fee seed failed:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
