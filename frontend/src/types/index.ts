export interface User {
  id: string;
  email: string;
  fullName: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  profession?: string;
  occupation?: string; // Alternative to profession
  age?: number;
  location?: string;
  currentLocation?: string; // Current location
  originLocation?: string; // Origin location
  interests?: string[];
  topInterests?: string[]; // Top interests from edit profile
  communities?: string[]; // Communities user belongs to
  eventsAttended?: {eventId: string, friendsMade: string[]}[]; // Events attended with friends made
  points?: number;
  bersePassBalance?: number;
  isVerified?: boolean;
  referralCode?: string;
  membershipId?: string; // Unique membership ID for each user (AUN format)
  mutualFriends?: number; // Number of mutual friends
  communityAdminOf?: string[]; // Array of community IDs where user is admin
  googleCalendarConnected?: boolean;
  joinedEvents?: string[]; // Array of event IDs user has joined
  offerings?: {
    berseGuide?: boolean;
    homeSurf?: boolean;
    berseBuddy?: boolean;
    berseMentor?: boolean;
  };
  personalityType?: string; // MBTI type
  languages?: string; // Languages spoken
  qrCode?: string; // Unique QR code for profile
  isAdmin?: boolean; // Admin status
  createdAt: string;
  updatedAt: string;
}

export interface Community {
  id: string;
  name: string;
  description: string;
  category: 'social' | 'sports' | 'volunteer' | 'professional' | 'hobby' | 'cultural' | 'educational';
  avatar?: string;
  coverImage?: string;
  location?: string;
  memberCount: number;
  eventCount: number;
  founderId: string;
  founderName: string;
  admins: Array<{
    id: string;
    name: string;
    role: 'founder' | 'admin' | 'moderator';
    joinedAt: string;
  }>;
  isVerified: boolean;
  verificationBadge?: 'gold' | 'silver' | 'bronze';
  tags?: string[];
  socialLinks?: {
    website?: string;
    instagram?: string;
    facebook?: string;
    telegram?: string;
    whatsapp?: string;
  };
  requirements?: string[];
  achievements?: string[];
  upcomingEvents?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  time: string;
  endTime?: string;
  location: string;
  address?: string;
  hostId: string;
  hostName: string;
  hostInitials: string;
  maxParticipants: number;
  participantCount: number;
  participants?: User[];
  requirements?: string[];
  pointsReward: number;
  image?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  data?: any;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
    refreshToken?: string;
  };
  message?: string;
  error?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  nationality?: string;
  countryOfResidence?: string;
  city?: string;
  gender?: string;
  dateOfBirth?: string;
  referralCode?: string;
  [key: string]: any; // For additional fields
}

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  requirements: string;
  isUnlocked: boolean;
  unlockedAt?: string;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  type: 'discount' | 'product' | 'experience' | 'digital';
  image?: string;
  isAvailable: boolean;
}

export interface UserStats {
  totalPoints: number;
  eventsAttended: number;
  eventsHosted: number;
  connectionsMade: number;
  level: number;
  badges: Badge[];
}