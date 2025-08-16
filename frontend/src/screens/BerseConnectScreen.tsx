import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { StatusBar } from '../components/StatusBar/StatusBar';
import { CompactHeader } from '../components/CompactHeader/CompactHeader';
import { ProfileSidebar } from '../components/ProfileSidebar/ProfileSidebar';
import { MainNav } from '../components/MainNav/index';
import { googleCalendarService } from '../services/googleCalendar';
import { useAuth } from '../contexts/AuthContext';

// Event Interface
interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  venue: string;
  category: 'social' | 'sports' | 'volunteer' | 'donate' | 'trips';
  description: string;
  organizer: string;
  organizerAvatar?: string;
  coverImage?: string;
  price: number;
  currency: string;
  attendees: number;
  maxAttendees: number;
  tags: string[];
  isOnline: boolean;
  meetingLink?: string;
  friends: string[];
  committedProfiles: CommittedProfile[];
  trending?: boolean;
  highlights?: string[];
  agenda?: AgendaItem[];
  requirements?: string[];
}

interface CommittedProfile {
  id: number;
  name: string;
  age: number;
  profession: string;
  location: string;
  match: number;
  avatar?: string;
  personalityType?: string;
  languages?: string;
  tags: string[];
  bio: string;
  mutuals?: string[];
  isOnline?: boolean;
}

