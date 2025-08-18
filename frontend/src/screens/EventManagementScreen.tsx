import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { StatusBar } from '../components/StatusBar/StatusBar';
import { MainNav } from '../components/MainNav/MainNav';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { API_BASE_URL } from '../config/services.config';

interface Event {
  id: string;
  title: string;
  status: 'active' | 'draft' | 'cancelled' | 'completed';
  registered: number;
  paid: number;
  checkedIn: number;
  revenue: number;
  date: string;
  location: string;
  type: string;
  maxParticipants: number;
}

interface BerseMukhGroup {
  id: string;
  name: string;
  members: number;
  eventId: string;
  status: 'active' | 'pending' | 'completed';
}

export const EventManagementScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'analytics' | 'groups'>('dashboard');
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's events
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/api/v1/events`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Filter to show only events where user is the host
      const userEvents = response.data.data?.filter((event: any) => 
        event.host?.id === user?.id || user?.role === 'ADMIN'
      ) || [];

      // Transform the data to match our Event interface
      const transformedEvents = userEvents.map((event: any) => ({
        id: event.id,
        title: event.title,
        status: event.status || 'active',
        registered: event._count?.rsvps || 0,
        paid: event._count?.rsvps || 0, // Assuming all registered have paid
        checkedIn: event._count?.attendance || 0,
        revenue: (event._count?.rsvps || 0) * (event.price || 0),
        date: new Date(event.date).toLocaleDateString(),
        location: event.location,
        type: event.type,
        maxParticipants: event.maxAttendees || 50
      }));

      setEvents(transformedEvents);
    } catch (error) {
      console.error('Failed to fetch events:', error);
      setError('Failed to load events');
    } finally {
      setIsLoading(false);
    }
  };

  const mockEvents: Event[] = [
    {
      id: 'evt-1',
      title: 'KL Heritage Walking Tour',
      status: 'active',
      registered: 4,
      paid: 3,
      checkedIn: 2,
      revenue: 120.00,
      date: '2025-01-15',
      location: 'Kuala Lumpur',
      type: 'Walking Tour',
      maxParticipants: 20
    },
    {
      id: 'evt-2', 
      title: 'Photography Meetup - Chinatown',
      status: 'draft',
      registered: 0,
      paid: 0,
      checkedIn: 0,
      revenue: 0.00,
      date: '2025-01-20',
      location: 'Chinatown',
      type: 'Photography',
      maxParticipants: 15
    }
  ];

  const mockBerseMukhGroups: BerseMukhGroup[] = [
    {
      id: 'grp-1',
      name: 'Heritage Explorers',
      members: 4,
      eventId: 'evt-1',
      status: 'active'
    },
    {
      id: 'grp-2',
      name: 'Photo Enthusiasts',
      members: 8,
      eventId: 'evt-1',
      status: 'active'
    }
  ];

  const generateQR = (eventId: string) => {
    // QR Code generation logic
    console.log(`Generating QR for event: ${eventId}`);
    // Could integrate with QR library or service
  };

  const exportData = (eventId: string) => {
    // Export event data
    console.log(`Exporting data for event: ${eventId}`);
  };

  return (
    <Container>
      <StatusBar />
      
      <Header>
        <BackButton onClick={() => navigate('/profile')}>←</BackButton>
        <HeaderContent>
          <HeaderTitle>⚡ Manage Events (Admin)</HeaderTitle>
          <HeaderSubtext>Event dashboard & BerseMukha management</HeaderSubtext>
        </HeaderContent>
        <CreateButton onClick={() => navigate('/create-event')}>
          + Create
        </CreateButton>
      </Header>

      <TabNavigation>
        <TabButton 
          $active={activeTab === 'dashboard'}
          onClick={() => setActiveTab('dashboard')}
        >
          📊 Dashboard
        </TabButton>
        <TabButton 
          $active={activeTab === 'analytics'}
          onClick={() => setActiveTab('analytics')}
        >
          📈 Analytics
        </TabButton>
        <TabButton 
          $active={activeTab === 'groups'}
          onClick={() => setActiveTab('groups')}
        >
          🎯 BerseMukha
        </TabButton>
      </TabNavigation>

      <ScrollContent>
        {activeTab === 'dashboard' && (
          <DashboardSection>
            <OverviewStats>
              <OverviewCard>
                <StatNumber>{events.filter(e => e.status === 'active').length}</StatNumber>
                <StatLabel>Active Events</StatLabel>
              </OverviewCard>
              <OverviewCard>
                <StatNumber>{events.reduce((sum, e) => sum + e.registered, 0)}</StatNumber>
                <StatLabel>Total Registered</StatLabel>
              </OverviewCard>
              <OverviewCard>
                <StatNumber>RM {events.reduce((sum, e) => sum + e.revenue, 0).toFixed(2)}</StatNumber>
                <StatLabel>Total Revenue</StatLabel>
              </OverviewCard>
            </OverviewStats>

            <EventsList>
              {isLoading ? (
                <LoadingMessage>Loading events...</LoadingMessage>
              ) : error ? (
                <ErrorMessage>{error}</ErrorMessage>
              ) : events.length === 0 ? (
                <EmptyState>
                  <EmptyIcon>📅</EmptyIcon>
                  <EmptyTitle>No Events Yet</EmptyTitle>
                  <EmptyText>Create your first event to start managing it here</EmptyText>
                  <CreateButton onClick={() => navigate('/create-event')}>Create Event</CreateButton>
                </EmptyState>
              ) : (
                events.map((event) => (
                <EventDashboardCard key={event.id}>
                  <EventCardHeader>
                    <EventTitleSection>
                      <EventTitle>{event.title}</EventTitle>
                      <EventMeta>{event.type} • {event.date} • {event.location}</EventMeta>
                    </EventTitleSection>
                    <EventStatusBadge $status={event.status}>
                      {event.status.toUpperCase()}
                    </EventStatusBadge>
                  </EventCardHeader>

                  <EventStatsGrid>
                    <StatItem>
                      <StatValue>{event.registered}</StatValue>
                      <StatLabel>REGISTERED</StatLabel>
                    </StatItem>
                    <StatItem>
                      <StatValue>{event.paid}</StatValue>
                      <StatLabel>PAID</StatLabel>
                    </StatItem>
                    <StatItem>
                      <StatValue>{event.checkedIn}</StatValue>
                      <StatLabel>CHECKED IN</StatLabel>
                    </StatItem>
                    <StatItem>
                      <StatValue>RM {event.revenue.toFixed(2)}</StatValue>
                      <StatLabel>REVENUE</StatLabel>
                    </StatItem>
                  </EventStatsGrid>

                  <ProgressSection>
                    <ProgressLabel>
                      Registration Progress: {event.registered}/{event.maxParticipants}
                    </ProgressLabel>
                    <ProgressBar>
                      <ProgressFill $percentage={(event.registered / event.maxParticipants) * 100} />
                    </ProgressBar>
                  </ProgressSection>

                  <EventActions>
                    <ActionButton 
                      $primary 
                      onClick={() => setSelectedEvent(event.id)}
                    >
                      📊 Event Dashboard
                    </ActionButton>
                    <ActionButton 
                      onClick={() => navigate(`/bersemukha-management/${event.id}`)}
                    >
                      🎯 BerseMukha Management
                    </ActionButton>
                    <ActionButton onClick={() => generateQR(event.id)}>
                      📱 Generate QR
                    </ActionButton>
                  </EventActions>

                  <QuickActions>
                    <QuickButton onClick={() => exportData(event.id)}>
                      📊 Export Data
                    </QuickButton>
                    <QuickButton onClick={() => navigate(`/edit-event/${event.id}`)}>
                      ✏️ Edit Event
                    </QuickButton>
                    <QuickButton>
                      📧 Send Updates
                    </QuickButton>
                  </QuickActions>
                </EventDashboardCard>
              ))
            )}
            </EventsList>
          </DashboardSection>
        )}

        {activeTab === 'analytics' && (
          <AnalyticsSection>
            <AnalyticsHeader>
              <SectionTitle>📈 Event Analytics</SectionTitle>
              <TimeRangeSelector>
                <TimeButton $active>7 Days</TimeButton>
                <TimeButton>30 Days</TimeButton>
                <TimeButton>3 Months</TimeButton>
              </TimeRangeSelector>
            </AnalyticsHeader>

            <AnalyticsGrid>
              <AnalyticsCard>
                <CardTitle>Registration Trends</CardTitle>
                <TrendChart>
                  <TrendLine />
                  <TrendValue>↗️ +25% this week</TrendValue>
                </TrendChart>
              </AnalyticsCard>

              <AnalyticsCard>
                <CardTitle>Revenue Growth</CardTitle>
                <RevenueDisplay>
                  <RevenueAmount>RM 1,245</RevenueAmount>
                  <RevenueChange $positive>+15.3%</RevenueChange>
                </RevenueDisplay>
              </AnalyticsCard>

              <AnalyticsCard>
                <CardTitle>Top Performing Events</CardTitle>
                <EventRankingList>
                  <EventRank>
                    <RankNumber>1</RankNumber>
                    <RankEvent>KL Heritage Walking Tour</RankEvent>
                    <RankScore>95%</RankScore>
                  </EventRank>
                  <EventRank>
                    <RankNumber>2</RankNumber>
                    <RankEvent>Photography Meetup</RankEvent>
                    <RankScore>87%</RankScore>
                  </EventRank>
                </EventRankingList>
              </AnalyticsCard>
            </AnalyticsGrid>
          </AnalyticsSection>
        )}

        {activeTab === 'groups' && (
          <BerseMukhSection>
            <BerseMukhHeader>
              <SectionTitle>🎯 BerseMukha Group Management</SectionTitle>
              <CreateGroupButton>+ Create Group</CreateGroupButton>
            </BerseMukhHeader>

            <GroupsList>
              {mockBerseMukhGroups.map((group) => (
                <GroupCard key={group.id}>
                  <GroupHeader>
                    <GroupName>{group.name}</GroupName>
                    <GroupStatus $status={group.status}>
                      {group.status.toUpperCase()}
                    </GroupStatus>
                  </GroupHeader>
                  
                  <GroupDetails>
                    <GroupMeta>👥 {group.members} members</GroupMeta>
                    <GroupEvent>
                      📅 {mockEvents.find(e => e.id === group.eventId)?.title}
                    </GroupEvent>
                  </GroupDetails>

                  <GroupActions>
                    <GroupActionButton $primary>
                      👥 Manage Members
                    </GroupActionButton>
                    <GroupActionButton>
                      💬 Group Chat
                    </GroupActionButton>
                    <GroupActionButton>
                      📊 Analytics
                    </GroupActionButton>
                  </GroupActions>
                </GroupCard>
              ))}
            </GroupsList>

            <BerseMukhStats>
              <StatsGrid>
                <StatsCard>
                  <StatsNumber>12</StatsNumber>
                  <StatsLabel>Active Groups</StatsLabel>
                </StatsCard>
                <StatsCard>
                  <StatsNumber>156</StatsNumber>
                  <StatsLabel>Total Members</StatsLabel>
                </StatsCard>
                <StatsCard>
                  <StatsNumber>89%</StatsNumber>
                  <StatsLabel>Engagement Rate</StatsLabel>
                </StatsCard>
              </StatsGrid>
            </BerseMukhStats>
          </BerseMukhSection>
        )}
      </ScrollContent>

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
    </Container>
  );
};

// Styled Components
const LoadingMessage = styled.div`
  text-align: center;
  padding: 40px;
  color: #666;
  font-size: 14px;
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 40px;
  color: #E74C3C;
  font-size: 14px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
