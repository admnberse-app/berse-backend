import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { StatusBar } from '../components/StatusBar/StatusBar';
import { MainNav } from '../components/MainNav/MainNav';
import { useAuth } from '../contexts/AuthContext';
import { cardGameService } from '../services/cardgame.service';
import { checkAdminAccess } from '../utils/adminUtils';
import html2canvas from 'html2canvas';
import { ShareModal } from '../components/CommunityModals/ShareModal';

// ================================
// STYLED COMPONENTS
// ================================

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #F9F3E3;
  max-width: 393px;
  margin: 0 auto;
`;

const Header = styled.div`
  background: #F9F3E3;
  width: 100%;
  padding: 12px 16px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  color: #2fce98;
  font-size: 16px;
  cursor: pointer;
  padding: 8px;
  
  &:hover {
    opacity: 0.7;
  }
`;

const BackIcon = styled.span`
  font-size: 20px;
`;

const BackLabel = styled.span`
  font-size: 14px;
  font-weight: 500;
`;

const HeaderText = styled.div`
  flex: 1;
`;

const HeaderTitle = styled.h1`
  font-size: 18px;
  color: #333333;
  font-weight: 600;
  margin: 0;
`;

const HeaderSubtitle = styled.div`
  font-size: 12px;
  color: #999999;
  font-weight: normal;
`;

const ViewFeedbackButton = styled.button`
  background: #2fce98;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: background 0.2s;
  
  &:hover {
    background: #27b584;
  }
`;

const Content = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  margin-bottom: 100px; /* Added extra space for floating nav */
  height: calc(100vh - 200px);
  
  /* Custom scrollbar styling */
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #2fce98;
    border-radius: 10px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #4A7C59;
  }
`;

const IntroSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const IntroTitle = styled.h2`
  font-size: 20px;
  color: #2fce98;
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const IntroText = styled.p`
  font-size: 14px;
  line-height: 1.6;
  color: #333;
  margin: 0 0 16px 0;
`;

const HowItWorksSection = styled.div`
  margin-top: 16px;
`;

const HowItWorksTitle = styled.h3`
  font-size: 16px;
  color: #2fce98;
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FeatureList = styled.ul`
  margin: 0;
  padding-left: 20px;
  font-size: 13px;
  line-height: 1.5;
  color: #555;
`;

const FeatureItem = styled.li`
  margin-bottom: 6px;
`;

const TopicsSection = styled.div`
  margin-top: 8px;
`;

const TopicsTitle = styled.h3`
  font-size: 18px;
  color: #2fce98;
  margin: 0 0 16px 0;
  text-align: center;
`;

const TopicsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 20px;
  width: 100%;
`;

const TopicCard = styled.div<{ $gradient: string }>`
  background: ${({ $gradient }) => $gradient};
  border-radius: 16px;
  padding: 20px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-height: 160px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  gap: 12px;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  }
  
  @media (max-width: 480px) {
    min-height: 140px;
    padding: 16px;
  }
`;

const TopicTitle = styled.h4`
  font-size: 15px;
  font-weight: bold;
  color: white;
  margin: 0;
  text-align: center;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  line-height: 1.3;
  cursor: pointer;
  
  &:hover {
    text-decoration: underline;
  }
  
  @media (max-width: 480px) {
    font-size: 13px;
    line-height: 1.2;
  }
  
  @media (min-width: 768px) {
    font-size: 16px;
  }
`;

const FeedbackThreadButton = styled.button`
  background: rgba(255, 255, 255, 0.25);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 20px;
  padding: 6px 14px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.35);
    border-color: rgba(255, 255, 255, 0.6);
    transform: scale(1.02);
  }
  
  &:active {
    transform: scale(0.98);
  }
  
  @media (max-width: 480px) {
    font-size: 11px;
    padding: 5px 12px;
  }
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
  padding: 20px;
`;

// Session Selection Modal
const SessionModal = styled.div`
  background: white;
  border-radius: 20px;
  padding: 24px;
  margin: 0 auto;
  max-width: 340px;
  width: 100%;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
`;

const SessionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const SessionTitle = styled.h3`
  font-size: 18px;
  color: #2fce98;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  color: #666;
  cursor: pointer;
  padding: 4px;
  
  &:hover {
    color: #333;
  }
`;

const SessionDescription = styled.p`
  font-size: 14px;
  color: #666;
  line-height: 1.4;
  margin-bottom: 20px;
`;

const SessionButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SessionButton = styled.button<{ $gradient: string }>`
  background: ${({ $gradient }) => $gradient};
  border: none;
  border-radius: 12px;
  padding: 16px;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
`;

const SessionButtonTitle = styled.div`
  font-size: 16px;
  margin-bottom: 4px;
`;

const SessionButtonDescription = styled.div`
  font-size: 12px;
  opacity: 0.9;
  font-weight: normal;
`;

// Question Card Modal
const QuestionCard = styled.div<{ $gradient: string }>`
  background: ${({ $gradient }) => $gradient};
  border-radius: 20px;
  padding: 24px;
  margin: 0 auto;
  max-width: 340px;
  width: 100%;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  animation: cardFlip 0.5s ease-in-out;
  
  @keyframes cardFlip {
    0% { transform: rotateY(90deg); opacity: 0; }
    100% { transform: rotateY(0deg); opacity: 1; }
  }
`;

const QuestionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
`;

const SessionIndicator = styled.div`
  color: white;
  font-size: 12px;
  font-weight: 500;
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 12px;
  border-radius: 12px;
  margin-bottom: 8px;
`;

const QuestionCounter = styled.div`
  color: white;
  font-size: 12px;
  font-weight: 500;
`;

const QuestionText = styled.div`
  color: white;
  font-size: 16px;
  line-height: 1.5;
  text-align: center;
  margin-bottom: 24px;
  font-weight: 500;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
`;

const NavigationButtons = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
`;

const NavButton = styled.button<{ $disabled?: boolean }>`
  background: rgba(255, 255, 255, 0.9);
  color: #333;
  border: none;
  padding: 10px 20px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: ${({ $disabled }) => $disabled ? 'not-allowed' : 'pointer'};
  opacity: ${({ $disabled }) => $disabled ? 0.5 : 1};
  transition: all 0.2s ease;
  flex: 1;
  
  &:hover:not(:disabled) {
    background: white;
    transform: translateY(-1px);
  }
`;

const ActionButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const BackToSessionsButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 10px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

// Feedback Form Components
const ShowFeedbackButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 10px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const FeedbackSection = styled.div<{ $isOpen: boolean }>`
  max-height: ${({ $isOpen }) => $isOpen ? '300px' : '0'};
  overflow: hidden;
  transition: max-height 0.3s ease;
  margin-top: 16px;
`;

const FeedbackForm = styled.div`
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 16px;
`;

const StarRating = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 12px;
`;

const Star = styled.button<{ $filled: boolean }>`
  background: none;
  border: none;
  font-size: 24px;
  color: ${({ $filled }) => $filled ? '#FFD700' : '#ddd'};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: scale(1.1);
    color: #FFD700;
  }
`;

const FeedbackTextArea = styled.textarea`
  width: 100%;
  min-height: 80px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 8px;
  padding: 12px;
  font-size: 14px;
  resize: vertical;
  margin-bottom: 12px;
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.5);
  }
`;

const FeedbackButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const FeedbackSubmitButton = styled.button`
  flex: 1;
  background: rgba(255, 255, 255, 0.9);
  color: #333;
  border: none;
  padding: 8px 16px;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  
  &:hover {
    background: white;
  }
`;

const FeedbackCancelButton = styled.button`
  flex: 1;
  background: transparent;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 8px 16px;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

// Moderator Guidelines Modal Components
const ModeratorModal = styled.div`
  background: white;
  border-radius: 20px;
  padding: 24px;
  margin: 0 auto;
  max-width: 90vw;
  max-height: 80vh;
  width: 600px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  overflow-y: auto;
`;

const ModeratorHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid #eee;
  padding-bottom: 15px;
`;

const ModeratorTitle = styled.h2`
  font-size: 20px;
  color: #2fce98;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ModeratorContent = styled.div`
  font-size: 14px;
  line-height: 1.6;
  color: #333;
  
  h3 {
    color: #2fce98;
    font-size: 16px;
    margin: 20px 0 10px 0;
    font-weight: 600;
  }
  
  p {
    margin: 0 0 12px 0;
  }
  
  ul {
    margin: 0 0 16px 20px;
    padding: 0;
  }
  
  li {
    margin-bottom: 8px;
  }
  
  strong {
    color: #2fce98;
  }
`;

const ModeratorButton = styled.button`
  background: linear-gradient(135deg, #2fce98, #4A7C59);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(45, 95, 79, 0.3);
  }
`;

// Feedback Modal Components
const FeedbackModal = styled.div<{ $gradient?: string }>`
  background: white;
  border-radius: 20px;
  padding: 20px;
  margin: 0 auto;
  max-width: 380px;
  width: 90%;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${props => props.$gradient || 'linear-gradient(135deg, #2fce98, #4fc3a1)'};
    border-radius: 20px 20px 0 0;
  }
`;

const FeedbackModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
`;

const FeedbackModalTitle = styled.h2`
  font-size: 18px;
  color: #333;
  margin: 0;
  font-weight: 600;
`;

const AddFeedbackSection = styled.div`
  background: rgba(46, 206, 152, 0.05);
  border-radius: 10px;
  padding: 12px;
  margin-bottom: 16px;
  border: 1px solid rgba(46, 206, 152, 0.2);
`;

const AddFeedbackTitle = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
`;

const FeedbackInput = styled.textarea`
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 12px;
  resize: vertical;
  min-height: 45px;
  font-family: inherit;
  margin-bottom: 8px;
  
  &:focus {
    outline: none;
    border-color: #2fce98;
  }
