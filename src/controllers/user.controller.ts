import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { prisma } from '../config/database';
import { sendSuccess } from '../utils/response';
import { AppError } from '../middleware/error';

export class UserController {
  static async getProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          phone: true,
          fullName: true,
          profilePicture: true,
          bio: true,
          city: true,
          interests: true,
          instagramHandle: true,
          linkedinHandle: true,
          referralCode: true,
          role: true,
          isHostCertified: true,
          totalPoints: true,
          createdAt: true,
          _count: {
            select: {
              hostedEvents: true,
              attendedEvents: true,
              referrals: true,
              badges: true,
            },
          },
        },
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      sendSuccess(res, user);
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      const { fullName, bio, city, interests, instagramHandle, linkedinHandle } = req.body;

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          fullName,
          bio,
          city,
          interests,
          instagramHandle,
          linkedinHandle,
        },
        select: {
          id: true,
          email: true,
          fullName: true,
          bio: true,
          city: true,
          interests: true,
          instagramHandle: true,
          linkedinHandle: true,
        },
      });

      sendSuccess(res, updatedUser, 'Profile updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async searchUsers(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { city, interest, query } = req.query;

      const where: any = {};

      if (city) {
        where.city = { contains: city as string, mode: 'insensitive' };
      }

      if (interest) {
        where.interests = { has: interest as string };
      }

      if (query) {
        where.OR = [
          { fullName: { contains: query as string, mode: 'insensitive' } },
          { bio: { contains: query as string, mode: 'insensitive' } },
        ];
      }

      const users = await prisma.user.findMany({
        where,
        select: {
          id: true,
          fullName: true,
          profilePicture: true,
          bio: true,
          city: true,
          interests: true,
          role: true,
          isHostCertified: true,
        },
        take: 20,
      });

      sendSuccess(res, users);
    } catch (error) {
      next(error);
    }
  }

  static async getUserById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          fullName: true,
          profilePicture: true,
          bio: true,
          city: true,
          interests: true,
          role: true,
          isHostCertified: true,
          _count: {
            select: {
              hostedEvents: true,
              attendedEvents: true,
              badges: true,
            },
          },
        },
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      sendSuccess(res, user);
    } catch (error) {
      next(error);
    }
  }

  static async followUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const followerId = req.user?.id!;
      const { id: followingId } = req.params;

      if (followerId === followingId) {
        throw new AppError('Cannot follow yourself', 400);
      }

      const follow = await prisma.follow.create({
        data: {
          followerId,
          followingId,
        },
      });

      sendSuccess(res, follow, 'User followed successfully', 201);
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new AppError('Already following this user', 400);
      }
      next(error);
    }
  }

  static async unfollowUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const followerId = req.user?.id!;
      const { id: followingId } = req.params;

      await prisma.follow.delete({
        where: {
          followerId_followingId: {
            followerId,
            followingId,
          },
        },
      });

      sendSuccess(res, null, 'User unfollowed successfully');
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new AppError('Not following this user', 400);
      }
      next(error);
    }
  }
}