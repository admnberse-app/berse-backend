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
 * Seed HomeSurf and BerseGuide data for testing
 */
async function seedHomeSurfAndBerseGuide() {
  console.log('🌱 Seeding HomeSurf and BerseGuide data...');

  try {
    // Find or create test users with sufficient trust scores
    const users = await prisma.user.findMany({
      take: 10,
      where: {
        trustScore: {
          gte: 70,
        },
      },
    });

    if (users.length < 4) {
      console.log('⚠️  Not enough users with trust score >= 70. Creating test users...');
      
      // Create test users if needed
      for (let i = users.length; i < 4; i++) {
        const user = await prisma.user.create({
          data: {
            email: `homesurf_test_${i}@berse.com`,
            password: '$2b$10$YourHashedPasswordHere', // Use proper hash in production
            fullName: `Test User ${i}`,
            trustScore: 75 + i * 5,
            profile: {
              create: {
                bio: `Test user ${i} for HomeSurf/BerseGuide testing`,
              },
            },
          },
        });
        users.push(user);
      }
    }

    const [host1, host2, guest1, guide1] = users;

    // =========================
    // HOMESURF PROFILES
    // =========================
    console.log('Creating HomeSurf profiles...');

    const homeSurfProfile1 = await prisma.userHomeSurf.upsert({
      where: { userId: host1.id },
      update: {},
      create: {
        userId: host1.id,
        title: 'Cozy Studio in Downtown Tokyo',
        description: 'Welcome to my cozy studio in the heart of Tokyo! Perfect for solo travelers or couples. Close to metro, restaurants, and nightlife.',
        accommodationType: AccommodationType.PRIVATE_ROOM,
        maxGuests: 2,
        amenities: ['wifi', 'kitchen', 'washer', 'air_conditioning', 'heating'],
        photos: [
          'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267',
          'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688',
        ],
        houseRules: 'No smoking, no pets, quiet after 10pm',
        city: 'Tokyo',
        neighborhood: 'Shibuya',
        address: { street: '123 Shibuya Street', postalCode: '150-0002', country: 'Japan' },
        coordinates: { lat: 35.6595, lng: 139.7004 },
        availabilityNotes: 'Available most weekends, prefer at least 2 days notice',
        minimumStay: 1,
        maximumStay: 7,
        advanceNotice: 48,
        isEnabled: true,
        rating: 4.8,
        reviewCount: 12,
        totalGuests: 24,
        responseRate: 95.5,
        averageResponseTime: 4,
      },
    });

    const homeSurfProfile2 = await prisma.userHomeSurf.upsert({
      where: { userId: host2.id },
      update: {},
      create: {
        userId: host2.id,
        title: 'Traditional Japanese House - Entire Place',
        description: 'Experience authentic Japanese living! This traditional house has tatami rooms, a zen garden, and is near temples and shrines.',
        accommodationType: AccommodationType.ENTIRE_PLACE,
        maxGuests: 4,
        amenities: ['wifi', 'kitchen', 'garden', 'parking', 'washer'],
        photos: [
          'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf',
          'https://images.unsplash.com/photo-1566073771259-6a8506099945',
        ],
        houseRules: 'No smoking, no parties, respect the neighbors',
        city: 'Kyoto',
        neighborhood: 'Gion',
        address: { street: '456 Gion Street', postalCode: '605-0001', country: 'Japan' },
        coordinates: { lat: 35.0116, lng: 135.7681 },
        availabilityNotes: 'Usually free on weekdays',
        minimumStay: 2,
        maximumStay: 14,
        advanceNotice: 72,
        isEnabled: true,
        rating: 4.9,
        reviewCount: 18,
        totalGuests: 42,
        responseRate: 98.0,
        averageResponseTime: 2,
      },
    });

    // HomeSurf Payment Options
    await prisma.homeSurfPaymentOption.createMany({
      data: [
        {
          homeSurfId: host1.id,
          paymentType: PaymentType.FREE,
          description: 'Free stay for cultural exchange',
          isPreferred: true,
        },
        {
          homeSurfId: host1.id,
          paymentType: PaymentType.TREAT_ME,
          description: 'Take me out for dinner or drinks',
          isPreferred: false,
        },
        {
          homeSurfId: host2.id,
          paymentType: PaymentType.SKILL_TRADE,
          description: 'Teach me English or photography',
          isPreferred: true,
        },
        {
          homeSurfId: host2.id,
          paymentType: PaymentType.MONEY,
          amount: 30,
          currency: 'USD',
          description: '$30 per night',
          isPreferred: false,
        },
      ],
    });

    // HomeSurf Bookings
    const homeSurfBooking1 = await prisma.homeSurfBooking.create({
      data: {
        hostId: host1.id,
        guestId: guest1.id,
        checkInDate: new Date('2025-11-15'),
        checkOutDate: new Date('2025-11-17'),
        numberOfGuests: 1,
        message: 'Hi! I\'m visiting Tokyo for a conference. Would love to stay and exchange travel stories!',
        status: HomeSurfBookingStatus.APPROVED,
        agreedPaymentType: PaymentType.FREE,
        requestedAt: new Date('2025-10-20'),
        respondedAt: new Date('2025-10-21'),
        approvedAt: new Date('2025-10-21'),
      },
    });

    const homeSurfBooking2 = await prisma.homeSurfBooking.create({
      data: {
        hostId: host2.id,
        guestId: guest1.id,
        checkInDate: new Date('2025-12-01'),
        checkOutDate: new Date('2025-12-05'),
        numberOfGuests: 2,
        message: 'My partner and I would love to experience a traditional Japanese house!',
        status: HomeSurfBookingStatus.PENDING,
        requestedAt: new Date('2025-10-23'),
      },
    });

    // HomeSurf Reviews
    await prisma.homeSurfReview.create({
      data: {
        bookingId: homeSurfBooking1.id,
        reviewerId: guest1.id,
        revieweeId: host1.id,
        reviewerRole: ReviewerRole.GUEST,
        rating: 5,
        review: 'Amazing host! Very welcoming and gave great local recommendations. The place was exactly as described.',
        cleanliness: 5,
        communication: 5,
        hospitality: 5,
        location: 5,
        wouldStayAgain: true,
        photos: [],
        isPublic: true,
      },
    });

    console.log('✅ HomeSurf data seeded');

    // =========================
    // BERSEGUIDE PROFILES
    // =========================
    console.log('Creating BerseGuide profiles...');

    const berseGuideProfile1 = await prisma.userBerseGuide.upsert({
      where: { userId: guide1.id },
      update: {},
      create: {
        userId: guide1.id,
        title: 'Tokyo Food & Culture Adventure',
        description: 'Local Tokyo guide specializing in food tours and hidden gems. I\'ll take you to authentic ramen shops, izakayas, and secret spots only locals know!',
        guideTypes: [GuideType.FOOD_TOUR, GuideType.CULTURAL_TOUR, GuideType.NIGHTLIFE],
        customTypes: ['ramen expert', 'sake sommelier', 'street food'],
        languages: ['English', 'Japanese', 'Spanish'],
        city: 'Tokyo',
        neighborhoods: ['Shibuya', 'Harajuku', 'Shinjuku', 'Asakusa'],
        coverageRadius: 15,
        maxGroupSize: 4,
        typicalDuration: 4,
        minDuration: 2,
        maxDuration: 8,
        advanceNotice: 24,
        yearsGuiding: 5,
        photos: [
          'https://images.unsplash.com/photo-1555396273-367ea4eb4db5',
          'https://images.unsplash.com/photo-1504674900247-0877df9cc836',
        ],
        highlights: ['Best ramen spots', 'Hidden izakayas', 'Temple tours', 'Nightlife guide'],
        sampleItinerary: 'Start at Tsukiji for breakfast, explore traditional temples, lunch at local ramen shop, visit Shibuya and Harajuku, end with sunset drinks',
        availabilityNotes: 'Available weekends and evenings',
        isEnabled: true,
        totalSessions: 87,
        rating: 4.9,
        reviewCount: 64,
        responseRate: 98.5,
        averageResponseTime: 3,
      },
    });

    const berseGuideProfile2 = await prisma.userBerseGuide.upsert({
      where: { userId: host2.id },
      update: {},
      create: {
        userId: host2.id,
        title: 'Kyoto Historical & Temple Tours',
        description: 'I\'m a certified Kyoto tour guide with deep knowledge of Japanese history and Buddhism. Let me show you the real Kyoto!',
        guideTypes: [GuideType.CULTURAL_TOUR, GuideType.HISTORICAL_SITES, GuideType.LOCAL_EXPERIENCE],
        customTypes: ['temple expert', 'history buff', 'photographer'],
        languages: ['English', 'Japanese', 'French'],
        city: 'Kyoto',
        neighborhoods: ['Gion', 'Arashiyama', 'Higashiyama'],
        coverageRadius: 20,
        maxGroupSize: 6,
        typicalDuration: 6,
        minDuration: 3,
        maxDuration: 10,
        advanceNotice: 48,
        yearsGuiding: 8,
        photos: [
          'https://images.unsplash.com/photo-1545569341-9eb8b30979d9',
          'https://images.unsplash.com/photo-1478436127897-769e1b3f0f36',
        ],
        highlights: ['Temple tours', 'Historical sites', 'Tea ceremony', 'Geisha district'],
        sampleItinerary: 'Morning: Fushimi Inari Shrine, Afternoon: Kinkaku-ji Golden Temple, Tea ceremony experience, Evening: Gion district walk',
        availabilityNotes: 'Available most days with advance booking',
        isEnabled: true,
        totalSessions: 124,
        rating: 5.0,
        reviewCount: 98,
        responseRate: 99.0,
        averageResponseTime: 2,
      },
    });

    // BerseGuide Payment Options
    await prisma.berseGuidePaymentOption.createMany({
      data: [
        {
          berseGuideId: guide1.id,
          paymentType: PaymentType.MONEY,
          amount: 60,
          currency: 'USD',
          description: 'Per person for 4-hour food tour',
          isPreferred: true,
        },
        {
          berseGuideId: guide1.id,
          paymentType: PaymentType.TREAT_ME,
          description: 'Buy me lunch at one of the spots we visit',
          isPreferred: false,
        },
        {
          berseGuideId: host2.id,
          paymentType: PaymentType.MONEY,
          amount: 100,
          currency: 'USD',
          description: 'Per person for full-day historical tour',
          isPreferred: true,
        },
      ],
    });

    // BerseGuide Bookings
    const berseGuideBooking1 = await prisma.berseGuideBooking.create({
      data: {
        guideId: guide1.id,
        travelerId: guest1.id,
        preferredDate: new Date('2025-11-16'),
        preferredTime: 'afternoon',
        duration: 4,
        numberOfPeople: 1,
        interests: ['food', 'culture', 'local_spots'],
        specificRequests: 'Interested in ramen and izakayas, no raw fish please',
        message: 'Hi! I\'m a huge foodie and would love to explore Tokyo\'s food scene with you!',
        status: BerseGuideBookingStatus.APPROVED,
        agreedDate: new Date('2025-11-16'),
        agreedTime: '2:00 PM',
        agreedDuration: 4,
        agreedPaymentType: PaymentType.MONEY,
        agreedPaymentAmount: 60,
        agreedPaymentDetails: '$60 per person for 4-hour food tour',
        meetingPoint: 'Starbucks at Shibuya Station, Exit 3',
        itinerary: 'Start at Shibuya, visit 3 ramen shops, explore local izakayas, end at Shinjuku',
        requestedAt: new Date('2025-10-20'),
        respondedAt: new Date('2025-10-21'),
        approvedAt: new Date('2025-10-21'),
      },
    });

    const berseGuideBooking2 = await prisma.berseGuideBooking.create({
      data: {
        guideId: host2.id,
        travelerId: guest1.id,
        preferredDate: new Date('2025-12-02'),
        alternativeDates: [new Date('2025-12-03'), new Date('2025-12-04')],
        preferredTime: 'morning',
        duration: 6,
        numberOfPeople: 2,
        interests: ['temples', 'history', 'photography'],
        specificRequests: 'Want to learn about Buddhist history',
        message: 'We\'re interested in a comprehensive historical tour of Kyoto\'s temples',
        status: BerseGuideBookingStatus.PENDING,
        requestedAt: new Date('2025-10-23'),
      },
    });

    // BerseGuide Session (for completed booking)
    const berseGuideSession1 = await prisma.berseGuideSession.create({
      data: {
        bookingId: berseGuideBooking1.id,
        guideId: guide1.id,
        travelerId: guest1.id,
        date: new Date('2025-11-16'),
        startTime: new Date('2025-11-16T14:00:00Z'),
        endTime: new Date('2025-11-16T18:30:00Z'),
        actualDuration: 270,
        locationsCovered: [
          'Ichiran Ramen Shibuya',
          'Nakano Broadway',
          'Golden Gai Izakaya District',
          'Omoide Yokocho',
        ],
        photos: [
          'https://images.unsplash.com/photo-1569718212165-3a8278d5f624',
          'https://images.unsplash.com/photo-1555939594-58d7cb561ad1',
        ],
        notes: 'Fantastic tour! Guest loved the ramen spots and was very adventurous with food choices.',
        paymentType: PaymentType.MONEY,
        paymentAmount: 60,
        paymentCompleted: true,
      },
    });

    // BerseGuide Reviews
    await prisma.berseGuideReview.create({
      data: {
        bookingId: berseGuideBooking1.id,
        guideId: guide1.id,
        travelerId: guest1.id,
        rating: 5,
        review: 'Best tour guide ever! Took me to amazing spots I would never have found on my own. Super knowledgeable about Tokyo food scene.',
        knowledge: 5,
        communication: 5,
        friendliness: 5,
        value: 5,
        wouldRecommend: true,
        highlights: ['great_food_spots', 'fun_personality', 'local_knowledge'],
        photos: ['https://images.unsplash.com/photo-1555939594-58d7cb561ad1'],
        isPublic: true,
      },
    });

    console.log('✅ BerseGuide data seeded');

    // Summary
    console.log('\n📊 Seeding Summary:');
    console.log('  - HomeSurf Profiles: 2');
    console.log('  - HomeSurf Payment Options: 4');
    console.log('  - HomeSurf Bookings: 2');
    console.log('  - HomeSurf Reviews: 1');
    console.log('  - BerseGuide Profiles: 2');
    console.log('  - BerseGuide Payment Options: 3');
    console.log('  - BerseGuide Bookings: 2');
    console.log('  - BerseGuide Sessions: 1');
    console.log('  - BerseGuide Reviews: 1');
    console.log('\n✅ HomeSurf & BerseGuide seeding complete!');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
    throw error;
  }
}

// Execute seeding
seedHomeSurfAndBerseGuide()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
