import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { StatusBar } from '../components/StatusBar/StatusBar';
import { CompactHeader } from '../components/CompactHeader/CompactHeader';
import { ProfileSidebar } from '../components/ProfileSidebar/ProfileSidebar';
import { MainNav } from '../components/MainNav/index';
import { useAuth } from '../contexts/AuthContext';
import { checkAdminAccess } from '../utils/adminUtils';
import { generateBerseMukhaEvents, generatePersonAttendance } from '../data/bersemukhaEvents';
import { JoinCommunityModal, FriendRequestModal } from '../components/CommunityModals';
import { shareProfileWithImage } from '../utils/shareUtils';

// Interface for travel history
interface TravelEntry {
  country: string;
  city?: string;
  dates: string;
  friends: string[];
  purpose?: string;
  flag?: string;
}

// Interface for trust chain
interface TrustConnection {
  name: string;
  relationship: string;
  rating: number;
  feedback: string;
  avatar?: string;
  trustLevel: 'Most Trusted' | 'Close Friend' | 'Friend' | 'Mutual';
}

// Interface for profile data
interface ProfileCardData {
  id: number | string;
  name: string;
  age?: number;
  profession: string;
  location: string;
  origin?: string;
  match: number;
  tags: string[];
  languages?: string[];
  mutuals?: string[];
  bio: string;
  offers?: string[];
  price?: string;
  amenities?: string[];
  reviews?: number;
  rating?: number;
  company?: string;
  expertise?: string[];
  education?: string;
  looking?: string[];
  servicesOffered: {
    localGuide: boolean;
    homestay: boolean;
    marketplace: boolean;
    openToConnect: boolean;
  };
  travelHistory?: TravelEntry[];
  trustChain?: TrustConnection[];
  // Community-specific fields
  type?: 'user' | 'community';
  memberCount?: number;
  eventCount?: number;
  description?: string;
  category?: string;
  upcomingEvents?: string[];
  // New fields
  topInterests?: string[];
  communities?: string[];
  eventsAttending?: string[];
  communityRoles?: { [key: string]: string };
  offerings?: {
    berseGuide?: {
      price: string;
      duration: string;
      locations: string[];
      specialties: string[];
    };
    homeSurf?: {
      available: boolean;
      maxDays: number;
      amenities: string[];
    };
    berseBuddy?: {
      activities: string[];
      availability: string;
    };
    berseMentor?: {
      expertise: string[];
      rate: string;
      format: string[];
    };
  };
}

// Define interest options
const INTEREST_OPTIONS = [
  { icon: '🌍', label: 'Cultural Networking', value: 'cultural-networking' },
  { icon: '☕', label: 'Cafe Hopping', value: 'cafe-hopping' },
  { icon: '✈️', label: 'Travel Stories', value: 'travel-stories' },
  { icon: '🗣️', label: 'Language Exchange', value: 'language-exchange' },
  { icon: '🚀', label: 'Startup Networking', value: 'startup-networking' },
  { icon: '💚', label: 'Social Impact', value: 'social-impact' },
  { icon: '⚽', label: 'Sports Activities', value: 'sports-activities' },
  { icon: '🏸', label: 'Badminton Games', value: 'badminton-games' },
  { icon: '🥾', label: 'Hiking Trails', value: 'hiking-trails' },
  { icon: '🏛️', label: 'Heritage Walks', value: 'heritage-walks' },
  { icon: '🍜', label: 'Foodie Meetups', value: 'foodie-meetups' },
  { icon: '📚', label: 'Book Talks', value: 'book-talks' },
  { icon: '🎒', label: 'Weekend Trips', value: 'weekend-trips' },
  { icon: '📸', label: 'Photo Walks', value: 'photo-walks' },
  { icon: '🏖️', label: 'Beach Outings', value: 'beach-outings' }
];

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #F9F3E3;
`;

// Connection Mode Selector
const ConnectionModeCard = styled.div`
  background: linear-gradient(135deg, #2fce98, #26b580);
  border-radius: 12px;
  padding: 8px;
  margin: 4px 16px 8px 16px;
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
  min-width: 60px;
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

// Tab Navigation
const TabContainer = styled.div`
  display: flex;
  background: white;
  border-bottom: 1px solid #e0e0e0;
  padding: 0 16px;
`;

const Tab = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 14px 8px;
  background: transparent;
  color: ${props => props.$active ? '#2fce98' : '#999'};
  border: none;
  border-bottom: ${props => props.$active ? '3px solid #2fce98' : '3px solid transparent'};
  font-size: 13px;
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

const TabLabel = styled.div`
  font-size: 13px;
`;

const TabSublabel = styled.div`
  font-size: 10px;
  opacity: 0.8;
  font-weight: 400;
`;

// Primary Discover Card
const DiscoverCard = styled.div<{ $active: boolean }>`
  background: ${props => props.$active 
    ? 'linear-gradient(135deg, #2fce98 0%, #4A8B7C 100%)' 
    : 'white'};
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 8px;
  box-shadow: ${props => props.$active 
    ? '0 4px 16px rgba(45, 95, 79, 0.3)' 
    : '0 2px 8px rgba(0, 0, 0, 0.08)'};
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid ${props => props.$active 
    ? 'transparent' 
    : 'rgba(0, 0, 0, 0.06)'};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.$active 
      ? '0 6px 20px rgba(45, 95, 79, 0.4)' 
      : '0 4px 12px rgba(0, 0, 0, 0.12)'};
  }
`;

const DiscoverHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
`;

const DiscoverTitle = styled.div<{ $active: boolean }>`
  font-size: 14px;
  font-weight: 700;
  color: ${props => props.$active ? 'white' : '#2fce98'};
  letter-spacing: 0.5px;
`;

const DiscoverCount = styled.div<{ $active: boolean }>`
  font-size: 18px;
  font-weight: bold;
  color: ${props => props.$active ? 'white' : '#2fce98'};
`;

const DiscoverSubtitle = styled.div<{ $active: boolean }>`
  font-size: 11px;
  color: ${props => props.$active ? 'rgba(255, 255, 255, 0.9)' : '#666'};
  font-style: italic;
`;

// Secondary Tabs Container
const SecondaryTabs = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
`;

const SecondaryTab = styled.button<{ $active: boolean }>`
  background: white;
  border: 1px solid ${props => props.$active ? '#2fce98' : '#E0E0E0'};
  border-radius: 10px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  &:hover {
    background: ${props => props.$active ? '#F0F7F4' : '#F8F8F8'};
    border-color: ${props => props.$active ? '#2fce98' : '#CCC'};
    transform: translateY(-1px);
  }
`;

const SecondaryTabInfo = styled.div`
  text-align: left;
`;

const SecondaryTabLabel = styled.div<{ $active: boolean }>`
  font-size: 12px;
  font-weight: 600;
  color: ${props => props.$active ? '#2fce98' : '#333'};
  margin-bottom: 2px;
`;

const SecondaryTabSublabel = styled.div`
  font-size: 10px;
  color: #999;
`;

const SecondaryTabCount = styled.div<{ $active: boolean }>`
  font-size: 16px;
  font-weight: bold;
  color: ${props => props.$active ? '#2fce98' : '#666'};
`;

// Content Area
const Content = styled.div`
  flex: 1;
  overflow-y: auto;
  padding-bottom: 100px;
`;


// Match Badge Style
const MatchBadge = styled.div<{ $percentage: number }>`
  background: ${props => 
    props.$percentage >= 80 ? 'linear-gradient(135deg, #4CAF50, #8BC34A)' :
    props.$percentage >= 60 ? 'linear-gradient(135deg, #FF9800, #FFB74D)' :
    'linear-gradient(135deg, #2196F3, #64B5F6)'};
  color: white;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  position: absolute;
  top: 12px;
  right: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
`;

// Unused old filter styles - commented out
// const FilterCard = styled.div`...`;
// const FilterTitle = styled.h4`...`;
// const FilterSection = styled.div`...`;
// const FilterLabel = styled.div`...`;

const FilterOptions = styled.div`
  display: flex;
  gap: 4px;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  max-width: 380px;
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

const FilterResultsIndicator = styled.span`
  font-size: 9px;
  color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.15);
  padding: 2px 6px;
  border-radius: 10px;
  margin-left: 6px;
  font-weight: 600;
`;

const FilterDivider = styled.div`
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent);
  margin: 4px 0 2px 0;
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

// CompactSearchButton removed - search only works with Enter key

const SearchInputContainer = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
  min-width: 110px;
  max-width: 200px;
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

const ClearSearchButton = styled.button`
  position: absolute;
  right: 4px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  font-size: 10px;
  cursor: pointer;
  padding: 2px 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease;
  
  &:hover {
    color: rgba(255, 255, 255, 0.9);
  }
`;

// Old FilterDropdown - no longer used
/*
const FilterDropdown = styled.select`...`;
*/

// Old SearchButton - no longer used
/*
const SearchButton = styled.button`...`;
*/

// Connection Card
const ConnectionCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin: 0 16px 12px 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #e0e0e0;
`;


const ConnectionHeader = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
`;

const Avatar = styled.div`
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
`;

const ConnectionInfo = styled.div`
  flex: 1;
`;

const ConnectionName = styled.h4`
  margin: 0 0 4px 0;
  font-size: 16px;
  color: #333;
  font-weight: 600;
  display: inline-block;
`;

const NameBadgesRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
`;

const InlineBadge = styled.span<{ $color?: string; $textColor?: string }>`
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 2px 6px;
  background: ${props => props.$color || '#F5F5F5'};
  border-radius: 8px;
  font-size: 9px;
  color: ${props => props.$textColor || '#666'};
  font-weight: 500;
  white-space: nowrap;
`;

const ConnectionLocation = styled.div`
  font-size: 12px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    color: #2fce98;
    text-decoration: underline;
  }
`;

const ConnectionTags = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin: 8px 0;
`;

const Tag = styled.span`
  background: #E3F2FD;
  color: #1976D2;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
`;

const ConnectionBio = styled.p`
  font-size: 13px;
  color: #666;
  line-height: 1.4;
  margin: 12px 0;
  font-style: italic;
`;

const MutualSection = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 0;
  border-top: 1px solid #f0f0f0;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #F8F9FA;
    margin: 0 -16px;
    padding: 12px 16px;
    border-radius: 8px;
  }
`;

const ProfileMeta = styled.div`
  font-size: 12px;
  color: #999;
  margin-top: 2px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ConnectionActions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;
`;

// Guide Card Specific Components
const GuideCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

const GuideName = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #2fce98;
`;

const GuideSubtitle = styled.p`
  margin: 2px 0 0 0;
  font-size: 12px;
  color: #666;
`;

const GuideRating = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  font-weight: 600;
  color: #FFB800;
`;

const TestimonialSection = styled.div`
  background: #F8F9FA;
  border-radius: 8px;
  padding: 10px;
  margin: 12px 0;
`;

const TestimonialText = styled.p`
  margin: 0;
  font-size: 12px;
  font-style: italic;
  color: #555;
  line-height: 1.4;
`;

const TestimonialAuthor = styled.p`
  margin: 4px 0 0 0;
  font-size: 11px;
  color: #888;
  text-align: right;
`;

const AvailabilitySection = styled.div`
  margin: 12px 0;
`;

const SectionTitle = styled.h4`
  margin: 0 0 8px 0;
  font-size: 11px;
  font-weight: 600;
  color: #2fce98;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const AvailabilityList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const AvailabilityItem = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #666;
  
  span:first-child {
    font-weight: 500;
  }
`;

const PopularToursSection = styled.div`
  margin: 12px 0;
`;

const ToursList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const TourItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px;
  background: #F8F9FA;
  border-radius: 6px;
  font-size: 12px;
`;

const TourDetails = styled.div`
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TourName = styled.span`
  font-weight: 500;
  color: #333;
`;

const TourMeta = styled.span`
  color: #888;
  font-size: 11px;
`;

const GuideFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #E0E0E0;
`;

const GuideLanguages = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #666;
`;

const GuideActions = styled.div`
  display: flex;
  gap: 8px;
`;

const GuideButton = styled.button<{ $primary?: boolean }>`
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  ${props => props.$primary ? `
    background: #2fce98;
    color: white;
    border: none;
    
    &:hover {
      background: #1F4A3A;
      transform: translateY(-1px);
    }
  ` : `
    background: white;
    color: #2fce98;
    border: 1px solid #2fce98;
    
    &:hover {
      background: #F8F9FA;
    }
  `}
`;

const FriendlyIntro = styled.div`
  padding: 10px;
  background: #E8F5E9;
  border-radius: 8px;
  margin-bottom: 12px;
  font-size: 12px;
  color: #2E7D32;
`;

const FreeCoffeeCard = styled.div`
  padding: 10px;
  background: linear-gradient(135deg, #FFF3E0, #FFECB3);
  border-radius: 8px;
  margin-bottom: 12px;
  border: 1px solid #FFB300;
`;

const HangoutOption = styled.div`
  padding: 8px;
  background: #F5F5F5;
  border-radius: 6px;
  font-size: 11px;
  margin-bottom: 8px;
`;

const CulturalNote = styled.div`
  padding: 8px;
  background: #FFF;
  border: 1px solid #E0E0E0;
  border-radius: 6px;
  margin-top: 12px;
  font-size: 10px;
  color: #666;
  font-style: italic;
`;

// Profile Info Components
const ProfileInfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 8px 0;
  flex-wrap: wrap;
`;

const InfoBadge = styled.span<{ $color?: string; $textColor?: string }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: ${props => props.$color || '#F5F5F5'};
  border-radius: 12px;
  font-size: 10px;
  color: ${props => props.$textColor || '#666'};
  font-weight: 500;
`;

const ViewMoreButton = styled.button`
  background: none;
  border: none;
  color: #2fce98;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  padding: 4px 8px;
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s ease;
  
  &:hover {
    background: #F5F5F5;
    border-radius: 6px;
  }
`;

// Profile Detail Modal
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
  z-index: 9999;
  padding: 20px;
`;

const ProfileDetailContent = styled.div`
  background: white;
  border-radius: 16px;
  max-width: 450px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
`;

const ProfileDetailHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid #E0E0E0;
  position: relative;
  text-align: center;
`;

const ProfileImageLarge = styled.div<{ $bgColor?: string }>`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: ${({ $bgColor }) => $bgColor || 'linear-gradient(135deg, #667eea, #764ba2)'};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  font-weight: bold;
  margin: 0 auto 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  border: 4px solid white;
  position: relative;
  
  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
  }
`;

const SocialMediaLinks = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 12px;
`;

const SocialLink = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #f5f5f5;
  color: #333;
  text-decoration: none;
  transition: all 0.2s ease;
  font-size: 18px;
  
  &:hover {
    background: #2fce98;
    color: white;
    transform: translateY(-2px);
  }
`;

const ProfileDetailSection = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid #F0F0F0;
  
  &:last-child {
    border-bottom: none;
  }
`;

