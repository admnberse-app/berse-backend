import { Router } from 'express';
import { BerseGuideController } from './berseguide.controller';
import { authenticateToken } from '../../middleware/auth';
import { handleValidationErrors } from '../../middleware/validation';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();
const berseGuideController = new BerseGuideController();

/**
 * @swagger
 * tags:
 *   name: BerseGuide
 *   description: BerseGuide local tour guide and booking endpoints
 */

// ============================================================================
// PROFILE MANAGEMENT ROUTES
// ============================================================================

/**
 * @swagger
 * /v2/berseguide/profile:
 *   get:
 *     summary: Get current user's BerseGuide profile
 *     tags: [BerseGuide]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: BerseGuide profile retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Profile not found
 */
router.get(
  '/profile',
  authenticateToken,
  asyncHandler(berseGuideController.getMyProfile.bind(berseGuideController))
);

/**
 * @swagger
 * /v2/berseguide/profile/{userId}:
 *   get:
 *     summary: Get a user's BerseGuide profile by ID
 *     tags: [BerseGuide]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: BerseGuide profile retrieved successfully
 *       404:
 *         description: Profile not found
 */
router.get(
  '/profile/:userId',
  asyncHandler(berseGuideController.getProfileById.bind(berseGuideController))
);

/**
 * @swagger
 * /v2/berseguide/profile:
 *   post:
 *     summary: Create BerseGuide profile
 *     tags: [BerseGuide]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - bio
 *               - guideTypes
 *               - city
 *               - maxGroupSize
 *     responses:
 *       201:
 *         description: Profile created successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Trust requirements not met
 */
router.post(
  '/profile',
  authenticateToken,
  asyncHandler(berseGuideController.createProfile.bind(berseGuideController))
);

/**
 * @swagger
 * /v2/berseguide/profile:
 *   patch:
 *     summary: Update BerseGuide profile
 *     tags: [BerseGuide]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       404:
 *         description: Profile not found
 */
router.patch(
  '/profile',
  authenticateToken,
  asyncHandler(berseGuideController.updateProfile.bind(berseGuideController))
);

/**
 * @swagger
 * /v2/berseguide/profile/toggle:
 *   patch:
 *     summary: Toggle BerseGuide profile on/off
 *     tags: [BerseGuide]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isEnabled
 *             properties:
 *               isEnabled:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Profile toggled successfully
 *       403:
 *         description: Trust requirements not met
 */
router.patch(
  '/profile/toggle',
  authenticateToken,
  asyncHandler(berseGuideController.toggleProfile.bind(berseGuideController))
);

/**
 * @swagger
 * /v2/berseguide/profile:
 *   delete:
 *     summary: Delete BerseGuide profile
 *     tags: [BerseGuide]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile deleted successfully
 *       400:
 *         description: Cannot delete with active bookings
 */
router.delete(
  '/profile',
  authenticateToken,
  asyncHandler(berseGuideController.deleteProfile.bind(berseGuideController))
);

/**
 * @swagger
 * /v2/berseguide/eligibility:
 *   get:
 *     summary: Check if user can enable BerseGuide
 *     tags: [BerseGuide]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Eligibility check result
 */
router.get(
  '/eligibility',
  authenticateToken,
  asyncHandler(berseGuideController.checkEligibility.bind(berseGuideController))
);

// ============================================================================
// PAYMENT OPTIONS ROUTES
// ============================================================================

/**
 * @swagger
 * /v2/berseguide/payment-options:
 *   post:
 *     summary: Add payment option
 *     tags: [BerseGuide]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - paymentType
 *     responses:
 *       201:
 *         description: Payment option added successfully
 */
router.post(
  '/payment-options',
  authenticateToken,
  asyncHandler(berseGuideController.addPaymentOption.bind(berseGuideController))
);

/**
 * @swagger
 * /v2/berseguide/payment-options/{optionId}:
 *   patch:
 *     summary: Update payment option
 *     tags: [BerseGuide]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: optionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment option updated successfully
 */
router.patch(
  '/payment-options/:optionId',
  authenticateToken,
  asyncHandler(berseGuideController.updatePaymentOption.bind(berseGuideController))
);

