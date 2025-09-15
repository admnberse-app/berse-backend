# Travel Logbook - UML Diagrams

## Overview
This document contains UML diagrams for the Travel Logbook feature, including class diagrams, sequence diagrams, use case diagrams, and activity diagrams that model the system architecture and user interactions.

## 1. Class Diagram

### Core Domain Classes

```plantuml
@startuml Travel Logbook Class Diagram

class User {
  +id: UUID
  +username: string
  +email: string
  +profilePicture: string
  +isActive: boolean
  +createdAt: DateTime
  --
  +createTravelEntry(entry: TravelEntry): TravelEntry
  +getTravelHistory(): TravelEntry[]
  +getTravelStatistics(): TravelStatistics
  +verifyTravelEntry(entryId: UUID): void
}

class TravelEntry {
  +id: UUID
  +userId: UUID
  +countryCode: string
  +countryName: string
  +cities: string[]
  +travelDate: Date
  +travelNotes: string
  +isPublic: boolean
  +verificationStatus: VerificationStatus
  +createdAt: DateTime
  +updatedAt: DateTime
  --
  +addConnection(connection: TravelConnection): void
  +removeConnection(connectionId: UUID): void
  +updateVerificationStatus(status: VerificationStatus): void
  +getConnections(): TravelConnection[]
  +validate(): boolean
}

class TravelConnection {
  +id: UUID
  +travelEntryId: UUID
  +travelerUserId: UUID
  +connectedUserId: UUID
  +connectionType: ConnectionType
  +meetingLocation: string
  +meetingContext: string
  +isMutualConfirmed: boolean
  +confirmedAt: DateTime
  +createdAt: DateTime
  --
  +confirmConnection(): void
  +setMeetingContext(context: string): void
  +validateConnection(): boolean
}

class TravelStatistics {
  +id: UUID
  +userId: UUID
  +totalCountries: number
  +totalEntries: number
  +totalConnectionsMade: number
  +firstTravelDate: Date
  +lastTravelDate: Date
  +topCountries: CountryVisit[]
  +verifiedEntriesCount: number
  +updatedAt: DateTime
  --
  +recalculateStatistics(): void
  +getTopDestinations(): CountryVisit[]
  +getTravelScore(): number
}

class TravelVerificationRequest {
  +id: UUID
  +travelEntryId: UUID
  +requesterUserId: UUID
  +verifierUserId: UUID
  +verificationType: VerificationType
  +verificationData: object
  +status: RequestStatus
  +createdAt: DateTime
  +respondedAt: DateTime
  +expiresAt: DateTime
  +verificationNotes: string
  --
  +approve(): void
  +reject(reason: string): void
  +isExpired(): boolean
}

class CountryData {
  +countryCode: string
  +countryName: string
  +continent: string
  +flagEmoji: string
  +popularCities: string[]
  +travelDifficulty: number
  +safetyRating: number
  +totalBerseVisitors: number
  +updatedAt: DateTime
  --
  +incrementVisitorCount(): void
  +getPopularCities(): string[]
}

enum VerificationStatus {
  UNVERIFIED
  PENDING
  VERIFIED
}

enum ConnectionType {
  MET_IN_PERSON
  PLANNED_MEETUP
  LOCAL_GUIDE
  FELLOW_TRAVELER
}

enum VerificationType {
  CONNECTION_CONFIRMATION
  LOCATION_PROOF
  DOCUMENT_VERIFICATION
}

enum RequestStatus {
  PENDING
  APPROVED
  REJECTED
  EXPIRED
}

class CountryVisit {
  +countryCode: string
  +countryName: string
  +visitCount: number
  +lastVisitDate: Date
}

' Relationships
User ||--o{ TravelEntry : creates
TravelEntry ||--o{ TravelConnection : contains
User ||--o{ TravelConnection : participates_in
User ||--|| TravelStatistics : has
TravelEntry ||--o{ TravelVerificationRequest : requests
CountryData ||--o{ TravelEntry : describes
TravelStatistics ||--o{ CountryVisit : tracks

@enduml
```

### Service Layer Classes

