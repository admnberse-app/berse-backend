const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUsers() {
  try {
    // Check for users with zayd in their details
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: 'zayd', mode: 'insensitive' } },
          { username: { contains: 'zayd', mode: 'insensitive' } },
          { fullName: { contains: 'zayd', mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        createdAt: true
      }
    });

    console.log('Found users:', users);
    
    // Also get total user count
    const count = await prisma.user.count();
    console.log('Total users in database:', count);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();