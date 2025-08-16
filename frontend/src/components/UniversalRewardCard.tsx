// Universal Reward Card - Can be used anywhere in the app
import React from 'react';
import styled from 'styled-components';
import { useUniversalRedemption } from '../hooks/useUniversalRedemption';

interface UniversalRewardCardProps {
  reward: {
    id: string;
    category: string;
    icon: string;
    brand: string;
    title: string;
    description: string;
    points: number;
    value?: string;
    isNew?: boolean;
    isExpiringSoon?: boolean;
  };
  variant?: 'small' | 'medium' | 'large';
}

const CardContainer = styled.div<{ variant: 'small' | 'medium' | 'large' }>`
  background: white;
  border-radius: ${({ variant }) => 
    variant === 'small' ? '8px' : 
    variant === 'medium' ? '12px' : '16px'};
  padding: ${({ variant }) => 
    variant === 'small' ? '12px' : 
    variant === 'medium' ? '16px' : '20px'};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
  position: relative;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const Badge = styled.div<{ type: 'new' | 'expiring' }>`
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
  color: white;
  background: ${({ type }) => type === 'new' ? '#10B981' : '#EF4444'};
`;

const RewardIcon = styled.div<{ variant: 'small' | 'medium' | 'large' }>`
  font-size: ${({ variant }) => 
    variant === 'small' ? '24px' : 
    variant === 'medium' ? '32px' : '48px'};
  text-align: center;
  margin-bottom: 8px;
`;

const RewardBrand = styled.div<{ variant: 'small' | 'medium' | 'large' }>`
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
  font-size: ${({ variant }) => 
    variant === 'small' ? '12px' : 
    variant === 'medium' ? '14px' : '16px'};
  text-align: center;
`;

const RewardTitle = styled.div<{ variant: 'small' | 'medium' | 'large' }>`
  font-size: ${({ variant }) => 
    variant === 'small' ? '10px' : 
    variant === 'medium' ? '12px' : '14px'};
  color: #666;
  margin-bottom: 8px;
  line-height: 1.3;
  text-align: center;
`;

const RewardValue = styled.div<{ variant: 'small' | 'medium' | 'large' }>`
  font-size: ${({ variant }) => 
    variant === 'small' ? '14px' : 
    variant === 'medium' ? '16px' : '20px'};
  font-weight: bold;
  color: #2fce98;
  margin-bottom: 12px;
  text-align: center;
`;

const RewardPoints = styled.div<{ variant: 'small' | 'medium' | 'large' }>`
  color: #666;
  font-weight: 500;
  margin-bottom: 12px;
  font-size: ${({ variant }) => 
    variant === 'small' ? '11px' : 
    variant === 'medium' ? '12px' : '14px'};
  text-align: center;
`;

const RedeemButton = styled.button<{ 
  disabled: boolean; 
  variant: 'small' | 'medium' | 'large';
}>`
  width: 100%;
  padding: ${({ variant }) => 
    variant === 'small' ? '6px 12px' : 
    variant === 'medium' ? '8px 16px' : '12px 20px'};
  background: ${({ disabled }) => disabled ? '#ccc' : '#2fce98'};
  color: white;
  border: none;
  border-radius: 6px;
  font-size: ${({ variant }) => 
    variant === 'small' ? '11px' : 
    variant === 'medium' ? '12px' : '14px'};
  font-weight: 600;
  cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  opacity: ${({ disabled }) => disabled ? 0.7 : 1};
  
  &:hover {
    background: ${({ disabled }) => disabled ? '#ccc' : '#1a4a3a'};
  }
`;

const CategoryTag = styled.div`
  position: absolute;
  top: 8px;
  left: 8px;
  background: rgba(45, 95, 79, 0.1);
  color: #2fce98;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 8px;
  font-weight: 600;
  text-transform: uppercase;
`;

export const UniversalRewardCard: React.FC<UniversalRewardCardProps> = ({ 
  reward, 
  variant = 'medium' 
}) => {
  const { handleRedeemClick, getButtonProps } = useUniversalRedemption();
  
  const buttonProps = getButtonProps(reward);

  return (
    <CardContainer variant={variant} onClick={() => handleRedeemClick(reward)}>
      {reward.isNew && <Badge type="new">NEW</Badge>}
      {reward.isExpiringSoon && <Badge type="expiring">EXPIRING</Badge>}
      <CategoryTag>{reward.category}</CategoryTag>
      
      <RewardIcon variant={variant}>{reward.icon}</RewardIcon>
      <RewardBrand variant={variant}>{reward.brand}</RewardBrand>
      <RewardTitle variant={variant}>{reward.title}</RewardTitle>
      
      {reward.value && (
        <RewardValue variant={variant}>{reward.value}</RewardValue>
      )}
      
      <RewardPoints variant={variant}>{reward.points} pts</RewardPoints>
      
      <RedeemButton
        variant={variant}
        disabled={buttonProps.disabled}
        onClick={(e) => {
          e.stopPropagation();
          handleRedeemClick(reward);
        }}
        style={buttonProps.style}
      >
        {buttonProps.text}
      </RedeemButton>
    </CardContainer>
  );
};