import { 
  GuideType, 
  AccommodationType, 
  PaymentType, 
  ReviewerRole,
  HomeSurfBookingStatus,
  BerseGuideBookingStatus 
} from '@prisma/client';

// ==================== FILTER INTERFACES ====================

export interface BerseGuideFilters {
  // Location Filters
  city?: string;
  neighborhood?: string;
  country?: string;
  lat?: number;
  lng?: number;
  radius?: number; // km
  
  // Service Filters
  guideTypes?: GuideType[];
  languages?: string[];
  minRating?: number; // 0-5
  minReviews?: number;
  
  // Pricing Filters
  paymentTypes?: PaymentType[];
  maxPrice?: number;
  currency?: string;
  
  // Availability Filters
  availableOn?: string; // "weekends", "weekdays", "anytime"
  minDuration?: number; // hours
  maxDuration?: number;
  maxGroupSize?: number;
  
  // Experience Filters
  minExperience?: number; // years
  minSessions?: number;
  
  // Trust & Verification Filters
  verifiedOnly?: boolean;
  minTrustScore?: number; // 0-100
  minVouches?: number;
  hasPhotos?: boolean;
  
  // User Profile Filters
  interests?: string[];
  profession?: string;
  personalityType?: string;
  
  // Text Search
  search?: string;
  
  // Sorting
  sortBy?: 'rating' | 'reviews' | 'price_asc' | 'price_desc' 
         | 'recent' | 'popular' | 'trust_score' | 'sessions';
  
  // Pagination
  page?: number;
  limit?: number;
}

export interface HomeSurfFilters {
  // Location Filters
  city?: string;
  neighborhood?: string;
  country?: string;
  lat?: number;
  lng?: number;
  radius?: number;
  
  // Accommodation Filters
  accommodationType?: AccommodationType;
  minGuests?: number;
  amenities?: string[];
  
  // Stay Duration Filters
  minStay?: number; // nights
  maxStay?: number;
  checkInDate?: string; // ISO date
  checkOutDate?: string;
  
  // Payment Filters
  paymentTypes?: PaymentType[];
  maxPrice?: number;
  currency?: string;
  
  // Rating & Trust Filters
  minRating?: number;
  minReviews?: number;
  verifiedOnly?: boolean;
  minTrustScore?: number;
  minVouches?: number;
  
  // Host Profile Filters
  interests?: string[];
  languages?: string[];
  profession?: string;
  hasPhotos?: boolean;
  
  // Text Search
  search?: string;
  
  // Sorting
  sortBy?: 'rating' | 'reviews' | 'price_asc' | 'price_desc' 
         | 'recent' | 'popular' | 'trust_score' | 'guests';
  
  // Pagination
  page?: number;
  limit?: number;
}

// ==================== RESPONSE INTERFACES ====================

export interface PaymentOptionResponse {
  id: string;
  paymentType: PaymentType;
  amount?: number;
  currency?: string;
  description?: string;
  isPreferred: boolean;
}

export interface ReviewPreview {
  id: string;
  rating: number;
  review?: string;
  reviewerName: string;
  reviewerPhoto?: string;
  reviewerRole?: ReviewerRole;
  highlights?: string[];
  photos?: string[];
  createdAt: Date;
  
  // Specific ratings (varies by service type)
  knowledge?: number;
  communication?: number;
  friendliness?: number;
  value?: number;
  cleanliness?: number;
  location?: number;
  hospitality?: number;
  
  // Recommendations
  wouldRecommend?: boolean;
  wouldStayAgain?: boolean;
  wouldHostAgain?: boolean;
}

export interface CommunityPreview {
  id: string;
  name: string;
  role: string;
  memberCount: number;
}

export interface BerseGuideResponse {
  // Service Info
  userId: string;
  title: string;
  description: string;
  tagline?: string;
  guideTypes: GuideType[];
  customTypes: string[];
  languages: string[];
  
  // Location
  city: string;
  neighborhoods: string[];
  coverageRadius?: number;
  
  // Media
  photos: string[];
  highlights: string[];
  sampleItinerary?: string;
  
  // Service Stats
  rating?: number;
  reviewCount: number;
  totalSessions: number;
  yearsGuiding?: number;
  responseRate?: number;
  averageResponseTime?: number; // hours
  
  // Logistics
  typicalDuration?: number; // hours
  minDuration?: number;
  maxDuration?: number;
  maxGroupSize: number;
  advanceNotice?: number; // days
  availabilityNotes?: string;
  
  // Payment Options
  paymentOptions: PaymentOptionResponse[];
  
