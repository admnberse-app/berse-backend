import { prisma } from '../config/database';
import { BadgeType } from '@prisma/client';

export class BadgeService {
  static async checkAndAwardBadges(userId: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        badges: true,
        attendedEvents: true,
        hostedEvents: true,
        referrals: true,
      },
    });

    if (!user) return;

    const earnedBadgeTypes = user.badges.map((b: any) => b.badge.type);

    // Check for First Face badge
    if (!earnedBadgeTypes.includes(BadgeType.FIRST_FACE) && user.attendedEvents.length >= 1) {
      await this.awardBadge(userId, BadgeType.FIRST_FACE);
    }

    // Check for Cafe Friend badge
    const cafeEvents = user.attendedEvents.filter((a: any) => a.event.type === 'CAFE_MEETUP');
    if (!earnedBadgeTypes.includes(BadgeType.CAFE_FRIEND) && cafeEvents.length >= 3) {
      await this.awardBadge(userId, BadgeType.CAFE_FRIEND);
    }

    // Check for Certified Host badge
    if (!earnedBadgeTypes.includes(BadgeType.CERTIFIED_HOST) && 
        user.isHostCertified && user.hostedEvents.length >= 1) {
      await this.awardBadge(userId, BadgeType.CERTIFIED_HOST);
    }

    // Check for Connector badge
    if (!earnedBadgeTypes.includes(BadgeType.CONNECTOR) && user.referrals.length >= 3) {
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
      },
    });
  }

  static async getUserBadges(userId: string) {
    return prisma.userBadge.findMany({
      where: { userId },
      include: {
        badge: true,
      },
    });
  }
}