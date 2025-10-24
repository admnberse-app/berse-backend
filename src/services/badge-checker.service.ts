/**
 * Badge Checker Service
 * 
 * Automatically checks and awards badges to users based on their activities
 * Supports the 8 new badges introduced in 2025
 */

import { PrismaClient, BadgeType, User } from '@prisma/client';

const prisma = new PrismaClient();

export class BadgeCheckerService {
  /**
   * Check all badges for a user and award any newly earned ones
   */
  async checkAndAwardBadges(userId: string): Promise<string[]> {
    const awardedBadges: string[] = [];

    // Get all active badges
    const badges = await prisma.badge.findMany({
      where: { isActive: true },
    });

    for (const badge of badges) {
      const hasEarned = await this.checkBadgeCriteria(userId, badge.type);
      
      if (hasEarned) {
        const awarded = await this.awardBadge(userId, badge.type);
        if (awarded) {
          awardedBadges.push(badge.name);
        }
      }
    }

    return awardedBadges;
  }

  /**
   * Check if user meets criteria for a specific badge
   */
  async checkBadgeCriteria(userId: string, badgeType: BadgeType): Promise<boolean> {
    // Check if already has badge
    const badge = await prisma.badge.findUnique({
      where: { type: badgeType },
    });

    if (!badge) return false;

    const existing = await prisma.userBadge.findFirst({
      where: { 
        userId, 
        badgeId: badge.id,
      },
    });

    if (existing) return false;

    switch (badgeType) {
      case BadgeType.EXPLORER:
        return this.checkExplorerBadge(userId);
      
      case BadgeType.CONNECTOR:
        return this.checkConnectorBadge(userId);
      
      case BadgeType.HOST_MASTER:
        return this.checkHostMasterBadge(userId);
      
      case BadgeType.TRUSTED_MEMBER:
        return this.checkTrustedMemberBadge(userId);
      
      case BadgeType.COMMUNITY_BUILDER:
        return this.checkCommunityBuilderBadge(userId);
      
      case BadgeType.SERVICE_STAR:
        return this.checkServiceStarBadge(userId);
      
      case BadgeType.EARLY_ADOPTER:
        return this.checkEarlyAdopterBadge(userId);
      
      case BadgeType.GLOBAL_CITIZEN:
        return this.checkGlobalCitizenBadge(userId);
      
      default:
        return false;
    }
  }

  /**
   * 🌍 EXPLORER: Visit and log 5+ countries in Travel Logbook
   */
  private async checkExplorerBadge(userId: string): Promise<boolean> {
    // Check user's travel logbook entries
    const travelEntries = await prisma.$queryRaw<any[]>`
      SELECT DISTINCT country 
      FROM travel_logbook 
      WHERE user_id = ${userId}
    `;
    
    return travelEntries.length >= 5;
  }

  /**
   * 🤝 CONNECTOR: Connect 10+ friends on Berse App
   */
  private async checkConnectorBadge(userId: string): Promise<boolean> {
    const connectionCount = await prisma.userConnection.count({
      where: {
        OR: [
          { initiatorId: userId, status: 'ACCEPTED' },
          { receiverId: userId, status: 'ACCEPTED' },
        ],
      },
    });
    
    return connectionCount >= 10;
  }

  /**
   * 🎤 HOST MASTER: Host 5+ events with good feedback (4.0+ avg rating)
   */
  private async checkHostMasterBadge(userId: string): Promise<boolean> {
    const hostedEvents = await prisma.event.findMany({
      where: {
        hostId: userId,
        status: 'COMPLETED',
      },
    });

    if (hostedEvents.length < 5) return false;

    // Get trust moments (ratings) for hosted events
    const eventIds = hostedEvents.map(e => e.id);
    const trustMoments = await prisma.trustMoment.findMany({
      where: {
        eventId: { in: eventIds },
        rating: { not: null },
      },
    });

    if (trustMoments.length === 0) return false;

    // Calculate average rating
    const totalRating = trustMoments.reduce((sum, tm) => sum + (tm.rating || 0), 0);
    const avgRating = totalRating / trustMoments.length;

    return hostedEvents.length >= 5 && avgRating >= 4.0;
  }

