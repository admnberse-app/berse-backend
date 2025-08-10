import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { StatusBar } from '../components/StatusBar/StatusBar';
import { MainNav } from '../components/MainNav/index';

// Interface for profile data
interface ProfileCardData {
  id: number;
  name: string;
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
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #F9F3E3;
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
  margin-bottom: 12px;
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

const Title = styled.h2`
  margin: 0;
  font-size: 18px;
  color: #2D5F4F;
  font-weight: 600;
`;

const Subtitle = styled.p`
  margin: 2px 0 0 0;
  font-size: 12px;
  color: #666;
`;

const NotificationButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  position: relative;
`;

const NotificationBadge = styled.span`
  position: absolute;
  top: -4px;
  right: -4px;
  background: #FF4444;
  color: white;
  font-size: 10px;
  padding: 2px 5px;
  border-radius: 10px;
  font-weight: 600;
`;

// Connection Mode Selector
const ConnectionModeCard = styled.div`
  background: linear-gradient(135deg, #2D5F4F, #4A8B7C);
  border-radius: 12px;
  padding: 12px;
  margin: 0 16px 12px 16px;
  color: white;
`;

const ModeTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const ModeDescription = styled.div`
  font-size: 11px;
  opacity: 0.9;
  margin-bottom: 12px;
  line-height: 1.4;
`;

const ModeSelector = styled.div`
  display: flex;
  gap: 8px;
`;

const ModeButton = styled.button<{ $active?: boolean }>`
  flex: 1;
  padding: 8px;
  background: ${props => props.$active ? 'white' : 'rgba(255, 255, 255, 0.2)'};
  color: ${props => props.$active ? '#2D5F4F' : 'white'};
  border: 1px solid ${props => props.$active ? 'white' : 'rgba(255, 255, 255, 0.3)'};
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.$active ? 'white' : 'rgba(255, 255, 255, 0.3)'};
  }
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
  color: ${props => props.$active ? '#2D5F4F' : '#999'};
  border: none;
  border-bottom: ${props => props.$active ? '3px solid #2D5F4F' : '3px solid transparent'};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;

  &:hover {
    color: #2D5F4F;
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

// Content Area
const Content = styled.div`
  flex: 1;
  overflow-y: auto;
  padding-bottom: 100px;
`;

// Daily Quest Card
const QuestCard = styled.div`
  background: linear-gradient(135deg, #FFE0B2, #FFCC80);
  border-radius: 12px;
  padding: 16px;
  margin: 16px;
  border: 1px solid #FFB74D;
`;

const QuestTitle = styled.h3`
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #E65100;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const QuestDescription = styled.p`
  margin: 0 0 8px 0;
  font-size: 13px;
  color: #795548;
`;

const QuestReward = styled.div`
  font-size: 12px;
  color: #BF360C;
  font-weight: 600;
  margin-bottom: 8px;
`;

const QuestTimer = styled.div`
  font-size: 11px;
  color: #795548;
  margin-bottom: 12px;
`;

const QuestButton = styled.button`
  width: 100%;
  background: #FF6F00;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background: #E65100;
  }
`;

// Filter Card
const FilterCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin: 0 16px 16px 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`;

const FilterTitle = styled.h4`
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #333;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const FilterSection = styled.div`
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const FilterLabel = styled.div`
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
`;

const FilterOptions = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const FilterDropdown = styled.select`
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 12px;
  color: #333;
  background: white;
  cursor: pointer;
  flex: 1;
  min-width: 120px;

  &:focus {
    outline: none;
    border-color: #2D5F4F;
  }
`;

// Connection Card
const ConnectionCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin: 0 16px 12px 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #e0e0e0;
`;

const MatchBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: linear-gradient(135deg, #4CAF50, #8BC34A);
  color: white;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  margin-bottom: 12px;
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
`;

const ConnectionLocation = styled.div`
  font-size: 12px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 4px;
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
`;

const ConnectionActions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;
`;

const ActionButton = styled.button<{ $primary?: boolean }>`
  flex: 1;
  padding: 10px;
  background: ${props => props.$primary ? '#2D5F4F' : 'white'};
  color: ${props => props.$primary ? 'white' : '#2D5F4F'};
  border: ${props => props.$primary ? 'none' : '1px solid #2D5F4F'};
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
  color: #2D5F4F;
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
  color: #2D5F4F;
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
  background: #2D5F4F;
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
  padding: 0 16px 16px 16px;
`;

const QuickActionButton = styled.button`
  flex: 1;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 12px 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #F5F5F5;
    transform: translateY(-2px);
  }
