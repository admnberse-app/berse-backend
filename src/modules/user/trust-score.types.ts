// ============================================================================
// TRUST SCORE TYPES
// ============================================================================

export interface TrustScoreDetail {
  userId: string;
  currentScore: number;
  trustLevel: string;
  scoreChange?: ScoreChange;
  lastCalculatedAt: Date;
  breakdown: TrustScoreBreakdown;
  nextLevel: NextLevelInfo;
  scoreHistory?: ScoreHistoryItem[];
}

export interface ScoreChange {
  points: number;
  percentage: number;
  period: string; // '30_days', '7_days', etc.
}

export interface TrustScoreBreakdown {
  vouches: VouchesComponent;
  activity: ActivityComponent;
  trustMoments: TrustMomentsComponent;
}

// ============================================================================
// VOUCHES COMPONENT
// ============================================================================

export interface VouchesComponent {
  score: number;
  maxScore: number;
  percentage: number;
  components: {
    primary: VouchTypeDetail;
    secondary: VouchTypeDetail;
    community: VouchTypeDetail;
  };
}

export interface VouchTypeDetail {
  score: number;
  maxScore: number;
  count: number;
  maxCount: number;
  vouches: VouchSummary[];
}

export interface VouchSummary {
  id: string;
  voucherId: string;
  voucherName: string;
  voucherUsername?: string;
  voucherProfilePicture?: string;
  voucherTrustScore: number;
  voucherTrustLevel: string;
  vouchType: string;
  message?: string;
  relationship?: string;
  vouchedAt: Date;
  communityId?: string;
  communityName?: string;
}

// ============================================================================
// ACTIVITY COMPONENT
// ============================================================================

export interface ActivityComponent {
  score: number;
  maxScore: number;
  percentage: number;
  components: {
    eventsAttended: ActivityDetail;
    eventsHosted: ActivityDetail;
    communitiesJoined: ActivityDetail;
    servicesProvided: ActivityDetail;
  };
}

export interface ActivityDetail {
  score: number;
  maxScore: number;
  count: number;
  targetCount: number;
}

// ============================================================================
// TRUST MOMENTS COMPONENT
// ============================================================================

export interface TrustMomentsComponent {
  score: number;
  maxScore: number;
  percentage: number;
  statistics: TrustMomentsStatistics;
}

export interface TrustMomentsStatistics {
  totalMoments: number;
  averageRating: number;
  ratingScore: number;
  quantityBonus: number;
  distribution: RatingDistribution;
  sentiment: SentimentBreakdown;
  byMomentType: Record<string, number>;
  topTags: TagCount[];
}

export interface RatingDistribution {
  fiveStar: number;
  fourStar: number;
  threeStar: number;
  twoStar: number;
  oneStar: number;
}

export interface SentimentBreakdown {
  positive: number;
  positivePercentage: number;
  neutral: number;
  neutralPercentage: number;
  negative: number;
  negativePercentage: number;
}

export interface TagCount {
  tag: string;
  count: number;
}

// ============================================================================
// NEXT LEVEL INFO
// ============================================================================

export interface NextLevelInfo {
  current: string;
  next: string | null;
  currentThreshold: number;
  nextThreshold: number | null;
  pointsNeeded: number;
  progress: number; // percentage
  suggestions: string[];
}

// ============================================================================
// SCORE HISTORY
// ============================================================================

export interface ScoreHistoryItem {
  timestamp: Date;
  score: number;
  change: number;
  previousScore?: number;
  reason?: string;
  component?: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
}

export interface TrustScoreHistory {
  userId: string;
  history: ScoreHistoryItem[];
  summary: HistorySummary;
}

export interface HistorySummary {
  startScore: number;
  endScore: number;
  totalChange: number;
  highestScore: number;
  lowestScore: number;
  averageScore: number;
  periodDays: number;
}

// ============================================================================
// SUGGESTIONS
// ============================================================================

export interface TrustScoreSuggestions {
  currentScore: number;
  currentLevel: string;
  nextLevel: string | null;
  pointsToNextLevel: number;
  suggestions: Suggestion[];
  quickWins: QuickWin[];
}

export interface Suggestion {
  category: 'vouches' | 'activity' | 'trustMoments';
  action: string;
  title: string;
  description: string;
  potentialPoints: number;
  priority: 'high' | 'medium' | 'low';
  actionUrl?: string;
}

export interface QuickWin {
  title: string;
  points?: number;
  benefit?: string;
  effort: 'low' | 'medium' | 'high';
}

// ============================================================================
// RECENT UPDATES
// ============================================================================

export interface RecentUpdate {
  id: string;
  timestamp: Date;
  type: string;
  description: string;
  impact: UpdateImpact;
  relatedEntity?: RelatedEntity;
}

export interface UpdateImpact {
  points: number;
  component: 'vouches' | 'activity' | 'trustMoments';
}

export interface RelatedEntity {
  type: string;
  id: string;
  title?: string;
  rating?: number;
  giver?: {
    id: string;
    fullName: string;
    username?: string;
    profilePicture?: string;
  };
}

// ============================================================================
// QUERY TYPES
// ============================================================================

export interface TrustScoreQuery {
  includeBreakdown?: boolean;
  includeHistory?: boolean;
  historyDays?: number;
}
