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
          membershipId: true,
          role: true,
          isHostCertified: true,
          totalPoints: true,
          createdAt: true,
          // Additional profile fields
          username: true,
          shortBio: true,
          currentLocation: true,
          originallyFrom: true,
          personalityType: true,
          languages: true,
          age: true,
          profession: true,
          gender: true,
          nationality: true,
          website: true,
          travelHistory: true,
          servicesOffered: true,
          communityRole: true,
          eventsAttended: true,
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
      const { 
        fullName, 
        bio, 
        city, 
        interests, 
        instagramHandle, 
        linkedinHandle,
        username,
        shortBio,
        currentLocation,
        originallyFrom,
        personalityType,
        languages,
        age,
        profession,
        gender,
        nationality,
        website,
        travelHistory,
        servicesOffered,
        communityRole,
        communities,
        eventsAttended,
        email,
        phone,
        instagram,
        linkedin,
        topInterests,
        fullBio
      } = req.body;

      // Build update data object with only provided fields
      const updateData: any = {};
      
      if (fullName !== undefined) updateData.fullName = fullName;
      if (username !== undefined) updateData.username = username;
      if (shortBio !== undefined) updateData.shortBio = shortBio;
      if (currentLocation !== undefined) updateData.currentLocation = currentLocation;
      if (originallyFrom !== undefined) updateData.originallyFrom = originallyFrom;
      if (personalityType !== undefined) updateData.personalityType = personalityType;
      if (languages !== undefined) updateData.languages = languages;
      if (age !== undefined) updateData.age = parseInt(age);
      if (profession !== undefined) updateData.profession = profession;
      if (gender !== undefined) updateData.gender = gender;
      if (nationality !== undefined) updateData.nationality = nationality;
      if (website !== undefined) updateData.website = website;
      if (travelHistory !== undefined) updateData.travelHistory = travelHistory;
      if (servicesOffered !== undefined) updateData.servicesOffered = servicesOffered;
      if (communityRole !== undefined) updateData.communityRole = communityRole;
      if (eventsAttended !== undefined) updateData.eventsAttended = eventsAttended;
      if (email !== undefined) updateData.email = email;
      if (phone !== undefined) updateData.phone = phone;
      
      // Handle interests (can come as interests or topInterests)
      if (topInterests !== undefined) {
        updateData.interests = topInterests;
      } else if (interests !== undefined) {
        updateData.interests = interests;
      }
      
      // Handle bio (can come as bio or fullBio)
      if (fullBio !== undefined) {
        updateData.bio = fullBio;
      } else if (bio !== undefined) {
        updateData.bio = bio;
      }
      
      // Handle social media handles
      if (instagram !== undefined) updateData.instagramHandle = instagram;
      if (instagramHandle !== undefined) updateData.instagramHandle = instagramHandle;
      if (linkedin !== undefined) updateData.linkedinHandle = linkedin;
      if (linkedinHandle !== undefined) updateData.linkedinHandle = linkedinHandle;
      
      // Update city if currentLocation is provided
      if (currentLocation !== undefined) updateData.city = currentLocation;
      if (city !== undefined) updateData.city = city;

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData,
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
          username: true,
          shortBio: true,
          currentLocation: true,
          originallyFrom: true,
          personalityType: true,
          languages: true,
          age: true,
          profession: true,
          gender: true,
          nationality: true,
          website: true,
          travelHistory: true,
          servicesOffered: true,
          communityRole: true,
          eventsAttended: true,
          membershipId: true,
          totalPoints: true,
          referralCode: true,
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