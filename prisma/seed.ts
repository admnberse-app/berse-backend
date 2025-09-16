// Load environment from parent directory
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

import { PrismaClient, BadgeType, UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const badges = [
  {
    type: BadgeType.FIRST_FACE,
    name: 'First Face',
    description: 'Attended your first BerseMuka event',
    criteria: 'Attend first event',
  },
  {
    type: BadgeType.CAFE_FRIEND,
    name: 'Cafe Friend',
    description: 'Regular cafe meetup attendee',
    criteria: 'Attend/host 3 Cafe Friend meetups',
  },
  {
    type: BadgeType.SUKAN_SQUAD_MVP,
    name: 'Sukan Squad MVP',
    description: 'Active sports participant',
    criteria: 'Attend 5 sessions or voted MVP',
  },
  {
    type: BadgeType.SOUL_NOURISHER,
    name: 'Soul Nourisher',
    description: 'Regular Ilm event participant',
    criteria: 'Join 3 Ilm events',
  },
  {
    type: BadgeType.HELPERS_HAND,
    name: "Helper's Hand",
    description: 'Community volunteer',
    criteria: 'Volunteer in 2+ events',
  },
  {
    type: BadgeType.CONNECTOR,
    name: 'Connector',
    description: 'Community builder',
    criteria: 'Refer 3 active users',
  },
  {
    type: BadgeType.TOP_FRIEND,
    name: 'Top Friend',
    description: 'Monthly leaderboard champion',
    criteria: 'Top 3 monthly leaderboard',
  },
  {
    type: BadgeType.ICEBREAKER,
    name: 'Icebreaker',
    description: 'Game facilitator',
    criteria: 'Facilitate BerseMuka game',
  },
  {
    type: BadgeType.CERTIFIED_HOST,
    name: 'Certified Host',
    description: 'Trained event host',
    criteria: 'Complete training + host',
  },
  {
    type: BadgeType.STREAK_CHAMP,
    name: 'Streak Champ',
    description: 'Consistent event attendee',
    criteria: 'Attend 3 events in a row',
  },
  {
    type: BadgeType.LOCAL_GUIDE,
    name: 'Local Guide',
    description: 'City tour host',
    criteria: 'Host traveler from another city',
  },
  {
    type: BadgeType.KIND_SOUL,
    name: 'Kind Soul',
    description: 'Community donor',
    criteria: 'Donate to campaign/fund',
  },
  {
    type: BadgeType.KNOWLEDGE_SHARER,
    name: 'Knowledge Sharer',
    description: 'Community teacher',
    criteria: 'Give a talk, teach skill',
  },
  {
    type: BadgeType.ALL_ROUNDER,
    name: 'All-Rounder',
    description: 'Multi-badge achiever',
    criteria: 'Earn 5 unique badges',
  },
];

async function main() {
  console.log('🌱 Starting seed...');

  // Create badges
  for (const badge of badges) {
    await prisma.badge.upsert({
      where: { type: badge.type },
      update: {},
      create: badge,
    });
  }

  console.log('✅ Badges seeded successfully');

  // Create sample rewards
  const rewards = [
    {
      title: 'Tealive Boba Voucher',
      description: 'Enjoy a refreshing boba tea',
      pointsRequired: 8,
      category: 'Food & Drinks',
      partner: 'Tealive',
      quantity: 100,
    },
    {
      title: 'Kopikku Drink Voucher',
      description: 'Get your caffeine fix',
      pointsRequired: 7,
      category: 'Food & Drinks',
      partner: 'Kopikku',
      quantity: 100,
    },
    {
      title: 'Shopee RM5 Voucher',
      description: 'Shop online with RM5 off',
      pointsRequired: 15,
      category: 'E-Commerce',
      partner: 'Shopee',
      quantity: 50,
    },
    {
      title: 'BerseMuka Tote Bag',
      description: 'Exclusive BerseMuka merchandise',
      pointsRequired: 10,
      category: 'Lifestyle',
      partner: 'BerseMuka',
      quantity: 200,
    },
  ];

  // Clear existing rewards to avoid duplicates
  await prisma.reward.deleteMany({});
  
  for (const reward of rewards) {
    await prisma.reward.create({
      data: reward,
    });
  }

  console.log('✅ Sample rewards created');

  // ===========================================
  // ADD TEST USERS FOR LOGIN
  // ===========================================
  
  console.log('👥 Creating test users...');
  
  // Hash passwords
  const defaultPassword = await bcrypt.hash('password123', 12);
  const adminPassword = await bcrypt.hash('admin123', 12);

  // Clear existing users (optional - remove this line if you want to keep existing users)
  await prisma.user.deleteMany({});
  
  // Create 5 test users
  const users = [
    {
      email: 'admin@test.com',
      username: 'admin',
      password: adminPassword,
      fullName: 'Admin User',
      phone: '+60123456789',
      role: UserRole.ADMIN,
      isHostCertified: true,
      totalPoints: 1000,
      bio: 'System administrator with full access',
      city: 'Kuala Lumpur',
      interests: ['technology', 'management'],
      timezone: 'Asia/Kuala_Lumpur',
      preferredLanguage: 'en',
      currency: 'MYR'
    },
    {
      email: 'host@test.com',
      username: 'host1',
      password: defaultPassword,
      fullName: 'Sarah Host',
      phone: '+60123456790',
      role: UserRole.GENERAL_USER,
      isHostCertified: true,
      totalPoints: 250,
      bio: 'Certified event host in KL',
      city: 'Kuala Lumpur',
      interests: ['events', 'networking', 'social'],
      timezone: 'Asia/Kuala_Lumpur',
      preferredLanguage: 'en',
      currency: 'MYR'
    },
    {
      email: 'alice@test.com',
      username: 'alice',
      password: defaultPassword,
      fullName: 'Alice Johnson',
      phone: '+60123456791',
      role: UserRole.GENERAL_USER,
      isHostCertified: false,
      totalPoints: 120,
      bio: 'Love meeting new people and exploring KL',
      city: 'Petaling Jaya',
      interests: ['food', 'travel', 'photography'],
      timezone: 'Asia/Kuala_Lumpur',
      preferredLanguage: 'en',
      currency: 'MYR'
    },
    {
      email: 'bob@test.com',
      username: 'bob',
      password: defaultPassword,
      fullName: 'Bob Smith',
      phone: '+60123456792',
      role: UserRole.GENERAL_USER,
      isHostCertified: false,
      totalPoints: 85,
      bio: 'Sports enthusiast and coffee lover',
      city: 'Shah Alam',
      interests: ['sports', 'fitness', 'coffee'],
      timezone: 'Asia/Kuala_Lumpur',
      preferredLanguage: 'en',
      currency: 'MYR'
    },
    {
      email: 'demo@test.com',
      username: 'demo',
      password: defaultPassword,
      fullName: 'Demo User',
      phone: '+60123456793',
      role: UserRole.GENERAL_USER,
      isHostCertified: false,
      totalPoints: 50,
      bio: 'New to the community, excited to connect',
      city: 'Subang Jaya',
      interests: ['networking', 'learning'],
      timezone: 'Asia/Kuala_Lumpur',
      preferredLanguage: 'en',
      currency: 'MYR'
    }
  ];

  for (const userData of users) {
    await prisma.user.create({
      data: userData
    });
  }

  console.log('✅ Test users created successfully');

  // Create sample refresh tokens for first 2 users
  const createdUsers = await prisma.user.findMany({
    select: { id: true, email: true },
    take: 2
  });

  for (const user of createdUsers) {
    await prisma.refreshToken.create({
      data: {
        tokenHash: `refresh_hash_${user.id}_${Date.now()}`,
        tokenFamily: `family_${user.id}`,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        isRevoked: false
      }
    });
  }

  console.log('✅ Sample refresh tokens created');

  // Display created users
  const allUsers = await prisma.user.findMany({
    select: {
      email: true,
      fullName: true,
      role: true,
      isHostCertified: true,
      totalPoints: true,
      city: true
    }
  });

  console.log('\n📋 Created Users:');
  console.table(allUsers);

  console.log('\n🔐 Login Credentials:');
  console.log('1. Admin : admin@test.com / admin123');
  console.log('2. Host  : host@test.com / password123');
  console.log('3. User  : alice@test.com / password123'); 
  console.log('4. User  : bob@test.com / password123');
  console.log('5. Demo  : demo@test.com / password123');

  console.log('🎉 Seed completed successfully');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });