// ============================================================================
// CARD GAME REQUEST TYPES
// ============================================================================

// Topic Types
export interface CreateTopicRequest {
  id: string; // e.g., "slowdown", "mindfulness", etc.
  title: string;
  description?: string;
  gradient?: string;
  totalSessions: number;
  displayOrder?: number;
}

export interface UpdateTopicRequest {
  title?: string;
  description?: string;
  gradient?: string;
  totalSessions?: number;
  isActive?: boolean;
  displayOrder?: number;
}

// Question Types
export interface CreateQuestionRequest {
  topicId: string;
  sessionNumber: number;
  questionOrder: number;
  questionText: string;
}

export interface UpdateQuestionRequest {
  questionText?: string;
  isActive?: boolean;
}

// Session Types
export interface StartSessionRequest {
  topicId: string;
  sessionNumber: number;
  totalQuestions: number;
}

export interface CompleteSessionRequest {
  averageRating?: number;
}

// Feedback Types (updated)
export interface SubmitFeedbackRequest {
  topicId: string;
  topicTitle?: string; // Auto-filled from topic
  sessionNumber: number;
  questionId: string;
  questionText?: string; // Auto-filled from question
  rating: number; // 1-5
  comment?: string;
  isHelpful?: boolean;
}

export interface UpdateFeedbackRequest {
  rating?: number;
  comment?: string;
  isHelpful?: boolean;
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
  includeNested?: boolean; // Whether to include nested replies (default: true)
}

// ============================================================================
// RESPONSE TYPES
// ============================================================================

// Topic Response Types
export interface TopicResponse {
  id: string;
  title: string;
  description?: string;
  gradient?: string;
  totalSessions: number;
  isActive: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
  
  // Optional computed fields
  stats?: {
    totalSessions: number;
    averageRating: number;
    totalFeedback: number;
    uniqueUsers?: number;
  };
  userProgress?: {
    sessionsCompleted: number;
    lastSessionDate?: Date;
    canContinue: boolean;
    nextSessionNumber?: number;
  };
}

// Question Response Types
export interface QuestionResponse {
  id: string;
  topicId: string;
  sessionNumber: number;
  questionOrder: number;
  questionText: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SessionQuestionsResponse {
  topicId: string;
  topicTitle: string;
  sessionNumber: number;
  totalQuestions: number;
  questions: QuestionResponse[];
}

// Session Response Types
export interface SessionResponse {
  id: string;
  userId: string;
  topicId: string;
  sessionNumber: number;
  startedAt: Date;
  completedAt?: Date;
  totalQuestions: number;
  questionsAnswered: number;
  averageRating?: number;
  
  // Optional relations
  topic?: TopicResponse;
  progress?: {
    percentage: number;
    isComplete: boolean;
    canResume: boolean;
  };
}

export interface SessionSummaryResponse {
  session: SessionResponse;
  feedback: FeedbackResponse[];
  stats: {
    totalQuestions: number;
    questionsAnswered: number;
    averageRating: number;
    commentsCount: number;
  };
  communityComparison?: {
    yourRating: number;
    communityAverage: number;
    percentile: number;
  };
}

// Feedback Response Types (updated)

// Feedback Response Types (updated)
export interface FeedbackResponse {
  id: string;
  userId: string;
  topicId: string;
  topicTitle?: string; // NEW
  sessionNumber: number;
  questionId: string;
  questionText?: string; // NEW
  rating: number;
  comment?: string;
  isHelpful?: boolean; // NEW
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
  parentReplyId?: string | null;
  text: string;
  upvoteCount?: number;
  hasUpvoted?: boolean;
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
  childReplies?: ReplyResponse[]; // Nested replies
  _count?: {
    childReplies: number;
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
  meta?: {
    questionId?: string;
    questionText?: string;
    topicId?: string;
    topicTitle?: string;
    sessionNumber?: number;
  };
}
