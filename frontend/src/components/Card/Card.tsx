import React from 'react';
import styled, { css } from 'styled-components';
import { CardProps } from './Card.types';

const StyledCard = styled.div<CardProps>`
  background-color: ${({ theme, variant }) => 
    variant === 'gradient' ? 'transparent' : theme.colors.neutral.white};
  border-radius: ${({ theme }) => theme.borders.radius.lg};
  overflow: hidden;
  transition: all 0.2s ease;
  
  ${({ variant, theme }) => variant === 'gradient' && css`
    background: ${theme.colors.gradient.primaryToNavy};
    color: ${theme.colors.neutral.white};
  `}
  
  ${({ padding, theme }) => {
    const paddingMap = {
      none: '0',
      small: theme.spacing[3],
      medium: theme.spacing[6],
      large: theme.spacing[8],
    };
    return css`
      padding: ${paddingMap[padding || 'medium']};
    `;
  }}
  
  ${({ shadow, theme }) => shadow && css`
    box-shadow: ${theme.effects.shadow.md};
  `}
  
  ${({ clickable }) => clickable && css`
    cursor: pointer;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: ${({ theme }) => theme.effects.shadow.lg};
    }
    
    &:active {
      transform: translateY(0);
    }
  `}
`;

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  clickable = false,
  onClick,
  className,
  padding = 'medium',
  shadow = true,
}) => {
  return (
    <StyledCard
      variant={variant}
      clickable={clickable}
      onClick={clickable ? onClick : undefined}
      className={className}
      padding={padding}
      shadow={shadow}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
    >
      {children}
    </StyledCard>
  );
};