// Trust Moments types - Event-specific feedback

export interface CreateTrustMomentInput {
  connectionId: string;
  receiverId: string;
  eventId?: string;
  momentType: string; // 'event', 'travel', 'collaboration', 'general'
  rating: number; // 1-5
  feedback?: string;
  experienceDescription?: string;
  tags?: string[];
  isPublic?: boolean;
}

export interface UpdateTrustMomentInput {
  momentId: string;
  rating?: number;
  feedback?: string;
  experienceDescription?: string;
  tags?: string[];
  isPublic?: boolean;
}

export interface TrustMomentQuery {
  page?: number;
  limit?: number;
  momentType?: string;
  eventId?: string;
  minRating?: number;
  maxRating?: number;
  isPublic?: boolean;
  sortBy?: 'createdAt' | 'rating';
  sortOrder?: 'asc' | 'desc';
}

// TODO: Implement full trust moments service
// Features to implement:
// - Create trust moment (feedback after event/experience)
// - Update trust moment
// - Delete trust moment
// - Get trust moments received by user
// - Get trust moments given by user
// - Get trust moments for a specific event
// - Calculate trust moment statistics
// - Trigger trust score update when trust moment is created/updated
