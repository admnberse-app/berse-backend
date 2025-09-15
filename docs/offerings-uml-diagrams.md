# Offerings - UML Diagrams

## Overview
This document contains UML diagrams for the Offerings feature, modeling the service marketplace system that allows users to offer and book six types of services: Local Guide, Homestay, Marketplace, Open to Connect, BerseBuddy, and BerseMentor.

## 1. Class Diagram

### Core Domain Classes

```plantuml
@startuml Offerings Class Diagram

class User {
  +id: UUID
  +username: string
  +fullName: string
  +email: string
  +profilePicture: string
  +city: string
  +country: string
  +trustScore: number
  +isActive: boolean
  --
  +createServiceOffering(service: ServiceOffering): ServiceOffering
  +getServiceOfferings(): ServiceOffering[]
  +bookService(offeringId: UUID, details: BookingDetails): ServiceBooking
  +getBookings(): ServiceBooking[]
  +leaveReview(booking: ServiceBooking, review: Review): ServiceReview
}

class ServiceOffering {
  +id: UUID
  +userId: UUID
  +serviceType: ServiceType
  +title: string
  +description: string
  +isActive: boolean
  +pricingType: PricingType
  +basePrice: decimal
  +currency: string
  +locationType: LocationType
  +availabilitySchedule: object
  +maxCapacity: number
  +advanceBookingDays: number
  +cancellationPolicy: string
  +requirements: string
  +tags: string[]
  +verificationStatus: VerificationStatus
  +trustScoreRequired: number
  +createdAt: DateTime
  +updatedAt: DateTime
  --
  +updateDetails(details: ServiceDetails): void
  +setAvailability(schedule: AvailabilitySchedule): void
  +activate(): void
  +deactivate(): void
  +getBookings(): ServiceBooking[]
  +getReviews(): ServiceReview[]
  +calculateAverageRating(): decimal
  +isAvailable(date: Date, capacity: number): boolean
}

class ServiceBooking {
  +id: UUID
  +serviceOfferingId: UUID
  +bookerUserId: UUID
  +providerUserId: UUID
  +bookingStatus: BookingStatus
  +requestedDate: Date
  +requestedTime: Time
  +durationHours: decimal
  +participantCount: number
  +bookingMessage: string
  +providerResponse: string
  +agreedPrice: decimal
  +paymentStatus: PaymentStatus
  +paymentMethod: string
  +transactionId: string
  +serviceLocation: string
  +specialRequirements: string
  +createdAt: DateTime
  +confirmedAt: DateTime
  +completedAt: DateTime
  +cancelledAt: DateTime
  +expiryDate: DateTime
  --
  +confirm(response: string): void
  +cancel(reason: string): void
  +complete(): void
  +updateStatus(status: BookingStatus): void
  +processPayment(paymentDetails: PaymentDetails): void
  +sendMessage(message: string): ServiceMessage
  +getMessages(): ServiceMessage[]
  +canBeReviewed(): boolean
}

class ServiceReview {
  +id: UUID
  +bookingId: UUID
  +serviceOfferingId: UUID
  +reviewerUserId: UUID
  +reviewedUserId: UUID
  +reviewerType: ReviewerType
  +overallRating: number
  +communicationRating: number
  +punctualityRating: number
  +qualityRating: number
  +valueRating: number
  +reviewTitle: string
  +reviewText: string
  +reviewPhotos: string[]
  +wouldRecommend: boolean
  +isFeatured: boolean
  +isVerified: boolean
  +helpfulVotes: number
  +responseFromReviewed: string
  +responseAt: DateTime
  +createdAt: DateTime
  +updatedAt: DateTime
  --
  +updateRating(ratings: RatingDetails): void
  +addResponse(response: string): void
  +markHelpful(): void
  +verify(): void
  +feature(): void
}

class ServiceAvailability {
  +id: UUID
  +serviceOfferingId: UUID
  +userId: UUID
  +availabilityType: AvailabilityType
  +dayOfWeek: number
  +specificDate: Date
  +startTime: Time
  +endTime: Time
  +isAvailable: boolean
  +maxBookings: number
  +currentBookings: number
  +notes: string
  +createdAt: DateTime
  +updatedAt: DateTime
  --
  +checkAvailability(requestedCapacity: number): boolean
  +bookSlot(): void
  +releaseSlot(): void
  +block(reason: string): void
  +unblock(): void
}

class ServiceMessage {
  +id: UUID
  +bookingId: UUID
  +senderUserId: UUID
  +recipientUserId: UUID
  +messageType: MessageType
  +messageContent: string
  +attachmentUrl: string
  +attachmentType: string
  +isRead: boolean
  +isSystemMessage: boolean
  +readAt: DateTime
  +createdAt: DateTime
  --
  +markAsRead(): void
  +addAttachment(url: string, type: string): void
}

class ServiceStatistics {
  +id: UUID
  +userId: UUID
  +serviceOfferingId: UUID
  +totalBookings: number
  +completedBookings: number
  +cancelledBookings: number
  +totalRevenue: decimal
  +averageRating: decimal
  +totalReviews: number
  +responseRate: decimal
  +responseTimeHours: decimal
  +repeatCustomerRate: decimal
  +firstBookingDate: Date
  +lastBookingDate: Date
  +activeDaysCount: number
  +updatedAt: DateTime
  --
  +recalculateStatistics(): void
  +updateBookingStats(): void
  +updateRevenueStats(): void
  +updateRatingStats(): void
  +getPerformanceScore(): decimal
}

class ServiceCategory {
  +id: string
  +displayName: string
  +description: string
  +iconEmoji: string
  +colorCode: string
  +isActive: boolean
  +requiresVerification: boolean
  +supportsPricing: boolean
  +supportsScheduling: boolean
  +defaultDurationHours: decimal
  +categorySpecificFields: object
  +sortOrder: number
  +createdAt: DateTime
  +updatedAt: DateTime
  --
  +getServiceOfferings(): ServiceOffering[]
  +getConfiguration(): CategoryConfiguration
}

enum ServiceType {
  LOCAL_GUIDE
  HOMESTAY
  MARKETPLACE
  OPEN_TO_CONNECT
  BERSEBUDDY
  BERSEMENTOR
}

enum BookingStatus {
  PENDING
  CONFIRMED
  IN_PROGRESS
  COMPLETED
  CANCELLED_BY_BOOKER
  CANCELLED_BY_PROVIDER
  EXPIRED
  DISPUTED
}

enum PricingType {
  FREE
  FIXED
  HOURLY
  DAILY
  NEGOTIABLE
}

enum PaymentStatus {
  NONE
  PENDING
  COMPLETED
  REFUNDED
}

enum VerificationStatus {
  UNVERIFIED
  PENDING
  VERIFIED
}

enum ReviewerType {
  BOOKER
  PROVIDER
}

enum LocationType {
  ONLINE
  IN_PERSON
  HYBRID
}

enum AvailabilityType {
  RECURRING
  SPECIFIC_DATE
  BLOCKED
}

enum MessageType {
  TEXT
  IMAGE
  FILE
  SYSTEM
}

' Relationships
User ||--o{ ServiceOffering : creates
User ||--o{ ServiceBooking : books
ServiceOffering ||--o{ ServiceBooking : receives
ServiceBooking ||--o{ ServiceReview : generates
ServiceOffering ||--o{ ServiceAvailability : defines
ServiceBooking ||--o{ ServiceMessage : contains
User ||--o{ ServiceStatistics : tracks
ServiceCategory ||--o{ ServiceOffering : categorizes

@enduml
```

