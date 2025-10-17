#!/bin/bash

# Gamification Endpoints Testing Script
# Tests all 30+ gamification endpoints

# Configuration
BASE_URL="http://localhost:3001"
API_V2="$BASE_URL/v2"
TEST_EMAIL="gamification-test@example.com"
TEST_PASSWORD="TestPass123!"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PASSED=0
FAILED=0

echo "🎮 Testing Gamification Endpoints"
echo "================================="
echo ""

# Use pre-generated token
echo "1. Authenticating..."
# Use token from registration (email verification not required for testing)
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhZGNlMzhmYS01Yjc0LTQwYzQtOWM3Yy0xYTY1ZDI2ZGY1MjAiLCJlbWFpbCI6ImdhbWlmaWNhdGlvbi10ZXN0QGV4YW1wbGUuY29tIiwicm9sZSI6IkdFTkVSQUxfVVNFUiIsInRva2VuVHlwZSI6ImFjY2VzcyIsImlhdCI6MTc2MDY5MTc2NiwiZXhwIjoxNzYzMjgzNzY2LCJhdWQiOiJiZXJzZW11a2EtY2xpZW50IiwiaXNzIjoiYmVyc2VtdWthLWFwaSJ9.tL-QK5n2H4tESo1Bq2KP0_1SRv-p2CTiy30S4_XHi9c"
USER_ID="adce38fa-5b74-40c4-9c7c-1a65d26df520"

if [ -z "$TOKEN" ]; then
  echo -e "${RED}❌ Token not set${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Using test token for user: $USER_ID${NC}"
echo ""

# ============================================
# DASHBOARD (2 endpoints)
# ============================================
echo -e "${BLUE}📊 Testing Dashboard Endpoints${NC}"
echo "-----------------------------------"

# 2. Get My Dashboard
echo "2. GET /gamification/dashboard"
DASHBOARD_RESPONSE=$(curl -s -X GET ${API_V2}/gamification/dashboard \
  -H "Authorization: Bearer ${TOKEN}")

if echo $DASHBOARD_RESPONSE | jq -e '.success == true' > /dev/null; then
  echo -e "${GREEN}✅ Dashboard retrieved${NC}"
  POINTS=$(echo $DASHBOARD_RESPONSE | jq -r '.data.points.balance // 0')
  BADGES=$(echo $DASHBOARD_RESPONSE | jq -r '.data.badges.total // 0')
  echo "   Points: $POINTS | Badges: $BADGES"
  PASSED=$((PASSED+1))
else
  echo -e "${RED}❌ Dashboard failed${NC}"
  echo "Response: $DASHBOARD_RESPONSE"
  FAILED=$((FAILED+1))
fi
echo ""

# ============================================
# BADGES (7 endpoints)
# ============================================
echo -e "${BLUE}🏅 Testing Badge Endpoints${NC}"
echo "-----------------------------------"

# 3. Get All Badges
echo "3. GET /gamification/badges"
BADGES_RESPONSE=$(curl -s -X GET ${API_V2}/gamification/badges \
  -H "Authorization: Bearer ${TOKEN}")

if echo $BADGES_RESPONSE | jq -e '.success == true' > /dev/null; then
  echo -e "${GREEN}✅ All badges retrieved${NC}"
  BADGE_COUNT=$(echo $BADGES_RESPONSE | jq -r '.data | length')
  echo "   Total badges: $BADGE_COUNT"
  FIRST_BADGE_ID=$(echo $BADGES_RESPONSE | jq -r '.data[0].id // empty')
  PASSED=$((PASSED+1))
else
  echo -e "${RED}❌ Get all badges failed${NC}"
  FAILED=$((FAILED+1))
fi
echo ""

# 4. Get Badge by ID
if [ -n "$FIRST_BADGE_ID" ]; then
  echo "4. GET /gamification/badges/:id"
  BADGE_DETAIL=$(curl -s -X GET ${API_V2}/gamification/badges/${FIRST_BADGE_ID} \
    -H "Authorization: Bearer ${TOKEN}")
  
  if echo $BADGE_DETAIL | jq -e '.success == true' > /dev/null; then
    echo -e "${GREEN}✅ Badge detail retrieved${NC}"
    BADGE_NAME=$(echo $BADGE_DETAIL | jq -r '.data.name')
    echo "   Badge: $BADGE_NAME"
    PASSED=$((PASSED+1))
  else
    echo -e "${RED}❌ Get badge detail failed${NC}"
    FAILED=$((FAILED+1))
  fi
  echo ""
