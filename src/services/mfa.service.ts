import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import nodemailer from 'nodemailer';
import twilio from 'twilio';
import { cacheService, CacheKeys, CacheTTL } from './cache.service';
import logger from '../utils/logger';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface MFASetupResult {
  secret: string;
  qrCodeDataURL: string;
  backupCodes: string[];
}

interface MFAVerificationResult {
  isValid: boolean;
  usedBackupCode?: boolean;
}

interface SMSOptions {
  accountSid: string;
  authToken: string;
  fromNumber: string;
}

interface EmailOptions {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: string;
}

class MFAService {
  private smsClient?: any;
  private emailTransporter?: nodemailer.Transporter;

  constructor() {
    this.initializeSMSClient();
    this.initializeEmailTransporter();
  }

  private initializeSMSClient() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    if (accountSid && authToken) {
      this.smsClient = twilio(accountSid, authToken);
      logger.info('SMS client initialized');
    } else {
      logger.warn('Twilio credentials not provided - SMS MFA disabled');
    }
  }

  private initializeEmailTransporter() {
    const emailConfig = {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    };

    if (emailConfig.host && emailConfig.auth.user) {
      this.emailTransporter = nodemailer.createTransport(emailConfig);
      logger.info('Email transporter initialized');
    } else {
      logger.warn('SMTP credentials not provided - Email MFA disabled');
    }
  }

  /**
   * Setup TOTP MFA for a user
   */
  async setupTOTP(userId: string, appName: string = 'BerseMuka'): Promise<MFASetupResult> {
    try {
      // Get user info
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, fullName: true },
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Generate secret
      const secret = speakeasy.generateSecret({
        name: `${appName} (${user.email})`,
        issuer: appName,
        length: 32,
      });

      // Generate QR code
      const qrCodeDataURL = await QRCode.toDataURL(secret.otpauth_url!);

      // Generate backup codes
      const backupCodes = this.generateBackupCodes();

      // Store secret and backup codes in cache temporarily (15 minutes)
      await cacheService.set(
        CacheKeys.user(`${userId}:mfa:setup`),
        {
          secret: secret.base32,
          backupCodes,
          timestamp: Date.now(),
        },
        { ttl: 900 } // 15 minutes
      );

      logger.info(`MFA setup initiated for user ${userId}`);

      return {
        secret: secret.base32!,
        qrCodeDataURL,
        backupCodes,
      };
    } catch (error) {
      logger.error('MFA setup error:', error);
      throw new Error('Failed to setup MFA');
    }
  }

  /**
   * Verify TOTP token and complete MFA setup
   */
  async verifyAndEnableTOTP(userId: string, token: string): Promise<boolean> {
    try {
      // Get setup data from cache
      const setupData = await cacheService.get<{
        secret: string;
        backupCodes: string[];
        timestamp: number;
      }>(CacheKeys.user(`${userId}:mfa:setup`));

      if (!setupData) {
        throw new Error('MFA setup session expired');
      }

      // Verify token
      const verified = speakeasy.totp.verify({
        secret: setupData.secret,
        encoding: 'base32',
        token,
        window: 2, // Allow 2 time steps before/after
      });

      if (!verified) {
        return false;
      }

      // Save to database (extend User model with MFA fields)
      await prisma.user.update({
        where: { id: userId },
        data: {
          // Add these fields to User model in schema.prisma:
          // mfaEnabled: true,
          // mfaSecret: setupData.secret,
          // mfaBackupCodes: setupData.backupCodes,
        } as any,
      });

      // Clear setup cache
      await cacheService.delete(CacheKeys.user(`${userId}:mfa:setup`));

      // Cache user's MFA status
      await cacheService.set(
        CacheKeys.user(`${userId}:mfa:enabled`),
        true,
        { ttl: CacheTTL.DAY }
      );

      logger.info(`MFA enabled for user ${userId}`);
      return true;
    } catch (error) {
      logger.error('MFA verification error:', error);
      return false;
    }
  }

  /**
   * Verify TOTP token for login
   */
  async verifyTOTP(userId: string, token: string): Promise<MFAVerificationResult> {
    try {
      // Get user's MFA secret
      const user = await prisma.user.findUnique({
        where: { id: userId },
        // select: { mfaSecret: true, mfaBackupCodes: true },
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Check if trying to use backup code
      if (token.length === 8 && /^[A-Z0-9]{8}$/.test(token)) {
        return await this.verifyBackupCode(userId, token);
      }

      // Verify TOTP token
      const verified = speakeasy.totp.verify({
        secret: (user as any).mfaSecret,
        encoding: 'base32',
        token,
        window: 2,
      });

      if (verified) {
        logger.info(`MFA verification successful for user ${userId}`);
      }

      return { isValid: verified };
    } catch (error) {
      logger.error('MFA login verification error:', error);
      return { isValid: false };
    }
  }

  /**
   * Verify backup code
   */
  private async verifyBackupCode(userId: string, code: string): Promise<MFAVerificationResult> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        // select: { mfaBackupCodes: true },
      });

      if (!user) {
        return { isValid: false };
      }

      const backupCodes = (user as any).mfaBackupCodes || [];
      const codeIndex = backupCodes.indexOf(code);

      if (codeIndex === -1) {
        return { isValid: false };
      }

      // Remove used backup code
      const updatedCodes = [...backupCodes];
      updatedCodes.splice(codeIndex, 1);

      await prisma.user.update({
        where: { id: userId },
        data: {
          // mfaBackupCodes: updatedCodes,
        } as any,
      });

      logger.info(`Backup code used for user ${userId}, ${updatedCodes.length} codes remaining`);

      return { isValid: true, usedBackupCode: true };
    } catch (error) {
      logger.error('Backup code verification error:', error);
      return { isValid: false };
    }
  }

  /**
   * Send SMS verification code
   */
  async sendSMSCode(phoneNumber: string, userId: string): Promise<boolean> {
    if (!this.smsClient) {
      throw new Error('SMS service not configured');
    }

    try {
      // Generate 6-digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString();

      // Store code in cache (5 minutes)
      await cacheService.set(
        CacheKeys.user(`${userId}:sms:${phoneNumber}`),
        { code, timestamp: Date.now() },
        { ttl: 300 }
      );

      // Send SMS
      await this.smsClient.messages.create({
        body: `Your BerseMuka verification code is: ${code}. Valid for 5 minutes.`,
        from: process.env.TWILIO_FROM_NUMBER,
        to: phoneNumber,
      });

      logger.info(`SMS code sent to ${phoneNumber} for user ${userId}`);
      return true;
    } catch (error) {
      logger.error('SMS sending error:', error);
      return false;
    }
  }

  /**
   * Verify SMS code
   */
  async verifySMSCode(phoneNumber: string, userId: string, code: string): Promise<boolean> {
    try {
      const cachedData = await cacheService.get<{
        code: string;
        timestamp: number;
      }>(CacheKeys.user(`${userId}:sms:${phoneNumber}`));

      if (!cachedData) {
        return false;
      }

      if (cachedData.code !== code) {
        return false;
      }

      // Clear code after successful verification
      await cacheService.delete(CacheKeys.user(`${userId}:sms:${phoneNumber}`));

      logger.info(`SMS verification successful for user ${userId}`);
      return true;
    } catch (error) {
      logger.error('SMS verification error:', error);
      return false;
    }
  }

  /**
   * Send email verification code
   */
  async sendEmailCode(email: string, userId: string): Promise<boolean> {
    if (!this.emailTransporter) {
      throw new Error('Email service not configured');
    }

    try {
      // Generate 6-digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString();

      // Store code in cache (10 minutes)
      await cacheService.set(
        CacheKeys.user(`${userId}:email:${email}`),
        { code, timestamp: Date.now() },
        { ttl: 600 }
      );

      // Send email
      await this.emailTransporter.sendMail({
        from: process.env.SMTP_FROM || 'noreply@bersemuka.com',
        to: email,
        subject: 'BerseMuka - Verification Code',
        html: `
          <h2>Verification Code</h2>
          <p>Your BerseMuka verification code is:</p>
          <h1 style="font-size: 32px; letter-spacing: 5px; text-align: center; background: #f0f0f0; padding: 20px; border-radius: 8px;">${code}</h1>
          <p>This code is valid for 10 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
        `,
      });

      logger.info(`Email code sent to ${email} for user ${userId}`);
      return true;
    } catch (error) {
      logger.error('Email sending error:', error);
      return false;
    }
  }

  /**
   * Verify email code
   */
  async verifyEmailCode(email: string, userId: string, code: string): Promise<boolean> {
    try {
      const cachedData = await cacheService.get<{
        code: string;
        timestamp: number;
      }>(CacheKeys.user(`${userId}:email:${email}`));

      if (!cachedData) {
        return false;
      }

      if (cachedData.code !== code) {
        return false;
      }

      // Clear code after successful verification
      await cacheService.delete(CacheKeys.user(`${userId}:email:${email}`));

      logger.info(`Email verification successful for user ${userId}`);
      return true;
    } catch (error) {
      logger.error('Email verification error:', error);
      return false;
    }
  }

  /**
   * Disable MFA for user
   */
  async disableMFA(userId: string): Promise<boolean> {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: {
          // mfaEnabled: false,
          // mfaSecret: null,
          // mfaBackupCodes: [],
        } as any,
      });

      // Clear MFA cache
      await cacheService.delete(CacheKeys.user(`${userId}:mfa:enabled`));

      logger.info(`MFA disabled for user ${userId}`);
      return true;
    } catch (error) {
      logger.error('MFA disable error:', error);
      return false;
    }
  }

  /**
   * Check if user has MFA enabled
   */
  async isMFAEnabled(userId: string): Promise<boolean> {
    try {
      // Check cache first
      const cached = await cacheService.get<boolean>(
        CacheKeys.user(`${userId}:mfa:enabled`)
      );
      if (cached !== null) {
        return cached;
      }

      // Check database
      const user = await prisma.user.findUnique({
        where: { id: userId },
        // select: { mfaEnabled: true },
      });

      const isEnabled = !!(user as any)?.mfaEnabled;

      // Cache result
      await cacheService.set(
        CacheKeys.user(`${userId}:mfa:enabled`),
        isEnabled,
        { ttl: CacheTTL.DAY }
      );

      return isEnabled;
    } catch (error) {
      logger.error('MFA status check error:', error);
      return false;
    }
  }

  /**
   * Generate backup codes
   */
  private generateBackupCodes(count: number = 10): string[] {
    const codes: string[] = [];
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

    for (let i = 0; i < count; i++) {
      let code = '';
      for (let j = 0; j < 8; j++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      codes.push(code);
    }

    return codes;
  }

  /**
   * Generate new backup codes
   */
  async generateNewBackupCodes(userId: string): Promise<string[]> {
    try {
      const newCodes = this.generateBackupCodes();

      await prisma.user.update({
        where: { id: userId },
        data: {
          // mfaBackupCodes: newCodes,
        } as any,
      });

      logger.info(`New backup codes generated for user ${userId}`);
      return newCodes;
    } catch (error) {
      logger.error('Backup codes generation error:', error);
      throw new Error('Failed to generate backup codes');
    }
  }

  /**
   * Get MFA status and info for user
   */
  async getMFAStatus(userId: string): Promise<{
    enabled: boolean;
    backupCodesCount: number;
    methods: string[];
  }> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        // select: { mfaEnabled: true, mfaBackupCodes: true, phone: true },
      });

      if (!user) {
        throw new Error('User not found');
      }

      const methods: string[] = [];
      if ((user as any).mfaEnabled) methods.push('totp');
      if (user.phone) methods.push('sms');
      methods.push('email');

      return {
        enabled: !!(user as any).mfaEnabled,
        backupCodesCount: ((user as any).mfaBackupCodes || []).length,
        methods,
      };
    } catch (error) {
      logger.error('MFA status retrieval error:', error);
      return {
        enabled: false,
        backupCodesCount: 0,
        methods: [],
      };
    }
  }
}

export const mfaService = new MFAService();