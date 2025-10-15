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
  city?: string;
  interest?: string;
  query?: string;
  page?: number;
  limit?: number;
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
