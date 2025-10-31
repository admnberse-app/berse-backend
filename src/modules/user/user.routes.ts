import { Router } from 'express';
import { UserController } from './user.controller';
import { QRCodeController } from './qr-code.controller';
import { TrustScoreController } from './trust-score.controller';
import SettingsController from './settings.controller';
import { authenticateToken } from '../../middleware/auth';
import { ConnectionController } from '../connections/core/connection.controller';
import { connectionQueryValidators } from '../connections/core/connection.validators';
import { VouchController } from '../connections/vouching/vouch.controller';
import { vouchQueryValidators } from '../connections/vouching/vouch.validators';
import { GamificationController } from '../gamification/gamification.controller';
import subscriptionController from '../subscription/subscription.controller';
import { handleValidationErrors } from '../../middleware/validation';
import { updateProfileValidators, searchUsersValidators } from './user.validators';
import { generateQRCodeValidators, scanQRCodeValidators } from './qr-code.validators';
import { uploadImage } from '../../middleware/upload';
import { uploadLimiter } from '../../middleware/rateLimiter';

const router = Router();

// All routes require authentication
// router.use(authenticateToken);

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
router.get('/profile', authenticateToken, UserController.getProfile);

/**
 * @swagger
 * /v2/users/me:
 *   get:
 *     summary: Get own profile (comprehensive)
 *     description: |
 *       Get complete profile information for the authenticated user.
 *       This endpoint returns full profile data including statistics and trust information,
 *       but excludes relationship and shared activities sections (use GET /users/:id for that).
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
 *                   type: object
 *                   properties:
 *                     profile:
 *                       type: object
 *                       description: Complete profile information (all fields visible)
 *                     trust:
 *                       type: object
 *                       description: Trust score, badges, vouches, verifications
 *                     statistics:
 *                       type: object
 *                       description: Connections, communities, events, marketplace, travel stats
 *                     privacy:
 *                       type: object
 *                       description: Privacy settings
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/me', authenticateToken, UserController.getMyProfile);

/**
 * @swagger
 * /v2/users/me:
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
 *                 example: "123456789"
 *                 description: Phone number without country code (digits only)
 *               dialCode:
 *                 type: string
 *                 example: "+60"
 *                 description: Country dial code (e.g., +60 for Malaysia, +65 for Singapore, +1 for US)
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
  '/me',
  authenticateToken,
  updateProfileValidators,
  handleValidationErrors,
  UserController.updateProfile
);

/**
 * @swagger
 * /v2/users/me/completion:
 *   get:
 *     summary: Get profile completion status
 *     description: Get profile completion percentage, missing fields, and recommendations
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile completion retrieved successfully
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
 *                   example: Profile completion calculated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                       example: user_123
 *                     percentage:
 *                       type: integer
 *                       description: Profile completion percentage (0-100)
 *                       example: 65
 *                     missingFields:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: List of incomplete profile fields
 *                       example: [profilePicture, bio, communityMembers]
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/me/completion', authenticateToken, UserController.getProfileCompletion);

/**
 * @swagger
 * /v2/users/me/connections:
 *   get:
 *     summary: Get own connections
 *     description: Get list of authenticated user's connections with optional status filter (all statuses visible)
 *     tags: [Users]
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
 *         name: direction
 *         schema:
 *           type: string
 *           enum: [sent, received, all]
 *         description: Filter by direction (sent=you initiated, received=they initiated)
 *       - in: query
 *         name: relationshipCategory
 *         schema:
 *           type: string
 *           enum: [professional, friend, family, mentor, travel, community, other]
 *         description: Filter by relationship category
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or username
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
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, connectedAt, trustStrength, interactionCount]
 *           default: createdAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: Connections retrieved successfully
 */
router.get(
  '/me/connections',
  authenticateToken,
  connectionQueryValidators,
  handleValidationErrors,
  ConnectionController.getConnections
);

/**
 * @swagger
 * /v2/users/me/vouches/received:
 *   get:
 *     summary: Get vouches received
 *     description: Get vouches you've received with filtering options
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
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
 *         description: Vouches retrieved successfully
 */
router.get(
  '/me/vouches/received',
  authenticateToken,
  vouchQueryValidators,
  handleValidationErrors,
  VouchController.getVouchesReceived
);

/**
 * @swagger
 * /v2/users/me/vouches/given:
 *   get:
 *     summary: Get vouches given
 *     description: Get vouches you've given with availability counts
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
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
 *         description: Vouches retrieved successfully
 */
