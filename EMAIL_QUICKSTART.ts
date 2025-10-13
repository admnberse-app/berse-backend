/**
 * Email Service Quick Start Guide
 * 
 * Follow these steps to get email service working:
 */

// 1. CONFIGURE SMTP CREDENTIALS
// =============================
// Update your .env file with one of these providers:

// OPTION A: Gmail (Recommended for development)
// ---------------------------------------------
// 1. Enable 2-factor authentication on your Gmail account
// 2. Generate an App Password:
//    - Go to: https://myaccount.google.com/apppasswords
//    - Select "Mail" and your device
//    - Copy the generated password
// 3. Update .env:
/*
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_SECURE="false"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-16-character-app-password"
FROM_EMAIL="your-email@gmail.com"
FROM_NAME="Berse"
SUPPORT_EMAIL="support@bersemuka.com"
APP_URL="http://localhost:5173"
*/

// OPTION B: SendGrid (Recommended for production)
// ------------------------------------------------
/*
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT=587
SMTP_SECURE="false"
SMTP_USER="apikey"
SMTP_PASS="your-sendgrid-api-key"
FROM_EMAIL="noreply@yourdomain.com"
FROM_NAME="Berse"
*/

// OPTION C: Mailgun
// -----------------
/*
SMTP_HOST="smtp.mailgun.org"
SMTP_PORT=587
SMTP_SECURE="false"
SMTP_USER="postmaster@your-domain.mailgun.org"
SMTP_PASS="your-mailgun-password"
FROM_EMAIL="noreply@yourdomain.com"
FROM_NAME="Berse"
*/


// 2. TEST EMAIL CONFIGURATION
// ============================
// Once configured, test with this curl command:

/*
curl -X POST http://localhost:3000/api/v1/email/test \
  -H "Content-Type: application/json" \
  -d '{"to": "your-email@example.com"}'
*/


// 3. INTEGRATE WITH YOUR APP
// ===========================

// Example 1: Send verification email on user registration
/*
import { emailQueue } from '../services/emailQueue.service';
import { EmailTemplate } from '../types/email.types';

// In auth.controller.ts - register function
const verificationToken = crypto.randomBytes(32).toString('hex');

emailQueue.add(newUser.email, EmailTemplate.VERIFICATION, {
  userName: newUser.fullName,
  verificationUrl: `${process.env.APP_URL}/verify?token=${verificationToken}`,
  verificationCode: generateCode(), // Optional 6-digit code
  expiresIn: '24 hours'
});
*/

// Example 2: Send welcome email after email verification
/*
emailQueue.add(user.email, EmailTemplate.WELCOME, {
  userName: user.fullName,
  exploreUrl: `${process.env.APP_URL}/explore`,
  loginUrl: `${process.env.APP_URL}/login`
});
*/

// Example 3: Send password reset email
/*
const resetToken = crypto.randomBytes(32).toString('hex');

emailQueue.add(user.email, EmailTemplate.PASSWORD_RESET, {
  userName: user.fullName,
  resetUrl: `${process.env.APP_URL}/reset-password?token=${resetToken}`,
  expiresIn: '1 hour'
});
*/

// Example 4: Send event invitation
/*
import { emailService } from '../services/email.service';

await emailService.sendEventInvitationEmail(user.email, {
  userName: user.fullName,
  eventTitle: event.title,
  eventDate: event.date,
  eventTime: '6:00 PM',
  eventLocation: event.location,
  hostName: host.fullName,
  rsvpUrl: `${process.env.APP_URL}/events/${event.id}/rsvp`,
  mapLink: event.mapLink
});
*/


// 4. AVAILABLE API ENDPOINTS
// ===========================

// Test email (Development only)
// POST /api/v1/email/test
// Body: { "to": "email@example.com" }

// Send verification email
// POST /api/v1/email/verification
// Headers: { "Authorization": "Bearer <token>" }
// Body: {
//   "to": "user@example.com",
//   "userName": "John Doe",
//   "verificationUrl": "https://app.berse.com/verify?token=abc123",
//   "verificationCode": "123456",
//   "expiresIn": "24 hours"
// }

// Send welcome email
// POST /api/v1/email/welcome
// Headers: { "Authorization": "Bearer <token>" }
// Body: {
//   "to": "user@example.com",
//   "userName": "John Doe",
//   "exploreUrl": "https://app.berse.com/explore"
// }

// Send password reset email
// POST /api/v1/email/password-reset
// Headers: { "Authorization": "Bearer <token>" }
// Body: {
//   "to": "user@example.com",
//   "userName": "John Doe",
//   "resetUrl": "https://app.berse.com/reset?token=xyz789",
//   "expiresIn": "1 hour"
// }

// Send event email
// POST /api/v1/email/event
// Headers: { "Authorization": "Bearer <token>" }
// Body: {
//   "to": "user@example.com",
//   "type": "invitation",  // or "confirmation", "reminder", "cancellation"
//   "userName": "John Doe",
//   "eventTitle": "Community Meetup",
//   "eventDate": "2025-10-20T18:00:00Z",
//   "eventLocation": "Cafe Downtown",
//   "rsvpUrl": "https://app.berse.com/events/123/rsvp"
// }

// Send campaign email
// POST /api/v1/email/campaign
// Headers: { "Authorization": "Bearer <token>" }
// Body: {
//   "recipients": ["user1@example.com", "user2@example.com"],
//   "subject": "New Features!",
//   "headline": "Check out what's new",
//   "content": "<p>We've added...</p>",
//   "ctaText": "Explore",
//   "ctaUrl": "https://app.berse.com/features"
// }

// Get queue status
// GET /api/v1/email/queue/status
// Headers: { "Authorization": "Bearer <token>" }

// Clear queue
// DELETE /api/v1/email/queue
// Headers: { "Authorization": "Bearer <token>" }


// 5. TROUBLESHOOTING
// ===================

// Problem: "Email service connection failed"
// Solution: Check SMTP credentials in .env file

// Problem: "Gmail - Username and Password not accepted"
// Solution: Use App Password, not your regular Gmail password

// Problem: "Emails going to spam"
// Solution: 
// - Use a verified sender domain
// - Configure SPF, DKIM, DMARC records
// - Use a reputable SMTP provider

// Problem: "Rate limit exceeded"
// Solution: Adjust batch size in bulk sending or add delays

// For more help, check: docs/EMAIL_SERVICE.md

export {};
