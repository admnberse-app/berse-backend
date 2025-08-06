import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { StatusBar } from '../components/StatusBar/StatusBar';
import { MainNav } from '../components/MainNav';
import { ProfileSidebar } from '../components/ProfileSidebar';
import { useAuth } from '../contexts/AuthContext';
import { EventRegistrationModal } from '../components/EventRegistrationModal';
import { SportsEventBookingModal } from '../components/SportsEventBookingModal';

// ================================
// STYLED COMPONENTS
// ================================

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #F9F3E3;
  max-width: 393px;
  margin: 0 auto;
  position: relative; /* Add this for proper z-index stacking */
`;

const AvatarImage = styled.img`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
`;

const Content = styled.div`
  flex: 1;
  padding: 0 20px 100px 20px; /* Added extra space for floating nav */
  overflow-y: auto;
  margin-top: -2px;
`;

const FilterSection = styled.div`
  padding: 8px 20px;
  background-color: transparent;
  margin-bottom: 8px;
`;

const FilterDropdowns = styled.div`
  display: flex;
  gap: 6px;
  align-items: center;
`;

const FilterDropdown = styled.button<{ $isActive?: boolean }>`
  flex: 1;
  padding: 8px 14px;
  border: 1px solid ${({ $isActive }) => $isActive ? '#2D5F4F' : '#ddd'};
  border-radius: 8px;
  background: white;
  color: ${({ $isActive }) => $isActive ? '#2D5F4F' : '#333'};
  font-size: 12px;
  font-weight: ${({ $isActive }) => $isActive ? '600' : '500'};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.2s ease;
  height: 40px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  &:hover {
    border-color: #2D5F4F;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    transform: translateY(-1px);
  }
  
  &::after {
    content: '▼';
    font-size: 8px;
    margin-left: 6px;
    color: ${({ $isActive }) => $isActive ? '#2D5F4F' : '#666'};
  }
`;

const SearchFilterButton = styled.button<{ $isActive?: boolean }>`
  width: 40px;
  height: 40px;
  border: 1px solid ${({ $isActive }) => $isActive ? '#2D5F4F' : '#ddd'};
  border-radius: 8px;
  background: white;
  color: ${({ $isActive }) => $isActive ? '#2D5F4F' : '#666'};
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  &:hover {
    border-color: #2D5F4F;
    color: #2D5F4F;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    transform: translateY(-1px);
  }
`;

const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 8px 6px;
  margin-bottom: 12px;
  padding: 0 4px;
  justify-items: center;
  align-items: center;
  
  /* Ensure equal distribution in 4x2 grid */
  width: 100%;
  max-width: 340px;
  margin: 0 auto 12px auto;
`;

