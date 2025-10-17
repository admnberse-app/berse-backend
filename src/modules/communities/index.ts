// Main communities module exports

export { CommunityController } from './community.controller';
export { CommunityService } from './community.service';
export { communityRoutes } from './community.routes';

export type {
  CreateCommunityInput,
  UpdateCommunityInput,
  DeleteCommunityInput,
  JoinCommunityInput,
  LeaveCommunityInput,
  UpdateMemberRoleInput,
  RemoveMemberInput,
  ApproveMemberInput,
  RejectMemberInput,
  CommunityQuery,
  CommunityMemberQuery,
  MyCommunityQuery,
  CommunityResponse,
  UserBasicInfo as CommunityUserBasicInfo,
  CommunityMemberResponse,
  CommunityStatsResponse,
  PaginatedCommunitiesResponse,
  PaginatedCommunityMembersResponse,
  CommunityVouchEligibilityResponse,
  InviteToCommunityInput,
  RespondToInviteInput,
  CommunityInviteResponse,
} from './community.types';
