-- Optimize Database Indexes for BerseMuka

-- User-related indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON "User" (email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON "User" (phone) WHERE phone IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_created_at ON "User" ("createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_users_role ON "User" (role);
CREATE INDEX IF NOT EXISTS idx_users_city ON "User" (city) WHERE city IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_is_host ON "User" ("isHostCertified") WHERE "isHostCertified" = true;
CREATE INDEX IF NOT EXISTS idx_users_total_points ON "User" ("totalPoints" DESC);

-- Event-related indexes
CREATE INDEX IF NOT EXISTS idx_events_date ON "Event" (date);
CREATE INDEX IF NOT EXISTS idx_events_type ON "Event" (type);
CREATE INDEX IF NOT EXISTS idx_events_location ON "Event" (location);
CREATE INDEX IF NOT EXISTS idx_events_city ON "Event" (city);
CREATE INDEX IF NOT EXISTS idx_events_status ON "Event" (status);
CREATE INDEX IF NOT EXISTS idx_events_created_by ON "Event" ("createdById");
CREATE INDEX IF NOT EXISTS idx_events_upcoming ON "Event" (date) WHERE date > NOW() AND status = 'ACTIVE';
CREATE INDEX IF NOT EXISTS idx_events_popular ON "Event" ("participantCount" DESC) WHERE status = 'ACTIVE';

-- Event participants composite index
CREATE INDEX IF NOT EXISTS idx_event_participants ON "EventParticipant" ("eventId", "userId");
CREATE INDEX IF NOT EXISTS idx_participant_events ON "EventParticipant" ("userId", "eventId");
CREATE INDEX IF NOT EXISTS idx_participant_status ON "EventParticipant" (status) WHERE status = 'CONFIRMED';

-- Transaction indexes
CREATE INDEX IF NOT EXISTS idx_transactions_user ON "Transaction" ("userId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_event ON "Transaction" ("eventId") WHERE "eventId" IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_transactions_status ON "Transaction" (status, "createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON "Transaction" (type);

-- Points history indexes
CREATE INDEX IF NOT EXISTS idx_points_user ON "PointsHistory" ("userId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_points_type ON "PointsHistory" (type);

-- Notification indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user ON "Notification" ("userId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON "Notification" ("userId", "isRead") WHERE "isRead" = false;
CREATE INDEX IF NOT EXISTS idx_notifications_type ON "Notification" (type);

-- Match indexes
CREATE INDEX IF NOT EXISTS idx_matches_users ON "Match" ("userId1", "userId2");
CREATE INDEX IF NOT EXISTS idx_matches_status ON "Match" (status) WHERE status = 'PENDING';
CREATE INDEX IF NOT EXISTS idx_matches_created ON "Match" ("createdAt" DESC);

-- Badge user indexes
CREATE INDEX IF NOT EXISTS idx_badge_users ON "BadgeUser" ("userId", "badgeId");
CREATE INDEX IF NOT EXISTS idx_badge_earned ON "BadgeUser" ("earnedAt" DESC);

-- Friendship indexes
CREATE INDEX IF NOT EXISTS idx_friendships ON "Friendship" ("userId", "friendId");
CREATE INDEX IF NOT EXISTS idx_friendships_status ON "Friendship" (status) WHERE status = 'ACCEPTED';

-- Full-text search indexes
CREATE INDEX IF NOT EXISTS idx_users_search ON "User" USING gin(to_tsvector('english', "fullName" || ' ' || COALESCE(bio, '')));
CREATE INDEX IF NOT EXISTS idx_events_search ON "Event" USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '')));

-- Performance monitoring
CREATE INDEX IF NOT EXISTS idx_api_logs_endpoint ON api_logs (endpoint, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_logs_user ON api_logs (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_logs_response_time ON api_logs (response_time_ms) WHERE response_time_ms > 1000;

-- Add table partitioning for large tables (if needed)
-- Example for notifications table partitioned by month
/*
CREATE TABLE IF NOT EXISTS "Notification_2024_01" PARTITION OF "Notification"
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
    
CREATE TABLE IF NOT EXISTS "Notification_2024_02" PARTITION OF "Notification"
    FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');
*/

-- Analyze tables for query optimization
ANALYZE "User";
ANALYZE "Event";
ANALYZE "EventParticipant";
ANALYZE "Transaction";
ANALYZE "Notification";
ANALYZE "Match";

-- Update statistics
SELECT pg_stat_reset();

-- Create materialized view for event statistics
CREATE MATERIALIZED VIEW IF NOT EXISTS event_statistics AS
SELECT 
    e.id,
    e.title,
    e.type,
    e.city,
    COUNT(DISTINCT ep."userId") as participant_count,
    AVG(CASE WHEN ep.rating IS NOT NULL THEN ep.rating ELSE NULL END) as avg_rating,
    COUNT(DISTINCT CASE WHEN ep.status = 'CONFIRMED' THEN ep."userId" END) as confirmed_count,
    SUM(CASE WHEN t.status = 'SUCCESS' THEN t.amount ELSE 0 END) as total_revenue
FROM "Event" e
LEFT JOIN "EventParticipant" ep ON e.id = ep."eventId"
LEFT JOIN "Transaction" t ON e.id = t."eventId"
GROUP BY e.id, e.title, e.type, e.city;

-- Create index on materialized view
CREATE INDEX IF NOT EXISTS idx_event_stats_type ON event_statistics (type);
CREATE INDEX IF NOT EXISTS idx_event_stats_city ON event_statistics (city);
CREATE INDEX IF NOT EXISTS idx_event_stats_participants ON event_statistics (participant_count DESC);

-- Refresh materialized view (schedule this to run periodically)
REFRESH MATERIALIZED VIEW CONCURRENTLY event_statistics;