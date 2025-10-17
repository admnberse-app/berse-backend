require('dotenv').config({ path: require('path').join(__dirname, '../../../.env') });

import { PrismaClient, BadgeType } from '@prisma/client';

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

export async function seedBadges() {
  console.log('\n📛 Seeding badges...');
  
  for (const badge of badges) {
    await prisma.badge.upsert({
      where: { type: badge.type },
      update: {},
      create: badge,
    });
  }
  
  const count = await prisma.badge.count();
  console.log(`✅ ${count} badges seeded successfully`);
}

async function main() {
  await seedBadges();
}

if (require.main === module) {
  main()
    .catch((e) => {
      console.error('❌ Badge seed failed:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
