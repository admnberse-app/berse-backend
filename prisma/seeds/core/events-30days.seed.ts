require('dotenv').config({ path: require('path').join(__dirname, '../../../.env') });

import { PrismaClient, EventType, EventStatus, EventHostType } from '@prisma/client';

const prisma = new PrismaClient();

const eventTemplates = [
  { title: 'Morning Yoga Session', type: EventType.SPORTS, location: 'KLCC Park', city: 'Kuala Lumpur', country: 'Malaysia', isFree: true },
  { title: 'Coffee & Code Meetup', type: EventType.CAFE_MEETUP, location: 'VCR Cafe, Pudu', city: 'Kuala Lumpur', country: 'Malaysia', isFree: false, price: 25 },
  { title: 'Badminton Tournament', type: EventType.SPORTS, location: 'Sentul Sports Complex', city: 'Kuala Lumpur', country: 'Malaysia', isFree: false, price: 30 },
  { title: 'Tech Talk: Web3 & Blockchain', type: EventType.ILM, location: 'Common Ground, Damansara Heights', city: 'Kuala Lumpur', country: 'Malaysia', isFree: true },
  { title: 'Sunday Brunch Gathering', type: EventType.SOCIAL, location: 'Publika Shopping Gallery', city: 'Kuala Lumpur', country: 'Malaysia', isFree: false, price: 55 },
  { title: 'Photography Workshop', type: EventType.ILM, location: 'The Kuala Lumpur Performing Arts Centre', city: 'Kuala Lumpur', country: 'Malaysia', isFree: false, price: 120 },
  { title: 'Startup Networking Night', type: EventType.SOCIAL, location: 'CUB, Bangsar South', city: 'Kuala Lumpur', country: 'Malaysia', isFree: true },
  { title: 'Charity Fun Run 5K', type: EventType.VOLUNTEER, location: 'Lake Gardens', city: 'Kuala Lumpur', country: 'Malaysia', isFree: false, price: 40 },
  { title: 'Cultural Dance Performance', type: EventType.SOCIAL, location: 'Kuala Lumpur City Centre', city: 'Kuala Lumpur', country: 'Malaysia', isFree: true },
  { title: 'Business Conference 2025', type: EventType.ILM, location: 'Sunway Convention Centre', city: 'Petaling Jaya', country: 'Malaysia', isFree: false, price: 250 },
  { title: 'Evening Basketball Game', type: EventType.SPORTS, location: 'Stadium Titiwangsa', city: 'Kuala Lumpur', country: 'Malaysia', isFree: true },
  { title: 'Cooking Class: Malaysian Cuisine', type: EventType.ILM, location: 'Berjaya Times Square', city: 'Kuala Lumpur', country: 'Malaysia', isFree: false, price: 95 },
  { title: 'Community Cleanup Drive', type: EventType.VOLUNTEER, location: 'Taman Tasik Permaisuri', city: 'Kuala Lumpur', country: 'Malaysia', isFree: true },
  { title: 'Wine Tasting Evening', type: EventType.SOCIAL, location: 'The Wine Shop, Bangsar', city: 'Kuala Lumpur', country: 'Malaysia', isFree: false, price: 150 },
  { title: 'Hackathon Weekend', type: EventType.ILM, location: 'Cyberjaya Innovation Hub', city: 'Cyberjaya', country: 'Malaysia', isFree: true },
  { title: 'Meditation & Mindfulness', type: EventType.ILM, location: 'Brickfields Wellness Center', city: 'Kuala Lumpur', country: 'Malaysia', isFree: false, price: 35 },
  { title: 'Friday Night Futsal', type: EventType.SPORTS, location: 'KL Sports City', city: 'Kuala Lumpur', country: 'Malaysia', isFree: false, price: 20 },
  { title: 'Indie Music Night', type: EventType.SOCIAL, location: 'Live House KL', city: 'Kuala Lumpur', country: 'Malaysia', isFree: false, price: 45 },
  { title: 'Board Games Cafe Meetup', type: EventType.CAFE_MEETUP, location: 'Meeples Cafe, Mid Valley', city: 'Kuala Lumpur', country: 'Malaysia', isFree: false, price: 30 },
  { title: 'Career Development Workshop', type: EventType.ILM, location: 'WORQ Coworking, KL Sentral', city: 'Kuala Lumpur', country: 'Malaysia', isFree: true },
  { title: 'Weekend Trip to Cameron Highlands', type: EventType.TRIP, location: 'Cameron Highlands', city: 'Cameron Highlands', country: 'Malaysia', isFree: false, price: 180 },
  { title: 'Putrajaya Day Trip', type: EventType.LOCAL_TRIP, location: 'Putrajaya', city: 'Putrajaya', country: 'Malaysia', isFree: false, price: 50 },
  { title: 'Monthly Community Gathering', type: EventType.MONTHLY_EVENT, location: 'Community Hall, Mont Kiara', city: 'Kuala Lumpur', country: 'Malaysia', isFree: true },
  { title: 'Hiking Adventure - Bukit Tabur', type: EventType.SPORTS, location: 'Bukit Tabur West', city: 'Selangor', country: 'Malaysia', isFree: true },
  { title: 'Charity Donation Drive', type: EventType.VOLUNTEER, location: 'KL City Centre', city: 'Kuala Lumpur', country: 'Malaysia', isFree: true },
];

