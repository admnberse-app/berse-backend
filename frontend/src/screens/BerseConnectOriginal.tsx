import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { StatusBar } from '../components/StatusBar/StatusBar';
import { MainNav } from '../components/MainNav';
import { useAuth } from '../contexts/AuthContext';
import { EventRegistrationModal } from '../components/EventRegistrationModal';
// import eventService from '@frontend-api/services/event.service';
// import { Event, EventType } from '@frontend-api/types';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #F9F3E3;
  max-width: 393px;
  margin: 0 auto;
`;

const Header = styled.div`
  padding: 16px 20px;
  background-color: #F5F3EF;
`;

const HeaderTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #2D5F4F;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 14px;
`;

const HeaderText = styled.div`
  h3 {
    margin: 0;
    font-size: 12px;
    color: #666;
    font-weight: normal;
  }
  h2 {
    margin: 0;
    font-size: 18px;
    color: #2D5F4F;
    font-weight: bold;
  }
`;

const NotificationBell = styled.div`
  position: relative;
  width: 24px;
  height: 24px;
  cursor: pointer;
  
  &::before {
    content: '🔔';
    font-size: 20px;
  }
  
  &::after {
    content: '3';
    position: absolute;
    top: -4px;
    right: -4px;
    width: 16px;
    height: 16px;
    background-color: #ff4444;
    color: white;
    border-radius: 50%;
    font-size: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const Content = styled.div`
  flex: 1;
  padding: 0 20px 80px 20px;
  overflow-y: auto;
`;

const SearchContainer = styled.div`
  margin-bottom: 20px;
`;

const SearchBar = styled.div`
  background: white;
  border-radius: 12px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 16px;
`;

const SearchInput = styled.input`
  border: none;
  outline: none;
  flex: 1;
  font-size: 14px;
  color: #333;
  
  &::placeholder {
    color: #999;
  }
`;

const FilterRow = styled.div`
  display: flex;
  gap: 12px;
`;

const FilterButtonStyled = styled.button<{ hasFilter?: boolean }>`
  flex: 1;
  padding: 12px 16px;
  border: 1px solid ${({ hasFilter }) => hasFilter ? '#2D5F4F' : '#E5E5E5'};
  border-radius: 8px;
  background: ${({ hasFilter }) => hasFilter ? '#F0F8F5' : 'white'};
  color: ${({ hasFilter }) => hasFilter ? '#2D5F4F' : '#333'};
  font-size: 14px;
  font-weight: ${({ hasFilter }) => hasFilter ? '600' : '400'};
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  &:hover {
    border-color: #2D5F4F;
    background-color: #F0F8F5;
  }
  
  &::after {
    content: '▼';
    font-size: 10px;
    color: #666;
  }
`;

// Filter Modal Styles
const FilterModalOverlay = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: ${({ isOpen }) => isOpen ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 1100;
  padding: 20px;
`;

const FilterModal = styled.div`
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 350px;
  max-height: 80vh;
  overflow-y: auto;
`;

const FilterModalHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid #F0F0F0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const FilterModalTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: bold;
  color: #333;
`;

const FilterCloseButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  color: #666;
  cursor: pointer;
  
  &:hover {
    color: #333;
  }
`;

const CheckboxGrid = styled.div`
  padding: 20px;
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
`;

const CheckboxItem = styled.label`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #f5f5f5;
  }
`;

const Checkbox = styled.input`
  margin: 0;
  margin-top: 2px;
  width: 16px;
  height: 16px;
  accent-color: #2D5F4F;
  flex-shrink: 0;
`;

const FilterActions = styled.div`
  padding: 20px;
  border-top: 1px solid #F0F0F0;
  display: flex;
  gap: 12px;
`;

const FilterActionButton = styled.button`
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
`;

const ApplyButton = styled(FilterActionButton)`
  background: #2D5F4F;
  color: white;
  
  &:hover {
    background: #1F4A3A;
  }
`;

const ClearButton = styled(FilterActionButton)`
  background: #f5f5f5;
  color: #666;
  
  &:hover {
    background: #e5e5e5;
  }
`;

const EventCard = styled.div`
  background: white;
  border-radius: 16px;
  margin-bottom: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  
  &:hover {
    transform: translateY(-2px);
    transition: transform 0.2s ease;
  }
`;

