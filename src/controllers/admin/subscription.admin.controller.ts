/**
 * Admin Subscription Management Controller
 * Allows admins to dynamically configure subscription tiers
 */

import { Response } from 'express';
import { AuthRequest } from '../../middlewares/featureAccess.middleware';
import { prisma } from '../../config/database';
import { SubscriptionTier, TierFeatures } from '../../modules/subscription/subscription.types';

class AdminSubscriptionController {
  /**
   * GET /api/admin/subscriptions/tiers
   * Get all subscription tiers (admin view with full details)
   */
  async getAllTiers(req: AuthRequest, res: Response) {
    try {
      const tiers = await prisma.subscriptionTier.findMany({
        orderBy: { price: 'asc' },
      });

      res.status(200).json({
        success: true,
        data: tiers,
      });
    } catch (error) {
      console.error('Admin get all tiers error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch subscription tiers',
      });
    }
  }

  /**
   * PUT /api/admin/subscriptions/tiers/:id
   * Update subscription tier configuration
   * Body: { name?, description?, monthlyPrice?, annualPrice?, features?, isActive? }
   */
  async updateTier(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const {
        tierName,
        description,
        price,
        features,
        isActive,
      } = req.body;

      // Build update data
      const updateData: any = {};
      if (tierName !== undefined) updateData.tierName = tierName;
      if (description !== undefined) updateData.description = description;
      if (price !== undefined) updateData.price = price;
      if (features !== undefined) updateData.features = features;
      if (isActive !== undefined) updateData.isActive = isActive;

      const updatedTier = await prisma.subscriptionTier.update({
        where: { id },
        data: updateData,
      });

      // Log admin action
      console.log(`[ADMIN] Tier ${id} updated by user ${req.user?.id}`, updateData);

      res.status(200).json({
        success: true,
        data: updatedTier,
        message: 'Subscription tier updated successfully',
      });
    } catch (error: any) {
      console.error('Admin update tier error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to update subscription tier',
      });
    }
  }

  /**
   * PUT /api/admin/subscriptions/tiers/:id/pricing
   * Update only pricing for a tier
   * Body: { price }
   */
  async updatePricing(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { price } = req.body;

      if (price === undefined) {
        res.status(400).json({
          success: false,
          error: 'Price must be provided',
        });
        return;
      }

      const updatedTier = await prisma.subscriptionTier.update({
        where: { id },
        data: { price },
      });

      console.log(`[ADMIN] Tier ${id} pricing updated by user ${req.user?.id}`, { price });

      res.status(200).json({
        success: true,
        data: updatedTier,
        message: 'Pricing updated successfully',
      });
    } catch (error: any) {
      console.error('Admin update pricing error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to update pricing',
      });
    }
  }

  /**
   * PUT /api/admin/subscriptions/tiers/:id/features
   * Update only features for a tier
   * Body: TierFeatures object
   */
  async updateFeatures(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const features = req.body;

      if (!features || typeof features !== 'object') {
        res.status(400).json({
          success: false,
          error: 'Valid features object required',
        });
        return;
      }

      const updatedTier = await prisma.subscriptionTier.update({
        where: { id },
        data: { features },
      });

      console.log(`[ADMIN] Tier ${id} features updated by user ${req.user?.id}`);

      res.status(200).json({
        success: true,
        data: updatedTier,
        message: 'Features updated successfully',
      });
    } catch (error: any) {
      console.error('Admin update features error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to update features',
      });
    }
  }

  /**
   * POST /api/admin/subscriptions/tiers
   * Create new subscription tier (for future expansion)
   * Body: { tierCode, tierName, description, price, features }
   */
  async createTier(req: AuthRequest, res: Response) {
    try {
      const {
        tierCode,
        tierName,
        description,
        price,
        features,
      } = req.body;

      // Validation
      if (!tierCode || !tierName || !price) {
        res.status(400).json({
          success: false,
          error: 'tierCode, tierName, and price are required',
        });
        return;
      }

      const newTier = await prisma.subscriptionTier.create({
        data: {
          tierCode,
          tierName,
          description: description || '',
          price,
          features: features || {},
          isActive: true,
        },
      });

      console.log(`[ADMIN] New tier ${tierCode} created by user ${req.user?.id}`);

      res.status(201).json({
        success: true,
        data: newTier,
        message: 'Subscription tier created successfully',
      });
    } catch (error: any) {
      console.error('Admin create tier error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to create subscription tier',
      });
    }
  }

  /**
   * DELETE /api/admin/subscriptions/tiers/:id
   * Deactivate a tier (soft delete - don't actually delete to preserve history)
   */
  async deactivateTier(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      // Check if tier has active subscriptions
      const activeSubscriptions = await prisma.userSubscription.count({
        where: {
          tierId: id,
          status: 'ACTIVE',
        },
      });

      if (activeSubscriptions > 0) {
        res.status(400).json({
          success: false,
          error: `Cannot deactivate tier with ${activeSubscriptions} active subscriptions`,
          activeSubscriptions,
        });
        return;
      }

      const deactivatedTier = await prisma.subscriptionTier.update({
        where: { id },
        data: { isActive: false },
      });

      console.log(`[ADMIN] Tier ${id} deactivated by user ${req.user?.id}`);

      res.status(200).json({
        success: true,
        data: deactivatedTier,
        message: 'Tier deactivated successfully',
      });
    } catch (error: any) {
      console.error('Admin deactivate tier error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to deactivate tier',
      });
    }
  }

  /**
   * GET /api/admin/subscriptions/stats
   * Get subscription statistics across all tiers
   */
  async getStats(req: AuthRequest, res: Response) {
    try {
      // Count subscriptions by tier
      const subscriptionsByTier = await prisma.userSubscription.groupBy({
        by: ['tierId'],
        _count: true,
        where: { status: 'ACTIVE' },
      });

      // Get tier details
      const tiers = await prisma.subscriptionTier.findMany();
      const tierMap = new Map(tiers.map(t => [t.id, t]));

      // Calculate revenue
      const revenue = await prisma.userSubscription.findMany({
        where: { status: 'ACTIVE' },
        include: { tiers: true },
      });

      const totalRevenue = revenue.reduce((sum, sub) => {
        return sum + (sub.tiers.price || 0);
      }, 0);

      const stats = {
        totalActiveSubscriptions: revenue.length,
        subscriptionsByTier: subscriptionsByTier.map(item => ({
          tier: tierMap.get(item.tierId),
          count: item._count,
        })),
        revenue: {
          totalRecurring: totalRevenue,
        },
        tiers: {
          total: tiers.length,
          active: tiers.filter(t => t.isActive).length,
        },
      };

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error('Admin get stats error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch subscription statistics',
      });
    }
  }

  /**
   * GET /api/admin/subscriptions/users/:userId
   * Get detailed subscription info for a specific user
   */
  async getUserSubscription(req: AuthRequest, res: Response) {
    try {
      const { userId } = req.params;

      const subscriptions = await prisma.userSubscription.findMany({
        where: { userId },
        include: {
          tiers: true,
          users: {
            select: {
              id: true,
              email: true,
              fullName: true,
              trustScore: true,
              trustLevel: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      res.status(200).json({
        success: true,
        data: subscriptions,
      });
    } catch (error) {
      console.error('Admin get user subscription error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch user subscription',
      });
    }
  }
}

export default new AdminSubscriptionController();
