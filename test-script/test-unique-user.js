// Test with guaranteed unique user
const API_URL = 'https://api.berse.app';

async function testUniqueUser() {
  console.log('🧪 Testing UNIQUE USER registration');
  console.log('=' .repeat(50));
  
  // Create truly unique email using random string
  const random = Math.random().toString(36).substring(7);
  const timestamp = Date.now();
  const uniqueUser = {
    email: `test_${random}_${timestamp}@example.com`,
    password: 'SecurePass123!',
    fullName: 'Points Test User',
    username: `user_${random}_${timestamp}`,
    phone: '+60199887766',
    nationality: 'Malaysia',
    countryOfResidence: 'Malaysia',
    city: 'Kuala Lumpur',
    gender: 'female',
    dateOfBirth: '1995-05-15'
  };
  
  console.log(`\n📧 Email: ${uniqueUser.email}`);
  console.log(`👤 Username: ${uniqueUser.username}`);
  
  try {
    const response = await fetch(`${API_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(uniqueUser)
    });
    
    const data = await response.json();
    
    if (response.ok && data.user) {
      console.log('\n✅ REGISTRATION SUCCESSFUL!');
      console.log('━' .repeat(50));
      console.log(`Points Balance: ${data.user.points} points`);
      console.log(`Membership ID:  ${data.user.membershipId}`);
      console.log('━' .repeat(50));
      
      if (data.user.points === 30) {
        console.log('\n🎉 SUCCESS: Points system is working correctly!');
        console.log('   ✓ User starts with 0 points');
        console.log('   ✓ Gets 30 points for registration');
        console.log('   ✓ Total: 30 points');
      } else if (data.user.points === 245) {
        console.log('\n❌ ERROR: Still showing 245 default points!');
        console.log('   The old bug is still present');
      } else {
        console.log(`\n⚠️ UNEXPECTED: User has ${data.user.points} points`);
      }
    } else {
      console.log('\n❌ Registration failed:', data.message || data.error || JSON.stringify(data));
    }
  } catch (error) {
    console.log('❌ Network error:', error.message);
  }
}

testUniqueUser();
