import {
  EmailTemplate,
  TemplateRenderResult,
  VerificationEmailData,
  WelcomeEmailData,
  PasswordResetEmailData,
  PasswordChangedEmailData,
  EventEmailData,
  MatchNotificationEmailData,
  PointsEmailData,
  RewardEmailData,
  CampaignEmailData,
  NotificationEmailData,
} from '../types/email.types';

const APP_NAME = 'Berse';
const APP_URL = process.env.APP_URL || 'http://localhost:3000';
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || 'support@bersemuka.com';

/**
 * Base HTML template wrapper
 */
const baseTemplate = (content: string, preheader?: string): string => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>${APP_NAME}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      padding: 0;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #ffffff;
      padding: 30px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
    }
    .content {
      padding: 40px 30px;
    }
    .button {
      display: inline-block;
      padding: 14px 30px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin: 20px 0;
      text-align: center;
    }
    .button:hover {
      opacity: 0.9;
    }
    .footer {
      background-color: #f8f8f8;
      padding: 30px;
      text-align: center;
      font-size: 14px;
      color: #666;
      border-top: 1px solid #e0e0e0;
    }
    .footer a {
      color: #667eea;
      text-decoration: none;
    }
    .preheader {
      display: none;
      max-height: 0;
      overflow: hidden;
    }
    .divider {
      border-top: 1px solid #e0e0e0;
      margin: 30px 0;
    }
    .info-box {
      background-color: #f8f9fa;
      border-left: 4px solid #667eea;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .code-box {
      background-color: #f8f9fa;
      border: 2px dashed #667eea;
      padding: 20px;
      text-align: center;
      font-size: 24px;
      font-weight: bold;
      letter-spacing: 4px;
      color: #667eea;
      margin: 20px 0;
      border-radius: 8px;
    }
    @media only screen and (max-width: 600px) {
      .content {
        padding: 20px 15px;
      }
      .header h1 {
        font-size: 24px;
      }
    }
  </style>
</head>
<body>
  ${preheader ? `<div class="preheader">${preheader}</div>` : ''}
  <div class="container">
    <div class="header">
      <h1>${APP_NAME}</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
      <p>
        <a href="${APP_URL}">Visit Website</a> | 
        <a href="${APP_URL}/privacy">Privacy Policy</a> | 
        <a href="mailto:${SUPPORT_EMAIL}">Contact Support</a>
      </p>
      <p style="margin-top: 15px; font-size: 12px; color: #999;">
        You're receiving this email because you have an account with ${APP_NAME}.
      </p>
    </div>
  </div>
</body>
</html>
`;

/**
 * Verification Email Template
 */
const verificationTemplate = (data: VerificationEmailData): TemplateRenderResult => {
  const html = baseTemplate(`
    <h2>Verify Your Email Address</h2>
    <p>Hi ${data.userName || 'there'},</p>
    <p>Thank you for signing up with ${APP_NAME}! Please verify your email address to get started.</p>
    
    ${data.verificationCode ? `
      <div class="code-box">
        ${data.verificationCode}
      </div>
      <p style="text-align: center; color: #666; font-size: 14px;">Enter this code to verify your email</p>
    ` : ''}
    
    <div style="text-align: center;">
      <a href="${data.verificationUrl}" class="button">Verify Email Address</a>
    </div>
    
    <p style="margin-top: 20px;">Or copy and paste this link into your browser:</p>
    <p style="word-break: break-all; color: #667eea;">${data.verificationUrl}</p>
    
    ${data.expiresIn ? `
      <div class="info-box">
        <strong>⏰ Note:</strong> This verification link will expire in ${data.expiresIn}.
      </div>
    ` : ''}
    
    <p style="margin-top: 30px; color: #666;">If you didn't create an account, you can safely ignore this email.</p>
  `, 'Verify your email address');

  const text = `
Verify Your Email Address

Hi ${data.userName || 'there'},

Thank you for signing up with ${APP_NAME}! Please verify your email address to get started.

${data.verificationCode ? `Verification Code: ${data.verificationCode}\n` : ''}

Click here to verify: ${data.verificationUrl}

${data.expiresIn ? `Note: This link expires in ${data.expiresIn}.\n` : ''}

If you didn't create an account, you can safely ignore this email.

