# Email Notification System - Complete Setup Guide

## ✅ What's Been Done

The email notification system has been completely set up with professional templates using your Berse brand colors (#00B14F - Grab Green).

### Email Templates Available

1. **Verification Email** - For email verification during registration
2. **Welcome Email** - Sent after successful registration
3. **Password Reset** - For forgot password functionality
4. **Password Changed** - Confirmation when password is changed
5. **Event Invitation** - For event invites
6. **Event Confirmation** - RSVP confirmation
7. **Event Reminder** - Upcoming event reminders
8. **Event Cancellation** - Event cancellation notices
9. **Campaign Email** - Marketing campaigns
10. **Notification Email** - Generic notifications

### Brand Colors Applied

- **Primary Green**: #00B14F (Grab Green)
- **Primary Dark**: #009440
- **Primary Light**: #33C16D

All templates now feature:
- ✅ Berse green gradient headers
- ✅ Professional button styling
- ✅ Logo integration (placeholder ready)
- ✅ Mobile-responsive design
- ✅ Clean, modern layout
- ✅ HTML and plain text versions

## 📁 Logo File Placement

### Recommended Location
Place your logo file here:
```
/public/assets/logos/berse-email-logo.png
```

### Logo Requirements
- **Format**: PNG with transparent background (recommended)
- **Dimensions**: 360px wide x 120px high (or similar 3:1 ratio)
- **File Size**: Under 100KB (for faster email loading)
- **Background**: Transparent or white
- **Colors**: Should work well on the green gradient header

### Alternative Locations
If you want to use a different location, update the `LOGO_URL` in your `.env` file:
```env
LOGO_URL=https://yourdomain.com/path/to/logo.png
```

## 🛠️ Environment Variables

Make sure these are set in your `.env` file:

```env
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Email Settings
FROM_EMAIL=noreply@bersemuka.com
FROM_NAME=Berse
SUPPORT_EMAIL=support@bersemuka.com

# App URLs
APP_URL=https://yourdomain.com
LOGO_URL=https://yourdomain.com/assets/logos/berse-email-logo.png
```

## 📧 How to Use

### 1. Send Verification Email
```typescript
import { emailService } from './services/email.service';

await emailService.sendVerificationEmail(userEmail, {
  userName: user.name,
  verificationUrl: `${APP_URL}/verify?token=${token}`,
  verificationCode: '123456', // Optional 6-digit code
  expiresIn: '24 hours'
});
```

### 2. Send Welcome Email
```typescript
await emailService.sendWelcomeEmail(userEmail, {
  userName: user.name,
  exploreUrl: `${APP_URL}/explore`
});
```

### 3. Send Password Reset Email
```typescript
await emailService.sendPasswordResetEmail(userEmail, {
  userName: user.name,
  resetUrl: `${APP_URL}/reset-password?token=${resetToken}`,
  resetCode: '654321', // Optional code
  expiresIn: '1 hour'
});
```

### 4. Send Password Changed Email
```typescript
await emailService.sendPasswordChangedEmail(userEmail, {
  userName: user.name,
  changeDate: new Date(),
  ipAddress: req.ip,
  location: 'Singapore' // Optional
});
```

### 5. Send Event Email
```typescript
await emailService.sendEventInvitationEmail(userEmail, {
  userName: user.name,
  eventTitle: 'Badminton Match',
  eventDescription: 'Friendly badminton game at...',
  eventDate: new Date('2025-10-20'),
  eventTime: '7:00 PM',
  eventLocation: 'ActiveSG Badminton Hall',
  hostName: 'John Doe',
  maxAttendees: 8,
  eventUrl: `${APP_URL}/events/123`,
  rsvpUrl: `${APP_URL}/events/123/rsvp`,
  mapLink: 'https://maps.google.com/...'
});
```

## 🧪 Testing Emails

Use the test script to verify your email setup:

```bash
# Test basic email configuration
npm run test:email

# Or manually test
ts-node scripts/test-email.ts
```

## 🎨 Customization

### Modify Template Colors
Edit `/src/utils/emailTemplates.ts`:

```typescript
const PRIMARY_COLOR = '#00B14F'; // Main brand color
const PRIMARY_DARK = '#009440';
const PRIMARY_LIGHT = '#33C16D';
```

### Add Custom Templates
1. Define new template type in `/src/types/email.types.ts`
2. Create template function in `/src/utils/emailTemplates.ts`
3. Add case in `renderEmailTemplate()` switch statement
4. Add method to `/src/services/email.service.ts`

## 📱 Email Service Features

- ✅ Queue system for bulk emails
- ✅ Batch processing to avoid rate limits
- ✅ HTML and plain text versions
- ✅ Attachment support
- ✅ CC/BCC support
- ✅ SMTP connection verification
- ✅ Comprehensive error logging
- ✅ Retry logic for failed emails

## 🔒 Security Best Practices

1. **Never commit SMTP credentials** - Use environment variables
2. **Use app-specific passwords** - For Gmail, use App Passwords
3. **Enable 2FA** - On your email provider account
4. **Verify SMTP connection** - Service automatically verifies on startup
5. **Rate limiting** - Built-in batch processing prevents SMTP throttling
6. **Secure links** - All verification/reset links should expire

## 📊 Monitoring

Check email service logs:
```bash
# View logs
tail -f logs/combined.log | grep "Email"

# Check for errors
tail -f logs/error.log | grep "Email"
```

## 🚀 Production Checklist

- [ ] Logo file placed in `/public/assets/logos/`
- [ ] SMTP credentials configured
- [ ] Domain verified with email provider
- [ ] SPF/DKIM records set up
- [ ] Test all email templates
- [ ] Verify links work correctly
- [ ] Check mobile responsiveness
- [ ] Test spam score (use mail-tester.com)
- [ ] Set up email monitoring/alerts
- [ ] Configure bounce handling

## 🔗 Integration Points

The email service is integrated with:

1. **Auth Routes** (`/src/routes/api/v2/auth.routes.ts`)
   - Registration → Verification email
   - Email verification → Welcome email
   - Forgot password → Reset email
   - Password change → Confirmation email

2. **Event Routes** (`/src/routes/api/v1/event.routes.ts`)
   - Event creation → Invitation emails
   - Event RSVP → Confirmation emails
   - Event updates → Notification emails
   - Event reminders → Scheduled emails

3. **User Routes** (`/src/routes/api/v2/user.routes.ts`)
   - Profile updates → Notification emails
   - Security changes → Alert emails

## 📞 Support

For issues with email setup:
1. Check SMTP credentials are correct
2. Verify port and security settings (587 = TLS, 465 = SSL)
3. Test with Gmail App Password first
4. Check firewall/network allows SMTP
5. Review error logs for specific issues

## 🎉 Next Steps

1. **Place your logo** at `/public/assets/logos/berse-email-logo.png`
2. **Test emails** using the test script
3. **Verify on mobile** by sending test emails to your phone
4. **Set up production SMTP** (SendGrid, AWS SES, etc.)
5. **Monitor email delivery** rates and bounces
