import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { StatusBar } from '../components/StatusBar';
import { MainNav } from '../components/MainNav';
import { ProfileSidebar } from '../components/ProfileSidebar/ProfileSidebar';

export const NotificationsScreen: React.FC = () => {
  const navigate = useNavigate();
  const [showProfileSidebar, setShowProfileSidebar] = useState(false);

  return (
    <Container>
      <StatusBar onProfileClick={() => setShowProfileSidebar(true)} />
      
      <Header>
        <BackButton onClick={() => navigate('/dashboard')}>←</BackButton>
        <HeaderTitle>🔔 Notifications</HeaderTitle>
      </Header>

      <Content>
        <NotificationsList>
          <NotificationItem $unread>
            <NotificationIcon>🎉</NotificationIcon>
            <NotificationContent>
              <NotificationTitle>Welcome to BerseMuka!</NotificationTitle>
              <NotificationText>Start connecting with amazing people in your community. Explore events, earn points, and unlock rewards!</NotificationText>
              <NotificationTime>2 hours ago</NotificationTime>
            </NotificationContent>
          </NotificationItem>
          
          <NotificationItem $unread>
            <NotificationIcon>🏆</NotificationIcon>
            <NotificationContent>
              <NotificationTitle>You earned 50 points!</NotificationTitle>
              <NotificationText>Completed your first connection with Ahmad Hassan</NotificationText>
              <NotificationTime>5 hours ago</NotificationTime>
            </NotificationContent>
          </NotificationItem>

          <NotificationItem>
            <NotificationIcon>📅</NotificationIcon>
            <NotificationContent>
              <NotificationTitle>Event Reminder</NotificationTitle>
              <NotificationText>Heritage Photography Walk starts tomorrow at 2 PM</NotificationText>
              <NotificationTime>1 day ago</NotificationTime>
            </NotificationContent>
          </NotificationItem>

          <NotificationItem>
            <NotificationIcon>☕</NotificationIcon>
            <NotificationContent>
              <NotificationTitle>Featured Reward: Mukha Cafe</NotificationTitle>
              <NotificationText>Get 30% off on all beverages and pastries for only 30 points!</NotificationText>
              <NotificationTime>2 days ago</NotificationTime>
            </NotificationContent>
          </NotificationItem>

          <NotificationItem>
            <NotificationIcon>💬</NotificationIcon>
            <NotificationContent>
              <NotificationTitle>New Message</NotificationTitle>
              <NotificationText>Sarah Chen sent you a message about photography tips</NotificationText>
              <NotificationTime>3 days ago</NotificationTime>
            </NotificationContent>
          </NotificationItem>
        </NotificationsList>
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

      <ProfileSidebar 
        isOpen={showProfileSidebar}
        onClose={() => setShowProfileSidebar(false)}
      />
    </Container>
  );
};

// Styled components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #F9F3E3;
  max-width: 393px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  padding: 16px 20px;
  background-color: #F5F3EF;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  color: #2fce98;
  cursor: pointer;
  margin-right: 12px;
  
  &:hover {
    transform: scale(1.1);
  }
`;

const HeaderTitle = styled.h1`
  font-size: 20px;
  font-weight: bold;
  color: #2fce98;
  margin: 0;
`;

const Content = styled.div`
  flex: 1;
  padding: 20px;
  padding-bottom: 100px; /* Added extra space for floating nav */
`;

const NotificationsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const NotificationItem = styled.div<{ $unread?: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: ${({ $unread }) => $unread ? '#FFF9E6' : 'white'};
  border-radius: 12px;
  border-left: 4px solid ${({ $unread }) => $unread ? '#FF9800' : 'transparent'};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const NotificationIcon = styled.div`
  font-size: 24px;
  margin-top: 4px;
  min-width: 28px;
  text-align: center;
`;

const NotificationContent = styled.div`
  flex: 1;
`;

const NotificationTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 4px 0;
`;

const NotificationText = styled.p`
  font-size: 14px;
  color: #666;
  margin: 0 0 8px 0;
  line-height: 1.4;
`;

const NotificationTime = styled.span`
  font-size: 12px;
  color: #999;
  font-weight: 500;
`;