import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedVouchConfig() {
  try {
    console.log('Seeding vouch configuration...');

    const config = await prisma.vouchConfig.upsert({
      where: { id: 'default' },
      update: {},
      create: {
        id: 'default',
        maxPrimaryVouches: 1,
        maxSecondaryVouches: 3,
        maxCommunityVouches: 2,
        primaryVouchWeight: 30.0,
        secondaryVouchWeight: 30.0,
        communityVouchWeight: 40.0,
        trustMomentsWeight: 30.0,
        activityWeight: 30.0,
        autoVouchMinEvents: 5,
        autoVouchMinMemberDays: 90,
        autoVouchRequireZeroNegativity: true,
      },
    });

    console.log('✅ Vouch configuration seeded successfully:', config);
  } catch (error) {
    console.error('❌ Error seeding vouch configuration:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedVouchConfig();
