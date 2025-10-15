import swaggerJsdoc from 'swagger-jsdoc';
import { config } from './index';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Berse Platform API',
    version: '2.0.2',
    description: `Modern, modular API for the Berse social platform with event management, user connections, and community features.
    
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
