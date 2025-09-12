# Trust Chain UML Diagrams

## 1. Use Case Diagram - Trust Chain System

```mermaid
graph TB
    subgraph "Berse Trust Chain System"
        UC1[Create Profile]
        UC2[Request Vouch]
        UC3[Approve/Reject Vouch]
        UC4[Join Community]
        UC5[Attend Event]
        UC6[Give Trust Moment]
        UC7[View Trust Score]
        UC8[Host/Be Hosted]
        UC9[Report Violation]
        UC10[Manage Vouch Limits]
    end
    
    Actor1[New User]
    Actor2[Verified User]
    Actor3[Community Admin]
    Actor4[Platform Admin]
    
    Actor1 --> UC1
    Actor1 --> UC2
    Actor2 --> UC3
    Actor2 --> UC5
    Actor2 --> UC6
    Actor2 --> UC8
    Actor1 --> UC4
    Actor1 --> UC7
    Actor2 --> UC7
    Actor2 --> UC9
    Actor3 --> UC4
    Actor3 --> UC9
    Actor4 --> UC10
    Actor4 --> UC9
```

## 2. Class Diagram - Trust Chain Domain Model

```mermaid
classDiagram
    class User {
        +String userId
        +String email
        +String phoneNumber
        +Profile profile
        +TrustScore trustScore
        +TrustLevel trustLevel
        +Date joinedDate
        +Boolean isVerified
        +calculateTrustScore()
        +requestVouch()
        +giveVouch()
    }
    
    class TrustScore {
        +Float totalScore
        +Float vouchScore
        +Float momentScore
        +Float activityScore
        +Date lastUpdated
        +updateScore()
        +getBreakdown()
    }
    
    class TrustChain {
        +String chainId
        +User voucher
        +User vouchee
        +VouchType type
        +Float weight
        +Date createdAt
        +Boolean isActive
        +approve()
        +revoke()
        +calculateImpact()
    }
    
    class VouchRequest {
        +String requestId
        +User requester
        +User requestee
        +String message
        +RequestStatus status
        +Date requestedAt
        +Date respondedAt
        +approve()
        +reject()
        +expire()
    }
    
    class TrustMoment {
        +String momentId
        +User giver
        +User receiver
        +Event event
        +Integer rating
        +String feedback
        +MomentType type
        +Date createdAt
        +validate()
    }
    
    class Community {
        +String communityId
        +String name
        +CommunityType type
        +TrustWeight weight
        +List~User~ members
        +User admin
        +Date established
        +verifyMember()
        +vouchForMember()
    }
    
    class Event {
        +String eventId
        +String title
        +EventType type
        +Location location
        +Date dateTime
        +List~User~ attendees
        +User organizer
        +Integer trustPoints
        +checkIn()
        +generateMoments()
    }
    
    class TrustLevel {
        +String levelName
        +Integer minScore
        +Integer maxScore
        +Integer vouchLimit
        +List~Feature~ unlockedFeatures
        +checkEligibility()
    }
    
    User "1" --> "1" TrustScore : has
    User "1" --> "0..3" TrustChain : vouches
    User "1" --> "0..3" TrustChain : vouchedBy
    User "1" --> "*" VouchRequest : sends
    User "1" --> "*" VouchRequest : receives
    User "1" --> "*" TrustMoment : gives
    User "1" --> "*" TrustMoment : receives
    User "*" --> "0..2" Community : joins
    User "*" --> "*" Event : attends
    User "1" --> "1" TrustLevel : has
    Event "1" --> "*" TrustMoment : generates
    Community "1" --> "*" User : vouches
```

## 3. Sequence Diagram - Vouch Request Flow

```mermaid
sequenceDiagram
    participant U1 as User A
    participant S as System
    participant DB as Database
    participant U2 as User B
    participant N as Notification
    
    U1->>S: Request vouch from User B
    S->>DB: Check User B vouch capacity
    DB-->>S: Return capacity (2/3 used)
    S->>DB: Check existing relationship
    DB-->>S: No existing vouch
    S->>DB: Create VouchRequest
    DB-->>S: Request created
    S->>N: Send notification to User B
    N->>U2: "User A requested vouch"
    
    U2->>S: View User A profile
    S->>DB: Get User A trust data
    DB-->>S: Return trust history
    S-->>U2: Display profile & trust
    
    U2->>S: Approve vouch
    S->>DB: Create TrustChain record
    DB-->>S: Chain created
    S->>DB: Update User A trust score
    DB-->>S: Score updated
    S->>DB: Update User B accountability
    DB-->>S: Accountability linked
    
    S->>N: Notify User A
    N->>U1: "Vouch approved!"
    S-->>U2: Confirmation
```

## 4. Activity Diagram - Trust Building Journey

