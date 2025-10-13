import { Request, Response } from 'express';
import { emailService } from '../services/email.service';
import { emailQueue } from '../services/emailQueue.service';
import { EmailTemplate } from '../types/email.types';
import logger from '../utils/logger';
import { asyncHandler } from '../utils/asyncHandler';

export class EmailController {
  /**
   * Send test email
   */
  static sendTestEmail = asyncHandler(async (req: Request, res: Response) => {
    const { to } = req.body;

    if (!to) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required',
      });
    }

    const success = await emailService.sendTestEmail(to);

    if (success) {
      res.json({
        success: true,
        message: 'Test email sent successfully',
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send test email',
      });
    }
  });

  /**
   * Send verification email
   */
  static sendVerificationEmail = asyncHandler(async (req: Request, res: Response) => {
    const { to, userName, verificationUrl, verificationCode, expiresIn } = req.body;

    if (!to || !verificationUrl) {
      return res.status(400).json({
        success: false,
        message: 'Email address and verification URL are required',
      });
    }

    const queueId = emailQueue.add(to, EmailTemplate.VERIFICATION, {
      userName,
      verificationUrl,
      verificationCode,
      expiresIn,
    });

    res.json({
      success: true,
      message: 'Verification email queued',
      queueId,
    });
  });

  /**
   * Send welcome email
   */
  static sendWelcomeEmail = asyncHandler(async (req: Request, res: Response) => {
    const { to, userName, loginUrl, exploreUrl } = req.body;

    if (!to || !userName) {
      return res.status(400).json({
        success: false,
        message: 'Email address and user name are required',
      });
    }

    const queueId = emailQueue.add(to, EmailTemplate.WELCOME, {
      userName,
      loginUrl,
      exploreUrl,
    });

    res.json({
      success: true,
      message: 'Welcome email queued',
      queueId,
    });
  });

  /**
   * Send password reset email
   */
  static sendPasswordResetEmail = asyncHandler(async (req: Request, res: Response) => {
    const { to, userName, resetUrl, resetCode, expiresIn } = req.body;

    if (!to || !resetUrl) {
      return res.status(400).json({
        success: false,
        message: 'Email address and reset URL are required',
      });
    }

    const queueId = emailQueue.add(to, EmailTemplate.PASSWORD_RESET, {
      userName,
      resetUrl,
      resetCode,
      expiresIn,
    });

    res.json({
      success: true,
      message: 'Password reset email queued',
      queueId,
    });
  });

  /**
   * Send event email
   */
  static sendEventEmail = asyncHandler(async (req: Request, res: Response) => {
    const { to, type, ...eventData } = req.body;

    if (!to || !type) {
      return res.status(400).json({
        success: false,
        message: 'Email address and event type are required',
      });
    }

    let template: EmailTemplate;
    switch (type) {
      case 'invitation':
        template = EmailTemplate.EVENT_INVITATION;
        break;
      case 'confirmation':
        template = EmailTemplate.EVENT_CONFIRMATION;
        break;
      case 'reminder':
        template = EmailTemplate.EVENT_REMINDER;
        break;
      case 'cancellation':
        template = EmailTemplate.EVENT_CANCELLATION;
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid event type',
        });
    }

    const queueId = emailQueue.add(to, template, eventData);

    res.json({
      success: true,
      message: `Event ${type} email queued`,
      queueId,
    });
  });

  /**
   * Send campaign email
   */
  static sendCampaignEmail = asyncHandler(async (req: Request, res: Response) => {
    const { recipients, ...campaignData } = req.body;

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Recipients array is required',
      });
    }

    if (!campaignData.subject || !campaignData.headline || !campaignData.content) {
      return res.status(400).json({
        success: false,
        message: 'Campaign subject, headline, and content are required',
      });
    }

    // Queue campaign email for each recipient
    const queueIds = recipients.map(recipient =>
      emailQueue.add(recipient, EmailTemplate.CAMPAIGN, campaignData)
    );

    res.json({
      success: true,
      message: `Campaign email queued for ${recipients.length} recipients`,
      queueIds,
      recipientCount: recipients.length,
    });
  });

  /**
   * Send bulk campaign emails using bulk sender
   */
  static sendBulkCampaign = asyncHandler(async (req: Request, res: Response) => {
    const { recipients, batchSize, ...campaignData } = req.body;

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Recipients array is required',
      });
    }

    if (!campaignData.subject || !campaignData.headline || !campaignData.content) {
      return res.status(400).json({
        success: false,
        message: 'Campaign subject, headline, and content are required',
      });
    }

    // Send bulk campaign directly (not queued)
    const result = await emailService.sendBulkEmails(
      recipients,
      campaignData,
      batchSize || 50
    );

    res.json({
      success: true,
      message: 'Bulk campaign completed',
      ...result,
    });
  });

  /**
   * Get email queue status
   */
  static getQueueStatus = asyncHandler(async (req: Request, res: Response) => {
    const status = emailQueue.getStatus();

    res.json({
      success: true,
      data: status,
    });
  });

  /**
   * Clear email queue
   */
  static clearQueue = asyncHandler(async (req: Request, res: Response) => {
    emailQueue.clear();

    res.json({
      success: true,
      message: 'Email queue cleared',
    });
  });

  /**
   * Send notification email
   */
  static sendNotificationEmail = asyncHandler(async (req: Request, res: Response) => {
    const { to, subject, message, actionUrl, actionText } = req.body;

    if (!to || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Email address, subject, and message are required',
      });
    }

    const queueId = emailQueue.add(to, EmailTemplate.NOTIFICATION, {
      subject,
      message,
      actionUrl,
      actionText,
    });

    res.json({
      success: true,
      message: 'Notification email queued',
      queueId,
    });
  });
}