router.get(
  '/me/vouches/given',
  authenticateToken,
  vouchQueryValidators,
  handleValidationErrors,
  VouchController.getVouchesGiven
);

/**
 * @swagger
 * /v2/users/me/badges:
 *   get:
 *     summary: Get own badges
 *     description: Get badges you've earned
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Badges retrieved successfully
 */
router.get('/me/badges', authenticateToken, GamificationController.getMyBadges);

/**
 * @swagger
 * /v2/users/me/points:
 *   get:
 *     summary: Get own points
 *     description: Get your current points balance and history
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Points retrieved successfully
 */
router.get('/me/points', authenticateToken, GamificationController.getMyPoints);

/**
 * @swagger
 * /v2/users/me/subscription:
 *   get:
 *     summary: Get own subscription
 *     description: Get your current subscription details and status
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Subscription retrieved successfully
 */
router.get('/me/subscription', authenticateToken, subscriptionController.getMySubscription);

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
  authenticateToken,
  uploadLimiter,
  uploadImage.single('avatar'),
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
router.get('/all', authenticateToken, UserController.getAllUsers);

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
router.get('/recommendations', authenticateToken, UserController.getUserRecommendations);

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
router.get('/trending-interests', authenticateToken, UserController.getTrendingInterests);

/**
 * @swagger
 * /v2/users/search:
 *   get:
 *     summary: Search users with advanced filters
 *     description: Search users by name, username, location, interests, trust score, connection type, and more
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         description: Search query (name, username, bio)
 *         example: john
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: Filter by city
 *         example: New York
 *       - in: query
 *         name: interest
 *         schema:
 *           type: string
 *         description: Filter by interest
 *         example: travel
 *       - in: query
 *         name: gender
 *         schema:
 *           type: string
 *           enum: [male, female, other]
 *         description: Filter by gender
 *       - in: query
 *         name: latitude
 *         schema:
 *           type: number
 *         description: Your latitude for distance calculation
 *         example: 3.1390
 *       - in: query
 *         name: longitude
 *         schema:
 *           type: number
 *         description: Your longitude for distance calculation
 *         example: 101.6869
 *       - in: query
 *         name: radius
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 500
 *         description: Search radius in kilometers
 *         example: 50
 *       - in: query
 *         name: nearby
 *         schema:
 *           type: boolean
 *         description: Find nearby users (default 50km radius)
 *       - in: query
 *         name: minTrustScore
 *         schema:
 *           type: integer
 *           minimum: 0
 *           maximum: 100
 *         description: Minimum trust score
 *         example: 50
 *       - in: query
 *         name: maxTrustScore
 *         schema:
 *           type: integer
 *           minimum: 0
 *           maximum: 100
 *         description: Maximum trust score
 *       - in: query
 *         name: trustLevel
 *         schema:
 *           type: string
 *           enum: [NEW, BUILDING, ESTABLISHED, TRUSTED, VERIFIED]
 *         description: Filter by trust level
 *       - in: query
 *         name: minEventsAttended
 *         schema:
 *           type: integer
 *           minimum: 0
 *         description: Minimum events attended
 *       - in: query
 *         name: hasHostedEvents
 *         schema:
 *           type: boolean
 *         description: Filter users who have hosted events
 *       - in: query
 *         name: isVerified
 *         schema:
 *           type: boolean
 *         description: Filter verified users only
 *       - in: query
 *         name: excludeConnected
 *         schema:
 *           type: boolean
 *         description: Exclude already connected users
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
 *         description: Search results with pagination
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
 *                           username:
 *                             type: string
 *                           trustScore:
 *                             type: integer
 *                           trustLevel:
 *                             type: string
 *                           profilePicture:
 *                             type: string
 *                           bio:
 *                             type: string
 *                           interests:
 *                             type: array
 *                             items:
 *                               type: string
 *                           location:
 *                             type: object
 *                           isVerified:
 *                             type: boolean
 *                           distance:
 *                             type: number
 *                             description: Distance in km (if lat/lng provided)
 *                     pagination:
 *                       type: object
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get(
  '/search',
  authenticateToken,
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
router.get('/nearby', authenticateToken, UserController.findNearbyUsers);

// ============================================================================
// CONNECTIONS ROUTES
// ============================================================================

/**
 * @swagger
 * /v2/users/{userId}/connections:
 *   get:
 *     summary: Get another user's connections
 *     description: Get list of another user's ACCEPTED connections only (for privacy)
 *     tags: [Connections]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID whose connections to view
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
 *         description: Connections retrieved successfully (ACCEPTED only)
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
 *       404:
 *         description: User not found
 */
