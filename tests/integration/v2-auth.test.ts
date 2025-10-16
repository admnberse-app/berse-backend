import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import dotenv from 'dotenv';

// Load environment variables before importing app
dotenv.config();

// Ensure DATABASE_URL is set for tests
if (!process.env.DATABASE_URL) {
  console.warn('⚠️  DATABASE_URL not set, using default test database');
  process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/bersemuka_test';
}

// Import app after environment is configured
const app = require('../../src/app').default;
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

describe('V2 Auth Endpoints Integration Tests', () => {
  let testUser: any;
  let accessToken: string;
  let refreshToken: string;
  const testPassword = 'SecurePass123!';
  const testEmail = faker.internet.email().toLowerCase();

  beforeAll(async () => {
    // Clean up test data
    await prisma.refreshToken.deleteMany({
      where: {
        users: {
          email: {
            contains: 'test',
          },
        },
      },
    });
    await prisma.user.deleteMany({
      where: {
        email: {
          contains: 'test',
        },
      },
    });
  });

  afterAll(async () => {
    // Clean up after tests
    if (testUser?.id) {
      await prisma.refreshToken.deleteMany({
        where: { userId: testUser.id },
      });
      await prisma.user.delete({
        where: { id: testUser.id },
      }).catch(() => {});
    }
    await prisma.$disconnect();
  });

  // ============================================================================
  // PUBLIC ENDPOINTS
  // ============================================================================

  describe('POST /v2/auth/register', () => {
    it('should register a new user with required fields only', async () => {
      const userData = {
        email: testEmail,
        password: testPassword,
        fullName: 'Test User',
        username: faker.internet.userName().toLowerCase(),
      };

      const response = await request(app)
        .post('/v2/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toMatchObject({
        success: true,
        message: expect.stringContaining('registered'),
      });

      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('refreshToken');

      expect(response.body.data.user).toMatchObject({
        email: userData.email,
        fullName: userData.fullName,
        username: userData.username,
        role: 'GENERAL_USER',
      });

      // Save for later tests
      testUser = response.body.data.user;
      accessToken = response.body.data.token;
      refreshToken = response.body.data.refreshToken;

      // Verify user was created in database
      const createdUser = await prisma.user.findUnique({
        where: { email: userData.email },
      });
      expect(createdUser).toBeTruthy();
      expect(createdUser?.totalPoints).toBeGreaterThanOrEqual(100); // Registration bonus
    });

    it('should register with all optional fields', async () => {
      const userData = {
        email: faker.internet.email().toLowerCase(),
        password: testPassword,
        fullName: 'Full Test User',
        username: faker.internet.userName().toLowerCase(),
        phone: '+60123456789',
        nationality: 'Malaysian',
        countryOfResidence: 'Malaysia',
        currentCity: 'Kuala Lumpur',
        gender: 'male',
        dateOfBirth: '1990-01-15',
        referralCode: testUser.metadata?.referralCode || '',
      };

      const response = await request(app)
        .post('/v2/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toMatchObject({
        email: userData.email,
        fullName: userData.fullName,
        username: userData.username,
      });

      expect(response.body.data.user.profile).toBeDefined();
      expect(response.body.data.user.location).toBeDefined();
      expect(response.body.data.user.metadata).toBeDefined();

      // Clean up
      await prisma.user.delete({
        where: { email: userData.email },
      }).catch(() => {});
    });

    it('should reject duplicate email', async () => {
      const userData = {
        email: testEmail,
        password: testPassword,
        fullName: 'Duplicate User',
        username: faker.internet.userName().toLowerCase(),
      };

      const response = await request(app)
        .post('/v2/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toMatch(/email.*already/i);
    });

    it('should reject invalid email format', async () => {
      const userData = {
        email: 'invalid-email',
        password: testPassword,
        fullName: 'Test User',
        username: faker.internet.userName().toLowerCase(),
      };

      const response = await request(app)
        .post('/v2/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toMatch(/email/i);
    });

    it('should reject weak password', async () => {
      const userData = {
        email: faker.internet.email().toLowerCase(),
        password: 'weak',
        fullName: 'Test User',
        username: faker.internet.userName().toLowerCase(),
      };

      const response = await request(app)
        .post('/v2/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toMatch(/password/i);
    });

    it('should reject missing required fields', async () => {
      const response = await request(app)
        .post('/v2/auth/register')
        .send({
          email: faker.internet.email().toLowerCase(),
          // Missing password, fullName, username
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /v2/auth/login', () => {
    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/v2/auth/login')
        .send({
          email: testEmail,
          password: testPassword,
        })
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: expect.stringContaining('Login successful'),
      });

      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('refreshToken');

      expect(response.body.data.user).toMatchObject({
        email: testEmail,
        role: 'GENERAL_USER',
      });

      // Update tokens for other tests
      accessToken = response.body.data.token;
      refreshToken = response.body.data.refreshToken;
    });

    it('should reject invalid email', async () => {
      const response = await request(app)
        .post('/v2/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: testPassword,
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toMatch(/credential/i);
    });

    it('should reject wrong password', async () => {
      const response = await request(app)
        .post('/v2/auth/login')
        .send({
          email: testEmail,
          password: 'WrongPassword123!',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toMatch(/credential/i);
    });

    it('should reject missing fields', async () => {
      const response = await request(app)
        .post('/v2/auth/login')
        .send({
          email: testEmail,
          // Missing password
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /v2/auth/refresh-token', () => {
    it('should refresh token with valid refresh token', async () => {
      const response = await request(app)
        .post('/v2/auth/refresh-token')
        .send({
          refreshToken: refreshToken,
        })
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: expect.stringContaining('refreshed'),
      });

      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('refreshToken');

      // Update tokens
      accessToken = response.body.data.token;
      refreshToken = response.body.data.refreshToken;
    });

    it('should reject invalid refresh token', async () => {
      const response = await request(app)
        .post('/v2/auth/refresh-token')
        .send({
          refreshToken: 'invalid-token',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should reject missing refresh token', async () => {
      const response = await request(app)
        .post('/v2/auth/refresh-token')
        .send({})
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /v2/auth/forgot-password', () => {
    it('should send password reset email for existing user', async () => {
      const response = await request(app)
        .post('/v2/auth/forgot-password')
        .send({
          email: testEmail,
        })
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: expect.stringContaining('reset'),
      });
    });

    it('should return success even for non-existent email (security)', async () => {
      const response = await request(app)
        .post('/v2/auth/forgot-password')
        .send({
          email: 'nonexistent@example.com',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      // Should not reveal if email exists
    });

    it('should reject invalid email format', async () => {
      const response = await request(app)
        .post('/v2/auth/forgot-password')
        .send({
          email: 'invalid-email',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /v2/auth/reset-password', () => {
    let resetToken: string;

    beforeAll(async () => {
      // Generate a reset token
      const user = await prisma.user.findUnique({
        where: { email: testEmail },
      });

      if (user) {
        const token = Math.random().toString(36).substring(2, 15);
        await prisma.passwordResetToken.create({
          data: {
            id: Math.random().toString(36).substring(2, 15),
            userId: user.id,
            token: token,
            expiresAt: new Date(Date.now() + 3600000), // 1 hour
            ipAddress: '127.0.0.1',
          },
        });
        resetToken = token;
      }
    });

    it('should reset password with valid token', async () => {
      const newPassword = 'NewSecurePass123!';
      
      const response = await request(app)
        .post('/v2/auth/reset-password')
        .send({
          token: resetToken,
          password: newPassword,
        })
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: expect.stringContaining('reset'),
      });

      // Verify can login with new password
      const loginResponse = await request(app)
        .post('/v2/auth/login')
        .send({
          email: testEmail,
          password: newPassword,
        })
        .expect(200);

      expect(loginResponse.body.success).toBe(true);

      // Update tokens
      accessToken = loginResponse.body.data.token;
      refreshToken = loginResponse.body.data.refreshToken;
    });

    it('should reject invalid token', async () => {
      const response = await request(app)
        .post('/v2/auth/reset-password')
        .send({
          token: 'invalid-token',
          password: 'NewSecurePass123!',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should reject weak new password', async () => {
      const response = await request(app)
        .post('/v2/auth/reset-password')
        .send({
          token: resetToken,
          password: 'weak',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  // ============================================================================
  // PROTECTED ENDPOINTS
  // ============================================================================

  describe('GET /v2/auth/me', () => {
    it('should get current user profile with valid token', async () => {
      const response = await request(app)
        .get('/v2/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: expect.stringContaining('retrieved'),
      });

      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user).toMatchObject({
        email: testEmail,
        role: 'GENERAL_USER',
      });

      expect(response.body.data.user).toHaveProperty('profile');
      expect(response.body.data.user).toHaveProperty('location');
      expect(response.body.data.user).toHaveProperty('metadata');
    });

    it('should reject request without token', async () => {
      const response = await request(app)
        .get('/v2/auth/me')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should reject request with invalid token', async () => {
      const response = await request(app)
        .get('/v2/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /v2/auth/change-password', () => {
    const currentPassword = 'NewSecurePass123!'; // From reset password test
    const newPassword = 'AnotherSecurePass123!';

    it('should change password with valid current password', async () => {
      const response = await request(app)
        .post('/v2/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          currentPassword: currentPassword,
          newPassword: newPassword,
        })
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: expect.stringContaining('changed'),
      });

      // Verify can login with new password
      const loginResponse = await request(app)
        .post('/v2/auth/login')
        .send({
          email: testEmail,
          password: newPassword,
        })
        .expect(200);

      expect(loginResponse.body.success).toBe(true);
      
      // Update token
      accessToken = loginResponse.body.data.token;
      refreshToken = loginResponse.body.data.refreshToken;
    });

    it('should reject wrong current password', async () => {
      const response = await request(app)
        .post('/v2/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          currentPassword: 'WrongPassword123!',
          newPassword: 'NewSecurePass123!',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toMatch(/current password/i);
    });

    it('should reject weak new password', async () => {
      const response = await request(app)
        .post('/v2/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          currentPassword: newPassword,
          newPassword: 'weak',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should reject request without authentication', async () => {
      const response = await request(app)
        .post('/v2/auth/change-password')
        .send({
          currentPassword: newPassword,
          newPassword: 'NewSecurePass123!',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /v2/auth/logout', () => {
    it('should logout successfully', async () => {
      const response = await request(app)
        .post('/v2/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: expect.stringContaining('Logged out'),
      });

      // Verify refresh token is revoked
      const refreshResponse = await request(app)
        .post('/v2/auth/refresh-token')
        .send({
          refreshToken: refreshToken,
        })
        .expect(401);

      expect(refreshResponse.body.success).toBe(false);
    });

    it('should reject logout without authentication', async () => {
      const response = await request(app)
        .post('/v2/auth/logout')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    afterAll(async () => {
      // Re-login for next tests
      const loginResponse = await request(app)
        .post('/v2/auth/login')
        .send({
          email: testEmail,
          password: 'AnotherSecurePass123!',
        });

      accessToken = loginResponse.body.data.token;
      refreshToken = loginResponse.body.data.refreshToken;
    });
  });

  describe('POST /v2/auth/logout-all', () => {
    let secondToken: string;

    beforeAll(async () => {
      // Create another session
      const loginResponse = await request(app)
        .post('/v2/auth/login')
        .send({
          email: testEmail,
          password: 'AnotherSecurePass123!',
        });

      secondToken = loginResponse.body.data.refreshToken;
    });

    it('should logout from all devices', async () => {
      const response = await request(app)
        .post('/v2/auth/logout-all')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: expect.stringContaining('all devices'),
      });

      // Verify both refresh tokens are revoked
      const refresh1 = await request(app)
        .post('/v2/auth/refresh-token')
        .send({ refreshToken: refreshToken })
        .expect(401);

      const refresh2 = await request(app)
        .post('/v2/auth/refresh-token')
        .send({ refreshToken: secondToken })
        .expect(401);

      expect(refresh1.body.success).toBe(false);
      expect(refresh2.body.success).toBe(false);
    });

    it('should reject logout-all without authentication', async () => {
      const response = await request(app)
        .post('/v2/auth/logout-all')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  // ============================================================================
  // EDGE CASES & SECURITY
  // ============================================================================

  describe('Security Tests', () => {
    it('should not expose user existence on login', async () => {
      const response1 = await request(app)
        .post('/v2/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: testPassword,
        })
        .expect(401);

      const response2 = await request(app)
        .post('/v2/auth/login')
        .send({
          email: testEmail,
          password: 'WrongPassword123!',
        })
        .expect(401);

      // Both should have similar error messages
      expect(response1.body.error.message).toMatch(/credential/i);
      expect(response2.body.error.message).toMatch(/credential/i);
    });

    it('should sanitize error messages', async () => {
      const response = await request(app)
        .post('/v2/auth/register')
        .send({
          email: 'test@example.com',
          password: testPassword,
        })
        .expect(400);

      // Should not expose internal errors
      expect(response.body.error.message).not.toMatch(/prisma|database|sql/i);
    });

    it('should handle SQL injection attempts safely', async () => {
      const response = await request(app)
        .post('/v2/auth/login')
        .send({
          email: "admin' OR '1'='1",
          password: "password' OR '1'='1",
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should handle XSS attempts in registration', async () => {
      const xssPayload = '<script>alert("xss")</script>';
      
      const response = await request(app)
        .post('/v2/auth/register')
        .send({
          email: faker.internet.email().toLowerCase(),
          password: testPassword,
          fullName: xssPayload,
          username: faker.internet.userName().toLowerCase(),
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Validation Tests', () => {
    it('should validate phone number format', async () => {
      const response = await request(app)
        .post('/v2/auth/register')
        .send({
          email: faker.internet.email().toLowerCase(),
          password: testPassword,
          fullName: 'Test User',
          username: faker.internet.userName().toLowerCase(),
          phone: 'invalid-phone',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should validate date of birth format', async () => {
      const response = await request(app)
        .post('/v2/auth/register')
        .send({
          email: faker.internet.email().toLowerCase(),
          password: testPassword,
          fullName: 'Test User',
          username: faker.internet.userName().toLowerCase(),
          dateOfBirth: 'invalid-date',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should validate username format', async () => {
      const response = await request(app)
        .post('/v2/auth/register')
        .send({
          email: faker.internet.email().toLowerCase(),
          password: testPassword,
          fullName: 'Test User',
          username: 'invalid username with spaces',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should reject username that is too short', async () => {
      const response = await request(app)
        .post('/v2/auth/register')
        .send({
          email: faker.internet.email().toLowerCase(),
          password: testPassword,
          fullName: 'Test User',
          username: 'a',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should reject fullName that is too short', async () => {
      const response = await request(app)
        .post('/v2/auth/register')
        .send({
          email: faker.internet.email().toLowerCase(),
          password: testPassword,
          fullName: 'A',
          username: faker.internet.userName().toLowerCase(),
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});
