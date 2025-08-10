import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { StatusBar } from '../components/StatusBar/StatusBar';
import { MainNav } from '../components/MainNav/index';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #F9F3E3;
`;

// Animations
const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const slideIn = keyframes`
  from { transform: translateX(-100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const slideUp = keyframes`
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
`;

// Header Styles
const Header = styled.div`
  background: white;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`;

const HeaderTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 4px;
  color: #2D5F4F;
`;

const HeaderTitle = styled.div`
  flex: 1;
  text-align: center;
`;

const LocationTag = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #E8F5E9;
  color: #2D5F4F;
  padding: 4px 10px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 4px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #C8E6C9;
  }
`;

const Title = styled.h2`
  margin: 0;
  font-size: 18px;
  color: #2D5F4F;
  font-weight: 600;
`;

const CreateButton = styled.button`
  background: #2D5F4F;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;

  &:hover {
    background: #1E4039;
  }
`;

// Search Bar
const SearchContainer = styled.div`
  padding: 0 16px;
  margin-bottom: 12px;
`;

const SearchBar = styled.div`
  background: white;
  border-radius: 12px;
  padding: 10px 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
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

const SearchIcon = styled.span`
  font-size: 16px;
  color: #666;
`;

const FilterButton = styled.button`
  background: #E8F5E9;
  color: #2D5F4F;
  border: none;
  padding: 6px 10px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;

  &:hover {
    background: #C8E6C9;
  }
`;

// Category Tabs
const CategoryTabs = styled.div`
  display: flex;
  gap: 8px;
  padding: 0 16px;
  margin-bottom: 12px;
  overflow-x: auto;
  background: white;
  padding-top: 12px;
  padding-bottom: 12px;
  
  &::-webkit-scrollbar {
    display: none;
  }
`;

const CategoryTab = styled.button<{ $active?: boolean }>`
  background: ${props => props.$active ? '#2D5F4F' : 'white'};
  color: ${props => props.$active ? 'white' : '#666'};
  border: 1px solid ${props => props.$active ? '#2D5F4F' : '#e0e0e0'};
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    background: ${props => props.$active ? '#1E4039' : '#f5f5f5'};
    border-color: #2D5F4F;
  }
`;

const CategoryIcon = styled.span`
  font-size: 14px;
`;

// Smart Tabs
const SmartTabs = styled.div`
  display: flex;
  background: white;
  border-bottom: 1px solid #e0e0e0;
  padding: 0;
`;

const SmartTab = styled.button<{ $active?: boolean }>`
  flex: 1;
  padding: 12px;
  background: ${props => props.$active ? '#2D5F4F' : 'white'};
  color: ${props => props.$active ? 'white' : '#666'};
  border: none;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.$active ? '#1E4039' : '#f5f5f5'};
  }

  ${props => props.$active && `
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: #4CAF50;
    }
  `}
`;

const TabBadge = styled.span`
  background: #FF4444;
  color: white;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 10px;
  margin-left: 4px;
`;

// Quick Filters
const QuickFilters = styled.div`
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  overflow-x: auto;
  background: white;
  border-bottom: 1px solid #f0f0f0;
  
  &::-webkit-scrollbar {
    display: none;
  }
`;

const QuickFilter = styled.button<{ $active?: boolean }>`
  background: ${props => props.$active ? 'rgba(45, 95, 79, 0.1)' : 'white'};
  color: ${props => props.$active ? '#2D5F4F' : '#666'};
  border: 1px solid ${props => props.$active ? '#2D5F4F' : '#e0e0e0'};
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 12px;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 4px;

  &:hover {
    border-color: #2D5F4F;
    background: rgba(45, 95, 79, 0.05);
  }
`;

// Content Area
const Content = styled.div`
  flex: 1;
  overflow-y: auto;
  padding-bottom: 100px;
  background: #F9F3E3;
`;

// Section Header
const SectionHeader = styled.div`
  padding: 16px 16px 8px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SectionTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  color: #333;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
`;

// Event Card with Share
const EventCard = styled.div<{ $trending?: boolean; $category?: string }>`
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin: 0 16px 12px 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  ${props => props.$trending && `border: 2px solid #FF6B6B;`}
  ${props => props.$category === 'volunteer' && `
    background: linear-gradient(to right, white 98%, #4CAF50 2%);
  `}
  ${props => props.$category === 'donation' && `
    background: linear-gradient(to right, white 98%, #9C27B0 2%);
  `}

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  }
`;

const ShareButton = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #e0e0e0;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 1;

  &:hover {
    background: white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

const TrendingBadge = styled.div`
  background: linear-gradient(135deg, #FF6B6B, #FF8E53);
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  animation: ${pulse} 2s infinite;
  position: absolute;
  top: 12px;
  left: 12px;
`;

const EventHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

const EventInfo = styled.div`
  flex: 1;
  padding-right: 40px;
`;

const EventIcon = styled.div`
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #E8F5E9, #C8E6C9);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  margin-right: 12px;
`;

const EventTitle = styled.h4`
  margin: 0 0 4px 0;
  font-size: 16px;
  color: #333;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const EventDateTime = styled.div`
  font-size: 13px;
  color: #666;
  margin-bottom: 4px;
`;

const EventLocation = styled.div`
  font-size: 13px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const EventStats = styled.div`
  display: flex;
  gap: 12px;
  margin: 12px 0;
  flex-wrap: wrap;
`;

const EventStat = styled.div`
  font-size: 12px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const EventFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
`;

const EventPrice = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Price = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: #2D5F4F;
`;

const EventAction = styled.button`
  background: #2D5F4F;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #1E4039;
  }
