// Test with completely new user
const API_URL = 'https://api.berse.app';

async function testNewUser() {
  console.log('🧪 Testing NEW USER registration with points system');
  console.log('=' .repeat(50));
  
  const timestamp = Date.now();
  const newUser = {
    email: `newuser${timestamp}@test.com`,
    password: 'TestPassword123!',
    fullName: 'New Test User',
    username: `newtestuser${timestamp}`,
    phone: '+60123456789',
    nationality: 'Malaysia',
    countryOfResidence: 'Malaysia',
    city: 'Kuala Lumpur',
    gender: 'male',
    dateOfBirth: '1990-01-01'
  };
  
  console.log(`\n📧 Registering: ${newUser.email}`);
  
  try {
    const response = await fetch(`${API_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser)
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('\n✅ REGISTRATION SUCCESSFUL!');
      console.log('━' .repeat(50));
      console.log(`User ID:        ${data.user.id}`);
      console.log(`Email:          ${data.user.email}`);
      console.log(`Membership ID:  ${data.user.membershipId}`);
      console.log(`Points:         ${data.user.points}`);
      console.log('━' .repeat(50));
      
      if (data.user.points === 30) {
        console.log('\n🎉 POINTS SYSTEM WORKING CORRECTLY!');
        console.log('   New users start with 0 points + 30 registration bonus = 30 points');
      } else {
        console.log(`\n⚠️ POINTS ISSUE: User has ${data.user.points} points instead of 30`);
      }
    } else {
      console.log('❌ Registration failed:', data.message || data.error);
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

testNewUser();
