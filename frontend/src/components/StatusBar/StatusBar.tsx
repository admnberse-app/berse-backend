import React from 'react';
import styled, { css } from 'styled-components';
import { StatusBarProps } from './StatusBar.types';

const StatusBarContainer = styled.div<{ $showBackground: boolean; $darkMode: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 ${({ theme }) => theme.spacing[5]};
  z-index: ${({ theme }) => theme.zIndex.statusBar};
  
  ${({ $showBackground, theme }) => $showBackground ? css`
    background: ${theme.colors.gradient.fadeToTransparent};
    backdrop-filter: blur(0px);
  ` : css`
    background: transparent;
  `}
  
  ${({ $darkMode, theme }) => $darkMode && css`
    color: ${theme.colors.neutral.white};
  `}
`;

const Time = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.neutral.darkGray};
`;

const Icons = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1]};
`;

const Icon = styled.div`
  width: 18px;
  height: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SignalIcon = () => (
  <svg width="18" height="12" viewBox="0 0 18 12" fill="none">
    <rect x="0" y="7" width="3" height="5" rx="1" fill="currentColor" opacity="0.4"/>
    <rect x="5" y="5" width="3" height="7" rx="1" fill="currentColor" opacity="0.6"/>
    <rect x="10" y="3" width="3" height="9" rx="1" fill="currentColor" opacity="0.8"/>
    <rect x="15" y="0" width="3" height="12" rx="1" fill="currentColor"/>
  </svg>
);

const WifiIcon = () => (
  <svg width="15" height="11" viewBox="0 0 15 11" fill="none">
    <path d="M7.5 10C8.33 10 9 9.33 9 8.5C9 7.67 8.33 7 7.5 7C6.67 7 6 7.67 6 8.5C6 9.33 6.67 10 7.5 10Z" fill="currentColor"/>
    <path d="M10.5 6C10.5 6 9.5 5 7.5 5C5.5 5 4.5 6 4.5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M12.5 3.5C12.5 3.5 10.5 2 7.5 2C4.5 2 2.5 3.5 2.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M14.5 1C14.5 1 11.5 0 7.5 0C3.5 0 0.5 1 0.5 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const BatteryIcon = () => (
  <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
    <rect x="1" y="2" width="21" height="8" rx="2" stroke="currentColor" strokeWidth="1"/>
    <rect x="2.5" y="3.5" width="18" height="5" rx="1" fill="currentColor"/>
    <rect x="22.5" y="5" width="1.5" height="2" rx="0.5" fill="currentColor"/>
  </svg>
);

export const StatusBar: React.FC<StatusBarProps> = ({
  time = '3:14',
  darkMode = false,
  showBackground = true,
}) => {
  return (
    <StatusBarContainer $showBackground={showBackground} $darkMode={darkMode}>
      <Time>{time}</Time>
      <Icons>
        <Icon><SignalIcon /></Icon>
        <Icon><WifiIcon /></Icon>
        <Icon><BatteryIcon /></Icon>
      </Icons>
    </StatusBarContainer>
  );
};