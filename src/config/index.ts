import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables
dotenv.config();

// Validation schema for environment variables
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url('Invalid database URL'),
  DATABASE_MAX_CONNECTIONS: z.string().default('20').transform((val) => parseInt(val, 10)),
  
  // Server
  PORT: z.string().optional().transform((val) => parseInt(val || '3100', 10)),
  NODE_ENV: z.enum(['development', 'staging', 'production', 'test']).default('development'),
  API_URL: z.string().url().optional(),
  
  // JWT
  JWT_SECRET: z.string().min(32, 'JWT secret must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT refresh secret must be at least 32 characters').optional(),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  
  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  
  // Redis
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.string().default('6379').transform((val) => parseInt(val, 10)),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_DB: z.string().default('0').transform((val) => parseInt(val, 10)),
  
  // Security
  COOKIE_SECRET: z.string().min(16, 'Cookie secret must be at least 16 characters'),
  BCRYPT_ROUNDS: z.string().default('12').transform((val) => parseInt(val, 10)),
  
  // File Upload
  MAX_FILE_SIZE: z.string().default('10mb'),
  UPLOAD_DIR: z.string().default('uploads'),
  
  // Digital Ocean Spaces
  SPACES_ENDPOINT: z.string().optional(),
  SPACES_BUCKET: z.string().optional(),
  SPACES_REGION: z.string().optional(),
  SPACES_ACCESS_KEY_ID: z.string().optional(),
  SPACES_SECRET_ACCESS_KEY: z.string().optional(),
  SPACES_CDN_ENDPOINT: z.string().optional(),
  
  // Email
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().default('587').transform((val) => parseInt(val, 10)),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  FROM_EMAIL: z.string().email().optional(),
  
  // External APIs
  GOOGLE_MAPS_API_KEY: z.string().optional(),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  
  // Payment APIs
  GOBARAQAH_API_KEY: z.string().optional(),
  IBANTU_API_KEY: z.string().optional(),
  SETEL_API_KEY: z.string().optional(),
  TOUCHNGO_API_KEY: z.string().optional(),
  BILLPLZ_API_KEY: z.string().optional(),
  TOYYIBPAY_API_KEY: z.string().optional(),
  
  // Monitoring
  SENTRY_DSN: z.string().optional(),
  GOOGLE_ANALYTICS_ID: z.string().optional(),
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().default('900000').transform((val) => parseInt(val, 10)),
  RATE_LIMIT_MAX_REQUESTS: z.string().default('100').transform((val) => parseInt(val, 10)),
  RATE_LIMIT_AUTH_MAX: z.string().default('5').transform((val) => parseInt(val, 10)),
  RATE_LIMIT_LOGIN_MAX: z.string().default('3').transform((val) => parseInt(val, 10)),
  
  // Security
  SESSION_TIMEOUT_MINUTES: z.string().default('60').transform((val) => parseInt(val, 10)),
  MAX_LOGIN_ATTEMPTS: z.string().default('5').transform((val) => parseInt(val, 10)),
  ACCOUNT_LOCKOUT_MINUTES: z.string().default('30').transform((val) => parseInt(val, 10)),
  
  // Feature Flags
  ENABLE_REGISTRATION: z.string().default('true').transform((val) => val === 'true'),
  ENABLE_EMAIL_VERIFICATION: z.string().default('false').transform((val) => val === 'true'),
  ENABLE_SMS_VERIFICATION: z.string().default('false').transform((val) => val === 'true'),
  ENABLE_OAUTH: z.string().default('false').transform((val) => val === 'true'),
  ENABLE_MFA: z.string().default('false').transform((val) => val === 'true'),
  
  // Webhooks
  WEBHOOK_SECRET: z.string().optional(),
  PAYMENT_WEBHOOK_URL: z.string().default('/api/webhooks/payment'),
  
  // Development/Testing
  TEST_DATABASE_URL: z.string().optional(),
  ENABLE_DEBUG_LOGS: z.string().default('false').transform((val) => val === 'true'),
  MOCK_EXTERNAL_APIS: z.string().default('false').transform((val) => val === 'true'),
  DISABLE_RATE_LIMIT: z.string().default('false').transform((val) => val === 'true'),
});

// Validate and parse environment variables
let env: z.infer<typeof envSchema>;

try {
  env = envSchema.parse(process.env);
} catch (error) {
  console.error('Environment validation failed:');
  if (error instanceof z.ZodError) {
    error.issues.forEach((err: any) => {
      console.error(`${err.path.join('.')}: ${err.message}`);
    });
  }
  process.exit(1);
}

