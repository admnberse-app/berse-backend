#!/bin/bash

# ==============================================================================
# Trust Moments API Test Script
# ==============================================================================
# Tests all 8 trust moment endpoints with various scenarios
# Usage: ./test-trust-moment-endpoints.sh [TOKEN]
# ==============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
API_URL="http://localhost:3001/api/v2"
PASSED=0
FAILED=0
TOTAL=0

# Check if token provided as argument
if [ -n "$1" ]; then
    TOKEN="$1"
    echo -e "${GREEN}✓${NC} Using provided token"
else
    # Prompt for token
    echo -e "${YELLOW}Please enter your JWT token:${NC}"
    read -r TOKEN
fi

# Validate token
if [ -z "$TOKEN" ]; then
    echo -e "${RED}Error: No token provided${NC}"
    exit 1
fi

# Print test header
echo "================================================================================================="
echo -e "${BLUE}Trust Moments API Test Suite${NC}"
echo "================================================================================================="
echo "API URL: $API_URL"
echo "Token: ${TOKEN:0:20}..."
echo "================================================================================================="
echo ""

# ==============================================================================
# Helper Functions
# ==============================================================================

test_endpoint() {
    TOTAL=$((TOTAL + 1))
    local test_name="$1"
    local method="$2"
    local endpoint="$3"
    local data="$4"
    local expected_code="$5"
    
    echo -ne "Testing: $test_name... "
    
    if [ "$method" = "GET" ] || [ "$method" = "DELETE" ]; then
        response=$(curl -s -w "\n%{http_code}" -X "$method" \
            -H "Authorization: Bearer $TOKEN" \
            -H "Content-Type: application/json" \
            "$API_URL$endpoint")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" \
            -H "Authorization: Bearer $TOKEN" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$API_URL$endpoint")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "$expected_code" ]; then
        echo -e "${GREEN}✓ PASS${NC} (HTTP $http_code)"
        PASSED=$((PASSED + 1))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC} (Expected HTTP $expected_code, got $http_code)"
        echo "Response: $body"
        FAILED=$((FAILED + 1))
        return 1
    fi
}

extract_id() {
    echo "$1" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4
}

# ==============================================================================
# SETUP: Create test data
# ==============================================================================

echo -e "${BLUE}SETUP: Creating test data...${NC}"
echo ""

# Create second test user for connections
echo -ne "Creating second test user... "
REGISTER_DATA='{
  "email": "trust-moment-test2@example.com",
  "password": "TestPass123!",
  "fullName": "Trust Test UserTwo"
}'
register_response=$(curl -s -w "\n%{http_code}" -X POST \
    -H "Content-Type: application/json" \
    -d "$REGISTER_DATA" \
    "$API_URL/auth/register")

