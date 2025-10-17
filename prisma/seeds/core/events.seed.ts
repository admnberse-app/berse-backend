require('dotenv').config({ path: require('path').join(__dirname, '../../../.env') });

import { PrismaClient, EventType, EventStatus, EventHostType } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedEvents() {
  console.log('\n📅 Creating sample events...');
  
  const adminUser = await prisma.user.findUnique({ where: { email: 'admin@test.com' } });
  const hostUser = await prisma.user.findUnique({ where: { email: 'host@test.com' } });
  
  if (!adminUser || !hostUser) {
    console.log('⚠️  Required users not found. Skipping events seed.');
    return [];
  }

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

  const createdEvents = [];
  for (const event of events) {
    const created = await prisma.event.create({
      data: event,
    });
    createdEvents.push(created);
  }
  
  console.log(`✅ ${createdEvents.length} sample events created`);
  return createdEvents;
}

async function main() {
  await seedEvents();
}

if (require.main === module) {
  main()
    .catch((e) => {
      console.error('❌ Event seed failed:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
