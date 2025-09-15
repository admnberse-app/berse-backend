# Offerings - Entity Relationship Diagram (ERD)

## Overview
This ERD defines the database structure for the Offerings feature, which manages the six core service types in Berse: Local Guide, Homestay, Marketplace, Open to Connect, BerseBuddy, and BerseMentor. The design supports flexible service management, booking workflows, and trust-based transactions.

## Core Entities

### 1. service_offerings
**Purpose**: Main entity defining what services users offer to the community
**Attributes**:
- `id` (UUID, Primary Key) - Unique identifier for service offering
- `user_id` (UUID, Foreign Key) - Reference to users table
- `service_type` (ENUM) - Type of service offered
- `title` (VARCHAR(200)) - Service title/name
- `description` (TEXT) - Detailed service description
- `is_active` (BOOLEAN, Default: true) - Service availability status
- `pricing_type` (ENUM: 'free', 'fixed', 'hourly', 'daily', 'negotiable') - Pricing structure
- `base_price` (DECIMAL(10,2), Optional) - Base price for service
- `currency` (VARCHAR(3), Default: 'USD') - Currency code
- `location_type` (ENUM: 'online', 'in_person', 'hybrid') - Service delivery method
- `availability_schedule` (JSONB) - Weekly availability schedule
- `max_capacity` (INTEGER, Default: 1) - Maximum people per booking
- `advance_booking_days` (INTEGER, Default: 1) - Minimum advance booking required
- `cancellation_policy` (TEXT) - Cancellation terms and conditions
- `requirements` (TEXT, Optional) - Prerequisites or requirements for service
- `tags` (TEXT[], Optional) - Searchable tags for the service
- `verification_status` (ENUM: 'unverified', 'pending', 'verified') - Service verification status
- `trust_score_required` (INTEGER, Default: 0) - Minimum trust score required to book
- `created_at` (TIMESTAMP) - Service creation time
- `updated_at` (TIMESTAMP) - Last modification time
- `last_active_at` (TIMESTAMP) - Last time service was actively managed

**Service Types ENUM**:
- `local_guide` - Local guidance and touring services
- `homestay` - Accommodation hosting services
- `marketplace` - Product or service sales
- `open_to_connect` - General networking and connection services
- `bersebuddy` - Activity partnership services
- `bersementor` - Professional mentoring services

**Indexes**:
- `idx_service_offerings_user_id` on `user_id`
- `idx_service_offerings_service_type` on `service_type`
- `idx_service_offerings_location_type` on `location_type`
- `idx_service_offerings_is_active` on `is_active`
- `idx_service_offerings_created_at` on `created_at`
- `idx_service_offerings_tags` on `tags` (GIN index for array search)

### 2. service_bookings
**Purpose**: Manages booking requests and transactions for services
**Attributes**:
- `id` (UUID, Primary Key) - Unique booking identifier
- `service_offering_id` (UUID, Foreign Key) - Reference to service_offerings
- `booker_user_id` (UUID, Foreign Key) - User making the booking
- `provider_user_id` (UUID, Foreign Key) - Service provider (for quick access)
- `booking_status` (ENUM) - Current booking status
- `requested_date` (DATE) - Preferred service date
- `requested_time` (TIME, Optional) - Preferred service time
- `duration_hours` (DECIMAL(4,2), Optional) - Expected duration
- `participant_count` (INTEGER, Default: 1) - Number of participants
- `booking_message` (TEXT, Optional) - Message from booker to provider
- `provider_response` (TEXT, Optional) - Response from provider
- `agreed_price` (DECIMAL(10,2), Optional) - Final agreed price
- `payment_status` (ENUM: 'none', 'pending', 'completed', 'refunded') - Payment status
- `payment_method` (VARCHAR(50), Optional) - Payment method used
- `transaction_id` (VARCHAR(100), Optional) - External payment transaction ID
- `service_location` (TEXT, Optional) - Where service will be delivered
- `special_requirements` (TEXT, Optional) - Special requests or requirements
- `created_at` (TIMESTAMP) - Booking creation time
- `confirmed_at` (TIMESTAMP, Optional) - When booking was confirmed
- `completed_at` (TIMESTAMP, Optional) - When service was completed
- `cancelled_at` (TIMESTAMP, Optional) - When booking was cancelled
- `expiry_date` (TIMESTAMP) - When booking request expires

