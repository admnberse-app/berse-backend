// Discover Module Type Definitions

export enum DiscoverContentType {
  EVENTS = 'events',
  COMMUNITIES = 'communities',
  MARKETPLACE = 'marketplace',
  HOMESURF = 'homesurf',
  BERSEGUIDE = 'berseguide',
  ALL = 'all'
}

export enum DiscoverSectionType {
  TRENDING = 'trending',
  NEARBY = 'nearby',
  COMMUNITIES = 'communities',
  FEATURED = 'featured',
  MARKETPLACE = 'marketplace',
  UPCOMING = 'upcoming',
  NEW = 'new',
  PROMOTIONS = 'promotions',
  GLOBAL_TRENDING = 'global_trending',
  GLOBAL_COMMUNITIES = 'global_communities',
  NEARBY_COUNTRIES = 'nearby_countries',
  CALL_TO_ACTION = 'call_to_action',
  HOMESURF = 'homesurf',
  BERSEGUIDE = 'berseguide',
  POPULAR_EVENTS = 'popular_events'
}

export enum DiscoverLayoutType {
  HORIZONTAL = 'horizontal',
  VERTICAL = 'vertical',
  GRID = 'grid',
  CAROUSEL = 'carousel'
}

export enum DiscoverItemLayout {
  CARD = 'card',
  COMPACT = 'compact',
  LIST = 'list',
  BANNER = 'banner'
}

export enum DiscoverSortBy {
  RELEVANCE = 'relevance',
  DATE = 'date',
  DISTANCE = 'distance',
  POPULAR = 'popular',
  PRICE_ASC = 'price_asc',
  PRICE_DESC = 'price_desc'
}

/**
 * Query parameters for the discover endpoint
 */
export interface DiscoverQueryParams {
  // Location
  city?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  
  // Search
  q?: string;
  
  // Pagination
  page?: number;
  limit?: number;
  
  // Filters
  category?: string;
  contentType?: DiscoverContentType;
  dateFrom?: string;
  dateTo?: string;
  priceMin?: number;
  priceMax?: number;
  freeOnly?: boolean;
  language?: string;
  sortBy?: DiscoverSortBy;
  tags?: string;
  verifiedOnly?: boolean;
  availableNow?: boolean;
  trustScoreMin?: number;
  
  // Section control
  sections?: string;
  excludeSections?: string;
  
  // Personalization
  userInterests?: boolean;
  refresh?: boolean;
}

/**
 * Location information in response
 */
export interface LocationInfo {
  city?: string;
  country?: string;
  latitude?: string;
  longitude?: string;
}

/**
 * Section metadata
 */
export interface SectionMetadata {
  icon?: string;
  color?: string;
}

/**
 * Base item interface
 */
export interface BaseDiscoverItem {
  id: string;
  type: string;
  relevanceScore?: number;
}

/**
 * Event item
 */
export interface EventItem extends BaseDiscoverItem {
  type: 'event';
  title: string;
  description?: string;
  imageUrl?: string;
  startTime: string;
  endTime?: string;
  location?: {
    name?: string;
    address?: string;
    city?: string;
    latitude?: string;
    longitude?: string;
    distance?: string;
  };
  attendeeCount?: number;
  maxAttendees?: number;
  price?: {
    amount: number;
    currency: string;
    isFree: boolean;
  };
  host?: {
    id: string;
    displayName: string;
    avatarUrl?: string;
  };
  categories?: string[];
  detailsUrl?: string;
  detailRoute: 'event';
}

/**
 * Community item
 */
export interface CommunityItem extends BaseDiscoverItem {
  type: 'community';
  name: string;
  description?: string;
  imageUrl?: string;
  bannerUrl?: string;
  memberCount: number;
  activeMembers?: number;
  category?: string;
  isVerified: boolean;
  privacy: string;
  location?: {
    city?: string;
    country?: string;
  };
  admin?: {
    id: string;
    displayName: string;
    avatarUrl?: string;
  };
  detailsUrl?: string;
  detailRoute: 'community';
}

/**
 * Marketplace item
 */
export interface MarketplaceItem extends BaseDiscoverItem {
  type: 'marketplace_item';
  title: string;
  description?: string;
  imageUrl?: string;
  images?: string[];
  price: {
    amount: number;
    currency: string;
    isNegotiable?: boolean;
  };
  condition?: string;
  category?: string;
  location?: {
    city?: string;
    distance?: string;
  };
  seller?: {
    id: string;
    displayName: string;
    avatarUrl?: string;
    trustScore?: number;
    responseRate?: string;
  };
  postedAt?: string;
  detailsUrl?: string;
  detailRoute: 'marketplace';
}

