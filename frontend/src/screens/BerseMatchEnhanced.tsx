// Enhanced BerseMatch Features Component
import React from 'react';
import styled from 'styled-components';

// ====== MODALS FOR ENHANCED FEATURES ======

// 1. TRAVEL LOGBOOK MODAL
export const TravelLogbookEnhanced = ({ profile, isOpen, onClose }) => {
  if (!isOpen || !profile) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <h2>✈️ {profile.name}'s Travel Logbook</h2>
          <CloseButton onClick={onClose}>×</CloseButton>
        </ModalHeader>
        
        <TravelSection>
          <h3>Countries Visited ({profile.travelHistory?.length || 0})</h3>
          {profile.travelHistory?.map((entry, idx) => (
            <TravelCard key={idx}>
              <TravelHeader>
                <span>{entry.flag} {entry.country}</span>
                <span>{entry.dates}</span>
              </TravelHeader>
              <TravelCity>{entry.city}</TravelCity>
              <TravelPurpose>{entry.purpose}</TravelPurpose>
              
              <FriendsSection>
                <h4>Friends from {entry.country}:</h4>
                {entry.friends?.map((friend, fidx) => (
                  <FriendCard key={fidx}>
                    <FriendName>{friend}</FriendName>
                    <ConnectButton>Request Introduction</ConnectButton>
                  </FriendCard>
                ))}
              </FriendsSection>
            </TravelCard>
          ))}
        </TravelSection>
      </ModalContent>
    </ModalOverlay>
  );
};

// 2. COMMUNITIES MODAL
export const CommunitiesModal = ({ profile, isOpen, onClose }) => {
  if (!isOpen || !profile) return null;

  const communityRoles = {
    'NAMA Foundation': 'Active Member',
    'KL Photography Club': 'Event Coordinator',
    'Malaysian Architects': 'President',
    'Istanbul Tour Guides': 'Senior Guide',
    'Halal Tourism Turkey': 'Founding Member'
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <h2>👥 {profile.name}'s Communities</h2>
          <CloseButton onClick={onClose}>×</CloseButton>
        </ModalHeader>
        
        <CommunitiesGrid>
          {profile.communities?.map((community, idx) => (
            <CommunityCard key={idx}>
              <CommunityName>{community}</CommunityName>
              <CommunityRole>
                {communityRoles[community] || 'Member'}
              </CommunityRole>
              <CommunityStats>
                <div>Since 2022</div>
                <div>245 members</div>
              </CommunityStats>
              <ViewButton>View Community</ViewButton>
            </CommunityCard>
          ))}
        </CommunitiesGrid>
      </ModalContent>
    </ModalOverlay>
  );
};

// 3. EVENTS MODAL
export const EventsModal = ({ profile, isOpen, onClose }) => {
  if (!isOpen || !profile) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <h2>📅 Events {profile.name} is Attending</h2>
          <CloseButton onClick={onClose}>×</CloseButton>
        </ModalHeader>
        
        <EventsList>
          {profile.eventsAttending?.map((event, idx) => (
            <EventCard key={idx}>
              <EventName>{event}</EventName>
              <EventDate>Coming Soon</EventDate>
              <EventAction>
                <JoinButton>Join Event</JoinButton>
                <InfoButton>More Info</InfoButton>
              </EventAction>
            </EventCard>
          ))}
        </EventsList>
      </ModalContent>
    </ModalOverlay>
  );
};

