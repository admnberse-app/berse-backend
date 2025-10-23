require('dotenv').config({ path: require('path').join(__dirname, '../../../.env') });

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedVouchConfig() {
  console.log('\n🤝 Seeding vouch configuration...');
  
  await prisma.vouchConfig.deleteMany({});
  
  await prisma.vouchConfig.create({
    data: {
      maxPrimaryVouches: 1,
      maxSecondaryVouches: 3,
      maxCommunityVouches: 2,
      primaryVouchWeight: 30.0,
      secondaryVouchWeight: 30.0,
      communityVouchWeight: 40.0,
      trustMomentsWeight: 30.0,
      activityWeight: 30.0,
      cooldownDays: 30,
      minTrustRequired: 50.0,
      autoVouchMinEvents: 5,
      autoVouchMinMemberDays: 90,
      autoVouchRequireZeroNegativity: true,
      reconnectionCooldownDays: 30,
      effectiveFrom: new Date(),
      
      // Trust Score Brackets (applies to Basic & Premium tiers)
      perTier: {
        // Trust score brackets - determines vouching power
        trustScoreBrackets: [
          {
            minScore: 0,
            maxScore: 30,
            bracket: 'STARTER',
            maxVouches: 5,
            description: 'Building trust - limited vouching capability'
          },
          {
            minScore: 31,
            maxScore: 60,
            bracket: 'TRUSTED',
            maxVouches: 25,
            description: 'Trusted member - moderate vouching capability'
          },
          {
            minScore: 61,
            maxScore: 100,
            bracket: 'LEADER',
            maxVouches: 50,
            description: 'Community leader - high vouching capability'
          }
        ],
        
        // Tier-specific overrides
        tierLimits: {
          FREE: {
            maxVouches: 5, // Hard cap regardless of trust score
            overridesTrustScore: true,
            description: 'Free tier capped at 5 vouches'
          },
          BASIC: {
            maxVouches: -1, // Uses trust score brackets
            overridesTrustScore: false,
            description: 'Uses trust score brackets (5/25/50)'
          }
        }
      },
    },
  });
  
  console.log('✅ Vouch configuration seeded successfully');
}

async function main() {
  await seedVouchConfig();
}

if (require.main === module) {
  main()
    .catch((e) => {
      console.error('❌ Vouch config seed failed:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