const CategoryCard = styled.div<{ $isSelected?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 6px 3px;
  border-radius: 12px;
  width: 100%;
  min-height: 68px;
  
  &:hover {
    background-color: rgba(45, 95, 79, 0.05);
    transform: translateY(-1px);
  }
  
  ${({ $isSelected }) => $isSelected && `
    background-color: rgba(45, 95, 79, 0.1);
    transform: translateY(-1px);
  `}
`;

const CategoryIcon = styled.div<{ $color: string; $isSelected?: boolean }>`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${({ $color, $isSelected }) => 
    $isSelected 
      ? `linear-gradient(135deg, ${$color}, ${$color}dd)` 
      : `linear-gradient(135deg, ${$color}22, ${$color}44)`
  };
  border: 2px solid ${({ $color, $isSelected }) => $isSelected ? $color : `${$color}55`};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  transition: all 0.2s ease;
  flex-shrink: 0;
`;

const CategoryLabel = styled.span<{ $isSelected?: boolean }>`
  font-size: 11px;
  color: ${({ $isSelected }) => $isSelected ? '#2D5F4F' : '#666'};
  font-weight: ${({ $isSelected }) => $isSelected ? '600' : '500'};
  text-align: center;
  line-height: 1.2;
  max-width: 70px;
  overflow-wrap: break-word;
`;

const ActiveFiltersBar = styled.div`
  padding: 6px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  font-size: 12px;
  color: #666;
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 18px;
  margin-bottom: 10px;
`;

const FilterContent = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
`;

const FilterBadge = styled.span`
  background: #e3f2fd;
  color: #1976d2;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  white-space: nowrap;
`;

const ClearFiltersButton = styled.button`
  background: transparent;
  color: #666;
  font-size: 12px;
  padding: 4px 8px;
  border: 1px solid #DDD;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  
  &:hover {
    background: #E0E0E0;
    color: #333;
  }
`;

const SuggestedEventsSection = styled.div`
  margin-top: 6px;
`;


const CompactEventCard = styled.div`
  background: #FFFFFF;
  border-radius: 10px;
  padding: 12px;
  margin-bottom: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  border: 1px solid #e9ecef;
  width: 100%;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  
  &:hover {
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.12);
    transform: translateY(-1px);
  }
`;

const CompactEventHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
`;

const HighlightBanner = styled.div`
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  background: linear-gradient(90deg, #FF6B6B, #FF8E8E, #FFB347);
  color: white;
  font-size: 11px;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 10px 10px 0 0;
  text-align: center;
  animation: bannerShimmer 2s ease-in-out infinite;
  
  @keyframes bannerShimmer {
    0%, 100% { background: linear-gradient(90deg, #FF6B6B, #FF8E8E, #FFB347); }
    50% { background: linear-gradient(90deg, #FFB347, #FF6B6B, #FF8E8E); }
  }
`;

const CategoryBadge = styled.div<{ color: string }>`
  background: ${({ color }) => color};
  color: white;
  padding: 4px 10px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const PriceDisplay = styled.div<{ color: string }>`
  background: ${({ color }) => color};
  color: white;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
`;

const EventTitleRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
`;

const CompactEventTitle = styled.h4`
  margin: 0;
  font-size: 16px;
  font-weight: bold;
  color: #333;
  line-height: 1.2;
  flex: 1;
`;

const TitlePoints = styled.span`
  font-size: 12px;
  color: #999;
  font-weight: 500;
`;

const EventBio = styled.div`
  font-size: 12px;
  color: #999;
  line-height: 1.3;
  margin-bottom: 6px;
`;

const EventDetailsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 6px;
  font-size: 12px;
  color: #666;
  flex-wrap: wrap;
`;

const EventDetailItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #666;
`;

const CompactEventActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
`;

const ParticipantsInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #999;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const PayButton = styled.button<{ bgColor?: string }>`
  background: ${({ bgColor }) => bgColor || '#FF6B6B'};
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const MoreButton = styled.button`
  background: white;
  color: #2D5F4F;
  border: 1px solid #2D5F4F;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #2D5F4F;
    color: white;
  }
`;

const ConfirmationModal = styled.div<{ show: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: ${({ show }) => show ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin: 20px;
  max-width: 320px;
  width: 100%;
`;

const ModalTitle = styled.h3`
  margin: 0 0 12px 0;
  font-size: 18px;
  font-weight: bold;
  color: #2D5F4F;
  text-align: center;
`;

const ModalText = styled.p`
  margin: 0 0 20px 0;
  font-size: 14px;
  color: #666;
  text-align: center;
  line-height: 1.4;
`;

const ModalButtons = styled.div`
  display: flex;
  gap: 12px;
`;

const ModalButton = styled.button<{ primary?: boolean }>`
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  
  ${({ primary }) => primary ? `
    background-color: #2D5F4F;
    color: white;
    
    &:hover {
      background-color: #1F4A3A;
    }
  ` : `
    background-color: #F8F9FA;
    color: #666;
    
    &:hover {
      background-color: #E9ECEF;
    }
  `}
`;

// Filter Modal Styles
const FilterModal = styled.div<{ show: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: ${({ show }) => show ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 1001;
`;

const FilterModalContent = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin: 20px;
  max-width: 340px;
  width: 100%;
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
  font-weight: bold;
  color: #2D5F4F;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  color: #666;
  cursor: pointer;
  padding: 0;
  
  &:hover {
    color: #333;
  }
`;

const FilterList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const FilterItem = styled.div<{ $isSelected?: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid ${({ $isSelected }) => $isSelected ? '#2D5F4F' : '#e9ecef'};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${({ $isSelected }) => $isSelected ? '#f8f9fa' : 'white'};
  
  &:hover {
    border-color: #2D5F4F;
    background: #f8f9fa;
  }
`;

const CheckBox = styled.div<{ $isChecked?: boolean }>`
  width: 20px;
  height: 20px;
  border: 2px solid ${({ $isChecked }) => $isChecked ? '#2D5F4F' : '#ccc'};
  border-radius: 4px;
  background: ${({ $isChecked }) => $isChecked ? '#2D5F4F' : 'white'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
  transition: all 0.2s ease;
`;

const FilterItemText = styled.span`
  flex: 1;
  font-size: 14px;
  color: #333;
`;

const FilterItemCount = styled.span`
  font-size: 12px;
  color: #666;
  background: #f8f9fa;
  padding: 2px 6px;
  border-radius: 12px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  font-size: 14px;
  margin-bottom: 16px;
  
  &:focus {
    outline: none;
    border-color: #2D5F4F;
  }
`;

// ================================
// PAYMENT & CANCELLATION STYLED COMPONENTS
// ================================

const PaymentButton = styled.button`
  background: linear-gradient(135deg, #FF6B6B, #FF8E8E);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s ease;
  
  &:hover {
    background: linear-gradient(135deg, #FF5252, #FF7979);
    transform: translateY(-1px);
  }
`;

const JoinButton = styled.button`
  background-color: #2D5F4F;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #1F4A3A;
  }
`;

const CancelButton = styled.button<{ $refundPercentage?: number }>`
  background: ${({ $refundPercentage }) => 
    $refundPercentage === 100 ? 'linear-gradient(135deg, #FF9800, #FFB74D)' :
    $refundPercentage === 50 ? 'linear-gradient(135deg, #FF5722, #FF7043)' :
    'linear-gradient(135deg, #757575, #9E9E9E)'
  };
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s ease;
  
  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }
`;


const CancelModal = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin: 0 auto;
  max-width: 320px;
  width: 100%;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
`;

const CancelModalContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const RefundInfo = styled.div<{ $percentage: number }>`
  background: ${({ $percentage }) => 
    $percentage === 100 ? '#E8F5E8' :
    $percentage === 50 ? '#FFF3E0' :
    '#FAFAFA'
  };
  border-radius: 8px;
  padding: 12px;
  margin: 16px 0;
  border-left: 4px solid ${({ $percentage }) => 
    $percentage === 100 ? '#4CAF50' :
    $percentage === 50 ? '#FF9800' :
    '#9E9E9E'
  };
`;

const FilterModalOverlay = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: ${({ isOpen }) => isOpen ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
`;

const FilterActions = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 20px;
`;

const FilterButton = styled.button`
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  background-color: #2D5F4F;
  color: white;
  
  &:hover {
    background-color: #1F4A3A;
  }
`;

const ClearButton = styled.button`
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  background-color: #F8F9FA;
  color: #666;
  
  &:hover {
    background-color: #E9ECEF;
  }
`;

// ================================
// INTERFACES AND TYPES
// ================================

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface EventData {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: string;
  hostName: string;
  participantCount: number;
  maxParticipants: number;
  pointsReward: number;
  price?: number;
  variant: 'free' | 'paid' | 'cafe' | 'volunteer';
  // Enhanced payment fields
  requiresPayment?: boolean;
  paymentAmount?: number;
  type?: 'SOCIAL' | 'SPORTS' | 'TRIP' | 'ILM' | 'CAFE_MEETUP' | 'VOLUNTEER' | 'MONTHLY_EVENT' | 'LOCAL_TRIP';
}

interface UserEventParticipation {
  eventId: string;
  userId: string;
  joinedAt: Date;
  paymentAmount: number;
  paymentId: string;
  status: 'joined' | 'cancelled';
  canCancel: boolean;
  refundPercentage: number;
}

// ================================
// CONSTANTS
// ================================

const categories: Category[] = [
  { id: 'social', name: 'Social Events', icon: '🤝', color: '#87CEEB' },
  { id: 'cafe', name: 'Cafe Meetups', icon: '☕', color: '#D2B48C' },
  { id: 'ilm', name: 'Ilm Initiative', icon: '📚', color: '#DDA0DD' },
  { id: 'donate', name: 'Donate', icon: '🤲', color: '#F0E68C' },
  { id: 'trips', name: 'Trips', icon: '✈️', color: '#90EE90' },
  { id: 'communities', name: 'Communities', icon: '🏘️', color: '#DDA0DD' },
  { id: 'sukan', name: 'Sukan Squad', icon: '🏸', color: '#F08080' },
  { id: 'volunteer', name: 'Volunteer', icon: '🌱', color: '#98FB98' },
];

const mockEvents: EventData[] = [
  {
    id: '1',
    title: 'BerseMinton',
    description: 'Professional badminton coaching with equipment provided',
    date: 'May 18',
    time: '8:00 AM',
    location: 'Shah Alam Sports Complex',
    category: 'sukan',
    hostName: 'Sukan Squad',
    participantCount: 8,
    maxParticipants: 20,
    pointsReward: 4,
    price: 12,
    variant: 'paid'
  },
  {
    id: '2',
    title: 'Coffee & Cultural Exchange',
    description: 'Meet diverse Muslims and share cultural experiences',
    date: 'May 20',
    time: '7:00 PM',
    location: 'KLCC Mesra Cafe',
    category: 'social',
    hostName: 'Ahmad Rahman',
    participantCount: 15,
    maxParticipants: 25,
    pointsReward: 3,
    variant: 'free'
  },
  {
    id: '3',
    title: 'Monday Morning Coffee',
    description: 'Casual meetup for working professionals',
    date: 'May 22',
    time: '8:30 AM',
    location: 'Damansara Heights',
    category: 'cafe',
    hostName: 'Sarah Khalil',
    participantCount: 6,
    maxParticipants: 12,
    pointsReward: 2,
    variant: 'cafe'
  },
  {
    id: '4',
    title: 'Islamic Finance Workshop',
    description: 'Learn Sharia-compliant investment strategies',
    date: 'May 25',
    time: '2:00 PM',
    location: 'IIUM Gombak',
    category: 'ilm',
    hostName: 'Dr. Abdullah',
    participantCount: 12,
    maxParticipants: 30,
    pointsReward: 5,
    price: 25,
    variant: 'paid'
  },
  {
    id: '5',
    title: 'Charity Fun Run',
    description: 'Support orphanages while staying fit',
    date: 'May 28',
    time: '6:00 AM',
    location: 'Titiwangsa Park',
    category: 'donate',
    hostName: 'Muslim Runners',
    participantCount: 25,
    maxParticipants: 100,
    pointsReward: 4,
    price: 35,
    variant: 'paid'
  },
  {
    id: '6',
    title: 'Cameron Highlands Trek',
    description: 'Mountain hiking with halal food stops',
    date: 'Jun 2',
    time: '5:00 AM',
    location: 'Cameron Highlands',
    category: 'trips',
    hostName: 'Adventure Seekers',
    participantCount: 8,
    maxParticipants: 15,
    pointsReward: 6,
    price: 85,
    variant: 'paid'
  },
  {
    id: '7',
    title: 'Weekend Flea Market',
    description: 'Community marketplace for local businesses',
    date: 'May 26',
    time: '10:00 AM',
    location: 'Shah Alam Mall',
    category: 'communities',
    hostName: 'Local Vendors',
    participantCount: 40,
    maxParticipants: 100,
    pointsReward: 2,
    variant: 'free'
  },
  {
    id: '8',
    title: 'Teaching English',
    description: 'Help refugee children with English lessons',
    date: 'May 24',
    time: '3:00 PM',
    location: 'Ampang Community Center',
    category: 'volunteer',
    hostName: 'Volunteer Network',
    participantCount: 5,
    maxParticipants: 10,
    pointsReward: 4,
    variant: 'volunteer'
  },
  // CAFE MEETUP EVENTS (3)
  {
    id: '9',
    title: 'Wednesday Coffee Talks at Suria KLCC',
    description: 'Midweek coffee discussions and networking',
    date: 'May 8',
    time: '10:00 AM',
    location: 'Suria KLCC',
    category: 'cafe',
    hostName: 'Nora Fatimah',
    participantCount: 6,
    maxParticipants: 15,
    pointsReward: 3,
    variant: 'cafe'
  },
  {
    id: '10',
    title: 'Friday Morning Brew at The Grind Damansara',
    description: 'Start your Friday with great coffee and conversation',
    date: 'May 10',
    time: '8:30 AM',
    location: 'The Grind Damansara',
    category: 'cafe',
    hostName: 'Rahman Hafiz',
    participantCount: 14,
    maxParticipants: 20,
    pointsReward: 4,
    variant: 'cafe'
  },
  {
    id: '11',
    title: 'Sunday Chill at Common Man Coffee Roasters',
    description: 'Relaxed Sunday afternoon coffee meetup',
    date: 'May 12',
    time: '3:00 PM',
    location: 'Petaling Jaya',
    category: 'cafe',
    hostName: 'Laila Maisarah',
    participantCount: 8,
    maxParticipants: 12,
    pointsReward: 3,
    variant: 'cafe'
  },
  // SOCIAL EVENTS (4)
  {
    id: '12',
    title: 'BerseMuka Cultural Night',
    description: 'Celebrate diverse Malaysian Muslim cultures',
    date: 'May 14',
    time: '7:00 PM',
    location: 'Dewan Komuniti Shah Alam',
    category: 'social',
    hostName: 'Zara Aminah',
    participantCount: 20,
    maxParticipants: 50,
    pointsReward: 5,
    variant: 'free'
  },
  {
    id: '13',
    title: 'Board Games & Chill Evening',
    description: 'Fun board games night with fellow Muslims',
    date: 'May 16',
    time: '6:00 PM',
    location: 'Mid Valley Megamall',
    category: 'social',
    hostName: 'Farid Ikmal',
    participantCount: 12,
    maxParticipants: 16,
    pointsReward: 4,
    variant: 'free'
  },
  {
    id: '14',
    title: 'BerseMakan Food Adventure Bukit Bintang',
    description: 'Explore halal food gems in Bukit Bintang',
    date: 'May 19',
    time: '1:00 PM',
    location: 'Bukit Bintang KL',
    category: 'social',
    hostName: 'Halim Syafiq',
    participantCount: 18,
    maxParticipants: 25,
    pointsReward: 6,
    variant: 'free'
  },
  {
    id: '15',
    title: 'Art Jamming Session at Publika',
    description: 'Creative art session for Muslim artists',
    date: 'May 21',
    time: '2:30 PM',
    location: 'Publika Mont Kiara',
    category: 'social',
    hostName: 'Aina Sofia',
    participantCount: 11,
    maxParticipants: 15,
    pointsReward: 5,
    variant: 'free'
  },
  // TRIP EVENTS (3)
  {
    id: '16',
    title: 'Highland Adventure to Cameron Highlands',
    description: '3-day mountain adventure with halal accommodations',
    date: 'May 24-26',
    time: '3 Days',
    location: 'Cameron Highlands Pahang',
    category: 'trips',
    hostName: 'Azlan Ibrahim',
    participantCount: 8,
    maxParticipants: 12,
    pointsReward: 10,
    price: 150,
    variant: 'paid'
  },
  {
    id: '17',
    title: 'Beach Getaway to Langkawi Island',
    description: '3-day tropical island retreat',
    date: 'Jun 1-3',
    time: '3 Days',
    location: 'Langkawi Kedah',
    category: 'trips',
    hostName: 'Mira Rania',
    participantCount: 15,
    maxParticipants: 20,
    pointsReward: 12,
    price: 280,
    variant: 'paid'
  },
  {
    id: '18',
    title: 'Cultural Heritage Trip to Terengganu',
    description: '2-day Islamic heritage and culture exploration',
    date: 'Jun 8-9',
    time: '2 Days',
    location: 'Kuala Terengganu',
    category: 'trips',
    hostName: 'Hasan Nabil',
    participantCount: 10,
    maxParticipants: 15,
    pointsReward: 7,
    price: 120,
    variant: 'paid'
  },
  // LOCAL GUIDE EVENTS (3)
  {
    id: '19',
    title: 'Historical Walk in Georgetown Penang',
    description: 'Guided tour of Islamic heritage sites',
    date: 'May 25',
    time: '9:00 AM',
    location: 'Georgetown Penang',
    category: 'communities',
    hostName: 'Khairul Anuar',
    participantCount: 7,
    maxParticipants: 12,
    pointsReward: 4,
    variant: 'free'
  },
  {
    id: '20',
    title: 'Rice Field Tour in Sekinchan',
    description: 'Early morning rice field exploration',
    date: 'May 28',
    time: '7:00 AM',
    location: 'Sekinchan Selangor',
    category: 'communities',
    hostName: 'Salmah Fadzil',
    participantCount: 12,
    maxParticipants: 18,
    pointsReward: 6,
    variant: 'free'
  },
  {
    id: '21',
    title: 'Mangrove & Eagle Watching in Kuala Selangor',
    description: 'Nature tour with wildlife observation',
    date: 'May 30',
    time: '4:00 PM',
    location: 'Kuala Selangor Nature Park',
    category: 'communities',
    hostName: 'Rafiq Zainal',
    participantCount: 5,
    maxParticipants: 10,
    pointsReward: 5,
    variant: 'free'
  },
  // SPORTS EVENTS (3)
  {
    id: '22',
    title: 'BerseBola Sunday Football League',
    description: 'Weekly football matches for Muslim players',
    date: 'May 26',
    time: '6:00 PM',
    location: 'Padang Astaka Shah Alam',
    category: 'sukan',
    hostName: 'Danial Hakim',
    participantCount: 16,
    maxParticipants: 22,
    pointsReward: 5,
    variant: 'free'
  },
  {
    id: '23',
    title: 'Morning Jog at KLCC Park',
    description: 'Healthy morning jog with the community',
    date: 'May 27',
    time: '6:30 AM',
    location: 'KLCC Park Kuala Lumpur',
    category: 'sukan',
    hostName: 'Lina Azira',
    participantCount: 9,
    maxParticipants: 15,
    pointsReward: 4,
    variant: 'free'
  },
  {
    id: '24',
    title: 'Swimming Session at National Aquatic Centre',
    description: 'Professional swimming training session',
    date: 'May 29',
    time: '7:00 PM',
    location: 'Bukit Jalil National Stadium',
    category: 'sukan',
    hostName: 'Irfan Musa',
    participantCount: 11,
    maxParticipants: 16,
    pointsReward: 6,
    price: 15,
    variant: 'paid'
  },
  // VOLUNTEER EVENTS (3)
  {
    id: '25',
    title: 'Volunteer at Rumah Kasih Orphanage',
    description: 'Help and spend time with orphaned children',
    date: 'May 31',
    time: '9:00 AM',
    location: 'Ampang Selangor',
    category: 'volunteer',
    hostName: 'Rumah Kasih',
    participantCount: 13,
    maxParticipants: 20,
    pointsReward: 8,
    variant: 'volunteer'
  },
  {
    id: '26',
    title: 'Elderly Care Visit Program',
    description: 'Visit and care for elderly residents',
    date: 'Jun 2',
    time: '10:00 AM',
    location: 'Cheras Old Folks Home',
    category: 'volunteer',
    hostName: 'Nurul Hidayah',
    participantCount: 8,
    maxParticipants: 12,
    pointsReward: 7,
    variant: 'volunteer'
  },
  {
    id: '27',
    title: 'Food Distribution Drive for Asnaf',
    description: 'Distribute meals to those in need',
    date: 'Jun 5',
    time: '8:00 AM',
    location: 'Masjid Jamek KL',
    category: 'volunteer',
    hostName: 'Zakat Melaka',
    participantCount: 15,
    maxParticipants: 25,
    pointsReward: 6,
    variant: 'volunteer'
  },
  // ILM INITIATIVE EVENTS (4)
  {
    id: '28',
    title: 'Ramadan Preparation Workshop',
    description: 'Prepare spiritually and practically for Ramadan',
    date: 'Jun 7',
    time: '8:00 PM',
    location: 'Masjid Wilayah KL',
    category: 'ilm',
    hostName: 'Ustaz Ahmad',
    participantCount: 25,
    maxParticipants: 40,
    pointsReward: 6,
    variant: 'free'
  },
  {
    id: '29',
    title: 'Islamic Finance & Business Ethics',
    description: 'Learn halal business practices and finance',
    date: 'Jun 9',
    time: '2:00 PM',
    location: 'IIUM Gombak',
    category: 'ilm',
    hostName: 'Faizal Husni',
    participantCount: 18,
    maxParticipants: 30,
    pointsReward: 5,
    variant: 'free'
  },
  {
    id: '30',
    title: 'Family Life in Islam Workshop',
    description: 'Building strong Muslim families',
    date: 'Jun 12',
    time: '10:00 AM',
    location: 'Masjid Negara KL',
    category: 'ilm',
    hostName: 'Khadijah Sarah',
    participantCount: 22,
    maxParticipants: 35,
    pointsReward: 7,
    variant: 'free'
  },
  {
    id: '31',
    title: 'Quran Recitation & Tajweed Class',
    description: 'Improve your Quran recitation skills',
    date: 'Jun 14',
    time: '8:30 PM',
    location: 'Masjid Al-Hidayah Shah Alam',
    category: 'ilm',
    hostName: 'Mohd Hafiz',
    participantCount: 14,
    maxParticipants: 20,
    pointsReward: 4,
    variant: 'free'
  }
];

// ================================
// MAIN COMPONENT
// ================================

export const BerseConnectScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // ================================
  // STATE MANAGEMENT
  // ================================
  
  // Refs
  const eventRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  
  const [events] = useState<EventData[]>(mockEvents);
  const [filteredEvents, setFilteredEvents] = useState<EventData[]>(mockEvents);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // Filter state
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>('Malaysia');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Modal state
  const [showSportsModal, setShowSportsModal] = useState(false);
  const [showRegularModal, setShowRegularModal] = useState(false);
  const [showProfileSidebar, setShowProfileSidebar] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
  const [showJoinConfirmation, setShowJoinConfirmation] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [showInterestsModal, setShowInterestsModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);

  // Payment & Cancellation state
  const [userEvents, setUserEvents] = useState<UserEventParticipation[]>([]);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedEventForCancel, setSelectedEventForCancel] = useState<string | null>(null);
  const [showSportsPaymentModal, setShowSportsPaymentModal] = useState(false);
  const [selectedSportsEvent, setSelectedSportsEvent] = useState<string | null>(null);
  
  // Highlighted event from URL parameters (for deep links)
  const location = useLocation();
  const [highlightedEvent, setHighlightedEvent] = useState<string | null>(null);


  // ================================
  // FILTER LOGIC
  // ================================

  // Get unique locations from all events
  const allLocations = Array.from(new Set(events.map(event => event.location))).sort();
  
  // Available countries
  const allCountries = ['Malaysia', 'Singapore', 'Indonesia', 'Thailand', 'Philippines', 'Brunei', 'Vietnam'];
  
  // Get unique interests (mapped to categories)
  const allInterests = categories.map(cat => ({ id: cat.id, name: cat.name }));

  // Apply filters whenever filter state changes
  useEffect(() => {
    applyFilters();
  }, [selectedCategory, selectedLocations, selectedCountry, selectedInterests, searchQuery, events]);

  // Initialize some sample user events for testing
  useEffect(() => {
    if (user && userEvents.length === 0) {
      const sampleUserEvents: UserEventParticipation[] = [
        {
          eventId: '1', // BerseMinton (paid sports event)
          userId: user.id || 'current-user-id',
          joinedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          paymentAmount: 12,
          paymentId: 'payment_123',
          status: 'joined',
          canCancel: true,
          refundPercentage: 100
        },
        {
          eventId: '2', // Coffee & Cultural Exchange (free event)
          userId: user.id || 'current-user-id',
          joinedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
          paymentAmount: 0,
          paymentId: '',
          status: 'joined',
          canCancel: true,
          refundPercentage: 0
        }
      ];
      setUserEvents(sampleUserEvents);
    }
  }, [user, userEvents.length]);

  const applyFilters = () => {
    let filtered = [...events];

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(event => event.category === selectedCategory);
    }

    // Location filter
    if (selectedLocations.length > 0) {
      filtered = filtered.filter(event => 
        selectedLocations.some(location => 
          event.location.toLowerCase().includes(location.toLowerCase())
        )
      );
    }

    // Country filter (most events are Malaysia-based)
    if (selectedCountry !== 'Malaysia') {
      // For demo purposes, filter out events that don't match selected country
      // In a real app, events would have country properties
      filtered = filtered.filter(event => {
        // Simple country matching based on location
        const location = event.location.toLowerCase();
        if (selectedCountry === 'Singapore') {
          return location.includes('singapore') || location.includes('sg');
        }
        // For other countries, show no events (since all events are Malaysia-based)
        return false;
      });
    }

    // Interest filter (maps to categories)
    if (selectedInterests.length > 0) {
      filtered = filtered.filter(event => 
        selectedInterests.includes(event.category)
      );
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(query) ||
        event.description.toLowerCase().includes(query) ||
        event.hostName.toLowerCase().includes(query) ||
        event.location.toLowerCase().includes(query)
      );
    }

    setFilteredEvents(filtered);
  };

  // Handle URL parameters for event highlighting (deep links)
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const highlightParam = urlParams.get('highlight');
    if (highlightParam) {
      setHighlightedEvent(highlightParam);
      console.log(`✨ Highlighting event from URL: ${highlightParam}`);
      
      // Clear the URL parameter after a delay to avoid persistent highlighting
      setTimeout(() => {
        setHighlightedEvent(null);
      }, 5000);
    }
  }, [location.search]);

  // ================================
  // EVENT HANDLERS
  // ================================

  const handleCategorySelect = (categoryId: string) => {
    if (selectedCategory === categoryId) {
      setSelectedCategory('');
    } else {
      setSelectedCategory(categoryId);
    }
  };

  const handlePayButtonClick = (event: EventData, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setSelectedEvent(event);

    if (event.variant === 'paid' && event.category === 'sukan') {
      setShowSportsModal(true);
    } else if (event.variant === 'cafe') {
      navigate('/book-meetup');
    } else if (event.variant === 'paid') {
      setShowRegularModal(true);
    } else {
      setShowJoinConfirmation(true);
    }
  };

  const handleMoreButtonClick = (event: EventData, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/event/${event.id}`);
  };

  const handleCloseSportsModal = () => {
    setShowSportsModal(false);
    setSelectedEvent(null);
  };

  const handleSportsPaymentSuccess = (eventId: string, paymentAmount: number, paymentId: string) => {
    // Add user to event after successful payment
    const newParticipation: UserEventParticipation = {
      eventId,
      userId: user?.id || 'current-user-id',
      joinedAt: new Date(),
      paymentAmount,
      paymentId,
      status: 'joined',
      canCancel: true,
      refundPercentage: 100 // Initially 100% since just joined
    };
    setUserEvents(prev => [...prev, newParticipation]);
    
    // Close the modal
    setShowSportsModal(false);
    setSelectedEvent(null);
  };

  const handleCloseRegularModal = () => {
    setShowRegularModal(false);
    setSelectedEvent(null);
  };

  const handleRegularPaymentSuccess = (eventId: string, paymentAmount: number, paymentId: string) => {
    // Add user to event after successful payment
    const newParticipation: UserEventParticipation = {
      eventId,
      userId: user?.id || 'current-user-id',
      joinedAt: new Date(),
      paymentAmount,
      paymentId,
      status: 'joined',
      canCancel: true,
      refundPercentage: 100 // Initially 100% since just joined
    };
    setUserEvents(prev => [...prev, newParticipation]);
    
    // Close the modal
    setShowRegularModal(false);
    setSelectedEvent(null);
  };

  const confirmJoinEvent = () => {
    if (selectedEvent) {
      // Add user to event
      const newParticipation: UserEventParticipation = {
        eventId: selectedEvent.id,
        userId: user?.id || 'current-user-id',
        joinedAt: new Date(),
        paymentAmount: 0,
        paymentId: '',
        status: 'joined',
        canCancel: true,
        refundPercentage: 0
      };
      setUserEvents(prev => [...prev, newParticipation]);
    }
    
    setShowJoinConfirmation(false);
    setSelectedEvent(null);
    alert('Successfully joined the event!');
  };

  const cancelJoinEvent = () => {
    setShowJoinConfirmation(false);
    setSelectedEvent(null);
  };

  // Filter handlers
  const handleLocationFilter = () => {
    setShowLocationModal(true);
  };

  const handleCountryFilter = () => {
    setShowCountryModal(true);
  };

  const handleInterestsFilter = () => {
    setShowInterestsModal(true);
  };

  const handleSearchFilter = () => {
    setShowSearchModal(true);
  };

  const toggleLocation = (location: string) => {
    setSelectedLocations(prev => 
      prev.includes(location) 
        ? prev.filter(l => l !== location)
        : [...prev, location]
    );
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const selectCountry = (country: string) => {
    setSelectedCountry(country);
    setShowCountryModal(false);
  };

  const clearAllFilters = () => {
    setSelectedCategory('');
    setSelectedLocations([]);
    setSelectedCountry('Malaysia');
    setSelectedInterests([]);
    setSearchQuery('');
  };

  // ================================
  // PAYMENT & CANCELLATION EVENT HANDLERS
  // ================================

  const handleSportsPayment = (eventId: string) => {
    console.log('Opening payment modal for event:', eventId);
    const event = events.find(e => e.id === eventId);
    setSelectedEvent(event || null);
    
    // Check if it's a sports event
    if (event && (event.category === 'sukan' || isSportsEvent(event.type || event.category, event.title))) {
      setShowSportsModal(true);
    } else {
      // Regular paid event
      setShowRegularModal(true);
    }
  };

  const handleRegularJoin = (eventId: string) => {
    console.log('Opening join confirmation for free event:', eventId);
    const event = events.find(e => e.id === eventId);
    setSelectedEvent(event || null);
    setShowJoinConfirmation(true);
  };

  const handleCancelClick = (eventId: string) => {
    setSelectedEventForCancel(eventId);
    setShowCancelModal(true);
  };

  const handleConfirmCancel = async (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    const userEventData = getUserEventData(eventId);
    const refundPercentage = calculateRefundPercentage(event?.date || '');
    const refundAmount = getRefundAmount(userEventData?.paymentAmount || event?.price || 0, refundPercentage);
    
    try {
      // Process refund API call here
      // await eventService.cancelEvent(eventId, { refundAmount, refundPercentage });
      
      // Update local state
      setUserEvents(prev => 
        prev.map(ue => 
          ue.eventId === eventId 
            ? { ...ue, status: 'cancelled' as const }
            : ue
        )
      );
      
      setShowCancelModal(false);
      setSelectedEventForCancel(null);
      
      // Show success message
      if (refundAmount > 0) {
        alert(`Event cancelled. Refund of RM ${refundAmount.toFixed(2)} will be processed within 3-5 business days.`);
      } else {
        alert('Event cancelled successfully.');
      }
      
    } catch (error) {
      console.error('Cancellation failed:', error);
      alert('Failed to cancel event. Please try again.');
    }
  };

  const handleCancelFreeEvent = (eventId: string) => {
    // Direct cancellation for free events
    setUserEvents(prev => 
      prev.map(ue => 
        ue.eventId === eventId 
          ? { ...ue, status: 'cancelled' as const }
          : ue
      )
    );
    alert('Successfully left the event.');
  };

  // ================================
  // UTILITY FUNCTIONS
  // ================================

  const getCategoryInfo = (categoryId: string): Category => {
    return categories.find(c => c.id === categoryId) || categories[0];
  };

  const formatPrice = (event: EventData): string => {
    if (event.price && event.price > 0) {
      return `RM ${event.price}`;
    }
    if (event.variant === 'cafe') {
      return 'Own drinks';
    }
    return 'FREE';
  };

  const getButtonText = (event: EventData): string => {
    if (event.variant === 'paid') return 'Pay';
    if (event.variant === 'cafe') return 'Book';
    if (event.variant === 'volunteer') return 'Help';
    return 'Join';
  };

  // ================================
  // PAYMENT & CANCELLATION HELPER FUNCTIONS
  // ================================

  const isSportsEvent = (eventType: string, eventTitle: string): boolean => {
    return eventType === 'SPORTS' || 
           eventTitle.toLowerCase().includes('sukan') || 
           eventTitle.toLowerCase().includes('sport') ||
           eventTitle.toLowerCase().includes('badminton') ||
           eventTitle.toLowerCase().includes('football') ||
           eventTitle.toLowerCase().includes('berseminton');
  };

  const calculateRefundPercentage = (eventDate: string): number => {
    const eventDateTime = new Date(eventDate);
    const now = new Date();
    const hoursUntilEvent = (eventDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (hoursUntilEvent > 24) {
      return 100; // Full refund
    } else if (hoursUntilEvent > 0) {
      return 50; // 50% refund (same day or <24 hours)
    } else {
      return 0; // Event already started/passed
    }
  };

  const getRefundAmount = (originalAmount: number, refundPercentage: number): number => {
    return (originalAmount * refundPercentage) / 100;
  };

  const isUserJoined = (eventId: string): boolean => {
    return userEvents.some(ue => ue.eventId === eventId && ue.status === 'joined');
  };

  const getUserEventData = (eventId: string): UserEventParticipation | null => {
    return userEvents.find(ue => ue.eventId === eventId && ue.status === 'joined') || null;
  };

  // ================================
  // COMBINED BUTTON LOGIC
  // ================================

  const getEventActionButton = (event: EventData) => {
    const userEventData = getUserEventData(event.id);
    const isJoined = isUserJoined(event.id);
    
    // If user already joined
    if (isJoined) {
      if (event.requiresPayment || (event.price && event.price > 0)) {
        const refundPercentage = calculateRefundPercentage(event.date);
        const refundAmount = getRefundAmount(userEventData?.paymentAmount || event.price || 0, refundPercentage);
        
        return (
          <CancelButton 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleCancelClick(event.id);
            }}
            $refundPercentage={refundPercentage}
          >
            {refundPercentage > 0 ? (
              <>❌ Cancel (RM {refundAmount.toFixed(0)} refund)</>
            ) : (
              <>❌ Cancel (No refund)</>
            )}
          </CancelButton>
        );
      } else {
        return (
          <CancelButton 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleCancelFreeEvent(event.id);
            }}
          >
            ❌ Leave
          </CancelButton>
        );
      }
    }
    
    // If user hasn't joined yet
    if (event.variant === 'paid' || (event.price && event.price > 0) || event.requiresPayment) {
      return (
        <PaymentButton 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleSportsPayment(event.id);
          }}
        >
          💳 Pay & Join
        </PaymentButton>
      );
    } else {
      return (
        <JoinButton 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleRegularJoin(event.id);
          }}
        >
          Join
        </JoinButton>
      );
    }
  };


  // ================================
  // RENDER
  // ================================

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
          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              borderRadius: '12px',
              padding: '4px 8px 4px 4px',
              position: 'relative'
            }}
            onClick={() => {
              console.log('Profile icon clicked - opening sidebar');
              setShowProfileSidebar(true);
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(74, 103, 65, 0.1)';
              e.currentTarget.style.transform = 'translateX(2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.transform = 'translateX(0)';
            }}
          >
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
              <AvatarImage 
                src="https://images.unsplash.com/photo-1494790108755-2616b612b619?w=40&h=40&fit=crop&crop=face&auto=format" 
                alt="Profile" 
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement!.innerHTML = user?.fullName ? user.fullName.split(' ').map(n => n[0]).join('') : 'ZA';
                }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <div style={{ fontSize: '12px', color: '#999999', fontWeight: 'normal' }}>Build Communities & Friendship</div>
              <div style={{ fontSize: '18px', color: '#333333', fontWeight: '600' }}>BerseConnect</div>
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

      <FilterSection>
        <FilterDropdowns>
          <FilterDropdown 
            type="button"
            $isActive={selectedLocations.length > 0}
            onClick={handleLocationFilter}
          >
            {selectedLocations.length > 0 ? `Cities (${selectedLocations.length})` : 'All Cities'}
          </FilterDropdown>
          <FilterDropdown 
            type="button"
            $isActive={selectedCountry !== 'Malaysia'}
            onClick={handleCountryFilter}
          >
            {selectedCountry}
          </FilterDropdown>
          <FilterDropdown 
            type="button"
            $isActive={selectedInterests.length > 0}
            onClick={handleInterestsFilter}
          >
            {selectedInterests.length > 0 ? `Interests (${selectedInterests.length})` : 'Interests'}
          </FilterDropdown>
          <SearchFilterButton 
            type="button"
            $isActive={searchQuery.length > 0}
            onClick={handleSearchFilter}
            title={searchQuery ? `Searching: ${searchQuery}` : 'Search events, hosts, locations...'}
          >
            🔍
          </SearchFilterButton>
        </FilterDropdowns>
      </FilterSection>



      <Content>
        {/* Category Grid */}
        <CategoryGrid>
          {categories.map((category) => (
            <CategoryCard 
              key={category.id} 
              $isSelected={selectedCategory === category.id}
              onClick={() => handleCategorySelect(category.id)}
            >
              <CategoryIcon 
                $color={category.color} 
                $isSelected={selectedCategory === category.id}
              >
                {category.icon}
              </CategoryIcon>
              <CategoryLabel $isSelected={selectedCategory === category.id}>
                {category.name}
              </CategoryLabel>
            </CategoryCard>
          ))}
        </CategoryGrid>

        {/* Active Filters Bar */}
        {(selectedCategory || selectedLocations.length > 0 || selectedCountry !== 'Malaysia' || selectedInterests.length > 0 || searchQuery) && (
          <ActiveFiltersBar>
            <FilterContent>
              <span>Active filters:</span>
              {selectedCategory && (
                <FilterBadge>
                  {categories.find(c => c.id === selectedCategory)?.name}
                </FilterBadge>
              )}
              {selectedLocations.map(location => (
                <FilterBadge key={location}>
                  📍 {location}
                </FilterBadge>
              ))}
              {selectedCountry !== 'Malaysia' && (
                <FilterBadge>
                  🌍 {selectedCountry}
                </FilterBadge>
              )}
              {selectedInterests.map(interest => {
                const category = categories.find(c => c.id === interest);
                return (
                  <FilterBadge key={interest}>
                    {category?.icon} {category?.name}
                  </FilterBadge>
                );
              })}
              {searchQuery && (
                <FilterBadge>
                  🔍 "{searchQuery}"
                </FilterBadge>
              )}
            </FilterContent>
            <ClearFiltersButton onClick={clearAllFilters}>
              Clear Filters
            </ClearFiltersButton>
          </ActiveFiltersBar>
        )}

        {/* Events Section */}
        <SuggestedEventsSection>
          {filteredEvents.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px 20px', 
              color: '#666',
              background: '#f8f9fa',
              borderRadius: '12px',
              margin: '20px 0'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
              <h3 style={{ margin: '0 0 8px 0', color: '#333' }}>No events found</h3>
              <p style={{ margin: 0, fontSize: '14px' }}>
                Try adjusting your filters or search terms
              </p>
            </div>
          ) : (
            filteredEvents.map((event) => {
            const categoryInfo = getCategoryInfo(event.category);
            const isHighlighted = highlightedEvent === event.id;
            
            return (
              <CompactEventCard 
                key={event.id}
                $highlighted={isHighlighted}
                ref={(el) => eventRefs.current[event.id] = el}
              >
                {isHighlighted && (
                  <HighlightBanner>
                    ✨ Featured Event - Register Now!
                  </HighlightBanner>
                )}
                {/* Header Section */}
                <CompactEventHeader>
                  <CategoryBadge color={categoryInfo.color}>
                    {categoryInfo.icon} {categoryInfo.name} • {event.pointsReward} pts
                  </CategoryBadge>
                  
                  <PriceDisplay color={categoryInfo.color}>
                    {formatPrice(event)}
                  </PriceDisplay>
                </CompactEventHeader>

                {/* Title Section */}
                <EventTitleRow>
                  <CompactEventTitle style={{ 
                    color: isHighlighted ? '#2D5F4F' : undefined,
                    fontWeight: isHighlighted ? '700' : undefined
                  }}>
                    {event.title}
                    {isHighlighted && ' 🎯'}
                  </CompactEventTitle>
                  <TitlePoints>{event.pointsReward} pts</TitlePoints>
                </EventTitleRow>

                {/* Bio/Description Section */}
                <EventBio>
                  {event.description}
                </EventBio>
                
                {/* Event Details Row */}
                <EventDetailsRow>
                  <EventDetailItem>
                    <span>📅</span>
                    <span>{event.date} • {event.time}</span>
                  </EventDetailItem>
                  <EventDetailItem>
                    <span>📍</span>
                    <span>{event.location}</span>
                  </EventDetailItem>
                  {/* Show status if joined */}
                  {isUserJoined(event.id) && (
                    <EventDetailItem>
                      <span>✅</span>
                      <span>Joined</span>
                    </EventDetailItem>
                  )}
                </EventDetailsRow>

                {/* Bottom Row */}
                <CompactEventActions>
                  <ParticipantsInfo>
                    <span>👥</span>
                    <span>{event.participantCount}/{event.maxParticipants} joined</span>
                  </ParticipantsInfo>
                  
                  <ActionButtons>
                    {React.cloneElement(getEventActionButton(event), {
                      style: {
                        ...(getEventActionButton(event).props.style || {}),
                        background: isHighlighted && !isUserJoined(event.id) 
                          ? 'linear-gradient(135deg, #FF6B6B, #FF8E8E)' 
                          : undefined,
                        fontWeight: isHighlighted ? '600' : undefined,
                        transform: isHighlighted ? 'scale(1.02)' : undefined
                      },
                      children: isHighlighted && !isUserJoined(event.id) 
                        ? '🎯 Register Now' 
                        : getEventActionButton(event).props.children
                    })}
                    
                    <MoreButton
                      type="button"
                      onClick={(e) => handleMoreButtonClick(event, e)}
                    >
                      More
                    </MoreButton>
                  </ActionButtons>
                </CompactEventActions>
              </CompactEventCard>
            );
          }))}
        </SuggestedEventsSection>
      </Content>

      <MainNav 
        activeTab="connect"
        onTabPress={(tab) => {
          switch (tab) {
            case 'home': navigate('/dashboard'); break;
            case 'connect': navigate('/connect'); break;
            case 'match': navigate('/match'); break;
            case 'forum': navigate('/forum'); break;
          }
        }}
      />

      {/* Sports Event Booking Modal */}
      <SportsEventBookingModal
        isOpen={showSportsModal}
        onClose={handleCloseSportsModal}
        event={selectedEvent}
      />

      {/* Regular Event Registration Modal */}
      <EventRegistrationModal
        isOpen={showRegularModal}
        onClose={handleCloseRegularModal}
        event={selectedEvent ? {
          id: selectedEvent.id,
          title: selectedEvent.title,
          date: selectedEvent.date,
          time: selectedEvent.time,
          location: selectedEvent.location,
          included: ['Registration confirmation', 'Event materials', 'Networking opportunities'],
          spotsLeft: selectedEvent.maxParticipants - selectedEvent.participantCount,
          totalSpots: selectedEvent.maxParticipants,
          price: selectedEvent.price || 0,
          image: '/api/placeholder/400/200'
        } : null}
      />

      {/* Join Event Confirmation Modal */}
      <ConfirmationModal show={showJoinConfirmation}>
        <ModalContent>
          <ModalTitle>Join Event</ModalTitle>
          <ModalText>
            Are you sure you want to join <strong>"{selectedEvent?.title}"</strong>?
            <br /><br />
            📅 {selectedEvent?.date}<br />
            📍 {selectedEvent?.location}<br />
            👥 Hosted by {selectedEvent?.hostName}
          </ModalText>
          <ModalButtons>
            <ModalButton onClick={cancelJoinEvent}>Cancel</ModalButton>
            <ModalButton primary onClick={confirmJoinEvent}>Join Event</ModalButton>
          </ModalButtons>
        </ModalContent>
      </ConfirmationModal>

      {/* Location Filter Modal */}
      <FilterModal show={showLocationModal}>
        <FilterModalContent>
          <FilterModalHeader>
            <FilterModalTitle>Filter by Location</FilterModalTitle>
            <CloseButton onClick={() => setShowLocationModal(false)}>×</CloseButton>
          </FilterModalHeader>
          <FilterList>
            {allLocations.map(location => {
              const eventCount = events.filter(event => 
                event.location.toLowerCase().includes(location.toLowerCase())
              ).length;
              const isSelected = selectedLocations.includes(location);
              
              return (
                <FilterItem 
                  key={location}
                  $isSelected={isSelected}
                  onClick={() => toggleLocation(location)}
                >
                  <CheckBox $isChecked={isSelected}>
                    {isSelected && '✓'}
                  </CheckBox>
                  <FilterItemText>{location}</FilterItemText>
                  <FilterItemCount>{eventCount}</FilterItemCount>
                </FilterItem>
              );
            })}
          </FilterList>
        </FilterModalContent>
      </FilterModal>

      {/* Country Filter Modal */}
      <FilterModal show={showCountryModal}>
        <FilterModalContent>
          <FilterModalHeader>
            <FilterModalTitle>Select Country</FilterModalTitle>
            <CloseButton onClick={() => setShowCountryModal(false)}>×</CloseButton>
          </FilterModalHeader>
          <FilterList>
            {allCountries.map(country => {
              const eventCount = country === 'Malaysia' ? events.length : 0;
              const isSelected = selectedCountry === country;
              
              return (
                <FilterItem 
                  key={country}
                  $isSelected={isSelected}
                  onClick={() => selectCountry(country)}
                >
                  <CheckBox $isChecked={isSelected}>
                    {isSelected && '✓'}
                  </CheckBox>
                  <FilterItemText>
                    🌍 {country}
                  </FilterItemText>
                  <FilterItemCount>{eventCount}</FilterItemCount>
                </FilterItem>
              );
            })}
          </FilterList>
        </FilterModalContent>
      </FilterModal>

      {/* Interests Filter Modal */}
      <FilterModal show={showInterestsModal}>
        <FilterModalContent>
          <FilterModalHeader>
            <FilterModalTitle>Filter by Interests</FilterModalTitle>
            <CloseButton onClick={() => setShowInterestsModal(false)}>×</CloseButton>
          </FilterModalHeader>
          <FilterList>
            {allInterests.map(interest => {
              const eventCount = events.filter(event => event.category === interest.id).length;
              const isSelected = selectedInterests.includes(interest.id);
              const category = categories.find(c => c.id === interest.id);
              
              return (
                <FilterItem 
                  key={interest.id}
                  $isSelected={isSelected}
                  onClick={() => toggleInterest(interest.id)}
                >
                  <CheckBox $isChecked={isSelected}>
                    {isSelected && '✓'}
                  </CheckBox>
                  <FilterItemText>
                    {category?.icon} {interest.name}
                  </FilterItemText>
                  <FilterItemCount>{eventCount}</FilterItemCount>
                </FilterItem>
              );
            })}
          </FilterList>
        </FilterModalContent>
      </FilterModal>

      {/* Search Modal */}
      <FilterModal show={showSearchModal}>
        <FilterModalContent>
          <FilterModalHeader>
            <FilterModalTitle>Search Events</FilterModalTitle>
            <CloseButton onClick={() => setShowSearchModal(false)}>×</CloseButton>
          </FilterModalHeader>
          <SearchInput
            type="text"
            placeholder="Search events, hosts, locations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
          <ModalButtons>
            <ModalButton onClick={() => setShowSearchModal(false)}>
              Done
            </ModalButton>
          </ModalButtons>
        </FilterModalContent>
      </FilterModal>

      {/* Cancellation Modal */}
      <FilterModalOverlay isOpen={showCancelModal} onClick={() => setShowCancelModal(false)}>
        <CancelModal onClick={(e) => e.stopPropagation()}>
          <FilterModalHeader>
            <FilterModalTitle>Cancel Event</FilterModalTitle>
            <CloseButton onClick={() => setShowCancelModal(false)}>×</CloseButton>
          </FilterModalHeader>
          
          <CancelModalContent>
            {selectedEventForCancel && (() => {
              const event = events.find(e => e.id === selectedEventForCancel);
              const refundPercentage = calculateRefundPercentage(event?.date || '');
              const userEventData = getUserEventData(selectedEventForCancel);
              const refundAmount = getRefundAmount(userEventData?.paymentAmount || event?.price || 0, refundPercentage);
              
              return (
                <>
                  <h3 style={{ margin: '0 0 16px 0', color: '#333', fontSize: '18px' }}>{event?.title}</h3>
                  <RefundInfo $percentage={refundPercentage}>
                    <strong>Refund Policy:</strong><br/>
                    {refundPercentage === 100 && "✅ Full refund (>24 hours before event)"}
                    {refundPercentage === 50 && "⚠️ 50% refund (≤24 hours before event)"}
                    {refundPercentage === 0 && "❌ No refund (event already started)"}
                    <br/>
                    <strong>Refund Amount: RM {refundAmount.toFixed(2)}</strong>
                  </RefundInfo>
                  
                  <div style={{ 
                    fontSize: '14px', 
                    color: '#666', 
                    marginBottom: '16px',
                    lineHeight: '1.4'
                  }}>
                    📅 {event?.date}<br/>
                    📍 {event?.location}<br/>
                    👥 Hosted by {event?.hostName}
                  </div>
                  
                  <FilterActions>
                    <FilterButton 
                      onClick={() => handleConfirmCancel(selectedEventForCancel)}
                      style={{ 
                        background: refundPercentage > 0 ? '#FF5722' : '#9E9E9E' 
                      }}
                    >
                      Confirm Cancel
                    </FilterButton>
                    <ClearButton onClick={() => setShowCancelModal(false)}>
                      Keep Joined
                    </ClearButton>
                  </FilterActions>
                </>
              );
            })()}
          </CancelModalContent>
        </CancelModal>
      </FilterModalOverlay>

      <ProfileSidebar 
        isOpen={showProfileSidebar}
        onClose={() => setShowProfileSidebar(false)}
      />
    </Container>
  );
};




