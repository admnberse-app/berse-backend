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
  EmailChangeVerificationData,
  EmailChangeAlertData,
} from '../types/email.types';
import {
  MarketplaceOrderReceiptData,
  MarketplaceOrderConfirmationData,
  MarketplaceShippingNotificationData,
  EventTicketReceiptData,
  EventTicketConfirmationData,
  EventReminderWithTicketData,
  RefundConfirmationData,
  PayoutNotificationData,
} from '../types/payment-email.types';

const APP_NAME = 'Berse App';
const APP_URL = process.env.APP_URL || 'http://localhost:3000';
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || 'support@bersemuka.com';
const LOGO_URL = process.env.LOGO_URL || 'https://staging-berse-app.sgp1.cdn.digitaloceanspaces.com/app-assets/berse-horizontal.png';
const COMPANY_NAME = process.env.COMPANY_NAME || 'Bersemuka App Venture Sdn Bhd';
const COMPANY_ADDRESS = process.env.COMPANY_ADDRESS || 'Jln Palimbayan Indah 1, Kpg Palimbayan Indah, Sungai Penchala, 60000 Kuala Lumpur, Malaysia';
const PRIMARY_COLOR = '#00B14F'; // Grab Green - Main brand color
const PRIMARY_DARK = '#009440';
const PRIMARY_LIGHT = '#33C16D';
const TEXT_SECONDARY = '#6B7280'; // Gray for secondary text
const BORDER_RADIUS = '12px';

/**
 * Reusable Email Components
 * These components ensure consistency across all email templates
 */

// Standard greeting
const greeting = (userName: string) => 
  `<p>Hi <strong>${userName || 'there'}</strong>,</p>`;

// Standard closing signature
const signature = () => 
  `<p style="margin-top: 24px; font-size: 14px;"><strong>Best regards,</strong><br>The ${APP_NAME} Team</p>`;

// Info box component (green background)
const infoBox = (title: string, content: string) => `
  <div style="background: linear-gradient(to right, #f0fdf4 0%, #e6f9ef 100%); border-radius: 12px; padding: 20px; margin: 24px 0; border: 2px solid ${PRIMARY_LIGHT};">
    <h3 style="margin: 0 0 12px 0; color: ${PRIMARY_DARK}; font-size: 16px;">${title}</h3>
    ${content}
  </div>
`;

// Warning box component (yellow/orange background)
const warningBox = (title: string, content: string) => `
  <div class="alert-box">
    <p style="margin: 0;"><strong>${title}</strong></p>
    ${content}
  </div>
`;

// Success box component (green background)
const successBox = (title: string, content: string) => `
  <div style="background: linear-gradient(to right, #f0fdf4 0%, #e6f9ef 100%); border-radius: 12px; padding: 20px; margin: 24px 0; border: 2px solid ${PRIMARY_LIGHT};">
    <h3 style="margin: 0 0 12px 0; color: ${PRIMARY_DARK}; font-size: 16px;">✓ ${title}</h3>
    ${content}
  </div>
`;

// Danger box component (red background)
const dangerBox = (title: string, content: string) => `
  <div style="background: linear-gradient(to right, #fef2f2 0%, #fef9f9 100%); border-radius: 12px; padding: 20px; margin: 24px 0; border: 2px solid #ef4444;">
    <h3 style="margin: 0 0 12px 0; color: #dc2626; font-size: 16px;">⚠️ ${title}</h3>
    ${content}
  </div>
`;

// Info box component (blue background)
const noticeBox = (title: string, content: string) => `
  <div style="background: #e0f7fa; border-radius: 12px; padding: 20px; margin: 24px 0; border: 2px solid #0891b2;">
    <h3 style="margin: 0 0 12px 0; color: #0e7490; font-size: 16px;">${title}</h3>
    ${content}
  </div>
`;

// Call-to-action button component
const ctaButton = (text: string, url: string, color?: string) => `
  <div style="text-align: center; margin: 32px 0;">
    <a href="${url}" class="button" style="${color ? `background: ${color};` : ''}">${text}</a>
  </div>
`;

// Divider component
const divider = () => `<hr class="divider" />`;

// Detail item (key-value pair)
const detailItem = (label: string, value: string) => 
  `<p style="margin: 8px 0;"><strong>${label}:</strong> ${value}</p>`;

