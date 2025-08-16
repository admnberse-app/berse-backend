import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { StatusBar } from '../components/StatusBar/StatusBar';
import { CompactHeader } from '../components/CompactHeader/CompactHeader';
import { MainNav } from '../components/MainNav/index';
import { ProfileSidebar } from '../components/ProfileSidebar/ProfileSidebar';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: linear-gradient(135deg, #F9F3E3 0%, #E8DCC4 100%);
  max-width: 393px;
  margin: 0 auto;
`;

const Content = styled.div`
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding-bottom: 100px;
`;

const ComingSoonCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 40px 30px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  max-width: 350px;
  width: 100%;
`;

const IconContainer = styled.div`
  font-size: 72px;
  margin-bottom: 24px;
  animation: bounce 2s infinite;
  
  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
`;

const ComingSoonBadge = styled.div`
  display: inline-block;
  background: linear-gradient(135deg, #FFD700, #FFA500);
  color: white;
  padding: 8px 24px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 32px;
  box-shadow: 0 4px 12px rgba(255, 165, 0, 0.3);
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: #2fce98;
  margin-bottom: 16px;
`;

const Description = styled.p`
  font-size: 16px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 32px;
`;

const FeatureList = styled.div`
  text-align: left;
  margin: 32px 0;
`;

const FeatureItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
`;

const FeatureIcon = styled.span`
  font-size: 20px;
  flex-shrink: 0;
`;

const FeatureText = styled.div`
  flex: 1;
`;

const FeatureTitle = styled.h4`
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
`;

const FeatureDesc = styled.p`
  font-size: 12px;
  color: #666;
  line-height: 1.4;
  margin: 0;
`;

const NotifyButton = styled.button`
  background: linear-gradient(135deg, #2fce98, #4A8B7C);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 14px 32px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(45, 95, 79, 0.3);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(45, 95, 79, 0.4);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

export const BerseMarketScreen: React.FC = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleNotify = () => {
    alert('You will be notified when BerseMarket launches!');
  };

  return (
    <Container>
      <StatusBar />
      <CompactHeader onMenuClick={() => setIsSidebarOpen(true)} />
      
      <Content>
        <ComingSoonCard>
          <IconContainer>🛍️</IconContainer>
          
          <ComingSoonBadge>Coming Soon</ComingSoonBadge>
          
          <Title>BerseMarket</Title>
          
          <Description>
            Fund your travel dreams by selling, buying and trading
          </Description>
          
          <FeatureList>
            <FeatureItem>
              <FeatureIcon>💰</FeatureIcon>
              <FeatureText>
                <FeatureTitle>Sell Your Items</FeatureTitle>
                <FeatureDesc>Turn unused items into travel funds quickly and easily</FeatureDesc>
              </FeatureText>
            </FeatureItem>
            
            <FeatureItem>
              <FeatureIcon>🛒</FeatureIcon>
              <FeatureText>
                <FeatureTitle>Buy from Students</FeatureTitle>
                <FeatureDesc>Find great deals on textbooks, electronics, and more</FeatureDesc>
              </FeatureText>
            </FeatureItem>
            
            <FeatureItem>
              <FeatureIcon>🔄</FeatureIcon>
              <FeatureText>
                <FeatureTitle>Trade Services</FeatureTitle>
                <FeatureDesc>Exchange skills and services with fellow students</FeatureDesc>
              </FeatureText>
            </FeatureItem>
            
            <FeatureItem>
              <FeatureIcon>🎯</FeatureIcon>
              <FeatureText>
                <FeatureTitle>Travel Goal Tracking</FeatureTitle>
                <FeatureDesc>Track earnings towards your next adventure</FeatureDesc>
              </FeatureText>
            </FeatureItem>
          </FeatureList>
          
          <NotifyButton onClick={handleNotify}>
            Notify Me When Available
          </NotifyButton>
        </ComingSoonCard>
      </Content>

      <MainNav 
        activeTab="market"
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
            case 'market':
              navigate('/market');
              break;
          }
        }}
      />

      <ProfileSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
    </Container>
  );
};