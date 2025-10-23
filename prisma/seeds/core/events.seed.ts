require('dotenv').config({ path: require('path').join(__dirname, '../../../.env') });

import { PrismaClient, EventType, EventStatus, EventHostType } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedEvents() {
  console.log('\n📅 Creating enhanced events...');
  
  // Get users to assign as event hosts
  const users = await prisma.user.findMany({
    where: {
      email: {
        in: [
          'admin@test.com',
          'sarah.host@berseapp.com',
          'alex.travel@berseapp.com',
          'maya.food@berseapp.com',
          'david.tech@berseapp.com',
          'lisa.fitness@berseapp.com',
          'nina.music@berseapp.com',
          'kevin.photo@berseapp.com',
          'priya.community@berseapp.com',
        ],
      },
    },
  });
  
  if (users.length === 0) {
    console.log('⚠️  No users found. Please run users seed first.');
    return [];
  }

  const [admin, sarah, alex, maya, david, lisa, nina, kevin, priya] = users;

  const communities = await prisma.community.findMany();
  const foodiesCommunity = communities.find(c => c.name.includes('Foodies'));
  const sportsCommunity = communities.find(c => c.name.includes('Fitness'));
  const techCommunity = communities.find(c => c.name.includes('Tech'));
  const travelCommunity = communities.find(c => c.name.includes('Travel'));
  const musicCommunity = communities.find(c => c.name.includes('Music'));
  const photographyCommunity = communities.find(c => c.name.includes('Photography'));
  const gamingCommunity = communities.find(c => c.name.includes('Gaming'));
  const parentsCommunity = communities.find(c => c.name.includes('Parents'));
  
  await prisma.event.deleteMany({});
  
  const events = [
    // Sports & Fitness Events
    {
      title: 'Morning Yoga in the Park',
      description: 'Start your day with energizing yoga in beautiful KLCC Park. All levels welcome! Bring your own mat.',
      type: EventType.SPORTS,
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      location: 'KLCC Park, Kuala Lumpur',
      mapLink: 'https://maps.google.com/?q=KLCC+Park',
      maxAttendees: 25,
      hostId: lisa?.id || admin.id,
      communityId: sportsCommunity?.id,
      isFree: true,
      status: EventStatus.PUBLISHED,
      hostType: EventHostType.COMMUNITY,
      images: ['https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=600&fit=crop'],
    },
    {
      title: 'Badminton Tournament - Singles & Doubles',
      description: 'Competitive badminton tournament with prizes! Register your singles or doubles team. RM 20 entry fee covers court rental and refreshments.',
      type: EventType.SPORTS,
      date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      location: 'Stadium Badminton Setapak',
      mapLink: 'https://maps.google.com/?q=Stadium+Badminton+Setapak',
      maxAttendees: 32,
      hostId: admin.id,
      communityId: sportsCommunity?.id,
      isFree: false,
      price: 20.0,
      currency: 'MYR',
      status: EventStatus.PUBLISHED,
      hostType: EventHostType.COMMUNITY,
      images: ['https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&h=600&fit=crop'],
    },
    {
      title: 'Weekend Hiking: Bukit Tabur',
      description: 'Challenging hike with stunning views of Klang Gates Dam. Experienced hikers only. Start 6 AM sharp!',
      type: EventType.SPORTS,
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      location: 'Bukit Tabur Trailhead, Taman Melawati',
      mapLink: 'https://maps.google.com/?q=Bukit+Tabur',
      maxAttendees: 15,
      hostId: alex?.id || admin.id,
      isFree: true,
      status: EventStatus.PUBLISHED,
      hostType: EventHostType.PERSONAL,
      images: ['https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&h=600&fit=crop'],
    },

    // Food & Social Events
    {
      title: 'Malaysian Street Food Crawl',
      description: 'Explore the best street food in Jalan Alor! Try local favorites like char kway teow, satay, and hokkien mee. Guide and first dish included.',
      type: EventType.SOCIAL,
      date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      location: 'Jalan Alor, Bukit Bintang',
      mapLink: 'https://maps.google.com/?q=Jalan+Alor+KL',
      maxAttendees: 12,
      hostId: maya?.id || sarah?.id || admin.id,
      communityId: foodiesCommunity?.id,
      isFree: false,
      price: 50.0,
      currency: 'MYR',
      status: EventStatus.PUBLISHED,
      hostType: EventHostType.COMMUNITY,
      images: ['https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=600&fit=crop'],
    },
    {
      title: 'Cooking Class: Nasi Lemak Workshop',
      description: 'Learn to cook Malaysia\'s national dish from a local chef! Includes all ingredients, cooking session, and meal together.',
      type: EventType.CAFE_MEETUP,
      date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      location: 'Cookhouse KL, Bangsar',
      maxAttendees: 16,
      hostId: maya?.id || admin.id,
      communityId: foodiesCommunity?.id,
      isFree: false,
      price: 85.0,
      currency: 'MYR',
      status: EventStatus.PUBLISHED,
      hostType: EventHostType.COMMUNITY,
      images: ['https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&h=600&fit=crop'],
    },
    {
      title: 'Brunch & Board Games Sunday',
      description: 'Relaxed Sunday brunch with board games! Bring your favorite games or try ours. Food and drinks at your own cost.',
      type: EventType.SOCIAL,
      date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
      location: 'Boardgame Cafe, Damansara Utama',
      maxAttendees: 20,
      hostId: sarah?.id || admin.id,
      isFree: true,
      status: EventStatus.PUBLISHED,
      hostType: EventHostType.PERSONAL,
      images: ['https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=800&h=600&fit=crop'],
    },

    // Tech & Professional Events
    {
      title: 'Startup Pitch Night',
      description: '5 startups pitch their ideas to investors and the community. Networking drinks after presentations. Great for entrepreneurs and investors!',
      type: EventType.ILM,
      date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
      location: 'MaGIC Cyberjaya',
      mapLink: 'https://maps.google.com/?q=MaGIC+Cyberjaya',
      maxAttendees: 80,
      hostId: david?.id || admin.id,
      communityId: techCommunity?.id,
      isFree: true,
      status: EventStatus.PUBLISHED,
      hostType: EventHostType.COMMUNITY,
      images: ['https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&h=600&fit=crop'],
    },
    {
      title: 'Web3 & Blockchain Workshop',
      description: 'Hands-on workshop covering smart contracts, NFTs, and DeFi. Bring your laptop! Basic coding knowledge helpful.',
      type: EventType.ILM,
      date: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
      location: 'WORQ Coworking, TTDI',
      mapLink: 'https://maps.google.com/?q=WORQ+TTDI',
      maxAttendees: 30,
      hostId: david?.id || admin.id,
      communityId: techCommunity?.id,
      isFree: false,
      price: 120.0,
      currency: 'MYR',
      status: EventStatus.PUBLISHED,
      hostType: EventHostType.COMMUNITY,
      images: ['https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=600&fit=crop'],
    },

    // Music & Arts Events
    {
      title: 'Open Mic Night - Acoustic Session',
      description: 'Showcase your musical talent or just enjoy live performances! Sign up slots available. Supportive, friendly audience guaranteed.',
      type: EventType.ILM,
      date: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
      location: 'No Black Tie, Kuala Lumpur',
      mapLink: 'https://maps.google.com/?q=No+Black+Tie+KL',
      maxAttendees: 50,
      hostId: nina?.id || admin.id,
      communityId: musicCommunity?.id,
      isFree: false,
      price: 30.0,
      currency: 'MYR',
      status: EventStatus.PUBLISHED,
      hostType: EventHostType.COMMUNITY,
      images: ['https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&h=600&fit=crop'],
    },
    {
      title: 'Photography Walk: Golden Hour KL',
      description: 'Capture KL\'s iconic landmarks during golden hour. Tips on composition and lighting. All camera types welcome - phones included!',
      type: EventType.SOCIAL,
      date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      location: 'Merdeka Square, Kuala Lumpur',
      mapLink: 'https://maps.google.com/?q=Merdeka+Square+KL',
      maxAttendees: 20,
      hostId: kevin?.id || admin.id,
      communityId: photographyCommunity?.id,
      isFree: true,
      status: EventStatus.PUBLISHED,
      hostType: EventHostType.COMMUNITY,
      images: ['https://images.unsplash.com/photo-1606933248010-ef7e86ec21e9?w=800&h=600&fit=crop'],
    },

    // Travel Events
    {
      title: 'Day Trip: Batu Caves & Batik Factory',
      description: 'Visit iconic Batu Caves and learn traditional batik making. Transportation, guide, and lunch included. Cultural immersion guaranteed!',
      type: EventType.SOCIAL,
      date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      location: 'Meeting point: KL Sentral',
      mapLink: 'https://maps.google.com/?q=KL+Sentral',
      maxAttendees: 25,
      hostId: alex?.id || sarah?.id || admin.id,
      communityId: travelCommunity?.id,
      isFree: false,
      price: 150.0,
      currency: 'MYR',
      status: EventStatus.PUBLISHED,
      hostType: EventHostType.COMMUNITY,
      images: ['https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=800&h=600&fit=crop'],
    },
    {
      title: 'Weekend Getaway: Cameron Highlands',
      description: '2D1N trip to Cameron Highlands! Tea plantations, strawberry farms, and cool weather. Accommodation and transport included.',
      type: EventType.SOCIAL,
      date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      location: 'Cameron Highlands (Depart from KL)',
      maxAttendees: 15,
      hostId: alex?.id || admin.id,
      communityId: travelCommunity?.id,
      isFree: false,
      price: 380.0,
      currency: 'MYR',
      status: EventStatus.PUBLISHED,
      hostType: EventHostType.COMMUNITY,
      images: ['https://images.unsplash.com/photo-1586508887700-bf20f8ef9da7?w=800&h=600&fit=crop'],
    },

    // Gaming & Family Events
    {
      title: 'Mobile Legends Tournament',
      description: 'Register your 5-person squad for our monthly Mobile Legends tournament! Prizes for top 3 teams. Check-in starts 1 hour early.',
      type: EventType.SOCIAL,
      date: new Date(Date.now() + 13 * 24 * 60 * 60 * 1000),
      location: 'Cybercafe Arena, Mid Valley',
      maxAttendees: 40,
      hostId: admin.id,
      communityId: gamingCommunity?.id,
      isFree: false,
      price: 15.0,
      currency: 'MYR',
      status: EventStatus.PUBLISHED,
      hostType: EventHostType.COMMUNITY,
      images: ['https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=600&fit=crop'],
    },
    {
      title: 'Family Picnic Day',
      description: 'Fun-filled picnic for families! Games, food, and activities for kids. Bring your picnic blanket and snacks to share!',
      type: EventType.SOCIAL,
      date: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
      location: 'Taman Tasik Titiwangsa',
      mapLink: 'https://maps.google.com/?q=Titiwangsa+Lake+Park',
      maxAttendees: 50,
      hostId: priya?.id || sarah?.id || admin.id,
      communityId: parentsCommunity?.id,
      isFree: true,
      status: EventStatus.PUBLISHED,
      hostType: EventHostType.COMMUNITY,
      images: ['https://images.unsplash.com/photo-1527525443983-6e60c75fff46?w=800&h=600&fit=crop'],
    },

    // Volunteer & Community Service
    {
      title: 'Food Bank Volunteering',
      description: 'Help sort and pack food donations for families in need. Make a real difference in our community. Light refreshments provided.',
      type: EventType.VOLUNTEER,
      date: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000),
      location: 'KL Food Bank, Sentul',
      mapLink: 'https://maps.google.com/?q=KL+Food+Bank',
      maxAttendees: 25,
      hostId: sarah?.id || admin.id,
      isFree: true,
      status: EventStatus.PUBLISHED,
      hostType: EventHostType.PERSONAL,
      images: ['https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&h=600&fit=crop'],
    },
    {
      title: 'Community Garden Planting Day',
      description: 'Help establish a new community garden! Planting vegetables and herbs. No experience needed, just bring enthusiasm!',
      type: EventType.VOLUNTEER,
      date: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000),
      location: 'Taman Tun Dr Ismail Community Center',
      maxAttendees: 30,
      hostId: admin.id,
      isFree: true,
      status: EventStatus.PUBLISHED,
      hostType: EventHostType.PERSONAL,
      images: ['https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=800&h=600&fit=crop'],
    },

    // Past Event (for testing historical data)
    {
      title: 'New Year Countdown Party 2025',
      description: 'Epic New Year celebration with live DJ, food trucks, and fireworks view! Celebrated start of 2025 in style.',
      type: EventType.SOCIAL,
      date: new Date('2024-12-31T21:00:00'),
      location: 'Sky Bar KL, Traders Hotel',
      maxAttendees: 100,
      hostId: sarah?.id || admin.id,
      isFree: false,
      price: 180.0,
      currency: 'MYR',
      status: EventStatus.COMPLETED,
      hostType: EventHostType.PERSONAL,
      ticketsSold: 95,
      images: ['https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=800&h=600&fit=crop'],
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