interface AgendaItem {
  time: string;
  activity: string;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #F9F3E3;
`;

// Connection Mode Card (Same as BerseMatch)
const ConnectionModeCard = styled.div`
  background: linear-gradient(135deg, #2fce98, #26b580);
  border-radius: 12px;
  padding: 8px;
  margin: 4px 16px 4px 16px;
  color: white;
  box-shadow: 0 4px 12px rgba(47, 206, 152, 0.25), 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  }
`;

const ModeTitle = styled.div`
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
`;

const TabNavigation = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TabNavButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  border-radius: 4px;
  width: 24px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const TabNameDisplay = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  min-width: 80px;
  text-align: center;
`;

const ModeDescription = styled.div`
  font-size: 10px;
  opacity: 0.9;
  margin-bottom: 6px;
  line-height: 1.2;
`;

const ModeSelector = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
  padding: 4px 0 0 0;
`;

const ModeButton = styled.button<{ $active?: boolean }>`
  width: 100%;
  padding: 5px 2px;
  background: ${props => props.$active 
    ? 'linear-gradient(135deg, white, #f8f8f8)' 
    : 'rgba(255, 255, 255, 0.1)'};
  color: ${props => props.$active ? '#2fce98' : 'white'};
  border: 1px solid ${props => props.$active 
    ? 'rgba(255, 255, 255, 0.8)' 
    : 'rgba(255, 255, 255, 0.2)'};
  border-radius: 8px;
  font-size: 10px;
  font-weight: ${props => props.$active ? '600' : '500'};
  box-shadow: ${props => props.$active 
    ? 'inset 0 1px 2px rgba(0, 0, 0, 0.05), 0 2px 4px rgba(0, 0, 0, 0.1)' 
    : 'none'};
  backdrop-filter: blur(10px);
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  
  &:hover {
    background: ${props => props.$active 
      ? 'linear-gradient(135deg, white, #f0f0f0)' 
      : 'rgba(255, 255, 255, 0.2)'};
    border-color: ${props => props.$active 
      ? 'white' 
      : 'rgba(255, 255, 255, 0.4)'};
    transform: translateY(-1px);
    box-shadow: ${props => props.$active 
      ? 'inset 0 1px 2px rgba(0, 0, 0, 0.05), 0 4px 8px rgba(0, 0, 0, 0.15)' 
      : '0 2px 6px rgba(0, 0, 0, 0.2)'};
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const CollabBadge = styled.span`
  position: absolute;
  top: 2px;
  right: 4px;
  background: rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.9);
  padding: 1px 4px;
  border-radius: 3px;
  font-size: 7px;
  font-weight: 600;
  letter-spacing: 0.3px;
`;

const FilterDivider = styled.div`
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent);
  margin: 4px 0 2px 0;
`;

const LocationFilterSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 0 0 0;
`;

const LocationFilterLabel = styled.span`
  font-size: 8px;
  color: rgba(255, 255, 255, 0.8);
  white-space: nowrap;
  font-weight: 500;
  font-style: italic;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const FilterOptions = styled.div`
  display: flex;
  gap: 4px;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  max-width: 380px;
`;

const CompactDropdown = styled.select`
  padding: 4px 6px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 5px;
  font-size: 9px;
  background: rgba(255, 255, 255, 0.05);
  color: white;
  min-width: 0;
  flex: 1;
  max-width: 100px;
  cursor: pointer;
  transition: all 0.2s ease;
  height: 24px;
  
  option {
    background: #2fce98;
    color: white;
    font-size: 11px;
  }
  
  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.25);
  }
  
  &:focus {
    outline: none;
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.3);
  }
  
  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
`;

const SearchInput = styled.input`
  padding: 4px 8px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 5px;
  font-size: 9px;
  background: rgba(255, 255, 255, 0.05);
  color: white;
  width: 110px;
  height: 24px;
  transition: all 0.2s ease;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.3);
    font-size: 9px;
    font-style: italic;
  }
  
  &:focus {
    outline: none;
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.3);
    width: 130px;
  }
`;

// Event Time Tabs
const EventTabsContainer = styled.div`
  display: flex;
  background: white;
  border-bottom: 1px solid #e0e0e0;
  padding: 0 16px;
  margin-bottom: 8px;
`;

const EventTab = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 12px 4px;
  background: transparent;
  color: ${props => props.$active ? '#2fce98' : '#999'};
  border: none;
  border-bottom: ${props => props.$active ? '3px solid #2fce98' : '3px solid transparent'};
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;

  &:hover {
    color: #2fce98;
  }
`;

const TabIcon = styled.div`
  font-size: 16px;
`;

const TabLabel = styled.div`
  font-size: 11px;
`;

const TabCount = styled.div<{ $active?: boolean }>`
  font-size: 9px;
  background: ${props => props.$active ? '#2fce98' : '#999'};
  color: white;
  padding: 1px 6px;
  border-radius: 10px;
  margin-top: 2px;
`;

// Content Area
const Content = styled.div`
  flex: 1;
  overflow-y: auto;
  padding-bottom: 100px;
`;

// Event Card
const EventCard = styled.div`
  background: white;
  border-radius: 12px;
  margin: 0 16px 12px 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #e0e0e0;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  }
`;

const EventImage = styled.div<{ $bgImage?: string }>`
  height: 120px;
  background: ${props => props.$bgImage 
    ? `url(${props.$bgImage})` 
    : 'linear-gradient(135deg, #667eea, #764ba2)'};
  background-size: cover;
  background-position: center;
  position: relative;
  display: flex;
  align-items: flex-end;
  padding: 12px;
`;

const EventCategory = styled.div<{ $category: string }>`
  position: absolute;
  top: 12px;
  left: 12px;
  background: ${props => {
    switch(props.$category) {
      case 'social': return '#4CAF50';
      case 'sports': return '#2196F3';
      case 'volunteer': return '#FF9800';
      case 'donate': return '#E91E63';
      case 'trips': return '#9C27B0';
      default: return '#607D8B';
    }
  }};
  color: white;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
`;

const EventDateBadge = styled.div`
  background: white;
  border-radius: 8px;
  padding: 6px 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const EventDay = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: #2fce98;
`;

const EventMonth = styled.div`
  font-size: 10px;
  color: #666;
  text-transform: uppercase;
`;

const EventContent = styled.div`
  padding: 12px;
`;

const EventHeader = styled.div`
  margin-bottom: 8px;
`;

const EventTitle = styled.h3`
  margin: 0 0 4px 0;
  font-size: 14px;
  color: #333;
  font-weight: 600;
`;

const EventTime = styled.div`
  font-size: 11px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const EventLocation = styled.div`
  font-size: 11px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 2px;
`;

const EventTags = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin: 8px 0;
`;

const EventTag = styled.span`
  background: #E3F2FD;
  color: #1976D2;
  padding: 3px 8px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 500;
`;

const EventFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 8px;
  border-top: 1px solid #f0f0f0;
`;

const AttendeeSection = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const AttendeeAvatars = styled.div`
  display: flex;
  margin-right: 8px;
`;

const AttendeeAvatar = styled.div<{ $index: number }>`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: 2px solid white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: white;
  margin-left: ${props => props.$index > 0 ? '-8px' : '0'};
  z-index: ${props => 3 - props.$index};
`;

const AttendeeCount = styled.span`
  font-size: 11px;
  color: #666;
`;

const EventPrice = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: #2fce98;
`;

const FreeEventBadge = styled.span`
  background: #4CAF50;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
`;

const ShareButton = styled.button`
  background: none;
  border: none;
  color: #666;
  font-size: 18px;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: #f5f5f5;
    color: #2fce98;
    transform: scale(1.1);
  }
`;

// Event Detail Modal
const EventDetailModal = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: ${props => props.$isOpen ? 'flex' : 'none'};
  align-items: flex-end;
  justify-content: center;
  z-index: 9999;
`;

const EventDetailContent = styled.div`
  background: white;
  border-radius: 20px 20px 0 0;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp 0.3s ease-out;
  
  @keyframes slideUp {
    from {
      transform: translateY(100%);
    }
    to {
      transform: translateY(0);
    }
  }
`;

const EventDetailHeader = styled.div`
  position: relative;
`;

const EventDetailImage = styled.div<{ $bgImage?: string }>`
  height: 200px;
  background: ${props => props.$bgImage 
    ? `url(${props.$bgImage})` 
    : 'linear-gradient(135deg, #667eea, #764ba2)'};
  background-size: cover;
  background-position: center;
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  z-index: 1;
  
  &:hover {
    background: white;
    transform: scale(1.1);
  }
`;

const EventDetailBody = styled.div`
  padding: 20px;
`;

const EventDetailTitle = styled.h2`
  margin: 0 0 8px 0;
  font-size: 20px;
  color: #333;
  font-weight: 600;
`;

const EventDetailMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
`;

const EventDetailMetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #666;
  
  span:first-child {
    font-size: 16px;
  }
`;

const EventDetailDescription = styled.p`
  font-size: 13px;
  color: #666;
  line-height: 1.5;
  margin: 16px 0;
`;

const EventDetailSection = styled.div`
  margin: 20px 0;
`;

const SectionTitle = styled.h3`
  font-size: 14px;
  color: #333;
  font-weight: 600;
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const AgendaList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const AgendaItemRow = styled.div`
  display: flex;
  gap: 12px;
  padding: 8px;
  background: #F8F9FA;
  border-radius: 8px;
  font-size: 12px;
`;

const AgendaTime = styled.div`
  font-weight: 600;
  color: #2fce98;
  min-width: 60px;
`;

const AgendaActivity = styled.div`
  color: #666;
`;

const CommittedProfilesSection = styled.div`
  margin: 20px 0;
`;

const ProfileGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
`;

const ProfileCard = styled.div`
  background: #F8F9FA;
  border-radius: 12px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  
  &:hover {
    background: white;
    border-color: #2fce98;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
`;

const ProfileHeader = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
`;

const ProfileAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: white;
`;

const ProfileInfo = styled.div`
  flex: 1;
`;

const ProfileName = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: #333;
`;

const ProfileMeta = styled.div`
  font-size: 10px;
  color: #666;
`;

const ProfileMatch = styled.div`
  background: #4CAF50;
  color: white;
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 9px;
  font-weight: 600;
`;

const ProfileTags = styled.div`
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  margin-top: 8px;
`;

const ProfileTag = styled.span`
  background: white;
  color: #666;
  padding: 2px 6px;
  border-radius: 6px;
  font-size: 9px;
  border: 1px solid #E0E0E0;
`;

const ProfileActions = styled.div`
  display: flex;
  gap: 6px;
  margin-top: 8px;
`;

const ProfileButton = styled.button<{ $primary?: boolean }>`
  flex: 1;
  padding: 6px;
  background: ${props => props.$primary ? '#2fce98' : 'white'};
  color: ${props => props.$primary ? 'white' : '#2fce98'};
  border: 1px solid #2fce98;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
`;

const EventActionButtons = styled.div`
  display: flex;
  gap: 12px;
  padding: 16px 20px;
  background: white;
  border-top: 1px solid #E0E0E0;
  position: sticky;
  bottom: 0;
`;

const ActionButton = styled.button<{ $primary?: boolean }>`
  flex: 1;
  padding: 12px;
  background: ${props => props.$primary ? '#2fce98' : 'white'};
  color: ${props => props.$primary ? 'white' : '#2fce98'};
  border: ${props => props.$primary ? 'none' : '1px solid #2fce98'};
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.$primary ? '#1E4039' : '#F5F5F5'};
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
`;

const TrendingBadge = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  background: linear-gradient(135deg, #FFD700, #FFA500);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

const FriendsGoingBadge = styled.div`
  background: #E8F5E9;
  color: #2E7D32;
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const OnlineBadge = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 10px;
  height: 10px;
  background: #4CAF50;
  border: 2px solid white;
  border-radius: 50%;
