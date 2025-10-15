import { prisma } from '../config/database';
import { BadgeType } from '@prisma/client';

export class BadgeService {
  static async checkAndAwardBadges(userId: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        userBadges: {
          include: {
            badges: true,
          },
        },
        eventRsvps: {
          include: {
            events: true,
          },
        },
        events: true,
        referrals_referrals_referrerIdTousers: true,
      },
    });

    if (!user) return;

    const earnedBadgeTypes = user.userBadges.map((ub: any) => ub.badges.type);

    // Check for First Face badge
    if (!earnedBadgeTypes.includes(BadgeType.FIRST_FACE) && user.eventRsvps.length >= 1) {
      await this.awardBadge(userId, BadgeType.FIRST_FACE);
    }

    // Check for Cafe Friend badge
    const cafeEvents = user.eventRsvps.filter((rsvp: any) => rsvp.events.type === 'CAFE_MEETUP');
    if (!earnedBadgeTypes.includes(BadgeType.CAFE_FRIEND) && cafeEvents.length >= 3) {
      await this.awardBadge(userId, BadgeType.CAFE_FRIEND);
    }

    // Check for Certified Host badge (check serviceProfile for host certification)
    if (!earnedBadgeTypes.includes(BadgeType.CERTIFIED_HOST) && user.events.length >= 1) {
      await this.awardBadge(userId, BadgeType.CERTIFIED_HOST);
    }

    // Check for Connector badge
    if (!earnedBadgeTypes.includes(BadgeType.CONNECTOR) && user.referrals_referrals_referrerIdTousers.length >= 3) {
      await this.awardBadge(userId, BadgeType.CONNECTOR);
    }

    // Check for All-Rounder badge
    if (!earnedBadgeTypes.includes(BadgeType.ALL_ROUNDER) && earnedBadgeTypes.length >= 5) {
      await this.awardBadge(userId, BadgeType.ALL_ROUNDER);
    }
  }

  static async awardBadge(userId: string, badgeType: BadgeType): Promise<void> {
    const badge = await prisma.badge.findUnique({
      where: { type: badgeType },
    });

    if (!badge) return;

    await prisma.userBadge.create({
      data: {
        userId,
        badgeId: badge.id,
      } as any,
    });
  }

  static async getUserBadges(userId: string) {
    return prisma.userBadge.findMany({
      where: { userId },
      include: {
        badges: true,
      },
    });
  }
}