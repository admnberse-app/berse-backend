import 'dotenv/config';
import JwtManager from './src/utils/jwt';

async function testJwtManager() {
  try {
    const user = {
      id: '9106ed1a-5214-4b36-82d9-1cf958c7ca02', // Real user ID from database
      email: 'zaydmahdaly@ahlumran.org',
      role: 'USER'
    };
    
    console.log('Testing JwtManager.generateTokenPair...');
    const tokenPair = await JwtManager.generateTokenPair(user);
    
    console.log('Token pair generated successfully:');
    console.log('Access token length:', tokenPair.accessToken.length);
    console.log('Refresh token length:', tokenPair.refreshToken.length);
    
    // Test verify
    console.log('\nTesting token verification...');
    const verified = await JwtManager.verifyAccessToken(tokenPair.accessToken);
    console.log('Access token verified:', verified);
    
  } catch (error) {
    console.error('JwtManager Error:', error);
    if (error instanceof Error) {
      console.error('Stack:', error.stack);
    }
  }
  
  process.exit(0);
}

testJwtManager();