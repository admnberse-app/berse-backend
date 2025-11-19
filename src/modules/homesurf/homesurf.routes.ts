import { Router } from 'express';
import { HomeSurfController } from './homesurf.controller';
import { authenticateToken } from '../../middleware/auth';
import { handleValidationErrors } from '../../middleware/validation';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();
const homeSurfController = new HomeSurfController();

/**
 * @swagger
 * tags:
 *   name: HomeSurf
 *   description: HomeSurf accommodation hosting and booking endpoints
 */

// ============================================================================
// PROFILE MANAGEMENT ROUTES
// ============================================================================

/**
 * @swagger
 * /v2/homesurf/profile:
 *   get:
 *     summary: Get current user's HomeSurf profile
 *     tags: [HomeSurf]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: HomeSurf profile retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Profile not found
 */
router.get(
  '/profile',
  authenticateToken,
  asyncHandler(homeSurfController.getMyProfile.bind(homeSurfController))
);

/**
 * @swagger
 * /v2/homesurf/profile/{userId}:
 *   get:
 *     summary: Get a user's HomeSurf profile by ID
 *     tags: [HomeSurf]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: HomeSurf profile retrieved successfully
 *       404:
 *         description: Profile not found
 */
router.get(
  '/profile/:userId',
  asyncHandler(homeSurfController.getProfileById.bind(homeSurfController))
);

/**
 * @swagger
 * /v2/homesurf/profile:
 *   post:
 *     summary: Create HomeSurf profile
 *     tags: [HomeSurf]
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
 *               - description
 *               - accommodationType
 *               - city
 *               - coordinates
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               accommodationType:
 *                 type: string
 *                 enum: [PRIVATE_ROOM, SHARED_ROOM, COUCH, OUTDOOR, ENTIRE_HOME]
 *               maxGuests:
 *                 type: integer
 *               city:
 *                 type: string
 *               coordinates:
 *                 type: object
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
  asyncHandler(homeSurfController.createProfile.bind(homeSurfController))
);

/**
 * @swagger
 * /v2/homesurf/profile:
 *   patch:
 *     summary: Update HomeSurf profile
 *     tags: [HomeSurf]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       404:
 *         description: Profile not found
 */
router.patch(
  '/profile',
  authenticateToken,
  asyncHandler(homeSurfController.updateProfile.bind(homeSurfController))
);

/**
 * @swagger
 * /v2/homesurf/profile/toggle:
 *   patch:
 *     summary: Toggle HomeSurf profile on/off
 *     tags: [HomeSurf]
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
  asyncHandler(homeSurfController.toggleProfile.bind(homeSurfController))
);

/**
 * @swagger
 * /v2/homesurf/profile:
 *   delete:
 *     summary: Delete HomeSurf profile
 *     tags: [HomeSurf]
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
  asyncHandler(homeSurfController.deleteProfile.bind(homeSurfController))
);

/**
 * @swagger
 * /v2/homesurf/eligibility:
 *   get:
 *     summary: Check if user can enable HomeSurf
 *     tags: [HomeSurf]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Eligibility check result
 */
router.get(
  '/eligibility',
  authenticateToken,
  asyncHandler(homeSurfController.checkEligibility.bind(homeSurfController))
);

// ============================================================================
// PAYMENT OPTIONS ROUTES
// ============================================================================

/**
 * @swagger
 * /v2/homesurf/payment-options:
 *   get:
 *     summary: Get all payment options for user's HomeSurf profile
 *     tags: [HomeSurf]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payment options retrieved successfully
 */
router.get(
  '/payment-options',
  authenticateToken,
  asyncHandler(homeSurfController.getPaymentOptions.bind(homeSurfController))
);

/**
 * @swagger
 * /v2/homesurf/payment-options:
 *   post:
 *     summary: Add payment option
 *     tags: [HomeSurf]
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
 *             properties:
 *               paymentType:
 *                 type: string
 *                 enum: [MONEY, SKILL_TRADE, TREAT_ME, BERSE_POINTS, FREE, NEGOTIABLE]
 *     responses:
 *       201:
 *         description: Payment option added successfully
 */
