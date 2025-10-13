import nodemailer, { Transporter } from 'nodemailer';
import logger from '../utils/logger';
import { 
  EmailOptions, 
  EmailTemplate, 
  EmailType,
  VerificationEmailData,
  WelcomeEmailData,
  PasswordResetEmailData,
  EventEmailData,
  CampaignEmailData
} from '../types/email.types';
import { renderEmailTemplate } from '../utils/emailTemplates';

export class EmailService {
  private transporter: Transporter;
  private fromEmail: string;
  private fromName: string;

  constructor() {
    this.fromEmail = process.env.FROM_EMAIL || 'noreply@bersemuka.com';
    this.fromName = process.env.FROM_NAME || 'Berse';
    
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      // Add connection timeout
      connectionTimeout: 10000,
      greetingTimeout: 5000,
    });

    // Verify connection configuration
    this.verifyConnection();
  }

  private async verifyConnection(): Promise<void> {
    try {
      await this.transporter.verify();
      logger.info('✅ Email service is ready');
    } catch (error) {
      logger.error('❌ Email service connection failed', { error });
    }
  }

  /**
   * Send a generic email
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const mailOptions = {
        from: `"${this.fromName}" <${this.fromEmail}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        cc: options.cc,
        bcc: options.bcc,
        attachments: options.attachments,
      };

      const info = await this.transporter.sendMail(mailOptions);
      
      logger.info('Email sent successfully', {
        messageId: info.messageId,
        to: options.to,
        subject: options.subject,
      });

      return true;
    } catch (error) {
      logger.error('Failed to send email', {
        error,
        to: options.to,
        subject: options.subject,
      });
      return false;
    }
  }

  /**
   * Send verification email
   */
  async sendVerificationEmail(to: string, data: VerificationEmailData): Promise<boolean> {
    const template = renderEmailTemplate(EmailTemplate.VERIFICATION, data);
    
    return this.sendEmail({
      to,
      subject: 'Verify Your Email - Berse',
      html: template.html,
      text: template.text,
    });
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(to: string, data: WelcomeEmailData): Promise<boolean> {
    const template = renderEmailTemplate(EmailTemplate.WELCOME, data);
    
    return this.sendEmail({
      to,
      subject: 'Welcome to Berse! 🎉',
      html: template.html,
      text: template.text,
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(to: string, data: PasswordResetEmailData): Promise<boolean> {
    const template = renderEmailTemplate(EmailTemplate.PASSWORD_RESET, data);
    
    return this.sendEmail({
      to,
      subject: 'Reset Your Password - Berse',
      html: template.html,
      text: template.text,
    });
  }

  /**
   * Send event invitation email
   */
  async sendEventInvitationEmail(to: string, data: EventEmailData): Promise<boolean> {
    const template = renderEmailTemplate(EmailTemplate.EVENT_INVITATION, data);
    
    return this.sendEmail({
      to,
      subject: `You're Invited: ${data.eventTitle}`,
      html: template.html,
      text: template.text,
    });
  }

  /**
   * Send event reminder email
   */
  async sendEventReminderEmail(to: string, data: EventEmailData): Promise<boolean> {
    const template = renderEmailTemplate(EmailTemplate.EVENT_REMINDER, data);
    
    return this.sendEmail({
      to,
      subject: `Reminder: ${data.eventTitle} is Coming Up!`,
      html: template.html,
      text: template.text,
    });
  }

  /**
   * Send event confirmation email
   */
  async sendEventConfirmationEmail(to: string, data: EventEmailData): Promise<boolean> {
    const template = renderEmailTemplate(EmailTemplate.EVENT_CONFIRMATION, data);
    
    return this.sendEmail({
      to,
      subject: `Confirmed: ${data.eventTitle}`,
      html: template.html,
      text: template.text,
    });
  }

  /**
   * Send event cancellation email
   */
  async sendEventCancellationEmail(to: string, data: EventEmailData): Promise<boolean> {
    const template = renderEmailTemplate(EmailTemplate.EVENT_CANCELLATION, data);
    
    return this.sendEmail({
      to,
      subject: `Event Cancelled: ${data.eventTitle}`,
      html: template.html,
      text: template.text,
    });
  }

  /**
   * Send campaign email
   */
  async sendCampaignEmail(to: string | string[], data: CampaignEmailData): Promise<boolean> {
    const template = renderEmailTemplate(EmailTemplate.CAMPAIGN, data);
    
    return this.sendEmail({
      to: Array.isArray(to) ? to.join(', ') : to,
      subject: data.subject,
      html: template.html,
      text: template.text,
      bcc: Array.isArray(to) && to.length > 1 ? to : undefined,
    });
  }

  /**
   * Send bulk emails (for campaigns)
   */
  async sendBulkEmails(
    recipients: string[],
    data: CampaignEmailData,
    batchSize: number = 50
  ): Promise<{ sent: number; failed: number }> {
    let sent = 0;
    let failed = 0;

    // Process in batches to avoid overwhelming the SMTP server
    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      
      const results = await Promise.allSettled(
        batch.map(email => this.sendCampaignEmail(email, data))
      );

      results.forEach(result => {
        if (result.status === 'fulfilled' && result.value) {
          sent++;
        } else {
          failed++;
        }
      });

      // Add delay between batches to avoid rate limiting
      if (i + batchSize < recipients.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    logger.info('Bulk email campaign completed', { sent, failed, total: recipients.length });

    return { sent, failed };
  }

  /**
   * Send notification email (generic)
   */
  async sendNotificationEmail(
    to: string,
    subject: string,
    message: string,
    actionUrl?: string,
    actionText?: string
  ): Promise<boolean> {
    const template = renderEmailTemplate(EmailTemplate.NOTIFICATION, {
      subject,
      message,
      actionUrl,
      actionText,
    });
    
    return this.sendEmail({
      to,
      subject,
      html: template.html,
      text: template.text,
    });
  }

  /**
   * Test email configuration
   */
  async sendTestEmail(to: string): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: 'Test Email - Berse',
      html: '<h1>Test Email</h1><p>If you received this, email configuration is working correctly!</p>',
      text: 'Test Email - If you received this, email configuration is working correctly!',
    });
  }
}

// Export singleton instance
export const emailService = new EmailService();
