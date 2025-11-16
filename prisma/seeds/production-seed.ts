/**
 * Production Environment Seed Script
 * Seeds only essential configuration data needed for production
 * 
 * Includes:
 * - App configuration (versions, settings)
 * - Platform configuration (trust formula, fees)
 * - Onboarding screens
 * - Legal documents
 * - Badges
 * - Card Game (topics and questions)
 * - Subscription Tiers (Free & Basic)
 * - Vouch Configuration
 * 
 * Excludes:
 * - Test users
 * - Sample events
 * - Test communities
 * - Development data
 * 
 * Run: DATABASE_URL="your-prod-url" npx ts-node prisma/seeds/production-seed.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('\n🌱 Starting Production Database Seeding...\n');
  console.log('=' .repeat(70));
  
  try {
    // 1. Seed App Configuration (from seed-app-config.ts)
    console.log('\n📱 Seeding App Configuration...');
    const { seedAppConfiguration } = await import('./config/seed-app-config');
    await seedAppConfiguration();
    
    // 2. Seed Platform Configuration (from platform-config.seed.ts)
    console.log('\n⚙️  Seeding Platform Configuration...');
    const { default: seedPlatformConfig } = await import('./platform-config.seed');
    await seedPlatformConfig();
    
    // 3. Seed Platform Fees (from platform-fees.seed.ts)
    console.log('\n💰 Seeding Platform Fees...');
    const { seedPlatformFees } = await import('./core/platform-fees.seed');
    await seedPlatformFees();
    
    // 4. Seed Badges (from new-badges-standalone.seed.ts)
    console.log('\n🏆 Seeding Badges...');
    const { newBadges } = await import('./new-badges-standalone.seed');
    
    let badgesCreated = 0;
    let badgesUpdated = 0;
    for (const badge of newBadges) {
      const existing = await prisma.badge.findUnique({
        where: { type: badge.type },
      });
      if (existing) {
        await prisma.badge.update({
          where: { type: badge.type },
          data: badge,
        });
        badgesUpdated++;
      } else {
        await prisma.badge.create({
          data: badge,
        });
        badgesCreated++;
      }
    }
    console.log(`✅ Badges seeded: ${badgesCreated} created, ${badgesUpdated} updated`);
    
    // 5. Seed Onboarding Screens (from onboarding-v2.seed.ts)
    console.log('\n📲 Seeding Onboarding Screens...');
    const { seedOnboardingScreens } = await import('./features/onboarding-v2.seed');
    await seedOnboardingScreens();
    
    // 6. Seed Card Game (from cardgame.seed.ts)
    console.log('\n🎴 Seeding Card Game...');
    const { seedCardGame } = await import('./cardgame.seed');
    await seedCardGame();
    
    // 7. Seed Subscription Tiers (from subscription-tiers.seed.ts)
    console.log('\n💎 Seeding Subscription Tiers...');
    const { seedSubscriptionTiers } = await import('./core/subscription-tiers.seed');
    await seedSubscriptionTiers();
    
    // 8. Seed Vouch Configuration (from vouch-config.seed.ts)
    console.log('\n🤝 Seeding Vouch Configuration...');
    const { seedVouchConfig } = await import('./core/vouch-config.seed');
    await seedVouchConfig();
    
    // Summary
    console.log('\n' + '='.repeat(70));
    console.log('📊 PRODUCTION SEED SUMMARY');
    console.log('='.repeat(70));
    
    const counts = {
      'App Configs': await prisma.appConfig.count(),
      'Platform Configs': await prisma.platformConfig.count(),
      'Platform Fees': await prisma.platformFeeConfig.count(),
      'Badges': await prisma.badge.count(),
      'App Preview Screens': await prisma.appPreviewScreen.count(),
      'User Setup Screens': await prisma.userSetupScreen.count(),
      'Onboarding Screens': await prisma.onboardingScreen.count(),
      'Legal Documents': await prisma.legalDocument.count(),
      'App Versions': await prisma.appVersion.count(),
      'FAQ Categories': await prisma.faqCategory.count(),
      'FAQs': await prisma.faq.count(),
      'Help Categories': await prisma.helpArticleCategory.count(),
      'Help Articles': await prisma.helpArticle.count(),
      'Feature Flags': await prisma.featureFlag.count(),
      'Card Game Topics': await prisma.cardGameTopic.count(),
      'Card Game Questions': await prisma.cardGameQuestion.count(),
      'Subscription Tiers': await prisma.subscriptionTier.count(),
      'Vouch Configs': await prisma.vouchConfig.count(),
    };
    
    console.log('\n📋 Records Created:');
    console.table(counts);
    
    console.log('\n✅ Production database seeding completed successfully!');
    console.log('🚀 Your production environment is ready to use.\n');
    console.log('='.repeat(70) + '\n');
    
  } catch (error) {
    console.error('\n❌ Production seed failed:', error);
    throw error;
  }
}

main()
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