/**
 * @swagger
 * /v2/berseguide/payment-options/{optionId}:
 *   delete:
 *     summary: Delete payment option
 *     tags: [BerseGuide]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: optionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment option deleted successfully
 */
router.delete(
  '/payment-options/:optionId',
  authenticateToken,
  asyncHandler(berseGuideController.deletePaymentOption.bind(berseGuideController))
);

// ============================================================================
// BOOKING MANAGEMENT ROUTES
// ============================================================================

/**
 * @swagger
 * /v2/berseguide/bookings:
 *   post:
 *     summary: Create booking request (Tourist)
 *     tags: [BerseGuide]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - guideId
 *               - date
 *               - startTime
 *               - endTime
 *               - numberOfPeople
 *     responses:
 *       201:
 *         description: Booking request created successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: Guide not available for this time
 */
router.post(
  '/bookings',
  authenticateToken,
  asyncHandler(berseGuideController.createBookingRequest.bind(berseGuideController))
);

/**
 * @swagger
 * /v2/berseguide/availability:
 *   post:
 *     summary: Check availability for time slot
 *     tags: [BerseGuide]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - guideId
 *               - date
 *               - startTime
 *               - endTime
 *     responses:
 *       200:
 *         description: Availability check result
 */
router.post(
  '/availability',
  asyncHandler(berseGuideController.checkAvailability.bind(berseGuideController))
);

/**
 * @swagger
 * /v2/berseguide/bookings/{bookingId}:
 *   get:
 *     summary: Get booking by ID
 *     tags: [BerseGuide]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Booking details
 *       403:
 *         description: Unauthorized
 *       404:
 *         description: Booking not found
 */
router.get(
  '/bookings/:bookingId',
  authenticateToken,
  asyncHandler(berseGuideController.getBooking.bind(berseGuideController))
);

/**
 * @swagger
 * /v2/berseguide/bookings/guide:
 *   get:
 *     summary: Get bookings as guide
 *     tags: [BerseGuide]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of bookings
 */
router.get(
  '/bookings/guide',
  authenticateToken,
  asyncHandler(berseGuideController.getBookingsAsGuide.bind(berseGuideController))
);

/**
 * @swagger
 * /v2/berseguide/bookings/tourist:
 *   get:
 *     summary: Get bookings as tourist
 *     tags: [BerseGuide]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of bookings
 */
router.get(
  '/bookings/tourist',
  authenticateToken,
  asyncHandler(berseGuideController.getBookingsAsTourist.bind(berseGuideController))
);

/**
 * @swagger
 * /v2/berseguide/bookings/{bookingId}/approve:
 *   patch:
 *     summary: Approve booking (Guide)
 *     tags: [BerseGuide]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - agreedPaymentType
 *     responses:
 *       200:
 *         description: Booking approved successfully
 */
router.patch(
  '/bookings/:bookingId/approve',
  authenticateToken,
  asyncHandler(berseGuideController.approveBooking.bind(berseGuideController))
);

/**
 * @swagger
 * /v2/berseguide/bookings/{bookingId}/reject:
 *   patch:
 *     summary: Reject booking (Guide)
 *     tags: [BerseGuide]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Booking rejected successfully
 */
router.patch(
  '/bookings/:bookingId/reject',
  authenticateToken,
  asyncHandler(berseGuideController.rejectBooking.bind(berseGuideController))
);

/**
 * @swagger
 * /v2/berseguide/bookings/{bookingId}/cancel:
 *   patch:
 *     summary: Cancel booking
 *     tags: [BerseGuide]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Booking cancelled successfully
 */
router.patch(
  '/bookings/:bookingId/cancel',
  authenticateToken,
  asyncHandler(berseGuideController.cancelBooking.bind(berseGuideController))
);

// ============================================================================
// SESSION MANAGEMENT ROUTES
// ============================================================================

/**
 * @swagger
 * /v2/berseguide/sessions/start:
 *   post:
 *     summary: Start session (Guide)
 *     tags: [BerseGuide]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bookingId
 *     responses:
 *       201:
 *         description: Session started successfully
 */
router.post(
  '/sessions/start',
  authenticateToken,
  asyncHandler(berseGuideController.startSession.bind(berseGuideController))
);

