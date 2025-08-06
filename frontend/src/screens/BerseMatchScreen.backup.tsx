import React, { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { StatusBar } from '../components/StatusBar/StatusBar';
import { MainNav } from '../components/MainNav';
// import matchingService from '@frontend-api/services/matching.service';
// import { User } from '@frontend-api/types';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #F9F3E3;
  max-width: 393px;
  margin: 0 auto;
`;

const Header = styled.div`
  padding: 16px 20px;
  background-color: #F5F3EF;
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
  background: url('https://via.placeholder.com/40/2D5F4F/FFFFFF?text=ZA') center/cover;
  background-color: #2D5F4F;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 14px;
  overflow: hidden;
`;

const AvatarImage = styled.img`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
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

const BackHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background-color: #F5F3EF;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: #333;
  font-size: 16px;
  cursor: pointer;
`;

const MoreButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 4px;
`;

const Content = styled.div`
  flex: 1;
  padding: 0 20px 80px 20px;
  overflow-y: auto;
`;

const SearchContainer = styled.div`
  margin-bottom: 20px;
`;

const SearchBar = styled.div`
  background: white;
  border-radius: 12px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 16px;
`;

const SearchInput = styled.input`
  border: none;
  outline: none;
  flex: 1;
  font-size: 14px;
  color: #333;
  
  &::placeholder {
    color: #999;
  }
`;

const FilterRow = styled.div`
  display: flex;
  gap: 12px;
`;

const FilterDropdown = styled.select`
  flex: 1;
  padding: 12px;
  border: 1px solid #E5E5E5;
  border-radius: 8px;
  background: white;
  font-size: 14px;
  color: #333;
  cursor: pointer;
`;

// Filter Modal Styles
const FilterModalOverlay = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: ${({ isOpen }) => isOpen ? 'flex' : 'none'};
  align-items: flex-end;
  z-index: 1000;
`;

const FilterModal = styled.div`
  background: white;
  border-radius: 20px 20px 0 0;
  padding: 20px;
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
  color: #333;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  color: #666;
  cursor: pointer;
  padding: 0;
`;

const CheckboxGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
`;

const CheckboxItem = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #333;
`;

const Checkbox = styled.input`
  margin: 0;
  width: 16px;
  height: 16px;
  accent-color: #2D5F4F;
`;

const FilterActions = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;
`;

const FilterButton = styled.button`
  flex: 1;
  padding: 14px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
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
  padding: 14px;
  border: 1px solid #E5E5E5;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  background-color: white;
  color: #666;
  
  &:hover {
    background-color: #f5f5f5;
  }
`;

const UserCard = styled.div`
  background: white;
  border-radius: 16px;
  margin-bottom: 16px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`;

const UserCardHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 16px;
`;

const UserAvatar = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #2D5F4F;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 20px;
  position: relative;
  overflow: hidden;
`;

const UserAvatarImage = styled.img`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
`;

const VerifiedBadge = styled.div`
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 20px;
  height: 20px;
  background-color: #2D5F4F;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
  
  &::after {
    content: '✓';
    color: white;
    font-size: 10px;
    font-weight: bold;
  }
`;

const UserInfo2 = styled.div`
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
  font-size: 18px;
  font-weight: bold;
  color: #333;
`;

const Rating = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #666;
`;

const StarIcon = styled.span`
  color: #FFD700;
  font-size: 14px;
`;

const UserMeta = styled.div`
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
`;

const UserBio = styled.p`
  font-size: 14px;
  color: #333;
  line-height: 1.4;
  margin: 0;
`;

const TrustChain = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 16px 0;
  font-size: 12px;
  color: #666;
`;

const ChainIcon = styled.div`
  width: 16px;
  height: 16px;
  background-color: #E5E5E5;
  border-radius: 50%;
`;

const ConnectionInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
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
  border-radius: 50%;
  background-color: #2D5F4F;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 10px;
  font-weight: bold;
`;

const ClosestFriends = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #666;
`;

const FriendAvatars = styled.div`
  display: flex;
  margin-right: 4px;
`;

const FriendAvatarSmall = styled.div`
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
  
  &:hover {
    background-color: #1F4A3A;
  }
`;

// Empty State Styles
const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 16px;
  margin: 20px 0;
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
  color: #7B68EE;
`;

const EmptyTitle = styled.h3`
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #999;
  font-weight: normal;
`;

const EmptySubtitle = styled.p`
  margin: 0 0 24px 0;
  font-size: 14px;
  color: #999;
  line-height: 1.4;
`;

const RefreshButton = styled.button`
  background-color: #2D5F4F;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  
  &:hover {
    background-color: #1F4A3A;
  }
`;

// Profile Detail Modal Styles
const ProfileModal = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #F5F3EF;
  z-index: 1000;
  display: ${({ isOpen }) => isOpen ? 'flex' : 'none'};
  flex-direction: column;
  max-width: 393px;
  margin: 0 auto;
`;

const ProfileContent = styled.div`
  flex: 1;
  padding: 0 20px 80px 20px;
  overflow-y: auto;
`;

const ProfileCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`;

const ProfileAvatar = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: url('https://via.placeholder.com/80') center/cover;
  margin: 0 auto 16px;
  position: relative;
`;

const ProfileHeader = styled.div`
  text-align: center;
  margin-bottom: 20px;
`;

const PersonalityType = styled.div`
  background-color: #E8F4F0;
  color: #2D5F4F;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
  display: inline-block;
  margin-bottom: 8px;
`;

const ProfileName = styled.h2`
  margin: 0 0 4px 0;
  font-size: 24px;
  font-weight: bold;
  color: #333;
`;

const ProfileRating = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
`;

const SocialLinks = styled.div`
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 20px;
`;

const SocialIcon = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid #E5E5E5;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 16px;
  
  &:hover {
    background-color: #f5f5f5;
  }
`;

const SectionTitle = styled.h4`
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
`;

const InterestTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
`;

const InterestTag = styled.span`
  padding: 6px 12px;
  background-color: #E8F4F0;
  color: #2D5F4F;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
`;

// These styles are moved to the detailed profile section
// const OfferingsSection, OfferingsTitle, etc. are now DetailedOfferingsSection, etc.

// Detailed Profile Modal Styles
const DetailedProfileModal = styled.div<{ show: boolean }>`
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
  padding: 20px;
`;

const DetailedProfileContent = styled.div`
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 400px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
`;

const DetailedProfileHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid #F0F0F0;
  position: relative;
`;

const DetailedCloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
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

const DetailedUserInfo = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 16px;
`;

const DetailedUserAvatar = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: url('https://via.placeholder.com/80/2D5F4F/FFFFFF?text=U') center/cover;
  background-color: #2D5F4F;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 24px;
  position: relative;
  overflow: hidden;
`;

const DetailedUserMeta = styled.div`
  flex: 1;
`;

const DetailedUserName = styled.h2`
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: bold;
  color: #333;
`;

const DetailedUserBasic = styled.div`
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
`;

const DetailedUserBio = styled.p`
  font-size: 14px;
  line-height: 1.5;
  color: #333;
  margin: 0;
`;

const CommunityMessage = styled.div`
  background: linear-gradient(135deg, #E8F4F0 0%, #D4E9E3 100%);
  border-radius: 12px;
  padding: 16px;
  margin: 16px 0;
  text-align: center;
`;

const CommunityText = styled.p`
  margin: 0;
  font-size: 14px;
  color: #2D5F4F;
  font-weight: 500;
  font-style: italic;
`;

const DetailedOfferingsSection = styled.div`
  padding: 20px;
`;

const DetailedOfferingsTitle = styled.h3`
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
`;

const DetailedOfferingCard = styled.div`
  background: #F8F9FA;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  border-left: 4px solid #2D5F4F;
`;

const DetailedOfferingHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
`;

const DetailedOfferingCategory = styled.span`
  background: #2D5F4F;
  color: white;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
`;

const DetailedOfferingPrice = styled.span`
  color: #4A90A4;
  font-size: 14px;
  font-weight: 600;
`;

const DetailedOfferingTitle = styled.h4`
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
`;

const DetailedOfferingDescription = styled.p`
  margin: 0 0 16px 0;
  font-size: 14px;
  color: #666;
  line-height: 1.5;
`;

const OfferingActions = styled.div`
  display: flex;
  gap: 12px;
`;

const ChatButton = styled.button`
  flex: 1;
  padding: 12px;
  border: 1px solid #2D5F4F;
  border-radius: 8px;
  background: white;
  color: #2D5F4F;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  
  &:hover {
    background: #F8F9FA;
  }
`;

const BookServiceButton = styled.button`
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  background: #2D5F4F;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  
  &:hover {
    background: #1F4A3A;
  }
`;

const ActionSection = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 20px;
`;

const InviteButton = styled.button`
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  background-color: #2D5F4F;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  position: relative;
  
  &:hover {
    background-color: #1F4A3A;
  }
`;

const MessageButton = styled.button`
  width: 48px;
  height: 48px;
  border: 1px solid #E5E5E5;
  border-radius: 8px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 18px;
  
  &:hover {
    background-color: #f5f5f5;
  }
`;

const DropdownMenu = styled.div<{ isOpen: boolean }>`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 10;
  display: ${({ isOpen }) => isOpen ? 'block' : 'none'};
  margin-top: 4px;
`;

const DropdownItem = styled.div`
  padding: 12px 16px;
  color: #333;
  cursor: pointer;
  font-size: 14px;
  
  &:hover {
    background-color: #f5f5f5;
  }
  
  &:first-child {
    border-radius: 8px 8px 0 0;
  }
  
  &:last-child {
    border-radius: 0 0 8px 8px;
  }
`;

// Chat Modal Styles
const ChatModal = styled.div<{ show: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: ${({ show }) => show ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 1100;
  padding: 20px;
`;

const ChatModalContent = styled.div`
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 400px;
  max-height: 80vh;
  overflow-y: auto;
`;

const ChatModalHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid #F0F0F0;
  position: relative;
`;

const ChatModalTitle = styled.h3`
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
`;

const ChatModalSubtitle = styled.p`
  margin: 0;
  font-size: 14px;
  color: #666;
  font-style: italic;
`;

const ChatModalBody = styled.div`
  padding: 20px;
`;

const CommunityReminder = styled.div`
  background: linear-gradient(135deg, #E8F4F0 0%, #D4E9E3 100%);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
  text-align: center;
  border-left: 4px solid #2D5F4F;
`;

const ReminderText = styled.p`
  margin: 0;
  font-size: 14px;
  color: #2D5F4F;
  font-weight: 500;
`;

const MessageTextarea = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: 12px;
  border: 1px solid #E5E5E5;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  margin-bottom: 20px;
  
  &:focus {
    outline: none;
    border-color: #2D5F4F;
  }
  
  &::placeholder {
    color: #999;
  }
`;

const ChatModalActions = styled.div`
  display: flex;
  gap: 12px;
`;

const ChatSendButton = styled.button`
  flex: 1;
  padding: 14px;
  border: none;
  border-radius: 8px;
  background: #2D5F4F;
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  
  &:hover {
    background: #1F4A3A;
  }
`;

const ChatCancelButton = styled.button`
  flex: 1;
  padding: 14px;
  border: 1px solid #E5E5E5;
  border-radius: 8px;
  background: white;
  color: #666;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  
  &:hover {
    background: #F8F9FA;
  }
`;

// Booking Modal Styles
const BookingModal = styled.div<{ show: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: ${({ show }) => show ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 1100;
  padding: 20px;
`;

const BookingModalContent = styled.div`
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 400px;
  max-height: 85vh;
  overflow-y: auto;
`;

const BookingModalHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid #F0F0F0;
`;

const BookingModalTitle = styled.h3`
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
`;

const ServiceSummary = styled.div`
  background: #F8F9FA;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
`;

const ServiceTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
`;

const ServicePrice = styled.div`
  font-size: 14px;
  color: #4A90A4;
  font-weight: 600;
`;

const BookingForm = styled.div`
  padding: 20px;
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const FormLabel = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 6px;
`;

const FormInput = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #E5E5E5;
  border-radius: 8px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #2D5F4F;
  }
`;

const FormTextarea = styled.textarea`
  width: 100%;
  min-height: 80px;
  padding: 12px;
  border: 1px solid #E5E5E5;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #2D5F4F;
  }
  
  &::placeholder {
    color: #999;
  }
`;

const BookingActions = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 20px;
`;

const BookingSubmitButton = styled.button`
  flex: 1;
  padding: 14px;
  border: none;
  border-radius: 8px;
  background: #2D5F4F;
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  
  &:hover {
    background: #1F4A3A;
  }
`;

const BookingCancelButton = styled.button`
  flex: 1;
  padding: 14px;
  border: 1px solid #E5E5E5;
  border-radius: 8px;
  background: white;
  color: #666;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  
  &:hover {
    background: #F8F9FA;
  }
`;

interface FilterState {
  locations: string[];
  offerings: string[];
}

interface ProfileOffering {
  category: 'Local Guides' | 'Homestay' | 'Gig Jobs' | 'Services' | 'Open to connect/meetups';
  title: string;
  description: string;
  price?: string;
}

interface ProfileUser {
  id: string;
  fullName: string;
  age: number;
  profession: string;
  bio: string;
  rating: number;
  interests: string[];
  personalityType: string;
  isVerified: boolean;
  mutualFriends: number;
  offerings?: ProfileOffering[];
  primaryOffering: string; // Main category they offer
  avatarColor: string; // Background color for initials avatar
  lifeSeason: string; // Current life phase
}

export const BerseMatchScreen: React.FC = () => {
  // const navigate = useNavigate();
  const [users, setUsers] = useState<ProfileUser[]>([]);
  
  // Helper function to extract initials from full name
  const getInitials = (fullName: string): string => {
    const names = fullName.trim().split(' ');
    if (names.length >= 2) {
      return names[0][0].toUpperCase() + names[names.length - 1][0].toUpperCase();
    }
    return names[0][0].toUpperCase() + (names[0][1] || '').toUpperCase();
  };

  // Helper function to generate consistent color for each user
  const getAvatarColor = (userId: string): string => {
    const colors = [
      '#2D5F4F', // Primary green
      '#4A90A4', // Teal blue
      '#8B5CF6', // Purple
      '#FF6B6B', // Coral red
      '#10B981', // Emerald green
      '#F59E0B', // Amber
      '#EF4444', // Red
      '#3B82F6', // Blue
      '#8B5A2B', // Brown
      '#6366F1', // Indigo
      '#EC4899', // Pink
      '#059669'  // Green
    ];
    const index = parseInt(userId, 10) % colors.length;
    return colors[index];
  };

  // Helper function to award points and update localStorage
  const awardPoints = (points: number, activityType: string) => {
    const currentPoints = parseInt(localStorage.getItem('user_points') || '245');
    const newPoints = currentPoints + points;
    localStorage.setItem('user_points', newPoints.toString());
    
    // Store points activity
    const pointsHistory = JSON.parse(localStorage.getItem('points_history') || '[]');
    pointsHistory.push({
      id: Date.now().toString(),
      points: points,
      activityType: activityType,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('points_history', JSON.stringify(pointsHistory));
    
    return newPoints;
  };

  // Check if this is user's first booking for bonus points
  const isFirstTimeBooking = (): boolean => {
    const bookingHistory = JSON.parse(localStorage.getItem('service_bookings') || '[]');
    return bookingHistory.length === 0;
  };

  // Additional point functions for service completion and ratings
  const handleServiceCompletion = (bookingId: string) => {
    const pointsAwarded = 10;
    const newPoints = awardPoints(pointsAwarded, 'service_completion');
    
    // Update booking status
    const bookingHistory = JSON.parse(localStorage.getItem('service_bookings') || '[]');
    const updatedHistory = bookingHistory.map((booking: any) => 
      booking.id === bookingId 
        ? { ...booking, status: 'completed', completionPoints: pointsAwarded }
        : booking
    );
    localStorage.setItem('service_bookings', JSON.stringify(updatedHistory));
    
    return newPoints;
  };

  const handleServiceRating = (bookingId: string, rating: number) => {
    if (rating === 5) {
      const pointsAwarded = 15;
      const newPoints = awardPoints(pointsAwarded, '5_star_rating');
      
      // Update booking with rating
      const bookingHistory = JSON.parse(localStorage.getItem('service_bookings') || '[]');
      const updatedHistory = bookingHistory.map((booking: any) => 
        booking.id === bookingId 
          ? { ...booking, rating: rating, ratingPoints: pointsAwarded }
          : booking
      );
      localStorage.setItem('service_bookings', JSON.stringify(updatedHistory));
      
      return newPoints;
    }
    return 0;
  };
  const [filteredUsers, setFilteredUsers] = useState<ProfileUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showOfferingsModal, setShowOfferingsModal] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    locations: [],
    offerings: []
  });
  const [selectedUser, setSelectedUser] = useState<ProfileUser | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showDetailedProfile, setShowDetailedProfile] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedOffering, setSelectedOffering] = useState<ProfileOffering | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [bookingForm, setBookingForm] = useState({
    date: '',
    time: '',
    message: ''
  });

  const locationOptions = [
    'KL City Centre',
    'Shah Alam',
    'Johor Bharu',
    'Global Hub',
    'Damansara',
    'Penang',
    'Alor Setar'
  ];

  const offeringCategories = [
    'Local Guides',
    'Homestay',
    'Gig Jobs', 
    'Services',
    'Open to connect/meetups'
  ];

  useEffect(() => {
    loadUsers();
  }, []);

  // Filter and search logic
  useEffect(() => {
    let filtered = users;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(user => 
        user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.profession.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.bio.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.primaryOffering.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply location filter
    if (filters.locations.length > 0) {
      // For now, filter by profession or bio containing location-related terms
      filtered = filtered.filter(user => 
        filters.locations.some(location => 
          user.profession.toLowerCase().includes(location.toLowerCase()) ||
          user.bio.toLowerCase().includes(location.toLowerCase())
        )
      );
    }

    // Apply offering filter
    if (filters.offerings.length > 0) {
      filtered = filtered.filter(user => 
        filters.offerings.includes(user.primaryOffering) ||
        (user.offerings && user.offerings.some(offering => 
          filters.offerings.includes(offering.category)
        ))
      );
    }

    setFilteredUsers(filtered);
  }, [users, searchQuery, filters]);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      // Mock data based on your Figma design
      const mockUsers: ProfileUser[] = [
        {
          id: '1',
          fullName: 'Ahmad Rahman',
          age: 28,
          profession: 'Local Guide',  
          bio: "Born and raised in KL, love showing fellow Muslims the hidden gems of our beautiful city. Always happy to help visitors experience authentic Malaysian culture!",
          rating: 4.8,
          interests: ['Social Events', 'Trips', 'Volunteer'],
          personalityType: 'ENFJ',
          isVerified: true,
          mutualFriends: 3,
          avatarColor: getAvatarColor('1'),
          primaryOffering: 'Local Guides',
          lifeSeason: 'Career Building',
          offerings: [
            {
              category: 'Local Guides',
              title: 'KL City Tours & Hidden Spots',
              description: 'Happy to show fellow community members around KL! I know all the best halal spots, historical masjids, and authentic cultural sites. Let\'s explore our beautiful city together and strengthen our bonds as Muslims!',
              price: 'RM50/half day'
            },
            {
              category: 'Local Guides', 
              title: 'Food Trail Experiences',
              description: 'Supporting our BerseMuka family by sharing the best local halal food spots! From street food gems to family restaurants, I\'ll guide you through KL\'s amazing culinary scene.',
              price: 'RM30/person'
            },
            {
              category: 'Local Guides',
              title: 'Cultural Heritage Walking Tours', 
              description: 'Let\'s connect and explore together! I love sharing Malaysian Islamic heritage and helping fellow Muslims discover the rich history of our community in KL.',
              price: 'RM40/half day'
            },
            {
              category: 'Open to connect/meetups',
              title: 'Coffee & Community Chats',
              description: 'Building connections, one friendship at a time! Always happy to meet new brothers and sisters over coffee to discuss life, faith, and our shared experiences as Muslims in Malaysia.',
            }
          ]
        },
        {
          id: '2',
          fullName: 'Siti Mariam',
          age: 25,
          profession: 'Homestay Host',
          bio: "Alhamdulillah, blessed to welcome traveling brothers and sisters to our family home in Shah Alam. We love sharing Malaysian hospitality and halal home-cooked meals!",
          rating: 4.9,
          interests: ['Social Events', 'Cafe Meetups', 'Volunteer'],
          personalityType: 'ESFJ',
          isVerified: true,
          mutualFriends: 7,
          avatarColor: getAvatarColor('2'),
          primaryOffering: 'Homestay',
          lifeSeason: 'Family Life',
          offerings: [
            {
              category: 'Homestay',
              title: 'Islamic Family Homestay',
              description: 'Welcome Muslim travelers to our family home! Islamic environment, halal meals, prayer space. Feel like part of our family, inshaAllah!',
              price: 'RM80/night'
            },
            {
              category: 'Services',
              title: 'Traditional Cooking Together',
              description: 'Come learn authentic Malaysian recipes in our family kitchen! My grandmother\'s halal recipes, shared with love for our community.',
              price: 'RM60/session'
            }
          ]
        },
        {
          id: '3',
          fullName: 'Fariz Khalid',
          age: 30,
          profession: 'Creative Helper',
          bio: "Alhamdulillah, love capturing beautiful moments for our community events and helping fellow Muslims with their creative needs. Always excited to collaborate!",
          rating: 4.6,
          interests: ['Gig Jobs', 'Social Events', 'Cafe Meetups'],
          personalityType: 'ISFP',
          isVerified: true,
          mutualFriends: 12,
          avatarColor: getAvatarColor('3'),
          lifeSeason: 'Creative Growth',
          primaryOffering: 'Gig Jobs',
          offerings: [
            {
              category: 'Gig Jobs',
              title: 'Creative Help for Community',
              description: 'Happy to help with Islamic event photography, masjid flyers, wedding invitations. Love capturing beautiful moments for our ummah!',
              price: 'From RM150/session'
            },
            {
              category: 'Open to connect/meetups',
              title: 'Creative Brothers Meetup',
              description: 'Love meeting fellow creative Muslims to share ideas, collaborate on dawah projects, and inspire each other fi sabilillah!',
            }
          ]
        },
        {
          id: '4',
          fullName: 'Hassan Ahmad',
          age: 35,
          profession: 'Community Helper',
          bio: "MashaAllah, blessed with technical skills and love helping neighbors with everyday repairs and maintenance. Always ready to lend a helping hand to fellow community members!",
          rating: 4.7,
          interests: ['Services', 'Volunteer', 'Social Events'],
          personalityType: 'ISTJ',
          isVerified: true,
          mutualFriends: 5,
          avatarColor: getAvatarColor('4'),
          primaryOffering: 'Services',
          lifeSeason: 'Family Man',
          offerings: [
            {
              category: 'Services',
              title: 'Helping Fellow Muslims',
              description: 'Alhamdulillah, happy to help brothers and sisters with car repairs, home fixes, computer issues. Community price, no profit needed!',
              price: 'From RM50/hour'
            },
            {
              category: 'Open to connect/meetups',
              title: 'Learning Together',
              description: 'Love studying Quran, Islamic courses, or even professional skills with fellow Muslims. Knowledge is better when shared!',
            }
          ]
        },
        {
          id: '5',
          fullName: 'Nadia Laila',
          age: 26,
          profession: 'Community Connector',
          bio: "Final year student who loves making new friends and building connections within our ummah. Always up for halal adventures and meaningful Islamic conversations!",
          rating: 4.5,
          interests: ['Social Events', 'Cafe Meetups', 'Trips'],
          personalityType: 'ENFP',
          isVerified: false,
          mutualFriends: 8,
          avatarColor: getAvatarColor('5'),
          primaryOffering: 'Open to connect/meetups',
          lifeSeason: 'Student Life',
          offerings: [
            {
              category: 'Open to connect/meetups',
              title: 'Sisterhood & Adventures',
              description: 'Love meeting new sisters for coffee, halal hiking trips, Islamic study circles. Building beautiful friendships for the sake of Allah!',
            },
            {
              category: 'Gig Jobs',
              title: 'Language Help for Ummah',
              description: 'Happy to help international Muslim students with English and Malay. Building bridges in our global ummah!',
              price: 'RM40/hour'
            }
          ]
        },
        {
          id: '6',
          fullName: 'Marwan Hassan',
          age: 32,
          profession: 'Engineer & Tour Guide',
          bio: "MashaAllah, passionate engineer who loves sharing the beauty of Malaysia with visitors. From KL's modern skyline to heritage sites, let's explore together!",
          rating: 4.9,
          interests: ['Local Guides', 'Social Events', 'Trips'],
          personalityType: 'ENTJ',
          isVerified: true,
          mutualFriends: 15,
          avatarColor: getAvatarColor('6'),
          primaryOffering: 'Local Guides',
          lifeSeason: 'Career Growth',
          offerings: [
            {
              category: 'Local Guides',
              title: 'Engineering Marvel Tours',
              description: 'Join me to explore KL\'s architectural wonders! As an engineer, I can share fascinating insights about our city\'s iconic structures.',
              price: 'RM80/day'
            }
          ]
        },
        {
          id: '7', 
          fullName: 'Hafiz Fairuz',
          age: 27,
          profession: 'Photographer & Content Creator',
          bio: "Alhamdulillah, blessed to capture beautiful moments for our ummah. Love helping fellow Muslims with photography needs and sharing creative skills!",
          rating: 4.7,
          interests: ['Gig Jobs', 'Social Events', 'Cafe Meetups'],
          personalityType: 'ISFP',
          isVerified: true,
          mutualFriends: 9,
          avatarColor: getAvatarColor('7'),
          primaryOffering: 'Gig Jobs',
          lifeSeason: 'Creative Passion',
          offerings: [
            {
              category: 'Gig Jobs',
              title: 'Islamic Event Photography',
              description: 'Happy to capture your special Islamic events - weddings, aqiqah, family gatherings. Creating beautiful memories for our community!',
              price: 'From RM200/event'
            }
          ]
        }
      ];
      
      setUsers(mockUsers);
    } catch (error) {
      console.error('Failed to load users:', error);
      setUsers([]); // Set empty array on error to show empty state
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocationFilterChange = (location: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      locations: checked 
        ? [...prev.locations, location]
        : prev.locations.filter(l => l !== location)
    }));
  };

  const handleOfferingFilterChange = (offering: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      offerings: checked 
        ? [...prev.offerings, offering]
        : prev.offerings.filter(o => o !== offering)
    }));
  };

  const clearFilters = () => {
    setFilters({ locations: [], offerings: [] });
  };

  const applyFilters = () => {
    // Filters are automatically applied via useEffect
    setShowLocationModal(false);
    setShowOfferingsModal(false);
  };

  const getFilterButtonText = (type: 'location' | 'offerings') => {
    if (type === 'location') {
      return filters.locations.length > 0 
        ? `Location (${filters.locations.length})`
        : 'Location';
    } else {
      return filters.offerings.length > 0 
        ? `What They Offer (${filters.offerings.length})`
        : 'What They Offer';
    }
  };

  const handleRefreshMatches = () => {
    loadUsers();
  };

  const handleSeeProfile = (user: ProfileUser) => {
    console.log('🔍 See Profile clicked for:', user.fullName);
    console.log('🔍 User data:', user);
    setSelectedUser(user);
    setShowDetailedProfile(true);
    console.log('🔍 Modal should now be visible');
  };

  const handleCloseProfile = () => {
    setShowDetailedProfile(false);
    setSelectedUser(null);
  };

  const handleChatUser = (user: ProfileUser, offering?: ProfileOffering) => {
    setSelectedUser(user);
    setSelectedOffering(offering || null);
    
    // Pre-fill chat message
    if (offering) {
      setChatMessage(`Assalamu'alaikum ${user.fullName.split(' ')[0]}! 😊

I'm interested in learning more about your "${offering.title}" service. Would love to chat first and get to know you better as a fellow community member!

Looking forward to connecting, inshaAllah! 🤝`);
    } else {
      setChatMessage(`Assalamu'alaikum ${user.fullName.split(' ')[0]}! 😊

Hope you're doing well! I'd love to connect and get to know you better as a fellow BerseMuka community member.

Looking forward to our conversation! 🤝`);
    }
    
    setShowChatModal(true);
  };

  const handleBookService = (user: ProfileUser, offering: ProfileOffering) => {
    setSelectedUser(user);
    setSelectedOffering(offering);
    setBookingForm({
      date: '',
      time: '',
      message: `Assalamu'alaikum ${user.fullName.split(' ')[0]}! I'm interested in your "${offering.title}" service. Looking forward to connecting with you first! 😊`
    });
    setShowBookingModal(true);
  };

  const handleSendChat = () => {
    if (!selectedUser || !chatMessage.trim()) return;
    
    // Award points for community engagement  
    const pointsAwarded = 3;
    const newPoints = awardPoints(pointsAwarded, 'community_chat');
    
    // Store chat activity
    const chatHistory = JSON.parse(localStorage.getItem('chat_history') || '[]');
    const newChat = {
      id: Date.now().toString(),
      type: 'community_chat',
      recipientName: selectedUser.fullName,
      serviceName: selectedOffering?.title || null,
      message: chatMessage,
      pointsAwarded: pointsAwarded,
      timestamp: new Date().toISOString()
    };
    chatHistory.push(newChat);
    localStorage.setItem('chat_history', JSON.stringify(chatHistory));
    
    // Show success message with points
    alert(`✨ Message sent to ${selectedUser.fullName}! 💬

🎉 You earned ${pointsAwarded} BerseMuka Points for building community connections!
💰 Your total: ${newPoints} points

They'll receive your friendly message and can respond to start building a beautiful community connection, inshaAllah! 🤝

Keep connecting to earn more points and strengthen our community! 🌟`);
    
    setShowChatModal(false);
    setChatMessage('');
    setSelectedOffering(null);
  };

  const handleSubmitBooking = () => {
    if (!selectedUser || !selectedOffering || !bookingForm.date || !bookingForm.time) {
      alert('Please fill in all required fields to connect with your community helper! 😊');
      return;
    }
    
    // Check for first time booking bonus
    const isFirstTime = isFirstTimeBooking();
    const basePoints = 5;
    const firstTimeBonus = isFirstTime ? 20 : 0;
    const totalPointsAwarded = basePoints + firstTimeBonus;
    
    const newPoints = awardPoints(totalPointsAwarded, isFirstTime ? 'first_time_booking' : 'service_booking');
    
    // Store booking activity
    const bookingHistory = JSON.parse(localStorage.getItem('service_bookings') || '[]');
    const newBooking = {
      id: Date.now().toString(),
      type: 'service_booking',
      providerName: selectedUser.fullName,
      serviceTitle: selectedOffering.title,
      serviceCategory: selectedOffering.category,
      preferredDate: bookingForm.date,
      preferredTime: bookingForm.time,
      personalMessage: bookingForm.message,
      price: selectedOffering.price,
      status: 'pending',
      pointsAwarded: totalPointsAwarded,
      isFirstTimeBooking: isFirstTime,
      timestamp: new Date().toISOString()
    };
    bookingHistory.push(newBooking);
    localStorage.setItem('service_bookings', JSON.stringify(bookingHistory));
    
    // Show success message with points
    const bonusMessage = isFirstTime 
      ? `\n🎊 FIRST TIME BOOKING BONUS: +${firstTimeBonus} points!\n🌟 Service Booking: +${basePoints} points\n💰 Total earned: ${totalPointsAwarded} points!`
      : `\n🌟 You earned ${totalPointsAwarded} BerseMuka Points for supporting community helpers!`;

    alert(`🎉 Connection request sent to ${selectedUser.fullName}!${bonusMessage}
💰 Your new total: ${newPoints} points

Your booking request for "${selectedOffering.title}" has been submitted. They'll receive your message and contact you soon to build a great community connection first, then arrange the service details together!

Building friendships through shared experiences! 🤝✨

Keep using community services to earn more points and strengthen our BerseMuka family! 💝`);
    
    setShowBookingModal(false);
    setBookingForm({ date: '', time: '', message: '' });
    setSelectedOffering(null);
  };

  const handleCloseChat = () => {
    setShowChatModal(false);
    setChatMessage('');
    setSelectedOffering(null);
  };

  const handleCloseBooking = () => {
    setShowBookingModal(false);
    setBookingForm({ date: '', time: '', message: '' });
    setSelectedOffering(null);
  };

  const getCommunityMessage = (user: ProfileUser) => {
    const messages = [
      "Happy to help fellow community members! 🤝",
      "Let's connect and explore together! 🌟", 
      "Supporting our BerseMuka family always! ❤️",
      "Building connections, one friendship at a time! 👥",
      "Here to help neighbors in our community! 🏘️"
    ];
    return messages[parseInt(user.id) % messages.length];
  };

  const handleBackToList = () => {
    setSelectedUser(null);
  };

  const handleInviteDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon key={i}>
        {i < Math.floor(rating) ? '★' : '☆'}
      </StarIcon>
    ));
  };

  if (selectedUser) {
    return (
      <ProfileModal isOpen={true}>
        <StatusBar />
        <BackHeader>
          <BackButton onClick={handleBackToList}>
            ← Back
          </BackButton>
          <HeaderText>
            <h3>Explore The Community</h3>
            <h2>BerseMatch</h2>
          </HeaderText>
          <MoreButton>⋮</MoreButton>
        </BackHeader>

        <ProfileContent>
          <ProfileCard>
            <ProfileHeader>
              <PersonalityType>{selectedUser.personalityType}</PersonalityType>
              <ProfileAvatar style={{ backgroundColor: selectedUser.avatarColor }}>
                {getInitials(selectedUser.fullName)}
                {selectedUser.isVerified && <VerifiedBadge />}
              </ProfileAvatar>
              <ProfileName>{selectedUser.fullName}</ProfileName>
              <ProfileRating>
                {renderStars(selectedUser.rating)}
                <span>{selectedUser.rating}</span>
              </ProfileRating>
              <UserMeta>{selectedUser.age} • {selectedUser.profession}</UserMeta>
              <UserBio>{selectedUser.bio}</UserBio>
            </ProfileHeader>

            <SocialLinks>
              <SocialIcon>📷</SocialIcon>
              <SocialIcon>👥</SocialIcon>
              <SocialIcon>💼</SocialIcon>
              <SocialIcon>🐦</SocialIcon>
            </SocialLinks>

            <SectionTitle>Activities & Interests</SectionTitle>
            <InterestTags>
              {selectedUser.interests.map((interest, index) => (
                <InterestTag key={index}>{interest}</InterestTag>
              ))}
            </InterestTags>

            <TrustChain>
              <ChainIcon />
              Trust Chain
            </TrustChain>

            <ConnectionInfo>
              <MutualFriend>
                <FriendAvatar>AS</FriendAvatar>
                Ahmed Sumone
              </MutualFriend>
              <ClosestFriends>
                <FriendAvatars>
                  <FriendAvatarSmall />
                  <FriendAvatarSmall />
                  <FriendAvatarSmall />
                </FriendAvatars>
                {selectedUser.mutualFriends} Closest Friends
              </ClosestFriends>
            </ConnectionInfo>

            <ActionSection>
              <div style={{ flex: 1, position: 'relative' }}>
                <InviteButton onClick={handleInviteDropdown}>
                  Invite Khalid ▼
                </InviteButton>
                <DropdownMenu isOpen={showDropdown}>
                  <DropdownItem>To an event</DropdownItem>
                  <DropdownItem>To join hub group chat</DropdownItem>
                  <DropdownItem>To join private group chat</DropdownItem>
                </DropdownMenu>
              </div>
              <MessageButton>💬</MessageButton>
            </ActionSection>
          </ProfileCard>
        </ProfileContent>

        <MainNav 
        activeTab="match"
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
      </ProfileModal>
    );
  }

  return (
    <Container>
      <StatusBar />
      
      <Header>
        <HeaderTop>
          <UserInfo>
            <Avatar style={{ backgroundColor: '#2D5F4F' }}>
              ZA
            </Avatar>
            <HeaderText>
              <h3>Explore The Community</h3>
              <h2>BerseMatch</h2>
            </HeaderText>
          </UserInfo>
          <NotificationBell />
        </HeaderTop>
      </Header>

      <Content>
        <SearchContainer>
          <SearchBar>
            <span style={{ fontSize: '16px', color: '#999' }}>🔍</span>
            <SearchInput 
              placeholder="Search users"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </SearchBar>
          
          <FilterRow>
            <FilterDropdown 
              value=""
              onChange={() => setShowLocationModal(true)}
              onClick={() => setShowLocationModal(true)}
            >
              <option value="">{getFilterButtonText('location')}</option>
            </FilterDropdown>
            
            <FilterDropdown 
              value=""
              onChange={() => setShowOfferingsModal(true)}
              onClick={() => setShowOfferingsModal(true)}
            >
              <option value="">{getFilterButtonText('offerings')}</option>
            </FilterDropdown>
          </FilterRow>
        </SearchContainer>

        {isLoading ? (
          <div style={{ textAlign: 'center', color: '#666', padding: '40px' }}>
            Loading users...
          </div>
        ) : users.length === 0 ? (
          <EmptyState>
            <EmptyIcon>👥</EmptyIcon>
            <EmptyTitle>No more matches available right now.</EmptyTitle>
            <EmptySubtitle>Check back later for new connections!</EmptySubtitle>
            <RefreshButton onClick={handleRefreshMatches}>
              Refresh Matches
            </RefreshButton>
          </EmptyState>
        ) : (
          (filteredUsers.length > 0 ? filteredUsers : users).map((user) => (
            <UserCard key={user.id}>
              <UserCardHeader>
                <UserAvatar style={{ backgroundColor: user.avatarColor }}>
                  {getInitials(user.fullName)}
                  {user.isVerified && <VerifiedBadge />}
                </UserAvatar>
                <UserInfo2>
                  <UserHeader>
                    <UserName>{user.fullName}</UserName>
                    <Rating>
                      <StarIcon>★</StarIcon>
                      {user.rating}
                    </Rating>
                  </UserHeader>
                  <UserMeta>{user.age} • {user.primaryOffering}</UserMeta>
                  <UserBio>{user.bio}</UserBio>
                </UserInfo2>
              </UserCardHeader>

              <TrustChain>
                <ChainIcon />
                Trust Chain
              </TrustChain>


              <ConnectionInfo>
                <MutualFriend>
                  <FriendAvatar>AS</FriendAvatar>
                  Ahmed Sumone
                </MutualFriend>
                <ClosestFriends>
                  <FriendAvatars>
                    <FriendAvatarSmall />
                    <FriendAvatarSmall />
                    <FriendAvatarSmall />
                  </FriendAvatars>
                  {user.mutualFriends} Closest Friends
                </ClosestFriends>
              </ConnectionInfo>

              <ActionButton onClick={() => handleSeeProfile(user)}>
                See Profile
              </ActionButton>
            </UserCard>
          ))
        )}
      </Content>

      {/* Location Filter Modal */}
      <FilterModalOverlay isOpen={showLocationModal} onClick={() => setShowLocationModal(false)}>
        <FilterModal onClick={(e) => e.stopPropagation()}>
          <FilterModalHeader>
            <FilterModalTitle>Location</FilterModalTitle>
            <CloseButton onClick={() => setShowLocationModal(false)}>×</CloseButton>
          </FilterModalHeader>
          
          <CheckboxGrid>
            {locationOptions.map((location) => (
              <CheckboxItem key={location}>
                <Checkbox
                  type="checkbox"
                  checked={filters.locations.includes(location)}
                  onChange={(e) => handleLocationFilterChange(location, e.target.checked)}
                />
                {location}
              </CheckboxItem>
            ))}
          </CheckboxGrid>
          
          <FilterActions>
            <FilterButton onClick={applyFilters}>Filter</FilterButton>
            <ClearButton onClick={clearFilters}>Clear</ClearButton>
          </FilterActions>
        </FilterModal>
      </FilterModalOverlay>

      {/* Offerings Filter Modal */}
      <FilterModalOverlay isOpen={showOfferingsModal} onClick={() => setShowOfferingsModal(false)}>
        <FilterModal onClick={(e) => e.stopPropagation()}>
          <FilterModalHeader>
            <FilterModalTitle>What They Offer</FilterModalTitle>
            <CloseButton onClick={() => setShowOfferingsModal(false)}>×</CloseButton>
          </FilterModalHeader>
          
          <div style={{ marginBottom: '20px' }}>
            {offeringCategories.map((offering) => (
              <CheckboxItem key={offering} style={{ marginBottom: '12px', gridColumn: '1 / -1' }}>
                <Checkbox
                  type="checkbox"
                  checked={filters.offerings.includes(offering)}
                  onChange={(e) => handleOfferingFilterChange(offering, e.target.checked)}
                />
                <div>
                  <div style={{ fontWeight: '600', marginBottom: '2px' }}>{offering}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {offering === 'Local Guides' && 'City tours, hidden spots, restaurant recommendations'}
                    {offering === 'Homestay' && 'Accommodation, rooms, short-term stays'}
                    {offering === 'Gig Jobs' && 'Freelance work, photography, tutoring, design'}
                    {offering === 'Services' && 'Car repair, cleaning, IT support, cooking classes'}
                    {offering === 'Open to connect/meetups' && 'Coffee chats, hiking buddy, study partner'}
                  </div>
                </div>
              </CheckboxItem>
            ))}
          </div>
          
          <FilterActions>
            <FilterButton onClick={applyFilters}>Filter</FilterButton>
            <ClearButton onClick={clearFilters}>Clear</ClearButton>
          </FilterActions>
        </FilterModal>
      </FilterModalOverlay>

      {/* Detailed Profile Modal */}
      <DetailedProfileModal show={showDetailedProfile} onClick={handleCloseProfile}>
        <DetailedProfileContent onClick={(e) => e.stopPropagation()}>
          {selectedUser ? (
            <>
              <DetailedProfileHeader>
                <DetailedCloseButton onClick={handleCloseProfile}>×</DetailedCloseButton>
                <DetailedUserInfo>
                  <DetailedUserAvatar style={{ backgroundColor: selectedUser.avatarColor }}>
                    {getInitials(selectedUser.fullName)}
                  </DetailedUserAvatar>
                  <DetailedUserMeta>
                    <DetailedUserName>{selectedUser.fullName}</DetailedUserName>
                    <DetailedUserBasic>
                      {selectedUser.age} • {selectedUser.profession}
                    </DetailedUserBasic>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ color: '#FFD700' }}>★</span>
                      <span style={{ fontSize: '14px', color: '#666' }}>{selectedUser.rating}</span>
                      {selectedUser.isVerified && (
                        <span style={{ fontSize: '12px', color: '#4CAF50' }}>✓ Verified</span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '12px', color: '#2D5F4F' }}>🌱</span>
                      <span style={{ fontSize: '12px', color: '#666', fontStyle: 'italic' }}>Life Season: {selectedUser.lifeSeason}</span>
                    </div>
                  </DetailedUserMeta>
                </DetailedUserInfo>
                <DetailedUserBio>{selectedUser.bio}</DetailedUserBio>
                
                <CommunityMessage>
                  <CommunityText>{getCommunityMessage(selectedUser)}</CommunityText>
                </CommunityMessage>
              </DetailedProfileHeader>

              {selectedUser.offerings && selectedUser.offerings.length > 0 && (
                <DetailedOfferingsSection>
                  <DetailedOfferingsTitle>🤝 How I Can Help Our Community</DetailedOfferingsTitle>
                  {selectedUser.offerings.map((offering, index) => (
                    <DetailedOfferingCard key={index}>
                      <DetailedOfferingHeader>
                        <DetailedOfferingCategory>{offering.category}</DetailedOfferingCategory>
                        {offering.price && <DetailedOfferingPrice>{offering.price}</DetailedOfferingPrice>}
                      </DetailedOfferingHeader>
                      <DetailedOfferingTitle>{offering.title}</DetailedOfferingTitle>
                      <DetailedOfferingDescription>{offering.description}</DetailedOfferingDescription>
                      <OfferingActions>
                        <ChatButton onClick={() => handleChatUser(selectedUser, offering)}>
                          💬 Chat First
                        </ChatButton>
                        <BookServiceButton onClick={() => handleBookService(selectedUser, offering)}>
                          🤝 Connect & Book
                        </BookServiceButton>
                      </OfferingActions>
                    </DetailedOfferingCard>
                  ))}
                </DetailedOfferingsSection>
              )}
            </>
          ) : null}
        </DetailedProfileContent>
      </DetailedProfileModal>

      {/* Chat Modal */}
      <ChatModal show={showChatModal} onClick={handleCloseChat}>
        <ChatModalContent onClick={(e) => e.stopPropagation()}>
          <ChatModalHeader>
            <DetailedCloseButton onClick={handleCloseChat}>×</DetailedCloseButton>
            <ChatModalTitle>💬 Connect with {selectedUser?.fullName.split(' ')[0]}</ChatModalTitle>
            <ChatModalSubtitle>Building community connections, one conversation at a time</ChatModalSubtitle>
          </ChatModalHeader>
          
          <ChatModalBody>
            <CommunityReminder>
              <ReminderText>
                💝 We believe in building friendships first! Getting to know each other makes our community stronger and more trusted.
              </ReminderText>
            </CommunityReminder>
            
            {selectedOffering && (
              <ServiceSummary>
                <ServiceTitle>About: {selectedOffering.title}</ServiceTitle>
                {selectedOffering.price && <ServicePrice>{selectedOffering.price}</ServicePrice>}
              </ServiceSummary>
            )}
            
            <MessageTextarea
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder="Write your friendly message here... 😊"
            />
            
            <ChatModalActions>
              <ChatCancelButton onClick={handleCloseChat}>Maybe Later</ChatCancelButton>
              <ChatSendButton onClick={handleSendChat}>💬 Send Message</ChatSendButton>
            </ChatModalActions>
          </ChatModalBody>
        </ChatModalContent>
      </ChatModal>

      {/* Booking Modal */}
      <BookingModal show={showBookingModal} onClick={handleCloseBooking}>
        <BookingModalContent onClick={(e) => e.stopPropagation()}>
          <BookingModalHeader>
            <DetailedCloseButton onClick={handleCloseBooking}>×</DetailedCloseButton>
            <BookingModalTitle>🤝 Connect & Book with {selectedUser?.fullName.split(' ')[0]}</BookingModalTitle>
            
            <CommunityReminder>
              <ReminderText>
                🌟 We encourage chatting first to build community connections! This helps create trust and lasting friendships in our BerseMuka family.
              </ReminderText>
            </CommunityReminder>
            
            {selectedOffering && (
              <ServiceSummary>
                <ServiceTitle>{selectedOffering.title}</ServiceTitle>
                {selectedOffering.price && <ServicePrice>{selectedOffering.price}</ServicePrice>}
              </ServiceSummary>
            )}
          </BookingModalHeader>
          
          <BookingForm>
            <FormGroup>
              <FormLabel>Preferred Date *</FormLabel>
              <FormInput
                type="date"
                value={bookingForm.date}
                onChange={(e) => setBookingForm(prev => ({ ...prev, date: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </FormGroup>
            
            <FormGroup>
              <FormLabel>Preferred Time *</FormLabel>
              <FormInput
                type="time"
                value={bookingForm.time}
                onChange={(e) => setBookingForm(prev => ({ ...prev, time: e.target.value }))}
                required
              />
            </FormGroup>
            
            <FormGroup>
              <FormLabel>Personal Message</FormLabel>
              <FormTextarea
                value={bookingForm.message}
                onChange={(e) => setBookingForm(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Share a bit about yourself and why you're interested in this service... 😊"
                rows={3}
              />
            </FormGroup>
            
            <BookingActions>
              <BookingCancelButton onClick={handleCloseBooking}>Not Now</BookingCancelButton>
              <BookingSubmitButton onClick={handleSubmitBooking}>🤝 Connect & Book</BookingSubmitButton>
            </BookingActions>
          </BookingForm>
        </BookingModalContent>
      </BookingModal>

      <MainNav 
        activeTab="match"
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
    </Container>
  );
};