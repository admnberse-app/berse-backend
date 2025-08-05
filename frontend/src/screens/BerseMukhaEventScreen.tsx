import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { StatusBar } from '../components/StatusBar/StatusBar';
import { MainNav } from '../components/MainNav/MainNav';
import { useAuth } from '../contexts/AuthContext';

interface BerseMukhaSession {
  id: string;
  title: string;
  theme: string;
  format: 'Discussion' | 'Workshop' | 'Presentation' | 'Networking';
  date: string;
  time: string;
  duration: string;
  location: string;
  participants: number;
  maxParticipants: number;
  price: number;
  description: string;
  topics: string[];
  moderator?: string;
  isJoined: boolean;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
}

interface UserJoinedSession {
  sessionId: string;
  joinedAt: Date;
  status: 'joined' | 'attended' | 'cancelled';
}

export const BerseMukhaEventScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'available' | 'joined' | 'history'>('available');
  const [sessions, setSessions] = useState<BerseMukhaSession[]>([]);
  const [joinedSessions, setJoinedSessions] = useState<UserJoinedSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Mock BerseMukha sessions data
  useEffect(() => {
    const mockSessions: BerseMukhaSession[] = [
      {
        id: 'bmukha-1',
        title: 'Building Meaningful Connections',
        theme: 'Personal Development',
        format: 'Discussion',
        date: '2025-01-15',
        time: '19:30',
        duration: '2 hours',
        location: 'The Co Bangsar',
        participants: 18,
        maxParticipants: 25,
        price: 35,
        description: 'Explore authentic ways to build lasting relationships in our digital age. Share experiences and learn from diverse perspectives.',
        topics: ['Communication', 'Empathy', 'Cultural Exchange', 'Active Listening'],
        moderator: 'Dr. Sarah Ahmad',
        isJoined: false,
        difficulty: 'All Levels'
      },
      {
        id: 'bmukha-2',
        title: 'Malaysian Cultural Diversity Workshop',
        theme: 'Cultural Understanding',
        format: 'Workshop',
        date: '2025-01-18',
        time: '14:00',
        duration: '3 hours',
        location: 'Publika Community Hall',
        participants: 12,
        maxParticipants: 20,
        price: 50,
        description: 'Interactive workshop celebrating Malaysia\'s rich cultural tapestry. Learn traditional practices and modern perspectives.',
        topics: ['Cultural Traditions', 'Food Heritage', 'Language Exchange', 'Storytelling'],
        moderator: 'Prof. Ahmad Rahman',
        isJoined: true,
        difficulty: 'Beginner'
      },
      {
        id: 'bmukha-3',
        title: 'Future of Work: Remote Connections',
        theme: 'Professional Development',
        format: 'Presentation',
        date: '2025-01-22',
        time: '18:00',
        duration: '1.5 hours',
        location: 'KLCC Convention Centre',
        participants: 35,
        maxParticipants: 40,
        price: 75,
        description: 'Discover strategies for meaningful professional relationships in hybrid work environments.',
        topics: ['Remote Collaboration', 'Digital Networking', 'Work-Life Balance', 'Team Building'],
        moderator: 'Lisa Tan, HR Director',
        isJoined: false,
        difficulty: 'Intermediate'
      },
      {
        id: 'bmukha-4',
        title: 'Community Building Through Food',
        theme: 'Social Connection',
        format: 'Networking',
        date: '2025-01-25',
        time: '17:00',
        duration: '2.5 hours',
        location: 'Central Market Annexe',
        participants: 22,
        maxParticipants: 30,
        price: 65,
        description: 'Experience how food brings people together. Cooking, sharing, and storytelling session.',
        topics: ['Food Culture', 'Community Cooking', 'Shared Stories', 'Cultural Recipes'],
        moderator: 'Chef Aminah',
        isJoined: false,
        difficulty: 'All Levels'
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
      alert('Successfully joined the BerseMukha session! You will receive a confirmation email with details.');
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
      alert('You have left the BerseMukha session.');
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

  const getFormatEmoji = (format: string) => {
    const formatEmojis: Record<string, string> = {
      'Discussion': '💬',
      'Workshop': '🛠️',
      'Presentation': '📽️',
      'Networking': '🤝'
    };
    return formatEmojis[format] || '💬';
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors: Record<string, string> = {
      'Beginner': '#4CAF50',
      'Intermediate': '#FF9800',
      'Advanced': '#F44336',
      'All Levels': '#9C27B0'
    };
    return colors[difficulty] || '#9C27B0';
  };

  const getThemeColor = (theme: string) => {
    const colors: Record<string, string> = {
      'Personal Development': '#E91E63',
      'Cultural Understanding': '#FF9800',
      'Professional Development': '#2196F3',
      'Social Connection': '#4CAF50'
    };
    return colors[theme] || '#9C27B0';
  };

  return (
    <Container>
      <StatusBar />
      
      <Header>
        <BackButton onClick={() => navigate('/dashboard')}>←</BackButton>
        <HeaderContent>
          <HeaderTitle>🤝 BerseMukha Sessions</HeaderTitle>
          <HeaderSubtext>Meaningful Conversations & Connections</HeaderSubtext>
        </HeaderContent>
        <PartnershipBadge>Ahlul Umran</PartnershipBadge>
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
                  <FormatIcon>{getFormatEmoji(session.format)}</FormatIcon>
                  <SessionInfo>
                    <SessionTitle>{session.title}</SessionTitle>
                    <SessionMeta>{session.format} • {session.location}</SessionMeta>
                  </SessionInfo>
                  <DifficultyBadge $color={getDifficultyColor(session.difficulty)}>
                    {session.difficulty}
                  </DifficultyBadge>
                </SessionTitleRow>
                <ThemeBadge $color={getThemeColor(session.theme)}>
                  {session.theme}
                </ThemeBadge>
              </SessionHeader>

              <SessionDetails>
                <DetailRow>
                  <DetailIcon>📅</DetailIcon>
                  <DetailText>{new Date(session.date).toLocaleDateString()} at {session.time}</DetailText>
                </DetailRow>
                
                <DetailRow>
                  <DetailIcon>⏱️</DetailIcon>
                  <DetailText>{session.duration}</DetailText>
                </DetailRow>

                <DetailRow>
                  <DetailIcon>👥</DetailIcon>
                  <DetailText>{session.participants}/{session.maxParticipants} participants</DetailText>
                </DetailRow>

                {session.moderator && (
                  <DetailRow>
                    <DetailIcon>🎤</DetailIcon>
                    <DetailText>{session.moderator}</DetailText>
                  </DetailRow>
                )}

                <DetailRow>
                  <DetailIcon>💰</DetailIcon>
                  <DetailText>{session.price === 0 ? 'Free' : `RM ${session.price}`}</DetailText>
                </DetailRow>
              </SessionDetails>

              <SessionDescription>{session.description}</SessionDescription>

              {session.topics.length > 0 && (
                <TopicsSection>
                  <TopicsTitle>Discussion Topics:</TopicsTitle>
                  <TopicsList>
                    {session.topics.map((topic, index) => (
                      <TopicItem key={index}>{topic}</TopicItem>
                    ))}
                  </TopicsList>
                </TopicsSection>
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
              <EmptyIcon>🤝</EmptyIcon>
              <EmptyTitle>
                {activeTab === 'available' && 'No available sessions'}
                {activeTab === 'joined' && 'No joined sessions'}
                {activeTab === 'history' && 'No session history'}
              </EmptyTitle>
              <EmptyText>
                {activeTab === 'available' && 'Check back later for new BerseMukha sessions!'}
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
  background: linear-gradient(135deg, #9C27B0, #7B1FA2);
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
  color: ${({ $active }) => $active ? '#9C27B0' : '#666'};
  border-bottom: 2px solid ${({ $active }) => $active ? '#9C27B0' : 'transparent'};
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
  border-left: 4px solid #9C27B0;
`;

const SessionHeader = styled.div`
  margin-bottom: 12px;
`;

const SessionTitleRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 8px;
`;

const FormatIcon = styled.div`
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

const DifficultyBadge = styled.span<{ $color: string }>`
  background: ${({ $color }) => $color};
  color: white;
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 600;
`;

const ThemeBadge = styled.div<{ $color: string }>`
  background: ${({ $color }) => $color}15;
  color: ${({ $color }) => $color};
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  display: inline-block;
  border: 1px solid ${({ $color }) => $color}30;
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

const TopicsSection = styled.div`
  margin-bottom: 16px;
`;

const TopicsTitle = styled.h4`
  font-size: 12px;
  font-weight: 600;
  color: #333;
  margin: 0 0 6px 0;
`;

const TopicsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const TopicItem = styled.span`
  background: #F3E5F5;
  color: #7B1FA2;
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
          background: #9C27B0;
          color: white;
          &:hover { background: #7B1FA2; }
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