**Booking Status ENUM**:
- `pending` - Awaiting provider response
- `confirmed` - Provider accepted booking
- `in_progress` - Service is being delivered
- `completed` - Service completed successfully
- `cancelled_by_booker` - Cancelled by the person who booked
- `cancelled_by_provider` - Cancelled by service provider
- `expired` - Booking request expired without response
- `disputed` - Booking has unresolved issues

**Indexes**:
- `idx_service_bookings_service_offering` on `service_offering_id`
- `idx_service_bookings_booker_user` on `booker_user_id`
- `idx_service_bookings_provider_user` on `provider_user_id`
- `idx_service_bookings_status` on `booking_status`
- `idx_service_bookings_requested_date` on `requested_date`
- `idx_service_bookings_created_at` on `created_at`

### 3. service_reviews
**Purpose**: Stores reviews and ratings for completed service transactions
**Attributes**:
- `id` (UUID, Primary Key) - Unique review identifier
- `booking_id` (UUID, Foreign Key) - Reference to service_bookings
- `service_offering_id` (UUID, Foreign Key) - Reference to service_offerings
- `reviewer_user_id` (UUID, Foreign Key) - User leaving the review
- `reviewed_user_id` (UUID, Foreign Key) - User being reviewed (provider or booker)
- `reviewer_type` (ENUM: 'booker', 'provider') - Who is leaving the review
- `overall_rating` (INTEGER) - Overall rating (1-5 scale)
- `communication_rating` (INTEGER, Optional) - Communication quality (1-5)
- `punctuality_rating` (INTEGER, Optional) - Timeliness rating (1-5)
- `quality_rating` (INTEGER, Optional) - Service/experience quality (1-5)
- `value_rating` (INTEGER, Optional) - Value for money rating (1-5)
- `review_title` (VARCHAR(200), Optional) - Short review title
- `review_text` (TEXT, Optional) - Detailed review content
- `review_photos` (TEXT[], Optional) - URLs of review photos
- `would_recommend` (BOOLEAN, Optional) - Would recommend this service/person
- `is_featured` (BOOLEAN, Default: false) - Featured review status
- `is_verified` (BOOLEAN, Default: false) - Verified review status
- `helpful_votes` (INTEGER, Default: 0) - Number of helpful votes
- `response_from_reviewed` (TEXT, Optional) - Response from reviewed party
- `response_at` (TIMESTAMP, Optional) - When response was posted
- `created_at` (TIMESTAMP) - Review creation time
- `updated_at` (TIMESTAMP) - Last review modification

**Indexes**:
- `idx_service_reviews_booking` on `booking_id`
- `idx_service_reviews_service_offering` on `service_offering_id`
- `idx_service_reviews_reviewer` on `reviewer_user_id`
- `idx_service_reviews_reviewed` on `reviewed_user_id`
- `idx_service_reviews_overall_rating` on `overall_rating`
- `idx_service_reviews_created_at` on `created_at`
- `unique_booking_reviewer_type` on `booking_id`, `reviewer_type` (prevents duplicate reviews)

### 4. service_categories
**Purpose**: Reference table for service categories and their configurations
**Attributes**:
- `id` (VARCHAR(50), Primary Key) - Service category identifier
- `display_name` (VARCHAR(100)) - Human-readable category name
- `description` (TEXT) - Category description
- `icon_emoji` (VARCHAR(10)) - Unicode emoji icon
- `color_code` (VARCHAR(7)) - Hex color code for UI
- `is_active` (BOOLEAN, Default: true) - Category availability
- `requires_verification` (BOOLEAN, Default: false) - Whether category needs verification
- `supports_pricing` (BOOLEAN, Default: true) - Whether category supports pricing
- `supports_scheduling` (BOOLEAN, Default: true) - Whether category supports scheduling
- `default_duration_hours` (DECIMAL(4,2), Optional) - Default service duration
- `category_specific_fields` (JSONB, Optional) - Additional fields for this category
- `sort_order` (INTEGER, Default: 0) - Display order priority
- `created_at` (TIMESTAMP) - Category creation time
- `updated_at` (TIMESTAMP) - Last category update

**Indexes**:
- `idx_service_categories_is_active` on `is_active`
- `idx_service_categories_sort_order` on `sort_order`

