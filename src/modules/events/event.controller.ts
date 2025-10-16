import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../types';
import { EventService } from './event.service';
import { sendSuccess } from '../../utils/response';
import { 
  CreateEventRequest, 
  UpdateEventRequest, 
  EventQuery,
  CreateTicketTierRequest,
  UpdateTicketTierRequest,
  PurchaseTicketRequest,
  CheckInRequest
} from './event.types';
import logger from '../../utils/logger';

export class EventController {
  
  // ============================================================================
  // EVENT CRUD ENDPOINTS
  // ============================================================================
  
  /**
   * Create new event
   * @route POST /v2/events
   */
  static async createEvent(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const data: CreateEventRequest = req.body;

      const event = await EventService.createEvent(userId, data);

      logger.info(`Event created: ${event.id} by user ${userId}`);
      sendSuccess(res, event, 'Event created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all events with filters
   * @route GET /v2/events
   */
  static async getEvents(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      const query: EventQuery = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
        sortBy: req.query.sortBy as any,
        sortOrder: req.query.sortOrder as any,
        filters: {
          type: req.query.type as any,
          status: req.query.status as any,
          hostType: req.query.hostType as any,
          isFree: req.query.isFree === 'true' ? true : req.query.isFree === 'false' ? false : undefined,
          startDate: req.query.startDate as string,
          endDate: req.query.endDate as string,
          location: req.query.location as string,
          communityId: req.query.communityId as string,
          hostId: req.query.hostId as string,
          search: req.query.search as string,
          minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
          maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
        },
      };

      const result = await EventService.getEvents(query, userId);

      sendSuccess(res, result, 'Events retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get event by ID
   * @route GET /v2/events/:id
   */
  static async getEventById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      const event = await EventService.getEventById(id, userId);

      sendSuccess(res, event, 'Event retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update event
   * @route PUT /v2/events/:id
   */
  static async updateEvent(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const data: UpdateEventRequest = req.body;

      const event = await EventService.updateEvent(id, userId, data);

      logger.info(`Event updated: ${id} by user ${userId}`);
      sendSuccess(res, event, 'Event updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete event
   * @route DELETE /v2/events/:id
   */
  static async deleteEvent(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      await EventService.deleteEvent(id, userId);

      logger.info(`Event deleted: ${id} by user ${userId}`);
      sendSuccess(res, null, 'Event deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  // ============================================================================
  // TICKET TIER ENDPOINTS
  // ============================================================================

  /**
   * Create ticket tier
   * @route POST /v2/events/ticket-tiers
   */
  static async createTicketTier(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const data: CreateTicketTierRequest = req.body;

      const tier = await EventService.createTicketTier(userId, data);

      logger.info(`Ticket tier created for event ${data.eventId} by user ${userId}`);
      sendSuccess(res, tier, 'Ticket tier created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get ticket tiers for an event
   * @route GET /v2/events/:id/ticket-tiers
   */
  static async getTicketTiers(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const tiers = await EventService.getTicketTiers(id);

      sendSuccess(res, tiers, 'Ticket tiers retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update ticket tier
   * @route PUT /v2/events/ticket-tiers/:id
   */
  static async updateTicketTier(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const data: UpdateTicketTierRequest = req.body;

      const tier = await EventService.updateTicketTier(id, userId, data);

      logger.info(`Ticket tier updated: ${id} by user ${userId}`);
      sendSuccess(res, tier, 'Ticket tier updated successfully');
    } catch (error) {
      next(error);
    }
  }

  // ============================================================================
  // TICKET PURCHASE ENDPOINTS
  // ============================================================================

  /**
   * Purchase ticket
   * @route POST /v2/events/tickets/purchase
   */
  static async purchaseTicket(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const data: PurchaseTicketRequest = req.body;

      const ticket = await EventService.purchaseTicket(userId, data);

      logger.info(`Ticket purchased for event ${data.eventId} by user ${userId}`);
      sendSuccess(res, ticket, 'Ticket purchased successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user's tickets
   * @route GET /v2/events/tickets/my-tickets
   */
  static async getMyTickets(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const eventId = req.query.eventId as string | undefined;

      const tickets = await EventService.getUserTickets(userId, eventId);

      sendSuccess(res, tickets, 'Tickets retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  // ============================================================================
  // RSVP ENDPOINTS
  // ============================================================================

  /**
   * Create RSVP
   * @route POST /v2/events/:id/rsvp
   */
  static async createRsvp(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const rsvp = await EventService.createRsvp(userId, id);

      logger.info(`RSVP created for event ${id} by user ${userId}`);
      sendSuccess(res, rsvp, 'RSVP created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cancel RSVP
   * @route DELETE /v2/events/:id/rsvp
   */
  static async cancelRsvp(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      await EventService.cancelRsvp(userId, id);

      logger.info(`RSVP cancelled for event ${id} by user ${userId}`);
      sendSuccess(res, null, 'RSVP cancelled successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user's RSVPs
   * @route GET /v2/events/rsvps/my-rsvps
   */
  static async getMyRsvps(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;

      const rsvps = await EventService.getUserRsvps(userId);

      sendSuccess(res, rsvps, 'RSVPs retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Generate QR code for RSVP
   * @route GET /v2/events/rsvps/:rsvpId/qr-code
   */
  static async getRsvpQrCode(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { rsvpId } = req.params;
      const qrCodeDataUrl = await EventService.generateRsvpQrCode(rsvpId, req.user!.id);
      sendSuccess(res, { qrCode: qrCodeDataUrl }, 'QR code generated successfully');
    } catch (error) {
      next(error);
    }
  }

  // ============================================================================
  // ATTENDANCE ENDPOINTS
  // ============================================================================

  /**
   * Check-in attendee
   * @route POST /v2/events/:id/check-in
   */
  static async checkInAttendee(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const data: CheckInRequest = {
        eventId: id,
        userId: req.body.userId,
        qrCode: req.body.qrCode,
      };

      const attendance = await EventService.checkInAttendee(id, data);

      logger.info(`Attendee checked in for event ${id}`);
      sendSuccess(res, attendance, 'Check-in successful', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get event attendees
   * @route GET /v2/events/:id/attendees
   */
  static async getEventAttendees(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const attendees = await EventService.getEventAttendees(id);

      sendSuccess(res, attendees, 'Attendees retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get trending events
   * @route GET /v2/events/discovery/trending
   */
  static async getTrendingEvents(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;

      const events = await EventService.getTrendingEvents(limit, userId);

      sendSuccess(res, events, 'Trending events retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get nearby events
   * @route GET /v2/events/discovery/nearby
   */
  static async getNearbyEvents(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      const { latitude, longitude } = req.query;
      const radiusKm = req.query.radius ? parseFloat(req.query.radius as string) : 50;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;

      const lat = parseFloat(latitude as string);
      const lng = parseFloat(longitude as string);

      const events = await EventService.getNearbyEvents(lat, lng, radiusKm, limit, userId);

      sendSuccess(res, events, 'Nearby events retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get recommended events for user
   * @route GET /v2/events/discovery/recommended
   */
  static async getRecommendedEvents(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;

      const events = await EventService.getRecommendedEvents(userId, limit);

      sendSuccess(res, events, 'Recommended events retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get events by host
   * @route GET /v2/events/discovery/host/:hostId
   */
  static async getEventsByHost(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { hostId } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;

      const events = await EventService.getEventsByHost(hostId, limit);

      sendSuccess(res, events, 'Host events retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get events from user's communities
   * @route GET /v2/events/discovery/my-communities
   */
  static async getCommunityEvents(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;

      const events = await EventService.getCommunityEvents(userId, limit);

      sendSuccess(res, events, 'Community events retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get events a user has attended (for profile viewing)
   * @route GET /v2/events/discovery/user/:userId/attended
   */
  static async getUserAttendedEvents(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      
      // Optional date range filters
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

      const events = await EventService.getUserAttendedEvents(userId, limit, startDate, endDate);

      sendSuccess(res, events, 'User attended events retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}
