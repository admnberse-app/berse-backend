import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { StatusBar } from '../components/StatusBar';
import { BottomNav } from '../components/BottomNav';
import { voucherService, Voucher } from '../services/voucherService';
// QR code functionality temporarily disabled

// Styled Components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #F5F5DC;
  max-width: 393px;
  margin: 0 auto;
`;

const Header = styled.div`
  background: #F5F5DC;
  width: 100%;
  padding: 12px 16px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  color: #333;
  cursor: pointer;
  padding: 4px;
  
  &:hover {
    color: #2D5F4F;
  }
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

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 12px;
  margin: 20px;
`;

const StatCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const StatValue = styled.div`
  font-size: 20px;
  font-weight: bold;
  color: #2D5F4F;
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 11px;
  color: #666;
  font-weight: 500;
`;

const Content = styled.div`
  flex: 1;
  padding: 0;
  background: #F5F5DC;
  overflow-y: auto;
  margin-bottom: 80px;
`;

const TabContainer = styled.div`
  display: flex;
  background: white;
  border-radius: 12px;
  padding: 4px;
  margin: 0 20px 16px 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const TabButton = styled.button<{ $active: boolean }>`
  flex: 1;
  background: ${({ $active }) => $active ? '#2D5F4F' : 'transparent'};
  color: ${({ $active }) => $active ? 'white' : '#666'};
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    color: ${({ $active }) => $active ? 'white' : '#2D5F4F'};
    background: ${({ $active }) => $active ? '#2D5F4F' : 'rgba(45, 95, 79, 0.1)'};
  }
`;

const TabContent = styled.div`
  padding: 0 20px 100px 20px;
`;

const VouchersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

// Voucher gradient mappings based on brand/type
const voucherGradients = {
  restaurant: 'linear-gradient(135deg, #FF6B9D, #FF8E9B, #FFA8A8)',
  halal: 'linear-gradient(135deg, #4A90E2, #7B68EE, #9370DB)', 
  cafe: 'linear-gradient(135deg, #27AE60, #2ECC71, #58D68D)',
  food: 'linear-gradient(135deg, #8E44AD, #9B59B6, #BB77BB)',
  retail: 'linear-gradient(135deg, #FF9500, #FFAD33, #FFC266)',
  general: 'linear-gradient(135deg, #6C5CE7, #A29BFE, #FDCB6E)',
  used: 'linear-gradient(135deg, #6B7280, #9CA3AF, #D1D5DB)',
  expired: 'linear-gradient(135deg, #DC2626, #EF4444, #F87171)'
};

const VoucherCard = styled.div<{ status: 'active' | 'used' | 'expired'; $gradient: string }>`
  background: ${({ $gradient }) => $gradient};
  border-radius: 16px;
  padding: 20px;
  margin: 0 20px 16px 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  color: white;
  cursor: ${({ status }) => status === 'active' ? 'pointer' : 'default'};
  opacity: ${({ status }) => status === 'active' ? 1 : 0.8};
  transition: all 0.3s ease;
  
  ${({ status }) => status === 'active' && `
    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
    }
  `}
  
  &:active {
    transform: translateY(-2px);
  }
`;

const VoucherHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
`;

const VoucherBrand = styled.div`
  font-size: 16px;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 8px;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
`;

const VoucherStatus = styled.div`
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  color: white;
`;

const VoucherTitle = styled.div`
  font-size: 14px;
  color: white;
  opacity: 0.9;
  margin-bottom: 16px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
`;

const VoucherContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const VoucherValue = styled.div`
  font-size: 24px;
  font-weight: bold;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
`;

const VoucherCode = styled.div`
  background: rgba(255, 255, 255, 0.9);
  color: #333;
  padding: 8px 12px;
  border-radius: 8px;
  font-family: 'Courier New', monospace;
  font-weight: bold;
  font-size: 12px;
  letter-spacing: 1px;
`;

const VoucherFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
`;

const VoucherDate = styled.div`
  font-size: 12px;
  color: white;
  opacity: 0.8;
`;

const QRButton = styled.button`
  background: rgba(255, 255, 255, 0.9);
  color: #333;
  border: none;
  padding: 8px 16px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: white;
    transform: translateY(-1px);
  }
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

// Voucher Detail Modal
const ModalOverlay = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: ${({ isOpen }) => isOpen ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
`;

const ModalContainer = styled.div`
  background: white;
  border-radius: 20px;
  width: 100%;
  max-width: 360px;
  overflow: hidden;
`;

