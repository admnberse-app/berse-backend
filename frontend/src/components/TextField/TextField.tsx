import React from 'react';
import styled, { css } from 'styled-components';
import { TextFieldProps } from './TextField.types';

const FieldContainer = styled.div<{ fullWidth?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[1]};
  ${({ fullWidth }) => fullWidth && css`
    width: 100%;
  `}
`;

const Label = styled.label`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.neutral.darkGray};
`;

const InputWrapper = styled.div<{ hasError?: boolean; size?: 'normal' | 'large' }>`
  position: relative;
  display: flex;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.neutral.white};
  border: ${({ theme }) => theme.borders.width.thin} solid ${({ theme, hasError }) => 
    hasError ? theme.colors.earthyRed.primary : theme.colors.neutral.lightGray};
  border-radius: ${({ theme }) => theme.borders.radius.md};
  transition: all 0.2s ease;
  
  ${({ size }) => size === 'large' ? css`
    height: 48px;
  ` : css`
    height: 40px;
  `}
  
  &:focus-within {
    border-color: ${({ theme }) => theme.colors.deepGreen.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.deepGreen.primary}20;
  }
`;

const StyledInput = styled.input`
  flex: 1;
  height: 100%;
  padding: ${({ theme }) => `${theme.spacing[3]} ${theme.spacing[4]}`};
  border: none;
  background: transparent;
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  color: ${({ theme }) => theme.colors.neutral.darkGray};
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.neutral.gray};
  }
  
  &:focus {
    outline: none;
  }
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.neutral.gray};
  
  &.start {
    margin-left: ${({ theme }) => theme.spacing[3]};
  }
  
  &.end {
    margin-right: ${({ theme }) => theme.spacing[3]};
  }
`;

const HelperText = styled.span<{ hasError?: boolean }>`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme, hasError }) => 
    hasError ? theme.colors.earthyRed.primary : theme.colors.neutral.gray};
`;

const RequiredIndicator = styled.span`
  color: ${({ theme }) => theme.colors.earthyRed.primary};
  margin-left: ${({ theme }) => theme.spacing[0.5]};
`;

export const TextField: React.FC<TextFieldProps> = ({
  label,
  helperText,
  error,
  required,
  size = 'normal',
  fullWidth = false,
  startIcon,
  endIcon,
  disabled,
  ...inputProps
}) => {
  const hasError = Boolean(error);
  
  return (
    <FieldContainer fullWidth={fullWidth}>
      {label && (
        <Label>
          {label}
          {required && <RequiredIndicator>*</RequiredIndicator>}
        </Label>
      )}
      
      <InputWrapper hasError={hasError} size={size}>
        {startIcon && <IconWrapper className="start">{startIcon}</IconWrapper>}
        <StyledInput
          disabled={disabled}
          aria-invalid={hasError}
          aria-describedby={error ? 'error-text' : helperText ? 'helper-text' : undefined}
          {...inputProps}
        />
        {endIcon && <IconWrapper className="end">{endIcon}</IconWrapper>}
      </InputWrapper>
      
      {(error || helperText) && (
        <HelperText 
          hasError={hasError} 
          id={hasError ? 'error-text' : 'helper-text'}
        >
          {error || helperText}
        </HelperText>
      )}
    </FieldContainer>
  );
};