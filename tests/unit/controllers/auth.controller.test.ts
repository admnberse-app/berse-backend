import { Request, Response } from 'express';
import { AuthController } from '../../../src/controllers/auth.controller';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { faker } from '@faker-js/faker';

// Mock dependencies
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

const mockPrisma = new PrismaClient() as jest.Mocked<PrismaClient>;

describe('AuthController', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let mockSend: jest.Mock;
  let mockStatus: jest.Mock;
  let mockJson: jest.Mock;

  beforeEach(() => {
    mockSend = jest.fn();
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    
    req = {
      body: {},
      headers: {},
    };
    
    res = {
      status: mockStatus,
      json: mockJson,
      send: mockSend,
    };
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const mockUserData = {
        email: faker.internet.email(),
        password: 'SecurePass123!',
        fullName: faker.person.fullName(),
        phone: faker.phone.number(),
      };

      req.body = mockUserData;

      const hashedPassword = 'hashedPassword123';
      const mockCreatedUser = {
        id: faker.string.uuid(),
        ...mockUserData,
        password: hashedPassword,
        role: 'USER',
        isVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockToken = 'mock.jwt.token';

      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (mockPrisma.user.create as jest.Mock).mockResolvedValue(mockCreatedUser);
      (mockPrisma.points.create as jest.Mock).mockResolvedValue({
        id: faker.string.uuid(),
        userId: mockCreatedUser.id,
        total: 5,
        available: 5,
      });
      (jwt.sign as jest.Mock).mockReturnValue(mockToken);

      await AuthController.register(req as Request, res as Response);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: mockUserData.email },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(mockUserData.password, 10);
      expect(mockPrisma.user.create).toHaveBeenCalled();
      expect(mockPrisma.points.create).toHaveBeenCalled();
      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Registration successful',
        data: {
          user: expect.objectContaining({
            id: mockCreatedUser.id,
            email: mockCreatedUser.email,
            fullName: mockCreatedUser.fullName,
          }),
          token: mockToken,
        },
      });
    });

    it('should return error if email already exists', async () => {
      const mockUserData = {
        email: faker.internet.email(),
        password: 'SecurePass123!',
        fullName: faker.person.fullName(),
      };

      req.body = mockUserData;

      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: faker.string.uuid(),
        email: mockUserData.email,
      });

      await AuthController.register(req as Request, res as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Email already registered',
      });
      expect(mockPrisma.user.create).not.toHaveBeenCalled();
    });

    it('should handle registration errors', async () => {
      const mockUserData = {
        email: faker.internet.email(),
        password: 'SecurePass123!',
        fullName: faker.person.fullName(),
      };

      req.body = mockUserData;

      const error = new Error('Database error');
      (mockPrisma.user.findUnique as jest.Mock).mockRejectedValue(error);

      await AuthController.register(req as Request, res as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Registration failed',
      });
    });
  });

  describe('login', () => {
    it('should login user successfully with correct credentials', async () => {
      const mockLoginData = {
        email: faker.internet.email(),
        password: 'SecurePass123!',
      };

      req.body = mockLoginData;

      const mockUser = {
        id: faker.string.uuid(),
        email: mockLoginData.email,
        password: 'hashedPassword',
        fullName: faker.person.fullName(),
        role: 'USER',
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockToken = 'mock.jwt.token';

      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue(mockToken);

      await AuthController.login(req as Request, res as Response);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: mockLoginData.email },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        mockLoginData.password,
        mockUser.password
      );
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Login successful',
        data: {
          user: expect.objectContaining({
            id: mockUser.id,
            email: mockUser.email,
            fullName: mockUser.fullName,
          }),
          token: mockToken,
        },
      });
    });

    it('should return error for non-existent user', async () => {
      const mockLoginData = {
        email: faker.internet.email(),
        password: 'SecurePass123!',
      };

      req.body = mockLoginData;

      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await AuthController.login(req as Request, res as Response);

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid credentials',
      });
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should return error for incorrect password', async () => {
      const mockLoginData = {
        email: faker.internet.email(),
        password: 'WrongPassword123!',
      };

      req.body = mockLoginData;

      const mockUser = {
        id: faker.string.uuid(),
        email: mockLoginData.email,
        password: 'hashedPassword',
        fullName: faker.person.fullName(),
      };

      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await AuthController.login(req as Request, res as Response);

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid credentials',
      });
      expect(jwt.sign).not.toHaveBeenCalled();
    });

    it('should handle login errors', async () => {
      const mockLoginData = {
        email: faker.internet.email(),
        password: 'SecurePass123!',
      };

      req.body = mockLoginData;

      const error = new Error('Database error');
      (mockPrisma.user.findUnique as jest.Mock).mockRejectedValue(error);

      await AuthController.login(req as Request, res as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Login failed',
      });
    });
  });
});