`;

const FeedbackList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FeedbackItem = styled.div`
  background: white;
  border-radius: 12px;
  padding: 14px;
  border: 1px solid #e0e0e0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
`;

const FeedbackHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
`;

const UserAvatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #2fce98, #4fc3a1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 14px;
`;

const UserInfo = styled.div`
  flex: 1;
`;

const FeedbackUser = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #333;
`;

const FeedbackTime = styled.div`
  font-size: 11px;
  color: #999;
`;

const FeedbackRatingDisplay = styled.div`
  color: #FFD700;
  font-size: 14px;
`;

const FeedbackQuestion = styled.button`
  font-size: 12px;
  color: #2fce98;
  margin-bottom: 8px;
  padding: 4px 8px;
  background: rgba(46, 206, 152, 0.1);
  border: 1px solid rgba(46, 206, 152, 0.3);
  border-radius: 6px;
  display: inline-block;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(46, 206, 152, 0.2);
    transform: scale(1.02);
  }
`;

const FeedbackCommentText = styled.div`
  font-size: 14px;
  color: #333;
  line-height: 1.5;
  margin-bottom: 10px;
`;

const FeedbackActions = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  padding-top: 10px;
  border-top: 1px solid #f0f0f0;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  color: #666;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    background: #f0f0f0;
    color: #333;
  }

  &.active {
    color: #2fce98;
    background: rgba(46, 206, 152, 0.1);
  }
`;

const ReplySection = styled.div`
  margin-top: 12px;
`;

const Reply = styled.div`
  background: #f8f8f8;
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 8px;
  font-size: 14px;
  line-height: 1.5;
  border: 1px solid #e0e0e0;
`;

const ReplyUser = styled.span`
  font-weight: 600;
  color: #2fce98;
  margin-right: 8px;
`;

const ReplyInput = styled.textarea`
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 12px;
  margin-top: 8px;
  min-height: 40px;
  resize: vertical;
  font-family: inherit;
  
  &:focus {
    outline: none;
    border-color: #2fce98;
  }
`;

const ShareableCard = styled.div`
  position: fixed;
  top: -9999px;
  left: -9999px;
  width: 1080px;
  height: 1920px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const ShareCardContent = styled.div`
  background: white;
  border-radius: 40px;
  padding: 60px;
  max-width: 900px;
  width: 100%;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.3);
`;

const ShareCardHeader = styled.div`
  text-align: center;
  margin-bottom: 40px;
`;

const ShareCardLogo = styled.div`
  font-size: 80px;
  font-weight: bold;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 20px;
`;

const ShareCardTitle = styled.h2`
  font-size: 36px;
  color: #333;
  margin: 0 0 10px 0;
`;

const ShareCardSubtitle = styled.p`
  font-size: 24px;
  color: #666;
  margin: 0;
`;

const ShareCardQuestion = styled.div`
  background: #f8f8f8;
  border-radius: 20px;
  padding: 40px;
  margin: 40px 0;
  font-size: 28px;
  line-height: 1.6;
  color: #333;
  text-align: center;
  font-style: italic;
`;

const ShareCardFeedback = styled.div`
  font-size: 24px;
  line-height: 1.8;
  color: #555;
  margin: 40px 0;
  text-align: center;
`;

const ShareCardUser = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-top: 40px;
`;

const ShareCardAvatar = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  color: white;
`;

const ShareCardUserInfo = styled.div`
  text-align: left;
`;

const ShareCardUserName = styled.div`
  font-size: 28px;
  font-weight: 600;
  color: #333;
`;

const ShareCardRating = styled.div`
  font-size: 32px;
  color: #FFD700;
  margin-top: 5px;
`;

const ShareCardFooter = styled.div`
  text-align: center;
  margin-top: 60px;
  padding-top: 40px;
  border-top: 2px solid #f0f0f0;
`;

const ShareCardWebsite = styled.div`
  font-size: 32px;
  color: #667eea;
  font-weight: 600;
`;

const ShareCardTagline = styled.div`
  font-size: 20px;
  color: #999;
  margin-top: 10px;
`;

const SubmitButton = styled.button`
  background: #2fce98;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #27b584;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const EmptyFeedback = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #999;
  font-size: 14px;
`;

// Share Modal Components  
const ShareModalContainer = styled.div`
  background: white;
  border-radius: 16px;
  padding: 20px;
  margin: 0 auto;
  max-width: 280px;
  width: 90%;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
`;

const ShareTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 16px 0;
  text-align: center;
`;

const ShareOptions = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
`;

const ShareOption = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 10px;
  background: #f8f8f8;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #e8e8e8;
    transform: translateY(-2px);
  }
`;

const ShareIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  
  &.whatsapp { background: #25D366; color: white; }
  &.instagram { background: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888); color: white; }
  &.facebook { background: #1877F2; color: white; }
  &.twitter { background: #1DA1F2; color: white; }
  &.link { background: #2fce98; color: white; }
  &.more { background: #666; color: white; }
`;

const ShareLabel = styled.div`
  font-size: 11px;
  color: #666;
`;

// Question Popup Modal
const QuestionModal = styled.div`
  background: white;
  border-radius: 16px;
  padding: 20px;
  margin: 0 auto;
  max-width: 320px;
  width: 90%;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
`;

const QuestionModalTitle = styled.h3`
  font-size: 14px;
  font-weight: 600;
  color: #2fce98;
  margin: 0 0 12px 0;
`;

const QuestionModalText = styled.p`
  font-size: 14px;
  color: #333;
  line-height: 1.5;
  margin: 0;
`;

// ================================
// INTERFACES AND DATA
// ================================

interface Question {
  id: string;
  text: string;
  session: number;
}

interface Session {
  number: number;
  title: string;
  description: string;
}

interface Topic {
  id: string;
  title: string;
  gradient: string;
  description: string;
  sessions: Session[];
  questions: Question[];
}

interface Feedback {
  questionId: string;
  rating: number;
  comment: string;
}

