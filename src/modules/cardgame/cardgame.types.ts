// ============================================================================
// CARD GAME REQUEST TYPES
// ============================================================================

export interface SubmitFeedbackRequest {
  topicId: string;
  sessionNumber: number;
  questionId: string;
  rating: number; // 1-5
  comment?: string;
}

export interface UpdateFeedbackRequest {
  rating?: number;
  comment?: string;
}

export interface AddReplyRequest {
  text: string;
}

export interface FeedbackFilters {
  topicId?: string;
  userId?: string;
  sessionNumber?: number;
  questionId?: string;
  minRating?: number;
  maxRating?: number;
  hasComments?: boolean;
  startDate?: string | Date;
  endDate?: string | Date;
}

export interface FeedbackQuery {
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'rating' | 'upvotes';
  sortOrder?: 'asc' | 'desc';
  filters?: FeedbackFilters;
}

// ============================================================================
// RESPONSE TYPES
// ============================================================================

export interface FeedbackResponse {
  id: string;
  userId: string;
  topicId: string;
  sessionNumber: number;
  questionId: string;
  rating: number;
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations (optional)
  user?: {
    id: string;
    fullName: string;
    profile?: {
      profilePicture?: string;
    };
  };
  upvoteCount?: number;
  hasUpvoted?: boolean;
  replies?: ReplyResponse[];
  _count?: {
    cardGameUpvotes: number;
    cardGameReplies: number;
  };
}

export interface ReplyResponse {
  id: string;
  userId: string;
  feedbackId: string;
  text: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations (optional)
  user?: {
    id: string;
    fullName: string;
    profile?: {
      profilePicture?: string;
    };
  };
}

export interface StatsResponse {
  id: string;
  topicId: string;
  totalSessions: number;
  averageRating: number;
  totalFeedback: number;
  createdAt: Date;
  updatedAt: Date;
  
  // Computed fields
  ratingDistribution?: {
    rating: number;
    count: number;
  }[];
  sessionProgress?: number;
}

export interface TopicAnalyticsResponse {
  topicId: string;
  totalSessions: number;
  uniqueUsers: number;
  totalFeedback: number;
  averageRating: number;
  completionRate: number;
  topQuestions: {
    questionId: string;
    averageRating: number;
    feedbackCount: number;
  }[];
  ratingTrend: {
    date: string;
    averageRating: number;
    feedbackCount: number;
  }[];
}

export interface UserStatsResponse {
  userId: string;
  totalSessions: number;
  totalFeedback: number;
  averageRating: number;
  topicsCompleted: number;
  repliesGiven: number;
  upvotesReceived: number;
  topTopics: {
    topicId: string;
    feedbackCount: number;
    averageRating: number;
  }[];
}

// ============================================================================
// PAGINATION RESPONSE
// ============================================================================

export interface PaginatedFeedbackResponse {
  data: FeedbackResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
