/**
 * Test script for Community QR Code feature
 * 
 * This script tests:
 * 1. QR code generation (authenticated)
 * 2. Public preview access (no auth)
 * 
 * Usage:
 * 1. Update the variables below with your test data
 * 2. Run: ts-node scripts/test-community-qr.ts
 */

import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// CONFIGURATION - Update these values
// ============================================================================

const BASE_URL = process.env.API_URL || 'http://localhost:3000';
const AUTH_TOKEN = process.env.TEST_TOKEN || 'YOUR_ADMIN_TOKEN_HERE';
const TEST_COMMUNITY_ID = process.env.TEST_COMMUNITY_ID || 'YOUR_COMMUNITY_ID_HERE';

// ============================================================================
// TEST FUNCTIONS
// ============================================================================

async function testQRCodeGeneration() {
  console.log('\n🔐 Testing QR Code Generation (Authenticated)...\n');
  
  try {
    const response = await axios.get(
      `${BASE_URL}/v2/communities/${TEST_COMMUNITY_ID}/qr-code`,
      {
        headers: {
          Authorization: `Bearer ${AUTH_TOKEN}`,
        },
      }
    );

    console.log('✅ QR Code generated successfully!');
    console.log('Response:', JSON.stringify(response.data, null, 2));

    // Save QR code to file
    if (response.data.data?.qrCodeDataUrl) {
      const base64Data = response.data.data.qrCodeDataUrl.replace(/^data:image\/png;base64,/, '');
      const outputPath = path.join(__dirname, '..', 'community-qr-code.png');
      fs.writeFileSync(outputPath, base64Data, 'base64');
      console.log(`\n💾 QR code saved to: ${outputPath}`);
      console.log(`📱 Preview URL: ${response.data.data.previewUrl}`);
      console.log(`🔗 Deep Link: ${response.data.data.webUrl}`);
    }

    return response.data;
  } catch (error: any) {
    console.error('❌ QR Code generation failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error:', error.message);
    }
    throw error;
  }
}

async function testPublicPreview() {
  console.log('\n🌐 Testing Public Preview (No Auth)...\n');
  
  try {
    const response = await axios.get(
      `${BASE_URL}/v2/communities/preview/${TEST_COMMUNITY_ID}`
      // No Authorization header - this is public!
    );

    console.log('✅ Public preview retrieved successfully!');
    console.log('Response:', JSON.stringify(response.data, null, 2));

    const preview = response.data.data;
    console.log('\n📊 Preview Summary:');
    console.log(`   Community: ${preview.name}`);
    console.log(`   Verified: ${preview.isVerified ? '✓' : '✗'}`);
    console.log(`   Members: ${preview.memberCount}`);
    console.log(`   Interests: ${preview.interests.join(', ')}`);
    console.log(`   Upcoming Events: ${preview.upcomingEvents.length}`);

    if (preview.upcomingEvents.length > 0) {
      console.log('\n📅 Upcoming Events:');
      preview.upcomingEvents.forEach((event: any, index: number) => {
        console.log(`   ${index + 1}. ${event.title}`);
        console.log(`      📍 ${event.location}`);
        console.log(`      🗓️  ${new Date(event.date).toLocaleDateString()}`);
        console.log(`      💰 ${event.isFree ? 'Free' : `$${event.price}`}`);
      });
    }

    return response.data;
  } catch (error: any) {
    console.error('❌ Public preview retrieval failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error:', error.message);
    }
    throw error;
  }
}

async function testInvalidCommunity() {
  console.log('\n🔍 Testing with invalid community ID...\n');
  
  try {
    await axios.get(`${BASE_URL}/v2/communities/preview/invalid-id-12345`);
    console.log('⚠️  Expected error did not occur');
  } catch (error: any) {
    if (error.response?.status === 404) {
      console.log('✅ Correctly returned 404 for invalid community');
    } else {
      console.log('❌ Unexpected error:', error.response?.status || error.message);
    }
  }
}

async function testUnauthorizedQRGeneration() {
  console.log('\n🔒 Testing unauthorized QR generation...\n');
  
  try {
    await axios.get(
      `${BASE_URL}/v2/communities/${TEST_COMMUNITY_ID}/qr-code`
      // No auth token
    );
    console.log('⚠️  Expected error did not occur');
  } catch (error: any) {
    if (error.response?.status === 401) {
      console.log('✅ Correctly returned 401 for unauthorized request');
    } else {
      console.log('❌ Unexpected error:', error.response?.status || error.message);
    }
  }
}

// ============================================================================
// RUN TESTS
// ============================================================================

async function runTests() {
  console.log('╔════════════════════════════════════════════════════╗');
  console.log('║  Community QR Code Feature - Test Suite           ║');
  console.log('╚════════════════════════════════════════════════════╝');
  console.log(`\nBase URL: ${BASE_URL}`);
  console.log(`Community ID: ${TEST_COMMUNITY_ID}`);

  if (AUTH_TOKEN === 'YOUR_ADMIN_TOKEN_HERE' || TEST_COMMUNITY_ID === 'YOUR_COMMUNITY_ID_HERE') {
    console.error('\n❌ ERROR: Please update AUTH_TOKEN and TEST_COMMUNITY_ID in the script\n');
    process.exit(1);
  }

  const results = {
    qrGeneration: false,
    publicPreview: false,
    invalidCommunity: false,
    unauthorized: false,
  };

  try {
    await testQRCodeGeneration();
    results.qrGeneration = true;
  } catch (error) {
    console.error('\n⚠️  QR generation test failed');
  }

  try {
    await testPublicPreview();
    results.publicPreview = true;
  } catch (error) {
    console.error('\n⚠️  Public preview test failed');
  }

  try {
    await testInvalidCommunity();
    results.invalidCommunity = true;
  } catch (error) {
    console.error('\n⚠️  Invalid community test failed');
  }

  try {
    await testUnauthorizedQRGeneration();
    results.unauthorized = true;
  } catch (error) {
    console.error('\n⚠️  Unauthorized test failed');
  }

  // Summary
  console.log('\n╔════════════════════════════════════════════════════╗');
  console.log('║  Test Summary                                      ║');
  console.log('╚════════════════════════════════════════════════════╝\n');
  console.log(`QR Generation (Auth):      ${results.qrGeneration ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Public Preview (No Auth):  ${results.publicPreview ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Invalid Community (404):   ${results.invalidCommunity ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Unauthorized (401):        ${results.unauthorized ? '✅ PASS' : '❌ FAIL'}`);

  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  console.log(`\nTotal: ${passedTests}/${totalTests} tests passed\n`);

  if (passedTests === totalTests) {
    console.log('🎉 All tests passed!\n');
    process.exit(0);
  } else {
    console.log('⚠️  Some tests failed. Please review the output above.\n');
    process.exit(1);
  }
}

// Run the tests
runTests().catch(error => {
  console.error('\n💥 Fatal error during test execution:', error);
  process.exit(1);
});