`;

const QuickActionIcon = styled.div`
  font-size: 20px;
`;

const QuickActionLabel = styled.span`
  font-size: 10px;
  color: #666;
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
    border-color: #2D5F4F;
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
    border-color: #2D5F4F;
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
  background: ${props => props.$primary ? '#2D5F4F' : '#F5F5F5'};
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
  background: ${props => props.$main ? '#2D5F4F' : '#64B5F6'};
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

export const BerseMatchScreen: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'discover' | 'matchmaker' | 'myweb'>('discover');
  const [connectionMode, setConnectionMode] = useState<'guides' | 'homesurf' | 'mentor' | 'buddy'>('guides');
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
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showInterestModal, setShowInterestModal] = useState(false);
  
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

  // Mode descriptions
  const modeDescriptions = {
    guides: "Find locals and friends who can show you around cities, cultures, and communities",
    homesurf: "Connect with people offering affordable rooms and homestays for students and travelers",
    mentor: "Find industry professionals for career guidance and skill development",
    buddy: "International students connecting with local students for support"
  };

  // Filter connections based on mode
  const getFilteredConnections = () => {
    const allConnections = {
      guides: [
        {
          id: 1,
          name: 'Sarah Lim',
          location: 'KLCC, Kuala Lumpur',
          match: 92,
          tags: ['Local Friend', 'City Guide', 'Coffee Expert'],
          mutuals: ['Ahmad', 'Fatima'],
          bio: 'Know all the best cafes and hidden gems in KL! Happy to show you around',
          offers: ['Weekend city tours', 'Best food spots', 'Local hangouts']
        },
        {
          id: 2,
          name: 'Ahmad Rahman',
          location: 'Berlin, Germany',
          origin: 'KL, Malaysia',
          match: 95,
          tags: ['Local Guide', 'Free Tours'],
          languages: ['EN', 'DE', 'MS'],
          mutuals: ['Sarah', 'Amir', 'Zara'],
          bio: 'Helping Malaysians navigate life in Germany since 2019',
          offers: ['City tours (Free)', 'Uni applications help', 'Halal food spots map']
        }
      ],
      homesurf: [
        {
          id: 3,
          name: "Fatima's Family",
          location: 'Bangsar, KL',
          match: 98,
          tags: ['Homestay', 'Student-Friendly', 'Halal'],
          price: 'RM 80/night',
          amenities: ['Halal kitchen', 'WiFi', 'Laundry', 'Family meals'],
          bio: 'Cozy family home perfect for students. We treat you like family!',
          reviews: 12,
          rating: 5
        },
        {
          id: 4,
          name: 'Jason Tan',
          location: 'Subang Jaya',
          match: 85,
          tags: ['Room Rental', 'Near University'],
          price: 'RM 50/night',
          amenities: ['Private room', 'Shared kitchen', 'Near LRT'],
          bio: 'Spare room available for students. 5 mins to Sunway University',
          reviews: 8,
          rating: 4.5
        }
      ],
      mentor: [
        {
          id: 5,
          name: 'Dr. Farah Ibrahim',
          location: 'Singapore',
          match: 88,
          tags: ['Tech Mentor', 'AI Expert'],
          company: 'Google Singapore',
          mutuals: ['Khalid', 'Omar'],
          bio: 'Mentoring aspiring tech professionals in SEA',
          expertise: ['Machine Learning', 'Career Growth', 'Tech Interviews']
        }
      ],
      buddy: [
        {
          id: 6,
          name: 'Kim Ji-won',
          location: 'UM Campus',
          origin: 'Seoul, Korea',
          match: 90,
          tags: ['Study Buddy', 'EMGS Support'],
          education: 'Computer Science Year 2',
          mutuals: ['Lisa', 'Ahmed'],
          bio: 'Exchange student helping other internationals settle in',
          looking: ['Study groups', 'Campus tours', 'Food adventures']
        }
      ]
    };

    return allConnections[connectionMode] || [];
  };

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      // Mock users with proper servicesOffered for testing
      const mockUsers: ProfileCardData[] = [
        {
          id: 1,
          name: 'Sarah Lim',
          location: 'KLCC, Kuala Lumpur',
          match: 92,
          tags: ['Local Friend', 'City Guide', 'Coffee Expert'],
          mutuals: ['Ahmad', 'Fatima'],
          bio: 'Know all the best cafes and hidden gems in KL! Happy to show you around',
          offers: ['Weekend city tours', 'Best food spots', 'Local hangouts'],
          servicesOffered: {
            localGuide: true,
            homestay: false,
            marketplace: false,
            openToConnect: true
          }
        }
      ];
      setUsers(mockUsers);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Friendship matches data
  const friendshipMatches = [
    {
      person1: { name: 'Ahmad', emoji: '👨‍💼', relation: 'Your gym buddy' },
      person2: { name: 'Khalid', emoji: '👨‍🎓', relation: 'Your colleague' },
      reasons: [
        '🏸 Both play badminton weekly',
        '☕ Coffee enthusiasts who work remotely',
        '📍 Live in the same neighborhood',
        '🎯 Both looking for workout partners',
        '📚 Share interest in tech podcasts'
      ]
    },
    {
      person1: { name: 'Sarah', emoji: '👩‍💻', relation: 'Your sister' },
      person2: { name: 'Fatima', emoji: '👩‍🎨', relation: 'Your classmate' },
      reasons: [
        '🎨 Both into digital art',
        '🌱 Vegetarian foodies',
        '🏃‍♀️ Morning runners',
        '📷 Photography hobbyists',
        '🎭 Theatre enthusiasts'
      ]
    },
    {
      person1: { name: 'Omar', emoji: '👨‍🔬', relation: 'Lab partner' },
      person2: { name: 'Lisa', emoji: '👩‍⚕️', relation: 'Neighbor' },
      reasons: [
        '🔬 Both in medical field',
        '📚 Love reading sci-fi',
        '🎮 Board game enthusiasts',
        '🍳 Weekend cooking experiments',
        '🏊 Swimming at same pool'
      ]
    }
  ];

  // Connection chains data
  const connectionChains = [
    { target: 'Tech CEO', path: ['You', 'Ahmad', 'Dr. Wan', 'CEO'], steps: 3 },
    { target: 'Minister', path: ['You', 'Uncle Rahman', 'Minister'], steps: 2 },
    { target: 'Hollywood Actor', path: ['You', 'Sarah', 'Film Director', 'Actor'], steps: 3 },
    { target: 'Nobel Laureate', path: ['You', 'Professor', 'Researcher', 'Laureate'], steps: 3 }
  ];

  useEffect(() => {
    loadUsers();
  }, []);

  // Handler functions
  const handleSkipMatch = () => {
    setCurrentMatchIndex((prev) => (prev + 1) % friendshipMatches.length);
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
      
      <Header>
        <HeaderTop>
          <BackButton onClick={() => navigate('/dashboard')}>←</BackButton>
          <HeaderTitle>
            <Title>BerseMatch</Title>
            <Subtitle>Connect • Discover • Network</Subtitle>
          </HeaderTitle>
          <NotificationButton>
            🔔
            <NotificationBadge>3</NotificationBadge>
          </NotificationButton>
        </HeaderTop>
      </Header>

      <ConnectionModeCard>
        <ModeTitle>🌍 CONNECTION MODE</ModeTitle>
        <ModeDescription>{modeDescriptions[connectionMode]}</ModeDescription>
        <ModeSelector>
          <ModeButton 
            $active={connectionMode === 'guides'}
            onClick={() => setConnectionMode('guides')}
          >
            Guides
          </ModeButton>
          <ModeButton 
            $active={connectionMode === 'homesurf'}
            onClick={() => setConnectionMode('homesurf')}
          >
            HomeSurf
          </ModeButton>
          <ModeButton 
            $active={connectionMode === 'mentor'}
            onClick={() => setConnectionMode('mentor')}
          >
            Mentor
          </ModeButton>
          <ModeButton 
            $active={connectionMode === 'buddy'}
            onClick={() => setConnectionMode('buddy')}
          >
            Buddy
          </ModeButton>
        </ModeSelector>
      </ConnectionModeCard>

      <TabContainer>
        <Tab $active={activeTab === 'discover'} onClick={() => setActiveTab('discover')}>
          <TabLabel>DISCOVER</TabLabel>
          <TabSublabel>Find</TabSublabel>
        </Tab>
        <Tab $active={activeTab === 'matchmaker'} onClick={() => setActiveTab('matchmaker')}>
          <TabLabel>CONNECTOR</TabLabel>
          <TabSublabel>Introduce</TabSublabel>
        </Tab>
        <Tab $active={activeTab === 'myweb'} onClick={() => setActiveTab('myweb')}>
          <TabLabel>MY WEB</TabLabel>
          <TabSublabel>Network</TabSublabel>
        </Tab>
      </TabContainer>

      <Content>
        {activeTab === 'discover' && (
          <>
            <QuestCard>
              <QuestTitle>🎯 TODAY'S CONNECTION QUEST</QuestTitle>
              <QuestDescription>Find: Malaysian in Germany</QuestDescription>
              <QuestReward>Reward: 200 pts + Badge</QuestReward>
              <QuestTimer>Time left: 3h 45m</QuestTimer>
              <QuestButton>Start Hunt →</QuestButton>
            </QuestCard>

            <FilterCard>
              <FilterTitle>🔍 SMART FILTERS</FilterTitle>
              <FilterSection>
                <FilterLabel>📍 Location:</FilterLabel>
                <FilterOptions>
                  <FilterDropdown>
                    <option>My City</option>
                    <option>Any City</option>
                  </FilterDropdown>
                  <FilterDropdown>
                    <option>Any Country</option>
                    <option>Malaysia</option>
                    <option>Germany</option>
                  </FilterDropdown>
                </FilterOptions>
              </FilterSection>
            </FilterCard>

            {getFilteredConnections().map((connection: any) => (
              <ConnectionCard key={connection.id}>
                <MatchBadge>🌟 {connection.match}% MATCH</MatchBadge>
                <ConnectionHeader>
                  <Avatar>👤</Avatar>
                  <ConnectionInfo>
                    <ConnectionName>{connection.name}</ConnectionName>
                    <ConnectionLocation>
                      📍 {connection.location}
                      {connection.origin && ` • From: ${connection.origin}`}
                    </ConnectionLocation>
                    {connection.price && (
                      <HomestayPrice>{connection.price}</HomestayPrice>
                    )}
                  </ConnectionInfo>
                </ConnectionHeader>
                <ConnectionTags>
                  {connection.tags.map(tag => (
                    <Tag key={tag}>{tag}</Tag>
                  ))}
                </ConnectionTags>
                <ConnectionBio>"{connection.bio}"</ConnectionBio>
                
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
                  <MutualSection>
                    <span style={{ fontSize: '12px', color: '#666' }}>
                      👥 {connection.mutuals.length} mutual friends
                    </span>
                  </MutualSection>
                )}
                
                <ConnectionActions>
                  <ActionButton>💬 Message</ActionButton>
                  <ActionButton $primary>
                    {connectionMode === 'homesurf' ? '🏠 Book Stay' : '🤝 Connect'}
                  </ActionButton>
                </ConnectionActions>
              </ConnectionCard>
            ))}
          </>
        )}

        {activeTab === 'matchmaker' && (
          <>
            <MatchmakerCard>
              <MatchmakerTitle>🤝 FRIEND CONNECTOR</MatchmakerTitle>
              <MatchmakerLevel>Level 3 Connector • 450 pts to Level 4</MatchmakerLevel>
              
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
              
              <ManualIntroButton onClick={() => setShowManualIntro(true)}>
                ✏️ Manually Introduce Friends (2-4 people)
              </ManualIntroButton>
            </MatchmakerCard>

            <StatsCard>
              <StatsTitle>📊 YOUR MATCHMAKER STATS</StatsTitle>
              <StatsGrid>
                <StatItem>
                  <StatValue>12</StatValue>
                  <StatLabel>Introductions</StatLabel>
                </StatItem>
                <StatItem>
                  <StatValue>8</StatValue>
                  <StatLabel>Successful</StatLabel>
                </StatItem>
                <StatItem>
                  <StatValue>3</StatValue>
                  <StatLabel>Close Friends</StatLabel>
                </StatItem>
                <StatItem>
                  <StatValue>850</StatValue>
                  <StatLabel>Points Earned</StatLabel>
                </StatItem>
              </StatsGrid>
              <LeaderboardPosition>
                🏆 #2 on Weekly Leaderboard
              </LeaderboardPosition>
            </StatsCard>

            <BingoCard>
              <BingoTitle>🎯 FRIEND BINGO - WEEK 12</BingoTitle>
              <BingoGrid>
                {bingoItems.map((item, idx) => (
                  <BingoCell 
                    key={idx} 
                    $completed={item.completed}
                    $free={item.free}
                    onClick={() => handleBingoClick(idx)}
                  >
                    <BingoIcon>{item.completed ? '✅' : item.free ? '🌟' : item.icon}</BingoIcon>
                    <div style={{ fontSize: '8px' }}>{item.text}</div>
                  </BingoCell>
                ))}
              </BingoGrid>
              <BingoStatus>
                2 away from BINGO! • Prize: 500pts
              </BingoStatus>
            </BingoCard>
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