const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkNewRegistrations() {
  try {
    console.log('\n=== Checking for New Registrations ===\n');
    
    // Get all users sorted by creation date (newest first)
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        fullName: true,
        email: true,
        username: true,
        membershipId: true,
        createdAt: true,
        age: true,
        city: true,
        currentLocation: true,
        nationality: true,
        profession: true,
        phone: true
      }
    });
    
    console.log('Total users in database:', users.length);
    console.log('\n=== All Users (Newest First) ===\n');
    
    users.forEach((user, index) => {
      const createdDate = new Date(user.createdAt);
      const now = new Date();
      const hoursDiff = Math.floor((now - createdDate) / (1000 * 60 * 60));
      const daysDiff = Math.floor(hoursDiff / 24);
      
      console.log(`${index + 1}. ${user.fullName || 'No name'}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Username: ${user.username || 'Not set'}`);
      console.log(`   Phone: ${user.phone || 'Not provided'}`);
      console.log(`   Membership ID: ${user.membershipId || 'Not set'}`);
      console.log(`   Location: ${user.city || user.currentLocation || 'Not specified'}`);
      console.log(`   Age: ${user.age || 'Not specified'}`);
      console.log(`   Profession: ${user.profession || 'Not specified'}`);
      console.log(`   Created: ${createdDate.toLocaleString()} (${daysDiff > 0 ? daysDiff + ' days' : hoursDiff + ' hours'} ago)`);
      console.log('');
    });
    
    // Check for registrations in the last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentUsers = users.filter(u => new Date(u.createdAt) > oneDayAgo);
    
    if (recentUsers.length > 0) {
      console.log(`\n✅ ${recentUsers.length} NEW REGISTRATION(S) in the last 24 hours!`);
      recentUsers.forEach(u => {
        console.log(`   - ${u.fullName} (${u.email})`);
      });
    } else {
      console.log('\n❌ No new registrations in the last 24 hours');
    }
    
    // Check for registrations today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayUsers = users.filter(u => new Date(u.createdAt) >= today);
    
    if (todayUsers.length > 0) {
      console.log(`\n📅 ${todayUsers.length} registration(s) today:`);
      todayUsers.forEach(u => {
        const time = new Date(u.createdAt).toLocaleTimeString();
        console.log(`   - ${u.fullName} at ${time}`);
      });
    }
    
    // Check for Suraya specifically
    const surayaSearch = users.filter(u => 
      u.fullName?.toLowerCase().includes('suraya') ||
      u.email?.toLowerCase().includes('suraya')
    );
    
    if (surayaSearch.length > 0) {
      console.log('\n🔍 Found Suraya\'s account:');
      surayaSearch.forEach(u => {
        console.log(`   - ${u.fullName} (${u.email}) - Created: ${new Date(u.createdAt).toLocaleString()}`);
      });
    } else {
      console.log('\n🔍 Suraya has not registered yet');
    }
    
  } catch (error) {
    console.error('Error checking registrations:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkNewRegistrations();