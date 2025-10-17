require('dotenv').config({ path: require('path').join(__dirname, '../../../.env') });

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const tiers = [
  {
    tierCode: 'FREE',
    tierName: 'Free',
    description: 'Basic access to BerseMuka platform',
    price: 0.0,
    currency: 'MYR',
    billingCycle: 'MONTHLY',
    features: {
      maxEventsPerMonth: 5,
      canCreateEvents: false,
      canHostEvents: false,
      maxConnections: 50,
      profileBoost: false,
      customBadges: false,
      prioritySupport: false,
    },
    displayOrder: 1,
    isActive: true,
    isPublic: true,
    trialDays: 0,
  },
  {
    tierCode: 'BASIC',
    tierName: 'Basic',
    description: 'For active community members',
    price: 19.90,
    currency: 'MYR',
    billingCycle: 'MONTHLY',
    features: {
      maxEventsPerMonth: 20,
      canCreateEvents: true,
      canHostEvents: false,
      maxConnections: 200,
      profileBoost: true,
      customBadges: false,
      prioritySupport: false,
    },
    displayOrder: 2,
    isActive: true,
    isPublic: true,
    trialDays: 7,
  },
  {
    tierCode: 'PREMIUM',
    tierName: 'Premium',
    description: 'For event hosts and community leaders',
    price: 49.90,
    currency: 'MYR',
    billingCycle: 'MONTHLY',
    features: {
      maxEventsPerMonth: -1,
      canCreateEvents: true,
      canHostEvents: true,
      maxConnections: -1,
      profileBoost: true,
      customBadges: true,
      prioritySupport: true,
      analytics: true,
      customEventPages: true,
    },
    displayOrder: 3,
    isActive: true,
    isPublic: true,
    trialDays: 14,
  },
];

export async function seedSubscriptionTiers() {
  console.log('\n💎 Seeding subscription tiers...');
  
  await prisma.subscriptionTier.deleteMany({});
  
  for (const tier of tiers) {
    await prisma.subscriptionTier.create({ data: tier });
  }
  
  const count = await prisma.subscriptionTier.count();
  console.log(`✅ ${count} subscription tiers seeded successfully`);
}

async function main() {
  await seedSubscriptionTiers();
}

if (require.main === module) {
  main()
    .catch((e) => {
      console.error('❌ Subscription tier seed failed:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