  // Activity
  lastActiveAt: Date;
  memberSince: Date;
  
  // User Profile (enriched)
  user: any; // EnrichedUserProfile from profile-enrichment.types.ts
  
  // Recent Reviews (preview)
  recentReviews?: ReviewPreview[];
  
  // Featured Communities
  communities?: CommunityPreview[];
}

export interface HomeSurfResponse {
  // Service Info
  userId: string;
  title: string;
  description: string;
  accommodationType: AccommodationType;
  maxGuests: number;
  
  // Amenities & Features
  amenities: string[];
  houseRules?: string;
  photos: string[];
  
  // Location
  city: string;
  neighborhood?: string;
  approximateLocation?: {
    lat: number;
    lng: number;
  };
  
  // Stay Details
  minimumStay?: number; // nights
  maximumStay?: number;
  advanceNotice?: number; // days
  availabilityNotes?: string;
  
  // Payment Options
  paymentOptions: PaymentOptionResponse[];
  
  // Host Stats
  rating?: number;
  reviewCount: number;
  totalGuests: number;
  responseRate?: number;
  averageResponseTime?: number; // hours
  
  // Activity
  lastActiveAt: Date;
  memberSince: Date;
  
  // User Profile (enriched)
  user: any; // EnrichedUserProfile
  
  // Recent Reviews (preview)
  recentReviews?: ReviewPreview[];
  
  // Featured Communities
  communities?: CommunityPreview[];
}

// ==================== DETAILED RESPONSES ====================

export interface ReviewSummary {
  overall: number;
  totalReviews: number;
  recommendationRate?: number;
  distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  
  // Category averages (varies by service)
  knowledge?: number;
  communication?: number;
  friendliness?: number;
  value?: number;
  cleanliness?: number;
  location?: number;
  hospitality?: number;
}

export interface BerseGuideDetailResponse extends BerseGuideResponse {
  fullBio?: string;
  detailedItinerary?: string;
  
  reviews: {
    summary: ReviewSummary;
    recent: ReviewPreview[];
  };
  
  sessionStats: {
    totalSessions: number;
    averageDuration: number;
    popularLocations: Array<{ location: string; count: number }>;
    popularDays: string[];
    busyMonths: string[];
  };
  
  trustChain?: any[];
  mutualConnections?: any[];
}

export interface HomeSurfDetailResponse extends HomeSurfResponse {
  fullDescription?: string;
  detailedHouseRules?: string;
  neighborhoodGuide?: string;
  
  reviews: {
    summary: ReviewSummary;
    recent: ReviewPreview[];
  };
  
  guestStats: {
    totalGuests: number;
    countriesHosted: number;
    averageStayDuration: number;
    repeatGuestRate: number;
    popularMonths: string[];
    guestDemographics: {
      solo: number;
      couples: number;
      groups: number;
    };
  };
  
  availability?: {
    available: string[];
    booked: string[];
    blocked: string[];
  };
  
  trustChain?: any[];
  mutualConnections?: any[];
}

// ==================== PAGINATION ====================

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: PaginationMeta;
  appliedFilters?: any;
}

// ==================== STATISTICS ====================

export interface ServicePerformanceStats {
  totalSessions?: number;
  totalGuests?: number;
  averageRating: number;
  reviewCount: number;
  responseRate: number;
  averageResponseTime: number;
  recommendationRate: number;
  rebookRate?: number;
}

export interface SessionAnalytics {
  totalHours: number;
  averageDuration: number;
  longestSession: number;
  mostPopularDuration: number;
  popularLocations: Array<{ name: string; sessions: number; rating: number }>;
  seasonality: {
    busyMonths: string[];
    slowMonths: string[];
    peakDays: string[];
  };
}

export interface ClientSatisfaction {
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  averagesByCategory: {
    [key: string]: number;
  };
  topHighlights: Array<{ text: string; count: number }>;
}

export interface ExperienceMetrics {
  yearsGuiding?: number;
  memberSince: string;
  firstSessionDate?: string;
  recentSessionDate?: string;
  consistency: string; // "Very Active", "Active", "Occasional"
}

// ==================== METADATA ====================

export interface ServiceMetadata {
  guideTypes: Array<{ value: GuideType; label: string; description: string }>;
  accommodationTypes: Array<{ value: AccommodationType; label: string; description: string }>;
  paymentTypes: Array<{ value: PaymentType; label: string; description: string }>;
  commonLanguages: string[];
  commonAmenities: string[];
  popularCities: string[];
}
