import { CommunityRole } from '@prisma/client';

// ============================================================================
// SHARED TYPES
// ============================================================================

export interface SocialLinks {
  instagram?: string;
  facebook?: string;
  linkedin?: string;
  twitter?: string;
  youtube?: string;
  tiktok?: string;
}

export interface LocationData {
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}

// ============================================================================
// COMMUNITY MANAGEMENT TYPES
// ============================================================================

export interface CreateCommunityInput {
  name: string;
  description?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  category?: string; // @deprecated - Use interests instead
  interests?: string[]; // Array of interest values from profile metadata
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  requiresApproval?: boolean;
  guidelines?: string;
  socialLinks?: SocialLinks;
  websiteUrl?: string;
  contactEmail?: string;
}

export interface UpdateCommunityInput {
  communityId: string;
  name?: string;
  description?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  category?: string; // @deprecated - Use interests instead
  interests?: string[]; // Array of interest values from profile metadata
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  requiresApproval?: boolean;
  guidelines?: string;
  socialLinks?: SocialLinks;
  websiteUrl?: string;
  contactEmail?: string;
  isVerified?: boolean;
}

export interface DeleteCommunityInput {
  communityId: string;
}

// ============================================================================
// COMMUNITY MEMBER TYPES
// ============================================================================

export interface JoinCommunityInput {
  communityId: string;
  message?: string;
}

export interface LeaveCommunityInput {
  communityId: string;
}

export interface UpdateMemberRoleInput {
  communityId: string;
  userId: string;
  role: CommunityRole;
}

export interface RemoveMemberInput {
  communityId: string;
  userId: string;
  reason?: string;
}

export interface ApproveMemberInput {
  communityId: string;
  userId: string;
}

export interface RejectMemberInput {
  communityId: string;
  userId: string;
  reason?: string;
}

// ============================================================================
// COMMUNITY QUERY TYPES
// ============================================================================

export interface CommunityQuery {
  page?: number;
  limit?: number;
  category?: string; // @deprecated - Use interests instead
  interests?: string[]; // Filter by multiple interests
  search?: string;
  isVerified?: boolean;
  sortBy?: 'createdAt' | 'name' | 'memberCount';
  sortOrder?: 'asc' | 'desc';
}

export interface CommunityMemberQuery {
  page?: number;
  limit?: number;
  role?: CommunityRole;
  isApproved?: boolean;
  search?: string;
  sortBy?: 'joinedAt' | 'name';
  sortOrder?: 'asc' | 'desc';
}

export interface MyCommunityQuery {
  page?: number;
  limit?: number;
  role?: CommunityRole;
  category?: string; // @deprecated - Use interests instead
  interests?: string[]; // Filter by multiple interests
  search?: string;
}

export interface CommunityEventsQuery {
  page?: number;
  limit?: number;
  type?: string; // EventType filter
  upcoming?: boolean; // Only upcoming events (date >= now)
  status?: string; // DRAFT, PUBLISHED, CANCELLED
  search?: string; // Search in title/description
}

// ============================================================================
// COMMUNITY RESPONSE TYPES
// ============================================================================