### Service Layer Classes

```plantuml
@startuml Offerings Service Classes

interface OfferingsService {
  +createServiceOffering(userId: UUID, offeringData: ServiceOfferingInput): ServiceOffering
  +updateServiceOffering(offeringId: UUID, updates: ServiceOfferingUpdate): ServiceOffering
  +deactivateServiceOffering(offeringId: UUID): void
  +getServiceOffering(offeringId: UUID): ServiceOffering
  +getUserServiceOfferings(userId: UUID): ServiceOffering[]
  +searchServices(criteria: SearchCriteria): ServiceOffering[]
  +getServicesByCategory(categoryId: string): ServiceOffering[]
  +getServicesByLocation(location: LocationFilter): ServiceOffering[]
}

interface BookingService {
  +createBooking(bookerUserId: UUID, offeringId: UUID, bookingData: BookingInput): ServiceBooking
  +confirmBooking(bookingId: UUID, response: string): ServiceBooking
  +cancelBooking(bookingId: UUID, reason: string): ServiceBooking
  +completeBooking(bookingId: UUID): ServiceBooking
  +getUserBookings(userId: UUID, type: BookingType): ServiceBooking[]
  +getBookingDetails(bookingId: UUID): BookingDetails
  +processPayment(bookingId: UUID, paymentData: PaymentInput): PaymentResult
}

interface ReviewService {
  +createReview(bookingId: UUID, reviewData: ReviewInput): ServiceReview
  +updateReview(reviewId: UUID, updates: ReviewUpdate): ServiceReview
  +respondToReview(reviewId: UUID, response: string): ServiceReview
  +getServiceReviews(offeringId: UUID): ServiceReview[]
  +getUserReviews(userId: UUID): ServiceReview[]
  +markReviewHelpful(reviewId: UUID, userId: UUID): void
  +reportReview(reviewId: UUID, reason: string): void
}

class OfferingsServiceImpl {
  -offeringsRepository: ServiceOfferingsRepository
  -userRepository: UserRepository
  -categoryRepository: ServiceCategoryRepository
  -availabilityService: AvailabilityService
  -statisticsService: StatisticsService
  -notificationService: NotificationService
  -trustChainService: TrustChainService
  --
  +createServiceOffering(userId: UUID, offeringData: ServiceOfferingInput): ServiceOffering
  +updateServiceOffering(offeringId: UUID, updates: ServiceOfferingUpdate): ServiceOffering
  +deactivateServiceOffering(offeringId: UUID): void
  +getServiceOffering(offeringId: UUID): ServiceOffering
  +getUserServiceOfferings(userId: UUID): ServiceOffering[]
  +searchServices(criteria: SearchCriteria): ServiceOffering[]
  +getServicesByCategory(categoryId: string): ServiceOffering[]
  +getServicesByLocation(location: LocationFilter): ServiceOffering[]
  --
  -validateServiceOffering(offering: ServiceOffering): void
  -checkUserEligibility(userId: UUID, serviceType: ServiceType): boolean
  -updateSearchIndex(offering: ServiceOffering): void
}

class BookingServiceImpl {
  -bookingRepository: ServiceBookingRepository
  -offeringsService: OfferingsService
  -availabilityService: AvailabilityService
  -paymentService: PaymentService
  -messagingService: MessagingService
  -notificationService: NotificationService
  --
  +createBooking(bookerUserId: UUID, offeringId: UUID, bookingData: BookingInput): ServiceBooking
  +confirmBooking(bookingId: UUID, response: string): ServiceBooking
  +cancelBooking(bookingId: UUID, reason: string): ServiceBooking
  +completeBooking(bookingId: UUID): ServiceBooking
  +getUserBookings(userId: UUID, type: BookingType): ServiceBooking[]
  +getBookingDetails(bookingId: UUID): BookingDetails
  +processPayment(bookingId: UUID, paymentData: PaymentInput): PaymentResult
  --
  -validateBookingRequest(booking: ServiceBooking): void
  -checkAvailability(offeringId: UUID, date: Date, capacity: number): boolean
  -sendBookingNotifications(booking: ServiceBooking, event: BookingEvent): void
}

class AvailabilityService {
  -availabilityRepository: ServiceAvailabilityRepository
  --
  +setAvailability(offeringId: UUID, availability: AvailabilityInput[]): void
  +getAvailability(offeringId: UUID, dateRange: DateRange): ServiceAvailability[]
  +checkSlotAvailability(offeringId: UUID, date: Date, time: Time, capacity: number): boolean
  +blockAvailability(offeringId: UUID, dateTime: DateTime, duration: Duration): void
  +updateBookingCount(availabilityId: UUID, increment: number): void
}

class StatisticsService {
  -statisticsRepository: ServiceStatisticsRepository
  --
  +calculateServiceStatistics(offeringId: UUID): ServiceStatistics
  +updateUserStatistics(userId: UUID): void
  +getProviderDashboard(userId: UUID): ProviderDashboard
  +getMarketplaceAnalytics(): MarketplaceAnalytics
  +getServicePerformanceMetrics(offeringId: UUID): PerformanceMetrics
}

OfferingsService <|-- OfferingsServiceImpl
BookingService <|-- BookingServiceImpl
OfferingsServiceImpl --> AvailabilityService
OfferingsServiceImpl --> StatisticsService
BookingServiceImpl --> AvailabilityService
BookingServiceImpl --> StatisticsService

@enduml
```

