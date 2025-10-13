#!/bin/bash

# Email Service Test Scripts
# Run these commands to test different email templates

echo "🧪 Email Service Test Suite"
echo "=========================="
echo ""

# Test 1: Simple Test Email
echo "1️⃣ Testing basic email..."
curl -X POST http://localhost:3000/api/v1/email/test \
  -H "Content-Type: application/json" \
  -d '{"to": "admn.berse@gmail.com"}'
echo -e "\n"

# You need to login first to get a token for these tests
# Let's first register/login to get a token

echo "2️⃣ Register a test user to get auth token..."
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@berse.app",
    "password": "Test123!@#",
    "fullName": "Test User"
  }')

echo "Register response: $REGISTER_RESPONSE"
echo ""

# Extract token from response (you may need to adjust this based on your response structure)
TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "⚠️  No token received. Trying to login instead..."
  LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{
      "email": "test@berse.app",
      "password": "Test123!@#"
    }')
  
  TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
  echo "Login response: $LOGIN_RESPONSE"
fi

echo "Token: $TOKEN"
echo ""

# If we have a token, test protected endpoints
if [ ! -z "$TOKEN" ]; then
  echo "3️⃣ Testing Welcome Email..."
  curl -X POST http://localhost:3000/api/v1/email/welcome \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
      "to": "admn.berse@gmail.com",
      "userName": "Ahmad",
      "exploreUrl": "http://localhost:5173/explore",
      "loginUrl": "http://localhost:5173/login"
    }'
  echo -e "\n"

  echo "4️⃣ Testing Verification Email..."
  curl -X POST http://localhost:3000/api/v1/email/verification \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
      "to": "admn.berse@gmail.com",
      "userName": "Ahmad",
      "verificationUrl": "http://localhost:5173/verify?token=abc123xyz",
      "verificationCode": "123456",
      "expiresIn": "24 hours"
    }'
  echo -e "\n"

  echo "5️⃣ Testing Password Reset Email..."
  curl -X POST http://localhost:3000/api/v1/email/password-reset \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
      "to": "admn.berse@gmail.com",
      "userName": "Ahmad",
      "resetUrl": "http://localhost:5173/reset-password?token=xyz789abc",
      "resetCode": "789012",
      "expiresIn": "1 hour"
    }'
  echo -e "\n"

  echo "6️⃣ Testing Event Invitation Email..."
  curl -X POST http://localhost:3000/api/v1/email/event \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
      "to": "admn.berse@gmail.com",
      "type": "invitation",
      "userName": "Ahmad",
      "eventTitle": "Berse Community Meetup",
      "eventDescription": "Join us for an amazing evening of networking and fun!",
      "eventDate": "2025-10-20T18:00:00Z",
      "eventTime": "6:00 PM",
      "eventLocation": "Cafe Downtown, KL",
      "hostName": "Sarah",
      "maxAttendees": 20,
      "eventUrl": "http://localhost:5173/events/123",
      "rsvpUrl": "http://localhost:5173/events/123/rsvp",
      "mapLink": "https://maps.google.com/?q=Cafe+Downtown+KL"
    }'
  echo -e "\n"

  echo "7️⃣ Testing Campaign Email..."
  curl -X POST http://localhost:3000/api/v1/email/campaign \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
      "recipients": ["admn.berse@gmail.com"],
      "subject": "Exciting News from Berse! 🎉",
      "headline": "New Features Just Launched",
      "content": "<p>We are thrilled to announce some amazing new features that will make your Berse experience even better!</p><ul><li>🎯 Enhanced matching algorithm</li><li>📅 Better event discovery</li><li>💬 Improved messaging</li></ul><p>Check them out now!</p>",
      "preheader": "Discover what'\''s new on Berse",
      "ctaText": "Explore Features",
      "ctaUrl": "http://localhost:5173/features",
      "footerText": "You'\''re receiving this because you'\''re an awesome member of the Berse community!"
    }'
  echo -e "\n"

  echo "8️⃣ Testing Notification Email..."
  curl -X POST http://localhost:3000/api/v1/email/notification \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
      "to": "admn.berse@gmail.com",
      "subject": "You have a new match! 🎉",
      "message": "<p>Great news! You'\''ve been matched with <strong>Sarah</strong> based on your shared interests in hiking and photography.</p><p>Start a conversation and plan your next adventure together!</p>",
      "actionUrl": "http://localhost:5173/matches/456",
      "actionText": "View Match"
    }'
  echo -e "\n"
else
  echo "❌ Could not get authentication token. Please check your credentials or manually test with a valid token."
fi

echo "✅ Test suite complete! Check your inbox at admn.berse@gmail.com"
