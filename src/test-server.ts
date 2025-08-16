import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { prisma } from './config/database';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const app: express.Application = express();
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:3003'];
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all origins for testing
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['set-cookie'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));
app.use(express.json());

// Direct registration endpoint without any rate limiting
// @ts-ignore - Express 5 type issue
app.post('/direct-register', async (req: Request, res: Response) => {
  try {
    const { email, password, fullName, username, phone, nationality, countryOfResidence, city, gender, dateOfBirth } = req.body;
    
    console.log('Registration attempt:', { email, fullName, username });
    
    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    });
    
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'User with this email or username already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        fullName,
        username,
        phone,
        nationality,
        countryOfResidence,
        city,
        gender,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        role: 'GENERAL_USER'
      }
    });
    
    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'default-secret-key',
      { expiresIn: '7d' }
    );
    
    console.log('User created successfully:', user.id, user.email);
    
    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          username: user.username
        },
        token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Direct login endpoint
// @ts-ignore - Express 5 type issue
app.post('/direct-login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    
    console.log('Password provided:', password);
    console.log('User found, checking password...');
    const validPassword = await bcrypt.compare(password, user.password);
    console.log('Password valid:', validPassword);
    if (!validPassword) {
      console.log('Password validation failed!');
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'default-secret-key',
      { expiresIn: '7d' }
    );
    
    console.log('User logged in:', user.email);
    
    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          username: user.username
        },
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Standard API endpoints for frontend compatibility
// @ts-ignore
app.post('/api/v1/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    console.log('Login attempt via API:', email);
    console.log('Request headers:', req.headers);
    console.log('Request body:', req.body);
    
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    
    console.log('Password provided:', password);
    console.log('User found, checking password...');
    const validPassword = await bcrypt.compare(password, user.password);
    console.log('Password valid:', validPassword);
    if (!validPassword) {
      console.log('Password validation failed!');
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'default-secret-key',
      { expiresIn: '7d' }
    );
    
    console.log('User logged in via API:', user.email);
    
    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          username: user.username,
          role: user.role || 'USER'
        },
        token
      }
    });
  } catch (error) {
    console.error('API Login error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// @ts-ignore
app.post('/api/v1/auth/register', async (req: Request, res: Response) => {
  try {
    const { email, password, fullName, username, phone, nationality, countryOfResidence, city, gender, dateOfBirth } = req.body;
    
    console.log('Registration attempt via API:', { email, fullName, username });
    
    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    });
    
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'User with this email or username already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        fullName,
        username,
        phone,
        nationality,
        countryOfResidence,
        city,
        gender,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        role: 'GENERAL_USER'
      }
    });
    
    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'default-secret-key',
      { expiresIn: '7d' }
    );
    
    console.log('User registered via API:', user.id, user.email);
    
    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          username: user.username,
          role: user.role || 'USER'
        },
        token
      }
    });
  } catch (error) {
    console.error('API Registration error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Check users endpoint
app.get('/check-users', async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        username: true,
        createdAt: true
      }
    });
    res.json({ users, count: users.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = 3003;
app.listen(PORT, () => {
  console.log(`Direct test server running on http://localhost:${PORT}`);
  console.log(`Test endpoints:`);
  console.log(`  POST http://localhost:${PORT}/api/v1/auth/register`);
  console.log(`  POST http://localhost:${PORT}/api/v1/auth/login`);
  console.log(`  POST http://localhost:${PORT}/direct-register`);
  console.log(`  POST http://localhost:${PORT}/direct-login`);
  console.log(`  GET  http://localhost:${PORT}/check-users`);
});

// Keep the process alive
process.on('SIGINT', () => {
  console.log('Server shutting down...');
  process.exit(0);
});