---
${APP_NAME}
${APP_URL}
  `.trim();

  return { html, text };
};

/**
 * Welcome Email Template
 */
const welcomeTemplate = (data: WelcomeEmailData): TemplateRenderResult => {
  const html = baseTemplate(`
    <h2>Welcome to ${APP_NAME}! 🎉</h2>
    <p>Hi ${data.userName},</p>
    <p>We're thrilled to have you join our community! ${APP_NAME} is your gateway to meaningful connections and exciting experiences.</p>
    
    <h3>Here's what you can do:</h3>
    <ul style="line-height: 2;">
      <li>🤝 Connect with like-minded people</li>
      <li>📅 Join exciting events and activities</li>
      <li>⚡ Earn points and unlock rewards</li>
      <li>🎯 Discover new experiences</li>
      <li>💬 Start conversations and build friendships</li>
    </ul>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.exploreUrl || APP_URL}" class="button">Start Exploring</a>
    </div>
    
    <div class="info-box">
      <strong>💡 Pro Tip:</strong> Complete your profile to increase your chances of making great connections!
    </div>
    
    <p style="margin-top: 30px;">Need help getting started? Our support team is here for you at <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>.</p>
    
    <p>Cheers,<br>The ${APP_NAME} Team</p>
  `, `Welcome to ${APP_NAME}!`);

  const text = `
Welcome to ${APP_NAME}! 🎉

Hi ${data.userName},

We're thrilled to have you join our community! ${APP_NAME} is your gateway to meaningful connections and exciting experiences.

Here's what you can do:
- Connect with like-minded people
- Join exciting events and activities
- Earn points and unlock rewards
- Discover new experiences
- Start conversations and build friendships

Start exploring: ${data.exploreUrl || APP_URL}

Pro Tip: Complete your profile to increase your chances of making great connections!

Need help? Contact us at ${SUPPORT_EMAIL}

Cheers,
The ${APP_NAME} Team
  `.trim();

  return { html, text };
};

/**
 * Password Reset Email Template
 */
const passwordResetTemplate = (data: PasswordResetEmailData): TemplateRenderResult => {
  const html = baseTemplate(`
    <h2>Reset Your Password</h2>
    <p>Hi ${data.userName || 'there'},</p>
    <p>We received a request to reset your password. Click the button below to create a new password:</p>
    
    ${data.resetCode ? `
      <div class="code-box">
        ${data.resetCode}
      </div>
      <p style="text-align: center; color: #666; font-size: 14px;">Use this code to reset your password</p>
    ` : ''}
    
    <div style="text-align: center;">
      <a href="${data.resetUrl}" class="button">Reset Password</a>
    </div>
    
    <p style="margin-top: 20px;">Or copy and paste this link into your browser:</p>
    <p style="word-break: break-all; color: #667eea;">${data.resetUrl}</p>
    
    ${data.expiresIn ? `
      <div class="info-box">
        <strong>⏰ Note:</strong> This reset link will expire in ${data.expiresIn}.
      </div>
    ` : ''}
    
    <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
      <strong>⚠️ Security Alert:</strong> If you didn't request a password reset, please ignore this email or contact support if you're concerned.
    </div>
  `, 'Reset your password');

  const text = `
Reset Your Password

Hi ${data.userName || 'there'},

We received a request to reset your password.

${data.resetCode ? `Reset Code: ${data.resetCode}\n` : ''}

Click here to reset: ${data.resetUrl}

${data.expiresIn ? `Note: This link expires in ${data.expiresIn}.\n` : ''}

If you didn't request this, please ignore this email or contact support.

