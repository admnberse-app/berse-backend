import { Router, Request, Response } from 'express';
import webpush from 'web-push';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';
import { body, validationResult } from 'express-validator';

const router = Router();
const prisma = new PrismaClient();

// Configure web-push with VAPID keys
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY || '';
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || '';
const vapidEmail = process.env.VAPID_EMAIL || 'mailto:admin@bersemuka.com';

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(vapidEmail, vapidPublicKey, vapidPrivateKey);
}

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

// Subscribe to push notifications
router.post('/subscribe', 
  authenticate,
  [
    body('subscription').isObject().withMessage('Subscription must be an object'),
    body('subscription.endpoint').isURL().withMessage('Invalid endpoint URL'),
    body('subscription.keys.p256dh').notEmpty().withMessage('p256dh key is required'),
    body('subscription.keys.auth').notEmpty().withMessage('auth key is required')
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
        return;
      }

      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'User authentication required'
        });
        return;
      }

      const { subscription } = req.body;

      // Store or update push subscription in database
      await prisma.pushSubscription.upsert({
        where: { userId },
        update: {
          endpoint: subscription.endpoint,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
          updatedAt: new Date()
        },
        create: {
          userId,
          endpoint: subscription.endpoint,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth
        }
      });

      res.json({
        success: true,
        message: 'Push subscription saved successfully'
      });
    } catch (error) {
      console.error('Error saving push subscription:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to save push subscription'
      });
    }
  }
);

// Unsubscribe from push notifications
router.delete('/unsubscribe',
  authenticate,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'User authentication required'
        });
        return;
      }

      await prisma.pushSubscription.deleteMany({
        where: { userId }
      });

      res.json({
        success: true,
        message: 'Push subscription removed successfully'
      });
    } catch (error) {
      console.error('Error removing push subscription:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to remove push subscription'
      });
    }
  }
);

// Send push notification function
export async function sendPushNotification(
  userId: string,
  payload: {
    title: string;
    body: string;
    icon?: string;
    url?: string;
    tag?: string;
    data?: any;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const subscription = await prisma.pushSubscription.findUnique({
      where: { userId }
    });

    if (!subscription) {
      return {
        success: false,
        error: 'No push subscription found for user'
      };
    }

    const pushSubscription = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.p256dh,
        auth: subscription.auth
      }
    };

    const notificationPayload = JSON.stringify({
      title: payload.title,
      body: payload.body,
      icon: payload.icon || '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      url: payload.url || '/',
      tag: payload.tag || 'general',
      data: payload.data || {}
    });

    await webpush.sendNotification(pushSubscription, notificationPayload);

    return { success: true };
  } catch (error) {
    console.error('Error sending push notification:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Send notification to all users (admin only)
router.post('/broadcast',
  authenticate,
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('body').notEmpty().withMessage('Body is required')
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const user = req.user;
      if (!user || user.role !== 'ADMIN') {
        res.status(403).json({
          success: false,
          error: 'Admin access required'
        });
        return;
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
        return;
      }

      const { title, body, icon, url, tag } = req.body;

      // Get all subscriptions
      const subscriptions = await prisma.pushSubscription.findMany({
        include: { user: true }
      });

      let sentCount = 0;
      let failedCount = 0;

      // Send to all subscribers
      for (const subscription of subscriptions) {
        const result = await sendPushNotification(subscription.userId, {
          title,
          body,
          icon,
          url,
          tag
        });

        if (result.success) {
          sentCount++;
        } else {
          failedCount++;
        }
      }

      res.json({
        success: true,
        message: `Broadcast sent to ${sentCount} users`,
        stats: {
          sent: sentCount,
          failed: failedCount,
          total: subscriptions.length
        }
      });
    } catch (error) {
      console.error('Error broadcasting notification:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to broadcast notification'
      });
    }
  }
);

// Get VAPID public key for frontend
router.get('/vapid-public-key', (req: Request, res: Response) => {
  res.json({
    publicKey: vapidPublicKey
  });
});

// Health check
router.get('/health', (req: Request, res: Response) => {
  const isConfigured = !!(vapidPublicKey && vapidPrivateKey);
  res.json({ 
    status: 'Push notifications enabled',
    configured: isConfigured
  });
});

export default router;