### 5. service_availability
**Purpose**: Manages detailed availability schedules for service providers
**Attributes**:
- `id` (UUID, Primary Key) - Unique availability identifier
- `service_offering_id` (UUID, Foreign Key) - Reference to service_offerings
- `user_id` (UUID, Foreign Key) - Service provider user ID
- `availability_type` (ENUM: 'recurring', 'specific_date', 'blocked') - Type of availability
- `day_of_week` (INTEGER, Optional) - Day of week (0=Sunday, 6=Saturday) for recurring
- `specific_date` (DATE, Optional) - Specific date for one-time availability
- `start_time` (TIME) - Start time for availability window
- `end_time` (TIME) - End time for availability window
- `is_available` (BOOLEAN, Default: true) - Whether time slot is available or blocked
- `max_bookings` (INTEGER, Default: 1) - Maximum bookings for this time slot
- `current_bookings` (INTEGER, Default: 0) - Current number of bookings
- `notes` (TEXT, Optional) - Internal notes about this availability
- `created_at` (TIMESTAMP) - Availability entry creation time
- `updated_at` (TIMESTAMP) - Last availability update

**Indexes**:
- `idx_service_availability_service_offering` on `service_offering_id`
- `idx_service_availability_user` on `user_id`
- `idx_service_availability_day_of_week` on `day_of_week`
- `idx_service_availability_specific_date` on `specific_date`
- `idx_service_availability_is_available` on `is_available`

### 6. service_messages
**Purpose**: Handles communication between service providers and bookers
**Attributes**:
- `id` (UUID, Primary Key) - Unique message identifier
- `booking_id` (UUID, Foreign Key) - Reference to service_bookings
- `sender_user_id` (UUID, Foreign Key) - User sending the message
- `recipient_user_id` (UUID, Foreign Key) - User receiving the message
- `message_type` (ENUM: 'text', 'image', 'file', 'system') - Type of message
- `message_content` (TEXT) - Message text content
- `attachment_url` (VARCHAR(500), Optional) - URL for attached files
- `attachment_type` (VARCHAR(50), Optional) - MIME type of attachment
- `is_read` (BOOLEAN, Default: false) - Whether message has been read
- `is_system_message` (BOOLEAN, Default: false) - Whether it's a system-generated message
- `read_at` (TIMESTAMP, Optional) - When message was read
- `created_at` (TIMESTAMP) - Message creation time

**Indexes**:
- `idx_service_messages_booking` on `booking_id`
- `idx_service_messages_sender` on `sender_user_id`
- `idx_service_messages_recipient` on `recipient_user_id`
- `idx_service_messages_is_read` on `is_read`
- `idx_service_messages_created_at` on `created_at`

### 7. service_statistics
**Purpose**: Pre-calculated statistics for service performance and analytics
**Attributes**:
- `id` (UUID, Primary Key) - Unique statistics identifier
- `user_id` (UUID, Foreign Key) - Service provider user ID
- `service_offering_id` (UUID, Foreign Key, Optional) - Specific service (null for user totals)
- `total_bookings` (INTEGER, Default: 0) - Total number of bookings
- `completed_bookings` (INTEGER, Default: 0) - Successfully completed bookings
- `cancelled_bookings` (INTEGER, Default: 0) - Cancelled bookings
- `total_revenue` (DECIMAL(12,2), Default: 0.00) - Total revenue earned
- `average_rating` (DECIMAL(3,2), Default: 0.00) - Average review rating
- `total_reviews` (INTEGER, Default: 0) - Total number of reviews
- `response_rate` (DECIMAL(5,2), Default: 0.00) - Percentage of booking requests responded to
- `response_time_hours` (DECIMAL(6,2), Default: 0.00) - Average response time in hours
- `repeat_customer_rate` (DECIMAL(5,2), Default: 0.00) - Percentage of repeat customers
- `first_booking_date` (DATE, Optional) - Date of first booking
- `last_booking_date` (DATE, Optional) - Date of most recent booking
- `active_days_count` (INTEGER, Default: 0) - Number of days service has been active
- `updated_at` (TIMESTAMP) - Last statistics calculation

**Indexes**:
- `idx_service_statistics_user` on `user_id`
- `idx_service_statistics_service_offering` on `service_offering_id`
- `idx_service_statistics_average_rating` on `average_rating`
- `idx_service_statistics_total_bookings` on `total_bookings`
- `unique_service_stats` on `user_id`, `service_offering_id` (prevents duplicates)

## Entity Relationships

### Primary Relationships

#### 1. users → service_offerings (One-to-Many)
- **Relationship**: One user can offer multiple services
- **Foreign Key**: `service_offerings.user_id` → `users.id`
- **Cascade**: ON DELETE CASCADE (remove service offerings when user deleted)
- **Business Rule**: Users must have verified profiles to offer certain service types