// Security alert footer component
const securityAlert = (supportUrl?: string) => `
  <p style="font-size: 14px; color: #64748b; margin-top: 24px;">
    If you didn't request this action, please <a href="${supportUrl || `${APP_URL}/support`}" style="color: ${PRIMARY_COLOR};">contact support</a> immediately.
  </p>
`;

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
      padding: 30px 30px;
      text-align: center;
      border-bottom: 4px solid ${PRIMARY_DARK};
    }
    .header img {
      max-width: 200px;
      height: auto;
      display: block;
      margin-left: auto;
      margin-right: auto;
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
        padding: 25px 20px;
      }
      .header img {
        max-width: 160px;
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
        <img src="${LOGO_URL}" alt="${APP_NAME} Logo" width="200" style="max-width: 200px; width: 200px; height: auto; display: block; margin: 0 auto; border: 0;" />
      </div>
      <div class="content">
        ${content}
      </div>
      <div class="footer">
        <p style="font-weight: 600; color: #4a4a4a; margin-bottom: 12px;">© ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
        <p style="margin: 12px 0;">
          <a href="${APP_URL}">Visit Website</a> • 
          <a href="${APP_URL}/privacy">Privacy Policy</a> • 
          <a href="${APP_URL}/terms">Terms of Service</a> • 
          <a href="mailto:${SUPPORT_EMAIL}">Support</a>
        </p>
        <p style="margin: 16px 0 8px 0; font-size: 12px; color: #999999;">
          You're receiving this email because you have an account with ${APP_NAME}.
        </p>
        <p style="margin: 8px 0; font-size: 12px; color: #999999;">
          ${COMPANY_NAME}<br/>
          ${COMPANY_ADDRESS}
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
    <h2>Verify Your Email</h2>
    <p>Hi <strong>${data.userName || 'there'}</strong>,</p>
    <p>Thank you for joining ${APP_NAME}! We're excited to have you on board. To get started and unlock all features, please verify your email address.</p>
    
    ${data.verificationCode ? `
      <div class="code-box">
        ${data.verificationCode}
      </div>
      <p style="text-align: center; color: #666; font-size: 14px; margin-top: -10px;">Enter this code to verify your email</p>
    ` : ''}
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="${data.verificationUrl}" class="button">Verify Email Address</a>
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
        <p style="margin: 0;"><strong>Important:</strong> This verification link will expire in <strong>${data.expiresIn}</strong> for security reasons.</p>
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
    <h2>Welcome to ${APP_NAME}!</h2>
    <p>Hi <strong>${data.userName}</strong>,</p>
    <p>We're thrilled to have you join our community! You're now part of something special – a platform designed to bring people together through meaningful connections and exciting experiences.</p>
    
    <div style="background: linear-gradient(135deg, #f0fdf4 0%, #e6f9ef 100%); border-radius: 12px; padding: 24px; margin: 24px 0; border: 2px solid ${PRIMARY_LIGHT};">
      <h3 style="margin: 0 0 16px 0; color: ${PRIMARY_DARK}; font-size: 18px;">Here's what you can do:</h3>
      <ul style="margin: 0; padding-left: 20px; line-height: 2;">
        <li><strong>Connect</strong> with like-minded people</li>
        <li><strong>Join</strong> exciting events and activities</li>
        <li><strong>Earn</strong> points and unlock rewards</li>
        <li><strong>Discover</strong> new experiences</li>
        <li><strong>Build</strong> lasting friendships</li>
      </ul>
    </div>
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="${data.exploreUrl || APP_URL}" class="button">Start Exploring</a>
    </div>
    
    <div class="info-box">
      <p style="margin: 0;"><strong>Pro Tip:</strong> Complete your profile to increase your chances of making great connections and getting more event recommendations!</p>
    </div>
    
    <hr class="divider" />
    
    <p style="font-size: 14px;">Need help getting started? Our support team is always here for you at <a href="mailto:${SUPPORT_EMAIL}" class="link">${SUPPORT_EMAIL}</a>.</p>
    
    <p style="margin-top: 24px; font-size: 15px;"><strong>Best regards,</strong><br>The ${APP_NAME} Team</p>
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
    <p>Hi <strong>${data.userName || 'there'}</strong>,</p>
    <p>We received a request to reset your password for your ${APP_NAME} account. Don't worry – it happens to the best of us!</p>
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="${data.resetUrl}" class="button">Reset Password</a>
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
        <p style="margin: 0;"><strong>Important:</strong> This reset link will expire in <strong>${data.expiresIn}</strong> for security reasons.</p>
      </div>
    ` : ''}
    
    <div class="alert-box">
      <p style="margin: 0;"><strong>Security Alert:</strong> If you didn't request a password reset, please ignore this email. Your account is still secure. If you're concerned, please contact our support team.</p>
    </div>
  `, 'Reset your password');

  const text = `
Reset Your Password

Hi ${data.userName || 'there'},

We received a request to reset your password.

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
    <h2>Password Changed Successfully</h2>
    <p>Hi <strong>${data.userName || 'there'}</strong>,</p>
    <p>This is a confirmation that your password was successfully changed on your ${APP_NAME} account.</p>
    
    <div style="background: linear-gradient(to right, #f0fdf4 0%, #e6f9ef 100%); border-radius: 12px; padding: 20px; margin: 24px 0; border: 2px solid ${PRIMARY_LIGHT};">
      <h3 style="margin: 0 0 12px 0; color: ${PRIMARY_DARK}; font-size: 16px;">Change Details:</h3>
      <p style="margin: 8px 0;"><strong>Changed at:</strong> ${new Date(data.changeDate).toLocaleString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}</p>
      ${data.ipAddress ? `<p style="margin: 8px 0;"><strong>IP Address:</strong> ${data.ipAddress}</p>` : ''}
      ${data.location ? `<p style="margin: 8px 0;"><strong>Location:</strong> ${data.location}</p>` : ''}
    </div>
    
    <div class="alert-box">
      <p style="margin: 0;"><strong>Security Alert:</strong> If you didn't make this change, your account may be compromised. Please contact our support team immediately at <a href="mailto:${SUPPORT_EMAIL}" style="color: #f57c00; font-weight: 600;">${SUPPORT_EMAIL}</a></p>
    </div>
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="${APP_URL}/settings/security" class="button">Review Security Settings</a>
    </div>
    
    <hr class="divider" />
    
    <p style="margin-top: 24px; font-size: 14px;"><strong>Stay safe,</strong><br>The ${APP_NAME} Team</p>
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
 * Email Change Verification Template
 */
const emailChangeVerificationTemplate = (data: EmailChangeVerificationData): TemplateRenderResult => {
  const html = baseTemplate(`
    <h2>Verify Your New Email Address</h2>
    <p>Hi <strong>${data.userName || 'there'}</strong>,</p>
    <p>You requested to change your email address to:</p>
    
    <div style="background: linear-gradient(to right, #f0fdf4 0%, #e6f9ef 100%); border-radius: 12px; padding: 20px; margin: 24px 0; border: 2px solid ${PRIMARY_LIGHT}; text-align: center;">
      <p style="font-size: 18px; font-weight: 600; color: ${PRIMARY_DARK}; margin: 0;">${data.newEmail}</p>
    </div>
    
    <p>To complete this change, please verify your new email address by clicking the button below or entering the verification code:</p>
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="${data.verificationUrl}" class="button">Verify New Email Address</a>
    </div>
    
    <div style="background: #f5f5f5; border-radius: 8px; padding: 16px; margin: 24px 0; text-align: center;">
      <p style="margin: 0 0 8px 0; font-size: 14px; color: ${TEXT_SECONDARY};">Or enter this verification code:</p>
      <p style="font-size: 28px; font-weight: 700; letter-spacing: 4px; color: ${PRIMARY_COLOR}; margin: 0; font-family: 'Courier New', monospace;">${data.verificationCode}</p>
    </div>
    
    <div class="alert-box">
      <p style="margin: 0;"><strong>⚠️ Important:</strong> This verification link will expire in ${data.expiresIn}. If you didn't request this change, please ignore this email or contact support immediately.</p>
    </div>
    
    <hr class="divider" />
    
    <p style="margin-top: 24px; font-size: 14px;"><strong>Stay secure,</strong><br>The ${APP_NAME} Team</p>
  `, 'Verify your new email address');

  const text = `
