import sgMail from '@sendgrid/mail';
import { prisma } from '../config/database';
import logger from '../utils/logger';
import { 
  EmailOptions, 
  EmailTemplate, 
  EmailType,
  VerificationEmailData,
  WelcomeEmailData,
  PasswordResetEmailData,
  PasswordChangedEmailData,
  EventEmailData,
  CampaignEmailData
} from '../types/email.types';
import {
  MarketplaceOrderReceiptData,
  MarketplaceOrderConfirmationData,
  MarketplaceShippingNotificationData,
  EventTicketReceiptData,
  EventTicketConfirmationData,
  EventReminderWithTicketData,
  RefundConfirmationData,
  PayoutNotificationData
} from '../types/payment-email.types';
import { renderEmailTemplate } from '../utils/emailTemplates';

export class EmailService {
  private fromEmail: string;
  private fromName: string;

  constructor() {
    this.fromEmail = process.env.FROM_EMAIL || 'noreply@berse-app.com';
    this.fromName = process.env.FROM_NAME || 'Berse App';
    
    // Initialize SendGrid
    if (!process.env.SENDGRID_API_KEY) {
      throw new Error('SENDGRID_API_KEY is required');
    }
    
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    
    // Note: EU data residency is configured at the API key level in SendGrid dashboard
    const region = process.env.SENDGRID_DATA_RESIDENCY === 'eu' ? 'EU' : 'Global';
    logger.info(`✅ SendGrid email service configured (${region} region)`);
  }

  /**
   * Send a generic email using SendGrid
   * Automatically checks user's email notification preferences before sending
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      // Check email preferences for the recipient
      const recipients = Array.isArray(options.to) ? options.to : [options.to];
      
      // Filter recipients based on their email preferences
      const enabledRecipients: string[] = [];
      
      for (const email of recipients) {
        // Get user by email
        const user = await prisma.user.findUnique({
          where: { email },
          select: { 
            id: true,
            notificationPreferences: {
              select: { emailEnabled: true },
            },
          },
        });

        // If user not found or emailEnabled is not explicitly false, send email
        // (default to true if preference not set)
        if (!user || user.notificationPreferences?.emailEnabled !== false) {
          enabledRecipients.push(email);
        } else {
          logger.info('Email skipped - email notifications disabled', {
            email,
            subject: options.subject,
          });
        }
      }

      // If no recipients have email enabled, skip sending
      if (enabledRecipients.length === 0) {
        logger.info('Email not sent - all recipients have email notifications disabled', {
          originalRecipients: recipients.length,
          subject: options.subject,
        });
        return false;
      }

      // Update recipients to only enabled ones
      const msg = {
        to: enabledRecipients.length === 1 ? enabledRecipients[0] : enabledRecipients,
        from: {
          email: this.fromEmail,
          name: this.fromName,
        },
        subject: options.subject,
        html: options.html,
        text: options.text || options.html?.replace(/<[^>]*>/g, ''),
        cc: options.cc,
        bcc: options.bcc,
      };

      await sgMail.send(msg);
      
      logger.info('Email sent successfully via SendGrid', {
        to: enabledRecipients,
        skipped: recipients.length - enabledRecipients.length,
        subject: options.subject,
      });

      return true;
    } catch (error: any) {
      logger.error('Failed to send email via SendGrid', {
        error: error.response?.body || error.message,
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
   * Send password changed confirmation email
   */
  async sendPasswordChangedEmail(to: string, data: PasswordChangedEmailData): Promise<boolean> {
    const template = renderEmailTemplate(EmailTemplate.PASSWORD_CHANGED, data);
    
    return this.sendEmail({
      to,
      subject: 'Password Changed - Berse',
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

  // ============= MARKETPLACE ORDER EMAILS =============

  /**
   * Send marketplace order receipt/confirmation email to buyer
   */
  async sendMarketplaceOrderReceipt(to: string, data: MarketplaceOrderReceiptData): Promise<boolean> {
    const template = renderEmailTemplate(EmailTemplate.MARKETPLACE_ORDER_RECEIPT, data);
    
    return this.sendEmail({
      to,
      subject: `Order Confirmation - ${data.items[0]?.title} (Order #${data.orderId.slice(0, 8)})`,
      html: template.html,
      text: template.text,
    });
  }

  /**
   * Send order confirmation to seller
   */
  async sendNewOrderNotificationToSeller(to: string, data: MarketplaceOrderConfirmationData): Promise<boolean> {
    const template = renderEmailTemplate(EmailTemplate.MARKETPLACE_NEW_ORDER, data);
    
    return this.sendEmail({
      to,
      subject: `New Order Received - ${data.itemTitle}`,
      html: template.html,
      text: template.text,
    });
  }

  /**
   * Send shipping notification to buyer
   */
  async sendShippingNotification(to: string, data: MarketplaceShippingNotificationData): Promise<boolean> {
    const template = renderEmailTemplate(EmailTemplate.MARKETPLACE_SHIPPED, data);
    
    return this.sendEmail({
      to,
      subject: `Your order has shipped - ${data.itemTitle}`,
      html: template.html,
      text: template.text,
    });
  }

  // ============= EVENT TICKET EMAILS =============

  /**
   * Send event ticket receipt/confirmation with QR code
   */
  async sendEventTicketReceipt(to: string, data: EventTicketReceiptData): Promise<boolean> {
    const template = renderEmailTemplate(EmailTemplate.EVENT_TICKET_RECEIPT, data);
    
    return this.sendEmail({
      to,
      subject: `Your Ticket for ${data.eventTitle}`,
      html: template.html,
      text: template.text,
    });
  }

  /**
   * Send event ticket confirmation (simplified version)
   */
  async sendEventTicketConfirmation(to: string, data: EventTicketConfirmationData): Promise<boolean> {
    const template = renderEmailTemplate(EmailTemplate.EVENT_TICKET_CONFIRMATION, data);
    
    return this.sendEmail({
      to,
      subject: `Ticket Confirmed - ${data.eventTitle}`,
      html: template.html,
      text: template.text,
    });
  }

  /**
   * Send event reminder with ticket QR code
   */
  async sendEventReminderWithTicket(to: string, data: EventReminderWithTicketData): Promise<boolean> {
    const template = renderEmailTemplate(EmailTemplate.EVENT_REMINDER_WITH_TICKET, data);
    
    const timeframe = data.hoursUntilEvent <= 24 ? 'Tomorrow' : `in ${Math.ceil(data.hoursUntilEvent / 24)} days`;
    
    return this.sendEmail({
      to,
      subject: `Reminder: ${data.eventTitle} is ${timeframe}`,
      html: template.html,
      text: template.text,
    });
  }

  // ============= PAYMENT & PAYOUT EMAILS =============

  /**
   * Send refund confirmation
   */
  async sendRefundConfirmation(to: string, data: RefundConfirmationData): Promise<boolean> {
    const template = renderEmailTemplate(EmailTemplate.REFUND_CONFIRMATION, data);
    
    return this.sendEmail({
      to,
      subject: `Refund Processed - ${data.refundAmount} ${data.currency}`,
      html: template.html,
      text: template.text,
    });
  }

  /**
   * Send payout notification to seller/host
   */
  async sendPayoutNotification(to: string, data: PayoutNotificationData): Promise<boolean> {
    const template = renderEmailTemplate(EmailTemplate.PAYOUT_NOTIFICATION, data);
    
    return this.sendEmail({
      to,
      subject: `Payout Processed - ${data.amount} ${data.currency}`,
      html: template.html,
      text: template.text,
    });
  }
}

// Export singleton instance
export const emailService = new EmailService();
