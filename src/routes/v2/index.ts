import { Router } from 'express';
import { authRoutes } from '../../modules/auth';
import { userRoutes } from '../../modules/user';

const router = Router();

// ============================================================================
// V2 API ROUTES
// ============================================================================

/**
 * Authentication routes
 * Base path: /v2/auth
 */
router.use('/auth', authRoutes);

/**
 * User/Profile routes
 * Base path: /v2/users
 */
router.use('/users', userRoutes);

// ============================================================================
// API HEALTH & DOCUMENTATION
// ============================================================================

/**
 * @swagger
 * /v2/health:
 *   get:
 *     summary: API health check
 *     description: Check the health status of the API v2 and get available endpoints
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API is healthy and operational
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 version:
 *                   type: string
 *                   example: v2
 *                 status:
 *                   type: string
 *                   example: healthy
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: 2024-01-15T10:30:00.000Z
 *                 endpoints:
 *                   type: object
 *                   properties:
 *                     auth:
 *                       type: string
 *                       example: /v2/auth
 *                     users:
 *                       type: string
 *                       example: /v2/users
 */
router.get('/health', (req, res) => {
  res.json({
    version: 'v2',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/v2/auth',
      users: '/v2/users',
    },
  });
});

/**
 * @swagger
 * /v2/docs:
 *   get:
 *     summary: API v2 documentation
 *     description: Get comprehensive API v2 documentation including all available endpoints and authentication details
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API documentation retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 version:
 *                   type: string
 *                   example: v2
 *                 title:
 *                   type: string
 *                   example: Berse Platform API v2
 *                 description:
 *                   type: string
 *                   example: Modern, modular API for the Berse platform
 *                 baseUrl:
 *                   type: string
 *                   example: https://api.berse-app.com
 *                 documentation:
 *                   type: object
 *                   properties:
 *                     auth:
 *                       type: string
 *                     users:
 *                       type: string
 *                 endpoints:
 *                   type: object
 *                   properties:
 *                     auth:
 *                       type: object
 *                     users:
 *                       type: object
 *                 authentication:
 *                   type: object
 *                   properties:
 *                     type:
 *                       type: string
 *                       example: Bearer Token
 *                     header:
 *                       type: string
 *                       example: Authorization: Bearer <token>
 *                     refreshToken:
 *                       type: string
 *                       example: Stored in httpOnly cookie or sent in request body
 *                 rateLimit:
 *                   type: object
 *                   properties:
 *                     general:
 *                       type: string
 *                       example: 100 requests per 15 minutes
 *                     auth:
 *                       type: string
 *                       example: 20 requests per 15 minutes
 *                     login:
 *                       type: string
 *                       example: 5 attempts per 15 minutes
 *                     register:
 *                       type: string
 *                       example: 3 attempts per hour
 */
router.get('/docs', (req, res) => {
  res.json({
    version: 'v2',
    title: 'Berse Platform API v2',
    description: 'Modern, modular API for the Berse platform',
    baseUrl: 'https://api.berse-app.com',
    documentation: {
      auth: 'See /docs/api/AUTH_API.md',
      users: 'See /docs/api/USER_API.md',
    },
    endpoints: {
      auth: {
        'POST /v2/auth/register': 'Register new user',
        'POST /v2/auth/login': 'User login',
        'POST /v2/auth/refresh-token': 'Refresh access token',
        'POST /v2/auth/logout': 'User logout',
        'POST /v2/auth/logout-all': 'Logout from all devices',
        'GET /v2/auth/me': 'Get current user profile',
        'POST /v2/auth/change-password': 'Change password',
        'POST /v2/auth/forgot-password': 'Request password reset',
        'POST /v2/auth/reset-password': 'Reset password with token',
      },
      users: {
        'GET /v2/users/profile': 'Get user profile',
        'PUT /v2/users/profile': 'Update user profile',
        'GET /v2/users/all': 'Get all users (discovery)',
        'GET /v2/users/search': 'Search users',
        'GET /v2/users/:id': 'Get user by ID',
        'POST /v2/users/follow/:id': 'Follow user / Send friend request',
        'DELETE /v2/users/follow/:id': 'Unfollow user',
        'POST /v2/users/upload-avatar': 'Upload profile picture',
        'DELETE /v2/users/:id': 'Delete user (admin only)',
      },
    },
    authentication: {
      type: 'Bearer Token',
      header: 'Authorization: Bearer <token>',
      refreshToken: 'Stored in httpOnly cookie or sent in request body',
    },
    rateLimit: {
      general: '100 requests per 15 minutes',
      auth: '20 requests per 15 minutes',
      login: '5 attempts per 15 minutes',
      register: '3 attempts per hour',
    },
  });
});

export default router;