Verify Your New Email Address

Hi ${data.userName || 'there'},

You requested to change your email address to: ${data.newEmail}

To complete this change, please verify your new email address:

Verification URL: ${data.verificationUrl}

Or enter this verification code: ${data.verificationCode}

⚠️ Important: This link expires in ${data.expiresIn}. If you didn't request this change, please ignore this email or contact support.

Stay secure,
The ${APP_NAME} Team

---
${APP_NAME}
${APP_URL}
  `.trim();

  return { html, text };
};

/**
 * Email Change Alert Template (sent to old email)
 */
const emailChangeAlertTemplate = (data: EmailChangeAlertData): TemplateRenderResult => {
  const html = baseTemplate(`
    <h2>Email Address Change Notice</h2>
    <p>Hi <strong>${data.userName || 'there'}</strong>,</p>
    <p>This is an important security notification regarding your ${APP_NAME} account.</p>
    
    <div style="background: linear-gradient(to right, #fef2f2 0%, #fee2e2 100%); border-radius: 12px; padding: 20px; margin: 24px 0; border: 2px solid #fca5a5;">
      <h3 style="margin: 0 0 12px 0; color: #dc2626; font-size: 16px;">⚠️ Your email address was changed</h3>
      <p style="margin: 8px 0;"><strong>Old email:</strong> ${data.oldEmail}</p>
      <p style="margin: 8px 0;"><strong>New email:</strong> ${data.newEmail}</p>
      <p style="margin: 8px 0;"><strong>Changed at:</strong> ${new Date(data.changeDate).toLocaleString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}</p>
      ${data.ipAddress ? `<p style="margin: 8px 0;"><strong>IP Address:</strong> ${data.ipAddress}</p>` : ''}
    </div>
    
    <div class="alert-box">
      <p style="margin: 0 0 12px 0;"><strong>🔒 Security Notice:</strong></p>
      <p style="margin: 0;">If you did NOT make this change, your account may be compromised. Please contact our support team immediately.</p>
    </div>
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="${data.supportUrl || `${APP_URL}/support`}" class="button" style="background: #dc2626;">Contact Support</a>
    </div>
    
    <p style="font-size: 14px; color: ${TEXT_SECONDARY};">For your security, you've been logged out of all devices. You can log in again using your new email address.</p>
    
    <hr class="divider" />
    
    <p style="margin-top: 24px; font-size: 14px;"><strong>Stay safe,</strong><br>The ${APP_NAME} Team</p>
  `, 'Your email address was changed');

  const text = `
Email Address Change Notice ⚠️

Hi ${data.userName || 'there'},

This is an important security notification regarding your ${APP_NAME} account.

Your email address was changed:
- Old email: ${data.oldEmail}
- New email: ${data.newEmail}
- Changed at: ${new Date(data.changeDate).toLocaleString()}
${data.ipAddress ? `- IP Address: ${data.ipAddress}` : ''}

🔒 Security Notice: If you did NOT make this change, your account may be compromised. Please contact our support team immediately.

Contact Support: ${data.supportUrl || `${APP_URL}/support`}

