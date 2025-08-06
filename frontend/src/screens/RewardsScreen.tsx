import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { StatusBar } from '../components/StatusBar';
import { MainNav } from '../components/MainNav';

export const RewardsScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container>
      <StatusBar />
      <Header>
        <BackButton onClick={() => navigate('/dashboard')}>←</BackButton>
        <HeaderTitle>🎁 Featured Rewards</HeaderTitle>
      </Header>
      <Content>
        <ComingSoon>
          <ComingSoonIcon>🚧</ComingSoonIcon>
          <ComingSoonTitle>Coming Soon!</ComingSoonTitle>
          <ComingSoonText>Featured Rewards section is under development</ComingSoonText>
        </ComingSoon>
      </Content>
      <MainNav activeTab="home" onTabPress={(tab) => {
        switch (tab) {
          case 'home': navigate('/dashboard'); break;
          case 'connect': navigate('/connect'); break;
          case 'match': navigate('/match'); break;
          case 'forum': navigate('/forum'); break;
        }
      }} />
    </Container>
  );
};

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
  position: relative;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  color: #2D5F4F;
  cursor: pointer;
  position: absolute;
  left: 20px;
  top: 16px;
`;

const HeaderTitle = styled.h1`
  font-size: 24px;
  font-weight: bold;
  color: #2D5F4F;
  margin: 0;
  text-align: center;
`;

const Content = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px 20px 100px 20px;
`;

const ComingSoon = styled.div`
  text-align: center;
`;

const ComingSoonIcon = styled.div`
  font-size: 64px;
  margin-bottom: 16px;
`;

const ComingSoonTitle = styled.h2`
  font-size: 24px;
  color: #2D5F4F;
  margin: 0 0 8px 0;
`;

const ComingSoonText = styled.p`
  color: #666;
  font-size: 16px;
`;