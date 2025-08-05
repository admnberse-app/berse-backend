import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { StatusBar } from '../components/StatusBar/StatusBar';
import { BottomNav } from '../components/BottomNav';
import { useAuth } from '../contexts/AuthContext';
import { EventRegistrationModal } from '../components/EventRegistrationModal';
import { SportsEventBookingModal } from '../components/SportsEventBookingModal';
// import eventService from '@frontend-api/services/event.service';
// import { Event, EventType } from '@frontend-api/types';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.background.default};
  max-width: 393px;
  margin: 0 auto;
`;

const Header = styled.div`
  padding: 16px 20px;
  background-color: ${({ theme }) => theme.colors.background.default};
`;

const HeaderTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TitleSection = styled.div`
  text-align: center;
  flex: 1;
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #2D5F4F;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 14px;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 24px;
  color: #2D5F4F;
  font-weight: bold;
`;

const Subtitle = styled.p`
  margin: 4px 0 0 0;
  font-size: 14px;
  color: #666;
  font-weight: normal;
`;

const NotificationBell = styled.div`
  position: relative;
  width: 24px;
  height: 24px;
  cursor: pointer;
  
  &::before {
    content: '🔔';
    font-size: 20px;
  }
  
  &::after {
    content: '3';
    position: absolute;
    top: -4px;
    right: -4px;
    width: 16px;
    height: 16px;
    background-color: #ff4444;
    color: white;
    border-radius: 50%;
    font-size: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const Content = styled.div`
  flex: 1;
  padding: 0 20px 80px 20px;
  overflow-y: auto;
  margin-top: -2px;
`;

const FilterSection = styled.div`
  padding: 4px 20px 6px 20px;
  background-color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  margin-bottom: 6px;
`;

const FilterDropdowns = styled.div`
  display: flex;
  gap: 4px;
`;

const FilterDropdown = styled.button<{ isActive?: boolean; disabled?: boolean }>`
  flex: 1;
  padding: 4px 8px;
  border: 1px solid ${({ isActive, disabled }) => disabled ? '#E5E5E5' : (isActive ? '#2D5F4F' : '#E5E5E5')};
  border-radius: 4px;
  background: ${({ isActive, disabled }) => disabled ? '#F5F5F5' : (isActive ? '#F0F8F5' : 'white')};
  color: ${({ isActive, disabled }) => disabled ? '#999' : (isActive ? '#2D5F4F' : '#333')};
  font-size: 11px;
  font-weight: ${({ isActive }) => isActive ? '600' : '500'};
  cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'pointer'};
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.2s ease;
  opacity: ${({ disabled }) => disabled ? 0.6 : 1};
  height: 28px;
  min-height: 28px;
  
  &:hover {
    border-color: ${({ disabled }) => disabled ? '#E5E5E5' : '#2D5F4F'};
    background-color: ${({ disabled }) => disabled ? '#F5F5F5' : '#F0F8F5'};
  }
  
  &::after {
    content: '▼';
    font-size: 8px;
    margin-left: 3px;
    color: ${({ isActive, disabled }) => disabled ? '#999' : (isActive ? '#2D5F4F' : '#666')};
  }
`;

const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 12px;
  justify-items: center;
  
  /* Position items in grid */
  > :nth-child(1) { grid-column: 1; }
  > :nth-child(2) { grid-column: 2; }
  > :nth-child(3) { grid-column: 3; }
  > :nth-child(4) { grid-column: 4; }
  
  /* Center the bottom 3 items across columns 1-3, offset by 0.5 to center */
  > :nth-child(5) { 
    grid-column: 1;
    justify-self: end;
    margin-right: 12px;
  }
  > :nth-child(6) { 
    grid-column: 2 / span 2;
    justify-self: center;
  }
  > :nth-child(7) { 
    grid-column: 4;
    justify-self: start;
    margin-left: 12px;
  }
`;

const CategoryCard = styled.div<{ isSelected?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 4px;
  border-radius: 8px;
  width: 100%;
  
  &:hover {
    background-color: rgba(45, 95, 79, 0.05);
  }
  
  ${({ isSelected }) => isSelected && `
    background-color: rgba(45, 95, 79, 0.1);
  `}
`;

const CategoryIcon = styled.div<{ color: string; isSelected?: boolean }>`
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background: ${({ color, isSelected }) => 
    isSelected 
      ? `linear-gradient(135deg, ${color}, ${color}dd)` 
      : `linear-gradient(135deg, ${color}20, ${color}40)`
  };
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
  transition: all 0.2s ease;
  
  ${({ isSelected }) => isSelected && `
    transform: scale(1.05);
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.12);
  `}
`;

const CategoryName = styled.span<{ isSelected?: boolean }>`
  font-size: 11px;
  color: ${({ isSelected }) => isSelected ? '#2D5F4F' : '#333'};
  text-align: center;
  font-weight: ${({ isSelected }) => isSelected ? '600' : '500'};
  transition: all 0.2s ease;
  line-height: 1.2;
`;

const SuggestedEventsSection = styled.div`
  margin-bottom: 12px;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const SectionTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: bold;
  color: #2D5F4F;
`;

const SeeAllLink = styled.button`
  background: none;
  border: none;
  color: #2D5F4F;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 3px;
  
  &:hover {
    text-decoration: underline;
  }
  
  &::after {
    content: '→';
    font-size: 14px;
  }
`;

const CompactEventCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 8px 10px;
  margin-bottom: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 50px;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  }
`;

const CompactEventHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
`;

const CompactEventCategory = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #666;
  font-weight: 500;
`;

const CompactCategoryIcon = styled.div<{ color: string }>`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: ${({ color }) => `linear-gradient(135deg, ${color}40, ${color}60)`};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 8px;
  flex-shrink: 0;
`;

const CompactPointsDisplay = styled.span`
  font-size: 10px;
  color: #FF6B6B;
  font-weight: 600;
  background: #FFF5F5;
  padding: 2px 4px;
  border-radius: 4px;
  white-space: nowrap;
