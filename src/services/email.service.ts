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
  CampaignEmailData,
  EmailAttachment
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
import { generateICalendar } from '../utils/calendar.helper';

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
      const msg: any = {
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

      // Add attachments if provided
      if (options.attachments && options.attachments.length > 0) {
        msg.attachments = options.attachments.map(att => ({
          filename: att.filename,
          content: att.content ? (Buffer.isBuffer(att.content) ? att.content.toString('base64') : att.content) : undefined,
          type: att.contentType,
          disposition: 'attachment',
        }));
      }

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
    const calendarAttachment = this.generateEventCalendarAttachment(data);
    
    return this.sendEmail({
      to,
      subject: `You're Invited: ${data.eventTitle}`,
      html: template.html,
      text: template.text,
      attachments: calendarAttachment ? [calendarAttachment] : undefined,
    });
  }

  /**
   * Send event reminder email
   */
  async sendEventReminderEmail(to: string, data: EventEmailData): Promise<boolean> {
    const template = renderEmailTemplate(EmailTemplate.EVENT_REMINDER, data);
    const calendarAttachment = this.generateEventCalendarAttachment(data);
    
    return this.sendEmail({
      to,
      subject: `Reminder: ${data.eventTitle} is Coming Up!`,
      html: template.html,
      text: template.text,
      attachments: calendarAttachment ? [calendarAttachment] : undefined,
    });
  }

  /**
   * Send event confirmation email
   */
  async sendEventConfirmationEmail(to: string, data: EventEmailData): Promise<boolean> {
    const template = renderEmailTemplate(EmailTemplate.EVENT_CONFIRMATION, data);
    const calendarAttachment = this.generateEventCalendarAttachment(data);
    
    return this.sendEmail({
      to,
      subject: `Confirmed: ${data.eventTitle}`,
      html: template.html,
      text: template.text,
      attachments: calendarAttachment ? [calendarAttachment] : undefined,
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

  // ============= SUBSCRIPTION PAYMENT EMAILS =============

  /**
   * Send subscription payment success email with invoice
   */
  async sendSubscriptionPaymentSuccess(
    to: string,
    data: {
      userName: string;
      tierName: string;
      amount: number;
      currency: string;
      billingPeriodStart: string;
      billingPeriodEnd: string;
      nextBillingDate: string;
      paymentMethod: string;
      transactionId: string;
      invoiceNumber: string;
      invoiceUrl: string;
    }
  ): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .invoice-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb; }
          .amount { font-size: 32px; font-weight: bold; color: #10b981; margin: 10px 0; }
          .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Payment Successful</h1>
          </div>
          <div class="content">
            <p>Hi ${data.userName},</p>
            <p>Thank you! Your subscription payment has been processed successfully.</p>
            
            <div class="invoice-box">
              <h3>Invoice: ${data.invoiceNumber}</h3>
              <div class="amount">${data.amount} ${data.currency}</div>
              
              <div class="detail-row">
                <span>Subscription Tier:</span>
                <strong>${data.tierName}</strong>
              </div>
              <div class="detail-row">
                <span>Billing Period:</span>
                <strong>${data.billingPeriodStart} - ${data.billingPeriodEnd}</strong>
              </div>
              <div class="detail-row">
                <span>Payment Method:</span>
                <strong>${data.paymentMethod}</strong>
              </div>
              <div class="detail-row">
                <span>Transaction ID:</span>
                <strong>${data.transactionId}</strong>
              </div>
              <div class="detail-row">
                <span>Next Billing Date:</span>
                <strong>${data.nextBillingDate}</strong>
              </div>
            </div>

            <div style="text-align: center;">
              <a href="${data.invoiceUrl}" class="button">Download Invoice</a>
            </div>

            <p style="margin-top: 30px;">Your subscription is active and all premium features are available.</p>
            
            <div class="footer">
              <p>Questions? Contact us at support@berse.app</p>
              <p>© ${new Date().getFullYear()} Berse. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to,
      subject: `Payment Received - ${data.tierName} Subscription`,
      html,
      text: `Payment Successful\n\nHi ${data.userName},\n\nYour ${data.tierName} subscription payment of ${data.amount} ${data.currency} was successful.\n\nInvoice: ${data.invoiceNumber}\nBilling Period: ${data.billingPeriodStart} - ${data.billingPeriodEnd}\nNext Billing: ${data.nextBillingDate}\n\nView invoice: ${data.invoiceUrl}`,
    });
  }

  /**
   * Send subscription payment failed email
   */
  async sendSubscriptionPaymentFailed(
    to: string,
    data: {
      userName: string;
      tierName: string;
      amount: number;
      currency: string;
      failureReason: string;
      retryDate: string;
      updatePaymentUrl: string;
    }
  ): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .alert-box { background: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; margin: 20px 0; border-radius: 4px; }
          .button { display: inline-block; background: #ef4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚠️ Payment Failed</h1>
          </div>
          <div class="content">
            <p>Hi ${data.userName},</p>
            
            <div class="alert-box">
              <h3>Your subscription payment could not be processed</h3>
              <p><strong>Amount:</strong> ${data.amount} ${data.currency}</p>
              <p><strong>Subscription:</strong> ${data.tierName}</p>
              <p><strong>Reason:</strong> ${data.failureReason}</p>
              <p><strong>Retry Date:</strong> ${data.retryDate}</p>
            </div>

            <p>To avoid service interruption, please update your payment method before ${data.retryDate}.</p>

            <div style="text-align: center;">
              <a href="${data.updatePaymentUrl}" class="button">Update Payment Method</a>
            </div>

            <p style="margin-top: 30px;">Your subscription will remain active until the retry date. If payment continues to fail, your subscription may be suspended.</p>
            
            <div class="footer">
              <p>Need help? Contact us at support@berse.app</p>
              <p>© ${new Date().getFullYear()} Berse. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to,
      subject: `Action Required: Subscription Payment Failed`,
      html,
      text: `Payment Failed\n\nHi ${data.userName},\n\nYour ${data.tierName} subscription payment of ${data.amount} ${data.currency} failed.\n\nReason: ${data.failureReason}\nRetry Date: ${data.retryDate}\n\nPlease update your payment method: ${data.updatePaymentUrl}`,
    });
  }

  /**
   * Send upcoming subscription payment reminder
   */
  async sendUpcomingSubscriptionPayment(
    to: string,
    data: {
      userName: string;
      tierName: string;
      amount: number;
      currency: string;
      billingDate: string;
      paymentMethod: string;
      manageSubscriptionUrl: string;
    }
  ): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .info-box { background: #eff6ff; padding: 20px; margin: 20px 0; border-radius: 8px; border: 1px solid #bfdbfe; }
          .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💰 Upcoming Billing</h1>
          </div>
          <div class="content">
            <p>Hi ${data.userName},</p>
            <p>This is a friendly reminder that your subscription will renew soon.</p>
            
            <div class="info-box">
              <h3>Billing Details</h3>
              <p><strong>Subscription:</strong> ${data.tierName}</p>
              <p><strong>Amount:</strong> ${data.amount} ${data.currency}</p>
              <p><strong>Billing Date:</strong> ${data.billingDate}</p>
              <p><strong>Payment Method:</strong> ${data.paymentMethod}</p>
            </div>

            <p>No action is needed - your subscription will renew automatically.</p>

            <div style="text-align: center;">
              <a href="${data.manageSubscriptionUrl}" class="button">Manage Subscription</a>
            </div>

            <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">Want to make changes? You can update your payment method or cancel anytime.</p>
            
            <div class="footer">
              <p>Questions? Contact us at support@berse.app</p>
              <p>© ${new Date().getFullYear()} Berse. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to,
      subject: `Reminder: Upcoming Billing for ${data.tierName} Subscription`,
      html,
      text: `Upcoming Billing\n\nHi ${data.userName},\n\nYour ${data.tierName} subscription of ${data.amount} ${data.currency} will be charged on ${data.billingDate}.\n\nPayment Method: ${data.paymentMethod}\n\nManage subscription: ${data.manageSubscriptionUrl}`,
    });
  }

  /**
   * Generate calendar attachment for event emails
   */
  private generateEventCalendarAttachment(data: EventEmailData): EmailAttachment | null {
    try {
      if (!data.eventDate || !data.eventTitle) {
        return null;
      }

      // Parse event date
      const startDate = new Date(data.eventDate);
      
      // Generate iCalendar content
      const icsContent = generateICalendar({
        title: data.eventTitle,
        description: data.eventDescription || '',
        location: data.eventLocation || '',
        startDate,
        url: data.eventUrl,
        organizer: data.hostName ? {
          name: data.hostName,
          email: this.fromEmail,
        } : undefined,
      });

      // Return attachment
      return {
        filename: `${data.eventTitle.replace(/[^a-z0-9]/gi, '_')}.ics`,
        content: Buffer.from(icsContent, 'utf-8'),
        contentType: 'text/calendar; charset=utf-8; method=REQUEST',
      };
    } catch (error) {
      logger.error('Failed to generate calendar attachment', { error, eventTitle: data.eventTitle });
      return null;
    }
  }
}

// Export singleton instance
export const emailService = new EmailService();