```plantuml
@startuml Travel Logbook Service Classes

interface TravelLogbookService {
  +createTravelEntry(userId: UUID, entryData: TravelEntryInput): TravelEntry
  +getUserTravelHistory(userId: UUID): TravelEntry[]
  +updateTravelEntry(entryId: UUID, updates: TravelEntryUpdate): TravelEntry
  +deleteTravelEntry(entryId: UUID): void
  +searchUserProfiles(query: string): UserProfile[]
  +addTravelConnection(entryId: UUID, connectionData: ConnectionInput): TravelConnection
  +confirmTravelConnection(connectionId: UUID): void
  +requestTravelVerification(entryId: UUID, verificationType: VerificationType): TravelVerificationRequest
}

class TravelLogbookServiceImpl {
  -travelEntryRepository: TravelEntryRepository
  -userRepository: UserRepository
  -travelStatisticsService: TravelStatisticsService
  -notificationService: NotificationService
  -trustChainService: TrustChainService
  --
  +createTravelEntry(userId: UUID, entryData: TravelEntryInput): TravelEntry
  +getUserTravelHistory(userId: UUID): TravelEntry[]
  +updateTravelEntry(entryId: UUID, updates: TravelEntryUpdate): TravelEntry
  +deleteTravelEntry(entryId: UUID): void
  +searchUserProfiles(query: string): UserProfile[]
  +addTravelConnection(entryId: UUID, connectionData: ConnectionInput): TravelConnection
  +confirmTravelConnection(connectionId: UUID): void
  +requestTravelVerification(entryId: UUID, verificationType: VerificationType): TravelVerificationRequest
  --
  -validateTravelEntry(entry: TravelEntry): void
  -updateUserStatistics(userId: UUID): void
  -sendConnectionNotification(connection: TravelConnection): void
}

class TravelStatisticsService {
  -statisticsRepository: TravelStatisticsRepository
  --
  +calculateUserStatistics(userId: UUID): TravelStatistics
  +updateStatistics(userId: UUID): void
  +getGlobalTravelStatistics(): GlobalTravelStats
  +getPopularDestinations(): CountryData[]
}

class TravelVerificationService {
  -verificationRepository: TravelVerificationRepository
  -trustChainService: TrustChainService
  --
  +createVerificationRequest(request: VerificationRequestInput): TravelVerificationRequest
  +processVerificationRequest(requestId: UUID, decision: VerificationDecision): void
  +getVerificationRequests(userId: UUID): TravelVerificationRequest[]
  +expireOldRequests(): void
}

interface TravelEntryRepository {
  +save(entry: TravelEntry): TravelEntry
  +findById(id: UUID): TravelEntry
  +findByUserId(userId: UUID): TravelEntry[]
  +findByCountryCode(countryCode: string): TravelEntry[]
  +delete(id: UUID): void
}

interface TravelStatisticsRepository {
  +save(statistics: TravelStatistics): TravelStatistics
  +findByUserId(userId: UUID): TravelStatistics
  +updateStatistics(userId: UUID, statistics: TravelStatistics): void
}

TravelLogbookService <|-- TravelLogbookServiceImpl
TravelLogbookServiceImpl --> TravelEntryRepository
TravelLogbookServiceImpl --> TravelStatisticsService
TravelLogbookServiceImpl --> TravelVerificationService

@enduml
```

## 2. Sequence Diagrams

### 2.1 Create Travel Entry Sequence

```plantuml
@startuml Create Travel Entry Sequence

actor User
participant "TravelLogbookModal" as Modal
participant "TravelLogbookService" as Service
participant "TravelEntryRepository" as Repository
participant "TravelStatisticsService" as StatsService
participant "NotificationService" as Notification

User -> Modal: Click "Add Travel Entry"
Modal -> User: Show travel entry form

User -> Modal: Fill travel details
User -> Modal: Search for connections
Modal -> Service: searchUserProfiles(query)
Service -> Repository: findUsersByQuery(query)
Repository -> Service: UserProfile[]
Service -> Modal: UserProfile[]
Modal -> User: Show search results

User -> Modal: Select connections
User -> Modal: Submit travel entry
Modal -> Service: createTravelEntry(userId, entryData)

Service -> Service: validateTravelEntry(entryData)
alt Validation successful
  Service -> Repository: save(travelEntry)
  Repository -> Service: TravelEntry
  
  Service -> StatsService: updateStatistics(userId)
  StatsService -> StatsService: recalculateStatistics()
  
  loop For each connection
    Service -> Notification: sendConnectionNotification(connection)
  end
  
  Service -> Modal: TravelEntry
  Modal -> User: Show success message
  Modal -> Modal: Close modal
else Validation failed
  Service -> Modal: ValidationError
  Modal -> User: Show error message
end

@enduml
```

### 2.2 Travel Connection Confirmation Sequence

```plantuml
@startuml Travel Connection Confirmation Sequence

actor "Connected User" as ConnectedUser
participant "NotificationService" as Notification
participant "TravelLogbookService" as Service
participant "TravelConnectionRepository" as Repository
participant "TrustChainService" as TrustChain

Notification -> ConnectedUser: Travel connection notification
ConnectedUser -> Notification: Click notification
Notification -> ConnectedUser: Show connection details

ConnectedUser -> Service: confirmTravelConnection(connectionId)
Service -> Repository: findById(connectionId)
Repository -> Service: TravelConnection

alt Connection exists and pending
  Service -> Repository: updateConnection(isMutualConfirmed = true)
  Repository -> Service: Updated TravelConnection
  
  Service -> TrustChain: addTrustVerification(travelerUserId, connectedUserId)
  TrustChain -> TrustChain: calculateTrustScore()
  
  Service -> Notification: sendConfirmationNotification(travelerUserId)
  Service -> ConnectedUser: Confirmation successful
else Connection not found or already confirmed
  Service -> ConnectedUser: Error message
end

@enduml
```

