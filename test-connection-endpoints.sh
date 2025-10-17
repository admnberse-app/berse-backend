#!/bin/bash

# Connection Module Test Script
# Tests all core connection endpoints

echo "🧪 Connection Module API Test"
echo "=============================="
echo ""

# Configuration
BASE_URL="http://localhost:3000/v2"
TOKEN="${1:-YOUR_JWT_TOKEN}"

if [ "$TOKEN" = "YOUR_JWT_TOKEN" ]; then
  echo "⚠️  Usage: ./test-connection-endpoints.sh <JWT_TOKEN>"
  echo "   Get token by logging in first"
  exit 1
fi

echo "📋 Using token: ${TOKEN:0:20}..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test function
test_endpoint() {
  local method=$1
  local endpoint=$2
  local data=$3
  local description=$4
  
  echo -e "${BLUE}Testing:${NC} $description"
  echo "  $method $endpoint"
  
  if [ -n "$data" ]; then
    response=$(curl -s -w "\n%{http_code}" -X "$method" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "$data" \
      "$BASE_URL$endpoint")
  else
    response=$(curl -s -w "\n%{http_code}" -X "$method" \
      -H "Authorization: Bearer $TOKEN" \
      "$BASE_URL$endpoint")
  fi
  
  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | head -n-1)
  
  if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
    echo -e "  ${GREEN}✓ Success${NC} (HTTP $http_code)"
    echo "  Response: $(echo "$body" | jq -c '.' 2>/dev/null || echo "$body")"
  else
    echo -e "  ${RED}✗ Failed${NC} (HTTP $http_code)"
    echo "  Response: $body"
  fi
  echo ""
}

echo "=== Core Connection Tests ==="
echo ""

# 1. Get current user's connections
test_endpoint "GET" "/connections" "" "Get all connections"

# 2. Get pending connection requests
test_endpoint "GET" "/connections?status=PENDING" "" "Get pending requests"

# 3. Get connection statistics
test_endpoint "GET" "/connections/stats" "" "Get connection stats"

# 4. Send connection request (requires target user ID)
# Uncomment and add real user ID to test:
# test_endpoint "POST" "/connections/request" \
#   '{"targetUserId":"clxxx","message":"Let'\''s connect!","relationshipType":"friend"}' \
#   "Send connection request"

# 5. Get mutual connections (requires target user ID)
# test_endpoint "GET" "/connections/mutual/clxxx" "" "Get mutual connections"

# 6. Get connection suggestions
test_endpoint "GET" "/connections/suggestions" "" "Get connection suggestions"

# 7. Get blocked users
test_endpoint "GET" "/connections/blocked" "" "Get blocked users"

echo ""
echo "=== Trust Score Tests ==="
echo ""

# Trust score is calculated automatically
# You can verify it via user profile endpoint
test_endpoint "GET" "/users/me" "" "Get current user (includes trust score)"

echo ""
echo "=== Vouch Module Tests ==="
echo ""

# 8. Get vouch limits
test_endpoint "GET" "/vouches/limits" "" "Get vouch limits"

# 9. Get vouch summary
test_endpoint "GET" "/vouches/summary" "" "Get vouch summary"

# 10. Get received vouches
test_endpoint "GET" "/vouches/received" "" "Get received vouches"

# 11. Get given vouches
test_endpoint "GET" "/vouches/given" "" "Get given vouches"

echo ""
echo "=============================="
echo "🏁 Connection Module Test Complete"
echo ""
echo "📝 Notes:"
echo "  - Some tests require additional user IDs to work fully"
echo "  - Vouch endpoints return 501 (Feature coming soon) until implemented"
echo "  - Create test users and connections to see full functionality"
echo ""