## 2. Sequence Diagrams

### 2.1 Create Service Offering Sequence

```plantuml
@startuml Create Service Offering Sequence

actor "Service Provider" as Provider
participant "OfferingsController" as Controller
participant "OfferingsService" as Service
participant "ServiceRepository" as Repository
participant "AvailabilityService" as AvailabilityService
participant "StatisticsService" as StatsService
participant "TrustChainService" as TrustChain

Provider -> Controller: POST /api/services/create
Controller -> Service: createServiceOffering(userId, offeringData)

Service -> Service: validateServiceOffering(offeringData)
Service -> Service: checkUserEligibility(userId, serviceType)

alt User eligible and data valid
  Service -> Repository: save(serviceOffering)
  Repository -> Service: ServiceOffering
  
  Service -> AvailabilityService: setInitialAvailability(offeringId, schedule)
  AvailabilityService -> Service: AvailabilitySlots[]
  
  Service -> StatsService: initializeStatistics(offeringId)
  StatsService -> Service: ServiceStatistics
  
  Service -> TrustChain: updateServiceProviderStatus(userId)
  TrustChain -> Service: TrustScoreUpdate
  
  Service -> Controller: ServiceOffering
  Controller -> Provider: 201 Created + ServiceOffering
else Validation failed
  Service -> Controller: ValidationError
  Controller -> Provider: 400 Bad Request + Error
end

@enduml
```

