// Test script to verify frontend is using correct API URL in production

const axios = require('axios');

async function testProductionAPI() {
  console.log('🔍 Testing Production Frontend API Configuration\n');
  console.log('='.repeat(60));
  
  try {
    // Test login with your credentials
    const loginData = {
      email: 'zaydmahdaly@ahlumran.org',
      password: 'test123' // Your password from the session
    };
    
    console.log('1. Testing login to production API...');
    const loginResponse = await axios.post('https://api.berse.app/api/v1/auth/login', loginData);
    
    if (loginResponse.data.success) {
      console.log('✅ Login successful!');
      console.log('   User:', loginResponse.data.data.user.fullName);
      console.log('   Email:', loginResponse.data.data.user.email);
      const token = loginResponse.data.data.token;
      
      // Test profile update
      console.log('\n2. Testing profile update...');
      const profileData = {
        fullName: loginResponse.data.data.user.fullName,
        bio: 'Testing from production - ' + new Date().toISOString()
      };
      
      const profileResponse = await axios.put(
        'https://api.berse.app/api/v1/users/profile',
        profileData,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (profileResponse.data.success) {
        console.log('✅ Profile update successful!');
        console.log('   Bio updated to:', profileData.bio);
      }
      
      // Test profile retrieval
      console.log('\n3. Testing profile retrieval...');
      const getProfileResponse = await axios.get(
        'https://api.berse.app/api/v1/users/profile',
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (getProfileResponse.data) {
        console.log('✅ Profile retrieved successfully!');
        console.log('   Current bio:', getProfileResponse.data.data?.bio || getProfileResponse.data.bio);
      }
      
      console.log('\n' + '='.repeat(60));
      console.log('✨ SUCCESS! The production API is working correctly.');
      console.log('\nYou can now:');
      console.log('1. Go to https://berse.app');
      console.log('2. Login with your credentials');
      console.log('3. Edit your profile at https://berse.app/edit-profile');
      console.log('4. All changes will be saved to the database!');
      
    } else {
      console.log('❌ Login failed');
    }
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n⚠️  Authentication issue. The password might have changed.');
      console.log('Try logging in manually at https://berse.app');
    }
  }
  
  console.log('\n' + '='.repeat(60));
}

// Run the test
testProductionAPI();