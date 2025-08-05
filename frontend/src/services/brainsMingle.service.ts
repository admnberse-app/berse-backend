// BrainsMingle API Integration Service

// BrainsMingle API Types
export interface BrainsMingleSession {
  id: string;
  title: string;
  type: 'mentor-matching' | 'industry-networking' | 'diaspora-connect' | 'study-group' | 'exam-prep' | 'project-collab' | 'language-exchange';
  industry?: string;
  subject?: string;
  level?: string;
  country: string;
  location: string;
  date: string;
  time: string;
  participants: number;
  maxParticipants: number;
  description?: string;
  requirements?: string[];
  facilitator?: {
    name: string;
    avatar: string;
    rating: number;
  };
  tags?: string[];
}

export interface BrainsMingleProfile {
  id: string;
  name: string;
  email: string;
  type: 'mentor' | 'student' | 'professional';
  verified: boolean;
  connectedServices: {
    talentCorp?: boolean;
    emgs?: boolean;
  };
}

export interface SessionFilter {
  type?: string[];
  country?: string[];
  level?: string[];
  industry?: string[];
  subject?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface JoinSessionResponse {
  success: boolean;
  sessionUrl?: string;
  message: string;
  requiresRegistration?: boolean;
}

class BrainsMingleService {
  private baseUrl: string;
  private apiKey: string;
  private retryAttempts: number = 3;
  private retryDelay: number = 1000;

  constructor() {
    this.baseUrl = process.env.REACT_APP_BRAINSMINGLE_API_URL || 'https://api.brainsmingle.com/v1';
    this.apiKey = process.env.REACT_APP_BRAINSMINGLE_API_KEY || 'demo-key';
  }

  /**
   * Fetch networking sessions for mentorship
   */
  async getMentoringSessions(filters?: SessionFilter): Promise<BrainsMingleSession[]> {
    try {
      const mentoringSessions: BrainsMingleSession[] = [
        {
          id: 'bm-mentor-001',
          title: 'Tech Leadership Mentorship Circle',
          type: 'mentor-matching',
          industry: 'Technology',
          country: 'Malaysia',
          location: 'Kuala Lumpur',
          date: '2025-01-15',
          time: '7:00 PM MYT',
          participants: 18,
          maxParticipants: 25,
          description: 'Connect with experienced tech leaders for career guidance',
          facilitator: {
            name: 'Dr. Ahmad Hassan',
            avatar: 'AH',
            rating: 4.9
          },
          tags: ['leadership', 'career-growth', 'technology']
        },
        {
          id: 'bm-mentor-002',
          title: 'Malaysian Diaspora Silicon Valley Connect',
          type: 'diaspora-connect',
          industry: 'Technology',
          country: 'USA',
          location: 'Online',
          date: '2025-01-16',
          time: '8:00 AM PST',
          participants: 24,
          maxParticipants: 30,
          description: 'Network with Malaysian professionals in Silicon Valley',
          facilitator: {
            name: 'Sarah Lim',
            avatar: 'SL',
            rating: 4.8
          },
          tags: ['diaspora', 'networking', 'silicon-valley']
        },
        {
          id: 'bm-mentor-003',
          title: 'Finance Industry Mentorship Network',
          type: 'industry-networking',
          industry: 'Finance',
          country: 'Singapore',
          location: 'Singapore',
          date: '2025-01-17',
          time: '6:30 PM SGT',
          participants: 15,
          maxParticipants: 20,
          description: 'Connect with finance professionals across ASEAN',
          facilitator: {
            name: 'Raj Patel',
            avatar: 'RP',
            rating: 4.7
          },
          tags: ['finance', 'asean', 'networking']
        }
      ];

      return this.applyFilters(mentoringSessions, filters);
    } catch (error) {
      console.error('Error fetching mentoring sessions:', error);
      throw new Error('Failed to fetch mentoring sessions');
    }
  }

