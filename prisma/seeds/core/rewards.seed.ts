require('dotenv').config({ path: require('path').join(__dirname, '../../../.env') });

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const rewards = [
  {
    title: 'Tealive Boba Voucher',
    description: 'Enjoy a refreshing boba tea',
    pointsRequired: 8,
    category: 'Food & Drinks',
    partner: 'Tealive',
    quantity: 100,
  },
  {
    title: 'Kopikku Drink Voucher',
    description: 'Get your caffeine fix',
    pointsRequired: 7,
    category: 'Food & Drinks',
    partner: 'Kopikku',
    quantity: 100,
  },
  {
    title: 'Shopee RM5 Voucher',
    description: 'Shop online with RM5 off',
    pointsRequired: 15,
    category: 'E-Commerce',
    partner: 'Shopee',
    quantity: 50,
  },
  {
    title: 'BerseMuka Tote Bag',
    description: 'Exclusive BerseMuka merchandise',
    pointsRequired: 10,
    category: 'Lifestyle',
    partner: 'BerseMuka',
    quantity: 200,
  },
  {
    title: 'Grab RM10 Voucher',
    description: 'Get RM10 off your next ride',
    pointsRequired: 20,
    category: 'Transportation',
    partner: 'Grab',
    quantity: 75,
  },
];

export async function seedRewards() {
  console.log('\n🎁 Seeding rewards...');
  
  await prisma.reward.deleteMany({});
  
  for (const reward of rewards) {
    await prisma.reward.create({ data: reward });
  }
  
  const count = await prisma.reward.count();
  console.log(`✅ ${count} rewards seeded successfully`);
}

async function main() {
  await seedRewards();
}

if (require.main === module) {
  main()
    .catch((e) => {
      console.error('❌ Reward seed failed:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
