import { Router } from 'express';
import { EventController } from './event.controller';
import { handleValidationErrors } from '../../middleware/validation';
import { authenticateToken } from '../../middleware/auth';
import { 
  createEventValidators,
  updateEventValidators,
  eventIdValidator,
  eventQueryValidators,
  createTicketTierValidators,
  updateTicketTierValidators,
  purchaseTicketValidators,
  createRsvpValidators,
  checkInValidators,
  getTrendingEventsValidators,
  getNearbyEventsValidators,
  getRecommendedEventsValidators,
  getEventsByHostValidators,
  getCommunityEventsValidators,
  getUserAttendedEventsValidators
} from './event.validators';

const router = Router();

// ============================================================================
// PUBLIC ROUTES
// ============================================================================

/**
 * @swagger
 * /v2/events:
 *   get:
 *     summary: Get all events
 *     description: Retrieve all events with optional filters and pagination
 *     tags: [Events]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Items per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [date, createdAt, price, title]
 *         description: Sort field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [BADMINTON, SOCIAL, WORKSHOP, CONFERENCE, NETWORKING, SPORTS, CULTURAL, CHARITY]
 *         description: Filter by event type
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [DRAFT, PUBLISHED, CANCELLED, COMPLETED]
 *         description: Filter by event status
 *       - in: query
 *         name: isFree
 *         schema:
 *           type: boolean
 *         description: Filter by free/paid events
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Filter by location (partial match)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in title, description, location
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter events starting from this date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter events ending before this date
 *     responses:
 *       200:
 *         description: Events retrieved successfully
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
 *                     events:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Event'
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 */
router.get(
  '/',
  eventQueryValidators,
  handleValidationErrors,
  EventController.getEvents
);

/**
 * @swagger
 * /v2/events/{id}:
 *   get:
 *     summary: Get event by ID
 *     description: Retrieve detailed information about a specific event
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Event retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Event'
 *       404:
 *         description: Event not found
 */
router.get(
  '/:id',
  eventIdValidator,
  handleValidationErrors,
  EventController.getEventById
);

/**
 * @swagger
 * /v2/events/{id}/ticket-tiers:
 *   get:
 *     summary: Get ticket tiers for an event
 *     description: Retrieve all available ticket tiers for a specific event
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Ticket tiers retrieved successfully
 */
router.get(
  '/:id/ticket-tiers',
  eventIdValidator,
  handleValidationErrors,
  EventController.getTicketTiers
);

// ============================================================================
// PROTECTED ROUTES (Require Authentication)
// ============================================================================

/**
 * @swagger
 * /v2/events:
 *   post:
 *     summary: Create new event
 *     description: Create a new event (requires authentication)
 *     tags: [Events]
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
 *               - type
 *               - date
 *               - location
 *               - isFree
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 200
 *                 example: "Summer Badminton Tournament"
 *               description:
 *                 type: string
 *                 maxLength: 5000
 *                 example: "Join us for an exciting badminton tournament!"
 *               type:
 *                 type: string
 *                 enum: [BADMINTON, SOCIAL, WORKSHOP, CONFERENCE, NETWORKING, SPORTS, CULTURAL, CHARITY]
 *                 example: BADMINTON
 *               date:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-06-15T14:00:00Z"
 *               location:
 *                 type: string
 *                 example: "Kuala Lumpur Sports Center"
 *               mapLink:
 *                 type: string
 *                 format: uri
 *                 example: "https://maps.google.com/..."
 *               maxAttendees:
 *                 type: integer
 *                 minimum: 1
 *                 example: 100
 *               notes:
 *                 type: string
 *                 maxLength: 2000
 *                 example: "Please bring your own racket"
 *               communityId:
 *                 type: string
 *                 example: "cm123abc"
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uri
 *                 maxItems: 10
 *               isFree:
 *                 type: boolean
 *                 example: false
 *               price:
 *                 type: number
 *                 minimum: 0
 *                 example: 50.00
 *               currency:
 *                 type: string
 *                 example: MYR
 *               hostType:
 *                 type: string
 *                 enum: [PERSONAL, COMMUNITY]
 *               status:
 *                 type: string
 *                 enum: [DRAFT, PUBLISHED, CANCELLED, COMPLETED]
 *                 default: DRAFT
 *     responses:
 *       201:
 *         description: Event created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/',
  authenticateToken,
  createEventValidators,
  handleValidationErrors,
  EventController.createEvent
);

/**
 * @swagger
 * /v2/events/{id}:
 *   put:
 *     summary: Update event
 *     description: Update an existing event (requires authentication and ownership)
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *               location:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [DRAFT, PUBLISHED, CANCELLED, COMPLETED]
 *     responses:
 *       200:
 *         description: Event updated successfully
 *       403:
 *         description: Not authorized to update this event
 *       404:
 *         description: Event not found
 */
