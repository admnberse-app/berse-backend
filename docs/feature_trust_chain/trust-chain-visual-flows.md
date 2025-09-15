# Trust Chain Visual Flow Diagrams

## 1. Master Trust Chain Flow

```mermaid
flowchart TB
    Start([New User Joins]) --> ProfileSetup[Setup Profile]
    ProfileSetup --> CheckReferral{Has Referral?}
    
    CheckReferral -->|Yes| InheritTrust[Inherit 40% Trust from Referrer]
    CheckReferral -->|No| StartZero[Start with 0% Trust]
    
    InheritTrust --> RequestVouches
    StartZero --> RequestVouches[Request Vouches]
    
    RequestVouches --> VouchSystem{Vouch System}
    
    VouchSystem --> PrimaryVouch[Primary Vouch<br/>1 person max<br/>40% weight]
    VouchSystem --> SecondaryVouches[Secondary Vouches<br/>3 people max<br/>30% weight total]
    VouchSystem --> CommunityVouches[Community Vouches<br/>2 communities max<br/>20% weight total]
    
    PrimaryVouch --> BuildTrust
    SecondaryVouches --> BuildTrust
    CommunityVouches --> BuildTrust
    
    BuildTrust[Build Trust Score] --> Activities
    
    Activities --> Events[Attend Events<br/>+Trust Moments]
    Activities --> Host[Host/Be Hosted<br/>+Trust Points]
    Activities --> Volunteer[Volunteer<br/>+Community Score]
    
    Events --> TrustMoments[Earn Trust Moments<br/>Unlimited reviews<br/>30% of score]
    Host --> TrustMoments
    Volunteer --> TrustMoments
    
    TrustMoments --> CalculateScore[Calculate Total Score]
    
    CalculateScore --> CheckLevel{Check Trust Level}
    
    CheckLevel -->|0-25%| Starter[Starter Level<br/>3 vouch limit]
    CheckLevel -->|26-50%| Trusted[Trusted Level<br/>10 vouch limit]
    CheckLevel -->|51-75%| Scout[Scout Level<br/>25 vouch limit]
    CheckLevel -->|76-100%| Leader[Leader Level<br/>100 vouch limit]
    
    Starter --> UnlockFeatures
    Trusted --> UnlockFeatures
    Scout --> UnlockFeatures
    Leader --> UnlockFeatures
    
    UnlockFeatures[Unlock Features] --> Premium{Premium Features?}
    
    Premium -->|Free Tier| FreeFeatures[Events<br/>Social<br/>Volunteer]
    Premium -->|Basic RM29.99| BasicFeatures[Travel<br/>Marketplace<br/>Communities]
    Premium -->|Premium RM49.99| PremiumFeatures[Mentorship<br/>Fundraising<br/>All Features]
    
    style InheritTrust fill:#90EE90
    style TrustMoments fill:#87CEEB
    style Leader fill:#FFD700
```

## 2. Vouch Request Detailed Flow

```mermaid
flowchart LR
    subgraph "User A (Requester)"
        A1[Browse Users]
        A2[View Profile]
        A3[Request Vouch]
        A7[Receive Notification]
        A8[Trust Updated]
    end
    
    subgraph "System Processing"
        S1{Check Capacity}
        S2{Check Relationship}
        S3[Create Request]
        S4[Send Notification]
        S5[Update Trust Score]
        S6[Link Accountability]
    end
    
    subgraph "User B (Voucher)"
        B1[Receive Request]
        B2[Review Profile]
        B3{Decision}
        B4[Approve]
        B5[Reject]
    end
    
    A1 --> A2
    A2 --> A3
    A3 --> S1
    S1 -->|Has Capacity| S2
    S1 -->|No Capacity| A7
    S2 -->|No Existing| S3
    S2 -->|Already Vouched| A7
    S3 --> S4
    S4 --> B1
    B1 --> B2
    B2 --> B3
    B3 -->|Yes| B4
    B3 -->|No| B5
    B4 --> S5
    B5 --> A7
    S5 --> S6
    S6 --> A8
    
    style B4 fill:#90EE90
    style B5 fill:#FFB6C1
    style A8 fill:#87CEEB
```

## 3. Trust Score Calculation Flow