`;

const EmptyTitle = styled.h3`
  color: #333;
  margin-bottom: 8px;
  font-size: 18px;
  font-weight: 600;
`;

const EmptyText = styled.p`
  color: #666;
  font-size: 14px;
  margin-bottom: 24px;
`;

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
  background: linear-gradient(135deg, #E74C3C, #C0392B);
  color: white;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  color: white;
  cursor: pointer;
  margin-right: 12px;
`;

const HeaderContent = styled.div`
  flex: 1;
`;

const HeaderTitle = styled.h1`
  font-size: 18px;
  font-weight: bold;
  margin: 0 0 4px 0;
`;

const HeaderSubtext = styled.p`
  font-size: 12px;
  opacity: 0.9;
  margin: 0;
`;

const CreateButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const TabNavigation = styled.div`
  display: flex;
  background: white;
  border-bottom: 1px solid #E9ECEF;
`;

const TabButton = styled.button<{ $active: boolean }>`
  flex: 1;
  background: none;
  border: none;
  padding: 12px 8px;
  font-size: 12px;
  font-weight: 600;
  color: ${({ $active }) => $active ? '#E74C3C' : '#666'};
  border-bottom: 2px solid ${({ $active }) => $active ? '#E74C3C' : 'transparent'};
  cursor: pointer;
  
  &:hover {
    background: #F8F9FA;
  }
`;

const ScrollContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  padding-bottom: 100px; /* Added extra space for floating nav */
`;

const DashboardSection = styled.div``;

const OverviewStats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 20px;
`;

const OverviewCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 16px 12px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const StatNumber = styled.div`
  font-size: 20px;
  font-weight: bold;
  color: #E74C3C;
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 10px;
  color: #666;
  text-transform: uppercase;
  font-weight: 600;
`;

const EventsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const EventDashboardCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #E74C3C;
`;

const EventCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
`;

const EventTitleSection = styled.div`
  flex: 1;
`;

const EventTitle = styled.h3`
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin: 0 0 4px 0;
`;

const EventMeta = styled.p`
  font-size: 12px;
  color: #666;
  margin: 0;
`;

const EventStatusBadge = styled.span<{ $status: string }>`
  background: ${({ $status }) => 
    $status === 'active' ? '#D4F6D4' :
    $status === 'draft' ? '#FFF3CD' :
    $status === 'cancelled' ? '#F8D7DA' : '#E2E3E5'
  };
  color: ${({ $status }) => 
    $status === 'active' ? '#155724' :
    $status === 'draft' ? '#856404' :
    $status === 'cancelled' ? '#721c24' : '#495057'
  };
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
`;

const EventStatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 16px;
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 18px;
  font-weight: bold;
  color: #E74C3C;
  margin-bottom: 4px;
