import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { StatusBar } from '../components/StatusBar/StatusBar';
import { BottomNav } from '../components/BottomNav';
import { useAuth } from '../contexts/AuthContext';
import { useMessaging } from '../contexts/MessagingContext';
import { userProfiles, getRandomProfiles, UserProfile } from '../data/profiles';
import { CountryFilterModal, CityFilterModal } from '../components/FilterModals';

// Types - Using shared UserProfile from profiles.ts

// Enhanced Search Types
interface SearchCategory {
  id: 'all' | 'interests' | 'communities' | 'companies' | 'skills' | 'personality';
  name: string;
  icon: string;
}

interface InterestOption {
  id: string;
  name: string;
  category: string;
  popularity: number;
}

interface CommunityOption {
  id: string;
  name: string;
  type: 'educational' | 'professional' | 'regional' | 'alumni';
  verified: boolean;
  memberCount: number;
  description: string;
}

interface CompanyOption {
  id: string;
  name: string;
  type: 'government' | 'university' | 'corporation' | 'ngo' | 'foundation';
  verified: boolean;
  description: string;
}

interface SkillOption {
  id: string;
  name: string;
  category: string;
}

interface PersonalityOption {
  id: string;
  name: string;
  type: string;
  temperament: 'NT' | 'NF' | 'SJ' | 'SP';
  variants: string[];
}

interface UserLevel {
  level: number;
  name: string;
  color: string;
  minPoints: number;
}

interface VerificationItem {
  id: string;
  type: 'community' | 'identity' | 'professional' | 'educational';
  verifiedBy: string;
  verificationDate: string;
  isActive: boolean;
}

interface AchievementBadge {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
}

// Enhanced User Profile with new fields
interface EnhancedUserProfile extends UserProfile {
  communities?: string[];
  companies?: string[];
  skills?: string[];
  verifiedBy?: string[];
  institutionalBacking?: string[];
  personalityType?: string;
  userLevel?: number;
  verifications?: VerificationItem[];
  achievements?: string[];
}

// Enhanced Search Data
const searchCategories: SearchCategory[] = [
  { id: 'all', name: 'All', icon: '🔍' },
  { id: 'interests', name: 'Interests', icon: '🎯' },
  { id: 'communities', name: 'Communities', icon: '🏛️' },
  { id: 'companies', name: 'Companies', icon: '🏢' },
  { id: 'skills', name: 'Skills', icon: '⚡' },
  { id: 'personality', name: 'Personality', icon: '💭' }
];

const interestOptions: InterestOption[] = [
  { id: 'philosophy', name: 'Philosophy', category: 'academic', popularity: 85 },
  { id: 'finance', name: 'Finance', category: 'professional', popularity: 92 },
  { id: 'investment', name: 'Investment', category: 'professional', popularity: 88 },
  { id: 'history', name: 'History', category: 'academic', popularity: 76 },
  { id: 'photography', name: 'Photography', category: 'creative', popularity: 94 },
  { id: 'coffee', name: 'Coffee', category: 'lifestyle', popularity: 89 },
  { id: 'travel', name: 'Travel', category: 'lifestyle', popularity: 96 },
  { id: 'technology', name: 'Technology', category: 'professional', popularity: 91 },
  { id: 'art', name: 'Art', category: 'creative', popularity: 83 },
  { id: 'music', name: 'Music', category: 'creative', popularity: 87 },
  { id: 'sports', name: 'Sports', category: 'lifestyle', popularity: 84 },
  { id: 'business', name: 'Business', category: 'professional', popularity: 90 },
  { id: 'education', name: 'Education', category: 'academic', popularity: 82 },
  { id: 'health', name: 'Health', category: 'lifestyle', popularity: 86 },
  { id: 'cooking', name: 'Cooking', category: 'lifestyle', popularity: 81 },
  { id: 'reading', name: 'Reading', category: 'academic', popularity: 78 },
  { id: 'gaming', name: 'Gaming', category: 'entertainment', popularity: 79 },
  { id: 'fitness', name: 'Fitness', category: 'lifestyle', popularity: 85 }
];

const communityOptions: CommunityOption[] = [
  { 
    id: 'ahl-umran', 
    name: 'Ahl \'Umran Network', 
    type: 'professional', 
    verified: true, 
    memberCount: 2500, 
    description: 'Professional network for Islamic civilization development' 
  },
  { 
    id: 'mara-germany', 
    name: 'MARA Germany', 
    type: 'educational', 
    verified: true, 
    memberCount: 1200, 
    description: 'Malaysian students in Germany supported by MARA' 
  },
  { 
    id: 'masat-turkey', 
    name: 'MASAT Turkey', 
    type: 'educational', 
    verified: true, 
    memberCount: 800, 
    description: 'Malaysian Students Association in Turkey' 
  },
  { 
    id: 'msa-global', 
    name: 'Malaysian Students Association', 
    type: 'alumni', 
    verified: true, 
    memberCount: 5000, 
    description: 'Global network of Malaysian students' 
  },
  { 
    id: 'nama-foundation', 
    name: 'NAMA Foundation Network', 
    type: 'foundation', 
    verified: true, 
    memberCount: 3500, 
    description: 'Building communities and fostering leadership' 
  },
  { 
    id: 'ptptn-alumni', 
    name: 'PTPTN Alumni', 
    type: 'alumni', 
    verified: true, 
    memberCount: 15000, 
    description: 'PTPTN scholarship recipients network' 
  }
];

const companyOptions: CompanyOption[] = [
  { 
    id: 'nama-foundation', 
    name: 'NAMA Foundation', 
    type: 'foundation', 
    verified: true, 
    description: 'Leadership development and community building' 
  },
  { 
    id: 'ptptn', 
    name: 'PTPTN', 
    type: 'government', 
    verified: true, 
    description: 'National Higher Education Fund Corporation' 
  },
  { 
    id: 'mara', 
    name: 'MARA', 
    type: 'government', 
    verified: true, 
    description: 'Majlis Amanah Rakyat - Rural development agency' 
  },
  { 
    id: 'jpa', 
    name: 'JPA', 
    type: 'government', 
    verified: true, 
    description: 'Public Service Department of Malaysia' 
  },
  { 
    id: 'um', 
    name: 'University of Malaya', 
    type: 'university', 
    verified: true, 
    description: 'Premier university in Malaysia' 
  },
  { 
    id: 'ukm', 
    name: 'Universiti Kebangsaan Malaysia', 
    type: 'university', 
    verified: true, 
    description: 'National University of Malaysia' 
  },
  { 
    id: 'maybank', 
    name: 'Maybank', 
    type: 'corporation', 
    verified: true, 
    description: 'Leading financial services group in Southeast Asia' 
  }
];

const skillOptions: SkillOption[] = [
  { id: 'tutoring', name: 'Tutoring', category: 'education' },
  { id: 'mentoring', name: 'Mentoring', category: 'professional' },
  { id: 'consulting', name: 'Consulting', category: 'professional' },
  { id: 'design', name: 'Design', category: 'creative' },
  { id: 'programming', name: 'Programming', category: 'technical' },
  { id: 'translation', name: 'Translation', category: 'language' },
  { id: 'writing', name: 'Writing', category: 'creative' },
  { id: 'research', name: 'Research', category: 'academic' },
  { id: 'analysis', name: 'Analysis', category: 'professional' },
  { id: 'project-management', name: 'Project Management', category: 'professional' }
];

// MBTI Personality Types with variants
const personalityOptions: PersonalityOption[] = [
  // Analysts (NT)
  { id: 'intj', name: 'INTJ', type: 'Architect', temperament: 'NT', variants: ['INTJ-A', 'INTJ-T'] },
  { id: 'intp', name: 'INTP', type: 'Thinker', temperament: 'NT', variants: ['INTP-A', 'INTP-T'] },
  { id: 'entj', name: 'ENTJ', type: 'Commander', temperament: 'NT', variants: ['ENTJ-A', 'ENTJ-T'] },
  { id: 'entp', name: 'ENTP', type: 'Debater', temperament: 'NT', variants: ['ENTP-A', 'ENTP-T'] },
  
  // Diplomats (NF)
  { id: 'infj', name: 'INFJ', type: 'Advocate', temperament: 'NF', variants: ['INFJ-A', 'INFJ-T'] },
  { id: 'infp', name: 'INFP', type: 'Mediator', temperament: 'NF', variants: ['INFP-A', 'INFP-T'] },
  { id: 'enfj', name: 'ENFJ', type: 'Protagonist', temperament: 'NF', variants: ['ENFJ-A', 'ENFJ-T'] },
  { id: 'enfp', name: 'ENFP', type: 'Campaigner', temperament: 'NF', variants: ['ENFP-A', 'ENFP-T'] },
  
  // Sentinels (SJ)
  { id: 'istj', name: 'ISTJ', type: 'Logistician', temperament: 'SJ', variants: ['ISTJ-A', 'ISTJ-T'] },
  { id: 'isfj', name: 'ISFJ', type: 'Protector', temperament: 'SJ', variants: ['ISFJ-A', 'ISFJ-T'] },
  { id: 'estj', name: 'ESTJ', type: 'Executive', temperament: 'SJ', variants: ['ESTJ-A', 'ESTJ-T'] },
  { id: 'esfj', name: 'ESFJ', type: 'Consul', temperament: 'SJ', variants: ['ESFJ-A', 'ESFJ-T'] },
  
  // Explorers (SP)
  { id: 'istp', name: 'ISTP', type: 'Virtuoso', temperament: 'SP', variants: ['ISTP-A', 'ISTP-T'] },
  { id: 'isfp', name: 'ISFP', type: 'Adventurer', temperament: 'SP', variants: ['ISFP-A', 'ISFP-T'] },
  { id: 'estp', name: 'ESTP', type: 'Entrepreneur', temperament: 'SP', variants: ['ESTP-A', 'ESTP-T'] },
  { id: 'esfp', name: 'ESFP', type: 'Entertainer', temperament: 'SP', variants: ['ESFP-A', 'ESFP-T'] }
];

// User Level System
const userLevels: UserLevel[] = [
  { level: 1, name: 'Newcomer', color: '#8B4513', minPoints: 0 },
  { level: 2, name: 'Member', color: '#8B4513', minPoints: 50 },
  { level: 3, name: 'Active', color: '#8B4513', minPoints: 150 },
  { level: 4, name: 'Contributor', color: '#CD7F32', minPoints: 300 },
  { level: 5, name: 'Supporter', color: '#CD7F32', minPoints: 500 },
  { level: 6, name: 'Advocate', color: '#C0C0C0', minPoints: 800 },
  { level: 7, name: 'Champion', color: '#C0C0C0', minPoints: 1200 },
  { level: 8, name: 'Leader', color: '#FFD700', minPoints: 1800 },
  { level: 9, name: 'Elite', color: '#FFD700', minPoints: 2500 },
  { level: 10, name: 'Legend', color: '#E5E4E2', minPoints: 3500 }
];

// Achievement Badges
const achievementBadges: AchievementBadge[] = [
  { id: 'community-builder', name: 'Community Builder', icon: '🏆', color: '#FFD700', description: 'Built strong community connections' },
  { id: 'trusted-member', name: 'Trusted Member', icon: '⭐', color: '#007BFF', description: 'Highly rated by community' },
  { id: 'verified-expert', name: 'Verified Expert', icon: '👑', color: '#6F42C1', description: 'Professionally verified expertise' },
  { id: 'helpful-mentor', name: 'Helpful Mentor', icon: '🎯', color: '#28A745', description: 'Actively helps community members' },
  { id: 'active-participant', name: 'Active Participant', icon: '🔥', color: '#FD7E14', description: 'Regularly participates in events' },
  { id: 'social-connector', name: 'Social Connector', icon: '🤝', color: '#20C997', description: 'Connects people effectively' }
];

// Styled Components
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
  margin-bottom: 8px;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
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

const HeaderText = styled.div`
  h3 {
    margin: 0;
    font-size: 12px;
    color: #666;
    font-weight: normal;
  }
  h2 {
    margin: 0;
    font-size: 18px;
    color: #2D5F4F;
    font-weight: bold;
  }
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

// Filter components from BerseConnect
const FilterSection = styled.div`
  padding: 8px 20px;
  background-color: transparent;
  margin-bottom: 12px;
