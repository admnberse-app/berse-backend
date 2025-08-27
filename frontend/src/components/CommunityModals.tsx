import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useMessaging } from '../contexts/MessagingContext';

// Styled Components
const Modal = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: ${({ $isOpen }) => $isOpen ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 20px;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
`;

const Header = styled.div`
  background: linear-gradient(135deg, #2fce98, #4A90A4);
  color: white;
  padding: 24px;
  border-radius: 20px 20px 0 0;
  position: relative;
`;

const Title = styled.h2`
  font-size: 22px;
  font-weight: bold;
  margin: 0 0 8px 0;
`;

const Subtitle = styled.p`
  font-size: 14px;
  opacity: 0.9;
  margin: 0;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  font-size: 28px;
  cursor: pointer;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: rotate(90deg);
  }
`;

const Body = styled.div`
  padding: 24px;
`;

const Section = styled.div`
  margin-bottom: 24px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const EventGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
  max-height: 200px;
  overflow-y: auto;
  padding: 4px;
`;

const EventCard = styled.div<{ $selected: boolean }>`
  padding: 12px;
  border: 2px solid ${props => props.$selected ? '#2fce98' : '#e5e5e5'};
  border-radius: 12px;
  background: ${props => props.$selected ? '#f0fdf7' : '#f9f9f9'};
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: #2fce98;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
`;

const EventTitle = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
`;

const EventDate = styled.div`
  font-size: 11px;
  color: #666;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 1px solid #e5e5e5;
  border-radius: 12px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  min-height: 100px;
  
  &:focus {
    outline: none;
    border-color: #2fce98;
    box-shadow: 0 0 0 3px rgba(47, 206, 152, 0.1);
  }
  
  &::placeholder {
    color: #999;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;
`;

const Button = styled.button<{ $primary?: boolean }>`
  flex: 1;
  padding: 14px;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  ${props => props.$primary ? `
    background: linear-gradient(135deg, #2fce98, #27b584);
    color: white;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(47, 206, 152, 0.3);
    }
    
    &:disabled {
      background: #ccc;
      cursor: not-allowed;
      transform: none;
    }
  ` : `
    background: #f5f5f5;
    color: #666;
    
    &:hover {
      background: #e8e8e8;
    }
  `}
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  font-size: 14px;
  margin-bottom: 12px;
  
  &:focus {
    outline: none;
    border-color: #2fce98;
  }
`;

const NoEventsMessage = styled.div`
  text-align: center;
  padding: 20px;
  color: #999;
  font-size: 14px;
`;

const SuggestionChips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
`;

const Chip = styled.button`
  padding: 6px 12px;
  background: #f0f0f0;
  border: none;
  border-radius: 16px;
  font-size: 12px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #2fce98;
    color: white;
  }
