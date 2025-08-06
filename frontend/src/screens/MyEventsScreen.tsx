import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { StatusBar } from '../components/StatusBar';
import { MainNav } from '../components/MainNav';
import { ProfileSidebar } from '../components/ProfileSidebar/ProfileSidebar';

export const MyEventsScreen: React.FC = () => {
  const navigate = useNavigate();
  const [showProfileSidebar, setShowProfileSidebar] = useState(false);

  const addToGoogleCalendar = (event: any) => {
    const startDate = new Date(event.date).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const endDate = new Date(new Date(event.date).getTime() + 2 * 60 * 60 * 1000).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${startDate}/${endDate}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}`;
    
    window.open(calendarUrl, '_blank');
  };

  const mockEvents = [
    {
      id: '1',
      title: 'KL Heritage Walking Tour',
      date: '2025-01-15T14:00:00',
      location: 'Kuala Lumpur Heritage Trail',
      status: 'confirmed',
      description: 'Explore the rich heritage of Kuala Lumpur with fellow architecture enthusiasts.',
      reminder: true
    },
    {
      id: '2',
      title: 'Photography Meetup - Chinatown',
      date: '2025-01-20T18:00:00',
      location: 'Chinatown, KL',
      status: 'pending',
      description: 'Capture the vibrant street life and culture of Chinatown.',
      reminder: false
    },
    {
      id: '3',
      title: 'BerseMukha Coffee Session',
      date: '2025-01-22T16:00:00',
      location: 'Mukha Cafe, KLCC',
      status: 'confirmed',
      description: 'Casual coffee meetup to discuss upcoming projects.',
      reminder: true
    }
  ];

  return (
    <Container>
      <StatusBar onProfileClick={() => setShowProfileSidebar(true)} />
      
      <Header>
        <BackButton onClick={() => setShowProfileSidebar(true)}>←</BackButton>
        <HeaderTitle>📅 My Events</HeaderTitle>
      </Header>

      <Content>
        <EventsHeader>
          <EventsCount>You have {mockEvents.length} upcoming events</EventsCount>
          <SyncButton onClick={() => console.log('Sync with Google Calendar')}>
            📅 Sync Calendar
          </SyncButton>
        </EventsHeader>

        <EventsList>
          {mockEvents.map((event) => (
            <EventCard key={event.id}>
              <EventHeader>
                <EventDate>
                  {new Date(event.date).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short'
                  })}
                </EventDate>
                <EventStatus $status={event.status}>
                  {event.status === 'confirmed' ? 'CONFIRMED' : 'PENDING'}
                </EventStatus>
              </EventHeader>

              <EventContent>
                <EventTitle>{event.title}</EventTitle>
                <EventDetails>
                  <EventTime>
                    ⏰ {new Date(event.date).toLocaleTimeString('en-GB', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </EventTime>
                  <EventLocation>📍 {event.location}</EventLocation>
                </EventDetails>
                <EventDescription>{event.description}</EventDescription>
              </EventContent>

              <EventActions>
                <EventActionButton 
                  $primary
                  onClick={() => addToGoogleCalendar(event)}
                >
                  📅 Add to Calendar
                </EventActionButton>
                <EventActionButton onClick={() => console.log('Set reminder')}>
                  🔔 {event.reminder ? 'Reminder Set' : 'Set Reminder'}
                </EventActionButton>
                <EventActionButton onClick={() => console.log('View details')}>
                  ℹ️ Details
                </EventActionButton>
              </EventActions>
            </EventCard>
          ))}
        </EventsList>
      </Content>

      <MainNav 
        activeTab="home"
        onTabPress={(tab) => {
          switch (tab) {
            case 'home': navigate('/dashboard'); break;
            case 'connect': navigate('/connect'); break;
            case 'match': navigate('/match'); break;
            case 'forum': navigate('/forum'); break;
          }
        }}
      />

      <ProfileSidebar 
        isOpen={showProfileSidebar}
        onClose={() => setShowProfileSidebar(false)}
      />
    </Container>
  );
};

// Styled Components with Dashboard Background
const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #F9F3E3;
  max-width: 393px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  padding: 16px 20px;
  background-color: #F5F3EF; /* Dashboard background color */
`;

const BackButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  color: #2D5F4F;
  cursor: pointer;
  margin-right: 12px;
  
  &:hover {
    transform: scale(1.1);
  }
`;

const HeaderTitle = styled.h1`
  font-size: 20px;
  font-weight: bold;
  color: #2D5F4F;
  margin: 0;
`;

const Content = styled.div`
  flex: 1;
  padding: 20px;
  padding-bottom: 100px; /* Added extra space for floating nav */
`;

const EventsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const EventsCount = styled.p`
  font-size: 14px;
  color: #666;
  margin: 0;
`;

const SyncButton = styled.button`
  background: #4285F4;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  
  &:hover {
    background: #3367D6;
  }
`;

const EventsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const EventCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #2D5F4F;
`;

const EventHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const EventDate = styled.div`
  background: #2D5F4F;
  color: white;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: bold;
`;

const EventStatus = styled.span<{ $status: string }>`
  background: ${({ $status }) => 
    $status === 'confirmed' ? '#D4F6D4' : '#FFF3CD'
  };
  color: ${({ $status }) => 
    $status === 'confirmed' ? '#155724' : '#856404'
  };
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
`;

const EventContent = styled.div`
  margin-bottom: 16px;
`;

const EventTitle = styled.h3`
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin: 0 0 8px 0;
`;

const EventDetails = styled.div`
  margin-bottom: 8px;
`;

const EventTime = styled.p`
  font-size: 14px;
  color: #666;
  margin: 0 0 4px 0;
`;

const EventLocation = styled.p`
  font-size: 14px;
  color: #666;
  margin: 0 0 8px 0;
`;

const EventDescription = styled.p`
  font-size: 13px;
  color: #555;
  margin: 0;
  line-height: 1.4;
`;

const EventActions = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
`;

const EventActionButton = styled.button<{ $primary?: boolean }>`
  background: ${({ $primary }) => $primary ? '#4285F4' : 'white'};
  color: ${({ $primary }) => $primary ? 'white' : '#666'};
  border: 1px solid ${({ $primary }) => $primary ? '#4285F4' : '#E0E0E0'};
  border-radius: 8px;
  padding: 8px 4px;
  font-size: 10px;
  font-weight: 600;
  cursor: pointer;
  
  &:hover {
    background: ${({ $primary }) => $primary ? '#3367D6' : '#F5F5F5'};
  }
`;