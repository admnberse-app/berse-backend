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

// ============================================================================
// MAIN PAGE TYPES
// ============================================================================

export interface MainPageResponse {
  userStats: UserStatsSummary;
  incompleteSession: IncompleteSessionInfo | null;
  topics: TopicWithProgress[];
  leaderboard: LeaderboardSummary;
  popularQuestions: PopularQuestionPreview[];
}

export interface UserStatsSummary {
  summary: {
    totalSessions: number;
    totalFeedback: number;
    totalReplies: number;
    upvotesReceived: number;
    averageRating: number;
    currentStreak: number;
    topicsCompleted: number;
  };
  timePeriods: {
    last7Days: StatsSnapshot;
    last30Days: StatsSnapshot;
    thisMonth: StatsSnapshot;
  };
}

export interface StatsSnapshot {
  totalSessions: number;
  totalFeedback: number;
  totalReplies: number;
  upvotesReceived: number;
  averageRating: number;
}

export interface IncompleteSessionInfo {
  id: string;
  topicId: string;
  topicTitle: string;
  sessionNumber: number;
  progress: {
    questionsAnswered: number;
    totalQuestions: number;
    percentage: number;
  };
  startedAt: Date;
}

export interface TopicWithProgress {
  id: string;
  title: string;
  description?: string;
  gradient?: string;
  totalSessions: number;
  totalQuestions: number;
  isActive: boolean;
  displayOrder: number;
  stats: {
    communitySessions: number;
    averageRating: number;
    totalFeedback: number;
  };
  userProgress: {
    sessionsCompleted: number;
    progressPercentage: number;
    nextSession: number | null;
    lastCompletedAt?: Date;
  };
  popularSession?: {
    sessionNumber: number;
    feedbackCount: number;
  };
}

export interface LeaderboardSummary {
  topUsers: LeaderboardEntry[];
  currentUser: LeaderboardEntry;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  fullName: string;
  profilePicture?: string;
  score: number;
  breakdown: {
    sessions?: number;
    feedback?: number;
    replies?: number;
    upvotes?: number;
    averageRating?: number;
  };
}

export interface PopularQuestionPreview {
  id: string;
  questionText: string;
  topicId: string;
  topicTitle: string;
  sessionNumber: number;
  questionOrder: number;
  stats: {
    totalFeedback: number;
    totalUpvotes: number;
    totalReplies: number;
    averageRating: number;
    engagementScore: number;
  };
  topComments: FeedbackPreview[];
}

export interface FeedbackPreview {
  id: string;
  comment: string;
  upvoteCount: number;
  user: {
    id: string;
    fullName: string;
    profilePicture?: string;
  };
}

// ============================================================================
// LEADERBOARD TYPES
// ============================================================================

export interface LeaderboardQuery {
  type?: 'overall' | 'most-sessions' | 'most-feedback' | 'most-replies' | 'most-upvotes' | 'highest-rating';
  timePeriod?: 'all-time' | 'monthly' | 'weekly';
  page?: number;
  limit?: number;
}