router.get('/:userId/connections', authenticateToken, UserController.getUserConnections);

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
router.post('/connections/:id/request', authenticateToken, UserController.sendConnectionRequest);

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
router.post('/connections/:id/accept', authenticateToken, UserController.acceptConnectionRequest);

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
router.post('/connections/:id/reject', authenticateToken, UserController.rejectConnectionRequest);

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
router.post('/connections/:id/cancel', authenticateToken, UserController.cancelConnectionRequest);

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
router.delete('/connections/:id', authenticateToken, UserController.removeConnection);

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
router.get('/activity', authenticateToken, UserController.getUserActivity);

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
router.get('/security-events', authenticateToken, UserController.getUserSecurityEvents);

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
router.get('/sessions', authenticateToken, UserController.getUserSessions);

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
router.get('/login-history', authenticateToken, UserController.getUserLoginHistory);

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
router.delete('/sessions/:sessionToken', authenticateToken, UserController.terminateSession);

// ============================================================================
// QR CODE ROUTES (Must be before /:id route)
// ============================================================================

/**
 * @swagger
 * /v2/users/me/qr-code:
 *   post:
 *     summary: Generate QR code for user identity
 *     description: |
 *       Generate a secure, time-limited QR code for user identification.
 *       
 *       **Two purposes:**
 *       - `CONNECT`: For making connections with other users (15 min validity)
 *       - `CHECKIN`: For event check-in (5 min validity, requires eventId)
 *       
 *       QR codes are JWT-signed and include a one-time nonce to prevent replay attacks.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - purpose
 *             properties:
 *               purpose:
 *                 type: string
 *                 enum: [CONNECT, CHECKIN]
 *                 description: Purpose of the QR code
 *                 example: CONNECT
 *               eventId:
 *                 type: string
 *                 description: Event ID (required when purpose is CHECKIN)
 *                 example: evt_123abc
 *     responses:
 *       201:
 *         description: QR code generated successfully
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
 *                   example: QR code generated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     qrData:
 *                       type: string
 *                       description: JWT token to encode in QR code
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                     purpose:
 *                       type: string
 *                       enum: [CONNECT, CHECKIN]
 *                       example: CONNECT
 *                     expiresAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-10-19T03:15:00.000Z
 *                     expiresIn:
 *                       type: integer
 *                       description: Seconds until expiration
 *                       example: 900
 *                     userId:
 *                       type: string
 *                       example: user_123
 *                     eventId:
 *                       type: string
 *                       description: Present when purpose is CHECKIN
 *                       example: evt_123abc
 *       400:
 *         description: Invalid request (missing eventId for CHECKIN, etc.)
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: User not active or doesn't have ticket/RSVP for event
 *       404:
 *         description: Event not found
 */
router.post(
  '/me/qr-code',
  authenticateToken,
  generateQRCodeValidators,
  handleValidationErrors,
  QRCodeController.generateQRCode
);

/**
 * @swagger
 * /v3/users/me/qr-code/image:
 *   post:
 *     summary: Generate QR code as PNG image
 *     description: |
 *       Generate a QR code as a PNG image that can be displayed directly in mobile apps.
 *       Returns binary image data instead of JSON. Use the response headers to get metadata.
 *       
 *       **Response Headers:**
 *       - `X-QR-Expires-In`: Validity period in seconds
 *       - `X-QR-Purpose`: CONNECT or CHECKIN
 *       - `X-QR-Event-Id`: Present when purpose is CHECKIN
 *       
 *       **Recommended for:**
 *       - Mobile apps that want to display QR code directly
 *       - Web apps that need image-based QR codes
 *       - Systems without client-side QR generation libraries
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - purpose
 *             properties:
 *               purpose:
 *                 type: string
 *                 enum: [CONNECT, CHECKIN]
 *                 description: Purpose of the QR code
 *                 example: CONNECT
 *               eventId:
 *                 type: string
 *                 format: uuid
 *                 description: Required when purpose is CHECKIN
 *                 example: 550e8400-e29b-41d4-a716-446655440000
 *               size:
 *                 type: integer
 *                 description: Image size in pixels (width and height)
 *                 default: 300
 *                 minimum: 100
 *                 maximum: 1000
 *                 example: 300
 *     responses:
 *       200:
 *         description: QR code image generated successfully
 *         headers:
 *           Content-Type:
 *             schema:
 *               type: string
 *               example: image/png
 *           X-QR-Expires-In:
 *             schema:
 *               type: integer
 *               example: 900
 *             description: QR code validity in seconds
 *           X-QR-Purpose:
 *             schema:
 *               type: string
 *               example: CONNECT
 *             description: Purpose of the QR code
 *           X-QR-Event-Id:
 *             schema:
 *               type: string
 *               format: uuid
 *             description: Event ID (only for CHECKIN purpose)
 *         content:
 *           image/png:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Invalid request (e.g., CHECKIN without eventId)
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: User not active or doesn't have ticket/RSVP for event
 *       404:
 *         description: Event not found
 */
