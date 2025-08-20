// Test CORS configuration on production API
const axios = require('axios');

async function testCORS() {
  console.log('Testing CORS on production API...\n');
  
  try {
    // Test OPTIONS preflight request (what browser sends first)
    console.log('1. Testing OPTIONS preflight request:');
    const optionsResponse = await axios({
      method: 'OPTIONS',
      url: 'https://api.berse.app/api/v1/users/profile',
      headers: {
        'Origin': 'https://berse.app',
        'Access-Control-Request-Method': 'PUT',
        'Access-Control-Request-Headers': 'authorization,content-type'
      }
    });
    
    console.log('✅ OPTIONS request successful');
    console.log('CORS headers received:');
    console.log('- Access-Control-Allow-Origin:', optionsResponse.headers['access-control-allow-origin']);
    console.log('- Access-Control-Allow-Methods:', optionsResponse.headers['access-control-allow-methods']);
    console.log('- Access-Control-Allow-Headers:', optionsResponse.headers['access-control-allow-headers']);
    console.log('- Access-Control-Allow-Credentials:', optionsResponse.headers['access-control-allow-credentials']);
    
  } catch (error) {
    if (error.response) {
      console.log('❌ OPTIONS request failed with status:', error.response.status);
      console.log('Response headers:', error.response.headers);
      console.log('Response data:', error.response.data);
    } else {
      console.log('❌ Network error:', error.message);
    }
  }
  
  console.log('\n2. Testing actual API endpoint:');
  try {
    // Test actual endpoint (will fail without auth, but we can see CORS headers)
    const response = await axios({
      method: 'GET',
      url: 'https://api.berse.app/health',
      headers: {
        'Origin': 'https://berse.app'
      }
    });
    
    console.log('✅ Health check successful');
    console.log('Response:', response.data);
    console.log('CORS header:', response.headers['access-control-allow-origin']);
    
  } catch (error) {
    if (error.response) {
      console.log('Response status:', error.response.status);
      console.log('CORS header:', error.response.headers['access-control-allow-origin']);
    } else {
      console.log('❌ Network error:', error.message);
    }
  }
  
  console.log('\n3. Testing if Railway backend is running:');
  try {
    const response = await axios.get('https://api.berse.app/');
    console.log('✅ Backend is running');
    console.log('Response:', response.data);
  } catch (error) {
    console.log('❌ Backend might be down or having issues');
    console.log('Error:', error.message);
  }
}

testCORS();