import prisma from '../../config/database';

export class AdminService {
  /**
   * Get comprehensive dashboard statistics
   */
  async getDashboardStats() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // User statistics
    const [
      totalUsers,
      activeUsers,
      newUsersLast30Days,
      newUsersLast7Days,
      adminCount,
      moderatorCount,
      guideCount,
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
    ]);

    // Community statistics
    const [
      totalCommunities,
      activeCommunities,
      newCommunitiesLast30Days,
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
    ]);

    // Event statistics
    const [
      totalEvents,
      upcomingEvents,
      pastEvents,
      newEventsLast30Days,
      paidEvents,
      freeEvents,
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
    ] = await Promise.all([
      prisma.eventParticipant.count(),
      prisma.communityMember.count({
        where: { isApproved: true },
      }),
    ]);

    return {
      overview: {
        totalUsers,
        totalCommunities,
        totalEvents,
        totalListings,
      },
      users: {
        total: totalUsers,
        active: activeUsers,
        newLast30Days: newUsersLast30Days,
        newLast7Days: newUsersLast7Days,
        byRole: {
          admin: adminCount,
          moderator: moderatorCount,
          guide: guideCount,
          generalUser: totalUsers - adminCount - moderatorCount - guideCount,
        },
      },
      communities: {
        total: totalCommunities,
        active: activeCommunities,
        newLast30Days: newCommunitiesLast30Days,
        totalMembers: totalCommunityMembers,
      },
      events: {
        total: totalEvents,
        upcoming: upcomingEvents,
        past: pastEvents,
        newLast30Days: newEventsLast30Days,
        paid: paidEvents,
        free: freeEvents,
        totalParticipants: totalEventParticipants,
      },
      marketplace: {
        total: totalListings,
        active: activeListings,
        sold: soldListings,
        newLast30Days: newListingsLast30Days,
      },
      gamification: {
        totalPointsDistributed: totalPoints._sum.totalPoints || 0,
        totalBadges,
        totalRewards,
        totalVouches,
      },
      engagement: {
        totalVouchesGiven: totalVouches,
        avgCommunitiesPerUser: totalUsers > 0 ? (totalCommunityMembers / totalUsers).toFixed(2) : 0,
        avgEventsPerUser: totalUsers > 0 ? (totalEventParticipants / totalUsers).toFixed(2) : 0,
      },
      recentActivities: await this.getRecentActivities(),
    };
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

    // Get total count and users
    const [total, users] = await Promise.all([
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
          security: {
            select: {
              lastSeenAt: true,
            },
          },
          _count: {
            select: {
              events: true,
              communityMembers: true,
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

    const formattedUsers = users.map(user => ({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      username: user.username,
      role: user.role,
      status: user.status,
      trustLevel: user.trustLevel,
      trustScore: user.trustScore,
      totalPoints: user.totalPoints,
      joinedAt: user.createdAt,
      lastActive: user.security?.lastSeenAt || null,
      eventsCount: user._count.events,
      communitiesCount: user._count.communityMembers,
    }));

    return {
      users: formattedUsers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get detailed user information by ID
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

    // Get recent activity
    const recentActivity = await prisma.userActivity.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return {
      ...user,
      recentActivity,
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
  async deleteUser(userId: string) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        deletedAt: new Date(),
        status: 'BANNED',
      },
    });
  }

  /**
   * Suspend a user account
   */
  async suspendUser(userId: string, reason?: string) {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        status: 'DEACTIVATED',
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        status: true,
      },
    });

    // Log the suspension
    await prisma.userActivity.create({
      data: {
        userId,
        activityType: 'account_suspended',
        entityType: 'user',
        entityId: userId,
      },
    });

    return updatedUser;
  }

  /**
   * Activate a suspended user
   */
  async activateUser(userId: string) {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        status: 'ACTIVE',
      },
      select: {
        id: true,
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
   * Export users as CSV
   */
  async exportUsers(filters: { role?: string; status?: string }) {
    const where: any = {
      deletedAt: null,
    };

    if (filters.role) {
      where.role = filters.role;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    const users = await prisma.user.findMany({
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
        security: {
          select: {
            lastSeenAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Generate CSV
    const headers = ['ID', 'Full Name', 'Email', 'Username', 'Role', 'Status', 'Trust Level', 'Trust Score', 'Total Points', 'Joined At', 'Last Active'];
    const csvRows = [headers.join(',')];

    for (const user of users) {
      const row = [
        user.id,
        `"${user.fullName}"`,
        user.email || '',
        user.username || '',
        user.role,
        user.status,
        user.trustLevel,
        user.trustScore,
        user.totalPoints,
        user.createdAt.toISOString(),
        user.security?.lastSeenAt?.toISOString() || '',
      ];
      csvRows.push(row.join(','));
    }

    return csvRows.join('\n');
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
   * Manually verify a user
   */
  async verifyUser(userId: string) {
    // Check if user has security record
    const userSecurity = await prisma.userSecurity.findUnique({
      where: { userId },
    });

    if (!userSecurity) {
      // Create security record if it doesn't exist
      await prisma.userSecurity.create({
        data: {
          userId,
          emailVerifiedAt: new Date(),
          phoneVerifiedAt: new Date(),
        },
      });
    } else {
      // Update existing record
      await prisma.userSecurity.update({
        where: { userId },
        data: {
          emailVerifiedAt: userSecurity.emailVerifiedAt || new Date(),
          phoneVerifiedAt: userSecurity.phoneVerifiedAt || new Date(),
        },
      });
    }

    // Log the verification
    await prisma.userActivity.create({
      data: {
        userId,
        activityType: 'account_verified',
        entityType: 'user',
        entityId: userId,
      },
    });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        security: {
          select: {
            emailVerifiedAt: true,
            phoneVerifiedAt: true,
          },
        },
      },
    });

    return user;
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

    // TODO: Send actual warning email using email service
    // await emailService.sendWarningEmail(user.email, reason, message);

    return {
      userId,
      userName: user.fullName,
      email: user.email,
      reason,
      message,
      sentAt: new Date(),
      sentBy: adminId,
      // In production, this would return email service response
      emailStatus: 'pending_implementation',
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
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            username: true,
          },
        },
        communities: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
          },
        },
        tier: {
          select: {
            id: true,
            tierName: true,
            description: true,
            price: true,
            currency: true,
            totalQuantity: true,
            soldQuantity: true,
            isActive: true,
          },
        },
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

    // Get participant breakdown
    const participantStats = await prisma.eventParticipant.groupBy({
      by: ['status'],
      where: { eventId },
      _count: true,
    });

    // Get revenue if paid event
    let revenue = 0;
    if (!event.isFree) {
      const tickets = await prisma.eventTicket.findMany({
        where: { eventId },
        select: { price: true },
      });
      revenue = tickets.reduce((sum, ticket) => sum + ticket.price, 0);
    }

    return {
      ...event,
      participantStats,
      revenue,
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
}