export interface LeaderboardResponse {
  type: string;
  timePeriod: string;
  topUsers: LeaderboardEntry[];
  currentUser: LeaderboardEntry;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ============================================================================
// POPULAR QUESTIONS TYPES
// ============================================================================

export interface PopularQuestionsQuery {
  page?: number;
  limit?: number;
  topicId?: string;
  sortBy?: 'engagement' | 'feedback' | 'upvotes' | 'replies' | 'rating';
  timePeriod?: 'all-time' | 'week' | 'month';
}

export interface PopularQuestionsResponse {
  data: PopularQuestionDetail[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface PopularQuestionDetail extends PopularQuestionPreview {
  hasMoreComments: boolean;
}

// ============================================================================
// TOPIC DETAIL TYPES
// ============================================================================

export interface TopicDetailResponse {
  topic: TopicInfo;
  userProgress: UserTopicProgress;
  sessions: SessionStatus[];
  communityStats: CommunityTopicStats;
  currentSessionDetail: SessionDetailResponse | null;
}

export interface TopicInfo {
  id: string;
  title: string;
  description?: string;
  gradient?: string;
  totalSessions: number;
  totalQuestions: number;
  isActive: boolean;
}

export interface UserTopicProgress {
  completedSessions: number;
  totalSessions: number;
  progressPercentage: number;
  nextSessionNumber: number | null;
  lastCompletedAt?: Date;
}

export interface SessionStatus {
  sessionNumber: number;
  status: 'completed' | 'in-progress' | 'locked';
  completedAt?: Date;
  startedAt?: Date;
  questionsCount: number;
  questionsAnswered?: number;
  totalQuestions?: number;
  yourAverageRating?: number;
}

export interface CommunityTopicStats {
  totalUsers: number;
  totalSessions: number;
  totalFeedback: number;
  averageRating: number;
}

export interface SessionDetailResponse {
  sessionNumber: number;
  status: string;
  completedAt: Date;
  yourStats: SessionUserStats;
  sessionCommunityStats: SessionCommunityStats;
  questions: QuestionWithResponses[];
}

export interface SessionUserStats {
  questionsAnswered: number;
  yourAverageRating: number;
  commentsGiven: number;
  upvotesReceived: number;
  repliesReceived: number;
}

export interface SessionCommunityStats {
  totalResponses: number;
  communityAverage: number;
  yourPercentile: number;
}

export interface QuestionWithResponses {
  id: string;
  questionOrder: number;
  questionText: string;
  isLocked: boolean;
  yourResponse?: {
    feedbackId: string;
    rating: number;
    comment?: string;
    upvotesReceived: number;
    repliesReceived: number;
    createdAt: Date;
    canEdit: boolean;
    canDelete: boolean;
  };
  stats: {
    totalFeedback: number;
    averageRating: number;
    totalUpvotes: number;
    totalReplies: number;
    ratingDistribution: {
      1: number;
      2: number;
      3: number;
      4: number;
      5: number;
    };
  };
  topCommunityResponses: CommunityResponse[];
  hasMoreResponses: boolean;
  totalResponses: number;
}

export interface CommunityResponse {
  feedbackId: string;
  userId: string;
  user: {
    fullName: string;
    profilePicture?: string;
  };
  rating: number;
  comment?: string;
  upvoteCount: number;
  hasUpvoted: boolean;
  replyCount: number;
  createdAt: Date;
}

// ============================================================================
// SESSION GAMEPLAY TYPES
// ============================================================================

export interface StartSessionResponse {
  session: SessionInfo;
  questions: QuestionInfo[];
  progress: ProgressInfo;
}

export interface SessionInfo {
  id: string;
  userId: string;
  topicId: string;
  topicTitle: string;
  sessionNumber: number;
  status: string;
  startedAt: Date;
  completedAt?: Date;
  totalQuestions: number;
  questionsAnswered: number;
  totalDuration?: number;
  totalDurationFormatted?: string;
}

export interface QuestionInfo {
  id: string;
  questionOrder: number;
  questionText: string;
  isActive: boolean;
  isAnswered?: boolean;
  yourAnswer?: {
    rating: number;
    comment?: string;
    submittedAt: Date;
  };
}

export interface ProgressInfo {
  canResume: boolean;
  lastAnsweredQuestion: number | null;
  percentage: number;
  nextQuestionOrder?: number;
  canContinue?: boolean;
}

export interface SubmitAnswerRequest {
  questionId: string;
  questionOrder: number;
  rating: number;
  comment?: string;
  isHelpful?: boolean;
  timing: TimingData;
}

export interface TimingData {
  questionViewedAt: string;
  answerStartedAt: string;
  answerSubmittedAt: string;
  timeSpentSeconds: number;
}

export interface SubmitAnswerResponse {
  feedback: FeedbackResponse;
  sessionProgress: SessionProgressInfo;
}

export interface SessionProgressInfo {
  sessionId: string;
  questionsAnswered: number;
  totalQuestions: number;
  percentage: number;
  nextQuestionOrder: number | null;
  canComplete: boolean;
}

export interface CompleteSessionRequest {
  totalDuration: number;
  deviceInfo?: {
    platform: 'mobile' | 'web';
    os: string;
    appVersion: string;
  };
}

export interface SessionSummaryResponse {
  summary: {
    session: SessionInfo;
    yourStats: UserSessionStats;
    questionBreakdown: QuestionBreakdownItem[];
    communityComparison: CommunityComparison;
    achievements: Achievement[];
    streaks: StreakInfo;
    nextSteps: NextStepsInfo;
    insights: PersonalizedInsight[];
  };
}

export interface UserSessionStats {
  questionsAnswered: number;
  averageRating: number;
  commentsGiven: number;
  averageTimePerQuestion: number;
  totalWords: number;
  longestResponse: number;
  helpfulQuestionsCount: number;
}

export interface QuestionBreakdownItem {
  questionOrder: number;
  questionText: string;
  yourRating: number;
  timeSpent: number;
  timeSpentFormatted: string;
  commentLength: number;
  hasComment: boolean;
}

export interface CommunityComparison {
  totalCompletions: number;
  yourRating: number;
  communityAverage: number;
  percentile: number;
  ratingDifference: number;
  comparison: 'above' | 'same' | 'slightly_above' | 'slightly_below' | 'below';
  engagementComparison: {
    yourComments: number;
    communityAverage: number;
    message: string;
  };
}

export interface Achievement {
  id: string;
  code: string;
  title: string;
  description: string;
  icon: string;
  isNew: boolean;
  unlockedAt?: Date;
}

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  streakMessage: string;
  lastActiveDate?: Date;
}

export interface NextStepsInfo {
  hasNextSession: boolean;
  nextSessionNumber?: number;
  nextSessionTitle?: string;
  canStartNextSession: boolean;
  unlocked: {
    communityInsights: boolean;
    message: string;
  };
}

export interface PersonalizedInsight {
  type: 'reflection_depth' | 'rating_pattern' | 'time_investment' | 'engagement_level';
  message: string;
}

// ============================================================================
// DETAILED STATS TYPES
// ============================================================================

export interface DetailedStatsQuery {
  timePeriod?: 'all-time' | 'last-7-days' | 'last-30-days' | 'this-month';
}

export interface DetailedStatsResponse {
  userId: string;
  timePeriod: string;
  summary: UserStatsSummary['summary'];
  sessionCompletionRate: {
    completed: number;
    started: number;
    rate: number;
  };
  ratingDistribution: {
    rating: number;
    count: number;
  }[];
  topTopics: {
    topicId: string;
    topicTitle: string;
    sessionsCompleted: number;
    averageRating: number;
    lastActivity: Date;
  }[];
  engagementTimeline: {
    date: string;
    sessions: number;
    feedback: number;
    replies: number;
  }[];
  achievements: Achievement[];
  streaks: StreakInfo;
  communityRankPercentile: number;
}
