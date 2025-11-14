import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error';
import jwt from 'jsonwebtoken';
import { config } from '../../config';
import { getProfilePictureUrl } from '../../utils/image.helpers';
import { 
  CreateEventRequest, 
  UpdateEventRequest, 
  EventQuery,
  CreateTicketTierRequest,
  UpdateTicketTierRequest,
  PurchaseTicketRequest,
  CreateParticipantRequest,
  CheckInRequest,
  EventResponse,
  TicketTierResponse,
  TicketResponse,
  ParticipantResponse,
  EventStatsResponse,
  EventAnalyticsResponse
} from './event.types';
import { EventType, EventStatus, EventHostType, EventTicketStatus, PaymentStatus, Prisma } from '@prisma/client';
import logger from '../../utils/logger';
import crypto from 'crypto';
import QRCode from 'qrcode';
import { cacheService, CacheKeys, CacheTTL } from '../../services/cache.service';
import { NotificationService } from '../../services/notification.service';
import { ActivityLoggerService } from '../../services/activityLogger.service';
import featureUsageService from '../../services/featureUsage.service';
import { FeatureCode } from '../../types/subscription.types';

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

      // Prevent publishing paid events without ticket tiers
      if (!data.isFree && data.status === EventStatus.PUBLISHED) {
        throw new AppError(
          'Cannot publish a paid event without ticket tiers. Create the event as DRAFT first, then add ticket tiers before publishing.',
          400
        );
      }

      // Determine the event date - use startDate if provided, otherwise use legacy date field
      const eventDate = data.startDate ? new Date(data.startDate) : (data.date ? new Date(data.date) : new Date());

      const event = await prisma.event.create({
        data: {
          title: data.title,
          description: data.description,
          type: data.type,
          date: eventDate, // Use computed date for backward compatibility
          startDate: data.startDate ? new Date(data.startDate) : undefined,
          endDate: data.endDate ? new Date(data.endDate) : undefined,
          startTime: data.startTime,
          endTime: data.endTime,
          location: data.location,
          mapLink: data.mapLink,
          maxAttendees: data.maxAttendees,
          notes: data.notes,
          hostId: userId,
          communityId: data.communityId,
          images: data.images || [],
          isFree: data.isFree,
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
              logoUrl: true,
              coverImageUrl: true,
            },
          },
          _count: {
            select: {
              eventParticipants: true,
              eventTickets: true,
              tier: true,
            },
          },
        },
      });

      // Track feature usage for event creation
      await featureUsageService.recordFeatureUsage({
        userId,
        featureCode: data.isFree ? FeatureCode.CREATE_EVENTS : FeatureCode.CREATE_PAID_EVENTS,
        entityType: 'event',
        entityId: event.id,
        metadata: {
          eventType: event.type,
          isFree: event.isFree,
          status: event.status,
        },
      });

      // Update user stats for events hosted (only if published)
      if (event.status === EventStatus.PUBLISHED) {
        try {
          const { UserStatService } = await import('../user/user-stat.service');
          await UserStatService.incrementEventsHosted(userId);
          logger.info(`Incremented eventsHosted stat for user ${userId}`);
        } catch (error) {
          logger.error('Failed to update user stat for event hosting:', error);
        }
      }

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

          // Send emails to community members (for community events only)
          if (data.communityId) {
            this.sendEventCreationEmails(
              notificationUserIds,
              event.id,
              event.title,
              event.description || '',
              event.date,
              event.location || '',
              hostName,
              event.communities?.name || 'your community'
            ).catch(err => logger.error('Failed to send event creation emails:', err));
          }
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
              logoUrl: true,
              coverImageUrl: true,
            },
          },
          tier: {
            where: { isActive: true },
            orderBy: { displayOrder: 'asc' as const },
          },
          _count: {
            select: {
              eventParticipants: true,
              tier: true,
            },
          },
        },
      });

      if (!event) {
        throw new AppError('Event not found', 404);
      }

      // Check if user has participant record or ticket
      let userParticipant = null;
      let userTicket = null;
      
      if (userId) {
        userParticipant = await prisma.eventParticipant.findFirst({
          where: { eventId, userId },
        });
        
        // Get user's ticket (including PENDING tickets)
        userTicket = await prisma.eventTicket.findFirst({
          where: { 
            eventId, 
            userId, 
            status: { not: EventTicketStatus.CANCELED },
            // Include all payment statuses (PENDING, PAID, FAILED, etc.)
          },
        });
      }

      // Get participant preview (first 5 checked-in participants)
      const participants = await prisma.eventParticipant.findMany({
        where: { eventId, checkedInAt: { not: null } },
        take: 5,
        orderBy: { checkedInAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              username: true,
              profile: {
                select: {
                  profilePicture: true,
                },
              },
            },
          },
        },
      });

      // Get all participants preview (first 5)
      const allParticipants = await prisma.eventParticipant.findMany({
        where: { eventId },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              username: true,
              profile: {
                select: {
                  profilePicture: true,
                },
              },
            },
          },
        },
      });

      const transformed = this.transformEventResponse(event);
      
      const checkedInCount = await prisma.eventParticipant.count({
        where: { eventId, checkedInAt: { not: null } },
      });

      // Count unique users with tickets (not canceled)
      const uniqueTicketHolders = await prisma.eventTicket.groupBy({
        by: ['userId'],
        where: {
          eventId,
          status: { not: EventTicketStatus.CANCELED },
        },
      });

      return {
        ...transformed,
        ticketTiers: event.tier ? event.tier.map(tier => this.transformTicketTierResponse(tier)) : [],
        userParticipant: userParticipant || undefined,
        userTicket: userTicket || undefined,
        hasTicket: !!userTicket,
        isOwner: userId ? event.hostId === userId : false,
        attendeesPreview: participants.map(p => ({
          id: p.user.id,
          fullName: p.user.fullName,
          username: p.user.username,
          profilePicture: getProfilePictureUrl(p.user.profile?.profilePicture),
          checkedInAt: p.checkedInAt!,
        })),
        participantsPreview: allParticipants.map(p => ({
          id: p.user.id,
          fullName: p.user.fullName,
          username: p.user.username,
          profilePicture: getProfilePictureUrl(p.user.profile?.profilePicture),
          createdAt: p.createdAt,
          status: p.status,
        })),
        stats: {
          totalParticipants: event._count.eventParticipants,
          totalCheckedIn: checkedInCount,
          totalTicketsSold: uniqueTicketHolders.length,
          totalTicketTiers: event._count.tier,
          attendanceRate: event._count.eventParticipants > 0 
            ? Math.round((checkedInCount / event._count.eventParticipants) * 100) 
            : 0,
        },
      };
    } catch (error: any) {
      logger.error('Error fetching event:', error);
      throw error;
    }
  }

  /**
   * Get all events with filters and pagination
   */
  static async getEvents(query: EventQuery, userId?: string): Promise<{ events: EventResponse[], total: number, page: number, limit: number, isFallback?: boolean }> {
    try {
      const page = query.page || 1;
      const limit = query.limit || 20;
      const skip = (page - 1) * limit;
      const sortBy = query.sortBy || 'date';
      const sortOrder = query.sortOrder || 'asc';

      // Build where clause
      const where: Prisma.EventWhereInput = {
        date: { gte: new Date() }, // Only show upcoming events
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
        // Price filtering via ticket tiers
        ...(query.filters?.minPrice && {
          tier: {
            some: {
              price: { gte: query.filters.minPrice },
              isActive: true
            }
          }
        }),
        ...(query.filters?.maxPrice && {
          tier: {
            some: {
              price: { lte: query.filters.maxPrice },
              isActive: true
            }
          }
        }),
        ...(query.filters?.search && {
          OR: [
            { title: { contains: query.filters.search, mode: 'insensitive' as Prisma.QueryMode } },
            { description: { contains: query.filters.search, mode: 'insensitive' as Prisma.QueryMode } },
            { location: { contains: query.filters.search, mode: 'insensitive' as Prisma.QueryMode } },
          ],
        }),
      };

      const eventInclude = {
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
            logoUrl: true,
            coverImageUrl: true,
          },
        },
        tier: {
          where: { isActive: true },
          select: {
            id: true,
            tierName: true,
            description: true,
            price: true,
            currency: true,
            totalQuantity: true,
            soldQuantity: true,
            minPurchase: true,
            maxPurchase: true,
            availableFrom: true,
            availableUntil: true,
            displayOrder: true,
            isActive: true,
          },
          orderBy: { displayOrder: 'asc' as const },
        },
        _count: {
          select: {
            eventParticipants: true,
            tier: true,
          },
        },
        eventTickets: {
          where: {
            status: { not: EventTicketStatus.CANCELED },
          },
          select: {
            userId: true,
          },
        },
      };

      const [events, total] = await Promise.all([
        prisma.event.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
          include: eventInclude,
        }),
        prisma.event.count({ where }),
      ]);

      // Transform events and add unique ticket count
      let transformedEvents = events.map(event => {
        const transformed = this.transformEventResponse(event);
        // Count unique ticket holders (users)
        if (transformed._count && event.eventTickets) {
          const uniqueUsers = new Set(event.eventTickets.map((t: any) => t.userId));
          transformed._count.eventTickets = uniqueUsers.size;
        }
        return transformed;
      });
      let isFallback = false;

      // If no events found and filters were applied, return fallback events
      if (transformedEvents.length === 0 && query.filters && Object.keys(query.filters).length > 0) {
        logger.info('No events found with filters, fetching fallback events');
        
        // Fetch any upcoming published events as fallback (no filter preservation)
        const fallbackEvents = await prisma.event.findMany({
          where: {
            status: 'PUBLISHED',
            date: { gte: new Date() },
          },
          take: limit,
          orderBy: { date: 'asc' },
          include: eventInclude,
        });

        transformedEvents = fallbackEvents.map(event => this.transformEventResponse(event));
        isFallback = transformedEvents.length > 0;
      }

      return {
        events: transformedEvents,
        total: isFallback ? transformedEvents.length : total,
        page,
        limit,
        ...(isFallback && { isFallback: true }),
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

      // If publishing a paid event, ensure it has at least one ticket tier
      if (data.status === EventStatus.PUBLISHED && !event.isFree) {
        const tierCount = await prisma.eventTicketTier.count({
          where: { eventId, isActive: true },
        });

        if (tierCount === 0) {
          throw new AppError(
            'Cannot publish a paid event without ticket tiers. Please create at least one ticket tier first.',
            400
          );
        }
      }

      const updatedEvent = await prisma.event.update({
        where: { id: eventId },
        data: {
          ...(data.title && { title: data.title }),
          ...(data.description !== undefined && { description: data.description }),
          ...(data.type && { type: data.type }),
          ...(data.date && { date: new Date(data.date) }),
          ...(data.startDate && { startDate: new Date(data.startDate) }),
          ...(data.endDate && { endDate: new Date(data.endDate) }),
          ...(data.startTime !== undefined && { startTime: data.startTime }),
          ...(data.endTime !== undefined && { endTime: data.endTime }),
          ...(data.location && { location: data.location }),
          ...(data.mapLink !== undefined && { mapLink: data.mapLink }),
          ...(data.maxAttendees !== undefined && { maxAttendees: data.maxAttendees }),
          ...(data.notes !== undefined && { notes: data.notes }),
          ...(data.images !== undefined && { images: data.images }),
          ...(data.isFree !== undefined && { isFree: data.isFree }),
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
              logoUrl: true,
              coverImageUrl: true,
            },
          },
          _count: {
            select: {
              eventParticipants: true,
              
              eventTickets: true,
              tier: true,
            },
          },
        },
      });

      // Notify participants of important changes
      if (data.status === EventStatus.CANCELED) {
        // Get all participants to notify
        const participants = await prisma.eventParticipant.findMany({
          where: { eventId },
          select: { userId: true },
        });

        // Notify each participant about cancellation
        participants.forEach(p => {
          NotificationService.notifyEventCanceled(
            p.userId,
            eventId,
            event.title
          ).catch(err => logger.error('Failed to send cancellation notification:', err));
        });
      } else if (data.date && event.date.getTime() !== new Date(data.date).getTime()) {
        // Date was changed - notify participants
        const participants = await prisma.eventParticipant.findMany({
          where: { eventId },
          select: { userId: true },
        });

        participants.forEach(p => {
          NotificationService.notifyEventDateChanged(
            p.userId,
            eventId,
            event.title,
            event.date,
            new Date(data.date!)
          ).catch(err => logger.error('Failed to send date change notification:', err));
        });
      }

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
        orderBy: { displayOrder: 'asc' as const },
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

      // For paid events, ticket tier must be specified
      if (!data.ticketTierId) {
        throw new AppError('Please select a ticket tier', 400);
      }

      // Get and validate ticket tier
      const tier = await prisma.eventTicketTier.findUnique({
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

      const price = tier.price;

      // First, create or get participant record
      let participant = await prisma.eventParticipant.findFirst({
        where: { eventId: data.eventId, userId },
      });

      if (!participant) {
        // Generate QR code token for participant
        const qrToken = crypto.randomBytes(32).toString('hex');
        
        participant = await prisma.eventParticipant.create({
          data: {
            eventId: data.eventId,
            userId,
            qrCode: qrToken,
            status: 'REGISTERED', // Will be updated to CONFIRMED after successful payment
          },
        });
      }

      // Check for existing PENDING or FAILED ticket for retry scenario
      let existingTicket = await prisma.eventTicket.findFirst({
        where: {
          eventId: data.eventId,
          userId,
          ticketTierId: data.ticketTierId,
          paymentStatus: {
            in: [PaymentStatus.PENDING, PaymentStatus.FAILED],
          },
        },
        orderBy: { purchasedAt: 'desc' },
      });

      // If existing ticket found, update it instead of creating new one (retry scenario)
      if (existingTicket) {
        logger.info(`[EventService] Reusing existing ticket ${existingTicket.id} for retry payment`);
        
        // Update attendee info if provided
        existingTicket = await prisma.eventTicket.update({
          where: { id: existingTicket.id },
          data: {
            attendeeName: data.attendeeName || existingTicket.attendeeName,
            attendeeEmail: data.attendeeEmail || existingTicket.attendeeEmail,
            attendeePhone: data.attendeePhone || existingTicket.attendeePhone,
            paymentStatus: PaymentStatus.PENDING, // Reset to PENDING for retry
          },
        });
      }

      // Calculate fees for this ticket
      let feeCalculation = {
        platformFee: 0,
        gatewayFee: 0,
        totalFees: 0,
        netAmount: price,
      };
      
      try {
        const { PaymentService } = await import('../payments/payment.service');
        const paymentService = new PaymentService();
        
        // Find Xendit provider (default payment gateway)
        const xenditProvider = await prisma.paymentProvider.findFirst({
          where: { providerCode: 'xendit', isActive: true },
        });
        
        if (xenditProvider) {
          feeCalculation = await paymentService.calculateFees({
            amount: price,
            transactionType: 'EVENT_TICKET',
            providerId: xenditProvider.id,
          });
        }
      } catch (error) {
        logger.warn('Failed to calculate fees, using default values:', error);
      }

      // Create or use existing ticket (PENDING until payment is confirmed)
      let ticket;
      if (existingTicket) {
        // Retry scenario: Fetch the existing ticket with all includes
        ticket = await prisma.eventTicket.findUnique({
          where: { id: existingTicket.id },
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
      } else {
        // First purchase attempt: Create new ticket
        const ticketNumber = this.generateTicketNumber();
        
        ticket = await prisma.eventTicket.create({
          data: {
            eventId: data.eventId,
            userId: userId,
            participantId: participant.id,
            ticketTierId: data.ticketTierId,
            ticketType: tier ? tier.tierName : 'GENERAL',
            price: price,
            currency: event.currency,
            status: EventTicketStatus.PENDING,
            paymentStatus: PaymentStatus.PENDING,
            ticketNumber: ticketNumber,
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
      }

      // Note: soldQuantity will be incremented when payment is confirmed (in webhook)
      // This ensures only PAID tickets count as sold, not PENDING ones

      // Return ticket with fee calculations
      // Handle nullable tier fields for Flutter compatibility
      const response = {
        ...ticket,
        platformFee: feeCalculation.platformFee,
        gatewayFee: feeCalculation.gatewayFee,
        totalFees: feeCalculation.totalFees,
        netAmount: feeCalculation.netAmount,
      };

      // Ensure tier object has no null numeric values
      if (response.tier) {
        response.tier = {
          ...response.tier,
          totalQuantity: response.tier.totalQuantity ?? 0,
        };
      }

      return response as any;
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
  static async createRsvp(userId: string, eventId: string): Promise<ParticipantResponse> {
    try {
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: {
          user: {
            select: {
              fullName: true,
              username: true,
            },
          },
        },
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

      // Check if already registered
      const existingParticipant = await prisma.eventParticipant.findFirst({
        where: { eventId, userId },
      });

      if (existingParticipant) {
        throw new AppError('You have already RSVP\'d to this event', 400);
      }

      // Check max attendees
      if (event.maxAttendees) {
        const participantCount = await prisma.eventParticipant.count({
          where: { eventId },
        });

        if (participantCount >= event.maxAttendees) {
          throw new AppError('Event has reached maximum capacity', 400);
        }
      }

      // Generate secure token for QR code
      const qrToken = crypto.randomBytes(32).toString('hex');

      const participant = await prisma.eventParticipant.create({
        data: {
          eventId,
          userId,
          qrCode: qrToken,
          status: 'CONFIRMED', // Free events are confirmed immediately
        },
        include: {
          events: {
            select: {
              id: true,
              title: true,
              date: true,
              location: true,
              type: true,
              hostId: true,
            },
          },
          user: {
            select: {
              id: true,
              fullName: true,
              username: true,
              email: true,
              profile: { select: { profilePicture: true } },
            },
          },
        },
      });

      // Send notification to event host
      const userName = participant.user?.fullName || participant.user?.username || 'Someone';
      await NotificationService.createNotification({
        userId: participant.events.hostId,
        type: 'EVENT',
        title: 'New Event RSVP',
        message: `${userName} RSVP'd to your event: ${participant.events.title}`,
        actionUrl: `/events/${eventId}/attendees`,
        priority: 'normal',
        relatedEntityId: eventId,
        relatedEntityType: 'event_rsvp',
        metadata: {
          eventId,
          userId,
          eventTitle: participant.events.title,
        },
      });

      // Emit point event for RSVP
      try {
        const { pointsEvents } = await import('../../services/points-events.service');
        pointsEvents.trigger('event.rsvp.created', userId, {
          eventTitle: participant.events.title
        });
        logger.info(`Point event emitted for RSVP: ${eventId}`);
      } catch (error) {
        logger.error('Failed to emit point event for RSVP:', error);
      }

      // Send registration confirmation to user
      NotificationService.notifyEventRegistrationConfirmed(
        userId,
        participant.events.title,
        eventId,
        participant.events.date
      ).catch(err => logger.error('Failed to send event registration notification:', err));

      // Send confirmation email with calendar attachment
      if (participant.user?.email) {
        try {
          const { EmailQueue } = await import('../../services/emailQueue.service');
          const { EmailTemplate } = await import('../../types/email.types');
          const emailQueue = new EmailQueue();

          const frontendUrl = config.cors.origin[0] || 'https://app.berseapp.com';
          
          // Use new time fields if available, fall back to legacy date field
          const eventDate = event.startDate || event.date;
          const eventTime = event.startTime || undefined;
          
          const emailData = {
            recipientName: participant.user.fullName || participant.user.username || 'there',
            eventTitle: participant.events.title,
            eventDescription: event.description,
            eventDate,
            eventTime,
            eventLocation: participant.events.location || 'TBA',
            eventType: participant.events.type,
            hostName: event.user?.fullName || event.user?.username || 'Event Host',
            eventUrl: `${frontendUrl}/events/${eventId}`,
          };
          
          emailQueue.add(
            participant.user.email,
            EmailTemplate.EVENT_CONFIRMATION,
            emailData
          );
          
          logger.info(`Event confirmation email queued for user ${userId}`);
        } catch (error) {
          logger.error('Failed to queue event confirmation email:', error);
          // Don't throw - this is a background operation
        }
      }

      return participant as any;
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
      const participant = await prisma.eventParticipant.findFirst({
        where: { eventId, userId },
      });

      if (!participant) {
        throw new AppError('RSVP not found', 404);
      }

      await prisma.eventParticipant.update({
        where: { id: participant.id },
        data: {
          status: 'CANCELED',
          canceledAt: new Date(),
        },
      });
    } catch (error: any) {
      logger.error('Error canceling RSVP:', error);
      throw error;
    }
  }

  /**
   * Generate QR code for participant (on-demand)
   */
  static async generateRsvpQrCode(participantId: string, userId: string): Promise<string> {
    try {
      const participant = await prisma.eventParticipant.findUnique({
        where: { id: participantId },
        include: {
          events: {
            select: {
              id: true,
              date: true,
            },
          },
        },
      });

      if (!participant) {
        throw new AppError('Participant record not found', 404);
      }

      if (participant.userId !== userId) {
        throw new AppError('Not authorized to access this participant record', 403);
      }

      // Generate signed JWT token for QR code
      const eventDate = new Date(participant.events.date);
      const expiryDate = new Date(Math.max(
        eventDate.getTime() + (24 * 60 * 60 * 1000), // 24 hours after event
        Date.now() + (30 * 24 * 60 * 60 * 1000) // or 30 days from now
      ));

      const qrPayload = {
        participantId: participant.id,
        userId: participant.userId,
        eventId: participant.eventId,
        token: participant.qrCode, // Include stored token for extra validation
        type: 'EVENT_CHECKIN',
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
   * Get user's participation details for a specific event
   * Includes payment details and retry payment capability
   */
  static async getUserEventParticipation(userId: string, eventId: string): Promise<any> {
    try {
      // Get participation record
      const participant: any = await prisma.eventParticipant.findFirst({
        where: { userId, eventId },
        include: {
          events: {
            select: {
              id: true,
              title: true,
              description: true,
              date: true,
              location: true,
              mapLink: true,
              type: true,
              images: true,
              isFree: true,
              status: true,
              hostId: true,
              user: {
                select: {
                  id: true,
                  fullName: true,
                  username: true,
                  profile: { select: { profilePicture: true } }
                }
              }
            },
          },
          eventTickets: {
            where: { status: { not: EventTicketStatus.CANCELED } },
            include: {
              tier: {
                select: {
                  id: true,
                  tierName: true,
                  description: true,
                  price: true,
                  currency: true,
                }
              },
              paymentTransactions: {
                select: {
                  id: true,
                  amount: true,
                  currency: true,
                  status: true,
                  paymentMethod: true,
                  transactionId: true,
                  xenditInvoiceId: true,
                  xenditInvoiceUrl: true,
                  gatewayTransactionId: true,
                  failureReason: true,
                  createdAt: true,
                  paidAt: true,
                  processedAt: true,
                }
              }
            }
          },
        },
      });

      if (!participant) {
        throw new AppError('You are not registered for this event', 404);
      }

      // Check if payment is pending and can be retried
      const pendingTickets = participant.eventTickets.filter(
        (t: any) => t.paymentStatus === 'PENDING' || t.paymentStatus === 'FAILED'
      );

      // Get quantity from EventTicket model (assuming quantity field exists or default to 1)
      const getTicketQuantity = (ticket: any) => ticket.quantity || 1;

      // Calculate fees for tickets without payment transactions (PENDING)
      const calculateFeesForTicket = async (ticket: any) => {
        if (ticket.paymentTransactions) {
          // Payment exists, return actual values
          return {
            id: ticket.paymentTransactions.id,
            amount: ticket.paymentTransactions.amount,
            currency: ticket.paymentTransactions.currency,
            status: ticket.paymentTransactions.status,
            paymentMethod: ticket.paymentTransactions.paymentMethod,
            transactionId: ticket.paymentTransactions.transactionId || ticket.paymentTransactions.gatewayTransactionId,
            xenditInvoiceUrl: ticket.paymentTransactions.xenditInvoiceUrl,
            xenditInvoiceId: ticket.paymentTransactions.xenditInvoiceId,
            failureReason: ticket.paymentTransactions.failureReason,
            createdAt: ticket.paymentTransactions.createdAt,
            paidAt: ticket.paymentTransactions.paidAt || ticket.paymentTransactions.processedAt,
            platformFee: ticket.paymentTransactions.platformFee,
            gatewayFee: ticket.paymentTransactions.gatewayFee,
            totalFees: ticket.paymentTransactions.totalFees,
            netAmount: ticket.paymentTransactions.netAmount,
          };
        }

        // No payment yet - calculate estimated fees
        if (ticket.price > 0) {
          try {
            const { PaymentService } = await import('../payments/payment.service');
            const paymentService = new PaymentService();
            
            const xenditProvider = await prisma.paymentProvider.findFirst({
              where: { providerCode: 'xendit', isActive: true },
            });
            
            if (xenditProvider) {
              const feeCalculation = await paymentService.calculateFees({
                amount: ticket.price,
                transactionType: 'EVENT_TICKET',
                providerId: xenditProvider.id,
              });
              
              return {
                id: null,
                amount: ticket.price,
                currency: ticket.currency,
                status: 'PENDING',
                paymentMethod: null,
                transactionId: null,
                xenditInvoiceUrl: null,
                xenditInvoiceId: null,
                failureReason: null,
                createdAt: null,
                paidAt: null,
                platformFee: feeCalculation.platformFee,
                gatewayFee: feeCalculation.gatewayFee,
                totalFees: feeCalculation.totalFees,
                netAmount: feeCalculation.netAmount,
              };
            }
          } catch (error) {
            logger.warn('Failed to calculate fees for pending ticket:', error);
          }
        }

        // Free ticket or calculation failed
        return null;
      };

      // Map tickets with fee calculations
      const ticketsWithFees = await Promise.all(
        participant.eventTickets.map(async (ticket: any) => ({
          id: ticket.id,
          ticketNumber: ticket.ticketNumber,
          ticketType: ticket.ticketType,
          quantity: getTicketQuantity(ticket),
          price: ticket.price,
          currency: ticket.currency,
          status: ticket.status,
          paymentStatus: ticket.paymentStatus,
          purchasedAt: ticket.purchasedAt,
          tier: ticket.tier,
          payment: await calculateFeesForTicket(ticket),
          canRetryPayment: ticket.paymentStatus === 'PENDING' || ticket.paymentStatus === 'FAILED',
        }))
      );

      return {
        id: participant.id,
        eventId: participant.eventId,
        userId: participant.userId,
        status: participant.status,
        qrCode: participant.qrCode,
        registeredAt: participant.createdAt,
        checkedInAt: participant.checkedInAt,
        canceledAt: participant.canceledAt,
        event: participant.events,
        tickets: ticketsWithFees,
        hasUnpaidTickets: pendingTickets.length > 0,
        totalUnpaidAmount: pendingTickets.reduce((sum: number, t: any) => sum + (t.price * getTicketQuantity(t)), 0),
        canRetryPayment: pendingTickets.length > 0,
      };
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      logger.error('Error fetching user event participation:', error);
      throw error;
    }
  }

  /**
   * Get user's participations (unified: both free RSVPs and paid tickets)
   * All event participation goes through EventParticipant model
   * Free events: participant.status = CONFIRMED (no ticket)
   * Paid events: participant.status = CONFIRMED + has associated EventTicket
   */
  static async getUserParticipations(
    userId: string, 
    filters?: {
      eventId?: string;
      filter?: 'upcoming' | 'past' | 'all';
      status?: string;
      type?: string;
    }
  ): Promise<ParticipantResponse[]> {
    try {
      const now = new Date();
      
      // Build where clause for events as participant
      const participantWhere: any = { userId };
      if (filters?.eventId) {
        participantWhere.eventId = filters.eventId;
      }
      if (filters?.status) {
        participantWhere.status = filters.status;
      }
      if (filters?.type) {
        participantWhere.events = { type: filters.type };
      }
      if (filters?.filter === 'upcoming') {
        participantWhere.events = { ...participantWhere.events, date: { gte: now } };
      } else if (filters?.filter === 'past') {
        participantWhere.events = { ...participantWhere.events, date: { lt: now } };
      }

      // Build where clause for events as host
      const hostWhere: any = { hostId: userId };
      if (filters?.eventId) {
        hostWhere.id = filters.eventId;
      }
      if (filters?.type) {
        hostWhere.type = filters.type;
      }
      if (filters?.filter === 'upcoming') {
        hostWhere.date = { gte: now };
      } else if (filters?.filter === 'past') {
        hostWhere.date = { lt: now };
      }

      // Fetch both participations and hosted events
      const [participants, hostedEvents, hostUser] = await Promise.all([
        // Events user is participating in
        prisma.eventParticipant.findMany({
          where: participantWhere,
          include: {
            events: {
              select: {
                id: true,
                title: true,
                date: true,
                location: true,
                type: true,
                images: true,
                isFree: true,
                status: true,
              },
            },
            user: {
              select: {
                id: true,
                fullName: true,
                username: true,
                email: true,
                profile: { select: { profilePicture: true } },
              },
            },
            eventTickets: {
              select: {
                id: true,
                ticketNumber: true,
                ticketType: true,
                price: true,
                currency: true,
                status: true,
                paymentStatus: true,
                purchasedAt: true,
                tier: {
                  select: {
                    id: true,
                    tierName: true,
                    price: true,
                  }
                }
              }
            },
          },
          orderBy: { createdAt: 'desc' },
        }),
        // Events user is hosting
        prisma.event.findMany({
          where: hostWhere,
          select: {
            id: true,
            title: true,
            date: true,
            location: true,
            type: true,
            images: true,
            isFree: true,
            status: true,
            createdAt: true,
          },
          orderBy: { date: 'desc' },
        }),
        // Fetch host user data
        prisma.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            fullName: true,
            username: true,
            email: true,
            profile: { select: { profilePicture: true } },
          },
        }),
      ]);

      // Transform hosted events to match participant format
      const hostedAsParticipants = hostedEvents.map(event => ({
        id: `host-${event.id}`, // Unique ID for hosting role
        userId,
        eventId: event.id,
        status: 'HOST' as any,
        createdAt: event.createdAt,
        updatedAt: event.createdAt,
        events: event,
        user: hostUser,
        eventTickets: [],
        isHost: true,
      }));

      // Add isHost flag to regular participants (they are not hosts)
      const participantsWithHostFlag = participants.map(p => ({
        ...p,
        isHost: false,
      }));

      // Combine and sort by date
      const allParticipations = [...participantsWithHostFlag, ...hostedAsParticipants].sort((a, b) => {
        const dateA = a.events?.date || a.createdAt;
        const dateB = b.events?.date || b.createdAt;
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      });

      return allParticipations as any[];
    } catch (error: any) {
      logger.error('Error fetching user participations:', error);
      throw error;
    }
  }

  /**
   * Get user's participants/RSVPs (legacy - free events only)
   * @deprecated Use getUserParticipations instead
   */
  static async getUserRsvps(userId: string): Promise<ParticipantResponse[]> {
    try {
      const participants = await prisma.eventParticipant.findMany({
        where: { 
          userId,
          // Only get participants without tickets (free events)
          eventTickets: { none: {} }
        },
        include: {
          events: {
            select: {
              id: true,
              title: true,
              date: true,
              location: true,
              type: true,
              images: true,
            },
          },
          user: {
            select: {
              id: true,
              fullName: true,
              username: true,
              email: true,
              profile: { select: { profilePicture: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return participants as any[];
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
  static async checkInAttendee(eventId: string, data: CheckInRequest): Promise<ParticipantResponse> {
    try {
      const event = await prisma.event.findUnique({
        where: { id: eventId },
      });

      if (!event) {
        throw new AppError('Event not found', 404);
      }

      let targetUserId: string;
      let participantId: string | undefined;

      // Verify user has participant record or ticket
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
          if (decoded.type !== 'EVENT_CHECKIN') {
            throw new AppError('Invalid QR code type', 400);
          }
          
          if (decoded.eventId !== eventId) {
            throw new AppError('QR code is not for this event', 400);
          }

          // Verify participant exists and token matches
          const participant = await prisma.eventParticipant.findFirst({
            where: {
              id: decoded.participantId,
              userId: decoded.userId,
              eventId: eventId,
              qrCode: decoded.token, // Verify stored token matches
            },
          });

          if (!participant) {
            throw new AppError('Invalid or expired participant record', 404);
          }

          targetUserId = participant.userId;
          participantId = participant.id;
        } catch (error: any) {
          if (error instanceof AppError) throw error;
          logger.error('QR code verification failed:', error);
          throw new AppError('Invalid or expired QR code', 400);
        }
      } else {
        throw new AppError('User ID or QR code is required', 400);
      }

      // Get or create participant record
      let participant = await prisma.eventParticipant.findFirst({
        where: { eventId, userId: targetUserId },
      });

      if (!participant) {
        throw new AppError('No valid registration or ticket found for this event', 404);
      }

      // Check if already checked in
      if (participant.checkedInAt) {
        throw new AppError('User has already checked in', 400);
      }

      // Update participant with check-in
      participant = await prisma.eventParticipant.update({
        where: { id: participant.id },
        data: {
          checkedInAt: new Date(),
          status: 'CHECKED_IN',
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

      // Update user stats for events attended
      try {
        const { UserStatService } = await import('../user/user-stat.service');
        await UserStatService.incrementEventsAttended(targetUserId);
        logger.info(`Incremented eventsAttended stat for user ${targetUserId}`);
      } catch (error) {
        logger.error('Failed to update user stat for event attendance:', error);
      }

      // Trigger trust score update after event check-in
      try {
        const { TrustScoreService } = await import('../connections/trust/trust-score.service');
        const { TrustScoreUserService } = await import('../user/trust-score.service');
        
        // Get previous score
        const previousScore = await prisma.user.findUnique({
          where: { id: targetUserId },
          select: { trustScore: true },
        }).then(u => u?.trustScore || 0);

        await TrustScoreService.triggerTrustScoreUpdate(
          targetUserId,
          `Event attendance: ${event.title}`
        );
        
        // Get new score and record history
        const newScore = await prisma.user.findUnique({
          where: { id: targetUserId },
          select: { trustScore: true },
        }).then(u => u?.trustScore || 0);

        await TrustScoreUserService.recordScoreChange(
          targetUserId,
          newScore,
          previousScore,
          `Attended event: ${event.title}`,
          'activity',
          'event',
          eventId,
          { eventType: event.type, location: event.location }
        );
        
        logger.info(`Trust score update triggered for user ${targetUserId} after event check-in`);
      } catch (error) {
        // Non-critical error - log but don't fail the check-in
        logger.error('Failed to trigger trust score update after event check-in:', error);
      }

      // Emit point event for event attendance
      try {
        const { pointsEvents } = await import('../../services/points-events.service');
        
        pointsEvents.trigger('event.attended', targetUserId, {
          eventTitle: event.title,
          eventType: event.type
        });
        logger.info(`Awarded points for attending event: ${eventId}`);
      } catch (error) {
        logger.error('Failed to award points for event attendance:', error);
      }

      // Log check-in activity
      await ActivityLoggerService.logEventCheckIn(
        targetUserId,
        eventId,
        event.title
      ).catch((error) => {
        logger.error('Failed to log event check-in:', error);
      });

      // Notify user of successful check-in
      NotificationService.notifyEventCheckedIn(
        targetUserId,
        eventId,
        event.title
      ).catch(err => logger.error('Failed to send check-in notification:', err));

      // Check and award badges after event check-in
      try {
        const { BadgeService } = await import('../../services/badge.service');
        await BadgeService.checkAndAwardBadges(targetUserId);
        logger.info(`Badge check completed for user ${targetUserId} after event check-in`);
      } catch (error) {
        // Non-critical error - log but don't fail the check-in
        logger.error('Failed to check/award badges after event check-in:', error);
      }

      return {
        id: participant.id,
        eventId: participant.eventId,
        userId: participant.userId,
        checkedInAt: participant.checkedInAt!,
        user: (participant as any).user,
      } as any;
    } catch (error: any) {
      logger.error('Error checking in attendee:', error);
      throw error;
    }
  }

  /**
   * Get event attendees (checked-in participants)
   */
  static async getEventAttendees(eventId: string): Promise<ParticipantResponse[]> {
    try {
      const participants = await prisma.eventParticipant.findMany({
        where: { 
          eventId,
          checkedInAt: { not: null },
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
        orderBy: { checkedInAt: 'desc' },
      });

      return participants.map(p => ({
        id: p.id,
        eventId: p.eventId,
        userId: p.userId,
        checkedInAt: p.checkedInAt!,
        user: p.user,
      })) as any[];
    } catch (error: any) {
      logger.error('Error fetching attendees:', error);
      throw error;
    }
  }

  /**
   * Get all event participants (unified endpoint)
   * Returns ALL participants with their status (registered, confirmed, checked-in, etc.)
   */
  static async getEventParticipants(eventId: string, filters?: {
    status?: string;
    hasTicket?: boolean;
    checkedIn?: boolean;
  }): Promise<any[]> {
    try {
      const whereClause: any = { eventId };

      // Apply filters
      if (filters?.status) {
        whereClause.status = filters.status;
      }
      if (filters?.checkedIn !== undefined) {
        whereClause.checkedInAt = filters.checkedIn ? { not: null } : null;
      }

      const participants = await prisma.eventParticipant.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              username: true,
              profile: { select: { profilePicture: true } },
            },
          },
          eventTickets: {
            where: { status: { not: EventTicketStatus.CANCELED } },
            select: {
              id: true,
              ticketNumber: true,
              ticketType: true,
              price: true,
              currency: true,
              status: true,
              paymentStatus: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return participants.map(p => ({
        id: p.id,
        eventId: p.eventId,
        userId: p.userId,
        status: p.status,
        qrCode: p.qrCode,
        registeredAt: p.createdAt,
        checkedInAt: p.checkedInAt,
        canceledAt: p.canceledAt,
        hasTicket: p.eventTickets.length > 0,
        user: {
          id: p.user.id,
          fullName: p.user.fullName,
          username: p.user.username,
          profilePicture: getProfilePictureUrl(p.user.profile?.profilePicture),
        },
        tickets: p.eventTickets,
      }));
    } catch (error: any) {
      logger.error('Error fetching participants:', error);
      throw error;
    }
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private static transformEventResponse(event: any): EventResponse {
    // Calculate price range from ticket tiers
    let priceRange = undefined;
    if (!event.isFree && event.tier && event.tier.length > 0) {
      const activeTiers = event.tier.filter((t: any) => t.isActive);
      if (activeTiers.length > 0) {
        const prices = activeTiers.map((t: any) => t.price);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        const currency = activeTiers[0].currency;
        
        priceRange = {
          min: minPrice,
          max: maxPrice,
          currency,
          label: minPrice === maxPrice 
            ? `${currency} ${minPrice.toFixed(2)}`
            : `Starting from ${currency} ${minPrice.toFixed(2)}`,
        };
      }
    }

    return {
      id: event.id,
      title: event.title,
      description: event.description,
      type: event.type,
      date: event.date,
      startDate: event.startDate,
      endDate: event.endDate,
      startTime: event.startTime,
      endTime: event.endTime,
      location: event.location,
      mapLink: event.mapLink,
      maxAttendees: event.maxAttendees,
      notes: event.notes,
      hostId: event.hostId,
      communityId: event.communityId,
      hostType: event.hostType,
      images: event.images,
      isFree: event.isFree,
      currency: event.currency,
      priceRange,
      status: event.status,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
      host: event.user ? {
        ...event.user,
        profile: event.user.profile ? {
          ...event.user.profile,
          profilePicture: getProfilePictureUrl(event.user.profile.profilePicture),
        } : undefined,
      } : undefined,
      community: event.communities,
      ticketTiers: event.tier?.map((tier: any) => this.transformTicketTierResponse(tier)),
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

  /**
   * Send event creation emails to community members
   */
  private static async sendEventCreationEmails(
    userIds: string[],
    eventId: string,
    eventTitle: string,
    eventDescription: string,
    eventDate: Date,
    eventLocation: string,
    hostName: string,
    communityName: string
  ): Promise<void> {
    try {
      // Fetch users with emails
      const users = await prisma.user.findMany({
        where: {
          id: { in: userIds },
          email: { not: null },
        },
        select: {
          id: true,
          email: true,
          fullName: true,
        },
      });

      if (users.length === 0) {
        logger.info('No users with emails to notify for event creation');
        return;
      }

      // Import email queue service
      const { EmailQueue } = await import('../../services/emailQueue.service');
      const emailQueue = new EmailQueue();

      // Get frontend URL from CORS origin
      const frontendUrl = config.cors.origin[0] || 'https://app.berseapp.com';

      // Queue emails for all community members
      for (const user of users) {
        if (!user.email) continue;

        emailQueue.add(
          user.email,
          'EVENT_INVITATION' as any,
          {
            userName: user.fullName || 'Community Member',
            eventTitle,
            eventDescription,
            eventDate: eventDate.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            }),
            eventLocation,
            eventUrl: `${frontendUrl}/events/${eventId}`,
            hostName,
            communityName,
            ctaText: 'View Event Details',
            ctaUrl: `${frontendUrl}/events/${eventId}`,
          }
        );
      }

      logger.info(`Queued ${users.length} event creation emails for event: ${eventTitle}`);
    } catch (error) {
      logger.error('Error sending event creation emails:', error);
      // Don't throw - this is a background operation
    }
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
              logoUrl: true,
              coverImageUrl: true,
            },
          },
          tier: {
            where: { isActive: true },
            select: {
              id: true,
              tierName: true,
              description: true,
              price: true,
              currency: true,
              totalQuantity: true,
              soldQuantity: true,
              minPurchase: true,
              maxPurchase: true,
              availableFrom: true,
              availableUntil: true,
              displayOrder: true,
              isActive: true,
            },
            orderBy: { displayOrder: 'asc' as const },
          },
          _count: {
            select: {
              eventParticipants: true,
              tier: true,
            },
          },
          eventTickets: {
            where: {
              status: { not: EventTicketStatus.CANCELED },
            },
            select: {
              userId: true,
            },
          },
        },
      });

      // Calculate trending score
      const scoredEvents = events.map(event => {
        const rsvpCount = event._count?.eventParticipants || 0;
        // Count unique ticket holders
        const uniqueUsers = new Set(event.eventTickets?.map((t: any) => t.userId) || []);
        const ticketCount = uniqueUsers.size;
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
              logoUrl: true,
              coverImageUrl: true,
            },
          },
          tier: {
            where: { isActive: true },
            select: {
              id: true,
              tierName: true,
              description: true,
              price: true,
              currency: true,
              totalQuantity: true,
              soldQuantity: true,
              minPurchase: true,
              maxPurchase: true,
              availableFrom: true,
              availableUntil: true,
              displayOrder: true,
              isActive: true,
            },
            orderBy: { displayOrder: 'asc' as const },
          },
          _count: {
            select: {
              eventParticipants: true,
              
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
        prisma.eventParticipant.findMany({
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
              logoUrl: true,
              coverImageUrl: true,
            },
          },
          tier: {
            where: { isActive: true },
            select: {
              id: true,
              tierName: true,
              description: true,
              price: true,
              currency: true,
              totalQuantity: true,
              soldQuantity: true,
              minPurchase: true,
              maxPurchase: true,
              availableFrom: true,
              availableUntil: true,
              displayOrder: true,
              isActive: true,
            },
            orderBy: { displayOrder: 'asc' as const },
          },
          _count: {
            select: {
              eventParticipants: true,
              
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
        where: { 
          hostId,
          date: { gte: new Date() } // Only show upcoming events
        },
        take: limit,
        orderBy: { date: 'asc' },
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
              logoUrl: true,
              coverImageUrl: true,
            },
          },
          tier: {
            where: { isActive: true },
            select: {
              id: true,
              tierName: true,
              description: true,
              price: true,
              currency: true,
              totalQuantity: true,
              soldQuantity: true,
              minPurchase: true,
              maxPurchase: true,
              availableFrom: true,
              availableUntil: true,
              displayOrder: true,
              isActive: true,
            },
            orderBy: { displayOrder: 'asc' as const },
          },
          _count: {
            select: {
              eventParticipants: true,
              
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
              logoUrl: true,
              coverImageUrl: true,
            },
          },
          tier: {
            where: { isActive: true },
            select: {
              id: true,
              tierName: true,
              description: true,
              price: true,
              currency: true,
              totalQuantity: true,
              soldQuantity: true,
              minPurchase: true,
              maxPurchase: true,
              availableFrom: true,
              availableUntil: true,
              displayOrder: true,
              isActive: true,
            },
            orderBy: { displayOrder: 'asc' as const },
          },
          _count: {
            select: {
              eventParticipants: true,
              
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

      // Optimized: Single query joining participants
      const events = await prisma.event.findMany({
        where: {
          eventParticipants: {
            some: { userId, checkedInAt: { not: null } },
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
              logoUrl: true,
              coverImageUrl: true,
            },
          },
          tier: {
            where: { isActive: true },
            select: {
              id: true,
              tierName: true,
              description: true,
              price: true,
              currency: true,
              totalQuantity: true,
              soldQuantity: true,
              minPurchase: true,
              maxPurchase: true,
              availableFrom: true,
              availableUntil: true,
              displayOrder: true,
              isActive: true,
            },
            orderBy: { displayOrder: 'asc' as const },
          },
          _count: {
            select: {
              eventParticipants: true,
              
              eventTickets: true,
              tier: true,
            },
          },
          eventParticipants: {
            where: { userId, checkedInAt: { not: null } },
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
        if (event.eventParticipants.length > 0) {
          (transformed as any).checkedInAt = event.eventParticipants[0].checkedInAt;
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
   * Get events for a specific date
   * Returns all published events for the specified date with sorting and filters
   */
  static async getDayEvents(
    date: string,
    type?: EventType,
    sortBy: 'date' | 'title' | 'popularity' = 'date',
    sortOrder: 'asc' | 'desc' = 'asc',
    timezone: string = 'UTC'
  ): Promise<EventResponse[]> {
    try {
      // Parse the input date and get start/end of day
      const targetDate = new Date(date);
      if (isNaN(targetDate.getTime())) {
        throw new AppError('Invalid date format', 400);
      }

      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

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
              logoUrl: true,
              coverImageUrl: true,
            },
          },
          tier: {
            where: { isActive: true },
            select: {
              id: true,
              tierName: true,
              description: true,
              price: true,
              currency: true,
              totalQuantity: true,
              soldQuantity: true,
              minPurchase: true,
              maxPurchase: true,
              availableFrom: true,
              availableUntil: true,
              displayOrder: true,
              isActive: true,
            },
            orderBy: { displayOrder: 'asc' as const },
          },
          _count: {
            select: {
              eventParticipants: true,
              
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
    } catch (error) {
      logger.error('Error fetching events for specific date:', error);
      throw error;
    }
  }

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
              logoUrl: true,
              coverImageUrl: true,
            },
          },
          tier: {
            where: { isActive: true },
            select: {
              id: true,
              tierName: true,
              description: true,
              price: true,
              currency: true,
              totalQuantity: true,
              soldQuantity: true,
              minPurchase: true,
              maxPurchase: true,
              availableFrom: true,
              availableUntil: true,
              displayOrder: true,
              isActive: true,
            },
            orderBy: { displayOrder: 'asc' as const },
          },
          _count: {
            select: {
              eventParticipants: true,
              
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
   * Note: Excludes today's events (use /calendar/today endpoint for today)
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
      const startOfTomorrow = new Date(today.setHours(0, 0, 0, 0));
      startOfTomorrow.setDate(startOfTomorrow.getDate() + 1); // Start from tomorrow
      const endOfWeek = new Date(startOfTomorrow);
      endOfWeek.setDate(endOfWeek.getDate() + 7);

      const where: Prisma.EventWhereInput = {
        status: EventStatus.PUBLISHED,
        date: {
          gte: startOfTomorrow,
          lt: endOfWeek,
        },
      };

      if (type) {
        where.type = type;
      }

      const events = await prisma.event.findMany({
        where,
        take: 5,
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
              logoUrl: true,
              coverImageUrl: true,
            },
          },
          tier: {
            where: { isActive: true },
            select: {
              id: true,
              tierName: true,
              description: true,
              price: true,
              currency: true,
              totalQuantity: true,
              soldQuantity: true,
              minPurchase: true,
              maxPurchase: true,
              availableFrom: true,
              availableUntil: true,
              displayOrder: true,
              isActive: true,
            },
            orderBy: { displayOrder: 'asc' as const },
          },
          _count: {
            select: {
              eventParticipants: true,
              
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
          maxAttendees: true,
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

  /**
   * Get communities where user can create events
   * Only returns communities where user is ADMIN or OWNER
   */
  static async getAvailableCommunitiesForEvents(userId: string): Promise<Array<{
    id: string;
    name: string;
    logoUrl?: string;
    coverImageUrl?: string;
    memberCount: number;
    role: string;
    canCreateEvents: boolean;
    permissions: {
      isAdmin: boolean;
      isOwner: boolean;
    };
  }>> {
    try {
      // Fetch communities where user is ADMIN or the creator
      const memberships = await prisma.communityMember.findMany({
        where: {
          userId,
          isApproved: true,
          role: { in: ['ADMIN'] }, // Only admins can create events
        },
        include: {
          communities: {
            select: {
              id: true,
              name: true,
              logoUrl: true,
              coverImageUrl: true,
              createdById: true,
              _count: {
                select: {
                  communityMembers: {
                    where: { isApproved: true },
                  },
                },
              },
            },
          },
        },
      });

      const communities = memberships.map(membership => {
        const isOwner = membership.communities.createdById === userId;
        const isAdmin = membership.role === 'ADMIN';

        return {
          id: membership.communities.id,
          name: membership.communities.name,
          logoUrl: membership.communities.logoUrl || undefined,
          coverImageUrl: membership.communities.coverImageUrl || undefined,
          memberCount: membership.communities._count.communityMembers,
          role: isOwner ? 'OWNER' : membership.role,
          canCreateEvents: true, // All returned communities allow event creation
          permissions: {
            isAdmin,
            isOwner,
          },
        };
      });

      logger.info('Available communities for events retrieved', {
        userId,
        count: communities.length,
      });

      return communities;
    } catch (error: any) {
      logger.error('Error fetching available communities for events:', error);
      throw error;
    }
  }
}
