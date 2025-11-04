import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../types';
import { EventService } from './event.service';
import { QRCodeService } from '../user/qr-code.service';
import { sendSuccess } from '../../utils/response';
import { AppError } from '../../middleware/error';
import { 
  CreateEventRequest, 
  UpdateEventRequest, 
  EventQuery,
  CreateTicketTierRequest,
  UpdateTicketTierRequest,
  PurchaseTicketRequest,
  CheckInRequest
} from './event.types';
import { EventType } from '@prisma/client';
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

      const message = result.isFallback 
        ? 'No events match your filters. Showing upcoming events instead.'
        : 'Events retrieved successfully';

      sendSuccess(res, result, message);
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
   * Get my participation details for a specific event
   * Shows payment status, tickets, and retry payment option
   * @route GET /v2/events/:id/participation
   */
  static async getMyEventParticipation(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { id: eventId } = req.params;

      const participation = await EventService.getUserEventParticipation(userId, eventId);

      sendSuccess(res, participation, 'Participation details retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user's events (unified: both free and paid)
   * @route GET /v2/events/my
   */
  static async getMyEvents(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { eventId, filter, status, type } = req.query;

      // Get all events user is participating in (includes both free and paid events)
      const participants = await EventService.getUserParticipations(userId, {
        eventId: eventId as string | undefined,
        filter: filter as 'upcoming' | 'past' | 'all' | undefined,
        status: status as string | undefined,
        type: type as string | undefined,
      });

      sendSuccess(res, participants, 'Events retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get my participations (tickets + RSVPs)
   * Unified endpoint for both free (RSVP) and paid (ticket) events
   * @route GET /v2/events/me/participations
   * @deprecated Use GET /v2/events/my instead
   */
  static async getMyParticipations(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const eventId = req.query.eventId as string | undefined;

      // Get all participations (includes both free and paid events)
      const participants = await EventService.getUserParticipations(userId, { eventId });

      sendSuccess(res, participants, 'Participations retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user's tickets (legacy endpoint - only paid events)
   * @route GET /v2/events/me/tickets
   * @deprecated Use /v2/events/me/participations instead
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
   * Register for event
   * @route POST /v2/events/:id/register
   */
  static async registerForEvent(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const participant = await EventService.createRsvp(userId, id);

      logger.info(`User ${userId} registered for event ${id}`);
      sendSuccess(res, participant, 'Successfully registered for event', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cancel registration
   * @route DELETE /v2/events/:id/register
   */
  static async cancelRegistration(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      await EventService.cancelRsvp(userId, id);

      logger.info(`User ${userId} cancelled registration for event ${id}`);
      sendSuccess(res, null, 'Registration cancelled successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get my registrations (legacy endpoint - only free events)
   * @route GET /v2/events/me/registrations
   * @deprecated Use /v2/events/me/participations instead
   */
  static async getMyRegistrations(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;

      const participants = await EventService.getUserRsvps(userId);

      sendSuccess(res, participants, 'Registrations retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Generate QR code for participant
   * @route GET /v2/events/participants/:participantId/qr-code
   */
  static async getParticipantQrCode(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { participantId } = req.params;
      const qrCodeDataUrl = await EventService.generateRsvpQrCode(participantId, req.user!.id);
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
   * Scan QR code for event check-in
   * @route POST /v2/events/scan-qr
   */
  static async scanQRCodeForCheckin(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const organizerId = req.user!.id;
      const { qrData } = req.body;

      if (!qrData) {
        throw new AppError('QR code data is required', 400);
      }

      // Validate QR code
      const qrValidation = await QRCodeService.validateQRCode(qrData);

      if (qrValidation.purpose !== 'CHECKIN') {
        throw new AppError('This QR code is not for event check-in', 400);
      }

      const attendeeUserId = qrValidation.userId;
      const eventId = qrValidation.eventId!;

      // Verify organizer has permission to check-in for this event
      const event = await EventService.getEventById(eventId, organizerId);
      if (!event.isOwner) {
        throw new AppError('You do not have permission to check-in attendees for this event', 403);
      }

      // Check-in the attendee
      const data = {
        eventId,
        userId: attendeeUserId,
        qrCode: qrData,
      };

      const attendance = await EventService.checkInAttendee(eventId, data);

      // Invalidate QR code nonce to prevent reuse
      await QRCodeService.invalidateQRCode(qrValidation.userId);

      logger.info(`QR check-in: Event ${eventId}, Attendee ${attendeeUserId}`);
      
      sendSuccess(res, {
        ...qrValidation,
        attendance,
        event: {
          id: event.id,
          title: event.title,
          date: event.date,
        },
        message: 'Check-in successful',
      }, 'Attendee checked in successfully via QR code', 201);
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
   * Get all event participants (unified endpoint)
   * @route GET /v2/events/:id/participants
   */
  static async getEventParticipants(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { status, hasTicket, checkedIn } = req.query;

      const filters: any = {}; 
      if (status) filters.status = status as string;
      if (hasTicket !== undefined) filters.hasTicket = hasTicket === 'true';
      if (checkedIn !== undefined) filters.checkedIn = checkedIn === 'true';

      const participants = await EventService.getEventParticipants(id, filters);

      sendSuccess(res, participants, 'Participants retrieved successfully');
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

  // ============================================================================
  // CALENDAR ENDPOINTS
  // ============================================================================

  /**
   * Get events happening today
   * @route GET /v2/events/calendar/today
   */
  static async getDayEvents(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const date = req.query.date as string;
      const type = req.query.type as any;
      const sortBy = (req.query.sortBy as any) || 'date';
      const sortOrder = (req.query.sortOrder as any) || 'asc';
      const timezone = (req.query.timezone as string) || 'UTC';

      const events = await EventService.getDayEvents(date, type, sortBy, sortOrder, timezone);

      sendSuccess(res, { events, count: events.length, date }, 'Events for the specified date retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getTodayEvents(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const type = req.query.type as any;
      const sortBy = (req.query.sortBy as any) || 'date';
      const sortOrder = (req.query.sortOrder as any) || 'asc';
      const timezone = (req.query.timezone as string) || 'UTC';

      const events = await EventService.getTodayEvents(type, sortBy, sortOrder, timezone);

      sendSuccess(res, { events, count: events.length }, 'Today events retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get events for the next 7 days, grouped by date
   * @route GET /v2/events/calendar/week
   */
  static async getWeekSchedule(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const type = req.query.type as any;
      const timezone = (req.query.timezone as string) || 'UTC';

      const schedule = await EventService.getWeekSchedule(type, timezone);

      sendSuccess(res, schedule, 'Week schedule retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get events for a specific month
   * @route GET /v2/events/calendar/month
   */
  static async getMonthEvents(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const year = parseInt(req.query.year as string);
      const month = parseInt(req.query.month as string);
      const type = req.query.type as any;
      const timezone = (req.query.timezone as string) || 'UTC';

      if (!year || !month || month < 1 || month > 12) {
        throw new AppError('Valid year and month (1-12) are required', 400);
      }

      const result = await EventService.getMonthEvents(year, month, type, timezone);

      sendSuccess(res, result, 'Month events retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get event counts for calendar view
   * @route GET /v2/events/calendar/counts
   */
  static async getCalendarCounts(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      const type = req.query.type as any;

      const counts = await EventService.getCalendarCounts(startDate, endDate, type);

      sendSuccess(res, { counts, total: Object.values(counts).reduce((sum, count) => sum + count, 0) }, 'Calendar counts retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all event types
   * @route GET /v2/events/types
   */
  static async getEventTypes(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // Custom labels for better user experience
      const labelMap: Record<string, string> = {
        'SOCIAL': 'Social',
        'SPORTS': 'Sports',
        'TRIP': 'Trip',
        'ILM': 'ILM (Islamic Learning)',
        'CAFE_MEETUP': 'Cafe Meetup',
        'VOLUNTEER': 'Volunteer',
        'MONTHLY_EVENT': 'Monthly Event',
        'LOCAL_TRIP': 'Local Trip',
        'EDUCATIONAL': 'Educational',
        'NETWORKING': 'Networking',
        'WORKSHOP': 'Workshop',
        'CONFERENCE': 'Conference',
        'CHARITY': 'Charity',
        'RELIGIOUS': 'Religious',
        'CULTURAL': 'Cultural',
        'OTHERS': 'Others'
      };

      const eventTypes = Object.values(EventType).map(type => ({
        value: type,
        label: labelMap[type] || type.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ')
      }));

      sendSuccess(res, eventTypes, 'Event types retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get communities user can represent when creating events
   * @route GET /v2/events/available-communities
   */
  static async getAvailableCommunitiesForEvents(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;

      const communities = await EventService.getAvailableCommunitiesForEvents(userId);

      const message = communities.length > 0
        ? 'Available communities retrieved successfully'
        : 'You are not an admin or owner of any communities yet';

      sendSuccess(res, {
        communities,
        info: {
          canRepresentCommunity: communities.length > 0,
          message: communities.length > 0
            ? 'You can create events on behalf of these communities. As an admin or owner, you can set the event host type to "Community" to represent your community.'
            : 'You need to be an admin or owner of a community to create events on its behalf. Join or create a community to get started!',
        },
      }, message);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Upload event image
   * @route POST /v2/events/upload-image
   */
  static async uploadEventImage(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const file = req.file;

      if (!file) {
        throw new AppError('No image file provided', 400);
      }

      // Upload to storage
      const { storageService } = await import('../../services/storage.service');
      
      const uploadResult = await storageService.uploadFile(file, 'events', {
        optimize: true,
        isPublic: true,
        userId,
      });

      logger.info('Event image uploaded', {
        userId,
        key: uploadResult.key,
        url: uploadResult.url,
        size: uploadResult.size,
      });

      sendSuccess(res, { imageUrl: uploadResult.url }, 'Event image uploaded successfully');
    } catch (error) {
      next(error);
    }
  }
}