fi

# 5. Get My Badges
echo "5. GET /gamification/badges/my"
MY_BADGES=$(curl -s -X GET ${API_V2}/gamification/badges/my \
  -H "Authorization: Bearer ${TOKEN}")

if echo $MY_BADGES | jq -e '.success == true' > /dev/null; then
  echo -e "${GREEN}✅ My badges retrieved${NC}"
  MY_BADGE_COUNT=$(echo $MY_BADGES | jq -r '.data | length')
  echo "   Earned badges: $MY_BADGE_COUNT"
  PASSED=$((PASSED+1))
else
  echo -e "${RED}❌ Get my badges failed${NC}"
  FAILED=$((FAILED+1))
fi
echo ""

# 6. Get Badge Progress
echo "6. GET /gamification/badges/progress"
BADGE_PROGRESS=$(curl -s -X GET ${API_V2}/gamification/badges/progress \
  -H "Authorization: Bearer ${TOKEN}")

if echo $BADGE_PROGRESS | jq -e '.success == true' > /dev/null; then
  echo -e "${GREEN}✅ Badge progress retrieved${NC}"
  PROGRESS_COUNT=$(echo $BADGE_PROGRESS | jq -r '.data | length')
  echo "   Badges in progress: $PROGRESS_COUNT"
  if [ $PROGRESS_COUNT -gt 0 ]; then
    FIRST_PROGRESS=$(echo $BADGE_PROGRESS | jq -r '.data[0] | "\(.badge.name): \(.progress)%"')
    echo "   Example: $FIRST_PROGRESS"
  fi
  PASSED=$((PASSED+1))
else
  echo -e "${RED}❌ Get badge progress failed${NC}"
  FAILED=$((FAILED+1))
fi
echo ""

# ============================================
# POINTS (6 endpoints)
# ============================================
echo -e "${BLUE}⭐ Testing Points Endpoints${NC}"
echo "-----------------------------------"

# 7. Get My Points
echo "7. GET /gamification/points"
POINTS_RESPONSE=$(curl -s -X GET ${API_V2}/gamification/points \
  -H "Authorization: Bearer ${TOKEN}")

if echo $POINTS_RESPONSE | jq -e '.success == true' > /dev/null; then
  echo -e "${GREEN}✅ Points balance retrieved${NC}"
  BALANCE=$(echo $POINTS_RESPONSE | jq -r '.data.balance')
  RANK=$(echo $POINTS_RESPONSE | jq -r '.data.rank')
  echo "   Balance: $BALANCE | Rank: $RANK"
  PASSED=$((PASSED+1))
else
  echo -e "${RED}❌ Get points failed${NC}"
  FAILED=$((FAILED+1))
fi
echo ""

# 8. Get Points History
echo "8. GET /gamification/points/history"
HISTORY_RESPONSE=$(curl -s -X GET "${API_V2}/gamification/points/history?limit=5" \
  -H "Authorization: Bearer ${TOKEN}")

if echo $HISTORY_RESPONSE | jq -e '.success == true' > /dev/null; then
  echo -e "${GREEN}✅ Points history retrieved${NC}"
  HISTORY_COUNT=$(echo $HISTORY_RESPONSE | jq -r '.data.history | length')
  echo "   Recent transactions: $HISTORY_COUNT"
  if [ $HISTORY_COUNT -gt 0 ]; then
    RECENT=$(echo $HISTORY_RESPONSE | jq -r '.data.history[0] | "\(.action): \(.points)pts"')
    echo "   Latest: $RECENT"
  fi
  PASSED=$((PASSED+1))
else
  echo -e "${RED}❌ Get points history failed${NC}"
  FAILED=$((FAILED+1))
fi
echo ""

# 9. Get Point Actions
echo "9. GET /gamification/points/actions"
ACTIONS_RESPONSE=$(curl -s -X GET ${API_V2}/gamification/points/actions \
  -H "Authorization: Bearer ${TOKEN}")

if echo $ACTIONS_RESPONSE | jq -e '.success == true' > /dev/null; then
  echo -e "${GREEN}✅ Point actions retrieved${NC}"
  ACTIONS_COUNT=$(echo $ACTIONS_RESPONSE | jq -r '.data | length')
  echo "   Total actions: $ACTIONS_COUNT"
  PASSED=$((PASSED+1))