router.post(
  '/me/qr-code/image',
  authenticateToken,
  generateQRCodeValidators,
  handleValidationErrors,
  QRCodeController.generateQRCodeImage
);

/**
 * @swagger
 * /v2/users/qr-code/validate:
 *   post:
 *     summary: Validate QR code
 *     description: |
 *       Validate a QR code and retrieve user information.
 *       This is a general validation endpoint - for specific actions (connections, check-ins),
 *       use the dedicated scan endpoints in their respective modules.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - qrData
 *             properties:
 *               qrData:
 *                 type: string
 *                 description: JWT token from QR code
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     responses:
 *       200:
 *         description: QR code is valid
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
 *                   example: QR code validated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     valid:
 *                       type: boolean
 *                       example: true
 *                     purpose:
 *                       type: string
 *                       enum: [CONNECT, CHECKIN]
 *                       example: CONNECT
 *                     userId:
 *                       type: string
 *                       example: user_123
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         fullName:
 *                           type: string
 *                         username:
 *                           type: string
 *                         profilePicture:
 *                           type: string
 *                         trustLevel:
 *                           type: string
 *                         trustScore:
 *                           type: number
 *                     eventId:
 *                       type: string
 *                       description: Present when purpose is CHECKIN
 *                     message:
 *                       type: string
 *                       example: QR code is valid
 *       400:
 *         description: Invalid or expired QR code
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: User account not active
 *       404:
 *         description: User not found
 */
router.post(
  '/qr-code/validate',
  authenticateToken,
  scanQRCodeValidators,
  handleValidationErrors,
  QRCodeController.validateQRCode
);

// ============================================================================
// MUTUAL CONNECTIONS
// ============================================================================

/**
 * @swagger
 * /v2/users/{userId}/mutual-connections:
 *   get:
 *     summary: Get all mutual connections with another user
 *     description: |
 *       Get a paginated list of all mutual connections between the authenticated user
 *       and the specified user. Only works when both users are authenticated and not
 *       viewing their own profile.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user to find mutual connections with
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of results per page
 *     responses:
 *       200:
 *         description: List of mutual connections retrieved successfully
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
 *                     mutualConnections:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           fullName:
 *                             type: string
 *                           username:
 *                             type: string
 *                           profilePicture:
 *                             type: string
 *                           trustScore:
 *                             type: number
 *                           trustLevel:
 *                             type: string
 *                           currentCity:
 *                             type: string
 *                           connectedSince:
 *                             type: string
 *                             format: date-time
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *                         hasMore:
 *                           type: boolean
 *       400:
 *         description: Cannot get mutual connections with yourself
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: User not found
 */
router.get(
  '/:userId/mutual-connections',
  authenticateToken,
  UserController.getMutualConnections
);

// ============================================================================
// GET USER BY ID (Must be after all specific routes)
// ============================================================================

