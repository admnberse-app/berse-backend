/**
 * Check Marketplace Data Before Migration
 * 
 * This script checks if there are existing Service and MarketplaceListing records
 * that need to be migrated to the new unified marketplace structure.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkMarketplaceData() {
  console.log('🔍 Checking marketplace data before migration...\n');

  try {
    // Check MarketplaceListing count
    const listingCount = await prisma.marketplaceListing.count();
    console.log(`📦 MarketplaceListing records: ${listingCount}`);

    if (listingCount > 0) {
      const listings = await prisma.marketplaceListing.findMany({
        take: 5,
        select: {
          id: true,
          title: true,
          price: true,
          createdAt: true,
        },
      });
      console.log('   Sample listings:', listings);
    }

    // Note: Service model has been removed from schema, but may exist in database
    console.log('\n⚠️  Service model removed from schema - will be handled in migration');
    
    // Check MarketplaceOrder count
    const orderCount = await prisma.marketplaceOrder.count();
    console.log(`\n📋 MarketplaceOrder records: ${orderCount}`);

    if (orderCount > 0) {
      const orders = await prisma.marketplaceOrder.findMany({
        take: 5,
        select: {
          id: true,
          totalPrice: true,
          status: true,
          createdAt: true,
        },
      });
      console.log('   Sample orders:', orders);
    }

    console.log('\n✅ Data check complete');
  } catch (error) {
    console.error('❌ Error checking data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkMarketplaceData();