// Question Data Structure
const topics: Topic[] = [
  {
    id: 'slowdown',
    title: 'Slow Down, You\'re Doing Fine',
    gradient: 'linear-gradient(135deg, #2ECE98, #4fc3a1, #6ed4b0)',
    description: 'In a world that glorifies hustle and speed, this invites us to question what it means to live meaningfully at our own pace. Explore the balance between ambition and acceptance, while rediscovering that slowing down is not about losing time, but about finding it.',
    sessions: [
      { number: 1, title: 'The Chase', description: 'Examining our relationship with ambition, goals, and the cost of constant striving' },
      { number: 2, title: 'The Pause', description: 'Finding balance between contentment and growth, learning when to rest and when to rise' }
    ],
    questions: [
      // Session 1: The Chase
      { id: 'slowdown_1', text: 'Dreams Revisited (Reflective): Were there dreams you once wanted to achieve but no longer now? What changed?', session: 1 },
      { id: 'slowdown_2', text: 'Borrowed Goals (Reflective): How do you differentiate between dreams that are truly yours, and those imposed by society or family?', session: 1 },
      { id: 'slowdown_3', text: 'The Hustle Illusion (Critical): Is hustling always the best way forward, or do we sometimes confuse busyness with progress?', session: 1 },
      { id: 'slowdown_4', text: 'Learning & Unlearning (Explorative): What beliefs about success did you have to unlearn in order to find peace with yourself?', session: 1 },
      { id: 'slowdown_5', text: 'The Space to Breathe (Practical): How do you create moments of pause amidst the noise of everyday life?', session: 1 },
      { id: 'slowdown_6', text: 'When to Step Back (Critical): Have you ever achieved something only to realize it wasn\'t what you needed? What did stepping back teach you?', session: 1 },
      { id: 'slowdown_7', text: 'Riding the Waves (Explorative): How do you balance between hustling towards your goals and allowing life to unfold naturally?', session: 1 },
      { id: 'slowdown_8', text: 'Timing & Trust (Reflective): In Islam (and many philosophies), we\'re told "everything happens when it is meant to happen." How do you reconcile this with hustle culture?', session: 1 },
      { id: 'slowdown_9', text: 'The Cost of the Chase (Critical): What have you sacrificed in the pursuit of your goals, and was it worth it?', session: 1 },
      { id: 'slowdown_10', text: 'Redefining the Race (Reflective): If you slowed down today, what would you discover about yourself that rushing has hidden?', session: 1 },
      
      // Session 2: The Pause
      { id: 'slowdown_11', text: 'Content vs Complacency: How do you balance being content with what you have and not becoming complacent?', session: 2 },
      { id: 'slowdown_12', text: 'Preserving Energy: How do you decide which pursuits are worth your energy, and which ones drain you unnecessarily?', session: 2 },
      { id: 'slowdown_13', text: 'The Beauty of Enough: When was the last time you felt like you truly had "enough," and how did it change your perspective?', session: 2 },
      { id: 'slowdown_14', text: 'The Weight of Comparison: How does comparing yourself to others affect your ability to slow down and be present?', session: 2 },
      { id: 'slowdown_15', text: 'Seasons of Growth: Do you believe there are seasons in life where hustling is necessary, and others where slowing down is wiser?', session: 2 },
      { id: 'slowdown_16', text: 'Evolving Dreams: How have your goals evolved as you\'ve grown older or gained new experiences?', session: 2 },
      { id: 'slowdown_17', text: 'Letting Go: What is one ambition or chase you had to let go of in order to truly move forward?', session: 2 },
      { id: 'slowdown_18', text: 'Inner Compass: When you slow down, what values or guiding principles rise to the surface for you?', session: 2 },
      { id: 'slowdown_19', text: 'Legacy vs Lifestyle: Are you more focused on leaving a legacy for others, or living a lifestyle that nourishes you today?', session: 2 },
      { id: 'slowdown_20', text: 'Becoming, Not Arriving: If life isn\'t about rushing to an endpoint, but about becoming along the way — what are you becoming right now?', session: 2 },
    ]
  },
  {
    id: 'love',
    title: 'Love in Translation',
    gradient: 'linear-gradient(135deg, #FF6B9D, #FF8E9B, #FFA8A8)',
    description: 'Explore the many dimensions of love, from self-love to romantic connections.',
    sessions: [
      { number: 1, title: 'The Foundations of Love', description: 'Understanding what love means to you' },
      { number: 2, title: 'Nurturing & Growing Love', description: 'How to maintain and deepen connections' }
    ],
    questions: [
      // Session 1: The Foundations of Love (10 questions)
      { id: 'love_1', text: 'How would you redefine love in your own words, beyond what society or media has taught you?', session: 1 },
      { id: 'love_2', text: 'What role has media (movies, books, social media) played in shaping your expectations of love?', session: 1 },
      { id: 'love_3', text: 'When you think about seeking romance, what fears or excitement come up for you?', session: 1 },
      { id: 'love_4', text: 'How do you distinguish between genuine love and infatuation in your own experiences?', session: 1 },
      { id: 'love_5', text: 'What has been your biggest misconception about love that you\'ve since realized?', session: 1 },
      { id: 'love_6', text: 'How do you think your family\'s relationship dynamics have influenced your view of love?', session: 1 },
      { id: 'love_7', text: 'What does "love yourself first" actually mean to you in practice?', session: 1 },
      { id: 'love_8', text: 'How do you handle the vulnerability that comes with opening your heart to someone?', session: 1 },
      { id: 'love_9', text: 'What\'s one thing about love that you wish someone had told you earlier?', session: 1 },
      { id: 'love_10', text: 'How do you balance having standards in love while staying open to unexpected connections?', session: 1 },
      
      // Session 2: Nurturing & Growing Love (10 questions)
      { id: 'love_11', text: 'How do you "translate" your love to someone who speaks a different love language?', session: 2 },
      { id: 'love_12', text: 'What role does communication play in keeping love alive in your relationships?', session: 2 },
      { id: 'love_13', text: 'How do you maintain your individual identity while being in a loving relationship?', session: 2 },
      { id: 'love_14', text: 'What\'s your approach to handling conflict in romantic relationships?', session: 2 },
      { id: 'love_15', text: 'How do you keep romance and spark alive in long-term relationships?', session: 2 },
      { id: 'love_16', text: 'What does it mean to "grow together" versus "growing apart" in a relationship?', session: 2 },
      { id: 'love_17', text: 'How do you navigate love when life gets stressful or challenging?', session: 2 },
      { id: 'love_18', text: 'What role does forgiveness play in sustaining love over time?', session: 2 },
      { id: 'love_19', text: 'How do you know when to fight for love versus when to let go?', session: 2 },
      { id: 'love_20', text: 'What\'s one piece of advice you\'d give to someone struggling to find or maintain love?', session: 2 },
    ]
  },
  {
    id: 'fomo',
    title: 'Fear of Missing Out (FOMO)',
    gradient: 'linear-gradient(135deg, #4A90E2, #7B68EE, #9370DB)',
    description: 'Understand and overcome the anxiety of missing out on experiences.',
    sessions: [
      { number: 1, title: 'Triggers & Impacts', description: 'Recognizing how FOMO affects your life' },
      { number: 2, title: 'Turning FOMO Into Intention', description: 'Transforming anxiety into purposeful choices' }
    ],
    questions: [
      // Session 1: Triggers & Impacts (10 questions)
      { id: 'fomo_1', text: 'Can you describe a time when you experienced FOMO? What triggered it?', session: 1 },
      { id: 'fomo_2', text: 'How does FOMO impact your decision-making in daily life?', session: 1 },
      { id: 'fomo_3', text: 'What role does social media play in triggering your FOMO?', session: 1 },
      { id: 'fomo_4', text: 'When you feel FOMO, what emotions come up for you?', session: 1 },
      { id: 'fomo_5', text: 'How do you think FOMO affects your ability to be present in the moment?', session: 1 },
      { id: 'fomo_6', text: 'What opportunities have you pursued primarily because of FOMO? How did that turn out?', session: 1 },
      { id: 'fomo_7', text: 'How does comparing yourself to others fuel your FOMO?', session: 1 },
      { id: 'fomo_8', text: 'What\'s the difference between healthy ambition and FOMO-driven choices?', session: 1 },
      { id: 'fomo_9', text: 'How does FOMO show up in your career or educational decisions?', session: 1 },
      { id: 'fomo_10', text: 'What would you say to someone who\'s stuck in a FOMO cycle?', session: 1 },
      
      // Session 2: Turning FOMO Into Intention (10 questions)
      { id: 'fomo_11', text: 'How do you stay in the loop without being overwhelmed by information?', session: 2 },
      { id: 'fomo_12', text: 'What\'s the difference between envy and admiration when you see others\' achievements?', session: 2 },
      { id: 'fomo_13', text: 'How do you balance staying connected with others and avoiding burnout?', session: 2 },
      { id: 'fomo_14', text: 'What practices help you focus on your own path rather than others\'?', session: 2 },
      { id: 'fomo_15', text: 'How do you distinguish between genuine opportunities and FOMO-driven distractions?', session: 2 },
      { id: 'fomo_16', text: 'What does "enough" look like in your life?', session: 2 },
      { id: 'fomo_17', text: 'How do you cultivate gratitude for what you have while still pursuing growth?', session: 2 },
      { id: 'fomo_18', text: 'What boundaries have you set to protect yourself from FOMO triggers?', session: 2 },
      { id: 'fomo_19', text: 'How do you celebrate others\' successes without feeling left behind?', session: 2 },
      { id: 'fomo_20', text: 'What would your life look like if you completely overcame FOMO?', session: 2 },
    ]
  },
  {
    id: 'regret',
    title: 'Regret & Second Chances: If Life had an Undo Button',
    gradient: 'linear-gradient(135deg, #8E44AD, #9B59B6, #BB77BB)',
    description: 'Navigate past regrets and embrace the possibility of redemption.',
    sessions: [
      { number: 1, title: 'Looking Back, Where Regret Lives', description: 'Confronting and understanding your regrets' },
      { number: 2, title: 'Looking Forward – Hope For A Second Chance', description: 'Finding healing and moving forward' }
    ],
    questions: [
      // Session 1: Looking Back, Where Regret Lives (10 questions)
      { id: 'regret_1', text: 'What does the mirror of regret show you about yourself?', session: 1 },
      { id: 'regret_2', text: 'What\'s a lingering feeling of regret that still visits you from time to time?', session: 1 },
      { id: 'regret_3', text: 'Can you share about a time when you were a bystander and now wish you had acted?', session: 1 },
      { id: 'regret_4', text: 'What\'s a relationship you regret not investing more time or effort into?', session: 1 },
      { id: 'regret_5', text: 'What\'s a version of yourself that you sometimes regret not becoming?', session: 1 },
      { id: 'regret_6', text: 'How do you deal with regret about opportunities you didn\'t take?', session: 1 },
      { id: 'regret_7', text: 'What\'s something you said that you wish you could take back?', session: 1 },
      { id: 'regret_8', text: 'How do you think regret has shaped who you are today?', session: 1 },
      { id: 'regret_9', text: 'What\'s the difference between healthy reflection and getting stuck in regret?', session: 1 },
      { id: 'regret_10', text: 'If you could send a message to your past self, what would you say?', session: 1 },
      
      // Session 2: Looking Forward – Hope For A Second Chance (10 questions)
      { id: 'regret_11', text: 'If you could try again at something, what would it be and how would you approach it differently?', session: 2 },
      { id: 'regret_12', text: 'How do you extend grace to yourself when dealing with past mistakes?', session: 2 },
      { id: 'regret_13', text: 'What words would you offer to someone who\'s wounded by their own regrets?', session: 2 },
      { id: 'regret_14', text: 'How do you balance learning from the past without being imprisoned by it?', session: 2 },
      { id: 'regret_15', text: 'What second chance are you giving yourself right now?', session: 2 },
      { id: 'regret_16', text: 'How do you forgive yourself for choices that hurt others?', session: 2 },
      { id: 'regret_17', text: 'What would you do today if you knew you couldn\'t fail or face regret?', session: 2 },
      { id: 'regret_18', text: 'How do you turn regret into wisdom for future decisions?', session: 2 },
      { id: 'regret_19', text: 'What does redemption look like in your life?', session: 2 },
      { id: 'regret_20', text: 'How do you help others heal from their regrets without fixing them?', session: 2 },
    ]
  },
  {
    id: 'wealth',
    title: 'Where is Your Wealth?',
    gradient: 'linear-gradient(135deg, #27AE60, #2ECC71, #58D68D)',
    description: 'We often equate wealth with the balance in our bank accounts, the properties we own, or the luxuries we can afford. But when stripped of numbers and possessions, what does being "wealthy" really mean?',
    sessions: [
      { number: 1, title: 'My Worldview of Wealth', description: 'Exploring what wealth truly means' },
      { number: 2, title: 'Discovering True Wealth', description: 'Finding richness in unexpected places' }
    ],
    questions: [
      // Session 1: My Worldview of Wealth (10 questions)
      { id: 'wealth_1', text: 'What\'s something in your life that makes you feel truly wealthy, yet isn\'t related to money at all? Why?', session: 1 },
      { id: 'wealth_2', text: 'If time was your only currency, how wealthy or poor would you feel today? How do you wish you could be spending more of it?', session: 1 },
      { id: 'wealth_3', text: 'Has your spiritual or religious practice ever made you feel "rich" in ways money never could?', session: 1 },
      { id: 'wealth_4', text: 'They say health is wealth. What\'s one thing you\'re doing (or not doing) to protect that treasure? Is it something you are personally accountable for?', session: 1 },
      { id: 'wealth_5', text: 'What\'s one giving moment that changed how you view wealth? Why do you think generosity is often linked to abundance?', session: 1 },
      { id: 'wealth_6', text: 'When you think of wealth, what do you seek most: safety, status, or something deeper?', session: 1 },
      { id: 'wealth_7', text: 'How do you personally define \'enough\'? Should we stop or keep going after \'enough\'? Has that changed over the years? (e.g. home, time, income)', session: 1 },
      { id: 'wealth_8', text: 'How important are the values behind your income? Does how you earn your wealth matter more than how much you earn?', session: 1 },
      { id: 'wealth_9', text: 'In a world driven by interest and debt, how do you navigate and define halal wealth? Do you even have a choice?', session: 1 },
      { id: 'wealth_10', text: 'If wealth followed us into the afterlife, what kind of account would you want to build today?', session: 1 }
    ]
  },
  {
    id: 'onion_aunty',
    title: 'Onion Aunty Society',
    gradient: 'linear-gradient(135deg, #FF9500, #FFAD33, #FFC266)',
    description: 'In the rich tapestry of Malaysian culture, we playfully coin the term "Makcik Bawang" to affectionately refer to aunties who, with a sprinkle of humor and a dash of spice, engage in the art of gossip.',
    sessions: [
      { number: 1, title: 'Past', description: 'Reflecting on gossip experiences from the past' },
      { number: 2, title: 'Future', description: 'Envisioning a gossip-free future' }
    ],
    questions: [
      // Session 1: Past (10 questions)
      { id: 'onion_1', text: 'Share gossip from the past that left a lasting impression on you. How did it shape your perspective on gossip?', session: 1 },
      { id: 'onion_2', text: 'Discuss a time when you were the topic of gossip. How did it make you feel?', session: 1 },
      { id: 'onion_3', text: 'Describe a time when you intentionally avoided gossip. Did it contribute to a healthier social environment?', session: 1 },
      { id: 'onion_4', text: 'Reflect on a gossip you regret participating in. How did it affect your relationships, and what did you learn from it?', session: 1 },
      { id: 'onion_5', text: 'Share an instance where gossip had a positive impact. How can constructive gossip contribute to community bonding?', session: 1 },
      { id: 'onion_6', text: 'Discuss gossip that taught you a valuable lesson. How did it shape your intentions in future interactions?', session: 1 },
      { id: 'onion_7', text: 'Explore how gossip can influence perception. Share an experience where gossip shaped your views of a person or situation.', session: 1 },
      { id: 'onion_8', text: 'Empathy is not commonly associated with gossip. Does empathy play a role in handling or reacting to gossip?', session: 1 },
      { id: 'onion_9', text: 'Share a story where the dynamics of gossip shifted positively. How can intentional communication change gossip culture?', session: 1 },
      { id: 'onion_10', text: 'Discuss the concept of responsible gossip. How can gossip be shared in a way that promotes understanding rather than harm?', session: 1 },
      
      // Session 2: Future (10 questions)
      { id: 'onion_11', text: 'Envision a future without harmful gossip. How can communication shape a gossip-free society?', session: 2 },
      { id: 'onion_12', text: 'Explore the role of gossip in community dynamics. How can gossip contribute to community building?', session: 2 },
      { id: 'onion_13', text: 'Share strategies for managing gossip in the future. How can interventions mitigate the impact of harmful gossip?', session: 2 },
      { id: 'onion_14', text: 'Discuss the challenges and opportunities of gossip in the digital age. How can we navigate online gossip?', session: 2 },
      { id: 'onion_15', text: 'Share ideas on how the way gossip is told can transform narratives. How can storytelling reshape gossip dynamics?', session: 2 },
      { id: 'onion_16', text: 'Explore the connection between gossip and mental health. What could support your mental well-being in the face of gossip?', session: 2 },
      { id: 'onion_17', text: 'Discuss how cultural perspectives influence gossip. How can intentional cross-cultural communication address differences in gossip norms?', session: 2 },
      { id: 'onion_18', text: 'Share experiences of gossip in the workplace. How can honest communication foster a positive work environment?', session: 2 },
      { id: 'onion_19', text: 'Explore educational approaches to address gossip. How can education help individuals navigate gossip responsibly?', session: 2 },
      { id: 'onion_20', text: 'Gossip has seeped into our culture due to the non confrontational nature, but what\'s said behind closed doors still holds toxic potential. How can we use our culture positively to build a gossip free society?', session: 2 }
    ]
  },
  {
    id: 'third_place',
    title: 'Third Place Theory',
    gradient: 'linear-gradient(135deg, #6C5CE7, #A29BFE, #FDCB6E)',
    description: 'In the rhythm of our daily lives, our existence oscillates between the familiar comfort of home and the structured hustle of work. Yet, nestled between these pillars lies the extraordinary and often overlooked "Third Place" — a sanctuary of relaxation, connection, and joy.',
    sessions: [
      { number: 1, title: 'Past', description: 'Reflecting on third places from your past' },
      { number: 2, title: 'Future', description: 'Envisioning future third places' }
    ],
    questions: [
      // Session 1: Past (10 questions)
      { id: 'third_1', text: 'Describe a memorable 3rd place from your past. How did it contribute to your well-being and sense of community?', session: 1 },
      { id: 'third_2', text: 'Share traditions or routines associated with your chosen 3rd place. How have these rituals shaped your view for relaxation?', session: 1 },
      { id: 'third_3', text: 'Discuss relationships formed in your 3rd place. How have these connections influenced your social interactions outside of work and home?', session: 1 },
      { id: 'third_4', text: 'Reflect on a choice made in your 3rd place that you regret. How did it impact your belief and values?', session: 1 },
      { id: 'third_5', text: 'Share an instance where your 3rd place positively impacted your personal or professional life. How did it shape your future version of yourself?', session: 1 },
      { id: 'third_6', text: 'Discuss a lesson learned in your 3rd place that influenced your future choices for relaxation. How did it guide your conscious improvements?', session: 1 },
      { id: 'third_7', text: 'Describe how your 3rd place has evolved over time. How have your intentional changes improved the experience in this space?', session: 1 },
      { id: 'third_8', text: 'Explore the connection between your 3rd place and creativity. How has this space influenced your creative notion?', session: 1 },
      { id: 'third_9', text: 'Share experiences of 3rd places in different cultures. How can diverse cultural perspectives shape our acceptance for relaxation spaces?', session: 1 },
      { id: 'third_10', text: 'Discuss how intentional actions can shape the culture of a 3rd place. How can individuals contribute to a positive atmosphere in these spaces?', session: 1 },
      
      // Session 2: Future (10 questions)
      { id: 'third_11', text: 'Envision your ideal 3rd place of the future. How will your design and features contribute to a welcoming atmosphere?', session: 2 },
      { id: 'third_12', text: 'Explore emerging trends in 3rd places. How can intentional adoption of these trends enhance our experiences in relaxing spaces?', session: 2 },
      { id: 'third_13', text: 'Discuss the role of technology in future 3rd places. How can tech integration enhance or hinder the relaxing atmosphere?', session: 2 },
      { id: 'third_14', text: 'Share ideas on creating sustainable 3rd places. How can collective efforts contribute to eco-friendly and community-conscious spaces?', session: 2 },
      { id: 'third_15', text: 'Discuss strategies for fostering community engagement in 3rd places. How can events and activities strengthen social bonds?', session: 2 },
      { id: 'third_16', text: 'Explore how to make 3rd places more inclusive. How can inclusive design ensure accessibility and diversity in these spaces?', session: 2 },
      { id: 'third_17', text: 'Discuss the connection between 3rd places and mental well-being. How can intentional designs support relaxation and stress relief?', session: 2 },
      { id: 'third_18', text: 'Some entrepreneurial spaces are often locked behind a price. How can networking aspects of your 3rd place capture the entrepreneurial spirit?', session: 2 },
      { id: 'third_19', text: 'Explore the potential of educational 3rd places. How can learning environments such as classes be integrated into spaces for relaxation?', session: 2 },
      { id: 'third_20', text: 'A multicultural environment influences our perspective of relaxing spaces. How can exposure of these different cultures incite new 3rd places?', session: 2 }
    ]
  },
  {
    id: 'embracing_ramadhan',
    title: 'Embracing Ramadhan',
    gradient: 'linear-gradient(135deg, #0984e3, #00b894, #00cec9)',
    description: 'As we approach the blessed month of fasting, worship, and reflection, our discussions will revolve around the essence of discipline and development. Ramadan is not just a period of abstaining from food and drink; it\'s a holistic experience encompassing spiritual growth, communal gathering, acts of kindness, and personal reflection.',
    sessions: [
      { number: 1, title: 'Looking inwards', description: 'Self-reflection and personal growth during Ramadan' },
      { number: 2, title: 'Looking Beyond', description: 'Community and global consciousness during Ramadan' }
    ],
    questions: [
      // Session 1: Looking inwards (10 questions)
      { id: 'ramadhan_1', text: 'How was the concept of fasting and Ramadan first introduced to you? How did you embrace it?', session: 1 },
      { id: 'ramadhan_2', text: 'If you embraced Ramadan since you were little, what did it mean to you as a kid?', session: 1 },
      { id: 'ramadhan_3', text: 'Tell us about a special moment from past Ramadans that still brings a smile to your face. What happened, and why was it so memorable?', session: 1 },
      { id: 'ramadhan_4', text: 'Ramadan is also about multiplying acts of worship while maintaining your daily responsibilities. How do you manage this balance for overall well-being?', session: 1 },
      { id: 'ramadhan_5', text: 'People usually aspire to cut off some habits or traits in Ramadan. What do you look forward to letting go this month?', session: 1 },
      { id: 'ramadhan_6', text: 'Share cultural traditions associated with Ramadan in your community. How do these traditions contribute to the overall experience of the month?', session: 1 },
      { id: 'ramadhan_7', text: 'Personal goals during Ramadan can be diverse. Can you share a goal you set for yourself during this month? What are other things you try to fast from besides food and drink?', session: 1 },
      { id: 'ramadhan_8', text: 'Has there been a moment where you realize that a mistake you often make was not shaytaan because they\'re all tied up? How did you reflect on that?', session: 1 },
      { id: 'ramadhan_9', text: 'Sahur and especially iftar seems to be the highlight of many. Has your consumption during Ramadan worsened or improved your health compared to other months?', session: 1 },
      { id: 'ramadhan_10', text: 'According to the Quran, Ramadan is the month we should aspire to increase taqwa. What does taqwa mean to you, and how has Ramadan shaped your relationship with faith over the years?', session: 1 },
      
      // Session 2: Looking Beyond (10 questions)
      { id: 'ramadhan_11', text: 'How would you explain fasting and Ramadan to a non-Muslim who is curious?', session: 2 },
      { id: 'ramadhan_12', text: 'Do you think you tend to be more "religious" just in Ramadan? Why?', session: 2 },
      { id: 'ramadhan_13', text: 'Imagine your ideal Ramadan community gathering. What would make it a welcoming and inclusive space for everyone?', session: 2 },
      { id: 'ramadhan_14', text: 'Explore how Ramadan is celebrated globally. How can cross-cultural understanding enrich the experience of this holy month?', session: 2 },
      { id: 'ramadhan_15', text: '90,000 metric tonnes of food was wasted nationwide last Ramadan (= 90 million kg!). How can we as an individual or collective prevent food wastage?', session: 2 },
      { id: 'ramadhan_16', text: 'Connecting with different generations is special. Any stories or ideas on how we can foster stronger bonds between generations during Ramadan?', session: 2 },
      { id: 'ramadhan_17', text: 'Mental well-being is important. Do Ramadan practices contribute to a positive mindset or otherwise, and how can we improve on this aspect?', session: 2 },
      { id: 'ramadhan_18', text: 'Ramadan should ideally be where you inculcate good habits that last for life so that we improve every year. How do you view Ramadan\'s role in your life?', session: 2 },
      { id: 'ramadhan_19', text: 'Share ideas on expanding acts of kindness beyond personal circles during Ramadan. How can we create a ripple effect of generosity?', session: 2 },
      { id: 'ramadhan_20', text: 'As we embrace the holy month, there are still many Muslims oppressed and facing threats globally (eg. Palestine, Sudan, Uyghurs, etc.). How does remaining conscious of these issues influence your experience with Ramadan?', session: 2 }
    ]
  },
  {
    id: 'money_mayday',
    title: 'Money Mayday',
    gradient: 'linear-gradient(135deg, #e17055, #fd79a8, #fdcb6e)',
    description: 'Today, we dive into the theme of \'Financial Literacy\' under the title \'Money Mayday\'. In a world that\'s constantly changing, understanding and managing our finances has never been more important.',
    sessions: [
      { number: 1, title: 'Financial Literacy', description: 'Understanding and managing our relationship with money' }
    ],
    questions: [
      // Single session: Financial Literacy (10 questions)
      { id: 'money_1', text: 'Do you think we have financial education in our society? If yes, do you believe it prepares us adequately for real-life money management?', session: 1 },
      { id: 'money_2', text: 'Why is discussing personal finances often considered taboo, and how can we normalize these conversations?', session: 1 },
      { id: 'money_3', text: 'How did your family\'s approach to money influence your financial habits and mindset? Do you think these influences were positive or negative?', session: 1 },
      { id: 'money_4', text: 'Can you share a financial challenge you faced and what did you learn from this experience that you would apply in the future?', session: 1 },
      { id: 'money_5', text: 'In a society where money is an obsession, how does culture and tradition influence our understanding of sustenance (Rizq or Rezeki)?', session: 1 },
      { id: 'money_6', text: 'Who or what are your references when making financial decisions, and why?', session: 1 },
      { id: 'money_7', text: 'Do you see budgeting as a tool for financial freedom or as a constraint on spending?', session: 1 },
      { id: 'money_8', text: 'How important is financial compatibility in relationships? How can couples develop a shared approach to financial management?', session: 1 },
      { id: 'money_9', text: 'How do you define financial freedom, and do you believe it is attainable for everyone? What steps are necessary to achieve it?', session: 1 },
      { id: 'money_10', text: 'Am I content with what I earn or am I being complacent? In terms of financial standing, where do you draw the line between complacency and contentment?', session: 1 }
    ]
  },
  {
    id: 'identity',
    title: 'Identity',
    gradient: 'linear-gradient(135deg, #6c5ce7, #a29bfe, #fd79a8)',
    description: 'Identity is a powerful and multifaceted concept that defines who we are, influences our actions, and shapes our interactions with the world. It encompasses our values, beliefs, experiences, and the roles we play in our families, communities, and workplaces.',
    sessions: [
      { number: 1, title: 'Past', description: 'How our identities have been shaped by past experiences' },
      { number: 2, title: 'Future', description: 'How we envision our identity growing in the future' }
    ],
    questions: [
      // Session 1: Past (10 questions)
      { id: 'identity_1', text: 'Think about how you introduced yourself just now. Why did you introduce yourself in that way? What does the term identity mean to you?', session: 1 },
      { id: 'identity_2', text: 'What are the core elements that make up your personal identity (e.g., culture, values, beliefs)', session: 1 },
      { id: 'identity_3', text: 'How has your family shaped your sense of self? Can you share a specific example?', session: 1 },
      { id: 'identity_4', text: 'What childhood experiences significantly impacted your identity development? How do they affect you now?', session: 1 },
      { id: 'identity_5', text: 'How has your cultural background influenced who you are today? Are there traditions or values you hold dear?', session: 1 },
      { id: 'identity_6', text: 'How does media, especially social media, and popular culture influence you? Are you impacted by the changing trends?', session: 1 },
      { id: 'identity_7', text: 'How do different aspects of yourself (e.g., race, gender, sexuality, religion, profession) intersect and influence each other?', session: 1 },
      { id: 'identity_8', text: 'In what ways has your identity been challenged or affirmed by your experiences?', session: 1 },
      { id: 'identity_9', text: 'How do you handle conflicts between different aspects of your identity?', session: 1 },
      { id: 'identity_10', text: 'How do you balance your individuality with your sense of belonging to larger groups (e.g., community, nationality)?', session: 1 },
      
      // Session 2: Future (10 questions)
      { id: 'identity_11', text: 'How do you see globalization and current world events impacting your future? How will you adapt to who you are now?', session: 2 },
      { id: 'identity_12', text: 'Do you think significant life milestones (e.g., career changes, relationships, education) will shape your identity?', session: 2 },
      { id: 'identity_13', text: 'How do you expect to handle changes in your character as you encounter new experiences and challenges?', session: 2 },
      { id: 'identity_14', text: 'Do you believe your core values will remain consistent, or do you see it evolving significantly over time? Why?', session: 2 },
      { id: 'identity_15', text: 'What roles do you envision playing in your community or society, and how will these roles shape you?', session: 2 },
      { id: 'identity_16', text: 'How can understanding and respecting diverse identities contribute to social harmony?', session: 2 },
      { id: 'identity_17', text: 'What legacy do you want to leave behind? How do you want to be remembered in terms of your identity?', session: 2 },
      { id: 'identity_18', text: 'What values do you hope to embody more strongly in the future? How will you work towards aligning your actions with these values?', session: 2 },
      { id: 'identity_19', text: 'How do you plan to continue learning and evolving your identity? Are there specific areas you want to focus on?', session: 2 },
      { id: 'identity_20', text: 'Do you think change is important for personal growth? How does one maintain their identity as they continue to grow as an individual?', session: 2 }
    ]
  }
];

