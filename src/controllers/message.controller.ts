import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { prisma } from '../config/database';
import { sendSuccess } from '../utils/response';
import { AppError } from '../middleware/error';

export class MessageController {
  // Get all messages for a user (inbox)
  static async getInbox(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id!;
      const { page = '1', limit = '20', unreadOnly = 'false' } = req.query;
      
      const pageNum = parseInt(page as string);
      const limitNum = Math.min(parseInt(limit as string), 50);
      const skip = (pageNum - 1) * limitNum;
      
      const where: any = {
        receiverId: userId,
      };
      
      if (unreadOnly === 'true') {
        where.isRead = false;
      }
      
      // Get messages with sender details
      const messages = await prisma.message.findMany({
        where,
        include: {
          sender: {
            select: {
              id: true,
              fullName: true,
              username: true,
              profilePicture: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limitNum,
        skip,
      });
      
      // Get unread count
      const unreadCount = await prisma.message.count({
        where: {
          receiverId: userId,
          isRead: false,
        },
      });
      
      sendSuccess(res, {
        messages,
        unreadCount,
        page: pageNum,
        limit: limitNum,
        hasMore: messages.length === limitNum,
      });
    } catch (error) {
      next(error);
    }
  }
  
  // Get sent messages
  static async getSentMessages(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id!;
      const { page = '1', limit = '20' } = req.query;
      
      const pageNum = parseInt(page as string);
      const limitNum = Math.min(parseInt(limit as string), 50);
      const skip = (pageNum - 1) * limitNum;
      
      const messages = await prisma.message.findMany({
        where: {
          senderId: userId,
        },
        include: {
          receiver: {
            select: {
              id: true,
              fullName: true,
              username: true,
              profilePicture: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limitNum,
        skip,
      });
      
      sendSuccess(res, {
        messages,
        page: pageNum,
        limit: limitNum,
        hasMore: messages.length === limitNum,
      });
    } catch (error) {
      next(error);
    }
  }
  
  // Get conversation between two users
  static async getConversation(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id!;
      const { partnerId } = req.params;
      const { page = '1', limit = '50' } = req.query;
      
      const pageNum = parseInt(page as string);
      const limitNum = Math.min(parseInt(limit as string), 100);
      const skip = (pageNum - 1) * limitNum;
      
      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: userId, receiverId: partnerId },
            { senderId: partnerId, receiverId: userId },
          ],
        },
        include: {
          sender: {
            select: {
              id: true,
              fullName: true,
              username: true,
              profilePicture: true,
            },
          },
          receiver: {
            select: {
              id: true,
              fullName: true,
              username: true,
              profilePicture: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
        take: limitNum,
        skip,
      });
      
      // Mark messages as read
      await prisma.message.updateMany({
        where: {
          senderId: partnerId,
          receiverId: userId,
          isRead: false,
        },
        data: {
          isRead: true,
        },
      });
      
      sendSuccess(res, {
        messages,
        page: pageNum,
        limit: limitNum,
        hasMore: messages.length === limitNum,
      });
    } catch (error) {
      next(error);
    }
  }
  
  // Send a message
  static async sendMessage(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const senderId = req.user?.id!;
      const { receiverId, content } = req.body;
      
      if (senderId === receiverId) {
        throw new AppError('Cannot send message to yourself', 400);
      }
      
      if (!content || content.trim().length === 0) {
        throw new AppError('Message content is required', 400);
      }
      
      // Check if receiver exists
      const receiver = await prisma.user.findUnique({
        where: { id: receiverId },
        select: { id: true, allowDirectMessages: true },
      });
      
      if (!receiver) {
        throw new AppError('Receiver not found', 404);
      }
      
      if (receiver.allowDirectMessages === false) {
        throw new AppError('This user does not accept direct messages', 403);
      }
      
      const message = await prisma.message.create({
        data: {
          senderId,
          receiverId,
          content: content.trim(),
        },
        include: {
          sender: {
            select: {
              id: true,
              fullName: true,
              username: true,
              profilePicture: true,
            },
          },
          receiver: {
            select: {
              id: true,
              fullName: true,
              username: true,
            },
          },
        },
      });
      
      // Create notification for receiver
      await prisma.notification.create({
        data: {
          userId: receiverId,
          type: 'MESSAGE',
          title: 'New Message',
          message: `${message.sender.fullName || message.sender.username || 'Someone'} sent you a message`,
          actionUrl: `/messages/${senderId}`,
          metadata: {
            senderId,
            messageId: message.id,
            senderName: message.sender.fullName || message.sender.username,
          },
        },
      });
      
      sendSuccess(res, message, 'Message sent successfully', 201);
    } catch (error) {
      next(error);
    }
  }
  