const EventImage = styled.div`
  width: 100%;
  height: 120px;
  background: linear-gradient(45deg, #E8F4F0, #D4E9E3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  position: relative;
  background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 120"><rect width="400" height="120" fill="%23E8F4F0"/><rect x="50" y="30" width="300" height="60" fill="%23D4E9E3" rx="8"/><circle cx="100" cy="50" r="10" fill="%234A90A4"/><circle cx="150" cy="50" r="10" fill="%234A90A4"/><circle cx="200" cy="50" r="10" fill="%234A90A4"/></svg>');
  background-size: cover;
`;

const EventBadge = styled.div`
  position: absolute;
  top: 12px;
  left: 12px;
  background-color: #2D5F4F;
  color: white;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 11px;
  font-weight: 600;
`;

const EventReward = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  background-color: #FF6B6B;
  color: white;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 11px;
  font-weight: 600;
`;

const EventContent = styled.div`
  padding: 12px;
`;

const EventMeta = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
`;

const EventHost = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #666;
`;

const HostAvatar = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #2D5F4F;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 10px;
  font-weight: bold;
`;

const EventParticipants = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #666;
`;

const ParticipantAvatars = styled.div`
  display: flex;
  margin-right: 4px;
`;

const ParticipantAvatar = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: #4A90A4;
  margin-left: -6px;
  border: 2px solid white;
  
  &:first-child {
    margin-left: 0;
  }
`;

const EventTitle = styled.h3`
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin: 0 0 8px 0;
`;

const EventDetails = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
`;

const EventInfo = styled.div`
  font-size: 12px;
  color: #666;
  line-height: 1.5;
`;

const EventActions = styled.div`
  display: flex;
  gap: 8px;
`;

const JoinButton = styled.button`
  background-color: #2D5F4F;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  
  &:hover {
    background-color: #1F4A3A;
  }
`;

const LearnMoreButton = styled.button`
  background: none;
  border: 1px solid #E5E5E5;
  color: #666;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 12px;
  cursor: pointer;
  
  &:hover {
    background-color: #f5f5f5;
  }
`;

const ShareButton = styled.button`
  background: none;
  border: none;
  color: #666;
  font-size: 16px;
  cursor: pointer;
  padding: 4px;
`;

const CreateEventButton = styled.button`
  background-color: #2D5F4F;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 16px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  &:hover {
    background-color: #1F4A3A;
  }
`;


const ConfirmationModal = styled.div<{ show: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: ${({ show }) => show ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin: 20px;
  max-width: 320px;
  width: 100%;
`;

const ModalTitle = styled.h3`
  margin: 0 0 12px 0;
  font-size: 18px;
  font-weight: bold;
  color: #2D5F4F;
  text-align: center;
`;

const ModalText = styled.p`
  margin: 0 0 20px 0;
  font-size: 14px;
  color: #666;
  text-align: center;
  line-height: 1.4;
`;

const ModalButtons = styled.div`
  display: flex;
  gap: 12px;
`;

const ModalButton = styled.button<{ primary?: boolean }>`
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  
  ${({ primary }) => primary ? `
    background-color: #2D5F4F;
    color: white;
    
    &:hover {
      background-color: #1F4A3A;
    }
  ` : `
    background-color: #F8F9FA;
    color: #666;
    
    &:hover {
      background-color: #E9ECEF;
    }
  `}
`;

// type EventCategory = 'all' | 'VOLUNTEER' | 'SOCIAL' | 'SPORTS' | 'ILM' | 'CAFE_MEETUP' | 'TRIP';

interface FilterState {
  locations: string[];
  interests: string[];
}

interface EventData {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  type: string;
  hostName: string;
  participantCount: number;
  maxParticipants?: number;
  pointsReward: number;
  emoji: string;
  isJoined?: boolean;
}