`;

// Friend Request Modal Component
interface FriendRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: any;
  onSend: (eventId: string, message: string) => void;
}

export const FriendRequestModal: React.FC<FriendRequestModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSend
}) => {
  const { user } = useAuth();
  const { sendMessage, addNotification } = useMessaging();
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [message, setMessage] = useState('');
  const [events, setEvents] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // Load events from connect screen
  useEffect(() => {
    if (isOpen) {
      loadEvents();
      // Pre-fill message with a friendly intro
      setMessage(`Hi ${profile?.name}! I'd love to connect with you. `);
    }
  }, [isOpen, profile]);

  const loadEvents = async () => {
    try {
      // Load from localStorage first
      const cachedEvents = localStorage.getItem('cached_events');
      if (cachedEvents) {
        setEvents(JSON.parse(cachedEvents));
      }

      // Try to load from backend
      const token = localStorage.getItem('bersemuka_token');
      if (token) {
        const API_BASE_URL = window.location.hostname === 'berse.app' || window.location.hostname === 'www.berse.app'
          ? 'https://api.berse.app'
          : '';
        
        const response = await axios.get(
          `${API_BASE_URL}/api/v1/events`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        if (response.data.success && response.data.data) {
          setEvents(response.data.data);
          // Cache for future use
          localStorage.setItem('cached_events', JSON.stringify(response.data.data));
        }
      }
    } catch (error) {
      console.error('Failed to load events:', error);
    }
  };

  const handleSend = async () => {
    if (!message.trim()) {
      alert('Please add a message');
      return;
    }

    setLoading(true);
    try {
      // Create the friend request message
      const fullMessage = selectedEvent 
        ? `${message}\n\n📍 We met at: ${events.find(e => e.id === selectedEvent)?.title || 'an event'}`
        : message;

      // Send message through messaging context
      await sendMessage(profile.id, fullMessage, 'friend_request');

      // Add notification
      await addNotification({
        type: 'friend_request',
        title: 'New Friend Request',
        message: `${user?.fullName || user?.username} wants to connect with you`,
        from: user?.id,
        fromName: user?.fullName || user?.username,
        timestamp: new Date().toISOString(),
        read: false,
        data: {
          eventId: selectedEvent,
          profileId: user?.id
        }
      });

      // Store friend request locally
      const friendRequests = JSON.parse(localStorage.getItem('friend_requests') || '[]');
      friendRequests.push({
        to: profile.id,
        toName: profile.name,
        from: user?.id,
        fromName: user?.fullName || user?.username,
        message: fullMessage,
        eventId: selectedEvent,
        timestamp: new Date().toISOString(),
        status: 'pending'
      });
      localStorage.setItem('friend_requests', JSON.stringify(friendRequests));

      // Send push notification if available
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Friend Request Sent! 🎉', {
          body: `Your request to connect with ${profile.name} has been sent`,
          icon: '/icon-192x192.png',
          badge: '/icon-192x192.png'
        });
      }

      // Call the parent callback
      onSend(selectedEvent, fullMessage);
      
      // Reset and close
      setMessage('');
      setSelectedEvent('');
      onClose();
      
      alert(`✅ Friend request sent to ${profile?.name}! They will receive a notification.`);
    } catch (error) {
      console.error('Failed to send friend request:', error);
      alert('Failed to send friend request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(event => 
    event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const messageSuggestions = [
    "Looking forward to connecting!",
    "Would love to grab coffee sometime!",
    "Great to meet a fellow community member!",
    "Your profile really resonates with me!",
    "Let's explore the city together!"
  ];

  return (
    <Modal $isOpen={isOpen}>
      <ModalContent>
        <Header>
          <CloseButton onClick={onClose}>×</CloseButton>
          <Title>🤝 Send Friend Request</Title>
          <Subtitle>Connect with {profile?.name}</Subtitle>
        </Header>

        <Body>
          <Section>
            <SectionTitle>
              📍 Where did you meet? (Optional)
            </SectionTitle>
            <SearchInput
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {filteredEvents.length > 0 ? (
              <EventGrid>
                {filteredEvents.map(event => (
                  <EventCard
                    key={event.id}
                    $selected={selectedEvent === event.id}
                    onClick={() => setSelectedEvent(event.id === selectedEvent ? '' : event.id)}
                  >
                    <EventTitle>{event.title}</EventTitle>
                    <EventDate>{event.date} • {event.location}</EventDate>
                  </EventCard>
                ))}
              </EventGrid>
            ) : (
              <NoEventsMessage>
                No events found. You can still send a request!
              </NoEventsMessage>
            )}
          </Section>

          <Section>
            <SectionTitle>
              💬 Add a personal message
            </SectionTitle>
            <TextArea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Introduce yourself and share why you'd like to connect..."
              maxLength={500}
            />
            <div style={{ fontSize: '12px', color: '#999', marginTop: '4px', textAlign: 'right' }}>
              {message.length}/500
            </div>
            
            <SuggestionChips>
              {messageSuggestions.map((suggestion, idx) => (
                <Chip
                  key={idx}
                  onClick={() => setMessage(prev => prev + ' ' + suggestion)}
                >
                  {suggestion}
                </Chip>
              ))}
            </SuggestionChips>
          </Section>

          <ButtonGroup>
            <Button onClick={onClose}>Cancel</Button>
            <Button 
              $primary 
              onClick={handleSend}
              disabled={loading || !message.trim()}
            >
              {loading ? 'Sending...' : 'Send Request'}
            </Button>
          </ButtonGroup>
        </Body>
      </ModalContent>
    </Modal>
  );
};

// Join Community Modal Component
interface JoinCommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  community: any;
  onJoin: (message: string) => void;
}

