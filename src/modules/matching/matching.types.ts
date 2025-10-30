import { SwipeAction } from '@prisma/client';

export interface DiscoveryFilters {
  minAge?: number;
  maxAge?: number;
  distance?: number; // in km
  gender?: string;
  interests?: string[];
  city?: string;
  onlyVerified?: boolean;
  minTrustScore?: number;
  limit?: number; // Number of users to return (1-50, default 20)
}

export interface DiscoveryUser {
  id: string;
  fullName: string;
  username?: string;
  age?: number;
  gender?: string;
  bio?: string;
  profilePicture?: string;
  images?: string[];
  
  // Location
  city?: string;
  country?: string;
  distanceKm?: number;
  
  // Profile info
  interests?: string[];
  languages?: string[];
  occupation?: string;
  profession?: string;
  travelStyles?: string[];
  personalityType?: string;
  bucketList?: string[];
  travelBio?: string;
  website?: string;

  // Service offerings
  isHostAvailable?: boolean;
  isGuideAvailable?: boolean;
  isHostCertified?: boolean;

  // Trust & verification
  trustScore?: number;
  isVerified?: boolean;
  badgeCount?: number;
  
  // Stats
  connectionCount?: number;
  eventCount?: number;
  communityCount?: number;
  
  // Mutual data
  mutualFriends?: number;
  mutualCommunities?: number;
  mutualInterests?: string[];
  
  // Matching score
  matchScore?: number; // 0-100 based on compatibility
}

export interface SwipeRequest {
  targetUserId: string;
  action: SwipeAction; // SKIP or INTERESTED
  sessionId?: string;
}

export interface SwipeResponse {
  success: boolean;
  action: SwipeAction;
  alreadySwiped?: boolean;
  message?: string;
}

export interface DiscoveryResponse {
  users: DiscoveryUser[];
  sessionId: string;
  hasMore: boolean;
  filters: DiscoveryFilters;
}

export interface SwipeStatsResponse {
  totalSwipes: number;
  interested: number;
  skipped: number;
  connectionsSent: number;
  pendingInterests: number; // INTERESTED but no connection sent yet
}
