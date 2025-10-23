require('dotenv').config({ path: require('path').join(__dirname, '../../../.env') });

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedCommunities() {
  console.log('\n🏘️  Creating sample communities...');
  
  const adminUser = await prisma.user.findUnique({ where: { email: 'admin@berseapp.com' } });
  const sarahUser = await prisma.user.findUnique({ where: { email: 'sarah.host@berseapp.com' } });
  const mayaUser = await prisma.user.findUnique({ where: { email: 'maya.food@berseapp.com' } });
  const davidUser = await prisma.user.findUnique({ where: { email: 'david.tech@berseapp.com' } });
  
  if (!adminUser || !sarahUser) {
    console.log('⚠️  Required users not found. Skipping communities seed.');
    return [];
  }

  const communities = [
    {
      name: 'KL Foodies United',
      description: 'The ultimate community for food lovers in Kuala Lumpur! Discover hidden gems, share recipes, organize food crawls, and connect with fellow foodies. From street food to fine dining, we explore it all! 🍜🍕🍱',
      logoUrl: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=200&h=200&fit=crop',
      coverImageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200&h=400&fit=crop',
      interests: ['Food & Dining', 'Cultural Experiences', 'Social Activities'],
      isVerified: true,
      createdById: adminUser.id,
    },
    {
      name: 'Tech Innovators KL',
      description: 'Hub for developers, entrepreneurs, and tech enthusiasts in KL. Weekly meetups, hackathons, tech talks, and networking events. Whether you\'re a beginner or expert, all are welcome! 💻🚀',
      logoUrl: 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=200&h=200&fit=crop',
      coverImageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&h=400&fit=crop',
      interests: ['Technology', 'Entrepreneurship', 'Networking', 'Innovation'],
      isVerified: true,
      createdById: adminUser.id,
    },
    {
      name: 'Fitness & Wellness Warriors',
      description: 'Stay active and healthy together! Running groups, yoga sessions, HIIT workouts, and wellness workshops. All fitness levels welcome. Let\'s motivate each other! 🏃‍♀️💪🧘',
      logoUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=200&h=200&fit=crop',
      coverImageUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1200&h=400&fit=crop',
      interests: ['Sports & Fitness', 'Health & Wellness', 'Outdoor Activities'],
      isVerified: true,
      createdById: sarahUser.id,
    },
    {
      name: 'Travel Adventurers Malaysia',
      description: 'Find travel companions for local and international adventures! Share travel tips, plan group trips, exchange recommendations, and build friendships through exploration. ✈️🌏🎒',
      logoUrl: 'https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=200&h=200&fit=crop',
      coverImageUrl: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&h=400&fit=crop',
      interests: ['Travel', 'Adventure', 'Cultural Experiences', 'Photography'],
      isVerified: true,
      createdById: mayaUser?.id || adminUser.id,
    },
    {
      name: 'Creative Minds Collective',
      description: 'Artists, designers, photographers, and creatives unite! Share your work, collaborate on projects, attend exhibitions, and get inspired. All creative disciplines welcome! 🎨📸✨',
      logoUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=200&h=200&fit=crop',
      coverImageUrl: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=1200&h=400&fit=crop',
      interests: ['Arts & Crafts', 'Photography', 'Design', 'Cultural Experiences'],
      isVerified: true,
      createdById: adminUser.id,
    },
    {
      name: 'Music Lovers Society',
      description: 'For musicians and music enthusiasts! Open mic nights, jam sessions, concert outings, and music discussions. All genres and skill levels welcome. Let\'s make beautiful music together! 🎵🎸🎤',
      logoUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=200&h=200&fit=crop',
      coverImageUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1200&h=400&fit=crop',
      interests: ['Music & Concerts', 'Arts & Crafts', 'Social Activities'],
      isVerified: true,
      createdById: sarahUser.id,
    },
    {
      name: 'Social Impact Collective',
      description: 'Making a difference together! Volunteer projects, charity events, community service, and social entrepreneurship. Join us in creating positive change in our community. 🤝💚🌱',
      logoUrl: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=200&h=200&fit=crop',
      coverImageUrl: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1200&h=400&fit=crop',
      interests: ['Volunteering', 'Community Service', 'Social Impact', 'Environment'],
      isVerified: true,
      createdById: sarahUser.id,
    },
    {
      name: 'Sustainable Living Malaysia',
      description: 'For eco-conscious individuals committed to sustainable living. Zero waste tips, ethical brands, green initiatives, and environmental activism. Small actions, big impact! 🌍♻️🌿',
      logoUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=200&h=200&fit=crop',
      coverImageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1200&h=400&fit=crop',
      interests: ['Environment', 'Sustainability', 'Community Service', 'Education'],
      isVerified: true,
      createdById: adminUser.id,
    },
    {
      name: 'Photography Enthusiasts KL',
      description: 'Connect with fellow photographers! Photo walks, workshops, critiques, and exhibitions. From smartphone photography to professional gear - all shutterbugs welcome! 📷📸🎞️',
      logoUrl: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=200&h=200&fit=crop',
      coverImageUrl: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=1200&h=400&fit=crop',
      interests: ['Photography', 'Arts & Crafts', 'Outdoor Activities', 'Travel'],
      isVerified: true,
      createdById: adminUser.id,
    },
    {
      name: 'Book Club Klang Valley',
      description: 'For book lovers and avid readers! Monthly book discussions, author meetups, library visits, and reading challenges. Fiction, non-fiction, all genres welcome. Let\'s get lost in stories! 📚📖✨',
      logoUrl: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=200&h=200&fit=crop',
      coverImageUrl: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1200&h=400&fit=crop',
      interests: ['Books & Reading', 'Education', 'Social Activities', 'Cultural Experiences'],
      isVerified: false,
      createdById: adminUser.id,
    },
    {
      name: 'Gaming Community MY',
      description: 'Gamers unite! PC, console, mobile - all platforms welcome. Tournaments, LAN parties, game nights, and friendly competitions. Level up together! 🎮🕹️👾',
      logoUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=200&h=200&fit=crop',
      coverImageUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=1200&h=400&fit=crop',
      interests: ['Gaming', 'Technology', 'Social Activities', 'Esports'],
      isVerified: true,
      createdById: sarahUser.id,
    },
    {
      name: 'Parents Support Network',
      description: 'Support system for parents! Share experiences, organize playdates, exchange parenting tips, and build friendships. From new parents to experienced ones - we\'re in this together! 👶👨‍👩‍👧‍👦💕',
      logoUrl: 'https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=200&h=200&fit=crop',
      coverImageUrl: 'https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=1200&h=400&fit=crop',
      interests: ['Family & Parenting', 'Education', 'Social Activities', 'Health & Wellness'],
      isVerified: true,
      createdById: sarahUser.id,
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
  if (createdCommunities.length > 0 && mayaUser && davidUser) {
    await prisma.communityMember.createMany({
      data: [
        { communityId: createdCommunities[0].id, userId: mayaUser.id, role: 'MEMBER', isApproved: true },
        { communityId: createdCommunities[0].id, userId: davidUser.id, role: 'MEMBER', isApproved: true },
        { communityId: createdCommunities[1].id, userId: davidUser.id, role: 'MODERATOR', isApproved: true },
        { communityId: createdCommunities[2].id, userId: davidUser.id, role: 'MEMBER', isApproved: true },
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
