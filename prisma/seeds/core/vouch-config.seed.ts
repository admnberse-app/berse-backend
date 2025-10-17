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