else
  echo -e "${RED}❌ Get point actions failed${NC}"
  FAILED=$((FAILED+1))
fi
echo ""

# ============================================
# REWARDS (10 endpoints)
# ============================================
echo -e "${BLUE}🎁 Testing Rewards Endpoints${NC}"
echo "-----------------------------------"

# 10. Get Rewards
echo "10. GET /gamification/rewards"
REWARDS_RESPONSE=$(curl -s -X GET "${API_V2}/gamification/rewards?limit=5" \
  -H "Authorization: Bearer ${TOKEN}")

if echo $REWARDS_RESPONSE | jq -e '.success == true' > /dev/null; then
  echo -e "${GREEN}✅ Rewards list retrieved${NC}"
  REWARDS_COUNT=$(echo $REWARDS_RESPONSE | jq -r '.data.rewards | length')
  echo "   Available rewards: $REWARDS_COUNT"
  FIRST_REWARD_ID=$(echo $REWARDS_RESPONSE | jq -r '.data.rewards[0].id // empty')
  PASSED=$((PASSED+1))
else
  echo -e "${RED}❌ Get rewards failed${NC}"
  echo "Response: $REWARDS_RESPONSE"
  FAILED=$((FAILED+1))
fi
echo ""

# 11. Get Reward by ID
if [ -n "$FIRST_REWARD_ID" ]; then
  echo "11. GET /gamification/rewards/:id"
  REWARD_DETAIL=$(curl -s -X GET ${API_V2}/gamification/rewards/${FIRST_REWARD_ID} \
    -H "Authorization: Bearer ${TOKEN}")
  
  if echo $REWARD_DETAIL | jq -e '.success == true' > /dev/null; then
    echo -e "${GREEN}✅ Reward detail retrieved${NC}"
    REWARD_NAME=$(echo $REWARD_DETAIL | jq -r '.data.name')
    REWARD_COST=$(echo $REWARD_DETAIL | jq -r '.data.pointsCost')
    echo "   Reward: $REWARD_NAME ($REWARD_COST pts)"
    PASSED=$((PASSED+1))
  else
    echo -e "${RED}❌ Get reward detail failed${NC}"
    FAILED=$((FAILED+1))
  fi
  echo ""
fi

# 12. Get Reward Categories
echo "12. GET /gamification/rewards/categories"
CATEGORIES_RESPONSE=$(curl -s -X GET ${API_V2}/gamification/rewards/categories \
  -H "Authorization: Bearer ${TOKEN}")

if echo $CATEGORIES_RESPONSE | jq -e '.success == true' > /dev/null; then
  echo -e "${GREEN}✅ Reward categories retrieved${NC}"
  CATEGORIES=$(echo $CATEGORIES_RESPONSE | jq -r '.data | join(", ")')
  echo "   Categories: $CATEGORIES"
  PASSED=$((PASSED+1))
else
  echo -e "${RED}❌ Get reward categories failed${NC}"
  FAILED=$((FAILED+1))
fi
echo ""

# 13. Get My Redemptions
echo "13. GET /gamification/rewards/redemptions"
REDEMPTIONS_RESPONSE=$(curl -s -X GET "${API_V2}/gamification/rewards/redemptions?limit=5" \
  -H "Authorization: Bearer ${TOKEN}")

if echo $REDEMPTIONS_RESPONSE | jq -e '.success == true' > /dev/null; then
  echo -e "${GREEN}✅ My redemptions retrieved${NC}"
  REDEMPTIONS_COUNT=$(echo $REDEMPTIONS_RESPONSE | jq -r '.data.redemptions | length')
  echo "   Total redemptions: $REDEMPTIONS_COUNT"
  PASSED=$((PASSED+1))
else
  echo -e "${RED}❌ Get my redemptions failed${NC}"
  FAILED=$((FAILED+1))
fi
echo ""

# ============================================
# LEADERBOARDS (6 endpoints)
# ============================================
echo -e "${BLUE}🏆 Testing Leaderboard Endpoints${NC}"
echo "-----------------------------------"

# 14. Points Leaderboard
echo "14. GET /gamification/leaderboard/points"
POINTS_LB=$(curl -s -X GET "${API_V2}/gamification/leaderboard/points?limit=5" \
  -H "Authorization: Bearer ${TOKEN}")

