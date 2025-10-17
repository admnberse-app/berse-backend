import { Router } from 'express';
import { UserController } from './user.controller';
import { authenticateToken } from '../../middleware/auth';
import { handleValidationErrors } from '../../middleware/validation';
import { updateProfileValidators, searchUsersValidators } from './user.validators';
import { upload } from '../../middleware/upload';
import { uploadLimiter } from '../../middleware/rateLimiter';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// ============================================================================
// PROFILE ROUTES
// ============================================================================

/**
 * @swagger
 * /v2/users/profile:
 *   get:
 *     summary: Get current user profile
 *     description: Get complete profile information for the authenticated user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   allOf:
 *                     - $ref: '#/components/schemas/User'
 *                     - type: object
 *                       properties:
 *                         profile:
 *                           $ref: '#/components/schemas/UserProfile'
 *                         location:
 *                           $ref: '#/components/schemas/UserLocation'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/profile', UserController.getProfile);

/**
 * @swagger
 * /v2/users/profile:
 *   put:
 *     summary: Update user profile
 *     description: Update profile information for the authenticated user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: John Doe
 *               username:
 *                 type: string
 *                 example: johndoe
 *               phone:
 *                 type: string
 *                 example: +1234567890
 *               bio:
 *                 type: string
 *                 example: Software developer and travel enthusiast
 *               shortBio:
 *                 type: string
 *                 example: Developer | Traveler
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *                 example: 1990-01-15
 *               gender:
 *                 type: string
 *                 example: male
 *               nationality:
 *                 type: string
 *                 example: American
 *               currentCity:
 *                 type: string
 *                 example: New York
 *               homeTown:
 *                 type: string
 *                 example: Los Angeles
 *               country:
 *                 type: string
 *                 example: United States
 *               latitude:
 *                 type: number
 *                 format: float
 *                 example: 40.7128
 *                 description: GPS latitude coordinate
 *               longitude:
 *                 type: number
 *                 format: float
 *                 example: -74.0060
 *                 description: GPS longitude coordinate
 *               languages:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: [English, Spanish]
 *               interests:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: [Travel, Photography, Coding]
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Profile updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.put(
  '/profile',
  updateProfileValidators,
  handleValidationErrors,
  UserController.updateProfile
);

/**
 * @swagger
 * /v2/users/upload-avatar:
 *   post:
 *     summary: Upload profile picture
 *     description: Upload or update user's profile picture
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - avatar
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: Image file (JPEG, PNG, WebP)
 *     responses:
 *       200:
 *         description: Avatar uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Avatar uploaded successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     profilePicture:
 *                       type: string
 *                       example: https://example.com/uploads/avatar-123.jpg
 *       400:
 *         description: Invalid file format or size
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       429:
 *         description: Too many upload attempts
 */
router.post(
  '/upload-avatar',
  uploadLimiter,
  upload.single('avatar'),
  UserController.uploadAvatar
);

// ============================================================================
// USER DISCOVERY & SEARCH
// ============================================================================

/**
 * @swagger
 * /v2/users/all:
 *   get:
 *     summary: Get all users
 *     description: Get list of all users for discovery/matching screen
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of users per page
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/all', UserController.getAllUsers);

/**
 * @swagger
 * /v2/users/recommendations:
 *   get:
 *     summary: Get personalized user recommendations
 *     description: Get AI-powered user recommendations based on interests, location, and connection patterns
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           maximum: 50
 *         description: Number of recommendations to return
 *     responses:
 *       200:
 *         description: Recommendations retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     recommendations:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           fullName:
 *                             type: string
 *                           score:
 *                             type: number
 *                             description: Recommendation score (0-100)
 *                           reasons:
 *                             type: array
 *                             items:
 *                               type: string
 *                             description: Why this user is recommended
 *                           profile:
 *                             type: object
 *                           location:
 *                             type: object
 *                     total:
 *                       type: integer
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/recommendations', UserController.getUserRecommendations);

/**
 * @swagger
 * /v2/users/trending-interests:
 *   get:
 *     summary: Get trending interests
 *     description: Get the most popular interests in the community
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           maximum: 50
 *         description: Number of trending interests to return
 *     responses:
 *       200:
 *         description: Trending interests retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     interests:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           interest:
 *                             type: string
 *                           count:
 *                             type: number
 *                     total:
 *                       type: integer
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/trending-interests', UserController.getTrendingInterests);

/**
 * @swagger
 * /v2/users/search:
 *   get:
 *     summary: Search users
 *     description: Search users by name, username, location, or interests
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query
 *         example: john
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: Filter by city
 *         example: New York
 *       - in: query
 *         name: interests
 *         schema:
 *           type: string
 *         description: Filter by interests (comma-separated)
 *         example: travel,photography
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Results per page
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
 *                     pagination:
 *                       type: object
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get(
  '/search',
  searchUsersValidators,
  handleValidationErrors,
  UserController.searchUsers
);

/**
 * @swagger
 * /v2/users/nearby:
 *   get:
 *     summary: Find nearby users
 *     description: Find users within a specific radius using geospatial search (respects location privacy settings)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: latitude
 *         required: true
 *         schema:
 *           type: number
 *           format: float
 *         description: Your current latitude
 *         example: 3.1390
 *       - in: query
 *         name: longitude
 *         required: true
 *         schema:
 *           type: number
 *           format: float
 *         description: Your current longitude
 *         example: 101.6869
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *           default: 10
 *           minimum: 1
 *           maximum: 500
 *         description: Search radius in kilometers
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           maximum: 100
 *     responses:
 *       200:
 *         description: Nearby users found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           fullName:
 *                             type: string
 *                           distance:
 *                             type: number
 *                             description: Distance in kilometers
 *                           distanceFormatted:
 *                             type: string
 *                             example: 2.5km
 *                           profile:
 *                             type: object
 *                           location:
 *                             type: object
 *                             description: Location data (filtered by privacy settings)
 *                           isConnected:
 *                             type: boolean
 *                     center:
 *                       type: object
 *                       properties:
 *                         latitude:
 *                           type: number
 *                         longitude:
 *                           type: number
 *                     radius:
 *                       type: number
 *                     pagination:
 *                       type: object
 *       400:
 *         description: Invalid parameters
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/nearby', UserController.findNearbyUsers);

// ============================================================================
// CONNECTIONS ROUTES
// ============================================================================

/**
 * @swagger
 * /v2/users/connections:
 *   get:
 *     summary: Get user connections
 *     description: Get list of user's connections with optional status filter
 *     tags: [Connections]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, ACCEPTED, REJECTED, CANCELED, REMOVED]
 *         description: Filter by connection status
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Connections retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     connections:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/UserConnection'
 *                     pagination:
 *                       type: object
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/connections', UserController.getConnections);

/**
 * @swagger
 * /v2/users/connections/{id}/request:
 *   post:
 *     summary: Send connection request
 *     description: Send a connection request to another user
 *     tags: [Connections]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID to connect with
 *     responses:
 *       201:
 *         description: Connection request sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Connection request sent
 *                 data:
 *                   $ref: '#/components/schemas/UserConnection'
 *       400:
 *         description: Invalid request (already connected, pending request exists, etc.)
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: User not found
 */
