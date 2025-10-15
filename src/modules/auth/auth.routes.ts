import { Router } from 'express';
import { AuthController } from './auth.controller';
import { handleValidationErrors } from '../../middleware/validation';
import { 
  registerValidators, 
  loginValidators, 
  changePasswordValidators,
  forgotPasswordValidators,
  resetPasswordValidators 
} from './auth.validators';
import { authLimiter, loginLimiter, registerLimiter } from '../../middleware/rateLimiter';
import { authenticateToken } from '../../middleware/auth';

const router = Router();

// ============================================================================
// PUBLIC ROUTES
// ============================================================================

/**
 * @swagger
 * /v2/auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Create a new user account with email, password, and basic information. Optionally include device and location data for enhanced tracking and security.
 *     tags: [Authentication]
 *     parameters:
 *       - in: header
 *         name: x-device-id
 *         schema:
 *           type: string
 *         description: Unique device identifier (alternative to deviceInfo.deviceId in body)
 *         example: abc-123-xyz-789
 *       - in: header
 *         name: x-device-name
 *         schema:
 *           type: string
 *         description: Device name (alternative to deviceInfo.deviceName in body)
 *         example: John's iPhone
 *       - in: header
 *         name: x-app-version
 *         schema:
 *           type: string
 *         description: App version
 *         example: 1.2.3
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - fullName
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john.doe@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 example: SecurePass123!
 *               fullName:
 *                 type: string
 *                 example: John Doe
 *               username:
 *                 type: string
 *                 description: Optional - will be auto-generated if not provided
 *                 example: johndoe
 *               phone:
 *                 type: string
 *                 example: +1234567890
 *               deviceInfo:
 *                 type: object
 *                 description: Optional device information for tracking and security
 *                 properties:
 *                   deviceId:
 *                     type: string
 *                     description: Unique device identifier
 *                     example: abc-123-xyz-789
 *                   deviceName:
 *                     type: string
 *                     description: User-friendly device name
 *                     example: John's iPhone
 *                   deviceType:
 *                     type: string
 *                     enum: [ios, android, web, desktop]
 *                     example: ios
 *                   osVersion:
 *                     type: string
 *                     example: iOS 17.0
 *                   appVersion:
 *                     type: string
 *                     example: 1.2.3
 *                   pushToken:
 *                     type: string
 *                     description: FCM/APNs token for push notifications
 *                     example: fcm-token-here
 *               locationInfo:
 *                 type: object
 *                 description: Optional location information
 *                 properties:
 *                   latitude:
 *                     type: number
 *                     example: 1.3521
 *                   longitude:
 *                     type: number
 *                     example: 103.8198
 *                   city:
 *                     type: string
 *                     example: Singapore
 *                   country:
 *                     type: string
 *                     example: Singapore
 *                   timezone:
 *                     type: string
 *                     example: Asia/Singapore
 *     responses:
 *       201:
 *         description: User successfully registered
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
 *                   example: User registered successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     tokens:
 *                       $ref: '#/components/schemas/AuthTokens'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       409:
 *         description: User already exists
 *       429:
 *         description: Too many registration attempts
 */
router.post(
  '/register',
  registerLimiter,
  registerValidators,
  handleValidationErrors,
  AuthController.register
);

