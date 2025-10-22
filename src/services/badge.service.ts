import { prisma } from '../config/database';
import { BadgeType } from '@prisma/client';
import { NotificationService } from './notification.service';

export class BadgeService {
  static async checkAndAwardBadges(userId: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) return;

    // Fetch all badge-related data separately
    const userBadges = await prisma.userBadge.findMany({
      where: { userId },
      include: { badges: true },
    });

    const eventParticipants = await prisma.eventParticipant.findMany({
      where: { userId },
      include: { events: true },
    });

    const events = await prisma.event.findMany({
      where: { hostId: userId },
    });

    const trustMomentsGiven = await prisma.trustMoment.findMany({
      where: { giverId: userId },
    });

    const cardGameFeedbacks = await prisma.cardGameFeedback.findMany({
      where: { userId },
    });

    // Fetch counts for relations
    const referralsCount = await prisma.referral.count({
      where: { referrerId: userId, isActivated: true },
    });

    const connectionsCount = await prisma.userConnection.count({
      where: {
        OR: [
          { initiatorId: userId, status: 'ACCEPTED' },
          { receiverId: userId, status: 'ACCEPTED' },
        ],
      },
    });

    const earnedBadgeTypes = userBadges.map((ub: any) => ub.badges.type);

    // Check for First Face badge - First event attended
    if (!earnedBadgeTypes.includes(BadgeType.FIRST_FACE) && eventParticipants.length >= 1) {
      await this.awardBadge(userId, BadgeType.FIRST_FACE);
    }

    // Check for Cafe Friend badge - Attend 3+ cafe meetups
    const cafeEvents = eventParticipants.filter((p: any) => p.events.type === 'CAFE_MEETUP');
    if (!earnedBadgeTypes.includes(BadgeType.CAFE_FRIEND) && cafeEvents.length >= 3) {
      await this.awardBadge(userId, BadgeType.CAFE_FRIEND);
    }

        // Check for Sukan Squad MVP badge - Attend 5+ sports events
    const sportsEvents = eventParticipants.filter((p: any) =>
      p.events.type === 'SPORTS'
    );
    if (!earnedBadgeTypes.includes(BadgeType.SUKAN_SQUAD_MVP) && sportsEvents.length >= 5) {
      await this.awardBadge(userId, BadgeType.SUKAN_SQUAD_MVP);
    }

        // Check for Soul Nourisher badge - Attend 5+ spiritual events
    const spiritualEvents = eventParticipants.filter((p: any) =>
      p.events.type === 'ILM'
    );
    if (!earnedBadgeTypes.includes(BadgeType.SOUL_NOURISHER) && spiritualEvents.length >= 5) {
      await this.awardBadge(userId, BadgeType.SOUL_NOURISHER);
    }

    // Check for Helpers Hand badge - Volunteer at 3+ events
    const volunteerEvents = eventParticipants.filter((p: any) => p.events.type === 'VOLUNTEER');
    if (!earnedBadgeTypes.includes(BadgeType.HELPERS_HAND) && volunteerEvents.length >= 3) {
      await this.awardBadge(userId, BadgeType.HELPERS_HAND);
    }

    // Check for Connector badge - Refer 3+ activated users
    if (!earnedBadgeTypes.includes(BadgeType.CONNECTOR) && referralsCount >= 3) {
      await this.awardBadge(userId, BadgeType.CONNECTOR);
    }

    // Check for Top Friend badge - Make 10+ connections
    const totalConnections = connectionsCount;
    if (!earnedBadgeTypes.includes(BadgeType.TOP_FRIEND) && totalConnections >= 10) {
      await this.awardBadge(userId, BadgeType.TOP_FRIEND);
    }

    // Check for Icebreaker badge - Make first connection
    if (!earnedBadgeTypes.includes(BadgeType.ICEBREAKER) && totalConnections >= 1) {
      await this.awardBadge(userId, BadgeType.ICEBREAKER);
    }

    // Check for Certified Host badge - Host 1+ events
    if (!earnedBadgeTypes.includes(BadgeType.CERTIFIED_HOST) && events.length >= 1) {
      await this.awardBadge(userId, BadgeType.CERTIFIED_HOST);
    }