router.post('/connections/:id/request', UserController.sendConnectionRequest);

/**
 * @swagger
 * /v2/users/connections/{id}/accept:
 *   post:
 *     summary: Accept connection request
 *     description: Accept a pending connection request
 *     tags: [Connections]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Connection ID
 *     responses:
 *       200:
 *         description: Connection accepted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Connection accepted
 *                 data:
 *                   $ref: '#/components/schemas/UserConnection'
 *       400:
 *         description: Invalid request
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Connection request not found
 */
router.post('/connections/:id/accept', UserController.acceptConnectionRequest);

/**
 * @swagger
 * /v2/users/connections/{id}/reject:
 *   post:
 *     summary: Reject connection request
 *     description: Reject a pending connection request
 *     tags: [Connections]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Connection ID
 *     responses:
 *       200:
 *         description: Connection rejected
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Connection rejected
 *       400:
 *         description: Invalid request
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Connection request not found
 */
router.post('/connections/:id/reject', UserController.rejectConnectionRequest);

/**
 * @swagger
 * /v2/users/connections/{id}/cancel:
 *   post:
 *     summary: Cancel connection request
 *     description: Cancel a sent connection request
 *     tags: [Connections]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Connection ID
 *     responses:
 *       200:
 *         description: Connection request canceled
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Connection request canceled
 *       400:
 *         description: Invalid request
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Connection request not found
 */
router.post('/connections/:id/cancel', UserController.cancelConnectionRequest);

/**
 * @swagger
 * /v2/users/connections/{id}:
 *   delete:
 *     summary: Remove connection
 *     description: Remove an existing connection with a user
 *     tags: [Connections]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Connection ID
 *     responses:
 *       200:
 *         description: Connection removed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Connection removed
 *       400:
 *         description: Invalid request
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Connection not found
 */
router.delete('/connections/:id', UserController.removeConnection);

// ============================================================================
// ACTIVITY & SECURITY ROUTES (Must be BEFORE /:id route)
// ============================================================================

/**
 * @swagger
 * /v2/users/activity:
 *   get:
 *     summary: Get user activity history
 *     description: Get the authenticated user's activity history
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of activities to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of activities to skip
 *     responses:
 *       200:
 *         description: Activity history retrieved
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/activity', UserController.getUserActivity);

/**
 * @swagger
 * /v2/users/security-events:
 *   get:
 *     summary: Get user security events
 *     description: Get the authenticated user's security event history
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of events to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of events to skip
 *     responses:
 *       200:
 *         description: Security events retrieved
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/security-events', UserController.getUserSecurityEvents);

/**
 * @swagger
 * /v2/users/sessions:
 *   get:
 *     summary: Get active sessions
 *     description: Get all active sessions for the authenticated user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Active sessions retrieved
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/sessions', UserController.getUserSessions);

/**
 * @swagger
 * /v2/users/login-history:
 *   get:
 *     summary: Get login history
 *     description: Get the authenticated user's login attempt history
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of login attempts to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of login attempts to skip
 *     responses:
 *       200:
 *         description: Login history retrieved
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/login-history', UserController.getUserLoginHistory);

/**
 * @swagger
 * /v2/users/sessions/{sessionToken}:
 *   delete:
 *     summary: Terminate a session
 *     description: Terminate a specific active session
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionToken
 *         required: true
 *         schema:
 *           type: string
 *         description: Session token to terminate
 *     responses:
 *       200:
 *         description: Session terminated successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.delete('/sessions/:sessionToken', UserController.terminateSession);

// ============================================================================
// GET USER BY ID (Must be after all specific routes)
// ============================================================================

/**
 * @swagger
 * /v2/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     description: Get detailed profile information for a specific user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
 *     responses:
 *       200:
 *         description: User profile retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get('/:id', UserController.getUserById);

// ============================================================================
// ADMIN ROUTES
// ============================================================================

/**
 * @swagger
 * /v2/users/{id}:
 *   delete:
 *     summary: Delete user
 *     description: Delete a user account (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID to delete
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: User deleted successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.delete('/:id', UserController.deleteUser);

export default router;
