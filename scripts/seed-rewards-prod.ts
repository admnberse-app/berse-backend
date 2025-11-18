/**
 * Production Rewards Seed Script
 * 
 * This script seeds rewards into the production database with fulfillment data.
 * 
 * Usage:
 *   npm run seed:rewards:prod
 * 
 * Or directly:
 *   npx ts-node scripts/seed-rewards-prod.ts
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const productionRewards = [
  {
    title: 'Mukha Cafe 30% Off',
    description: 'Show this yellow poster to the cashier and enjoy 30% off on selected items at Mukha Cafe TTDI during PeaceMeal events.',
    pointsRequired: 5,
    category: 'Food & Drinks',
    partner: 'Mukha Cafe',
    quantity: 0,
    imageUrl: 'https://staging-berse-app.sgp1.cdn.digitaloceanspaces.com/rewards/cmh4gywii0000cp1rhy9u31eh/1763453777453-eb0117fe4c5ed98fbb6d7fcea96aa5f6.jpeg',
    voucherImageUrl: 'https://staging-berse-app.sgp1.cdn.digitaloceanspaces.com/rewards/cmh4gywii0000cp1rhy9u31eh/1763453777453-eb0117fe4c5ed98fbb6d7fcea96aa5f6.jpeg',
    isActive: true,
    instructions: 'Show this yellow poster to the cashier at Mukha Cafe TTDI and enjoy 30% off on selected items.\n\nTerms & Conditions:\n- Valid for dine-in only\n- Valid on PeaceMeal event days only\n- Valid 1 hour before event starts and 1 hour after event ends\n- One-time use only\n- Cannot be combined with other promotions',
    fulfillmentData: {
      type: 'show_poster',
      validOnEventDaysOnly: true,
      location: 'Mukha Cafe TTDI',
    },
  },
  {
    title: 'Lunchbear TTDI 10% Off',
    description: 'Enjoy 10% off at Lunchbear TTDI. No terms and conditions.',
    pointsRequired: 5,
    category: 'Food & Drinks',
    partner: 'Lunchbear',
    quantity: 0,
    imageUrl: 'https://staging-berse-app.sgp1.cdn.digitaloceanspaces.com/rewards/cmh4gywii0000cp1rhy9u31eh/1763453777453-eb0117fe4c5ed98fbb6d7fcea96aa5f6.jpeg',
    isActive: true,
    voucherCode: 'BERSE',
    instructions: 'Show this voucher at Lunchbear TTDI to enjoy 10% discount.\n\nNo terms and conditions apply.',
  },
  {
    title: 'Lunchbear Nasi Kandar 10% Off + Free Drinks',
    description: 'Enjoy 10% off whole bill at any Lunchbear Nasi Kandar Utara outlet plus free drinks. Use referral code BERSE.',
    pointsRequired: 5,
    category: 'Food & Drinks',
    partner: 'Lunchbear Nasi Kandar Utara',
    quantity: 0,
    imageUrl: 'https://staging-berse-app.sgp1.cdn.digitaloceanspaces.com/rewards/cmh4gywii0000cp1rhy9u31eh/1763453777453-eb0117fe4c5ed98fbb6d7fcea96aa5f6.jpeg',
    isActive: true,
    voucherCode: 'BERSE',
    instructions: 'Use referral code "BERSE" when ordering to enjoy:\n- 10% off whole bill\n- Free drinks (T&C applied)\n\nValid at any Lunchbear Nasi Kandar Utara outlet.',
  },
];

async function seedProductionRewards() {
  console.log('🚀 Starting production rewards seed...\n');
  console.log(`📊 Total rewards to seed: ${productionRewards.length}\n`);

  let created = 0;
  let updated = 0;
  let failed = 0;

  for (const reward of productionRewards) {
    try {
      const existing = await prisma.reward.findFirst({
        where: {
          title: reward.title,
          category: reward.category,
        },
      });

      if (existing) {
        await prisma.reward.update({
          where: { id: existing.id },
          data: reward,
        });
        console.log(`✏️  Updated: ${reward.title}`);
        updated++;
      } else {
        await prisma.reward.create({
          data: reward,
        });
        console.log(`✅ Created: ${reward.title}`);
        created++;
      }
    } catch (error) {
      console.error(`❌ Failed to seed ${reward.title}:`, error);
      failed++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📈 Seed Summary:');
  console.log('='.repeat(60));
  console.log(`✅ Created: ${created}`);
  console.log(`✏️  Updated: ${updated}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Total: ${created + updated} rewards`);
  console.log('='.repeat(60) + '\n');

  // Display final count
  const totalRewards = await prisma.reward.count({ where: { isActive: true } });
  const totalQuantity = await prisma.reward.aggregate({
    _sum: { quantity: true },
    where: { isActive: true },
  });

  console.log('📊 Database Stats:');
  console.log(`   Active Rewards: ${totalRewards}`);
  console.log(`   Total Quantity: ${totalQuantity._sum.quantity || 0}`);
  console.log(`   Categories: ${new Set(productionRewards.map(r => r.category)).size}`);
  console.log(`   Partners: ${new Set(productionRewards.map(r => r.partner)).size}\n`);

  // List all active rewards
  const allRewards = await prisma.reward.findMany({
    where: { isActive: true },
    orderBy: [{ category: 'asc' }, { pointsRequired: 'asc' }],
    select: {
      title: true,
      category: true,
      pointsRequired: true,
      quantity: true,
      partner: true,
    },
  });

  console.log('🎁 Active Rewards in Database:');
  console.log('-'.repeat(60));
  
  let currentCategory = '';
  allRewards.forEach(reward => {
    if (reward.category !== currentCategory) {
      currentCategory = reward.category;
      console.log(`\n${currentCategory}:`);
    }
    console.log(`  • ${reward.title} (${reward.pointsRequired} pts) - ${reward.quantity} available - by ${reward.partner}`);
  });
  
  console.log('\n✨ Production rewards seed completed successfully!\n');
}

async function main() {
  try {
    await seedProductionRewards();
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { seedProductionRewards };
