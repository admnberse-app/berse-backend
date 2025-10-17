import { VouchType, VouchStatus } from '@prisma/client';

// ============================================================================
// VOUCH REQUEST TYPES
// ============================================================================

export interface RequestVouchInput {
  voucherId: string;
  vouchType: VouchType;
  message?: string;
}

export interface RespondToVouchRequestInput {
  vouchId: string;
  action: 'approve' | 'decline' | 'downgrade';
  downgradeTo?: VouchType; // Used when downgrading from PRIMARY to SECONDARY
}

export interface RevokeVouchInput {
  vouchId: string;
  reason?: string;
}

export interface CommunityVouchInput {
  userId: string;
  communityId: string;
  message?: string;
}

// ============================================================================
// VOUCH QUERY TYPES
// ============================================================================

export interface VouchQuery {
  page?: number;
  limit?: number;
  status?: VouchStatus;
  vouchType?: VouchType;
  isCommunityVouch?: boolean;
  sortBy?: 'createdAt' | 'approvedAt' | 'trustImpact';
  sortOrder?: 'asc' | 'desc';
}

// ============================================================================
// VOUCH RESPONSE TYPES
// ============================================================================

export interface VouchResponse {
  id: string;
  voucherId: string;
  voucheeId: string;
  vouchType: VouchType;
  weightPercentage: number;
  message?: string;
  status: VouchStatus;
  isCommunityVouch: boolean;
  communityId?: string;
  isAutoVouched: boolean;
  requestedAt: string;
  approvedAt?: string;
  activatedAt?: string;
  revokedAt?: string;
  revokeReason?: string;
  trustImpact?: number;
  voucher?: UserBasicInfo;
  vouchee?: UserBasicInfo;
  community?: CommunityBasicInfo;
}

export interface UserBasicInfo {
  id: string;
  fullName: string;
  username?: string;
  profilePicture?: string;
  trustScore: number;
  trustLevel: string;
}

export interface CommunityBasicInfo {
  id: string;
  name: string;
  imageUrl?: string;
}

export interface PaginatedVouchesResponse {
  vouches: VouchResponse[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
  summary?: VouchSummary;
}

export interface VouchSummary {
  totalVouchesReceived: number;
  totalVouchesGiven: number;
  primaryVouches: number;
  secondaryVouches: number;
  communityVouches: number;
  pendingRequests: number;
  activeVouches: number;
  revokedVouches: number;
  declinedVouches: number;
  availableSlots: {
    primary: number;
    secondary: number;
    community: number;
  };
}

export interface VouchLimits {
  maxPrimaryVouches: number;
  maxSecondaryVouches: number;
  maxCommunityVouches: number;
  currentPrimaryVouches: number;
  currentSecondaryVouches: number;
  currentCommunityVouches: number;
  canAddPrimary: boolean;
  canAddSecondary: boolean;
  canAddCommunity: boolean;
}

// ============================================================================
// AUTO-VOUCH TYPES
// ============================================================================

export interface AutoVouchEligibility {
  isEligible: boolean;
  communityId: string;
  communityName: string;
  criteria: {
    minEvents: number;
    currentEvents: number;
    minMemberDays: number;
    currentMemberDays: number;
    requireZeroNegativity: boolean;
    hasNegativeFeedback: boolean;
  };
  missingRequirements: string[];
}

export interface AutoVouchCheckResult {
  eligible: AutoVouchEligibility[];
  notEligible: AutoVouchEligibility[];
}
