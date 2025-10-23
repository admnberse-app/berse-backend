/**
 * Dashboard Service
 * Handles data aggregation from multiple modules for dashboard views
 */

import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error';
import { DashboardSummary, MyCommunity, MyEvent, MyListing, Activity, Alert } from './dashboard.types';

export class DashboardService {
  /**
   * Get comprehensive dashboard summary for user
   */
  async getDashboardSummary(userId: string): Promise<DashboardSummary> {
    // Fetch user basic info with trust data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        trustScore: true,
        trustLevel: true,
        totalPoints: true,
        profile: {
          select: {
            profilePicture: true,
            displayName: true,
          },
        },
        stats: {
          select: {
            eventsAttended: true,
            eventsHosted: true,
            vouchesGiven: true,
            vouchesReceived: true,
            listingsPosted: true,
            communitiesJoined: true,
          },
        },
        _count: {
          select: {
            userBadges: true,
            vouchesReceived: {
              where: { status: 'APPROVED' }
            },
          },
        },
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Get counts in parallel
    const [
      communitiesData,
      eventsData,
      listingsData,
      connectionsCount,
      servicesData,
      recentActivity,
    ] = await Promise.all([
      this.getCommunitiesSummary(userId),
      this.getEventsSummary(userId),
      this.getListingsSummary(userId),
      this.getConnectionsCount(userId),
      this.getServicesSummary(userId),
      this.getRecentActivity(userId, 10),
    ]);

    // Generate alerts
    const alerts = await this.generateAlerts(userId);

    // Split fullName into firstName and lastName
    const nameParts = user.fullName.trim().split(' ');
    const firstName = nameParts[0] || 'User';
    const lastName = nameParts.slice(1).join(' ') || undefined;

    return {
      user: {
        id: user.id,
        firstName,
        lastName,
        displayName: user.profile?.displayName || undefined,
        profilePicture: user.profile?.profilePicture || undefined,
        trustScore: user.trustScore || 0,
        trustLevel: user.trustLevel || 'starter',
        totalPoints: user.totalPoints || 0,
        badgesCount: user._count?.userBadges || 0,
        vouchesCount: user._count?.vouchesReceived || 0,
      },
      stats: {
        communities: communitiesData.total,
        events: eventsData.total,
        listings: listingsData.total,
        connections: connectionsCount,
        eventsAttended: user.stats?.eventsAttended || 0,
        eventsHosted: user.stats?.eventsHosted || 0,
        homeSurf: {
          isEnabled: servicesData.homeSurf.isEnabled,
          totalBookings: servicesData.homeSurf.totalBookings,
          pendingRequests: servicesData.homeSurf.pendingRequests,
        },
        berseGuide: {
          isEnabled: servicesData.berseGuide.isEnabled,
          totalSessions: servicesData.berseGuide.totalSessions,
          upcomingTours: servicesData.berseGuide.upcomingTours,
        },
      },
      alerts,
      communitySummary: {
        total: communitiesData.total,
        admin: communitiesData.admin,
        member: communitiesData.member,
      },
      eventSummary: {
        total: eventsData.total,
        hosting: eventsData.hosting,
        attending: eventsData.attending,
        upcoming: eventsData.upcoming,
      },
      listingSummary: {
        total: listingsData.total,
        active: listingsData.active,
        sold: listingsData.sold,
        draft: listingsData.draft,
      },
      services: servicesData,
      recentActivity,
    };
  }

