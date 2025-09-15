# Travel Logbook - Entity Relationship Diagram (ERD)

## Overview
This ERD defines the database structure for the Travel Logbook feature, showing relationships between users, travel entries, locations, and connections made during travel.

## Core Entities

### 1. travel_entries
**Purpose**: Main entity storing individual travel experiences
**Attributes**:
- `id` (UUID, Primary Key) - Unique identifier for travel entry
- `user_id` (UUID, Foreign Key) - Reference to users table
- `country_code` (VARCHAR(3)) - ISO country code (e.g., 'USA', 'JPN')
- `country_name` (VARCHAR(100)) - Full country name
- `cities` (TEXT) - Comma-separated list of cities visited
- `travel_date` (DATE) - Date of travel (required)
- `travel_notes` (TEXT, Optional) - User's notes about the trip
- `created_at` (TIMESTAMP) - Entry creation time
- `updated_at` (TIMESTAMP) - Last modification time
- `is_public` (BOOLEAN, Default: true) - Visibility setting
- `verification_status` (ENUM: 'unverified', 'pending', 'verified') - Trust verification status

**Indexes**:
- `idx_travel_entries_user_id` on `user_id`
- `idx_travel_entries_country_code` on `country_code`
- `idx_travel_entries_travel_date` on `travel_date`
- `idx_travel_entries_created_at` on `created_at`

### 2. travel_connections
**Purpose**: Links travel entries with Berse community members met during travel
**Attributes**:
- `id` (UUID, Primary Key) - Unique identifier
- `travel_entry_id` (UUID, Foreign Key) - Reference to travel_entries
- `traveler_user_id` (UUID, Foreign Key) - User who created the travel entry
- `connected_user_id` (UUID, Foreign Key) - User who was met during travel
- `connection_type` (ENUM: 'met_in_person', 'planned_meetup', 'local_guide', 'fellow_traveler') - Type of connection
- `meeting_location` (VARCHAR(200), Optional) - Specific location where they met
- `meeting_context` (TEXT, Optional) - How/where they connected
- `created_at` (TIMESTAMP) - When connection was recorded
- `is_mutual_confirmed` (BOOLEAN, Default: false) - Whether both parties confirmed the meeting
- `confirmed_by_connected_user_at` (TIMESTAMP, Optional) - When the connected user confirmed

**Indexes**:
- `idx_travel_connections_travel_entry` on `travel_entry_id`
- `idx_travel_connections_traveler` on `traveler_user_id`
- `idx_travel_connections_connected` on `connected_user_id`
- `unique_travel_connection` on `travel_entry_id`, `connected_user_id` (prevents duplicates)

### 3. travel_statistics
**Purpose**: Pre-calculated statistics for user travel history (performance optimization)
**Attributes**:
- `id` (UUID, Primary Key) - Unique identifier
- `user_id` (UUID, Foreign Key) - Reference to users table
- `total_countries` (INTEGER, Default: 0) - Number of unique countries visited
- `total_entries` (INTEGER, Default: 0) - Total travel entries created
- `total_connections_made` (INTEGER, Default: 0) - Total people met during travels
- `first_travel_date` (DATE, Optional) - Date of earliest travel entry
- `last_travel_date` (DATE, Optional) - Date of most recent travel entry
- `top_countries` (JSONB, Optional) - Array of most visited countries with counts
- `verified_entries_count` (INTEGER, Default: 0) - Number of verified travel entries
- `updated_at` (TIMESTAMP) - Last statistics calculation time

**Indexes**:
- `unique_travel_stats_user` on `user_id` (unique constraint)
- `idx_travel_stats_total_countries` on `total_countries`
- `idx_travel_stats_updated_at` on `updated_at`

