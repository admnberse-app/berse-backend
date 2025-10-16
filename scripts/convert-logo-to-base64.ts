#!/usr/bin/env ts-node

/**
 * Convert logo to base64 for embedded email images
 * This allows emails to display logo without external URL
 */

import * as fs from 'fs';
import * as path from 'path';

const logoPath = path.join(__dirname, '../public/assets/logos/berse-email-logo.png');

try {
  const logoBuffer = fs.readFileSync(logoPath);
  const base64Logo = logoBuffer.toString('base64');
  const dataUri = `data:image/png;base64,${base64Logo}`;
  
  console.log('✅ Logo converted to base64');
  console.log('\n📋 Copy this and add to your .env file:\n');
  console.log(`LOGO_URL_BASE64="${dataUri}"`);
  console.log('\n📊 Stats:');
  console.log(`Original size: ${(logoBuffer.length / 1024).toFixed(2)} KB`);
  console.log(`Base64 size: ${(base64Logo.length / 1024).toFixed(2)} KB`);
  console.log(`Data URI size: ${(dataUri.length / 1024).toFixed(2)} KB`);
  
  if (logoBuffer.length > 100000) {
    console.log('\n⚠️  Warning: Logo is quite large. Consider optimizing it for emails.');
    console.log('Recommended size: < 50KB for faster email loading');
  }
  
} catch (error) {
  console.error('❌ Error reading logo file:', error);
  process.exit(1);
}
