const { PrismaClient } = require('@prisma/client');

// Use Railway database URL directly
const DATABASE_URL = 'postgresql://postgres:wiedIsOsMyFyjdAHgNSgkIIIIZNeQgod@mainline.proxy.rlwy.net:48018/railway';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: DATABASE_URL
    }
  }
});

async function createTables() {
  console.log('🔄 Connecting to Railway database...');
  
  try {
    await prisma.$connect();
    console.log('✅ Connected to Railway database!');
    
    // Check if tables exist
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;
    
    if (tables.length === 0) {
      console.log('📦 No tables found. Running migration...');
      
      // Force set the DATABASE_URL for this process
      process.env.DATABASE_URL = DATABASE_URL;
      
      // Run migration using child_process
      const { execSync } = require('child_process');
      try {
        execSync('npx prisma migrate deploy', { 
          stdio: 'inherit',
          env: { ...process.env, DATABASE_URL }
        });
        console.log('✅ Tables created successfully!');
      } catch (error) {
        console.log('Migration command failed, trying direct SQL...');
        // If migration fails, we'll need to run SQL directly
      }
    } else {
      console.log(`✅ Database already has ${tables.length} tables:`);
      tables.forEach(t => console.log(`   - ${t.table_name}`));
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n📋 Try this manual approach:');
    console.log('1. Copy the migration SQL from prisma/migrations folder');
    console.log('2. Go to Railway → Postgres → Query tab');
    console.log('3. Paste and run the SQL');
  } finally {
    await prisma.$disconnect();
  }
}

createTables();