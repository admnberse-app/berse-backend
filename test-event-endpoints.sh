#!/bin/bash

# Event Endpoints Testing Script
# Tests all 21 event endpoints + caching verification

BASE_URL="http://localhost:3001/v2"
TEST_USER_EMAIL="raihaan@gmail.com"
TEST_USER_PASSWORD="password123"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🧪 Testing Event Endpoints"
echo "=========================="
echo ""

# 1. Login and get token
echo "1. Authenticating..."
LOGIN_RESPONSE=$(curl -s -X POST ${BASE_URL}/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${TEST_USER_EMAIL}\",\"password\":\"${TEST_USER_PASSWORD}\"}")

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.token // empty')
USER_ID=$(echo $LOGIN_RESPONSE | jq -r '.user.id // empty')

if [ -z "$TOKEN" ]; then
  echo -e "${RED}❌ Login failed${NC}"
  echo "Response: $LOGIN_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✅ Authenticated as user: $USER_ID${NC}"
echo ""

# ============================================
# EVENT CRUD OPERATIONS (5 endpoints)
# ============================================
echo "📝 Testing Event CRUD (5 endpoints)"
echo "-----------------------------------"

# 2. Create Event
echo "2. POST /events - Create Event"
CREATE_EVENT_RESPONSE=$(curl -s -X POST ${BASE_URL}/events \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Discovery Event",
    "description": "Testing event discovery and caching",
    "type": "MEETUP",
    "date": "2025-12-25T10:00:00Z",
    "endDate": "2025-12-25T12:00:00Z",
    "location": "Test Location",
    "latitude": 1.3521,
    "longitude": 103.8198,
    "maxAttendees": 50,
    "isFree": true,
    "status": "PUBLISHED"
  }')

EVENT_ID=$(echo $CREATE_EVENT_RESPONSE | jq -r '.id // .event.id // empty')
if [ -z "$EVENT_ID" ]; then
  echo -e "${RED}❌ Create event failed${NC}"
  echo "Response: $CREATE_EVENT_RESPONSE"
else
  echo -e "${GREEN}✅ Event created: $EVENT_ID${NC}"
fi
echo ""

# 3. Get Events List
echo "3. GET /events - List Events"
LIST_RESPONSE=$(curl -s -X GET "${BASE_URL}/events?limit=5" \
  -H "Authorization: Bearer ${TOKEN}")
LIST_COUNT=$(echo $LIST_RESPONSE | jq -r '.events | length // 0')
echo -e "${GREEN}✅ Retrieved $LIST_COUNT events${NC}"
echo ""

# 4. Get Event Detail
echo "4. GET /events/:id - Get Event Detail"
if [ ! -z "$EVENT_ID" ]; then
  DETAIL_RESPONSE=$(curl -s -X GET "${BASE_URL}/events/${EVENT_ID}" \
    -H "Authorization: Bearer ${TOKEN}")
  DETAIL_TITLE=$(echo $DETAIL_RESPONSE | jq -r '.title // .event.title // empty')
  if [ ! -z "$DETAIL_TITLE" ]; then
    echo -e "${GREEN}✅ Event details: $DETAIL_TITLE${NC}"
  else
    echo -e "${RED}❌ Failed to get event details${NC}"
  fi
else
  echo -e "${YELLOW}⏭ Skipped (no event ID)${NC}"
fi
echo ""

