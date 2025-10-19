import { PrismaClient } from '@prisma/client';
import {
  DiscoverFeedParams,
  DiscoverFeedResponse,
  DiscoverItem,
  DiscoverContentType,
  DiscoverSourceType,
  EventDiscoverItem,
  CommunityDiscoverItem,
  MarketplaceDiscoverItem,
  UserContext
} from './discover.types';
import { EventService } from '../events/event.service';
import { CommunityService } from '../communities/community.service';
import { MarketplaceService } from '../marketplace/marketplace.service';
import { AppError } from '../../middleware/error';

const prisma = new PrismaClient();
// EventService methods are static, no instance needed
const communityService = new CommunityService();
const marketplaceService = new MarketplaceService();

export class DiscoverService {
  /**
   * Get unified discover feed combining events, communities, and marketplace
   */
  async getDiscoverFeed(
    userId: string | undefined,
    params: DiscoverFeedParams
  ): Promise<DiscoverFeedResponse> {
    const {
      page = 1,
      limit = 20,
      contentType = 'all',
      search,
      location,
      category,
      communityType,
      fromDate,
      toDate,
      usePersonalization = true
    } = params;

    // Get user context for personalization
    const userContext = userId && usePersonalization
      ? await this.getUserContext(userId)
      : undefined;

    // Determine which content types to fetch
    const fetchEvents = contentType === 'all' || contentType === DiscoverContentType.EVENT;
    const fetchCommunities = contentType === 'all' || contentType === DiscoverContentType.COMMUNITY;
    const fetchMarketplace = contentType === 'all' || contentType === DiscoverContentType.MARKETPLACE;

    // Fetch content from all sources in parallel
    const [events, communities, listings] = await Promise.all([
      fetchEvents
        ? this.fetchEventsContent(userId, userContext, { location, category, fromDate, toDate, search })
        : Promise.resolve([]),
      fetchCommunities
        ? this.fetchCommunitiesContent(userId, userContext, { communityType, search })
        : Promise.resolve([]),
      fetchMarketplace
        ? this.fetchMarketplaceContent(userId, userContext, { location, category, search })
        : Promise.resolve([])
    ]);

    // Combine and transform all items
    let allItems: DiscoverItem[] = [
      ...events.map(e => this.transformEventToDiscoverItem(e)),
      ...communities.map(c => this.transformCommunityToDiscoverItem(c)),
      ...listings.map(l => this.transformMarketplaceToDiscoverItem(l))
    ];

    // Apply personalized ranking if user context is available
    if (userContext) {
      allItems = this.rankItemsByRelevance(allItems, userContext);
    } else {
      // Fallback: Mix content types evenly
      allItems = this.mixContentTypes(allItems);
    }

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedItems = allItems.slice(startIndex, endIndex);

    // Calculate content type counts
    const contentTypeCounts = {
      events: events.length,
      communities: communities.length,
      marketplace: listings.length
    };

    return {
      data: paginatedItems,
      pagination: {
        page,
        limit,
        total: allItems.length,
        totalPages: Math.ceil(allItems.length / limit),
        hasMore: endIndex < allItems.length
      },
      meta: {
        contentTypeCounts,
        personalizationApplied: !!userContext
      }
    };
  }

  /**
   * Get user context for personalization
   */
  private async getUserContext(userId: string): Promise<UserContext> {
    const [userProfile, userLocation, userCommunities, userConnections] = await Promise.all([
      prisma.userProfile.findUnique({
        where: { userId },
        select: { interests: true }
      }),
      prisma.userLocation.findUnique({
        where: { userId },
        select: { currentCity: true, countryOfResidence: true }
      }),
      prisma.communityMember.findMany({
        where: { userId },
        select: { communityId: true }
      }),
      prisma.userConnection.findMany({
        where: {
          OR: [
            { initiatorId: userId, status: 'ACCEPTED' },
            { receiverId: userId, status: 'ACCEPTED' }
          ]
        },
        select: { initiatorId: true, receiverId: true }
      })
    ]);

    const location = userLocation
      ? `${userLocation.currentCity || ''}${userLocation.currentCity && userLocation.countryOfResidence ? ', ' : ''}${userLocation.countryOfResidence || ''}`
      : undefined;

    const connectionIds = userConnections.map(conn =>
      conn.initiatorId === userId ? conn.receiverId : conn.initiatorId
    );

    return {
      userId,
      location,
      interests: Array.isArray(userProfile?.interests) ? userProfile.interests as string[] : [],
      communityIds: userCommunities.map(cm => cm.communityId),
      connectionIds
    };
  }

