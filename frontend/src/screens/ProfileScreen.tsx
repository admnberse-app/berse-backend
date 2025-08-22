import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { useMessaging } from '../contexts/MessagingContext';
import { StatusBar } from '../components/StatusBar/StatusBar';
import { MainNav } from '../components/MainNav/MainNav';
import { GoogleFormsIntegration } from '../components/GoogleFormsIntegration';
import { RegistrationTracker } from '../components/RegistrationTracker';
import { ChatGroupManager } from '../components/ChatGroupManager';
import { calculateAge, formatDate } from '../utils/dateUtils';
import { ShareableProfileCard } from '../components/ShareableProfileCard';

// Connected Accounts Modal Styles
const ConnectedAccountsModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
`;

const ConnectedAccountsContent = styled.div`
  background: white;
  border-radius: 20px;
  padding: 24px;
  max-width: 400px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
`;

const ConnectedAccountsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const ConnectedAccountsTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #2fce98;
  margin: 0;
`;

const ConnectedAccountsClose = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  
  &:hover {
    background: #F0F0F0;
  }
`;

const AccountItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: #F8F9FA;
  border-radius: 12px;
  margin-bottom: 12px;
  border: 1px solid #E5E5E5;
`;

const AccountInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
`;

const AccountIcon = styled.div`
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #4285F4 0%, #34A853 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
`;

const AccountDetails = styled.div`
  flex: 1;
`;

const AccountName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 2px;
`;

const AccountStatus = styled.div`
  font-size: 12px;
  color: #666;
`;

const ConnectButton = styled.button<{ connected?: boolean }>`
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  ${({ connected }) => connected ? `
    background: #E8F5E9;
    color: #4CAF50;
    border: 1px solid #4CAF50;
    
    &:hover {
      background: #FFE5E5;
      color: #FF4444;
      border-color: #FF4444;
    }
  ` : `
    background: linear-gradient(135deg, #4285F4 0%, #34A853 100%);
    color: white;
    border: none;
    
    &:hover {
      transform: scale(1.05);
      box-shadow: 0 4px 12px rgba(66, 133, 244, 0.3);
    }
  `}
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #F9F3E3;
  max-width: 393px;
  margin: 0 auto;
  
  /* Page flip animation */
  animation: pageFlipIn 0.6s ease-out;
  transform-origin: left center;
  
  @keyframes pageFlipIn {
    0% {
      transform: perspective(600px) rotateY(-90deg);
      opacity: 0;
    }
    50% {
      opacity: 0.5;
    }
    100% {
      transform: perspective(600px) rotateY(0deg);
      opacity: 1;
    }
  }
`;

const Content = styled.div`
  flex: 1;
  padding: 16px 20px 100px 20px;
  overflow-y: auto;
`;

// BerseMatch-style Profile Card Components
const ProfileCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 14px;
  margin-bottom: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  border: 1px solid #e9ecef;
  position: relative;
`;

const ProfileHeader = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
  position: relative;
`;

const ProfileAvatar = styled.div<{ $editable?: boolean }>`
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
  cursor: ${({ $editable }) => $editable ? 'pointer' : 'default'};
  
  &:hover {
    ${({ $editable }) => $editable && `
      &::after {
        content: '📷';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        font-size: 16px;
      }
    `}
  }
`;

const ProfileInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const ProfileNameSection = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  width: 100%;
`;

const UserNameEdit = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const TopRightStack = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  position: absolute;
  right: 0;
  top: 0;
`;

const ProfileName = styled.h3<{ $editable?: boolean }>`
  margin: 0;
  font-size: 17px;
  font-weight: bold;
  color: #333;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  cursor: ${({ $editable }) => $editable ? 'pointer' : 'default'};
  
  ${({ $editable }) => $editable && `
    &:hover {
      background: rgba(0, 123, 255, 0.1);
      border-radius: 4px;
      padding: 2px 4px;
      margin: -2px -4px;
    }
  `}
`;

const ProfileMeta = styled.p<{ $editable?: boolean }>`
  margin: 0;
  font-size: 13px;
  color: #666;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  cursor: ${({ $editable }) => $editable ? 'pointer' : 'default'};
  
  ${({ $editable }) => $editable && `
    &:hover {
      background: rgba(0, 123, 255, 0.1);
      border-radius: 4px;
      padding: 2px 4px;
      margin: -2px -4px;
    }
  `}
`;

const RatingDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 14px;
  color: #FFD700;
  font-weight: 500;
`;

const LevelBadge = styled.div<{ $color: string }>`
  padding: 2px 8px;
  border-radius: 12px;
  background: ${({ $color }) => $color};
  color: white;
  font-size: 11px;
  font-weight: 600;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const PersonalityBadge = styled.div<{ $temperament: 'NT' | 'NF' | 'SJ' | 'SP'; $editable?: boolean }>`
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 500;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  cursor: ${({ $editable }) => $editable ? 'pointer' : 'default'};
  
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
  
  ${({ $editable }) => $editable && `
    &:hover {
      transform: scale(1.05);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
  `}
`;

const InterestsContainer = styled.div<{ $editable?: boolean }>`
  display: flex;
  flex-wrap: nowrap;
  gap: 4px;
  margin: 8px 0;
  overflow-x: auto;
  cursor: ${({ $editable }) => $editable ? 'pointer' : 'default'};
  
  &::-webkit-scrollbar {
    display: none;
  }
  
  ${({ $editable }) => $editable && `
    &:hover {
      background: rgba(0, 123, 255, 0.05);
      border-radius: 6px;
      padding: 4px;
      margin: 4px -4px;
    }
  `}
`;

const InterestTag = styled.span`
  background: #E3F2FD;
  color: #1976D2;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 500;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  border: 1px solid #BBDEFB;
  white-space: nowrap;
  flex-shrink: 0;
  height: 22px;
  display: flex;
  align-items: center;
`;

const BioSection = styled.p<{ $editable?: boolean }>`
  margin: 8px 0;
  font-size: 13px;
  color: #444;
  line-height: 1.4;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  cursor: ${({ $editable }) => $editable ? 'pointer' : 'default'};
  
  ${({ $editable }) => $editable && `
    &:hover {
      background: rgba(0, 123, 255, 0.05);
      border-radius: 6px;
      padding: 4px;
      margin: 4px -4px;
    }
  `}
`;

const CommunityBadgesContainer = styled.div<{ $editable?: boolean }>`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 8px 0;
  cursor: ${({ $editable }) => $editable ? 'pointer' : 'default'};
  
  ${({ $editable }) => $editable && `
    &:hover {
      background: rgba(0, 123, 255, 0.05);
      border-radius: 6px;
      padding: 4px;
      margin: 4px -4px;
    }
  `}
`;

const CommunityBadge = styled.div<{ $type: 'educational' | 'professional' | 'foundation' | 'alumni' }>`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 500;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
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
`;

const VerificationTick = styled.span`
  margin-left: 2px;
  color: #28A745;
  font-size: 10px;
  font-weight: bold;
`;

// Social Media Section
const SocialMediaSection = styled.div`
  background: #FAFAFA;
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 12px;
`;

const SocialMediaTitle = styled.div`
  font-size: 9px;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  text-align: center;
  margin-bottom: 8px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
`;

const SocialIconsContainer = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
`;

const SocialIcon = styled.div<{ $platform: 'instagram' | 'linkedin' | 'twitter' | 'whatsapp'; $editable?: boolean }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
  cursor: ${({ $editable }) => $editable ? 'pointer' : 'default'};
  transition: all 0.2s ease;
  position: relative;
  
  ${({ $platform }) => {
    switch ($platform) {
      case 'instagram':
        return `background: linear-gradient(45deg, #E4405F, #FCAF45);`;
      case 'linkedin':
        return `background: #0077B5;`;
      case 'twitter':
        return `background: #1DA1F2;`;
      case 'whatsapp':
        return `background: #25D366;`;
    }
  }}
  
  ${({ $editable }) => $editable && `
    &:hover {
      transform: scale(1.1);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      
      &::after {
        content: '✏️';
        position: absolute;
        top: -2px;
        right: -2px;
        width: 12px;
        height: 12px;
        background: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 8px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
      }
    }
  `}
`;

// Action Buttons
const ProfileActionsContainer = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
`;

const EditProfileButton = styled.button`
  flex: 1;
  background: #007BFF;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 500;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #0056b3;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
  }
  
  &:active {
    transform: scale(0.98);
  }
`;

const ShareProfileButton = styled.button`
  flex: 1;
  background: #2fce98;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 500;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #26b584;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(47, 206, 152, 0.3);
  }
  
  &:active {
    transform: scale(0.98);
  }
`;

const ActionButton = styled.div<{ $variant?: 'messages' | 'notifications' | 'vouchers' }>`
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 12px 14px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 44px;
  
  &:hover {
    background: #F8F9FA;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  &:active {
    transform: scale(0.98);
  }
`;

const ActionButtonLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #333;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
`;

const ActionButtonRight = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const UnreadBadge = styled.div<{ $count: number }>`
  background: #DC3545;
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: bold;
  min-width: 18px;
`;

const PointsBadge = styled.div`
  background: #FFA500;
  color: white;
  border-radius: 12px;
  padding: 2px 8px;
  font-size: 12px;
  font-weight: 500;
`;

// Profile Menu Components
const ProfileMenuSection = styled.div`
  background: white;
  border-radius: 16px;
  margin: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const ProfileMenuItem = styled.div`
  display: flex;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #F0F0F0;
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background-color: #F8F9FA;
  }
  
  &:active {
    background-color: #E9ECEF;
  }
`;

const MenuIcon = styled.div`
  font-size: 24px;
  margin-right: 16px;
  width: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const MenuContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const MenuTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 2px 0;
`;

const MenuSubtitle = styled.p`
  font-size: 12px;
  color: #666;
  margin: 0;
  line-height: 1.3;
`;

const MenuBadge = styled.span<{ $color: string }>`
  background: ${({ $color }) => $color};
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  margin-right: 12px;
  
  ${({ $color }) => $color === '#666' && `
    background: #F0F0F0;
    color: #666;
  `}
  
  ${({ $color }) => $color === '#FF9800' && `
    background: #FF9800;
    color: white;
  `}
`;

const MenuArrow = styled.div`
  font-size: 16px;
  color: #CCC;
  font-weight: bold;
`;

// Modal Components
const ModalOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: ${({ $isOpen }) => $isOpen ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const Modal = styled.div`
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
`;

const ModalHeader = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ModalTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
`;

const ModalCloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  color: #666;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: #333;
  }
`;

const ModalContent = styled.div`
  padding: 20px;
  max-height: 400px;
  overflow-y: auto;
`;

// Notification Components
const NotificationItem = styled.div<{ $type: 'trust' | 'review' | 'service' | 'event' | 'connection' }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 8px;
  background: ${({ $type }) => {
    switch ($type) {
      case 'trust': return '#E3F2FD';
      case 'review': return '#FFF8E1';
      case 'service': return '#FFF3E0';
      case 'event': return '#E8F5E8';
      case 'connection': return '#F3E5F5';
      default: return '#F8F9FA';
    }
  }};
`;

const NotificationIcon = styled.div<{ $type: 'trust' | 'review' | 'service' | 'event' | 'connection' }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ $type }) => {
    switch ($type) {
      case 'trust': return '#2196F3';
      case 'review': return '#FFD700';
      case 'service': return '#FF9800';
      case 'event': return '#4CAF50';
      case 'connection': return '#9C27B0';
      default: return '#666';
    }
  }};
  color: white;
  font-size: 14px;
`;

const NotificationContent = styled.div`
  flex: 1;
`;

const NotificationText = styled.div`
  font-size: 13px;
  color: #333;
  margin-bottom: 4px;
`;

const NotificationTime = styled.div`
  font-size: 11px;
  color: #666;
`;

const NotificationActions = styled.div`
  display: flex;
  gap: 6px;
`;

const NotificationButton = styled.button<{ $variant: 'accept' | 'decline' }>`
  padding: 4px 12px;
  border: 1px solid ${({ $variant }) => $variant === 'accept' ? '#28A745' : '#E5E5E5'};
  background: ${({ $variant }) => $variant === 'accept' ? '#28A745' : 'white'};
  color: ${({ $variant }) => $variant === 'accept' ? 'white' : '#666'};
  border-radius: 6px;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ $variant }) => $variant === 'accept' ? '#1e7e34' : '#F5F5F5'};
  }
`;

// Profile Editor Modal Components
const ProfileEditorModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: white;
  z-index: 2000;
  overflow-y: auto;
  max-width: 393px;
  margin: 0 auto;
`;

const EditorHeader = styled.div`
  background: #007BFF;
  color: white;
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 10;
`;

const EditorTitle = styled.h2`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
`;

const EditorHeaderButton = styled.button<{ $variant: 'cancel' | 'save' }>`
  background: ${({ $variant }) => $variant === 'save' ? '#28A745' : 'transparent'};
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ $variant }) => $variant === 'save' ? '#1e7e34' : 'rgba(255, 255, 255, 0.1)'};
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const EditorContent = styled.div`
  padding: 20px;
`;

const EditorSection = styled.div`
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e9ecef;
  
  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
  }
`;

const EditorSectionTitle = styled.h3`
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
`;

const EditorField = styled.div`
  margin-bottom: 16px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const EditorLabel = styled.label`
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #333;
`;

const EditorInput = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  font-size: 14px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #007BFF;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  }
  
  &.error {
    border-color: #DC3545;
  }
`;

const EditorTextarea = styled.textarea`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  font-size: 14px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  resize: vertical;
  min-height: 80px;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #007BFF;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  }
  
  &.error {
    border-color: #DC3545;
  }
`;

const EditorSelect = styled.select`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  font-size: 14px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background: white;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #007BFF;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  }
`;

const EditorSlider = styled.input`
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #e9ecef;
  outline: none;
  -webkit-appearance: none;
  
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #007BFF;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
  
  &::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #007BFF;
    cursor: pointer;
    border: none;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
`;

const SliderValue = styled.div`
  text-align: center;
  margin-top: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #007BFF;
`;

const ErrorMessage = styled.div`
  color: #DC3545;
  font-size: 12px;
  margin-top: 4px;
`;

const CharacterCounter = styled.div<{ $over?: boolean }>`
  font-size: 12px;
  color: ${({ $over }) => $over ? '#DC3545' : '#666'};
  text-align: right;
  margin-top: 4px;
`;

const TagSelector = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
`;

const TagOption = styled.button<{ $selected: boolean }>`
  padding: 6px 12px;
  border: 1px solid ${({ $selected }) => $selected ? '#007BFF' : '#e9ecef'};
  background: ${({ $selected }) => $selected ? '#007BFF' : 'white'};
  color: ${({ $selected }) => $selected ? 'white' : '#666'};
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #007BFF;
    background: ${({ $selected }) => $selected ? '#0056b3' : '#f8f9fa'};
  }
`;

const PhotoUploadSection = styled.div`
  text-align: center;
`;

const PhotoUploadButton = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 2px dashed #e9ecef;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
  
  &:hover {
    border-color: #007BFF;
    background: rgba(0, 123, 255, 0.05);
  }
`;


const PhotoUploadText = styled.div`
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
`;

const HiddenFileInput = styled.input`
  display: none;
`;

// Photo Cropper Components
const PhotoCropperModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  z-index: 2500;
  display: flex;
  flex-direction: column;
  max-width: 393px;
  margin: 0 auto;
`;

const CropperHeader = styled.div`
  background: #007BFF;
  color: white;
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CropperTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
`;

const CropperButton = styled.button<{ $variant: 'cancel' | 'done' }>`
  background: ${({ $variant }) => $variant === 'done' ? '#28A745' : 'transparent'};
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ $variant }) => $variant === 'done' ? '#1e7e34' : 'rgba(255, 255, 255, 0.1)'};
  }
`;

const CropperContent = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
  overflow: hidden;
`;

const CropperCanvas = styled.div`
  position: relative;
  max-width: 100%;
  max-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CropperImage = styled.img`
  max-width: 100%;
  max-height: 60vh;
  object-fit: contain;
`;


const CropperFrame = styled.div<{ $size: number; $x: number; $y: number }>`
  position: absolute;
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  left: ${({ $x }) => $x}px;
  top: ${({ $y }) => $y}px;
  border: 2px solid white;
  border-radius: 50%;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
  pointer-events: none;
`;

const CropperInstructions = styled.div`
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 12px 20px;
  text-align: center;
  font-size: 14px;
`;

const ZoomSlider = styled.input`
  width: 80%;
  margin: 16px auto;
  display: block;
  height: 6px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.3);
  outline: none;
  -webkit-appearance: none;
  
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: white;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }
  
  &::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: white;
    cursor: pointer;
    border: none;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }
`;

// Inline Editor Components
const InlineEditorOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: ${({ $isOpen }) => $isOpen ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 1500;
`;

const InlineEditorModal = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  width: 90%;
  max-width: 350px;
  max-height: 80vh;
  overflow-y: auto;
`;

const InlineEditorTitle = styled.h3`
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
`;

const InlineEditorButtons = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 16px;
`;

const InlineEditorButton = styled.button<{ $variant: 'primary' | 'secondary' }>`
  flex: 1;
  padding: 10px 16px;
  border: 1px solid ${({ $variant }) => $variant === 'primary' ? '#007BFF' : '#e9ecef'};
  background: ${({ $variant }) => $variant === 'primary' ? '#007BFF' : 'white'};
  color: ${({ $variant }) => $variant === 'primary' ? 'white' : '#666'};
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ $variant }) => $variant === 'primary' ? '#0056b3' : '#f8f9fa'};
  }
`;

// Messaging Components
const MessagingOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(245, 245, 220, 0.8);
  display: ${({ $isOpen }) => $isOpen ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
`;

const MessagingModal = styled.div`
  background: white;
  border-radius: 16px;
  width: 400px;
  height: 500px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
`;

const MessagingHeader = styled.div`
  background: #007BFF;
  color: white;
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
`;

const MessagingTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: bold;
`;

const MessagingCloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const MessagingContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

// Chat List Components
const ChatListContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const SearchBar = styled.div`
  padding: 16px;
  border-bottom: 1px solid #e9ecef;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px 16px;
  border: 1px solid #e9ecef;
  border-radius: 20px;
  font-size: 14px;
  outline: none;
  
  &:focus {
    border-color: #007BFF;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  }
`;

const ChatList = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const ChatItem = styled.div<{ $hasUnread?: boolean }>`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background 0.2s ease;
  height: 56px;
  
  &:hover {
    background: #f8f9fa;
  }
  
  ${({ $hasUnread }) => $hasUnread && `
    background: rgba(0, 123, 255, 0.05);
    border-left: 3px solid #007BFF;
  `}
`;

const ChatAvatar = styled.div<{ $isGroup?: boolean; $isOnline?: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: ${({ $isGroup }) => $isGroup ? '8px' : '50%'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 16px;
  color: white;
  margin-right: 12px;
  position: relative;
  flex-shrink: 0;
  
  ${({ $isOnline }) => $isOnline && `
    &::after {
      content: '';
      position: absolute;
      bottom: 2px;
      right: 2px;
      width: 10px;
      height: 10px;
      background: #28A745;
      border: 2px solid white;
      border-radius: 50%;
    }
  `}
`;

const ChatInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ChatName = styled.div`
  font-weight: 600;
  font-size: 14px;
  color: #333;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ChatLastMessage = styled.div<{ $unread?: boolean }>`
  font-size: 12px;
  color: ${({ $unread }) => $unread ? '#007BFF' : '#666'};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: ${({ $unread }) => $unread ? '600' : 'normal'};
`;

const ChatMeta = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
`;

const ChatTime = styled.div`
  font-size: 11px;
  color: #666;
`;

const UnreadBadgeChat = styled.div`
  background: #007BFF;
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: bold;
  min-width: 18px;
`;

const NewChatButton = styled.button`
  position: absolute;
  bottom: 20px;
  right: 20px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #007BFF;
  color: white;
  border: none;
  font-size: 24px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
  transition: all 0.2s ease;
  
  &:hover {
    background: #0056b3;
    transform: scale(1.05);
  }
`;

// Individual Chat Components
const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const ChatHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #e9ecef;
  background: #f8f9fa;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 8px;
  margin-right: 8px;
  border-radius: 50%;
  transition: background 0.2s ease;
  
  &:hover {
    background: rgba(0, 0, 0, 0.1);
  }
`;

const ChatHeaderInfo = styled.div`
  flex: 1;
  margin-left: 8px;
`;

const ChatHeaderName = styled.div`
  font-weight: 600;
  font-size: 16px;
  color: #333;
`;

const ChatHeaderStatus = styled.div`
  font-size: 12px;
  color: #666;
`;

const ChatOptionsButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: background 0.2s ease;
  
  &:hover {
    background: rgba(0, 0, 0, 0.1);
  }
`;

const ChatMessages = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: #f9f9f9;
`;

const MessageGroup = styled.div<{ $isSent: boolean }>`
  display: flex;
  justify-content: ${({ $isSent }) => $isSent ? 'flex-end' : 'flex-start'};
  margin-bottom: 12px;
`;

const MessageBubble = styled.div<{ $isSent: boolean }>`
  max-width: 70%;
  padding: 10px 14px;
  border-radius: 18px;
  background: ${({ $isSent }) => $isSent ? '#007BFF' : '#F1F3F4'};
  color: ${({ $isSent }) => $isSent ? 'white' : '#333'};
  font-size: 14px;
  line-height: 1.4;
  position: relative;
  
  ${({ $isSent }) => $isSent ? `
    border-bottom-right-radius: 4px;
  ` : `
    border-bottom-left-radius: 4px;
  `}
`;

const MessageTimestamp = styled.div<{ $isSent: boolean }>`
  font-size: 11px;
  color: ${({ $isSent }) => $isSent ? 'rgba(255, 255, 255, 0.7)' : '#666'};
  margin-top: 4px;
  text-align: ${({ $isSent }) => $isSent ? 'right' : 'left'};
`;

const MessageStatus = styled.div`
  font-size: 10px;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 2px;
  text-align: right;
`;

const ChatInputContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-top: 1px solid #e9ecef;
  background: white;
`;

const ChatInput = styled.input`
  flex: 1;
  padding: 10px 16px;
  border: 1px solid #e9ecef;
  border-radius: 20px;
  font-size: 14px;
  outline: none;
  margin-right: 8px;
  
  &:focus {
    border-color: #007BFF;
  }
`;

const SendButton = styled.button<{ $disabled?: boolean }>`
  background: ${({ $disabled }) => $disabled ? '#e9ecef' : '#007BFF'};
  color: ${({ $disabled }) => $disabled ? '#999' : 'white'};
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: ${({ $disabled }) => $disabled ? 'not-allowed' : 'pointer'};
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;
  
  &:hover {
    background: ${({ $disabled }) => $disabled ? '#e9ecef' : '#0056b3'};
  }
`;

// Group Creator Components
const GroupCreatorModal = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: white;
  z-index: 10;
  display: flex;
  flex-direction: column;
`;

const GroupCreatorHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e9ecef;
`;

const GroupCreatorTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  flex: 1;
  text-align: center;
`;

const GroupCreatorContent = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
`;

const GroupNameInput = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  font-size: 16px;
  margin-bottom: 20px;
  
  &:focus {
    outline: none;
    border-color: #007BFF;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  }
`;

const ContactsList = styled.div`
  display: flex;
  flex-direction: column;
`;

const ContactItem = styled.div<{ $selected?: boolean }>`
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s ease;
  background: ${({ $selected }) => $selected ? 'rgba(0, 123, 255, 0.1)' : 'transparent'};
  
  &:hover {
    background: ${({ $selected }) => $selected ? 'rgba(0, 123, 255, 0.15)' : '#f8f9fa'};
  }
`;

const ContactCheckbox = styled.div<{ $checked?: boolean }>`
  width: 20px;
  height: 20px;
  border: 2px solid ${({ $checked }) => $checked ? '#007BFF' : '#e9ecef'};
  border-radius: 4px;
  background: ${({ $checked }) => $checked ? '#007BFF' : 'white'};
  margin-right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
  transition: all 0.2s ease;
`;

const CreateGroupButton = styled.button<{ $disabled?: boolean }>`
  width: 100%;
  padding: 12px;
  background: ${({ $disabled }) => $disabled ? '#e9ecef' : '#007BFF'};
  color: ${({ $disabled }) => $disabled ? '#999' : 'white'};
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: ${({ $disabled }) => $disabled ? 'not-allowed' : 'pointer'};
  margin-top: 20px;
  transition: background 0.2s ease;
  
  &:hover {
    background: ${({ $disabled }) => $disabled ? '#e9ecef' : '#0056b3'};
  }
`;

// Comprehensive Services Editor Components
const ServicesEditorOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(245, 245, 220, 0.8);
  display: ${({ $isOpen }) => $isOpen ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 2100;
  padding: 20px;
`;

const ServicesEditorModal = styled.div`
  background: white;
  border-radius: 16px;
  width: 500px;
  height: 600px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
`;

const ServicesEditorHeader = styled.div`
  background: #007BFF;
  color: white;
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
`;

const ServicesEditorTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: bold;
`;

const ServicesEditorContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
`;

const ServiceCategorySelector = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
`;

const ServiceCategoryButton = styled.button<{ $selected: boolean; $color: string }>`
  padding: 8px 16px;
  border: 2px solid ${({ $selected, $color }) => $selected ? $color : '#e9ecef'};
  background: ${({ $selected, $color }) => $selected ? $color : 'white'};
  color: ${({ $selected }) => $selected ? 'white' : '#666'};
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  
  &:hover {
    border-color: ${({ $color }) => $color};
    background: ${({ $selected, $color }) => $selected ? $color : 'rgba(0, 123, 255, 0.1)'};
  }
`;

const ServiceDetailsForm = styled.div`
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 20px;
  background: #f8f9fa;
`;

const ServiceDetailSection = styled.div`
  margin-bottom: 20px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const ServiceDetailTitle = styled.h4`
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
`;

const ServiceFormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 16px;
`;

const ServiceFormField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const ServiceFormLabel = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #333;
`;

const ServiceFormInput = styled.input`
  padding: 10px 12px;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #007BFF;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  }
`;

const ServiceFormTextarea = styled.textarea`
  padding: 10px 12px;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  font-size: 14px;
  min-height: 80px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #007BFF;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  }
`;

const ServiceFormSelect = styled.select`
  padding: 10px 12px;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  
  &:focus {
    outline: none;
    border-color: #007BFF;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  }
`;

const SkillTagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
`;

const SkillTag = styled.span<{ $selected: boolean }>`
  padding: 4px 8px;
  border: 1px solid ${({ $selected }) => $selected ? '#007BFF' : '#e9ecef'};
  background: ${({ $selected }) => $selected ? '#007BFF' : 'white'};
  color: ${({ $selected }) => $selected ? 'white' : '#666'};
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #007BFF;
    background: ${({ $selected }) => $selected ? '#0056b3' : '#f8f9fa'};
  }
`;

const PortfolioUploadSection = styled.div`
  border: 2px dashed #e9ecef;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  background: #fafafa;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #007BFF;
    background: rgba(0, 123, 255, 0.05);
  }
`;

const PortfolioUploadIcon = styled.div`
  font-size: 32px;
  margin-bottom: 8px;
  color: #666;
`;

const PortfolioUploadText = styled.div`
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
`;

const PortfolioUploadSubtext = styled.div`
  font-size: 12px;
  color: #999;
`;

const ServicesEditorButtons = styled.div`
  display: flex;
  gap: 12px;
  padding: 20px;
  border-top: 1px solid #e9ecef;
  background: white;
`;

const ServicesEditorButton = styled.button<{ $variant: 'primary' | 'secondary' }>`
  flex: 1;
  padding: 12px 16px;
  border: 1px solid ${({ $variant }) => $variant === 'primary' ? '#007BFF' : '#e9ecef'};
  background: ${({ $variant }) => $variant === 'primary' ? '#007BFF' : 'white'};
  color: ${({ $variant }) => $variant === 'primary' ? 'white' : '#666'};
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ $variant }) => $variant === 'primary' ? '#0056b3' : '#f8f9fa'};
  }
