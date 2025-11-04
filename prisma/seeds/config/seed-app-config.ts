// Load environment from parent directory
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

import { PrismaClient, AppPlatform, LegalDocumentType, AnnouncementPriority, MaintenanceStatus, AppNoticeType } from '@prisma/client';

const prisma = new PrismaClient();

async function seedAppConfiguration() {
  console.log('🎨 Starting App Configuration & Content Management seed...\n');

  // ===================================
  // 1. APP CONFIG
  // ===================================
  console.log('⚙️  Seeding app configurations...');
  
  const appConfigs = [
    {
      configKey: 'min_supported_version_ios',
      configValue: '1.0.0',
      dataType: 'string',
      category: 'general',
      description: 'Minimum supported iOS app version',
      isPublic: true,
      isEditable: true,
    },
    {
      configKey: 'min_supported_version_android',
      configValue: '1.0.0',
      dataType: 'string',
      category: 'general',
      description: 'Minimum supported Android app version',
      isPublic: true,
      isEditable: true,
    },
    {
      configKey: 'maintenance_mode',
      configValue: 'false',
      dataType: 'boolean',
      category: 'general',
      description: 'Enable/disable maintenance mode',
      isPublic: true,
      isEditable: true,
    },
    {
      configKey: 'force_update_ios',
      configValue: 'false',
      dataType: 'boolean',
      category: 'general',
      description: 'Force iOS users to update',
      isPublic: true,
      isEditable: true,
    },
    {
      configKey: 'force_update_android',
      configValue: 'false',
      dataType: 'boolean',
      category: 'general',
      description: 'Force Android users to update',
      isPublic: true,
      isEditable: true,
    },
    {
      configKey: 'api_base_url',
      configValue: 'https://api.berse.app',
      dataType: 'string',
      category: 'api',
      description: 'Base URL for API endpoints',
      isPublic: true,
      isEditable: true,
    },
    {
      configKey: 'support_email',
      configValue: 'support@berse.app',
      dataType: 'string',
      category: 'general',
      description: 'Support email address',
      isPublic: true,
      isEditable: true,
    },
    {
      configKey: 'support_phone',
      configValue: '+60123456789',
      dataType: 'string',
      category: 'general',
      description: 'Support phone number',
      isPublic: true,
      isEditable: true,
    },
    {
      configKey: 'max_upload_size_mb',
      configValue: '10',
      dataType: 'number',
      category: 'features',
      description: 'Maximum file upload size in MB',
      isPublic: true,
      isEditable: true,
    },
    {
      configKey: 'enable_dark_mode',
      configValue: 'true',
      dataType: 'boolean',
      category: 'features',
      description: 'Enable dark mode feature',
      isPublic: true,
      isEditable: true,
    },
    {
      configKey: 'enable_push_notifications',
      configValue: 'true',
      dataType: 'boolean',
      category: 'features',
      description: 'Enable push notifications',
      isPublic: true,
      isEditable: true,
    },
    {
      configKey: 'social_links',
      configValue: JSON.stringify({
        instagram: 'https://instagram.com/berse.app',
        facebook: 'https://facebook.com/berse.app',
        twitter: 'https://twitter.com/berse_app',
        linkedin: 'https://linkedin.com/company/berse-app',
      }),
      dataType: 'json',
      category: 'general',
      description: 'Social media links',
      isPublic: true,
      isEditable: true,
    },
  ];

  for (const config of appConfigs) {
    await prisma.appConfig.upsert({
      where: { configKey: config.configKey },
      update: config,
      create: config,
    });
  }
  console.log(`✅ Created ${appConfigs.length} app configurations`);

  // ===================================
  // 2. ONBOARDING SCREENS
  // ===================================
  console.log('\n📱 Seeding onboarding screens...');
  
  await prisma.onboardingScreen.deleteMany({});
  
  const onboardingScreens = [
    {
      screenOrder: 1,
      title: 'Welcome to Berse',
      subtitle: 'Connect with verified, trusted people',
      description: 'Join a community where every connection is built on trust and real relationships.',
      imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&h=600&fit=crop&crop=center',
      ctaText: 'Next',
      ctaAction: 'next',
      backgroundColor: '#4F46E5',
      isSkippable: true,
      isActive: true,
      targetAudience: 'all',
    },
    {
      screenOrder: 2,
      title: 'Build Your Trust Network',
      subtitle: 'Get vouched by trusted members',
      description: 'Our unique vouch system ensures you connect with genuine people. Get vouched and increase your trust score!',
      imageUrl: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop&crop=center',
      ctaText: 'Next',
      ctaAction: 'next',
      backgroundColor: '#10B981',
      isSkippable: true,
      isActive: true,
      targetAudience: 'all',
    },
    {
      screenOrder: 3,
      title: 'Discover Amazing Events',
      subtitle: 'Join events that matter',
      description: 'From sports to cultural gatherings, find events that match your interests and meet like-minded people.',
      imageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=600&fit=crop&crop=center',
      ctaText: 'Next',
      ctaAction: 'next',
      backgroundColor: '#F59E0B',
      isSkippable: true,
      isActive: true,
      targetAudience: 'all',
    },
    {
      screenOrder: 4,
      title: 'Join Communities',
      subtitle: 'Find your tribe',
      description: 'Connect with communities that share your passions - from foodies to tech enthusiasts!',
      imageUrl: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&h=600&fit=crop&crop=center',
      ctaText: 'Next',
      ctaAction: 'next',
      backgroundColor: '#8B5CF6',
      isSkippable: true,
      isActive: true,
      targetAudience: 'all',
    },
    {
      screenOrder: 5,
      title: "Let's Get Started!",
      subtitle: 'Complete your profile',
      description: 'Set up your profile to start connecting with amazing people near you.',
      imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop&crop=center',
      ctaText: 'Get Started',
      ctaAction: 'complete',
      backgroundColor: '#EC4899',
      isSkippable: false,
      isActive: true,
      targetAudience: 'all',
    },
  ];

  for (const screen of onboardingScreens) {
    await prisma.onboardingScreen.create({ data: screen });
  }
  console.log(`✅ Created ${onboardingScreens.length} onboarding screens`);

  // ===================================
  // 3. APP VERSIONS
  // ===================================
  console.log('\n📦 Seeding app versions...');
  
  await prisma.appVersion.deleteMany({});
  
  const appVersions = [
    {
      versionNumber: '1.0.0',
      versionCode: 1,
      platform: AppPlatform.IOS,
      releaseDate: new Date('2025-01-01'),
      releaseNotes: `# Version 1.0.0 - Initial Release 🎉

## 🆕 New Features
- Complete user profile system
- Trust & vouch system
- Event discovery and RSVP
- Community groups
- Direct messaging
- Points & rewards system
- Marketplace listings

## 🎨 Design
- Beautiful, modern UI
- Dark mode support
- Smooth animations

## 🔐 Security
- Two-factor authentication
- End-to-end encrypted messaging
- Verified profiles`,
      releaseType: 'stable',
      isForceUpdate: false,
      isActive: true,
      isCurrent: true,
      storeUrl: 'https://apps.apple.com/app/berse',
    },
    {
      versionNumber: '1.0.0',
      versionCode: 1,
      platform: AppPlatform.ANDROID,
      releaseDate: new Date('2025-01-01'),
      releaseNotes: `# Version 1.0.0 - Initial Release 🎉

## 🆕 New Features
- Complete user profile system
- Trust & vouch system
- Event discovery and RSVP
- Community groups
- Direct messaging
- Points & rewards system
- Marketplace listings

## 🎨 Design
- Material Design 3
- Dark mode support
- Smooth animations

## 🔐 Security
- Two-factor authentication
- End-to-end encrypted messaging
- Verified profiles`,
      releaseType: 'stable',
      isForceUpdate: false,
      isActive: true,
      isCurrent: true,
      storeUrl: 'https://play.google.com/store/apps/details?id=com.berse.app',
    },
    {
      versionNumber: '1.1.0',
      versionCode: 2,
      platform: AppPlatform.IOS,
      releaseDate: new Date('2025-02-01'),
      releaseNotes: `# Version 1.1.0 - Performance & Features Update

## 🆕 New Features
- Travel logbook for documenting trips
- Service bookings (guides, homestays)
- Enhanced search filters
- Event ticket QR codes

## 🐛 Bug Fixes
- Fixed notification delays
- Improved image upload stability
- Fixed dark mode inconsistencies

## ⚡ Improvements
- 30% faster app launch
- Reduced data usage
- Better offline support`,
      releaseType: 'stable',
      isForceUpdate: false,
      isActive: true,
      isCurrent: false,
      storeUrl: 'https://apps.apple.com/app/berse',
    },
    {
      versionNumber: '1.1.0',
      versionCode: 2,
      platform: AppPlatform.ANDROID,
      releaseDate: new Date('2025-02-01'),
      releaseNotes: `# Version 1.1.0 - Performance & Features Update

## 🆕 New Features
- Travel logbook for documenting trips
- Service bookings (guides, homestays)
- Enhanced search filters
- Event ticket QR codes

## 🐛 Bug Fixes
- Fixed notification delays
- Improved image upload stability
- Fixed dark mode inconsistencies

## ⚡ Improvements
- 30% faster app launch
- Reduced data usage
- Better offline support`,
      releaseType: 'stable',
      isForceUpdate: false,
      isActive: true,
      isCurrent: false,
      storeUrl: 'https://play.google.com/store/apps/details?id=com.berse.app',
    },
  ];

  for (const version of appVersions) {
    await prisma.appVersion.create({ data: version });
  }
  console.log(`✅ Created ${appVersions.length} app versions`);

  // ===================================
  // 4. LEGAL DOCUMENTS
  // ===================================
  console.log('\n📜 Seeding legal documents...');
  
  await prisma.legalDocument.deleteMany({});
  
  const legalDocuments = [
    {
      documentType: LegalDocumentType.TOS,
      version: '1.0',
      title: 'Terms of Service',
      content: `# Terms of Service

Last Updated: January 1, 2025

## 1. Agreement to Terms

By accessing or using the Berse platform, you agree to be bound by these Terms of Service.

## 2. Description of Service

Berse is a social networking platform that connects people through trust-based relationships, events, and communities.

## 3. User Accounts

### 3.1 Account Creation
- You must provide accurate information
- You must be at least 18 years old
- One account per person

### 3.2 Account Security
- Keep your password secure
- Notify us of unauthorized access
- You are responsible for all activities under your account

## 4. User Content

### 4.1 Your Content
- You retain ownership of content you post
- You grant us license to use, modify, and display your content
- You are responsible for your content

### 4.2 Prohibited Content
- Illegal content
- Hate speech or harassment
- Spam or misleading information
- Impersonation

## 5. Trust & Vouch System

- Vouches must be genuine
- False vouches may result in account suspension
- Trust scores are calculated algorithmically

## 6. Events & Payments

- Event hosts are responsible for their events
- Platform fees apply to paid events
- Refund policies vary by event

## 7. Privacy

Your use is also governed by our Privacy Policy.

## 8. Termination

We may terminate or suspend your account for violations of these terms.

## 9. Limitation of Liability

Berse is provided "as is" without warranties.

## 10. Contact

For questions: support@berse.app`,
      summary: 'Agreement for using Berse platform services',
      effectiveDate: new Date('2025-01-01'),
      isActive: true,
      isCurrent: true,
      requiresAcceptance: true,
    },
    {
      documentType: LegalDocumentType.PRIVACY_POLICY,
      version: '1.0',
      title: 'Privacy Policy',
      content: `# Privacy Policy

Last Updated: January 1, 2025

## 1. Information We Collect

### 1.1 Information You Provide
- Account information (name, email, phone)
- Profile information
- Content you post
- Payment information

### 1.2 Automatically Collected Information
- Device information
- Usage data
- Location data (with permission)
- Cookies and tracking technologies

## 2. How We Use Your Information

- Provide and improve our services
- Personalize your experience
- Send you notifications
- Process payments
- Ensure platform security
- Comply with legal obligations

## 3. Information Sharing

### 3.1 With Other Users
- Your public profile is visible to other users
- Event attendees can see your name and profile

### 3.2 With Third Parties
- Payment processors
- Analytics providers
- Cloud hosting services

### 3.3 Legal Requirements
- Comply with laws
- Respond to legal requests
- Protect rights and safety

## 4. Your Rights

- Access your data
- Correct inaccurate data
- Delete your account
- Export your data
- Opt-out of marketing

## 5. Data Security

We implement security measures to protect your data, but no system is 100% secure.

## 6. International Data Transfers

Your data may be transferred to and processed in other countries.

## 7. Children's Privacy

Our service is not for users under 18.

## 8. Changes to Privacy Policy

We will notify you of significant changes.

## 9. Contact

Privacy concerns: privacy@berse.app`,
      summary: 'How we collect, use, and protect your data',
      effectiveDate: new Date('2025-01-01'),
      isActive: true,
      isCurrent: true,
      requiresAcceptance: true,
    },
    {
      documentType: LegalDocumentType.COMMUNITY_GUIDELINES,
      version: '1.0',
      title: 'Community Guidelines',
      content: `# Community Guidelines

## Our Values

Berse is built on trust, respect, and genuine connections.

## 1. Be Respectful

- Treat others with kindness
- Respect different opinions and backgrounds
- No harassment or bullying

## 2. Be Authentic

- Use your real identity
- Post honest reviews and vouches
- Don't impersonate others

## 3. Be Safe

- Protect your personal information
- Report suspicious behavior
- Meet in public places for first meetings

## 4. Be Constructive

- Provide helpful feedback
- Support other community members
- Share knowledge and experiences

## 5. What's Not Allowed

### Prohibited Behavior
- Hate speech or discrimination
- Sexual harassment
- Threats or violence
- Spam or scams
- Illegal activities

### Prohibited Content
- Explicit sexual content
- Graphic violence
- Promotion of self-harm
- False information

## 6. Consequences

Violations may result in:
- Warning
- Content removal
- Account suspension
- Permanent ban

## 7. Reporting

If you see violations, please report them through the app.

## 8. Questions

community@berse.app`,
      summary: 'Guidelines for respectful community participation',
      effectiveDate: new Date('2025-01-01'),
      isActive: true,
      isCurrent: true,
      requiresAcceptance: false,
    },
    {
      documentType: LegalDocumentType.REFUND_POLICY,
      version: '1.0',
      title: 'Refund Policy',
      content: `# Refund Policy

## Event Tickets

### Cancellation by Organizer
- Full refund if event is canceled
- Refund processed within 5-7 business days

### Cancellation by Attendee
- Refund policy set by event organizer
- Platform fees are non-refundable
- Cancel at least 24 hours before event for refund consideration

## Marketplace Purchases

### Returns
- Contact seller within 48 hours of receipt
- Item must be as described
- Seller determines return policy

### Disputes
- Open dispute within 7 days
- Provide evidence (photos, messages)
- Platform mediation available

## Service Bookings

- Refund policy set by service provider
- Cancel at least 48 hours in advance
- No-shows are non-refundable

## Subscriptions

- Cancel anytime
- No refunds for partial months
- Access continues until period ends

## Processing Time

- Refunds processed within 5-7 business days
- May take additional time for bank processing

## Contact

refunds@berse.app`,
      summary: 'Refund policies for events, purchases, and subscriptions',
      effectiveDate: new Date('2025-01-01'),
      isActive: true,
      isCurrent: true,
      requiresAcceptance: false,
    },
  ];

  for (const document of legalDocuments) {
    await prisma.legalDocument.create({ data: document });
  }
  console.log(`✅ Created ${legalDocuments.length} legal documents`);

  // ===================================
  // 5. ANNOUNCEMENTS
  // ===================================
  console.log('\n📢 Seeding announcements...');
  
  await prisma.announcement.deleteMany({});
  
  const announcements = [
    {
      title: 'Welcome to Berse! 🎉',
      content: `# Welcome to Berse!

We're excited to have you join our community of trusted connections.

## What to do first:
1. ✅ Complete your profile
2. 🤝 Get your first vouch
3. 🎭 Join a community
4. 📅 Attend an event

Let's build something amazing together!`,
      excerpt: 'Get started with Berse - your trust-based social network',
      priority: AnnouncementPriority.HIGH,
      displayType: 'modal',
      targetAudience: 'all',
      targetUserSegment: ['new_users'],
      ctaText: 'Complete Profile',
      ctaAction: 'navigate_to',
      ctaUrl: '/profile/edit',
      publishedAt: new Date(),
      isActive: true,
      isPinned: false,
      isDismissible: true,
      tags: ['welcome', 'onboarding'],
    },
    {
      title: 'New Feature: Travel Logbook ✈️',
      content: `# Introducing Travel Logbook!

Document your travels, share experiences, and connect with fellow travelers.

## Features:
- 📍 Track countries and cities visited
- 📸 Add photos and highlights
- 👥 Tag travel companions
- 🌍 Request introductions to friends of friends

Start building your travel story today!`,
      excerpt: 'Document your travels and connect with fellow adventurers',
      imageUrl: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=400&fit=crop&crop=center',
      priority: AnnouncementPriority.NORMAL,
      displayType: 'banner',
      targetAudience: 'all',
      ctaText: 'Explore Feature',
      ctaAction: 'navigate_to',
      ctaUrl: '/travel',
      publishedAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      isActive: true,
      isPinned: true,
      isDismissible: true,
      tags: ['feature', 'travel'],
    },
    {
      title: 'Premium Plan Launch - 50% Off! 💎',
      content: `# Premium is Here!

Unlock exclusive features with Berse Premium.

## Premium Benefits:
- 🎟️ Unlimited event creation
- 📊 Advanced analytics
- 🎨 Custom badges
- ⭐ Priority support
- 🚀 Profile boost

**Special Launch Offer:** 50% off for the first 3 months!

Use code: PREMIUM50`,
      excerpt: 'Limited time: 50% off Premium subscription',
      imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=400&fit=crop&crop=center',
      priority: AnnouncementPriority.HIGH,
      displayType: 'banner',
      targetAudience: 'all',
      targetUserSegment: ['active_users'],
      ctaText: 'Get Premium',
      ctaAction: 'navigate_to',
      ctaUrl: '/subscription/premium',
      publishedAt: new Date(),
      expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      isActive: true,
      isPinned: true,
      isDismissible: true,
      tags: ['promotion', 'premium'],
    },
    {
      title: 'Upcoming: KL Mega Meetup 2025 🎊',
      content: `# KL Mega Meetup 2025

Join hundreds of Berse members for our biggest event yet!

**Date:** March 15, 2025  
**Location:** KLCC Park  
**Time:** 3:00 PM - 8:00 PM

## Activities:
- 🎮 Interactive games
- 🍔 Food trucks
- 🎵 Live music
- 🤝 Networking sessions
- 🎁 Prizes and giveaways

RSVP now - limited spots available!`,
      excerpt: 'Join us for the biggest Berse community gathering',
      imageUrl: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&h=400&fit=crop&crop=center',
      priority: AnnouncementPriority.URGENT,
      displayType: 'banner',
      targetAudience: 'all',
      targetCountries: ['MY'],
      ctaText: 'RSVP Now',
      ctaAction: 'navigate_to',
      ctaUrl: '/events/kl-mega-meetup-2025',
      publishedAt: new Date(),
      expiresAt: new Date('2025-03-15'),
      isActive: true,
      isPinned: true,
      isDismissible: true,
      tags: ['event', 'community'],
    },
  ];

  for (const announcement of announcements) {
    await prisma.announcement.create({ data: announcement });
  }
  console.log(`✅ Created ${announcements.length} announcements`);

  // ===================================
  // 6. FAQ CATEGORIES & FAQS
  // ===================================
  console.log('\n❓ Seeding FAQs...');
  
  await prisma.faqCategory.deleteMany({});
  
  const faqCategories = [
    {
      name: 'Getting Started',
      description: 'New to Berse? Start here!',
      icon: '🚀',
      displayOrder: 1,
      isActive: true,
    },
    {
      name: 'Trust & Vouches',
      description: 'Understanding our trust system',
      icon: '🤝',
      displayOrder: 2,
      isActive: true,
    },
    {
      name: 'Events',
      description: 'Everything about events',
      icon: '📅',
      displayOrder: 3,
      isActive: true,
    },
    {
      name: 'Payments & Subscriptions',
      description: 'Billing and payment questions',
      icon: '💳',
      displayOrder: 4,
      isActive: true,
    },
    {
      name: 'Privacy & Safety',
      description: 'Keeping you safe',
      icon: '🔒',
      displayOrder: 5,
      isActive: true,
    },
  ];

  const createdCategories = [];
  for (const category of faqCategories) {
    const created = await prisma.faqCategory.create({ data: category });
    createdCategories.push(created);
  }
  console.log(`✅ Created ${faqCategories.length} FAQ categories`);

  const faqs = [
    // Getting Started
    {
      categoryId: createdCategories[0].id,
      question: 'How do I get started on Berse?',
      answer: `Getting started is easy!

1. **Complete your profile** - Add a photo, bio, and interests
2. **Get verified** - Verify your email and phone number
3. **Get vouched** - Request a vouch from someone who knows you
4. **Join communities** - Find groups that match your interests
5. **Attend events** - Start meeting people at events

The more complete your profile, the easier it is to connect with others!`,
      displayOrder: 1,
      isActive: true,
      isFeatured: true,
      tags: ['beginner', 'profile', 'onboarding'],
    },
    {
      categoryId: createdCategories[0].id,
      question: 'What makes Berse different from other social networks?',
      answer: `Berse is built on **trust, not algorithms**.

### Key Differences:
- **Trust-based vouching** instead of random connections
- **Real-world events** that bring people together
- **Quality over quantity** - meaningful connections
- **Privacy-focused** - your data is yours
- **Community-driven** - not advertiser-driven

We believe in authentic relationships, not vanity metrics.`,
      displayOrder: 2,
      isActive: true,
      isFeatured: true,
      tags: ['about', 'difference'],
    },
    // Trust & Vouches
    {
      categoryId: createdCategories[1].id,
      question: 'What is a vouch and how do I get one?',
      answer: `A **vouch** is a trust endorsement from someone who knows you.

### Types of Vouches:
1. **Primary Vouch** (30% trust weight) - From someone who knows you well
2. **Secondary Vouches** (30% total) - Up to 3 vouches from connections
3. **Community Vouches** (40% total) - From communities you're active in

### How to Get Vouched:
- Ask a friend already on Berse
- Be active in communities (auto-vouch after meeting criteria)
- Attend events and build connections
- Request a vouch through the app

**Note:** Vouches must be genuine - false vouches can result in suspension.`,
      displayOrder: 1,
      isActive: true,
      isFeatured: true,
      tags: ['vouch', 'trust', 'getting-started'],
    },
    {
      categoryId: createdCategories[1].id,
      question: 'How is my trust score calculated?',
      answer: `Your trust score (0-100) is calculated from:

### Components:
- **40%** - Vouches (primary, secondary, community)
- **30%** - Trust moments (feedback from interactions)
- **30%** - Activity participation (events, engagement)

### Trust Levels:
- **Starter** (0-30): New member
- **Trusted** (31-60): Established member
- **Leader** (61-100): Community champion

Increase your score by:
- Getting vouched
- Attending events
- Being active in communities
- Receiving positive feedback`,
      displayOrder: 2,
      isActive: true,
      isFeatured: true,
      tags: ['trust-score', 'calculation'],
    },
    // Events
    {
      categoryId: createdCategories[2].id,
      question: 'How do I find events near me?',
      answer: `Finding events is easy!

### Methods:
1. **Browse tab** - See all upcoming events
2. **Filter by category** - Sports, Social, Food, etc.
3. **Community events** - Check your joined communities
4. **Location filter** - Events near your city
5. **Search** - Find specific events by keyword

### Tips:
- Turn on notifications for new events
- Save events you're interested in
- RSVP early - popular events fill up fast
- Check event reviews and host ratings`,
      displayOrder: 1,
      isActive: true,
      isFeatured: true,
      tags: ['events', 'finding-events'],
    },
    {
      categoryId: createdCategories[2].id,
      question: 'Can I host my own events?',
      answer: `Yes! Anyone can host events on Berse.

### Requirements:
- Complete profile
- Verified email/phone
- Minimum trust score (varies by event type)
- For paid events: Set up payment method

### Event Types:
- **Free events** - No cost to attendees
- **Paid events** - Set ticket price (10% platform fee)
- **Community events** - Host on behalf of a community

### Tips for Hosts:
- Be clear about event details
- Set appropriate max attendees
- Respond to questions promptly
- Check-in attendees via QR code
- Get certified for advanced hosting features`,
      displayOrder: 2,
      isActive: true,
      tags: ['hosting', 'create-event'],
    },
    // Payments
    {
      categoryId: createdCategories[3].id,
      question: 'What are the subscription tiers?',
      answer: `We offer three tiers:

### 🆓 Free
- Attend unlimited events
- Join communities
- Basic messaging
- 50 connections limit

### 💼 Basic (RM 19.90/month)
- Everything in Free
- Create events (20/month)
- 200 connections
- Profile boost

### 💎 Premium (RM 49.90/month)
- Everything in Basic
- **Unlimited** events
- Host community events
- Analytics dashboard
- Custom badges
- Priority support
- **Unlimited** connections

Try Premium risk-free with our 14-day trial!`,
      displayOrder: 1,
      isActive: true,
      isFeatured: true,
      tags: ['subscription', 'pricing', 'premium'],
    },
    {
      categoryId: createdCategories[3].id,
      question: 'What are platform fees?',
      answer: `Platform fees help us maintain and improve Berse.

### Fee Structure:
- **Event Tickets**: 10% + RM 1 (min RM 1, max RM 50)
- **Marketplace**: 5% + RM 0.50
- **Service Bookings**: 15% + RM 2
- **Subscriptions**: No additional fees

### Why Fees?
- Server and infrastructure costs
- Payment processing
- Customer support
- Feature development
- Community safety measures

All fees are clearly shown before payment.`,
      displayOrder: 2,
      isActive: true,
      tags: ['fees', 'pricing'],
    },
    // Privacy & Safety
    {
      categoryId: createdCategories[4].id,
      question: 'How is my data protected?',
      answer: `We take your privacy seriously.

### Security Measures:
- **Encryption** - All data encrypted in transit and at rest
- **Two-factor authentication** - Optional 2FA
- **Secure payments** - PCI-compliant payment processing
- **Regular audits** - Security assessments
- **GDPR compliant** - Full data protection

### Your Rights:
- Access your data anytime
- Export your data
- Delete your account
- Control privacy settings
- Opt-out of marketing

Read our full [Privacy Policy](/legal/privacy) for details.`,
      displayOrder: 1,
      isActive: true,
      isFeatured: true,
      tags: ['privacy', 'security', 'data'],
    },
    {
      categoryId: createdCategories[4].id,
      question: 'How do I report inappropriate behavior?',
      answer: `Your safety is our priority.

### How to Report:
1. **In-app reporting** - Use the report button
2. **Email**: safety@berse.app
3. **Emergency**: Contact local authorities first

### What to Report:
- Harassment or bullying
- Inappropriate content
- Scams or fraud
- Fake profiles
- Safety concerns

### What Happens:
- Reports are reviewed within 24 hours
- Action taken based on severity
- You'll receive a follow-up
- Reporter identity is protected

### Immediate Actions:
- Block the user
- Leave the event/community
- Screenshot evidence

We have zero tolerance for abuse.`,
      displayOrder: 2,
      isActive: true,
      isFeatured: true,
      tags: ['safety', 'reporting', 'abuse'],
    },
  ];

  for (const faq of faqs) {
    await prisma.faq.create({ data: faq });
  }
  console.log(`✅ Created ${faqs.length} FAQs`);

  // ===================================
  // 7. HELP ARTICLE CATEGORIES & ARTICLES
  // ===================================
  console.log('\n📚 Seeding help articles...');
  
  await prisma.helpArticleCategory.deleteMany({});
  
  const helpCategories = [
    {
      name: 'Getting Started',
      slug: 'getting-started',
      description: 'Everything you need to begin your Berse journey',
      icon: '🚀',
      displayOrder: 1,
      isActive: true,
    },
    {
      name: 'Account Management',
      slug: 'account-management',
      description: 'Managing your account and settings',
      icon: '⚙️',
      displayOrder: 2,
      isActive: true,
    },
    {
      name: 'Events & Communities',
      slug: 'events-communities',
      description: 'Hosting and attending events',
      icon: '🎭',
      displayOrder: 3,
      isActive: true,
    },
    {
      name: 'Trust System',
      slug: 'trust-system',
      description: 'Understanding vouches and trust scores',
      icon: '🤝',
      displayOrder: 4,
      isActive: true,
    },
    {
      name: 'Troubleshooting',
      slug: 'troubleshooting',
      description: 'Solving common issues',
      icon: '🔧',
      displayOrder: 5,
      isActive: true,
    },
  ];

  const createdHelpCategories = [];
  for (const category of helpCategories) {
    const created = await prisma.helpArticleCategory.create({ data: category });
    createdHelpCategories.push(created);
  }
  console.log(`✅ Created ${helpCategories.length} help article categories`);

  await prisma.helpArticle.deleteMany({});
  
  const helpArticles = [
    {
      categoryId: createdHelpCategories[0].id,
      title: 'Complete Guide to Setting Up Your Profile',
      slug: 'complete-guide-profile-setup',
      content: `# Complete Guide to Setting Up Your Profile

Your profile is your digital identity on Berse. A complete, authentic profile helps you make better connections.

## Why Profile Completion Matters

- 📈 Increases trust score
- 🤝 Easier to get vouched
- 👥 More connection requests
- 🎯 Better event recommendations

## Step-by-Step Guide

### 1. Basic Information

#### Profile Photo
- Use a clear, recent photo of yourself
- Face should be visible
- No group photos
- Professional or casual is fine

#### Display Name
- Use your real name or nickname
- Easy to remember
- Avoid special characters

#### Bio
- 2-3 sentences about yourself
- Mention interests and passions
- Be authentic and friendly
- Add some personality!

**Example:**
> "Tech enthusiast and coffee addict ☕ Love exploring KL's hidden cafes and hosting board game nights. Always up for badminton!"

### 2. Location & Background

#### Current City
- Where you currently live
- Helps with local event recommendations

#### Originally From
- Your hometown or birth city
- Helps connect with people from similar backgrounds

#### Languages
- List all languages you speak
- Include proficiency levels if relevant

### 3. Interests & Hobbies

Select from our categories:
- 🏃 Sports & Fitness
- 🍽️ Food & Dining
- 🎨 Arts & Culture
- 🎮 Gaming
- 📚 Reading & Learning
- ✈️ Travel
- 🎵 Music
- 💼 Professional Networking

**Tip:** Select 5-10 interests for best results

### 4. Professional Information

- Your current profession
- Company or industry (optional)
- LinkedIn profile (optional)

### 5. Social Media

Link your social accounts:
- Instagram
- LinkedIn
- Twitter

**Why?** Helps verify your identity and gives others context about you.

### 6. Verification

#### Email Verification
1. Check your email inbox
2. Click verification link
3. Email confirmed ✅

#### Phone Verification
1. Enter your phone number
2. Receive SMS code
3. Enter code
4. Phone verified ✅

## Profile Completion Score

Your profile completion is calculated based on:
- Basic info: 25%
- Interests & background: 25%
- Verification: 25%
- Social links: 15%
- Professional info: 10%

### Completion Levels
- **Starter** (0-25%): Just beginning
- **Basic** (26-50%): Making progress
- **Intermediate** (51-75%): Almost there
- **Complete** (76-99%): Well done!
- **Expert** (100%): Perfect! 🌟

## Best Practices

### Do's ✅
- Be honest and authentic
- Update regularly
- Use high-quality photos
- Write an engaging bio
- Complete all sections

### Don'ts ❌
- Don't use fake information
- Avoid low-quality photos
- Don't copy others' bios
- Don't leave sections empty
- Avoid being too generic

## Privacy Settings

Control who sees what:
1. Go to Settings → Privacy
2. Choose profile visibility:
   - **Public**: Everyone can see
   - **Friends**: Only connections
   - **Private**: Hidden from search

3. Control searchability:
   - By email
   - By phone
   - By name

## Need Help?

- Email: support@berse.app
- In-app chat support
- Community forums

---

**Next Steps:**
- [Get Your First Vouch](/help/getting-started/first-vouch)
- [Join Your First Community](/help/events-communities/joining-communities)
- [Attend Your First Event](/help/events-communities/attending-events)`,
      excerpt: 'Step-by-step guide to creating an amazing profile',
      displayOrder: 1,
      isActive: true,
      isFeatured: true,
      publishedAt: new Date(),
      tags: ['profile', 'getting-started', 'setup'],
      keywords: ['profile', 'setup', 'complete', 'bio', 'photo'],
    },
    {
      categoryId: createdHelpCategories[3].id,
      title: 'Understanding Trust Scores and Vouches',
      slug: 'understanding-trust-scores-vouches',
      content: `# Understanding Trust Scores and Vouches

Trust is the foundation of Berse. Learn how our unique trust system works.

## What is a Trust Score?

Your trust score is a number from 0-100 that represents your credibility in the community.

### Trust Levels
- 🌱 **Starter** (0-30): New member
- ✅ **Trusted** (31-60): Established member  
- 👑 **Leader** (61-100): Community champion

## How Trust Score is Calculated

Your score has three components:

### 1. Vouches (40% weight)

#### Primary Vouch (30 points)
- One primary vouch from someone who knows you well
- They must have a trust score of 50+
- Highest impact on your score

#### Secondary Vouches (30 points total)
- Up to 3 secondary vouches
- 10 points each
- From connections or community members

#### Community Vouches (40 points total)
- Up to 2 vouches from communities
- 20 points each
- Earned through active participation

**Total Possible from Vouches: 40 points**

### 2. Trust Moments (30% weight)

Feedback from real interactions:
- Event attendance
- Transaction ratings
- Service reviews
- Connection reviews

Positive interactions increase your score, negative ones decrease it.

**Total Possible from Trust Moments: 30 points**

### 3. Activity (30% weight)

Your engagement in the community:
- Events attended/hosted
- Community participation
- Connections made
- Content shared
- Response rate

**Total Possible from Activity: 30 points**

## Types of Vouches

### Primary Vouch
**Best for:** Close friends, family, colleagues who know you well

**Requirements to vouch:**
- Trust score 50+
- Active for 30+ days
- Can only give 1 primary vouch

**Impact:** Highest (30% of total score)

### Secondary Vouch
**Best for:** Friends, acquaintances, event connections

**Requirements to vouch:**
- Trust score 50+
- Active for 30+ days
- Can give up to 3 secondary vouches

**Impact:** Medium (10% each, 30% total)

### Community Vouch
**Best for:** Active community members

**Auto-granted when:**
- Attended 5+ community events
- Member for 90+ days
- Zero negative feedback
- Community admin approval

**Impact:** High (20% each, 40% total)

## How to Get Vouched

### Method 1: Request from Friend
1. Go to their profile
2. Tap "Request Vouch"
3. Select vouch type
4. Add a personal message
5. Wait for approval

### Method 2: Earn Community Vouch
1. Join an active community
2. Attend events regularly
3. Participate in discussions
4. Build relationships
5. Auto-vouch after meeting criteria

### Method 3: Connect Through Events
1. Attend events
2. Meet people
3. Exchange contact info
4. Request vouch after building relationship

## Vouch Approval Process

1. **Request sent** - Recipient gets notification
2. **Under review** - They decide to approve
3. **Approved** - Vouch activated
4. **Active** - Contributing to trust score

They can also:
- **Decline** - No impact on you
- **Revoke** - Remove an existing vouch

## Best Practices

### For Getting Vouched

✅ **Do:**
- Build genuine relationships first
- Be active in communities
- Attend events regularly
- Be authentic and reliable
- Ask people who know you well

❌ **Don't:**
- Ask strangers for vouches
- Trade vouches
- Create fake relationships
- Harass people for vouches
- Request immediately after connecting

### For Giving Vouches

✅ **Do:**
- Only vouch people you actually know
- Be honest about relationship strength
- Choose appropriate vouch type
- Add meaningful context

❌ **Don't:**
- Give fake vouches
- Vouch strangers for money
- Vouch someone you don't trust
- Abuse the system

## Trust Score Benefits

### High Trust Score (70+)
- 🎯 Profile priority in searches
- 🎫 Access to exclusive events
- 💎 Premium features unlock
- 🏆 Community leader badge
- 🤝 Can vouch others
- 📈 Better event recommendations

### Low Trust Score (0-39)
- Limited features initially
- Need vouches to unlock more
- Focus on building connections
- Attend events to increase score

## Maintaining Your Trust Score

### Increase Your Score
- Get vouched by trusted members
- Attend events regularly
- Be active in communities
- Respond to messages promptly
- Complete transactions reliably
- Get positive reviews

### Protect Your Score
- Be reliable and punctual
- Communicate clearly
- Respect community guidelines
- Handle disputes professionally
- Maintain positive interactions

## Trust Score FAQ

**Q: How long does it take to increase my score?**  
A: It varies, but active members typically reach "Trusted" (40+) within 2-4 weeks.

**Q: Can my score go down?**  
A: Yes, negative feedback, revoked vouches, or guideline violations can decrease it.

**Q: Is 100 possible?**  
A: Yes, but rare! It requires maximum vouches, excellent feedback, and high activity.

**Q: What if someone revokes their vouch?**  
A: Your score adjusts, but you can seek another vouch to replace it.

## Need More Help?

- Email: trust@berse.app
- [Request Your First Vouch](/help/getting-started/first-vouch)
- [Community Guidelines](/legal/guidelines)

---

**Related Articles:**
- [How to Give Meaningful Vouches](/help/trust-system/giving-vouches)
- [Building Your Trust Network](/help/trust-system/trust-network)
- [Trust Score Troubleshooting](/help/troubleshooting/trust-issues)`,
      excerpt: 'Complete guide to trust scores, vouches, and credibility',
      displayOrder: 1,
      isActive: true,
      isFeatured: true,
      isPremiumOnly: false,
      publishedAt: new Date(),
      tags: ['trust', 'vouch', 'score', 'credibility'],
      keywords: ['trust', 'vouch', 'score', 'calculation', 'increase'],
    },
  ];

  for (const article of helpArticles) {
    await prisma.helpArticle.create({ data: article });
  }
  console.log(`✅ Created ${helpArticles.length} help articles`);

  // ===================================
  // 8. MAINTENANCE SCHEDULE
  // ===================================
  console.log('\n🔧 Seeding maintenance schedule...');
  
  await prisma.maintenanceSchedule.deleteMany({});
  
  const maintenance = {
    title: 'Scheduled System Upgrade',
    description: `# System Upgrade - February 15, 2025

We'll be performing important system upgrades to improve performance and add new features.

## What's Being Updated:
- Database optimization
- Server infrastructure upgrade
- New feature deployment
- Security enhancements

## Expected Duration:
2-3 hours

## Impact:
- App will be temporarily unavailable
- No data will be lost
- All features will be back online after completion

Thank you for your patience!`,
    startTime: new Date('2025-02-15T02:00:00Z'),
    endTime: new Date('2025-02-15T05:00:00Z'),
    estimatedDuration: 180,
    status: MaintenanceStatus.SCHEDULED,
    affectedFeatures: ['all'],
    isFullDowntime: true,
    severity: 'high',
    userMessage: 'Berse will be offline for scheduled maintenance from 2 AM - 5 AM MYT. We\'ll be back soon with exciting improvements!',
    technicalDetails: 'PostgreSQL upgrade, Redis cluster expansion, API v2 deployment',
    notifyUsers: true,
    notificationSent: false,
  };

  await prisma.maintenanceSchedule.create({ data: maintenance });
  console.log('✅ Created maintenance schedule');

  // ===================================
  // 9. FEATURE FLAGS
  // ===================================
  console.log('\n🚩 Seeding feature flags...');
  
  await prisma.featureFlag.deleteMany({});
  
  const featureFlags = [
    {
      featureKey: 'dark_mode',
      featureName: 'Dark Mode',
      description: 'Enable dark theme for the app',
      isEnabled: true,
      isGlobal: true,
      rolloutPercentage: 100.0,
      rolloutStrategy: 'percentage',
      targetPlatforms: ['ios', 'android', 'web'],
      isABTest: false,
      tags: ['ui', 'theme'],
    },
    {
      featureKey: 'travel_logbook',
      featureName: 'Travel Logbook',
      description: 'Document and share travel experiences',
      isEnabled: true,
      isGlobal: true,
      rolloutPercentage: 100.0,
      rolloutStrategy: 'percentage',
      targetPlatforms: ['ios', 'android'],
      isABTest: false,
      enabledAt: new Date(),
      tags: ['feature', 'travel'],
    },
    {
      featureKey: 'video_events',
      featureName: 'Video Events',
      description: 'Host virtual events with video calls',
      isEnabled: false,
      isGlobal: false,
      rolloutPercentage: 10.0,
      rolloutStrategy: 'percentage',
      targetPlatforms: ['ios', 'android', 'web'],
      targetSegments: ['premium_users'],
      isABTest: true,
      abTestVariant: 'A',
      tags: ['feature', 'video', 'beta'],
    },
    {
      featureKey: 'ai_recommendations',
      featureName: 'AI Event Recommendations',
      description: 'ML-powered event recommendations',
      isEnabled: true,
      isGlobal: false,
      rolloutPercentage: 50.0,
      rolloutStrategy: 'percentage',
      targetPlatforms: ['ios', 'android'],
      minAppVersion: '1.1.0',
      isABTest: true,
      abTestVariant: 'B',
      tags: ['ai', 'ml', 'recommendations'],
    },
    {
      featureKey: 'chat_encryption',
      featureName: 'End-to-End Encryption',
      description: 'E2E encrypted messaging',
      isEnabled: true,
      isGlobal: true,
      rolloutPercentage: 100.0,
      rolloutStrategy: 'percentage',
      targetPlatforms: ['ios', 'android'],
      minAppVersion: '1.0.0',
      tags: ['security', 'messaging'],
    },
  ];

  for (const flag of featureFlags) {
    await prisma.featureFlag.create({ data: flag });
  }
  console.log(`✅ Created ${featureFlags.length} feature flags`);

  // ===================================
  // 10. APP NOTICES
  // ===================================
  console.log('\n📌 Seeding app notices...');
  
  await prisma.appNotice.deleteMany({});
  
  const notices = [
    {
      noticeType: AppNoticeType.INFO,
      title: 'New Feature Alert',
      message: 'Check out our new Travel Logbook feature! Document your adventures and connect with fellow travelers.',
      icon: '✈️',
      displayLocation: ['home'],
      displayStyle: 'banner',
      priority: 5,
      isDismissible: true,
      autoDismiss: false,
      targetAudience: 'all',
      ctaText: 'Explore',
      ctaAction: 'navigate_to',
      ctaUrl: '/travel',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      isActive: true,
    },
    {
      noticeType: AppNoticeType.SUCCESS,
      title: 'Profile Complete!',
      message: 'Great job! Your profile is now 100% complete. You\'ve earned 100 bonus points!',
      icon: '🎉',
      displayLocation: ['profile'],
      displayStyle: 'toast',
      priority: 3,
      isDismissible: true,
      autoDismiss: true,
      autoDismissSeconds: 5,
      targetAudience: 'all',
      startDate: new Date(),
      isActive: true,
    },
    {
      noticeType: AppNoticeType.PROMOTION,
      title: 'Limited Offer: Premium 50% Off',
      message: 'Upgrade to Premium and get 50% off for 3 months. Offer ends soon!',
      icon: '💎',
      displayLocation: ['home', 'profile'],
      displayStyle: 'banner',
      priority: 10,
      isDismissible: true,
      autoDismiss: false,
      targetAudience: 'all',
      targetSegments: ['free_users'],
      ctaText: 'Upgrade Now',
      ctaAction: 'navigate_to',
      ctaUrl: '/subscription/premium',
      startDate: new Date(),
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      isActive: true,
    },
    {
      noticeType: AppNoticeType.WARNING,
      title: 'Complete Email Verification',
      message: 'Please verify your email to unlock all features and increase your trust score.',
      icon: '⚠️',
      displayLocation: ['all_screens'],
      displayStyle: 'banner',
      priority: 8,
      isDismissible: false,
      autoDismiss: false,
      targetAudience: 'all',
      ctaText: 'Verify Now',
      ctaAction: 'navigate_to',
      ctaUrl: '/settings/verification',
      startDate: new Date(),
      isActive: true,
    },
  ];

  for (const notice of notices) {
    await prisma.appNotice.create({ data: notice });
  }
  console.log(`✅ Created ${notices.length} app notices`);

  // ===================================
  // SUMMARY
  // ===================================
  console.log('\n' + '='.repeat(60));
  console.log('📊 APP CONFIGURATION SEED SUMMARY');
  console.log('='.repeat(60));

  const counts = {
    appConfigs: await prisma.appConfig.count(),
    onboardingScreens: await prisma.onboardingScreen.count(),
    appVersions: await prisma.appVersion.count(),
    legalDocuments: await prisma.legalDocument.count(),
    announcements: await prisma.announcement.count(),
    faqCategories: await prisma.faqCategory.count(),
    faqs: await prisma.faq.count(),
    helpCategories: await prisma.helpArticleCategory.count(),
    helpArticles: await prisma.helpArticle.count(),
    maintenanceSchedules: await prisma.maintenanceSchedule.count(),
    featureFlags: await prisma.featureFlag.count(),
    appNotices: await prisma.appNotice.count(),
  };

  console.log('\n📋 Created Records:');
  console.table(counts);

  console.log('\n✨ Content Highlights:');
  console.log('   • 12 App configurations (version, maintenance, features)');
  console.log('   • 5 Onboarding screens with beautiful designs');
  console.log('   • 4 App versions (iOS & Android, v1.0 & v1.1)');
  console.log('   • 4 Legal documents (TOS, Privacy, Guidelines, Refund)');
  console.log('   • 4 Active announcements (welcome, features, promotions)');
  console.log('   • 5 FAQ categories with 10 helpful FAQs');
  console.log('   • 5 Help categories with detailed articles');
  console.log('   • 1 Scheduled maintenance (Feb 15, 2025)');
  console.log('   • 5 Feature flags (dark mode, travel, video, AI, security)');
  console.log('   • 4 App notices (info, success, promotion, warning)');

  console.log('\n🎯 Next Steps:');
  console.log('   1. Update imageUrl/thumbnailUrl with actual assets');
  console.log('   2. Create API endpoints to serve this content');
  console.log('   3. Build admin panel for content management');
  console.log('   4. Integrate with mobile app');
  console.log('   5. Set up analytics tracking');

  console.log('\n🎉 App configuration seed completed successfully!');
  console.log('='.repeat(60) + '\n');
}

// Main execution
seedAppConfiguration()
  .catch((e) => {
    console.error('❌ App configuration seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
