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
  HomeSurfItem,
  BerseGuideItem,
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
   * Calculate distance between two coordinates using Haversine formula
   * Returns distance in kilometers
   */
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Convert degrees to radians
   */
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Format distance for display (e.g., "1.5 km", "500 m")
   */
  private formatDistance(distanceKm: number): string {
    if (distanceKm < 1) {
      return `${Math.round(distanceKm * 1000)} m`;
    } else if (distanceKm < 10) {
      return `${distanceKm.toFixed(1)} km`;
    } else {
      return `${Math.round(distanceKm)} km`;
    }
  }

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
   * Get all filter options and enums
   */
  async getFilterOptions(): Promise<any> {
    // Fetch dynamic options from database
    const [eventCategories, productCategories, serviceTypes, communityInterests, cities] = await Promise.all([
      // Get unique event types/categories
      prisma.event.findMany({
        where: { status: 'PUBLISHED' },
        select: { type: true },
        distinct: ['type']
      }),
      // Get unique product categories from marketplace
      prisma.marketplaceListing.findMany({
        where: { 
          status: 'ACTIVE',
          type: 'PRODUCT'
        },
        select: { category: true },
        distinct: ['category']
      }),
      // Get unique service types from marketplace
      prisma.marketplaceListing.findMany({
        where: { 
          status: 'ACTIVE',
          type: 'SERVICE'
        },
        select: { serviceType: true },
        distinct: ['serviceType']
      }),
      // Get all unique community interests
      prisma.community.findMany({
        select: { interests: true }
      }).then(communities => {
        // Flatten and get unique interests
        const allInterests = communities.flatMap(c => c.interests || []);
        return [...new Set(allInterests)].map(interest => ({ interest }));
      }),
      // Get popular cities from user locations
      prisma.userLocation.groupBy({
        by: ['currentCity'],
        _count: {
          currentCity: true
        },
        orderBy: {
          _count: {
            currentCity: 'desc'
          }
        },
        take: 20
      })
    ]);

    return {
      success: true,
      data: {
        // Content types
        contentTypes: [
          { value: DiscoverContentType.ALL, label: 'All Content' },
          { value: DiscoverContentType.EVENTS, label: 'Events' },
          { value: DiscoverContentType.COMMUNITIES, label: 'Communities' },
          { value: DiscoverContentType.MARKETPLACE, label: 'Marketplace & Services' },
          { value: DiscoverContentType.HOMESURF, label: 'HomeSurf' },
          { value: DiscoverContentType.BERSEGUIDE, label: 'BerseGuide' }
        ],

        // Listing types (for filtering within marketplace)
        listingTypes: [
          { value: 'PRODUCT', label: 'Products' },
          { value: 'SERVICE', label: 'Services' }
        ],

        // Sort options
        sortOptions: [
          { value: DiscoverSortBy.RELEVANCE, label: 'Most Relevant' },
          { value: DiscoverSortBy.DATE, label: 'Date' },
          { value: DiscoverSortBy.DISTANCE, label: 'Nearest' },
          { value: DiscoverSortBy.POPULAR, label: 'Most Popular' },
          { value: DiscoverSortBy.PRICE_ASC, label: 'Price: Low to High' },
          { value: DiscoverSortBy.PRICE_DESC, label: 'Price: High to Low' }
        ],

        // Event categories
        eventCategories: eventCategories
          .filter(e => e.type)
          .map(e => ({
            value: e.type,
            label: this.formatCategoryLabel(e.type!)
          })),

        // Service types (from marketplace SERVICE type)
        serviceTypes: serviceTypes
          .filter(s => s.serviceType)
          .map(s => ({
            value: s.serviceType,
            label: this.formatCategoryLabel(s.serviceType!)
          })),

        // Community interests (dynamic from communities)
        communityInterests: communityInterests
          .filter(c => c.interest)
          .map(c => ({
            value: c.interest,
            label: this.formatCategoryLabel(c.interest!)
          })),

        // Popular cities
        cities: cities
          .filter(c => c.currentCity)
          .map(c => ({
            value: c.currentCity,
            label: c.currentCity,
            count: c._count.currentCity
          })),

        // Accommodation types (for homesurf)
        accommodationTypes: [
          { value: 'PRIVATE_ROOM', label: 'Private Room' },
          { value: 'SHARED_ROOM', label: 'Shared Room' },
          { value: 'COUCH', label: 'Couch/Sofa' },
          { value: 'ENTIRE_PLACE', label: 'Entire Place' }
        ],

        // Guide types (for berseguide)
        guideTypes: [
          { value: 'FOOD_TOUR', label: 'Food Tour' },
          { value: 'CULTURAL_TOUR', label: 'Cultural Tour' },
          { value: 'NIGHTLIFE', label: 'Nightlife' },
          { value: 'HIKING', label: 'Hiking' },
          { value: 'CYCLING', label: 'Cycling' },
          { value: 'PHOTOGRAPHY', label: 'Photography' },
          { value: 'SHOPPING', label: 'Shopping' },
          { value: 'LOCAL_EXPERIENCE', label: 'Local Experience' },
          { value: 'HISTORICAL_SITES', label: 'Historical Sites' },
          { value: 'NATURE_WALKS', label: 'Nature Walks' },
          { value: 'BAR_HOPPING', label: 'Bar Hopping' },
          { value: 'COFFEE_CRAWL', label: 'Coffee Crawl' },
          { value: 'STREET_ART', label: 'Street Art' },
          { value: 'HIDDEN_GEMS', label: 'Hidden Gems' }
        ],

        // Payment types (for homesurf and berseguide)
        paymentTypes: [
          { value: 'MONEY', label: 'Money', description: 'Cash or digital payment' },
          { value: 'SKILL_TRADE', label: 'Skill Trade', description: 'Exchange skills (teach, cook, etc.)' },
          { value: 'TREAT_ME', label: 'Treat Me', description: 'Buy me food/drinks' },
          { value: 'BERSE_POINTS', label: 'Berse Points', description: 'Pay with platform points' },
          { value: 'FREE', label: 'Free', description: 'Free, no payment' },
          { value: 'NEGOTIABLE', label: 'Negotiable', description: 'To be discussed' }
        ],

        // Price ranges (suggested)
        priceRanges: [
          { label: 'Free', min: 0, max: 0 },
          { label: 'Under MYR 50', min: 0, max: 50 },
          { label: 'MYR 50 - MYR 100', min: 50, max: 100 },
          { label: 'MYR 100 - MYR 200', min: 100, max: 200 },
          { label: 'Above MYR 200', min: 200, max: null }
        ],

        // Radius options (in km)
        radiusOptions: [
          { value: 5, label: '5 km' },
          { value: 10, label: '10 km' },
          { value: 25, label: '25 km' },
          { value: 50, label: '50 km' },
          { value: 100, label: '100 km' },
          { value: 200, label: '200 km' }
        ],

        // Trust score ranges
        trustScoreRanges: [
          { label: 'Starter (0-30%)', min: 0, max: 30 },
          { label: 'Trusted (31-60%)', min: 31, max: 60 },
          { label: 'Leader (61-100%)', min: 61, max: 100 }
        ],

        // Section types (for filtering specific sections)
        sectionTypes: [
          { value: DiscoverSectionType.TRENDING, label: 'Trending' },
          { value: DiscoverSectionType.NEARBY, label: 'Nearby' },
          { value: DiscoverSectionType.COMMUNITIES, label: 'Communities' },
          { value: DiscoverSectionType.FEATURED, label: 'Featured' },
          { value: DiscoverSectionType.MARKETPLACE, label: 'Marketplace' },
          { value: DiscoverSectionType.UPCOMING, label: 'Upcoming Events' },
          { value: DiscoverSectionType.NEW, label: 'New' }
        ],

        // Boolean filters
        booleanFilters: [
          { key: 'freeOnly', label: 'Free Only', description: 'Show only free events and items' },
          { key: 'verifiedOnly', label: 'Verified Only', description: 'Show only verified communities' },
          { key: 'availableNow', label: 'Available Now', description: 'Show only currently available items' },
          { key: 'userInterests', label: 'Personalized', description: 'Show content based on your interests' }
        ]
      }
    };
  }

  /**
   * Format category label (convert snake_case to Title Case)
   */
  private formatCategoryLabel(category: string): string {
    return category
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
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

    const items = await this.fetchEvents(
      userId, 
      { ...validatedParams, sortBy: DiscoverSortBy.POPULAR }, 
      locationInfo, 
      undefined,
      validatedParams.latitude,
      validatedParams.longitude
    );

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

    const items = await this.fetchEvents(
      userId, 
      { ...validatedParams, sortBy: DiscoverSortBy.DISTANCE }, 
      locationInfo,
      undefined,
      validatedParams.latitude,
      validatedParams.longitude
    );

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

    // Track seen IDs to avoid duplicates across sections
    const seenEventIds = new Set<string>();
    const seenCommunityIds = new Set<string>();
    const seenMarketplaceIds = new Set<string>();
    const seenHomeSurfIds = new Set<string>();
    const seenBerseGuideIds = new Set<string>();

    // Build sections
    const sections: DiscoverSection[] = [];

    // Section item limit (max 3-5 items per section)
    const SECTION_ITEM_LIMIT = 5;

    // Fetch content for all sections in parallel
    const sectionPromises: Promise<DiscoverSection | null>[] = [];

    if (this.shouldIncludeSection('trending', requestedSections, excludedSections)) {
      sectionPromises.push(this.buildTrendingSection(userId, params, locationInfo, userContext, SECTION_ITEM_LIMIT));
    }

    if (this.shouldIncludeSection('nearby', requestedSections, excludedSections) && (params.latitude && params.longitude || userContext?.latitude && userContext?.longitude)) {
      sectionPromises.push(this.buildNearbySection(userId, params, locationInfo, userContext, SECTION_ITEM_LIMIT));
    }

    if (this.shouldIncludeSection('communities', requestedSections, excludedSections)) {
      sectionPromises.push(this.buildCommunitiesSection(userId, params, locationInfo, userContext, SECTION_ITEM_LIMIT));
    }

    if (this.shouldIncludeSection('upcoming', requestedSections, excludedSections)) {
      sectionPromises.push(this.buildUpcomingSection(userId, params, locationInfo, userContext, SECTION_ITEM_LIMIT));
    }

    if (this.shouldIncludeSection('new', requestedSections, excludedSections)) {
      sectionPromises.push(this.buildNewSection(userId, params, locationInfo, userContext, SECTION_ITEM_LIMIT));
    }

    if (this.shouldIncludeSection('marketplace', requestedSections, excludedSections)) {
      sectionPromises.push(this.buildMarketplaceSection(userId, params, locationInfo, userContext, SECTION_ITEM_LIMIT));
    }

    // Add more general sections that aren't strictly location-filtered
    if (this.shouldIncludeSection('featured', requestedSections, excludedSections)) {
      sectionPromises.push(this.buildFeaturedCommunitiesSection(userId, params, userContext, SECTION_ITEM_LIMIT));
    }

    if (this.shouldIncludeSection('homesurf', requestedSections, excludedSections)) {
      sectionPromises.push(this.buildHomeSurfSection(userId, params, locationInfo, userContext, SECTION_ITEM_LIMIT));
    }

    if (this.shouldIncludeSection('berseguide', requestedSections, excludedSections)) {
      sectionPromises.push(this.buildBerseGuideSection(userId, params, locationInfo, userContext, SECTION_ITEM_LIMIT));
    }

    if (this.shouldIncludeSection('popular_events', requestedSections, excludedSections)) {
      sectionPromises.push(this.buildPopularEventsSection(userId, params, userContext, SECTION_ITEM_LIMIT));
    }

    const resolvedSections = await Promise.all(sectionPromises);

    // Filter out null sections and remove duplicates
    const uniqueSections = resolvedSections.filter(s => s !== null) as DiscoverSection[];
    
    // Deduplicate items across sections
    uniqueSections.forEach(section => {
      section.items = section.items.filter(item => {
        const itemId = item.id;
        
        // Check based on content type
        if (item.type === 'event') {
          if (seenEventIds.has(itemId)) return false;
          seenEventIds.add(itemId);
          return true;
        } else if (item.type === 'community') {
          if (seenCommunityIds.has(itemId)) return false;
          seenCommunityIds.add(itemId);
          return true;
        } else if (item.type === 'marketplace_item') {
          if (seenMarketplaceIds.has(itemId)) return false;
          seenMarketplaceIds.add(itemId);
          return true;
        } else if (item.type === 'homesurf') {
          if (seenHomeSurfIds.has(itemId)) return false;
          seenHomeSurfIds.add(itemId);
          return true;
        } else if (item.type === 'berseguide') {
          if (seenBerseGuideIds.has(itemId)) return false;
          seenBerseGuideIds.add(itemId);
          return true;
        }
        
        return true;
      });
    });

    // Remove sections that became empty after deduplication
    sections.push(...uniqueSections.filter(s => s.items.length > 0));

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

    // Get user coordinates for distance calculation
    const userLat = params.latitude;
    const userLon = params.longitude;

    // Search across different content types in parallel
    const [events, communities, marketplace, homesurf, berseguide] = await Promise.all([
      params.contentType === DiscoverContentType.ALL || params.contentType === DiscoverContentType.EVENTS
        ? this.searchEvents(query, params, userLat, userLon)
        : [],
      params.contentType === DiscoverContentType.ALL || params.contentType === DiscoverContentType.COMMUNITIES
        ? this.searchCommunities(query, params)
        : [],
      params.contentType === DiscoverContentType.ALL || params.contentType === DiscoverContentType.MARKETPLACE
        ? this.searchMarketplace(query, params, userLat, userLon)
        : [],
      params.contentType === DiscoverContentType.ALL || params.contentType === DiscoverContentType.HOMESURF
        ? this.searchHomeSurf(query, params, userLat, userLon)
        : [],
      params.contentType === DiscoverContentType.ALL || params.contentType === DiscoverContentType.BERSEGUIDE
        ? this.searchBerseGuide(query, params, userLat, userLon)
        : []
    ]);

    // Calculate total results
    const totalResults = events.length + communities.length + marketplace.length + homesurf.length + berseguide.length;

    return {
      success: true,
      data: {
        query,
        location: locationInfo,
        results: {
          events: events.length > 0 ? events : undefined,
          communities: communities.length > 0 ? communities : undefined,
          marketplace: marketplace.length > 0 ? marketplace : undefined,
          homesurf: homesurf.length > 0 ? homesurf : undefined,
          berseguide: berseguide.length > 0 ? berseguide : undefined
        },
        pagination: this.buildPagination(totalResults, page, limit)
      }
    };
  }

  /**
   * Build trending events section
   */
  private async buildTrendingSection(
    userId: string | undefined,
    params: DiscoverQueryParams,
    locationInfo: LocationInfo,
    userContext?: UserContext,
    sectionLimit: number = 5
  ): Promise<DiscoverSection | null> {
    const events = await this.fetchEvents(
      userId, 
      { ...params, sortBy: DiscoverSortBy.POPULAR }, 
      locationInfo, 
      sectionLimit,
      params.latitude || userContext?.latitude,
      params.longitude || userContext?.longitude
    );

    if (events.length === 0) return null;

    return {
      type: DiscoverSectionType.TRENDING,
      title: 'Trending Events',
      subtitle: 'Popular events right now in your area',
      layout: DiscoverLayoutType.HORIZONTAL,
      itemLayout: DiscoverItemLayout.CARD,
      items: events.slice(0, sectionLimit),
      hasMore: false,
      viewAllEndpoint: '/v2/discover/trending?contentType=events',
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
    userContext?: UserContext,
    sectionLimit: number = 5
  ): Promise<DiscoverSection | null> {
    const lat = params.latitude || userContext?.latitude;
    const lon = params.longitude || userContext?.longitude;
    
    const items = await this.fetchEvents(
      userId, 
      { ...params, sortBy: DiscoverSortBy.DISTANCE }, 
      locationInfo,
      sectionLimit,
      lat,
      lon
    );

    if (items.length === 0) return null;

    return {
      type: DiscoverSectionType.NEARBY,
      title: 'Near You',
      subtitle: `Events and activities within ${params.radius || 5}km`,
      layout: DiscoverLayoutType.HORIZONTAL,
      itemLayout: DiscoverItemLayout.COMPACT,
      items: items.slice(0, sectionLimit),
      hasMore: items.length > sectionLimit,
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
    userContext?: UserContext,
    sectionLimit: number = 5
  ): Promise<DiscoverSection | null> {
    // Try location-specific first
    let communities = await this.fetchCommunities(userId, params, locationInfo);

    // If no results with location filter, try without location for broader results
    if (communities.length === 0 && locationInfo.city) {
      communities = await this.fetchCommunities(userId, params, {});
    }

    if (communities.length === 0) return null;

    const title = locationInfo.city && communities.length > 0 
      ? `Communities in ${locationInfo.city}`
      : 'Popular Communities';

    return {
      type: DiscoverSectionType.COMMUNITIES,
      title,
      subtitle: 'Join communities with active members',
      layout: DiscoverLayoutType.VERTICAL,
      itemLayout: DiscoverItemLayout.LIST,
      items: communities.slice(0, sectionLimit),
      hasMore: communities.length > sectionLimit,
      viewAllEndpoint: '/communities'
    };
  }

  /**
   * Build upcoming events section
   */
  private async buildUpcomingSection(
    userId: string | undefined,
    params: DiscoverQueryParams,
    locationInfo: LocationInfo,
    userContext?: UserContext,
    sectionLimit: number = 5
  ): Promise<DiscoverSection | null> {
    const events = await this.fetchUpcomingEvents(
      userId, 
      params, 
      locationInfo,
      params.latitude || userContext?.latitude,
      params.longitude || userContext?.longitude
    );

    if (events.length === 0) return null;

    return {
      type: DiscoverSectionType.UPCOMING,
      title: 'Upcoming Events',
      subtitle: 'Events happening soon',
      layout: DiscoverLayoutType.VERTICAL,
      itemLayout: DiscoverItemLayout.LIST,
      items: events.slice(0, sectionLimit),
      hasMore: events.length > sectionLimit,
      viewAllEndpoint: '/v2/events?upcoming=true'
    };
  }

  /**
   * Build new events section
   */
  private async buildNewSection(
    userId: string | undefined,
    params: DiscoverQueryParams,
    locationInfo: LocationInfo,
    userContext?: UserContext,
    sectionLimit: number = 5
  ): Promise<DiscoverSection | null> {
    const events = await this.fetchEvents(
      userId, 
      { ...params, sortBy: DiscoverSortBy.DATE }, 
      locationInfo, 
      sectionLimit,
      params.latitude || userContext?.latitude,
      params.longitude || userContext?.longitude
    );

    if (events.length === 0) return null;

    return {
      type: DiscoverSectionType.NEW,
      title: 'New Events',
      subtitle: 'Recently added events',
      layout: DiscoverLayoutType.HORIZONTAL,
      itemLayout: DiscoverItemLayout.CARD,
      items: events.slice(0, sectionLimit),
      hasMore: false,
      viewAllEndpoint: '/v2/discover/new?contentType=events'
    };
  }

  /**
   * Build featured communities section (not location-filtered)
   */
  private async buildFeaturedCommunitiesSection(
    userId: string | undefined,
    params: DiscoverQueryParams,
    userContext?: UserContext,
    sectionLimit: number = 5
  ): Promise<DiscoverSection | null> {
    // Fetch verified and popular communities globally
    const communities = await this.fetchCommunities(
      userId, 
      { ...params, verifiedOnly: true, limit: sectionLimit }, 
      {} // No location filter
    );

    if (communities.length === 0) return null;

    return {
      type: DiscoverSectionType.FEATURED,
      title: 'Featured Communities',
      subtitle: 'Verified communities you might like',
      layout: DiscoverLayoutType.HORIZONTAL,
      itemLayout: DiscoverItemLayout.CARD,
      items: communities.slice(0, sectionLimit),
      hasMore: false,
      viewAllEndpoint: '/communities',
      metadata: {
        icon: 'star',
        color: '#FFD700'
      }
    };
  }

  /**
   * Build popular events section (not strictly location-filtered)
   */
  private async buildPopularEventsSection(
    userId: string | undefined,
    params: DiscoverQueryParams,
    userContext?: UserContext,
    sectionLimit: number = 5
  ): Promise<DiscoverSection | null> {
    const events = await this.fetchEvents(
      userId,
      { ...params, sortBy: DiscoverSortBy.POPULAR, limit: sectionLimit },
      {}, // No strict location filter
      sectionLimit,
      params.latitude || userContext?.latitude,
      params.longitude || userContext?.longitude
    );

    if (events.length === 0) return null;

    return {
      type: DiscoverSectionType.UPCOMING,
      title: 'Popular Events',
      subtitle: 'Events people are excited about',
      layout: DiscoverLayoutType.HORIZONTAL,
      itemLayout: DiscoverItemLayout.CARD,
      items: events.slice(0, sectionLimit),
      hasMore: false,
      viewAllEndpoint: '/v2/events?popular=true',
      metadata: {
        icon: 'trending_up',
        color: '#9C27B0'
      }
    };
  }

  /**
   * Build HomeSurf section
   */
  private async buildHomeSurfSection(
    userId: string | undefined,
    params: DiscoverQueryParams,
    locationInfo: LocationInfo,
    userContext?: UserContext,
    sectionLimit: number = 5
  ): Promise<DiscoverSection | null> {
    // Try location-specific first
    let where: any = {
      isEnabled: true
    };

    // Add location filter if available
    if (locationInfo.city) {
      where.city = {
        contains: locationInfo.city,
        mode: 'insensitive'
      };
    }

    let listings = await prisma.userHomeSurf.findMany({
      where,
      take: sectionLimit,
      orderBy: {
        lastActiveAt: 'desc'
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            username: true,
            trustScore: true
          }
        },
        paymentOptions: true
      }
    });

    // If no results with location filter, try without location for broader results
    if (listings.length === 0 && locationInfo.city) {
      listings = await prisma.userHomeSurf.findMany({
        where: { isEnabled: true },
        take: sectionLimit,
        orderBy: {
          lastActiveAt: 'desc'
        },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              username: true,
              trustScore: true
            }
          },
          paymentOptions: true
        }
      });
    }

    if (listings.length === 0) return null;

    const items = listings.map(l => this.transformHomeSurf(
      l, 
      params.latitude || userContext?.latitude,
      params.longitude || userContext?.longitude
    ));

    const hasLocalContent = locationInfo.city && listings.some(l => l.city?.toLowerCase().includes(locationInfo.city!.toLowerCase()));
    const title = hasLocalContent
      ? `HomeSurf in ${locationInfo.city}`
      : locationInfo.city 
        ? `HomeSurf Worldwide` 
        : 'HomeSurf Hosts';
    
    const subtitle = hasLocalContent
      ? 'Stay with locals and make new friends'
      : locationInfo.city
        ? `No hosts in ${locationInfo.city} yet. Check out hosts in other cities`
        : 'Stay with locals and make new friends';

    return {
      type: 'homesurf' as any,
      title,
      subtitle,
      layout: DiscoverLayoutType.HORIZONTAL,
      itemLayout: DiscoverItemLayout.CARD,
      items: items.slice(0, sectionLimit),
      hasMore: false,
      viewAllEndpoint: `/v2/homesurf${locationInfo.city ? '?city=' + locationInfo.city : ''}`,
      metadata: {
        icon: 'home',
        color: '#FF6B6B',
        isGlobal: !hasLocalContent && !!locationInfo.city
      }
    };
  }

  /**
   * Build BerseGuide section
   */
  private async buildBerseGuideSection(
    userId: string | undefined,
    params: DiscoverQueryParams,
    locationInfo: LocationInfo,
    userContext?: UserContext,
    sectionLimit: number = 5
  ): Promise<DiscoverSection | null> {
    // Try location-specific first
    let where: any = {
      isEnabled: true
    };

    // Add location filter if available
    if (locationInfo.city) {
      where.city = {
        contains: locationInfo.city,
        mode: 'insensitive'
      };
    }

    let listings = await prisma.userBerseGuide.findMany({
      where,
      take: sectionLimit,
      orderBy: {
        lastActiveAt: 'desc'
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            username: true,
            trustScore: true
          }
        },
        paymentOptions: true
      }
    });

    // If no results with location filter, try without location for broader results
    if (listings.length === 0 && locationInfo.city) {
      listings = await prisma.userBerseGuide.findMany({
        where: { isEnabled: true },
        take: sectionLimit,
        orderBy: {
          lastActiveAt: 'desc'
        },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              username: true,
              trustScore: true
            }
          },
          paymentOptions: true
        }
      });
    }

    if (listings.length === 0) return null;

    const hasLocalContent = locationInfo.city && listings.some(l => l.city?.toLowerCase().includes(locationInfo.city!.toLowerCase()));
    const title = hasLocalContent
      ? `Local Guides in ${locationInfo.city}`
      : locationInfo.city
        ? `Guides Worldwide`
        : 'BerseGuide';
    
    const subtitle = hasLocalContent
      ? 'Discover hidden gems with local guides'
      : locationInfo.city
        ? `No guides in ${locationInfo.city} yet. Explore guides in other cities`
        : 'Discover hidden gems with local guides';

    const items = listings.map(l => this.transformBerseGuide(
      l,
      params.latitude || userContext?.latitude,
      params.longitude || userContext?.longitude
    ));

    return {
      type: 'berseguide' as any,
      title,
      subtitle,
      layout: DiscoverLayoutType.HORIZONTAL,
      itemLayout: DiscoverItemLayout.CARD,
      items: items.slice(0, sectionLimit),
      hasMore: false,
      viewAllEndpoint: `/v2/berseguide${locationInfo.city ? '?city=' + locationInfo.city : ''}`,
      metadata: {
        icon: 'map',
        color: '#4CAF50',
        isGlobal: !hasLocalContent && !!locationInfo.city
      }
    };
  }

  /**
   * Build marketplace section
   */
  private async buildMarketplaceSection(
    userId: string | undefined,
    params: DiscoverQueryParams,
    locationInfo: LocationInfo,
    userContext?: UserContext,
    sectionLimit: number = 5
  ): Promise<DiscoverSection | null> {
    const items = await this.fetchMarketplaceItems(
      userId, 
      params, 
      locationInfo,
      sectionLimit,
      params.latitude || userContext?.latitude,
      params.longitude || userContext?.longitude
    );

    if (items.length === 0) return null;

    // Check if any items match the user's location
    const hasLocalContent = locationInfo.city && items.some(i => i.location?.city?.toLowerCase().includes(locationInfo.city!.toLowerCase()));
    const title = hasLocalContent
      ? `Marketplace in ${locationInfo.city}`
      : locationInfo.city
        ? `Marketplace Worldwide`
        : 'Marketplace';
    
    const subtitle = hasLocalContent
      ? 'Latest listings near you'
      : locationInfo.city
        ? `No listings in ${locationInfo.city} yet. Check out items from other cities`
        : 'Latest listings';

    return {
      type: DiscoverSectionType.MARKETPLACE,
      title,
      subtitle,
      layout: DiscoverLayoutType.HORIZONTAL,
      itemLayout: DiscoverItemLayout.CARD,
      items: items.slice(0, sectionLimit),
      hasMore: items.length > sectionLimit,
      viewAllEndpoint: `/v2/marketplace/listings${locationInfo.city ? '?city=' + locationInfo.city : ''}`,
      metadata: {
        icon: 'shopping_bag',
        color: '#FF9800',
        isGlobal: !hasLocalContent && !!locationInfo.city
      }
    };
  }







  /**
   * Fetch events
   */
  private async fetchEvents(
    userId: string | undefined,
    params: DiscoverQueryParams,
    locationInfo: LocationInfo,
    limit?: number,
    userLat?: number,
    userLon?: number
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

    return events.map(e => this.transformEvent(e, userLat, userLon));
  }

  /**
   * Fetch upcoming events
   */
  private async fetchUpcomingEvents(
    userId: string | undefined,
    params: DiscoverQueryParams,
    locationInfo: LocationInfo,
    userLat?: number,
    userLon?: number
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

    return events.map(e => this.transformEvent(e, userLat, userLon));
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
    limit?: number,
    userLat?: number,
    userLon?: number
  ): Promise<MarketplaceItem[]> {
    // Try location-specific first
    let where: any = {
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

    let items = await prisma.marketplaceListing.findMany({
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

    // If no results with location filter, try without location for broader results
    if (items.length === 0 && locationInfo.city) {
      const globalWhere: any = {
        status: 'ACTIVE'
      };

      if (params.category) {
        globalWhere.category = params.category;
      }

      if (params.priceMin !== undefined || params.priceMax !== undefined) {
        globalWhere.price = {};
        if (params.priceMin !== undefined) {
          globalWhere.price.gte = params.priceMin;
        }
        if (params.priceMax !== undefined) {
          globalWhere.price.lte = params.priceMax;
        }
      }

      items = await prisma.marketplaceListing.findMany({
        where: globalWhere,
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
    }

    return items.map(i => this.transformMarketplaceItem(i, userLat, userLon));
  }

  /**
   * Search events
   */
  private async searchEvents(query: string, params: DiscoverQueryParams, userLat?: number, userLon?: number): Promise<EventItem[]> {
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

    return events.map(e => this.transformEvent(e, userLat, userLon));
  }

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
   * Search marketplace
   */
  private async searchMarketplace(query: string, params: DiscoverQueryParams, userLat?: number, userLon?: number): Promise<MarketplaceItem[]> {
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

    return items.map(i => this.transformMarketplaceItem(i, userLat, userLon));
  }

  /**
   * Search homesurf listings
   */
  private async searchHomeSurf(query: string, params: DiscoverQueryParams, userLat?: number, userLon?: number): Promise<any[]> {
    const where: any = {
      isEnabled: true,
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { city: { contains: query, mode: 'insensitive' } }
      ]
    };

    // Location filter
    if (params.city) {
      where.city = {
        contains: params.city,
        mode: 'insensitive'
      };
    }

    const listings = await prisma.userHomeSurf.findMany({
      where,
      take: 20,
      orderBy: {
        lastActiveAt: 'desc'
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            username: true,
            trustScore: true
          }
        },
        paymentOptions: true
      }
    });

    return listings.map(l => this.transformHomeSurf(l, userLat, userLon));
  }

  /**
   * Search berseguide listings
   */
  private async searchBerseGuide(query: string, params: DiscoverQueryParams, userLat?: number, userLon?: number): Promise<any[]> {
    const where: any = {
      isEnabled: true,
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { tagline: { contains: query, mode: 'insensitive' } },
        { city: { contains: query, mode: 'insensitive' } }
      ]
    };

    // Location filter
    if (params.city) {
      where.city = {
        contains: params.city,
        mode: 'insensitive'
      };
    }

    const listings = await prisma.userBerseGuide.findMany({
      where,
      take: 20,
      orderBy: {
        lastActiveAt: 'desc'
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            username: true,
            trustScore: true
          }
        },
        paymentOptions: true
      }
    });

    return listings.map(l => this.transformBerseGuide(l, userLat, userLon));
  }

  /**
   * Transform event to EventItem
   */
  private transformEvent(event: any, userLat?: number, userLon?: number): EventItem {
    let distance: string | undefined;
    
    // Calculate distance if user location and event coordinates are available
    if (userLat && userLon && event.latitude && event.longitude) {
      const distanceKm = this.calculateDistance(
        userLat,
        userLon,
        parseFloat(event.latitude),
        parseFloat(event.longitude)
      );
      distance = this.formatDistance(distanceKm);
    }

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
        distance
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
      detailsUrl: `/v2/events/${event.id}`,
      detailRoute: 'event' as const
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
      detailsUrl: `/v2/communities/${community.id}`,
      detailRoute: 'community' as const
    };
  }
  /**
   * Transform marketplace item to MarketplaceItem
   */
  private transformMarketplaceItem(item: any, userLat?: number, userLon?: number): MarketplaceItem {
    let distance: string | undefined;
    
    // Calculate distance if user location and item coordinates are available
    if (userLat && userLon && item.latitude && item.longitude) {
      const distanceKm = this.calculateDistance(
        userLat,
        userLon,
        parseFloat(item.latitude),
        parseFloat(item.longitude)
      );
      distance = this.formatDistance(distanceKm);
    }

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
        distance
      } : undefined,
      seller: item.user ? {
        id: item.user.id,
        displayName: item.user.fullName,
        avatarUrl: undefined,
        trustScore: item.user.trustScore || 0,
        responseRate: undefined // TODO: Calculate
      } : undefined,
      postedAt: item.createdAt.toISOString(),
      detailsUrl: `/v2/marketplace/listings/${item.id}`,
      detailRoute: 'marketplace' as const
    };
  }

  /**
   * Transform homesurf listing to HomeSurfItem
   */
  private transformHomeSurf(listing: any, userLat?: number, userLon?: number): HomeSurfItem {
    let distance: string | undefined;
    
    // Calculate distance if user location and listing coordinates are available
    if (userLat && userLon && listing.coordinates) {
      try {
        const coords = typeof listing.coordinates === 'string' 
          ? JSON.parse(listing.coordinates) 
          : listing.coordinates;
        if (coords.latitude && coords.longitude) {
          const distanceKm = this.calculateDistance(
            userLat,
            userLon,
            parseFloat(coords.latitude),
            parseFloat(coords.longitude)
          );
          distance = this.formatDistance(distanceKm);
        }
      } catch (e) {
        // If coordinates parsing fails, distance remains undefined
      }
    }

    return {
      id: listing.userId,
      type: 'homesurf',
      title: listing.title,
      description: listing.description,
      imageUrl: listing.photos?.[0],
      images: listing.photos || [],
      accommodationType: listing.accommodationType,
      maxGuests: listing.maxGuests,
      amenities: listing.amenities || [],
      paymentOptions: listing.paymentOptions?.map((po: any) => ({
        type: po.paymentType,
        amount: po.amount,
        currency: po.currency,
        description: po.description,
        isPreferred: po.isPreferred
      })),
      location: {
        city: listing.city,
        neighborhood: listing.neighborhood,
        distance
      },
      host: listing.user ? {
        id: listing.user.id,
        displayName: listing.user.fullName,
        avatarUrl: undefined,
        trustScore: listing.user.trustScore || 0,
        responseRate: listing.responseRate,
        averageResponseTime: listing.averageResponseTime
      } : undefined,
      rating: listing.rating,
      reviewCount: listing.reviewCount,
      totalGuests: listing.totalGuests,
      minimumStay: listing.minimumStay,
      maximumStay: listing.maximumStay,
      availabilityNotes: listing.availabilityNotes,
      detailsUrl: `/v2/homesurf/${listing.userId}`,
      detailRoute: 'homesurf' as const
    };
  }

  /**
   * Transform berseguide listing to BerseGuideItem
   */
  private transformBerseGuide(listing: any, userLat?: number, userLon?: number): BerseGuideItem {
    let distance: string | undefined;
    
    // Calculate distance based on city center or guide's base location
    // BerseGuide doesn't have exact coordinates in schema, distance calculated from city
    // You can enhance this later with geocoding of the city
    
    return {
      id: listing.userId,
      type: 'berseguide',
      title: listing.title,
      description: listing.description,
      tagline: listing.tagline,
      imageUrl: listing.photos?.[0],
      images: listing.photos || [],
      guideTypes: listing.guideTypes || [],
      languages: listing.languages || [],
      paymentOptions: listing.paymentOptions?.map((po: any) => ({
        type: po.paymentType,
        amount: po.amount,
        currency: po.currency,
        description: po.description,
        isPreferred: po.isPreferred
      })),
      location: {
        city: listing.city,
        neighborhoods: listing.neighborhoods || [],
        coverageRadius: listing.coverageRadius,
        distance
      },
      guide: listing.user ? {
        id: listing.user.id,
        displayName: listing.user.fullName,
        avatarUrl: undefined,
        trustScore: listing.user.trustScore || 0,
        responseRate: listing.responseRate,
        averageResponseTime: listing.averageResponseTime
      } : undefined,
      rating: listing.rating,
      reviewCount: listing.reviewCount,
      totalSessions: listing.totalSessions,
      yearsGuiding: listing.yearsGuiding,
      typicalDuration: listing.typicalDuration,
      maxGroupSize: listing.maxGroupSize,
      highlights: listing.highlights || [],
      availabilityNotes: listing.availabilityNotes,
      detailsUrl: `/v2/berseguide/${listing.userId}`,
      detailRoute: 'berseguide' as const
    };
  }

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

    // Global trending events
    const trendingEvents = await this.fetchEvents(
      userId, 
      { ...params, sortBy: DiscoverSortBy.POPULAR, limit: 10 }, 
      globalLocationInfo,
      undefined,
      params.latitude || userContext?.latitude,
      params.longitude || userContext?.longitude
    );
    if (trendingEvents.length > 0) {
      sections.push({
        type: DiscoverSectionType.TRENDING,
        title: 'Trending Events Worldwide',
        subtitle: 'Popular events from around the globe',
        layout: DiscoverLayoutType.HORIZONTAL,
        itemLayout: DiscoverItemLayout.CARD,
        items: trendingEvents,
        hasMore: false,
        viewAllEndpoint: '/v2/discover/trending?contentType=events'
      });
    }

    // Global communities
    const communities = await this.fetchCommunities(userId, { ...params, limit: 10 }, globalLocationInfo);
    if (communities.length > 0) {
      sections.push({
        type: DiscoverSectionType.COMMUNITIES,
        title: 'Global Communities',
        subtitle: 'Connect with people worldwide',
        layout: DiscoverLayoutType.VERTICAL,
        itemLayout: DiscoverItemLayout.LIST,
        items: communities,
        hasMore: false,
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
