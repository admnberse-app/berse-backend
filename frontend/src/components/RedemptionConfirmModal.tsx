import React from 'react';
import styled from 'styled-components';

interface RedemptionConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  reward: {
    id: string;
    icon: string;
    brand: string;
    title: string;
    points: number;
  };
  currentPoints: number;
  onConfirm: () => void;
}

// Styled Components
const ModalOverlay = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: ${({ isOpen }) => isOpen ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
`;

const ModalContainer = styled.div`
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 360px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`;

const ModalHeader = styled.div`
  padding: 24px 24px 16px 24px;
  text-align: center;
  border-bottom: 1px solid #f0f0f0;
`;

const ModalTitle = styled.h2`
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: bold;
  color: #333;
`;

const ModalSubtitle = styled.p`
  margin: 0;
  font-size: 14px;
  color: #666;
`;

const ModalContent = styled.div`
  padding: 24px;
`;

const RewardPreview = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  background: #f8f9fa;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
`;

const RewardIcon = styled.div`
  font-size: 48px;
`;

const RewardInfo = styled.div`
  flex: 1;
`;

const RewardBrand = styled.div`
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
  font-size: 16px;
`;

const RewardTitle = styled.div`
  font-size: 14px;
  color: #666;
`;

const PointsBreakdown = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
`;

const PointsRow = styled.div<{ $highlight?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: ${({ $highlight }) => $highlight ? '#FEF3C7' : '#f8f9fa'};
  border-radius: 8px;
  border: ${({ $highlight }) => $highlight ? '1px solid #F59E0B' : 'none'};
`;

const PointsLabel = styled.div<{ $highlight?: boolean }>`
  font-size: 14px;
  color: ${({ $highlight }) => $highlight ? '#92400E' : '#666'};
  font-weight: ${({ $highlight }) => $highlight ? '500' : '400'};
`;

const PointsValue = styled.div<{ $highlight?: boolean; $negative?: boolean }>`
  font-size: 16px;
  font-weight: 600;
  color: ${({ $highlight, $negative }) => 
    $highlight ? '#92400E' : 
    $negative ? '#EF4444' : 
    '#333'};
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 12px;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  flex: 1;
  padding: 14px 20px;
  border: ${({ $variant }) => $variant === 'primary' ? 'none' : '1px solid #e0e0e0'};
  border-radius: 12px;
  background: ${({ $variant }) => $variant === 'primary' ? '#2D5F4F' : 'white'};
  color: ${({ $variant }) => $variant === 'primary' ? 'white' : '#333'};
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const InsufficientPointsWarning = styled.div`
  background: #FEF2F2;
  border: 1px solid #FCA5A5;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
  text-align: center;
`;

const WarningIcon = styled.span`
  color: #EF4444;
  font-size: 20px;
  margin-right: 8px;
`;

const WarningText = styled.span`
  color: #991B1B;
  font-size: 14px;
  font-weight: 500;
`;

export const RedemptionConfirmModal: React.FC<RedemptionConfirmModalProps> = ({
  isOpen,
  onClose,
  reward,
  currentPoints,
  onConfirm
}) => {
  const remainingPoints = currentPoints - reward.points;
  const hasEnoughPoints = currentPoints >= reward.points;
  const needMorePoints = reward.points - currentPoints;

  return (
    <ModalOverlay isOpen={isOpen} onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Confirm Redemption</ModalTitle>
          <ModalSubtitle>
            {hasEnoughPoints 
              ? 'Review your redemption details'
              : 'Insufficient points'}
          </ModalSubtitle>
        </ModalHeader>
        
        <ModalContent>
          <RewardPreview>
            <RewardIcon>{reward.icon}</RewardIcon>
            <RewardInfo>
              <RewardBrand>{reward.brand}</RewardBrand>
              <RewardTitle>{reward.title}</RewardTitle>
            </RewardInfo>
          </RewardPreview>
          
          {!hasEnoughPoints && (
            <InsufficientPointsWarning>
              <WarningIcon>⚠️</WarningIcon>
              <WarningText>
                You need {needMorePoints} more points to redeem this reward
              </WarningText>
            </InsufficientPointsWarning>
          )}
          
          <PointsBreakdown>
            <PointsRow>
              <PointsLabel>Current balance</PointsLabel>
              <PointsValue>{currentPoints} points</PointsValue>
            </PointsRow>
            
            <PointsRow $highlight>
              <PointsLabel $highlight>Cost</PointsLabel>
              <PointsValue $highlight $negative>-{reward.points} points</PointsValue>
            </PointsRow>
            
            <PointsRow>
              <PointsLabel>After redemption</PointsLabel>
              <PointsValue>
                {hasEnoughPoints ? `${remainingPoints} points` : 'N/A'}
              </PointsValue>
            </PointsRow>
          </PointsBreakdown>
          
          <ButtonContainer>
            <Button $variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            {hasEnoughPoints && (
              <Button $variant="primary" onClick={onConfirm}>
                Confirm Redeem
              </Button>
            )}
          </ButtonContainer>
        </ModalContent>
      </ModalContainer>
    </ModalOverlay>
  );
};