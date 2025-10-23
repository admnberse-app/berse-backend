import { PrismaClient } from '@prisma/client';
import {
  DiscoverQueryParams,
  DiscoverContentType,
  DiscoverSectionType,
  DiscoverLayoutType,
  DiscoverItemLayout,
  DiscoverSortBy,
  DefaultDiscoverResponse,
  SearchDiscoverResponse,
  EmptyDiscoverResponse,
  DiscoverSection,
  DiscoverItem,
  EventItem,
  CommunityItem,
  MarketplaceItem,
  ServiceItem,
  UserItem,
  UserContext,
  LocationInfo,
  PaginationInfo
} from './discover.types';
import { AppError } from '../../middleware/error';
import logger from '../../utils/logger';

const prisma = new PrismaClient();

export class DiscoverService {
  private readonly DEFAULT_RADIUS = 50; // km
  private readonly MAX_RADIUS = 500; // km
  private readonly DEFAULT_LIMIT = 10;
  private readonly MAX_LIMIT = 50;
  private readonly CACHE_EXPIRY = 300; // 5 minutes

  /**
   * Main discover endpoint - returns sections or search results
   */
  async discover(
    userId: string | undefined,
    params: DiscoverQueryParams
  ): Promise<DefaultDiscoverResponse | SearchDiscoverResponse | EmptyDiscoverResponse> {
    // Validate and set defaults
    const validatedParams = this.validateParams(params);

    // Get location info
    const locationInfo = await this.getLocationInfo(userId, validatedParams);

    // If search query is provided, return search results
    if (validatedParams.q) {
      return this.searchContent(userId, validatedParams, locationInfo);
    }

    // Otherwise, return default sections
    return this.getDefaultSections(userId, validatedParams, locationInfo);
  }

  /**
   * Get trending content
   */
  async getTrending(
    userId: string | undefined,
    params: Partial<DiscoverQueryParams>
  ): Promise<any> {
    const validatedParams = this.validateParams(params);
    const locationInfo = await this.getLocationInfo(userId, validatedParams);

    const items = await this.fetchTrendingItems(userId, validatedParams, locationInfo);

    return {
      success: true,
      data: {
        location: locationInfo,
        items,
        pagination: this.buildPagination(items.length, validatedParams.page || 1, validatedParams.limit || 20)
      }
    };
  }

  /**
   * Get nearby content
   */
  async getNearby(
    userId: string | undefined,
    params: Partial<DiscoverQueryParams>
  ): Promise<any> {
    if (!params.latitude || !params.longitude) {
      throw new AppError('Latitude and longitude required for nearby content', 400);
    }

    const validatedParams = this.validateParams(params);
    const locationInfo = await this.getLocationInfo(userId, validatedParams);

    const items = await this.fetchNearbyItems(userId, validatedParams, locationInfo);

    return {
      success: true,
      data: {
        location: locationInfo,
        items,
        pagination: this.buildPagination(items.length, validatedParams.page || 1, validatedParams.limit || 20)
      }
    };
  }

  /**
   * Validate and normalize query parameters
   */
  private validateParams(params: Partial<DiscoverQueryParams>): DiscoverQueryParams {
    return {
      ...params,
      page: Math.max(1, params.page || 1),
      limit: Math.min(this.MAX_LIMIT, Math.max(1, params.limit || this.DEFAULT_LIMIT)),
      radius: params.radius ? Math.min(this.MAX_RADIUS, Math.max(1, params.radius)) : this.DEFAULT_RADIUS,
      contentType: params.contentType || DiscoverContentType.ALL,
      sortBy: params.sortBy || DiscoverSortBy.RELEVANCE,
      userInterests: params.userInterests !== false, // default true
      freeOnly: params.freeOnly || false,
      verifiedOnly: params.verifiedOnly || false,
      availableNow: params.availableNow || false
    };
  }