const DetailSectionTitle = styled.h4`
  margin: 0 0 12px 0;
  font-size: 12px;
  font-weight: 600;
  color: #2fce98;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const DetailList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const DetailItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 12px;
  color: #333;
  
  span:first-child {
    font-size: 14px;
    width: 20px;
    text-align: center;
  }
`;

const CloseModalButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: none;
  border: none;
  font-size: 24px;
  color: #999;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
  
  &:hover {
    background: #F5F5F5;
    color: #333;
  }
`;

// Travel Logbook Modal Styles
const TravelLogbookModal = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: ${props => props.$isOpen ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
`;

const LogbookContent = styled.div`
  background: white;
  border-radius: 20px;
  max-width: 500px;
  width: 100%;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const LogbookHeader = styled.div`
  background: linear-gradient(135deg, #2fce98, #4A8B7C);
  color: white;
  padding: 20px;
  position: relative;
`;

const LogbookTitle = styled.h2`
  margin: 0 0 4px 0;
  font-size: 20px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const LogbookSubtitle = styled.p`
  margin: 0;
  font-size: 14px;
  opacity: 0.9;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.1);
  }
`;

const LogbookStats = styled.div`
  display: flex;
  gap: 20px;
  padding: 16px 20px;
  background: #F8F9FA;
  border-bottom: 1px solid #E0E0E0;
`;

const TravelStatItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const TravelStatValue = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #2fce98;
`;

const TravelStatLabel = styled.div`
  font-size: 12px;
  color: #666;
`;

const LogbookList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
`;

const TravelItem = styled.div`
  border: 1px solid #E0E0E0;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  transition: all 0.2s;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const TravelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

const TravelLocation = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CountryFlag = styled.span`
  font-size: 24px;
`;

const LocationInfo = styled.div``;

const CountryName = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
`;

const CityName = styled.p`
  margin: 2px 0 0 0;
  font-size: 13px;
  color: #666;
`;

const TravelDates = styled.div`
  background: #E3F2FD;
  color: #1976D2;
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
`;

const TravelDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FriendsList = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const FriendsLabel = styled.span`
  font-size: 12px;
  color: #666;
  font-weight: 500;
`;

const FriendTag = styled.span`
  background: #F3E5F5;
  color: #7B1FA2;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
`;

const TravelPurpose = styled.div`
  font-size: 12px;
  color: #666;
  font-style: italic;
  display: flex;
  align-items: center;
  gap: 4px;
`;

// Trust Chain Modal Styles
const TrustChainModal = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: ${props => props.$isOpen ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
`;

const TrustChainContent = styled.div`
  background: white;
  border-radius: 20px;
  max-width: 500px;
  width: 100%;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const TrustChainHeader = styled.div`
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 20px;
  position: relative;
`;

const TrustChainTitle = styled.h2`
  margin: 0 0 4px 0;
  font-size: 20px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TrustChainSubtitle = styled.p`
  margin: 0;
  font-size: 14px;
  opacity: 0.9;
`;

const TrustMetrics = styled.div`
  display: flex;
  gap: 20px;
  padding: 16px 20px;
  background: #F8F9FA;
  border-bottom: 1px solid #E0E0E0;
`;

const TrustMetric = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const TrustMetricValue = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #667eea;
`;

const TrustMetricLabel = styled.div`
  font-size: 12px;
  color: #666;
`;

const TrustList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
`;

const TrustCard = styled.div<{ $trustLevel: string }>`
  border: 1px solid ${props => 
    props.$trustLevel === 'Most Trusted' ? '#FFD700' : 
    props.$trustLevel === 'Close Friend' ? '#667eea' : '#E0E0E0'};
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  background: ${props => 
    props.$trustLevel === 'Most Trusted' ? 'linear-gradient(135deg, #FFF9E6, #FFFEF5)' : 
    props.$trustLevel === 'Close Friend' ? 'linear-gradient(135deg, #F0F2FF, #FAFBFF)' : 'white'};
  transition: all 0.2s;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
`;

const TrustCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

const TrustPersonInfo = styled.div`
  display: flex;
  gap: 12px;
  flex: 1;
`;

const TrustAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
`;

const TrustPersonDetails = styled.div``;

const TrustPersonName = styled.h3`
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
`;

const TrustRelationship = styled.p`
  margin: 2px 0 0 0;
  font-size: 12px;
  color: #666;
`;

const TrustBadge = styled.div<{ $level: string }>`
  background: ${props => 
    props.$level === 'Most Trusted' ? '#FFD700' : 
    props.$level === 'Close Friend' ? '#667eea' : '#9CA3AF'};
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
`;

const TrustRating = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 8px;
`;

const TrustStars = styled.div`
  color: #FFD700;
  font-size: 14px;
`;

const TrustScore = styled.span`
  font-size: 12px;
  color: #666;
  font-weight: 500;
`;

const TrustFeedback = styled.p`
  font-size: 13px;
  color: #666;
  line-height: 1.4;
  font-style: italic;
  margin: 0;
`;

const MutualConnectionsSection = styled.div`
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #E0E0E0;
`;

const MutualConnectionsTitle = styled.h4`
  margin: 0 0 8px 0;
  font-size: 13px;
  font-weight: 600;
  color: #333;
`;

const MutualConnectionsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const MutualTag = styled.span`
  background: #E3F2FD;
  color: #1976D2;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
`;

const ActionButton = styled.button<{ $primary?: boolean }>`
  flex: 1;
  padding: 10px;
  background: ${props => props.$primary ? '#2fce98' : 'white'};
  color: ${props => props.$primary ? 'white' : '#2fce98'};
  border: ${props => props.$primary ? 'none' : '1px solid #2fce98'};
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;

  &:hover {
    background: ${props => props.$primary ? '#1E4039' : '#F5F5F5'};
  }
`;

// Matchmaker Components
const MatchmakerCard = styled.div`
  background: linear-gradient(135deg, #E3F2FD, #BBDEFB);
  border-radius: 16px;
  padding: 20px;
  margin: 16px;
  text-align: center;
`;

const MatchmakerTitle = styled.h3`
  margin: 0 0 4px 0;
  font-size: 18px;
  color: #1565C0;
`;

const MatchmakerLevel = styled.div`
  font-size: 12px;
  color: #0D47A1;
  margin-bottom: 16px;
`;

const MatchPair = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin: 20px 0;
`;

const MatchProfile = styled.div`
  text-align: center;
`;

const MatchAvatar = styled.div`
  width: 80px;
  height: 80px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  margin-bottom: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const MatchName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #333;
`;

const MatchRelation = styled.div`
  font-size: 11px;
  color: #666;
`;

const MatchIcon = styled.div`
  font-size: 24px;
  animation: pulse 2s infinite;

  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
  }
`;

const MatchReasons = styled.div`
  background: white;
  border-radius: 12px;
  padding: 12px;
  margin: 16px 0;
  text-align: left;
`;

const MatchReason = styled.div`
  font-size: 13px;
  color: #666;
  margin: 6px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const MatchActions = styled.div`
  display: flex;
  gap: 12px;
`;

const MatchButton = styled.button<{ $type?: 'skip' | 'match' }>`
  flex: 1;
  padding: 12px;
  background: ${props => props.$type === 'match' ? '#4CAF50' : '#757575'};
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover {
    opacity: 0.9;
  }
`;

const ManualIntroButton = styled.button`
  width: 100%;
  background: #2196F3;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 12px;

  &:hover {
    background: #1976D2;
  }
`;

// Stats Card
const StatsCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin: 0 16px 16px 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`;

const StatsTitle = styled.h4`
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #333;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
`;

const StatItem = styled.div`
  text-align: center;
  padding: 8px;
  background: #F5F5F5;
  border-radius: 8px;
`;

const StatValue = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: #2fce98;
`;

const StatLabel = styled.div`
  font-size: 11px;
  color: #666;
  margin-top: 2px;
`;

const LeaderboardPosition = styled.div`
  background: linear-gradient(135deg, #FFD700, #FFA000);
  color: white;
  padding: 12px;
  border-radius: 8px;
  text-align: center;
  margin-top: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
`;

// Bingo Card
const BingoCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin: 0 16px 16px 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`;

const BingoTitle = styled.h4`
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #333;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const BingoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 6px;
  margin-bottom: 12px;
`;

const BingoCell = styled.div<{ $completed?: boolean; $free?: boolean }>`
  aspect-ratio: 1;
  background: ${props => 
    props.$free ? '#FFD700' : 
    props.$completed ? '#4CAF50' : 
    '#F5F5F5'
  };
  color: ${props => props.$completed || props.$free ? 'white' : '#666'};
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  padding: 4px;
  text-align: center;
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }
`;

const BingoIcon = styled.div`
  font-size: 16px;
  margin-bottom: 2px;
`;

const BingoStatus = styled.div`
  background: linear-gradient(135deg, #4CAF50, #8BC34A);
  color: white;
  padding: 8px;
  border-radius: 8px;
  text-align: center;
  font-size: 13px;
  font-weight: 600;
`;

// Homestay Components
const HomestaySection = styled.div`
  margin: 0 16px 16px 16px;
`;

const HomestayTitle = styled.h3`
  font-size: 14px;
  color: #333;
  margin: 0 0 12px 0;
  font-weight: 600;
`;

const HomestayCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #e0e0e0;
`;

const HomestayHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 8px;
`;

const HomestayName = styled.h4`
  margin: 0;
  font-size: 14px;
  color: #333;
`;

const HomestayPrice = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: #2fce98;
`;

const HomestayInfo = styled.div`
  font-size: 12px;
  color: #666;
  margin: 4px 0;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const HomestayRating = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #FFA000;
  margin: 8px 0;
`;

const HomestayQuote = styled.div`
  font-size: 12px;
  color: #666;
  font-style: italic;
  margin: 8px 0;
`;

const HomestayButton = styled.button`
  width: 100%;
  background: #2fce98;
  color: white;
  border: none;
  padding: 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  margin-top: 8px;

  &:hover {
    background: #1E4039;
  }
`;

// Network Components
const NetworkCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`;

const NetworkTitle = styled.h3`
  margin: 0 0 16px 0;
  font-size: 16px;
  color: #333;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const NetworkVisualization = styled.div`
  background: linear-gradient(135deg, #E3F2FD, #BBDEFB);
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  min-height: 200px;
  position: relative;
  margin-bottom: 16px;
`;

const NetworkDescription = styled.div`
  font-size: 12px;
  color: #666;
  line-height: 1.4;
  margin-bottom: 16px;
  text-align: left;
`;

const NetworkFeature = styled.div`
  background: #F5F5F5;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
`;

const NetworkFeatureTitle = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: #333;
  margin-bottom: 6px;
`;

const NetworkFeatureDesc = styled.div`
  font-size: 12px;
  color: #666;
  line-height: 1.4;
`;

const NetworkButton = styled.button`
  width: 100%;
  background: #2196F3;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 8px;

  &:hover {
    background: #1976D2;
  }
`;

// Cluster Components
const ClusterCard = styled.div`
  background: linear-gradient(135deg, #E8F5E9, #C8E6C9);
  border-radius: 12px;
  padding: 16px;
  margin: 0 16px 16px 16px;
`;

const ClusterTitle = styled.h4`
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #2E7D32;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const ClusterName = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #1B5E20;
  margin-bottom: 8px;
`;

const ClusterMembers = styled.div`
  font-size: 12px;
  color: #388E3C;
  margin-bottom: 8px;
`;

const ClusterTraits = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 12px;
`;

const ClusterTrait = styled.span`
  background: white;
  color: #2E7D32;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
`;

const ClusterActions = styled.div`
  display: flex;
  gap: 8px;
`;

const ClusterButton = styled.button`
  flex: 1;
  background: #4CAF50;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background: #388E3C;
  }
`;

// Chain Components
const ChainCard = styled.div`
  background: linear-gradient(135deg, #FFF3E0, #FFE0B2);
  border-radius: 12px;
  padding: 16px;
  margin: 0 16px 16px 16px;
`;

const ChainTitle = styled.h4`
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #E65100;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const ChainPath = styled.div`
  background: white;
  border-radius: 8px;
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
`;

const ChainNode = styled.div<{ $clickable?: boolean }>`
  font-size: 12px;
  color: ${props => props.$clickable ? '#2196F3' : '#666'};
  font-weight: 500;
  cursor: ${props => props.$clickable ? 'pointer' : 'default'};
  text-decoration: ${props => props.$clickable ? 'underline' : 'none'};

  &:hover {
    color: ${props => props.$clickable ? '#1976D2' : '#666'};
  }
`;

const ChainArrow = styled.span`
  color: #FF6F00;
`;

const ChainList = styled.div`
  margin-top: 12px;
`;

const ChainItem = styled.div`
  background: white;
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ChainTarget = styled.div`
  font-size: 13px;
  color: #333;
  font-weight: 600;
`;

const ChainSteps = styled.div`
  font-size: 12px;
  color: #666;
`;

const ChainExploreButton = styled.button`
  background: #FF6F00;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 11px;
  cursor: pointer;

  &:hover {
    background: #E65100;
  }
`;

// Quick Actions
const QuickActionsCard = styled.div`
  display: flex;
  gap: 8px;
  padding: 12px;
  margin: 8px 16px;
  background: linear-gradient(135deg, #2fce98, #4A8B7C);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(45, 95, 79, 0.25), 0 2px 4px rgba(0, 0, 0, 0.1);
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

const QuickActionButton = styled.button`
  flex: 1;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.85));
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 10px;
  padding: 12px 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, transparent, rgba(255, 255, 255, 0.2));
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover {
    background: linear-gradient(135deg, white, rgba(255, 255, 255, 0.95));
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    border-color: rgba(255, 255, 255, 0.6);
    
    &::before {
      opacity: 1;
    }
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }
`;

const QuickActionIcon = styled.div`
  font-size: 20px;
  color: #2fce98;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
`;

const QuickActionLabel = styled.span`
  font-size: 10px;
  color: #2fce98;
  font-weight: 500;
`;

// Modal Components
const Modal = styled.div<{ $show: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: ${props => props.$show ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 16px;
  padding: 20px;
  max-width: 500px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
`;

const ModalTitle = styled.h3`
  margin: 0 0 16px 0;
  font-size: 18px;
  color: #333;
`;

const ModalSection = styled.div`
  margin-bottom: 16px;
`;

const ModalLabel = styled.label`
  display: block;
  font-size: 12px;
  color: #666;
  margin-bottom: 6px;
`;

const ModalInput = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 13px;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #2fce98;
  }
`;

const PeopleList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
`;

const PersonChip = styled.div`
  background: #E3F2FD;
  color: #1976D2;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: #F44336;
  font-size: 16px;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
`;

const ModalTextarea = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 13px;
  min-height: 100px;
  resize: vertical;
  font-family: inherit;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #2fce98;
  }