// Helper function to parse file size strings
const parseFileSize = (size: string): number => {
  const units: Record<string, number> = {
    b: 1,
    kb: 1024,
    mb: 1024 * 1024,
    gb: 1024 * 1024 * 1024,
  };
  
  const match = size.toLowerCase().match(/^(\d+)(b|kb|mb|gb)?$/);
  if (!match) return 10 * 1024 * 1024; // Default 10MB
  
  const num = parseInt(match[1]);
  const unit = match[2] || 'b';
  return num * units[unit];
};

// Configuration object
export const config = {
  // Environment
  env: env.NODE_ENV,
  isDevelopment: env.NODE_ENV === 'development',
  isStaging: env.NODE_ENV === 'staging',
  isProduction: env.NODE_ENV === 'production',
  isTest: env.NODE_ENV === 'test',
  
  // Server
  port: env.PORT,
  apiUrl: env.API_URL,
  
  // Database
  database: {
    url: env.DATABASE_URL,
    maxConnections: env.DATABASE_MAX_CONNECTIONS,
    testUrl: env.TEST_DATABASE_URL,
  },
  
  // JWT
  jwt: {
    secret: env.JWT_SECRET,
    refreshSecret: env.JWT_REFRESH_SECRET || env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRES_IN,
    refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
  },
  
  // CORS
  cors: {
    origin: env.CORS_ORIGIN.split(',').map((origin) => origin.trim()),
  },
  
  // Redis
  redis: {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    password: env.REDIS_PASSWORD,
    db: env.REDIS_DB,
  },
  
  // Security
  security: {
    cookieSecret: env.COOKIE_SECRET,
    bcryptRounds: env.BCRYPT_ROUNDS,
    sessionTimeoutMinutes: env.SESSION_TIMEOUT_MINUTES,
    maxLoginAttempts: env.MAX_LOGIN_ATTEMPTS,
    accountLockoutMinutes: env.ACCOUNT_LOCKOUT_MINUTES,
  },
  
  // File Upload
  upload: {
    maxFileSize: parseFileSize(env.MAX_FILE_SIZE),
    uploadDir: env.UPLOAD_DIR,
  },
  
  // Digital Ocean Spaces
  spaces: {
    endpoint: env.SPACES_ENDPOINT || 'https://sgp1.digitaloceanspaces.com',
    bucket: env.SPACES_BUCKET || '',
    region: env.SPACES_REGION || 'sgp1',
    accessKeyId: env.SPACES_ACCESS_KEY_ID || '',
    secretAccessKey: env.SPACES_SECRET_ACCESS_KEY || '',
    cdnEndpoint: env.SPACES_CDN_ENDPOINT,
  },
  
  // Email
  email: {
    smtp: {
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
    fromEmail: env.FROM_EMAIL,
  },
  
  // External APIs
  apis: {
    googleMaps: env.GOOGLE_MAPS_API_KEY,
    cloudinary: {
      cloudName: env.CLOUDINARY_CLOUD_NAME,
      apiKey: env.CLOUDINARY_API_KEY,
      apiSecret: env.CLOUDINARY_API_SECRET,
    },
    payments: {
      gobaraqah: env.GOBARAQAH_API_KEY,
      ibantu: env.IBANTU_API_KEY,
      setel: env.SETEL_API_KEY,
      touchngo: env.TOUCHNGO_API_KEY,
      billplz: env.BILLPLZ_API_KEY,
      toyyibpay: env.TOYYIBPAY_API_KEY,
    },
  },
  
  // Monitoring
  monitoring: {
    sentryDsn: env.SENTRY_DSN,
    googleAnalyticsId: env.GOOGLE_ANALYTICS_ID,
  },
  
  // Rate Limiting
  rateLimiting: {
    disabled: env.DISABLE_RATE_LIMIT,
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
    authMax: env.RATE_LIMIT_AUTH_MAX,
    loginMax: env.RATE_LIMIT_LOGIN_MAX,
  },
  
  // Feature Flags
  features: {
    registration: env.ENABLE_REGISTRATION,
    emailVerification: env.ENABLE_EMAIL_VERIFICATION,
    smsVerification: env.ENABLE_SMS_VERIFICATION,
    oauth: env.ENABLE_OAUTH,
    mfa: env.ENABLE_MFA,
  },
  
  // Webhooks
  webhooks: {
    secret: env.WEBHOOK_SECRET,
    paymentUrl: env.PAYMENT_WEBHOOK_URL,
  },
  
  // Development
  development: {
    enableDebugLogs: env.ENABLE_DEBUG_LOGS,
    mockExternalApis: env.MOCK_EXTERNAL_APIS,
  },
};

// Validate required configurations based on environment
if (config.isProduction) {
  const requiredProdVars = [
    'DATABASE_URL',
    'JWT_SECRET',
    'COOKIE_SECRET',
  ];
  
  const missing = requiredProdVars.filter((key) => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('Missing required production environment variables:', missing);
    process.exit(1);
  }
}

export default config;