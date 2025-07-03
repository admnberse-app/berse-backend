import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { StatusBar } from '../components/StatusBar';
import { Header } from '../components/Header';
import { MainNav } from '../components/MainNav';
import { Card } from '../components/Card';
import { Points } from '../components/Points';
import { Button } from '../components/Button';
import { SideMenu } from '../components/SideMenu';
import { NotificationPanel } from '../components/NotificationPanel';
import eventService from '@frontend-api/services/event.service';
import { Event } from '@frontend-api/types';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.background.default};
`;

const Content = styled.div`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.md};
  padding-bottom: 80px; // Space for nav
  overflow-y: auto;
  max-width: 393px;
  width: 100%;
  margin: 0 auto;
`;

const WelcomeSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const WelcomeText = styled.h2`
  font-size: ${({ theme }) => theme.typography.heading.h2.fontSize};
  font-weight: ${({ theme }) => theme.typography.heading.h2.fontWeight};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const Subtitle = styled.p`
  font-size: ${({ theme }) => theme.typography.body.medium.fontSize};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const QuickActions = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const ActionButton = styled(Button)`
  height: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const ActionIcon = styled.div`
  font-size: 36px;
`;

const SectionTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.heading.h3.fontSize};
  font-weight: ${({ theme }) => theme.typography.heading.h3.fontWeight};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const EventsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const LoadingMessage = styled.div`
  text-align: center;
  color: ${({ theme }) => theme.colors.text.secondary};
  padding: ${({ theme }) => theme.spacing.xl};
`;

export const DashboardScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);

  useEffect(() => {
    loadUpcomingEvents();
  }, []);

  const loadUpcomingEvents = async () => {
    try {
      const events = await eventService.getUpcomingEvents();
      setUpcomingEvents(events.slice(0, 3)); // Show only 3 events
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigation = (tab: string) => {
    setActiveTab(tab);
    switch (tab) {
      case 'connect':
        navigate('/connect');
        break;
      case 'match':
        navigate('/match');
        break;
      case 'profile':
        navigate('/profile');
        break;
      default:
        // Stay on dashboard
        break;
    }
  };

  return (
    <Container>
      <StatusBar />
      <Header
        title="BerseMuka"
        showNotifications
        notificationCount={3}
        points={user?.points || 0}
        onMenuClick={() => setIsSideMenuOpen(true)}
        onNotificationClick={() => setIsNotificationPanelOpen(true)}
      />
      
      <Content>
        <WelcomeSection>
          <WelcomeText>Welcome back, {user?.fullName || 'User'}!</WelcomeText>
          <Subtitle>Ready to connect and make a difference?</Subtitle>
        </WelcomeSection>

        <div onClick={() => navigate('/rewards')} style={{ cursor: 'pointer' }}>
          <Points points={user?.points || 0} size="large" />
        </div>

        <QuickActions>
          <ActionButton
            variant="secondary"
            onClick={() => navigate('/connect')}
          >
            <ActionIcon>🤝</ActionIcon>
            BerseConnect
          </ActionButton>
          <ActionButton
            variant="secondary"
            onClick={() => navigate('/match')}
          >
            <ActionIcon>💫</ActionIcon>
            BerseMatch
          </ActionButton>
        </QuickActions>

        <SectionTitle>Upcoming Events</SectionTitle>
        {isLoading ? (
          <LoadingMessage>Loading events...</LoadingMessage>
        ) : upcomingEvents.length > 0 ? (
          <EventsList>
            {upcomingEvents.map((event) => (
              <Card
                key={event.id}
                title={event.title}
                subtitle={new Date(event.date).toLocaleDateString()}
                description={event.description}
                onClick={() => console.log('View event:', event.id)}
              />
            ))}
          </EventsList>
        ) : (
          <LoadingMessage>No upcoming events</LoadingMessage>
        )}
      </Content>

      <MainNav
        activeTab={activeTab}
        onTabPress={handleNavigation}
      />
      
      <SideMenu
        isOpen={isSideMenuOpen}
        onClose={() => setIsSideMenuOpen(false)}
      />
      
      <NotificationPanel
        isOpen={isNotificationPanelOpen}
        onClose={() => setIsNotificationPanelOpen(false)}
        notificationCount={3}
      />
    </Container>
  );
};