`;

const FilterDropdowns = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const FilterDropdown = styled.button<{ $isActive?: boolean; $disabled?: boolean }>`
  flex: 1;
  padding: 8px 14px;
  border: 1px solid ${({ $isActive, $disabled }) => $disabled ? '#E5E5E5' : ($isActive ? '#2D5F4F' : '#ddd')};
  border-radius: 8px;
  background: white;
  color: ${({ $isActive, $disabled }) => $disabled ? '#999' : ($isActive ? '#2D5F4F' : '#333')};
  font-size: 12px;
  font-weight: ${({ $isActive }) => $isActive ? '600' : '500'};
  cursor: ${({ $disabled }) => $disabled ? 'not-allowed' : 'pointer'};
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.2s ease;
  opacity: ${({ $disabled }) => $disabled ? 0.6 : 1};
  height: 40px;
  min-height: 40px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  &:hover {
    border-color: ${({ $disabled }) => $disabled ? '#E5E5E5' : '#2D5F4F'};
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    transform: translateY(-1px);
  }
  
  &::after {
    content: '▼';
    font-size: 8px;
    margin-left: 6px;
    color: ${({ $isActive, $disabled }) => $disabled ? '#999' : ($isActive ? '#2D5F4F' : '#666')};
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

const ActiveFiltersBar = styled.div`
  padding: 8px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  font-size: 12px;
  color: #666;
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 20px;
  margin-bottom: 16px;
  
  @media (max-width: 480px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
`;

const FilterContent = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
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
  
  @media (max-width: 480px) {
    align-self: flex-end;
    margin-top: 4px;
  }
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

const Content = styled.div`
  flex: 1;
  padding: 0 20px 20px 20px;
  overflow-y: auto;
`;

// Service Category Buttons (with optimized spacing)
const ServiceButtonsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px 8px;
  margin: 0 auto 12px auto;
  padding: 0 20px;
  justify-items: center;
  align-items: center;
  width: 100%;
  max-width: 500px;
  
  /* Responsive design */
  @media (max-width: 480px) {
    grid-template-columns: repeat(3, 1fr);
    max-width: 300px;
  }
  
  @media (max-width: 360px) {
    grid-template-columns: repeat(2, 1fr);
    max-width: 200px;
  }
`;

const ServiceButtonCard = styled.div<{ $isSelected?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 8px 4px;
  border-radius: 12px;
  width: 100%;
  min-height: 80px;
  
  &:hover {
    background-color: rgba(45, 95, 79, 0.05);
    transform: translateY(-1px);
  }
  
  ${({ $isSelected }) => $isSelected && `
    background-color: rgba(45, 95, 79, 0.1);
    transform: translateY(-1px);
  `}
`;

const ServiceButtonIcon = styled.div<{ $color: string; $isSelected?: boolean }>`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${({ $color, $isSelected }) => 
    $isSelected 
      ? `linear-gradient(135deg, ${$color}, ${$color}dd)` 
      : `linear-gradient(135deg, ${$color}22, ${$color}11)`
  };
  border: 2px solid ${({ $color, $isSelected }) => $isSelected ? $color : `${$color}33`};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  transition: all 0.2s ease;
  flex-shrink: 0;
`;

const ServiceButtonLabel = styled.span<{ $isSelected?: boolean }>`
  font-size: 11px;
  color: ${({ $isSelected }) => $isSelected ? '#2D5F4F' : '#666'};
  font-weight: ${({ $isSelected }) => $isSelected ? '600' : '500'};
  text-align: center;
  line-height: 1.2;
  max-width: 70px;
  overflow-wrap: break-word;
`;




// Search Modal Components
const SearchModal = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: ${({ $isOpen }) => $isOpen ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const SearchModalContent = styled.div`
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 400px;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
`;

const SearchModalHeader = styled.div`
  padding: 20px 20px 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const SearchModalTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #2D5F4F;
`;

const SearchModalCloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  color: #666;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #f0f0f0;
    color: #333;
  }
`;

const SearchModalBody = styled.div`
  padding: 0 20px 20px 20px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #E5E5E5;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s ease;
  margin-bottom: 16px;
  box-sizing: border-box;
  
  &:focus {
    border-color: #2D5F4F;
  }
  
  &::placeholder {
    color: #999;
  }
`;

const SearchSuggestions = styled.div`
  margin-bottom: 20px;
`;

const SearchSuggestionsTitle = styled.h4`
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
`;

const SearchSuggestionItem = styled.button`
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 20px;
  padding: 6px 12px;
  margin: 4px 8px 4px 0;
  font-size: 12px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #E8F4F0;
    border-color: #2D5F4F;
    color: #2D5F4F;
  }
`;

const SearchResults = styled.div`
  margin-bottom: 20px;
  max-height: 300px;
  overflow-y: auto;
`;

const SearchResultItem = styled.div`
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: #f8f9fa;
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const SearchResultTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
`;

const SearchResultMeta = styled.div`
  font-size: 12px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SearchModalActions = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 16px;
`;

const SearchModalButton = styled.button<{ $variant?: 'primary' | 'secondary'; $disabled?: boolean }>`
  flex: 1;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: ${({ $disabled }) => $disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  opacity: ${({ $disabled }) => $disabled ? 0.5 : 1};
  
  ${({ $variant = 'secondary', $disabled }) => 
    $variant === 'primary' 
      ? `
        background: #2D5F4F;
        color: white;
        border: 1px solid #2D5F4F;
        
        &:hover {
          background: ${$disabled ? '#2D5F4F' : '#1F4A3A'};
        }
      `
      : `
        background: white;
        color: #666;
        border: 1px solid #E5E5E5;
        
        &:hover {
          background: ${$disabled ? 'white' : '#f5f5f5'};
          border-color: ${$disabled ? '#E5E5E5' : '#d0d0d0'};
        }
      `
  }
`;

const NoSearchResults = styled.div`
  text-align: center;
  padding: 20px;
  color: #666;
  font-size: 14px;
`;

// Enhanced Search Modal Components
const EnhancedSearchModal = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: ${({ $isOpen }) => $isOpen ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const EnhancedSearchContent = styled.div`
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 400px;
  max-height: 85vh;
  overflow-y: auto;
  position: relative;
`;

const EnhancedSearchHeader = styled.div`
  padding: 20px 20px 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const EnhancedSearchTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #2D5F4F;
`;

const EnhancedSearchCloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  color: #666;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #f0f0f0;
    color: #333;
  }
`;

const EnhancedSearchBody = styled.div`
  padding: 0 20px 20px 20px;
`;

const MainSearchInput = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #E5E5E5;
  border-radius: 12px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s ease;
  margin-bottom: 16px;
  box-sizing: border-box;
  
  &:focus {
    border-color: #2D5F4F;
  }
  
  &::placeholder {
    color: #999;
  }
`;

const CategoryTabs = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  overflow-x: auto;
  padding-bottom: 4px;
`;

const CategoryTab = styled.button<{ $isActive: boolean }>`
  padding: 8px 16px;
  border: 1px solid ${({ $isActive }) => $isActive ? '#2D5F4F' : '#E5E5E5'};
  border-radius: 20px;
  background: ${({ $isActive }) => $isActive ? '#2D5F4F' : 'white'};
  color: ${({ $isActive }) => $isActive ? 'white' : '#666'};
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 4px;
  
  &:hover {
    border-color: #2D5F4F;
    background: ${({ $isActive }) => $isActive ? '#1F4A3A' : '#f8f9fa'};
  }
`;

const FilterChips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
  min-height: 20px;
`;

const FilterChip = styled.div`
  background: #e3f2fd;
  color: #1976d2;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #bbdefb;
  }
`;

const ChipRemove = styled.span`
  font-size: 14px;
  font-weight: bold;
  color: #1976d2;
  cursor: pointer;
  
  &:hover {
    color: #0d47a1;
  }
`;

const QuickSuggestions = styled.div`
  margin-bottom: 16px;
`;

const SuggestionsTitle = styled.h4`
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
`;

const SuggestionGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const SuggestionChip = styled.button`
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 16px;
  padding: 6px 12px;
  font-size: 12px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #e9ecef;
    border-color: #2D5F4F;
    color: #2D5F4F;
  }
`;

const AutocompleteDropdown = styled.div`
  background: white;
  border: 1px solid #E5E5E5;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 1001;
  max-height: 200px;
  overflow-y: auto;
`;

const AutocompleteItem = styled.div`
  padding: 12px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background-color 0.2s ease;
  
  &:hover {
    background: #f8f9fa;
  }
  
  &:not(:last-child) {
    border-bottom: 1px solid #f0f0f0;
  }
`;

const ItemIcon = styled.span`
  font-size: 14px;
`;

const ItemDetails = styled.div`
  flex: 1;
`;

const ItemName = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #333;
`;

const ItemMeta = styled.div`
  font-size: 12px;
  color: #666;
`;

const ResultsCount = styled.div`
  font-size: 12px;
  color: #666;
  margin-bottom: 12px;
  text-align: center;
`;

const EnhancedSearchActions = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 16px;
`;

const SearchActionButton = styled.button<{ $variant?: 'primary' | 'secondary'; $disabled?: boolean }>`
  flex: 1;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: ${({ $disabled }) => $disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  opacity: ${({ $disabled }) => $disabled ? 0.5 : 1};
  
  ${({ $variant = 'secondary', $disabled }) => 
    $variant === 'primary' 
      ? `
        background: #2D5F4F;
        color: white;
        border: 1px solid #2D5F4F;
        
        &:hover {
          background: ${$disabled ? '#2D5F4F' : '#1F4A3A'};
        }
      `
      : `
        background: white;
        color: #666;
        border: 1px solid #E5E5E5;
        
        &:hover {
          background: ${$disabled ? 'white' : '#f5f5f5'};
          border-color: ${$disabled ? '#E5E5E5' : '#d0d0d0'};
        }
      `
  }
`;

// Enhanced Profile Card Components with Compact Proportional Design
const CleanUserCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 14px;
  margin-bottom: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f0f0;
  transition: all 0.2s ease;
  
  &:hover {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
    transform: translateY(-1px);
  }
`;

const CleanUserCardHeader = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
  position: relative;
`;

const CleanUserAvatar = styled.div`
  width: 52px;
  height: 52px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 20px;
  position: relative;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 3px solid white;
  flex-shrink: 0;
`;

const CleanCardUserInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const CleanUserHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  width: 100%;
`;

const UserNameSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const TopRightInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  position: absolute;
  right: 0;
  top: 0;
`;

const CleanUserName = styled.h3`
  margin: 0;
  font-size: 17px;
  font-weight: bold;
  color: #333;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
`;

const CleanUserMeta = styled.p`
  margin: 0;
  font-size: 13px;
  color: #666;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
`;

const CompactRating = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 14px;
  color: #FFD700;
  font-weight: 500;
`;

const CompactLevelBadge = styled.div<{ $color: string }>`
  padding: 2px 8px;
  border-radius: 12px;
  background: ${({ $color }) => $color};
  color: white;
  font-size: 11px;
  font-weight: 600;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const CompactPersonalityBadge = styled.div<{ $temperament: 'NT' | 'NF' | 'SJ' | 'SP' }>`
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 500;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  
  ${({ $temperament }) => {
    switch ($temperament) {
      case 'NT':
        return `background: #E3F2FD; color: #1976D2;`;
      case 'NF':
        return `background: #F3E5F5; color: #7B1FA2;`;
      case 'SJ':
        return `background: #E8F5E8; color: #388E3C;`;
      case 'SP':
        return `background: #FFF3E0; color: #F57C00;`;
      default:
        return `background: #F5F5F5; color: #666;`;
    }
  }}
`;

const CleanInterestsContainer = styled.div`
  display: flex;
  flex-wrap: nowrap;
  gap: 4px;
  margin: 8px 0;
  overflow-x: auto;
  
  &::-webkit-scrollbar {
    display: none;
  }
`;

const CleanInterestTag = styled.span<{ $clickable?: boolean }>`
  background: #E3F2FD;
  color: #1976D2;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 500;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  cursor: ${({ $clickable }) => $clickable ? 'pointer' : 'default'};
  transition: all 0.2s ease;
  border: 1px solid #BBDEFB;
  white-space: nowrap;
  flex-shrink: 0;
  height: 22px;
  display: flex;
  align-items: center;
  
  ${({ $clickable }) => $clickable && `
    &:hover {
      background: #BBDEFB;
      transform: translateY(-1px);
      box-shadow: 0 2px 4px rgba(25, 118, 210, 0.2);
    }
  `}
`;

const CleanShortBio = styled.p`
  margin: 8px 0;
  font-size: 13px;
  color: #444;
  line-height: 1.4;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
`;

const CommunityAffiliationsSection = styled.div`
  margin: 8px 0 8px 0;
`;

const CommunityAffiliations = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 6px;
`;

const CommunityAffiliation = styled.div<{ $type: 'educational' | 'professional' | 'foundation' | 'alumni' }>`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 500;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  
  ${({ $type }) => {
    switch ($type) {
      case 'educational':
        return `background: #E3F2FD; color: #1976D2; border: 1px solid #BBDEFB;`;
      case 'professional':
        return `background: #E8F5E8; color: #388E3C; border: 1px solid #C8E6C9;`;
      case 'foundation':
        return `background: #F3E5F5; color: #7B1FA2; border: 1px solid #E1BEE7;`;
      case 'alumni':
        return `background: #FFF3E0; color: #F57C00; border: 1px solid #FFCC02;`;
      default:
        return `background: #F5F5F5; color: #666; border: 1px solid #E0E0E0;`;
    }
  }}
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
`;

const CommunityVerificationTick = styled.span`
  margin-left: 2px;
  color: #28A745;
  font-size: 10px;
  font-weight: bold;
  display: flex;
  align-items: center;
`;


const DualButtonContainer = styled.div`
  display: flex;
  gap: 6px;
  margin: 8px 0;
`;

const CleanTrustChain = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px;
  background: #FAFAFA;
  border: 1px solid #F0F0F0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 12px;
  color: #666;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  flex: 1;
  
  &:hover {
    background: #F5F5F5;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
`;

const LocationLogbookButton = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px;
  background: #E3F2FD;
  border: 1px solid #BBDEFB;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 12px;
  color: #1976D2;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  flex: 1;
  
  &:hover {
    background: #BBDEFB;
    box-shadow: 0 2px 4px rgba(25, 118, 210, 0.2);
  }
`;

// Location Logbook Modal Components
const LocationModalContent = styled.div`
  transition: all 0.3s ease;
`;

const FriendsGridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 12px;
  margin-top: 16px;
`;

const MiniFriendCard = styled.div`
  background: white;
  border: 1px solid #E5E5E5;
  border-radius: 8px;
  padding: 12px;
  transition: all 0.2s ease;
  cursor: pointer;
  
  &:hover {
    border-color: #2D5F4F;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
  }
`;

const MiniFriendHeader = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 8px;
`;

const MiniFriendAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 14px;
  flex-shrink: 0;
`;

const MiniFriendInfo = styled.div`
  flex: 1;
`;

const MiniFriendName = styled.h4`
  margin: 0 0 2px 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
`;

const MiniFriendProfession = styled.p`
  margin: 0 0 4px 0;
  font-size: 12px;
  color: #666;
`;

const MiniFriendConnection = styled.p`
  margin: 0;
  font-size: 11px;
  color: #999;
  font-style: italic;
`;

const MiniFriendActions = styled.div`
  display: flex;
  gap: 6px;
  margin-top: 8px;
`;

const MiniFriendButton = styled.button<{ $variant: 'primary' | 'secondary' }>`
  flex: 1;
  padding: 6px 12px;
  border: 1px solid ${({ $variant }) => $variant === 'primary' ? '#2D5F4F' : '#E5E5E5'};
  background: ${({ $variant }) => $variant === 'primary' ? '#2D5F4F' : 'white'};
  color: ${({ $variant }) => $variant === 'primary' ? 'white' : '#666'};
  border-radius: 6px;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ $variant }) => $variant === 'primary' ? '#1F4A3A' : '#F5F5F5'};
  }
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: #F5F5F5;
  border: 1px solid #E5E5E5;
  border-radius: 6px;
  color: #666;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 16px;
  
  &:hover {
    background: #E5E5E5;
  }
`;