  /**
   * Fetch events content from multiple sources
   */
  private async fetchEventsContent(
    userId: string | undefined,
    userContext: UserContext | undefined,
    filters: { location?: string; category?: string; fromDate?: Date; toDate?: Date; search?: string }
  ): Promise<any[]> {
    const limit = 15; // Fetch more items than needed for better mixing

    if (userId && userContext) {
      // Personalized: Get recommended, nearby, and trending
      const [recommended, trending] = await Promise.all([
        EventService.getRecommendedEvents(userId, 10).catch(() => []),
        EventService.getTrendingEvents(5, userId).catch(() => [])
      ]);

      return [...recommended, ...trending].slice(0, limit);
    } else {
      // Non-personalized: Get trending events
      const trending = await EventService.getTrendingEvents(limit).catch(() => []);
      return trending;
    }
  }

  /**
   * Fetch communities content from multiple sources
   */
  private async fetchCommunitiesContent(
    userId: string | undefined,
    userContext: UserContext | undefined,
    filters: { communityType?: string; search?: string }
  ): Promise<any[]> {
    const limit = 15;

    if (userId && userContext) {
      // Personalized: Get recommended, trending, and new
      const [recommended, trending, newCommunities] = await Promise.all([
        communityService.getRecommendedCommunities(userId, 8).catch(() => []),
        communityService.getTrendingCommunities(userId, 5).catch(() => []),
        communityService.getNewCommunities(userId, 2).catch(() => [])
      ]);

      return [...recommended, ...trending, ...newCommunities].slice(0, limit);
    } else {
      // Non-personalized: Get trending and new
      const [trending, newCommunities] = await Promise.all([
        communityService.getTrendingCommunities(undefined, 10).catch(() => []),
        communityService.getNewCommunities(undefined, 5).catch(() => [])
      ]);

      return [...trending, ...newCommunities].slice(0, limit);
    }
  }

  /**
   * Fetch marketplace content from multiple sources
   */
  private async fetchMarketplaceContent(
    userId: string | undefined,
    userContext: UserContext | undefined,
    filters: { location?: string; category?: string; search?: string }
  ): Promise<any[]> {
    const limit = 15;

    if (userId && userContext) {
      // Personalized: Get recommended and trending
      const [recommended, trending] = await Promise.all([
        marketplaceService.getRecommendedListings(userId, { limit: 10, category: filters.category }).catch(() => ({ data: [] })),
        marketplaceService.getTrendingListings({ limit: 5, category: filters.category, location: filters.location }).catch(() => ({ data: [] }))
      ]);

      return [...recommended.data, ...trending.data].slice(0, limit);
    } else {
      // Non-personalized: Get trending
      const trending = await marketplaceService.getTrendingListings({
        limit,
        category: filters.category,
        location: filters.location
      }).catch(() => ({ data: [] }));

      return trending.data;
    }
  }

  /**
   * Transform event to discover item
   */
  private transformEventToDiscoverItem(event: any): EventDiscoverItem {
    return {
      type: DiscoverContentType.EVENT,
      sourceType: DiscoverSourceType.TRENDING, // TODO: Track actual source
      id: event.id,
      title: event.title,
      description: event.description,
      eventType: event.type,
      images: event.images || [],
      date: event.date,
      location: event.location,
      mapLink: event.mapLink,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
      hostId: event.hostId,
      host: event.host || event.users || {
        id: event.hostId,
        fullName: 'Unknown',
        username: null
      },
      _count: event._count
    };
  }

  /**
   * Transform community to discover item
   */
  private transformCommunityToDiscoverItem(community: any): CommunityDiscoverItem {
    return {
      type: DiscoverContentType.COMMUNITY,
      sourceType: DiscoverSourceType.TRENDING, // TODO: Track actual source
      id: community.id,
      name: community.name,
      description: community.description,
      communityType: community.type,
      tags: community.tags || [],
      avatar: community.avatar,
      coverPhoto: community.coverPhoto,
      isVerified: community.isVerified,
      isPrivate: community.isPrivate,
      createdAt: community.createdAt,
      updatedAt: community.updatedAt,
      createdBy: community.createdBy,
      creator: community.creator || community.users || {
        id: community.createdBy,
        fullName: 'Unknown',
        username: null
      },
      _count: community._count
    };
  }