```mermaid
flowchart TD
    subgraph "Input Sources"
        V[Vouches<br/>40%]
        M[Moments<br/>30%]
        A[Activities<br/>30%]
    end
    
    subgraph "Vouch Calculation"
        V --> V1[Primary Vouch<br/>1 × 40%]
        V --> V2[Secondary Vouches<br/>3 × 10% each]
        V --> V3[Community Vouches<br/>2 × 10% each]
        V1 --> VTotal[Vouch Total]
        V2 --> VTotal
        V3 --> VTotal
    end
    
    subgraph "Moment Calculation"
        M --> M1[Event Feedback]
        M --> M2[Host Reviews]
        M --> M3[Interaction Ratings]
        M1 --> MTotal[Moment Total<br/>Normalized 0-100]
        M2 --> MTotal
        M3 --> MTotal
    end
    
    subgraph "Activity Calculation"
        A --> A1[Events Attended]
        A --> A2[Events Organized]
        A --> A3[Volunteer Hours]
        A --> A4[Community Service]
        A1 --> ATotal[Activity Total<br/>Points System]
        A2 --> ATotal
        A3 --> ATotal
        A4 --> ATotal
    end
    
    VTotal --> Final[Final Score<br/>0-100%]
    MTotal --> Final
    ATotal --> Final
    
    Final --> Level{Determine Level}
    
    Level -->|0-25| L1[Starter]
    Level -->|26-50| L2[Trusted]
    Level -->|51-75| L3[Scout]
    Level -->|76-100| L4[Leader]
    
    style Final fill:#FFD700
    style V fill:#FF6B6B
    style M fill:#4ECDC4
    style A fill:#45B7D1
```

## 4. Accountability Chain Flow

```mermaid
flowchart TB
    subgraph "Trust Chain"
        UserA[User A<br/>Voucher]
        UserB[User B<br/>Vouchee]
        UserA -->|Vouches For| UserB
    end
    
    subgraph "User B Behavior"
        UserB --> Behavior{Behavior Type}
        Behavior -->|Positive| Good[Good Actions<br/>✓ Attend Events<br/>✓ Get Good Reviews<br/>✓ Help Others]
        Behavior -->|Negative| Bad[Bad Actions<br/>✗ Violations<br/>✗ No Shows<br/>✗ Bad Reviews]
    end
    
    subgraph "Impact on User A"
        Good --> PositiveImpact[User A Gets:<br/>+0.5% Trust Boost<br/>Reputation Increase]
        Bad --> NegativeImpact[User A Gets:<br/>-2% Trust Penalty<br/>Reputation Damage]
    end
    
    subgraph "Impact on User B"
        Good --> UserBGood[User B Gets:<br/>+1% Trust Moment<br/>Better Opportunities]
        Bad --> UserBBad[User B Gets:<br/>-5% Trust Penalty<br/>Possible Suspension]
    end
    
    PositiveImpact --> UpdateScores[Update Both Scores]
    NegativeImpact --> UpdateScores
    UserBGood --> UpdateScores
    UserBBad --> UpdateScores
    
    UpdateScores --> Cascade{Cascade Effect?}
    Cascade -->|Major Violation| SuspendChain[Suspend Entire Chain]
    Cascade -->|Minor Issue| Warning[Warning Issued]
    
    style Good fill:#90EE90
    style Bad fill:#FFB6C1
    style PositiveImpact fill:#98FB98
    style NegativeImpact fill:#FFA07A
```

## 5. Event Trust Building Flow

```mermaid
flowchart LR
    subgraph "Before Event"
        Browse[Browse Events] --> View[View Attendees]
        View --> Check[Check Mutual Trust]
        Check --> Register[Register for Event]
    end
    
    subgraph "During Event"
        Register --> Attend[Attend Event]
        Attend --> CheckIn[Check-in<br/>Location Verified]
        CheckIn --> Network[Network & Meet]
        Network --> Exchange[Exchange Contacts]
    end
    
    subgraph "After Event"
        Exchange --> GiveMoments[Give Trust Moments<br/>Within 7 days]
        GiveMoments --> ReceiveMoments[Receive Trust Moments]
        ReceiveMoments --> UpdateScore[Score Updated]
        UpdateScore --> BuildNetwork[Network Grows]
    end
    
    subgraph "Trust Rewards"
        BuildNetwork --> Rewards{Trust Level}
        Rewards -->|High| Premium[Premium Events]
        Rewards -->|Medium| Standard[Standard Events]
        Rewards -->|Low| Basic[Basic Events]
    end
    
    style CheckIn fill:#87CEEB
    style GiveMoments fill:#90EE90
    style UpdateScore fill:#FFD700
```

## 6. Community Verification Flow