/**
 * @swagger
 * /v2/berseguide/sessions/{sessionId}:
 *   patch:
 *     summary: Update session (Guide)
 *     tags: [BerseGuide]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Session updated successfully
 */
router.patch(
  '/sessions/:sessionId',
  authenticateToken,
  asyncHandler(berseGuideController.updateSession.bind(berseGuideController))
);

/**
 * @swagger
 * /v2/berseguide/sessions/{sessionId}/end:
 *   post:
 *     summary: End session (Guide)
 *     tags: [BerseGuide]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Session ended successfully
 */
router.post(
  '/sessions/:sessionId/end',
  authenticateToken,
  asyncHandler(berseGuideController.endSession.bind(berseGuideController))
);

/**
 * @swagger
 * /v2/berseguide/bookings/{bookingId}/sessions:
 *   get:
 *     summary: Get sessions for a booking
 *     tags: [BerseGuide]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of sessions
 */
router.get(
  '/bookings/:bookingId/sessions',
  authenticateToken,
  asyncHandler(berseGuideController.getSessionsForBooking.bind(berseGuideController))
);

// ============================================================================
// REVIEW ROUTES
// ============================================================================

/**
 * @swagger
 * /v2/berseguide/reviews:
 *   post:
 *     summary: Create review
 *     tags: [BerseGuide]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bookingId
 *               - revieweeId
 *               - reviewerRole
 *               - rating
 *     responses:
 *       201:
 *         description: Review created successfully
 */
router.post(
  '/reviews',
  authenticateToken,
  asyncHandler(berseGuideController.createReview.bind(berseGuideController))
);

/**
 * @swagger
 * /v2/berseguide/reviews/given:
 *   get:
 *     summary: Get reviews given by user
 *     tags: [BerseGuide]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of reviews given
 */
router.get(
  '/reviews/given',
  authenticateToken,
  asyncHandler(berseGuideController.getReviewsGiven.bind(berseGuideController))
);

/**
 * @swagger
 * /v2/berseguide/reviews/received:
 *   get:
 *     summary: Get reviews received by user
 *     tags: [BerseGuide]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of reviews received
 */
router.get(
  '/reviews/received',
  authenticateToken,
  asyncHandler(berseGuideController.getReviewsReceived.bind(berseGuideController))
);

/**
 * @swagger
 * /v2/berseguide/reviews/user/{userId}:
 *   get:
 *     summary: Get public reviews for a specific user
 *     tags: [BerseGuide]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of public reviews
 */
router.get(
  '/reviews/user/:userId',
  asyncHandler(berseGuideController.getUserReviews.bind(berseGuideController))
);

// ============================================================================
// METADATA ROUTES
// ============================================================================

/**
 * @swagger
 * /v2/berseguide/metadata:
 *   get:
 *     summary: Get BerseGuide metadata (guide types, payment types, languages, etc.)
 *     tags: [BerseGuide]
 *     responses:
 *       200:
 *         description: Metadata retrieved successfully
 */
router.get('/metadata', asyncHandler(berseGuideController.getMetadata.bind(berseGuideController)));

// ============================================================================
// SEARCH & DISCOVERY ROUTES
// ============================================================================

/**
 * @swagger
 * /v2/berseguide/search:
 *   get:
 *     summary: Search BerseGuide profiles
 *     tags: [BerseGuide]
 *     parameters:
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: startTime
 *         schema:
 *           type: string
 *       - in: query
 *         name: endTime
 *         schema:
 *           type: string
 *       - in: query
 *         name: numberOfPeople
 *         schema:
 *           type: integer
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
 *         description: Search results
 */
router.get(
  '/search',
  asyncHandler(berseGuideController.searchProfiles.bind(berseGuideController))
);

// ============================================================================
// DASHBOARD ROUTES
// ============================================================================

/**
 * @swagger
 * /v2/berseguide/dashboard:
 *   get:
 *     summary: Get BerseGuide dashboard
 *     tags: [BerseGuide]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data
 */
router.get(
  '/dashboard',
  authenticateToken,
  asyncHandler(berseGuideController.getDashboard.bind(berseGuideController))
);

export default router;