// Messaging Modal Components
const MessagingModalOverlay = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: ${({ isOpen }) => isOpen ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 2500;
  padding: 20px;
`;

const MessagingModalContent = styled.div`
  background: white;
  border-radius: 20px;
  width: 100%;
  max-width: 400px;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const MessagingModalHeader = styled.div`
  background: linear-gradient(135deg, #2D5F4F, #4A90A4);
  padding: 20px;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const MessagingModalTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
`;

const MessagingModalCloseButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  color: white;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const ProfileContextBar = styled.div`
  padding: 12px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  font-size: 12px;
  color: #666;
`;

const ProfileContextTitle = styled.div`
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
`;

const MessagingBody = styled.div`
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  max-height: 400px;
`;

const UserInfoSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 12px;
  margin-bottom: 16px;
`;

const UserAvatarLarge = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
  font-weight: bold;
`;

const UserInfoDetails = styled.div`
  flex: 1;
`;

const UserNameLarge = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
`;

const UserMetaLarge = styled.div`
  font-size: 12px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 4px;
  
  &::before {
    content: '✓';
    color: #4CAF50;
    font-size: 10px;
  }
`;

const QuickActions = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
`;

const QuickActionButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  flex: 1;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  ${({ $variant = 'secondary' }) => 
    $variant === 'primary' 
      ? `
        background: #2D5F4F;
        color: white;
        border: 1px solid #2D5F4F;
        
        &:hover {
          background: #1F4A3A;
        }
      `
      : `
        background: white;
        color: #666;
        border: 1px solid #E5E5E5;
        
        &:hover {
          background: #f5f5f5;
          border-color: #d0d0d0;
        }
      `
  }
`;

const MessageTemplates = styled.div`
  margin-bottom: 16px;
`;

const TemplatesTitle = styled.h4`
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
`;

const TemplateButton = styled.button`
  background: #e8f4f0;
  color: #2D5F4F;
  border: 1px solid #2D5F4F22;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 12px;
  cursor: pointer;
  margin: 4px 8px 4px 0;
  transition: all 0.2s ease;
  
  &:hover {
    background: #d4f4e9;
    border-color: #2D5F4F44;
  }
`;

const MessageInput = styled.textarea`
  width: 100%;
  min-height: 80px;
  padding: 12px;
  border: 2px solid #e5e5e5;
  border-radius: 8px;
  font-size: 14px;
  resize: vertical;
  outline: none;
  transition: border-color 0.2s ease;
  margin-bottom: 16px;
  box-sizing: border-box;
  
  &:focus {
    border-color: #2D5F4F;
  }
  
  &::placeholder {
    color: #999;
  }
`;

const SendMessageButton = styled.button<{ $disabled?: boolean }>`
  background: ${({ $disabled }) => $disabled ? '#cccccc' : '#2D5F4F'};
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: ${({ $disabled }) => $disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ $disabled }) => $disabled ? '#cccccc' : '#1F4A3A'};
  }
`;

const ProfileActionButtons = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;
`;

const SendMessageActionButton = styled.button`
  flex: 1;
  padding: 10px 16px;
  border: 1px solid #2D5F4F;
  background: #2D5F4F;
  color: white;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  
  &:hover {
    background: #1F4A3A;
    border-color: #1F4A3A;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(45, 95, 79, 0.3);
  }
`;

const ViewProfileActionButton = styled.button`
  flex: 1;
  padding: 10px 16px;
  border: 1px solid #E5E5E5;
  background: white;
  color: #666;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  
  &:hover {
    background: #f5f5f5;
    border-color: #d0d0d0;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const TrustIcon = styled.span`
  color: #4A9B8E;
  font-size: 12px;
`;

const TrustText = styled.span`
  font-size: 11px;
  color: #666;
  font-weight: 400;
`;

const TrustArrow = styled.span`
  font-size: 10px;
  color: #999;
  margin-left: auto;
`;

const CleanServicesSection = styled.div`
  margin: 8px 0;
`;

const ServicesLabel = styled.div`
  font-size: 9px;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 500;
  margin-bottom: 6px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
`;

const CleanServicesRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
`;

const CleanServiceTag = styled.div<{ $borderColor: string }>`
  background: white;
  border-left: 3px solid ${({ $borderColor }) => $borderColor};
  padding: 3px 6px;
  border-radius: 4px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
  font-size: 9px;
  font-weight: 500;
  color: #333;
  white-space: nowrap;
  border-top: 1px solid #F0F0F0;
  border-right: 1px solid #F0F0F0;
  border-bottom: 1px solid #F0F0F0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
`;

const CleanActionButton = styled.button`
  width: 100%;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  background: #28A745;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  margin-top: 12px;
  
  &:hover {
    background: #218838;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
  }
`;

// Community Badges and Affiliations for Profile Cards (keeping for compatibility)
const CommunityBadges = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 8px 0;
`;

const CommunityBadge = styled.div<{ $type: 'educational' | 'professional' | 'regional' | 'alumni' | 'foundation' }>`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  ${({ $type }) => {
    switch ($type) {
      case 'educational':
        return `
          background: #e3f2fd;
          color: #1976d2;
          border: 1px solid #bbdefb;
        `;
      case 'professional':
        return `
          background: #e8f5e8;
          color: #388e3c;
          border: 1px solid #c8e6c9;
        `;
      case 'foundation':
        return `
          background: #f3e5f5;
          color: #7b1fa2;
          border: 1px solid #e1bee7;
        `;
      default:
        return `
          background: #f5f5f5;
          color: #666;
          border: 1px solid #e0e0e0;
        `;
    }
  }}
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
`;

const BadgeIcon = styled.span`
  font-size: 8px;
`;

const ProfessionalAffiliation = styled.div`
  font-size: 10px;
  color: #666;
  margin: 4px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const AffiliationItem = styled.span`
  display: flex;
  align-items: center;
  gap: 3px;
`;

const VerificationIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  color: #2D5F4F;
  font-weight: 500;
  margin-top: 4px;
`;

const SearchContainer = styled.div`
  margin-bottom: 20px;
`;

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  background: white;
  border-radius: 12px;
  padding: 12px 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`;


const FilterRow = styled.div`
  display: flex;
  gap: 12px;
`;

const FilterButton = styled.button<{ hasFilter?: boolean }>`
  flex: 1;
  padding: 12px 16px;
  background: ${({ hasFilter }) => hasFilter ? '#2D5F4F' : 'white'};
  border: 1px solid #E5E5E5;
  border-radius: 8px;
  font-size: 14px;
  color: ${({ hasFilter }) => hasFilter ? 'white' : '#333'};
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${({ hasFilter }) => hasFilter ? '#1F4A3A' : '#f5f5f5'};
  }
`;

// Filter Modal Styles
const FilterModalOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: ${({ $isOpen }) => $isOpen ? 'flex' : 'none'};
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
  align-items: center;
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
  width: 16px;
  height: 16px;
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

const UserCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`;

const UserCardHeader = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 8px;
`;

const UserAvatar = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 18px;
  position: relative;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const VerifiedBadge = styled.div`
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 20px;
  height: 20px;
  background: #4CAF50;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
  border: 2px solid white;
  
  &::after {
    content: '✓';
  }
`;

const CardUserInfo = styled.div`
  flex: 1;
`;

const UserHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 4px;
`;

const UserName = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: bold;
  color: #333;
`;

const Rating = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: #666;
`;

const StarIcon = styled.span`
  color: #FFD700;
`;

const UserMeta = styled.p`
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #666;
`;

// New: Interests Tags Section
const InterestsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 8px 0;
`;

const InterestTag = styled.span`
  background: #F5F5F5;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  color: #666;
  font-weight: 500;
`;

// New: Short Bio Section
const ShortBio = styled.p`
  margin: 8px 0;
  font-size: 13px;
  color: #333;
  line-height: 1.4;
  max-width: 100%;
  overflow-wrap: break-word;
`;

// Elegant Bottom Section Design
const ElegantBottomSection = styled.div`
  background: #FCFCFC;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #F0F0F0;
  margin-bottom: 12px;
`;

// Services Section
const ServicesSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;


const ElegantServiceTag = styled.div<{ borderColor: string }>`
  background: white;
  border-left: 4px solid ${({ borderColor }) => borderColor};
  padding: 6px 10px;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  font-size: 11px;
  font-weight: 500;
  color: #333;
  white-space: nowrap;
  border-top: 1px solid #F0F0F0;
  border-right: 1px solid #F0F0F0;
  border-bottom: 1px solid #F0F0F0;
`;


