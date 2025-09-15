const fetch = require('node-fetch');

// Test users (you'll need to replace with actual user tokens)
const API_URL = 'http://localhost:3000/api/v1';

async function testFriendRequest() {
  console.log('🧪 Testing Friend Request with Message Notifications\n');
  
  // First, let's get all users to see who we can test with
  try {
    // Get users to find test candidates
    const usersResponse = await fetch(`${API_URL}/users/all`, {
      headers: {
        'Authorization': 'Bearer YOUR_TOKEN_HERE', // Replace with actual token
        'Content-Type': 'application/json'
      }
    });
    
    if (usersResponse.ok) {
      const users = await usersResponse.json();
      console.log('📋 Available users for testing:');
      users.data.forEach(user => {
        console.log(`  - ${user.fullName} (ID: ${user.id})`);
      });
      console.log('\n');
    }
    
    // Instructions for manual testing
    console.log('📝 Manual Testing Instructions:');
    console.log('1. Log in as User A (sender)');
    console.log('2. Go to Connect screen and send a friend request to User B');
    console.log('3. Log in as User B (receiver)');
    console.log('4. Check Messages screen - you should see:');
    console.log('   - A message notification badge');
    console.log('   - A friend request message from User A');
    console.log('   - Accept/Decline buttons on the message');
    console.log('5. Click Accept or Decline to test the response');
    console.log('\n');
    
    console.log('🔍 What to verify:');
    console.log('✅ Friend request creates a message in receiver\'s inbox');
    console.log('✅ Message shows with unread badge if new');
    console.log('✅ Accept/Decline buttons appear for friend request messages');
    console.log('✅ Accepting creates mutual follow relationship');
    console.log('✅ Declining removes the follow request');
    console.log('\n');
    
    // Check if messages endpoint is accessible
    console.log('🌐 Checking API endpoints:');
    const endpoints = [
      '/messages/inbox',
      '/messages/sent',
      '/users/profile'
    ];
    
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`${API_URL}${endpoint}`, {
          headers: {
            'Authorization': 'Bearer YOUR_TOKEN_HERE', // Replace with actual token
            'Content-Type': 'application/json'
          }
        });
        console.log(`  ${endpoint}: ${response.status === 401 ? '🔒 Auth required (OK)' : response.ok ? '✅ Accessible' : '❌ Error'}`);
      } catch (error) {
        console.log(`  ${endpoint}: ❌ Not reachable`);
      }
    }
    
  } catch (error) {
    console.error('Error during testing:', error.message);
  }
}

// Run the test
testFriendRequest();

console.log('\n💡 To run automated tests:');
console.log('1. Replace YOUR_TOKEN_HERE with actual user tokens');
console.log('2. Run: node test-friend-request.js');
console.log('\n📱 Or test manually in the app by following the instructions above');