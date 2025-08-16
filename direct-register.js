const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function registerUser() {
  try {
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

    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: userData.email },
          { username: userData.username }
        ]
      }
    });

    if (existingUser) {
      console.log('User already exists:', existingUser.email);
      return;
    }

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
    console.error('Error registering user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

registerUser();