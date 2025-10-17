#!/bin/bash

# Test Card Game Endpoints
# Make sure server is running on http://localhost:3001
# 
# IMPORTANT NOTES:
# - sessionNumber field is REQUIRED (must be >= 1)
# - Reply endpoint uses 'text' field, NOT 'content'
# - topicTitle and questionText are REQUIRED fields

BASE_URL="http://localhost:3001/v2/cardgame"
AUTH_TOKEN=""

echo "🎮 Testing Card Game API Endpoints"
echo "=================================="
echo ""

# First, you need to login to get a token
echo "⚠️  You need to login first to get an authentication token."
echo "Run: curl -X POST http://localhost:3001/v2/auth/login -H 'Content-Type: application/json' -d '{\"email\":\"your-email@example.com\",\"password\":\"your-password\"}'"
echo ""
echo "Then set the token:"
echo "export AUTH_TOKEN='your-token-here'"
echo ""

if [ -z "$AUTH_TOKEN" ]; then
  echo "❌ AUTH_TOKEN not set. Please login and set the token first."
  exit 1
fi

echo "✅ Using AUTH_TOKEN: ${AUTH_TOKEN:0:20}..."
echo ""

# Test 1: Submit feedback
echo "📝 Test 1: Submit Feedback"
echo "POST $BASE_URL/feedback"
echo "NOTE: sessionNumber, topicTitle, and questionText are REQUIRED"
curl -X POST "$BASE_URL/feedback" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "topicId": "communication-skills",
    "topicTitle": "Communication Skills",
    "sessionNumber": 1,
    "questionId": "q-001",
    "questionText": "How do you handle difficult conversations?",
    "rating": 5,
    "comment": "Great question! Really made me think about my approach.",
    "isHelpful": true
  }' | jq .
echo ""
echo "---"
echo ""

# Test 2: Get all feedback
echo "📋 Test 2: Get All Feedback (with pagination)"
echo "GET $BASE_URL/feedback?page=1&limit=10"
curl -X GET "$BASE_URL/feedback?page=1&limit=10" \
  -H "Authorization: Bearer $AUTH_TOKEN" | jq .
echo ""
echo "---"
echo ""

# Test 3: Get feedback with filters
echo "🔍 Test 3: Get Feedback with Filters (rating >= 4)"
echo "GET $BASE_URL/feedback?minRating=4&sortBy=rating&sortOrder=desc"
curl -X GET "$BASE_URL/feedback?minRating=4&sortBy=rating&sortOrder=desc" \
  -H "Authorization: Bearer $AUTH_TOKEN" | jq .
echo ""
echo "---"
echo ""

# Test 4: Get feedback by topic
echo "🎯 Test 4: Get Feedback by Topic"
echo "GET $BASE_URL/feedback?topicId=topic-001"
curl -X GET "$BASE_URL/feedback?topicId=topic-001" \
  -H "Authorization: Bearer $AUTH_TOKEN" | jq .
echo ""
echo "---"
echo ""

# Test 5: Get feedback by ID (you'll need to replace FEEDBACK_ID with actual ID from previous responses)
echo "🆔 Test 5: Get Feedback by ID"
echo "Replace FEEDBACK_ID with an actual ID from above"
# curl -X GET "$BASE_URL/feedback/FEEDBACK_ID" \
#   -H "Authorization: Bearer $AUTH_TOKEN" | jq .
echo "Skipped - requires actual feedback ID"
echo ""
echo "---"
echo ""

# Test 6: Update feedback (replace FEEDBACK_ID)
echo "✏️  Test 6: Update Feedback"
echo "Replace FEEDBACK_ID with an actual ID"
# curl -X PATCH "$BASE_URL/feedback/FEEDBACK_ID" \
#   -H "Authorization: Bearer $AUTH_TOKEN" \
#   -H "Content-Type: application/json" \
#   -d '{
#     "rating": 4,
#     "comment": "Updated: Still a great question but rating adjusted.",
#     "isHelpful": true
#   }' | jq .
echo "Skipped - requires actual feedback ID"
echo ""
echo "---"
echo ""

# Test 7: Toggle upvote (replace FEEDBACK_ID)
echo "👍 Test 7: Toggle Upvote"
echo "Replace FEEDBACK_ID with an actual ID"
# curl -X POST "$BASE_URL/feedback/FEEDBACK_ID/upvote" \
#   -H "Authorization: Bearer $AUTH_TOKEN" | jq .
echo "Skipped - requires actual feedback ID"
echo ""
echo "---"
echo ""

# Test 8: Add reply (replace FEEDBACK_ID)
echo "💬 Test 8: Add Reply to Feedback"
echo "Replace FEEDBACK_ID with an actual ID"
echo "⚠️  IMPORTANT: Use 'text' field, NOT 'content'"
# curl -X POST "$BASE_URL/feedback/FEEDBACK_ID/replies" \
#   -H "Authorization: Bearer $AUTH_TOKEN" \
#   -H "Content-Type: application/json" \
#   -d '{
#     "text": "I agree! This question really helped me reflect."
#   }' | jq .
echo "Skipped - requires actual feedback ID"
echo ""
echo "---"
echo ""

# Test 9: Get topic statistics
echo "📊 Test 9: Get Topic Statistics"
echo "GET $BASE_URL/stats/topics/topic-001"
curl -X GET "$BASE_URL/stats/topics/topic-001" \
  -H "Authorization: Bearer $AUTH_TOKEN" | jq .
echo ""
echo "---"
echo ""

# Test 10: Get all topics statistics
echo "📈 Test 10: Get All Topics Statistics"
echo "GET $BASE_URL/stats/topics"
curl -X GET "$BASE_URL/stats/topics" \
  -H "Authorization: Bearer $AUTH_TOKEN" | jq .
echo ""
echo "---"
echo ""

# Test 11: Get detailed topic analytics
echo "🔬 Test 11: Get Detailed Topic Analytics"
echo "GET $BASE_URL/analytics/topics/topic-001"
curl -X GET "$BASE_URL/analytics/topics/topic-001" \
  -H "Authorization: Bearer $AUTH_TOKEN" | jq .
echo ""
echo "---"
echo ""

# Test 12: Get current user statistics
echo "👤 Test 12: Get My Statistics"
echo "GET $BASE_URL/stats/me"
curl -X GET "$BASE_URL/stats/me" \
  -H "Authorization: Bearer $AUTH_TOKEN" | jq .
echo ""
echo "---"
echo ""

echo "✅ Card Game API Tests Completed!"
echo ""
echo "📝 Note: Some tests were skipped as they require actual IDs from previous responses."
echo "   Run them manually by replacing FEEDBACK_ID with actual values."
echo ""
echo "🔗 Check Swagger UI for more details: http://localhost:3001/api-docs"
