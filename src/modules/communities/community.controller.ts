import { Request, Response } from 'express';
import { CommunityService } from './community.service';
import { sendSuccess } from '../../utils/response';
import { AppError } from '../../middleware/error';
import { CommunityRole } from '@prisma/client';
import type {
  CreateCommunityInput,
  UpdateCommunityInput,
  JoinCommunityInput,
  UpdateMemberRoleInput,
  RemoveMemberInput,
  CommunityQuery,
  CommunityMemberQuery,
} from './community.types';

const communityService = new CommunityService();

export class CommunityController {
  // ============================================================================
  // COMMUNITY MANAGEMENT
  // ============================================================================

  /**
   * @route POST /v2/communities
   * @desc Create a new community
   * @access Private
   */
  async createCommunity(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const input: CreateCommunityInput = req.body;

    const community = await communityService.createCommunity(userId, input);
    sendSuccess(res, community, 'Community created successfully', 201);
  }

  /**
   * @route PUT /v2/communities/:communityId
   * @desc Update community details
   * @access Private (Admin/Moderator)
   */
  async updateCommunity(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const { communityId } = req.params;
    const input: UpdateCommunityInput = { ...req.body, communityId };

    const community = await communityService.updateCommunity(userId, input);
    sendSuccess(res, community, 'Community updated successfully');
  }

  /**
   * @route DELETE /v2/communities/:communityId
   * @desc Delete a community
   * @access Private (Admin only)
   */
  async deleteCommunity(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const { communityId } = req.params;

    await communityService.deleteCommunity(userId, communityId);
    sendSuccess(res, null, 'Community deleted successfully');
  }

  /**
   * @route GET /v2/communities/:communityId
   * @desc Get community details
   * @access Public
   */
  async getCommunity(req: Request, res: Response): Promise<void> {
    const { communityId } = req.params;
    const userId = req.user?.id;

    const community = await communityService.getCommunity(communityId, userId);
    sendSuccess(res, community);
  }

  /**
   * @route GET /v2/communities
   * @desc Get all communities with filters
   * @access Public
   */
  async getCommunities(req: Request, res: Response): Promise<void> {
    const query: CommunityQuery = {
      ...req.query,
      page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
      isVerified: req.query.isVerified === 'true' ? true : req.query.isVerified === 'false' ? false : undefined,
    };

    const result = await communityService.getCommunities(query);
    
    const message = (result as any).isFallback
      ? 'No communities match your filters. Showing all communities instead.'
      : 'Communities retrieved successfully';

    sendSuccess(res, result, message);
  }

  /**
   * @route GET /v2/communities/my
   * @desc Get communities user is member of
   * @access Private
   */
  async getMyCommunities(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const query: CommunityQuery & { filter?: 'active' | 'all'; role?: 'owner' | 'member' | 'all' } = {
      ...req.query,
      page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
      isVerified: req.query.isVerified === 'true' ? true : req.query.isVerified === 'false' ? false : undefined,
      filter: req.query.filter as 'active' | 'all',
      role: req.query.role as 'owner' | 'member' | 'all',
    };

    const result = await communityService.getMyCommunities(userId, query);
    sendSuccess(res, result);
  }

  /**
   * @route GET /v2/communities/my/pending
   * @desc Get user's pending community join requests
   * @access Private
   */
  async getMyPendingRequests(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;

    const result = await communityService.getMyPendingRequests(userId);
    sendSuccess(res, result, 'Pending requests retrieved successfully');
  }

  // ============================================================================
  // COMMUNITY MEMBERSHIP
  // ============================================================================

  /**
   * @route POST /v2/communities/:communityId/join
   * @desc Join a community
   * @access Private
   */
  async joinCommunity(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const { communityId } = req.params;
    const input: JoinCommunityInput = { ...req.body, communityId };

    const member = await communityService.joinCommunity(userId, input);
    sendSuccess(res, member, 'Join request sent successfully', 201);
  }

  /**
   * @route DELETE /v2/communities/:communityId/leave
   * @desc Leave a community
   * @access Private
   */
  async leaveCommunity(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const { communityId } = req.params;

    await communityService.leaveCommunity(userId, communityId);
    sendSuccess(res, null, 'Left community successfully');
  }

