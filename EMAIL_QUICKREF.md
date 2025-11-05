# 📧 Email Setup - Quick Reference

## Logo Placement

### Where to place the logo:
```
/public/assets/logos/berse-email-logo.png
```

### Quick Setup:
```bash
# Check logo status and get suggestions
npm run setup:email-logo

# Copy from Berse App Logo folder
cp "./Berse App Logo/Berse App Horizontal words Logo.png" ./public/assets/logos/berse-email-logo.png
```

### Logo Requirements:
- **Format**: PNG (transparent background)
- **Size**: 360x120 pixels (3:1 ratio)
- **File size**: Under 100KB
- **Background**: Transparent or white

## Testing Emails

```bash
# Test all email templates
npm run test:email your@email.com

# Example
npm run test:email john@example.com
```

## Environment Variables

Add to `.env`:
```env
# SMTP Settings
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Email Settings
FROM_EMAIL=noreply@bersemuka.com
FROM_NAME=Berse
SUPPORT_EMAIL=support@bersemuka.com

# App Settings
APP_URL=https://yourdomain.com
LOGO_URL=https://yourdomain.com/assets/logos/berse-email-logo.png
```

## Gmail Setup (Recommended for Testing)

1. Go to Google Account Settings
2. Security → 2-Step Verification → Enable it
3. App Passwords → Generate new password
4. Copy the 16-character password
5. Use in SMTP_PASS in .env

## Quick Send Examples

### 1. Verification Email
```typescript
await emailService.sendVerificationEmail(email, {
  userName: user.name,
  verificationUrl: `${APP_URL}/verify?token=${token}`,
  verificationCode: '123456',
  expiresIn: '24 hours'
});
```

### 2. Welcome Email
```typescript
await emailService.sendWelcomeEmail(email, {
  userName: user.name,
  exploreUrl: `${APP_URL}/explore`
});
```

### 3. Password Reset
```typescript
await emailService.sendPasswordResetEmail(email, {
  userName: user.name,
  resetUrl: `${APP_URL}/reset?token=${token}`,
  expiresIn: '1 hour'
});
```

### 4. Password Changed
```typescript
await emailService.sendPasswordChangedEmail(email, {
  userName: user.name,
  changeDate: new Date(),
  ipAddress: req.ip
});
```

### 5. Event Invitation
```typescript
await emailService.sendEventInvitationEmail(email, {
  userName: user.name,
  eventTitle: 'Badminton Match',
  eventDate: new Date('2025-10-20'),
  eventTime: '7:00 PM',
  eventLocation: 'ActiveSG Hall',
  eventUrl: `${APP_URL}/events/123`
});
```

## Brand Colors Used

- **Primary**: #00B14F (Grab Green)
- **Dark**: #009440
- **Light**: #33C16D

## Troubleshooting

### Emails not sending?
```bash
# Check SMTP connection
grep "Email service" logs/combined.log

# Check for errors
tail -f logs/error.log | grep "Email"
```

### Common Issues:

1. **Connection refused**
   - Check SMTP_HOST and SMTP_PORT
   - Verify firewall allows SMTP

2. **Authentication failed**
   - Use App Password for Gmail
   - Check SMTP_USER and SMTP_PASS

3. **Emails in spam**
   - Set up SPF/DKIM records
   - Use verified domain

4. **Logo not showing**
   - Verify file exists at `/public/assets/logos/berse-email-logo.png`
   - Check LOGO_URL in .env
   - Ensure logo is publicly accessible

## Production Email Services

Consider these for production:

1. **SendGrid** - Free tier: 100 emails/day
2. **AWS SES** - $0.10 per 1,000 emails
3. **Mailgun** - Free tier: 5,000 emails/month
4. **Postmark** - Transactional specialist

## File Structure

```
/public/assets/logos/
  └── berse-email-logo.png       # Place logo here

/src/services/
  ├── email.service.ts           # Email sending service
  └── emailQueue.service.ts      # Queue management

/src/utils/
  └── emailTemplates.ts          # HTML templates

/src/types/
  └── email.types.ts             # TypeScript types

/scripts/
  ├── test-email.ts              # Test script
  └── setup-email-logo.sh        # Logo setup helper
```

## Documentation

- **Complete Guide**: `EMAIL_SETUP_COMPLETE.md`
- **This Quick Ref**: `EMAIL_QUICKREF.md`

## Support

Questions? Check:
1. `EMAIL_SETUP_COMPLETE.md` for detailed docs
2. `logs/combined.log` for service logs
3. `logs/error.log` for errors

---

**Pro Tip**: Test locally first with Gmail, then switch to production email service (SendGrid/SES) for production.
