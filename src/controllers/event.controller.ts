import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { prisma } from '../config/database';
import { sendSuccess } from '../utils/response';
import { AppError } from '../middleware/error';
import { generateQRCode, generateEventQRData } from '../utils/qrcode';
import { PointsService } from '../services/points.service';
import { BadgeService } from '../services/badge.service';
import { UserRole } from '@prisma/client';
import { POINT_VALUES } from '../types';

export class EventController {
  static async createEvent(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const hostId = req.user?.id!;
      const { 
        title, 
        description, 
        type, 
        date, 
        time,
        location, 
        venue,
        category,
        price,
        mapLink, 
        maxAttendees, 
        notes,
        isOnline,
        meetingLink,
        whatsappGroup,
        tags,
        requirements,
        highlights,
        agenda,
        coverImage,
        hosts,
        coHosts,
        sponsors,
        earlyBirdPrice,
        accessibility,
        recurringSchedule,
        checkInSettings
      } = req.body;

      // Create the event
      const event = await prisma.event.create({
        data: {
          title,
          description,
          type: type || category || 'social',
          date: new Date(date),
          location,
          mapLink,
          maxAttendees: maxAttendees || 50,
          notes: notes || JSON.stringify({
            time,
            venue,
            category,
            price,
            isOnline,
            meetingLink,
            whatsappGroup,
            tags,
            requirements,
            highlights,
            agenda,
            coverImage,
            hosts,
            coHosts,
            sponsors,
            earlyBirdPrice,
            accessibility,
            recurringSchedule,
            checkInSettings
          }),
          hostId,
        },
        include: {
          host: {
            select: {
              id: true,
              fullName: true,
              profilePicture: true,
            },
          },
        },
      });

      sendSuccess(res, event, 'Event created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async getEvents(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { type, city, upcoming } = req.query;

      const where: any = {};

      if (type) {
        where.type = type;
      }

      if (city) {
        where.location = { contains: city as string, mode: 'insensitive' };
      }

      if (upcoming === 'true') {
        where.date = { gte: new Date() };
      }

      const events = await prisma.event.findMany({
        where,
        include: {
          host: {
            select: {
              id: true,
              fullName: true,
              profilePicture: true,
            },
          },
          _count: {
            select: {
              rsvps: true,
              attendance: true,
            },
          },
        },
        orderBy: { date: 'asc' },
      });

      // Parse notes field to include additional event data
      const formattedEvents = events.map(event => {
        let additionalData = {};
        try {
          if (event.notes) {
            additionalData = JSON.parse(event.notes);
          }
        } catch (e) {
          // If notes is not valid JSON, keep it as is
        }
        
        return {
          ...event,
          ...additionalData,
          organizer: event.host.fullName,
          attendees: event._count.rsvps,
          committedProfiles: [],
          friends: []
        };
      });

      sendSuccess(res, formattedEvents);
    } catch (error) {
      next(error);
    }
  }

  static async getEventById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const event = await prisma.event.findUnique({
        where: { id },
        include: {
          host: {
            select: {
              id: true,
              fullName: true,
              profilePicture: true,
              role: true,
            },
          },
          rsvps: {
            include: {
              user: {
                select: {
                  id: true,
                  fullName: true,
                  profilePicture: true,
                },
              },
            },
          },
          _count: {
            select: {
              attendance: true,
            },
          },
        },
      });

      if (!event) {
        throw new AppError('Event not found', 404);
      }

      sendSuccess(res, event);
    } catch (error) {
      next(error);
    }
  }

  static async rsvpEvent(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id!;
      const { id: eventId } = req.params;

      // Check if event exists
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: {
          _count: {
            select: { rsvps: true },
          },
        },
      });

      if (!event) {
        throw new AppError('Event not found', 404);
      }

      // Check if already RSVP'd
      const existingRSVP = await prisma.eventRSVP.findUnique({
        where: {
          userId_eventId: {
            userId,
            eventId,
          },
        },
      });

      if (existingRSVP) {
        throw new AppError('Already RSVP\'d to this event', 400);
      }

      // Check max attendees
      if (event.maxAttendees && event._count.rsvps >= event.maxAttendees) {
        throw new AppError('Event is full', 400);
      }

      // Generate QR code
      const qrData = generateEventQRData(eventId, userId);
      const qrCode = await generateQRCode(qrData);

      const rsvp = await prisma.eventRSVP.create({
        data: {
          userId,
          eventId,
          qrCode,
        },
        include: {
          event: {
            select: {
              title: true,
              date: true,
              location: true,
            },
          },
        },
      });

      sendSuccess(res, rsvp, 'RSVP successful', 201);
    } catch (error) {
      next(error);
    }
  }

  static async checkInEvent(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { eventId, userId } = req.body;

      // Verify RSVP exists
      const rsvp = await prisma.eventRSVP.findUnique({
        where: {
          userId_eventId: {
            userId,
            eventId,
          },
        },
      });

      if (!rsvp) {
        throw new AppError('No RSVP found for this user', 400);
      }

      // Check if already checked in
      const existingAttendance = await prisma.eventAttendance.findUnique({
        where: {
          userId_eventId: {
            userId,
            eventId,
          },
        },
      });

      if (existingAttendance) {
        throw new AppError('User already checked in', 400);
      }

      // Create attendance record
      const attendance = await prisma.eventAttendance.create({
        data: {
          userId,
          eventId,
        },
        include: {
          user: {
            select: {
              fullName: true,
            },
          },
          event: {
            select: {
              title: true,
              type: true,
            },
          },
        },
      });

      // Award points based on event type
      let pointAction: keyof typeof POINT_VALUES = 'ATTEND_EVENT';
      if (attendance.event.type === 'TRIP') {
        pointAction = 'JOIN_TRIP';
      } else if (attendance.event.type === 'CAFE_MEETUP') {
        pointAction = 'CAFE_MEETUP';
      } else if (attendance.event.type === 'ILM') {
        pointAction = 'ILM_EVENT';
      } else if (attendance.event.type === 'VOLUNTEER') {
        pointAction = 'VOLUNTEER';
      }

      await PointsService.awardPoints(userId, pointAction, `Attended ${attendance.event.title}`);

      // Check for badges
      await BadgeService.checkAndAwardBadges(userId);

      sendSuccess(res, attendance, 'Check-in successful');
    } catch (error) {
      next(error);
    }
  }

  static async updateEvent(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id!;
      const userRole = req.user?.role!;

      // Check if user can update the event
      const event = await prisma.event.findUnique({
        where: { id },
      });

      if (!event) {
        throw new AppError('Event not found', 404);
      }

      if (event.hostId !== userId && userRole !== UserRole.MODERATOR && userRole !== UserRole.ADMIN) {
        throw new AppError('Not authorized to update this event', 403);
      }

      const { title, description, type, date, location, mapLink, maxAttendees, notes } = req.body;

      const updatedEvent = await prisma.event.update({
        where: { id },
        data: {
          title,
          description,
          type,
          date: date ? new Date(date) : undefined,
          location,
          mapLink,
          maxAttendees,
          notes,
        },
        include: {
          host: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
      });

      sendSuccess(res, updatedEvent, 'Event updated successfully');
    } catch (error) {
      next(error);
    }
  }
}