### 4. travel_verification_requests
**Purpose**: Handles verification requests for travel entries through community validation
**Attributes**:
- `id` (UUID, Primary Key) - Unique identifier
- `travel_entry_id` (UUID, Foreign Key) - Travel entry being verified
- `requester_user_id` (UUID, Foreign Key) - User requesting verification
- `verifier_user_id` (UUID, Foreign Key, Optional) - User providing verification
- `verification_type` (ENUM: 'connection_confirmation', 'location_proof', 'document_verification') - Type of verification
- `verification_data` (JSONB, Optional) - Additional verification information
- `status` (ENUM: 'pending', 'approved', 'rejected', 'expired') - Request status
- `created_at` (TIMESTAMP) - Request creation time
- `responded_at` (TIMESTAMP, Optional) - When verification was provided
- `expires_at` (TIMESTAMP) - Expiration time for verification request
- `verification_notes` (TEXT, Optional) - Additional notes from verifier

**Indexes**:
- `idx_verification_travel_entry` on `travel_entry_id`
- `idx_verification_requester` on `requester_user_id`
- `idx_verification_verifier` on `verifier_user_id`
- `idx_verification_status` on `status`
- `idx_verification_expires_at` on `expires_at`

### 5. country_data
**Purpose**: Reference table for country information and travel statistics
**Attributes**:
- `country_code` (VARCHAR(3), Primary Key) - ISO country code
- `country_name` (VARCHAR(100)) - Official country name
- `continent` (VARCHAR(50)) - Continent name
- `flag_emoji` (VARCHAR(10)) - Unicode flag emoji
- `popular_cities` (JSONB) - Array of popular cities in the country
- `travel_difficulty` (INTEGER) - Travel difficulty score (1-10)
- `safety_rating` (INTEGER) - Safety rating (1-10)
- `total_berse_visitors` (INTEGER, Default: 0) - Count of Berse users who visited
- `updated_at` (TIMESTAMP) - Last data update

**Indexes**:
- `idx_country_name` on `country_name`
- `idx_country_continent` on `continent`
- `idx_country_popularity` on `total_berse_visitors`

## Entity Relationships

### Primary Relationships

#### 1. users → travel_entries (One-to-Many)
- **Relationship**: One user can have many travel entries
- **Foreign Key**: `travel_entries.user_id` → `users.id`
- **Cascade**: ON DELETE CASCADE (remove travel entries when user is deleted)
- **Business Rule**: Users must be verified to create travel entries

#### 2. travel_entries → travel_connections (One-to-Many)
- **Relationship**: One travel entry can have multiple connections
- **Foreign Key**: `travel_connections.travel_entry_id` → `travel_entries.id`
- **Cascade**: ON DELETE CASCADE (remove connections when travel entry is deleted)
- **Business Rule**: Cannot connect to the same user multiple times in one travel entry

#### 3. users → travel_connections (One-to-Many) [as connected_user]
- **Relationship**: One user can be connected in many travel entries
- **Foreign Key**: `travel_connections.connected_user_id` → `users.id`
- **Cascade**: ON DELETE SET NULL (preserve travel history even if connected user leaves)
- **Business Rule**: Users can only be connected if they are active Berse members

#### 4. users → travel_statistics (One-to-One)
- **Relationship**: Each user has one statistics record
- **Foreign Key**: `travel_statistics.user_id` → `users.id`
- **Cascade**: ON DELETE CASCADE
- **Business Rule**: Statistics are automatically calculated and cached

#### 5. travel_entries → travel_verification_requests (One-to-Many)
- **Relationship**: One travel entry can have multiple verification requests
- **Foreign Key**: `travel_verification_requests.travel_entry_id` → `travel_entries.id`
- **Cascade**: ON DELETE CASCADE
- **Business Rule**: Only one pending verification request per type per entry

#### 6. country_data → travel_entries (One-to-Many)
- **Relationship**: One country can be visited in many travel entries
- **Foreign Key**: `travel_entries.country_code` → `country_data.country_code`
- **Cascade**: ON DELETE RESTRICT (prevent deletion of countries with travel entries)
- **Business Rule**: Country must exist in reference table before travel entry creation

## Database Views