// 4. OFFERINGS MODAL
export const OfferingsModal = ({ profile, isOpen, onClose }) => {
  if (!isOpen || !profile) return null;

  const offerings = profile.offerings || {
    berseGuide: {
      available: true,
      price: 'RM50-80/day or skill trade',
      duration: 'Half day / Full day',
      locations: ['Kuala Lumpur', 'Penang', 'Langkawi'],
      specialties: ['Food Tours', 'Historical Sites', 'Hidden Gems', 'Photography Spots']
    },
    homeSurf: {
      available: true,
      maxDays: 3,
      amenities: ['WiFi', 'Kitchen', 'Laundry', 'Private Room']
    },
    berseBuddy: {
      activities: ['Coffee Meetups', 'Weekend Trips', 'Sport Activities'],
      availability: 'Weekends & Evenings'
    },
    berseMentor: {
      expertise: ['Architecture', 'Photography', 'Career Guidance'],
      rate: '100 BersePoints/hour',
      format: ['Online', 'In-person', 'Workshop']
    }
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <h2>🎯 {profile.name}'s Offerings</h2>
          <CloseButton onClick={onClose}>×</CloseButton>
        </ModalHeader>
        
        <OfferingsGrid>
          {/* BerseGuide */}
          <OfferingCard>
            <OfferingTitle>🗺️ BerseGuide</OfferingTitle>
            <OfferingDetails>
              <DetailRow>
                <Label>Price:</Label>
                <Value>{offerings.berseGuide?.price}</Value>
              </DetailRow>
              <DetailRow>
                <Label>Duration:</Label>
                <Value>{offerings.berseGuide?.duration}</Value>
              </DetailRow>
              <DetailRow>
                <Label>Locations:</Label>
                <Value>{offerings.berseGuide?.locations?.join(', ')}</Value>
              </DetailRow>
              <DetailRow>
                <Label>Specialties:</Label>
                <TagList>
                  {offerings.berseGuide?.specialties?.map((s, i) => (
                    <Tag key={i}>{s}</Tag>
                  ))}
                </TagList>
              </DetailRow>
            </OfferingDetails>
            <BookButton>Book Guide</BookButton>
          </OfferingCard>

          {/* HomeSurf */}
          <OfferingCard>
            <OfferingTitle>🏠 HomeSurf</OfferingTitle>
            <OfferingDetails>
              <DetailRow>
                <Label>Available:</Label>
                <Value>{offerings.homeSurf?.available ? '✅ Yes' : '❌ No'}</Value>
              </DetailRow>
              <DetailRow>
                <Label>Max Days:</Label>
                <Value>{offerings.homeSurf?.maxDays} nights</Value>
              </DetailRow>
              <DetailRow>
                <Label>Amenities:</Label>
                <TagList>
                  {offerings.homeSurf?.amenities?.map((a, i) => (
                    <Tag key={i}>{a}</Tag>
                  ))}
                </TagList>
              </DetailRow>
            </OfferingDetails>
            <BookButton>Request Stay</BookButton>
          </OfferingCard>

          {/* BerseBuddy */}
          <OfferingCard>
            <OfferingTitle>👫 BerseBuddy</OfferingTitle>
            <OfferingDetails>
              <DetailRow>
                <Label>Activities:</Label>
                <TagList>
                  {offerings.berseBuddy?.activities?.map((a, i) => (
                    <Tag key={i}>{a}</Tag>
                  ))}
                </TagList>
              </DetailRow>
              <DetailRow>
                <Label>Availability:</Label>
                <Value>{offerings.berseBuddy?.availability}</Value>
              </DetailRow>
            </OfferingDetails>
            <BookButton>Be Buddies</BookButton>
          </OfferingCard>

          {/* BerseMentor */}
          <OfferingCard>
            <OfferingTitle>🎓 BerseMentor</OfferingTitle>
            <OfferingDetails>
              <DetailRow>
                <Label>Expertise:</Label>
                <TagList>
                  {offerings.berseMentor?.expertise?.map((e, i) => (
                    <Tag key={i}>{e}</Tag>
                  ))}
                </TagList>
              </DetailRow>
              <DetailRow>
                <Label>Rate:</Label>
                <Value>{offerings.berseMentor?.rate}</Value>
              </DetailRow>
              <DetailRow>
                <Label>Format:</Label>
                <Value>{offerings.berseMentor?.format?.join(', ')}</Value>
              </DetailRow>
            </OfferingDetails>
            <BookButton>Book Session</BookButton>
          </OfferingCard>
        </OfferingsGrid>
      </ModalContent>
    </ModalOverlay>
  );
};

