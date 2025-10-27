import { prisma } from '../config/database';
import {
  EnrichedUserProfile,
  ProfileEnrichmentOptions,
  VerificationBadges,
  TrustMetrics,
  UserStats,
  ConnectionStats,
  BadgeInfo,
  VouchSummary,
  UserProfileData,
  MutualData,
} from '../types/profile-enrichment.types';

export class ProfileEnrichmentService {
  /**
   * Get enriched user profile with all stats, badges, trust info
   */
  static async getEnrichedProfile(
    userId: string,
    options: ProfileEnrichmentOptions = {}
  ): Promise<EnrichedUserProfile> {
    const {
      includePrivateFields = false,
      requestingUserId,
      includeServiceStats = true,
      includeBadges = true,
      includeVouches = true,
      includeConnectionStats = true,
    } = options;

    // Fetch all related data in parallel for performance
    const [
      user,
      profile,
      security,
      stats,
      connectionStats,
      badges,
      vouches,
      mutualData,
    ] = await Promise.all([
      // Core user
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          fullName: true,
          username: true,
          trustLevel: true,
          trustScore: true,
          createdAt: true,
        },
      }),
      
      // User profile
      prisma.userProfile.findUnique({
        where: { userId },
        select: {
          displayName: true,
          profilePicture: true,
          bio: true,
          shortBio: true,
          profession: true,
          age: true,
          gender: true,
          personalityType: true,
          interests: true,
          languages: true,
          travelStyle: true,
          website: true,
          instagramHandle: true,
          linkedinHandle: true,
        },
      }),
      
      // Security (for verification status)
      prisma.userSecurity.findUnique({
        where: { userId },
        select: {
          emailVerifiedAt: true,
          phoneVerifiedAt: true,
          lastSeenAt: true,
        },
      }),
      
      // User stats
      prisma.userStat.findUnique({
        where: { userId },
        select: {
          eventsAttended: true,
          eventsHosted: true,
          vouchesReceived: true,
          vouchesGiven: true,
          servicesProvided: true,
          communitiesJoined: true,
          totalPoints: true,
        },
      }),
      
      // Connection stats
      includeConnectionStats
        ? prisma.connectionStat.findUnique({
            where: { userId },
            select: {
              totalConnections: true,
              averageRating: true,
              totalReviewsReceived: true,
              totalReviewsGiven: true,
              connectionQuality: true,
              trustChainDepth: true,
            },
          })
        : null,
      
      // Badges
      includeBadges
        ? prisma.userBadge.findMany({
            where: { userId },
            include: {
              badges: {
                select: {
                  type: true,
                  name: true,
                  description: true,
                  imageUrl: true,
                  category: true,
                  tier: true,
                },
              },
            },
            orderBy: { earnedAt: 'desc' },
          })
        : [],
      
      // Vouches
      includeVouches
        ? prisma.vouch.findMany({
            where: { voucheeId: userId, status: 'ACTIVE' },
            select: { vouchType: true },
          })
        : [],
      