```mermaid
flowchart TD
    Start([User Wants to Join Community]) --> Search[Search Communities]
    Search --> Select[Select Community<br/>Max 2 allowed]
    Select --> Apply[Apply for Membership]
    
    Apply --> AdminReview{Admin Review}
    
    AdminReview --> Verify{Verification Method}
    
    Verify -->|Document| DocCheck[Check Documents<br/>Student ID<br/>Work ID<br/>Membership Card]
    Verify -->|Member Vouch| MemberVouch[Existing Member<br/>Vouches]
    Verify -->|Physical| Physical[Attend Community<br/>Event]
    
    DocCheck --> Decision
    MemberVouch --> Decision
    Physical --> Decision
    
    Decision{Approved?}
    Decision -->|Yes| Approved[Community Vouch<br/>+10% Trust]
    Decision -->|No| Rejected[Try Another<br/>Community]
    
    Approved --> UpdateProfile[Update Profile<br/>Show Badge]
    UpdateProfile --> Benefits[Access Benefits<br/>Community Events<br/>Special Features]
    
    Rejected --> Search
    
    style Approved fill:#90EE90
    style Rejected fill:#FFB6C1
    style Benefits fill:#87CEEB
```

## 7. Trust Moment Generation Flow

```mermaid
flowchart TB
    subgraph "Interaction Types"
        Event[Event Meeting]
        Host[Hosting/Staying]
        Mentor[Mentoring Session]
        Volunteer[Volunteer Together]
    end
    
    Event --> Validate
    Host --> Validate
    Mentor --> Validate
    Volunteer --> Validate
    
    Validate{Validate Interaction}
    Validate -->|Check| V1[Both Present?]
    V1 -->|Yes| V2[Within Time Window?]
    V1 -->|No| Reject[Cannot Give Moment]
    V2 -->|Yes| V3[Not Duplicate?]
    V2 -->|No| Reject
    V3 -->|Yes| Create[Create Trust Moment]
    V3 -->|No| Reject
    
    Create --> Details[Add Details]
    Details --> Rating[Rating: 1-5 Stars]
    Details --> Feedback[Written Feedback]
    Details --> Tags[Add Tags]
    Details --> Photo[Photo Proof<br/>Optional]
    
    Rating --> Submit[Submit Moment]
    Feedback --> Submit
    Tags --> Submit
    Photo --> Submit
    
    Submit --> Process[Process Moment]
    Process --> Update[Update Receiver Score]
    Update --> Notify[Notify Receiver]
    
    Notify --> Display[Display on Profile]
    Display --> Calculate[Recalculate Trust<br/>+30% of total]
    
    style Create fill:#90EE90
    style Reject fill:#FFB6C1
    style Calculate fill:#FFD700
```

## 8. Progressive Trust Unlocking Flow

```mermaid
flowchart LR
    subgraph "Trust Progression"
        Start[0% Trust] --> T25[25% Trust]
        T25 --> T50[50% Trust]
        T50 --> T75[75% Trust]
        T75 --> T100[100% Trust]
    end
    
    subgraph "Features Unlocked"
        Start --> F1[✓ View Events<br/>✓ Basic Profile]
        T25 --> F2[✓ Join Events<br/>✓ Give Moments<br/>✓ Request Vouches]
        T50 --> F3[✓ Host/Be Hosted<br/>✓ Marketplace<br/>✓ Travel Features]
        T75 --> F4[✓ Organize Events<br/>✓ Vouch for Others<br/>✓ Mentorship]
        T100 --> F5[✓ Fundraising<br/>✓ Leadership<br/>✓ All Premium]
    end
    
    subgraph "Vouch Limits"
        Start --> V1[Can't Vouch]
        T25 --> V2[3 Vouches]
        T50 --> V3[10 Vouches]
        T75 --> V4[25 Vouches]
        T100 --> V5[100 Vouches]
    end
    
    style T100 fill:#FFD700
    style F5 fill:#90EE90
    style V5 fill:#87CEEB
```

## 9. Trust Violation & Recovery Flow

```mermaid
flowchart TD
    Normal([Normal Status]) --> Violation[Violation Reported]
    
    Violation --> Investigation{Investigate}
    
    Investigation -->|Minor| Warning[Warning Issued<br/>-5% Trust]
    Investigation -->|Major| Suspend[Account Suspended<br/>-20% Trust]
    Investigation -->|Severe| Ban[Account Banned<br/>Permanent]
    Investigation -->|False| Clear[Report Cleared<br/>No Impact]
    
    Warning --> Recovery1[Recovery Path]
    Suspend --> Appeal{Appeal?}
    
    Appeal -->|Successful| Recovery2[Recovery Path]
    Appeal -->|Failed| Extend[Extended Suspension]
    
    Recovery1 --> Actions[Positive Actions]
    Recovery2 --> Actions
    
    Actions --> Attend[Attend Events]
    Actions --> Volunteer[Volunteer Work]
    Actions --> Good[Good Reviews]
    
    Attend --> Rebuild[Rebuild Trust]
    Volunteer --> Rebuild
    Good --> Rebuild
    
    Rebuild --> Monitor[Monitored Status<br/>90 Days]
    Monitor --> Restore{Behavior OK?}
    
    Restore -->|Yes| Normal
    Restore -->|No| Suspend
    
    Clear --> Normal
    Ban --> End([Account Terminated])
    
    subgraph "Impact on Vouchers"
        Suspend --> ImpactVouchers[Vouchers Notified<br/>Trust Reduced]
        Ban --> RevokeVouches[All Vouches Revoked<br/>Chains Broken]
    end
    
    style Warning fill:#FFA07A
    style Suspend fill:#FF6347
    style Ban fill:#8B0000
    style Clear fill:#90EE90
    style Normal fill:#87CEEB
```