`;

// Events Organization Components
const EventsOrganizerSection = styled.div`
  border-top: 1px solid #e9ecef;
  padding-top: 20px;
  margin-top: 20px;
`;

const EventsOrganizerTitle = styled.h3`
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
`;

const OrganizationRoleCard = styled.div<{ $verified: boolean }>`
  background: ${({ $verified }) => $verified ? '#E8F5E8' : '#FFF3E0'};
  border: 1px solid ${({ $verified }) => $verified ? '#C8E6C9' : '#FFCC02'};
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
`;

const OrganizationName = styled.div`
  font-weight: 600;
  font-size: 14px;
  color: #333;
  margin-bottom: 4px;
`;

const OrganizationRole = styled.div`
  font-size: 12px;
  color: #666;
`;

const DelegationStatus = styled.div<{ $status: 'approved' | 'pending' | 'none' }>`
  font-size: 11px;
  font-weight: 500;
  color: ${({ $status }) => 
    $status === 'approved' ? '#28A745' :
    $status === 'pending' ? '#FF9800' : '#666'
  };
  margin-top: 4px;
`;

const CreateEventButton = styled.button`
  width: 100%;
  padding: 12px;
  background: #28A745;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 12px;
  
  &:hover {
    background: #1e7e34;
  }
`;

// Community Management Components
const CommunityDashboardOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(245, 245, 220, 0.8);
  display: ${({ $isOpen }) => $isOpen ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
`;

const CommunityDashboardModal = styled.div`
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  height: 90%;
  max-height: 600px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
`;

const CommunityDashboardHeader = styled.div`
  background: #007BFF;
  color: white;
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
`;

const CommunityDashboardTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: bold;
`;

const CommunityTabsContainer = styled.div`
  display: flex;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  overflow-x: auto;
`;

const CommunityTab = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 12px 8px;
  border: none;
  background: ${({ $active }) => $active ? '#007BFF' : 'transparent'};
  color: ${({ $active }) => $active ? 'white' : '#666'};
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  min-width: 80px;
  
  &:hover {
    background: ${({ $active }) => $active ? '#0056b3' : 'rgba(0, 123, 255, 0.1)'};
  }
`;

const CommunityContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
`;

const CommunityList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const CommunityCard = styled.div<{ $verified?: boolean }>`
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
  }
  
  ${({ $verified }) => $verified && `
    border-left: 4px solid #28A745;
  `}
`;

const CommunityHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
`;

const CommunityAvatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #007BFF, #0056b3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  font-weight: bold;
  flex-shrink: 0;
`;

const CommunityInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const CommunityName = styled.div`
  font-weight: 600;
  font-size: 16px;
  color: #333;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CommunityRole = styled.div`
  font-size: 12px;
  color: #666;
  margin-bottom: 2px;
`;

const CommunityMeta = styled.div`
  font-size: 11px;
  color: #999;
`;

const CommunityActions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;
`;

const CommunityActionButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 6px 12px;
  border: 1px solid ${({ $variant }) => $variant === 'primary' ? '#007BFF' : '#e9ecef'};
  background: ${({ $variant }) => $variant === 'primary' ? '#007BFF' : 'white'};
  color: ${({ $variant }) => $variant === 'primary' ? 'white' : '#666'};
  border-radius: 6px;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ $variant }) => $variant === 'primary' ? '#0056b3' : '#f8f9fa'};
  }
`;

const VerificationBadge = styled.span<{ $verified: boolean }>`
  display: inline-flex;
  align-items: center;
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 600;
  background: ${({ $verified }) => $verified ? '#E8F5E8' : '#FFF3E0'};
  color: ${({ $verified }) => $verified ? '#28A745' : '#FF9800'};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #666;
`;

const EmptyStateIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
`;

const EmptyStateTitle = styled.h4`
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #333;
`;

const EmptyStateSubtitle = styled.p`
  margin: 0 0 20px 0;
  font-size: 14px;
  color: #666;
`;

const EmptyStateButton = styled.button`
  background: #007BFF;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #0056b3;
  }
`;

// Event Management Components
const EventManagementSection = styled.div`
  margin-bottom: 24px;
`;

const CommunityManagementSection = styled.div`
  margin-top: 24px;
`;

const EventSectionTitle = styled.h4`
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  padding-left: 8px;
  border-left: 4px solid #007BFF;
`;

const CreateEventCard = styled.div`
  background: linear-gradient(135deg, #28A745, #20C997);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
  }
`;

const CreateEventIcon = styled.div`
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
`;

const CreateEventContent = styled.div`
  flex: 1;
`;

const CreateEventTitle = styled.div`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 2px;
`;

const CreateEventSubtitle = styled.div`
  font-size: 12px;
  opacity: 0.9;
`;

const CreateEventActionButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const EventsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const EventCard = styled.div`
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 16px;
  transition: all 0.2s ease;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
  }
`;

const EventHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const EventStatus = styled.div<{ $status: 'active' | 'draft' | 'completed' }>`
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  background: ${({ $status }) => {
    switch ($status) {
      case 'active': return '#E8F5E8';
      case 'draft': return '#FFF8E1';
      case 'completed': return '#F3E5F5';
      default: return '#F8F9FA';
    }
  }};
  color: ${({ $status }) => {
    switch ($status) {
      case 'active': return '#28A745';
      case 'draft': return '#FF8F00';
      case 'completed': return '#7B1FA2';
      default: return '#666';
    }
  }};
`;

const EventDate = styled.div`
  font-size: 12px;
  color: #666;
  font-weight: 500;
`;

const EventTitle = styled.h5`
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
`;

const EventStats = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
`;

const EventStat = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const EventStatLabel = styled.div`
  font-size: 10px;
  color: #999;
  text-transform: uppercase;
  font-weight: 500;
`;

const EventStatValue = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: #333;
`;

const EventActions = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
`;

const EventActionButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 6px 10px;
  border: 1px solid ${({ $variant }) => $variant === 'primary' ? '#007BFF' : '#e9ecef'};
  background: ${({ $variant }) => $variant === 'primary' ? '#007BFF' : 'white'};
  color: ${({ $variant }) => $variant === 'primary' ? 'white' : '#666'};
  border-radius: 6px;
  font-size: 10px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ $variant }) => $variant === 'primary' ? '#0056b3' : '#f8f9fa'};
  }
`;

// Enhanced Messaging Components with Tabs
const MessagingTabsContainer = styled.div`
  display: flex;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
`;

const MessagingTabButton = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 12px;
  border: none;
  background: ${({ $active }) => $active ? '#007BFF' : 'transparent'};
  color: ${({ $active }) => $active ? 'white' : '#666'};
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ $active }) => $active ? '#0056b3' : 'rgba(0, 123, 255, 0.1)'};
  }
`;

const ContextBanner = styled.div<{ $type: string }>`
  background: ${({ $type }) => 
    $type === 'event' ? '#E3F2FD' :
    $type === 'service' ? '#F3E5F5' :
    $type === 'community' ? '#E8F5E8' : '#F8F9FA'
  };
  padding: 8px 12px;
  border-bottom: 1px solid #e9ecef;
  font-size: 12px;
  color: #666;
  text-align: center;
`;

const CommunityDiscoverySection = styled.div`
  margin-bottom: 20px;
`;

// Main Profile Tab Navigation Components
const ProfileTabsContainer = styled.div`
  display: flex;
  background: white;
  border-bottom: 2px solid #f0f0f0;
  margin: 0 -20px 20px -20px;
  padding: 0 20px;
`;

const ProfileTabButton = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 16px 8px;
  border: none;
  background: transparent;
  color: ${({ $active }) => $active ? '#2fce98' : '#666'};
  font-size: 14px;
  font-weight: ${({ $active }) => $active ? '600' : '500'};
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: ${({ $active }) => $active ? '3px solid #2fce98' : '3px solid transparent'};
  position: relative;
  
  &:hover {
    color: #2fce98;
    background: rgba(45, 95, 79, 0.05);
  }
`;

// My Events Section Components
const MyEventsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const EventsViewToggle = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
`;

const ViewToggleButton = styled.button<{ $active: boolean }>`
  padding: 8px 16px;
  border: 1px solid ${({ $active }) => $active ? '#2fce98' : '#e9ecef'};
  background: ${({ $active }) => $active ? '#2fce98' : 'white'};
  color: ${({ $active }) => $active ? 'white' : '#666'};
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ $active }) => $active ? '#1F4A3A' : '#f5f5f5'};
  }
`;

const EventsCalendarView = styled.div`
  background: white;
  border-radius: 12px;
  padding: 16px;
  border: 1px solid #e9ecef;
`;

const CalendarHeader = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 16px;
`;

const CalendarMonth = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #2fce98;
`;

const CalendarGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
`;

const CalendarDay = styled.div<{ $hasEvent?: boolean; $today?: boolean }>`
  width: calc((100% - 24px) / 7);
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  ${({ $today }) => $today && `
    background: #2fce98;
    color: white;
    font-weight: bold;
  `}
  
  ${({ $hasEvent }) => $hasEvent && !$today && `
    background: linear-gradient(135deg, #FFE0B2, #FFF3E0);
    color: #F57C00;
    font-weight: 600;
    border: 1px solid #FFB74D;
  `}
  
  &:hover {
    background: ${({ $today, $hasEvent }) => 
      $today ? '#1F4A3A' : 
      $hasEvent ? '#FFD54F' : '#f5f5f5'
    };
  }
`;

const MyEventsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const MyEventCard = styled.div<{ $status: 'upcoming' | 'completed' | 'cancelled' }>`
  background: white;
  border-radius: 12px;
  padding: 16px;
  border: 1px solid #e9ecef;
  transition: all 0.2s ease;
  position: relative;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
  }
  
  ${({ $status }) => $status === 'completed' && `
    opacity: 0.7;
    background: #f8f9fa;
  `}
  
  ${({ $status }) => $status === 'cancelled' && `
    opacity: 0.6;
    background: #fff5f5;
    border-color: #fed7d7;
  `}
`;

const MyEventHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
`;

const MyEventTitle = styled.h4`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #2fce98;
  flex: 1;
`;

const MyEventStatusBadge = styled.div<{ $status: 'upcoming' | 'completed' | 'cancelled' }>`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  
  ${({ $status }) => {
    switch ($status) {
      case 'upcoming':
        return `background: #E8F5E8; color: #2E7D32; border: 1px solid #C8E6C9;`;
      case 'completed':
        return `background: #F3E5F5; color: #7B1FA2; border: 1px solid #E1BEE7;`;
      case 'cancelled':
        return `background: #FFEBEE; color: #C62828; border: 1px solid #FFCDD2;`;
      default:
        return `background: #F5F5F5; color: #666; border: 1px solid #E0E0E0;`;
    }
  }}
`;

const MyEventInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 12px;
`;

const MyEventDate = styled.div`
  font-size: 12px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const MyEventLocation = styled.div`
  font-size: 12px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const MyEventGroups = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
`;

const GroupAssignment = styled.div<{ $color: string }>`
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 600;
  background: ${({ $color }) => $color};
  color: white;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const MyEventActions = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const MyEventActionButton = styled.button<{ $variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: 8px 12px;
  border: 1px solid ${({ $variant }) => 
    $variant === 'primary' ? '#2fce98' : 
    $variant === 'danger' ? '#dc3545' : '#e9ecef'
  };
  background: ${({ $variant }) => 
    $variant === 'primary' ? '#2fce98' : 
    $variant === 'danger' ? '#dc3545' : 'white'
  };
  color: ${({ $variant }) => 
    $variant === 'primary' || $variant === 'danger' ? 'white' : '#666'
  };
  border-radius: 6px;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ $variant }) => 
      $variant === 'primary' ? '#1F4A3A' : 
      $variant === 'danger' ? '#c82333' : '#f8f9fa'
    };
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const EventsStatsSection = styled.div`
  background: linear-gradient(135deg, #2fce98, #4A90A4);
  color: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
`;

const EventsStatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
`;

const EventsStat = styled.div`
  text-align: center;
`;

const EventsStatValue = styled.div`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 4px;
`;

const EventsStatLabel = styled.div`
  font-size: 11px;
  opacity: 0.9;
  text-transform: uppercase;
  font-weight: 500;
`;

// My Events Modal Components
const MyEventsModal = styled.div`
  background: white;
  border-radius: 20px;
  padding: 0;
  margin: 0 auto;
  max-width: 380px;
  width: 100%;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
`;

const MyEventsModalHeader = styled.div`
  background: linear-gradient(135deg, #2fce98, #4A90A4);
  color: white;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const MyEventsModalTitle = styled.h2`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
`;

const CloseButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const EventFilterTabs = styled.div`
  display: flex;
  gap: 8px;
  margin: 16px 20px;
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 12px;
`;

const FilterTab = styled.button<{ $active: boolean }>`
  background: ${({ $active }) => $active ? '#2fce98' : 'transparent'};
  color: ${({ $active }) => $active ? 'white' : '#666'};
  border: 1px solid ${({ $active }) => $active ? '#2fce98' : '#ddd'};
  padding: 8px 16px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  flex: 1;
  text-align: center;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ $active }) => $active ? '#1F4A3A' : '#f5f5f5'};
  }
`;

const EventsContent = styled.div`
  padding: 0 20px 20px;
  max-height: 60vh;
  overflow-y: auto;
`;

const UserEventCard = styled.div`
  display: flex;
  gap: 12px;
  padding: 16px;
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  margin-bottom: 12px;
  background: #fafafa;
  transition: all 0.2s ease;
  
  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
  }
`;

const EventIcon = styled.div`
  font-size: 24px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #2fce98, #4A90A4);
  border-radius: 50%;
  color: white;
  flex-shrink: 0;
`;

const EventDetails = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const UserEventTitle = styled.h4`
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #2fce98;
`;

const UserEventMeta = styled.div`
  font-size: 11px;
  color: #666;
  line-height: 1.4;
`;

const UserEventStatus = styled.div`
  margin: 4px 0;
`;

const StatusBadge = styled.span<{ $status: string }>`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
  background: ${({ $status }) => 
    $status === 'upcoming' ? '#E3F2FD' : 
    $status === 'completed' ? '#E8F5E8' : '#FFEBEE'
  };
  color: ${({ $status }) => 
    $status === 'upcoming' ? '#1976D2' : 
    $status === 'completed' ? '#2E7D32' : '#C62828'
  };
`;

const GroupInfo = styled.div`
  margin-top: 8px;
  padding: 8px;
  background: #e8f4f0;
  border-radius: 8px;
`;

const GroupDetail = styled.div`
  font-size: 11px;
  color: #2fce98;
  font-weight: 500;
  margin-bottom: 2px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const UserEventActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: flex-end;
`;

const ModalActionButton = styled.button`
  background: #2fce98;
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #1F4A3A;
  }
`;

const MyEventsEmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #666;
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
`;

const EmptyTitle = styled.h3`
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #2fce98;
`;

const EmptyMessage = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 1.4;
`;

// Event Details Modal Components
const EventDetailsModal = styled.div`
  background: white;
  border-radius: 20px;
  padding: 0;
  margin: 0 auto;
  max-width: 400px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
`;

const EventDetailsHeader = styled.div`
  background: linear-gradient(135deg, #2fce98, #4A90A4);
  color: white;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const EventDetailsBackButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const EventDetailsTitle = styled.h2`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  text-align: center;
  flex: 1;
`;

const EventDetailsContent = styled.div`
  padding: 20px;
  max-height: 70vh;
  overflow-y: auto;
`;

const EventSection = styled.div`
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
  }
`;

const EventDetailsSectionTitle = styled.h3`
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: #2fce98;
`;

const EventInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const EventInfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
`;

const EventInfoLabel = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #666;
  min-width: 100px;
`;

const EventInfoValue = styled.div`
  font-size: 14px;
  color: #333;
  flex: 1;
  text-align: right;
`;

const EventDescription = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
  color: #333;
`;

const QRCodeSection = styled.div`
  text-align: center;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 12px;
`;

const QRCodeContainer = styled.div`
  width: 160px;
  height: 160px;
  background: white;
  border: 2px solid #ddd;
  border-radius: 12px;
  margin: 0 auto 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

const QRCanvas = styled.canvas`
  max-width: 100%;
  max-height: 100%;
  border-radius: 8px;
`;

const QRInstructions = styled.div`
  font-size: 12px;
  color: #666;
  line-height: 1.4;
`;

const GroupAssignments = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const GroupAssignmentCard = styled.div`
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 12px;
  text-align: center;
`;

const GroupAssignmentHeader = styled.div`
  font-size: 12px;
  font-weight: 500;
  color: #666;
  margin-bottom: 4px;
`;

const GroupAssignmentValue = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #2fce98;
`;

const GroupNote = styled.div`
  font-size: 11px;
  color: #666;
  text-align: center;
  margin-top: 8px;
  padding: 8px;
  background: #e8f4fd;
  border-radius: 6px;
`;

const FeedbackSection = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
`;

const FeedbackRating = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 12px;
`;

const FeedbackStar = styled.span<{ $filled: boolean }>`
  font-size: 18px;
  color: ${({ $filled }) => $filled ? '#FFD700' : '#ddd'};
`;

const FeedbackRatingText = styled.span`
  font-size: 14px;
  color: #666;
  margin-left: 8px;
`;

const FeedbackComment = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 1.4;
  color: #333;
  font-style: italic;
`;

const CancellationNotice = styled.div`
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 8px;
  padding: 12px;
  font-size: 14px;
  color: #856404;
`;

const EventActionsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
`;

const EventDetailsActionButton = styled.button<{ $primary?: boolean; $danger?: boolean }>`
  background: ${({ $primary, $danger }) => 
    $danger ? '#DC3545' : 
    $primary ? '#28A745' : 
    'white'};
  color: ${({ $primary, $danger }) => 
    $danger || $primary ? 'white' : '#666'};
  border: 1px solid ${({ $primary, $danger }) => 
    $danger ? '#DC3545' : 
    $primary ? '#28A745' : 
    '#e9ecef'};
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  &:hover {
    background: ${({ $primary, $danger }) => 
      $danger ? '#C82333' : 
      $primary ? '#218838' : 
      '#f8f9fa'};
    transform: translateY(-1px);
  }
`;

