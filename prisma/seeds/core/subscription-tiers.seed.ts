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
      maxEventsPerMonth: -1, // Unlimited viewing, joining limited by trust
      maxConnections: 100,
      profileBoost: false,
      customBadges: false,
      prioritySupport: false,
      analytics: false,

      // Event access (trust-gated)
      eventAccess: {
        canView: true,
        canJoin: true, // Trust-gated: Starter can join 3/month, Trusted 5/month, Scout 8/month
        canCreate: false,
        canHost: false,
        maxEventsPerMonth: -1,
        maxHostedPerMonth: 0,
        canCreatePaidEvents: false,
      },

      // Marketplace (view only)
      marketplaceAccess: {
        canBuy: false,
        canSell: false,
        maxTransactionAmount: 0,
        maxListings: 0,
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
        maxCommunities: 2,
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
    description: 'Active Participation & Commerce - Travel & stays, marketplace, create events',
    price: 30.0,
    currency: 'MYR',
    billingCycle: 'MONTHLY',
    features: {
      // Basic features
      maxEventsPerMonth: -1,
      maxConnections: 500,
      profileBoost: true,
      customBadges: false,
      prioritySupport: false,
      analytics: false,

      // Event access (trust-gated)
      eventAccess: {
        canView: true,
        canJoin: true,
        canCreate: true, // Trust-gated: Trusted 2/month, Scout 5/month, Leader unlimited
        canHost: true,   // Trust-gated: Scout 2/month, Leader unlimited
        maxEventsPerMonth: -1,
        maxHostedPerMonth: -1, // Limited by trust level
        canCreatePaidEvents: false,
      },

      // Marketplace (trust-gated)
      marketplaceAccess: {
        canBuy: true,    // Trust-gated: Starter max RM100, Trusted unlimited
        canSell: true,   // Trust-gated: Trusted 5 listings, Scout 15, Leader unlimited
        maxTransactionAmount: -1, // Limited by trust
        maxListings: -1,          // Limited by trust
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
        canCreate: true, // Trust-gated: Trusted+
        canModerate: true, // Trust-gated: Scout+
        canAdmin: false,   // Trust-gated: Leader only
        maxCommunities: 5,
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
  {
    tierCode: 'PREMIUM',
    tierName: 'Premium',
    description: 'Professional Services & Leadership - Service matching, mentorship, priority everything',
    price: 50.0,
    currency: 'MYR',
    billingCycle: 'MONTHLY',
    features: {
      // Basic features
      maxEventsPerMonth: -1,
      maxConnections: -1, // Unlimited
      profileBoost: true,
      customBadges: true,
      prioritySupport: true,
      analytics: true,

      // Event access (trust-gated)
      eventAccess: {
        canView: true,
        canJoin: true,
        canCreate: true,
        canHost: true,
        maxEventsPerMonth: -1,
        maxHostedPerMonth: -1,
        canCreatePaidEvents: true, // Trust-gated: Scout+
      },

      // Marketplace (trust-gated)
      marketplaceAccess: {
        canBuy: true,
        canSell: true,
        maxTransactionAmount: -1,
        maxListings: -1,
      },

      // Travel (trust-gated)
      travelAccess: {
        canJoin: true,
        canHost: true,
        canHostHomestay: true,
        canBeHomestayGuest: true,
      },

      // Services (trust-gated)
      serviceAccess: {
        canUseAsClient: true,    // Trust-gated: Trusted+
        canOfferServices: true,  // Trust-gated: Scout+
        maxActiveServices: -1,
      },

      // Mentorship (trust-gated)
      mentorshipAccess: {
        canSeek: true,   // Trust-gated: Trusted+
        canMentor: true, // Trust-gated: Leader only
        maxMentees: -1,
        maxMentors: 3,
      },

      // Community
      communityAccess: {
        canJoin: true,
        canCreate: true,
        canModerate: true,
        canAdmin: true, // Trust-gated: Leader only
        maxCommunities: -1,
      },

      // Advanced features (trust-gated)
      fundraisingAccess: true,      // Trust-gated: Leader only
      platformAmbassador: true,     // Trust-gated: Leader only
      revenueSharing: true,         // Trust-gated: Leader only
      customEventPages: true,
    },
    displayOrder: 3,
    isActive: true,
    isPublic: true,
    trialDays: 14,
  },
];

export async function seedSubscriptionTiers() {
  console.log('\n💎 Seeding subscription tiers...');
  
  await prisma.subscriptionTier.deleteMany({});
  
  for (const tier of tiers) {
    await prisma.subscriptionTier.create({ data: tier });
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
