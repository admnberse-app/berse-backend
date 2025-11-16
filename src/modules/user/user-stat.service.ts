import logger from '../../utils/logger';
import prisma from '../../lib/prisma';

/**
 * UserStat Service
 * Centralized service for managing user statistics that contribute to trust score
 */
export class UserStatService {
  /**
   * Initialize or get user stats
   */
  static async getOrCreateUserStat(userId: string) {
    try {
      const existing = await prisma.userStat.findUnique({
        where: { userId },
      });

      if (existing) {
        return existing;
      }

      // Create new user stat
      return await prisma.userStat.create({
        data: {
          userId,
          eventsAttended: 0,
          eventsHosted: 0,
          vouchesGiven: 0,
          vouchesReceived: 0,
          listingsPosted: 0,
          servicesProvided: 0,
          communitiesJoined: 0,
          totalPoints: 0,
          lastCalculatedAt: new Date(),
        },
      });
    } catch (error) {
      logger.error('Error getting/creating user stat:', error);
      throw error;
    }
  }

  /**
   * Increment events attended count
   */
  static async incrementEventsAttended(userId: string) {
    try {
      await this.getOrCreateUserStat(userId);

      const updated = await prisma.userStat.update({
        where: { userId },
        data: {
          eventsAttended: { increment: 1 },
          lastCalculatedAt: new Date(),
        },
      });

      logger.info(`Incremented eventsAttended for user ${userId}: ${updated.eventsAttended}`);
      return updated;
    } catch (error) {
      logger.error('Error incrementing events attended:', error);
      throw error;
    }
  }

  /**
   * Decrement events attended count (e.g., if check-in is reversed)
   */
  static async decrementEventsAttended(userId: string) {
    try {
      await this.getOrCreateUserStat(userId);

      const updated = await prisma.userStat.update({
        where: { userId },
        data: {
          eventsAttended: { decrement: 1 },
          lastCalculatedAt: new Date(),
        },
      });

      logger.info(`Decremented eventsAttended for user ${userId}: ${updated.eventsAttended}`);
      return updated;
    } catch (error) {
      logger.error('Error decrementing events attended:', error);
      throw error;
    }
  }

  /**
   * Increment events hosted count
   */
  static async incrementEventsHosted(userId: string) {
    try {
      await this.getOrCreateUserStat(userId);

      const updated = await prisma.userStat.update({
        where: { userId },
        data: {
          eventsHosted: { increment: 1 },
          lastCalculatedAt: new Date(),
        },
      });

      logger.info(`Incremented eventsHosted for user ${userId}: ${updated.eventsHosted}`);
      return updated;
    } catch (error) {
      logger.error('Error incrementing events hosted:', error);
      throw error;
    }
  }

  /**
   * Decrement events hosted count (e.g., if event is deleted)
   */
  static async decrementEventsHosted(userId: string) {
    try {
      await this.getOrCreateUserStat(userId);

      const updated = await prisma.userStat.update({
        where: { userId },
        data: {
          eventsHosted: { decrement: 1 },
          lastCalculatedAt: new Date(),
        },
      });

      logger.info(`Decremented eventsHosted for user ${userId}: ${updated.eventsHosted}`);
      return updated;
    } catch (error) {
      logger.error('Error decrementing events hosted:', error);
      throw error;
    }
  }

  /**
   * Increment communities joined count
   */
  static async incrementCommunitiesJoined(userId: string) {
    try {
      await this.getOrCreateUserStat(userId);

      const updated = await prisma.userStat.update({
        where: { userId },
        data: {
          communitiesJoined: { increment: 1 },
          lastCalculatedAt: new Date(),
        },
      });

      logger.info(`Incremented communitiesJoined for user ${userId}: ${updated.communitiesJoined}`);
      return updated;
    } catch (error) {
      logger.error('Error incrementing communities joined:', error);
      throw error;
    }
  }

  /**
   * Decrement communities joined count (e.g., if user leaves community)
   */
  static async decrementCommunitiesJoined(userId: string) {
    try {
      await this.getOrCreateUserStat(userId);

      const updated = await prisma.userStat.update({
        where: { userId },
        data: {
          communitiesJoined: { decrement: 1 },
          lastCalculatedAt: new Date(),
        },
      });

      logger.info(`Decremented communitiesJoined for user ${userId}: ${updated.communitiesJoined}`);
      return updated;
    } catch (error) {
      logger.error('Error decrementing communities joined:', error);
      throw error;
    }
  }

  /**
   * Increment vouches received count
   */
  static async incrementVouchesReceived(userId: string) {
    try {
      await this.getOrCreateUserStat(userId);

      const updated = await prisma.userStat.update({
        where: { userId },
        data: {
          vouchesReceived: { increment: 1 },
          lastCalculatedAt: new Date(),
        },
      });

      logger.info(`Incremented vouchesReceived for user ${userId}: ${updated.vouchesReceived}`);
      return updated;
    } catch (error) {
      logger.error('Error incrementing vouches received:', error);
      throw error;
    }
  }