`;

// Filter Modal
const FilterModal = styled.div<{ $show: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: ${props => props.$show ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
`;

const FilterModalContent = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  width: 100%;
  max-width: 400px;
  max-height: 70vh;
  overflow-y: auto;
`;

const FilterModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const FilterModalTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  color: #333;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  color: #666;
  cursor: pointer;
`;

const FilterSection = styled.div`
  margin-bottom: 20px;
`;

const FilterLabel = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
`;

const FilterOptions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const FilterOption = styled.button<{ $selected?: boolean }>`
  background: ${props => props.$selected ? '#2D5F4F' : 'white'};
  color: ${props => props.$selected ? 'white' : '#666'};
  border: 1px solid ${props => props.$selected ? '#2D5F4F' : '#e0e0e0'};
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #2D5F4F;
  }
`;

const PriceSlider = styled.input`
  width: 100%;
  margin: 12px 0;
`;

const ApplyButton = styled.button`
  width: 100%;
  background: #2D5F4F;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background: #1E4039;
  }
`;

// Share Modal Components
const ShareModal = styled.div<{ $show: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: ${props => props.$show ? 'flex' : 'none'};
  align-items: flex-end;
  justify-content: center;
  z-index: 2000;
`;

const ShareModalContent = styled.div`
  background: white;
  border-radius: 20px 20px 0 0;
  padding: 8px 0 20px 0;
  width: 100%;
  max-height: 70vh;
  animation: ${slideUp} 0.3s ease;
`;

const ShareModalHeader = styled.div`
  text-align: center;
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
`;

const ShareModalDragHandle = styled.div`
  width: 40px;
  height: 4px;
  background: #ddd;
  border-radius: 2px;
  margin: 0 auto 8px auto;
`;

const ShareModalTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  color: #333;
`;

const ShareSearchBar = styled.div`
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
`;

const ShareSearchInput = styled.input`
  width: 100%;
  padding: 8px 12px;
  background: #f5f5f5;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  outline: none;

  &::placeholder {
    color: #999;
  }
`;

const ShareContactsGrid = styled.div`
  padding: 16px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  max-height: 250px;
  overflow-y: auto;
`;

const ShareContact = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  position: relative;
`;

const ContactAvatar = styled.div<{ $selected?: boolean }>`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  position: relative;
  border: 2px solid ${props => props.$selected ? '#2196F3' : 'transparent'};
  transition: all 0.2s ease;
`;

const ContactName = styled.span`
  font-size: 12px;
  color: #333;
  text-align: center;
  max-width: 70px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ExternalShareOptions = styled.div`
  padding: 16px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-around;
`;

const ExternalShareButton = styled.button`
  background: none;
  border: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px;
  border-radius: 12px;
  transition: all 0.2s ease;

  &:hover {
    background: #f5f5f5;
  }
