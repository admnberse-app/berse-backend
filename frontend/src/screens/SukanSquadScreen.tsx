import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { StatusBar } from '../components/StatusBar/StatusBar';
import { MainNav } from '../components/MainNav/MainNav';
import { useAuth } from '../contexts/AuthContext';

interface SportsSession {
  id: string;
  title: string;
  sport: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Mixed';
  date: string;
  time: string;
  location: string;
  participants: number;
  maxParticipants: number;
  price: number;
  description: string;
  equipment: string[];
  instructor?: string;
  isJoined: boolean;
}

interface UserJoinedSession {
  sessionId: string;
  joinedAt: Date;
  status: 'joined' | 'attended' | 'cancelled';
}

export const SukanSquadScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'available' | 'joined' | 'history'>('available');
  const [sessions, setSessions] = useState<SportsSession[]>([]);
  const [joinedSessions, setJoinedSessions] = useState<UserJoinedSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Mock sports sessions data
  useEffect(() => {
    const mockSessions: SportsSession[] = [
      {
        id: 'sukan-1',
        title: 'Badminton Social Session',
        sport: 'Badminton',
        level: 'Mixed',
        date: '2025-01-10',
        time: '19:00',
        location: 'Damansara Sports Center',
        participants: 8,
        maxParticipants: 16,
        price: 25,
        description: 'Friendly badminton session for all skill levels. Equipment provided.',
        equipment: ['Rackets', 'Shuttlecocks'],
        instructor: 'Coach Ahmad',
        isJoined: false
      },
      {
        id: 'sukan-2',
        title: 'Morning Jogging Group',
        sport: 'Running',
        level: 'Beginner',
        date: '2025-01-11',
        time: '07:00',
        location: 'KLCC Park',
        participants: 12,
        maxParticipants: 20,
        price: 0,
        description: 'Start your day with a refreshing jog around KLCC Park.',
        equipment: ['Running shoes recommended'],
        isJoined: false
      },
      {
        id: 'sukan-3',
        title: 'Basketball Pickup Game',
        sport: 'Basketball',
        level: 'Intermediate',
        date: '2025-01-12',
        time: '18:30',
        location: 'Sri Petaling Basketball Court',
        participants: 6,
        maxParticipants: 10,
        price: 15,
        description: 'Competitive basketball session. Bring your A-game!',
        equipment: ['Basketball'],
        isJoined: true
      },
      {
        id: 'sukan-4',
        title: 'Swimming Training',
        sport: 'Swimming',
        level: 'Advanced',
        date: '2025-01-13',
        time: '20:00',
        location: 'Sunway Pyramid Swimming Pool',
        participants: 4,
        maxParticipants: 8,
        price: 35,
        description: 'Structured swimming training session with certified coach.',
        equipment: ['Swimwear', 'Goggles'],
        instructor: 'Coach Sarah',
        isJoined: false
      }
    ];

    setSessions(mockSessions);
  }, []);

  const handleJoinSession = async (sessionId: string) => {
    if (!user) {
      navigate('/login');
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setSessions(prev => 
        prev.map(session => 
          session.id === sessionId 
            ? { ...session, isJoined: true, participants: session.participants + 1 }
            : session
        )
      );

      setJoinedSessions(prev => [
        ...prev,
        {
          sessionId,
          joinedAt: new Date(),
          status: 'joined'
        }
      ]);

      setIsLoading(false);
      alert('Successfully joined the session! You will receive a confirmation email.');
    }, 1000);
  };

  const handleLeaveSession = async (sessionId: string) => {
    setIsLoading(true);
    
    setTimeout(() => {
      setSessions(prev => 
        prev.map(session => 
          session.id === sessionId 
            ? { ...session, isJoined: false, participants: Math.max(0, session.participants - 1) }
            : session
        )
      );

      setJoinedSessions(prev => 
        prev.filter(js => js.sessionId !== sessionId)
      );

      setIsLoading(false);
      alert('You have left the session.');
    }, 1000);
  };

  const getFilteredSessions = () => {
    switch (activeTab) {
      case 'available':
        return sessions.filter(s => !s.isJoined && s.participants < s.maxParticipants);
      case 'joined':
        return sessions.filter(s => s.isJoined);
      case 'history':
        return sessions.filter(s => joinedSessions.some(js => js.sessionId === s.id && js.status === 'attended'));
      default:
        return sessions;
    }
  };

  const getSportEmoji = (sport: string) => {
    const sportEmojis: Record<string, string> = {
      'Badminton': '🏸',
      'Running': '🏃‍♂️',
      'Basketball': '🏀',
      'Swimming': '🏊‍♂️',
      'Football': '⚽',
      'Tennis': '🎾',
      'Cycling': '🚴‍♂️',
      'Volleyball': '🏐'
    };
    return sportEmojis[sport] || '🏃‍♂️';
  };

  const getLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      'Beginner': '#4CAF50',
      'Intermediate': '#FF9800',
      'Advanced': '#F44336',
      'Mixed': '#9C27B0'
    };
    return colors[level] || '#9C27B0';
  };

  return (
    <Container>
      <StatusBar />
      
      <Header>
        <BackButton onClick={() => navigate('/dashboard')}>←</BackButton>
        <HeaderContent>
          <HeaderTitle>🏸 Sukan Squad</HeaderTitle>
          <HeaderSubtext>Sports & Fitness Community</HeaderSubtext>
        </HeaderContent>
        <PartnershipBadge>Sports Malaysia</PartnershipBadge>
      </Header>

      <TabNavigation>
        <TabButton 
          $active={activeTab === 'available'}
          onClick={() => setActiveTab('available')}
        >
          🔍 Available
        </TabButton>
        <TabButton 
          $active={activeTab === 'joined'}
          onClick={() => setActiveTab('joined')}
        >
          ✅ Joined ({sessions.filter(s => s.isJoined).length})
        </TabButton>
        <TabButton 
          $active={activeTab === 'history'}
          onClick={() => setActiveTab('history')}
        >
          📊 History
        </TabButton>
      </TabNavigation>

      <Content>
        <SessionsList>
          {getFilteredSessions().map((session) => (
            <SessionCard key={session.id}>
              <SessionHeader>
                <SessionTitleRow>
                  <SportIcon>{getSportEmoji(session.sport)}</SportIcon>
                  <SessionInfo>
                    <SessionTitle>{session.title}</SessionTitle>
                    <SessionMeta>{session.sport} • {session.location}</SessionMeta>
                  </SessionInfo>
                  <LevelBadge $color={getLevelColor(session.level)}>
                    {session.level}
                  </LevelBadge>
                </SessionTitleRow>
              </SessionHeader>

              <SessionDetails>
                <DetailRow>
                  <DetailIcon>📅</DetailIcon>
                  <DetailText>{new Date(session.date).toLocaleDateString()} at {session.time}</DetailText>
                </DetailRow>
                
                <DetailRow>
                  <DetailIcon>👥</DetailIcon>
                  <DetailText>{session.participants}/{session.maxParticipants} participants</DetailText>
                </DetailRow>

                {session.instructor && (
                  <DetailRow>
                    <DetailIcon>👨‍🏫</DetailIcon>
                    <DetailText>{session.instructor}</DetailText>
                  </DetailRow>
                )}

                <DetailRow>
                  <DetailIcon>💰</DetailIcon>
                  <DetailText>{session.price === 0 ? 'Free' : `RM ${session.price}`}</DetailText>
                </DetailRow>
              </SessionDetails>

              <SessionDescription>{session.description}</SessionDescription>

              {session.equipment.length > 0 && (
                <EquipmentSection>
                  <EquipmentTitle>Equipment:</EquipmentTitle>
                  <EquipmentList>
                    {session.equipment.map((item, index) => (
                      <EquipmentItem key={index}>{item}</EquipmentItem>
                    ))}
                  </EquipmentList>
                </EquipmentSection>
              )}

              <SessionActions>
                {session.isJoined ? (
                  <ActionButton 
                    $variant="secondary"
                    onClick={() => handleLeaveSession(session.id)}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Processing...' : '❌ Leave Session'}
                  </ActionButton>
                ) : session.participants >= session.maxParticipants ? (
                  <ActionButton $variant="disabled" disabled>
                    😞 Session Full
                  </ActionButton>
                ) : (
                  <ActionButton 
                    $variant="primary"
                    onClick={() => handleJoinSession(session.id)}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Joining...' : '🚀 Join Session'}
                  </ActionButton>
                )}
              </SessionActions>
            </SessionCard>
          ))}

          {getFilteredSessions().length === 0 && (
            <EmptyState>
              <EmptyIcon>🏃‍♂️</EmptyIcon>
              <EmptyTitle>
                {activeTab === 'available' && 'No available sessions'}
                {activeTab === 'joined' && 'No joined sessions'}
                {activeTab === 'history' && 'No session history'}
              </EmptyTitle>
              <EmptyText>
                {activeTab === 'available' && 'Check back later for new sports sessions!'}
                {activeTab === 'joined' && 'Join some sessions to get started!'}
                {activeTab === 'history' && 'Your completed sessions will appear here.'}
              </EmptyText>
            </EmptyState>
          )}
        </SessionsList>
      </Content>

      <MainNav 
        activeTab="activities"
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

// Styled Components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #F5F3EF;
  max-width: 393px;
  margin: 0 auto;
`;

const Header = styled.div`
  padding: 16px 20px;
  background: linear-gradient(135deg, #FF6B35, #F7931E);
  color: white;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  color: white;
  cursor: pointer;
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

const PartnershipBadge = styled.div`
  background: rgba(255, 255, 255, 0.2);
  color: white;
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 600;
  border: 1px solid rgba(255, 255, 255, 0.3);
`;

const TabNavigation = styled.div`
  display: flex;
  background: white;
  border-bottom: 1px solid #E0E0E0;
`;

const TabButton = styled.button<{ $active: boolean }>`
  flex: 1;
  background: none;
  border: none;
  padding: 12px 8px;
  font-size: 11px;
  font-weight: 600;
  color: ${({ $active }) => $active ? '#FF6B35' : '#666'};
  border-bottom: 2px solid ${({ $active }) => $active ? '#FF6B35' : 'transparent'};
  cursor: pointer;
  
  &:hover {
    background: #F8F9FA;
  }
`;

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
  padding-bottom: 80px;
`;

const SessionsList = styled.div`
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const SessionCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #FF6B35;
`;

const SessionHeader = styled.div`
  margin-bottom: 12px;
`;

const SessionTitleRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
`;

const SportIcon = styled.div`
  font-size: 32px;
  width: 40px;
  text-align: center;
`;

const SessionInfo = styled.div`
  flex: 1;
`;

const SessionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 4px 0;
`;

const SessionMeta = styled.p`
  font-size: 12px;
  color: #666;
  margin: 0;
`;

const LevelBadge = styled.span<{ $color: string }>`
  background: ${({ $color }) => $color};
  color: white;
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 600;
`;

const SessionDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
`;

const DetailRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const DetailIcon = styled.div`
  font-size: 14px;
  width: 20px;
`;

const DetailText = styled.span`
  font-size: 13px;
  color: #555;
`;

const SessionDescription = styled.p`
  font-size: 13px;
  color: #666;
  line-height: 1.4;
  margin: 0 0 12px 0;
`;

const EquipmentSection = styled.div`
  margin-bottom: 16px;
`;

const EquipmentTitle = styled.h4`
  font-size: 12px;
  font-weight: 600;
  color: #333;
  margin: 0 0 6px 0;
`;

const EquipmentList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const EquipmentItem = styled.span`
  background: #F0F8FF;
  color: #2E86C1;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 500;
`;

const SessionActions = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button<{ $variant: 'primary' | 'secondary' | 'disabled' }>`
  flex: 1;
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  
  ${({ $variant }) => {
    switch ($variant) {
      case 'primary':
        return `
          background: #FF6B35;
          color: white;
          &:hover { background: #E55A2B; }
          &:disabled { opacity: 0.7; cursor: not-allowed; }
        `;
      case 'secondary':
        return `
          background: #F8F9FA;
          color: #666;
          border: 1px solid #E0E0E0;
          &:hover { background: #E9ECEF; }
        `;
      case 'disabled':
        return `
          background: #F5F5F5;
          color: #999;
          cursor: not-allowed;
        `;
    }
  }}
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
`;

const EmptyTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
`;

const EmptyText = styled.p`
  font-size: 14px;
  color: #666;
  margin: 0;
  line-height: 1.4;
`;
