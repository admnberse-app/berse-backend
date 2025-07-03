import React from 'react';
import styled, { css } from 'styled-components';
import { MainNavProps, NavTab } from './MainNav.types';

const NavContainer = styled.nav`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 103px;
  background-color: ${({ theme }) => theme.colors.neutral.white};
  border-top: 1px solid ${({ theme }) => theme.colors.neutral.lightGray};
  display: flex;
  align-items: flex-start;
  justify-content: space-around;
  padding: ${({ theme }) => theme.spacing[3]} ${({ theme }) => theme.spacing[4]} ${({ theme }) => theme.spacing[6]};
  z-index: ${({ theme }) => theme.zIndex.navbar};
`;

const NavItem = styled.button<{ isActive: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1]};
  background: transparent;
  border: none;
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing[2]};
  border-radius: ${({ theme }) => theme.borders.radius.sm};
  transition: all 0.2s ease;
  
  ${({ isActive, theme }) => isActive && css`
    color: ${theme.colors.deepGreen.primary};
  `}
  
  ${({ isActive, theme }) => !isActive && css`
    color: ${theme.colors.neutral.gray};
  `}
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.deepGreen.quinary};
  }
`;

const IconWrapper = styled.div`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Label = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
`;

// Icon components
const HomeIcon = ({ active }: { active: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ConnectIcon = ({ active }: { active: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="9" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const MatchIcon = ({ active }: { active: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ProfileIcon = ({ active }: { active: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const navItems: { tab: NavTab; label: string; Icon: React.FC<{ active: boolean }> }[] = [
  { tab: 'Home', label: 'Home', Icon: HomeIcon },
  { tab: 'BerseConnect', label: 'Connect', Icon: ConnectIcon },
  { tab: 'BerseMatch', label: 'Match', Icon: MatchIcon },
  { tab: 'Profile', label: 'Profile', Icon: ProfileIcon },
];

export const MainNav: React.FC<MainNavProps> = ({
  activeTab = 'Home',
  onTabClick,
}) => {
  return (
    <NavContainer>
      {navItems.map(({ tab, label, Icon }) => (
        <NavItem
          key={tab}
          isActive={activeTab === tab}
          onClick={() => onTabClick?.(tab)}
          aria-label={`Navigate to ${label}`}
        >
          <IconWrapper>
            <Icon active={activeTab === tab} />
          </IconWrapper>
          <Label>{label}</Label>
        </NavItem>
      ))}
    </NavContainer>
  );
};