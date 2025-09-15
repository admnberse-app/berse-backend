// Test Railway API endpoints
const API_URL = 'https://api.berse.app';

async function testAPI() {
  console.log('🧪 Testing BerseMuka API at:', API_URL);
  console.log('=' .repeat(50));
  
  // Test 1: Health check
  console.log('\n1️⃣ Testing health endpoint...');
  try {
    const health = await fetch(`${API_URL}/health`);
    const healthData = await health.text();
    console.log(`✅ Health check: ${health.status} - ${healthData}`);
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
  }
  
  // Test 2: Registration with points system
  console.log('\n2️⃣ Testing registration (should give 30 points)...');
  const testUser = {
    email: `test${Date.now()}@example.com`,
    password: 'Password123!',
    fullName: 'Test User',
    username: `testuser${Date.now()}`,
    phone: '+60123456789',
    nationality: 'Malaysia',
    countryOfResidence: 'Malaysia',
    city: 'Kuala Lumpur',
    gender: 'male',
    dateOfBirth: '1990-01-01'
  };
  
  try {
    const register = await fetch(`${API_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    
    const text = await register.text();
    let registerData;
    
    try {
      registerData = JSON.parse(text);
    } catch (e) {
      console.log('❌ Invalid JSON response:', text);
      return;
    }
    
    if (register.ok) {
      console.log('✅ Registration successful!');
      console.log(`   - User ID: ${registerData.user.id}`);
      console.log(`   - Points: ${registerData.user.points} (should be 30)`);
      console.log(`   - Membership ID: ${registerData.user.membershipId}`);
      
      if (registerData.user.points === 30) {
        console.log('   ✅ Points system working correctly!');
      } else {
        console.log(`   ⚠️ Points incorrect: ${registerData.user.points} instead of 30`);
      }
    } else {
      console.log('❌ Registration failed:', registerData.message || registerData.error || text);
    }
  } catch (error) {
    console.log('❌ Registration error:', error.message);
    console.log('   Details:', error);
  }
  
  // Test 3: Login
  console.log('\n3️⃣ Testing login...');
  try {
    const login = await fetch(`${API_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password
      })
    });
    
    const text = await login.text();
    let loginData;
    
    try {
      loginData = JSON.parse(text);
    } catch (e) {
      console.log('❌ Invalid JSON response:', text);
      return;
    }
    
    if (login.ok) {
      console.log('✅ Login successful!');
      console.log(`   - Token received: ${loginData.token ? 'Yes' : 'No'}`);
      console.log(`   - User points: ${loginData.user.points}`);
    } else {
      console.log('❌ Login failed:', loginData.message || loginData.error || text);
    }
  } catch (error) {
    console.log('❌ Login error:', error.message);
    console.log('   Details:', error);
  }
  
  console.log('\n' + '=' .repeat(50));
  console.log('🏁 API tests completed!');
}

// Run tests
testAPI().catch(console.error);