`;

const ProgressSection = styled.div`
  margin-bottom: 16px;
`;

const ProgressLabel = styled.div`
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 6px;
  background: #E9ECEF;
  border-radius: 3px;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ $percentage: number }>`
  width: ${({ $percentage }) => Math.min($percentage, 100)}%;
  height: 100%;
  background: linear-gradient(90deg, #27AE60, #2ECC71);
  transition: width 0.3s ease;
`;

const EventActions = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 12px;
`;

const ActionButton = styled.button<{ $primary?: boolean }>`
  background: ${({ $primary }) => $primary ? '#E74C3C' : 'white'};
  color: ${({ $primary }) => $primary ? 'white' : '#666'};
  border: 1px solid ${({ $primary }) => $primary ? '#E74C3C' : '#E9ECEF'};
  border-radius: 8px;
  padding: 8px 4px;
  font-size: 10px;
  font-weight: 600;
  cursor: pointer;
  
  &:hover {
    background: ${({ $primary }) => $primary ? '#C0392B' : '#F8F9FA'};
  }
`;

const QuickActions = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
`;

const QuickButton = styled.button`
  background: #F8F9FA;
  color: #666;
  border: 1px solid #E9ECEF;
  border-radius: 6px;
  padding: 6px 4px;
  font-size: 9px;
  font-weight: 600;
  cursor: pointer;
  
  &:hover {
    background: #E9ECEF;
  }
`;

