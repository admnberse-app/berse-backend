class NotificationService {
  private permission: NotificationPermission = 'default';
  
  constructor() {
    this.init();
  }

  /**
   * Initialize notification service and request permission
   */
  async init() {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return;
    }

    // Check current permission status
    this.permission = Notification.permission;

    // Request permission if not already granted or denied
    if (this.permission === 'default') {
      try {
        this.permission = await Notification.requestPermission();
      } catch (error) {
        console.error('Error requesting notification permission:', error);
      }
    }
  }

  /**
   * Request notification permission explicitly
   */
  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      return false;
    }

    try {
      this.permission = await Notification.requestPermission();
      return this.permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  /**
   * Check if notifications are enabled
   */
  isEnabled(): boolean {
    return 'Notification' in window && this.permission === 'granted';
  }

  /**
   * Show a notification
   */
  async showNotification(title: string, options?: NotificationOptions): Promise<void> {
    if (!this.isEnabled()) {
      console.log('Notifications not enabled');
      return;
    }

    try {
      const notification = new Notification(title, {
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        ...options
      });

      // Auto close after 5 seconds
      setTimeout(() => notification.close(), 5000);

      // Handle notification click
      notification.onclick = (event) => {
        event.preventDefault();
        window.focus();
        notification.close();
        
        // Handle specific actions based on notification data
        if (options?.data?.action === 'open-messages') {
          window.location.href = '/messages';
        } else if (options?.data?.action === 'open-notifications') {
          window.location.href = '/notifications';
        } else if (options?.data?.action === 'open-event') {
          window.location.href = `/event/${options.data.eventId}`;
        }
      };
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }

  /**
   * Show friend request notification
   */
  showFriendRequest(fromName: string, message?: string) {
    this.showNotification('New Friend Request! 🤝', {
      body: `${fromName} wants to connect with you${message ? ': ' + message : ''}`,
      tag: 'friend-request',
      requireInteraction: true,
      data: { action: 'open-notifications' }
    });
  }

  /**
   * Show message notification
   */
  showMessage(fromName: string, message: string) {
    this.showNotification(`Message from ${fromName} 💬`, {
      body: message.substring(0, 100) + (message.length > 100 ? '...' : ''),
      tag: 'message',
      data: { action: 'open-messages' }
    });
  }

  /**
   * Show event reminder notification
   */
  showEventReminder(eventTitle: string, timeUntil: string) {
    this.showNotification('Event Reminder! ⏰', {
      body: `${eventTitle} starts ${timeUntil}`,
      tag: 'event-reminder',
      requireInteraction: true
    });
  }

  /**
   * Show community notification
   */
  showCommunityUpdate(communityName: string, update: string) {
    this.showNotification(`${communityName} 👥`, {
      body: update,
      tag: 'community-update'
    });
  }

  /**
   * Store notification in local storage
   */
  storeNotification(notification: any) {
    const notifications = this.getStoredNotifications();
    notifications.unshift({
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      read: false
    });
    
    // Keep only last 100 notifications
    if (notifications.length > 100) {
      notifications.splice(100);
    }
    
    localStorage.setItem('notifications', JSON.stringify(notifications));
    
    // Update unread count
    this.updateUnreadCount();
  }

  /**
   * Get stored notifications
   */
  getStoredNotifications(): any[] {
    try {
      return JSON.parse(localStorage.getItem('notifications') || '[]');
    } catch (error) {
      console.error('Error reading notifications:', error);
      return [];
    }
  }

  /**
   * Mark notification as read
   */
  markAsRead(notificationId: string) {
    const notifications = this.getStoredNotifications();
    const notification = notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      localStorage.setItem('notifications', JSON.stringify(notifications));
      this.updateUnreadCount();
    }
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead() {
    const notifications = this.getStoredNotifications();
    notifications.forEach(n => n.read = true);
    localStorage.setItem('notifications', JSON.stringify(notifications));
    this.updateUnreadCount();
  }

  /**
   * Get unread count
   */
  getUnreadCount(): number {
    const notifications = this.getStoredNotifications();
    return notifications.filter(n => !n.read).length;
  }

  /**
   * Update unread count in UI
   */
  private updateUnreadCount() {
    const count = this.getUnreadCount();
    // Dispatch custom event for UI updates
    window.dispatchEvent(new CustomEvent('notification-count-update', { 
      detail: { count } 
    }));
  }

  /**
   * Clear all notifications
   */
  clearAll() {
    localStorage.removeItem('notifications');
    this.updateUnreadCount();
  }

  /**
   * Schedule a notification for later
   */
  scheduleNotification(title: string, options: NotificationOptions & { delay: number }) {
    const { delay, ...notificationOptions } = options;
    
    setTimeout(() => {
      this.showNotification(title, notificationOptions);
    }, delay);
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
export default notificationService;