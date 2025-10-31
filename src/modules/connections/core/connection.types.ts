import { ConnectionStatus } from '@prisma/client';

// ============================================================================
// CONNECTION REQUEST TYPES
// ============================================================================

export interface SendConnectionRequestInput {
  receiverId: string;
  message?: string;
  relationshipType?: string;
  relationshipCategory?: string;
  howWeMet?: string;
}

export interface RespondToConnectionRequestInput {
  connectionId: string;
  action: 'accept' | 'reject';
}

export interface RemoveConnectionInput {
  connectionId: string;
}

export interface WithdrawConnectionRequestInput {
  connectionId: string;
}

export interface BlockUserInput {
  userId: string;
  reason?: string;
}

export interface UnblockUserInput {
  userId: string;
}

export interface UpdateConnectionInput {
  connectionId: string;
  relationshipType?: string;
  relationshipCategory?: string;
  howWeMet?: string;
  tags?: string[];
}

// ============================================================================
// CONNECTION QUERY TYPES
// ============================================================================

export interface ConnectionQuery {
  page?: number;
  limit?: number;
  status?: ConnectionStatus;
  relationshipCategory?: string;
  search?: string;
  sortBy?: 'createdAt' | 'connectedAt' | 'trustStrength' | 'interactionCount';
  sortOrder?: 'asc' | 'desc';
  direction?: 'sent' | 'received' | 'all';
}

export interface MutualConnectionsQuery {
  userId: string;
  page?: number;
  limit?: number;
}

export interface ConnectionSuggestionsQuery {
  page?: number;
  limit?: number;
  basedOn?: 'mutual_friends' | 'mutual_communities' | 'mutual_events' | 'location' | 'interests';
}

// ============================================================================
// CONNECTION RESPONSE TYPES
// ============================================================================

export interface ConnectionResponse {
  id: string;
  initiatorId: string;
  receiverId: string;
  status: ConnectionStatus;
  message: string | null;
  relationshipType: string | null;
  relationshipCategory: string | null;
  howWeMet: string | null;
  mutualFriendsCount: number;
  mutualCommunitiesCount: number;
  createdAt: string;
  respondedAt: string | null;
  connectedAt: string | null;
  removedAt: string | null;
  removedBy: string | null;
  canReconnectAt: string | null;
  otherUser: UserBasicInfo;
  isInitiator: boolean;
}

export interface UserBasicInfo {
  id: string;
  fullName: string;
  username?: string;
  profilePicture?: string;
  bio?: string;
  trustScore: number;
  trustLevel: string;
  location?: {
    currentCity?: string;
    countryOfResidence?: string;
  };
}

export interface ConnectionStatsResponse {
  totalConnections: number;
  pendingRequests: number;
  sentRequests: number;
  professionalConnections: number;
  friendConnections: number;
  familyConnections: number;
  mentorConnections: number;
  travelConnections: number;
  communityConnections: number;
  averageRating?: number;
}

export interface MutualConnectionsResponse {
  mutualConnections: UserBasicInfo[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ConnectionSuggestionResponse {
  user: UserBasicInfo;
  reason: string;
  score: number;
  mutualFriends?: number;
  mutualCommunities?: number;
  mutualEvents?: number;
  sharedInterests?: string[];
}

export interface PaginatedConnectionsResponse {
  connections: ConnectionResponse[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
  stats?: ConnectionStatsResponse;
}

// ============================================================================
// BLOCKED USER TYPES
// ============================================================================

export interface BlockedUserResponse {
  id: string;
  blockedId: string;
  reason?: string;
  createdAt: string;
  blockedUser: UserBasicInfo;
}

export interface PaginatedBlockedUsersResponse {
  blockedUsers: BlockedUserResponse[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
}
