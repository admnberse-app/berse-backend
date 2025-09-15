const { PrismaClient } = require('@prisma/client');

// Railway database URL
const DATABASE_URL = 'postgresql://postgres:wiedIsOsMyFyjdAHgNSgkIIIIZNeQgod@mainline.proxy.rlwy.net:48018/railway';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: DATABASE_URL
    }
  }
});

async function viewUsers() {
  try {
    console.log('🔍 Fetching all registered users...\n');
    
    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        city: true,
        totalPoints: true,
        role: true,
        createdAt: true,
        mfaEnabled: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    if (users.length === 0) {
      console.log('📭 No users registered yet.');
      return;
    }
    
    console.log(`📊 Found ${users.length} registered users:\n`);
    console.log('═══════════════════════════════════════════════════════════════════');
    
    users.forEach((user, index) => {
      console.log(`\n#${index + 1} USER DETAILS:`);
      console.log('───────────────────────────────────────');
      console.log(`📧 Email:     ${user.email}`);
      console.log(`👤 Name:      ${user.fullName}`);
      console.log(`📱 Phone:     ${user.phone || 'Not provided'}`);
      console.log(`🏙️  City:      ${user.city || 'Not provided'}`);
      console.log(`🏆 Points:    ${user.totalPoints}`);
      console.log(`🎭 Role:      ${user.role}`);
      console.log(`🔐 MFA:       ${user.mfaEnabled ? 'Enabled' : 'Disabled'}`);
      console.log(`📅 Joined:    ${user.createdAt.toLocaleString()}`);
      console.log(`🆔 ID:        ${user.id}`);
    });
    
    console.log('\n═══════════════════════════════════════════════════════════════════');
    console.log('\n📈 STATISTICS:');
    console.log(`• Total Users: ${users.length}`);
    console.log(`• Admin Users: ${users.filter(u => u.role === 'ADMIN').length}`);
    console.log(`• Today's Signups: ${users.filter(u => u.createdAt.toDateString() === new Date().toDateString()).length}`);
    
    // Get user with most points
    const topUser = users.reduce((prev, current) => 
      (prev.totalPoints > current.totalPoints) ? prev : current
    );
    
    if (topUser.totalPoints > 0) {
      console.log(`• Top User: ${topUser.fullName} (${topUser.totalPoints} points)`);
    }
    
  } catch (error) {
    console.error('❌ Error fetching users:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
viewUsers();