### 2.3 Travel Entry Verification Sequence

```plantuml
@startuml Travel Entry Verification Sequence

actor "Requesting User" as Requester
actor "Verifying User" as Verifier
participant "VerificationService" as VService
participant "TravelLogbookService" as TService
participant "TrustChainService" as TrustChain

Requester -> VService: requestTravelVerification(entryId, type)
VService -> VService: createVerificationRequest()
VService -> Verifier: Send verification request notification

Verifier -> VService: Review verification request
Verifier -> VService: approveVerification(requestId, evidence)

VService -> VService: validateEvidence()
alt Evidence valid
  VService -> TService: updateVerificationStatus(entryId, VERIFIED)
  VService -> TrustChain: addVerificationPoints(userId)
  TrustChain -> TrustChain: recalculateTrustScore()
  
  VService -> Requester: Verification approved notification
else Evidence invalid
  VService -> Verifier: Request additional evidence
end

@enduml
```

## 3. Use Case Diagram

```plantuml
@startuml Travel Logbook Use Cases

left to right direction

actor "Traveler User" as Traveler
actor "Connected User" as Connected
actor "Verifying User" as Verifier
actor "System" as System

rectangle "Travel Logbook System" {
  usecase "Create Travel Entry" as UC1
  usecase "View Travel History" as UC2
  usecase "Edit Travel Entry" as UC3
  usecase "Delete Travel Entry" as UC4
  usecase "Search Users" as UC5
  usecase "Add Travel Connection" as UC6
  usecase "Confirm Connection" as UC7
  usecase "View Travel Statistics" as UC8
  usecase "Request Verification" as UC9
  usecase "Verify Travel Entry" as UC10
  usecase "Update Statistics" as UC11
  usecase "Send Notifications" as UC12
  usecase "Manage Privacy Settings" as UC13
  usecase "Export Travel Data" as UC14
}

' Traveler User use cases
Traveler --> UC1
Traveler --> UC2
Traveler --> UC3
Traveler --> UC4
Traveler --> UC5
Traveler --> UC6
Traveler --> UC8
Traveler --> UC9
Traveler --> UC13
Traveler --> UC14

' Connected User use cases
Connected --> UC7
Connected --> UC2

' Verifying User use cases
Verifier --> UC10

' System use cases
System --> UC11
System --> UC12

' Use case relationships
UC1 ..> UC5 : includes
UC1 ..> UC6 : includes
UC6 ..> UC12 : includes
UC7 ..> UC11 : includes
UC9 ..> UC12 : includes
UC10 ..> UC11 : includes

@enduml
```

## 4. Activity Diagram

### 4.1 Create Travel Entry Activity

```plantuml
@startuml Create Travel Entry Activity

start

:User clicks "Add Travel Entry";
:Display travel entry modal;
:User selects country;
:User enters cities (optional);
:User selects travel date;
:User enters travel notes (optional);

if (User wants to add connections?) then (yes)
  :User searches for Berse users;
  :Display search results;
  :User selects connections;
else (no)
endif

:User clicks "Add Entry";

if (All required fields filled?) then (no)
  :Show validation error;
  stop
else (yes)
endif

:Validate travel entry data;

if (Data valid?) then (no)
  :Show error message;
  stop
else (yes)
endif

:Save travel entry to database;
:Update user travel statistics;

if (Connections added?) then (yes)
  :Send notification to connected users;
else (no)
endif

:Show success message;
:Close modal;
:Refresh travel logbook view;

stop

@enduml
```

### 4.2 Travel Connection Confirmation Activity

```plantuml
@startuml Travel Connection Confirmation Activity

start

:Connected user receives notification;
:User clicks notification;
:Display connection details;

if (Connection details accurate?) then (no)
  :User can report inaccuracy;
  :Send report to moderators;
  stop
else (yes)
endif

:User clicks "Confirm Connection";
:Update connection status to confirmed;
:Calculate trust score impact;
:Update both users' trust scores;
:Send confirmation notification to traveler;
:Update travel statistics;

stop

@enduml
```

## 5. State Diagram

### 5.1 Travel Entry State Diagram

