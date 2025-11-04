import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../../config/database';
import { cacheService } from '../../services/cache.service';
import { AppError } from '../../middleware/error';
import logger from '../../utils/logger';
import { getProfilePictureUrl } from '../../utils/image.helpers';
import {
  QRCodeGenerateRequest,
  QRCodeGenerateResponse,
  QRCodePayload,
  QRCodeScanResponse,
} from './qr-code.types';

// QR Code expiration times (in seconds)
const QR_EXPIRY = {
  CONNECT: 900, // 15 minutes
  CHECKIN: 300, // 5 minutes
};

// Redis key patterns
const QR_NONCE_KEY = (nonce: string) => `qr:nonce:${nonce}`;
const QR_USER_KEY = (userId: string, purpose: string) => `qr:user:${userId}:${purpose}`;

export class QRCodeService {
  /**
   * Generate QR code for user
   */
  static async generateQRCode(
    userId: string,
    request: QRCodeGenerateRequest
  ): Promise<QRCodeGenerateResponse> {
    try {
      const { purpose, eventId } = request;

      // Validate user exists
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, status: true },
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      if (user.status !== 'ACTIVE') {
        throw new AppError('User account is not active', 403);
      }

      // If CHECKIN purpose, validate eventId and user has ticket/RSVP
      if (purpose === 'CHECKIN') {
        if (!eventId) {
          throw new AppError('eventId is required for CHECKIN purpose', 400);
        }

        // Validate event exists
        const event = await prisma.event.findUnique({
          where: { id: eventId },
          select: { id: true, status: true },
        });

        if (!event) {
          throw new AppError('Event not found', 404);
        }

        if (event.status !== 'PUBLISHED') {
          throw new AppError('Event is not published', 400);
        }

                // Check if user has valid ticket or participant record
        const [ticket, participant] = await Promise.all([
          prisma.eventTicket.findFirst({
            where: {
              userId,
              eventId,
              status: { in: ['CONFIRMED', 'CHECKED_IN'] },
            },
          }),
          prisma.eventParticipant.findFirst({
            where: {
              userId,
              eventId,
            },
          }),
        ]);

        if (!ticket && !participant) {
          throw new AppError('You do not have a valid ticket or registration for this event', 403);
        }
      }

      // Generate nonce (one-time use token)
      const nonce = uuidv4();

      // Set expiration based on purpose
      const expiresIn = QR_EXPIRY[purpose];
      const expiresAt = new Date(Date.now() + expiresIn * 1000);

      // Create JWT payload
      const payload: QRCodePayload = {
        userId,
        purpose,
        eventId: eventId || undefined,
        timestamp: Date.now(),
        exp: Math.floor(expiresAt.getTime() / 1000),
        nonce,
      };

      // Sign JWT
      const qrData = jwt.sign(payload, process.env.JWT_SECRET!);

      // Store nonce in Redis with TTL (prevent replay attacks)
      await cacheService.set(QR_NONCE_KEY(nonce), 'valid', { ttl: expiresIn });

      // Store active QR for user (allows invalidation if needed)
      const userQRKey = QR_USER_KEY(userId, purpose);
      await cacheService.set(
        userQRKey,
        JSON.stringify({ nonce, qrData, expiresAt: expiresAt.toISOString() }),
        { ttl: expiresIn }
      );

      logger.info(`QR code generated for user ${userId}, purpose: ${purpose}`);

      return {
        qrData,
        purpose,
        expiresAt: expiresAt.toISOString(),
        expiresIn,
        userId,
        eventId,
      };
    } catch (error) {
      logger.error('Error generating QR code:', error);
      throw error;
    }
  }

  /**
   * Validate QR code token
   */
  static async validateQRCode(qrData: string): Promise<QRCodeScanResponse> {
    try {
      // Verify JWT
      const decoded = jwt.verify(qrData, process.env.JWT_SECRET!) as QRCodePayload;

      const { userId, purpose, eventId, nonce } = decoded;

      // Check if nonce is still valid (not used)
      const nonceValid = await cacheService.get(QR_NONCE_KEY(nonce));
      if (!nonceValid) {
        throw new AppError('QR code has expired or already been used', 400);
      }

      // Get user details
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          fullName: true,
          username: true,
          trustLevel: true,
          trustScore: true,
          status: true,
          profile: {
            select: {
              profilePicture: true,
            },
          },
        },
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      if (user.status !== 'ACTIVE') {
        throw new AppError('User account is not active', 403);
      }

      return {
        valid: true,
        purpose,
        userId: user.id,
        user: {
          id: user.id,
          fullName: user.fullName,
          username: user.username || undefined,
          profilePicture: getProfilePictureUrl(user.profile?.profilePicture) || undefined,
          trustLevel: user.trustLevel,
          trustScore: user.trustScore,
        },
        eventId,
        message: 'QR code is valid',
      };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new AppError('QR code has expired', 400);
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AppError('Invalid QR code', 400);
      }
      throw error;
    }
  }

  /**
   * Invalidate QR code (mark nonce as used)
   */
  static async invalidateQRCode(nonce: string): Promise<void> {
    try {
      await cacheService.delete(QR_NONCE_KEY(nonce));
    } catch (error) {
      logger.error('Error invalidating QR code:', error);
    }
  }

  /**
   * Invalidate all QR codes for a user
   */
  static async invalidateUserQRCodes(userId: string): Promise<void> {
    try {
      await Promise.all([
        cacheService.delete(QR_USER_KEY(userId, 'CONNECT')),
        cacheService.delete(QR_USER_KEY(userId, 'CHECKIN')),
      ]);
    } catch (error) {
      logger.error('Error invalidating user QR codes:', error);
    }
  }
}