      // Mutual data (if requesting user provided)
      requestingUserId ? this.getMutualData(userId, requestingUserId) : null,
    ]);

    if (!user) {
      throw new Error('User not found');
    }

    // Build verification badges
    const verificationBadges: VerificationBadges = {
      email: !!security?.emailVerifiedAt,
      phone: !!security?.phoneVerifiedAt,
      identity: false, // TODO: Implement identity verification
      address: false, // TODO: Implement address verification
    };

    // Build trust metrics
    const trust: TrustMetrics = {
      trustLevel: user.trustLevel,
      trustScore: user.trustScore,
      isVerified: verificationBadges.email && verificationBadges.phone,
      verificationBadges,
    };

    // Build user stats
    const userStats: UserStats = {
      eventsAttended: stats?.eventsAttended || 0,
      eventsHosted: stats?.eventsHosted || 0,
      vouchesReceived: stats?.vouchesReceived || 0,
      vouchesGiven: stats?.vouchesGiven || 0,
      servicesProvided: stats?.servicesProvided || 0,
      communitiesJoined: stats?.communitiesJoined || 0,
      totalPoints: stats?.totalPoints || 0,
    };

    // Build connection stats
    const connStats: ConnectionStats | null = connectionStats
      ? {
          totalConnections: connectionStats.totalConnections,
          averageRating: connectionStats.averageRating || undefined,
          totalReviewsReceived: connectionStats.totalReviewsReceived,
          totalReviewsGiven: connectionStats.totalReviewsGiven,
          connectionQuality: connectionStats.connectionQuality,
          trustChainDepth: connectionStats.trustChainDepth,
        }
      : null;

    // Build badges array
    const badgesList: BadgeInfo[] = badges.map((ub) => ({
      type: ub.badges.type,
      name: ub.badges.name,
      description: ub.badges.description,
      imageUrl: ub.badges.imageUrl || undefined,
      earnedAt: ub.earnedAt,
      category: ub.badges.category || undefined,
      tier: ub.badges.tier || undefined,
    }));

    // Aggregate vouch counts
    const vouchCounts: VouchSummary = {
      primary: vouches.filter((v) => v.vouchType === 'PRIMARY').length,
      secondary: vouches.filter((v) => v.vouchType === 'SECONDARY').length,
      community: vouches.filter((v) => v.vouchType === 'COMMUNITY').length,
      total: vouches.length,
    };

    // Build profile data
    const profileData: UserProfileData = {
      displayName: profile?.displayName || undefined,
      bio: profile?.bio || undefined,
      shortBio: profile?.shortBio || undefined,
      profession: profile?.profession || undefined,
      age: profile?.age || undefined,
      gender: profile?.gender || undefined,
      personalityType: profile?.personalityType || undefined,
      interests: profile?.interests || [],
      languages: profile?.languages || [],
      travelStyle: profile?.travelStyle || undefined,
      website: includePrivateFields ? profile?.website || undefined : undefined,
      instagramHandle: includePrivateFields ? profile?.instagramHandle || undefined : undefined,
      linkedinHandle: includePrivateFields ? profile?.linkedinHandle || undefined : undefined,
    };

    // Build enriched profile
    const enrichedProfile: EnrichedUserProfile = {
      id: user.id,
      fullName: user.fullName,
      username: user.username || undefined,
      profilePicture: profile?.profilePicture || undefined,
      
      profile: profileData,
      trust,
      stats: userStats,
      connectionStats: connStats,
      badges: badgesList,
      vouches: vouchCounts,
      
      // Mutual data
      mutualConnections: mutualData?.connections,
      mutualCommunities: mutualData?.communities,
      mutualEvents: mutualData?.events,
      
      // Activity
      lastSeenAt: security?.lastSeenAt || undefined,
      memberSince: user.createdAt,
    };

    return enrichedProfile;
  }

  /**
   * Get mutual connections, communities, and events between two users
   */
  private static async getMutualData(
    userId: string,
    requestingUserId: string
  ): Promise<MutualData> {
    // Get mutual connections
    const [userConnections, requestingUserConnections] = await Promise.all([
      prisma.userConnection.findMany({
        where: {
          OR: [
            { initiatorId: userId, status: 'ACCEPTED' },
            { receiverId: userId, status: 'ACCEPTED' },
          ],
        },
        select: { initiatorId: true, receiverId: true },
      }),
      prisma.userConnection.findMany({
        where: {
          OR: [
            { initiatorId: requestingUserId, status: 'ACCEPTED' },
            { receiverId: requestingUserId, status: 'ACCEPTED' },
          ],
        },
        select: { initiatorId: true, receiverId: true },
      }),
    ]);

    // Extract connection IDs
    const userConnectionIds = new Set(
      userConnections.map((c) => (c.initiatorId === userId ? c.receiverId : c.initiatorId))
    );
    const requestingUserConnectionIds = new Set(
      requestingUserConnections.map((c) =>
        c.initiatorId === requestingUserId ? c.receiverId : c.initiatorId
      )
    );

    // Find mutual connections
    const mutualConnectionIds = [...userConnectionIds].filter((id) =>
      requestingUserConnectionIds.has(id)
    );

    // Get mutual communities
    const [userCommunities, requestingUserCommunities] = await Promise.all([
      prisma.communityMember.findMany({
        where: { userId, isApproved: true },
        select: { communityId: true },
      }),
      prisma.communityMember.findMany({
        where: { userId: requestingUserId, isApproved: true },
        select: { communityId: true },
      }),
    ]);

    const userCommunityIds = new Set(userCommunities.map((c) => c.communityId));
    const requestingUserCommunityIds = new Set(
      requestingUserCommunities.map((c) => c.communityId)
    );

    const mutualCommunityIds = [...userCommunityIds].filter((id) =>
      requestingUserCommunityIds.has(id)
    );

    // Get mutual events (attended or hosted)
    const [userEvents, requestingUserEvents] = await Promise.all([
      prisma.eventParticipant.findMany({
        where: { userId, status: { in: ['CONFIRMED', 'CHECKED_IN'] } },
        select: { eventId: true },
      }),
      prisma.eventParticipant.findMany({
        where: { userId: requestingUserId, status: { in: ['CONFIRMED', 'CHECKED_IN'] } },
        select: { eventId: true },
      }),
    ]);

    const userEventIds = new Set(userEvents.map((e) => e.eventId));
    const requestingUserEventIds = new Set(requestingUserEvents.map((e) => e.eventId));

    const mutualEventIds = [...userEventIds].filter((id) =>
      requestingUserEventIds.has(id)
    );

    return {
      connections: mutualConnectionIds.length,
      communities: mutualCommunityIds.length,
      events: mutualEventIds.length,
    };
  }

  /**
   * Get enriched profiles for multiple users (batch operation)
   */
  static async getEnrichedProfiles(
    userIds: string[],
    options: ProfileEnrichmentOptions = {}
  ): Promise<EnrichedUserProfile[]> {
    return Promise.all(
      userIds.map((userId) => this.getEnrichedProfile(userId, options))
    );
  }

  /**
   * Calculate activity level based on last seen and response metrics
   */
  static calculateActivityLevel(
    lastSeenAt?: Date,
    responseRate?: number,
    averageResponseTime?: number
  ): 'Very Active' | 'Active' | 'Occasional' | 'Inactive' {
    if (!lastSeenAt) return 'Inactive';

    const hoursSinceLastSeen =
      (Date.now() - lastSeenAt.getTime()) / (1000 * 60 * 60);

    // Very Active: online recently, fast response
    if (
      hoursSinceLastSeen < 24 &&
      (responseRate || 0) >= 90 &&
      (averageResponseTime || 999) <= 6
    ) {
      return 'Very Active';
    }

    // Active: online in past few days
    if (hoursSinceLastSeen < 72 && (responseRate || 0) >= 75) {
      return 'Active';
    }

    // Occasional: online in past week
    if (hoursSinceLastSeen < 168) {
      return 'Occasional';
    }

    return 'Inactive';
  }

  /**
   * Calculate response time display string
   */
  static getResponseTimeDisplay(averageResponseTime?: number): string {
    if (!averageResponseTime) return 'Response time unknown';

    if (averageResponseTime <= 1) return 'Responds within 1 hour';
    if (averageResponseTime <= 6) return 'Responds within a few hours';
    if (averageResponseTime <= 24) return 'Responds within a day';
    if (averageResponseTime <= 72) return 'Responds within a few days';

    return 'Response time varies';
  }
}
