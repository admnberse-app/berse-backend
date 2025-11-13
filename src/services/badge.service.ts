import { prisma } from '../config/database';
import { BadgeType } from '@prisma/client';
import { NotificationService } from './notification.service';

interface BadgeCriteriaConfig {
  type: string;
  condition: string;
  count?: number;
  eventType?: string;
  minRating?: number;
  weeks?: number;
}

export class BadgeService {
  /**
   * Check and award badges based on dynamic criteria from database
   */
  static async checkAndAwardBadges(userId: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) return;

    // Get all active badges with their criteria
    const allBadges = await prisma.badge.findMany({
      where: { isActive: true },
    });

    // Get already earned badges
    const earnedBadges = await prisma.userBadge.findMany({
      where: { userId },
      include: { badges: true },
    });

    const earnedBadgeIds = new Set(earnedBadges.map(ub => ub.badgeId));

    // Check each badge
    for (const badge of allBadges) {
      // Skip if already earned
      if (earnedBadgeIds.has(badge.id)) continue;

      // Check if user meets criteria
      const meetsRequirements = await this.checkBadgeCriteria(userId, badge);
      
      if (meetsRequirements) {
        await this.awardBadge(userId, badge.type);
      }
    }
  }

  /**
   * Dynamically check if user meets badge criteria based on criteriaConfig
   */
  private static async checkBadgeCriteria(userId: string, badge: any): Promise<boolean> {
    const config = badge.criteriaConfig as BadgeCriteriaConfig;
    
    if (!config) {
      console.warn(`Badge ${badge.type} has no criteriaConfig`);
      return false;
    }

    const { type, condition, count = 1 } = config;

    switch (type) {
      case 'event_attendance':
        return await this.checkEventAttendanceCriteria(userId, config);
      
      case 'connection':
        return await this.checkConnectionCriteria(userId, config);
      
      case 'referral':
        return await this.checkReferralCriteria(userId, config);
      
      case 'event_hosting':
        return await this.checkEventHostingCriteria(userId, config);
      
      case 'streak':
        return await this.checkStreakCriteria(userId, config);
      
      case 'trust_moment':
        return await this.checkTrustMomentCriteria(userId, config);
      
      case 'engagement':
        return await this.checkEngagementCriteria(userId, config);
      
      case 'meta':
        return await this.checkMetaCriteria(userId, config);
      
      default:
        console.warn(`Unknown criteria type: ${type}`);
        return false;
    }
  }

  /**
   * Check event attendance criteria
   */
  private static async checkEventAttendanceCriteria(
    userId: string,
    config: BadgeCriteriaConfig
  ): Promise<boolean> {
    const { condition, eventType, count = 1 } = config;

    switch (condition) {
      case 'total_events_attended': {
        const attendanceCount = await prisma.eventParticipant.count({
          where: { userId },
        });
        return attendanceCount >= count;
      }

      case 'event_type_count': {
        if (!eventType) return false;
        const typeCount = await prisma.eventParticipant.count({
          where: {
            userId,
            events: { type: eventType as any },
          },
        });
        return typeCount >= count;
      }

      case 'unique_locations': {
        const participants = await prisma.eventParticipant.findMany({
          where: { userId },
          include: { events: { select: { location: true } } },
        });
        const uniqueLocations = new Set(
          participants.map((p: any) => p.events.location).filter(Boolean)
        );
        return uniqueLocations.size >= count;
      }

      default:
        return false;
    }
  }

  /**
   * Check connection criteria
   */
  private static async checkConnectionCriteria(
    userId: string,
    config: BadgeCriteriaConfig
  ): Promise<boolean> {
    const { condition, count = 1 } = config;

    if (condition === 'accepted_connections') {
      const connectionCount = await prisma.userConnection.count({
        where: {
          OR: [
            { initiatorId: userId, status: 'ACCEPTED' },
            { receiverId: userId, status: 'ACCEPTED' },
          ],
        },
      });
      return connectionCount >= count;
    }

    return false;
  }

  /**
   * Check referral criteria
   */
  private static async checkReferralCriteria(
    userId: string,
    config: BadgeCriteriaConfig
  ): Promise<boolean> {
    const { condition, count = 1 } = config;

    if (condition === 'activated_referrals') {
      const referralCount = await prisma.referral.count({
        where: {
          referrerId: userId,
          isActivated: true,
        },
      });
      return referralCount >= count;
    }

    return false;
  }

  /**
   * Check event hosting criteria
   */
  private static async checkEventHostingCriteria(
    userId: string,
    config: BadgeCriteriaConfig
  ): Promise<boolean> {
    const { condition, count = 1 } = config;

    if (condition === 'events_hosted') {
      const hostedCount = await prisma.event.count({
        where: { hostId: userId },
      });
      return hostedCount >= count;
    }

    return false;
  }

  /**
   * Check streak criteria
   */
  private static async checkStreakCriteria(
    userId: string,
    config: BadgeCriteriaConfig
  ): Promise<boolean> {
    const { condition, weeks = 4 } = config;

    if (condition === 'consecutive_weeks') {
      return await this.checkEventStreak(userId, weeks);
    }

    return false;
  }

  /**
   * Check trust moment criteria
   */
  private static async checkTrustMomentCriteria(
    userId: string,
    config: BadgeCriteriaConfig
  ): Promise<boolean> {
    const { condition, minRating = 4, count = 1 } = config;

    if (condition === 'positive_ratings_given') {
      const positiveCount = await prisma.trustMoment.count({
        where: {
          giverId: userId,
          rating: { gte: minRating },
        },
      });
      return positiveCount >= count;
    }

    return false;
  }

  /**
   * Check engagement criteria
   */
  private static async checkEngagementCriteria(
    userId: string,
    config: BadgeCriteriaConfig
  ): Promise<boolean> {
    const { condition, count = 1 } = config;

    if (condition === 'card_game_feedbacks') {
      const feedbackCount = await prisma.cardGameFeedback.count({
        where: { userId },
      });
      return feedbackCount >= count;
    }

    return false;
  }

  /**
   * Check meta criteria (badges about badges)
   */
  private static async checkMetaCriteria(
    userId: string,
    config: BadgeCriteriaConfig
  ): Promise<boolean> {
    const { condition, count = 1 } = config;

    if (condition === 'badges_earned') {
      const earnedCount = await prisma.userBadge.count({
        where: { userId },
      });
      return earnedCount >= count;
    }

    return false;
  }

  /**
   * Check if user has attended events for N consecutive weeks
   */
  private static async checkEventStreak(userId: string, requiredWeeks: number): Promise<boolean> {
    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - (requiredWeeks * 7));

    const participants = await prisma.eventParticipant.findMany({
      where: {
        userId,
        checkedInAt: {
          not: null,
          gte: fourWeeksAgo,
        },
      },
      orderBy: {
        checkedInAt: 'asc',
      },
    });

    if (participants.length < requiredWeeks) return false;

    // Check for consecutive weeks
    const weekSet = new Set<number>();
    participants.forEach((participant) => {
      const weekNumber = this.getWeekNumber(participant.checkedInAt!);
      weekSet.add(weekNumber);
    });

    // Check if we have at least requiredWeeks consecutive weeks
    const weeks = Array.from(weekSet).sort((a, b) => a - b);
    let consecutiveCount = 1;
    let maxConsecutive = 1;

    for (let i = 1; i < weeks.length; i++) {
      if (weeks[i] === weeks[i - 1] + 1) {
        consecutiveCount++;
        maxConsecutive = Math.max(maxConsecutive, consecutiveCount);
      } else {
        consecutiveCount = 1;
      }
    }

    return maxConsecutive >= requiredWeeks;
  }

  /**
   * Get ISO week number for a date
   */
  private static getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }

  static async awardBadge(userId: string, badgeType: BadgeType): Promise<void> {
    const badge = await prisma.badge.findUnique({
      where: { type: badgeType },
    });

    if (!badge) return;

    // Check if already earned
    const existing = await prisma.userBadge.findUnique({
      where: {
        userId_badgeId: {
          userId,
          badgeId: badge.id,
        },
      },
    });

    if (existing) return;

    await prisma.userBadge.create({
      data: {
        userId,
        badgeId: badge.id,
      } as any,
    });

    // Send badge earned notification
    await NotificationService.createNotification({
      userId,
      type: 'ACHIEVEMENT',
      title: '⭐ New Badge Earned!',
      message: `Congratulations! You've earned the "${badge.name}" badge! ${badge.description}`,
      actionUrl: '/profile/badges',
      priority: 'high',
      relatedEntityId: badge.id,
      relatedEntityType: 'badge',
      metadata: {
        badgeId: badge.id,
        badgeType: badge.type,
        badgeName: badge.name,
      },
    });

    // Send dedicated badge earned notification
    NotificationService.notifyBadgeEarned(
      userId,
      badge.name,
      badge.id,
      badge.description
    ).catch(err => console.error('Failed to send badge earned notification:', err));
  }

  static async getUserBadges(userId: string) {
    return prisma.userBadge.findMany({
      where: { userId },
      include: {
        badges: true,
      },
      orderBy: {
        earnedAt: 'desc',
      },
    });
  }

  static async getAllBadges() {
    return prisma.badge.findMany({
      orderBy: {
        type: 'asc',
      },
    });
  }

  static async getBadgeById(badgeId: string) {
    return prisma.badge.findUnique({
      where: { id: badgeId },
    });
  }

  static async getBadgeProgress(userId: string) {
    const allBadges = await prisma.badge.findMany({
      where: { isActive: true },
    });
    const earnedBadges = await this.getUserBadges(userId);
    const earnedBadgeIds = new Set(earnedBadges.map((ub: any) => ub.badgeId));

    const progress = await Promise.all(
      allBadges.map(async (badge) => {
        const isEarned = earnedBadgeIds.has(badge.id);
        const { current, required } = await this.calculateBadgeProgressDynamic(userId, badge);

        return {
          badge,
          isEarned,
          currentProgress: current,
          requiredProgress: required,
          percentage: required > 0 ? Math.min((current / required) * 100, 100) : 0,
          nextMilestone: isEarned ? null : `${required - current} more to go`,
        };
      })
    );

    return progress;
  }

  /**
   * Calculate badge progress dynamically based on criteriaConfig
   */
  private static async calculateBadgeProgressDynamic(
    userId: string,
    badge: any
  ): Promise<{ current: number; required: number }> {
    const config = badge.criteriaConfig as BadgeCriteriaConfig;
    const required = badge.requiredCount || 1;

    if (!config) {
      return { current: 0, required };
    }

    const { type, condition } = config;
    let current = 0;

    try {
      switch (type) {
        case 'event_attendance':
          current = await this.getEventAttendanceProgress(userId, config);
          break;
        
        case 'connection':
          if (condition === 'accepted_connections') {
            current = await prisma.userConnection.count({
              where: {
                OR: [
                  { initiatorId: userId, status: 'ACCEPTED' },
                  { receiverId: userId, status: 'ACCEPTED' },
                ],
              },
            });
          }
          break;
        
        case 'referral':
          if (condition === 'activated_referrals') {
            current = await prisma.referral.count({
              where: { referrerId: userId, isActivated: true },
            });
          }
          break;
        
        case 'event_hosting':
          if (condition === 'events_hosted') {
            current = await prisma.event.count({ where: { hostId: userId } });
          }
          break;
        
        case 'streak':
          if (condition === 'consecutive_weeks') {
            const weeks = config.weeks || 4;
            const weeksAgo = new Date();
            weeksAgo.setDate(weeksAgo.getDate() - (weeks * 7));
            const participants = await prisma.eventParticipant.findMany({
              where: {
                userId,
                checkedInAt: { not: null, gte: weeksAgo },
              },
            });
            const weekSet = new Set(
              participants.map(p => this.getWeekNumber(p.checkedInAt!))
            );
            current = weekSet.size;
          }
          break;
        
        case 'trust_moment':
          if (condition === 'positive_ratings_given') {
            const minRating = config.minRating || 4;
            current = await prisma.trustMoment.count({
              where: { giverId: userId, rating: { gte: minRating } },
            });
          }
          break;
        
        case 'engagement':
          if (condition === 'card_game_feedbacks') {
            current = await prisma.cardGameFeedback.count({ where: { userId } });
          }
          break;
        
        case 'meta':
          if (condition === 'badges_earned') {
            current = await prisma.userBadge.count({ where: { userId } });
          }
          break;
      }
    } catch (error) {
      console.error(`Error calculating progress for badge ${badge.type}:`, error);
    }

    return { current, required };
  }

  /**
   * Get event attendance progress based on config
   */
  private static async getEventAttendanceProgress(
    userId: string,
    config: BadgeCriteriaConfig
  ): Promise<number> {
    const { condition, eventType } = config;

    switch (condition) {
      case 'total_events_attended':
        return await prisma.eventParticipant.count({ where: { userId } });

      case 'event_type_count':
        if (!eventType) return 0;
        return await prisma.eventParticipant.count({
          where: {
            userId,
            events: { type: eventType as any },
          },
        });

      case 'unique_locations': {
        const participants = await prisma.eventParticipant.findMany({
          where: { userId },
          include: { events: { select: { location: true } } },
        });
        const uniqueLocations = new Set(
          participants.map((p: any) => p.events.location).filter(Boolean)
        );
        return uniqueLocations.size;
      }

      default:
        return 0;
    }
  }

  static async revokeBadge(userId: string, badgeId: string): Promise<boolean> {
    const result = await prisma.userBadge.deleteMany({
      where: {
        userId,
        badgeId,
      },
    });
    return result.count > 0;
  }
}