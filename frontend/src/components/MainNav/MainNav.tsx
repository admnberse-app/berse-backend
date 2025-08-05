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
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 8px 20px 20px;
  border-top: 1px solid rgba(229, 229, 229, 0.5);
  display: flex;
  justify-content: space-around;
  align-items: center;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
`;

const NavItem = styled.button<{ active: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 12px;
  transition: all 0.2s ease;
  min-width: 60px;
  
  ${({ active, theme }) => active && `
    background-color: ${theme.colors.deepGreen.quinary};
    transform: translateY(-2px);
  `}
  
  &:hover {
    transform: translateY(-1px);
    background-color: ${({ theme }) => theme.colors.deepGreen.quinary};
  }
`;

const NavIcon = styled.div<{ active: boolean }>`
  font-size: 20px;
  transition: all 0.2s ease;
  color: ${({ active, theme }) => active ? theme.colors.primary.main : theme.colors.text.secondary};
  
  // Add a subtle scale effect for active state
  ${({ active }) => active && `
    transform: scale(1.1);
  `}
`;

const NavLabel = styled.div<{ active: boolean }>`
  font-size: 10px;
  font-weight: ${({ active }) => active ? 600 : 500};
  color: ${({ active, theme }) => active ? theme.colors.primary.main : theme.colors.text.secondary};
  transition: all 0.2s ease;
`;

interface MainNavProps {
  activeTab?: string;
  onTabPress?: (tab: string) => void;
}

export const MainNav: React.FC<MainNavProps> = ({ activeTab, onTabPress }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine active tab from current route if not provided
  const getCurrentTab = () => {
    if (activeTab) return activeTab;
    
    const path = location.pathname;
    if (path === '/dashboard' || path === '/') return 'home';
    if (path === '/connect') return 'connect';
    if (path === '/match') return 'match';
    if (path === '/forum') return 'forum';
    if (path === '/profile') return 'profile';
    return 'home';
  };

  const currentTab = getCurrentTab();

  const navItems = [
    { 
      id: 'home', 
      icon: '🏠', 
      label: 'Home',
      route: '/dashboard'
    },
    { 
      id: 'connect', 
      icon: '🌟', 
      label: 'Connect',
      route: '/connect'
    },
    { 
      id: 'match', 
      icon: '💫', 
      label: 'Match',
      route: '/match'
    },
    { 
      id: 'forum', 
      icon: '💬', 
      label: 'Forum',
      route: '/forum'
    },
    { 
      id: 'profile', 
      icon: '👤', 
      label: 'Profile',
      route: '/profile'
    }
  ];

  const handleTabPress = (item: typeof navItems[0]) => {
    // Call the onTabPress prop if provided
    if (onTabPress) {
      onTabPress(item.id);
    }
    
    // Navigate to the route
    navigate(item.route);
  };

  return (
    <NavContainer>
      {navItems.map((item) => (
        <NavItem
          key={item.id}
          active={currentTab === item.id}
          onClick={() => handleTabPress(item)}
        >
          <NavIcon active={currentTab === item.id}>
            {item.icon}
          </NavIcon>
          <NavLabel active={currentTab === item.id}>
            {item.label}
          </NavLabel>
        </NavItem>
      ))}
    </NavContainer>
  );
};