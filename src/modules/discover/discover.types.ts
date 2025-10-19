// Discover Module Type Definitions

export enum DiscoverContentType {
  EVENT = 'event',
  COMMUNITY = 'community',
  MARKETPLACE = 'marketplace'
}

export enum DiscoverSourceType {
  TRENDING = 'trending',
  RECOMMENDED = 'recommended',
  NEARBY = 'nearby',
  NEW = 'new',
  POPULAR = 'popular'
}

export interface DiscoverFeedParams {
  // Pagination
  page?: number;
  limit?: number;

  // Filters
  contentType?: DiscoverContentType | 'all'; // Filter by specific content type
  search?: string; // Text search across all content
  location?: string; // Location filter
  category?: string; // Category filter (for events/marketplace)
  communityType?: string; // HOBBY, PROFESSIONAL, TRAVEL, etc.
  fromDate?: Date; // Start date for events
  toDate?: Date; // End date for events

  // Personalization
  usePersonalization?: boolean; // Whether to apply personalized ranking (default: true)
}

export interface EventDiscoverItem {
  type: DiscoverContentType.EVENT;
  sourceType: DiscoverSourceType;
  id: string;
  title: string;
  description: string | null;
  eventType: string;
  images: string[];
  date: Date;
  location: string | null;
  mapLink: string | null;
  createdAt: Date;
  updatedAt: Date;
  hostId: string;
  host: {
    id: string;
    fullName: string;
    username: string | null;
  };
  _count?: {
    eventParticipants?: number;
  };
}

export interface CommunityDiscoverItem {
  type: DiscoverContentType.COMMUNITY;
  sourceType: DiscoverSourceType;
  id: string;
  name: string;
  description: string | null;
  communityType: string;
  tags: string[];
  avatar: string | null;
  coverPhoto: string | null;
  isVerified: boolean;
  isPrivate: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  creator: {
    id: string;
    fullName: string;
    username: string | null;
  };
  _count?: {
    members?: number;
  };
}

export interface MarketplaceDiscoverItem {
  type: DiscoverContentType.MARKETPLACE;
  sourceType: DiscoverSourceType;
  id: string;
  title: string;
  description: string | null;
  category: string;
  price: number;
  currency: string;
  quantity: number | null;
  location: string | null;
  images: string[];
  status: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  seller: {
    id: string;
    fullName: string;
    username: string | null;
    trustScore: number;
  };
  _count?: {
    marketplaceCartItems?: number;
    orders?: number;
  };
}

export type DiscoverItem = EventDiscoverItem | CommunityDiscoverItem | MarketplaceDiscoverItem;

export interface DiscoverFeedResponse {
  data: DiscoverItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
  meta?: {
    contentTypeCounts?: {
      events?: number;
      communities?: number;
      marketplace?: number;
    };
    personalizationApplied?: boolean;
  };
}

export interface UserContext {
  userId: string;
  location?: string;
  interests?: string[];
  communityIds?: string[];
  connectionIds?: string[];
}