router.post(
  '/payment-options',
  authenticateToken,
  asyncHandler(homeSurfController.addPaymentOption.bind(homeSurfController))
);

/**
 * @swagger
 * /v2/homesurf/payment-options/{optionId}:
 *   patch:
 *     summary: Update payment option
 *     tags: [HomeSurf]
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
  asyncHandler(homeSurfController.updatePaymentOption.bind(homeSurfController))
);

/**
 * @swagger
 * /v2/homesurf/payment-options/{optionId}:
 *   delete:
 *     summary: Delete payment option
 *     tags: [HomeSurf]
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
  asyncHandler(homeSurfController.deletePaymentOption.bind(homeSurfController))
);

// ============================================================================
// BOOKING MANAGEMENT ROUTES
// ============================================================================

/**
 * @swagger
 * /v2/homesurf/bookings:
 *   post:
 *     summary: Create booking request (Guest)
 *     tags: [HomeSurf]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - hostId
 *               - checkInDate
 *               - checkOutDate
 *               - numberOfGuests
 *             properties:
 *               hostId:
 *                 type: string
 *               checkInDate:
 *                 type: string
 *                 format: date
 *               checkOutDate:
 *                 type: string
 *                 format: date
 *               numberOfGuests:
 *                 type: integer
 *               message:
 *                 type: string
 *     responses:
 *       201:
 *         description: Booking request created successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: Host not available for these dates
 */
router.post(
  '/bookings',
  authenticateToken,
  asyncHandler(homeSurfController.createBookingRequest.bind(homeSurfController))
);

/**
 * @swagger
 * /v2/homesurf/availability:
 *   post:
 *     summary: Check availability for dates
 *     tags: [HomeSurf]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - hostId
 *               - checkInDate
 *               - checkOutDate
 *     responses:
 *       200:
 *         description: Availability check result
 */
router.post(
  '/availability',
  asyncHandler(homeSurfController.checkAvailability.bind(homeSurfController))
);

/**
 * @swagger
 * /v2/homesurf/bookings/{bookingId}:
 *   get:
 *     summary: Get booking by ID
 *     tags: [HomeSurf]
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
  asyncHandler(homeSurfController.getBooking.bind(homeSurfController))
);

/**
 * @swagger
 * /v2/homesurf/bookings/host:
 *   get:
 *     summary: Get bookings as host
 *     tags: [HomeSurf]
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
  '/bookings/host',
  authenticateToken,
  asyncHandler(homeSurfController.getBookingsAsHost.bind(homeSurfController))
);

/**
 * @swagger
 * /v2/homesurf/stays:
 *   get:
 *     summary: Get stays as guest
 *     tags: [HomeSurf]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of stays
 */
router.get(
  '/stays',
  authenticateToken,
  asyncHandler(homeSurfController.getStaysAsGuest.bind(homeSurfController))
);

/**
 * @swagger
 * /v2/homesurf/bookings/{bookingId}/approve:
 *   patch:
 *     summary: Approve booking (Host)
 *     tags: [HomeSurf]
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
  asyncHandler(homeSurfController.approveBooking.bind(homeSurfController))
);

/**
 * @swagger
 * /v2/homesurf/bookings/{bookingId}/reject:
 *   patch:
 *     summary: Reject booking (Host)
 *     tags: [HomeSurf]
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
  asyncHandler(homeSurfController.rejectBooking.bind(homeSurfController))
);

/**
 * @swagger
 * /v2/homesurf/bookings/{bookingId}/cancel:
 *   patch:
 *     summary: Cancel booking
 *     tags: [HomeSurf]
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
  asyncHandler(homeSurfController.cancelBooking.bind(homeSurfController))
);

/**
 * @swagger
 * /v2/homesurf/bookings/{bookingId}/check-in:
 *   patch:
 *     summary: Check in guest (Host)
 *     tags: [HomeSurf]
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
 *         description: Guest checked in successfully
 */
router.patch(
  '/bookings/:bookingId/check-in',
  authenticateToken,
  asyncHandler(homeSurfController.checkInGuest.bind(homeSurfController))
);

/**
 * @swagger
 * /v2/homesurf/bookings/{bookingId}/check-out:
 *   patch:
 *     summary: Check out guest (Host)
 *     tags: [HomeSurf]
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
 *         description: Guest checked out successfully
 */
