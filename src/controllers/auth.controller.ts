import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { hashPassword, comparePassword, generateToken } from '../utils/auth';
import { sendSuccess } from '../utils/response';
import { PointsService } from '../services/points.service';
import { AppError } from '../middleware/error';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, phone, password, fullName, referralCode } = req.body;

      // Check if user already exists
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email },
            { phone: phone || undefined },
          ],
        },
      });

      if (existingUser) {
        throw new AppError('User already exists', 400);
      }

      // Check referral code if provided
      let referredBy = null;
      if (referralCode) {
        referredBy = await prisma.user.findUnique({
          where: { referralCode },
        });

        if (!referredBy) {
          throw new AppError('Invalid referral code', 400);
        }
      }

      // Create user
      const hashedPassword = await hashPassword(password);
      const user = await prisma.user.create({
        data: {
          email,
          phone,
          password: hashedPassword,
          fullName,
          referredById: referredBy?.id,
        },
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          referralCode: true,
        },
      });

      // Award registration points
      await PointsService.awardPoints(user.id, 'REGISTER');

      // Award referral points if applicable
      if (referredBy) {
        await PointsService.awardPoints(referredBy.id, 'REFERRAL', `Referred ${user.fullName}`);
      }

      // Generate token
      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      sendSuccess(res, { user, token }, 'User registered successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;

      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new AppError('Invalid credentials', 401);
      }

      const isValidPassword = await comparePassword(password, user.password);
      if (!isValidPassword) {
        throw new AppError('Invalid credentials', 401);
      }

      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      const { password: _, ...userWithoutPassword } = user;

      sendSuccess(res, { user: userWithoutPassword, token }, 'Login successful');
    } catch (error) {
      next(error);
    }
  }
}