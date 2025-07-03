import React from 'react';
import styled, { css } from 'styled-components';
import { ButtonProps } from './Button.types';

const StyledButton = styled.button<ButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  border-radius: ${({ theme, size }) => 
    size === 'small' ? theme.borders.radius.sm : theme.borders.radius.md};
  transition: all 0.2s ease-in-out;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  
  ${({ fullWidth }) => fullWidth && css`
    width: 100%;
  `}
  
  ${({ disabled }) => disabled && css`
    cursor: not-allowed;
    opacity: 0.6;
  `}
  
  /* Size variants */
  ${({ size, theme }) => {
    if (size === 'large') {
      return css`
        padding: ${theme.spacing[5]} ${theme.spacing[6]};
        font-size: ${theme.typography.fontSize.lg};
        min-height: 56px;
      `;
    }
    
    if (size === 'small') {
      return css`
        padding: ${theme.spacing[3]} ${theme.spacing[3]};
        font-size: ${theme.typography.fontSize.sm};
        min-height: 40px;
      `;
    }
    
    // Default 'normal' size
    return css`
      padding: ${theme.spacing[4]};
      font-size: ${theme.typography.fontSize.base};
      min-height: 52px;
    `;
  }}
  
  /* Variant styles */
  ${({ variant, color, theme }) => {
    if (variant === 'primary' && color === 'green') {
      return css`
        background-color: ${theme.colors.deepGreen.primary};
        color: ${theme.colors.neutral.white};
        border: none;
        
        &:hover:not(:disabled) {
          background-color: ${theme.colors.deepGreen.secondary};
        }
        
        &:active:not(:disabled) {
          transform: scale(0.98);
        }
      `;
    }
    
    if (variant === 'secondary' && color === 'green') {
      return css`
        background-color: transparent;
        color: ${theme.colors.deepGreen.primary};
        border: ${theme.borders.width.thin} solid ${theme.colors.deepGreen.primary};
        
        &:hover:not(:disabled) {
          background-color: ${theme.colors.deepGreen.primary};
          color: ${theme.colors.neutral.white};
        }
        
        &:active:not(:disabled) {
          transform: scale(0.98);
        }
      `;
    }
    
    // Default primary variant
    if (variant === 'primary') {
      return css`
        background-color: ${theme.colors.primary.main};
        color: ${theme.colors.common.white};
        border: none;
        
        &:hover:not(:disabled) {
          background-color: ${theme.colors.primary.dark};
        }
        
        &:active:not(:disabled) {
          transform: scale(0.98);
        }
      `;
    }
    
    // Outline variant
    if (variant === 'outline') {
      return css`
        background-color: transparent;
        color: ${theme.colors.primary.main};
        border: ${theme.borders.width.thin} solid ${theme.colors.border.light};
        
        &:hover:not(:disabled) {
          background-color: ${theme.colors.background.paper};
          border-color: ${theme.colors.primary.main};
        }
        
        &:active:not(:disabled) {
          transform: scale(0.98);
        }
      `;
    }
    
    // Danger variant
    if (variant === 'danger') {
      return css`
        background-color: ${theme.colors.status.error};
        color: ${theme.colors.common.white};
        border: none;
        
        &:hover:not(:disabled) {
          background-color: ${theme.colors.earthyRed.secondary};
        }
        
        &:active:not(:disabled) {
          transform: scale(0.98);
        }
      `;
    }
    
    // Default secondary
    return css`
      background-color: ${theme.colors.background.paper};
      color: ${theme.colors.text.primary};
      border: ${theme.borders.width.thin} solid ${theme.colors.border.light};
      
      &:hover:not(:disabled) {
        background-color: ${theme.colors.background.default};
      }
      
      &:active:not(:disabled) {
        transform: scale(0.98);
      }
    `;
  }}
  
  /* Loading state */
  ${({ loading }) => loading && css`
    color: transparent;
    pointer-events: none;
    
    &::after {
      content: '';
      position: absolute;
      width: 16px;
      height: 16px;
      margin: auto;
      border: 2px solid transparent;
      border-radius: 50%;
      border-top-color: currentColor;
      animation: spin 0.6s linear infinite;
    }
    
    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
  `}
`;

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  color = 'green',
  size = 'normal',
  fullWidth = false,
  loading = false,
  children,
  disabled,
  ...props
}) => {
  return (
    <StyledButton
      variant={variant}
      color={color}
      size={size}
      fullWidth={fullWidth}
      loading={loading}
      disabled={disabled || loading}
      {...props}
    >
      {children}
    </StyledButton>
  );
};