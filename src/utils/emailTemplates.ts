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

const APP_NAME = 'Berse App';
const APP_URL = process.env.APP_URL || 'http://localhost:3000';
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || 'support@bersemuka.com';
const LOGO_URL = process.env.LOGO_URL || `${APP_URL}/assets/logos/berse-email-logo.png`;
const PRIMARY_COLOR = '#00B14F'; // Grab Green - Main brand color
const PRIMARY_DARK = '#009440';
const PRIMARY_LIGHT = '#33C16D';
const BORDER_RADIUS = '12px';

/**
 * Base HTML template wrapper with improved design
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
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.7;
      color: #333333;
      background-color: #f5f5f5;
      margin: 0;
      padding: 20px 0;
    }
    .email-wrapper {
      background-color: #f5f5f5;
      padding: 40px 20px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: ${BORDER_RADIUS};
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      border: 1px solid #e8e8e8;
    }
    .header {
      background: linear-gradient(135deg, ${PRIMARY_COLOR} 0%, ${PRIMARY_DARK} 100%);
      color: #ffffff;
      padding: 40px 30px;
      text-align: center;
      border-bottom: 4px solid ${PRIMARY_DARK};
    }
    .header img {
      max-width: 160px;
      height: auto;
      margin-bottom: 15px;
      display: block;
      margin-left: auto;
      margin-right: auto;
    }
    .header h1 {
      margin: 0;
      font-size: 26px;
      font-weight: 700;
      letter-spacing: 0.5px;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .content {
      padding: 40px 35px;
      background-color: #ffffff;
    }
    .content h2 {
      color: #1a1a1a;
      font-size: 24px;
      margin-bottom: 20px;
      font-weight: 600;
    }
    .content p {
      margin-bottom: 16px;
      color: #4a4a4a;
      font-size: 15px;
    }
    .button {
      display: inline-block;
      padding: 16px 36px;
      background: linear-gradient(135deg, ${PRIMARY_COLOR} 0%, ${PRIMARY_DARK} 100%);
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      margin: 24px 0;
      text-align: center;
      box-shadow: 0 4px 12px rgba(0, 177, 79, 0.25);
      transition: all 0.3s ease;
      border: none;
    }
    .button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(0, 177, 79, 0.35);
    }
    .footer {
      background: linear-gradient(to bottom, #fafafa 0%, #f0f0f0 100%);
      padding: 35px 30px;
      text-align: center;
      font-size: 13px;
      color: #666666;
      border-top: 2px solid #e8e8e8;
    }
    .footer p {
      margin: 8px 0;
    }
    .footer a {
      color: ${PRIMARY_COLOR};
      text-decoration: none;
      font-weight: 500;
      transition: color 0.2s;
    }
    .footer a:hover {
      color: ${PRIMARY_DARK};
      text-decoration: underline;
    }
    .link {
      color: ${PRIMARY_COLOR};
      text-decoration: none;
      font-weight: 500;
    }
    .preheader {
      display: none;
      max-height: 0;
      overflow: hidden;
      opacity: 0;
    }
    .divider {
      border: 0;
      border-top: 2px solid #e8e8e8;
      margin: 30px 0;
    }
    .info-box {
      background: linear-gradient(to right, #f0fdf4 0%, #f8fdf9 100%);
      border-left: 4px solid ${PRIMARY_COLOR};
      border-radius: 8px;
      padding: 20px;
      margin: 24px 0;
      box-shadow: 0 2px 8px rgba(0, 177, 79, 0.08);
    }
    .info-box h3 {
      margin-top: 0;
      margin-bottom: 12px;
      color: #1a1a1a;
      font-size: 18px;
    }
    .info-box p {
      margin: 8px 0;
      color: #4a4a4a;
    }
    .info-box strong {
      color: #1a1a1a;
      font-weight: 600;
    }
    .code-box {
      background: linear-gradient(135deg, #E6F9EF 0%, #d4f4e0 100%);
      border: 3px solid ${PRIMARY_COLOR};
      border-radius: 12px;
      padding: 28px 20px;
      text-align: center;
      font-size: 36px;
      font-weight: 800;
      letter-spacing: 10px;
      color: ${PRIMARY_DARK};
      margin: 28px 0;
      box-shadow: 0 4px 12px rgba(0, 177, 79, 0.15);
      font-family: 'Courier New', monospace;
    }
    .alert-box {
      background-color: #fff8e6;
      border-left: 4px solid #ffc107;
      border-radius: 8px;
      padding: 20px;
      margin: 24px 0;
      box-shadow: 0 2px 8px rgba(255, 193, 7, 0.1);
    }
    .alert-box strong {
      color: #f57c00;
      font-weight: 600;
    }
    ul {
      padding-left: 20px;
      margin: 16px 0;
    }
    ul li {
      margin: 10px 0;
      color: #4a4a4a;
      font-size: 15px;
    }
    @media only screen and (max-width: 600px) {
      .email-wrapper {
        padding: 20px 10px;
      }
      .content {
        padding: 30px 20px;
      }
      .header {
        padding: 30px 20px;
      }
      .header h1 {
        font-size: 22px;
      }
      .content h2 {
        font-size: 20px;
      }
      .code-box {
        font-size: 28px;
        letter-spacing: 6px;
        padding: 20px 15px;
      }
      .button {
        display: block;
        padding: 14px 24px;
      }
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    ${preheader ? `<div class="preheader">${preheader}</div>` : ''}
    <div class="container">
      <div class="header">
        <img src="${LOGO_URL}" alt="${APP_NAME} Logo" style="max-width: 160px; height: auto;" />
        <h1>${APP_NAME}</h1>
      </div>
      <div class="content">
        ${content}
      </div>
      <div class="footer">
        <p style="font-weight: 600; color: #4a4a4a; margin-bottom: 12px;">© ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
        <p style="margin: 12px 0;">
          <a href="${APP_URL}">Visit Website</a> • 
          <a href="${APP_URL}/privacy">Privacy Policy</a> • 
          <a href="mailto:${SUPPORT_EMAIL}">Support</a>
        </p>
        <p style="margin-top: 16px; font-size: 12px; color: #999999;">
          You're receiving this email because you have an account with ${APP_NAME}.
        </p>
      </div>
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
    <h2>🎉 Welcome! Verify Your Email</h2>
    <p>Hi <strong>${data.userName || 'there'}</strong>,</p>
    <p>Thank you for joining ${APP_NAME}! We're excited to have you on board. To get started and unlock all features, please verify your email address.</p>
    
    ${data.verificationCode ? `
      <div class="code-box">
        ${data.verificationCode}
      </div>
      <p style="text-align: center; color: #666; font-size: 14px; margin-top: -10px;">Enter this code to verify your email</p>
    ` : ''}
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="${data.verificationUrl}" class="button">✓ Verify Email Address</a>
    </div>
    
    <div style="background-color: #f8f9fa; border-radius: 8px; padding: 16px; margin: 20px 0;">
      <p style="margin: 0; font-size: 13px; color: #666;">
        <strong>Can't click the button?</strong><br>
        Copy and paste this link into your browser:<br>
        <span style="color: ${PRIMARY_COLOR}; word-break: break-all; font-size: 12px;">${data.verificationUrl}</span>
      </p>
    </div>
    
    ${data.expiresIn ? `
      <div class="info-box">
        <p style="margin: 0;"><strong>⏰ Important:</strong> This verification link will expire in <strong>${data.expiresIn}</strong> for security reasons.</p>
      </div>
    ` : ''}
    
    <hr class="divider" />
    
    <p style="font-size: 13px; color: #888; margin-top: 24px;">
      <strong>Didn't create an account?</strong><br>
      If you didn't sign up for ${APP_NAME}, you can safely ignore this email.
    </p>
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
    <h2>🎊 Welcome to ${APP_NAME}!</h2>
    <p>Hi <strong>${data.userName}</strong>,</p>
    <p>We're absolutely thrilled to have you join our community! You're now part of something special – a platform designed to bring people together through meaningful connections and exciting experiences.</p>
    
    <div style="background: linear-gradient(135deg, #f0fdf4 0%, #e6f9ef 100%); border-radius: 12px; padding: 24px; margin: 24px 0; border: 2px solid ${PRIMARY_LIGHT};">
      <h3 style="margin: 0 0 16px 0; color: ${PRIMARY_DARK}; font-size: 18px;">🚀 Here's what you can do:</h3>
      <ul style="margin: 0; padding-left: 20px; line-height: 2;">
        <li><strong>🤝 Connect</strong> with like-minded people</li>
        <li><strong>📅 Join</strong> exciting events and activities</li>
        <li><strong>⚡ Earn</strong> points and unlock rewards</li>
        <li><strong>🎯 Discover</strong> new experiences</li>
        <li><strong>💬 Build</strong> lasting friendships</li>
      </ul>
    </div>
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="${data.exploreUrl || APP_URL}" class="button">🌟 Start Exploring Now</a>
    </div>
    
    <div class="info-box">
      <p style="margin: 0;"><strong>💡 Pro Tip:</strong> Complete your profile to increase your chances of making great connections and getting more event recommendations!</p>
    </div>
    
    <hr class="divider" />
    
    <p style="font-size: 14px;">Need help getting started? Our support team is always here for you at <a href="mailto:${SUPPORT_EMAIL}" class="link">${SUPPORT_EMAIL}</a>.</p>
    
    <p style="margin-top: 24px; font-size: 15px;"><strong>Cheers,</strong><br>The ${APP_NAME} Team 🎉</p>
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
    <h2>🔑 Reset Your Password</h2>
    <p>Hi <strong>${data.userName || 'there'}</strong>,</p>
    <p>We received a request to reset your password for your ${APP_NAME} account. Don't worry – it happens to the best of us!</p>
    
    ${data.resetCode ? `
      <div class="code-box">
        ${data.resetCode}
      </div>
      <p style="text-align: center; color: #666; font-size: 14px; margin-top: -10px;">Use this code to reset your password</p>
    ` : ''}
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="${data.resetUrl}" class="button">🔒 Reset Password</a>
    </div>
    
    <div style="background-color: #f8f9fa; border-radius: 8px; padding: 16px; margin: 20px 0;">
      <p style="margin: 0; font-size: 13px; color: #666;">
        <strong>Can't click the button?</strong><br>
        Copy and paste this link into your browser:<br>
        <span style="color: ${PRIMARY_COLOR}; word-break: break-all; font-size: 12px;">${data.resetUrl}</span>
      </p>
    </div>
    
    ${data.expiresIn ? `
      <div class="info-box">
        <p style="margin: 0;"><strong>⏰ Important:</strong> This reset link will expire in <strong>${data.expiresIn}</strong> for security reasons.</p>
      </div>
    ` : ''}
    
    <div class="alert-box">
      <p style="margin: 0;"><strong>⚠️ Security Alert:</strong> If you didn't request a password reset, please ignore this email. Your account is still secure. If you're concerned, please contact our support team.</p>
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
 * Password Changed Email Template
 */
