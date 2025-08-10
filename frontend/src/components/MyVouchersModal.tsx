import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { voucherService, Voucher } from '../services/voucherService';

interface MyVouchersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Styled Components
const ModalOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: ${props => props.$isOpen ? 'flex' : 'none'};
  align-items: flex-end;
  justify-content: center;
  z-index: 1000;
`;

const ModalContainer = styled.div`
  background: #F9F3E3;
  border-radius: 24px 24px 0 0;
  width: 100%;
  max-width: 393px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease;
  
  @keyframes slideUp {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
  }
`;

const ModalHeader = styled.div`
  background: white;
  padding: 16px;
  border-bottom: 1px solid #E0E0E0;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const HeaderTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: #333;
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

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  padding: 16px;
  background: white;
`;

const StatCard = styled.div`
  background: #F5F5F5;
  border-radius: 12px;
  padding: 12px;
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 18px;
  font-weight: bold;
  color: #2D5F4F;
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 11px;
  color: #666;
  font-weight: 500;
`;

const TabContainer = styled.div`
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  background: white;
  border-bottom: 1px solid #E0E0E0;
`;

const TabButton = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${props => props.$active ? '#2D5F4F' : '#F5F5F5'};
  color: ${props => props.$active ? 'white' : '#666'};
  
  &:hover {
    background: ${props => props.$active ? '#1a4a3a' : '#E0E0E0'};
  }
`;

const VouchersContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
`;

const VoucherCard = styled.div<{ $gradient: string }>`
  background: ${props => props.$gradient};
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
  color: white;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
    animation: shimmer 3s infinite;
  }
  
  @keyframes shimmer {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const VoucherTitle = styled.div`
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 8px;
`;

const VoucherValue = styled.div`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 12px;
`;

const VoucherFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const VoucherCode = styled.div`
  background: rgba(255, 255, 255, 0.9);
  color: #333;
  padding: 6px 12px;
  border-radius: 8px;
  font-family: 'Courier New', monospace;
  font-weight: bold;
  font-size: 11px;
  letter-spacing: 1px;
`;

const VoucherDate = styled.div`
  font-size: 11px;
  opacity: 0.8;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
`;

const EmptyIcon = styled.div`
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
`;

const EmptyTitle = styled.h3`
  color: #333;
  margin-bottom: 8px;
  font-size: 18px;
`;

const EmptySubtitle = styled.p`
  color: #666;
  margin-bottom: 24px;
  font-size: 14px;
`;

const EmptyButton = styled.button`
  background: #2D5F4F;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #1a4a3a;
  }
`;

// Voucher gradients
const voucherGradients = {
  restaurant: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  cafe: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  halal: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  food: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  retail: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  general: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
  used: 'linear-gradient(135deg, #868f96 0%, #596164 100%)',
  expired: 'linear-gradient(135deg, #868f96 0%, #596164 100%)'
};

export const MyVouchersModal: React.FC<MyVouchersModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'active' | 'used' | 'expired'>('active');
  const [vouchers, setVouchers] = useState<{
    active: Voucher[];
    used: Voucher[];
    expired: Voucher[];
  }>({ active: [], used: [], expired: [] });
  const [stats, setStats] = useState({
    totalRedeemed: 0,
    totalSaved: 0,
    activeCount: 0
  });

  useEffect(() => {
    if (user && isOpen) {
      // Load user's vouchers
      const userVouchers = voucherService.getUserVouchers(user.id);
      setVouchers(userVouchers);
      
      // Load stats
      const voucherStats = voucherService.getVoucherStats(user.id);
      setStats(voucherStats);
    }
  }, [user, isOpen]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getVoucherGradient = (voucher: Voucher) => {
    if (voucher.status === 'used') return voucherGradients.used;
    if (voucher.status === 'expired') return voucherGradients.expired;
    
    const brand = voucher.brand.toLowerCase();
    if (brand.includes('restaurant') || brand.includes('dining')) return voucherGradients.restaurant;
    if (brand.includes('halal') || brand.includes('muslim')) return voucherGradients.halal;
    if (brand.includes('cafe') || brand.includes('coffee')) return voucherGradients.cafe;
    if (brand.includes('food')) return voucherGradients.food;
    if (brand.includes('retail') || brand.includes('shop')) return voucherGradients.retail;
    
    return voucherGradients.general;
  };

  const renderVoucherCard = (voucher: Voucher) => {
    const gradient = getVoucherGradient(voucher);
    
    return (
      <VoucherCard key={voucher.id} $gradient={gradient}>
        <VoucherTitle>{voucher.brand}</VoucherTitle>
        <VoucherValue>
          {voucher.type === 'percentage' 
            ? `${voucher.value}% OFF` 
            : `RM ${voucher.value} OFF`}
        </VoucherValue>
        <VoucherFooter>
          <VoucherCode>{voucher.code}</VoucherCode>
          <VoucherDate>
            {voucher.status === 'active' 
              ? `Valid until ${formatDate(voucher.expiryDate)}`
              : voucher.status === 'used'
              ? `Used on ${formatDate(voucher.usedAt!)}`
              : `Expired on ${formatDate(voucher.expiryDate)}`}
          </VoucherDate>
        </VoucherFooter>
      </VoucherCard>
    );
  };

  const currentVouchers = vouchers[activeTab];

  if (!isOpen) return null;

  return (
    <ModalOverlay $isOpen={isOpen} onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <HeaderTitle>My Vouchers</HeaderTitle>
          <CloseButton onClick={onClose}>×</CloseButton>
        </ModalHeader>

        <StatsGrid>
          <StatCard>
            <StatValue>{stats.activeCount}</StatValue>
            <StatLabel>Active</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{stats.totalRedeemed}</StatValue>
            <StatLabel>Redeemed</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>RM {stats.totalSaved}</StatValue>
            <StatLabel>Total Saved</StatLabel>
          </StatCard>
        </StatsGrid>

        <TabContainer>
          <TabButton 
            $active={activeTab === 'active'} 
            onClick={() => setActiveTab('active')}
          >
            Active ({vouchers.active.length})
          </TabButton>
          <TabButton 
            $active={activeTab === 'used'} 
            onClick={() => setActiveTab('used')}
          >
            Used ({vouchers.used.length})
          </TabButton>
          <TabButton 
            $active={activeTab === 'expired'} 
            onClick={() => setActiveTab('expired')}
          >
            Expired ({vouchers.expired.length})
          </TabButton>
        </TabContainer>

        <VouchersContainer>
          {currentVouchers.length > 0 ? (
            currentVouchers.map(renderVoucherCard)
          ) : (
            <EmptyState>
              <EmptyIcon>🎫</EmptyIcon>
              <EmptyTitle>No {activeTab} vouchers</EmptyTitle>
              <EmptySubtitle>
                {activeTab === 'active' 
                  ? 'Earn points and redeem them for amazing vouchers!'
                  : `You don't have any ${activeTab} vouchers yet.`}
              </EmptySubtitle>
              {activeTab === 'active' && (
                <EmptyButton onClick={onClose}>
                  Explore Rewards
                </EmptyButton>
              )}
            </EmptyState>
          )}
        </VouchersContainer>
      </ModalContainer>
    </ModalOverlay>
  );
};