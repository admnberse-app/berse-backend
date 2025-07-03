import React from 'react';
import styled, { css } from 'styled-components';
import { PointsProps } from './Points.types';
import { Card } from '../Card';

const PointsContainer = styled.div<{ size: 'small' | 'medium' | 'large' }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  
  ${({ size }) => size === 'small' && css`
    gap: ${({ theme }) => theme.spacing[1]};
  `}
`;

const PointsValue = styled.div<{ size: 'small' | 'medium' | 'large' }>`
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.deepGreen.primary};
  
  ${({ size, theme }) => {
    const sizeMap = {
      small: theme.typography.fontSize.lg,
      medium: theme.typography.fontSize.xl,
      large: theme.typography.fontSize['2xl'],
    };
    return css`
      font-size: ${sizeMap[size]};
    `;
  }}
`;

const PointsLabel = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.neutral.gray};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
`;

const RewardsLink = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.deepGreen.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  cursor: pointer;
  text-decoration: none;
  transition: opacity 0.2s ease;
  
  &:hover {
    opacity: 0.8;
    text-decoration: underline;
  }
`;

const PointsCard = styled(Card)`
  width: 100%;
  position: relative;
  overflow: visible;
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 1px;
    background-color: ${({ theme }) => theme.colors.neutral.gray};
    opacity: 0.5;
    z-index: 0;
  }
`;

const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[4]};
  position: relative;
  z-index: 1;
`;

const formatPoints = (points: number): string => {
  return points.toLocaleString();
};

export const Points: React.FC<PointsProps> = ({
  points,
  label = 'Points',
  size = 'medium',
  showCard = false,
  showRewardsLink = false,
  onRewardsClick,
  additionalContent,
}) => {
  const pointsDisplay = (
    <PointsContainer size={size}>
      <PointsValue size={size}>{formatPoints(points)}</PointsValue>
      <PointsLabel>{label}</PointsLabel>
    </PointsContainer>
  );
  
  if (!showCard) {
    return pointsDisplay;
  }
  
  return (
    <PointsCard variant="gradient" padding="large">
      <CardContent>
        {pointsDisplay}
        
        {additionalContent}
        
        {showRewardsLink && (
          <RewardsLink onClick={onRewardsClick}>
            See Points & Rewards →
          </RewardsLink>
        )}
      </CardContent>
    </PointsCard>
  );
};