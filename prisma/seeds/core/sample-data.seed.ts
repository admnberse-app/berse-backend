require('dotenv').config({ path: require('path').join(__dirname, '../../../.env') });

import { PrismaClient, ConnectionStatus, VouchType, VouchStatus, ServiceType, ServiceStatus, PricingType, ListingStatus } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedConnections() {
  console.log('\n🤝 Creating enhanced user connections...');
  
  const users = await prisma.user.findMany({
    where: {
      email: {
        in: [
          'admin@berseapp.com',
          'sarah.host@berseapp.com',
          'alex.travel@berseapp.com',
          'maya.food@berseapp.com',
          'david.tech@berseapp.com',
          'lisa.fitness@berseapp.com',
          'zara.art@berseapp.com',
          'ryan.student@berseapp.com',
          'emma.expat@berseapp.com',
          'jason.biz@berseapp.com',
          'nina.music@berseapp.com',
          'kevin.photo@berseapp.com',
          'priya.community@berseapp.com',
          'mike.gamer@berseapp.com',
          'sophia.wellness@berseapp.com',
        ],
      },
    },
  });
  
  if (users.length === 0) {
    console.log('⚠️  Required users not found. Skipping connections seed.');
    return;
  }

  const [admin, sarah, alex, maya, david, lisa, zara, ryan, emma, jason, nina, kevin, priya, mike, sophia] = users;

  // Ensure we have at least the required users
  if (!admin || !sarah || users.length < 8) {
    console.log('⚠️  Insufficient users found for connections. Skipping connections seed.');
    return;
  }

  const connections = [
    // Admin connections (high trust network)
    {
      initiatorId: admin?.id || users[0].id,
      receiverId: sarah?.id || users[1].id,
      status: ConnectionStatus.ACCEPTED,
      relationshipCategory: 'professional',
      trustStrength: 90.0,
      connectedAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
      howWeMet: 'Co-founded Berse community platform',
    },
    {
      initiatorId: admin?.id || users[0].id,
      receiverId: priya?.id || users[12].id,
      status: ConnectionStatus.ACCEPTED,
      relationshipCategory: 'professional',
      trustStrength: 85.0,
      connectedAt: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000),
      howWeMet: 'Community leadership program',
    },
    {
      initiatorId: admin?.id || users[0].id,
      receiverId: jason?.id || users[9].id,
      status: ConnectionStatus.ACCEPTED,
      relationshipCategory: 'professional',
      trustStrength: 82.0,
      connectedAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
    },
    
    // Sarah's network (event host - wide connections)
    {
      initiatorId: sarah?.id || users[1].id,
      receiverId: maya?.id || users[3].id,
      status: ConnectionStatus.ACCEPTED,
      relationshipCategory: 'friend',
      trustStrength: 78.0,
      connectedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      howWeMet: 'Met at food tour event',
    },
    {
      initiatorId: sarah?.id || users[1].id,
      receiverId: alex?.id || users[2].id,
      status: ConnectionStatus.ACCEPTED,
      relationshipCategory: 'professional',
      trustStrength: 80.0,
      connectedAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000),
      howWeMet: 'Co-hosted travel events',
    },
    {
      initiatorId: sarah?.id || users[1].id,
      receiverId: kevin?.id || users[11].id,
      status: ConnectionStatus.ACCEPTED,
      relationshipCategory: 'professional',
      trustStrength: 75.0,
      connectedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      howWeMet: 'Event photographer collaboration',
    },
    {
      initiatorId: sarah?.id || users[1].id,
      receiverId: nina?.id || users[10].id,
      status: ConnectionStatus.ACCEPTED,
      relationshipCategory: 'friend',
      trustStrength: 72.0,
      connectedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
    },
    
    // Alex's travel network
    {
      initiatorId: alex?.id || users[2].id,
      receiverId: emma?.id || users[8].id,
      status: ConnectionStatus.ACCEPTED,
      relationshipCategory: 'friend',
      trustStrength: 76.0,
      connectedAt: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000),
      howWeMet: 'Met on Cameron Highlands trip',
    },
    {
      initiatorId: alex?.id || users[2].id,
      receiverId: kevin?.id || users[11].id,
      status: ConnectionStatus.ACCEPTED,
      relationshipCategory: 'friend',
      trustStrength: 70.0,
      connectedAt: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000),
      howWeMet: 'Photography walk at Batu Caves',
    },
    {
      initiatorId: alex?.id || users[2].id,
      receiverId: ryan?.id || users[7].id,
      status: ConnectionStatus.ACCEPTED,
      relationshipCategory: 'social',
      trustStrength: 65.0,
      connectedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    },
    
    // Maya's foodie network
    {
      initiatorId: maya?.id || users[3].id,
      receiverId: emma?.id || users[8].id,
      status: ConnectionStatus.ACCEPTED,
      relationshipCategory: 'friend',
      trustStrength: 74.0,
      connectedAt: new Date(Date.now() - 80 * 24 * 60 * 60 * 1000),
      howWeMet: 'Food bloggers meetup',
    },
    {
      initiatorId: maya?.id || users[3].id,
      receiverId: priya?.id || users[12].id,
      status: ConnectionStatus.ACCEPTED,
      relationshipCategory: 'friend',
      trustStrength: 68.0,
      connectedAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
    },
    
    // David's tech network
    {
      initiatorId: david?.id || users[4].id,
      receiverId: jason?.id || users[9].id,
      status: ConnectionStatus.ACCEPTED,
      relationshipCategory: 'professional',
      trustStrength: 80.0,
      connectedAt: new Date(Date.now() - 110 * 24 * 60 * 60 * 1000),
      howWeMet: 'Startup pitch night',
    },
    {
      initiatorId: david?.id || users[4].id,
      receiverId: ryan?.id || users[7].id,
      status: ConnectionStatus.ACCEPTED,
      relationshipCategory: 'mentor',
      trustStrength: 72.0,
      connectedAt: new Date(Date.now() - 55 * 24 * 60 * 60 * 1000),
      howWeMet: 'Tech mentorship program',
    },
    {
      initiatorId: david?.id || users[4].id,
      receiverId: mike?.id || users[13].id,
      status: ConnectionStatus.ACCEPTED,
      relationshipCategory: 'social',
      trustStrength: 65.0,
      connectedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
    },
    
    // Lisa's fitness network
    {
      initiatorId: lisa?.id || users[5].id,
      receiverId: sophia?.id || users[14].id,
      status: ConnectionStatus.ACCEPTED,
      relationshipCategory: 'professional',
      trustStrength: 82.0,
      connectedAt: new Date(Date.now() - 95 * 24 * 60 * 60 * 1000),
      howWeMet: 'Yoga instructor training',
    },
    {
      initiatorId: lisa?.id || users[5].id,
      receiverId: emma?.id || users[8].id,
      status: ConnectionStatus.ACCEPTED,
      relationshipCategory: 'friend',
      trustStrength: 70.0,
      connectedAt: new Date(Date.now() - 65 * 24 * 60 * 60 * 1000),
    },
    {
      initiatorId: lisa?.id || users[5].id,
      receiverId: priya?.id || users[12].id,
      status: ConnectionStatus.ACCEPTED,
      relationshipCategory: 'friend',
      trustStrength: 68.0,
      connectedAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
    },
    
    // Zara's creative network
    {
      initiatorId: zara?.id || users[6].id,
      receiverId: nina?.id || users[10].id,
      status: ConnectionStatus.ACCEPTED,
      relationshipCategory: 'friend',
      trustStrength: 76.0,
      connectedAt: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000),
      howWeMet: 'Open mic night',
    },
    {
      initiatorId: zara?.id || users[6].id,
      receiverId: kevin?.id || users[11].id,
      status: ConnectionStatus.ACCEPTED,
      relationshipCategory: 'professional',
      trustStrength: 72.0,
      connectedAt: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000),
      howWeMet: 'Creative collaborators',
    },
    
    // Jason's entrepreneur network
    {
      initiatorId: jason?.id || users[9].id,
      receiverId: priya?.id || users[12].id,
      status: ConnectionStatus.ACCEPTED,
      relationshipCategory: 'professional',
      trustStrength: 78.0,
      connectedAt: new Date(Date.now() - 85 * 24 * 60 * 60 * 1000),
    },
    {
      initiatorId: jason?.id || users[9].id,
      receiverId: sophia?.id || users[14].id,
      status: ConnectionStatus.ACCEPTED,
      relationshipCategory: 'professional',
      trustStrength: 70.0,
      connectedAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
    },
    
    // Kevin's photography network
    {
      initiatorId: kevin?.id || users[11].id,
      receiverId: priya?.id || users[12].id,
      status: ConnectionStatus.ACCEPTED,
      relationshipCategory: 'friend',
      trustStrength: 68.0,
      connectedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
    },
    
    // Nina's music network
    {
      initiatorId: nina?.id || users[10].id,
      receiverId: ryan?.id || users[7].id,
      status: ConnectionStatus.ACCEPTED,
      relationshipCategory: 'friend',
      trustStrength: 66.0,
      connectedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    },
    
    // Ryan's student network
    {
      initiatorId: ryan?.id || users[7].id,
      receiverId: mike?.id || users[13].id,
      status: ConnectionStatus.ACCEPTED,
      relationshipCategory: 'friend',
      trustStrength: 70.0,
      connectedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      howWeMet: 'Gaming tournament',
    },
    {
      initiatorId: ryan?.id || users[7].id,
      receiverId: emma?.id || users[8].id,
      status: ConnectionStatus.ACCEPTED,
      relationshipCategory: 'social',
      trustStrength: 62.0,
      connectedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    },
    
    // Emma's expat network
    {
      initiatorId: emma?.id || users[8].id,
      receiverId: sophia?.id || users[14].id,
      status: ConnectionStatus.ACCEPTED,
      relationshipCategory: 'friend',
      trustStrength: 72.0,
      connectedAt: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000),
    },
    
    // Priya's community organizer network
    {
      initiatorId: priya?.id || users[12].id,
      receiverId: sophia?.id || users[14].id,
      status: ConnectionStatus.ACCEPTED,
      relationshipCategory: 'friend',
      trustStrength: 74.0,
      connectedAt: new Date(Date.now() - 55 * 24 * 60 * 60 * 1000),
    },
    
    // Mike's gaming network
    {
      initiatorId: mike?.id || users[13].id,
      receiverId: david?.id || users[4].id,
      status: ConnectionStatus.ACCEPTED,
      relationshipCategory: 'social',
      trustStrength: 64.0,
      connectedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    },
    
    // Sophia's wellness network
    {
      initiatorId: sophia?.id || users[14].id,
      receiverId: maya?.id || users[3].id,
      status: ConnectionStatus.ACCEPTED,
      relationshipCategory: 'friend',
      trustStrength: 68.0,
      connectedAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
    },
    
    // Pending connections
    {
      initiatorId: zara?.id || users[6].id,
      receiverId: ryan?.id || users[7].id,
      status: ConnectionStatus.PENDING,
      relationshipCategory: 'social',
    },
    {
      initiatorId: nina?.id || users[10].id,
      receiverId: mike?.id || users[13].id,
      status: ConnectionStatus.PENDING,
      relationshipCategory: 'social',
    },
    {
      initiatorId: alex?.id || users[2].id,
      receiverId: sophia?.id || users[14].id,
      status: ConnectionStatus.PENDING,
      relationshipCategory: 'friend',
    },
  ];

  for (const connection of connections) {
    await prisma.userConnection.create({
      data: connection,
    });
  }
  
  console.log(`✅ ${connections.length} enhanced user connections created`);
}

