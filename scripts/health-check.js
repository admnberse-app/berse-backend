#!/usr/bin/env node

// Simple health check for Railway deployment
console.log('🏥 Railway Deployment Health Check');
console.log('==================================');

// Check Node.js version
console.log(`📦 Node.js version: ${process.version}`);

// Check environment variables
console.log(`🌍 NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
console.log(`🚀 PORT: ${process.env.PORT || 'not set'}`);
console.log(`💾 DATABASE_URL: ${process.env.DATABASE_URL ? 'set' : 'NOT SET'}`);

// Check Railway-specific variables
if (process.env.RAILWAY_ENVIRONMENT) {
  console.log(`🚂 Railway Environment: ${process.env.RAILWAY_ENVIRONMENT}`);
}
if (process.env.RAILWAY_PROJECT_NAME) {
  console.log(`📋 Railway Project: ${process.env.RAILWAY_PROJECT_NAME}`);
}

// Test database URL format
if (process.env.DATABASE_URL) {
  try {
    const url = new URL(process.env.DATABASE_URL);
    console.log(`🎯 Database Host: ${url.hostname}`);
    console.log(`🔌 Database Port: ${url.port}`);
    console.log(`🗄️  Database Name: ${url.pathname.substring(1)}`);
    
    if (url.hostname.includes('railway.internal')) {
      console.log('✅ Using Railway internal database connection');
    } else {
      console.log('⚠️  Using external database connection');
    }
  } catch (error) {
    console.error('❌ Invalid DATABASE_URL format:', error.message);
    process.exit(1);
  }
} else {
  console.error('❌ DATABASE_URL is missing - cannot connect to database');
  process.exit(1);
}

console.log('✅ Basic environment checks passed');
console.log('📡 Ready to test database connection...');