/**
 * @swagger
 * /v2/users/{id}:
 *   get:
 *     summary: Get user profile by ID (view another user)
 *     description: |
 *       Get complete profile information for **another user** with relationship context, statistics, 
 *       shared activities, and privacy-aware data exposure.
 *       
 *       **⚠️ Important:** Cannot view your own profile via this endpoint. Use `GET /users/me` instead.
 *       Attempting to view your own profile will return a 400 error directing you to `/users/me`.
 *       
 *       ## Response Sections:
 *       
 *       ### 1. Relationship (only when viewing another user)
 *       - **Connection Status**: CONNECTED | PENDING | BLOCKED | NONE
 *       - **Vouch Status**: GIVEN | RECEIVED | MUTUAL | PENDING_OFFER | NONE
 *       - **Trust Match**: Compatibility score and level difference
 *       - **Mutual Connections**: Count + top 5 mutual connections
 *       
 *       ### 2. Profile
 *       - Basic information (name, username, bio, location)
 *       - Privacy-controlled fields (email only shown if connected)
 *       - Social links and interests
 *       - Profile and cover photos
 *       
 *       ### 3. Trust & Reputation
 *       - Trust score and level
 *       - Badges earned
 *       - Vouch counts (received/given/primary/secondary)
 *       - Verifications (email, phone, identity, background)
 *       
 *       ### 4. Statistics
 *       - Connections: total, this month
 *       - Communities: member/moderator/founder counts
 *       - Events: attended, hosting, upcoming
 *       - Marketplace: active listings, sold items, rating
 *       - Travel: trips completed, cities visited
 *       - Card game: played, won, current streak
 *       
 *       ### 5. Shared Activities (only when viewing another user)
 *       - Shared communities with roles
 *       - Events attended together
 *       - Travel trips together
 *       - Marketplace interactions
 *       
 *       ### 6. Recent Activity
 *       - Activity highlights (respecting visibility)
 *       - Recent trust moments
 *       
 *       ### 7. Privacy & Permissions
 *       - What actions are allowed (message, vouch, connect)
 *       - Field visibility settings
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
 *         description: Comprehensive user profile retrieved
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
 *                     relationship:
 *                       type: object
 *                       nullable: true
 *                       description: Only present when viewing another user's profile
 *                       properties:
 *                         connection:
 *                           type: object
 *                           properties:
 *                             status:
 *                               type: string
 *                               enum: [CONNECTED, PENDING, BLOCKED, NONE]
 *                             details:
 *                               type: object
 *                               nullable: true
 *                               properties:
 *                                 id:
 *                                   type: string
 *                                 status:
 *                                   type: string
 *                                 isInitiator:
 *                                   type: boolean
 *                                 relationshipType:
 *                                   type: string
 *                                 connectedAt:
 *                                   type: string
 *                                   format: date-time
 *                                 requestedAt:
 *                                   type: string
 *                                   format: date-time
 *                         vouch:
 *                           type: object
 *                           properties:
 *                             status:
 *                               type: string
 *                               enum: [GIVEN, RECEIVED, MUTUAL, PENDING_OFFER, NONE]
 *                             details:
 *                               type: object
 *                               nullable: true
 *                         trustMatch:
 *                           type: object
 *                           nullable: true
 *                           properties:
 *                             compatible:
 *                               type: boolean
 *                             currentUserLevel:
 *                               type: string
 *                             profileUserLevel:
 *                               type: string
 *                             difference:
 *                               type: integer
 *                             canVouch:
 *                               type: boolean
 *                         mutualConnections:
 *                           type: object
 *                           properties:
 *                             count:
 *                               type: integer
 *                             topConnections:
 *                               type: array
 *                               items:
 *                                 type: object
 *                                 properties:
 *                                   id:
 *                                     type: string
 *                                   fullName:
 *                                     type: string
 *                                   username:
 *                                     type: string
 *                                   profilePicture:
 *                                     type: string
 *                     profile:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         fullName:
 *                           type: string
 *                         username:
 *                           type: string
 *                         email:
 *                           type: string
 *                           nullable: true
 *                           description: Only shown if connected or own profile
 *                         phone:
 *                           type: string
 *                           nullable: true
 *                         profilePicture:
 *                           type: string
 *                         coverPhoto:
 *                           type: string
 *                         bio:
 *                           type: string
 *                         tagline:
 *                           type: string
 *                         location:
 *                           type: object
 *                           nullable: true
 *                           properties:
 *                             city:
 *                               type: string
 *                             state:
 *                               type: string
 *                             country:
 *                               type: string
 *                             coordinates:
 *                               type: object
 *                               properties:
 *                                 lat:
 *                                   type: number
 *                                 lng:
 *                                   type: number
 *                         birthDate:
 *                           type: string
 *                           format: date
 *                           nullable: true
 *                         gender:
 *                           type: string
 *                         interests:
 *                           type: array
 *                           items:
 *                             type: string
 *                         languages:
 *                           type: array
 *                           items:
 *                             type: string
 *                         occupation:
 *                           type: string
 *                         website:
 *                           type: string
 *                         socialLinks:
 *                           type: object
 *                           properties:
 *                             instagram:
 *                               type: string
 *                             linkedin:
 *                               type: string
 *                         joinedAt:
 *                           type: string
 *                           format: date-time
 *                         lastActiveAt:
 *                           type: string
 *                           format: date-time
 *                     trust:
 *                       type: object
 *                       properties:
 *                         score:
 *                           type: number
 *                         level:
 *                           type: string
 *                         badges:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                               name:
 *                                 type: string
 *                               icon:
 *                                 type: string
 *                               earnedAt:
 *                                 type: string
 *                                 format: date-time
 *                         vouches:
 *                           type: object
 *                           properties:
 *                             received:
 *                               type: integer
 *                             given:
 *                               type: integer
 *                             activePrimary:
 *                               type: integer
 *                             activeSecondary:
 *                               type: integer
 *                         verifications:
 *                           type: object
 *                           properties:
 *                             email:
 *                               type: boolean
 *                             phone:
 *                               type: boolean
 *                             identity:
 *                               type: boolean
 *                             background:
 *                               type: boolean
 *                     statistics:
 *                       type: object
 *                       properties:
 *                         connections:
 *                           type: object
 *                           properties:
 *                             total:
 *                               type: integer
 *                             thisMonth:
 *                               type: integer
 *                         communities:
 *                           type: object
 *                           properties:
 *                             member:
 *                               type: integer
 *                             moderator:
 *                               type: integer
 *                             founder:
 *                               type: integer
 *                         events:
 *                           type: object
 *                           properties:
 *                             attended:
 *                               type: integer
 *                             hosting:
 *                               type: integer
 *                             upcoming:
 *                               type: integer
 *                         marketplace:
 *                           type: object
 *                           properties:
 *                             activeListings:
 *                               type: integer
 *                             soldItems:
 *                               type: integer
 *                             rating:
 *                               type: number
 *                             transactions:
 *                               type: integer
 *                         travel:
 *                           type: object
 *                           properties:
 *                             tripsCompleted:
 *                               type: integer
 *                             citiesVisited:
 *                               type: integer
 *                             upcomingTrips:
 *                               type: integer
 *                         cardGame:
 *                           type: object
 *                           properties:
 *                             played:
 *                               type: integer
 *                             won:
 *                               type: integer
 *                             currentStreak:
 *                               type: integer
 *                     sharedActivities:
 *                       type: object
 *                       nullable: true
 *                       description: Only present when viewing another user's profile
 *                       properties:
 *                         communities:
 *                           type: object
 *                           properties:
 *                             count:
 *                               type: integer
 *                             list:
 *                               type: array
 *                               items:
 *                                 type: object
 *                         events:
 *                           type: object
 *                           properties:
 *                             count:
 *                               type: integer
 *                             recent:
 *                               type: array
 *                               items:
 *                                 type: object
 *                         travelTrips:
 *                           type: object
 *                           properties:
 *                             count:
 *                               type: integer
 *                             trips:
 *                               type: array
 *                               items:
 *                                 type: object
 *                         marketplaceInteractions:
 *                           type: object
 *                           properties:
 *                             transactionCount:
 *                               type: integer
 *                             hasOpenConversations:
 *                               type: boolean
 *                     recentActivity:
 *                       type: object
 *                       properties:
 *                         highlights:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               type:
 *                                 type: string
 *                               title:
 *                                 type: string
 *                               date:
 *                                 type: string
 *                                 format: date-time
 *                               visibility:
 *                                 type: string
 *                         trustMoments:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                               type:
 *                                 type: string
 *                               description:
 *                                 type: string
 *                               points:
 *                                 type: number
 *                               date:
 *                                 type: string
 *                                 format: date-time
 *                     privacy:
 *                       type: object
 *                       properties:
 *                         profileVisibility:
 *                           type: string
 *                           enum: [PUBLIC, CONNECTIONS_ONLY, PRIVATE]
 *                         canMessage:
 *                           type: boolean
 *                         canVouch:
 *                           type: boolean
 *                         canConnect:
 *                           type: boolean
 *                         showEmail:
 *                           type: boolean
 *                         showPhone:
 *                           type: boolean
 *                         showBirthDate:
 *                           type: boolean
 *                         showLocation:
 *                           type: boolean
 *       400:
 *         description: Cannot view own profile via this endpoint
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Use /users/me to view your own profile"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

// ============================================================================
// SETTINGS ROUTES (must be before /:id to avoid route matching issues)
// ============================================================================

/**
 * @swagger
 * /v2/users/settings:
 *   get:
 *     summary: Get user settings
 *     description: Get all settings (privacy, notifications, preferences, account)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Settings retrieved successfully
 */
