// ============================================================================
// TRUST MOMENT INPUT TYPES
// ============================================================================

export interface CreateTrustMomentInput {
  connectionId: string;
  receiverId: string;
  eventId?: string;
  momentType?: string; // 'event', 'travel', 'collaboration', 'service', 'general'
  rating: number; // 1-5
  feedback?: string;
  experienceDescription?: string;
  tags?: string[];
  isPublic?: boolean;
}

export interface UpdateTrustMomentInput {
  rating?: number;
  feedback?: string;
  experienceDescription?: string;
  tags?: string[];
  isPublic?: boolean;
}

// ============================================================================
// TRUST MOMENT QUERY TYPES
// ============================================================================

export interface TrustMomentQuery {
  page?: number;
  limit?: number;
  momentType?: string;
  eventId?: string;
  minRating?: number;
  maxRating?: number;
  isPublic?: boolean;
  sortBy?: 'createdAt' | 'rating' | 'trustImpact';
  sortOrder?: 'asc' | 'desc';
}

// ============================================================================
// TRUST MOMENT RESPONSE TYPES
// ============================================================================

export interface TrustMomentResponse {
  id: string;
  connectionId: string;
  giverId: string;
  receiverId: string;
  eventId?: string;
  momentType: string;
  rating: number;
  feedback?: string;
  experienceDescription?: string;
  tags: string[];
  isPublic: boolean;
  isVerified: boolean;
  verificationSource?: string;
  trustImpact: number;
  createdAt: string;
  updatedAt: string;
  giver?: UserBasicInfo;
  receiver?: UserBasicInfo;
  event?: EventBasicInfo;
}

export interface UserBasicInfo {
  id: string;
  fullName: string;
  username?: string;
  profilePicture?: string;
  trustScore: number;
  trustLevel: string;
}

export interface EventBasicInfo {
  id: string;
  title: string;
  type: string;
  date: string;
  location: string;
}

export interface PaginatedTrustMomentsResponse {
  moments: TrustMomentResponse[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ============================================================================
// TRUST MOMENT STATISTICS TYPES
// ============================================================================

export interface TrustMomentStats {
  received: {
    total: number;
    averageRating: number;
    ratingDistribution: {
      oneStar: number;
      twoStar: number;
      threeStar: number;
      fourStar: number;
      fiveStar: number;
    };
    byMomentType: Record<string, number>;
    topTags: Array<{ tag: string; count: number }>;
    positiveCount: number; // Rating 4-5
    neutralCount: number; // Rating 3
    negativeCount: number; // Rating 1-2
    recentMoments: TrustMomentResponse[];
  };
  given: {
    total: number;
    averageRating: number;
    byMomentType: Record<string, number>;
  };
  trustImpact: {
    total: number;
    fromPositive: number;
    fromNeutral: number;
    fromNegative: number;
  };
}
