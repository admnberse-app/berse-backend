import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { StatusBar } from '../components/StatusBar/StatusBar';
import { MainNav } from '../components/MainNav/MainNav';

export const MyEventsScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container>
      <StatusBar />
      
      <Header>
        <BackButton onClick={() => navigate('/profile')}>←</BackButton>
        <HeaderTitle>📅 My Events</HeaderTitle>
      </Header>

      <Content>
        <EventsList>
          <EventItem>
            <EventIcon>🚶‍♂️</EventIcon>
            <EventInfo>
              <EventName>KL Heritage Walking Tour</EventName>
              <EventDate>Jan 15, 2025 • 2:00 PM</EventDate>
              <EventStatus>Registered</EventStatus>
            </EventInfo>
          </EventItem>
          
          <EventItem>
            <EventIcon>📸</EventIcon>
            <EventInfo>
              <EventName>Photography Meetup</EventName>
              <EventDate>Jan 20, 2025 • 6:00 PM</EventDate>
              <EventStatus>Interested</EventStatus>
            </EventInfo>
          </EventItem>
          
          <EventItem>
            <EventIcon>🎨</EventIcon>
            <EventInfo>
              <EventName>Art & Culture Workshop</EventName>
              <EventDate>Feb 5, 2025 • 10:00 AM</EventDate>
              <EventStatus>Registered</EventStatus>
            </EventInfo>
          </EventItem>
          
          <EventItem>
            <EventIcon>🍽️</EventIcon>
            <EventInfo>
              <EventName>Food Tour - Little India</EventName>
              <EventDate>Feb 12, 2025 • 7:00 PM</EventDate>
              <EventStatus>Waitlist</EventStatus>
            </EventInfo>
          </EventItem>
        </EventsList>
      </Content>

      <MainNav 
        activeTab="profile"
        onTabPress={(tab) => {
          switch (tab) {
            case 'home': navigate('/dashboard'); break;
            case 'connect': navigate('/berseconnect'); break;
            case 'match': navigate('/match'); break;
            case 'profile': navigate('/profile'); break;
          }
        }}
      />
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #F5F3EF;
  max-width: 393px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  padding: 16px 20px;
  background-color: #F5F3EF;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  color: #2D5F4F;
  cursor: pointer;
  margin-right: 12px;
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
  padding-bottom: 80px;
`;

const EventsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const EventItem = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const EventIcon = styled.div`
  font-size: 24px;
  width: 40px;
  text-align: center;
`;

const EventInfo = styled.div`
  flex: 1;
`;

const EventName = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 4px 0;
`;

const EventDate = styled.p`
  font-size: 12px;
  color: #666;
  margin: 0 0 4px 0;
`;

const EventStatus = styled.span`
  background: ${({ children }) => 
    children === 'Registered' ? '#D4F6D4' :
    children === 'Interested' ? '#E8F4FD' :
    children === 'Waitlist' ? '#FFF3CD' : '#F0F0F0'
  };
  color: ${({ children }) => 
    children === 'Registered' ? '#155724' :
    children === 'Interested' ? '#0C5460' :
    children === 'Waitlist' ? '#856404' : '#666'
  };
  padding: 2px 8px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 600;
`;