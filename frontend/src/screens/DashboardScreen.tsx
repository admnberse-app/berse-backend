import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { StatusBar } from '../components/StatusBar';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Points } from '../components/Points';
import { Button } from '../components/Button';
import { SideMenu } from '../components/SideMenu';
import { NotificationPanel } from '../components/NotificationPanel';
import { BottomNav } from '../components/BottomNav';
import { QRCodeGenerator } from '../components/QRCode';
import { DualQRModal } from '../components/DualQRModal';
import { ManagePassModal } from '../components/ManagePassModal';
import { RedemptionConfirmModal } from '../components/RedemptionConfirmModal';
import { VoucherDisplayModal } from '../components/VoucherDisplayModal';
import { Toast } from '../components/Toast';
import { getUserPoints, updateUserPoints } from '../utils/initializePoints';
import { voucherService } from '../services/voucherService';
import { useUniversalRedemption } from '../hooks/useUniversalRedemption';
import { Event } from '../types';

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


const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: bold;
  color: #2D5F4F;
  margin: 0 0 12px 0;
  text-align: left;
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
  const [isDualQRModalOpen, setIsDualQRModalOpen] = useState(false);
  const [isManagePassModalOpen, setIsManagePassModalOpen] = useState(false);
  const [isSetelConnected, setIsSetelConnected] = useState(true); // Mock connected state
  const [setelBalance, setSetelBalance] = useState(45.60); // Mock Setel wallet balance
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [showSetelOnboarding, setShowSetelOnboarding] = useState(false);
  const [currentPoints, setCurrentPoints] = useState(getUserPoints());
  
  // Filter state for bottom panel system
  const [activeFilter, setActiveFilter] = useState<string | null>('featured-rewards');
  const [showBottomPanel, setShowBottomPanel] = useState(false);

  // Use universal redemption hook
  const {
    selectedReward,
    showConfirmModal,
    showVoucherModal,
    generatedVoucher,
    toast,
    handleRedeemClick,
    handleConfirmRedeem,
    closeConfirmModal,
    closeVoucherModal,
    navigateToVouchers,
    closeToast,
    canAfford,
    getButtonProps
  } = useUniversalRedemption();

  // Dashboard reward cards data
  const dashboardRewards = [
    { id: 'bright', icon: '📚', brand: 'BRIGHT English Centre', title: '20% off English courses', value: '20% off', points: 50, category: 'Education', description: '20% off English courses' },
    { id: 'university', icon: '🎓', brand: 'University Studies', title: '20% off university fees', value: '20% off', points: 100, category: 'Education', description: '20% off university fees' },
    { id: 'mukha', icon: '☕', brand: 'Mukha Cafe', title: 'Food & beverage discount', value: 'Discount', points: 25, category: 'Food & Drinks', description: 'Food & beverage discount' },
    { id: 'umran', icon: '✈️', brand: 'Umran Travel & Tours', title: '10% discount on travel', value: '10% off', points: 75, category: 'Travel', description: '10% discount on travel' }
  ];

  // Listen for points updates
  useEffect(() => {
    const handlePointsUpdate = (event: CustomEvent) => {
      setCurrentPoints(event.detail.points);
    };

    window.addEventListener('pointsUpdated', handlePointsUpdate as EventListener);
    
    return () => {
      window.removeEventListener('pointsUpdated', handlePointsUpdate as EventListener);
    };
  }, []);

  // Generate QR code data for BersePass
  const generateQRData = () => {
    const bersePassData = {
      userId: user?.id || 'user_123',
      userName: user?.fullName || 'Zara Aisha',
      bersePassStatus: 'ACTIVE',
      passType: 'PREMIUM',
      validUntil: '2025-12-31',
      level: 3,
      points: currentPoints,
      memberSince: '2024-01-01',
      benefits: ['free_events', 'cafe_discounts', 'priority_booking'],
      timestamp: new Date().toISOString()
    };
    return JSON.stringify(bersePassData);
  };

  // Simulate Setel balance update (in production, this would be an API call)
  useEffect(() => {
    if (isSetelConnected) {
      setIsLoadingBalance(true);
      // Simulate API delay
      setTimeout(() => {
        setSetelBalance(45.60); // Updated balance from Setel
        setIsLoadingBalance(false);
      }, 1000);
    }
  }, [isSetelConnected]);

  // Check for first-time users
  useEffect(() => {
    const hasSeenSetelIntro = localStorage.getItem('hasSeenSetelIntro');
    if (!hasSeenSetelIntro && !isSetelConnected) {
      setShowSetelOnboarding(true);
    }
  }, [isSetelConnected]);

  useEffect(() => {
    console.log('DashboardScreen loaded on port 5173');
    // loadUpcomingEvents();
    setIsLoading(false); // Set loading to false since we're not loading events yet
  }, []);

  // Filter handler functions for inline content
  const handleFilterClick = (filterType: string) => {
    console.log(`Filter clicked: ${filterType} on port 5173`);
    
    if (activeFilter === filterType) {
      // If clicking the same filter, hide content
      setActiveFilter(null);
    } else {
      // Show new filter content
      setActiveFilter(filterType);
    }
  };

  const getFilterTitle = (filter: string | null): string => {
    const titles: { [key: string]: string } = {
      'featured-rewards': '🎁 Featured Rewards',
      'points-leaderboard': '🏆 Points Leaderboard', 
      'recent-activities': '📈 Recent Activities',
      'bersementor': '👨‍🏫 BerseMentor',
      'bersebuddy': '🤝 BerseBuddy'
    };
    return titles[filter || ''] || 'Explore Features';
  };

  const renderFilterContent = (filter: string | null) => {
    switch (filter) {
      case 'featured-rewards':
        return (
          <RewardsContainer>
            <RewardsGrid>
              <RewardCard $bgColor="#4A90E2">
                <FilterRewardIcon>📚</FilterRewardIcon>
                <RewardContent>
                  <RewardTitle>BRIGHT English Centre</RewardTitle>
                  <RewardDiscount>20% off English courses</RewardDiscount>
                  <FilterRewardPoints>50 pts</FilterRewardPoints>
                </RewardContent>
                <FilterRedeemButton 
                  onClick={() => handleRedeemClick({
                    id: 'bright',
                    icon: '📚',
                    brand: 'BRIGHT English Centre',
                    title: '20% off English courses',
                    value: '20% off',
                    points: 50,
                    category: 'Education',
                    description: '20% off English courses'
                  })}
                  disabled={!canAfford(50)}
                  style={{ opacity: canAfford(50) ? 1 : 0.5 }}
                >
                  Redeem
                </FilterRedeemButton>
              </RewardCard>

              <RewardCard $bgColor="#27AE60">
                <FilterRewardIcon>🎓</FilterRewardIcon>
                <RewardContent>
                  <RewardTitle>University Studies</RewardTitle>
                  <RewardDiscount>20% off university fees</RewardDiscount>
                  <FilterRewardPoints>100 pts</FilterRewardPoints>
                </RewardContent>
                <FilterRedeemButton 
                  onClick={() => handleRedeemClick({
                    id: 'university',
                    icon: '🎓',
                    brand: 'University Studies',
                    title: '20% off university fees',
                    value: '20% off',
                    points: 100,
                    category: 'Education',
                    description: '20% off university fees'
                  })}
                  disabled={!canAfford(100)}
                  style={{ opacity: canAfford(100) ? 1 : 0.5 }}
                >
                  Redeem
                </FilterRedeemButton>
              </RewardCard>

              <RewardCard $bgColor="#E91E63">
                <FilterRewardIcon>☕</FilterRewardIcon>
                <RewardContent>
                  <RewardTitle>Mukha Cafe</RewardTitle>
                  <RewardDiscount>Food & beverage discount</RewardDiscount>
                  <FilterRewardPoints>25 pts</FilterRewardPoints>
                </RewardContent>
                <FilterRedeemButton 
                  onClick={() => handleRedeemClick({
                    id: 'mukha',
                    icon: '☕',
                    brand: 'Mukha Cafe',
                    title: 'Food & beverage discount',
                    value: 'Discount',
                    points: 25,
                    category: 'Food & Drinks',
                    description: 'Food & beverage discount'
                  })}
                  disabled={!canAfford(25)}
                  style={{ opacity: canAfford(25) ? 1 : 0.5 }}
                >
                  Redeem
                </FilterRedeemButton>
              </RewardCard>

              <RewardCard $bgColor="#FF9800">
                <FilterRewardIcon>✈️</FilterRewardIcon>
                <RewardContent>
                  <RewardTitle>Umrah Travel & Tours</RewardTitle>
                  <RewardDiscount>10% discount on travel</RewardDiscount>
                  <FilterRewardPoints>75 pts</FilterRewardPoints>
                </RewardContent>
                <FilterRedeemButton 
                  onClick={() => handleRedeemClick({
                    id: 'umran',
                    icon: '✈️',
                    brand: 'Umrah Travel & Tours',
                    title: '10% discount on travel',
                    value: '10% off',
                    points: 75,
                    category: 'Travel',
                    description: '10% discount on travel'
                  })}
                  disabled={!canAfford(75)}
                  style={{ opacity: canAfford(75) ? 1 : 0.5 }}
                >
                  Redeem
                </FilterRedeemButton>
              </RewardCard>
            </RewardsGrid>
          </RewardsContainer>
        );

      case 'points-leaderboard':
        return (
          <LeaderboardContainer>
            <LeaderboardHeader>
              <HeaderIcon>🏆</HeaderIcon>
              <HeaderTitle>Points Leaderboard</HeaderTitle>
            </LeaderboardHeader>
            
            <FilterLeaderboardList>
              <LeaderboardItem $rank={1}>
                <RankNumber>1.</RankNumber>
                <PlayerName>Ahmad M.</PlayerName>
                <PlayerPoints>1,245</PlayerPoints>
                <PointsChange $positive={true}>+45</PointsChange>
              </LeaderboardItem>

              <LeaderboardItem $rank={2}>
                <RankNumber>2.</RankNumber>
                <PlayerName>Siti F.</PlayerName>
                <PlayerPoints>980</PlayerPoints>
                <PointsChange $positive={true}>+32</PointsChange>
              </LeaderboardItem>

              <LeaderboardItem $rank={3}>
                <RankNumber>3.</RankNumber>
                <PlayerName>Khalid M.</PlayerName>
                <PlayerPoints>750</PlayerPoints>
                <PointsChange $positive={true}>+28</PointsChange>
              </LeaderboardItem>

              <LeaderboardItem $rank={7} $isUser={true}>
                <RankNumber>7.</RankNumber>
                <PlayerName>Zayd M. (You)</PlayerName>
                <PlayerPoints>245</PlayerPoints>
                <PointsChange $positive={true}>+15</PointsChange>
              </LeaderboardItem>
            </FilterLeaderboardList>

            <ViewFullButton onClick={() => navigate('/leaderboard')}>
              <ViewFullIcon>🏆</ViewFullIcon>
              View Full Leaderboard →
            </ViewFullButton>
          </LeaderboardContainer>
        );

      case 'recent-activities':
        return (
          <ActivitiesContainer>
            <ActivitiesHeader>
              <HeaderIcon>📈</HeaderIcon>
              <HeaderTitle>Recent Activities</HeaderTitle>
            </ActivitiesHeader>

            <ActivitiesList>
              <FilterActivityItem>
                <ActivityIconContainer $bgColor="#4A90E2">
                  <FilterActivityIcon>🤝</FilterActivityIcon>
                </ActivityIconContainer>
                <ActivityContent>
                  <ActivityTitle>Sarah & Ahmad connected</ActivityTitle>
                </ActivityContent>
                <ActivityPoints>+3 pts</ActivityPoints>
              </FilterActivityItem>

              <FilterActivityItem>
                <ActivityIconContainer $bgColor="#27AE60">
                  <FilterActivityIcon>🎯</FilterActivityIcon>
                </ActivityIconContainer>
                <ActivityContent>
                  <ActivityTitle>15 joined Cameron trip</ActivityTitle>
                </ActivityContent>
                <ActivityMeta>15 joined</ActivityMeta>
              </FilterActivityItem>

              <FilterActivityItem>
                <ActivityIconContainer $bgColor="#9C27B0">
                  <FilterActivityIcon>⭐</FilterActivityIcon>
                </ActivityIconContainer>
                <ActivityContent>
                  <ActivityTitle>Berseka gathering started</ActivityTitle>
                </ActivityContent>
                <ActivityMeta>12 joined</ActivityMeta>
              </FilterActivityItem>

              <FilterActivityItem>
                <ActivityIconContainer $bgColor="#2E7D32">
                  <FilterActivityIcon>📖</FilterActivityIcon>
                </ActivityIconContainer>
                <ActivityContent>
                  <ActivityTitle>Quran study completed</ActivityTitle>
                </ActivityContent>
                <ActivityMeta>8 members</ActivityMeta>
              </FilterActivityItem>

              <FilterActivityItem>
                <ActivityIconContainer $bgColor="#F57C00">
                  <FilterActivityIcon>🧹</FilterActivityIcon>
                </ActivityIconContainer>
                <ActivityContent>
                  <ActivityTitle>Cleanup completed</ActivityTitle>
                </ActivityContent>
                <ActivityMeta>20 volunteers</ActivityMeta>
              </FilterActivityItem>
            </ActivitiesList>
          </ActivitiesContainer>
        );

      case 'bersementor':
        return (
          <MentorContainer>
            <IntegrationPrompt>
              <PromptIcon>🔗</PromptIcon>
              <PromptText>
                <PromptTitle>Connect with TalentCorp</PromptTitle>
                <PromptDesc>Access professional mentorship through MyHeart and MyMahir</PromptDesc>
              </PromptText>
              <FilterConnectButton onClick={() => navigate('/bersementor')}>Connect</FilterConnectButton>
            </IntegrationPrompt>
          </MentorContainer>
        );

      case 'bersebuddy':
        return (
          <BuddyContainer>
            <IntegrationPrompt>
              <PromptIcon>🎓</PromptIcon>
              <PromptText>
                <PromptTitle>Connect with EMGS</PromptTitle>
                <PromptDesc>Find study buddies through your student profile</PromptDesc>
              </PromptText>
              <FilterConnectButton onClick={() => navigate('/bersebuddy')}>Connect</FilterConnectButton>
            </IntegrationPrompt>
          </BuddyContainer>
        );


      default:
        return null;
    }
  };

  // const loadUpcomingEvents = async () => {
  //   try {
  //     const events = await eventService.getUpcomingEvents();
  //     setUpcomingEvents(events.slice(0, 3)); // Show only 3 events
  //   } catch (error) {
  //     console.error('Failed to load events:', error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // Universal redemption system now handles all redemption logic

  const handleNavigation = (tab: string) => {
    setActiveTab(tab);
    switch (tab) {
      case 'connect':
        navigate('/connect');
        break;
      case 'match':
        navigate('/match');
        break;
      case 'Forum':
        navigate('/Forum');
        break;
      default:
        // Stay on dashboard
        break;
    }
  };

  return (
    <Container>
      <style>
        {`
          .rewards-scroll-container::-webkit-scrollbar {
            display: none;
          }
          .rewards-scroll-container {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}
      </style>
      <StatusBar />
      {/* Standardized Header */}
<div style={{
  background: '#F5F5DC',
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
        {user?.fullName ? user.fullName.split(' ').map(n => n[0]).join('') : 'ZM'}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <div style={{ fontSize: '12px', color: '#999999', fontWeight: 'normal' }}>Your Activity Overview</div>
        <div style={{ fontSize: '18px', color: '#333333', fontWeight: '600' }}>Dashboard</div>
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
</div>
      
      <Content>

        {/* BersePass Card - Exact Specification */}
        <div style={{
          maxWidth: '400px',
          margin: '0 auto',
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          padding: '20px',
          border: '3px solid #00C851',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: '20px',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}>
          {/* Header Section */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '16px' 
          }}>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: '600', 
              color: '#333', 
              margin: 0 
            }}>BersePass</h3>
            <div style={{
              background: '#00C851',
              color: 'white',
              padding: '4px 12px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <div style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: 'white'
              }}></div>
              Active
            </div>
          </div>
          
          {/* Balance Section */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start', 
            marginBottom: '20px' 
          }}>
            {/* Left Column */}
            <div>
              <div style={{ 
                fontSize: '28px', 
                fontWeight: 'bold', 
                color: '#333', 
                lineHeight: '1' 
              }}>
                RM {isLoadingBalance ? '...' : setelBalance.toFixed(2)}
              </div>
              <div style={{ 
                fontSize: '11px', 
                color: '#666', 
                marginTop: '4px' 
              }}>Current Balance</div>
            </div>
            
            {/* Right Column */}
            <div style={{ textAlign: 'right', lineHeight: '1.3' }}>
              <div style={{ fontSize: '12px', color: '#666' }}>RM 19.99/month</div>
              <div style={{ fontSize: '12px', color: '#666' }}>Next: Dec 15</div>
            </div>
          </div>
          
          {/* Buttons Section */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            gap: '8px' 
          }}>
            <button style={{
              background: '#f8f9fa',
              color: '#333',
              border: '1px solid #e9ecef',
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              textAlign: 'center',
              flex: '1',
              textDecoration: 'none',
              cursor: 'pointer',
              transition: 'background 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#e9ecef'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#f8f9fa'}
            onClick={() => {
              if (isSetelConnected) {
                alert('Opening Setel app for top-up...');
              } else {
                setShowSetelOnboarding(true);
              }
            }}>
              Top-up in Setel
            </button>
            
            <button style={{
              background: '#f8f9fa',
              color: '#333',
              border: '1px solid #e9ecef',
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              textAlign: 'center',
              flex: '1',
              textDecoration: 'none',
              cursor: 'pointer',
              transition: 'background 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#e9ecef'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#f8f9fa'}
            onClick={() => setIsDualQRModalOpen(true)}>
              QR Code
            </button>
            
            <button style={{
              background: '#f8f9fa',
              color: '#333',
              border: '1px solid #e9ecef',
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              textAlign: 'center',
              flex: '1',
              textDecoration: 'none',
              cursor: 'pointer',
              transition: 'background 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#e9ecef'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#f8f9fa'}
            onClick={() => setIsManagePassModalOpen(true)}>
              Manage Pass
            </button>
          </div>
        </div>

        {/* BersePoints & Rewards Card - Exact Specification */}
        <div style={{
          maxWidth: '400px',
          margin: '0 auto',
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          padding: '20px',
          border: '3px solid #FFA500',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: '16px',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}>
          {/* Header Section */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '20px' 
          }}>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: '600', 
              color: '#333', 
              margin: 0 
            }}>BersePoints & Rewards</h3>
            <div style={{
              background: '#8E44AD',
              color: 'white',
              padding: '4px 12px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '500'
            }}>
              Level 3
            </div>
          </div>
          
          {/* Stats Section */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start', 
            marginBottom: '16px' 
          }}>
            {/* Left Column */}
            <div style={{ flex: '1' }}>
              <div style={{ 
                fontSize: '28px', 
                fontWeight: 'bold', 
                color: '#FFA500', 
                lineHeight: '1' 
              }}>
                {currentPoints}
              </div>
              <div style={{ 
                fontSize: '11px', 
                color: '#666', 
                marginTop: '2px' 
              }}>points available</div>
            </div>
            
            {/* Right Section */}
            <div style={{ 
              flex: '1', 
              display: 'flex', 
              flexDirection: 'row', 
              gap: '12px', 
              justifyContent: 'flex-end' 
            }}>
              {/* Redeemed Stat */}
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center' 
              }}>
                <div style={{ 
                  fontSize: '16px', 
                  color: '#000', 
                  fontWeight: '600' 
                }}>RM 347</div>
                <div style={{ 
                  fontSize: '11px', 
                  color: '#666' 
                }}>Redeemed</div>
              </div>
              
              {/* Weekly Stat */}
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center' 
              }}>
                <div style={{ 
                  fontSize: '16px', 
                  color: '#000', 
                  fontWeight: '600' 
                }}>+15</div>
                <div style={{ 
                  fontSize: '11px', 
                  color: '#666' 
                }}>This week</div>
              </div>
            </div>
          </div>
          
          {/* Progress Section */}
          <div>
            {/* Progress Bar */}
            <div style={{
              width: '100%',
              height: '8px',
              background: '#E0E0E0',
              borderRadius: '4px',
              overflow: 'hidden',
              marginBottom: '8px'
            }}>
              <div style={{
                width: '82%',
                height: '100%',
                background: '#FFA500',
                borderRadius: '4px'
              }}></div>
            </div>
            
            {/* Bottom Row */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center' 
            }}>
              <div style={{ 
                fontSize: '12px', 
                color: '#666' 
              }}>
                {currentPoints}/300 to Level 4
              </div>
              <button 
                onClick={() => navigate('/points')}
                style={{
                  background: '#FFA500',
                  color: 'white',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#FF8C00'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#FFA500'}
              >
                See All Rewards
              </button>
            </div>
          </div>
        </div>

        {/* Features Section - Filter Based System */}
        <FeaturesSection>
          <FeaturesGrid>
            <FeatureButton onClick={() => handleFilterClick('featured-rewards')}>
              <FeatureIconContainer $bgColor="#FFE8CC" $active={activeFilter === 'featured-rewards'}>
                <FeatureIcon>🎁</FeatureIcon>
              </FeatureIconContainer>
              <FeatureTitle>Featured Rewards</FeatureTitle>
            </FeatureButton>

            <FeatureButton onClick={() => handleFilterClick('points-leaderboard')}>
              <FeatureIconContainer $bgColor="#E8D5E8" $active={activeFilter === 'points-leaderboard'}>
                <FeatureIcon>🏆</FeatureIcon>
              </FeatureIconContainer>
              <FeatureTitle>Points Leaderboard</FeatureTitle>
            </FeatureButton>

            <FeatureButton onClick={() => handleFilterClick('recent-activities')}>
              <FeatureIconContainer $bgColor="#E8F4E8" $active={activeFilter === 'recent-activities'}>
                <FeatureIcon>📈</FeatureIcon>
              </FeatureIconContainer>
              <FeatureTitle>Recent Activities</FeatureTitle>
            </FeatureButton>

            <FeatureButton onClick={() => handleFilterClick('bersementor')}>
              <FeatureIconContainer $bgColor="#F0E8FF" $active={activeFilter === 'bersementor'}>
                <FeatureIcon>👨‍🏫</FeatureIcon>
              </FeatureIconContainer>
              <FeatureTitle>BerseMentor</FeatureTitle>
              <IntegrationBadge>TalentCorp</IntegrationBadge>
            </FeatureButton>

            <FeatureButton onClick={() => handleFilterClick('bersebuddy')}>
              <FeatureIconContainer $bgColor="#E8F8E8" $active={activeFilter === 'bersebuddy'}>
                <FeatureIcon>🤝</FeatureIcon>
              </FeatureIconContainer>
              <FeatureTitle>BerseBuddy</FeatureTitle>
              <IntegrationBadge>EMGS</IntegrationBadge>
            </FeatureButton>
          </FeaturesGrid>
        </FeaturesSection>

        {/* Filter Content Section - Shows below buttons when active */}
        {activeFilter && (
          <FilteredContent>
            {renderFilterContent(activeFilter)}
          </FilteredContent>
        )}
      </Content>

      <BottomNav activeTab="home" />
      
      <SideMenu
        isOpen={isSideMenuOpen}
        onClose={() => setIsSideMenuOpen(false)}
      />
      
      <NotificationPanel
        isOpen={isNotificationPanelOpen}
        onClose={() => setIsNotificationPanelOpen(false)}
        notificationCount={3}
      />

      {/* Dual QR Modal */}
      <DualQRModal 
        isOpen={isDualQRModalOpen}
        onClose={() => setIsDualQRModalOpen(false)}
      />

      {/* Manage Pass Modal */}
      <ManagePassModal 
        isOpen={isManagePassModalOpen}
        onClose={() => setIsManagePassModalOpen(false)}
      />

      {/* Setel Onboarding Modal */}
      {showSetelOnboarding && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '20px'
          }}
          onClick={() => {
            setShowSetelOnboarding(false);
            localStorage.setItem('hasSeenSetelIntro', 'true');
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '24px',
              maxWidth: '360px',
              width: '100%',
              position: 'relative',
              textAlign: 'center'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => {
                setShowSetelOnboarding(false);
                localStorage.setItem('hasSeenSetelIntro', 'true');
              }}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#666',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              ×
            </button>

            {/* Setel Logo Area */}
            <div style={{
              width: '80px',
              height: '80px',
              backgroundColor: '#2D5F4F',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              fontSize: '32px'
            }}>
              🚗
            </div>

            {/* Modal title */}
            <h3 style={{
              margin: '0 0 8px 0',
              color: '#333',
              fontSize: '20px',
              fontWeight: 'bold'
            }}>
              Connect Your Setel Wallet
            </h3>

            {/* Subtitle */}
            <p style={{
              color: '#666',
              fontSize: '14px',
              margin: '0 0 20px 0',
              lineHeight: '1.4'
            }}>
              Link your Setel account to unlock seamless payments and enjoy exclusive BersePass benefits
            </p>

            {/* Benefits List */}
            <div style={{
              backgroundColor: '#f8f9fa',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '20px',
              textAlign: 'left'
            }}>
              <div style={{ 
                fontSize: '14px', 
                fontWeight: '600', 
                color: '#2D5F4F', 
                marginBottom: '12px',
                textAlign: 'center'
              }}>
                ✨ What you'll get:
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                  <span style={{ color: '#10B981' }}>💰</span>
                  <span>Real-time wallet balance in BersePass</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                  <span style={{ color: '#10B981' }}>⚡</span>
                  <span>One-tap top-up directly from Setel app</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                  <span style={{ color: '#10B981' }}>🎫</span>
                  <span>Instant payments for events and activities</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                  <span style={{ color: '#10B981' }}>🔒</span>
                  <span>Secure & encrypted connection</span>
                </div>
              </div>
            </div>

            {/* Security Note */}
            <div style={{
              backgroundColor: '#fff3e0',
              border: '1px solid #FF9800',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span>🔐</span>
                <strong style={{ fontSize: '13px', color: '#E65100' }}>Privacy & Security</strong>
              </div>
              <p style={{ 
                margin: '0', 
                fontSize: '12px', 
                color: '#666',
                lineHeight: '1.3'
              }}>
                We only access your balance for display. Your Setel account remains fully secure and private.
              </p>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => {
                  setShowSetelOnboarding(false);
                  localStorage.setItem('hasSeenSetelIntro', 'true');
                }}
                style={{
                  flex: 1,
                  backgroundColor: '#f0f0f0',
                  color: '#666',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e0e0e0'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
              >
                Maybe Later
              </button>
              <button
                onClick={() => {
                  // Mock successful connection
                  setIsSetelConnected(true);
                  setShowSetelOnboarding(false);
                  localStorage.setItem('hasSeenSetelIntro', 'true');
                  alert('Successfully connected to Setel! 🎉');
                  // In production: Redirect to Setel OAuth or deep link
                  // window.location.href = 'setel://oauth/authorize?client_id=bersepass';
                }}
                style={{
                  flex: 1,
                  backgroundColor: '#2D5F4F',
                  color: 'white',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1a4a3a'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2D5F4F'}
              >
                Connect Setel
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Redemption Confirmation Modal */}
      <RedemptionConfirmModal
        isOpen={showConfirmModal && selectedReward !== null}
        onClose={closeConfirmModal}
        reward={selectedReward || {
          id: '',
          icon: '',
          brand: '',
          title: '',
          points: 0
        }}
        currentPoints={currentPoints}
        onConfirm={handleConfirmRedeem}
      />
      
      {/* Voucher Display Modal */}
      <VoucherDisplayModal
        isOpen={showVoucherModal && generatedVoucher !== null}
        onClose={closeVoucherModal}
        voucher={generatedVoucher || {
          code: '',
          brand: '',
          title: '',
          icon: '',
          value: '',
          expiryDate: new Date()
        }}
        onNavigateToVouchers={navigateToVouchers}
      />
      
      {/* Toast Notification */}
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={closeToast}
      />
    </Container>
  );
};

// Feature Buttons Styled Components
const FeaturesSection = styled.div`
  margin: 16px 0;
  padding: 0 16px;
`;

const FeaturesGrid = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding: 0 4px;
  
  @media (max-width: 350px) {
    gap: 4px;
    padding: 0 2px;
  }
`;

const FeatureButton = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 6px 3px;
  transition: all 0.2s ease;
  position: relative;
  flex: 1;
  max-width: 70px;
  
  &:hover {
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const FeatureIconContainer = styled.div<{ $bgColor: string; $active?: boolean }>`
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background: ${({ $bgColor, $active }) => $active ? '#2D5F4F' : $bgColor};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
  box-shadow: ${({ $active }) => 
    $active ? '0 2px 8px rgba(45, 95, 79, 0.3)' : '0 1px 4px rgba(0, 0, 0, 0.1)'
  };
  transition: all 0.2s ease;
  border: ${({ $active }) => $active ? '2px solid #2D5F4F' : 'none'};
  
  @media (max-width: 350px) {
    width: 40px;
    height: 40px;
  }
  
  ${FeatureButton}:hover & {
    transform: scale(1.05);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }
`;

const FeatureIcon = styled.div`
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  @media (max-width: 350px) {
    font-size: 16px;
  }
`;

const FeatureTitle = styled.span`
  font-size: 9px;
  font-weight: 500;
  color: #333;
  text-align: center;
  line-height: 1.1;
  max-width: 60px;
  word-wrap: break-word;
  hyphens: auto;
  
  @media (max-width: 350px) {
    font-size: 8px;
    max-width: 50px;
  }
`;

const IntegrationBadge = styled.div`
  position: absolute;
  top: -1px;
  right: 2px;
  background: rgba(255, 255, 255, 0.95);
  color: #333;
  padding: 1px 3px;
  border-radius: 4px;
  font-size: 6px;
  font-weight: 600;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(0, 0, 0, 0.1);
  
  @media (max-width: 350px) {
    font-size: 5px;
    padding: 1px 2px;
  }
`;

// Filter Content Styled Components
const FilteredContent = styled.div`
  margin: 0 20px 20px 20px;
  animation: fadeIn 0.3s ease-in-out;
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

// Featured Rewards Components
const RewardsContainer = styled.div``;

const RewardsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
`;

const RewardCard = styled.div<{ $bgColor: string }>`
  background: ${({ $bgColor }) => $bgColor};
  border-radius: 16px;
  padding: 16px;
  color: white;
  text-align: center;
  position: relative;
`;

const FilterRewardIcon = styled.div`
  font-size: 24px;
  margin-bottom: 8px;
`;

const RewardContent = styled.div`
  margin-bottom: 12px;
`;

const RewardTitle = styled.h4`
  font-size: 14px;
  font-weight: bold;
  margin: 0 0 4px 0;
`;

const RewardDiscount = styled.p`
  font-size: 11px;
  margin: 0 0 8px 0;
  opacity: 0.9;
`;

const FilterRewardPoints = styled.div`
  font-size: 12px;
  font-weight: bold;
`;

const FilterRedeemButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

// Leaderboard Components
const LeaderboardContainer = styled.div``;

const LeaderboardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
`;

const HeaderIcon = styled.div`
  font-size: 20px;
`;

const HeaderTitle = styled.h3`
  font-size: 18px;
  font-weight: bold;
  color: #2D5F4F;
  margin: 0;
`;

const FilterLeaderboardList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
`;

const LeaderboardItem = styled.div<{ $rank: number; $isUser?: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: ${({ $isUser }) => $isUser ? '#E8F5E8' : 'white'};
  border-radius: 12px;
  border: ${({ $isUser }) => $isUser ? '2px solid #2D5F4F' : '1px solid #f0f0f0'};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const RankNumber = styled.div`
  font-size: 16px;
  font-weight: bold;
  color: #333;
  min-width: 20px;
`;

const PlayerName = styled.div`
  flex: 1;
  font-size: 14px;
  font-weight: 600;
  color: #333;
`;

const PlayerPoints = styled.div`
  font-size: 16px;
  font-weight: bold;
  color: #2D5F4F;
`;

const PointsChange = styled.div<{ $positive: boolean }>`
  font-size: 12px;
  color: ${({ $positive }) => $positive ? '#27AE60' : '#E74C3C'};
  font-weight: 600;
`;

const ViewFullButton = styled.button`
  background: #2D5F4F;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  &:hover {
    background: #1F4A3A;
  }
`;

const ViewFullIcon = styled.div`
  font-size: 16px;
`;

// Activities Components
const ActivitiesContainer = styled.div``;

const ActivitiesHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
`;

const ActivitiesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const FilterActivityItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border: 1px solid #f0f0f0;
`;

const ActivityIconContainer = styled.div<{ $bgColor: string }>`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: ${({ $bgColor }) => $bgColor};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const FilterActivityIcon = styled.div`
  font-size: 16px;
  color: white;
`;

const ActivityContent = styled.div`
  flex: 1;
`;

const ActivityTitle = styled.h5`
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin: 0;
`;

const ActivityPoints = styled.div`
  font-size: 12px;
  font-weight: bold;
  color: #2D5F4F;
`;

const ActivityMeta = styled.div`
  font-size: 12px;
  color: #666;
`;

// Integration Components
const MentorContainer = styled.div``;

const BuddyContainer = styled.div``;

const IntegrationPrompt = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f0f8ff;
  border-radius: 12px;
  margin-bottom: 16px;
`;

const PromptIcon = styled.div`
  font-size: 32px;
`;

const PromptText = styled.div`
  flex: 1;
`;

const PromptTitle = styled.h5`
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin: 0 0 4px 0;
`;

const PromptDesc = styled.p`
  font-size: 12px;
  color: #666;
  margin: 0;
  line-height: 1.4;
`;

const FilterConnectButton = styled.button`
  background: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  
  &:hover {
    background: #0056b3;
  }
`;