  /**
   * Fetch study sessions for students
   */
  async getStudySessions(filters?: SessionFilter): Promise<BrainsMingleSession[]> {
    try {
      const studySessions: BrainsMingleSession[] = [
        {
          id: 'bm-study-001',
          title: 'Engineering Mathematics Study Circle',
          type: 'study-group',
          subject: 'Mathematics',
          level: 'Bachelor',
          country: 'Malaysia',
          location: 'University Malaya',
          date: '2025-01-15',
          time: '2:00 PM MYT',
          participants: 8,
          maxParticipants: 12,
          description: 'Collaborative study session for engineering mathematics',
          requirements: ['Engineering student', 'Mathematics textbook'],
          facilitator: {
            name: 'Prof. Lee Wei Ming',
            avatar: 'LW',
            rating: 4.9
          },
          tags: ['mathematics', 'engineering', 'study-group']
        },
        {
          id: 'bm-study-002',
          title: 'IELTS Speaking Practice Virtual Session',
          type: 'language-exchange',
          subject: 'English',
          level: 'All Levels',
          country: 'Global',
          location: 'Online',
          date: '2025-01-16',
          time: '7:00 PM MYT',
          participants: 15,
          maxParticipants: 20,
          description: 'Practice IELTS speaking with native speakers and other learners',
          requirements: ['Microphone and camera', 'IELTS preparation materials'],
          facilitator: {
            name: 'Emma Thompson',
            avatar: 'ET',
            rating: 4.8
          },
          tags: ['ielts', 'english', 'speaking-practice']
        },
        {
          id: 'bm-study-003',
          title: 'Computer Science Final Exam Prep',
          type: 'exam-prep',
          subject: 'Computer Science',
          level: 'Bachelor',
          country: 'Malaysia',
          location: "Taylor's University",
          date: '2025-01-17',
          time: '10:00 AM MYT',
          participants: 12,
          maxParticipants: 15,
          description: 'Intensive exam preparation for CS final exams',
          requirements: ['CS student', 'Course materials', 'Past year papers'],
          facilitator: {
            name: 'Dr. Priya Sharma',
            avatar: 'PS',
            rating: 4.9
          },
          tags: ['computer-science', 'exam-prep', 'finals']
        },
        {
          id: 'bm-study-004',
          title: 'Mobile App Development Project Collaboration',
          type: 'project-collab',
          subject: 'Programming',
          level: 'Bachelor',
          country: 'Malaysia',
          location: 'Online',
          date: '2025-01-18',
          time: '3:00 PM MYT',
          participants: 6,
          maxParticipants: 8,
          description: 'Collaborative mobile app development project session',
          requirements: ['Programming experience', 'Development environment setup'],
          facilitator: {
            name: 'Ahmad Zulkifli',
            avatar: 'AZ',
            rating: 4.7
          },
          tags: ['mobile-development', 'programming', 'project']
        }
      ];

      return this.applyFilters(studySessions, filters);
    } catch (error) {
      console.error('Error fetching study sessions:', error);
      throw new Error('Failed to fetch study sessions');
    }
  }

  /**
   * Join a BrainsMingle session
   */
  async joinSession(sessionId: string, userProfile: BrainsMingleProfile): Promise<JoinSessionResponse> {
    try {
      // Simulate API call with retry logic
      const result = await this.retryApiCall(async () => {
        // In a real implementation, this would make an HTTP request
        const sessionUrl = `https://brainsmingle.com/session/${sessionId}?source=bersemuka&user=${userProfile.id}`;
        
        // Simulate different response scenarios
        if (sessionId.includes('private') && !userProfile.verified) {
          return {
            success: false,
            message: 'This session requires verification. Please complete your profile verification.',
            requiresRegistration: true
          };
        }

        if (sessionId.includes('full')) {
          return {
            success: false,
            message: 'This session is currently full. You have been added to the waitlist.'
          };
        }

        return {
          success: true,
          sessionUrl,
          message: 'Successfully joined the session!'
        };
      });

      // If successful, open the session in a new window
      if (result.success && result.sessionUrl) {
        window.open(result.sessionUrl, '_blank', 'noopener,noreferrer');
      }

      return result;
    } catch (error) {
      console.error('Error joining session:', error);
      return {
        success: false,
        message: 'Failed to join session. Please try again later.'
      };
    }
  }

