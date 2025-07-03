import { apiClient } from '../utils/api-client';

export interface Match {
  id: string;
  type: 'SPORTS' | 'SOCIAL' | 'VOLUNTEER' | 'STUDY' | 'PROFESSIONAL' | 'HOBBY';
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
  compatibility: number;
  reason: string;
  interests: string[];
  availability?: any;
  location?: string;
  message?: string;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  otherUser: {
    id: string;
    fullName: string;
    profilePicture?: string;
    city?: string;
    interests: string[];
  };
  isReceived: boolean;
}

export interface MatchCandidate {
  id: string;
  fullName: string;
  profilePicture?: string;
  city?: string;
  interests: string[];
  compatibilityScore: number;
  commonInterests: string[];
  matchReason: string;
}

export interface MatchRequest {
  receiverId: string;
  type: Match['type'];
  message?: string;
}

class MatchService {
  async findMatches(type: Match['type'], preferences?: any): Promise<MatchCandidate[]> {
    const response = await apiClient.post('/matches/find', { type, preferences });
    return response.data.data;
  }

  async getMatches(status?: Match['status']): Promise<Match[]> {
    const response = await apiClient.get('/matches', {
      params: status ? { status } : undefined,
    });
    return response.data.data;
  }

  async getMatchDetails(matchId: string): Promise<Match> {
    const response = await apiClient.get(`/matches/${matchId}`);
    return response.data.data;
  }

  async getRecommendations(type: Match['type']): Promise<Match[]> {
    const response = await apiClient.get('/matches/recommendations', {
      params: { type },
    });
    return response.data.data;
  }

  async createMatch(data: MatchRequest): Promise<Match> {
    const response = await apiClient.post('/matches', data);
    return response.data.data;
  }

  async respondToMatch(matchId: string, accept: boolean): Promise<Match> {
    const response = await apiClient.patch(`/matches/${matchId}/respond`, { accept });
    return response.data.data;
  }
}

export default new MatchService();