```plantuml
@startuml Travel Entry State Diagram

[*] --> Draft : User starts creating entry

Draft --> Validating : User submits form
Validating --> Draft : Validation errors
Validating --> Created : Validation successful

Created --> VerificationRequested : User requests verification
Created --> Updated : User edits entry
Updated --> VerificationRequested : User requests verification

VerificationRequested --> VerificationPending : Verification request sent
VerificationPending --> Verified : Verification approved
VerificationPending --> Created : Verification rejected/expired

Created --> Deleted : User deletes entry
Updated --> Deleted : User deletes entry
Verified --> Deleted : User deletes entry

Deleted --> [*]

@enduml
```

### 5.2 Travel Connection State Diagram

```plantuml
@startuml Travel Connection State Diagram

[*] --> Pending : Connection added to travel entry

Pending --> Confirmed : Connected user confirms
Pending --> Expired : 30 days without confirmation
Pending --> Disputed : Connected user disputes

Confirmed --> [*] : Permanent connection
Expired --> [*] : Connection removed
Disputed --> UnderReview : Moderator review required

UnderReview --> Confirmed : Dispute resolved - valid
UnderReview --> Removed : Dispute resolved - invalid

Removed --> [*]

@enduml
```

## 6. Component Diagram

```plantuml
@startuml Travel Logbook Component Diagram

package "Frontend" {
  component "TravelLogbookModal" as Modal
  component "TravelHistoryView" as HistoryView
  component "TravelStatsWidget" as StatsWidget
  component "ConnectionsList" as ConnectionsList
}

package "API Layer" {
  component "TravelLogbookController" as Controller
  component "TravelVerificationController" as VerificationController
}

package "Service Layer" {
  component "TravelLogbookService" as TLService
  component "TravelStatisticsService" as TSService
  component "TravelVerificationService" as TVService
  component "NotificationService" as NService
}

package "Repository Layer" {
  component "TravelEntryRepository" as TravelRepo
  component "TravelConnectionRepository" as ConnectionRepo
  component "TravelStatisticsRepository" as StatsRepo
  component "TravelVerificationRepository" as VerificationRepo
}

package "Database" {
  database "PostgreSQL" as DB
}

package "External Services" {
  component "TrustChainService" as TrustChain
  component "UserService" as UserService
  component "EmailService" as EmailService
}

' Frontend connections
Modal --> Controller : HTTP/REST
HistoryView --> Controller : HTTP/REST
StatsWidget --> Controller : HTTP/REST
ConnectionsList --> Controller : HTTP/REST

' API Layer connections
Controller --> TLService
VerificationController --> TVService

' Service Layer connections
TLService --> TravelRepo
TLService --> TSService
TLService --> NService
TLService --> TrustChain
TSService --> StatsRepo
TVService --> VerificationRepo
NService --> EmailService

' Repository connections
TravelRepo --> DB
ConnectionRepo --> DB
StatsRepo --> DB
VerificationRepo --> DB

' External service connections
TLService --> UserService
NService --> UserService

@enduml
```

## 7. Deployment Diagram

```plantuml
@startuml Travel Logbook Deployment Diagram

node "Web Browser" {
  component "React Frontend" as Frontend
}

node "Load Balancer" {
  component "Nginx" as LB
}

node "Application Server 1" {
  component "Node.js API" as API1
  component "Travel Logbook Service" as TLS1
}

node "Application Server 2" {
  component "Node.js API" as API2
  component "Travel Logbook Service" as TLS2
}

node "Database Server" {
  database "PostgreSQL" as DB
  database "Redis Cache" as Cache
}

node "Background Services" {
  component "Statistics Calculator" as StatCalc
  component "Verification Processor" as VerProc
  component "Notification Queue" as NotQueue
}

node "External Services" {
  component "Email Service" as Email
  component "Trust Chain Service" as TrustChain
}

' Connections
Frontend --> LB : HTTPS
LB --> API1 : HTTP
LB --> API2 : HTTP
API1 --> TLS1
API2 --> TLS2
TLS1 --> DB
TLS2 --> DB
TLS1 --> Cache
TLS2 --> Cache

StatCalc --> DB
VerProc --> DB
NotQueue --> Email

TLS1 --> TrustChain
TLS2 --> TrustChain

@enduml
```

## Summary

These UML diagrams provide a comprehensive view of the Travel Logbook system architecture:

1. **Class Diagram**: Shows the core domain models and their relationships
2. **Sequence Diagrams**: Illustrate the flow of key user interactions
3. **Use Case Diagram**: Maps out user roles and system functionality
4. **Activity Diagrams**: Detail the step-by-step processes for key workflows
5. **State Diagrams**: Show the lifecycle of travel entries and connections
6. **Component Diagram**: Depicts the system's architectural components
7. **Deployment Diagram**: Shows how components are distributed across infrastructure

These diagrams serve as technical documentation for developers and architects working on the Travel Logbook feature, ensuring a clear understanding of system design, user flows, and component interactions.