export async function seedVouches() {
  console.log('\n✅ Creating enhanced vouches...');
  
  const users = await prisma.user.findMany({
    where: {
      email: {
        in: [
          'admin@berseapp.com',
          'sarah.host@berseapp.com',
          'alex.travel@berseapp.com',
          'maya.food@berseapp.com',
          'david.tech@berseapp.com',
          'lisa.fitness@berseapp.com',
          'jason.biz@berseapp.com',
          'priya.community@berseapp.com',
          'kevin.photo@berseapp.com',
          'sophia.wellness@berseapp.com',
          'emma.expat@berseapp.com',
          'nina.music@berseapp.com',
          'zara.art@berseapp.com',
        ],
      },
    },
  });
  
  if (users.length === 0) {
    console.log('⚠️  Required users not found. Skipping vouches seed.');
    return;
  }

  const [admin, sarah, alex, maya, david, lisa, jason, priya, kevin, sophia, emma, nina, zara] = users;

  const vouches = [
    // Admin vouches (PRIMARY - highest trust impact)
    {
      voucherId: admin?.id || users[0].id,
      voucheeId: sarah?.id || users[1].id,
      vouchType: VouchType.PRIMARY,
      status: VouchStatus.ACTIVE,
      message: 'Outstanding event host and community builder. Has successfully organized 50+ events with 95%+ satisfaction rating. Highly trustworthy and professional.',
      approvedAt: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000),
      activatedAt: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000),
      trustImpact: 30.0,
    },
    {
      voucherId: admin?.id || users[0].id,
      voucheeId: priya?.id || users[7].id,
      vouchType: VouchType.PRIMARY,
      status: VouchStatus.ACTIVE,
      message: 'Exceptional community leader who brings people together. Dedicated to creating inclusive spaces and fostering meaningful connections.',
      approvedAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
      activatedAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
      trustImpact: 28.0,
    },
    {
      voucherId: admin?.id || users[0].id,
      voucheeId: jason?.id || users[6].id,
      vouchType: VouchType.PRIMARY,
      status: VouchStatus.ACTIVE,
      message: 'Successful entrepreneur who gives back to the community. Provides valuable mentorship and supports early-stage startups.',
      approvedAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000),
      activatedAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000),
      trustImpact: 25.0,
    },
    
    // Sarah vouches (SECONDARY - event host network)
    {
      voucherId: sarah?.id || users[1].id,
      voucheeId: alex?.id || users[2].id,
      vouchType: VouchType.SECONDARY,
      status: VouchStatus.ACTIVE,
      message: 'Amazing travel guide with deep knowledge of Malaysia. Always goes the extra mile to ensure great experiences for participants.',
      approvedAt: new Date(Date.now() - 80 * 24 * 60 * 60 * 1000),
      activatedAt: new Date(Date.now() - 80 * 24 * 60 * 60 * 1000),
      trustImpact: 20.0,
    },
    {
      voucherId: sarah?.id || users[1].id,
      voucheeId: maya?.id || users[3].id,
      vouchType: VouchType.SECONDARY,
      status: VouchStatus.ACTIVE,
      message: 'Passionate foodie with incredible knowledge of KL\'s culinary scene. Makes food tours fun and educational.',
      approvedAt: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000),
      activatedAt: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000),
      trustImpact: 18.0,
    },
    {
      voucherId: sarah?.id || users[1].id,
      voucheeId: kevin?.id || users[8].id,
      vouchType: VouchType.SECONDARY,
      status: VouchStatus.ACTIVE,
      message: 'Professional photographer who captures the essence of every event. Reliable, creative, and delivers quality work on time.',
      approvedAt: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000),
      activatedAt: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000),
      trustImpact: 17.0,
    },
    
    // Cross-network vouches (building trust bridges)
    {
      voucherId: alex?.id || users[2].id,
      voucheeId: emma?.id || users[10].id,
      vouchType: VouchType.SECONDARY,
      status: VouchStatus.ACTIVE,
      message: 'Wonderful travel companion and great at connecting with locals. Her expat perspective adds value to every trip.',
      approvedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      activatedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      trustImpact: 16.0,
    },
    {
      voucherId: david?.id || users[4].id,
      voucheeId: jason?.id || users[6].id,
      vouchType: VouchType.SECONDARY,
      status: VouchStatus.ACTIVE,
      message: 'Brilliant business mind and generous mentor. Has helped multiple startups navigate challenges and secure funding.',
      approvedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      activatedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      trustImpact: 19.0,
    },
    {
      voucherId: lisa?.id || users[5].id,
      voucheeId: sophia?.id || users[9].id,
      vouchType: VouchType.SECONDARY,
      status: VouchStatus.ACTIVE,
      message: 'Holistic wellness expert with genuine care for client wellbeing. Professional, knowledgeable, and creates lasting positive change.',
      approvedAt: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000),
      activatedAt: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000),
      trustImpact: 18.0,
    },
    {
      voucherId: priya?.id || users[7].id,
      voucheeId: maya?.id || users[3].id,
      vouchType: VouchType.SECONDARY,
      status: VouchStatus.ACTIVE,
      message: 'Brings people together through the love of food. Her events always have great vibes and delicious discoveries.',
      approvedAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
      activatedAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
      trustImpact: 15.0,
    },
    {
      voucherId: jason?.id || users[6].id,
      voucheeId: priya?.id || users[7].id,
      vouchType: VouchType.SECONDARY,
      status: VouchStatus.ACTIVE,
      message: 'Natural community builder who creates spaces where everyone feels welcome. Her organizational skills are top-notch.',
      approvedAt: new Date(Date.now() - 65 * 24 * 60 * 60 * 1000),
      activatedAt: new Date(Date.now() - 65 * 24 * 60 * 60 * 1000),
      trustImpact: 17.0,
    },
    {
      voucherId: kevin?.id || users[8].id,
      voucheeId: zara?.id || users[12].id,
      vouchType: VouchType.SECONDARY,
      status: VouchStatus.ACTIVE,
      message: 'Talented designer with a great eye for aesthetics. Professional, creative, and always delivers beyond expectations.',
      approvedAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
      activatedAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
      trustImpact: 16.0,
    },
    {
      voucherId: maya?.id || users[3].id,
      voucheeId: emma?.id || users[10].id,
      vouchType: VouchType.SECONDARY,
      status: VouchStatus.ACTIVE,
      message: 'Adventurous foodie always up for trying new places. Great energy and makes every outing memorable.',
      approvedAt: new Date(Date.now() - 55 * 24 * 60 * 60 * 1000),
      activatedAt: new Date(Date.now() - 55 * 24 * 60 * 60 * 1000),
      trustImpact: 14.0,
    },
    {
      voucherId: sophia?.id || users[9].id,
      voucheeId: lisa?.id || users[5].id,
      vouchType: VouchType.SECONDARY,
      status: VouchStatus.ACTIVE,
      message: 'Inspiring yoga instructor who brings mindfulness and positivity to every session. Highly skilled and caring.',
      approvedAt: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000),
      activatedAt: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000),
      trustImpact: 17.0,
    },
    {
      voucherId: zara?.id || users[12].id,
      voucheeId: nina?.id || users[11].id,
      vouchType: VouchType.SECONDARY,
      status: VouchStatus.ACTIVE,
      message: 'Talented musician with passion for bringing people together through music. Always supportive of fellow artists.',
      approvedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      activatedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      trustImpact: 15.0,
    },
    
    // Pending vouches (awaiting approval)
    {
      voucherId: emma?.id || users[10].id,
      voucheeId: sophia?.id || users[9].id,
      vouchType: VouchType.SECONDARY,
      status: VouchStatus.PENDING,
      message: 'Amazing wellness coach who helped me adjust to life in Malaysia. Very knowledgeable and supportive.',
    },
    {
      voucherId: nina?.id || users[11].id,
      voucheeId: zara?.id || users[12].id,
      vouchType: VouchType.SECONDARY,
      status: VouchStatus.PENDING,
      message: 'Creative collaborator with amazing design skills. Would love to vouch for her work!',
    },
  ];

  for (const vouch of vouches) {
    await prisma.vouch.create({ data: vouch });
  }
  
  console.log(`✅ ${vouches.length} sample vouches created`);
}