router.get('/settings', authenticateToken, SettingsController.getSettings);

/**
 * @swagger
 * /v2/users/settings:
 *   put:
 *     summary: Update user settings
 */
router.put('/settings', authenticateToken, SettingsController.updateSettings);

router.put('/settings/privacy', authenticateToken, SettingsController.updatePrivacy);
router.put('/settings/notifications', authenticateToken, SettingsController.updateNotifications);
router.put('/settings/preferences', authenticateToken, SettingsController.updatePreferences);
router.post('/settings/reset', authenticateToken, SettingsController.resetSettings);
router.get('/settings/export', authenticateToken, SettingsController.exportSettings);

// ============================================================================
// USER PROFILE ROUTES
// ============================================================================

router.get('/:id', authenticateToken, UserController.getUserById);

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
router.delete('/:id', authenticateToken, UserController.deleteUser);

// ============================================================================
// METADATA ROUTES (Public)
// ============================================================================

/**
 * @swagger
 * /v2/users/metadata/trust-levels:
 *   get:
 *     summary: Get trust levels configuration
 *     description: Get all available trust levels with their score ranges, colors, and benefits
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Trust levels retrieved successfully
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
 *                     trustLevels:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           level:
 *                             type: string
 *                             example: "trusted"
 *                           label:
 *                             type: string
 *                             example: "Trusted"
 *                           minScore:
 *                             type: number
 *                             example: 75
 *                           maxScore:
 *                             type: number
 *                             example: 89
 *                           color:
 *                             type: string
 *                             example: "#F59E0B"
 *                           description:
 *                             type: string
 *                             example: "Highly trusted member"
 *                           icon:
 *                             type: string
 *                             example: "🏆"
 *                           benefits:
 *                             type: array
 *                             items:
 *                               type: string
 */