  /**
   * Transform marketplace listing to discover item
   */
  private transformMarketplaceToDiscoverItem(listing: any): MarketplaceDiscoverItem {
    return {
      type: DiscoverContentType.MARKETPLACE,
      sourceType: DiscoverSourceType.TRENDING, // TODO: Track actual source
      id: listing.id,
      title: listing.title,
      description: listing.description,
      category: listing.category,
      price: listing.price,
      currency: listing.currency,
      quantity: listing.quantity,
      location: listing.location,
      images: listing.images || [],
      status: listing.status,
      createdAt: listing.createdAt,
      updatedAt: listing.updatedAt,
      userId: listing.userId,
      seller: listing.seller || listing.user || {
        id: listing.userId,
        fullName: 'Unknown',
        username: null,
        trustScore: 0
      },
      _count: listing._count
    };
  }

  /**
   * Rank items by relevance based on user context
   */
  private rankItemsByRelevance(items: DiscoverItem[], userContext: UserContext): DiscoverItem[] {
    return items
      .map(item => ({
        item,
        score: this.calculateRelevanceScore(item, userContext)
      }))
      .sort((a, b) => b.score - a.score)
      .map(({ item }) => item);
  }

  /**
   * Calculate relevance score for an item based on user context
   */
  private calculateRelevanceScore(item: DiscoverItem, userContext: UserContext): number {
    let score = 0;

    // Base score by recency (newer items get higher score)
    const daysSinceCreation = (Date.now() - new Date(item.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    score += Math.max(0, 10 - daysSinceCreation); // Max 10 points for very recent items

    // Location match (only for events and marketplace, not communities)
    if (userContext.location &&
        (item.type === DiscoverContentType.EVENT || item.type === DiscoverContentType.MARKETPLACE)) {
      const itemWithLocation = item as EventDiscoverItem | MarketplaceDiscoverItem;
      if (itemWithLocation.location) {
        if (itemWithLocation.location.toLowerCase().includes(userContext.location.toLowerCase()) ||
            userContext.location.toLowerCase().includes(itemWithLocation.location.toLowerCase())) {
          score += 20; // Strong location match
        }
      }
    }

    // Interest match
    if (userContext.interests && userContext.interests.length > 0) {
      const itemText = this.getItemSearchText(item).toLowerCase();
      userContext.interests.forEach(interest => {
        if (itemText.includes(interest.toLowerCase())) {
          score += 5; // Points per interest match
        }
      });
    }

    // Community context (for events from user's communities)
    if (item.type === DiscoverContentType.EVENT) {
      const eventItem = item as EventDiscoverItem;
      // TODO: Check if event is from a community the user is in
    }

    // Engagement boost
    if (item._count) {
      const eventItem = item as any;
      const engagementCount = eventItem._count.eventParticipants ||
                             eventItem._count.members ||
                             eventItem._count.marketplaceCartItems ||
                             0;
      score += Math.min(engagementCount * 0.5, 15); // Max 15 points from engagement
    }

    return score;
  }

  /**
   * Get searchable text from item
   */
  private getItemSearchText(item: DiscoverItem): string {
    switch (item.type) {
      case DiscoverContentType.EVENT:
        const eventItem = item as EventDiscoverItem;
        return `${eventItem.title} ${eventItem.description || ''} ${eventItem.eventType}`;
      case DiscoverContentType.COMMUNITY:
        const communityItem = item as CommunityDiscoverItem;
        return `${communityItem.name} ${communityItem.description || ''} ${communityItem.communityType} ${communityItem.tags.join(' ')}`;
      case DiscoverContentType.MARKETPLACE:
        const marketplaceItem = item as MarketplaceDiscoverItem;
        return `${marketplaceItem.title} ${marketplaceItem.description || ''} ${marketplaceItem.category}`;
      default:
        return '';
    }
  }

  /**
   * Mix content types evenly (fallback when no personalization)
   */
  private mixContentTypes(items: DiscoverItem[]): DiscoverItem[] {
    // Separate by type
    const events = items.filter(i => i.type === DiscoverContentType.EVENT);
    const communities = items.filter(i => i.type === DiscoverContentType.COMMUNITY);
    const marketplace = items.filter(i => i.type === DiscoverContentType.MARKETPLACE);

    // Interleave items from each type
    const mixed: DiscoverItem[] = [];
    const maxLength = Math.max(events.length, communities.length, marketplace.length);

    for (let i = 0; i < maxLength; i++) {
      if (i < events.length) mixed.push(events[i]);
      if (i < communities.length) mixed.push(communities[i]);
      if (i < marketplace.length) mixed.push(marketplace[i]);
    }

    return mixed;
  }
}

export const discoverService = new DiscoverService();