  /**
   * Get user's communities with role information
   */
  async getMyCommunities(userId: string, limit: number = 50): Promise<MyCommunity[]> {
    const memberships = await prisma.communityMember.findMany({
      where: {
        userId,
        isApproved: true,
      },
      select: {
        id: true,
        role: true,
        joinedAt: true,
        communityId: true,
      },
      orderBy: { joinedAt: 'desc' },
      take: limit,
    });

    // Fetch community details separately
    const communityIds = memberships.map(m => m.communityId);
    const communityDetails = await prisma.community.findMany({
      where: { id: { in: communityIds } },
      select: {
        id: true,
        name: true,
        logoUrl: true,
        coverImageUrl: true,
        category: true,
        isVerified: true,
      },
    });

    const communityMap = new Map(communityDetails.map(c => [c.id, c]));
    const communities: MyCommunity[] = [];

    for (const membership of memberships) {
      const community = communityMap.get(membership.communityId);
      if (!community) continue;

      // Count members manually
      const memberCount = await prisma.communityMember.count({
        where: {
          communityId: community.id,
          isApproved: true,
        },
      });
      
      // Get pending approvals count if user is admin
      let pendingApprovals = undefined;
      if (membership.role === 'ADMIN') {
        const pendingCount = await prisma.communityMember.count({
          where: {
            communityId: community.id,
            isApproved: false,
          },
        });
        pendingApprovals = pendingCount;
      }

      communities.push({
        id: community.id,
        name: community.name,
        slug: community.name.toLowerCase().replace(/\s+/g, '-'), // Generate slug from name
        profileImage: community.logoUrl || undefined,
        location: undefined, // Not in schema
        memberCount,
        userRole: membership.role.toLowerCase() as 'admin' | 'member',
        pendingApprovals,
        isPrivate: false, // Not in schema - default to false
        joinedAt: membership.joinedAt,
        category: community.category || undefined,
        isVerified: community.isVerified || undefined,
      });
    }

    return communities;
  }

