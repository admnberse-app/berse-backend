/**
 * MASTER SEED FILE - Barrel Export & Orchestrator
 * 
 * This is the main entry point for database seeding.
 * It orchestrates all modular seed files from the /seeds directory.
 * 
 * MODULAR SEED STRUCTURE:
 * - seeds/core/          - Core business data (badges, users, communities, etc.)
 * - seeds/config/        - App configuration and settings
 * - seeds/features/      - Feature-specific seeds (onboarding, card game, etc.)
 * 
 * USAGE:
 *   npm run seed                    # Run all seeds (recommended)
 *   npx prisma db seed              # Same as above
 *   npx ts-node prisma/seed.ts      # Direct execution
 * 
 * For individual seeds, see: prisma/seeds/README.md
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import * as path from 'path';

const prisma = new PrismaClient();

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
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

function success(message: string) {
  log(`✅ ${message}`, 'green');
}

function error(message: string) {
  log(`❌ ${message}`, 'red');
}

function warning(message: string) {
  log(`⚠️  ${message}`, 'yellow');
}

/**
 * Run a seed file using ts-node
 */
async function runSeedFile(seedPath: string, description: string): Promise<boolean> {
  const startTime = Date.now();
  
  try {
    log(`\n📦 ${description}...`, 'cyan');
    
    execSync(`npx ts-node ${seedPath}`, {
      cwd: path.join(__dirname, '..'),
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

/**
 * Display final database summary
 */
async function displaySummary() {
  log('\n📊 Database Summary:', 'bright');
  
  try {
    const stats = {
      users: await prisma.user.count(),
      badges: await prisma.badge.count(),
      rewards: await prisma.reward.count(),
      subscriptionTiers: await prisma.subscriptionTier.count(),
      communities: await prisma.community.count(),
      events: await prisma.event.count(),
      connections: await prisma.userConnection.count(),
      marketplaceListings: await prisma.marketplaceListing.count(),
      paymentProviders: await prisma.paymentProvider.count(),
    };

    console.table({
      'Users': stats.users,
      'Badges': stats.badges,
      'Rewards': stats.rewards,
      'Subscription Tiers': stats.subscriptionTiers,
      'Communities': stats.communities,
      'Events': stats.events,
      'Connections': stats.connections,
      'Marketplace Listings': stats.marketplaceListings,
      'Payment Providers': stats.paymentProviders,
    });

    // Display test credentials
    const testUsers = await prisma.user.findMany({
      where: {
        email: {
          in: ['admin@berseapp.com', 'sarah.host@berseapp.com', 'alice@test.com', 'bob@test.com'],
        },
      },
      select: { email: true, fullName: true, role: true },
      take: 5,
    });

    if (testUsers.length > 0) {
      log('\n🔐 Test User Credentials:', 'bright');
      testUsers.forEach((user, index) => {
        const password = user.email === 'admin@berseapp.com' ? 'admin123' : 'password123';
        log(`   ${index + 1}. ${user.fullName?.padEnd(20)} : ${user.email?.padEnd(30)} / ${password}`, 'green');
      });
    }
  } catch (err) {
    error('Failed to generate summary');
    console.error(err);
  }
}

/**
 * Main seed orchestrator
 * Runs all modular seed files in correct order
 */
async function main() {
  const overallStartTime = Date.now();
  
  header('🌱 BerseMuka Database Seeding');
  
  log('Running all modular seed files...\n');
  
  // Define seed execution order (order matters due to dependencies)
  const seeds = [
    // Core seeds
    { path: 'prisma/seeds/core/badges.seed.ts', name: 'Badges' },
    { path: 'prisma/seeds/core/rewards.seed.ts', name: 'Rewards' },
    { path: 'prisma/seeds/core/vouch-config.seed.ts', name: 'Vouch Configuration' },
    { path: 'prisma/seeds/core/subscription-tiers.seed.ts', name: 'Subscription Tiers' },
    { path: 'prisma/seeds/core/payment-providers.seed.ts', name: 'Payment Providers' },
    { path: 'prisma/seeds/core/platform-fees.seed.ts', name: 'Platform Fee Configurations' },
    { path: 'prisma/seeds/core/referral-campaign.seed.ts', name: 'Referral Campaign' },
    { path: 'prisma/seeds/core/users-enhanced.seed.ts', name: 'Enhanced Test Users' },
    { path: 'prisma/seeds/core/communities.seed.ts', name: 'Sample Communities' },
    { path: 'prisma/seeds/core/events.seed.ts', name: 'Sample Events' },
    { path: 'prisma/seeds/core/marketplace.seed.ts', name: 'Marketplace Products & Services' },
    { path: 'prisma/seeds/core/sample-data.seed.ts', name: 'Sample Data (connections, vouches, etc.)' },
    
    // Config seeds
    { path: 'prisma/seeds/config/seed-app-config.ts', name: 'App Configuration' },
    { path: 'prisma/seeds/config/seed-payment-providers.ts', name: 'Payment Provider Settings' },
    
    // Feature seeds
    { path: 'prisma/seeds/features/onboarding-v2.seed.ts', name: 'Onboarding V2 Screens' },
    { path: 'prisma/seeds/cardgame.seed.ts', name: 'Card Game Topics & Questions' },
  ];

  const results: Array<{ name: string; success: boolean }> = [];
  
  for (const seed of seeds) {
    const success = await runSeedFile(seed.path, seed.name);
    results.push({ name: seed.name, success });
  }

  // Display results
  log('\n' + '─'.repeat(60), 'blue');
  log('  Seed Results', 'blue');
  log('─'.repeat(60) + '\n', 'blue');
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  if (successful === results.length) {
    success(`All ${successful} seeds completed successfully!`);
  } else {
    warning(`Completed: ${successful}/${results.length} seeds`);
    if (failed > 0) {
      error(`Failed seeds: ${failed}`);
      results
        .filter(r => !r.success)
        .forEach(r => error(`  ✗ ${r.name}`));
    }
  }

  // Display final summary
  await displaySummary();

  const totalDuration = ((Date.now() - overallStartTime) / 1000).toFixed(2);
  
  header(`🎉 Seeding Complete! (${totalDuration}s)`);
  
  log('\n📚 Next Steps:', 'bright');
  log('   1. Start your server: npm run dev');
  log('   2. Test login with credentials above');
  log('   3. Check Swagger docs: http://localhost:3000/api-docs');
  log('   4. Explore the API endpoints\n');
  
  log('💡 For more information, see: prisma/seeds/README.md\n', 'yellow');
}

main()
  .catch((e) => {
    error('❌ Seed process failed');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
