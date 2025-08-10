import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { StatusBar } from '../components/StatusBar/StatusBar';
import { MainNav } from '../components/MainNav';
import { ProfileSidebar } from '../components/ProfileSidebar';
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
