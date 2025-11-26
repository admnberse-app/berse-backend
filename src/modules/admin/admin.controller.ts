import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../types';
import { sendSuccess } from '../../utils/response';
import { AppError } from '../../middleware/error';
import { AdminService } from './admin.service';

export class AdminController {
  private static adminService = new AdminService();

  /**
   * GET /v2/admin/dashboard
   * Get comprehensive platform statistics for admin dashboard
   */
  static async getDashboard(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const userRole = req.user!.role;

      // Verify admin role
      if (userRole !== 'ADMIN') {
        throw new AppError('Unauthorized: Admin access required', 403);
      }

      const dashboard = await AdminController.adminService.getDashboardStats();
      sendSuccess(res, dashboard, 'Admin dashboard retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /v2/admin/users/stats
   * Get detailed user statistics
   */
  static async getUserStats(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userRole = req.user!.role;

      if (userRole !== 'ADMIN') {
        throw new AppError('Unauthorized: Admin access required', 403);
      }

      const stats = await AdminController.adminService.getUserStats();
      sendSuccess(res, stats, 'User statistics retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /v2/admin/communities/stats
   * Get detailed community statistics
   */
  static async getCommunityStats(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userRole = req.user!.role;

      if (userRole !== 'ADMIN') {
        throw new AppError('Unauthorized: Admin access required', 403);
      }

      const stats = await AdminController.adminService.getCommunityStats();
      sendSuccess(res, stats, 'Community statistics retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /v2/admin/communities
   * Get paginated list of communities with filters
   */
  static async getCommunities(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userRole = req.user!.role;

      if (userRole !== 'ADMIN') {
        throw new AppError('Unauthorized: Admin access required', 403);
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
      const search = req.query.search as string;
      const category = req.query.category as string;
      const city = req.query.city as string;
      const country = req.query.country as string;
      const isVerified = req.query.isVerified ? req.query.isVerified === 'true' : undefined;
      const sortBy = (req.query.sortBy as string) || 'createdAt';
      const sortOrder = (req.query.sortOrder as string) || 'desc';

      const result = await AdminController.adminService.getCommunities({
        page,
        limit,
        search,
        category,
        city,
        country,
        isVerified,
        sortBy,
        sortOrder,
      });

      sendSuccess(res, result, 'Communities retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /v2/admin/communities/:communityId
   * Get detailed community information
   */
  static async getCommunityById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userRole = req.user!.role;

      if (userRole !== 'ADMIN') {
        throw new AppError('Unauthorized: Admin access required', 403);
      }

      const { communityId } = req.params;
      const result = await AdminController.adminService.getCommunityById(communityId);
      sendSuccess(res, result, 'Community details retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /v2/admin/communities/:communityId/verify
   * Update community verification status
   */
  static async verifyCommunity(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userRole = req.user!.role;
      const adminId = req.user!.id;

      if (userRole !== 'ADMIN') {
        throw new AppError('Unauthorized: Admin access required', 403);
      }

      const { communityId } = req.params;
      const { isVerified } = req.body;

      if (typeof isVerified !== 'boolean') {
        throw new AppError('isVerified must be a boolean', 400);
      }

      const result = await AdminController.adminService.verifyCommunity(communityId, isVerified, adminId);
      sendSuccess(res, result, `Community ${isVerified ? 'verified' : 'unverified'} successfully`);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /v2/admin/communities/:communityId
   * Soft delete a community
   */
  static async deleteCommunity(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userRole = req.user!.role;
      const adminId = req.user!.id;

      if (userRole !== 'ADMIN') {
        throw new AppError('Unauthorized: Admin access required', 403);
      }

      const { communityId } = req.params;
      const { reason } = req.body;

      if (!reason) {
        throw new AppError('Reason is required for community deletion', 400);
      }

      const result = await AdminController.adminService.deleteCommunity(communityId, reason, adminId);
      sendSuccess(res, result, 'Community deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /v2/admin/communities/members/:memberId/approve
   * Approve or reject a community join request
   */
  static async approveCommunityJoinRequest(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userRole = req.user!.role;
      const adminId = req.user!.id;

      if (userRole !== 'ADMIN') {
        throw new AppError('Unauthorized: Admin access required', 403);
      }

      const { memberId } = req.params;
      const { isApproved } = req.body;

      if (typeof isApproved !== 'boolean') {
        throw new AppError('isApproved must be a boolean', 400);
      }

      const result = await AdminController.adminService.approveCommunityJoinRequest(memberId, isApproved, adminId);
      sendSuccess(res, result, `Community join request ${isApproved ? 'approved' : 'rejected'} successfully`);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /v2/admin/communities/:communityId/notes
   * Add admin notes to a community
   */
  static async addCommunityNote(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userRole = req.user!.role;
      const adminId = req.user!.id;

      if (userRole !== 'ADMIN') {
        throw new AppError('Unauthorized: Admin access required', 403);
      }

      const { communityId } = req.params;
      const { note } = req.body;

      if (!note || typeof note !== 'string') {
        throw new AppError('Note is required', 400);
      }

      const result = await AdminController.adminService.addCommunityNote(communityId, note, adminId);
      sendSuccess(res, result, 'Community note added successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /v2/admin/communities/:communityId/featured
   * Update community featured status
   */
  static async updateCommunityFeatured(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userRole = req.user!.role;
      const adminId = req.user!.id;

      if (userRole !== 'ADMIN') {
        throw new AppError('Unauthorized: Admin access required', 403);
      }

      const { communityId } = req.params;
      const { isFeatured } = req.body;

      if (typeof isFeatured !== 'boolean') {
        throw new AppError('isFeatured must be a boolean', 400);
      }

      const result = await AdminController.adminService.updateCommunityFeatured(communityId, isFeatured, adminId);
      sendSuccess(res, result, `Community ${isFeatured ? 'featured' : 'unfeatured'} successfully`);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /v2/admin/communities/:communityId/send-warning
   * Send warning to community creator
   */
  static async sendCommunityWarning(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userRole = req.user!.role;
      const adminId = req.user!.id;

      if (userRole !== 'ADMIN') {
        throw new AppError('Unauthorized: Admin access required', 403);
      }

      const { communityId } = req.params;
      const { reason, message } = req.body;

      if (!reason || !message) {
        throw new AppError('Reason and message are required', 400);
      }

      const result = await AdminController.adminService.sendCommunityWarning(
        communityId,
        reason,
        message,
        adminId
      );
      sendSuccess(res, result, 'Community warning sent successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /v2/admin/events/stats
   * Get detailed event statistics
   */
  static async getEventStats(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userRole = req.user!.role;

      if (userRole !== 'ADMIN') {
        throw new AppError('Unauthorized: Admin access required', 403);
      }

      const stats = await AdminController.adminService.getEventStats();
      sendSuccess(res, stats, 'Event statistics retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /v2/admin/users
   * Get paginated list of users with filters
   */
  static async getUsers(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userRole = req.user!.role;

      if (userRole !== 'ADMIN') {
        throw new AppError('Unauthorized: Admin access required', 403);
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = req.query.search as string;
      const role = req.query.role as string;
      const status = req.query.status as string;
      const trustLevel = req.query.trustLevel as string;
      const sortBy = req.query.sortBy as string || 'createdAt';
      const sortOrder = req.query.sortOrder as string || 'desc';

      const result = await AdminController.adminService.getUsers({
        page,
        limit,
        search,
        role,
        status,
        trustLevel,
        sortBy,
        sortOrder
      });

      sendSuccess(res, result, 'Users retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /v2/admin/users/:userId
   * Get detailed information about a specific user
   */
  static async getUserById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userRole = req.user!.role;

      if (userRole !== 'ADMIN') {
        throw new AppError('Unauthorized: Admin access required', 403);
      }

      const { userId } = req.params;
      const user = await AdminController.adminService.getUserById(userId);

      sendSuccess(res, user, 'User details retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /v2/admin/users/:userId/status
   * Update user status (activate, suspend, ban)
   */
  static async updateUserStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userRole = req.user!.role;

      if (userRole !== 'ADMIN') {
        throw new AppError('Unauthorized: Admin access required', 403);
      }

      const { userId } = req.params;
      const { status, reason } = req.body;
      const adminId = req.user!.id;

      if (!status || !['ACTIVE', 'DEACTIVATED', 'BANNED'].includes(status)) {
        throw new AppError('Invalid status. Must be ACTIVE, DEACTIVATED, or BANNED', 400);
      }

      const updatedUser = await AdminController.adminService.updateUserStatus(userId, status, reason, adminId);
      sendSuccess(res, updatedUser, `User status updated to ${status} successfully`);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /v2/admin/users/:userId/verify
   * Verify user identity and update trust level
   */
  static async verifyUserIdentity(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userRole = req.user!.role;

      if (userRole !== 'ADMIN') {
        throw new AppError('Unauthorized: Admin access required', 403);
      }

      const { userId } = req.params;
      const { trustLevel } = req.body;
      const adminId = req.user!.id;

      if (!trustLevel) {
        throw new AppError('Trust level is required', 400);
      }

      const verifiedUser = await AdminController.adminService.verifyUser(userId, trustLevel, adminId);
      sendSuccess(res, verifiedUser, 'User verified successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /v2/admin/users/:userId/notes
   * Add admin note to user
   */
  static async addUserNote(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userRole = req.user!.role;

      if (userRole !== 'ADMIN') {
        throw new AppError('Unauthorized: Admin access required', 403);
      }

      const { userId } = req.params;
      const { note } = req.body;
      const adminId = req.user!.id;

      if (!note) {
        throw new AppError('Note is required', 400);
      }

      const activity = await AdminController.adminService.addAdminNote(userId, note, adminId);
      sendSuccess(res, activity, 'Admin note added successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /v2/admin/users/:userId/verify-email
   * Manually verify user email (emergency override)
   */
  static async verifyUserEmail(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userRole = req.user!.role;

      if (userRole !== 'ADMIN') {
        throw new AppError('Unauthorized: Admin access required', 403);
      }

      const { userId } = req.params;
      const adminId = req.user!.id;

      const result = await AdminController.adminService.verifyUserEmail(userId, adminId);
      sendSuccess(res, result, result.alreadyVerified ? 'Email was already verified' : 'Email verified successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /v2/admin/users/:userId
   * Permanently delete a user
   */
  static async deleteUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userRole = req.user!.role;

      if (userRole !== 'ADMIN') {
        throw new AppError('Unauthorized: Admin access required', 403);
      }

      const { userId } = req.params;
      const { reason } = req.body;
      const adminId = req.user!.id;

      if (!reason) {
        throw new AppError('Reason for deletion is required', 400);
      }

      const deletedUser = await AdminController.adminService.deleteUser(userId, reason, adminId);
      sendSuccess(res, deletedUser, 'User deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /v2/admin/users/:userId/reset-password
   * Reset user password - generates random password and sends email
   */
  static async resetUserPassword(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userRole = req.user!.role;

      if (userRole !== 'ADMIN') {
        throw new AppError('Unauthorized: Admin access required', 403);
      }

      const { userId } = req.params;
      const adminId = req.user!.id;

      const result = await AdminController.adminService.resetUserPassword(userId, adminId);
      sendSuccess(res, result, 'Password reset successfully. User will receive an email with temporary password.');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /v2/admin/users/:userId/role
   * Update user role
   */
  static async updateUserRole(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userRole = req.user!.role;

      if (userRole !== 'ADMIN') {
        throw new AppError('Unauthorized: Admin access required', 403);
      }

      const { userId } = req.params;
      const { role } = req.body;
      const adminId = req.user!.id;

      if (!role || !['GENERAL_USER', 'GUIDE', 'MODERATOR', 'ADMIN'].includes(role)) {
        throw new AppError('Invalid role. Must be GENERAL_USER, GUIDE, MODERATOR, or ADMIN', 400);
      }

      const updatedUser = await AdminController.adminService.updateUserRole(userId, role, adminId);
      sendSuccess(res, updatedUser, `User role updated to ${role} successfully`);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /v2/admin/users/export
   * Export users data as Excel
   */
  static async exportUsers(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userRole = req.user!.role;

      if (userRole !== 'ADMIN') {
        throw new AppError('Unauthorized: Admin access required', 403);
      }

      const role = req.query.role as string;
      const status = req.query.status as string;
      const trustLevel = req.query.trustLevel as string;
      const registrationDateFrom = req.query.registrationDateFrom as string;
      const registrationDateTo = req.query.registrationDateTo as string;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const search = req.query.search as string;

      const excelBuffer = await AdminController.adminService.exportUsers({
        role,
        status,
        trustLevel,
        registrationDateFrom,
        registrationDateTo,
        limit,
        search,
      });
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="users-export-${Date.now()}.xlsx"`);
      res.send(excelBuffer);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /v2/admin/users/pending-verification
   * Get users pending verification
   */
  static async getPendingVerification(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userRole = req.user!.role;

      if (userRole !== 'ADMIN') {
        throw new AppError('Unauthorized: Admin access required', 403);
      }

      const users = await AdminController.adminService.getPendingVerification();
      sendSuccess(res, users, 'Pending verification users retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /v2/admin/users/:userId/verify (legacy - kept for backward compatibility)
   * Manually verify a user's email - assigns 'verified' trust level
   */
  static async verifyUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userRole = req.user!.role;

      if (userRole !== 'ADMIN') {
        throw new AppError('Unauthorized: Admin access required', 403);
      }

      const { userId } = req.params;
      const adminId = req.user!.id;
      const verifiedUser = await AdminController.adminService.verifyUser(userId, 'verified', adminId);

      sendSuccess(res, verifiedUser, 'User verified successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /v2/admin/users/:userId/hosted-events
   * Get events hosted by user
   */
  static async getUserHostedEvents(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userRole = req.user!.role;

      if (userRole !== 'ADMIN') {
        throw new AppError('Unauthorized: Admin access required', 403);
      }

      const { userId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await AdminController.adminService.getUserHostedEvents(userId, page, limit);
      sendSuccess(res, result, 'Hosted events retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /v2/admin/users/:userId/attended-events
   * Get events attended by user
   */
  static async getUserAttendedEvents(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userRole = req.user!.role;

      if (userRole !== 'ADMIN') {
        throw new AppError('Unauthorized: Admin access required', 403);
      }

      const { userId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await AdminController.adminService.getUserAttendedEvents(userId, page, limit);
      sendSuccess(res, result, 'Attended events retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /v2/admin/users/:userId/payments
   * Get user payment history and revenue summary
   */
  static async getUserPayments(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userRole = req.user!.role;

      if (userRole !== 'ADMIN') {
        throw new AppError('Unauthorized: Admin access required', 403);
      }

      const { userId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await AdminController.adminService.getUserPayments(userId, page, limit);
      sendSuccess(res, result, 'Payment history retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /v2/admin/users/:userId/reviews
   * Get user reviews with rating breakdown
   */
  static async getUserReviews(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userRole = req.user!.role;

      if (userRole !== 'ADMIN') {
        throw new AppError('Unauthorized: Admin access required', 403);
      }

      const { userId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await AdminController.adminService.getUserReviews(userId, page, limit);
      sendSuccess(res, result, 'Reviews retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /v2/admin/users/:userId/moderation-history
   * Get user moderation history
   */
  static async getUserModerationHistory(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userRole = req.user!.role;

      if (userRole !== 'ADMIN') {
        throw new AppError('Unauthorized: Admin access required', 403);
      }

      const { userId } = req.params;
      const result = await AdminController.adminService.getUserModerationHistory(userId);
      sendSuccess(res, result, 'Moderation history retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /v2/admin/users/:userId/vouches
   * Get vouches given and received by user
   */
  static async getUserVouches(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userRole = req.user!.role;

      if (userRole !== 'ADMIN') {
        throw new AppError('Unauthorized: Admin access required', 403);
      }

      const { userId } = req.params;
      const result = await AdminController.adminService.getUserVouches(userId);
      sendSuccess(res, result, 'Vouches retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /v2/admin/users/:userId/send-warning
   * Send warning email to user
   */
  static async sendUserWarning(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userRole = req.user!.role;

      if (userRole !== 'ADMIN') {
        throw new AppError('Unauthorized: Admin access required', 403);
      }

      const { userId } = req.params;
      const { reason, message } = req.body;
      const adminId = req.user!.id;

      if (!reason || !message) {
        throw new AppError('Reason and message are required', 400);
      }

      const result = await AdminController.adminService.sendUserWarning(userId, adminId, reason, message);
      sendSuccess(res, result, 'Warning sent successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /v2/admin/users/:userId/moderation-notes
   * Add admin moderation note
   */
  static async addModerationNote(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userRole = req.user!.role;

      if (userRole !== 'ADMIN') {
        throw new AppError('Unauthorized: Admin access required', 403);
      }

      const { userId } = req.params;
      const { note } = req.body;
      const adminId = req.user!.id;

      if (!note) {
        throw new AppError('Note is required', 400);
      }

      const result = await AdminController.adminService.addModerationNote(userId, adminId, note);
      sendSuccess(res, result, 'Moderation note added successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /v2/admin/users/:userId/connections
   * Get user connections
   */
  static async getUserConnections(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userRole = req.user!.role;

      if (userRole !== 'ADMIN') {
        throw new AppError('Unauthorized: Admin access required', 403);
      }

      const { userId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await AdminController.adminService.getUserConnections(userId, page, limit);
      sendSuccess(res, result, 'Connections retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  // ============================================================================
  // EVENT MANAGEMENT ENDPOINTS
  // ============================================================================

  /**
   * GET /v2/admin/events
   * Get paginated list of events with filters
   */
  static async getEvents(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userRole = req.user!.role;

      if (userRole !== 'ADMIN') {
        throw new AppError('Unauthorized: Admin access required', 403);
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = req.query.search as string;
      const type = req.query.type as string;
      const status = req.query.status as string;
      const hostType = req.query.hostType as string;
      const isFree = req.query.isFree as string;
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;
      const sortBy = req.query.sortBy as string || 'date';
      const sortOrder = req.query.sortOrder as string || 'desc';

      const result = await AdminController.adminService.getEvents({
        page,
        limit,
        search,
        type,
        status,
        hostType,
        isFree: isFree === 'true' ? true : isFree === 'false' ? false : undefined,
        startDate,
        endDate,
        sortBy,
        sortOrder
      });

      sendSuccess(res, result, 'Events retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /v2/admin/events/:eventId
   * Get detailed event information
   */
  static async getEventById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userRole = req.user!.role;

      if (userRole !== 'ADMIN') {
        throw new AppError('Unauthorized: Admin access required', 403);
      }

      const { eventId } = req.params;
      const event = await AdminController.adminService.getEventById(eventId);

      sendSuccess(res, event, 'Event details retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /v2/admin/events/:eventId/export-participants
   * Export event participants to Excel
   */
  static async exportEventParticipants(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userRole = req.user!.role;

      if (userRole !== 'ADMIN') {
        throw new AppError('Unauthorized: Admin access required', 403);
      }

      const { eventId } = req.params;
      const { status } = req.query;

      const result = await AdminController.adminService.exportEventParticipants(eventId, {
        status: status as string,
      });

      res.setHeader('Content-Type', result.mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
      res.send(result.buffer);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /v2/admin/events/:eventId
   * Update event information
   */
  static async updateEvent(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userRole = req.user!.role;

      if (userRole !== 'ADMIN') {
        throw new AppError('Unauthorized: Admin access required', 403);
      }

      const { eventId } = req.params;
      const updates = req.body;

      const updatedEvent = await AdminController.adminService.updateEvent(eventId, updates);
      sendSuccess(res, updatedEvent, 'Event updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /v2/admin/events/:eventId
   * Delete an event
   */
  static async deleteEvent(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userRole = req.user!.role;

      if (userRole !== 'ADMIN') {
        throw new AppError('Unauthorized: Admin access required', 403);
      }

      const { eventId } = req.params;
      await AdminController.adminService.deleteEvent(eventId);

      sendSuccess(res, null, 'Event deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /v2/admin/events/:eventId/cancel
   * Cancel an event
   */
  static async cancelEvent(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userRole = req.user!.role;

      if (userRole !== 'ADMIN') {
        throw new AppError('Unauthorized: Admin access required', 403);
      }

      const { eventId } = req.params;
      const { reason } = req.body;

      const canceledEvent = await AdminController.adminService.cancelEvent(eventId, reason);
      sendSuccess(res, canceledEvent, 'Event canceled successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /v2/admin/events/:eventId/publish
   * Publish a draft event
   */
  static async publishEvent(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userRole = req.user!.role;

      if (userRole !== 'ADMIN') {
        throw new AppError('Unauthorized: Admin access required', 403);
      }

      const { eventId } = req.params;
      const publishedEvent = await AdminController.adminService.publishEvent(eventId);

      sendSuccess(res, publishedEvent, 'Event published successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /v2/admin/events/:eventId/notes
   * Add admin notes to an event
   */
  static async addEventNote(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userRole = req.user!.role;
      const adminId = req.user!.id;

      if (userRole !== 'ADMIN') {
        throw new AppError('Unauthorized: Admin access required', 403);
      }

      const { eventId } = req.params;
      const { note } = req.body;

      if (!note || typeof note !== 'string') {
        throw new AppError('Note is required', 400);
      }

      const result = await AdminController.adminService.addEventNote(eventId, note, adminId);
      sendSuccess(res, result, 'Event note added successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /v2/admin/events/:eventId/featured
   * Update event featured status
   */
  static async updateEventFeatured(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userRole = req.user!.role;
      const adminId = req.user!.id;

      if (userRole !== 'ADMIN') {
        throw new AppError('Unauthorized: Admin access required', 403);
      }

      const { eventId } = req.params;
      const { isFeatured } = req.body;

      if (typeof isFeatured !== 'boolean') {
        throw new AppError('isFeatured must be a boolean', 400);
      }

      const result = await AdminController.adminService.updateEventFeatured(eventId, isFeatured, adminId);
      sendSuccess(res, result, `Event ${isFeatured ? 'featured' : 'unfeatured'} successfully`);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /v2/admin/events/:eventId/send-warning
   * Send warning to event host
   */
  static async sendEventWarning(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userRole = req.user!.role;
      const adminId = req.user!.id;

      if (userRole !== 'ADMIN') {
        throw new AppError('Unauthorized: Admin access required', 403);
      }

      const { eventId } = req.params;
      const { reason, message } = req.body;

      if (!reason || !message) {
        throw new AppError('Reason and message are required', 400);
      }

      const result = await AdminController.adminService.sendEventWarning(
        eventId,
        reason,
        message,
        adminId
      );
      sendSuccess(res, result, 'Event warning sent successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /v2/admin/events/stats
   * Get event statistics for dashboard cards
   */
  static async getEventStatistics(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userRole = req.user!.role;

      if (userRole !== 'ADMIN') {
        throw new AppError('Unauthorized: Admin access required', 403);
      }

      const stats = await AdminController.adminService.getEventStatistics();
      sendSuccess(res, stats, 'Event statistics retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /v2/admin/events/:eventId/participants
   * Get list of participants for a specific event
   */
  static async getEventParticipants(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userRole = req.user!.role;

      if (userRole !== 'ADMIN') {
        throw new AppError('Unauthorized: Admin access required', 403);
      }

      const { eventId } = req.params;
      const status = req.query.status as string;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;

      const result = await AdminController.adminService.getEventParticipants(eventId, {
        status,
        page,
        limit
      });

      sendSuccess(res, result, 'Event participants retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /v2/admin/events/export
   * Export events as CSV
   */
  static async exportEvents(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userRole = req.user!.role;

      if (userRole !== 'ADMIN') {
        throw new AppError('Unauthorized: Admin access required', 403);
      }

      const type = req.query.type as string;
      const status = req.query.status as string;
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;

      const csvData = await AdminController.adminService.exportEvents({ 
        type, 
        status,
        startDate,
        endDate 
      });
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="events-export-${Date.now()}.csv"`);
      res.send(csvData);
    } catch (error) {
      next(error);
    }
  }
}
