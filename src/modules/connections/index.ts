// Main connections module exports

// Core connection module
export { connectionRoutes, ConnectionController, ConnectionService } from './core';
export type {
  SendConnectionRequestInput,
  RespondToConnectionRequestInput,
  RemoveConnectionInput,
  WithdrawConnectionRequestInput,
  BlockUserInput,
  UnblockUserInput,
  UpdateConnectionInput,
  ConnectionQuery,
  MutualConnectionsQuery,
  ConnectionSuggestionsQuery,
  ConnectionResponse,
  ConnectionStatsResponse,
  MutualConnectionsResponse,
  ConnectionSuggestionResponse,
  PaginatedConnectionsResponse,
  BlockedUserResponse,
  PaginatedBlockedUsersResponse,
  UserBasicInfo as ConnectionUserBasicInfo,
} from './core';

// Vouching module
export { vouchRoutes, VouchController, VouchService } from './vouching';
export type {
  RequestVouchInput,
  RespondToVouchRequestInput,
  RevokeVouchInput,
  CommunityVouchInput,
  VouchQuery,
  VouchResponse,
  PaginatedVouchesResponse,
  VouchSummary,
  VouchLimits,
  AutoVouchCheckResult,
  AutoVouchEligibility,
} from './vouching';

// Trust score module
export { TrustScoreService } from './trust';

// Travel module
export { TravelService } from './travel';

// Trust moments module
export { TrustMomentService } from './trust-moments';