export async function seedTravelTrips() {
  console.log('\n✈️  Creating sample travel trips...');
  
  const aliceUser = await prisma.user.findUnique({ where: { email: 'alice@test.com' } });
  
  if (!aliceUser) {
    console.log('⚠️  Alice user not found. Skipping travel trips seed.');
    return;
  }

  const trips = [
    {
      userId: aliceUser.id,
      title: 'Backpacking Through Thailand',
      description: 'Amazing 2-week adventure exploring Bangkok, Chiang Mai, and the islands',
      purpose: 'Leisure',
      countries: ['Thailand'],
      cities: ['Bangkok', 'Chiang Mai', 'Phuket'],
      startDate: new Date('2024-06-01'),
      endDate: new Date('2024-06-14'),
      duration: 14,
      isPublic: true,
      isFeatured: false,
      tags: ['backpacking', 'culture', 'beach'],
    },
    {
      userId: aliceUser.id,
      title: 'Singapore Weekend Getaway',
      description: 'Quick trip to visit friends and explore new cafes',
      purpose: 'Social',
      countries: ['Singapore'],
      cities: ['Singapore'],
      startDate: new Date('2024-09-15'),
      endDate: new Date('2024-09-17'),
      duration: 3,
      isPublic: true,
      tags: ['city', 'food', 'shopping'],
    },
  ];

  for (const trip of trips) {
    await prisma.travelTrip.create({ data: trip });
  }
  
  console.log(`✅ ${trips.length} sample travel trips created`);
}