    // Check for Streak Champ badge - Attend events 4 weeks in a row
    const hasStreak = await this.checkEventStreak(userId, 4);
    if (!earnedBadgeTypes.includes(BadgeType.STREAK_CHAMP) && hasStreak) {
      await this.awardBadge(userId, BadgeType.STREAK_CHAMP);
    }

    // Check for Local Guide badge - Attend events in 5+ different locations
    const uniqueLocations = new Set(
      eventParticipants.map((p: any) => p.events.location).filter(Boolean)
    );
    if (!earnedBadgeTypes.includes(BadgeType.LOCAL_GUIDE) && uniqueLocations.size >= 5) {
      await this.awardBadge(userId, BadgeType.LOCAL_GUIDE);
    }

    // Check for Kind Soul badge - Give 10+ positive trust moments
    const positiveTrustMoments = trustMomentsGiven.filter(
      (tm: any) => tm.rating >= 4
    );
    if (!earnedBadgeTypes.includes(BadgeType.KIND_SOUL) && positiveTrustMoments.length >= 10) {
      await this.awardBadge(userId, BadgeType.KIND_SOUL);
    }

    // Check for Knowledge Sharer badge - Submit 5+ helpful feedbacks
    const feedbackIds = cardGameFeedbacks.map((f: any) => f.id);
    const helpfulFeedbacks = feedbackIds.length > 0 ? await prisma.cardGameUpvote.count({
      where: {
        feedbackId: { in: feedbackIds },
      },
    }) : 0;
    if (!earnedBadgeTypes.includes(BadgeType.KNOWLEDGE_SHARER) &&
        cardGameFeedbacks.length >= 5 && helpfulFeedbacks >= 3) {
      await this.awardBadge(userId, BadgeType.KNOWLEDGE_SHARER);
    }

    // Check for All-Rounder badge - Earn 5+ different badges
    if (!earnedBadgeTypes.includes(BadgeType.ALL_ROUNDER) && earnedBadgeTypes.length >= 5) {
      await this.awardBadge(userId, BadgeType.ALL_ROUNDER);
    }
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
      actionUrl: '/badges',
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
      badge.id,
      badge.name,
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
    const allBadges = await this.getAllBadges();
    const earnedBadges = await this.getUserBadges(userId);
    const earnedBadgeTypes = new Set(earnedBadges.map((ub: any) => ub.badges.type));

    const progress = await Promise.all(
      allBadges.map(async (badge) => {
        const isEarned = earnedBadgeTypes.has(badge.type);
        const { current, required } = await this.calculateBadgeProgress(userId, badge.type);

        return {
          badge,
          isEarned,
          currentProgress: current,
          requiredProgress: required,
          percentage: required > 0 ? Math.min((current / required) * 100, 100) : 0,
          nextMilestone: isEarned ? null : this.getNextMilestone(badge.type, current, required),
        };
      })
    );

