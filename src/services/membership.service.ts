import { prisma } from '../config/database';
import logger from '../utils/logger';

export class MembershipService {
  /**
   * Generate a unique membership ID with BSE prefix
   */
  static async generateUniqueMembershipId(): Promise<string> {
    const prefix = 'BSE';
    const maxAttempts = 10;
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      // Generate random 6-digit number
      const randomNum = Math.floor(100000 + Math.random() * 900000);
      const membershipId = `${prefix}${randomNum}`;
      
      try {
        // Check if this ID already exists in UserMetadata
        const existing = await prisma.userMetadata.findFirst({
          where: { membershipId }
        });
        
        if (!existing) {
          return membershipId;
        }
      } catch (error) {
        logger.error('Error checking membership ID uniqueness', { error, membershipId });
        throw error;
      }
      
      attempts++;
    }
    
    // If we couldn't generate a unique ID after max attempts, throw error
    throw new Error(`Failed to generate unique membership ID after ${maxAttempts} attempts`);
  }

  /**
   * Fix missing membership IDs for all users
   */
  static async fixMissingMembershipIds(): Promise<void> {
    try {
      // Find all users without membership IDs in their metadata
      const usersWithoutIds = await prisma.user.findMany({
        where: {
          OR: [
            { metadata: { is: { membershipId: null } } },
            { metadata: { is: null } }
          ]
        },
        select: {
          id: true,
          fullName: true,
          email: true,
          metadata: {
            select: {
              membershipId: true
            }
          }
        }
      });
      
      if (usersWithoutIds.length === 0) {
        return;
      }
      
      logger.info(`Found ${usersWithoutIds.length} users without membership IDs`);
      
      for (const user of usersWithoutIds) {
        try {
          const membershipId = await this.generateUniqueMembershipId();
          
          // Upsert the metadata with membership ID
          await prisma.userMetadata.upsert({
            where: { userId: user.id },
            update: { membershipId },
            create: {
              userId: user.id,
              membershipId,
              referralCode: `REF-${user.id.substring(0, 8).toUpperCase()}`
            }
          });
          
          logger.info('Generated membership ID for user', {
            userId: user.id,
            email: user.email,
            membershipId
          });
        } catch (error) {
          logger.error('Failed to generate membership ID for user', {
            userId: user.id,
            email: user.email,
            error
          });
        }
      }
    } catch (error) {
      logger.error('Error fixing missing membership IDs', { error });
    }
  }

  /**
   * Ensure user has membership ID (called after user creation)
   */
  static async ensureMembershipId(userId: string): Promise<string | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { 
          metadata: {
            select: {
              membershipId: true
            }
          }
        }
      });
      
      if (user?.metadata?.membershipId) {
        return user.metadata.membershipId;
      }
      
      // Generate new membership ID
      const membershipId = await this.generateUniqueMembershipId();
      
      // Upsert the metadata
      await prisma.userMetadata.upsert({
        where: { userId },
        update: { membershipId },
        create: {
          userId,
          membershipId,
          referralCode: `REF-${userId.substring(0, 8).toUpperCase()}`
        }
      });
      
      logger.info('Generated membership ID for user', { userId, membershipId });
      return membershipId;
    } catch (error) {
      logger.error('Failed to ensure membership ID', { userId, error });
      return null;
    }
  }
}