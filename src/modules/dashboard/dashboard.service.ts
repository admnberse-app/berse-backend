/**
 * Dashboard Service
 * Handles data aggregation from multiple modules for dashboard views
 */

import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error';
import { DashboardSummary, MyCommunity, MyEvent, MyListing, Activity, Alert } from './dashboard.types';
import { ActivityLoggerService } from '../../services/activityLogger.service';

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
      userActivities,
    ] = await Promise.all([
      this.getCommunitiesSummary(userId),
      this.getEventsSummary(userId),
      this.getListingsSummary(userId),
      this.getConnectionsCount(userId),
      this.getServicesSummary(userId),
      ActivityLoggerService.getUserActivityHistory(userId, 20, 0), // Fetch more to filter out system activities
    ]);

    // Transform user activities into dashboard activity format
    const recentActivity = await this.transformActivities(userActivities);

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
      },
      homeSurf: servicesData.homeSurf,
      berseGuide: servicesData.berseGuide,
      alerts,
      communitySummary: {
        total: communitiesData.total,
        admin: communitiesData.admin,
        member: communitiesData.member,
        pendingRequests: communitiesData.pendingRequests,
        pendingJoinRequests: communitiesData.pendingJoinRequests,
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
              where: { status: { in: ['REGISTERED', 'CONFIRMED'] } }
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
              where: { status: { in: ['REGISTERED', 'CONFIRMED'] } }
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
          rsvpStatus: participant?.status === 'REGISTERED' || participant?.status === 'CONFIRMED' ? 'going' : 'not_going',
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
      include: {
        pricingOptions: true
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return listings.map(listing => {
      const defaultPricing = listing.pricingOptions?.find(p => p.isDefault) || listing.pricingOptions?.[0];
      return {
        id: listing.id,
        title: listing.title,
        description: listing.description || undefined,
        price: defaultPricing?.price || 0,
        currency: defaultPricing?.currency || 'MYR',
        images: listing.images,
        location: listing.location || undefined,
        status: listing.status.toLowerCase() as 'active' | 'sold' | 'draft' | 'archived',
        viewCount: listing.viewCount || 0,
        messageCount: 0, // TODO: Add message count when messaging is implemented
        createdAt: listing.createdAt,
        updatedAt: listing.updatedAt,
        category: listing.category || undefined,
      };
    });
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
          status: { in: ['REGISTERED', 'CONFIRMED'] },
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
        communityId: true,
      },
    });

    const total = memberships.length;
    const admin = memberships.filter(m => m.role === 'ADMIN').length;
    const member = memberships.filter(m => m.role === 'MEMBER').length;

    // Count pending join requests for communities where user is admin (to approve)
    const adminCommunityIds = memberships
      .filter(m => m.role === 'ADMIN')
      .map(m => m.communityId);

    // Count user's own pending join requests (waiting for approval)
    const [pendingRequests, pendingJoinRequests] = await Promise.all([
      adminCommunityIds.length > 0
        ? prisma.communityMember.count({
            where: {
              communityId: { in: adminCommunityIds },
              isApproved: false,
            },
          })
        : 0,
      prisma.communityMember.count({
        where: {
          userId,
          isApproved: false,
        },
      }),
    ]);

    return { total, admin, member, pendingRequests, pendingJoinRequests };
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
          status: { in: ['REGISTERED', 'CONFIRMED'] },
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
                  status: { in: ['REGISTERED', 'CONFIRMED'] },
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
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // 1. COMMUNITY APPROVALS (High Priority) - For admins and moderators only
    const adminModeratorCommunities = await prisma.communityMember.findMany({
      where: {
        userId,
        role: { in: ['ADMIN', 'MODERATOR'] },
        isApproved: true,
      },
      select: {
        communityId: true,
      },
    });

    if (adminModeratorCommunities.length > 0) {
      const communityIds = adminModeratorCommunities.map(m => m.communityId);
      const communities = await prisma.community.findMany({
        where: { id: { in: communityIds } },
        select: { id: true, name: true },
      });
      const communityMap = new Map(communities.map(c => [c.id, c]));

      for (const membership of adminModeratorCommunities) {
        const pendingMembers = await prisma.communityMember.findMany({
          where: {
            communityId: membership.communityId,
            isApproved: false,
          },
          include: {
            user: {
              select: {
                fullName: true,
                profile: {
                  select: {
                    profilePicture: true,
                  },
                },
              },
            },
          },
          take: 5, // Show up to 5 pending members in metadata
          orderBy: { joinedAt: 'desc' },
        });

        if (pendingMembers.length > 0) {
          const community = communityMap.get(membership.communityId);
          if (community) {
            const totalPending = await prisma.communityMember.count({
              where: {
                communityId: membership.communityId,
                isApproved: false,
              },
            });

            alerts.push({
              type: 'community_approvals',
              count: totalPending,
              priority: 'high',
              message: `${totalPending} pending member${totalPending > 1 ? 's' : ''} in ${community.name}`,
              targetId: community.id,
              targetName: community.name,
              targetType: 'community',
              actionUrl: `/communities/${community.id}/members/pending`,
              metadata: {
                communityId: community.id,
                pendingMembers: pendingMembers.map(pm => ({
                  userId: pm.userId,
                  userName: pm.user.fullName,
                  profilePicture: pm.user.profile?.profilePicture,
                  requestedAt: pm.joinedAt,
                })),
              },
            });
          }
        }
      }
    }

    // 2. USER'S PENDING COMMUNITY JOIN REQUESTS (High Priority)
    const userPendingJoins = await prisma.communityMember.findMany({
      where: {
        userId,
        isApproved: false,
      },
      include: {
        communities: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
          },
        },
      },
      orderBy: { joinedAt: 'desc' },
      take: 5,
    });

    if (userPendingJoins.length > 0) {
      const totalPendingJoins = userPendingJoins.length;

      alerts.push({
        type: 'community_join_pending',
        count: totalPendingJoins,
        priority: 'medium',
        message: `${totalPendingJoins} community join request${totalPendingJoins > 1 ? 's' : ''} pending approval`,
        targetType: 'community',
        actionUrl: '/profile/communities',
        metadata: {
          pendingCommunities: userPendingJoins.map(pj => ({
            communityId: pj.communityId,
            communityName: pj.communities?.name || 'Unknown',
            communityLogo: pj.communities?.logoUrl,
            requestedAt: pj.joinedAt,
          })),
        },
      });
    }

    // 3. CONNECTION REQUESTS (High Priority) - Received requests
    const pendingConnections = await prisma.userConnection.findMany({
      where: {
        receiverId: userId,
        status: 'PENDING',
      },
      include: {
        users_user_connections_initiatorIdTousers: {
          select: {
            fullName: true,
            profile: {
              select: {
                profilePicture: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    if (pendingConnections.length > 0) {
      const totalConnectionRequests = await prisma.userConnection.count({
        where: {
          receiverId: userId,
          status: 'PENDING',
        },
      });

      alerts.push({
        type: 'connection_requests',
        count: totalConnectionRequests,
        priority: 'high',
        message: `${totalConnectionRequests} pending connection request${totalConnectionRequests > 1 ? 's' : ''}`,
        targetType: 'connection',
        actionUrl: '/profile/connections',
        metadata: {
          requests: pendingConnections.map(conn => ({
            id: conn.id,
            fromUserId: conn.initiatorId,
            fromUserName: conn.users_user_connections_initiatorIdTousers.fullName,
            fromUserProfilePicture: conn.users_user_connections_initiatorIdTousers.profile?.profilePicture,
            requestedAt: conn.createdAt,
          })),
        },
      });
    }

    // 4. VOUCH REQUESTS (High Priority) - Received vouch requests
    const pendingVouches = await prisma.vouch.findMany({
      where: {
        voucheeId: userId,
        status: 'PENDING',
      },
      include: {
        users_vouches_voucherIdTousers: {
          select: {
            fullName: true,
            profile: {
              select: {
                profilePicture: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    if (pendingVouches.length > 0) {
      const totalVouchRequests = await prisma.vouch.count({
        where: {
          voucheeId: userId,
          status: 'PENDING',
        },
      });

      alerts.push({
        type: 'vouch_requests',
        count: totalVouchRequests,
        priority: 'high',
        message: `${totalVouchRequests} pending vouch request${totalVouchRequests > 1 ? 's' : ''}`,
        targetType: 'vouch',
        actionUrl: '/vouches/requests',
        metadata: {
          requests: pendingVouches.map(vouch => ({
            id: vouch.id,
            fromUserId: vouch.voucherId,
            fromUserName: vouch.users_vouches_voucherIdTousers.fullName,
            fromUserProfilePicture: vouch.users_vouches_voucherIdTousers.profile?.profilePicture,
            requestedAt: vouch.createdAt,
            message: vouch.message || undefined,
          })),
        },
      });
    }

    // 4. EVENT PAYMENT REQUIRED (High Priority) - User needs to pay for events
    const unpaidTickets = await prisma.eventTicket.findMany({
      where: {
        userId,
        paymentStatus: 'PENDING',
        status: 'PENDING',
        events: {
          date: { gte: now },
        },
      },
      include: {
        events: {
          select: {
            id: true,
            title: true,
            date: true,
          },
        },
      },
      orderBy: {
        events: {
          date: 'asc',
        },
      },
    });

    for (const ticket of unpaidTickets) {
      const daysUntil = Math.ceil((ticket.events.date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      alerts.push({
        type: 'event_payment_required',
        count: 1,
        priority: 'high',
        message: `Payment required for "${ticket.events.title}"`,
        targetId: ticket.events.id,
        targetName: ticket.events.title,
        targetType: 'event',
        actionUrl: `/events/${ticket.events.id}/payment`,
        metadata: {
          eventDate: ticket.events.date,
          daysUntilEvent: daysUntil,
        },
      });
    }

    // 5. EVENT PAYMENT PENDING ATTENDEES (High Priority) - For hosts with unpaid attendees
    const hostedEventsWithPayments = await prisma.event.findMany({
      where: {
        hostId: userId,
        date: { gte: now },
      },
      select: {
        id: true,
        title: true,
        date: true,
        eventTickets: {
          where: {
            paymentStatus: 'PENDING',
            status: 'PENDING',
          },
        },
      },
    });

    for (const event of hostedEventsWithPayments) {
      const unpaidCount = event.eventTickets.length;
      
      if (unpaidCount > 0) {
        const daysUntil = Math.ceil((event.date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        alerts.push({
          type: 'event_payment_pending_attendees',
          count: unpaidCount,
          priority: 'high',
          message: `${unpaidCount} unpaid attendee${unpaidCount > 1 ? 's' : ''} for "${event.title}"`,
          targetId: event.id,
          targetName: event.title,
          targetType: 'event',
          actionUrl: `/events/${event.id}/participants?filter=unpaid`,
          metadata: {
            eventDate: event.date,
            unpaidCount,
            daysUntilEvent: daysUntil,
          },
        });
      }
    }

    // 6. NEW EVENT PARTICIPANTS (Medium Priority) - For hosts (ONLY upcoming events)
    const recentParticipants = await prisma.eventParticipant.findMany({
      where: {
        events: {
          hostId: userId,
          date: { gte: now }, // Only upcoming events
        },
        userId: { not: userId },
        createdAt: { gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) }, // Last 24 hours
      },
      include: {
        events: {
          select: {
            id: true,
            title: true,
            date: true,
            maxAttendees: true,
          },
        },
      },
    });

    // Group by event and filter out past events
    const participantsByEvent = new Map<string, typeof recentParticipants>();
    for (const participant of recentParticipants) {
      // Double-check event hasn't passed
      if (participant.events.date < now) continue;
      
      const existing = participantsByEvent.get(participant.eventId) || [];
      existing.push(participant);
      participantsByEvent.set(participant.eventId, existing);
    }

    for (const [eventId, participants] of participantsByEvent) {
      const event = participants[0].events;
      const totalParticipants = await prisma.eventParticipant.count({
        where: {
          eventId,
          status: { in: ['REGISTERED', 'CONFIRMED'] },
        },
      });

      alerts.push({
        type: 'event_new_participants',
        count: participants.length,
        priority: 'medium',
        message: `${participants.length} new participant${participants.length > 1 ? 's' : ''} for "${event.title}"`,
        targetId: event.id,
        targetName: event.title,
        targetType: 'event',
        actionUrl: `/events/${event.id}/participants`,
        metadata: {
          eventDate: event.date,
          participantCount: totalParticipants,
          maxAttendees: event.maxAttendees || undefined,
        },
      });
    }

    // 7. UPCOMING EVENTS (Medium Priority) - Events in next 3 days
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const urgentUpcomingEvents = await prisma.event.findMany({
      where: {
        OR: [
          { hostId: userId },
          {
            eventParticipants: {
              some: {
                userId,
                status: { in: ['REGISTERED', 'CONFIRMED'] },
              },
            },
          },
        ],
        date: {
          gte: now,
          lte: threeDaysFromNow,
        },
      },
      select: {
        id: true,
        title: true,
        date: true,
        hostId: true,
        eventParticipants: {
          where: {
            status: { in: ['REGISTERED', 'CONFIRMED'] },
          },
        },
        maxAttendees: true,
      },
      orderBy: { date: 'asc' },
    });

    for (const event of urgentUpcomingEvents) {
      const daysUntil = Math.ceil((event.date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const isHost = event.hostId === userId;
      const participantCount = event.eventParticipants.length;

      alerts.push({
        type: 'event_upcoming',
        count: 1,
        priority: daysUntil <= 1 ? 'high' : 'medium',
        message: `"${event.title}" is ${daysUntil === 0 ? 'today' : daysUntil === 1 ? 'tomorrow' : `in ${daysUntil} days`}`,
        targetId: event.id,
        targetName: event.title,
        targetType: 'event',
        actionUrl: `/events/${event.id}`,
        metadata: {
          eventDate: event.date,
          daysUntilEvent: daysUntil,
          participantCount: isHost ? participantCount : undefined,
          maxAttendees: isHost ? event.maxAttendees || undefined : undefined,
        },
      });
    }

    // Sort alerts by priority and then by count
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    alerts.sort((a, b) => {
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return b.count - a.count;
    });

    return alerts;
  }

  /**
   * Transform UserActivity records into Dashboard Activity format
   */
  private async transformActivities(userActivities: any[]): Promise<Activity[]> {
    const activities: Activity[] = [];

    for (const activity of userActivities) {
      // Map activity types to dashboard format - only include meaningful user actions
      const activityTypeMap: Record<string, { type: Activity['type'], icon: string, messageTemplate: string }> = {
        // Events
        'EVENT_RSVP': { type: 'event_rsvp', icon: '✅', messageTemplate: 'Registered for event' },
        'EVENT_CHECKIN': { type: 'event_checkin', icon: '📍', messageTemplate: 'Checked in to event' },
        'EVENT_TICKET_PURCHASE': { type: 'event_rsvp', icon: '🎫', messageTemplate: 'Purchased ticket for event' },
        
        // Marketplace
        'LISTING_CREATE': { type: 'listing_comment', icon: '📝', messageTemplate: 'Created marketplace listing' },
        'ORDER_PAYMENT_SUCCESS': { type: 'listing_sold', icon: '💰', messageTemplate: 'Completed purchase' },
        'ORDER_SHIP': { type: 'listing_sold', icon: '📦', messageTemplate: 'Order shipped' },
        'ORDER_DELIVER': { type: 'listing_sold', icon: '✅', messageTemplate: 'Order delivered' },
        
        // Connections & Community
        'CONNECTION_REQUEST_ACCEPT': { type: 'connection_request', icon: '🤝', messageTemplate: 'Connection accepted' },
        'CONNECTION_REQUEST_SEND': { type: 'connection_request', icon: '👋', messageTemplate: 'Connection request sent' },
        
        // Rewards
        'POINTS_EARN': { type: 'badge_earned', icon: '⭐', messageTemplate: 'Earned points' },
        'REWARD_REDEEM': { type: 'badge_earned', icon: '🎁', messageTemplate: 'Redeemed reward' },
        
        // Note: Excluding AUTH_LOGIN and other security/system events as they're not meaningful for dashboard
      };

      const mapping = activityTypeMap[activity.activityType];
      if (mapping) {
        activities.push({
          id: activity.id,
          type: mapping.type,
          icon: mapping.icon,
          message: mapping.messageTemplate,
          timestamp: activity.createdAt,
          targetId: activity.entityId || undefined,
          targetType: activity.entityType as any,
          read: false,
        });
      }
    }

    // Return only the last 5 meaningful activities
    return activities.slice(0, 5);
  }
}