export interface CommunityResponse {
  id: string;
  name: string;
  description?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  category?: string; // @deprecated - Use interests instead
  interests: string[]; // Array of interest values matching profile metadata
  isVerified: boolean;
  requiresApproval: boolean; // Whether new members need approval
  guidelines?: string; // Community rules (markdown supported)
  socialLinks?: SocialLinks; // Social media links
  websiteUrl?: string;
  contactEmail?: string;
  location?: LocationData; // City, country, coordinates
  createdAt: string;
  updatedAt: string;
  creator: UserBasicInfo;
  memberCount: number;
  eventCount?: number;
  role?: CommunityRole;
  isApproved?: boolean;
  membersPreview?: Array<{
    id: string;
    fullName: string;
    username?: string;
    profilePicture?: string;
    trustLevel: string;
    role: CommunityRole;
    joinedAt: string;
  }>;
  upcomingEventsPreview?: Array<{
    id: string;
    title: string;
    type: string;
    date: string;
    location: string;
    images: string[];
    isFree: boolean;
    rsvpCount: number;
  }>;
  userStatus?: {
    isMember: boolean;
    isAdmin: boolean;
    isModerator: boolean;
    isPending: boolean;
    role?: CommunityRole;
    joinedAt?: string; // User's join date in this community
    canJoin: boolean; // Whether user can join (based on subscription limits)
    joinLimit?: {
      current: number; // Current communities joined/pending
      max: number; // Max allowed (-1 = unlimited)
      remaining: number; // Remaining slots (-1 = unlimited)
    };
  };
  stats?: CommunityDetailedStats;
  adminData?: {
    pendingMemberRequests: number;
    pendingVouchOffers: number;
    reportedContent: number;
  };
}

export interface UserBasicInfo {
  id: string;
  fullName: string;
  username?: string;
  profilePicture?: string;
  trustLevel: string;
}

export interface CommunityMemberResponse {
  id: string;
  role: CommunityRole;
  joinedAt: string;
  isApproved: boolean;
  user: UserBasicInfo;
}

export interface CommunityStatsResponse {
  totalMembers: number;
  adminCount: number;
  moderatorCount: number;
  memberCount: number;
  pendingApprovals: number;
  totalEvents: number;
  activeEvents: number;
  totalVouches: number;
}

export interface CommunityDetailedStats {
  totalEvents: number; // Past + future events
  upcomingEvents: number; // Future events only
  pastEvents: number; // Past events
  adminCount: number;
  moderatorCount: number;
  totalVouchesGiven: number; // Vouches given within this community
  lastEventDate?: string; // Most recent event date
  lastMemberJoinDate?: string; // Most recent member join
  memberGrowthLast30Days: number; // Members joined in last 30 days
  averageEventAttendance?: number; // Average RSVPs per event
}

export interface PaginatedCommunitiesResponse {
  communities: CommunityResponse[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
  isFallback?: boolean;
}

export interface PaginatedCommunityMembersResponse {
  members: CommunityMemberResponse[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============================================================================
// COMMUNITY VOUCH TYPES
// ============================================================================

export interface CommunityVouchEligibilityResponse {
  isEligible: boolean;
  reason: string;
  criteria: {
    eventsAttended: number;
    requiredEvents: number;
    membershipDays: number;
    requiredDays: number;
    hasNegativeFeedback: boolean;
    currentVouches: number;
    maxVouches: number;
  };
}

// ============================================================================
// COMMUNITY INVITE TYPES
// ============================================================================

export interface InviteToCommunityInput {
  communityId: string;
  userIds: string[];
  message?: string;
}

export interface RespondToInviteInput {
  inviteId: string;
  action: 'accept' | 'reject';
}

export interface CommunityInviteResponse {
  id: string;
  communityId: string;
  invitedBy: UserBasicInfo;
  status: 'pending' | 'accepted' | 'rejected';
  message?: string;
  createdAt: string;
  expiresAt: string;
}

// ============================================================================
// COMMUNITY QR CODE & PUBLIC PREVIEW TYPES
// ============================================================================

export interface CommunityQRCodeResponse {
  communityId: string;
  qrCodeDataUrl: string; // Base64 data URL of QR code image
  previewUrl: string; // Public URL to preview page
  webUrl: string; // Deep link URL that works for both web and app
}

export interface PublicCommunityPreview {
  id: string;
  name: string;
  description?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  interests: string[];
  isVerified: boolean;
  memberCount: number;
  upcomingEvents: Array<{
    id: string;
    title: string;
    type: string;
    date: string;
    location: string;
    images: string[];
    isFree: boolean;
    price?: number;
  }>;
  downloadLinks: {
    ios: string;
    android: string;
    deepLink: string; // Universal link for app deep linking
  };
}