// Admin Event Management Modal Components
const AdminEventModal = styled.div`
  background: white;
  border-radius: 20px;
  padding: 0;
  margin: 0 auto;
  max-width: 480px;
  width: 100%;
  max-height: 85vh;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
`;

const AdminEventModalHeader = styled.div`
  background: linear-gradient(135deg, #DC3545, #C82333);
  color: white;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const AdminEventModalTitle = styled.h2`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
`;

const AdminContent = styled.div`
  padding: 20px;
  max-height: 70vh;
  overflow-y: auto;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  
  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #333;
  }
`;

const AdminCreateEventButton = styled.button`
  background: #28A745;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #218838;
  }
`;

const AdminEventCard = styled.div`
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  transition: all 0.2s ease;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
  }
`;

const AdminEventHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

const AdminEventTitle = styled.h4`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  flex: 1;
`;

const AdminEventStatus = styled.div<{ $status: 'active' | 'draft' | 'completed' }>`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  
  ${({ $status }) => {
    switch ($status) {
      case 'active':
        return `background: #E8F5E8; color: #2E7D32; border: 1px solid #C8E6C9;`;
      case 'draft':
        return `background: #FFF8E1; color: #F57C00; border: 1px solid #FFCC02;`;
      case 'completed':
        return `background: #F3E5F5; color: #7B1FA2; border: 1px solid #E1BEE7;`;
      default:
        return `background: #F5F5F5; color: #666; border: 1px solid #E0E0E0;`;
    }
  }}
`;

const AdminEventStats = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 12px;
`;

const StatCard = styled.div`
  text-align: center;
  padding: 8px;
  background: #f8f9fa;
  border-radius: 8px;
`;

const StatNumber = styled.div`
  font-size: 16px;
  font-weight: bold;
  color: #2fce98;
  margin-bottom: 2px;
`;

const StatLabel = styled.div`
  font-size: 10px;
  color: #666;
  text-transform: uppercase;
  font-weight: 500;
`;

const AdminEventActions = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const AdminActionButton = styled.button`
  background: #2fce98;
  color: white;
  border: none;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #1F4A3A;
  }
`;

// BerseMukha Management Modal Components
const BerseMukhaModal = styled.div`
  background: white;
  border-radius: 20px;
  padding: 0;
  margin: 0 auto;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
`;

const BerseMukhaModalHeader = styled.div`
  background: linear-gradient(135deg, #2fce98, #4A90A4);
  color: white;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const BerseMukhaBackButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const BerseMukhaModalTitle = styled.h2`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  text-align: center;
  flex: 1;
`;

const BerseMukhaTabNavigation = styled.div`
  display: flex;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
`;

const BerseMukhaTabButton = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 12px 8px;
  border: none;
  background: ${({ $active }) => $active ? '#2fce98' : 'transparent'};
  color: ${({ $active }) => $active ? 'white' : '#666'};
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: ${({ $active }) => $active ? '2px solid #2fce98' : '2px solid transparent'};
  
  &:hover {
    background: ${({ $active }) => $active ? '#2fce98' : '#f0f0f0'};
  }
`;

const BerseMukhaContent = styled.div`
  padding: 20px;
  max-height: 75vh;
  overflow-y: auto;
`;

// Check-in Tab Components
const QRSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 24px;
`;

const BerseMukhaQRContainer = styled.div`
  text-align: center;
  padding: 20px;
  border: 2px dashed #ddd;
  border-radius: 12px;
  background: #fafafa;
  
  h3 {
    margin: 0 0 16px 0;
    font-size: 16px;
    color: #2fce98;
  }
`;

const QRCodeDisplay = styled.div`
  display: flex;
  justify-content: center;
  margin: 16px 0;
  padding: 16px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e9ecef;
`;

const QRInfo = styled.p`
  margin: 12px 0 0 0;
  font-size: 12px;
  color: #666;
  line-height: 1.4;
`;

const RegenerateQRButton = styled.button`
  background: #4A90A4;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  margin-top: 12px;
  transition: all 0.2s ease;
  
  &:hover {
    background: #357A8A;
  }
`;

const QRScannerSection = styled.div`
  text-align: center;
  padding: 20px;
  border: 2px solid #2fce98;
  border-radius: 12px;
  background: linear-gradient(135deg, #E8F4F0, #F0F8F5);
  
  h3 {
    margin: 0 0 16px 0;
    font-size: 16px;
    color: #2fce98;
  }
`;

const QRScanButton = styled.button`
  background: #2fce98;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #1F4A3A;
  }
`;

const AttendanceList = styled.div`
  margin-top: 24px;
`;

const AttendanceHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  
  h3 {
    margin: 0;
    font-size: 16px;
    color: #2fce98;
  }
`;

const AttendanceSearchInput = styled.input`
  padding: 8px 12px;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  font-size: 12px;
  width: 200px;
  
  &:focus {
    outline: none;
    border-color: #2fce98;
  }
`;

const ParticipantsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 300px;
  overflow-y: auto;
`;

const ParticipantItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
`;

const ParticipantInfo = styled.div`
  flex: 1;
`;

const ParticipantName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 2px;
`;

const ParticipantDetails = styled.div`
  font-size: 11px;
  color: #666;
`;

const CheckInStatus = styled.div`
  display: flex;
  align-items: center;
`;

const CheckInButton = styled.button`
  background: #28A745;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #218838;
  }
`;

// Groups Tab Components
const GroupManagementContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const GroupManagementHeader = styled.div`
  text-align: center;
  
  h3 {
    margin: 0;
    font-size: 18px;
    color: #2fce98;
  }
`;

const SessionTabs = styled.div`
  display: flex;
  gap: 8px;
  justify-content: center;
`;

const SessionTab = styled.button<{ $active: boolean }>`
  padding: 8px 16px;
  border: 1px solid ${({ $active }) => $active ? '#2fce98' : '#e9ecef'};
  background: ${({ $active }) => $active ? '#2fce98' : 'white'};
  color: ${({ $active }) => $active ? 'white' : '#666'};
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ $active }) => $active ? '#1F4A3A' : '#f5f5f5'};
  }
`;

const DiversityPreferences = styled.div`
  background: #f8f9fa;
  padding: 16px;
  border-radius: 12px;
  
  h4 {
    margin: 0 0 16px 0;
    font-size: 14px;
    color: #2fce98;
  }
`;

const PreferenceSlider = styled.div`
  margin-bottom: 16px;
  
  input[type="range"] {
    width: 100%;
    margin: 8px 0;
    accent-color: #2fce98;
  }
`;

const SliderLabel = styled.div`
  font-size: 12px;
  color: #333;
  font-weight: 500;
  margin-bottom: 4px;
`;

const GroupingActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const GenerateGroupsButton = styled.button`
  background: linear-gradient(135deg, #2fce98, #4A90A4);
  color: white;
  border: none;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: linear-gradient(135deg, #1F4A3A, #357A8A);
  }
`;

const RegenerateButton = styled.button`
  background: #FFC107;
  color: #212529;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #E0A901;
  }
`;

const GeneratedGroups = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 12px;
  margin-top: 16px;
`;

const GroupCard = styled.div`
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 12px;
  background: white;
`;

const GroupHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const GroupIdentifier = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #2fce98;
`;

const DiversityScore = styled.div`
  font-size: 11px;
  color: #28A745;
  font-weight: 500;
`;

const GroupMembers = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const MemberCard = styled.div`
  padding: 6px 8px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e9ecef;
`;

const MemberName = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: #333;
  margin-bottom: 2px;
`;

const MemberInfo = styled.div`
  font-size: 10px;
  color: #666;
`;

// Feedback Tab Components
const FeedbackContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FeedbackStats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 20px;
`;

const FeedbackList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FeedbackHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  
  h3 {
    margin: 0;
    font-size: 16px;
    color: #2fce98;
  }
`;

const ExportButton = styled.button`
  background: #17A2B8;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #138496;
  }
`;

const FeedbackItem = styled.div`
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 16px;
`;

const ParticipantFeedbackHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const ParticipantFeedbackRating = styled.div`
  font-size: 16px;
`;

const ParticipantFeedbackComment = styled.p`
  margin: 8px 0;
  font-size: 14px;
  color: #333;
  line-height: 1.4;
`;

const FeedbackSuggestions = styled.p`
  margin: 8px 0;
  font-size: 12px;
  color: #666;
  line-height: 1.4;
`;

const FeedbackDate = styled.div`
  font-size: 11px;
  color: #999;
  margin-top: 8px;
`;

const DiscoveryTitle = styled.h4`
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
`;

const DiscoveryGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
`;

const DiscoveryCard = styled.div`
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 12px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
  }
`;

const DiscoveryIcon = styled.div`
  font-size: 24px;
  margin-bottom: 8px;
`;

const DiscoveryName = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
`;

const DiscoveryMeta = styled.div`
  font-size: 10px;
  color: #666;
`;

