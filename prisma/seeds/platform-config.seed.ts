/**
 * Seed script for platform configuration
 * Populates PlatformConfig table with default values
 * 
 * Run with: npx ts-node prisma/seeds/platform-config.seed.ts
 */

import { PrismaClient } from '@prisma/client';
import {
  ConfigCategory,
  ConfigKey,
} from '../../src/modules/platform/config.types';
import {
  DEFAULT_TRUST_FORMULA,
  DEFAULT_TRUST_LEVELS,
  DEFAULT_FEATURE_GATING,
  DEFAULT_ACCOUNTABILITY,
  DEFAULT_BADGES,
  DEFAULT_TRUST_DECAY,
  DEFAULT_VOUCH_ELIGIBILITY,
  DEFAULT_ACTIVITY_WEIGHTS,
} from '../../src/modules/platform/config.defaults';

const prisma = new PrismaClient();

async function seedPlatformConfig() {
  console.log('🌱 Seeding platform configuration...\n');

  try {
    // Seed Trust Formula
    console.log('📊 Seeding Trust Formula configuration...');
    await prisma.platformConfig.upsert({
      where: {
        category_key: {
          category: ConfigCategory.TRUST_FORMULA,
          key: ConfigKey.WEIGHTS,
        },
      },
      update: {
        value: DEFAULT_TRUST_FORMULA as any,
        description: 'Trust score formula weights (vouches, activity, trust moments)',
      },
      create: {
        category: ConfigCategory.TRUST_FORMULA,
        key: ConfigKey.WEIGHTS,
        value: DEFAULT_TRUST_FORMULA as any,
        description: 'Trust score formula weights (vouches, activity, trust moments)',
      },
    });
    console.log('  ✅ Trust Formula seeded\n');

    // Seed Trust Levels
    console.log('🎯 Seeding Trust Levels configuration...');
    await prisma.platformConfig.upsert({
      where: {
        category_key: {
          category: ConfigCategory.TRUST_LEVELS,
          key: ConfigKey.LEVELS,
        },
      },
      update: {
        value: DEFAULT_TRUST_LEVELS as any,
        description: '6 trust level tiers with score ranges and descriptions',
      },
      create: {
        category: ConfigCategory.TRUST_LEVELS,
        key: ConfigKey.LEVELS,
        value: DEFAULT_TRUST_LEVELS as any,
        description: '6 trust level tiers with score ranges and descriptions',
      },
    });
    console.log('  ✅ Trust Levels seeded\n');

    // Seed Feature Gating
    console.log('🔒 Seeding Feature Gating configuration...');
    await prisma.platformConfig.upsert({
      where: {
        category_key: {
          category: ConfigCategory.FEATURE_GATING,
          key: ConfigKey.FEATURES,
        },
      },
      update: {
        value: DEFAULT_FEATURE_GATING as any,
        description: 'Feature access requirements based on trust score',
      },
      create: {
        category: ConfigCategory.FEATURE_GATING,
        key: ConfigKey.FEATURES,
        value: DEFAULT_FEATURE_GATING as any,
        description: 'Feature access requirements based on trust score',
      },
    });
    console.log('  ✅ Feature Gating seeded\n');

    // Seed Accountability Rules
    console.log('⚖️  Seeding Accountability Rules configuration...');
    await prisma.platformConfig.upsert({
      where: {
        category_key: {
          category: ConfigCategory.ACCOUNTABILITY_RULES,
          key: ConfigKey.RULES,
        },
      },
      update: {
        value: DEFAULT_ACCOUNTABILITY as any,
        description: 'Accountability penalty/reward distribution rules',
      },
      create: {
        category: ConfigCategory.ACCOUNTABILITY_RULES,
        key: ConfigKey.RULES,
        value: DEFAULT_ACCOUNTABILITY as any,
        description: 'Accountability penalty/reward distribution rules',
      },
    });
    console.log('  ✅ Accountability Rules seeded\n');

    // Seed Badge Definitions
    console.log('🏆 Seeding Badge Definitions configuration...');
    await prisma.platformConfig.upsert({
      where: {
        category_key: {
          category: ConfigCategory.BADGE_DEFINITIONS,
          key: ConfigKey.BADGES,
        },
      },
      update: {
        value: DEFAULT_BADGES as any,
        description: '8 badge types with bronze/silver/gold/platinum tiers',
      },
      create: {
        category: ConfigCategory.BADGE_DEFINITIONS,
        key: ConfigKey.BADGES,
        value: DEFAULT_BADGES as any,
        description: '8 badge types with bronze/silver/gold/platinum tiers',
      },
    });
    console.log('  ✅ Badge Definitions seeded\n');

    // Seed Trust Decay Rules
    console.log('📉 Seeding Trust Decay Rules configuration...');
    await prisma.platformConfig.upsert({
      where: {
        category_key: {
          category: ConfigCategory.TRUST_DECAY,
          key: ConfigKey.DECAY_RULES,
        },
      },
      update: {
        value: DEFAULT_TRUST_DECAY as any,
        description: 'Trust score decay rules for inactive users',
      },
      create: {
        category: ConfigCategory.TRUST_DECAY,
        key: ConfigKey.DECAY_RULES,
        value: DEFAULT_TRUST_DECAY as any,
        description: 'Trust score decay rules for inactive users',
      },
    });
    console.log('  ✅ Trust Decay Rules seeded\n');

    // Seed Vouch Eligibility Criteria
    console.log('🎁 Seeding Vouch Eligibility Criteria configuration...');
    await prisma.platformConfig.upsert({
      where: {
        category_key: {
          category: ConfigCategory.VOUCH_ELIGIBILITY,
          key: ConfigKey.ELIGIBILITY_CRITERIA,
        },
      },
      update: {
        value: DEFAULT_VOUCH_ELIGIBILITY as any,
        description: 'Eligibility criteria for automatic community vouch offers',
      },
      create: {
        category: ConfigCategory.VOUCH_ELIGIBILITY,
        key: ConfigKey.ELIGIBILITY_CRITERIA,
        value: DEFAULT_VOUCH_ELIGIBILITY as any,
        description: 'Eligibility criteria for automatic community vouch offers',
      },
    });
    console.log('  ✅ Vouch Eligibility Criteria seeded\n');

    // Seed Activity Weights
    console.log('⭐ Seeding Activity Weights configuration...');
    await prisma.platformConfig.upsert({
      where: {
        category_key: {
          category: ConfigCategory.ACTIVITY_WEIGHTS,
          key: ConfigKey.ACTIVITY_POINTS,
        },
      },
      update: {
        value: DEFAULT_ACTIVITY_WEIGHTS as any,
        description: 'Points awarded for different user activities',
      },
      create: {
        category: ConfigCategory.ACTIVITY_WEIGHTS,
        key: ConfigKey.ACTIVITY_POINTS,
        value: DEFAULT_ACTIVITY_WEIGHTS as any,
        description: 'Points awarded for different user activities',
      },
    });
    console.log('  ✅ Activity Weights seeded\n');

    // Verify seeded configs
    const count = await prisma.platformConfig.count();
    console.log(`\n✅ Platform configuration seeding complete!`);
    console.log(`📊 Total configs in database: ${count}\n`);

    // Display summary
    console.log('📋 Configuration Summary:');
    console.log('  - Trust Formula: Vouch 40% | Activity 30% | Trust Moments 30%');
    console.log('  - Trust Levels: 6 tiers (Starter to Leader)');
    console.log('  - Feature Gating: 23 features with score requirements');
    console.log('  - Accountability: 40% penalty / 20% reward distribution');
    console.log('  - Badges: 8 badge types with 4 tiers each');
    console.log('  - Trust Decay: 2 rules (-1% after 30 days, -2% after 90 days)');
    console.log('  - Vouch Eligibility: 5 events, 90 days, 0 negative feedback');
    console.log('  - Activity Weights: 9 different activity types\n');

  } catch (error) {
    console.error('❌ Error seeding platform configuration:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run seed function
seedPlatformConfig()
  .then(() => {
    console.log('🎉 Seed script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Seed script failed:', error);
    process.exit(1);
  });
