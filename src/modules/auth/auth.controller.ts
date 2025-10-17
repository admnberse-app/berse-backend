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
import { ActivityLoggerService, ActivityType, SecuritySeverity } from '../../services/activityLogger.service';
import { NotificationService } from '../../services/notification.service';

/**
 * Generate a 7-character alphanumeric referral code
 * Format: 3 letters + 4 numbers (e.g., ABC1234)
 */
function generateReferralCode(): string {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  
  let code = '';
  // Generate 3 random letters
  for (let i = 0; i < 3; i++) {
    code += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  // Generate 4 random numbers
  for (let i = 0; i < 4; i++) {
    code += numbers.charAt(Math.floor(Math.random() * numbers.length));
  }
  
  return code;
}

/**
 * Generate a unique username from full name
 * Format: firstname_lastname_randomnumber (e.g., john_doe_1234)
 */
async function generateUsername(fullName: string): Promise<string> {
  // Clean and format the full name
  const nameParts = fullName
    .toLowerCase()
    .trim()
    .replace(/[^a-z\s]/g, '') // Remove non-alphabetic characters
    .split(/\s+/)
    .filter(part => part.length > 0);
  
  // Create base username from first and last name
  let baseUsername = nameParts.join('_');
  
  // If username is too long, truncate it
  if (baseUsername.length > 20) {
    baseUsername = baseUsername.substring(0, 20);
  }
  
  // Try to find a unique username
  let username = baseUsername;
  let attempts = 0;
  const maxAttempts = 10;
  
  while (attempts < maxAttempts) {
    // Check if username is available
    const existingUser = await prisma.user.findFirst({
      where: { username },
    });
    
    if (!existingUser) {
      return username;
    }
    
    // Add random number suffix if username is taken
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    username = `${baseUsername}_${randomNum}`;
    attempts++;
  }
  
  // Fallback: add timestamp if still not unique
  return `${baseUsername}_${Date.now().toString().slice(-6)}`;
}

export class AuthController {
  /**
   * Register a new user
   * @route POST /v2/auth/register
   */
  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { 
        email, phone, password, fullName, username: providedUsername, 
        nationality, countryOfResidence, city, gender, 
        dateOfBirth, referralCode, deviceInfo, locationInfo
      }: RegisterRequest = req.body;

      // Auto-generate username if not provided
      const username = providedUsername || await generateUsername(fullName);

      // Check if user already exists
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email },
            { phone: phone || undefined },
            { username },
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
      const userId = crypto.randomUUID();
      const user = await prisma.user.create({
        data: {
          id: userId,
          email,
          phone,
          password: hashedPassword,
          fullName,
          username,
          referredById: referredBy?.id,
          updatedAt: new Date(),
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
              referralCode: generateReferralCode(),
              referralSource: referralCode ? 'referral' : 'direct',
              ipAddress: req.ip || req.socket.remoteAddress || 'unknown',
              userAgent: req.get('user-agent') || 'unknown',
              utmSource: (req.query.utm_source as string) || null,
              utmMedium: (req.query.utm_medium as string) || null,
              utmCampaign: (req.query.utm_campaign as string) || null,
              tags: [],
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

      // Get request metadata
      const requestMeta = ActivityLoggerService.getRequestMetadata(req);

      // Merge device info from body with auto-detected info
      const mergedDeviceInfo = {
        ...requestMeta.deviceInfo,
        ...(deviceInfo && {
          deviceType: deviceInfo.deviceType,
          osVersion: deviceInfo.osVersion,
          appVersion: deviceInfo.appVersion,
        }),
      };

      // Log registration activity
      await ActivityLoggerService.logActivity({
        userId: user.id,
        activityType: ActivityType.AUTH_REGISTER,
        entityType: 'user',
        entityId: user.id,
      });

      // Create session with location data if provided
      await ActivityLoggerService.createSession({
        userId: user.id,
        ipAddress: requestMeta.ipAddress,
        userAgent: requestMeta.userAgent,
        deviceInfo: mergedDeviceInfo,
        locationData: locationInfo || null,
      });

      // Register device - prefer body deviceInfo over headers
      const deviceId = deviceInfo?.deviceId || req.get('x-device-id');
      const deviceName = deviceInfo?.deviceName || req.get('x-device-name');
      
      if (deviceId) {
        // Include push token in device info
        const deviceInfoWithToken = {
          ...mergedDeviceInfo,
          ...(deviceInfo?.pushToken && { pushToken: deviceInfo.pushToken }),
        };
        
        await ActivityLoggerService.registerDevice(
          user.id,
          deviceId,
          deviceName || null,
          deviceInfoWithToken
        );
      }

      // Send verification email if email verification is enabled
      const emailVerificationEnabled = process.env.ENABLE_EMAIL_VERIFICATION === 'true';
      if (emailVerificationEnabled) {
        try {
          // Generate verification token
          const verificationToken = crypto.randomBytes(32).toString('hex');
          const verificationTokenHash = crypto
            .createHash('sha256')
            .update(verificationToken)
            .digest('hex');

          // Store verification token (expires in 24 hours)
          await prisma.emailVerificationToken.create({
            data: {
              id: crypto.randomUUID(),
              userId: user.id,
              email: user.email,
              token: verificationTokenHash,
              expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
            },
          });

          // Send verification email
          const verificationUrl = `${process.env.APP_URL}/verify-email?token=${verificationToken}`;
          
          await emailQueue.add(
            user.email,
            EmailTemplate.VERIFICATION,
            {
              userName: user.fullName,
              verificationUrl,
              expiresIn: '24 hours',
            }
          );

          // Create in-app notification to verify email
          await NotificationService.notifyEmailVerificationRequired(user.id, user.fullName);

          logger.info('Verification email sent to new user', { 
            userId: user.id, 
            email: user.email 
          });
        } catch (error) {
          logger.error('Failed to send verification email after registration', { 
            userId: user.id,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
          // Don't fail registration if email sending fails
        }
      } else {
        // If email verification is disabled, send welcome notification immediately
        await NotificationService.notifyRegistrationSuccess(user.id, user.fullName);
      }

      // Log successful registration
      logger.info('User registered successfully', {
        userId: user.id,
        email: user.email,
        referredBy: referredBy?.id,
      });

      const responseMessage = emailVerificationEnabled 
        ? 'User registered successfully. Please check your email to verify your account.' 
        : 'User registered successfully';

      sendSuccess(res, { 
        user, 
        token: tokenPair.accessToken,
        refreshToken: tokenPair.refreshToken,
        requiresEmailVerification: emailVerificationEnabled
      }, responseMessage, 201);
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
      const { email, password, deviceInfo, locationInfo }: LoginRequest = req.body;

      const requestMeta = ActivityLoggerService.getRequestMetadata(req);
      
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          security: true,
        },
      });

      if (!user) {
        // Log failed login attempt
        await ActivityLoggerService.logLoginAttempt({
          identifier: email,
          success: false,
          failureReason: 'User not found',
          ipAddress: requestMeta.ipAddress,
          userAgent: requestMeta.userAgent,
        });
        
        logger.warn('Login attempt with non-existent email', { email });
        throw new AppError('Invalid credentials', 401);
      }

      const isValidPassword = await comparePassword(password, user.password);
      if (!isValidPassword) {
        // Log failed login attempt
        await ActivityLoggerService.logLoginAttempt({
          userId: user.id,
          identifier: email,
          success: false,
          failureReason: 'Invalid password',
          ipAddress: requestMeta.ipAddress,
          userAgent: requestMeta.userAgent,
        });
        
        logger.warn('Login attempt with invalid password', { 
          userId: user.id, 
          email 
        });
        throw new AppError('Invalid credentials', 401);
      }

      // Check if email verification is enabled and required
      const emailVerificationEnabled = process.env.ENABLE_EMAIL_VERIFICATION === 'true';
      if (emailVerificationEnabled && !user.security?.emailVerifiedAt) {
        // Log failed login attempt due to unverified email
        await ActivityLoggerService.logLoginAttempt({
          userId: user.id,
          identifier: email,
          success: false,
          failureReason: 'Email not verified',
          ipAddress: requestMeta.ipAddress,
          userAgent: requestMeta.userAgent,
        });
        
        logger.warn('Login attempt with unverified email', { 
          userId: user.id, 
          email 
        });
        throw new AppError('Please verify your email address before logging in. Check your inbox for the verification email.', 403);
      }

      // Log successful login attempt
      await ActivityLoggerService.logLoginAttempt({
        userId: user.id,
        identifier: email,
        success: true,
        ipAddress: requestMeta.ipAddress,
        userAgent: requestMeta.userAgent,
      });

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

      // Merge device info from body with auto-detected info
      const mergedDeviceInfo = {
        ...requestMeta.deviceInfo,
        ...(deviceInfo && {
          deviceType: deviceInfo.deviceType,
          osVersion: deviceInfo.osVersion,
          appVersion: deviceInfo.appVersion,
        }),
      };

      // Log login activity
      await ActivityLoggerService.logActivity({
        userId: user.id,
        activityType: ActivityType.AUTH_LOGIN,
        entityType: 'user',
        entityId: user.id,
      });

      // Create session with location data if provided
      await ActivityLoggerService.createSession({
        userId: user.id,
        ipAddress: requestMeta.ipAddress,
        userAgent: requestMeta.userAgent,
        deviceInfo: mergedDeviceInfo,
        locationData: locationInfo || null,
      });

      // Update last login
      await ActivityLoggerService.updateLastLogin(
        user.id,
        requestMeta.ipAddress
      );

      // Register device - prefer body deviceInfo over headers
      const deviceId = deviceInfo?.deviceId || req.get('x-device-id');
      const deviceName = deviceInfo?.deviceName || req.get('x-device-name');
      
      if (deviceId) {
        // Include push token in device info
        const deviceInfoWithToken = {
          ...mergedDeviceInfo,
          ...(deviceInfo?.pushToken && { pushToken: deviceInfo.pushToken }),
        };
        
        await ActivityLoggerService.registerDevice(
          user.id,
          deviceId,
          deviceName || null,
          deviceInfoWithToken
        );
        
        // Update last seen time
        await prisma.deviceRegistration.updateMany({
          where: {
            userId: user.id,
            deviceFingerprint: deviceId,
          },
          data: {
            lastSeenAt: new Date(),
            deviceInfo: deviceInfoWithToken,
          },
        });
      }

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

      // Log logout activity
      if (userId) {
        await ActivityLoggerService.logActivity({
          userId,
          activityType: ActivityType.AUTH_LOGOUT,
          entityType: 'user',
          entityId: userId,
        });
        
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

      // Terminate all sessions
      await ActivityLoggerService.terminateAllUserSessions(userId);

      // Log logout all activity
      await ActivityLoggerService.logActivity({
        userId,
        activityType: ActivityType.AUTH_LOGOUT_ALL,
        entityType: 'user',
        entityId: userId,
      });

      // Log security event
      await ActivityLoggerService.logSecurityEvent({
        userId,
        eventType: 'LOGOUT_ALL_DEVICES',
        severity: SecuritySeverity.MEDIUM,
        description: 'User logged out from all devices',
        ...ActivityLoggerService.getRequestMetadata(req),
      });

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

      // Terminate all sessions
      await ActivityLoggerService.terminateAllUserSessions(userId);

      // Log password change activity
      await ActivityLoggerService.logActivity({
        userId,
        activityType: ActivityType.AUTH_PASSWORD_CHANGE,
        entityType: 'user',
        entityId: userId,
      });

      // Log security event
      await ActivityLoggerService.logSecurityEvent({
        userId,
        eventType: 'PASSWORD_CHANGED',
        severity: SecuritySeverity.MEDIUM,
        description: 'User changed their password',
        ...ActivityLoggerService.getRequestMetadata(req),
      });

      // Send password changed confirmation email
      try {
        const requestMeta = ActivityLoggerService.getRequestMetadata(req);
        await emailQueue.add(
          user.email,
          EmailTemplate.PASSWORD_CHANGED,
          {
            userName: user.fullName,
            changeDate: new Date(),
            ipAddress: requestMeta.ipAddress,
          }
        );
        
        // Send in-app notification
        await NotificationService.notifyPasswordChanged(user.id, user.fullName);
        
        logger.info('Password changed confirmation email sent', { userId });
      } catch (error) {
        logger.error('Failed to send password changed email', { 
          userId,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        // Don't fail the password change if email fails
      }

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
          id: crypto.randomUUID(),
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

      // Log password reset request activity
      await ActivityLoggerService.logActivity({
        userId: user.id,
        activityType: ActivityType.AUTH_PASSWORD_RESET_REQUEST,
        entityType: 'user',
        entityId: user.id,
      });

      // Log security event
      await ActivityLoggerService.logSecurityEvent({
        userId: user.id,
        eventType: 'PASSWORD_RESET_REQUESTED',
        severity: SecuritySeverity.MEDIUM,
        description: 'Password reset requested',
        ...ActivityLoggerService.getRequestMetadata(req),
      });

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
          user: true,
        },
      });

      const user = resetTokenRecord?.user;      if (!user) {
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

      // Terminate all sessions
      await ActivityLoggerService.terminateAllUserSessions(user.id);

      // Log password reset complete activity
      await ActivityLoggerService.logActivity({
        userId: user.id,
        activityType: ActivityType.AUTH_PASSWORD_RESET_COMPLETE,
        entityType: 'user',
        entityId: user.id,
      });

      // Log security event
      await ActivityLoggerService.logSecurityEvent({
        userId: user.id,
        eventType: 'PASSWORD_RESET_COMPLETED',
        severity: SecuritySeverity.HIGH,
        description: 'Password was reset using reset token',
        ...ActivityLoggerService.getRequestMetadata(req),
      });

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

  /**
   * Send verification email
   * @route POST /v2/auth/send-verification
   */
  static async sendVerificationEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;

      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          security: true,
        },
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Check if already verified
      if (user.security?.emailVerifiedAt) {
        throw new AppError('Email already verified', 400);
      }

      // Generate verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const verificationTokenHash = crypto
        .createHash('sha256')
        .update(verificationToken)
        .digest('hex');

      // Store verification token (expires in 24 hours)
      await prisma.emailVerificationToken.create({
        data: {
          id: crypto.randomUUID(),
          userId: user.id,
          email: user.email,
          token: verificationTokenHash,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      });

      // Send verification email
      const verificationUrl = `${process.env.APP_URL}/verify-email?token=${verificationToken}`;
      
      await emailQueue.add(
        user.email,
        EmailTemplate.VERIFICATION,
        {
          userName: user.fullName,
          verificationUrl,
          expiresIn: '24 hours',
        }
      );

      logger.info('Verification email sent', { 
        userId: user.id, 
        email: user.email 
      });

      sendSuccess(res, null, 'Verification email sent. Please check your inbox.');
    } catch (error) {
      logger.error('Failed to send verification email', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        email: req.body.email
      });
      next(error);
    }
  }

  /**
   * Verify email with token
   * @route POST /v2/auth/verify-email
   */
  static async verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token } = req.body;

      if (!token) {
        throw new AppError('Verification token is required', 400);
      }

      // Hash the token to match stored hash
      const tokenHash = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

      // Find valid verification token
      const verificationToken = await prisma.emailVerificationToken.findFirst({
        where: {
          token: tokenHash,
          expiresAt: {
            gt: new Date(),
          },
          verifiedAt: null,
        },
        include: {
          user: true,
        },
      });

      if (!verificationToken) {
        throw new AppError('Invalid or expired verification token', 400);
      }

      const user = verificationToken.user;

      // Update user security record to mark email as verified
      await prisma.$transaction([
        prisma.userSecurity.upsert({
          where: { userId: user.id },
          update: {
            emailVerifiedAt: new Date(),
          },
          create: {
            userId: user.id,
            emailVerifiedAt: new Date(),
            updatedAt: new Date(),
          } as any,
        }),
        prisma.emailVerificationToken.update({
          where: { id: verificationToken.id },
          data: {
            verifiedAt: new Date(),
          },
        }),
      ]);

      // Send welcome email
      await emailQueue.add(
        user.email,
        EmailTemplate.WELCOME,
        {
          userName: user.fullName,
          exploreUrl: `${process.env.APP_URL}/explore`,
        }
      );

      // Send welcome notification
      await NotificationService.notifyEmailVerified(user.id, user.fullName);

      // Log verification activity
      await ActivityLoggerService.logActivity({
        userId: user.id,
        activityType: ActivityType.AUTH_EMAIL_VERIFY_COMPLETE,
        entityType: 'user',
        entityId: user.id,
      });

      logger.info('Email verified successfully', { 
        userId: user.id, 
        email: user.email 
      });

      sendSuccess(res, null, 'Email verified successfully! You can now log in.');
    } catch (error) {
      logger.error('Email verification failed', { 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      next(error);
    }
  }

  /**
   * Resend verification email
   * @route POST /v2/auth/resend-verification
   */
  static async resendVerificationEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;

      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          security: true,
        },
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Check if already verified
      if (user.security?.emailVerifiedAt) {
        throw new AppError('Email already verified', 400);
      }

      // Delete any existing unused tokens
      await prisma.emailVerificationToken.deleteMany({
        where: {
          userId: user.id,
          verifiedAt: null,
        },
      });

      // Generate new verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const verificationTokenHash = crypto
        .createHash('sha256')
        .update(verificationToken)
        .digest('hex');

      // Store verification token (expires in 24 hours)
      await prisma.emailVerificationToken.create({
        data: {
          id: crypto.randomUUID(),
          userId: user.id,
          email: user.email,
          token: verificationTokenHash,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      });

      // Send verification email
      const verificationUrl = `${process.env.APP_URL}/verify-email?token=${verificationToken}`;
      
      await emailQueue.add(
        user.email,
        EmailTemplate.VERIFICATION,
        {
          userName: user.fullName,
          verificationUrl,
          expiresIn: '24 hours',
        }
      );

      logger.info('Verification email resent', { 
        userId: user.id, 
        email: user.email 
      });

      sendSuccess(res, null, 'Verification email resent. Please check your inbox.');
    } catch (error) {
      logger.error('Failed to resend verification email', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        email: req.body.email
      });
      next(error);
    }
  }
}
