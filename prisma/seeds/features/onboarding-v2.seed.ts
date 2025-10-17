import { PrismaClient, UserSetupScreenType } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function seedOnboardingScreens() {
  console.log('🌱 Seeding onboarding screens...');

  // ============================================================================
  // APP PREVIEW SCREENS (Pre-Authentication)
  // ============================================================================
  
  const appPreviewScreens = [
    {
      id: crypto.randomUUID(),
      screenOrder: 1,
      title: 'Welcome to Berse',
      subtitle: 'Connect with verified, trusted people',
      description: 'Berse is a community-driven platform where real connections matter. Join thousands of verified members building meaningful relationships.',
      imageUrl: 'https://cdn.pixabay.com/photo/2021/10/11/23/49/app-6702045_1280.png',
      iconName: 'handshake',
      ctaText: 'Next',
      ctaAction: 'next',
      backgroundColor: '#4F46E5',
      textColor: '#FFFFFF',
      isSkippable: false,
      isActive: true,
    },
    {
      id: crypto.randomUUID(),
      screenOrder: 2,
      title: 'Trust Through Vouches',
      subtitle: 'Build credibility with community vouches',
      description: 'Get vouched for by your connections and community members. Higher trust scores unlock exclusive events and opportunities.',
      imageUrl: 'https://cdn.pixabay.com/photo/2020/07/08/04/12/work-5382501_1280.jpg',
      iconName: 'shield-check',
      ctaText: 'Next',
      ctaAction: 'next',
      backgroundColor: '#10B981',
      textColor: '#FFFFFF',
      isSkippable: true,
      isActive: true,
    },
    {
      id: crypto.randomUUID(),
      screenOrder: 3,
      title: 'Discover Events',
      subtitle: 'Join curated experiences',
      description: 'Find and attend exclusive events, meetups, and activities. Connect with like-minded people in your city and beyond.',
      imageUrl: 'https://cdn.pixabay.com/photo/2016/11/23/15/48/audience-1853662_1280.jpg',
      iconName: 'calendar',
      ctaText: 'Next',
      ctaAction: 'next',
      backgroundColor: '#F59E0B',
      textColor: '#FFFFFF',
      isSkippable: true,
      isActive: true,
    },
    {
      id: crypto.randomUUID(),
      screenOrder: 4,
      title: 'Ready to Join?',
      subtitle: 'Create your account in seconds',
      description: 'Sign up now to start building your trusted network and discover amazing events near you.',
      imageUrl: 'https://cdn.pixabay.com/photo/2018/03/10/12/00/teamwork-3213924_1280.jpg',
      iconName: 'rocket',
      ctaText: 'Get Started',
      ctaAction: 'get_started',
      backgroundColor: '#8B5CF6',
      textColor: '#FFFFFF',
      isSkippable: false,
      isActive: true,
    },
  ];

  console.log('Creating app preview screens...');
  for (const screen of appPreviewScreens) {
    await prisma.appPreviewScreen.upsert({
      where: { id: screen.id },
      update: screen,
      create: screen,
    });
  }
  console.log(`✅ Created ${appPreviewScreens.length} app preview screens`);

  // ============================================================================
  // USER SETUP SCREENS (Post-Authentication)
  // ============================================================================

  const userSetupScreens = [
    {
      id: crypto.randomUUID(),
      screenOrder: 1,
      screenType: UserSetupScreenType.PROFILE,
      title: 'Complete Your Profile',
      subtitle: 'Help others get to know you',
      description: 'Add your photo, bio, and interests. A complete profile gets 3x more connection requests and event invitations.',
      imageUrl: 'https://cdn.pixabay.com/photo/2017/06/13/22/42/profile-2398782_1280.png',
      iconName: 'user-circle',
      ctaText: 'Complete Profile',
      ctaAction: 'complete_profile',
      ctaUrl: '/profile/edit',
      backgroundColor: '#FFFFFF',
      textColor: '#000000',
      isRequired: true,
      isSkippable: false,
      requiredFields: ['profilePicture', 'bio', 'interests'],
      targetAudience: 'new_users',
      isActive: true,
    },
    {
      id: crypto.randomUUID(),
      screenOrder: 2,
      screenType: UserSetupScreenType.NETWORK,
      title: 'Build Your Trust Network',
      subtitle: 'Connect with people you know',
      description: 'Import contacts, connect with friends, and request vouches from people who can verify your identity and character.',
      imageUrl: 'https://cdn.pixabay.com/photo/2020/05/18/16/17/social-media-5187243_1280.png',
      iconName: 'users',
      ctaText: 'Add Connections',
      ctaAction: 'add_connections',
      ctaUrl: '/connections/add',
      backgroundColor: '#FFFFFF',
      textColor: '#000000',
      isRequired: false,
      isSkippable: true,
      requiredFields: [],
      targetAudience: 'new_users',
      isActive: true,
    },
    {
      id: crypto.randomUUID(),
      screenOrder: 3,
      screenType: UserSetupScreenType.COMMUNITY,
      title: 'Join Communities',
      subtitle: 'Find your tribe',
      description: 'Join communities based on your interests, location, or profession. Get access to exclusive events and connect with members.',
      imageUrl: 'https://cdn.pixabay.com/photo/2017/02/12/21/29/false-2061132_1280.png',
      iconName: 'users-group',
      ctaText: 'Browse Communities',
      ctaAction: 'browse_communities',
      ctaUrl: '/communities',
      backgroundColor: '#FFFFFF',
      textColor: '#000000',
      isRequired: false,
      isSkippable: true,
      requiredFields: [],
      targetAudience: 'all',
      isActive: true,
    },
    {
      id: crypto.randomUUID(),
      screenOrder: 4,
      screenType: UserSetupScreenType.PREFERENCES,
      title: 'Notification Preferences',
      subtitle: 'Stay in the loop, your way',
      description: 'Choose how and when you want to be notified about events, connections, messages, and community updates.',
      imageUrl: 'https://cdn.pixabay.com/photo/2016/12/21/17/11/signe-1923369_1280.png',
      iconName: 'bell',
      ctaText: 'Set Preferences',
      ctaAction: 'set_preferences',
      ctaUrl: '/settings/notifications',
      backgroundColor: '#FFFFFF',
      textColor: '#000000',
      isRequired: false,
      isSkippable: true,
      requiredFields: [],
      targetAudience: 'all',
      isActive: true,
    },
    {
      id: crypto.randomUUID(),
      screenOrder: 5,
      screenType: UserSetupScreenType.TUTORIAL,
      title: 'Discover Features',
      subtitle: 'Get the most out of Berse',
      description: 'Take a quick tour of key features: event discovery, trust scores, community vouches, and the points system.',
      imageUrl: 'https://cdn.pixabay.com/photo/2018/02/08/22/27/flower-3138556_1280.jpg',
      iconName: 'sparkles',
      ctaText: 'Take Tour',
      ctaAction: 'take_tour',
      backgroundColor: '#FFFFFF',
      textColor: '#000000',
      isRequired: false,
      isSkippable: true,
      requiredFields: [],
      targetAudience: 'new_users',
      isActive: true,
    },
    {
      id: crypto.randomUUID(),
      screenOrder: 6,
      screenType: UserSetupScreenType.VERIFICATION,
      title: 'Verify Your Identity',
      subtitle: 'Unlock full access',
      description: 'Complete email verification and optionally add phone verification for higher trust score and access to premium features.',
      imageUrl: 'https://cdn.pixabay.com/photo/2016/12/27/21/03/check-mark-1935966_1280.png',
      iconName: 'shield-check',
      ctaText: 'Verify Now',
      ctaAction: 'verify',
      ctaUrl: '/settings/verification',
      backgroundColor: '#FFFFFF',
      textColor: '#000000',
      isRequired: false,
      isSkippable: true,
      requiredFields: [],
      targetAudience: 'all',
      isActive: true,
    },
    {
      id: crypto.randomUUID(),
      screenOrder: 7,
      screenType: UserSetupScreenType.TUTORIAL,
      title: 'All Set! 🎉',
      subtitle: 'Welcome to the Berse community',
      description: 'Your profile is ready! Start exploring events, connecting with people, and building your trust network.',
      imageUrl: 'https://cdn.pixabay.com/photo/2017/01/13/04/56/celebration-1977180_1280.png',
      iconName: 'check-circle',
      ctaText: 'Start Exploring',
      ctaAction: 'start_exploring',
      ctaUrl: '/discover',
      backgroundColor: '#10B981',
      textColor: '#FFFFFF',
      isRequired: false,
      isSkippable: false,
      requiredFields: [],
      targetAudience: 'all',
      isActive: true,
    },
  ];

  console.log('Creating user setup screens...');
  for (const screen of userSetupScreens) {
    await prisma.userSetupScreen.upsert({
      where: { id: screen.id },
      update: screen,
      create: screen,
    });
  }
  console.log(`✅ Created ${userSetupScreens.length} user setup screens`);

  console.log('✨ Onboarding screens seeded successfully!');
}

// Run if called directly
if (require.main === module) {
  seedOnboardingScreens()
    .catch((e) => {
      console.error('❌ Error seeding onboarding screens:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

export default seedOnboardingScreens;
