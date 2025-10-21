/**
 * Enhanced User Seed - Full Working App
 * 
 * Creates 15 diverse test users with complete profiles, photos, and varied data
 * for comprehensive testing and demonstration.
 * 
 * Run with: npx ts-node prisma/seeds/core/users-enhanced.seed.ts
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../../.env') });

import { PrismaClient, UserRole, UserStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function seedEnhancedUsers() {
  console.log('\n👥 Creating enhanced test users...');
  
  const defaultPassword = await bcrypt.hash('password123', 12);
  const adminPassword = await bcrypt.hash('admin123', 12);

  await prisma.user.deleteMany({});
  
  const usersData = [
    // Admin
    {
      email: 'admin@berseapp.com',
      username: 'admin',
      password: adminPassword,
      fullName: 'Admin User',
      phone: '+60123456789',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      totalPoints: 1000,
      trustScore: 95.0,
      trustLevel: 'leader',
      profile: {
        displayName: 'Admin',
        bio: 'System administrator managing the Berse community. Always here to help!',
        shortBio: 'System administrator',
        profilePicture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
        interests: ['technology', 'management', 'community', 'innovation'],
        languages: ['en', 'ms', 'zh'],
        profession: 'System Administrator',
        dateOfBirth: new Date('1988-03-15'),
        gender: 'Male',
      },
      location: {
        currentCity: 'Kuala Lumpur',
        countryOfResidence: 'Malaysia',
        nationality: 'Malaysian',
        timezone: 'Asia/Kuala_Lumpur',
        preferredLanguage: 'en',
        currency: 'MYR',
      },
      security: {
        emailVerifiedAt: new Date(),
        phoneVerifiedAt: new Date(),
        lastLoginAt: new Date(),
      },
      serviceProfile: {
        isHostCertified: true,
        isHostAvailable: true,
        isGuideAvailable: false,
        hostDescription: 'Experienced event organizer and community builder',
      },
    },
    
    // Event Host
    {
      email: 'sarah.host@berseapp.com',
      username: 'sarahhost',
      password: defaultPassword,
      fullName: 'Sarah Ahmad',
      phone: '+60123456790',
      role: UserRole.GENERAL_USER,
      status: UserStatus.ACTIVE,
      totalPoints: 850,
      trustScore: 88.0,
      trustLevel: 'scout',
      profile: {
        displayName: 'Sarah',
        bio: 'Certified event host in KL with 5 years experience. Passionate about bringing people together and creating memorable experiences. Specialize in food tours and cultural events!',
        shortBio: 'Event host & community builder',
        profilePicture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
        interests: ['events', 'networking', 'food', 'culture', 'photography'],
        languages: ['en', 'ms', 'ar'],
        profession: 'Event Coordinator',
        dateOfBirth: new Date('1992-07-22'),
        gender: 'Female',
        instagramHandle: '@sarah.events.kl',
        linkedinHandle: 'sarahahmad',
      },
      location: {
        currentCity: 'Kuala Lumpur',
        countryOfResidence: 'Malaysia',
        nationality: 'Malaysian',
        originallyFrom: 'Penang',
        timezone: 'Asia/Kuala_Lumpur',
        preferredLanguage: 'en',
        currency: 'MYR',
      },
      security: {
        emailVerifiedAt: new Date(),
        phoneVerifiedAt: new Date(),
        lastLoginAt: new Date(),
      },
      serviceProfile: {
        isHostCertified: true,
        isHostAvailable: true,
        isGuideAvailable: true,
        hostDescription: 'Can host events up to 100 people. Venue connections available.',
        guideDescription: 'KL food tours and cultural heritage walks. Weekends preferred.',
      },
    },
    
    // Travel Enthusiast
    {
      email: 'alex.travel@berseapp.com',
      username: 'alextravel',
      password: defaultPassword,
      fullName: 'Alex Chen',
      phone: '+60123456791',
      role: UserRole.GENERAL_USER,
      status: UserStatus.ACTIVE,
      totalPoints: 650,
      trustScore: 75.0,
      trustLevel: 'trusted',
      profile: {
        displayName: 'Alex',
        bio: 'Digital nomad and travel blogger. Been to 45 countries and counting! Love connecting with fellow travelers and locals. Always happy to share tips or grab coffee.',
        shortBio: 'Digital nomad & travel blogger',
        profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
        interests: ['travel', 'photography', 'blogging', 'hiking', 'culture'],
        languages: ['en', 'zh', 'es'],
        profession: 'Travel Blogger',
        dateOfBirth: new Date('1994-11-08'),
        gender: 'Male',
        travelStyle: 'Adventurer',
        bucketList: ['Antarctica', 'Iceland', 'Bhutan', 'Madagascar'],
        instagramHandle: '@alex.wanderlust',
        website: 'https://alextravel.blog',
      },
      location: {
        currentCity: 'Kuala Lumpur',
        countryOfResidence: 'Malaysia',
        nationality: 'Singaporean',
        originallyFrom: 'Singapore',
        timezone: 'Asia/Kuala_Lumpur',
        preferredLanguage: 'en',
        currency: 'MYR',
      },
      security: {
        emailVerifiedAt: new Date(),
        phoneVerifiedAt: new Date(),
        lastLoginAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      serviceProfile: {
        isHostCertified: false,
        isHostAvailable: false,
        isGuideAvailable: true,
        guideDescription: 'Travel planning consultations and photography tours',
      },
    },
    
    // Foodie
    {
      email: 'maya.food@berseapp.com',
      username: 'mayafoodie',
      password: defaultPassword,
      fullName: 'Maya Patel',
      phone: '+60123456792',
      role: UserRole.GENERAL_USER,
      status: UserStatus.ACTIVE,
      totalPoints: 520,
      trustScore: 72.0,
      trustLevel: 'trusted',
      profile: {
        displayName: 'Maya',
        bio: 'Food enthusiast on a mission to try every hidden gem in KL! Love hosting potlucks and organizing food crawls. Vegetarian-friendly recommendations are my specialty 🌱',
        shortBio: 'Foodie & potluck host',
        profilePicture: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=400&h=400&fit=crop',
        interests: ['food', 'cooking', 'restaurants', 'baking', 'nutrition'],
        languages: ['en', 'hi', 'ms'],
        profession: 'Food Blogger',
        dateOfBirth: new Date('1996-04-12'),
        gender: 'Female',
        instagramHandle: '@maya.eats.kl',
      },
      location: {
        currentCity: 'Petaling Jaya',
        countryOfResidence: 'Malaysia',
        nationality: 'Indian',
        originallyFrom: 'Mumbai',
        timezone: 'Asia/Kuala_Lumpur',
        preferredLanguage: 'en',
        currency: 'MYR',
      },
      security: {
        emailVerifiedAt: new Date(),
        lastLoginAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
      },
    },
    
    // Tech Professional
    {
      email: 'david.tech@berseapp.com',
      username: 'davidtech',
      password: defaultPassword,
      fullName: 'David Lim',
      phone: '+60123456793',
      role: UserRole.GENERAL_USER,
      status: UserStatus.ACTIVE,
      totalPoints: 480,
      trustScore: 68.0,
      trustLevel: 'trusted',
      profile: {
        displayName: 'David',
        bio: 'Software engineer at a fintech startup. Love attending tech meetups and hackathons. Always interested in discussing AI, blockchain, and the future of tech!',
        shortBio: 'Software engineer & tech enthusiast',
        profilePicture: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
        interests: ['technology', 'coding', 'ai', 'blockchain', 'gaming'],
        languages: ['en', 'zh', 'ms'],
        profession: 'Software Engineer',
        dateOfBirth: new Date('1995-09-18'),
        gender: 'Male',
      },
      location: {
        currentCity: 'Kuala Lumpur',
        countryOfResidence: 'Malaysia',
        nationality: 'Malaysian',
        timezone: 'Asia/Kuala_Lumpur',
        preferredLanguage: 'en',
        currency: 'MYR',
      },
      security: {
        emailVerifiedAt: new Date(),
        phoneVerifiedAt: new Date(),
        lastLoginAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      },
    },
    
    // Fitness Enthusiast
    {
      email: 'lisa.fitness@berseapp.com',
      username: 'lisafit',
      password: defaultPassword,
      fullName: 'Lisa Wong',
      phone: '+60123456794',
      role: UserRole.GENERAL_USER,
      status: UserStatus.ACTIVE,
      totalPoints: 420,
      trustScore: 65.0,
      trustLevel: 'trusted',
      profile: {
        displayName: 'Lisa',
        bio: 'Certified yoga instructor and marathon runner. Organizing weekly running groups and yoga sessions. Let\'s stay active together! 🏃‍♀️🧘‍♀️',
        shortBio: 'Yoga instructor & runner',
        profilePicture: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
        interests: ['fitness', 'yoga', 'running', 'wellness', 'meditation'],
        languages: ['en', 'zh'],
        profession: 'Yoga Instructor',
        dateOfBirth: new Date('1993-02-28'),
        gender: 'Female',
        instagramHandle: '@lisa.yoga.kl',
      },
      location: {
        currentCity: 'Mont Kiara',
        countryOfResidence: 'Malaysia',
        nationality: 'Malaysian',
        timezone: 'Asia/Kuala_Lumpur',
        preferredLanguage: 'en',
        currency: 'MYR',
      },
      security: {
        emailVerifiedAt: new Date(),
        phoneVerifiedAt: new Date(),
        lastLoginAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
      },
      serviceProfile: {
        isHostCertified: true,
        isHostAvailable: true,
        isGuideAvailable: false,
        hostDescription: 'Host yoga sessions and fitness events',
      },
    },
    
    // Artist/Creative
    {
      email: 'zara.art@berseapp.com',
      username: 'zaraart',
      password: defaultPassword,
      fullName: 'Zara Ibrahim',
      phone: '+60123456795',
      role: UserRole.GENERAL_USER,
      status: UserStatus.ACTIVE,
      totalPoints: 380,
      trustScore: 62.0,
      trustLevel: 'trusted',
      profile: {
        displayName: 'Zara',
        bio: 'Freelance graphic designer and illustrator. Love art exhibitions, design workshops, and creative collaborations. Coffee and sketching are my happy place ☕🎨',
        shortBio: 'Graphic designer & illustrator',
        profilePicture: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop',
        interests: ['art', 'design', 'illustration', 'photography', 'coffee'],
        languages: ['en', 'ms'],
        profession: 'Graphic Designer',
        dateOfBirth: new Date('1997-06-05'),
        gender: 'Female',
        instagramHandle: '@zara.designs',
        website: 'https://zaradesigns.co',
      },
      location: {
        currentCity: 'Bangsar',
        countryOfResidence: 'Malaysia',
        nationality: 'Malaysian',
        timezone: 'Asia/Kuala_Lumpur',
        preferredLanguage: 'en',
        currency: 'MYR',
      },
      security: {
        emailVerifiedAt: new Date(),
        lastLoginAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
      },
    },
    
    // Student
    {
      email: 'ryan.student@berseapp.com',
      username: 'ryanstudent',
      password: defaultPassword,
      fullName: 'Ryan Tan',
      phone: '+60123456796',
      role: UserRole.GENERAL_USER,
      status: UserStatus.ACTIVE,
      totalPoints: 280,
      trustScore: 55.0,
      trustLevel: 'starter',
      profile: {
        displayName: 'Ryan',
        bio: 'Business student at UM. Interested in entrepreneurship and startups. Looking to network and learn from experienced professionals. Also love basketball!',
        shortBio: 'Business student & aspiring entrepreneur',
        profilePicture: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop',
        interests: ['business', 'entrepreneurship', 'basketball', 'networking', 'startups'],
        languages: ['en', 'zh', 'ms'],
        profession: 'Student',
        dateOfBirth: new Date('2002-12-10'),
        gender: 'Male',
      },
      location: {
        currentCity: 'Kuala Lumpur',
        countryOfResidence: 'Malaysia',
        nationality: 'Malaysian',
        timezone: 'Asia/Kuala_Lumpur',
        preferredLanguage: 'en',
        currency: 'MYR',
      },
      security: {
        emailVerifiedAt: new Date(),
        lastLoginAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
      },
    },
    
    // Expat
    {
      email: 'emma.expat@berseapp.com',
      username: 'emmaexpat',
      password: defaultPassword,
      fullName: 'Emma Wilson',
      phone: '+60123456797',
      role: UserRole.GENERAL_USER,
      status: UserStatus.ACTIVE,
      totalPoints: 310,
      trustScore: 58.0,
      trustLevel: 'starter',
      profile: {
        displayName: 'Emma',
        bio: 'British expat in KL working in education. New to the city and excited to make friends! Love exploring markets, trying local food, and weekend hikes.',
        shortBio: 'Expat teacher & explorer',
        profilePicture: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop',
        interests: ['education', 'culture', 'hiking', 'food', 'languages'],
        languages: ['en', 'fr'],
        profession: 'English Teacher',
        dateOfBirth: new Date('1991-08-14'),
        gender: 'Female',
        travelStyle: 'Cultural Explorer',
      },
      location: {
        currentCity: 'Kuala Lumpur',
        countryOfResidence: 'Malaysia',
        nationality: 'British',
        originallyFrom: 'London',
        timezone: 'Asia/Kuala_Lumpur',
        preferredLanguage: 'en',
        currency: 'MYR',
      },
      security: {
        emailVerifiedAt: new Date(),
        lastLoginAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
      },
    },
    
    // Entrepreneur
    {
      email: 'jason.biz@berseapp.com',
      username: 'jasonbiz',
      password: defaultPassword,
      fullName: 'Jason Khoo',
      phone: '+60123456798',
      role: UserRole.GENERAL_USER,
      status: UserStatus.ACTIVE,
      totalPoints: 550,
      trustScore: 70.0,
      trustLevel: 'trusted',
      profile: {
        displayName: 'Jason',
        bio: 'Founder of a sustainable fashion startup. Passionate about social impact and connecting with like-minded entrepreneurs. Always happy to mentor or collaborate!',
        shortBio: 'Social entrepreneur',
        profilePicture: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop',
        interests: ['entrepreneurship', 'sustainability', 'fashion', 'social_impact', 'networking'],
        languages: ['en', 'zh', 'ms'],
        profession: 'Entrepreneur',
        dateOfBirth: new Date('1989-03-25'),
        gender: 'Male',
        instagramHandle: '@jason.sustainable',
      },
      location: {
        currentCity: 'Kuala Lumpur',
        countryOfResidence: 'Malaysia',
        nationality: 'Malaysian',
        timezone: 'Asia/Kuala_Lumpur',
        preferredLanguage: 'en',
        currency: 'MYR',
      },
      security: {
        emailVerifiedAt: new Date(),
        phoneVerifiedAt: new Date(),
        lastLoginAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      },
      serviceProfile: {
        isHostCertified: false,
        isHostAvailable: false,
        isGuideAvailable: true,
        guideDescription: 'Business mentorship and startup consultations',
      },
    },
    
    // Musician
    {
      email: 'nina.music@berseapp.com',
      username: 'ninamusic',
      password: defaultPassword,
      fullName: 'Nina Rodriguez',
      phone: '+60123456799',
      role: UserRole.GENERAL_USER,
      status: UserStatus.ACTIVE,
      totalPoints: 340,
      trustScore: 60.0,
      trustLevel: 'trusted',
      profile: {
        displayName: 'Nina',
        bio: 'Jazz vocalist and guitar player. Perform at local venues and organize open mic nights. Music brings us together! 🎵',
        shortBio: 'Jazz vocalist & guitarist',
        profilePicture: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&h=400&fit=crop',
        interests: ['music', 'jazz', 'guitar', 'singing', 'performance'],
        languages: ['en', 'es', 'ms'],
        profession: 'Musician',
        dateOfBirth: new Date('1994-07-19'),
        gender: 'Female',
        instagramHandle: '@nina.jazz.kl',
      },
      location: {
        currentCity: 'Damansara',
        countryOfResidence: 'Malaysia',
        nationality: 'Filipino',
        originallyFrom: 'Manila',
        timezone: 'Asia/Kuala_Lumpur',
        preferredLanguage: 'en',
        currency: 'MYR',
      },
      security: {
        emailVerifiedAt: new Date(),
        lastLoginAt: new Date(Date.now() - 10 * 60 * 60 * 1000),
      },
      serviceProfile: {
        isHostCertified: true,
        isHostAvailable: true,
        isGuideAvailable: false,
        hostDescription: 'Host open mic nights and music jams',
      },
    },
    
    // Photographer
    {
      email: 'kevin.photo@berseapp.com',
      username: 'kevinphoto',
      password: defaultPassword,
      fullName: 'Kevin Ng',
      phone: '+60123456800',
      role: UserRole.GENERAL_USER,
      status: UserStatus.ACTIVE,
      totalPoints: 390,
      trustScore: 64.0,
      trustLevel: 'trusted',
      profile: {
        displayName: 'Kevin',
        bio: 'Professional photographer specializing in portraits and events. Organizing photo walks around KL. Happy to share tips or do collabs! 📸',
        shortBio: 'Professional photographer',
        profilePicture: 'https://images.unsplash.com/photo-1557862921-37829c790f19?w=400&h=400&fit=crop',
        interests: ['photography', 'art', 'travel', 'technology', 'videography'],
        languages: ['en', 'zh'],
        profession: 'Photographer',
        dateOfBirth: new Date('1990-11-30'),
        gender: 'Male',
        instagramHandle: '@kevin.captures.kl',
        website: 'https://kevinngphoto.com',
      },
      location: {
        currentCity: 'Ampang',
        countryOfResidence: 'Malaysia',
        nationality: 'Malaysian',
        timezone: 'Asia/Kuala_Lumpur',
        preferredLanguage: 'en',
        currency: 'MYR',
      },
      security: {
        emailVerifiedAt: new Date(),
        phoneVerifiedAt: new Date(),
        lastLoginAt: new Date(Date.now() - 7 * 60 * 60 * 1000),
      },
      serviceProfile: {
        isHostCertified: false,
        isHostAvailable: false,
        isGuideAvailable: true,
        guideDescription: 'Photography services and photo tours',
      },
    },
    
    // Parent/Community Organizer
    {
      email: 'priya.community@berseapp.com',
      username: 'priyacommunity',
      password: defaultPassword,
      fullName: 'Priya Sharma',
      phone: '+60123456801',
      role: UserRole.GENERAL_USER,
      status: UserStatus.ACTIVE,
      totalPoints: 460,
      trustScore: 67.0,
      trustLevel: 'trusted',
      profile: {
        displayName: 'Priya',
        bio: 'Mom of two and community organizer. Running a parent support group and organizing family-friendly events. Building connections that support our families!',
        shortBio: 'Parent & community organizer',
        profilePicture: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop',
        interests: ['parenting', 'community', 'education', 'family', 'volunteering'],
        languages: ['en', 'hi', 'ms'],
        profession: 'Community Organizer',
        dateOfBirth: new Date('1987-04-08'),
        gender: 'Female',
      },
      location: {
        currentCity: 'Subang Jaya',
        countryOfResidence: 'Malaysia',
        nationality: 'Indian',
        timezone: 'Asia/Kuala_Lumpur',
        preferredLanguage: 'en',
        currency: 'MYR',
      },
      security: {
        emailVerifiedAt: new Date(),
        phoneVerifiedAt: new Date(),
        lastLoginAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      serviceProfile: {
        isHostCertified: true,
        isHostAvailable: true,
        isGuideAvailable: false,
        hostDescription: 'Host family-friendly events and parent meetups',
      },
    },
    
    // Gamer
    {
      email: 'mike.gamer@berseapp.com',
      username: 'mikegamer',
      password: defaultPassword,
      fullName: 'Mike Lee',
      phone: '+60123456802',
      role: UserRole.GENERAL_USER,
      status: UserStatus.ACTIVE,
      totalPoints: 290,
      trustScore: 56.0,
      trustLevel: 'starter',
      profile: {
        displayName: 'Mike',
        bio: 'Competitive gamer and esports enthusiast. Organizing gaming tournaments and LAN parties. Always looking for teammates and fellow gamers! 🎮',
        shortBio: 'Competitive gamer',
        profilePicture: 'https://images.unsplash.com/photo-1542178243-bc20204b769f?w=400&h=400&fit=crop',
        interests: ['gaming', 'esports', 'technology', 'anime', 'streaming'],
        languages: ['en', 'zh'],
        profession: 'Content Creator',
        dateOfBirth: new Date('1998-09-22'),
        gender: 'Male',
        instagramHandle: '@mike.games.kl',
      },
      location: {
        currentCity: 'Cheras',
        countryOfResidence: 'Malaysia',
        nationality: 'Malaysian',
        timezone: 'Asia/Kuala_Lumpur',
        preferredLanguage: 'en',
        currency: 'MYR',
      },
      security: {
        emailVerifiedAt: new Date(),
        lastLoginAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      },
      serviceProfile: {
        isHostCertified: false,
        isHostAvailable: true,
        isGuideAvailable: false,
        hostDescription: 'Host gaming tournaments and casual game nights',
      },
    },
    
    // Wellness Coach
    {
      email: 'sophia.wellness@berseapp.com',
      username: 'sophiawellness',
      password: defaultPassword,
      fullName: 'Sophia Tan',
      phone: '+60123456803',
      role: UserRole.GENERAL_USER,
      status: UserStatus.ACTIVE,
      totalPoints: 430,
      trustScore: 66.0,
      trustLevel: 'trusted',
      profile: {
        displayName: 'Sophia',
        bio: 'Certified wellness coach and nutritionist. Helping people live healthier, balanced lives. Offering workshops on mindfulness, nutrition, and holistic wellness 🌿',
        shortBio: 'Wellness coach & nutritionist',
        profilePicture: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop',
        interests: ['wellness', 'nutrition', 'mindfulness', 'yoga', 'health'],
        languages: ['en', 'zh', 'ms'],
        profession: 'Wellness Coach',
        dateOfBirth: new Date('1990-05-17'),
        gender: 'Female',
        instagramHandle: '@sophia.wellness.kl',
        website: 'https://sophiawellness.co',
      },
      location: {
        currentCity: 'TTDI',
        countryOfResidence: 'Malaysia',
        nationality: 'Malaysian',
        timezone: 'Asia/Kuala_Lumpur',
        preferredLanguage: 'en',
        currency: 'MYR',
      },
      security: {
        emailVerifiedAt: new Date(),
        phoneVerifiedAt: new Date(),
        lastLoginAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
      },
      serviceProfile: {
        isHostCertified: true,
        isHostAvailable: true,
        isGuideAvailable: true,
        hostDescription: 'Host wellness workshops and mindfulness sessions',
        guideDescription: 'One-on-one wellness coaching and nutrition consultations',
      },
    },
  ];

  const createdUsers = [];
  for (const userData of usersData) {
    const { profile, location, security, serviceProfile, ...userCore } = userData;
    
    const user = await prisma.user.create({
      data: {
        ...userCore,
        profile: profile ? { create: profile } : undefined,
        location: location ? { create: location } : undefined,
        security: security ? { create: security } : undefined,
        privacy: {
          create: {
            profileVisibility: 'public',
            searchableByEmail: true,
            searchableByPhone: true,
            consentToDataProcessing: true,
          },
        },
        preferences: {
          create: {
            darkMode: Math.random() > 0.5,
          },
        },
        metadata: {
          create: {
            referralCode: `REF${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
            referralSource: 'seed',
          },
        },
        serviceProfile: serviceProfile ? { create: serviceProfile } : undefined,
      },
      include: {
        profile: true,
        location: true,
        security: true,
        metadata: true,
      },
    });
    
    createdUsers.push(user);
  }

  console.log(`✅ ${createdUsers.length} enhanced test users created successfully`);

  // Create auth identities
  for (const user of createdUsers) {
    await prisma.authIdentity.create({
      data: {
        userId: user.id,
        provider: 'password',
        providerUid: user.email || user.phone || user.username || '',
        email: user.email,
      },
    });
  }
  console.log('✅ Auth identities created');

  // Create sample refresh tokens for active users
  for (let i = 0; i < Math.min(5, createdUsers.length); i++) {
    const user = createdUsers[i];
    await prisma.refreshToken.create({
      data: {
        tokenHash: `refresh_hash_${user.id}_${Date.now()}`,
        tokenFamily: `family_${user.id}`,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        isRevoked: false,
      },
    });
  }
  console.log('✅ Sample refresh tokens created');

  return createdUsers;
}

async function main() {
  const users = await seedEnhancedUsers();
  
  console.log('\n' + '='.repeat(70));
  console.log('🔐 TEST USER CREDENTIALS');
  console.log('='.repeat(70));
  console.log('\nAll passwords: password123 (except admin: admin123)\n');
  console.log('Email                              | Name                | Trust Score');
  console.log('-'.repeat(70));
  
  const usersInfo = [
    { email: 'admin@berseapp.com', name: 'Admin User', trust: 95, password: 'admin123' },
    { email: 'sarah.host@berseapp.com', name: 'Sarah Ahmad', trust: 88, password: 'password123' },
    { email: 'alex.travel@berseapp.com', name: 'Alex Chen', trust: 75, password: 'password123' },
    { email: 'maya.food@berseapp.com', name: 'Maya Patel', trust: 72, password: 'password123' },
    { email: 'david.tech@berseapp.com', name: 'David Lim', trust: 68, password: 'password123' },
    { email: 'lisa.fitness@berseapp.com', name: 'Lisa Wong', trust: 65, password: 'password123' },
    { email: 'zara.art@berseapp.com', name: 'Zara Ibrahim', trust: 62, password: 'password123' },
    { email: 'ryan.student@berseapp.com', name: 'Ryan Tan', trust: 55, password: 'password123' },
    { email: 'emma.expat@berseapp.com', name: 'Emma Wilson', trust: 58, password: 'password123' },
    { email: 'jason.biz@berseapp.com', name: 'Jason Khoo', trust: 70, password: 'password123' },
    { email: 'nina.music@berseapp.com', name: 'Nina Rodriguez', trust: 60, password: 'password123' },
    { email: 'kevin.photo@berseapp.com', name: 'Kevin Ng', trust: 64, password: 'password123' },
    { email: 'priya.community@berseapp.com', name: 'Priya Sharma', trust: 67, password: 'password123' },
    { email: 'mike.gamer@berseapp.com', name: 'Mike Lee', trust: 56, password: 'password123' },
    { email: 'sophia.wellness@berseapp.com', name: 'Sophia Tan', trust: 66, password: 'password123' },
  ];
  
  usersInfo.forEach(u => {
    console.log(`${u.email.padEnd(35)} | ${u.name.padEnd(20)} | ${u.trust}`);
  });
  
  console.log('\n' + '='.repeat(70));
  console.log('✅ Enhanced user seed complete!');
  console.log('='.repeat(70) + '\n');
}

if (require.main === module) {
  main()
    .catch((e) => {
      console.error('❌ Enhanced user seed failed:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