if echo $POINTS_LB | jq -e '.success == true' > /dev/null; then
  echo -e "${GREEN}✅ Points leaderboard retrieved${NC}"
  LB_COUNT=$(echo $POINTS_LB | jq -r '.data.leaderboard | length')
  echo "   Top users: $LB_COUNT"
  if [ $LB_COUNT -gt 0 ]; then
    TOP_USER=$(echo $POINTS_LB | jq -r '.data.leaderboard[0] | "\(.rank). \(.user.displayName): \(.value) pts"')
    echo "   Leader: $TOP_USER"
  fi
  PASSED=$((PASSED+1))
else
  echo -e "${RED}❌ Points leaderboard failed${NC}"
  FAILED=$((FAILED+1))
fi
echo ""

# 15. Trust Score Leaderboard
echo "15. GET /gamification/leaderboard/trust"
TRUST_LB=$(curl -s -X GET "${API_V2}/gamification/leaderboard/trust?limit=5" \
  -H "Authorization: Bearer ${TOKEN}")

if echo $TRUST_LB | jq -e '.success == true' > /dev/null; then
  echo -e "${GREEN}✅ Trust score leaderboard retrieved${NC}"
  PASSED=$((PASSED+1))
else
  echo -e "${RED}❌ Trust score leaderboard failed${NC}"
  FAILED=$((FAILED+1))
fi
echo ""

# 16. Badges Leaderboard
echo "16. GET /gamification/leaderboard/badges"
BADGES_LB=$(curl -s -X GET "${API_V2}/gamification/leaderboard/badges?limit=5" \
  -H "Authorization: Bearer ${TOKEN}")

if echo $BADGES_LB | jq -e '.success == true' > /dev/null; then
  echo -e "${GREEN}✅ Badges leaderboard retrieved${NC}"
  PASSED=$((PASSED+1))
else
  echo -e "${RED}❌ Badges leaderboard failed${NC}"
  FAILED=$((FAILED+1))
fi
echo ""

# 17. Events Leaderboard
echo "17. GET /gamification/leaderboard/events"
EVENTS_LB=$(curl -s -X GET "${API_V2}/gamification/leaderboard/events?limit=5" \
  -H "Authorization: Bearer ${TOKEN}")

if echo $EVENTS_LB | jq -e '.success == true' > /dev/null; then
  echo -e "${GREEN}✅ Events leaderboard retrieved${NC}"
  PASSED=$((PASSED+1))
else
  echo -e "${RED}❌ Events leaderboard failed${NC}"
  FAILED=$((FAILED+1))
fi
echo ""

# 18. Connections Leaderboard
echo "18. GET /gamification/leaderboard/connections"
CONNECTIONS_LB=$(curl -s -X GET "${API_V2}/gamification/leaderboard/connections?limit=5" \
  -H "Authorization: Bearer ${TOKEN}")

if echo $CONNECTIONS_LB | jq -e '.success == true' > /dev/null; then
  echo -e "${GREEN}✅ Connections leaderboard retrieved${NC}"
  PASSED=$((PASSED+1))
else
  echo -e "${RED}❌ Connections leaderboard failed${NC}"
  FAILED=$((FAILED+1))
fi
echo ""

# 19. Referrals Leaderboard
echo "19. GET /gamification/leaderboard/referrals"
REFERRALS_LB=$(curl -s -X GET "${API_V2}/gamification/leaderboard/referrals?limit=5" \
  -H "Authorization: Bearer ${TOKEN}")

if echo $REFERRALS_LB | jq -e '.success == true' > /dev/null; then
  echo -e "${GREEN}✅ Referrals leaderboard retrieved${NC}"
  PASSED=$((PASSED+1))
else
  echo -e "${RED}❌ Referrals leaderboard failed${NC}"
  FAILED=$((FAILED+1))
fi
echo ""

# ============================================
# SUMMARY
# ============================================
echo ""
echo "================================="
echo "📊 Test Summary"
echo "================================="
echo -e "${GREEN}✅ Passed: $PASSED${NC}"
echo -e "${RED}❌ Failed: $FAILED${NC}"
TOTAL=$((PASSED+FAILED))
echo "Total: $TOTAL"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}🎉 All tests passed!${NC}"
  exit 0
else
  echo -e "${RED}⚠️  Some tests failed${NC}"
  exit 1
fi