// ====== INTEREST OPTIONS ======
export const INTEREST_OPTIONS = [
  { icon: '🌍', label: 'Cultural Networking', value: 'cultural-networking' },
  { icon: '☕', label: 'Cafe Hopping', value: 'cafe-hopping' },
  { icon: '✈️', label: 'Travel Stories', value: 'travel-stories' },
  { icon: '🗣️', label: 'Language Exchange', value: 'language-exchange' },
  { icon: '🚀', label: 'Startup Networking', value: 'startup-networking' },
  { icon: '💚', label: 'Social Impact', value: 'social-impact' },
  { icon: '⚽', label: 'Sports Activities', value: 'sports-activities' },
  { icon: '🏸', label: 'Badminton Games', value: 'badminton-games' },
  { icon: '🥾', label: 'Hiking Trails', value: 'hiking-trails' },
  { icon: '🏛️', label: 'Heritage Walks', value: 'heritage-walks' },
  { icon: '🍜', label: 'Foodie Meetups', value: 'foodie-meetups' },
  { icon: '📚', label: 'Book Talks', value: 'book-talks' },
  { icon: '🎒', label: 'Weekend Trips', value: 'weekend-trips' },
  { icon: '📸', label: 'Photo Walks', value: 'photo-walks' },
  { icon: '🏖️', label: 'Beach Outings', value: 'beach-outings' }
];

// ====== ENHANCED PROFILE CARD COMPONENT ======
export const EnhancedProfileCard = ({ 
  profile, 
  onLocationClick,
  onCommunityClick,
  onEventsClick,
  onOfferingsClick
}: any) => {
  // Get top 4 interests for the profile
  const topInterests = profile.topInterests || 
    ['cultural-networking', 'cafe-hopping', 'heritage-walks', 'photo-walks'];
  
  const displayInterests = topInterests.map(interest => 
    INTEREST_OPTIONS.find(opt => opt.value === interest) || 
    INTEREST_OPTIONS[0]
  ).slice(0, 4);

  return (
    <ProfileCard>
      <ProfileHeader>
        <ProfileName>{profile.name}</ProfileName>
        <ProfileProfession>{profile.profession}</ProfileProfession>
      </ProfileHeader>

      {/* Clickable Location for Travel Logbook */}
      <LocationButton onClick={() => onLocationClick(profile)}>
        📍 {profile.location}
        <ViewMore>View Travel Logbook →</ViewMore>
      </LocationButton>

      {/* Top 4 Interests */}
      <InterestsSection>
        <SectionTitle>Top Interests</SectionTitle>
        <InterestsGrid>
          {displayInterests.map((interest, idx) => (
            <InterestBadge key={idx}>
              {interest.label}
            </InterestBadge>
          ))}
        </InterestsGrid>
      </InterestsSection>

      {/* Interactive Badges Row */}
      <BadgesRow>
        <InteractiveBadge onClick={() => onCommunityClick(profile)}>
          👥 {profile.communities?.length || 0} Communities
        </InteractiveBadge>
        
        <InteractiveBadge onClick={() => onEventsClick(profile)}>
          📅 {profile.eventsAttending?.length || 0} Events
        </InteractiveBadge>
        
        <InteractiveBadge onClick={() => onOfferingsClick(profile)}>
          🎯 Offerings
        </InteractiveBadge>
      </BadgesRow>
    </ProfileCard>
  );
};

