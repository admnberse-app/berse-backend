import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { StatusBar } from '../components/StatusBar';
import { MainNav } from '../components/MainNav';

// Styled Components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #F9F3E3;
`;

const Header = styled.div`
  background: white;
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
`;

const HeaderTop = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 16px;
`;

const BackButton = styled.button`
  background: #2D5F4F;
  border: none;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 18px;
  margin-right: 12px;
  transition: all 0.2s ease;
  
  &:hover {
    background: #1a4a3a;
  }
`;

const HeaderTitle = styled.h1`
  margin: 0;
  font-size: 20px;
  font-weight: bold;
  color: #333;
`;

const UserRankInfo = styled.div`
  text-align: left;
`;

const UserRank = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
`;

const UserProgress = styled.div`
  font-size: 14px;
  color: #666;
`;

const Content = styled.div`
  flex: 1;
  padding: 20px;
  padding-bottom: 100px;
`;

const TabsContainer = styled.div`
  display: flex;
  background: white;
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const Tab = styled.button<{ active: boolean }>`
  flex: 1;
  padding: 12px 16px;
  border: none;
  border-radius: 8px;
  background: ${({ active }) => active ? '#2D5F4F' : 'transparent'};
  color: ${({ active }) => active ? 'white' : '#666'};
  font-size: 14px;
  font-weight: ${({ active }) => active ? '600' : '500'};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    color: ${({ active }) => active ? 'white' : '#2D5F4F'};
  }
`;

const LeaderboardList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
`;

const LeaderboardItem = styled.div<{ isCurrentUser?: boolean }>`
  background: ${({ isCurrentUser }) => 
    isCurrentUser ? 'linear-gradient(45deg, #F5F3EF, #E8F4F0)' : 'white'};
  border: ${({ isCurrentUser }) => 
    isCurrentUser ? '1px solid #2D5F4F' : 'none'};
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  position: relative;
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const RankNumber = styled.div<{ rank: number }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
  background: ${({ rank }) => 
    rank === 1 ? 'linear-gradient(45deg, #FFD700, #FFA500)' :
    rank === 2 ? 'linear-gradient(45deg, #C0C0C0, #A8A8A8)' :
    rank === 3 ? 'linear-gradient(45deg, #CD7F32, #B8860B)' :
    '#e0e0e0'};
  color: ${({ rank }) => rank <= 3 ? 'white' : '#333'};
`;

const Medal = styled.span`
  font-size: 20px;
  margin-right: 8px;
`;

const UserInfo = styled.div``;

const UserName = styled.div<{ isCurrentUser?: boolean }>`
  font-weight: 600;
  color: ${({ isCurrentUser }) => isCurrentUser ? '#2D5F4F' : '#333'};
  font-size: 16px;
  margin-bottom: 2px;
`;

const UserStats = styled.div`
  font-size: 12px;
  color: #666;
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const TotalPoints = styled.div`
  text-align: right;
`;

const PointsValue = styled.div<{ isCurrentUser?: boolean }>`
  font-weight: bold;
  color: ${({ isCurrentUser }) => isCurrentUser ? '#2D5F4F' : '#333'};
  font-size: 18px;
  margin-bottom: 2px;
`;

const PointsLabel = styled.div`
  font-size: 11px;
  color: #666;
`;

const WeeklyGain = styled.div`
  background: #e8f5e8;
  color: #10B981;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
`;

const CurrentUserArrow = styled.div`
  position: absolute;
  left: -10px;
  top: 50%;
  transform: translateY(-50%);
  color: #2D5F4F;
  font-size: 20px;
  font-weight: bold;
`;

const ShowMoreButton = styled.button`
  width: 100%;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 16px;
  color: #2D5F4F;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 24px;
  
  &:hover {
    background: #f8f9fa;
    border-color: #2D5F4F;
  }
`;

const MotivationalSection = styled.div`
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`;

const MotivationalTitle = styled.h3`
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: bold;
  color: #2D5F4F;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const EarningTipsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const EarningTip = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s ease;
  
  &:hover {
    background: #e8f4f0;
  }
`;

const TipLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const TipIcon = styled.div`
  width: 32px;
  height: 32px;
  background: #2D5F4F;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
`;

const TipInfo = styled.div``;

const TipAction = styled.div`
  font-weight: 600;
  color: #333;
  margin-bottom: 2px;
`;

const TipDescription = styled.div`
  font-size: 12px;
  color: #666;
`;

const TipPoints = styled.div`
  background: #2D5F4F;
  color: white;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
`;