register_code=$(echo "$register_response" | tail -n1)
if [ "$register_code" = "201" ] || [ "$register_code" = "400" ] || [ "$register_code" = "409" ]; then
    echo -e "${GREEN}✓${NC}"
    
    # Login to get second user's token
    LOGIN_DATA='{
      "email": "trust-moment-test2@example.com",
      "password": "TestPass123!"
    }'
    login_response=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -d "$LOGIN_DATA" \
        "$API_URL/auth/login")
    
    USER2_ID=$(echo "$login_response" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
    USER2_TOKEN=$(echo "$login_response" | grep -o '"token":"[^"]*"' | head -1 | cut -d'"' -f4)
    echo "Second user ID: $USER2_ID"
else
    echo -e "${RED}✗ Failed${NC}"
    exit 1
fi

# Get current user ID
echo -ne "Getting current user profile... "
profile_response=$(curl -s -X GET \
    -H "Authorization: Bearer $TOKEN" \
    "$API_URL/users/profile")
USER1_ID=$(echo "$profile_response" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo -e "${GREEN}✓${NC} (ID: $USER1_ID)"

# Create connection between users
echo -ne "Creating connection... "
CONN_DATA="{\"receiverId\":\"$USER2_ID\"}"
conn_response=$(curl -s -X POST \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "$CONN_DATA" \
    "$API_URL/connections/request")
CONNECTION_ID=$(extract_id "$conn_response")
echo -e "${GREEN}✓${NC} (Connection ID: $CONNECTION_ID)"

# Accept connection from user 2
echo -ne "Accepting connection... "
ACCEPT_DATA="{\"connectionId\":\"$CONNECTION_ID\",\"action\":\"accept\"}"
curl -s -X POST \
    -H "Authorization: Bearer $USER2_TOKEN" \
    -H "Content-Type: application/json" \
    -d "$ACCEPT_DATA" \
    "$API_URL/connections/$CONNECTION_ID/respond" > /dev/null
echo -e "${GREEN}✓${NC}"

# Create a test event
echo -ne "Creating test event... "
EVENT_DATA='{
  "title": "Trust Moment Test Event",
  "description": "Event for testing trust moments",
  "type": "SOCIAL",
  "date": "2025-12-01T10:00:00.000Z",
  "location": "Test Location",
  "isFree": true
}'
event_response=$(curl -s -X POST \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "$EVENT_DATA" \
    "$API_URL/events")
EVENT_ID=$(extract_id "$event_response")
echo -e "${GREEN}✓${NC} (Event ID: $EVENT_ID)"

# RSVP both users to event
echo -ne "RSVPing users to event... "
curl -s -X POST \
    -H "Authorization: Bearer $TOKEN" \
    "$API_URL/events/$EVENT_ID/rsvp" > /dev/null
curl -s -X POST \
    -H "Authorization: Bearer $USER2_TOKEN" \
    "$API_URL/events/$EVENT_ID/rsvp" > /dev/null
echo -e "${GREEN}✓${NC}"

# Check in both users (simulate event attendance)
echo -ne "Checking in users... "
rsvp1_response=$(curl -s -X GET \
    -H "Authorization: Bearer $TOKEN" \
    "$API_URL/events/$EVENT_ID/my-rsvp")
QR1=$(echo "$rsvp1_response" | grep -o '"qrCode":"[^"]*"' | cut -d'"' -f4)

rsvp2_response=$(curl -s -X GET \
    -H "Authorization: Bearer $USER2_TOKEN" \
    "$API_URL/events/$EVENT_ID/my-rsvp")
QR2=$(echo "$rsvp2_response" | grep -o '"qrCode":"[^"]*"' | cut -d'"' -f4)

curl -s -X POST \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"qrCode\":\"$QR1\"}" \
    "$API_URL/events/$EVENT_ID/check-in" > /dev/null

curl -s -X POST \
    -H "Authorization: Bearer $USER2_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"qrCode\":\"$QR2\"}" \
    "$API_URL/events/$EVENT_ID/check-in" > /dev/null
echo -e "${GREEN}✓${NC}"

echo ""
echo "================================================================================================="
echo ""

# ==============================================================================
# STEP 1: Create Trust Moments (4 tests)
# ==============================================================================

echo -e "${BLUE}STEP 1: Create Trust Moments (4 tests)${NC}"
echo ""

# Test 1.1: Create trust moment with event (5 stars)
MOMENT_DATA1="{
  \"receiverId\": \"$USER2_ID\",
  \"eventId\": \"$EVENT_ID\",
  \"momentType\": \"event\",
  \"rating\": 5,
  \"feedback\": \"Amazing event partner! Very friendly and helpful.\",
  \"experienceDescription\": \"Had a great time at the event together.\",
  \"tags\": [\"friendly\", \"helpful\", \"fun\"],
  \"isPublic\": true
}"
test_endpoint "Create Event Trust Moment (5 stars)" "POST" "/connections/$CONNECTION_ID/trust-moments" "$MOMENT_DATA1" "201"
if [ $? -eq 0 ]; then
    moment_response=$(curl -s -X POST \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d "$MOMENT_DATA1" \
        "$API_URL/connections/$CONNECTION_ID/trust-moments")
    MOMENT1_ID=$(extract_id "$moment_response")
    echo "  → Created trust moment ID: $MOMENT1_ID"
fi

# Test 1.2: Create general trust moment (4 stars)
MOMENT_DATA2="{
  \"receiverId\": \"$USER2_ID\",
  \"momentType\": \"general\",
  \"rating\": 4,
  \"feedback\": \"Good collaboration experience.\",
  \"tags\": [\"reliable\", \"professional\"],
  \"isPublic\": true
}"
test_endpoint "Create General Trust Moment (4 stars)" "POST" "/connections/$CONNECTION_ID/trust-moments" "$MOMENT_DATA2" "201"
if [ $? -eq 0 ]; then
    moment_response2=$(curl -s -X POST \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d "$MOMENT_DATA2" \
        "$API_URL/connections/$CONNECTION_ID/trust-moments")
    MOMENT2_ID=$(extract_id "$moment_response2")
    echo "  → Created trust moment ID: $MOMENT2_ID"
fi

