// Discover Module Type Definitions

export enum DiscoverContentType {
  EVENTS = 'events',
  COMMUNITIES = 'communities',
  MARKETPLACE = 'marketplace',
  SERVICES = 'services',
  USERS = 'users',
  ALL = 'all'
}

export enum DiscoverSectionType {
  TRENDING = 'trending',
  NEARBY = 'nearby',
  COMMUNITIES = 'communities',
  FEATURED = 'featured',
  MARKETPLACE = 'marketplace',
  SERVICES = 'services',
  USERS = 'users',
  UPCOMING = 'upcoming',
  NEW = 'new',
  PROMOTIONS = 'promotions',
  GLOBAL_TRENDING = 'global_trending',
  GLOBAL_COMMUNITIES = 'global_communities',
  NEARBY_COUNTRIES = 'nearby_countries',
  CALL_TO_ACTION = 'call_to_action'
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
}

/**
 * Service item
 */
export interface ServiceItem extends BaseDiscoverItem {
  type: 'service';
  title: string;
  description?: string;
  imageUrl?: string;
  category?: string;
  pricing?: {
    startingPrice: number;
    currency: string;
    unit?: string;
  };
  provider?: {
    id: string;
    displayName: string;
    avatarUrl?: string;
    trustScore?: number;
    rating?: number;
    reviewCount?: number;
  };
  location?: {
    city?: string;
    serviceArea?: string;
    distance?: string;
  };
  availability?: string;
  isVerified?: boolean;
  detailsUrl?: string;
}

/**
 * User item
 */
export interface UserItem extends BaseDiscoverItem {
  type: 'user';
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  location?: {
    city?: string;
    country?: string;
  };
  trustScore?: number;
  connectionStatus?: string;
  mutualConnections?: number;
  interests?: string[];
  memberSince?: string;
  profileUrl?: string;
}

export type DiscoverItem = EventItem | CommunityItem | MarketplaceItem | ServiceItem | UserItem;

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
      users?: UserItem[];
      marketplace?: MarketplaceItem[];
      services?: ServiceItem[];
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
