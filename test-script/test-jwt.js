require('dotenv').config();
const jwt = require('jsonwebtoken');

console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
console.log('JWT_SECRET length:', process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0);

try {
  const testPayload = {
    userId: 'test-id',
    email: 'test@example.com',
    role: 'USER',
    tokenType: 'access'
  };
  
  const token = jwt.sign(
    testPayload,
    process.env.JWT_SECRET,
    { 
      expiresIn: '15m',
      issuer: 'bersemuka-api',
      audience: 'bersemuka-client',
    }
  );
  
  console.log('Token generated successfully');
  console.log('Token length:', token.length);
  
  // Verify the token
  const decoded = jwt.verify(token, process.env.JWT_SECRET, {
    issuer: 'bersemuka-api',
    audience: 'bersemuka-client',
  });
  
  console.log('Token verified successfully:', decoded);
  
} catch (error) {
  console.error('JWT Error:', error.message);
  console.error('Stack:', error.stack);
}