export const ProfileScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    notificationBadge, 
    markAsRead,
    openMessagingModal,
    closeMessagingModal,
    isMessagingModalOpen,
    selectedConversation,
    sendMessage 
  } = useMessaging();
  
  // State for modals and editing
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [showConnectedAccountsModal, setShowConnectedAccountsModal] = useState(false);
  const [isGoogleCalendarConnected, setIsGoogleCalendarConnected] = useState(
    localStorage.getItem('googleCalendarConnected') === 'true'
  );
  const [showProfileEditor, setShowProfileEditor] = useState(false);
  const [showInlineEditor, setShowInlineEditor] = useState<string | null>(null);
  const [showPhotoCropper, setShowPhotoCropper] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [cropData, setCropData] = useState({
    scale: 1,
    x: 0,
    y: 0,
    size: 200
  });
  
  // Messaging state
  const [showMessaging, setShowMessaging] = useState(false);
  const [messagingView, setMessagingView] = useState<'list' | 'chat'>('list');
  const [messagingTab, setMessagingTab] = useState<'direct' | 'group' | 'community'>('direct');
  const [localSelectedConversation, setLocalSelectedConversation] = useState<any>(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showGroupCreator, setShowGroupCreator] = useState(false);
  const [messagingContext, setMessagingContext] = useState<{
    type: 'general' | 'event' | 'service' | 'community';
    data?: any;
    preMessage?: string;
  }>({ type: 'general' });
  
  // Community management state
  const [showCommunityDashboard, setShowCommunityDashboard] = useState(false);
  const [communityTab, setCommunityTab] = useState<'my-communities' | 'discover' | 'requests'>('my-communities');
  const [selectedCommunity, setSelectedCommunity] = useState<any>(null);
  const [showCommunityProfile, setShowCommunityProfile] = useState(false);
  
  // Event management state
  const [showEventCreator, setShowEventCreator] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [showGoogleForms, setShowGoogleForms] = useState(false);
  const [currentFormEvent, setCurrentFormEvent] = useState<string | null>(null);
  const [showRegistrationTracker, setShowRegistrationTracker] = useState(false);
  const [currentTrackerEvent, setCurrentTrackerEvent] = useState<string | null>(null);
  const [showChatManager, setShowChatManager] = useState(false);
  const [currentChatEvent, setCurrentChatEvent] = useState<string | null>(null);
  
  // Services editor state
  const [showServicesEditor, setShowServicesEditor] = useState(false);
  const [selectedServiceCategory, setSelectedServiceCategory] = useState<string>('local-guides');
  const [serviceDetails, setServiceDetails] = useState<Record<string, any>>({});
  const [selectedSkills, setSelectedSkills] = useState<Record<string, string[]>>({});
  
  // Events organizer state
  const [organizerRoles, setOrganizerRoles] = useState<Array<{
    organizationId: string;
    organizationName: string;
    role: string;
    delegationStatus: 'approved' | 'pending' | 'none';
    verified: boolean;
  }>>([]);
  
  // My Events State
  const [showMyEventsModal, setShowMyEventsModal] = useState(false);
  const [eventFilter, setEventFilter] = useState<'upcoming' | 'past'>('upcoming');
  const [selectedEventDetails, setSelectedEventDetails] = useState<any>(null);
  const [showEventDetailsModal, setShowEventDetailsModal] = useState(false);
  
  // Admin Event Management State
  const [showAdminEventManagement, setShowAdminEventManagement] = useState(false);
  const [showBerseMukhaManagement, setShowBerseMukhaManagement] = useState(false);
  const [selectedAdminEvent, setSelectedAdminEvent] = useState<any>(null);
  const [berseMukhaTab, setBerseMukhaTab] = useState<'checkin' | 'groups' | 'feedback'>('checkin');
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [attendanceQRData, setAttendanceQRData] = useState('');
  const [participantSearch, setParticipantSearch] = useState('');
  const [activeSession, setActiveSession] = useState<1 | 2>(1);
  const [diversitySettings, setDiversitySettings] = useState({
    gender: 70,
    age: 60,
    nationality: 50,
    profession: 40
  });
  
  // Share profile state
  const [showShareProfile, setShowShareProfile] = useState(false);
  
  // Form state for profile editing
  const [formData, setFormData] = useState({
    name: '',
    age: 28,
    dateOfBirth: '',
    profession: '',
    bio: '',
    personalityType: 'ENFJ-A',
    interests: [] as string[],
    communities: [] as Array<{name: string, type: 'educational' | 'professional' | 'foundation' | 'alumni', verified: boolean}>,
    socialMedia: {
      instagram: '',
      linkedin: '',
      twitter: '',
      whatsapp: ''
    },
    services: [] as string[],
    avatar: null as File | null
  });
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  
  // Mock admin events data - events the user can manage
  const mockAdminEvents = [
    {
      id: 'admin-event-1',
      title: 'KL Heritage Walking Tour',
      status: 'active',
      date: '2024-01-15',
      time: '9:00 AM',
      location: 'Central Market, KL',
      registrations: [
        { id: '1', name: 'Ahmad Hassan', email: 'ahmad@email.com', phone: '+60123456789', checkedIn: true, checkInTime: '2024-01-15T09:05:00Z', paymentStatus: 'paid' },
        { id: '2', name: 'Sarah Lim', email: 'sarah@email.com', phone: '+60123456790', checkedIn: false, checkInTime: null, paymentStatus: 'paid' },
        { id: '3', name: 'Raj Kumar', email: 'raj@email.com', phone: '+60123456791', checkedIn: true, checkInTime: '2024-01-15T08:55:00Z', paymentStatus: 'paid' },
        { id: '4', name: 'Fatima Ali', email: 'fatima@email.com', phone: '+60123456792', checkedIn: false, checkInTime: null, paymentStatus: 'pending' }
      ],
      paidCount: 3,
      checkedInCount: 2,
      revenue: '120.00',
      feedbackSubmissions: [
        { id: '1', participantName: 'Ahmad Hassan', rating: 5, comments: 'Amazing experience! Learned so much about KL history.', suggestions: 'Maybe include more interactive elements', submittedAt: '2024-01-15T18:00:00Z' },
        { id: '2', participantName: 'Raj Kumar', rating: 4, comments: 'Great tour guide and interesting locations.', suggestions: 'Would love longer time at each stop', submittedAt: '2024-01-15T19:30:00Z' }
      ]
    },
    {
      id: 'admin-event-2',
      title: 'Photography Meetup - Chinatown',
      status: 'draft',
      date: '2024-01-20',
      time: '7:00 PM',
      location: 'Petaling Street, KL',
      registrations: [],
      paidCount: 0,
      checkedInCount: 0,
      revenue: '0.00',
      feedbackSubmissions: []
    }
  ];

  // Use actual user data from registration/database
  const mockProfile = {
    name: user?.fullName || user?.username || 'User',
    age: calculateAge(user?.dateOfBirth || user?.date_of_birth),
    dateOfBirth: user?.dateOfBirth || user?.date_of_birth || '',
    profession: user?.profession || 'Professional',
    isAdmin: user?.role === 'ADMIN' || user?.role === 'MODERATOR',
    isHost: user?.isHostCertified || user?.role === 'GUIDE' || user?.role === 'ADMIN',
    rating: user?.rating || 7.1,
    level: user?.level || 7,
    personalityType: user?.personalityType || 'ENFJ-A',
    bio: user?.bio || user?.shortBio || 'Welcome to my profile!',
    interests: user?.interests?.length > 0 ? user.interests : (user?.topInterests?.length > 0 ? user.topInterests : []),
    communities: user?.communities?.length > 0 ? user.communities : [],
    socialMedia: {
      instagram: user?.instagramHandle || user?.instagram || '@user',
      linkedin: user?.linkedinHandle || user?.linkedin || 'user',
      twitter: user?.twitter || '@user',
      whatsapp: user?.phone || user?.whatsapp || ''
    },
    services: user?.servicesOffered?.length > 0 ? user.servicesOffered : [],
    avatarColor: user?.profileColor || 'linear-gradient(135deg, #2fce98, #4A90A4)',
    // Additional user data from registration
    city: user?.city || user?.currentLocation || 'Not specified',
    nationality: user?.nationality || 'Not specified',
    gender: user?.gender || 'Not specified',
    membershipId: user?.membershipId || 'Not set',
    email: user?.email || 'Not set',
    phone: user?.phone || 'Not set',
    username: user?.username || 'Not set'
  };
  
  // Mock notifications
  const mockNotifications = [
    {
      id: '1',
      type: 'trust' as const,
      text: 'Omar Hassan wants to add you to their trust network',
      time: '2 hours ago',
      hasActions: true
    },
    {
      id: '2',
      type: 'review' as const,
      text: 'Sara Wong left you a 5-star review for your photography service',
      time: '1 day ago',
      hasActions: false
    },
    {
      id: '3',
      type: 'connection' as const,
      text: 'Daniel Lee wants to connect for tech collaboration',
      time: '2 days ago',
      hasActions: true
    },
    {
      id: '4',
      type: 'event' as const,
      text: 'New BerseMuka Photography Meetup in KL this weekend',
      time: '3 days ago',
      hasActions: false
    },
    {
      id: '5',
      type: 'service' as const,
      text: 'Chen Wei Ming requested your architecture consultation',
      time: '1 week ago',
      hasActions: true
    }
  ];

  // Mock conversations data
  const mockConversations = [
    {
      id: '1',
      type: 'direct' as const,
      name: 'Omar Hassan',
      participantNames: ['Omar Hassan', 'Current User'],
      initials: 'OH',
      avatarColor: '#FF6B35',
      lastMessage: 'Hey! Are you free for coffee tomorrow?',
      timestamp: '2:30 PM',
      unreadCount: 2,
      isOnline: true,
      isGroup: false,
      messages: [
        {
          id: '1',
          text: 'Hi there! How was your photography workshop yesterday?',
          timestamp: '2:15 PM',
          isSent: false,
          status: 'read'
        },
        {
          id: '2',
          text: 'It was amazing! Learned so much about architectural photography.',
          timestamp: '2:18 PM',
          isSent: true,
          status: 'read'
        },
        {
          id: '3',
          text: 'That sounds great! Would love to see some shots.',
          timestamp: '2:20 PM',
          isSent: false,
          status: 'read'
        },
        {
          id: '4',
          text: 'Hey! Are you free for coffee tomorrow?',
          timestamp: '2:30 PM',
          isSent: false,
          status: 'delivered'
        }
      ]
    },
    {
      id: '2',
      type: 'direct' as const,
      name: 'Sara Wong',
      participantNames: ['Sara Wong', 'Current User'],
      initials: 'SW',
      avatarColor: '#9C27B0',
      lastMessage: 'Thanks for the architecture tips!',
      timestamp: '11:45 AM',
      unreadCount: 0,
      isOnline: false,
      isGroup: false,
      messages: [
        {
          id: '1',
          text: 'Your portfolio is incredible! The geometric compositions are stunning.',
          timestamp: '10:30 AM',
          isSent: false,
          status: 'read'
        },
        {
          id: '2',
          text: 'Thank you so much! That means a lot coming from you.',
          timestamp: '10:45 AM',
          isSent: true,
          status: 'read'
        },
        {
          id: '3',
          text: 'Thanks for the architecture tips!',
          timestamp: '11:45 AM',
          isSent: false,
          status: 'read'
        }
      ]
    },
    {
      id: '3',
      type: 'group' as const,
      name: 'KL Photography Club',
      participantNames: ['Chen Wei Ming', 'Daniel Lee', 'Sara Wong', 'Omar Hassan', 'Current User'],
      initials: 'KL',
      avatarColor: '#2196F3',
      lastMessage: 'Chen: Meeting at KLCC tomorrow 10 AM',
      timestamp: 'Yesterday',
      unreadCount: 5,
      isOnline: false,
      isGroup: true,
      participants: ['Chen Wei Ming', 'Daniel Lee', 'Sara Wong', 'Omar Hassan'],
      messages: [
        {
          id: '1',
          text: 'Hey everyone! Planning a sunrise shoot at KLCC tomorrow.',
          timestamp: 'Yesterday 8:30 PM',
          isSent: false,
          status: 'read',
          sender: 'Chen Wei Ming'
        },
        {
          id: '2',
          text: 'Count me in! What time should we meet?',
          timestamp: 'Yesterday 8:45 PM',
          isSent: true,
          status: 'read'
        },
        {
          id: '3',
          text: 'Meeting at KLCC tomorrow 10 AM',
          timestamp: 'Yesterday 9:00 PM',
          isSent: false,
          status: 'delivered',
          sender: 'Chen Wei Ming'
        }
      ]
    },
    {
      id: '4',
      type: 'direct' as const,
      name: 'Daniel Lee',
      participantNames: ['Daniel Lee', 'Current User'],
      initials: 'DL',
      avatarColor: '#4CAF50',
      lastMessage: 'Looking forward to collaborating!',
      timestamp: '2 days ago',
      unreadCount: 0,
      isOnline: true,
      isGroup: false,
      messages: [
        {
          id: '1',
          text: 'Hi! I saw your work on the NAMA Foundation website. Really impressive!',
          timestamp: '2 days ago 3:00 PM',
          isSent: false,
          status: 'read'
        },
        {
          id: '2',
          text: 'Thank you! I checked out your tech projects too - love the innovation.',
          timestamp: '2 days ago 3:30 PM',
          isSent: true,
          status: 'read'
        },
        {
          id: '3',
          text: 'Looking forward to collaborating!',
          timestamp: '2 days ago 4:00 PM',
          isSent: false,
          status: 'read'
        }
      ]
    }
  ];

  // Mock contacts for group creation
  const mockContacts = [
    { id: '1', name: 'Omar Hassan', initials: 'OH', avatarColor: '#FF6B35', isOnline: true },
    { id: '2', name: 'Sara Wong', initials: 'SW', avatarColor: '#9C27B0', isOnline: false },
    { id: '3', name: 'Daniel Lee', initials: 'DL', avatarColor: '#4CAF50', isOnline: true },
    { id: '4', name: 'Chen Wei Ming', initials: 'CW', avatarColor: '#FF9800', isOnline: false },
    { id: '5', name: 'Priya Sharma', initials: 'PS', avatarColor: '#E91E63', isOnline: true },
    { id: '6', name: 'Alex Thompson', initials: 'AT', avatarColor: '#3F51B5', isOnline: false }
  ];

  // Mock user events data - events the user has registered for
  const mockUserEvents = [
    {
      id: 'event-1',
      title: 'KL Heritage Walking Tour',
      date: '2024-01-15',
      time: '9:00 AM',
      location: 'Central Market, KL',
      status: 'upcoming' as const,
      type: 'cultural',
      organizer: 'NAMA Foundation',
      groupAssignments: [
        { session: 'Session 1', type: 'number', value: 7, color: '#2fce98' },
        { session: 'Session 2', type: 'color', value: 'Red Team', color: '#FF6B6B' }
      ],
      description: 'Explore the rich heritage and culture of Kuala Lumpur through historic sites and traditional architecture.',
      registrationDate: '2024-01-01',
      checkInStatus: 'pending',
      canCancel: true,
      qrCode: 'QR_EVENT_1_USER_123',
      chatGroupId: 'event-1-chat'
    },
    {
      id: 'event-2', 
      title: 'Photography Meetup - Chinatown',
      date: '2024-01-20',
      time: '7:00 PM',
      location: 'Petaling Street, KL',
      status: 'upcoming' as const,
      type: 'hobby',
      organizer: 'KL Photography Club',
      groupAssignments: [
        { session: 'Main Group', type: 'skill', value: 'Intermediate', color: '#4A90A4' }
      ],
      description: 'Capture the vibrant street life and architecture of Chinatown with fellow photography enthusiasts.',
      registrationDate: '2024-01-05',
      checkInStatus: 'pending',
      canCancel: true,
      qrCode: 'QR_EVENT_2_USER_123',
      chatGroupId: 'event-2-chat'
    },
    {
      id: 'event-3',
      title: 'Architecture Students Networking',
      date: '2023-12-10',
      time: '6:30 PM', 
      location: 'Taylor\'s University',
      status: 'completed' as const,
      type: 'professional',
      organizer: 'Malaysian Architects',
      groupAssignments: [
        { session: 'Roundtable 1', type: 'topic', value: 'Sustainable Design', color: '#28A745' }
      ],
      description: 'Professional networking event for architecture students and young professionals.',
      registrationDate: '2023-11-25',
      checkInStatus: 'completed',
      canCancel: false,
      qrCode: 'QR_EVENT_3_USER_123',
      chatGroupId: 'event-3-chat',
      feedback: {
        rating: 5,
        comment: 'Amazing event! Great networking opportunities and learned so much about sustainable architecture.'
      }
    },
    {
      id: 'event-4',
      title: 'Coffee Culture Workshop',
      date: '2024-02-05',
      time: '2:00 PM',
      location: 'Bangsar Village',
      status: 'cancelled' as const,
      type: 'workshop',
      organizer: 'Independent',
      groupAssignments: [],
      description: 'Learn about coffee brewing techniques and culture from around the world.',
      registrationDate: '2024-01-10',
      checkInStatus: 'cancelled',
      canCancel: false,
      qrCode: 'QR_EVENT_4_USER_123',
      cancelReason: 'Event cancelled due to insufficient registrations'
    }
  ];

  // Mock communities data
  const mockCommunities = [
    {
      id: '1',
      name: 'NAMA Foundation',
      avatar: '🏛️',
      role: 'Cultural Program Coordinator',
      verified: true,
      memberCount: 1247,
      description: 'Preserving Malaysian cultural heritage through education and community programs.',
      status: 'member',
      canMessage: true,
      canManage: false
    },
    {
      id: '2',
      name: 'Malaysian Architects',
      avatar: '🏗️',
      role: 'Member',
      verified: true,
      memberCount: 892,
      description: 'Professional association for architects in Malaysia.',
      status: 'member',
      canMessage: true,
      canManage: false
    },
    {
      id: '3',
      name: 'KL Photography Club',
      avatar: '📷',
      role: 'Workshop Organizer',
      verified: false,
      memberCount: 324,
      description: 'Photography enthusiasts capturing the beauty of Kuala Lumpur.',
      status: 'pending',
      canMessage: false,
      canManage: true
    }
  ];

  // Community discovery categories
  const communityCategories = [
    { id: 'educational', name: 'Educational', icon: '🎓', count: 89 },
    { id: 'professional', name: 'Professional', icon: '💼', count: 156 },
    { id: 'cultural', name: 'Cultural', icon: '🎭', count: 73 },
    { id: 'religious', name: 'Religious', icon: '🕌', count: 142 },
    { id: 'hobby', name: 'Hobby & Interest', icon: '🎨', count: 201 },
    { id: 'regional', name: 'Regional', icon: '🗺️', count: 98 },
    { id: 'alumni', name: 'Alumni', icon: '👥', count: 67 },
    { id: 'sports', name: 'Sports & Fitness', icon: '⚽', count: 124 }
  ];

  // Enhanced conversations with community chats
  const communityConversations = [
    {
      id: 'c1',
      name: 'NAMA Foundation General',
      initials: 'NF',
      avatarColor: '#007BFF',
      lastMessage: 'Ahmad: Don\'t forget about tomorrow\'s heritage walk!',
      timestamp: '1:20 PM',
      unreadCount: 3,
      isOnline: false,
      isGroup: true,
      isCommunity: true,
      memberCount: 127,
      type: 'community'
    },
    {
      id: 'c2',
      name: 'KL Photo Club - Events',
      initials: 'KC',
      avatarColor: '#9C27B0',
      lastMessage: 'Sara: KLCC sunrise shoot this weekend?',
      timestamp: 'Yesterday',
      unreadCount: 8,
      isOnline: false,
      isGroup: true,
      isCommunity: true,
      memberCount: 45,
      type: 'community'
    }
  ];

  // Service categories with details
  const serviceCategories = [
    { id: 'local-guides', name: 'Local Guides', icon: '🗺️', color: '#1976D2' },
    { id: 'homestay', name: 'Homestay', icon: '🏠', color: '#D32F2F' },
    { id: 'freelance', name: 'Freelance', icon: '💼', color: '#7B1FA2' },
    { id: 'marketplace', name: 'Marketplace', icon: '⚙️', color: '#F57C00' },
    { id: 'open-connect', name: 'Open to Connect', icon: '🤝', color: '#388E3C' }
  ];

  // Skills by category
  const skillsByCategory = {
    'local-guides': [
      'Historical Knowledge', 'Cultural Expertise', 'Language Skills', 'Photography',
      'Transportation', 'Food Knowledge', 'Adventure Tours', 'Architecture'
    ],
    'homestay': [
      'Hospitality', 'Cooking', 'Cultural Exchange', 'Local Knowledge',
      'Language Exchange', 'Tour Planning', 'Safety & Security', 'Cleanliness'
    ],
    'freelance': [
      'Web Development', 'Graphic Design', 'Writing & Translation', 'Marketing',
      'Photography', 'Video Editing', 'Consulting', 'Teaching & Tutoring'
    ],
    'marketplace': [
      'Electronics', 'Clothing & Fashion', 'Books & Education', 'Furniture',
      'Vehicles', 'Sports Equipment', 'Art & Crafts', 'Musical Instruments'
    ],
    'open-connect': [
      'Networking', 'Mentorship', 'Collaboration', 'Knowledge Sharing',
      'Project Partnership', 'Business Development', 'Cultural Exchange', 'Language Practice'
    ]
  };

  // Mock organization roles for delegation
  const mockOrganizationRoles = [
    {
      organizationId: '1',
      organizationName: '🏛️ NAMA Foundation',
      role: 'Cultural Program Coordinator',
      delegationStatus: 'approved' as const,
      verified: true
    },
    {
      organizationId: '2',
      organizationName: '🎓 Malaysian Architects',
      role: 'Event Committee Member',
      delegationStatus: 'pending' as const,
      verified: true
    },
    {
      organizationId: '3',
      organizationName: '📷 KL Photography Club',
      role: 'Workshop Organizer',
      delegationStatus: 'none' as const,
      verified: false
    }
  ];

  const getUserLevel = (level: number) => {
    if (level <= 2) return { name: 'Newcomer', color: '#94A3B8' };
    if (level <= 4) return { name: 'Explorer', color: '#3B82F6' };
    if (level <= 6) return { name: 'Connector', color: '#10B981' };
    if (level <= 8) return { name: 'Ambassador', color: '#F59E0B' };
    if (level <= 10) return { name: 'Guardian', color: '#EF4444' };
    return { name: 'Legend', color: '#8B5CF6' };
  };

  const getPersonalityTemperament = (type: string): 'NT' | 'NF' | 'SJ' | 'SP' => {
    if (type.startsWith('NT')) return 'NT';
    if (type.startsWith('NF')) return 'NF';
    if (type.startsWith('SJ')) return 'SJ';
    return 'SP';
  };

  const userLevel = getUserLevel(mockProfile.level);
  const personalityTemperament = getPersonalityTemperament(mockProfile.personalityType);

  // Initialize form data with current profile
  React.useEffect(() => {
    setFormData({
      name: mockProfile.name,
      age: mockProfile.age,
      dateOfBirth: mockProfile.dateOfBirth,
      profession: mockProfile.profession,
      bio: mockProfile.bio,
      personalityType: mockProfile.personalityType,
      interests: mockProfile.interests,
      communities: mockProfile.communities,
      socialMedia: mockProfile.socialMedia,
      services: mockProfile.services,
      avatar: null
    });
  }, []);

  // Available options for selectors
  const interestOptions = [
    'Architecture', 'Photography', 'Coffee Culture', 'Travel', 'History', 'Art',
    'Technology', 'Gaming', 'Fitness', 'Reading', 'Music', 'Cooking',
    'Hiking', 'Languages', 'Movies', 'Fashion', 'Business', 'Design'
  ];

  const personalityTypes = [
    'INTJ-A', 'INTJ-T', 'INTP-A', 'INTP-T', 'ENTJ-A', 'ENTJ-T', 'ENTP-A', 'ENTP-T',
    'INFJ-A', 'INFJ-T', 'INFP-A', 'INFP-T', 'ENFJ-A', 'ENFJ-T', 'ENFP-A', 'ENFP-T',
    'ISTJ-A', 'ISTJ-T', 'ISFJ-A', 'ISFJ-T', 'ESTJ-A', 'ESTJ-T', 'ESFJ-A', 'ESFJ-T',
    'ISTP-A', 'ISTP-T', 'ISFP-A', 'ISFP-T', 'ESTP-A', 'ESTP-T', 'ESFP-A', 'ESFP-T'
  ];

  const serviceOptions = [
    'Local Guides', 'Homestay', 'Freelance', 'Marketplace', 'Open to Connect'
  ];

  // Validation functions
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!formData.profession.trim()) {
      errors.profession = 'Profession is required';
    }
    
    if (formData.bio.split(' ').length > 50) {
      errors.bio = 'Bio must be 50 words or less';
    }
    
    if (formData.interests.length === 0) {
      errors.interests = 'Select at least one interest';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Form handlers
  const handleFormChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSocialMediaChange = (platform: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        [platform]: value
      }
    }));
  };

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleServiceToggle = (service: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }));
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('❌ File size must be less than 5MB');
        return;
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('❌ Please select an image file');
        return;
      }
      
      setSelectedPhoto(file);
      setShowPhotoCropper(true);
      
      // Reset crop data
      setCropData({
        scale: 1,
        x: 0,
        y: 0,
        size: 200
      });
    }
    
    // Clear the input so the same file can be selected again
    event.target.value = '';
  };

  const handleCropCancel = () => {
    setShowPhotoCropper(false);
    setSelectedPhoto(null);
  };

  const handleCropDone = () => {
    if (selectedPhoto) {
      // In a real implementation, you would crop the image here
      // For now, we'll just use the original file
      setFormData(prev => ({ ...prev, avatar: selectedPhoto }));
      setShowPhotoCropper(false);
      setSelectedPhoto(null);
    }
  };

  const handleZoomChange = (scale: number) => {
    setCropData(prev => ({ ...prev, scale }));
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In real app, send formData to API
      console.log('Saving profile data:', formData);
      
      alert('✅ Profile updated successfully!');
      setShowProfileEditor(false);
      
    } catch (error) {
      alert('❌ Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setShowProfileEditor(false);
    setShowInlineEditor(null);
    setFormErrors({});
    // Reset form data
    setFormData({
      name: mockProfile.name,
      age: mockProfile.age,
      dateOfBirth: mockProfile.dateOfBirth,
      profession: mockProfile.profession,
      bio: mockProfile.bio,
      personalityType: mockProfile.personalityType,
      interests: mockProfile.interests,
      communities: mockProfile.communities,
      socialMedia: mockProfile.socialMedia,
      services: mockProfile.services,
      avatar: null
    });
  };

  const openInlineEditor = (section: string) => {
    setShowInlineEditor(section);
    // Initialize form data for inline editing
    setFormData(prev => ({ ...prev }));
  };

  const saveInlineEdit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('✅ Changes saved successfully!');
      setShowInlineEditor(null);
    } catch (error) {
      alert('❌ Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const getBioWordCount = () => {
    return formData.bio.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  // Messaging handlers
  const [conversations, setConversations] = useState(mockConversations);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [groupName, setGroupName] = useState('');

  const openMessaging = () => {
    setShowMessaging(true);
    setMessagingView('list');
  };

  const closeMessaging = () => {
    setShowMessaging(false);
    setMessagingView('list');
    setLocalSelectedConversation(null);
    setMessageInput('');
    setSearchQuery('');
  };

  const openChat = (conversation: any) => {
    setLocalSelectedConversation(conversation);
    setMessagingView('chat');
    
    // Mark messages as read
    setConversations(prev => prev.map(conv => 
      conv.id === conversation.id 
        ? { ...conv, unreadCount: 0 }
        : conv
    ));
  };

  const backToList = () => {
    setMessagingView('list');
    setLocalSelectedConversation(null);
    setMessageInput('');
  };

  const sendLocalMessage = () => {
    if (!messageInput.trim() || !localSelectedConversation) return;

    const newMessage = {
      id: Date.now().toString(),
      text: messageInput.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSent: true,
      status: 'sent'
    };

    // Add message to conversation
    setConversations(prev => prev.map(conv => 
      conv.id === localSelectedConversation.id 
        ? { 
            ...conv, 
            messages: [...conv.messages, newMessage],
            lastMessage: messageInput.trim(),
            timestamp: 'now'
          }
        : conv
    ));

    // Update selected conversation
    setLocalSelectedConversation((prev: any) => ({
      ...prev,
      messages: [...prev.messages, newMessage]
    }));

    setMessageInput('');

    // Simulate message delivery after 1 second
    setTimeout(() => {
      setConversations(prev => prev.map(conv => 
        conv.id === localSelectedConversation.id 
          ? { 
              ...conv, 
              messages: conv.messages.map(msg => 
                msg.id === newMessage.id 
                  ? { ...msg, status: 'delivered' }
                  : msg
              )
            }
          : conv
      ));
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const filteredConversations = conversations.filter(conv => {
    const recipientName = conv.participantNames?.find(name => name !== 'Current User') || conv.name || 'Unknown';
    return recipientName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const openGroupCreator = () => {
    setShowGroupCreator(true);
    setGroupName('');
    setSelectedContacts([]);
  };

  const closeGroupCreator = () => {
    setShowGroupCreator(false);
    setGroupName('');
    setSelectedContacts([]);
  };

  const toggleContactSelection = (contactId: string) => {
    setSelectedContacts(prev => 
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const createGroup = () => {
    if (!groupName.trim() || selectedContacts.length < 2) return;

    const selectedContactsData = mockContacts.filter(contact => 
      selectedContacts.includes(contact.id)
    );

    const newGroup = {
      id: Date.now().toString(),
      name: groupName.trim(),
      initials: groupName.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2),
      avatarColor: '#2196F3',
      lastMessage: 'Group created',
      timestamp: 'now',
      unreadCount: 0,
      isOnline: false,
      isGroup: true,
      participants: selectedContactsData.map(contact => contact.name),
      messages: [{
        id: '1',
        text: `${mockProfile.name} created the group`,
        timestamp: 'now',
        isSent: false,
        status: 'read',
        sender: 'System'
      }]
    };

    setConversations(prev => [newGroup, ...prev]);
    closeGroupCreator();
    
    // Open the new group chat
    openChat(newGroup);
  };

  const getTotalUnreadCount = () => {
    return notificationBadge.total;
  };

  // Services editor handlers
  React.useEffect(() => {
    setOrganizerRoles(mockOrganizationRoles);
  }, []);

  const openServicesEditor = () => {
    setShowServicesEditor(true);
    setSelectedServiceCategory('local-guides');
  };

  const closeServicesEditor = () => {
    setShowServicesEditor(false);
    setSelectedServiceCategory('local-guides');
  };

  const handleServiceCategorySelect = (categoryId: string) => {
    setSelectedServiceCategory(categoryId);
  };

  const handleServiceDetailChange = (field: string, value: any) => {
    setServiceDetails(prev => ({
      ...prev,
      [selectedServiceCategory]: {
        ...prev[selectedServiceCategory],
        [field]: value
      }
    }));
  };

  const handleSkillToggle = (skill: string) => {
    setSelectedSkills(prev => {
      const categorySkills = prev[selectedServiceCategory] || [];
      const updatedSkills = categorySkills.includes(skill)
        ? categorySkills.filter(s => s !== skill)
        : [...categorySkills, skill];
      
      return {
        ...prev,
        [selectedServiceCategory]: updatedSkills
      };
    });
  };

  const saveServicesData = async () => {
    // Save services data
    console.log('Saving services data:', { serviceDetails, selectedSkills });
    alert('✅ Services updated successfully!');
    closeServicesEditor();
  };

  const handlePortfolioUpload = (categoryId: string) => {
    alert(`📁 Portfolio upload for ${categoryId} - File picker would open here`);
  };

  // Events organizer handlers
  const requestDelegation = (organizationId: string) => {
    setOrganizerRoles(prev => prev.map(role => 
      role.organizationId === organizationId 
        ? { ...role, delegationStatus: 'pending' }
        : role
    ));
    alert('🔄 Delegation request sent to organization admin');
  };

  const createPersonalEvent = () => {
    alert('📅 Personal event creation would open BerseConnect event creator');
  };

  const createDelegatedEvent = (organizationName: string) => {
    alert(`🏛️ Creating event for ${organizationName} - Attribution will show`);
  };

  const getCurrentServiceDetails = () => {
    return serviceDetails[selectedServiceCategory] || {};
  };

  const getCurrentSkills = () => {
    return selectedSkills[selectedServiceCategory] || [];
  };

  // Community management handlers
  const openCommunityDashboard = () => {
    setShowCommunityDashboard(true);
    setCommunityTab('my-communities');
  };

  const closeCommunityDashboard = () => {
    setShowCommunityDashboard(false);
    setShowCommunityProfile(false);
    setSelectedCommunity(null);
  };

  const handleCommunityTabChange = (tab: typeof communityTab) => {
    setCommunityTab(tab);
  };

  const openCommunityProfile = (community: any) => {
    setSelectedCommunity(community);
    setShowCommunityProfile(true);
  };

  const joinCommunity = (communityId: string) => {
    alert(`🏘️ Join request sent to community ${communityId}`);
  };

  const leaveCommunity = (communityId: string) => {
    alert(`👋 Left community ${communityId}`);
  };

  // Event management handlers
  const createNewEvent = () => {
    setShowEventCreator(true);
    alert('🎯 Event Creation Form with Google Forms Integration\n\n✨ Features Include:\n• Smart form builder with community branding\n• Automatic registration collection\n• Payment integration (Setel Wallet)\n• WhatsApp group auto-creation\n• Email confirmations and reminders\n• Real-time attendance tracking\n• Post-event feedback collection');
  };

  const openEventDashboard = (eventId: string) => {
    setCurrentTrackerEvent(eventId);
    setShowRegistrationTracker(true);
  };
  
  const closeRegistrationTracker = () => {
    setShowRegistrationTracker(false);
    setCurrentTrackerEvent(null);
  };

  const manageEventForms = (eventId: string) => {
    setCurrentFormEvent(eventId);
    setShowGoogleForms(true);
  };

  const closeGoogleForms = () => {
    setShowGoogleForms(false);
    setCurrentFormEvent(null);
  };

  const manageChatGroups = (eventId: string) => {
    setCurrentChatEvent(eventId);
    setShowChatManager(true);
  };
  
  const closeChatManager = () => {
    setShowChatManager(false);
    setCurrentChatEvent(null);
  };

  const exportEventData = (eventId: string) => {
    alert(`📊 Event Data Export\n\n📁 Available Exports:\n• Complete attendee list (CSV/Excel)\n• Payment transaction report\n• Google Forms responses\n• Analytics summary (PDF)\n• Post-event feedback analysis\n• Photo/media compilation\n\n🔒 Data includes:\n• Member demographics\n• Registration timestamps\n• Payment confirmation\n• Check-in/check-out times\n• Feedback scores\n• Follow-up actions`);
  };

  const messageCommunity = (community: any) => {
    setMessagingContext({
      type: 'community',
      data: community,
      preMessage: `Hi! I'd like to know more about ${community.name}.`
    });
    openMessaging();
  };

  // My Events handlers
  const openEventDetails = (event: any) => {
    setSelectedEventDetails(event);
    setShowEventDetailsModal(true);
  };

  const cancelEventRegistration = (eventId: string) => {
    const event = mockUserEvents.find(e => e.id === eventId);
    if (!event) return;
    
    const daysUntilEvent = Math.ceil((new Date(event.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilEvent < 7) {
      alert(`⚠️ Cancellation Policy\n\nCancelling with ${daysUntilEvent} days notice.\n• Less than 7 days: 50% refund\n• Less than 2 days: No refund\n\nProceed with cancellation?`);
    } else {
      alert(`✅ Cancellation Confirmed\n\nFull refund will be processed within 3-5 business days.\nYou'll receive confirmation via email.`);
    }
  };

  const joinEventChatGroup = (eventId: string) => {
    const event = mockUserEvents.find(e => e.id === eventId);
    if (!event) return;
    
    alert(`💬 Joining Event Chat Group\n\n${event.title}\nOrganizer: ${event.organizer}\n\nOpening WhatsApp group...`);
    // In real app, would open WhatsApp or messaging modal
  };

  const downloadEventQR = (eventId: string) => {
    const event = mockUserEvents.find(e => e.id === eventId);
    if (!event) return;
    
    alert(`📱 QR Code Downloaded\n\n${event.title}\nCode: ${event.qrCode}\n\n• Save to your phone's photo gallery\n• Show at event check-in\n• Screenshots are accepted`);
  };

  const shareEventDetails = (eventId: string) => {
    const event = mockUserEvents.find(e => e.id === eventId);
    if (!event) return;
    
    const shareText = `🎯 I'm attending: ${event.title}\n📅 ${event.date} at ${event.time}\n📍 ${event.location}\n\nJoin me! Register at bersemuka.app/event/${eventId}`;
    
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: shareText,
        url: `https://bersemuka.app/event/${eventId}`
      });
    } else {
      navigator.clipboard.writeText(shareText);
      alert('📋 Event details copied to clipboard!');
    }
  };

  const getEventsStats = () => {
    const total = mockUserEvents.length;
    const upcoming = mockUserEvents.filter(e => e.status === 'upcoming').length;
    const completed = mockUserEvents.filter(e => e.status === 'completed').length;
    
    return { total, upcoming, completed };
  };

  const getCalendarEvents = () => {
    // Create a simple calendar view for current month
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    
    const calendarDays = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < firstDayOfMonth; i++) {
      calendarDays.push({ day: null, hasEvent: false, isToday: false });
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const hasEvent = mockUserEvents.some(event => event.date === dayDate);
      const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
      
      calendarDays.push({ day, hasEvent, isToday });
    }
    
    return {
      calendarDays,
      monthName: today.toLocaleString('default', { month: 'long', year: 'numeric' })
    };
  };

  // My Events Modal Handlers
  const getFilteredUserEvents = () => {
    if (eventFilter === 'upcoming') {
      return mockUserEvents.filter(event => event.status === 'upcoming');
    } else {
      return mockUserEvents.filter(event => event.status === 'completed' || event.status === 'cancelled');
    }
  };

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const viewEventDetails = (eventId: string) => {
    const event = mockUserEvents.find(e => e.id === eventId);
    if (event) {
      setSelectedEventDetails(event);
      setShowEventDetailsModal(true);
      setShowMyEventsModal(false);
    }
  };

  const openEventChatGroup = (eventId: string) => {
    const event = mockUserEvents.find(e => e.id === eventId);
    if (event) {
      alert(`💬 Opening chat group for ${event.title}\n\nChat group: ${event.chatGroupId}`);
    }
  };

  const submitFeedback = (eventId: string) => {
    const event = mockUserEvents.find(e => e.id === eventId);
    if (event) {
      alert(`⭐ Event Feedback for ${event.title}\n\nThis would open the feedback form where you can rate the event and provide comments.`);
    }
  };

  const generateEventDetailsQRCode = () => {
    // Generate QR code for event details modal
    const canvas = document.getElementById('event-details-qr-canvas') as HTMLCanvasElement;
    if (!canvas || !selectedEventDetails) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size
    canvas.width = 140;
    canvas.height = 140;
    
    // Draw mock QR code pattern
    ctx.fillStyle = '#2fce98';
    ctx.fillRect(0, 0, 140, 140);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(8, 8, 124, 124);
    
    // Draw QR pattern (simplified)
    ctx.fillStyle = '#2fce98';
    for (let i = 0; i < 12; i++) {
      for (let j = 0; j < 12; j++) {
        if ((i + j) % 3 === 0) {
          ctx.fillRect(16 + i * 8, 16 + j * 8, 6, 6);
        }
      }
    }
    
    // Add center logo area
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(55, 55, 30, 30);
    ctx.fillStyle = '#2fce98';
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('BM', 70, 75);
  };

  // useEffect to generate QR code when event details modal opens
  useEffect(() => {
    if (showEventDetailsModal && selectedEventDetails && selectedEventDetails.status === 'upcoming') {
      setTimeout(generateEventDetailsQRCode, 100);
    }
  }, [showEventDetailsModal, selectedEventDetails]);

  // Admin Event Management Handlers
  const openAdminEventDashboard = (eventId: string) => {
    const event = mockAdminEvents.find(e => e.id === eventId);
    if (event) {
      alert(`📊 Event Dashboard for ${event.title}\n\n• ${event.registrations.length} total registrations\n• ${event.paidCount} paid participants\n• ${event.checkedInCount} checked in\n• RM ${event.revenue} revenue\n\nOpening full dashboard...`);
    }
  };

  const openBerseMukhaManagement = (eventId: string) => {
    const event = mockAdminEvents.find(e => e.id === eventId);
    if (event) {
      setSelectedAdminEvent(event);
      setShowBerseMukhaManagement(true);
      setShowAdminEventManagement(false);
      setBerseMukhaTab('checkin');
    }
  };

  const generateAttendanceQR = (eventId: string) => {
    const qrData = {
      type: 'attendance',
      eventId,
      timestamp: Date.now(),
      checkInUrl: `https://bersemuka.app/checkin/${eventId}`
    };
    
    setAttendanceQRData(JSON.stringify(qrData));
    alert(`📱 QR Code Generated\n\nAttendance QR code for event check-in has been generated. Participants can scan this code to check in.`);
  };

  const regenerateAttendanceQR = () => {
    if (selectedAdminEvent) {
      generateAttendanceQR(selectedAdminEvent.id);
    }
  };

  const handleQRScan = (qrData: string) => {
    try {
      const scanData = JSON.parse(qrData);
      if (scanData.type === 'participant') {
        manualCheckIn(scanData.participantId);
      }
    } catch (error) {
      console.error('Invalid QR code:', error);
      alert('❌ Invalid QR code format');
    }
  };

  const manualCheckIn = (participantId: string) => {
    alert(`✅ Manual Check-in\n\n${participantId} has been checked in manually.\n\nThis would update the participant's status in the database.`);
  };

  const generateDiverseGroups = () => {
    if (!selectedAdminEvent) return;
    
    const participantCount = selectedAdminEvent.registrations.length;
    const maxGroups = Math.min(15, Math.ceil(participantCount / 5));
    
    alert(`🎲 Generating Groups\n\n• ${participantCount} participants\n• Max ${maxGroups} groups\n• Diversity priorities:\n  - Gender: ${diversitySettings.gender}%\n  - Age: ${diversitySettings.age}%\n  - Nationality: ${diversitySettings.nationality}%\n  - Profession: ${diversitySettings.profession}%\n\nGroups generated with optimal diversity distribution!`);
  };

  const regenerateGroups = () => {
    alert(`🔄 Regenerating Groups\n\nRecalculating group assignments for better diversity balance...`);
  };

  const exportFeedback = () => {
    if (!selectedAdminEvent) return;
    
    alert(`📤 Exporting Feedback\n\n• ${selectedAdminEvent.feedbackSubmissions.length} responses\n• Export formats: CSV, PDF, Excel\n• Includes ratings, comments, and suggestions\n\nDownload will start automatically...`);
  };

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getFilteredParticipants = () => {
    if (!selectedAdminEvent) return [];
    
    return selectedAdminEvent.registrations.filter(participant =>
      participant.name.toLowerCase().includes(participantSearch.toLowerCase()) ||
      participant.email.toLowerCase().includes(participantSearch.toLowerCase())
    );
  };

  const getFeedbackStats = () => {
    if (!selectedAdminEvent || selectedAdminEvent.feedbackSubmissions.length === 0) {
      return {
        totalResponses: 0,
        averageRating: 0,
        recommendationRate: 0
      };
    }

    const totalResponses = selectedAdminEvent.feedbackSubmissions.length;
    const averageRating = selectedAdminEvent.feedbackSubmissions.reduce((sum, feedback) => sum + feedback.rating, 0) / totalResponses;
    const recommendationRate = Math.round((selectedAdminEvent.feedbackSubmissions.filter(f => f.rating >= 4).length / totalResponses) * 100);

    return {
      totalResponses,
      averageRating,
      recommendationRate
    };
  };

  // Enhanced messaging handlers with context
  const openMessagingWithContext = (context: {
    type: 'general' | 'event' | 'service' | 'community';
    data?: any;
    preMessage?: string;
    recipient?: any;
  }) => {
    setMessagingContext(context);
    
    // If there's a specific recipient, create or find conversation
    if (context.recipient) {
      const existingConversation = conversations.find(conv => {
        const recipientName = conv.participantNames?.find(name => name !== 'Current User') || conv.name || '';
        return recipientName === context.recipient.name || 
               conv.id === context.recipient.id;
      });
      
      if (existingConversation) {
        openChat(existingConversation);
      } else {
        // Create new conversation
        const newConversation = {
          id: Date.now().toString(),
          name: context.recipient.name,
          initials: context.recipient.initials || context.recipient.name.split(' ').map((n: string) => n[0]).join(''),
          avatarColor: context.recipient.avatarColor || '#007BFF',
          lastMessage: context.preMessage || 'New conversation',
          timestamp: 'now',
          unreadCount: 0,
          isOnline: context.recipient.isOnline || false,
          isGroup: false,
          isCommunity: false,
          type: 'direct',
          messages: []
        };
        
        setConversations(prev => [newConversation, ...prev]);
        openChat(newConversation);
      }
    } else {
      openMessaging();
    }
  };

  // Get filtered conversations by tab
  const getFilteredConversations = () => {
    switch (messagingTab) {
      case 'direct':
        return conversations.filter(conv => conv.type === 'direct');
      case 'group':
        return conversations.filter(conv => conv.type === 'group');
      case 'community':
        return [...conversations.filter(conv => conv.type === 'community'), ...communityConversations];
      default:
        return conversations;
    }
  };

  const getAllConversations = () => {
    return [...conversations, ...communityConversations];
  };

  const getTotalUnreadCountByTab = (tab: string) => {
    switch (tab) {
      case 'direct':
        return notificationBadge.directMessages;
      case 'group':
        return notificationBadge.groupMessages;
      case 'community':
        return notificationBadge.communityMessages;
      default:
        return 0;
    }
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
              {mockProfile.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <div style={{ fontSize: '12px', color: '#999999', fontWeight: 'normal' }}>Manage Your Account</div>
              <div style={{ fontSize: '18px', color: '#333333', fontWeight: '600' }}>Profile</div>
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
          }}>5</div>
        </div>
      </div>
      
      <Content>
        {/* BerseMatch-style Profile Card */}
        <ProfileCard>
          <ProfileHeader>
            <ProfileAvatar 
              style={{ background: mockProfile.avatarColor }}
            >
              {mockProfile.name.split(' ').map(n => n[0]).join('')}
            </ProfileAvatar>
            
            <ProfileInfo>
              <ProfileNameSection>
                <UserNameEdit>
                  <ProfileName 
                    onClick={() => openInlineEditor('name')}
                    style={{ cursor: 'pointer' }}
                    title="Click to edit name"
                  >
                    {mockProfile.name}
                  </ProfileName>
                  <ProfileMeta 
                    onClick={() => openInlineEditor('age-profession')}
                    style={{ cursor: 'pointer' }}
                    title="Click to edit age and profession"
                  >
                    {mockProfile.age} • {mockProfile.profession}
                  </ProfileMeta>
                  <ProfileMeta style={{ fontSize: '11px', marginTop: '2px' }}>
                    📍 {mockProfile.city} • 🌍 {mockProfile.nationality} • {mockProfile.gender}
                  </ProfileMeta>
                  {mockProfile.membershipId !== 'Not set' && (
                    <ProfileMeta style={{ fontSize: '10px', marginTop: '2px', color: '#2fce98' }}>
                      ID: {mockProfile.membershipId}
                    </ProfileMeta>
                  )}
                </UserNameEdit>
                
                <TopRightStack>
                  <RatingDisplay>
                    <span>⭐</span>
                    {mockProfile.rating}
                  </RatingDisplay>
                  <LevelBadge $color={userLevel.color}>
                    Lv.{mockProfile.level}
                  </LevelBadge>
                  <PersonalityBadge 
                    $temperament={personalityTemperament}
                    onClick={() => openInlineEditor('personality')}
                    style={{ cursor: 'pointer' }}
                    title="Click to edit personality type"
                  >
                    💭 {mockProfile.personalityType}
                  </PersonalityBadge>
                </TopRightStack>
              </ProfileNameSection>
            </ProfileInfo>
          </ProfileHeader>

          {/* Interests Section */}
          <InterestsContainer 
            onClick={() => openInlineEditor('interests')}
            style={{ cursor: 'pointer' }}
            title="Click to edit interests"
          >
            {mockProfile.interests.map((interest, index) => (
              <InterestTag key={index}>
                {interest}
              </InterestTag>
            ))}
          </InterestsContainer>

          {/* Bio Section */}
          <BioSection 
            onClick={() => openInlineEditor('bio')}
            style={{ cursor: 'pointer' }}
            title="Click to edit bio"
          >
            {mockProfile.bio}
          </BioSection>

          {/* Community Badges */}
          <CommunityBadgesContainer 
            onClick={() => openInlineEditor('communities')}
            style={{ cursor: 'pointer' }}
            title="Click to edit communities"
          >
            {mockProfile.communities.map((community, index) => (
              <CommunityBadge key={index} $type={community.type}>
                {community.name}
                {community.verified && <VerificationTick>✓</VerificationTick>}
              </CommunityBadge>
            ))}
          </CommunityBadgesContainer>
        </ProfileCard>

        {/* Social Media Section */}
        <SocialMediaSection>
          <SocialMediaTitle>Connect with me:</SocialMediaTitle>
          <SocialIconsContainer>
            <SocialIcon 
              $platform="instagram" 
              onClick={() => window.open(`https://instagram.com/${mockProfile.socialMedia.instagram}`, '_blank')}
            >
              📷
            </SocialIcon>
            <SocialIcon 
              $platform="linkedin" 
              onClick={() => window.open(`https://linkedin.com/in/${mockProfile.socialMedia.linkedin}`, '_blank')}
            >
              💼
            </SocialIcon>
            <SocialIcon 
              $platform="twitter" 
              onClick={() => window.open(`https://twitter.com/${mockProfile.socialMedia.twitter}`, '_blank')}
            >
              🐦
            </SocialIcon>
            <SocialIcon 
              $platform="whatsapp" 
              onClick={() => window.open(`https://wa.me/${mockProfile.socialMedia.whatsapp.replace(/\D/g, '')}`, '_blank')}
            >
              📱
            </SocialIcon>
          </SocialIconsContainer>
        </SocialMediaSection>

        {/* Profile Action Buttons */}
        <ProfileActionsContainer>
          <EditProfileButton onClick={() => setShowProfileEditor(true)}>
            ✏️ Edit Profile
          </EditProfileButton>
          <ShareProfileButton onClick={() => setShowShareProfile(true)}>
            📤 Share Profile
          </ShareProfileButton>
        </ProfileActionsContainer>

        <ProfileMenuSection>
          {/* 1. Private Messages */}
          <ProfileMenuItem onClick={openMessaging}>
            <MenuIcon>💬</MenuIcon>
            <MenuContent>
              <MenuTitle>Private Messages</MenuTitle>
            </MenuContent>
            {getTotalUnreadCount() > 0 && (
              <MenuBadge $color="#E74C3C">{getTotalUnreadCount()}</MenuBadge>
            )}
            <MenuArrow>→</MenuArrow>
          </ProfileMenuItem>

          {/* 2. Notifications */}
          <ProfileMenuItem onClick={() => setShowNotificationsModal(true)}>
            <MenuIcon>🔔</MenuIcon>
            <MenuContent>
              <MenuTitle>Notifications</MenuTitle>
            </MenuContent>
            <MenuBadge $color="#E74C3C">5</MenuBadge>
            <MenuArrow>→</MenuArrow>
          </ProfileMenuItem>

          {/* 3. Explore Vouchers */}
          <ProfileMenuItem onClick={() => navigate('/vouchers')}>
            <MenuIcon>🎫</MenuIcon>
            <MenuContent>
              <MenuTitle>Explore Vouchers</MenuTitle>
            </MenuContent>
            <MenuBadge $color="#FF9800">248 pts</MenuBadge>
            <MenuArrow>→</MenuArrow>
          </ProfileMenuItem>

          {/* 4. My Events */}
          <ProfileMenuItem onClick={() => navigate('/my-events')}>
            <MenuIcon>📅</MenuIcon>
            <MenuContent>
              <MenuTitle>My Events</MenuTitle>
            </MenuContent>
            <MenuBadge $color="#666">4 events</MenuBadge>
            <MenuArrow>→</MenuArrow>
          </ProfileMenuItem>


          {/* 6. Manage Events (Admin/Host) */}
          {(mockProfile.isAdmin || mockProfile.isHost) && (
            <ProfileMenuItem onClick={() => navigate('/manage-events')}>
              <MenuIcon>⚡</MenuIcon>
              <MenuContent>
                <MenuTitle>Manage Events</MenuTitle>
              </MenuContent>
              {mockProfile.isAdmin ? (
                <MenuBadge $color="#E74C3C">Admin</MenuBadge>
              ) : (
                <MenuBadge $color="#4A90A4">Host</MenuBadge>
              )}
              <MenuArrow>→</MenuArrow>
            </ProfileMenuItem>
          )}

          {/* 7. My Communities */}
          <ProfileMenuItem onClick={() => navigate('/communities')}>
            <MenuIcon>🏘️</MenuIcon>
            <MenuContent>
              <MenuTitle>My Communities</MenuTitle>
            </MenuContent>
            <MenuBadge $color="#666">3 communities</MenuBadge>
            <MenuArrow>→</MenuArrow>
          </ProfileMenuItem>

          {/* 8. Connected Accounts */}
          <ProfileMenuItem onClick={() => setShowConnectedAccountsModal(true)}>
            <MenuIcon>🔗</MenuIcon>
            <MenuContent>
              <MenuTitle>Connected Accounts</MenuTitle>
            </MenuContent>
            <MenuBadge $color={isGoogleCalendarConnected ? "#4CAF50" : "#FFA500"}>
              {isGoogleCalendarConnected ? 'Connected' : 'Connect'}
            </MenuBadge>
            <MenuArrow>→</MenuArrow>
          </ProfileMenuItem>
        </ProfileMenuSection>

      {/* Connected Accounts Modal */}
      {showConnectedAccountsModal && (
        <ConnectedAccountsModal onClick={() => setShowConnectedAccountsModal(false)}>
          <ConnectedAccountsContent onClick={(e) => e.stopPropagation()}>
            <ConnectedAccountsHeader>
              <ConnectedAccountsTitle>Connected Accounts</ConnectedAccountsTitle>
              <ConnectedAccountsClose onClick={() => setShowConnectedAccountsModal(false)}>×</ConnectedAccountsClose>
            </ConnectedAccountsHeader>

            <AccountItem>
              <AccountInfo>
                <AccountIcon>📅</AccountIcon>
                <AccountDetails>
                  <AccountName>Google Calendar</AccountName>
                  <AccountStatus>
                    {isGoogleCalendarConnected 
                      ? 'Sync your events automatically' 
                      : 'Connect to sync BerseMuka events'}
                  </AccountStatus>
                </AccountDetails>
              </AccountInfo>
              <ConnectButton 
                connected={isGoogleCalendarConnected}
                onClick={async () => {
                  try {
                    const { GoogleCalendarService } = await import('../services/googleCalendar');
                    if (!isGoogleCalendarConnected) {
                      await GoogleCalendarService.init();
                      await GoogleCalendarService.signIn();
                      setIsGoogleCalendarConnected(true);
                      localStorage.setItem('googleCalendarConnected', 'true');
                      alert('Google Calendar connected successfully!');
                    } else {
                      await GoogleCalendarService.signOut();
                      setIsGoogleCalendarConnected(false);
                      localStorage.setItem('googleCalendarConnected', 'false');
                      alert('Google Calendar disconnected');
                    }
                  } catch (error) {
                    console.error('Failed to connect Google Calendar:', error);
                    alert('Failed to connect Google Calendar. Please try again.');
                  }
                }}
              >
                {isGoogleCalendarConnected ? 'Disconnect' : 'Connect'}
              </ConnectButton>
            </AccountItem>

            <AccountItem>
              <AccountInfo>
                <AccountIcon style={{ background: 'linear-gradient(135deg, #0077B5 0%, #00A0DC 100%)' }}>💼</AccountIcon>
                <AccountDetails>
                  <AccountName>LinkedIn</AccountName>
                  <AccountStatus>Share your professional profile</AccountStatus>
                </AccountDetails>
              </AccountInfo>
              <ConnectButton>Connect</ConnectButton>
            </AccountItem>

            <AccountItem>
              <AccountInfo>
                <AccountIcon style={{ background: 'linear-gradient(135deg, #E1306C 0%, #F77737 100%)' }}>📷</AccountIcon>
                <AccountDetails>
                  <AccountName>Instagram</AccountName>
                  <AccountStatus>Share your social moments</AccountStatus>
                </AccountDetails>
              </AccountInfo>
              <ConnectButton>Connect</ConnectButton>
            </AccountItem>

            <AccountItem>
              <AccountInfo>
                <AccountIcon style={{ background: 'linear-gradient(135deg, #1DA1F2 0%, #14171A 100%)' }}>🐦</AccountIcon>
                <AccountDetails>
                  <AccountName>Twitter / X</AccountName>
                  <AccountStatus>Share your thoughts and updates</AccountStatus>
                </AccountDetails>
              </AccountInfo>
              <ConnectButton>Connect</ConnectButton>
            </AccountItem>
          </ConnectedAccountsContent>
        </ConnectedAccountsModal>
      )}

      </Content>

      {/* Comprehensive Messaging Interface */}
      <MessagingOverlay $isOpen={showMessaging} onClick={closeMessaging}>
        <MessagingModal onClick={(e) => e.stopPropagation()}>
          <MessagingHeader>
            <MessagingTitle>
              {messagingView === 'chat' && selectedConversation 
                ? localSelectedConversation.name 
                : 'Private Messages'
              }
            </MessagingTitle>
            <MessagingCloseButton onClick={closeMessaging}>×</MessagingCloseButton>
          </MessagingHeader>

          <MessagingContent>
            {/* Messaging Tabs */}
            <MessagingTabsContainer>
              <MessagingTabButton
                $active={messagingTab === 'direct'}
                onClick={() => setMessagingTab('direct')}
              >
                Direct Messages ({getTotalUnreadCountByTab('direct')})
              </MessagingTabButton>
              <MessagingTabButton
                $active={messagingTab === 'group'}
                onClick={() => setMessagingTab('group')}
              >
                Group Chats ({getTotalUnreadCountByTab('group')})
              </MessagingTabButton>
              <MessagingTabButton
                $active={messagingTab === 'community'}
                onClick={() => setMessagingTab('community')}
              >
                Communities ({getTotalUnreadCountByTab('community')})
              </MessagingTabButton>
            </MessagingTabsContainer>

            {/* Context Banner */}
            {messagingContext.type !== 'general' && (
              <ContextBanner $type={messagingContext.type}>
                {messagingContext.type === 'event' && '📅 Event Discussion'}
                {messagingContext.type === 'service' && '⚙️ Service Inquiry'}
                {messagingContext.type === 'community' && '🏘️ Community Chat'}
                {messagingContext.data && ` • ${messagingContext.data.name || messagingContext.data.title}`}
              </ContextBanner>
            )}

            {messagingView === 'list' ? (
              <ChatListContainer>
                <SearchBar>
                  <SearchInput
                    type="text"
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </SearchBar>

                <ChatList>
                  {getFilteredConversations().filter(conv => {
                    const recipientName = conv.participantNames?.find(name => name !== 'Current User') || conv.name || 'Unknown';
                    return recipientName.toLowerCase().includes(searchQuery.toLowerCase());
                  }).map((conversation) => {
                    // Derive properties from unified conversation interface
                    const recipientName = conversation.participantNames?.find(name => name !== 'Current User') || conversation.name || 'Unknown';
                    const initials = recipientName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                    const avatarColor = `hsl(${(recipientName.charCodeAt(0) * 137.508) % 360}, 70%, 50%)`;
                    const lastMessageContent = conversation.lastMessage?.content || 'No messages yet';
                    const timestamp = conversation.lastMessage ? new Date(conversation.lastMessage.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '';
                    const isGroup = conversation.type === 'group' || conversation.type === 'community';
                    const isOnline = true; // For now, assume online
                    
                    return (
                      <ChatItem
                        key={conversation.id}
                        $hasUnread={conversation.unreadCount > 0}
                        onClick={() => openChat(conversation)}
                      >
                        <ChatAvatar
                          $isGroup={isGroup}
                          $isOnline={isOnline}
                          style={{ background: avatarColor }}
                        >
                          {initials}
                        </ChatAvatar>

                        <ChatInfo>
                          <ChatName>{recipientName}</ChatName>
                          <ChatLastMessage $unread={conversation.unreadCount > 0}>
                            {lastMessageContent}
                          </ChatLastMessage>
                        </ChatInfo>

                        <ChatMeta>
                          <ChatTime>{timestamp}</ChatTime>
                          {conversation.unreadCount > 0 && (
                            <UnreadBadgeChat>{conversation.unreadCount}</UnreadBadgeChat>
                          )}
                        </ChatMeta>
                      </ChatItem>
                    );
                  })}

                  {getFilteredConversations().filter(conv => {
                    const recipientName = conv.participantNames?.find(name => name !== 'Current User') || conv.name || 'Unknown';
                    return recipientName.toLowerCase().includes(searchQuery.toLowerCase());
                  }).length === 0 && (
                    <div style={{ 
                      textAlign: 'center', 
                      padding: '40px 20px', 
                      color: '#666' 
                    }}>
                      {searchQuery ? 'No conversations found' : 'No conversations yet'}
                    </div>
                  )}
                </ChatList>

                <NewChatButton onClick={openGroupCreator}>
                  +
                </NewChatButton>
              </ChatListContainer>
            ) : (
              <ChatContainer>
                <ChatHeader>
                  <BackButton onClick={backToList}>←</BackButton>
                  {(() => {
                    if (!localSelectedConversation) return null;
                    
                    // Derive properties from unified conversation interface
                    const recipientName = localSelectedConversation.participantNames?.find(name => name !== 'Current User') || localSelectedConversation.name || 'Unknown';
                    const initials = recipientName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                    const avatarColor = `hsl(${(recipientName.charCodeAt(0) * 137.508) % 360}, 70%, 50%)`;
                    const isGroup = localSelectedConversation.type === 'group' || localSelectedConversation.type === 'community';
                    const isOnline = true; // For now, assume online
                    
                    return (
                      <>
                        <ChatAvatar
                          $isGroup={isGroup}
                          $isOnline={isOnline}
                          style={{ 
                            background: avatarColor,
                            width: '32px',
                            height: '32px',
                            fontSize: '14px'
                          }}
                        >
                          {initials}
                        </ChatAvatar>
                        <ChatHeaderInfo>
                          <ChatHeaderName>{recipientName}</ChatHeaderName>
                          <ChatHeaderStatus>
                            {isGroup 
                              ? `${localSelectedConversation.participantIds.length} members`
                              : isOnline ? 'Online' : 'Last seen recently'
                            }
                          </ChatHeaderStatus>
                        </ChatHeaderInfo>
                      </>
                    );
                  })()}
                  <ChatOptionsButton>⋮</ChatOptionsButton>
                </ChatHeader>

                <ChatMessages>
                  {localSelectedConversation && messages[localSelectedConversation.id] ? 
                    messages[localSelectedConversation.id].map((message) => {
                      const isSent = message.senderId === 'current-user';
                      const isGroup = localSelectedConversation.type === 'group' || localSelectedConversation.type === 'community';
                      
                      return (
                        <MessageGroup key={message.id} $isSent={isSent}>
                          <div>
                            <MessageBubble $isSent={isSent}>
                              {isGroup && !isSent && message.senderName && (
                                <div style={{ 
                                  fontSize: '12px', 
                                  fontWeight: 'bold', 
                                  marginBottom: '4px',
                                  color: isSent ? 'rgba(255,255,255,0.8)' : '#007BFF'
                                }}>
                                  {message.senderName}
                                </div>
                              )}
                              {message.content}
                              <MessageTimestamp $isSent={isSent}>
                                {new Date(message.timestamp).toLocaleTimeString('en-US', { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </MessageTimestamp>
                              {isSent && (
                                <MessageStatus>
                                  {message.read ? '✓✓' : '✓'}
                                </MessageStatus>
                              )}
                            </MessageBubble>
                          </div>
                        </MessageGroup>
                      );
                    })
                  : (
                    <div style={{ 
                      textAlign: 'center', 
                      padding: '40px 20px', 
                      color: '#666' 
                    }}>
                      No messages yet
                    </div>
                  )}
                </ChatMessages>

                <ChatInputContainer>
                  <ChatInput
                    type="text"
                    placeholder="Type a message..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                  <SendButton 
                    $disabled={!messageInput.trim()}
                    onClick={sendLocalMessage}
                  >
                    →
                  </SendButton>
                </ChatInputContainer>
              </ChatContainer>
            )}

            {/* Group Creator Modal */}
            {showGroupCreator && (
              <GroupCreatorModal>
                <GroupCreatorHeader>
                  <MessagingCloseButton onClick={closeGroupCreator}>←</MessagingCloseButton>
                  <GroupCreatorTitle>New Group</GroupCreatorTitle>
                  <div style={{ width: '30px' }} />
                </GroupCreatorHeader>

                <GroupCreatorContent>
                  <GroupNameInput
                    type="text"
                    placeholder="Group name"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                  />

                  <div style={{ marginBottom: '16px', fontSize: '14px', fontWeight: '600', color: '#333' }}>
                    Add participants (select 2-10 people):
                  </div>

                  <ContactsList>
                    {mockContacts.map((contact) => (
                      <ContactItem
                        key={contact.id}
                        $selected={selectedContacts.includes(contact.id)}
                        onClick={() => toggleContactSelection(contact.id)}
                      >
                        <ContactCheckbox $checked={selectedContacts.includes(contact.id)}>
                          {selectedContacts.includes(contact.id) && '✓'}
                        </ContactCheckbox>
                        
                        <ChatAvatar
                          $isOnline={contact.isOnline}
                          style={{ 
                            background: contact.avatarColor,
                            width: '40px',
                            height: '40px',
                            fontSize: '16px'
                          }}
                        >
                          {contact.initials}
                        </ChatAvatar>

                        <ChatInfo style={{ marginLeft: '12px' }}>
                          <ChatName>{contact.name}</ChatName>
                          <ChatLastMessage>
                            {contact.isOnline ? 'Online' : 'Last seen recently'}
                          </ChatLastMessage>
                        </ChatInfo>
                      </ContactItem>
                    ))}
                  </ContactsList>

                  <CreateGroupButton
                    $disabled={!groupName.trim() || selectedContacts.length < 2 || selectedContacts.length > 10}
                    onClick={createGroup}
                  >
                    Create Group ({selectedContacts.length}/10)
                  </CreateGroupButton>
                </GroupCreatorContent>
              </GroupCreatorModal>
            )}
          </MessagingContent>
        </MessagingModal>
      </MessagingOverlay>

      {/* Notifications Modal */}
      <ModalOverlay $isOpen={showNotificationsModal} onClick={() => setShowNotificationsModal(false)}>
        <Modal onClick={(e) => e.stopPropagation()}>
          <ModalHeader>
            <ModalTitle>🔔 Notifications</ModalTitle>
            <ModalCloseButton onClick={() => setShowNotificationsModal(false)}>×</ModalCloseButton>
          </ModalHeader>
          <ModalContent>
            {mockNotifications.map((notification) => (
              <NotificationItem key={notification.id} $type={notification.type}>
                <NotificationIcon $type={notification.type}>
                  {notification.type === 'trust' ? '🔗' :
                   notification.type === 'review' ? '⭐' :
                   notification.type === 'service' ? '⚙️' :
                   notification.type === 'event' ? '🎉' : '👥'}
                </NotificationIcon>
                
                <NotificationContent>
                  <NotificationText>{notification.text}</NotificationText>
                  <NotificationTime>{notification.time}</NotificationTime>
                </NotificationContent>
                
                {notification.hasActions && (
                  <NotificationActions>
                    <NotificationButton 
                      $variant="accept"
                      onClick={() => alert(`Accepted: ${notification.text}`)}
                    >
                      Accept
                    </NotificationButton>
                    <NotificationButton 
                      $variant="decline"
                      onClick={() => alert(`Declined: ${notification.text}`)}
                    >
                      Decline
                    </NotificationButton>
                  </NotificationActions>
                )}
              </NotificationItem>
            ))}
            
            {mockNotifications.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#666' }}>
                <p>No notifications yet</p>
              </div>
            )}
          </ModalContent>
        </Modal>
      </ModalOverlay>

      {/* Profile Editor Modal */}
      {showProfileEditor && (
        <ProfileEditorModal>
          <EditorHeader>
            <EditorHeaderButton $variant="cancel" onClick={handleCancel}>
              Cancel
            </EditorHeaderButton>
            <EditorTitle>Edit Profile</EditorTitle>
            <EditorHeaderButton 
              $variant="save" 
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save'}
            </EditorHeaderButton>
          </EditorHeader>

          <EditorContent>
            {/* Photo Upload Section */}
            <EditorSection>
              <EditorSectionTitle>📷 Profile Photo</EditorSectionTitle>
              <PhotoUploadSection>
                <PhotoUploadButton onClick={() => document.getElementById('photo-upload')?.click()}>
                  {formData.avatar ? (
                    <img 
                      src={URL.createObjectURL(formData.avatar)} 
                      alt="Profile preview" 
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: '50%'
                      }}
                    />
                  ) : (
                    <div 
                      style={{
                        width: '100%',
                        height: '100%',
                        background: mockProfile.avatarColor,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '32px',
                        fontWeight: 'bold'
                      }}
                    >
                      {formData.name.split(' ').map(n => n[0]).join('') || 'AH'}
                    </div>
                  )}
                </PhotoUploadButton>
                <PhotoUploadText>Tap to change photo</PhotoUploadText>
                <HiddenFileInput
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                />
              </PhotoUploadSection>
            </EditorSection>

            {/* Basic Info Section */}
            <EditorSection>
              <EditorSectionTitle>👤 Basic Information</EditorSectionTitle>
              
              <EditorField>
                <EditorLabel>Full Name</EditorLabel>
                <EditorInput
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                  placeholder="Enter your full name"
                  className={formErrors.name ? 'error' : ''}
                />
                {formErrors.name && <ErrorMessage>{formErrors.name}</ErrorMessage>}
              </EditorField>

              <EditorField>
                <EditorLabel>Date of Birth</EditorLabel>
                <EditorInput
                  type="date"
                  value={formData.dateOfBirth || ''}
                  onChange={(e) => {
                    handleFormChange('dateOfBirth', e.target.value);
                    // Update calculated age
                    const age = calculateAge(e.target.value);
                    handleFormChange('age', age);
                  }}
                  max={new Date().toISOString().split('T')[0]}
                />
                <SliderValue>Age: {calculateAge(formData.dateOfBirth)} years old</SliderValue>
              </EditorField>

              <EditorField>
                <EditorLabel>Profession</EditorLabel>
                <EditorInput
                  type="text"
                  value={formData.profession}
                  onChange={(e) => handleFormChange('profession', e.target.value)}
                  placeholder="What do you do for work?"
                  className={formErrors.profession ? 'error' : ''}
                />
                {formErrors.profession && <ErrorMessage>{formErrors.profession}</ErrorMessage>}
              </EditorField>
            </EditorSection>

            {/* Personality & Interests Section */}
            <EditorSection>
              <EditorSectionTitle>🧠 Personality & Interests</EditorSectionTitle>
              
              <EditorField>
                <EditorLabel>MBTI Personality Type</EditorLabel>
                <EditorSelect
                  value={formData.personalityType}
                  onChange={(e) => handleFormChange('personalityType', e.target.value)}
                >
                  {personalityTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </EditorSelect>
              </EditorField>

              <EditorField>
                <EditorLabel>Interests (Select multiple)</EditorLabel>
                {formErrors.interests && <ErrorMessage>{formErrors.interests}</ErrorMessage>}
                <TagSelector>
                  {interestOptions.map(interest => (
                    <TagOption
                      key={interest}
                      type="button"
                      $selected={formData.interests.includes(interest)}
                      onClick={() => handleInterestToggle(interest)}
                    >
                      {interest}
                    </TagOption>
                  ))}
                </TagSelector>
              </EditorField>
            </EditorSection>

            {/* Bio Section */}
            <EditorSection>
              <EditorSectionTitle>📝 About Me</EditorSectionTitle>
              
              <EditorField>
                <EditorLabel>Bio (Max 50 words)</EditorLabel>
                <EditorTextarea
                  value={formData.bio}
                  onChange={(e) => handleFormChange('bio', e.target.value)}
                  placeholder="Tell others about yourself, your passions, and what makes you unique..."
                  className={formErrors.bio ? 'error' : ''}
                />
                <CharacterCounter $over={getBioWordCount() > 50}>
                  {getBioWordCount()}/50 words
                </CharacterCounter>
                {formErrors.bio && <ErrorMessage>{formErrors.bio}</ErrorMessage>}
              </EditorField>
            </EditorSection>

            {/* Social Media Section */}
            <EditorSection>
              <EditorSectionTitle>🌐 Social Media</EditorSectionTitle>
              
              <EditorField>
                <EditorLabel>📷 Instagram Handle</EditorLabel>
                <EditorInput
                  type="text"
                  value={formData.socialMedia.instagram}
                  onChange={(e) => handleSocialMediaChange('instagram', e.target.value)}
                  placeholder="@yourusername"
                />
              </EditorField>

              <EditorField>
                <EditorLabel>💼 LinkedIn Profile</EditorLabel>
                <EditorInput
                  type="text"
                  value={formData.socialMedia.linkedin}
                  onChange={(e) => handleSocialMediaChange('linkedin', e.target.value)}
                  placeholder="your-profile-name"
                />
              </EditorField>

              <EditorField>
                <EditorLabel>🐦 Twitter Handle</EditorLabel>
                <EditorInput
                  type="text"
                  value={formData.socialMedia.twitter}
                  onChange={(e) => handleSocialMediaChange('twitter', e.target.value)}
                  placeholder="@yourusername"
                />
              </EditorField>

              <EditorField>
                <EditorLabel>📱 WhatsApp Number</EditorLabel>
                <EditorInput
                  type="text"
                  value={formData.socialMedia.whatsapp}
                  onChange={(e) => handleSocialMediaChange('whatsapp', e.target.value)}
                  placeholder="+60123456789"
                />
              </EditorField>
            </EditorSection>

            {/* Services Section */}
            <EditorSection>
              <EditorSectionTitle>⚙️ Services Offered</EditorSectionTitle>
              
              <EditorField>
                <EditorLabel>Select services you offer</EditorLabel>
                <TagSelector>
                  {serviceOptions.map(service => (
                    <TagOption
                      key={service}
                      type="button"
                      $selected={formData.services.includes(service)}
                      onClick={() => handleServiceToggle(service)}
                    >
                      {service}
                    </TagOption>
                  ))}
                </TagSelector>
              </EditorField>

              <EditorField style={{ marginTop: '16px' }}>
                <EditorHeaderButton 
                  $variant="save" 
                  onClick={openServicesEditor}
                  style={{ width: '100%', background: '#28A745' }}
                >
                  🔧 Configure Service Details
                </EditorHeaderButton>
              </EditorField>
            </EditorSection>

            {/* Events I Organize Section */}
            <EventsOrganizerSection>
              <EventsOrganizerTitle>📅 Events I Organize</EventsOrganizerTitle>
              
              <div style={{ marginBottom: '16px' }}>
                <EditorLabel>Organization Roles & Delegation</EditorLabel>
                {organizerRoles.map((role) => (
                  <OrganizationRoleCard 
                    key={role.organizationId} 
                    $verified={role.verified}
                  >
                    <OrganizationName>{role.organizationName}</OrganizationName>
                    <OrganizationRole>{role.role}</OrganizationRole>
                    <DelegationStatus $status={role.delegationStatus}>
                      {role.delegationStatus === 'approved' ? '✅ Delegation Approved - Can create events' :
                       role.delegationStatus === 'pending' ? '⏳ Delegation Request Pending' : 
                       role.verified ? '🔒 Request delegation to create events' : '❓ Organization verification pending'}
                    </DelegationStatus>
                    
                    {role.verified && role.delegationStatus === 'none' && (
                      <CreateEventButton 
                        onClick={() => requestDelegation(role.organizationId)}
                        style={{ background: '#007BFF', marginTop: '8px' }}
                      >
                        Request Event Creation Delegation
                      </CreateEventButton>
                    )}
                    
                    {role.delegationStatus === 'approved' && (
                      <CreateEventButton 
                        onClick={() => createDelegatedEvent(role.organizationName)}
                      >
                        Create Event for {role.organizationName}
                      </CreateEventButton>
                    )}
                  </OrganizationRoleCard>
                ))}
              </div>

              <CreateEventButton onClick={createPersonalEvent}>
                ✨ Create Personal Event
              </CreateEventButton>
              
              <div style={{ 
                fontSize: '12px', 
                color: '#666', 
                marginTop: '12px', 
                padding: '8px 12px',
                background: '#f8f9fa',
                borderRadius: '6px'
              }}>
                💡 Personal events show your name as organizer. Delegated events show "Organization via Your Name".
              </div>
            </EventsOrganizerSection>
          </EditorContent>
        </ProfileEditorModal>
      )}

      {/* Inline Editor Modals */}
      <InlineEditorOverlay $isOpen={showInlineEditor !== null} onClick={() => setShowInlineEditor(null)}>
        <InlineEditorModal onClick={(e) => e.stopPropagation()}>
          {showInlineEditor === 'name' && (
            <>
              <InlineEditorTitle>Edit Name</InlineEditorTitle>
              <EditorInput
                type="text"
                value={formData.name}
                onChange={(e) => handleFormChange('name', e.target.value)}
                placeholder="Enter your full name"
              />
              <InlineEditorButtons>
                <InlineEditorButton 
                  $variant="secondary" 
                  onClick={() => setShowInlineEditor(null)}
                >
                  Cancel
                </InlineEditorButton>
                <InlineEditorButton 
                  $variant="primary" 
                  onClick={saveInlineEdit}
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </InlineEditorButton>
              </InlineEditorButtons>
            </>
          )}

          {showInlineEditor === 'bio' && (
            <>
              <InlineEditorTitle>Edit Bio</InlineEditorTitle>
              <EditorTextarea
                value={formData.bio}
                onChange={(e) => handleFormChange('bio', e.target.value)}
                placeholder="Tell others about yourself..."
              />
              <CharacterCounter $over={getBioWordCount() > 50}>
                {getBioWordCount()}/50 words
              </CharacterCounter>
              <InlineEditorButtons>
                <InlineEditorButton 
                  $variant="secondary" 
                  onClick={() => setShowInlineEditor(null)}
                >
                  Cancel
                </InlineEditorButton>
                <InlineEditorButton 
                  $variant="primary" 
                  onClick={saveInlineEdit}
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </InlineEditorButton>
              </InlineEditorButtons>
            </>
          )}

          {showInlineEditor === 'interests' && (
            <>
              <InlineEditorTitle>Edit Interests</InlineEditorTitle>
              <TagSelector>
                {interestOptions.map(interest => (
                  <TagOption
                    key={interest}
                    type="button"
                    $selected={formData.interests.includes(interest)}
                    onClick={() => handleInterestToggle(interest)}
                  >
                    {interest}
                  </TagOption>
                ))}
              </TagSelector>
              <InlineEditorButtons>
                <InlineEditorButton 
                  $variant="secondary" 
                  onClick={() => setShowInlineEditor(null)}
                >
                  Cancel
                </InlineEditorButton>
                <InlineEditorButton 
                  $variant="primary" 
                  onClick={saveInlineEdit}
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </InlineEditorButton>
              </InlineEditorButtons>
            </>
          )}

          {showInlineEditor === 'age-profession' && (
            <>
              <InlineEditorTitle>Edit Age & Profession</InlineEditorTitle>
              
              <EditorField style={{ marginBottom: '16px' }}>
                <EditorLabel>Date of Birth</EditorLabel>
                <EditorInput
                  type="date"
                  value={formData.dateOfBirth || ''}
                  onChange={(e) => {
                    handleFormChange('dateOfBirth', e.target.value);
                    // Update calculated age
                    const age = calculateAge(e.target.value);
                    handleFormChange('age', age);
                  }}
                  max={new Date().toISOString().split('T')[0]}
                />
                <SliderValue>Age: {calculateAge(formData.dateOfBirth)} years old</SliderValue>
              </EditorField>

              <EditorField>
                <EditorLabel>Profession</EditorLabel>
                <EditorInput
                  type="text"
                  value={formData.profession}
                  onChange={(e) => handleFormChange('profession', e.target.value)}
                  placeholder="What do you do for work?"
                />
              </EditorField>

              <InlineEditorButtons>
                <InlineEditorButton 
                  $variant="secondary" 
                  onClick={() => setShowInlineEditor(null)}
                >
                  Cancel
                </InlineEditorButton>
                <InlineEditorButton 
                  $variant="primary" 
                  onClick={saveInlineEdit}
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </InlineEditorButton>
              </InlineEditorButtons>
            </>
          )}

          {showInlineEditor === 'personality' && (
            <>
              <InlineEditorTitle>Edit Personality Type</InlineEditorTitle>
              
              <EditorField>
                <EditorLabel>MBTI Personality Type</EditorLabel>
                <EditorSelect
                  value={formData.personalityType}
                  onChange={(e) => handleFormChange('personalityType', e.target.value)}
                >
                  {personalityTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </EditorSelect>
              </EditorField>

              <InlineEditorButtons>
                <InlineEditorButton 
                  $variant="secondary" 
                  onClick={() => setShowInlineEditor(null)}
                >
                  Cancel
                </InlineEditorButton>
                <InlineEditorButton 
                  $variant="primary" 
                  onClick={saveInlineEdit}
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </InlineEditorButton>
              </InlineEditorButtons>
            </>
          )}

          {showInlineEditor === 'communities' && (
            <>
              <InlineEditorTitle>Edit Communities</InlineEditorTitle>
              
              <div style={{ 
                background: '#F8F9FA', 
                padding: '12px', 
                borderRadius: '6px', 
                marginBottom: '16px',
                fontSize: '14px',
                color: '#666'
              }}>
                🏛️ Community management is coming soon! You'll be able to join verified communities, manage your memberships, and showcase your affiliations.
              </div>

              <InlineEditorButtons>
                <InlineEditorButton 
                  $variant="primary" 
                  onClick={() => setShowInlineEditor(null)}
                  style={{ width: '100%' }}
                >
                  Got it
                </InlineEditorButton>
              </InlineEditorButtons>
            </>
          )}
        </InlineEditorModal>
      </InlineEditorOverlay>

      {/* Photo Cropper Modal */}
      {showPhotoCropper && selectedPhoto && (
        <PhotoCropperModal>
          <CropperHeader>
            <CropperButton $variant="cancel" onClick={handleCropCancel}>
              Cancel
            </CropperButton>
            <CropperTitle>Crop Photo</CropperTitle>
            <CropperButton $variant="done" onClick={handleCropDone}>
              Done
            </CropperButton>
          </CropperHeader>

          <CropperContent>
            <CropperCanvas>
              <CropperImage 
                src={URL.createObjectURL(selectedPhoto)}
                alt="Photo to crop"
                style={{
                  transform: `scale(${cropData.scale})`,
                  transition: 'transform 0.2s ease'
                }}
                draggable={false}
              />
              <CropperFrame 
                $size={cropData.size}
                $x={cropData.x}
                $y={cropData.y}
              />
            </CropperCanvas>
          </CropperContent>

          <CropperInstructions>
            <div style={{ marginBottom: '8px' }}>
              📷 Position and scale your photo
            </div>
            <ZoomSlider
              type="range"
              min="0.5"
              max="3"
              step="0.1"
              value={cropData.scale}
              onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
            />
            <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)' }}>
              Drag the slider to zoom • Tap Done when ready
            </div>
          </CropperInstructions>
        </PhotoCropperModal>
      )}

      {/* Comprehensive Services Editor Modal */}
      <ServicesEditorOverlay $isOpen={showServicesEditor} onClick={closeServicesEditor}>
        <ServicesEditorModal onClick={(e) => e.stopPropagation()}>
          <ServicesEditorHeader>
            <ServicesEditorTitle>🔧 Configure Services</ServicesEditorTitle>
            <MessagingCloseButton onClick={closeServicesEditor}>×</MessagingCloseButton>
          </ServicesEditorHeader>

          <ServicesEditorContent>
            {/* Service Category Selector */}
            <ServiceCategorySelector>
              {serviceCategories.map((category) => (
                <ServiceCategoryButton
                  key={category.id}
                  $selected={selectedServiceCategory === category.id}
                  $color={category.color}
                  onClick={() => handleServiceCategorySelect(category.id)}
                >
                  <span>{category.icon}</span>
                  {category.name}
                </ServiceCategoryButton>
              ))}
            </ServiceCategorySelector>

            {/* Service Details Form */}
            <ServiceDetailsForm>
              <ServiceDetailTitle>
                {serviceCategories.find(cat => cat.id === selectedServiceCategory)?.icon} {' '}
                {serviceCategories.find(cat => cat.id === selectedServiceCategory)?.name} Details
              </ServiceDetailTitle>

              {/* Basic Information */}
              <ServiceDetailSection>
                <ServiceFormGrid>
                  <ServiceFormField>
                    <ServiceFormLabel>Service Title</ServiceFormLabel>
                    <ServiceFormInput
                      type="text"
                      placeholder={
                        selectedServiceCategory === 'local-guides' ? 'KL Heritage Walking Tours' :
                        selectedServiceCategory === 'homestay' ? 'Cultural Homestay Experience' :
                        selectedServiceCategory === 'freelance' ? 'Professional Web Development' :
                        selectedServiceCategory === 'marketplace' ? 'Vintage Electronics Collection' :
                        'Open for Networking'
                      }
                      value={getCurrentServiceDetails().title || ''}
                      onChange={(e) => handleServiceDetailChange('title', e.target.value)}
                    />
                  </ServiceFormField>

                  <ServiceFormField>
                    <ServiceFormLabel>
                      {selectedServiceCategory === 'marketplace' ? 'Price Range' : 'Pricing'}
                    </ServiceFormLabel>
                    <ServiceFormInput
                      type="text"
                      placeholder={
                        selectedServiceCategory === 'marketplace' ? 'RM 50 - RM 500' : 'RM 50/hour'
                      }
                      value={getCurrentServiceDetails().pricing || ''}
                      onChange={(e) => handleServiceDetailChange('pricing', e.target.value)}
                    />
                  </ServiceFormField>
                </ServiceFormGrid>

                <ServiceFormField>
                  <ServiceFormLabel>Description</ServiceFormLabel>
                  <ServiceFormTextarea
                    placeholder={
                      selectedServiceCategory === 'local-guides' ? 'Share your expertise about local culture, history, and hidden gems...' :
                      selectedServiceCategory === 'homestay' ? 'Describe your accommodation, amenities, and cultural experience...' :
                      selectedServiceCategory === 'freelance' ? 'Detail your professional skills, experience, and project approach...' :
                      selectedServiceCategory === 'marketplace' ? 'List items you\'re selling, their condition, and details...' :
                      'Explain what kind of connections and collaborations you\'re seeking...'
                    }
                    value={getCurrentServiceDetails().description || ''}
                    onChange={(e) => handleServiceDetailChange('description', e.target.value)}
                  />
                </ServiceFormField>

                {selectedServiceCategory !== 'open-connect' && (
                  <ServiceFormGrid>
                    <ServiceFormField>
                      <ServiceFormLabel>Availability</ServiceFormLabel>
                      <ServiceFormSelect
                        value={getCurrentServiceDetails().availability || 'weekends'}
                        onChange={(e) => handleServiceDetailChange('availability', e.target.value)}
                      >
                        <option value="weekends">Weekends</option>
                        <option value="weekdays">Weekdays</option>
                        <option value="anytime">Anytime</option>
                        <option value="by-appointment">By Appointment</option>
                      </ServiceFormSelect>
                    </ServiceFormField>

                    <ServiceFormField>
                      <ServiceFormLabel>
                        {selectedServiceCategory === 'marketplace' ? 'Condition' : 'Experience Level'}
                      </ServiceFormLabel>
                      <ServiceFormSelect
                        value={getCurrentServiceDetails().level || 'intermediate'}
                        onChange={(e) => handleServiceDetailChange('level', e.target.value)}
                      >
                        {selectedServiceCategory === 'marketplace' ? (
                          <>
                            <option value="new">Brand New</option>
                            <option value="excellent">Excellent</option>
                            <option value="good">Good</option>
                            <option value="fair">Fair</option>
                          </>
                        ) : (
                          <>
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                            <option value="expert">Expert</option>
                          </>
                        )}
                      </ServiceFormSelect>
                    </ServiceFormField>
                  </ServiceFormGrid>
                )}
              </ServiceDetailSection>

              {/* Skills/Categories Tags */}
              <ServiceDetailSection>
                <ServiceFormLabel>
                  {selectedServiceCategory === 'marketplace' ? 'Item Categories' : 'Skills & Specializations'}
                </ServiceFormLabel>
                <SkillTagsContainer>
                  {skillsByCategory[selectedServiceCategory as keyof typeof skillsByCategory]?.map((skill) => (
                    <SkillTag
                      key={skill}
                      $selected={getCurrentSkills().includes(skill)}
                      onClick={() => handleSkillToggle(skill)}
                    >
                      {skill}
                    </SkillTag>
                  ))}
                </SkillTagsContainer>
              </ServiceDetailSection>

              {/* Portfolio Upload */}
              <ServiceDetailSection>
                <ServiceFormLabel>
                  {selectedServiceCategory === 'marketplace' ? 'Item Photos' : 'Portfolio & Examples'}
                </ServiceFormLabel>
                <PortfolioUploadSection onClick={() => handlePortfolioUpload(selectedServiceCategory)}>
                  <PortfolioUploadIcon>
                    {selectedServiceCategory === 'marketplace' ? '📸' : '📁'}
                  </PortfolioUploadIcon>
                  <PortfolioUploadText>
                    {selectedServiceCategory === 'marketplace' ? 'Add Item Photos' : 'Upload Portfolio Files'}
                  </PortfolioUploadText>
                  <PortfolioUploadSubtext>
                    {selectedServiceCategory === 'marketplace' ? 
                      'Support: JPG, PNG (Max 5MB each)' : 
                      'Support: PDF, JPG, PNG, MP4 (Max 10MB each)'
                    }
                  </PortfolioUploadSubtext>
                </PortfolioUploadSection>
              </ServiceDetailSection>

              {/* Additional Options for Marketplace */}
              {selectedServiceCategory === 'marketplace' && (
                <ServiceDetailSection>
                  <ServiceFormGrid>
                    <ServiceFormField>
                      <ServiceFormLabel>Delivery Options</ServiceFormLabel>
                      <ServiceFormSelect
                        value={getCurrentServiceDetails().delivery || 'pickup'}
                        onChange={(e) => handleServiceDetailChange('delivery', e.target.value)}
                      >
                        <option value="pickup">Pickup Only</option>
                        <option value="delivery">Local Delivery</option>
                        <option value="shipping">Nationwide Shipping</option>
                        <option value="all">All Options</option>
                      </ServiceFormSelect>
                    </ServiceFormField>

                    <ServiceFormField>
                      <ServiceFormLabel>Payment Methods</ServiceFormLabel>
                      <ServiceFormSelect
                        value={getCurrentServiceDetails().payment || 'cash'}
                        onChange={(e) => handleServiceDetailChange('payment', e.target.value)}
                      >
                        <option value="cash">Cash Only</option>
                        <option value="transfer">Bank Transfer</option>
                        <option value="ewallet">E-Wallet</option>
                        <option value="all">All Methods</option>
                      </ServiceFormSelect>
                    </ServiceFormField>
                  </ServiceFormGrid>
                </ServiceDetailSection>
              )}
            </ServiceDetailsForm>
          </ServicesEditorContent>

          <ServicesEditorButtons>
            <ServicesEditorButton $variant="secondary" onClick={closeServicesEditor}>
              Cancel
            </ServicesEditorButton>
            <ServicesEditorButton $variant="primary" onClick={saveServicesData}>
              Save Service Details
            </ServicesEditorButton>
          </ServicesEditorButtons>
        </ServicesEditorModal>
      </ServicesEditorOverlay>

      {/* Community Dashboard Modal */}
      <CommunityDashboardOverlay $isOpen={showCommunityDashboard} onClick={closeCommunityDashboard}>
        <CommunityDashboardModal onClick={(e) => e.stopPropagation()}>
          <CommunityDashboardHeader>
            <CommunityDashboardTitle>🏘️ My Communities</CommunityDashboardTitle>
            <MessagingCloseButton onClick={closeCommunityDashboard}>×</MessagingCloseButton>
          </CommunityDashboardHeader>

          <CommunityTabsContainer>
            <CommunityTab
              $active={communityTab === 'my-communities'}
              onClick={() => handleCommunityTabChange('my-communities')}
            >
              My Communities
            </CommunityTab>
            <CommunityTab
              $active={communityTab === 'discover'}
              onClick={() => handleCommunityTabChange('discover')}
            >
              Discover
            </CommunityTab>
            <CommunityTab
              $active={communityTab === 'requests'}
              onClick={() => handleCommunityTabChange('requests')}
            >
              Requests
            </CommunityTab>
          </CommunityTabsContainer>

          <CommunityContent>
            {communityTab === 'my-communities' && (
              <CommunityList>
                {mockCommunities.filter(community => community.status === 'member').map((community) => (
                  <CommunityCard key={community.id} $verified={community.verified}>
                    <CommunityHeader>
                      <CommunityAvatar>
                        {community.avatar}
                      </CommunityAvatar>
                      <CommunityInfo>
                        <CommunityName>
                          {community.name}
                          <VerificationBadge $verified={community.verified}>
                            {community.verified ? '✓ Verified' : '⏳ Pending'}
                          </VerificationBadge>
                        </CommunityName>
                        <CommunityRole>{community.role}</CommunityRole>
                        <CommunityMeta>{community.memberCount} members</CommunityMeta>
                      </CommunityInfo>
                    </CommunityHeader>
                    <CommunityActions>
                      <CommunityActionButton
                        $variant="primary"
                        onClick={() => openCommunityProfile(community)}
                      >
                        View Community
                      </CommunityActionButton>
                      {community.canMessage && (
                        <CommunityActionButton
                          $variant="secondary"
                          onClick={() => messageCommunity(community)}
                        >
                          💬 Message
                        </CommunityActionButton>
                      )}
                      <CommunityActionButton
                        $variant="secondary"
                        onClick={() => leaveCommunity(community.id)}
                      >
                        Leave
                      </CommunityActionButton>
                    </CommunityActions>
                  </CommunityCard>
                ))}
              </CommunityList>
            )}

            {communityTab === 'discover' && (
              <div>
                <CommunityDiscoverySection>
                  <DiscoveryTitle>Browse by Category</DiscoveryTitle>
                  <DiscoveryGrid>
                    {communityCategories.map((category) => (
                      <DiscoveryCard
                        key={category.id}
                        onClick={() => alert(`🔍 Browse ${category.name} communities`)}
                      >
                        <DiscoveryIcon>{category.icon}</DiscoveryIcon>
                        <DiscoveryName>{category.name}</DiscoveryName>
                        <DiscoveryMeta>{category.count} communities</DiscoveryMeta>
                      </DiscoveryCard>
                    ))}
                  </DiscoveryGrid>
                </CommunityDiscoverySection>

                <CommunityDiscoverySection>
                  <DiscoveryTitle>Recommended for You</DiscoveryTitle>
                  <CommunityList>
                    <CommunityCard>
                      <CommunityHeader>
                        <CommunityAvatar style={{ background: 'linear-gradient(135deg, #9C27B0, #E91E63)' }}>
                          🎨
                        </CommunityAvatar>
                        <CommunityInfo>
                          <CommunityName>
                            Creative Photographers MY
                            <VerificationBadge $verified={true}>✓ Verified</VerificationBadge>
                          </CommunityName>
                          <CommunityRole>Based on your interests</CommunityRole>
                          <CommunityMeta>567 members • Very Active</CommunityMeta>
                        </CommunityInfo>
                      </CommunityHeader>
                      <CommunityActions>
                        <CommunityActionButton
                          $variant="primary"
                          onClick={() => joinCommunity('recommended-1')}
                        >
                          Request to Join
                        </CommunityActionButton>
                        <CommunityActionButton
                          $variant="secondary"
                          onClick={() => alert('📖 View community details')}
                        >
                          View Details
                        </CommunityActionButton>
                      </CommunityActions>
                    </CommunityCard>
                  </CommunityList>
                </CommunityDiscoverySection>
              </div>
            )}

            {communityTab === 'manage' && (
              <div>
                <EventManagementSection>
                  <SectionHeader>
                    <h3>📊 Event Dashboard</h3>
                    <AdminCreateEventButton onClick={() => alert('➕ Create New Event\n\nThis would open the event creation form with:\n• Event details and description\n• Date, time, and location\n• Registration limits and pricing\n• Google Forms integration\n• Payment processing setup\n• WhatsApp group creation')}>
                      + Create New Event
                    </AdminCreateEventButton>
                  </SectionHeader>
                  
                  {/* Mock Events */}
                  <EventsList>
                    <EventCard>
                      <EventHeader>
                        <EventStatus $status="active">🟢 Active</EventStatus>
                        <EventDate>May 25, 2025</EventDate>
                      </EventHeader>
                      <EventTitle>Community Networking Meetup</EventTitle>
                      <EventStats>
                        <EventStat>
                          <EventStatLabel>Registered:</EventStatLabel>
                          <EventStatValue>47/60</EventStatValue>
                        </EventStat>
                        <EventStat>
                          <EventStatLabel>Paid:</EventStatLabel>
                          <EventStatValue>42/47</EventStatValue>
                        </EventStat>
                      </EventStats>
                      <EventActions>
                        <EventActionButton $variant="primary" onClick={() => openEventDashboard('event-1')}>
                          📊 Dashboard
                        </EventActionButton>
                        <EventActionButton $variant="secondary" onClick={() => manageEventForms('event-1')}>
                          📝 Forms  
                        </EventActionButton>
                        <EventActionButton $variant="secondary" onClick={() => manageChatGroups('event-1')}>
                          💬 Chat
                        </EventActionButton>
                      </EventActions>
                    </EventCard>
                  </EventsList>
                </EventManagementSection>

                {/* Community Management Section */}
                {mockCommunities.filter(community => community.canManage).length > 0 ? (
                  <div>
                    <CommunityManagementSection>
                      <EventSectionTitle>🏘️ Community Management</EventSectionTitle>
                      <CommunityList>
                        {mockCommunities.filter(community => community.canManage).map((community) => (
                          <CommunityCard key={community.id} $verified={community.verified}>
                            <CommunityHeader>
                              <CommunityAvatar>
                                {community.avatar}
                              </CommunityAvatar>
                              <CommunityInfo>
                                <CommunityName>
                                  {community.name}
                                  <VerificationBadge $verified={community.verified}>
                                    Manager
                                  </VerificationBadge>
                                </CommunityName>
                                <CommunityRole>{community.role}</CommunityRole>
                                <CommunityMeta>{community.memberCount} members</CommunityMeta>
                              </CommunityInfo>
                            </CommunityHeader>
                            <CommunityActions>
                              <CommunityActionButton
                                $variant="primary"
                                onClick={() => alert('📊 Admin dashboard would open')}
                              >
                                Admin Dashboard
                              </CommunityActionButton>
                              <CommunityActionButton
                                $variant="secondary"
                                onClick={() => alert('👥 Member management')}
                              >
                                Manage Members
                              </CommunityActionButton>
                            </CommunityActions>
                          </CommunityCard>
                        ))}
                      </CommunityList>
                    </CommunityManagementSection>
                  </div>
                ) : (
                  <EmptyState>
                    <EmptyStateIcon>👑</EmptyStateIcon>
                    <EmptyStateTitle>No Communities to Manage</EmptyStateTitle>
                    <EmptyStateSubtitle>You don't have admin privileges in any communities yet.</EmptyStateSubtitle>
                  </EmptyState>
                )}
              </div>
            )}

            {communityTab === 'discover' && (
              <div>
                <CommunityDiscoverySection>
                  <DiscoveryTitle>Browse by Category</DiscoveryTitle>
                  <DiscoveryGrid>
                    {communityCategories.map((category) => (
                      <DiscoveryCard
                        key={category.id}
                        onClick={() => alert(`🔍 Browse ${category.name} communities`)}
                      >
                        <DiscoveryIcon>{category.icon}</DiscoveryIcon>
                        <DiscoveryName>{category.name}</DiscoveryName>
                        <DiscoveryMeta>{category.count} communities</DiscoveryMeta>
                      </DiscoveryCard>
                    ))}
                  </DiscoveryGrid>
                </CommunityDiscoverySection>

                <CommunityDiscoverySection>
                  <DiscoveryTitle>Recommended for You</DiscoveryTitle>
                  <CommunityList>
                    <CommunityCard>
                      <CommunityHeader>
                        <CommunityAvatar style={{ background: 'linear-gradient(135deg, #9C27B0, #E91E63)' }}>
                          🎨
                        </CommunityAvatar>
                        <CommunityInfo>
                          <CommunityName>
                            Creative Photographers MY
                            <VerificationBadge $verified={true}>✓ Verified</VerificationBadge>
                          </CommunityName>
                          <CommunityRole>Based on your interests</CommunityRole>
                          <CommunityMeta>567 members • Very Active</CommunityMeta>
                        </CommunityInfo>
                      </CommunityHeader>
                      <CommunityActions>
                        <CommunityActionButton
                          $variant="primary"
                          onClick={() => joinCommunity('recommended-1')}
                        >
                          Request to Join
                        </CommunityActionButton>
                        <CommunityActionButton
                          $variant="secondary"
                          onClick={() => alert('📖 View community details')}
                        >
                          View Details
                        </CommunityActionButton>
                      </CommunityActions>
                    </CommunityCard>
                  </CommunityList>
                </CommunityDiscoverySection>
              </div>
            )}

            {communityTab === 'requests' && (
              <div>
                {mockCommunities.filter(community => community.status === 'pending').length > 0 ? (
                  <CommunityList>
                    {mockCommunities.filter(community => community.status === 'pending').map((community) => (
                      <CommunityCard key={community.id}>
                        <CommunityHeader>
                          <CommunityAvatar>
                            {community.avatar}
                          </CommunityAvatar>
                          <CommunityInfo>
                            <CommunityName>
                              {community.name}
                              <VerificationBadge $verified={false}>⏳ Pending</VerificationBadge>
                            </CommunityName>
                            <CommunityRole>Application sent</CommunityRole>
                            <CommunityMeta>{community.memberCount} members</CommunityMeta>
                          </CommunityInfo>
                        </CommunityHeader>
                        <CommunityActions>
                          <CommunityActionButton
                            $variant="secondary"
                            onClick={() => alert('❌ Withdraw application')}
                          >
                            Withdraw
                          </CommunityActionButton>
                          <CommunityActionButton
                            $variant="secondary"
                            onClick={() => alert('💬 Message admin for status')}
                          >
                            Message Admin
                          </CommunityActionButton>
                        </CommunityActions>
                      </CommunityCard>
                    ))}
                  </CommunityList>
                ) : (
                  <EmptyState>
                    <EmptyStateIcon>📝</EmptyStateIcon>
                    <EmptyStateTitle>No Pending Requests</EmptyStateTitle>
                    <EmptyStateSubtitle>You haven't sent any community join requests.</EmptyStateSubtitle>
                    <EmptyStateButton onClick={() => handleCommunityTabChange('discover')}>
                      Discover Communities
                    </EmptyStateButton>
                  </EmptyState>
                )}
              </div>
            )}
          </CommunityContent>
        </CommunityDashboardModal>
      </CommunityDashboardOverlay>

      {/* Google Forms Integration Modal */}
      {showGoogleForms && (
        <CommunityDashboardOverlay $isOpen={showGoogleForms} onClick={closeGoogleForms}>
          <CommunityDashboardModal onClick={(e) => e.stopPropagation()}>
            <CommunityDashboardHeader>
              <CommunityDashboardTitle>📋 Google Forms Integration</CommunityDashboardTitle>
              <MessagingCloseButton onClick={closeGoogleForms}>×</MessagingCloseButton>
            </CommunityDashboardHeader>
            
            <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
              <GoogleFormsIntegration 
                eventId={currentFormEvent || undefined}
                communityId="community-1"
                onFormCreated={(formData) => {
                  console.log('Form created:', formData);
                  alert(`✅ Form "${formData.name}" created successfully!\n\n🔗 Integration complete with:\n• Auto-populate enabled\n• Payment processing ready\n• WhatsApp group automation\n• Real-time analytics tracking`);
                }}
              />
            </div>
          </CommunityDashboardModal>
        </CommunityDashboardOverlay>
      )}

      {/* Registration Tracking Modal */}
      {showRegistrationTracker && (
        <CommunityDashboardOverlay $isOpen={showRegistrationTracker} onClick={closeRegistrationTracker}>
          <CommunityDashboardModal onClick={(e) => e.stopPropagation()}>
            <CommunityDashboardHeader>
              <CommunityDashboardTitle>📊 Event Dashboard</CommunityDashboardTitle>
              <MessagingCloseButton onClick={closeRegistrationTracker}>×</MessagingCloseButton>
            </CommunityDashboardHeader>
            
            <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
              <RegistrationTracker 
                eventId={currentTrackerEvent || undefined}
                onRegistrantAction={(action, registrantId) => {
                  console.log('Registrant action:', action, registrantId);
                }}
              />
            </div>
          </CommunityDashboardModal>
        </CommunityDashboardOverlay>
      )}

      {/* Chat Group Management Modal */}
      {showChatManager && (
        <CommunityDashboardOverlay $isOpen={showChatManager} onClick={closeChatManager}>
          <CommunityDashboardModal onClick={(e) => e.stopPropagation()}>
            <CommunityDashboardHeader>
              <CommunityDashboardTitle>💬 Chat Group Manager</CommunityDashboardTitle>
              <MessagingCloseButton onClick={closeChatManager}>×</MessagingCloseButton>
            </CommunityDashboardHeader>
            
            <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
              <ChatGroupManager 
                eventId={currentChatEvent || undefined}
                onGroupAction={(action, groupId) => {
                  console.log('Group action:', action, groupId);
                }}
              />
            </div>
          </CommunityDashboardModal>
        </CommunityDashboardOverlay>
      )}

      {/* My Events Modal */}
      {showMyEventsModal && (
        <ModalOverlay $isOpen={showMyEventsModal} onClick={() => setShowMyEventsModal(false)}>
          <MyEventsModal onClick={(e) => e.stopPropagation()}>
            <MyEventsModalHeader>
              <MyEventsModalTitle>📅 My Events</MyEventsModalTitle>
              <CloseButton onClick={() => setShowMyEventsModal(false)}>×</CloseButton>
            </MyEventsModalHeader>
            
            <EventFilterTabs>
              <FilterTab 
                $active={eventFilter === 'upcoming'} 
                onClick={() => setEventFilter('upcoming')}
              >
                Upcoming ({mockUserEvents.filter(e => e.status === 'upcoming').length})
              </FilterTab>
              <FilterTab 
                $active={eventFilter === 'past'} 
                onClick={() => setEventFilter('past')}
              >
                Past Events ({mockUserEvents.filter(e => e.status === 'completed' || e.status === 'cancelled').length})
              </FilterTab>
            </EventFilterTabs>

            <EventsContent>
              {getFilteredUserEvents().map((event) => (
                <UserEventCard key={event.id}>
                  <EventIcon>🎯</EventIcon>
                  <EventDetails>
                    <UserEventTitle>{event.title}</UserEventTitle>
                    <UserEventMeta>
                      📅 {formatEventDate(event.date)} at {event.time}<br/>
                      📍 {event.location}<br/>
                      👥 {event.organizer}
                    </UserEventMeta>
                    <UserEventStatus>
                      <StatusBadge $status={event.status}>
                        {event.status === 'upcoming' && '📅 Registered'}
                        {event.status === 'completed' && '✅ Attended'}
                        {event.status === 'cancelled' && '❌ Cancelled'}
                      </StatusBadge>
                    </UserEventStatus>
                    
                    {event.groupAssignments && event.groupAssignments.length > 0 && (
                      <GroupInfo>
                        {event.groupAssignments.map((group, index) => (
                          <GroupDetail key={index}>
                            {group.session}: {group.value}
                          </GroupDetail>
                        ))}
                      </GroupInfo>
                    )}
                  </EventDetails>
                  
                  <UserEventActions>
                    <ModalActionButton onClick={() => viewEventDetails(event.id)}>
                      📊 Details
                    </ModalActionButton>
                    <ModalActionButton onClick={() => openEventChatGroup(event.id)}>
                      💬 Chat
                    </ModalActionButton>
                    {event.status === 'completed' && !event.feedback && (
                      <ModalActionButton onClick={() => submitFeedback(event.id)}>
                        ⭐ Feedback
                      </ModalActionButton>
                    )}
                    {event.status === 'upcoming' && (
                      <ModalActionButton onClick={() => downloadEventQR(event.id)}>
                        📱 QR
                      </ModalActionButton>
                    )}
                  </UserEventActions>
                </UserEventCard>
              ))}
              
              {getFilteredUserEvents().length === 0 && (
                <MyEventsEmptyState>
                  <EmptyIcon>📅</EmptyIcon>
                  <EmptyTitle>No {eventFilter} events</EmptyTitle>
                  <EmptyMessage>
                    {eventFilter === 'upcoming' 
                      ? 'Join events from BerseConnect to see them here'
                      : 'Your completed events will appear here'
                    }
                  </EmptyMessage>
                </MyEventsEmptyState>
              )}
            </EventsContent>
          </MyEventsModal>
        </ModalOverlay>
      )}

      {/* Admin Event Management Modal */}
      {showAdminEventManagement && (
        <ModalOverlay $isOpen={showAdminEventManagement} onClick={() => setShowAdminEventManagement(false)}>
          <AdminEventModal onClick={(e) => e.stopPropagation()}>
            <AdminEventModalHeader>
              <AdminEventModalTitle>🛠️ Manage Events (Admin)</AdminEventModalTitle>
              <CloseButton onClick={() => setShowAdminEventManagement(false)}>×</CloseButton>
            </AdminEventModalHeader>
            
            <AdminContent>
              <SectionHeader>
                <h3>📊 Event Dashboard</h3>
                <AdminCreateEventButton onClick={() => alert('➕ Create New Event\n\nThis would open the event creation form with:\n• Event details and description\n• Date, time, and location\n• Registration limits and pricing\n• Google Forms integration\n• Payment processing setup\n• WhatsApp group creation')}>
                  + Create New Event
                </AdminCreateEventButton>
              </SectionHeader>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {mockAdminEvents.map((event) => (
                  <AdminEventCard key={event.id}>
                    <AdminEventHeader>
                      <AdminEventTitle>{event.title}</AdminEventTitle>
                      <AdminEventStatus $status={event.status}>
                        {event.status.toUpperCase()}
                      </AdminEventStatus>
                    </AdminEventHeader>
                    
                    <AdminEventStats>
                      <StatCard>
                        <StatNumber>{event.registrations.length}</StatNumber>
                        <StatLabel>Registered</StatLabel>
                      </StatCard>
                      <StatCard>
                        <StatNumber>{event.paidCount}</StatNumber>
                        <StatLabel>Paid</StatLabel>
                      </StatCard>
                      <StatCard>
                        <StatNumber>{event.checkedInCount}</StatNumber>
                        <StatLabel>Checked In</StatLabel>
                      </StatCard>
                      <StatCard>
                        <StatNumber>RM {event.revenue}</StatNumber>
                        <StatLabel>Revenue</StatLabel>
                      </StatCard>
                    </AdminEventStats>
                    
                    <AdminEventActions>
                      <AdminActionButton onClick={() => openAdminEventDashboard(event.id)}>
                        📊 Dashboard
                      </AdminActionButton>
                      <AdminActionButton onClick={() => openBerseMukhaManagement(event.id)}>
                        🎯 BerseMukha Management
                      </AdminActionButton>
                      <AdminActionButton onClick={() => generateAttendanceQR(event.id)}>
                        📱 Generate QR
                      </AdminActionButton>
                    </AdminEventActions>
                  </AdminEventCard>
                ))}
              </div>
            </AdminContent>
          </AdminEventModal>
        </ModalOverlay>
      )}

      {/* BerseMukha Management Modal */}
      {showBerseMukhaManagement && selectedAdminEvent && (
        <ModalOverlay $isOpen={showBerseMukhaManagement} onClick={() => setShowBerseMukhaManagement(false)}>
          <BerseMukhaModal onClick={(e) => e.stopPropagation()}>
            <BerseMukhaModalHeader>
              <BerseMukhaBackButton onClick={() => {
                setShowBerseMukhaManagement(false);
                setShowAdminEventManagement(true);
              }}>
                ← Event Management
              </BerseMukhaBackButton>
              <BerseMukhaModalTitle>🎯 BerseMukha</BerseMukhaModalTitle>
              <div style={{ width: '100px' }} />
            </BerseMukhaModalHeader>
            
            <BerseMukhaTabNavigation>
              <BerseMukhaTabButton 
                $active={berseMukhaTab === 'checkin'} 
                onClick={() => setBerseMukhaTab('checkin')}
              >
                Check-in
              </BerseMukhaTabButton>
              <BerseMukhaTabButton 
                $active={berseMukhaTab === 'groups'} 
                onClick={() => setBerseMukhaTab('groups')}
              >
                Groups
              </BerseMukhaTabButton>
              <BerseMukhaTabButton 
                $active={berseMukhaTab === 'feedback'} 
                onClick={() => setBerseMukhaTab('feedback')}
              >
                Feedback
              </BerseMukhaTabButton>
            </BerseMukhaTabNavigation>

            <BerseMukhaContent>
              {berseMukhaTab === 'checkin' && (
                <div>
                  <QRSection>
                    <BerseMukhaQRContainer>
                      <h3>📱 Attendance QR Code</h3>
                      <QRCodeDisplay>
                        <div style={{
                          width: '150px',
                          height: '150px',
                          background: '#2fce98',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          textAlign: 'center'
                        }}>
                          QR Code<br/>
                          {selectedAdminEvent.title}
                        </div>
                      </QRCodeDisplay>
                      <QRInfo>
                        Participants scan this code to check in
                      </QRInfo>
                      <RegenerateQRButton onClick={regenerateAttendanceQR}>
                        🔄 Regenerate QR
                      </RegenerateQRButton>
                    </BerseMukhaQRContainer>
                    
                    <QRScannerSection>
                      <h3>📸 Scan Participant QR</h3>
                      <QRScanButton onClick={() => setShowQRScanner(true)}>
                        📱 Open QR Scanner
                      </QRScanButton>
                    </QRScannerSection>
                  </QRSection>

                  <AttendanceList>
                    <AttendanceHeader>
                      <h3>👥 Attendance ({selectedAdminEvent.checkedInCount}/{selectedAdminEvent.registrations.length})</h3>
                      <AttendanceSearchInput 
                        placeholder="Search participants..."
                        value={participantSearch}
                        onChange={(e) => setParticipantSearch(e.target.value)}
                      />
                    </AttendanceHeader>
                    
                    <ParticipantsList>
                      {getFilteredParticipants().map((participant) => (
                        <ParticipantItem key={participant.id}>
                          <ParticipantInfo>
                            <ParticipantName>{participant.name}</ParticipantName>
                            <ParticipantDetails>
                              {participant.email} • {participant.phone}
                            </ParticipantDetails>
                          </ParticipantInfo>
                          <CheckInStatus>
                            {participant.checkedIn ? (
                              <StatusBadge $status="completed">
                                ✅ {participant.checkInTime ? formatTime(participant.checkInTime) : 'Checked In'}
                              </StatusBadge>
                            ) : (
                              <CheckInButton onClick={() => manualCheckIn(participant.id)}>
                                Check In
                              </CheckInButton>
                            )}
                          </CheckInStatus>
                        </ParticipantItem>
                      ))}
                    </ParticipantsList>
                  </AttendanceList>
                </div>
              )}

              {berseMukhaTab === 'groups' && (
                <GroupManagementContent>
                  <GroupManagementHeader>
                    <h3>Group Management</h3>
                  </GroupManagementHeader>
                  
                  <SessionTabs>
                    <SessionTab 
                      $active={activeSession === 1} 
                      onClick={() => setActiveSession(1)}
                    >
                      Session 1 (Numbers)
                    </SessionTab>
                    <SessionTab 
                      $active={activeSession === 2} 
                      onClick={() => setActiveSession(2)}
                    >
                      Session 2 (Colors)
                    </SessionTab>
                  </SessionTabs>

                  <DiversityPreferences>
                    <h4>Diversity Preferences</h4>
                    <PreferenceSlider>
                      <SliderLabel>Gender Balance Priority: {diversitySettings.gender}%</SliderLabel>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={diversitySettings.gender}
                        onChange={(e) => setDiversitySettings({...diversitySettings, gender: Number(e.target.value)})}
                      />
                    </PreferenceSlider>
                    <PreferenceSlider>
                      <SliderLabel>Age Diversity Priority: {diversitySettings.age}%</SliderLabel>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={diversitySettings.age}
                        onChange={(e) => setDiversitySettings({...diversitySettings, age: Number(e.target.value)})}
                      />
                    </PreferenceSlider>
                  </DiversityPreferences>

                  <GroupingActions>
                    <GenerateGroupsButton onClick={generateDiverseGroups}>
                      🎲 Generate Diverse Groups (Max 15 groups)
                    </GenerateGroupsButton>
                    <RegenerateButton onClick={regenerateGroups}>
                      🔄 Regenerate for Better Diversity
                    </RegenerateButton>
                  </GroupingActions>

                  <div style={{
                    textAlign: 'center',
                    padding: '40px 20px',
                    color: '#666'
                  }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎲</div>
                    <h3 style={{ color: '#2fce98', marginBottom: '8px' }}>Group Generation Ready</h3>
                    <p style={{ fontSize: '14px' }}>
                      Adjust diversity settings above and click "Generate Groups" to create optimized participant groups
                    </p>
                  </div>
                </GroupManagementContent>
              )}

              {berseMukhaTab === 'feedback' && (
                <FeedbackContent>
                  <FeedbackStats>
                    <StatCard>
                      <StatNumber>{getFeedbackStats().totalResponses}</StatNumber>
                      <StatLabel>Total Responses</StatLabel>
                    </StatCard>
                    <StatCard>
                      <StatNumber>{getFeedbackStats().averageRating.toFixed(1)}</StatNumber>
                      <StatLabel>Average Rating</StatLabel>
                    </StatCard>
                    <StatCard>
                      <StatNumber>{getFeedbackStats().recommendationRate}%</StatNumber>
                      <StatLabel>Would Recommend</StatLabel>
                    </StatCard>
                  </FeedbackStats>

                  <FeedbackList>
                    <FeedbackHeader>
                      <h3>📝 Participant Feedback</h3>
                      <ExportButton onClick={exportFeedback}>
                        📤 Export
                      </ExportButton>
                    </FeedbackHeader>
                    
                    {selectedAdminEvent.feedbackSubmissions.map((feedback) => (
                      <FeedbackItem key={feedback.id}>
                        <ParticipantFeedbackHeader>
                          <ParticipantName>{feedback.participantName}</ParticipantName>
                          <ParticipantFeedbackRating>
                            {'⭐'.repeat(feedback.rating)}
                          </ParticipantFeedbackRating>
                        </ParticipantFeedbackHeader>
                        <ParticipantFeedbackComment>{feedback.comments}</ParticipantFeedbackComment>
                        <FeedbackSuggestions>
                          <strong>Suggestions:</strong> {feedback.suggestions}
                        </FeedbackSuggestions>
                        <FeedbackDate>{formatDate(feedback.submittedAt)}</FeedbackDate>
                      </FeedbackItem>
                    ))}
                    
                    {selectedAdminEvent.feedbackSubmissions.length === 0 && (
                      <div style={{
                        textAlign: 'center',
                        padding: '40px 20px',
                        color: '#666'
                      }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
                        <h3 style={{ color: '#2fce98', marginBottom: '8px' }}>No Feedback Yet</h3>
                        <p style={{ fontSize: '14px' }}>
                          Feedback will appear here after participants submit their event reviews
                        </p>
                      </div>
                    )}
                  </FeedbackList>
                </FeedbackContent>
              )}
            </BerseMukhaContent>
          </BerseMukhaModal>
        </ModalOverlay>
      )}

      {/* Participant Event Details Modal */}
      {showEventDetailsModal && selectedEventDetails && (
        <ModalOverlay $isOpen={showEventDetailsModal} onClick={() => setShowEventDetailsModal(false)}>
          <EventDetailsModal onClick={(e) => e.stopPropagation()}>
            <EventDetailsHeader>
              <EventDetailsBackButton onClick={() => {
                setShowEventDetailsModal(false);
                setShowMyEventsModal(true);
              }}>
                ← Back to My Events
              </EventDetailsBackButton>
              <EventDetailsTitle>{selectedEventDetails.title}</EventDetailsTitle>
              <div style={{ width: '140px' }} /> {/* Spacer for centering */}
            </EventDetailsHeader>
            
            <EventDetailsContent>
              {/* Event Information Section */}
              <EventSection>
                <EventDetailsSectionTitle>📅 Event Information</EventDetailsSectionTitle>
                <EventInfo>
                  <EventInfoRow>
                    <EventInfoLabel>📅 Date & Time:</EventInfoLabel>
                    <EventInfoValue>{formatEventDate(selectedEventDetails.date)} at {selectedEventDetails.time}</EventInfoValue>
                  </EventInfoRow>
                  <EventInfoRow>
                    <EventInfoLabel>📍 Location:</EventInfoLabel>
                    <EventInfoValue>{selectedEventDetails.location}</EventInfoValue>
                  </EventInfoRow>
                  <EventInfoRow>
                    <EventInfoLabel>👥 Organizer:</EventInfoLabel>
                    <EventInfoValue>{selectedEventDetails.organizer}</EventInfoValue>
                  </EventInfoRow>
                  <EventInfoRow>
                    <EventInfoLabel>🏷️ Category:</EventInfoLabel>
                    <EventInfoValue style={{ textTransform: 'capitalize' }}>{selectedEventDetails.type}</EventInfoValue>
                  </EventInfoRow>
                  <EventInfoRow>
                    <EventInfoLabel>📝 Status:</EventInfoLabel>
                    <EventInfoValue>
                      <StatusBadge $status={selectedEventDetails.status}>
                        {selectedEventDetails.status === 'upcoming' && '📅 Registered'}
                        {selectedEventDetails.status === 'completed' && '✅ Attended'}
                        {selectedEventDetails.status === 'cancelled' && '❌ Cancelled'}
                      </StatusBadge>
                    </EventInfoValue>
                  </EventInfoRow>
                </EventInfo>
              </EventSection>

              {/* Event Description */}
              <EventSection>
                <EventDetailsSectionTitle>📋 Description</EventDetailsSectionTitle>
                <EventDescription>{selectedEventDetails.description}</EventDescription>
              </EventSection>

              {/* QR Code Section for Upcoming Events */}
              {selectedEventDetails.status === 'upcoming' && (
                <EventSection>
                  <EventDetailsSectionTitle>📱 Check-in QR Code</EventDetailsSectionTitle>
                  <QRCodeSection>
                    <QRCodeContainer>
                      <QRCanvas id="event-details-qr-canvas" />
                    </QRCodeContainer>
                    <QRInstructions>
                      <strong>Show this QR code at the event for check-in</strong>
                      <br />
                      Code: {selectedEventDetails.qrCode}
                      <br />
                      <em>Screenshots are accepted. Keep your screen brightness high for best scanning.</em>
                    </QRInstructions>
                  </QRCodeSection>
                </EventSection>
              )}

              {/* Group Assignments */}
              {selectedEventDetails.groupAssignments && selectedEventDetails.groupAssignments.length > 0 && (
                <EventSection>
                  <EventDetailsSectionTitle>👥 Group Assignments</EventDetailsSectionTitle>
                  <GroupAssignments>
                    {selectedEventDetails.groupAssignments.map((group: any, index: number) => (
                      <GroupAssignmentCard key={index}>
                        <GroupAssignmentHeader>{group.session}</GroupAssignmentHeader>
                        <GroupAssignmentValue style={{ color: group.color }}>
                          {group.type === 'number' ? `Group ${group.value}` : group.value}
                        </GroupAssignmentValue>
                      </GroupAssignmentCard>
                    ))}
                  </GroupAssignments>
                  <GroupNote>
                    💡 Group assignments are designed for optimal diversity and meaningful connections
                  </GroupNote>
                </EventSection>
              )}

              {/* Registration Details */}
              <EventSection>
                <EventDetailsSectionTitle>📋 Registration Details</EventDetailsSectionTitle>
                <EventInfo>
                  <EventInfoRow>
                    <EventInfoLabel>📅 Registered On:</EventInfoLabel>
                    <EventInfoValue>{formatEventDate(selectedEventDetails.registrationDate)}</EventInfoValue>
                  </EventInfoRow>
                  <EventInfoRow>
                    <EventInfoLabel>✅ Check-in Status:</EventInfoLabel>
                    <EventInfoValue style={{ textTransform: 'capitalize' }}>{selectedEventDetails.checkInStatus}</EventInfoValue>
                  </EventInfoRow>
                </EventInfo>
              </EventSection>

              {/* Feedback Section for Completed Events */}
              {selectedEventDetails.status === 'completed' && selectedEventDetails.feedback && (
                <EventSection>
                  <EventDetailsSectionTitle>⭐ My Feedback</EventDetailsSectionTitle>
                  <FeedbackSection>
                    <FeedbackRating>
                      {[1, 2, 3, 4, 5].map(star => (
                        <FeedbackStar key={star} $filled={star <= selectedEventDetails.feedback.rating}>
                          ★
                        </FeedbackStar>
                      ))}
                      <FeedbackRatingText>({selectedEventDetails.feedback.rating}/5)</FeedbackRatingText>
                    </FeedbackRating>
                    <FeedbackComment>{selectedEventDetails.feedback.comment}</FeedbackComment>
                  </FeedbackSection>
                </EventSection>
              )}

              {/* Cancellation Reason for Cancelled Events */}
              {selectedEventDetails.status === 'cancelled' && selectedEventDetails.cancelReason && (
                <EventSection>
                  <EventDetailsSectionTitle>❌ Cancellation Notice</EventDetailsSectionTitle>
                  <CancellationNotice>
                    {selectedEventDetails.cancelReason}
                  </CancellationNotice>
                </EventSection>
              )}

              {/* Action Buttons */}
              <EventActionsSection>
                <EventDetailsActionButton onClick={() => openEventChatGroup(selectedEventDetails.id)}>
                  💬 Chat Group
                </EventDetailsActionButton>
                {selectedEventDetails.status === 'upcoming' && (
                  <EventDetailsActionButton onClick={() => downloadEventQR(selectedEventDetails.id)}>
                    📱 Download QR
                  </EventDetailsActionButton>
                )}
                <EventDetailsActionButton onClick={() => shareEventDetails(selectedEventDetails.id)}>
                  📤 Share Event
                </EventDetailsActionButton>
                {selectedEventDetails.status === 'completed' && !selectedEventDetails.feedback && (
                  <EventDetailsActionButton $primary onClick={() => submitFeedback(selectedEventDetails.id)}>
                    ⭐ Leave Feedback
                  </EventDetailsActionButton>
                )}
                {selectedEventDetails.canCancel && selectedEventDetails.status === 'upcoming' && (
                  <EventDetailsActionButton $danger onClick={() => cancelEventRegistration(selectedEventDetails.id)}>
                    🚫 Cancel Registration
                  </EventDetailsActionButton>
                )}
              </EventActionsSection>
            </EventDetailsContent>
          </EventDetailsModal>
        </ModalOverlay>
      )}

      <MainNav 
        activeTab="home"
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
            case 'forum':
              navigate('/forum');
              break;
          }
        }}
      />
      
      {/* Shareable Profile Card Modal */}
      {showShareProfile && user && (
        <ShareableProfileCard
          user={{
            id: user.id || '',
            fullName: user.fullName || '',
            username: user.username,
            profilePicture: user.profilePicture,
            bio: user.bio,
            shortBio: user.shortBio,
            currentLocation: user.currentLocation || user.city,
            profession: user.profession,
            interests: user.interests,
            age: user.age || (user.dateOfBirth ? calculateAge(user.dateOfBirth) : undefined),
            personalityType: user.personalityType,
            instagramHandle: user.instagramHandle,
            linkedinHandle: user.linkedinHandle
          }}
          onClose={() => setShowShareProfile(false)}
        />
      )}
    </Container>
  );
};