import { PrismaClient } from '@prisma/client';
import { sendPushNotification } from '../routes/push.routes';
import cron from 'node-cron';

const prisma = new PrismaClient();

interface ProfileCompletionData {
  userId: string;
  percentage: number;
  missingFields: string[];
  lastReminderSent?: Date;
}

/**
 * Calculate profile completion percentage
 */
export async function calculateProfileCompletion(userId: string): Promise<ProfileCompletionData> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      communityMembers: true,
      attendedEvents: true,
      badges: true
    }
  });

  if (!user) {
    throw new Error('User not found');
  }

  const fields = {
    // Basic info (40%)
    fullName: { value: user.fullName, weight: 5 },
    email: { value: user.email, weight: 5 },
    phone: { value: user.phone, weight: 3 },
    profilePicture: { value: user.profilePicture, weight: 8 },
    bio: { value: user.bio, weight: 5 },
    city: { value: user.city, weight: 4 },
    nationality: { value: user.nationality, weight: 2 },
    dateOfBirth: { value: user.dateOfBirth, weight: 3 },
    gender: { value: user.gender, weight: 2 },
    
    // Social (30%)
    interests: { value: user.interests?.length > 0, weight: 8 },
    instagramHandle: { value: user.instagramHandle, weight: 4 },
    linkedinHandle: { value: user.linkedinHandle, weight: 4 },
    communityMembers: { value: user.communityMembers?.length > 0, weight: 8 },
    
    // Engagement (30%)
    attendedEvents: { value: user.attendedEvents?.length > 0, weight: 10 },
    badges: { value: user.badges?.length > 0, weight: 5 },
    isHostCertified: { value: user.isHostCertified, weight: 5 },
    totalPoints: { value: user.totalPoints > 0, weight: 10 }
  };

  let totalWeight = 0;
  let completedWeight = 0;
  const missingFields: string[] = [];

  Object.entries(fields).forEach(([fieldName, field]) => {
    totalWeight += field.weight;
    
    if (field.value) {
      completedWeight += field.weight;
    } else {
      missingFields.push(fieldName);
    }
  });

  const percentage = Math.round((completedWeight / totalWeight) * 100);

  return {
    userId,
    percentage,
    missingFields,
    lastReminderSent: undefined
  };
}

/**
 * Check if user should receive a reminder
 */
async function shouldSendReminder(userId: string, percentage: number): Promise<boolean> {
  // Don't send if profile is more than 80% complete
  if (percentage >= 80) {
    return false;
  }

  // Check last reminder sent (stored in a separate table or cache)
  // For now, we'll use a simple in-memory cache
  const lastReminder = profileReminderCache.get(userId);
  if (lastReminder) {
    const hoursSinceLastReminder = (Date.now() - lastReminder.getTime()) / (1000 * 60 * 60);
    
    // Send reminders based on completion percentage
    if (percentage < 30) {
      return hoursSinceLastReminder >= 24; // Daily for very incomplete profiles
    } else if (percentage < 60) {
      return hoursSinceLastReminder >= 72; // Every 3 days for partially complete
    } else {
      return hoursSinceLastReminder >= 168; // Weekly for mostly complete
    }
  }

  return true; // Send if no previous reminder
}

/**
 * Generate reminder message based on completion
 */
function generateReminderMessage(percentage: number, missingFields: string[]): {
  title: string;
  body: string;
  priority: 'high' | 'medium' | 'low';
} {
  const topMissing = missingFields.slice(0, 3);
  
  if (percentage < 30) {
    return {
      title: '👋 Complete Your BerseMuka Profile',
      body: 'Add a photo and bio to start connecting with amazing people!',
      priority: 'high'
    };
  } else if (percentage < 50) {
    const fieldMessages: { [key: string]: string } = {
      profilePicture: 'Add a profile photo',
      bio: 'Write your bio',
      interests: 'Select your interests',
      communityMembers: 'Join communities',
      attendedEvents: 'Attend an event'
    };
    
    const suggestion = topMissing
      .map(field => fieldMessages[field])
      .filter(Boolean)
      .join(', ');
    
    return {
      title: `📊 Your Profile is ${percentage}% Complete`,
      body: suggestion || 'Add more details to unlock all features!',
      priority: 'medium'
    };
  } else if (percentage < 80) {
    return {
      title: '✨ Almost There!',
      body: `Just a few more details to complete your profile (${percentage}% done)`,
      priority: 'low'
    };
  }

  // Should not reach here, but just in case
  return {
    title: '🎯 Boost Your Profile',
    body: 'Keep your profile updated to get more connections!',
    priority: 'low'
  };
}

