/**
 * Feature Access Middleware
 * Protects routes with subscription + trust dual-gating
 */

import { Request, Response, NextFunction } from 'express';
import accessControlService from '../modules/subscription/access-control/access-control.service';
import { FeatureCode } from '../modules/subscription/subscription.types';

/**
 * Extended Request with user info
 */
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email?: string;
    role?: string;
    [key: string]: any;
  };
}

/**
 * Middleware to require specific feature access
 * Usage: router.post('/events/create', requireFeature(FeatureCode.CREATE_EVENTS), controller.create)
 */
export const requireFeature = (featureCode: FeatureCode) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // Check if user is authenticated
      if (!req.user || !req.user.id) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
          code: 'AUTH_REQUIRED',
        });
      }

      const userId = req.user.id;

      // Check feature access
      const access = await accessControlService.canAccessFeature(userId, featureCode);

      if (!access.allowed) {
        return res.status(403).json({
          success: false,
          error: access.reason || 'Access denied',
          code: 'FEATURE_ACCESS_DENIED',
          feature: featureCode,
          blockedBy: access.blockedBy,
          upgradeOptions: access.upgradeOptions,
        });
      }

      // Access granted, proceed to next middleware/controller
      next();
    } catch (error) {
      console.error('Feature access middleware error:', error);
      return res.status(500).json({
        success: false,
        error: 'Error checking feature access',
        code: 'FEATURE_CHECK_ERROR',
      });
    }
  };
};

/**
 * Middleware to require minimum subscription tier
 * Usage: router.get('/premium/analytics', requireSubscription('PREMIUM'), controller.getAnalytics)
 */
export const requireSubscription = (minTier: 'FREE' | 'BASIC' | 'PREMIUM') => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
          code: 'AUTH_REQUIRED',
        });
      }

      const userId = req.user.id;

      // Get user's subscription
      const { default: subscriptionService } = await import('../services/subscription.service');
      const subscription = await subscriptionService.getUserSubscription(userId);

      if (!subscription) {
        return res.status(403).json({
          success: false,
          error: 'No active subscription',
          code: 'NO_SUBSCRIPTION',
        });
      }

      // Check tier
      const tiers = ['FREE', 'BASIC', 'PREMIUM'];
      const userTierIndex = tiers.indexOf(subscription.tier);
      const requiredTierIndex = tiers.indexOf(minTier);

      if (userTierIndex < requiredTierIndex) {
        return res.status(403).json({
          success: false,
          error: `Requires ${minTier} subscription or higher`,
          code: 'SUBSCRIPTION_REQUIRED',
          currentTier: subscription.tier,
          requiredTier: minTier,
        });
      }

      next();
    } catch (error) {
      console.error('Subscription middleware error:', error);
      return res.status(500).json({
        success: false,
        error: 'Error checking subscription',
        code: 'SUBSCRIPTION_CHECK_ERROR',
      });
    }
  };
};

/**
 * Middleware to require minimum trust level
 * Usage: router.post('/vouches/give', requireTrustLevel('trusted'), controller.giveVouch)
 */
export const requireTrustLevel = (minLevel: 'starter' | 'trusted' | 'leader') => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
          code: 'AUTH_REQUIRED',
        });
      }

      const userId = req.user.id;

      // Get user's trust level
      const { prisma } = await import('../config/database');
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { trustScore: true, trustLevel: true },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
          code: 'USER_NOT_FOUND',
        });
      }

      // Check trust level
      const levels = ['starter', 'trusted', 'leader'];
      const userLevelIndex = levels.indexOf(user.trustLevel);
      const requiredLevelIndex = levels.indexOf(minLevel);

      if (userLevelIndex < requiredLevelIndex) {
        return res.status(403).json({
          success: false,
          error: `Requires ${minLevel} trust level or higher`,
          code: 'TRUST_LEVEL_REQUIRED',
          currentLevel: user.trustLevel,
          currentScore: user.trustScore,
          requiredLevel: minLevel,
        });
      }

      next();
    } catch (error) {
      console.error('Trust level middleware error:', error);
      return res.status(500).json({
        success: false,
        error: 'Error checking trust level',
        code: 'TRUST_CHECK_ERROR',
      });
    }
  };
};

