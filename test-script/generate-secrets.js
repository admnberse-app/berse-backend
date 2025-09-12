// Generate JWT secrets for Railway deployment
const crypto = require('crypto');

console.log('🔐 Generated Secrets for Railway Environment Variables:\n');

console.log('JWT_SECRET=' + crypto.randomBytes(32).toString('hex'));
console.log('JWT_REFRESH_SECRET=' + crypto.randomBytes(32).toString('hex'));
console.log('COOKIE_SECRET=' + crypto.randomBytes(16).toString('hex'));

console.log('\n📋 Copy these values to your Railway backend environment variables!');
console.log('⚠️  Keep these secrets secure and never share them publicly.');