---
${APP_NAME}
${APP_URL}
  `.trim();

  return { html, text };
};

/**
 * Event Invitation Email Template
 */
const eventInvitationTemplate = (data: EventEmailData): TemplateRenderResult => {
  const html = baseTemplate(`
    <h2>You're Invited! 🎉</h2>
    <p>Hi ${data.userName || 'there'},</p>
    <p>You've been invited to an exciting event!</p>
    
    <div class="info-box">
      <h3 style="margin-top: 0;">${data.eventTitle}</h3>
      ${data.eventDescription ? `<p>${data.eventDescription}</p>` : ''}
      <p><strong>📅 Date:</strong> ${new Date(data.eventDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      ${data.eventTime ? `<p><strong>🕐 Time:</strong> ${data.eventTime}</p>` : ''}
      <p><strong>📍 Location:</strong> ${data.eventLocation}</p>
      ${data.hostName ? `<p><strong>👤 Host:</strong> ${data.hostName}</p>` : ''}
      ${data.maxAttendees ? `<p><strong>👥 Max Attendees:</strong> ${data.maxAttendees}</p>` : ''}
    </div>
    
    <div style="text-align: center;">
      <a href="${data.rsvpUrl || data.eventUrl || '#'}" class="button">RSVP Now</a>
    </div>
    
    ${data.mapLink ? `
      <p style="text-align: center; margin-top: 20px;">
        <a href="${data.mapLink}" style="color: #667eea;">📍 View on Map</a>
      </p>
    ` : ''}
    
    <p style="margin-top: 30px;">We look forward to seeing you there!</p>
  `, `You're invited: ${data.eventTitle}`);

  const text = `
You're Invited!

Hi ${data.userName || 'there'},

Event: ${data.eventTitle}
${data.eventDescription ? `\n${data.eventDescription}\n` : ''}
Date: ${new Date(data.eventDate).toLocaleDateString()}
${data.eventTime ? `Time: ${data.eventTime}` : ''}
Location: ${data.eventLocation}
${data.hostName ? `Host: ${data.hostName}` : ''}

RSVP: ${data.rsvpUrl || data.eventUrl || APP_URL}
${data.mapLink ? `Map: ${data.mapLink}` : ''}

We look forward to seeing you there!

---
${APP_NAME}
  `.trim();

  return { html, text };
};

/**
 * Event Confirmation Email Template
 */
const eventConfirmationTemplate = (data: EventEmailData): TemplateRenderResult => {
  const html = baseTemplate(`
    <h2>Event Confirmed! ✅</h2>
    <p>Hi ${data.userName || 'there'},</p>
    <p>Great news! Your attendance has been confirmed for:</p>
    
    <div class="info-box">
      <h3 style="margin-top: 0;">${data.eventTitle}</h3>
      <p><strong>📅 Date:</strong> ${new Date(data.eventDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      ${data.eventTime ? `<p><strong>🕐 Time:</strong> ${data.eventTime}</p>` : ''}
      <p><strong>📍 Location:</strong> ${data.eventLocation}</p>
    </div>
    
    ${data.qrCode ? `
      <div style="text-align: center; margin: 30px 0;">
        <img src="${data.qrCode}" alt="QR Code" style="max-width: 200px; height: auto;">
        <p style="color: #666; font-size: 14px;">Show this QR code at the event for check-in</p>
      </div>
    ` : ''}
    
    <div style="text-align: center;">
      <a href="${data.eventUrl || '#'}" class="button">View Event Details</a>
    </div>
    
    ${data.cancelUrl ? `
      <p style="text-align: center; margin-top: 20px; font-size: 14px;">
        Need to cancel? <a href="${data.cancelUrl}" style="color: #dc3545;">Cancel RSVP</a>
      </p>
    ` : ''}
  `, `Confirmed: ${data.eventTitle}`);

  const text = `
Event Confirmed! ✅

Hi ${data.userName || 'there'},

Your attendance has been confirmed for:

${data.eventTitle}
Date: ${new Date(data.eventDate).toLocaleDateString()}
${data.eventTime ? `Time: ${data.eventTime}` : ''}
Location: ${data.eventLocation}

View details: ${data.eventUrl || APP_URL}
${data.cancelUrl ? `Cancel RSVP: ${data.cancelUrl}` : ''}

See you there!

---
${APP_NAME}
  `.trim();

  return { html, text };
};

/**
 * Event Reminder Email Template
 */
const eventReminderTemplate = (data: EventEmailData): TemplateRenderResult => {
  const html = baseTemplate(`
    <h2>Event Reminder 🔔</h2>
    <p>Hi ${data.userName || 'there'},</p>
    <p>This is a friendly reminder about your upcoming event:</p>
    
    <div class="info-box">
      <h3 style="margin-top: 0;">${data.eventTitle}</h3>
      <p><strong>📅 Date:</strong> ${new Date(data.eventDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      ${data.eventTime ? `<p><strong>🕐 Time:</strong> ${data.eventTime}</p>` : ''}
      <p><strong>📍 Location:</strong> ${data.eventLocation}</p>
    </div>
    
    <div style="text-align: center;">
      <a href="${data.eventUrl || '#'}" class="button">View Event Details</a>
    </div>
    
    ${data.mapLink ? `
      <p style="text-align: center; margin-top: 20px;">
        <a href="${data.mapLink}" style="color: #667eea;">📍 Get Directions</a>
      </p>
    ` : ''}
    
    <p style="margin-top: 30px;">We're excited to see you there!</p>
  `, `Reminder: ${data.eventTitle} is coming up!`);

  const text = `
Event Reminder 🔔

Hi ${data.userName || 'there'},

Upcoming event:

${data.eventTitle}
Date: ${new Date(data.eventDate).toLocaleDateString()}
${data.eventTime ? `Time: ${data.eventTime}` : ''}
Location: ${data.eventLocation}

View details: ${data.eventUrl || APP_URL}
${data.mapLink ? `Directions: ${data.mapLink}` : ''}

See you there!

---
${APP_NAME}
  `.trim();

  return { html, text };
};

/**
 * Event Cancellation Email Template
 */
const eventCancellationTemplate = (data: EventEmailData): TemplateRenderResult => {
  const html = baseTemplate(`
    <h2>Event Cancelled ❌</h2>
    <p>Hi ${data.userName || 'there'},</p>
    <p>We're sorry to inform you that the following event has been cancelled:</p>
    
    <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
      <h3 style="margin-top: 0;">${data.eventTitle}</h3>
      <p><strong>📅 Was scheduled for:</strong> ${new Date(data.eventDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      <p><strong>📍 Location:</strong> ${data.eventLocation}</p>
    </div>
    
    <p>We apologize for any inconvenience this may cause.</p>
    
    <div style="text-align: center;">
      <a href="${APP_URL}/events" class="button">Browse Other Events</a>
    </div>
    
    <p style="margin-top: 30px;">We hope to see you at future events!</p>
  `, `Event cancelled: ${data.eventTitle}`);

  const text = `
Event Cancelled

Hi ${data.userName || 'there'},

We're sorry to inform you that the following event has been cancelled:

${data.eventTitle}
Was scheduled for: ${new Date(data.eventDate).toLocaleDateString()}
Location: ${data.eventLocation}

Browse other events: ${APP_URL}/events

We hope to see you at future events!

---
${APP_NAME}
  `.trim();

  return { html, text };
};

/**
 * Campaign Email Template
 */
const campaignTemplate = (data: CampaignEmailData): TemplateRenderResult => {
  const html = baseTemplate(`
    <h2>${data.headline}</h2>
    ${data.imageUrl ? `
      <div style="text-align: center; margin: 20px 0;">
        <img src="${data.imageUrl}" alt="${data.headline}" style="max-width: 100%; height: auto; border-radius: 8px;">
      </div>
    ` : ''}
    
    <div style="line-height: 1.8;">
      ${data.content}
    </div>
    
    ${data.ctaUrl && data.ctaText ? `
      <div style="text-align: center; margin: 30px 0;">
        <a href="${data.ctaUrl}" class="button">${data.ctaText}</a>
      </div>
    ` : ''}
    
    ${data.footerText ? `
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #666; font-size: 14px;">
        ${data.footerText}
      </div>
    ` : ''}
  `, data.preheader);

  const text = `
${data.headline}

${data.content.replace(/<[^>]*>/g, '')}

${data.ctaUrl && data.ctaText ? `${data.ctaText}: ${data.ctaUrl}` : ''}

${data.footerText || ''}

---
${APP_NAME}
  `.trim();

  return { html, text };
};

/**
 * Generic Notification Email Template
 */
const notificationTemplate = (data: NotificationEmailData): TemplateRenderResult => {
  const html = baseTemplate(`
    <h2>${data.subject}</h2>
    <p>Hi ${data.userName || 'there'},</p>
    
    <div style="line-height: 1.8;">
      ${data.message}
    </div>
    
    ${data.actionUrl && data.actionText ? `
      <div style="text-align: center; margin: 30px 0;">
        <a href="${data.actionUrl}" class="button">${data.actionText}</a>
      </div>
    ` : ''}
  `, data.subject);

  const text = `
${data.subject}

Hi ${data.userName || 'there'},

${data.message.replace(/<[^>]*>/g, '')}

${data.actionUrl && data.actionText ? `${data.actionText}: ${data.actionUrl}` : ''}

---
${APP_NAME}
  `.trim();

  return { html, text };
};

/**
 * Main template renderer
 */
export const renderEmailTemplate = (
  template: EmailTemplate,
  data: any
): TemplateRenderResult => {
  switch (template) {
    case EmailTemplate.VERIFICATION:
      return verificationTemplate(data);
    case EmailTemplate.WELCOME:
      return welcomeTemplate(data);
    case EmailTemplate.PASSWORD_RESET:
      return passwordResetTemplate(data);
    case EmailTemplate.EVENT_INVITATION:
      return eventInvitationTemplate(data);
    case EmailTemplate.EVENT_CONFIRMATION:
      return eventConfirmationTemplate(data);
    case EmailTemplate.EVENT_REMINDER:
      return eventReminderTemplate(data);
    case EmailTemplate.EVENT_CANCELLATION:
      return eventCancellationTemplate(data);
    case EmailTemplate.CAMPAIGN:
      return campaignTemplate(data);
    case EmailTemplate.NOTIFICATION:
      return notificationTemplate(data);
    default:
      return notificationTemplate(data);
  }
};
