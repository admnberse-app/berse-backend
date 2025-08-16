import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes, css } from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { StatusBar } from '../components/StatusBar';
import { CompactHeader } from '../components/CompactHeader';
import { Card } from '../components/Card';
import { Points } from '../components/Points';
import { Button } from '../components/Button';
import { SideMenu } from '../components/SideMenu';
import { NotificationPanel } from '../components/NotificationPanel';
import { MainNav } from '../components/MainNav/index';
import { QRCodeGenerator } from '../components/QRCode';
import { DualQRModal } from '../components/DualQRModal';
import { ManagePassModal } from '../components/ManagePassModal';
import { RedemptionConfirmModal } from '../components/RedemptionConfirmModal';
import { VoucherDisplayModal } from '../components/VoucherDisplayModal';
import { Toast } from '../components/Toast';
import { ProfileSidebar } from '../components/ProfileSidebar';
import { getUserPoints, updateUserPoints } from '../utils/initializePoints';
import { voucherService } from '../services/voucherService';
import { useUniversalRedemption } from '../hooks/useUniversalRedemption';
import { Event } from '../types';

// Calendar Event Interface - Updated for compact calendar
interface CalendarEvent {
  id: string;
  date: Date;
  time: string;
  title: string;
  type: 'social' | 'cafe' | 'ilm' | 'donate' | 'trips' | 'sukan' | 'volunteer' | 'ai';
  icon: string;
  color: string;
  status: 'confirmed' | 'pending' | 'suggested';
  location?: string;
  attendees?: string[];
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
  background-color: #F9F3E3;
  overflow-x: hidden;
  animation: fadeIn 0.3s ease-in;
  
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const Content = styled.div`
  flex: 1;
  padding: 8px 12px 90px 12px; // Increased bottom padding for larger nav
  overflow-y: auto;
  max-width: 375px; // iPhone standard width
  width: 100%;
  margin: 0 auto;
  
  @media (max-width: 375px) {
    max-width: 100%;
    padding: 8px 8px 90px 8px;
  }
`;

const WelcomeSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const WelcomeText = styled.h2`
  font-size: ${({ theme }) => theme.typography.heading.h2.fontSize};
  font-weight: ${({ theme }) => theme.typography.heading.h2.fontWeight};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const Subtitle = styled.p`
  font-size: ${({ theme }) => theme.typography.body.medium.fontSize};
  color: ${({ theme }) => theme.colors.text.secondary};
`;


const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: bold;
  color: #2fce98;
  margin: 0 0 10px 0;
  text-align: left;
  
  @media (max-width: 375px) {
    font-size: 15px;
    margin: 0 0 8px 0;
  }
`;

const EventsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const LoadingMessage = styled.div`
  text-align: center;
  color: ${({ theme }) => theme.colors.text.secondary};
  padding: ${({ theme }) => theme.spacing.xl};
`;


const slideUp = keyframes`
  from { transform: translateY(100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

// Calendar Container - MyVouchers card style with blue gradient
const CalendarContainer = styled.div`
  margin-bottom: 12px;
`;

const CalendarWidget = styled.div`
  background: linear-gradient(135deg, #4a5f8c, #5470a3, #6182ba);
  border-radius: 14px;
  padding: 12px;
  box-shadow: 0 6px 20px rgba(74, 95, 140, 0.3), 0 2px 8px rgba(0, 0, 0, 0.15);
  width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.15);
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.05), transparent);
    animation: shimmer 8s infinite;
  }
  
  @keyframes shimmer {
    100% {
      left: 100%;
    }
  }
  max-width: 100%;
  height: auto;
  display: flex;
  flex-direction: column;
  color: white;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(61, 76, 116, 0.3);
  }
  
  @media (max-width: 375px) {
    padding: 10px;
    border-radius: 10px;
  }
`;

const CalendarContent = styled.div`
  display: block;
`;

const CalendarLeft = styled.div`
  width: 100%;
`;

const RightActionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 120px;
`;

const BelowCalendarActions = styled.div`
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

// Separate Quick Actions Section
const QuickActionsSection = styled.div`
  margin-bottom: 12px;
`;

const QuickActionsContainer = styled.div`
  width: 100%;
  max-width: 100%;
  height: auto;
  display: flex;
  flex-direction: column;
`;

const QuickActionsGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 4px;
  
  @media (max-width: 375px) {
    gap: 4px;
  }
`;

const StreakContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: white;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const StreakText = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: white;
`;

const QuickActionsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
`;

const QuickActionsTitle = styled.h4`
  font-size: 11px;
  font-weight: 600;
  color: #2fce98;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  opacity: 0.9;
`;

const FeaturedRewardsTitle = styled.h4`
  font-size: 11px;
  font-weight: 600;
  color: #2fce98;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  opacity: 0.9;
  padding: 0;
  margin-bottom: 6px;
  
  @media (max-width: 375px) {
    font-size: 8px;
    margin-bottom: 4px;
  }
`;

const FeaturedRewardsContainer = styled.div`
  width: 100%;
  max-width: 100%;
  margin-bottom: 12px;
  
  @media (max-width: 375px) {
    margin-bottom: 10px;
  }
`;

const FeaturedRewardsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 6px;
`;

const AllRewardsButton = styled.button`
  font-size: 10px;
  font-weight: 600;
  color: white;
  background: linear-gradient(135deg, #00BCD4, #0288D1);
  border: 1px solid #0097A7;
  border-radius: 6px;
  padding: 5px 10px;
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  white-space: nowrap;
  position: relative;
  
  &::after {
    content: '🎁';
    position: absolute;
    right: -8px;
    top: -8px;
    font-size: 12px;
    animation: bounce 3s ease-in-out infinite;
  }
  
  @keyframes bounce {
    0%, 100% { transform: translate(0, 0) rotate(0deg); }
    25% { transform: translate(2px, -2px) rotate(5deg); }
    50% { transform: translate(-2px, 2px) rotate(-5deg); }
    75% { transform: translate(1px, -1px) rotate(3deg); }
  }
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const TravelFundButton = styled.button`
  font-size: 10px;
  font-weight: 600;
  color: white;
  background: linear-gradient(135deg, #00BCD4, #0288D1);
  border: 1px solid #0097A7;
  border-radius: 6px;
  padding: 5px 10px;
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  height: 24px;
  box-shadow: 0 2px 4px rgba(0, 188, 212, 0.2);
  position: relative;
  
  &::after {
    content: '✈️';
    position: absolute;
    right: -8px;
    top: -8px;
    font-size: 12px;
    animation: fly 3s ease-in-out infinite;
  }
  
  @keyframes fly {
    0%, 100% { transform: translate(0, 0); }
    25% { transform: translate(2px, -2px); }
    50% { transform: translate(-2px, 2px); }
    75% { transform: translate(1px, -1px); }
  }
  
  &:hover {
    background: linear-gradient(135deg, #0097A7, #00ACC1);
    transform: scale(1.05);
    box-shadow: 0 3px 8px rgba(0, 188, 212, 0.4);
  }
  
  &:active {
    transform: scale(0.98);
  }
`;

const QuickActionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const QuickActionButton = styled.button<{ $variant?: string }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  padding: 14px 16px;
  background: linear-gradient(135deg, #2fce98, #26b580);
  border: 1px solid #2fce98;
  border-radius: 12px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 60px;
  width: 100%;
  position: relative;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, transparent, rgba(255, 255, 255, 0.05));
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &:hover {
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    
    &::before {
      opacity: 1;
    }
  }
  
  &:active {
    transform: translateY(0) scale(1);
  }
`;

const ActionLine = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
`;

const ActionIcon = styled.span`
  font-size: 28px;
  margin-right: 14px;
  line-height: 1;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  position: relative;
  z-index: 1;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  flex-shrink: 0;
  display: flex;
  align-items: center;
`;

const ActionText = styled.span`
  font-size: 11px;
  font-weight: 500;
  text-align: left;
  line-height: 1.3;
  color: rgba(255, 255, 255, 0.95);
  font-style: normal;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  flex: 1;
  
  strong {
    font-weight: 700;
    display: block;
    font-size: 13px;
    margin-bottom: 1px;
    font-style: normal;
    color: white;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }
`;

const ActionBadge = styled.div<{ $special?: boolean }>`
  background: ${({ $special }) => $special ? 
    'linear-gradient(135deg, #FFD700, #FFA500)' : 
    'linear-gradient(135deg, #FF6B6B, #FF4444)'
  };
  color: white;
  padding: 4px 10px;
  border-radius: 14px;
  font-size: 10px;
  margin-left: auto;
  margin-right: 8px;
  font-weight: 700;
  white-space: nowrap;
  line-height: 1.2;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  animation: ${({ $special }) => $special ? 'pulse 2s infinite' : 'none'};
  flex-shrink: 0;
  
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
  }
`;

// Calendar Header - Proportional spacing
const CalendarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  height: 32px;
  gap: 12px;
`;

const MonthNavigation = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
  min-width: 140px;
`;

const NavButton = styled.button`
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.1));
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  font-size: 12px;
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 8px;
  transition: all 0.2s ease;
  flex-shrink: 0;
  backdrop-filter: blur(5px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  &:hover {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0.2));
    transform: scale(1.05) translateY(-1px);
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
  }
  
  &:active {
    transform: scale(1.02) translateY(0);
  }
`;

const MonthTitle = styled.h3`
  margin: 0;
  font-size: 11px;
  font-weight: 600;
  color: white;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  text-align: center;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  flex: 1;
  min-width: 100px;
  white-space: nowrap;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const QuickActions = styled.div`
  display: flex;
  gap: 8px;
  flex: 1;
`;

const CalendarViewSwitcher = styled.div`
  display: flex;
  gap: 3px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 3px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  flex-shrink: 0;
`;

const ViewSwitchButton = styled.button<{ $active: boolean }>`
  background: ${({ $active }) => $active 
    ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.85))' 
    : 'rgba(255, 255, 255, 0.05)'};
  border: 1px solid ${({ $active }) => $active 
    ? 'rgba(255, 255, 255, 0.6)' 
    : 'rgba(255, 255, 255, 0.15)'};
  color: ${({ $active }) => $active ? '#3d4c74' : 'white'};
  font-size: 9px;
  font-weight: 600;
  cursor: pointer;
  padding: 4px 10px;
  border-radius: 7px;
  transition: all 0.2s ease;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  min-width: 32px;
  box-shadow: ${({ $active }) => $active 
    ? '0 2px 4px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.5)' 
    : 'none'};
  
  &:hover {
    background: ${({ $active }) => $active 
      ? 'linear-gradient(135deg, white, rgba(255, 255, 255, 0.95))' 
      : 'rgba(255, 255, 255, 0.15)'};
    transform: translateY(-1px);
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
  }
  
  ${({ $active }) => $active && `
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  `}
`;

const ActionButton = styled.button<{ $isActive?: boolean }>`
  background: ${props => props.$isActive ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)'};
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  color: white;
  transition: all 0.2s ease;
  white-space: nowrap;
  flex: 1;
  min-width: 0;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.4);
    transform: translateY(-1px);
  }
`;

// Calendar Grid - Styled with card design
const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
  background: rgba(0, 0, 0, 0.08);
  padding: 2px;
  border-radius: 8px;
  height: 160px;
  width: 100%;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(5px);
  
  @media (max-width: 375px) {
    height: 140px;
  }
`;

const WeekDayHeader = styled.div`
  background: rgba(255, 255, 255, 0.15);
  padding: 4px 2px;
  text-align: center;
  font-size: 9px;
  font-weight: 600;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
`;