const ModalHeader = styled.div<{ $gradient: string }>`
  background: ${({ $gradient }) => $gradient};
  padding: 20px;
  color: white;
  text-align: center;
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  right: 16px;
  top: 16px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  color: white;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const ModalContent = styled.div`
  padding: 24px;
  text-align: center;
`;

const QRCodeContainer = styled.div`
  background: white;
  padding: 16px;
  border-radius: 12px;
  display: inline-block;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const QRCodeImage = styled.img`
  width: 200px;
  height: 200px;
  display: block;
`;

const VoucherDetailCode = styled.div`
  background: #2D5F4F;
  color: white;
  padding: 16px 24px;
  border-radius: 12px;
  font-size: 20px;
  font-weight: bold;
  font-family: 'Courier New', monospace;
  letter-spacing: 2px;
  margin-bottom: 20px;
`;

const VoucherDetailInfo = styled.div`
  background: #f8f9fa;
  border-radius: 12px;
  padding: 16px;
  text-align: left;
  margin-bottom: 20px;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const InfoLabel = styled.span`
  color: #666;
  font-size: 14px;
`;

const InfoValue = styled.span`
  color: #333;
  font-weight: 600;
  font-size: 14px;
`;

export const MyVouchersScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'active' | 'used' | 'expired'>('active');
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
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
    if (user) {
      // Load user's vouchers
      const userVouchers = voucherService.getUserVouchers(user.id);
      setVouchers(userVouchers);
      
      // Load stats
      const voucherStats = voucherService.getVoucherStats(user.id);
      setStats(voucherStats);
    }
  }, [user]);

  useEffect(() => {
    if (selectedVoucher) {
      // Temporary placeholder - QR code generation will be added later
      setQrCodeUrl('placeholder');
    }
  }, [selectedVoucher]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusText = (voucher: Voucher) => {
    if (voucher.status === 'used') {
      return `Used on ${formatDate(voucher.usedAt!)}`;
    } else if (voucher.status === 'expired') {
      return `Expired on ${formatDate(voucher.expiryDate)}`;
    }
    return `Valid until ${formatDate(voucher.expiryDate)}`;
  };

  const handleVoucherClick = (voucher: Voucher) => {
    if (voucher.status === 'active') {
      setSelectedVoucher(voucher);
    }
  };

  const closeModal = () => {
    setSelectedVoucher(null);
    setQrCodeUrl('');
  };

  const getVoucherGradient = (voucher: Voucher) => {
    if (voucher.status === 'used') return voucherGradients.used;
    if (voucher.status === 'expired') return voucherGradients.expired;
    
    // Map voucher categories to gradients based on brand/type
    const brand = voucher.brand.toLowerCase();
    if (brand.includes('restaurant') || brand.includes('dining')) return voucherGradients.restaurant;
    if (brand.includes('halal') || brand.includes('muslim')) return voucherGradients.halal;
    if (brand.includes('cafe') || brand.includes('coffee')) return voucherGradients.cafe;
    if (brand.includes('food')) return voucherGradients.food;
    if (brand.includes('retail') || brand.includes('shop')) return voucherGradients.retail;
    
    return voucherGradients.general; // default
  };

  const renderVoucherCard = (voucher: Voucher) => {
    const gradient = getVoucherGradient(voucher);
    
    return (
      <VoucherCard 
        key={voucher.id} 
        status={voucher.status}
        $gradient={gradient}
        onClick={() => handleVoucherClick(voucher)}
      >
        <VoucherHeader>
          <VoucherBrand>
            <span>{voucher.icon}</span>
            {voucher.brand}
          </VoucherBrand>
          <VoucherStatus>{voucher.status}</VoucherStatus>
        </VoucherHeader>
        
        <VoucherTitle>{voucher.title}</VoucherTitle>
        
        <VoucherContent>
          <VoucherValue>{voucher.value}</VoucherValue>
          <VoucherCode>{voucher.code}</VoucherCode>
        </VoucherContent>
        
        <VoucherFooter>
          <VoucherDate>{getStatusText(voucher)}</VoucherDate>
          {voucher.status === 'active' && (
            <QRButton onClick={(e) => {
              e.stopPropagation();
              handleVoucherClick(voucher);
            }}>
              Show QR
            </QRButton>
          )}
        </VoucherFooter>
      </VoucherCard>
    );
  };

  const renderEmptyState = () => {
    const messages = {
      active: {
        icon: '🎫',
        title: 'No active vouchers',
        subtitle: 'Redeem points for vouchers and they\'ll appear here',
        buttonText: 'Browse Rewards',
        buttonAction: () => navigate('/points')
      },
      used: {
        icon: '✅',
        title: 'No used vouchers yet',
        subtitle: 'Your used vouchers will be shown here',
        buttonText: 'View Active Vouchers',
        buttonAction: () => setActiveTab('active')
      },
      expired: {
        icon: '⏰',
        title: 'No expired vouchers',
        subtitle: 'Expired vouchers will be archived here',
        buttonText: 'Browse Rewards',
        buttonAction: () => navigate('/points')
      }
    };

    const message = messages[activeTab];

    return (
      <EmptyState>
        <EmptyIcon>{message.icon}</EmptyIcon>
        <EmptyTitle>{message.title}</EmptyTitle>
        <EmptySubtitle>{message.subtitle}</EmptySubtitle>
        <EmptyButton onClick={message.buttonAction}>
          {message.buttonText}
        </EmptyButton>
      </EmptyState>
    );
  };

  const currentVouchers = vouchers[activeTab];

  return (
    <Container>
      <StatusBar />
      
      <Header>
        <BackButton onClick={() => navigate('/profile')}>←</BackButton>
        <HeaderText>
          <HeaderTitle>My Vouchers</HeaderTitle>
          <HeaderSubtitle>Your redeemed rewards</HeaderSubtitle>
        </HeaderText>
      </Header>
      
      <StatsGrid>
        <StatCard>
          <StatValue>{stats.activeCount}</StatValue>
          <StatLabel>Active</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats.totalRedeemed}</StatValue>
          <StatLabel>Used</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>RM {stats.totalSaved}</StatValue>
          <StatLabel>Total Saved</StatLabel>
        </StatCard>
      </StatsGrid>
      
      <Content>
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
        
        <TabContent>
          {currentVouchers.length > 0 ? (
            <VouchersList>
              {currentVouchers.map(renderVoucherCard)}
            </VouchersList>
          ) : (
            renderEmptyState()
          )}
        </TabContent>
      </Content>
      
      {/* Voucher Detail Modal */}
      <ModalOverlay isOpen={!!selectedVoucher} onClick={closeModal}>
        <ModalContainer onClick={(e) => e.stopPropagation()}>
          {selectedVoucher && (
            <>
              <ModalHeader $gradient={getVoucherGradient(selectedVoucher)}>
                <CloseButton onClick={closeModal}>×</CloseButton>
                <VoucherBrand>
                  <span>{selectedVoucher.icon}</span>
                  {selectedVoucher.brand}
                </VoucherBrand>
                <VoucherTitle>{selectedVoucher.title}</VoucherTitle>
              </ModalHeader>
              
              <ModalContent>
                <VoucherValue style={{ marginBottom: '16px' }}>
                  {selectedVoucher.value}
                </VoucherValue>
                
                {qrCodeUrl && (
                  <QRCodeContainer>
                    <div style={{
                      width: '200px',
                      height: '200px',
                      background: '#f0f0f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '64px',
                      borderRadius: '8px'
                    }}>
                      📱
                    </div>
                    <div style={{
                      textAlign: 'center',
                      marginTop: '8px',
                      fontSize: '12px',
                      color: '#666'
                    }}>
                      QR Code Coming Soon
                    </div>
                  </QRCodeContainer>
                )}
                
                <VoucherDetailCode>{selectedVoucher.code}</VoucherDetailCode>
                
                <VoucherDetailInfo>
                  <InfoRow>
                    <InfoLabel>Valid until:</InfoLabel>
                    <InfoValue>{formatDate(selectedVoucher.expiryDate)}</InfoValue>
                  </InfoRow>
                  <InfoRow>
                    <InfoLabel>Points used:</InfoLabel>
                    <InfoValue>{selectedVoucher.pointsCost} pts</InfoValue>
                  </InfoRow>
                  <InfoRow>
                    <InfoLabel>Status:</InfoLabel>
                    <InfoValue style={{ color: '#10B981' }}>Active</InfoValue>
                  </InfoRow>
                </VoucherDetailInfo>
                
                <div style={{ fontSize: '12px', color: '#666', textAlign: 'center' }}>
                  Show this QR code to the merchant
                </div>
              </ModalContent>
            </>
          )}
        </ModalContainer>
      </ModalOverlay>
      
      <BottomNav activeTab="profile" />
    </Container>
  );
};