router.get('/metadata/trust-levels', UserController.getTrustLevels);

/**
 * @swagger
 * /v2/users/metadata/gender-options:
 *   get:
 *     summary: Get gender options
 *     description: Get all available gender options for user profiles
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Gender options retrieved successfully
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
 *                     genderOptions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           value:
 *                             type: string
 *                             example: "FEMALE"
 *                           label:
 *                             type: string
 *                             example: "Female"
 */
router.get('/metadata/gender-options', UserController.getGenderOptions);

/**
 * @swagger
 * /v2/users/metadata/interest-categories:
 *   get:
 *     summary: Get interest categories
 *     description: Get all available interest categories and their options
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Interest categories retrieved successfully
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
 *                     interestCategories:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           category:
 *                             type: string
 *                             example: "Adventure"
 *                           interests:
 *                             type: array
 *                             items:
 *                               type: string
 *                             example: ["Hiking", "Camping", "Rock Climbing"]
 */
router.get('/metadata/interest-categories', UserController.getInterestCategories);

// ============================================================================
// TRUST SCORE ROUTES
// ============================================================================

/**
 * @swagger
 * /v2/users/{userId}/trust-score:
 *   get:
 *     summary: Get user trust score detail
 *     description: |
 *       Get comprehensive trust score information including breakdown by components:
 *       - Vouches (40%): Primary, Secondary, and Community vouches
 *       - Activity (30%): Events attended/hosted, communities joined, services provided
 *       - Trust Moments (30%): Ratings and feedback from connections
 *     tags: [Users - Trust Score]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *       - in: query
 *         name: includeBreakdown
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Include detailed component breakdown
 *       - in: query
 *         name: includeHistory
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Include score history
 *       - in: query
 *         name: historyDays
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Number of days of history to include
 *     responses:
 *       200:
 *         description: Trust score detail retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                     currentScore:
 *                       type: number
 *                       example: 85
 *                     trustLevel:
 *                       type: string
 *                       enum: [new, starter, growing, established, trusted, elite]
 *                     lastCalculatedAt:
 *                       type: string
 *                       format: date-time
 *                     breakdown:
 *                       type: object
 *                     nextLevel:
 *                       type: object
 *       404:
 *         description: User not found
 */
router.get('/:userId/trust-score', authenticateToken, TrustScoreController.getTrustScoreDetail);