  /**
   * 💎 TRUSTED MEMBER: Reach 80+ trust score
   */
  private async checkTrustedMemberBadge(userId: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { trustScore: true },
    });

    return (user?.trustScore || 0) >= 80;
  }

  /**
   * 👥 COMMUNITY BUILDER: Create or help manage an active community
   */
  private async checkCommunityBuilderBadge(userId: string): Promise<boolean> {
    // Option 1: Created a community with 10+ members
    const createdCommunities = await prisma.community.findMany({
      where: {
        createdById: userId,
      },
      include: {
        _count: {
          select: { communityMembers: true },
        },
      },
    });

    const hasActiveCommunity = createdCommunities.some(
      (comm) => comm._count.communityMembers >= 10
    );

    if (hasActiveCommunity) return true;

    // Option 2: Moderator for 30+ days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const moderatorRoles = await prisma.communityMember.findMany({
      where: {
        userId,
        role: { in: ['MODERATOR', 'ADMIN'] },
        joinedAt: {
          lte: thirtyDaysAgo,
        },
      },
    });

    return moderatorRoles.length > 0;
  }

  /**
   * ⭐ SERVICE STAR: Get 4.5+ star rating across 20+ services
   */
  private async checkServiceStarBadge(userId: string): Promise<boolean> {
    // Aggregate ratings from all service types
    const services = await prisma.$queryRaw<any[]>`
      SELECT 
        AVG(rating) as avg_rating,
        COUNT(*) as total_services
      FROM (
        -- Marketplace reviews (as seller)
        SELECT rating FROM marketplace_reviews WHERE seller_id = ${userId}
        UNION ALL
        -- Connection reviews (as reviewee)
        SELECT rating FROM connection_reviews WHERE reviewee_id = ${userId}
        UNION ALL
        -- Trust moments with ratings
        SELECT rating FROM trust_moments WHERE created_by = ${userId} AND rating IS NOT NULL
      ) as all_ratings
    `;

    if (!services || services.length === 0) return false;

    const result = services[0];
    return result.total_services >= 20 && parseFloat(result.avg_rating) >= 4.5;
  }

  /**
   * 🚀 EARLY ADOPTER: Join Berse in the first 1,000 users
   */
  private async checkEarlyAdopterBadge(userId: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { createdAt: true },
    });

    if (!user) return false;

    // Count users created before this user
    const usersBefore = await prisma.user.count({
      where: {
        createdAt: {
          lt: user.createdAt,
        },
      },
    });

    return usersBefore < 1000;
  }

  /**
   * 🌏 GLOBAL CITIZEN: Have connections on 5+ continents
   */
  private async checkGlobalCitizenBadge(userId: string): Promise<boolean> {
    // Get all connections
    const connections = await prisma.userConnection.findMany({
      where: {
        OR: [
          { initiatorId: userId, status: 'ACCEPTED' },
          { receiverId: userId, status: 'ACCEPTED' },
        ],
      },
    });

    // Get user IDs of all connected users
    const connectedUserIds = connections.map((conn) =>
      conn.initiatorId === userId ? conn.receiverId : conn.initiatorId
    );

    if (connectedUserIds.length === 0) return false;

    // Get locations for all connected users
    const locations = await prisma.userLocation.findMany({
      where: {
        userId: { in: connectedUserIds },
        countryOfResidence: { not: null },
      },
      select: { countryOfResidence: true },
    });

    // Map countries to continents
    const continents = new Set<string>();

    for (const loc of locations) {
      if (loc.countryOfResidence) {
        const continent = this.getContinent(loc.countryOfResidence);
        if (continent) continents.add(continent);
      }
    }

    return continents.size >= 5;
  }

  /**
   * Map country to continent
   */
  private getContinent(country: string): string | null {
    const continentMap: Record<string, string> = {
      // Africa
      'Nigeria': 'Africa', 'Egypt': 'Africa', 'South Africa': 'Africa', 'Kenya': 'Africa',
      'Ghana': 'Africa', 'Morocco': 'Africa', 'Ethiopia': 'Africa', 'Tanzania': 'Africa',
      
      // Asia
      'China': 'Asia', 'India': 'Asia', 'Japan': 'Asia', 'South Korea': 'Asia',
      'Indonesia': 'Asia', 'Malaysia': 'Asia', 'Singapore': 'Asia', 'Thailand': 'Asia',
      'Philippines': 'Asia', 'Vietnam': 'Asia', 'Pakistan': 'Asia', 'Bangladesh': 'Asia',
      
      // Europe
      'United Kingdom': 'Europe', 'Germany': 'Europe', 'France': 'Europe', 'Italy': 'Europe',
      'Spain': 'Europe', 'Netherlands': 'Europe', 'Sweden': 'Europe', 'Poland': 'Europe',
      
      // North America
      'United States': 'North America', 'Canada': 'North America', 'Mexico': 'North America',
      
      // South America
      'Brazil': 'South America', 'Argentina': 'South America', 'Chile': 'South America',
      'Colombia': 'South America', 'Peru': 'South America',
      
      // Oceania
      'Australia': 'Oceania', 'New Zealand': 'Oceania', 'Fiji': 'Oceania',
    };

    return continentMap[country] || null;
  }

  /**
   * Award badge to user
   */
  private async awardBadge(userId: string, badgeType: BadgeType): Promise<boolean> {
    try {
      const badge = await prisma.badge.findUnique({
        where: { type: badgeType },
      });

      if (!badge) return false;

      // Check if already has badge
      const existing = await prisma.userBadge.findFirst({
        where: { 
          userId, 
          badgeId: badge.id,
        },
      });

      if (existing) return false;

      // Award badge
      await prisma.userBadge.create({
        data: {
          userId,
          badgeId: badge.id,
          earnedAt: new Date(),
        },
      });

      // Award points if applicable (note: User model doesn't have points field in schema)
      // This would need to be added to the User model or tracked separately
      // Commenting out for now:
      // if (badge.points > 0) {
      //   await prisma.user.update({
      //     where: { id: userId },
      //     data: {
      //       points: { increment: badge.points },
      //     },
      //   });
      // }

      console.log(`🏆 Awarded badge ${badge.name} to user ${userId}`);
      return true;
    } catch (error) {
      console.error(`Error awarding badge ${badgeType} to user ${userId}:`, error);
      return false;
    }
  }

  /**
   * Check a specific badge type for a user
   */
  async checkSpecificBadge(userId: string, badgeType: BadgeType): Promise<boolean> {
    const hasEarned = await this.checkBadgeCriteria(userId, badgeType);
    
    if (hasEarned) {
      return this.awardBadge(userId, badgeType);
    }
    
    return false;
  }
}

export default new BadgeCheckerService();
