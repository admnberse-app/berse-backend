import { PrismaClient, BadgeType } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seed data for new badge types
 * These badges encourage engagement, travel, hosting, trust, and community building
 */
const newBadges = [
  {
    type: BadgeType.EXPLORER,
    name: '🌍 Explorer',
    description: 'You love to travel',
    criteria: 'Visit and log 5+ countries in Travel Logbook',
    category: 'Travel',
    tier: 'Bronze',
    points: 150,
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
    type: BadgeType.CONNECTOR,
    name: '🤝 Connector',
    description: "You're good at connecting people",
    criteria: 'Connect 10+ friends on Berse App',
    category: 'Social',
    tier: 'Bronze',
    points: 100,
    requiredCount: 10,
    criteriaConfig: {
      type: 'connections_count',
      minConnections: 10,
      connectionType: 'ACCEPTED', // Only count accepted connections
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
    points: 200,
    requiredCount: 5,
    criteriaConfig: {
      type: 'hosted_events',
      minEvents: 5,
      minAverageRating: 4.0, // Events must have 4.0+ average rating
      requireCompletedEvents: true,
    },
    imageUrl: '/badges/host-master.png',
    isActive: true,
  },
  {
    type: BadgeType.TRUSTED_MEMBER,
    name: '💎 Trusted Member',
    description: 'Highly trustworthy person',
    criteria: 'Reach 80+ trust score',
    category: 'Trust',
    tier: 'Gold',
    points: 300,
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
    points: 250,
    requiredCount: 1,
    criteriaConfig: {
      type: 'community_management',
      options: [
        {
          action: 'created_community',
          minMembers: 10, // Community must have at least 10 members
        },
        {
          action: 'moderator_role',
          minActiveDays: 30, // Active moderator for 30+ days
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
    points: 350,
    requiredCount: 20,
    criteriaConfig: {
      type: 'service_rating',
      minServices: 20, // At least 20 completed services
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
    points: 500,
    requiredCount: 1,
    criteriaConfig: {
      type: 'user_registration',
      maxUserNumber: 1000, // User ID must be within first 1000
      registrationBefore: '2026-12-31T23:59:59Z', // Adjust based on launch date
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
    points: 400,
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
