import sgMail from '@sendgrid/mail';
import logger from '../utils/logger';

// Initialize SendGrid
const apiKey = process.env.SENDGRID_API_KEY;
if (!apiKey) {
  throw new Error('SENDGRID_API_KEY is not set in environment variables');
}

sgMail.setApiKey(apiKey);

// Note: EU data residency is configured at the API key level in SendGrid dashboard
// Regional API keys automatically route through the appropriate data center
const region = process.env.SENDGRID_DATA_RESIDENCY === 'eu' ? 'EU' : 'Global';
logger.info(`SendGrid configured (${region} region)`);

export class SendGridService {
  /**
   * Send email using SendGrid
   */
  static async sendEmail(options: {
    to: string;
    subject: string;
    html: string;
    text?: string;
    from?: string;
    fromName?: string;
  }): Promise<void> {
    const from = {
      email: options.from || process.env.FROM_EMAIL || 'noreply@berse-app.com',
      name: options.fromName || process.env.FROM_NAME || 'Berse App',
    };

    const msg = {
      to: options.to,
      from,
      subject: options.subject,
      text: options.text || options.html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
      html: options.html,
    };

    try {
      await sgMail.send(msg);
      logger.info(`Email sent successfully to ${options.to} via SendGrid`);
    } catch (error: any) {
      logger.error('SendGrid email error:', {
        error: error.response?.body || error.message,
        to: options.to,
        subject: options.subject,
      });
      throw error;
    }
  }

  /**
   * Send email to multiple recipients
   */
  static async sendBulkEmail(options: {
    to: string[];
    subject: string;
    html: string;
    text?: string;
    from?: string;
    fromName?: string;
  }): Promise<void> {
    const from = {
      email: options.from || process.env.FROM_EMAIL || 'noreply@berse-app.com',
      name: options.fromName || process.env.FROM_NAME || 'Berse App',
    };

    const msg = {
      to: options.to,
      from,
      subject: options.subject,
      text: options.text || options.html.replace(/<[^>]*>/g, ''),
      html: options.html,
    };

    try {
      await sgMail.send(msg);
      logger.info(`Bulk email sent successfully to ${options.to.length} recipients via SendGrid`);
    } catch (error: any) {
      logger.error('SendGrid bulk email error:', {
        error: error.response?.body || error.message,
        recipientCount: options.to.length,
        subject: options.subject,
      });
      throw error;
    }
  }

  /**
   * Send verification email
   */
  static async sendVerificationEmail(email: string, token: string): Promise<void> {
    const verificationUrl = `${process.env.APP_URL || process.env.FRONTEND_URL}/verify-email?token=${token}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Welcome to Berse App! 🎉</h1>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Verify Your Email Address</h2>
            
            <p>Thanks for signing up! Please verify your email address by clicking the button below:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background: #667eea; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                Verify Email
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px;">
              Or copy and paste this link into your browser:<br>
              <a href="${verificationUrl}" style="color: #667eea; word-break: break-all;">${verificationUrl}</a>
            </p>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            
            <p style="color: #999; font-size: 12px; text-align: center;">
              This link will expire in 24 hours. If you didn't create an account, please ignore this email.
            </p>
          </div>
        </body>
      </html>
    `;

    await this.sendEmail({
      to: email,
      subject: 'Verify Your Email - Berse App',
      html,
    });
  }

  /**
   * Send password reset email
   */
  static async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const resetUrl = `${process.env.APP_URL || process.env.FRONTEND_URL}/reset-password?token=${token}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Password Reset Request 🔐</h1>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Reset Your Password</h2>
            
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background: #667eea; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                Reset Password
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px;">
              Or copy and paste this link into your browser:<br>
              <a href="${resetUrl}" style="color: #667eea; word-break: break-all;">${resetUrl}</a>
            </p>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            
            <p style="color: #999; font-size: 12px; text-align: center;">
              This link will expire in 1 hour. If you didn't request a password reset, please ignore this email or contact support.
            </p>
          </div>
        </body>
      </html>
    `;

    await this.sendEmail({
      to: email,
      subject: 'Reset Your Password - Berse App',
      html,
    });
  }

  /**
   * Send welcome email
   */
  static async sendWelcomeEmail(email: string, name: string): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Berse App</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Welcome to Berse App! 🚀</h1>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Hi ${name}! 👋</h2>
            
            <p>Welcome to the Berse App community! We're excited to have you on board.</p>
            
            <p>Here's what you can do next:</p>
            
            <ul style="line-height: 2;">
              <li>🎯 Complete your profile</li>
              <li>📚 Start your first reflection session</li>
              <li>👥 Join communities and connect with others</li>
              <li>💬 Share your thoughts and insights</li>
            </ul>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}" 
                 style="background: #667eea; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                Get Started
              </a>
            </div>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            
            <p style="color: #666; font-size: 14px;">
              Need help? Contact us at <a href="mailto:${process.env.SUPPORT_EMAIL}" style="color: #667eea;">${process.env.SUPPORT_EMAIL}</a>
            </p>
          </div>
        </body>
      </html>
    `;

    await this.sendEmail({
      to: email,
      subject: 'Welcome to Berse App! 🎉',
      html,
    });
  }
}

export default SendGridService;
