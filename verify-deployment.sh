#!/bin/bash

echo "🔍 Verifying BerseMuka Deployments..."
echo "======================================="

# Check Backend API
echo -e "\n📡 Backend API (Railway):"
echo "URL: https://api.berse.app"
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://api.berse.app/health)
if [ "$BACKEND_STATUS" == "200" ]; then
    echo "✅ Backend is UP (Status: $BACKEND_STATUS)"
    HEALTH=$(curl -s https://api.berse.app/health)
    echo "Health Response: $HEALTH" | head -c 200
else
    echo "❌ Backend might be down (Status: $BACKEND_STATUS)"
fi

# Check Frontend
echo -e "\n\n🌐 Frontend (Netlify):"
echo "URL: https://berse.app"
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://berse.app)
if [ "$FRONTEND_STATUS" == "200" ]; then
    echo "✅ Frontend is UP (Status: $FRONTEND_STATUS)"
else
    echo "❌ Frontend might be down (Status: $FRONTEND_STATUS)"
fi

# Test API endpoint
echo -e "\n\n🔗 Testing API Connection:"
LOGIN_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://api.berse.app/api/v1/auth/login -X POST -H "Content-Type: application/json" -d '{"email":"test","password":"test"}')
echo "Auth endpoint responding: Status $LOGIN_STATUS"

echo -e "\n======================================="
echo "📌 To manually trigger deployments:"
echo "  - Railway: https://railway.app/dashboard"
echo "  - Netlify: https://app.netlify.com"
echo ""
echo "📝 Check GitHub Actions:"
echo "  https://github.com/raihaan123/BerseMuka/actions"