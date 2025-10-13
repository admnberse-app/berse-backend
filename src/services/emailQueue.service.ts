import { EmailTemplate } from '../types/email.types';
import { emailService } from '../services/email.service';
import logger from '../utils/logger';

interface QueuedEmail {
  id: string;
  to: string | string[];
  template: EmailTemplate;
  data: any;
  retries: number;
  maxRetries: number;
  scheduledAt?: Date;
  createdAt: Date;
}

export class EmailQueue {
  private queue: QueuedEmail[] = [];
  private processing = false;
  private readonly maxRetries = 3;
  private readonly retryDelay = 5000; // 5 seconds
  private readonly processingInterval = 1000; // 1 second

  constructor() {
    this.startProcessing();
  }

  /**
   * Add email to queue
   */
  public add(
    to: string | string[],
    template: EmailTemplate,
    data: any,
    scheduledAt?: Date
  ): string {
    const id = this.generateId();
    const queuedEmail: QueuedEmail = {
      id,
      to,
      template,
      data,
      retries: 0,
      maxRetries: this.maxRetries,
      scheduledAt,
      createdAt: new Date(),
    };

    this.queue.push(queuedEmail);
    logger.info('Email added to queue', { id, to, template });

    return id;
  }

  /**
   * Process email queue
   */
  private async startProcessing(): Promise<void> {
    setInterval(async () => {
      if (this.processing || this.queue.length === 0) {
        return;
      }

      this.processing = true;

      try {
        const email = this.queue[0];

        // Check if email should be sent now
        if (email.scheduledAt && email.scheduledAt > new Date()) {
          this.processing = false;
          return;
        }

        await this.processEmail(email);
      } catch (error) {
        logger.error('Error processing email queue', { error });
      } finally {
        this.processing = false;
      }
    }, this.processingInterval);
  }

  /**
   * Process individual email
   */
  private async processEmail(email: QueuedEmail): Promise<void> {
    try {
      let success = false;

      switch (email.template) {
        case EmailTemplate.VERIFICATION:
          success = await emailService.sendVerificationEmail(
            email.to as string,
            email.data
          );
          break;
        case EmailTemplate.WELCOME:
          success = await emailService.sendWelcomeEmail(
            email.to as string,
            email.data
          );
          break;
        case EmailTemplate.PASSWORD_RESET:
          success = await emailService.sendPasswordResetEmail(
            email.to as string,
            email.data
          );
          break;
        case EmailTemplate.EVENT_INVITATION:
          success = await emailService.sendEventInvitationEmail(
            email.to as string,
            email.data
          );
          break;
        case EmailTemplate.EVENT_CONFIRMATION:
          success = await emailService.sendEventConfirmationEmail(
            email.to as string,
            email.data
          );
          break;
        case EmailTemplate.EVENT_REMINDER:
          success = await emailService.sendEventReminderEmail(
            email.to as string,
            email.data
          );
          break;
        case EmailTemplate.EVENT_CANCELLATION:
          success = await emailService.sendEventCancellationEmail(
            email.to as string,
            email.data
          );
          break;
        case EmailTemplate.CAMPAIGN:
          success = await emailService.sendCampaignEmail(
            email.to,
            email.data
          );
          break;
        case EmailTemplate.NOTIFICATION:
          success = await emailService.sendNotificationEmail(
            email.to as string,
            email.data.subject,
            email.data.message,
            email.data.actionUrl,
            email.data.actionText
          );
          break;
        default:
          logger.warn('Unknown email template', { template: email.template });
          this.queue.shift(); // Remove from queue
          return;
      }

      if (success) {
        logger.info('Email sent successfully', { id: email.id, to: email.to });
        this.queue.shift(); // Remove from queue
      } else {
        this.handleFailure(email);
      }
    } catch (error) {
      logger.error('Error sending email', { error, emailId: email.id });
      this.handleFailure(email);
    }
  }

  /**
   * Handle email sending failure
   */
  private handleFailure(email: QueuedEmail): void {
    email.retries++;

    if (email.retries >= email.maxRetries) {
      logger.error('Email failed after max retries', {
        id: email.id,
        to: email.to,
        retries: email.retries,
      });
      this.queue.shift(); // Remove from queue
    } else {
      logger.warn('Email failed, will retry', {
        id: email.id,
        to: email.to,
        retries: email.retries,
        maxRetries: email.maxRetries,
      });
      // Move to end of queue for retry
      this.queue.push(this.queue.shift()!);
    }
  }

  /**
   * Get queue status
   */
  public getStatus() {
    return {
      queueLength: this.queue.length,
      processing: this.processing,
      emails: this.queue.map(email => ({
        id: email.id,
        to: email.to,
        template: email.template,
        retries: email.retries,
        scheduledAt: email.scheduledAt,
        createdAt: email.createdAt,
      })),
    };
  }

  /**
   * Clear queue
   */
  public clear(): void {
    this.queue = [];
    logger.info('Email queue cleared');
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const emailQueue = new EmailQueue();
