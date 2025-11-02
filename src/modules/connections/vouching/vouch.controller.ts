import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../../types';
import { VouchService } from './vouch.service';
import { sendSuccess } from '../../../utils/response';
import {
  RequestVouchInput,
  RespondToVouchRequestInput,
  RevokeVouchInput,
  CommunityVouchInput,
  VouchQuery,
} from './vouch.types';
import logger from '../../../utils/logger';

export class VouchController {
  
  /**
   * Request a vouch from another user
   * @route POST /v2/vouches/request
   */
  static async requestVouch(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const data: RequestVouchInput = req.body;
      const vouch = await VouchService.requestVouch(userId, data);
      sendSuccess(res, vouch, 'Vouch request sent successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Respond to a vouch request
   * @route POST /v2/vouches/:vouchId/respond
   */
  static async respondToVouchRequest(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { vouchId } = req.params;
      const data: RespondToVouchRequestInput = { vouchId, ...req.body };
      const vouch = await VouchService.respondToVouchRequest(userId, data);
      sendSuccess(res, vouch, 'Vouch request response recorded successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Revoke a vouch
   * @route POST /v2/vouches/:vouchId/revoke
   */
  static async revokeVouch(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { vouchId } = req.params;
      const data: RevokeVouchInput = { vouchId, ...req.body };
      await VouchService.revokeVouch(userId, data);
      sendSuccess(res, null, 'Vouch revoked successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Withdraw a pending vouch request
   * @route DELETE /v2/vouches/:vouchId/withdraw
   */
  static async withdrawVouchRequest(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { vouchId } = req.params;
      await VouchService.withdrawVouchRequest(userId, vouchId);
      sendSuccess(res, null, 'Vouch request withdrawn successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Community admin vouches for a user
   * @route POST /v2/vouches/community
   */
  static async createCommunityVouch(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const adminId = req.user!.id;
      const data: CommunityVouchInput = req.body;
      const vouch = await VouchService.createCommunityVouch(adminId, data);
      sendSuccess(res, vouch, 'Community vouch created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Check auto-vouch eligibility
   * @route GET /v2/vouches/auto-vouch/eligibility
   */
  static async checkAutoVouchEligibility(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const result = await VouchService.checkAutoVouchEligibility(userId);
      sendSuccess(res, result, 'Auto-vouch eligibility checked successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get vouches received
   * @route GET /v2/vouches/received
   */
  static async getVouchesReceived(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const query: VouchQuery = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
        status: req.query.status as any,
        vouchType: req.query.vouchType as any,
        isCommunityVouch: req.query.isCommunityVouch === 'true',
        sortBy: req.query.sortBy as any,
        sortOrder: req.query.sortOrder as any,
      };
      const result = await VouchService.getVouchesReceived(userId, query);
      sendSuccess(res, result, 'Vouches received retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get vouches given
   * @route GET /v2/vouches/given
   */
  static async getVouchesGiven(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const query: VouchQuery = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
        status: req.query.status as any,
        vouchType: req.query.vouchType as any,
        isCommunityVouch: req.query.isCommunityVouch === 'true',
        sortBy: req.query.sortBy as any,
        sortOrder: req.query.sortOrder as any,
      };
      const result = await VouchService.getVouchesGiven(userId, query);
      sendSuccess(res, result, 'Vouches given retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get vouch limits
   * @route GET /v2/vouches/limits
   */
  static async getVouchLimits(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const limits = await VouchService.getVouchLimits(userId);
      sendSuccess(res, limits, 'Vouch limits retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get vouch summary
   * @route GET /v2/vouches/summary
   */
  static async getVouchSummary(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const summary = await VouchService.getVouchSummary(userId);
      sendSuccess(res, summary, 'Vouch summary retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get vouches for a specific user
   * @route GET /v2/users/:userId/vouches
   */
  static async getUserVouches(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;
      const requesterId = req.user?.id;
      
      const query: VouchQuery = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
        status: req.query.status as any,
        vouchType: req.query.vouchType as any,
        isCommunityVouch: req.query.isCommunityVouch === 'true',
        sortBy: req.query.sortBy as any,
        sortOrder: req.query.sortOrder as any,
      };

      // Get vouches received by this user
      const received = await VouchService.getVouchesReceived(userId, query);
      
      // Only include vouches given if viewing own profile
      let given = null;
      if (userId === requesterId) {
        given = await VouchService.getVouchesGiven(userId, query);
      }

      // Get limits
      const limits = await VouchService.getVouchLimits(userId);

      sendSuccess(res, {
        received,
        given,
        limits,
      }, 'User vouches retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}
