// Debug test to see actual response
const API_URL = 'https://api.berse.app';

async function debugTest() {
  const random = Math.random().toString(36).substring(7);
  const testUser = {
    email: `debug_${random}@test.com`,
    password: 'Pass123!',
    fullName: 'Debug User',
    username: `debug_${random}`,
    phone: '+60123456789',
    nationality: 'Malaysia',
    countryOfResidence: 'Malaysia',
    city: 'KL',
    gender: 'male',
    dateOfBirth: '1990-01-01'
  };
  
  console.log('Testing:', testUser.email);
  
  const response = await fetch(`${API_URL}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testUser)
  });
  
  const text = await response.text();
  console.log('\nStatus:', response.status);
  console.log('Response:', text);
  
  try {
    const data = JSON.parse(text);
    if (data.user) {
      console.log('\n✅ USER DATA:');
      console.log('Points:', data.user.points);
      console.log('Membership:', data.user.membershipId);
    }
  } catch (e) {
    console.log('Not JSON');
  }
}

debugTest();
