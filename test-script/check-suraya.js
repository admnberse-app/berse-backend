const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkForSuraya() {
  try {
    console.log('\n=== Searching for Suraya\'s Account ===\n');
    
    // Search broadly for any user with "suraya" in their data
    const surayaUsers = await prisma.user.findMany({
      where: {
        OR: [
          { fullName: { contains: 'suraya', mode: 'insensitive' } },
          { email: { contains: 'suraya', mode: 'insensitive' } },
          { username: { contains: 'suraya', mode: 'insensitive' } }
        ]
      }
    });
    
    if (surayaUsers.length > 0) {
      console.log('Found Suraya account(s):');
      surayaUsers.forEach(u => {
        console.log(`- ${u.fullName} (${u.email})`);
        console.log(`  ID: ${u.id}`);
        console.log(`  Membership ID: ${u.membershipId || 'Not set'}`);
        console.log(`  Created: ${u.createdAt}`);
        console.log('');
      });
    } else {
      console.log('❌ No account found with "Suraya" in name, email, or username');
    }
    
    // Check all recent registrations
    console.log('\n=== All Users (Most Recent First) ===\n');
    const allUsers = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        fullName: true,
        email: true,
        createdAt: true,
        membershipId: true
      }
    });
    
    allUsers.forEach((u, i) => {
      const createdDate = new Date(u.createdAt);
      const now = new Date();
      const hoursDiff = Math.floor((now - createdDate) / (1000 * 60 * 60));
      
      console.log(`${i + 1}. ${u.fullName || 'No name'}`);
      console.log(`   Email: ${u.email}`);
      console.log(`   Membership ID: ${u.membershipId || 'Not set'}`);
      console.log(`   Created: ${createdDate.toLocaleString()} (${hoursDiff} hours ago)`);
      console.log('');
    });
    
    console.log(`Total users in database: ${allUsers.length}`);
    
    // Check for failed registration attempts in point history
    console.log('\n=== Recent Point History (might show registration attempts) ===\n');
    const recentPoints = await prisma.pointHistory.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { user: true }
    });
    
    recentPoints.forEach(p => {
      console.log(`- ${p.user.fullName}: ${new Date(p.createdAt).toLocaleString()}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkForSuraya();