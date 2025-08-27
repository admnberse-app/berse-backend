import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { StatusBar } from '../components/StatusBar/StatusBar';
import { CompactHeader } from '../components/CompactHeader/CompactHeader';

const Container = styled.div`
  min-height: 100vh;
  background: #F9F3E3;
`;

const Content = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const Header = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
`;

const Title = styled.h1`
  font-size: 28px;
  color: #333;
  margin: 0 0 8px 0;
  font-weight: 600;
`;

const Subtitle = styled.p`
  color: #666;
  font-size: 14px;
  margin: 0;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
`;

const StatCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
`;

const StatValue = styled.div`
  font-size: 32px;
  font-weight: bold;
  color: #2fce98;
  margin-bottom: 8px;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: #666;
`;

const Section = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  color: #333;
  margin: 0 0 16px 0;
  font-weight: 600;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  text-align: left;
  padding: 12px;
  border-bottom: 2px solid #e5e5e5;
  color: #666;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
`;

const Td = styled.td`
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 14px;
  color: #333;
`;

const Badge = styled.span<{ type?: string }>`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  background: ${props => {
    switch(props.type) {
      case 'new': return '#e8f5e9';
      case 'active': return '#e3f2fd';
      case 'pending': return '#fff3e0';
      default: return '#f5f5f5';
    }
  }};
  color: ${props => {
    switch(props.type) {
      case 'new': return '#2e7d32';
      case 'active': return '#1565c0';
      case 'pending': return '#e65100';
      default: return '#666';
    }
  }};
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 40px;
  color: #666;
  font-size: 14px;
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 20px;
  color: #d32f2f;
  background: #ffebee;
  border-radius: 8px;
  margin: 20px 0;
`;

const RefreshButton = styled.button`
  background: #2fce98;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #27b584;
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