  // Mark message as read
  static async markAsRead(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id!;
      const { messageId } = req.params;
      
      const message = await prisma.message.findUnique({
        where: { id: messageId },
      });
      
      if (!message) {
        throw new AppError('Message not found', 404);
      }
      
      if (message.receiverId !== userId) {
        throw new AppError('Unauthorized to mark this message as read', 403);
      }
      
      const updatedMessage = await prisma.message.update({
        where: { id: messageId },
        data: { isRead: true },
      });
      
      sendSuccess(res, updatedMessage, 'Message marked as read');
    } catch (error) {
      next(error);
    }
  }
  
  // Mark all messages as read
  static async markAllAsRead(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id!;
      const { senderId } = req.query;
      
      const where: any = {
        receiverId: userId,
        isRead: false,
      };
      
      if (senderId) {
        where.senderId = senderId;
      }
      
      const result = await prisma.message.updateMany({
        where,
        data: { isRead: true },
      });
      
      sendSuccess(res, { count: result.count }, 'Messages marked as read');
    } catch (error) {
      next(error);
    }
  }
  
  // Delete a message (soft delete - just hide from user)
  static async deleteMessage(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id!;
      const { messageId } = req.params;
      
      const message = await prisma.message.findUnique({
        where: { id: messageId },
      });
      
      if (!message) {
        throw new AppError('Message not found', 404);
      }
      
      if (message.senderId !== userId && message.receiverId !== userId) {
        throw new AppError('Unauthorized to delete this message', 403);
      }
      
      // For now, we'll actually delete it, but in production you might want to soft delete
      await prisma.message.delete({
        where: { id: messageId },
      });
      
      sendSuccess(res, null, 'Message deleted successfully');
    } catch (error) {
      next(error);
    }
  }
  
  // Accept friend request from message
  static async acceptFriendRequest(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id!;
      const { followerId } = req.body;
      
      // Check if there's a follow request
      const existingFollow = await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId,
            followingId: userId,
          },
        },
      });
      
      if (!existingFollow) {
        throw new AppError('Friend request not found', 404);
      }
      
      // Create mutual follow (friend relationship)
      await prisma.follow.create({
        data: {
          followerId: userId,
          followingId: followerId,
        },
      }).catch(() => {
        // Might already exist, that's okay
      });
      
      // Send acceptance message
      await prisma.message.create({
        data: {
          senderId: userId,
          receiverId: followerId,
          content: `Your friend request has been accepted! You are now connected.`,
        },
      });
      
      // Create notification for the original requester
      const accepter = await prisma.user.findUnique({
        where: { id: userId },
        select: { fullName: true, username: true },
      });
      
      await prisma.notification.create({
        data: {
          userId: followerId,
          type: 'MESSAGE',
          title: 'Friend Request Accepted',
          message: `${accepter?.fullName || accepter?.username || 'Someone'} accepted your friend request`,
          actionUrl: `/profile/${userId}`,
          metadata: {
            accepterId: userId,
            accepterName: accepter?.fullName || accepter?.username,
            type: 'friend_request_accepted',
          },
        },
      });
      
      sendSuccess(res, null, 'Friend request accepted');
    } catch (error) {
      next(error);
    }
  }
  
  // Decline friend request
  static async declineFriendRequest(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id!;
      const { followerId } = req.body;
      
      // Remove the follow relationship
      await prisma.follow.delete({
        where: {
          followerId_followingId: {
            followerId,
            followingId: userId,
          },
        },
      }).catch(() => {
        // Might not exist, that's okay
      });
      
      sendSuccess(res, null, 'Friend request declined');
    } catch (error) {
      next(error);
    }
  }
}