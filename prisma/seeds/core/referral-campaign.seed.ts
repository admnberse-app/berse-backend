require('dotenv').config({ path: require('path').join(__dirname, '../../../.env') });

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedReferralCampaign() {
  console.log('\n🎯 Seeding referral campaign...');
  
  await prisma.referralCampaign.deleteMany({});
  
  await prisma.referralCampaign.create({
    data: {
      campaignCode: 'LAUNCH2025',
      campaignName: 'BerseMuka Launch Campaign 2025',
      description: 'Special rewards for early adopters and referrers',
      referrerRewardType: 'points',
      referrerRewardAmount: 100.0,
      refereeRewardType: 'points',
      refereeRewardAmount: 50.0,
      bonusRewards: {
        milestones: [
          { count: 5, reward: 'points', amount: 500, description: '5 referrals bonus' },
          { count: 10, reward: 'subscription_discount', amount: 50, description: '50% off premium for 1 month' },
          { count: 25, reward: 'points', amount: 2500, description: '25 referrals mega bonus' },
        ],
      },
      activationCriteria: {
        requiresProfileCompletion: true,
        requiresEmailVerification: true,
        minimumDaysActive: 7,
        requiresFirstEvent: false,
      },
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-12-31'),
      maxPerUser: 50,
      targetCountries: ['MY', 'SG'],
      isActive: true,
      isPaused: false,
    },
  });
  
  console.log('✅ Referral campaign seeded successfully');
}

async function main() {
  await seedReferralCampaign();
}

if (require.main === module) {
  main()
    .catch((e) => {
      console.error('❌ Referral campaign seed failed:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