`;

const ModalActions = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 20px;
`;

const ModalButton = styled.button<{ $primary?: boolean }>`
  flex: 1;
  padding: 10px;
  background: ${props => props.$primary ? '#2fce98' : '#F5F5F5'};
  color: ${props => props.$primary ? 'white' : '#666'};
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    opacity: 0.9;
  }
`;

// Network Web Modal
const NetworkWebModal = styled(Modal)``;

const NetworkWebContent = styled(ModalContent)`
  max-width: 800px;
`;

const NetworkWebCanvas = styled.div`
  background: linear-gradient(135deg, #f5f5f5, #e0e0e0);
  border-radius: 12px;
  padding: 40px;
  min-height: 400px;
  position: relative;
  margin-bottom: 20px;
`;

const NetworkWebNode = styled.div<{ $x: number; $y: number; $main?: boolean }>`
  position: absolute;
  width: ${props => props.$main ? '60px' : '50px'};
  height: ${props => props.$main ? '60px' : '50px'};
  background: ${props => props.$main ? '#2fce98' : '#64B5F6'};
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${props => props.$main ? '14px' : '11px'};
  font-weight: 600;
  left: ${props => props.$x}%;
  top: ${props => props.$y}%;
  transform: translate(-50%, -50%);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  z-index: 2;

  &:hover {
    transform: translate(-50%, -50%) scale(1.1);
  }
`;

const NetworkWebLine = styled.svg`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
`;

// Helper function to generate gradient based on name
const getGradient = (name: string): string => {
  const gradients = [
    'linear-gradient(135deg, #667eea, #764ba2)',
    'linear-gradient(135deg, #f093fb, #f5576c)', 
    'linear-gradient(135deg, #4facfe, #00f2fe)',
    'linear-gradient(135deg, #43e97b, #38f9d7)',
    'linear-gradient(135deg, #fa709a, #fee140)',
    'linear-gradient(135deg, #30cfd0, #330867)',
    'linear-gradient(135deg, #a8edea, #fed6e3)',
    'linear-gradient(135deg, #ff9a9e, #fecfef)',
    'linear-gradient(135deg, #fbc2eb, #a6c1ee)',
    'linear-gradient(135deg, #fdcbf1, #e6dee9)'
  ];
  
  // Generate index from name
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) - hash) + name.charCodeAt(i);
    hash = hash & hash;
  }
  return gradients[Math.abs(hash) % gradients.length];
};

