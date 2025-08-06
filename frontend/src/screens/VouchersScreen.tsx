import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { StatusBar } from '../components/StatusBar';
import { MainNav } from '../components/MainNav';
import { ProfileSidebar } from '../components/ProfileSidebar/ProfileSidebar';

export const VouchersScreen: React.FC = () => {
  const navigate = useNavigate();
  const [showProfileSidebar, setShowProfileSidebar] = useState(false);

  return (
    <Container>
      <StatusBar onProfileClick={() => setShowProfileSidebar(true)} />
      
      <Header>
        <BackButton onClick={() => setShowProfileSidebar(true)}>←</BackButton>
        <HeaderContent>
          <HeaderTitle>🎫 My Vouchers</HeaderTitle>
          <PointsBalance>Available: 248 pts</PointsBalance>
        </HeaderContent>
      </Header>

      <Content>
        <VoucherGrid>
          <VoucherCard $bgColor="#4A90E2">
            <VoucherIcon>📚</VoucherIcon>
            <VoucherTitle>BRIGHT English Centre</VoucherTitle>
            <VoucherDiscount>20% off English courses</VoucherDiscount>
            <VoucherPoints>50 pts</VoucherPoints>
            <RedeemButton>Redeem</RedeemButton>
          </VoucherCard>

          <VoucherCard $bgColor="#27AE60">
            <VoucherIcon>🎓</VoucherIcon>
            <VoucherTitle>University Studies</VoucherTitle>
            <VoucherDiscount>20% off university fees</VoucherDiscount>
            <VoucherPoints>100 pts</VoucherPoints>
            <RedeemButton>Redeem</RedeemButton>
          </VoucherCard>

          <VoucherCard $bgColor="#E91E63">
            <VoucherIcon>☕</VoucherIcon>
            <VoucherTitle>Mukha Cafe</VoucherTitle>
            <VoucherDiscount>Food & beverage discount</VoucherDiscount>
            <VoucherPoints>25 pts</VoucherPoints>
            <RedeemButton>Redeem</RedeemButton>
          </VoucherCard>

          <VoucherCard $bgColor="#FF9800">
            <VoucherIcon>✈️</VoucherIcon>
            <VoucherTitle>Umrah Travel & Tours</VoucherTitle>
            <VoucherDiscount>10% discount on travel</VoucherDiscount>
            <VoucherPoints>75 pts</VoucherPoints>
            <RedeemButton>Redeem</RedeemButton>
          </VoucherCard>

          <VoucherCard $bgColor="#9C27B0">
            <VoucherIcon>🏥</VoucherIcon>
            <VoucherTitle>Healthcare Plus</VoucherTitle>
            <VoucherDiscount>15% off medical checkup</VoucherDiscount>
            <VoucherPoints>60 pts</VoucherPoints>
            <RedeemButton disabled={248 < 60}>
              {248 >= 60 ? 'Redeem' : 'Insufficient Points'}
            </RedeemButton>
          </VoucherCard>

          <VoucherCard $bgColor="#607D8B">
            <VoucherIcon>🛍️</VoucherIcon>
            <VoucherTitle>Shopping Mall</VoucherTitle>
            <VoucherDiscount>RM20 off purchases above RM100</VoucherDiscount>
            <VoucherPoints>80 pts</VoucherPoints>
            <RedeemButton>Redeem</RedeemButton>
          </VoucherCard>
        </VoucherGrid>

        <MyVouchersButton onClick={() => navigate('/my-vouchers')}>
          📋 View My Vouchers
        </MyVouchersButton>
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

// Styled components for VouchersScreen
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

const HeaderContent = styled.div`
  flex: 1;
`;

const HeaderTitle = styled.h1`
  font-size: 20px;
  font-weight: bold;
  color: #2D5F4F;
  margin: 0 0 4px 0;
`;

const PointsBalance = styled.p`
  font-size: 14px;
  color: #FF9800;
  margin: 0;
  font-weight: 600;
`;

const Content = styled.div`
  flex: 1;
  padding: 20px;
  padding-bottom: 100px; /* Added extra space for floating nav */
`;

const VoucherGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
`;

const VoucherCard = styled.div<{ $bgColor: string }>`
  background: ${({ $bgColor }) => $bgColor};
  border-radius: 16px;
  padding: 16px;
  color: white;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 180px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
  }
`;

const VoucherIcon = styled.div`
  font-size: 32px;
  margin-bottom: 8px;
`;

const VoucherTitle = styled.h3`
  font-size: 14px;
  font-weight: bold;
  margin: 0 0 4px 0;
  line-height: 1.2;
`;

const VoucherDiscount = styled.p`
  font-size: 11px;
  margin: 0 0 8px 0;
  opacity: 0.9;
  line-height: 1.3;
`;

const VoucherPoints = styled.div`
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 12px;
`;

const RedeemButton = styled.button<{ disabled?: boolean }>`
  background: ${({ disabled }) => disabled ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.2)'};
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 12px;
  font-weight: 600;
  cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'pointer'};
  opacity: ${({ disabled }) => disabled ? 0.6 : 1};
  
  &:hover {
    background: ${({ disabled }) => disabled ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.3)'};
  }
`;

const MyVouchersButton = styled.button`
  background: #2D5F4F;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 16px 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  box-shadow: 0 4px 12px rgba(45, 95, 79, 0.3);
  transition: all 0.2s ease;
  
  &:hover {
    background: #1F4A3A;
    transform: translateY(-1px);
    box-shadow: 0 6px 18px rgba(45, 95, 79, 0.4);
  }
`;