### 2.2 Service Booking Process Sequence

```plantuml
@startuml Service Booking Process Sequence

actor Booker
actor Provider
participant "BookingService" as BookingService
participant "AvailabilityService" as AvailabilityService
participant "PaymentService" as PaymentService
participant "NotificationService" as NotificationService
participant "MessagingService" as MessagingService

Booker -> BookingService: createBooking(offeringId, bookingData)
BookingService -> AvailabilityService: checkAvailability(offeringId, date, capacity)
AvailabilityService -> BookingService: isAvailable: true

alt Service available
  BookingService -> BookingService: validateBookingRequest()
  BookingService -> BookingService: createBookingRecord()
  
  BookingService -> AvailabilityService: reserveSlot(offeringId, date, capacity)
  BookingService -> NotificationService: sendBookingRequest(providerId, bookingDetails)
  NotificationService -> Provider: Booking request notification
  
  BookingService -> Booker: Booking created (status: pending)
  
  Provider -> BookingService: confirmBooking(bookingId, response)
  BookingService -> BookingService: updateBookingStatus(confirmed)
  
  alt Payment required
    BookingService -> PaymentService: processPayment(bookingId, paymentData)
    PaymentService -> BookingService: Payment successful
  end
  
  BookingService -> NotificationService: sendConfirmation(bookerId)
  NotificationService -> Booker: Booking confirmed notification
  
  BookingService -> MessagingService: createBookingConversation(bookingId)
  MessagingService -> BookingService: Conversation created
  
else Service not available
  BookingService -> Booker: Booking failed (unavailable)
end

@enduml
```