For your security, you've been logged out of all devices. You can log in again using your new email address.

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
    <h2>You're Invited to an Event!</h2>
    <p>Hi <strong>${data.userName || 'there'}</strong>,</p>
    <p>Great news! You've been invited to join an exciting event. We'd love to see you there!</p>
    
    <div style="background: linear-gradient(135deg, #f0fdf4 0%, #e6f9ef 100%); border-radius: 12px; padding: 24px; margin: 24px 0; border: 2px solid ${PRIMARY_COLOR};">
      <h3 style="margin: 0 0 16px 0; color: ${PRIMARY_DARK}; font-size: 22px;">${data.eventTitle}</h3>
      ${data.eventDescription ? `<p style="margin: 0 0 16px 0; color: #4a4a4a; font-style: italic;">${data.eventDescription}</p>` : ''}
      <div style="background-color: white; border-radius: 8px; padding: 16px; margin-top: 16px;">
        <p style="margin: 8px 0;"><strong>Date:</strong> ${new Date(data.eventDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        ${data.eventTime ? `<p style="margin: 8px 0;"><strong>Time:</strong> ${data.eventTime}</p>` : ''}
        <p style="margin: 8px 0;"><strong>Location:</strong> ${data.eventLocation}</p>
        ${data.hostName ? `<p style="margin: 8px 0;"><strong>Host:</strong> ${data.hostName}</p>` : ''}
        ${data.maxAttendees ? `<p style="margin: 8px 0;"><strong>Max Attendees:</strong> ${data.maxAttendees}</p>` : ''}
      </div>
    </div>
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="${data.rsvpUrl || data.eventUrl || '#'}" class="button">RSVP Now</a>
    </div>
    
    ${data.mapLink ? `
      <div style="text-align: center; margin: 20px 0;">
        <a href="${data.mapLink}" class="link" style="font-size: 15px;">View Location on Map →</a>
      </div>
    ` : ''}
    
    <hr class="divider" />
    
    <p style="margin-top: 24px; font-size: 15px;">We look forward to seeing you there!</p>
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
    <h2>${data.subject}</h2>
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
 * Marketplace Order Receipt Template
 */
const marketplaceOrderReceiptTemplate = (data: MarketplaceOrderReceiptData): TemplateRenderResult => {
  const itemRows = data.items.map(item => `
    <tr>
      <td style="padding: 15px; border-bottom: 1px solid #eee;">
        ${item.imageUrl ? `<img src="${item.imageUrl}" alt="${item.title}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px; margin-right: 12px; float: left;">` : ''}
        <div style="overflow: hidden;">
          <strong style="display: block; margin-bottom: 4px;">${item.title}</strong>
          <span style="color: #666; font-size: 14px;">Qty: ${item.quantity} × ${item.currency} ${item.price.toFixed(2)}</span>
        </div>
      </td>
      <td style="padding: 15px; border-bottom: 1px solid #eee; text-align: right; font-weight: 600;">
        ${item.currency} ${item.subtotal.toFixed(2)}
      </td>
    </tr>
  `).join('');

  const html = baseTemplate(`
    <h2 style="color: ${PRIMARY_COLOR};">Order Confirmation</h2>
    <p>Hi ${data.buyerName},</p>
    <p>Thank you for your purchase! Your order has been confirmed and we're preparing it for shipment.</p>
    
    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 24px 0;">
      <table style="width: 100%; margin-bottom: 10px;">
        <tr>
          <td><strong>Order Number:</strong></td>
          <td style="text-align: right;">#${data.orderId.slice(0, 8).toUpperCase()}</td>
        </tr>
        <tr>
          <td><strong>Order Date:</strong></td>
          <td style="text-align: right;">${new Date(data.orderDate).toLocaleDateString()}</td>
        </tr>
        <tr>
          <td><strong>Seller:</strong></td>
          <td style="text-align: right;">${data.sellerName}</td>
        </tr>
      </table>
    </div>

    <h3 style="margin-top: 30px; margin-bottom: 15px;">Order Items</h3>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
      ${itemRows}
      <tr>
        <td style="padding: 15px; text-align: right;"><strong>Subtotal:</strong></td>
        <td style="padding: 15px; text-align: right;">${data.currency} ${data.subtotal.toFixed(2)}</td>
      </tr>
      <tr>
        <td style="padding: 15px; text-align: right;"><strong>Platform Fee:</strong></td>
        <td style="padding: 15px; text-align: right;">${data.currency} ${data.platformFee.toFixed(2)}</td>
      </tr>
      <tr style="background: #f8f9fa;">
        <td style="padding: 15px; text-align: right;"><strong style="font-size: 16px;">Total:</strong></td>
        <td style="padding: 15px; text-align: right;"><strong style="font-size: 16px; color: ${PRIMARY_COLOR};">${data.currency} ${data.totalAmount.toFixed(2)}</strong></td>
      </tr>
    </table>

    <h3 style="margin-top: 30px; margin-bottom: 15px;">Shipping Address</h3>
    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 24px;">
      <p style="margin: 0;"><strong>${data.shippingAddress.fullName}</strong></p>
      <p style="margin: 5px 0 0 0; color: #666;">
        ${data.shippingAddress.addressLine1}<br>
        ${data.shippingAddress.addressLine2 ? data.shippingAddress.addressLine2 + '<br>' : ''}
        ${data.shippingAddress.city}, ${data.shippingAddress.state} ${data.shippingAddress.postalCode}<br>
        ${data.shippingAddress.country}<br>
        Phone: ${data.shippingAddress.phone}
      </p>
    </div>

    <h3 style="margin-top: 30px; margin-bottom: 15px;">Payment Information</h3>
    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 24px;">
      <table style="width: 100%;">
        <tr>
          <td><strong>Payment Method:</strong></td>
          <td style="text-align: right;">${data.paymentMethod}</td>
        </tr>
        <tr>
          <td><strong>Transaction ID:</strong></td>
          <td style="text-align: right; font-family: monospace; font-size: 12px;">${data.transactionId}</td>
        </tr>
        <tr>
          <td><strong>Paid At:</strong></td>
          <td style="text-align: right;">${new Date(data.paidAt).toLocaleString()}</td>
        </tr>
      </table>
    </div>

    <a href="${APP_URL}/marketplace/orders/${data.orderId}" class="button">View Order Details</a>

    <hr class="divider" />
    <p style="font-size: 14px; color: #666;">You will receive a shipping notification once your order is on its way.</p>
    <p style="font-size: 14px; color: #666;">If you have any questions, please contact the seller or our support team at ${SUPPORT_EMAIL}.</p>
  `, 'Order Confirmation - Thank you for your purchase!');

  const text = `
Order Confirmation

Hi ${data.buyerName},

Thank you for your purchase! Order #${data.orderId.slice(0, 8).toUpperCase()}

Items:
${data.items.map(item => `- ${item.title} (${item.quantity}x) - ${item.currency} ${item.subtotal.toFixed(2)}`).join('\n')}

Total: ${data.currency} ${data.totalAmount.toFixed(2)}

Shipping to:
${data.shippingAddress.fullName}
${data.shippingAddress.addressLine1}
${data.shippingAddress.city}, ${data.shippingAddress.state} ${data.shippingAddress.postalCode}

View order: ${APP_URL}/marketplace/orders/${data.orderId}
  `.trim();

  return { html, text };
};

/**
 * Marketplace New Order Notification (Seller)
 */
const marketplaceNewOrderTemplate = (data: MarketplaceOrderConfirmationData): TemplateRenderResult => {
  const html = baseTemplate(`
    <h2 style="color: ${PRIMARY_COLOR};">🎉 New Order Received!</h2>
    <p>Hi ${data.sellerName},</p>
    <p>Great news! You have received a new order.</p>
    
    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 24px 0;">
      <h3 style="margin-top: 0; color: ${PRIMARY_COLOR};">${data.itemTitle}</h3>
      <table style="width: 100%;">
        <tr>
          <td><strong>Order Number:</strong></td>
          <td style="text-align: right;">#${data.orderId.slice(0, 8).toUpperCase()}</td>
        </tr>
        <tr>
          <td><strong>Buyer:</strong></td>
          <td style="text-align: right;">${data.buyerName}</td>
        </tr>
        <tr>
          <td><strong>Quantity:</strong></td>
          <td style="text-align: right;">${data.quantity}</td>
        </tr>
        <tr>
          <td><strong>Amount:</strong></td>
          <td style="text-align: right; font-size: 18px; color: ${PRIMARY_COLOR};"><strong>${data.currency} ${data.totalAmount.toFixed(2)}</strong></td>
        </tr>
      </table>
    </div>

    <a href="${data.orderUrl}" class="button">Manage Order</a>

    <hr class="divider" />
    <p style="font-size: 14px; color: #666;">Please prepare the item for shipment and update the order status once it's shipped.</p>
  `, 'New Order Received!');

  const text = `
New Order Received!

Hi ${data.sellerName},

You have a new order for: ${data.itemTitle}
Order #${data.orderId.slice(0, 8).toUpperCase()}
Buyer: ${data.buyerName}
Amount: ${data.currency} ${data.totalAmount.toFixed(2)}

Manage order: ${data.orderUrl}
  `.trim();

  return { html, text };
};

/**
 * Marketplace Shipping Notification
 */
const marketplaceShippingTemplate = (data: MarketplaceShippingNotificationData): TemplateRenderResult => {
  const html = baseTemplate(`
    <h2 style="color: ${PRIMARY_COLOR};">📦 Your Order Has Shipped!</h2>
    <p>Hi ${data.buyerName},</p>
    <p>Good news! Your order is on its way.</p>
    
    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 24px 0;">
      <h3 style="margin-top: 0;">${data.itemTitle}</h3>
      <table style="width: 100%; margin-top: 15px;">
        <tr>
          <td><strong>Order Number:</strong></td>
          <td style="text-align: right;">#${data.orderId.slice(0, 8).toUpperCase()}</td>
        </tr>
        <tr>
          <td><strong>Carrier:</strong></td>
          <td style="text-align: right;">${data.carrier}</td>
        </tr>
        <tr>
          <td><strong>Tracking Number:</strong></td>
          <td style="text-align: right; font-family: monospace;">${data.trackingNumber}</td>
        </tr>
        <tr>
          <td><strong>Est. Delivery:</strong></td>
          <td style="text-align: right;">${new Date(data.estimatedDelivery).toLocaleDateString()}</td>
        </tr>
      </table>
    </div>

    <a href="${data.trackingUrl}" class="button">Track Package</a>

    <hr class="divider" />
    <p style="font-size: 14px; color: #666;">You can track your package using the tracking number above.</p>
  `, 'Your order has shipped!');

  const text = `
Your Order Has Shipped!

Hi ${data.buyerName},

Your order for "${data.itemTitle}" is on its way!

Tracking: ${data.trackingNumber}
Carrier: ${data.carrier}
Est. Delivery: ${new Date(data.estimatedDelivery).toLocaleDateString()}

Track: ${data.trackingUrl}
  `.trim();

  return { html, text };
};

/**
 * Event Ticket Receipt Template
 */
const eventTicketReceiptTemplate = (data: EventTicketReceiptData): TemplateRenderResult => {
  const html = baseTemplate(`
    <h2 style="color: ${PRIMARY_COLOR};">🎟️ Your Event Ticket</h2>
    <p>Hi ${data.attendeeName},</p>
    <p>Your ticket for <strong>${data.eventTitle}</strong> is confirmed!</p>
    
    ${data.eventImage ? `<img src="${data.eventImage}" alt="${data.eventTitle}" style="width: 100%; border-radius: 8px; margin: 20px 0;">` : ''}

    <div style="background: linear-gradient(135deg, ${PRIMARY_COLOR} 0%, ${PRIMARY_DARK} 100%); color: white; padding: 25px; border-radius: 8px; margin: 24px 0;">
      <h3 style="margin-top: 0; color: white; font-size: 22px;">${data.eventTitle}</h3>
      <p style="margin: 8px 0; font-size: 16px;">📅 ${new Date(data.eventDate).toLocaleDateString()} at ${data.eventTime}</p>
      <p style="margin: 8px 0; font-size: 16px;">📍 ${data.eventLocation}</p>
      ${data.ticketTier ? `<p style="margin: 8px 0; font-size: 14px; opacity: 0.9;">Ticket: ${data.ticketTier}</p>` : ''}
    </div>

    <h3 style="margin-top: 30px; margin-bottom: 15px;">Ticket Details</h3>
    <table style="width: 100%; background: #f8f9fa; border-radius: 8px; padding: 15px;">
      <tr>
        <td><strong>Ticket Number:</strong></td>
        <td style="text-align: right; font-family: monospace; font-size: 14px; font-weight: 600;">${data.checkInCode}</td>
      </tr>
      <tr>
        <td><strong>Quantity:</strong></td>
        <td style="text-align: right;">${data.quantity} ticket(s)</td>
      </tr>
      <tr>
        <td><strong>Price:</strong></td>
        <td style="text-align: right;">${data.currency} ${data.price.toFixed(2)}</td>
      </tr>
      <tr>
        <td><strong>Platform Fee:</strong></td>
        <td style="text-align: right;">${data.currency} ${data.platformFee.toFixed(2)}</td>
      </tr>
      <tr style="font-size: 16px;">
        <td><strong>Total:</strong></td>
        <td style="text-align: right;"><strong style="color: ${PRIMARY_COLOR};">${data.currency} ${data.totalAmount.toFixed(2)}</strong></td>
      </tr>
    </table>

    <div style="margin-top: 30px;">
      <a href="${APP_URL}/events/${data.eventId}" class="button" style="margin-right: 10px;">View Event</a>
      ${data.eventMapLink ? `<a href="${data.eventMapLink}" class="button button-secondary">Get Directions</a>` : ''}
    </div>

    <hr class="divider" />
    <p style="font-size: 14px; color: #666;"><strong>Hosted by:</strong> ${data.hostName}</p>
    <p style="font-size: 14px; color: #666;">Please arrive 15 minutes early for check-in. Bring this email or show your ticket number.</p>
  `, `Your Ticket for ${data.eventTitle}`);

  const text = `
Your Event Ticket

Hi ${data.attendeeName},

Event: ${data.eventTitle}
Date: ${new Date(data.eventDate).toLocaleDateString()} at ${data.eventTime}
Location: ${data.eventLocation}

Ticket Number: ${data.checkInCode}

Total: ${data.currency} ${data.totalAmount.toFixed(2)}

View event: ${APP_URL}/events/${data.eventId}
${data.eventMapLink ? `Directions: ${data.eventMapLink}` : ''}
  `.trim();

  return { html, text };
};

/**
 * Event Reminder with Ticket
 */
const eventReminderWithTicketTemplate = (data: EventReminderWithTicketData): TemplateRenderResult => {
  const timeframe = data.hoursUntilEvent <= 24 ? 'Tomorrow' : `in ${Math.ceil(data.hoursUntilEvent / 24)} days`;
  
  const html = baseTemplate(`
    <h2 style="color: ${PRIMARY_COLOR};">⏰ Event Reminder</h2>
    <p>Hi ${data.attendeeName},</p>
    <p><strong>${data.eventTitle}</strong> is coming up ${timeframe}!</p>
    
    <div style="background: linear-gradient(135deg, ${PRIMARY_COLOR} 0%, ${PRIMARY_DARK} 100%); color: white; padding: 25px; border-radius: 8px; margin: 24px 0; text-align: center;">
      <h3 style="margin: 0; color: white; font-size: 24px;">${data.eventTitle}</h3>
      <p style="margin: 15px 0 0 0; font-size: 18px;">📅 ${new Date(data.eventDate).toLocaleDateString()}</p>
      <p style="margin: 8px 0 0 0; font-size: 18px;">⏰ ${data.eventTime}</p>
      <p style="margin: 8px 0 0 0; font-size: 16px;">📍 ${data.eventLocation}</p>
    </div>

    <div style="margin-top: 30px;">
      ${data.mapLink ? `<a href="${data.mapLink}" class="button">Get Directions</a>` : ''}
    </div>

    <hr class="divider" />
    <p style="font-size: 14px; color: #666;">See you there! Please arrive 15 minutes early for check-in.</p>
  `, `Reminder: ${data.eventTitle} is ${timeframe}`);

  const text = `
Event Reminder

Hi ${data.attendeeName},

${data.eventTitle} is ${timeframe}!

Date: ${new Date(data.eventDate).toLocaleDateString()}
Time: ${data.eventTime}
Location: ${data.eventLocation}

${data.mapLink ? `Directions: ${data.mapLink}` : ''}

Please arrive 15 minutes early for check-in.
  `.trim();

  return { html, text };
};

/**
 * Refund Confirmation Template
 */
const refundConfirmationTemplate = (data: RefundConfirmationData): TemplateRenderResult => {
  const html = baseTemplate(`
    <h2 style="color: ${PRIMARY_COLOR};">💳 Refund Processed</h2>
    <p>Hi ${data.customerName},</p>
    <p>Your refund has been processed successfully.</p>
    
    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 24px 0;">
      <table style="width: 100%;">
        <tr>
          <td><strong>Refund ID:</strong></td>
          <td style="text-align: right; font-family: monospace; font-size: 12px;">${data.refundId}</td>
        </tr>
        <tr>
          <td><strong>Original Order:</strong></td>
          <td style="text-align: right;">${data.orderId ? '#' + data.orderId.slice(0, 8).toUpperCase() : 'N/A'}</td>
        </tr>
        <tr>
          <td><strong>Refund Amount:</strong></td>
          <td style="text-align: right; font-size: 18px; color: ${PRIMARY_COLOR};"><strong>${data.currency} ${data.refundAmount.toFixed(2)}</strong></td>
        </tr>
        <tr>
          <td><strong>Refund Date:</strong></td>
          <td style="text-align: right;">${new Date(data.refundDate).toLocaleDateString()}</td>
        </tr>
        <tr>
          <td><strong>Refund Method:</strong></td>
          <td style="text-align: right;">${data.refundMethod}</td>
        </tr>
        <tr>
          <td><strong>Reason:</strong></td>
          <td style="text-align: right;">${data.refundReason}</td>
        </tr>
      </table>
    </div>

    <div style="background: #fff9e6; border-left: 4px solid #ffc107; padding: 15px; margin: 24px 0;">
      <p style="margin: 0; color: #856404;">
        <strong>⏱️ Processing Time:</strong> Please allow ${data.estimatedProcessingDays} business days for the refund to appear in your account.
      </p>
    </div>

    <hr class="divider" />
    <p style="font-size: 14px; color: #666;">If you have any questions, please contact us at ${SUPPORT_EMAIL}.</p>
  `, 'Refund Processed Successfully');

  const text = `
Refund Processed

Hi ${data.customerName},

Your refund of ${data.currency} ${data.refundAmount.toFixed(2)} has been processed.

Refund ID: ${data.refundId}
Processing Time: ${data.estimatedProcessingDays} business days

Questions? Contact: ${SUPPORT_EMAIL}
  `.trim();

  return { html, text };
};

/**
 * Payout Notification Template
 */
const payoutNotificationTemplate = (data: PayoutNotificationData): TemplateRenderResult => {
  const html = baseTemplate(`
    <h2 style="color: ${PRIMARY_COLOR};">💰 Payout Received!</h2>
    <p>Hi ${data.recipientName},</p>
    <p>Great news! Your payout has been processed.</p>
    
    <div style="background: linear-gradient(135deg, ${PRIMARY_LIGHT} 0%, ${PRIMARY_COLOR} 100%); color: white; padding: 30px; border-radius: 8px; margin: 24px 0; text-align: center;">
      <p style="margin: 0; font-size: 16px; opacity: 0.9;">Payout Amount</p>
      <h1 style="margin: 10px 0; color: white; font-size: 42px;">${data.currency} ${data.amount.toFixed(2)}</h1>
    </div>

    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 24px 0;">
      <table style="width: 100%;">
        <tr>
          <td><strong>From:</strong></td>
          <td style="text-align: right;">${data.itemType === 'event' ? 'Event Ticket Sales' : 'Marketplace Order'}</td>
        </tr>
        <tr>
          <td><strong>Item:</strong></td>
          <td style="text-align: right;">${data.itemTitle}</td>
        </tr>
        <tr>
          <td><strong>Payout Date:</strong></td>
          <td style="text-align: right;">${new Date(data.payoutDate).toLocaleDateString()}</td>
        </tr>
        <tr>
          <td><strong>Method:</strong></td>
          <td style="text-align: right;">${data.payoutMethod}</td>
        </tr>
        <tr>
          <td><strong>Est. Arrival:</strong></td>
          <td style="text-align: right;">${data.estimatedArrival}</td>
        </tr>
        <tr>
          <td><strong>Transaction ID:</strong></td>
          <td style="text-align: right; font-family: monospace; font-size: 11px;">${data.transactionId}</td>
        </tr>
      </table>
    </div>

    <hr class="divider" />
    <p style="font-size: 14px; color: #666;">The funds should arrive in your account within the estimated timeframe above.</p>
  `, 'Payout Received');

  const text = `
Payout Received!

Hi ${data.recipientName},

Amount: ${data.currency} ${data.amount.toFixed(2)}
From: ${data.itemTitle}
Estimated Arrival: ${data.estimatedArrival}

Transaction ID: ${data.transactionId}
  `.trim();

  return { html, text };
};

/**
 * Account Deactivated Email Template
 */
const accountDeactivatedTemplate = (data: any): TemplateRenderResult => {
  const html = baseTemplate(`
    <h2>Account Deactivated</h2>
    ${greeting(data.userName)}
    <p>Your ${APP_NAME} account has been successfully deactivated as requested.</p>
    
    ${warningBox('What This Means:', `
      <ul style="margin: 8px 0; padding-left: 20px;">
        <li style="margin: 8px 0;">Your profile is now hidden from other users</li>
        <li style="margin: 8px 0;">You won't receive any notifications</li>
        <li style="margin: 8px 0;">Your data is safely stored and will not be deleted</li>
        <li style="margin: 8px 0;">You can reactivate anytime by logging in</li>
      </ul>
      ${data.reason ? detailItem('Reason', data.reason) : ''}
    `)}
    
    ${noticeBox('Changed Your Mind?', `
      <p style="margin: 0;">You can reactivate your account at any time by simply logging in again. All your data will be restored.</p>
    `)}
    
    ${ctaButton('Reactivate Account', data.reactivateUrl || `${APP_URL}/login`)}
    
    ${securityAlert(data.supportUrl)}
    
    ${divider()}
    
    <p style="margin-top: 24px; font-size: 14px;"><strong>We're sorry to see you go,</strong><br>The ${APP_NAME} Team</p>
  `, 'Account Deactivated');

  const text = `
Account Deactivated

Hi ${data.userName || 'there'},

Your ${APP_NAME} account has been successfully deactivated.

What This Means:
• Your profile is now hidden from other users
• You won't receive any notifications  
• Your data is safely stored and will not be deleted
• You can reactivate anytime by logging in

${data.reason ? `Reason: ${data.reason}` : ''}

Changed Your Mind? You can reactivate your account at any time by simply logging in again.

Reactivate: ${data.reactivateUrl || `${APP_URL}/login`}

If you didn't request this, please contact support immediately.

We're sorry to see you go,
The ${APP_NAME} Team

---
${APP_NAME}
${APP_URL}
  `.trim();

  return { html, text };
};

/**
 * Account Reactivated Email Template
 */
const accountReactivatedTemplate = (data: any): TemplateRenderResult => {
  const html = baseTemplate(`
    <h2>Welcome Back! 🎉</h2>
    ${greeting(data.userName)}
    <p>Great news! Your ${APP_NAME} account has been successfully reactivated.</p>
    
    ${successBox('Your Account is Now Active:', `
      <ul style="margin: 8px 0; padding-left: 20px;">
        <li style="margin: 8px 0;">Your profile is visible again</li>
        <li style="margin: 8px 0;">You can receive notifications</li>
        <li style="margin: 8px 0;">All your data and connections are restored</li>
        <li style="margin: 8px 0;">You have full access to all features</li>
      </ul>
      ${detailItem('Reactivated on', new Date(data.reactivationDate).toLocaleString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }))}
    `)}
    
    ${ctaButton(`Explore ${APP_NAME}`, APP_URL)}
    
    <p style="font-size: 14px; color: #64748b; margin-top: 24px;">If you didn't reactivate your account, please review your <a href="${data.securityUrl || `${APP_URL}/settings/security`}" style="color: ${PRIMARY_COLOR};">security settings</a> and contact support.</p>
    
    ${divider()}
    
    <p style="margin-top: 24px; font-size: 14px;"><strong>Happy to have you back,</strong><br>The ${APP_NAME} Team</p>
  `, 'Welcome Back to Berse!');

  const text = `
Welcome Back! 🎉

Hi ${data.userName || 'there'},

Great news! Your ${APP_NAME} account has been successfully reactivated.

Your Account is Now Active:
• Your profile is visible again
• You can receive notifications
• All your data and connections are restored
• You have full access to all features

Reactivated on: ${new Date(data.reactivationDate).toLocaleString()}

Explore ${APP_NAME}: ${APP_URL}

If you didn't reactivate your account, please review your security settings.

Happy to have you back,
The ${APP_NAME} Team

---
${APP_NAME}
${APP_URL}
  `.trim();

  return { html, text };
};

