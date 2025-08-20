import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { StatusBar } from '../components/StatusBar/StatusBar';
import { CompactHeader } from '../components/CompactHeader/CompactHeader';
import { MainNav } from '../components/MainNav/index';
import { ProfileSidebar } from '../components/ProfileSidebar/ProfileSidebar';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: linear-gradient(135deg, #F9F3E3 0%, #E8DCC4 100%);
  max-width: 393px;
  margin: 0 auto;
`;

// Coming Soon Components (for production)
const Content = styled.div`
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding-bottom: 100px;
`;

const ComingSoonCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 40px 30px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  max-width: 350px;
  width: 100%;
`;

const IconContainer = styled.div`
  font-size: 72px;
  margin-bottom: 24px;
  animation: bounce 2s infinite;
  
  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
`;

const ComingSoonBadge = styled.div`
  display: inline-block;
  background: linear-gradient(135deg, #FF6B6B, #FF8787);
  color: white;
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 20px;
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: #333;
  margin-bottom: 16px;
`;

const Description = styled.p`
  font-size: 16px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 32px;
`;

const FeatureList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 32px;
`;

const FeatureItem = styled.div`
  display: flex;
  align-items: flex-start;
  text-align: left;
  gap: 16px;
`;

const FeatureIcon = styled.div`
  font-size: 24px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(46, 206, 152, 0.1);
  border-radius: 12px;
  flex-shrink: 0;
`;

const FeatureText = styled.div`
  flex: 1;
`;

const FeatureTitle = styled.div`
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
  font-size: 14px;
`;

const FeatureDesc = styled.div`
  font-size: 12px;
  color: #666;
  line-height: 1.4;
`;

const NotifyButton = styled.button`
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #2ece98, #4fc3a1);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 20px rgba(46, 206, 152, 0.3);
  }
`;

// Original Marketplace Components (for localhost)
const MarketContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #F9F3E3;
  max-width: 393px;
  margin: 0 auto;
`;

const Header = styled.div`
  background: white;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`;

const HeaderTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #2ece98;
  font-weight: 600;
`;

const HeaderTitle = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
`;

const MarketTitle = styled.h2`
  margin: 0;
  font-size: 18px;
  color: #2ece98;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const Subtitle = styled.p`
  margin: 2px 0 0 0;
  font-size: 12px;
  color: #666;
`;

const NotificationIcon = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 4px;
  position: relative;
`;

const NotificationBadge = styled.span`
  position: absolute;
  top: 0;
  right: 0;
  background: #FF4444;
  color: white;
  font-size: 10px;
  padding: 2px 5px;
  border-radius: 10px;
  font-weight: 600;
`;

// Travel Goal Card
const TravelGoalCard = styled.div`
  background: linear-gradient(135deg, #2ece98, #4fc3a1);
  border-radius: 16px;
  padding: 16px;
  margin: 16px;
  color: white;
  box-shadow: 0 4px 12px rgba(46, 206, 152, 0.25);
`;

const GoalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

const GoalInfo = styled.div`
  flex: 1;
`;

const GoalLabel = styled.div`
  font-size: 12px;
  opacity: 0.9;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const GoalTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 2px;
`;

const GoalProgress = styled.div`
  margin-bottom: 12px;
`;

const ProgressBar = styled.div`
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 6px;
`;

const ProgressFill = styled.div<{ $percentage: number }>`
  height: 100%;
  background: linear-gradient(90deg, #2ece98, #4fc3a1);
  width: ${props => props.$percentage}%;
  transition: width 0.3s ease;
  border-radius: 4px;
`;

const ProgressText = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 13px;
`;

const GoalActions = styled.div`
  display: flex;
  gap: 8px;
`;

const GoalButton = styled.button`
  flex: 1;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

// Tab Navigation
const TabContainer = styled.div`
  display: flex;
  background: white;
  border-bottom: 1px solid #e0e0e0;
`;

