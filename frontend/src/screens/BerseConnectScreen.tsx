import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { StatusBar } from '../components/StatusBar';
import { Header } from '../components/Header';
import { MainNav } from '../components/MainNav';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import eventService from '@frontend-api/services/event.service';
import { Event, EventType } from '@frontend-api/types';

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

const FilterSection = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  padding-bottom: ${({ theme }) => theme.spacing.sm};
`;

const FilterChip = styled.button<{ active: boolean }>`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borders.radius.pill};
  border: 1px solid ${({ theme, active }) => active ? theme.colors.primary.main : theme.colors.border.light};
  background-color: ${({ theme, active }) => active ? theme.colors.primary.main : theme.colors.background.default};
  color: ${({ theme, active }) => active ? theme.colors.common.white : theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.body.small.fontSize};
  font-weight: ${({ theme }) => theme.typography.body.small.fontWeight};
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ theme, active }) => active ? theme.colors.primary.dark : theme.colors.background.paper};
  }
`;

const EventsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const EventCard = styled(Card)`
  cursor: pointer;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  color: ${({ theme }) => theme.colors.text.secondary};
  padding: ${({ theme }) => theme.spacing.xl};
`;

const EmptyMessage = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xxl};
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const EmptyText = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.body.medium.fontSize};
`;

type EventCategory = 'all' | 'VOLUNTEER' | 'SOCIAL' | 'SPORTS' | 'ILM' | 'CAFE_MEETUP' | 'TRIP' | 'MONTHLY_EVENT';

export const BerseConnectScreen: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<EventCategory>('all');
  const [activeTab, setActiveTab] = useState('connect');

  const filters: { value: EventCategory; label: string }[] = [
    { value: 'all', label: 'All Events' },
    { value: 'VOLUNTEER', label: 'Volunteer' },
    { value: 'SOCIAL', label: 'Social' },
    { value: 'SPORTS', label: 'Sports' },
    { value: 'ILM', label: 'Education' },
    { value: 'CAFE_MEETUP', label: 'Cafe Meetup' },
    { value: 'TRIP', label: 'Trips' },
  ];

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    if (activeFilter === 'all') {
      setFilteredEvents(events);
    } else {
      setFilteredEvents(events.filter(event => event.type === activeFilter));
    }
  }, [activeFilter, events]);

  const loadEvents = async () => {
    try {
      const allEvents = await eventService.getAllEvents();
      setEvents(allEvents);
      setFilteredEvents(allEvents);
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigation = (tab: string) => {
    setActiveTab(tab);
    switch (tab) {
      case 'home':
        navigate('/dashboard');
        break;
      case 'match':
        navigate('/match');
        break;
      case 'profile':
        navigate('/profile');
        break;
      default:
        break;
    }
  };

  const handleEventClick = async (eventId: string) => {
    try {
      await eventService.joinEvent(eventId);
      // Show success message or navigate to event detail
      alert('Successfully joined event!');
      loadEvents(); // Reload to update status
    } catch (error) {
      alert('Failed to join event');
    }
  };

  return (
    <Container>
      <StatusBar />
      <Header
        title="BerseConnect"
        showBack
        onBackPress={() => navigate('/dashboard')}
      />
      
      <Content>
        <FilterSection>
          {filters.map((filter) => (
            <FilterChip
              key={filter.value}
              active={activeFilter === filter.value}
              onClick={() => setActiveFilter(filter.value)}
            >
              {filter.label}
            </FilterChip>
          ))}
        </FilterSection>

        {isLoading ? (
          <LoadingMessage>Loading events...</LoadingMessage>
        ) : filteredEvents.length > 0 ? (
          <EventsList>
            {filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                title={event.title}
                subtitle={`${event.type} • ${new Date(event.date).toLocaleDateString()}`}
                description={event.description}
                onClick={() => handleEventClick(event.id)}
                action={
                  <Button
                    variant="primary"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEventClick(event.id);
                    }}
                  >
                    Join Event
                  </Button>
                }
              />
            ))}
          </EventsList>
        ) : (
          <EmptyMessage>
            <EmptyIcon>📅</EmptyIcon>
            <EmptyText>
              No events found in this category.
              Try selecting a different filter.
            </EmptyText>
          </EmptyMessage>
        )}
      </Content>

      <MainNav
        activeTab={activeTab}
        onTabPress={handleNavigation}
      />
    </Container>
  );
};