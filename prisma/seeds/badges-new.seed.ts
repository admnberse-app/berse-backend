import { PrismaClient, BadgeType } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seed data for new badge types
 * Badge points calculated based on activity points:
 * - Register: 5 pts | Attend event: 10 pts | Host event: 15 pts
 * - Get vouch: 8 pts | Give trust moment: 2 pts | Receive positive: 1 pt
 * - Complete profile section: 2 pts | Join community: 3 pts | Refer friend: 3 pts
 */
const newBadges = [
  {
    type: BadgeType.CONNECTOR,
    name: '🤝 Connector',
    description: "You're good at connecting people",
    criteria: 'Connect 10+ friends on Berse App',
    category: 'Social',
    tier: 'Bronze',
    points: 30, // ~10 connections would earn indirectly through vouches/trust moments
    requiredCount: 10,
    criteriaConfig: {
      type: 'connections_count',
      minConnections: 10,
      connectionType: 'ACCEPTED',
    },
    imageUrl: '/badges/connector.png',
    isActive: true,
  },
  {
    type: BadgeType.HOST_MASTER,
    name: '🎤 Host Master',
    description: 'You organize great events',
    criteria: 'Host 5+ events with good feedback',
    category: 'Events',
    tier: 'Silver',
    points: 75, // 5 events × 15 pts = 75 pts
    requiredCount: 5,
    criteriaConfig: {
      type: 'hosted_events',
      minEvents: 5,
      minAverageRating: 4.0,
      requireCompletedEvents: true,
    },
    imageUrl: '/badges/host-master.png',
    isActive: true,
  },
  {
    type: BadgeType.EXPLORER,
    name: '🌍 Explorer',
    description: 'You love to travel',
    criteria: 'Visit and log 5+ countries in Travel Logbook',
    category: 'Travel',
    tier: 'Bronze',
    points: 50, // Achievement-based, roughly 5 events attended (50 pts)
    requiredCount: 5,
    criteriaConfig: {
      type: 'travel_countries',
      minCountries: 5,
      requiresLogbook: true,
    },
    imageUrl: '/badges/explorer.png',
    isActive: true,
  },
  {
    type: BadgeType.TRUSTED_MEMBER,
    name: '💎 Trusted Member',
    description: 'Highly trustworthy person',
    criteria: 'Reach 80+ trust score',
    category: 'Trust',
    tier: 'Gold',
    points: 100, // High achievement, reflects significant trust-building activity
    requiredCount: 80,
    criteriaConfig: {
      type: 'trust_score',
      minScore: 80,
      includesVouches: true,
      includesReviews: true,
      includesVerifications: true,
    },
    imageUrl: '/badges/trusted-member.png',
    isActive: true,
  },
  {
    type: BadgeType.COMMUNITY_BUILDER,
    name: '👥 Community Builder',
    description: 'Community leader',
    criteria: 'Create or help manage an active community',
    category: 'Community',
    tier: 'Silver',
    points: 60, // Joining 20 communities = 60 pts, managing is more valuable
    requiredCount: 1,
    criteriaConfig: {
      type: 'community_management',
      options: [
        {
          action: 'created_community',
          minMembers: 10,
        },
        {
          action: 'moderator_role',
          minActiveDays: 30,
        },
      ],
    },
    imageUrl: '/badges/community-builder.png',
    isActive: true,
  },
  {
    type: BadgeType.SERVICE_STAR,
    name: '⭐ Service Star',
    description: 'Great service provider',
    criteria: 'Get 4.5+ star rating across 20+ services',
    category: 'Service',
    tier: 'Gold',
    points: 120, // ~20 events with positive reviews (20 × ~5 pts avg)
    requiredCount: 20,
    criteriaConfig: {
      type: 'service_rating',
      minServices: 20,
      minAverageRating: 4.5,
      serviceTypes: ['marketplace', 'events', 'homesurf', 'guide'],
    },
    imageUrl: '/badges/service-star.png',
    isActive: true,
  },
  {
    type: BadgeType.EARLY_ADOPTER,
    name: '🚀 Early Adopter',
    description: 'You were here early!',
    criteria: 'Join Berse in the first 1,000 users',
    category: 'Achievement',
    tier: 'Platinum',
    points: 150, // Prestigious achievement, one-time reward
    requiredCount: 1,
    criteriaConfig: {
      type: 'user_registration',
      maxUserNumber: 1000,
      registrationBefore: '2026-12-31T23:59:59Z',
    },
    imageUrl: '/badges/early-adopter.png',
    isActive: true,
  },
  {
    type: BadgeType.GLOBAL_CITIZEN,
    name: '🌏 Global Citizen',
    description: 'Worldwide network',
    criteria: 'Have connections on 5+ continents',
    category: 'Travel',
    tier: 'Platinum',
    points: 200, // Rare achievement requiring extensive networking and travel
    requiredCount: 5,
    criteriaConfig: {
      type: 'connections_geography',
      minContinents: 5,
      continents: [
        'Africa',
        'Antarctica',
        'Asia',
        'Europe',
        'North America',
        'Oceania',
        'South America',
      ],
      requiresLocationData: true,
    },
    imageUrl: '/badges/global-citizen.png',
    isActive: true,
  },
  {
    type: BadgeType.EVENT_ENTHUSIAST,
    name: '🎉 Event Enthusiast',
    description: 'You love attending events',
    criteria: 'Attend 20+ events',
    category: 'Events',
    tier: 'Gold',
    points: 200, // 20 events × 10 pts = 200 pts
    requiredCount: 20,
    criteriaConfig: {
      type: 'attended_events',
      minEvents: 20,
      requireCompletedEvents: true,
    },
    imageUrl: '/badges/event-enthusiast.png',
    isActive: true,
  },
  {
    type: BadgeType.REFERRAL_CHAMPION,
    name: '📢 Referral Champion',
    description: 'You bring amazing people',
    criteria: 'Refer 10+ friends who join',
    category: 'Social',
    tier: 'Silver',
    points: 30, // 10 referrals × 3 pts = 30 pts
    requiredCount: 10,
    criteriaConfig: {
      type: 'referrals',
      minReferrals: 10,
      requireSuccessfulSignups: true,
    },
    imageUrl: '/badges/referral-champion.png',
    isActive: true,
  },
];

async function seedNewBadges() {
  console.log('🏆 Seeding new badges...');

  try {
    for (const badge of newBadges) {
      const existing = await prisma.badge.findUnique({
        where: { type: badge.type },
      });

      if (existing) {
        console.log(`⚠️  Badge ${badge.name} already exists, updating...`);
        await prisma.badge.update({
          where: { type: badge.type },
          data: badge,
        });
      } else {
        console.log(`✨ Creating badge: ${badge.name}`);
        await prisma.badge.create({
          data: badge,
        });
      }
    }

    console.log('✅ Successfully seeded all new badges!');
    console.log(`📊 Total badges created/updated: ${newBadges.length}`);

    // Display summary
    console.log('\n📋 Badge Summary:');
    newBadges.forEach((badge) => {
      console.log(`   ${badge.name} - ${badge.category} (${badge.tier})`);
    });
  } catch (error) {
    console.error('❌ Error seeding badges:', error);
    throw error;
  }
}

// Run the seed function
seedNewBadges()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

export { newBadges };
