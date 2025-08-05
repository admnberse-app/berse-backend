import request from 'supertest';
import app from '../../src/app';
import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

describe('Auth Endpoints Integration Tests', () => {
  beforeAll(async () => {
    // Clear test database
    await prisma.user.deleteMany({});
    await prisma.points.deleteMany({});
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user with valid data', async () => {
      const userData = {
        email: faker.internet.email(),
        password: 'SecurePass123!',
        fullName: faker.person.fullName(),
        phoneNumber: faker.phone.number(),
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Registration successful',
        data: {
          user: {
            email: userData.email,
            fullName: userData.fullName,
          },
          token: expect.any(String),
        },
      });

      // Verify user was created in database
      const createdUser = await prisma.user.findUnique({
        where: { email: userData.email },
      });
      expect(createdUser).toBeTruthy();
      expect(createdUser?.isVerified).toBe(false);

      // Verify points were awarded
      const userPoints = await prisma.points.findFirst({
        where: { userId: createdUser?.id },
      });
      expect(userPoints?.total).toBe(5); // Registration bonus
    });

    it('should reject registration with invalid email', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'SecurePass123!',
        fullName: faker.person.fullName(),
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: expect.stringContaining('email'),
      });
    });

    it('should reject registration with weak password', async () => {
      const userData = {
        email: faker.internet.email(),
        password: 'weak',
        fullName: faker.person.fullName(),
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: expect.stringContaining('password'),
      });
    });

    it('should reject duplicate email registration', async () => {
      const userData = {
        email: faker.internet.email(),
        password: 'SecurePass123!',
        fullName: faker.person.fullName(),
      };

      // Register first time
      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      // Try to register again with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: 'Email already registered',
      });
    });

    it('should be rate limited after multiple attempts', async () => {
      // Make multiple registration attempts
      const promises = Array(5).fill(null).map(() =>
        request(app)
          .post('/api/auth/register')
          .send({
            email: faker.internet.email(),
            password: 'SecurePass123!',
            fullName: faker.person.fullName(),
          })
      );

      const responses = await Promise.all(promises);
      const rateLimited = responses.some(res => res.status === 429);
      expect(rateLimited).toBe(true);
    });
  });

  describe('POST /api/auth/login', () => {
    let testUser: any;
    const testPassword = 'SecurePass123!';

    beforeAll(async () => {
      // Create a test user
      const userData = {
        email: faker.internet.email(),
        password: testPassword,
        fullName: faker.person.fullName(),
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      testUser = response.body.data.user;
    });

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testPassword,
        })
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            email: testUser.email,
            fullName: testUser.fullName,
          },
          token: expect.any(String),
        },
      });

      // Verify token is valid
      const decoded = jwt.verify(
        response.body.data.token,
        process.env.JWT_SECRET || 'your-secret-key'
      ) as any;
      expect(decoded.userId).toBe(response.body.data.user.id);
    });

    it('should reject login with incorrect password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword123!',
        })
        .expect(401);

      expect(response.body).toMatchObject({
        success: false,
        error: 'Invalid credentials',
      });
    });

    it('should reject login with non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: testPassword,
        })
        .expect(401);

      expect(response.body).toMatchObject({
        success: false,
        error: 'Invalid credentials',
      });
    });

    it('should reject login with missing fields', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          // Missing password
        })
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: expect.stringContaining('password'),
      });
    });

    it('should be rate limited after multiple failed attempts', async () => {
      // Make multiple failed login attempts
      const promises = Array(5).fill(null).map(() =>
        request(app)
          .post('/api/auth/login')
          .send({
            email: testUser.email,
            password: 'WrongPassword!',
          })
      );

      const responses = await Promise.all(promises);
      const rateLimited = responses.some(res => res.status === 429);
      expect(rateLimited).toBe(true);
    });
  });

  describe('CSRF Protection', () => {
    it('should get CSRF token', async () => {
      const response = await request(app)
        .get('/api/csrf-token')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          csrfToken: expect.any(String),
        },
      });
    });

    it('should reject POST without CSRF token', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password',
        })
        .expect(403);

      expect(response.body.error).toContain('CSRF');
    });
  });
});