`;

// Profile Detail Modal (imported from BerseMatch)
const ProfileDetailModal = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: ${props => props.$isOpen ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
`;

const ProfileDetailContainer = styled.div`
  background: white;
  border-radius: 16px;
  max-width: 450px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
`;

// Floating Action Button for Creating Events
const CreateEventFAB = styled.button`
  position: fixed;
  bottom: 90px;
  right: 20px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #2fce98, #4A8B7C);
  color: white;
  border: none;
  box-shadow: 0 4px 12px rgba(45, 95, 79, 0.4), 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 300;
  z-index: 1000;
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 16px rgba(45, 95, 79, 0.5), 0 3px 6px rgba(0, 0, 0, 0.15);
  }
  
  &:active {
    transform: scale(0.95);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 50%;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), transparent);
    pointer-events: none;
  }
`;

export const BerseConnectScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [showProfileSidebar, setShowProfileSidebar] = useState(false);
  const [eventMode, setEventMode] = useState<'all' | 'social' | 'sports' | 'volunteer' | 'donate' | 'trips'>('all');
  const [activeTab, setActiveTab] = useState<'today' | 'week' | 'month' | 'friends' | 'trending'>('month');
  const [selectedCountry, setSelectedCountry] = useState('Malaysia');
  const [selectedCity, setSelectedCity] = useState('Kuala Lumpur');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showEventDetail, setShowEventDetail] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<CommittedProfile | null>(null);
  const [showProfileDetail, setShowProfileDetail] = useState(false);

  // Tab navigation
  const navigateTab = (direction: 'prev' | 'next') => {
    const tabs: typeof activeTab[] = ['today', 'week', 'month', 'friends', 'trending'];
    const currentIndex = tabs.indexOf(activeTab);
    let newIndex;
    
    if (direction === 'prev') {
      newIndex = currentIndex === 0 ? tabs.length - 1 : currentIndex - 1;
    } else {
      newIndex = currentIndex === tabs.length - 1 ? 0 : currentIndex + 1;
    }
    
    setActiveTab(tabs[newIndex]);
  };

  const getCurrentTabName = () => {
    const tabNames = {
      today: "TODAY'S EVENTS",
      week: 'THIS WEEK',
      month: 'THIS MONTH',
      friends: 'FRIENDS GOING',
      trending: 'TRENDING'
    };
    return tabNames[activeTab];
  };

  // Mode descriptions
  const modeDescriptions = {
    all: "Browse all types of events and activities",
    social: "Social gatherings, meetups, and community events",
    sports: "Sports activities, fitness sessions, and tournaments",
    volunteer: "Volunteer opportunities and community service",
    donate: "Charity events and donation drives",
    trips: "Group trips, tours, and travel adventures"
  };

  // Countries and cities data
  const countriesWithCities = {
    'Malaysia': ['Kuala Lumpur', 'Penang', 'Johor Bahru', 'Ipoh', 'Melaka'],
    'Indonesia': ['Jakarta', 'Surabaya', 'Bandung', 'Medan', 'Bali'],
    'Singapore': ['Central', 'Orchard', 'Marina Bay', 'Sentosa'],
    'Thailand': ['Bangkok', 'Chiang Mai', 'Phuket', 'Pattaya']
  };

  // Mock committed profiles
  const mockCommittedProfiles: CommittedProfile[] = [
    {
      id: 1,
      name: 'Sarah Lim',
      age: 28,
      profession: 'UX Designer',
      location: 'KLCC, KL',
      match: 92,
      personalityType: 'ENFJ-A',
      languages: 'EN, MS, CN',
      tags: ['Coffee Expert', 'Photography'],
      bio: 'Love exploring new places and meeting new people!',
      mutuals: ['Ahmad', 'Fatima'],
      isOnline: true
    },
    {
      id: 2,
      name: 'Ahmad Rahman',
      age: 32,
      profession: 'Software Engineer',
      location: 'Bangsar, KL',
      match: 88,
      personalityType: 'INTJ-T',
      languages: 'EN, MS, AR',
      tags: ['Tech', 'Startups'],
      bio: 'Building the future, one code at a time',
      mutuals: ['Sarah'],
      isOnline: false
    },
    {
      id: 3,
      name: 'Fatima Hassan',
      age: 26,
      profession: 'Marketing Manager',
      location: 'Subang, KL',
      match: 85,
      tags: ['Social Media', 'Events'],
      bio: 'Passionate about community building',
      mutuals: ['Sarah', 'Ahmad'],
      isOnline: true
    },
    {
      id: 4,
      name: 'David Wong',
      age: 30,
      profession: 'Photographer',
      location: 'Damansara, KL',
      match: 90,
      tags: ['Photography', 'Travel'],
      bio: 'Capturing moments that matter',
      isOnline: false
    }
  ];

  // Mock events data
  const mockEvents: Event[] = [
    {
      id: 'bersemukha-july-2025',
      title: 'BerseMukha July 2025: Slow Down You\'re Doing Fine',
      date: '2025-07-12',
      time: '14:00',
      location: 'KL Convention Centre',
      venue: 'Main Hall A',
      category: 'social',
      description: 'Join us for an inspiring afternoon of connection, mindfulness, and self-care. This month\'s theme reminds us to slow down, appreciate our journey, and connect with like-minded individuals in a supportive environment.',
      organizer: 'BerseMukha Official',
      organizerAvatar: '🌟',
      coverImage: '/images/bersemukha-july.jpg',
      price: 0,
      currency: 'RM',
      attendees: 245,
      maxAttendees: 300,
      tags: ['BerseMukha', 'Mindfulness', 'Community', 'Self-Care'],
      isOnline: false,
      friends: ['Sarah', 'Ahmad', 'Fatima', 'David'],
      committedProfiles: [
        {
          id: 101,
          name: 'Aisha Mohamed',
          age: 26,
          profession: 'Wellness Coach',
          location: 'Mont Kiara, KL',
          match: 95,
          personalityType: 'ENFP-A',
          languages: 'EN, MS, AR',
          tags: ['Mindfulness', 'Yoga', 'Community'],
          bio: 'Helping others find balance and peace in their journey',
          mutuals: ['Sarah', 'Fatima'],
          isOnline: true
        },
        {
          id: 102,
          name: 'Daniel Wong',
          age: 30,
          profession: 'Mental Health Advocate',
          location: 'Petaling Jaya',
          match: 89,
          personalityType: 'INFJ-T',
          languages: 'EN, MS, CN',
          tags: ['Mental Health', 'Writing', 'Music'],
          bio: 'Breaking stigmas, one conversation at a time',
          mutuals: ['Ahmad'],
          isOnline: false
        },
        {
          id: 103,
          name: 'Priya Nair',
          age: 29,
          profession: 'Life Coach',
          location: 'Damansara Heights',
          match: 91,
          personalityType: 'ENFJ-T',
          languages: 'EN, MS, TM',
          tags: ['Personal Growth', 'Meditation'],
          bio: 'Your journey matters, let\'s grow together',
          mutuals: ['Sarah', 'David'],
          isOnline: true
        },
        ...mockCommittedProfiles.slice(0, 5)
      ],
      trending: true,
      highlights: [
        '🧘 Guided meditation session',
        '☕ Coffee & conversation circles',
        '🎨 Creative expression workshop',
        '🤝 Speed networking session',
        '🎁 Self-care goodie bags'
      ],
      agenda: [
        { time: '14:00', activity: 'Registration & Welcome Coffee' },
        { time: '14:30', activity: 'Opening Circle & Theme Introduction' },
        { time: '15:00', activity: 'Guided Meditation: Slow Down & Breathe' },
        { time: '15:30', activity: 'Small Group Discussions' },
        { time: '16:15', activity: 'Creative Expression Workshop' },
        { time: '17:00', activity: 'Speed Networking & Connection Time' },
        { time: '18:00', activity: 'Closing Circle & Reflections' }
      ],
      requirements: [
        'Open mind and heart',
        'Comfortable clothing',
        'Personal journal (optional)'
      ]
    },
    {
      id: '1',
      title: 'Badminton @ KLCC Sports Complex',
      date: '2024-12-25',
      time: '19:00',
      location: 'KLCC Sports Complex',
      venue: 'Court 3 & 4',
      category: 'sports',
      description: 'Weekly badminton session for all skill levels. Come join us for some fun games and make new friends!',
      organizer: 'KL Badminton Club',
      price: 15,
      currency: 'RM',
      attendees: 12,
      maxAttendees: 20,
      tags: ['Badminton', 'Sports', 'Fitness'],
      isOnline: false,
      friends: ['Sarah', 'Ahmad'],
      committedProfiles: mockCommittedProfiles.slice(0, 3),
      trending: true,
      highlights: ['All levels welcome', 'Equipment provided', 'Post-game dinner'],
      agenda: [
        { time: '19:00', activity: 'Warm-up & Team Formation' },
        { time: '19:30', activity: 'Game Sessions' },
        { time: '21:00', activity: 'Cool Down & Social' }
      ]
    },
    {
      id: '2',
      title: 'Coffee & Code Meetup',
      date: '2024-12-25',
      time: '10:00',
      location: 'Common Ground, Damansara',
      venue: 'Event Space',
      category: 'social',
      description: 'Monthly gathering for developers to share knowledge, work on projects, and network over coffee.',
      organizer: 'Tech Community KL',
      price: 0,
      currency: 'RM',
      attendees: 25,
      maxAttendees: 30,
      tags: ['Tech', 'Networking', 'Coffee'],
      isOnline: false,
      friends: ['David'],
      committedProfiles: mockCommittedProfiles,
      highlights: ['Free coffee', 'Lightning talks', 'Project showcase']
    },
    {
      id: '3',
      title: 'Beach Cleanup Drive',
      date: '2024-12-26',
      time: '07:00',
      location: 'Port Dickson Beach',
      venue: 'Teluk Kemang',
      category: 'volunteer',
      description: 'Join us in keeping our beaches clean! All equipment provided.',
      organizer: 'Green Earth Malaysia',
      price: 0,
      currency: 'RM',
      attendees: 45,
      maxAttendees: 100,
      tags: ['Environment', 'Volunteer', 'Community'],
      isOnline: false,
      friends: ['Fatima', 'Sarah', 'Ahmad'],
      committedProfiles: mockCommittedProfiles.slice(1, 4),
      trending: true,
      requirements: ['Bring water bottle', 'Wear comfortable clothes', 'Sun protection']
    },
    {
      id: '4',
      title: 'Charity Iftar for Orphans',
      date: '2024-12-27',
      time: '18:00',
      location: 'Masjid Wilayah',
      venue: 'Main Hall',
      category: 'donate',
      description: 'Annual iftar gathering to support local orphanages. Donations welcome.',
      organizer: 'Mercy Malaysia',
      price: 50,
      currency: 'RM',
      attendees: 200,
      maxAttendees: 300,
      tags: ['Charity', 'Iftar', 'Community'],
      isOnline: false,
      friends: [],
      committedProfiles: mockCommittedProfiles.slice(0, 2)
    },
    {
      id: '5',
      title: 'Cameron Highlands Weekend Trip',
      date: '2024-12-28',
      time: '06:00',
      location: 'Meeting: KL Sentral',
      venue: 'Main Entrance',
      category: 'trips',
      description: '3D2N trip to Cameron Highlands. Includes transport, accommodation, and guided tours.',
      organizer: 'Adventure Club KL',
      price: 350,
      currency: 'RM',
      attendees: 18,
      maxAttendees: 25,
      tags: ['Travel', 'Nature', 'Adventure'],
      isOnline: false,
      friends: ['Sarah', 'Ahmad', 'David', 'Fatima'],
      committedProfiles: mockCommittedProfiles,
      trending: true,
      highlights: ['Tea plantation visit', 'Strawberry farm', 'Mossy forest trek']
    },
    {
      id: '6',
      title: 'Online Islamic Finance Workshop',
      date: '2024-12-25',
      time: '20:00',
      location: 'Online',
      venue: 'Zoom',
      category: 'social',
      description: 'Learn about Islamic finance principles and halal investment opportunities.',
      organizer: 'Islamic Finance Institute',
      price: 25,
      currency: 'RM',
      attendees: 78,
      maxAttendees: 100,
      tags: ['Education', 'Finance', 'Islamic'],
      isOnline: true,
      meetingLink: 'https://zoom.us/j/123456',
      friends: [],
      committedProfiles: []
    }
  ];

  const getFilteredEvents = () => {
    let filtered = [...mockEvents];
    
    // Filter by category
    if (eventMode !== 'all') {
      filtered = filtered.filter(event => event.category === eventMode);
    }
    
    // Filter by time period
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const weekEnd = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const monthEnd = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    switch(activeTab) {
      case 'today':
        filtered = filtered.filter(event => event.date === todayStr);
        break;
      case 'week':
        filtered = filtered.filter(event => {
          const eventDate = new Date(event.date);
          return eventDate >= today && eventDate <= weekEnd;
        });
        break;
      case 'month':
        filtered = filtered.filter(event => {
          const eventDate = new Date(event.date);
          return eventDate >= today && eventDate <= monthEnd;
        });
        break;
      case 'friends':
        filtered = filtered.filter(event => event.friends.length > 0);
        break;
      case 'trending':
        filtered = filtered.filter(event => event.trending);
        break;
    }
    
    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    return filtered;
  };

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setShowEventDetail(true);
  };

  const handleProfileClick = (profile: CommittedProfile) => {
    setSelectedProfile(profile);
    setShowProfileDetail(true);
  };

  const handleJoinEvent = async () => {
    if (!selectedEvent) return;
    
    try {
      // Show initial success message
      alert(`Successfully joined "${selectedEvent.title}"! You'll receive a confirmation email.`);
      
      // Try to add to Google Calendar
      const isCalendarConnected = googleCalendarService.isUserSignedIn();
      
      if (!isCalendarConnected) {
        // Prompt user to connect Google Calendar
        const shouldConnect = window.confirm(
          'Would you like to connect your Google Calendar to automatically add this event?\n\n' +
          'This will allow BerseMuka to:\n' +
          '• Automatically add events you join to your calendar\n' +
          '• Send you reminders before events\n' +
          '• Sync your availability'
        );
        
        if (shouldConnect) {
          try {
            await googleCalendarService.initClient();
            await googleCalendarService.signIn();
          } catch (error) {
            console.error('Failed to connect Google Calendar:', error);
            // Continue without calendar - event is already joined
          }
        }
      }
      
      // If calendar is connected (either already or just now), add the event
      if (googleCalendarService.isUserSignedIn()) {
        try {
          // Format event for Google Calendar
          const calendarEvent = {
            summary: selectedEvent.title,
            description: `${selectedEvent.description}\n\nOrganized by: ${selectedEvent.organizer}\nCategory: ${selectedEvent.category}\n\n🎯 Event created via BerseMuka`,
            location: `${selectedEvent.venue}, ${selectedEvent.location}`,
            start: {
              dateTime: new Date(`${selectedEvent.date} ${selectedEvent.time}`).toISOString(),
              timeZone: 'Asia/Kuala_Lumpur',
            },
            end: {
              // Assume 2 hour duration if not specified
              dateTime: new Date(new Date(`${selectedEvent.date} ${selectedEvent.time}`).getTime() + 2 * 60 * 60 * 1000).toISOString(),
              timeZone: 'Asia/Kuala_Lumpur',
            },
            reminders: {
              useDefault: false,
              overrides: [
                { method: 'email', minutes: 24 * 60 }, // 1 day before
                { method: 'popup', minutes: 60 }, // 1 hour before
              ],
            },
          };
          
          await googleCalendarService.createEvent(calendarEvent);
          
          // Show calendar success notification
          const notification = document.createElement('div');
          notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #10B981;
            color: white;
            padding: 16px 20px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 12px;
            animation: slideIn 0.3s ease-out;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          `;
          notification.innerHTML = `
            <span style="font-size: 24px;">📅</span>
            <div>
              <div style="font-weight: 600; margin-bottom: 2px;">Added to Google Calendar!</div>
              <div style="font-size: 14px; opacity: 0.9;">You'll receive reminders before the event</div>
            </div>
          `;
          document.body.appendChild(notification);
          
          // Add animation
          const style = document.createElement('style');
          style.textContent = `
            @keyframes slideIn {
              from {
                transform: translateX(100%);
                opacity: 0;
              }
              to {
                transform: translateX(0);
                opacity: 1;
              }
            }
          `;
          document.head.appendChild(style);
          
          // Remove notification after 5 seconds
          setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in forwards';
            notification.style.animationName = 'slideOut';
            setTimeout(() => {
              document.body.removeChild(notification);
              document.head.removeChild(style);
            }, 300);
          }, 5000);
          
          // Add slide out animation
          const slideOutStyle = document.createElement('style');
          slideOutStyle.textContent = `
            @keyframes slideOut {
              from {
                transform: translateX(0);
                opacity: 1;
              }
              to {
                transform: translateX(100%);
                opacity: 0;
              }
            }
          `;
          document.head.appendChild(slideOutStyle);
          
        } catch (error) {
          console.error('Failed to add event to Google Calendar:', error);
          // Don't show error to user - event join was successful
        }
      }
      
      // Update user's joined events in context and award points for BerseMukha events
      if (user && updateUser) {
        let updatedUser = {
          ...user,
          joinedEvents: [...(user.joinedEvents || []), selectedEvent.id]
        };
        
        // Award 30 points for BerseMukha events (category check)
        if (selectedEvent.title?.toLowerCase().includes('bersemuka') || 
            selectedEvent.organizer?.toLowerCase().includes('bersemuka') ||
            selectedEvent.description?.toLowerCase().includes('bersemuka')) {
          updatedUser.points = (updatedUser.points || 0) + 30;
          
          // Show points notification
          const pointsNotification = document.createElement('div');
          pointsNotification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 16px 20px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10001;
            display: flex;
            align-items: center;
            gap: 12px;
            animation: slideIn 0.3s ease-out;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          `;
          pointsNotification.innerHTML = `
            <span style="font-size: 24px;">🎉</span>
            <div>
              <div style="font-weight: 600; margin-bottom: 2px;">+30 BersePoints!</div>
              <div style="font-size: 14px; opacity: 0.9;">Awarded for joining BerseMukha event</div>
            </div>
          `;
          document.body.appendChild(pointsNotification);
          
          // Remove notification after 4 seconds
          setTimeout(() => {
            pointsNotification.style.animation = 'slideOut 0.3s ease-in forwards';
            setTimeout(() => {
              if (document.body.contains(pointsNotification)) {
                document.body.removeChild(pointsNotification);
              }
            }, 300);
          }, 4000);
        }
        
        updateUser(updatedUser);
      }
      
      setShowEventDetail(false);
    } catch (error) {
      console.error('Error joining event:', error);
      alert('Failed to join event. Please try again.');
    }
  };

  const handleShareEvent = (event?: Event) => {
    const eventToShare = event || selectedEvent;
    if (!eventToShare) return;

    const shareText = `🎉 Join me at ${eventToShare.title}!\n\n📅 ${eventToShare.date} at ${eventToShare.time}\n📍 ${eventToShare.location}${eventToShare.venue ? ` • ${eventToShare.venue}` : ''}\n\n${eventToShare.description}\n\nDownload BerseMuka app to join events and meet amazing people!`;
    const shareUrl = window.location.href;

    // Create sharing options
    const showShareOptions = () => {
      const options = [
        {
          name: 'WhatsApp',
          action: () => {
            const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`;
            window.open(whatsappUrl, '_blank');
          }
        },
        {
          name: 'Instagram Story',
          action: () => {
            // For Instagram, we'll copy to clipboard and guide user
            navigator.clipboard.writeText(shareText + '\n\n' + shareUrl).then(() => {
              alert('📋 Event details copied!\n\nNow you can:\n1. Open Instagram\n2. Create a story\n3. Paste the event details\n4. Share with your followers!');
            });
          }
        },
        {
          name: 'Other Apps',
          action: () => {
            if (navigator.share) {
              navigator.share({
                title: eventToShare.title,
                text: shareText,
                url: shareUrl
              }).catch(console.error);
            } else {
              navigator.clipboard.writeText(shareText + '\n\n' + shareUrl).then(() => {
                alert('📋 Event details copied to clipboard!');
              }).catch(() => {
                prompt('Copy this text to share:', shareText + '\n\n' + shareUrl);
              });
            }
          }
        }
      ];

      const choice = prompt(
        'Share this event via:\n\n1. WhatsApp\n2. Instagram Story\n3. Other Apps\n\nEnter 1, 2, or 3:'
      );

      if (choice === '1') options[0].action();
      else if (choice === '2') options[1].action();
      else if (choice === '3') options[2].action();
    };

    showShareOptions();
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = date.getDate();
    const month = date.toLocaleDateString('en', { month: 'short' });
    return { day, month };
  };

  return (
    <Container>
      <StatusBar />
      <CompactHeader onMenuClick={() => setShowProfileSidebar(true)} />
      <ProfileSidebar 
        isOpen={showProfileSidebar}
        onClose={() => setShowProfileSidebar(false)}
      />

      {/* Connection Mode Card */}
      <ConnectionModeCard>
        <ModeTitle>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            📅 Event Mode
          </div>
          <TabNavigation>
            <TabNavButton onClick={() => navigateTab('prev')}>‹</TabNavButton>
            <TabNameDisplay>{getCurrentTabName()}</TabNameDisplay>
            <TabNavButton onClick={() => navigateTab('next')}>›</TabNavButton>
          </TabNavigation>
        </ModeTitle>
        <ModeDescription>{modeDescriptions[eventMode]}</ModeDescription>
        <ModeSelector>
          <ModeButton $active={eventMode === 'all'} onClick={() => setEventMode('all')}>
            All
          </ModeButton>
          <ModeButton $active={eventMode === 'social'} onClick={() => setEventMode('social')}>
            Social
          </ModeButton>
          <ModeButton $active={eventMode === 'sports'} onClick={() => setEventMode('sports')}>
            Sports
          </ModeButton>
          <ModeButton 
            $active={false} 
            onClick={(e) => { e.preventDefault(); alert('Volunteer feature coming soon!'); }}
            style={{ opacity: 0.7, cursor: 'not-allowed' }}
          >
            Volunteer
            <CollabBadge>Soon</CollabBadge>
          </ModeButton>
          <ModeButton 
            $active={false} 
            onClick={(e) => { e.preventDefault(); alert('Donate feature coming soon!'); }}
            style={{ opacity: 0.7, cursor: 'not-allowed' }}
          >
            Donate
            <CollabBadge>Soon</CollabBadge>
          </ModeButton>
          <ModeButton 
            $active={false} 
            onClick={(e) => { e.preventDefault(); alert('Trips feature coming soon!'); }}
            style={{ opacity: 0.7, cursor: 'not-allowed' }}
          >
            Trips
            <CollabBadge>Soon</CollabBadge>
          </ModeButton>
        </ModeSelector>
        
        <FilterDivider />
        
        <LocationFilterSection>
          <LocationFilterLabel>Find events everywhere</LocationFilterLabel>
          <FilterOptions>
            <CompactDropdown 
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
            >
              {Object.keys(countriesWithCities).map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </CompactDropdown>
            <CompactDropdown 
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
            >
              {selectedCountry && countriesWithCities[selectedCountry as keyof typeof countriesWithCities].map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </CompactDropdown>
            <SearchInput
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </FilterOptions>
        </LocationFilterSection>
      </ConnectionModeCard>


      <Content>
        {getFilteredEvents().length === 0 ? (
          <div style={{
            padding: '40px 20px',
            textAlign: 'center',
            color: '#666'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📅</div>
            <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
              No events found
            </div>
            <div style={{ fontSize: '12px', color: '#999' }}>
              Try adjusting your filters or check back later
            </div>
          </div>
        ) : (
          getFilteredEvents().map(event => {
            const { day, month } = formatDate(event.date);
            return (
              <EventCard key={event.id} onClick={() => handleEventClick(event)}>
                <EventImage $bgImage={event.coverImage}>
                  <EventCategory $category={event.category}>
                    {event.category}
                  </EventCategory>
                  {event.trending && (
                    <TrendingBadge>
                      🔥 Trending
                    </TrendingBadge>
                  )}
                  <EventDateBadge>
                    <EventDay>{day}</EventDay>
                    <EventMonth>{month}</EventMonth>
                  </EventDateBadge>
                </EventImage>
                
                <EventContent>
                  <EventHeader>
                    <EventTitle>{event.title}</EventTitle>
                    <EventTime>
                      🕐 {event.time} {event.isOnline && '• 🌐 Online'}
                    </EventTime>
                    <EventLocation>
                      📍 {event.location} {event.venue && `• ${event.venue}`}
                    </EventLocation>
                  </EventHeader>
                  
                  <EventTags>
                    {event.tags.slice(0, 3).map(tag => (
                      <EventTag key={tag}>{tag}</EventTag>
                    ))}
                    {event.friends.length > 0 && (
                      <FriendsGoingBadge>
                        👥 {event.friends.length} friends going
                      </FriendsGoingBadge>
                    )}
                  </EventTags>
                  
                  <EventFooter>
                    <AttendeeSection>
                      <AttendeeAvatars>
                        {event.committedProfiles.slice(0, 3).map((profile, index) => (
                          <AttendeeAvatar key={profile.id} $index={index}>
                            {profile.name[0]}
                          </AttendeeAvatar>
                        ))}
                      </AttendeeAvatars>
                      <AttendeeCount>
                        {event.attendees}/{event.maxAttendees} going
                      </AttendeeCount>
                    </AttendeeSection>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <ShareButton 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShareEvent(event);
                        }}
                        title="Share event"
                      >
                        📤
                      </ShareButton>
                      {event.price === 0 ? (
                        <FreeEventBadge>FREE</FreeEventBadge>
                      ) : (
                        <EventPrice>{event.currency} {event.price}</EventPrice>
                      )}
                    </div>
                  </EventFooter>
                </EventContent>
              </EventCard>
            );
          })
        )}
      </Content>

      {/* Event Detail Modal */}
      <EventDetailModal $isOpen={showEventDetail} onClick={() => setShowEventDetail(false)}>
        <EventDetailContent onClick={(e) => e.stopPropagation()}>
          <EventDetailHeader>
            <EventDetailImage $bgImage={selectedEvent?.coverImage}>
              <CloseButton onClick={() => setShowEventDetail(false)}>×</CloseButton>
              {selectedEvent?.trending && (
                <TrendingBadge>🔥 Trending</TrendingBadge>
              )}
            </EventDetailImage>
          </EventDetailHeader>
          
          <EventDetailBody>
            <EventDetailTitle>{selectedEvent?.title}</EventDetailTitle>
            
            <EventDetailMeta>
              <EventDetailMetaItem>
                <span>📅</span>
                <span>{selectedEvent?.date} at {selectedEvent?.time}</span>
              </EventDetailMetaItem>
              <EventDetailMetaItem>
                <span>📍</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span>{selectedEvent?.location} • {selectedEvent?.venue}</span>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      `${selectedEvent?.venue || ''} ${selectedEvent?.location || ''}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: '#2196F3',
                      fontSize: '12px',
                      fontWeight: '600',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 8px',
                      background: '#E3F2FD',
                      borderRadius: '6px',
                      width: 'fit-content',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#BBDEFB';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#E3F2FD';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    🗺️ View on Google Maps
                  </a>
                </div>
              </EventDetailMetaItem>
              <EventDetailMetaItem>
                <span>👤</span>
                <span>Organized by {selectedEvent?.organizer}</span>
              </EventDetailMetaItem>
              <EventDetailMetaItem>
                <span>👥</span>
                <span>{selectedEvent?.attendees}/{selectedEvent?.maxAttendees} attendees</span>
              </EventDetailMetaItem>
              {selectedEvent?.isOnline && (
                <EventDetailMetaItem>
                  <span>🌐</span>
                  <span>Online Event • Meeting link will be shared</span>
                </EventDetailMetaItem>
              )}
            </EventDetailMeta>
            
            <EventDetailDescription>
              {selectedEvent?.description}
            </EventDetailDescription>
            
            {selectedEvent?.highlights && selectedEvent.highlights.length > 0 && (
              <EventDetailSection>
                <SectionTitle>✨ Highlights</SectionTitle>
                {selectedEvent.highlights.map((highlight, index) => (
                  <div key={index} style={{ fontSize: '12px', color: '#666', marginBottom: '6px' }}>
                    • {highlight}
                  </div>
                ))}
              </EventDetailSection>
            )}
            
            {selectedEvent?.agenda && selectedEvent.agenda.length > 0 && (
              <EventDetailSection>
                <SectionTitle>📋 Agenda</SectionTitle>
                <AgendaList>
                  {selectedEvent.agenda.map((item, index) => (
                    <AgendaItemRow key={index}>
                      <AgendaTime>{item.time}</AgendaTime>
                      <AgendaActivity>{item.activity}</AgendaActivity>
                    </AgendaItemRow>
                  ))}
                </AgendaList>
              </EventDetailSection>
            )}
            
            {selectedEvent?.requirements && selectedEvent.requirements.length > 0 && (
              <EventDetailSection>
                <SectionTitle>📝 Requirements</SectionTitle>
                {selectedEvent.requirements.map((req, index) => (
                  <div key={index} style={{ fontSize: '12px', color: '#666', marginBottom: '6px' }}>
                    • {req}
                  </div>
                ))}
              </EventDetailSection>
            )}
            
            {selectedEvent?.committedProfiles && selectedEvent.committedProfiles.length > 0 && (
              <CommittedProfilesSection>
                <SectionTitle>
                  👥 People Attending ({selectedEvent.committedProfiles.length})
                </SectionTitle>
                <ProfileGrid>
                  {selectedEvent.committedProfiles.map(profile => (
                    <ProfileCard key={profile.id} onClick={() => handleProfileClick(profile)}>
                      <ProfileHeader>
                        <ProfileAvatar>
                          {profile.name[0]}
                          {profile.isOnline && <OnlineBadge />}
                        </ProfileAvatar>
                        <ProfileInfo>
                          <ProfileName>{profile.name}</ProfileName>
                          <ProfileMeta>{profile.profession}</ProfileMeta>
                        </ProfileInfo>
                        <ProfileMatch>{profile.match}%</ProfileMatch>
                      </ProfileHeader>
                      
                      <ProfileTags>
                        {profile.tags.slice(0, 3).map(tag => (
                          <ProfileTag key={tag}>{tag}</ProfileTag>
                        ))}
                      </ProfileTags>
                      
                      <ProfileActions>
                        <ProfileButton>View</ProfileButton>
                        <ProfileButton $primary>Connect</ProfileButton>
                      </ProfileActions>
                    </ProfileCard>
                  ))}
                </ProfileGrid>
              </CommittedProfilesSection>
            )}
          </EventDetailBody>
          
          <EventActionButtons>
            <ActionButton onClick={handleShareEvent}>
              📤 Share
            </ActionButton>
            <ActionButton $primary onClick={handleJoinEvent}>
              {selectedEvent?.price === 0 ? '✓ Join Event' : `💳 Pay ${selectedEvent?.currency} ${selectedEvent?.price}`}
            </ActionButton>
          </EventActionButtons>
        </EventDetailContent>
      </EventDetailModal>

      {/* Profile Detail Modal */}
      <ProfileDetailModal $isOpen={showProfileDetail} onClick={() => setShowProfileDetail(false)}>
        <ProfileDetailContainer onClick={(e) => e.stopPropagation()}>
          <div style={{ padding: '20px', borderBottom: '1px solid #E0E0E0', position: 'relative' }}>
            <CloseButton onClick={() => setShowProfileDetail(false)}>×</CloseButton>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                color: 'white',
                position: 'relative'
              }}>
                {selectedProfile?.name[0]}
                {selectedProfile?.isOnline && <OnlineBadge />}
              </div>
              <div style={{ flex: 1 }}>
                <h2 style={{ margin: '0 0 4px 0', fontSize: '18px', color: '#333' }}>
                  {selectedProfile?.name}
                </h2>
                <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#666' }}>
                  {selectedProfile?.profession} • {selectedProfile?.location}
                </p>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{
                    background: '#4CAF50',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: '600'
                  }}>
                    {selectedProfile?.match}% Match
                  </span>
                  {selectedProfile?.personalityType && (
                    <span style={{
                      background: '#E8F5E9',
                      color: '#2E7D32',
                      padding: '4px 8px',
                      borderRadius: '8px',
                      fontSize: '11px'
                    }}>
                      {selectedProfile.personalityType}
                    </span>
                  )}
                  {selectedProfile?.languages && (
                    <span style={{
                      background: '#E3F2FD',
                      color: '#1976D2',
                      padding: '4px 8px',
                      borderRadius: '8px',
                      fontSize: '11px'
                    }}>
                      {selectedProfile.languages}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div style={{ padding: '20px' }}>
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '14px', color: '#333', marginBottom: '8px' }}>About</h3>
              <p style={{ fontSize: '13px', color: '#666', lineHeight: 1.5 }}>
                {selectedProfile?.bio}
              </p>
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '14px', color: '#333', marginBottom: '8px' }}>Interests</h3>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {selectedProfile?.tags.map(tag => (
                  <span key={tag} style={{
                    background: '#F5F5F5',
                    color: '#666',
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '11px'
                  }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            
            {selectedProfile?.mutuals && selectedProfile.mutuals.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ fontSize: '14px', color: '#333', marginBottom: '8px' }}>
                  Mutual Friends ({selectedProfile.mutuals.length})
                </h3>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {selectedProfile.mutuals.map(mutual => (
                    <span key={mutual} style={{
                      background: '#F3E5F5',
                      color: '#7B1FA2',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '11px'
                    }}>
                      {mutual}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <ActionButton 
                onClick={() => {
                  alert(`Opening chat with ${selectedProfile?.name}...`);
                  setShowProfileDetail(false);
                }}
              >
                💬 Message
              </ActionButton>
              <ActionButton 
                $primary
                onClick={() => {
                  alert(`Friend request sent to ${selectedProfile?.name}!`);
                  setShowProfileDetail(false);
                }}
              >
                🤝 Add Friend
              </ActionButton>
            </div>
            
            <button
              onClick={() => {
                setShowProfileDetail(false);
                navigate('/match', { 
                  state: { 
                    profileId: selectedProfile?.id,
                    fromEvent: selectedEvent?.id 
                  }
                });
              }}
              style={{
                width: '100%',
                padding: '10px',
                background: 'transparent',
                border: '1px solid #E0E0E0',
                borderRadius: '8px',
                color: '#2fce98',
                fontSize: '12px',
                fontWeight: '500',
                marginTop: '12px',
                cursor: 'pointer'
              }}
            >
              View Full BerseMatch Profile →
            </button>
          </div>
        </ProfileDetailContainer>
      </ProfileDetailModal>

      {/* Floating Action Button for Creating Events */}
      <CreateEventFAB 
        onClick={() => navigate('/event/create')}
        title="Create Event"
      >
        +
      </CreateEventFAB>

      <MainNav 
        activeTab="connect"
        onTabPress={(tab) => {
          if (tab !== 'connect') {
            navigate(`/${tab === 'home' ? 'dashboard' : tab}`);
          }
        }}
      />
    </Container>
  );
};