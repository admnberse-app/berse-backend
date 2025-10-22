import cron from 'node-cron';
import { prisma } from '../config/database';
import { NotificationService } from '../services/notification.service';
import logger from '../utils/logger';

/**
 * Event Reminder Job
 * 
 * Sends reminder notifications to event participants:
 * - 24 hours before event: Runs hourly to catch events starting in the next 24h
 * - 1 hour before event: Runs every 5 minutes to catch events starting in the next 1h
 */

// Track which events have already been notified to avoid duplicates
const notified24h = new Set<string>();
const notified1h = new Set<string>();

/**
 * Send 24-hour reminder notifications
 * Runs every hour at :00
 */
export const start24HourReminders = () => {
  const schedule = '0 * * * *'; // Every hour at minute 0
  
  cron.schedule(schedule, async () => {
    try {
      logger.info('Running 24-hour event reminder job');
      
      const now = new Date();
      const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const in23Hours = new Date(now.getTime() + 23 * 60 * 60 * 1000);
      
      // Find events starting in the next 24 hours (within the 23-24h window)
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

      logger.info(`Found ${upcomingEvents.length} events for 24h reminders`);

      // Send notifications to all participants
      for (const event of upcomingEvents) {
        // Skip if already notified
        if (notified24h.has(event.id)) {
          continue;
        }

        logger.info(`Sending 24h reminders for event: ${event.title} (${event.eventParticipants.length} participants)`);

        // Send notification to each participant
        for (const participant of event.eventParticipants) {
          try {
            await NotificationService.notifyEventReminder24h(
              participant.userId,
              event.title,
              event.id,
              event.date
            );
          } catch (error) {
            logger.error(`Failed to send 24h reminder to user ${participant.userId}:`, error);
          }
        }

        // Mark as notified
        notified24h.add(event.id);
      }

      // Clean up old entries (events that have already started)
      const pastEventIds = await prisma.event.findMany({
        where: {
          date: {
            lt: now,
          },
        },
        select: {
          id: true,
        },
      });

      pastEventIds.forEach(e => {
        notified24h.delete(e.id);
      });

    } catch (error) {
      logger.error('Error in 24-hour reminder job:', error);
    }
  });

  logger.info(`✅ 24-hour event reminder job scheduled: ${schedule}`);
};

/**
 * Send 1-hour reminder notifications
 * Runs every 5 minutes
 */
export const start1HourReminders = () => {
  const schedule = '*/5 * * * *'; // Every 5 minutes
  
  cron.schedule(schedule, async () => {
    try {
      logger.info('Running 1-hour event reminder job');
      
      const now = new Date();
      const in1Hour = new Date(now.getTime() + 60 * 60 * 1000);
      const in55Minutes = new Date(now.getTime() + 55 * 60 * 1000);
      
      // Find events starting in the next hour (within the 55min-1h window)
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

      logger.info(`Found ${upcomingEvents.length} events for 1h reminders`);

      // Send notifications to all participants
      for (const event of upcomingEvents) {
        // Skip if already notified
        if (notified1h.has(event.id)) {
          continue;
        }

        logger.info(`Sending 1h reminders for event: ${event.title} (${event.eventParticipants.length} participants)`);

        // Send notification to each participant
          for (const participant of event.eventParticipants) {
            try {
              await NotificationService.notifyEventReminder1h(
                participant.userId,
                event.title,
                event.id,
                event.location
              );
            } catch (error) {
              logger.error(`Failed to send 1h reminder to user ${participant.userId}:`, error);
            }
          }        // Mark as notified
        notified1h.add(event.id);
      }

      // Clean up old entries
      const pastEventIds = await prisma.event.findMany({
        where: {
          date: {
            lt: now,
          },
        },
        select: {
          id: true,
        },
      });

      pastEventIds.forEach(e => {
        notified1h.delete(e.id);
      });

    } catch (error) {
      logger.error('Error in 1-hour reminder job:', error);
    }
  });

  logger.info(`✅ 1-hour event reminder job scheduled: ${schedule}`);
};

/**
 * Start all event reminder jobs
 */
export const startEventReminderJobs = () => {
  start24HourReminders();
  start1HourReminders();
  logger.info('✅ All event reminder jobs started successfully');
};