## 10. Complete User Lifecycle Flow

```mermaid
flowchart TB
    subgraph "Onboarding Phase"
        SignUp[Sign Up] --> Verify[Verify Phone/Email]
        Verify --> Profile[Complete Profile]
        Profile --> Referral{Has Referral?}
        Referral -->|Yes| Inherit[Inherit Trust]
        Referral -->|No| Zero[Zero Trust]
    end
    
    subgraph "Building Phase"
        Inherit --> Build
        Zero --> Build[Build Trust]
        Build --> Vouches[Get Vouches<br/>3 people max]
        Build --> Communities[Join Communities<br/>2 max]
        Build --> Events[Attend Events]
        Build --> Moments[Earn Moments<br/>Unlimited]
    end
    
    subgraph "Growth Phase"
        Vouches --> Grow
        Communities --> Grow
        Events --> Grow
        Moments --> Grow[Grow Network]
        Grow --> Host[Host Travelers]
        Grow --> Travel[Travel & Stay]
        Grow --> Organize[Organize Events]
        Grow --> Mentor[Become Mentor]
    end
    
    subgraph "Maturity Phase"
        Host --> Mature
        Travel --> Mature
        Organize --> Mature
        Mentor --> Mature[Platform Leader]
        Mature --> Vouch100[Vouch for 100]
        Mature --> Fundraise[Run Fundraisers]
        Mature --> Ambassador[Brand Ambassador]
    end
    
    subgraph "Lifecycle Events"
        Build --> Inactive{Inactive?}
        Inactive -->|30 days| Decay[Trust Decay]
        Decay --> Reactivate[Reactivation Needed]
        Reactivate --> Build
        
        Grow --> Violation{Violation?}
        Violation -->|Yes| Penalty[Trust Penalty]
        Penalty --> Recovery[Recovery Path]
        Recovery --> Build
    end
    
    style Mature fill:#FFD700
    style Ambassador fill:#90EE90
    style Penalty fill:#FFB6C1
```

## Summary Dashboard View

```mermaid
flowchart TB
    subgraph "Trust Score Breakdown"
        Score[Total Score: 72%]
        Score --> Components
        Components --> C1[Vouches: 35/40%]
        Components --> C2[Moments: 22/30%]
        Components --> C3[Activity: 15/30%]
    end
    
    subgraph "Trust Chain Status"
        Chain[Active Chains: 4/6]
        Chain --> Primary[Primary: John ✓]
        Chain --> Secondary[Secondary: Amy, Ben, Clara]
        Chain --> Community[Communities: University, Tech Club]
    end
    
    subgraph "Recent Activity"
        Activity[Last 7 Days]
        Activity --> E1[Events: 3 attended]
        Activity --> M1[Moments: 8 received]
        Activity --> V1[Vouches: 1 new request]
    end
    
    subgraph "Trust Level"
        Level[Current: Scout]
        Level --> Progress[Progress: 72/75%]
        Progress --> Next[Next: Leader at 76%]
        Next --> Unlock[Unlocks: 50 vouch limit]
    end
    
    style Score fill:#87CEEB
    style Level fill:#FFD700
    style Chain fill:#90EE90
```

---

## Visual Flow Key Features

1. **Color Coding**:
   - 🟢 Green: Positive actions/approved
   - 🔵 Blue: Neutral/informational
   - 🟡 Yellow/Gold: Achievement/premium
   - 🔴 Red/Pink: Negative/rejected

2. **Flow Types**:
   - Linear flows for sequential processes
   - Decision trees for conditional logic
   - Circular flows for recurring processes
   - Hierarchical for level progression

3. **User Perspectives**:
   - New user journey
   - Verified user capabilities
   - Community admin functions
   - Platform growth stages

These visual flows provide a comprehensive understanding of how users interact with the Trust Chain system, from onboarding to becoming platform leaders, including all accountability mechanisms and trust-building activities.