const passwordChangedTemplate = (data: PasswordChangedEmailData): TemplateRenderResult => {
  const html = baseTemplate(`
    <h2>✅ Password Changed Successfully</h2>
    <p>Hi <strong>${data.userName || 'there'}</strong>,</p>
    <p>This is a confirmation that your password was successfully changed on your ${APP_NAME} account.</p>
    
    <div style="background: linear-gradient(to right, #f0fdf4 0%, #e6f9ef 100%); border-radius: 12px; padding: 20px; margin: 24px 0; border: 2px solid ${PRIMARY_LIGHT};">
      <h3 style="margin: 0 0 12px 0; color: ${PRIMARY_DARK}; font-size: 16px;">📋 Change Details:</h3>
      <p style="margin: 8px 0;"><strong>🕐 Changed at:</strong> ${new Date(data.changeDate).toLocaleString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}</p>
      ${data.ipAddress ? `<p style="margin: 8px 0;"><strong>🌐 IP Address:</strong> ${data.ipAddress}</p>` : ''}
      ${data.location ? `<p style="margin: 8px 0;"><strong>📍 Location:</strong> ${data.location}</p>` : ''}
    </div>
    
    <div class="alert-box">
      <p style="margin: 0;"><strong>⚠️ Security Alert:</strong> If you didn't make this change, your account may be compromised. Please contact our support team immediately at <a href="mailto:${SUPPORT_EMAIL}" style="color: #f57c00; font-weight: 600;">${SUPPORT_EMAIL}</a></p>
    </div>
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="${APP_URL}/settings/security" class="button">🔒 Review Security Settings</a>
    </div>
    
    <hr class="divider" />
    
    <p style="margin-top: 24px; font-size: 14px;"><strong>Stay safe,</strong><br>The ${APP_NAME} Team 🛡️</p>
  `, 'Your password was changed');

  const text = `
Password Changed Successfully ✅

Hi ${data.userName || 'there'},

This is a confirmation that your password was successfully changed.

Changed at: ${new Date(data.changeDate).toLocaleString()}
${data.ipAddress ? `IP Address: ${data.ipAddress}` : ''}
${data.location ? `Location: ${data.location}` : ''}

⚠️ Security Alert: If you didn't make this change, please contact our support team immediately at ${SUPPORT_EMAIL}

Review your security settings: ${APP_URL}/settings/security

Stay safe,
The ${APP_NAME} Team

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
    <h2>🎉 You're Invited to an Event!</h2>
    <p>Hi <strong>${data.userName || 'there'}</strong>,</p>
    <p>Great news! You've been invited to join an exciting event. We'd love to see you there!</p>
    
    <div style="background: linear-gradient(135deg, #f0fdf4 0%, #e6f9ef 100%); border-radius: 12px; padding: 24px; margin: 24px 0; border: 2px solid ${PRIMARY_COLOR};">
      <h3 style="margin: 0 0 16px 0; color: ${PRIMARY_DARK}; font-size: 22px;">${data.eventTitle}</h3>
      ${data.eventDescription ? `<p style="margin: 0 0 16px 0; color: #4a4a4a; font-style: italic;">${data.eventDescription}</p>` : ''}
      <div style="background-color: white; border-radius: 8px; padding: 16px; margin-top: 16px;">
        <p style="margin: 8px 0;"><strong>📅 Date:</strong> ${new Date(data.eventDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        ${data.eventTime ? `<p style="margin: 8px 0;"><strong>🕐 Time:</strong> ${data.eventTime}</p>` : ''}
        <p style="margin: 8px 0;"><strong>📍 Location:</strong> ${data.eventLocation}</p>
        ${data.hostName ? `<p style="margin: 8px 0;"><strong>👤 Host:</strong> ${data.hostName}</p>` : ''}
        ${data.maxAttendees ? `<p style="margin: 8px 0;"><strong>👥 Max Attendees:</strong> ${data.maxAttendees}</p>` : ''}
      </div>
    </div>
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="${data.rsvpUrl || data.eventUrl || '#'}" class="button">✓ RSVP Now</a>
    </div>
    
    ${data.mapLink ? `
      <div style="text-align: center; margin: 20px 0;">
        <a href="${data.mapLink}" class="link" style="font-size: 15px;">📍 View Location on Map →</a>
      </div>
    ` : ''}
    
    <hr class="divider" />
    
    <p style="margin-top: 24px; font-size: 15px;">We look forward to seeing you there! 🎊</p>
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
        <a href="${data.mapLink}" class="link">📍 Get Directions</a>
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
    <h2>📬 ${data.subject}</h2>
    <p>Hi <strong>${data.userName || 'there'}</strong>,</p>
    
    <div style="background-color: #f8f9fa; border-radius: 12px; padding: 24px; margin: 24px 0; line-height: 1.8;">
      ${data.message}
    </div>
    
    ${data.actionUrl && data.actionText ? `
      <div style="text-align: center; margin: 32px 0;">
        <a href="${data.actionUrl}" class="button">${data.actionText}</a>
      </div>
    ` : ''}
    
    <hr class="divider" />
    
    <p style="font-size: 14px; color: #666; margin-top: 24px;">This is an automated notification from ${APP_NAME}.</p>
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
    case EmailTemplate.PASSWORD_CHANGED:
      return passwordChangedTemplate(data);
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