  /**
   * Decrement vouches received count (e.g., if vouch is revoked)
   */
  static async decrementVouchesReceived(userId: string) {
    try {
      await this.getOrCreateUserStat(userId);

      const updated = await prisma.userStat.update({
        where: { userId },
        data: {
          vouchesReceived: { decrement: 1 },
          lastCalculatedAt: new Date(),
        },
      });

      logger.info(`Decremented vouchesReceived for user ${userId}: ${updated.vouchesReceived}`);
      return updated;
    } catch (error) {
      logger.error('Error decrementing vouches received:', error);
      throw error;
    }
  }

  /**
   * Increment vouches given count
   */
  static async incrementVouchesGiven(userId: string) {
    try {
      await this.getOrCreateUserStat(userId);

      const updated = await prisma.userStat.update({
        where: { userId },
        data: {
          vouchesGiven: { increment: 1 },
          lastCalculatedAt: new Date(),
        },
      });

      logger.info(`Incremented vouchesGiven for user ${userId}: ${updated.vouchesGiven}`);
      return updated;
    } catch (error) {
      logger.error('Error incrementing vouches given:', error);
      throw error;
    }
  }

  /**
   * Decrement vouches given count (e.g., if user revokes their vouch)
   */
  static async decrementVouchesGiven(userId: string) {
    try {
      await this.getOrCreateUserStat(userId);

      const updated = await prisma.userStat.update({
        where: { userId },
        data: {
          vouchesGiven: { decrement: 1 },
          lastCalculatedAt: new Date(),
        },
      });

      logger.info(`Decremented vouchesGiven for user ${userId}: ${updated.vouchesGiven}`);
      return updated;
    } catch (error) {
      logger.error('Error decrementing vouches given:', error);
      throw error;
    }
  }

  /**
   * Increment services provided count
   */
  static async incrementServicesProvided(userId: string) {
    try {
      await this.getOrCreateUserStat(userId);

      const updated = await prisma.userStat.update({
        where: { userId },
        data: {
          servicesProvided: { increment: 1 },
          lastCalculatedAt: new Date(),
        },
      });

      logger.info(`Incremented servicesProvided for user ${userId}: ${updated.servicesProvided}`);
      return updated;
    } catch (error) {
      logger.error('Error incrementing services provided:', error);
      throw error;
    }
  }

  /**
   * Increment listings posted count
   */
  static async incrementListingsPosted(userId: string) {
    try {
      await this.getOrCreateUserStat(userId);

      const updated = await prisma.userStat.update({
        where: { userId },
        data: {
          listingsPosted: { increment: 1 },
          lastCalculatedAt: new Date(),
        },
      });

      logger.info(`Incremented listingsPosted for user ${userId}: ${updated.listingsPosted}`);
      return updated;
    } catch (error) {
      logger.error('Error incrementing listings posted:', error);
      throw error;
    }
  }

  /**
   * Recalculate all stats from scratch (for data integrity checks)
   */
  static async recalculateAllStats(userId: string) {
    try {
      // Count actual values from database
      const eventsAttended = await prisma.eventParticipant.count({
        where: { userId, checkedInAt: { not: null } },
      });

      const eventsHosted = await prisma.event.count({
        where: { hostId: userId, status: 'PUBLISHED' },
      });

      const communitiesJoined = await prisma.communityMember.count({
        where: { userId },
      });

      const vouchesReceived = await prisma.vouch.count({
        where: {
          voucheeId: userId,
          status: { in: ['APPROVED', 'ACTIVE'] },
        },
      });

      const vouchesGiven = await prisma.vouch.count({
        where: {
          voucherId: userId,
          status: { in: ['APPROVED', 'ACTIVE'] },
        },
      });

      // Update or create user stat
      const updated = await prisma.userStat.upsert({
        where: { userId },
        create: {
          userId,
          eventsAttended,
          eventsHosted,
          vouchesGiven,
          vouchesReceived,
          listingsPosted: 0, // TODO: Add when listings module exists
          servicesProvided: 0, // TODO: Add when services module exists
          communitiesJoined,
          totalPoints: 0,
          lastCalculatedAt: new Date(),
        },
        update: {
          eventsAttended,
          eventsHosted,
          vouchesGiven,
          vouchesReceived,
          communitiesJoined,
          lastCalculatedAt: new Date(),
        },
      });

      logger.info(`Recalculated all stats for user ${userId}:`, {
        eventsAttended,
        eventsHosted,
        communitiesJoined,
        vouchesReceived,
        vouchesGiven,
      });

      return updated;
    } catch (error) {
      logger.error('Error recalculating all stats:', error);
      throw error;
    }
  }
}