### 2.3 Service Review Process Sequence

```plantuml
@startuml Service Review Process Sequence

actor Reviewer
participant "ReviewService" as ReviewService
participant "BookingService" as BookingService
participant "StatisticsService" as StatsService
participant "TrustChainService" as TrustChain
participant "NotificationService" as NotificationService

Reviewer -> ReviewService: createReview(bookingId, reviewData)
ReviewService -> BookingService: validateBookingCompleted(bookingId)
BookingService -> ReviewService: booking completed: true

alt Booking completed and not already reviewed
  ReviewService -> ReviewService: validateReviewData(reviewData)
  ReviewService -> ReviewService: createReviewRecord()
  
  ReviewService -> StatsService: updateServiceRating(offeringId, rating)
  StatsService -> StatsService: recalculateAverageRating()
  
  ReviewService -> TrustChain: processReviewTrustImpact(reviewerId, reviewedId, rating)
  TrustChain -> TrustChain: updateTrustScores()
  
  ReviewService -> NotificationService: sendReviewNotification(reviewedUserId)
  NotificationService -> "Reviewed User": New review notification
  
  ReviewService -> Reviewer: Review created successfully
  
else Already reviewed or booking not completed
  ReviewService -> Reviewer: Review creation failed
end

@enduml
```

## 3. Use Case Diagram

```plantuml
@startuml Offerings Use Cases

left to right direction

actor "Service Provider" as Provider
actor "Service Seeker" as Seeker
actor "Booking Participant" as Participant
actor "Administrator" as Admin
actor "System" as System

rectangle "Offerings System" {
  usecase "Create Service Offering" as UC1
  usecase "Update Service Details" as UC2
  usecase "Manage Availability" as UC3
  usecase "View Service Statistics" as UC4
  usecase "Search Services" as UC5
  usecase "View Service Details" as UC6
  usecase "Create Booking" as UC7
  usecase "Confirm Booking" as UC8
  usecase "Cancel Booking" as UC9
  usecase "Complete Service" as UC10
  usecase "Leave Review" as UC11
  usecase "Respond to Review" as UC12
  usecase "Process Payment" as UC13
  usecase "Send Messages" as UC14
  usecase "Manage Service Categories" as UC15
  usecase "Moderate Reviews" as UC16
  usecase "Update Statistics" as UC17
  usecase "Send Notifications" as UC18
  usecase "Verify Services" as UC19
}

' Service Provider use cases
Provider --> UC1
Provider --> UC2
Provider --> UC3
Provider --> UC4
Provider --> UC8
Provider --> UC10
Provider --> UC12
Provider --> UC14

' Service Seeker use cases
Seeker --> UC5
Seeker --> UC6
Seeker --> UC7
Seeker --> UC9
Seeker --> UC11
Seeker --> UC14

' Booking Participant use cases (both provider and seeker)
Participant --> UC14
Participant --> UC11

' Administrator use cases
Admin --> UC15
Admin --> UC16
Admin --> UC19

' System use cases
System --> UC17
System --> UC18
System --> UC13

' Use case relationships
UC7 ..> UC5 : includes
UC7 ..> UC6 : includes
UC8 ..> UC18 : includes
UC10 ..> UC17 : includes
UC11 ..> UC17 : includes

@enduml
```

## 4. Activity Diagram

### 4.1 Service Booking Flow

```plantuml
@startuml Service Booking Activity

start

:Service Seeker searches for services;
:Display search results;
:Seeker selects service;
:Display service details and availability;

if (Service meets requirements?) then (no)
  :Continue searching;
  stop
else (yes)
endif

:Seeker creates booking request;
:System validates availability;

if (Service available?) then (no)
  :Show unavailable message;
  :Suggest alternative dates/services;
  stop
else (yes)
endif

:Create booking record (status: pending);
:Send notification to service provider;

:Provider reviews booking request;

if (Provider accepts?) then (no)
  :Provider declines with reason;
  :Notify seeker of decline;
  :Release reserved availability;
  stop
else (yes)
endif

:Provider confirms booking;
:Update booking status to confirmed;

if (Payment required?) then (yes)
  :Process payment;
  if (Payment successful?) then (no)
    :Cancel booking;
    :Refund if applicable;
    stop
  else (yes)
  endif
else (no)
endif

:Send confirmation notifications;
:Create booking conversation;
:Update availability slots;
:Service delivery phase begins;

stop

@enduml
```

