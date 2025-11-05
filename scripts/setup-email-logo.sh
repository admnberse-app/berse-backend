#!/bin/bash

# Berse Email Logo Setup Script
# This script helps you prepare and place the logo for email templates

echo "🎨 Berse Email Logo Setup"
echo "═══════════════════════════════════════════════════"
echo ""

# Define paths
PUBLIC_DIR="./public/assets/logos"
LOGO_DEST="$PUBLIC_DIR/berse-email-logo.png"

# Create directory if it doesn't exist
echo "📁 Checking directory structure..."
if [ ! -d "$PUBLIC_DIR" ]; then
  echo "   Creating $PUBLIC_DIR"
  mkdir -p "$PUBLIC_DIR"
else
  echo "   ✓ Directory exists"
fi

echo ""
echo "📍 Your logo should be placed at:"
echo "   $LOGO_DEST"
echo ""

# Check if logo already exists
if [ -f "$LOGO_DEST" ]; then
  echo "✅ Logo file found!"
  echo ""
  echo "📊 File Information:"
  ls -lh "$LOGO_DEST"
  echo ""
  
  # Check if it's a PNG file
  if file "$LOGO_DEST" | grep -q "PNG"; then
    echo "✓ File format: PNG (Good!)"
  else
    echo "⚠️  Warning: File is not PNG format"
  fi
  
  # Get image dimensions if ImageMagick is installed
  if command -v identify &> /dev/null; then
    DIMENSIONS=$(identify -format "%wx%h" "$LOGO_DEST" 2>/dev/null)
    if [ $? -eq 0 ]; then
      echo "✓ Dimensions: $DIMENSIONS"
      
      # Extract width and height
      WIDTH=$(echo $DIMENSIONS | cut -d'x' -f1)
      HEIGHT=$(echo $DIMENSIONS | cut -d'x' -f2)
      
      # Check if dimensions are good
      if [ $WIDTH -ge 300 ] && [ $WIDTH -le 400 ] && [ $HEIGHT -ge 80 ] && [ $HEIGHT -le 150 ]; then
        echo "✓ Dimensions are optimal for email"
      else
        echo "⚠️  Recommended: 360x120 pixels (3:1 ratio)"
      fi
    fi
  fi
  
  # Check file size
  SIZE=$(stat -f%z "$LOGO_DEST" 2>/dev/null || stat -c%s "$LOGO_DEST" 2>/dev/null)
  SIZE_KB=$((SIZE / 1024))
  
  if [ $SIZE_KB -lt 100 ]; then
    echo "✓ File size: ${SIZE_KB}KB (Good!)"
  else
    echo "⚠️  File size: ${SIZE_KB}KB (Consider compressing to under 100KB)"
  fi
  
else
  echo "❌ Logo file not found"
  echo ""
  echo "📝 To add your logo:"
  echo ""
  echo "   1. Prepare your logo image:"
  echo "      • Format: PNG with transparent background"
  echo "      • Dimensions: 360px wide x 120px high (or similar 3:1 ratio)"
  echo "      • File size: Under 100KB"
  echo "      • Background: Transparent or white"
  echo ""
  echo "   2. Copy your logo file to:"
  echo "      $LOGO_DEST"
  echo ""
  echo "   3. Or run this command:"
  echo "      cp /path/to/your/logo.png $LOGO_DEST"
  echo ""
fi

echo ""
echo "═══════════════════════════════════════════════════"
echo ""
echo "📚 Available logo files in project:"
echo ""

# List all logo files in the project
find . -type f \( -name "*logo*.png" -o -name "*logo*.svg" \) ! -path "*/node_modules/*" ! -path "*/.git/*" -print | head -20

echo ""
echo "═══════════════════════════════════════════════════"
echo ""
echo "💡 Quick Actions:"
echo ""
echo "   Copy from Berse App Logo folder:"
echo "   cp './Berse App Logo/Berse App Horizontal words Logo.png' '$LOGO_DEST'"
echo ""
echo "   Test if logo is accessible (when server is running):"
echo "   curl -I http://localhost:3000/assets/logos/berse-email-logo.png"
echo ""
echo "═══════════════════════════════════════════════════"
echo ""

# Check if we can suggest a copy command
if [ -f "./Berse App Logo/Berse App Horizontal words Logo.png" ]; then
  echo "🎯 Suggestion:"
  echo "   I found a logo in 'Berse App Logo' folder."
  echo "   Would you like to copy it? Run:"
  echo ""
  echo "   cp './Berse App Logo/Berse App Horizontal words Logo.png' '$LOGO_DEST'"
  echo ""
  echo ""
fi

echo "✨ Next Steps:"
echo "   1. Place your logo at: $LOGO_DEST"
echo "   2. Test emails: npm run test:email your@email.com"
echo "   3. Check documentation: EMAIL_SETUP_COMPLETE.md"
echo ""
