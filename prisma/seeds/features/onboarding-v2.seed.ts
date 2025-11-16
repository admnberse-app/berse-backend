import { PrismaClient, UserSetupScreenType } from '@prisma/client';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

async function seedOnboardingScreens() {
  console.log('🌱 Seeding onboarding screens...');

  // ============================================================================
  // APP PREVIEW SCREENS (Pre-Authentication)
  // ============================================================================
  
  const appPreviewScreens = [
    {
      screenOrder: 1,
      title: 'Welcome to Berse',
      subtitle: 'Connect with verified, trusted people',
      description: 'Berse is a community-driven platform where real connections matter. Join thousands of verified members building meaningful relationships.',
      imageUrl: 'https://cdn.pixabay.com/photo/2021/10/11/23/49/app-6702045_1280.png',
      iconName: 'handshake',
      // Legacy fields for backward compatibility
      ctaText: 'Learn More',
      ctaAction: 'next',
      // New dual button support - single button only
      primaryButton: {
        text: 'Learn More',
        action: 'next',
        style: 'primary',
        icon: 'arrow-right',
      },
      secondaryButton: null,
      backgroundColor: '#4F46E5',
      textColor: '#FFFFFF',
      isSkippable: false,
      isActive: true,
    },
    {
      screenOrder: 2,
      title: 'Trust Through Vouches',
      subtitle: 'Build credibility with community vouches',
      description: 'Get vouched for by your connections and community members. Higher trust scores unlock exclusive events and opportunities.',
      imageUrl: 'https://cdn.pixabay.com/photo/2020/07/08/04/12/work-5382501_1280.jpg',
      iconName: 'shield-check',
      ctaText: 'Next',
      ctaAction: 'next',
      primaryButton: {
        text: 'Continue',
        action: 'next',
        style: 'primary',
        icon: 'arrow-right',
      },
      secondaryButton: {
        text: 'Skip',
        action: 'skip',
        style: 'text',
        icon: 'forward',
      },
      backgroundColor: '#10B981',
      textColor: '#FFFFFF',
      isSkippable: true,
      isActive: true,
    },
    {
      screenOrder: 3,
      title: 'Discover Events',
      subtitle: 'Join curated experiences',
      description: 'Find and attend exclusive events, meetups, and activities. Connect with like-minded people in your city and beyond.',
      imageUrl: 'https://cdn.pixabay.com/photo/2016/11/23/15/48/audience-1853662_1280.jpg',
      iconName: 'calendar',
      ctaText: 'Next',
      ctaAction: 'next',
      primaryButton: {
        text: 'Next',
        action: 'next',
        style: 'primary',
        icon: 'arrow-right',
      },
      secondaryButton: {
        text: 'Skip',
        action: 'skip',
        style: 'text',
        icon: 'forward',
      },
      backgroundColor: '#F59E0B',
      textColor: '#FFFFFF',
      isSkippable: true,
      isActive: true,
    },
    {
      screenOrder: 4,
      title: 'Ready to Join?',
      subtitle: 'Create your account in seconds',
      description: 'Sign up now to start building your trusted network and discover amazing events near you.',
      imageUrl: 'https://cdn.pixabay.com/photo/2018/03/10/12/00/teamwork-3213924_1280.jpg',
      iconName: 'rocket',
      ctaText: 'Get Started',
      ctaAction: 'get_started',
      primaryButton: {
        text: 'Get Started',
        action: 'get_started',
        style: 'primary',
        icon: 'rocket',
      },
      secondaryButton: {
        text: 'Sign In',
        action: 'sign_in',
        style: 'secondary',
        icon: 'login',
      },
      backgroundColor: '#8B5CF6',
      textColor: '#FFFFFF',
      isSkippable: false,
      isActive: true,
    },
  ];

  console.log('Creating app preview screens...');
  for (const screen of appPreviewScreens) {
    // Delete existing screen with same order if exists
    await prisma.appPreviewScreen.deleteMany({
      where: { screenOrder: screen.screenOrder }
    });
    // Create new screen
    await prisma.appPreviewScreen.create({
      data: screen,
    });
  }
  console.log(`✅ Created ${appPreviewScreens.length} app preview screens`);

  // ============================================================================
  // USER SETUP SCREENS (Post-Authentication)
  // ============================================================================

  const userSetupScreens = [
    {
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
      screenOrder: 4,
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
    // Delete existing screen with same order if exists
    await prisma.userSetupScreen.deleteMany({
      where: { screenOrder: screen.screenOrder }
    });
    // Create new screen
    await prisma.userSetupScreen.create({
      data: screen,
    });
  }
  console.log(`✅ Created ${userSetupScreens.length} user setup screens`);

  console.log('✨ Onboarding screens seeded successfully!');
}

// Export for use in production-seed.ts
export default seedOnboardingScreens;
export { seedOnboardingScreens };

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