### 1. user_travel_summary
**Purpose**: Consolidated view of user travel information for profile display
```sql
CREATE VIEW user_travel_summary AS
SELECT 
    u.id as user_id,
    u.username,
    ts.total_countries,
    ts.total_entries,
    ts.total_connections_made,
    ts.first_travel_date,
    ts.last_travel_date,
    COUNT(DISTINCT te.country_code) as verified_countries,
    COUNT(tc.id) as total_connections
FROM users u
LEFT JOIN travel_statistics ts ON u.id = ts.user_id
LEFT JOIN travel_entries te ON u.id = te.user_id AND te.verification_status = 'verified'
LEFT JOIN travel_connections tc ON te.id = tc.travel_entry_id
GROUP BY u.id, u.username, ts.total_countries, ts.total_entries, 
         ts.total_connections_made, ts.first_travel_date, ts.last_travel_date;
```

### 2. popular_travel_destinations
**Purpose**: View of most popular travel destinations among Berse users
```sql
CREATE VIEW popular_travel_destinations AS
SELECT 
    cd.country_code,
    cd.country_name,
    cd.continent,
    cd.flag_emoji,
    COUNT(te.id) as total_visits,
    COUNT(DISTINCT te.user_id) as unique_visitors,
    AVG(CASE WHEN te.verification_status = 'verified' THEN 1 ELSE 0 END) as verification_rate
FROM country_data cd
LEFT JOIN travel_entries te ON cd.country_code = te.country_code
GROUP BY cd.country_code, cd.country_name, cd.continent, cd.flag_emoji
ORDER BY total_visits DESC;
```

## Data Constraints and Business Rules

### Integrity Constraints

#### 1. Travel Entry Constraints
- `travel_date` cannot be in the future
- `country_code` must exist in `country_data` table
- `user_id` must reference an active user
- `cities` field has a maximum length of 1000 characters

#### 2. Travel Connection Constraints
- `traveler_user_id` and `connected_user_id` cannot be the same
- `connected_user_id` must reference an active user
- Cannot have duplicate connections (same travel entry + connected user)

#### 3. Verification Constraints
- Only one pending verification request per type per travel entry
- Verification requests expire after 30 days
- Verifier cannot be the same as the requester

### Triggers and Automation

#### 1. travel_statistics_update_trigger
**Purpose**: Automatically update user travel statistics when travel entries change
**Trigger Events**: INSERT, UPDATE, DELETE on `travel_entries`
**Actions**:
- Recalculate total countries and entries
- Update first/last travel dates
- Refresh top countries JSON

#### 2. travel_connection_notification_trigger
**Purpose**: Send notification to connected users when mentioned in travel entries
**Trigger Events**: INSERT on `travel_connections`
**Actions**:
- Create notification for connected user
- Update user's connection statistics

#### 3. verification_expiry_cleanup_trigger
**Purpose**: Clean up expired verification requests
**Trigger Events**: Scheduled job (daily)
**Actions**:
- Set expired requests to 'expired' status
- Send reminder notifications before expiry

## Security and Privacy Considerations

### 1. Data Privacy
- Users can set `is_public` to false for private travel entries
- Connected users must confirm connections for mutual validation
- Travel notes are only visible to the travel entry owner and confirmed connections

### 2. Data Validation
- All foreign key relationships enforce referential integrity
- Country codes are validated against ISO standards
- Date ranges are validated for reasonable travel dates

### 3. Trust and Verification
- Travel entries contribute to overall user trust scores
- Mutual confirmations increase trust ratings
- Verified travel entries have higher trust weight

## Performance Optimization

### 1. Indexing Strategy
- Primary indexes on all foreign keys
- Composite indexes for common query patterns
- Partial indexes for active/verified records only

### 2. Caching Strategy
- Travel statistics pre-calculated and cached
- Popular destinations cached at application level
- User travel summaries cached with TTL

### 3. Data Archiving
- Old verification requests (>1 year) archived to separate table
- Soft delete for travel entries to maintain referential integrity
- Automatic cleanup of unconfirmed connections after 6 months

This ERD structure ensures data integrity, performance, and scalability while supporting the complex relationships inherent in a social travel tracking system integrated with the Berse trust chain.