export async function seedServices() {
  console.log('\n🎯 Creating enhanced services...');
  
  const users = await prisma.user.findMany({
    where: {
      email: {
        in: [
          'sarah.host@berseapp.com',
          'alex.travel@berseapp.com',
          'lisa.fitness@berseapp.com',
          'zara.art@berseapp.com',
          'jason.biz@berseapp.com',
          'kevin.photo@berseapp.com',
          'sophia.wellness@berseapp.com',
          'nina.music@berseapp.com',
        ],
      },
    },
  });
  
  if (users.length === 0) {
    console.log('⚠️  No users found. Skipping services seed.');
    return;
  }

  const [sarah, alex, lisa, zara, jason, kevin, sophia, nina] = users;

  const services = [
    {
      providerId: sarah?.id || users[0].id,
      title: 'KL City Walking Tour',
      description: 'Personalized 3-hour walking tour of Kuala Lumpur\'s historic landmarks and hidden gems. Explore Merdeka Square, Central Market, and Chinatown with an experienced guide. Perfect for first-time visitors!',
      serviceType: ServiceType.GUIDING,
      category: 'City Tours',
      pricingType: PricingType.PER_PERSON,
      basePrice: 120.0,
      currency: 'MYR',
      maxGuests: 8,
      location: 'Kuala Lumpur',
      status: ServiceStatus.ACTIVE,
      images: ['https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=600&h=400&fit=crop'],
    },
    {
      providerId: sarah?.id || users[0].id,
      title: 'Event Planning & Hosting',
      description: 'Professional event planning services for community gatherings, corporate events, and private parties. Full service from concept to execution.',
      serviceType: ServiceType.CONSULTATION,
      category: 'Event Planning',
      pricingType: PricingType.PER_HOUR,
      basePrice: 150.0,
      currency: 'MYR',
      location: 'Kuala Lumpur & Selangor',
      status: ServiceStatus.ACTIVE,
      images: ['https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&h=400&fit=crop'],
    },
    {
      providerId: alex?.id || users[0].id,
      title: 'Travel Planning Consultation',
      description: 'Expert travel planning and itinerary creation for Southeast Asia destinations. Budget optimization, accommodation recommendations, and insider tips included.',
      serviceType: ServiceType.CONSULTATION,
      category: 'Travel Consulting',
      pricingType: PricingType.PER_HOUR,
      basePrice: 100.0,
      currency: 'MYR',
      location: 'Online/KL',
      status: ServiceStatus.ACTIVE,
      images: ['https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&h=400&fit=crop'],
    },
    {
      providerId: alex?.id || users[0].id,
      title: 'Photography Tour Guide',
      description: 'Guide photographers to the best spots in KL and Selangor. Sunrise/sunset locations, street photography, and architectural gems. Tips on composition included.',
      serviceType: ServiceType.GUIDING,
      category: 'Photography Tours',
      pricingType: PricingType.PER_HOUR,
      basePrice: 80.0,
      currency: 'MYR',
      maxGuests: 4,
      location: 'KL & Selangor',
      status: ServiceStatus.ACTIVE,
      images: ['https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=600&h=400&fit=crop'],
    },
    {
      providerId: lisa?.id || users[0].id,
      title: 'Personal Yoga Training',
      description: 'One-on-one yoga sessions tailored to your fitness level and goals. Hatha, Vinyasa, or Restorative yoga. Home visits or outdoor sessions available.',
      serviceType: ServiceType.CONSULTATION,
      category: 'Fitness Training',
      pricingType: PricingType.PER_HOUR,
      basePrice: 120.0,
      currency: 'MYR',
      location: 'KL/PJ/Mont Kiara',
      status: ServiceStatus.ACTIVE,
      images: ['https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=400&fit=crop'],
    },
    {
      providerId: lisa?.id || users[0].id,
      title: 'Group Fitness Classes',
      description: 'High-energy group fitness classes - HIIT, cardio, strength training. Minimum 5 participants. Can arrange at your condo gym or preferred location.',
      serviceType: ServiceType.CONSULTATION,
      category: 'Fitness Training',
      pricingType: PricingType.PER_PERSON,
      basePrice: 40.0,
      currency: 'MYR',
      maxGuests: 15,
      location: 'Flexible',
      status: ServiceStatus.ACTIVE,
      images: ['https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&h=400&fit=crop'],
    },
    {
      providerId: zara?.id || users[0].id,
      title: 'Graphic Design Services',
      description: 'Professional graphic design for logos, branding, social media content, and marketing materials. Fast turnaround, unlimited revisions.',
      serviceType: ServiceType.CONSULTATION,
      category: 'Design Services',
      pricingType: PricingType.PER_HOUR,
      basePrice: 120.0,
      currency: 'MYR',
      location: 'Remote/Online',
      status: ServiceStatus.ACTIVE,
      images: ['https://images.unsplash.com/photo-1626785774573-4b799315345d?w=600&h=400&fit=crop'],
    },
    {
      providerId: jason?.id || users[0].id,
      title: 'Business Mentorship',
      description: 'One-on-one mentorship for aspiring entrepreneurs and early-stage startups. Strategy, fundraising, operations, and growth guidance.',
      serviceType: ServiceType.CONSULTATION,
      category: 'Business Consulting',
      pricingType: PricingType.PER_HOUR,
      basePrice: 200.0,
      currency: 'MYR',
      location: 'Online/KL',
      status: ServiceStatus.ACTIVE,
      images: ['https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop'],
    },
    {
      providerId: kevin?.id || users[0].id,
      title: 'Event Photography',
      description: 'Professional photography for events, parties, corporate functions. Includes editing and digital delivery within 1 week. Prints available at additional cost.',
      serviceType: ServiceType.CONSULTATION,
      category: 'Photography',
      pricingType: PricingType.PER_HOUR,
      basePrice: 300.0,
      currency: 'MYR',
      location: 'KL & Selangor',
      status: ServiceStatus.ACTIVE,
      images: ['https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=600&h=400&fit=crop'],
    },
    {
      providerId: kevin?.id || users[0].id,
      title: 'Portrait Photography Session',
      description: 'Professional portrait session - personal branding, LinkedIn photos, or family portraits. 1-hour session, 20+ edited photos included.',
      serviceType: ServiceType.CONSULTATION,
      category: 'Photography',
      pricingType: PricingType.PER_PERSON,
      basePrice: 250.0,
      currency: 'MYR',
      maxGuests: 5,
      location: 'Studio or Outdoor',
      status: ServiceStatus.ACTIVE,
      images: ['https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=600&h=400&fit=crop'],
    },
    {
      providerId: sophia?.id || users[0].id,
      title: 'Wellness Coaching',
      description: 'Holistic wellness coaching covering nutrition, fitness, mindfulness, and lifestyle. Personalized plans and ongoing support via WhatsApp.',
      serviceType: ServiceType.CONSULTATION,
      category: 'Wellness',
      pricingType: PricingType.PER_HOUR,
      basePrice: 150.0,
      currency: 'MYR',
      location: 'Online/TTDI',
      status: ServiceStatus.ACTIVE,
      images: ['https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&h=400&fit=crop'],
    },
    {
      providerId: nina?.id || users[0].id,
      title: 'Music Lessons - Guitar & Vocals',
      description: 'Private music lessons for guitar (acoustic/electric) and vocal training. Beginner to intermediate levels. Theory and practical included.',
      serviceType: ServiceType.CONSULTATION,
      category: 'Music Education',
      pricingType: PricingType.PER_HOUR,
      basePrice: 100.0,
      currency: 'MYR',
      location: 'Damansara/Online',
      status: ServiceStatus.ACTIVE,
      images: ['https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600&h=400&fit=crop'],
    },
  ];

  for (const service of services) {
    await prisma.service.create({ data: service });
  }
  
  console.log(`✅ ${services.length} enhanced services created`);
}

