import cron from 'node-cron';
import { prisma } from '../config/database';
import { emailService } from './email.service';
import logger from '../utils/logger';
import QRCode from 'qrcode';

/**
 * Scheduler Service
 * Handles all scheduled background jobs
 */
export class SchedulerService {
  private static jobs: Map<string, ReturnType<typeof cron.schedule>> = new Map();

  /**
   * Initialize all scheduled jobs
   */
  static init(): void {
    logger.info('[SchedulerService] Initializing scheduled jobs...');

    // Event reminder job - runs every hour
    this.scheduleEventReminders();

    // Add more scheduled jobs here as needed

    logger.info(`[SchedulerService] ${this.jobs.size} scheduled jobs initialized`);
  }

  /**
   * Schedule event reminder emails
   * Runs every hour and sends reminders for events happening in the next 24 hours
   */
  private static scheduleEventReminders(): void {
    const task = cron.schedule('0 * * * *', async () => {
      try {
        logger.info('[SchedulerService] Running event reminder job...');
        await this.sendEventReminders();
      } catch (error) {
        logger.error('[SchedulerService] Error in event reminder job:', error);
      }
    });

    this.jobs.set('eventReminders', task);
    logger.info('[SchedulerService] Event reminder job scheduled (runs hourly)');
  }

  /**
   * Send event reminders to attendees
   * Sends reminders for events happening in the next 24 hours
   */
  private static async sendEventReminders(): Promise<void> {
    try {
      const now = new Date();
      const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      // Find events happening in the next 24 hours
      const upcomingEvents = await prisma.event.findMany({
        where: {
          date: {
            gte: now,
            lte: in24Hours,
          },
          status: 'PUBLISHED',
        },
        select: {
          id: true,
          title: true,
          date: true,
          location: true,
          images: true,
        },
      });

      logger.info(`[SchedulerService] Found ${upcomingEvents.length} events in next 24 hours`);

      for (const event of upcomingEvents) {
        // Get all confirmed tickets for this event
        const tickets = await prisma.eventTicket.findMany({
          where: {
            eventId: event.id,
            status: { in: ['CONFIRMED', 'CHECKED_IN'] },
          },
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
            participant: {
              select: {
                qrCode: true,
              },
            },
          },
        });

        logger.info(`[SchedulerService] Sending ${tickets.length} reminders for event: ${event.title}`);

        // Send reminder to each ticket holder
        for (const ticket of tickets) {
          try {
            // Calculate hours until event
            const hoursUntilEvent = Math.round(
              (new Date(event.date).getTime() - now.getTime()) / (1000 * 60 * 60)
            );

            // Generate QR code
            const qrToken = ticket.participant?.qrCode || ticket.ticketNumber;
            const checkInUrl = `${process.env.APP_URL || 'https://berse.app'}/events/${event.id}/check-in/${qrToken}`;
            
            let qrCodeDataUrl = '';
            try {
              qrCodeDataUrl = await QRCode.toDataURL(checkInUrl, {
                width: 300,
                margin: 2,
                color: {
                  dark: '#00B14F',
                  light: '#FFFFFF',
                },
              });
            } catch (qrError) {
              logger.error('[SchedulerService] Failed to generate QR code:', qrError);
              qrCodeDataUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(checkInUrl)}`;
            }

            // Get event image URL
            const { storageService } = require('./storage.service');
            const eventImageUrl = event.images && event.images.length > 0
              ? (event.images[0].startsWith('http')
                  ? event.images[0]
                  : storageService.getPublicUrl(event.images[0]))
              : undefined;

            // Send reminder email
            await emailService.sendEventReminderWithTicket(
              ticket.user.email,
              {
                ticketId: ticket.id,
                attendeeName: ticket.attendeeName || ticket.user.fullName,
                eventTitle: event.title,
                eventDate: event.date.toISOString(),
                eventTime: '00:00', // Default time if not available
                eventLocation: event.location,
                qrCodeUrl: qrCodeDataUrl,
                hoursUntilEvent,
                mapLink: `https://maps.google.com/?q=${encodeURIComponent(event.location)}`,
              }
            );

            logger.info(`[SchedulerService] Sent reminder to ${ticket.user.email} for event: ${event.title}`);
          } catch (error) {
            logger.error(`[SchedulerService] Failed to send reminder to ${ticket.user.email}:`, error);
          }
        }
      }

      logger.info('[SchedulerService] Event reminder job completed');
    } catch (error) {
      logger.error('[SchedulerService] Error sending event reminders:', error);
      throw error;
    }
  }

  /**
   * Stop all scheduled jobs
   */
  static stop(): void {
    logger.info('[SchedulerService] Stopping all scheduled jobs...');
    this.jobs.forEach((task, name) => {
      task.stop();
      logger.info(`[SchedulerService] Stopped job: ${name}`);
    });
    this.jobs.clear();
  }

  /**
   * Get status of all jobs
   */
  static getStatus(): { name: string; running: boolean }[] {
    const status: { name: string; running: boolean }[] = [];
    this.jobs.forEach((task, name) => {
      status.push({
        name,
        running: task.getStatus() === 'scheduled',
      });
    });
    return status;
  }
}