router.put(
  '/:id',
  authenticateToken,
  updateEventValidators,
  handleValidationErrors,
  EventController.updateEvent
);

/**
 * @swagger
 * /v2/events/{id}:
 *   delete:
 *     summary: Delete event
 *     description: Delete an event (requires authentication and ownership)
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Event deleted successfully
 *       400:
 *         description: Cannot delete event with active tickets
 *       403:
 *         description: Not authorized to delete this event
 *       404:
 *         description: Event not found
 */
router.delete(
  '/:id',
  authenticateToken,
  eventIdValidator,
  handleValidationErrors,
  EventController.deleteEvent
);

// ============================================================================
// TICKET TIER ROUTES
// ============================================================================

/**
 * @swagger
 * /v2/events/ticket-tiers:
 *   post:
 *     summary: Create ticket tier
 *     description: Create a new ticket tier for an event
 *     tags: [Events - Tickets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - eventId
 *               - tierName
 *               - price
 *             properties:
 *               eventId:
 *                 type: string
 *               tierName:
 *                 type: string
 *                 example: "VIP"
 *               description:
 *                 type: string
 *                 example: "Premium seating with refreshments"
 *               price:
 *                 type: number
 *                 example: 150.00
 *               totalQuantity:
 *                 type: integer
 *                 example: 50
 *               minPurchase:
 *                 type: integer
 *                 default: 1
 *               maxPurchase:
 *                 type: integer
 *                 default: 10
 *     responses:
 *       201:
 *         description: Ticket tier created successfully
 */
router.post(
  '/ticket-tiers',
  authenticateToken,
  createTicketTierValidators,
  handleValidationErrors,
  EventController.createTicketTier
);

/**
 * @swagger
 * /v2/events/ticket-tiers/{id}:
 *   put:
 *     summary: Update ticket tier
 *     description: Update an existing ticket tier
 *     tags: [Events - Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tierName:
 *                 type: string
 *               price:
 *                 type: number
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Ticket tier updated successfully
 */
router.put(
  '/ticket-tiers/:id',
  authenticateToken,
  updateTicketTierValidators,
  handleValidationErrors,
  EventController.updateTicketTier
);

// ============================================================================
// TICKET PURCHASE ROUTES
// ============================================================================

/**
 * @swagger
 * /v2/events/tickets/purchase:
 *   post:
 *     summary: Purchase ticket
 *     description: Purchase a ticket for an event
 *     tags: [Events - Tickets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - eventId
 *             properties:
 *               eventId:
 *                 type: string
 *               ticketTierId:
 *                 type: string
 *               quantity:
 *                 type: integer
 *                 default: 1
 *               attendeeName:
 *                 type: string
 *               attendeeEmail:
 *                 type: string
 *               attendeePhone:
 *                 type: string
 *     responses:
 *       201:
 *         description: Ticket purchased successfully
 */
router.post(
  '/tickets/purchase',
  authenticateToken,
  purchaseTicketValidators,
  handleValidationErrors,
  EventController.purchaseTicket
);