/**
 * HomeSurf item
 */
export interface HomeSurfItem extends BaseDiscoverItem {
  type: 'homesurf';
  title: string;
  description?: string;
  imageUrl?: string;
  images?: string[];
  accommodationType: string;
  maxGuests: number;
  amenities?: string[];
  paymentOptions?: Array<{
    type: string;
    amount?: number;
    currency?: string;
    description?: string;
    isPreferred?: boolean;
  }>;
  location?: {
    city: string;
    neighborhood?: string;
    distance?: string;
  };
  host?: {
    id: string;
    displayName: string;
    avatarUrl?: string;
    trustScore?: number;
    responseRate?: number;
    averageResponseTime?: number;
  };
  rating?: number;
  reviewCount?: number;
  totalGuests?: number;
  minimumStay?: number;
  maximumStay?: number;
  availabilityNotes?: string;
  detailsUrl?: string;
  detailRoute: 'homesurf';
}

/**
 * BerseGuide item
 */
export interface BerseGuideItem extends BaseDiscoverItem {
  type: 'berseguide';
  title: string;
  description?: string;
  tagline?: string;
  imageUrl?: string;
  images?: string[];
  guideTypes?: string[];
  languages?: string[];
  paymentOptions?: Array<{
    type: string;
    amount?: number;
    currency?: string;
    description?: string;
    isPreferred?: boolean;
  }>;
  location?: {
    city: string;
    neighborhoods?: string[];
    coverageRadius?: number;
    distance?: string;
  };
  guide?: {
    id: string;
    displayName: string;
    avatarUrl?: string;
    trustScore?: number;
    responseRate?: number;
    averageResponseTime?: number;
  };
  rating?: number;
  reviewCount?: number;
  totalSessions?: number;
  yearsGuiding?: number;
  typicalDuration?: number;
  maxGroupSize?: number;
  highlights?: string[];
  availabilityNotes?: string;
  detailsUrl?: string;
  detailRoute: 'berseguide';
}

export type DiscoverItem = EventItem | CommunityItem | MarketplaceItem | HomeSurfItem | BerseGuideItem;

/**
 * Section configuration
 */
export interface DiscoverSection {
  type: DiscoverSectionType | string;
  title: string;
  subtitle?: string;
  layout: DiscoverLayoutType;
  itemLayout: DiscoverItemLayout;
  items: DiscoverItem[];
  hasMore: boolean;
  viewAllEndpoint?: string;
  metadata?: SectionMetadata;
}

/**
 * Pagination info
 */
export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalResults: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Default view response (no search query)
 */
export interface DefaultDiscoverResponse {
  success: boolean;
  data: {
    location?: LocationInfo;
    expanded?: boolean;
    expandedRadius?: number;
    isEmpty?: boolean;
    message?: string;
    sections: DiscoverSection[];
    metadata: {
      timestamp: string;
      cacheExpiry?: number;
    };
  };
}

/**
 * Search view response (with query parameter)
 */
export interface SearchDiscoverResponse {
  success: boolean;
  data: {
    query: string;
    location?: LocationInfo;
    results: {
      events?: EventItem[];
      communities?: CommunityItem[];
      marketplace?: MarketplaceItem[];
      homesurf?: HomeSurfItem[];
      berseguide?: BerseGuideItem[];
    };
    pagination: PaginationInfo;
  };
}

/**
 * Empty state info
 */
export interface EmptyStateAction {
  type: string;
  label: string;
  icon: string;
  route: string;
}

export interface SuggestedLocation {
  city: string;
  country: string;
  distance: string;
  eventCount: number;
  communityCount: number;
}

export interface EmptyState {
  title: string;
  message: string;
  illustration?: string;
  actions?: EmptyStateAction[];
  suggestedLocations?: SuggestedLocation[];
}

/**
 * Empty discover response
 */
export interface EmptyDiscoverResponse {
  success: boolean;
  data: {
    location?: LocationInfo;
    isEmpty: true;
    expanded?: boolean;
    expandedRadius?: number;
    message?: string;
    sections: DiscoverSection[];
    emptyState?: EmptyState;
  };
}

/**
 * User context for personalization
 */
export interface UserContext {
  userId: string;
  location?: string;
  interests?: string[];
  communityIds?: string[];
  connectionIds?: string[];
  latitude?: number;
  longitude?: number;
}