const Tab = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 14px;
  background: ${props => props.$active ? '#2ece98' : 'white'};
  color: ${props => props.$active ? 'white' : '#666'};
  border: none;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;

  &:hover {
    background: ${props => props.$active ? '#28b885' : '#f5f5f5'};
  }

  ${props => props.$active && `
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: #4fc3a1;
    }
  `}
`;

const TabLabel = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
`;

const TabText = styled.span`
  font-size: 13px;
`;

const TabSubtext = styled.span`
  font-size: 10px;
  opacity: 0.8;
  font-weight: 400;
`;

// Content Area
const MarketContent = styled.div`
  flex: 1;
  padding-bottom: 100px;
  overflow-y: auto;
`;

// Quick Sell Section
const QuickSellCard = styled.div`
  background: linear-gradient(135deg, #FFF3E0, #FFE0B2);
  border-radius: 12px;
  padding: 16px;
  margin: 16px;
  border: 1px solid #FFB74D;
`;

const QuickSellHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
`;

const QuickSellTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  color: #E65100;
  font-weight: 600;
`;

const QuickSellText = styled.p`
  margin: 0 0 12px 0;
  font-size: 13px;
  color: #795548;
`;

const QuickSellButton = styled.button`
  width: 100%;
  background: #FF6F00;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s ease;

  &:hover {
    background: #E65100;
    transform: translateY(-1px);
  }
`;

// Listings Section
const ListingsSection = styled.div`
  padding: 0 16px;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const SectionTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  color: #333;
  font-weight: 600;
`;

const ViewAllButton = styled.button`
  background: none;
  border: none;
  color: #2ece98;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
`;

const ListingCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 14px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #e0e0e0;
`;

const ListingHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
`;

const ListingInfo = styled.div`
  flex: 1;
`;

const ListingTitle = styled.h4`
  margin: 0 0 4px 0;
  font-size: 15px;
  color: #333;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const ListingPrice = styled.div`
  font-size: 18px;
  color: #2ece98;
  font-weight: 700;
`;

const ListingStats = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #f0f0f0;
`;

const Stat = styled.div`
  font-size: 12px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const ListingRating = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 12px;
  color: #FFA000;
`;

// Potential Earnings Card
const EarningsCard = styled.div`
  background: linear-gradient(135deg, #e6f9f3, #d4f5ec);
  border-radius: 12px;
  padding: 16px;
  margin: 16px;
  border: 1px solid #2ece98;
`;

const EarningsTitle = styled.h4`
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #2ece98;
  font-weight: 600;
`;

const EarningsRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  font-size: 13px;
  color: #28b885;

  &:not(:last-child) {
    border-bottom: 1px solid rgba(46, 206, 152, 0.2);
  }
`;

const EarningsTotal = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 2px solid #2ece98;
  font-size: 16px;
  font-weight: 700;
  color: #28b885;
`;

// Smart Suggestions
const SuggestionsCard = styled.div`
  background: linear-gradient(135deg, #E3F2FD, #BBDEFB);
  border-radius: 12px;
  padding: 16px;
  margin: 16px;
  border: 1px solid #64B5F6;
`;

const SuggestionsTitle = styled.h4`
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #1565C0;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const SuggestionItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 13px;
  color: #0D47A1;

  &:not(:last-child) {
    border-bottom: 1px solid rgba(33, 150, 243, 0.2);
  }
`;

const SuggestionText = styled.span`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const SuggestionValue = styled.span`
  font-weight: 600;
  color: #1976D2;
`;

// Buy Tab Components
const SearchBar = styled.div`
  background: white;
  border-radius: 12px;
  padding: 12px 16px;
  margin: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #e0e0e0;
`;

const SearchInput = styled.input`
  flex: 1;
  border: none;
  outline: none;
  font-size: 14px;
  color: #333;

  &::placeholder {
    color: #999;
  }
`;

const SearchButton = styled.button`
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  color: #666;
`;

const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
  padding: 0 16px;
  margin-bottom: 20px;
`;

const CategoryButton = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 8px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #f5f5f5;
    transform: translateY(-2px);
  }
`;

const CategoryIcon = styled.div`
  font-size: 24px;
