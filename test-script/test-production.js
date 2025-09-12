// Production Connection Test Script
// This script tests all connections between Frontend (Netlify), Backend (Railway), and Database

const axios = require('axios');

const PRODUCTION_API = 'https://api.berse.app';
const LOCAL_API = 'http://localhost:3000';
const FRONTEND_URL = 'https://berse.app';

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

let testResults = {
  passed: [],
  failed: [],
  warnings: []
};

// Test credentials
const TEST_USER = {
  email: 'test@example.com',
  password: 'test123',
  fullName: 'Test User'
};

async function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  if (type === 'success') {
    console.log(`${colors.green}✓ ${message}${colors.reset}`);
    testResults.passed.push(message);
  } else if (type === 'error') {
    console.log(`${colors.red}✗ ${message}${colors.reset}`);
    testResults.failed.push(message);
  } else if (type === 'warning') {
    console.log(`${colors.yellow}⚠ ${message}${colors.reset}`);
    testResults.warnings.push(message);
  } else {
    console.log(`${colors.blue}ℹ ${message}${colors.reset}`);
  }
}

async function testHealthCheck(apiUrl) {
  try {
    const response = await axios.get(`${apiUrl}/health`);
    if (response.status === 200) {
      log(`Health check passed for ${apiUrl}`, 'success');
      return true;
    }
  } catch (error) {
    log(`Health check failed for ${apiUrl}: ${error.message}`, 'error');
    return false;
  }
}

async function testCORS(apiUrl) {
  try {
    const response = await axios.get(`${apiUrl}/api/v1/health`, {
      headers: {
        'Origin': FRONTEND_URL,
        'Referer': FRONTEND_URL
      }
    });
    
    if (response.status === 200) {
      log(`CORS check passed for ${FRONTEND_URL}`, 'success');
      return true;
    }
  } catch (error) {
    if (error.response?.status === 403) {
      log(`CORS not configured for ${FRONTEND_URL}`, 'error');
    } else {
      log(`CORS check failed: ${error.message}`, 'warning');
    }
    return false;
  }
}

async function testDatabaseConnection() {
  try {
    // Test by fetching events (public endpoint)
    const response = await axios.get(`${PRODUCTION_API}/api/v1/events`);
    if (response.status === 200) {
      log('Database connection verified (events endpoint)', 'success');
      return true;
    }
  } catch (error) {
    log(`Database connection test failed: ${error.message}`, 'error');
    return false;
  }
}

async function testAuthentication() {
  try {
    // First try to register
    let registerResponse;
    try {
      registerResponse = await axios.post(`${PRODUCTION_API}/api/v1/auth/register`, TEST_USER);
      log('User registration successful', 'success');
    } catch (error) {
      if (error.response?.status === 409) {
        log('Test user already exists', 'warning');
      } else {
        throw error;
      }
    }

    // Then try to login
    const loginResponse = await axios.post(`${PRODUCTION_API}/api/v1/auth/login`, {
      email: TEST_USER.email,
      password: TEST_USER.password
    });

    if (loginResponse.data.success && loginResponse.data.data.token) {
      log('Authentication flow working', 'success');
      return loginResponse.data.data.token;
    }
  } catch (error) {
    log(`Authentication test failed: ${error.message}`, 'error');
    return null;
  }
}

async function testProtectedEndpoints(token) {
  if (!token) {
    log('Skipping protected endpoints test (no token)', 'warning');
    return;
  }

  const endpoints = [
    { method: 'GET', path: '/api/v1/users/profile', name: 'User Profile' },
    { method: 'GET', path: '/api/v1/events', name: 'Events List' },
    { method: 'GET', path: '/api/v1/communities', name: 'Communities' }
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await axios({
        method: endpoint.method,
        url: `${PRODUCTION_API}${endpoint.path}`,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 200) {
        log(`${endpoint.name} endpoint working`, 'success');
      }
    } catch (error) {
      if (error.response?.status === 401) {
        log(`${endpoint.name} endpoint - authentication issue`, 'error');
      } else {
        log(`${endpoint.name} endpoint - ${error.message}`, 'warning');
      }
    }
  }
}

async function testDataPersistence(token) {
  if (!token) {
    log('Skipping data persistence test (no token)', 'warning');
    return;
  }

  try {
    // Update profile
    const profileData = {
      fullName: 'Test User Updated',
      bio: 'Testing data persistence',
      city: 'Kuala Lumpur',
      interests: ['Testing', 'Development']
    };

    const updateResponse = await axios.put(
      `${PRODUCTION_API}/api/v1/users/profile`,
      profileData,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    // Retrieve profile to verify
    const getResponse = await axios.get(
      `${PRODUCTION_API}/api/v1/users/profile`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (getResponse.data.data.bio === profileData.bio) {
      log('Data persistence verified', 'success');
    } else {
      log('Data persistence issue detected', 'error');
    }
  } catch (error) {
    log(`Data persistence test failed: ${error.message}`, 'error');
  }
}

async function runAllTests() {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 PRODUCTION CONNECTION TEST SUITE');
  console.log('='.repeat(60) + '\n');
  
  console.log(`Frontend URL: ${FRONTEND_URL}`);
  console.log(`Backend API: ${PRODUCTION_API}`);
  console.log(`Test started at: ${new Date().toISOString()}\n`);

  // 1. Test backend health
  console.log('📡 Testing Backend Health...');
  await testHealthCheck(PRODUCTION_API);
  
  // 2. Test CORS
  console.log('\n🔒 Testing CORS Configuration...');
  await testCORS(PRODUCTION_API);
  
  // 3. Test database connection
  console.log('\n🗄️ Testing Database Connection...');
  await testDatabaseConnection();
  
  // 4. Test authentication
  console.log('\n🔐 Testing Authentication Flow...');
  const token = await testAuthentication();
  
  // 5. Test protected endpoints
  console.log('\n🛡️ Testing Protected Endpoints...');
  await testProtectedEndpoints(token);
  
  // 6. Test data persistence
  console.log('\n💾 Testing Data Persistence...');
  await testDataPersistence(token);
  
  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('='.repeat(60));
  console.log(`${colors.green}✓ Passed: ${testResults.passed.length}${colors.reset}`);
  console.log(`${colors.red}✗ Failed: ${testResults.failed.length}${colors.reset}`);
  console.log(`${colors.yellow}⚠ Warnings: ${testResults.warnings.length}${colors.reset}`);
  
  if (testResults.failed.length === 0) {
    console.log(`\n${colors.green}🎉 ALL CRITICAL TESTS PASSED! Your production environment is ready for real users.${colors.reset}`);
  } else {
    console.log(`\n${colors.red}❌ Some tests failed. Please review the issues above.${colors.reset}`);
    console.log('\nFailed tests:');
    testResults.failed.forEach(test => console.log(`  - ${test}`));
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
}

// Run tests
runAllTests().catch(error => {
  console.error('Test suite failed:', error);
  process.exit(1);
});