```mermaid
graph TD
    Start([User Joins Platform]) --> CreateProfile[Create Profile]
    CreateProfile --> Decision1{Has Referral?}
    Decision1 -->|Yes| InheritTrust[Inherit 40% Trust]
    Decision1 -->|No| ZeroTrust[Start with 0% Trust]
    
    InheritTrust --> RequestVouches
    ZeroTrust --> RequestVouches[Request Vouches]
    
    RequestVouches --> Decision2{Vouch Approved?}
    Decision2 -->|No| RequestVouches
    Decision2 -->|Yes| UpdateTrust1[Update Trust Score]
    
    UpdateTrust1 --> Decision3{3 Vouches?}
    Decision3 -->|No| RequestVouches
    Decision3 -->|Yes| JoinCommunity[Join Communities]
    
    JoinCommunity --> Decision4{Community Verified?}
    Decision4 -->|No| JoinCommunity
    Decision4 -->|Yes| UpdateTrust2[Add Community Trust]
    
    UpdateTrust2 --> AttendEvents[Attend Events]
    AttendEvents --> EarnMoments[Earn Trust Moments]
    EarnMoments --> UpdateTrust3[Update Activity Score]
    
    UpdateTrust3 --> Decision5{Trust > 70%?}
    Decision5 -->|No| AttendEvents
    Decision5 -->|Yes| UnlockFeatures[Unlock Premium Features]
    
    UnlockFeatures --> BecomeVoucher[Can Vouch for Others]
    BecomeVoucher --> End([Trusted Member])
```

## 5. State Machine Diagram - User Trust States

```mermaid
stateDiagram-v2
    [*] --> UNVERIFIED: Account Created
    
    UNVERIFIED --> PENDING: Request First Vouch
    PENDING --> PARTIAL: First Vouch Approved
    PENDING --> UNVERIFIED: Vouch Rejected
    
    PARTIAL --> PARTIAL: Additional Vouches
    PARTIAL --> VERIFIED: 3 Vouches + 1 Community
    
    VERIFIED --> TRUSTED: Trust Score > 70%
    TRUSTED --> LEADER: Trust Score > 90% + High Activity
    
    VERIFIED --> SUSPENDED: Violation Reported
    TRUSTED --> SUSPENDED: Violation Reported
    LEADER --> SUSPENDED: Violation Reported
    
    SUSPENDED --> BANNED: Violation Confirmed
    SUSPENDED --> VERIFIED: Appeal Successful
    SUSPENDED --> TRUSTED: Appeal Successful
    
    BANNED --> [*]: Account Terminated
    
    state VERIFIED {
        [*] --> Active
        Active --> Inactive: No Activity 30 days
        Inactive --> Active: Any Activity
        Inactive --> Dormant: No Activity 90 days
    }
    
    state TRUSTED {
        [*] --> Growing
        Growing --> Stable: Consistent Score
        Stable --> Growing: Score Increase
        Stable --> Declining: Score Decrease
    }
```

## 6. Component Diagram - System Architecture

```mermaid
graph TB
    subgraph "Frontend Layer"
        Web[Web App]
        Mobile[Mobile App]
    end
    
    subgraph "API Gateway"
        Gateway[API Gateway]
        Auth[Auth Service]
    end
    
    subgraph "Core Services"
        TrustEngine[Trust Engine Service]
        VouchService[Vouch Service]
        EventService[Event Service]
        CommunityService[Community Service]
        NotificationService[Notification Service]
    end
    
    subgraph "Data Layer"
        UserDB[(User Database)]
        TrustDB[(Trust Database)]
        EventDB[(Event Database)]
        Cache[(Redis Cache)]
    end
    
    subgraph "External Services"
        SMS[SMS Service]
        Email[Email Service]
        Analytics[Analytics]
    end
    
    Web --> Gateway
    Mobile --> Gateway
    Gateway --> Auth
    Auth --> TrustEngine
    
    TrustEngine --> VouchService
    TrustEngine --> EventService
    TrustEngine --> CommunityService
    
    VouchService --> NotificationService
    EventService --> NotificationService
    
    VouchService --> TrustDB
    EventService --> EventDB
    CommunityService --> UserDB
    TrustEngine --> Cache
    
    NotificationService --> SMS
    NotificationService --> Email
    TrustEngine --> Analytics
```

## 7. Communication Diagram - Trust Moment Exchange

```mermaid
graph LR
    subgraph "Event Context"
        Event[Event: Meetup]
        U1[User A: Attendee]
        U2[User B: Attendee]
    end
    
    subgraph "Trust Exchange"
        U1 -->|1: Attend| Event
        U2 -->|2: Attend| Event
        U1 -->|3: Give Trust Moment| U2
        U2 -->|4: Give Trust Moment| U1
    end
    
    subgraph "System Processing"
        Event -->|5: Validate Attendance| System[Trust System]
        System -->|6: Record Moments| Database[(Database)]
        System -->|7: Update Scores| U1
        System -->|8: Update Scores| U2
    end
```