export const BerseConnectScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  // const [events, setEvents] = useState<Event[]>([]);
  // const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // const [activeFilter, setActiveFilter] = useState<EventCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    locations: [],
    interests: []
  });
  
  // Registration modal state
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [selectedSportsEvent, setSelectedSportsEvent] = useState(null);
  
  // New state for event actions
  const [showJoinConfirmation, setShowJoinConfirmation] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
  const [joinedEvents, setJoinedEvents] = useState<string[]>([]);

  // Load joined events from localStorage on component mount
  useEffect(() => {
    const storedJoinedEvents = JSON.parse(localStorage.getItem('joined_events') || '[]');
    setJoinedEvents(storedJoinedEvents);
  }, []);

  // Cafe meetup booking handler
  const handleCafeMeetupBooking = (event: any) => {
    // Navigate to the cafe meetup booking screen
    navigate('/book-meetup');
  };

  const handleSportsEventRegistration = (event: any) => {
    // Convert event to the format expected by registration modal
    const sportsEvent = {
      id: event.id,
      title: event.title,
      date: '18 May 25',
      time: '8:00 AM',
      location: event.location,
      included: ['Equipment rental', 'Refreshments', '2-hour session', 'Professional coaching'],
      spotsLeft: 12, // 20 - 8 spots taken
      totalSpots: 20,
      price: 15,
      image: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=400&h=200&fit=crop'
    };
    
    setSelectedSportsEvent(sportsEvent);
    setShowRegistrationModal(true);
  };

  // Helper function to render the correct button based on event type
  const renderEventButton = (event: any) => {
    if (event.type === 'CAFE_MEETUP') {
      return (
        <JoinButton 
          onClick={(e) => {
            e.stopPropagation();
            handleCafeMeetupBooking(event);
          }}
        >
          ☕ Book Meetup Slots
        </JoinButton>
      );
    } else if (event.type === 'SPORTS') {
      return (
        <JoinButton 
          onClick={(e) => {
            e.stopPropagation();
            handleSportsEventRegistration(event);
          }}
          style={{ background: 'linear-gradient(135deg, #FF6B6B, #FF8E8E)' }}
        >
          💰 Register & Pay
        </JoinButton>
      );
    } else {
      return (
        <JoinButton 
          onClick={(e) => {
            e.stopPropagation();
            handleJoinEvent(event);
          }}
        >
          {joinedEvents.includes(event.id) ? '✓ Joined' : '🤝 Join'}
        </JoinButton>
      );
    }
  };

  // Event action handlers
  const handleJoinEvent = (event: any) => {
    // Convert API event to EventData format
    const eventData: EventData = {
      id: event.id,
      title: event.title,
      description: event.description,
      date: event.date,
      location: event.location,
      type: event.type,
      hostName: event.hostName,
      participantCount: event.participantCount,
      maxParticipants: event.maxParticipants,
      pointsReward: 3, // Default points
      emoji: '☕', // Default emoji
      isJoined: joinedEvents.includes(event.id)
    };
    
    if (joinedEvents.includes(event.id)) {
      // Already joined, show message
      alert('You have already joined this event!');
      return;
    }
    
    setSelectedEvent(eventData);
    setShowJoinConfirmation(true);
  };

  const confirmJoinEvent = () => {
    if (!selectedEvent) return;

    // Update joined events
    const updatedJoinedEvents = [...joinedEvents, selectedEvent.id];
    setJoinedEvents(updatedJoinedEvents);
    localStorage.setItem('joined_events', JSON.stringify(updatedJoinedEvents));

    // Update event participant count in the events list (would be API call in real app)
    // setEvents(prev => prev.map(event => 
    //   event.id === selectedEvent.id 
    //     ? { ...event, participantCount: event.participantCount + 1 }
    //     : event
    // ));

    // Store joined event details for history
    const existingHistory = JSON.parse(localStorage.getItem('event_history') || '[]');
    const newHistoryEntry = {
      id: selectedEvent.id,
      type: 'joined_event',
      title: selectedEvent.title,
      date: selectedEvent.date,
      location: selectedEvent.location,
      hostName: selectedEvent.hostName,
      joinedAt: new Date().toISOString()
    };
    existingHistory.push(newHistoryEntry);
    localStorage.setItem('event_history', JSON.stringify(existingHistory));

    setShowJoinConfirmation(false);
    setSelectedEvent(null);

    // Show success message
    setTimeout(() => {
      alert(`Successfully joined "${selectedEvent.title}"! You'll receive updates about this event.`);
    }, 100);
  };

  const cancelJoinEvent = () => {
    setShowJoinConfirmation(false);
    setSelectedEvent(null);
  };

  const handleLearnMore = (eventId: string) => {
    navigate(`/event/${eventId}`);
  };

  const handleCreateEvent = () => {
    // Check if user is admin (for now, checking if user exists - in real app would check user role)
    if (!user) {
      alert('Please log in to create events.');
      return;
    }
    
    // In a real app, you would check user.role === 'admin' or similar
    // For now, allowing all authenticated users to create events
    navigate('/event/create');
  };


  const locationOptions = [
    'KL City Centre',
    'Shah Alam',
    'Johor Bharu',
    'Global Hub',
    'Damansara',
    'Penang',
    'Alor Setar'
  ];

  const eventCategoryOptions = [
    {
      name: 'Social Events',
      description: 'BerseMuka Networking and community gathering events'
    },
    {
      name: 'Cafe Meetups',
      description: 'Coffee sessions, casual conversations, co-working spaces'
    },
    {
      name: 'Ilm Initiative',
      description: 'Islamic studies, Quran circles, knowledge sharing sessions'
    },
    {
      name: 'Donate',
      description: 'Charity drives, community service, fundraising events'
    },
    {
      name: 'Trips',
      description: 'Group travels, cultural explorations, adventure outings'
    },
    {
      name: 'Sukan Squad',
      description: 'Sports activities, fitness groups, outdoor adventures'
    },
    {
      name: 'Volunteer',
      description: 'Community service, environmental projects, helping initiatives'
    }
  ];

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      // For now, using mock data since API might not have events
      // const mockEvents = [
      //   {
      //     id: '1',
      //     title: 'Monday Meetups at Mesra Cafe KLCC',
      //     description: 'Weekly casual meetups at the popular Mesra Cafe in KLCC.',
      //     date: '2025-05-25T19:00:00Z',
      //     location: 'KLCC, Kuala Lumpur',
      //     type: 'CAFE_MEETUP',
      //     hostName: 'Ahmed Sumone',
      //     participantCount: 12
      //   }
      // ];
      // setEvents(mockEvents);
      // setFilteredEvents(mockEvents);
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEventClick = (eventId: string) => {
    console.log('Event clicked:', eventId);
  };

  const handleLocationFilterChange = (location: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      locations: checked 
        ? [...prev.locations, location]
        : prev.locations.filter(l => l !== location)
    }));
  };

  const handleCategoryFilterChange = (category: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      interests: checked 
        ? [...prev.interests, category]
        : prev.interests.filter(i => i !== category)
    }));
  };

  const clearFilters = () => {
    setFilters({ locations: [], interests: [] });
  };

  const applyFilters = () => {
    // Apply filter logic here
    console.log('Applying filters:', filters);
    setShowLocationModal(false);
    setShowCategoryModal(false);
  };

  const getFilterButtonText = (type: 'location' | 'category') => {
    if (type === 'location') {
      return filters.locations.length > 0 
        ? `Location (${filters.locations.length})`
        : 'Location';
    } else {
      return filters.interests.length > 0 
        ? `Event Categories (${filters.interests.length})`
        : 'Event Categories';
    }
  };

  return (
    <Container>
      <StatusBar />
      
      <Header>
        <HeaderTop>
          <UserInfo>
            <Avatar>ZA</Avatar>
            <HeaderText>
              <h3>Build Communities & Friendship</h3>
              <h2>BerseConnect</h2>
            </HeaderText>
          </UserInfo>
          <NotificationBell />
        </HeaderTop>
      </Header>

      <Content>
        <SearchContainer>
          <SearchBar>
            <span style={{ fontSize: '16px', color: '#999' }}>🔍</span>
            <SearchInput 
              placeholder="Search events"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </SearchBar>
          
          <FilterRow>
            <FilterButtonStyled 
              hasFilter={filters.locations.length > 0}
              onClick={() => setShowLocationModal(true)}
            >
              {getFilterButtonText('location')}
            </FilterButtonStyled>
            
            <FilterButtonStyled 
              hasFilter={filters.interests.length > 0}
              onClick={() => setShowCategoryModal(true)}
            >
              {getFilterButtonText('category')}
            </FilterButtonStyled>
          </FilterRow>
        </SearchContainer>

        {/* Action Buttons */}
        <CreateEventButton onClick={handleCreateEvent}>
          ➕ Create Event
        </CreateEventButton>

        {isLoading ? (
          <div style={{ textAlign: 'center', color: '#666', padding: '40px' }}>
            Loading events...
          </div>
        ) : (
          <>
            <EventCard onClick={() => handleEventClick('1')}>
              <EventImage>
                ☕
                <EventBadge>Cafe Meetup</EventBadge>
                <EventReward>3 pts reward</EventReward>
              </EventImage>
              <EventContent>
                <EventMeta>
                  <EventHost>
                    <HostAvatar>AS</HostAvatar>
                    Ahmed Sumone
                  </EventHost>
                  <EventParticipants>
                    <ParticipantAvatars>
                      <ParticipantAvatar />
                      <ParticipantAvatar />
                      <ParticipantAvatar />
                    </ParticipantAvatars>
                    +9 joined
                  </EventParticipants>
                </EventMeta>
                
                <EventTitle>Monday Meetups at Mesra Cafe KLCC</EventTitle>
                
                <EventDetails>
                  <EventInfo>
                    📅 5 May 25 • 7:00 PM<br/>
                    📍 KLCC, Kuala Lumpur
                  </EventInfo>
                  <EventActions>
                    {renderEventButton({
                      id: '1',
                      title: 'Monday Meetups at Mesra Cafe KLCC',
                      description: 'Weekly casual meetups at the popular Mesra Cafe in KLCC.',
                      date: '2025-05-25T19:00:00Z',
                      location: 'KLCC, Kuala Lumpur',
                      type: 'CAFE_MEETUP',
                      hostName: 'Ahmed Sumone',
                      participantCount: 12
                    })}
                    <LearnMoreButton 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLearnMore('1');
                      }}
                    >
                      Learn More
                    </LearnMoreButton>
                    <ShareButton>🔗</ShareButton>
                  </EventActions>
                </EventDetails>
              </EventContent>
            </EventCard>

            {/* Second Event Card */}
            <EventCard>
              <EventImage style={{ background: 'linear-gradient(45deg, #FFE8E8, #FFD1D1)' }}>
                👥
                <EventBadge>Social</EventBadge>
                <EventReward>4 pts reward</EventReward>
              </EventImage>
              <EventContent>
                <EventMeta>
                  <EventHost>
                    <HostAvatar style={{ backgroundColor: '#FF6B6B' }}>KM</HostAvatar>
                    Ahl 'Umran Network'
                  </EventHost>
                  <EventParticipants>
                    <ParticipantAvatars>
                      <ParticipantAvatar style={{ backgroundColor: '#FF6B6B' }} />
                      <ParticipantAvatar style={{ backgroundColor: '#4ECDC4' }} />
                    </ParticipantAvatars>
                    +15 joined
                  </EventParticipants>
                </EventMeta>
                
                <EventTitle>BerseMuka Social Gathering</EventTitle>
                
                <EventDetails>
                  <EventInfo>
                    📅 6 May 25 • 6:30 PM<br/>
                    📍 Shah Alam
                  </EventInfo>
                  <EventActions>
                    {renderEventButton({
                      id: '2',
                      title: 'BerseMuka Social Gathering',
                      description: 'Join us for a fun social gathering to meet new people.',
                      date: '2025-05-06T18:30:00Z',
                      location: 'Shah Alam',
                      type: 'SOCIAL',
                      hostName: 'Ahl Umran Network',
                      participantCount: 17
                    })}
                    <LearnMoreButton 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLearnMore('2');
                      }}
                    >
                      Learn More
                    </LearnMoreButton>
                    <ShareButton>🔗</ShareButton>
                  </EventActions>
                </EventDetails>
              </EventContent>
            </EventCard>

            {/* Third Event Card */}
            <EventCard>
              <EventImage style={{ background: 'linear-gradient(45deg, #E8E8FF, #D1D1FF)' }}>
                🏝️
                <EventBadge>Trip</EventBadge>
                <EventReward>8 pts reward</EventReward>
              </EventImage>
              <EventContent>
                <EventMeta>
                  <EventHost>
                    <HostAvatar style={{ backgroundColor: '#7B68EE' }}>SM</HostAvatar>
                    Siti Maryam
                  </EventHost>
                  <EventParticipants>
                    <ParticipantAvatars>
                      <ParticipantAvatar style={{ backgroundColor: '#7B68EE' }} />
                      <ParticipantAvatar style={{ backgroundColor: '#FF6B6B' }} />
                      <ParticipantAvatar style={{ backgroundColor: '#4ECDC4' }} />
                    </ParticipantAvatars>
                    +6 joined
                  </EventParticipants>
                </EventMeta>
                
                <EventTitle>Weekend Trip to Penang</EventTitle>
                
                <EventDetails>
                  <EventInfo>
                    📅 10-12 May 25 • 2 Days<br/>
                    📍 George Town, Penang
                  </EventInfo>
                  <EventActions>
                    {renderEventButton({
                      id: '3',
                      title: 'Weekend Trip to Penang',
                      description: 'Explore the beautiful George Town with fellow travelers.',
                      date: '2025-05-10T14:00:00Z',
                      location: 'George Town, Penang',
                      type: 'TRIP',
                      hostName: 'Siti Maryam',
                      participantCount: 9
                    })}
                    <LearnMoreButton 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLearnMore('3');
                      }}
                    >
                      Learn More
                    </LearnMoreButton>
                    <ShareButton>🔗</ShareButton>
                  </EventActions>
                </EventDetails>
              </EventContent>
            </EventCard>

            {/* Fourth Event Card */}
            <EventCard>
              <EventImage style={{ background: 'linear-gradient(45deg, #E8FFE8, #D1FFD1)' }}>
                🗺️
                <EventBadge>Local Guide</EventBadge>
                <EventReward>5 pts reward</EventReward>
              </EventImage>
              <EventContent>
                <EventMeta>
                  <EventHost>
                    <HostAvatar style={{ backgroundColor: '#4CAF50' }}>AR</HostAvatar>
                    Ahmad Rahman
                  </EventHost>
                  <EventParticipants>
                    <ParticipantAvatars>
                      <ParticipantAvatar style={{ backgroundColor: '#4CAF50' }} />
                      <ParticipantAvatar style={{ backgroundColor: '#2196F3' }} />
                    </ParticipantAvatars>
                    +4 joined
                  </EventParticipants>
                </EventMeta>
                
                <EventTitle>Local Guide Around Melaka</EventTitle>
                
                <EventDetails>
                  <EventInfo>
                    📅 15 May 25 • 10:00 AM<br/>
                    📍 Melaka Historical City
                  </EventInfo>
                  <EventActions>
                    {renderEventButton({
                      id: '4',
                      title: 'Local Guide Around Melaka',
                      description: 'Discover hidden gems in the historical city of Melaka.',
                      date: '2025-05-15T10:00:00Z',
                      location: 'Melaka Historical City',
                      type: 'VOLUNTEER',
                      hostName: 'Ahmad Rahman',
                      participantCount: 6
                    })}
                    <LearnMoreButton 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLearnMore('4');
                      }}
                    >
                      Learn More
                    </LearnMoreButton>
                    <ShareButton>🔗</ShareButton>
                  </EventActions>
                </EventDetails>
              </EventContent>
            </EventCard>

            {/* Fifth Event Card */}
            <EventCard>
              <EventImage style={{ background: 'linear-gradient(45deg, #E8F4FF, #D1E7FF)' }}>
                🏸
                <EventBadge>Sports</EventBadge>
                <EventReward>4 pts reward</EventReward>
              </EventImage>
              <EventContent>
                <EventMeta>
                  <EventHost>
                    <HostAvatar style={{ backgroundColor: '#2196F3' }}>SS</HostAvatar>
                    Sukan Squad
                  </EventHost>
                  <EventParticipants>
                    <ParticipantAvatars>
                      <ParticipantAvatar style={{ backgroundColor: '#2196F3' }} />
                      <ParticipantAvatar style={{ backgroundColor: '#FF9800' }} />
                      <ParticipantAvatar style={{ backgroundColor: '#4CAF50' }} />
                    </ParticipantAvatars>
                    +8 joined
                  </EventParticipants>
                </EventMeta>
                
                <EventTitle>BerseMinton by Sukan Squad</EventTitle>
                
                <EventDetails>
                  <EventInfo>
                    📅 18 May 25 • 8:00 AM<br/>
                    📍 Shah Alam Sports Complex
                  </EventInfo>
                  <EventActions>
                    {renderEventButton({
                      id: '5',
                      title: 'BerseMinton by Sukan Squad',
                      description: 'Join us for badminton games and sports activities.',
                      date: '2025-05-18T08:00:00Z',
                      location: 'Shah Alam Sports Complex',
                      type: 'SPORTS',
                      hostName: 'Sukan Squad',
                      participantCount: 11
                    })}
                    <LearnMoreButton 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLearnMore('5');
                      }}
                    >
                      Learn More
                    </LearnMoreButton>
                    <ShareButton>🔗</ShareButton>
                  </EventActions>
                </EventDetails>
              </EventContent>
            </EventCard>

            {/* Sixth Event Card */}
            <EventCard>
              <EventImage style={{ background: 'linear-gradient(45deg, #F0F8E8, #E1F4D1)' }}>
                🌱
                <EventBadge>Volunteer</EventBadge>
                <EventReward>6 pts reward</EventReward>
              </EventImage>
              <EventContent>
                <EventMeta>
                  <EventHost>
                    <HostAvatar style={{ backgroundColor: '#8BC34A' }}>MT</HostAvatar>
                    Mukha Tree
                  </EventHost>
                  <EventParticipants>
                    <ParticipantAvatars>
                      <ParticipantAvatar style={{ backgroundColor: '#8BC34A' }} />
                      <ParticipantAvatar style={{ backgroundColor: '#4CAF50' }} />
                    </ParticipantAvatars>
                    +7 joined
                  </EventParticipants>
                </EventMeta>
                
                <EventTitle>Volunteer Permaculture Farm at Mukha Tree</EventTitle>
                
                <EventDetails>
                  <EventInfo>
                    📅 20 May 25 • 7:00 AM<br/>
                    📍 Rawang, Selangor
                  </EventInfo>
                  <EventActions>
                    {renderEventButton({
                      id: '6',
                      title: 'Volunteer Permaculture Farm at Mukha Tree',
                      description: 'Help with farming activities and learn about permaculture.',
                      date: '2025-05-20T07:00:00Z',
                      location: 'Rawang, Selangor',
                      type: 'VOLUNTEER',
                      hostName: 'Mukha Tree',
                      participantCount: 9
                    })}
                    <LearnMoreButton 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLearnMore('6');
                      }}
                    >
                      Learn More
                    </LearnMoreButton>
                    <ShareButton>🔗</ShareButton>
                  </EventActions>
                </EventDetails>
              </EventContent>
            </EventCard>

            {/* Seventh Event Card */}
            <EventCard>
              <EventImage style={{ background: 'linear-gradient(45deg, #FFF8E1, #FFECB3)' }}>
                📚
                <EventBadge>Ilm Initiative</EventBadge>
                <EventReward>5 pts reward</EventReward>
              </EventImage>
              <EventContent>
                <EventMeta>
                  <EventHost>
                    <HostAvatar style={{ backgroundColor: '#FF9800' }}>AU</HostAvatar>
                    Ahl 'Umran Network
                  </EventHost>
                  <EventParticipants>
                    <ParticipantAvatars>
                      <ParticipantAvatar style={{ backgroundColor: '#FF9800' }} />
                      <ParticipantAvatar style={{ backgroundColor: '#F57C00' }} />
                      <ParticipantAvatar style={{ backgroundColor: '#E65100' }} />
                    </ParticipantAvatars>
                    +12 joined
                  </EventParticipants>
                </EventMeta>
                
                <EventTitle>Friendship Manual by Ahl 'Umran Network</EventTitle>
                
                <EventDetails>
                  <EventInfo>
                    📅 22 May 25 • 2:00 PM<br/>
                    📍 IIUM Gombak
                  </EventInfo>
                  <EventActions>
                    {renderEventButton({
                      id: '7',
                      title: 'Friendship Manual by Ahl Umran Network',
                      description: 'Learn about building meaningful friendships and connections.',
                      date: '2025-05-22T14:00:00Z',
                      location: 'IIUM Gombak',
                      type: 'ILM',
                      hostName: 'Ahl Umran Network',
                      participantCount: 15
                    })}
                    <LearnMoreButton 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLearnMore('7');
                      }}
                    >
                      Learn More
                    </LearnMoreButton>
                    <ShareButton>🔗</ShareButton>
                  </EventActions>
                </EventDetails>
              </EventContent>
            </EventCard>
          </>
        )}
      </Content>

      {/* Location Filter Modal */}
      <FilterModalOverlay isOpen={showLocationModal} onClick={() => setShowLocationModal(false)}>
        <FilterModal onClick={(e) => e.stopPropagation()}>
          <FilterModalHeader>
            <FilterModalTitle>Filter by Location</FilterModalTitle>
            <FilterCloseButton onClick={() => setShowLocationModal(false)}>×</FilterCloseButton>
          </FilterModalHeader>
          
          <CheckboxGrid>
            {locationOptions.map((location) => (
              <CheckboxItem key={location}>
                <Checkbox
                  type="checkbox"
                  checked={filters.locations.includes(location)}
                  onChange={(e) => handleLocationFilterChange(location, e.target.checked)}
                />
                {location}
              </CheckboxItem>
            ))}
          </CheckboxGrid>
          
          <FilterActions>
            <ApplyButton onClick={applyFilters}>Apply Filters</ApplyButton>
            <ClearButton onClick={clearFilters}>Clear All</ClearButton>
          </FilterActions>
        </FilterModal>
      </FilterModalOverlay>

      {/* Event Categories Filter Modal */}
      <FilterModalOverlay isOpen={showCategoryModal} onClick={() => setShowCategoryModal(false)}>
        <FilterModal onClick={(e) => e.stopPropagation()}>
          <FilterModalHeader>
            <FilterModalTitle>Filter by Event Categories</FilterModalTitle>
            <FilterCloseButton onClick={() => setShowCategoryModal(false)}>×</FilterCloseButton>
          </FilterModalHeader>
          
          <CheckboxGrid>
            {eventCategoryOptions.map((category) => (
              <CheckboxItem key={category.name}>
                <Checkbox
                  type="checkbox"
                  checked={filters.interests.includes(category.name)}
                  onChange={(e) => handleCategoryFilterChange(category.name, e.target.checked)}
                />
                <div>
                  <div style={{ fontWeight: '600', marginBottom: '2px' }}>{category.name}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>{category.description}</div>
                </div>
              </CheckboxItem>
            ))}
          </CheckboxGrid>
          
          <FilterActions>
            <ApplyButton onClick={applyFilters}>Apply Filters</ApplyButton>
            <ClearButton onClick={clearFilters}>Clear All</ClearButton>
          </FilterActions>
        </FilterModal>
      </FilterModalOverlay>

      {/* Join Event Confirmation Modal */}
      <ConfirmationModal show={showJoinConfirmation}>
        <ModalContent>
          <ModalTitle>Join Event</ModalTitle>
          <ModalText>
            Are you sure you want to join <strong>"{selectedEvent?.title}"</strong>?
            <br /><br />
            📅 {selectedEvent?.date ? new Date(selectedEvent.date).toLocaleDateString() : ''}<br />
            📍 {selectedEvent?.location}<br />
            👥 Hosted by {selectedEvent?.hostName}
          </ModalText>
          <ModalButtons>
            <ModalButton onClick={cancelJoinEvent}>Cancel</ModalButton>
            <ModalButton primary onClick={confirmJoinEvent}>Join Event</ModalButton>
          </ModalButtons>
        </ModalContent>
      </ConfirmationModal>

      <MainNav 
        activeTab="connect"
        onTabPress={(tab) => {
          switch (tab) {
            case 'home':
              navigate('/dashboard');
              break;
            case 'connect':
              navigate('/connect');
              break;
            case 'match':
              navigate('/match');
              break;
            case 'forum':
              navigate('/forum');
              break;
          }
        }}
      />

      {/* Sports Event Registration Modal */}
      <EventRegistrationModal
        isOpen={showRegistrationModal}
        onClose={() => {
          setShowRegistrationModal(false);
          setSelectedSportsEvent(null);
        }}
        event={selectedSportsEvent}
      />
    </Container>
  );
};