  /**
   * @route GET /v2/communities/:communityId/members
   * @desc Get community members
   * @access Public
   */
  async getCommunityMembers(req: Request, res: Response): Promise<void> {
    const { communityId } = req.params;
    const query: CommunityMemberQuery = {
      ...req.query,
      role: req.query.role ? (req.query.role as string).toUpperCase() as CommunityRole : undefined,
      page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
      isApproved: req.query.isApproved === 'true' ? true : req.query.isApproved === 'false' ? false : undefined,
    };

    const result = await communityService.getCommunityMembers(communityId, query);
    sendSuccess(res, result);
  }

  /**
   * @route GET /v2/communities/:communityId/events
   * @desc Get community events
   * @access Public
   */
  async getCommunityEvents(req: Request, res: Response): Promise<void> {
    const { communityId } = req.params;
    const query = {
      ...req.query,
      page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
    };

    const result = await communityService.getCommunityEvents(communityId, query);
    sendSuccess(res, result);
  }

  /**
   * @route POST /v2/communities/:communityId/members/:userId/approve
   * @desc Approve member join request
   * @access Private (Admin/Moderator)
   */
  async approveMember(req: Request, res: Response): Promise<void> {
    const adminUserId = req.user!.id;
    const { communityId, userId } = req.params;

    const member = await communityService.approveMember(adminUserId, communityId, userId);
    sendSuccess(res, member, 'Member approved successfully');
  }

  /**
   * @route POST /v2/communities/:communityId/members/:userId/reject
   * @desc Reject member join request
   * @access Private (Admin/Moderator)
   */
  async rejectMember(req: Request, res: Response): Promise<void> {
    const adminUserId = req.user!.id;
    const { communityId, userId } = req.params;
    const { reason } = req.body;

    await communityService.rejectMember(adminUserId, communityId, userId, reason);
    sendSuccess(res, null, 'Member rejected');
  }

  /**
   * @route PUT /v2/communities/:communityId/members/:userId/role
   * @desc Update member role
   * @access Private (Admin only)
   */
  async updateMemberRole(req: Request, res: Response): Promise<void> {
    const adminUserId = req.user!.id;
    const { communityId, userId } = req.params;
    const { role } = req.body;
    const input: UpdateMemberRoleInput = { communityId, userId, role };

    const member = await communityService.updateMemberRole(adminUserId, input);
    sendSuccess(res, member, 'Member role updated successfully');
  }

  /**
   * @route DELETE /v2/communities/:communityId/members/:userId
   * @desc Remove member from community
   * @access Private (Admin/Moderator)
   */
  async removeMember(req: Request, res: Response): Promise<void> {
    const adminUserId = req.user!.id;
    const { communityId, userId } = req.params;
    const { reason } = req.body;
    const input: RemoveMemberInput = { communityId, userId, reason };

    await communityService.removeMember(adminUserId, input);
    sendSuccess(res, null, 'Member removed successfully');
  }

  /**
   * @route GET /v2/communities/:communityId/stats
   * @desc Get community statistics
   * @access Private (Admin/Moderator)
   */
  async getCommunityStats(req: Request, res: Response): Promise<void> {
    const { communityId } = req.params;

    const stats = await communityService.getCommunityStats(communityId);
    sendSuccess(res, stats);
  }

  // ============================================================================
  // COMMUNITY VOUCHING
  // ============================================================================

  /**
   * @route GET /v2/communities/:communityId/members/:userId/vouch-eligibility
   * @desc Check if member is eligible for auto-vouch
   * @access Private (Admin/Moderator)
   */
  async checkAutoVouchEligibility(req: Request, res: Response): Promise<void> {
    const { communityId, userId } = req.params;

    const eligibility = await communityService.checkAutoVouchEligibility(userId, communityId);
    sendSuccess(res, eligibility);
  }

  /**
   * @route POST /v2/communities/:communityId/members/:userId/vouch
   * @desc Vouch for member on behalf of community
   * @access Private (Admin only)
   */
  async vouchForMember(req: Request, res: Response): Promise<void> {
    const adminUserId = req.user!.id;
    const { communityId, userId } = req.params;

    await communityService.vouchForMember(adminUserId, communityId, userId);
    sendSuccess(res, null, 'Community vouch granted successfully');
  }

  /**
   * @route DELETE /v2/communities/:communityId/members/:userId/vouch
   * @desc Revoke community vouch
   * @access Private (Admin only)
   */
  async revokeVouch(req: Request, res: Response): Promise<void> {
    const adminUserId = req.user!.id;
    const { communityId, userId } = req.params;
    const { reason } = req.body;

    await communityService.revokeVouch(adminUserId, communityId, userId, reason);
    sendSuccess(res, null, 'Community vouch revoked');
  }

