import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const communityController = {
  // Get all communities
  async getAllCommunities(req: Request, res: Response) {
    try {
      const communities = await prisma.community.findMany({
        include: {
          _count: {
            select: { members: true }
          }
        },
        orderBy: { name: 'asc' }
      });

      res.json({
        success: true,
        data: communities
      });
    } catch (error) {
      console.error('Error fetching communities:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch communities'
      });
    }
  },

  // Create a new community
  async createCommunity(req: Request, res: Response) {
    try {
      const { name, description, category } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      if (!name) {
        return res.status(400).json({
          success: false,
          error: 'Community name is required'
        });
      }

      // Check if community already exists
      const existingCommunity = await prisma.community.findUnique({
        where: { name }
      });

      if (existingCommunity) {
        return res.status(409).json({
          success: false,
          error: 'Community with this name already exists'
        });
      }

      // Create the community
      const community = await prisma.community.create({
        data: {
          name,
          description,
          category,
          createdById: userId,
          members: {
            create: {
              userId,
              role: 'OWNER',
              isApproved: true
            }
          }
        },
        include: {
          _count: {
            select: { members: true }
          }
        }
      });

      res.status(201).json({
        success: true,
        data: community
      });
    } catch (error) {
      console.error('Error creating community:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create community'
      });
    }
  },

  // Join a community
  async joinCommunity(req: Request, res: Response) {
    try {
      const { communityId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      // Check if already a member
      const existingMember = await prisma.communityMember.findUnique({
        where: {
          userId_communityId: {
            userId,
            communityId
          }
        }
      });

      if (existingMember) {
        return res.status(409).json({
          success: false,
          error: 'Already a member of this community'
        });
      }

      // Join the community
      const member = await prisma.communityMember.create({
        data: {
          userId,
          communityId,
          role: 'MEMBER',
          isApproved: false // Requires approval from admin
        }
      });

      res.status(201).json({
        success: true,
        data: member
      });
    } catch (error) {
      console.error('Error joining community:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to join community'
      });
    }
  },

  // Get user's communities
  async getUserCommunities(req: Request, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      const memberships = await prisma.communityMember.findMany({
        where: {
          userId,
          isApproved: true
        },
        include: {
          community: {
            include: {
              _count: {
                select: { members: true }
              }
            }
          }
        }
      });

      const communities = memberships.map(m => ({
        ...m.community,
        role: m.role,
        joinedAt: m.joinedAt
      }));

      res.json({
        success: true,
        data: communities
      });
    } catch (error) {
      console.error('Error fetching user communities:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch user communities'
      });
    }
  },

  // Search communities
  async searchCommunities(req: Request, res: Response) {
    try {
      const { query } = req.query;

      if (!query || typeof query !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Search query is required'
        });
      }

      const communities = await prisma.community.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } }
          ]
        },
        include: {
          _count: {
            select: { members: true }
          }
        },
        take: 10
      });

      res.json({
        success: true,
        data: communities
      });
    } catch (error) {
      console.error('Error searching communities:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to search communities'
      });
    }
  }
};