/**
 * Account Deletion Scheduled Email Template
 */
const accountDeletionScheduledTemplate = (data: any): TemplateRenderResult => {
  const html = baseTemplate(`
    <h2>Account Deletion Scheduled ⚠️</h2>
    ${greeting(data.userName)}
    <p>We've received your request to permanently delete your ${APP_NAME} account.</p>
    
    ${dangerBox('⏰ Important Information:', `
      <p style="margin: 8px 0; font-size: 18px; font-weight: 600; color: #dc2626;">Your account will be permanently deleted on:</p>
      <p style="margin: 8px 0; font-size: 22px; font-weight: 700; color: #dc2626;">${new Date(data.deletionDate).toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric'
      })}</p>
      ${detailItem('Grace Period', `${data.gracePeriodDays || 30} days`)}
      ${data.reason ? detailItem('Reason', data.reason) : ''}
    `)}
    
    ${warningBox('This Will Be Permanent:', `
      <ul style="margin: 8px 0; padding-left: 20px;">
        <li style="margin: 4px 0;">All your posts, comments, and content will be deleted</li>
        <li style="margin: 4px 0;">Your connections and event history will be removed</li>
        <li style="margin: 4px 0;">Your trust score and badges will be lost</li>
        <li style="margin: 4px 0;">All personal data will be permanently erased</li>
        <li style="margin: 4px 0;">This action <strong>cannot be undone</strong> after the deletion date</li>
      </ul>
    `)}
    
    ${noticeBox('✋ Changed Your Mind?', `
      <p style="margin: 8px 0;">You can cancel this deletion request at any time during the ${data.gracePeriodDays || 30}-day grace period. Your account will remain fully functional until the deletion date.</p>
    `)}
    
    ${ctaButton('Cancel Deletion Request', data.cancelUrl || `${APP_URL}/settings/cancel-deletion`, '#0891b2')}
    
    ${securityAlert(data.supportUrl)}
    
    ${divider()}
    
    <p style="margin-top: 24px; font-size: 14px;"><strong>We're sad to see you go,</strong><br>The ${APP_NAME} Team</p>
  `, 'Account Deletion Scheduled');

  const text = `
Account Deletion Scheduled ⚠️

Hi ${data.userName || 'there'},

We've received your request to permanently delete your ${APP_NAME} account.

⏰ Your account will be permanently deleted on:
${new Date(data.deletionDate).toLocaleDateString('en-US', { 
  weekday: 'long', 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric'
})}

Grace Period: ${data.gracePeriodDays || 30} days
${data.reason ? `Reason: ${data.reason}` : ''}

This Will Be Permanent:
• All your posts, comments, and content will be deleted
• Your connections and event history will be removed
• Your trust score and badges will be lost
• All personal data will be permanently erased
• This action CANNOT be undone after the deletion date

✋ Changed Your Mind?
You can cancel this deletion request at any time during the grace period.

Cancel Deletion: ${data.cancelUrl || `${APP_URL}/settings/cancel-deletion`}

If you didn't request this, please contact support immediately.

We're sad to see you go,
The ${APP_NAME} Team

---
${APP_NAME}
${APP_URL}
  `.trim();

  return { html, text };
};

