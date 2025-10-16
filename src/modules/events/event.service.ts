import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error';
import { 
  CreateEventRequest, 
  UpdateEventRequest, 
  EventQuery,
  CreateTicketTierRequest,
  UpdateTicketTierRequest,
  PurchaseTicketRequest,
  CreateRsvpRequest,
  CheckInRequest,
  EventResponse,
  TicketTierResponse,
  TicketResponse,
  RsvpResponse,
  AttendanceRecord,
  EventStatsResponse,
  EventAnalyticsResponse
} from './event.types';
import { EventType, EventStatus, EventHostType, EventTicketStatus, PaymentStatus, Prisma } from '@prisma/client';
import logger from '../../utils/logger';
import crypto from 'crypto';
import QRCode from 'qrcode';

export class EventService {
  
  // ============================================================================
  // EVENT CRUD OPERATIONS
  // ============================================================================
  
  /**
   * Create a new event
   */
  static async createEvent(userId: string, data: CreateEventRequest): Promise<EventResponse> {
    try {
      // Validate community ownership if provided
      if (data.communityId) {
        const membership = await prisma.communityMember.findFirst({
          where: {
            communityId: data.communityId,
            userId: userId,
            role: { in: ['ADMIN', 'MODERATOR', 'OWNER'] },
          },
        });
        
        if (!membership) {
          throw new AppError('You do not have permission to create events for this community', 403);
        }
      }

      const event = await prisma.event.create({
        data: {
          title: data.title,
          description: data.description,
          type: data.type,
          date: new Date(data.date),
          location: data.location,
          mapLink: data.mapLink,
          maxAttendees: data.maxAttendees,
          notes: data.notes,
          hostId: userId,
          communityId: data.communityId,
          images: data.images || [],
          isFree: data.isFree,
          price: data.price,
          currency: data.currency || 'MYR',
          hostType: data.hostType || EventHostType.PERSONAL,
          status: data.status || EventStatus.DRAFT,
        },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              username: true,
              profile: { select: { profilePicture: true } },
            },
          },
          communities: {
            select: {
              id: true,
              name: true,
              imageUrl: true,
            },
          },
          _count: {
            select: {
              eventRsvps: true,
              eventAttendances: true,
              eventTickets: true,
              tier: true,
            },
          },
        },
      });

      return this.transformEventResponse(event);
    } catch (error: any) {
      logger.error('Error creating event:', error);
      throw error;
    }
  }

  /**
   * Get event by ID
   */
  static async getEventById(eventId: string, userId?: string): Promise<EventResponse> {
    try {
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              username: true,
              profile: { select: { profilePicture: true } },
            },
          },
          communities: {
            select: {
              id: true,
              name: true,
              imageUrl: true,
            },
          },
          tier: {
            where: { isActive: true },
            orderBy: { displayOrder: 'asc' },
          },
          _count: {
            select: {
              eventRsvps: true,
              eventAttendances: true,
              eventTickets: true,
              tier: true,
            },
          },
        },
      });

      if (!event) {
        throw new AppError('Event not found', 404);
      }

      // Check if user has RSVP'd or has ticket
      let userRsvp = null;
      let userTicket = null;
      
      if (userId) {
        userRsvp = await prisma.eventRsvp.findFirst({
          where: { eventId, userId },
        });
        
        userTicket = await prisma.eventTicket.findFirst({
          where: { eventId, userId, status: { not: EventTicketStatus.CANCELED } },
        });
      }

      const transformed = this.transformEventResponse(event);
      
      return {
        ...transformed,
        ticketTiers: event.tier ? event.tier.map(tier => this.transformTicketTierResponse(tier)) : [],
        userRsvp: userRsvp || undefined,
        userTicket: userTicket || undefined,
        hasRsvped: !!userRsvp,
        hasTicket: !!userTicket,
      };
    } catch (error: any) {
      logger.error('Error fetching event:', error);
      throw error;
    }
  }

  /**
   * Get all events with filters and pagination
   */
  static async getEvents(query: EventQuery, userId?: string): Promise<{ events: EventResponse[], total: number, page: number, limit: number }> {
    try {
      const page = query.page || 1;
      const limit = query.limit || 20;
      const skip = (page - 1) * limit;
      const sortBy = query.sortBy || 'date';
      const sortOrder = query.sortOrder || 'asc';

      // Build where clause
      const where: Prisma.EventWhereInput = {
        ...(query.filters?.type && { type: query.filters.type }),
        ...(query.filters?.status && { status: query.filters.status }),
        ...(query.filters?.hostType && { hostType: query.filters.hostType }),
        ...(query.filters?.isFree !== undefined && { isFree: query.filters.isFree }),
        ...(query.filters?.communityId && { communityId: query.filters.communityId }),
        ...(query.filters?.hostId && { hostId: query.filters.hostId }),
        ...(query.filters?.location && { 
          location: { 
            contains: query.filters.location, 
            mode: 'insensitive' as Prisma.QueryMode 
          } 
        }),
        ...(query.filters?.startDate && { 
          date: { gte: new Date(query.filters.startDate) } 
        }),
        ...(query.filters?.endDate && { 
          date: { lte: new Date(query.filters.endDate) } 
        }),
        ...(query.filters?.minPrice && { 
          price: { gte: query.filters.minPrice } 
        }),
        ...(query.filters?.maxPrice && { 
          price: { lte: query.filters.maxPrice } 
        }),
        ...(query.filters?.search && {
          OR: [
            { title: { contains: query.filters.search, mode: 'insensitive' as Prisma.QueryMode } },
            { description: { contains: query.filters.search, mode: 'insensitive' as Prisma.QueryMode } },
            { location: { contains: query.filters.search, mode: 'insensitive' as Prisma.QueryMode } },
          ],
        }),
      };

      const [events, total] = await Promise.all([
        prisma.event.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                username: true,
                profile: { select: { profilePicture: true } },
              },
            },
            communities: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
              },
            },
            _count: {
              select: {
                eventRsvps: true,
                eventAttendances: true,
                eventTickets: true,
                tier: true,
              },
            },
          },
        }),
        prisma.event.count({ where }),
      ]);

      const transformedEvents = events.map(event => this.transformEventResponse(event));

      return {
        events: transformedEvents,
        total,
        page,
        limit,
      };
    } catch (error: any) {
      logger.error('Error fetching events:', error);
      throw error;
    }
  }

  /**
   * Update event
   */
  static async updateEvent(eventId: string, userId: string, data: UpdateEventRequest): Promise<EventResponse> {
    try {
      // Check ownership
      const event = await prisma.event.findUnique({
        where: { id: eventId },
      });

      if (!event) {
        throw new AppError('Event not found', 404);
      }

      if (event.hostId !== userId) {
        throw new AppError('You do not have permission to update this event', 403);
      }

      const updatedEvent = await prisma.event.update({
        where: { id: eventId },
        data: {
          ...(data.title && { title: data.title }),
          ...(data.description !== undefined && { description: data.description }),
          ...(data.type && { type: data.type }),
          ...(data.date && { date: new Date(data.date) }),
          ...(data.location && { location: data.location }),
          ...(data.mapLink !== undefined && { mapLink: data.mapLink }),
          ...(data.maxAttendees !== undefined && { maxAttendees: data.maxAttendees }),
          ...(data.notes !== undefined && { notes: data.notes }),
          ...(data.images !== undefined && { images: data.images }),
          ...(data.isFree !== undefined && { isFree: data.isFree }),
          ...(data.price !== undefined && { price: data.price }),
          ...(data.status && { status: data.status }),
        },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              username: true,
              profile: { select: { profilePicture: true } },
            },
          },
          communities: {
            select: {
              id: true,
              name: true,
              imageUrl: true,
            },
          },
          _count: {
            select: {
              eventRsvps: true,
              eventAttendances: true,
              eventTickets: true,
              tier: true,
            },
          },
        },
      });

      return this.transformEventResponse(updatedEvent);
    } catch (error: any) {
      logger.error('Error updating event:', error);
      throw error;
    }
  }

  /**
   * Delete event
   */
  static async deleteEvent(eventId: string, userId: string): Promise<void> {
    try {
      const event = await prisma.event.findUnique({
        where: { id: eventId },
      });

      if (!event) {
        throw new AppError('Event not found', 404);
      }

      if (event.hostId !== userId) {
        throw new AppError('You do not have permission to delete this event', 403);
      }

      // Check if event has tickets sold
      const ticketCount = await prisma.eventTicket.count({
        where: { 
          eventId, 
          status: { in: [EventTicketStatus.CONFIRMED, EventTicketStatus.CHECKED_IN] }
        },
      });

      if (ticketCount > 0) {
        throw new AppError('Cannot delete event with active tickets. Please cancel or refund all tickets first.', 400);
      }

      await prisma.event.delete({
        where: { id: eventId },
      });
    } catch (error: any) {
      logger.error('Error deleting event:', error);
      throw error;
    }
  }

  // ============================================================================
  // TICKET TIER OPERATIONS
  // ============================================================================

  /**
   * Create ticket tier
   */
  static async createTicketTier(userId: string, data: CreateTicketTierRequest): Promise<TicketTierResponse> {
    try {
      // Check event ownership
      const event = await prisma.event.findUnique({
        where: { id: data.eventId },
      });

      if (!event) {
        throw new AppError('Event not found', 404);
      }

      if (event.hostId !== userId) {
        throw new AppError('You do not have permission to create ticket tiers for this event', 403);
      }

      if (event.isFree) {
        throw new AppError('Cannot create ticket tiers for free events', 400);
      }

      const tier = await prisma.eventTicketTier.create({
        data: {
          eventId: data.eventId,
          tierName: data.tierName,
          description: data.description,
          price: data.price,
          currency: data.currency || 'MYR',
          totalQuantity: data.totalQuantity,
          minPurchase: data.minPurchase || 1,
          maxPurchase: data.maxPurchase || 10,
          availableFrom: data.availableFrom ? new Date(data.availableFrom) : undefined,
          availableUntil: data.availableUntil ? new Date(data.availableUntil) : undefined,
          displayOrder: data.displayOrder || 0,
        },
      });

      return this.transformTicketTierResponse(tier);
    } catch (error: any) {
      logger.error('Error creating ticket tier:', error);
      throw error;
    }
  }

  /**
   * Get ticket tiers for an event
   */
  static async getTicketTiers(eventId: string): Promise<TicketTierResponse[]> {
    try {
      const tiers = await prisma.eventTicketTier.findMany({
        where: { eventId, isActive: true },
        orderBy: { displayOrder: 'asc' },
      });

      return tiers.map(tier => this.transformTicketTierResponse(tier));
    } catch (error: any) {
      logger.error('Error fetching ticket tiers:', error);
      throw error;
    }
  }

  /**
   * Update ticket tier
   */
  static async updateTicketTier(tierId: string, userId: string, data: UpdateTicketTierRequest): Promise<TicketTierResponse> {
    try {
      const tier = await prisma.eventTicketTier.findUnique({
        where: { id: tierId },
        include: { events: true },
      });

      if (!tier) {
        throw new AppError('Ticket tier not found', 404);
      }

      if (tier.events.hostId !== userId) {
        throw new AppError('You do not have permission to update this ticket tier', 403);
      }

      const updatedTier = await prisma.eventTicketTier.update({
        where: { id: tierId },
        data: {
          ...(data.tierName && { tierName: data.tierName }),
          ...(data.description !== undefined && { description: data.description }),
          ...(data.price !== undefined && { price: data.price }),
          ...(data.currency && { currency: data.currency }),
          ...(data.totalQuantity !== undefined && { totalQuantity: data.totalQuantity }),
          ...(data.minPurchase !== undefined && { minPurchase: data.minPurchase }),
          ...(data.maxPurchase !== undefined && { maxPurchase: data.maxPurchase }),
          ...(data.availableFrom !== undefined && { 
            availableFrom: data.availableFrom ? new Date(data.availableFrom) : null 
          }),
          ...(data.availableUntil !== undefined && { 
            availableUntil: data.availableUntil ? new Date(data.availableUntil) : null 
          }),
          ...(data.displayOrder !== undefined && { displayOrder: data.displayOrder }),
          ...(data.isActive !== undefined && { isActive: data.isActive }),
        },
      });

      return this.transformTicketTierResponse(updatedTier);
    } catch (error: any) {
      logger.error('Error updating ticket tier:', error);
      throw error;
    }
  }

  // ============================================================================
  // TICKET PURCHASE OPERATIONS
  // ============================================================================

  /**
   * Purchase ticket (simplified - actual payment integration needed)
   */
  static async purchaseTicket(userId: string, data: PurchaseTicketRequest): Promise<TicketResponse> {
    try {
      const event = await prisma.event.findUnique({
        where: { id: data.eventId },
        include: { tier: true },
      });

      if (!event) {
        throw new AppError('Event not found', 404);
      }

      if (event.status !== EventStatus.PUBLISHED) {
        throw new AppError('Event is not available for ticket purchase', 400);
      }

      if (event.isFree) {
        throw new AppError('This is a free event. Please RSVP instead.', 400);
      }

      // Check if event date has passed
      if (new Date(event.date) < new Date()) {
        throw new AppError('Cannot purchase tickets for past events', 400);
      }

      let price = event.price || 0;
      let tier = null;

      // If ticket tier specified, validate and get tier price
      if (data.ticketTierId) {
        tier = await prisma.eventTicketTier.findUnique({
          where: { id: data.ticketTierId },
        });

        if (!tier || !tier.isActive) {
          throw new AppError('Ticket tier not found or inactive', 404);
        }

        if (tier.eventId !== data.eventId) {
          throw new AppError('Ticket tier does not belong to this event', 400);
        }

        // Check availability
        if (tier.totalQuantity && tier.soldQuantity >= tier.totalQuantity) {
          throw new AppError('This ticket tier is sold out', 400);
        }

        price = tier.price;
      }

      const quantity = data.quantity || 1;
      const totalPrice = price * quantity;
      const ticketNumber = this.generateTicketNumber();

      // Create ticket (PENDING until payment is confirmed)
      const ticket = await prisma.eventTicket.create({
        data: {
          eventId: data.eventId,
          userId: userId,
          ticketTierId: data.ticketTierId,
          ticketType: tier ? tier.tierName : 'GENERAL',
          price: totalPrice,
          currency: event.currency,
          status: EventTicketStatus.PENDING,
          paymentStatus: PaymentStatus.PENDING,
          ticketNumber: ticketNumber,
          quantity: quantity,
          attendeeName: data.attendeeName,
          attendeeEmail: data.attendeeEmail,
          attendeePhone: data.attendeePhone,
        },
        include: {
          events: {
            select: {
              id: true,
              title: true,
              date: true,
              location: true,
            },
          },
          tier: true,
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
      });

      // Update tier sold quantity if applicable
      if (data.ticketTierId) {
        await prisma.eventTicketTier.update({
          where: { id: data.ticketTierId },
          data: { soldQuantity: { increment: quantity } },
        });
      }

      // Update event tickets sold
      await prisma.event.update({
        where: { id: data.eventId },
        data: { ticketsSold: { increment: quantity } },
      });

      return ticket as any;
    } catch (error: any) {
      logger.error('Error purchasing ticket:', error);
      throw error;
    }
  }

  /**
   * Get user's tickets
   */
  static async getUserTickets(userId: string, eventId?: string): Promise<TicketResponse[]> {
    try {
      const tickets = await prisma.eventTicket.findMany({
        where: {
          userId,
          ...(eventId && { eventId }),
        },
        include: {
          events: {
            select: {
              id: true,
              title: true,
              date: true,
              location: true,
              images: true,
            },
          },
          tier: true,
        },
        orderBy: { purchasedAt: 'desc' },
      });

      return tickets as any[];
    } catch (error: any) {
      logger.error('Error fetching user tickets:', error);
      throw error;
    }
  }

  // ============================================================================
  // RSVP OPERATIONS
  // ============================================================================

  /**
   * Create RSVP
   */
  static async createRsvp(userId: string, eventId: string): Promise<RsvpResponse> {
    try {
      const event = await prisma.event.findUnique({
        where: { id: eventId },
      });

      if (!event) {
        throw new AppError('Event not found', 404);
      }

      if (!event.isFree) {
        throw new AppError('This is a paid event. Please purchase a ticket instead.', 400);
      }

      if (event.status !== EventStatus.PUBLISHED) {
        throw new AppError('Event is not available for RSVP', 400);
      }

      // Check if already RSVP'd
      const existingRsvp = await prisma.eventRsvp.findFirst({
        where: { eventId, userId },
      });

      if (existingRsvp) {
        throw new AppError('You have already RSVP\'d to this event', 400);
      }

      // Check max attendees
      if (event.maxAttendees) {
        const rsvpCount = await prisma.eventRsvp.count({
          where: { eventId },
        });

        if (rsvpCount >= event.maxAttendees) {
          throw new AppError('Event has reached maximum capacity', 400);
        }
      }

      // Generate QR code
      const qrData = `${eventId}:${userId}:${Date.now()}`;
      const qrCodeImage = await QRCode.toDataURL(qrData);

      const rsvp = await prisma.eventRsvp.create({
        data: {
          eventId,
          userId,
          qrCode: qrCodeImage,
        },
        include: {
          events: {
            select: {
              id: true,
              title: true,
              date: true,
              location: true,
            },
          },
        },
      });

      return rsvp as any;
    } catch (error: any) {
      logger.error('Error creating RSVP:', error);
      throw error;
    }
  }

  /**
   * Cancel RSVP
   */
  static async cancelRsvp(userId: string, eventId: string): Promise<void> {
    try {
      const rsvp = await prisma.eventRsvp.findFirst({
        where: { eventId, userId },
      });

      if (!rsvp) {
        throw new AppError('RSVP not found', 404);
      }

      await prisma.eventRsvp.delete({
        where: { id: rsvp.id },
      });
    } catch (error: any) {
      logger.error('Error canceling RSVP:', error);
      throw error;
    }
  }

  /**
   * Get user's RSVPs
   */
  static async getUserRsvps(userId: string): Promise<RsvpResponse[]> {
    try {
      const rsvps = await prisma.eventRsvp.findMany({
        where: { userId },
        include: {
          events: {
            select: {
              id: true,
              title: true,
              date: true,
              location: true,
              images: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return rsvps as any[];
    } catch (error: any) {
      logger.error('Error fetching user RSVPs:', error);
      throw error;
    }
  }

  // ============================================================================
  // ATTENDANCE OPERATIONS
  // ============================================================================

  /**
   * Check-in attendee
   */
  static async checkInAttendee(eventId: string, data: CheckInRequest): Promise<AttendanceRecord> {
    try {
      const event = await prisma.event.findUnique({
        where: { id: eventId },
      });

      if (!event) {
        throw new AppError('Event not found', 404);
      }

      let targetUserId: string;

      // Verify user has RSVP or ticket
      if (data.userId) {
        targetUserId = data.userId;
      } else if (data.qrCode) {
        // Parse QR code to get user ID
        const rsvp = await prisma.eventRsvp.findFirst({
          where: { eventId, qrCode: data.qrCode },
        });

        if (!rsvp) {
          throw new AppError('Invalid QR code or RSVP not found', 404);
        }

        targetUserId = rsvp.userId;
      } else {
        throw new AppError('User ID or QR code is required', 400);
      }

      // Check if already checked in
      const existingAttendance = await prisma.eventAttendance.findFirst({
        where: { eventId, userId: targetUserId },
      });

      if (existingAttendance) {
        throw new AppError('User has already checked in', 400);
      }

      const attendance = await prisma.eventAttendance.create({
        data: {
          eventId,
          userId: targetUserId,
        },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              profile: { select: { profilePicture: true } },
            },
          },
        },
      });

      return attendance as any;
    } catch (error: any) {
      logger.error('Error checking in attendee:', error);
      throw error;
    }
  }

  /**
   * Get event attendees
   */
  static async getEventAttendees(eventId: string): Promise<AttendanceRecord[]> {
    try {
      const attendees = await prisma.eventAttendance.findMany({
        where: { eventId },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              profile: { select: { profilePicture: true } },
            },
          },
        },
        orderBy: { checkedInAt: 'desc' },
      });

      return attendees as any[];
    } catch (error: any) {
      logger.error('Error fetching attendees:', error);
      throw error;
    }
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private static transformEventResponse(event: any): EventResponse {
    return {
      id: event.id,
      title: event.title,
      description: event.description,
      type: event.type,
      date: event.date,
      location: event.location,
      mapLink: event.mapLink,
      maxAttendees: event.maxAttendees,
      notes: event.notes,
      hostId: event.hostId,
      communityId: event.communityId,
      hostType: event.hostType,
      images: event.images,
      isFree: event.isFree,
      price: event.price,
      currency: event.currency,
      status: event.status,
      ticketsSold: event.ticketsSold,
      totalRevenue: event.totalRevenue,
      organizerPayout: event.organizerPayout,
      platformFee: event.platformFee,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
      host: event.user,
      community: event.communities,
      _count: event._count,
    };
  }

  private static transformTicketTierResponse(tier: any): TicketTierResponse {
    const availableQuantity = tier.totalQuantity 
      ? Math.max(0, tier.totalQuantity - tier.soldQuantity)
      : undefined;
    
    const now = new Date();
    const isAvailable = tier.isActive &&
      (!tier.availableFrom || new Date(tier.availableFrom) <= now) &&
      (!tier.availableUntil || new Date(tier.availableUntil) >= now) &&
      (availableQuantity === undefined || availableQuantity > 0);

    return {
      ...tier,
      availableQuantity,
      isAvailable,
    };
  }

  private static generateTicketNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `TKT-${timestamp}-${random}`;
  }
}
