import swaggerJsdoc from 'swagger-jsdoc';
import { config } from './index';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Berse Platform API',
    version: '2.1.0',
    description: `Modern, modular API for the Berse social platform with event management, user connections, and community features.
    
**Version 2.1.0 Updates (October 16, 2025):**
- **Events Module**: Complete event management system with 15 endpoints
  - Create and manage events (free and paid)
  - Multi-tier ticket pricing with capacity management
  - RSVP system for free events with secure QR codes
  - QR code-based check-in system with JWT security
  - Real-time attendee tracking and reporting
- **Secure QR Codes**: JWT-based QR codes with cryptographic signatures
  - No storage required - generated on-demand
  - Time-limited tokens (30 days or event date + 24h)
  - Double validation (JWT + database token)
  - Event-specific binding
- **Enhanced Documentation**: Comprehensive API docs in /docs/api-v2/EVENTS_API.md

**Version 2.0.2 Updates (October 15, 2025):**
- **Connection Count Names**: Simplified Prisma-generated relation names in _count responses
  - user_connections_user_connections_initiatorIdTousers → connectionsInitiated
  - user_connections_user_connections_receiverIdTousers → connectionsReceived
  - referrals_referrals_referrerIdTousers → referralsMade
- **Better DX**: More readable and self-documenting field names in API responses
- **Activity Logging**: Complete security event tracking system with login attempts, device registration, and session management

**Version 2.0.1 Updates (October 15, 2025):**
- Fixed Prisma upsert operations for UserProfile and UserLocation
- Proper ID generation for UserConnection using cuid2
- Fixed route ordering to prevent path conflicts
- Added pagination validation (negative values, max limits)
- Enhanced URL validation requiring protocols
- Fixed connection removal authorization
- All endpoints tested and verified (35+ tests passing)
- Comprehensive documentation updates

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
    {
      name: 'Authentication',
      description: 'User authentication and authorization endpoints',
    },
    {
      name: 'Users',
      description: 'User profile and management endpoints',
    },
    {
      name: 'Connections',
      description: 'User connection and relationship management',
    },
    {
      name: 'Events',
      description: 'Event creation, management, and discovery. Support for both free and paid events with comprehensive features.',
    },
    {
      name: 'Events - Tickets',
      description: 'Ticket tier management and purchase. Multi-tier pricing, capacity management, and payment integration.',
    },
    {
      name: 'Events - RSVP',
      description: 'RSVP management for free events. Includes secure QR code generation for check-ins.',
    },
    {
      name: 'Events - Attendance',
      description: 'Attendee check-in and attendance tracking. QR code-based check-in system with JWT security.',
    },
    {
      name: 'Events - Discovery',
      description: 'Event discovery features including trending events, nearby events, personalized recommendations, and community events.',
    },
    {
      name: 'Metadata',
      description: 'Country, state, city, region, timezone, and location metadata endpoints. Provides comprehensive geographical data including countries, states/provinces, cities with coordinates, regions, and timezones for global coverage.',
    },
    {
      name: 'Health',
      description: 'API health and status checks',
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
          trustScore: { type: 'number' },
          trustLevel: { type: 'string' },
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
              eventRsvps: { 
                type: 'number',
                description: 'Number of event RSVPs',
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
          price: { type: 'number', minimum: 0, description: 'Base ticket price (if not free)' },
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
          ticketsSold: { type: 'integer', description: 'Number of tickets sold' },
          totalRevenue: { type: 'number', description: 'Total revenue from ticket sales' },
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
      EventRSVP: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'RSVP ID' },
          eventId: { type: 'string', description: 'Event ID' },
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
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      EventAttendance: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Attendance record ID' },
          eventId: { type: 'string', description: 'Event ID' },
          userId: { type: 'string', description: 'User ID' },
          user: {
            type: 'object',
            description: 'User details',
            properties: {
              id: { type: 'string' },
              displayName: { type: 'string' },
              profilePicture: { type: 'string', format: 'uri' },
            },
          },
          checkedInAt: { type: 'string', format: 'date-time', description: 'Check-in timestamp' },
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

export const swaggerSpec = swaggerJsdoc(options);