/**
 * @swagger
 * /v2/users/{userId}/trust-score/history:
 *   get:
 *     summary: Get trust score history
 *     description: Get historical trust score data over time with summary statistics (own profile only)
 *     tags: [Users - Trust Score]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID (must be authenticated user)
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start date for history (ISO 8601)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End date for history (ISO 8601)
 *       - in: query
 *         name: granularity
 *         schema:
 *           type: string
 *           enum: [daily, weekly, monthly]
 *           default: daily
 *         description: Data granularity
 *     responses:
 *       200:
 *         description: Score history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                     history:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           timestamp:
 *                             type: string
 *                             format: date-time
 *                           score:
 *                             type: number
 *                           change:
 *                             type: number
 *                           reason:
 *                             type: string
 *                           component:
 *                             type: string
 *                     summary:
 *                       type: object
 *                       properties:
 *                         startScore:
 *                           type: number
 *                         endScore:
 *                           type: number
 *                         totalChange:
 *                           type: number
 *                         highestScore:
 *                           type: number
 *                         lowestScore:
 *                           type: number
 *                         averageScore:
 *                           type: number
 *       403:
 *         description: Can only view own history
 */
router.get('/:userId/trust-score/history', authenticateToken, TrustScoreController.getTrustScoreHistory);

/**
 * @swagger
 * /v2/users/{userId}/trust-score/suggestions:
 *   get:
 *     summary: Get personalized trust score improvement suggestions
 *     description: Get actionable suggestions to improve trust score based on current gaps
 *     tags: [Users - Trust Score]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID (must be authenticated user)
 *     responses:
 *       200:
 *         description: Suggestions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     currentScore:
 *                       type: number
 *                     currentLevel:
 *                       type: string
 *                     nextLevel:
 *                       type: string
 *                     pointsToNextLevel:
 *                       type: number
 *                     suggestions:
 *                       type: array
 *                       items:
 *                         type: object
 *                     quickWins:
 *                       type: array
 *                       items:
 *                         type: object
 *       403:
 *         description: Can only view own suggestions
 */
router.get('/:userId/trust-score/suggestions', authenticateToken, TrustScoreController.getSuggestions);

/**
 * @swagger
 * /v2/users/{userId}/trust-score/recent-updates:
 *   get:
 *     summary: Get recent trust score updates
 *     description: Get timeline of recent activities that affected trust score
 *     tags: [Users - Trust Score]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID (must be authenticated user)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of updates to retrieve
 *     responses:
 *       200:
 *         description: Recent updates retrieved successfully
 *       403:
 *         description: Can only view own updates
 */
router.get('/:userId/trust-score/recent-updates', authenticateToken, TrustScoreController.getRecentUpdates);

/**
 * @swagger
 * /v2/users/{userId}/trust-dashboard:
 *   get:
 *     summary: Get comprehensive trust dashboard
 *     description: Get trust score, rank percentile, recent changes, suggestions, accountability impact, and decay warnings
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: Dashboard retrieved successfully
 *       403:
 *         description: Can only view own dashboard
 */
router.get('/:userId/trust-dashboard', authenticateToken, TrustScoreController.getTrustDashboard);

/**
 * @swagger
 * /v2/users/{userId}/badges:
 *   get:
 *     summary: Get user's trust badges
 *     description: Get earned trust badges based on achievements (First Vouch, Trusted Member, Community Leader, Perfect Record, Accountability Hero, etc.)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: Badges retrieved successfully
 */
router.get('/:userId/badges', authenticateToken, TrustScoreController.getBadges);

/**
 * @swagger
 * /v2/users/{userId}/points:
 *   get:
 *     summary: Get user's points
 *     description: Get another user's current points balance (public gamification data)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: Points retrieved successfully
 */
router.get('/:userId/points', authenticateToken, GamificationController.getUserPoints);

/**
 * @swagger
 * /v2/users/{userId}/stats:
 *   get:
 *     summary: Get user activity statistics
 *     description: Get user's activity stats including events, vouches, communities, services
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User stats retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                     eventsAttended:
 *                       type: integer
 *                     eventsHosted:
 *                       type: integer
 *                     vouchesGiven:
 *                       type: integer
 *                     vouchesReceived:
 *                       type: integer
 *                     listingsPosted:
 *                       type: integer
 *                     servicesProvided:
 *                       type: integer
 *                     communitiesJoined:
 *                       type: integer
 *                     totalPoints:
 *                       type: integer
 *                     lastCalculatedAt:
 *                       type: string
 *                       format: date-time
 */
router.get('/:userId/stats', authenticateToken, TrustScoreController.getUserStats);

export default router;
