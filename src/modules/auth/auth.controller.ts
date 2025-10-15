import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/database';
import { hashPassword, comparePassword } from '../../utils/auth';
import { sendSuccess } from '../../utils/response';
import { PointsService } from '../../services/points.service';
import { MembershipService } from '../../services/membership.service';
import { AppError } from '../../middleware/error';
import JwtManager from '../../utils/jwt';
import logger from '../../utils/logger';
import crypto from 'crypto';
import { emailQueue } from '../../services/emailQueue.service';
import { EmailTemplate } from '../../types/email.types';
import { RegisterRequest, LoginRequest, ChangePasswordRequest, ForgotPasswordRequest, ResetPasswordRequest } from './auth.types';

export class AuthController {
  /**
   * Register a new user
   * @route POST /v2/auth/register
   */
  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { 
        email, phone, password, fullName, username, 
        nationality, countryOfResidence, city, gender, 
        dateOfBirth, referralCode 
      }: RegisterRequest = req.body;

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
        if (existingUser.email === email) {
          throw new AppError('Email already registered', 400);
        }
        if (existingUser.phone === phone) {
          throw new AppError('Phone number already registered', 400);
        }
        if (existingUser.username === username) {
          throw new AppError('Username already taken', 400);
        }
        throw new AppError('User already exists', 400);
      }

      // Check referral code if provided
      let referredBy = null;
      if (referralCode) {
        referredBy = await prisma.user.findFirst({
          where: { 
            metadata: {
              referralCode
            }
          },
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
      
      // Create user with related profile data
      const hashedPassword = await hashPassword(password);
      const user = await prisma.user.create({
        data: {
          email,
          phone,
          password: hashedPassword,
          fullName,
          username,
          referredById: referredBy?.id,
          profile: {
            create: {
              dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
              gender,
              updatedAt: new Date(),
            } as any,
          },
          location: {
            create: {
              nationality,
              countryOfResidence,
              currentCity: city,
              updatedAt: new Date(),
            } as any,
          },
          metadata: {
            create: {
              membershipId: membershipId || undefined,
              referralCode: crypto.randomBytes(4).toString('hex').toUpperCase(),
              updatedAt: new Date(),
            } as any,
          },
        } as any,
        select: {
          id: true,
          email: true,
          fullName: true,
          username: true,
          role: true,
          totalPoints: true,
          profile: {
            select: {
              dateOfBirth: true,
              gender: true,
              profilePicture: true,
            },
          },
          location: {
            select: {
              nationality: true,
              countryOfResidence: true,
              currentCity: true,
            },
          },
          metadata: {
            select: {
              referralCode: true,
              membershipId: true,
            },
          },
        },
      });
      
      // If membership ID generation failed, try to generate and update it after user creation
      if (!membershipId && user.id) {
        try {
          membershipId = await MembershipService.ensureMembershipId(user.id);
          if (membershipId) {
            await prisma.userMetadata.update({
              where: { userId: user.id },
              data: { membershipId },
            });
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

  /**
   * Login user
   * @route POST /v2/auth/login
   */
  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password }: LoginRequest = req.body;

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

  /**
   * Refresh access token
   * @route POST /v2/auth/refresh-token
   */
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
        maxAge: 365 * 24 * 60 * 60 * 1000, // 365 days
      });

      sendSuccess(res, { 
        token: tokenPair.accessToken,
        refreshToken: tokenPair.refreshToken
      }, 'Token refreshed successfully');
    } catch (error) {
      // Clear invalid refresh token
      res.clearCookie('refreshToken');
      logger.warn('Token refresh failed', { error: error instanceof Error ? error.message : 'Unknown error' });
      next(new AppError('Invalid refresh token', 401));
    }
  }

  /**
   * Logout user (revoke current refresh token)
   * @route POST /v2/auth/logout
   */
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

  /**
   * Logout from all devices (revoke all refresh tokens)
   * @route POST /v2/auth/logout-all
   */
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

  /**
   * Get current user profile
   * @route GET /v2/auth/me
   */
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
          username: true,
          phone: true,
          role: true,
          totalPoints: true,
          createdAt: true,
          updatedAt: true,
          profile: {
            select: {
              profilePicture: true,
              bio: true,
              interests: true,
              dateOfBirth: true,
              gender: true,
            },
          },
          location: {
            select: {
              currentCity: true,
              nationality: true,
              countryOfResidence: true,
            },
          },
          metadata: {
            select: {
              membershipId: true,
              referralCode: true,
            },
          },
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

  /**
   * Change password for authenticated user
   * @route POST /v2/auth/change-password
   */
  static async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { currentPassword, newPassword }: ChangePasswordRequest = req.body;
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
        data: { 
          password: hashedNewPassword,
        },
      });
      
      // Update security record
      await prisma.userSecurity.upsert({
        where: { userId },
        update: {
          lastPasswordChangeAt: new Date(),
        },
        create: {
          userId,
          lastPasswordChangeAt: new Date(),
          updatedAt: new Date(),
        } as any,
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

  /**
   * Request password reset
   * @route POST /v2/auth/forgot-password
   */
  static async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email }: ForgotPasswordRequest = req.body;

      const user = await prisma.user.findUnique({
        where: { email },
      });

      // Always return success to prevent email enumeration
      if (!user) {
        logger.warn('Password reset requested for non-existent email', { email });
        sendSuccess(res, null, 'If the email exists, a password reset link has been sent.');
        return;
      }

      // Generate reset token (32 bytes = 64 hex characters)
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
      
      // Token expires in 1 hour
      const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000);

      // Save hashed token to database
      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          token: resetTokenHash,
          expiresAt: resetTokenExpires,
          ipAddress: req.ip || 'unknown',
        } as any,
      });

      // Generate 6-digit code for backup
      const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

      // Create reset URL
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

      // Queue password reset email
      emailQueue.add(
        user.email,
        EmailTemplate.PASSWORD_RESET,
        {
          userName: user.fullName,
          resetUrl,
          resetCode,
          expiresIn: '1 hour',
        }
      );

      logger.info('Password reset email queued', { 
        userId: user.id, 
        email: user.email,
        expiresAt: resetTokenExpires 
      });

      sendSuccess(res, null, 'If the email exists, a password reset link has been sent.');
    } catch (error) {
      logger.error('Forgot password failed', { 
        error: error instanceof Error ? error.message : 'Unknown error', 
        email: req.body.email 
      });
      next(error);
    }
  }

  /**
   * Reset password using reset token
   * @route POST /v2/auth/reset-password
   */
  static async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token, password }: ResetPasswordRequest = req.body;

      // Hash the token from URL to compare with database
      const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

      // Find valid reset token
      const resetTokenRecord = await prisma.passwordResetToken.findFirst({
        where: {
          token: resetTokenHash,
          expiresAt: {
            gt: new Date(), // Token not expired
          },
          usedAt: null, // Token not used
        },
        include: {
          users: true,
        },
      });

      const user = resetTokenRecord?.users;      if (!user) {
        throw new AppError('Invalid or expired reset token', 400);
      }

      // Hash new password
      const hashedPassword = await hashPassword(password);

      // Update password and mark token as used
      await prisma.$transaction([
        prisma.user.update({
          where: { id: user.id },
          data: {
            password: hashedPassword,
          },
        }),
        prisma.passwordResetToken.update({
          where: { id: resetTokenRecord.id },
          data: {
            usedAt: new Date(),
          },
        }),
        prisma.userSecurity.upsert({
          where: { userId: user.id },
          update: {
            lastPasswordChangeAt: new Date(),
          },
          create: {
            userId: user.id,
            lastPasswordChangeAt: new Date(),
            updatedAt: new Date(),
          } as any,
        }),
      ]);

      // Revoke all refresh tokens for security
      await JwtManager.revokeAllUserTokens(user.id);

      // Log password reset
      logger.info('Password reset successful', { userId: user.id, email: user.email });

      sendSuccess(res, null, 'Password reset successfully. Please log in with your new password.');
    } catch (error) {
      logger.error('Password reset failed', { 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      next(error);
    }
  }
}
