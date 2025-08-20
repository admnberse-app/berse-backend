import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { StatusBar } from '../components/StatusBar/StatusBar';
import { MainNav } from '../components/MainNav/MainNav';
import { useAuth } from '../contexts/AuthContext';
import { cardGameService } from '../services/cardgame.service';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #F9F3E3;
  max-width: 393px;
  margin: 0 auto;
`;

const Header = styled.div`
  background: #F9F3E3;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: #2ece98;
  font-size: 20px;
  cursor: pointer;
  padding: 8px;
`;

const HeaderTitle = styled.h1`
  font-size: 20px;
  color: #333;
  font-weight: 600;
  margin: 0;
  flex: 1;
`;

const Content = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  margin-bottom: 100px;
`;

const StatsCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
`;

const StatGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 12px;
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: bold;
  color: #2ece98;
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: #666;
  margin-top: 4px;
`;

const FilterSection = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  overflow-x: auto;
  padding-bottom: 8px;
`;

const FilterButton = styled.button<{ $active: boolean }>`
  background: ${props => props.$active ? '#2ece98' : 'white'};
  color: ${props => props.$active ? 'white' : '#333'};
  border: 1px solid ${props => props.$active ? '#2ece98' : '#ddd'};
  border-radius: 20px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.$active ? '#27b584' : '#f5f5f5'};
  }
`;

const FeedbackList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const FeedbackCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.08);
`;

const FeedbackHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
`;

const TopicBadge = styled.span<{ $gradient: string }>`
  background: ${props => props.$gradient};
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
`;

const StarRating = styled.div`
  color: #FFD700;
  font-size: 14px;
`;

const QuestionText = styled.div`
  font-size: 14px;
  color: #333;
  margin: 8px 0;
  font-weight: 500;
`;

const CommentText = styled.div`
  font-size: 13px;
  color: #666;
  line-height: 1.4;
  background: #f8f8f8;
  padding: 8px;
  border-radius: 8px;
  margin-top: 8px;
`;

const UserInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #eee;
  font-size: 11px;
  color: #999;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 40px;
  color: #666;
`;

const EmptyMessage = styled.div`
  text-align: center;
  padding: 40px;
  color: #999;
  font-size: 14px;
`;

const ExportButton = styled.button`
  background: #2ece98;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  margin-top: 20px;

  &:hover {
    background: #27b584;
  }
`;

// Topic data (same as in BerseCardGameScreen)
const topicGradients: Record<string, string> = {
  'slowdown': 'linear-gradient(135deg, #2ECE98, #4fc3a1)',
  'love': 'linear-gradient(135deg, #FF6B9D, #FF8E9B)',
  'fomo': 'linear-gradient(135deg, #4A90E2, #7B68EE)',
  'friendship': 'linear-gradient(135deg, #F39C12, #F1C40F)',
  'identity': 'linear-gradient(135deg, #8B4FC3, #B668FF)',
};

const topicNames: Record<string, string> = {
  'slowdown': 'Slow Down',
  'love': 'Love',
  'fomo': 'FOMO',
  'friendship': 'Friendship',
  'identity': 'Identity',
};

export const CardGameFeedbackScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [feedback, setFeedback] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    loadFeedback();
    loadStats();
    // Check if user is admin (you can modify this logic)
    setIsAdmin(user?.email === 'zaydmahdaly@ahlumran.org' || user?.role === 'ADMIN');
  }, [user]);

  const loadFeedback = async () => {
    try {
      const data = await cardGameService.getUserFeedback();
      setFeedback(data);
    } catch (error) {
      console.error('Error loading feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await cardGameService.getTopicStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const getFilteredFeedback = () => {
    if (filter === 'all') return feedback;
    return feedback.filter(f => f.topicId === filter);
  };

  const getTotalStats = () => {
    const filtered = getFilteredFeedback();
    const avgRating = filtered.length > 0 
      ? filtered.reduce((sum, f) => sum + f.rating, 0) / filtered.length 
      : 0;
    
    return {
      total: filtered.length,
      avgRating: avgRating.toFixed(1),
      withComments: filtered.filter(f => f.comment).length,
      uniqueQuestions: new Set(filtered.map(f => f.questionId)).size
    };
  };

  const exportToCSV = () => {
    const data = getFilteredFeedback();
    const csv = [
      ['Topic', 'Session', 'Question ID', 'Rating', 'Comment', 'Date'],
      ...data.map(f => [
        f.topicId,
        f.sessionNumber,
        f.questionId,
        f.rating,
        f.comment || '',
        new Date(f.createdAt).toLocaleString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cardgame-feedback-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const stats = getTotalStats();
  const filteredFeedback = getFilteredFeedback();

  return (
    <Container>
      <StatusBar />
      <Header>
        <BackButton onClick={() => navigate('/bersecardgame')}>←</BackButton>
        <HeaderTitle>CardGame Feedback</HeaderTitle>
      </Header>

      <Content>
        {/* Statistics Overview */}
        <StatsCard>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px' }}>
            {filter === 'all' ? 'Overall Statistics' : `${topicNames[filter]} Statistics`}
          </h3>
          <StatGrid>
            <StatItem>
              <StatValue>{stats.total}</StatValue>
              <StatLabel>Total Feedback</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>⭐ {stats.avgRating}</StatValue>
              <StatLabel>Avg Rating</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>{stats.withComments}</StatValue>
              <StatLabel>With Comments</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>{stats.uniqueQuestions}</StatValue>
              <StatLabel>Questions Rated</StatLabel>
            </StatItem>
          </StatGrid>
        </StatsCard>

        {/* Filter Buttons */}
        <FilterSection>
          <FilterButton $active={filter === 'all'} onClick={() => setFilter('all')}>
            All Topics
          </FilterButton>
          <FilterButton $active={filter === 'slowdown'} onClick={() => setFilter('slowdown')}>
            Slow Down
          </FilterButton>
          <FilterButton $active={filter === 'love'} onClick={() => setFilter('love')}>
            Love
          </FilterButton>
          <FilterButton $active={filter === 'fomo'} onClick={() => setFilter('fomo')}>
            FOMO
          </FilterButton>
          <FilterButton $active={filter === 'friendship'} onClick={() => setFilter('friendship')}>
            Friendship
          </FilterButton>
          <FilterButton $active={filter === 'identity'} onClick={() => setFilter('identity')}>
            Identity
          </FilterButton>
        </FilterSection>

        {/* Feedback List */}
        {loading ? (
          <LoadingMessage>Loading feedback...</LoadingMessage>
        ) : filteredFeedback.length === 0 ? (
          <EmptyMessage>
            {filter === 'all' 
              ? 'No feedback yet. Play BerseCardGame to see your feedback here!'
              : `No feedback for ${topicNames[filter]} yet.`}
          </EmptyMessage>
        ) : (
          <FeedbackList>
            {filteredFeedback.map((item, index) => (
              <FeedbackCard key={item.id}>
                <FeedbackHeader>
                  <TopicBadge $gradient={topicGradients[item.topicId] || 'linear-gradient(135deg, #666, #999)'}>
                    {topicNames[item.topicId]} - Session {item.sessionNumber}
                  </TopicBadge>
                  <StarRating>{'⭐'.repeat(item.rating)}</StarRating>
                </FeedbackHeader>
                
                <QuestionText>Q: {item.questionId.replace(/_/g, ' ').replace(/\d+$/, '')}</QuestionText>
                
                {item.comment && (
                  <CommentText>"{item.comment}"</CommentText>
                )}
                
                <UserInfo>
                  <span>Question #{item.questionId.match(/\d+$/)?.[0]}</span>
                  <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                </UserInfo>
              </FeedbackCard>
            ))}
          </FeedbackList>
        )}

        {/* Export Button */}
        {filteredFeedback.length > 0 && (
          <ExportButton onClick={exportToCSV}>
            📊 Export to CSV
          </ExportButton>
        )}

        {/* Admin Message */}
        {isAdmin && (
          <div style={{ 
            background: '#fff3cd', 
            padding: '12px', 
            borderRadius: '8px', 
            marginTop: '20px',
            fontSize: '12px',
            color: '#856404'
          }}>
            💡 <strong>Admin Tip:</strong> This shows only your feedback. To see all users' feedback, 
            we'll need to create an admin API endpoint. For now, you can query the database directly.
          </div>
        )}
      </Content>

      <MainNav />
    </Container>
  );
};