# Test 1.3: Try duplicate event feedback (should fail with 409)
test_endpoint "Duplicate Event Feedback (409)" "POST" "/connections/$CONNECTION_ID/trust-moments" "$MOMENT_DATA1" "409"

# Test 1.4: Invalid rating (should fail with 400)
INVALID_RATING="{\"receiverId\":\"$USER2_ID\",\"rating\":6}"
test_endpoint "Invalid Rating (400)" "POST" "/connections/$CONNECTION_ID/trust-moments" "$INVALID_RATING" "400"

echo ""

# ==============================================================================
# STEP 2: Get Trust Moments (4 tests)
# ==============================================================================

echo -e "${BLUE}STEP 2: Get Trust Moments (4 tests)${NC}"
echo ""

# Test 2.1: Get single trust moment
if [ -n "$MOMENT1_ID" ]; then
    test_endpoint "Get Trust Moment Details" "GET" "/trust-moments/$MOMENT1_ID" "" "200"
fi

# Test 2.2: Get trust moments received by user
test_endpoint "Get Trust Moments Received" "GET" "/users/$USER2_ID/trust-moments/received?page=1&limit=10" "" "200"

# Test 2.3: Get trust moments given by user
test_endpoint "Get Trust Moments Given" "GET" "/users/$USER1_ID/trust-moments/given?page=1&limit=10" "" "200"

# Test 2.4: Get trust moments for event
if [ -n "$EVENT_ID" ]; then
    test_endpoint "Get Event Trust Moments" "GET" "/events/$EVENT_ID/trust-moments?page=1&limit=10" "" "200"
fi

echo ""

# ==============================================================================
# STEP 3: Update Trust Moment (3 tests)
# ==============================================================================

echo -e "${BLUE}STEP 3: Update Trust Moment (3 tests)${NC}"
echo ""

# Test 3.1: Update trust moment rating
if [ -n "$MOMENT1_ID" ]; then
    UPDATE_DATA="{\"rating\":4,\"feedback\":\"Updated feedback after reflection.\"}"
    test_endpoint "Update Trust Moment Rating" "PATCH" "/trust-moments/$MOMENT1_ID" "$UPDATE_DATA" "200"
fi

# Test 3.2: Update trust moment tags
if [ -n "$MOMENT1_ID" ]; then
    UPDATE_TAGS="{\"tags\":[\"friendly\",\"helpful\",\"professional\"]}"
    test_endpoint "Update Trust Moment Tags" "PATCH" "/trust-moments/$MOMENT1_ID" "$UPDATE_TAGS" "200"
fi

# Test 3.3: Try to update someone else's trust moment (should fail with 403)
if [ -n "$MOMENT1_ID" ]; then
    UPDATE_WRONG="{\"rating\":3}"
    response=$(curl -s -w "\n%{http_code}" -X PATCH \
        -H "Authorization: Bearer $USER2_TOKEN" \
        -H "Content-Type: application/json" \
        -d "$UPDATE_WRONG" \
        "$API_URL/trust-moments/$MOMENT1_ID")
    http_code=$(echo "$response" | tail -n1)
    
    TOTAL=$((TOTAL + 1))
    if [ "$http_code" = "403" ]; then
        echo -e "Testing: Update Others' Trust Moment (403)... ${GREEN}✓ PASS${NC} (HTTP 403)"
        PASSED=$((PASSED + 1))
    else
        echo -e "Testing: Update Others' Trust Moment (403)... ${RED}✗ FAIL${NC} (Expected 403, got $http_code)"
        FAILED=$((FAILED + 1))
    fi
fi

echo ""

# ==============================================================================
# STEP 4: Statistics (2 tests)
# ==============================================================================

echo -e "${BLUE}STEP 4: Statistics (2 tests)${NC}"
echo ""

# Test 4.1: Get trust moment statistics for user2 (receiver)
test_endpoint "Get Trust Moment Stats (Receiver)" "GET" "/users/$USER2_ID/trust-moments/stats" "" "200"
if [ $? -eq 0 ]; then
    stats_response=$(curl -s -X GET \
        -H "Authorization: Bearer $TOKEN" \
        "$API_URL/users/$USER2_ID/trust-moments/stats")
    
    total=$(echo "$stats_response" | grep -o '"total":[0-9]*' | head -1 | cut -d':' -f2)
    avg_rating=$(echo "$stats_response" | grep -o '"averageRating":[0-9.]*' | head -1 | cut -d':' -f2)
    echo "  → Total received: $total, Average rating: $avg_rating"