/**
 * @swagger
 * /v2/auth/login:
 *   post:
 *     summary: User login
 *     description: Authenticate user with email/username and password. Include device information to track sessions and enable security features.
 *     tags: [Authentication]
 *     parameters:
 *       - in: header
 *         name: x-device-id
 *         schema:
 *           type: string
 *         description: Unique device identifier for session tracking
 *         example: abc-123-xyz-789
 *       - in: header
 *         name: x-device-name
 *         schema:
 *           type: string
 *         description: Device name for session identification
 *         example: John's iPhone
 *       - in: header
 *         name: x-app-version
 *         schema:
 *           type: string
 *         description: App version
 *         example: 1.2.3
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 description: Email or username
 *                 example: john.doe@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: SecurePass123!
 *               deviceInfo:
 *                 type: object
 *                 description: Optional device information for session tracking
 *                 properties:
 *                   deviceId:
 *                     type: string
 *                     description: Unique device identifier
 *                     example: abc-123-xyz-789
 *                   deviceName:
 *                     type: string
 *                     description: User-friendly device name
 *                     example: John's iPhone
 *                   deviceType:
 *                     type: string
 *                     enum: [ios, android, web, desktop]
 *                     example: ios
 *                   osVersion:
 *                     type: string
 *                     example: iOS 17.0
 *                   appVersion:
 *                     type: string
 *                     example: 1.2.3
 *                   pushToken:
 *                     type: string
 *                     description: FCM/APNs token for push notifications
 *                     example: fcm-token-here
 *               locationInfo:
 *                 type: object
 *                 description: Optional location information
 *                 properties:
 *                   latitude:
 *                     type: number
 *                     example: 1.3521
 *                   longitude:
 *                     type: number
 *                     example: 103.8198
 *                   city:
 *                     type: string
 *                     example: Singapore
 *                   country:
 *                     type: string
 *                     example: Singapore
 *                   timezone:
 *                     type: string
 *                     example: Asia/Singapore
 *     responses:
 *       200:
 *         description: Successfully authenticated
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
 *                   example: Login successful
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     tokens:
 *                       $ref: '#/components/schemas/AuthTokens'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         description: Invalid credentials
 *       429:
 *         description: Too many login attempts
 */
router.post(
  '/login',
  loginLimiter,
  loginValidators,
  handleValidationErrors,
  AuthController.login
);

/**
 * @swagger
 * /v2/auth/refresh-token:
 *   post:
 *     summary: Refresh access token
 *     description: Get a new access token using a valid refresh token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     responses:
 *       200:
 *         description: New access token generated
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
 *                   example: Token refreshed successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                     expiresIn:
 *                       type: number
 *       401:
 *         description: Invalid or expired refresh token
 */
router.post(
  '/refresh-token',
  authLimiter,
  handleValidationErrors,
  AuthController.refreshToken
);

/**
 * @swagger
 * /v2/auth/forgot-password:
 *   post:
 *     summary: Request password reset
 *     description: Send password reset email to user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john.doe@example.com
 *     responses:
 *       200:
 *         description: Password reset email sent
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
 *                   example: Password reset email sent
 *       404:
 *         description: User not found
 *       429:
 *         description: Too many requests
 */
router.post(
  '/forgot-password',
  authLimiter,
  forgotPasswordValidators,
  handleValidationErrors,
  AuthController.forgotPassword
);

/**
 * @swagger
 * /v2/auth/reset-password:
 *   post:
 *     summary: Reset password
 *     description: Reset password using the token from email
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - newPassword
 *             properties:
 *               token:
 *                 type: string
 *                 example: abc123def456
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 example: NewSecurePass123!
 *     responses:
 *       200:
 *         description: Password reset successful
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
 *                   example: Password reset successfully
 *       400:
 *         description: Invalid or expired token
 */
router.post(
  '/reset-password',
  authLimiter,
  resetPasswordValidators,
  handleValidationErrors,
  AuthController.resetPassword
);

// ============================================================================
// PROTECTED ROUTES (Require Authentication)
// ============================================================================

/**
 * @swagger
 * /v2/auth/me:
 *   get:
 *     summary: Get current user
 *     description: Get authenticated user's profile information
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
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
 */
router.get(
  '/me',
  authenticateToken,
  AuthController.me
);

/**
 * @swagger
 * /v2/auth/logout:
 *   post:
 *     summary: Logout
 *     description: Logout current user session
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
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
 *                   example: Logout successful
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post(
  '/logout',
  authenticateToken,
  AuthController.logout
);

/**
 * @swagger
 * /v2/auth/logout-all:
 *   post:
 *     summary: Logout from all devices
 *     description: Invalidate all refresh tokens and logout from all sessions
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out from all devices
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
 *                   example: Logged out from all devices
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post(
  '/logout-all',
  authenticateToken,
  AuthController.logoutAll
);

/**
 * @swagger
 * /v2/auth/change-password:
 *   post:
 *     summary: Change password
 *     description: Change password for authenticated user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *                 example: OldPassword123!
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 example: NewPassword123!
 *     responses:
 *       200:
 *         description: Password changed successfully
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
 *                   example: Password changed successfully
 *       400:
 *         description: Invalid current password
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post(
  '/change-password',
  authenticateToken,
  changePasswordValidators,
  handleValidationErrors,
  AuthController.changePassword
);

export default router;
