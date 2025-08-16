import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import { generateBerseMukhaEvents, generatePersonAttendance } from '../../data/bersemukhaEvents';

interface ProfileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

// Interest options
const INTEREST_OPTIONS = [
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

export const ProfileSidebar: React.FC<ProfileSidebarProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showTravelModal, setShowTravelModal] = useState(false);
  const [showCommunitiesModal, setShowCommunitiesModal] = useState(false);
  const [showEventsModal, setShowEventsModal] = useState(false);
  const [showOfferingsModal, setShowOfferingsModal] = useState(false);

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose(); // Close sidebar after navigation
  };

  const handleLogout = async () => {
    try {
      await logout();
      localStorage.removeItem('rememberMe');
      navigate('/login');
      onClose();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <>
      {isOpen && <SidebarOverlay onClick={onClose} />}
      <SidebarContainer $isOpen={isOpen}>
        <SidebarHeader>
          <CloseButton onClick={onClose}>×</CloseButton>
          <HeaderTitle>Profile</HeaderTitle>
        </SidebarHeader>

        <ProfileCard>
          {/* Profile Header - Exact same as BerseMatch */}
          <ConnectionHeader>
            <Avatar>👤</Avatar>
            <ConnectionInfo>
              <NameBadgesRow>
                <ConnectionName>{user?.fullName || 'User'}</ConnectionName>
                {user?.personalityType && (
                  <InlineBadge $color="#E8F5E9" $textColor="#2E7D32">
                    🧠 {user.personalityType}
                  </InlineBadge>
                )}
                {user?.languages && (
                  <InlineBadge $color="#E3F2FD" $textColor="#1976D2">
                    🗣️ {user.languages}
                  </InlineBadge>
                )}
              </NameBadgesRow>
              <ConnectionLocation onClick={() => setShowTravelModal(true)}>
                📍 {user?.currentLocation || user?.location || 'Location not set'} 
                {user?.originLocation && ` • From: ${user.originLocation}`}
              </ConnectionLocation>
              <ProfileMeta>
                {user?.age && <span>{user.age} years</span>}
                {user?.age && (user?.profession || user?.occupation) && <span>•</span>}
                <span>{user?.profession || user?.occupation || 'Profession not set'}</span>
              </ProfileMeta>
            </ConnectionInfo>
          </ConnectionHeader>

          {/* Interests/Tags - From user data */}
          <ConnectionTags>
            {(user?.topInterests || user?.interests || []).slice(0, 4).map((interest, idx) => {
              const interestOption = INTEREST_OPTIONS.find(option => 
                option.value === interest || option.label === interest
              );
              return (
                <Tag key={idx}>
                  {interestOption?.label || interest}
                </Tag>
              );
            })}
            {(!user?.topInterests || user.topInterests.length === 0) && (!user?.interests || user.interests.length === 0) && (
              <Tag>Interests not set</Tag>
            )}
          </ConnectionTags>

          {/* Bio - From user data */}
          <ConnectionBio>
            "{user?.bio || 'No bio available. Update your profile to share more about yourself!'}"
          </ConnectionBio>

          {/* Info Badges - Exact same as BerseMatch */}
          <ProfileInfoRow>
            <InfoBadge 
              $color="#FFF3E0" 
              $textColor="#E65100"
              onClick={() => setShowCommunitiesModal(true)}
            >
              👥 5 communities
            </InfoBadge>
            <InfoBadge 
              $color="#F3E5F5" 
              $textColor="#7B1FA2"
              onClick={() => setShowEventsModal(true)}
            >
              🤝 12 BerseMukha
            </InfoBadge>
            <InfoBadge 
              $color="#E8F5E9" 
              $textColor="#2E7D32"
              onClick={() => setShowOfferingsModal(true)}
            >
              🎯 Offerings
            </InfoBadge>
          </ProfileInfoRow>


          {/* Action Buttons */}
          <ConnectionActions>
            <EditButton onClick={() => handleNavigation('/edit-profile')}>
              ✏️ Edit Profile
            </EditButton>
          </ConnectionActions>
          
        </ProfileCard>

        {/* Membership ID & Referral Code Section */}
        <ReferralCard>
          <ReferralTitle>🆔 Membership ID & Referral Code</ReferralTitle>
          <ReferralCode>{user?.membershipId || 'AUN100001'}</ReferralCode>
          <ReferralActions>
            <CopyButton onClick={() => {
              const membershipId = user?.membershipId || 'AUN100001';
              navigator.clipboard.writeText(membershipId);
              alert('Membership ID copied to clipboard!');
            }}>
              📋 Copy Code
            </CopyButton>
            <ShareButton onClick={() => {
              const membershipId = user?.membershipId || 'AUN100001';
              const message = `Join Berse App with my referral code: ${membershipId}\nBoth of us will get bonus points! 🎉`;
              navigator.clipboard.writeText(message);
              alert('Referral message copied! Share it with your friends.');
            }}>
              📤 Share
            </ShareButton>
          </ReferralActions>
          <ReferralInfo>Your unique membership ID • Share to earn bonus points!</ReferralInfo>
        </ReferralCard>


        <MenuSection>
          {/* 1. Private Messages */}
          <MenuItem onClick={() => handleNavigation('/messages')}>
            <MenuIcon>💬</MenuIcon>
            <MenuContent>
              <MenuTitle>Private Messages</MenuTitle>
            </MenuContent>
            <MenuBadge $color="#E74C3C">3</MenuBadge>
            <MenuArrow>→</MenuArrow>
          </MenuItem>

          {/* 2. Forum */}
          <MenuItem onClick={() => handleNavigation('/forum')}>
            <MenuIcon>💭</MenuIcon>
            <MenuContent>
              <MenuTitle>Forum</MenuTitle>
            </MenuContent>
            <MenuArrow>→</MenuArrow>
          </MenuItem>

          {/* 3. My Events */}
          <MenuItem onClick={() => handleNavigation('/my-events')}>
            <MenuIcon>📅</MenuIcon>
            <MenuContent>
              <MenuTitle>My Events</MenuTitle>
            </MenuContent>
            <MenuBadge $color="#3B82F6">2</MenuBadge>
            <MenuArrow>→</MenuArrow>
          </MenuItem>

          {/* 4. Manage Events (Admin) */}
          <MenuItem onClick={() => handleNavigation('/manage-events')}>
            <MenuIcon>⚡</MenuIcon>
            <MenuContent>
              <MenuTitle>Manage Events (Admin)</MenuTitle>
            </MenuContent>
            <MenuBadge $color="#E74C3C">Admin</MenuBadge>
            <MenuArrow>→</MenuArrow>
          </MenuItem>

          {/* 4. Settings */}
          <MenuItem onClick={() => handleNavigation('/settings')}>
            <MenuIcon>⚙️</MenuIcon>
            <MenuContent>
              <MenuTitle>Settings</MenuTitle>
            </MenuContent>
            <MenuArrow>→</MenuArrow>
          </MenuItem>

          {/* REMOVED: My Communities */}
        </MenuSection>

        {/* Logout Button */}
        <LogoutSection>
          <LogoutButton onClick={handleLogout}>
            <LogoutIcon>🚪</LogoutIcon>
            <LogoutText>Logout</LogoutText>
          </LogoutButton>
        </LogoutSection>
      </SidebarContainer>

      {/* Travel Logbook Modal */}
      {showTravelModal && (
        <ModalOverlay onClick={() => setShowTravelModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h2>✈️ My Travel Logbook</h2>
              <ModalCloseButton onClick={() => setShowTravelModal(false)}>×</ModalCloseButton>
            </ModalHeader>
            <ModalBody>
              <TravelStats>
                <StatCard>
                  <StatNumber>15</StatNumber>
                  <StatLabel>Countries</StatLabel>
                </StatCard>
                <StatCard>
                  <StatNumber>42</StatNumber>
                  <StatLabel>Cities</StatLabel>
                </StatCard>
                <StatCard>
                  <StatNumber>156</StatNumber>
                  <StatLabel>Friends</StatLabel>
                </StatCard>
              </TravelStats>
              
              <CountryList>
                {[
                  { country: 'Malaysia', flag: '🇲🇾', cities: 'KL, Penang, Langkawi', friends: 45 },
                  { country: 'Turkey', flag: '🇹🇷', cities: 'Istanbul, Ankara, Izmir', friends: 28 },
                  { country: 'Indonesia', flag: '🇮🇩', cities: 'Jakarta, Bali, Yogyakarta', friends: 22 },
                  { country: 'Singapore', flag: '🇸🇬', cities: 'Singapore', friends: 18 },
                  { country: 'Thailand', flag: '🇹🇭', cities: 'Bangkok, Phuket', friends: 15 }
                ].map((item, idx) => (
                  <CountryCard key={idx}>
                    <CountryHeader>
                      <span>{item.flag} {item.country}</span>
                      <span>{item.friends} friends</span>
                    </CountryHeader>
                    <CountryDetails>{item.cities}</CountryDetails>
                  </CountryCard>
                ))}
              </CountryList>
            </ModalBody>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* Communities Modal */}
      {showCommunitiesModal && (
        <ModalOverlay onClick={() => setShowCommunitiesModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h2>👥 My Communities</h2>
              <ModalCloseButton onClick={() => setShowCommunitiesModal(false)}>×</ModalCloseButton>
            </ModalHeader>
            <ModalBody>
              <CommunitiesGrid>
                {[
                  { name: 'NAMA Foundation', role: 'Active Member', members: 245 },
                  { name: 'Malaysian Architects', role: 'President', members: 180 },
                  { name: 'KL Photography Club', role: 'Event Coordinator', members: 320 },
                  { name: 'Istanbul Tour Guides', role: 'Senior Guide', members: 156 },
                  { name: 'Halal Tourism Turkey', role: 'Founding Member', members: 89 }
                ].map((community, idx) => (
                  <CommunityCardModal key={idx}>
                    <CommunityName>{community.name}</CommunityName>
                    <CommunityRole>{community.role}</CommunityRole>
                    <CommunityMembers>{community.members} members</CommunityMembers>
                  </CommunityCardModal>
                ))}
              </CommunitiesGrid>
            </ModalBody>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* Events Modal */}
      {showEventsModal && (
        <ModalOverlay onClick={() => setShowEventsModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h2>🤝 BerseMukha Events</h2>
              <ModalCloseButton onClick={() => setShowEventsModal(false)}>×</ModalCloseButton>
            </ModalHeader>
            <ModalBody>
              {(() => {
                const allEvents = generateBerseMukhaEvents();
                const myAttendance = generatePersonAttendance('Zayd Mahdaly');
                const attendedEvents = myAttendance.filter(a => a.attended);
                
                return (
                  <>
                    <EventStats>
                      <StatCard>
                        <StatNumber>{attendedEvents.length}</StatNumber>
                        <StatLabel>Events Attended</StatLabel>
                      </StatCard>
                      <StatCard>
                        <StatNumber>
                          {attendedEvents.reduce((sum, e) => sum + e.friendsMade.length, 0)}
                        </StatNumber>
                        <StatLabel>Friends Made</StatLabel>
                      </StatCard>
                    </EventStats>
                    
                    <EventsList>
                      {attendedEvents.slice(0, 5).map((attendance) => {
                        const event = allEvents.find(e => e.id === attendance.eventId);
                        if (!event) return null;
                        
                        return (
                          <EventCard key={attendance.eventId}>
                            <EventName>{event.month} {event.year} - {event.theme}</EventName>
                            <EventDetails>📍 {event.venue}, {event.location}</EventDetails>
                            <EventFriends>🤝 {attendance.friendsMade.length} friends made</EventFriends>
                          </EventCard>
                        );
                      })}
                    </EventsList>
                  </>
                );
              })()}
            </ModalBody>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* Offerings Modal */}
      {showOfferingsModal && (
        <ModalOverlay onClick={() => setShowOfferingsModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h2>🎯 My Offerings</h2>
              <ModalCloseButton onClick={() => setShowOfferingsModal(false)}>×</ModalCloseButton>
            </ModalHeader>
            <ModalBody>
              <OfferingsGrid>
                <OfferingCard>
                  <OfferingTitle>🗺️ BerseGuide</OfferingTitle>
                  <OfferingDetail>Price: RM50-80/day</OfferingDetail>
                  <OfferingDetail>Locations: KL, Penang, Langkawi</OfferingDetail>
                  <OfferingDetail>Specialties: Architecture, Photography, Hidden Gems</OfferingDetail>
                </OfferingCard>
                
                <OfferingCard>
                  <OfferingTitle>🏠 HomeSurf</OfferingTitle>
                  <OfferingDetail>Available: ✅ Yes</OfferingDetail>
                  <OfferingDetail>Max Days: 3 nights</OfferingDetail>
                  <OfferingDetail>Amenities: WiFi, Kitchen, Private Room</OfferingDetail>
                </OfferingCard>
                
                <OfferingCard>
                  <OfferingTitle>👫 BerseBuddy</OfferingTitle>
                  <OfferingDetail>Activities: Coffee, Photography, Architecture Tours</OfferingDetail>
                  <OfferingDetail>Availability: Weekends & Evenings</OfferingDetail>
                </OfferingCard>
                
                <OfferingCard>
                  <OfferingTitle>🎓 BerseMentor</OfferingTitle>
                  <OfferingDetail>Expertise: Architecture, Photography, Career</OfferingDetail>
                  <OfferingDetail>Rate: 100 BersePoints/hour</OfferingDetail>
                  <OfferingDetail>Format: Online, In-person</OfferingDetail>
                </OfferingCard>
              </OfferingsGrid>
            </ModalBody>
          </ModalContent>
        </ModalOverlay>
      )}
    </>
  );
};

// Styled Components
const SidebarOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9998;
`;

const SidebarContainer = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  max-width: 393px;
  height: 100vh;
  background: #F9F3E3;
  z-index: 9999;
  transform: ${({ $isOpen }) => $isOpen ? 'translateX(0)' : 'translateX(-100%)'};
  transition: transform 0.3s ease-in-out;
  overflow-y: auto;
`;

const SidebarHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 16px 20px;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  color: #2fce98;
  cursor: pointer;
  margin-right: 16px;
`;

const HeaderTitle = styled.h2`
  font-size: 20px;
  font-weight: bold;
  color: #2fce98;
  margin: 0;
`;

const ProfileCard = styled.div`
  background: white;
  margin: 20px;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;




const EditButton = styled.button`
  background: #2fce98;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  
  &:hover {
    background: #1E4039;
  }
`;


const ConnectionActions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;
`;

const ProfileActionsRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #E0E0E0;
`;

const ProfileActionLink = styled.button`
  background: none;
  border: none;
  color: #2fce98;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;

const MutualFriendsInfo = styled.span`
  font-size: 13px;
  color: #666;
`;

const ReferralCard = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  margin: 20px;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  color: white;
`;

const ReferralTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: white;
`;

const ReferralCode = styled.div`
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 2px dashed rgba(255, 255, 255, 0.5);
  border-radius: 12px;
  padding: 12px;
  font-size: 14px;
  font-family: monospace;
  text-align: center;
  margin-bottom: 16px;
  letter-spacing: 1px;
`;

const ReferralActions = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
`;

const CopyButton = styled.button`
  flex: 1;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const ShareButton = styled(CopyButton)``;

const ReferralInfo = styled.p`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.9);
  text-align: center;
  margin: 0;
`;


const MenuSection = styled.div`
  background: white;
  margin: 0 20px 20px 20px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;


const MenuIcon = styled.div`
  font-size: 24px;
  margin-right: 16px;
  width: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const MenuContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const MenuTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 2px 0;
`;

const MenuSubtitle = styled.p`
  font-size: 12px;
  color: #666;
  margin: 0;
  line-height: 1.3;
`;

const MenuBadge = styled.span<{ $color: string }>`
  background: ${({ $color }) => $color};
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  margin-right: 12px;
  
  ${({ $color }) => $color === '#666' && `
    background: #F0F0F0;
    color: #666;
  `}
  
  ${({ $color }) => $color === '#FF9800' && `
    background: #FF9800;
    color: white;
  `}
`;

const MenuArrow = styled.div`
  font-size: 16px;
  color: #CCC;
  font-weight: bold;
`;

const MenuItem = styled.div`
  display: flex;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #F0F0F0;
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background-color: #F8F9FA;
  }
  
  &:active {
    background-color: #E9ECEF;
  }
`;

const LogoutSection = styled.div`
  margin: 20px;
  margin-bottom: 40px;
`;

const LogoutButton = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 14px 20px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(220, 53, 69, 0.3);
  
  &:hover {
    background: #c82333;
    box-shadow: 0 4px 12px rgba(220, 53, 69, 0.4);
  }
  
  &:active {
    transform: scale(0.98);
  }
`;

const LogoutIcon = styled.span`
  font-size: 20px;
`;

const LogoutText = styled.span`
  font-size: 16px;
  font-weight: 600;
`;

// BerseMatch exact styled components
const ConnectionHeader = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
`;

const Avatar = styled.div`
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
  flex-shrink: 0;
`;

const ConnectionInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const NameBadgesRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 4px;
`;

const ConnectionName = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #2fce98;
  margin: 0;
`;

const InlineBadge = styled.span<{ $color: string; $textColor: string }>`
  background: ${props => props.$color};
  color: ${props => props.$textColor};
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 600;
  white-space: nowrap;
`;

const ConnectionLocation = styled.div`
  font-size: 12px;
  color: #666;
  margin: 2px 0;
  cursor: pointer;
  
  &:hover {
    color: #2fce98;
    text-decoration: underline;
  }
`;

const ProfileMeta = styled.div`
  display: flex;
  gap: 6px;
  font-size: 12px;
  color: #666;
  margin-top: 4px;
`;

const ConnectionTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
`;

const Tag = styled.span`
  background: #F0F7F4;
  color: #2fce98;
  border: 1px solid #E0E0E0;
  padding: 6px 10px;
  border-radius: 16px;
  font-size: 11px;
  font-weight: 500;
  display: inline-block;
`;

const ConnectionBio = styled.p`
  font-size: 13px;
  color: #333;
  font-style: italic;
  line-height: 1.5;
  margin: 0 0 12px 0;
`;

const ProfileInfoRow = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 12px;
`;

const InfoBadge = styled.button<{ $color: string; $textColor: string }>`
  background: ${props => props.$color};
  color: ${props => props.$textColor};
  border: none;
  padding: 6px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
`;

// Modal styled components
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
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #E0E0E0;
  
  h2 {
    margin: 0;
    color: #2fce98;
    font-size: 20px;
  }
`;

const ModalCloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  
  &:hover {
    color: #2fce98;
  }
`;

const ModalBody = styled.div`
  padding: 24px;
`;

// Travel Modal Components
const TravelStats = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 12px;
  margin-bottom: 24px;
`;

const StatCard = styled.div`
  background: #F8F8F8;
  border-radius: 12px;
  padding: 16px;
  text-align: center;
`;

const StatNumber = styled.div`
  font-size: 24px;
  font-weight: bold;
  color: #2fce98;
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: #666;
`;

const CountryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const CountryCard = styled.div`
  background: #F8F8F8;
  border-radius: 12px;
  padding: 16px;
`;

const CountryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  font-weight: 600;
  margin-bottom: 8px;
  color: #2fce98;
`;

const CountryDetails = styled.div`
  color: #666;
  font-size: 14px;
`;

// Communities Modal Components
const CommunitiesGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
`;

const CommunityCardModal = styled.div`
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
  margin-bottom: 8px;
`;

const CommunityMembers = styled.div`
  font-size: 12px;
  color: #666;
`;

// Events Modal Components
const EventStats = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 24px;
`;

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
  font-size: 14px;
`;

const EventDetails = styled.div`
  color: #666;
  font-size: 12px;
  margin-bottom: 4px;
`;

const EventFriends = styled.div`
  color: #2E7D32;
  font-size: 12px;
`;

// Offerings Modal Components
const OfferingsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
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

const OfferingDetail = styled.div`
  font-size: 12px;
  color: #666;
  margin-bottom: 6px;
`;