export async function seedMarketplaceListings() {
  console.log('\n🛍️  Creating enhanced marketplace listings...');
  
  const users = await prisma.user.findMany({
    where: {
      email: {
        in: [
          'maya.food@berseapp.com',
          'david.tech@berseapp.com',
          'zara.art@berseapp.com',
          'ryan.student@berseapp.com',
          'emma.expat@berseapp.com',
          'mike.gamer@berseapp.com',
          'kevin.photo@berseapp.com',
          'alex.travel@berseapp.com',
        ],
      },
    },
  });
  
  if (users.length === 0) {
    console.log('⚠️  Required users not found. Skipping marketplace listings seed.');
    return;
  }

  const [maya, david, zara, ryan, emma, mike, kevin, alex] = users;

  const listings = [
    {
      userId: kevin?.id || users[0].id,
      title: 'Canon EOS M50 Camera',
      description: 'Mirrorless camera in excellent condition. Only 5000 shutter count. Includes 15-45mm kit lens, battery, charger, and original box. Perfect for content creators!',
      category: 'Photography',
      price: 2200.0,
      currency: 'MYR',
      quantity: 1,
      location: 'Petaling Jaya',
      status: ListingStatus.ACTIVE,
      images: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&h=400&fit=crop'],
    },
    {
      userId: kevin?.id || users[0].id,
      title: 'Manfrotto Camera Tripod',
      description: 'Professional tripod with fluid head. Great for video and photography. Lightweight aluminum construction. Very stable.',
      category: 'Photography',
      price: 380.0,
      currency: 'MYR',
      quantity: 1,
      location: 'Petaling Jaya',
      status: ListingStatus.ACTIVE,
      images: ['https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?w=600&h=400&fit=crop'],
    },
    {
      userId: ryan?.id || users[0].id,
      title: 'MacBook Pro 13" 2019',
      description: 'MacBook Pro 13" with Touch Bar. 8GB RAM, 256GB SSD. Battery health 85%. Great for students or light work. No dents or scratches.',
      category: 'Electronics',
      price: 3500.0,
      currency: 'MYR',
      quantity: 1,
      location: 'Subang Jaya',
      status: ListingStatus.ACTIVE,
      images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=400&fit=crop'],
    },
    {
      userId: mike?.id || users[0].id,
      title: 'PlayStation 5 Controller',
      description: 'Brand new DualSense controller, never used. White color. Still in sealed box. Perfect gift!',
      category: 'Gaming',
      price: 280.0,
      currency: 'MYR',
      quantity: 2,
      location: 'Cyberjaya',
      status: ListingStatus.ACTIVE,
      images: ['https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=600&h=400&fit=crop'],
    },
    {
      userId: mike?.id || users[0].id,
      title: 'Gaming Mouse - Logitech G502',
      description: 'High-performance gaming mouse. RGB lighting, adjustable DPI, programmable buttons. Lightly used for 3 months.',
      category: 'Gaming',
      price: 180.0,
      currency: 'MYR',
      quantity: 1,
      location: 'Cyberjaya',
      status: ListingStatus.ACTIVE,
      images: ['https://images.unsplash.com/photo-1527814050087-3793815479db?w=600&h=400&fit=crop'],
    },
    {
      userId: david?.id || users[0].id,
      title: 'iPad Air 4th Gen 64GB',
      description: 'iPad Air in sky blue. WiFi only, 64GB storage. Like new condition with screen protector applied. Includes original charger.',
      category: 'Electronics',
      price: 1800.0,
      currency: 'MYR',
      quantity: 1,
      location: 'Mont Kiara',
      status: ListingStatus.ACTIVE,
      images: ['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&h=400&fit=crop'],
    },
    {
      userId: alex?.id || users[0].id,
      title: 'Osprey Backpack 40L',
      description: 'Premium travel backpack perfect for digital nomads. Laptop compartment, hip belt, rain cover included. Used on 5 trips, excellent condition.',
      category: 'Travel Gear',
      price: 450.0,
      currency: 'MYR',
      quantity: 1,
      location: 'KLCC',
      status: ListingStatus.ACTIVE,
      images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=400&fit=crop'],
    },
    {
      userId: alex?.id || users[0].id,
      title: 'Camping Tent - 4 Person',
      description: 'Waterproof camping tent for 4 people. Easy setup, good ventilation. Used twice. Includes tent, poles, stakes, and carry bag.',
      category: 'Outdoor Equipment',
      price: 320.0,
      currency: 'MYR',
      quantity: 1,
      location: 'KLCC',
      status: ListingStatus.ACTIVE,
      images: ['https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=600&h=400&fit=crop'],
    },
    {
      userId: ryan?.id || users[0].id,
      title: 'Python Programming Books Bundle',
      description: 'Collection of 5 Python programming books: Python Crash Course, Automate Boring Stuff, Flask Web Development, Data Science Handbook, and Clean Code. All in great condition.',
      category: 'Books',
      price: 180.0,
      currency: 'MYR',
      quantity: 1,
      location: 'Subang Jaya',
      status: ListingStatus.ACTIVE,
      images: ['https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=600&h=400&fit=crop'],
    },
    {
      userId: zara?.id || users[0].id,
      title: 'Wacom Drawing Tablet',
      description: 'Wacom Intuos Pro Medium. Perfect for digital artists and designers. 8192 pressure levels, multi-touch gestures. Includes stylus and all accessories.',
      category: 'Art Supplies',
      price: 850.0,
      currency: 'MYR',
      quantity: 1,
      location: 'Bangsar',
      status: ListingStatus.ACTIVE,
      images: ['https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=600&h=400&fit=crop'],
    },
    {
      userId: zara?.id || users[0].id,
      title: 'Art Supplies Set - Premium',
      description: 'Complete art set: 48 watercolors, 36 colored pencils, 24 markers, brushes, palette, and sketchbook. Barely used, perfect for beginners.',
      category: 'Art Supplies',
      price: 220.0,
      currency: 'MYR',
      quantity: 1,
      location: 'Bangsar',
      status: ListingStatus.ACTIVE,
      images: ['https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&h=400&fit=crop'],
    },
    {
      userId: maya?.id || users[0].id,
      title: 'KitchenAid Stand Mixer',
      description: 'Professional 5-quart stand mixer in red. 10 speed settings. Includes dough hook, flat beater, and wire whip. Perfect for baking enthusiasts!',
      category: 'Kitchen Appliances',
      price: 1200.0,
      currency: 'MYR',
      quantity: 1,
      location: 'Damansara Heights',
      status: ListingStatus.ACTIVE,
      images: ['https://images.unsplash.com/photo-1589010588553-46e8e7c21788?w=600&h=400&fit=crop'],
    },
    {
      userId: emma?.id || users[0].id,
      title: 'IKEA Desk - Like New',
      description: 'Modern white desk from IKEA. 120cm x 60cm. Bought 3 months ago, moving out sale. Clean and sturdy. Assembly instructions included.',
      category: 'Furniture',
      price: 180.0,
      currency: 'MYR',
      quantity: 1,
      location: 'Taman Desa',
      status: ListingStatus.ACTIVE,
      images: ['https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=600&h=400&fit=crop'],
    },
    {
      userId: emma?.id || users[0].id,
      title: 'Yoga Mat - Premium Cork',
      description: 'Eco-friendly cork yoga mat. Non-slip surface, 5mm thick. Comes with carrying strap. Used for 6 months, excellent condition.',
      category: 'Sports Equipment',
      price: 120.0,
      currency: 'MYR',
      quantity: 1,
      location: 'Taman Desa',
      status: ListingStatus.ACTIVE,
      images: ['https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600&h=400&fit=crop'],
    },
    {
      userId: ryan?.id || users[0].id,
      title: 'Nintendo Switch Games Bundle',
      description: 'Collection of 4 Switch games: Mario Kart 8, Animal Crossing, Zelda BOTW, and Pokemon Sword. All cartridges in perfect condition with original cases.',
      category: 'Gaming',
      price: 480.0,
      currency: 'MYR',
      quantity: 1,
      location: 'Subang Jaya',
      status: ListingStatus.ACTIVE,
      images: ['https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=600&h=400&fit=crop'],
    },
  ];

  for (const listing of listings) {
    const { userId, ...listingData } = listing;
    await prisma.marketplaceListing.create({
      data: {
        ...listingData,
        user: { connect: { id: userId } },
      },
    });
  }
  
  console.log(`✅ ${listings.length} enhanced marketplace listings created`);
}