`;

const CompactEventTitle = styled.h4`
  margin: 0 0 3px 0;
  font-size: 13px;
  font-weight: 600;
  color: #333;
  line-height: 1.2;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
`;

const CompactEventInfo = styled.div`
  font-size: 11px;
  color: #666;
  line-height: 1.3;
  margin-bottom: 4px;
  
  span {
    margin-right: 6px;
    white-space: nowrap;
  }
  
  span:last-child {
    margin-right: 0;
  }
`;

const CompactEventActions = styled.div`
  display: flex;
  gap: 4px;
  margin-top: 4px;
`;

const CompactJoinButton = styled.button<{ variant?: 'default' | 'cafe' | 'paid' | 'exclusive' }>`
  padding: 4px 8px;
  border: none;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  ${({ variant = 'default' }) => {
    switch (variant) {
      case 'cafe':
        return `
          background: linear-gradient(135deg, #2D5F4F, #1F4A3A);
          color: white;
          &:hover { background: linear-gradient(135deg, #1F4A3A, #0F2A20); }
        `;
      case 'paid':
        return `
          background: linear-gradient(135deg, #FF6B6B, #FF8E8E);
          color: white;
          &:hover { background: linear-gradient(135deg, #FF5252, #FF6B6B); }
        `;
      case 'exclusive':
        return `
          background: linear-gradient(135deg, #7B68EE, #9575CD);
          color: white;
          &:hover { background: linear-gradient(135deg, #6A52CC, #7B68EE); }
        `;
      default:
        return `
          background: #2D5F4F;
          color: white;
          &:hover { background: #1F4A3A; }
        `;
    }
  }}
`;

const CompactLearnMoreButton = styled.button`
  padding: 4px 8px;
  border: 1px solid #E5E5E5;
  border-radius: 4px;
  background: white;
  color: #666;
  font-size: 10px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f5f5f5;
    border-color: #2D5F4F;
  }
`;






const EventPrice = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
`;

const OriginalPrice = styled.span`
  font-size: 12px;
  color: #666;
  text-decoration: line-through;
`;

const DiscountedPrice = styled.span`
  font-size: 14px;
  color: #2D5F4F;
  font-weight: 600;
`;

const ExclusiveBadge = styled.div`
  background: linear-gradient(135deg, #7B68EE, #9575CD);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
  margin-bottom: 4px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 30px 20px;
  color: #666;
`;

const EmptyStateIcon = styled.div`
  font-size: 40px;
  margin-bottom: 12px;
`;

const EmptyStateTitle = styled.h3`
  margin: 0 0 6px 0;
  font-size: 16px;
  color: #333;
`;

const EmptyStateMessage = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
`;

const SearchContainer = styled.div`
  padding: 16px 20px 0 20px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #E5E5E5;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  margin-bottom: 16px;
  box-sizing: border-box;
  
  &:focus {
    border-color: #2D5F4F;
  }
  
  &::placeholder {
    color: #999;
  }
`;

const FilterBadgesContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
  margin-bottom: 6px;
  padding: 0 20px;
`;

const FilterBadge = styled.div`
  background: linear-gradient(135deg, #2D5F4F, #1F4A3A);
  color: white;
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 3px;
  height: 18px;
`;

const FilterBadgeText = styled.span`
  white-space: nowrap;
`;

const ClearAllButton = styled.button`
  background: #f5f5f5;
  color: #666;
  border: 1px solid #E5E5E5;
  border-radius: 8px;
  padding: 2px 6px;
  font-size: 10px;
  cursor: pointer;
  height: 18px;
  
  &:hover {
    background: #e5e5e5;
  }
`;

const AllCitiesOption = styled.div`
  padding: 12px 0;
  font-weight: 600;
  color: #2D5F4F;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 8px;
  cursor: pointer;
  
  &:hover {
    background-color: #f5f5f5;
  }
`;

const FilterButtonStyled = styled.button<{ hasFilter?: boolean }>`
  flex: 1;
  padding: 12px 16px;
  border: 1px solid ${({ hasFilter }) => hasFilter ? '#2D5F4F' : '#E5E5E5'};
  border-radius: 8px;
  background: ${({ hasFilter }) => hasFilter ? '#F0F8F5' : 'white'};
  color: ${({ hasFilter }) => hasFilter ? '#2D5F4F' : '#333'};
  font-size: 14px;
  font-weight: ${({ hasFilter }) => hasFilter ? '600' : '400'};
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  &:hover {
    border-color: #2D5F4F;
    background-color: #F0F8F5;
  }
  
  &::after {
    content: '▼';
    font-size: 10px;
    color: #666;
  }
`;

// Filter Modal Styles
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
  z-index: 1100;
  padding: 20px;
`;

const FilterModal = styled.div`
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 350px;
  max-height: 80vh;
  overflow-y: auto;
`;

const FilterModalHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid #F0F0F0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const FilterModalTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: bold;
  color: #333;
`;

const FilterCloseButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  color: #666;
  cursor: pointer;
  
  &:hover {
    color: #333;
  }
`;

const CheckboxGrid = styled.div`
  padding: 20px;
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
`;

const CheckboxItem = styled.label`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #f5f5f5;
  }
`;

const Checkbox = styled.input`
  margin: 0;
  margin-top: 2px;
  width: 16px;
  height: 16px;
  accent-color: #2D5F4F;
  flex-shrink: 0;
`;

const FilterActions = styled.div`
  padding: 20px;
  border-top: 1px solid #F0F0F0;
  display: flex;
  gap: 12px;
`;

const FilterActionButton = styled.button`
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
`;

const ApplyButton = styled(FilterActionButton)`
  background: #2D5F4F;
  color: white;
  
  &:hover {
    background: #1F4A3A;
  }
`;

const ClearButton = styled(FilterActionButton)`
  background: #f5f5f5;
  color: #666;
  
  &:hover {
    background: #e5e5e5;
  }