    return progress;
  }

  private static async calculateBadgeProgress(
    userId: string,
    badgeType: BadgeType
  ): Promise<{ current: number; required: number }> {
    switch (badgeType) {
      case BadgeType.FIRST_FACE: {
        const count = await prisma.eventParticipant.count({ where: { userId } });
        return { current: count, required: 1 };
      }
      case BadgeType.CAFE_FRIEND: {
        const count = await prisma.eventParticipant.count({
          where: { userId, events: { type: 'CAFE_MEETUP' } },
        });
        return { current: count, required: 3 };
      }
      case BadgeType.SUKAN_SQUAD_MVP: {
        const count = await prisma.eventParticipant.count({
          where: {
            userId,
            events: { type: 'SPORTS' },
          },
        });
        return { current: count, required: 5 };
      }
      case BadgeType.SOUL_NOURISHER: {
        const count = await prisma.eventParticipant.count({
          where: {
            userId,
            events: { type: 'ILM' },
          },
        });
        return { current: count, required: 5 };
      }
      case BadgeType.HELPERS_HAND: {
        const count = await prisma.eventParticipant.count({
          where: { userId, events: { type: 'VOLUNTEER' } },
        });
        return { current: count, required: 3 };
      }
      case BadgeType.CONNECTOR: {
        const count = await prisma.referral.count({
          where: { referrerId: userId, isActivated: true },
        });
        return { current: count, required: 3 };
      }
      case BadgeType.TOP_FRIEND: {
        const count = await prisma.userConnection.count({
          where: {
            OR: [{ initiatorId: userId }, { receiverId: userId }],
            status: 'ACCEPTED',
          },
        });
        return { current: count, required: 10 };
      }
      case BadgeType.ICEBREAKER: {
        const count = await prisma.userConnection.count({
          where: {
            OR: [{ initiatorId: userId }, { receiverId: userId }],
            status: 'ACCEPTED',
          },
        });
        return { current: count, required: 1 };
      }
      case BadgeType.CERTIFIED_HOST: {
        const count = await prisma.event.count({ where: { hostId: userId } });
        return { current: count, required: 1 };
      }
      case BadgeType.STREAK_CHAMP: {
        // Simplified: check weeks with attendance
        const fourWeeksAgo = new Date();
        fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
        const participants = await prisma.eventParticipant.findMany({
          where: { 
            userId, 
            checkedInAt: { 
              not: null,
              gte: fourWeeksAgo 
            } 
          },
        });
        const weekSet = new Set(participants.map((p) => this.getWeekNumber(p.checkedInAt!)));
        return { current: weekSet.size, required: 4 };
      }
      case BadgeType.LOCAL_GUIDE: {
        const rsvps = await prisma.eventParticipant.findMany({
          where: { userId },
          include: { events: { select: { location: true } } },
        });
        const uniqueLocations = new Set(rsvps.map((r: any) => r.events.location).filter(Boolean));
        return { current: uniqueLocations.size, required: 5 };
      }
      case BadgeType.KIND_SOUL: {
        const count = await prisma.trustMoment.count({
          where: { giverId: userId, rating: { gte: 4 } },
        });
        return { current: count, required: 10 };
      }
      case BadgeType.KNOWLEDGE_SHARER: {
        const feedbackCount = await prisma.cardGameFeedback.count({ where: { userId } });
        return { current: feedbackCount, required: 5 };
      }
      case BadgeType.ALL_ROUNDER: {
        const earnedCount = await prisma.userBadge.count({ where: { userId } });
        return { current: earnedCount, required: 5 };
      }
      default:
        return { current: 0, required: 1 };
    }
  }

  private static getNextMilestone(badgeType: BadgeType, current: number, required: number): string {
    const remaining = required - current;
    switch (badgeType) {
      case BadgeType.FIRST_FACE:
        return 'Attend your first event';
      case BadgeType.CAFE_FRIEND:
        return `Attend ${remaining} more cafe meetup${remaining > 1 ? 's' : ''}`;
      case BadgeType.SUKAN_SQUAD_MVP:
        return `Attend ${remaining} more sports event${remaining > 1 ? 's' : ''}`;
      case BadgeType.SOUL_NOURISHER:
        return `Attend ${remaining} more spiritual event${remaining > 1 ? 's' : ''}`;
      case BadgeType.HELPERS_HAND:
        return `Volunteer at ${remaining} more event${remaining > 1 ? 's' : ''}`;
      case BadgeType.CONNECTOR:
        return `Refer ${remaining} more friend${remaining > 1 ? 's' : ''}`;
      case BadgeType.TOP_FRIEND:
        return `Make ${remaining} more connection${remaining > 1 ? 's' : ''}`;
      case BadgeType.ICEBREAKER:
        return 'Make your first connection';
      case BadgeType.CERTIFIED_HOST:
        return 'Host your first event';
      case BadgeType.STREAK_CHAMP:
        return `Attend events for ${remaining} more week${remaining > 1 ? 's' : ''}`;
      case BadgeType.LOCAL_GUIDE:
        return `Attend events in ${remaining} more location${remaining > 1 ? 's' : ''}`;
      case BadgeType.KIND_SOUL:
        return `Give ${remaining} more positive trust moment${remaining > 1 ? 's' : ''}`;
      case BadgeType.KNOWLEDGE_SHARER:
        return `Submit ${remaining} more card game feedback${remaining > 1 ? 's' : ''}`;
      case BadgeType.ALL_ROUNDER:
        return `Earn ${remaining} more badge${remaining > 1 ? 's' : ''}`;
      default:
        return '';
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