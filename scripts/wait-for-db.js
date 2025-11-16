#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

// Add connection pool limits to prevent exhausting database connections
const databaseUrl = process.env.DATABASE_URL;
const urlWithPoolLimit = databaseUrl && !databaseUrl.includes('connection_limit=')
  ? `${databaseUrl}${databaseUrl.includes('?') ? '&' : '?'}connection_limit=2`
  : databaseUrl;

console.log('🔧 Database URL configuration:');
console.log('   Original URL has params:', databaseUrl?.includes('?') ? 'Yes' : 'No');
console.log('   Has connection_limit:', databaseUrl?.includes('connection_limit=') ? 'Yes' : 'No');
console.log('   Modified URL has connection_limit:', urlWithPoolLimit?.includes('connection_limit=') ? 'Yes' : 'No');

const prisma = new PrismaClient({
  log: ['info', 'warn', 'error'],
  datasources: {
    db: {
      url: urlWithPoolLimit
    }
  }
});

const MAX_RETRIES = 30; // 5 minutes total (10 seconds * 30)
const RETRY_INTERVAL = 10000; // 10 seconds

async function waitForDatabase() {
  console.log('🔄 Waiting for database connection...');
  console.log(`DATABASE_URL: ${process.env.DATABASE_URL ? 'Set' : 'Not set'}`);
  
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`📡 Attempting database connection (${attempt}/${MAX_RETRIES})...`);
      
      // Test basic connection
      await prisma.$connect();
      console.log('✅ Database connected successfully!');
      
      // Test basic query
      await prisma.$queryRaw`SELECT 1 as test`;
      console.log('✅ Database query test successful!');
      
      await prisma.$disconnect();
      console.log('🎉 Database is ready! Proceeding with deployment...');
      process.exit(0);
      
    } catch (error) {
      console.log(`❌ Connection attempt ${attempt}/${MAX_RETRIES} failed:`, error.message);
      
      if (attempt === MAX_RETRIES) {
        console.error('💥 Maximum retry attempts reached. Database is not available.');
        console.error('🔍 Common issues:');
        console.error('  1. Database service not running in Railway');
        console.error('  2. Wrong DATABASE_URL configuration');
        console.error('  3. Network connectivity issues');
        console.error('  4. Database still initializing');
        
        await prisma.$disconnect();
        process.exit(1);
      }
      
      console.log(`⏰ Waiting ${RETRY_INTERVAL / 1000} seconds before next attempt...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_INTERVAL));
    }
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Received interrupt signal. Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Received terminate signal. Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

waitForDatabase().catch(async (error) => {
  console.error('💥 Unexpected error:', error);
  await prisma.$disconnect();
  process.exit(1);
});