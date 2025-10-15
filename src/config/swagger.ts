import swaggerJsdoc from 'swagger-jsdoc';
import { config } from './index';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Berse Platform API',
    version: '2.0.0',
    description: 'Modern, modular API for the Berse social platform with event management, user connections, and community features.',
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
        properties: {
          id: { type: 'string', format: 'uuid' },
          initiatorId: { type: 'string', format: 'uuid' },
          receiverId: { type: 'string', format: 'uuid' },
          status: {
            type: 'string',
            enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'CANCELED', 'REMOVED'],
          },
          message: { type: 'string' },
          relationshipType: { type: 'string' },
          relationshipCategory: { type: 'string' },
          trustStrength: { type: 'number' },
          createdAt: { type: 'string', format: 'date-time' },
          respondedAt: { type: 'string', format: 'date-time' },
          connectedAt: { type: 'string', format: 'date-time' },
          removedAt: { type: 'string', format: 'date-time' },
          canReconnectAt: { type: 'string', format: 'date-time' },
          users_user_connections_initiatorIdTousers: { $ref: '#/components/schemas/User' },
          users_user_connections_receiverIdTousers: { $ref: '#/components/schemas/User' },
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