`;

const CategoryName = styled.span`
  font-size: 10px;
  color: #666;
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  padding: 0 16px;
`;

const ProductCard = styled.div`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #e0e0e0;
`;

const ProductImage = styled.div`
  width: 100%;
  height: 120px;
  background: linear-gradient(135deg, #f5f5f5, #e0e0e0);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
`;

const ProductInfo = styled.div`
  padding: 12px;
`;

const ProductName = styled.h4`
  margin: 0 0 4px 0;
  font-size: 14px;
  color: #333;
  font-weight: 600;
`;

const ProductMeta = styled.div`
  font-size: 11px;
  color: #666;
  margin-bottom: 8px;
`;

const ProductFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ProductPrice = styled.div`
  font-size: 16px;
  color: #2ece98;
  font-weight: 700;
`;

const ProductActions = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button<{ color?: string }>`
  background: ${props => props.color || '#2ece98'};
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }
`;

// Services Tab Components
const ServiceCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin: 0 16px 12px 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #e0e0e0;
`;

const ServiceHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

const ServiceInfo = styled.div`
  flex: 1;
`;

const ServiceTitle = styled.h4`
  margin: 0 0 4px 0;
  font-size: 16px;
  color: #333;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const ServicePrice = styled.div`
  font-size: 18px;
  color: #2ece98;
  font-weight: 700;
`;

const ServiceRating = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 8px;
`;

const ServiceStats = styled.div`
  display: flex;
  gap: 16px;
  padding: 12px 0;
  border-top: 1px solid #f0f0f0;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 12px;
`;

const ServiceStat = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const StatValue = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #333;
`;

const StatLabel = styled.div`
  font-size: 11px;
  color: #666;
`;

const ServiceActions = styled.div`
  display: flex;
  gap: 8px;
`;

const ServiceButton = styled.button<{ primary?: boolean }>`
  flex: 1;
  background: ${props => props.primary ? '#2ece98' : 'white'};
  color: ${props => props.primary ? 'white' : '#2ece98'};
  border: ${props => props.primary ? 'none' : '1px solid #2ece98'};
  padding: 10px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.primary ? '#28b885' : '#f5f5f5'};
  }
