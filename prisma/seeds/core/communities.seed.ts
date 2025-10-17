require('dotenv').config({ path: require('path').join(__dirname, '../../../.env') });

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedCommunities() {
  console.log('\n🏘️  Creating sample communities...');
  
  const adminUser = await prisma.user.findUnique({ where: { email: 'admin@test.com' } });
  const hostUser = await prisma.user.findUnique({ where: { email: 'host@test.com' } });
  const aliceUser = await prisma.user.findUnique({ where: { email: 'alice@test.com' } });
  const bobUser = await prisma.user.findUnique({ where: { email: 'bob@test.com' } });
  
  if (!adminUser || !hostUser) {
    console.log('⚠️  Required users not found. Skipping communities seed.');
    return [];
  }

  const communities = [
    {
      name: 'KL Foodies',
      description: 'For food lovers in Kuala Lumpur. Discover hidden gems, share recipes, and organize food adventures!',
      category: 'Food & Drinks',
      isVerified: true,
      createdById: adminUser.id,
    },
    {
      name: 'Sports & Fitness',
      description: 'Stay active together - badminton, futsal, hiking, running, and more!',
      category: 'Sports',
      isVerified: true,
      createdById: hostUser.id,
    },
    {
      name: 'Tech Talk KL',
      description: 'Discuss technology, startups, and innovation. Weekly meetups for developers and tech enthusiasts.',
      category: 'Technology',
      isVerified: true,
      createdById: adminUser.id,
    },
    {
      name: 'Travel Buddies Malaysia',
      description: 'Find travel companions for local and international trips. Share experiences and travel tips!',
      category: 'Travel',
      isVerified: true,
      createdById: aliceUser?.id || adminUser.id,
    },
    {
      name: 'Coffee Enthusiasts',
      description: 'For coffee lovers! Explore local cafes, learn about brewing methods, and enjoy great conversations.',
      category: 'Food & Drinks',
      isVerified: false,
      createdById: bobUser?.id || hostUser.id,
    },
    {
      name: 'Volunteer Squad',
      description: 'Make a difference together. Community service, charity events, and social impact projects.',
      category: 'Volunteering',
      isVerified: true,
      createdById: hostUser.id,
    },
  ];

  const createdCommunities = [];
  for (const community of communities) {
    const created = await prisma.community.create({
      data: community,
    });
    
    // Add creator as owner
    await prisma.communityMember.create({
      data: {
        communityId: created.id,
        userId: community.createdById,
        role: 'OWNER',
        isApproved: true,
      },
    });
    createdCommunities.push(created);
  }
  
  // Add more members to communities
  if (createdCommunities.length > 0 && aliceUser && bobUser) {
    await prisma.communityMember.createMany({
      data: [
        { communityId: createdCommunities[0].id, userId: aliceUser.id, role: 'MEMBER', isApproved: true },
        { communityId: createdCommunities[0].id, userId: bobUser.id, role: 'MEMBER', isApproved: true },
        { communityId: createdCommunities[1].id, userId: adminUser.id, role: 'MEMBER', isApproved: true },
        { communityId: createdCommunities[1].id, userId: bobUser.id, role: 'MODERATOR', isApproved: true },
        { communityId: createdCommunities[2].id, userId: bobUser.id, role: 'MEMBER', isApproved: true },
        { communityId: createdCommunities[3].id, userId: hostUser.id, role: 'MEMBER', isApproved: true },
      ],
    });
  }
  
  console.log(`✅ ${createdCommunities.length} sample communities created`);
  return createdCommunities;
}

async function main() {
  await seedCommunities();
}

if (require.main === module) {
  main()
    .catch((e) => {
      console.error('❌ Community seed failed:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
