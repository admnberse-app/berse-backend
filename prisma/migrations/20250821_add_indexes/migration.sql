-- Add indexes to speed up queries

-- Index for faster event queries by date
CREATE INDEX IF NOT EXISTS "Event_date_idx" ON "Event"("date");

-- Index for faster event queries by hostId
CREATE INDEX IF NOT EXISTS "Event_hostId_idx" ON "Event"("hostId");

-- Index for faster user queries by email
CREATE INDEX IF NOT EXISTS "User_email_idx" ON "User"("email");

-- Index for faster user queries by createdAt
CREATE INDEX IF NOT EXISTS "User_createdAt_idx" ON "User"("createdAt");

-- Index for faster RSVP queries
CREATE INDEX IF NOT EXISTS "EventRSVP_userId_idx" ON "EventRSVP"("userId");
CREATE INDEX IF NOT EXISTS "EventRSVP_eventId_idx" ON "EventRSVP"("eventId");

-- Composite index for user + event lookups
CREATE INDEX IF NOT EXISTS "EventRSVP_userId_eventId_idx" ON "EventRSVP"("userId", "eventId");

-- Index for point history queries
CREATE INDEX IF NOT EXISTS "PointHistory_userId_idx" ON "PointHistory"("userId");
CREATE INDEX IF NOT EXISTS "PointHistory_createdAt_idx" ON "PointHistory"("createdAt");