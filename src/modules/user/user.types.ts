export interface UpdateProfileRequest {
  // Core Info
  fullName?: string;
  username?: string;
  email?: string;
  phone?: string;
  
  // Profile Info
  displayName?: string;
  profilePicture?: string;
  bio?: string;
  fullBio?: string;  // Alias for bio
  shortBio?: string;
  
  // Demographics
  dateOfBirth?: string;
  gender?: string;
  age?: number;
  
  // Professional
  profession?: string;
  occupation?: string;
  website?: string;
  
  // Personal
  personalityType?: string;
  interests?: string[];
  languages?: string[];
  topInterests?: string[];  // Alias for interests
  
  // Location
  currentCity?: string;
  city?: string;  // Alias for currentCity
  countryOfResidence?: string;
  currentLocation?: string;
  nationality?: string;
  originallyFrom?: string;
  
  // Geospatial Coordinates
  latitude?: number;
  longitude?: number;
  
  // Privacy Settings
  locationPrivacy?: 'public' | 'friends' | 'private';
  
  // Social Handles
  instagramHandle?: string;
  linkedinHandle?: string;
  instagram?: string;  // Alias
  linkedin?: string;   // Alias
  
  // Travel Preferences
  travelStyle?: string;
  bucketList?: string[];
  travelBio?: string;
  travelHistory?: string[];
  
  // Community
  servicesOffered?: string[];
  communityRole?: string;
  eventsAttended?: number;
}

export interface UserSearchQuery {
  // Text search
  query?: string;
  
  // Basic filters
  city?: string;
  interest?: string;
  gender?: string;
  
  // Location-based filters
  latitude?: number;
  longitude?: number;
  radius?: number; // in kilometers
  nearby?: boolean; // shorthand for radius-based search
  
  // Connection filters
  connectionType?: 'all' | 'mutuals' | 'suggestions' | 'new';
  hasMutualFriends?: boolean;
  mutualFriendsMin?: number;
  
  // Trust score filters
  minTrustScore?: number;
  maxTrustScore?: number;
  trustLevel?: 'NEW' | 'BUILDING' | 'ESTABLISHED' | 'TRUSTED' | 'VERIFIED';
  
  // Activity filters
  minEventsAttended?: number;
  hasHostedEvents?: boolean;
  isVerified?: boolean;
  
  // Sorting
  sortBy?: 'relevance' | 'trustScore' | 'distance' | 'recentActivity' | 'mutualFriends';
  sortOrder?: 'asc' | 'desc';
  
  // Pagination
  page?: number;
  limit?: number;
  
  // Exclusions
  excludeConnected?: boolean; // Exclude already connected users
  excludeBlocked?: boolean; // Exclude blocked users (always applied)
}

export interface UserProfileResponse {
  id: string;
  email: string;
  phone?: string;
  fullName: string;
  username?: string;
  role: string;
  totalPoints: number;
  createdAt: Date;
  updatedAt: Date;
  profile?: {
    displayName?: string;
    profilePicture?: string;
    bio?: string;
    shortBio?: string;
    dateOfBirth?: Date;
    gender?: string;
    age?: number;
    profession?: string;
    occupation?: string;
    website?: string;
    personalityType?: string;
    interests: string[];
    languages: string[];
    instagramHandle?: string;
    linkedinHandle?: string;
    travelStyle?: string;
    bucketList: string[];
    travelBio?: string;
    locationPrivacy?: string;
  };
  location?: {
    currentCity?: string;
    countryOfResidence?: string;
    currentLocation?: string;
    nationality?: string;
    originallyFrom?: string;
    latitude?: number;
    longitude?: number;
    lastLocationUpdate?: Date;
  };
  metadata?: {
    membershipId?: string;
    referralCode: string;
  };
  stats?: {
    hostedEvents: number;
    attendedEvents: number;
    referrals: number;
    badges: number;
  };
}
