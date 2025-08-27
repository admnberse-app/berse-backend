import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { StatusBar } from '../components/StatusBar/StatusBar';
import { CompactHeader } from '../components/CompactHeader/CompactHeader';
import { ProfileSidebar } from '../components/ProfileSidebar/ProfileSidebar';
import { MainNav } from '../components/MainNav/index';
import { googleCalendarService } from '../services/googleCalendar';
import { useAuth } from '../contexts/AuthContext';
import { UnifiedParticipants } from '../components/UnifiedParticipants';
import { EditEventModal } from '../components/EditEventModal';
import { EventPaymentModal } from '../components/EventPaymentModal';
import { shareEventWithImage } from '../utils/shareUtils';

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
  organization?: string;
  hosts?: string[];
  coverImage?: string;
  price: number;
  currency: string;
  attendees: number;
  maxAttendees: number;
  tags: string[];
  isOnline: boolean;
  meetingLink?: string;
  whatsappGroup?: string;
  mapLink?: string;
  friends: string[];
  committedProfiles: CommittedProfile[];
  trending?: boolean;
  highlights?: string[];
  agenda?: AgendaItem[];
  requirements?: string[];
  recurringType?: string;
  recurringDay?: string;
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

const ParticipantsButton = styled.button`
  background: #f0f9f6;
  border: 1px solid #2fce98;
  color: #2fce98;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  
  &:hover {
    background: #2fce98;
    color: white;
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

// Helper function to format time in 12-hour format with AM/PM
const formatTime12Hour = (time: string): string => {
  if (!time) return '';
  
  // Handle both HH:MM and HH:MM:SS formats
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  const min = minutes || '00';
  
  if (hour === 0) {
    return `12:${min} AM`;
  } else if (hour < 12) {
    return `${hour}:${min} AM`;
  } else if (hour === 12) {
    return `12:${min} PM`;
  } else {
    return `${hour - 12}:${min} PM`;
  }
};

// Helper function to format time range
const formatTimeRange = (startTime: string, endTime?: string): string => {
  const start = formatTime12Hour(startTime);
  if (!endTime || endTime === startTime) {
    return start;
  }
  const end = formatTime12Hour(endTime);
  
  // If both times have same AM/PM, show it only once
  const startPeriod = start.slice(-2);
  const endPeriod = end.slice(-2);
  
  if (startPeriod === endPeriod) {
    return `${start.slice(0, -3)} - ${end}`;
  }
  return `${start} - ${end}`;
};

export const BerseConnectScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [showProfileSidebar, setShowProfileSidebar] = useState(false);
  const [eventMode, setEventMode] = useState<'all' | 'social' | 'sports' | 'volunteer' | 'donate' | 'trips'>('all');
  const [activeTab, setActiveTab] = useState<'today' | 'week' | 'month' | 'all' | 'friends' | 'trending'>('all');
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showEventDetail, setShowEventDetail] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<CommittedProfile | null>(null);
  const [showProfileDetail, setShowProfileDetail] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);
  const [showEditEventModal, setShowEditEventModal] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<Event | null>(null);

  // Tab navigation
  const navigateTab = (direction: 'prev' | 'next') => {
    const tabs: typeof activeTab[] = ['today', 'week', 'month', 'all', 'friends', 'trending'];
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
      all: 'ALL EVENTS',
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
    'All': ['All Cities'],
    // ASEAN Countries
    'Malaysia': ['All Cities', 'Kuala Lumpur', 'Penang', 'Johor Bahru', 'Ipoh', 'Melaka', 'Kota Kinabalu', 'Kuching', 'Shah Alam', 'Petaling Jaya', 'Cyberjaya', 'Putrajaya', 'Seremban', 'Kuantan', 'Alor Setar'],
    'Indonesia': ['All Cities', 'Jakarta', 'Surabaya', 'Bandung', 'Medan', 'Semarang', 'Makassar', 'Palembang', 'Tangerang', 'Depok', 'Bekasi', 'Bali (Denpasar)', 'Yogyakarta', 'Malang', 'Bogor', 'Batam'],
    'Singapore': ['All Areas', 'Central', 'Orchard', 'Marina Bay', 'Sentosa', 'Jurong', 'Woodlands', 'Tampines', 'Ang Mo Kio'],
    'Thailand': ['All Cities', 'Bangkok', 'Chiang Mai', 'Phuket', 'Pattaya', 'Krabi', 'Koh Samui', 'Hua Hin', 'Ayutthaya', 'Khon Kaen', 'Hat Yai'],
    'Philippines': ['All Cities', 'Manila', 'Quezon City', 'Makati', 'Cebu City', 'Davao City', 'Baguio', 'Iloilo City', 'Cagayan de Oro', 'Zamboanga City'],
    'Vietnam': ['All Cities', 'Ho Chi Minh City', 'Hanoi', 'Da Nang', 'Hue', 'Nha Trang', 'Can Tho', 'Hai Phong', 'Vung Tau', 'Da Lat'],
    'Myanmar': ['All Cities', 'Yangon', 'Mandalay', 'Naypyidaw', 'Bagan', 'Inle Lake', 'Mawlamyine'],
    'Cambodia': ['All Cities', 'Phnom Penh', 'Siem Reap', 'Sihanoukville', 'Battambang', 'Kampot'],
    'Laos': ['All Cities', 'Vientiane', 'Luang Prabang', 'Pakse', 'Savannakhet', 'Vang Vieng'],
    'Brunei': ['All Areas', 'Bandar Seri Begawan', 'Kuala Belait', 'Seria', 'Tutong'],
    // Turkey
    'Turkey': ['All Cities', 'Istanbul', 'Ankara', 'Izmir', 'Bursa', 'Antalya', 'Adana', 'Konya', 'Gaziantep', 'Kayseri', 'Eskisehir', 'Trabzon', 'Bodrum', 'Cappadocia'],
    // Middle East
    'Saudi Arabia': ['All Cities', 'Riyadh', 'Jeddah', 'Mecca', 'Medina', 'Dammam', 'Khobar'],
    'UAE': ['All Cities', 'Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah'],
    'Qatar': ['All Cities', 'Doha', 'Al Wakrah', 'Al Khor', 'Al Rayyan'],
    // Other Popular Destinations
    'Germany': ['All Cities', 'Berlin', 'Munich', 'Hamburg', 'Frankfurt', 'Cologne', 'Stuttgart', 'Dusseldorf', 'Dortmund', 'Essen'],
    'United Kingdom': ['All Cities', 'London', 'Manchester', 'Birmingham', 'Edinburgh', 'Glasgow', 'Liverpool', 'Bristol', 'Leeds', 'Newcastle'],
    'United States': ['All Cities', 'New York', 'Los Angeles', 'Chicago', 'Houston', 'San Francisco', 'Seattle', 'Boston', 'Miami', 'Washington DC'],
    'Australia': ['All Cities', 'Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Gold Coast', 'Canberra', 'Newcastle'],
    'Japan': ['All Cities', 'Tokyo', 'Osaka', 'Kyoto', 'Yokohama', 'Nagoya', 'Kobe', 'Fukuoka', 'Sapporo'],
    'South Korea': ['All Cities', 'Seoul', 'Busan', 'Incheon', 'Daegu', 'Daejeon', 'Gwangju', 'Ulsan']
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

  // Load all events from database
  const loadEventsFromDatabase = async () => {
    try {
      const token = localStorage.getItem('bersemuka_token') || localStorage.getItem('auth_token');
      const API_BASE_URL = window.location.hostname === 'berse.app' || window.location.hostname === 'www.berse.app'
        ? 'https://api.berse.app'
        : '';
      
      const response = await axios.get(
        `${API_BASE_URL}/api/v1/events`,
        token ? {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        } : {}
      );
      
      if (response.data.success && response.data.data) {
        // Format the events to match our Event interface
        return response.data.data.map((event: any) => ({
          id: event.id,
          title: event.title || '',
          date: event.date ? event.date.split('T')[0] : new Date().toISOString().split('T')[0],
          time: event.time || '09:00',
          location: event.location || '',
          venue: event.venue || event.location || '',
          category: event.category || event.type || 'social',
          description: event.description || '',
          organizer: event.organizer || event.host?.fullName || 'Event Organizer',
          organizerAvatar: event.organizerAvatar || '⭐',
          organization: event.organization || '',
          hosts: event.hosts || [],
          coverImage: event.coverImage || '',
          price: event.price || 0,
          currency: event.currency || 'RM',
          attendees: event.attendees || 0,
          maxAttendees: event.maxAttendees || 50,
          tags: event.tags || [],
          isOnline: event.isOnline || false,
          meetingLink: event.meetingLink || undefined,
          whatsappGroup: event.whatsappGroup || undefined,
          mapLink: event.mapLink || undefined,
          friends: event.friends || [],
          committedProfiles: event.committedProfiles || [],
          trending: event.trending || false,
          highlights: event.highlights || [],
          agenda: event.agenda || [],
          requirements: event.requirements || []
        }));
      }
    } catch (error) {
      console.error('Failed to load events from database:', error);
    }
    return [];
  };

  // Get user created events from localStorage (fallback for offline)
  const getUserEvents = () => {
    const storedEvents = localStorage.getItem('userCreatedEvents');
    return storedEvents ? JSON.parse(storedEvents) : [];
  };

  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);

  // Load events on component mount and when navigating to the page
  useEffect(() => {
    const loadEvents = async () => {
      // Show cached events immediately if available
      const cachedEvents = localStorage.getItem('cached_events');
      if (cachedEvents) {
        try {
          const parsed = JSON.parse(cachedEvents);
          setAllEvents(parsed);
          setIsLoadingEvents(false);
        } catch (e) {
          console.error('Failed to parse cached events');
        }
      }
      
      const baseEvents = [];
      
      // Load events from database
      const dbEvents = await loadEventsFromDatabase();
      
      // Also get local events as fallback
      const localEvents = getUserEvents();
      
      // Merge database events with local events (avoiding duplicates)
      const allFetchedEvents = [...dbEvents];
      localEvents.forEach((localEvent: Event) => {
        if (!allFetchedEvents.find(e => e.id === localEvent.id)) {
          allFetchedEvents.push(localEvent);
        }
      });
      
      // Load committed profiles for all events
      const eventsWithProfiles = [...baseEvents, ...allFetchedEvents].map(event => {
      const eventJoinsKey = `event_joins_${event.id}`;
      const joins = JSON.parse(localStorage.getItem(eventJoinsKey) || '[]');
      
      // Convert joins to committed profiles
      const committedProfiles = joins.map((join: any) => {
        if (join.profile) {
          return join.profile;
        }
        // Create profile for older joins without profile data
        return {
          id: join.id || Date.now(),
          name: join.name,
          age: 25,
          profession: 'Professional',
          location: 'Kuala Lumpur',
          match: Math.floor(Math.random() * 20) + 80,
          personalityType: 'ENFJ',
          languages: 'EN, MS',
          tags: ['Community', 'Events'],
          bio: 'Event enthusiast',
          mutuals: [],
          isOnline: true
        };
      });
      
      return {
        ...event,
        committedProfiles: committedProfiles || [],
        attendees: event.attendees || committedProfiles.length
      };
    });
    
      setAllEvents(eventsWithProfiles);
      setIsLoadingEvents(false);
      
      // Cache events for faster next load
      localStorage.setItem('cached_events', JSON.stringify(eventsWithProfiles));
    };
    
    // Load events initially
    loadEvents();
    
    // Remove auto-refresh to prevent delays
    // Users can manually refresh if needed
  }, []);

  const getFilteredEvents = () => {
    let filtered = [...allEvents];
    
    // Filter by category (case-insensitive)
    if (eventMode !== 'all') {
      filtered = filtered.filter(event => {
        const eventCategory = (event.category || '').toLowerCase();
        return eventCategory === eventMode.toLowerCase();
      });
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
      case 'all':
        // Show all events, no date filtering
        // Only filter out past events
        filtered = filtered.filter(event => {
          const eventDate = new Date(event.date);
          return eventDate >= today || event.date === todayStr;
        });
        break;
      case 'friends':
        filtered = filtered.filter(event => event.friends.length > 0);
        break;
      case 'trending':
        filtered = filtered.filter(event => event.trending);
        break;
    }
    
    // Filter by location
    if (selectedCountry && selectedCountry !== 'All' && selectedCountry !== '') {
      filtered = filtered.filter(event => {
        const eventLocation = event.location?.toLowerCase() || '';
        const countryLower = selectedCountry.toLowerCase();
        
        // Check if event location includes the country
        const countryMatch = eventLocation.includes(countryLower) || 
                            eventLocation.includes('malaysia') && selectedCountry === 'Malaysia';
        
        // If no city selected or "All Cities", just match country
        if (!selectedCity || selectedCity === 'All Cities') {
          return countryMatch;
        }
        
        // Check if city matches
        const cityLower = selectedCity.toLowerCase();
        const cityMatch = eventLocation.includes(cityLower);
        
        return countryMatch || cityMatch;
      });
    }
    
    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    // Sort events by date (nearest to furthest)
    filtered.sort((a, b) => {
      const dateA = new Date(a.date + 'T' + (a.time || '00:00'));
      const dateB = new Date(b.date + 'T' + (b.time || '00:00'));
      return dateA.getTime() - dateB.getTime();
    });
    
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
    
    // Show payment modal for all events (including free events for confirmation)
    setShowPaymentModal(true);
    setShowEventDetail(false);
    return;
    
    try {
      // First, try to join via API if user is authenticated
      const token = localStorage.getItem('bersemuka_token') || localStorage.getItem('auth_token');
      if (token && selectedEvent.id) {
        try {
          const API_BASE_URL = window.location.hostname === 'berse.app' || window.location.hostname === 'www.berse.app'
            ? 'https://api.berse.app'
            : '';
          
          const response = await axios.post(
            `${API_BASE_URL}/api/v1/events/${selectedEvent.id}/join`,
            {},
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );
          
          if (response.data.success) {
            console.log('Successfully joined event via API:', response.data);
            // Update local state with the RSVP data
            const rsvpData = response.data.data;
            
            // Update event attendees count
            const updatedEvent = { ...selectedEvent };
            updatedEvent.attendees = (updatedEvent.attendees || 0) + 1;
            
            // Update the event in allEvents
            setAllEvents(prevEvents => 
              prevEvents.map(evt => evt.id === selectedEvent.id ? updatedEvent : evt)
            );
            
            // Update selected event
            setSelectedEvent(updatedEvent);
          }
        } catch (apiError: any) {
          console.error('API join failed:', apiError);
          // Check if already joined
          if (apiError.response?.data?.message?.includes('Already RSVP')) {
            alert('You have already joined this event!');
            return;
          }
          // Continue with localStorage fallback for other errors
          console.log('Falling back to localStorage join');
        }
      }
      // Create committed profile data
      const committedProfile: CommittedProfile = {
        id: Date.now(),
        name: user?.fullName || 'Anonymous User',
        age: user?.age || 25,
        profession: user?.profession || 'Professional',
        location: user?.city || 'Kuala Lumpur',
        match: Math.floor(Math.random() * 20) + 80,
        personalityType: user?.personalityType || 'ENFJ',
        languages: user?.languages || 'EN, MS',
        tags: user?.topInterests?.slice(0, 2) || ['Community', 'Events'],
        bio: user?.bio || 'Event enthusiast',
        mutuals: [],
        isOnline: true
      };
      
      // Get user profile data for join tracking
      const userProfile = {
        id: Date.now(),
        name: user?.fullName || 'Anonymous User',
        email: user?.email || '',
        joinedAt: new Date().toISOString(),
        eventId: selectedEvent.id,
        eventTitle: selectedEvent.title,
        profile: committedProfile
      };
      
      // Store profile data in localStorage
      const eventJoinsKey = `event_joins_${selectedEvent.id}`;
      const existingJoins = JSON.parse(localStorage.getItem(eventJoinsKey) || '[]');
      
      // Check if user already joined
      const alreadyJoined = existingJoins.some((join: any) => join.email === userProfile.email);
      
      if (!alreadyJoined) {
        existingJoins.push(userProfile);
        localStorage.setItem(eventJoinsKey, JSON.stringify(existingJoins));
        
        // Also store in a general list of all event joins
        const allJoins = JSON.parse(localStorage.getItem('all_event_joins') || '[]');
        allJoins.push(userProfile);
        localStorage.setItem('all_event_joins', JSON.stringify(allJoins));
        
        // Update the event's committed profiles
        const updatedEvent = { ...selectedEvent };
        updatedEvent.committedProfiles = [...(updatedEvent.committedProfiles || []), committedProfile];
        updatedEvent.attendees = (updatedEvent.attendees || 0) + 1;
        
        // Update the event in allEvents
        setAllEvents(prevEvents => 
          prevEvents.map(evt => evt.id === selectedEvent.id ? updatedEvent : evt)
        );
        
        // Update selected event
        setSelectedEvent(updatedEvent);
      }
      
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
          } catch (error: any) {
            console.error('Failed to connect Google Calendar:', error);
            
            // Show specific popup blocker instructions
            if (error.message && error.message.includes('popup')) {
              alert(
                '⚠️ Popup Blocked!\n\n' +
                'Please enable popups to connect Google Calendar:\n\n' +
                '1. Look for the popup blocked icon in your address bar (usually on the right)\n' +
                '2. Click it and select "Always allow popups from localhost:5173"\n' +
                '3. Then try joining the event again\n\n' +
                'Or you can manually allow popups in your browser settings.'
              );
            } else {
              alert('Failed to connect Google Calendar. You can still join the event without calendar sync.');
            }
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

  const getParticipantCount = (eventId: string) => {
    if (eventId.includes('berseminton')) {
      const registrations = JSON.parse(localStorage.getItem('berseMintonRegistrations') || '[]');
      return registrations.filter((reg: any) => reg.eventId === eventId).length;
    } else {
      const eventJoinsKey = `event_joins_${eventId}`;
      const participants = JSON.parse(localStorage.getItem(eventJoinsKey) || '[]');
      return participants.length;
    }
  };

  const handleViewParticipants = (event: Event, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedEvent(event);
    setShowParticipantsModal(true);
  };

  const handleEditEvent = (event: Event, e: React.MouseEvent) => {
    e.stopPropagation();
    setEventToEdit(event);
    setShowEditEventModal(true);
  };

  const handleSaveEvent = (updatedEvent: Event) => {
    // Update the event in allEvents
    setAllEvents(prevEvents => 
      prevEvents.map(evt => evt.id === updatedEvent.id ? updatedEvent : evt)
    );
  };

  const handleDeleteEvent = (eventId: string) => {
    // Remove the event from allEvents
    setAllEvents(prevEvents => 
      prevEvents.filter(evt => evt.id !== eventId)
    );
    
    // Clear selected event if it was deleted
    if (selectedEvent && selectedEvent.id === eventId) {
      setSelectedEvent(null);
      setShowEventDetail(false);
    }
  };

  // Check if an event is user-created
  const isUserCreatedEvent = (eventId: string) => {
    const userEvents = getUserEvents();
    return userEvents.some((e: Event) => e.id === eventId);
  };

  const handleShareEvent = async (event?: Event) => {
    const eventToShare = event || selectedEvent;
    if (!eventToShare) return;

    // Use the new image sharing feature
    await shareEventWithImage(eventToShare);
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
            $active={eventMode === 'volunteer'} 
            onClick={() => setEventMode('volunteer')}
            style={{ 
              background: eventMode === 'volunteer' ? '' : '#757575',
              opacity: eventMode === 'volunteer' ? 1 : 0.8,
              color: eventMode === 'volunteer' ? '' : '#ccc',
              border: eventMode === 'volunteer' ? '' : '1px solid #555'
            }}
          >
            Volunteer
            <CollabBadge style={{ background: '#666', color: '#aaa' }}>Soon</CollabBadge>
          </ModeButton>
          <ModeButton 
            $active={eventMode === 'donate'} 
            onClick={() => setEventMode('donate')}
            style={{ 
              background: eventMode === 'donate' ? '' : '#757575',
              opacity: eventMode === 'donate' ? 1 : 0.8,
              color: eventMode === 'donate' ? '' : '#ccc',
              border: eventMode === 'donate' ? '' : '1px solid #555'
            }}
          >
            Donate
            <CollabBadge style={{ background: '#666', color: '#aaa' }}>Soon</CollabBadge>
          </ModeButton>
          <ModeButton 
            $active={eventMode === 'trips'} 
            onClick={() => setEventMode('trips')}
            style={{ 
              background: eventMode === 'trips' ? '' : '#757575',
              opacity: eventMode === 'trips' ? 1 : 0.8,
              color: eventMode === 'trips' ? '' : '#ccc',
              border: eventMode === 'trips' ? '' : '1px solid #555'
            }}
          >
            Trips
            <CollabBadge style={{ background: '#666', color: '#aaa' }}>Soon</CollabBadge>
          </ModeButton>
        </ModeSelector>
        
        <FilterDivider />
        
        <LocationFilterSection>
          <LocationFilterLabel>
            {(selectedCountry && selectedCountry !== 'All' && selectedCountry !== '') ? (
              <span style={{ fontSize: '8px', opacity: 0.7 }}>
                {selectedCity && selectedCity !== 'All Cities' ? `${selectedCity}, ` : ''}{selectedCountry}
              </span>
            ) : (
              <span>Find events everywhere</span>
            )}
          </LocationFilterLabel>
          <FilterOptions>
            <CompactDropdown 
              value={selectedCountry}
              onChange={(e) => {
                const newCountry = e.target.value;
                setSelectedCountry(newCountry);
                
                // Reset city when country changes
                if (newCountry === '' || newCountry === 'All') {
                  setSelectedCity('All Cities');
                } else {
                  setSelectedCity('All Cities'); // Default to All Cities for new country
                }
              }}
              title="Select Country"
            >
              <option value="">Clear</option>
              {Object.keys(countriesWithCities).map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </CompactDropdown>
            <CompactDropdown 
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              disabled={!selectedCountry || selectedCountry === ''}
              title="Select City"
            >
              {selectedCountry && countriesWithCities[selectedCountry as keyof typeof countriesWithCities]?.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </CompactDropdown>
            <SearchInput
              type="text"
              placeholder={selectedCountry && selectedCountry !== 'All' ? 'search events' : 'Search events...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                fontStyle: selectedCountry && selectedCountry !== 'All' && !searchQuery ? 'italic' : 'normal'
              }}
            />
          </FilterOptions>
        </LocationFilterSection>
      </ConnectionModeCard>


      <Content>
        {isLoadingEvents ? (
          <div style={{
            padding: '40px 20px',
            textAlign: 'center',
            color: '#666'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
            <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
              Loading events...
            </div>
            <div style={{ fontSize: '12px', color: '#999' }}>
              Connecting to server, please wait
            </div>
          </div>
        ) : getFilteredEvents().length === 0 ? (
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
                      🕐 {formatTimeRange(event.time, event.endTime)} {event.isOnline && '• 🌐 Online'}
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
                      {isUserCreatedEvent(event.id) && (
                        <ParticipantsButton
                          onClick={(e) => handleEditEvent(event, e)}
                          title="Edit event"
                          style={{ background: '#fff3cd', borderColor: '#ffc107', color: '#856404' }}
                        >
                          ✏️ Edit
                        </ParticipantsButton>
                      )}
                      <ParticipantsButton
                        onClick={(e) => handleViewParticipants(event, e)}
                        title="View participants"
                      >
                        👥 {getParticipantCount(event.id) || 0}
                      </ParticipantsButton>
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
                <span>{selectedEvent?.date} at {formatTimeRange(selectedEvent?.time || '', selectedEvent?.endTime)}</span>
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
                <span>🏢</span>
                <span>By {selectedEvent?.organization || selectedEvent?.organizer}</span>
              </EventDetailMetaItem>
              {selectedEvent?.hosts && selectedEvent.hosts.length > 0 && (
                <EventDetailMetaItem>
                  <span>👤</span>
                  <span>Host{selectedEvent.hosts.length > 1 ? 's' : ''}: {selectedEvent.hosts.slice(0, 5).join(', ')}</span>
                </EventDetailMetaItem>
              )}
              <EventDetailMetaItem>
                <span>👥</span>
                <span>{selectedEvent?.attendees}/{selectedEvent?.maxAttendees} attendees</span>
              </EventDetailMetaItem>
              {selectedEvent?.whatsappGroup && (
                <EventDetailMetaItem>
                  <span>💬</span>
                  <a href={selectedEvent.whatsappGroup} target="_blank" rel="noopener noreferrer" style={{ color: '#2fce98', textDecoration: 'none' }}>
                    Join WhatsApp Group
                  </a>
                </EventDetailMetaItem>
              )}
              {selectedEvent?.mapLink && (
                <EventDetailMetaItem>
                  <span>🗺️</span>
                  <a href={selectedEvent.mapLink} target="_blank" rel="noopener noreferrer" style={{ color: '#2fce98', textDecoration: 'none' }}>
                    View on Map
                  </a>
                </EventDetailMetaItem>
              )}
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
            <ActionButton 
              onClick={() => {
                setShowParticipantsModal(true);
                setShowEventDetail(false);
              }}
            >
              👥 Participants
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
                onClick={async () => {
                  if (!selectedProfile) return;
                  
                  try {
                    const token = localStorage.getItem('bersemuka_token');
                    if (!token) {
                      alert('Please login to send friend requests');
                      return;
                    }

                    const response = await fetch(
                      `${window.location.hostname === 'localhost' ? '' : 'https://api.berse.app'}/api/v1/users/follow/${selectedProfile.id}`,
                      {
                        method: 'POST',
                        headers: {
                          'Authorization': `Bearer ${token}`,
                          'Content-Type': 'application/json',
                        },
                      }
                    );

                    if (response.ok) {
                      alert(`Friend request sent to ${selectedProfile.name}! They will receive a message notification.`);
                      setShowProfileDetail(false);
                    } else if (response.status === 400) {
                      const error = await response.json();
                      if (error.message?.includes('Already following')) {
                        alert('You have already sent a friend request to this user.');
                      } else {
                        alert('Failed to send friend request. Please try again.');
                      }
                    } else {
                      alert('Failed to send friend request. Please try again.');
                    }
                  } catch (error) {
                    console.error('Error sending friend request:', error);
                    alert('Failed to send friend request. Please try again.');
                  }
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

      {/* Payment Modal for all events */}
      {selectedEvent && (
        <EventPaymentModal
          event={selectedEvent}
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setShowEventDetail(true); // Return to event detail
          }}
          userEmail={user?.email}
          userName={user?.fullName}
          userPhone={user?.phone || user?.phoneNumber}
          onSuccess={() => {
            // Handle successful payment/registration
            setShowPaymentModal(false);
            
            // Add user to event participants
            const participant = {
              id: Date.now(),
              name: user?.fullName || 'Anonymous User',
              email: user?.email || '',
              joinedAt: new Date().toISOString(),
              eventId: selectedEvent.id,
              status: 'registered' as 'registered' | 'attended' | 'cancelled'
            };
            
            const storageKey = `event_${selectedEvent.id}_participants`;
            const existingParticipants = JSON.parse(localStorage.getItem(storageKey) || '[]');
            
            // Check if user already joined
            const alreadyJoined = existingParticipants.some((p: any) => 
              p.email === participant.email || p.name === participant.name
            );
            
            if (!alreadyJoined) {
              existingParticipants.push(participant);
              localStorage.setItem(storageKey, JSON.stringify(existingParticipants));
              
              // Update event attendee count
              setAllEvents(prevEvents => 
                prevEvents.map(evt => 
                  evt.id === selectedEvent.id 
                    ? { ...evt, attendees: (evt.attendees || 0) + 1 }
                    : evt
                )
              );
            }
            
            // Save registered event to localStorage for My Events
            const registeredEvents = JSON.parse(localStorage.getItem('userRegisteredEvents') || '[]');
            const eventToSave = {
              ...selectedEvent,
              registrationDate: new Date().toISOString(),
              registrationStatus: 'confirmed',
              paymentStatus: selectedEvent.price > 0 ? 'paid' : 'free'
            };
            
            // Check if not already registered
            if (!registeredEvents.some((e: any) => e.id === selectedEvent.id)) {
              registeredEvents.push(eventToSave);
              localStorage.setItem('userRegisteredEvents', JSON.stringify(registeredEvents));
            }
            
            // Show success message
            alert(`Successfully ${selectedEvent.price > 0 ? 'paid and ' : ''}registered for ${selectedEvent.title}!`);
          }}
        />
      )}
      
      {/* Unified Participants Modal for All Events */}
      {selectedEvent && (
        <UnifiedParticipants
          eventId={selectedEvent.id}
          eventTitle={selectedEvent.title}
          isSportsEvent={selectedEvent.id.includes('berseminton')}
          isOpen={showParticipantsModal}
          onClose={() => {
            setShowParticipantsModal(false);
            if (selectedEvent) {
              setShowEventDetail(true);
            }
          }}
        />
      )}
      
      {/* Edit Event Modal */}
      <EditEventModal
        event={eventToEdit}
        isOpen={showEditEventModal}
        onClose={() => {
          setShowEditEventModal(false);
          setEventToEdit(null);
        }}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
      />

    </Container>
  );
};