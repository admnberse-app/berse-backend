// Test database connection
const { PrismaClient } = require('@prisma/client');

console.log('🔍 Testing database connection...\n');

// You'll need to set DATABASE_URL before running this
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.log('❌ DATABASE_URL is not set!');
  console.log('\nTo fix this:');
  console.log('1. Go to Railway → Postgres → Variables');
  console.log('2. Copy DATABASE_PUBLIC_URL value');
  console.log('3. Run: set DATABASE_URL=<paste-value-here>');
  console.log('4. Run this script again');
  process.exit(1);
}

console.log('📍 DATABASE_URL found:', databaseUrl.replace(/:[^:@]*@/, ':****@'));

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl
    }
  }
});

async function testConnection() {
  try {
    console.log('🔄 Attempting to connect...');
    await prisma.$connect();
    console.log('✅ Database connected successfully!\n');
    
    console.log('📊 Checking tables...');
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;
    
    if (tables.length === 0) {
      console.log('⚠️  No tables found - need to run migrations!');
      console.log('\nTo create tables, run:');
      console.log('npx prisma migrate deploy');
    } else {
      console.log(`✅ Found ${tables.length} tables:`);
      tables.forEach(t => console.log(`   - ${t.table_name}`));
    }
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.log('\nPossible issues:');
    console.log('1. DATABASE_URL is incorrect');
    console.log('2. Database service is down');
    console.log('3. Network/firewall blocking connection');
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();