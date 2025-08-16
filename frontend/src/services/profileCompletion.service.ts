// Profile Completion Service
import { pushNotificationService } from './pushNotification.service';

interface ProfileField {
  field: string;
  label: string;
  required: boolean;
  weight: number; // Weight for completion percentage
}

interface ProfileCompletionStatus {
  percentage: number;
  missingFields: ProfileField[];
  completedFields: string[];
  isComplete: boolean;
  nextSteps: string[];
}

export class ProfileCompletionService {
  private readonly PROFILE_FIELDS: ProfileField[] = [
    // Basic Information (40%)
    { field: 'fullName', label: 'Full Name', required: true, weight: 5 },
    { field: 'email', label: 'Email', required: true, weight: 5 },
    { field: 'phone', label: 'Phone Number', required: false, weight: 3 },
    { field: 'age', label: 'Age', required: true, weight: 3 },
    { field: 'profilePicture', label: 'Profile Photo', required: true, weight: 8 },
    { field: 'bio', label: 'Bio', required: true, weight: 5 },
    { field: 'currentLocation', label: 'Current Location', required: true, weight: 4 },
    { field: 'originLocation', label: 'Origin Location', required: false, weight: 2 },
    { field: 'profession', label: 'Profession', required: true, weight: 5 },
    
    // Social & Interests (30%)
    { field: 'topInterests', label: 'Top Interests', required: true, weight: 8 },
    { field: 'personalityType', label: 'Personality Type', required: false, weight: 3 },
    { field: 'languages', label: 'Languages', required: false, weight: 3 },
    { field: 'linkedin', label: 'LinkedIn Profile', required: false, weight: 4 },
    { field: 'instagram', label: 'Instagram Handle', required: false, weight: 4 },
    { field: 'communities', label: 'Join Communities', required: false, weight: 8 },
    
    // Offerings & Services (20%)
    { field: 'offerBerseGuide', label: 'Offer as Guide', required: false, weight: 5 },
    { field: 'offerHomeSurf', label: 'Offer HomeSurf', required: false, weight: 5 },
    { field: 'offerBerseBuddy', label: 'Offer as Buddy', required: false, weight: 5 },
    { field: 'offerBerseMentor', label: 'Offer Mentorship', required: false, weight: 5 },
    
    // Engagement (10%)
    { field: 'eventsAttended', label: 'Events Attended', required: false, weight: 5 },
    { field: 'travelHistory', label: 'Travel History', required: false, weight: 5 }
  ];

  /**
   * Check profile completion status
   */
  checkProfileCompletion(userProfile: any): ProfileCompletionStatus {
    const completedFields: string[] = [];
    const missingFields: ProfileField[] = [];
    let totalWeight = 0;
    let completedWeight = 0;

    this.PROFILE_FIELDS.forEach(field => {
      totalWeight += field.weight;
      
      const fieldValue = this.getNestedValue(userProfile, field.field);
      const isCompleted = this.isFieldCompleted(fieldValue);
      
      if (isCompleted) {
        completedFields.push(field.field);
        completedWeight += field.weight;
      } else {
        missingFields.push(field);
      }
    });

    const percentage = Math.round((completedWeight / totalWeight) * 100);
    const isComplete = percentage >= 80; // Consider 80% as complete
    
    // Sort missing fields by weight (importance)
    missingFields.sort((a, b) => b.weight - a.weight);
    
    // Generate next steps based on missing fields
    const nextSteps = this.generateNextSteps(missingFields, percentage);

    return {
      percentage,
      missingFields,
      completedFields,
      isComplete,
      nextSteps
    };
  }

  /**
   * Generate next steps based on missing fields
   */
  private generateNextSteps(missingFields: ProfileField[], percentage: number): string[] {
    const steps: string[] = [];
    
    if (percentage < 30) {
      steps.push('Start by adding your profile photo and bio');
      steps.push('Tell us about your interests and profession');
    } else if (percentage < 60) {
      const requiredMissing = missingFields.filter(f => f.required);
      if (requiredMissing.length > 0) {
        steps.push(`Complete required fields: ${requiredMissing.slice(0, 3).map(f => f.label).join(', ')}`);
      }
      steps.push('Join communities that match your interests');
    } else if (percentage < 80) {
      steps.push('Add your social media links to connect better');
      steps.push('Share your travel experiences and offerings');
    } else {
      const remaining = missingFields.slice(0, 2);
      if (remaining.length > 0) {
        steps.push(`Final touches: Add ${remaining.map(f => f.label).join(' and ')}`);
      }
    }
    
    return steps;
  }

  /**
   * Schedule profile completion reminders
   */
  async scheduleProfileReminders(userId: string, completionStatus: ProfileCompletionStatus) {
    // Don't schedule if profile is complete
    if (completionStatus.isComplete) {
      return;
    }

    const notifications = this.generateNotificationSchedule(completionStatus);
    
    // Store scheduled notifications in localStorage (or backend)
    const scheduledReminders = {
      userId,
      completionPercentage: completionStatus.percentage,
      notifications,
      createdAt: new Date().toISOString()
    };
    
    localStorage.setItem(`profile_reminders_${userId}`, JSON.stringify(scheduledReminders));
    
    // Schedule the first notification
    if (notifications.length > 0 && pushNotificationService.getPermissionStatus() === 'granted') {
      this.scheduleNextNotification(notifications[0], userId);
    }
  }

