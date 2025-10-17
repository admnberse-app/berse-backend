#!/bin/bash

# ============================================================================
# Communities Module Test Script
# ============================================================================
# This script tests all endpoints in the Communities module
# Run with: bash test-communities-module.sh
# ============================================================================

BASE_URL="http://localhost:3001/v2"
OUTPUT_FILE="test-communities-results.log"

# ANSI color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Initialize log file
echo "============================================================================" > $OUTPUT_FILE
echo "COMMUNITIES MODULE TEST RESULTS" >> $OUTPUT_FILE
echo "Timestamp: $(date)" >> $OUTPUT_FILE
echo "============================================================================" >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to print colored output
print_color() {
    printf "${1}${2}${NC}\n"
}

# Function to print section header
print_section() {
    echo ""
    print_color $BLUE "============================================================================"
    print_color $BLUE "$1"
    print_color $BLUE "============================================================================"
    echo ""
    echo "============================================================================" >> $OUTPUT_FILE
    echo "$1" >> $OUTPUT_FILE
    echo "============================================================================" >> $OUTPUT_FILE
    echo "" >> $OUTPUT_FILE
}

# Function to test endpoint
test_endpoint() {
    local METHOD=$1
    local ENDPOINT=$2
    local DESCRIPTION=$3
    local DATA=$4
    local AUTH_TOKEN=$5
    local EXPECTED_STATUS=$6
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    print_color $YELLOW "Test #$TOTAL_TESTS: $DESCRIPTION"
    echo "Test #$TOTAL_TESTS: $DESCRIPTION" >> $OUTPUT_FILE
    echo "Request: $METHOD $ENDPOINT" >> $OUTPUT_FILE
    
    # Build curl command
    if [ -n "$AUTH_TOKEN" ]; then
        if [ -n "$DATA" ]; then
            RESPONSE=$(curl -s -w "\n%{http_code}" -X $METHOD "$BASE_URL$ENDPOINT" \
                -H "Content-Type: application/json" \
                -H "Authorization: Bearer $AUTH_TOKEN" \
                -d "$DATA")
        else
            RESPONSE=$(curl -s -w "\n%{http_code}" -X $METHOD "$BASE_URL$ENDPOINT" \
                -H "Content-Type: application/json" \
                -H "Authorization: Bearer $AUTH_TOKEN")
        fi
    else
        if [ -n "$DATA" ]; then
            RESPONSE=$(curl -s -w "\n%{http_code}" -X $METHOD "$BASE_URL$ENDPOINT" \
                -H "Content-Type: application/json" \
                -d "$DATA")
        else
            RESPONSE=$(curl -s -w "\n%{http_code}" -X $METHOD "$BASE_URL$ENDPOINT" \
                -H "Content-Type: application/json")
        fi
    fi
    
    # Extract status code and body
    STATUS=$(echo "$RESPONSE" | tail -n 1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    
    # Check if test passed
    if [ "$STATUS" = "$EXPECTED_STATUS" ]; then
        print_color $GREEN "✓ PASSED (Status: $STATUS)"
        echo "✓ PASSED (Status: $STATUS)" >> $OUTPUT_FILE
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        print_color $RED "✗ FAILED (Expected: $EXPECTED_STATUS, Got: $STATUS)"
        echo "✗ FAILED (Expected: $EXPECTED_STATUS, Got: $STATUS)" >> $OUTPUT_FILE
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
    
    echo "Response Body:" >> $OUTPUT_FILE
    echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY" >> $OUTPUT_FILE
    echo "" >> $OUTPUT_FILE
    
    # Display formatted response body
    echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
    echo ""
    
    # Return the response body for further use
    echo "$BODY"
}

# ============================================================================
# SETUP: Login to get auth tokens
# ============================================================================

print_section "SETUP: Authentication"

# Login as user 1 (Community Creator/Admin)
LOGIN1_RESPONSE=$(test_endpoint "POST" "/auth/login" "Login as Admin User" \
    '{"email":"admin@test.com","password":"admin123"}' "" "200" | tail -1)
TOKEN1=$(echo "$LOGIN1_RESPONSE" | jq -r '.data.token' 2>/dev/null)

if [ -z "$TOKEN1" ] || [ "$TOKEN1" = "null" ]; then
    print_color $RED "ERROR: Could not authenticate. Please run seed data first."
    echo "Run: npm run prisma:seed:users"
    exit 1
fi

USER1_ID=$(echo "$LOGIN1_RESPONSE" | jq -r '.data.user.id' 2>/dev/null)
print_color $GREEN "User 1 authenticated successfully (ID: $USER1_ID)"

# Login as user 2 (Community Member)
LOGIN2_RESPONSE=$(test_endpoint "POST" "/auth/login" "Login as Alice User" \
    '{"email":"alice@test.com","password":"password123"}' "" "200" | tail -1)
TOKEN2=$(echo "$LOGIN2_RESPONSE" | jq -r '.data.token' 2>/dev/null)

if [ -z "$TOKEN2" ] || [ "$TOKEN2" = "null" ]; then
    print_color $RED "ERROR: Could not authenticate User 2. Please run seed data first."
    echo "Run: npm run prisma:seed:users"
    exit 1
fi

USER2_ID=$(echo "$LOGIN2_RESPONSE" | jq -r '.data.user.id' 2>/dev/null)
print_color $GREEN "User 2 authenticated successfully (ID: $USER2_ID)"

# ============================================================================
# TEST 1: Community Management
# ============================================================================

print_section "TEST 1: Community Management"

# Generate unique community name with timestamp
TIMESTAMP=$(date +%s)
COMMUNITY_NAME="Test Tech Community $TIMESTAMP"

# Test 1.1: Create Community
COMMUNITY_RESPONSE=$(test_endpoint "POST" "/communities" "Create new community" \
    "{\"name\":\"$COMMUNITY_NAME\",\"description\":\"A community for tech enthusiasts\",\"category\":\"Technology\",\"imageUrl\":\"https://example.com/tech.jpg\"}" \
    "$TOKEN1" "201" | tail -1)
COMMUNITY_ID=$(echo "$COMMUNITY_RESPONSE" | jq -r '.data.id' 2>/dev/null)

if [ -z "$COMMUNITY_ID" ] || [ "$COMMUNITY_ID" = "null" ]; then
    print_color $RED "ERROR: Failed to create community. Exiting..."
    exit 1
fi

print_color $GREEN "Created Community ID: $COMMUNITY_ID"

# Test 1.2: Get All Communities (Public)
test_endpoint "GET" "/communities?page=1&limit=10" "Get all communities" "" "" "200"

# Test 1.3: Get Community by ID (Public)
test_endpoint "GET" "/communities/$COMMUNITY_ID" "Get community by ID" "" "" "200"

# Test 1.4: Get My Communities
test_endpoint "GET" "/communities/my?page=1&limit=10" "Get my communities" "" "$TOKEN1" "200"

# Test 1.5: Update Community
test_endpoint "PUT" "/communities/$COMMUNITY_ID" "Update community details" \
    '{"description":"Updated description for tech community","category":"Technology"}' \
    "$TOKEN1" "200"

# Test 1.6: Search Communities
test_endpoint "GET" "/communities?search=Tech&page=1&limit=10" "Search communities by name" "" "" "200"

# Test 1.7: Filter by Category
test_endpoint "GET" "/communities?category=Technology&page=1&limit=10" "Filter communities by category" "" "" "200"

# ============================================================================
# TEST 2: Community Membership
# ============================================================================

print_section "TEST 2: Community Membership"

# Test 2.1: Join Community (User 2)
JOIN_RESPONSE=$(test_endpoint "POST" "/communities/$COMMUNITY_ID/join" "User 2 joins community" \
    '{}' "$TOKEN2" "201" | tail -1)

# Test 2.2: Get Community Members (with pending member)
test_endpoint "GET" "/communities/$COMMUNITY_ID/members?page=1&limit=10" "Get community members" "" "" "200"

# Test 2.3: Get Pending Members
test_endpoint "GET" "/communities/$COMMUNITY_ID/members?isApproved=false&page=1&limit=10" "Get pending approval members" "" "" "200"

# Test 2.4: Approve Member (Admin approves User 2)
test_endpoint "POST" "/communities/$COMMUNITY_ID/members/$USER2_ID/approve" "Approve member join request" \
    "" "$TOKEN1" "200"

# Test 2.5: Get Approved Members
test_endpoint "GET" "/communities/$COMMUNITY_ID/members?isApproved=true&page=1&limit=10" "Get approved members" "" "" "200"

# Test 2.6: Update Member Role (Promote to Moderator)
test_endpoint "PUT" "/communities/$COMMUNITY_ID/members/$USER2_ID/role" "Update member role to MODERATOR" \
    '{"role":"MODERATOR"}' "$TOKEN1" "200"

# Test 2.7: Search Members
test_endpoint "GET" "/communities/$COMMUNITY_ID/members?search=test&page=1&limit=10" "Search members by name" "" "" "200"

# ============================================================================
# TEST 3: Community Statistics
# ============================================================================

print_section "TEST 3: Community Statistics"

# Test 3.1: Get Community Stats
test_endpoint "GET" "/communities/$COMMUNITY_ID/stats" "Get community statistics" "" "$TOKEN1" "200"

# ============================================================================
# TEST 4: Community Vouching
# ============================================================================

print_section "TEST 4: Community Vouching"

# Test 4.1: Check Auto-Vouch Eligibility
test_endpoint "GET" "/communities/$COMMUNITY_ID/members/$USER2_ID/vouch-eligibility" \
    "Check member vouch eligibility" "" "$TOKEN1" "200"

# Test 4.2: Grant Community Vouch
test_endpoint "POST" "/communities/$COMMUNITY_ID/members/$USER2_ID/vouch" \
    "Grant community vouch to member" "" "$TOKEN1" "200"

# Test 4.3: Check Stats After Vouch
test_endpoint "GET" "/communities/$COMMUNITY_ID/stats" "Get stats after vouch" "" "$TOKEN1" "200"

# Test 4.4: Revoke Community Vouch
test_endpoint "DELETE" "/communities/$COMMUNITY_ID/members/$USER2_ID/vouch" \
    "Revoke community vouch" '{"reason":"Testing revoke functionality"}' "$TOKEN1" "200"

# ============================================================================
# TEST 5: Member Rejection Flow
# ============================================================================

print_section "TEST 5: Member Rejection Flow"

# Test 5.1: Create another community for rejection test
COMMUNITY2_NAME="Test Rejection Community $TIMESTAMP"
COMMUNITY2_RESPONSE=$(test_endpoint "POST" "/communities" "Create second community" \
    "{\"name\":\"$COMMUNITY2_NAME\",\"description\":\"For testing rejection flow\"}" \
    "$TOKEN1" "201" | tail -1)
COMMUNITY2_ID=$(echo "$COMMUNITY2_RESPONSE" | jq -r '.data.id' 2>/dev/null)

# Test 5.2: User 2 joins new community
test_endpoint "POST" "/communities/$COMMUNITY2_ID/join" "User 2 joins second community" \
    '{}' "$TOKEN2" "201"

# Test 5.3: Reject Member
test_endpoint "POST" "/communities/$COMMUNITY2_ID/members/$USER2_ID/reject" \
    "Reject member join request" '{"reason":"Testing rejection"}' "$TOKEN1" "200"

# ============================================================================
# TEST 6: Member Removal
# ============================================================================

print_section "TEST 6: Member Removal"

# Test 6.1: User 2 joins again
test_endpoint "POST" "/communities/$COMMUNITY_ID/join" "User 2 re-joins community" \
    '{}' "$TOKEN2" "201"

# Test 6.2: Approve User 2
test_endpoint "POST" "/communities/$COMMUNITY_ID/members/$USER2_ID/approve" "Approve User 2" \
    "" "$TOKEN1" "200"

# Test 6.3: Remove Member (Admin removes User 2)
test_endpoint "DELETE" "/communities/$COMMUNITY_ID/members/$USER2_ID" \
    "Remove member from community" '{"reason":"Testing removal"}' "$TOKEN1" "200"

# ============================================================================
# TEST 7: Leave Community
# ============================================================================

print_section "TEST 7: Leave Community"

# Test 7.1: User 2 joins again
test_endpoint "POST" "/communities/$COMMUNITY_ID/join" "User 2 joins again" \
    '{}' "$TOKEN2" "201"

# Test 7.2: Approve User 2
test_endpoint "POST" "/communities/$COMMUNITY_ID/members/$USER2_ID/approve" "Approve User 2 again" \
    "" "$TOKEN1" "200"

# Test 7.3: User 2 leaves community
test_endpoint "DELETE" "/communities/$COMMUNITY_ID/leave" "User 2 leaves community" \
    "" "$TOKEN2" "200"

# ============================================================================
# TEST 8: Permission Tests (Negative Cases)
# ============================================================================

print_section "TEST 8: Permission Tests (Negative Cases)"

# Test 8.1: Non-member tries to update community
test_endpoint "PUT" "/communities/$COMMUNITY_ID" "Non-admin tries to update (should fail)" \
    '{"description":"Unauthorized update"}' "$TOKEN2" "403"

# Test 8.2: Non-admin tries to delete community
test_endpoint "DELETE" "/communities/$COMMUNITY2_ID" "Non-admin tries to delete (should fail)" \
    "" "$TOKEN2" "403"

# Test 8.3: Try to join already joined community
test_endpoint "POST" "/communities/$COMMUNITY_ID/join" "Try to join already joined community" \
    '{}' "$TOKEN1" "409"

# ============================================================================
# TEST 9: Cleanup - Delete Communities
# ============================================================================

print_section "TEST 9: Cleanup"

# Test 9.1: Delete second community
test_endpoint "DELETE" "/communities/$COMMUNITY2_ID" "Delete second community" "" "$TOKEN1" "200"

# Test 9.2: Delete main community
test_endpoint "DELETE" "/communities/$COMMUNITY_ID" "Delete main test community" "" "$TOKEN1" "200"

# Test 9.3: Verify deletion
test_endpoint "GET" "/communities/$COMMUNITY_ID" "Verify community deleted (should fail)" "" "" "404"

# ============================================================================
# TEST SUMMARY
# ============================================================================

print_section "TEST SUMMARY"

echo "Total Tests: $TOTAL_TESTS" | tee -a $OUTPUT_FILE
echo "Passed: $PASSED_TESTS" | tee -a $OUTPUT_FILE
echo "Failed: $FAILED_TESTS" | tee -a $OUTPUT_FILE
echo "" | tee -a $OUTPUT_FILE

if [ $FAILED_TESTS -eq 0 ]; then
    print_color $GREEN "✓ ALL TESTS PASSED!"
    echo "✓ ALL TESTS PASSED!" >> $OUTPUT_FILE
    SUCCESS_RATE=100
else
    SUCCESS_RATE=$((PASSED_TESTS * 100 / TOTAL_TESTS))
    print_color $YELLOW "⚠ Some tests failed"
    echo "⚠ Some tests failed" >> $OUTPUT_FILE
fi

echo "Success Rate: ${SUCCESS_RATE}%" | tee -a $OUTPUT_FILE
echo "" | tee -a $OUTPUT_FILE
echo "Full test results saved to: $OUTPUT_FILE"

print_color $BLUE "============================================================================"
print_color $BLUE "Test execution completed"
print_color $BLUE "============================================================================"
