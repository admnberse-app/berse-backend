import cron from 'node-cron';
import { prisma } from '../config/database';
import { emailService } from './email.service';
import { NotificationService } from './notification.service';
import logger from '../utils/logger';
import QRCode from 'qrcode';

/**
 * Scheduler Service
 * Handles all scheduled background jobs with optimized performance
 */
export class SchedulerService {
  private static jobs: Map<string, ReturnType<typeof cron.schedule>> = new Map();
  private static notified24h = new Map<string, number>(); // eventId -> timestamp
  private static notified1h = new Map<string, number>();
  private static emailRemindersSent = new Map<string, number>(); // Prevent duplicate email reminders

  /**
   * Initialize all scheduled jobs
   */
  static init(): void {
    logger.info('[SchedulerService] Initializing scheduled jobs...');

    // Consolidated event reminders job - runs every hour
    this.scheduleConsolidatedEventReminders();
    
    // 1-hour urgent reminder job - runs every 5 minutes
    this.schedule1HourReminders();

    // Add more scheduled jobs here as needed

    logger.info(`[SchedulerService] ${this.jobs.size} scheduled jobs initialized`);
  }

  /**
   * Consolidated event reminders - emails + 24h notifications
   * Runs every hour - queries database once and sends both email and in-app notifications
   * OPTIMIZATION: Combines two jobs that query the same events to reduce DB load
   */
  private static scheduleConsolidatedEventReminders(): void {
    const task = cron.schedule('0 * * * *', async () => {
      try {
        logger.info('[SchedulerService] Running consolidated event reminder job...');
        
        const now = new Date();
        const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        const in23Hours = new Date(now.getTime() + 23 * 60 * 60 * 1000);

        // OPTIMIZATION: Single query for all event data needed for both emails and notifications
        const upcomingEvents = await prisma.event.findMany({
          where: {
            date: {
              gte: in23Hours,
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
            eventParticipants: {
              where: {
                status: {
                  in: ['REGISTERED', 'CHECKED_IN'],
                },
              },
              select: {
                userId: true,
                qrCode: true,
              },
            },
            eventTickets: {
              where: {
                status: { in: ['CONFIRMED', 'CHECKED_IN'] },
              },
              select: {
                id: true,
                ticketNumber: true,
                attendeeName: true,
                user: {
                  select: {
                    id: true,
                    fullName: true,
                    email: true,
                  },
                },
              },
            },
          },
        });

        logger.info(`[SchedulerService] Found ${upcomingEvents.length} events in next 24 hours`);

        // OPTIMIZATION: Process events in parallel batches
        const eventBatchSize = 5; // Process 5 events at a time
        for (let i = 0; i < upcomingEvents.length; i += eventBatchSize) {
          const eventBatch = upcomingEvents.slice(i, i + eventBatchSize);
          
          await Promise.allSettled(
            eventBatch.map(event => this.processEventReminders(event, now))
          );
        }

        // Clean up old cache entries (older than 48 hours)
        this.cleanupCache(this.notified24h, 48 * 60 * 60 * 1000);
        this.cleanupCache(this.emailRemindersSent, 48 * 60 * 60 * 1000);

        logger.info(`[SchedulerService] Consolidated reminder job completed. Caches: 24h=${this.notified24h.size}, email=${this.emailRemindersSent.size}`);

      } catch (error) {
        logger.error('[SchedulerService] Error in consolidated event reminder job:', error);
      }
    });

    this.jobs.set('consolidatedEventReminders', task);
    logger.info('[SchedulerService] Consolidated event reminder job scheduled (runs hourly)');
  }

  /**
   * Process reminders for a single event (emails + notifications)
   * OPTIMIZATION: Batch processing of notifications to avoid sequential await
   */
  private static async processEventReminders(event: any, now: Date): Promise<void> {
    try {
      // Send 24h in-app notifications (if not already sent)
      if (!this.notified24h.has(event.id) && event.eventParticipants.length > 0) {
        logger.info(`[SchedulerService] Sending 24h notifications for: ${event.title} (${event.eventParticipants.length} participants)`);
        
        const batchSize = 50;
        for (let i = 0; i < event.eventParticipants.length; i += batchSize) {
          const batch = event.eventParticipants.slice(i, i + batchSize);
          
          await Promise.allSettled(
            batch.map(participant =>
              NotificationService.notifyEventReminder24h(
                participant.userId,
                event.title,
                event.id,
                event.date
              )
            )
          );
        }
        
        this.notified24h.set(event.id, now.getTime());
      }

      // Send email reminders to ticket holders (if not already sent)
      if (!this.emailRemindersSent.has(event.id) && event.eventTickets.length > 0) {
        logger.info(`[SchedulerService] Sending ${event.eventTickets.length} email reminders for: ${event.title}`);
        
        // OPTIMIZATION: Process emails in small batches to avoid rate limits
        const emailBatchSize = 10;
        for (let i = 0; i < event.eventTickets.length; i += emailBatchSize) {
          const batch = event.eventTickets.slice(i, i + emailBatchSize);
          
          await Promise.allSettled(
            batch.map(ticket => this.sendTicketReminder(ticket, event, now))
          );
          
          // Small delay between batches to respect email rate limits
          if (i + emailBatchSize < event.eventTickets.length) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
        
        this.emailRemindersSent.set(event.id, now.getTime());
      }
    } catch (error) {
      logger.error(`[SchedulerService] Error processing reminders for event ${event.id}:`, error);
    }
  }

  /**
   * Send email reminder for a ticket
   * OPTIMIZATION: Moved QR code generation and email sending to separate method
   */
  private static async sendTicketReminder(ticket: any, event: any, now: Date): Promise<void> {
    try {
      const hoursUntilEvent = Math.round(
        (new Date(event.date).getTime() - now.getTime()) / (1000 * 60 * 60)
      );

      // Generate QR code (with fallback)
      const qrToken = ticket.qrCode || ticket.ticketNumber;
      const checkInUrl = `${process.env.APP_URL || 'https://berse.app'}/events/${event.id}/check-in/${qrToken}`;
      
      let qrCodeDataUrl = '';
      try {
        qrCodeDataUrl = await QRCode.toDataURL(checkInUrl, {
          width: 300,
          margin: 2,
          color: { dark: '#00B14F', light: '#FFFFFF' },
        });
      } catch (qrError) {
        qrCodeDataUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(checkInUrl)}`;
      }

      await emailService.sendEventReminderWithTicket(
        ticket.user.email,
        {
          ticketId: ticket.id,
          attendeeName: ticket.attendeeName || ticket.user.fullName,
          eventTitle: event.title,
          eventDate: event.date.toISOString(),
          eventTime: '00:00',
          eventLocation: event.location,
          qrCodeUrl: qrCodeDataUrl,
          hoursUntilEvent,
          mapLink: `https://maps.google.com/?q=${encodeURIComponent(event.location)}`,
        }
      );
    } catch (error) {
      logger.error(`[SchedulerService] Failed to send reminder to ${ticket.user.email}:`, error);
    }
  }

