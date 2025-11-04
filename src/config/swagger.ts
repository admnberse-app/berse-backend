import swaggerJsdoc from 'swagger-jsdoc';
import { config } from './index';
import { subscriptionSwaggerDocs } from '../docs/subscription.swagger';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Berse Platform API',
    version: '2.1.0',
    description: `Modern, modular API for the Berse social platform with event management, user connections, community features, and trust-based vouching.

**🚀 Current Version: 2.1.0** | **📅 Updated: October 17, 2025** | **✅ Production Ready**

**Quick Links:**
- 📖 [Full API Documentation](/docs/api-v2/)
- 🏘️ [Communities API](/docs/api-v2/COMMUNITIES_API.md)
- 🔗 [Connections API](/docs/api-v2/CONNECTIONS_API.md)
- 🎉 [Events API](/docs/api-v2/EVENTS_API.md)
- 🔔 [Notifications API](/docs/api-v2/NOTIFICATIONS_API.md)

<details>
<summary><b>📋 Version 2.1.0 Release Notes (October 17, 2025)</b> - Click to expand</summary>

### New Features

#### Communities Module 🏘️
- 18 community endpoints (create, manage, join, approve, vouch)
- Role-based permission system (ADMIN, MODERATOR, MEMBER)
- Community vouching system with trust score integration
- Auto-vouch eligibility (5+ events, 90+ days membership)
- Last admin protection logic
- Member approval workflow
- Comprehensive statistics and filtering
- Max 2 community vouches per user (20% trust weight each)

#### Trust Moments Module 💬
- 8 trust moment endpoints (create, update, delete, query, statistics)
- Feedback/rating system after shared experiences
- Rating scale 1-5 stars with trust impact (-5 to +5 points)
- Event-based feedback linking
- Public/private visibility controls
- Comprehensive statistics and analytics
- Contributes 30% to trust score (30 points maximum)
- Zero negative feedback requirement for auto-vouch eligibility

#### Calendar Endpoints 📅
- 4 calendar view endpoints for event scheduling
- GET /v2/events/calendar/today - Today's events
- GET /v2/events/calendar/week - 7-day schedule grouped by date
- GET /v2/events/calendar/month - Monthly events with date grouping
- GET /v2/events/calendar/counts - Event counts per date for calendar UI
- Redis caching for performance (10-15 minutes TTL)
- Timezone support for accurate date calculations

#### Notification System
- 6 notification endpoints (get, unread count, mark as read, delete)
- Real-time notifications for connections, vouches, events, security alerts
- Priority levels (low, normal, high, urgent) for UI differentiation
- Email verification status flag for mobile app banners
- Pagination and filtering support

#### Trust Score System
- Trust scores visible in user profiles (0-100 scale)
- Trust levels: Starter (0-30), Trusted (31-60), Leader (61-100)
- Calculation: 40% vouches + 30% activity + 30% trust moments
- Automatic updates on vouch approvals and event attendance

#### Security Enhancements
- Email verification status tracking
- Security object in user profile with verification timestamps
- Welcome notifications after email verification
- Enhanced activity logging

</details>

<details>
<summary><b>📋 Version 2.0.2 Release Notes (October 15, 2025)</b> - Click to expand</summary>

### Connection & Vouching Module
- 13 connection endpoints (request, accept, remove, block, stats, mutual, suggestions)
- 9 vouching endpoints (request, approve, revoke, limits, summary)
- Symmetric connection model with 30-day reconnection cooldown
- Connection suggestions based on mutual friends, interests, communities
- Block/unblock functionality
- Vouch limits: 1 primary, 3 secondary, 2 community
- Auto-vouch eligibility checks

### Events Module
- 21 event endpoints with complete CRUD operations
- Multi-tier ticket pricing with capacity management
- RSVP system for free events with secure QR codes
- QR code-based check-in system with JWT security
- Real-time attendee tracking and reporting

### Event Discovery
- 6 intelligent discovery endpoints with Redis caching
- Trending events (engagement-based ranking)
- Nearby events (location-based, PostGIS-ready)
- Personalized recommendations (ML-ready algorithm)
- Events by host/organizer
- Community events feed

### Performance Optimizations
- 47-78% faster queries
- Optimized database queries with proper indexing
- Redis caching for trending and recommendations
- Parallel query execution
- Query complexity reduced from O(n) to O(log n)

### Database Seeding
- 5 test users with varying trust levels
- Sample connections, vouches, and community data
- 6 communities, 5 events, travel trips, services, marketplace items

### DX Improvements
- Simplified Prisma relation names in _count responses
- Better field naming (connectionsInitiated, connectionsReceived, referralsMade)
- Activity logging for security events

</details>

<details>
<summary><b>📋 Version 2.0.1 Release Notes (October 15, 2025)</b> - Click to expand</summary>

### Bug Fixes & Improvements
- Fixed Prisma upsert operations for UserProfile and UserLocation
- Proper ID generation for UserConnection using cuid2
- Fixed route ordering to prevent path conflicts
- Added pagination validation (negative values, max limits)
- Enhanced URL validation requiring protocols
- Fixed connection removal authorization
- All endpoints tested and verified (35+ tests passing)
- Comprehensive documentation updates

</details>

**Stability:** All endpoints are production-ready with 100% test coverage.`,
    contact: {
      name: 'Berse API Support',
      url: 'https://berse-app.com',
      email: 'support@berse-app.com',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: config.isDevelopment ? `http://localhost:${config.port}` : 'https://api.berse-app.com',
      description: config.isDevelopment ? 'Development server' : 'Production server',
    },
    {
      url: 'http://localhost:3000',
      description: 'Local development',
    },
  ],
  tags: [
    // ========================================================================
    // 🔐 CORE - Authentication & Users
    // ========================================================================
    {
      name: 'Authentication',
      description: '🔐 User authentication and authorization endpoints. Login, register, refresh tokens, and password management.',
      externalDocs: {
        description: 'Authentication Guide',
        url: '/docs/api-v2/AUTH.md',
      },
    },
    {
      name: 'Users',
      description: '👤 User profile and account management. View, update profiles, manage settings, and handle user data.',
      externalDocs: {
        description: 'User Profile API',
        url: '/docs/api-v2/USERS_API.md',
      },
    },
    {
      name: 'Users - Trust Score',
      description: '📈 User trust score queries and analytics. View detailed trust breakdown, history, and contributing factors.',
    },

    // ========================================================================
    // 🤝 SOCIAL - Connections & Trust
    // ========================================================================
    {
      name: 'Connections',
      description: '🤝 User connections and relationship management. Send requests, accept connections, block users, and view mutual friends.',
      externalDocs: {
        description: 'Connections API',
        url: '/docs/api-v2/CONNECTIONS_API.md',
      },
    },
    {
      name: 'Connections - Vouching',
      description: '⭐ Trust-based vouching system. Request, approve, and manage vouches (Primary, Secondary, Community). Max limits: 1 primary + 3 secondary + 2 community.',
    },
    {
      name: 'Connections - Trust Moments',
      description: '💬 Post-experience feedback and ratings. Leave trust moments after events, travels, or collaborations. Ratings: 1-5 stars, Trust impact: -5 to +5 points.',
    },
    {
      name: 'Connections - Trust Score',
      description: '🎯 Trust score calculation and analytics. Algorithm: 40% vouches + 30% activity + 30% trust moments. Levels: Starter (0-30) → Trusted (31-60) → Leader (61-100).',
    },
    {
      name: 'Connections - Accountability',
      description: '⚖️ Accountability system. Track how vouchees\' behavior affects vouchers\' trust scores. Negative behavior = 40% penalty, Positive = 20% reward.',
    },

    // ========================================================================
    // 🏘️ COMMUNITIES
    // ========================================================================
    {
      name: 'Communities',
      description: '🏘️ Community management and membership. Create communities, manage roles (ADMIN/MODERATOR/MEMBER), approve members, and grant community vouches.',
      externalDocs: {
        description: 'Communities API',
        url: '/docs/api-v2/COMMUNITIES_API.md',
      },
    },
    {
      name: 'Communities - QR Codes',
      description: '📱 Generate QR codes for community promotion. Public preview pages with events and download links to encourage app installs.',
      externalDocs: {
        description: 'QR Code Feature Guide',
        url: '/COMMUNITY_QR_CODE_QUICKREF.md',
      },
    },

    // ========================================================================
    // 🎉 EVENTS
    // ========================================================================
    {
      name: 'Events',
      description: '🎉 Event creation and management. Create, update, delete events. Support for free and paid events with comprehensive features.',
      externalDocs: {
        description: 'Events API',
        url: '/docs/api-v2/EVENTS_API.md',
      },
    },
    {
      name: 'Events - Tickets',
      description: '🎫 Ticket tier management. Create multi-tier pricing, manage capacity, track sales, and handle payments.',
    },
    {
      name: 'Events - Participants',
      description: '👥 Event participant management. View, manage, and track event participants and RSVPs.',
    },
    {
      name: 'Events - Attendance',
      description: '📋 Check-in and attendance tracking. QR code-based check-in with JWT security and real-time attendance reports.',
    },
    {
      name: 'Events - Discovery',
      description: '🔍 Event discovery and recommendations. Find trending events, nearby events, personalized suggestions, and community events.',
    },
    {
      name: 'Events - Calendar',
      description: '📅 Calendar views and date-based queries. Today, week, month views with event counts for calendar UI.',
    },

    // ========================================================================
    // 🎮 ENGAGEMENT & GAMIFICATION
    // ========================================================================
    {
      name: 'Gamification',
      description: '🎮 Points, badges, and rewards system. Earn points through activities, unlock achievements, redeem rewards, and compete on leaderboards.',
      externalDocs: {
        description: 'Gamification Guide',
        url: '/GAMIFICATION_QUICKREF.md',
      },
    },
    {
      name: 'Gamification - Points',
      description: '⭐ Points earning and tracking. View point history, balances, and point-earning activities.',
    },
    {
      name: 'Gamification - Badges',
      description: '🏆 Badge unlocking and management. View earned badges, progress, and achievement criteria.',
    },
    {
      name: 'Gamification - Rewards',
      description: '🎁 Rewards catalog and redemption. Browse rewards, redeem points, and track redemption history.',
    },
    {
      name: 'Gamification - Leaderboards',
      description: '📊 Rankings and competition. View leaderboards by points, activities, trust scores, and categories.',
    },
    {
      name: 'Card Game',
      description: '🃏 Interactive card game experience. Submit feedback, rate discussion topics, engage in conversations, and view game statistics.',
    },
    {
      name: 'Card Game - Admin',
      description: '🔧 Admin controls for card game. Manage topics, moderate discussions, and view analytics.',
    },
    {
      name: 'Onboarding V2',
      description: '🚀 Two-phase onboarding system. App Preview (pre-auth) + User Setup (post-auth). Includes session tracking and analytics.',
      externalDocs: {
        description: 'Onboarding V2 Guide',
        url: '/ONBOARDING_V2_COMPLETE.md',
      },
    },
    {
      name: 'BerseGuide',
      description: '📖 Platform guide and tutorials. Interactive guides for features, tips, and best practices.',
    },

    // ========================================================================
    // 🛍️ MARKETPLACE & TRANSACTIONS
    // ========================================================================
    {
      name: 'Marketplace',
      description: '🛍️ Peer-to-peer marketplace. Create listings, manage cart, process orders, payments, reviews, and dispute resolution.',
      externalDocs: {
        description: 'Marketplace Module',
        url: '/MARKETPLACE_MODULE_COMPLETE.md',
      },
    },
    {
      name: 'Marketplace - Discovery',
      description: '🔎 Search and browse marketplace listings. Filter by category, price, location, and recommendations.',
    },
    {
      name: 'Marketplace - Metadata',
      description: '🏷️ Marketplace categories, tags, and classification data. Listing types, conditions, and attributes.',
    },
    {
      name: 'HomeSurf',
      description: '🏠 Home sharing and accommodation marketplace. List properties, book stays, manage bookings and reviews.',
    },

    // ========================================================================
    // 🔔 NOTIFICATIONS & COMMUNICATION
    // ========================================================================
    {
      name: 'Notifications',
      description: '🔔 Real-time notification system. In-app alerts for connections, events, vouches, security, and system updates. Priority-based delivery.',
      externalDocs: {
        description: 'Notifications API',
        url: '/docs/api-v2/NOTIFICATIONS_API.md',
      },
    },

    // ========================================================================
    // � PAYMENTS & FINANCIALS
    // ========================================================================
    {
      name: 'Payments',
      description: '💳 Payment processing and transactions. Handle payments, refunds, and payment status tracking.',
    },
    {
      name: 'Payment Methods',
      description: '💰 Payment method management. Add, update, delete payment methods. Manage cards and wallets.',
    },
    {
      name: 'Payouts',
      description: '💸 Payout management for hosts and sellers. Configure payout methods, view payout history, request withdrawals.',
    },
    {
      name: 'Webhooks',
      description: '🔗 Webhook management for payment and event notifications. Register, test, and monitor webhook endpoints.',
    },

    // ========================================================================
    // �📍 DATA & METADATA
    // ========================================================================
    {
      name: 'Metadata',
      description: '📍 Geographic and location data. Countries, states/provinces, cities with coordinates, regions, timezones, and location metadata.',
    },
    {
      name: 'Profile Metadata',
      description: '👤 User profile metadata. Interests, skills, languages, occupation types, and profile attributes.',
    },
    {
      name: 'App Constants',
      description: '⚙️ Application-wide constants and configuration. Feature flags, limits, categories, and system settings.',
    },

    // ========================================================================
    // 🏥 SYSTEM & ADMIN
    // ========================================================================
    {
      name: 'Health',
      description: '🏥 API health checks and system status monitoring. Verify service availability and performance metrics.',
    },
    {
      name: 'Dashboard',
      description: '📊 Admin dashboard. Overview of platform metrics, user statistics, and system health.',
    },
    {
      name: 'Admin',
      description: '🔐 Administrative operations. User management, content moderation, and system configuration.',
    },
    {
      name: 'Admin - Revenue',
      description: '💵 Revenue analytics and financial reporting. Track earnings, commissions, payouts, and financial metrics.',
    },
    {
      name: 'Discover',
      description: '🌟 Platform discovery feed. Explore trending content, featured users, communities, and events.',
    },

    // ========================================================================
    // ⚠️ DEPRECATED
    // ========================================================================
    {
      name: 'Onboarding',
      description: '⚠️ DEPRECATED - Use "Onboarding V2" instead. Legacy unified onboarding system (v1).',
    },
  ],
  'x-tagGroups': [
    {
      name: '🔐 Core Services',
      tags: ['Authentication', 'Users', 'Users - Trust Score'],
    },
    {
      name: '🤝 Social & Trust',
      tags: [
        'Connections', 
        'Connections - Vouching', 
        'Connections - Trust Moments', 
        'Connections - Trust Score', 
        'Connections - Accountability'
      ],
    },
    {
      name: '🏘️ Communities',
      tags: ['Communities', 'Communities - QR Codes'],
    },
    {
      name: '🎉 Events',
      tags: [
        'Events', 
        'Events - Tickets', 
        'Events - Participants', 
        'Events - Attendance', 
        'Events - Discovery', 
        'Events - Calendar'
      ],
    },
    {
      name: '🎮 Engagement & Gamification',
      tags: [
        'Gamification',
        'Gamification - Points',
        'Gamification - Badges',
        'Gamification - Rewards',
        'Gamification - Leaderboards',
        'Card Game',
        'Card Game - Admin',
        'BerseGuide',
        'Onboarding V2',
      ],
    },
    {
      name: '🛍️ Commerce & Marketplace',
      tags: [
        'Marketplace',
        'Marketplace - Discovery',
        'Marketplace - Metadata',
        'HomeSurf',
      ],
    },
    {
      name: '💰 Payments & Finance',
      tags: [
        'Payments',
        'Payment Methods',
        'Payouts',
        'Webhooks',
      ],
    },
    {
      name: '🔔 Communication',
      tags: ['Notifications'],
    },
    {
      name: '📊 Data & Configuration',
      tags: [
        'Metadata',
        'Profile Metadata',
        'App Constants',
      ],
    },
    {
      name: '🏥 System & Administration',
      tags: [
        'Health',
        'Dashboard',
        'Admin',
        'Admin - Revenue',
        'Discover',
      ],
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT token in the format: Bearer <token>',
      },
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'refreshToken',
        description: 'Refresh token stored in httpOnly cookie',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          email: { type: 'string', format: 'email' },
          username: { type: 'string' },
          fullName: { type: 'string' },
          phone: { type: 'string' },
          role: { 
            type: 'string',
            enum: ['USER', 'ADMIN', 'MODERATOR', 'HOST'],
          },
          status: {
            type: 'string',
            enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'BANNED'],
          },
          trustScore: { 
            type: 'number',
            description: 'User trust score (0-100). Calculated from: 40% vouches + 30% activity + 30% trust moments',
            example: 72.5,
          },
          trustLevel: { 
            type: 'string',
            description: 'Trust level based on score: starter (0-30), trusted (31-60), leader (61-100)',
            example: 'trusted',
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
          _count: {
            type: 'object',
            description: 'Aggregated counts of related entities',
            properties: {
              events: { 
                type: 'number',
                description: 'Number of events created by user',
              },
              eventParticipants: {
                type: 'number',
                description: 'Number of event participants',
              },
              userBadges: { 
                type: 'number',
                description: 'Number of badges earned',
              },
              connectionsInitiated: { 
                type: 'number',
                description: 'Connection requests sent by this user',
              },
              connectionsReceived: { 
                type: 'number',
                description: 'Connection requests received by this user',
              },
              referralsMade: { 
                type: 'number',
                description: 'Number of users referred',
              },
            },
          },
        },
      },
      UserProfile: {
        type: 'object',
        properties: {
          profilePicture: { type: 'string', format: 'uri' },
          coverPhoto: { type: 'string', format: 'uri' },
          bio: { type: 'string' },
          shortBio: { type: 'string' },
          dateOfBirth: { type: 'string', format: 'date' },
          gender: { type: 'string' },
          nationality: { type: 'string' },
          languages: { 
            type: 'array',
            items: { type: 'string' },
          },
          interests: {
            type: 'array',
            items: { type: 'string' },
          },
        },
      },
      UserLocation: {
        type: 'object',
        properties: {
          currentCity: { type: 'string' },
          homeTown: { type: 'string' },
          country: { type: 'string' },
          coordinates: {
            type: 'object',
            properties: {
              latitude: { type: 'number' },
              longitude: { type: 'number' },
            },
          },
        },
      },
      UserConnection: {
        type: 'object',
        required: ['id', 'initiatorId', 'receiverId', 'status', 'createdAt'],
        properties: {
          id: { 
            type: 'string',
            description: 'Unique connection ID generated using cuid2 (v2.0.1)',
          },
          initiatorId: { 
            type: 'string',
            format: 'uuid',
            description: 'User ID who initiated the connection request',
          },
          receiverId: { 
            type: 'string',
            format: 'uuid',
            description: 'User ID who received the connection request',
          },
          status: {
            type: 'string',
            enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'CANCELED', 'REMOVED'],
            description: 'Current status of the connection',
          },
          message: { 
            type: 'string',
            description: 'Optional personal message with the request',
          },
          relationshipType: { 
            type: 'string',
            description: 'Custom relationship label (e.g., "Travel Buddy", "Colleague")',
          },
          relationshipCategory: { 
            type: 'string',
            enum: ['professional', 'friend', 'family', 'mentor', 'travel', 'community'],
            description: 'Category of relationship',
          },
          trustStrength: { 
            type: 'number',
            minimum: 0,
            maximum: 100,
            default: 0,
            description: 'Calculated trust score (0-100)',
          },
          interactionCount: {
            type: 'number',
            default: 0,
            description: 'Number of interactions between users',
          },
          mutualFriendsCount: {
            type: 'number',
            default: 0,
            description: 'Number of mutual connections',
          },
          badges: {
            type: 'array',
            items: { type: 'string' },
            description: 'Connection badges (e.g., "Most Trusted", "Close Friend")',
          },
          createdAt: { 
            type: 'string',
            format: 'date-time',
            description: 'When the connection request was sent',
          },
          respondedAt: { 
            type: 'string',
            format: 'date-time',
            description: 'When the request was accepted/rejected',
          },
          connectedAt: { 
            type: 'string',
            format: 'date-time',
            description: 'When the connection was established',
          },
          removedAt: { 
            type: 'string',
            format: 'date-time',
            description: 'When the connection was removed',
          },
          removedBy: {
            type: 'string',
            format: 'uuid',
            description: 'User ID who removed the connection',
          },
          canReconnectAt: { 
            type: 'string',
            format: 'date-time',
            description: '30-day cooldown period after removal',
          },
          initiator: {
            description: 'User who initiated the connection (populated)',
            allOf: [{ $ref: '#/components/schemas/User' }],
          },
          receiver: {
            description: 'User who received the connection (populated)',
            allOf: [{ $ref: '#/components/schemas/User' }],
          },
        },
        example: {
          id: 'clx1abc2def3ghi4jkl5mno6p',
          initiatorId: '550e8400-e29b-41d4-a716-446655440000',
          receiverId: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
          status: 'ACCEPTED',
          message: 'Hi! Met you at the conference',
          relationshipType: 'Professional Contact',
          relationshipCategory: 'professional',
          trustStrength: 75.5,
          interactionCount: 12,
          mutualFriendsCount: 5,
          badges: ['Most Trusted', 'Frequent Collaborator'],
          createdAt: '2024-01-01T00:00:00.000Z',
          respondedAt: '2024-01-01T00:15:00.000Z',
          connectedAt: '2024-01-01T00:15:00.000Z',
        },
      },
      AuthTokens: {
        type: 'object',
        properties: {
          accessToken: { type: 'string' },
          refreshToken: { type: 'string' },
          expiresIn: { type: 'number', description: 'Access token expiry in seconds' },
        },
      },
      Event: {
        type: 'object',
        required: ['id', 'title', 'type', 'date', 'location', 'isFree', 'status', 'hostType', 'hostId'],
        properties: {
          id: { type: 'string', description: 'Event ID' },
          title: { type: 'string', minLength: 3, maxLength: 200, description: 'Event title' },
          description: { type: 'string', maxLength: 5000, description: 'Event description' },
          type: {
            type: 'string',
            enum: ['MEETUP', 'WORKSHOP', 'CONFERENCE', 'NETWORKING', 'OUTDOOR', 'SOCIAL', 'CULTURAL', 'OTHER'],
            description: 'Event type',
          },
          date: { type: 'string', format: 'date-time', description: 'Event date and time' },
          location: { type: 'string', minLength: 3, maxLength: 500, description: 'Event location' },
          mapLink: { type: 'string', format: 'uri', description: 'Google Maps or location link' },
          maxAttendees: { type: 'integer', minimum: 1, description: 'Maximum attendee capacity' },
          notes: { type: 'string', description: 'Additional notes for attendees' },
          images: {
            type: 'array',
            items: { type: 'string', format: 'uri' },
            description: 'Event images',
          },
          isFree: { type: 'boolean', description: 'Whether event is free' },
          currency: { type: 'string', default: 'MYR', description: 'Currency code' },
          status: {
            type: 'string',
            enum: ['DRAFT', 'PUBLISHED', 'CANCELED', 'COMPLETED'],
            description: 'Event status',
          },
          hostType: {
            type: 'string',
            enum: ['PERSONAL', 'COMMUNITY'],
            description: 'Type of host (personal or community)',
          },
          hostId: { type: 'string', description: 'Host user ID' },
          communityId: { type: 'string', description: 'Community ID (if community-hosted)' },
          attendeeCount: { type: 'integer', description: 'Number of attendees checked in' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
          host: {
            type: 'object',
            description: 'Host user details',
            properties: {
              id: { type: 'string' },
              displayName: { type: 'string' },
              profilePicture: { type: 'string', format: 'uri' },
            },
          },
          community: {
            type: 'object',
            description: 'Community details (if community-hosted)',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              imageUrl: { type: 'string', format: 'uri' },
              isVerified: { type: 'boolean' },
            },
          },
          ticketTiers: {
            type: 'array',
            description: 'Available ticket tiers',
            items: { $ref: '#/components/schemas/TicketTier' },
          },
          userRsvp: {
            type: 'object',
            description: 'Current user\'s RSVP (if authenticated)',
            properties: {
              id: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' },
            },
          },
          userTicket: {
            type: 'object',
            description: 'Current user\'s ticket (if authenticated)',
            properties: {
              id: { type: 'string' },
              ticketNumber: { type: 'string' },
              status: { type: 'string' },
              quantity: { type: 'integer' },
              purchasedAt: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
      TicketTier: {
        type: 'object',
        required: ['id', 'eventId', 'tierName', 'price', 'currency', 'isActive'],
        properties: {
          id: { type: 'string', description: 'Ticket tier ID' },
          eventId: { type: 'string', description: 'Event ID' },
          tierName: { type: 'string', minLength: 2, maxLength: 100, description: 'Tier name (e.g., Early Bird, VIP)' },
          description: { type: 'string', maxLength: 500, description: 'Tier description' },
          price: { type: 'number', minimum: 0, description: 'Ticket price' },
          currency: { type: 'string', default: 'MYR', description: 'Currency code' },
          totalQuantity: { type: 'integer', minimum: 0, description: 'Total available tickets (null = unlimited)' },
          soldQuantity: { type: 'integer', minimum: 0, description: 'Number of tickets sold' },
          availableQuantity: { type: 'integer', minimum: 0, description: 'Remaining tickets' },
          minPurchase: { type: 'integer', minimum: 1, default: 1, description: 'Minimum tickets per purchase' },
          maxPurchase: { type: 'integer', minimum: 1, default: 10, description: 'Maximum tickets per purchase' },
          availableFrom: { type: 'string', format: 'date-time', description: 'Tier available from date' },
          availableUntil: { type: 'string', format: 'date-time', description: 'Tier available until date' },
          displayOrder: { type: 'integer', default: 0, description: 'Display order' },
          isActive: { type: 'boolean', description: 'Whether tier is active' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      EventTicket: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Ticket ID' },
          eventId: { type: 'string', description: 'Event ID' },
          userId: { type: 'string', description: 'User ID' },
          ticketTierId: { type: 'string', description: 'Ticket tier ID' },
          ticketType: { type: 'string', default: 'GENERAL', description: 'Ticket type' },
          price: { type: 'number', description: 'Ticket price' },
          currency: { type: 'string', default: 'MYR', description: 'Currency code' },
          status: {
            type: 'string',
            enum: ['PENDING', 'ACTIVE', 'USED', 'CANCELED', 'REFUNDED'],
            description: 'Ticket status',
          },
          paymentStatus: {
            type: 'string',
            enum: ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED', 'PROCESSING', 'CANCELED'],
            description: 'Payment status',
          },
          ticketNumber: { type: 'string', description: 'Unique ticket number (TKT-timestamp-random)' },
          quantity: { type: 'integer', minimum: 1, description: 'Number of tickets' },
          purchasedAt: { type: 'string', format: 'date-time', description: 'Purchase timestamp' },
          checkedInAt: { type: 'string', format: 'date-time', description: 'Check-in timestamp' },
          attendeeName: { type: 'string', description: 'Attendee name' },
          attendeeEmail: { type: 'string', format: 'email', description: 'Attendee email' },
          attendeePhone: { type: 'string', description: 'Attendee phone' },
          event: {
            type: 'object',
            description: 'Event details',
            properties: {
              id: { type: 'string' },
              title: { type: 'string' },
              date: { type: 'string', format: 'date-time' },
              location: { type: 'string' },
              images: { type: 'array', items: { type: 'string' } },
            },
          },
        },
      },
      EventParticipant: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Participant ID' },
          userId: { type: 'string', description: 'User ID' },
          eventId: { type: 'string', description: 'Event ID' },
          status: { 
            type: 'string', 
            enum: ['REGISTERED', 'WAITLISTED', 'CONFIRMED', 'CHECKED_IN', 'CANCELED'],
            description: 'Participant status' 
          },
          qrCode: { type: 'string', description: 'Secure token for QR code generation' },
          checkedInAt: { type: 'string', format: 'date-time', description: 'Check-in timestamp', nullable: true },
          canceledAt: { type: 'string', format: 'date-time', description: 'Cancellation timestamp', nullable: true },
          createdAt: { type: 'string', format: 'date-time', description: 'Registration timestamp' },
          updatedAt: { type: 'string', format: 'date-time', description: 'Last update timestamp' },
          event: {
            type: 'object',
            description: 'Event details',
            properties: {
              id: { type: 'string' },
              title: { type: 'string' },
              date: { type: 'string', format: 'date-time' },
              location: { type: 'string' },
              type: { type: 'string' },
            },
          },
          user: {
            type: 'object',
            description: 'User details',
            properties: {
              id: { type: 'string' },
              fullName: { type: 'string' },
              username: { type: 'string' },
              email: { type: 'string', format: 'email' },
              profilePicture: { type: 'string', format: 'uri' },
            },
          },
        },
      },
      Community: {
        type: 'object',
        required: ['id', 'name', 'createdBy', 'isVerified'],
        properties: {
          id: { type: 'string', description: 'Community ID' },
          name: { type: 'string', minLength: 3, maxLength: 100, description: 'Community name (unique)' },
          description: { type: 'string', minLength: 10, maxLength: 2000, description: 'Community description' },
          imageUrl: { type: 'string', format: 'uri', description: 'Community image URL' },
          category: { type: 'string', maxLength: 50, description: 'Community category' },
          isVerified: { type: 'boolean', default: false, description: 'Whether community is verified' },
          createdBy: { type: 'string', description: 'Creator user ID' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
          memberCount: { type: 'integer', description: 'Total approved members' },
          eventCount: { type: 'integer', description: 'Total events hosted' },
          creator: {
            type: 'object',
            description: 'Community creator details',
            properties: {
              id: { type: 'string' },
              displayName: { type: 'string' },
              profilePicture: { type: 'string', format: 'uri' },
            },
          },
          userRole: {
            type: 'string',
            enum: ['ADMIN', 'MODERATOR', 'MEMBER'],
            description: 'Current user\'s role (if member)',
            nullable: true,
          },
          userMembership: {
            type: 'object',
            description: 'Current user\'s membership details (if member)',
            nullable: true,
            properties: {
              role: { type: 'string', enum: ['ADMIN', 'MODERATOR', 'MEMBER'] },
              isApproved: { type: 'boolean' },
              joinedAt: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
      CommunityMember: {
        type: 'object',
        required: ['id', 'communityId', 'userId', 'role', 'isApproved'],
        properties: {
          id: { type: 'string', description: 'Membership ID' },
          communityId: { type: 'string', description: 'Community ID' },
          userId: { type: 'string', description: 'User ID' },
          role: {
            type: 'string',
            enum: ['ADMIN', 'MODERATOR', 'MEMBER'],
            default: 'MEMBER',
            description: 'Member role in community',
          },
          isApproved: { type: 'boolean', default: false, description: 'Whether membership is approved' },
          joinedAt: { type: 'string', format: 'date-time', description: 'When user joined' },
          user: {
            type: 'object',
            description: 'User details',
            properties: {
              id: { type: 'string' },
              displayName: { type: 'string' },
              profilePicture: { type: 'string', format: 'uri' },
              trustScore: { type: 'number', minimum: 0, maximum: 100 },
              trustLevel: { type: 'string', enum: ['starter', 'trusted', 'leader'] },
            },
          },
        },
      },
      CommunityVouch: {
        type: 'object',
        properties: {
          vouchId: { type: 'string', description: 'Vouch ID' },
          communityId: { type: 'string', description: 'Community ID' },
          voucherId: { type: 'string', description: 'Community ID (voucher)' },
          voucheeId: { type: 'string', description: 'User ID being vouched for' },
          type: { type: 'string', enum: ['SECONDARY'], description: 'Community vouches are always SECONDARY' },
          status: { type: 'string', enum: ['PENDING', 'ACTIVE', 'REVOKED'], description: 'Vouch status' },
          isCommunityVouch: { type: 'boolean', default: true, description: 'Identifies community vouches' },
          trustScoreWeight: { type: 'number', default: 20, description: 'Weight contribution (20% per vouch)' },
          reason: { type: 'string', maxLength: 500, description: 'Reason for vouch' },
          revokeReason: { type: 'string', maxLength: 500, description: 'Reason for revocation (if revoked)' },
          createdAt: { type: 'string', format: 'date-time' },
          revokedAt: { type: 'string', format: 'date-time', nullable: true },
        },
      },
      CommunityStats: {
        type: 'object',
        properties: {
          totalMembers: { type: 'integer', description: 'Total approved members' },
          adminCount: { type: 'integer', description: 'Number of admins' },
          moderatorCount: { type: 'integer', description: 'Number of moderators' },
          memberCount: { type: 'integer', description: 'Number of regular members' },
          pendingApprovals: { type: 'integer', description: 'Pending membership requests' },
          totalEvents: { type: 'integer', description: 'Total events hosted' },
          activeEvents: { type: 'integer', description: 'Active/upcoming events' },
          totalVouches: { type: 'integer', description: 'Total community vouches granted' },
        },
      },
      TrustMoment: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Trust moment ID' },
          connectionId: { type: 'string', description: 'Connection ID' },
          giverId: { type: 'string', description: 'User who gave feedback' },
          receiverId: { type: 'string', description: 'User who received feedback' },
          eventId: { type: 'string', nullable: true, description: 'Event ID if event-based' },
          momentType: {
            type: 'string',
            enum: ['event', 'travel', 'collaboration', 'service', 'general'],
            default: 'general',
            description: 'Type of shared experience',
          },
          rating: {
            type: 'integer',
            minimum: 1,
            maximum: 5,
            description: 'Rating from 1 (poor) to 5 (excellent)',
          },
          feedback: { type: 'string', maxLength: 1000, nullable: true, description: 'Detailed feedback text' },
          experienceDescription: { type: 'string', maxLength: 500, nullable: true, description: 'Brief experience description' },
          tags: {
            type: 'array',
            items: { type: 'string' },
            description: 'Tags for categorization (e.g., friendly, reliable, helpful)',
          },
          isPublic: { type: 'boolean', default: true, description: 'Public visibility' },
          isVerified: { type: 'boolean', default: false, description: 'Verified by system' },
          trustImpact: {
            type: 'number',
            description: 'Trust score impact: -5 (rating 1) to +5 (rating 5)',
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
          giver: {
            type: 'object',
            description: 'Feedback giver details',
            properties: {
              id: { type: 'string' },
              fullName: { type: 'string' },
              username: { type: 'string', nullable: true },
              profilePicture: { type: 'string', format: 'uri', nullable: true },
              trustScore: { type: 'number', minimum: 0, maximum: 100 },
              trustLevel: { type: 'string', enum: ['starter', 'trusted', 'leader'] },
            },
          },
          receiver: {
            type: 'object',
            description: 'Feedback receiver details',
            properties: {
              id: { type: 'string' },
              fullName: { type: 'string' },
              username: { type: 'string', nullable: true },
              profilePicture: { type: 'string', format: 'uri', nullable: true },
              trustScore: { type: 'number', minimum: 0, maximum: 100 },
              trustLevel: { type: 'string', enum: ['starter', 'trusted', 'leader'] },
            },
          },
          event: {
            type: 'object',
            nullable: true,
            description: 'Event details if event-based',
            properties: {
              id: { type: 'string' },
              title: { type: 'string' },
              type: { type: 'string' },
              date: { type: 'string', format: 'date-time' },
              location: { type: 'string' },
            },
          },
        },
      },
      TrustMomentStats: {
        type: 'object',
        properties: {
          received: {
            type: 'object',
            properties: {
              total: { type: 'integer', description: 'Total feedback received' },
              averageRating: { type: 'number', description: 'Average rating received' },
              ratingDistribution: {
                type: 'object',
                properties: {
                  oneStar: { type: 'integer' },
                  twoStar: { type: 'integer' },
                  threeStar: { type: 'integer' },
                  fourStar: { type: 'integer' },
                  fiveStar: { type: 'integer' },
                },
              },
              byMomentType: {
                type: 'object',
                description: 'Count by moment type',
                additionalProperties: { type: 'integer' },
              },
              topTags: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    tag: { type: 'string' },
                    count: { type: 'integer' },
                  },
                },
              },
              positiveCount: { type: 'integer', description: 'Count of 4-5 star ratings' },
              neutralCount: { type: 'integer', description: 'Count of 3 star ratings' },
              negativeCount: { type: 'integer', description: 'Count of 1-2 star ratings' },
            },
          },
          given: {
            type: 'object',
            properties: {
              total: { type: 'integer', description: 'Total feedback given' },
              averageRating: { type: 'number', description: 'Average rating given' },
              byMomentType: {
                type: 'object',
                description: 'Count by moment type',
                additionalProperties: { type: 'integer' },
              },
            },
          },
          trustImpact: {
            type: 'object',
            properties: {
              total: { type: 'number', description: 'Total trust impact from all feedback' },
              fromPositive: { type: 'number', description: 'Impact from positive feedback (4-5 stars)' },
              fromNeutral: { type: 'number', description: 'Impact from neutral feedback (3 stars)' },
              fromNegative: { type: 'number', description: 'Impact from negative feedback (1-2 stars)' },
            },
          },
        },
      },
      VouchEligibility: {
        type: 'object',
        properties: {
          eligible: { type: 'boolean', description: 'Whether user is eligible for auto-vouch' },
          reason: { type: 'string', description: 'Explanation of eligibility status' },
          criteria: {
            type: 'object',
            properties: {
              eventsAttended: { type: 'integer', description: 'Events attended' },
              requiredEvents: { type: 'integer', default: 5, description: 'Required events' },
              membershipDays: { type: 'integer', description: 'Days as member' },
              requiredDays: { type: 'integer', default: 90, description: 'Required days' },
              currentVouches: { type: 'integer', description: 'Current community vouches' },
              maxVouches: { type: 'integer', default: 2, description: 'Maximum vouches allowed' },
              hasNegativeFeedback: { type: 'boolean', description: 'Whether user has negative feedback' },
            },
          },
        },
      },
      QRCodeResponse: {
        type: 'object',
        properties: {
          qrCode: {
            type: 'string',
            description: 'Base64-encoded PNG QR code image (Data URL format). Contains signed JWT token with RSVP details. Valid for 30 days or until 24 hours after event.',
            example: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...',
          },
        },
      },
      CommunityQRCodeResponse: {
        type: 'object',
        required: ['communityId', 'qrCodeDataUrl', 'previewUrl', 'webUrl'],
        properties: {
          communityId: { 
            type: 'string', 
            description: 'Community ID',
            example: 'cmh09ozdw0005cpb2rj7vus2n',
          },
          qrCodeDataUrl: {
            type: 'string',
            description: 'Base64-encoded PNG QR code image (400x400px). Encodes the preview URL for sharing.',
            example: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAZAAAAGQ...',
          },
          previewUrl: {
            type: 'string',
            format: 'uri',
            description: 'Public preview URL (no auth required). This is what the QR code encodes.',
            example: 'https://app.berse.com/community-preview/cmh09ozdw0005cpb2rj7vus2n',
          },
          webUrl: {
            type: 'string',
            format: 'uri',
            description: 'Deep link URL for in-app navigation. Opens the app if installed.',
            example: 'https://app.berse.com/communities/cmh09ozdw0005cpb2rj7vus2n',
          },
        },
      },
      PublicCommunityPreview: {
        type: 'object',
        required: ['id', 'name', 'interests', 'isVerified', 'memberCount', 'upcomingEvents', 'downloadLinks'],
        properties: {
          id: { 
            type: 'string', 
            description: 'Community ID',
            example: 'cmh09ozdw0005cpb2rj7vus2n',
          },
          name: { 
            type: 'string', 
            description: 'Community name',
            example: 'Tech Innovators KL',
          },
          description: { 
            type: 'string', 
            nullable: true,
            description: 'Community description',
            example: 'Hub for developers, entrepreneurs, and tech enthusiasts in KL.',
          },
          logoUrl: { 
            type: 'string', 
            format: 'uri',
            nullable: true,
            description: 'Community logo URL',
            example: 'https://cdn.berse.com/logos/tech-kl.jpg',
          },
          coverImageUrl: { 
            type: 'string', 
            format: 'uri',
            nullable: true,
            description: 'Community cover image URL',
            example: 'https://cdn.berse.com/covers/tech-kl.jpg',
          },
          interests: {
            type: 'array',
            items: { type: 'string' },
            description: 'Community interests/tags',
            example: ['technology', 'startups', 'innovation'],
          },
          isVerified: { 
            type: 'boolean', 
            description: 'Whether community is verified',
            example: true,
          },
          memberCount: { 
            type: 'integer', 
            description: 'Total number of approved members',
            example: 247,
          },
          upcomingEvents: {
            type: 'array',
            description: 'Upcoming published events (max 10)',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                title: { type: 'string' },
                type: { type: 'string' },
                date: { type: 'string', format: 'date-time' },
                location: { type: 'string' },
                images: { type: 'array', items: { type: 'string' } },
                isFree: { type: 'boolean' },
                price: { type: 'number', nullable: true },
              },
            },
            example: [
              {
                id: 'evt-001',
                title: 'Tech Meetup',
                type: 'MEETUP',
                date: '2025-10-30T18:00:00Z',
                location: 'KL Sentral',
                images: ['https://cdn.berse.com/events/tech-meetup.jpg'],
                isFree: true,
                price: null,
              },
            ],
          },
          downloadLinks: {
            type: 'object',
            required: ['ios', 'android', 'deepLink'],
            properties: {
              ios: {
                type: 'string',
                format: 'uri',
                description: 'Apple App Store URL',
                example: 'https://apps.apple.com/app/berse',
              },
              android: {
                type: 'string',
                format: 'uri',
                description: 'Google Play Store URL',
                example: 'https://play.google.com/store/apps/details?id=com.berse.app',
              },
              deepLink: {
                type: 'string',
                format: 'uri',
                description: 'Universal/deep link URL',
                example: 'https://app.berse.com/communities/cmh09ozdw0005cpb2rj7vus2n',
              },
            },
          },
        },
      },
      Error: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string' },
          error: { type: 'string' },
          statusCode: { type: 'number' },
        },
      },
      ValidationError: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string' },
          errors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: { type: 'string' },
                message: { type: 'string' },
              },
            },
          },
        },
      },
    },
    responses: {
      UnauthorizedError: {
        description: 'Authentication token is missing or invalid',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
            example: {
              success: false,
              message: 'Unauthorized',
              error: 'Invalid or expired token',
              statusCode: 401,
            },
          },
        },
      },
      ForbiddenError: {
        description: 'Access forbidden - insufficient permissions',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
            example: {
              success: false,
              message: 'Forbidden',
              error: 'You do not have permission to access this resource',
              statusCode: 403,
            },
          },
        },
      },
      NotFoundError: {
        description: 'Resource not found',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
            example: {
              success: false,
              message: 'Not Found',
              error: 'The requested resource was not found',
              statusCode: 404,
            },
          },
        },
      },
      ValidationError: {
        description: 'Validation error',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ValidationError' },
            example: {
              success: false,
              message: 'Validation failed',
              errors: [
                {
                  field: 'email',
                  message: 'Invalid email format',
                },
              ],
            },
          },
        },
      },
      ServerError: {
        description: 'Internal server error',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
            example: {
              success: false,
              message: 'Internal Server Error',
              error: 'An unexpected error occurred',
              statusCode: 500,
            },
          },
        },
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
};

const options: swaggerJsdoc.Options = {
  definition: swaggerDefinition,
  // Path to the API routes that have JSDoc comments
  apis: [
    './src/modules/**/*.ts',
    './src/routes/**/*.ts',
    './src/controllers/**/*.ts',
    './docs/swagger/**/*.yaml', // Optional: separate YAML files
  ],
};

export const swaggerSpec = swaggerJsdoc(options) as any;

// Merge subscription module documentation
if (subscriptionSwaggerDocs.components?.schemas) {
  swaggerSpec.components = swaggerSpec.components || {};
  swaggerSpec.components.schemas = {
    ...swaggerSpec.components.schemas,
    ...subscriptionSwaggerDocs.components.schemas,
  };
}

if (subscriptionSwaggerDocs.paths) {
  swaggerSpec.paths = {
    ...swaggerSpec.paths,
    ...subscriptionSwaggerDocs.paths,
  };
}