`;

const EventCard = styled.div`
  background: white;
  border-radius: 16px;
  margin-bottom: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  
  &:hover {
    transform: translateY(-2px);
    transition: transform 0.2s ease;
  }
`;

const EventImage = styled.div`
  width: 100%;
  height: 120px;
  background: linear-gradient(45deg, #E8F4F0, #D4E9E3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  position: relative;
  background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 120"><rect width="400" height="120" fill="%23E8F4F0"/><rect x="50" y="30" width="300" height="60" fill="%23D4E9E3" rx="8"/><circle cx="100" cy="50" r="10" fill="%234A90A4"/><circle cx="150" cy="50" r="10" fill="%234A90A4"/><circle cx="200" cy="50" r="10" fill="%234A90A4"/></svg>');
  background-size: cover;
`;

const EventBadge = styled.div`
  position: absolute;
  top: 12px;
  left: 12px;
  background-color: #2D5F4F;
  color: white;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 11px;
  font-weight: 600;
`;

const EventReward = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  background-color: #FF6B6B;
  color: white;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 11px;
  font-weight: 600;
`;

const EventContent = styled.div`
  padding: 12px;
`;

const EventMeta = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
`;

const EventHost = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #666;
`;

const HostAvatar = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #2D5F4F;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 10px;
  font-weight: bold;
`;

const EventParticipants = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #666;
`;

const ParticipantAvatars = styled.div`
  display: flex;
  margin-right: 4px;
`;

const ParticipantAvatar = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: #4A90A4;
  margin-left: -6px;
  border: 2px solid white;
  
  &:first-child {
    margin-left: 0;
  }
`;

const EventTitle = styled.h3`
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin: 0 0 8px 0;
`;

const EventDetails = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
`;

const EventInfo = styled.div`
  font-size: 12px;
  color: #666;
  line-height: 1.5;
`;

const EventActions = styled.div`
  display: flex;
  gap: 8px;
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
  
  &:hover {
    background-color: #1F4A3A;
  }
`;

const LearnMoreButton = styled.button`
  background: none;
  border: 1px solid #E5E5E5;
  color: #666;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 12px;
  cursor: pointer;
  
  &:hover {
    background-color: #f5f5f5;
  }
`;

const ShareButton = styled.button`
  background: none;
  border: none;
  color: #666;
  font-size: 16px;
  cursor: pointer;
  padding: 4px;
`;

const CreateEventButton = styled.button`
  background-color: #2D5F4F;
  color: white;
  border: none;
  border-radius: 10px;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  
  &:hover {
    background-color: #1F4A3A;
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

interface EventData {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  type: string;
  hostName: string;
  participantCount: number;
  maxParticipants?: number;
  pointsReward: number;
  emoji: string;
  isJoined?: boolean;
}

export const BerseConnectScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  // const [events, setEvents] = useState<Event[]>([]);
  // const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // Filter states
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('Malaysia');
  const [selectedDateRange, setSelectedDateRange] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showCityModal, setShowCityModal] = useState(false);
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  
  // Search states
  const [citySearchQuery, setCitySearchQuery] = useState('');
  
  // Events state
  const [allEvents, setAllEvents] = useState<any[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<any[]>([]);
  
  // Registration modal state
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [showSportsBookingModal, setShowSportsBookingModal] = useState(false);
  const [selectedSportsEvent, setSelectedSportsEvent] = useState(null);
  
  // Debug state changes with timestamps
  useEffect(() => {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`🚨 STATE DEBUG [${timestamp}]: Modal state changed`, {
      showSportsBookingModal,
      hasSelectedEvent: !!selectedSportsEvent,
      selectedEventId: selectedSportsEvent?.id,
      selectedEventTitle: selectedSportsEvent?.title,
      modalShouldRender: showSportsBookingModal && !!selectedSportsEvent
    });
    
    if (showSportsBookingModal && !selectedSportsEvent) {
      console.warn('🚨 WARNING: Modal is open but no event selected - this will show debug modal');
    }
    
    if (showSportsBookingModal && selectedSportsEvent) {
      console.log('🚨 SUCCESS: Modal should render with event:', selectedSportsEvent.title);
    }
  }, [showSportsBookingModal, selectedSportsEvent]);
  
  
  // New state for event actions
  const [showJoinConfirmation, setShowJoinConfirmation] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
  const [joinedEvents, setJoinedEvents] = useState<string[]>([]);

  // Load joined events from localStorage on component mount
  useEffect(() => {
    const storedJoinedEvents = JSON.parse(localStorage.getItem('joined_events') || '[]');
    setJoinedEvents(storedJoinedEvents);
  }, []);

  // Cafe meetup booking handler
  const handleCafeMeetupBooking = (event: any) => {
    // Navigate to the cafe meetup booking screen
    navigate('/book-meetup');
  };

  const handleSportsEventRegistration = (event: any) => {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`🚨 DEBUGGING [${timestamp}]: handleSportsEventRegistration called with:`, {
      event,
      hasEvent: !!event,
      eventId: event?.id,
      eventTitle: event?.title,
      eventVariant: event?.variant
    });
    
    // Validate event object
    if (!event) {
      console.error('🚨 ERROR: No event provided to handleSportsEventRegistration');
      return;
    }
    
    if (!event.id || !event.title) {
      console.error('🚨 ERROR: Event missing required properties:', event);
      return;
    }
    
    console.log('🚨 DEBUGGING: Event validation passed, setting modal state...');
    
    // Set state atomically
    try {
      setSelectedSportsEvent(event);
      console.log('🚨 DEBUGGING: selectedSportsEvent set to:', event.title);
      
      setShowSportsBookingModal(true);
      console.log('🚨 DEBUGGING: showSportsBookingModal set to true');
      
      // Verify state change will happen
      setTimeout(() => {
        console.log(`🚨 DEBUGGING [${timestamp}]: State should be updated now`);
      }, 100);
      
    } catch (error) {
      console.error('🚨 ERROR: Failed to set modal state:', error);
    }
  };

  // REMOVED: unused renderEventButton function that was causing confusion

  // Event action handlers
  const handleJoinEvent = (event: any) => {
    // Convert API event to EventData format
    const eventData: EventData = {
      id: event.id,
      title: event.title,
      description: event.description,
      date: event.date,
      location: event.location,
      type: event.type,
      hostName: event.hostName,
      participantCount: event.participantCount,
      maxParticipants: event.maxParticipants,
      pointsReward: 3, // Default points
      emoji: '☕', // Default emoji
      isJoined: joinedEvents.includes(event.id)
    };
    
    if (joinedEvents.includes(event.id)) {
      // Already joined, show message
      alert('You have already joined this event!');
      return;
    }
    
    setSelectedEvent(eventData);
    setShowJoinConfirmation(true);
  };

  const confirmJoinEvent = () => {
    if (!selectedEvent) return;

    // Update joined events
    const updatedJoinedEvents = [...joinedEvents, selectedEvent.id];
    setJoinedEvents(updatedJoinedEvents);
    localStorage.setItem('joined_events', JSON.stringify(updatedJoinedEvents));

    // Update event participant count in the events list (would be API call in real app)
    // setEvents(prev => prev.map(event => 
    //   event.id === selectedEvent.id 
    //     ? { ...event, participantCount: event.participantCount + 1 }
    //     : event
    // ));

    // Store joined event details for history
    const existingHistory = JSON.parse(localStorage.getItem('event_history') || '[]');
    const newHistoryEntry = {
      id: selectedEvent.id,
      type: 'joined_event',
      title: selectedEvent.title,
      date: selectedEvent.date,
      location: selectedEvent.location,
      hostName: selectedEvent.hostName,
      joinedAt: new Date().toISOString()
    };
    existingHistory.push(newHistoryEntry);
    localStorage.setItem('event_history', JSON.stringify(existingHistory));

    setShowJoinConfirmation(false);
    setSelectedEvent(null);

    // Show success message
    setTimeout(() => {
      alert(`Successfully joined "${selectedEvent.title}"! You'll receive updates about this event.`);
    }, 100);
  };

  const cancelJoinEvent = () => {
    setShowJoinConfirmation(false);
    setSelectedEvent(null);
  };

  const handleLearnMore = (eventId: string) => {
    console.log('🚨 Learn More clicked for event:', eventId);
    navigate(`/event/${eventId}`);
  };

  const handleCreateEvent = () => {
    // Check if user is admin (for now, checking if user exists - in real app would check user role)
    if (!user) {
      alert('Please log in to create events.');
      return;
    }
    
    // In a real app, you would check user.role === 'admin' or similar
    // For now, allowing all authenticated users to create events
    navigate('/event/create');
  };


  const countries = [
    { id: 'malaysia', name: 'Malaysia', currency: 'RM' },
    { id: 'turkey', name: 'Turkey', currency: 'TL' },
    { id: 'indonesia', name: 'Indonesia', currency: 'Rp' },
    { id: 'morocco', name: 'Morocco', currency: 'MAD' },
    { id: 'all', name: 'All Countries', currency: '' }
  ];

  const citiesByCountry: Record<string, string[]> = {
    'malaysia': [
      'Kuala Lumpur',
      'Damansara', 
      'Shah Alam',
      'Subang Jaya',
      'Ampang',
      'Cheras',
      'City Centre'
    ],
    'turkey': [
      'Istanbul',
      'Bursa',
      'Erzurum',
      'Ankara',
      'Izmir',
      'Antalya'
    ],
    'indonesia': [
      'Jakarta',
      'Bandung',
      'Aceh',
      'Surabaya',
      'Yogyakarta',
      'Medan',
      'Bali'
    ],
    'morocco': [
      'Fez',
      'Marrakech',
      'Tangier',
      'Rabat',
      'Casablanca',
      'Meknes'
    ],
    'all': []
  };

  const dateRangeOptions = [
    'This Week',
    'This Month', 
    'Next Month',
    'Next 3 Months',
    'Custom Range'
  ];

  const categories = [
    { id: 'social', name: 'Social', icon: '👥', color: '#FF6B6B' },
    { id: 'cafe', name: 'Cafe Meetups', icon: '☕', color: '#2D5F4F' },
    { id: 'ilm', name: 'Ilm', icon: '📚', color: '#FF9800' },
    { id: 'donate', name: 'Donate', icon: '💝', color: '#E91E63' },
    { id: 'trips', name: 'Trips', icon: '🏝️', color: '#7B68EE' },
    { id: 'sports', name: 'Sports', icon: '🏸', color: '#2196F3' },
    { id: 'volunteer', name: 'Volunteer', icon: '🌱', color: '#8BC34A' }
  ];

  useEffect(() => {
    loadEvents();
  }, []);

  // Apply filters whenever filter states change
  useEffect(() => {
    if (allEvents.length > 0) {
      applyAllFilters();
    }
  }, [selectedCategory, selectedCountry, selectedCity, selectedDateRange, allEvents]);

  const loadEvents = async () => {
    try {
      const mockEvents = [
        {
          id: '1',
          title: 'Monday Meetups at Mesra Cafe KLCC',
          description: 'Weekly casual meetups at the popular Mesra Cafe in KLCC. Perfect for networking and making new friends over coffee.',
          date: '2025-05-25T19:00:00Z',
          location: 'Kuala Lumpur, Malaysia',
          city: 'Kuala Lumpur',
          country: 'Malaysia',
          category: 'cafe',
          hostName: 'Ahmed Sumone',
          participantCount: 12,
          maxParticipants: 20,
          pointsReward: 3,
          variant: 'cafe'
        },
        {
          id: '2',
          title: 'BerseMuka Social Gathering',
          description: 'Join us for a fun social gathering to meet new people and build lasting friendships.',
          date: '2025-05-06T18:30:00Z',
          location: 'Shah Alam, Malaysia',
          city: 'Shah Alam',
          country: 'Malaysia',
          category: 'social',
          hostName: 'Ahl Umran Network',
          participantCount: 17,
          maxParticipants: 30,
          pointsReward: 4,
          variant: 'default'
        },
        {
          id: '3',
          title: 'Istanbul Brothers Gathering',
          description: 'Connect with fellow Muslims in the beautiful city of Istanbul. Food and fellowship included.',
          date: '2025-05-18T16:00:00Z',
          location: 'Istanbul, Turkey',
          city: 'Istanbul',
          country: 'Turkey',
          category: 'social',
          hostName: 'Mehmet Özkan',
          participantCount: 23,
          maxParticipants: 35,
          pointsReward: 6,
          variant: 'default'
        },
        {
          id: '4',
          title: 'BerseMinton by Sukan Squad',
          description: 'Professional badminton session with coaching and equipment provided.',
          date: '2025-05-18T08:00:00Z',
          location: 'Shah Alam, Malaysia',
          city: 'Shah Alam',
          country: 'Malaysia',
          category: 'sports',
          hostName: 'Sukan Squad',
          participantCount: 11,
          maxParticipants: 20,
          pointsReward: 4,
          price: 15,
          discountedPrice: 12,
          variant: 'paid'
        },
        {
          id: '5',
          title: 'Jakarta Coffee & Coding',
          description: 'Tech meetup for Muslim developers in Jakarta. Learn, network, and grow together.',
          date: '2025-05-20T19:00:00Z',
          location: 'Jakarta, Indonesia',
          city: 'Jakarta',
          country: 'Indonesia',
          category: 'cafe',
          hostName: 'Tech Ummah Jakarta',
          participantCount: 8,
          maxParticipants: 15,
          pointsReward: 4,
          variant: 'cafe'
        },
        {
          id: '6',
          title: 'Friendship Manual Workshop',
          description: 'Learn about building meaningful friendships and connections in Islamic way.',
          date: '2025-05-22T14:00:00Z',
          location: 'Damansara, Malaysia',
          city: 'Damansara',
          country: 'Malaysia',
          category: 'ilm',
          hostName: 'Ahl Umran Network',
          participantCount: 15,
          maxParticipants: 25,
          pointsReward: 5,
          variant: 'default'
        },
        {
          id: '7',
          title: 'Marrakech Heritage Walk',
          description: 'Discover the rich Islamic heritage of Marrakech with local historians and scholars.',
          date: '2025-05-15T10:00:00Z',
          location: 'Marrakech, Morocco',
          city: 'Marrakech',
          country: 'Morocco',
          category: 'ilm',
          hostName: 'Hassan Al-Maghribi',
          participantCount: 12,
          maxParticipants: 18,
          pointsReward: 7,
          variant: 'default'
        },
        {
          id: '8',
          title: 'Exclusive BersePass Dinner',
          description: 'Premium dining experience exclusively for BersePass members in the heart of KL.',
          date: '2025-05-12T19:00:00Z',
          location: 'Kuala Lumpur, Malaysia',
          city: 'Kuala Lumpur',
          country: 'Malaysia',
          category: 'social',
          hostName: 'BerseMuka Team',
          participantCount: 5,
          maxParticipants: 8,
          pointsReward: 10,
          variant: 'exclusive',
          isExclusive: true
        },
        {
          id: '9',
          title: 'Ankara Tech & Innovation Summit',
          description: 'Annual technology conference bringing together Muslim innovators and entrepreneurs.',
          date: '2025-05-28T09:00:00Z',
          location: 'Ankara, Turkey',
          city: 'Ankara',
          country: 'Turkey',
          category: 'ilm',
          hostName: 'Turkish Tech Ummah',
          participantCount: 45,
          maxParticipants: 100,
          pointsReward: 8,
          price: 25,
          discountedPrice: 20,
          variant: 'paid'
        },
        {
          id: '10',
          title: 'Fez Islamic Art Workshop',
          description: 'Learn traditional Islamic calligraphy and geometric patterns in the ancient city of Fez.',
          date: '2025-05-30T14:00:00Z',
          location: 'Fez, Morocco',
          city: 'Fez',
          country: 'Morocco',
          category: 'ilm',
          hostName: 'Master Calligrapher Youssef',
          participantCount: 7,
          maxParticipants: 12,
          pointsReward: 9,
          variant: 'default'
        }
      ];
      
      setAllEvents(mockEvents);
      setFilteredEvents(mockEvents);
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEventClick = (eventId: string) => {
    console.log('🚨 Event card clicked (should not trigger for button clicks):', eventId);
    // NOTE: This should NOT fire when Pay button is clicked due to e.stopPropagation()
  };

  const applyAllFilters = () => {
    let filtered = [...allEvents];

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(event => event.category === selectedCategory);
    }

    // Filter by country
    if (selectedCountry && selectedCountry !== 'All Countries') {
      filtered = filtered.filter(event => event.country === selectedCountry);
    }

    // Filter by city
    if (selectedCity) {
      filtered = filtered.filter(event => 
        event.city.toLowerCase().includes(selectedCity.toLowerCase())
      );
    }

    // Filter by date range (basic implementation)
    if (selectedDateRange) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.date);
        const eventDay = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
        const diffTime = eventDay.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        switch (selectedDateRange) {
          case 'This Week':
            return diffDays >= 0 && diffDays <= 7;
          case 'This Month':
            return diffDays >= 0 && diffDays <= 30;
          case 'Next Month':
            return diffDays >= 30 && diffDays <= 60;
          case 'Next 3 Months':
            return diffDays >= 0 && diffDays <= 90;
          default:
            return true;
        }
      });
    }

    setFilteredEvents(filtered);
  };

  const handleCategoryClick = (categoryId: string) => {
    if (selectedCategory === categoryId) {
      setSelectedCategory('');
    } else {
      setSelectedCategory(categoryId);
    }
  };

  const handleCitySelect = (city: string) => {
    setSelectedCity(city);
    setCitySearchQuery('');
    setShowCityModal(false);
  };

  const handleCountrySelect = (countryId: string) => {
    setSelectedCountry(countryId);
    setSelectedCity(''); // Reset city when country changes
    setShowCountryModal(false);
  };

  const handleDateRangeSelect = (dateRange: string) => {
    setSelectedDateRange(dateRange);
    setShowDateModal(false);
  };

  const clearFilters = () => {
    setSelectedCity('');
    setSelectedCountry('Malaysia');
    setSelectedDateRange('');
    setSelectedCategory('');
    setCitySearchQuery('');
    setFilteredEvents(allEvents);
  };

  const getAvailableCities = () => {
    const countryId = selectedCountry === 'All Countries' ? 'all' : selectedCountry.toLowerCase();
    return citiesByCountry[countryId] || [];
  };

  const getFilteredCities = () => {
    const availableCities = getAvailableCities();
    if (!citySearchQuery.trim()) return availableCities;
    
    return availableCities.filter(city =>
      city.toLowerCase().includes(citySearchQuery.toLowerCase())
    );
  };

  const getSelectedCountryInfo = () => {
    return countries.find(c => c.name === selectedCountry) || countries[0];
  };

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const eventDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays > 0 && diffDays <= 7) return `${diffDays}d`;
    
    // More compact format: "May 5" instead of "5 May 25"
    return date.toLocaleDateString('en-US', { 
      month: 'short',
      day: 'numeric'
    });
  };

  const formatEventTime = (dateString: string) => {
    const date = new Date(dateString);
    const time = date.toLocaleTimeString('en-MY', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
    // Make it more compact: "3:00 AM" -> "3am", "2:30 PM" -> "2:30pm"
    return time
      .replace(':00', '')
      .replace(' AM', 'am')
      .replace(' PM', 'pm')
      .toLowerCase();
  };

  const getCategoryInfo = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId) || categories[0];
  };

  const handleSeeAllEvents = () => {
    // Navigate to all events view or expand the list
    console.log('See all events clicked');
  };

  const shortenEventTitle = (title: string) => {
    // Remove location details and shorten titles
    return title
      .replace(/at\s+\w+\s+(KLCC|Cafe|Center|Complex|Mall)/gi, '')
      .replace(/by\s+\w+\s+Squad/gi, '')
      .replace(/\s+KLCC/gi, '')
      .replace(/\s+at\s+.*/gi, '')
      .replace(/Monday Meetups at Mesra Cafe KLCC/gi, 'Monday Meetups at Mesra')
      .replace(/BerseMinton by Sukan Squad/gi, 'BerseMinton')
      .replace(/Volunteer Permaculture Farm at Mukha Tree/gi, 'Permaculture Farm')
      .replace(/Friendship Manual by Ahl 'Umran Network/gi, 'Friendship Manual')
      .replace(/Local Guide Around/gi, 'Guide:')
      .trim();
  };

  const getCompactLocation = (location: string) => {
    // Extract city from "City, Country" format
    return location.split(',')[0].trim();
  };

  return (
    <Container>
      <StatusBar />
      
      <Header>
        <HeaderTop>
          <Avatar>ZA</Avatar>
          <TitleSection>
            <Title>BerseConnect</Title>
            <Subtitle>Build Communities & Friendship</Subtitle>
          </TitleSection>
          <NotificationBell />
        </HeaderTop>
      </Header>

      {/* Filter Badges */}
      {(selectedCity || selectedCountry !== 'Malaysia' || selectedDateRange || selectedCategory) && (
        <FilterBadgesContainer>
          {selectedCountry !== 'Malaysia' && (
            <FilterBadge>
              <FilterBadgeText>{selectedCountry}</FilterBadgeText>
            </FilterBadge>
          )}
          {selectedCity && (
            <FilterBadge>
              <FilterBadgeText>{selectedCity}</FilterBadgeText>
            </FilterBadge>
          )}
          {selectedDateRange && (
            <FilterBadge>
              <FilterBadgeText>{selectedDateRange}</FilterBadgeText>
            </FilterBadge>
          )}
          {selectedCategory && (
            <FilterBadge>
              <FilterBadgeText>{categories.find(c => c.id === selectedCategory)?.name}</FilterBadgeText>
            </FilterBadge>
          )}
          <ClearAllButton onClick={clearFilters}>
            Clear All
          </ClearAllButton>
        </FilterBadgesContainer>
      )}

      <FilterSection>
        <FilterDropdowns>
          <FilterDropdown 
            isActive={!!selectedCity}
            onClick={() => setShowCityModal(true)}
          >
            {selectedCity || 'City'}
          </FilterDropdown>
          
          <FilterDropdown 
            isActive={selectedCountry !== 'Malaysia'}
            onClick={() => setShowCountryModal(true)}
          >
            {selectedCountry === 'Malaysia' ? 'Country/Region' : selectedCountry}
          </FilterDropdown>
          
          <FilterDropdown 
            isActive={!!selectedDateRange}
            onClick={() => setShowDateModal(true)}
          >
            {selectedDateRange || 'Date Range'}
          </FilterDropdown>
        </FilterDropdowns>
      </FilterSection>

      <Content>
        {/* TEMPORARY DEBUG BUTTONS */}
        <div style={{ 
          padding: '12px', 
          background: '#FFE8E8', 
          margin: '8px 0', 
          borderRadius: '8px',
          border: '1px solid #FFB3B3' 
        }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#CC0000', fontSize: '14px' }}>🚨 Debug Panel</h4>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button 
              type="button"
              onClick={() => {
                console.log('🚨 Force opening modal with test event');
                const testEvent = {
                  id: 'debug-test',
                  title: 'Debug Test Event',
                  price: 15,
                  discountedPrice: 12,
                  location: 'Debug Location'
                };
                setSelectedSportsEvent(testEvent);
                setShowSportsBookingModal(true);
              }}
              style={{ 
                padding: '4px 8px', 
                background: '#CC0000', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px',
                fontSize: '10px'
              }}
            >
              🚨 Force Modal (w/ Event)
            </button>
            <button 
              type="button"
              onClick={() => {
                console.log('🚨 Force opening modal without event');
                setSelectedSportsEvent(null);
                setShowSportsBookingModal(true);
              }}
              style={{ 
                padding: '4px 8px', 
                background: '#FF6B6B', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px',
                fontSize: '10px'
              }}
            >
              🚨 Force Modal (no Event)
            </button>
            <span style={{ fontSize: '10px', color: '#666', alignSelf: 'center' }}>
              Modal: {showSportsBookingModal ? '✅ OPEN' : '❌ CLOSED'}
            </span>
          </div>
        </div>
        {/* Category Grid */}
        <CategoryGrid>
          {categories.map((category) => (
            <CategoryCard 
              key={category.id} 
              isSelected={selectedCategory === category.id}
              onClick={() => handleCategoryClick(category.id)}
            >
              <CategoryIcon 
                color={category.color}
                isSelected={selectedCategory === category.id}
              >
                {category.icon}
              </CategoryIcon>
              <CategoryName isSelected={selectedCategory === category.id}>
                {category.name}
              </CategoryName>
            </CategoryCard>
          ))}
        </CategoryGrid>

        {/* Suggested Events Section */}
        <SuggestedEventsSection>
          <SectionHeader>
            <SectionTitle>
              {selectedCategory ? 
                `${categories.find(c => c.id === selectedCategory)?.name} Events` : 
                'Suggested Events'
              }
            </SectionTitle>
            <SeeAllLink onClick={handleSeeAllEvents}>
              See All
            </SeeAllLink>
          </SectionHeader>
          
          {isLoading ? (
            <div style={{ textAlign: 'center', color: '#666', padding: '40px' }}>
              Loading events...
            </div>
          ) : filteredEvents.length === 0 ? (
            <EmptyState>
              <EmptyStateIcon>
                {selectedCategory ? 
                  categories.find(c => c.id === selectedCategory)?.icon || '📅' : 
                  '📅'
                }
              </EmptyStateIcon>
              <EmptyStateTitle>
                {selectedCategory ? 
                  `No ${categories.find(c => c.id === selectedCategory)?.name} events found` :
                  'No events found'
                }
              </EmptyStateTitle>
              <EmptyStateMessage>
                {selectedCategory ? 
                  `No ${categories.find(c => c.id === selectedCategory)?.name.toLowerCase()} events this week. Try checking other categories or expanding your search.` :
                  'Try adjusting your filters or check back later for new events.'
                }
              </EmptyStateMessage>
            </EmptyState>
          ) : (
            filteredEvents.slice(0, 8).map((event) => {
              const categoryInfo = getCategoryInfo(event.category);
              const shortTitle = shortenEventTitle(event.title);
              const compactLocation = getCompactLocation(event.location);
              
              return (
                <CompactEventCard 
                  key={event.id} 
                  onClick={(e) => {
                    // Only handle click if it's not from a button inside the card
                    if ((e.target as HTMLElement).tagName === 'BUTTON') {
                      console.log('🚨 Card click prevented - button clicked instead');
                      return;
                    }
                    handleEventClick(event.id);
                  }}
                >
                  <CompactEventHeader>
                    <CompactEventCategory>
                      <CompactCategoryIcon color={categoryInfo.color}>
                        {categoryInfo.icon}
                      </CompactCategoryIcon>
                      {categoryInfo.name} • {event.pointsReward} pts
                    </CompactEventCategory>
                    
                    {event.price ? (
                      <CompactPointsDisplay style={{ background: '#FFE8E8', color: '#FF6B6B', fontWeight: 'bold' }}>
                        RM {event.discountedPrice || event.price}
                      </CompactPointsDisplay>
                    ) : (
                      <CompactPointsDisplay>
                        {event.pointsReward} pts
                      </CompactPointsDisplay>
                    )}
                  </CompactEventHeader>

                  <CompactEventTitle>{shortTitle}</CompactEventTitle>
                  
                  <CompactEventInfo>
                    <span>📅 {formatEventDate(event.date)} • {formatEventTime(event.date)}</span>
                    <span>📍 {compactLocation}</span>
                    <span>👥 {event.participantCount}/{event.maxParticipants}</span>
                    {event.maxParticipants - event.participantCount <= 3 && 
                      <span style={{ color: '#FF6B6B', fontSize: '10px' }}>• Full soon!</span>
                    }
                  </CompactEventInfo>

                  <CompactEventActions>
                    <CompactJoinButton 
                      type="button"
                      variant={event.variant}
                      onClick={(e) => {
                        const timestamp = new Date().toLocaleTimeString();
                        console.log(`🚨 Real Pay button clicked! [${timestamp}]`, { 
                          eventId: event.id, 
                          variant: event.variant, 
                          title: event.title,
                          isBerseMinton: event.title.includes('BerseMinton'),
                          eventData: event
                        });
                        
                        // CRITICAL: Prevent any navigation
                        e.preventDefault();
                        e.stopPropagation();
                        
                        // Special handling for BerseMinton
                        if (event.title.includes('BerseMinton')) {
                          console.log('🚨 BERSEMINTON DETECTED: Processing payment for BerseMinton event');
                          handleSportsEventRegistration(event);
                          return;
                        }
                        
                        if (event.variant === 'cafe') {
                          console.log('🚨 DEBUGGING: Handling cafe meetup');
                          handleCafeMeetupBooking(event);
                        } else if (event.variant === 'paid') {
                          console.log('🚨 DEBUGGING: Handling sports event registration for:', event.title);
                          handleSportsEventRegistration(event);
                        } else {
                          console.log('🚨 DEBUGGING: Handling regular event join');
                          handleJoinEvent(event);
                        }
                      }}
                    >
                      {event.variant === 'cafe' && 'Book'}
                      {event.variant === 'paid' && 'Pay'}
                      {event.variant === 'exclusive' && 'Join'}
                      {event.variant === 'default' && (joinedEvents.includes(event.id) ? '✓' : 'Join')}
                    </CompactJoinButton>
                    
                    <CompactLearnMoreButton 
                      type="button"
                      onClick={(e) => {
                        console.log('🚨 More button clicked for:', event.title);
                        e.preventDefault();
                        e.stopPropagation();
                        handleLearnMore(event.id);
                      }}
                    >
                      More
                    </CompactLearnMoreButton>
                  </CompactEventActions>
                </CompactEventCard>
              );
            })
          )}
        </SuggestedEventsSection>

        {/* Action Buttons */}
        <CreateEventButton onClick={handleCreateEvent}>
          ➕ Create Event
        </CreateEventButton>
      </Content>

      {/* City Filter Modal */}
      <FilterModalOverlay isOpen={showCityModal} onClick={() => setShowCityModal(false)}>
        <FilterModal onClick={(e) => e.stopPropagation()}>
          <FilterModalHeader>
            <FilterModalTitle>Select City</FilterModalTitle>
            <FilterCloseButton onClick={() => setShowCityModal(false)}>×</FilterCloseButton>
          </FilterModalHeader>
          
          <SearchContainer>
            <SearchInput
              type="text"
              placeholder="Search city..."
              value={citySearchQuery}
              onChange={(e) => setCitySearchQuery(e.target.value)}
            />
          </SearchContainer>
          
          <CheckboxGrid>
            <AllCitiesOption onClick={() => handleCitySelect('')}>
              All Cities
            </AllCitiesOption>
            
            {getFilteredCities().map((city) => (
              <CheckboxItem key={city} onClick={() => handleCitySelect(city)}>
                <div style={{ 
                  padding: '8px 0',
                  fontWeight: selectedCity === city ? '600' : '400',
                  color: selectedCity === city ? '#2D5F4F' : '#333'
                }}>
                  {city}
                </div>
              </CheckboxItem>
            ))}
            
            {citySearchQuery && getFilteredCities().length === 0 && (
              <CheckboxItem onClick={() => handleCitySelect(citySearchQuery)}>
                <div style={{ 
                  padding: '8px 0',
                  fontWeight: '500',
                  color: '#2D5F4F',
                  fontStyle: 'italic'
                }}>
                  Add "{citySearchQuery}"
                </div>
              </CheckboxItem>
            )}
          </CheckboxGrid>
        </FilterModal>
      </FilterModalOverlay>

      {/* Country Filter Modal */}
      <FilterModalOverlay isOpen={showCountryModal} onClick={() => setShowCountryModal(false)}>
        <FilterModal onClick={(e) => e.stopPropagation()}>
          <FilterModalHeader>
            <FilterModalTitle>Select Country/Region</FilterModalTitle>
            <FilterCloseButton onClick={() => setShowCountryModal(false)}>×</FilterCloseButton>
          </FilterModalHeader>
          
          <CheckboxGrid>
            {countries.map((country) => (
              <CheckboxItem key={country.id} onClick={() => handleCountrySelect(country.name)}>
                <div style={{ 
                  padding: '8px 0',
                  fontWeight: selectedCountry === country.name ? '600' : '400',
                  color: selectedCountry === country.name ? '#2D5F4F' : '#333',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span>{country.name}</span>
                  {country.currency && (
                    <span style={{ 
                      fontSize: '11px', 
                      color: '#999',
                      marginLeft: '8px'
                    }}>
                      {country.currency}
                    </span>
                  )}
                </div>
              </CheckboxItem>
            ))}
          </CheckboxGrid>
        </FilterModal>
      </FilterModalOverlay>

      {/* Date Range Filter Modal */}
      <FilterModalOverlay isOpen={showDateModal} onClick={() => setShowDateModal(false)}>
        <FilterModal onClick={(e) => e.stopPropagation()}>
          <FilterModalHeader>
            <FilterModalTitle>Select Date Range</FilterModalTitle>
            <FilterCloseButton onClick={() => setShowDateModal(false)}>×</FilterCloseButton>
          </FilterModalHeader>
          
          <CheckboxGrid>
            {dateRangeOptions.map((dateRange) => (
              <CheckboxItem key={dateRange} onClick={() => handleDateRangeSelect(dateRange)}>
                <div style={{ 
                  padding: '8px 0',
                  fontWeight: selectedDateRange === dateRange ? '600' : '400',
                  color: selectedDateRange === dateRange ? '#2D5F4F' : '#333'
                }}>
                  {dateRange}
                </div>
              </CheckboxItem>
            ))}
          </CheckboxGrid>
        </FilterModal>
      </FilterModalOverlay>

      {/* Join Event Confirmation Modal */}
      <ConfirmationModal show={showJoinConfirmation}>
        <ModalContent>
          <ModalTitle>Join Event</ModalTitle>
          <ModalText>
            Are you sure you want to join <strong>"{selectedEvent?.title}"</strong>?
            <br /><br />
            📅 {selectedEvent?.date ? new Date(selectedEvent.date).toLocaleDateString() : ''}<br />
            📍 {selectedEvent?.location}<br />
            👥 Hosted by {selectedEvent?.hostName}
          </ModalText>
          <ModalButtons>
            <ModalButton onClick={cancelJoinEvent}>Cancel</ModalButton>
            <ModalButton primary onClick={confirmJoinEvent}>Join Event</ModalButton>
          </ModalButtons>
        </ModalContent>
      </ConfirmationModal>

      <BottomNav activeTab="connect" />

      {/* Sports Event Registration Modal */}
      <EventRegistrationModal
        isOpen={showRegistrationModal}
        onClose={() => {
          setShowRegistrationModal(false);
          setSelectedSportsEvent(null);
        }}
        event={selectedSportsEvent}
      />

      {/* Enhanced Sports Event Booking Modal */}
      <SportsEventBookingModal
        isOpen={showSportsBookingModal}
        onClose={() => {
          setShowSportsBookingModal(false);
          setSelectedSportsEvent(null);
        }}
        event={selectedSportsEvent}
      />
    </Container>
  );
};