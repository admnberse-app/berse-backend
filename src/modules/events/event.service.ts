import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error';
import jwt from 'jsonwebtoken';
import { config } from '../../config';
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
import { cacheService, CacheKeys, CacheTTL } from '../../services/cache.service';
import { NotificationService } from '../../services/notification.service';

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

      // Invalidate relevant caches
      await Promise.all([
        cacheService.deletePattern('bersemuka:events:trending:*'),
        cacheService.deletePattern('bersemuka:events:recommended:*'),
        cacheService.deletePattern(`bersemuka:events:host:${userId}:*`),
        data.communityId ? cacheService.deletePattern('bersemuka:events:community:*') : Promise.resolve(),
      ]);
      logger.debug('Cache invalidated after event creation');

      // Notify connections/community members about new event (only if published)
      if (event.status === EventStatus.PUBLISHED) {
        // Get connections or community members
        let notificationUserIds: string[] = [];
        
        if (data.communityId) {
          // Notify community members
          const members = await prisma.communityMember.findMany({
            where: {
              communityId: data.communityId,
              userId: { not: userId },
            },
            select: { userId: true },
            take: 100, // Limit to avoid sending too many notifications
          });
          notificationUserIds = members.map(m => m.userId);
        } else {
          // Notify connections
          const connections = await prisma.userConnection.findMany({
            where: {
              OR: [
                { initiatorId: userId, status: 'ACCEPTED' },
                { receiverId: userId, status: 'ACCEPTED' },
              ],
            },
            select: { initiatorId: true, receiverId: true },
            take: 50, // Limit to avoid spam
          });
          
          notificationUserIds = connections.map(c => 
            c.initiatorId === userId ? c.receiverId : c.initiatorId
          );
        }

        // Send notifications in background (don't await)
        if (notificationUserIds.length > 0) {
          const hostName = event.user.fullName || event.user.username || 'Someone';
          NotificationService.createBulkNotifications(notificationUserIds, {
            type: 'EVENT',
            title: 'New Event',
            message: `${hostName} created: ${event.title}`,
            actionUrl: `/events/${event.id}`,
            priority: 'low',
            relatedEntityId: event.id,
            relatedEntityType: 'event_created',
            metadata: {
              eventId: event.id,
              hostId: userId,
              eventTitle: event.title,
            },
          }).catch(err => logger.error('Failed to send event creation notifications:', err));
        }
      }

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

      // Generate secure token for RSVP (valid for 30 days or until event date)
      const eventDate = new Date(event.date);
      const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const tokenExpiry = eventDate > thirtyDaysFromNow ? eventDate : thirtyDaysFromNow;
      
      const rsvpToken = crypto.randomBytes(32).toString('hex');

      const rsvp = await prisma.eventRsvp.create({
        data: {
          eventId,
          userId,
          qrCode: rsvpToken, // Store secure token, not QR image
        },
        include: {
          events: {
            select: {
              id: true,
              title: true,
              date: true,
              location: true,
              hostId: true,
            },
          },
          user: {
            select: {
              fullName: true,
              username: true,
            },
          },
        },
      });

      // Send notification to event host
      const userName = rsvp.user?.fullName || rsvp.user?.username || 'Someone';
      await NotificationService.createNotification({
        userId: rsvp.events.hostId,
        type: 'EVENT',
        title: 'New Event RSVP',
        message: `${userName} RSVP'd to your event: ${rsvp.events.title}`,
        actionUrl: `/events/${eventId}/attendees`,
        priority: 'normal',
        relatedEntityId: eventId,
        relatedEntityType: 'event_rsvp',
        metadata: {
          eventId,
          userId,
          eventTitle: rsvp.events.title,
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
   * Generate QR code for RSVP (on-demand)
   */
  static async generateRsvpQrCode(rsvpId: string, userId: string): Promise<string> {
    try {
      const rsvp = await prisma.eventRsvp.findUnique({
        where: { id: rsvpId },
        include: {
          events: {
            select: {
              id: true,
              date: true,
            },
          },
        },
      });

      if (!rsvp) {
        throw new AppError('RSVP not found', 404);
      }

      if (rsvp.userId !== userId) {
        throw new AppError('Not authorized to access this RSVP', 403);
      }

      // Generate signed JWT token for QR code
      const eventDate = new Date(rsvp.events.date);
      const expiryDate = new Date(Math.max(
        eventDate.getTime() + (24 * 60 * 60 * 1000), // 24 hours after event
        Date.now() + (30 * 24 * 60 * 60 * 1000) // or 30 days from now
      ));

      const qrPayload = {
        rsvpId: rsvp.id,
        userId: rsvp.userId,
        eventId: rsvp.eventId,
        token: rsvp.qrCode, // Include stored token for extra validation
        type: 'EVENT_RSVP',
      };

      // Generate JWT token with expiry
      const qrToken = jwt.sign(
        qrPayload,
        config.jwt.secret,
        {
          expiresIn: Math.floor((expiryDate.getTime() - Date.now()) / 1000),
          issuer: 'bersemuka-api',
          audience: 'bersemuka-checkin',
        }
      );
      
      // Generate QR code image from JWT token
      const qrCodeDataUrl = await QRCode.toDataURL(qrToken, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        width: 300,
        margin: 2,
      });

      return qrCodeDataUrl;
    } catch (error: any) {
      logger.error('Error generating RSVP QR code:', error);
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
      let rsvpId: string | undefined;

      // Verify user has RSVP or ticket
      if (data.userId) {
        targetUserId = data.userId;
      } else if (data.qrCode) {
        // Verify and decode JWT token from QR code
        try {
          const decoded = jwt.verify(
            data.qrCode,
            config.jwt.secret,
            {
              issuer: 'bersemuka-api',
              audience: 'bersemuka-checkin',
            }
          ) as any;
          
          // Validate token type and event match
          if (decoded.type !== 'EVENT_RSVP') {
            throw new AppError('Invalid QR code type', 400);
          }
          
          if (decoded.eventId !== eventId) {
            throw new AppError('QR code is not for this event', 400);
          }

          // Verify RSVP exists and token matches
          const rsvp = await prisma.eventRsvp.findFirst({
            where: {
              id: decoded.rsvpId,
              userId: decoded.userId,
              eventId: eventId,
              qrCode: decoded.token, // Verify stored token matches
            },
          });

          if (!rsvp) {
            throw new AppError('Invalid or expired RSVP', 404);
          }

          targetUserId = rsvp.userId;
          rsvpId = rsvp.id;
        } catch (error: any) {
          if (error instanceof AppError) throw error;
          logger.error('QR code verification failed:', error);
          throw new AppError('Invalid or expired QR code', 400);
        }
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

      // Trigger trust score update after event check-in
      try {
        const { TrustScoreService } = await import('../connections/trust/trust-score.service');
        await TrustScoreService.triggerTrustScoreUpdate(
          targetUserId,
          `Event attendance: ${event.title}`
        );
        logger.info(`Trust score update triggered for user ${targetUserId} after event check-in`);
      } catch (error) {
        // Non-critical error - log but don't fail the check-in
        logger.error('Failed to trigger trust score update after event check-in:', error);
      }

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

  // ============================================================================
  // DISCOVERY & RECOMMENDATION OPERATIONS
  // ============================================================================

  /**
   * Get trending events (most popular based on RSVPs, tickets, and recency)
   * Cached for 15 minutes for better performance
   */
  static async getTrendingEvents(limit: number = 10, userId?: string): Promise<EventResponse[]> {
    try {
      // Try cache first
      const cacheKey = CacheKeys.trendingEvents(limit);
      const cached = await cacheService.get<EventResponse[]>(cacheKey);
      if (cached) {
        logger.debug(`Cache hit: trending events (limit=${limit})`);
        return cached;
      }

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const events = await prisma.event.findMany({
        where: {
          status: EventStatus.PUBLISHED,
          date: { gte: new Date() }, // Future events only
        },
        take: limit * 2, // Get more to filter and rank
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

      // Calculate trending score
      const scoredEvents = events.map(event => {
        const rsvpCount = event._count?.eventRsvps || 0;
        const ticketCount = event._count?.eventTickets || 0;
        const totalEngagement = rsvpCount + ticketCount;

        // Recency bonus (events created in last 7 days get boost)
        const recencyBonus = event.createdAt > sevenDaysAgo ? 1.5 : 1;

        // Capacity fill rate bonus
        const capacityBonus = event.maxAttendees 
          ? (totalEngagement / event.maxAttendees) * 0.5 
          : 0.5;

        // Trending score formula
        const trendingScore = (totalEngagement * recencyBonus) + (capacityBonus * 10);

        return {
          event,
          score: trendingScore,
        };
      });

      // Sort by score and take top N
      const topEvents = scoredEvents
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(item => this.transformEventResponse(item.event));

      // Cache the results
      await cacheService.set(cacheKey, topEvents, { ttl: CacheTTL.TRENDING });
      logger.debug(`Cache set: trending events (limit=${limit})`);

      return topEvents;
    } catch (error: any) {
      logger.error('Error fetching trending events:', error);
      throw error;
    }
  }

  /**
   * Get nearby events based on user location
   * PERFORMANCE NOTE: Current implementation uses text matching
   * TODO: Implement PostGIS for true geospatial queries with distance calculations
   * Recommended: Add latitude/longitude columns + GiST index for ST_DWithin queries
   */
  static async getNearbyEvents(
    latitude: number,
    longitude: number,
    radiusKm: number = 50,
    limit: number = 20,
    userId?: string
  ): Promise<EventResponse[]> {
    try {
      // Optimized: Limit initial query size
      // Index hint: Composite index on (status, date)
      const events = await prisma.event.findMany({
        where: {
          status: EventStatus.PUBLISHED,
          date: { gte: new Date() },
        },
        take: limit * 2, // Fetch 2x for filtering buffer
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

      // Filter by location matching (simple text search for now)
      // TODO: Implement proper geospatial search with coordinates
      const nearbyEvents = events
        .map(event => {
          // Calculate simple relevance score based on location text match
          const locationLower = event.location.toLowerCase();
          const searchTerms = [
            'kuala lumpur', 'kl', 'selangor', 'penang', 'johor', 
            'malaysia', 'singapore', 'petaling jaya', 'pj'
          ];
          
          const hasLocationMatch = searchTerms.some(term => locationLower.includes(term));
          
          return {
            event,
            isNearby: hasLocationMatch,
          };
        })
        .filter(item => item.isNearby)
        .slice(0, limit)
        .map(item => this.transformEventResponse(item.event));

      return nearbyEvents;
    } catch (error: any) {
      logger.error('Error fetching nearby events:', error);
      throw error;
    }
  }

  /**
   * Get recommended events based on user preferences and history
   * Optimized: Parallel queries, select only needed fields
   * Cached for 1 hour per user
   */
  static async getRecommendedEvents(userId: string, limit: number = 10): Promise<EventResponse[]> {
    try {
      // Try cache first
      const cacheKey = CacheKeys.recommendedEvents(userId, limit);
      const cached = await cacheService.get<EventResponse[]>(cacheKey);
      if (cached) {
        logger.debug(`Cache hit: recommended events (userId=${userId}, limit=${limit})`);
        return cached;
      }

      // Optimized: Fetch only event types, not full events
      const [userRsvps, userTickets, userCommunities] = await Promise.all([
        prisma.eventRsvp.findMany({
          where: { userId },
          select: { events: { select: { type: true } } },
          take: 20,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.eventTicket.findMany({
          where: { userId },
          select: { events: { select: { type: true } } },
          take: 20,
          orderBy: { purchasedAt: 'desc' },
        }),
        prisma.communityMember.findMany({
          where: { userId },
          select: { communityId: true },
        }),
      ]);

      // Extract event types user has attended
      const attendedEventTypes = [
        ...userRsvps.map(r => r.events.type),
        ...userTickets.map(t => t.events.type),
      ];

      const preferredTypes = [...new Set(attendedEventTypes)];
      const communityIds = userCommunities.map(m => m.communityId);

      // Build recommendation query
      const where: any = {
        status: EventStatus.PUBLISHED,
        date: { gte: new Date() },
        hostId: { not: userId }, // Don't recommend own events
        OR: [
          // Events of preferred types
          ...(preferredTypes.length > 0 ? [{ type: { in: preferredTypes } }] : []),
          // Events in user's communities
          ...(communityIds.length > 0 ? [{ communityId: { in: communityIds } }] : []),
          // Free events (always relevant)
          { isFree: true },
        ],
      };

      const recommendedEvents = await prisma.event.findMany({
        where,
        take: limit,
        orderBy: [
          { date: 'asc' }, // Prioritize upcoming events
          { createdAt: 'desc' }, // Then newer events
        ],
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

      const results = recommendedEvents.map(event => this.transformEventResponse(event));

      // Cache the results
      await cacheService.set(cacheKey, results, { ttl: CacheTTL.RECOMMENDED });
      logger.debug(`Cache set: recommended events (userId=${userId}, limit=${limit})`);

      return results;
    } catch (error: any) {
      logger.error('Error fetching recommended events:', error);
      throw error;
    }
  }

  /**
   * Get events by host (user's created events)
   */
  static async getEventsByHost(hostId: string, limit: number = 20): Promise<EventResponse[]> {
    try {
      const events = await prisma.event.findMany({
        where: { hostId },
        take: limit,
        orderBy: { date: 'desc' },
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

      return events.map(event => this.transformEventResponse(event));
    } catch (error: any) {
      logger.error('Error fetching events by host:', error);
      throw error;
    }
  }

  /**
   * Get popular events in user's communities
   * Optimized: Single query with community check
   */
  static async getCommunityEvents(userId: string, limit: number = 20): Promise<EventResponse[]> {
    try {
      // Optimized: Single query with community membership check
      const events = await prisma.event.findMany({
        where: {
          communities: {
            communityMembers: {
              some: { userId },
            },
          },
          status: EventStatus.PUBLISHED,
          date: { gte: new Date() },
        },
        take: limit,
        orderBy: { date: 'asc' },
        select: {
          id: true,
          title: true,
          description: true,
          type: true,
          date: true,
          location: true,
          mapLink: true,
          maxAttendees: true,
          notes: true,
          images: true,
          isFree: true,
          price: true,
          currency: true,
          status: true,
          hostType: true,
          hostId: true,
          communityId: true,
          createdAt: true,
          updatedAt: true,
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

      return events.map(event => this.transformEventResponse(event));
    } catch (error: any) {
      logger.error('Error fetching community events:', error);
      throw error;
    }
  }

  /**
   * Get events a user has attended (for profile viewing)
   * Optimized with single query and date range filter
   */
  static async getUserAttendedEvents(
    userId: string,
    limit: number = 20,
    startDate?: Date,
    endDate?: Date
  ): Promise<EventResponse[]> {
    try {
      // Default to last 6 months if no range specified
      const defaultStartDate = new Date();
      defaultStartDate.setMonth(defaultStartDate.getMonth() - 6);

      const dateFilter: any = {};
      if (startDate || endDate) {
        if (startDate) dateFilter.gte = startDate;
        if (endDate) dateFilter.lte = endDate;
      } else {
        // Default: show events from last 6 months
        dateFilter.gte = defaultStartDate;
      }

      // Optimized: Single query joining attendances
      const events = await prisma.event.findMany({
        where: {
          eventAttendances: {
            some: { userId },
          },
          ...(Object.keys(dateFilter).length > 0 && { date: dateFilter }),
        },
        take: limit,
        orderBy: { date: 'desc' },
        select: {
          id: true,
          title: true,
          description: true,
          type: true,
          date: true,
          location: true,
          mapLink: true,
          maxAttendees: true,
          notes: true,
          images: true,
          isFree: true,
          price: true,
          currency: true,
          status: true,
          hostType: true,
          hostId: true,
          communityId: true,
          createdAt: true,
          updatedAt: true,
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
          eventAttendances: {
            where: { userId },
            select: {
              checkedInAt: true,
            },
            take: 1,
          },
        },
      });

      return events.map(event => {
        const transformed = this.transformEventResponse(event);
        // Add check-in timestamp to response
        if (event.eventAttendances.length > 0) {
          (transformed as any).checkedInAt = event.eventAttendances[0].checkedInAt;
        }
        return transformed;
      });
    } catch (error: any) {
      logger.error('Error fetching user attended events:', error);
      throw error;
    }
  }

  // ============================================================================
  // CALENDAR ENDPOINTS
  // ============================================================================

  /**
   * Get events happening today
   * Returns all published events for the current date with sorting and filters
   */
  static async getTodayEvents(
    type?: EventType,
    sortBy: 'date' | 'title' | 'popularity' = 'date',
    sortOrder: 'asc' | 'desc' = 'asc',
    timezone: string = 'UTC'
  ): Promise<EventResponse[]> {
    try {
      // Get start and end of today in the specified timezone
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0));
      const endOfDay = new Date(today.setHours(23, 59, 59, 999));

      const where: Prisma.EventWhereInput = {
        status: EventStatus.PUBLISHED,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      };

      if (type) {
        where.type = type;
      }

      // Build order by clause
      let orderBy: any = {};
      if (sortBy === 'popularity') {
        // We'll sort by engagement after fetching
        orderBy = { date: sortOrder };
      } else {
        orderBy = { [sortBy]: sortOrder };
      }

      const events = await prisma.event.findMany({
        where,
        orderBy,
        select: {
          id: true,
          title: true,
          description: true,
          type: true,
          date: true,
          location: true,
          mapLink: true,
          maxAttendees: true,
          notes: true,
          images: true,
          isFree: true,
          price: true,
          currency: true,
          status: true,
          hostType: true,
          hostId: true,
          communityId: true,
          createdAt: true,
          updatedAt: true,
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

      let transformed = events.map(event => this.transformEventResponse(event));

      // Sort by popularity if requested
      if (sortBy === 'popularity') {
        transformed.sort((a: any, b: any) => {
          const aEngagement = (a.rsvpCount || 0) + (a.attendanceCount || 0);
          const bEngagement = (b.rsvpCount || 0) + (b.attendanceCount || 0);
          return sortOrder === 'asc' ? aEngagement - bEngagement : bEngagement - aEngagement;
        });
      }

      return transformed;
    } catch (error: any) {
      logger.error('Error fetching today events:', error);
      throw error;
    }
  }

  /**
   * Get events for the next 7 days, grouped by date
   * Returns events grouped by date with day names
   */
  static async getWeekSchedule(
    type?: EventType,
    timezone: string = 'UTC'
  ): Promise<{
    [date: string]: {
      dayName: string;
      dayOfWeek: number;
      date: string;
      events: EventResponse[];
    };
  }> {
    try {
      const today = new Date();
      const startOfToday = new Date(today.setHours(0, 0, 0, 0));
      const endOfWeek = new Date(startOfToday);
      endOfWeek.setDate(endOfWeek.getDate() + 7);

      const where: Prisma.EventWhereInput = {
        status: EventStatus.PUBLISHED,
        date: {
          gte: startOfToday,
          lt: endOfWeek,
        },
      };

      if (type) {
        where.type = type;
      }

      const events = await prisma.event.findMany({
        where,
        orderBy: { date: 'asc' },
        select: {
          id: true,
          title: true,
          description: true,
          type: true,
          date: true,
          location: true,
          mapLink: true,
          maxAttendees: true,
          notes: true,
          images: true,
          isFree: true,
          price: true,
          currency: true,
          status: true,
          hostType: true,
          hostId: true,
          communityId: true,
          createdAt: true,
          updatedAt: true,
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

      // Group events by date
      const groupedEvents: {
        [date: string]: {
          dayName: string;
          dayOfWeek: number;
          date: string;
          events: EventResponse[];
        };
      } = {};

      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

      events.forEach(event => {
        const eventDate = new Date(event.date);
        const dateKey = eventDate.toISOString().split('T')[0]; // YYYY-MM-DD
        
        if (!groupedEvents[dateKey]) {
          groupedEvents[dateKey] = {
            dayName: dayNames[eventDate.getDay()],
            dayOfWeek: eventDate.getDay(),
            date: dateKey,
            events: [],
          };
        }

        groupedEvents[dateKey].events.push(this.transformEventResponse(event));
      });

      return groupedEvents;
    } catch (error: any) {
      logger.error('Error fetching week schedule:', error);
      throw error;
    }
  }

  /**
   * Get events for a specific month, grouped by date
   */
  static async getMonthEvents(
    year: number,
    month: number,
    type?: EventType,
    timezone: string = 'UTC'
  ): Promise<{ events: any[], eventsByDate: { [date: string]: any[] }, counts: { [date: string]: number }, month: number, year: number, totalEvents: number }> {
    try {
      // Create start and end dates for the month
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);

      const cacheKey = `calendar:month:${year}:${month}:${type || 'all'}`;

      // Check cache first
      const cached = await cacheService.get<any>(cacheKey);
      if (cached) {
        return cached;
      }

      const where: Prisma.EventWhereInput = {
        status: EventStatus.PUBLISHED,
        date: {
          gte: startDate,
          lte: endDate,
        },
      };

      if (type) {
        where.type = type;
      }

      const events = await prisma.event.findMany({
        where,
        select: {
          id: true,
          title: true,
          description: true,
          type: true,
          date: true,
          location: true,
          mapLink: true,
          images: true,
          isFree: true,
          price: true,
          maxAttendees: true,
          ticketsSold: true,
          status: true,
          hostId: true,
          communityId: true,
          user: {
            select: {
              id: true,
              fullName: true,
              username: true,
            },
          },
        },
        orderBy: {
          date: 'asc',
        },
      });

      // Group events by date
      const eventsByDate: { [date: string]: any[] } = {};
      const counts: { [date: string]: number } = {};

      events.forEach(event => {
        const dateKey = new Date(event.date).toISOString().split('T')[0];
        if (!eventsByDate[dateKey]) {
          eventsByDate[dateKey] = [];
        }
        eventsByDate[dateKey].push(event);
        counts[dateKey] = (counts[dateKey] || 0) + 1;
      });

      const result = {
        events,
        eventsByDate,
        counts,
        month: month,
        year: year,
        totalEvents: events.length,
      };

      // Cache for 10 minutes
      await cacheService.set(cacheKey, result, { ttl: CacheTTL.MEDIUM });

      return result;
    } catch (error: any) {
      logger.error('Error fetching month events:', error);
      throw error;
    }
  }

  /**
   * Get event counts for calendar view
   * Returns count of published events per date for performance
   * Results are cached for 15 minutes
   */
  static async getCalendarCounts(
    startDate?: Date,
    endDate?: Date,
    type?: EventType
  ): Promise<{ [date: string]: number }> {
    try {
      // Default to current month if no range specified
      const today = new Date();
      const defaultStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const defaultEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);

      const start = startDate || defaultStart;
      const end = endDate || defaultEnd;

      // Generate cache key
      const cacheKey = `calendar:counts:${start.toISOString()}:${end.toISOString()}:${type || 'all'}`;

      // Check cache first
      const cached = await cacheService.get<{ [date: string]: number }>(cacheKey);
      if (cached) {
        return cached;
      }

      const where: Prisma.EventWhereInput = {
        status: EventStatus.PUBLISHED,
        date: {
          gte: start,
          lte: end,
        },
      };

      if (type) {
        where.type = type;
      }

      // Fetch all events in the range (we need dates to group by)
      const events = await prisma.event.findMany({
        where,
        select: {
          date: true,
        },
      });

      // Count events per date
      const counts: { [date: string]: number } = {};
      
      events.forEach(event => {
        const dateKey = new Date(event.date).toISOString().split('T')[0]; // YYYY-MM-DD
        counts[dateKey] = (counts[dateKey] || 0) + 1;
      });

      // Cache for 15 minutes
      await cacheService.set(cacheKey, counts, { ttl: CacheTTL.MEDIUM });

      return counts;
    } catch (error: any) {
      logger.error('Error fetching calendar counts:', error);
      throw error;
    }
  }
}