  /**
   * Get location information
   */
  private async getLocationInfo(
    userId: string | undefined,
    params: DiscoverQueryParams
  ): Promise<LocationInfo> {
    const location: LocationInfo = {};

    if (params.city) {
      location.city = params.city;
      // TODO: Geocode city to get country
    }

    if (params.latitude && params.longitude) {
      location.latitude = params.latitude.toString();
      location.longitude = params.longitude.toString();
      // TODO: Reverse geocode to get city/country
    }

    // Fallback to user's location
    if (userId && !location.city) {
      const userLocation = await prisma.userLocation.findUnique({
        where: { userId },
        select: { currentCity: true, countryOfResidence: true }
      });

      if (userLocation) {
        location.city = userLocation.currentCity || undefined;
        location.country = userLocation.countryOfResidence || undefined;
      }
    }

    return location;
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
        select: { currentCity: true, countryOfResidence: true, latitude: true, longitude: true }
      }),
      prisma.communityMember.findMany({
        where: { userId, isApproved: true },
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

    const location = userLocation?.currentCity
      ? `${userLocation.currentCity}${userLocation.countryOfResidence ? ', ' + userLocation.countryOfResidence : ''}`
      : undefined;

    const connectionIds = userConnections.map(conn =>
      conn.initiatorId === userId ? conn.receiverId : conn.initiatorId
    );

    return {
      userId,
      location,
      interests: Array.isArray(userProfile?.interests) ? userProfile.interests as string[] : [],
      communityIds: userCommunities.map(cm => cm.communityId),
      connectionIds,
      latitude: userLocation?.latitude || undefined,
      longitude: userLocation?.longitude || undefined
    };
  }

  /**
   * Get default sections (non-search mode)
   */
  private async getDefaultSections(
    userId: string | undefined,
    params: DiscoverQueryParams,
    locationInfo: LocationInfo
  ): Promise<DefaultDiscoverResponse | EmptyDiscoverResponse> {
    const userContext = userId && params.userInterests
      ? await this.getUserContext(userId)
      : undefined;

    // Determine which sections to include
    const requestedSections = params.sections
      ? params.sections.split(',').map(s => s.trim())
      : null;

    const excludedSections = params.excludeSections
      ? params.excludeSections.split(',').map(s => s.trim())
      : [];

    // Build sections
    const sections: DiscoverSection[] = [];

    // Fetch content for all sections in parallel
    const sectionPromises: Promise<DiscoverSection | null>[] = [];

    if (this.shouldIncludeSection('trending', requestedSections, excludedSections)) {
      sectionPromises.push(this.buildTrendingSection(userId, params, locationInfo, userContext));
    }

    if (this.shouldIncludeSection('nearby', requestedSections, excludedSections) && (params.latitude && params.longitude || userContext?.latitude && userContext?.longitude)) {
      sectionPromises.push(this.buildNearbySection(userId, params, locationInfo, userContext));
    }

    if (this.shouldIncludeSection('communities', requestedSections, excludedSections)) {
      sectionPromises.push(this.buildCommunitiesSection(userId, params, locationInfo, userContext));
    }

    if (this.shouldIncludeSection('upcoming', requestedSections, excludedSections)) {
      sectionPromises.push(this.buildUpcomingSection(userId, params, locationInfo, userContext));
    }

    if (this.shouldIncludeSection('new', requestedSections, excludedSections)) {
      sectionPromises.push(this.buildNewSection(userId, params, locationInfo, userContext));
    }

    if (this.shouldIncludeSection('marketplace', requestedSections, excludedSections)) {
      sectionPromises.push(this.buildMarketplaceSection(userId, params, locationInfo, userContext));
    }

    const resolvedSections = await Promise.all(sectionPromises);

    // Filter out null sections
    sections.push(...resolvedSections.filter(s => s !== null) as DiscoverSection[]);

    // Count total items across all sections
    const totalItems = sections.reduce((sum, section) => sum + section.items.length, 0);

    // Check if we need to expand radius or show global content
    if (totalItems < 5 && locationInfo.city) {
      // Try radius expansion if we have location
      const expandedResult = await this.tryRadiusExpansion(userId, params, locationInfo, userContext);
      if (expandedResult) {
        return expandedResult;
      }
    }

    // Check if completely empty
    if (sections.length === 0 || totalItems === 0) {
      // Try showing global content before showing empty state
      const globalContent = await this.buildGlobalFallback(userId, params, locationInfo, userContext);
      if (globalContent) {
        return globalContent;
      }
      
      return this.buildEmptyResponse(locationInfo, params);
    }

    return {
      success: true,
      data: {
        location: locationInfo,
        sections,
        metadata: {
          timestamp: new Date().toISOString(),
          cacheExpiry: this.CACHE_EXPIRY
        }
      }
    };
  }

  /**
   * Search content across all types
   */
  private async searchContent(
    userId: string | undefined,
    params: DiscoverQueryParams,
    locationInfo: LocationInfo
  ): Promise<SearchDiscoverResponse> {
    const query = params.q!;
    const page = params.page || 1;
    const limit = params.limit || 20;

    // Search across different content types in parallel
    const [events, communities, users, marketplace, services] = await Promise.all([
      params.contentType === DiscoverContentType.ALL || params.contentType === DiscoverContentType.EVENTS
        ? this.searchEvents(query, params)
        : [],
      params.contentType === DiscoverContentType.ALL || params.contentType === DiscoverContentType.COMMUNITIES
        ? this.searchCommunities(query, params)
        : [],
      params.contentType === DiscoverContentType.ALL || params.contentType === DiscoverContentType.USERS
        ? this.searchUsers(query, params)
        : [],
      params.contentType === DiscoverContentType.ALL || params.contentType === DiscoverContentType.MARKETPLACE
        ? this.searchMarketplace(query, params)
        : [],
      params.contentType === DiscoverContentType.ALL || params.contentType === DiscoverContentType.SERVICES
        ? this.searchServices(query, params)
        : []
    ]);

    // Calculate total results
    const totalResults = events.length + communities.length + users.length + marketplace.length + services.length;

    return {
      success: true,
      data: {
        query,
        location: locationInfo,
        results: {
          events: events.length > 0 ? events : undefined,
          communities: communities.length > 0 ? communities : undefined,
          users: users.length > 0 ? users : undefined,
          marketplace: marketplace.length > 0 ? marketplace : undefined,
          services: services.length > 0 ? services : undefined
        },
        pagination: this.buildPagination(totalResults, page, limit)
      }
    };
  }

  /**
   * Build trending section
   */
  private async buildTrendingSection(
    userId: string | undefined,
    params: DiscoverQueryParams,
    locationInfo: LocationInfo,
    userContext?: UserContext
  ): Promise<DiscoverSection | null> {
    const items = await this.fetchTrendingItems(userId, params, locationInfo);

    if (items.length === 0) return null;

    return {
      type: DiscoverSectionType.TRENDING,
      title: 'Trending',
      subtitle: 'Popular right now in your area',
      layout: DiscoverLayoutType.HORIZONTAL,
      itemLayout: DiscoverItemLayout.CARD,
      items: items.slice(0, params.limit || 10),
      hasMore: items.length > (params.limit || 10),
      viewAllEndpoint: '/v2/discover/trending',
      metadata: {
        icon: 'fire',
        color: '#FF5722'
      }
    };
  }

  /**
   * Build nearby section
   */
  private async buildNearbySection(
    userId: string | undefined,
    params: DiscoverQueryParams,
    locationInfo: LocationInfo,
    userContext?: UserContext
  ): Promise<DiscoverSection | null> {
    const items = await this.fetchNearbyItems(userId, params, locationInfo, userContext);

    if (items.length === 0) return null;

    return {
      type: DiscoverSectionType.NEARBY,
      title: 'Near You',
      subtitle: `Events and activities within ${params.radius || 5}km`,
      layout: DiscoverLayoutType.HORIZONTAL,
      itemLayout: DiscoverItemLayout.COMPACT,
      items: items.slice(0, params.limit || 10),
      hasMore: items.length > (params.limit || 10),
      viewAllEndpoint: '/v2/discover/nearby'
    };
  }

  /**
   * Build communities section
   */
  private async buildCommunitiesSection(
    userId: string | undefined,
    params: DiscoverQueryParams,
    locationInfo: LocationInfo,
    userContext?: UserContext
  ): Promise<DiscoverSection | null> {
    const communities = await this.fetchCommunities(userId, params, locationInfo);

    if (communities.length === 0) return null;

    return {
      type: DiscoverSectionType.COMMUNITIES,
      title: 'Popular Communities',
      subtitle: 'Join communities with active members',
      layout: DiscoverLayoutType.VERTICAL,
      itemLayout: DiscoverItemLayout.LIST,
      items: communities.slice(0, params.limit || 10),
      hasMore: communities.length > (params.limit || 10),
      viewAllEndpoint: `/v2/communities?popular=true${locationInfo.city ? '&city=' + locationInfo.city : ''}`
    };
  }

  /**
   * Build upcoming events section
   */
  private async buildUpcomingSection(
    userId: string | undefined,
    params: DiscoverQueryParams,
    locationInfo: LocationInfo,
    userContext?: UserContext
  ): Promise<DiscoverSection | null> {
    const events = await this.fetchUpcomingEvents(userId, params, locationInfo);

    if (events.length === 0) return null;

    return {
      type: DiscoverSectionType.UPCOMING,
      title: 'Upcoming Events',
      subtitle: 'Events happening soon',
      layout: DiscoverLayoutType.VERTICAL,
      itemLayout: DiscoverItemLayout.LIST,
      items: events.slice(0, params.limit || 10),
      hasMore: events.length > (params.limit || 10),
      viewAllEndpoint: '/v2/events?upcoming=true'
    };
  }

  /**
   * Build new content section
   */
  private async buildNewSection(
    userId: string | undefined,
    params: DiscoverQueryParams,
    locationInfo: LocationInfo,
    userContext?: UserContext
  ): Promise<DiscoverSection | null> {
    const items = await this.fetchNewItems(userId, params, locationInfo);

    if (items.length === 0) return null;

    return {
      type: DiscoverSectionType.NEW,
      title: 'New',
      subtitle: 'Recently added content',
      layout: DiscoverLayoutType.HORIZONTAL,
      itemLayout: DiscoverItemLayout.CARD,
      items: items.slice(0, params.limit || 10),
      hasMore: items.length > (params.limit || 10),
      viewAllEndpoint: '/v2/discover/new'
    };
  }

  /**
   * Build marketplace section
   */
  private async buildMarketplaceSection(
    userId: string | undefined,
    params: DiscoverQueryParams,
    locationInfo: LocationInfo,
    userContext?: UserContext
  ): Promise<DiscoverSection | null> {
    const items = await this.fetchMarketplaceItems(userId, params, locationInfo);

    if (items.length === 0) return null;

    return {
      type: DiscoverSectionType.MARKETPLACE,
      title: 'Marketplace',
      subtitle: 'Latest listings',
      layout: DiscoverLayoutType.GRID,
      itemLayout: DiscoverItemLayout.CARD,
      items: items.slice(0, params.limit || 10),
      hasMore: items.length > (params.limit || 10),
      viewAllEndpoint: `/v2/marketplace/listings${locationInfo.city ? '?city=' + locationInfo.city : ''}`
    };
  }

  /**
   * Fetch trending items
   */
  private async fetchTrendingItems(
    userId: string | undefined,
    params: DiscoverQueryParams,
    locationInfo: LocationInfo
  ): Promise<DiscoverItem[]> {
    // Mix of trending events and communities
    const [events, communities] = await Promise.all([
      this.fetchEvents(userId, { ...params, sortBy: DiscoverSortBy.POPULAR }, locationInfo, 5),
      this.fetchCommunities(userId, params, locationInfo, 5)
    ]);

    return this.interleaveItems([events, communities]);
  }

  /**
   * Fetch nearby items
   */
  private async fetchNearbyItems(
    userId: string | undefined,
    params: DiscoverQueryParams,
    locationInfo: LocationInfo,
    userContext?: UserContext
  ): Promise<DiscoverItem[]> {
    if (!params.latitude && !params.longitude && !userContext?.latitude && !userContext?.longitude) {
      return [];
    }

    const lat = params.latitude || userContext?.latitude!;
    const lng = params.longitude || userContext?.longitude!;

    // Fetch nearby events
    const events = await this.fetchEvents(userId, { ...params, sortBy: DiscoverSortBy.DISTANCE }, locationInfo);

    return events;
  }

  /**
   * Fetch new items
   */
  private async fetchNewItems(
    userId: string | undefined,
    params: DiscoverQueryParams,
    locationInfo: LocationInfo
  ): Promise<DiscoverItem[]> {
    const [events, communities, marketplace] = await Promise.all([
      this.fetchEvents(userId, { ...params, sortBy: DiscoverSortBy.DATE }, locationInfo, 4),
      this.fetchCommunities(userId, params, locationInfo, 3),
      this.fetchMarketplaceItems(userId, params, locationInfo, 3)
    ]);

    return this.interleaveItems([events, communities, marketplace]);
  }

  /**
   * Fetch events
   */
  private async fetchEvents(
    userId: string | undefined,
    params: DiscoverQueryParams,
    locationInfo: LocationInfo,
    limit?: number
  ): Promise<EventItem[]> {
    const where: any = {
      status: 'PUBLISHED'
    };

    // Location filter - use city field instead of location text
    if (locationInfo.city) {
      where.city = {
        contains: locationInfo.city,
        mode: 'insensitive'
      };
    }

    // Category filter
    if (params.category) {
      where.type = params.category;
    }

    // Date filters
    if (params.dateFrom || params.dateTo) {
      where.date = {};
      if (params.dateFrom) {
        where.date.gte = new Date(params.dateFrom);
      }
      if (params.dateTo) {
        where.date.lte = new Date(params.dateTo);
      }
    }

    // Price filter
    if (params.freeOnly) {
      where.price = 0;
    } else if (params.priceMin !== undefined || params.priceMax !== undefined) {
      where.price = {};
      if (params.priceMin !== undefined) {
        where.price.gte = params.priceMin;
      }
      if (params.priceMax !== undefined) {
        where.price.lte = params.priceMax;
      }
    }

    const events = await prisma.event.findMany({
      where,
      take: limit || (params.limit || 10),
      orderBy: this.getEventOrderBy(params.sortBy || DiscoverSortBy.RELEVANCE),
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            username: true
          }
        },
        _count: {
          select: {
            eventParticipants: true
          }
        }
      }
    });

    return events.map(e => this.transformEvent(e));
  }

  /**
   * Fetch upcoming events
   */
  private async fetchUpcomingEvents(
    userId: string | undefined,
    params: DiscoverQueryParams,
    locationInfo: LocationInfo
  ): Promise<EventItem[]> {
    const where: any = {
      status: 'PUBLISHED',
      date: {
        gte: new Date()
      }
    };

    if (locationInfo.city) {
      where.location = {
        contains: locationInfo.city,
        mode: 'insensitive'
      };
    }

    const events = await prisma.event.findMany({
      where,
      take: params.limit || 10,
      orderBy: {
        date: 'asc'
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            username: true
          }
        },
        _count: {
          select: {
            eventParticipants: true
          }
        }
      }
    });

    return events.map(e => this.transformEvent(e));
  }

  /**
   * Fetch communities
   */
  private async fetchCommunities(
    userId: string | undefined,
    params: DiscoverQueryParams,
    locationInfo: LocationInfo,
    limit?: number
  ): Promise<CommunityItem[]> {
    const where: any = {};

    // Location filter
    if (locationInfo.city) {
      where.city = {
        contains: locationInfo.city,
        mode: 'insensitive'
      };
    }

    // Verified only filter
    if (params.verifiedOnly) {
      where.isVerified = true;
    }

    const communities = await prisma.community.findMany({
      where,
      take: limit || (params.limit || 10),
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            username: true
          }
        },
        _count: {
          select: {
            communityMembers: true
          }
        }
      }
    });

    return communities.map(c => this.transformCommunity(c));
  }

  /**
   * Fetch marketplace items
   */
  private async fetchMarketplaceItems(
    userId: string | undefined,
    params: DiscoverQueryParams,
    locationInfo: LocationInfo,
    limit?: number
  ): Promise<MarketplaceItem[]> {
    const where: any = {
      status: 'ACTIVE'
    };

    if (locationInfo.city) {
      where.location = {
        contains: locationInfo.city,
        mode: 'insensitive'
      };
    }

    if (params.category) {
      where.category = params.category;
    }

    if (params.priceMin !== undefined || params.priceMax !== undefined) {
      where.price = {};
      if (params.priceMin !== undefined) {
        where.price.gte = params.priceMin;
      }
      if (params.priceMax !== undefined) {
        where.price.lte = params.priceMax;
      }
    }

    const items = await prisma.marketplaceListing.findMany({
      where,
      take: limit || (params.limit || 10),
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            username: true,
            trustScore: true
          }
        }
      }
    });

    return items.map(i => this.transformMarketplaceItem(i));
  }

  /**
   * Search events
   */
  private async searchEvents(query: string, params: DiscoverQueryParams): Promise<EventItem[]> {
    const where: any = {
      status: 'PUBLISHED',
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } }
      ]
    };

    const events = await prisma.event.findMany({
      where,
      take: 20,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            username: true
          }
        },
        _count: {
          select: {
            eventParticipants: true
          }
        }
      }
    });

    return events.map(e => this.transformEvent(e));
  }

  /**
   * Search communities
  /**
   * Search communities
   */
  private async searchCommunities(query: string, params: DiscoverQueryParams): Promise<CommunityItem[]> {
    const where: any = {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } }
      ]
    };
    const communities = await prisma.community.findMany({
      where,
      take: 20,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            username: true
          }
        },
        _count: {
          select: {
            communityMembers: true
          }
        }
      }
    });

    return communities.map(c => this.transformCommunity(c));
  }

  /**
   * Search users
   */
  private async searchUsers(query: string, params: DiscoverQueryParams): Promise<UserItem[]> {
    const where: any = {
      status: 'ACTIVE',
      OR: [
        { fullName: { contains: query, mode: 'insensitive' } },
        { username: { contains: query, mode: 'insensitive' } }
      ]
    };

    if (params.verifiedOnly) {
      where.isVerified = true;
    }

    if (params.trustScoreMin) {
      where.trustScore = {
        gte: params.trustScoreMin
      };
    }

    const users = await prisma.user.findMany({
      where,
      take: 20,
      orderBy: {
        trustScore: 'desc'
      },
      include: {
        profile: {
          select: {
            bio: true,
            interests: true
          }
        },
        location: {
          select: {
            currentCity: true,
            countryOfResidence: true
          }
        }
      }
    });

    return users.map(u => this.transformUser(u));
  }

  /**
   * Search marketplace
   */
  private async searchMarketplace(query: string, params: DiscoverQueryParams): Promise<MarketplaceItem[]> {
    const where: any = {
      status: 'ACTIVE',
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } }
      ]
    };

    const items = await prisma.marketplaceListing.findMany({
      where,
      take: 20,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            username: true,
            trustScore: true
          }
        }
      }
    });

    return items.map(i => this.transformMarketplaceItem(i));
  }

  /**
   * Search services - placeholder
   */
  private async searchServices(query: string, params: DiscoverQueryParams): Promise<ServiceItem[]> {
    // TODO: Implement when services module is ready
    return [];
  }

  /**
   * Transform event to EventItem
   */
  private transformEvent(event: any): EventItem {
    return {
      id: event.id,
      type: 'event',
      title: event.title,
      description: event.description,
      imageUrl: event.images?.[0],
      startTime: event.date.toISOString(),
      endTime: event.endTime?.toISOString(),
      location: event.location ? {
        name: event.location,
        city: event.location,
        distance: undefined // TODO: Calculate distance
      } : undefined,
      attendeeCount: event._count?.eventParticipants || 0,
      maxAttendees: event.maxAttendees || undefined,
      price: {
        amount: event.price || 0,
        currency: event.currency || 'MYR',
        isFree: !event.price || event.price === 0
      },
      host: event.user ? {
        id: event.user.id,
        displayName: event.user.fullName,
        avatarUrl: undefined
      } : undefined,
      categories: event.type ? [event.type] : [],
      detailsUrl: `/v2/events/${event.id}`
    };
  }

  /**
   * Transform community to CommunityItem
   */

  private transformCommunity(community: any): CommunityItem {
    return {
      id: community.id,
      type: 'community',
      name: community.name,
      description: community.description,
      imageUrl: community.logoUrl,
      bannerUrl: community.coverImageUrl,
      memberCount: community._count?.communityMembers || 0,
      activeMembers: undefined, // TODO: Calculate active members
      category: community.category,
      isVerified: community.isVerified || false,
      privacy: 'public', // Communities are public by default
      location: undefined, // TODO: Add location
      admin: community.user ? {
        id: community.user.id,
        displayName: community.user.fullName,
        avatarUrl: undefined
      } : undefined,
      detailsUrl: `/v2/communities/${community.id}`
    };
  }
  /**
   * Transform marketplace item to MarketplaceItem
   */
  private transformMarketplaceItem(item: any): MarketplaceItem {
    return {
      id: item.id,
      type: 'marketplace_item',
      title: item.title,
      description: item.description,
      imageUrl: item.images?.[0],
      images: item.images || [],
      price: {
        amount: item.price,
        currency: item.currency || 'MYR',
        isNegotiable: item.isNegotiable || false
      },
      condition: item.condition,
      category: item.category,
      location: item.location ? {
        city: item.location,
        distance: undefined
      } : undefined,
      seller: item.user ? {
        id: item.user.id,
        displayName: item.user.fullName,
        avatarUrl: undefined,
        trustScore: item.user.trustScore || 0,
        responseRate: undefined // TODO: Calculate
      } : undefined,
      postedAt: item.createdAt.toISOString(),
      detailsUrl: `/v2/marketplace/listings/${item.id}`
    };
  }

  /**
   * Transform user to UserItem
   */
  private transformUser(user: any): UserItem {
    return {
      id: user.id,
      type: 'user',
      displayName: user.fullName,
      bio: user.profile?.bio,
      avatarUrl: undefined,
      location: user.location ? {
        city: user.location.currentCity,
        country: user.location.countryOfResidence
      } : undefined,
      trustScore: user.trustScore || 0,
      connectionStatus: 'not_connected', // TODO: Check actual status
      mutualConnections: 0, // TODO: Calculate
      interests: Array.isArray(user.profile?.interests) ? user.profile.interests as string[] : [],
      memberSince: user.createdAt.toISOString(),
      profileUrl: `/v2/users/${user.id}`
    };
  }

  /**
   * Build empty response
   */
  /**
   * Try expanding search radius progressively to find content
   */
  private async tryRadiusExpansion(
    userId: string | undefined,
    params: DiscoverQueryParams,
    locationInfo: LocationInfo,
    userContext?: UserContext
  ): Promise<DefaultDiscoverResponse | null> {
    const expansionRadii = [100, 200, 500]; // km - progressive expansion
    const currentRadius = params.radius || this.DEFAULT_RADIUS;

    // Only expand if current radius is less than the expansion levels
    for (const expandedRadius of expansionRadii) {
      if (currentRadius >= expandedRadius) continue;

      // Try fetching with expanded radius
      const expandedParams = { ...params, radius: expandedRadius };
      const expandedLocationInfo = { ...locationInfo };

      // Build sections with expanded radius
      const sectionPromises: Promise<DiscoverSection | null>[] = [];
      
      const requestedSections = params.sections?.split(',').map(s => s.trim()) || null;
      const excludedSections = params.excludeSections?.split(',').map(s => s.trim()) || [];

      if (this.shouldIncludeSection('trending', requestedSections, excludedSections)) {
        sectionPromises.push(this.buildTrendingSection(userId, expandedParams, expandedLocationInfo, userContext));
      }
      if (this.shouldIncludeSection('communities', requestedSections, excludedSections)) {
        sectionPromises.push(this.buildCommunitiesSection(userId, expandedParams, expandedLocationInfo, userContext));
      }
      if (this.shouldIncludeSection('upcoming', requestedSections, excludedSections)) {
        sectionPromises.push(this.buildUpcomingSection(userId, expandedParams, expandedLocationInfo, userContext));
      }

      const resolvedSections = await Promise.all(sectionPromises);
      const sections = resolvedSections.filter(s => s !== null) as DiscoverSection[];
      const totalItems = sections.reduce((sum, section) => sum + section.items.length, 0);

      // If we found content, return with expansion metadata
      if (totalItems >= 5) {
        return {
          success: true,
          data: {
            location: expandedLocationInfo,
            expanded: true,
            expandedRadius,
            message: `Limited content in your area. Showing results within ${expandedRadius}km.`,
            sections,
            metadata: {
              timestamp: new Date().toISOString(),
              cacheExpiry: this.CACHE_EXPIRY
            }
          }
        };
      }
    }

    return null; // No content found even with expansion
  }

  /**
   * Build global fallback content when local content is unavailable
   */
  private async buildGlobalFallback(
    userId: string | undefined,
    params: DiscoverQueryParams,
    locationInfo: LocationInfo,
    userContext?: UserContext
  ): Promise<DefaultDiscoverResponse | null> {
    // Fetch global popular content (without location filter)
    const globalLocationInfo: LocationInfo = {}; // Empty location = global

    const sections: DiscoverSection[] = [];

    // Global trending section
    const trendingItems = await this.fetchTrendingItems(userId, { ...params, limit: 10 }, globalLocationInfo);
    if (trendingItems.length > 0) {
      sections.push({
        type: 'global_trending' as any,
        title: 'Trending Worldwide',
        subtitle: 'Popular content from around the globe',
        layout: DiscoverLayoutType.HORIZONTAL,
        itemLayout: DiscoverItemLayout.CARD,
        items: trendingItems.slice(0, 10),
        hasMore: trendingItems.length > 10,
        viewAllEndpoint: '/v2/discover/trending'
      });
    }

    // Global communities
    const communities = await this.fetchCommunities(userId, { ...params, limit: 10 }, globalLocationInfo);
    if (communities.length > 0) {
      sections.push({
        type: 'global_communities' as any,
        title: 'Global Communities',
        subtitle: 'Connect with people worldwide',
        layout: DiscoverLayoutType.VERTICAL,
        itemLayout: DiscoverItemLayout.LIST,
        items: communities.slice(0, 10),
        hasMore: communities.length > 10,
        viewAllEndpoint: '/v2/communities?popular=true'
      });
    }

    // Call to action section
    sections.push({
      type: 'call_to_action' as any,
      title: 'Start Something New',
      subtitle: 'Be a pioneer in your community',
      layout: DiscoverLayoutType.HORIZONTAL,
      itemLayout: DiscoverItemLayout.CARD,
      items: [],
      hasMore: false
    });

    if (sections.length > 0) {
      return {
        success: true,
        data: {
          location: locationInfo,
          isEmpty: true,
          message: `No local content yet in ${locationInfo.city || 'your area'}. Explore global content or be the first to create something!`,
          sections,
          metadata: {
            timestamp: new Date().toISOString(),
            cacheExpiry: this.CACHE_EXPIRY
          }
        }
      };
    }

    return null;
  }

  private buildEmptyResponse(
    locationInfo: LocationInfo,
    params: DiscoverQueryParams
  ): EmptyDiscoverResponse {
    return {
      success: true,
      data: {
        location: locationInfo,
        isEmpty: true,
        message: 'No content available in your area yet. Be the first to create something!',
        sections: [],
        emptyState: {
          title: 'Welcome to Berse!',
          message: "You're among the first here. Start creating events and communities to connect with others.",
          illustration: 'https://cdn.berse.app/illustrations/empty-discover.svg',
          actions: [
            {
              type: 'create_event',
              label: 'Create Event',
              icon: 'calendar_plus',
              route: '/events/create'
            },
            {
              type: 'create_community',
              label: 'Start Community',
              icon: 'users',
              route: '/communities/create'
            },
            {
              type: 'invite_friends',
              label: 'Invite Friends',
              icon: 'user_plus',
              route: '/invite'
            }
          ]
        }
      }
    };
  }

  /**
   * Build pagination info
   */
  private buildPagination(total: number, page: number, limit: number): PaginationInfo {
    const totalPages = Math.ceil(total / limit);

    return {
      currentPage: page,
      totalPages,
      totalResults: total,
      itemsPerPage: limit,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1
    };
  }

  /**
   * Check if section should be included
   */
  private shouldIncludeSection(
    sectionType: string,
    requestedSections: string[] | null,
    excludedSections: string[]
  ): boolean {
    if (excludedSections.includes(sectionType)) {
      return false;
    }

    if (requestedSections) {
      return requestedSections.includes(sectionType);
    }

    return true;
  }

  /**
   * Interleave items from multiple arrays
   */
  private interleaveItems(arrays: DiscoverItem[][]): DiscoverItem[] {
    const result: DiscoverItem[] = [];
    const maxLength = Math.max(...arrays.map(arr => arr.length));

    for (let i = 0; i < maxLength; i++) {
      for (const arr of arrays) {
        if (i < arr.length) {
          result.push(arr[i]);
        }
      }
    }

    return result;
  }

  /**
   * Get event order by clause
   */
  private getEventOrderBy(sortBy: DiscoverSortBy): any {
    switch (sortBy) {
      case DiscoverSortBy.DATE:
        return { date: 'asc' };
      case DiscoverSortBy.POPULAR:
        return { eventParticipants: { _count: 'desc' } };
      case DiscoverSortBy.PRICE_ASC:
        return { price: 'asc' };
      case DiscoverSortBy.PRICE_DESC:
        return { price: 'desc' };
      default:
        return { createdAt: 'desc' };
    }
  }
}

export const discoverService = new DiscoverService();
