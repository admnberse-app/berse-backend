import axios from 'axios';
import { API_BASE_URL } from '../config/services.config';

interface FeedbackData {
  topicId: string;
  sessionNumber: number;
  questionId: string;
  rating: number;
  comment?: string;
}

interface FeedbackResponse {
  id: string;
  userId: string;
  topicId: string;
  sessionNumber: number;
  questionId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    fullName: string;
    profilePicture: string | null;
  };
  upvotes?: { userId: string }[];
  upvoteCount?: number;
  hasUpvoted?: boolean;
  replies?: ReplyResponse[];
}

interface ReplyResponse {
  id: string;
  userId: string;
  feedbackId: string;
  text: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    fullName: string;
    profilePicture: string | null;
  };
}

class CardGameService {
  private getAuthHeader() {
    const token = localStorage.getItem('bersemuka_token') || localStorage.getItem('auth_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async submitFeedback(feedback: FeedbackData): Promise<FeedbackResponse> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/cardgame/feedback`,
        feedback,
        { headers: this.getAuthHeader() }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error submitting feedback:', error);
      throw error;
    }
  }

  async getUserFeedback(): Promise<FeedbackResponse[]> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/v1/cardgame/feedback`,
        { headers: this.getAuthHeader() }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching user feedback:', error);
      throw error;
    }
  }

  async getTopicFeedback(topicId: string): Promise<FeedbackResponse[]> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/v1/cardgame/feedback/topic/${topicId}`,
        { headers: this.getAuthHeader() }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching topic feedback:', error);
      throw error;
    }
  }

  async getAllTopicFeedback(topicId: string): Promise<FeedbackResponse[]> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/v1/cardgame/feedback/all/${topicId}`,
        { headers: this.getAuthHeader() }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching all topic feedback:', error);
      return [];
    }
  }

  async toggleUpvote(feedbackId: string): Promise<{ hasUpvoted: boolean }> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/cardgame/feedback/${feedbackId}/upvote`,
        {},
        { headers: this.getAuthHeader() }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error toggling upvote:', error);
      throw error;
    }
  }

  async addReply(feedbackId: string, text: string): Promise<ReplyResponse> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/cardgame/feedback/${feedbackId}/reply`,
        { text },
        { headers: this.getAuthHeader() }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error adding reply:', error);
      throw error;
    }
  }

  async getTopicStats(): Promise<any[]> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/v1/cardgame/stats`,
        { headers: this.getAuthHeader() }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching topic stats:', error);
      throw error;
    }
  }

  async deleteFeedback(feedbackId: string): Promise<void> {
    try {
      await axios.delete(
        `${API_BASE_URL}/api/v1/cardgame/feedback/${feedbackId}`,
        { headers: this.getAuthHeader() }
      );
    } catch (error) {
      console.error('Error deleting feedback:', error);
      throw error;
    }
  }
}

export const cardGameService = new CardGameService();