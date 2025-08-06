import React from 'react';
import styled from 'styled-components';

interface MainNavProps {
  activeTab: 'home' | 'connect' | 'match' | 'forum';
  onTabPress: (tab: 'home' | 'connect' | 'match' | 'forum') => void;
}

// Outline Icons as SVG components
const HomeIcon = ({ active }: { active: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? '#2D5F4F' : '#B0B0B0'} strokeWidth="2">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9,22 9,12 15,12 15,22"/>
  </svg>
);

const ConnectIcon = ({ active }: { active: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? '#2D5F4F' : '#B0B0B0'} strokeWidth="2">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="m22 21-3-3m0 0a5.5 5.5 0 1 1-8-8 5.5 5.5 0 0 1 8 8z"/>
  </svg>
);

const MatchIcon = ({ active }: { active: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? '#2D5F4F' : '#B0B0B0'} strokeWidth="2">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

const ForumIcon = ({ active }: { active: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? '#2D5F4F' : '#B0B0B0'} strokeWidth="2">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

export const MainNav: React.FC<MainNavProps> = ({ activeTab, onTabPress }) => {
  return (
    <Container>
      <NavButton 
        $active={activeTab === 'home'}
        onClick={() => onTabPress('home')}
      >
        <IconWrapper>
          <HomeIcon active={activeTab === 'home'} />
        </IconWrapper>
        <NavLabel $active={activeTab === 'home'}>Home</NavLabel>
      </NavButton>

      <NavButton 
        $active={activeTab === 'connect'}
        onClick={() => onTabPress('connect')}
      >
        <IconWrapper>
          <ConnectIcon active={activeTab === 'connect'} />
        </IconWrapper>
        <NavLabel $active={activeTab === 'connect'}>Connect</NavLabel>
      </NavButton>

      <NavButton 
        $active={activeTab === 'match'}
        onClick={() => onTabPress('match')}
      >
        <IconWrapper>
          <MatchIcon active={activeTab === 'match'} />
        </IconWrapper>
        <NavLabel $active={activeTab === 'match'}>Match</NavLabel>
      </NavButton>

      <NavButton 
        $active={activeTab === 'forum'}
        onClick={() => onTabPress('forum')}
      >
        <IconWrapper>
          <ForumIcon active={activeTab === 'forum'} />
        </IconWrapper>
        <NavLabel $active={activeTab === 'forum'}>Forum</NavLabel>
      </NavButton>
    </Container>
  );
};

const Container = styled.div`
  position: fixed;
  bottom: 16px;
  left: 16px;
  right: 16px;
  background: #FFFFFF;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 0 8px;
  z-index: 1000;
  max-width: 361px; /* 393px - 32px margins */
  margin: 0 auto;
`;

const NavButton = styled.button<{ $active: boolean }>`
  flex: 1;
  background: none;
  border: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 12px;
  
  &:active {
    transform: scale(0.95);
  }
  
  &:hover {
    background: rgba(45, 95, 79, 0.05);
  }
`;

const IconWrapper = styled.div`
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const NavLabel = styled.span<{ $active: boolean }>`
  font-size: 11px;
  color: ${({ $active }) => $active ? '#2D5F4F' : '#B0B0B0'};
  font-weight: ${({ $active }) => $active ? '500' : '400'};
  text-align: center;
`;