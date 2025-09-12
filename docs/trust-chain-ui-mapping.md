# Trust Chain UI Component Mapping

## 🎯 Exact Integration Points Based on Current Code

Based on the analysis of the current Berse app codebase, here's the precise mapping of where Trust Chain features will be integrated:

---

## 📱 1. Profile Screen Enhancements

### Current File: `frontend/src/screens/ProfileScreen.tsx`

#### A. Trust Score Widget Integration
**Location**: After line 270 (before bottom navigation)

```tsx
// ADD: Trust Score Card
<TrustScoreSection>
  <TrustScoreCard>
    <TrustHeader>
      <TrustBadge level="scout">🎯</TrustBadge>
      <TrustLevel>Scout Level</TrustLevel>
      <TrustScore>72%</TrustScore>
    </TrustHeader>
    
    <TrustBreakdown>
      <ScoreBreakdownItem>
        <ScoreLabel>Trust Chain</ScoreLabel>
        <ScoreBar value={35} max={40} />
        <ScoreValue>35/40%</ScoreValue>
      </ScoreBreakdownItem>
      
      <ScoreBreakdownItem>
        <ScoreLabel>Trust Moments</ScoreLabel>
        <ScoreBar value={22} max={30} />
        <ScoreValue>22/30%</ScoreValue>
      </ScoreBreakdownItem>
      
      <ScoreBreakdownItem>
        <ScoreLabel>Activity</ScoreLabel>
        <ScoreBar value={15} max={30} />
        <ScoreValue>15/30%</ScoreValue>
      </ScoreBreakdownItem>
    </TrustBreakdown>
    
    <ViewDetailsButton onClick={() => navigate('/trust-analytics')}>
      View Trust Details
    </ViewDetailsButton>
  </TrustScoreCard>
</TrustScoreSection>
```

#### B. Trust Chain Display
**Location**: Replace or enhance existing connections section

```tsx
// REPLACE existing connections with Trust Chain
<TrustChainSection>
  <SectionHeader>
    <SectionTitle>🔗 Trust Chain (3/6)</SectionTitle>
    <ManageButton onClick={() => setShowTrustChainManager(true)}>
      Manage
    </ManageButton>
  </SectionHeader>
  
  <TrustChainGrid>
    {/* Primary Vouch */}
    <VouchCard primary>
      <VouchBadge>Primary</VouchBadge>
      <VoucherAvatar src={primaryVouch.avatar}>
        {primaryVouch.name[0]}
      </VoucherAvatar>
      <VoucherInfo>
        <VoucherName>{primaryVouch.name}</VoucherName>
        <VouchDate>Vouched 2 months ago</VouchDate>
        <MutualConnections>
          3 mutual connections
        </MutualConnections>
      </VoucherInfo>
      <VouchWeight>40%</VouchWeight>
    </VouchCard>
    
    {/* Secondary Vouches */}
    {secondaryVouches.map(vouch => (
      <VouchCard key={vouch.id}>
        <VoucherAvatar>{vouch.name[0]}</VoucherAvatar>
        <VoucherName>{vouch.name}</VoucherName>
        <VouchWeight>10%</VouchWeight>
      </VouchCard>
    ))}
    
    {/* Empty Slots */}
    {emptyVouchSlots.map(slot => (
      <EmptyVouchSlot key={slot.id}>
        <PlusIcon />
        <SlotLabel>Request Vouch</SlotLabel>
      </EmptyVouchSlot>
    ))}
  </TrustChainGrid>
</TrustChainSection>
```

#### C. Trust Moments Section
**Location**: After Trust Chain section

```tsx
// ADD: Trust Moments Grid
<TrustMomentsSection>
  <SectionHeader>
    <SectionTitle>⭐ Trust Moments (24)</SectionTitle>
    <ViewAllButton onClick={() => navigate('/trust-moments')}>
      View All
    </ViewAllButton>
  </SectionHeader>
  
  <MomentsGrid>
    {recentTrustMoments.slice(0, 6).map(moment => (
      <TrustMomentCard key={moment.id}>
        <MomentHeader>
          <GiverAvatar>{moment.giver.name[0]}</GiverAvatar>
          <EventBadge>
            <EventIcon />
            {moment.event?.title || 'Direct interaction'}
          </EventBadge>
        </MomentHeader>
        
        <MomentContent>
          <StarRating rating={moment.rating} size="small" />
          <MomentText>{moment.feedback}</MomentText>
        </MomentContent>
        
        <MomentFooter>
          <TimeAgo>{formatTimeAgo(moment.createdAt)}</TimeAgo>
          <MomentTags>
            {moment.tags.map(tag => (
              <MomentTag key={tag}>{tag}</MomentTag>
            ))}
          </MomentTags>
        </MomentFooter>
      </TrustMomentCard>
    ))}
  </MomentsGrid>
</TrustMomentsSection>
```