export async function seedReferrals() {
  console.log('\n🎯 Creating sample referrals...');
  
  const hostUser = await prisma.user.findUnique({ where: { email: 'host@test.com' } });
  const campaign = await prisma.referralCampaign.findFirst();
  
  if (!hostUser || !campaign) {
    console.log('⚠️  Host user or campaign not found. Skipping referrals seed.');
    return;
  }

  const referralMetadata = await prisma.userMetadata.findUnique({
    where: { userId: hostUser.id },
  });

  if (referralMetadata) {
    await prisma.referral.create({
      data: {
        referrerId: hostUser.id,
        referralCode: referralMetadata.referralCode,
        referralMethod: 'link',
        referralSource: 'social_media',
        campaignId: campaign.id,
        clickedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        signedUpAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        isActivated: false,
      },
    });

    await prisma.referralStat.upsert({
      where: { userId: hostUser.id },
      create: {
        userId: hostUser.id,
        totalReferrals: 1,
        totalClicks: 3,
        totalSignups: 1,
        totalActivated: 0,
        clickToSignupRate: 33.33,
        signupToActiveRate: 0.0,
        overallConversionRate: 0.0,
      },
      update: {},
    });
    
    console.log('✅ Sample referrals created');
  }
}

export async function seedPointHistory() {
  console.log('\n⭐ Creating point history...');
  
  const adminUser = await prisma.user.findUnique({ where: { email: 'admin@test.com' } });
  const hostUser = await prisma.user.findUnique({ where: { email: 'host@test.com' } });
  const aliceUser = await prisma.user.findUnique({ where: { email: 'alice@test.com' } });
  const bobUser = await prisma.user.findUnique({ where: { email: 'bob@test.com' } });
  
  if (!adminUser || !hostUser || !aliceUser || !bobUser) {
    console.log('⚠️  Required users not found. Skipping point history seed.');
    return;
  }

  const pointsData = [
    { userId: adminUser.id, points: 500, action: 'initial_bonus', description: 'Welcome bonus' },
    { userId: adminUser.id, points: 300, action: 'event_hosted', description: 'Hosted Tech Meetup' },
    { userId: adminUser.id, points: 200, action: 'community_created', description: 'Created Tech Talk KL community' },
    { userId: hostUser.id, points: 100, action: 'initial_bonus', description: 'Welcome bonus' },
    { userId: hostUser.id, points: 50, action: 'event_attended', description: 'Attended event' },
    { userId: hostUser.id, points: 100, action: 'profile_completed', description: 'Completed profile' },
    { userId: aliceUser.id, points: 100, action: 'initial_bonus', description: 'Welcome bonus' },
    { userId: aliceUser.id, points: 20, action: 'event_attended', description: 'Attended Food Tour' },
    { userId: bobUser.id, points: 50, action: 'initial_bonus', description: 'Welcome bonus' },
    { userId: bobUser.id, points: 35, action: 'connection_made', description: 'Made a new connection' },
  ];

  for (const point of pointsData) {
    await prisma.pointHistory.create({ data: point });
  }
  
  console.log(`✅ ${pointsData.length} point history entries created`);
}

export async function seedAllSampleData() {
  await seedConnections();
  await seedVouches();
  await seedTravelTrips();
  await seedServices();
  await seedMarketplaceListings();
  await seedReferrals();
  await seedPointHistory();
}

async function main() {
  await seedAllSampleData();
}

if (require.main === module) {
  main()
    .catch((e) => {
      console.error('❌ Sample data seed failed:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