  /**
   * Get user's events (both hosting and attending)
   */
  async getMyEvents(
    userId: string,
    status: 'upcoming' | 'past' | 'all' = 'upcoming',
    limit: number = 50
  ): Promise<MyEvent[]> {
    const now = new Date();
    const dateFilter = status === 'upcoming' 
      ? { gte: now } 
      : status === 'past' 
      ? { lt: now } 
      : undefined;

    // Get events user is hosting
    const hostedEvents = await prisma.event.findMany({
      where: {
        hostId: userId,
        ...(dateFilter && { date: dateFilter }),
      },
      include: {
        communities: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            eventParticipants: {
              where: { status: 'REGISTERED' }
            }
          }
        }
      },
      orderBy: { date: status === 'past' ? 'desc' : 'asc' },
      take: limit,
    });

    // Get events user is attending
    const attendingParticipants = await prisma.eventParticipant.findMany({
      where: {
        userId,
      },
      select: {
        id: true,
        status: true,
        eventId: true,
        createdAt: true,
      },
      take: limit,
    });

    // Fetch event details separately
    const attendingEventIds = attendingParticipants.map(p => p.eventId);
    const attendingEventDetails = await prisma.event.findMany({
      where: {
        id: { in: attendingEventIds },
        ...(dateFilter && { date: dateFilter }),
      },
      include: {
        communities: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            eventParticipants: {
              where: { status: 'REGISTERED' }
            }
          }
        }
      },
      orderBy: { date: status === 'past' ? 'desc' : 'asc' },
    });

    const attendingEventMap = new Map(attendingEventDetails.map(e => [e.id, e]));
    const participantMap = new Map(attendingParticipants.map(p => [p.eventId, p]));

    // Combine and deduplicate
    const eventMap = new Map<string, MyEvent>();

    // Add hosted events
    for (const event of hostedEvents) {
      const images = event.images && event.images.length > 0 ? event.images : [];
      eventMap.set(event.id, {
        id: event.id,
        title: event.title,
        startsAt: event.date,
        endsAt: event.date, // Using same date as schema doesn't have endsAt
        location: event.location ? {
          name: event.location,
          address: event.location,
        } : undefined,
        coverImage: images[0] || undefined,
        attendeeCount: event._count.eventParticipants,
        maxAttendees: event.maxAttendees || undefined,
        userRole: 'host',
        rsvpStatus: 'going',
        community: event.communities ? {
          id: event.communities.id,
          name: event.communities.name,
        } : undefined,
        eventType: event.type || undefined,
      });
    }

    // Add attending events (if not already added as host)
    for (const event of attendingEventDetails) {
      if (!eventMap.has(event.id)) {
        const participant = participantMap.get(event.id);
        const images = event.images && event.images.length > 0 ? event.images : [];
        eventMap.set(event.id, {
          id: event.id,
          title: event.title,
          startsAt: event.date,
          endsAt: event.date,
          location: event.location ? {
            name: event.location,
            address: event.location,
          } : undefined,
          coverImage: images[0] || undefined,
          attendeeCount: event._count.eventParticipants,
          maxAttendees: event.maxAttendees || undefined,
          userRole: 'attendee',
          rsvpStatus: participant?.status === 'REGISTERED' ? 'going' : 'not_going',
          community: event.communities ? {
            id: event.communities.id,
            name: event.communities.name,
          } : undefined,
          eventType: event.type || undefined,
        });
      }
    }

    return Array.from(eventMap.values()).slice(0, limit);
  }

  /**
   * Get user's marketplace listings
   */
  async getMyListings(
    userId: string,
    status?: 'active' | 'sold' | 'draft' | 'archived',
    limit: number = 50
  ): Promise<MyListing[]> {
    const whereClause: any = { userId };
    if (status) {
      whereClause.status = status.toUpperCase() as 'ACTIVE' | 'SOLD' | 'DRAFT' | 'ARCHIVED';
    }

    const listings = await prisma.marketplaceListing.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return listings.map(listing => ({
      id: listing.id,
      title: listing.title,
      description: listing.description || undefined,
      price: listing.price,
      currency: listing.currency,
      images: listing.images,
      location: listing.location || undefined,
      status: listing.status.toLowerCase() as 'active' | 'sold' | 'draft' | 'archived',
      viewCount: 0, // Schema doesn't have viewCount
      messageCount: 0, // TODO: Add message count when messaging is implemented
      createdAt: listing.createdAt,
      updatedAt: listing.updatedAt,
      category: listing.category || undefined,
    }));
  }

  /**
   * Get recent activity for user
   */
  async getRecentActivity(userId: string, limit: number = 20): Promise<Activity[]> {
    const activities: Activity[] = [];

    // Get admin community IDs
    const adminCommunityIds = await prisma.communityMember.findMany({
      where: {
        userId,
        role: 'ADMIN',
        isApproved: true,
      },
      select: { communityId: true },
    }).then(memberships => memberships.map(m => m.communityId));

    if (adminCommunityIds.length > 0) {
      // Get recent community joins (from communities user manages)
      const recentJoins = await prisma.communityMember.findMany({
        where: {
          communityId: { in: adminCommunityIds },
          isApproved: true,
          userId: { not: userId },
        },
        select: {
          id: true,
          joinedAt: true,
          userId: true,
          communityId: true,
        },
        orderBy: { joinedAt: 'desc' },
        take: 5,
      });

      // Fetch user and community details
      const userIds = recentJoins.map(j => j.userId);
      const communityIds = recentJoins.map(j => j.communityId);

      const [users, communities] = await Promise.all([
        prisma.user.findMany({
          where: { id: { in: userIds } },
          select: { id: true, fullName: true },
        }),
        prisma.community.findMany({
          where: { id: { in: communityIds } },
          select: { id: true, name: true },
        }),
      ]);

      const userMap = new Map(users.map(u => [u.id, u]));
      const communityMap = new Map(communities.map(c => [c.id, c]));

      for (const join of recentJoins) {
        const user = userMap.get(join.userId);
        const community = communityMap.get(join.communityId);
        if (user && community) {
          const firstName = user.fullName.split(' ')[0];
          activities.push({
            id: `join_${join.id}`,
            type: 'community_join',
            icon: '🎉',
            message: `${firstName} joined your community`,
            targetName: community.name,
            timestamp: join.joinedAt,
            targetId: community.id,
            targetType: 'community',
            read: false,
          });
        }
      }
    }

    // Get recent event participants for user's hosted events
    const hostedEventIds = await prisma.event.findMany({
      where: { hostId: userId },
      select: { id: true },
    }).then(events => events.map(e => e.id));

    if (hostedEventIds.length > 0) {
      const recentParticipants = await prisma.eventParticipant.findMany({
        where: {
          eventId: { in: hostedEventIds },
          userId: { not: userId },
          status: 'REGISTERED',
        },
        select: {
          id: true,
          createdAt: true,
          userId: true,
          eventId: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      });

      // Fetch user and event details
      const participantUserIds = recentParticipants.map(p => p.userId);
      const participantEventIds = recentParticipants.map(p => p.eventId);

      const [users, events] = await Promise.all([
        prisma.user.findMany({
          where: { id: { in: participantUserIds } },
          select: { id: true, fullName: true },
        }),
        prisma.event.findMany({
          where: { id: { in: participantEventIds } },
          select: { id: true, title: true },
        }),
      ]);

      const userMap = new Map(users.map(u => [u.id, u]));
      const eventMap = new Map(events.map(e => [e.id, e]));

      for (const participant of recentParticipants) {
        const user = userMap.get(participant.userId);
        const event = eventMap.get(participant.eventId);
        if (user && event) {
          const firstName = user.fullName.split(' ')[0];
          activities.push({
            id: `participant_${participant.id}`,
            type: 'event_rsvp',
            icon: '✅',
            message: `${firstName} is attending your event`,
            targetName: event.title,
            timestamp: participant.createdAt,
            targetId: event.id,
            targetType: 'event',
            read: false,
          });
        }
      }
    }

    // Sort all activities by timestamp and take limit
    activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    return activities.slice(0, limit);
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  private async getCommunitiesSummary(userId: string) {
    const memberships = await prisma.communityMember.findMany({
      where: {
        userId,
        isApproved: true,
      },
      select: {
        role: true,
      },
    });

    const total = memberships.length;
    const admin = memberships.filter(m => m.role === 'ADMIN').length;
    const member = memberships.filter(m => m.role === 'MEMBER').length;

    return { total, admin, member };
  }

  private async getEventsSummary(userId: string) {
    const now = new Date();

    const [hosted, attending, upcoming] = await Promise.all([
      prisma.event.count({
        where: { hostId: userId },
      }),
      prisma.eventParticipant.count({
        where: {
          userId,
          status: 'REGISTERED',
        },
      }),
      prisma.event.count({
        where: {
          OR: [
            { hostId: userId },
            {
              eventParticipants: {
                some: {
                  userId,
                  status: 'REGISTERED',
                },
              },
            },
          ],
          date: { gte: now },
        },
      }),
    ]);

    return {
      total: hosted + attending,
      hosting: hosted,
      attending,
      upcoming,
    };
  }

  private async getListingsSummary(userId: string) {
    const listings = await prisma.marketplaceListing.findMany({
      where: { userId },
      select: { status: true },
    });

    const summary = {
      total: listings.length,
      active: 0,
      sold: 0,
      draft: 0,
    };

    for (const listing of listings) {
      if (listing.status === 'ACTIVE') summary.active++;
      if (listing.status === 'SOLD') summary.sold++;
      if (listing.status === 'DRAFT') summary.draft++;
    }

    return summary;
  }

  private async getConnectionsCount(userId: string): Promise<number> {
    // Count approved connections
    const count = await prisma.userConnection.count({
      where: {
        OR: [
          { initiatorId: userId, status: 'ACCEPTED' },
          { receiverId: userId, status: 'ACCEPTED' },
        ],
      },
    });

    return count;
  }

  private async getServicesSummary(userId: string) {
    const [homeSurf, berseGuide] = await Promise.all([
      prisma.userHomeSurf.findUnique({
        where: { userId },
        select: {
          isEnabled: true,
          city: true,
          accommodationType: true,
        },
      }),
      prisma.userBerseGuide.findUnique({
        where: { userId },
        select: {
          isEnabled: true,
          city: true,
          guideTypes: true,
          highlights: true,
        },
      }),
    ]);

    // Get booking counts and pending requests
    const now = new Date();
    const [
      homeSurfBookings,
      homeSurfPending,
      berseGuideBookings,
      berseGuideSessions,
      berseGuideUpcoming,
    ] = await Promise.all([
      homeSurf ? prisma.homeSurfBooking.count({
        where: {
          hostId: userId,
        },
      }) : 0,
      homeSurf ? prisma.homeSurfBooking.count({
        where: {
          hostId: userId,
          status: 'PENDING',
        },
      }) : 0,
      berseGuide ? prisma.berseGuideBooking.count({
        where: {
          guideId: userId,
        },
      }) : 0,
      berseGuide ? prisma.berseGuideSession.count({
        where: {
          booking: {
            guideId: userId,
          },
        },
      }) : 0,
      berseGuide ? prisma.berseGuideBooking.count({
        where: {
          guideId: userId,
          status: 'APPROVED',
          agreedDate: {
            gte: now,
          },
        },
      }) : 0,
    ]);

    // Get average ratings
    const [homeSurfRating, berseGuideRating] = await Promise.all([
      homeSurf ? prisma.homeSurfReview.aggregate({
        where: {
          revieweeId: userId,
        },
        _avg: {
          rating: true,
        },
      }) : null,
      berseGuide ? prisma.berseGuideReview.aggregate({
        where: {
          guideId: userId,
        },
        _avg: {
          rating: true,
        },
      }) : null,
    ]);

    return {
      homeSurf: {
        isEnabled: homeSurf?.isEnabled || false,
        hasProfile: !!homeSurf,
        totalBookings: homeSurfBookings,
        pendingRequests: homeSurfPending,
        averageRating: homeSurfRating?._avg.rating || null,
        city: homeSurf?.city || null,
        accommodationType: homeSurf?.accommodationType || null,
      },
      berseGuide: {
        isEnabled: berseGuide?.isEnabled || false,
        hasProfile: !!berseGuide,
        totalBookings: berseGuideBookings,
        totalSessions: berseGuideSessions,
        upcomingTours: berseGuideUpcoming,
        averageRating: berseGuideRating?._avg.rating || null,
        city: berseGuide?.city || null,
        guideTypes: berseGuide?.guideTypes || [],
        highlights: berseGuide?.highlights || [],
      },
    };
  }

  private async generateAlerts(userId: string): Promise<Alert[]> {
    const alerts: Alert[] = [];

    // Check for pending community approvals
    const adminCommunities = await prisma.communityMember.findMany({
      where: {
        userId,
        role: 'ADMIN',
        isApproved: true,
      },
      select: {
        communityId: true,
      },
    });

    // Fetch community details
    const communityIds = adminCommunities.map(m => m.communityId);
    const communities = await prisma.community.findMany({
      where: { id: { in: communityIds } },
      select: { id: true, name: true },
    });
    const communityMap = new Map(communities.map(c => [c.id, c]));

    for (const membership of adminCommunities) {
      const pendingCount = await prisma.communityMember.count({
        where: {
          communityId: membership.communityId,
          isApproved: false,
        },
      });

      if (pendingCount > 0) {
        const community = communityMap.get(membership.communityId);
        if (community) {
          alerts.push({
            type: 'community_approvals',
            count: pendingCount,
            priority: 'high',
            message: `${pendingCount} pending community approval${pendingCount > 1 ? 's' : ''}`,
            targetId: community.id,
            targetName: community.name,
            targetType: 'community',
          });
        }
      }
    }

    // Check for upcoming events this week
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const upcomingEvents = await prisma.event.findMany({
      where: {
        OR: [
          { hostId: userId },
          {
            eventParticipants: {
              some: {
                userId,
                status: 'REGISTERED',
              },
            },
          },
        ],
        date: {
          gte: now,
          lte: weekFromNow,
        },
      },
      orderBy: { date: 'asc' },
      take: 1,
    });

    if (upcomingEvents.length > 0) {
      const nextEvent = upcomingEvents[0];
      const totalUpcoming = await prisma.event.count({
        where: {
          OR: [
            { hostId: userId },
            {
              eventParticipants: {
                some: {
                  userId,
                  status: 'REGISTERED',
                },
              },
            },
          ],
          date: {
            gte: now,
            lte: weekFromNow,
          },
        },
      });

      alerts.push({
        type: 'upcoming_events',
        count: totalUpcoming,
        priority: 'medium',
        message: `${totalUpcoming} upcoming event${totalUpcoming > 1 ? 's' : ''} this week`,
        nextEvent: {
          id: nextEvent.id,
          title: nextEvent.title,
          startsAt: nextEvent.date,
        },
      });
    }

    return alerts;
  }
}
