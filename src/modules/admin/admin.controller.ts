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
   * PATCH /v2/admin/users/:userId
   * Update user information (role, status, verification)
   */
  static async updateUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userRole = req.user!.role;

      if (userRole !== 'ADMIN') {
        throw new AppError('Unauthorized: Admin access required', 403);
      }

      const { userId } = req.params;
      const updates = req.body;

      const updatedUser = await AdminController.adminService.updateUser(userId, updates);
      sendSuccess(res, updatedUser, 'User updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /v2/admin/users/:userId
   * Soft delete a user
   */
  static async deleteUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userRole = req.user!.role;

      if (userRole !== 'ADMIN') {
        throw new AppError('Unauthorized: Admin access required', 403);
      }

      const { userId } = req.params;
      await AdminController.adminService.deleteUser(userId);

      sendSuccess(res, null, 'User deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /v2/admin/users/:userId/suspend
   * Suspend a user account
   */
  static async suspendUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userRole = req.user!.role;

      if (userRole !== 'ADMIN') {
        throw new AppError('Unauthorized: Admin access required', 403);
      }

      const { userId } = req.params;
      const { reason } = req.body;

      const suspendedUser = await AdminController.adminService.suspendUser(userId, reason);
      sendSuccess(res, suspendedUser, 'User suspended successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /v2/admin/users/:userId/activate
   * Activate a suspended user account
   */
  static async activateUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userRole = req.user!.role;

      if (userRole !== 'ADMIN') {
        throw new AppError('Unauthorized: Admin access required', 403);
      }

      const { userId } = req.params;
      const activatedUser = await AdminController.adminService.activateUser(userId);

      sendSuccess(res, activatedUser, 'User activated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /v2/admin/users/export
   * Export users data as CSV
   */
  static async exportUsers(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userRole = req.user!.role;

      if (userRole !== 'ADMIN') {
        throw new AppError('Unauthorized: Admin access required', 403);
      }

      const role = req.query.role as string;
      const status = req.query.status as string;

      const csvData = await AdminController.adminService.exportUsers({ role, status });
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="users-export-${Date.now()}.csv"`);
      res.send(csvData);
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
   * POST /v2/admin/users/:userId/verify
   * Manually verify a user
   */
  static async verifyUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userRole = req.user!.role;

      if (userRole !== 'ADMIN') {
        throw new AppError('Unauthorized: Admin access required', 403);
      }

      const { userId } = req.params;
      const verifiedUser = await AdminController.adminService.verifyUser(userId);

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
