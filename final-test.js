const API_URL = 'https://api.berse.app';

async function finalTest() {
  // Create super unique credentials
  const uuid = 'xxxxxxxx'.replace(/[x]/g, () => (Math.random() * 16 | 0).toString(16));
  const testUser = {
    email: `user_${uuid}@bersemuka.test`,
    password: 'BerseTest123!',
    fullName: 'Final Test User',
    username: `user_${uuid}`,
    phone: '+60111222333',
    nationality: 'Malaysia',
    countryOfResidence: 'Malaysia',
    city: 'Kuala Lumpur',
    gender: 'male',
    dateOfBirth: '1992-06-20'
  };
  
  console.log('🧪 FINAL POINTS TEST');
  console.log('━'.repeat(50));
  console.log('Email:', testUser.email);
  
  const response = await fetch(`${API_URL}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testUser)
  });
  
  const result = await response.text();
  console.log('\nRaw response:', result);
  
  try {
    const data = JSON.parse(result);
    if (response.status === 201 && data.user) {
      console.log('\n✅ SUCCESS - User created!');
      console.log(`Points: ${data.user.points}`);
      
      if (data.user.points === 30) {
        console.log('🎉 POINTS SYSTEM FIXED! Users get 30 points on registration');
      } else {
        console.log(`⚠️ Points issue: ${data.user.points} instead of 30`);
      }
    }
  } catch (e) {}
}

finalTest();
