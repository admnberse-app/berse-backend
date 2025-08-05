import { Notification, ApiResponse } from '../types';
import { authService } from './auth.service';
import { getApiBaseUrl } from '../config/services.config';

const API_BASE_URL = getApiBaseUrl();

class NotificationService {
  async getNotifications(): Promise<Notification[]> {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await fetch(`${API_BASE_URL}/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const data: ApiResponse<Notification[]> = await response.json();
      return data.success ? data.data : [];
    } catch (error) {
      console.error('Get notifications error:', error);
      return this.getMockNotifications();
    }
  }

  async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }

      const data: ApiResponse<boolean> = await response.json();
      return data.success;
    } catch (error) {
      console.error('Mark notification as read error:', error);
      return false;
    }
  }

  async markAllAsRead(): Promise<boolean> {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await fetch(`${API_BASE_URL}/notifications/read-all`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to mark all notifications as read');
      }

      const data: ApiResponse<boolean> = await response.json();
      return data.success;
    } catch (error) {
      console.error('Mark all notifications as read error:', error);
      return false;
    }
  }

  private getMockNotifications(): Notification[] {
    return [
      {
        id: '1',
        userId: '1',
        title: 'New Match Found!',
        message: 'You have a new potential connection waiting for you.',
        type: 'success',
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
      },
      {
        id: '2',
        userId: '1',
        title: 'Event Reminder',
        message: 'Your cafe meetup starts in 1 hour at Mesra Cafe KLCC.',
        type: 'info',
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      },
      {
        id: '3',
        userId: '1',
        title: 'Points Earned!',
        message: 'You earned 5 points for attending the coffee meetup.',
        type: 'success',
        isRead: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
      },
    ];
  }
}

export const notificationService = new NotificationService();
export default notificationService;