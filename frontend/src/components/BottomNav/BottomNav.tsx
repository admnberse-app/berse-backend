import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';

const NavContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  max-width: 393px;
  margin: 0 auto;
  background-color: white;
  padding: 16px;
  border-top: 1px solid #E5E5E5;
  display: flex;
  justify-content: space-around;
  z-index: 100;
`;

const NavButton = styled.button<{ $active?: boolean }>`
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s ease;
  
  ${({ $active }) => $active && `
    background-color: #E8F4F0;
    color: #2D5F4F;
  `}
  
  &:hover {
    background-color: #F0F0F0;
  }
`;

const NavIcon = styled.span`
  font-size: 20px;
`;

const NavLabel = styled.span`
  font-size: 10px;
  font-weight: 500;
`;

interface BottomNavProps {
  activeTab?: string;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine active tab from current route if not provided
  const currentActiveTab = activeTab || (() => {
    const path = location.pathname;
    if (path === '/dashboard') return 'home';
    if (path === '/connect') return 'connect';
    if (path === '/match') return 'match';
    if (path === '/forum') return 'forum';
    if (path === '/profile' || path === '/profile/edit' || path === '/settings') return 'profile';
    return 'home';
  })();

  return (
    <NavContainer>
      <NavButton 
        $active={currentActiveTab === 'home'}
        onClick={() => navigate('/dashboard')}
      >
        <NavIcon>🏠</NavIcon>
        <NavLabel>Home</NavLabel>
      </NavButton>
      
      <NavButton 
        $active={currentActiveTab === 'connect'}
        onClick={() => navigate('/connect')}
      >
        <NavIcon>🤝</NavIcon>
        <NavLabel>Connect</NavLabel>
      </NavButton>
      
      <NavButton 
        $active={currentActiveTab === 'match'}
        onClick={() => navigate('/match')}
      >
        <NavIcon>💫</NavIcon>
        <NavLabel>Match</NavLabel>
      </NavButton>
      
      <NavButton 
        $active={currentActiveTab === 'forum'}
        onClick={() => navigate('/forum')}
      >
        <NavIcon>👥</NavIcon>
        <NavLabel>Forum</NavLabel>
      </NavButton>
      
      <NavButton 
        $active={currentActiveTab === 'profile'}
        onClick={() => navigate('/profile')}
      >
        <NavIcon>👤</NavIcon>
        <NavLabel>Profile</NavLabel>
      </NavButton>
    </NavContainer>
  );
};