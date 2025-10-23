/**
 * Check Database Tables
 * 
 * This script checks which tables exist in the database
 * to determine if Service/ServiceBooking tables need migration
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDatabaseTables() {
  console.log('🔍 Checking database tables...\n');

  try {
    // Check if tables exist using raw SQL
    const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename
    `;

    console.log('📋 Tables in database:');
    console.log('─'.repeat(50));
    
    const marketplaceTables = tables.filter(t => 
      t.tablename.toLowerCase().includes('marketplace') || 
      t.tablename.toLowerCase().includes('service')
    );

    if (marketplaceTables.length > 0) {
      console.log('\n🛒 Marketplace-related tables:');
      for (const table of marketplaceTables) {
        console.log(`   - ${table.tablename}`);
      }
    }

    const hasServiceTable = tables.some(t => t.tablename === 'Service');
    const hasServiceBookingTable = tables.some(t => t.tablename === 'ServiceBooking');

    console.log('\n📊 Migration Requirements:');
    console.log('─'.repeat(50));
    console.log(`Service table exists:        ${hasServiceTable ? '✓ YES' : '✗ NO'}`);
    console.log(`ServiceBooking table exists: ${hasServiceBookingTable ? '✓ YES' : '✗ NO'}`);

    if (hasServiceTable || hasServiceBookingTable) {
      console.log('\n⚠️  Additional migration steps needed!');
      console.log('   You will need to migrate Service/ServiceBooking data');
      console.log('   See scripts/migrate-service-to-marketplace.sql');
    } else {
      console.log('\n✅ No Service tables to migrate');
    }

    // Check columns in MarketplaceListing
    console.log('\n🔍 Checking MarketplaceListing schema...');
    const columns = await prisma.$queryRaw<Array<{ column_name: string; data_type: string }>>`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_schema = 'public' 
        AND table_name = 'MarketplaceListing'
      ORDER BY ordinal_position
    `;

    const hasTypeColumn = columns.some(c => c.column_name === 'type');
    const hasPriceColumn = columns.some(c => c.column_name === 'price');
    const hasLatitudeColumn = columns.some(c => c.column_name === 'latitude');

    console.log('\n📋 Key columns in MarketplaceListing:');
    console.log(`   type column:      ${hasTypeColumn ? '✓ EXISTS' : '✗ MISSING'}`);
    console.log(`   price column:     ${hasPriceColumn ? '✓ EXISTS' : '✗ MISSING'}`);
    console.log(`   latitude column:  ${hasLatitudeColumn ? '✓ EXISTS' : '✗ MISSING'}`);

    if (!hasTypeColumn) {
      console.log('\n❌ Migration has NOT been applied yet!');
      console.log('   Run: npx prisma migrate dev --name marketplace_unification');
    } else {
      console.log('\n✅ Schema appears to be updated');
      console.log('   Ready for data migration');
    }

  } catch (error) {
    console.error('❌ Error checking tables:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabaseTables();
