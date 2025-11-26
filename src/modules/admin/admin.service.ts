import prisma from '../../config/database';
import { emailService } from '../../services/email.service';
import { getProfilePictureUrl, getImageUrl } from '../../utils/image.helpers';

export class AdminService {
  /**
   * Get comprehensive dashboard statistics
   */
  async getDashboardStats() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    // User statistics with detailed breakdowns
    const [
      totalUsers,
      activeUsers,
      newUsersLast30Days,
      newUsersLast7Days,
      adminCount,
      moderatorCount,
      guideCount,
      usersByStatus,
      usersByTrustLevel,
      emailVerifiedCount,
    ] = await Promise.all([
      prisma.user.count({
        where: { deletedAt: null },
      }),
      prisma.user.count({
        where: {
          deletedAt: null,
          security: {
            lastSeenAt: { gte: thirtyDaysAgo },
          },
        },
      }),
      prisma.user.count({
        where: {
          createdAt: { gte: thirtyDaysAgo },
          deletedAt: null,
        },
      }),
      prisma.user.count({
        where: {
          createdAt: { gte: sevenDaysAgo },
          deletedAt: null,
        },
      }),
      prisma.user.count({
        where: { role: 'ADMIN', deletedAt: null },
      }),
      prisma.user.count({
        where: { role: 'MODERATOR', deletedAt: null },
      }),
      prisma.user.count({
        where: { role: 'GUIDE', deletedAt: null },
      }),
      prisma.user.groupBy({
        by: ['status'],
        where: { deletedAt: null },
        _count: true,
      }),
      prisma.user.groupBy({
        by: ['trustLevel'],
        where: { deletedAt: null },
        _count: true,
      }),
      prisma.user.count({
        where: {
          deletedAt: null,
          security: {
            emailVerifiedAt: { not: null },
          },
        },
      }),
    ]);

    // Get user signups by day for the last 30 days (for chart)
    const userSignupsByDay = await this.getUserSignupsByDay(30);

    // Community statistics with more details
    const [
      totalCommunities,
      activeCommunities,
      newCommunitiesLast30Days,
      communityGrowthByDay,
    ] = await Promise.all([
      prisma.community.count({
        where: { deletedAt: null },
      }),
      prisma.community.count({
        where: {
          deletedAt: null,
          updatedAt: { gte: thirtyDaysAgo },
        },
      }),
      prisma.community.count({
        where: {
          createdAt: { gte: thirtyDaysAgo },
          deletedAt: null },
      }),
      this.getCommunityGrowthByDay(30),
    ]);

    // Event statistics with detailed breakdowns
    const [
      totalEvents,
      upcomingEvents,
      pastEvents,
      newEventsLast30Days,
      paidEvents,
      freeEvents,
      eventsByType,
      eventsGrowthByDay,
      totalEventRevenue,
    ] = await Promise.all([
      prisma.event.count({
        where: { deletedAt: null },
      }),
      prisma.event.count({
        where: {
          date: { gte: now },
          deletedAt: null,
        },
      }),
      prisma.event.count({
        where: {
          date: { lt: now },
          deletedAt: null,
        },
      }),
      prisma.event.count({
        where: {
          createdAt: { gte: thirtyDaysAgo },
          deletedAt: null,
        },
      }),
      prisma.event.count({
        where: { isFree: false, deletedAt: null },
      }),
      prisma.event.count({
        where: { isFree: true, deletedAt: null },
      }),
      prisma.event.groupBy({
        by: ['type'],
        where: { deletedAt: null },
        _count: true,
      }),
      this.getEventsGrowthByDay(30),
      prisma.eventTicket.aggregate({
        _sum: {
          price: true,
        },
      }),
    ]);

    // Marketplace statistics
    const [
      totalListings,
      activeListings,
      soldListings,
      newListingsLast30Days,
    ] = await Promise.all([
      prisma.marketplaceListing.count(),
      prisma.marketplaceListing.count({
        where: {
          status: 'ACTIVE',
        },
      }),
      prisma.marketplaceListing.count({
        where: {
          status: 'SOLD',
        },
      }),
      prisma.marketplaceListing.count({
        where: {
          createdAt: { gte: thirtyDaysAgo },
        },
      }),
    ]);

    // Gamification statistics
    const [
      totalPoints,
      totalBadges,
      totalRewards,
      totalVouches,
    ] = await Promise.all([
      prisma.user.aggregate({
        _sum: { totalPoints: true },
        where: { deletedAt: null },
      }),
      prisma.badge.count(),
      prisma.reward.count(),
      prisma.vouch.count({
        where: { status: 'ACTIVE' },
      }),
    ]);

    // Engagement metrics
    const [
      totalEventParticipants,
      totalCommunityMembers,
      totalConnections,
    ] = await Promise.all([
      prisma.eventParticipant.count(),
      prisma.communityMember.count({
        where: { isApproved: true },
      }),
      prisma.userConnection.count({
        where: { status: 'ACCEPTED' },
      }),
    ]);

    // Format status breakdown
    const statusBreakdown: Record<string, number> = {};
    usersByStatus.forEach(item => {
      statusBreakdown[item.status.toLowerCase()] = item._count;
    });

    // Format trust level breakdown
    const trustLevelBreakdown: Record<string, number> = {};
    usersByTrustLevel.forEach(item => {
      trustLevelBreakdown[item.trustLevel.toLowerCase()] = item._count;
    });

    // Format event type breakdown
    const eventTypeBreakdown: Record<string, number> = {};
    eventsByType.forEach(item => {
      eventTypeBreakdown[item.type.toLowerCase()] = item._count;
    });