### 4.2 Service Review Process

```plantuml
@startuml Service Review Activity

start

:Service booking completed;
:System sends review request notification;

if (User wants to leave review?) then (no)
  :Skip review process;
  stop
else (yes)
endif

:User accesses review form;
:User fills rating and review details;

if (All required fields completed?) then (no)
  :Show validation errors;
  :Return to form;
else (yes)
endif

:Submit review;
:System validates review content;

if (Review content appropriate?) then (no)
  :Flag for moderation;
  :Notify user of pending review;
else (yes)
endif

:Save review to database;
:Update service statistics;
:Update provider's average rating;
:Update trust scores;
:Send notification to reviewed party;

if (Reviewed party responds?) then (yes)
  :Add response to review;
  :Notify reviewer of response;
else (no)
endif

:Review visible to public;

stop

@enduml
```

## 5. State Diagram

### 5.1 Service Offering State Diagram

```plantuml
@startuml Service Offering State Diagram

[*] --> Draft : Provider starts creation

Draft --> Validating : Provider submits
Validating --> Draft : Validation errors
Validating --> Active : Validation successful

Active --> Inactive : Provider deactivates
Inactive --> Active : Provider reactivates

Active --> UnderReview : Flagged for review
UnderReview --> Active : Review approved
UnderReview --> Suspended : Review rejected

Active --> Suspended : Policy violation
Suspended --> Active : Issue resolved
Suspended --> Deleted : Permanent violation

Active --> Deleted : Provider deletes
Inactive --> Deleted : Provider deletes

Deleted --> [*]

@enduml
```

### 5.2 Service Booking State Diagram

```plantuml
@startuml Service Booking State Diagram

[*] --> Pending : Booking request created

Pending --> Confirmed : Provider accepts
Pending --> CancelledByProvider : Provider declines
Pending --> Expired : Request timeout

Confirmed --> InProgress : Service delivery starts
Confirmed --> CancelledByBooker : Booker cancels
Confirmed --> CancelledByProvider : Provider cancels

InProgress --> Completed : Service finished successfully
InProgress --> Disputed : Issue during service

Completed --> [*] : Final state
Disputed --> Completed : Dispute resolved successfully
Disputed --> CancelledByBooker : Dispute resolved with cancellation

CancelledByBooker --> [*] : Final state
CancelledByProvider --> [*] : Final state
Expired --> [*] : Final state

@enduml
```

## 6. Component Diagram