const DayCell = styled.div<{ $isToday?: boolean; $isOtherMonth?: boolean; $hasEvents?: boolean }>`
  background: ${props => {
    if (props.$isOtherMonth) return 'rgba(30, 40, 60, 0.3)';
    if (props.$isToday) return 'linear-gradient(135deg, rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.3))';
    if (props.$hasEvents) return 'linear-gradient(135deg, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0.15))';
    return 'rgba(255, 255, 255, 0.08)';
  }};
  padding: 3px 2px;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  backdrop-filter: blur(3px);
  box-shadow: ${props => props.$isToday ? '0 2px 4px rgba(0, 0, 0, 0.1)' : 'none'};
  border: 1px solid ${props => {
    if (props.$isToday) return 'rgba(255, 255, 255, 0.4)';
    if (props.$hasEvents) return 'rgba(255, 255, 255, 0.2)';
    return 'transparent';
  }};
  justify-content: center;
  cursor: pointer;
  position: relative;
  opacity: ${props => props.$isOtherMonth ? 0.4 : 1};
  color: ${props => props.$isOtherMonth ? 'rgba(255, 255, 255, 0.4)' : 'inherit'};
  transition: all 0.2s ease;
  
  &:hover {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.35), rgba(255, 255, 255, 0.25));
    transform: translateY(-1px) scale(1.05);
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
    z-index: 1;
  }
  
  ${props => props.$hasEvents && !props.$isOtherMonth && `
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-image: 
        repeating-linear-gradient(
          45deg,
          transparent 0px,
          transparent 3px,
          rgba(255, 255, 255, 0.3) 3px,
          rgba(255, 255, 255, 0.3) 4px
        );
      pointer-events: none;
    }
    
    &::after {
      content: '';
      position: absolute;
      bottom: 2px;
      right: 2px;
      width: 3px;
      height: 3px;
      background: rgba(255, 255, 255, 0.9);
      border-radius: 50%;
      box-shadow: 0 0 2px rgba(0, 0, 0, 0.4);
      z-index: 1;
    }
  `}
`;

const DayNumber = styled.div<{ $isToday?: boolean }>`
  font-size: 11px;
  font-weight: ${props => props.$isToday ? 'bold' : 'normal'};
  color: white;
  text-shadow: ${props => props.$isToday ? '0 1px 2px rgba(0, 0, 0, 0.4)' : '0 1px 2px rgba(0, 0, 0, 0.2)'};
`;

// Week View Components
const WeekView = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 16px;
  height: 180px;
`;

const WeekHeader = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  margin-bottom: 16px;
`;

const WeekDayColumn = styled.div`
  text-align: center;
`;

const WeekDayName = styled.div`
  font-size: 10px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 4px;
`;

const WeekDayDate = styled.div<{ $isToday?: boolean }>`
  font-size: 14px;
  font-weight: ${props => props.$isToday ? 'bold' : 'normal'};
  color: white;
  background: ${props => props.$isToday ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 8px;
  padding: 8px 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const WeekEventsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 100px;
  overflow-y: auto;
`;

const WeekEventItem = styled.div<{ $color: string }>`
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-left: 3px solid ${({ $color }) => $color};
  padding: 8px 12px;
  border-radius: 8px;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.15);
  }
`;

// Day View Components
const DayView = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 16px;
  height: 180px;
`;

const DayHeader = styled.div`
  text-align: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const DayTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: white;
  margin: 0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
`;

const DayEventsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 120px;
  overflow-y: auto;
`;

const DayEventItem = styled.div<{ $color: string }>`
  display: flex;
  gap: 12px;
  background: rgba(255, 255, 255, 0.1);
  border-left: 4px solid ${({ $color }) => $color};
  padding: 12px;
  border-radius: 8px;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.15);
  }
`;

const EventTime = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  min-width: 50px;
`;

const EventDetails = styled.div`
  flex: 1;
`;

const EventTitle = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: white;
  margin-bottom: 2px;
`;

const EventLocation = styled.div`
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
`;

const EmptyDayMessage = styled.div`
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  padding: 20px;
`;



// Event Popup Modal - Modern Blue Design
const EventPopupOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(13, 27, 42, 0.8);
  backdrop-filter: blur(8px);
  display: ${({ $isOpen }) => $isOpen ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const EventPopup = styled.div`
  background: linear-gradient(145deg, #ffffff, #f8fafc);
  border-radius: 24px;
  max-width: 420px;
  width: 100%;
  max-height: 80vh;
  overflow: hidden;
  animation: ${slideUp} 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 
    0 25px 50px -12px rgba(61, 76, 116, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.1);
  position: relative;
`;

const PopupHeader = styled.div`
  background: linear-gradient(135deg, #3d4c74, #4a5a85, #566896);
  padding: 24px 24px 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  }
`;

const PopupTitle = styled.h3`
  font-size: 20px;
  font-weight: 700;
  color: white;
  margin: 0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  letter-spacing: -0.5px;
`;

const PopupCloseButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  font-size: 18px;
  color: white;
  cursor: pointer;
  padding: 0;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  transition: all 0.3s ease;
  font-weight: 300;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.3);
    transform: scale(1.05);
  }
`;

const PopupViewTabs = styled.div`
  display: flex;
  gap: 4px;
  padding: 16px 24px;
  background: rgba(61, 76, 116, 0.02);
`;

const ViewTab = styled.button<{ $active: boolean }>`
  padding: 10px 20px;
  border-radius: 12px;
  border: none;
  background: ${({ $active }) => 
    $active 
      ? 'linear-gradient(135deg, #4a5a85, #566896)' 
      : 'transparent'
  };
  color: ${({ $active }) => $active ? 'white' : '#64748b'};
  font-size: 14px;
  font-weight: ${({ $active }) => $active ? '600' : '500'};
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  
  &:hover {
    background: ${({ $active }) => 
      $active 
        ? 'linear-gradient(135deg, #4a5a85, #566896)' 
        : 'rgba(74, 90, 133, 0.1)'
    };
    transform: translateY(-1px);
  }
  
  ${({ $active }) => $active && `
    box-shadow: 0 4px 12px rgba(74, 90, 133, 0.3);
  `}
`;

const PopupContent = styled.div`
  padding: 0 24px 24px 24px;
  background: #ffffff;
`;

const EventList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const PopupEventCard = styled.div<{ $color: string }>`
  padding: 20px;
  border-radius: 16px;
  background: linear-gradient(135deg, #ffffff, #f8fafc);
  border: 1px solid rgba(74, 90, 133, 0.1);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  margin-bottom: 12px;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: ${({ $color }) => $color};
    border-radius: 16px 0 0 16px;
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(74, 90, 133, 0.15);
    border-color: rgba(74, 90, 133, 0.2);
  }
`;

const EventCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
`;

const EventCardTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
  line-height: 1.3;
`;

const EventCardBadge = styled.div<{ $color: string }>`
  background: linear-gradient(135deg, ${({ $color }) => $color}15, ${({ $color }) => $color}10);
  color: ${({ $color }) => $color};
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border: 1px solid ${({ $color }) => $color}20;
`;

const EventCardDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const EventDetail = styled.div`
  font-size: 14px;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 500;
  
  span {
    font-size: 16px;
  }
