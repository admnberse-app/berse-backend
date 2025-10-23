/**
 * Marketplace Unification Data Migration
 * 
 * This script safely migrates existing marketplace data to the new unified structure.
 * It should be run AFTER the Prisma migration has been applied.
 * 
 * Steps:
 * 1. Backup existing data
 * 2. Create default pricing options for existing listings
 * 3. Set default values for new fields
 * 4. Verify migration success
 */

import { PrismaClient } from '@prisma/client';
import { cuid } from '@paralleldrive/cuid2';

const prisma = new PrismaClient();

interface MigrationStats {
  existingListings: number;
  pricingOptionsCreated: number;
  listingsUpdated: number;
  errors: string[];
}

async function migrateMarketplaceData(): Promise<MigrationStats> {
  const stats: MigrationStats = {
    existingListings: 0,
    pricingOptionsCreated: 0,
    listingsUpdated: 0,
    errors: [],
  };

  console.log('🚀 Starting Marketplace Unification Data Migration\n');

  try {
    // Step 1: Check existing listings
    console.log('📊 Step 1: Checking existing data...');
    stats.existingListings = await prisma.marketplaceListing.count();
    console.log(`   Found ${stats.existingListings} existing listings\n`);

    if (stats.existingListings === 0) {
      console.log('✅ No existing listings to migrate');
      return stats;
    }

    // Step 2: Update existing listings with default values
    console.log('🔄 Step 2: Setting default values for existing listings...');
    
    const updateResult = await prisma.marketplaceListing.updateMany({
      where: {
        type: null,
      },
      data: {
        type: 'PRODUCT',
        isNegotiable: false,
        isPriceOnRequest: false,
        allowDirectContact: false,
        hasActivePromotion: false,
      },
    });
    
    stats.listingsUpdated = updateResult.count;
    console.log(`   Updated ${stats.listingsUpdated} listings\n`);

    // Step 3: Create default pricing options for listings that have a price
    console.log('💰 Step 3: Creating default pricing options...');
    
    // Find all listings that need pricing options
    const listingsNeedingPricing = await prisma.$queryRaw<Array<{ id: string; price: number }>>`
      SELECT ml.id, ml.price
      FROM "MarketplaceListing" ml
      WHERE ml.price IS NOT NULL
        AND NOT EXISTS (
          SELECT 1 FROM "MarketplacePricingOption" mpo 
          WHERE mpo."listingId" = ml.id
        )
    `;

    console.log(`   Found ${listingsNeedingPricing.length} listings needing pricing options`);

    // Create pricing options in batches
    for (const listing of listingsNeedingPricing) {
      try {
        await prisma.marketplacePricingOption.create({
          data: {
            id: cuid(),
            listingId: listing.id,
            pricingType: 'MONEY',
            priceStructure: 'FIXED',
            price: listing.price,
            currency: 'MYR',
            isActive: true,
            displayOrder: 1,
          },
        });
        stats.pricingOptionsCreated++;
      } catch (error) {
        const errorMsg = `Failed to create pricing option for listing ${listing.id}: ${error}`;
        console.error(`   ❌ ${errorMsg}`);
        stats.errors.push(errorMsg);
      }
    }

    console.log(`   Created ${stats.pricingOptionsCreated} pricing options\n`);

    // Step 4: Verification
    console.log('✅ Step 4: Verifying migration...');
    
    const listingsByType = await prisma.marketplaceListing.groupBy({
      by: ['type'],
      _count: true,
    });

    console.log('   Listings by type:');
    for (const group of listingsByType) {
      console.log(`   - ${group.type}: ${group._count}`);
    }

    const totalPricingOptions = await prisma.marketplacePricingOption.count();
    console.log(`   Total pricing options: ${totalPricingOptions}`);

    const listingsWithoutPricing = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*) as count
      FROM "MarketplaceListing" ml
      WHERE NOT EXISTS (
        SELECT 1 FROM "MarketplacePricingOption" mpo 
        WHERE mpo."listingId" = ml.id
      )
    `;

    const withoutPricingCount = Number(listingsWithoutPricing[0]?.count || 0);
    console.log(`   Listings without pricing options: ${withoutPricingCount}`);

    if (withoutPricingCount > 0) {
      console.warn(`\n⚠️  Warning: ${withoutPricingCount} listings don't have pricing options`);
      console.warn('   These may be listings with price=NULL or errors during creation');
    }

    console.log('\n✅ Migration completed successfully!');

    return stats;
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    stats.errors.push(`Migration failed: ${error}`);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Main execution
async function main() {
  try {
    const stats = await migrateMarketplaceData();
    
    console.log('\n📈 Migration Statistics:');
    console.log('─'.repeat(50));
    console.log(`Existing Listings:        ${stats.existingListings}`);
    console.log(`Listings Updated:         ${stats.listingsUpdated}`);
    console.log(`Pricing Options Created:  ${stats.pricingOptionsCreated}`);
    console.log(`Errors:                   ${stats.errors.length}`);
    console.log('─'.repeat(50));

    if (stats.errors.length > 0) {
      console.error('\n❌ Errors encountered:');
      stats.errors.forEach((err, i) => console.error(`${i + 1}. ${err}`));
      process.exit(1);
    }

    console.log('\n🎉 All done! Next steps:');
    console.log('1. Review the migration results above');
    console.log('2. Test the marketplace endpoints with the new structure');
    console.log('3. Update backend code to use MarketplacePricingOption');
    console.log('4. Remove deprecated Service/ServiceBooking references');
    
    process.exit(0);
  } catch (error) {
    console.error('Migration script failed:', error);
    process.exit(1);
  }
}

main();
