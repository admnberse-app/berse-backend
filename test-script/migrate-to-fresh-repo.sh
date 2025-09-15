#!/bin/bash

# Script to migrate fork to a fresh repository
# This breaks the fork relationship and allows transfer to organization

echo "🔄 Migrating Fork to Fresh Repository"
echo "====================================="

# Configuration - CHANGE THESE!
YOUR_GITHUB_USERNAME="zaydmahdaly00"  # Your GitHub username
NEW_REPO_NAME="BerseMuka-Fresh"      # Temporary name for new repo
ORG_NAME="berse-app"                 # Your organization name

echo ""
echo "📋 Step 1: Create a new empty repository on GitHub"
echo "   Go to: https://github.com/new"
echo "   Name: $NEW_REPO_NAME"
echo "   Make it PRIVATE initially (you can change later)"
echo "   Do NOT initialize with README, .gitignore, or license"
echo ""
read -p "Press Enter after creating the empty repository..."

echo ""
echo "📦 Step 2: Setting up the fresh repository..."

# Add the new repo as a remote
git remote add fresh "https://github.com/$YOUR_GITHUB_USERNAME/$NEW_REPO_NAME.git"

echo "✅ Added fresh remote"

echo ""
echo "📤 Step 3: Pushing all branches and tags to fresh repo..."

# Push all branches
git push fresh --all

# Push all tags
git push fresh --tags

echo "✅ Pushed all branches and tags"

echo ""
echo "🔄 Step 4: Switching origin to fresh repo..."

# Remove old origin
git remote remove origin

# Rename fresh to origin
git remote rename fresh origin

# If you have origin2, update it too
if git remote get-url origin2 &>/dev/null; then
    git remote set-url origin2 "https://github.com/$YOUR_GITHUB_USERNAME/$NEW_REPO_NAME.git"
fi

echo "✅ Switched to fresh repository"

echo ""
echo "📝 Step 5: Next Manual Steps:"
echo "============================="
echo ""
echo "1. ✅ The fresh repo is created and all code is pushed"
echo ""
echo "2. 🔄 Transfer the fresh repo to your organization:"
echo "   - Go to: https://github.com/$YOUR_GITHUB_USERNAME/$NEW_REPO_NAME/settings"
echo "   - Scroll to 'Danger Zone' → Transfer"
echo "   - New owner: $ORG_NAME"
echo ""
echo "3. 📝 Rename the repository back to 'BerseMuka':"
echo "   - After transfer, go to settings"
echo "   - Rename from '$NEW_REPO_NAME' to 'BerseMuka'"
echo ""
echo "4. 🔗 Update Netlify deployment:"
echo "   - Go to Netlify → Site settings"
echo "   - Relink to: $ORG_NAME/BerseMuka"
echo ""
echo "5. 🔗 Update Railway deployment:"
echo "   - Go to Railway → Settings"
echo "   - Relink to: $ORG_NAME/BerseMuka"
echo ""
echo "6. 🗑️ Delete or archive the old forked repository:"
echo "   - Go to: https://github.com/$YOUR_GITHUB_USERNAME/BerseMuka/settings"
echo "   - Either archive it or delete it"
echo ""
echo "✅ Migration complete! Your repository is no longer a fork."