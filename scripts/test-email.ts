import { emailService } from '../src/services/email.service';
import logger from '../src/utils/logger';

/**
 * Test Email Script
 * Run with: ts-node scripts/test-email.ts <your-email@example.com>
 */

const APP_URL = process.env.APP_URL || 'http://localhost:3000';

async function testAllEmails(recipientEmail: string) {
  console.log('\n🧪 Testing Berse Email System\n');
  console.log('═'.repeat(60));
  
  const results = {
    passed: 0,
    failed: 0,
    tests: [] as Array<{ name: string; status: 'PASS' | 'FAIL' }>
  };

  // Test 1: Verification Email
  try {
    console.log('\n📧 Test 1: Verification Email');
    const success = await emailService.sendVerificationEmail(recipientEmail, {
      userName: 'John Doe',
      verificationUrl: `${APP_URL}/verify?token=test123`,
      verificationCode: '123456',
      expiresIn: '24 hours'
    });
    
    if (success) {
      console.log('✅ PASS - Verification email sent');
      results.passed++;
      results.tests.push({ name: 'Verification Email', status: 'PASS' });
    } else {
      throw new Error('Failed to send');
    }
  } catch (error) {
    console.log('❌ FAIL - Verification email failed');
    results.failed++;
    results.tests.push({ name: 'Verification Email', status: 'FAIL' });
    logger.error('Verification email test failed', { error });
  }

  // Wait between emails
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Test 2: Welcome Email
  try {
    console.log('\n📧 Test 2: Welcome Email');
    const success = await emailService.sendWelcomeEmail(recipientEmail, {
      userName: 'John Doe',
      exploreUrl: `${APP_URL}/explore`
    });
    
    if (success) {
      console.log('✅ PASS - Welcome email sent');
      results.passed++;
      results.tests.push({ name: 'Welcome Email', status: 'PASS' });
    } else {
      throw new Error('Failed to send');
    }
  } catch (error) {
    console.log('❌ FAIL - Welcome email failed');
    results.failed++;
    results.tests.push({ name: 'Welcome Email', status: 'FAIL' });
    logger.error('Welcome email test failed', { error });
  }

  await new Promise(resolve => setTimeout(resolve, 2000));

  // Test 3: Password Reset Email
  try {
    console.log('\n📧 Test 3: Password Reset Email');
    const success = await emailService.sendPasswordResetEmail(recipientEmail, {
      userName: 'John Doe',
      resetUrl: `${APP_URL}/reset-password?token=reset456`,
      resetCode: '654321',
      expiresIn: '1 hour'
    });
    
    if (success) {
      console.log('✅ PASS - Password reset email sent');
      results.passed++;
      results.tests.push({ name: 'Password Reset Email', status: 'PASS' });
    } else {
      throw new Error('Failed to send');
    }
  } catch (error) {
    console.log('❌ FAIL - Password reset email failed');
    results.failed++;
    results.tests.push({ name: 'Password Reset Email', status: 'FAIL' });
    logger.error('Password reset email test failed', { error });
  }

  await new Promise(resolve => setTimeout(resolve, 2000));

  // Test 4: Password Changed Email
  try {
    console.log('\n📧 Test 4: Password Changed Email');
    const success = await emailService.sendPasswordChangedEmail(recipientEmail, {
      userName: 'John Doe',
      changeDate: new Date(),
      ipAddress: '192.168.1.1',
      location: 'Singapore'
    });
    
    if (success) {
      console.log('✅ PASS - Password changed email sent');
      results.passed++;
      results.tests.push({ name: 'Password Changed Email', status: 'PASS' });
    } else {
      throw new Error('Failed to send');
    }
  } catch (error) {
    console.log('❌ FAIL - Password changed email failed');
    results.failed++;
    results.tests.push({ name: 'Password Changed Email', status: 'FAIL' });
    logger.error('Password changed email test failed', { error });
  }

  await new Promise(resolve => setTimeout(resolve, 2000));

  // Test 5: Event Invitation Email
  try {
    console.log('\n📧 Test 5: Event Invitation Email');
    const success = await emailService.sendEventInvitationEmail(recipientEmail, {
      userName: 'John Doe',
      eventTitle: 'Badminton Match at ActiveSG',
      eventDescription: 'Join us for a friendly badminton game! All skill levels welcome.',
      eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      eventTime: '7:00 PM - 9:00 PM',
      eventLocation: 'ActiveSG Badminton Hall, Tampines',
      hostName: 'Jane Smith',
      maxAttendees: 8,
      eventUrl: `${APP_URL}/events/123`,
      rsvpUrl: `${APP_URL}/events/123/rsvp`,
      mapLink: 'https://maps.google.com/?q=ActiveSG+Tampines'
    });
    
    if (success) {
      console.log('✅ PASS - Event invitation email sent');
      results.passed++;
      results.tests.push({ name: 'Event Invitation Email', status: 'PASS' });
    } else {
      throw new Error('Failed to send');
    }
  } catch (error) {
    console.log('❌ FAIL - Event invitation email failed');
    results.failed++;
    results.tests.push({ name: 'Event Invitation Email', status: 'FAIL' });
    logger.error('Event invitation email test failed', { error });
  }

  await new Promise(resolve => setTimeout(resolve, 2000));

  // Test 6: Event Confirmation Email
  try {
    console.log('\n📧 Test 6: Event Confirmation Email');
    const success = await emailService.sendEventConfirmationEmail(recipientEmail, {
      userName: 'John Doe',
      eventTitle: 'Badminton Match at ActiveSG',
      eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      eventTime: '7:00 PM - 9:00 PM',
      eventLocation: 'ActiveSG Badminton Hall, Tampines',
      eventUrl: `${APP_URL}/events/123`,
      cancelUrl: `${APP_URL}/events/123/cancel`
    });
    
    if (success) {
      console.log('✅ PASS - Event confirmation email sent');
      results.passed++;
      results.tests.push({ name: 'Event Confirmation Email', status: 'PASS' });
    } else {
      throw new Error('Failed to send');
    }
  } catch (error) {
    console.log('❌ FAIL - Event confirmation email failed');
    results.failed++;
    results.tests.push({ name: 'Event Confirmation Email', status: 'FAIL' });
    logger.error('Event confirmation email test failed', { error });
  }

  await new Promise(resolve => setTimeout(resolve, 2000));

  // Test 7: Generic Notification Email
  try {
    console.log('\n📧 Test 7: Notification Email');
    const success = await emailService.sendNotificationEmail(
      recipientEmail,
      'New Friend Request',
      'You have received a new friend request from Sarah Lee!',
      `${APP_URL}/friends/requests`,
      'View Friend Request'
    );
    
    if (success) {
      console.log('✅ PASS - Notification email sent');
      results.passed++;
      results.tests.push({ name: 'Notification Email', status: 'PASS' });
    } else {
      throw new Error('Failed to send');
    }
  } catch (error) {
    console.log('❌ FAIL - Notification email failed');
    results.failed++;
    results.tests.push({ name: 'Notification Email', status: 'FAIL' });
    logger.error('Notification email test failed', { error });
  }

  // Print summary
  console.log('\n' + '═'.repeat(60));
  console.log('\n📊 Test Summary\n');
  console.log(`Total Tests: ${results.passed + results.failed}`);
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);
  
  console.log('\n📋 Detailed Results:\n');
  results.tests.forEach((test, index) => {
    const emoji = test.status === 'PASS' ? '✅' : '❌';
    console.log(`${index + 1}. ${emoji} ${test.name}`);
  });

  console.log('\n' + '═'.repeat(60));
  
  if (results.failed === 0) {
    console.log('\n🎉 All email tests passed! Check your inbox at:', recipientEmail);
    console.log('📱 Also check your spam/junk folder if you don\'t see them.');
  } else {
    console.log('\n⚠️  Some tests failed. Check the logs for details.');
    console.log('Common issues:');
    console.log('  - SMTP credentials not configured');
    console.log('  - Firewall blocking SMTP port');
    console.log('  - Invalid email address');
    console.log('  - Rate limiting by email provider');
  }
  
  console.log('\n💡 Tips:');
  console.log('  - Check .env file for SMTP configuration');
  console.log('  - Verify SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS');
  console.log('  - For Gmail, use App Password (not regular password)');
  console.log('  - Check logs/combined.log for detailed error messages\n');

  return results;
}

// Main execution
const main = async () => {
  const recipientEmail = process.argv[2];

  if (!recipientEmail) {
    console.error('❌ Error: No email address provided');
    console.log('\nUsage: ts-node scripts/test-email.ts <your-email@example.com>');
    console.log('Example: ts-node scripts/test-email.ts john@example.com\n');
    process.exit(1);
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(recipientEmail)) {
    console.error('❌ Error: Invalid email address format');
    process.exit(1);
  }

  // Check SMTP configuration
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error('❌ Error: SMTP configuration missing');
    console.log('\nPlease set these environment variables in your .env file:');
    console.log('  SMTP_HOST=smtp.gmail.com');
    console.log('  SMTP_PORT=587');
    console.log('  SMTP_SECURE=false');
    console.log('  SMTP_USER=your-email@gmail.com');
    console.log('  SMTP_PASS=your-app-password\n');
    process.exit(1);
  }

  console.log('📧 Email will be sent to:', recipientEmail);
  console.log('⏳ This will take approximately 15-20 seconds...\n');

  try {
    await testAllEmails(recipientEmail);
    process.exit(0);
  } catch (error) {
    console.error('❌ Fatal error during testing:', error);
    process.exit(1);
  }
};

main();