export const LeaderboardScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'week' | 'month' | 'all'>('week');
  const [showMore, setShowMore] = useState(false);

  // Mock leaderboard data
  const leaderboardData = {
    week: [
      { rank: 1, name: 'Zayd M.', points: 245, weeklyGain: 15, avatar: 'ZM', isCurrentUser: true },
      { rank: 2, name: 'Ahmad M.', points: 145, weeklyGain: 45, avatar: 'AM' },
      { rank: 3, name: 'Siti F.', points: 132, weeklyGain: 32, avatar: 'SF' },
      { rank: 4, name: 'Khalid M.', points: 128, weeklyGain: 28, avatar: 'KM' },
      { rank: 5, name: 'Fatima A.', points: 115, weeklyGain: 25, avatar: 'FA' },
      { rank: 6, name: 'Omar R.', points: 98, weeklyGain: 22, avatar: 'OR' },
      { rank: 7, name: 'Aisha K.', points: 87, weeklyGain: 18, avatar: 'AK' },
      { rank: 8, name: 'Nadia S.', points: 68, weeklyGain: 12, avatar: 'NS' },
      { rank: 9, name: 'Hassan L.', points: 55, weeklyGain: 10, avatar: 'HL' },
      { rank: 10, name: 'Maryam B.', points: 45, weeklyGain: 8, avatar: 'MB' },
    ]
  };

  const currentData = leaderboardData.week;
  const displayedData = showMore ? currentData : currentData.slice(0, 7);
  const currentUser = currentData.find(user => user.isCurrentUser);

  const getMedal = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '';
    }
  };

  const earningTips = [
    {
      icon: '🎪',
      action: 'Attend events',
      description: 'Join community gatherings and trips',
      points: '+5-20'
    },
    {
      icon: '🤝',
      action: 'Make connections',
      description: 'Connect with new members via BerseMatch',
      points: '+3'
    },
    {
      icon: '👤',
      action: 'Complete profile',
      description: 'Add your interests and photos',
      points: '+10'
    },
    {
      icon: '👥',
      action: 'Refer friends',
      description: 'Invite friends to join BerseMuka',
      points: '+25'
    },
    {
      icon: '💬',
      action: 'Forum engagement',
      description: 'Post and reply in BerseForum',
      points: '+2'
    },
    {
      icon: '🎯',
      action: 'Daily check-in',
      description: 'Open the app daily for streak bonus',
      points: '+1-5'
    }
  ];

  return (
    <Container>
      <StatusBar />
      
      {/* Standardized Header */}
      <div style={{
        background: '#F5F3EF',
        width: '100%',
        padding: '12px 16px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: '#4A6741',
              color: 'white',
              fontSize: '16px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              ZM
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <div style={{ fontSize: '12px', color: '#999999', fontWeight: 'normal' }}>Community Rankings</div>
              <div style={{ fontSize: '18px', color: '#333333', fontWeight: '600' }}>BersePoints Leaderboard</div>
            </div>
          </div>
          <div style={{
            background: '#FF6B6B',
            color: 'white',
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            fontSize: '12px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>3</div>
        </div>
        
        {/* User Rank Info */}
        <div style={{
          marginTop: '12px',
          padding: '8px 0'
        }}>
          <div style={{ fontSize: '14px', color: '#333', fontWeight: '600' }}>
            Your Rank: #{currentUser?.rank || 1} of 234 users | This week: +{currentUser?.weeklyGain || 15} pts
          </div>
        </div>
      </div>
      
      <Content>
        <TabsContainer>
          <Tab 
            active={activeTab === 'week'} 
            onClick={() => setActiveTab('week')}
          >
            This Week
          </Tab>
          <Tab 
            active={activeTab === 'month'} 
            onClick={() => setActiveTab('month')}
          >
            This Month
          </Tab>
          <Tab 
            active={activeTab === 'all'} 
            onClick={() => setActiveTab('all')}
          >
            All Time
          </Tab>
        </TabsContainer>
        
        <LeaderboardList>
          {displayedData.map((user) => (
            <LeaderboardItem key={user.rank} isCurrentUser={user.isCurrentUser}>
              {user.isCurrentUser && <CurrentUserArrow>→</CurrentUserArrow>}
              
              <LeftSection>
                <RankNumber rank={user.rank}>
                  {user.rank <= 3 ? '' : user.rank}
                </RankNumber>
                {user.rank <= 3 && <Medal>{getMedal(user.rank)}</Medal>}
                
                <UserInfo>
                  <UserName isCurrentUser={user.isCurrentUser}>
                    {user.name}{user.isCurrentUser ? ' (You)' : ''}
                  </UserName>
                  <UserStats>Active member</UserStats>
                </UserInfo>
              </LeftSection>
              
              <RightSection>
                <TotalPoints>
                  <PointsValue isCurrentUser={user.isCurrentUser}>
                    {user.points.toLocaleString()}
                  </PointsValue>
                  <PointsLabel>points</PointsLabel>
                </TotalPoints>
                
                <WeeklyGain>+{user.weeklyGain}</WeeklyGain>
              </RightSection>
            </LeaderboardItem>
          ))}
        </LeaderboardList>
        
        {!showMore && currentData.length > 7 && (
          <ShowMoreButton onClick={() => setShowMore(true)}>
            Show More Users ({currentData.length - 7} more)
          </ShowMoreButton>
        )}
        
        <MotivationalSection>
          <MotivationalTitle>
            💡 Earn more points:
          </MotivationalTitle>
          
          <EarningTipsList>
            {earningTips.map((tip, index) => (
              <EarningTip key={index}>
                <TipLeft>
                  <TipIcon>{tip.icon}</TipIcon>
                  <TipInfo>
                    <TipAction>{tip.action}</TipAction>
                    <TipDescription>{tip.description}</TipDescription>
                  </TipInfo>
                </TipLeft>
                <TipPoints>{tip.points}</TipPoints>
              </EarningTip>
            ))}
          </EarningTipsList>
        </MotivationalSection>
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