// ================================
// MAIN COMPONENT
// ================================

export const BerseCardGameScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [selectedSession, setSelectedSession] = useState<number | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackData, setFeedbackData] = useState<Feedback[]>([]);
  const [showModeratorModal, setShowModeratorModal] = useState(false);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedTopicForFeedback, setSelectedTopicForFeedback] = useState<Topic | null>(null);
  const [forumFeedback, setForumFeedback] = useState<any[]>([]);
  const [newFeedbackText, setNewFeedbackText] = useState('');
  const [newFeedbackRating, setNewFeedbackRating] = useState(0);
  const [newFeedbackQuestionId, setNewFeedbackQuestionId] = useState('');
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareContent, setShareContent] = useState<any>(null);
  const [showForumQuestionModal, setShowForumQuestionModal] = useState(false);
  const [showQuestionShareModal, setShowQuestionShareModal] = useState(false);
  const [questionShareData, setQuestionShareData] = useState<{ title: string; text: string; url?: string } | null>(null);
  const [selectedQuestionText, setSelectedQuestionText] = useState('');
  const [expandedReplies, setExpandedReplies] = useState<string[]>([]);
  const [isLoadingForum, setIsLoadingForum] = useState(false);

  // Auto-refresh forum feedback every 5 seconds when modal is open
  useEffect(() => {
    if (showFeedbackModal && selectedTopicForFeedback) {
      const interval = setInterval(async () => {
        try {
          const feedbackData = await cardGameService.getAllTopicFeedback(selectedTopicForFeedback.id);
          setForumFeedback(feedbackData);
        } catch (error) {
          console.error('Error refreshing feedback:', error);
        }
      }, 5000); // Refresh every 5 seconds

      return () => clearInterval(interval);
    }
  }, [showFeedbackModal, selectedTopicForFeedback]);

  const handleTopicSelect = (topic: Topic) => {
    setSelectedTopic(topic);
    setShowSessionModal(true);
  };

  const handleSessionSelect = (sessionNumber: number) => {
    setSelectedSession(sessionNumber);
    setCurrentQuestionIndex(0);
    setShowSessionModal(false);
    setShowQuestionModal(true);
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setShowFeedback(false);
      setFeedbackRating(0);
      setFeedbackComment('');
    }
  };

  const handleNextQuestion = () => {
    const sessionQuestions = getSessionQuestions();
    if (currentQuestionIndex < sessionQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setShowFeedback(false);
      setFeedbackRating(0);
      setFeedbackComment('');
    }
  };

  const handleBackToSessions = () => {
    setShowQuestionModal(false);
    setShowSessionModal(true);
    setCurrentQuestionIndex(0);
    setSelectedSession(null);
  };

  const handleCloseModal = () => {
    setShowSessionModal(false);
    setShowQuestionModal(false);
    setSelectedTopic(null);
    setSelectedSession(null);
    setCurrentQuestionIndex(0);
    setShowFeedback(false);
    setFeedbackRating(0);
    setFeedbackComment('');
  };

  const handleSubmitFeedback = async () => {
    if (selectedTopic && selectedSession !== null) {
      const sessionQuestions = getSessionQuestions();
      const currentQuestion = sessionQuestions[currentQuestionIndex];
      
      try {
        setIsSubmittingFeedback(true);
        setFeedbackMessage('Submitting feedback...');
        
        // Save to database if user is logged in
        if (user) {
          await cardGameService.submitFeedback({
            topicId: selectedTopic.id,
            sessionNumber: selectedSession,
            questionId: currentQuestion.id,
            rating: feedbackRating,
            comment: feedbackComment || undefined
          });
        }
        
        // Also save locally for immediate display
        const newFeedback: Feedback = {
          questionId: currentQuestion.id,
          rating: feedbackRating,
          comment: feedbackComment
        };
        
        setFeedbackData([...feedbackData, newFeedback]);
        setFeedbackMessage('Thank you for your feedback! 🎉');
        
        // Wait a moment to show success message
        setTimeout(() => {
          setShowFeedback(false);
          setFeedbackRating(0);
          setFeedbackComment('');
          setFeedbackMessage('');
        }, 1500);
      } catch (error) {
        console.error('Error submitting feedback:', error);
        // Still save locally even if database save fails
        const newFeedback: Feedback = {
          questionId: currentQuestion.id,
          rating: feedbackRating,
          comment: feedbackComment
        };
        setFeedbackData([...feedbackData, newFeedback]);
        setFeedbackMessage('Feedback saved locally!');
        setTimeout(() => {
          setShowFeedback(false);
          setFeedbackRating(0);
          setFeedbackComment('');
          setFeedbackMessage('');
        }, 1500);
      } finally {
        setIsSubmittingFeedback(false);
      }
    }
  };

  const getSessionQuestions = () => {
    if (!selectedTopic || selectedSession === null) return [];
    return selectedTopic.questions.filter(q => q.session === selectedSession);
  };

  const sessionQuestions = getSessionQuestions();
  const currentQuestion = sessionQuestions[currentQuestionIndex];
  const isFirstQuestion = currentQuestionIndex === 0;
  const isLastQuestion = currentQuestionIndex === sessionQuestions.length - 1;

  return (
    <Container>
      <StatusBar />
      
      <Header>
        <BackButton onClick={() => navigate(-1)}>
          <BackIcon>←</BackIcon>
          <BackLabel>Back</BackLabel>
        </BackButton>
        <HeaderText>
          <HeaderTitle>BerseCardGame</HeaderTitle>
          <HeaderSubtitle>Interactive conversation starter</HeaderSubtitle>
        </HeaderText>
      </Header>

      <Content>
        <IntroSection>
          <IntroTitle>
            🃏 BerseMukha Card Game: A Friendship-Building Toolkit
          </IntroTitle>

          <ModeratorButton onClick={() => setShowModeratorModal(true)}>
            📋 Moderator Guidelines
          </ModeratorButton>
        </IntroSection>

        <TopicsSection>
          <TopicsTitle>Choose Your Topic</TopicsTitle>
          <TopicsGrid>
            {topics.map((topic) => (
              <TopicCard
                key={topic.id}
                $gradient={topic.gradient}
              >
                <TopicTitle onClick={() => handleTopicSelect(topic)}>
                  {topic.title}
                </TopicTitle>
                <FeedbackThreadButton
                  onClick={async (e) => {
                    e.stopPropagation();
                    setSelectedTopicForFeedback(topic);
                    setShowFeedbackModal(true);
                    // Reset states when opening modal
                    setNewFeedbackText('');
                    setNewFeedbackRating(0);
                    setNewFeedbackQuestionId('');
                    setReplyingToId(null);
                    setReplyText('');
                    // Load feedback from database
                    setIsLoadingForum(true);
                    try {
                      const feedbackData = await cardGameService.getAllTopicFeedback(topic.id);
                      setForumFeedback(feedbackData);
                    } catch (error) {
                      console.error('Error loading feedback:', error);
                    } finally {
                      setIsLoadingForum(false);
                    }
                  }}
                >
                  Feedback
                </FeedbackThreadButton>
              </TopicCard>
            ))}
          </TopicsGrid>
        </TopicsSection>
      </Content>

      <MainNav 
        activeTab="home"
        onTabPress={(tab) => {
          switch (tab) {
            case 'home': navigate('/dashboard'); break;
            case 'connect': navigate('/connect'); break;
            case 'match': navigate('/match'); break;
            case 'forum': navigate('/forum'); break;
          }
        }}
      />

      {/* Session Selection Modal */}
      <ModalOverlay $isOpen={showSessionModal} onClick={handleCloseModal}>
        {selectedTopic && (
          <SessionModal onClick={(e) => e.stopPropagation()}>
            <SessionHeader>
              <SessionTitle>{selectedTopic.title}</SessionTitle>
              <CloseButton onClick={handleCloseModal}>×</CloseButton>
            </SessionHeader>
            
            <SessionDescription>
              {selectedTopic.description}
            </SessionDescription>
            
            <SessionButtons>
              {selectedTopic.sessions.map((session) => (
                <SessionButton
                  key={session.number}
                  $gradient={selectedTopic.gradient}
                  onClick={() => handleSessionSelect(session.number)}
                >
                  <SessionButtonTitle>
                    Session {session.number}: {session.title}
                  </SessionButtonTitle>
                  <SessionButtonDescription>
                    {session.description}
                  </SessionButtonDescription>
                </SessionButton>
              ))}
            </SessionButtons>
          </SessionModal>
        )}
      </ModalOverlay>

      {/* Question Modal */}
      <ModalOverlay $isOpen={showQuestionModal} onClick={handleCloseModal}>
        {selectedTopic && currentQuestion && selectedSession !== null && (
          <QuestionCard 
            className="question-card-modal"
            $gradient={selectedTopic.gradient}
            onClick={(e) => e.stopPropagation()}
          >
            <QuestionHeader>
              <div>
                <SessionIndicator>
                  Session {selectedSession}: {selectedTopic.sessions.find(s => s.number === selectedSession)?.title}
                </SessionIndicator>
                <QuestionCounter>
                  Question {currentQuestionIndex + 1} of {sessionQuestions.length}
                </QuestionCounter>
              </div>
              <CloseButton onClick={handleCloseModal} style={{ color: 'white' }}>×</CloseButton>
            </QuestionHeader>
            
            <QuestionText>
              {currentQuestion.text}
            </QuestionText>
            
            <NavigationButtons>
              <NavButton 
                onClick={handlePreviousQuestion} 
                disabled={isFirstQuestion}
                $disabled={isFirstQuestion}
              >
                Previous
              </NavButton>
              <NavButton 
                onClick={handleNextQuestion} 
                disabled={isLastQuestion}
                $disabled={isLastQuestion}
              >
                Next
              </NavButton>
            </NavigationButtons>
            
            <ActionButtons>
              <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                <BackToSessionsButton onClick={handleBackToSessions} style={{ flex: 1 }}>
                  ← Sessions
                </BackToSessionsButton>
                <BackToSessionsButton onClick={() => {
                  // Set up share data for the modal
                  setQuestionShareData({
                    title: 'BerseCardGame Question',
                    text: `🎮 ${currentQuestion?.text}\n\n📍 ${selectedTopic?.title}\n📚 Session ${selectedSession}: ${selectedTopic?.sessions.find(s => s.number === selectedSession)?.title || ''}\n🔢 Question ${currentQuestionIndex + 1} of ${sessionQuestions.length}`,
                    url: 'https://berse.app/bersecardgame'
                  });
                  setShowQuestionShareModal(true);
                }} style={{ flex: 1 }}>
                  📤 Share
                </BackToSessionsButton>
              </div>
              <ShowFeedbackButton onClick={() => setShowFeedback(!showFeedback)}>
                {showFeedback ? 'Hide Feedback' : 'Add Feedback'}
              </ShowFeedbackButton>
            </ActionButtons>
            
            <FeedbackSection $isOpen={showFeedback}>
              <FeedbackForm>
                <StarRating>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      $filled={star <= feedbackRating}
                      onClick={() => setFeedbackRating(star)}
                    >
                      ★
                    </Star>
                  ))}
                </StarRating>
                
                <FeedbackTextArea
                  placeholder="Share your thoughts about this question... (150 words max)"
                  value={feedbackComment}
                  onChange={(e) => {
                    const words = e.target.value.trim().split(/\s+/).filter(word => word.length > 0);
                    if (words.length <= 150 || e.target.value.length < feedbackComment.length) {
                      setFeedbackComment(e.target.value);
                    }
                  }}
                  maxLength={800}
                />
                <div style={{ 
                  fontSize: '12px', 
                  color: '#666', 
                  textAlign: 'right', 
                  marginTop: '-8px',
                  marginBottom: '8px'
                }}>
                  {feedbackComment.trim().split(/\s+/).filter(word => word.length > 0).length}/150 words
                </div>
                
                {feedbackMessage && (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '8px', 
                    color: feedbackMessage.includes('Thank you') ? '#2ece98' : '#666',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}>
                    {feedbackMessage}
                  </div>
                )}
                
                <FeedbackButtons>
                  <FeedbackSubmitButton 
                    onClick={handleSubmitFeedback}
                    disabled={isSubmittingFeedback || feedbackRating === 0}
                    style={{ 
                      opacity: isSubmittingFeedback || feedbackRating === 0 ? 0.6 : 1,
                      cursor: isSubmittingFeedback || feedbackRating === 0 ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {isSubmittingFeedback ? 'Submitting...' : 'Submit Feedback'}
                  </FeedbackSubmitButton>
                  <FeedbackCancelButton 
                    onClick={() => {
                      setShowFeedback(false);
                      setFeedbackRating(0);
                      setFeedbackComment('');
                      setFeedbackMessage('');
                    }}
                    disabled={isSubmittingFeedback}
                    style={{ 
                      opacity: isSubmittingFeedback ? 0.6 : 1,
                      cursor: isSubmittingFeedback ? 'not-allowed' : 'pointer'
                    }}
                  >
                    Cancel
                  </FeedbackCancelButton>
                </FeedbackButtons>
              </FeedbackForm>
            </FeedbackSection>
          </QuestionCard>
        )}
      </ModalOverlay>

      {/* Moderator Guidelines Modal */}
      <ModalOverlay $isOpen={showModeratorModal} onClick={() => setShowModeratorModal(false)}>
        <ModeratorModal onClick={(e) => e.stopPropagation()}>
          <ModeratorHeader>
            <ModeratorTitle>📋 Moderator Guidelines</ModeratorTitle>
            <CloseButton onClick={() => setShowModeratorModal(false)}>×</CloseButton>
          </ModeratorHeader>
          
          <ModeratorContent>
            <h3>What is BerseMukha?</h3>
            <p>BerseMukha is a social gathering that creates a safe space for people to talk, connect, and reflect around meaningful topics—building community through discussion.</p>
            
            <h3>Moderator Guidelines</h3>
            <ul>
              <li><strong>a.</strong> Start by introducing yourself and what BerseMukha is about—connecting people, building community, and sharing ideas. Share your hopes for the session.</li>
              <li><strong>b.</strong> Invite participants to introduce themselves: name, where they're from, what they do, and where they currently live. Avoid sensitive questions.</li>
              <li><strong>d.</strong> Set the tone: remind participants it's a safe, discussion-based space. Sharing is encouraged but not required—listening matters too.</li>
              <li><strong>e.</strong> Be neutral and guide the flow. Ask questions, comment on answers, and simplify if needed to help understanding.</li>
              <li><strong>f.</strong> If the group is shy, take the lead—share your own thoughts first to ease them in.</li>
              <li><strong>g.</strong> Adjust to the group dynamic. Keep the flow comfortable and inclusive, whether it's a quiet or talkative crowd.</li>
              <li><strong>h.</strong> Close by summarizing key points, sharing encouragement, and reminding everyone of the goal: to build a better community. Encourage them to share the event and fill in the feedback form.</li>
              <li><strong>i.</strong> Take a group photo and connect on social media if comfortable.</li>
            </ul>
            
            <h3>Moderator Mindset</h3>
            <ul>
              <li>Be empathetic</li>
              <li>Come prepared</li>
              <li>Speak respectfully</li>
              <li>Use appropriate terms</li>
              <li>Ensure safety and comfort for all</li>
            </ul>
            
            <h3>Tips</h3>
            <ul>
              <li>Read through the questions in advance</li>
              <li>Do a bit of reading on the topic</li>
              <li>Questions usually explore definitions, personal practices, and family or cultural influences</li>
            </ul>
          </ModeratorContent>
        </ModeratorModal>
      </ModalOverlay>

      {/* Feedback Modal */}
      <ModalOverlay $isOpen={showFeedbackModal} onClick={() => setShowFeedbackModal(false)}>
        <FeedbackModal 
          onClick={(e) => e.stopPropagation()}
          $gradient={selectedTopicForFeedback?.gradient}
        >
          <FeedbackModalHeader>
            <FeedbackModalTitle>
              {selectedTopicForFeedback?.title} Forum
            </FeedbackModalTitle>
            <CloseButton onClick={() => setShowFeedbackModal(false)}>×</CloseButton>
          </FeedbackModalHeader>
          
          {/* Add New Feedback Section */}
          <AddFeedbackSection>
            <AddFeedbackTitle>Share Your Experience</AddFeedbackTitle>
            <StarRating>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  $filled={star <= newFeedbackRating}
                  onClick={() => setNewFeedbackRating(star)}
                >
                  ★
                </Star>
              ))}
            </StarRating>
            <FeedbackInput
              placeholder="What did you learn or experience from this topic?"
              value={newFeedbackText}
              onChange={(e) => setNewFeedbackText(e.target.value)}
            />
            <SubmitButton
              onClick={async () => {
                if (newFeedbackText && newFeedbackRating && selectedTopicForFeedback) {
                  try {
                    // Submit to database
                    const feedbackData = {
                      topicId: selectedTopicForFeedback.id,
                      sessionNumber: 1, // Default to session 1 for general feedback
                      questionId: 'general_feedback',
                      rating: newFeedbackRating,
                      comment: newFeedbackText
                    };
                    const newFeedback = await cardGameService.submitFeedback(feedbackData);
                    
                    // Reload all feedback to get the latest data
                    const allFeedback = await cardGameService.getAllTopicFeedback(selectedTopicForFeedback.id);
                    setForumFeedback(allFeedback);
                    
                    // Reset form
                    setNewFeedbackText('');
                    setNewFeedbackRating(0);
                  } catch (error) {
                    console.error('Error submitting feedback:', error);
                  }
                }
              }}
              disabled={!newFeedbackText || !newFeedbackRating}
            >
              Post Feedback
            </SubmitButton>
          </AddFeedbackSection>
          
          <FeedbackList>
            {isLoadingForum ? (
              <EmptyFeedback>Loading feedback...</EmptyFeedback>
            ) : forumFeedback.length === 0 ? (
              <EmptyFeedback>
                No feedback yet for this topic. Be the first to share your thoughts!
              </EmptyFeedback>
            ) : (
              forumFeedback
                .sort((a, b) => (b.upvoteCount || 0) - (a.upvoteCount || 0))
                .map(feedback => (
              <FeedbackItem key={feedback.id}>
                <FeedbackHeader>
                  <UserAvatar>{feedback.user?.fullName?.charAt(0) || 'A'}</UserAvatar>
                  <UserInfo>
                    <FeedbackUser>{feedback.user?.fullName || 'Anonymous'}</FeedbackUser>
                    <FeedbackTime>{new Date(feedback.createdAt).toLocaleString()}</FeedbackTime>
                  </UserInfo>
                  <FeedbackRatingDisplay>
                    {'⭐'.repeat(feedback.rating)}
                  </FeedbackRatingDisplay>
                </FeedbackHeader>
                
                <FeedbackQuestion onClick={() => {
                  const questionText = selectedTopicForFeedback?.questions.find(q => 
                    q.id === feedback.questionId
                  )?.text || feedback.questionId;
                  setSelectedQuestionText(questionText);
                  setShowForumQuestionModal(true);
                }}>
                  {selectedTopicForFeedback?.questions.find(q => q.id === feedback.questionId)?.text.substring(0, 50) || feedback.questionId}...
                </FeedbackQuestion>
                <FeedbackCommentText>{feedback.comment || 'No comment provided'}</FeedbackCommentText>
                
                <FeedbackActions>
                  <ActionButton 
                    className={feedback.hasUpvoted ? 'active' : ''}
                    onClick={async () => {
                      try {
                        const result = await cardGameService.toggleUpvote(feedback.id);
                        // Update local state
                        const updated = forumFeedback.map(f => 
                          f.id === feedback.id 
                            ? { ...f, hasUpvoted: result.hasUpvoted, upvoteCount: f.upvoteCount + (result.hasUpvoted ? 1 : -1) }
                            : f
                        );
                        setForumFeedback(updated);
                      } catch (error) {
                        console.error('Error toggling upvote:', error);
                      }
                    }}
                  >
                    ⬆️ Push Up ({feedback.upvoteCount || 0})
                  </ActionButton>
                  <ActionButton onClick={() => {
                    if (expandedReplies.includes(feedback.id)) {
                      setExpandedReplies(expandedReplies.filter(id => id !== feedback.id));
                    } else {
                      setExpandedReplies([...expandedReplies, feedback.id]);
                    }
                  }}>
                    💬 {feedback.replies?.length || 0} {feedback.replies?.length === 1 ? 'Reply' : 'Replies'}
                  </ActionButton>
                  <ActionButton onClick={async () => {
                    // Create shareable card element
                    const shareCard = document.createElement('div');
                    shareCard.id = 'share-feedback-card';
                    shareCard.style.cssText = 'position: fixed; top: 0; left: -9999px; width: 1080px; height: 1920px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 80px; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;';
                    
                    shareCard.innerHTML = `
                      <div style="background: white; border-radius: 40px; padding: 80px; max-width: 900px; width: 100%; box-shadow: 0 30px 60px rgba(0, 0, 0, 0.3);">
                        <div style="text-align: center; margin-bottom: 60px;">
                          <div style="font-size: 100px; margin-bottom: 20px;">🎮</div>
                          <h1 style="font-size: 48px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin: 0;">BerseCardGame</h1>
                          <p style="font-size: 28px; color: #666; margin: 20px 0 0 0;">${selectedTopicForFeedback?.title || 'Community Feedback'}</p>
                        </div>
                        
                        <div style="background: #f8f8f8; border-radius: 30px; padding: 50px; margin: 40px 0; text-align: center;">
                          <p style="font-size: 32px; line-height: 1.8; color: #333; margin: 0; font-style: italic;">\"${feedback.comment}\"</p>
                        </div>
                        
                        <div style="display: flex; align-items: center; justify-content: center; gap: 30px; margin-top: 50px;">
                          <div style="width: 100px; height: 100px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; font-size: 48px; color: white;">👤</div>
                          <div>
                            <div style="font-size: 36px; font-weight: 600; color: #333;">${feedback.user?.fullName || 'Anonymous'}</div>
                            <div style="font-size: 36px; color: #FFD700; margin-top: 10px;">${'⭐'.repeat(feedback.rating || 5)}</div>
                          </div>
                        </div>
                        
                        <div style="text-align: center; margin-top: 80px; padding-top: 50px; border-top: 3px solid #f0f0f0;">
                          <div style="font-size: 40px; color: #667eea; font-weight: bold;">berse.app</div>
                          <div style="font-size: 24px; color: #999; margin-top: 15px;">Connect • Grow • Thrive</div>
                        </div>
                      </div>
                    `;
                    
                    document.body.appendChild(shareCard);
                    
                    try {
                      const canvas = await html2canvas(shareCard, {
                        width: 1080,
                        height: 1920,
                        scale: 1,
                        useCORS: true,
                        backgroundColor: null
                      });
                      
                      canvas.toBlob(async (blob) => {
                        if (blob) {
                          const file = new File([blob], 'berse-feedback.png', { type: 'image/png' });
                          
                          if (navigator.share) {
                            try {
                              await navigator.share({
                                files: [file],
                                title: 'BerseCardGame Feedback',
                                text: `Check out this feedback from ${feedback.user?.fullName || 'a community member'}!`
                              });
                            } catch (err) {
                              console.log('Share cancelled or failed', err);
                            }
                          } else {
                            // Fallback: Create download link
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = 'berse-feedback.png';
                            a.click();
                            URL.revokeObjectURL(url);
                            alert('Image downloaded! You can now share it on Instagram Stories or WhatsApp.');
                          }
                        }
                      });
                    } catch (error) {
                      console.error('Error creating share image:', error);
                      // Fallback to text share
                      const text = `${feedback.user?.fullName}'s feedback on ${selectedTopicForFeedback?.title}: "${feedback.comment}" - Check it out at berse.app!`;
                      if (navigator.share) {
                        navigator.share({ text });
                      } else {
                        navigator.clipboard.writeText(text);
                        alert('Feedback copied to clipboard!');
                      }
                    } finally {
                      document.body.removeChild(shareCard);
                    }
                  }}>
                    📤 Share
                  </ActionButton>
                  {checkAdminAccess(user) && (
                    <ActionButton 
                      style={{ color: '#e74c3c' }}
                      onClick={async () => {
                        if (window.confirm('Are you sure you want to delete this feedback?')) {
                          try {
                            await cardGameService.deleteFeedback(feedback.id);
                            // Remove from local state
                            const updated = forumFeedback.filter(f => f.id !== feedback.id);
                            setForumFeedback(updated);
                          } catch (error) {
                            console.error('Error deleting feedback:', error);
                          }
                        }
                      }}
                    >
                      🗑️ Delete
                    </ActionButton>
                  )}
                </FeedbackActions>
                
                {/* Replies - Only show if expanded */}
                {expandedReplies.includes(feedback.id) && feedback.replies && feedback.replies.length > 0 && (
                  <ReplySection>
                    {feedback.replies.map((reply: any) => (
                      <Reply key={reply.id}>
                        <ReplyUser>{reply.user?.fullName || 'Anonymous'}:</ReplyUser>
                        {reply.text}
                      </Reply>
                    ))}
                  </ReplySection>
                )}
                
                {/* Reply Input - Show when replies are expanded */}
                {expandedReplies.includes(feedback.id) && (
                  <ReplySection>
                    <ReplyInput
                      placeholder="Write a reply... (75 words max)"
                      value={replyText}
                      onChange={(e) => {
                        const words = e.target.value.trim().split(/\s+/).filter(word => word.length > 0);
                        if (words.length <= 75 || e.target.value.length < replyText.length) {
                          setReplyText(e.target.value);
                        }
                      }}
                      maxLength={400}
                      onKeyPress={async (e) => {
                        if (e.key === 'Enter' && !e.shiftKey && replyText) {
                          e.preventDefault();
                          try {
                            const newReply = await cardGameService.addReply(feedback.id, replyText);
                            // Update local state
                            const updated = forumFeedback.map(f => 
                              f.id === feedback.id 
                                ? { ...f, replies: [...(f.replies || []), newReply] }
                                : f
                            );
                            setForumFeedback(updated);
                            setReplyText('');
                            setReplyingToId(null);
                          } catch (error) {
                            console.error('Error adding reply:', error);
                          }
                        }
                      }}
                    />
                    <div style={{ 
                      fontSize: '11px', 
                      color: '#666', 
                      textAlign: 'right', 
                      marginTop: '4px' 
                    }}>
                      {replyText.trim().split(/\s+/).filter(word => word.length > 0).length}/75 words
                    </div>
                  </ReplySection>
                )}
              </FeedbackItem>
            ))
            )}
          </FeedbackList>
        </FeedbackModal>
      </ModalOverlay>

      {/* Share Modal */}
      <ModalOverlay $isOpen={showShareModal} onClick={() => setShowShareModal(false)}>
        <ShareModalContainer onClick={(e) => e.stopPropagation()}>
          <ShareTitle>Share Feedback</ShareTitle>
          <ShareOptions>
            <ShareOption onClick={() => {
              const text = `${shareContent?.user}'s feedback on ${shareContent?.title}: "${shareContent?.text}"`;
              window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
              setShowShareModal(false);
            }}>
              <ShareIcon className="whatsapp">📱</ShareIcon>
              <ShareLabel>WhatsApp</ShareLabel>
            </ShareOption>
            <ShareOption onClick={() => {
              const text = `Check out this amazing feedback on ${shareContent?.title}! 🌟`;
              window.open(`https://www.instagram.com/`, '_blank');
              setShowShareModal(false);
            }}>
              <ShareIcon className="instagram">📷</ShareIcon>
              <ShareLabel>Instagram</ShareLabel>
            </ShareOption>
            <ShareOption onClick={() => {
              const text = `${shareContent?.user}'s feedback on ${shareContent?.title}: "${shareContent?.text}"`;
              window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(text)}`, '_blank');
              setShowShareModal(false);
            }}>
              <ShareIcon className="facebook">f</ShareIcon>
              <ShareLabel>Facebook</ShareLabel>
            </ShareOption>
            <ShareOption onClick={() => {
              const text = `${shareContent?.user}'s feedback on ${shareContent?.title}: "${shareContent?.text}"`;
              window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
              setShowShareModal(false);
            }}>
              <ShareIcon className="twitter">🐦</ShareIcon>
              <ShareLabel>Twitter</ShareLabel>
            </ShareOption>
            <ShareOption onClick={() => {
              const text = `${shareContent?.user}'s feedback on ${shareContent?.title}: "${shareContent?.text}"`;
              navigator.clipboard.writeText(text);
              alert('Copied to clipboard!');
              setShowShareModal(false);
            }}>
              <ShareIcon className="link">🔗</ShareIcon>
              <ShareLabel>Copy Link</ShareLabel>
            </ShareOption>
            <ShareOption onClick={() => {
              const text = `${shareContent?.user}'s feedback on ${shareContent?.title}: "${shareContent?.text}"`;
              if (navigator.share) {
                navigator.share({
                  title: 'BerseCardGame Feedback',
                  text: text,
                  url: window.location.href
                });
              }
              setShowShareModal(false);
            }}>
              <ShareIcon className="more">•••</ShareIcon>
              <ShareLabel>More</ShareLabel>
            </ShareOption>
          </ShareOptions>
        </ShareModalContainer>
      </ModalOverlay>

      {/* Question Modal */}
      <ModalOverlay $isOpen={showForumQuestionModal} onClick={() => setShowForumQuestionModal(false)}>
        <QuestionModal onClick={(e) => e.stopPropagation()}>
          <FeedbackModalHeader>
            <QuestionModalTitle>Question Details</QuestionModalTitle>
            <CloseButton onClick={() => setShowForumQuestionModal(false)}>×</CloseButton>
          </FeedbackModalHeader>
          <QuestionModalText>{selectedQuestionText}</QuestionModalText>
        </QuestionModal>
      </ModalOverlay>

      {/* Share Modal for Questions */}
      <ShareModal 
        isOpen={showQuestionShareModal}
        onClose={() => setShowQuestionShareModal(false)}
        shareData={questionShareData}
      />
    </Container>
  );
};