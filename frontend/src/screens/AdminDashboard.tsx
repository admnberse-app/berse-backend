import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { StatusBar } from '../components/StatusBar/StatusBar';
import { MainNav } from '../components/MainNav';

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
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background-color: #F9F3E3;
`;

const HeaderTitle = styled.h1`
  margin: 0;
  font-size: 20px;
  font-weight: bold;
  color: #2fce98;
`;

const Content = styled.div`
  flex: 1;
  padding: 16px 20px 100px 20px;
  overflow-y: auto;
`;

const TabContainer = styled.div`
  display: flex;
  background: white;
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`;

const Tab = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  background: ${({ $active }) => $active ? '#2fce98' : 'transparent'};
  color: ${({ $active }) => $active ? 'white' : '#666'};
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${({ $active }) => $active ? '#2fce98' : '#f0f0f0'};
  }
`;

const Section = styled.div`
  background: white;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`;

const SectionTitle = styled.h2`
  margin: 0 0 16px;
  font-size: 18px;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Badge = styled.span`
  background: #FF4444;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
`;

const RequestCard = styled.div`
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  background: #f9f9f9;
`;

const RequestHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 12px;
`;

const RequestInfo = styled.div`
  flex: 1;
`;

const RequestTitle = styled.h3`
  margin: 0 0 4px;
  font-size: 16px;
  font-weight: 600;
  color: #333;
`;

const RequestMeta = styled.div`
  font-size: 12px;
  color: #666;
`;

const RequestType = styled.span<{ type: string }>`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  background: ${({ type }) => 
    type === 'community' ? '#e8f5e9' : 
    type === 'forum' ? '#e3f2fd' : 
    '#fff3e0'
  };
  color: ${({ type }) => 
    type === 'community' ? '#2e7d32' : 
    type === 'forum' ? '#1976d2' : 
    '#f57c00'
  };
`;

const RequestDescription = styled.p`
  margin: 12px 0;
  font-size: 14px;
  color: #333;
  line-height: 1.5;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;
`;

const ActionButton = styled.button<{ $approve?: boolean }>`
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 8px;
  background: ${({ $approve }) => $approve ? '#2fce98' : '#FF4444'};
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
  color: #999;
  font-size: 14px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 20px;
`;

const StatCard = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 16px;
  color: white;
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 12px;
  opacity: 0.9;
`;

interface PendingRequest {
  id: string;
  type: 'community' | 'forum' | 'event';
  title: string;
  description: string;
  requester: string;
  requesterId: string;
  timestamp: string;
  metadata?: any;
}

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [stats, setStats] = useState({
    pendingCount: 0,
    approvedToday: 0,
    rejectedToday: 0,
    totalProcessed: 0
  });

  // Check if user is admin
  useEffect(() => {
    // In production, check user role from backend
    const isAdmin = localStorage.getItem('isAdmin') === 'true' || 
                    user?.role === 'ADMIN' || 
                    user?.email === 'zaydmahdaly@ahlumran.org';
    
    if (!isAdmin) {
      alert('You do not have permission to access this page');
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Load pending requests
  useEffect(() => {
    loadPendingRequests();
    loadStats();
  }, []);

  const loadPendingRequests = () => {
    // Load from localStorage (in production, fetch from API)
    const stored = localStorage.getItem('pendingApprovals');
    if (stored) {
      setPendingRequests(JSON.parse(stored));
    } else {
      // Mock data for demonstration
      const mockRequests: PendingRequest[] = [
        {
          id: '1',
          type: 'community',
          title: 'Malaysian Photographers',
          description: 'A community for photography enthusiasts in Malaysia to share tips, organize photowalks, and showcase their work.',
          requester: 'Ahmad Hassan',
          requesterId: 'user-123',
          timestamp: new Date().toISOString()
        },
        {
          id: '2',
          type: 'forum',
          title: 'Best Cafes in KL for Remote Work',
          description: 'Looking for recommendations on the best cafes in Kuala Lumpur with good WiFi and comfortable seating for remote work.',
          requester: 'Sarah Lee',
          requesterId: 'user-456',
          timestamp: new Date().toISOString()
        }
      ];
      setPendingRequests(mockRequests);
      localStorage.setItem('pendingApprovals', JSON.stringify(mockRequests));
    }
    
    updateStats();
  };

  const loadStats = () => {
    const approvedToday = JSON.parse(localStorage.getItem('approvedToday') || '[]');
    const rejectedToday = JSON.parse(localStorage.getItem('rejectedToday') || '[]');
    const totalProcessed = JSON.parse(localStorage.getItem('totalProcessed') || '0');
    
    setStats({
      pendingCount: pendingRequests.length,
      approvedToday: approvedToday.length,
      rejectedToday: rejectedToday.length,
      totalProcessed: parseInt(totalProcessed)
    });
  };

  const updateStats = () => {
    const pending = JSON.parse(localStorage.getItem('pendingApprovals') || '[]');
    setStats(prev => ({ ...prev, pendingCount: pending.length }));
  };

  const handleApprove = (requestId: string) => {
    const request = pendingRequests.find(r => r.id === requestId);
    if (!request) return;

    // Remove from pending
    const newPending = pendingRequests.filter(r => r.id !== requestId);
    setPendingRequests(newPending);
    localStorage.setItem('pendingApprovals', JSON.stringify(newPending));

    // Add to approved
    const approvedToday = JSON.parse(localStorage.getItem('approvedToday') || '[]');
    approvedToday.push({ ...request, approvedAt: new Date().toISOString() });
    localStorage.setItem('approvedToday', JSON.stringify(approvedToday));

    // Update total processed
    const totalProcessed = parseInt(localStorage.getItem('totalProcessed') || '0');
    localStorage.setItem('totalProcessed', (totalProcessed + 1).toString());

    // Show success message
    alert(`✅ ${request.type === 'community' ? 'Community' : 'Forum post'} "${request.title}" has been approved!`);
    
    // If it's a community, add it to the communities list
    if (request.type === 'community') {
      const communities = JSON.parse(localStorage.getItem('approvedCommunities') || '[]');
      communities.push({
        id: Date.now().toString(),
        name: request.title,
        description: request.description,
        createdBy: request.requesterId,
        createdAt: new Date().toISOString(),
        memberCount: 1
      });
      localStorage.setItem('approvedCommunities', JSON.stringify(communities));
    }

    // If it's a forum post, add it to the forum
    if (request.type === 'forum') {
      const forumPosts = JSON.parse(localStorage.getItem('forumPosts') || '[]');
      forumPosts.push({
        id: Date.now().toString(),
        title: request.title,
        content: request.description,
        author: request.requester,
        authorId: request.requesterId,
        createdAt: new Date().toISOString(),
        likes: 0,
        replies: []
      });
      localStorage.setItem('forumPosts', JSON.stringify(forumPosts));
    }

    loadStats();
  };

  const handleReject = (requestId: string) => {
    const request = pendingRequests.find(r => r.id === requestId);
    if (!request) return;

    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    // Remove from pending
    const newPending = pendingRequests.filter(r => r.id !== requestId);
    setPendingRequests(newPending);
    localStorage.setItem('pendingApprovals', JSON.stringify(newPending));

    // Add to rejected
    const rejectedToday = JSON.parse(localStorage.getItem('rejectedToday') || '[]');
    rejectedToday.push({ 
      ...request, 
      rejectedAt: new Date().toISOString(),
      rejectionReason: reason
    });
    localStorage.setItem('rejectedToday', JSON.stringify(rejectedToday));

    // Update total processed
    const totalProcessed = parseInt(localStorage.getItem('totalProcessed') || '0');
    localStorage.setItem('totalProcessed', (totalProcessed + 1).toString());

    alert(`❌ ${request.type === 'community' ? 'Community' : 'Forum post'} "${request.title}" has been rejected.`);
    
    loadStats();
  };

  const getApprovedRequests = () => {
    return JSON.parse(localStorage.getItem('approvedToday') || '[]');
  };

  const getRejectedRequests = () => {
    return JSON.parse(localStorage.getItem('rejectedToday') || '[]');
  };

  return (
    <Container>
      <StatusBar />
      
      <Header>
        <HeaderTitle>🛡️ Admin Dashboard</HeaderTitle>
      </Header>

      <Content>
        {/* Stats Overview */}
        <StatsGrid>
          <StatCard>
            <StatValue>{stats.pendingCount}</StatValue>
            <StatLabel>Pending Approvals</StatLabel>
          </StatCard>
          <StatCard style={{ background: 'linear-gradient(135deg, #2fce98 0%, #1F4A3A 100%)' }}>
            <StatValue>{stats.approvedToday}</StatValue>
            <StatLabel>Approved Today</StatLabel>
          </StatCard>
        </StatsGrid>

        {/* Tabs */}
        <TabContainer>
          <Tab $active={activeTab === 'pending'} onClick={() => setActiveTab('pending')}>
            Pending {stats.pendingCount > 0 && <Badge>{stats.pendingCount}</Badge>}
          </Tab>
          <Tab $active={activeTab === 'approved'} onClick={() => setActiveTab('approved')}>
            Approved
          </Tab>
          <Tab $active={activeTab === 'rejected'} onClick={() => setActiveTab('rejected')}>
            Rejected
          </Tab>
        </TabContainer>

        {/* Content based on tab */}
        {activeTab === 'pending' && (
          <Section>
            <SectionTitle>
              📋 Pending Requests
              {pendingRequests.length > 0 && <Badge>{pendingRequests.length}</Badge>}
            </SectionTitle>
            
            {pendingRequests.length > 0 ? (
              pendingRequests.map(request => (
                <RequestCard key={request.id}>
                  <RequestHeader>
                    <RequestInfo>
                      <RequestTitle>{request.title}</RequestTitle>
                      <RequestMeta>
                        by {request.requester} • {new Date(request.timestamp).toLocaleDateString()}
                      </RequestMeta>
                    </RequestInfo>
                    <RequestType type={request.type}>
                      {request.type}
                    </RequestType>
                  </RequestHeader>
                  
                  <RequestDescription>{request.description}</RequestDescription>
                  
                  <ActionButtons>
                    <ActionButton $approve onClick={() => handleApprove(request.id)}>
                      ✅ Approve
                    </ActionButton>
                    <ActionButton onClick={() => handleReject(request.id)}>
                      ❌ Reject
                    </ActionButton>
                  </ActionButtons>
                </RequestCard>
              ))
            ) : (
              <EmptyState>
                🎉 No pending requests! All caught up.
              </EmptyState>
            )}
          </Section>
        )}

        {activeTab === 'approved' && (
          <Section>
            <SectionTitle>✅ Approved Today</SectionTitle>
            {getApprovedRequests().length > 0 ? (
              getApprovedRequests().map((request: any) => (
                <RequestCard key={request.id}>
                  <RequestHeader>
                    <RequestInfo>
                      <RequestTitle>{request.title}</RequestTitle>
                      <RequestMeta>
                        by {request.requester} • Approved at {new Date(request.approvedAt).toLocaleTimeString()}
                      </RequestMeta>
                    </RequestInfo>
                    <RequestType type={request.type}>
                      {request.type}
                    </RequestType>
                  </RequestHeader>
                </RequestCard>
              ))
            ) : (
              <EmptyState>No approvals today yet.</EmptyState>
            )}
          </Section>
        )}

        {activeTab === 'rejected' && (
          <Section>
            <SectionTitle>❌ Rejected Today</SectionTitle>
            {getRejectedRequests().length > 0 ? (
              getRejectedRequests().map((request: any) => (
                <RequestCard key={request.id}>
                  <RequestHeader>
                    <RequestInfo>
                      <RequestTitle>{request.title}</RequestTitle>
                      <RequestMeta>
                        by {request.requester} • Rejected at {new Date(request.rejectedAt).toLocaleTimeString()}
                      </RequestMeta>
                    </RequestInfo>
                    <RequestType type={request.type}>
                      {request.type}
                    </RequestType>
                  </RequestHeader>
                  <RequestDescription>
                    <strong>Reason:</strong> {request.rejectionReason}
                  </RequestDescription>
                </RequestCard>
              ))
            ) : (
              <EmptyState>No rejections today.</EmptyState>
            )}
          </Section>
        )}
      </Content>

      <MainNav 
        activeTab="home"
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
    </Container>
  );
};