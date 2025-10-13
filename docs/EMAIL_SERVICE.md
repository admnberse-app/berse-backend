# Email Service Documentation

## Overview

The Email Service provides a comprehensive solution for sending transactional and marketing emails in the Berse application. It includes:

- 📧 Multiple email templates (verification, welcome, password reset, events, campaigns)
- 🔄 Email queue system with retry logic
- 📊 Queue monitoring and management
- 🎨 Beautiful HTML email templates with responsive design
- 📝 Plain text fallbacks for all emails
- 🚀 Bulk email support for campaigns

## Features

### Email Templates

1. **Verification Email** - Email address verification with code/link
2. **Welcome Email** - Onboarding email for new users
3. **Password Reset** - Secure password reset with expiring links
4. **Event Emails**:
   - Invitation
   - Confirmation
   - Reminder
   - Cancellation
5. **Campaign Emails** - Marketing emails with custom content
6. **Notification Emails** - Generic notification emails

### Email Queue

- Automatic retry on failure (configurable)
- Scheduled email delivery
- Queue status monitoring
- Priority-based processing

## Configuration

### Environment Variables

```env
# Email Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_SECURE="false"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
FROM_EMAIL="noreply@bersemuka.com"
FROM_NAME="Berse"
SUPPORT_EMAIL="support@bersemuka.com"
APP_URL="http://localhost:5173"
```

### Gmail Setup

1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
3. Use the generated password in `SMTP_PASS`

### Other SMTP Providers

**SendGrid:**
```env
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT=587
SMTP_USER="apikey"
SMTP_PASS="your-sendgrid-api-key"
```

**Mailgun:**
```env
SMTP_HOST="smtp.mailgun.org"
SMTP_PORT=587
SMTP_USER="your-mailgun-username"
SMTP_PASS="your-mailgun-password"
```

**Amazon SES:**
```env
SMTP_HOST="email-smtp.us-east-1.amazonaws.com"
SMTP_PORT=587
SMTP_USER="your-ses-smtp-username"
SMTP_PASS="your-ses-smtp-password"
```

## API Endpoints

### Send Test Email (Development Only)
```http
POST /api/v1/email/test
Content-Type: application/json

{
  "to": "test@example.com"
}
```

### Send Verification Email
```http
POST /api/v1/email/verification
Authorization: Bearer <token>
Content-Type: application/json

{
  "to": "user@example.com",
  "userName": "John Doe",
  "verificationUrl": "https://app.berse.com/verify?token=abc123",
  "verificationCode": "123456",
  "expiresIn": "24 hours"
}
```

### Send Welcome Email
```http
POST /api/v1/email/welcome
Authorization: Bearer <token>
Content-Type: application/json

{
  "to": "user@example.com",
  "userName": "John Doe",
  "loginUrl": "https://app.berse.com/login",
  "exploreUrl": "https://app.berse.com/explore"
}
```

### Send Password Reset Email
```http
POST /api/v1/email/password-reset
Authorization: Bearer <token>
Content-Type: application/json

{
  "to": "user@example.com",
  "userName": "John Doe",
  "resetUrl": "https://app.berse.com/reset?token=xyz789",
  "resetCode": "789012",
  "expiresIn": "1 hour"
}
```

### Send Event Email
```http
POST /api/v1/email/event
Authorization: Bearer <token>
Content-Type: application/json

{
  "to": "user@example.com",
  "type": "invitation",
  "userName": "John Doe",
  "eventTitle": "Community Meetup",
  "eventDescription": "Join us for a fun evening!",
  "eventDate": "2025-10-20T18:00:00Z",
  "eventTime": "6:00 PM",
  "eventLocation": "Cafe Downtown",
  "eventType": "CAFE_MEETUP",
  "hostName": "Jane Smith",
  "maxAttendees": 20,
  "eventUrl": "https://app.berse.com/events/123",
  "rsvpUrl": "https://app.berse.com/events/123/rsvp",
  "mapLink": "https://maps.google.com/..."
}
```

Event types: `invitation`, `confirmation`, `reminder`, `cancellation`

### Send Campaign Email
```http
POST /api/v1/email/campaign
Authorization: Bearer <token>
Content-Type: application/json

{
  "recipients": ["user1@example.com", "user2@example.com"],
  "subject": "Exciting News from Berse!",
  "headline": "New Features Available",
  "content": "<p>We're excited to announce...</p>",
  "preheader": "Check out what's new",
  "imageUrl": "https://example.com/image.jpg",
  "ctaText": "Learn More",
  "ctaUrl": "https://app.berse.com/news",
  "footerText": "Thanks for being part of our community!"
}
```

### Send Bulk Campaign
```http
POST /api/v1/email/campaign/bulk
Authorization: Bearer <token>
Content-Type: application/json

{
  "recipients": ["user1@example.com", "user2@example.com", ...],
  "batchSize": 50,
  "subject": "Weekly Newsletter",
  "headline": "This Week's Highlights",
  "content": "<p>Here's what happened this week...</p>",
  "ctaText": "View More",
  "ctaUrl": "https://app.berse.com/highlights"
}
```

### Get Queue Status
```http
GET /api/v1/email/queue/status
Authorization: Bearer <token>
```

Response:
```json
{
  "success": true,
  "data": {
    "queueLength": 5,
    "processing": false,
    "emails": [...]
  }
}
```

### Clear Queue
```http
DELETE /api/v1/email/queue
Authorization: Bearer <token>
```

## Usage in Code

