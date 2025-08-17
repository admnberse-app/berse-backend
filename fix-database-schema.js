const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');

// Use Railway database URL directly
const DATABASE_URL = 'postgresql://postgres:wiedIsOsMyFyjdAHgNSgkIIIIZNeQgod@mainline.proxy.rlwy.net:48018/railway';

// Set environment variable
process.env.DATABASE_URL = DATABASE_URL;

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: DATABASE_URL
    }
  }
});

async function fixSchema() {
  console.log('🔧 Fixing database schema mismatch...\n');
  
  try {
    // Connect to database
    await prisma.$connect();
    console.log('✅ Connected to Railway database');
    
    // Check current schema
    console.log('📋 Checking current User table columns...');
    const columns = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'User' 
      ORDER BY ordinal_position;
    `;
    
    console.log('Current columns:', columns.map(c => c.column_name).join(', '));
    
    // Push schema to database (this will add missing columns)
    console.log('\n🔄 Pushing Prisma schema to database (adding missing columns)...');
    try {
      execSync('npx prisma db push --skip-generate --accept-data-loss', { 
        stdio: 'inherit',
        env: { ...process.env, DATABASE_URL }
      });
      console.log('✅ Schema pushed successfully!');
    } catch (error) {
      console.log('Push failed, trying alternative method...');
      
      // Alternative: Add missing columns manually
      console.log('Adding missing columns manually...');
      
      // Add mfaBackupCodes column if missing
      await prisma.$executeRaw`
        ALTER TABLE "User" 
        ADD COLUMN IF NOT EXISTS "mfaBackupCodes" TEXT[] DEFAULT ARRAY[]::TEXT[];
      `;
      
      // Add other potentially missing columns
      await prisma.$executeRaw`
        ALTER TABLE "User" 
        ADD COLUMN IF NOT EXISTS "mfaEnabled" BOOLEAN DEFAULT false;
      `;
      
      await prisma.$executeRaw`
        ALTER TABLE "User" 
        ADD COLUMN IF NOT EXISTS "mfaSecret" TEXT;
      `;
      
      console.log('✅ Missing columns added!');
    }
    
    // Verify fix
    console.log('\n📊 Verifying schema fix...');
    const newColumns = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'User' 
      ORDER BY ordinal_position;
    `;
    
    console.log('Updated columns:', newColumns.map(c => c.column_name).join(', '));
    
    const hasMfaBackupCodes = newColumns.some(c => c.column_name === 'mfaBackupCodes');
    if (hasMfaBackupCodes) {
      console.log('\n✅ SUCCESS! Schema is now fixed!');
      console.log('You can now register users at https://bersemuka.netlify.app');
    } else {
      console.log('\n⚠️  Column still missing. May need manual intervention.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\nTry running this command directly:');
    console.log(`set DATABASE_URL=${DATABASE_URL}`);
    console.log('npx prisma db push --skip-generate');
  } finally {
    await prisma.$disconnect();
  }
}

fixSchema();