import { apiClient } from '../utils/api-client';

export interface Notification {
  id: string;
  type: 'EVENT' | 'MATCH' | 'POINTS' | 'MESSAGE' | 'SYSTEM';
  title: string;
  message: string;
  isRead: boolean;
  actionUrl?: string;
  metadata?: any;
  createdAt: string;
}

export interface NotificationResponse {
  notifications: Notification[];
  total: number;
  unreadCount: number;
  hasMore: boolean;
}

class NotificationService {
  async getNotifications(limit = 20, offset = 0): Promise<NotificationResponse> {
    const response = await apiClient.get('/notifications', {
      params: { limit, offset },
    });
    return response.data.data;
  }

  async getUnreadCount(): Promise<{ unreadCount: number }> {
    const response = await apiClient.get('/notifications/unread-count');
    return response.data.data;
  }

  async markAsRead(notificationId: string): Promise<void> {
    await apiClient.patch(`/notifications/${notificationId}/read`);
  }

  async markAllAsRead(): Promise<void> {
    await apiClient.patch('/notifications/read-all');
  }

  async deleteNotification(notificationId: string): Promise<void> {
    await apiClient.delete(`/notifications/${notificationId}`);
  }

  async deleteAllNotifications(): Promise<void> {
    await apiClient.delete('/notifications');
  }
}

export default new NotificationService();