### Direct Email Sending

```typescript
import { emailService } from '../services/email.service';

// Send verification email
await emailService.sendVerificationEmail('user@example.com', {
  userName: 'John Doe',
  verificationUrl: 'https://app.berse.com/verify?token=abc',
  verificationCode: '123456',
  expiresIn: '24 hours'
});

// Send welcome email
await emailService.sendWelcomeEmail('user@example.com', {
  userName: 'John Doe',
  loginUrl: 'https://app.berse.com/login',
  exploreUrl: 'https://app.berse.com/explore'
});

// Send event reminder
await emailService.sendEventReminderEmail('user@example.com', {
  userName: 'John Doe',
  eventTitle: 'Community Meetup',
  eventDate: new Date('2025-10-20'),
  eventTime: '6:00 PM',
  eventLocation: 'Cafe Downtown',
  eventUrl: 'https://app.berse.com/events/123'
});
```

### Using Email Queue

```typescript
import { emailQueue } from '../services/emailQueue.service';
import { EmailTemplate } from '../types/email.types';

// Add email to queue
const queueId = emailQueue.add(
  'user@example.com',
  EmailTemplate.VERIFICATION,
  {
    userName: 'John Doe',
    verificationUrl: 'https://app.berse.com/verify?token=abc'
  }
);

// Schedule email for later
const scheduledId = emailQueue.add(
  'user@example.com',
  EmailTemplate.EVENT_REMINDER,
  eventData,
  new Date('2025-10-20T10:00:00Z') // Send at this time
);

// Check queue status
const status = emailQueue.getStatus();
console.log(`${status.queueLength} emails in queue`);
```

### Bulk Campaign Sending

```typescript
import { emailService } from '../services/email.service';

const recipients = ['user1@example.com', 'user2@example.com', ...];
const campaignData = {
  subject: 'Monthly Newsletter',
  headline: 'October Updates',
  content: '<p>Here\'s what\'s new this month...</p>',
  ctaText: 'Read More',
  ctaUrl: 'https://app.berse.com/updates'
};

const result = await emailService.sendBulkEmails(
  recipients,
  campaignData,
  50 // batch size
);

console.log(`Sent: ${result.sent}, Failed: ${result.failed}`);
```

## Template Customization

Email templates are defined in `src/utils/emailTemplates.ts`. To customize:

1. Modify the HTML structure in the template functions
2. Update the CSS styles in the `baseTemplate` function
3. Add new template types in `EmailTemplate` enum
4. Create corresponding template functions

### Example: Adding a New Template

1. Add to enum:
```typescript
export enum EmailTemplate {
  // ... existing templates
  BIRTHDAY_GREETING = 'birthday_greeting',
}
```

2. Create template function:
```typescript
const birthdayTemplate = (data: BirthdayEmailData): TemplateRenderResult => {
  const html = baseTemplate(`
    <h2>Happy Birthday, ${data.userName}! 🎉</h2>
    <p>Wishing you a wonderful day!</p>
    <!-- Add more content -->
  `);
  
  const text = `Happy Birthday, ${data.userName}!`;
  
  return { html, text };
};
```

3. Add to renderer:
```typescript
export const renderEmailTemplate = (template: EmailTemplate, data: any) => {
  switch (template) {
    // ... existing cases
    case EmailTemplate.BIRTHDAY_GREETING:
      return birthdayTemplate(data);
  }
};
```

## Testing

### Test Email Configuration

```bash
curl -X POST http://localhost:3000/api/v1/email/test \
  -H "Content-Type: application/json" \
  -d '{"to": "your-email@example.com"}'
```

### Monitor Queue

Check the queue status to see pending emails:
```bash
curl -X GET http://localhost:3000/api/v1/email/queue/status \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Best Practices

1. **Use Queue for Non-Critical Emails**: Add emails to queue for automatic retry
2. **Direct Send for Critical Emails**: Use direct sending for time-sensitive emails
3. **Batch Large Campaigns**: Use bulk sending with appropriate batch sizes
4. **Monitor Queue**: Regularly check queue status in production
5. **Test Templates**: Always test email templates before sending campaigns
6. **Respect Rate Limits**: Configure appropriate delays between batches
7. **Handle Failures**: Implement proper error handling and logging
8. **Unsubscribe Links**: Add unsubscribe links to marketing emails

## Troubleshooting

### Emails Not Sending

1. Check SMTP credentials in `.env`
2. Verify SMTP server allows connections
3. Check firewall/network settings
4. Enable less secure apps (Gmail) or use app passwords
5. Check email service logs

### Emails in Spam

1. Configure SPF, DKIM, and DMARC records
2. Use a verified sender domain
3. Avoid spam trigger words
4. Include unsubscribe links
5. Maintain good sender reputation

### Queue Not Processing

1. Check server is running
2. Verify email service is initialized
3. Check for errors in logs
4. Clear queue if necessary

## Security Considerations

- Store SMTP credentials securely (environment variables)
- Use TLS/SSL for SMTP connections
- Implement rate limiting on email endpoints
- Validate email addresses before sending
- Add authentication to admin endpoints
- Don't expose queue details to unauthorized users
- Sanitize user input in email content

## Future Enhancements

- [ ] Email analytics and tracking
- [ ] A/B testing for campaigns
- [ ] Email template builder UI
- [ ] Integration with email marketing platforms
- [ ] Bounce and complaint handling
- [ ] Email preferences management
- [ ] Scheduled campaigns
- [ ] Email performance metrics