```plantuml
@startuml Offerings Component Diagram

package "Frontend" {
  component "ServiceMarketplace" as Marketplace
  component "ServiceCreator" as Creator
  component "BookingManager" as BookingManager
  component "ReviewSystem" as ReviewSystem
  component "ProviderDashboard" as Dashboard
}

package "API Gateway" {
  component "OfferingsAPI" as API
  component "BookingAPI" as BookingAPI
  component "ReviewAPI" as ReviewAPI
}

package "Core Services" {
  component "OfferingsService" as OfferingsService
  component "BookingService" as BookingService
  component "ReviewService" as ReviewService
  component "AvailabilityService" as AvailabilityService
  component "StatisticsService" as StatisticsService
}

package "Repository Layer" {
  component "ServiceOfferingsRepo" as OfferingsRepo
  component "ServiceBookingsRepo" as BookingsRepo
  component "ServiceReviewsRepo" as ReviewsRepo
  component "ServiceAvailabilityRepo" as AvailabilityRepo
  component "ServiceStatisticsRepo" as StatsRepo
}

package "Database" {
  database "PostgreSQL" as DB
  database "Redis Cache" as Cache
  database "Elasticsearch" as Search
}

package "External Services" {
  component "PaymentService" as PaymentService
  component "NotificationService" as NotificationService
  component "TrustChainService" as TrustChain
  component "MessagingService" as MessagingService
}

' Frontend connections
Marketplace --> API
Creator --> API
BookingManager --> BookingAPI
ReviewSystem --> ReviewAPI
Dashboard --> API

' API connections
API --> OfferingsService
BookingAPI --> BookingService
ReviewAPI --> ReviewService

' Service connections
OfferingsService --> OfferingsRepo
OfferingsService --> AvailabilityService
OfferingsService --> StatisticsService
BookingService --> BookingsRepo
BookingService --> AvailabilityService
ReviewService --> ReviewsRepo
ReviewService --> StatisticsService

' Repository connections
OfferingsRepo --> DB
BookingsRepo --> DB
ReviewsRepo --> DB
AvailabilityRepo --> DB
StatsRepo --> DB

' Cache and search
OfferingsService --> Cache
OfferingsService --> Search
StatisticsService --> Cache

' External service connections
BookingService --> PaymentService
BookingService --> NotificationService
BookingService --> MessagingService
OfferingsService --> TrustChain
ReviewService --> TrustChain

@enduml
```

## 7. Deployment Diagram

```plantuml
@startuml Offerings Deployment Diagram

node "Client Devices" {
  component "Web Browser" as Browser
  component "Mobile App" as MobileApp
}

node "CDN/Load Balancer" {
  component "CloudFlare" as CDN
}

node "Application Servers" {
  node "App Server 1" {
    component "Offerings API" as API1
    component "Booking Service" as BookingService1
  }
  
  node "App Server 2" {
    component "Offerings API" as API2
    component "Booking Service" as BookingService2
  }
}

node "Database Cluster" {
  database "PostgreSQL Primary" as DBPrimary
  database "PostgreSQL Replica" as DBReplica
  database "Redis Cluster" as Redis
}

node "Search Infrastructure" {
  database "Elasticsearch" as ES
}

node "Background Services" {
  component "Statistics Processor" as StatsProcessor
  component "Review Moderator" as ReviewModerator
  component "Booking Expiry Handler" as ExpiryHandler
}

node "External Services" {
  component "Payment Gateway" as PaymentGateway
  component "Email Service" as EmailService
  component "Push Notification Service" as PushService
}

' Client connections
Browser --> CDN
MobileApp --> CDN

' CDN routing
CDN --> API1
CDN --> API2

' Service connections
API1 --> DBPrimary
API2 --> DBPrimary
BookingService1 --> DBPrimary
BookingService2 --> DBPrimary

' Database replication
DBPrimary --> DBReplica

' Cache connections
API1 --> Redis
API2 --> Redis

' Search connections
API1 --> ES
API2 --> ES

' Background service connections
StatsProcessor --> DBPrimary
ReviewModerator --> DBPrimary
ExpiryHandler --> DBPrimary

' External service connections
BookingService1 --> PaymentGateway
BookingService2 --> PaymentGateway
API1 --> EmailService
API2 --> EmailService
API1 --> PushService
API2 --> PushService

@enduml
```

## Summary

These UML diagrams provide a comprehensive architectural view of the Offerings system:

1. **Class Diagram**: Shows the core domain models and business logic for the six service types
2. **Sequence Diagrams**: Illustrate the flow of service creation, booking, and review processes
3. **Use Case Diagram**: Maps out different user roles and their interactions with the system
4. **Activity Diagrams**: Detail the step-by-step processes for key workflows
5. **State Diagrams**: Show the lifecycle of service offerings and bookings
6. **Component Diagram**: Depicts the system's architectural layers and dependencies
7. **Deployment Diagram**: Shows how components are distributed across infrastructure

These diagrams serve as technical documentation for developers working on the Offerings feature, ensuring clear understanding of the complex service marketplace architecture and its integration with the broader Berse trust ecosystem.