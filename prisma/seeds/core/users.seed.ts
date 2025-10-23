require('dotenv').config({ path: require('path').join(__dirname, '../../../.env') });

import { PrismaClient, UserRole, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function seedUsers() {
  console.log('\n👥 Creating test users...');
  
  const defaultPassword = await bcrypt.hash('password123', 12);
  const adminPassword = await bcrypt.hash('admin123', 12);

  await prisma.user.deleteMany({});
  
  const usersData = [
    {
      email: 'admin@test.com',
      username: 'admin',
      password: adminPassword,
      fullName: 'Admin User',
      phone: '+60123456789',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      totalPoints: 1000,
      trustScore: 95.0,
      trustLevel: 'leader',
      profile: {
        displayName: 'Admin',
        bio: 'System administrator with full access',
        interests: ['technology', 'management', 'community'],
        languages: ['en', 'ms'],
        profession: 'System Administrator',
      },
      location: {
        currentCity: 'Kuala Lumpur',
        countryOfResidence: 'Malaysia',
        nationality: 'Malaysian',
        timezone: 'Asia/Kuala_Lumpur',
        preferredLanguage: 'en',
        currency: 'MYR',
      },
      security: {
        emailVerifiedAt: new Date(),
        phoneVerifiedAt: new Date(),
        lastLoginAt: new Date(),
      },
      serviceProfile: {
        isHostCertified: true,
        isHostAvailable: true,
        isGuideAvailable: false,
        hostDescription: 'Experienced event organizer',
      },
    },
    {
      email: 'host@test.com',
      username: 'host1',
      password: defaultPassword,
      fullName: 'Sarah Host',
      phone: '+60123456790',
      role: UserRole.GENERAL_USER,
      status: UserStatus.ACTIVE,
      totalPoints: 250,
      trustScore: 75.0,
      trustLevel: 'trusted',
      profile: {
        displayName: 'Sarah',
        bio: 'Certified event host in KL. Love bringing people together!',
        shortBio: 'Event host & community builder',
        interests: ['events', 'networking', 'social', 'food'],
        languages: ['en', 'ms'],
        profession: 'Event Coordinator',
        instagramHandle: '@sarah.host',
      },
      location: {
        currentCity: 'Kuala Lumpur',
        countryOfResidence: 'Malaysia',
        nationality: 'Malaysian',
        originallyFrom: 'Penang',
        timezone: 'Asia/Kuala_Lumpur',
        preferredLanguage: 'en',
        currency: 'MYR',
      },
      security: {
        emailVerifiedAt: new Date(),
        lastLoginAt: new Date(),
      },
      serviceProfile: {
        isHostCertified: true,
        isHostAvailable: true,
        isGuideAvailable: true,
        hostDescription: 'Can host events up to 50 people',
        guideDescription: 'KL city tours available on weekends',
      },
    },
    {
      email: 'alice@test.com',
      username: 'alice',
      password: defaultPassword,
      fullName: 'Alice Johnson',
      phone: '+60123456791',
      role: UserRole.GENERAL_USER,
      status: UserStatus.ACTIVE,
      totalPoints: 120,
      trustScore: 60.0,
      trustLevel: 'trusted',
      profile: {
        displayName: 'Alice',
        bio: 'Love meeting new people and exploring KL. Always up for food adventures!',
        shortBio: 'Foodie & travel enthusiast',
        interests: ['food', 'travel', 'photography', 'hiking'],
        languages: ['en'],
        profession: 'Marketing Manager',
        dateOfBirth: new Date('1995-05-15'),
        gender: 'Female',
        travelStyle: 'Cultural Explorer',
        bucketList: ['Japan', 'Iceland', 'New Zealand'],
      },
      location: {
        currentCity: 'Petaling Jaya',
        countryOfResidence: 'Malaysia',
        nationality: 'American',
        originallyFrom: 'New York',
        timezone: 'Asia/Kuala_Lumpur',
        preferredLanguage: 'en',
        currency: 'MYR',
      },
      security: {
        emailVerifiedAt: new Date(),
      },
    },
    {
      email: 'bob@test.com',
      username: 'bob',
      password: defaultPassword,
      fullName: 'Bob Smith',
      phone: '+60123456792',
      role: UserRole.GENERAL_USER,
      status: UserStatus.ACTIVE,
      totalPoints: 85,
      trustScore: 55.0,
      trustLevel: 'starter',
      profile: {
        displayName: 'Bob',
        bio: 'Sports enthusiast and coffee lover. Let\'s play badminton!',
        shortBio: 'Sports & fitness',
        interests: ['sports', 'fitness', 'coffee', 'gaming'],
        languages: ['en', 'ms'],
        profession: 'Software Engineer',
        dateOfBirth: new Date('1992-08-22'),
        gender: 'Male',
      },
      location: {
        currentCity: 'Shah Alam',
        countryOfResidence: 'Malaysia',
        nationality: 'Malaysian',
        timezone: 'Asia/Kuala_Lumpur',
        preferredLanguage: 'en',
        currency: 'MYR',
      },
      security: {
        emailVerifiedAt: new Date(),
      },
    },
    {
      email: 'demo@test.com',
      username: 'demo',
      password: defaultPassword,
      fullName: 'Demo User',
      phone: '+60123456793',
      role: UserRole.GENERAL_USER,
      status: UserStatus.ACTIVE,
      totalPoints: 50,
      trustScore: 30.0,
      trustLevel: 'starter',
      profile: {
        displayName: 'Demo',
        bio: 'New to the community, excited to connect and make friends!',
        shortBio: 'New member',
        interests: ['networking', 'learning', 'culture'],
        languages: ['en'],
      },
      location: {
        currentCity: 'Subang Jaya',
        countryOfResidence: 'Malaysia',
        timezone: 'Asia/Kuala_Lumpur',
        preferredLanguage: 'en',
        currency: 'MYR',
      },
    },
  ];

  const createdUsers = [];
  for (const userData of usersData) {
    const { profile, location, security, serviceProfile, ...userCore } = userData;
    
    const user = await prisma.user.create({
      data: {
        ...userCore,
        profile: profile ? { create: profile } : undefined,
        location: location ? { create: location } : undefined,
        security: security ? { create: security } : undefined,
        privacy: {
          create: {
            profileVisibility: 'public',
            searchableByEmail: true,
            searchableByPhone: true,
            consentToDataProcessing: true,
          },
        },
        preferences: {
          create: {
            darkMode: false,
          },
        },
        metadata: {
          create: {
            referralCode: `REF${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
            referralSource: 'seed',
          },
        },
        serviceProfile: serviceProfile ? { create: serviceProfile } : undefined,
      },
      include: {
        profile: true,
        location: true,
        security: true,
        metadata: true,
      },
    });
    
    createdUsers.push(user);
  }

  console.log(`✅ ${createdUsers.length} test users created successfully`);

  // Create auth identities
  for (const user of createdUsers) {
    await prisma.authIdentity.create({
      data: {
        userId: user.id,
        provider: 'password',
        providerUid: user.email || user.phone || user.username || '',
        email: user.email,
      },
    });
  }
  console.log('✅ Auth identities created');

  // Create sample refresh tokens
  for (let i = 0; i < Math.min(2, createdUsers.length); i++) {
    const user = createdUsers[i];
    await prisma.refreshToken.create({
      data: {
        tokenHash: `refresh_hash_${user.id}_${Date.now()}`,
        tokenFamily: `family_${user.id}`,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        isRevoked: false,
      },
    });
  }
  console.log('✅ Sample refresh tokens created');

  return createdUsers;
}

async function main() {
  const users = await seedUsers();
  
  console.log('\n🔐 Login Credentials:');
  console.log('   1. Admin    : admin@test.com / admin123');
  console.log('   2. Host     : host@test.com / password123');
  console.log('   3. User     : alice@test.com / password123');
  console.log('   4. User     : bob@test.com / password123');
  console.log('   5. Demo     : demo@test.com / password123');
}

if (require.main === module) {
  main()
    .catch((e) => {
      console.error('❌ User seed failed:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
