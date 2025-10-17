require('dotenv').config({ path: require('path').join(__dirname, '../../../.env') });

import { PrismaClient, ConnectionStatus, VouchType, VouchStatus, ServiceType, ServiceStatus, PricingType, ListingStatus } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedConnections() {
  console.log('\n🤝 Creating user connections...');
  
  const adminUser = await prisma.user.findUnique({ where: { email: 'admin@test.com' } });
  const hostUser = await prisma.user.findUnique({ where: { email: 'host@test.com' } });
  const aliceUser = await prisma.user.findUnique({ where: { email: 'alice@test.com' } });
  const bobUser = await prisma.user.findUnique({ where: { email: 'bob@test.com' } });
  
  if (!adminUser || !hostUser || !aliceUser || !bobUser) {
    console.log('⚠️  Required users not found. Skipping connections seed.');
    return;
  }

  const connections = [
    {
      initiatorId: adminUser.id,
      receiverId: hostUser.id,
      status: ConnectionStatus.ACCEPTED,
      relationshipCategory: 'professional',
      trustStrength: 85.0,
      connectedAt: new Date(),
    },
    {
      initiatorId: hostUser.id,
      receiverId: aliceUser.id,
      status: ConnectionStatus.ACCEPTED,
      relationshipCategory: 'friend',
      trustStrength: 70.0,
      connectedAt: new Date(),
      howWeMet: 'Met at a food tour event',
    },
    {
      initiatorId: aliceUser.id,
      receiverId: bobUser.id,
      status: ConnectionStatus.ACCEPTED,
      relationshipCategory: 'social',
      trustStrength: 60.0,
      connectedAt: new Date(),
    },
    {
      initiatorId: bobUser.id,
      receiverId: adminUser.id,
      status: ConnectionStatus.PENDING,
      relationshipCategory: 'professional',
    },
  ];

  for (const connection of connections) {
    await prisma.userConnection.create({
      data: connection,
    });
  }
  
  console.log(`✅ ${connections.length} user connections created`);
}

export async function seedVouches() {
  console.log('\n✅ Creating sample vouches...');
  
  const adminUser = await prisma.user.findUnique({ where: { email: 'admin@test.com' } });
  const hostUser = await prisma.user.findUnique({ where: { email: 'host@test.com' } });
  const aliceUser = await prisma.user.findUnique({ where: { email: 'alice@test.com' } });
  
  if (!adminUser || !hostUser || !aliceUser) {
    console.log('⚠️  Required users not found. Skipping vouches seed.');
    return;
  }

  const vouches = [
    {
      voucherId: adminUser.id,
      voucheeId: hostUser.id,
      vouchType: VouchType.PRIMARY,
      status: VouchStatus.ACTIVE,
      message: 'Excellent event host, highly trusted member of our community.',
      approvedAt: new Date(),
      activatedAt: new Date(),
      trustImpact: 30.0,
    },
    {
      voucherId: hostUser.id,
      voucheeId: aliceUser.id,
      vouchType: VouchType.SECONDARY,
      status: VouchStatus.ACTIVE,
      message: 'Great person to connect with, very friendly and reliable.',
      approvedAt: new Date(),
      activatedAt: new Date(),
      trustImpact: 20.0,
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
  console.log('\n🎯 Creating sample services...');
  
  const hostUser = await prisma.user.findUnique({ where: { email: 'host@test.com' } });
  
  if (!hostUser) {
    console.log('⚠️  Host user not found. Skipping services seed.');
    return;
  }

  const services = [
    {
      providerId: hostUser.id,
      title: 'KL City Walking Tour',
      description: 'Personalized walking tour of Kuala Lumpur\'s historic landmarks and hidden gems. Perfect for first-time visitors!',
      serviceType: ServiceType.GUIDING,
      category: 'City Tours',
      pricingType: PricingType.PER_PERSON,
      basePrice: 120.0,
      currency: 'MYR',
      maxGuests: 8,
      location: 'Kuala Lumpur',
      status: ServiceStatus.ACTIVE,
      images: [],
    },
    {
      providerId: hostUser.id,
      title: 'Event Planning & Hosting',
      description: 'Professional event planning services for community gatherings, corporate events, and private parties.',
      serviceType: ServiceType.CONSULTATION,
      category: 'Event Planning',
      pricingType: PricingType.PER_HOUR,
      basePrice: 150.0,
      currency: 'MYR',
      location: 'Kuala Lumpur & Selangor',
      status: ServiceStatus.ACTIVE,
    },
  ];

  for (const service of services) {
    await prisma.service.create({ data: service });
  }
  
  console.log(`✅ ${services.length} sample services created`);
}

export async function seedMarketplaceListings() {
  console.log('\n🛍️  Creating sample marketplace listings...');
  
  const aliceUser = await prisma.user.findUnique({ where: { email: 'alice@test.com' } });
  const bobUser = await prisma.user.findUnique({ where: { email: 'bob@test.com' } });
  
  if (!aliceUser || !bobUser) {
    console.log('⚠️  Required users not found. Skipping marketplace listings seed.');
    return;
  }

  const listings = [
    {
      userId: aliceUser.id,
      title: 'Vintage Polaroid Camera',
      description: 'Vintage Polaroid 600 camera in excellent condition. Comes with camera strap and manual.',
      category: 'Photography',
      price: 280.0,
      currency: 'MYR',
      quantity: 1,
      location: 'Petaling Jaya',
      status: ListingStatus.ACTIVE,
    },
    {
      userId: bobUser.id,
      title: 'Badminton Racket - Yonex',
      description: 'Slightly used Yonex badminton racket. Perfect for intermediate players.',
      category: 'Sports Equipment',
      price: 150.0,
      currency: 'MYR',
      quantity: 1,
      location: 'Shah Alam',
      status: ListingStatus.ACTIVE,
    },
    {
      userId: aliceUser.id,
      title: 'Travel Backpack 40L',
      description: 'Durable travel backpack with laptop compartment. Used for 2 trips, still in great condition.',
      category: 'Travel Gear',
      price: 200.0,
      currency: 'MYR',
      quantity: 1,
      location: 'Petaling Jaya',
      status: ListingStatus.ACTIVE,
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
  
  console.log(`✅ ${listings.length} sample marketplace listings created`);
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