// Elegant Trust Chain Indicator
const ElegantTrustChain = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 12px;
  background: #FAFAFA;
  border: 1px solid #E8E8E8;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 8px;
  
  &:hover {
    background: #F5F5F5;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
`;

const MutualFriend = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #666;
`;

const FriendAvatar = styled.div`
  width: 24px;
  height: 24px;
  background: #2D5F4F;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 10px;
  font-weight: bold;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
`;

const ActionButton = styled.button`
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 8px;
  background-color: #2D5F4F;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #1F4A3A;
  }
`;

// Modal Styles
const DetailedProfileModal = styled.div<{ show: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: ${({ show }) => show ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const DetailedProfileContent = styled.div`
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 400px;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
  
  /* Smooth scrolling */
  scroll-behavior: smooth;
  
  /* Hide scrollbar but keep functionality */
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const DetailedProfileHeader = styled.div`
  padding: 24px;
  border-bottom: 1px solid #F0F0F0;
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: none;
  border: none;
  font-size: 24px;
  color: #666;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: #333;
  }
`;

const DetailedUserInfo = styled.div`
  text-align: center;
  margin-bottom: 16px;
`;

const DetailedUserAvatar = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 24px;
  margin: 0 auto 12px;
  position: relative;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const DetailedUserName = styled.h2`
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: bold;
  color: #333;
`;

const DetailedUserMeta = styled.div`
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
`;

const LifeSeason = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 12px;
  color: #2D5F4F;
  font-style: italic;
  margin-bottom: 12px;
`;

const DetailedUserBio = styled.p`
  font-size: 14px;
  color: #333;
  line-height: 1.5;
  text-align: left;
  margin-bottom: 12px;
`;

const CommunityMessage = styled.div`
  background: rgba(45, 95, 79, 0.1);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
`;

const CommunityText = styled.p`
  margin: 0;
  font-size: 13px;
  color: #2D5F4F;
  font-style: italic;
  text-align: center;
`;

// Social Media Section (Subtle & Clean)
const SocialSection = styled.div`
  margin: 16px 0;
  padding: 0 4px;
`;

const SocialGrid = styled.div`
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: wrap;
`;

const SocialChip = styled.a`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #f8f9fa;
  border-radius: 20px;
  text-decoration: none;
  font-size: 12px;
  color: #666;
  border: 1px solid #e9ecef;
  transition: all 0.2s ease;
  
  &:hover {
    background: #e9ecef;
    transform: translateY(-1px);
  }
`;

// Category-Based Offerings Section
const OfferingsSection = styled.div`
  margin: 16px 0;
`;

const OfferingsTitle = styled.h4`
  font-size: 14px;
  color: #495057;
  margin: 0 0 12px 0;
  text-align: center;
  font-weight: 500;
`;

const OfferingsGrid = styled.div`
  display: grid;
  gap: 10px;
`;

const OfferingCard = styled.div<{ $category: string }>`
  background: #f8f9fa;
  border-radius: 10px;
  padding: 12px;
  border-left: 4px solid ${({ $category }) => getCategoryColor($category)};
  position: relative;
`;

const OfferingHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
`;

const CategoryTag = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 500;
  color: #495057;
`;

const OfferingPrice = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: #007bff;
`;

const OfferingTitle = styled.h5`
  font-size: 13px;
  font-weight: 600;
  color: #212529;
  margin: 0 0 4px 0;
`;

const OfferingDesc = styled.p`
  font-size: 11px;
  color: #6c757d;
  margin: 0 0 8px 0;
  line-height: 1.3;
`;

const BookButton = styled.button`
  background: #007bff;
  color: white;
  border: none;
  border-radius: 16px;
  padding: 4px 12px;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #0056b3;
    transform: translateY(-1px);
  }
`;

const MainOfferingsSection = styled.div`
  padding: 24px;
`;

const MainOfferingsTitle = styled.h3`
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: bold;
  color: #333;
`;

const OfferingCategory = styled.span`
  font-size: 12px;
  color: #2D5F4F;
  background: rgba(45, 95, 79, 0.1);
  padding: 4px 8px;
  border-radius: 6px;
  font-weight: 600;
`;

const OfferingDescription = styled.p`
  margin: 0 0 16px 0;
  font-size: 14px;
  color: #666;
  line-height: 1.4;
`;

const OfferingActions = styled.div`
  display: flex;
  gap: 8px;
`;

const ChatButton = styled.button`
  flex: 1;
  padding: 10px;
  border: 1px solid #2D5F4F;
  border-radius: 8px;
  background: white;
  color: #2D5F4F;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  
  &:hover {
    background: #2D5F4F;
    color: white;
  }
`;



// Top service category buttons data (matching BerseConnect design)
const topServiceButtons = [
  { id: 'local-guides', name: 'Local Guides', icon: '🗺️', color: '#1976D2' },
  { id: 'homestay', name: 'Homestay', icon: '🏠', color: '#D32F2F' },
  { id: 'freelance', name: 'Freelance', icon: '💼', color: '#7B1FA2' },
  { id: 'marketplace', name: 'Marketplace', icon: '⚙️', color: '#F57C00' },
  { id: 'open-connect', name: 'Open to Connect', icon: '🤝', color: '#388E3C' }
];


// Category Color Function
const getCategoryColor = (category: string) => {
  const colors = {
    'local-guides': '#28a745',
    'homestay': '#ffc107', 
    'freelance': '#007bff',
    'marketplace': '#dc3545',
    'open-to-connect': '#6f42c1'
  };
  return colors[category] || '#6c757d';
};

export const BerseMatchScreen: React.FC = () => {
  const location = useLocation();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [showDetailedProfile, setShowDetailedProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showTrustFeedback, setShowTrustFeedback] = useState(false);
  const [selectedTrustUser, setSelectedTrustUser] = useState<UserProfile | null>(null);
  const [showLocationLogbook, setShowLocationLogbook] = useState(false);
  const [selectedLocationUser, setSelectedLocationUser] = useState<UserProfile | null>(null);
  const [showLocationFriends, setShowLocationFriends] = useState(false);
  const [selectedLocationCity, setSelectedLocationCity] = useState<string>('');
  const [locationFriends, setLocationFriends] = useState<UserProfile[]>([]);
  const { user } = useAuth();
  const { openMessagingModal, notificationBadge } = useMessaging();
  
  // New filter states from BerseConnect
  const [selectedCountry, setSelectedCountry] = useState<string>('Malaysia');
  const [selectedCities, setSelectedCities] = useState<string[]>(['All Cities']);
  
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedTopServiceCategory, setSelectedTopServiceCategory] = useState<string>('');
  const [countryModalOpen, setCountryModalOpen] = useState(false);
  const [cityModalOpen, setCityModalOpen] = useState(false);
  const [interestsModalOpen, setInterestsModalOpen] = useState(false);
  const [activeSearchTerm, setActiveSearchTerm] = useState('');
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);

  // Enhanced Search State
  const [enhancedSearchOpen, setEnhancedSearchOpen] = useState(false);
  const [mainSearchQuery, setMainSearchQuery] = useState('');
  const [activeSearchCategory, setActiveSearchCategory] = useState<'all' | 'interests' | 'communities' | 'companies' | 'skills' | 'personality'>('all');
  const [selectedSearchInterests, setSelectedSearchInterests] = useState<string[]>([]);
  const [selectedSearchCommunities, setSelectedSearchCommunities] = useState<string[]>([]);
  const [selectedSearchCompanies, setSelectedSearchCompanies] = useState<string[]>([]);
  const [selectedSearchSkills, setSelectedSearchSkills] = useState<string[]>([]);
  const [selectedSearchPersonalities, setSelectedSearchPersonalities] = useState<string[]>([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [autocompleteResults, setAutocompleteResults] = useState<any[]>([]);
  const [enhancedSearchResults, setEnhancedSearchResults] = useState<UserProfile[]>([]);

  // Check if we're coming from forum with a selected profile
  const forumSelectedProfile = location.state?.selectedProfile as UserProfile;
  
  // Filter handlers from BerseConnect
  const handleCountryFilter = (country: string) => {
    setSelectedCountry(country);
    if (country !== 'All Countries') {
      setSelectedCities(['All Cities']); // Reset cities when country changes
    }
  };

  const handleCityFilter = (cities: string[]) => {
    setSelectedCities(cities);
  };

  const handleInterestsFilter = (interests: string[]) => {
    setSelectedInterests(interests);
  };
  
  const handleInterestToggle = (interestId: string) => {
    setSelectedInterests(prev => {
      if (prev.includes(interestId)) {
        return prev.filter(id => id !== interestId);
      } else {
        return [...prev, interestId];
      }
    });
  };

  const handleClearInterests = () => {
    setSelectedInterests([]);
  };

  const handleApplyInterests = () => {
    setInterestsModalOpen(false);
  };

  // Search handlers
  const handleSearchInputChange = (value: string) => {
    setSearchQuery(value);
    
    if (value.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    // Real-time search through users
    const filtered = users.filter(user => {
      const searchTerm = value.toLowerCase();
      return (
        user.fullName.toLowerCase().includes(searchTerm) ||
        user.bio.toLowerCase().includes(searchTerm) ||
        user.profession.toLowerCase().includes(searchTerm) ||
        user.interests.some(interest => interest.toLowerCase().includes(searchTerm))
      );
    });
    
    setSearchResults(filtered);
  };

  const handleSearchSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    handleSearchInputChange(suggestion);
  };

  const handleApplySearch = () => {
    setActiveSearchTerm(searchQuery);
    setSearchModalOpen(false);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setActiveSearchTerm('');
    setSearchModalOpen(false);
  };

  const handleSearchResultClick = (user: UserProfile) => {
    setSearchModalOpen(false);
    setSelectedUser(user);
    setShowDetailedProfile(true);
  };

  const handleCloseSearchModal = () => {
    setSearchModalOpen(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  // Enhanced Search Handlers
  const handleOpenEnhancedSearch = () => {
    setEnhancedSearchOpen(true);
    setSearchModalOpen(false); // Close old modal if open
  };

  const handleCloseEnhancedSearch = () => {
    setEnhancedSearchOpen(false);
    setMainSearchQuery('');
    setAutocompleteResults([]);
    setShowAutocomplete(false);
  };

  const handleMainSearchInputChange = (value: string) => {
    setMainSearchQuery(value);
    
    if (value.trim().length < 2) {
      setAutocompleteResults([]);
      setShowAutocomplete(false);
      return;
    }

    // Generate autocomplete results based on active category
    let results: any[] = [];
    const searchTerm = value.toLowerCase();

    switch (activeSearchCategory) {
      case 'interests':
        results = interestOptions
          .filter(option => option.name.toLowerCase().includes(searchTerm))
          .slice(0, 5)
          .map(option => ({ ...option, type: 'interest' }));
        break;
      case 'communities':
        results = communityOptions
          .filter(option => option.name.toLowerCase().includes(searchTerm))
          .slice(0, 5)
          .map(option => ({ ...option, type: 'community' }));
        break;
      case 'companies':
        results = companyOptions
          .filter(option => option.name.toLowerCase().includes(searchTerm))
          .slice(0, 5)
          .map(option => ({ ...option, type: 'company' }));
        break;
      case 'skills':
        results = skillOptions
          .filter(option => option.name.toLowerCase().includes(searchTerm))
          .slice(0, 5)
          .map(option => ({ ...option, type: 'skill' }));
        break;
      case 'personality':
        results = personalityOptions
          .filter(option => 
            option.name.toLowerCase().includes(searchTerm) ||
            option.type.toLowerCase().includes(searchTerm) ||
            option.variants.some(variant => variant.toLowerCase().includes(searchTerm))
          )
          .slice(0, 5)
          .map(option => ({ ...option, type: 'personality' }));
        break;
      default: // 'all'
        const allResults = [
          ...interestOptions.filter(o => o.name.toLowerCase().includes(searchTerm)).slice(0, 1).map(o => ({ ...o, type: 'interest' })),
          ...communityOptions.filter(o => o.name.toLowerCase().includes(searchTerm)).slice(0, 1).map(o => ({ ...o, type: 'community' })),
          ...companyOptions.filter(o => o.name.toLowerCase().includes(searchTerm)).slice(0, 1).map(o => ({ ...o, type: 'company' })),
          ...skillOptions.filter(o => o.name.toLowerCase().includes(searchTerm)).slice(0, 1).map(o => ({ ...o, type: 'skill' })),
          ...personalityOptions.filter(o => 
            o.name.toLowerCase().includes(searchTerm) || 
            o.type.toLowerCase().includes(searchTerm) ||
            o.variants.some(variant => variant.toLowerCase().includes(searchTerm))
          ).slice(0, 1).map(o => ({ ...o, type: 'personality' }))
        ];
        results = allResults.slice(0, 5);
        break;
    }

    setAutocompleteResults(results);
    setShowAutocomplete(results.length > 0);
  };

  const handleCategoryTabClick = (categoryId: typeof activeSearchCategory) => {
    setActiveSearchCategory(categoryId);
    setMainSearchQuery('');
    setAutocompleteResults([]);
    setShowAutocomplete(false);
  };

  const handleAutocompleteSelect = (item: any) => {
    switch (item.type) {
      case 'interest':
        if (!selectedSearchInterests.includes(item.id)) {
          setSelectedSearchInterests(prev => [...prev, item.id]);
        }
        break;
      case 'community':
        if (!selectedSearchCommunities.includes(item.id)) {
          setSelectedSearchCommunities(prev => [...prev, item.id]);
        }
        break;
      case 'company':
        if (!selectedSearchCompanies.includes(item.id)) {
          setSelectedSearchCompanies(prev => [...prev, item.id]);
        }
        break;
      case 'skill':
        if (!selectedSearchSkills.includes(item.id)) {
          setSelectedSearchSkills(prev => [...prev, item.id]);
        }
        break;
      case 'personality':
        if (!selectedSearchPersonalities.includes(item.id)) {
          setSelectedSearchPersonalities(prev => [...prev, item.id]);
        }
        break;
    }
    setMainSearchQuery('');
    setAutocompleteResults([]);
    setShowAutocomplete(false);
  };

  const removeSearchFilter = (type: string, id: string) => {
    switch (type) {
      case 'interest':
        setSelectedSearchInterests(prev => prev.filter(item => item !== id));
        break;
      case 'community':
        setSelectedSearchCommunities(prev => prev.filter(item => item !== id));
        break;
      case 'company':
        setSelectedSearchCompanies(prev => prev.filter(item => item !== id));
        break;
      case 'skill':
        setSelectedSearchSkills(prev => prev.filter(item => item !== id));
        break;
      case 'personality':
        setSelectedSearchPersonalities(prev => prev.filter(item => item !== id));
        break;
    }
  };

  const handleApplyEnhancedSearch = () => {
    // Perform enhanced search with all selected filters
    performEnhancedSearch();
    setEnhancedSearchOpen(false);
  };

  const handleClearEnhancedSearch = () => {
    setMainSearchQuery('');
    setSelectedSearchInterests([]);
    setSelectedSearchCommunities([]);
    setSelectedSearchCompanies([]);
    setSelectedSearchSkills([]);
    setSelectedSearchPersonalities([]);
    setAutocompleteResults([]);
    setShowAutocomplete(false);
    setEnhancedSearchResults([]);
  };

  const performEnhancedSearch = () => {
    // Filter users based on enhanced search criteria
    let filtered = users;

    // Filter by interests
    if (selectedSearchInterests.length > 0) {
      filtered = filtered.filter(user => 
        selectedSearchInterests.some(interest => 
          user.interests.some(userInterest => 
            userInterest.toLowerCase().includes(interest.toLowerCase()) ||
            interest.toLowerCase().includes(userInterest.toLowerCase())
          )
        )
      );
    }

    // Filter by main search query (name, bio, profession)
    if (mainSearchQuery.trim()) {
      const searchTerm = mainSearchQuery.toLowerCase();
      filtered = filtered.filter(user =>
        user.fullName.toLowerCase().includes(searchTerm) ||
        user.bio.toLowerCase().includes(searchTerm) ||
        user.profession.toLowerCase().includes(searchTerm)
      );
    }

    setEnhancedSearchResults(filtered);
    setActiveSearchTerm(mainSearchQuery || `${selectedSearchInterests.length + selectedSearchCommunities.length + selectedSearchCompanies.length + selectedSearchSkills.length + selectedSearchPersonalities.length} filters`);
  };

  // Quick search suggestions
  const getQuickSuggestions = () => {
    switch (activeSearchCategory) {
      case 'interests':
        return interestOptions.filter(o => o.popularity > 85).slice(0, 6);
      case 'communities':
        return communityOptions.filter(o => o.verified).slice(0, 4);
      case 'companies':
        return companyOptions.filter(o => o.verified).slice(0, 4);
      case 'skills':
        return skillOptions.slice(0, 6);
      case 'personality':
        return personalityOptions.slice(0, 8);
      default:
        return [
          { id: 'photography', name: 'Photography enthusiasts', type: 'suggestion' },
          { id: 'nama-network', name: 'NAMA Foundation network', type: 'suggestion' },
          { id: 'finance-pros', name: 'Finance professionals', type: 'suggestion' },
          { id: 'turkish-students', name: 'Malaysian students in Turkey', type: 'suggestion' }
        ];
    }
  };

  // Helper functions for enhanced profile features
  const getUserLevel = (user: UserProfile): UserLevel => {
    const userPoints = user.points || 0;
    return userLevels.reverse().find(level => userPoints >= level.minPoints) || userLevels[0];
  };

  const getUserPersonalityType = (user: UserProfile): string | null => {
    // Mock personality assignment based on user characteristics
    const personalityTypes = ['INFP-T', 'ENFJ-A', 'INTJ-T', 'ESFP-A', 'ISTJ-T', 'ENTP-A'];
    const userSpecificType = personalityTypes[parseInt(user.id) % personalityTypes.length];
    return userSpecificType;
  };

  const getPersonalityTemperament = (personalityType: string): 'NT' | 'NF' | 'SJ' | 'SP' => {
    const mbtiCode = personalityType.substring(0, 4);
    if (['INTJ', 'INTP', 'ENTJ', 'ENTP'].includes(mbtiCode)) return 'NT';
    if (['INFJ', 'INFP', 'ENFJ', 'ENFP'].includes(mbtiCode)) return 'NF';
    if (['ISTJ', 'ISFJ', 'ESTJ', 'ESFJ'].includes(mbtiCode)) return 'SJ';
    return 'SP';
  };

  const getUserAchievements = (user: UserProfile): AchievementBadge[] => {
    // Mock achievement assignment based on user profile
    const achievements = [];
    if (user.isVerified) achievements.push(achievementBadges.find(b => b.id === 'verified-expert')!);
    if (user.level >= 5) achievements.push(achievementBadges.find(b => b.id === 'community-builder')!);
    if ((user.level * 1.2 + 3.5) >= 6.0) achievements.push(achievementBadges.find(b => b.id === 'trusted-member')!);
    return achievements.slice(0, 3); // Max 3 badges
  };

  const getUserUniversalVerifications = (user: UserProfile): VerificationItem[] => {
    // Mock universal verification system
    const verifications: VerificationItem[] = [];
    
    if (user.profession.includes('Architect') || user.profession.includes('Engineer')) {
      verifications.push({
        id: 'nama-foundation',
        type: 'community',
        verifiedBy: 'NAMA Foundation',
        verificationDate: '2024-01-15',
        isActive: true
      });
    }
    
    if (user.age >= 22 && user.age <= 28) {
      verifications.push({
        id: 'masat-turkey',
        type: 'community',
        verifiedBy: 'MASAT Turkey',
        verificationDate: '2024-02-20',
        isActive: true
      });
    }
    
    if (user.isVerified) {
      verifications.push({
        id: 'university-verification',
        type: 'educational',
        verifiedBy: 'University of Malaya',
        verificationDate: '2023-09-10',
        isActive: true
      });
    }
    
    // Add some variety based on profession
    if (user.profession.includes('Doctor') || user.profession.includes('Medical')) {
      verifications.push({
        id: 'medical-council',
        type: 'professional',
        verifiedBy: 'Malaysian Medical Council',
        verificationDate: '2023-11-05',
        isActive: true
      });
    }
    
    return verifications.slice(0, 4); // Max 4 verifications for clean display
  };

  const getEnhancedCommunityAffiliations = (user: UserProfile): Array<{id: string, name: string, type: 'educational' | 'professional' | 'foundation' | 'alumni', icon: string}> => {
    const affiliations = [];
    
    if (user.profession.includes('Architect') || user.profession.includes('Engineer')) {
      affiliations.push({ id: 'nama', name: 'NAMA Foundation', type: 'foundation' as const, icon: '🏛️' });
    }
    
    if (user.age >= 22 && user.age <= 28) {
      affiliations.push({ id: 'masat', name: 'MASAT Turkey', type: 'educational' as const, icon: '🎓' });
    }
    
    if (user.profession.includes('Business') || user.profession.includes('Consultant')) {
      affiliations.push({ id: 'ptptn', name: 'PTPTN Alumni', type: 'alumni' as const, icon: '🎓' });
    }
    
    return affiliations.slice(0, 3); // Max 3 affiliations
  };

  // Enhanced profile card helpers
  const getUserCommunities = (user: UserProfile): { id: string; name: string; type: 'educational' | 'professional' | 'foundation' }[] => {
    // Mock community data based on user profile
    const communities = [];
    if (user.profession.includes('Architect') || user.profession.includes('Engineer')) {
      communities.push({ id: 'professional', name: 'NAMA Foundation', type: 'foundation' });
    }
    if (user.age >= 22 && user.age <= 28) {
      communities.push({ id: 'education', name: 'MASAT Turkey', type: 'educational' });
    }
    return communities.slice(0, 2); // Max 2 badges
  };

  const getUserProfessionalAffiliations = (user: UserProfile): string[] => {
    // Mock professional affiliations
    const affiliations = [];
    if (user.profession.includes('Consultant') || user.profession.includes('Engineer')) {
      affiliations.push('📍 NAMA Foundation');
    }
    if (user.age >= 22 && user.age <= 28) {
      affiliations.push('🎓 MASAT Turkey');
    }
    return affiliations.slice(0, 2); // Max 2 affiliations
  };

  const getUserVerificationStatus = (user: UserProfile): string | null => {
    if (user.isVerified) {
      return 'Verified by NAMA Foundation';
    }
    return null;
  };

  const getCommunityVerificationStatus = (user: UserProfile, communityId: string): boolean => {
    // Check if this community has verified this user
    if (communityId === 'nama-foundation' && (user.profession.includes('Architect') || user.profession.includes('Engineer'))) {
      return true;
    }
    if (communityId === 'masat-turkey' && user.age >= 22 && user.age <= 28) {
      return true;
    }
    if (communityId === 'university-of-malaya' && user.isVerified) {
      return true;
    }
    if (communityId === 'medical-council' && (user.profession.includes('Doctor') || user.profession.includes('Medical'))) {
      return true;
    }
    return false;
  };

  // Location logbook helper functions
  const getUserTravelHistory = (user: UserProfile) => {
    const travelHistories = {
      // Users from Malaysia traveling abroad
      '1': [ // Amina Hadzic
        { country: '🇹🇷 Turkey', city: 'Istanbul', duration: 'Mar 2023 - Jun 2023 (3 months)', friends: 3 },
        { country: '🇩🇪 Germany', city: 'Berlin', duration: 'Aug 2022 - Dec 2022 (4 months)', friends: 7 },
        { country: '🇮🇩 Indonesia', city: 'Jakarta', duration: 'Jan 2022 - Feb 2022 (1 month)', friends: 2 }
      ],
      '2': [ // Hafiz Rahman  
        { country: '🇹🇷 Turkey', city: 'Istanbul', duration: 'Sep 2023 - Present (5 months)', friends: 4 },
        { country: '🇸🇬 Singapore', city: 'Singapore', duration: 'Jul 2022 - Aug 2022 (2 months)', friends: 5 },
        { country: '🇹🇭 Thailand', city: 'Bangkok', duration: 'Dec 2021 - Jan 2022 (1 month)', friends: 3 }
      ],
      '13': [ // Omar Hassan
        { country: '🇸🇦 Saudi Arabia', city: 'Mecca', duration: 'Nov 2023 - Dec 2023 (1 month)', friends: 8 },
        { country: '🇪🇬 Egypt', city: 'Cairo', duration: 'Jun 2023 - Aug 2023 (2 months)', friends: 6 },
        { country: '🇮🇩 Indonesia', city: 'Jakarta', duration: 'Mar 2022 - Apr 2022 (1 month)', friends: 4 }
      ],
      '18': [ // Chen Wei Ming
        { country: '🇹🇭 Thailand', city: 'Bangkok', duration: 'Oct 2023 - Nov 2023 (1 month)', friends: 5 },
        { country: '🇸🇬 Singapore', city: 'Singapore', duration: 'Jul 2023 - Sep 2023 (2 months)', friends: 12 },
        { country: '🇭🇰 Hong Kong', city: 'Hong Kong', duration: 'Jan 2023 - Feb 2023 (1 month)', friends: 8 }
      ]
    };
    
    return travelHistories[user.id] || [
      { country: '🇸🇬 Singapore', city: 'Singapore', duration: 'Jul 2023 - Aug 2023 (1 month)', friends: 3 },
      { country: '🇹🇭 Thailand', city: 'Bangkok', duration: 'Dec 2022 - Jan 2023 (1 month)', friends: 2 }
    ];
  };

  const getUserResidenceInfo = (user: UserProfile) => {
    const residenceData = {
      '1': { originalCountry: '🇧🇦 Bosnia', since: '2019' }, // Amina from Bosnia
      '2': { originalCountry: '🇮🇩 Indonesia', since: '2021' }, // Hafiz from Indonesia  
      '3': { originalCountry: '🇲🇦 Morocco', since: '2015' }, // Marwan from Morocco
      '4': { originalCountry: '🇲🇾 Malaysia', since: '2020' }, // Ali from Malaysia to Yemen
      '13': { originalCountry: '🇲🇾 Malaysia', since: 'Born here' }, // Omar Malaysian
      '18': { originalCountry: '🇨🇳 China', since: '2018' }, // Chen from China
    };
    
    return residenceData[user.id] || { originalCountry: '🇲🇾 Malaysia', since: 'Born here' };
  };

  const getTravelFriends = (user: UserProfile, city: string): UserProfile[] => {
    // Map cities to actual BerseMatch profiles with connection context
    const friendsData = {
      'Istanbul': [
        { ...userProfiles.find(p => p.id === '13')!, connection: 'Met through MASAT Turkey community' }, // Omar Hassan - Cultural Heritage Guide
        { ...userProfiles.find(p => p.id === '14')!, connection: 'Adventure travel companion' }, // Sara Wong - Adventure Guide  
        { ...userProfiles.find(p => p.id === '21')!, connection: 'Tech meetup connection' }  // Daniel Lee - Developer
      ],
      'Berlin': [
        { ...userProfiles.find(p => p.id === '18')!, connection: 'Business networking event' }, // Chen Wei Ming - Homestay Specialist
        { ...userProfiles.find(p => p.id === '23')!, connection: 'Professional consulting network' }, // Marcus Tan - Business Consultant
        { ...userProfiles.find(p => p.id === '25')!, connection: 'Tech support community' }, // Hafiz Rahman - IT Support
        { ...userProfiles.find(p => p.id === '28')!, connection: 'Fitness community center' }, // Lily Chan - Personal Trainer
        { ...userProfiles.find(p => p.id === '30')!, connection: 'Marketing professionals meetup' }, // Michelle Goh - Networker
        { ...userProfiles.find(p => p.id === '31')!, connection: 'Entrepreneurship workshop' }, // Zain Abdullah - Community Builder
        { ...userProfiles.find(p => p.id === '32')!, connection: 'Environmental advocacy group' }  // Jenny Lim - Social Impact
      ],
      'Jakarta': [
        { ...userProfiles.find(p => p.id === '17')!, connection: 'Cultural homestay experience' }, // Fatimah Ibrahim - Homestay Host
        { ...userProfiles.find(p => p.id === '22')!, connection: 'Creative arts workshop' }  // Nurul Aisyah - Designer
      ],
      'Singapore': [
        { ...userProfiles.find(p => p.id === '18')!, connection: 'Business traveler community' }, // Chen Wei Ming (also travels to Singapore)
        { ...userProfiles.find(p => p.id === '21')!, connection: 'Developer community' }, // Daniel Lee
        { ...userProfiles.find(p => p.id === '30')!, connection: 'Professional networking' }  // Michelle Goh
      ],
      'Bangkok': [
        { ...userProfiles.find(p => p.id === '14')!, connection: 'Adventure travel group' }, // Sara Wong
        { ...userProfiles.find(p => p.id === '29')!, connection: 'Student cultural exchange' }  // Arif Hakim
      ],
      'Mecca': [
        { ...userProfiles.find(p => p.id === '2')!, connection: 'Hajj pilgrimage group' }, // Hafiz Rahman (original)
        { ...userProfiles.find(p => p.id === '31')!, connection: 'Islamic community network' }  // Zain Abdullah
      ],
      'Cairo': [
        { ...userProfiles.find(p => p.id === '7')!, connection: 'Medical studies program' }, // Fatima Al-Zahra (original)
        { ...userProfiles.find(p => p.id === '29')!, connection: 'International relations studies' }  // Arif Hakim
      ]
    };
    
    const cityFriends = friendsData[city] || [
      { ...userProfiles.find(p => p.id === '29')!, connection: 'Cultural exchange program' }, // Arif Hakim - default
      { ...userProfiles.find(p => p.id === '32')!, connection: 'Travel companion' }  // Jenny Lim - default
    ];
    
    return cityFriends.filter(friend => friend && friend.id !== user.id); // Remove self and null entries
  };

  // Helper functions for generating community messages and managing state

  const getCommunityMessage = (user: UserProfile) => {
    const messages = [
      "Happy to help fellow community members! 🤝",
      "Let's connect and explore together! 🌟", 
      "Supporting our BerseMuka family always! ❤️",
      "Building connections, one friendship at a time! 👥",
      "Here to help neighbors in our community! 🏘️"
    ];
    return messages[parseInt(user.id) % messages.length];
  };

  // Get user interests (top 4)
  const getUserInterests = (user: UserProfile) => {
    const allInterests = user.interests || [];
    const additionalInterests = [
      'Architecture', 'Photography', 'Travel', 'Coffee', 'Design', 'Art', 
      'Technology', 'Music', 'Reading', 'Cooking', 'Fitness', 'Languages'
    ];
    const userSpecificInterests = [
      ...allInterests.slice(0, 2),
      ...additionalInterests.slice(parseInt(user.id) % 3, parseInt(user.id) % 3 + 2)
    ];
    return userSpecificInterests.slice(0, 4);
  };

  // Get short bio (max 50 words)
  const getShortBio = (user: UserProfile) => {
    const bios = [
      "Architect and photographer exploring traditions worldwide. Love discovering hidden gems and meeting people over coffee.",
      "Passionate about connecting communities through shared experiences. Always ready to help fellow travelers and locals alike.",
      "Creative professional specializing in design and storytelling. Enjoys cultural exchanges and building meaningful friendships.",
      "Tech enthusiast with a love for art and culture. Happy to share local insights and learn from others.",
      "Lifelong learner passionate about languages and travel. Believes in the power of community and authentic connections."
    ];
    return bios[parseInt(user.id) % bios.length];
  };

  // Get user social media links (for Match screen profile popup)
  const getUserSocialLinks = (user: UserProfile) => {
    const socialOptions = [
      { platform: 'Instagram', icon: '📸', url: 'https://instagram.com/', handle: '@' + user.firstName.toLowerCase() + '_arch' },
      { platform: 'LinkedIn', icon: '💼', url: 'https://linkedin.com/in/', handle: user.firstName.toLowerCase() + '-' + user.lastName?.toLowerCase() },
      { platform: 'Portfolio', icon: '🌐', url: 'https://', handle: user.firstName.toLowerCase() + '.com' },
      { platform: 'Email', icon: '✉️', url: 'mailto:', handle: 'Contact' }
    ];
    
    // Return 2-4 social links per user based on their profile
    const userSeed = parseInt(user.id) || 1;
    const numLinks = 2 + (userSeed % 3); // 2-4 links
    return socialOptions.slice(0, numLinks);
  };

  // Get user offerings (category-based with booking)
  const getUserOfferings = (user: UserProfile) => {
    // Sample offering templates for different user types
    const offeringTemplates = {
      amina: [
        {
          category: 'local-guides',
          icon: '🗺️',
          categoryName: 'Local Guides',
          title: 'Architecture Walking Tours',
          description: 'Professional guided tours of historic architecture with insider knowledge',
          price: 'RM 80/person',
          duration: '3 hours',
          available: true
        },
        {
          category: 'freelance', 
          icon: '💼',
          categoryName: 'Freelance',
          title: 'Architecture Consultation',
          description: 'Professional architectural design review and project consultation',
          price: 'RM 200/hour',
          duration: 'Flexible',
          available: true
        },
        {
          category: 'freelance',
          icon: '💼', 
          categoryName: 'Freelance',
          title: 'Photography Services',
          description: 'Portrait and architectural photography sessions',
          price: 'RM 150/session',
          duration: '2-3 hours',
          available: true
        },
        {
          category: 'marketplace',
          icon: '⚙️',
          categoryName: 'Marketplace', 
          title: 'Travel Photography Prints',
          description: 'High-quality prints from worldwide architecture photography',
          price: 'From RM 35',
          duration: 'Ship in 3-5 days',
          available: true
        },
        {
          category: 'open-to-connect',
          icon: '🤝',
          categoryName: 'Open to Connect',
          title: 'Coffee & Architecture Chat',
          description: 'Casual meetup to discuss architecture, photography, and travel experiences',
          price: 'Free',
          duration: '1-2 hours',
          available: true
        }
      ],
      marwan: [
        {
          category: 'homestay',
          icon: '🏠',
          categoryName: 'Homestay',
          title: 'Muslim Family Homestay',
          description: 'Comfortable room with halal meals in Malaysian family setting',
          price: 'RM 180/night',
          duration: 'Per night',
          available: true
        },
        {
          category: 'local-guides', 
          icon: '🗺️',
          categoryName: 'Local Guides',
          title: 'Cultural Heritage Tours',
          description: 'Authentic Malaysian cultural experiences with Islamic perspective',
          price: 'RM 120/day',
          duration: '6-8 hours',
          available: true
        },
        {
          category: 'open-to-connect',
          icon: '🤝',
          categoryName: 'Open to Connect',
          title: 'Language Exchange',
          description: 'Practice English/Malay conversation over coffee or meals',
          price: 'Free',
          duration: '1-2 hours',
          available: true
        }
      ],
      general: [
        {
          category: 'freelance',
          icon: '💼',
          categoryName: 'Freelance',
          title: 'Professional Services',
          description: 'Consultation and professional guidance in my field of expertise',
          price: 'RM 100/hour',
          duration: 'Flexible',
          available: true
        },
        {
          category: 'local-guides',
          icon: '🗺️',
          categoryName: 'Local Guides',
          title: 'City Tours & Recommendations',
          description: 'Share local insights and favorite spots around the city',
          price: 'RM 60/person',
          duration: '2-3 hours',
          available: true
        },
        {
          category: 'open-to-connect',
          icon: '🤝',
          categoryName: 'Open to Connect',
          title: 'Coffee Meetup',
          description: 'Casual conversation and networking over coffee',
          price: 'Free',
          duration: '1 hour',
          available: true
        }
      ]
    };

    // Determine user type based on profile characteristics
    const userSeed = parseInt(user.id) || 1;
    const firstName = user.firstName.toLowerCase();
    
    let userTemplate = 'general';
    if (firstName === 'amina' || user.profession.toLowerCase().includes('architect')) {
      userTemplate = 'amina';
    } else if (firstName === 'marwan' || user.profession.toLowerCase().includes('host')) {
      userTemplate = 'marwan';
    }

    // Return 2-4 offerings per user
    const offerings = offeringTemplates[userTemplate] || offeringTemplates.general;
    const numOfferings = 2 + (userSeed % 3); // 2-4 offerings
    const startIndex = userSeed % Math.max(1, offerings.length - numOfferings + 1);
    
    return offerings.slice(startIndex, startIndex + numOfferings);
  };

  // Get services offered by user (for elegant service tags)
  const getUserServices = (user: UserProfile) => {
    const serviceOptions = [
      { name: 'Local Guides', borderColor: '#1976D2' },
      { name: 'Homestay', borderColor: '#D32F2F' },
      { name: 'Freelance', borderColor: '#7B1FA2' },
      { name: 'Services', borderColor: '#F57C00' },
      { name: 'Meetups', borderColor: '#388E3C' }
    ];
    
    // Assign 2-4 services per user based on their ID and profession
    const numServices = 2 + (parseInt(user.id) % 3);
    const startIndex = parseInt(user.id) % serviceOptions.length;
    const userServices = [];
    
    for (let i = 0; i < numServices; i++) {
      userServices.push(serviceOptions[(startIndex + i) % serviceOptions.length]);
    }
    
    return userServices;
  };

  // Load users data
  const loadUsers = async () => {
    setIsLoading(true);
    try {
      // Use the shared profiles data, exclude current user
      const profileUsers = userProfiles.filter(profile => profile.id !== (user?.id || '1'));
      setUsers(profileUsers);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    
    // If coming from forum with a selected profile, show it immediately
    if (forumSelectedProfile) {
      setSelectedUser(forumSelectedProfile);
      setShowDetailedProfile(true);
    }
  }, [forumSelectedProfile]);


  // Trust chain feedback
  const handleTrustChainClick = (user: UserProfile) => {
    setSelectedTrustUser(user);
    setShowTrustFeedback(true);
  };

  const handleCloseTrustFeedback = () => {
    setShowTrustFeedback(false);
    setSelectedTrustUser(null);
  };

  // Location logbook
  const handleLocationLogbookClick = (user: UserProfile) => {
    setSelectedLocationUser(user);
    setShowLocationLogbook(true);
    setShowLocationFriends(false);
  };

  const handleCloseLocationLogbook = () => {
    setShowLocationLogbook(false);
    setSelectedLocationUser(null);
    setShowLocationFriends(false);
    setLocationFriends([]);
    setSelectedLocationCity('');
  };

  const handleShowLocationFriends = (user: UserProfile, city: string) => {
    const friends = getTravelFriends(user, city);
    setLocationFriends(friends);
    setSelectedLocationCity(city);
    setShowLocationFriends(true);
  };

  // Messaging handlers
  const handleSendMessageClick = (user: UserProfile) => {
    // Use unified messaging system
    openMessagingModal(
      user.id,
      user.fullName,
      {
        type: 'profile',
        data: {
          userId: user.id,
          userFullName: user.fullName,
          userProfession: user.profession,
          userLocation: user.location
        }
      }
    );
  };

  // Booking functionality
  const handleBooking = (user: UserProfile, offering: any) => {
    const bookingMessage = `Hi ${user.firstName}! I'm interested in booking your "${offering.title}" for ${offering.price}. Could we discuss the details?`;
    
    // Use unified messaging system for booking
    openMessagingModal(
      user.id,
      user.fullName,
      {
        type: 'service_booking',
        data: {
          userId: user.id,
          userFullName: user.fullName,
          service: offering.title,
          price: offering.price,
          category: offering.category,
          context: 'service_booking',
          prefilledMessage: bookingMessage
        }
      }
    );

    // Award points for service booking
    const currentPoints = parseInt(localStorage.getItem('user_points') || '245');
    const newPoints = currentPoints + 5;
    localStorage.setItem('user_points', newPoints.toString());
    
    console.log(`🛍️ Booking ${offering.title} with ${user.fullName}! +5 BerseMuka Points`);
  };


  const handleBackToLogbook = () => {
    setShowLocationFriends(false);
    setLocationFriends([]);
    setSelectedLocationCity('');
  };

  // Top service category button handler
  const handleTopServiceCategoryClick = (categoryId: string) => {
    const isSelecting = selectedTopServiceCategory !== categoryId;
    setSelectedTopServiceCategory(isSelecting ? categoryId : '');
    
    if (isSelecting) {
      // Award points for exploring services
      const currentPoints = parseInt(localStorage.getItem('user_points') || '245');
      const newPoints = currentPoints + 1;
      localStorage.setItem('user_points', newPoints.toString());
      
      // Find the service name for feedback
      const serviceName = topServiceButtons.find(s => s.id === categoryId)?.name || 'Service';
      
      // Provide subtle feedback (could be replaced with a toast system)
      console.log(`✨ Exploring ${serviceName} services! +1 BerseMuka Point`);
    }
  };

  // Clear all filters function
  const clearAllFilters = () => {
    // Reset all filter states to default
    setSelectedCountry('Malaysia');
    setSelectedCities(['All Cities']);
    setSelectedInterests([]);
    setSelectedTopServiceCategory('');
    setActiveSearchTerm('');
    setSearchQuery('');
    
    // Close any open modals
    setCountryModalOpen(false);
    setCityModalOpen(false);
    setInterestsModalOpen(false);
    setSearchModalOpen(false);
    
    // Award points for filter management
    const currentPoints = parseInt(localStorage.getItem('user_points') || '245');
    const newPoints = currentPoints + 1;
    localStorage.setItem('user_points', newPoints.toString());
    
    console.log('🔄 All filters cleared! +1 BerseMuka Point');
  };

  // Filter users based on search and filters (including service categories)
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.bio.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.profession.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.interests.some(interest => interest.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Additional filters from BerseConnect
    const matchesCountry = selectedCountry === 'All Countries' || selectedCountry === 'Malaysia';
    const matchesCities = selectedCities.includes('All Cities') || selectedCities.length === 0;
    const matchesInterests = selectedInterests.length === 0 || selectedInterests.some(interest => 
      user.profession.toLowerCase().includes(interest.toLowerCase()) ||
      user.interests.some(userInterest => userInterest.toLowerCase().includes(interest.toLowerCase()))
    );
    
    // Service category filter
    const matchesServiceCategory = selectedTopServiceCategory === '' || (() => {
      const service = selectedTopServiceCategory;
      if (service === 'local-guides') {
        return user.profession.toLowerCase().includes('guide') || user.interests.some(i => i.toLowerCase().includes('travel') || i.toLowerCase().includes('tour'));
      }
      if (service === 'homestay') {
        return user.profession.toLowerCase().includes('host') || user.interests.some(i => i.toLowerCase().includes('accommodation') || i.toLowerCase().includes('homestay'));
      }
      if (service === 'gig-jobs') {
        return user.profession.toLowerCase().includes('freelance') || user.profession.toLowerCase().includes('photographer') || user.profession.toLowerCase().includes('tutor');
      }
      if (service === 'services') {
        return user.profession.toLowerCase().includes('repair') || user.profession.toLowerCase().includes('cleaning') || user.profession.toLowerCase().includes('support');
      }
      if (service === 'open-connect') {
        return user.interests.some(i => i.toLowerCase().includes('coffee') || i.toLowerCase().includes('hiking') || i.toLowerCase().includes('study'));
      }
      return true;
    })();
    
    return matchesSearch && matchesCountry && matchesCities && matchesInterests && matchesServiceCategory;
  });

  // Event handlers
  const handleSeeProfile = (user: UserProfile) => {
    setSelectedUser(user);
    setShowDetailedProfile(true);
  };

  const handleCloseProfile = () => {
    setShowDetailedProfile(false);
    setSelectedUser(null);
  };

  const handleChatUser = (user: UserProfile, offering?: any) => {
    // Award points for community engagement
    const currentPoints = parseInt(localStorage.getItem('user_points') || '245');
    const newPoints = currentPoints + 3;
    localStorage.setItem('user_points', newPoints.toString());
    
    alert(`✨ Message sent to ${user.fullName}! 💬

🎉 You earned 3 BerseMuka Points for building community connections!
💰 Your total: ${newPoints} points

They'll receive your friendly message and can respond to start building a beautiful community connection, inshaAllah! 🤝`);
    
    setShowDetailedProfile(false);
  };

  const handleBookService = (user: UserProfile, offering: any) => {
    // Award points for service booking
    const currentPoints = parseInt(localStorage.getItem('user_points') || '245');
    const newPoints = currentPoints + 5;
    localStorage.setItem('user_points', newPoints.toString());
    
    alert(`🤝 Booking request sent to ${user.fullName}!

Service: ${offering.title}
${offering.price ? `Price: ${offering.price}` : ''}

🎉 You earned 5 BerseMuka Points for connecting with community services!
💰 Your total: ${newPoints} points

They'll receive your booking request and can coordinate the details with you directly. Building our community together! 🌟`);
    
    setShowDetailedProfile(false);
  };

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
              {user?.fullName ? user.fullName.split(' ').map(n => n[0]).join('') : 'ZM'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <div style={{ fontSize: '12px', color: '#999999', fontWeight: 'normal' }}>Connect With Your Community</div>
              <div style={{ fontSize: '18px', color: '#333333', fontWeight: '600' }}>BerseMatch</div>
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
          }}>{notificationBadge.total}</div>
        </div>
      </div>
      
      {/* Filter Section */}
      <FilterSection>
        <FilterDropdowns>
          <FilterDropdown 
            type="button" 
            $isActive={!selectedCities.includes('All Cities')}
            onClick={() => setCityModalOpen(true)}
          >
            {selectedCities.includes('All Cities') 
              ? 'All Cities' 
              : selectedCities.length === 1 
                ? selectedCities[0]
                : `${selectedCities.length} cities`
            }
          </FilterDropdown>
          <FilterDropdown 
            type="button" 
            $isActive={selectedCountry !== 'Malaysia'}
            onClick={() => setCountryModalOpen(true)}
          >
            {selectedCountry}
          </FilterDropdown>
          <FilterDropdown 
            type="button" 
            $isActive={selectedInterests.length > 0}
            onClick={() => setInterestsModalOpen(true)}
          >
            {selectedInterests.length === 0 
              ? 'Interests' 
              : selectedInterests.length === 1 
                ? selectedInterests[0]
                : `${selectedInterests.length} interests`
            }
          </FilterDropdown>
          <SearchFilterButton 
            type="button"
            $isActive={!!activeSearchTerm}
            onClick={handleOpenEnhancedSearch}
            title={activeSearchTerm ? `Searching: ${activeSearchTerm}` : 'Search people, interests, communities...'}
          >
            🔍
          </SearchFilterButton>
        </FilterDropdowns>
      </FilterSection>

      {/* Service Category Buttons */}
      <ServiceButtonsContainer>
        {topServiceButtons.map((service) => (
          <ServiceButtonCard
            key={service.id}
            $isSelected={selectedTopServiceCategory === service.id}
            onClick={() => handleTopServiceCategoryClick(service.id)}
            title={`Select ${service.name} services`}
          >
            <ServiceButtonIcon 
              $color={service.color} 
              $isSelected={selectedTopServiceCategory === service.id}
            >
              {service.icon}
            </ServiceButtonIcon>
            <ServiceButtonLabel $isSelected={selectedTopServiceCategory === service.id}>
              {service.name}
            </ServiceButtonLabel>
          </ServiceButtonCard>
        ))}
      </ServiceButtonsContainer>
      
      {/* Active Filters Bar */}
      {(selectedCountry !== 'Malaysia' || !selectedCities.includes('All Cities') || selectedInterests.length > 0 || activeSearchTerm || selectedTopServiceCategory) && (
        <ActiveFiltersBar>
          <FilterContent>
            <span>Active filters:</span>
            {activeSearchTerm && (
              <FilterBadge style={{ background: '#E8F4F0', color: '#2D5F4F' }}>
                Search: "{activeSearchTerm}"
              </FilterBadge>
            )}
            {selectedCountry !== 'Malaysia' && (
              <FilterBadge>{selectedCountry}</FilterBadge>
            )}
            {!selectedCities.includes('All Cities') && selectedCities.length > 0 && (
              <FilterBadge>
                {selectedCities.length === 1 ? selectedCities[0] : `${selectedCities.length} cities`}
              </FilterBadge>
            )}
            {selectedInterests.length > 0 && (
              <FilterBadge>
                {selectedInterests.length === 1 ? selectedInterests[0] : `${selectedInterests.length} interests`}
              </FilterBadge>
            )}
            {selectedTopServiceCategory && (
              <FilterBadge style={{ background: '#E8F5E8', color: '#388E3C' }}>
                Service: {topServiceButtons.find(s => s.id === selectedTopServiceCategory)?.name}
              </FilterBadge>
            )}
          </FilterContent>
          <ClearFiltersButton onClick={clearAllFilters}>
            Clear Filters
          </ClearFiltersButton>
        </ActiveFiltersBar>
      )}
      
      <Content>

        {isLoading ? (
          <div style={{ textAlign: 'center', color: '#666', padding: '40px' }}>
            Loading community members...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#666', padding: '40px' }}>
            No community members found matching your criteria.
          </div>
        ) : (
          filteredUsers.map((user) => {
            const userInterests = getUserInterests(user);
            const shortBio = getShortBio(user);
            const userServices = getUserServices(user);
            const userLevel = getUserLevel(user);
            const personalityType = getUserPersonalityType(user);
            const achievements = getUserAchievements(user);
            const verifications = getUserUniversalVerifications(user);
            const communityAffiliations = getEnhancedCommunityAffiliations(user);
            
            return (
              <CleanUserCard key={user.id}>
                {/* CLEAN HEADER: Avatar + Name & Level + Achievements + Rating */}
                <CleanUserCardHeader>
                  <CleanUserAvatar style={{ background: user.avatarColor }}>
                    {user.initials}
                    {user.isVerified && <VerifiedBadge />}
                  </CleanUserAvatar>
                  <CleanCardUserInfo>
                    <CleanUserHeader>
                      <UserNameSection>
                        <CleanUserName>{user.fullName}</CleanUserName>
                        <CleanUserMeta>{user.age} • {user.profession}</CleanUserMeta>
                      </UserNameSection>
                      <TopRightInfo>
                        <CompactRating>
                          <span>⭐</span>
                          {(user.level * 1.2 + 3.5).toFixed(1)}
                        </CompactRating>
                        <CompactLevelBadge $color={userLevel.color}>
                          Lv.{userLevel.level}
                        </CompactLevelBadge>
                        {personalityType && (
                          <CompactPersonalityBadge $temperament={getPersonalityTemperament(personalityType)}>
                            {personalityType}
                          </CompactPersonalityBadge>
                        )}
                      </TopRightInfo>
                    </CleanUserHeader>
                  </CleanCardUserInfo>
                </CleanUserCardHeader>

                {/* CLEAN INTERESTS SECTION */}
                <CleanInterestsContainer>
                  {userInterests.map((interest, index) => (
                    <CleanInterestTag 
                      key={index}
                      $clickable={true}
                      onClick={() => {
                        setActiveSearchCategory('interests');
                        setSelectedSearchInterests([interest.toLowerCase()]);
                        setEnhancedSearchOpen(true);
                      }}
                      title={`Find others interested in ${interest}`}
                    >
                      {interest}
                    </CleanInterestTag>
                  ))}
                </CleanInterestsContainer>

                {/* CLEAN SHORT BIO */}
                <CleanShortBio>{shortBio}</CleanShortBio>

                {/* COMMUNITY AFFILIATIONS SECTION */}
                {communityAffiliations.length > 0 && (
                  <CommunityAffiliationsSection>
                    <CommunityAffiliations>
                      {communityAffiliations.map((affiliation, index) => {
                        const isVerified = getCommunityVerificationStatus(user, affiliation.id);
                        return (
                          <CommunityAffiliation 
                            key={index}
                            $type={affiliation.type}
                            onClick={() => {
                              setActiveSearchCategory('communities');
                              setSelectedSearchCommunities([affiliation.id]);
                              setEnhancedSearchOpen(true);
                            }}
                          >
                            <span>{affiliation.icon}</span>
                            {affiliation.name}
                            {isVerified && (
                              <CommunityVerificationTick>✓</CommunityVerificationTick>
                            )}
                          </CommunityAffiliation>
                        );
                      })}
                    </CommunityAffiliations>
                  </CommunityAffiliationsSection>
                )}

                {/* DUAL BUTTON SECTION */}
                <DualButtonContainer>
                  <CleanTrustChain onClick={() => handleTrustChainClick(user)}>
                    <TrustIcon>🔗</TrustIcon>
                    <TrustText>Trust Chain</TrustText>
                    <TrustArrow>→</TrustArrow>
                  </CleanTrustChain>
                  
                  <LocationLogbookButton onClick={() => handleLocationLogbookClick(user)}>
                    <span>📍</span>
                    <span>{user.location}</span>
                  </LocationLogbookButton>
                </DualButtonContainer>
                
                {/* CLEAN SERVICES SECTION */}
                <CleanServicesSection>
                  <ServicesLabel>Services Offered:</ServicesLabel>
                  <CleanServicesRow>
                    {userServices.map((service, index) => (
                      <CleanServiceTag
                        key={index}
                        $borderColor={service.borderColor}
                      >
                        {service.name}
                      </CleanServiceTag>
                    ))}
                  </CleanServicesRow>
                </CleanServicesSection>

                {/* PROFILE ACTION BUTTONS */}
                <ProfileActionButtons>
                  <SendMessageActionButton onClick={() => handleSendMessageClick(user)}>
                    💬 Send Message
                  </SendMessageActionButton>
                  <ViewProfileActionButton onClick={() => handleSeeProfile(user)}>
                    👤 View Profile
                  </ViewProfileActionButton>
                </ProfileActionButtons>
              </CleanUserCard>
            );
          })
        )}
      </Content>
      

      {/* Detailed Profile Modal */}
      <DetailedProfileModal show={showDetailedProfile} onClick={handleCloseProfile}>
        <DetailedProfileContent onClick={(e) => e.stopPropagation()}>
          {selectedUser && (
            <>
              <DetailedProfileHeader>
                <CloseButton onClick={handleCloseProfile}>×</CloseButton>
                <DetailedUserInfo>
                  <DetailedUserAvatar style={{ background: selectedUser.avatarColor }}>
                    {selectedUser.initials}
                    {selectedUser.isVerified && <VerifiedBadge />}
                  </DetailedUserAvatar>
                  <DetailedUserName>{selectedUser.fullName}</DetailedUserName>
                  <DetailedUserMeta>
                    {selectedUser.age} • {selectedUser.profession}
                  </DetailedUserMeta>
                  <DetailedUserMeta>
                    <StarIcon>★</StarIcon> {(selectedUser.level * 1.2 + 3.5).toFixed(1)} {selectedUser.isVerified && '• ✓ Verified'}
                  </DetailedUserMeta>
                  <LifeSeason>
                    <span>🌱</span>
                    Level {selectedUser.level} • {selectedUser.points} points
                  </LifeSeason>
                </DetailedUserInfo>
                <DetailedUserBio>{selectedUser.bio}</DetailedUserBio>
                
                <CommunityMessage>
                  <CommunityText>{getCommunityMessage(selectedUser)}</CommunityText>
                </CommunityMessage>

                {/* Social Media - Compact Row */}
                <SocialSection>
                  <SocialGrid>
                    {getUserSocialLinks(selectedUser).map((social, index) => (
                      <SocialChip 
                        key={index}
                        href={social.url + (social.platform === 'Email' ? selectedUser.firstName.toLowerCase() + '@example.com' : social.handle)}
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        {social.icon} {social.platform}
                      </SocialChip>
                    ))}
                  </SocialGrid>
                </SocialSection>

                {/* Category-Based Offerings */}
                <OfferingsSection>
                  <OfferingsTitle>🌟 What I Offer</OfferingsTitle>
                  <OfferingsGrid>
                    {getUserOfferings(selectedUser).map((offering, index) => (
                      <OfferingCard key={index} $category={offering.category}>
                        <OfferingHeader>
                          <CategoryTag>
                            {offering.icon} {offering.categoryName}
                          </CategoryTag>
                          <OfferingPrice>{offering.price}</OfferingPrice>
                        </OfferingHeader>
                        
                        <OfferingTitle>{offering.title}</OfferingTitle>
                        <OfferingDesc>{offering.description}</OfferingDesc>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '10px', color: '#6c757d' }}>
                            ⏱️ {offering.duration}
                          </span>
                          <BookButton onClick={() => handleBooking(selectedUser, offering)}>
                            💬 Book Now
                          </BookButton>
                        </div>
                      </OfferingCard>
                    ))}
                  </OfferingsGrid>
                </OfferingsSection>
              </DetailedProfileHeader>

              <MainOfferingsSection>
                <MainOfferingsTitle>🤝 Connect With {selectedUser.firstName}</MainOfferingsTitle>
                <OfferingCard>
                  <OfferingHeader>
                    <OfferingCategory>Community Connection</OfferingCategory>
                  </OfferingHeader>
                  <OfferingTitle>Get to know {selectedUser.firstName}</OfferingTitle>
                  <OfferingDescription>
                    Connect with {selectedUser.firstName} to learn more about their {selectedUser.profession} background 
                    and explore {selectedUser.interests.slice(0, 3).join(', ')} together in the community.
                  </OfferingDescription>
                  <OfferingActions>
                    <ChatButton onClick={() => handleChatUser(selectedUser)}>
                      💬 Send Message
                    </ChatButton>
                    <BookButton onClick={() => handleChatUser(selectedUser)}>
                      🤝 Connect
                    </BookButton>
                  </OfferingActions>
                </OfferingCard>
              </MainOfferingsSection>
            </>
          )}
        </DetailedProfileContent>
      </DetailedProfileModal>


      {/* Trust Chain Feedback Modal */}
      <FilterModalOverlay $isOpen={showTrustFeedback} onClick={handleCloseTrustFeedback}>
        <FilterModal onClick={(e) => e.stopPropagation()}>
          <FilterModalHeader>
            <FilterModalTitle>Trust Chain Reviews</FilterModalTitle>
            <FilterCloseButton onClick={handleCloseTrustFeedback}>×</FilterCloseButton>
          </FilterModalHeader>
          
          {selectedTrustUser && (
            <div style={{ padding: '20px' }}>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <DetailedUserAvatar style={{ background: selectedTrustUser.avatarColor, width: '60px', height: '60px', fontSize: '18px', margin: '0 auto 8px' }}>
                  {selectedTrustUser.initials}
                </DetailedUserAvatar>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '16px' }}>{selectedTrustUser.fullName}</h3>
                <div style={{ color: '#666', fontSize: '12px' }}>Trust Chain Reviews & Feedback</div>
              </div>

              {/* Trust Network Section */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600', color: '#2D5F4F' }}>
                  🔗 Trusted By Community Leaders
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', backgroundColor: '#F0F8F5', borderRadius: '8px' }}>
                    <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, #0891B2, #06B6D4)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px', fontWeight: 'bold' }}>AH</div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '600' }}>Ahmed Hassan</div>
                      <div style={{ fontSize: '11px', color: '#666' }}>Most Trusted Friend • Dubai Fintech Expert</div>
                    </div>
                    <div style={{ marginLeft: 'auto', color: '#2D5F4F', fontSize: '12px', fontWeight: '600' }}>✓ Verified</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', backgroundColor: '#F8F9FA', borderRadius: '8px' }}>
                    <div style={{ width: '28px', height: '28px', background: 'linear-gradient(135deg, #2D5F4F, #4A90A4)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '11px', fontWeight: 'bold' }}>AH</div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '600' }}>Amina Hadzic</div>
                      <div style={{ fontSize: '10px', color: '#666' }}>Trust Network • Architecture Expert</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', backgroundColor: '#F8F9FA', borderRadius: '8px' }}>
                    <div style={{ width: '28px', height: '28px', background: 'linear-gradient(135deg, #10B981, #34D399)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '11px', fontWeight: 'bold' }}>AS</div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '600' }}>Ali Seggaf</div>
                      <div style={{ fontSize: '10px', color: '#666' }}>Trust Network • Islamic Studies Scholar</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', backgroundColor: '#F8F9FA', borderRadius: '8px' }}>
                    <div style={{ width: '28px', height: '28px', background: 'linear-gradient(135deg, #8B5CF6, #A78BFA)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '11px', fontWeight: 'bold' }}>ZM</div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '600' }}>Zara Malik</div>
                      <div style={{ fontSize: '10px', color: '#666' }}>Trust Network • Fashion Entrepreneur</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Community Reviews */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600', color: '#2D5F4F' }}>
                  💬 Community Reviews (Admin Verified)
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ border: '1px solid #E5E5E5', borderRadius: '8px', padding: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '24px', height: '24px', background: 'linear-gradient(135deg, #0891B2, #06B6D4)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '10px', fontWeight: 'bold' }}>AH</div>
                        <span style={{ fontSize: '14px', fontWeight: '600' }}>Ahmed Hassan</span>
                        <span style={{ fontSize: '10px', color: '#2D5F4F', backgroundColor: '#F0F8F5', padding: '2px 6px', borderRadius: '4px' }}>TRUSTED</span>
                      </div>
                      <div style={{ color: '#FFD700', fontSize: '12px' }}>★★★★★</div>
                    </div>
                    <p style={{ margin: '0', fontSize: '13px', color: '#333', lineHeight: '1.4' }}>
                      "MashaAllah, {selectedTrustUser.firstName} is an excellent community member. Very reliable and knowledgeable about {selectedTrustUser.profession.toLowerCase()}. I personally vouch for their trustworthiness. Barakallahu feek!"
                    </p>
                    <div style={{ fontSize: '11px', color: '#999', marginTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
                      <span>2 weeks ago</span>
                      <span style={{ color: '#2D5F4F' }}>✓ Admin Verified</span>
                    </div>
                  </div>

                  <div style={{ border: '1px solid #E5E5E5', borderRadius: '8px', padding: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '24px', height: '24px', background: 'linear-gradient(135deg, #EC4899, #F472B6)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '10px', fontWeight: 'bold' }}>FZ</div>
                        <span style={{ fontSize: '14px', fontWeight: '600' }}>Fatima Al-Zahra</span>
                      </div>
                      <div style={{ color: '#FFD700', fontSize: '12px' }}>★★★★★</div>
                    </div>
                    <p style={{ margin: '0', fontSize: '13px', color: '#333', lineHeight: '1.4' }}>
                      "Alhamdulillah, {selectedTrustUser.firstName} has been very helpful to our community. Their expertise in {selectedTrustUser.interests[0]} is valuable. JazakAllahu khair for all your contributions!"
                    </p>
                    <div style={{ fontSize: '11px', color: '#999', marginTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
                      <span>1 month ago</span>
                      <span style={{ color: '#2D5F4F' }}>✓ Admin Verified</span>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '20px', padding: '12px', backgroundColor: '#F8F9FA', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#2D5F4F', marginBottom: '4px' }}>
                  Overall Rating: ⭐ {(selectedTrustUser.level * 1.2 + 3.5).toFixed(1)}/5.0
                </div>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '12px' }}>
                  Based on {selectedTrustUser.forumReplies + selectedTrustUser.forumLikes + 8} community reviews
                </div>
                <button style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: '#2D5F4F',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }} onClick={() => {
                  alert('📝 Review submitted for admin approval!\n\nYour feedback will be reviewed by our community moderators before being published to maintain trust and authenticity. JazakAllahu khair for contributing to our community trust network! 🤝');
                  handleCloseTrustFeedback();
                }}>
                  📝 Submit Review (Admin Approval Required)
                </button>
              </div>
            </div>
          )}
        </FilterModal>
      </FilterModalOverlay>

      {/* Location Logbook Modal */}
      <FilterModalOverlay $isOpen={showLocationLogbook} onClick={handleCloseLocationLogbook}>
        <FilterModal onClick={(e) => e.stopPropagation()}>
          <FilterModalHeader>
            <FilterModalTitle>📍 Location Logbook - {selectedLocationUser?.fullName}</FilterModalTitle>
            <FilterCloseButton onClick={handleCloseLocationLogbook}>×</FilterCloseButton>
          </FilterModalHeader>
          
          {selectedLocationUser && (
            <LocationModalContent style={{ padding: '20px' }}>
              {!showLocationFriends ? (
                // Main Location Logbook View
                (() => {
                  const residenceInfo = getUserResidenceInfo(selectedLocationUser);
                  const travelHistory = getUserTravelHistory(selectedLocationUser);
                  
                  return (
                    <>
                      {/* Residence Info Section */}
                      <div style={{ marginBottom: '24px' }}>
                        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                          <DetailedUserAvatar style={{ background: selectedLocationUser.avatarColor, width: '60px', height: '60px', fontSize: '18px', margin: '0 auto 8px' }}>
                            {selectedLocationUser.initials}
                          </DetailedUserAvatar>
                          <h3 style={{ margin: '0 0 4px 0', fontSize: '16px' }}>{selectedLocationUser.fullName}</h3>
                        </div>

                        <div style={{ background: '#F8F9FA', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
                          <div style={{ fontSize: '14px', fontWeight: '600', color: '#2D5F4F', marginBottom: '8px' }}>Residence Information</div>
                          <div style={{ fontSize: '13px', color: '#333', marginBottom: '4px' }}>
                            <span style={{ fontWeight: '500' }}>Original Country:</span> {residenceInfo.originalCountry}
                          </div>
                          <div style={{ fontSize: '13px', color: '#333', marginBottom: '4px' }}>
                            <span style={{ fontWeight: '500' }}>Current Residence:</span> 📍 {selectedLocationUser.location}, {selectedLocationUser.country}
                          </div>
                          <div style={{ fontSize: '13px', color: '#333' }}>
                            <span style={{ fontWeight: '500' }}>Since:</span> Living here since {residenceInfo.since}
                          </div>
                        </div>
                      </div>

                      {/* Travel History Section */}
                      <div>
                        <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: '600', color: '#2D5F4F' }}>Travel History</h4>
                        
                        {travelHistory.map((travel, index) => (
                          <div key={index} style={{ 
                            border: '1px solid #E5E5E5', 
                            borderRadius: '8px', 
                            padding: '12px', 
                            marginBottom: '12px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#F8F9FA';
                            e.currentTarget.style.borderColor = '#2D5F4F';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'white';
                            e.currentTarget.style.borderColor = '#E5E5E5';
                          }}
                          onClick={() => handleShowLocationFriends(selectedLocationUser, travel.city)}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                              <div style={{ fontSize: '14px', fontWeight: '600', color: '#333' }}>
                                {travel.country} - {travel.city}
                              </div>
                              <div style={{ fontSize: '12px', color: '#666' }}>
                                👥 {travel.friends} friends
                              </div>
                            </div>
                            <div style={{ fontSize: '12px', color: '#666' }}>
                              📅 {travel.duration}
                            </div>
                            <div style={{ fontSize: '11px', color: '#999', marginTop: '4px', fontStyle: 'italic' }}>
                              Click to see friends in this location
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Action Button */}
                      <div style={{ marginTop: '20px', padding: '12px', backgroundColor: '#F8F9FA', borderRadius: '8px', textAlign: 'center' }}>
                        <div style={{ fontSize: '12px', color: '#666', marginBottom: '12px' }}>
                          Connect with {selectedLocationUser.firstName} to share travel experiences and get local insights!
                        </div>
                        <button style={{
                          width: '100%',
                          padding: '10px',
                          backgroundColor: '#2D5F4F',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }} onClick={() => {
                          alert(`🌍 Travel connection request sent to ${selectedLocationUser.fullName}!\n\nThey'll be notified that you're interested in connecting to share travel experiences and get local insights. Safe travels! ✈️`);
                          handleCloseLocationLogbook();
                        }}>
                          🌍 Connect for Travel Insights
                        </button>
                      </div>
                    </>
                  );
                })()
              ) : (
                // Friends in Location View
                <>
                  <BackButton onClick={handleBackToLogbook}>
                    ← Back to Travel History
                  </BackButton>
                  
                  <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#2D5F4F' }}>
                      Friends in {selectedLocationCity}
                    </h3>
                    <p style={{ margin: '0', fontSize: '12px', color: '#666' }}>
                      Connect with people {selectedLocationUser?.firstName} knows in this location
                    </p>
                  </div>

                  <FriendsGridContainer>
                    {locationFriends.map((friend) => (
                      <MiniFriendCard key={friend.id}>
                        <MiniFriendHeader>
                          <MiniFriendAvatar style={{ background: friend.avatarColor }}>
                            {friend.initials}
                          </MiniFriendAvatar>
                          <MiniFriendInfo>
                            <MiniFriendName>{friend.fullName}</MiniFriendName>
                            <MiniFriendProfession>{friend.profession}</MiniFriendProfession>
                            <MiniFriendConnection>
                              Connection: {(friend as any).connection}
                            </MiniFriendConnection>
                          </MiniFriendInfo>
                        </MiniFriendHeader>
                        
                        <div style={{ fontSize: '11px', color: '#666', marginBottom: '8px' }}>
                          Services: {friend.lookingFor?.slice(0, 2).join(', ') || 'Open to Connect'}
                        </div>
                        
                        <MiniFriendActions>
                          <MiniFriendButton 
                            $variant="secondary"
                            onClick={() => {
                              setSelectedUser(friend);
                              setShowDetailedProfile(true);
                              setShowLocationLogbook(false);
                            }}
                          >
                            View Profile
                          </MiniFriendButton>
                          <MiniFriendButton 
                            $variant="primary"
                            onClick={() => {
                              alert(`🤝 Connection request sent to ${friend.fullName}!\n\nThey'll be notified that you'd like to connect through your mutual friend ${selectedLocationUser?.firstName} in ${selectedLocationCity}.`);
                            }}
                          >
                            Connect
                          </MiniFriendButton>
                        </MiniFriendActions>
                      </MiniFriendCard>
                    ))}
                  </FriendsGridContainer>

                  {locationFriends.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px 20px', color: '#666' }}>
                      <p>No friends found in this location yet.</p>
                    </div>
                  )}
                </>
              )}
            </LocationModalContent>
          )}
        </FilterModal>
      </FilterModalOverlay>
      
      {/* Filter Modals from BerseConnect */}
      <CountryFilterModal
        isOpen={countryModalOpen}
        onClose={() => setCountryModalOpen(false)}
        selectedCountry={selectedCountry}
        onApply={handleCountryFilter}
      />

      <CityFilterModal
        isOpen={cityModalOpen}
        onClose={() => setCityModalOpen(false)}
        selectedCountry={selectedCountry}
        selectedCities={selectedCities}
        onApply={handleCityFilter}
      />
      
      {/* Interests Filter Modal */}
      <FilterModalOverlay $isOpen={interestsModalOpen} onClick={() => setInterestsModalOpen(false)}>
        <FilterModal onClick={(e) => e.stopPropagation()}>
          <FilterModalHeader>
            <FilterModalTitle>Select Your Interests</FilterModalTitle>
            <FilterCloseButton onClick={() => setInterestsModalOpen(false)}>
              ×
            </FilterCloseButton>
          </FilterModalHeader>
          
          <CheckboxGrid>
            {interestOptions.map((interest) => (
              <CheckboxItem
                key={interest.id}
              >
                <Checkbox
                  type="checkbox"
                  checked={selectedInterests.includes(interest.id)}
                  onChange={() => handleInterestToggle(interest.id)}
                />
                <div>
                  <div style={{ fontWeight: '600', marginBottom: '2px' }}>{interest.label}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {interest.description}
                  </div>
                </div>
              </CheckboxItem>
            ))}
          </CheckboxGrid>
          
          <FilterActions>
            <ClearButton onClick={handleClearInterests}>
              Clear All
            </ClearButton>
            <ApplyButton onClick={handleApplyInterests}>
              Apply ({selectedInterests.length})
            </ApplyButton>
          </FilterActions>
        </FilterModal>
      </FilterModalOverlay>

      {/* Enhanced Search Modal */}
      <EnhancedSearchModal $isOpen={enhancedSearchOpen} onClick={handleCloseEnhancedSearch}>
        <EnhancedSearchContent onClick={(e) => e.stopPropagation()}>
          <EnhancedSearchHeader>
            <EnhancedSearchTitle>Advanced Search</EnhancedSearchTitle>
            <EnhancedSearchCloseButton onClick={handleCloseEnhancedSearch}>
              ×
            </EnhancedSearchCloseButton>
          </EnhancedSearchHeader>
          
          <EnhancedSearchBody>
            {/* Main Search Input */}
            <div style={{ position: 'relative' }}>
              <MainSearchInput
                type="text"
                placeholder="Search people, interests, communities..."
                value={mainSearchQuery}
                onChange={(e) => handleMainSearchInputChange(e.target.value)}
                autoFocus
              />
              {showAutocomplete && autocompleteResults.length > 0 && (
                <AutocompleteDropdown>
                  {autocompleteResults.map((item, index) => (
                    <AutocompleteItem key={index} onClick={() => handleAutocompleteSelect(item)}>
                      <ItemIcon>
                        {item.type === 'interest' ? '🎯' : 
                         item.type === 'community' ? '🏛️' : 
                         item.type === 'company' ? '🏢' : 
                         item.type === 'skill' ? '⚡' : '💭'}
                      </ItemIcon>
                      <ItemDetails>
                        <ItemName>{item.name}</ItemName>
                        <ItemMeta>
                          {item.type === 'community' && `${item.memberCount} members • ${item.type}`}
                          {item.type === 'interest' && `${item.category} • ${item.popularity}% popularity`}
                          {item.type === 'company' && item.description}
                          {item.type === 'skill' && item.category}
                          {item.type === 'personality' && `${item.type} • ${item.temperament} temperament`}
                        </ItemMeta>
                      </ItemDetails>
                    </AutocompleteItem>
                  ))}
                </AutocompleteDropdown>
              )}
            </div>

            {/* Category Tabs */}
            <CategoryTabs>
              {searchCategories.map((category) => (
                <CategoryTab
                  key={category.id}
                  $isActive={activeSearchCategory === category.id}
                  onClick={() => handleCategoryTabClick(category.id)}
                >
                  <span>{category.icon}</span>
                  {category.name}
                </CategoryTab>
              ))}
            </CategoryTabs>

            {/* Active Filter Chips */}
            <FilterChips>
              {selectedSearchInterests.map((interest) => (
                <FilterChip key={`interest-${interest}`}>
                  🎯 {interestOptions.find(o => o.id === interest)?.name || interest}
                  <ChipRemove onClick={() => removeSearchFilter('interest', interest)}>×</ChipRemove>
                </FilterChip>
              ))}
              {selectedSearchCommunities.map((community) => (
                <FilterChip key={`community-${community}`}>
                  🏛️ {communityOptions.find(o => o.id === community)?.name || community}
                  <ChipRemove onClick={() => removeSearchFilter('community', community)}>×</ChipRemove>
                </FilterChip>
              ))}
              {selectedSearchCompanies.map((company) => (
                <FilterChip key={`company-${company}`}>
                  🏢 {companyOptions.find(o => o.id === company)?.name || company}
                  <ChipRemove onClick={() => removeSearchFilter('company', company)}>×</ChipRemove>
                </FilterChip>
              ))}
              {selectedSearchSkills.map((skill) => (
                <FilterChip key={`skill-${skill}`}>
                  ⚡ {skillOptions.find(o => o.id === skill)?.name || skill}
                  <ChipRemove onClick={() => removeSearchFilter('skill', skill)}>×</ChipRemove>
                </FilterChip>
              ))}
              {selectedSearchPersonalities.map((personality) => (
                <FilterChip key={`personality-${personality}`}>
                  💭 {personalityOptions.find(o => o.id === personality)?.name || personality}
                  <ChipRemove onClick={() => removeSearchFilter('personality', personality)}>×</ChipRemove>
                </FilterChip>
              ))}
            </FilterChips>

            {/* Quick Suggestions */}
            {!mainSearchQuery && (
              <QuickSuggestions>
                <SuggestionsTitle>
                  {activeSearchCategory === 'all' ? 'Popular Searches' : 
                   activeSearchCategory === 'interests' ? 'Popular Interests' :
                   activeSearchCategory === 'communities' ? 'Verified Communities' :
                   activeSearchCategory === 'companies' ? 'Organizations' : 
                   activeSearchCategory === 'skills' ? 'Common Skills' : 'Personality Types'}
                </SuggestionsTitle>
                <SuggestionGrid>
                  {getQuickSuggestions().map((suggestion, index) => (
                    <SuggestionChip 
                      key={index}
                      onClick={() => {
                        if (suggestion.type === 'suggestion') {
                          setMainSearchQuery(suggestion.name);
                          handleMainSearchInputChange(suggestion.name);
                        } else {
                          handleAutocompleteSelect({ ...suggestion, type: activeSearchCategory === 'all' ? 'interest' : activeSearchCategory });
                        }
                      }}
                    >
                      {suggestion.name}
                    </SuggestionChip>
                  ))}
                </SuggestionGrid>
              </QuickSuggestions>
            )}

            {/* Results Count */}
            {(selectedSearchInterests.length > 0 || selectedSearchCommunities.length > 0 || 
              selectedSearchCompanies.length > 0 || selectedSearchSkills.length > 0 || 
              selectedSearchPersonalities.length > 0 || mainSearchQuery.trim()) && (
              <ResultsCount>
                Will search {users.length} community members
              </ResultsCount>
            )}

            {/* Actions */}
            <EnhancedSearchActions>
              <SearchActionButton onClick={handleClearEnhancedSearch}>
                Clear All
              </SearchActionButton>
              <SearchActionButton 
                $variant="primary" 
                onClick={handleApplyEnhancedSearch}
                $disabled={!mainSearchQuery.trim() && selectedSearchInterests.length === 0 && 
                          selectedSearchCommunities.length === 0 && selectedSearchCompanies.length === 0 && 
                          selectedSearchSkills.length === 0 && selectedSearchPersonalities.length === 0}
              >
                Search ({selectedSearchInterests.length + selectedSearchCommunities.length + 
                        selectedSearchCompanies.length + selectedSearchSkills.length + 
                        selectedSearchPersonalities.length + (mainSearchQuery.trim() ? 1 : 0)} filters)
              </SearchActionButton>
            </EnhancedSearchActions>
          </EnhancedSearchBody>
        </EnhancedSearchContent>
      </EnhancedSearchModal>


      <BottomNav activeTab="match" />
    </Container>
  );
};