import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../../types';
import { ConnectionService } from './connection.service';
import { QRCodeService } from '../../user/qr-code.service';
import { sendSuccess } from '../../../utils/response';
import { AppError } from '../../../middleware/error';
import {
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
} from './connection.types';
import logger from '../../../utils/logger';

export class ConnectionController {
  
  // ============================================================================
  // CONNECTION REQUEST ENDPOINTS
  // ============================================================================
  
  /**
   * Send a connection request
   * @route POST /v2/connections/request
   */
  static async sendConnectionRequest(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.id;
      const data: SendConnectionRequestInput = req.body;

      const connection = await ConnectionService.sendConnectionRequest(userId, data);

      logger.info(`Connection request sent by user ${userId}`);
      sendSuccess(res, connection, 'Connection request sent successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Scan QR code to send connection request
   * @route POST /v2/connections/scan-qr
   */
  static async scanQRCodeForConnection(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const scannerId = req.user!.id;
      const { qrData } = req.body;

      if (!qrData) {
        throw new AppError('QR code data is required', 400);
      }

      // Validate QR code
      const qrValidation = await QRCodeService.validateQRCode(qrData);

      if (qrValidation.purpose !== 'CONNECT') {
        throw new AppError('This QR code is not for making connections', 400);
      }

      const targetUserId = qrValidation.userId;

      // Check if scanner is trying to connect with themselves
      if (scannerId === targetUserId) {
        throw new AppError('You cannot connect with yourself', 400);
      }

      // Check existing connection status
      const connectionStatus = await ConnectionService.getConnectionStatus(scannerId, targetUserId);

      if (connectionStatus === 'CONNECTED') {
        sendSuccess(res, {
          ...qrValidation,
          connectionStatus: 'connected',
          message: 'You are already connected with this user',
        }, 'Already connected');
        return;
      }

      if (connectionStatus === 'PENDING') {
        sendSuccess(res, {
          ...qrValidation,
          connectionStatus: 'pending',
          message: 'Connection request already pending',
        }, 'Request already sent');
        return;
      }

      // Send connection request
      const connection = await ConnectionService.sendConnectionRequest(scannerId, {
        receiverId: targetUserId,
        message: 'Connected via QR code',
        relationshipType: 'friend',
      });

      // Invalidate the QR code nonce to prevent reuse
      await QRCodeService.invalidateQRCode(qrValidation.userId);

      logger.info(`Connection request via QR scan: ${scannerId} -> ${targetUserId}`);
      
      sendSuccess(res, {
        ...qrValidation,
        connection,
        connectionStatus: 'pending',
        message: 'Connection request sent successfully',
      }, 'Connection request sent via QR code', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Respond to a connection request (accept/reject)
   * @route POST /v2/connections/:connectionId/respond
   */
  static async respondToConnectionRequest(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.id;
      const { connectionId } = req.params;
      const data: RespondToConnectionRequestInput = {
        connectionId,
        action: req.body.action,
      };

      const connection = await ConnectionService.respondToConnectionRequest(userId, data);

      logger.info(`Connection request ${data.action}ed by user ${userId}`);
      sendSuccess(res, connection, `Connection request ${data.action}ed successfully`);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Withdraw a pending connection request
   * @route DELETE /v2/connections/:connectionId/withdraw
   */
  static async withdrawConnectionRequest(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.id;
      const { connectionId } = req.params;
      const data: WithdrawConnectionRequestInput = { connectionId };

      await ConnectionService.withdrawConnectionRequest(userId, data);

      logger.info(`Connection request withdrawn by user ${userId}`);
      sendSuccess(res, null, 'Connection request withdrawn successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Remove an existing connection
   * @route DELETE /v2/connections/:connectionId
   */
  static async removeConnection(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.id;
      const { connectionId } = req.params;
      const data: RemoveConnectionInput = { connectionId };

      await ConnectionService.removeConnection(userId, data);

      logger.info(`Connection removed by user ${userId}`);
      sendSuccess(res, null, 'Connection removed successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update connection details
   * @route PUT /v2/connections/:connectionId
   */
  static async updateConnection(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.id;
      const { connectionId } = req.params;
      const data: UpdateConnectionInput = {
        connectionId,
        ...req.body,
      };

      const connection = await ConnectionService.updateConnection(userId, data);

      logger.info(`Connection updated by user ${userId}`);
      sendSuccess(res, connection, 'Connection updated successfully');
    } catch (error) {
      next(error);
    }
  }

  // ============================================================================
  // CONNECTION RETRIEVAL ENDPOINTS
  // ============================================================================

  /**
   * Get user's connections with filters
   * @route GET /v2/connections
   */
  static async getConnections(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.id;
      const query: ConnectionQuery = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
        status: req.query.status as any,
        relationshipCategory: req.query.relationshipCategory as string,
        search: req.query.search as string,
        sortBy: req.query.sortBy as any,
        sortOrder: req.query.sortOrder as any,
        direction: req.query.direction as any,
      };

      const result = await ConnectionService.getConnections(userId, query);

      sendSuccess(res, result, 'Connections retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get a single connection by ID
   * @route GET /v2/connections/:connectionId
   */
  static async getConnectionById(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.id;
      const { connectionId } = req.params;

      const connection = await ConnectionService.getConnectionById(userId, connectionId);

      sendSuccess(res, connection, 'Connection retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get connection status with another user
   * @route GET /v2/connections/status/:userId
   */
  static async getConnectionStatus(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const currentUserId = req.user!.id;
      const { userId } = req.params;

      const status = await ConnectionService.getConnectionStatus(currentUserId, userId);

      sendSuccess(res, { status }, 'Connection status retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get connection stats
   * @route GET /v2/connections/stats
   */
  static async getConnectionStats(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.id;

      const stats = await ConnectionService.getConnectionStats(userId);

      sendSuccess(res, stats, 'Connection stats retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get mutual connections with another user
   * @route GET /v2/connections/mutual/:userId
   */
  static async getMutualConnections(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const currentUserId = req.user!.id;
      const query: MutualConnectionsQuery = {
        userId: req.params.userId,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
      };

      const result = await ConnectionService.getMutualConnections(currentUserId, query);

      sendSuccess(res, result, 'Mutual connections retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get connection suggestions
   * @route GET /v2/connections/suggestions
   */
  static async getConnectionSuggestions(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.id;
      const query: ConnectionSuggestionsQuery = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        basedOn: req.query.basedOn as any,
      };

      const suggestions = await ConnectionService.getConnectionSuggestions(userId, query);

      sendSuccess(res, suggestions, 'Connection suggestions retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  // ============================================================================
  // BLOCK/UNBLOCK ENDPOINTS
  // ============================================================================

  /**
   * Block a user
   * @route POST /v2/connections/block
   */
  static async blockUser(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.id;
      const data: BlockUserInput = req.body;

      await ConnectionService.blockUser(userId, data);

      logger.info(`User ${userId} blocked user ${data.userId}`);
      sendSuccess(res, null, 'User blocked successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Unblock a user
   * @route DELETE /v2/connections/block/:userId
   */
  static async unblockUser(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.id;
      const data: UnblockUserInput = {
        userId: req.params.userId,
      };

      await ConnectionService.unblockUser(userId, data);

      logger.info(`User ${userId} unblocked user ${data.userId}`);
      sendSuccess(res, null, 'User unblocked successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get list of blocked users
   * @route GET /v2/connections/blocked
   */
  static async getBlockedUsers(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await ConnectionService.getBlockedUsers(userId, page, limit);

      sendSuccess(res, result, 'Blocked users retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  // ============================================================================
  // ACTIVITY DISCOVERY ENDPOINTS
  // ============================================================================

  /**
   * Get recent activities from connections or public feed
   * @route GET /v2/connections/activities/recent
   */
  static async getRecentActivities(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.id;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      const scope = (req.query.scope as 'connections' | 'public' | 'community' | 'nearby') || 'public';
      const activityTypes = req.query.activityTypes
        ? (req.query.activityTypes as string).split(',')
        : undefined;

      const result = await ConnectionService.getRecentActivities(userId, {
        limit,
        offset,
        activityTypes,
        scope,
      });

      sendSuccess(res, result, 'Recent activities retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}
