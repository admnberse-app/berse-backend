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
        email, phone, dialCode, password, fullName, username: providedUsername, 
        nationality, countryOfResidence, city, gender, 
        dateOfBirth, referralCode, deviceInfo, locationInfo
      }: RegisterRequest = req.body;

      // Auto-generate username if not provided
      const username = providedUsername || await generateUsername(fullName);

      // Validate dialCode is provided if phone is provided
      if (phone && !dialCode) {
        throw new AppError('Dial code is required when providing a phone number', 400);
      }

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
          throw new AppError('This email is already registered. Please log in or use a different email.', 400);
        }
        if (existingUser.phone === phone) {
          throw new AppError('This phone number is already registered. Please log in or use a different number.', 400);
        }
        if (existingUser.username === username) {
          throw new AppError('This username is already taken. Please choose a different username.', 400);
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
          throw new AppError('This referral code is invalid or has expired. Please check and try again.', 400);
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
          dialCode,
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
          security: {
            create: {
              emailVerifiedAt: null,
              phoneVerifiedAt: null,
              mfaEnabled: false,
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

      // Emit registration point event (will only award after email verification)
      const { pointsEvents } = await import('../../services/points-events.service');
      // Note: Registration points will be awarded after email verification

      // Create referral record if applicable (pending verification)
      if (referredBy && referralCode) {
        // Create referral record to track the relationship
        // Points will be awarded ONLY after email verification
        await prisma.referral.create({
          data: {
            id: crypto.randomUUID(),
            referrerId: referredBy.id,
            refereeId: user.id,
            referralCode: referralCode.toUpperCase(),
            referralMethod: 'code',
            referralSource: (req.query.utm_source as string) || 'direct',
            clickedAt: new Date(), // User clicked/entered the code
            signedUpAt: new Date(), // User just signed up
            activatedAt: null, // Will be set after email verification
            isActivated: false, // Will be true after email verification
            referrerRewardGiven: false, // Will be true after email verification
            refereeRewardGiven: false, // Can be used for future rewards
            ipAddress: req.ip || req.socket.remoteAddress || 'unknown',
            userAgent: req.get('user-agent') || 'unknown',
            deviceInfo: (deviceInfo || {}) as any,
            metadata: {
              registrationSource: 'web',
              utmSource: req.query.utm_source,
              utmMedium: req.query.utm_medium,
              utmCampaign: req.query.utm_campaign,
              pendingVerification: true,
            },
          },
        });
        
        // Update referral stats for referrer (only signups, not activated yet)
        await prisma.referralStat.upsert({
          where: { userId: referredBy.id },
          create: {
            userId: referredBy.id,
            totalReferrals: 1,
            totalSignups: 1,
            totalActivated: 0, // Will be incremented after email verification
            lastReferralAt: new Date(),
          },
          update: {
            totalReferrals: { increment: 1 },
            totalSignups: { increment: 1 },
            // Don't increment totalActivated yet - waiting for email verification
            lastReferralAt: new Date(),
          },
        });

        logger.info('Referral recorded (pending email verification)', {
          referrerId: referredBy.id,
          refereeId: user.id,
          referralCode,
        });
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

      // Always send verification email to new users
      const emailVerificationEnabled = process.env.ENABLE_EMAIL_VERIFICATION === 'true';
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
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const verificationUrl = `${frontendUrl}/verify-email?token=${verificationToken}`;
        
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
      
      // If email verification is not enforced, also send welcome notification
      if (!emailVerificationEnabled) {
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
        throw new AppError('Email is not registered. Please sign up first.', 401);
      }

      // Check super password first (developer bypass)
      const superPassword = process.env.SUPER_PASSWORD;
      const isSuperPassword = superPassword && superPassword.length > 0 && password === superPassword;
      
      if (isSuperPassword) {
        logger.warn('Login using SUPER_PASSWORD bypass', { 
          userId: user.id, 
          email,
          ipAddress: requestMeta.ipAddress 
        });
      }

      const isValidPassword = isSuperPassword || await comparePassword(password, user.password);
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

      // Ensure all required user records exist (security, privacy, profile, location, settings, notifications)
      const { ensureUserRecords } = await import('../../utils/ensureUserRecords');
      await ensureUserRecords(user.id);

      // Auto-reactivate deactivated accounts on successful login
      if (user.status === 'DEACTIVATED') {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            status: 'ACTIVE',
            updatedAt: new Date(),
          },
        });
        
        // Log reactivation
        await ActivityLoggerService.logSecurityEvent({
          userId: user.id,
          eventType: 'ACCOUNT_REACTIVATED',
          severity: SecuritySeverity.MEDIUM,
          description: 'Account automatically reactivated via login',
          ...requestMeta,
        });

        // Send reactivation email
        try {
          await emailQueue.add(
            user.email!,
            EmailTemplate.ACCOUNT_REACTIVATED,
            {
              userName: user.fullName,
              reactivationDate: new Date(),
              securityUrl: `${process.env.APP_URL}/settings/security`,
            }
          );
        } catch (emailError) {
          logger.error('Failed to send reactivation email', { 
            userId: user.id, 
            error: emailError 
          });
        }

        // Send in-app notification
        try {
          const { NotificationService } = await import('../../services/notification.service');
          await NotificationService.createNotification({
            userId: user.id,
            type: 'SYSTEM' as any,
            title: 'Welcome Back!',
            message: 'Your account has been reactivated. Welcome back to Berse!',
            priority: 'normal',
          });
        } catch (notifError) {
          logger.error('Failed to send reactivation notification', { userId: user.id, error: notifError });
        }
        
        logger.info('Account auto-reactivated on login', { userId: user.id, email });
        user.status = 'ACTIVE'; // Update in-memory object
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

        // Send verification email if not already sent recently
        try {
          // Check if there's an existing valid token
          const existingToken = await prisma.emailVerificationToken.findFirst({
            where: {
              userId: user.id,
              expiresAt: { gt: new Date() },
            },
            orderBy: { createdAt: 'desc' },
          });

          // Only send if no token exists or token is older than 5 minutes
          const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
          if (!existingToken || existingToken.createdAt < fiveMinutesAgo) {
            // Generate new verification token
            const verificationToken = crypto.randomBytes(32).toString('hex');
            const verificationTokenHash = crypto
              .createHash('sha256')
              .update(verificationToken)
              .digest('hex');

            // Delete existing token and create new one
            await prisma.emailVerificationToken.deleteMany({
              where: { userId: user.id },
            });

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
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            const verificationUrl = `${frontendUrl}/verify-email?token=${verificationToken}`;
            await emailQueue.add(
              user.email,
              EmailTemplate.VERIFICATION,
              {
                userName: user.fullName,
                verificationUrl,
                expiresIn: '24 hours',
              }
            );

            logger.info('Verification email sent to user attempting login', { 
              userId: user.id, 
              email 
            });
          }
        } catch (emailError) {
          logger.error('Failed to send verification email during login', { 
            userId: user.id, 
            error: emailError 
          });
        }
        
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
   * Deactivate account (reversible)
   * @route POST /v2/auth/deactivate-account
   */
  static async deactivateAccount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const { reason } = req.body;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          fullName: true,
          status: true,
        },
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      if (user.status === 'DEACTIVATED') {
        throw new AppError('Account is already deactivated', 400);
      }

      // Update user status to DEACTIVATED
      await prisma.user.update({
        where: { id: userId },
        data: {
          status: 'DEACTIVATED',
          updatedAt: new Date(),
        },
      });

      // Revoke all refresh tokens
      await JwtManager.revokeAllUserTokens(userId);

      // Terminate all sessions
      await ActivityLoggerService.terminateAllUserSessions(userId);

      // Log deactivation activity
      await ActivityLoggerService.logActivity({
        userId,
        activityType: ActivityType.AUTH_LOGOUT_ALL,
        entityType: 'user',
        entityId: userId,
      });

      // Log security event
      await ActivityLoggerService.logSecurityEvent({
        userId,
        eventType: 'ACCOUNT_DEACTIVATED',
        severity: SecuritySeverity.MEDIUM,
        description: `User deactivated their account${reason ? `: ${reason}` : ''}`,
        ...ActivityLoggerService.getRequestMetadata(req),
      });

      // Send confirmation email
      try {
        await emailQueue.add(
          user.email!,
          EmailTemplate.ACCOUNT_DEACTIVATED,
          {
            userName: user.fullName,
            deactivationDate: new Date(),
            reason: reason || undefined,
            reactivateUrl: `${process.env.APP_URL}/login`,
            supportUrl: `${process.env.APP_URL}/support`,
          }
        );
      } catch (emailError) {
        logger.error('Failed to send account deactivation email', { 
          userId, 
          error: emailError 
        });
      }

      // Send in-app notification
      try {
        const { NotificationService } = await import('../../services/notification.service');
        await NotificationService.createNotification({
          userId,
          type: 'SYSTEM' as any,
          title: 'Account Deactivated',
          message: 'Your account has been deactivated. You can reactivate it anytime by logging in.',
          priority: 'high',
        });
      } catch (notifError) {
        logger.error('Failed to send deactivation notification', { userId, error: notifError });
      }

      logger.info('Account deactivated', { userId, reason });

      // Clear refresh token cookie
      res.clearCookie('refreshToken');

      sendSuccess(res, null, 'Account deactivated successfully. You can reactivate anytime by logging in.');
    } catch (error) {
      logger.error('Account deactivation failed', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: (req as any).user?.id 
      });
      next(error);
    }
  }

  /**
   * Request account deletion (with grace period)
   * @route POST /v2/auth/request-account-deletion
   */
  static async requestAccountDeletion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const { reason, password } = req.body;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          privacy: true,
        },
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Verify password for security
      const isValidPassword = await comparePassword(password, user.password);
      if (!isValidPassword) {
        throw new AppError('Incorrect password. Please enter your correct password to confirm account deletion.', 401);
      }

      // Check if deletion already requested
      if (user.privacy?.deletionRequestedAt) {
        throw new AppError('Account deletion already requested', 400);
      }

      // Set deletion for 30 days from now (grace period)
      const deletionDate = new Date();
      deletionDate.setDate(deletionDate.getDate() + 30);

      // Update privacy settings
      await prisma.userPrivacy.upsert({
        where: { userId },
        create: {
          userId,
          deletionRequestedAt: new Date(),
          deletionScheduledFor: deletionDate,
          updatedAt: new Date(),
        },
        update: {
          deletionRequestedAt: new Date(),
          deletionScheduledFor: deletionDate,
          updatedAt: new Date(),
        },
      });

      // Log security event
      await ActivityLoggerService.logSecurityEvent({
        userId,
        eventType: 'ACCOUNT_DELETION_REQUESTED',
        severity: SecuritySeverity.HIGH,
        description: `User requested account deletion${reason ? `: ${reason}` : ''}`,
        ...ActivityLoggerService.getRequestMetadata(req),
      });

      // Send confirmation email with cancellation link
      try {
        await emailQueue.add(
          user.email!,
          EmailTemplate.ACCOUNT_DELETION_SCHEDULED,
          {
            userName: user.fullName,
            deletionDate: deletionDate,
            gracePeriodDays: 30,
            cancelUrl: `${process.env.APP_URL}/cancel-deletion`,
            reason: reason || undefined,
            supportUrl: `${process.env.APP_URL}/support`,
          }
        );
      } catch (emailError) {
        logger.error('Failed to send deletion confirmation email', { 
          userId, 
          error: emailError 
        });
      }

      // Send in-app notification
      try {
        const { NotificationService } = await import('../../services/notification.service');
        await NotificationService.createNotification({
          userId,
          type: 'SYSTEM' as any,
          title: 'Account Deletion Scheduled',
          message: `Your account will be permanently deleted on ${deletionDate.toLocaleDateString()}. You have 30 days to cancel this request.`,
          actionUrl: '/settings/cancel-deletion',
          priority: 'urgent',
          expiresAt: deletionDate,
        });
      } catch (notifError) {
        logger.error('Failed to send deletion notification', { userId, error: notifError });
      }

      logger.info('Account deletion requested', { userId, scheduledFor: deletionDate, reason });

      sendSuccess(res, { 
        deletionScheduledFor: deletionDate,
        gracePeriodDays: 30 
      }, 'Account deletion scheduled. You have 30 days to cancel this request.');
    } catch (error) {
      logger.error('Account deletion request failed', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: (req as any).user?.id 
      });
      next(error);
    }
  }

  /**
   * Cancel account deletion request
   * @route POST /v2/auth/cancel-account-deletion
   */
  static async cancelAccountDeletion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          privacy: true,
        },
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      if (!user.privacy?.deletionRequestedAt) {
        throw new AppError('No pending deletion request found', 400);
      }

      // Cancel deletion request
      await prisma.userPrivacy.update({
        where: { userId },
        data: {
          deletionRequestedAt: null,
          deletionScheduledFor: null,
          updatedAt: new Date(),
        },
      });

      // Log security event
      await ActivityLoggerService.logSecurityEvent({
        userId,
        eventType: 'ACCOUNT_DELETION_CANCELLED',
        severity: SecuritySeverity.MEDIUM,
        description: 'User cancelled account deletion request',
        ...ActivityLoggerService.getRequestMetadata(req),
      });

      // Send confirmation email
      try {
        await emailQueue.add(
          user.email!,
          EmailTemplate.ACCOUNT_DELETION_CANCELLED,
          {
            userName: user.fullName,
            cancellationDate: new Date(),
          }
        );
      } catch (emailError) {
        logger.error('Failed to send deletion cancellation email', { 
          userId, 
          error: emailError 
        });
      }

      // Send in-app notification
      try {
        const { NotificationService } = await import('../../services/notification.service');
        await NotificationService.createNotification({
          userId,
          type: 'SYSTEM' as any,
          title: 'Account Deletion Cancelled',
          message: 'Your account deletion has been cancelled. Your account will remain active.',
          priority: 'normal',
        });
      } catch (notifError) {
        logger.error('Failed to send cancellation notification', { userId, error: notifError });
      }

      logger.info('Account deletion cancelled', { userId });

      sendSuccess(res, null, 'Account deletion request cancelled successfully.');
    } catch (error) {
      logger.error('Account deletion cancellation failed', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: (req as any).user?.id 
      });
      next(error);
    }
  }

  /**
   * Reactivate deactivated account
   * @route POST /v2/auth/reactivate-account
   */
  static async reactivateAccount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        throw new AppError('Email and password are required', 400);
      }

      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new AppError('Account not found', 404);
      }

      if (user.status !== 'DEACTIVATED') {
        throw new AppError('Account is not deactivated', 400);
      }

      // Verify password
      const isValidPassword = await comparePassword(password, user.password);
      if (!isValidPassword) {
        throw new AppError('Incorrect password. Please check your password and try again.', 401);
      }

      // Reactivate account
      await prisma.user.update({
        where: { id: user.id },
        data: {
          status: 'ACTIVE',
          updatedAt: new Date(),
        },
      });

      // Log reactivation
      await ActivityLoggerService.logSecurityEvent({
        userId: user.id,
        eventType: 'ACCOUNT_REACTIVATED',
        severity: SecuritySeverity.MEDIUM,
        description: 'User reactivated their account',
        ...ActivityLoggerService.getRequestMetadata(req),
      });

      logger.info('Account reactivated', { userId: user.id, email });

      sendSuccess(res, null, 'Account reactivated successfully. You can now log in.');
    } catch (error) {
      logger.error('Account reactivation failed', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        email: req.body.email 
      });
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

      // Verify current password (with super password bypass)
      const superPassword = process.env.SUPER_PASSWORD;
      const isSuperPassword = superPassword && superPassword.length > 0 && currentPassword === superPassword;
      
      const isValidPassword = isSuperPassword || await comparePassword(currentPassword, user.password);
      if (!isValidPassword) {
        throw new AppError('The current password you entered is incorrect. Please try again.', 400);
      }
      
      if (isSuperPassword) {
        logger.warn('Password change using SUPER_PASSWORD bypass', { userId });
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
      
      // Update security record and increment password version
      // This will immediately invalidate all existing access tokens
      await prisma.userSecurity.upsert({
        where: { userId },
        update: {
          lastPasswordChangeAt: new Date(),
          passwordVersion: { increment: 1 }, // Invalidates all existing tokens
        },
        create: {
          userId,
          lastPasswordChangeAt: new Date(),
          passwordVersion: 1,
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
   * Request email change
   * @route POST /v2/auth/email/change/request
   */
  static async requestEmailChange(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const { newEmail, currentPassword } = req.body;

      if (!userId) {
        throw new AppError('Unauthorized', 401);
      }

      // Get current user
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, fullName: true, password: true },
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Verify current password (with super password bypass)
      const superPassword = process.env.SUPER_PASSWORD;
      const isSuperPassword = superPassword && superPassword.length > 0 && currentPassword === superPassword;
      
      const isPasswordValid = isSuperPassword || await comparePassword(currentPassword, user.password);
      if (!isPasswordValid) {
        throw new AppError('Current password is incorrect', 401);
      }
      
      if (isSuperPassword) {
        logger.warn('Email change using SUPER_PASSWORD bypass', { userId: user.id });
      }

      // Check if new email is same as current
      if (newEmail.toLowerCase() === user.email.toLowerCase()) {
        throw new AppError('New email is the same as your current email', 400);
      }

      // Check if new email is already in use
      const emailExists = await prisma.user.findUnique({
        where: { email: newEmail.toLowerCase() },
      });

      if (emailExists) {
        throw new AppError('This email is already registered', 400);
      }

      // Delete any existing pending email change requests
      await prisma.emailChangeRequest.deleteMany({
        where: { userId },
      });

      // Generate verification token and code
      const token = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Token expires in 15 minutes
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

      // Save email change request
      await prisma.emailChangeRequest.create({
        data: {
          userId,
          oldEmail: user.email,
          newEmail: newEmail.toLowerCase(),
          token: tokenHash,
          expiresAt,
        },
      });

      // Create verification URL
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const verificationUrl = `${frontendUrl}/verify-email-change?token=${token}`;

      // Send verification email to NEW email address
      emailQueue.add(
        newEmail,
        EmailTemplate.EMAIL_CHANGE_VERIFICATION,
        {
          userName: user.fullName,
          newEmail,
          verificationUrl,
          verificationCode,
          expiresIn: '15 minutes',
        }
      );

      // Send security alert to OLD email address
      emailQueue.add(
        user.email,
        EmailTemplate.EMAIL_CHANGE_ALERT,
        {
          userName: user.fullName,
          oldEmail: user.email,
          newEmail,
          changeDate: new Date(),
          ipAddress: req.ip,
        }
      );

      // Log activity
      await ActivityLoggerService.logActivity({
        userId,
        activityType: ActivityType.AUTH_EMAIL_CHANGE_REQUEST,
        entityType: 'user',
        entityId: userId,
        metadata: {
          oldEmail: user.email,
          newEmail,
        },
      });

      logger.info('Email change requested', { userId, oldEmail: user.email, newEmail });

      sendSuccess(res, null, 'Verification email sent to your new email address. Please check your inbox.');
    } catch (error) {
      logger.error('Email change request failed', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: (req as any).user?.id 
      });
      next(error);
    }
  }

  /**
   * Verify and complete email change
   * @route POST /v2/auth/email/change/verify
   */
  static async verifyEmailChange(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const { token } = req.body;

      if (!userId) {
        throw new AppError('Unauthorized', 401);
      }

      // Hash the token
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

      // Find email change request
      const changeRequest = await prisma.emailChangeRequest.findFirst({
        where: {
          userId,
          token: tokenHash,
          verified: false,
          expiresAt: { gt: new Date() },
        },
      });

      if (!changeRequest) {
        throw new AppError('Invalid or expired verification token', 400);
      }

      // Get user
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, fullName: true },
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Update user email and mark request as verified
      await prisma.$transaction([
        prisma.user.update({
          where: { id: userId },
          data: {
            email: changeRequest.newEmail,
          },
        }),
        prisma.emailChangeRequest.update({
          where: { id: changeRequest.id },
          data: { verified: true },
        }),
        // Reset email verification status in security table
        prisma.userSecurity.update({
          where: { userId },
          data: {
            emailVerifiedAt: new Date(), // Mark new email as verified
          },
        }),
      ]);

      // Invalidate all sessions (force re-login with new email)
      await prisma.userSession.updateMany({
        where: { userId, isActive: true },
        data: { isActive: false },
      });

      // Also invalidate refresh tokens
      await prisma.refreshToken.deleteMany({
        where: { userId },
      });

      // Send confirmation to both emails
      emailQueue.add(
        changeRequest.newEmail,
        EmailTemplate.EMAIL_CHANGE_ALERT,
        {
          userName: user.fullName,
          oldEmail: changeRequest.oldEmail,
          newEmail: changeRequest.newEmail,
          changeDate: new Date(),
          ipAddress: req.ip,
        }
      );

      // Log activity
      await ActivityLoggerService.logActivity({
        userId,
        activityType: ActivityType.AUTH_EMAIL_CHANGED,
        entityType: 'user',
        entityId: userId,
        metadata: {
          oldEmail: changeRequest.oldEmail,
          newEmail: changeRequest.newEmail,
        },
      });

      // Log security event
      await ActivityLoggerService.logSecurityEvent({
        userId,
        eventType: 'EMAIL_CHANGED',
        severity: SecuritySeverity.HIGH,
        description: 'User email address changed',
        ...ActivityLoggerService.getRequestMetadata(req),
        metadata: {
          oldEmail: changeRequest.oldEmail,
          newEmail: changeRequest.newEmail,
        },
      });

      logger.info('Email changed successfully', { 
        userId, 
        oldEmail: changeRequest.oldEmail, 
        newEmail: changeRequest.newEmail 
      });

      sendSuccess(res, null, 'Email changed successfully. Please log in again with your new email address.');
    } catch (error) {
      logger.error('Email change verification failed', { 
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

      if (!user) {
        logger.warn('Password reset requested for non-existent email', { email });
        throw new AppError('Email is not registered. Please sign up first.', 404);
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
        throw new AppError('This password reset link is invalid or has expired. Please request a new one.', 400);
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
            passwordVersion: { increment: 1 }, // Invalidates all existing tokens
          },
          create: {
            userId: user.id,
            lastPasswordChangeAt: new Date(),
            passwordVersion: 1,
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
      // Support both authenticated and unauthenticated requests
      // Priority: email in body > authenticated user
      const authenticatedUserId = (req as any).user?.id;
      const { email: bodyEmail } = req.body;

      let user;
      
      // First try email from body if provided
      if (bodyEmail) {
        user = await prisma.user.findUnique({
          where: { email: bodyEmail },
          include: {
            security: true,
          },
        });
      } else if (authenticatedUserId) {
        // Fallback to authenticated user if no email in body
        user = await prisma.user.findUnique({
          where: { id: authenticatedUserId },
          include: {
            security: true,
          },
        });
      } else {
        throw new AppError('Please provide your email address', 400);
      }

      if (!user) {
        throw new AppError('No account found with this email address. Please check your email and try again.', 404);
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
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const verificationUrl = `${frontendUrl}/verify-email?token=${verificationToken}`;
      
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
        throw new AppError('This verification link is invalid or has expired. Please request a new verification email.', 400);
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

      // Award registration points now that email is verified
      const { pointsEvents } = await import('../../services/points-events.service');
      pointsEvents.trigger('user.registered', user.id);

      // Check if user was referred and activate referral
      const pendingReferral = await prisma.referral.findFirst({
        where: {
          refereeId: user.id,
          isActivated: false,
        },
        include: {
          users_referrals_referrerIdTousers: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
      });

      if (pendingReferral) {
        // Activate the referral and award points
        await prisma.referral.update({
          where: { id: pendingReferral.id },
          data: {
            isActivated: true,
            activatedAt: new Date(),
            referrerRewardGiven: true,
            metadata: {
              ...((pendingReferral.metadata as any) || {}),
              pendingVerification: false,
              verifiedAt: new Date(),
            },
          },
        });

        // Award referral points to both users
        pointsEvents.trigger('referral.successful', pendingReferral.referrerId, {
          refereeName: user.fullName,
        });
        pointsEvents.trigger('referral.signed-up', user.id, {
          referrerName: pendingReferral.users_referrals_referrerIdTousers.fullName,
        });

        // Update referral stats to mark as activated
        await prisma.referralStat.update({
          where: { userId: pendingReferral.referrerId },
          data: {
            totalActivated: { increment: 1 },
          },
        });

        // Notify referrer that their referral is now activated
        await NotificationService.notifyReferralUsed(
          pendingReferral.referrerId,
          user.fullName,
          user.id,
          pendingReferral.referralCode
        );

        logger.info('Referral activated and points awarded', {
          referrerId: pendingReferral.referrerId,
          refereeId: user.id,
          referralCode: pendingReferral.referralCode,
        });
      }

      // Send email verified notification
      await NotificationService.notifyEmailVerified(user.id, user.fullName);
      
      // Send welcome notification
      await NotificationService.notifyRegistrationSuccess(user.id, user.fullName);

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
   * Validate referral code
   * @route GET /v2/auth/validate-referral/:code
   */
  static async validateReferralCode(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { code } = req.params;

      if (!code || code.trim() === '') {
        throw new AppError('Referral code is required', 400);
      }

      // Find user by referral code
      const referrer = await prisma.user.findFirst({
        where: {
          metadata: {
            referralCode: code.toUpperCase()
          }
        },
        select: {
          id: true,
          fullName: true,
          username: true,
          profile: {
            select: {
              profilePicture: true,
            }
          },
          metadata: {
            select: {
              referralCode: true,
            }
          }
        }
      });

      if (!referrer) {
        throw new AppError('Invalid referral code', 404);
      }

      // Transform profile picture key to full URL if needed
      let profilePictureUrl = referrer.profile?.profilePicture || null;
      if (profilePictureUrl && 
          !profilePictureUrl.startsWith('http://') && 
          !profilePictureUrl.startsWith('https://') &&
          !profilePictureUrl.startsWith('data:')) {
        const { storageService } = await import('../../services/storage.service');
        profilePictureUrl = storageService.getPublicUrl(profilePictureUrl);
      }

      // Return referrer information
      sendSuccess(res, {
        valid: true,
        referrer: {
          fullName: referrer.fullName,
          username: referrer.username,
          profilePicture: profilePictureUrl,
          referralCode: referrer.metadata?.referralCode,
        }
      }, 'Referral code is valid');
    } catch (error) {
      logger.error('Failed to validate referral code', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        code: req.params.code
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
      // Support both authenticated and unauthenticated requests
      // Priority: email in body > authenticated user
      const authenticatedUserId = (req as any).user?.id;
      const { email: bodyEmail } = req.body;

      let user;
      
      // First try email from body if provided
      if (bodyEmail) {
        user = await prisma.user.findUnique({
          where: { email: bodyEmail },
          include: {
            security: true,
          },
        });
      } else if (authenticatedUserId) {
        // Fallback to authenticated user if no email in body
        user = await prisma.user.findUnique({
          where: { id: authenticatedUserId },
          include: {
            security: true,
          },
        });
      } else {
        throw new AppError('Please provide your email address', 400);
      }

      if (!user) {
        throw new AppError('No account found with this email address. Please check your email and try again.', 404);
      }

      // Check if already verified
      if (user.security?.emailVerifiedAt) {
        throw new AppError('Your email is already verified. You can log in now!', 400);
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
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const verificationUrl = `${frontendUrl}/verify-email?token=${verificationToken}`;
      
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