export const BerseMatchScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'discover' | 'matchmaker' | 'myweb'>('discover');
  const [connectionMode, setConnectionMode] = useState<'all' | 'guides' | 'homesurf' | 'mentor' | 'buddy' | 'communities'>('all');
  const [showManualIntro, setShowManualIntro] = useState(false);
  const [showSquadBuilder, setShowSquadBuilder] = useState(false);
  const [showNetworkWeb, setShowNetworkWeb] = useState(false);
  const [showCreateCluster, setShowCreateCluster] = useState(false);
  const [showBingoInput, setShowBingoInput] = useState(false);
  const [selectedBingoIndex, setSelectedBingoIndex] = useState<number | null>(null);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  
  // State for user data and filtering
  const [users, setUsers] = useState<ProfileCardData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeServiceFilter, setActiveServiceFilter] = useState<string | null>(null);
  
  // State for modals
  const [showFriendRequestModal, setShowFriendRequestModal] = useState(false);
  const [showJoinCommunityModal, setShowJoinCommunityModal] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState<ProfileCardData | null>(null);

  // Tab navigation function
  const navigateTab = (direction: 'prev' | 'next') => {
    const tabs: ('discover' | 'matchmaker' | 'myweb')[] = ['discover', 'matchmaker', 'myweb'];
    const currentIndex = tabs.indexOf(activeTab);
    let newIndex;
    
    if (direction === 'prev') {
      newIndex = currentIndex === 0 ? tabs.length - 1 : currentIndex - 1;
    } else {
      newIndex = currentIndex === tabs.length - 1 ? 0 : currentIndex + 1;
    }
    
    setActiveTab(tabs[newIndex]);
  };

  // Get current tab display name
  const getCurrentTabName = () => {
    const tabNames = {
      discover: 'DISCOVER',
      matchmaker: 'CONNECTOR', 
      myweb: 'MY WEB'
    };
    return tabNames[activeTab];
  };
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showInterestModal, setShowInterestModal] = useState(false);
  const [showTravelLogbook, setShowTravelLogbook] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<ProfileCardData | null>(null);
  const [showTrustChain, setShowTrustChain] = useState(false);
  const [showCommunitiesModal, setShowCommunitiesModal] = useState(false);
  const [showEventsModal, setShowEventsModal] = useState(false);
  const [showOfferingsModal, setShowOfferingsModal] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [searchQuery, setSearchQuery] = useState('');
  const [textSearchQuery, setTextSearchQuery] = useState('');
  // Initialize with default filters active
  const [activeFilters, setActiveFilters] = useState({ country: 'All', city: 'All Cities' });
  const [isSearchActive, setIsSearchActive] = useState(true); // Start with search active
  const [showProfileSidebar, setShowProfileSidebar] = useState(false);
  const [showProfileDetail, setShowProfileDetail] = useState(false);
  const [selectedDetailProfile, setSelectedDetailProfile] = useState<any>(null);
  
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
  
  // State for manual introductions
  const [introductionPeople, setIntroductionPeople] = useState<string[]>([]);
  const [newPersonName, setNewPersonName] = useState('');
  
  // State for squad builder
  const [squadMembers, setSquadMembers] = useState<string[]>([]);
  const [squadName, setSquadName] = useState('');
  const [squadActivity, setSquadActivity] = useState('');
  
  // State for cluster creation
  const [clusterMembers, setClusterMembers] = useState<string[]>([]);
  const [clusterName, setClusterName] = useState('');
  
  // State for bingo
  const [bingoItems, setBingoItems] = useState([
    { text: 'Coder', completed: true, icon: '💻', person: 'Ahmad' },
    { text: 'Vegan', completed: false, icon: '🥗', person: '' },
    { text: 'Parent', completed: true, icon: '👨‍👩‍👧', person: 'Fatima' },
    { text: 'Artist', completed: false, icon: '🎨', person: '' },
    { text: 'Expat', completed: true, icon: '✈️', person: 'John' },
    { text: 'Night Owl', completed: true, icon: '🦉', person: 'Sarah' },
    { text: 'Gym Rat', completed: true, icon: '💪', person: 'Khalid' },
    { text: 'FREE', completed: false, icon: '🌟', free: true, person: '' },
    { text: 'Foodie', completed: false, icon: '🍔', person: '' },
    { text: 'NAMA', completed: true, icon: '🕌', person: 'Omar' },
    { text: 'Biker', completed: false, icon: '🚴', person: '' },
    { text: 'Gamer', completed: true, icon: '🎮', person: 'Ali' },
    { text: '3+ Lang', completed: false, icon: '🗣️', person: '' },
    { text: 'Volunteer', completed: true, icon: '🤝', person: 'Amina' },
    { text: 'Founder', completed: false, icon: '🚀', person: '' },
    { text: 'Coffee', completed: true, icon: '☕', person: 'Lisa' },
    { text: 'Runner', completed: false, icon: '🏃', person: '' },
    { text: 'Cook', completed: true, icon: '👨‍🍳', person: 'Hassan' },
    { text: 'Traveler', completed: true, icon: '🌍', person: 'Maya' },
    { text: 'Investor', completed: false, icon: '📈', person: '' },
    { text: 'Teacher', completed: false, icon: '👨‍🏫', person: '' },
    { text: 'Designer', completed: true, icon: '🎨', person: 'Zara' },
    { text: 'Writer', completed: false, icon: '✍️', person: '' },
    { text: 'Musician', completed: false, icon: '🎵', person: '' },
    { text: 'Pet Owner', completed: true, icon: '🐕', person: 'Emma' }
  ]);

  // Helper functions
  const getFilterButtonText = (type: 'location' | 'interest') => {
    if (type === 'location') return '📍 Location Filter';
    if (type === 'interest') return '💎 Interest Filter';
    return 'Filter';
  };

  // Get combined filter display text for search input
  const getSearchDisplayText = () => {
    const parts = [];
    
    // Add location filters
    if (selectedCountry && selectedCountry !== 'All' && selectedCountry !== '') {
      if (selectedCity && selectedCity !== 'All Cities' && selectedCity !== '') {
        parts.push(`${selectedCity}, ${selectedCountry}`);
      } else {
        parts.push(selectedCountry);
      }
    } else if (selectedCity && selectedCity !== 'All Cities' && selectedCity !== '') {
      parts.push(selectedCity);
    }
    
    return parts.join(', ');
  };

  // Check if location filters are active
  const hasLocationFilters = () => {
    return (selectedCountry && selectedCountry !== 'All' && selectedCountry !== '') ||
           (selectedCity && selectedCity !== 'All Cities' && selectedCity !== '');
  };
  
  // Get placeholder text based on filters
  const getPlaceholderText = () => {
    if (hasLocationFilters()) {
      return 'search profiles/ communities';
    }
    return 'Search...';
  };

  // Mode descriptions
  const modeDescriptions = {
    all: "Browse all connection types in one place",
    guides: "Find locals to show you around cities, cultures, and communities",
    homesurf: "Find friends offering affordable rooms or homestays",
    mentor: "Connect with industry professionals for career guidance and growth",
    buddy: "Link international students with local students for support",
    communities: "Find communities in the ecosystem"
  };

  // Filter connections based on mode
  const getFilteredConnections = () => {
    // Apply filters based on location and text search
    const applyLocationFilter = (connections: any[]) => {
      if (!isSearchActive) {
        return connections;
      }
      
      let filteredConnections = connections;
      
      // Apply location filter
      const country = activeFilters.country;
      const city = activeFilters.city;
      
      if (country && country !== 'All' && country !== '') {
        filteredConnections = filteredConnections.filter(conn => {
          const location = conn.location?.toLowerCase() || '';
          const origin = conn.origin?.toLowerCase() || '';
          const countryLower = country.toLowerCase();
          const cityLower = city?.toLowerCase() || '';
          
          // Check if country matches
          const countryMatch = location.includes(countryLower) || origin.includes(countryLower);
          
          // If no city selected or "All Cities", just match country
          if (!cityLower || cityLower === 'all cities') {
            return countryMatch;
          }
          
          // Check if city matches
          const cityMatch = location.includes(cityLower) || origin.includes(cityLower);
          
          return countryMatch && cityMatch;
        });
      }
      
      // Apply text search filter
      if (searchQuery && searchQuery.trim() !== '') {
        const searchLower = searchQuery.toLowerCase();
        filteredConnections = filteredConnections.filter(conn => {
          // Search in multiple fields
          const searchableFields = [
            conn.name,
            conn.bio,
            conn.profession,
            conn.location,
            conn.origin,
            conn.personalityType,
            conn.languages,
            conn.guideLanguages,
            ...(conn.tags || []),
            ...(conn.offers || []),
            ...(conn.communities || []),
            ...(conn.eventsAttending || [])
          ];
          
          return searchableFields.some(field => 
            field && field.toString().toLowerCase().includes(searchLower)
          );
        });
      }
      
      return filteredConnections;
    };
    
    // User's profile data - using AuthContext user data
    const userProfile = {
      id: 1,
      name: user?.username || user?.fullName || 'User',
      age: parseInt(user?.age as string) || 25,
      profession: user?.profession || 'Professional',
      location: user?.currentLocation || 'Location not set',
      origin: user?.originLocation || 'Origin not set',
      match: 100,
      tags: user?.topInterests || ['Networking', 'Social', 'Events', 'Community'],
      mutuals: [],
      bio: user?.bio || 'Welcome to Berse! Update your profile to share more about yourself.',
      servicesOffered: {
        localGuide: user?.offerings?.berseGuide || true,
        homestay: user?.offerings?.homeSurf || false,
        marketplace: false,
        openToConnect: true
      },
      personalityType: user?.personalityType || 'ENFJ-A',
      languages: user?.languages || 'EN, MS, AR',
      interests: user?.topInterests || ['Cultural Networking', 'Cafe Hopping', 'Heritage Walks', 'Photo Walks'],
      communities: user?.communities || ["Ahl 'Umran Network", 'PeaceMeal MY'],
      eventsAttending: user?.eventsAttended?.map(event => event.eventName || event.eventId) || ['Heritage Walk KL', 'Photography Workshop', 'Architecture Conference'],
      offers: ['Architecture Tours', 'Photography Sessions', 'Heritage Walks', 'Cultural Guides'],
      linkedin: user?.linkedin || 'zaydmahdaly',
      instagram: user?.instagram || 'zayd.mahdaly',
      twitter: user?.twitter || '',
      website: user?.website || 'zaydmahdaly.com',
      travelHistory: [
        {
          country: 'Turkey',
          flag: '🇹🇷',
          city: 'Istanbul, Ankara, Izmir',
          dates: '2023-2024',
          friends: ['Mehmet Ali', 'Ayşe Kaya', 'Omar Yilmaz'],
          purpose: 'Architecture study and cultural exploration'
        },
        {
          country: 'Malaysia',
          flag: '🇲🇾',
          city: 'KL, Penang, Langkawi',
          dates: '2020-Present',
          friends: ['Ahmad Hassan', 'Sarah Chen', 'Raj Kumar'],
          purpose: 'Home base for architecture practice'
        }
      ],
      trustChain: [
        {
          name: 'Ahmad Hassan',
          relationship: 'Architecture Colleague',
          rating: 5,
          feedback: 'Excellent photographer and reliable friend',
          trustLevel: 'Most Trusted' as const
        },
        {
          name: 'Sarah Chen',
          relationship: 'Photography Mentor',
          rating: 5,
          feedback: 'Talented architect with great eye for heritage',
          trustLevel: 'Close Friend' as const
        }
      ]
    };

    // Community profiles for communities mode
    const communityProfiles = [
      {
        id: 'comm-1',
        name: "Ahl 'Umran Network",
        type: 'community',
        category: 'Social',
        profession: 'Community Organization',
        description: 'A network for spiritual growth and community building',
        location: 'Kuala Lumpur, Malaysia',
        bio: "Building meaningful connections through spiritual growth, community service, and shared values. Ahl 'Umran brings together seekers of knowledge and community builders.",
        memberCount: 1600,
        eventCount: 100,
        isVerified: true,
        verificationBadge: 'gold',
        tags: ['Spiritual', 'Community', 'Service', 'Education'],
        upcomingEvents: ['Weekly Gathering', 'Community Service Day'],
        match: 98,
        servicesOffered: {
          localGuide: false,
          homestay: false,
          marketplace: false,
          openToConnect: true
        }
      },
      {
        id: 'comm-2',
        name: 'PeaceMeal MY',
        type: 'community',
        category: 'Social',
        profession: 'Community Initiative',
        description: 'Bringing cultural, intellectual and spiritual understanding of Islam through interactive programs in Malaysia',
        location: 'Malaysia',
        bio: 'Bringing cultural, intellectual and spiritual understanding of Islam through interactive programs in Malaysia. PeaceMeal MY fosters unity and understanding through shared dining experiences.',
        memberCount: 5000,
        eventCount: 500,
        isVerified: true,
        verificationBadge: 'gold',
        tags: ['Food', 'Unity', 'Cultural Exchange', 'Community'],
        upcomingEvents: ['Community Iftar', 'Potluck Gathering'],
        match: 95,
        servicesOffered: {
          localGuide: false,
          homestay: false,
          marketplace: false,
          openToConnect: true
        }
      }
    ];

    // Combine user's profile with fetched users from database
    const profiles = [
      userProfile,
      ...users.map(u => ({
        id: u.id,
        name: u.username || u.fullName || 'User',
        age: u.age || 25,
        profession: u.profession || u.shortBio || 'Professional',
        location: u.currentLocation || u.city || 'Location not set',
        origin: u.originallyFrom || 'Origin not set',
        match: Math.floor(Math.random() * 30) + 70, // Random match percentage
        tags: u.interests || [],
        mutuals: [],
        bio: u.bio || 'No bio available',
        servicesOffered: u.servicesOffered || {},
        personalityType: u.personalityType,
        languages: u.languages || [],
        email: u.email,
        membershipId: u.membershipId,
        isAdmin: u.email === 'zaydmahdaly@ahlumran.org'
      }))
    ];

    const allConnections = {
      all: profiles,
      communities: communityProfiles,
      guides: profiles.filter(p => p.servicesOffered?.localGuide),
      homesurf: profiles.filter(p => p.servicesOffered?.homestay),
      mentor: profiles.filter(p => p.servicesOffered?.mentor),
      buddy: profiles.filter(p => p.servicesOffered?.buddy)
    };

    // For 'all' mode, show all profiles
    if (connectionMode === 'all') {
      return applyLocationFilter(profiles);
    }
    
    const connections = allConnections[connectionMode] || [];
    return applyLocationFilter(connections);
  };

  const loadUsers = async () => {
    // Show cached users immediately if available
    const cachedUsers = localStorage.getItem('cached_users');
    if (cachedUsers) {
      try {
        const parsed = JSON.parse(cachedUsers);
        setUsers(parsed);
        setIsLoading(false);
      } catch (e) {
        console.error('Failed to parse cached users');
      }
    }
    
    setIsLoading(true);
    try {
      const token = localStorage.getItem('bersemuka_token') || localStorage.getItem('auth_token');
      if (token) {
        const API_BASE_URL = window.location.hostname === 'berse.app' || window.location.hostname === 'www.berse.app'
          ? 'https://api.berse.app'
          : '';
        
        const response = await axios.get(
          `${API_BASE_URL}/api/v1/users/all`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            },
            timeout: 10000 // 10 second timeout
          }
        );
        
        if (response.data.success) {
          const fetchedUsers = response.data.data || [];
          setUsers(fetchedUsers);
          // Cache users for faster next load
          localStorage.setItem('cached_users', JSON.stringify(fetchedUsers));
          console.log('Loaded users from database:', fetchedUsers.length);
        }
      }
    } catch (error) {
      console.error('Failed to load users:', error);
      // Keep cached data if API fails
      if (!cachedUsers) {
        setUsers([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Friendship matches data - will be populated from real users
  const friendshipMatches: any[] = [
    {
      person1: {
        emoji: '👨‍💻',
        name: 'Ahmad',
        relation: 'Your colleague'
      },
      person2: {
        emoji: '👩‍🎨',
        name: 'Sarah',
        relation: 'Met at last event'
      },
      reasons: [
        '✨ Both love tech & design',
        '🎨 Share interest in UI/UX',
        '☕ Coffee enthusiasts'
      ]
    },
    {
      person1: {
        emoji: '👨‍🍳',
        name: 'Hakim',
        relation: 'From cooking class'
      },
      person2: {
        emoji: '👩‍💼',
        name: 'Aisha',
        relation: 'Business owner'
      },
      reasons: [
        '🍳 Both interested in culinary arts',
        '💼 Entrepreneurial mindset',
        '🌱 Sustainability advocates'
      ]
    }
  ];

  // Connection chains data - will be populated from real connections
  const connectionChains: any[] = [
    {
      people: ['You', 'Ahmad', 'Farah', 'Zayd'],
      connection: '🎮 Gaming Community'
    },
    {
      people: ['You', 'Sarah', 'Imran', 'Nadia'],
      connection: '📚 Book Club Members'
    }
  ];

  useEffect(() => {
    loadUsers();
  }, []);

  // Handler functions
  const handleConnect = (connection: ProfileCardData) => {
    if (connection.type === 'community') {
      // For communities, show join community modal
      setSelectedConnection(connection);
      setShowJoinCommunityModal(true);
    } else {
      // For regular profiles, show friend request modal
      setSelectedConnection(connection);
      setShowFriendRequestModal(true);
    }
  };

  const handleShareProfile = async (connection: ProfileCardData) => {
    // Use the new image sharing feature
    await shareProfileWithImage({
      ...connection,
      fullName: connection.name,
      interests: connection.tags,
      avatarColor: connection.avatarColor
    });
  };
  
  const handleSendFriendRequest = async (eventId: string, note: string) => {
    if (selectedConnection) {
      try {
        const token = localStorage.getItem('bersemuka_token');
        if (!token) {
          alert('Please login to send friend requests');
          return;
        }

        // Store friend request locally with event context
        const friendRequest = {
          id: `fr-${Date.now()}`,
          from: user?.id || 'current-user',
          fromName: user?.fullName || user?.username || 'User',
          to: selectedConnection.id,
          toName: selectedConnection.name,
          message: note || `Hi! I'd like to connect with you${eventId ? ' from the event' : ''}.`,
          timestamp: new Date().toISOString(),
          status: 'pending',
          eventId: eventId || null,
          read: false
        };

        // Store in localStorage
        const existingRequests = JSON.parse(localStorage.getItem('friend_requests') || '[]');
        existingRequests.push(friendRequest);
        localStorage.setItem('friend_requests', JSON.stringify(existingRequests));

        // Also store as a message
        const userMessages = JSON.parse(localStorage.getItem('user_messages') || '[]');
        userMessages.push({
          ...friendRequest,
          senderId: friendRequest.from,
          senderName: friendRequest.fromName,
          recipientId: friendRequest.to,
          recipientName: friendRequest.toName,
          content: friendRequest.message,
          type: 'friend_request',
          isRead: false
        });
        localStorage.setItem('user_messages', JSON.stringify(userMessages));

        // Try to send to backend API
        try {
          const response = await fetch(
            `${window.location.hostname === 'localhost' ? '' : 'https://api.berse.app'}/api/v1/users/follow/${selectedConnection.id}`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                message: note,
                eventId: eventId
              })
            }
          );

          if (!response.ok && response.status !== 400) {
            console.error('Backend friend request failed, but stored locally');
          }
        } catch (apiError) {
          console.error('Backend API error, friend request stored locally:', apiError);
        }

        // Send push notification (would be server-side in production)
        if ('Notification' in window && Notification.permission === 'granted') {
          // This is simulation - in production, recipient would get this
          console.log('Push notification would be sent to recipient');
        }

        // Don't award points immediately - wait for acceptance
        alert(`Friend request sent to ${selectedConnection.name}! They will receive a notification. Points will be awarded when they accept.`);
        setShowFriendRequestModal(false);
        
      } catch (error) {
        console.error('Error sending friend request:', error);
        alert('Failed to send friend request. Please try again.');
      }
    }
  };
  
  const handleJoinCommunity = (note: string) => {
    if (selectedConnection) {
      // Create join request
      const request = {
        communityId: selectedConnection.id,
        userId: user?.id,
        note: note,
        timestamp: new Date().toISOString()
      };
      
      // Store in local storage for demo purposes
      const requests = JSON.parse(localStorage.getItem('communityRequests') || '[]');
      requests.push(request);
      localStorage.setItem('communityRequests', JSON.stringify(requests));
      
      alert(`Join request sent to ${selectedConnection.name}!`);
      setShowJoinCommunityModal(false);
    }
  };
  
  const handleSkipMatch = () => {
    if (friendshipMatches.length > 0) {
      setCurrentMatchIndex((prev) => (prev + 1) % friendshipMatches.length);
    }
  };

  const handleAddPersonToIntro = () => {
    if (newPersonName.trim() && introductionPeople.length < 4) {
      setIntroductionPeople([...introductionPeople, newPersonName.trim()]);
      setNewPersonName('');
    }
  };

  const handleRemovePersonFromIntro = (index: number) => {
    setIntroductionPeople(introductionPeople.filter((_, i) => i !== index));
  };

  const handleSendIntroduction = () => {
    if (introductionPeople.length >= 2) {
      alert(`Introduction sent to ${introductionPeople.join(', ')}! You earned ${introductionPeople.length * 25} points!`);
      setIntroductionPeople([]);
      setShowManualIntro(false);
    }
  };

  const handleAddToSquad = () => {
    if (newPersonName.trim() && squadMembers.length < 8) {
      setSquadMembers([...squadMembers, newPersonName.trim()]);
      setNewPersonName('');
    }
  };

  const handleCreateSquad = () => {
    if (squadMembers.length >= 2 && squadName && squadActivity) {
      alert(`Squad "${squadName}" created with ${squadMembers.length} members for ${squadActivity}! Earned 150 points!`);
      setSquadMembers([]);
      setSquadName('');
      setSquadActivity('');
      setShowSquadBuilder(false);
    }
  };

  const handleAddToCluster = () => {
    if (newPersonName.trim()) {
      setClusterMembers([...clusterMembers, newPersonName.trim()]);
      setNewPersonName('');
    }
  };

  const handleCreateCluster = () => {
    if (clusterMembers.length >= 3 && clusterName) {
      alert(`Cluster "${clusterName}" created with ${clusterMembers.length} members! Earned 300 points!`);
      setClusterMembers([]);
      setClusterName('');
      setShowCreateCluster(false);
    }
  };

  const handleBingoClick = (index: number) => {
    if (!bingoItems[index].completed && !bingoItems[index].free) {
      setSelectedBingoIndex(index);
      setShowBingoInput(true);
    } else if (bingoItems[index].completed) {
      alert(`This square was completed by connecting with ${bingoItems[index].person}`);
    }
  };

  const handleBingoComplete = (personName: string) => {
    if (selectedBingoIndex !== null && personName.trim()) {
      const newBingoItems = [...bingoItems];
      newBingoItems[selectedBingoIndex] = {
        ...newBingoItems[selectedBingoIndex],
        completed: true,
        person: personName.trim()
      };
      setBingoItems(newBingoItems);
      alert(`Connected with ${personName} who is a ${bingoItems[selectedBingoIndex].text}! Square completed!`);
      setShowBingoInput(false);
      setSelectedBingoIndex(null);
    }
  };

  return (
    <Container>
      <StatusBar />
      <CompactHeader 
        onMenuClick={() => setShowProfileSidebar(true)}
      />
      <ProfileSidebar 
        isOpen={showProfileSidebar}
        onClose={() => setShowProfileSidebar(false)}
      />

      {/* Connection Mode Card */}
      <ConnectionModeCard>
        <ModeTitle>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            🔄 Connection Mode
          </div>
          <TabNavigation>
            <TabNavButton onClick={() => navigateTab('prev')}>
              ‹
            </TabNavButton>
            <TabNameDisplay>
              {getCurrentTabName()}
            </TabNameDisplay>
            <TabNavButton onClick={() => navigateTab('next')}>
              ›
            </TabNavButton>
          </TabNavigation>
        </ModeTitle>
        <ModeDescription>{modeDescriptions[connectionMode]}</ModeDescription>
        <ModeSelector>
          <ModeButton 
            $active={connectionMode === 'all'}
            onClick={() => setConnectionMode('all')}
          >
            All
          </ModeButton>
          <ModeButton 
            $active={connectionMode === 'guides'}
            onClick={() => setConnectionMode('guides')}
            style={{ 
              background: connectionMode === 'guides' ? '' : '#757575',
              opacity: connectionMode === 'guides' ? 1 : 0.8,
              color: connectionMode === 'guides' ? '' : '#ccc',
              border: connectionMode === 'guides' ? '' : '1px solid #555'
            }}
          >
            BerseGuide
            <CollabBadge style={{ background: '#666', color: '#aaa' }}>Soon</CollabBadge>
          </ModeButton>
          <ModeButton 
            $active={connectionMode === 'homesurf'}
            onClick={() => setConnectionMode('homesurf')}
            style={{ 
              background: connectionMode === 'homesurf' ? '' : '#757575',
              opacity: connectionMode === 'homesurf' ? 1 : 0.8,
              color: connectionMode === 'homesurf' ? '' : '#ccc',
              border: connectionMode === 'homesurf' ? '' : '1px solid #555'
            }}
          >
            HomeSurf
            <CollabBadge style={{ background: '#666', color: '#aaa' }}>Soon</CollabBadge>
          </ModeButton>
          <ModeButton 
            $active={connectionMode === 'communities'}
            onClick={() => setConnectionMode('communities')}
          >
            Communities
          </ModeButton>
          <ModeButton 
            $active={connectionMode === 'buddy'}
            onClick={() => setConnectionMode('buddy')}
            style={{ 
              background: connectionMode === 'buddy' ? '' : '#757575',
              opacity: connectionMode === 'buddy' ? 1 : 0.8,
              color: connectionMode === 'buddy' ? '' : '#ccc',
              border: connectionMode === 'buddy' ? '' : '1px solid #555'
            }}
          >
            BerseBuddy
            <CollabBadge style={{ background: '#666', color: '#aaa' }}>Soon</CollabBadge>
          </ModeButton>
          <ModeButton 
            $active={connectionMode === 'mentor'}
            onClick={() => setConnectionMode('mentor')}
            style={{ 
              background: connectionMode === 'mentor' ? '' : '#757575',
              opacity: connectionMode === 'mentor' ? 1 : 0.8,
              color: connectionMode === 'mentor' ? '' : '#ccc',
              border: connectionMode === 'mentor' ? '' : '1px solid #555'
            }}
          >
            BerseMentor
            <CollabBadge style={{ background: '#666', color: '#aaa' }}>Soon</CollabBadge>
          </ModeButton>
        </ModeSelector>
        
        {/* Divider */}
        <FilterDivider />
        
        {/* Ultra Compact Filter Section */}
        <LocationFilterSection>
          <LocationFilterLabel>
            {hasLocationFilters() ? (
              <span style={{ fontSize: '8px', opacity: 0.7 }}>{getSearchDisplayText()}</span>
            ) : (
              <span>Find friends everywhere</span>
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
                  setActiveFilters({ country: 'All', city: 'All Cities' });
                } else {
                  setSelectedCity(''); // Reset city for new country
                  setActiveFilters({ country: newCountry, city: '' });
                }
                setIsSearchActive(true);
              }}
              title="Select Country"
            >
              <option value="">Clear</option>
              <option value="All">All</option>
              {Object.keys(countriesWithCities).filter(country => country !== 'All').map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </CompactDropdown>
            <CompactDropdown 
              value={selectedCity} 
              onChange={(e) => {
                const newCity = e.target.value;
                setSelectedCity(newCity);
                
                // Handle Clear or All Cities selection
                if (newCity === '' || newCity === 'All Cities') {
                  setActiveFilters({ country: selectedCountry, city: 'All Cities' });
                } else {
                  setActiveFilters({ country: selectedCountry, city: newCity });
                }
                setIsSearchActive(true);
              }}
              disabled={!selectedCountry || selectedCountry === 'All'}
              title="Select City"
            >
              <option value="">Clear</option>
              <option value="All Cities">All</option>
              {selectedCountry && countriesWithCities[selectedCountry as keyof typeof countriesWithCities]
                ?.filter(city => city !== 'All Cities')
                .map(city => (
                  <option key={city} value={city}>{city}</option>
              ))}
            </CompactDropdown>
            <SearchInput
              type="text"
              placeholder={getPlaceholderText()}
              value={textSearchQuery}
              onChange={(e) => {
                const value = e.target.value;
                setTextSearchQuery(value);
                
                // Clear search query if input is empty
                if (value === '') {
                  setSearchQuery('');
                }
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  setSearchQuery(textSearchQuery);
                }
              }}
              onKeyDown={(e) => {
                // Clear search on Escape key
                if (e.key === 'Escape') {
                  setTextSearchQuery('');
                  setSearchQuery('');
                  e.currentTarget.blur();
                }
              }}
              style={{
                fontStyle: hasLocationFilters() && !textSearchQuery ? 'italic' : 'normal'
              }}
            />
          </FilterOptions>
        </LocationFilterSection>
      </ConnectionModeCard>


      <Content>
        {activeTab === 'discover' && (
          <>
            {/* Results counter */}

            {getFilteredConnections().length === 0 ? (
              <div style={{
                padding: '40px 20px',
                textAlign: 'center',
                color: '#666'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
                <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                  No {connectionMode === 'all' ? 'profiles' : connectionMode} found
                </div>
                <div style={{ fontSize: '12px', color: '#999' }}>
                  {activeFilters.country && activeFilters.country !== 'All' 
                    ? `Try searching in a different location or select "All Countries"`
                    : 'Try adjusting your search filters'}
                </div>
              </div>
            ) : (
              getFilteredConnections().map((connection: any) => (
              <ConnectionCard key={connection.id}>
                {/* Special layout for BerseGuide profiles */}
                {connectionMode === 'guides' ? (
                  <>
                    <GuideCardHeader>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                          <GuideName>{connection.name}</GuideName>
                          {connection.personalityType && (
                            <InlineBadge $color="#E8F5E9" $textColor="#2E7D32">
                              🧠 {connection.personalityType}
                            </InlineBadge>
                          )}
                          {(connection.languages || connection.guideLanguages) && (
                            <InlineBadge $color="#E3F2FD" $textColor="#1976D2">
                              🗣️ {connection.languages || connection.guideLanguages}
                            </InlineBadge>
                          )}
                        </div>
                        <GuideSubtitle>{connection.mutuals?.length || 3} mutual friends</GuideSubtitle>
                      </div>
                      <GuideRating>
                        💚 New Friend
                      </GuideRating>
                    </GuideCardHeader>

                    {/* Friendly Introduction */}
                    <div style={{ 
                      padding: '10px', 
                      background: '#E8F5E9', 
                      borderRadius: '8px', 
                      marginBottom: '12px',
                      fontSize: '12px',
                      color: '#2E7D32'
                    }}>
                      💚 "Let's start as friends! No awkwardness about money."
                    </div>

                    {/* Free Coffee First Option */}
                    <div style={{
                      padding: '10px',
                      background: 'linear-gradient(135deg, #FFF3E0, #FFECB3)',
                      borderRadius: '8px',
                      marginBottom: '12px',
                      border: '1px solid #FFB300'
                    }}>
                      <div style={{ fontSize: '12px', fontWeight: '600', color: '#E65100', marginBottom: '4px' }}>
                        ☕ FREE: Coffee Chat First
                      </div>
                      <div style={{ fontSize: '11px', color: '#BF360C' }}>
                        Let's meet for 30min to see if we vibe! No obligations.
                      </div>
                    </div>

                    {/* How We Can Hang Out Section */}
                    <AvailabilitySection>
                      <SectionTitle>If we click, here's how we can hang out:</SectionTitle>
                      
                      {/* Sliding Scale Options */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{
                          padding: '8px',
                          background: '#F5F5F5',
                          borderRadius: '6px',
                          fontSize: '11px'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                            <span style={{ fontWeight: '500' }}>🥘 Food Adventure</span>
                            <span style={{ color: '#4CAF50' }}>Buy me lunch</span>
                          </div>
                          <div style={{ color: '#666', fontSize: '10px' }}>
                            2-3 hours exploring best local spots
                          </div>
                        </div>

                        <div style={{
                          padding: '8px',
                          background: '#F5F5F5',
                          borderRadius: '6px',
                          fontSize: '11px'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                            <span style={{ fontWeight: '500' }}>🌆 City Tour</span>
                            <span style={{ color: '#2196F3' }}>50 BersePoints</span>
                          </div>
                          <div style={{ color: '#666', fontSize: '10px' }}>
                            Half day showing you around
                          </div>
                        </div>

                        <div style={{
                          padding: '8px',
                          background: '#F5F5F5',
                          borderRadius: '6px',
                          fontSize: '11px'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                            <span style={{ fontWeight: '500' }}>🎯 Full Day</span>
                            <span style={{ color: '#9C27B0' }}>RM80 or skill trade</span>
                          </div>
                          <div style={{ color: '#666', fontSize: '10px' }}>
                            Complete local experience
                          </div>
                        </div>
                      </div>
                    </AvailabilitySection>

                    {/* Cultural Context */}
                    <div style={{
                      padding: '8px',
                      background: '#FFF',
                      border: '1px solid #E0E0E0',
                      borderRadius: '6px',
                      marginTop: '12px',
                      fontSize: '10px',
                      color: '#666',
                      fontStyle: 'italic'
                    }}>
                      💡 "In Malaysian culture, we believe in 'belanja' - taking turns treating. 
                      Whatever feels comfortable for you!"
                    </div>

                    {/* Testimonial if exists */}
                    {connection.testimonial && (
                      <TestimonialSection style={{ marginTop: '12px' }}>
                        <TestimonialText style={{ fontSize: '11px' }}>
                          "{connection.testimonial.text}"
                        </TestimonialText>
                        <TestimonialAuthor style={{ fontSize: '10px' }}>
                          — {connection.testimonial.author}
                        </TestimonialAuthor>
                      </TestimonialSection>
                    )}

                    {/* Footer with actions */}
                    <GuideFooter>
                      <div style={{ fontSize: '11px', color: '#666', fontStyle: 'italic' }}>
                        📍 {connection.location}
                      </div>
                      <GuideActions>
                        <GuideButton style={{ fontSize: '11px' }}>☕ Free Coffee</GuideButton>
                        <GuideButton $primary style={{ fontSize: '11px' }}>💬 Let's Chat</GuideButton>
                      </GuideActions>
                    </GuideFooter>
                  </>
                ) : (
                  /* Regular layout for other connection modes */
                  <>
                    <MatchBadge $percentage={connection.match}>
                      {connection.match}% Match
                    </MatchBadge>
                    <ConnectionHeader>
                  <Avatar>👤</Avatar>
                  <ConnectionInfo>
                    <NameBadgesRow>
                      <ConnectionName>{connection.name}</ConnectionName>
                      {connection.personalityType && (
                        <InlineBadge $color="#E8F5E9" $textColor="#2E7D32">
                          🧠 {connection.personalityType}
                        </InlineBadge>
                      )}
                      {(connection.languages || connection.guideLanguages) && (
                        <InlineBadge $color="#E3F2FD" $textColor="#1976D2">
                          🗣️ {connection.languages || connection.guideLanguages}
                        </InlineBadge>
                      )}
                    </NameBadgesRow>
                    <ConnectionLocation onClick={() => {
                      setSelectedProfile(connection);
                      setShowTravelLogbook(true);
                    }}>
                      📍 {connection.location}
                      {connection.origin && ` • From: ${connection.origin}`}
                    </ConnectionLocation>
                    <ProfileMeta>
                      <span>{connection.age} years</span>
                      <span>•</span>
                      <span>{connection.profession}</span>
                    </ProfileMeta>
                    {connection.price && (
                      <HomestayPrice>{connection.price}</HomestayPrice>
                    )}
                  </ConnectionInfo>
                </ConnectionHeader>
                <ConnectionTags>
                  {/* Display top 4 interests if available, otherwise use tags */}
                  {(() => {
                    // Map tags to interests
                    const getInterestFromTag = (tag) => {
                      const tagToInterest = {
                        'Local Expert': 'heritage-walks',
                        'Historical Tours': 'heritage-walks',
                        'Halal Food': 'foodie-meetups',
                        'Photography': 'photo-walks',
                        'Coffee': 'cafe-hopping',
                        'Tech': 'startup-networking',
                        'Sports': 'sports-activities',
                        'Arts': 'cultural-networking',
                        'Nature': 'hiking-trails',
                        'Family': 'weekend-trips'
                      };
                      return tagToInterest[tag] || null;
                    };
                    
                    // Get interests from tags or use default
                    const interests = connection.tags.map(tag => {
                      const interestValue = getInterestFromTag(tag);
                      const interest = INTEREST_OPTIONS.find(opt => opt.value === interestValue);
                      return interest || { icon: '🏷️', label: tag, value: tag };
                    }).slice(0, 4);
                    
                    return interests.map((interest, idx) => (
                      <Tag key={idx} style={{ 
                        background: '#F0F7F4',
                        color: '#2fce98',
                        border: '1px solid #E0E0E0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        {interest.label}
                      </Tag>
                    ));
                  })()}
                </ConnectionTags>
                <ConnectionBio>"{connection.bio}"</ConnectionBio>
                
                {/* Compact Info Display - Communities and Events only */}
                <ProfileInfoRow>
                  {connection.communities && connection.communities.length > 0 && (
                    <InfoBadge 
                      $color="#FFF3E0" 
                      $textColor="#E65100"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProfile(connection);
                        setShowCommunitiesModal(true);
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      👥 {connection.communities.length} communities
                    </InfoBadge>
                  )}
                  {connection.eventsAttending && connection.eventsAttending.length > 0 && (
                    <InfoBadge 
                      $color="#F3E5F5" 
                      $textColor="#7B1FA2"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProfile(connection);
                        setShowEventsModal(true);
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      🤝 {connection.eventsAttending.length} BerseMukha
                    </InfoBadge>
                  )}
                  <InfoBadge 
                    $color="#E8F5E9" 
                    $textColor="#2E7D32"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedProfile(connection);
                      setShowOfferingsModal(true);
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    🎯 Offerings
                  </InfoBadge>
                </ProfileInfoRow>
                
                {/* View More Button */}
                <ViewMoreButton onClick={(e) => {
                  e.stopPropagation();
                  setSelectedDetailProfile(connection);
                  setShowProfileDetail(true);
                }}>
                  <span>View full profile</span>
                  <span>→</span>
                </ViewMoreButton>
                
                {/* Community-specific info */}
                {connectionMode === 'communities' && connection.type === 'community' && (
                  <div style={{ marginTop: '12px' }}>
                    {/* Verification Badge */}
                    {connection.isVerified && (
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px',
                        marginBottom: '12px'
                      }}>
                        <div style={{
                          background: connection.verificationBadge === 'gold' ? 'linear-gradient(135deg, #FFD700, #FFA500)' :
                                     connection.verificationBadge === 'silver' ? 'linear-gradient(135deg, #C0C0C0, #808080)' :
                                     'linear-gradient(135deg, #CD7F32, #8B4513)',
                          color: 'white',
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          ✓ Verified {connection.verificationBadge?.charAt(0).toUpperCase() + connection.verificationBadge?.slice(1)}
                        </div>
                        <span style={{ fontSize: '11px', color: '#666' }}>
                          {connection.category} Community
                        </span>
                      </div>
                    )}
                    
                    {/* Community Stats */}
                    <div style={{ 
                      padding: '12px', 
                      background: 'linear-gradient(135deg, #F5F5F5, #FAFAFA)', 
                      borderRadius: '12px',
                      border: '1px solid #E0E0E0'
                    }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                        <div>
                          <div style={{ fontSize: '18px', fontWeight: '700', color: '#2fce98' }}>
                            {connection.memberCount?.toLocaleString()}
                          </div>
                          <div style={{ fontSize: '11px', color: '#666' }}>Active Members</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '18px', fontWeight: '700', color: '#4A90A4' }}>
                            {connection.eventCount}
                          </div>
                          <div style={{ fontSize: '11px', color: '#666' }}>Events Hosted</div>
                        </div>
                      </div>
                      
                      {connection.upcomingEvents && connection.upcomingEvents.length > 0 && (
                        <div style={{ 
                          padding: '8px',
                          background: '#FFF',
                          borderRadius: '8px',
                          marginTop: '8px'
                        }}>
                          <div style={{ fontSize: '11px', fontWeight: '600', color: '#333', marginBottom: '6px' }}>
                            📅 Upcoming Events
                          </div>
                          {connection.upcomingEvents.map((event, idx) => (
                            <div key={idx} style={{ 
                              fontSize: '11px', 
                              color: '#666',
                              padding: '4px 8px',
                              background: '#F9F9F9',
                              borderRadius: '4px',
                              marginBottom: '4px'
                            }}>
                              • {event}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* Community Description */}
                    {connection.description && (
                      <div style={{ 
                        marginTop: '12px',
                        padding: '10px',
                        background: '#E8F4F0',
                        borderRadius: '8px',
                        fontSize: '12px',
                        color: '#2fce98',
                        lineHeight: '1.5'
                      }}>
                        {connection.description}
                      </div>
                    )}
                  </div>
                )}
                
                {connection.amenities && (
                  <div style={{ marginTop: '12px' }}>
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '6px' }}>
                      Amenities: {connection.amenities.join(' • ')}
                    </div>
                  </div>
                )}
                
                {connection.rating && (
                  <HomestayRating>
                    {'⭐'.repeat(Math.floor(connection.rating))} ({connection.reviews} reviews)
                  </HomestayRating>
                )}
                
                {connection.mutuals && (
                  <MutualSection onClick={() => {
                    setSelectedProfile(connection);
                    setShowTrustChain(true);
                  }}>
                    <span style={{ fontSize: '12px', color: '#666' }}>
                      👥 {connection.mutuals.length} mutual friends
                    </span>
                    <span style={{ fontSize: '12px', color: '#999', marginLeft: 'auto' }}>
                      View Trust Chain →
                    </span>
                  </MutualSection>
                )}
                
                <ConnectionActions>
                  <ActionButton onClick={() => handleShareProfile(connection)}>📤 Share</ActionButton>
                  <ActionButton $primary onClick={() => handleConnect(connection)}>
                    {connectionMode === 'homesurf' ? '🏠 Book Stay' : 
                     connectionMode === 'communities' ? '👥 Join Community' : '🤝 Friend Request'}
                  </ActionButton>
                  {checkAdminAccess(user) && connection.id !== user?.id && (
                    <ActionButton 
                      style={{ background: '#dc3545' }}
                      onClick={async () => {
                        if (window.confirm(`Are you sure you want to delete ${connection.name}'s account?`)) {
                          try {
                            const token = localStorage.getItem('bersemuka_token') || localStorage.getItem('auth_token');
                            const API_BASE_URL = window.location.hostname === 'berse.app' || window.location.hostname === 'www.berse.app'
                              ? 'https://api.berse.app'
                              : '';
                            
                            await axios.delete(
                              `${API_BASE_URL}/api/v1/users/${connection.id}`,
                              {
                                headers: {
                                  'Authorization': `Bearer ${token}`
                                }
                              }
                            );
                            
                            // Reload users after deletion
                            loadUsers();
                            alert(`${connection.name}'s account has been deleted.`);
                          } catch (error) {
                            console.error('Failed to delete user:', error);
                            alert('Failed to delete user. Please try again.');
                          }
                        }
                      }}
                    >
                      🗑️ Delete
                    </ActionButton>
                  )}
                </ConnectionActions>
                  </>
                )}
              </ConnectionCard>
            ))
            )}
          </>
        )}

        {activeTab === 'matchmaker' && (
          <>
            <MatchmakerCard>
              <MatchmakerTitle>🤝 FRIEND CONNECTOR</MatchmakerTitle>
              <MatchmakerLevel>Level 3 Connector • 450 pts to Level 4</MatchmakerLevel>
              
              {friendshipMatches.length > 0 && friendshipMatches[currentMatchIndex] ? (
                <>
                  <MatchPair>
                    <MatchProfile>
                      <MatchAvatar>{friendshipMatches[currentMatchIndex].person1.emoji}</MatchAvatar>
                      <MatchName>{friendshipMatches[currentMatchIndex].person1.name}</MatchName>
                      <MatchRelation>{friendshipMatches[currentMatchIndex].person1.relation}</MatchRelation>
                    </MatchProfile>
                    
                    <MatchIcon>🤝</MatchIcon>
                    
                    <MatchProfile>
                      <MatchAvatar>{friendshipMatches[currentMatchIndex].person2.emoji}</MatchAvatar>
                      <MatchName>{friendshipMatches[currentMatchIndex].person2.name}</MatchName>
                      <MatchRelation>{friendshipMatches[currentMatchIndex].person2.relation}</MatchRelation>
                    </MatchProfile>
                  </MatchPair>
                  
                  <MatchReasons>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: '#333', marginBottom: '8px' }}>
                      Why they'd be great friends:
                    </div>
                    {friendshipMatches[currentMatchIndex].reasons.map(reason => (
                      <MatchReason key={reason}>{reason}</MatchReason>
                    ))}
                  </MatchReasons>
                  
                  <MatchActions>
                    <MatchButton $type="skip" onClick={handleSkipMatch}>
                      ⏭️ Skip
                    </MatchButton>
                    <MatchButton $type="match">
                      🤝 Introduce Them!
                    </MatchButton>
                  </MatchActions>
                </>
              ) : (
                <div style={{ padding: '40px 20px', textAlign: 'center', color: '#666' }}>
                  <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔍</div>
                  <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '10px' }}>
                    No matches available right now
                  </div>
                  <div style={{ fontSize: '14px', color: '#999' }}>
                    Check back later for new friend matching opportunities!
                  </div>
                </div>
              )}
              
              <ManualIntroButton onClick={() => setShowManualIntro(true)}>
                ✏️ Manually Introduce Friends (2-4 people)
              </ManualIntroButton>
            </MatchmakerCard>

            <StatsCard>
              <StatsTitle>📊 YOUR MATCHMAKER STATS</StatsTitle>
              <StatsGrid>
                <StatItem>
                  <StatValue>0</StatValue>
                  <StatLabel>Introductions</StatLabel>
                </StatItem>
                <StatItem>
                  <StatValue>0</StatValue>
                  <StatLabel>Successful</StatLabel>
                </StatItem>
                <StatItem>
                  <StatValue>0</StatValue>
                  <StatLabel>Close Friends</StatLabel>
                </StatItem>
                <StatItem>
                  <StatValue>0</StatValue>
                  <StatLabel>Points Earned</StatLabel>
                </StatItem>
              </StatsGrid>
              <LeaderboardPosition>
                🏆 Start matching to climb the leaderboard
              </LeaderboardPosition>
            </StatsCard>
          </>
        )}

        {activeTab === 'myweb' && (
          <>
            <NetworkCard>
              <NetworkTitle>🕸️ YOUR CONNECTION UNIVERSE</NetworkTitle>
              <NetworkDescription>
                Your network visualization shows how all your connections relate to each other.
              </NetworkDescription>
              <NetworkVisualization>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>🕸️</div>
                <div style={{ fontSize: '14px', color: '#1565C0' }}>
                  47 connections across 12 countries
                </div>
              </NetworkVisualization>
              <NetworkFeature>
                <NetworkFeatureTitle>🔍 Hidden Connections</NetworkFeatureTitle>
                <NetworkFeatureDesc>
                  Discover that Ahmad knows Sarah through their gym!
                </NetworkFeatureDesc>
                <NetworkButton onClick={() => setShowNetworkWeb(true)}>
                  Explore Connections
                </NetworkButton>
              </NetworkFeature>
            </NetworkCard>

            <ClusterCard>
              <ClusterTitle>💫 DISCOVERED CLUSTERS</ClusterTitle>
              <ClusterName>"The Berlin Malaysians"</ClusterName>
              <ClusterMembers>5 people who should connect</ClusterMembers>
              <ClusterTraits>
                <ClusterTrait>All from Malaysia</ClusterTrait>
                <ClusterTrait>Living in Berlin</ClusterTrait>
              </ClusterTraits>
              <ClusterActions>
                <ClusterButton>Auto-Create Group</ClusterButton>
                <ClusterButton onClick={() => setShowCreateCluster(true)}>
                  Manual Create
                </ClusterButton>
              </ClusterActions>
            </ClusterCard>

            <ChainCard>
              <ChainTitle>⛓️ CONNECTION CHAINS</ChainTitle>
              <ChainList>
                {connectionChains.map((chain, idx) => (
                  <ChainItem key={idx}>
                    <div>
                      <ChainTarget>{chain.target}</ChainTarget>
                      <ChainSteps>{chain.steps} steps away</ChainSteps>
                    </div>
                    <ChainExploreButton>
                      View Path →
                    </ChainExploreButton>
                  </ChainItem>
                ))}
              </ChainList>
            </ChainCard>

            <QuickActionsCard>
              <QuickActionButton onClick={() => setShowSquadBuilder(true)}>
                <QuickActionIcon>👥</QuickActionIcon>
                <QuickActionLabel>Squad</QuickActionLabel>
              </QuickActionButton>
              <QuickActionButton onClick={() => setActiveTab('matchmaker')}>
                <QuickActionIcon>🎲</QuickActionIcon>
                <QuickActionLabel>Bingo</QuickActionLabel>
              </QuickActionButton>
              <QuickActionButton>
                <QuickActionIcon>🏆</QuickActionIcon>
                <QuickActionLabel>Leaders</QuickActionLabel>
              </QuickActionButton>
              <QuickActionButton onClick={() => setShowCreateCluster(true)}>
                <QuickActionIcon>💫</QuickActionIcon>
                <QuickActionLabel>Clusters</QuickActionLabel>
              </QuickActionButton>
            </QuickActionsCard>
          </>
        )}
      </Content>

      {/* Manual Introduction Modal */}
      <Modal $show={showManualIntro}>
        <ModalContent>
          <ModalTitle>🤝 Manually Introduce Friends</ModalTitle>
          
          <ModalSection>
            <ModalLabel>Add friends to introduce (2-4 people):</ModalLabel>
            <div style={{ display: 'flex', gap: '8px' }}>
              <ModalInput
                placeholder="Enter friend's name"
                value={newPersonName}
                onChange={(e) => setNewPersonName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddPersonToIntro()}
              />
              <ModalButton 
                $primary 
                onClick={handleAddPersonToIntro}
                style={{ flex: 'none', width: 'auto' }}
              >
                Add
              </ModalButton>
            </div>
          </ModalSection>

          <PeopleList>
            {introductionPeople.map((person, idx) => (
              <PersonChip key={idx}>
                {person}
                <RemoveButton onClick={() => handleRemovePersonFromIntro(idx)}>×</RemoveButton>
              </PersonChip>
            ))}
          </PeopleList>

          {introductionPeople.length >= 2 && (
            <ModalSection>
              <ModalLabel>Introduction message:</ModalLabel>
              <ModalTextarea
                placeholder={`Hey ${introductionPeople.join(', ')}! I think you all would really get along...`}
              />
            </ModalSection>
          )}

          <ModalActions>
            <ModalButton onClick={() => {
              setShowManualIntro(false);
              setIntroductionPeople([]);
            }}>
              Cancel
            </ModalButton>
            <ModalButton 
              $primary 
              onClick={handleSendIntroduction}
              disabled={introductionPeople.length < 2}
            >
              Send Introduction
            </ModalButton>
          </ModalActions>
        </ModalContent>
      </Modal>

      {/* Squad Builder Modal */}
      <Modal $show={showSquadBuilder}>
        <ModalContent>
          <ModalTitle>👥 Squad Builder</ModalTitle>
          
          <ModalSection>
            <ModalLabel>Squad Name:</ModalLabel>
            <ModalInput
              placeholder="e.g. Weekend Hikers"
              value={squadName}
              onChange={(e) => setSquadName(e.target.value)}
            />
          </ModalSection>

          <ModalSection>
            <ModalLabel>Activity/Purpose:</ModalLabel>
            <ModalInput
              placeholder="e.g. Weekend hiking, Study group, etc."
              value={squadActivity}
              onChange={(e) => setSquadActivity(e.target.value)}
            />
          </ModalSection>

          <ModalSection>
            <ModalLabel>Add squad members:</ModalLabel>
            <div style={{ display: 'flex', gap: '8px' }}>
              <ModalInput
                placeholder="Enter member name"
                value={newPersonName}
                onChange={(e) => setNewPersonName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddToSquad()}
              />
              <ModalButton 
                $primary 
                onClick={handleAddToSquad}
                style={{ flex: 'none', width: 'auto' }}
              >
                Add
              </ModalButton>
            </div>
          </ModalSection>

          <PeopleList>
            {squadMembers.map((member, idx) => (
              <PersonChip key={idx}>
                {member}
                <RemoveButton onClick={() => setSquadMembers(squadMembers.filter((_, i) => i !== idx))}>×</RemoveButton>
              </PersonChip>
            ))}
          </PeopleList>

          <ModalActions>
            <ModalButton onClick={() => {
              setShowSquadBuilder(false);
              setSquadMembers([]);
              setSquadName('');
              setSquadActivity('');
            }}>
              Cancel
            </ModalButton>
            <ModalButton 
              $primary 
              onClick={handleCreateSquad}
              disabled={squadMembers.length < 2 || !squadName || !squadActivity}
            >
              Create Squad
            </ModalButton>
          </ModalActions>
        </ModalContent>
      </Modal>

      {/* Create Cluster Modal */}
      <Modal $show={showCreateCluster}>
        <ModalContent>
          <ModalTitle>💫 Create Custom Cluster</ModalTitle>
          
          <ModalSection>
            <ModalLabel>Cluster Name:</ModalLabel>
            <ModalInput
              placeholder="e.g. Tech Entrepreneurs in KL"
              value={clusterName}
              onChange={(e) => setClusterName(e.target.value)}
            />
          </ModalSection>

          <ModalSection>
            <ModalLabel>Add cluster members:</ModalLabel>
            <div style={{ display: 'flex', gap: '8px' }}>
              <ModalInput
                placeholder="Enter member name"
                value={newPersonName}
                onChange={(e) => setNewPersonName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddToCluster()}
              />
              <ModalButton 
                $primary 
                onClick={handleAddToCluster}
                style={{ flex: 'none', width: 'auto' }}
              >
                Add
              </ModalButton>
            </div>
          </ModalSection>

          <PeopleList>
            {clusterMembers.map((member, idx) => (
              <PersonChip key={idx}>
                {member}
                <RemoveButton onClick={() => setClusterMembers(clusterMembers.filter((_, i) => i !== idx))}>×</RemoveButton>
              </PersonChip>
            ))}
          </PeopleList>

          <ModalActions>
            <ModalButton onClick={() => {
              setShowCreateCluster(false);
              setClusterMembers([]);
              setClusterName('');
            }}>
              Cancel
            </ModalButton>
            <ModalButton 
              $primary 
              onClick={handleCreateCluster}
              disabled={clusterMembers.length < 3 || !clusterName}
            >
              Create Cluster
            </ModalButton>
          </ModalActions>
        </ModalContent>
      </Modal>

      {/* Bingo Input Modal */}
      <Modal $show={showBingoInput}>
        <ModalContent>
          <ModalTitle>🎯 Complete Bingo Square</ModalTitle>
          
          <ModalSection>
            <ModalLabel>
              Who did you meet that is a {selectedBingoIndex !== null ? bingoItems[selectedBingoIndex]?.text : ''}?
            </ModalLabel>
            <ModalInput
              placeholder="Enter their name"
              value={newPersonName}
              onChange={(e) => setNewPersonName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleBingoComplete(newPersonName)}
            />
          </ModalSection>

          <ModalActions>
            <ModalButton onClick={() => {
              setShowBingoInput(false);
              setSelectedBingoIndex(null);
              setNewPersonName('');
            }}>
              Cancel
            </ModalButton>
            <ModalButton 
              $primary 
              onClick={() => handleBingoComplete(newPersonName)}
              disabled={!newPersonName.trim()}
            >
              Complete Square
            </ModalButton>
          </ModalActions>
        </ModalContent>
      </Modal>

      {/* Network Web Modal */}
      <NetworkWebModal $show={showNetworkWeb}>
        <NetworkWebContent>
          <ModalTitle>🕸️ Your Connection Web</ModalTitle>
          
          <NetworkWebCanvas>
            <NetworkWebNode $x={50} $y={30} $main>You</NetworkWebNode>
            <NetworkWebNode $x={25} $y={60}>Ahmad</NetworkWebNode>
            <NetworkWebNode $x={75} $y={60}>Sarah</NetworkWebNode>
            <NetworkWebNode $x={50} $y={80}>Gym</NetworkWebNode>
            <NetworkWebNode $x={20} $y={20}>Tech</NetworkWebNode>
            <NetworkWebNode $x={80} $y={20}>Art</NetworkWebNode>
            
            <NetworkWebLine>
              <line x1="50%" y1="30%" x2="25%" y2="60%" stroke="#64B5F6" strokeWidth="2"/>
              <line x1="50%" y1="30%" x2="75%" y2="60%" stroke="#64B5F6" strokeWidth="2"/>
              <line x1="25%" y1="60%" x2="50%" y2="80%" stroke="#FFA726" strokeWidth="2"/>
              <line x1="75%" y1="60%" x2="50%" y2="80%" stroke="#FFA726" strokeWidth="2"/>
              <line x1="25%" y1="60%" x2="20%" y2="20%" stroke="#66BB6A" strokeWidth="2"/>
              <line x1="75%" y1="60%" x2="80%" y2="20%" stroke="#66BB6A" strokeWidth="2"/>
            </NetworkWebLine>
          </NetworkWebCanvas>

          <div style={{ fontSize: '13px', color: '#666', marginBottom: '16px' }}>
            Click on any node to explore deeper connections and mutual interests.
          </div>

          <ModalActions>
            <ModalButton $primary onClick={() => setShowNetworkWeb(false)}>
              Close
            </ModalButton>
          </ModalActions>
        </NetworkWebContent>
      </NetworkWebModal>

      {/* Travel Logbook Modal */}
      <TravelLogbookModal $isOpen={showTravelLogbook} onClick={() => setShowTravelLogbook(false)}>
        <LogbookContent onClick={(e) => e.stopPropagation()}>
          <LogbookHeader>
            <LogbookTitle>
              ✈️ Travel Logbook
            </LogbookTitle>
            <LogbookSubtitle>
              {selectedProfile?.name}'s Travel Adventures
            </LogbookSubtitle>
            <CloseButton onClick={() => setShowTravelLogbook(false)}>×</CloseButton>
          </LogbookHeader>

          {selectedProfile?.travelHistory && (
            <>
              <LogbookStats>
                <TravelStatItem>
                  <TravelStatValue>{selectedProfile.travelHistory.length}</TravelStatValue>
                  <TravelStatLabel>Countries Visited</TravelStatLabel>
                </TravelStatItem>
                <TravelStatItem>
                  <TravelStatValue>
                    {selectedProfile.travelHistory.reduce((total, trip) => 
                      total + trip.friends.length, 0
                    )}
                  </TravelStatValue>
                  <TravelStatLabel>Travel Friends</TravelStatLabel>
                </TravelStatItem>
                <TravelStatItem>
                  <TravelStatValue>2023-2024</TravelStatValue>
                  <TravelStatLabel>Travel Period</TravelStatLabel>
                </TravelStatItem>
              </LogbookStats>

              <LogbookList>
                {selectedProfile.travelHistory.map((trip, index) => (
                  <TravelItem key={index}>
                    <TravelHeader>
                      <TravelLocation>
                        <CountryFlag>{trip.flag}</CountryFlag>
                        <LocationInfo>
                          <CountryName>{trip.country}</CountryName>
                          {trip.city && <CityName>{trip.city}</CityName>}
                        </LocationInfo>
                      </TravelLocation>
                      <TravelDates>{trip.dates}</TravelDates>
                    </TravelHeader>
                    
                    <TravelDetails>
                      {trip.purpose && (
                        <TravelPurpose>
                          <span>✨</span> {trip.purpose}
                        </TravelPurpose>
                      )}
                      
                      <FriendsList>
                        <FriendsLabel>Travel Friends:</FriendsLabel>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                          {trip.friends.map((friend, friendIndex) => (
                            <div key={friendIndex} style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: '8px',
                              background: '#F0F7F4',
                              borderRadius: '8px',
                              border: '1px solid #E0E0E0'
                            }}>
                              <span style={{ fontSize: '12px', color: '#333' }}>{friend}</span>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  alert(`Requesting introduction to ${friend}`);
                                }}
                                style={{
                                  background: '#2fce98',
                                  color: 'white',
                                  border: 'none',
                                  padding: '4px 12px',
                                  borderRadius: '6px',
                                  fontSize: '11px',
                                  cursor: 'pointer'
                                }}
                              >
                                Request Intro
                              </button>
                            </div>
                          ))}
                        </div>
                      </FriendsList>
                    </TravelDetails>
                  </TravelItem>
                ))}
              </LogbookList>
            </>
          )}
        </LogbookContent>
      </TravelLogbookModal>

      {/* Trust Chain Modal */}
      <TrustChainModal $isOpen={showTrustChain} onClick={() => setShowTrustChain(false)}>
        <TrustChainContent onClick={(e) => e.stopPropagation()}>
          <TrustChainHeader>
            <TrustChainTitle>
              🔗 Trust Chain & Connection Universe
            </TrustChainTitle>
            <TrustChainSubtitle>
              {selectedProfile?.name}'s Trust Network
            </TrustChainSubtitle>
            <CloseButton onClick={() => setShowTrustChain(false)}>×</CloseButton>
          </TrustChainHeader>

          {selectedProfile && (
            <>
              <TrustMetrics>
                <TrustMetric>
                  <TrustMetricValue>
                    {selectedProfile.mutuals?.length || 0}
                  </TrustMetricValue>
                  <TrustMetricLabel>Mutual Friends</TrustMetricLabel>
                </TrustMetric>
                <TrustMetric>
                  <TrustMetricValue>
                    {selectedProfile.trustChain?.length || 0}
                  </TrustMetricValue>
                  <TrustMetricLabel>Trust Connections</TrustMetricLabel>
                </TrustMetric>
                <TrustMetric>
                  <TrustMetricValue>
                    {selectedProfile.trustChain?.[0]?.rating || 0}
                  </TrustMetricValue>
                  <TrustMetricLabel>Highest Rating</TrustMetricLabel>
                </TrustMetric>
              </TrustMetrics>

              <TrustList>
                {selectedProfile.trustChain?.map((trust, index) => (
                  <TrustCard key={index} $trustLevel={trust.trustLevel}>
                    <TrustCardHeader>
                      <TrustPersonInfo>
                        <TrustAvatar>
                          {trust.name.split(' ').map(n => n[0]).join('')}
                        </TrustAvatar>
                        <TrustPersonDetails>
                          <TrustPersonName>{trust.name}</TrustPersonName>
                          <TrustRelationship>{trust.relationship}</TrustRelationship>
                        </TrustPersonDetails>
                      </TrustPersonInfo>
                      <TrustBadge $level={trust.trustLevel}>
                        {trust.trustLevel}
                      </TrustBadge>
                    </TrustCardHeader>
                    
                    <TrustRating>
                      <TrustStars>
                        {'⭐'.repeat(Math.floor(trust.rating))}
                      </TrustStars>
                      <TrustScore>{trust.rating}/5.0</TrustScore>
                    </TrustRating>
                    
                    <TrustFeedback>
                      "{trust.feedback}"
                    </TrustFeedback>
                  </TrustCard>
                ))}

                {selectedProfile.mutuals && selectedProfile.mutuals.length > 0 && (
                  <MutualConnectionsSection>
                    <MutualConnectionsTitle>
                      🤝 Your Mutual Connections
                    </MutualConnectionsTitle>
                    <MutualConnectionsList>
                      {selectedProfile.mutuals.map((mutual, index) => (
                        <MutualTag key={index}>{mutual}</MutualTag>
                      ))}
                    </MutualConnectionsList>
                  </MutualConnectionsSection>
                )}
              </TrustList>
            </>
          )}
        </TrustChainContent>
      </TrustChainModal>

      {/* Profile Detail Modal */}
      <ProfileDetailModal $isOpen={showProfileDetail} onClick={() => setShowProfileDetail(false)}>
        <ProfileDetailContent onClick={(e) => e.stopPropagation()}>
          <ProfileDetailHeader>
            <CloseModalButton onClick={() => setShowProfileDetail(false)}>×</CloseModalButton>
            
            {/* Large Profile Image */}
            <ProfileImageLarge $bgColor={selectedDetailProfile?.avatarColor || getGradient(selectedDetailProfile?.name || 'User')}>
              {selectedDetailProfile?.profileImage ? (
                <img src={selectedDetailProfile.profileImage} alt={selectedDetailProfile.name} />
              ) : (
                selectedDetailProfile?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U'
              )}
            </ProfileImageLarge>
            
            <h2 style={{ margin: 0, fontSize: '22px', color: '#2fce98', fontWeight: '600' }}>
              {selectedDetailProfile?.name}
            </h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#666' }}>
              {selectedDetailProfile?.profession} • {selectedDetailProfile?.age} • {selectedDetailProfile?.location}
            </p>
            
            {/* Social Media Links */}
            <SocialMediaLinks>
              {selectedDetailProfile?.linkedin && (
                <SocialLink href={`https://linkedin.com/in/${selectedDetailProfile.linkedin}`} target="_blank" rel="noopener noreferrer">
                  💼
                </SocialLink>
              )}
              {selectedDetailProfile?.instagram && (
                <SocialLink href={`https://instagram.com/${selectedDetailProfile.instagram}`} target="_blank" rel="noopener noreferrer">
                  📷
                </SocialLink>
              )}
              {selectedDetailProfile?.twitter && (
                <SocialLink href={`https://twitter.com/${selectedDetailProfile.twitter}`} target="_blank" rel="noopener noreferrer">
                  🐦
                </SocialLink>
              )}
              {selectedDetailProfile?.website && (
                <SocialLink href={selectedDetailProfile.website} target="_blank" rel="noopener noreferrer">
                  🌐
                </SocialLink>
              )}
            </SocialMediaLinks>
          </ProfileDetailHeader>

          {/* Personality & Languages */}
          <ProfileDetailSection>
            <DetailSectionTitle>Personal Details</DetailSectionTitle>
            <DetailList>
              {selectedDetailProfile?.personalityType && (
                <DetailItem>
                  <span>🧠</span>
                  <div>
                    <strong>Personality Type:</strong> {selectedDetailProfile.personalityType}
                  </div>
                </DetailItem>
              )}
              {(selectedDetailProfile?.languages || selectedDetailProfile?.guideLanguages) && (
                <DetailItem>
                  <span>🗣️</span>
                  <div>
                    <strong>Languages:</strong> {selectedDetailProfile.languages || selectedDetailProfile.guideLanguages}
                  </div>
                </DetailItem>
              )}
              {selectedDetailProfile?.age && (
                <DetailItem>
                  <span>🎂</span>
                  <div>
                    <strong>Age:</strong> {selectedDetailProfile.age} years old
                  </div>
                </DetailItem>
              )}
            </DetailList>
          </ProfileDetailSection>

          {/* Interests */}
          {selectedDetailProfile?.interests && selectedDetailProfile.interests.length > 0 && (
            <ProfileDetailSection>
              <DetailSectionTitle>Interests</DetailSectionTitle>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {selectedDetailProfile.interests.map((interest: string, index: number) => (
                  <InfoBadge key={index} $color="#E8F5E9" $textColor="#2E7D32">
                    {interest}
                  </InfoBadge>
                ))}
              </div>
            </ProfileDetailSection>
          )}

          {/* Communities */}
          {(selectedDetailProfile?.communities && selectedDetailProfile.communities.length > 0) || true && (
            <ProfileDetailSection>
              <DetailSectionTitle>Communities</DetailSectionTitle>
              <DetailList>
                {(selectedDetailProfile?.communities || ["Ahl 'Umran Network", 'PeaceMeal MY']).map((community: string, index: number) => (
                  <DetailItem key={index}>
                    <span>👥</span>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                      <span>{community}</span>
                      <span style={{ fontSize: '10px', color: '#2fce98', fontWeight: '600' }}>
                        {community === "Ahl 'Umran Network" ? 'Moderator' : 
                         community === 'PeaceMeal MY' ? 'Member' : 'Member'}
                      </span>
                    </div>
                  </DetailItem>
                ))}
              </DetailList>
            </ProfileDetailSection>
          )}
          
          {/* BerseMukha Sessions */}
          <ProfileDetailSection>
            <DetailSectionTitle>BerseMukha Sessions Joined</DetailSectionTitle>
            <DetailList>
              <DetailItem>
                <span>🕌</span>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                  <span>BerseMukha August 2025</span>
                  <span style={{ fontSize: '10px', color: '#999' }}>10 Aug</span>
                </div>
              </DetailItem>
              <DetailItem>
                <span>🕌</span>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                  <span>BerseMukha July 2025</span>
                  <span style={{ fontSize: '10px', color: '#999' }}>13 Jul</span>
                </div>
              </DetailItem>
              <DetailItem>
                <span>🕌</span>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                  <span>BerseMukha June 2025</span>
                  <span style={{ fontSize: '10px', color: '#999' }}>15 Jun</span>
                </div>
              </DetailItem>
            </DetailList>
            <div style={{ marginTop: '8px', padding: '8px', background: '#f0f9ff', borderRadius: '8px' }}>
              <div style={{ fontSize: '11px', color: '#2fce98', fontWeight: '600' }}>📊 Attendance Stats</div>
              <div style={{ fontSize: '10px', color: '#666', marginTop: '4px' }}>12 sessions • 87% attendance • 45 connections made</div>
            </div>
          </ProfileDetailSection>

          {/* Events Attending */}
          {selectedDetailProfile?.eventsAttending && selectedDetailProfile.eventsAttending.length > 0 && (
            <ProfileDetailSection>
              <DetailSectionTitle>Upcoming Events</DetailSectionTitle>
              <DetailList>
                {selectedDetailProfile.eventsAttending.map((event: string, index: number) => (
                  <DetailItem key={index}>
                    <span>📅</span>
                    <div>{event}</div>
                  </DetailItem>
                ))}
              </DetailList>
            </ProfileDetailSection>
          )}

          {/* Services & Offerings */}
          <ProfileDetailSection>
            <DetailSectionTitle>Services & Offerings</DetailSectionTitle>
            <DetailList>
              {selectedDetailProfile?.servicesOffered?.localGuide && (
                <DetailItem>
                  <span>🗺️</span>
                  <div>
                    <strong>BerseGuide</strong>
                    <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
                      Local tours in KL • RM50-80/day • Heritage & Architecture focus
                    </div>
                  </div>
                </DetailItem>
              )}
              {selectedDetailProfile?.servicesOffered?.homestay && (
                <DetailItem>
                  <span>🏠</span>
                  <div>
                    <strong>HomeSurf</strong>
                    <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
                      Couch available • Max 3 days • WiFi & Kitchen access
                    </div>
                  </div>
                </DetailItem>
              )}
              {selectedDetailProfile?.servicesOffered?.openToConnect && (
                <DetailItem>
                  <span>☕</span>
                  <div>
                    <strong>BerseBuddy</strong>
                    <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
                      Coffee meetups • Photography walks • Cultural exchanges
                    </div>
                  </div>
                </DetailItem>
              )}
              {(selectedDetailProfile?.offers || []).map((offer: string, index: number) => (
                <DetailItem key={`offer-${index}`}>
                  <span>✨</span>
                  <div>{offer}</div>
                </DetailItem>
              ))}
            </DetailList>
          </ProfileDetailSection>

          {/* Bio */}
          {selectedDetailProfile?.bio && (
            <ProfileDetailSection>
              <DetailSectionTitle>About</DetailSectionTitle>
              <p style={{ margin: 0, fontSize: '12px', color: '#333', lineHeight: 1.5 }}>
                {selectedDetailProfile.bio}
              </p>
            </ProfileDetailSection>
          )}

          {/* Action Buttons */}
          <ProfileDetailSection style={{ display: 'flex', gap: '12px' }}>
            <GuideButton 
              style={{ flex: 1 }} 
              $primary
              onClick={() => {
                // Use the same ShareModal as the main cards
                handleShareProfile(selectedDetailProfile);
                setShowProfileDetail(false); // Close the detail modal
              }}
            >
              📤 Share
            </GuideButton>
            <GuideButton 
              style={{ flex: 1 }}
              onClick={() => {
                // Use the same FriendRequestModal as the main cards
                setSelectedConnection(selectedDetailProfile);
                setShowFriendRequestModal(true);
                setShowProfileDetail(false); // Close the detail modal
              }}
            >
              🤝 Friend Request
            </GuideButton>
          </ProfileDetailSection>
        </ProfileDetailContent>
      </ProfileDetailModal>

      {/* Communities Modal */}
      <TravelLogbookModal $isOpen={showCommunitiesModal} onClick={() => setShowCommunitiesModal(false)}>
        <LogbookContent onClick={(e) => e.stopPropagation()}>
          <LogbookHeader>
            <LogbookTitle>👥 Communities</LogbookTitle>
            <LogbookSubtitle>{selectedProfile?.name}'s Communities & Roles</LogbookSubtitle>
            <CloseButton onClick={() => setShowCommunitiesModal(false)}>×</CloseButton>
          </LogbookHeader>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
            {selectedProfile?.communities?.map((community, idx) => {
              const roles = {
                "Ahl 'Umran Network": 'Moderator',
                'PeaceMeal MY': 'Active Member'
              };
              
              return (
                <div key={idx} style={{
                  background: '#F8F8F8',
                  borderRadius: '12px',
                  padding: '16px',
                  border: '1px solid #E0E0E0'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                    <h4 style={{ margin: 0, color: '#2fce98' }}>{community}</h4>
                    <span style={{
                      background: '#2fce98',
                      color: 'white',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '11px'
                    }}>
                      {roles[community] || 'Member'}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '12px' }}>
                    <div>Since: 2022</div>
                    <div>245 active members</div>
                  </div>
                  <button style={{
                    width: '100%',
                    padding: '8px',
                    background: 'white',
                    border: '1px solid #2fce98',
                    borderRadius: '8px',
                    color: '#2fce98',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}>
                    View Community
                  </button>
                </div>
              );
            })}
          </div>
        </LogbookContent>
      </TravelLogbookModal>

      {/* BerseMukha Events Modal */}
      <TravelLogbookModal $isOpen={showEventsModal} onClick={() => setShowEventsModal(false)}>
        <LogbookContent onClick={(e) => e.stopPropagation()}>
          <LogbookHeader>
            <LogbookTitle>🤝 BerseMukha Events</LogbookTitle>
            <LogbookSubtitle>{selectedProfile?.name}'s BerseMukha Journey (Jan 2023 - Jul 2025)</LogbookSubtitle>
            <CloseButton onClick={() => setShowEventsModal(false)}>×</CloseButton>
          </LogbookHeader>
          
          {/* Generate person's attendance data */}
          {(() => {
            const allEvents = generateBerseMukhaEvents();
            const personAttendance = generatePersonAttendance(selectedProfile?.name || 'User');
            const attendedEvents = personAttendance.filter(a => a.attended);
            const totalFriends = attendedEvents.reduce((sum, event) => sum + event.friendsMade.length, 0);
            
            return (
              <>
                {/* BerseMukha Stats */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: '12px',
                  marginBottom: '20px',
                  padding: '16px',
                  background: 'linear-gradient(135deg, #2fce98, #4A8B7C)',
                  borderRadius: '12px',
                  color: 'white'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                      {attendedEvents.length}
                    </div>
                    <div style={{ fontSize: '11px', opacity: 0.9 }}>Events Attended</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{totalFriends}</div>
                    <div style={{ fontSize: '11px', opacity: 0.9 }}>Friends Made</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                      {Math.round((attendedEvents.length / allEvents.length) * 100)}%
                    </div>
                    <div style={{ fontSize: '11px', opacity: 0.9 }}>Attendance Rate</div>
                  </div>
                </div>
          
                <h4 style={{ color: '#2fce98', marginBottom: '12px' }}>
                  Monthly BerseMukha Events Attended ({attendedEvents.length} of {allEvents.length} total):
                </h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '400px', overflowY: 'auto' }}>
                  {attendedEvents.map((attendance) => {
                    const event = allEvents.find(e => e.id === attendance.eventId);
                    if (!event) return null;
                    
                    return (
                      <div key={attendance.eventId} style={{
                        background: '#F8F8F8',
                        borderRadius: '12px',
                        padding: '16px',
                        border: '2px solid #E8F5E9',
                        position: 'relative'
                      }}>
                        {/* Event Header */}
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: '12px'
                        }}>
                          <div>
                            <h4 style={{ margin: '0 0 4px 0', color: '#2fce98' }}>
                              {event.month} {event.year} - {event.theme}
                            </h4>
                            <div style={{ fontSize: '12px', color: '#666' }}>
                              📍 {event.venue}, {event.location}
                            </div>
                          </div>
                          <div style={{
                            background: '#2fce98',
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontSize: '10px',
                            fontWeight: '600'
                          }}>
                            ✅ Attended
                          </div>
                        </div>
                        
                        {/* Event Details */}
                        <div style={{ 
                          display: 'grid', 
                          gridTemplateColumns: '1fr 1fr', 
                          gap: '8px', 
                          marginBottom: '12px',
                          fontSize: '11px',
                          color: '#666'
                        }}>
                          <div>🏠 Host: {event.host}</div>
                          <div>👥 {event.attendees} attendees</div>
                        </div>
                        
                        {/* Friends Made Section */}
                        {attendance.friendsMade.length > 0 && (
                          <div style={{
                            background: 'white',
                            borderRadius: '8px',
                            padding: '12px',
                            marginTop: '12px'
                          }}>
                            <h5 style={{ 
                              margin: '0 0 8px 0', 
                              color: '#2fce98',
                              fontSize: '12px'
                            }}>
                              🤝 Friends Made ({attendance.friendsMade.length})
                            </h5>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              {attendance.friendsMade.map((friend, idx) => (
                                <div key={idx} style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  padding: '8px',
                                  background: '#F8F8F8',
                                  borderRadius: '6px'
                                }}>
                                  <div>
                                    <div style={{ 
                                      fontSize: '12px', 
                                      fontWeight: '600',
                                      color: '#333'
                                    }}>
                                      {friend.name}
                                    </div>
                                    <div style={{ 
                                      fontSize: '10px', 
                                      color: '#666' 
                                    }}>
                                      {friend.profession}
                                    </div>
                                  </div>
                                  <button 
                                    style={{
                                      padding: '4px 12px',
                                      background: friend.connected ? '#E8F5E9' : '#2fce98',
                                      color: friend.connected ? '#2E7D32' : 'white',
                                      border: friend.connected ? '1px solid #2E7D32' : 'none',
                                      borderRadius: '6px',
                                      fontSize: '10px',
                                      fontWeight: '600',
                                      cursor: friend.connected ? 'default' : 'pointer',
                                      transition: 'all 0.2s'
                                    }}
                                    disabled={friend.connected}
                                    onClick={() => {
                                      if (!friend.connected) {
                                        alert(`Requesting connection to ${friend.name} through ${selectedProfile?.name}...`);
                                      }
                                    }}
                                  >
                                    {friend.connected ? '✓ Connected' : 'Request Connection'}
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                {/* Show More Events Section */}
                {attendedEvents.length === 0 && (
                  <div style={{
                    textAlign: 'center',
                    padding: '32px',
                    background: '#F8F8F8',
                    borderRadius: '12px',
                    color: '#666'
                  }}>
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>🎭</div>
                    <div>No BerseMukha events attended yet</div>
                  </div>
                )}
              </>
            );
          })()}
        </LogbookContent>
      </TravelLogbookModal>

      {/* Offerings Modal */}
      <TravelLogbookModal $isOpen={showOfferingsModal} onClick={() => setShowOfferingsModal(false)}>
        <LogbookContent onClick={(e) => e.stopPropagation()}>
          <LogbookHeader>
            <LogbookTitle>🎯 Offerings</LogbookTitle>
            <LogbookSubtitle>{selectedProfile?.name}'s Services & Offerings</LogbookSubtitle>
            <CloseButton onClick={() => setShowOfferingsModal(false)}>×</CloseButton>
          </LogbookHeader>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* BerseGuide */}
            <div style={{ background: '#F8F8F8', borderRadius: '12px', padding: '16px' }}>
              <h4 style={{ margin: '0 0 12px 0', color: '#2fce98' }}>🗺️ BerseGuide</h4>
              <div style={{ fontSize: '12px', marginBottom: '12px' }}>
                <div style={{ marginBottom: '6px' }}>
                  <strong>Price:</strong> RM50-80/day or skill trade
                </div>
                <div style={{ marginBottom: '6px' }}>
                  <strong>Duration:</strong> Half day / Full day
                </div>
                <div style={{ marginBottom: '6px' }}>
                  <strong>Locations:</strong> KL, Penang, Langkawi
                </div>
                <div>
                  <strong>Specialties:</strong>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                    {['Food Tours', 'Historical Sites', 'Hidden Gems'].map((item, i) => (
                      <span key={i} style={{
                        background: 'white',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '10px',
                        color: '#2fce98'
                      }}>{item}</span>
                    ))}
                  </div>
                </div>
              </div>
              <button style={{
                width: '100%',
                padding: '8px',
                background: '#2fce98',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                fontSize: '12px',
                cursor: 'pointer'
              }}>Book Guide</button>
            </div>

            {/* HomeSurf */}
            <div style={{ background: '#F8F8F8', borderRadius: '12px', padding: '16px' }}>
              <h4 style={{ margin: '0 0 12px 0', color: '#2fce98' }}>🏠 HomeSurf</h4>
              <div style={{ fontSize: '12px', marginBottom: '12px' }}>
                <div style={{ marginBottom: '6px' }}>
                  <strong>Available:</strong> ✅ Yes
                </div>
                <div style={{ marginBottom: '6px' }}>
                  <strong>Max Days:</strong> 3 nights
                </div>
                <div>
                  <strong>Amenities:</strong>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                    {['WiFi', 'Kitchen', 'Private Room'].map((item, i) => (
                      <span key={i} style={{
                        background: 'white',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '10px',
                        color: '#2fce98'
                      }}>{item}</span>
                    ))}
                  </div>
                </div>
              </div>
              <button style={{
                width: '100%',
                padding: '8px',
                background: '#2fce98',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                fontSize: '12px',
                cursor: 'pointer'
              }}>Request Stay</button>
            </div>

            {/* BerseBuddy */}
            <div style={{ background: '#F8F8F8', borderRadius: '12px', padding: '16px' }}>
              <h4 style={{ margin: '0 0 12px 0', color: '#2fce98' }}>👫 BerseBuddy</h4>
              <div style={{ fontSize: '12px', marginBottom: '12px' }}>
                <div style={{ marginBottom: '6px' }}>
                  <strong>Activities:</strong>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                    {['Coffee Meetups', 'Weekend Trips'].map((item, i) => (
                      <span key={i} style={{
                        background: 'white',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '10px',
                        color: '#2fce98'
                      }}>{item}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <strong>Availability:</strong> Weekends & Evenings
                </div>
              </div>
              <button style={{
                width: '100%',
                padding: '8px',
                background: '#2fce98',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                fontSize: '12px',
                cursor: 'pointer'
              }}>Be Buddies</button>
            </div>

            {/* BerseMentor */}
            <div style={{ background: '#F8F8F8', borderRadius: '12px', padding: '16px' }}>
              <h4 style={{ margin: '0 0 12px 0', color: '#2fce98' }}>🎓 BerseMentor</h4>
              <div style={{ fontSize: '12px', marginBottom: '12px' }}>
                <div style={{ marginBottom: '6px' }}>
                  <strong>Expertise:</strong>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                    {['Architecture', 'Photography'].map((item, i) => (
                      <span key={i} style={{
                        background: 'white',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '10px',
                        color: '#2fce98'
                      }}>{item}</span>
                    ))}
                  </div>
                </div>
                <div style={{ marginBottom: '6px' }}>
                  <strong>Rate:</strong> 100 BersePoints/hour
                </div>
                <div>
                  <strong>Format:</strong> Online, In-person
                </div>
              </div>
              <button style={{
                width: '100%',
                padding: '8px',
                background: '#2fce98',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                fontSize: '12px',
                cursor: 'pointer'
              }}>Book Session</button>
            </div>
          </div>
        </LogbookContent>
      </TravelLogbookModal>


      {/* Community Modals */}
      <JoinCommunityModal
        isOpen={showJoinCommunityModal}
        onClose={() => setShowJoinCommunityModal(false)}
        community={selectedConnection ? {
          id: selectedConnection.id.toString(),
          name: selectedConnection.name,
          memberCount: selectedConnection.memberCount || 0,
          eventCount: selectedConnection.eventCount || 0,
          description: selectedConnection.description || selectedConnection.bio,
          category: selectedConnection.category
        } : null}
        onJoin={handleJoinCommunity}
      />

      <FriendRequestModal
        isOpen={showFriendRequestModal}
        onClose={() => setShowFriendRequestModal(false)}
        profile={selectedConnection ? {
          id: selectedConnection.id,
          name: selectedConnection.name,
          bio: selectedConnection.bio
        } : null}
        onSend={handleSendFriendRequest}
      />


      <MainNav 
        activeTab="match"
        onTabPress={(tab) => {
          if (tab !== 'match') {
            navigate(`/${tab === 'home' ? 'dashboard' : tab}`);
          }
        }}
      />
    </Container>
  );
};