  /**
   * Create a new BrainsMingle session
   */
  async createSession(_sessionData: Partial<BrainsMingleSession>): Promise<{ success: boolean; sessionId?: string; message: string }> {
    try {
      // Simulate session creation
      const sessionId = `bm-custom-${Date.now()}`;
      
      return {
        success: true,
        sessionId,
        message: 'Session created successfully!'
      };
    } catch (error) {
      console.error('Error creating session:', error);
      return {
        success: false,
        message: 'Failed to create session. Please try again later.'
      };
    }
  }

  /**
   * Get session details by ID
   */
  async getSessionDetails(sessionId: string): Promise<BrainsMingleSession | null> {
    try {
      // Simulate fetching session details
      const allSessions = [
        ...(await this.getMentoringSessions()),
        ...(await this.getStudySessions())
      ];

      return allSessions.find(session => session.id === sessionId) || null;
    } catch (error) {
      console.error('Error fetching session details:', error);
      return null;
    }
  }

  /**
   * Register user with BrainsMingle
   */
  async registerUser(_profile: Omit<BrainsMingleProfile, 'id'>): Promise<{ success: boolean; userId?: string; message: string }> {
    try {
      const userId = `bm-user-${Date.now()}`;
      
      return {
        success: true,
        userId,
        message: 'Successfully registered with BrainsMingle!'
      };
    } catch (error) {
      console.error('Error registering user:', error);
      return {
        success: false,
        message: 'Failed to register. Please try again later.'
      };
    }
  }

  /**
   * Update user profile in BrainsMingle
   */
  async updateProfile(_userId: string, _updates: Partial<BrainsMingleProfile>): Promise<{ success: boolean; message: string }> {
    try {
      // Simulate profile update
      return {
        success: true,
        message: 'Profile updated successfully!'
      };
    } catch (error) {
      console.error('Error updating profile:', error);
      return {
        success: false,
        message: 'Failed to update profile. Please try again later.'
      };
    }
  }

  /**
   * Apply filters to sessions list
   */
  private applyFilters(sessions: BrainsMingleSession[], filters?: SessionFilter): BrainsMingleSession[] {
    if (!filters) return sessions;

    return sessions.filter(session => {
      if (filters.type && !filters.type.includes(session.type)) return false;
      if (filters.country && !filters.country.includes(session.country)) return false;
      if (filters.level && session.level && !filters.level.includes(session.level)) return false;
      if (filters.industry && session.industry && !filters.industry.includes(session.industry)) return false;
      if (filters.subject && session.subject && !filters.subject.includes(session.subject)) return false;
      
      if (filters.dateRange) {
        const sessionDate = new Date(session.date);
        const startDate = new Date(filters.dateRange.start);
        const endDate = new Date(filters.dateRange.end);
        if (sessionDate < startDate || sessionDate > endDate) return false;
      }

      return true;
    });
  }

  /**
   * Retry API calls with exponential backoff
   */
  private async retryApiCall<T>(apiCall: () => Promise<T>): Promise<T> {
    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        return await apiCall();
      } catch (error) {
        if (attempt === this.retryAttempts) {
          throw error;
        }
        
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * Math.pow(2, attempt - 1)));
      }
    }
    
    throw new Error('All retry attempts failed');
  }

  /**
   * Health check for BrainsMingle service
   */
  async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; latency?: number }> {
    const startTime = Date.now();
    
    try {
      // Simulate health check
      await new Promise(resolve => setTimeout(resolve, 100));
      const latency = Date.now() - startTime;
      
      return {
        status: 'healthy',
        latency
      };
    } catch (error) {
      return {
        status: 'unhealthy'
      };
    }
  }
}

// Export singleton instance
export const brainsMingleService = new BrainsMingleService();
export default brainsMingleService;