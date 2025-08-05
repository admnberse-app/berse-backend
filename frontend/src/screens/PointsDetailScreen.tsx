import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { StatusBar } from '../components/StatusBar/StatusBar';
import { BottomNav } from '../components/BottomNav';
import { RedemptionConfirmModal } from '../components/RedemptionConfirmModal';
import { VoucherDisplayModal } from '../components/VoucherDisplayModal';
import { Toast } from '../components/Toast';
import { voucherService } from '../services/voucherService';
import { getUserPoints, updateUserPoints } from '../utils/initializePoints';
import { useUniversalRedemption } from '../hooks/useUniversalRedemption';

interface Reward {
  id: string;
  category: string;
  icon: string;
  brand: string;
  title: string;
  description: string;
  points: number;
  value?: string;
  expiry?: string;
  isNew?: boolean;
  isExpiringSoon?: boolean;
}

interface Transaction {
  id: string;
  date: string;
  activity: string;
  points: number;
  type: 'earned' | 'spent';
  balance: number;
}

// Styled Components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #F5F5DC;
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

const UserPointsInfo = styled.div`
  text-align: left;
`;

const UserPoints = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
`;

const Content = styled.div`
  flex: 1;
  background: #F5F5DC;
  padding: 0;
  overflow: hidden;
`;

const TabContainer = styled.div`
  display: flex;
  background: white;
  border-radius: 12px;
  padding: 4px;
  margin: 20px 20px 8px 20px;
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

const TabContent = styled.div`
  padding: 12px 20px 100px 20px;
`;

// Rewards Tab Components
const FiltersContainer = styled.div`
  margin-bottom: 12px;
`;

const SearchContainer = styled.div`
  position: relative;
  margin-bottom: 8px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 16px 12px 40px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  
  &:focus {
    outline: none;
    border-color: #2D5F4F;
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
  font-size: 16px;
`;

const CategoryFilters = styled.div`
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 4px 0;
  scrollbar-width: none;
  -ms-overflow-style: none;
  
  &::-webkit-scrollbar {
    display: none;
  }
`;

const CategoryFilter = styled.button<{ active: boolean }>`
  padding: 8px 16px;
  border: 1px solid ${({ active }) => active ? '#2D5F4F' : '#e0e0e0'};
  border-radius: 20px;
  background: ${({ active }) => active ? '#2D5F4F' : 'white'};
  color: ${({ active }) => active ? 'white' : '#666'};
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  
  &:hover {
    border-color: #2D5F4F;
    color: ${({ active }) => active ? 'white' : '#2D5F4F'};
  }
`;

const SortContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 8px 0;
`;

const RewardsCount = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #333;
`;

const SortSelect = styled.select`
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background: white;
  font-size: 12px;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #2D5F4F;
  }
`;

const RewardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
`;

const RewardCard = styled.div<{ cardColor: string }>`
  background: ${({ cardColor }) => cardColor};
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
  position: relative;
  cursor: pointer;
  color: white;
  
  &:hover {
    transform: translateY(-2px);
  }
`;

const RewardBadge = styled.div<{ type: 'new' | 'expiring' }>`
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
  color: white;
  background: ${({ type }) => type === 'new' ? '#10B981' : '#EF4444'};
`;

const RewardIcon = styled.div`
  font-size: 32px;
  margin-bottom: 8px;
  color: white;
`;

const RewardBrand = styled.div`
  font-weight: 600;
  color: white;
  margin-bottom: 4px;
  font-size: 13px;
`;

const RewardTitle = styled.div`
  font-size: 11px;
  color: white;
  margin-bottom: 8px;
  line-height: 1.3;
  opacity: 0.9;
`;

const RewardPoints = styled.div`
  color: white;
  font-weight: bold;
  margin-bottom: 12px;
  font-size: 14px;
`;

const RedeemButton = styled.button<{ canAfford?: boolean }>`
  width: 100%;
  padding: 8px;
  background: ${({ canAfford }) => canAfford ? '#4A9B8E' : '#ccc'};
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: ${({ canAfford }) => canAfford ? 'pointer' : 'not-allowed'};
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ canAfford }) => canAfford ? '#3a7d71' : '#ccc'};
  }
