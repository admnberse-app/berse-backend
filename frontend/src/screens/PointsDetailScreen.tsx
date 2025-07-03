import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { StatusBar } from '../components/StatusBar';
import { Header } from '../components/Header';
import { MainNav } from '../components/MainNav';
import { Points } from '../components/Points';
import rewardsService from '@frontend-api/services/rewards.service';
import userService from '@frontend-api/services/user.service';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.background.default};
`;

const Content = styled.div`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.md};
  padding-bottom: 80px;
  overflow-y: auto;
  max-width: 393px;
  width: 100%;
  margin: 0 auto;
`;

const PointsSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const TabContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  border-bottom: 1px solid ${({ theme }) => theme.colors.divider};
`;

const Tab = styled.button<{ active: boolean }>`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.md};
  background: none;
  border: none;
  border-bottom: 2px solid ${({ theme, active }) => active ? theme.colors.primary.main : 'transparent'};
  color: ${({ theme, active }) => active ? theme.colors.primary.main : theme.colors.text.secondary};
  font-weight: ${({ theme, active }) => active ? theme.typography.body.medium.fontWeight : 'normal'};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    color: ${({ theme }) => theme.colors.primary.main};
  }
`;

const SectionTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.heading.h3.fontSize};
  font-weight: ${({ theme }) => theme.typography.heading.h3.fontWeight};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const TransactionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const TransactionItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borders.radius.lg};
  box-shadow: ${({ theme }) => theme.effects.shadows.small};
`;

const TransactionInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

const TransactionIcon = styled.div<{ type: 'earned' | 'spent' }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${({ theme, type }) => 
    type === 'earned' ? theme.colors.success.light : theme.colors.error.light};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
`;

const TransactionDetails = styled.div`
  flex: 1;
`;

const TransactionTitle = styled.h4`
  font-size: ${({ theme }) => theme.typography.body.medium.fontSize};
  font-weight: ${({ theme }) => theme.typography.body.medium.fontWeight};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

const TransactionDate = styled.p`
  font-size: ${({ theme }) => theme.typography.body.small.fontSize};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0;
`;

const TransactionPoints = styled.span<{ type: 'earned' | 'spent' }>`
  font-size: ${({ theme }) => theme.typography.body.large.fontSize};
  font-weight: ${({ theme }) => theme.typography.body.large.fontWeight};
  color: ${({ theme, type }) => 
    type === 'earned' ? theme.colors.success.main : theme.colors.error.main};
`;

const RewardsList = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${({ theme }) => theme.spacing.md};
`;

const RewardCard = styled.div`
  background-color: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borders.radius.lg};
  padding: ${({ theme }) => theme.spacing.md};
  box-shadow: ${({ theme }) => theme.effects.shadows.small};
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.effects.shadows.medium};
  }
`;

const RewardImage = styled.div`
  width: 100%;
  height: 80px;
  background-color: ${({ theme }) => theme.colors.neutral[200]};
  border-radius: ${({ theme }) => theme.borders.radius.md};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
`;

const RewardTitle = styled.h4`
  font-size: ${({ theme }) => theme.typography.body.small.fontSize};
  font-weight: ${({ theme }) => theme.typography.body.medium.fontWeight};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 ${({ theme }) => theme.spacing.xs} 0;
`;

const RewardPoints = styled.p`
  font-size: ${({ theme }) => theme.typography.body.small.fontSize};
  color: ${({ theme }) => theme.colors.primary.main};
  font-weight: ${({ theme }) => theme.typography.body.medium.fontWeight};
  margin: 0;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

interface PointTransaction {
  id: string;
  points: number;
  action: string;
  description?: string;
  createdAt: string;
}

interface Reward {
  id: string;
  title: string;
  pointsRequired: number;
  category: string;
  imageUrl?: string;
}

export const PointsDetailScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'history' | 'rewards'>('history');
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'history') {
        const history = await userService.getPointsHistory();
        setTransactions(history);
      } else {
        const availableRewards = await rewardsService.getRewards();
        setRewards(availableRewards.filter((r: any) => r.pointsRequired <= (user?.points || 0)));
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric' 
    });
  };

  const getTransactionIcon = (action: string) => {
    const icons: Record<string, string> = {
      'event_attendance': '📅',
      'referral': '👥',
      'profile_complete': '✅',
      'badge_earned': '🏆',
      'reward_redeemed': '🎁',
      'default': '⭐'
    };
    return icons[action] || icons.default;
  };

  const handleRewardClick = (rewardId: string) => {
    navigate(`/rewards/${rewardId}`);
  };

  return (
    <Container>
      <StatusBar />
      <Header
        title="Points & Rewards"
        showBack
        onBackPress={() => navigate('/dashboard')}
      />

      <Content>
        <PointsSection>
          <Points points={user?.points || 0} size="large" />
        </PointsSection>

        <TabContainer>
          <Tab 
            active={activeTab === 'history'} 
            onClick={() => setActiveTab('history')}
          >
            History
          </Tab>
          <Tab 
            active={activeTab === 'rewards'} 
            onClick={() => setActiveTab('rewards')}
          >
            Available Rewards
          </Tab>
        </TabContainer>

        {activeTab === 'history' ? (
          <>
            <SectionTitle>Transaction History</SectionTitle>
            {isLoading ? (
              <EmptyState>Loading transactions...</EmptyState>
            ) : transactions.length > 0 ? (
              <TransactionList>
                {transactions.map((transaction) => (
                  <TransactionItem key={transaction.id}>
                    <TransactionInfo>
                      <TransactionIcon type={transaction.points > 0 ? 'earned' : 'spent'}>
                        {getTransactionIcon(transaction.action)}
                      </TransactionIcon>
                      <TransactionDetails>
                        <TransactionTitle>
                          {transaction.description || transaction.action}
                        </TransactionTitle>
                        <TransactionDate>{formatDate(transaction.createdAt)}</TransactionDate>
                      </TransactionDetails>
                    </TransactionInfo>
                    <TransactionPoints type={transaction.points > 0 ? 'earned' : 'spent'}>
                      {transaction.points > 0 ? '+' : ''}{transaction.points}
                    </TransactionPoints>
                  </TransactionItem>
                ))}
              </TransactionList>
            ) : (
              <EmptyState>No transactions yet</EmptyState>
            )}
          </>
        ) : (
          <>
            <SectionTitle>Rewards You Can Redeem</SectionTitle>
            {isLoading ? (
              <EmptyState>Loading rewards...</EmptyState>
            ) : rewards.length > 0 ? (
              <RewardsList>
                {rewards.map((reward) => (
                  <RewardCard key={reward.id} onClick={() => handleRewardClick(reward.id)}>
                    <RewardImage>🎁</RewardImage>
                    <RewardTitle>{reward.title}</RewardTitle>
                    <RewardPoints>{reward.pointsRequired} points</RewardPoints>
                  </RewardCard>
                ))}
              </RewardsList>
            ) : (
              <EmptyState>No rewards available at your current points level</EmptyState>
            )}
          </>
        )}
      </Content>

      <MainNav
        activeTab="rewards"
        onTabPress={(tab) => {
          if (tab === 'home') navigate('/dashboard');
          else if (tab === 'connect') navigate('/connect');
          else if (tab === 'match') navigate('/match');
          else if (tab === 'profile') navigate('/profile');
        }}
      />
    </Container>
  );
};