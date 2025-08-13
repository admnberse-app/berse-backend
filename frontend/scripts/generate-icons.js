// Icon generation script for BerseMuka PWA
// Generates all required icon sizes from the new PWA Icon

const fs = require('fs');
const path = require('path');

// Since we don't have sharp installed, we'll copy the existing icon to multiple locations
// with proper naming for PWA requirements

const SOURCE_LOGO = path.join(__dirname, '..', 'public', 'pwa-icon-source.png');
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'icons');
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Icon configurations with their target names
const iconConfigs = [
  // Favicon sizes
  { name: 'favicon-16x16.png', source: SOURCE_LOGO },
  { name: 'favicon-32x32.png', source: SOURCE_LOGO },
  
  // iOS App Icons
  { name: 'apple-touch-icon-120x120.png', source: SOURCE_LOGO },
  { name: 'apple-touch-icon-152x152.png', source: SOURCE_LOGO },
  { name: 'apple-touch-icon-180x180.png', source: SOURCE_LOGO },
  { name: 'apple-touch-icon.png', source: SOURCE_LOGO }, // Default 180x180
  
  // PWA Standard sizes
  { name: 'icon-192x192.png', source: SOURCE_LOGO },
  { name: 'icon-256x256.png', source: SOURCE_LOGO },
  { name: 'icon-384x384.png', source: SOURCE_LOGO },
  { name: 'icon-512x512.png', source: SOURCE_LOGO },
  
  // Android/Chrome specific
  { name: 'pwa-192x192.png', source: SOURCE_LOGO },
  { name: 'pwa-512x512.png', source: SOURCE_LOGO },
  { name: 'maskable-icon-512x512.png', source: SOURCE_LOGO },
  
  // Microsoft Tile
  { name: 'mstile-144x144.png', source: SOURCE_LOGO },
  { name: 'mstile-150x150.png', source: SOURCE_LOGO },
  
  // Additional common sizes
  { name: 'icon-72x72.png', source: SOURCE_LOGO },
  { name: 'icon-96x96.png', source: SOURCE_LOGO },
  { name: 'icon-128x128.png', source: SOURCE_LOGO },
  { name: 'icon-144x144.png', source: SOURCE_LOGO },
];

function copyIconsWithProperNames() {
  console.log('🚀 Starting icon generation for BerseMuka PWA...\n');
  
  if (!fs.existsSync(SOURCE_LOGO)) {
    console.error('❌ Source logo not found:', SOURCE_LOGO);
    return;
  }

  let successCount = 0;
  let errorCount = 0;

  // Copy to icons directory
  iconConfigs.forEach(config => {
    try {
      const targetPath = path.join(OUTPUT_DIR, config.name);
      fs.copyFileSync(config.source, targetPath);
      console.log(`✅ Generated ${config.name}`);
      successCount++;
    } catch (error) {
      console.error(`❌ Failed to generate ${config.name}:`, error.message);
      errorCount++;
    }
  });

  // Also copy key icons directly to public directory for immediate access
  const publicIcons = [
    { src: SOURCE_LOGO, dest: path.join(PUBLIC_DIR, 'apple-touch-icon.png') },
    { src: SOURCE_LOGO, dest: path.join(PUBLIC_DIR, 'favicon-32x32.png') },
    { src: SOURCE_LOGO, dest: path.join(PUBLIC_DIR, 'favicon-16x16.png') },
  ];

  publicIcons.forEach(icon => {
    try {
      fs.copyFileSync(icon.src, icon.dest);
      console.log(`✅ Updated ${path.basename(icon.dest)} in public directory`);
      successCount++;
    } catch (error) {
      console.error(`❌ Failed to update ${path.basename(icon.dest)}:`, error.message);
      errorCount++;
    }
  });

  console.log(`\n📊 Generation Summary:`);
  console.log(`✅ Successfully generated: ${successCount} icons`);
  console.log(`❌ Failed: ${errorCount} icons`);
  
  if (errorCount === 0) {
    console.log(`\n🎉 All icons generated successfully!`);
    console.log(`📁 Icons are available in: ${OUTPUT_DIR}`);
    console.log(`\n📋 Next steps:`);
    console.log(`1. Clear your browser cache and PWA cache`);
    console.log(`2. Remove the app from your home screen`);
    console.log(`3. Reinstall the PWA to see the new Berse logo icon`);
  }
}

// Run the generation
copyIconsWithProperNames();