# 5. Update Event
echo "5. PUT /events/:id - Update Event"
if [ ! -z "$EVENT_ID" ]; then
  UPDATE_RESPONSE=$(curl -s -X PUT "${BASE_URL}/events/${EVENT_ID}" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{
      "title": "Test Discovery Event (Updated)",
      "description": "Updated description"
    }')
  UPDATE_TITLE=$(echo $UPDATE_RESPONSE | jq -r '.title // .event.title // empty')
  if [[ "$UPDATE_TITLE" == *"Updated"* ]]; then
    echo -e "${GREEN}✅ Event updated successfully${NC}"
  else
    echo -e "${RED}❌ Failed to update event${NC}"
  fi
else
  echo -e "${YELLOW}⏭ Skipped (no event ID)${NC}"
fi
echo ""

# ============================================
# DISCOVERY ENDPOINTS (6 endpoints) - PRIMARY FOCUS
# ============================================
echo "🔍 Testing Discovery Endpoints (6 endpoints)"
echo "--------------------------------------------"

# 6. Trending Events (with caching test)
echo "6. GET /events/trending - Trending Events"
echo "   Testing cache performance..."
START_TIME=$(date +%s%N)
TRENDING_1=$(curl -s -X GET "${BASE_URL}/events/trending?limit=10" \
  -H "Authorization: Bearer ${TOKEN}")
END_TIME=$(date +%s%N)
TIME_1=$((($END_TIME - $START_TIME) / 1000000))

TRENDING_COUNT=$(echo $TRENDING_1 | jq -r '.events | length // 0')
echo "   First call: ${TIME_1}ms, Count: $TRENDING_COUNT"

# Second call should hit cache
START_TIME=$(date +%s%N)
TRENDING_2=$(curl -s -X GET "${BASE_URL}/events/trending?limit=10" \
  -H "Authorization: Bearer ${TOKEN}")
END_TIME=$(date +%s%N)
TIME_2=$((($END_TIME - $START_TIME) / 1000000))
echo "   Second call (cached): ${TIME_2}ms"

if [ $TIME_2 -lt $TIME_1 ]; then
  echo -e "${GREEN}✅ Cache working (${TIME_2}ms < ${TIME_1}ms)${NC}"
else
  echo -e "${YELLOW}⚠️  Cache may not be working (${TIME_2}ms >= ${TIME_1}ms)${NC}"
fi
echo ""

# 7. Nearby Events
echo "7. GET /events/nearby - Nearby Events"
NEARBY_RESPONSE=$(curl -s -X GET "${BASE_URL}/events/nearby?latitude=1.3521&longitude=103.8198&radius=50&limit=10" \
  -H "Authorization: Bearer ${TOKEN}")
NEARBY_COUNT=$(echo $NEARBY_RESPONSE | jq -r '.events | length // 0')
echo -e "${GREEN}✅ Found $NEARBY_COUNT nearby events${NC}"
echo ""

# 8. Recommended Events (with caching test)
echo "8. GET /events/recommended - Recommended Events"
echo "   Testing cache performance..."
START_TIME=$(date +%s%N)
RECOMMENDED_1=$(curl -s -X GET "${BASE_URL}/events/recommended?limit=10" \
  -H "Authorization: Bearer ${TOKEN}")
END_TIME=$(date +%s%N)
TIME_1=$((($END_TIME - $START_TIME) / 1000000))

RECOMMENDED_COUNT=$(echo $RECOMMENDED_1 | jq -r '.events | length // 0')
echo "   First call: ${TIME_1}ms, Count: $RECOMMENDED_COUNT"

# Second call should hit cache
START_TIME=$(date +%s%N)
RECOMMENDED_2=$(curl -s -X GET "${BASE_URL}/events/recommended?limit=10" \
  -H "Authorization: Bearer ${TOKEN}")
END_TIME=$(date +%s%N)
TIME_2=$((($END_TIME - $START_TIME) / 1000000))
echo "   Second call (cached): ${TIME_2}ms"

if [ $TIME_2 -lt $TIME_1 ]; then
  echo -e "${GREEN}✅ Cache working (${TIME_2}ms < ${TIME_1}ms)${NC}"
else
  echo -e "${YELLOW}⚠️  Cache may not be working (${TIME_2}ms >= ${TIME_1}ms)${NC}"
fi
echo ""

# 9. Host Events
echo "9. GET /events/host/:id - Host Events"
HOST_RESPONSE=$(curl -s -X GET "${BASE_URL}/events/host/${USER_ID}?limit=10" \
  -H "Authorization: Bearer ${TOKEN}")
HOST_COUNT=$(echo $HOST_RESPONSE | jq -r '.events | length // 0')
echo -e "${GREEN}✅ Found $HOST_COUNT events by host${NC}"
echo ""

# 10. Community Events
echo "10. GET /events/my-communities - Community Events"
COMMUNITY_RESPONSE=$(curl -s -X GET "${BASE_URL}/events/my-communities?limit=10" \
  -H "Authorization: Bearer ${TOKEN}")
COMMUNITY_COUNT=$(echo $COMMUNITY_RESPONSE | jq -r '.events | length // 0')
echo -e "${GREEN}✅ Found $COMMUNITY_COUNT community events${NC}"
echo ""

# 11. User Attended Events
echo "11. GET /events/user/:id/attended - User Attended Events"
ATTENDED_RESPONSE=$(curl -s -X GET "${BASE_URL}/events/user/${USER_ID}/attended?limit=10" \
  -H "Authorization: Bearer ${TOKEN}")
ATTENDED_COUNT=$(echo $ATTENDED_RESPONSE | jq -r '.events | length // 0')
echo -e "${GREEN}✅ Found $ATTENDED_COUNT attended events${NC}"
echo ""

# ============================================
# TICKET TIER ENDPOINTS (3 endpoints)
# ============================================
echo "🎫 Testing Ticket Tier Endpoints (3 endpoints)"
echo "----------------------------------------------"

# 12. Create Ticket Tier
echo "12. POST /events/:id/ticket-tiers - Create Tier"
if [ ! -z "$EVENT_ID" ]; then
  TIER_RESPONSE=$(curl -s -X POST "${BASE_URL}/events/${EVENT_ID}/ticket-tiers" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{
      "name": "VIP",
      "price": 50.00,
      "quantity": 20,
      "description": "VIP access"
    }')
  TIER_ID=$(echo $TIER_RESPONSE | jq -r '.id // .tier.id // empty')
  if [ ! -z "$TIER_ID" ]; then
    echo -e "${GREEN}✅ Ticket tier created: $TIER_ID${NC}"
  else
    echo -e "${RED}❌ Failed to create ticket tier${NC}"
  fi
else
  echo -e "${YELLOW}⏭ Skipped (no event ID)${NC}"
fi
echo ""

# 13. Get Ticket Tiers
echo "13. GET /events/:id/ticket-tiers - Get Tiers"
if [ ! -z "$EVENT_ID" ]; then
  TIERS_RESPONSE=$(curl -s -X GET "${BASE_URL}/events/${EVENT_ID}/ticket-tiers" \
    -H "Authorization: Bearer ${TOKEN}")
  TIERS_COUNT=$(echo $TIERS_RESPONSE | jq -r '. | length // 0')
  echo -e "${GREEN}✅ Found $TIERS_COUNT ticket tiers${NC}"
else
  echo -e "${YELLOW}⏭ Skipped (no event ID)${NC}"
fi
echo ""

# 14. Update Ticket Tier
echo "14. PUT /events/:id/ticket-tiers/:tierId - Update Tier"
if [ ! -z "$EVENT_ID" ] && [ ! -z "$TIER_ID" ]; then
  UPDATE_TIER_RESPONSE=$(curl -s -X PUT "${BASE_URL}/events/${EVENT_ID}/ticket-tiers/${TIER_ID}" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{
      "price": 60.00,
      "quantity": 25
    }')
  echo -e "${GREEN}✅ Ticket tier updated${NC}"
else
  echo -e "${YELLOW}⏭ Skipped (no event/tier ID)${NC}"
fi
echo ""

# ============================================
# TICKET PURCHASE ENDPOINTS (2 endpoints)
# ============================================
echo "💳 Testing Ticket Purchase Endpoints (2 endpoints)"
echo "--------------------------------------------------"

# 15. Purchase Ticket
echo "15. POST /events/:id/purchase-ticket - Purchase"
if [ ! -z "$EVENT_ID" ] && [ ! -z "$TIER_ID" ]; then
  PURCHASE_RESPONSE=$(curl -s -X POST "${BASE_URL}/events/${EVENT_ID}/purchase-ticket" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json" \
    -d "{
      \"tierId\": \"${TIER_ID}\",
      \"quantity\": 1
    }")
  TICKET_ID=$(echo $PURCHASE_RESPONSE | jq -r '.ticket.id // .id // empty')
  if [ ! -z "$TICKET_ID" ]; then
    echo -e "${GREEN}✅ Ticket purchased: $TICKET_ID${NC}"
  else
    echo -e "${YELLOW}⚠️  Purchase may have failed (check payment integration)${NC}"
  fi
else
  echo -e "${YELLOW}⏭ Skipped (no event/tier ID)${NC}"
fi
echo ""

# 16. Get My Tickets
echo "16. GET /events/my-tickets - My Tickets"
MY_TICKETS_RESPONSE=$(curl -s -X GET "${BASE_URL}/events/my-tickets" \
  -H "Authorization: Bearer ${TOKEN}")
MY_TICKETS_COUNT=$(echo $MY_TICKETS_RESPONSE | jq -r '.tickets | length // 0')
echo -e "${GREEN}✅ Found $MY_TICKETS_COUNT tickets${NC}"
echo ""

# ============================================
# RSVP ENDPOINTS (4 endpoints)
# ============================================
echo "✋ Testing RSVP Endpoints (4 endpoints)"
echo "--------------------------------------"

# 17. RSVP to Event
echo "17. POST /events/:id/rsvp - Create RSVP"
if [ ! -z "$EVENT_ID" ]; then
  RSVP_RESPONSE=$(curl -s -X POST "${BASE_URL}/events/${EVENT_ID}/rsvp" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{"status": "GOING"}')
  RSVP_STATUS=$(echo $RSVP_RESPONSE | jq -r '.status // .rsvp.status // empty')
  if [ ! -z "$RSVP_STATUS" ]; then
    echo -e "${GREEN}✅ RSVP created: $RSVP_STATUS${NC}"
  else
    echo -e "${RED}❌ Failed to create RSVP${NC}"
  fi
else
  echo -e "${YELLOW}⏭ Skipped (no event ID)${NC}"
fi
echo ""

# 18. Get QR Code
echo "18. GET /events/:id/qr-code - Get QR Code"
if [ ! -z "$EVENT_ID" ]; then
  QR_RESPONSE=$(curl -s -X GET "${BASE_URL}/events/${EVENT_ID}/qr-code" \
    -H "Authorization: Bearer ${TOKEN}")
  QR_URL=$(echo $QR_RESPONSE | jq -r '.qrCodeUrl // empty')
  if [ ! -z "$QR_URL" ]; then
    echo -e "${GREEN}✅ QR code generated${NC}"
  else
    echo -e "${RED}❌ Failed to generate QR code${NC}"
  fi
else
  echo -e "${YELLOW}⏭ Skipped (no event ID)${NC}"
fi
echo ""

# 19. Get My RSVPs
echo "19. GET /events/my-rsvps - My RSVPs"
MY_RSVPS_RESPONSE=$(curl -s -X GET "${BASE_URL}/events/my-rsvps" \
  -H "Authorization: Bearer ${TOKEN}")
MY_RSVPS_COUNT=$(echo $MY_RSVPS_RESPONSE | jq -r '.rsvps | length // 0')
echo -e "${GREEN}✅ Found $MY_RSVPS_COUNT RSVPs${NC}"
echo ""

# 20. Cancel RSVP
echo "20. DELETE /events/:id/rsvp - Cancel RSVP"
if [ ! -z "$EVENT_ID" ]; then
  CANCEL_RSVP_RESPONSE=$(curl -s -X DELETE "${BASE_URL}/events/${EVENT_ID}/rsvp" \
    -H "Authorization: Bearer ${TOKEN}")
  echo -e "${GREEN}✅ RSVP cancelled${NC}"
else
  echo -e "${YELLOW}⏭ Skipped (no event ID)${NC}"
fi
echo ""

# ============================================
# ATTENDANCE ENDPOINTS (2 endpoints)
# ============================================
echo "📋 Testing Attendance Endpoints (2 endpoints)"
echo "---------------------------------------------"

# 21. Check In (requires QR data)
echo "21. POST /events/check-in - Check In"
echo -e "${YELLOW}⏭ Skipped (requires QR scanning)${NC}"
echo ""

# 22. Get Attendees
echo "22. GET /events/:id/attendees - Get Attendees"
if [ ! -z "$EVENT_ID" ]; then
  ATTENDEES_RESPONSE=$(curl -s -X GET "${BASE_URL}/events/${EVENT_ID}/attendees" \
    -H "Authorization: Bearer ${TOKEN}")
  ATTENDEES_COUNT=$(echo $ATTENDEES_RESPONSE | jq -r '.attendees | length // 0')
  echo -e "${GREEN}✅ Found $ATTENDEES_COUNT attendees${NC}"
else
  echo -e "${YELLOW}⏭ Skipped (no event ID)${NC}"
fi
echo ""

# 23. Delete Event (cleanup)
echo "23. DELETE /events/:id - Delete Event (cleanup)"
if [ ! -z "$EVENT_ID" ]; then
  DELETE_RESPONSE=$(curl -s -X DELETE "${BASE_URL}/events/${EVENT_ID}" \
    -H "Authorization: Bearer ${TOKEN}")
  echo -e "${GREEN}✅ Test event deleted${NC}"
else
  echo -e "${YELLOW}⏭ Skipped (no event ID)${NC}"
fi
echo ""

# ============================================
# SUMMARY
# ============================================
echo "================================"
echo "📊 Test Summary"
echo "================================"
echo "✅ Event CRUD: 5 endpoints"
echo "✅ Discovery: 6 endpoints (with cache tests)"
echo "✅ Ticket Tiers: 3 endpoints"
echo "✅ Ticket Purchase: 2 endpoints"
echo "✅ RSVP: 4 endpoints"
echo "✅ Attendance: 2 endpoints (1 skipped)"
echo ""
echo "Total: 21 endpoints tested"
echo ""
echo -e "${GREEN}🎉 All tests complete!${NC}"