// ====== STYLED COMPONENTS ======

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 16px;
  max-width: 600px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  padding: 24px;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  
  h2 {
    margin: 0;
    color: #2fce98;
    font-size: 20px;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  
  &:hover {
    color: #2fce98;
  }
`;

// Travel Logbook Styles
const TravelSection = styled.div`
  h3 {
    color: #2fce98;
    margin-bottom: 16px;
  }
`;

const TravelCard = styled.div`
  background: #F5F5F5;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
`;

const TravelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  font-weight: 600;
  margin-bottom: 8px;
`;

const TravelCity = styled.div`
  color: #666;
  font-size: 14px;
`;

const TravelPurpose = styled.div`
  color: #999;
  font-size: 12px;
  font-style: italic;
  margin-bottom: 12px;
`;

const FriendsSection = styled.div`
  background: white;
  border-radius: 8px;
  padding: 12px;
  margin-top: 12px;
  
  h4 {
    font-size: 14px;
    margin-bottom: 8px;
    color: #2fce98;
  }
`;

const FriendCard = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #E0E0E0;
  
  &:last-child {
    border-bottom: none;
  }
`;

const FriendName = styled.span`
  font-size: 14px;
  color: #333;
`;

const ConnectButton = styled.button`
  background: #2fce98;
  color: white;
  border: none;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  
  &:hover {
    background: #1E4039;
  }
`;

// Communities Styles
const CommunitiesGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
`;

const CommunityCard = styled.div`
  background: #F8F8F8;
  border-radius: 12px;
  padding: 16px;
  text-align: center;
`;

const CommunityName = styled.h4`
  color: #2fce98;
  margin: 0 0 8px 0;
  font-size: 14px;
`;

const CommunityRole = styled.div`
  background: #2fce98;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  display: inline-block;
  margin-bottom: 12px;
`;

const CommunityStats = styled.div`
  display: flex;
  justify-content: space-around;
  margin-bottom: 12px;
  font-size: 12px;
  color: #666;
`;

const ViewButton = styled.button`
  background: white;
  color: #2fce98;
  border: 1px solid #2fce98;
  padding: 6px 16px;
  border-radius: 8px;
  font-size: 12px;
  cursor: pointer;
  width: 100%;
  
  &:hover {
    background: #2fce98;
    color: white;
  }
`;

// Events Styles
const EventsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const EventCard = styled.div`
  background: #F8F8F8;
  border-radius: 12px;
  padding: 16px;
`;

const EventName = styled.h4`
  color: #2fce98;
  margin: 0 0 8px 0;
`;

const EventDate = styled.div`
  color: #666;
  font-size: 14px;
  margin-bottom: 12px;
`;

const EventAction = styled.div`
  display: flex;
  gap: 8px;
`;

const JoinButton = styled.button`
  flex: 1;
  background: #2fce98;
  color: white;
  border: none;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  
  &:hover {
    background: #1E4039;
  }
`;

const InfoButton = styled.button`
  flex: 1;
  background: white;
  color: #2fce98;
  border: 1px solid #2fce98;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  
  &:hover {
    background: #F0F7F4;
  }
`;

// Offerings Styles
const OfferingsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const OfferingCard = styled.div`
  background: #F8F8F8;
  border-radius: 12px;
  padding: 16px;
`;

const OfferingTitle = styled.h3`
  color: #2fce98;
  margin: 0 0 12px 0;
  font-size: 16px;
`;

const OfferingDetails = styled.div`
  margin-bottom: 12px;
`;

const DetailRow = styled.div`
  margin-bottom: 8px;
`;

const Label = styled.span`
  font-weight: 600;
  color: #666;
  font-size: 12px;
  margin-right: 8px;
`;

const Value = styled.span`
  color: #333;
  font-size: 12px;
`;

const TagList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 4px;
`;

const Tag = styled.span`
  background: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  color: #2fce98;
`;

const BookButton = styled.button`
  width: 100%;
  background: #2fce98;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  
  &:hover {
    background: #1E4039;
  }
`;

// Profile Card Styles
const ProfileCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const ProfileHeader = styled.div`
  margin-bottom: 16px;
`;

const ProfileName = styled.h3`
  color: #2fce98;
  margin: 0 0 4px 0;
`;

const ProfileProfession = styled.div`
  color: #666;
  font-size: 14px;
`;

const LocationButton = styled.button`
  background: #F0F7F4;
  border: 1px solid #2fce98;
  border-radius: 8px;
  padding: 12px;
  width: 100%;
  text-align: left;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  color: #2fce98;
  font-weight: 500;
  
  &:hover {
    background: #E8F5E9;
  }
`;

const ViewMore = styled.span`
  font-size: 12px;
  color: #666;
`;

const InterestsSection = styled.div`
  margin-bottom: 16px;
`;

const SectionTitle = styled.h4`
  color: #666;
  font-size: 12px;
  margin: 0 0 8px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const InterestsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
`;

const InterestBadge = styled.div`
  background: #F5F5F5;
  border-radius: 8px;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #333;
`;

const BadgesRow = styled.div`
  display: flex;
  gap: 8px;
`;

const InteractiveBadge = styled.button`
  flex: 1;
  background: white;
  border: 1px solid #E0E0E0;
  border-radius: 8px;
  padding: 8px;
  cursor: pointer;
  font-size: 12px;
  color: #666;
  transition: all 0.2s;
  
  &:hover {
    background: #2fce98;
    color: white;
    border-color: #2fce98;
  }
`;

export default {
  EnhancedProfileCard,
  TravelLogbookEnhanced,
  CommunitiesModal,
  EventsModal,
  OfferingsModal,
  INTEREST_OPTIONS
};