fi

# Test 4.2: Get trust moment statistics for user1 (giver)
test_endpoint "Get Trust Moment Stats (Giver)" "GET" "/users/$USER1_ID/trust-moments/stats" "" "200"

echo ""

# ==============================================================================
# STEP 5: Query Filters (3 tests)
# ==============================================================================

echo -e "${BLUE}STEP 5: Query Filters (3 tests)${NC}"
echo ""

# Test 5.1: Filter by rating (min rating 4)
test_endpoint "Filter by Min Rating" "GET" "/users/$USER2_ID/trust-moments/received?minRating=4" "" "200"

# Test 5.2: Filter by moment type
test_endpoint "Filter by Moment Type" "GET" "/users/$USER2_ID/trust-moments/received?momentType=event" "" "200"

# Test 5.3: Filter by event ID
if [ -n "$EVENT_ID" ]; then
    test_endpoint "Filter by Event ID" "GET" "/users/$USER2_ID/trust-moments/received?eventId=$EVENT_ID" "" "200"
fi

echo ""

# ==============================================================================
# STEP 6: Delete Trust Moment (2 tests)
# ==============================================================================

echo -e "${BLUE}STEP 6: Delete Trust Moment (2 tests)${NC}"
echo ""

# Test 6.1: Try to delete someone else's trust moment (should fail with 403)
if [ -n "$MOMENT1_ID" ]; then
    response=$(curl -s -w "\n%{http_code}" -X DELETE \
        -H "Authorization: Bearer $USER2_TOKEN" \
        "$API_URL/trust-moments/$MOMENT1_ID")
    http_code=$(echo "$response" | tail -n1)
    
    TOTAL=$((TOTAL + 1))
    if [ "$http_code" = "403" ]; then
        echo -e "Testing: Delete Others' Trust Moment (403)... ${GREEN}✓ PASS${NC} (HTTP 403)"
        PASSED=$((PASSED + 1))
    else
        echo -e "Testing: Delete Others' Trust Moment (403)... ${RED}✗ FAIL${NC} (Expected 403, got $http_code)"
        FAILED=$((FAILED + 1))
    fi
fi

# Test 6.2: Delete own trust moment
if [ -n "$MOMENT2_ID" ]; then
    test_endpoint "Delete Own Trust Moment" "DELETE" "/trust-moments/$MOMENT2_ID" "" "200"
fi

echo ""

# ==============================================================================
# CLEANUP
# ==============================================================================

echo -e "${BLUE}CLEANUP: Removing test data...${NC}"
echo ""

read -p "Do you want to clean up test data? (y/N): " cleanup
if [[ $cleanup =~ ^[Yy]$ ]]; then
    echo -ne "Deleting remaining trust moments... "
    if [ -n "$MOMENT1_ID" ]; then
        curl -s -X DELETE \
            -H "Authorization: Bearer $TOKEN" \
            "$API_URL/trust-moments/$MOMENT1_ID" > /dev/null
    fi
    echo -e "${GREEN}✓${NC}"
    
    echo -ne "Deleting test event... "
    if [ -n "$EVENT_ID" ]; then
        curl -s -X DELETE \
            -H "Authorization: Bearer $TOKEN" \
            "$API_URL/events/$EVENT_ID" > /dev/null
    fi
    echo -e "${GREEN}✓${NC}"
    
    echo -ne "Removing connection... "
    if [ -n "$CONNECTION_ID" ]; then
        curl -s -X DELETE \
            -H "Authorization: Bearer $TOKEN" \
            "$API_URL/connections/$CONNECTION_ID" > /dev/null
    fi
    echo -e "${GREEN}✓${NC}"
else
    echo "Skipped cleanup. Test data remains in database."
    echo "Trust Moment IDs: $MOMENT1_ID, $MOMENT2_ID"
    echo "Event ID: $EVENT_ID"
    echo "Connection ID: $CONNECTION_ID"
fi

# ==============================================================================
# RESULTS
# ==============================================================================

echo ""
echo "================================================================================================="
echo -e "${BLUE}Test Results Summary${NC}"
echo "================================================================================================="
echo "Total Tests Run: $TOTAL"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo "================================================================================================="

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ ALL TESTS PASSED SUCCESSFULLY!${NC}"
    echo "================================================================================================="
    exit 0
else
    echo -e "${RED}✗ SOME TESTS FAILED${NC}"
    echo "================================================================================================="
    exit 1
fi
