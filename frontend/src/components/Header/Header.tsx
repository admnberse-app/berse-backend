import React from 'react';
import styled from 'styled-components';
import { HeaderProps, HeaderState } from './Header.types';
import { logo } from '../../assets/images';

const HeaderContainer = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing[4]} ${({ theme }) => theme.spacing[5]};
  height: 60px;
  background-color: transparent;
  position: relative;
  margin-top: 50px; /* Account for status bar */
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
`;

const CenterSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 2;
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex: 1;
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.deepGreen.primary};
  margin: 0;
`;

const IconButton = styled.button`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.deepGreen.primary};
  border-radius: ${({ theme }) => theme.borders.radius.full};
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.deepGreen.quinary};
  }
`;

const Logo = styled.img`
  height: 36px;
  width: auto;
`;

// Icon components
const MenuIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="3" y1="6" x2="21" y2="6" strokeLinecap="round"/>
    <line x1="3" y1="12" x2="21" y2="12" strokeLinecap="round"/>
    <line x1="3" y1="18" x2="21" y2="18" strokeLinecap="round"/>
  </svg>
);

const NotificationIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const BackIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const getHeaderTitle = (state: HeaderState): string => {
  const titles: Record<HeaderState, string> = {
    Home: '',
    BerseConnect: 'BerseConnect',
    BerseMatch: 'BerseMatch',
    Profile: 'Profile',
  };
  return titles[state];
};

export const Header: React.FC<HeaderProps> = ({
  state = 'Home',
  showBackButton = false,
  onBackClick,
  onNotificationClick,
  onMenuClick,
}) => {
  const title = getHeaderTitle(state);
  
  return (
    <HeaderContainer>
      <LeftSection>
        {showBackButton ? (
          <IconButton onClick={onBackClick} aria-label="Go back">
            <BackIcon />
          </IconButton>
        ) : (
          <IconButton onClick={onMenuClick} aria-label="Open menu">
            <MenuIcon />
          </IconButton>
        )}
      </LeftSection>
      
      <CenterSection>
        {state === 'Home' ? (
          <Logo src={logo} alt="BerseMuka" />
        ) : (
          <Title>{title}</Title>
        )}
      </CenterSection>
      
      <RightSection>
        <IconButton onClick={onNotificationClick} aria-label="View notifications">
          <NotificationIcon />
        </IconButton>
      </RightSection>
    </HeaderContainer>
  );
};