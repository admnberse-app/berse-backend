import { CommunityRole } from '@prisma/client';

// ============================================================================
// COMMUNITY MANAGEMENT TYPES
// ============================================================================

export interface CreateCommunityInput {
  name: string;
  description?: string;
  imageUrl?: string;
  category?: string;
}

export interface UpdateCommunityInput {
  communityId: string;
  name?: string;
  description?: string;
  imageUrl?: string;
  category?: string;
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
  category?: string;
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
  category?: string;
  search?: string;
}

// ============================================================================
// COMMUNITY RESPONSE TYPES
// ============================================================================

export interface CommunityResponse {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  category?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  creator: UserBasicInfo;
  memberCount: number;
  eventCount?: number;
  role?: CommunityRole;
  isApproved?: boolean;
}

export interface UserBasicInfo {
  id: string;
  fullName: string;
  username?: string;
  profilePicture?: string;
  trustScore: number;
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

export interface PaginatedCommunitiesResponse {
  communities: CommunityResponse[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
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