  // ============================================================================
  // COMMUNITY DISCOVERY
  // ============================================================================

  /**
   * @route GET /v2/communities/discovery/trending
   * @desc Get trending communities
   * @access Public
   */
  async getTrendingCommunities(req: Request, res: Response): Promise<void> {
    const userId = req.user?.id;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;

    const communities = await communityService.getTrendingCommunities(userId, limit);
    sendSuccess(res, { communities });
  }

  /**
   * @route GET /v2/communities/discovery/new
   * @desc Get newly created communities
   * @access Public
   */
  async getNewCommunities(req: Request, res: Response): Promise<void> {
    const userId = req.user?.id;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;

    const communities = await communityService.getNewCommunities(userId, limit);
    sendSuccess(res, { communities });
  }

  /**
   * @route GET /v2/communities/discovery/recommended
   * @desc Get recommended communities based on user interests
   * @access Private
   */
  async getRecommendedCommunities(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;

    const communities = await communityService.getRecommendedCommunities(userId, limit);
    sendSuccess(res, { communities });
  }

  /**
   * @route GET /v2/communities/discovery/by-interest
   * @desc Get communities by interest/category
   * @access Public
   */
  async getCommunitiesByInterest(req: Request, res: Response): Promise<void> {
    const userId = req.user?.id;
    const { interest } = req.query;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

    if (!interest) {
      throw new AppError('Interest parameter is required', 400);
    }

    const communities = await communityService.getCommunitiesByInterest(
      interest as string,
      userId,
      limit
    );
    sendSuccess(res, { communities });
  }

  /**
   * @route GET /v2/communities/discovery/suggested
   * @desc Get personalized community suggestions
   * @access Private
   */
  async getSuggestedCommunities(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;

    const communities = await communityService.getSuggestedCommunities(userId, limit);
    sendSuccess(res, { communities });
  }

  /**
   * @route GET /v2/communities/discovery/from-connections
   * @desc Get communities user's friends are in
   * @access Private
   */
  async getCommunitiesFromConnections(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;

    const communities = await communityService.getCommunitiesFromConnections(userId, limit);
    sendSuccess(res, { communities });
  }

  // ============================================================================
  // IMAGE UPLOADS
  // ============================================================================

  /**
   * @route POST /v2/communities/upload-logo
   * @desc Upload community logo image
   * @access Private
   */
  async uploadLogo(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const file = req.file;
    const communityId = req.body.communityId || req.query.communityId as string | undefined;

    if (!file) {
      throw new AppError('No logo file provided', 400);
    }

    // Upload to storage
    const { storageService } = await import('../../services/storage.service');
    
    const uploadResult = await storageService.uploadFile(file, 'communities', {
      optimize: true,
      isPublic: true,
      userId,
      entityId: communityId, // Link to community if provided
    });

    sendSuccess(res, { logoUrl: uploadResult.key }, 'Community logo uploaded successfully');
  }

  /**
   * @route POST /v2/communities/upload-cover-image
   * @desc Upload community cover/banner image
   * @access Private
   */
  async uploadCoverImage(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const file = req.file;
    const communityId = req.body.communityId || req.query.communityId as string | undefined;

    if (!file) {
      throw new AppError('No cover image file provided', 400);
    }

    // Upload to storage
    const { storageService } = await import('../../services/storage.service');
    
    const uploadResult = await storageService.uploadFile(file, 'communities', {
      optimize: true,
      isPublic: true,
      userId,
      entityId: communityId, // Link to community if provided
    });

    sendSuccess(res, { coverImageUrl: uploadResult.key }, 'Community cover image uploaded successfully');
  }

  // ============================================================================
  // QR CODE & PUBLIC PREVIEW
  // ============================================================================

  /**
   * @route GET /v2/communities/:communityId/qr-code
   * @desc Generate QR code for community preview
   * @access Private (Admin/Moderator)
   */
  async generateQRCode(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const { communityId } = req.params;

    const qrCode = await communityService.generateCommunityQRCode(userId, communityId);
    sendSuccess(res, qrCode, 'QR code generated successfully');
  }

  /**
   * @route GET /v2/communities/preview/:communityId
   * @desc Get public community preview (no auth required)
   * @access Public
   */
  async getPublicPreview(req: Request, res: Response): Promise<void> {
    const { communityId } = req.params;

    const preview = await communityService.getPublicCommunityPreview(communityId);
    sendSuccess(res, preview, 'Community preview retrieved successfully');
  }
}
