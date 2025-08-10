import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { StatusBar } from '../components/StatusBar/StatusBar';
import { MainNav } from '../components/MainNav';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #F9F3E3;
  max-width: 393px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background-color: #F9F3E3;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: #333;
  font-size: 16px;
  cursor: pointer;
`;

const HeaderTitle = styled.h1`
  margin: 0;
  font-size: 18px;
  font-weight: bold;
  color: #2D5F4F;
`;

const Content = styled.div`
  flex: 1;
  padding: 0 20px 100px 20px;
  overflow-y: auto;
`;

const SettingsSection = styled.div`
  margin-bottom: 24px;
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #2D5F4F;
  margin: 0 0 16px 0;
`;

const SettingsCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
`;

const SettingsItem = styled.div<{ hasToggle?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #F0F0F0;
  cursor: ${({ hasToggle }) => hasToggle ? 'default' : 'pointer'};
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background-color: ${({ hasToggle }) => hasToggle ? 'transparent' : '#f9f9f9'};
  }
`;

const ItemLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ItemIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #E8F4F0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
`;

const ItemText = styled.div``;

const ItemTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 2px;
`;

const ItemSubtitle = styled.div`
  font-size: 12px;
  color: #666;
`;

const ItemRight = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ChevronIcon = styled.div`
  color: #999;
  font-size: 16px;
`;

const Toggle = styled.div<{ active: boolean }>`
  width: 44px;
  height: 24px;
  border-radius: 12px;
  background-color: ${({ active }) => active ? '#2D5F4F' : '#E5E5E5'};
  position: relative;
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: ${({ active }) => active ? '22px' : '2px'};
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background-color: white;
    transition: left 0.2s ease;
  }
`;

const LogoutButton = styled.button`
  width: 100%;
  background-color: #FF4444;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 16px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 24px;
  
  &:hover {
    background-color: #E03E3E;
  }
`;

const VersionInfo = styled.div`
  text-align: center;
  color: #999;
  font-size: 12px;
  margin-top: 24px;
  padding: 16px;
`;

export const SettingsScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [locationServices, setLocationServices] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const settingsData = [
    {
      title: 'Account',
      items: [
        {
          icon: '👤',
          title: 'Edit Profile',
          subtitle: 'Update your personal information',
          action: () => navigate('/profile/edit')
        },
        {
          icon: '🔒',
          title: 'Privacy & Security',
          subtitle: 'Manage your account security',
          action: () => navigate('/settings/privacy')
        },
        {
          icon: '📧',
          title: 'Email & Password',
          subtitle: 'Change email or password',
          action: () => navigate('/settings/account')
        }
      ]
    },
    {
      title: 'Notifications',
      items: [
        {
          icon: '🔔',
          title: 'Push Notifications',
          subtitle: 'Get notified about events and matches',
          toggle: true,
          value: pushNotifications,
          onChange: setPushNotifications
        },
        {
          icon: '📨',
          title: 'Email Notifications',
          subtitle: 'Receive updates via email',
          toggle: true,
          value: emailNotifications,
          onChange: setEmailNotifications
        }
      ]
    },
    {
      title: 'App Preferences',
      items: [
        {
          icon: '🌙',
          title: 'Dark Mode',
          subtitle: 'Switch to dark theme',
          toggle: true,
          value: darkMode,
          onChange: setDarkMode
        },
        {
          icon: '📍',
          title: 'Location Services',
          subtitle: 'Find events and people nearby',
          toggle: true,
          value: locationServices,
          onChange: setLocationServices
        },
        {
          icon: '🌍',
          title: 'Language',
          subtitle: 'English (Malaysia)',
          action: () => navigate('/settings/language')
        }
      ]
    },
    {
      title: 'Support',
      items: [
        {
          icon: '❓',
          title: 'Help Center',
          subtitle: 'Get help and support',
          action: () => navigate('/help')
        },
        {
          icon: '📞',
          title: 'Contact Us',
          subtitle: 'Send feedback or report issues',
          action: () => navigate('/contact')
        },
        {
          icon: '⭐',
          title: 'Rate App',
          subtitle: 'Leave a review on the App Store',
          action: () => window.open('https://apps.apple.com', '_blank')
        }
      ]
    },
    {
      title: 'Legal',
      items: [
        {
          icon: '📄',
          title: 'Terms of Service',
          subtitle: 'View our terms and conditions',
          action: () => navigate('/terms')
        },
        {
          icon: '🔐',
          title: 'Privacy Policy',
          subtitle: 'How we handle your data',
          action: () => navigate('/privacy')
        },
        {
          icon: 'ℹ️',
          title: 'About BerseMuka',
          subtitle: 'Learn more about our mission',
          action: () => navigate('/about')
        }
      ]
    }
  ];

  return (
    <Container>
      <StatusBar />
      
      {/* Standardized Header */}
      <div style={{
        background: '#F9F3E3',
        width: '100%',
        padding: '12px 16px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: '#4A6741',
              color: 'white',
              fontSize: '16px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              ZM
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <div style={{ fontSize: '12px', color: '#999999', fontWeight: 'normal' }}>App Preferences & Account</div>
              <div style={{ fontSize: '18px', color: '#333333', fontWeight: '600' }}>Settings</div>
            </div>
          </div>
          <div style={{
            background: '#FF6B6B',
            color: 'white',
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            fontSize: '12px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>3</div>
        </div>
      </div>

      <Content>
        {settingsData.map((section, sectionIndex) => (
          <SettingsSection key={sectionIndex}>
            <SectionTitle>{section.title}</SectionTitle>
            <SettingsCard>
              {section.items.map((item, itemIndex) => (
                <SettingsItem
                  key={itemIndex}
                  hasToggle={item.toggle}
                  onClick={item.action}
                >
                  <ItemLeft>
                    <ItemIcon>{item.icon}</ItemIcon>
                    <ItemText>
                      <ItemTitle>{item.title}</ItemTitle>
                      <ItemSubtitle>{item.subtitle}</ItemSubtitle>
                    </ItemText>
                  </ItemLeft>
                  <ItemRight>
                    {item.toggle ? (
                      <Toggle
                        active={item.value || false}
                        onClick={(e) => {
                          e.stopPropagation();
                          item.onChange?.(!item.value);
                        }}
                      />
                    ) : (
                      <ChevronIcon>›</ChevronIcon>
                    )}
                  </ItemRight>
                </SettingsItem>
              ))}
            </SettingsCard>
          </SettingsSection>
        ))}

        <LogoutButton onClick={handleLogout}>
          🚪 Sign Out
        </LogoutButton>

        <VersionInfo>
          BerseMuka App Version 1.0.0<br />
          Build 2025.01.30
        </VersionInfo>
      </Content>

      <MainNav 
        activeTab="home"
        onTabPress={(tab) => {
          switch (tab) {
            case 'home':
              navigate('/dashboard');
              break;
            case 'connect':
              navigate('/connect');
              break;
            case 'match':
              navigate('/match');
              break;
            case 'forum':
              navigate('/forum');
              break;
          }
        }}
      />
    </Container>
  );
};