  /**
   * Schedule 1-hour urgent reminders
   * Runs every 5 minutes for time-critical notifications
   * OPTIMIZATION: Lightweight job with minimal database queries
   */
  private static schedule1HourReminders(): void {
    const task = cron.schedule('*/5 * * * *', async () => {
      try {
        logger.info('[SchedulerService] Running 1-hour notification reminder job...');
        
        const now = new Date();
        const in1Hour = new Date(now.getTime() + 60 * 60 * 1000);
        const in55Minutes = new Date(now.getTime() + 55 * 60 * 1000);
        
        // OPTIMIZATION: Minimal select - only fields we need
        const upcomingEvents = await prisma.event.findMany({
          where: {
            date: {
              gte: in55Minutes,
              lte: in1Hour,
            },
            status: 'PUBLISHED',
          },
          select: {
            id: true,
            title: true,
            date: true,
            location: true,
            eventParticipants: {
              where: {
                status: {
                  in: ['REGISTERED', 'CHECKED_IN'],
                },
              },
              select: {
                userId: true,
              },
            },
          },
        });

        if (upcomingEvents.length === 0) {
          logger.info('[SchedulerService] No events in next hour');
          return;
        }

        logger.info(`[SchedulerService] Found ${upcomingEvents.length} events for 1h notifications`);

        for (const event of upcomingEvents) {
          if (this.notified1h.has(event.id)) continue;

          logger.info(`[SchedulerService] Sending 1h notifications for: ${event.title} (${event.eventParticipants.length} participants)`);

          // OPTIMIZATION: Batch notifications
          const batchSize = 50;
          for (let i = 0; i < event.eventParticipants.length; i += batchSize) {
            const batch = event.eventParticipants.slice(i, i + batchSize);
            
            await Promise.allSettled(
              batch.map(participant =>
                NotificationService.notifyEventReminder1h(
                  participant.userId,
                  event.title,
                  event.id,
                  event.location
                )
              )
            );
          }

          this.notified1h.set(event.id, now.getTime());
        }

        // Clean up old entries (older than 2 hours)
        this.cleanupCache(this.notified1h, 2 * 60 * 60 * 1000);

        logger.info(`[SchedulerService] 1h reminder job completed. Cache size: ${this.notified1h.size}`);

      } catch (error) {
        logger.error('[SchedulerService] Error in 1-hour notification reminder job:', error);
      }
    });

    this.jobs.set('eventReminder1h', task);
    logger.info('[SchedulerService] 1-hour reminder job scheduled (runs every 5min)');
  }

  /**
   * Clean up old cache entries
   * OPTIMIZATION: Reusable cache cleanup utility
   */
  private static cleanupCache(cache: Map<string, number>, maxAge: number): void {
    const cutoff = Date.now() - maxAge;
    for (const [key, timestamp] of cache.entries()) {
      if (timestamp < cutoff) {
        cache.delete(key);
      }
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