---

## ✏️ 2. Edit Profile Screen Enhancements

### Current File: `frontend/src/screens/EditProfileScreen.tsx`

#### A. Trust Chain Management Tab
**Location**: Add new section after existing profile editing sections (around line 400)

```tsx
// ADD: Trust Management Section
<TrustManagementSection>
  <SectionTitle>🔗 Trust Chain Management</SectionTitle>
  
  <CurrentTrustStatus>
    <TrustProgressCard>
      <ProgressHeader>
        <CurrentScore>72%</CurrentScore>
        <NextMilestone>28% to Leader Level</NextMilestone>
      </ProgressHeader>
      <ProgressBar value={72} />
    </TrustProgressCard>
  </CurrentTrustStatus>
  
  <VouchManagement>
    <VouchSectionTitle>Your Vouchers (3/6)</VouchSectionTitle>
    
    {/* Primary Vouch Slot */}
    <PrimaryVouchSlot>
      {primaryVouch ? (
        <ExistingVouchCard vouch={primaryVouch} type="primary" />
      ) : (
        <RequestVouchCard 
          type="primary" 
          weight="40%"
          onClick={() => openVouchRequestModal('primary')}
        />
      )}
    </PrimaryVouchSlot>
    
    {/* Secondary Vouch Slots */}
    <SecondaryVouchGrid>
      {Array.from({ length: 3 }, (_, index) => (
        <VouchSlot key={index}>
          {secondaryVouches[index] ? (
            <ExistingVouchCard 
              vouch={secondaryVouches[index]} 
              type="secondary" 
            />
          ) : (
            <RequestVouchCard 
              type="secondary"
              weight="10%"
              onClick={() => openVouchRequestModal('secondary')}
            />
          )}
        </VouchSlot>
      ))}
    </SecondaryVouchGrid>
  </VouchManagement>
  
  <CommunityVouchManagement>
    <VouchSectionTitle>Community Vouches (1/2)</VouchSectionTitle>
    
    <CommunityVouchGrid>
      {communityVouches.map(community => (
        <CommunityVouchCard key={community.id}>
          <CommunityLogo src={community.logo} />
          <CommunityInfo>
            <CommunityName>{community.name}</CommunityName>
            <VerificationStatus verified={community.verified} />
          </CommunityInfo>
          <VouchWeight>10%</VouchWeight>
          <RemoveButton onClick={() => removeCommunityVouch(community.id)} />
        </CommunityVouchCard>
      ))}
      
      {communityVouches.length < 2 && (
        <AddCommunityCard onClick={() => openCommunitySearchModal()}>
          <PlusIcon />
          <AddCommunityText>Join Community</AddCommunityText>
        </AddCommunityCard>
      )}
    </CommunityVouchGrid>
  </CommunityVouchManagement>
</TrustManagementSection>
```

---

## 🤝 3. BerseMatch Page Enhancement

### Current File: `frontend/src/pages/BerseMatch/index.tsx`

#### A. Trust Moments Button Addition
**Location**: Line 204 - Modify existing button group in connection cards

```tsx
// MODIFY: Existing button group (lines 203-218)
<Box display="flex" gap={2} flexWrap="wrap">
  <Button 
    variant="outlined" 
    startIcon={<FaUserFriends />}
    size="small"
    onClick={() => handleConnect(connection.id)}
  >
    Connect
  </Button>
  
  <Button 
    variant="contained" 
    startIcon={<FaPlusCircle />}
    size="small"
    onClick={() => handleIntroduce(connection.id)}
  >
    Introduce
  </Button>
  
  {/* NEW: Trust Moment Button */}
  <Button 
    variant="outlined" 
    startIcon={<FaStar />}
    size="small"
    color="warning"
    onClick={() => openTrustMomentModal(connection.id)}
    disabled={!canGiveTrustMoment(connection)}
  >
    Trust Moment
  </Button>
</Box>
```

#### B. Trust Score Display Enhancement
**Location**: Line 177 - Modify existing match percentage display

