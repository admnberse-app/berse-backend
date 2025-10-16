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
  checkInValidators
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

// ============================================================================
// ATTENDANCE ROUTES
// ============================================================================

/**
 * @swagger
 * /v2/events/{id}/check-in:
 *   post:
 *     summary: Check-in attendee
 *     description: Check-in an attendee using user ID or QR code
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
 *               qrCode:
 *                 type: string
 *     responses:
 *       201:
 *         description: Check-in successful
 *       400:
 *         description: Already checked in
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

export default router;
