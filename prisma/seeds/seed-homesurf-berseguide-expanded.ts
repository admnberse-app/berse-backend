import { PrismaClient } from '@prisma/client';
import {
  AccommodationType,
  PaymentType,
  HomeSurfBookingStatus,
  GuideType,
  BerseGuideBookingStatus,
  ReviewerRole,
} from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Expanded Seed for HomeSurf and BerseGuide
 * Creates 10+ profiles across different cities with realistic data
 */
async function seedExpandedHomeSurfBerseGuide() {
  console.log('🌱 Seeding EXPANDED HomeSurf and BerseGuide data...');

  try {
    // Get existing users or create more
    const users = await prisma.user.findMany({
      where: {
        trustScore: { gte: 70 },
      },
      take: 20,
    });

    if (users.length < 15) {
      console.log('⚠️  Creating additional test users...');
      const newUserCount = 15 - users.length;
      
      for (let i = 0; i < newUserCount; i++) {
        const user = await prisma.user.create({
          data: {
            email: `homesurf_expanded_${Date.now()}_${i}@berse.com`,
            password: '$2b$10$YourHashedPasswordHere',
            fullName: `Expanded User ${i + 1}`,
            trustScore: 70 + Math.floor(Math.random() * 30),
            profile: {
              create: {
                bio: `Travel enthusiast and cultural exchange advocate`,
              },
            },
          },
        });
        users.push(user);
      }
    }

    // =========================
    // HOMESURF PROFILES
    // =========================
    console.log('Creating expanded HomeSurf profiles...');

    const homeSurfProfiles = [
      {
        userId: users[0].id,
        title: 'Modern Loft in Kuala Lumpur',
        description: 'Spacious loft in the heart of KL with stunning city views. Walking distance to Petronas Towers and amazing street food!',
        accommodationType: AccommodationType.PRIVATE_ROOM,
        maxGuests: 2,
        amenities: ['wifi', 'air_conditioning', 'kitchen', 'gym', 'pool'],
        photos: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267'],
        houseRules: 'No smoking, respectful hours',
        city: 'Kuala Lumpur',
        neighborhood: 'KLCC',
        address: { street: '50 Jalan Ampang', postalCode: '50450', country: 'Malaysia' },
        coordinates: { lat: 3.1569, lng: 101.7123 },
        availabilityNotes: 'Usually available weekdays',
        minimumStay: 2,
        maximumStay: 14,
        advanceNotice: 48,
        isEnabled: true,
        rating: 4.7,
        reviewCount: 8,
        totalGuests: 15,
        responseRate: 92.0,
        averageResponseTime: 6,
      },
      {
        userId: users[1].id,
        title: 'Beach House in Penang',
        description: 'Relaxing beach house perfect for surf and chill. Wake up to ocean views and sunset BBQs!',
        accommodationType: AccommodationType.ENTIRE_PLACE,
        maxGuests: 6,
        amenities: ['wifi', 'kitchen', 'beach_access', 'parking', 'bbq'],
        photos: ['https://images.unsplash.com/photo-1499793983690-e29da59ef1c2'],
        houseRules: 'Beach-friendly, family environment',
        city: 'Penang',
        neighborhood: 'Batu Ferringhi',
        address: { street: '123 Beach Road', postalCode: '11100', country: 'Malaysia' },
        coordinates: { lat: 5.4745, lng: 100.2473 },
        availabilityNotes: 'Available year-round, peak season advance booking',
        minimumStay: 3,
        maximumStay: 21,
        advanceNotice: 72,
        isEnabled: true,
        rating: 4.9,
        reviewCount: 22,
        totalGuests: 58,
        responseRate: 96.5,
        averageResponseTime: 3,
      },
      {
        userId: users[2].id,
        title: 'Artist Studio in Bali',
        description: 'Creative space in Ubud surrounded by rice paddies. Perfect for artists and yoga enthusiasts!',
        accommodationType: AccommodationType.SHARED_ROOM,
        maxGuests: 4,
        amenities: ['wifi', 'yoga_space', 'garden', 'art_studio'],
        photos: ['https://images.unsplash.com/photo-1537996194471-e657df975ab4'],
        houseRules: 'Creative spirits welcome, quiet meditation hours',
        city: 'Ubud',
        neighborhood: 'Central Ubud',
        address: { street: 'Jalan Raya Ubud', postalCode: '80571', country: 'Indonesia' },
        coordinates: { lat: -8.5069, lng: 115.2625 },
        availabilityNotes: 'Open to long-term cultural exchange',
        minimumStay: 5,
        maximumStay: 60,
        advanceNotice: 96,
        isEnabled: true,
        rating: 5.0,
        reviewCount: 15,
        totalGuests: 32,
        responseRate: 98.0,
        averageResponseTime: 2,
      },
      {
        userId: users[3].id,
        title: 'Downtown Bangkok Condo',
        description: 'Central location near BTS, perfect for exploring Bangkok nightlife and street food scene!',
        accommodationType: AccommodationType.PRIVATE_ROOM,
        maxGuests: 2,
        amenities: ['wifi', 'air_conditioning', 'kitchen', 'pool', 'gym'],
        photos: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64'],
        houseRules: 'Party-friendly but respectful, no smoking indoors',
        city: 'Bangkok',
        neighborhood: 'Sukhumvit',
        address: { street: 'Sukhumvit Soi 11', postalCode: '10110', country: 'Thailand' },
        coordinates: { lat: 13.7563, lng: 100.5018 },
        availabilityNotes: 'Available most times',
        minimumStay: 1,
        maximumStay: 10,
        advanceNotice: 24,
        isEnabled: true,
        rating: 4.6,
        reviewCount: 31,
        totalGuests: 67,
        responseRate: 89.0,
        averageResponseTime: 8,
      },
      {
        userId: users[4].id,
        title: 'Mountain Cabin in Chiang Mai',
        description: 'Peaceful retreat in the mountains. Perfect for digital nomads and nature lovers.',
        accommodationType: AccommodationType.ENTIRE_PLACE,
        maxGuests: 3,
        amenities: ['wifi', 'kitchen', 'mountain_view', 'hiking_trails', 'workspace'],
        photos: ['https://images.unsplash.com/photo-1470770841072-f978cf4d019e'],
        houseRules: 'Respect nature, quiet environment',
        city: 'Chiang Mai',
        neighborhood: 'Doi Suthep',
        address: { street: 'Mountain Road', postalCode: '50200', country: 'Thailand' },
        coordinates: { lat: 18.7883, lng: 98.9853 },
        availabilityNotes: 'Best for longer stays',
        minimumStay: 7,
        maximumStay: 90,
        advanceNotice: 120,
        isEnabled: true,
        rating: 4.8,
        reviewCount: 12,
        totalGuests: 28,
        responseRate: 94.0,
        averageResponseTime: 5,
      },
      {
        userId: users[5].id,
        title: 'Hanoi Old Quarter Apartment',
        description: 'Traditional Vietnamese home in the heart of Old Quarter. Experience authentic Hanoi life!',
        accommodationType: AccommodationType.PRIVATE_ROOM,
        maxGuests: 2,
        amenities: ['wifi', 'fan', 'kitchen', 'balcony'],
        photos: ['https://images.unsplash.com/photo-1528127269322-539801943592'],
        houseRules: 'Respect local customs, quiet after midnight',
        city: 'Hanoi',
        neighborhood: 'Old Quarter',
        address: { street: 'Ta Hien Street', postalCode: '100000', country: 'Vietnam' },
        coordinates: { lat: 21.0285, lng: 105.8542 },
        availabilityNotes: 'Available year-round',
        minimumStay: 2,
        maximumStay: 14,
        advanceNotice: 48,
        isEnabled: true,
        rating: 4.7,
        reviewCount: 19,
        totalGuests: 41,
        responseRate: 91.0,
        averageResponseTime: 7,
      },
    ];

    for (const profile of homeSurfProfiles) {
      await prisma.userHomeSurf.upsert({
        where: { userId: profile.userId },
        update: {},
        create: profile,
      });
    }

    // HomeSurf Payment Options
    const homeSurfPaymentOptions = [];
    for (let i = 0; i < 6; i++) {
      homeSurfPaymentOptions.push(
        {
          homeSurfId: users[i].id,
          paymentType: PaymentType.FREE,
          description: 'Free cultural exchange',
          isPreferred: true,
        },
        {
          homeSurfId: users[i].id,
          paymentType: PaymentType.TREAT_ME,
          description: 'Share a meal together',
          isPreferred: false,
        }
      );
    }

    await prisma.homeSurfPaymentOption.createMany({
      data: homeSurfPaymentOptions,
      skipDuplicates: true,
    });

    console.log(`✅ Created ${homeSurfProfiles.length} HomeSurf profiles`);

    // =========================
    // BERSEGUIDE PROFILES
    // =========================
    console.log('Creating expanded BerseGuide profiles...');

    const berseGuideProfiles = [
      {
        userId: users[6].id,
        title: 'KL Street Food Adventure',
        description: 'Born and raised in KL, I know every hawker stall! Let me take you on a culinary journey through Malaysian cuisine.',
        guideTypes: [GuideType.FOOD_TOUR, GuideType.LOCAL_EXPERIENCE],
        customTypes: ['hawker_expert', 'food_history'],
        languages: ['English', 'Malay', 'Mandarin', 'Cantonese'],
        city: 'Kuala Lumpur',
        neighborhoods: ['Chinatown', 'Bangsar', 'Petaling Street', 'Jalan Alor'],
        coverageRadius: 20,
        maxGroupSize: 6,
        typicalDuration: 3,
        minDuration: 2,
        maxDuration: 6,
        advanceNotice: 24,
        yearsGuiding: 4,
        photos: ['https://images.unsplash.com/photo-1555939594-58d7cb561ad1'],
        highlights: ['Nasi lemak spots', 'Best char kway teow', 'Hidden gems', 'Food history'],
        sampleItinerary: 'Start at Petaling Street, visit traditional kopitiam, lunch at hawker center, explore Jalan Alor',
        availabilityNotes: 'Available evenings and weekends',
        isEnabled: true,
        totalSessions: 45,
        rating: 4.8,
        reviewCount: 38,
        responseRate: 95.0,
        averageResponseTime: 4,
      },
      {
        userId: users[7].id,
        title: 'Penang Heritage Walking Tour',
        description: 'UNESCO World Heritage expert. I\'ll show you the real Penang beyond Georgetown!',
        guideTypes: [GuideType.CULTURAL_TOUR, GuideType.HISTORICAL_SITES, GuideType.NATURE_WALKS],
        customTypes: ['heritage_expert', 'architecture', 'peranakan_culture'],
        languages: ['English', 'Hokkien', 'Malay'],
        city: 'Penang',
        neighborhoods: ['Georgetown', 'Armenian Street', 'Little India'],
        coverageRadius: 15,
        maxGroupSize: 8,
        typicalDuration: 4,
        minDuration: 2,
        maxDuration: 8,
        advanceNotice: 48,
        yearsGuiding: 6,
        photos: ['https://images.unsplash.com/photo-1578894381163-e72c17f2d45f'],
        highlights: ['Street art', 'Clan jetties', 'Colonial buildings', 'Local temples'],
        sampleItinerary: 'Georgetown walk, street art hunt, clan jetties, Khoo Kongsi, lunch at hawker center',
        availabilityNotes: 'Daily tours available',
        isEnabled: true,
        totalSessions: 78,
        rating: 4.9,
        reviewCount: 65,
        responseRate: 97.0,
        averageResponseTime: 3,
      },
      {
        userId: users[8].id,
        title: 'Bangkok Night Market Explorer',
        description: 'Night owl and market enthusiast! Let\'s explore Bangkok\'s vibrant night markets and street food.',
        guideTypes: [GuideType.NIGHTLIFE, GuideType.FOOD_TOUR, GuideType.SHOPPING],
        customTypes: ['night_markets', 'street_food', 'local_shopping'],
        languages: ['English', 'Thai'],
        city: 'Bangkok',
        neighborhoods: ['Chatuchak', 'Asiatique', 'Talad Rot Fai'],
        coverageRadius: 25,
        maxGroupSize: 4,
        typicalDuration: 4,
        minDuration: 3,
        maxDuration: 7,
        advanceNotice: 24,
        yearsGuiding: 3,
        photos: ['https://images.unsplash.com/photo-1528181304800-259b08848526'],
        highlights: ['Night markets', 'Street food', 'Shopping bargains', 'Local nightlife'],
        sampleItinerary: 'Start at Chatuchak evening market, street food tastings, vintage market, end at rooftop bar',
        availabilityNotes: 'Evenings only, 6pm onwards',
        isEnabled: true,
        totalSessions: 52,
        rating: 4.7,
        reviewCount: 44,
        responseRate: 93.0,
        averageResponseTime: 5,
      },
      {
        userId: users[9].id,
        title: 'Bali Spiritual & Wellness Guide',
        description: 'Certified yoga instructor and spiritual guide. Experience the spiritual side of Bali!',
        guideTypes: [GuideType.CULTURAL_TOUR, GuideType.NATURE_WALKS, GuideType.LOCAL_EXPERIENCE],
        customTypes: ['yoga', 'meditation', 'temples', 'wellness'],
        languages: ['English', 'Indonesian', 'Dutch'],
        city: 'Ubud',
        neighborhoods: ['Ubud Center', 'Tegalalang', 'Campuhan Ridge'],
        coverageRadius: 30,
        maxGroupSize: 10,
        typicalDuration: 5,
        minDuration: 3,
        maxDuration: 10,
        advanceNotice: 72,
        yearsGuiding: 7,
        photos: ['https://images.unsplash.com/photo-1518709268805-4e9042af9f23'],
        highlights: ['Temple tours', 'Yoga sessions', 'Rice terraces', 'Healing rituals'],
        sampleItinerary: 'Morning yoga, rice terrace walk, temple visit, purification ritual, meditation at sunset',
        availabilityNotes: 'Prefer morning sessions',
        isEnabled: true,
        totalSessions: 92,
        rating: 5.0,
        reviewCount: 81,
        responseRate: 99.0,
        averageResponseTime: 2,
      },
      {
        userId: users[10].id,
        title: 'Hanoi Motorbike Food Tour',
        description: 'Hop on my motorbike and experience Hanoi like a local! Best street food from morning to night.',
        guideTypes: [GuideType.FOOD_TOUR, GuideType.HIDDEN_GEMS, GuideType.LOCAL_EXPERIENCE],
        customTypes: ['motorbike_tour', 'street_food', 'local_life'],
        languages: ['English', 'Vietnamese', 'French'],
        city: 'Hanoi',
        neighborhoods: ['Old Quarter', 'West Lake', 'Hai Ba Trung'],
        coverageRadius: 20,
        maxGroupSize: 2,
        typicalDuration: 3,
        minDuration: 2,
        maxDuration: 5,
        advanceNotice: 24,
        yearsGuiding: 5,
        photos: ['https://images.unsplash.com/photo-1555396273-367ea4eb4db5'],
        highlights: ['Motorbike adventure', 'Pho breakfast', 'Street food', 'Hidden alleys'],
        sampleItinerary: 'Morning pho, Old Quarter exploration, lunch at local spots, coffee at egg coffee shop',
        availabilityNotes: 'Available daily',
        isEnabled: true,
        totalSessions: 67,
        rating: 4.8,
        reviewCount: 59,
        responseRate: 96.0,
        averageResponseTime: 3,
      },
      {
        userId: users[11].id,
        title: 'Chiang Mai Outdoor Adventure Guide',
        description: 'Experienced outdoor guide specializing in jungle treks, waterfall hikes, and elephant sanctuaries.',
        guideTypes: [GuideType.HIKING, GuideType.NATURE_WALKS, GuideType.LOCAL_EXPERIENCE],
        customTypes: ['trekking', 'wildlife', 'eco_tourism'],
        languages: ['English', 'Thai', 'Karen'],
        city: 'Chiang Mai',
        neighborhoods: ['Doi Suthep', 'Mae Rim', 'San Kamphaeng'],
        coverageRadius: 50,
        maxGroupSize: 8,
        typicalDuration: 8,
        minDuration: 4,
        maxDuration: 12,
        advanceNotice: 96,
        yearsGuiding: 9,
        photos: ['https://images.unsplash.com/photo-1551632811-561732d1e306'],
        highlights: ['Jungle treks', 'Waterfall swimming', 'Elephant sanctuary', 'Hill tribe visits'],
        sampleItinerary: 'Pick up, jungle trek, waterfall lunch, elephant sanctuary, hill tribe village, sunset return',
        availabilityNotes: 'Full day tours, advance booking required',
        isEnabled: true,
        totalSessions: 103,
        rating: 4.9,
        reviewCount: 94,
        responseRate: 98.0,
        averageResponseTime: 4,
      },
    ];

    for (const profile of berseGuideProfiles) {
      await prisma.userBerseGuide.upsert({
        where: { userId: profile.userId },
        update: {},
        create: profile,
      });
    }

    // BerseGuide Payment Options
    const berseGuidePaymentOptions = [];
    const prices = [40, 50, 60, 75, 80, 100];
    for (let i = 0; i < 6; i++) {
      berseGuidePaymentOptions.push(
        {
          berseGuideId: users[i + 6].id,
          paymentType: PaymentType.MONEY,
          amount: prices[i],
          currency: 'USD',
          description: `$${prices[i]} per person`,
          isPreferred: true,
        },
        {
          berseGuideId: users[i + 6].id,
          paymentType: PaymentType.TREAT_ME,
          description: 'Buy me lunch/drinks during tour',
          isPreferred: false,
        }
      );
    }

    await prisma.berseGuidePaymentOption.createMany({
      data: berseGuidePaymentOptions,
      skipDuplicates: true,
    });

    console.log(`✅ Created ${berseGuideProfiles.length} BerseGuide profiles`);

    // Summary
    console.log('\n📊 Expanded Seeding Summary:');
    console.log(`  - HomeSurf Profiles: ${homeSurfProfiles.length}`);
    console.log(`  - HomeSurf Payment Options: ${homeSurfPaymentOptions.length}`);
    console.log(`  - BerseGuide Profiles: ${berseGuideProfiles.length}`);
    console.log(`  - BerseGuide Payment Options: ${berseGuidePaymentOptions.length}`);
    console.log('\n✅ Expanded HomeSurf & BerseGuide seeding complete!');

  } catch (error) {
    console.error('❌ Error seeding expanded data:', error);
    throw error;
  }
}

// Execute seeding
seedExpandedHomeSurfBerseGuide()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