## 8. Deployment Diagram - Infrastructure

```mermaid
graph TB
    subgraph "Client Tier"
        Browser[Web Browser]
        MobileApp[Mobile App]
    end
    
    subgraph "CDN"
        CloudFlare[CloudFlare CDN]
    end
    
    subgraph "Application Tier"
        LB[Load Balancer]
        Server1[App Server 1]
        Server2[App Server 2]
        Server3[App Server 3]
    end
    
    subgraph "Service Tier"
        TrustAPI[Trust API]
        EventAPI[Event API]
        NotifyAPI[Notification API]
    end
    
    subgraph "Data Tier"
        Primary[(Primary DB)]
        Replica1[(Replica 1)]
        Replica2[(Replica 2)]
        RedisCache[(Redis Cache)]
    end
    
    subgraph "External"
        Twilio[Twilio SMS]
        SendGrid[SendGrid Email]
    end
    
    Browser --> CloudFlare
    MobileApp --> CloudFlare
    CloudFlare --> LB
    LB --> Server1
    LB --> Server2
    LB --> Server3
    
    Server1 --> TrustAPI
    Server2 --> EventAPI
    Server3 --> NotifyAPI
    
    TrustAPI --> Primary
    EventAPI --> Primary
    NotifyAPI --> RedisCache
    
    Primary --> Replica1
    Primary --> Replica2
    
    NotifyAPI --> Twilio
    NotifyAPI --> SendGrid
```

## 9. Package Diagram - Module Organization

```mermaid
graph TD
    subgraph "Core Domain"
        UserPackage[user]
        TrustPackage[trust]
        EventPackage[event]
        CommunityPackage[community]
    end
    
    subgraph "Application Services"
        AuthService[authentication]
        VouchService[vouching]
        ScoringService[scoring]
        NotificationService[notifications]
    end
    
    subgraph "Infrastructure"
        DatabaseLayer[database]
        CacheLayer[cache]
        MessageQueue[messaging]
        ExternalAPIs[external]
    end
    
    subgraph "API Layer"
        RestAPI[rest-api]
        GraphQL[graphql]
        WebSocket[websocket]
    end
    
    subgraph "Shared"
        Utils[utilities]
        Constants[constants]
        Types[types]
    end
    
    RestAPI --> AuthService
    RestAPI --> VouchService
    GraphQL --> ScoringService
    WebSocket --> NotificationService
    
    AuthService --> UserPackage
    VouchService --> TrustPackage
    ScoringService --> TrustPackage
    NotificationService --> EventPackage
    
    UserPackage --> DatabaseLayer
    TrustPackage --> CacheLayer
    EventPackage --> MessageQueue
    CommunityPackage --> DatabaseLayer
    
    NotificationService --> ExternalAPIs
    
    UserPackage --> Types
    TrustPackage --> Utils
    EventPackage --> Constants
```

## 10. Timing Diagram - Trust Score Update Lifecycle

```mermaid
sequenceDiagram
    participant User
    participant Event
    participant TrustEngine
    participant Cache
    participant Database
    participant Analytics
    
    User->>Event: Check-in at Event
    Event->>TrustEngine: Trigger Trust Update
    
    TrustEngine->>Cache: Get Current Score
    Cache-->>TrustEngine: Score: 65%
    
    TrustEngine->>Database: Get Trust Components
    Database-->>TrustEngine: Vouches, Moments, Activity
    
    TrustEngine->>TrustEngine: Calculate New Score
    Note over TrustEngine: Vouches: 40%<br/>Moments: 25%<br/>Activity: 35%<br/>Total: 68%
    
    TrustEngine->>Cache: Update Cache
    TrustEngine->>Database: Persist Score
    TrustEngine->>Analytics: Log Score Change
    
    TrustEngine-->>Event: Score Updated
    Event-->>User: New Trust: 68%
    
    Note over User: Trust Level Up!
```

---

## Summary

These UML diagrams comprehensively model the Berse Trust Chain system:

1. **Use Case Diagram**: Shows all actor interactions with the system
2. **Class Diagram**: Defines the domain model and relationships
3. **Sequence Diagram**: Details the vouch request flow
4. **Activity Diagram**: Maps the trust building journey
5. **State Machine**: Defines user trust state transitions
6. **Component Diagram**: Shows system architecture
7. **Communication Diagram**: Illustrates trust moment exchange
8. **Deployment Diagram**: Infrastructure layout
9. **Package Diagram**: Code organization structure
10. **Timing Diagram**: Trust score update lifecycle

Each diagram serves a specific purpose in documenting the Trust Chain mechanism, from user interactions to technical implementation details.