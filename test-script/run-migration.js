// Quick script to run Prisma migration
const { execSync } = require('child_process');

console.log('🔄 Running database migration...');

try {
  // Generate Prisma client
  console.log('1️⃣ Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  // Run migration
  console.log('2️⃣ Running migration to create tables...');
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });
  
  console.log('✅ Migration complete! Tables created successfully.');
  console.log('Your database is now ready for use!');
} catch (error) {
  console.error('❌ Migration failed:', error.message);
  console.log('\nTroubleshooting:');
  console.log('1. Make sure DATABASE_URL is set correctly');
  console.log('2. Ensure your database is accessible');
  console.log('3. Check your Prisma schema is valid');
}