`;

// History Tab Components
const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
`;

const EmptyIcon = styled.div`
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
`;

const EmptyTitle = styled.h3`
  color: #333;
  margin-bottom: 8px;
  font-size: 18px;
`;

const EmptySubtitle = styled.p`
  color: #666;
  margin-bottom: 24px;
  line-height: 1.4;
  font-size: 14px;
`;

const EarningOpportunities = styled.div`
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-top: 12px;
`;

const EarningTitle = styled.h4`
  color: #2D5F4F;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
`;

const EarningList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const EarningItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s ease;
  
  &:hover {
    background: #e8f4f0;
  }
`;

const EarningIcon = styled.div`
  width: 40px;
  height: 40px;
  background: #2D5F4F;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
`;

const EarningInfo = styled.div`
  flex: 1;
`;

const EarningAction = styled.div`
  font-weight: 600;
  color: #333;
  margin-bottom: 2px;
  font-size: 14px;
`;

const EarningPoints = styled.div`
  font-size: 12px;
  color: #2D5F4F;
  font-weight: 600;
`;

const TransactionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const TransactionItem = styled.div`
  background: white;
  padding: 16px;
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const TransactionInfo = styled.div`
  flex: 1;
`;

const TransactionActivity = styled.div`
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
  font-size: 14px;
`;

const TransactionDate = styled.div`
  font-size: 12px;
  color: #666;
`;

const TransactionPoints = styled.div<{ type: 'earned' | 'spent' }>`
  text-align: right;
`;

const PointsChange = styled.div<{ type: 'earned' | 'spent' }>`
  font-weight: bold;
  color: ${({ type }) => type === 'earned' ? '#10B981' : '#EF4444'};
  margin-bottom: 2px;
  font-size: 16px;
`;

const RunningBalance = styled.div`
  font-size: 12px;
  color: #666;
`;