```tsx
// MODIFY: Existing match display (lines 176-189)
<Box display="flex" alignItems="center" gap={1} mb={1}>
  <Box display="flex" alignItems="center" gap={1}>
    <Typography variant="body2" fontWeight="bold" color="primary">
      {connection.match}% Match
    </Typography>
    
    {/* NEW: Trust Badge */}
    <TrustBadge level={connection.trustLevel} size="small" />
    
    {/* NEW: Trust Score */}
    <Typography variant="body2" color="success.main">
      Trust: {connection.trustScore}%
    </Typography>
  </Box>
  
  <Box display="flex" gap={0.5}>
    {[1,2,3,4,5].map(i => (
      <FaStar 
        key={i} 
        fontSize="small" 
        style={{ 
          color: i <= Math.floor(connection.match/20) ? '#ffd700' : '#e0e0e0' 
        }}
      />
    ))}
  </Box>
</Box>
```

#### C. Trust Filter Options
**Location**: Line 122 - Add to connection modes array

```tsx
// MODIFY: Add trust-based filtering to connectionModes (lines 73-78)
const connectionModes = [
  { id: 'guides', label: 'Local Guides', icon: FaMapMarkerAlt, description: 'Find local guides and city experts' },
  { id: 'homesurf', label: 'HomeSurf', icon: FaHome, description: 'Connect with homestay hosts' },
  { id: 'mentor', label: 'Mentors', icon: FaChalkboardTeacher, description: 'Find industry mentors' },
  { id: 'buddy', label: 'Study Buddy', icon: FaUserFriends, description: 'Connect with student buddies' },
  // NEW: Trust-based modes
  { id: 'trusted', label: 'Highly Trusted', icon: FaStar, description: 'Connect with verified trusted members' },
  { id: 'vouch-eligible', label: 'Can Vouch', icon: FaCheck, description: 'People who can vouch for you' },
];
```

---

## 🎪 4. BerseConnect Event Enhancement

### Current File: `frontend/src/pages/BerseConnect/index.tsx`

#### A. Trust Rewards Display
**Location**: Add to event cards around line 400 (in event rendering section)

```tsx
// ADD: Trust rewards section to event cards
<EventCard>
  {/* Existing event content */}
  
  {/* NEW: Trust Rewards Section */}
  <TrustRewardsSection>
    <TrustRewardChip>
      <StarIcon fontSize="small" />
      <ChipText>Earn Trust Moments</ChipText>
    </TrustRewardChip>
    
    <TrustPointsDisplay>
      +{event.trustPoints} Trust Points
    </TrustPointsDisplay>
    
    {event.attendeeCount > 5 && (
      <HighTrustBonusChip>
        <TrophyIcon fontSize="small" />
        <BonusText>High Trust Bonus Available</BonusText>
      </HighTrustBonusChip>
    )}
  </TrustRewardsSection>
  
  {/* Existing event actions */}
</EventCard>
```

#### B. Enhanced Event Join Handler
**Location**: Modify event joining logic to sync with MyEvents

```tsx
// MODIFY: Event join handler
const handleJoinEvent = async (event: Event) => {
  try {
    setLoading(event.id);
    
    // Existing join logic
    await eventService.joinEvent(event.id);
    
    // NEW: Auto-add to MyEvents with trust tracking
    await myEventsService.addToMyEvents(event.id, {
      source: 'BerseConnect',
      joinedAt: new Date(),
      trustMomentsEnabled: true,
      expectedTrustPoints: event.trustPoints,
      category: event.category
    });
    
    // NEW: Show trust-aware success message
    setSnackbar({
      open: true,
      message: `Joined ${event.title}! You can earn trust moments from other attendees.`,
      severity: 'success'
    });
    
    // Update event state
    setEvents(prev => 
      prev.map(e => 
        e.id === event.id 
          ? { ...e, userJoined: true, currentParticipants: e.currentParticipants + 1 }
          : e
      )
    );
    
  } catch (error) {
    console.error('Failed to join event:', error);
    setSnackbar({
      open: true,
      message: 'Failed to join event. Please try again.',
      severity: 'error'
    });
  } finally {
    setLoading(null);
  }
};
```

#### C. Post-Event Trust Moment Modal
**Location**: Add new modal component triggered after event completion