#### 2. service_offerings → service_bookings (One-to-Many)
- **Relationship**: One service offering can have multiple bookings
- **Foreign Key**: `service_bookings.service_offering_id` → `service_offerings.id`
- **Cascade**: ON DELETE RESTRICT (prevent deletion of services with active bookings)
- **Business Rule**: Cannot book inactive services

#### 3. users → service_bookings (One-to-Many) [as booker]
- **Relationship**: One user can make multiple bookings
- **Foreign Key**: `service_bookings.booker_user_id` → `users.id`
- **Cascade**: ON DELETE SET NULL (preserve booking history)
- **Business Rule**: Users must meet minimum trust score requirements

#### 4. service_bookings → service_reviews (One-to-Many)
- **Relationship**: One booking can have multiple reviews (bidirectional)
- **Foreign Key**: `service_reviews.booking_id` → `service_bookings.id`
- **Cascade**: ON DELETE CASCADE
- **Business Rule**: Reviews only allowed for completed bookings

#### 5. service_offerings → service_availability (One-to-Many)
- **Relationship**: One service can have multiple availability slots
- **Foreign Key**: `service_availability.service_offering_id` → `service_offerings.id`
- **Cascade**: ON DELETE CASCADE
- **Business Rule**: Availability must not conflict with existing bookings

#### 6. service_bookings → service_messages (One-to-Many)
- **Relationship**: One booking can have multiple messages
- **Foreign Key**: `service_messages.booking_id` → `service_bookings.id`
- **Cascade**: ON DELETE CASCADE
- **Business Rule**: Messages only between booking participants

#### 7. service_categories → service_offerings (One-to-Many)
- **Relationship**: One category can have multiple offerings
- **Foreign Key**: `service_offerings.service_type` → `service_categories.id`
- **Cascade**: ON DELETE RESTRICT
- **Business Rule**: Service type must exist in categories table

## Database Views

### 1. active_service_providers
**Purpose**: View of all active service providers with their offerings summary
```sql
CREATE VIEW active_service_providers AS
SELECT 
    u.id as user_id,
    u.username,
    u.full_name,
    u.profile_picture,
    u.city,
    u.country,
    u.trust_score,
    COUNT(so.id) as total_services,
    COUNT(CASE WHEN so.is_active = true THEN 1 END) as active_services,
    ARRAY_AGG(DISTINCT so.service_type) as service_types,
    AVG(sr.overall_rating) as average_rating,
    COUNT(sr.id) as total_reviews,
    ss.total_bookings,
    ss.completed_bookings
FROM users u
JOIN service_offerings so ON u.id = so.user_id
LEFT JOIN service_reviews sr ON so.id = sr.service_offering_id
LEFT JOIN service_statistics ss ON u.id = ss.user_id AND ss.service_offering_id IS NULL
WHERE so.is_active = true
GROUP BY u.id, u.username, u.full_name, u.profile_picture, u.city, u.country, 
         u.trust_score, ss.total_bookings, ss.completed_bookings;
```

### 2. service_marketplace
**Purpose**: View of all available services for marketplace display
```sql
CREATE VIEW service_marketplace AS
SELECT 
    so.id as service_id,
    so.title,
    so.description,
    so.service_type,
    so.pricing_type,
    so.base_price,
    so.currency,
    so.location_type,
    so.tags,
    u.id as provider_id,
    u.username as provider_username,
    u.full_name as provider_name,
    u.profile_picture as provider_avatar,
    u.city as provider_city,
    u.country as provider_country,
    u.trust_score as provider_trust_score,
    sc.display_name as category_name,
    sc.icon_emoji as category_icon,
    sc.color_code as category_color,
    COALESCE(AVG(sr.overall_rating), 0) as average_rating,
    COUNT(sr.id) as review_count,
    ss.total_bookings,
    ss.completed_bookings
FROM service_offerings so
JOIN users u ON so.user_id = u.id
JOIN service_categories sc ON so.service_type = sc.id
LEFT JOIN service_reviews sr ON so.id = sr.service_offering_id
LEFT JOIN service_statistics ss ON so.id = ss.service_offering_id
WHERE so.is_active = true AND u.is_active = true
GROUP BY so.id, so.title, so.description, so.service_type, so.pricing_type, 
         so.base_price, so.currency, so.location_type, so.tags,
         u.id, u.username, u.full_name, u.profile_picture, u.city, u.country, u.trust_score,
         sc.display_name, sc.icon_emoji, sc.color_code, ss.total_bookings, ss.completed_bookings;
```

