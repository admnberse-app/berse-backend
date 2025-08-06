import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { StatusBar } from '../components/StatusBar';
import { MainNav } from '../components/MainNav';
import { ProfileSidebar } from '../components/ProfileSidebar/ProfileSidebar';

export const MessagesScreen: React.FC = () => {
  const navigate = useNavigate();
  const [showProfileSidebar, setShowProfileSidebar] = useState(false);

  return (
    <Container>
      <StatusBar onProfileClick={() => setShowProfileSidebar(true)} />
      
      <Header>
        <BackButton onClick={() => setShowProfileSidebar(true)}>←</BackButton>
        <HeaderTitle>💬 Private Messages</HeaderTitle>
      </Header>

      <Content>
        <MessagesList>
          <MessageItem>
            <MessageAvatar>AH</MessageAvatar>
            <MessageInfo>
              <MessageName>Ahmad Hassan</MessageName>
              <MessagePreview>Hey! Are you joining the heritage tour?</MessagePreview>
              <MessageTime>2 hours ago</MessageTime>
            </MessageInfo>
            <UnreadBadge>2</UnreadBadge>
          </MessageItem>
          
          <MessageItem>
            <MessageAvatar>SC</MessageAvatar>
            <MessageInfo>
              <MessageName>Sarah Chen</MessageName>
              <MessagePreview>Thanks for the photography tips!</MessagePreview>
              <MessageTime>5 hours ago</MessageTime>
            </MessageInfo>
          </MessageItem>

          <MessageItem>
            <MessageAvatar>RK</MessageAvatar>
            <MessageInfo>
              <MessageName>Raj Kumar</MessageName>
              <MessagePreview>Let's connect at the community meetup</MessagePreview>
              <MessageTime>1 day ago</MessageTime>
            </MessageInfo>
          </MessageItem>
        </MessagesList>
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

// Styled components for MessagesScreen
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
  color: #2D5F4F;
  cursor: pointer;
  margin-right: 12px;
  
  &:hover {
    transform: scale(1.1);
  }
`;

const HeaderTitle = styled.h1`
  font-size: 20px;
  font-weight: bold;
  color: #2D5F4F;
  margin: 0;
`;

const Content = styled.div`
  flex: 1;
  padding: 20px;
  padding-bottom: 100px; /* Added extra space for floating nav */
`;

const MessagesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const MessageItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #F8F9FA;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const MessageAvatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #2D5F4F;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 16px;
  box-shadow: 0 2px 6px rgba(45, 95, 79, 0.3);
`;

const MessageInfo = styled.div`
  flex: 1;
`;

const MessageName = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 4px 0;
`;

const MessagePreview = styled.p`
  font-size: 14px;
  color: #666;
  margin: 0 0 4px 0;
  line-height: 1.4;
`;

const MessageTime = styled.span`
  font-size: 12px;
  color: #999;
`;

const UnreadBadge = styled.span`
  background: #E74C3C;
  color: white;
  padding: 4px 8px;
  border-radius: 50%;
  font-size: 12px;
  font-weight: bold;
  min-width: 20px;
  text-align: center;
`;