export const JoinCommunityModal: React.FC<JoinCommunityModalProps> = ({
  isOpen,
  onClose,
  community,
  onJoin
}) => {
  const { user } = useAuth();
  const { addNotification } = useMessaging();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && community) {
      setMessage(`Hi! I'm interested in joining ${community.name}. `);
    }
  }, [isOpen, community]);

  const handleJoin = async () => {
    if (!message.trim()) {
      alert('Please add a message for the community admin');
      return;
    }

    setLoading(true);
    try {
      // Store join request
      const joinRequests = JSON.parse(localStorage.getItem('community_join_requests') || '[]');
      joinRequests.push({
        communityId: community.id,
        communityName: community.name,
        userId: user?.id,
        userName: user?.fullName || user?.username,
        message,
        timestamp: new Date().toISOString(),
        status: 'pending'
      });
      localStorage.setItem('community_join_requests', JSON.stringify(joinRequests));

      // Add notification
      await addNotification({
        type: 'community_request',
        title: 'Community Join Request',
        message: `${user?.fullName || user?.username} wants to join ${community.name}`,
        from: user?.id,
        fromName: user?.fullName || user?.username,
        timestamp: new Date().toISOString(),
        read: false,
        data: {
          communityId: community.id,
          communityName: community.name
        }
      });

      // Send push notification if available
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Join Request Sent! 🎉', {
          body: `Your request to join ${community.name} has been sent`,
          icon: '/icon-192x192.png',
          badge: '/icon-192x192.png'
        });
      }

      onJoin(message);
      setMessage('');
      onClose();
      
      alert(`✅ Join request sent to ${community.name}! The admin will review your request.`);
    } catch (error) {
      console.error('Failed to send join request:', error);
      alert('Failed to send join request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal $isOpen={isOpen}>
      <ModalContent>
        <Header>
          <CloseButton onClick={onClose}>×</CloseButton>
          <Title>👥 Join Community</Title>
          <Subtitle>Request to join {community?.name}</Subtitle>
        </Header>

        <Body>
          <Section>
            <SectionTitle>
              📋 Community Details
            </SectionTitle>
            <div style={{ 
              padding: '16px', 
              background: '#f9f9f9', 
              borderRadius: '12px',
              marginBottom: '16px'
            }}>
              <div style={{ fontWeight: '600', marginBottom: '8px' }}>{community?.name}</div>
              <div style={{ fontSize: '13px', color: '#666', marginBottom: '4px' }}>
                {community?.memberCount || 0} members • {community?.eventCount || 0} events
              </div>
              <div style={{ fontSize: '13px', color: '#666' }}>
                {community?.description || 'No description available'}
              </div>
            </div>
          </Section>

          <Section>
            <SectionTitle>
              💬 Why do you want to join?
            </SectionTitle>
            <TextArea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell the community admin why you're interested in joining..."
              maxLength={500}
            />
            <div style={{ fontSize: '12px', color: '#999', marginTop: '4px', textAlign: 'right' }}>
              {message.length}/500
            </div>
          </Section>

          <ButtonGroup>
            <Button onClick={onClose}>Cancel</Button>
            <Button 
              $primary 
              onClick={handleJoin}
              disabled={loading || !message.trim()}
            >
              {loading ? 'Sending...' : 'Send Request'}
            </Button>
          </ButtonGroup>
        </Body>
      </ModalContent>
    </Modal>
  );
};