`;

export const DashboardScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [googleEvents, setGoogleEvents] = useState<any[]>([]);
  const [isGoogleCalendarConnected, setIsGoogleCalendarConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const [isDualQRModalOpen, setIsDualQRModalOpen] = useState(false);
  const [isManagePassModalOpen, setIsManagePassModalOpen] = useState(false);
  const [isSetelConnected, setIsSetelConnected] = useState(true); // Mock connected state
  const [setelBalance, setSetelBalance] = useState(45.60); // Mock Setel wallet balance
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [showSetelOnboarding, setShowSetelOnboarding] = useState(false);
  const [currentPoints, setCurrentPoints] = useState(getUserPoints());
  
  // Filter state for bottom panel system
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [showBottomPanel, setShowBottomPanel] = useState(false);
  const [showProfileSidebar, setShowProfileSidebar] = useState(false);
  
  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showGoogleSync, setShowGoogleSync] = useState(false);
  const [aiSuggestionsEnabled, setAiSuggestionsEnabled] = useState(true);
  const [showEventPopup, setShowEventPopup] = useState(false);
  const [popupView, setPopupView] = useState<'day' | 'week' | 'month'>('day');
  const [calendarView, setCalendarView] = useState<'day' | 'week' | 'month'>('month');
  
  // Travel Fund Modal states
  const [showTravelPlansModal, setShowTravelPlansModal] = useState(false);
  const [showTravelDetailModal, setShowTravelDetailModal] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState<number | null>(null);
  const [activeDetailTab, setActiveDetailTab] = useState<'overview' | 'funding' | 'timeline'>('overview');
  
  // ESC key handler for modals
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowTravelPlansModal(false);
        setShowTravelDetailModal(false);
      }
    };
    
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);
  
  // Travel Plans Data
  const travelPlans = [
    {
      id: 1,
      title: 'Bali Adventure',
      date: 'Dec 15-22, 2024',
      emoji: '🏝️',
      totalBudget: 2000,
      currentFunding: 950,
      percentage: 47.5,
      breakdown: {
        flight: { budget: 600, funded: 600 },
        hotel: { budget: 800, funded: 200 },
        food: { budget: 400, funded: 0 },
        activities: { budget: 200, funded: 150 }
      }
    },
    {
      id: 2,
      title: 'Umrah Journey',
      date: 'March 2025',
      emoji: '🕌',
      totalBudget: 8000,
      currentFunding: 2000,
      percentage: 25,
      breakdown: {
        flight: { budget: 3000, funded: 1500 },
        hotel: { budget: 3000, funded: 500 },
        food: { budget: 1000, funded: 0 },
        activities: { budget: 1000, funded: 0 }
      }
    },
    {
      id: 3,
      title: 'Tokyo Exploration',
      date: 'June 2025',
      emoji: '🗼',
      totalBudget: 5000,
      currentFunding: 500,
      percentage: 10,
      breakdown: {
        flight: { budget: 2000, funded: 300 },
        hotel: { budget: 1500, funded: 200 },
        food: { budget: 1000, funded: 0 },
        activities: { budget: 500, funded: 0 }
      }
    }
  ];
  
  // Mock calendar events for compact calendar - using current date for today's events
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonthIndex = today.getMonth();
  const currentDay = today.getDate();
  
  const [calendarEvents] = useState<CalendarEvent[]>([]);

  // Mock suggested events for days without committed events
  const [suggestedEvents] = useState<CalendarEvent[]>([]);

  // Function to get suggested events for a date
  const getSuggestedEventsForDate = (date: Date | null) => {
    if (!date) return [];
    return suggestedEvents.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.getDate() === date.getDate() &&
             eventDate.getMonth() === date.getMonth() &&
             eventDate.getFullYear() === date.getFullYear();
    });
  };

  // Use universal redemption hook
  const {
    selectedReward,
    showConfirmModal,
    showVoucherModal,
    generatedVoucher,
    toast,
    handleRedeemClick,
    handleConfirmRedeem,
    closeConfirmModal,
    closeVoucherModal,
    navigateToVouchers,
    closeToast,
    canAfford,
    getButtonProps
  } = useUniversalRedemption();

  // Dashboard reward cards data
  const dashboardRewards = [
    { id: 'mukha', icon: '☕', brand: 'Mukha Cafe', title: 'Food & beverage discount', value: '30% off', points: 30, category: 'Food & Drinks', description: '30% off food at Mukha Cafe (except lamb dishes) on the day of peaceful event 1 hour before and 1 hour after', comingSoon: false },
    { id: 'bright', icon: '📚', brand: 'BRIGHT English Centre', title: 'Coming Soon', value: '20% off', points: 999, category: 'Education', description: '20% off English courses', comingSoon: true },
    { id: 'university', icon: '🎓', brand: 'University Studies', title: 'Coming Soon', value: '20% off', points: 999, category: 'Education', description: '20% off university fees', comingSoon: true },
    { id: 'umran', icon: '✈️', brand: 'Umran Travel & Tours', title: 'Coming Soon', value: '10% off', points: 999, category: 'Travel', description: '10% discount on travel', comingSoon: true }
  ];

  // Listen for points updates
  useEffect(() => {
    const handlePointsUpdate = (event: CustomEvent) => {
      setCurrentPoints(event.detail.points);
    };

    window.addEventListener('pointsUpdated', handlePointsUpdate as EventListener);
    
    return () => {
      window.removeEventListener('pointsUpdated', handlePointsUpdate as EventListener);
    };
  }, []);
  
  // Calendar helper functions
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };
  
  const getEventsForDate = (date: Date | null) => {
    if (!date) return [];
    
    // Get app events
    const appEvents = calendarEvents.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.getDate() === date.getDate() &&
             eventDate.getMonth() === date.getMonth() &&
             eventDate.getFullYear() === date.getFullYear();
    });
    
    // Get Google Calendar events for this date
    const googleEventsForDate = googleEvents.filter(event => {
      const eventDate = new Date(event.startTime);
      return eventDate.getDate() === date.getDate() &&
             eventDate.getMonth() === date.getMonth() &&
             eventDate.getFullYear() === date.getFullYear();
    });
    
    // Merge both event sources
    return [...appEvents, ...googleEventsForDate];
  };
  
  const getEventsForWeek = (date: Date) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    return calendarEvents.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate >= startOfWeek && eventDate <= endOfWeek;
    });
  };
  
  const getEventsForMonth = () => {
    return calendarEvents.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.getMonth() === currentMonth.getMonth() &&
             eventDate.getFullYear() === currentMonth.getFullYear();
    });
  };
  
  const getTodayEvents = () => {
    const today = new Date();
    return getEventsForDate(today);
  };
  
  const isToday = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };
  
  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(currentMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(currentMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };
  
  const handleDayClick = (date: Date | null) => {
    if (!date) return;
    setSelectedDate(date);
    setShowEventPopup(true);
    setPopupView('day');
  };
  
  const getMonthYear = () => {
    return currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase();
  };

  // Compact Calendar Component
  const CalendarComponent: React.FC = () => {

    const eventCategories = {
      social: { icon: '🎉', color: '#9C27B0' },
      cafe: { icon: '☕', color: '#795548' },
      ilm: { icon: '📚', color: '#FF9800' },
      donate: { icon: '🤲', color: '#4CAF50' },
      trips: { icon: '✈️', color: '#00BCD4' },
      sukan: { icon: '🏸', color: '#FF5722' },
      volunteer: { icon: '🌱', color: '#8BC34A' },
      ai: { icon: '🤖', color: '#FF4444' }
    };

    // Get calendar days with previous and next month
    const getDaysInMonthCompact = (date: Date) => {
      const year = date.getFullYear();
      const month = date.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const daysInMonth = lastDay.getDate();
      const startingDayOfWeek = firstDay.getDay();
      
      const days = [];
      
      // Previous month days
      const prevMonthLastDay = new Date(year, month, 0).getDate();
      for (let i = startingDayOfWeek - 1; i >= 0; i--) {
        days.push({
          day: prevMonthLastDay - i,
          isOtherMonth: true,
          date: new Date(year, month - 1, prevMonthLastDay - i)
        });
      }
      
      // Current month days
      for (let i = 1; i <= daysInMonth; i++) {
        days.push({
          day: i,
          isOtherMonth: false,
          date: new Date(year, month, i)
        });
      }
      
      // Next month days
      const remainingDays = 35 - days.length; // 5 weeks * 7 days
      for (let i = 1; i <= remainingDays; i++) {
        days.push({
          day: i,
          isOtherMonth: true,
          date: new Date(year, month + 1, i)
        });
      }
      
      return days;
    };

    const days = getDaysInMonthCompact(currentMonth);
    const todayEvents = getTodayEvents();
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <CalendarContainer>
        <CalendarWidget>
          {/* Compact Header */}
          <CalendarHeader>
            <MonthNavigation>
              <NavButton onClick={() => navigateMonth('prev')} style={{ fontSize: '10px', padding: '4px 8px' }}>
                ‹
              </NavButton>
              <MonthTitle>
                {getMonthYear()}
              </MonthTitle>
              <NavButton onClick={() => navigateMonth('next')} style={{ fontSize: '10px', padding: '4px 8px' }}>
                ›
              </NavButton>
            </MonthNavigation>
            
            <CalendarViewSwitcher>
              <ViewSwitchButton 
                $active={calendarView === 'day'} 
                onClick={() => setCalendarView('day')}
              >
                Day
              </ViewSwitchButton>
              <ViewSwitchButton 
                $active={calendarView === 'week'} 
                onClick={() => setCalendarView('week')}
              >
                Week
              </ViewSwitchButton>
              <ViewSwitchButton 
                $active={calendarView === 'month'} 
                onClick={() => setCalendarView('month')}
              >
                Month
              </ViewSwitchButton>
            </CalendarViewSwitcher>
          </CalendarHeader>

          <CalendarContent>
            <CalendarLeft>
              {/* Render different calendar views */}
              {calendarView === 'month' && (
                <CalendarGrid>
                  {weekDays.map(day => (
                    <WeekDayHeader key={day}>{day.charAt(0)}</WeekDayHeader>
                  ))}
                  
                  {days.map((dayInfo, index) => {
                    const dayEvents = getEventsForDate(dayInfo.date);
                    return (
                      <DayCell
                        key={index}
                        $isToday={isToday(dayInfo.date)}
                        $isOtherMonth={dayInfo.isOtherMonth}
                        $hasEvents={dayEvents.length > 0}
                        onClick={() => handleDayClick(dayInfo.date)}
                      >
                        <DayNumber $isToday={isToday(dayInfo.date)}>
                          {dayInfo.day}
                        </DayNumber>
                      </DayCell>
                    );
                  })}
                </CalendarGrid>
              )}

              {calendarView === 'week' && (
                <WeekView>
                  <WeekHeader>
                    {Array.from({length: 7}, (_, i) => {
                      const date = new Date(selectedDate);
                      date.setDate(selectedDate.getDate() - selectedDate.getDay() + i);
                      return (
                        <WeekDayColumn key={i}>
                          <WeekDayName>{weekDays[i]}</WeekDayName>
                          <WeekDayDate 
                            $isToday={isToday(date)}
                            onClick={() => handleDayClick(date)}
                          >
                            {date.getDate()}
                          </WeekDayDate>
                        </WeekDayColumn>
                      );
                    })}
                  </WeekHeader>
                  <WeekEventsContainer>
                    {getEventsForWeek(selectedDate).map(event => (
                      <WeekEventItem key={event.id} $color={event.color}>
                        <span>{event.icon}</span>
                        <div>
                          <div style={{fontWeight: '600', fontSize: '12px'}}>{event.title}</div>
                          <div style={{fontSize: '10px', opacity: 0.8}}>{event.time}</div>
                        </div>
                      </WeekEventItem>
                    ))}
                  </WeekEventsContainer>
                </WeekView>
              )}

              {calendarView === 'day' && (
                <DayView>
                  <DayHeader>
                    <DayTitle>
                      {selectedDate.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </DayTitle>
                  </DayHeader>
                  <DayEventsContainer>
                    {getEventsForDate(selectedDate).length > 0 ? (
                      getEventsForDate(selectedDate).map(event => (
                        <DayEventItem key={event.id} $color={event.color}>
                          <EventTime>{event.time}</EventTime>
                          <EventDetails>
                            <EventTitle>{event.icon} {event.title}</EventTitle>
                            <EventLocation>{event.location}</EventLocation>
                          </EventDetails>
                        </DayEventItem>
                      ))
                    ) : (
                      <EmptyDayMessage>
                        <div style={{fontSize: '32px', marginBottom: '8px'}}>📅</div>
                        <div>No events scheduled for this day</div>
                      </EmptyDayMessage>
                    )}
                  </DayEventsContainer>
                </DayView>
              )}
            </CalendarLeft>
          </CalendarContent>
          <div style={{ 
            textAlign: 'center', 
            fontSize: '8px', 
            color: 'rgba(255, 255, 255, 0.6)', 
            marginTop: '4px',
            marginBottom: '-4px',
            fontStyle: 'italic',
            letterSpacing: '0.3px',
            lineHeight: '1.4'
          }}>
            Tap to see event details • Patterned dates = committed events
          </div>
        </CalendarWidget>
      </CalendarContainer>
    );
  };

  // Travel deals data for dashboard
  const travelDeals = [
    { id: 'mukha', icon: '☕', brand: 'Mukha Cafe', title: 'Mukha Cafe', discount: '30% OFF', points: 30, pointsText: '💰 30 pts', color: '#FF6B35', category: 'Food & Drinks', description: '30% off food at Mukha Cafe (except lamb dishes) on the day of peaceful event 1 hour before and 1 hour after', value: '30% off', comingSoon: false },
    { id: 'bright', icon: '📚', brand: 'BRIGHT English Centre', title: 'Coming Soon', discount: 'Soon', points: 999, pointsText: 'Coming Soon', color: '#999', category: 'Education', description: '20% off English courses', value: '20% off', comingSoon: true },
    { id: 'bali', icon: '🏝️', brand: 'Travel Agency', title: 'Coming Soon', discount: 'Soon', points: 999, pointsText: 'Coming Soon', color: '#999', category: 'Travel', description: '20% discount on Bali trip package', value: '20% off', comingSoon: true },
    { id: 'university', icon: '🎓', brand: 'University Studies', title: 'Coming Soon', discount: 'Soon', points: 999, pointsText: 'Coming Soon', color: '#999', category: 'Education', description: '20% off university fees', value: '20% off', comingSoon: true },
    { id: 'umrah', icon: '🕋', brand: 'Umrah Travel & Tours', title: 'Coming Soon', discount: 'Soon', points: 999, pointsText: 'Coming Soon', color: '#999', category: 'Travel', description: '25% discount on Umrah package', value: '25% off', comingSoon: true },
    { id: 'dubai', icon: '🏨', brand: 'Dubai Hotels', title: 'Coming Soon', discount: 'Soon', points: 999, pointsText: 'Coming Soon', color: '#999', category: 'Travel', description: '30% discount on Dubai hotel booking', value: '30% off', comingSoon: true },
    { id: 'tokyo', icon: '✈️', brand: 'Airlines', title: 'Coming Soon', discount: 'Soon', points: 999, pointsText: 'Coming Soon', color: '#999', category: 'Travel', description: '15% discount on Tokyo flights', value: '15% off', comingSoon: true },
  ];

  // Generate QR code data for BersePass
  const generateQRData = () => {
    const bersePassData = {
      userId: user?.id || 'user_123',
      userName: user?.fullName || 'Zara Aisha',
      bersePassStatus: 'ACTIVE',
      passType: 'PREMIUM',
      validUntil: '2025-12-31',
      level: 3,
      points: currentPoints,
      memberSince: '2024-01-01',
      benefits: ['free_events', 'cafe_discounts', 'priority_booking'],
      timestamp: new Date().toISOString()
    };
    return JSON.stringify(bersePassData);
  };

  // Simulate Setel balance update (in production, this would be an API call)
  useEffect(() => {
    if (isSetelConnected) {
      setIsLoadingBalance(true);
      // Simulate API delay
      setTimeout(() => {
        setSetelBalance(45.60); // Updated balance from Setel
        setIsLoadingBalance(false);
      }, 1000);
    }
  }, [isSetelConnected]);

  // Check for first-time users
  useEffect(() => {
    const hasSeenSetelIntro = localStorage.getItem('hasSeenSetelIntro');
    if (!hasSeenSetelIntro && !isSetelConnected) {
      setShowSetelOnboarding(true);
    }
  }, [isSetelConnected]);

  useEffect(() => {
    console.log('DashboardScreen loaded on port 5173');
    // loadUpcomingEvents();
    setIsLoading(false); // Set loading to false since we're not loading events yet
  }, []);

  // Filter handler functions for inline content
  const handleFilterClick = (filterType: string) => {
    console.log(`Filter clicked: ${filterType} on port 5173`);
    
    if (activeFilter === filterType) {
      // If clicking the same filter, hide content
      setActiveFilter(null);
    } else {
      // Show new filter content
      setActiveFilter(filterType);
    }
  };

  const getFilterTitle = (filter: string | null): string => {
    const titles: { [key: string]: string } = {
      'featured-rewards': '🎁 Featured Rewards',
      'points-leaderboard': '🏆 Points Leaderboard', 
      'recent-activities': '📈 Recent Activities',
      'bersementor': '👨‍🏫 BerseMentor',
      'bersebuddy': '🤝 BerseBuddy'
    };
    return titles[filter || ''] || 'Explore Features';
  };

  const renderFilterContent = (filter: string | null) => {
    switch (filter) {
      case 'featured-rewards':
        // Updated design - should show new layout
        return (
          <RewardsContainer>
            <RewardsGrid>
              <RewardCard $bgColor="#999" style={{ opacity: 0.8 }}>
                <CategoryLabel>📚 EDUCATION</CategoryLabel>
                <ClaimedText>COMING SOON</ClaimedText>
                <MiniProgressBar $percentage={0} />
                
                <RewardContent>
                  <RewardTitle>BRIGHT English Centre</RewardTitle>
                  <DiscountBox>Soon</DiscountBox>
                  <FilterRewardPoints>Coming Soon</FilterRewardPoints>
                  <ExpiryInfo>⏰ Coming Soon</ExpiryInfo>
                </RewardContent>
                
                <FilterRedeemButton 
                  onClick={() => {
                    const interests = JSON.parse(localStorage.getItem('featureInterests') || '{}');
                    const userId = user?.id || 'demo_user';
                    if (!interests.brightEnglish) {
                      interests.brightEnglish = [];
                    }
                    if (!interests.brightEnglish.includes(userId)) {
                      interests.brightEnglish.push(userId);
                      localStorage.setItem('featureInterests', JSON.stringify(interests));
                      alert('✅ Thank you for your interest in BRIGHT English Centre rewards! We\'ll notify you when available.');
                    } else {
                      alert('You\'ve already expressed interest. We\'ll notify you when it launches!');
                    }
                  }}
                  style={{ 
                    background: 'linear-gradient(135deg, #FF6B35, #F45B29)',
                    opacity: 1,
                    cursor: 'pointer'
                  }}
                >
                  I'm Interested
                </FilterRedeemButton>
              </RewardCard>

              <RewardCard $bgColor="#757575" style={{ opacity: 0.8 }}>
                <CategoryLabel style={{ color: '#aaa' }}>📚 EDUCATION</CategoryLabel>
                <ClaimedText style={{ color: '#999' }}>COMING SOON</ClaimedText>
                <MiniProgressBar $percentage={0} />
                
                <RewardContent>
                  <RewardTitle style={{ color: '#ccc' }}>University Studies</RewardTitle>
                  <DiscountBox style={{ background: '#666', color: '#aaa' }}>Soon</DiscountBox>
                  <FilterRewardPoints style={{ color: '#999' }}>Coming Soon</FilterRewardPoints>
                  <ExpiryInfo style={{ color: '#999' }}>⏰ Coming Soon</ExpiryInfo>
                </RewardContent>
                
                <FilterRedeemButton 
                  onClick={() => null}
                  disabled={true}
                  style={{ 
                    background: '#555',
                    color: '#999',
                    border: '1px solid #444',
                    cursor: 'not-allowed'
                  }}
                >
                  Coming Soon
                </FilterRedeemButton>
              </RewardCard>

              <RewardCard $bgColor="#FF6B35">
                <CategoryLabel>🍽️ FOOD & DRINKS</CategoryLabel>
                <ClaimedText>45% CLAIMED</ClaimedText>
                <MiniProgressBar $percentage={45} />
                
                <RewardContent>
                  <RewardTitle>Mukha Cafe</RewardTitle>
                  <DiscountBox>30% OFF</DiscountBox>
                  <FilterRewardPoints>💰 30 pts</FilterRewardPoints>
                  <ExpiryInfo>⏰ Available now</ExpiryInfo>
                </RewardContent>
                
                <FilterRedeemButton 
                  onClick={() => handleRedeemClick({
                    id: 'mukha',
                    icon: '☕',
                    brand: 'Mukha Cafe',
                    title: 'Food & beverage discount',
                    value: '30% off',
                    points: 30,
                    category: 'Food & Drinks',
                    description: '30% off food at Mukha Cafe (except lamb dishes) on the day of peaceful event 1 hour before and 1 hour after'
                  })}
                  disabled={!canAfford(30)}
                  style={{ opacity: canAfford(30) ? 1 : 0.5 }}
                >
                  Redeem
                </FilterRedeemButton>
              </RewardCard>

              <RewardCard $bgColor="#757575" style={{ opacity: 0.8 }}>
                <CategoryLabel style={{ color: '#aaa' }}>✈️ TRAVEL</CategoryLabel>
                <ClaimedText style={{ color: '#999' }}>COMING SOON</ClaimedText>
                <MiniProgressBar $percentage={0} />
                
                <RewardContent>
                  <RewardTitle style={{ color: '#ccc' }}>Umrah Travel & Tours</RewardTitle>
                  <DiscountBox style={{ background: '#666', color: '#aaa' }}>Soon</DiscountBox>
                  <FilterRewardPoints style={{ color: '#999' }}>Coming Soon</FilterRewardPoints>
                  <ExpiryInfo style={{ color: '#999' }}>⏰ Coming Soon</ExpiryInfo>
                </RewardContent>
                
                <FilterRedeemButton 
                  onClick={() => null}
                  disabled={true}
                  style={{ 
                    background: '#555',
                    color: '#999',
                    border: '1px solid #444',
                    cursor: 'not-allowed'
                  }}
                >
                  Coming Soon
                </FilterRedeemButton>
              </RewardCard>

              <RewardCard $bgColor="#757575" style={{ opacity: 0.8 }}>
                <CategoryLabel style={{ color: '#aaa' }}>🏥 HEALTHCARE</CategoryLabel>
                <ClaimedText style={{ color: '#999' }}>COMING SOON</ClaimedText>
                <MiniProgressBar $percentage={0} />
                
                <RewardContent>
                  <RewardTitle style={{ color: '#ccc' }}>KPJ Healthcare</RewardTitle>
                  <DiscountBox style={{ background: '#666', color: '#aaa' }}>Soon</DiscountBox>
                  <FilterRewardPoints style={{ color: '#999' }}>Coming Soon</FilterRewardPoints>
                  <ExpiryInfo style={{ color: '#999' }}>⏰ Coming Soon</ExpiryInfo>
                </RewardContent>
                
                <FilterRedeemButton 
                  onClick={() => null}
                  disabled={true}
                  style={{ 
                    background: '#555',
                    color: '#999',
                    border: '1px solid #444',
                    cursor: 'not-allowed'
                  }}
                >
                  Coming Soon
                </FilterRedeemButton>
              </RewardCard>

              <RewardCard $bgColor="#757575" style={{ opacity: 0.8 }}>
                <CategoryLabel style={{ color: '#aaa' }}>🏊 SPORTS</CategoryLabel>
                <ClaimedText style={{ color: '#999' }}>COMING SOON</ClaimedText>
                <MiniProgressBar $percentage={0} />
                
                <RewardContent>
                  <RewardTitle style={{ color: '#ccc' }}>Fit Malaysia Gym</RewardTitle>
                  <DiscountBox style={{ background: '#666', color: '#aaa' }}>Soon</DiscountBox>
                  <FilterRewardPoints style={{ color: '#999' }}>Coming Soon</FilterRewardPoints>
                  <ExpiryInfo style={{ color: '#999' }}>⏰ Coming Soon</ExpiryInfo>
                </RewardContent>
                
                <FilterRedeemButton 
                  onClick={() => null}
                  disabled={true}
                  style={{ 
                    background: '#555',
                    color: '#999',
                    border: '1px solid #444',
                    cursor: 'not-allowed'
                  }}
                >
                  Coming Soon
                </FilterRedeemButton>
              </RewardCard>

              <RewardCard $bgColor="#757575" style={{ opacity: 0.8 }}>
                <CategoryLabel style={{ color: '#aaa' }}>🎬 ENTERTAINMENT</CategoryLabel>
                <ClaimedText style={{ color: '#999' }}>COMING SOON</ClaimedText>
                <MiniProgressBar $percentage={0} />
                
                <RewardContent>
                  <RewardTitle style={{ color: '#ccc' }}>GSC Cinemas</RewardTitle>
                  <DiscountBox style={{ background: '#666', color: '#aaa' }}>Soon</DiscountBox>
                  <FilterRewardPoints style={{ color: '#999' }}>Coming Soon</FilterRewardPoints>
                  <ExpiryInfo style={{ color: '#999' }}>⏰ Coming Soon</ExpiryInfo>
                </RewardContent>
                
                <FilterRedeemButton 
                  onClick={() => null}
                  disabled={true}
                  style={{ 
                    background: '#555',
                    color: '#999',
                    border: '1px solid #444',
                    cursor: 'not-allowed'
                  }}
                >
                  Coming Soon
                </FilterRedeemButton>
              </RewardCard>

              <RewardCard $bgColor="#757575" style={{ opacity: 0.8 }}>
                <CategoryLabel style={{ color: '#aaa' }}>🛍️ SHOPPING</CategoryLabel>
                <ClaimedText style={{ color: '#999' }}>COMING SOON</ClaimedText>
                <MiniProgressBar $percentage={0} />
                
                <RewardContent>
                  <RewardTitle style={{ color: '#ccc' }}>Mydin Hypermarket</RewardTitle>
                  <DiscountBox style={{ background: '#666', color: '#aaa' }}>Soon</DiscountBox>
                  <FilterRewardPoints style={{ color: '#999' }}>Coming Soon</FilterRewardPoints>
                  <ExpiryInfo style={{ color: '#999' }}>⏰ Coming Soon</ExpiryInfo>
                </RewardContent>
                
                <FilterRedeemButton 
                  onClick={() => null}
                  disabled={true}
                  style={{ 
                    background: '#555',
                    color: '#999',
                    border: '1px solid #444',
                    cursor: 'not-allowed'
                  }}
                >
                  Coming Soon
                </FilterRedeemButton>
              </RewardCard>
            </RewardsGrid>
          </RewardsContainer>
        );

      case 'points-leaderboard':
        return (
          <LeaderboardContainer>
            <LeaderboardHeader>
              <HeaderIcon>🏆</HeaderIcon>
              <HeaderTitle>Points Leaderboard</HeaderTitle>
            </LeaderboardHeader>
            
            <FilterLeaderboardList>
              <LeaderboardItem $rank={1}>
                <RankNumber>1.</RankNumber>
                <PlayerName>Ahmad M.</PlayerName>
                <PlayerPoints>1,245</PlayerPoints>
                <PointsChange $positive={true}>+45</PointsChange>
              </LeaderboardItem>

              <LeaderboardItem $rank={2}>
                <RankNumber>2.</RankNumber>
                <PlayerName>Siti F.</PlayerName>
                <PlayerPoints>980</PlayerPoints>
                <PointsChange $positive={true}>+32</PointsChange>
              </LeaderboardItem>

              <LeaderboardItem $rank={3}>
                <RankNumber>3.</RankNumber>
                <PlayerName>Khalid M.</PlayerName>
                <PlayerPoints>750</PlayerPoints>
                <PointsChange $positive={true}>+28</PointsChange>
              </LeaderboardItem>

              <LeaderboardItem $rank={7} $isUser={true}>
                <RankNumber>7.</RankNumber>
                <PlayerName>Zayd M. (You)</PlayerName>
                <PlayerPoints>245</PlayerPoints>
                <PointsChange $positive={true}>+15</PointsChange>
              </LeaderboardItem>
            </FilterLeaderboardList>

            <ViewFullButton onClick={() => navigate('/leaderboard')}>
              <ViewFullIcon>🏆</ViewFullIcon>
              View Full Leaderboard →
            </ViewFullButton>
          </LeaderboardContainer>
        );

      case 'recent-activities':
        return (
          <ActivitiesContainer>
            <ActivitiesHeader>
              <HeaderIcon>📈</HeaderIcon>
              <HeaderTitle>Recent Activities</HeaderTitle>
            </ActivitiesHeader>

            <ActivitiesList>
              <FilterActivityItem>
                <ActivityIconContainer $bgColor="#4A90E2">
                  <FilterActivityIcon>🤝</FilterActivityIcon>
                </ActivityIconContainer>
                <ActivityContent>
                  <ActivityTitle>Sarah & Ahmad connected</ActivityTitle>
                </ActivityContent>
                <ActivityPoints>+3 pts</ActivityPoints>
              </FilterActivityItem>

              <FilterActivityItem>
                <ActivityIconContainer $bgColor="#27AE60">
                  <FilterActivityIcon>🎯</FilterActivityIcon>
                </ActivityIconContainer>
                <ActivityContent>
                  <ActivityTitle>15 joined Cameron trip</ActivityTitle>
                </ActivityContent>
                <ActivityMeta>15 joined</ActivityMeta>
              </FilterActivityItem>

              <FilterActivityItem>
                <ActivityIconContainer $bgColor="#9C27B0">
                  <FilterActivityIcon>⭐</FilterActivityIcon>
                </ActivityIconContainer>
                <ActivityContent>
                  <ActivityTitle>Berseka gathering started</ActivityTitle>
                </ActivityContent>
                <ActivityMeta>12 joined</ActivityMeta>
              </FilterActivityItem>

              <FilterActivityItem>
                <ActivityIconContainer $bgColor="#2E7D32">
                  <FilterActivityIcon>📖</FilterActivityIcon>
                </ActivityIconContainer>
                <ActivityContent>
                  <ActivityTitle>Quran study completed</ActivityTitle>
                </ActivityContent>
                <ActivityMeta>8 members</ActivityMeta>
              </FilterActivityItem>

              <FilterActivityItem>
                <ActivityIconContainer $bgColor="#F57C00">
                  <FilterActivityIcon>🧹</FilterActivityIcon>
                </ActivityIconContainer>
                <ActivityContent>
                  <ActivityTitle>Cleanup completed</ActivityTitle>
                </ActivityContent>
                <ActivityMeta>20 volunteers</ActivityMeta>
              </FilterActivityItem>
            </ActivitiesList>
          </ActivitiesContainer>
        );



      default:
        return null;
    }
  };

  // const loadUpcomingEvents = async () => {
  //   try {
  //     const events = await eventService.getUpcomingEvents();
  //     setUpcomingEvents(events.slice(0, 3)); // Show only 3 events
  //   } catch (error) {
  //     console.error('Failed to load events:', error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // Universal redemption system now handles all redemption logic

  const handleNavigation = (tab: string) => {
    setActiveTab(tab);
    switch (tab) {
      case 'connect':
        navigate('/connect');
        break;
      case 'match':
        navigate('/match');
        break;
      case 'Forum':
        navigate('/Forum');
        break;
      default:
        // Stay on dashboard
        break;
    }
  };

  return (
    <Container>
      <style>
        {`
          .rewards-scroll-container::-webkit-scrollbar {
            display: none;
          }
          .rewards-scroll-container {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}
      </style>
      <StatusBar />
      <CompactHeader 
        onMenuClick={() => setShowProfileSidebar(true)}
      />
      
      <Content>
        {/* Compact Calendar Widget - Only shows on port 5173 */}
        <CalendarComponent />

        {/* Quick Actions Section - Separate from Calendar */}
        <QuickActionsSection>
          <QuickActionsContainer>
            <QuickActionsHeader>
              <QuickActionsTitle>Quick Actions</QuickActionsTitle>
              <TravelFundButton 
                onClick={() => alert('Coming Soon! 🚀')}
                style={{ 
                  background: '#757575',
                  opacity: 0.8,
                  cursor: 'not-allowed',
                  color: '#ccc',
                  border: '1px solid #555'
                }}
              >
                ✈️ My Travel Fund - Soon
              </TravelFundButton>
            </QuickActionsHeader>
            
            <QuickActionsGrid>
              <QuickActionButton $variant="events" onClick={() => navigate('/connect')}>
                <ActionIcon>🎫</ActionIcon>
                <ActionText>
                  <strong>Find Events</strong>
                  Gatherings & Socials
                </ActionText>
                <ActionBadge>3 new</ActionBadge>
              </QuickActionButton>
              
              <QuickActionButton $variant="profiles" onClick={() => navigate('/match')}>
                <ActionIcon>👥</ActionIcon>
                <ActionText>
                  <strong>Explore Profiles</strong>
                  Connect & network
                </ActionText>
                <ActionBadge>5 new</ActionBadge>
              </QuickActionButton>
              
              <QuickActionButton $variant="game" onClick={() => navigate('/bersecardgame')}>
                <ActionIcon>🃏</ActionIcon>
                <ActionText>
                  <strong>BerseCardGame</strong>
                  Conversation prompts
                </ActionText>
                <ActionBadge $special>New!</ActionBadge>
              </QuickActionButton>
              
              <QuickActionButton 
                $variant="market" 
                onClick={(e) => { 
                  e.preventDefault(); 
                  // Track interest in feature
                  const interests = JSON.parse(localStorage.getItem('featureInterests') || '{}');
                  const userId = user?.id || 'demo_user';
                  if (!interests.berseMarket) {
                    interests.berseMarket = [];
                  }
                  if (!interests.berseMarket.includes(userId)) {
                    interests.berseMarket.push(userId);
                    localStorage.setItem('featureInterests', JSON.stringify(interests));
                    alert('✅ Thank you for your interest in BerseMarket! We\'ll notify you when it launches.');
                  } else {
                    alert('You\'ve already expressed interest in BerseMarket. We\'ll notify you when it launches!');
                  }
                }} 
                style={{ 
                  background: 'linear-gradient(135deg, #757575, #616161)',
                  opacity: 0.7,
                  position: 'relative',
                  border: '1px solid #555'
                }}
              >
                <ActionIcon style={{ opacity: 0.6 }}>🛍️</ActionIcon>
                <ActionText style={{ color: '#ccc' }}>
                  <strong>BerseMarket</strong>
                  Buy, sell, trade
                </ActionText>
                <ActionBadge style={{ background: '#666', color: '#aaa' }}>Coming Soon</ActionBadge>
              </QuickActionButton>
            </QuickActionsGrid>
          </QuickActionsContainer>
        </QuickActionsSection>

        {/* Event Popup Modal */}
        <EventPopupOverlay 
          $isOpen={showEventPopup} 
          onClick={() => setShowEventPopup(false)}
        >
          <EventPopup onClick={(e) => e.stopPropagation()}>
            <PopupHeader>
              <PopupTitle>
                {popupView === 'day' && selectedDate && 
                  selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
                }
                {popupView === 'week' && 'This Week'}
                {popupView === 'month' && getMonthYear()}
              </PopupTitle>
              <PopupCloseButton onClick={() => setShowEventPopup(false)}>
                ×
              </PopupCloseButton>
            </PopupHeader>

            <PopupViewTabs>
              <ViewTab 
                $active={popupView === 'day'} 
                onClick={() => setPopupView('day')}
              >
                Day
              </ViewTab>
              <ViewTab 
                $active={popupView === 'week'} 
                onClick={() => setPopupView('week')}
              >
                Week
              </ViewTab>
              <ViewTab 
                $active={popupView === 'month'} 
                onClick={() => setPopupView('month')}
              >
                Month
              </ViewTab>
            </PopupViewTabs>

            <PopupContent>
              <EventList>
                {popupView === 'day' && selectedDate && (
                  (() => {
                    const committedEvents = getEventsForDate(selectedDate);
                    const suggestedEvents = getSuggestedEventsForDate(selectedDate);
                    
                    if (committedEvents.length > 0) {
                      // Show committed events
                      return (
                        <>
                          <div style={{ 
                            marginBottom: '20px', 
                            padding: '16px 20px', 
                            background: 'linear-gradient(135deg, rgba(74, 90, 133, 0.05), rgba(86, 104, 150, 0.02))', 
                            borderRadius: '16px',
                            border: '1px solid rgba(74, 90, 133, 0.1)',
                            position: 'relative'
                          }}>
                            <div style={{ 
                              fontSize: '16px', 
                              fontWeight: '700', 
                              color: '#1e293b',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              marginBottom: '4px'
                            }}>
                              ✅ Your Committed Events
                            </div>
                            <div style={{ 
                              fontSize: '13px', 
                              color: '#64748b',
                              fontWeight: '500'
                            }}>
                              Events you've joined and confirmed to attend
                            </div>
                          </div>
                          {committedEvents.map(event => (
                            <PopupEventCard key={event.id} $color={event.color}>
                              <EventCardHeader>
                                <EventCardTitle>
                                  {event.icon} {event.title}
                                </EventCardTitle>
                                <EventCardBadge $color={event.color}>
                                  {event.status}
                                </EventCardBadge>
                              </EventCardHeader>
                              <EventCardDetails>
                                <EventDetail>
                                  🕐 {event.time}
                                </EventDetail>
                                <EventDetail>
                                  📍 {event.location}
                                </EventDetail>
                                <EventDetail style={{ color: '#4CAF50', fontWeight: '600' }}>
                                  ✅ You're attending
                                </EventDetail>
                              </EventCardDetails>
                            </PopupEventCard>
                          ))}
                        </>
                      );
                    } else if (suggestedEvents.length > 0) {
                      // Show suggested events
                      return (
                        <>
                          <div style={{ 
                            marginBottom: '20px', 
                            padding: '16px 20px', 
                            background: 'linear-gradient(135deg, rgba(100, 116, 139, 0.08), rgba(74, 90, 133, 0.03))', 
                            borderRadius: '16px',
                            border: '1px solid rgba(100, 116, 139, 0.15)',
                            position: 'relative'
                          }}>
                            <div style={{ 
                              fontSize: '16px', 
                              fontWeight: '700', 
                              color: '#334155',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              marginBottom: '4px'
                            }}>
                              💡 Suggested Events in Your City
                            </div>
                            <div style={{ 
                              fontSize: '13px', 
                              color: '#64748b',
                              fontWeight: '500'
                            }}>
                              Tap an event to join and meet like-minded people
                            </div>
                          </div>
                          {suggestedEvents.map(event => (
                            <SuggestedEventCard key={event.id} $color={event.color}>
                              <EventCardHeader>
                                <EventCardTitle>
                                  {event.icon} {event.title}
                                </EventCardTitle>
                                <SuggestedBadge>
                                  Suggested
                                </SuggestedBadge>
                              </EventCardHeader>
                              <EventCardDetails>
                                <EventDetail>
                                  🕐 {event.time}
                                </EventDetail>
                                <EventDetail>
                                  📍 {event.location}
                                </EventDetail>
                                <EventDetail style={{ color: '#FF9800', fontWeight: '600' }}>
                                  💎 +5 points for joining
                                </EventDetail>
                              </EventCardDetails>
                              <JoinEventButton>
                                <span>👋</span> Join Event
                              </JoinEventButton>
                            </SuggestedEventCard>
                          ))}
                        </>
                      );
                    } else {
                      // No events at all
                      return (
                        <div style={{ textAlign: 'center', color: '#666', padding: '40px 20px' }}>
                          <div style={{ fontSize: '48px', marginBottom: '16px', opacity: '0.5' }}>
                            📅
                          </div>
                          <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                            No events for this day
                          </div>
                          <div style={{ fontSize: '14px', lineHeight: '1.4', marginBottom: '20px' }}>
                            Check back later or explore other dates for upcoming activities in your area
                          </div>
                          <div style={{
                            background: '#2fce98',
                            color: 'white',
                            padding: '10px 16px',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'inline-block'
                          }}
                          onClick={() => navigate('/connect')}
                          >
                            🔍 Find Events
                          </div>
                        </div>
                      );
                    }
                  })()
                )}

                {popupView === 'week' && selectedDate && (
                  getEventsForWeek(selectedDate).length > 0 ? (
                    getEventsForWeek(selectedDate).map(event => (
                      <PopupEventCard key={event.id} $color={event.color}>
                        <EventCardHeader>
                          <EventCardTitle>
                            {event.icon} {event.title}
                          </EventCardTitle>
                          <EventCardBadge $color={event.color}>
                            {new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                          </EventCardBadge>
                        </EventCardHeader>
                        <EventCardDetails>
                          <EventDetail>
                            🕐 {event.time}
                          </EventDetail>
                          <EventDetail>
                            📍 {event.location}
                          </EventDetail>
                          {event.points && (
                            <EventDetail style={{ color: '#4CAF50', fontWeight: '600' }}>
                              💎 +{event.points} points
                            </EventDetail>
                          )}
                        </EventCardDetails>
                      </PopupEventCard>
                    ))
                  ) : (
                    <div style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
                      No events scheduled for this week
                    </div>
                  )
                )}

                {popupView === 'month' && (
                  getEventsForMonth().length > 0 ? (
                    getEventsForMonth().map(event => (
                      <PopupEventCard key={event.id} $color={event.color}>
                        <EventCardHeader>
                          <EventCardTitle>
                            {event.icon} {event.title}
                          </EventCardTitle>
                          <EventCardBadge $color={event.color}>
                            {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </EventCardBadge>
                        </EventCardHeader>
                        <EventCardDetails>
                          <EventDetail>
                            🕐 {event.time}
                          </EventDetail>
                          <EventDetail>
                            📍 {event.location}
                          </EventDetail>
                          {event.points && (
                            <EventDetail style={{ color: '#4CAF50', fontWeight: '600' }}>
                              💎 +{event.points} points
                            </EventDetail>
                          )}
                        </EventCardDetails>
                      </PopupEventCard>
                    ))
                  ) : (
                    <div style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
                      No events scheduled for this month
                    </div>
                  )
                )}
              </EventList>
            </PopupContent>
          </EventPopup>
        </EventPopupOverlay>

        {/* Featured Rewards */}
        <FeaturedRewardsContainer>
          <FeaturedRewardsHeader>
            <FeaturedRewardsTitle>
              Featured Rewards
            </FeaturedRewardsTitle>
            <AllRewardsButton 
              onClick={() => alert('Coming Soon! 🚀')}
              style={{ 
                background: '#757575',
                opacity: 0.8,
                cursor: 'not-allowed',
                color: '#ccc',
                border: '1px solid #555'
              }}
            >
              🎁 All Rewards - Soon
            </AllRewardsButton>
          </FeaturedRewardsHeader>
          <HorizontalScroll>
            {travelDeals.map((deal, index) => (
              <DealCard key={index} $bgColor={deal.color} style={{ opacity: deal.comingSoon ? 0.6 : 1 }}>
                <DealCardTop>
                  <DealCardTitle color="white">{deal.title}</DealCardTitle>
                </DealCardTop>
                <DealCardMiddle>
                  <DealCardDiscount color="white">{deal.discount}</DealCardDiscount>
                </DealCardMiddle>
                <DealCardBottom>
                  <DealCardPoints color="rgba(255,255,255,0.8)">
                    {deal.pointsText}
                  </DealCardPoints>
                  <DealCardButton
                    onClick={() => deal.comingSoon ? null : (canAfford(deal.points) ? handleRedeemClick({
                      id: deal.id,
                      icon: deal.icon,
                      brand: deal.brand,
                      title: deal.description,
                      value: deal.value,
                      points: deal.points,
                      category: deal.category,
                      description: deal.description
                    }) : null)}
                    disabled={deal.comingSoon || !canAfford(deal.points)}
                  >
                    {deal.comingSoon ? 'Soon' : (canAfford(deal.points) ? 'Redeem' : 'Not Enough')}
                  </DealCardButton>
                </DealCardBottom>
              </DealCard>
            ))}
          </HorizontalScroll>
        </FeaturedRewardsContainer>

        {/* Features Section - Filter Based System */}
        <FeaturesSection>
          <FeaturesGrid>
            <FeatureButton 
              onClick={() => alert('Coming Soon! 🚀')}
              style={{ opacity: 0.6, cursor: 'not-allowed' }}
            >
              <FeatureIconContainer $bgColor="#E8D5E8" $active={false}>
                <FeatureIcon>🏆</FeatureIcon>
              </FeatureIconContainer>
              <FeatureTitle>Points Leaderboard - Soon</FeatureTitle>
            </FeatureButton>

            <FeatureButton 
              onClick={() => alert('Coming Soon! 🚀')}
              style={{ opacity: 0.6, cursor: 'not-allowed' }}
            >
              <FeatureIconContainer $bgColor="#E8F4E8" $active={false}>
                <FeatureIcon>📈</FeatureIcon>
              </FeatureIconContainer>
              <FeatureTitle>Recent Activities - Soon</FeatureTitle>
            </FeatureButton>

          </FeaturesGrid>
        </FeaturesSection>

        {/* Filter Content Section - Shows below buttons when active */}
        {activeFilter && (
          <FilteredContent>
            {renderFilterContent(activeFilter)}
          </FilteredContent>
        )}
      </Content>

      <MainNav 
        activeTab={activeTab as 'home' | 'connect' | 'match' | 'market'}
        onTabPress={(tab) => {
          setActiveTab(tab);
          switch (tab) {
            case 'connect':
              navigate('/connect');
              break;
            case 'match':
              navigate('/match');
              break;
            case 'market':
              navigate('/market');
              break;
            case 'home':
            default:
              // Stay on dashboard
              break;
          }
        }}
      />
      
      <SideMenu
        isOpen={isSideMenuOpen}
        onClose={() => setIsSideMenuOpen(false)}
      />
      
      <NotificationPanel
        isOpen={isNotificationPanelOpen}
        onClose={() => setIsNotificationPanelOpen(false)}
        notificationCount={3}
      />

      {/* Dual QR Modal */}
      <DualQRModal 
        isOpen={isDualQRModalOpen}
        onClose={() => setIsDualQRModalOpen(false)}
      />

      {/* Manage Pass Modal */}
      <ManagePassModal 
        isOpen={isManagePassModalOpen}
        onClose={() => setIsManagePassModalOpen(false)}
      />

      {/* Setel Onboarding Modal */}
      {showSetelOnboarding && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '20px'
          }}
          onClick={() => {
            setShowSetelOnboarding(false);
            localStorage.setItem('hasSeenSetelIntro', 'true');
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '24px',
              maxWidth: '360px',
              width: '100%',
              position: 'relative',
              textAlign: 'center'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => {
                setShowSetelOnboarding(false);
                localStorage.setItem('hasSeenSetelIntro', 'true');
              }}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#666',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              ×
            </button>

            {/* Setel Logo Area */}
            <div style={{
              width: '80px',
              height: '80px',
              backgroundColor: '#2fce98',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              fontSize: '32px'
            }}>
              🚗
            </div>

            {/* Modal title */}
            <h3 style={{
              margin: '0 0 8px 0',
              color: '#333',
              fontSize: '20px',
              fontWeight: 'bold'
            }}>
              Connect Your Setel Wallet
            </h3>

            {/* Subtitle */}
            <p style={{
              color: '#666',
              fontSize: '14px',
              margin: '0 0 20px 0',
              lineHeight: '1.4'
            }}>
              Link your Setel account to unlock seamless payments and enjoy exclusive BersePass benefits
            </p>

            {/* Benefits List */}
            <div style={{
              backgroundColor: '#f8f9fa',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '20px',
              textAlign: 'left'
            }}>
              <div style={{ 
                fontSize: '14px', 
                fontWeight: '600', 
                color: '#2fce98', 
                marginBottom: '12px',
                textAlign: 'center'
              }}>
                ✨ What you'll get:
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                  <span style={{ color: '#10B981' }}>💰</span>
                  <span>Real-time wallet balance in BersePass</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                  <span style={{ color: '#10B981' }}>⚡</span>
                  <span>One-tap top-up directly from Setel app</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                  <span style={{ color: '#10B981' }}>🎫</span>
                  <span>Instant payments for events and activities</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                  <span style={{ color: '#10B981' }}>🔒</span>
                  <span>Secure & encrypted connection</span>
                </div>
              </div>
            </div>

            {/* Security Note */}
            <div style={{
              backgroundColor: '#fff3e0',
              border: '1px solid #FF9800',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span>🔐</span>
                <strong style={{ fontSize: '13px', color: '#E65100' }}>Privacy & Security</strong>
              </div>
              <p style={{ 
                margin: '0', 
                fontSize: '12px', 
                color: '#666',
                lineHeight: '1.3'
              }}>
                We only access your balance for display. Your Setel account remains fully secure and private.
              </p>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => {
                  setShowSetelOnboarding(false);
                  localStorage.setItem('hasSeenSetelIntro', 'true');
                }}
                style={{
                  flex: 1,
                  backgroundColor: '#f0f0f0',
                  color: '#666',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e0e0e0'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
              >
                Maybe Later
              </button>
              <button
                onClick={() => {
                  // Mock successful connection
                  setIsSetelConnected(true);
                  setShowSetelOnboarding(false);
                  localStorage.setItem('hasSeenSetelIntro', 'true');
                  alert('Successfully connected to Setel! 🎉');
                  // In production: Redirect to Setel OAuth or deep link
                  // window.location.href = 'setel://oauth/authorize?client_id=bersepass';
                }}
                style={{
                  flex: 1,
                  backgroundColor: '#2fce98',
                  color: 'white',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1a4a3a'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2fce98'}
              >
                Connect Setel
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Redemption Confirmation Modal */}
      <RedemptionConfirmModal
        isOpen={showConfirmModal && selectedReward !== null}
        onClose={closeConfirmModal}
        reward={selectedReward || {
          id: '',
          icon: '',
          brand: '',
          title: '',
          points: 0
        }}
        currentPoints={currentPoints}
        onConfirm={handleConfirmRedeem}
      />
      
      {/* Voucher Display Modal */}
      <VoucherDisplayModal
        isOpen={showVoucherModal && generatedVoucher !== null}
        onClose={closeVoucherModal}
        voucher={generatedVoucher || {
          code: '',
          brand: '',
          title: '',
          icon: '',
          value: '',
          expiryDate: new Date()
        }}
        onNavigateToVouchers={navigateToVouchers}
      />
      
      {/* Toast Notification */}
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={closeToast}
      />

      <ProfileSidebar 
        isOpen={showProfileSidebar}
        onClose={() => setShowProfileSidebar(false)}
      />

      {/* Travel Plans List Modal */}
      <TravelModalOverlay 
        $isOpen={showTravelPlansModal}
        onClick={() => setShowTravelPlansModal(false)}
      >
        <TravelModalContainer onClick={(e) => e.stopPropagation()}>
          <TravelModalHeader>
            <TravelModalTitle>My Travel Plans 🌍</TravelModalTitle>
            <TravelModalClose onClick={() => setShowTravelPlansModal(false)}>✕</TravelModalClose>
          </TravelModalHeader>
          <TravelModalContent>
            <div style={{ marginBottom: '8px', fontSize: '14px', color: '#666' }}>
              Select a trip to view details:
            </div>
            
            {travelPlans.map(trip => (
              <TripCard key={trip.id}>
                <TripHeader>
                  <TripEmoji>{trip.emoji}</TripEmoji>
                  <TripInfo>
                    <TripTitle>{trip.title}</TripTitle>
                    <TripDate>{trip.date}</TripDate>
                  </TripInfo>
                </TripHeader>
                <TripProgress>
                  <ProgressBar $percentage={trip.percentage} />
                  <TripFunding>
                    <span>{trip.percentage}% funded</span>
                    <span>RM {trip.currentFunding}/{trip.totalBudget}</span>
                  </TripFunding>
                </TripProgress>
                <ViewDetailsButton onClick={() => {
                  setSelectedTripId(trip.id);
                  setShowTravelPlansModal(false);
                  setShowTravelDetailModal(true);
                  setActiveDetailTab('overview');
                }}>
                  View Details →
                </ViewDetailsButton>
              </TripCard>
            ))}
            
            <AddTripCard>
              <TripEmoji>➕</TripEmoji>
              <TripTitle style={{ marginTop: '8px' }}>Add New Trip Plan</TripTitle>
              <TripDate>Start planning your next adventure</TripDate>
              <ViewDetailsButton style={{ background: '#4CAF50' }}>
                Create New →
              </ViewDetailsButton>
            </AddTripCard>
          </TravelModalContent>
        </TravelModalContainer>
      </TravelModalOverlay>

      {/* Travel Plan Detail Modal */}
      <TravelModalOverlay 
        $isOpen={showTravelDetailModal}
        onClick={() => setShowTravelDetailModal(false)}
      >
        <TravelModalContainer onClick={(e) => e.stopPropagation()}>
          {selectedTripId && (() => {
            const trip = travelPlans.find(t => t.id === selectedTripId);
            if (!trip) return null;
            
            return (
              <>
                <TravelModalHeader>
                  <TravelModalTitle>Travel Fund Planner ✈️</TravelModalTitle>
                  <TravelModalClose onClick={() => setShowTravelDetailModal(false)}>✕</TravelModalClose>
                </TravelModalHeader>
                
                <TravelModalContent>
                  <DetailTabs>
                    <DetailTab 
                      $active={activeDetailTab === 'overview'}
                      onClick={() => setActiveDetailTab('overview')}
                    >
                      Overview
                    </DetailTab>
                    <DetailTab 
                      $active={activeDetailTab === 'funding'}
                      onClick={() => setActiveDetailTab('funding')}
                    >
                      Funding
                    </DetailTab>
                    <DetailTab 
                      $active={activeDetailTab === 'timeline'}
                      onClick={() => setActiveDetailTab('timeline')}
                    >
                      Timeline
                    </DetailTab>
                  </DetailTabs>
                  
                  {activeDetailTab === 'overview' && (
                    <>
                      <div style={{ marginBottom: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                          <span style={{ fontSize: '28px' }}>{trip.emoji}</span>
                          <div>
                            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>{trip.title}</h3>
                            <div style={{ fontSize: '13px', color: '#666' }}>{trip.date}</div>
                          </div>
                        </div>
                      </div>
                      
                      <div style={{ background: '#f8f9fa', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
                        <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '12px' }}>Total Progress</div>
                        <ProgressBar $percentage={trip.percentage} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '13px' }}>
                          <span>{trip.percentage}% Funded</span>
                          <span>RM {trip.currentFunding}/{trip.totalBudget}</span>
                        </div>
                        <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
                          45 days remaining
                        </div>
                      </div>
                      
                      <div style={{ marginBottom: '20px' }}>
                        <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '12px' }}>Budget Breakdown:</div>
                        
                        <BudgetItem>
                          <BudgetLabel>
                            <span><BudgetIcon>✈️</BudgetIcon>Flight</span>
                            <span>RM {trip.breakdown.flight.funded}/{trip.breakdown.flight.budget} ✓</span>
                          </BudgetLabel>
                          <ProgressBar $percentage={(trip.breakdown.flight.funded / trip.breakdown.flight.budget) * 100} />
                        </BudgetItem>
                        
                        <BudgetItem>
                          <BudgetLabel>
                            <span><BudgetIcon>🏨</BudgetIcon>Hotel</span>
                            <span>RM {trip.breakdown.hotel.funded}/{trip.breakdown.hotel.budget}</span>
                          </BudgetLabel>
                          <ProgressBar $percentage={(trip.breakdown.hotel.funded / trip.breakdown.hotel.budget) * 100} />
                        </BudgetItem>
                        
                        <BudgetItem>
                          <BudgetLabel>
                            <span><BudgetIcon>🍽️</BudgetIcon>Food</span>
                            <span>RM {trip.breakdown.food.funded}/{trip.breakdown.food.budget}</span>
                          </BudgetLabel>
                          <ProgressBar $percentage={(trip.breakdown.food.funded / trip.breakdown.food.budget) * 100} />
                        </BudgetItem>
                        
                        <BudgetItem>
                          <BudgetLabel>
                            <span><BudgetIcon>🎯</BudgetIcon>Activities</span>
                            <span>RM {trip.breakdown.activities.funded}/{trip.breakdown.activities.budget}</span>
                          </BudgetLabel>
                          <ProgressBar $percentage={(trip.breakdown.activities.funded / trip.breakdown.activities.budget) * 100} />
                        </BudgetItem>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <BackButton onClick={() => {
                          setShowTravelDetailModal(false);
                          setShowTravelPlansModal(true);
                        }}>
                          ← Back to Plans
                        </BackButton>
                        <TravelActionButton>Edit Trip</TravelActionButton>
                      </div>
                    </>
                  )}
                  
                  {activeDetailTab === 'funding' && (
                    <>
                      <FundingSection>
                        <FundingTitle>🛍️ MARKETPLACE OPTIONS</FundingTitle>
                        <div style={{ fontSize: '13px', marginBottom: '12px' }}>Suggested items to sell:</div>
                        <CheckboxItem>
                          <input type="checkbox" />
                          <span style={{ flex: 1 }}>Textbooks</span>
                          <span>RM 150</span>
                        </CheckboxItem>
                        <CheckboxItem>
                          <input type="checkbox" />
                          <span style={{ flex: 1 }}>Electronics</span>
                          <span>RM 500</span>
                        </CheckboxItem>
                        <CheckboxItem>
                          <input type="checkbox" />
                          <span style={{ flex: 1 }}>Clothes</span>
                          <span>RM 100</span>
                        </CheckboxItem>
                        <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e0e0e0', fontSize: '13px' }}>
                          <strong>Total value: RM 750</strong>
                        </div>
                        <TravelActionButton style={{ width: '100%', marginTop: '12px' }}>
                          Go to Market →
                        </TravelActionButton>
                      </FundingSection>
                      
                      <FundingSection>
                        <FundingTitle>🎁 POINTS REDEMPTION</FundingTitle>
                        <div style={{ fontSize: '14px', marginBottom: '12px' }}>
                          Your Points: <strong>800</strong>
                        </div>
                        <div style={{ fontSize: '13px', marginBottom: '12px' }}>Available rewards:</div>
                        <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                          <span>✈️ AirAsia discount -500pts</span>
                          <span style={{ color: '#4CAF50' }}>Save RM 120</span>
                        </div>
                        <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                          <span>🏨 Hotel.com -300pts</span>
                          <span style={{ color: '#4CAF50' }}>Save RM 50</span>
                        </div>
                        <TravelActionButton 
                          style={{ width: '100%', opacity: 0.6, cursor: 'not-allowed' }}
                          onClick={() => alert('Coming Soon! 🚀')}
                        >
                          View All Rewards - Soon
                        </TravelActionButton>
                      </FundingSection>
                      
                      <FundingSection>
                        <FundingTitle>💰 QUICK ACTIONS</FundingTitle>
                        <div style={{ fontSize: '14px', marginBottom: '12px' }}>
                          Earn RM {trip.totalBudget - trip.currentFunding} by:
                        </div>
                        <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', lineHeight: '1.6' }}>
                          <li>Selling 5 items</li>
                          <li>Tutoring 20 hours</li>
                          <li>Using points wisely</li>
                        </ul>
                        <TravelActionButton style={{ width: '100%', marginTop: '12px' }}>
                          Start Earning →
                        </TravelActionButton>
                      </FundingSection>
                    </>
                  )}
                  
                  {activeDetailTab === 'timeline' && (
                    <>
                      <div style={{ marginBottom: '20px' }}>
                        <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>
                          📅 45 days until trip
                        </div>
                      </div>
                      
                      <div style={{ marginBottom: '16px' }}>
                        <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>
                          Week 1-2: Need RM 300
                        </div>
                        <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', lineHeight: '1.6' }}>
                          <li>Sell textbooks</li>
                          <li>Start tutoring ads</li>
                        </ul>
                      </div>
                      
                      <div style={{ marginBottom: '16px' }}>
                        <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>
                          Week 3-4: Need RM 400
                        </div>
                        <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', lineHeight: '1.6' }}>
                          <li>Redeem flight discount</li>
                          <li>Sell electronics</li>
                        </ul>
                      </div>
                      
                      <div style={{ marginBottom: '20px' }}>
                        <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>
                          Week 5-6: Need RM 350
                        </div>
                        <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', lineHeight: '1.6' }}>
                          <li>Final push with services</li>
                          <li>Use remaining points</li>
                        </ul>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <TravelActionButton>Set Reminders</TravelActionButton>
                        <TravelActionButton style={{ background: '#4CAF50' }}>Share Plan</TravelActionButton>
                      </div>
                    </>
                  )}
                </TravelModalContent>
              </>
            );
          })()}
        </TravelModalContainer>
      </TravelModalOverlay>
    </Container>
  );
};

// Feature Buttons Styled Components
const FeaturesSection = styled.div`
  margin: 16px 0;
  padding: 0 16px;
  display: flex;
  justify-content: center;
`;

const FeaturesGrid = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding: 0 4px;
  
  @media (max-width: 350px) {
    gap: 8px;
    padding: 0 2px;
  }
`;

const FeatureButton = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 6px 3px;
  transition: all 0.2s ease;
  position: relative;
  flex: 1;
  max-width: 70px;
  
  &:hover {
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const FeatureIconContainer = styled.div<{ $bgColor: string; $active?: boolean }>`
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background: ${({ $bgColor, $active }) => $active ? '#2fce98' : $bgColor};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
  box-shadow: ${({ $active }) => 
    $active ? '0 2px 8px rgba(45, 95, 79, 0.3)' : '0 1px 4px rgba(0, 0, 0, 0.1)'
  };
  transition: all 0.2s ease;
  border: ${({ $active }) => $active ? '2px solid #2fce98' : 'none'};
  
  @media (max-width: 350px) {
    width: 40px;
    height: 40px;
  }
  
  ${FeatureButton}:hover & {
    transform: scale(1.05);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }
`;

const FeatureIcon = styled.div`
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  @media (max-width: 350px) {
    font-size: 16px;
  }
`;

const FeatureTitle = styled.span`
  font-size: 9px;
  font-weight: 500;
  color: #333;
  text-align: center;
  line-height: 1.1;
  max-width: 60px;
  word-wrap: break-word;
  hyphens: auto;
  
  @media (max-width: 350px) {
    font-size: 8px;
    max-width: 50px;
  }
`;

const IntegrationBadge = styled.div`
  position: absolute;
  top: -1px;
  right: 2px;
  background: rgba(255, 255, 255, 0.95);
  color: #333;
  padding: 1px 3px;
  border-radius: 4px;
  font-size: 6px;
  font-weight: 600;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(0, 0, 0, 0.1);
  
  @media (max-width: 350px) {
    font-size: 5px;
    padding: 1px 2px;
  }
`;

// Filter Content Styled Components
const FilteredContent = styled.div`
  margin: 0 20px 20px 20px;
  animation: fadeIn 0.3s ease-in-out;
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

// Featured Rewards Components  
const RewardsContainer = styled.div`
  padding: 0;
`;

const RewardsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  
  @media (max-width: 375px) {
    gap: 6px;
  }
`;

const RewardCard = styled.div<{ $bgColor: string }>`
  background: ${({ $bgColor }) => $bgColor};
  border-radius: 12px;
  padding: 10px;
  color: white;
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 150px;
  
  @media (max-width: 375px) {
    padding: 8px;
    min-height: 140px;
    border-radius: 10px;
  }
`;

const ClaimedText = styled.div`
  font-size: 9px;
  font-weight: bold;
  opacity: 0.9;
  margin-bottom: 2px;
`;

const MiniProgressBar = styled.div<{ $percentage: number }>`
  height: 3px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  margin-bottom: 8px;
  overflow: hidden;
  
  &::after {
    content: '';
    display: block;
    height: 100%;
    background: rgba(255, 255, 255, 0.8);
    width: ${props => props.$percentage}%;
    border-radius: 2px;
    transition: width 0.5s ease;
  }
`;

const DiscountBox = styled.div`
  border: 1.5px solid rgba(255, 255, 255, 0.9);
  padding: 4px 10px;
  border-radius: 4px;
  font-weight: bold;
  font-size: 12px;
  margin-bottom: 6px;
  display: inline-block;
`;

const ExpiryInfo = styled.div`
  font-size: 9px;
  opacity: 0.9;
  margin-bottom: 8px;
`;

const CategoryLabel = styled.div`
  font-size: 8px;
  font-weight: bold;
  text-transform: uppercase;
  opacity: 0.9;
  margin-bottom: 4px;
  letter-spacing: 0.3px;
`;

// Travel Fund Modal Styles
const TravelModalOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: ${({ $isOpen }) => $isOpen ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 10001;
  padding: 20px;
  animation: ${({ $isOpen }) => $isOpen ? 'fadeIn 0.3s ease' : 'none'};
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const TravelModalContainer = styled.div`
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 400px;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
  animation: slideUp 0.3s ease;
  
  @keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
`;

const TravelModalHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TravelModalTitle = styled.h2`
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin: 0;
`;

const TravelModalClose = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  color: #666;
  cursor: pointer;
  padding: 4px;
  transition: transform 0.2s;
  
  &:hover {
    transform: scale(1.1);
  }
`;

const TravelModalContent = styled.div`
  padding: 20px;
`;

const TripCard = styled.div`
  background: #f8f9fa;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  border: 1px solid #e0e0e0;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const TripHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
`;

const TripEmoji = styled.span`
  font-size: 28px;
`;

const TripInfo = styled.div`
  flex: 1;
`;

const TripTitle = styled.h3`
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin: 0 0 4px 0;
`;

const TripDate = styled.div`
  font-size: 12px;
  color: #666;
`;

const TripProgress = styled.div`
  margin: 12px 0;
`;

const ProgressBar = styled.div<{ $percentage: number }>`
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
  
  &::after {
    content: '';
    display: block;
    height: 100%;
    width: ${props => props.$percentage}%;
    background: ${props => 
      props.$percentage >= 75 ? '#4CAF50' :
      props.$percentage >= 50 ? '#FFC107' :
      '#FF5722'
    };
    transition: width 0.5s ease;
  }
`;

const TripFunding = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: #666;
`;

const ViewDetailsButton = styled.button`
  width: 100%;
  padding: 10px;
  background: #2fce98;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  margin-top: 12px;
  
  &:hover {
    background: #1a4a3a;
  }
`;

const AddTripCard = styled(TripCard)`
  background: linear-gradient(135deg, #e8f4f0 0%, #f0f8f5 100%);
  border: 2px dashed #2fce98;
  text-align: center;
  cursor: pointer;
  
  &:hover {
    background: linear-gradient(135deg, #d5e8e0 0%, #e0f0e8 100%);
  }
`;

const DetailTabs = styled.div`
  display: flex;
  background: #f8f9fa;
  border-radius: 8px;
  padding: 4px;
  margin-bottom: 20px;
`;

const DetailTab = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 10px;
  background: ${({ $active }) => $active ? 'white' : 'transparent'};
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: ${({ $active }) => $active ? '600' : '500'};
  color: ${({ $active }) => $active ? '#2fce98' : '#666'};
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    color: #2fce98;
  }
`;

const BudgetItem = styled.div`
  margin-bottom: 16px;
`;

const BudgetLabel = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
  font-size: 14px;
`;

const BudgetIcon = styled.span`
  margin-right: 8px;
`;

const FundingSection = styled.div`
  background: #f8f9fa;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
`;

const FundingTitle = styled.h4`
  font-size: 14px;
  font-weight: bold;
  color: #333;
  margin: 0 0 12px 0;
`;

const CheckboxItem = styled.label`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  cursor: pointer;
  font-size: 13px;
  
  input {
    margin-right: 8px;
  }
`;

const TravelActionButton = styled.button`
  background: #2fce98;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: #1a4a3a;
  }
`;

const BackButton = styled.button`
  background: #e0e0e0;
  color: #333;
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  margin-right: 8px;
  
  &:hover {
    background: #d0d0d0;
  }
`;

const FilterRewardIcon = styled.div`
  font-size: 24px;
  margin-bottom: 8px;
`;

const RewardContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 4px 0;
`;

const RewardTitle = styled.h4`
  font-size: 12px;
  font-weight: bold;
  margin: 0 0 6px 0;
  line-height: 1.1;
  
  @media (max-width: 375px) {
    font-size: 11px;
    margin: 0 0 4px 0;
  }
`;

const RewardDiscount = styled.p`
  font-size: 11px;
  margin: 0 0 8px 0;
  opacity: 0.9;
`;

const FilterRewardPoints = styled.div`
  font-size: 11px;
  font-weight: bold;
  margin-bottom: 4px;
  
  @media (max-width: 375px) {
    font-size: 10px;
  }
`;

const FilterRedeemButton = styled.button`
  background: rgba(255, 255, 255, 0.9);
  color: ${props => props.disabled ? '#999' : '#333'};
  border: none;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 11px;
  font-weight: 600;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  width: 100%;
  transition: all 0.2s ease;
  
  @media (max-width: 375px) {
    padding: 5px 10px;
    font-size: 10px;
    border-radius: 4px;
  }
  
  &:hover:not(:disabled) {
    background: white;
    transform: translateY(-1px);
  }
`;

// Travel Deals Components
const HorizontalScroll = styled.div`
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding: 0;
  padding-right: 6px;
  
  &::-webkit-scrollbar {
    display: none;
  }
  
  @media (max-width: 375px) {
    gap: 4px;
  }
`;

const DealCard = styled.div<{ $bgColor?: string }>`
  min-width: 95px;
  background: ${props => props.$bgColor || 'white'};
  border-radius: 8px;
  padding: 6px 8px 4px 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 75px;
  
  @media (max-width: 375px) {
    min-width: 90px;
    padding: 5px 6px 3px 6px;
    min-height: 70px;
    border-radius: 6px;
  }

  &:hover {
    transform: translateY(-2px);
  }
`;

const DealCardTitle = styled.h4`
  font-size: 9px;
  font-weight: 600;
  color: ${props => props.color || '#333'};
  margin: 0;
  line-height: 1.1;
  flex-shrink: 0;
  text-align: left;
  width: 100%;
  
  @media (max-width: 375px) {
    font-size: 8px;
  }
`;

const DealCardDiscount = styled.div`
  font-size: 13px;
  font-weight: bold;
  color: ${props => props.color || '#333'};
  margin: 0;
  text-align: left;
  width: 100%;
  
  @media (max-width: 375px) {
    font-size: 12px;
  }
`;

const DealCardPoints = styled.div`
  font-size: 8px;
  color: ${props => props.color || '#666'};
  margin: 0;
  flex-shrink: 0;
  text-align: left;
  width: 100%;
  
  @media (max-width: 375px) {
    font-size: 7px;
  }
`;

const DealCardButton = styled.button`
  background: ${props => props.disabled ? 'rgba(255, 255, 255, 0.6)' : 'white'};
  color: ${props => props.disabled ? 'rgba(51, 51, 51, 0.8)' : '#333'};
  border: none;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: ${props => props.disabled ? '8px' : '9px'};
  font-weight: 600;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s;
  margin-top: 3px;
  margin-bottom: 0;
  flex-shrink: 0;
  
  @media (max-width: 375px) {
    padding: 2px 6px;
    font-size: ${props => props.disabled ? '7px' : '8px'};
    border-radius: 3px;
  }
  
  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.95);
    transform: translateY(-1px);
  }
  
  &:disabled {
    background: rgba(255, 255, 255, 0.6);
  }
`;

const DealCardTop = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
`;

const DealCardMiddle = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  text-align: left;
`;

const DealCardBottom = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1px;
`;

// Leaderboard Components
const LeaderboardContainer = styled.div``;

const LeaderboardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
`;

const HeaderIcon = styled.div`
  font-size: 20px;
`;

const HeaderTitle = styled.h3`
  font-size: 18px;
  font-weight: bold;
  color: #2fce98;
  margin: 0;
`;

const FilterLeaderboardList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
`;

const LeaderboardItem = styled.div<{ $rank: number; $isUser?: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: ${({ $isUser }) => $isUser ? '#E8F5E8' : 'white'};
  border-radius: 12px;
  border: ${({ $isUser }) => $isUser ? '2px solid #2fce98' : '1px solid #f0f0f0'};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const RankNumber = styled.div`
  font-size: 16px;
  font-weight: bold;
  color: #333;
  min-width: 20px;
`;

const PlayerName = styled.div`
  flex: 1;
  font-size: 14px;
  font-weight: 600;
  color: #333;
`;

const PlayerPoints = styled.div`
  font-size: 16px;
  font-weight: bold;
  color: #2fce98;
`;

const PointsChange = styled.div<{ $positive: boolean }>`
  font-size: 12px;
  color: ${({ $positive }) => $positive ? '#27AE60' : '#E74C3C'};
  font-weight: 600;
`;

const ViewFullButton = styled.button`
  background: #2fce98;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  &:hover {
    background: #1F4A3A;
  }
`;

const ViewFullIcon = styled.div`
  font-size: 16px;
`;

// Activities Components
const ActivitiesContainer = styled.div``;

const ActivitiesHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
`;

const ActivitiesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const FilterActivityItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border: 1px solid #f0f0f0;
`;

const ActivityIconContainer = styled.div<{ $bgColor: string }>`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: ${({ $bgColor }) => $bgColor};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const FilterActivityIcon = styled.div`
  font-size: 16px;
  color: white;
`;

const ActivityContent = styled.div`
  flex: 1;
`;

const ActivityTitle = styled.h5`
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin: 0;
`;

const ActivityPoints = styled.div`
  font-size: 12px;
  font-weight: bold;
  color: #2fce98;
`;

const ActivityMeta = styled.div`
  font-size: 12px;
  color: #666;
`;

// Integration Components
const MentorContainer = styled.div``;

const BuddyContainer = styled.div``;

// Suggested Events Components - Modern Blue Design
const SuggestedEventCard = styled.div<{ $color: string }>`
  padding: 20px;
  border-radius: 16px;
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border: 2px dashed rgba(74, 90, 133, 0.3);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  margin-bottom: 12px;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    padding: 2px;
    background: linear-gradient(135deg, #4a5a85, #566896, #64748b);
    border-radius: 16px;
    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    mask-composite: exclude;
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 30px rgba(74, 90, 133, 0.15);
    border-color: rgba(74, 90, 133, 0.4);
    background: linear-gradient(135deg, #ffffff, #f8fafc);
    
    &::before {
      opacity: 1;
    }
  }
`;

const SuggestedBadge = styled.div`
  background: linear-gradient(135deg, rgba(74, 90, 133, 0.1), rgba(86, 104, 150, 0.05));
  color: #4a5a85;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border: 1px solid rgba(74, 90, 133, 0.2);
`;

const JoinEventButton = styled.button`
  width: 100%;
  background: linear-gradient(135deg, #4a5a85, #566896);
  color: white;
  border: none;
  padding: 14px 20px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(74, 90, 133, 0.3);
  
  &:hover {
    background: linear-gradient(135deg, #3d4c74, #4a5a85);
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(74, 90, 133, 0.4);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 4px 12px rgba(74, 90, 133, 0.3);
  }
  
  span {
    font-size: 16px;
  }
`;

const IntegrationPrompt = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f0f8ff;
  border-radius: 12px;
  margin-bottom: 16px;
`;

const PromptIcon = styled.div`
  font-size: 32px;
`;

const PromptText = styled.div`
  flex: 1;
`;

const PromptTitle = styled.h5`
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin: 0 0 4px 0;
`;

const PromptDesc = styled.p`
  font-size: 12px;
  color: #666;
  margin: 0;
  line-height: 1.4;
`;

const FilterConnectButton = styled.button`
  background: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  
  &:hover {
    background: #0056b3;
  }
`;