export const PointsDetailScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'rewards' | 'history'>('rewards');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('points_low');
  const weeklyPoints = 15;

  // Use universal redemption hook
  const {
    selectedReward,
    showConfirmModal,
    showVoucherModal,
    generatedVoucher,
    toast,
    currentPoints,
    handleRedeemClick,
    handleConfirmRedeem,
    closeConfirmModal,
    closeVoucherModal,
    navigateToVouchers,
    closeToast,
    canAfford,
    getButtonProps
  } = useUniversalRedemption();

  // Listen for points updates from other screens
  useEffect(() => {
    const handlePointsUpdate = (event: CustomEvent) => {
      setCurrentPoints(event.detail.points);
    };

    window.addEventListener('pointsUpdated', handlePointsUpdate as EventListener);
    
    return () => {
      window.removeEventListener('pointsUpdated', handlePointsUpdate as EventListener);
    };
  }, []);
  const currentLevel = 3;
  const nextLevelPoints = 300;
  const progressPercent = (currentPoints / nextLevelPoints) * 100;
  const pointsToNext = nextLevelPoints - currentPoints;
  const monthlySavings = 145;

  const categories = [
    'All', 'Food & Drinks', 'Transportation', 'Education', 
    'Travel', 'Shipping', 'Religious', 'ASEAN'
  ];

  const allRewards: Reward[] = [
    // Transportation Partners
    { id: '1', category: 'Transportation', icon: '🚌', brand: 'MARALINER', title: 'RM 10 bus voucher', description: 'Valid for intercity routes', points: 50, value: 'RM 10' },
    { id: '2', category: 'Transportation', icon: '🚇', brand: 'LRT/MRT', title: 'Day pass discount', description: '20% off day pass', points: 30, value: '20% OFF' },
    { id: '3', category: 'Transportation', icon: '🚗', brand: 'Grab', title: 'RM 8 ride credit', description: 'For rides within KL', points: 40, value: 'RM 8' },
    
    // Food & Beverage
    { id: '4', category: 'Food & Drinks', icon: '☕', brand: 'Mukha Cafe', title: 'RM 5 coffee voucher', description: 'Any specialty coffee', points: 25, value: 'RM 5' },
    { id: '5', category: 'Food & Drinks', icon: '🫖', brand: 'Malaysian Restaurants', title: 'Free teh tarik with meal', description: 'At participating outlets', points: 20, value: 'FREE' },
    { id: '6', category: 'Food & Drinks', icon: '🍽️', brand: 'Mesra Cafe', title: 'RM 7 meal voucher', description: 'Halal certified meals', points: 35, value: 'RM 7' },
    
    // Education
    { id: '7', category: 'Education', icon: '📚', brand: 'BRIGHT English Centre', title: '15% course discount', description: 'English proficiency courses', points: 100, value: '15% OFF' },
    { id: '8', category: 'Education', icon: '📖', brand: 'Imam Ghazali Publishing', title: 'RM 20 book voucher', description: 'Islamic books collection', points: 80, value: 'RM 20' },
    { id: '9', category: 'Education', icon: '🏪', brand: 'Nurinai Bookstore', title: 'RM 15 book credit', description: 'Academic & religious books', points: 60, value: 'RM 15' },
    
    // Travel & Tourism
    { id: '10', category: 'Travel', icon: '✈️', brand: 'AirAsia', title: 'RM 100 flight voucher', description: 'ASEAN destinations', points: 500, value: 'RM 100', isNew: true },
    { id: '11', category: 'Travel', icon: '🎓', brand: 'MAH Student Deals', title: 'Student flight discount', description: '25% off student flights', points: 300, value: '25% OFF' },
    { id: '12', category: 'Travel', icon: '🌱', brand: 'FELDA Edutourism', title: 'Plantation tour 20% off', description: 'Educational tours', points: 150, value: '20% OFF' },
    
    // Shipping & Delivery
    { id: '13', category: 'Shipping', icon: '🕌', brand: 'Poslaju Saudi Arabia', title: 'RM 20 off Umrah shipping', description: 'Religious items shipping', points: 100, value: 'RM 20 OFF' },
    { id: '14', category: 'Shipping', icon: '📦', brand: 'Poslaju ASEAN', title: 'RM 15 off regional shipping', description: 'Southeast Asia delivery', points: 75, value: 'RM 15 OFF' },
    { id: '15', category: 'Shipping', icon: '📚', brand: 'WeExpress Religious', title: 'Same-day religious book delivery', description: 'Kuala Lumpur area', points: 40, value: 'FREE' },
    { id: '16', category: 'Shipping', icon: '🚚', brand: 'WeExpress ASEAN', title: 'Next-day ASEAN delivery', description: 'Cross-border shipping', points: 300, value: 'FREE' },
    
    // Religious Services
    { id: '17', category: 'Religious', icon: '🕌', brand: 'Umrah Preparation Course', title: '20% off prep course', description: 'Complete preparation package', points: 120, value: '20% OFF' },
    { id: '18', category: 'Religious', icon: '🧳', brand: 'Hajj Luggage Service', title: 'Luggage check service', description: 'Professional packing', points: 80, value: 'FREE' },
    { id: '19', category: 'Religious', icon: '💧', brand: 'Zamzam Shipping', title: 'Safe Zamzam water shipping', description: 'Certified handling', points: 150, value: 'RM 30 OFF' },
    
    // ASEAN Services
    { id: '20', category: 'ASEAN', icon: '👨‍👩‍👧‍👦', brand: 'Family Care Package', title: 'Monthly family shipping', description: 'Bulk shipping discount', points: 160, value: '25% OFF' },
    { id: '21', category: 'ASEAN', icon: '🍪', brand: 'Malaysian Snacks ASEAN', title: 'Snack box shipping', description: 'Nostalgic treats delivery', points: 80, value: 'RM 10 OFF' },
    { id: '22', category: 'ASEAN', icon: '💼', brand: 'Business Shipping', title: 'SME bulk shipping package', description: 'Business solutions', points: 400, value: '30% OFF' },
    { id: '23', category: 'ASEAN', icon: '🥘', brand: 'Halal Restaurant Network', title: 'ASEAN halal discounts', description: '10% at partner restaurants', points: 30, value: '10% OFF', isExpiringSoon: true },
    
    // International Student Focus
    { id: '24', category: 'Education', icon: '🏠', brand: 'Accommodation', title: 'First month RM 50 off hostel', description: 'Student housing discount', points: 200, value: 'RM 50 OFF' },
    { id: '25', category: 'Education', icon: '📚', brand: 'Textbook Rental', title: 'Semester book discount', description: '30% off textbook rental', points: 120, value: '30% OFF' },
    { id: '26', category: 'Education', icon: '🏥', brand: 'Medical Check-up', title: 'Student health discount', description: 'Annual health screening', points: 90, value: '20% OFF' },
  ];

  const transactions: Transaction[] = [
    { id: '1', date: '2024-07-28', activity: 'Attended Cameron Highlands Trip', points: 15, type: 'earned', balance: 245 },
    { id: '2', date: '2024-07-25', activity: 'Profile completion bonus', points: 10, type: 'earned', balance: 230 },
    { id: '3', date: '2024-07-20', activity: 'Redeemed Mukha Cafe voucher', points: -25, type: 'spent', balance: 220 },
    { id: '4', date: '2024-07-18', activity: 'Connected with 3 new members', points: 9, type: 'earned', balance: 245 },
    { id: '5', date: '2024-07-15', activity: 'Attended weekly gathering', points: 8, type: 'earned', balance: 236 },
  ];

  // Filter and sort rewards
  const filteredRewards = allRewards
    .filter(reward => {
      const matchesCategory = selectedCategory === 'All' || reward.category === selectedCategory;
      const matchesSearch = reward.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          reward.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'points_low':
          return a.points - b.points;
        case 'points_high':
          return b.points - a.points;
        case 'expiring':
          return (b.isExpiringSoon ? 1 : 0) - (a.isExpiringSoon ? 1 : 0);
        case 'new':
          return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
        default:
          return 0;
      }
    });

  // Function to get card color based on brand
  const getCardColor = (brand: string): string => {
    switch (brand.toLowerCase()) {
      case 'malaysian restaurants':
        return '#E91E63'; // Pink/Red
      case 'mukha cafe':
        return '#8B4513'; // Brown
      case 'lrt/mrt':
        return '#4285F4'; // Blue
      case 'halal restaurant network':
        return '#FFC107'; // Yellow/Gold
      case 'grab':
        return '#00C851'; // Green
      case 'maraliner':
        return '#9C27B0'; // Purple
      case 'airasia':
        return '#FF5722'; // Deep Orange
      case 'bright english centre':
        return '#2196F3'; // Light Blue
      case 'mesra cafe':
        return '#FF9800'; // Orange
      default:
        return '#607D8B'; // Blue Grey for others
    }
  };

  // Points update listener (now handled by universal hook)
  useEffect(() => {
    const handlePointsUpdate = () => {
      // The hook will handle this, but we can add additional logic if needed
    };

    window.addEventListener('pointsUpdated', handlePointsUpdate);
    return () => window.removeEventListener('pointsUpdated', handlePointsUpdate);
  }, []);

  return (
    <Container>
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
              ZM
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <div style={{ fontSize: '12px', color: '#999999', fontWeight: 'normal' }}>Redeem & Save More</div>
              <div style={{ fontSize: '18px', color: '#333333', fontWeight: '600' }}>BersePoints Rewards</div>
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
        
        {/* Points Info Section */}
        <div style={{
          marginTop: '12px',
          padding: '8px 0'
        }}>
          <div style={{ fontSize: '14px', color: '#333', fontWeight: '600' }}>
            Your Points: {currentPoints} | Available to spend
          </div>
        </div>
      </div>
      
      <Content>
        <TabContainer>
          <Tab
            active={activeTab === 'rewards'}
            onClick={() => setActiveTab('rewards')}
          >
            All Rewards
          </Tab>
          <Tab
            active={activeTab === 'history'}
            onClick={() => setActiveTab('history')}
          >
            History
          </Tab>
        </TabContainer>
        
        <TabContent>
          {activeTab === 'rewards' ? (
            <>
              <FiltersContainer>
                <SearchContainer>
                  <SearchIcon>🔍</SearchIcon>
                  <SearchInput
                    placeholder="Search rewards..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </SearchContainer>
                
                <CategoryFilters>
                  {categories.map(category => (
                    <CategoryFilter
                      key={category}
                      active={selectedCategory === category}
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category}
                    </CategoryFilter>
                  ))}
                </CategoryFilters>
                
                <SortContainer>
                  <RewardsCount>
                    {filteredRewards.length} rewards available
                  </RewardsCount>
                  <SortSelect value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    <option value="points_low">Points: Low to High</option>
                    <option value="points_high">Points: High to Low</option>
                    <option value="expiring">Expiring Soon</option>
                    <option value="new">New Arrivals</option>
                  </SortSelect>
                </SortContainer>
              </FiltersContainer>
              
              <RewardsGrid>
                {filteredRewards.map(reward => (
                  <RewardCard key={reward.id} cardColor={getCardColor(reward.brand)}>
                    {reward.isNew && <RewardBadge type="new">NEW</RewardBadge>}
                    {reward.isExpiringSoon && <RewardBadge type="expiring">EXPIRING</RewardBadge>}
                    
                    <RewardIcon>{reward.icon}</RewardIcon>
                    <RewardBrand>{reward.brand}</RewardBrand>
                    <RewardTitle>{reward.title}</RewardTitle>
                    <RewardPoints>{reward.points} pts</RewardPoints>
                    
                    <RedeemButton
                      canAfford={canAfford(reward.points)}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleRedeemClick(reward);
                      }}
                    >
                      {canAfford(reward.points) ? 'Redeem' : 'Not enough pts'}
                    </RedeemButton>
                  </RewardCard>
                ))}
              </RewardsGrid>
            </>
          ) : (
            <>
              {transactions.length === 0 ? (
                <EmptyState>
                  <EmptyIcon>📊</EmptyIcon>
                  <EmptyTitle>Start Your Points Journey!</EmptyTitle>
                  <EmptySubtitle>
                    You haven't earned any points yet. Join activities and events to start collecting rewards!
                  </EmptySubtitle>
                  
                  <EarningOpportunities>
                    <EarningTitle>
                      ⚡ Start earning points by:
                    </EarningTitle>
                    <EarningList>
                      <EarningItem onClick={() => navigate('/connect')}>
                        <EarningIcon>🎪</EarningIcon>
                        <EarningInfo>
                          <EarningAction>Attend events</EarningAction>
                          <EarningPoints>+5-20 points per event</EarningPoints>
                        </EarningInfo>
                      </EarningItem>
                      
                      <EarningItem onClick={() => navigate('/profile')}>
                        <EarningIcon>👤</EarningIcon>
                        <EarningInfo>
                          <EarningAction>Complete profile</EarningAction>
                          <EarningPoints>+10 points one-time</EarningPoints>
                        </EarningInfo>
                      </EarningItem>
                      
                      <EarningItem onClick={() => navigate('/match')}>
                        <EarningIcon>🤝</EarningIcon>
                        <EarningInfo>
                          <EarningAction>Make connections</EarningAction>
                          <EarningPoints>+3 points per connection</EarningPoints>
                        </EarningInfo>
                      </EarningItem>
                      
                      <EarningItem>
                        <EarningIcon>👥</EarningIcon>
                        <EarningInfo>
                          <EarningAction>Refer friends</EarningAction>
                          <EarningPoints>+25 points per referral</EarningPoints>
                        </EarningInfo>
                      </EarningItem>
                    </EarningList>
                  </EarningOpportunities>
                </EmptyState>
              ) : (
                <TransactionList>
                  {transactions.map(transaction => (
                    <TransactionItem key={transaction.id}>
                      <TransactionInfo>
                        <TransactionActivity>{transaction.activity}</TransactionActivity>
                        <TransactionDate>{new Date(transaction.date).toLocaleDateString()}</TransactionDate>
                      </TransactionInfo>
                      <TransactionPoints type={transaction.type}>
                        <PointsChange type={transaction.type}>
                          {transaction.type === 'earned' ? '+' : ''}{transaction.points} pts
                        </PointsChange>
                        <RunningBalance>Balance: {transaction.balance}</RunningBalance>
                      </TransactionPoints>
                    </TransactionItem>
                  ))}
                </TransactionList>
              )}
            </>
          )}
        </TabContent>
      </Content>
      
      <BottomNav activeTab="home" />
      
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