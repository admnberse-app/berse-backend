const API_URL = 'https://api.berse.app';

async function checkPoints() {
  // Login with the user we just created
  const loginData = {
    email: 'user_0f4915a4@bersemuka.test',
    password: 'BerseTest123!'
  };
  
  console.log('🔐 Logging in to check points...');
  
  const response = await fetch(`${API_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(loginData)
  });
  
  const result = await response.text();
  console.log('\nLogin response:', result);
  
  try {
    const data = JSON.parse(result);
    if (data.user && data.user.points !== undefined) {
      console.log('\n📊 POINTS CHECK:');
      console.log(`User has ${data.user.points} points`);
      
      if (data.user.points === 30) {
        console.log('✅ PERFECT! Points system is working correctly!');
      } else if (data.user.points === 0) {
        console.log('⚠️ User has 0 points - registration bonus not applied');
      } else {
        console.log(`⚠️ Unexpected points value: ${data.user.points}`);
      }
    }
  } catch (e) {
    console.log('Error parsing response');
  }
}

checkPoints();
