import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { AppError } from './error';
import logger from '../utils/logger';
import { configService } from '../modules/platform/config.service';

/**
 * Trust Level Thresholds
 * Based on trust score percentage (0-100)
 */
export const TRUST_LEVELS = {
  READ_ONLY: { min: 0, max: 10, name: 'starter', label: 'Starter' },
  ATTEND_EVENTS: { min: 11, max: 25, name: 'newcomer', label: 'Newcomer' },
  HOST_JOIN: { min: 26, max: 50, name: 'growing', label: 'Growing' },
  ORGANIZE_SERVICES: { min: 51, max: 75, name: 'established', label: 'Established' },
  FUNDRAISE_ADMIN: { min: 76, max: 90, name: 'trusted', label: 'Trusted' },
  PLATFORM_LEADER: { min: 91, max: 100, name: 'leader', label: 'Leader' },
} as const;

/**
 * Feature Requirements
 * Maps features to minimum required trust score
 */
export const FEATURE_REQUIREMENTS = {
  // Read-only features (0-10%)
  VIEW_PROFILES: 0,
  VIEW_EVENTS: 0,
  VIEW_COMMUNITIES: 0,
  VIEW_MARKETPLACE: 0,

  // Basic participation (11-25%)
  ATTEND_EVENTS: 11,
  MESSAGE_CONNECTIONS: 11,
  REQUEST_CONNECTIONS: 11,
  ADD_TO_CART: 11,

  // Active participation (26-50%)
  CREATE_EVENTS: 26,
  JOIN_COMMUNITIES: 26,
  HOST_TRAVELERS: 26,
  CREATE_LISTINGS: 26,
  PURCHASE_ITEMS: 26,

  // Leadership & Services (51-75%)
  PUBLISH_EVENTS: 51,
  CREATE_SERVICES: 51,
  ORGANIZE_ACTIVITIES: 51,
  BECOME_MODERATOR: 51,

  // Advanced features (76-90%)
  CREATE_COMMUNITIES: 76,
  CREATE_FUNDRAISERS: 76,
  BECOME_ADMIN: 76,
  MENTOR_USERS: 76,

  // Platform leadership (91-100%)
  UNLIMITED_VOUCHES: 91,
  PLATFORM_GOVERNANCE: 91,
  VERIFY_OTHERS: 91,
} as const;

/**
 * Get trust level information from score (uses dynamic config)
 */
export async function getTrustLevelInfo(score: number): Promise<{
  level: string;
  label: string;
  min: number;
  max: number;
  nextLevel?: { name: string; label: string; requiredScore: number };
}> {
  try {
    const trustLevels = await configService.getTrustLevels();
    
    // Find current level
    let currentLevel = trustLevels.levels[0];
    for (const level of trustLevels.levels) {
      if (score >= level.minScore && score <= level.maxScore) {
        currentLevel = level;
        break;
      }
    }

    // Find next level
    let nextLevel: { name: string; label: string; requiredScore: number } | undefined;
    for (const level of trustLevels.levels) {
      if (level.minScore > currentLevel.maxScore) {
        nextLevel = {
          name: level.name,
          label: level.name,
          requiredScore: level.minScore,
        };
        break;
      }
    }

    return {
      level: currentLevel.name.toLowerCase(),
      label: currentLevel.name,
      min: currentLevel.minScore,
      max: currentLevel.maxScore,
      nextLevel,
    };
  } catch (error) {
    logger.error('Error getting trust level info:', error);
    // Fallback to basic info
    return {
      level: 'unknown',
      label: 'Unknown',
      min: 0,
      max: 100,
    };
  }
}

/**
 * Get suggestions for improving trust score
 */
export function getTrustScoreSuggestions(score: number, targetScore: number): string[] {
  const suggestions: string[] = [];
  const pointsNeeded = targetScore - score;

  if (pointsNeeded <= 0) {
    return ['You meet the requirements!'];
  }

  if (score < 26) {
    suggestions.push('Request vouches from trusted connections you\'ve met in person');
    suggestions.push('Attend community events and build your reputation');
    suggestions.push('Complete your profile to show authenticity');
  }

  if (score < 51) {
    suggestions.push('Host or organize events to demonstrate leadership');
    suggestions.push('Receive positive trust moments from connections');
    suggestions.push('Join and actively participate in communities');
  }

  if (score < 76) {
    suggestions.push('Create valuable services for the community');
    suggestions.push('Maintain consistent positive interactions');
    suggestions.push('Help new members and give trust moments');
  }

  suggestions.push(`You need ${pointsNeeded.toFixed(1)} more trust points to unlock this feature`);

  return suggestions;
}

