import React from 'react';
import styled from 'styled-components';
import { SideMenuProps, MenuItem } from './SideMenu.types';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { logo } from '../../assets/images';

const Overlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: ${({ $isOpen }) => ($isOpen ? 'block' : 'none')};
  z-index: 999;
`;

const MenuContainer = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: ${({ $isOpen }) => ($isOpen ? '0' : '-100%')};
  width: 280px;
  height: 100%;
  background-color: ${({ theme }) => theme.colors.background.paper};
  transition: left 0.3s ease-in-out;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  box-shadow: ${({ theme }) => theme.effects.shadows.medium};
  border-radius: 0 16px 16px 0;
`;

const Header = styled.div`
  padding: ${({ theme }) => theme.spacing.xl};
  background: ${({ theme }) => theme.colors.gradients.primary};
  color: white;
`;

const ProfileSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const Avatar = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.background.paper};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: ${({ theme }) => theme.colors.primary.main};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const ProfileName = styled.h3`
  font-size: ${({ theme }) => theme.typography.heading.h3.fontSize};
  font-weight: ${({ theme }) => theme.typography.heading.h3.fontWeight};
  margin: 0;
`;

const ProfileEmail = styled.p`
  font-size: ${({ theme }) => theme.typography.body.small.fontSize};
  opacity: 0.8;
  margin: 0;
`;

const MenuItems = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing.md} 0;
`;

const MenuItemButton = styled.button`
  width: 100%;
  padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.lg}`};
  background: none;
  border: none;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  cursor: pointer;
  transition: background-color 0.2s;
  text-align: left;

  &:hover {
    background-color: ${({ theme }) => theme.colors.background.hover};
  }
`;

const MenuIcon = styled.span`
  font-size: 24px;
`;

const MenuLabel = styled.span`
  flex: 1;
  font-size: ${({ theme }) => theme.typography.body.medium.fontSize};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const Badge = styled.span`
  background-color: ${({ theme }) => theme.colors.error.main};
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: ${({ theme }) => theme.typography.body.small.fontSize};
  font-weight: ${({ theme }) => theme.typography.body.small.fontWeight};
`;

const Divider = styled.hr`
  border: none;
  height: 1px;
  background-color: ${({ theme }) => theme.colors.divider};
  margin: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.lg}`};
`;

const Footer = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  border-top: 1px solid ${({ theme }) => theme.colors.divider};
`;

const LogoutButton = styled(MenuItemButton)`
  color: ${({ theme }) => theme.colors.error.main};
  
  ${MenuLabel} {
    color: ${({ theme }) => theme.colors.error.main};
  }
`;

export const SideMenu: React.FC<SideMenuProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const menuItems: MenuItem[] = [
    {
      id: 'home',
      label: 'Home',
      icon: '🏠',
      action: () => {
        navigate('/dashboard');
        onClose();
      }
    },
    {
      id: 'forum',
      label: 'Forum',
      icon: '💬',
      action: () => {
        navigate('/forum');
        onClose();
      }
    },
    {
      id: 'events',
      label: 'Events',
      icon: '📅',
      action: () => {
        navigate('/events');
        onClose();
      }
    },
    {
      id: 'rewards',
      label: 'Rewards',
      icon: '🎁',
      action: () => {
        navigate('/rewards');
        onClose();
      }
    },
    {
      id: 'leaderboard',
      label: 'Leaderboard',
      icon: '🏆',
      action: () => {
        navigate('/leaderboard');
        onClose();
      }
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: '✉️',
      action: () => {
        navigate('/messages');
        onClose();
      },
      badge: 3
    }
  ];

  const settingsItems: MenuItem[] = [
    {
      id: 'settings',
      label: 'Settings',
      icon: '⚙️',
      action: () => {
        navigate('/settings');
        onClose();
      }
    },
    {
      id: 'help',
      label: 'Help & Support',
      icon: '❓',
      action: () => {
        navigate('/help');
        onClose();
      }
    },
    {
      id: 'about',
      label: 'About',
      icon: 'ℹ️',
      action: () => {
        navigate('/about');
        onClose();
      }
    }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
    onClose();
  };

  return (
    <>
      <Overlay $isOpen={isOpen} onClick={onClose} />
      <MenuContainer $isOpen={isOpen}>
        <Header>
          <ProfileSection>
            <Avatar>{user?.fullName?.charAt(0).toUpperCase() || 'U'}</Avatar>
            <ProfileName>{user?.fullName || 'User'}</ProfileName>
            <ProfileEmail>{user?.email || ''}</ProfileEmail>
          </ProfileSection>
        </Header>

        <MenuItems>
          {menuItems.map((item) => (
            <MenuItemButton key={item.id} onClick={item.action}>
              <MenuIcon>{item.icon}</MenuIcon>
              <MenuLabel>{item.label}</MenuLabel>
              {item.badge && <Badge>{item.badge}</Badge>}
            </MenuItemButton>
          ))}

          <Divider />

          {settingsItems.map((item) => (
            <MenuItemButton key={item.id} onClick={item.action}>
              <MenuIcon>{item.icon}</MenuIcon>
              <MenuLabel>{item.label}</MenuLabel>
            </MenuItemButton>
          ))}
        </MenuItems>

        <Footer>
          <LogoutButton onClick={handleLogout}>
            <MenuIcon>🚪</MenuIcon>
            <MenuLabel>Logout</MenuLabel>
          </LogoutButton>
        </Footer>
      </MenuContainer>
    </>
  );
};