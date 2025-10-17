// Load environment from parent directory
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

import { PrismaClient, BadgeType, UserRole, UserStatus, TransactionType, EventType, EventStatus, EventHostType, ConnectionStatus, VouchType, VouchStatus, ServiceType, ServiceStatus, PricingType, ListingStatus } from '@prisma/client';
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

  // ===================================
  // 1. CREATE BADGES
  // ===================================
  console.log('\n📛 Seeding badges...');
  for (const badge of badges) {
    await prisma.badge.upsert({
      where: { type: badge.type },
      update: {},
      create: badge,
    });
  }
  console.log('✅ Badges seeded successfully');

  // ===================================
  // 2. CREATE SAMPLE REWARDS
  // ===================================
  console.log('\n🎁 Seeding rewards...');
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
    {
      title: 'Grab RM10 Voucher',
      description: 'Get RM10 off your next ride',
      pointsRequired: 20,
      category: 'Transportation',
      partner: 'Grab',
      quantity: 75,
    },
  ];

  await prisma.reward.deleteMany({});
  for (const reward of rewards) {
    await prisma.reward.create({ data: reward });
  }
  console.log('✅ Sample rewards created');

  // ===================================
  // 3. CREATE VOUCH CONFIGURATION
  // ===================================
  console.log('\n🤝 Seeding vouch configuration...');
  await prisma.vouchConfig.deleteMany({});
  await prisma.vouchConfig.create({
    data: {
      maxPrimaryVouches: 1,
      maxSecondaryVouches: 3,
      maxCommunityVouches: 2,
      primaryVouchWeight: 30.0,
      secondaryVouchWeight: 30.0,
      communityVouchWeight: 40.0,
      trustMomentsWeight: 30.0,
      activityWeight: 30.0,
      cooldownDays: 30,
      minTrustRequired: 50.0,
      autoVouchMinEvents: 5,
      autoVouchMinMemberDays: 90,
      autoVouchRequireZeroNegativity: true,
      reconnectionCooldownDays: 30,
      effectiveFrom: new Date(),
    },
  });
  console.log('✅ Vouch configuration created');

  // ===================================
  // 4. CREATE SUBSCRIPTION TIERS
  // ===================================
  console.log('\n💎 Seeding subscription tiers...');
  await prisma.subscriptionTier.deleteMany({});
  
  const tiers = [
    {
      tierCode: 'FREE',
      tierName: 'Free',
      description: 'Basic access to BerseMuka platform',
      price: 0.0,
      currency: 'MYR',
      billingCycle: 'MONTHLY',
      features: {
        maxEventsPerMonth: 5,
        canCreateEvents: false,
        canHostEvents: false,
        maxConnections: 50,
        profileBoost: false,
        customBadges: false,
        prioritySupport: false,
      },
      displayOrder: 1,
      isActive: true,
      isPublic: true,
      trialDays: 0,
    },
    {
      tierCode: 'BASIC',
      tierName: 'Basic',
      description: 'For active community members',
      price: 19.90,
      currency: 'MYR',
      billingCycle: 'MONTHLY',
      features: {
        maxEventsPerMonth: 20,
        canCreateEvents: true,
        canHostEvents: false,
        maxConnections: 200,
        profileBoost: true,
        customBadges: false,
        prioritySupport: false,
      },
      displayOrder: 2,
      isActive: true,
      isPublic: true,
      trialDays: 7,
    },
    {
      tierCode: 'PREMIUM',
      tierName: 'Premium',
      description: 'For event hosts and community leaders',
      price: 49.90,
      currency: 'MYR',
      billingCycle: 'MONTHLY',
      features: {
        maxEventsPerMonth: -1,
        canCreateEvents: true,
        canHostEvents: true,
        maxConnections: -1,
        profileBoost: true,
        customBadges: true,
        prioritySupport: true,
        analytics: true,
        customEventPages: true,
      },
      displayOrder: 3,
      isActive: true,
      isPublic: true,
      trialDays: 14,
    },
  ];

  for (const tier of tiers) {
    await prisma.subscriptionTier.create({ data: tier });
  }
  console.log('✅ Subscription tiers created');

  // ===================================
  // 5. CREATE PAYMENT PROVIDER
  // ===================================
  console.log('\n💳 Seeding payment provider...');
  await prisma.paymentProvider.deleteMany({});
  
  await prisma.paymentProvider.create({
    data: {
      providerCode: 'XENDIT',
      providerName: 'Xendit',
      providerType: 'aggregator',
      supportedCountries: ['MY', 'ID', 'PH', 'SG', 'TH', 'VN'],
      supportedCurrencies: ['MYR', 'IDR', 'PHP', 'SGD', 'THB', 'VND'],
      isActive: true,
      isDefault: true,
      priorityOrder: 1,
      configuration: {
        apiVersion: 'v2',
        publicKey: process.env.XENDIT_PUBLIC_KEY || '',
        secretKey: process.env.XENDIT_SECRET_KEY || '',
        webhookVerificationToken: process.env.XENDIT_WEBHOOK_TOKEN || '',
        callbackUrl: process.env.XENDIT_CALLBACK_URL || '',
      },
      feeStructure: {
        percentageFee: 2.9,
        fixedFee: 0.50,
        currency: 'MYR',
        note: 'Varies by payment method (cards, e-wallets, bank transfers)',
      },
      capabilities: {
        supportsRefunds: true,
        supportsPartialRefunds: true,
        supportsRecurring: true,
        supportsPayouts: true,
        supportsEwallets: true,
        supportsVirtualAccounts: true,
        supportsBankTransfer: true,
        supportsQRPayments: true,
        paymentMethods: ['cards', 'ewallet', 'virtual_account', 'over_the_counter', 'direct_debit'],
      },
    },
  });
  console.log('✅ Payment provider (Xendit) created');

  // ===================================
  // 6. CREATE PLATFORM FEE CONFIGS
  // ===================================
  console.log('\n💰 Seeding platform fee configurations...');
  await prisma.platformFeeConfig.deleteMany({});
  
  const feeConfigs = [
    {
      configName: 'Event Ticket Fee',
      transactionType: TransactionType.EVENT_TICKET,
      feePercentage: 10.0,
      feeFixed: 1.0,
      minFee: 1.0,
      maxFee: 50.0,
      currency: 'MYR',
      recipientType: 'platform',
      isActive: true,
      priority: 1,
      description: 'Platform fee for event ticket sales',
    },
    {
      configName: 'Marketplace Fee',
      transactionType: TransactionType.MARKETPLACE_ORDER,
      feePercentage: 5.0,
      feeFixed: 0.5,
      minFee: 0.5,
      currency: 'MYR',
      recipientType: 'platform',
      isActive: true,
      priority: 1,
      description: 'Platform fee for marketplace transactions',
    },
    {
      configName: 'Service Booking Fee',
      transactionType: TransactionType.SERVICE_BOOKING,
      feePercentage: 15.0,
      feeFixed: 2.0,
      minFee: 2.0,
      currency: 'MYR',
      recipientType: 'platform',
      isActive: true,
      priority: 1,
      description: 'Platform fee for service bookings',
    },
    {
      configName: 'Subscription Fee',
      transactionType: TransactionType.SUBSCRIPTION,
      feePercentage: 0.0,
      feeFixed: 0.0,
      currency: 'MYR',
      recipientType: 'platform',
      isActive: true,
      priority: 1,
      description: 'No additional fee for subscriptions',
    },
  ];

  for (const config of feeConfigs) {
    await prisma.platformFeeConfig.create({ data: config });
  }
  console.log('✅ Platform fee configurations created');

  // ===================================
  // 7. CREATE REFERRAL CAMPAIGN
  // ===================================
  console.log('\n🎯 Seeding referral campaign...');
  await prisma.referralCampaign.deleteMany({});
  
  await prisma.referralCampaign.create({
    data: {
      campaignCode: 'LAUNCH2025',
      campaignName: 'BerseMuka Launch Campaign 2025',
      description: 'Special rewards for early adopters and referrers',
      referrerRewardType: 'points',
      referrerRewardAmount: 100.0,
      refereeRewardType: 'points',
      refereeRewardAmount: 50.0,
      bonusRewards: {
        milestones: [
          { count: 5, reward: 'points', amount: 500, description: '5 referrals bonus' },
          { count: 10, reward: 'subscription_discount', amount: 50, description: '50% off premium for 1 month' },
          { count: 25, reward: 'points', amount: 2500, description: '25 referrals mega bonus' },
        ],
      },
      activationCriteria: {
        requiresProfileCompletion: true,
        requiresEmailVerification: true,
        minimumDaysActive: 7,
        requiresFirstEvent: false,
      },
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-12-31'),
      maxPerUser: 50,
      targetCountries: ['MY', 'SG'],
      isActive: true,
      isPaused: false,
    },
  });
  console.log('✅ Referral campaign created');

  // ===================================
  // 8. CREATE TEST USERS
  // ===================================
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

  console.log('✅ Test users created successfully');

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

  // ===================================
  // 9. CREATE SAMPLE COMMUNITIES
  // ===================================
  console.log('\n🏘️  Creating sample communities...');
  
  const adminUser = createdUsers.find(u => u.email === 'admin@test.com');
  const hostUser = createdUsers.find(u => u.email === 'host@test.com');
  const aliceUser = createdUsers.find(u => u.email === 'alice@test.com');
  const bobUser = createdUsers.find(u => u.email === 'bob@test.com');
  
  if (adminUser && hostUser) {
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
    console.log('✅ Sample communities created');
  }

  // ===================================
  // 10. CREATE SAMPLE EVENTS
  // ===================================
  console.log('\n📅 Creating sample events...');
  
  if (adminUser && hostUser) {
    const communities = await prisma.community.findMany();
    const foodiesCommunity = communities.find(c => c.name === 'KL Foodies');
    const sportsCommunity = communities.find(c => c.name === 'Sports & Fitness');
    
    const events = [
      {
        title: 'Weekend Badminton Session',
        description: 'Friendly badminton games at KLCC Sports Complex. All skill levels welcome!',
        type: EventType.SPORTS,
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
        location: 'KLCC Sports Complex',
        mapLink: 'https://maps.google.com/?q=KLCC+Sports+Complex',
        maxAttendees: 20,
        hostId: hostUser.id,
        communityId: sportsCommunity?.id,
        isFree: true,
        status: EventStatus.PUBLISHED,
        hostType: EventHostType.COMMUNITY,
      },
      {
        title: 'Coffee Tasting Workshop',
        description: 'Learn about different coffee brewing methods and taste specialty beans from around the world.',
        type: EventType.CAFE_MEETUP,
        date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        location: 'Artisan Coffee Lab, Bangsar',
        maxAttendees: 15,
        hostId: hostUser.id,
        isFree: false,
        price: 45.0,
        currency: 'MYR',
        status: EventStatus.PUBLISHED,
        hostType: EventHostType.PERSONAL,
      },
      {
        title: 'Tech Meetup: AI & Machine Learning',
        description: 'Monthly tech talk featuring speakers from local startups. Networking session included.',
        type: EventType.ILM,
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        location: 'WORQ Coworking, TTDI',
        mapLink: 'https://maps.google.com/?q=WORQ+TTDI',
        maxAttendees: 50,
        hostId: adminUser.id,
        isFree: true,
        status: EventStatus.PUBLISHED,
        hostType: EventHostType.PERSONAL,
      },
      {
        title: 'Food Tour: Hidden Gems of Chinatown',
        description: 'Discover the best local food spots in KL Chinatown with our expert guide!',
        type: EventType.SOCIAL,
        date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        location: 'Petaling Street, KL',
        mapLink: 'https://maps.google.com/?q=Petaling+Street+KL',
        maxAttendees: 12,
        hostId: hostUser.id,
        communityId: foodiesCommunity?.id,
        isFree: false,
        price: 60.0,
        currency: 'MYR',
        status: EventStatus.PUBLISHED,
        hostType: EventHostType.COMMUNITY,
      },
      {
        title: 'Beach Cleanup Volunteer Day',
        description: 'Join us for a morning of beach cleanup at Port Dickson. Make a positive impact!',
        type: EventType.VOLUNTEER,
        date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        location: 'Port Dickson Beach',
        mapLink: 'https://maps.google.com/?q=Port+Dickson+Beach',
        maxAttendees: 30,
        hostId: adminUser.id,
        isFree: true,
        status: EventStatus.PUBLISHED,
        hostType: EventHostType.PERSONAL,
      },
    ];

    for (const event of events) {
      await prisma.event.create({
        data: event,
      });
    }
    console.log('✅ Sample events created');
  }

  // ===================================
  // 11. CREATE USER CONNECTIONS
  // ===================================
  console.log('\n🤝 Creating user connections...');
  
  if (createdUsers.length >= 4) {
    const connections = [
      {
        initiatorId: adminUser!.id,
        receiverId: hostUser!.id,
        status: ConnectionStatus.ACCEPTED,
        relationshipCategory: 'professional',
        trustStrength: 85.0,
        connectedAt: new Date(),
      },
      {
        initiatorId: hostUser!.id,
        receiverId: aliceUser!.id,
        status: ConnectionStatus.ACCEPTED,
        relationshipCategory: 'friend',
        trustStrength: 70.0,
        connectedAt: new Date(),
        howWeMet: 'Met at a food tour event',
      },
      {
        initiatorId: aliceUser!.id,
        receiverId: bobUser!.id,
        status: ConnectionStatus.ACCEPTED,
        relationshipCategory: 'social',
        trustStrength: 60.0,
        connectedAt: new Date(),
      },
      {
        initiatorId: bobUser!.id,
        receiverId: adminUser!.id,
        status: ConnectionStatus.PENDING,
        relationshipCategory: 'professional',
      },
    ];

    for (const connection of connections) {
      await prisma.userConnection.create({
        data: connection,
      });
    }
    console.log('✅ User connections created');
  }

  // ===================================
  // 12. CREATE SAMPLE VOUCHES
  // ===================================
  console.log('\n✅ Creating sample vouches...');
  
  if (createdUsers.length >= 3) {
    const vouches = [
      {
        voucherId: adminUser!.id,
        voucheeId: hostUser!.id,
        vouchType: VouchType.PRIMARY,
        status: VouchStatus.ACTIVE,
        message: 'Excellent event host, highly trusted member of our community.',
        approvedAt: new Date(),
        activatedAt: new Date(),
        trustImpact: 30.0,
      },
      {
        voucherId: hostUser!.id,
        voucheeId: aliceUser!.id,
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
    console.log('✅ Sample vouches created');
  }

  // ===================================
  // 13. CREATE SAMPLE TRAVEL TRIPS
  // ===================================
  console.log('\n✈️  Creating sample travel trips...');
  
  if (aliceUser) {
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
    console.log('✅ Sample travel trips created');
  }

  // ===================================
  // 14. CREATE SAMPLE SERVICES
  // ===================================
  console.log('\n🎯 Creating sample services...');
  
  if (hostUser) {
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
    console.log('✅ Sample services created');
  }

  // ===================================
  // 15. CREATE SAMPLE MARKETPLACE LISTINGS
  // ===================================
  console.log('\n🛍️  Creating sample marketplace listings...');
  
  if (aliceUser && bobUser) {
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
    console.log('✅ Sample marketplace listings created');
  }

  // ===================================
  // 16. CREATE SAMPLE REFERRALS
  // ===================================
  console.log('\n🎯 Creating sample referrals...');
  
  const campaign = await prisma.referralCampaign.findFirst();
  if (hostUser && campaign) {
    const referralMetadata = await prisma.userMetadata.findUnique({
      where: { userId: hostUser.id },
    });

    if (referralMetadata) {
      const referral = await prisma.referral.create({
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

      // Create referral stats
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
    }
    console.log('✅ Sample referrals created');
  }

  // ===================================
  // 17. CREATE POINT HISTORY
  // ===================================
  console.log('\n⭐ Creating point history...');
  
  const pointsData = [
    { userId: adminUser!.id, points: 500, action: 'initial_bonus', description: 'Welcome bonus' },
    { userId: adminUser!.id, points: 300, action: 'event_hosted', description: 'Hosted Tech Meetup' },
    { userId: adminUser!.id, points: 200, action: 'community_created', description: 'Created Tech Talk KL community' },
    { userId: hostUser!.id, points: 100, action: 'initial_bonus', description: 'Welcome bonus' },
    { userId: hostUser!.id, points: 50, action: 'event_attended', description: 'Attended event' },
    { userId: hostUser!.id, points: 100, action: 'profile_completed', description: 'Completed profile' },
    { userId: aliceUser!.id, points: 100, action: 'initial_bonus', description: 'Welcome bonus' },
    { userId: aliceUser!.id, points: 20, action: 'event_attended', description: 'Attended Food Tour' },
    { userId: bobUser!.id, points: 50, action: 'initial_bonus', description: 'Welcome bonus' },
    { userId: bobUser!.id, points: 35, action: 'connection_made', description: 'Made a new connection' },
  ];

  for (const point of pointsData) {
    await prisma.pointHistory.create({ data: point });
  }
  console.log('✅ Point history created');

  // ===================================
  // DISPLAY SUMMARY
  // ===================================
  console.log('\n' + '='.repeat(50));
  console.log('📊 SEED SUMMARY');
  console.log('='.repeat(50));

  const allUsers = await prisma.user.findMany({
    select: {
      email: true,
      fullName: true,
      role: true,
      totalPoints: true,
      trustScore: true,
      location: {
        select: { currentCity: true },
      },
      serviceProfile: {
        select: { isHostCertified: true },
      },
    },
  });

  console.log('\n📋 Created Users:');
  console.table(
    allUsers.map(u => ({
      Email: u.email,
      Name: u.fullName,
      Role: u.role,
      Points: u.totalPoints,
      Trust: u.trustScore,
      City: u.location?.currentCity || 'N/A',
      Host: u.serviceProfile?.isHostCertified ? 'Yes' : 'No',
    }))
  );

  const badgeCount = await prisma.badge.count();
  const rewardCount = await prisma.reward.count();
  const tierCount = await prisma.subscriptionTier.count();
  const communityCount = await prisma.community.count();

  console.log('\n� Statistics:');
  console.log(`   • ${allUsers.length} Users created`);
  console.log(`   • ${badgeCount} Badges available`);
  console.log(`   • ${rewardCount} Rewards available`);
  console.log(`   • ${tierCount} Subscription tiers`);
  console.log(`   • ${communityCount} Communities created`);
  console.log(`   • 1 Payment provider configured`);
  console.log(`   • 1 Referral campaign active`);

  console.log('\n🔐 Login Credentials:');
  console.log('   1. Admin    : admin@test.com / admin123');
  console.log('   2. Host     : host@test.com / password123');
  console.log('   3. User     : alice@test.com / password123');
  console.log('   4. User     : bob@test.com / password123');
  console.log('   5. Demo     : demo@test.com / password123');

  console.log('\n🎉 Seed completed successfully!');
  console.log('='.repeat(50) + '\n');
  
  // ===================================
  // OPTIONAL: RUN APP CONFIG SEED
  // ===================================
  console.log('\n💡 To seed app configuration data, run:');
  console.log('   npx ts-node prisma/seed-app-config.ts\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });