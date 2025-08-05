import jwt from 'jsonwebtoken';
import { config } from '../config';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

interface JwtPayload {
  userId: string;
  email: string;
  role?: string;
  tokenType: 'access' | 'refresh';
}

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export class JwtManager {
  private static readonly ACCESS_TOKEN_EXPIRY = '15m';
  private static readonly REFRESH_TOKEN_EXPIRY = '7d';
  private static readonly REFRESH_TOKEN_FAMILY_SIZE = 10;

  // Generate access token
  static generateAccessToken(payload: Omit<JwtPayload, 'tokenType'>): string {
    return jwt.sign(
      { ...payload, tokenType: 'access' },
      config.jwt.secret,
      { 
        expiresIn: this.ACCESS_TOKEN_EXPIRY,
        issuer: 'bersemuka-api',
        audience: 'bersemuka-client',
      }
    );
  }

  // Generate refresh token
  static generateRefreshToken(payload: Omit<JwtPayload, 'tokenType'>): string {
    return jwt.sign(
      { ...payload, tokenType: 'refresh' },
      config.jwt.refreshSecret || config.jwt.secret,
      { 
        expiresIn: this.REFRESH_TOKEN_EXPIRY,
        issuer: 'bersemuka-api',
        audience: 'bersemuka-client',
      }
    );
  }

  // Generate token pair
  static async generateTokenPair(user: {
    id: string;
    email: string;
    role?: string;
  }): Promise<TokenPair> {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role || 'USER',
    };

    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload);

    // Store refresh token in database
    await this.storeRefreshToken(user.id, refreshToken);

    return { accessToken, refreshToken };
  }

  // Store refresh token in database with family management
  static async storeRefreshToken(userId: string, refreshToken: string): Promise<void> {
    try {
      // Generate token family ID
      const tokenFamily = crypto.randomBytes(16).toString('hex');
      
      // Hash the refresh token before storing
      const hashedToken = crypto
        .createHash('sha256')
        .update(refreshToken)
        .digest('hex');

      // Clean up old tokens (keep only recent ones)
      const existingTokens = await prisma.refreshToken.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });

      // Delete tokens beyond the family size limit
      if (existingTokens.length >= this.REFRESH_TOKEN_FAMILY_SIZE) {
        const tokensToDelete = existingTokens.slice(this.REFRESH_TOKEN_FAMILY_SIZE - 1);
        await prisma.refreshToken.deleteMany({
          where: {
            id: { in: tokensToDelete.map(t => t.id) },
          },
        });
      }

      // Store new refresh token
      await prisma.refreshToken.create({
        data: {
          userId,
          tokenHash: hashedToken,
          tokenFamily,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        },
      });
    } catch (error) {
      console.error('Error storing refresh token:', error);
      throw new Error('Failed to store refresh token');
    }
  }

  // Verify access token
  static verifyAccessToken(token: string): JwtPayload {
    try {
      const payload = jwt.verify(token, config.jwt.secret, {
        issuer: 'bersemuka-api',
        audience: 'bersemuka-client',
      }) as JwtPayload;

      if (payload.tokenType !== 'access') {
        throw new Error('Invalid token type');
      }

      return payload;
    } catch (error) {
      throw new Error('Invalid access token');
    }
  }

  // Verify refresh token
  static async verifyRefreshToken(token: string): Promise<JwtPayload> {
    try {
      // Verify JWT signature and expiry
      const payload = jwt.verify(
        token,
        config.jwt.refreshSecret || config.jwt.secret,
        {
          issuer: 'bersemuka-api',
          audience: 'bersemuka-client',
        }
      ) as JwtPayload;

      if (payload.tokenType !== 'refresh') {
        throw new Error('Invalid token type');
      }

      // Check if token exists in database
      const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

      const storedToken = await prisma.refreshToken.findFirst({
        where: {
          userId: payload.userId,
          tokenHash: hashedToken,
          isRevoked: false,
          expiresAt: { gt: new Date() },
        },
      });

      if (!storedToken) {
        // Token reuse detected - revoke entire token family
        await this.revokeTokenFamily(payload.userId, hashedToken);
        throw new Error('Refresh token not found or expired');
      }

      return payload;
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  // Rotate refresh token (security best practice)
  static async rotateRefreshToken(oldToken: string): Promise<TokenPair> {
    try {
      // Verify old token
      const payload = await this.verifyRefreshToken(oldToken);

      // Get user details
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { id: true, email: true, role: true },
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Revoke old token
      await this.revokeRefreshToken(oldToken);

      // Generate new token pair
      return await this.generateTokenPair(user);
    } catch (error) {
      throw new Error('Token rotation failed');
    }
  }

  // Revoke specific refresh token
  static async revokeRefreshToken(token: string): Promise<void> {
    try {
      const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

      await prisma.refreshToken.updateMany({
        where: { tokenHash: hashedToken },
        data: { isRevoked: true },
      });
    } catch (error) {
      console.error('Error revoking refresh token:', error);
    }
  }

  // Revoke entire token family (security measure)
  static async revokeTokenFamily(userId: string, suspiciousTokenHash: string): Promise<void> {
    try {
      // Find the token family
      const suspiciousToken = await prisma.refreshToken.findFirst({
        where: { tokenHash: suspiciousTokenHash },
        select: { tokenFamily: true },
      });

      if (suspiciousToken?.tokenFamily) {
        // Revoke all tokens in the family
        await prisma.refreshToken.updateMany({
          where: { 
            userId,
            tokenFamily: suspiciousToken.tokenFamily,
          },
          data: { isRevoked: true },
        });
      } else {
        // Fallback: revoke all tokens for the user
        await prisma.refreshToken.updateMany({
          where: { userId },
          data: { isRevoked: true },
        });
      }
    } catch (error) {
      console.error('Error revoking token family:', error);
    }
  }

  // Revoke all tokens for a user (logout from all devices)
  static async revokeAllUserTokens(userId: string): Promise<void> {
    try {
      await prisma.refreshToken.updateMany({
        where: { userId },
        data: { isRevoked: true },
      });
    } catch (error) {
      console.error('Error revoking all user tokens:', error);
    }
  }

  // Clean up expired tokens (should be run periodically)
  static async cleanupExpiredTokens(): Promise<void> {
    try {
      await prisma.refreshToken.deleteMany({
        where: {
          OR: [
            { expiresAt: { lt: new Date() } },
            { isRevoked: true },
          ],
        },
      });
    } catch (error) {
      console.error('Error cleaning up expired tokens:', error);
    }
  }

  // Get token info without verification (for debugging)
  static decodeToken(token: string): any {
    try {
      return jwt.decode(token);
    } catch (error) {
      return null;
    }
  }
}

// Periodic cleanup (run every hour)
setInterval(() => {
  JwtManager.cleanupExpiredTokens();
}, 60 * 60 * 1000);

export default JwtManager;