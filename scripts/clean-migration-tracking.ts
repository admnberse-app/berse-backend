/**
 * Clean Migration Tracking
 * 
 * This script removes the incorrectly tracked migration
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanMigrationTracking() {
  console.log('🧹 Cleaning migration tracking...\n');

  try {
    // Remove the incorrectly tracked migration
    await prisma.$executeRawUnsafe(`
      DELETE FROM "_prisma_migrations" 
      WHERE migration_name = '20251023_marketplace_unification'
    `);

    console.log('✅ Removed 20251023_marketplace_unification from tracking');

    // Show remaining migrations
    const migrations = await prisma.$queryRaw<Array<{ migration_name: string; finished_at: Date | null }>>`
      SELECT migration_name, finished_at
      FROM "_prisma_migrations"
      ORDER BY finished_at DESC
      LIMIT 5
    `;

    console.log('\n📋 Recent migrations:');
    for (const m of migrations) {
      console.log(`   - ${m.migration_name} (${m.finished_at?.toISOString() || 'pending'})`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanMigrationTracking();