// Analytics Section
const AnalyticsSection = styled.div``;

const AnalyticsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin: 0;
`;

const TimeRangeSelector = styled.div`
  display: flex;
  gap: 4px;
`;

const TimeButton = styled.button<{ $active?: boolean }>`
  background: ${({ $active }) => $active ? '#E74C3C' : 'white'};
  color: ${({ $active }) => $active ? 'white' : '#666'};
  border: 1px solid #E74C3C;
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 10px;
  cursor: pointer;
`;

const AnalyticsGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const AnalyticsCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const CardTitle = styled.h4`
  font-size: 14px;
  font-weight: bold;
  color: #333;
  margin: 0 0 12px 0;
`;

const TrendChart = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const TrendLine = styled.div`
  width: 100%;
  height: 60px;
  background: linear-gradient(45deg, #E74C3C, #C0392B);
  border-radius: 4px;
  margin-bottom: 8px;
`;

const TrendValue = styled.div`
  font-size: 12px;
  color: #27AE60;
  font-weight: 600;
`;

const RevenueDisplay = styled.div`
  text-align: center;
`;

const RevenueAmount = styled.div`
  font-size: 24px;
  font-weight: bold;
  color: #E74C3C;
  margin-bottom: 4px;
`;

const RevenueChange = styled.div<{ $positive: boolean }>`
  font-size: 12px;
  color: ${({ $positive }) => $positive ? '#27AE60' : '#E74C3C'};
  font-weight: 600;
`;

const EventRankingList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const EventRank = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const RankNumber = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #E74C3C;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
`;

const RankEvent = styled.div`
  flex: 1;
  font-size: 12px;
  color: #333;
`;

const RankScore = styled.div`
  font-size: 12px;
  font-weight: bold;
  color: #27AE60;
`;

// BerseMukha Section
const BerseMukhSection = styled.div``;

const BerseMukhHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const CreateGroupButton = styled.button`
  background: #27AE60;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  
  &:hover {
    background: #219A52;
  }
`;

const GroupsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;
`;

const GroupCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #27AE60;
`;

const GroupHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const GroupName = styled.h4`
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin: 0;
`;

const GroupStatus = styled.span<{ $status: string }>`
  background: ${({ $status }) => 
    $status === 'active' ? '#D4F6D4' : '#FFF3CD'
  };
  color: ${({ $status }) => 
    $status === 'active' ? '#155724' : '#856404'
  };
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
`;

const GroupDetails = styled.div`
  margin-bottom: 12px;
`;

const GroupMeta = styled.div`
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
`;

const GroupEvent = styled.div`
  font-size: 12px;
  color: #27AE60;
  font-weight: 600;
`;

const GroupActions = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
`;

const GroupActionButton = styled.button<{ $primary?: boolean }>`
  background: ${({ $primary }) => $primary ? '#27AE60' : 'white'};
  color: ${({ $primary }) => $primary ? 'white' : '#666'};
  border: 1px solid ${({ $primary }) => $primary ? '#27AE60' : '#E9ECEF'};
  border-radius: 6px;
  padding: 6px 4px;
  font-size: 10px;
  font-weight: 600;
  cursor: pointer;
  
  &:hover {
    background: ${({ $primary }) => $primary ? '#219A52' : '#F8F9FA'};
  }
`;

const BerseMukhStats = styled.div``;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
`;

const StatsCard = styled.div`
  background: linear-gradient(135deg, #27AE60, #2ECC71);
  color: white;
  border-radius: 12px;
  padding: 16px 12px;
  text-align: center;
`;

const StatsNumber = styled.div`
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 4px;
`;

const StatsLabel = styled.div`
  font-size: 10px;
  opacity: 0.9;
  text-transform: uppercase;
  font-weight: 600;
`;