router.patch(
  '/bookings/:bookingId/check-out',
  authenticateToken,
  asyncHandler(homeSurfController.checkOutGuest.bind(homeSurfController))
);

// ============================================================================
// REVIEW ROUTES
// ============================================================================

/**
 * @swagger
 * /v2/homesurf/reviews:
 *   post:
 *     summary: Create review
 *     tags: [HomeSurf]
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
 *             properties:
 *               bookingId:
 *                 type: string
 *               revieweeId:
 *                 type: string
 *               reviewerRole:
 *                 type: string
 *                 enum: [HOST, GUEST]
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *     responses:
 *       201:
 *         description: Review created successfully
 */
router.post(
  '/reviews',
  authenticateToken,
  asyncHandler(homeSurfController.createReview.bind(homeSurfController))
);

/**
 * @swagger
 * /v2/homesurf/reviews/given:
 *   get:
 *     summary: Get reviews given by user
 *     tags: [HomeSurf]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of reviews given
 */
router.get(
  '/reviews/given',
  authenticateToken,
  asyncHandler(homeSurfController.getReviewsGiven.bind(homeSurfController))
);

/**
 * @swagger
 * /v2/homesurf/reviews/received:
 *   get:
 *     summary: Get reviews received by user
 *     tags: [HomeSurf]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of reviews received
 */
router.get(
  '/reviews/received',
  authenticateToken,
  asyncHandler(homeSurfController.getReviewsReceived.bind(homeSurfController))
);

/**
 * @swagger
 * /v2/homesurf/reviews/user/{userId}:
 *   get:
 *     summary: Get public reviews for a specific user
 *     tags: [HomeSurf]
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
  asyncHandler(homeSurfController.getUserReviews.bind(homeSurfController))
);

// ============================================================================
// METADATA ROUTES
// ============================================================================

/**
 * @swagger
 * /v2/homesurf/metadata:
 *   get:
 *     summary: Get HomeSurf metadata (accommodation types, amenities, payment types, etc.)
 *     tags: [HomeSurf]
 *     responses:
 *       200:
 *         description: Metadata retrieved successfully
 */
router.get('/metadata', asyncHandler(homeSurfController.getMetadata.bind(homeSurfController)));

// ============================================================================
// SEARCH & DISCOVERY ROUTES
// ============================================================================

/**
 * @swagger
 * /v2/homesurf/search:
 *   get:
 *     summary: Search HomeSurf profiles
 *     tags: [HomeSurf]
 *     parameters:
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *       - in: query
 *         name: checkInDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: checkOutDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: numberOfGuests
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
  asyncHandler(homeSurfController.searchProfiles.bind(homeSurfController))
);

// ============================================================================
// DASHBOARD ROUTES
// ============================================================================

/**
 * @swagger
 * /v2/homesurf/my:
 *   get:
 *     summary: Get my HomeSurf bookings and stays
 *     tags: [HomeSurf]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: filter
 *         schema:
 *           type: string
 *           enum: [upcoming, past, all]
 *           default: all
 *         description: Time-based filter (upcoming/past/all)
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, DISCUSSING, APPROVED, REJECTED, CHECKED_IN, CHECKED_OUT, COMPLETED, CANCELLED_BY_HOST, CANCELLED_BY_GUEST]
 *         description: Booking status filter
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [host, guest, all]
 *           default: all
 *         description: Filter by user role in bookings
 *     responses:
 *       200:
 *         description: User's HomeSurf bookings categorized by role
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
 *                     asHost:
 *                       type: array
 *                       items:
 *                         type: object
 *                     asGuest:
 *                       type: array
 *                       items:
 *                         type: object
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/my',
  authenticateToken,
  asyncHandler(homeSurfController.getMyHomeSurf.bind(homeSurfController))
);

/**
 * @swagger
 * /v2/homesurf/dashboard:
 *   get:
 *     summary: Get HomeSurf dashboard
 *     tags: [HomeSurf]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data
 */
router.get(
  '/dashboard',
  authenticateToken,
  asyncHandler(homeSurfController.getDashboard.bind(homeSurfController))
);

export default router;