/**
 * @swagger
 * /v2/events/tickets/my-tickets:
 *   get:
 *     summary: Get my tickets
 *     description: Retrieve all tickets purchased by the authenticated user
 *     tags: [Events - Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: eventId
 *         schema:
 *           type: string
 *         description: Filter by event ID
 *     responses:
 *       200:
 *         description: Tickets retrieved successfully
 */
router.get(
  '/tickets/my-tickets',
  authenticateToken,
  EventController.getMyTickets
);

// ============================================================================
// RSVP ROUTES
// ============================================================================

/**
 * @swagger
 * /v2/events/{id}/rsvp:
 *   post:
 *     summary: RSVP to event
 *     description: RSVP to a free event
 *     tags: [Events - RSVP]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: RSVP created successfully
 *       400:
 *         description: Already RSVP'd or event is at capacity
 */
router.post(
  '/:id/rsvp',
  authenticateToken,
  createRsvpValidators,
  handleValidationErrors,
  EventController.createRsvp
);

/**
 * @swagger
 * /v2/events/{id}/rsvp:
 *   delete:
 *     summary: Cancel RSVP
 *     description: Cancel RSVP to an event
 *     tags: [Events - RSVP]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: RSVP cancelled successfully
 */
router.delete(
  '/:id/rsvp',
  authenticateToken,
  createRsvpValidators,
  handleValidationErrors,
  EventController.cancelRsvp
);

/**
 * @swagger
 * /v2/events/rsvps/my-rsvps:
 *   get:
 *     summary: Get my RSVPs
 *     description: Retrieve all RSVPs made by the authenticated user
 *     tags: [Events - RSVP]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: RSVPs retrieved successfully
 */
router.get(
  '/rsvps/my-rsvps',
  authenticateToken,
  EventController.getMyRsvps
);

/**
 * @swagger
 * /v2/events/rsvps/{rsvpId}/qr-code:
 *   get:
 *     summary: Generate QR code for RSVP
 *     description: Generate a secure, time-limited QR code for event check-in. QR codes are generated on-demand with JWT tokens.
 *     tags: [Events - RSVP]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: rsvpId
 *         required: true
 *         schema:
 *           type: string
 *         description: RSVP ID
 *     responses:
 *       200:
 *         description: QR code generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 qrCode:
 *                   type: string
 *                   description: Base64 encoded QR code image (Data URL)
 *       403:
 *         description: Not authorized to access this RSVP
 *       404:
 *         description: RSVP not found
 */
router.get(
  '/rsvps/:rsvpId/qr-code',
  authenticateToken,
  EventController.getRsvpQrCode
);

// ============================================================================
// ATTENDANCE ROUTES
// ============================================================================

/**
 * @swagger
 * /v2/events/{id}/check-in:
 *   post:
 *     summary: Check-in attendee
 *     description: |
 *       Check-in an attendee using user ID or QR code.
 *       
 *       **Automatic Trust Score Update:**
 *       After successful check-in, the attendee's trust score is automatically recalculated
 *       to include their event attendance in the activity component (30% of total trust score).
 *       
 *       **Requirements:**
 *       - User must have an active RSVP or valid ticket
 *       - QR code must be valid JWT token (if using QR method)
 *       - User cannot check in twice to the same event
 *     tags: [Events - Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: User ID (use this OR qrCode, not both)
 *               qrCode:
 *                 type: string
 *     responses:
 *       201:
 *         description: Check-in successful, trust score updated
 *       400:
 *         description: Already checked in or invalid data
 */
router.post(
  '/:id/check-in',
  authenticateToken,
  checkInValidators,
  handleValidationErrors,
  EventController.checkInAttendee
);

/**
 * @swagger
 * /v2/events/{id}/attendees:
 *   get:
 *     summary: Get event attendees
 *     description: Retrieve all attendees who have checked in to an event
 *     tags: [Events - Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Attendees retrieved successfully
 */
router.get(
  '/:id/attendees',
  authenticateToken,
  eventIdValidator,
  handleValidationErrors,
  EventController.getEventAttendees
);

// ============================================================================
// DISCOVERY ROUTES
// ============================================================================

