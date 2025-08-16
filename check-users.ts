import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        username: true,
        createdAt: true,
      }
    });

    console.log('\n=== All Registered Users ===\n');
    
    if (users.length === 0) {
      console.log('No users found in the database.');
    } else {
      users.forEach((user, index) => {
        console.log(`${index + 1}. User ID: ${user.id}`);
        console.log(`   Full Name: ${user.fullName}`);
        console.log(`   Username: ${user.username || 'Not set'}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Registered: ${user.createdAt.toLocaleString()}`);
        console.log('---');
      });
      console.log(`\nTotal users: ${users.length}`);
    }

    // Check specifically for Zayd
    const zaydSearch = await prisma.user.findMany({
      where: {
        OR: [
          { fullName: { contains: 'Zayd', mode: 'insensitive' } },
          { username: { contains: 'Zayd', mode: 'insensitive' } },
        ]
      }
    });

    if (zaydSearch.length > 0) {
      console.log('\n=== Users with "Zayd" in name/username ===\n');
      zaydSearch.forEach(user => {
        console.log(`Found: ${user.fullName} (username: ${user.username || 'Not set'})`);
      });
    } else {
      console.log('\n❌ No users with "Zayd" found in the database.');
    }

  } catch (error) {
    console.error('Error checking database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();