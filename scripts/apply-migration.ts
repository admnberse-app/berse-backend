/**
 * Apply Marketplace Unification Migration
 * 
 * This script applies the SQL migration to add new columns and tables
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function applyMigration() {
  console.log('🚀 Applying marketplace unification migration...\n');

  try {
    const migrationPath = path.join(
      __dirname,
      '../prisma/migrations/20251023_marketplace_unification/migration.sql'
    );

    const sql = fs.readFileSync(migrationPath, 'utf-8');
    
    console.log('📄 Reading migration file...');
    console.log(`   File: ${migrationPath}`);
    console.log(`   Size: ${sql.length} characters\n`);

    console.log('⚙️  Executing migration SQL...');
    
    // Split by semicolon and execute each statement
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      try {
        console.log(`   [${i + 1}/${statements.length}] Executing statement...`);
        await prisma.$executeRawUnsafe(statement);
      } catch (error: any) {
        // Ignore "already exists" errors
        if (error.message?.includes('already exists') || 
            error.message?.includes('duplicate')) {
          console.log(`   ⚠️  Skipped (already exists)`);
        } else {
          console.error(`   ❌ Error:`, error.message);
          throw error;
        }
      }
    }

    console.log('\n✅ Migration applied successfully!');

    // Verify new columns exist
    console.log('\n🔍 Verifying migration...');
    const columns = await prisma.$queryRaw<Array<{ column_name: string }>>`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public' 
        AND table_name = 'marketplace_listings'
        AND column_name IN ('type', 'latitude', 'longitude')
    `;

    console.log(`   Found ${columns.length}/3 new columns`);
    for (const col of columns) {
      console.log(`   ✓ ${col.column_name}`);
    }

    // Check pricing options table
    const pricingTable = await prisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
        AND tablename = 'marketplace_pricing_options'
    `;

    if (pricingTable.length > 0) {
      console.log(`   ✓ marketplace_pricing_options table created`);
    }

    console.log('\n🎉 Migration completed successfully!');

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

applyMigration();
