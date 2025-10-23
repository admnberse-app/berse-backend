/**
 * Check Current Database Schema
 * 
 * This script checks the current schema of marketplace tables
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkSchema() {
  console.log('🔍 Checking current database schema...\n');

  try {
    // Get MarketplaceListing columns
    const mlColumns = await prisma.$queryRaw<Array<{ 
      column_name: string; 
      data_type: string;
      is_nullable: string;
    }>>`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' 
        AND table_name = 'marketplace_listings'
      ORDER BY ordinal_position
    `;

    console.log('📋 marketplace_listings columns:');
    console.log('─'.repeat(70));
    console.log('Column Name'.padEnd(30) + 'Type'.padEnd(25) + 'Nullable');
    console.log('─'.repeat(70));
    for (const col of mlColumns) {
      console.log(
        col.column_name.padEnd(30) + 
        col.data_type.padEnd(25) + 
        col.is_nullable
      );
    }

    // Get services columns
    const serviceColumns = await prisma.$queryRaw<Array<{ 
      column_name: string; 
      data_type: string;
      is_nullable: string;
    }>>`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' 
        AND table_name = 'services'
      ORDER BY ordinal_position
    `;

    console.log('\n📋 services columns:');
    console.log('─'.repeat(70));
    console.log('Column Name'.padEnd(30) + 'Type'.padEnd(25) + 'Nullable');
    console.log('─'.repeat(70));
    for (const col of serviceColumns) {
      console.log(
        col.column_name.padEnd(30) + 
        col.data_type.padEnd(25) + 
        col.is_nullable
      );
    }

    // Count records
    const mlCount = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*) as count FROM marketplace_listings
    `;
    const serviceCount = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*) as count FROM services
    `;

    console.log('\n📊 Record counts:');
    console.log('─'.repeat(50));
    console.log(`marketplace_listings: ${mlCount[0].count}`);
    console.log(`services:             ${serviceCount[0].count}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSchema();
