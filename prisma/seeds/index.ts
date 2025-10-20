/**
 * Master Seed Orchestrator
 * 
 * This file runs all seed files in the correct order.
 * Use this for a complete database seeding from scratch.
 * 
 * Usage:
 *   npx ts-node prisma/seeds/index.ts
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import * as path from 'path';

const prisma = new PrismaClient();

// ANSI color codes for better terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function header(message: string) {
  const line = '='.repeat(60);
  log(`\n${line}`, 'cyan');
  log(`  ${message}`, 'cyan');
  log(`${line}\n`, 'cyan');
}

function section(message: string) {
  log(`\n${'─'.repeat(60)}`, 'blue');
  log(`  ${message}`, 'blue');
  log(`${'─'.repeat(60)}\n`, 'blue');
}

function success(message: string) {
  log(`✅ ${message}`, 'green');
}

function error(message: string) {
  log(`❌ ${message}`, 'red');
}

function warning(message: string) {
  log(`⚠️  ${message}`, 'yellow');
}

function info(message: string) {
  log(`ℹ️  ${message}`, 'dim');
}

async function checkDatabaseState() {
  section('Checking Database State');
  
  try {
    const userCount = await prisma.user.count();
    const badgeCount = await prisma.badge.count();
    const communityCount = await prisma.community.count();
    
    log(`Current state:`, 'bright');
    log(`  • Users: ${userCount}`);
    log(`  • Badges: ${badgeCount}`);
    log(`  • Communities: ${communityCount}`);
    
    if (userCount > 0 || badgeCount > 0 || communityCount > 0) {
      warning('Database already contains data!');
      warning('Seeds may create duplicate data or fail on unique constraints.');
      info('Consider running: npx prisma migrate reset');
      return false;
    }
    
    success('Database is empty and ready for seeding');
    return true;
  } catch (err) {
    error('Failed to check database state');
    console.error(err);
    return false;
  }
}

async function runSeedFile(seedPath: string, description: string) {
  const startTime = Date.now();
  
  try {
    log(`\n📦 ${description}...`, 'cyan');
    info(`   Running: ${seedPath}`);
    
    execSync(`npx ts-node ${seedPath}`, {
      cwd: path.join(__dirname, '../..'),
      stdio: 'inherit',
      env: process.env,
    });
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    success(`${description} completed in ${duration}s`);
    return true;
  } catch (err) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    error(`${description} failed after ${duration}s`);
    console.error(err);
    return false;
  }
}

async function displayFinalSummary() {
  section('Final Database Summary');
  
  try {
    const stats = {
      users: await prisma.user.count(),
      badges: await prisma.badge.count(),
      rewards: await prisma.reward.count(),
      subscriptionTiers: await prisma.subscriptionTier.count(),
      communities: await prisma.community.count(),
      events: await prisma.event.count(),
      connections: await prisma.userConnection.count(),
      vouches: await prisma.vouch.count(),
      services: await prisma.service.count(),
      marketplaceListings: await prisma.marketplaceListing.count(),
      appPreviewScreens: await prisma.appPreviewScreen.count(),
      userSetupScreens: await prisma.userSetupScreen.count(),
      paymentProviders: await prisma.paymentProvider.count(),
      appConfigs: await prisma.appConfig.count(),
      cardGameTopics: await prisma.cardGameTopic.count(),
      cardGameQuestions: await prisma.cardGameQuestion.count(),
    };

    console.table({
      'Users': stats.users,
      'Badges': stats.badges,
      'Rewards': stats.rewards,
      'Subscription Tiers': stats.subscriptionTiers,
      'Communities': stats.communities,
      'Events': stats.events,
      'User Connections': stats.connections,
      'Vouches': stats.vouches,
      'Services': stats.services,
      'Marketplace Listings': stats.marketplaceListings,
      'App Preview Screens': stats.appPreviewScreens,
      'User Setup Screens': stats.userSetupScreens,
      'Payment Providers': stats.paymentProviders,
      'App Configs': stats.appConfigs,
      'Card Game Topics': stats.cardGameTopics,
      'Card Game Questions': stats.cardGameQuestions,
    });

    // Get test user credentials
    const testUsers = await prisma.user.findMany({
      where: {
        email: {
          in: ['admin@test.com', 'host@test.com', 'alice@test.com', 'bob@test.com', 'demo@test.com'],
        },
      },
      select: {
        email: true,
        fullName: true,
        role: true,
      },
    });

    if (testUsers.length > 0) {
      log('\n🔐 Test User Credentials:', 'bright');
      testUsers.forEach((user, index) => {
        const password = user.email === 'admin@test.com' ? 'admin123' : 'password123';
        log(`   ${index + 1}. ${user.fullName?.padEnd(20)} : ${user.email?.padEnd(25)} / ${password}`, 'green');
      });
    }

  } catch (err) {
    error('Failed to generate summary');
    console.error(err);
  }
}

async function main() {
  const overallStartTime = Date.now();
  
  header('🌱 BerseMuka Database Seeding Orchestrator');
  
  log('This will seed your database with:');
  log('  • Core application data (users, badges, communities, etc.)');
  log('  • App configuration & content management');
  log('  • Payment provider settings');
  log('  • Onboarding screens (V2)');
  
  // Check database state
  const isDatabaseEmpty = await checkDatabaseState();
  
  if (!isDatabaseEmpty) {
    log('\n⏸️  Seeding paused. Please confirm you want to proceed.', 'yellow');
    warning('Press Ctrl+C to cancel, or wait 5 seconds to continue...');
    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  header('Starting Seed Process');

  const seeds = [
    // Core seeds - order matters due to dependencies
    {
      path: 'prisma/seeds/core/badges.seed.ts',
      description: 'Badges (14 achievement types)',
    },
    {
      path: 'prisma/seeds/core/rewards.seed.ts',
      description: 'Rewards (5 redeemable items)',
    },
    {
      path: 'prisma/seeds/core/vouch-config.seed.ts',
      description: 'Vouch Configuration (trust system)',
    },
    {
      path: 'prisma/seeds/core/subscription-tiers.seed.ts',
      description: 'Subscription Tiers (FREE, BASIC, PREMIUM)',
    },
    {
      path: 'prisma/seeds/core/platform-fees.seed.ts',
      description: 'Platform Fee Configurations',
    },
    {
      path: 'prisma/seeds/core/referral-campaign.seed.ts',
      description: 'Referral Campaign (LAUNCH2025)',
    },
    {
      path: 'prisma/seeds/core/users.seed.ts',
      description: 'Test Users (5 users with profiles)',
    },
    {
      path: 'prisma/seeds/core/communities.seed.ts',
      description: 'Sample Communities (6 communities)',
    },
    {
      path: 'prisma/seeds/core/events.seed.ts',
      description: 'Sample Events (5 events)',
    },
    {
      path: 'prisma/seeds/core/sample-data.seed.ts',
      description: 'Sample Data (connections, vouches, services, marketplace)',
    },
    // Config seeds
    {
      path: 'prisma/seeds/config/seed-app-config.ts',
      description: 'App Configuration & Content Management',
    },
    {
      path: 'prisma/seeds/config/seed-payment-providers.ts',
      description: 'Payment Provider Configuration',
    },
    // Feature seeds
    {
      path: 'prisma/seeds/features/onboarding-v2.seed.ts',
      description: 'Onboarding V2 Screens',
    },
    {
      path: 'prisma/seeds/cardgame.seed.ts',
      description: 'Card Game Topics & Questions',
    },
  ];

  const results = [];
  
  for (const seed of seeds) {
    const success = await runSeedFile(seed.path, seed.description);
    results.push({ ...seed, success });
  }

  // Display results
  section('Seed Results');
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  log(`\nCompleted: ${successful}/${results.length} seeds`, successful === results.length ? 'green' : 'yellow');
  
  if (failed > 0) {
    warning(`Failed seeds: ${failed}`);
    results
      .filter(r => !r.success)
      .forEach(r => error(`  ✗ ${r.description}`));
  }

  // Display final summary
  await displayFinalSummary();

  const totalDuration = ((Date.now() - overallStartTime) / 1000).toFixed(2);
  
  header(`🎉 Seeding Complete! (${totalDuration}s)`);
  
  log('\n📚 Next Steps:', 'bright');
  log('   1. Start your server: npm run dev');
  log('   2. Test login with credentials above');
  log('   3. Check Swagger docs: http://localhost:3000/api-docs');
  log('   4. Explore the API endpoints\n');
  
  info('For more information, see: prisma/seeds/README.md\n');
}

main()
  .catch((e) => {
    error('Master seed process failed');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