/**
 * Middleware to require minimum trust level
 * 
 * @param minScore - Minimum trust score required (0-100)
 * @param featureName - Optional feature name for better error messages
 * 
 * @example
 * router.post('/events', authenticate, requireTrustLevel(26, 'create events'), createEvent);
 */
export const requireTrustLevel = (
  minScore: number,
  featureName?: string
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Get authenticated user ID
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('Authentication required', 401);
      }

      // Fetch user's current trust score
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          trustScore: true,
          trustLevel: true,
          fullName: true,
        },
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Check if user meets minimum trust score
      if (user.trustScore < minScore) {
        const currentLevelInfo = await getTrustLevelInfo(user.trustScore);
        const requiredLevelInfo = await getTrustLevelInfo(minScore);
        const suggestions = getTrustScoreSuggestions(user.trustScore, minScore);

        logger.warn(`Trust level insufficient: User ${userId} (${user.trustScore}) attempted to access feature requiring ${minScore}`);

        res.status(403).json({
          success: false,
          error: 'Insufficient trust level',
          message: featureName
            ? `You need a higher trust score to ${featureName}`
            : 'You need a higher trust score to access this feature',
          requirements: {
            feature: featureName || 'this feature',
            minimumScore: minScore,
            minimumLevel: requiredLevelInfo.label,
          },
          current: {
            score: Math.round(user.trustScore * 10) / 10,
            level: currentLevelInfo.label,
            levelName: user.trustLevel,
          },
          progress: {
            pointsNeeded: Math.round((minScore - user.trustScore) * 10) / 10,
            percentage: Math.round((user.trustScore / minScore) * 100),
          },
          suggestions,
          helpUrl: '/help/trust-score',
        });
        return;
      }

      // User has sufficient trust level, allow access
      logger.debug(`Trust level check passed: User ${userId} (${user.trustScore}) accessing feature requiring ${minScore}`);
      next();
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message,
        });
        return;
      }

      logger.error('Trust level middleware error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to verify trust level',
      });
    }
  };
};

/**
 * Middleware to check feature access
 * Uses dynamic feature requirements from database
 * 
 * @param featureKey - Feature key to check
 * 
 * @example
 * router.post('/events', authenticate, requireFeature('createEvent'), createEvent);
 */
export const requireFeature = (
  featureKey: string
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const featureGating = await configService.getFeatureGating();
      const feature = (featureGating.features as any)[featureKey];
      
      if (!feature) {
        logger.warn(`Unknown feature key: ${featureKey}`);
        res.status(500).json({
          success: false,
          error: 'Invalid feature configuration',
        });
        return;
      }

      const minScore = feature.requiredScore;
      const featureName = feature.feature;

      // Use the main requireTrustLevel logic
      const middleware = requireTrustLevel(minScore, featureName);
      await middleware(req, res, next);
    } catch (error) {
      logger.error('Feature check error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to check feature access',
      });
    }
  };
};

/**
 * Check if user has sufficient trust level (for use in services)
 * 
 * @param userId - User ID to check
 * @param minScore - Minimum required trust score
 * @returns Object with hasAccess boolean and user info
 */
export async function checkTrustLevel(
  userId: string,
  minScore: number
): Promise<{
  hasAccess: boolean;
  trustScore: number;
  trustLevel: string;
  message?: string;
}> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        trustScore: true,
        trustLevel: true,
      },
    });

    if (!user) {
      return {
        hasAccess: false,
        trustScore: 0,
        trustLevel: 'unknown',
        message: 'User not found',
      };
    }

    const hasAccess = user.trustScore >= minScore;

    return {
      hasAccess,
      trustScore: user.trustScore,
      trustLevel: user.trustLevel,
      message: hasAccess
        ? undefined
        : `Requires trust score of ${minScore}% (current: ${user.trustScore.toFixed(1)}%)`,
    };
  } catch (error) {
    logger.error('Error checking trust level:', error);
    return {
      hasAccess: false,
      trustScore: 0,
      trustLevel: 'unknown',
      message: 'Error checking trust level',
    };
  }
}