/**
 * Middleware to check feature usage limits
 * Usage: router.post('/events/create', checkUsageLimit(FeatureCode.CREATE_EVENTS), controller.create)
 */
export const checkUsageLimit = (featureCode: FeatureCode) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
          code: 'AUTH_REQUIRED',
        });
      }

      const userId = req.user.id;

      // Check usage
      const usage = await accessControlService.checkFeatureUsage(userId, featureCode);

      if (!usage.canUse) {
        return res.status(429).json({
          success: false,
          error: 'Feature usage limit exceeded',
          code: 'USAGE_LIMIT_EXCEEDED',
          feature: featureCode,
          used: usage.used,
          limit: usage.limit,
          remaining: usage.remaining,
        });
      }

      // Attach usage info to request for controller
      (req as any).featureUsage = usage;

      next();
    } catch (error) {
      console.error('Usage limit middleware error:', error);
      return res.status(500).json({
        success: false,
        error: 'Error checking usage limit',
        code: 'USAGE_CHECK_ERROR',
      });
    }
  };
};

/**
 * Middleware to attach user's access summary to request
 * Useful for dashboard/profile endpoints
 * Usage: router.get('/me/access', attachAccessSummary, controller.getAccessSummary)
 */
export const attachAccessSummary = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'AUTH_REQUIRED',
      });
    }

    const userId = req.user.id;
    const summary = await accessControlService.getUserAccessSummary(userId);

    // Attach to request
    (req as any).accessSummary = summary;

    next();
  } catch (error) {
    console.error('Attach access summary error:', error);
    // Don't fail the request, just log the error
    next();
  }
};

/**
 * Combine multiple feature requirements (OR logic)
 * Usage: router.post('/action', requireAnyFeature([FeatureCode.FEATURE_A, FeatureCode.FEATURE_B]), controller.action)
 */
export const requireAnyFeature = (featureCodes: FeatureCode[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
          code: 'AUTH_REQUIRED',
        });
      }

      const userId = req.user.id;

      // Check all features
      const checks = await Promise.all(
        featureCodes.map(fc => accessControlService.canAccessFeature(userId, fc))
      );

      // If any feature is accessible, allow
      if (checks.some(check => check.allowed)) {
        next();
        return;
      }

      // All features denied
      return res.status(403).json({
        success: false,
        error: 'Access denied - requires one of the listed features',
        code: 'ANY_FEATURE_REQUIRED',
        features: featureCodes,
      });
    } catch (error) {
      console.error('Any feature middleware error:', error);
      return res.status(500).json({
        success: false,
        error: 'Error checking feature access',
        code: 'FEATURE_CHECK_ERROR',
      });
    }
  };
};

/**
 * Combine multiple feature requirements (AND logic)
 * Usage: router.post('/action', requireAllFeatures([FeatureCode.FEATURE_A, FeatureCode.FEATURE_B]), controller.action)
 */
export const requireAllFeatures = (featureCodes: FeatureCode[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
          code: 'AUTH_REQUIRED',
        });
      }

      const userId = req.user.id;

      // Check all features
      const checks = await Promise.all(
        featureCodes.map(fc => accessControlService.canAccessFeature(userId, fc))
      );

      // All must be allowed
      const deniedFeatures = featureCodes.filter((_, i) => !checks[i].allowed);

      if (deniedFeatures.length > 0) {
        return res.status(403).json({
          success: false,
          error: 'Access denied - missing required features',
          code: 'ALL_FEATURES_REQUIRED',
          deniedFeatures,
          details: checks.filter(c => !c.allowed),
        });
      }

      next();
    } catch (error) {
      console.error('All features middleware error:', error);
      return res.status(500).json({
        success: false,
        error: 'Error checking feature access',
        code: 'FEATURE_CHECK_ERROR',
      });
    }
  };
};
