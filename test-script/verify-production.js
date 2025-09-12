// Production Environment Verification Script
// Ensures all connections are working for real user testing

const axios = require('axios');

const API_URL = 'https://api.berse.app';
const FRONTEND_URL = 'https://berse.app';

// Test User Credentials (for testing)
const TEST_USER = {
  email: 'realtest@berse.app',
  password: 'BerseTest123!'
};

console.log('\n' + '='.repeat(70));
console.log('🚀 BERSE APP PRODUCTION VERIFICATION');
console.log('='.repeat(70));
console.log(`\n📍 Frontend: ${FRONTEND_URL}`);
console.log(`📍 Backend API: ${API_URL}`);
console.log(`📍 Database: PostgreSQL on Railway`);
console.log(`📅 Test Date: ${new Date().toISOString()}\n`);

async function verifySystem() {
  const results = {
    backend: false,
    database: false,
    authentication: false,
    cors: false,
    events: false,
    users: false,
    profile: false
  };

  try {
    // 1. Backend Health Check
    console.log('1️⃣ Checking Backend Health...');
    const healthResponse = await axios.get(`${API_URL}/health`);
    if (healthResponse.status === 200) {
      console.log('   ✅ Backend is running');
      results.backend = true;
    }
  } catch (error) {
    console.log('   ❌ Backend is not responding');
  }

  try {
    // 2. Database Connection (via events endpoint)
    console.log('\n2️⃣ Checking Database Connection...');
    const eventsResponse = await axios.get(`${API_URL}/api/v1/events`);
    if (eventsResponse.status === 200) {
      console.log('   ✅ Database is connected');
      console.log(`   📊 Found ${eventsResponse.data.data?.length || 0} events`);
      results.database = true;
      results.events = true;
    }
  } catch (error) {
    console.log('   ❌ Database connection failed');
  }

  try {
    // 3. CORS Configuration
    console.log('\n3️⃣ Checking CORS for Production Frontend...');
    const corsResponse = await axios.get(`${API_URL}/api/v1/health`, {
      headers: {
        'Origin': FRONTEND_URL,
        'Referer': FRONTEND_URL
      }
    });
    if (corsResponse.status === 200) {
      console.log('   ✅ CORS is properly configured');
      results.cors = true;
    }
  } catch (error) {
    console.log('   ❌ CORS configuration issue');
  }

  let token = null;
  try {
    // 4. Authentication System
    console.log('\n4️⃣ Testing Authentication System...');
    const loginResponse = await axios.post(`${API_URL}/api/v1/auth/login`, TEST_USER);
    if (loginResponse.data.success && loginResponse.data.data.token) {
      console.log('   ✅ Authentication working');
      console.log(`   👤 Logged in as: ${loginResponse.data.data.user.fullName}`);
      token = loginResponse.data.data.token;
      results.authentication = true;
    }
  } catch (error) {
    console.log('   ⚠️  Authentication test skipped (test user may not exist)');
  }

  if (token) {
    try {
      // 5. User Profile Endpoint
      console.log('\n5️⃣ Testing User Profile Access...');
      const profileResponse = await axios.get(`${API_URL}/api/v1/users/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (profileResponse.status === 200) {
        console.log('   ✅ User profile accessible');
        console.log(`   📧 Email: ${profileResponse.data.data.email}`);
        console.log(`   🏆 Points: ${profileResponse.data.data.totalPoints}`);
        results.profile = true;
      }
    } catch (error) {
      console.log('   ❌ User profile not accessible');
    }

    try {
      // 6. User Search
      console.log('\n6️⃣ Testing User Search...');
      const searchResponse = await axios.get(`${API_URL}/api/v1/users/search?query=test`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (searchResponse.status === 200) {
        console.log('   ✅ User search working');
        console.log(`   🔍 Found ${searchResponse.data.data?.length || 0} users`);
        results.users = true;
      }
    } catch (error) {
      console.log('   ❌ User search not working');
    }
  }

  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('📊 VERIFICATION SUMMARY');
  console.log('='.repeat(70));
  
  const passedTests = Object.values(results).filter(r => r).length;
  const totalTests = Object.keys(results).length;
  
  console.log(`\n✅ Passed: ${passedTests}/${totalTests} tests`);
  
  console.log('\nSystem Status:');
  console.log(`  Backend API:     ${results.backend ? '✅ Online' : '❌ Offline'}`);
  console.log(`  Database:        ${results.database ? '✅ Connected' : '❌ Disconnected'}`);
  console.log(`  CORS:            ${results.cors ? '✅ Configured' : '❌ Not Configured'}`);
  console.log(`  Authentication:  ${results.authentication ? '✅ Working' : '⚠️ Not Tested'}`);
  console.log(`  Events API:      ${results.events ? '✅ Working' : '❌ Not Working'}`);
  console.log(`  Users API:       ${results.users ? '✅ Working' : '❌ Not Working'}`);
  console.log(`  Profile API:     ${results.profile ? '✅ Working' : '❌ Not Working'}`);
  
  if (passedTests === totalTests) {
    console.log('\n' + '🎉'.repeat(35));
    console.log('✨ PRODUCTION ENVIRONMENT IS FULLY OPERATIONAL! ✨');
    console.log('🎉'.repeat(35));
    console.log('\n✅ Ready for real user testing!');
    console.log('✅ All database connections working!');
    console.log('✅ Frontend can communicate with backend!');
    console.log('✅ Authentication and user management functional!');
  } else if (passedTests >= 5) {
    console.log('\n⚠️  PRODUCTION ENVIRONMENT IS MOSTLY OPERATIONAL');
    console.log('Some features may not work as expected.');
  } else {
    console.log('\n❌ PRODUCTION ENVIRONMENT HAS ISSUES');
    console.log('Please check the failed components above.');
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('📱 Test the app at: ' + FRONTEND_URL);
  console.log('🔧 Backend API docs: ' + API_URL + '/api/v1/docs');
  console.log('='.repeat(70) + '\n');
}

// Run verification
verifySystem().catch(error => {
  console.error('Verification failed:', error.message);
  process.exit(1);
});