const descriptions = [
  'Join us for an amazing experience! All are welcome.',
  'Don\'t miss out on this exciting opportunity to connect with like-minded people.',
  'A perfect event for beginners and experienced participants alike.',
  'Come and discover something new in a friendly environment.',
  'Limited spots available! Register early to secure your place.',
  'An unforgettable experience awaits you.',
  'Meet new friends and enjoy great activities.',
  'Professional guidance and support provided throughout.',
  'Bring your enthusiasm and get ready for a great time!',
  'This event has been highly requested by our community.',
];

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

export async function seed30DaysEvents() {
  console.log('\n📅 Creating events for the next 30 days...');
  
  // Get users to use as hosts
  const users = await prisma.user.findMany({
    take: 10,
    select: { id: true }
  });
  
  if (users.length === 0) {
    console.log('⚠️  No users found. Please seed users first.');
    return [];
  }

  // Get communities
  const communities = await prisma.community.findMany({
    take: 5,
    select: { id: true }
  });

  const createdEvents = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Generate events for each of the next 30 days
  for (let day = 0; day < 30; day++) {
    // Random number of events per day (0-5 events)
    const eventsToday = getRandomInt(0, 5);
    
    for (let i = 0; i < eventsToday; i++) {
      const template = getRandomElement(eventTemplates);
      const eventDate = new Date(today);
      eventDate.setDate(today.getDate() + day);
      
      // Random hour between 9 AM and 8 PM
      eventDate.setHours(getRandomInt(9, 20), getRandomInt(0, 59), 0, 0);
      
      const hostUser = getRandomElement(users);
      const useCommunity = communities.length > 0 && Math.random() > 0.5;
      
      const eventData: any = {
        title: template.title,
        description: getRandomElement(descriptions),
        type: template.type,
        date: eventDate,
        location: template.location,
        city: template.city,
        country: template.country,
        mapLink: `https://maps.google.com/?q=${encodeURIComponent(template.location)}`,
        maxAttendees: getRandomInt(10, 100),
        hostId: hostUser.id,
        isFree: template.isFree,
        status: EventStatus.PUBLISHED,
        hostType: useCommunity && communities.length > 0 ? EventHostType.COMMUNITY : EventHostType.PERSONAL,
      };

      if (useCommunity && communities.length > 0) {
        eventData.communityId = getRandomElement(communities).id;
      }

      // Add relevant stock images based on event type
      const imagesByType: Record<string, string[]> = {
        [EventType.SPORTS]: [
          'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&h=600&fit=crop',
        ],
        [EventType.CAFE_MEETUP]: [
          'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=800&h=600&fit=crop',
        ],
        [EventType.ILM]: [
          'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop',
        ],
        [EventType.SOCIAL]: [
          'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&h=600&fit=crop',
        ],
        [EventType.TRIP]: [
          'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=600&fit=crop',
        ],
        [EventType.LOCAL_TRIP]: [
          'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
        ],
        [EventType.VOLUNTEER]: [
          'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&h=600&fit=crop',
        ],
        [EventType.MONTHLY_EVENT]: [
          'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&h=600&fit=crop',
        ],
      };

      const eventTypeImages = imagesByType[template.type] || [];
      if (eventTypeImages.length > 0) {
        eventData.images = [getRandomElement(eventTypeImages)];
      }

      // Add notes for some events
      if (Math.random() > 0.6) {
        eventData.notes = 'Please arrive 15 minutes early. Bring your own water bottle.';
      }

      try {
        const created = await prisma.event.create({
          data: eventData,
        });
        createdEvents.push(created);
      } catch (error) {
        console.error(`Failed to create event: ${template.title}`, error);
      }
    }
  }
  
  console.log(`✅ ${createdEvents.length} events created for the next 30 days`);
  
  // Show distribution by day
  const eventsByDay: { [key: string]: number } = {};
  createdEvents.forEach(event => {
    const dateKey = event.date.toISOString().split('T')[0];
    eventsByDay[dateKey] = (eventsByDay[dateKey] || 0) + 1;
  });
  
  console.log('\n📊 Events distribution:');
  Object.entries(eventsByDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([date, count]) => {
      console.log(`  ${date}: ${count} event${count !== 1 ? 's' : ''}`);
    });
  
  return createdEvents;
}

async function main() {
  await seed30DaysEvents();
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