```tsx
// NEW: Post-Event Trust Moment Collection Modal
<PostEventTrustModal 
  open={showPostEventModal}
  onClose={() => setShowPostEventModal(false)}
  event={selectedEvent}
>
  <ModalHeader>
    <EventIcon />
    <ModalTitle>{selectedEvent?.title} Complete!</ModalTitle>
    <ModalSubtitle>Share your experience with attendees</ModalSubtitle>
  </ModalHeader>
  
  <AttendeesList>
    <AttendeesSectionTitle>
      Give Trust Moments ({attendees.length} attendees)
    </AttendeesSectionTitle>
    
    {attendees.map(attendee => (
      <AttendeeCard key={attendee.id}>
        <AttendeeAvatar src={attendee.avatar}>
          {attendee.name[0]}
        </AttendeeAvatar>
        
        <AttendeeInfo>
          <AttendeeName>{attendee.name}</AttendeeName>
          <AttendeeLevel>
            <TrustBadge level={attendee.trustLevel} size="small" />
          </AttendeeLevel>
        </AttendeeInfo>
        
        <TrustMomentActions>
          <QuickRatingButtons>
            {[1, 2, 3, 4, 5].map(rating => (
              <QuickRatingButton
                key={rating}
                active={attendee.selectedRating === rating}
                onClick={() => selectRating(attendee.id, rating)}
              >
                <StarIcon />
              </QuickRatingButton>
            ))}
          </QuickRatingButtons>
          
          <FeedbackInput
            placeholder="What made this person trustworthy?"
            value={attendee.feedback}
            onChange={(e) => updateFeedback(attendee.id, e.target.value)}
          />
          
          <SubmitTrustMomentButton
            disabled={!attendee.selectedRating}
            onClick={() => submitTrustMoment(attendee.id)}
          >
            Submit Trust Moment
          </SubmitTrustMomentButton>
        </TrustMomentActions>
      </AttendeeCard>
    ))}
  </AttendeesList>
  
  <ModalActions>
    <SkipButton onClick={() => setShowPostEventModal(false)}>
      Skip for now
    </SkipButton>
    <FinishButton onClick={handleFinishEvent}>
      Finish & Update Score
    </FinishButton>
  </ModalActions>
</PostEventTrustModal>
```

---

## 🎯 5. New Trust Chain Components to Create

### File Structure:
```
frontend/src/components/Trust/
├── index.ts                     # Export all trust components
├── TrustScoreCard.tsx          # Main trust score display
├── TrustChainManager.tsx       # Vouch management interface
├── VouchRequestModal.tsx       # Request vouch dialog
├── TrustMomentModal.tsx        # Give trust moment dialog
├── TrustBadge.tsx             # Trust level badge
├── TrustAnalytics.tsx         # Trust score breakdown
├── TrustChainGraph.tsx        # Network visualization
├── AccountabilityAlert.tsx    # Accountability notifications
├── CommunitySearchModal.tsx   # Community joining modal
└── PostEventTrustModal.tsx    # Post-event trust collection
```

### A. TrustScoreCard Component
```tsx
// frontend/src/components/Trust/TrustScoreCard.tsx
interface TrustScoreCardProps {
  trustScore: TrustScore;
  showDetails?: boolean;
  size?: 'small' | 'medium' | 'large';
  onViewDetails?: () => void;
}

const TrustScoreCard: React.FC<TrustScoreCardProps> = ({
  trustScore,
  showDetails = true,
  size = 'medium',
  onViewDetails
}) => {
  return (
    <StyledTrustCard size={size}>
      <TrustHeader>
        <TrustBadge level={trustScore.level} size={size} />
        <TrustInfo>
          <TrustLevel>{trustScore.levelName}</TrustLevel>
          <TrustPercentage>{trustScore.totalScore}%</TrustPercentage>
        </TrustInfo>
      </TrustHeader>
      
      {showDetails && (
        <TrustBreakdown>
          <BreakdownItem>
            <Label>Trust Chain</Label>
            <ProgressBar 
              value={trustScore.vouchScore} 
              max={40} 
              color="primary" 
            />
            <Value>{trustScore.vouchScore}/40%</Value>
          </BreakdownItem>
          
          <BreakdownItem>
            <Label>Trust Moments</Label>
            <ProgressBar 
              value={trustScore.momentScore} 
              max={30} 
              color="warning" 
            />
            <Value>{trustScore.momentScore}/30%</Value>
          </BreakdownItem>
          
          <BreakdownItem>
            <Label>Activity</Label>
            <ProgressBar 
              value={trustScore.activityScore} 
              max={30} 
              color="success" 
            />
            <Value>{trustScore.activityScore}/30%</Value>
          </BreakdownItem>
        </TrustBreakdown>
      )}
      
      {onViewDetails && (
        <ViewDetailsButton onClick={onViewDetails}>
          View Details
        </ViewDetailsButton>
      )}
    </StyledTrustCard>
  );
};
```

