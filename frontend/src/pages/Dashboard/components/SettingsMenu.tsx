import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  IconButton,
  Divider,
  Switch,
  Avatar,
} from '@mui/material';
import {
  Close,
  Person,
  Lock,
  Notifications,
  Payment,
  Language,
  Help,
  Logout,
  DarkMode,
  Security,
  PrivacyTip,
  Palette,
  Storage,
} from '@mui/icons-material';
import styled from 'styled-components';

interface SettingsMenuProps {
  open: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
}

const MenuHeader = styled(Box)`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  color: white;
`;

const SettingsMenu: React.FC<SettingsMenuProps> = ({
  open,
  onClose,
  onNavigate,
}) => {
  const [darkMode, setDarkMode] = React.useState(false);
  const [notifications, setNotifications] = React.useState(true);

  const menuItems = [
    {
      id: 'profile',
      label: 'Edit Profile',
      icon: <Person />,
      action: () => onNavigate('/profile/edit'),
    },
    {
      id: 'privacy',
      label: 'Privacy Settings',
      icon: <PrivacyTip />,
      action: () => onNavigate('/settings/privacy'),
    },
    {
      id: 'security',
      label: 'Security',
      icon: <Security />,
      action: () => onNavigate('/settings/security'),
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: <Notifications />,
      action: () => onNavigate('/settings/notifications'),
      toggle: true,
      value: notifications,
      onChange: setNotifications,
    },
    {
      id: 'payment',
      label: 'Payment Methods',
      icon: <Payment />,
      action: () => onNavigate('/settings/payment'),
    },
    {
      id: 'language',
      label: 'Language',
      icon: <Language />,
      action: () => onNavigate('/settings/language'),
    },
    {
      id: 'theme',
      label: 'Dark Mode',
      icon: <DarkMode />,
      toggle: true,
      value: darkMode,
      onChange: setDarkMode,
    },
    {
      id: 'storage',
      label: 'Storage & Data',
      icon: <Storage />,
      action: () => onNavigate('/settings/storage'),
    },
    {
      id: 'help',
      label: 'Help & Support',
      icon: <Help />,
      action: () => onNavigate('/help'),
    },
  ];

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      // Clear local storage
      localStorage.clear();
      sessionStorage.clear();
      // Navigate to login
      onNavigate('/login');
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: 320 }
      }}
    >
      <MenuHeader>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Settings</Typography>
          <IconButton onClick={onClose} sx={{ color: 'white' }}>
            <Close />
          </IconButton>
        </Box>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar
            src="/avatars/user.jpg"
            sx={{ width: 56, height: 56 }}
          />
          <Box>
            <Typography variant="subtitle1" fontWeight="bold">
              Ahmad Rahman
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              @ahmad_r • Level 4
            </Typography>
          </Box>
        </Box>
      </MenuHeader>

      <List>
        {menuItems.map((item) => (
          <ListItem
            key={item.id}
            button={!item.toggle}
            onClick={item.toggle ? undefined : item.action}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
            {item.toggle && (
              <Switch
                edge="end"
                checked={item.value}
                onChange={(e) => item.onChange?.(e.target.checked)}
              />
            )}
          </ListItem>
        ))}
        
        <Divider sx={{ my: 2 }} />
        
        <ListItem button onClick={handleLogout}>
          <ListItemIcon>
            <Logout color="error" />
          </ListItemIcon>
          <ListItemText 
            primary="Logout"
            primaryTypographyProps={{ color: 'error' }}
          />
        </ListItem>
      </List>

      <Box p={2} mt="auto">
        <Typography variant="caption" color="text.secondary" display="block" textAlign="center">
          BerseMuka v1.0.0
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block" textAlign="center">
          © 2024 BerseMuka. All rights reserved.
        </Typography>
      </Box>
    </Drawer>
  );
};

export default SettingsMenu;