  /**
   * Generate notification schedule based on completion status
   */
  private generateNotificationSchedule(status: ProfileCompletionStatus) {
    const notifications = [];
    
    if (status.percentage < 30) {
      // New user - remind after 1 hour, 1 day, 3 days
      notifications.push({
        delay: 3600000, // 1 hour
        title: '👋 Complete Your BerseMuka Profile',
        body: 'Add a photo and bio to start connecting with others!',
        priority: 'high'
      });
      notifications.push({
        delay: 86400000, // 1 day
        title: '📸 Your Profile Needs a Photo',
        body: 'Profiles with photos get 5x more connections!',
        priority: 'medium'
      });
      notifications.push({
        delay: 259200000, // 3 days
        title: '🎯 You\'re Missing Out!',
        body: 'Complete your profile to unlock all BerseMuka features',
        priority: 'high'
      });
    } else if (status.percentage < 60) {
      // Partially complete - remind after 2 days, 1 week
      notifications.push({
        delay: 172800000, // 2 days
        title: `📊 Your Profile is ${status.percentage}% Complete`,
        body: status.nextSteps[0] || 'Add more details to stand out!',
        priority: 'medium'
      });
      notifications.push({
        delay: 604800000, // 1 week
        title: '🚀 Boost Your Profile',
        body: 'Complete profiles get 3x more matches and event invites!',
        priority: 'low'
      });
    } else if (status.percentage < 80) {
      // Almost complete - gentle reminder after 1 week
      notifications.push({
        delay: 604800000, // 1 week
        title: '✨ Almost There!',
        body: `Just a few more details to reach 100% profile completion`,
        priority: 'low'
      });
    }
    
    // Add milestone notifications
    if (status.percentage === 50) {
      notifications.push({
        delay: 0, // Immediate
        title: '🎉 Halfway There!',
        body: 'Your profile is 50% complete. Keep going!',
        priority: 'low'
      });
    }
    
    return notifications;
  }

  /**
   * Schedule next notification
   */
  private scheduleNextNotification(notification: any, userId: string) {
    setTimeout(async () => {
      try {
        await this.sendProfileCompletionNotification(userId, notification);
      } catch (error) {
        console.error('Failed to send profile completion notification:', error);
      }
    }, notification.delay);
  }

  /**
   * Send profile completion notification
   */
  async sendProfileCompletionNotification(userId: string, notification: any) {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/v1/push/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId,
          title: notification.title,
          body: notification.body,
          icon: '/icons/icon-192x192.png',
          url: '/edit-profile',
          tag: 'profile-completion',
          data: {
            type: 'profile_completion',
            priority: notification.priority
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send notification');
      }
    } catch (error) {
      console.error('Error sending profile completion notification:', error);
    }
  }

  /**
   * Get profile completion tips
   */
  getCompletionTips(missingFields: ProfileField[]): string[] {
    const tips: string[] = [];
    
    // Check for specific missing fields and provide targeted tips
    const fieldNames = missingFields.map(f => f.field);
    
    if (fieldNames.includes('profilePicture')) {
      tips.push('📸 Profiles with photos receive 5x more connections');
    }
    
    if (fieldNames.includes('bio')) {
      tips.push('✍️ A compelling bio helps others understand your interests');
    }
    
    if (fieldNames.includes('topInterests')) {
      tips.push('🎯 Select your interests to get matched with like-minded people');
    }
    
    if (fieldNames.includes('communities')) {
      tips.push('👥 Join communities to expand your network');
    }
    
    if (fieldNames.includes('linkedin') || fieldNames.includes('instagram')) {
      tips.push('🔗 Connect social media for better networking');
    }
    
    if (fieldNames.includes('eventsAttended')) {
      tips.push('📅 Attend events to earn points and make connections');
    }
    
    return tips;
  }

  /**
   * Check if a field is completed
   */
  private isFieldCompleted(value: any): boolean {
    if (value === null || value === undefined || value === '') {
      return false;
    }
    
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    
    if (typeof value === 'object') {
      return Object.keys(value).length > 0;
    }
    
    return true;
  }

  /**
   * Get nested value from object
   */
  private getNestedValue(obj: any, path: string): any {
    const keys = path.split('.');
    let value = obj;
    
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return undefined;
      }
    }
    
    return value;
  }

  /**
   * Track profile view to trigger completion reminder
   */
  trackProfileView(userId: string, completionPercentage: number) {
    const viewData = {
      userId,
      percentage: completionPercentage,
      viewedAt: new Date().toISOString(),
      reminderSent: false
    };
    
    // Store in localStorage
    const viewHistory = JSON.parse(localStorage.getItem('profile_views') || '[]');
    viewHistory.push(viewData);
    localStorage.setItem('profile_views', JSON.stringify(viewHistory));
    
    // If profile is less than 50% complete and user hasn't been reminded today
    if (completionPercentage < 50 && !this.hasRecentReminder(userId)) {
      this.triggerImmediateReminder(userId, completionPercentage);
    }
  }

  /**
   * Check if user has recent reminder
   */
  private hasRecentReminder(userId: string): boolean {
    const reminders = JSON.parse(localStorage.getItem(`profile_reminders_${userId}`) || '{}');
    if (reminders.createdAt) {
      const lastReminder = new Date(reminders.createdAt);
      const hoursSinceReminder = (Date.now() - lastReminder.getTime()) / (1000 * 60 * 60);
      return hoursSinceReminder < 24; // Don't remind if reminded in last 24 hours
    }
    return false;
  }

  /**
   * Trigger immediate reminder for low completion
   */
  private async triggerImmediateReminder(userId: string, percentage: number) {
    if (pushNotificationService.getPermissionStatus() === 'granted') {
      await this.sendProfileCompletionNotification(userId, {
        title: '🔔 Complete Your Profile',
        body: `Your profile is only ${percentage}% complete. Add more details to connect better!`,
        priority: 'medium'
      });
    }
  }
}

export const profileCompletionService = new ProfileCompletionService();