`;

const ExternalShareIcon = styled.div<{ $bgColor?: string }>`
  width: 50px;
  height: 50px;
  border-radius: 12px;
  background: ${props => props.$bgColor || '#e0e0e0'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
`;

const ExternalShareLabel = styled.span`
  font-size: 11px;
  color: #666;
`;

// Cafe Scanner Card
const CafeScannerCard = styled.div`
  background: linear-gradient(135deg, #6F4E37, #8B5A3C);
  border-radius: 12px;
  padding: 16px;
  margin: 0 16px 16px 16px;
  color: white;
  position: relative;
  overflow: hidden;
`;

const LiveIndicator = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;
  background: #4CAF50;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  display: flex;
  align-items: center;
  gap: 4px;
  animation: ${pulse} 2s infinite;

  &::before {
    content: '';
    width: 6px;
    height: 6px;
    background: white;
    border-radius: 50%;
    animation: ${pulse} 1s infinite;
  }
`;

const CafeScannerTitle = styled.h3`
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
`;

const CafeScannerDesc = styled.p`
  margin: 0 0 12px 0;
  font-size: 13px;
  opacity: 0.9;
`;

const ScanButton = styled.button`
  background: white;
  color: #6F4E37;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  justify-content: center;

  &:hover {
    background: #f5f5f5;
  }
`;

// Join Event Modal Styles
const JoinModal = styled.div<{ $show: boolean }>`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-radius: 24px 24px 0 0;
  padding: 24px;
  z-index: 1000;
  transform: translateY(${props => props.$show ? '0' : '100%'});
  transition: transform 0.3s ease;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
`;

const JoinModalHeader = styled.div`
  text-align: center;
  margin-bottom: 24px;
`;

const JoinModalTitle = styled.h3`
  margin: 0 0 8px 0;
  font-size: 20px;
  color: #2D5F4F;
`;

const JoinModalSubtitle = styled.p`
  margin: 0;
  font-size: 14px;
  color: #666;
`;

const EventDetailsCard = styled.div`
  background: #F5F8F5;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
`;

const EventDetailRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const EventDetailIcon = styled.span`
  font-size: 20px;
`;

const EventDetailText = styled.div`
  flex: 1;
  font-size: 14px;
  color: #333;
`;

const PointsEarned = styled.div`
  background: linear-gradient(135deg, #4CAF50, #45a049);
  color: white;
  border-radius: 12px;
  padding: 12px;
  text-align: center;
  margin-bottom: 20px;
  font-size: 16px;
  font-weight: 600;
`;

const JoinButton = styled.button`
  background: #2D5F4F;
  color: white;
  border: none;
  padding: 16px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  margin-bottom: 12px;
  
  &:hover {
    background: #1E4039;
  }
`;

const CancelButton = styled.button`
  background: #f5f5f5;
  color: #666;
  border: none;
  padding: 16px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  
  &:hover {
    background: #e8e8e8;
  }
`;

// Payment Modal Styles
const PaymentModal = styled(JoinModal)``;

const PaymentMethod = styled.div`
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  
  &:hover {
    border-color: #2D5F4F;
    background: #F5F8F5;
  }
`;

const PaymentIcon = styled.div`
  width: 40px;
  height: 40px;
  background: #f5f5f5;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
`;

const PaymentLabel = styled.div`
  flex: 1;
  font-size: 14px;
  font-weight: 600;
  color: #333;
`;

const TotalAmount = styled.div`
  background: #F5F8F5;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TotalLabel = styled.span`
  font-size: 14px;
  color: #666;
`;

const TotalPrice = styled.span`
  font-size: 20px;
  font-weight: 700;
  color: #2D5F4F;
`;

// Refund Modal Styles
const RefundModal = styled(JoinModal)``;

const RefundOptions = styled.div`
  margin-bottom: 20px;
`;

const RefundOption = styled.div`
  background: #FFF3E0;
  border: 2px solid #FFE0B2;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  text-align: center;
`;

const RefundTitle = styled.h4`
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #FF6B35;
`;

const RefundDescription = styled.p`
  margin: 0;
  font-size: 13px;
  color: #666;
`;

const RefundButton = styled.button`
  background: #FF6B35;
  color: white;
  border: none;
  padding: 16px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  margin-bottom: 12px;
  
  &:hover {
    background: #E55A2B;
  }
`;

const KeepButton = styled(CancelButton)`
  background: #2D5F4F;
  color: white;
  
  &:hover {
    background: #1E4039;
  }
`;

export const BerseConnectScreen: React.FC = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [activeTab, setActiveTab] = useState('For You');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [currentLocation, setCurrentLocation] = useState({ city: 'Kuala Lumpur', country: 'Malaysia' });
  const [searchQuery, setSearchQuery] = useState('');
  
  // Event registration modal states
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [joinedEvents, setJoinedEvents] = useState<string[]>([]);

  // Categories with icons
  const categories = [
    { id: 'All', name: 'All', icon: '🎯' },
    { id: 'Sports', name: 'Sports', icon: '⚽' },
    { id: 'Social', name: 'Social', icon: '☕' },
    { id: 'Trips', name: 'Trips', icon: '✈️' },
    { id: 'Study', name: 'Study', icon: '📚' },
    { id: 'Donation', name: 'Donation', icon: '💝' },
    { id: 'Volunteer', name: 'Volunteer', icon: '🤲' },
    { id: 'Cafe', name: 'Cafe', icon: '☕' },
  ];

  // All events including from both sources
  const allEvents = [
    // New BerseMukha Special Event
    {
      id: 'bersemukha-july',
      category: 'Social',
      icon: '🎭',
      title: 'BerseMukha July: Slow Down, You\'re Doing Fine',
      dateTime: 'July 28 · 2:30-5:30 PM',
      location: 'Mukha Ba TTDI',
      city: 'Kuala Lumpur',
      country: 'Malaysia',
      host: 'BerseMukha',
      hostType: 'organization',
      attendees: 45,
      maxAttendees: 120,
      price: 0,
      description: 'Monthly gathering for mindfulness and community connection',
      trending: true,
      compatibility: 95,
      points: 10
    },
    // New Sports Events
    {
      id: 'berseminton-monday',
      category: 'Sports',
      icon: '🏸',
      title: 'BerseMinton Monday League',
      dateTime: 'Every Monday · 8:00 PM',
      location: 'Yosin Badminton Centre, Damansara',
      city: 'Kuala Lumpur',
      country: 'Malaysia',
      host: 'Sukan Squad',
      attendees: 12,
      maxAttendees: 20,
      price: 15,
      description: 'Weekly badminton sessions for all levels',
      points: 5,
      recurring: true
    },
    {
      id: 'sirah-squad',
      category: 'Study',
      icon: '📖',
      title: 'Sirah Squad Online Session',
      dateTime: 'Every Sunday · 9:00 PM',
      location: 'Online - Discord',
      city: 'Online',
      country: 'Malaysia',
      host: 'Sirah Squad',
      attendees: 35,
      maxAttendees: 100,
      price: 0,
      description: 'Weekly Sirah study and discussion group',
      points: 6,
      recurring: true
    },
    // Events from original source
    {
      id: '1',
      category: 'Sports',
      icon: '🏸',
      title: 'Badminton @ KLCC',
      dateTime: 'Tonight · 8pm',
      location: 'KLCC Sports Complex',
      city: 'Kuala Lumpur',
      country: 'Malaysia',
      distance: '2.5km',
      host: 'Ahmad',
      hostRating: 4.9,
      attendees: 12,
      maxAttendees: 16,
      friendsGoing: ['Sarah', 'Khalid', 'Fatima'],
      price: 75,
      description: 'Friendly badminton session for all levels.',
      points: 50,
      compatibility: 85
    },
    {
      id: '2',
      category: 'Social',
      icon: '☕',
      title: 'Coffee & Code Meetup',
      dateTime: 'Tomorrow · 10am',
      location: 'Brew & Bean, Bangsar',
      city: 'Kuala Lumpur',
      country: 'Malaysia',
      host: 'Tech KL',
      hostType: 'organization',
      attendees: 23,
      maxAttendees: 30,
      price: 0,
      description: 'Weekly meetup for developers.',
      points: 30
    },
    // Events from BerseConnect screen
    {
      id: '3',
      category: 'Social',
      icon: '☕',
      title: 'Coffee & Cultural Exchange',
      dateTime: 'May 20 · 7:00 PM',
      location: 'KLCC Mesra Cafe',
      city: 'Kuala Lumpur',
      country: 'Malaysia',
      host: 'Ahmad Rahman',
      attendees: 15,
      maxAttendees: 25,
      price: 0,
      description: 'Meet diverse Muslims and share cultural experiences',
      points: 3
    },
    {
      id: '4',
      category: 'Cafe',
      icon: '☕',
      title: 'Monday Morning Coffee',
      dateTime: 'May 22 · 8:30 AM',
      location: 'Damansara Heights',
      city: 'Kuala Lumpur',
      country: 'Malaysia',
      host: 'Sarah Khalil',
      attendees: 6,
      maxAttendees: 12,
      price: 0,
      description: 'Casual meetup for working professionals',
      points: 2
    },
    {
      id: '5',
      category: 'Study',
      icon: '📚',
      title: 'Islamic Finance Workshop',
      dateTime: 'May 25 · 2:00 PM',
      location: 'IIUM Gombak',
      city: 'Kuala Lumpur',
      country: 'Malaysia',
      host: 'Dr. Abdullah',
      attendees: 12,
      maxAttendees: 30,
      price: 25,
      description: 'Learn Sharia-compliant investment strategies',
      points: 5
    },
    {
      id: '6',
      category: 'Donation',
      icon: '🏃',
      title: 'Charity Fun Run',
      dateTime: 'May 28 · 6:00 AM',
      location: 'Titiwangsa Park',
      city: 'Kuala Lumpur',
      country: 'Malaysia',
      host: 'Muslim Runners',
      attendees: 25,
      maxAttendees: 100,
      price: 35,
      description: 'Support orphanages while staying fit',
      points: 4
    },
    {
      id: '7',
      category: 'Trips',
      icon: '🏔️',
      title: 'Cameron Highlands Trek',
      dateTime: 'Jun 2 · 5:00 AM',
      location: 'Cameron Highlands',
      city: 'Pahang',
      country: 'Malaysia',
      host: 'Adventure Seekers',
      attendees: 8,
      maxAttendees: 15,
      price: 85,
      description: 'Mountain hiking with halal food stops',
      points: 6
    },
    {
      id: '8',
      category: 'Volunteer',
      icon: '📚',
      title: 'Teaching English',
      dateTime: 'May 24 · 3:00 PM',
      location: 'Ampang Community Center',
      city: 'Kuala Lumpur',
      country: 'Malaysia',
      host: 'Volunteer Network',
      attendees: 5,
      maxAttendees: 10,
      price: 0,
      description: 'Help refugee children with English lessons',
      points: 4
    },
    {
      id: '9',
      category: 'Cafe',
      icon: '☕',
      title: 'Wednesday Coffee Talks at Suria KLCC',
      dateTime: 'May 8 · 10:00 AM',
      location: 'Suria KLCC',
      city: 'Kuala Lumpur',
      country: 'Malaysia',
      host: 'Nora Fatimah',
      attendees: 6,
      maxAttendees: 15,
      price: 0,
      description: 'Midweek coffee discussions and networking',
      points: 3
    },
    {
      id: '10',
      category: 'Cafe',
      icon: '☕',
      title: 'Friday Morning Brew at The Grind Damansara',
      dateTime: 'May 10 · 8:30 AM',
      location: 'The Grind Damansara',
      city: 'Kuala Lumpur',
      country: 'Malaysia',
      host: 'Rahman Hafiz',
      attendees: 14,
      maxAttendees: 20,
      price: 0,
      description: 'Start your Friday with great coffee and conversation',
      points: 4
    },
    {
      id: '11',
      category: 'Cafe',
      icon: '☕',
      title: 'Sunday Chill at Common Man Coffee Roasters',
      dateTime: 'May 12 · 3:00 PM',
      location: 'Petaling Jaya',
      city: 'Kuala Lumpur',
      country: 'Malaysia',
      host: 'Laila Maisarah',
      attendees: 8,
      maxAttendees: 12,
      price: 0,
      description: 'Relaxed Sunday afternoon coffee meetup',
      points: 3
    },
    {
      id: '12',
      category: 'Social',
      icon: '🎭',
      title: 'BerseMuka Cultural Night',
      dateTime: 'May 14 · 7:00 PM',
      location: 'Dewan Komuniti Shah Alam',
      city: 'Shah Alam',
      country: 'Malaysia',
      host: 'Zara Aminah',
      attendees: 20,
      maxAttendees: 50,
      price: 0,
      description: 'Celebrate diverse Malaysian Muslim cultures',
      points: 5
    },
    {
      id: '13',
      category: 'Social',
      icon: '🎲',
      title: 'Board Games & Chill Evening',
      dateTime: 'May 16 · 6:00 PM',
      location: 'Mid Valley Megamall',
      city: 'Kuala Lumpur',
      country: 'Malaysia',
      host: 'Farid Ikmal',
      attendees: 12,
      maxAttendees: 16,
      price: 0,
      description: 'Fun board games night with fellow Muslims',
      points: 4
    },
    {
      id: '14',
      category: 'Social',
      icon: '🍜',
      title: 'BerseMakan Food Adventure Bukit Bintang',
      dateTime: 'May 19 · 1:00 PM',
      location: 'Bukit Bintang KL',
      city: 'Kuala Lumpur',
      country: 'Malaysia',
      host: 'Halim Syafiq',
      attendees: 18,
      maxAttendees: 25,
      price: 0,
      description: 'Explore halal food gems in Bukit Bintang',
      points: 6
    },
    {
      id: '15',
      category: 'Social',
      icon: '🎨',
      title: 'Art Jamming Session at Publika',
      dateTime: 'May 21 · 2:30 PM',
      location: 'Publika Mont Kiara',
      city: 'Kuala Lumpur',
      country: 'Malaysia',
      host: 'Aina Sofia',
      attendees: 11,
      maxAttendees: 15,
      price: 0,
      description: 'Creative art session for Muslim artists',
      points: 5
    },
    {
      id: '16',
      category: 'Trips',
      icon: '🏔️',
      title: 'Highland Adventure to Cameron Highlands',
      dateTime: 'May 24-26 · 3 Days',
      location: 'Cameron Highlands Pahang',
      city: 'Pahang',
      country: 'Malaysia',
      host: 'Azlan Ibrahim',
      attendees: 8,
      maxAttendees: 12,
      price: 150,
      description: '3-day mountain adventure with halal accommodations',
      points: 10
    },
    {
      id: '17',
      category: 'Trips',
      icon: '🏝️',
      title: 'Beach Getaway to Langkawi Island',
      dateTime: 'Jun 1-3 · 3 Days',
      location: 'Langkawi Kedah',
      city: 'Langkawi',
      country: 'Malaysia',
      host: 'Mira Rania',
      attendees: 15,
      maxAttendees: 20,
      price: 280,
      description: '3-day tropical island retreat',
      points: 12
    },
    {
      id: '22',
      category: 'Sports',
      icon: '⚽',
      title: 'BerseBola Sunday Football League',
      dateTime: 'May 26 · 6:00 PM',
      location: 'Padang Astaka Shah Alam',
      city: 'Shah Alam',
      country: 'Malaysia',
      host: 'Danial Hakim',
      attendees: 16,
      maxAttendees: 22,
      price: 0,
      description: 'Weekly football matches for Muslim players',
      points: 5
    },
    {
      id: '23',
      category: 'Sports',
      icon: '🏃',
      title: 'Morning Jog at KLCC Park',
      dateTime: 'May 27 · 6:30 AM',
      location: 'KLCC Park Kuala Lumpur',
      city: 'Kuala Lumpur',
      country: 'Malaysia',
      host: 'Lina Azira',
      attendees: 9,
      maxAttendees: 15,
      price: 0,
      description: 'Healthy morning jog with the community',
      points: 4
    },
    {
      id: '25',
      category: 'Volunteer',
      icon: '🏠',
      title: 'Volunteer at Rumah Kasih Orphanage',
      dateTime: 'May 31 · 9:00 AM',
      location: 'Ampang Selangor',
      city: 'Ampang',
      country: 'Malaysia',
      host: 'Rumah Kasih',
      attendees: 13,
      maxAttendees: 20,
      price: 0,
      description: 'Help and spend time with orphaned children',
      points: 8
    },
    {
      id: '28',
      category: 'Study',
      icon: '🕌',
      title: 'Ramadan Preparation Workshop',
      dateTime: 'Jun 7 · 8:00 PM',
      location: 'Masjid Wilayah KL',
      city: 'Kuala Lumpur',
      country: 'Malaysia',
      host: 'Ustaz Ahmad',
      attendees: 25,
      maxAttendees: 40,
      price: 0,
      description: 'Prepare spiritually and practically for Ramadan',
      points: 6
    },
    {
      id: '31',
      category: 'Study',
      icon: '📖',
      title: 'Quran Recitation & Tajweed Class',
      dateTime: 'Jun 14 · 8:30 PM',
      location: 'Masjid Al-Hidayah Shah Alam',
      city: 'Shah Alam',
      country: 'Malaysia',
      host: 'Mohd Hafiz',
      attendees: 14,
      maxAttendees: 20,
      price: 0,
      description: 'Improve your Quran recitation skills',
      points: 4
    }
  ];

  // Filter events based on category and tab
  const getFilteredEvents = () => {
    let events = [...allEvents];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      events = events.filter(event =>
        event.title.toLowerCase().includes(query) ||
        event.description.toLowerCase().includes(query) ||
        event.location.toLowerCase().includes(query) ||
        event.host.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (activeCategory !== 'All') {
      events = events.filter(event => event.category === activeCategory);
    }

    // Apply quick filters
    if (activeFilters.includes('Friends Going')) {
      events = events.filter(e => e.friendsGoing && e.friendsGoing.length > 0);
    }
    if (activeFilters.includes('Free')) {
      events = events.filter(e => e.price === 0);
    }
    if (activeFilters.includes('Trending')) {
      events = events.filter(e => e.trending);
    }

    // Filter by tab
    if (activeTab === 'Today') {
      events = events.filter(e => 
        e.dateTime?.includes('Tonight') || 
        e.dateTime?.includes('Today')
      );
    } else if (activeTab === 'This Week') {
      events = events.filter(e => 
        !e.dateTime?.includes('Jun') && 
        !e.dateTime?.includes('July')
      );
    } else if (activeTab === 'Free') {
      events = events.filter(e => e.price === 0);
    }

    return events;
  };

  const toggleFilter = (filter: string) => {
    setActiveFilters(prev =>
      prev.includes(filter)
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  const handleShare = (event: any) => {
    setSelectedEvent(event);
    setShowShareModal(true);
  };
  
  const handleEventClick = (event: any) => {
    setSelectedEvent(event);
    
    // Check if already joined for refund/cancel option
    if (joinedEvents.includes(event.id)) {
      setShowRefundModal(true);
    } else if (event.price > 0) {
      setShowPaymentModal(true);
    } else {
      setShowJoinModal(true);
    }
  };
  
  const handleJoinEvent = () => {
    if (selectedEvent) {
      setJoinedEvents([...joinedEvents, selectedEvent.id]);
      setShowJoinModal(false);
      setSelectedEvent(null);
      // Show success notification
      alert(`Successfully joined ${selectedEvent.title}!`);
    }
  };
  
  const handlePayment = () => {
    if (selectedEvent) {
      setJoinedEvents([...joinedEvents, selectedEvent.id]);
      setShowPaymentModal(false);
      setSelectedEvent(null);
      // Show success notification
      alert(`Payment successful! You've joined ${selectedEvent.title}!`);
    }
  };
  
  const handleRefund = () => {
    if (selectedEvent) {
      setJoinedEvents(joinedEvents.filter(id => id !== selectedEvent.id));
      setShowRefundModal(false);
      setSelectedEvent(null);
      // Show success notification
      alert(`Refund processed. You've been removed from ${selectedEvent.title}.`);
    }
  };

  const handleExternalShare = (platform: string) => {
    const eventUrl = `https://berseapp.com/event/${selectedEvent?.id}`;
    const shareText = `Check out this event: ${selectedEvent?.title} at ${selectedEvent?.location}`;
    
    switch(platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + eventUrl)}`);
        break;
      case 'instagram':
        alert('Opening Instagram...');
        break;
      case 'copy':
        navigator.clipboard.writeText(eventUrl);
        alert('Link copied to clipboard!');
        break;
    }
  };

  const filteredEvents = getFilteredEvents();

  return (
    <Container>
      <StatusBar />
      
      <Header>
        <HeaderTop>
          <BackButton onClick={() => navigate('/dashboard')}>←</BackButton>
          <HeaderTitle>
            <LocationTag>📍 {currentLocation.city}</LocationTag>
            <Title>BerseConnect</Title>
          </HeaderTitle>
          <CreateButton>+ Create</CreateButton>
        </HeaderTop>
      </Header>

      <SearchContainer>
        <SearchBar>
          <SearchIcon>🔍</SearchIcon>
          <SearchInput 
            placeholder="Search events, communities, activities..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <FilterButton onClick={() => setShowFilterModal(true)}>
            ⚙️ Filters
          </FilterButton>
        </SearchBar>
      </SearchContainer>

      <CategoryTabs>
        {categories.map(cat => (
          <CategoryTab
            key={cat.id}
            $active={activeCategory === cat.id}
            onClick={() => setActiveCategory(cat.id)}
          >
            <CategoryIcon>{cat.icon}</CategoryIcon>
            {cat.name}
          </CategoryTab>
        ))}
      </CategoryTabs>

      <SmartTabs>
        {['For You', 'Today', 'This Week', 'Free'].map(tab => (
          <SmartTab
            key={tab}
            $active={activeTab === tab}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
            {tab === 'Today' && <TabBadge>3</TabBadge>}
          </SmartTab>
        ))}
      </SmartTabs>

      <QuickFilters>
        <QuickFilter
          $active={activeFilters.includes('Friends Going')}
          onClick={() => toggleFilter('Friends Going')}
        >
          👥 Friends Going
        </QuickFilter>
        <QuickFilter
          $active={activeFilters.includes('Trending')}
          onClick={() => toggleFilter('Trending')}
        >
          🔥 Trending
        </QuickFilter>
        <QuickFilter
          $active={activeFilters.includes('Free')}
          onClick={() => toggleFilter('Free')}
        >
          🎁 Free
        </QuickFilter>
      </QuickFilters>

      <Content>
        {/* Cafe Scanner - Show only in Cafe or All */}
        {(activeCategory === 'All' || activeCategory === 'Cafe') && (
          <CafeScannerCard>
            <LiveIndicator>3 Live Now</LiveIndicator>
            <CafeScannerTitle>☕ Instant Cafe Meetups</CafeScannerTitle>
            <CafeScannerDesc>
              Scan QR at any cafe to join spontaneous meetups happening right now!
            </CafeScannerDesc>
            <ScanButton>📷 Scan Cafe QR Code</ScanButton>
          </CafeScannerCard>
        )}

        {/* Events Section */}
        <SectionHeader>
          <SectionTitle>
            {activeTab === 'For You' && '🎯 Recommended For You'}
            {activeTab === 'Today' && `📅 Today's Events`}
            {activeTab === 'This Week' && '📆 This Week'}
            {activeTab === 'Free' && '🎁 Free Events'}
          </SectionTitle>
        </SectionHeader>

        {filteredEvents.length > 0 ? (
          filteredEvents.map(event => (
            <EventCard 
              key={event.id} 
              $trending={event.trending}
              $category={event.category?.toLowerCase()}
            >
              <ShareButton onClick={(e) => {
                e.stopPropagation();
                handleShare(event);
              }}>
                ↗️
              </ShareButton>

              {event.trending && (
                <TrendingBadge>🔥 Trending</TrendingBadge>
              )}
              
              <EventHeader>
                <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                  <EventIcon>{event.icon}</EventIcon>
                  <EventInfo>
                    <EventTitle>{event.title}</EventTitle>
                    <EventDateTime>{event.dateTime}</EventDateTime>
                    <EventLocation>📍 {event.location}</EventLocation>
                  </EventInfo>
                </div>
              </EventHeader>

              <EventStats>
                <EventStat>Host: {event.host}</EventStat>
                <EventStat>{event.attendees}/{event.maxAttendees} going</EventStat>
                {event.compatibility && (
                  <EventStat style={{ color: '#4CAF50' }}>
                    {event.compatibility}% match
                  </EventStat>
                )}
              </EventStats>

              <EventFooter>
                <EventPrice>
                  <Price>{event.price === 0 ? 'FREE' : `RM ${event.price}`}</Price>
                  {event.points && (
                    <span style={{ fontSize: '12px', color: '#666' }}>
                      +{event.points} pts
                    </span>
                  )}
                </EventPrice>
                <EventAction onClick={(e) => {
                  e.stopPropagation();
                  handleEventClick(event);
                }}>
                  {joinedEvents.includes(event.id) ? 'Manage' : event.price > 0 ? 'Pay & Join' : 'Join'}
                </EventAction>
              </EventFooter>
            </EventCard>
          ))
        ) : (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px', 
            color: '#999' 
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
            <div>No events found</div>
            <div style={{ fontSize: '14px', marginTop: '8px' }}>
              Try adjusting your filters
            </div>
          </div>
        )}
      </Content>

      {/* Filter Modal */}
      <FilterModal $show={showFilterModal}>
        <FilterModalContent>
          <FilterModalHeader>
            <FilterModalTitle>Filters</FilterModalTitle>
            <CloseButton onClick={() => setShowFilterModal(false)}>×</CloseButton>
          </FilterModalHeader>

          <FilterSection>
            <FilterLabel>Event Type</FilterLabel>
            <FilterOptions>
              {['Sports', 'Social', 'Study', 'Volunteer', 'Travel', 'Workshop'].map(type => (
                <FilterOption key={type} $selected={activeFilters.includes(type)}>
                  {type}
                </FilterOption>
              ))}
            </FilterOptions>
          </FilterSection>

          <FilterSection>
            <FilterLabel>Price Range (RM)</FilterLabel>
            <PriceSlider type="range" min="0" max="500" />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#666' }}>
              <span>Free</span>
              <span>RM 500</span>
            </div>
          </FilterSection>

          <FilterSection>
            <FilterLabel>Distance</FilterLabel>
            <FilterOptions>
              {['< 5km', '< 10km', '< 25km', 'Any'].map(distance => (
                <FilterOption key={distance} $selected={activeFilters.includes(distance)}>
                  {distance}
                </FilterOption>
              ))}
            </FilterOptions>
          </FilterSection>

          <ApplyButton onClick={() => setShowFilterModal(false)}>
            Apply Filters
          </ApplyButton>
        </FilterModalContent>
      </FilterModal>

      {/* Share Modal */}
      <ShareModal $show={showShareModal}>
        <ShareModalContent>
          <ShareModalHeader>
            <ShareModalDragHandle />
            <ShareModalTitle>Share Event</ShareModalTitle>
          </ShareModalHeader>

          <ShareSearchBar>
            <ShareSearchInput placeholder="Search contacts..." />
          </ShareSearchBar>

          <ShareContactsGrid>
            {['Ahmad', 'Sarah', 'Fatima', 'Khalid', 'Lisa', 'Omar'].map(name => (
              <ShareContact key={name}>
                <ContactAvatar>👤</ContactAvatar>
                <ContactName>{name}</ContactName>
              </ShareContact>
            ))}
          </ShareContactsGrid>

          <ExternalShareOptions>
            <ExternalShareButton onClick={() => handleExternalShare('whatsapp')}>
              <ExternalShareIcon $bgColor="#25D366">📱</ExternalShareIcon>
              <ExternalShareLabel>WhatsApp</ExternalShareLabel>
            </ExternalShareButton>
            
            <ExternalShareButton onClick={() => handleExternalShare('instagram')}>
              <ExternalShareIcon $bgColor="linear-gradient(135deg, #F58529, #DD2A7B)">
                📷
              </ExternalShareIcon>
              <ExternalShareLabel>Instagram</ExternalShareLabel>
            </ExternalShareButton>
            
            <ExternalShareButton onClick={() => handleExternalShare('copy')}>
              <ExternalShareIcon $bgColor="#666">🔗</ExternalShareIcon>
              <ExternalShareLabel>Copy Link</ExternalShareLabel>
            </ExternalShareButton>
          </ExternalShareOptions>

          <button
            onClick={() => setShowShareModal(false)}
            style={{
              width: 'calc(100% - 32px)',
              margin: '0 16px',
              padding: '12px',
              background: '#f5f5f5',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        </ShareModalContent>
      </ShareModal>

      {/* Join Event Modal */}
      <JoinModal $show={showJoinModal}>
        <JoinModalHeader>
          <JoinModalTitle>Join Event</JoinModalTitle>
          <JoinModalSubtitle>You're about to join this event</JoinModalSubtitle>
        </JoinModalHeader>

        {selectedEvent && (
          <>
            <EventDetailsCard>
              <EventDetailRow>
                <EventDetailIcon>{selectedEvent.icon}</EventDetailIcon>
                <EventDetailText>
                  <strong>{selectedEvent.title}</strong>
                </EventDetailText>
              </EventDetailRow>
              <EventDetailRow>
                <EventDetailIcon>📅</EventDetailIcon>
                <EventDetailText>{selectedEvent.dateTime}</EventDetailText>
              </EventDetailRow>
              <EventDetailRow>
                <EventDetailIcon>📍</EventDetailIcon>
                <EventDetailText>{selectedEvent.location}</EventDetailText>
              </EventDetailRow>
              <EventDetailRow>
                <EventDetailIcon>👥</EventDetailIcon>
                <EventDetailText>
                  {selectedEvent.attendees}/{selectedEvent.maxAttendees} attendees
                </EventDetailText>
              </EventDetailRow>
            </EventDetailsCard>

            {selectedEvent.points > 0 && (
              <PointsEarned>
                🎉 Earn {selectedEvent.points} points for joining!
              </PointsEarned>
            )}

            <JoinButton onClick={handleJoinEvent}>
              Confirm Join
            </JoinButton>
            <CancelButton onClick={() => setShowJoinModal(false)}>
              Cancel
            </CancelButton>
          </>
        )}
      </JoinModal>

      {/* Payment Modal */}
      <PaymentModal $show={showPaymentModal}>
        <JoinModalHeader>
          <JoinModalTitle>Complete Payment</JoinModalTitle>
          <JoinModalSubtitle>Choose your payment method</JoinModalSubtitle>
        </JoinModalHeader>

        {selectedEvent && (
          <>
            <EventDetailsCard>
              <EventDetailRow>
                <EventDetailIcon>{selectedEvent.icon}</EventDetailIcon>
                <EventDetailText>
                  <strong>{selectedEvent.title}</strong>
                </EventDetailText>
              </EventDetailRow>
              <EventDetailRow>
                <EventDetailIcon>📅</EventDetailIcon>
                <EventDetailText>{selectedEvent.dateTime}</EventDetailText>
              </EventDetailRow>
              <EventDetailRow>
                <EventDetailIcon>📍</EventDetailIcon>
                <EventDetailText>{selectedEvent.location}</EventDetailText>
              </EventDetailRow>
            </EventDetailsCard>

            <TotalAmount>
              <TotalLabel>Total Amount</TotalLabel>
              <TotalPrice>RM {selectedEvent.price}</TotalPrice>
            </TotalAmount>

            <PaymentMethod onClick={handlePayment}>
              <PaymentIcon>💳</PaymentIcon>
              <PaymentLabel>Credit/Debit Card</PaymentLabel>
            </PaymentMethod>

            <PaymentMethod onClick={handlePayment}>
              <PaymentIcon>🏦</PaymentIcon>
              <PaymentLabel>Online Banking</PaymentLabel>
            </PaymentMethod>

            <PaymentMethod onClick={handlePayment}>
              <PaymentIcon>📱</PaymentIcon>
              <PaymentLabel>Touch 'n Go eWallet</PaymentLabel>
            </PaymentMethod>

            {selectedEvent.points > 0 && (
              <PointsEarned>
                🎉 Earn {selectedEvent.points} points after payment!
              </PointsEarned>
            )}

            <CancelButton onClick={() => setShowPaymentModal(false)}>
              Cancel
            </CancelButton>
          </>
        )}
      </PaymentModal>

      {/* Refund/Cancel Modal */}
      <RefundModal $show={showRefundModal}>
        <JoinModalHeader>
          <JoinModalTitle>Manage Registration</JoinModalTitle>
          <JoinModalSubtitle>You're registered for this event</JoinModalSubtitle>
        </JoinModalHeader>

        {selectedEvent && (
          <>
            <EventDetailsCard>
              <EventDetailRow>
                <EventDetailIcon>{selectedEvent.icon}</EventDetailIcon>
                <EventDetailText>
                  <strong>{selectedEvent.title}</strong>
                </EventDetailText>
              </EventDetailRow>
              <EventDetailRow>
                <EventDetailIcon>📅</EventDetailIcon>
                <EventDetailText>{selectedEvent.dateTime}</EventDetailText>
              </EventDetailRow>
              <EventDetailRow>
                <EventDetailIcon>📍</EventDetailIcon>
                <EventDetailText>{selectedEvent.location}</EventDetailText>
              </EventDetailRow>
            </EventDetailsCard>

            <RefundOptions>
              <RefundOption>
                <RefundTitle>Cancel Registration</RefundTitle>
                <RefundDescription>
                  {selectedEvent.price > 0 
                    ? `Get a full refund of RM ${selectedEvent.price} if cancelled 24 hours before the event`
                    : 'Free up your spot for other attendees'}
                </RefundDescription>
              </RefundOption>
            </RefundOptions>

            <RefundButton onClick={handleRefund}>
              {selectedEvent.price > 0 ? 'Cancel & Request Refund' : 'Cancel Registration'}
            </RefundButton>
            <KeepButton onClick={() => setShowRefundModal(false)}>
              Keep Registration
            </KeepButton>
          </>
        )}
      </RefundModal>

      <MainNav 
        activeTab="connect"
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
    </Container>
  );
};