### 3. booking_dashboard
**Purpose**: Comprehensive view for booking management dashboards
```sql
CREATE VIEW booking_dashboard AS
SELECT 
    sb.id as booking_id,
    sb.booking_status,
    sb.requested_date,
    sb.requested_time,
    sb.participant_count,
    sb.agreed_price,
    sb.payment_status,
    sb.created_at,
    sb.confirmed_at,
    sb.completed_at,
    so.title as service_title,
    so.service_type,
    booker.username as booker_username,
    booker.full_name as booker_name,
    booker.profile_picture as booker_avatar,
    provider.username as provider_username,
    provider.full_name as provider_name,
    provider.profile_picture as provider_avatar,
    COUNT(sm.id) as message_count,
    MAX(sm.created_at) as last_message_at
FROM service_bookings sb
JOIN service_offerings so ON sb.service_offering_id = so.id
JOIN users booker ON sb.booker_user_id = booker.id
JOIN users provider ON sb.provider_user_id = provider.id
LEFT JOIN service_messages sm ON sb.id = sm.booking_id
GROUP BY sb.id, sb.booking_status, sb.requested_date, sb.requested_time, 
         sb.participant_count, sb.agreed_price, sb.payment_status,
         sb.created_at, sb.confirmed_at, sb.completed_at,
         so.title, so.service_type, booker.username, booker.full_name, booker.profile_picture,
         provider.username, provider.full_name, provider.profile_picture;
```

## Data Constraints and Business Rules

### Integrity Constraints

#### 1. Service Offering Constraints
- `base_price` must be non-negative when `pricing_type` is not 'free'
- `max_capacity` must be greater than 0
- `advance_booking_days` must be non-negative
- `trust_score_required` must be between 0 and 1000

#### 2. Booking Constraints
- `requested_date` cannot be in the past
- `participant_count` cannot exceed service `max_capacity`
- `booker_user_id` cannot equal `provider_user_id`
- `agreed_price` must be non-negative when specified

#### 3. Review Constraints
- All rating fields must be between 1 and 5
- Reviews can only be created for completed bookings
- One review per booking per reviewer type (booker/provider)

#### 4. Availability Constraints
- `start_time` must be before `end_time`
- `current_bookings` cannot exceed `max_bookings`
- Availability slots cannot overlap for the same service

### Triggers and Automation

#### 1. service_statistics_update_trigger
**Purpose**: Automatically update service statistics when bookings/reviews change
**Trigger Events**: INSERT, UPDATE, DELETE on `service_bookings` and `service_reviews`
**Actions**:
- Recalculate booking counts and completion rates
- Update average ratings and review counts
- Refresh revenue calculations

#### 2. availability_booking_sync_trigger
**Purpose**: Sync availability slots with actual bookings
**Trigger Events**: INSERT, UPDATE on `service_bookings`
**Actions**:
- Update `current_bookings` count in availability slots
- Block availability when maximum bookings reached

#### 3. booking_status_notification_trigger
**Purpose**: Send notifications for booking status changes
**Trigger Events**: UPDATE on `service_bookings` (status changes)
**Actions**:
- Notify relevant parties of status changes
- Create system messages in booking conversations
- Update trust scores based on completion/cancellation

## Security and Privacy Considerations

### 1. Data Privacy
- Service providers control visibility of their offerings
- Personal contact information shared only after booking confirmation
- Review content moderated for inappropriate content

### 2. Trust and Verification
- Service providers must meet minimum trust score requirements for certain categories
- High-value services require additional verification
- Review authenticity validated through booking verification

### 3. Financial Security
- Payment processing handled through secure third-party providers
- Transaction records maintained for dispute resolution
- Refund policies enforced through automated systems

## Performance Optimization

### 1. Indexing Strategy
- Composite indexes for common search patterns (service_type + location + is_active)
- Full-text search indexes on service descriptions and titles
- Partial indexes for active/available services only

### 2. Caching Strategy
- Service marketplace view cached with short TTL
- Provider statistics cached at application level
- Popular service categories pre-computed

### 3. Data Archiving
- Completed bookings older than 2 years archived
- Old messages archived after booking completion
- Soft delete for services to maintain booking history

This ERD structure supports a comprehensive service marketplace while maintaining data integrity, performance, and integration with the broader Berse trust chain ecosystem.