// In-memory cache for last reminder sent
const profileReminderCache = new Map<string, Date>();

/**
 * Send profile completion reminders to users
 */
export async function sendProfileCompletionReminders() {
  try {
    console.log('🔔 Starting profile completion reminder job...');
    
    // Get all users with push subscriptions
    const usersWithSubscriptions = await prisma.user.findMany({
      where: {
        pushSubscription: {
          isNot: null
        }
      },
      select: {
        id: true,
        fullName: true,
        email: true
      }
    });

    console.log(`Found ${usersWithSubscriptions.length} users with push subscriptions`);

    let sentCount = 0;
    let skippedCount = 0;

    for (const user of usersWithSubscriptions) {
      try {
        // Calculate profile completion
        const completion = await calculateProfileCompletion(user.id);
        
        // Check if should send reminder
        if (await shouldSendReminder(user.id, completion.percentage)) {
          // Generate message
          const message = generateReminderMessage(completion.percentage, completion.missingFields);
          
          // Send push notification
          const result = await sendPushNotification(user.id, {
            title: message.title,
            body: message.body,
            icon: '/icons/icon-192x192.png',
            url: '/edit-profile',
            tag: 'profile-completion',
            data: {
              type: 'profile_completion',
              percentage: completion.percentage,
              priority: message.priority
            }
          });

          if (result.success) {
            sentCount++;
            profileReminderCache.set(user.id, new Date());
            console.log(`✅ Sent reminder to ${user.fullName} (${completion.percentage}% complete)`);
          } else {
            console.log(`❌ Failed to send reminder to ${user.fullName}: ${result.error}`);
          }
        } else {
          skippedCount++;
        }
      } catch (error) {
        console.error(`Error processing user ${user.id}:`, error);
      }
    }

    console.log(`✅ Profile completion reminders sent: ${sentCount}, skipped: ${skippedCount}`);
  } catch (error) {
    console.error('❌ Error in profile completion reminder job:', error);
  }
}

/**
 * Send milestone notifications when users reach certain completion levels
 */
export async function sendMilestoneNotification(userId: string, percentage: number) {
  const milestones = [25, 50, 75, 100];
  
  if (milestones.includes(percentage)) {
    const messages: { [key: number]: { title: string; body: string } } = {
      25: {
        title: '🌱 Great Start!',
        body: 'Your profile is 25% complete. Keep going!'
      },
      50: {
        title: '🎉 Halfway There!',
        body: 'Your profile is 50% complete. You\'re doing great!'
      },
      75: {
        title: '💎 Almost Complete!',
        body: 'Your profile is 75% complete. Just a few more details!'
      },
      100: {
        title: '🏆 Profile Complete!',
        body: 'Congratulations! Your profile is 100% complete. You\'re ready to connect!'
      }
    };

    const message = messages[percentage];
    if (message) {
      await sendPushNotification(userId, {
        title: message.title,
        body: message.body,
        icon: '/icons/icon-192x192.png',
        url: '/profile',
        tag: 'profile-milestone',
        data: {
          type: 'milestone',
          percentage
        }
      });
    }
  }
}

/**
 * Initialize cron job for profile completion reminders
 */
export function initializeProfileReminderJob() {
  // Run every day at 10 AM
  cron.schedule('0 10 * * *', async () => {
    console.log('⏰ Running daily profile completion reminder job');
    await sendProfileCompletionReminders();
  });

  // Also run at 6 PM for evening reminders
  cron.schedule('0 18 * * *', async () => {
    console.log('⏰ Running evening profile completion reminder job');
    await sendProfileCompletionReminders();
  });

  console.log('✅ Profile completion reminder job initialized');
}

// Export for testing
export default {
  calculateProfileCompletion,
  sendProfileCompletionReminders,
  sendMilestoneNotification,
  initializeProfileReminderJob
};