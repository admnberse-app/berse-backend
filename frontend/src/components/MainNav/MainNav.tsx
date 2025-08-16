import React from 'react';
import styled from 'styled-components';

interface MainNavProps {
  activeTab: 'home' | 'connect' | 'match' | 'market';
  onTabPress: (tab: 'home' | 'connect' | 'match' | 'market') => void;
}

// Outline Icons as SVG components
const HomeIcon = ({ active }: { active: boolean }) => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={active ? '#2fce98' : '#B0B0B0'} strokeWidth="2">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9,22 9,12 15,12 15,22"/>
  </svg>
);

const EventsIcon = ({ active }: { active: boolean }) => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={active ? '#2fce98' : '#B0B0B0'} strokeWidth="2">
    <path d="M3 7h14l1 1v8l-1 1H3l-1-1V8l1-1z"/>
    <path d="M18 7h3v10h-3"/>
    <path strokeDasharray="2 2" d="M18 8v8"/>
    <circle cx="8" cy="12" r="1.5"/>
    <circle cx="13" cy="12" r="1.5"/>
  </svg>
);

const ProfilesIcon = ({ active }: { active: boolean }) => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={active ? '#2fce98' : '#B0B0B0'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="5" r="2.5"/>
    <circle cx="6" cy="8" r="2"/>
    <circle cx="18" cy="8" r="2"/>
    <path d="M12 8.5c2 0 3.5 1 3.5 2.5v5h-7v-5c0-1.5 1.5-2.5 3.5-2.5z"/>
    <path d="M6 11c1.5 0 2.5 0.5 2.5 2v5h-5v-5c0-1.5 1-2 2.5-2z"/>
    <path d="M18 11c-1.5 0-2.5 0.5-2.5 2v5h5v-5c0-1.5-1-2-2.5-2z"/>
  </svg>
);

const MarketIcon = ({ active }: { active: boolean }) => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={active ? '#2fce98' : '#B0B0B0'} strokeWidth="2">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 0 1-8 0"/>
  </svg>
);

export const MainNav: React.FC<MainNavProps> = ({ activeTab, onTabPress }) => {
  return (
    <Container>
      <NavButton 
        $active={activeTab === 'home'}
        onClick={() => {
          console.log('Home button clicked');
          onTabPress('home');
        }}
      >
        <IconWrapper>
          <HomeIcon active={activeTab === 'home'} />
        </IconWrapper>
        <NavLabel $active={activeTab === 'home'}>Home</NavLabel>
      </NavButton>

      <NavButton 
        $active={activeTab === 'connect'}
        onClick={() => {
          console.log('Events button clicked');
          onTabPress('connect');
        }}
      >
        <IconWrapper>
          <EventsIcon active={activeTab === 'connect'} />
        </IconWrapper>
        <NavLabel $active={activeTab === 'connect'}>Events</NavLabel>
      </NavButton>

      <NavButton 
        $active={activeTab === 'match'}
        onClick={() => {
          console.log('Profiles button clicked');
          onTabPress('match');
        }}
      >
        <IconWrapper>
          <ProfilesIcon active={activeTab === 'match'} />
        </IconWrapper>
        <NavLabel $active={activeTab === 'match'}>Profiles</NavLabel>
      </NavButton>

      <NavButton 
        $active={activeTab === 'market'}
        onClick={() => {
          console.log('Market button clicked');
          onTabPress('market');
        }}
      >
        <IconWrapper>
          <MarketIcon active={activeTab === 'market'} />
        </IconWrapper>
        <NavLabel $active={activeTab === 'market'}>Market</NavLabel>
      </NavButton>
    </Container>
  );
};

const Container = styled.div`
  position: fixed;
  bottom: 10px;
  left: 14px;
  right: 14px;
  background: #FFFFFF;
  border-radius: 24px;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.12);
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 0 4px;
  z-index: 100;
  max-width: 369px; /* 393px - 24px margins */
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
  padding: 10px 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 8px;
  pointer-events: auto;
  position: relative;
  z-index: 1;
  
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
  
  svg {
    width: 32px;
    height: 32px;
  }
`;

const NavLabel = styled.span<{ $active: boolean }>`
  font-size: 12px;
  color: ${({ $active }) => $active ? '#2fce98' : '#B0B0B0'};
  font-weight: ${({ $active }) => $active ? '600' : '400'};
  text-align: center;
  line-height: 1;
  margin-top: 2px;
`;