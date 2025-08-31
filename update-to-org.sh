#!/bin/bash

# Script to update git remotes to new organization
# Replace YOUR-ORG-NAME with your actual organization name

ORG_NAME="YOUR-ORG-NAME"  # <-- Change this to your org name (e.g., "nama-fund")

echo "🔄 Updating git remotes to organization: $ORG_NAME"
echo "================================================"

# Show current remotes
echo -e "\n📍 Current remotes:"
git remote -v

# Update origin remote
echo -e "\n🔧 Updating origin remote..."
git remote set-url origin "https://github.com/$ORG_NAME/BerseMuka.git"

# Update origin2 remote if it exists
if git remote get-url origin2 &>/dev/null; then
    echo "🔧 Updating origin2 remote..."
    git remote set-url origin2 "https://github.com/$ORG_NAME/BerseMuka.git"
fi

# Show updated remotes
echo -e "\n✅ Updated remotes:"
git remote -v

echo -e "\n📝 Next steps:"
echo "1. Transfer repository on GitHub:"
echo "   - Go to: https://github.com/raihaan123/BerseMuka/settings"
echo "   - Scroll to 'Danger Zone' → Transfer"
echo "   - New owner: $ORG_NAME"
echo ""
echo "2. Update Netlify deployment:"
echo "   - Go to: https://app.netlify.com"
echo "   - Site settings → Build & deploy → Link repository"
echo "   - Choose: $ORG_NAME/BerseMuka"
echo ""
echo "3. Update Railway deployment:"
echo "   - Go to: https://railway.app"
echo "   - Settings → GitHub → Reconnect to $ORG_NAME/BerseMuka"
echo ""
echo "4. Update verify-deployment.sh:"
echo "   - Change line 39 to: https://github.com/$ORG_NAME/BerseMuka/actions"
echo ""
echo "✨ Done! Repository will be under: https://github.com/$ORG_NAME/BerseMuka"