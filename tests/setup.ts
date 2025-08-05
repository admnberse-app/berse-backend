import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Mock Prisma client
jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    event: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    points: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    reward: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $transaction: jest.fn(),
  };

  return {
    PrismaClient: jest.fn(() => mockPrismaClient),
  };
});

// Global test utilities
global.testUtils = {
  generateAuthToken: (userId: string) => {
    const jwt = require('jsonwebtoken');
    return jwt.sign({ userId }, process.env.JWT_SECRET || 'test-secret', {
      expiresIn: '1h',
    });
  },
  
  mockUser: {
    id: 'test-user-id',
    email: 'test@example.com',
    password: '$2a$10$hashedpassword',
    fullName: 'Test User',
    role: 'USER',
    isVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  
  mockEvent: {
    id: 'test-event-id',
    title: 'Test Event',
    description: 'Test event description',
    type: 'General',
    date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    time: '14:00',
    location: 'Test Location',
    capacity: 100,
    currentAttendees: 0,
    isPublic: true,
    hostId: 'test-user-id',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
};

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});

// Extend Jest matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidDate(): R;
      toBeWithinRange(floor: number, ceiling: number): R;
    }
  }
  
  var testUtils: {
    generateAuthToken: (userId: string) => string;
    mockUser: any;
    mockEvent: any;
  };
}

expect.extend({
  toBeValidDate(received) {
    const pass = received instanceof Date && !isNaN(received.getTime());
    return {
      message: () => `expected ${received} to be a valid date`,
      pass,
    };
  },
  
  toBeWithinRange(received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling;
    return {
      message: () => `expected ${received} to be within range ${floor} - ${ceiling}`,
      pass,
    };
  },
});