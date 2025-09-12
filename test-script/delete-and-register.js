const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function deleteAndRegister() {
  try {
    // First delete any existing users with these emails
    await prisma.user.deleteMany({
      where: {
        OR: [
          { email: 'zaydmahdaly@example.com' },
          { email: 'zaydmahdaly@ahlumran.org' },
          { username: 'Zayd Mahdaly' }
        ]
      }
    });
    console.log('Cleaned up existing users');

    const userData = {
      email: 'zaydmahdaly@ahlumran.org',
      password: 'Test123!@',
      fullName: 'Zayd Mahdaly',
      username: 'Zayd Mahdaly',
      phone: '+60123456789',
      nationality: 'Malaysia',
      countryOfResidence: 'Malaysia',
      city: 'Kuala Lumpur',
      gender: 'male',
      dateOfBirth: new Date('1995-01-01')
    };

    console.log('Registering user:', userData.email);

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: userData.email,
        password: hashedPassword,
        fullName: userData.fullName,
        username: userData.username,
        phone: userData.phone,
        nationality: userData.nationality,
        countryOfResidence: userData.countryOfResidence,
        city: userData.city,
        gender: userData.gender,
        dateOfBirth: userData.dateOfBirth,
        role: 'GENERAL_USER'
      }
    });

    console.log('User created successfully!');
    console.log('ID:', user.id);
    console.log('Email:', user.email);
    console.log('Username:', user.username);
    console.log('Full Name:', user.fullName);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteAndRegister();