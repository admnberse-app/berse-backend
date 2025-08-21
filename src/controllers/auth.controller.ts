import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { hashPassword, comparePassword } from '../utils/auth';
import { sendSuccess } from '../utils/response';
import { PointsService } from '../services/points.service';
import { MembershipService } from '../services/membership.service';
import { AppError } from '../middleware/error';
import JwtManager from '../utils/jwt';
import logger from '../utils/logger';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, phone, password, fullName, username, nationality, countryOfResidence, city, gender, dateOfBirth, referralCode } = req.body;

      // Check if user already exists
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email },
            { phone: phone || undefined },
            { username: username || undefined },
          ],
        },
      });

      if (existingUser) {
        throw new AppError('User already exists', 400);
      }

      // Check referral code if provided
      let referredBy = null;
      if (referralCode) {
        referredBy = await prisma.user.findUnique({
          where: { referralCode },
        });

        if (!referredBy) {
          throw new AppError('Invalid referral code', 400);
        }
      }

      // Generate unique membership ID with better error handling
      let membershipId: string | null = null;
      try {
        membershipId = await MembershipService.generateUniqueMembershipId();
        logger.info('Generated membership ID', { membershipId });
      } catch (error) {
        logger.error('Failed to generate membership ID', { error });
        // Continue without membership ID but log the issue
      }
      
      // Create user
      const hashedPassword = await hashPassword(password);
      const user = await prisma.user.create({
        data: {
          email,
          phone,
          password: hashedPassword,
          fullName,
          username,
          nationality,
          countryOfResidence,
          city,
          gender,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
          referredById: referredBy?.id,
          membershipId: membershipId || undefined, // Only set if successfully generated
        },
        select: {
          id: true,
          email: true,
          fullName: true,
          username: true,
          nationality: true,
          countryOfResidence: true,
          city: true,
          gender: true,
          dateOfBirth: true,
          role: true,
          referralCode: true,
          membershipId: true,
          totalPoints: true,
        },
      });
      
      // If membership ID generation failed, try to generate and update it after user creation
      if (!membershipId && user.id) {
        try {
          membershipId = await MembershipService.ensureMembershipId(user.id);
          if (membershipId) {
            user.membershipId = membershipId;
            logger.info('Generated membership ID after user creation', { userId: user.id, membershipId });
          }
        } catch (error) {
          logger.error('Failed to generate membership ID after user creation', { userId: user.id, error });
        }
      }

      // Award registration points
      await PointsService.awardPoints(user.id, 'REGISTER');

      // Award referral points if applicable
      if (referredBy) {
        await PointsService.awardPoints(referredBy.id, 'REFERRAL', `Referred ${user.fullName}`);
      }

      // Generate token pair
      const tokenPair = await JwtManager.generateTokenPair(user);

      // Set refresh token in HTTP-only cookie
      res.cookie('refreshToken', tokenPair.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 365 * 24 * 60 * 60 * 1000, // 365 days
      });

      // Log successful registration
      logger.info('User registered successfully', {
        userId: user.id,
        email: user.email,
        referredBy: referredBy?.id,
      });

      sendSuccess(res, { 
        user, 
        token: tokenPair.accessToken,
        refreshToken: tokenPair.refreshToken 
      }, 'User registered successfully', 201);
    } catch (error) {
      logger.error('Registration failed', { 
        error: error instanceof Error ? error.message : 'Unknown error', 
        email: req.body.email 
      });
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;

      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        logger.warn('Login attempt with non-existent email', { email });
        throw new AppError('Invalid credentials', 401);
      }

      const isValidPassword = await comparePassword(password, user.password);
      if (!isValidPassword) {
        logger.warn('Login attempt with invalid password', { 
          userId: user.id, 
          email 
        });
        throw new AppError('Invalid credentials', 401);
      }

      // Generate token pair
      const tokenPair = await JwtManager.generateTokenPair(user);

      // Set refresh token in HTTP-only cookie
      res.cookie('refreshToken', tokenPair.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 365 * 24 * 60 * 60 * 1000, // 365 days
      });

      const { password: _, ...userWithoutPassword } = user;

      // Log successful login
      logger.info('User logged in successfully', {
        userId: user.id,
        email: user.email,
      });

      sendSuccess(res, { 
        user: userWithoutPassword, 
        token: tokenPair.accessToken,
        refreshToken: tokenPair.refreshToken 
      }, 'Login successful');
    } catch (error) {
      logger.error('Login failed', { 
        error: error instanceof Error ? error.message : 'Unknown error', 
        email: req.body.email 
      });
      next(error);
    }
  }

  static async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Try to get refresh token from cookie first, then from body
      const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

      if (!refreshToken) {
        throw new AppError('Refresh token not found', 401);
      }

      // Rotate refresh token
      const tokenPair = await JwtManager.rotateRefreshToken(refreshToken);

      // Set new refresh token in cookie
      res.cookie('refreshToken', tokenPair.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 365 * 24 * 60 * 60 * 1000, // 365 days to match JWT expiry
      });

      sendSuccess(res, { 
        token: tokenPair.accessToken,
        refreshToken: tokenPair.refreshToken // Include in response body too
      }, 'Token refreshed successfully');
    } catch (error) {
      // Clear invalid refresh token
      res.clearCookie('refreshToken');
      logger.warn('Token refresh failed', { error: error instanceof Error ? error.message : 'Unknown error' });
      next(new AppError('Invalid refresh token', 401));
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken = req.cookies.refreshToken;
      const userId = (req as any).user?.id;

      if (refreshToken) {
        // Revoke refresh token
        await JwtManager.revokeRefreshToken(refreshToken);
      }

      // Clear refresh token cookie
      res.clearCookie('refreshToken');

      // Log successful logout
      if (userId) {
        logger.info('User logged out successfully', { userId });
      }

      sendSuccess(res, null, 'Logged out successfully');
    } catch (error) {
      logger.error('Logout failed', { error: error instanceof Error ? error.message : 'Unknown error' });
      next(error);
    }
  }

  static async logoutAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      // Revoke all refresh tokens for the user
      await JwtManager.revokeAllUserTokens(userId);

      // Clear refresh token cookie
      res.clearCookie('refreshToken');

      // Log logout from all devices
      logger.info('User logged out from all devices', { userId });

      sendSuccess(res, null, 'Logged out from all devices successfully');
    } catch (error) {
      logger.error('Logout all failed', { error: error instanceof Error ? error.message : 'Unknown error' });
      next(error);
    }
  }

  static async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          fullName: true,
          profilePicture: true,
          bio: true,
          city: true,
          interests: true,
          role: true,
          isHostCertified: true,
          totalPoints: true,
          membershipId: true,
          referralCode: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      sendSuccess(res, { user }, 'User profile retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = (req as any).user?.id;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Verify current password
      const isValidPassword = await comparePassword(currentPassword, user.password);
      if (!isValidPassword) {
        throw new AppError('Current password is incorrect', 400);
      }

      // Hash new password
      const hashedNewPassword = await hashPassword(newPassword);

      // Update password
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedNewPassword },
      });

      // Revoke all refresh tokens for security
      await JwtManager.revokeAllUserTokens(userId);

      // Clear refresh token cookie
      res.clearCookie('refreshToken');

      // Log password change
      logger.info('User changed password', { userId });

      sendSuccess(res, null, 'Password changed successfully. Please log in again.');
    } catch (error) {
      logger.error('Password change failed', { 
        error: error instanceof Error ? error.message : 'Unknown error', 
        userId: (req as any).user?.id 
      });
      next(error);
    }
  }

}