    return {
      // High-level overview cards
      overview: {
        totalUsers,
        totalCommunities,
        totalEvents,
        totalListings,
      },

      // Detailed user statistics
      users: {
        total: totalUsers,
        active: activeUsers,
        inactive: totalUsers - activeUsers,
        newLast30Days: newUsersLast30Days,
        newLast7Days: newUsersLast7Days,
        growthRate: totalUsers > 0 ? ((newUsersLast30Days / totalUsers) * 100).toFixed(2) : '0',
        byRole: {
          admin: adminCount,
          moderator: moderatorCount,
          guide: guideCount,
          generalUser: totalUsers - adminCount - moderatorCount - guideCount,
        },
        byStatus: statusBreakdown,
        byTrustLevel: trustLevelBreakdown,
        verification: {
          emailVerified: emailVerifiedCount,
          emailUnverified: totalUsers - emailVerifiedCount,
          verificationRate: totalUsers > 0 ? ((emailVerifiedCount / totalUsers) * 100).toFixed(2) : '0',
        },
        chartData: {
          signupsByDay: userSignupsByDay,
        },
      },

      // Detailed community statistics
      communities: {
        total: totalCommunities,
        active: activeCommunities,
        inactive: totalCommunities - activeCommunities,
        newLast30Days: newCommunitiesLast30Days,
        growthRate: totalCommunities > 0 ? ((newCommunitiesLast30Days / totalCommunities) * 100).toFixed(2) : '0',
        totalMembers: totalCommunityMembers,
        avgMembersPerCommunity: totalCommunities > 0 ? (totalCommunityMembers / totalCommunities).toFixed(2) : '0',
        chartData: {
          growthByDay: communityGrowthByDay,
        },
      },

      // Detailed event statistics
      events: {
        total: totalEvents,
        upcoming: upcomingEvents,
        past: pastEvents,
        ongoing: totalEvents - upcomingEvents - pastEvents,
        newLast30Days: newEventsLast30Days,
        growthRate: totalEvents > 0 ? ((newEventsLast30Days / totalEvents) * 100).toFixed(2) : '0',
        byType: eventTypeBreakdown,
        byPricing: {
          paid: paidEvents,
          free: freeEvents,
        },
        participation: {
          totalParticipants: totalEventParticipants,
          avgParticipantsPerEvent: totalEvents > 0 ? (totalEventParticipants / totalEvents).toFixed(2) : '0',
        },
        revenue: {
          total: totalEventRevenue._sum.price || 0,
          currency: 'MYR',
        },
        chartData: {
          creationsByDay: eventsGrowthByDay,
        },
      },

      // Marketplace statistics
      marketplace: {
        total: totalListings,
        active: activeListings,
        sold: soldListings,
        inactive: totalListings - activeListings - soldListings,
        newLast30Days: newListingsLast30Days,
        growthRate: totalListings > 0 ? ((newListingsLast30Days / totalListings) * 100).toFixed(2) : '0',
        conversionRate: totalListings > 0 ? ((soldListings / totalListings) * 100).toFixed(2) : '0',
      },

      // Gamification statistics
      gamification: {
        totalPointsDistributed: totalPoints._sum.totalPoints || 0,
        totalBadges,
        totalRewards,
        totalVouches,
        avgPointsPerUser: totalUsers > 0 ? ((totalPoints._sum.totalPoints || 0) / totalUsers).toFixed(2) : '0',
      },

      // Overall engagement metrics
      engagement: {
        connections: {
          total: totalConnections,
        },
        vouches: {
          total: totalVouches,
        },
        averages: {
          communitiesPerUser: totalUsers > 0 ? (totalCommunityMembers / totalUsers).toFixed(2) : '0',
          eventsPerUser: totalUsers > 0 ? (totalEventParticipants / totalUsers).toFixed(2) : '0',
        },
      },

      // Recent platform activities
      recentActivities: await this.getRecentActivities(),
    };
  }

  /**
   * Get user signups by day for charts
   */
  private async getUserSignupsByDay(days: number) {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    const signups = await prisma.user.findMany({
      where: {
        createdAt: { gte: startDate },
        deletedAt: null,
      },
      select: {
        createdAt: true,
      },
    });

    // Group by day
    const signupsByDay: Record<string, number> = {};
    
    signups.forEach(user => {
      const dateKey = user.createdAt.toISOString().split('T')[0];
      signupsByDay[dateKey] = (signupsByDay[dateKey] || 0) + 1;
    });

    // Fill in missing days with 0
    const result = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const dateKey = date.toISOString().split('T')[0];
      result.push({
        date: dateKey,
        count: signupsByDay[dateKey] || 0,
      });
    }

    return result;
  }

  /**
   * Get community growth by day for charts
   */
  private async getCommunityGrowthByDay(days: number) {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    const communities = await prisma.community.findMany({
      where: {
        createdAt: { gte: startDate },
        deletedAt: null,
      },
      select: {
        createdAt: true,
      },
    });

    // Group by day
    const communitiesByDay: Record<string, number> = {};
    
    communities.forEach(community => {
      const dateKey = community.createdAt.toISOString().split('T')[0];
      communitiesByDay[dateKey] = (communitiesByDay[dateKey] || 0) + 1;
    });

    // Fill in missing days with 0
    const result = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const dateKey = date.toISOString().split('T')[0];
      result.push({
        date: dateKey,
        count: communitiesByDay[dateKey] || 0,
      });
    }

    return result;
  }

  /**
   * Get events growth by day for charts
   */
  private async getEventsGrowthByDay(days: number) {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    const events = await prisma.event.findMany({
      where: {
        createdAt: { gte: startDate },
        deletedAt: null,
      },
      select: {
        createdAt: true,
      },
    });

    // Group by day
    const eventsByDay: Record<string, number> = {};
    
    events.forEach(event => {
      const dateKey = event.createdAt.toISOString().split('T')[0];
      eventsByDay[dateKey] = (eventsByDay[dateKey] || 0) + 1;
    });

    // Fill in missing days with 0
    const result = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const dateKey = date.toISOString().split('T')[0];
      result.push({
        date: dateKey,
        count: eventsByDay[dateKey] || 0,
      });
    }

    return result;
  }

  /**
   * Get recent platform activities
   */
  async getRecentActivities() {
    const limit = 50;
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [
      recentUsers,
      recentCommunities,
      recentEvents,
      recentListings,
      recentVouches,
    ] = await Promise.all([
      // Recent user signups
      prisma.user.findMany({
        where: {
          createdAt: { gte: sevenDaysAgo },
          deletedAt: null,
        },
        select: {
          id: true,
          fullName: true,
          email: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      // Recent communities
      prisma.community.findMany({
        where: {
          createdAt: { gte: sevenDaysAgo },
          deletedAt: null,
        },
        select: {
          id: true,
          name: true,
          createdAt: true,
          user: {
            select: {
              fullName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      // Recent events
      prisma.event.findMany({
        where: {
          createdAt: { gte: sevenDaysAgo },
          deletedAt: null,
        },
        select: {
          id: true,
          title: true,
          date: true,
          createdAt: true,
          hostId: true,
          user: {
            select: {
              fullName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      // Recent marketplace listings
      prisma.marketplaceListing.findMany({
        where: {
          createdAt: { gte: sevenDaysAgo },
        },
        select: {
          id: true,
          title: true,
          createdAt: true,
          user: {
            select: {
              fullName: true,
            },
          },
          pricingOptions: {
            select: {
              price: true,
              currency: true,
            },
            take: 1,
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      // Recent vouches
      prisma.vouch.findMany({
        where: {
          createdAt: { gte: sevenDaysAgo },
          status: 'ACTIVE',
        },
        select: {
          id: true,
          createdAt: true,
          users_vouches_voucherIdTousers: {
            select: {
              fullName: true,
            },
          },
          users_vouches_voucheeIdTousers: {
            select: {
              fullName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    // Combine and sort all activities by date
    const activities: Array<{
      type: string;
      timestamp: Date;
      description: string;
      entityId: string;
      user?: string;
    }> = [];

    recentUsers.forEach(user => {
      activities.push({
        type: 'user_signup',
        timestamp: user.createdAt,
        description: `${user.fullName} signed up`,
        entityId: user.id,
        user: user.fullName,
      });
    });

    recentCommunities.forEach(community => {
      activities.push({
        type: 'community_created',
        timestamp: community.createdAt,
        description: `${community.user.fullName} created community "${community.name}"`,
        entityId: community.id,
        user: community.user.fullName,
      });
    });

    recentEvents.forEach(event => {
      activities.push({
        type: 'event_created',
        timestamp: event.createdAt,
        description: `${event.user.fullName} created event "${event.title}"`,
        entityId: event.id,
        user: event.user.fullName,
      });
    });

    recentListings.forEach(listing => {
      const price = listing.pricingOptions[0]?.price || 0;
      const currency = listing.pricingOptions[0]?.currency || 'MYR';
      activities.push({
        type: 'listing_created',
        timestamp: listing.createdAt,
        description: `${listing.user.fullName} listed "${listing.title}"${price > 0 ? ` for ${currency} ${price}` : ''}`,
        entityId: listing.id,
        user: listing.user.fullName,
      });
    });

    recentVouches.forEach(vouch => {
      activities.push({
        type: 'vouch_given',
        timestamp: vouch.createdAt,
        description: `${vouch.users_vouches_voucherIdTousers.fullName} vouched for ${vouch.users_vouches_voucheeIdTousers.fullName}`,
        entityId: vouch.id,
        user: vouch.users_vouches_voucherIdTousers.fullName,
      });
    });

    // Sort by timestamp (most recent first) and limit to 50
    return activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit)
      .map(activity => ({
        ...activity,
        timestamp: activity.timestamp.toISOString(),
      }));
  }

  /**
   * Get detailed user statistics
   */
  async getUserStats() {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [
      usersByRole,
      usersByStatus,
      usersByTrustLevel,
      recentSignups,
      topUsersByPoints,
    ] = await Promise.all([
      prisma.user.groupBy({
        by: ['role'],
        _count: true,
        where: { deletedAt: null },
      }),
      prisma.user.groupBy({
        by: ['status'],
        _count: true,
        where: { deletedAt: null },
      }),
      prisma.user.groupBy({
        by: ['trustLevel'],
        _count: true,
        where: { deletedAt: null },
      }),
      prisma.user.findMany({
        where: {
          createdAt: { gte: thirtyDaysAgo },
          deletedAt: null,
        },
        select: {
          id: true,
          fullName: true,
          email: true,
          createdAt: true,
          role: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      prisma.user.findMany({
        where: { deletedAt: null },
        select: {
          id: true,
          fullName: true,
          username: true,
          totalPoints: true,
          trustScore: true,
        },
        orderBy: { totalPoints: 'desc' },
        take: 10,
      }),
    ]);

    return {
      byRole: usersByRole,
      byStatus: usersByStatus,
      byTrustLevel: usersByTrustLevel,
      recentSignups,
      topUsers: topUsersByPoints,
    };
  }

  /**
   * Get detailed community statistics
   */
  async getCommunityStats() {
    const [
      topCommunities,
      recentCommunities,
    ] = await Promise.all([
      prisma.community.findMany({
        where: { deletedAt: null },
        select: {
          id: true,
          name: true,
          logoUrl: true,
          _count: {
            select: {
              communityMembers: true,
              events: true,
            },
          },
        },
        orderBy: {
          communityMembers: {
            _count: 'desc',
          },
        },
        take: 10,
      }),
      prisma.community.findMany({
        where: { deletedAt: null },
        select: {
          id: true,
          name: true,
          logoUrl: true,
          createdAt: true,
          _count: {
            select: {
              communityMembers: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    return {
      topCommunities: topCommunities.map(c => ({
        id: c.id,
        name: c.name,
        logoUrl: c.logoUrl,
        memberCount: c._count.communityMembers,
        eventCount: c._count.events,
      })),
      recentCommunities: recentCommunities.map(c => ({
        id: c.id,
        name: c.name,
        logoUrl: c.logoUrl,
        createdAt: c.createdAt,
        memberCount: c._count.communityMembers,
      })),
    };
  }

  /**
   * Get paginated list of communities with filters
   */
  async getCommunities(params: {
    page: number;
    limit: number;
    search?: string;
    category?: string;
    city?: string;
    country?: string;
    isVerified?: boolean;
    sortBy?: string;
    sortOrder?: string;
  }) {
    const { page, limit, search, category, city, country, isVerified, sortBy = 'createdAt', sortOrder = 'desc' } = params;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.category = category;
    }

    if (city) {
      where.city = { contains: city, mode: 'insensitive' };
    }

    if (country) {
      where.country = { contains: country, mode: 'insensitive' };
    }

    if (isVerified !== undefined) {
      where.isVerified = isVerified;
    }

    // Get total count, communities, and summary stats
    const [total, communities, verifiedCount] = await Promise.all([
      prisma.community.count({ where }),
      prisma.community.findMany({
        where,
        select: {
          id: true,
          name: true,
          description: true,
          logoUrl: true,
          coverImageUrl: true,
          interests: true,
          city: true,
          country: true,
          isVerified: true,
          requiresApproval: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              id: true,
              fullName: true,
              profile: {
                select: {
                  profilePicture: true,
                },
              },
            },
          },
          _count: {
            select: {
              communityMembers: true,
              events: true,
            },
          },
          communityMembers: {
            where: {
              isApproved: false,
            },
            select: {
              id: true,
            },
          },
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip,
        take: limit,
      }),
      prisma.community.count({
        where: { ...where, isVerified: true },
      }),
    ]);

    const formattedCommunities = communities.map(community => ({
      id: community.id,
      name: community.name,
      description: community.description,
      logoUrl: getImageUrl(community.logoUrl),
      coverImageUrl: getImageUrl(community.coverImageUrl),
      interests: community.interests,
      city: community.city,
      country: community.country,
      location: community.city && community.country ? `${community.city}, ${community.country}` : community.city || community.country || null,
      isVerified: community.isVerified,
      requiresApproval: community.requiresApproval,
      memberCount: community._count.communityMembers,
      pendingMembersCount: community.communityMembers.length,
      eventCount: community._count.events,
      createdBy: {
        id: community.user.id,
        fullName: community.user.fullName,
        profilePicture: getProfilePictureUrl(community.user.profile?.profilePicture),
      },
      createdAt: community.createdAt,
      updatedAt: community.updatedAt,
    }));

    return {
      communities: formattedCommunities,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      summary: {
        total,
        verified: verifiedCount,
        unverified: total - verifiedCount,
      },
    };
  }

  /**
   * Get detailed community information by ID organized in tabs
   */
  async getCommunityById(communityId: string) {
    const community = await prisma.community.findUnique({
      where: { id: communityId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            profile: {
              select: {
                profilePicture: true,
              },
            },
          },
        },
        _count: {
          select: {
            communityMembers: true,
            events: true,
            vouchOffers: true,
          },
        },
      },
    });

    if (!community) {
      throw new Error('Community not found');
    }

    // Get members with roles
    const members = await prisma.communityMember.findMany({
      where: { communityId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            profile: {
              select: {
                profilePicture: true,
              },
            },
          },
        },
      },
      orderBy: { joinedAt: 'desc' },
      take: 100,
    });

    // Get pending join requests
    const pendingRequests = await prisma.communityMember.findMany({
      where: {
        communityId,
        isApproved: false,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            username: true,
            role: true,
            status: true,
            trustLevel: true,
            createdAt: true,
            location: {
              select: {
                currentCity: true,
                countryOfResidence: true,
              },
            },
            profile: {
              select: {
                profilePicture: true,
                bio: true,
                shortBio: true,
                profession: true,
                interests: true,
                languages: true,
              },
            },
            security: {
              select: {
                emailVerifiedAt: true,
              },
            },
          },
        },
      },
      orderBy: { joinedAt: 'desc' },
      take: 50,
    }) as any;

    // Get community events
    const events = await prisma.event.findMany({
      where: { communityId },
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        status: true,
        hostType: true,
        date: true,
        startDate: true,
        endDate: true,
        startTime: true,
        endTime: true,
        location: true,
        city: true,
        country: true,
        images: true,
        isFree: true,
        maxAttendees: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        _count: {
          select: {
            eventParticipants: true,
          },
        },
      },
      orderBy: { date: 'desc' },
      take: 50,
    });

    // Get activity log
    const activityLog = await prisma.userActivity.findMany({
      where: {
        entityType: 'community',
        entityId: communityId,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    // Count members by role
    const membersByRole = await prisma.communityMember.groupBy({
      by: ['role'],
      where: { communityId, isApproved: true },
      _count: true,
    });

    const roleBreakdown: Record<string, number> = {};
    membersByRole.forEach(item => {
      roleBreakdown[item.role.toLowerCase()] = item._count;
    });

    // Return data organized in tabs
    return {
      // Tab 1: Overview
      overview: {
        basicInfo: {
          id: community.id,
          name: community.name,
          description: community.description,
          logoUrl: getImageUrl(community.logoUrl),
          coverImageUrl: getImageUrl(community.coverImageUrl),
          interests: community.interests,
          isVerified: community.isVerified,
          requiresApproval: community.requiresApproval,
          createdAt: community.createdAt,
          updatedAt: community.updatedAt,
        },
        location: {
          city: community.city,
          country: community.country,
          latitude: community.latitude,
          longitude: community.longitude,
        },
        creator: {
          id: community.user.id,
          fullName: community.user.fullName,
          email: community.user.email,
          profilePicture: getProfilePictureUrl(community.user.profile?.profilePicture),
        },
        stats: {
          totalMembers: community._count.communityMembers,
          totalEvents: community._count.events,
          pendingRequests: pendingRequests.length,
          vouchOffers: community._count.vouchOffers,
        },
        contact: {
          guidelines: community.guidelines,
          websiteUrl: community.websiteUrl,
          contactEmail: community.contactEmail,
          socialLinks: community.socialLinks,
        },
      },

      // Tab 2: Members
      members: {
        total: members.length,
        approved: members.filter(m => m.isApproved).length,
        pending: pendingRequests.length,
        byRole: roleBreakdown,
        list: members.map(m => ({
          id: m.id,
          userId: m.user.id,
          fullName: m.user.fullName,
          email: m.user.email,
          profilePicture: getProfilePictureUrl(m.user.profile?.profilePicture),
          role: m.role,
          joinedAt: m.joinedAt,
          isApproved: m.isApproved,
          joinMessage: m.joinMessage,
        })),
      },

      // Tab 3: Pending Requests
      pendingRequests: {
        total: pendingRequests.length,
        list: pendingRequests.map((m: any) => ({
          id: m.id,
          userId: m.user.id,
          fullName: m.user.fullName,
          username: m.user.username,
          email: m.user.email,
          profilePicture: getProfilePictureUrl(m.user.profile?.profilePicture),
          role: m.user.role,
          status: m.user.status,
          trustLevel: m.user.trustLevel,
          emailVerified: !!m.user.security?.emailVerifiedAt,
          location: {
            city: m.user.location?.currentCity,
            country: m.user.location?.countryOfResidence,
            display: [m.user.location?.currentCity, m.user.location?.countryOfResidence].filter(Boolean).join(', ') || null,
          },
          profile: {
            bio: m.user.profile?.bio,
            shortBio: m.user.profile?.shortBio,
            profession: m.user.profile?.profession,
            interests: m.user.profile?.interests || [],
            languages: m.user.profile?.languages || [],
          },
          memberSince: m.user.createdAt,
          joinMessage: m.joinMessage,
          requestedAt: m.joinedAt,
          requestedRole: m.role,
        })),
      },

      // Tab 4: Events
      events: {
        total: events.length,
        upcoming: events.filter(e => new Date(e.date) >= new Date()).length,
        past: events.filter(e => new Date(e.date) < new Date()).length,
        list: events.map(e => ({
          id: e.id,
          title: e.title,
          description: e.description,
          type: e.type,
          status: e.status,
          hostType: e.hostType,
          imageUrl: e.images?.[0] ? getImageUrl(e.images[0]) : null,
          images: e.images?.map(img => getImageUrl(img)) || [],
          date: e.date,
          startDate: e.startDate,
          endDate: e.endDate,
          startTime: e.startTime,
          endTime: e.endTime,
          location: e.location,
          city: e.city,
          country: e.country,
          locationDisplay: [e.location, e.city, e.country].filter(Boolean).join(', '),
          isFree: e.isFree,
          maxAttendees: e.maxAttendees,
          participantCount: e._count.eventParticipants,
          participants: {
            current: e._count.eventParticipants,
            max: e.maxAttendees,
            display: e.maxAttendees 
              ? `${e._count.eventParticipants}/${e.maxAttendees}`
              : `${e._count.eventParticipants}`,
          },
          host: {
            id: e.user.id,
            name: e.user.fullName,
            email: e.user.email,
          },
          createdAt: e.createdAt,
          updatedAt: e.updatedAt,
        })),
      },

      // Tab 5: Activity Log
      activity: {
        total: activityLog.length,
        log: activityLog,
      },
    };
  }

  /**
   * Update community verification status
   */
  async verifyCommunity(communityId: string, isVerified: boolean, adminId: string) {
    const community = await prisma.community.findUnique({
      where: { id: communityId },
    });

    if (!community) {
      throw new Error('Community not found');
    }

    const updatedCommunity = await prisma.community.update({
      where: { id: communityId },
      data: { isVerified },
    });

    // Log the action
    await prisma.userActivity.create({
      data: {
        userId: adminId,
        activityType: isVerified ? 'community_verified' : 'community_unverified',
        entityType: 'community',
        entityId: communityId,
      },
    });

    return updatedCommunity;
  }

  /**
   * Soft delete a community
   */
  async deleteCommunity(communityId: string, reason: string, adminId: string) {
    const community = await prisma.community.findUnique({
      where: { id: communityId },
    });

    if (!community) {
      throw new Error('Community not found');
    }

    const updatedCommunity = await prisma.community.update({
      where: { id: communityId },
      data: {
        deletedAt: new Date(),
      },
    });

    // Log the action
    await prisma.userActivity.create({
      data: {
        userId: adminId,
        activityType: 'community_deleted',
        entityType: 'community',
        entityId: communityId,
      },
    });

    return {
      id: updatedCommunity.id,
      name: updatedCommunity.name,
      deletedAt: updatedCommunity.deletedAt,
    };
  }

  /**
   * Approve or reject a community join request
   */
  async approveCommunityJoinRequest(
    communityMemberId: string,
    isApproved: boolean,
    adminId: string
  ) {
    const member = await prisma.communityMember.findUnique({
      where: { id: communityMemberId },
      include: {
        communities: true,
        user: true,
      },
    });

    if (!member) {
      throw new Error('Community member request not found');
    }

    if (isApproved) {
      const updatedMember = await prisma.communityMember.update({
        where: { id: communityMemberId },
        data: { isApproved: true },
      });

      // Log the action
      await prisma.userActivity.create({
        data: {
          userId: member.userId,
          activityType: 'community_join_approved',
          entityType: 'community',
          entityId: member.communityId,
        },
      });

      return updatedMember;
    } else {
      // Reject and delete the request
      await prisma.communityMember.delete({
        where: { id: communityMemberId },
      });

      // Log the action
      await prisma.userActivity.create({
        data: {
          userId: member.userId,
          activityType: 'community_join_rejected',
          entityType: 'community',
          entityId: member.communityId,
        },
      });

      return { id: communityMemberId, status: 'rejected' };
    }
  }

  /**
   * Add admin notes to a community
   */
  async addCommunityNote(communityId: string, note: string, adminId: string) {
    const community = await prisma.community.findUnique({
      where: { id: communityId },
    });

    if (!community) {
      throw new Error('Community not found');
    }

    // Log the note as activity
    await prisma.userActivity.create({
      data: {
        userId: adminId,
        activityType: 'community_note_added',
        entityType: 'community',
        entityId: communityId,
      },
    });

    return { communityId, note, addedBy: adminId, addedAt: new Date() };
  }

  /**
   * Update community featured status
   */
  async updateCommunityFeatured(communityId: string, isFeatured: boolean, adminId: string) {
    const community = await prisma.community.findUnique({
      where: { id: communityId },
    });

    if (!community) {
      throw new Error('Community not found');
    }

    // Note: You may need to add isFeatured field to Community schema
    // For now, log it as activity
    await prisma.userActivity.create({
      data: {
        userId: adminId,
        activityType: isFeatured ? 'community_featured' : 'community_unfeatured',
        entityType: 'community',
        entityId: communityId,
      },
    });

    return { communityId, isFeatured, updatedBy: adminId };
  }

  /**
   * Send warning to community creator
   */
  async sendCommunityWarning(
    communityId: string,
    reason: string,
    message: string,
    adminId: string
  ) {
    const community = await prisma.community.findUnique({
      where: { id: communityId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    if (!community) {
      throw new Error('Community not found');
    }

    // Log the warning
    await prisma.userActivity.create({
      data: {
        userId: community.createdById,
        activityType: 'community_warning_sent',
        entityType: 'community',
        entityId: communityId,
      },
    });

    // Send email notification
    await emailService.sendEmail({
      to: community.user.email,
      subject: `Warning: Community "${community.name}" - ${reason}`,
      html: `
        <h2>Community Warning</h2>
        <p>Hello ${community.user.fullName},</p>
        <p>Your community <strong>${community.name}</strong> has received a warning from our moderation team.</p>
        <p><strong>Reason:</strong> ${reason}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
        <p>Please review our community guidelines and take appropriate action.</p>
        <p>If you have questions, please contact our support team.</p>
      `,
      text: `Community Warning\n\nHello ${community.user.fullName},\n\nYour community ${community.name} has received a warning from our moderation team.\n\nReason: ${reason}\n\nMessage:\n${message}\n\nPlease review our community guidelines and take appropriate action.\n\nIf you have questions, please contact our support team.`,
    });

    return {
      communityId,
      creatorId: community.createdById,
      reason,
      sentAt: new Date(),
    };
  }

  /**
   * Get detailed event statistics
   */
  async getEventStats() {
    const now = new Date();

    const [
      eventsByType,
      upcomingEvents,
      popularEvents,
    ] = await Promise.all([
      prisma.event.groupBy({
        by: ['isFree'],
        _count: true,
        where: { deletedAt: null },
      }),
      prisma.event.findMany({
        where: {
          date: { gte: now },
          deletedAt: null,
        },
        select: {
          id: true,
          title: true,
          date: true,
          isFree: true,
          _count: {
            select: {
              eventParticipants: true,
            },
          },
        },
        orderBy: { date: 'asc' },
        take: 10,
      }),
      prisma.event.findMany({
        where: { deletedAt: null },
        select: {
          id: true,
          title: true,
          date: true,
          isFree: true,
          _count: {
            select: {
              eventParticipants: true,
            },
          },
        },
        orderBy: {
          eventParticipants: {
            _count: 'desc',
          },
        },
        take: 10,
      }),
    ]);

    return {
      byType: eventsByType,
      upcomingEvents: upcomingEvents.map(e => ({
        id: e.id,
        title: e.title,
        date: e.date,
        isFree: e.isFree,
        participantCount: e._count.eventParticipants,
      })),
      popularEvents: popularEvents.map(e => ({
        id: e.id,
        title: e.title,
        date: e.date,
        isFree: e.isFree,
        participantCount: e._count.eventParticipants,
      })),
    };
  }

  /**
   * Get paginated users list with filters
   */
  async getUsers(params: {
    page: number;
    limit: number;
    search?: string;
    role?: string;
    status?: string;
    trustLevel?: string;
    sortBy?: string;
    sortOrder?: string;
  }) {
    const { page, limit, search, role, status, trustLevel, sortBy = 'createdAt', sortOrder = 'desc' } = params;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) {
      where.role = role;
    }

    if (status) {
      where.status = status;
    }

    if (trustLevel) {
      where.trustLevel = trustLevel;
    }

    // Get total count, users, and summary stats
    const [total, users, statusCounts, roleCounts, trustLevelCounts, verificationCounts] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        select: {
          id: true,
          fullName: true,
          email: true,
          username: true,
          role: true,
          status: true,
          trustLevel: true,
          trustScore: true,
          totalPoints: true,
          createdAt: true,
          updatedAt: true,
          profile: {
            select: {
              profilePicture: true,
            },
          },
          security: {
            select: {
              lastLoginAt: true,
              emailVerifiedAt: true,
            },
          },
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip,
        take: limit,
      }),
      // Status breakdown
      prisma.user.groupBy({
        by: ['status'],
        where,
        _count: true,
      }),
      // Role breakdown
      prisma.user.groupBy({
        by: ['role'],
        where,
        _count: true,
      }),
      // Trust level breakdown
      prisma.user.groupBy({
        by: ['trustLevel'],
        where,
        _count: true,
      }),
      // Email verification counts
      prisma.$transaction([
        prisma.user.count({
          where: {
            ...where,
            security: {
              emailVerifiedAt: { not: null },
            },
          },
        }),
        prisma.user.count({
          where: {
            ...where,
            security: {
              emailVerifiedAt: null,
            },
          },
        }),
      ]),
    ]);

    const formattedUsers = users.map(user => ({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      emailVerifiedAt: user.security?.emailVerifiedAt || null,
      profilePicture: getProfilePictureUrl(user.profile?.profilePicture),
      username: user.username,
      role: user.role,
      status: user.status,
      trustLevel: user.trustLevel,
      trustScore: user.trustScore,
      totalPoints: user.totalPoints,
      joinedAt: user.createdAt,
      lastActive: user.security?.lastLoginAt || null,
    }));

    // Format summary statistics
    const byStatus: Record<string, number> = {};
    statusCounts.forEach(item => {
      byStatus[item.status.toLowerCase()] = item._count;
    });

    const byRole: Record<string, number> = {};
    roleCounts.forEach(item => {
      byRole[item.role.toLowerCase()] = item._count;
    });

    const byTrustLevel: Record<string, number> = {};
    trustLevelCounts.forEach(item => {
      byTrustLevel[item.trustLevel.toLowerCase()] = item._count;
    });

    return {
      users: formattedUsers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      summary: {
        byStatus,
        byRole,
        byTrustLevel,
        verification: {
          emailVerified: verificationCounts[0],
          emailUnverified: verificationCounts[1],
        },
      },
    };
  }

  /**
   * Get detailed user information by ID organized in tabs
   */
  async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        security: true,
        privacy: true,
        stats: true,
        preferences: true,
        metadata: true,
        location: true,
        referralStats: true,
        _count: {
          select: {
            events: true,
            communities: true,
            communityMembers: true,
            eventParticipants: true,
            marketplaceListings: true,
            vouchesGiven: true,
            vouchesReceived: true,
            connectionsInitiated: true,
            connectionsReceived: true,
            pointHistories: true,
            userBadges: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Get connections
    const connections = await prisma.userConnection.findMany({
      where: {
        OR: [{ initiatorId: userId }, { receiverId: userId }],
        status: 'ACCEPTED',
      },
      select: {
        id: true,
        status: true,
        relationshipType: true,
        relationshipCategory: true,
        howWeMet: true,
        message: true,
        connectedAt: true,
        users_user_connections_initiatorIdTousers: {
          select: {
            id: true,
            fullName: true,
            trustScore: true,
            profile: { select: { profilePicture: true } },
          },
        },
        users_user_connections_receiverIdTousers: {
          select: {
            id: true,
            fullName: true,
            trustScore: true,
            profile: { select: { profilePicture: true } },
          },
        },
      },
      orderBy: { connectedAt: 'desc' },
      take: 50,
    });

    // Get communities
    const communities = await prisma.communityMember.findMany({
      where: { userId },
      include: {
        communities: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
            category: true,
            city: true,
            country: true,
            _count: {
              select: { communityMembers: true },
            },
          },
        },
      },
      orderBy: { joinedAt: 'desc' },
    });

    // Get events (hosted)
    const hostedEvents = await prisma.event.findMany({
      where: { hostId: userId },
      select: {
        id: true,
        title: true,
        type: true,
        status: true,
        date: true,
        location: true,
        isFree: true,
        _count: {
          select: { eventParticipants: true },
        },
      },
      orderBy: { date: 'desc' },
      take: 20,
    });

    // Get events (attended)
    const attendedEvents = await prisma.eventParticipant.findMany({
      where: { userId },
      select: {
        id: true,
        status: true,
        createdAt: true,
        checkedInAt: true,
        events: {
          select: {
            id: true,
            title: true,
            type: true,
            date: true,
            location: true,
            user: {
              select: { id: true, fullName: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    // Count services
    const berseGuideAsGuideCount = await prisma.berseGuideBooking.count({
      where: { guideId: userId },
    });
    const berseGuideAsBookerCount = await prisma.berseGuideBooking.count({
      where: { travelerId: userId },
    });
    const homeSurfAsHostCount = await prisma.homeSurfBooking.count({
      where: { hostId: userId },
    });
    const homeSurfAsGuestCount = await prisma.homeSurfBooking.count({
      where: { guestId: userId },
    });

    // Get vouches given and received
    const vouchesGiven = await prisma.vouch.findMany({
      where: { voucherId: userId },
      select: {
        id: true,
        vouchType: true,
        message: true,
        status: true,
        createdAt: true,
        users_vouches_voucheeIdTousers: {
          select: {
            id: true,
            fullName: true,
            profile: { select: { profilePicture: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    const vouchesReceived = await prisma.vouch.findMany({
      where: { voucheeId: userId },
      select: {
        id: true,
        vouchType: true,
        message: true,
        status: true,
        createdAt: true,
        users_vouches_voucherIdTousers: {
          select: {
            id: true,
            fullName: true,
            profile: { select: { profilePicture: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    // Get badges
    const badges = await prisma.userBadge.findMany({
      where: { userId },
      include: {
        badges: {
          select: {
            id: true,
            name: true,
            description: true,
            imageUrl: true,
            category: true,
          },
        },
      },
      orderBy: { earnedAt: 'desc' },
    });

    // Get point history
    const pointHistory = await prisma.pointHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    // Get recent activity log
    const activityLog = await prisma.userActivity.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    // Get moderation history
    const moderationHistory = await prisma.userActivity.findMany({
      where: {
        userId,
        activityType: {
          in: [
            'account_suspended',
            'account_activated',
            'account_verified',
            'account_banned',
            'account_warned',
          ],
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Format connections
    const formattedConnections = connections.map(conn => {
      const otherUser = conn.users_user_connections_initiatorIdTousers.id === userId
        ? conn.users_user_connections_receiverIdTousers
        : conn.users_user_connections_initiatorIdTousers;
      
      return {
        id: conn.id,
        user: {
          id: otherUser.id,
          fullName: otherUser.fullName,
          trustScore: otherUser.trustScore,
          profilePicture: getProfilePictureUrl(otherUser.profile?.profilePicture),
        },
        relationshipType: conn.relationshipType,
        relationshipCategory: conn.relationshipCategory,
        howWeMet: conn.howWeMet,
        message: conn.message,
        connectedAt: conn.connectedAt,
      };
    });

    // Return data organized in tabs
    return {
      // Basic user info (shown in header across all tabs)
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        username: user.username,
        role: user.role,
        status: user.status,
        trustLevel: user.trustLevel,
        trustScore: user.trustScore,
        totalPoints: user.totalPoints,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        profilePicture: user.profile?.profilePicture || null,
      },

      // Tab 1: Overview (Profile Details)
      overview: {
        basicInfo: {
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          dialCode: user.dialCode,
          username: user.username,
          role: user.role,
          status: user.status,
          trustLevel: user.trustLevel,
          trustScore: user.trustScore,
          joinedAt: user.createdAt,
          lastUpdated: user.updatedAt,
        },
        profile: {
          profilePicture: getProfilePictureUrl(user.profile?.profilePicture),
          bio: user.profile?.bio || null,
          displayName: user.profile?.displayName || null,
          dateOfBirth: user.profile?.dateOfBirth || null,
          gender: user.profile?.gender || null,
          languages: user.profile?.languages || [],
          interests: user.profile?.interests || [],
          profession: user.profile?.profession || null,
          website: user.profile?.website || null,
        },
        location: {
          currentCity: user.location?.currentCity || null,
          countryOfResidence: user.location?.countryOfResidence || null,
          timezone: user.location?.timezone || null,
          currentLocation: user.location?.currentLocation || null,
          latitude: user.location?.latitude || null,
          longitude: user.location?.longitude || null,
        },
        activitySummary: {
          totalPoints: user.totalPoints,
          pointsExpired: user.pointsExpired,
          pointsSpent: user.pointsSpent,
          eventsHosted: user._count.events,
          eventsAttended: user._count.eventParticipants,
          communitiesJoined: user._count.communityMembers,
          connectionsCount: user._count.connectionsInitiated + user._count.connectionsReceived,
          vouchesReceived: user._count.vouchesReceived,
          badgesEarned: user._count.userBadges,
        },
        verification: {
          emailVerified: !!user.security?.emailVerifiedAt,
          emailVerifiedAt: user.security?.emailVerifiedAt || null,
        },
        recentActivity: activityLog.slice(0, 10),
      },

      // Tab 2: Connections
      connections: {
        total: formattedConnections.length,
        list: formattedConnections,
      },

      // Tab 3: Vouches
      vouches: {
        given: vouchesGiven.map(v => ({
          id: v.id,
          voucherId: userId,
          voucheeId: v.users_vouches_voucheeIdTousers.id,
          vouchType: v.vouchType,
          message: v.message,
          status: v.status,
          createdAt: v.createdAt,
          vouchee: {
            id: v.users_vouches_voucheeIdTousers.id,
            fullName: v.users_vouches_voucheeIdTousers.fullName,
            profilePicture: getProfilePictureUrl(v.users_vouches_voucheeIdTousers.profile?.profilePicture),
          },
        })),
        received: vouchesReceived.map(v => ({
          id: v.id,
          voucherId: v.users_vouches_voucherIdTousers.id,
          voucheeId: userId,
          vouchType: v.vouchType,
          message: v.message,
          status: v.status,
          createdAt: v.createdAt,
          voucher: {
            id: v.users_vouches_voucherIdTousers.id,
            fullName: v.users_vouches_voucherIdTousers.fullName,
            profilePicture: getProfilePictureUrl(v.users_vouches_voucherIdTousers.profile?.profilePicture),
          },
        })),
        stats: {
          totalGiven: user._count.vouchesGiven,
          totalReceived: user._count.vouchesReceived,
        },
      },

      // Tab 4: Communities
      communities: {
        total: communities.length,
        pending: communities.filter(cm => !cm.isApproved).length,
        approved: communities.filter(cm => cm.isApproved).length,
        list: communities.map(cm => ({
          id: cm.id,
          role: cm.role,
          joinedAt: cm.joinedAt,
          isApproved: cm.isApproved,
          joinMessage: cm.joinMessage,
          community: {
            id: cm.communities.id,
            name: cm.communities.name,
            logoUrl: cm.communities.logoUrl,
            category: cm.communities.category,
            location: `${cm.communities.city}, ${cm.communities.country}`,
            memberCount: cm.communities._count.communityMembers,
          },
        })),
      },

      // Tab 5: Events
      events: {
        hosted: {
          total: hostedEvents.length,
          list: hostedEvents.map(e => ({
            id: e.id,
            title: e.title,
            type: e.type,
            status: e.status,
            date: e.date,
            location: e.location,
            isFree: e.isFree,
            participantCount: e._count.eventParticipants,
          })),
        },
        attended: {
          total: attendedEvents.length,
          list: attendedEvents.map(ep => ({
            id: ep.id,
            status: ep.status,
            registeredAt: ep.createdAt,
            checkedInAt: ep.checkedInAt,
            event: {
              id: ep.events.id,
              title: ep.events.title,
              type: ep.events.type,
              date: ep.events.date,
              location: ep.events.location,
              host: ep.events.user,
            },
          })),
        },
      },

      // Tab 6: Services
      services: {
        berseGuide: {
          asGuide: berseGuideAsGuideCount,
          asBooker: berseGuideAsBookerCount,
          total: berseGuideAsGuideCount + berseGuideAsBookerCount,
        },
        homeSurf: {
          asHost: homeSurfAsHostCount,
          asGuest: homeSurfAsGuestCount,
          total: homeSurfAsHostCount + homeSurfAsGuestCount,
        },
      },

      // Tab 7: Gamification
      gamification: {
        points: {
          total: user.totalPoints,
          expired: user.pointsExpired,
          spent: user.pointsSpent,
          available: user.totalPoints - user.pointsSpent,
          history: pointHistory,
        },
        badges: {
          total: badges.length,
          list: badges.map(ub => ({
            id: ub.id,
            earnedAt: ub.earnedAt,
            badge: ub.badges,
          })),
        },
      },

      // Tab 8: Security & Privacy
      security: {
        security: {
          emailVerifiedAt: user.security?.emailVerifiedAt || null,
          lastSeenAt: user.security?.lastSeenAt || null,
          lastLoginAt: user.security?.lastLoginAt || null,
          lastPasswordChangeAt: user.security?.lastPasswordChangeAt || null,
          accountLockedReason: user.security?.accountLockedReason || null,
          suspendedUntil: user.security?.suspendedUntil || null,
          suspensionReason: user.security?.suspensionReason || null,
        },
        privacy: user.privacy,
        preferences: user.preferences,
        moderationHistory: moderationHistory,
      },

      // Tab 9: Admin Notes
      admin: {
        metadata: {
          referralCode: user.metadata?.referralCode || null,
          internalNotes: user.metadata?.internalNotes || null,
          notes: user.metadata?.notes || null,
          tags: user.metadata?.tags || [],
        },
        activityLog: activityLog,
      },
    };
  }

  /**
   * Update user information
   */
  async updateUser(userId: string, updates: any) {
    const allowedUpdates = ['role', 'status', 'trustLevel', 'trustScore'];
    const updateData: any = {};

    // Filter to only allowed fields
    for (const key of allowedUpdates) {
      if (updates[key] !== undefined) {
        updateData[key] = updates[key];
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        status: true,
        trustLevel: true,
        trustScore: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  }

  /**
   * Soft delete a user
   */
  /**
        fullName: true,
        email: true,
        status: true,
      },
    });

    // Log the activation
    await prisma.userActivity.create({
      data: {
        userId,
        activityType: 'account_activated',
        entityType: 'user',
        entityId: userId,
      },
    });

    return updatedUser;
  }

  /**
   * Export users as Excel with comprehensive filters
   */
  async exportUsers(filters: {
    role?: string;
    status?: string;
    trustLevel?: string;
    registrationDateFrom?: string;
    registrationDateTo?: string;
    limit?: number;
    search?: string;
  }) {
    const XLSX = require('xlsx');
    
    const where: any = {
      deletedAt: null,
    };

    // Apply filters
    if (filters.role) {
      where.role = filters.role;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.trustLevel) {
      where.trustLevel = filters.trustLevel;
    }

    if (filters.search) {
      where.OR = [
        { fullName: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { username: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    // Date range filter
    if (filters.registrationDateFrom || filters.registrationDateTo) {
      where.createdAt = {};
      if (filters.registrationDateFrom) {
        where.createdAt.gte = new Date(filters.registrationDateFrom);
      }
      if (filters.registrationDateTo) {
        where.createdAt.lte = new Date(filters.registrationDateTo);
      }
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        username: true,
        role: true,
        status: true,
        trustLevel: true,
        trustScore: true,
        totalPoints: true,
        pointsExpired: true,
        pointsSpent: true,
        createdAt: true,
        profile: {
          select: {
            profilePicture: true,
            dateOfBirth: true,
            gender: true,
            profession: true,
          },
        },
        location: {
          select: {
            currentCity: true,
            countryOfResidence: true,
          },
        },
        security: {
          select: {
            lastLoginAt: true,
            emailVerifiedAt: true,
          },
        },
        _count: {
          select: {
            events: true,
            eventParticipants: true,
            communityMembers: true,
            connectionsInitiated: true,
            connectionsReceived: true,
            vouchesReceived: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: filters.limit || 10000,
    });

    // Format data for Excel
    const excelData = users.map((user) => ({
      'User ID': user.id,
      'Full Name': user.fullName,
      'Email': user.email || '',
      'Phone': user.phone || '',
      'Username': user.username || '',
      'Role': user.role,
      'Status': user.status,
      'Trust Level': user.trustLevel,
      'Trust Score': user.trustScore,
      'Total Points': user.totalPoints,
      'Points Expired': user.pointsExpired,
      'Points Spent': user.pointsSpent,
      'Available Points': user.totalPoints - user.pointsExpired - user.pointsSpent,
      'Email Verified': user.security?.emailVerifiedAt ? 'Yes' : 'No',
      'Profession': user.profile?.profession || '',
      'Gender': user.profile?.gender || '',
      'Date of Birth': user.profile?.dateOfBirth ? new Date(user.profile.dateOfBirth).toLocaleDateString() : '',
      'City': user.location?.currentCity || '',
      'Country': user.location?.countryOfResidence || '',
      'Events Hosted': user._count.events,
      'Events Attended': user._count.eventParticipants,
      'Communities': user._count.communityMembers,
      'Connections': user._count.connectionsInitiated + user._count.connectionsReceived,
      'Vouches Received': user._count.vouchesReceived,
      'Registration Date': new Date(user.createdAt).toLocaleString(),
      'Last Login': user.security?.lastLoginAt ? new Date(user.security.lastLoginAt).toLocaleString() : 'Never',
    }));

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    const columnWidths = [
      { wch: 25 }, // User ID
      { wch: 20 }, // Full Name
      { wch: 25 }, // Email
      { wch: 15 }, // Phone
      { wch: 15 }, // Username
      { wch: 12 }, // Role
      { wch: 12 }, // Status
      { wch: 12 }, // Trust Level
      { wch: 12 }, // Trust Score
      { wch: 12 }, // Total Points
      { wch: 14 }, // Points Expired
      { wch: 12 }, // Points Spent
      { wch: 15 }, // Available Points
      { wch: 15 }, // Email Verified
      { wch: 20 }, // Profession
      { wch: 10 }, // Gender
      { wch: 15 }, // Date of Birth
      { wch: 15 }, // City
      { wch: 15 }, // Country
      { wch: 13 }, // Events Hosted
      { wch: 15 }, // Events Attended
      { wch: 12 }, // Communities
      { wch: 12 }, // Connections
      { wch: 15 }, // Vouches Received
      { wch: 20 }, // Registration Date
      { wch: 20 }, // Last Login
    ];
    worksheet['!cols'] = columnWidths;

    // Apply styling to the worksheet
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    
    // Header styling (first row)
    const headerStyle = {
      font: { bold: true, color: { rgb: 'FFFFFF' }, size: 11 },
      fill: { fgColor: { rgb: '4472C4' } },
      alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
      border: {
        top: { style: 'thin', color: { rgb: '000000' } },
        bottom: { style: 'thin', color: { rgb: '000000' } },
        left: { style: 'thin', color: { rgb: '000000' } },
        right: { style: 'thin', color: { rgb: '000000' } }
      }
    };

    // Apply header styling to first row
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (!worksheet[cellAddress]) continue;
      worksheet[cellAddress].s = headerStyle;
    }

    // Data row styling
    for (let row = 1; row <= range.e.r; row++) {
      const isEvenRow = row % 2 === 0;
      
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
        if (!worksheet[cellAddress]) continue;

        const cellValue = worksheet[cellAddress].v;
        const headerName = worksheet[XLSX.utils.encode_cell({ r: 0, c: col })]?.v;

        // Base cell style
        const cellStyle: any = {
          alignment: { vertical: 'center', wrapText: false },
          border: {
            top: { style: 'thin', color: { rgb: 'E0E0E0' } },
            bottom: { style: 'thin', color: { rgb: 'E0E0E0' } },
            left: { style: 'thin', color: { rgb: 'E0E0E0' } },
            right: { style: 'thin', color: { rgb: 'E0E0E0' } }
          }
        };

        // Alternate row colors
        if (isEvenRow) {
          cellStyle.fill = { fgColor: { rgb: 'F2F2F2' } };
        }

        // Status-based conditional formatting
        if (headerName === 'Status') {
          if (cellValue === 'ACTIVE') {
            cellStyle.font = { color: { rgb: '008000' }, bold: true };
            cellStyle.fill = { fgColor: { rgb: 'E8F5E9' } };
          } else if (cellValue === 'BANNED') {
            cellStyle.font = { color: { rgb: 'D32F2F' }, bold: true };
            cellStyle.fill = { fgColor: { rgb: 'FFEBEE' } };
          } else if (cellValue === 'DEACTIVATED') {
            cellStyle.font = { color: { rgb: 'F57C00' }, bold: true };
            cellStyle.fill = { fgColor: { rgb: 'FFF3E0' } };
          }
        }

        // Role highlighting
        if (headerName === 'Role') {
          if (cellValue === 'ADMIN') {
            cellStyle.font = { color: { rgb: 'FFFFFF' }, bold: true };
            cellStyle.fill = { fgColor: { rgb: 'D32F2F' } };
          } else if (cellValue === 'MODERATOR') {
            cellStyle.font = { color: { rgb: 'FFFFFF' }, bold: true };
            cellStyle.fill = { fgColor: { rgb: 'FF6F00' } };
          } else if (cellValue === 'GUIDE') {
            cellStyle.font = { color: { rgb: 'FFFFFF' }, bold: true };
            cellStyle.fill = { fgColor: { rgb: '1976D2' } };
          }
        }

        // Trust Level highlighting
        if (headerName === 'Trust Level') {
          if (cellValue === 'leader') {
            cellStyle.font = { color: { rgb: 'FFD700' }, bold: true };
            cellStyle.fill = { fgColor: { rgb: '1A237E' } };
          } else if (cellValue === 'trusted') {
            cellStyle.font = { color: { rgb: '1976D2' }, bold: true };
            cellStyle.fill = { fgColor: { rgb: 'E3F2FD' } };
          } else if (cellValue === 'starter') {
            cellStyle.font = { color: { rgb: '757575' } };
          }
        }

        // Email Verified highlighting
        if (headerName === 'Email Verified') {
          if (cellValue === 'Yes') {
            cellStyle.font = { color: { rgb: '2E7D32' }, bold: true };
          } else {
            cellStyle.font = { color: { rgb: 'C62828' } };
          }
        }

        // Number formatting for points and counts
        if (headerName && ['Total Points', 'Points Expired', 'Points Spent', 'Available Points', 
            'Trust Score', 'Events Hosted', 'Events Attended', 'Communities', 
            'Connections', 'Vouches Received'].includes(headerName)) {
          cellStyle.alignment.horizontal = 'right';
          if (typeof cellValue === 'number') {
            worksheet[cellAddress].z = '#,##0';
          }
        }

        // Center align for shorter fields
        if (headerName && ['Role', 'Status', 'Trust Level', 'Gender', 'Email Verified'].includes(headerName)) {
          cellStyle.alignment.horizontal = 'center';
        }

        worksheet[cellAddress].s = cellStyle;
      }
    }

    // Freeze the header row
    worksheet['!freeze'] = { xSplit: 0, ySplit: 1 };

    // Add autofilter to header row
    worksheet['!autofilter'] = { ref: XLSX.utils.encode_range(range) };

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Users Export');

    // Generate Excel buffer with full styling support
    const excelBuffer = XLSX.write(workbook, { 
      type: 'buffer', 
      bookType: 'xlsx',
      cellStyles: true 
    });
    return excelBuffer;
  }

  /**
   * Get users pending verification
   */
  async getPendingVerification() {
    const users = await prisma.user.findMany({
      where: {
        deletedAt: null,
        OR: [
          {
            security: {
              emailVerifiedAt: null,
            },
          },
          {
            security: {
              phoneVerifiedAt: null,
            },
          },
        ],
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        createdAt: true,
        security: {
          select: {
            emailVerifiedAt: true,
            phoneVerifiedAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return users.map(user => ({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      emailVerified: !!user.security?.emailVerifiedAt,
      phoneVerified: !!user.security?.phoneVerifiedAt,
      joinedAt: user.createdAt,
    }));
  }

  /**
   * Get events hosted by user
   */
  async getUserHostedEvents(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [total, events] = await Promise.all([
      prisma.event.count({ where: { hostId: userId } }),
      prisma.event.findMany({
        where: { hostId: userId },
        select: {
          id: true,
          title: true,
          type: true,
          status: true,
          date: true,
          location: true,
          city: true,
          country: true,
          isFree: true,
          maxAttendees: true,
          createdAt: true,
          _count: {
            select: {
              eventParticipants: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      events,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get events attended by user
   */
  async getUserAttendedEvents(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [total, participants] = await Promise.all([
      prisma.eventParticipant.count({
        where: {
          userId,
          status: {
            in: ['REGISTERED', 'CHECKED_IN'],
          },
        },
      }),
      prisma.eventParticipant.findMany({
        where: {
          userId,
          status: {
            in: ['REGISTERED', 'CHECKED_IN'],
          },
        },
        select: {
          id: true,
          status: true,
          createdAt: true,
          checkedInAt: true,
          events: {
            select: {
              id: true,
              title: true,
              type: true,
              status: true,
              date: true,
              location: true,
              city: true,
              country: true,
              user: {
                select: {
                  id: true,
                  fullName: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      events: participants.map((p) => ({
        participantId: p.id,
        participantStatus: p.status,
        registeredAt: p.createdAt,
        checkedInAt: p.checkedInAt,
        ...p.events,
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get user payment history and revenue summary
   */
  async getUserPayments(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;

    // Get revenue summary
    const revenueSummary = await prisma.paymentTransaction.aggregate({
      where: {
        userId,
        status: 'SUCCEEDED',
      },
      _sum: {
        amount: true,
        netAmount: true,
        platformFee: true,
        gatewayFee: true,
      },
      _count: true,
    });

    // Get payment transactions
    const [total, payments] = await Promise.all([
      prisma.paymentTransaction.count({ where: { userId } }),
      prisma.paymentTransaction.findMany({
        where: { userId },
        select: {
          id: true,
          transactionType: true,
          referenceType: true,
          referenceId: true,
          amount: true,
          currency: true,
          netAmount: true,
          platformFee: true,
          gatewayFee: true,
          status: true,
          description: true,
          processedAt: true,
          paidAt: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      summary: {
        totalTransactions: revenueSummary._count,
        totalRevenue: revenueSummary._sum.amount || 0,
        netRevenue: revenueSummary._sum.netAmount || 0,
        totalPlatformFees: revenueSummary._sum.platformFee || 0,
        totalGatewayFees: revenueSummary._sum.gatewayFee || 0,
      },
      payments,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get user reviews with rating breakdown
   */
  async getUserReviews(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;

    // Get rating breakdown from trust moments (reviews)
    const ratingBreakdown = await prisma.trustMoment.groupBy({
      by: ['rating'],
      where: { receiverId: userId },
      _count: true,
    });

    const ratingStats = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      total: 0,
      average: 0,
    };

    let totalRating = 0;
    ratingBreakdown.forEach((item) => {
      ratingStats[item.rating as keyof typeof ratingStats] = item._count;
      ratingStats.total += item._count;
      totalRating += item.rating * item._count;
    });

    if (ratingStats.total > 0) {
      ratingStats.average = Number((totalRating / ratingStats.total).toFixed(2));
    }

    // Get reviews
    const [total, reviews] = await Promise.all([
      prisma.trustMoment.count({ where: { receiverId: userId } }),
      prisma.trustMoment.findMany({
        where: { receiverId: userId },
        select: {
          id: true,
          momentType: true,
          rating: true,
          feedback: true,
          experienceDescription: true,
          tags: true,
          isPublic: true,
          isVerified: true,
          createdAt: true,
          giver: {
            select: {
              id: true,
              fullName: true,
            },
          },
          event: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      ratingStats,
      reviews: reviews.map((r) => ({
        id: r.id,
        type: r.momentType,
        rating: r.rating,
        feedback: r.feedback,
        description: r.experienceDescription,
        tags: r.tags,
        isPublic: r.isPublic,
        isVerified: r.isVerified,
        createdAt: r.createdAt,
        reviewer: r.giver,
        event: r.event,
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get user moderation history
   */
  async getUserModerationHistory(userId: string) {
    // Get moderation-related activities
    const activities = await prisma.userActivity.findMany({
      where: {
        userId,
        activityType: {
          in: [
            'account_suspended',
            'account_activated',
            'account_verified',
            'account_banned',
            'account_warned',
            'account_note_added',
          ],
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    // Get security record for current status
    const security = await prisma.userSecurity.findUnique({
      where: { userId },
      select: {
        suspendedUntil: true,
        suspensionReason: true,
        accountLockedReason: true,
        lockoutUntil: true,
      },
    });

    // Get metadata for internal notes
    const metadata = await prisma.userMetadata.findUnique({
      where: { userId },
      select: {
        internalNotes: true,
        notes: true,
      },
    });

    return {
      currentStatus: {
        isSuspended: security?.suspendedUntil ? new Date(security.suspendedUntil) > new Date() : false,
        suspendedUntil: security?.suspendedUntil,
        suspensionReason: security?.suspensionReason,
        isLocked: security?.lockoutUntil ? new Date(security.lockoutUntil) > new Date() : false,
        lockoutUntil: security?.lockoutUntil,
        lockoutReason: security?.accountLockedReason,
      },
      notes: {
        public: metadata?.notes,
        internal: metadata?.internalNotes,
      },
      history: activities,
    };
  }

  /**
   * Get vouches given and received by user
   */
  async getUserVouches(userId: string) {
    const [vouchesGiven, vouchesReceived] = await Promise.all([
      prisma.vouch.findMany({
        where: { voucherId: userId },
        select: {
          id: true,
          vouchType: true,
          weightPercentage: true,
          message: true,
          status: true,
          createdAt: true,
          approvedAt: true,
          users_vouches_voucheeIdTousers: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.vouch.findMany({
        where: { voucheeId: userId },
        select: {
          id: true,
          vouchType: true,
          weightPercentage: true,
          message: true,
          status: true,
          createdAt: true,
          approvedAt: true,
          users_vouches_voucherIdTousers: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    // Get statistics
    const stats = await prisma.userStat.findUnique({
      where: { userId },
      select: {
        vouchesGiven: true,
        vouchesReceived: true,
      },
    });

    return {
      stats: {
        given: stats?.vouchesGiven || 0,
        received: stats?.vouchesReceived || 0,
        givenPending: vouchesGiven.filter((v) => v.status === 'PENDING').length,
        receivedPending: vouchesReceived.filter((v) => v.status === 'PENDING').length,
      },
      vouchesGiven: vouchesGiven.map((v) => ({
        id: v.id,
        type: v.vouchType,
        weight: v.weightPercentage,
        message: v.message,
        status: v.status,
        createdAt: v.createdAt,
        approvedAt: v.approvedAt,
        vouchee: v.users_vouches_voucheeIdTousers,
      })),
      vouchesReceived: vouchesReceived.map((v) => ({
        id: v.id,
        type: v.vouchType,
        weight: v.weightPercentage,
        message: v.message,
        status: v.status,
        createdAt: v.createdAt,
        approvedAt: v.approvedAt,
        voucher: v.users_vouches_voucherIdTousers,
      })),
    };
  }

  /**
   * Send warning email to user
   */
  async sendUserWarning(userId: string, adminId: string, reason: string, message: string) {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Log the warning in user activities
    await prisma.userActivity.create({
      data: {
        userId,
        activityType: 'account_warned',
        entityType: 'admin_action',
        entityId: adminId,
      },
    });

    // Send warning email
    let emailSent = false;
    try {
      await emailService.sendAdminWarningEmail(user.email, user.fullName, reason, message);
      emailSent = true;
    } catch (error) {
      console.error('Failed to send warning email:', error);
      // Don't throw - email failure shouldn't block warning creation
    }

    return {
      userId,
      userName: user.fullName,
      email: user.email,
      reason,
      message,
      sentAt: new Date(),
      sentBy: adminId,
      emailStatus: emailSent ? 'sent' : 'failed',
    };
  }

  /**
   * Add admin moderation note
   */
  async addModerationNote(userId: string, adminId: string, note: string) {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Get or create metadata
    const metadata = await prisma.userMetadata.upsert({
      where: { userId },
      create: {
        userId,
        referralCode: `REF_${userId.substring(0, 8)}`,
        internalNotes: note,
      },
      update: {
        internalNotes: {
          set: note,
        },
      },
    });

    // Log the action
    await prisma.userActivity.create({
      data: {
        userId,
        activityType: 'account_note_added',
        entityType: 'admin_action',
        entityId: adminId,
      },
    });

    return {
      userId,
      note: metadata.internalNotes,
      addedBy: adminId,
      addedAt: new Date(),
    };
  }

  /**
   * Get user connections
   */
  async getUserConnections(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;

    // Get connections where user is either initiator or receiver
    const [total, connections] = await Promise.all([
      prisma.userConnection.count({
        where: {
          OR: [{ initiatorId: userId }, { receiverId: userId }],
          status: 'ACCEPTED',
        },
      }),
      prisma.userConnection.findMany({
        where: {
          OR: [{ initiatorId: userId }, { receiverId: userId }],
          status: 'ACCEPTED',
        },
        select: {
          id: true,
          status: true,
          relationshipType: true,
          relationshipCategory: true,
          trustStrength: true,
          interactionCount: true,
          lastInteraction: true,
          createdAt: true,
          connectedAt: true,
          users_user_connections_initiatorIdTousers: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
          users_user_connections_receiverIdTousers: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
        orderBy: { connectedAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    // Get connection stats
    const stats = await prisma.connectionStat.findUnique({
      where: { userId },
    });

    return {
      stats: {
        total: stats?.totalConnections || 0,
        active: stats?.totalConnections || 0,
        pending: stats?.pendingRequests || 0,
      },
      connections: connections.map((c) => {
        const otherUser =
          c.users_user_connections_initiatorIdTousers.id === userId
            ? c.users_user_connections_receiverIdTousers
            : c.users_user_connections_initiatorIdTousers;

        return {
          id: c.id,
          connectedUser: otherUser,
          relationshipType: c.relationshipType,
          relationshipCategory: c.relationshipCategory,
          trustStrength: c.trustStrength,
          interactionCount: c.interactionCount,
          lastInteraction: c.lastInteraction,
          connectedAt: c.connectedAt,
        };
      }),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ============================================================================
  // EVENT MANAGEMENT METHODS
  // ============================================================================

  /**
   * Get event statistics for dashboard cards
   */
  async getEventStatistics() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    // Total events
    const totalEvents = await prisma.event.count();

    // Last month's total for comparison
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    const lastMonthTotal = await prisma.event.count({
      where: {
        createdAt: {
          gte: lastMonthStart,
          lte: lastMonthEnd,
        },
      },
    });

    const percentageChange = lastMonthTotal > 0 
      ? ((totalEvents - lastMonthTotal) / lastMonthTotal * 100).toFixed(1)
      : '0.0';

    // Upcoming events (published, date is in the future)
    const upcomingEvents = await prisma.event.count({
      where: {
        status: 'PUBLISHED',
        date: {
          gte: now.toISOString(),
        },
      },
    });

    // Upcoming events in next 3 days
    const upcomingIn3Days = await prisma.event.count({
      where: {
        status: 'PUBLISHED',
        date: {
          gte: now.toISOString(),
          lte: threeDaysFromNow.toISOString(),
        },
      },
    });

    // Ongoing events (published, date is today or started but not ended)
    const ongoingEvents = await prisma.event.count({
      where: {
        status: 'PUBLISHED',
        date: {
          lte: now.toISOString(),
        },
        endTime: {
          gte: now.toISOString(),
        },
      },
    });

    // Completed events this month
    const completedThisMonth = await prisma.event.count({
      where: {
        status: 'COMPLETED',
        updatedAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });

    // Total attendees across all events
    const totalAttendees = await prisma.eventParticipant.count({
      where: {
        status: {
          in: ['REGISTERED', 'CHECKED_IN'],
        },
      },
    });

    return {
      totalEvents: {
        count: totalEvents,
        changeFromLastMonth: `${Number(percentageChange) >= 0 ? '+' : ''}${percentageChange}%`,
        label: 'from last month',
      },
      upcoming: {
        count: upcomingEvents,
        next3Days: upcomingIn3Days,
        label: `Next in 3 days`,
      },
      ongoing: {
        count: ongoingEvents,
        label: 'Live now',
      },
      completed: {
        count: completedThisMonth,
        label: 'This month',
      },
      totalAttendees: {
        count: totalAttendees,
        label: 'Across all events',
      },
    };
  }

  /**
   * Get paginated events list with filters
   */
  async getEvents(params: {
    page: number;
    limit: number;
    search?: string;
    type?: string;
    status?: string;
    hostType?: string;
    isFree?: boolean;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: string;
  }) {
    const { page, limit, search, type, status, hostType, isFree, startDate, endDate, sortBy = 'createdAt', sortOrder = 'desc' } = params;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (type) {
      where.type = type;
    }

    if (status) {
      where.status = status;
    }

    if (hostType) {
      where.hostType = hostType;
    }

    if (isFree !== undefined) {
      where.isFree = isFree;
    }

    if (startDate) {
      where.date = { ...where.date, gte: new Date(startDate) };
    }

    if (endDate) {
      where.date = { ...where.date, lte: new Date(endDate) };
    }

    // Get total count and events
    const [total, events] = await Promise.all([
      prisma.event.count({ where }),
      prisma.event.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
          communities: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              eventParticipants: true,
              eventTickets: true,
            },
          },
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip,
        take: limit,
      }),
    ]);

    // Get active participant count and ticket info for each event
    const formattedEvents = await Promise.all(
      events.map(async (event) => {
        // Count only REGISTERED or CHECKED_IN participants
        const activeParticipants = await prisma.eventParticipant.count({
          where: {
            eventId: event.id,
            status: {
              in: ['REGISTERED', 'CHECKED_IN'],
            },
          },
        });

        // Get ticket tiers to determine price
        const tiers = await prisma.eventTicketTier.findMany({
          where: {
            eventId: event.id,
            isActive: true,
          },
          orderBy: {
            price: 'asc',
          },
          select: {
            price: true,
            currency: true,
          },
        });

        // Determine price display
        let priceDisplay = 'Free';
        if (!event.isFree && tiers.length > 0) {
          const priceValue = tiers[0].price;
          const lowestPrice = typeof priceValue === 'string' 
            ? parseFloat(priceValue)
            : Number(priceValue);
          const priceInUnits = (lowestPrice / 100).toFixed(2);
          priceDisplay = `${priceInUnits} ${tiers[0].currency}`;
        }

        return {
          id: event.id,
          title: event.title,
          description: event.description,
          imageUrl: event.images && event.images.length > 0 ? getImageUrl(event.images[0]) : null,
          type: event.type,
          status: event.status,
          hostType: event.hostType,
          date: event.date,
          startDate: event.startDate,
          endDate: event.endDate,
          startTime: event.startTime,
          endTime: event.endTime,
          location: event.location,
          city: event.city,
          country: event.country,
          locationDisplay: event.city && event.country
            ? `${event.location}, ${event.city}, ${event.country}`
            : event.location,
          isFree: event.isFree,
          price: priceDisplay,
          maxAttendees: event.maxAttendees,
          host: {
            id: event.user.id,
            name: event.user.fullName,
            email: event.user.email,
          },
          community: event.communities
            ? {
                id: event.communities.id,
                name: event.communities.name,
              }
            : null,
          participants: {
            current: activeParticipants,
            max: event.maxAttendees,
            display: event.maxAttendees
              ? `${activeParticipants}/${event.maxAttendees}`
              : `${activeParticipants}`,
          },
          createdAt: event.createdAt,
          updatedAt: event.updatedAt,
        };
      })
    );

    return {
      events: formattedEvents,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get detailed event information by ID
   */
  async getEventById(eventId: string) {
    const event: any = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            username: true,
            profile: {
              select: {
                profilePicture: true,
              },
            },
          },
        },
        communities: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
            isVerified: true,
          },
        },
        tier: true,
        _count: {
          select: {
            eventParticipants: true,
            eventTickets: true,
          },
        },
      },
    });

    if (!event) {
      throw new Error('Event not found');
    }

    // Get all ticket tiers
    const ticketTiers = await prisma.eventTicketTier.findMany({
      where: { eventId },
      orderBy: { price: 'asc' },
    });

    // Get participants with details
    const participants: any = await prisma.eventParticipant.findMany({
      where: { eventId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            profile: {
              select: {
                profilePicture: true,
              },
            },
          },
        },
        eventTickets: {
          select: {
            id: true,
            price: true,
            purchasedAt: true,
            paymentStatus: true,
          },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get participant stats
    const participantsByStatus = await prisma.eventParticipant.groupBy({
      by: ['status'],
      where: { eventId },
      _count: true,
    });

    // Calculate revenue and ticket stats
    let totalRevenue = 0;
    let ticketsSold = 0;
    const ticketsByTier: any = {};

    if (!event.isFree) {
      const tickets = await prisma.eventTicket.findMany({
        where: { eventId },
        include: {
          tier: {
            select: {
              tierName: true,
            },
          },
        },
      });

      tickets.forEach((ticket) => {
        const price = typeof ticket.price === 'string' ? parseFloat(ticket.price) : Number(ticket.price);
        totalRevenue += price;
        ticketsSold++;

        const tierName = ticket.tier?.tierName || 'General';
        if (!ticketsByTier[tierName]) {
          ticketsByTier[tierName] = { count: 0, revenue: 0 };
        }
        ticketsByTier[tierName].count++;
        ticketsByTier[tierName].revenue += price;
      });
    }

    // Get event activity log
    const activityLog = await prisma.userActivity.findMany({
      where: {
        entityType: 'event',
        entityId: eventId,
      },
      include: {
        users: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    // Format with tabs structure
    return {
      // Tab 1: Overview
      overview: {
        basicInfo: {
          id: event.id,
          title: event.title,
          description: event.description,
          type: event.type,
          status: event.status,
          hostType: event.hostType,
          isFree: event.isFree,
          images: event.images.map(img => getImageUrl(img)),
          mainImage: event.images && event.images.length > 0 ? getImageUrl(event.images[0]) : null,
          date: event.date,
          startDate: event.startDate,
          endDate: event.endDate,
          startTime: event.startTime,
          endTime: event.endTime,
          location: event.location,
          city: event.city,
          country: event.country,
          latitude: event.latitude,
          longitude: event.longitude,
          maxAttendees: event.maxAttendees,
          createdAt: event.createdAt,
          updatedAt: event.updatedAt,
        },
        host: {
          id: event.user.id,
          fullName: event.user.fullName,
          email: event.user.email,
          username: event.user.username,
          profilePicture: getProfilePictureUrl(event.user.profile?.profilePicture),
        },
        community: event.communities ? {
          id: event.communities.id,
          name: event.communities.name,
          logoUrl: getImageUrl(event.communities.logoUrl),
          isVerified: event.communities.isVerified,
        } : null,
        stats: {
          totalParticipants: event._count.eventParticipants,
          registeredCount: participantsByStatus.find(s => s.status === 'REGISTERED')?._count || 0,
          confirmedCount: participantsByStatus.find(s => s.status === 'CONFIRMED')?._count || 0,
          checkedInCount: participantsByStatus.find(s => s.status === 'CHECKED_IN')?._count || 0,
          noShowCount: participantsByStatus.find(s => s.status === 'NO_SHOW')?._count || 0,
          canceledCount: participantsByStatus.find(s => s.status === 'CANCELED')?._count || 0,
          attendanceRate: event._count.eventParticipants > 0 
            ? ((participantsByStatus.find(s => s.status === 'CHECKED_IN')?._count || 0) / event._count.eventParticipants * 100).toFixed(1)
            : '0.0',
          totalTicketsSold: ticketsSold,
          totalRevenue: event.isFree ? 0 : totalRevenue,
          currency: event.currency || ticketTiers[0]?.currency || 'MYR',
        },
      },

      // Tab 2: Participants
      participants: {
        total: participants.length,
        byStatus: participantsByStatus.reduce((acc, s) => {
          acc[s.status.toLowerCase()] = s._count;
          return acc;
        }, {} as any),
        list: participants.map((p) => ({
          id: p.id,
          userId: p.userId,
          fullName: p.user.fullName,
          email: p.user.email,
          phone: p.user.phone,
          profilePicture: getProfilePictureUrl(p.user.profile?.profilePicture),
          status: p.status,
          registeredAt: p.createdAt,
          checkedInAt: p.checkedInAt,
          canceledAt: p.canceledAt,
          qrCode: p.qrCode,
          hasTicket: p.eventTickets && p.eventTickets.length > 0,
          ticket: p.eventTickets && p.eventTickets.length > 0 ? {
            id: p.eventTickets[0].id,
            price: p.eventTickets[0].price,
            purchasedAt: p.eventTickets[0].purchasedAt,
            paymentStatus: p.eventTickets[0].paymentStatus,
          } : null,
        })),
      },

      // Tab 3: Tickets & Pricing
      tickets: {
        isFree: event.isFree,
        totalRevenue: event.isFree ? 0 : totalRevenue,
        ticketsSold: ticketsSold,
        currency: event.currency || ticketTiers[0]?.currency || 'MYR',
        tiers: ticketTiers.map((tier) => ({
          id: tier.id,
          tierName: tier.tierName,
          description: tier.description,
          price: tier.price,
          currency: tier.currency,
          totalQuantity: tier.totalQuantity,
          soldQuantity: tier.soldQuantity,
          availableQuantity: (tier.totalQuantity || 0) - (tier.soldQuantity || 0),
          isActive: tier.isActive,
          availableFrom: tier.availableFrom,
          availableUntil: tier.availableUntil,
          sold: ticketsByTier[tier.tierName]?.count || 0,
          revenue: ticketsByTier[tier.tierName]?.revenue || 0,
        })),
      },

      // Tab 4: Activity Log
      activity: {
        total: activityLog.length,
        log: activityLog.map((activity) => ({
          id: activity.id,
          activityType: activity.activityType,
          user: activity.users ? {
            id: activity.users.id,
            fullName: activity.users.fullName,
          } : null,
          createdAt: activity.createdAt,
        })),
      },
    };
  }

  /**
   * Export event participants to Excel
   */
  async exportEventParticipants(eventId: string, filters?: {
    status?: string;
  }) {
    const XLSX = require('xlsx');

    // First get event details
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        title: true,
        date: true,
        startDate: true,
        endDate: true,
        location: true,
        city: true,
        country: true,
        type: true,
        isFree: true,
      },
    });

    if (!event) {
      throw new Error('Event not found');
    }

    // Build where clause
    const where: any = {
      eventId,
    };

    if (filters?.status) {
      where.status = filters.status;
    }

    // Get all participants with full details
    const participants = await prisma.eventParticipant.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            username: true,
            role: true,
            trustLevel: true,
            profile: {
              select: {
                profilePicture: true,
                profession: true,
                dateOfBirth: true,
                gender: true,
              },
            },
            location: {
              select: {
                currentCity: true,
                countryOfResidence: true,
              },
            },
            security: {
              select: {
                emailVerifiedAt: true,
              },
            },
          },
        },
        eventTickets: {
          select: {
            id: true,
            price: true,
            currency: true,
            paymentStatus: true,
            purchasedAt: true,
            tier: {
              select: {
                tierName: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Format data for Excel
    const excelData = participants.map((participant) => ({
      'Participant ID': participant.id,
      'User ID': participant.userId,
      'Full Name': participant.user.fullName,
      'Email': participant.user.email || '',
      'Phone': participant.user.phone || '',
      'Username': participant.user.username || '',
      'Status': participant.status,
      'Registered At': new Date(participant.createdAt).toLocaleString(),
      'Checked In At': participant.checkedInAt ? new Date(participant.checkedInAt).toLocaleString() : '',
      'Canceled At': participant.canceledAt ? new Date(participant.canceledAt).toLocaleString() : '',
      'QR Code': participant.qrCode || '',
      'Has Ticket': participant.eventTickets && participant.eventTickets.length > 0 ? 'Yes' : 'No',
      'Ticket Tier': participant.eventTickets?.[0]?.tier?.tierName || (event.isFree ? 'Free' : ''),
      'Ticket Price': participant.eventTickets?.[0]?.price || (event.isFree ? 0 : ''),
      'Currency': participant.eventTickets?.[0]?.currency || '',
      'Payment Status': participant.eventTickets?.[0]?.paymentStatus || (event.isFree ? 'N/A' : ''),
      'Purchased At': participant.eventTickets?.[0]?.purchasedAt ? new Date(participant.eventTickets[0].purchasedAt).toLocaleString() : '',
      'Trust Level': participant.user.trustLevel,
      'Email Verified': participant.user.security?.emailVerifiedAt ? 'Yes' : 'No',
      'Profession': participant.user.profile?.profession || '',
      'Gender': participant.user.profile?.gender || '',
      'Date of Birth': participant.user.profile?.dateOfBirth ? new Date(participant.user.profile.dateOfBirth).toLocaleDateString() : '',
      'City': participant.user.location?.currentCity || '',
      'Country': participant.user.location?.countryOfResidence || '',
    }));

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    const columnWidths = [
      { wch: 25 }, // Participant ID
      { wch: 25 }, // User ID
      { wch: 20 }, // Full Name
      { wch: 25 }, // Email
      { wch: 15 }, // Phone
      { wch: 15 }, // Username
      { wch: 15 }, // Status
      { wch: 20 }, // Registered At
      { wch: 20 }, // Checked In At
      { wch: 20 }, // Canceled At
      { wch: 30 }, // QR Code
      { wch: 12 }, // Has Ticket
      { wch: 20 }, // Ticket Tier
      { wch: 12 }, // Ticket Price
      { wch: 10 }, // Currency
      { wch: 15 }, // Payment Status
      { wch: 20 }, // Purchased At
      { wch: 12 }, // Trust Level
      { wch: 15 }, // Email Verified
      { wch: 20 }, // Profession
      { wch: 10 }, // Gender
      { wch: 15 }, // Date of Birth
      { wch: 15 }, // City
      { wch: 15 }, // Country
    ];
    worksheet['!cols'] = columnWidths;

    // Apply styling to the worksheet
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    
    // Header styling (first row)
    const headerStyle = {
      font: { bold: true, color: { rgb: 'FFFFFF' }, size: 11 },
      fill: { fgColor: { rgb: '4472C4' } },
      alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
      border: {
        top: { style: 'thin', color: { rgb: '000000' } },
        bottom: { style: 'thin', color: { rgb: '000000' } },
        left: { style: 'thin', color: { rgb: '000000' } },
        right: { style: 'thin', color: { rgb: '000000' } }
      }
    };

    // Apply header styling to first row
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (!worksheet[cellAddress]) continue;
      worksheet[cellAddress].s = headerStyle;
    }

    // Data row styling with conditional formatting
    for (let row = 1; row <= range.e.r; row++) {
      const isEvenRow = row % 2 === 0;
      
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
        if (!worksheet[cellAddress]) continue;

        const cellValue = worksheet[cellAddress].v;
        const headerName = worksheet[XLSX.utils.encode_cell({ r: 0, c: col })]?.v;

        // Base cell style
        const cellStyle: any = {
          alignment: { vertical: 'center', wrapText: false },
          border: {
            top: { style: 'thin', color: { rgb: 'E0E0E0' } },
            bottom: { style: 'thin', color: { rgb: 'E0E0E0' } },
            left: { style: 'thin', color: { rgb: 'E0E0E0' } },
            right: { style: 'thin', color: { rgb: 'E0E0E0' } }
          }
        };

        // Alternate row colors
        if (isEvenRow) {
          cellStyle.fill = { fgColor: { rgb: 'F2F2F2' } };
        }

        // Status-based conditional formatting
        if (headerName === 'Status') {
          if (cellValue === 'CHECKED_IN') {
            cellStyle.font = { color: { rgb: '008000' }, bold: true };
            cellStyle.fill = { fgColor: { rgb: 'E8F5E9' } };
          } else if (cellValue === 'CANCELED') {
            cellStyle.font = { color: { rgb: 'D32F2F' }, bold: true };
            cellStyle.fill = { fgColor: { rgb: 'FFEBEE' } };
          } else if (cellValue === 'NO_SHOW') {
            cellStyle.font = { color: { rgb: 'F57C00' }, bold: true };
            cellStyle.fill = { fgColor: { rgb: 'FFF3E0' } };
          } else if (cellValue === 'CONFIRMED') {
            cellStyle.font = { color: { rgb: '1976D2' }, bold: true };
            cellStyle.fill = { fgColor: { rgb: 'E3F2FD' } };
          } else if (cellValue === 'REGISTERED') {
            cellStyle.font = { color: { rgb: '757575' } };
            cellStyle.fill = { fgColor: { rgb: 'F5F5F5' } };
          }
        }

        // Payment Status formatting
        if (headerName === 'Payment Status') {
          if (cellValue === 'COMPLETED' || cellValue === 'PAID') {
            cellStyle.font = { color: { rgb: '008000' }, bold: true };
          } else if (cellValue === 'PENDING') {
            cellStyle.font = { color: { rgb: 'F57C00' }, bold: true };
          } else if (cellValue === 'FAILED' || cellValue === 'REFUNDED') {
            cellStyle.font = { color: { rgb: 'D32F2F' }, bold: true };
          }
        }

        // Yes/No formatting
        if (headerName === 'Has Ticket' || headerName === 'Email Verified') {
          if (cellValue === 'Yes') {
            cellStyle.font = { color: { rgb: '008000' } };
          } else if (cellValue === 'No') {
            cellStyle.font = { color: { rgb: 'D32F2F' } };
          }
        }

        // Trust level formatting
        if (headerName === 'Trust Level') {
          if (cellValue === 'leader') {
            cellStyle.font = { color: { rgb: 'FFFFFF' }, bold: true };
            cellStyle.fill = { fgColor: { rgb: '1565C0' } };
          } else if (cellValue === 'trusted') {
            cellStyle.font = { color: { rgb: '1976D2' }, bold: true };
          } else if (cellValue === 'starter') {
            cellStyle.font = { color: { rgb: '757575' } };
          }
        }

        // Number formatting for price
        if (headerName === 'Ticket Price' && typeof cellValue === 'number') {
          cellStyle.alignment.horizontal = 'right';
          worksheet[cellAddress].z = '#,##0.00';
        }

        worksheet[cellAddress].s = cellStyle;
      }
    }

    // Freeze header row
    worksheet['!freeze'] = { xSplit: 0, ySplit: 1 };

    // Enable autofilter
    worksheet['!autofilter'] = { ref: `A1:${XLSX.utils.encode_col(range.e.c)}1` };

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Participants');

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    const eventDate = event.startDate || event.date;
    const formattedDate = new Date(eventDate).toISOString().split('T')[0];
    const filename = `${event.title.replace(/[^a-z0-9]/gi, '_')}_participants_${formattedDate}.xlsx`;

    return {
      buffer,
      filename,
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      summary: {
        eventTitle: event.title,
        eventDate: eventDate,
        totalParticipants: participants.length,
        byStatus: participants.reduce((acc, p) => {
          acc[p.status] = (acc[p.status] || 0) + 1;
          return acc;
        }, {} as any),
      },
    };
  }

  /**
   * Update event information
   */
  async updateEvent(eventId: string, updates: any) {
    const allowedUpdates = ['title', 'description', 'type', 'status', 'date', 'location', 'isFree'];
    const updateData: any = {};

    // Filter to only allowed fields
    for (const key of allowedUpdates) {
      if (updates[key] !== undefined) {
        updateData[key] = updates[key];
      }
    }

    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: updateData,
      select: {
        id: true,
        title: true,
        type: true,
        status: true,
        date: true,
        location: true,
        updatedAt: true,
      },
    });

    return updatedEvent;
  }

  /**
   * Delete an event (soft delete)
   */
  async deleteEvent(eventId: string) {
    await prisma.event.update({
      where: { id: eventId },
      data: {
        deletedAt: new Date(),
        status: 'CANCELED',
      },
    });
  }

  /**
   * Cancel an event
   */
  async cancelEvent(eventId: string, reason?: string) {
    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: {
        status: 'CANCELED',
      },
      select: {
        id: true,
        title: true,
        status: true,
        date: true,
      },
    });

    // TODO: Send cancellation notifications to participants
    // This could be added later as a background job

    return updatedEvent;
  }

  /**
   * Publish a draft event
   */
  async publishEvent(eventId: string) {
    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: {
        status: 'PUBLISHED',
      },
      select: {
        id: true,
        title: true,
        status: true,
      },
    });

    return updatedEvent;
  }

  /**
   * Add admin notes to an event
   */
  async addEventNote(eventId: string, note: string, adminId: string) {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new Error('Event not found');
    }

    // Log the note as activity
    await prisma.userActivity.create({
      data: {
        userId: adminId,
        activityType: 'event_note_added',
        entityType: 'event',
        entityId: eventId,
      },
    });

    return { eventId, note, addedBy: adminId, addedAt: new Date() };
  }

  /**
   * Update event featured status
   */
  async updateEventFeatured(eventId: string, isFeatured: boolean, adminId: string) {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new Error('Event not found');
    }

    // Log featured/unfeatured activity
    await prisma.userActivity.create({
      data: {
        userId: adminId,
        activityType: isFeatured ? 'event_featured' : 'event_unfeatured',
        entityType: 'event',
        entityId: eventId,
      },
    });

    return { eventId, isFeatured, updatedBy: adminId };
  }

  /**
   * Send warning to event host
   */
  async sendEventWarning(eventId: string, reason: string, message: string, adminId: string) {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    if (!event) {
      throw new Error('Event not found');
    }

    // Log the warning
    await prisma.userActivity.create({
      data: {
        userId: event.hostId,
        activityType: 'event_warning_sent',
        entityType: 'event',
        entityId: eventId,
      },
    });

    // Send email notification
    await emailService.sendEmail({
      to: event.user.email,
      subject: `Warning: Event "${event.title}" - ${reason}`,
      html: `
        <h2>Event Warning</h2>
        <p>Hello ${event.user.fullName},</p>
        <p>Your event <strong>${event.title}</strong> has received a warning from our moderation team.</p>
        <p><strong>Reason:</strong> ${reason}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
        <p>Please review our event guidelines and take appropriate action.</p>
        <p>If you have questions, please contact our support team.</p>
      `,
      text: `Event Warning\n\nHello ${event.user.fullName},\n\nYour event ${event.title} has received a warning from our moderation team.\n\nReason: ${reason}\n\nMessage:\n${message}\n\nPlease review our event guidelines and take appropriate action.\n\nIf you have questions, please contact our support team.`,
    });

    return {
      eventId,
      hostId: event.hostId,
      reason,
      sentAt: new Date(),
    };
  }

  /**
   * Get event participants with pagination
   */
  async getEventParticipants(eventId: string, params: {
    status?: string;
    page: number;
    limit: number;
  }) {
    const { status, page, limit } = params;
    const skip = (page - 1) * limit;

    const where: any = {
      eventId,
    };

    if (status) {
      where.status = status;
    }

    const [total, participants] = await Promise.all([
      prisma.eventParticipant.count({ where }),
      prisma.eventParticipant.findMany({
        where,
        select: {
          id: true,
          status: true,
          checkedInAt: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      participants,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Export events as CSV
   */
  async exportEvents(filters: { 
    type?: string; 
    status?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const where: any = {
      deletedAt: null,
    };

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.startDate) {
      where.date = { ...where.date, gte: new Date(filters.startDate) };
    }

    if (filters.endDate) {
      where.date = { ...where.date, lte: new Date(filters.endDate) };
    }

    const events = await prisma.event.findMany({
      where,
      include: {
        user: {
          select: {
            fullName: true,
            email: true,
          },
        },
        communities: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            eventParticipants: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    });

    // Generate CSV
    const headers = ['ID', 'Title', 'Type', 'Status', 'Host Type', 'Date', 'Location', 'City', 'Country', 'Free', 'Host', 'Community', 'Participants', 'Created At'];
    const csvRows = [headers.join(',')];

    for (const event of events) {
      const row = [
        event.id,
        `"${event.title.replace(/"/g, '""')}"`,
        event.type,
        event.status,
        event.hostType,
        event.date.toISOString(),
        `"${event.location?.replace(/"/g, '""') || ''}"`,
        event.city || '',
        event.country || '',
        event.isFree ? 'Yes' : 'No',
        `"${event.user.fullName}"`,
        event.communities ? `"${event.communities.name}"` : '',
        event._count.eventParticipants,
        event.createdAt.toISOString(),
      ];
      csvRows.push(row.join(','));
    }

    return csvRows.join('\n');
  }

  /**
   * Update user status (suspend, ban, activate)
   */
  async updateUserStatus(userId: string, status: 'ACTIVE' | 'DEACTIVATED' | 'BANNED', reason?: string, adminId?: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Update user status
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { status },
    });

    // Send email notification to user
    try {
      await emailService.sendAccountStatusChangeEmail(
        user.email,
        user.fullName,
        status,
        reason
      );
    } catch (error) {
      console.error('Failed to send status change email:', error);
      // Don't throw - email failure shouldn't block status update
    }

    // Log the action
    if (adminId) {
      await prisma.userActivity.create({
        data: {
          userId,
          activityType: `status_changed_to_${status.toLowerCase()}`,
          entityType: 'user',
          entityId: userId,
        },
      });
    }

    return updatedUser;
  }

  /**
   * Verify user identity
   */
  async verifyUser(userId: string, trustLevel: string, adminId?: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Validate trust level
    const validTrustLevels = ['starter', 'trusted', 'leader'];
    if (!validTrustLevels.includes(trustLevel)) {
      throw new Error(`Invalid trust level. Must be one of: ${validTrustLevels.join(', ')}`);
    }

    // Update trust level
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { trustLevel },
    });

    // Log the verification
    if (adminId) {
      await prisma.userActivity.create({
        data: {
          userId,
          activityType: 'identity_verified',
          entityType: 'user',
          entityId: userId,
        },
      });
    }

    return updatedUser;
  }

  /**
   * Verify user email (emergency override by admin)
   */
  async verifyUserEmail(userId: string, adminId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        security: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Check if already verified
    if (user.security?.emailVerifiedAt) {
      return {
        userId,
        email: user.email,
        alreadyVerified: true,
        verifiedAt: user.security.emailVerifiedAt,
        message: 'Email was already verified',
      };
    }

    // Update email verification status
    await prisma.userSecurity.upsert({
      where: { userId },
      create: {
        userId,
        emailVerifiedAt: new Date(),
      },
      update: {
        emailVerifiedAt: new Date(),
      },
    });

    // Log the admin verification
    await prisma.userActivity.create({
      data: {
        userId: adminId,
        activityType: 'email_verified_by_admin',
        entityType: 'user',
        entityId: userId,
      },
    });

    // Send notification email to user
    try {
      await emailService.sendEmail({
        to: user.email,
        subject: 'Your Email Has Been Verified',
        html: `
          <h2>Email Verification Confirmed</h2>
          <p>Hello ${user.fullName},</p>
          <p>Your email address has been verified by our support team.</p>
          <p>You now have full access to all Berse features.</p>
          <p>Thank you for being part of the Berse community!</p>
          <p>Best regards,<br>The Berse Team</p>
        `,
        text: `Email Verification Confirmed\n\nHello ${user.fullName},\n\nYour email address has been verified by our support team.\n\nYou now have full access to all Berse features.\n\nThank you for being part of the Berse community!\n\nBest regards,\nThe Berse Team`,
      });
    } catch (error) {
      console.error('Failed to send verification confirmation email:', error);
      // Don't throw - email failure shouldn't block verification
    }

    return {
      userId,
      email: user.email,
      verifiedAt: new Date(),
      verifiedBy: adminId,
      message: 'Email verified successfully',
    };
  }

  /**
   * Add admin note to user
   */
  async addAdminNote(userId: string, note: string, adminId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Log the note as activity
    const activity = await prisma.userActivity.create({
      data: {
        userId,
        activityType: 'admin_note_added',
        entityType: 'user',
        entityId: userId,
      },
    });

    return activity;
  }

  /**
   * Delete/permanently remove user
   */
  async deleteUser(userId: string, reason: string, adminId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Soft delete user
    const deletedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        deletedAt: new Date(),
        status: 'DEACTIVATED',
      },
    });

    // Send deletion email to user
    try {
      await emailService.sendAccountDeletionEmail(
        user.email,
        user.fullName,
        reason
      );
    } catch (error) {
      console.error('Failed to send deletion email:', error);
      // Don't throw - email failure shouldn't block deletion
    }

    // Send deletion email to user
    try {
      await emailService.sendAccountDeletionEmail(
        user.email,
        user.fullName,
        reason
      );
    } catch (error) {
      console.error('Failed to send deletion email:', error);
      // Don't throw - email failure shouldn't block deletion
    }

    // Log the deletion
    await prisma.userActivity.create({
      data: {
        userId,
        activityType: 'account_deleted',
        entityType: 'user',
        entityId: userId,
      },
    });

    return deletedUser;
  }

  /**
   * Reset user password - generates random password and sends email
   */
  async resetUserPassword(userId: string, adminId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Generate random secure password (12 characters)
    const crypto = require('crypto');
    const newPassword = crypto.randomBytes(12).toString('base64').slice(0, 12);

    // Hash password
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    // Send email to user with temporary password
    try {
      await emailService.sendAdminPasswordResetEmail(
        user.email,
        user.fullName,
        newPassword
      );
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      // Don't throw - email failure shouldn't block password reset
    }

    // Log the action
    await prisma.userActivity.create({
      data: {
        userId,
        activityType: 'password_reset_by_admin',
        entityType: 'user',
        entityId: userId,
      },
    });

    return {
      userId: user.id,
      email: user.email,
      temporaryPassword: newPassword,
      emailSent: true, // Email is now sent above
    };
  }

  /**
   * Update user role
   */
  async updateUserRole(userId: string, role: 'GENERAL_USER' | 'GUIDE' | 'MODERATOR' | 'ADMIN', adminId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Update role
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
    });

    // Log the action
    await prisma.userActivity.create({
      data: {
        userId,
        activityType: 'role_changed',
        entityType: 'user',
        entityId: userId,
      },
    });

    return updatedUser;
  }
}