`;

// Wallet Component
const WalletCard = styled.div`
  background: linear-gradient(135deg, #1A237E, #3949AB);
  border-radius: 12px;
  padding: 16px;
  margin: 16px;
  color: white;
  box-shadow: 0 4px 12px rgba(26, 35, 126, 0.25);
`;

const WalletBalance = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const BalanceLabel = styled.div`
  font-size: 12px;
  opacity: 0.9;
`;

const BalanceAmount = styled.div`
  font-size: 24px;
  font-weight: 700;
`;

const WalletActions = styled.div`
  display: flex;
  gap: 8px;
`;

const WalletButton = styled.button`
  flex: 1;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

export const BerseMarketScreen: React.FC = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'sell' | 'buy' | 'services'>('sell');
  const [searchQuery, setSearchQuery] = useState('');

  // Check if we're on localhost
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

  // Mock data for travel goal
  const travelGoal = {
    title: 'BALI ADVENTURE',
    date: 'Dec 15-22',
    totalBudget: 2000,
    currentFunding: 950,
    percentage: 47.5,
    daysLeft: 35
  };

  // Mock listings data
  const listings = [
    {
      id: '1',
      title: 'Engineering Textbooks',
      icon: '📚',
      price: 150,
      views: 12,
      chats: 3,
      rating: 5,
      reviews: 'Great condition'
    },
    {
      id: '2',
      title: 'Math Tutoring',
      icon: '👨‍🏫',
      price: 30,
      unit: '/hr',
      inquiries: 8,
      availability: 'Weekends'
    },
    {
      id: '3',
      title: 'Nasi Lemak Delivery',
      icon: '🍜',
      price: 8,
      unit: '/pack',
      sold: 15,
      nextBatch: '7AM tomorrow'
    },
    {
      id: '4',
      title: 'Laptop Stand',
      icon: '💻',
      price: 25,
      status: 'Just listed',
      condition: 'Like new'
    }
  ];

  // Mock products for buy tab
  const products = [
    {
      id: '1',
      name: 'Travel Backpack',
      description: 'Perfect for Bali trip!',
      price: 80,
      originalPrice: 150,
      distance: '500m',
      area: 'KLCC area',
      seller: 'Ahmad',
      rating: 4.8,
      icon: '🎒'
    },
    {
      id: '2',
      name: 'Tourism Books',
      description: 'Full semester set',
      price: 40,
      savings: '70%',
      distance: '1.2km',
      area: 'UM Campus',
      icon: '📖'
    },
    {
      id: '3',
      name: 'Camera Equipment',
      description: 'For travel photography',
      price: 250,
      condition: 'Excellent',
      distance: '2km',
      icon: '📷'
    },
    {
      id: '4',
      name: 'Portable Charger',
      description: '20000mAh capacity',
      price: 65,
      brand: 'Anker',
      distance: '800m',
      icon: '🔋'
    }
  ];

  // Mock services data
  const services = [
    {
      id: '1',
      title: 'Math & Physics Tutoring',
      icon: '👨‍🏫',
      price: 30,
      unit: '/hour',
      rating: 5,
      reviews: 12,
      earned: 180,
      active: true
    },
    {
      id: '2',
      title: 'Logo Design',
      icon: '🎨',
      priceRange: '50-150',
      unit: '/project',
      activeOrders: 3,
      portfolio: 8
    }
  ];

  const categories = [
    { id: 'books', name: 'Books', icon: '📚' },
    { id: 'food', name: 'Food', icon: '🍽️' },
    { id: 'clothes', name: 'Wear', icon: '👕' },
    { id: 'tech', name: 'Tech', icon: '🎮' },
    { id: 'phone', name: 'Phone', icon: '📱' },
    { id: 'room', name: 'Room', icon: '🏠' }
  ];

  const handleNotify = () => {
    alert('You will be notified when BerseMarket launches!');
  };

  if (isLocalhost) {
    // Show original functional marketplace for localhost development
    return (
      <MarketContainer>
        <StatusBar />
        
        <Header>
          <HeaderTop>
            <BackButton onClick={() => navigate('/dashboard')}>
              ← 
            </BackButton>
            <HeaderTitle>
              <MarketTitle>BerseMarket 🛍️</MarketTitle>
              <Subtitle>Fund Your Travel Dreams</Subtitle>
            </HeaderTitle>
            <NotificationIcon>
              🔔
              <NotificationBadge>3</NotificationBadge>
            </NotificationIcon>
          </HeaderTop>
        </Header>

        {/* Travel Goal Card */}
        <TravelGoalCard>
          <GoalHeader>
            <GoalInfo>
              <GoalLabel>🎯 Active Travel Goal</GoalLabel>
              <GoalTitle>{travelGoal.title} • {travelGoal.date}</GoalTitle>
            </GoalInfo>
          </GoalHeader>
          <GoalProgress>
            <ProgressBar>
              <ProgressFill $percentage={travelGoal.percentage} />
            </ProgressBar>
            <ProgressText>
              <span>{travelGoal.percentage}% Funded • {travelGoal.daysLeft} days left</span>
              <span>RM {travelGoal.currentFunding}/{travelGoal.totalBudget}</span>
            </ProgressText>
          </GoalProgress>
          <GoalActions>
            <GoalButton>+ Add Funds</GoalButton>
            <GoalButton>View Details</GoalButton>
          </GoalActions>
        </TravelGoalCard>

        {/* Tab Navigation */}
        <TabContainer>
          <Tab $active={activeTab === 'sell'} onClick={() => setActiveTab('sell')}>
            <TabLabel>
              <TabText>SELL</TabText>
              <TabSubtext>Active</TabSubtext>
            </TabLabel>
          </Tab>
          <Tab $active={activeTab === 'buy'} onClick={() => setActiveTab('buy')}>
            <TabLabel>
              <TabText>BUY</TabText>
              <TabSubtext>Browse</TabSubtext>
            </TabLabel>
          </Tab>
          <Tab $active={activeTab === 'services'} onClick={() => setActiveTab('services')}>
            <TabLabel>
              <TabText>SERVICES</TabText>
              <TabSubtext>Offer</TabSubtext>
            </TabLabel>
          </Tab>
        </TabContainer>

        <MarketContent>
          {/* SELL TAB */}
          {activeTab === 'sell' && (
            <>
              <QuickSellCard>
                <QuickSellHeader>
                  <span>📸</span>
                  <QuickSellTitle>QUICK SELL</QuickSellTitle>
                </QuickSellHeader>
                <QuickSellText>
                  Snap → Price → List → Earn<br/>
                  Average earning: RM 50/item
                </QuickSellText>
                <QuickSellButton>
                  <span>+</span> Start Selling
                </QuickSellButton>
              </QuickSellCard>

              <ListingsSection>
                <SectionHeader>
                  <SectionTitle>YOUR ACTIVE LISTINGS (4)</SectionTitle>
                  <ViewAllButton>Manage →</ViewAllButton>
                </SectionHeader>

                {listings.map(listing => (
                  <ListingCard key={listing.id}>
                    <ListingHeader>
                      <ListingInfo>
                        <ListingTitle>
                          {listing.icon} {listing.title}
                        </ListingTitle>
                        <ListingPrice>
                          RM {listing.price}{listing.unit || ''}
                        </ListingPrice>
                      </ListingInfo>
                    </ListingHeader>
                    <ListingStats>
                      {listing.views && <Stat>👁️ {listing.views} views</Stat>}
                      {listing.chats && <Stat>💬 {listing.chats} chats</Stat>}
                      {listing.inquiries && <Stat>📩 {listing.inquiries} inquiries</Stat>}
                      {listing.sold && <Stat>✅ {listing.sold} sold today</Stat>}
                    </ListingStats>
                    {listing.rating && (
                      <ListingRating>
                        {'⭐'.repeat(listing.rating)} "{listing.reviews}"
                      </ListingRating>
                    )}
                    {listing.availability && (
                      <Stat>Available: {listing.availability}</Stat>
                    )}
                    {listing.nextBatch && (
                      <Stat>Next batch: {listing.nextBatch}</Stat>
                    )}
                  </ListingCard>
                ))}
              </ListingsSection>

              <EarningsCard>
                <EarningsTitle>POTENTIAL EARNINGS</EarningsTitle>
                <EarningsRow>
                  <span>If all items sell:</span>
                </EarningsRow>
                <EarningsRow>
                  <span>💰 Immediate</span>
                  <span>RM 205</span>
                </EarningsRow>
                <EarningsRow>
                  <span>📚 Tutoring (8 hrs)</span>
                  <span>+ RM 240</span>
                </EarningsRow>
                <EarningsRow>
                  <span>🍜 Food (20 packs)</span>
                  <span>+ RM 160</span>
                </EarningsRow>
                <EarningsTotal>
                  <span>= Total towards Bali! 🎉</span>
                  <span>RM 605</span>
                </EarningsTotal>
              </EarningsCard>

              <SuggestionsCard>
                <SuggestionsTitle>
                  💡 Smart Suggestions
                </SuggestionsTitle>
                <div style={{ fontSize: '12px', color: '#0D47A1', marginBottom: '8px' }}>
                  Based on your Bali goal:
                </div>
                <SuggestionItem>
                  <SuggestionText>• Sell old electronics</SuggestionText>
                  <SuggestionValue>+RM 200</SuggestionValue>
                </SuggestionItem>
                <SuggestionItem>
                  <SuggestionText>• Offer design services</SuggestionText>
                  <SuggestionValue>+RM 150</SuggestionValue>
                </SuggestionItem>
                <SuggestionItem>
                  <SuggestionText>• Rent out study notes</SuggestionText>
                  <SuggestionValue>+RM 50</SuggestionValue>
                </SuggestionItem>
              </SuggestionsCard>
            </>
          )}

          {/* BUY TAB */}
          {activeTab === 'buy' && (
            <>
              <SearchBar>
                <span>🔍</span>
                <SearchInput
                  placeholder="Search for deals..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <SearchButton>⚙️</SearchButton>
              </SearchBar>

              <ListingsSection>
                <SectionTitle style={{ marginBottom: '12px' }}>CATEGORIES</SectionTitle>
                <CategoryGrid>
                  {categories.map(category => (
                    <CategoryButton key={category.id}>
                      <CategoryIcon>{category.icon}</CategoryIcon>
                      <CategoryName>{category.name}</CategoryName>
                    </CategoryButton>
                  ))}
                </CategoryGrid>
              </ListingsSection>

              <ListingsSection>
                <SectionHeader>
                  <SectionTitle>🔥 HOT DEALS NEAR YOU</SectionTitle>
                </SectionHeader>

                <ProductGrid>
                  {products.map(product => (
                    <ProductCard key={product.id}>
                      <ProductImage>{product.icon}</ProductImage>
                      <ProductInfo>
                        <ProductName>{product.name}</ProductName>
                        <ProductMeta>{product.description}</ProductMeta>
                        <ProductMeta>
                          📍 {product.distance} • {product.area || ''}
                        </ProductMeta>
                        <ProductFooter>
                          <ProductPrice>
                            RM {product.price}
                            {product.originalPrice && (
                              <span style={{ fontSize: '11px', color: '#999', textDecoration: 'line-through', marginLeft: '4px' }}>
                                RM {product.originalPrice}
                              </span>
                            )}
                          </ProductPrice>
                          <ProductActions>
                            <ActionButton>Chat</ActionButton>
                            <ActionButton color="#2ece98">Buy</ActionButton>
                          </ProductActions>
                        </ProductFooter>
                      </ProductInfo>
                    </ProductCard>
                  ))}
                </ProductGrid>
              </ListingsSection>

              <WalletCard>
                <WalletBalance>
                  <div>
                    <BalanceLabel>💰 BERSEPASS QUICK PAY</BalanceLabel>
                    <BalanceAmount>RM 45.60 | 950 pts</BalanceAmount>
                  </div>
                </WalletBalance>
                <WalletActions>
                  <WalletButton>Top Up</WalletButton>
                  <WalletButton>Withdraw</WalletButton>
                  <WalletButton>History</WalletButton>
                </WalletActions>
              </WalletCard>
            </>
          )}

          {/* SERVICES TAB */}
          {activeTab === 'services' && (
            <>
              <ListingsSection>
                <SectionHeader>
                  <SectionTitle>💼 YOUR SERVICE OFFERINGS</SectionTitle>
                  <ViewAllButton>+ Add New</ViewAllButton>
                </SectionHeader>

                {services.map(service => (
                  <ServiceCard key={service.id}>
                    <ServiceHeader>
                      <ServiceInfo>
                        <ServiceTitle>
                          {service.icon} {service.title}
                        </ServiceTitle>
                        <ServicePrice>
                          RM {service.price || service.priceRange}{service.unit}
                        </ServicePrice>
                      </ServiceInfo>
                    </ServiceHeader>
                    
                    {service.rating && (
                      <ServiceRating>
                        {'⭐'.repeat(service.rating)} ({service.reviews} reviews)
                      </ServiceRating>
                    )}
                    
                    <ServiceStats>
                      {service.earned && (
                        <ServiceStat>
                          <StatValue>RM {service.earned}</StatValue>
                          <StatLabel>This week</StatLabel>
                        </ServiceStat>
                      )}
                      {service.activeOrders && (
                        <ServiceStat>
                          <StatValue>{service.activeOrders}</StatValue>
                          <StatLabel>Active orders</StatLabel>
                        </ServiceStat>
                      )}
                      {service.portfolio && (
                        <ServiceStat>
                          <StatValue>{service.portfolio}</StatValue>
                          <StatLabel>Portfolio</StatLabel>
                        </ServiceStat>
                      )}
                    </ServiceStats>
                    
                    <ServiceActions>
                      <ServiceButton>Edit</ServiceButton>
                      <ServiceButton>Pause</ServiceButton>
                      <ServiceButton primary>Promote</ServiceButton>
                    </ServiceActions>
                  </ServiceCard>
                ))}
              </ListingsSection>

              <SuggestionsCard>
                <SuggestionsTitle>
                  🎯 QUICK SERVICE IDEAS
                </SuggestionsTitle>
                <div style={{ fontSize: '12px', color: '#0D47A1', marginBottom: '8px' }}>
                  Based on your profile:
                </div>
                <SuggestionItem>
                  <SuggestionText>• Photography</SuggestionText>
                  <SuggestionValue>RM 80/hr</SuggestionValue>
                </SuggestionItem>
                <SuggestionItem>
                  <SuggestionText>• Study notes</SuggestionText>
                  <SuggestionValue>RM 20 passive</SuggestionValue>
                </SuggestionItem>
                <SuggestionItem>
                  <SuggestionText>• Food delivery</SuggestionText>
                  <SuggestionValue>RM 15/trip</SuggestionValue>
                </SuggestionItem>
              </SuggestionsCard>

              <EarningsCard>
                <EarningsTitle>📊 EARNINGS DASHBOARD</EarningsTitle>
                <EarningsRow>
                  <span>This Month:</span>
                </EarningsRow>
                <EarningsRow>
                  <span>Services</span>
                  <span>RM 420</span>
                </EarningsRow>
                <EarningsRow>
                  <span>Items Sold</span>
                  <span>RM 230</span>
                </EarningsRow>
                <EarningsTotal>
                  <span>Total</span>
                  <span>RM 650</span>
                </EarningsTotal>
                <div style={{ textAlign: 'center', marginTop: '8px', fontSize: '14px', color: '#28b885' }}>
                  🎯 32.5% of Bali goal!
                </div>
              </EarningsCard>
            </>
          )}
        </MarketContent>

        <MainNav 
          activeTab="market"
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
              case 'market':
                navigate('/market');
                break;
            }
          }}
        />
      </MarketContainer>
    );
  }

  // Show coming soon for production
  return (
    <Container>
      <StatusBar />
      <CompactHeader onMenuClick={() => setIsSidebarOpen(true)} />
      
      <Content>
        <ComingSoonCard>
          <IconContainer>🛍️</IconContainer>
          
          <ComingSoonBadge>Coming Soon</ComingSoonBadge>
          
          <Title>BerseMarket</Title>
          
          <Description>
            Fund your travel dreams by selling, buying and trading
          </Description>
          
          <FeatureList>
            <FeatureItem>
              <FeatureIcon>💰</FeatureIcon>
              <FeatureText>
                <FeatureTitle>Sell Your Items</FeatureTitle>
                <FeatureDesc>Turn unused items into travel funds quickly and easily</FeatureDesc>
              </FeatureText>
            </FeatureItem>
            
            <FeatureItem>
              <FeatureIcon>🛒</FeatureIcon>
              <FeatureText>
                <FeatureTitle>Buy from Students</FeatureTitle>
                <FeatureDesc>Find great deals on textbooks, electronics, and more</FeatureDesc>
              </FeatureText>
            </FeatureItem>
            
            <FeatureItem>
              <FeatureIcon>🔄</FeatureIcon>
              <FeatureText>
                <FeatureTitle>Trade Services</FeatureTitle>
                <FeatureDesc>Exchange skills and services with fellow students</FeatureDesc>
              </FeatureText>
            </FeatureItem>
            
            <FeatureItem>
              <FeatureIcon>🎯</FeatureIcon>
              <FeatureText>
                <FeatureTitle>Travel Goal Tracking</FeatureTitle>
                <FeatureDesc>Track earnings towards your next adventure</FeatureDesc>
              </FeatureText>
            </FeatureItem>
          </FeatureList>
          
          <NotifyButton onClick={handleNotify}>
            Notify Me When Available
          </NotifyButton>
        </ComingSoonCard>
      </Content>

      <MainNav 
        activeTab="market"
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
            case 'market':
              // Already on market
              break;
            default:
              navigate('/dashboard');
          }
        }}
      />
      
      <ProfileSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </Container>
  );
};