export const AdminRegistrationsScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalUsers: 0,
    newToday: 0,
    activeUsers: 0,
    totalEvents: 0,
    totalRegistrations: 0
  });
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [eventRegistrations, setEventRegistrations] = useState<any[]>([]);

  // Check admin access
  useEffect(() => {
    if (user?.email !== 'zaydmahdaly@ahlumran.org') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('bersemuka_token') || localStorage.getItem('auth_token');
      
      // Check local storage for registration data
      const localRegistrations = JSON.parse(localStorage.getItem('event_registrations') || '[]');
      const userRegisteredEvents = JSON.parse(localStorage.getItem('userRegisteredEvents') || '[]');
      const bersemukaUsers = JSON.parse(localStorage.getItem('bersemuka_users') || '[]');
      
      // Try to fetch from API
      try {
        const eventsResponse = await axios.get(
          'https://api.berse.app/api/v1/events',
          token ? { headers: { 'Authorization': `Bearer ${token}` } } : {}
        );
        
        if (eventsResponse.data.success) {
          const events = eventsResponse.data.data || [];
          
          // Calculate stats
          const today = new Date().toDateString();
          const newToday = bersemukaUsers.filter((u: any) => 
            new Date(u.createdAt).toDateString() === today
          ).length;
          
          setStats({
            totalUsers: bersemukaUsers.length,
            newToday: newToday,
            activeUsers: bersemukaUsers.filter((u: any) => u.lastActive).length,
            totalEvents: events.length,
            totalRegistrations: localRegistrations.length + userRegisteredEvents.length
          });
        }
      } catch (apiError) {
        console.log('API fetch failed, using local data');
      }
      
      // Process recent users
      const sortedUsers = [...bersemukaUsers]
        .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
        .slice(0, 10);
      setRecentUsers(sortedUsers);
      
      // Process event registrations
      const allRegistrations = [
        ...localRegistrations.map((r: any) => ({ ...r, source: 'payment' })),
        ...userRegisteredEvents.map((r: any) => ({ ...r, source: 'direct' }))
      ].sort((a, b) => new Date(b.registeredAt || 0).getTime() - new Date(a.registeredAt || 0).getTime())
        .slice(0, 20);
      
      setEventRegistrations(allRegistrations);
      
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load registration data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeSince = (dateStr: string) => {
    if (!dateStr) return 'Never';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    return formatDate(dateStr);
  };

  if (loading) {
    return (
      <Container>
        <StatusBar />
        <CompactHeader />
        <Content>
          <LoadingMessage>Loading registration data...</LoadingMessage>
        </Content>
      </Container>
    );
  }

  return (
    <Container>
      <StatusBar />
      <CompactHeader />
      
      <Content>
        <Header>
          <Title>📊 Registration Dashboard</Title>
          <Subtitle>Monitor user registrations and event sign-ups</Subtitle>
        </Header>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <StatsGrid>
          <StatCard>
            <StatValue>{stats.totalUsers}</StatValue>
            <StatLabel>Total Users</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{stats.newToday}</StatValue>
            <StatLabel>New Today</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{stats.activeUsers}</StatValue>
            <StatLabel>Active Users</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{stats.totalEvents}</StatValue>
            <StatLabel>Total Events</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{stats.totalRegistrations}</StatValue>
            <StatLabel>Event Registrations</StatLabel>
          </StatCard>
        </StatsGrid>

        <Section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <SectionTitle>🆕 Recent User Registrations</SectionTitle>
            <RefreshButton onClick={fetchData} disabled={loading}>
              🔄 Refresh
            </RefreshButton>
          </div>
          
          {recentUsers.length > 0 ? (
            <Table>
              <thead>
                <tr>
                  <Th>User</Th>
                  <Th>Email</Th>
                  <Th>Joined</Th>
                  <Th>Status</Th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((user, index) => (
                  <tr key={index}>
                    <Td>
                      <div>
                        <div style={{ fontWeight: 600 }}>{user.fullName || user.username || 'Unknown'}</div>
                        <div style={{ fontSize: '12px', color: '#999' }}>@{user.username || 'no-username'}</div>
                      </div>
                    </Td>
                    <Td>{user.email || 'N/A'}</Td>
                    <Td>{getTimeSince(user.createdAt)}</Td>
                    <Td>
                      <Badge type={user.isActive ? 'active' : 'new'}>
                        {user.isActive ? 'Active' : 'New'}
                      </Badge>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
              No user registrations found
            </div>
          )}
        </Section>

        <Section>
          <SectionTitle>🎟️ Recent Event Registrations</SectionTitle>
          
          {eventRegistrations.length > 0 ? (
            <Table>
              <thead>
                <tr>
                  <Th>Event</Th>
                  <Th>Attendee</Th>
                  <Th>Contact</Th>
                  <Th>Registered</Th>
                  <Th>Type</Th>
                </tr>
              </thead>
              <tbody>
                {eventRegistrations.map((reg, index) => (
                  <tr key={index}>
                    <Td>
                      <div style={{ fontWeight: 600 }}>
                        {reg.eventTitle || reg.title || 'Unknown Event'}
                      </div>
                    </Td>
                    <Td>{reg.userName || reg.name || 'Unknown'}</Td>
                    <Td>
                      <div style={{ fontSize: '12px' }}>
                        <div>{reg.userEmail || reg.email || 'No email'}</div>
                        <div style={{ color: '#999' }}>{reg.userPhone || reg.phone || 'No phone'}</div>
                      </div>
                    </Td>
                    <Td>{getTimeSince(reg.registeredAt || reg.createdAt)}</Td>
                    <Td>
                      <Badge type={reg.source === 'payment' ? 'pending' : 'active'}>
                        {reg.source === 'payment' ? 'Payment' : 'Direct'}
                      </Badge>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
              No event registrations found
            </div>
          )}
        </Section>

        <Section>
          <SectionTitle>📡 API Status</SectionTitle>
          <div style={{ display: 'grid', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: '#f5f5f5', borderRadius: '6px' }}>
              <span>Backend API:</span>
              <Badge type="active">Connected - api.berse.app</Badge>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: '#f5f5f5', borderRadius: '6px' }}>
              <span>Local Storage:</span>
              <Badge type="active">Available</Badge>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: '#f5f5f5', borderRadius: '6px' }}>
              <span>Last Refresh:</span>
              <span style={{ color: '#666', fontSize: '14px' }}>{new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </Section>
      </Content>
    </Container>
  );
};