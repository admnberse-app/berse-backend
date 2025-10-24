require('dotenv').config({ path: require('path').join(__dirname, '../../../.env') });

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const tiers = [
  {
    tierCode: 'FREE',
    tierName: 'Free',
    description: 'Discover & Build Trust - Join events, view community, build your trust profile',
    price: 0.0,
    currency: 'MYR',
    billingCycle: 'MONTHLY',
    features: {
      // Basic features
      maxConnectionsPerMonth: 10, // 10 connection requests per month
      maxSwipesPerMonth: 10, // Tinder-like swipe limit
      profileBoost: false,
      customBadges: false,
      prioritySupport: false,
      analytics: false,
      canMessage: false, // Cannot send messages

      // Event access
      eventAccess: {
        canView: true,
        canJoin: true, // Unlimited event joining
        canCreate: false, // Cannot create events
        canHost: false,
        maxEventsPerMonth: -1, // Unlimited joining
        maxHostedPerMonth: 0,
        canCreatePaidEvents: false,
      },

      // Marketplace
      marketplaceAccess: {
        canBuy: true, // Can buy from marketplace
        canSell: false, // Cannot sell
        maxTransactionAmount: -1,
        maxListings: 0,
      },

      // Vouching
      vouchingLimits: {
        maxVouches: 5, // Hard cap at 5 vouches regardless of trust score
        overridesTrustScore: true,
      },

      // Points & Rewards
      pointsAccess: {
        canEarn: true,   // Can earn points
        canRedeem: false, // Cannot redeem rewards
      },

      // Travel (not available)
      travelAccess: {
        canJoin: false,
        canHost: false,
        canHostHomestay: false,
        canBeHomestayGuest: false,
      },

      // Services (not available)
      serviceAccess: {
        canUseAsClient: false,
        canOfferServices: false,
      },

      // Mentorship (not available)
      mentorshipAccess: {
        canSeek: false,
        canMentor: false,
      },

      // Community
      communityAccess: {
        canJoin: true,
        canCreate: false,
        canModerate: false,
        canAdmin: false,
        maxCommunities: 2, // Max 2 communities
      },

      // Advanced features
      fundraisingAccess: false,
      platformAmbassador: false,
      revenueSharing: false,
      customEventPages: false,
    },
    displayOrder: 1,
    isActive: true,
    isPublic: true,
    trialDays: 0,
  },
  {
    tierCode: 'BASIC',
    tierName: 'Basic',
    description: 'Active Participation & Commerce - Create events, marketplace trading, messaging',
    price: 29.99,
    currency: 'MYR',
    billingCycle: 'MONTHLY',
    features: {
      // Basic features
      maxConnectionsPerMonth: -1, // Unlimited connections
      maxSwipesPerMonth: -1, // Unlimited swipes
      profileBoost: true,
      customBadges: false,
      prioritySupport: false,
      analytics: false,
      canMessage: true, // Can send messages

      // Event access
      eventAccess: {
        canView: true,
        canJoin: true, // Unlimited joining
        canCreate: true, // Can create events
        canHost: true,
        maxEventsPerMonth: -1, // Unlimited joining
        maxHostedPerMonth: 5, // Max 5 events created per month
        canCreatePaidEvents: false,
      },

      // Marketplace
      marketplaceAccess: {
        canBuy: true, // Can buy
        canSell: true, // Can sell
        maxTransactionAmount: -1,
        maxListings: -1,
      },

      // Vouching
      vouchingLimits: {
        maxVouches: -1, // No tier cap - uses trust score brackets (max 25 based on trust)
        overridesTrustScore: false, // Trust score determines actual limit
      },

      // Points & Rewards
      pointsAccess: {
        canEarn: true,   // Can earn points
        canRedeem: true,  // Can redeem rewards
      },

      // Travel (trust-gated)
      travelAccess: {
        canJoin: true,         // Trust-gated: Trusted+
        canHost: true,         // Trust-gated: Scout+
        canHostHomestay: true, // Trust-gated: Scout+
        canBeHomestayGuest: true, // Trust-gated: Trusted+
      },

      // Services (not available in BASIC)
      serviceAccess: {
        canUseAsClient: false,
        canOfferServices: false,
      },

      // Mentorship (not available in BASIC)
      mentorshipAccess: {
        canSeek: false,
        canMentor: false,
      },

      // Community
      communityAccess: {
        canJoin: true,
        canCreate: true,
        canModerate: true,
        canAdmin: false,
        maxCommunities: -1, // Unlimited
      },

      // Advanced features
      fundraisingAccess: false,
      platformAmbassador: false,
      revenueSharing: false,
      customEventPages: false,
    },
    displayOrder: 2,
    isActive: true,
    isPublic: true,
    trialDays: 7,
  },
];

export async function seedSubscriptionTiers() {
  console.log('\n💎 Seeding subscription tiers...');
  
  for (const tier of tiers) {
    await prisma.subscriptionTier.upsert({
      where: { tierCode: tier.tierCode },
      update: tier,
      create: tier,
    });
  }
  
  const count = await prisma.subscriptionTier.count();
  console.log(`✅ ${count} subscription tiers seeded successfully`);
}

async function main() {
  await seedSubscriptionTiers();
}

if (require.main === module) {
  main()
    .catch((e) => {
      console.error('❌ Subscription tier seed failed:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