/**
 * @swagger
 * /v2/events/discovery/trending:
 *   get:
 *     summary: Get trending events
 *     description: Retrieve trending events based on engagement, recency, and capacity
 *     tags: [Events - Discovery]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Maximum number of events to return
 *     responses:
 *       200:
 *         description: Trending events retrieved successfully
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
 *                   example: Trending events retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Event'
 */
router.get(
  '/discovery/trending',
  getTrendingEventsValidators,
  handleValidationErrors,
  EventController.getTrendingEvents
);

/**
 * @swagger
 * /v2/events/discovery/nearby:
 *   get:
 *     summary: Get nearby events
 *     description: Retrieve events near a specific location
 *     tags: [Events - Discovery]
 *     parameters:
 *       - in: query
 *         name: latitude
 *         required: true
 *         schema:
 *           type: number
 *           minimum: -90
 *           maximum: 90
 *         description: Latitude coordinate
 *       - in: query
 *         name: longitude
 *         required: true
 *         schema:
 *           type: number
 *           minimum: -180
 *           maximum: 180
 *         description: Longitude coordinate
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *           minimum: 1
 *           maximum: 500
 *           default: 50
 *         description: Search radius in kilometers
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Maximum number of events to return
 *     responses:
 *       200:
 *         description: Nearby events retrieved successfully
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
 *                   example: Nearby events retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Event'
 */
router.get(
  '/discovery/nearby',
  getNearbyEventsValidators,
  handleValidationErrors,
  EventController.getNearbyEvents
);

/**
 * @swagger
 * /v2/events/discovery/recommended:
 *   get:
 *     summary: Get recommended events
 *     description: Retrieve personalized event recommendations based on user history and preferences
 *     tags: [Events - Discovery]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Maximum number of events to return
 *     responses:
 *       200:
 *         description: Recommended events retrieved successfully
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
 *                   example: Recommended events retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Event'
 */
router.get(
  '/discovery/recommended',
  authenticateToken,
  getRecommendedEventsValidators,
  handleValidationErrors,
  EventController.getRecommendedEvents
);

/**
 * @swagger
 * /v2/events/discovery/host/{hostId}:
 *   get:
 *     summary: Get events by host
 *     description: Retrieve all events created by a specific host
 *     tags: [Events - Discovery]
 *     parameters:
 *       - in: path
 *         name: hostId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the host/organizer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Maximum number of events to return
 *     responses:
 *       200:
 *         description: Host events retrieved successfully
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
 *                   example: Host events retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Event'
 */
router.get(
  '/discovery/host/:hostId',
  getEventsByHostValidators,
  handleValidationErrors,
  EventController.getEventsByHost
);

/**
 * @swagger
 * /v2/events/discovery/my-communities:
 *   get:
 *     summary: Get events from user's communities
 *     description: Retrieve events from all communities the authenticated user belongs to
 *     tags: [Events - Discovery]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Maximum number of events to return
 *     responses:
 *       200:
 *         description: Community events retrieved successfully
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
 *                   example: Community events retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Event'
 */
router.get(
  '/discovery/my-communities',
  authenticateToken,
  getCommunityEventsValidators,
  handleValidationErrors,
  EventController.getCommunityEvents
);

/**
 * @swagger
 * /v2/events/discovery/user/{userId}/attended:
 *   get:
 *     summary: Get events a user has attended
 *     description: Retrieve events that a specific user has checked in to (for profile viewing). Defaults to last 6 months if no date range specified.
 *     tags: [Events - Discovery]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Maximum number of events to return
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter events from this date (ISO 8601 format)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter events until this date (ISO 8601 format)
 *     responses:
 *       200:
 *         description: User attended events retrieved successfully
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
 *                   example: User attended events retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/Event'
 *                       - type: object
 *                         properties:
 *                           checkedInAt:
 *                             type: string
 *                             format: date-time
 *                             description: When the user checked in to this event
 */
router.get(
  '/discovery/user/:userId/attended',
  getUserAttendedEventsValidators,
  handleValidationErrors,
  EventController.getUserAttendedEvents
);

export default router;
