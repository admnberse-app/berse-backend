import React, { useState } from 'react';
import styled from 'styled-components';

interface ManagePassModalProps {
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
  background: rgba(0, 0, 0, 0.8);
  display: ${({ $isOpen }) => $isOpen ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
`;

const ModalContainer = styled.div`
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 400px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
`;

const ModalHeader = styled.div`
  padding: 20px 20px 0 20px;
  border-bottom: 1px solid #f0f0f0;
  position: sticky;
  top: 0;
  background: white;
  z-index: 10;
`;

const ModalTitle = styled.h2`
  margin: 0 0 16px 0;
  font-size: 20px;
  font-weight: bold;
  color: #333;
`;

const CloseButton = styled.button`
  position: absolute;
  right: 20px;
  top: 20px;
  background: none;
  border: none;
  font-size: 24px;
  color: #666;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: #f0f0f0;
  }
`;

const ModalContent = styled.div`
  padding: 20px;
`;

const Section = styled.div`
  margin-bottom: 24px;
`;

const SectionTitle = styled.h3`
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: #2D5F4F;
`;

const StatusCard = styled.div`
  background: linear-gradient(135deg, #2D5F4F, #4A90A4);
  border-radius: 12px;
  padding: 16px;
  color: white;
  margin-bottom: 20px;
`;

const StatusRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const StatusLabel = styled.div`
  font-size: 14px;
  opacity: 0.9;
`;

const StatusValue = styled.div`
  font-size: 14px;
  font-weight: 600;
`;

const Toggle = styled.div<{ $active: boolean }>`
  width: 44px;
  height: 24px;
  background: ${({ $active }) => $active ? '#4CAF50' : '#ccc'};
  border-radius: 12px;
  position: relative;
  cursor: pointer;
  transition: background 0.3s ease;
  
  &::after {
    content: '';
    position: absolute;
    width: 20px;
    height: 20px;
    background: white;
    border-radius: 50%;
    top: 2px;
    left: ${({ $active }) => $active ? '22px' : '2px'};
    transition: left 0.3s ease;
  }
`;

const PaymentMethodCard = styled.div`
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
`;

const PaymentHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
`;

const PaymentIcon = styled.div`
  width: 40px;
  height: 40px;
  background: #2D5F4F;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
`;

const PaymentInfo = styled.div`
  flex: 1;
`;

const PaymentName = styled.div`
  font-weight: 600;
  color: #333;
  margin-bottom: 2px;
`;

const PaymentBalance = styled.div`
  font-size: 12px;
  color: #666;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: 10px 16px;
  border: ${({ variant }) => 
    variant === 'primary' ? 'none' : 
    variant === 'danger' ? '1px solid #EF4444' : 
    '1px solid #e0e0e0'};
  border-radius: 8px;
  background: ${({ variant }) => 
    variant === 'primary' ? '#2D5F4F' : 
    variant === 'danger' ? '#FEF2F2' : 
    'white'};
  color: ${({ variant }) => 
    variant === 'primary' ? 'white' : 
    variant === 'danger' ? '#EF4444' : 
    '#333'};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
  margin-bottom: 8px;
  
  &:hover {
    opacity: 0.9;
  }
`;

const BillingHistoryItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
  }
`;

const BillingDate = styled.div`
  font-size: 14px;
  color: #333;
`;

const BillingAmount = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const BillingPrice = styled.div`
  font-weight: 600;
  color: #333;
`;

const BillingStatus = styled.div`
  color: #10B981;
  font-size: 12px;
`;

const UsageStatsCard = styled.div`
  background: #f8f9fa;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
`;

const UsageStat = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const UsageLabel = styled.div`
  font-size: 14px;
  color: #666;
`;

const UsageValue = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #2D5F4F;
`;

const ROIHighlight = styled.div`
  background: linear-gradient(135deg, #FFD700, #FFA500);
  border-radius: 8px;
  padding: 12px;
  text-align: center;
  color: #333;
  font-weight: 600;
  margin-top: 12px;
`;

export const ManagePassModal: React.FC<ManagePassModalProps> = ({ isOpen, onClose }) => {
  const [autoRenewal, setAutoRenewal] = useState(true);
  const [currentView, setCurrentView] = useState<'overview' | 'payment' | 'billing'>('overview');

  // Mock data
  const setelBalance = 45.60;
  const nextPaymentDate = 'Oct 1, 2025';
  const expiryDate = 'Sept 30, 2025';

  const billingHistory = [
    { date: 'Sept 1, 2025', amount: 'RM 19.99', status: 'Paid' },
    { date: 'Aug 1, 2025', amount: 'RM 19.99', status: 'Paid' },
    { date: 'July 1, 2025', amount: 'RM 19.99', status: 'Paid' },
  ];

  const handleCancelSubscription = () => {
    if (confirm('Are you sure you want to cancel your BersePass subscription? You will lose all premium benefits.')) {
      alert('Subscription cancelled. You will have access until Sept 30, 2025.');
      onClose();
    }
  };

  const handlePauseSubscription = () => {
    const pauseOptions = ['1 month', '3 months', '6 months'];
    const choice = prompt(`How long would you like to pause your subscription?\n\n1. 1 month\n2. 3 months\n3. 6 months\n\nEnter 1, 2, or 3:`);
    
    if (choice && ['1', '2', '3'].includes(choice)) {
      const duration = pauseOptions[parseInt(choice) - 1];
      alert(`Subscription paused for ${duration}. No charges will occur during this period.`);
      onClose();
    }
  };

  const renderOverview = () => (
    <>
      <StatusCard>
        <StatusRow>
          <StatusLabel>Status</StatusLabel>
          <StatusValue>✅ Active until {expiryDate}</StatusValue>
        </StatusRow>
        <StatusRow>
          <StatusLabel>Next payment</StatusLabel>
          <StatusValue>RM 19.99 on {nextPaymentDate}</StatusValue>
        </StatusRow>
        <StatusRow>
          <StatusLabel>Auto-renewal</StatusLabel>
          <Toggle 
            $active={autoRenewal} 
            onClick={() => setAutoRenewal(!autoRenewal)}
          />
        </StatusRow>
      </StatusCard>

      <Section>
        <SectionTitle>💳 Payment Method</SectionTitle>
        <PaymentMethodCard>
          <PaymentHeader>
            <PaymentIcon>🚗</PaymentIcon>
            <PaymentInfo>
              <PaymentName>Setel Wallet</PaymentName>
              <PaymentBalance>RM {setelBalance.toFixed(2)} available</PaymentBalance>
            </PaymentInfo>
          </PaymentHeader>
          {setelBalance < 19.99 && (
            <div style={{ 
              background: '#FEF2F2', 
              color: '#EF4444', 
              padding: '8px', 
              borderRadius: '6px', 
              fontSize: '12px',
              marginBottom: '8px'
            }}>
              ⚠️ Insufficient balance for next payment. Please top up.
            </div>
          )}
          <Button onClick={() => setCurrentView('payment')}>
            Change Payment Method
          </Button>
        </PaymentMethodCard>
      </Section>

      <Section>
        <SectionTitle>📊 Usage Stats</SectionTitle>
        <UsageStatsCard>
          <UsageStat>
            <UsageLabel>This month saved</UsageLabel>
            <UsageValue>RM 89</UsageValue>
          </UsageStat>
          <UsageStat>
            <UsageLabel>Events attended</UsageLabel>
            <UsageValue>3 premium events</UsageValue>
          </UsageStat>
          <UsageStat>
            <UsageLabel>Discounts used</UsageLabel>
            <UsageValue>12 partner offers</UsageValue>
          </UsageStat>
          <ROIHighlight>
            🎉 You saved 4.5x your subscription cost!
          </ROIHighlight>
        </UsageStatsCard>
      </Section>

      <Section>
        <SectionTitle>💰 Recent Billing</SectionTitle>
        <div>
          {billingHistory.slice(0, 3).map((item, index) => (
            <BillingHistoryItem key={index}>
              <BillingDate>{item.date}</BillingDate>
              <BillingAmount>
                <BillingPrice>{item.amount}</BillingPrice>
                <BillingStatus>✅ {item.status}</BillingStatus>
              </BillingAmount>
            </BillingHistoryItem>
          ))}
          <Button onClick={() => setCurrentView('billing')}>
            View All Billing History
          </Button>
        </div>
      </Section>

      <Section>
        <SectionTitle>⚙️ Subscription Controls</SectionTitle>
        <Button onClick={handlePauseSubscription}>
          ⏸️ Pause Subscription
        </Button>
        <Button onClick={() => alert('Billing date change coming soon!')}>
          📅 Change Billing Date
        </Button>
        <Button variant="danger" onClick={handleCancelSubscription}>
          ❌ Cancel Subscription
        </Button>
      </Section>
    </>
  );

  const renderPaymentMethod = () => (
    <>
      <div style={{ marginBottom: '20px' }}>
        <Button onClick={() => setCurrentView('overview')}>
          ← Back to Overview
        </Button>
      </div>

      <Section>
        <SectionTitle>Current Payment Method</SectionTitle>
        <PaymentMethodCard>
          <PaymentHeader>
            <PaymentIcon>🚗</PaymentIcon>
            <PaymentInfo>
              <PaymentName>Setel Wallet (Primary)</PaymentName>
              <PaymentBalance>RM {setelBalance.toFixed(2)} available</PaymentBalance>
            </PaymentInfo>
          </PaymentHeader>
        </PaymentMethodCard>
      </Section>

      <Section>
        <SectionTitle>Add Backup Payment Method</SectionTitle>
        <Button onClick={() => alert('Credit card setup coming soon!')}>
          💳 Add Credit Card
        </Button>
        <Button onClick={() => alert('FPX setup coming soon!')}>
          🏦 Add FPX Bank Account
        </Button>
        <Button onClick={() => alert('Touch n Go setup coming soon!')}>
          📱 Add Touch n Go eWallet
        </Button>
      </Section>

      <Section>
        <SectionTitle>Payment Settings</SectionTitle>
        <Button onClick={() => alert('Testing payment method...')}>
          🧪 Test Payment Method
        </Button>
        <Button onClick={() => alert('Payment notifications updated!')}>
          🔔 Payment Notifications
        </Button>
      </Section>
    </>
  );

  const renderBillingHistory = () => (
    <>
      <div style={{ marginBottom: '20px' }}>
        <Button onClick={() => setCurrentView('overview')}>
          ← Back to Overview
        </Button>
      </div>

      <Section>
        <SectionTitle>Complete Billing History</SectionTitle>
        <div>
          {[...billingHistory, 
            { date: 'June 1, 2025', amount: 'RM 19.99', status: 'Paid' },
            { date: 'May 1, 2025', amount: 'RM 19.99', status: 'Paid' },
            { date: 'April 1, 2025', amount: 'RM 19.99', status: 'Paid' }
          ].map((item, index) => (
            <BillingHistoryItem key={index}>
              <BillingDate>{item.date}</BillingDate>
              <BillingAmount>
                <BillingPrice>{item.amount}</BillingPrice>
                <BillingStatus>✅ {item.status}</BillingStatus>
              </BillingAmount>
            </BillingHistoryItem>
          ))}
        </div>
        <Button onClick={() => alert('Receipt emailed!')}>
          📧 Email All Receipts
        </Button>
        <Button onClick={() => alert('Tax summary generated!')}>
          📋 Download Tax Summary
        </Button>
      </Section>
    </>
  );

  const renderContent = () => {
    switch (currentView) {
      case 'payment':
        return renderPaymentMethod();
      case 'billing':
        return renderBillingHistory();
      default:
        return renderOverview();
    }
  };

  return (
    <ModalOverlay $isOpen={isOpen} onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>BersePass Management</ModalTitle>
          <CloseButton onClick={onClose}>×</CloseButton>
        </ModalHeader>
        
        <ModalContent>
          {renderContent()}
        </ModalContent>
      </ModalContainer>
    </ModalOverlay>
  );
};