### B. TrustMomentModal Component
```tsx
// frontend/src/components/Trust/TrustMomentModal.tsx
interface TrustMomentModalProps {
  open: boolean;
  onClose: () => void;
  receiverId: string;
  eventId?: string;
  onSubmit: (momentData: CreateTrustMomentData) => Promise<void>;
}

const TrustMomentModal: React.FC<TrustMomentModalProps> = ({
  open,
  onClose,
  receiverId,
  eventId,
  onSubmit
}) => {
  const [rating, setRating] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  return (
    <Modal open={open} onClose={onClose}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Give Trust Moment</ModalTitle>
          <CloseButton onClick={onClose} />
        </ModalHeader>
        
        <ReceiverInfo>
          {/* Receiver profile info */}
        </ReceiverInfo>
        
        <TrustMomentForm>
          <RatingSection>
            <RatingLabel>How was your experience?</RatingLabel>
            <StarRating 
              rating={rating} 
              onChange={setRating}
              size="large"
            />
          </RatingSection>
          
          <FeedbackSection>
            <FeedbackLabel>What made them trustworthy?</FeedbackLabel>
            <FeedbackTextArea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Share specific examples of their trustworthy behavior..."
              maxLength={500}
            />
          </FeedbackSection>
          
          <TagsSection>
            <TagsLabel>Add tags</TagsLabel>
            <TagsGrid>
              {TRUST_MOMENT_TAGS.map(tag => (
                <TagChip
                  key={tag}
                  selected={selectedTags.includes(tag)}
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </TagChip>
              ))}
            </TagsGrid>
          </TagsSection>
        </TrustMomentForm>
        
        <ModalActions>
          <CancelButton onClick={onClose}>Cancel</CancelButton>
          <SubmitButton 
            onClick={handleSubmit}
            disabled={rating === 0 || isSubmitting}
            loading={isSubmitting}
          >
            Submit Trust Moment
          </SubmitButton>
        </ModalActions>
      </ModalContent>
    </Modal>
  );
};
```

---

## 🔄 State Management Integration

### A. Trust Context Addition
```tsx
// frontend/src/contexts/TrustContext.tsx
const TrustContext = createContext<TrustContextType | null>(null);

export const TrustProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const { user } = useAuth();
  const [trustScore, setTrustScore] = useState<TrustScore | null>(null);
  const [trustChain, setTrustChain] = useState<TrustChain[]>([]);
  const [trustMoments, setTrustMoments] = useState<TrustMoment[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Trust management methods
  const requestVouch = async (targetUserId: string, message: string) => {
    // Implementation
  };
  
  const giveTrustMoment = async (receiverId: string, momentData: CreateTrustMomentData) => {
    // Implementation
  };
  
  // Auto-refresh trust data
  useEffect(() => {
    if (user?.id) {
      refreshTrustData();
    }
  }, [user?.id]);
  
  const value = {
    trustScore,
    trustChain,
    trustMoments,
    loading,
    requestVouch,
    giveTrustMoment,
    refreshTrustData
  };
  
  return (
    <TrustContext.Provider value={value}>
      {children}
    </TrustContext.Provider>
  );
};
```

### B. Navigation Updates
**Location**: `frontend/src/components/MainNav/MainNav.tsx`

```tsx
// ADD: Trust-related navigation items
const navigationItems = [
  // ... existing items
  {
    label: 'Trust Score',
    path: '/trust-analytics',
    icon: <TrustBadgeIcon />,
    badge: trustScore?.level
  }
];
```

---

## 📊 Integration Summary

### Files to Modify:
1. ✅ `ProfileScreen.tsx` - Add trust score and chain display
2. ✅ `EditProfileScreen.tsx` - Add trust chain management
3. ✅ `BerseMatch/index.tsx` - Add trust moments and filters  
4. ✅ `BerseConnect/index.tsx` - Add trust rewards and MyEvents sync
5. ✅ `MainNav.tsx` - Add trust navigation

### New Files to Create:
1. ✅ Trust components (8 new components)
2. ✅ Trust context and hooks
3. ✅ Trust service layer
4. ✅ Trust-related types and interfaces

### Integration Benefits:
- **Minimal UI Disruption**: Works with existing design system
- **Progressive Enhancement**: Features can be enabled gradually  
- **Consistent UX**: Follows established patterns in the app
- **Mobile-First**: Optimized for the existing mobile layout
- **Performance**: Lazy loading and optimistic updates

This mapping provides exact locations and code modifications needed to integrate Trust Chain functionality seamlessly into the existing Berse app architecture.