/**
 * Account Deletion Cancelled Email Template
 */
const accountDeletionCancelledTemplate = (data: any): TemplateRenderResult => {
  const html = baseTemplate(`
    <h2>Deletion Cancelled - Account Safe! ✅</h2>
    ${greeting(data.userName)}
    <p>Great news! Your account deletion request has been successfully cancelled.</p>
    
    ${successBox('Your Account is Safe:', `
      <ul style="margin: 8px 0; padding-left: 20px;">
        <li style="margin: 8px 0;">Your account will remain active</li>
        <li style="margin: 8px 0;">All your data is preserved</li>
        <li style="margin: 8px 0;">No changes have been made to your account</li>
        <li style="margin: 8px 0;">You can continue using ${APP_NAME} normally</li>
      </ul>
      ${detailItem('Cancelled on', new Date(data.cancellationDate).toLocaleString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }))}
    `)}
    
    ${ctaButton('Continue Exploring', APP_URL)}
    
    ${securityAlert()}
    
    ${divider()}
    
    <p style="margin-top: 24px; font-size: 14px;"><strong>Glad you're staying,</strong><br>The ${APP_NAME} Team</p>
  `, 'Account Deletion Cancelled');

  const text = `
Deletion Cancelled - Account Safe! ✅

Hi ${data.userName || 'there'},

Great news! Your account deletion request has been successfully cancelled.

Your Account is Safe:
• Your account will remain active
• All your data is preserved
• No changes have been made to your account
• You can continue using ${APP_NAME} normally

Cancelled on: ${new Date(data.cancellationDate).toLocaleString()}

Continue Exploring: ${APP_URL}

If you didn't cancel this deletion, please contact support immediately.

Glad you're staying,
The ${APP_NAME} Team

---
${APP_NAME}
${APP_URL}
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
    // Account Management templates
    case EmailTemplate.ACCOUNT_DEACTIVATED:
      return accountDeactivatedTemplate(data);
    case EmailTemplate.ACCOUNT_REACTIVATED:
      return accountReactivatedTemplate(data);
    case EmailTemplate.ACCOUNT_DELETION_SCHEDULED:
      return accountDeletionScheduledTemplate(data);
    case EmailTemplate.ACCOUNT_DELETION_CANCELLED:
      return accountDeletionCancelledTemplate(data);
    case EmailTemplate.EMAIL_CHANGE_VERIFICATION:
      return emailChangeVerificationTemplate(data);
    case EmailTemplate.EMAIL_CHANGE_ALERT:
      return emailChangeAlertTemplate(data);
    // Marketplace templates
    case EmailTemplate.MARKETPLACE_ORDER_RECEIPT:
      return marketplaceOrderReceiptTemplate(data);
    case EmailTemplate.MARKETPLACE_NEW_ORDER:
      return marketplaceNewOrderTemplate(data);
    case EmailTemplate.MARKETPLACE_SHIPPED:
      return marketplaceShippingTemplate(data);
    // Event ticket templates
    case EmailTemplate.EVENT_TICKET_RECEIPT:
      return eventTicketReceiptTemplate(data);
    case EmailTemplate.EVENT_TICKET_CONFIRMATION:
      return eventTicketReceiptTemplate(data); // Use same template
    case EmailTemplate.EVENT_REMINDER_WITH_TICKET:
      return eventReminderWithTicketTemplate(data);
    // Payment templates
    case EmailTemplate.REFUND_CONFIRMATION:
      return refundConfirmationTemplate(data);
    case EmailTemplate.PAYOUT_NOTIFICATION:
      return payoutNotificationTemplate(data);
    default:
      return notificationTemplate(data);
  }
};
