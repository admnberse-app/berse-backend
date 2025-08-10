import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';

interface StandardHeaderProps {
  title: string;
  subtitle?: string;
  onProfileClick: () => void;
  notificationCount?: number;
}

export const StandardHeader: React.FC<StandardHeaderProps> = ({
  title,
  subtitle = '👆 Tap to open profile menu',
  onProfileClick,
  notificationCount = 5
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <HeaderContainer>
      <HeaderContent>
        <ProfileSection onClick={onProfileClick}>
          <ProfileAvatar>
            {user?.fullName ? user.fullName.split(' ').map(n => n[0]).join('') : 'ZM'}
            <ProfileIndicator>⋯</ProfileIndicator>
          </ProfileAvatar>
          <ProfileInfo>
            <ProfileHint>{subtitle}</ProfileHint>
            <PageTitle>{title}</PageTitle>
          </ProfileInfo>
        </ProfileSection>
        
        <NotificationButton onClick={() => navigate('/notifications')}>
          <NotificationIcon>🔔</NotificationIcon>
          <NotificationBadge>{notificationCount}</NotificationBadge>
        </NotificationButton>
      </HeaderContent>
    </HeaderContainer>
  );
};

// Styled Components
const HeaderContainer = styled.div`
  background: #F5F3EF;
  width: 100%;
  padding: 12px 16px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ProfileSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 12px;
  padding: 6px 12px 6px 6px;
  position: relative;
  border: 1px dashed rgba(74, 103, 65, 0.3);
  background: rgba(74, 103, 65, 0.05);
  
  &:hover {
    background: rgba(74, 103, 65, 0.15);
    transform: translateX(2px) scale(1.02);
    border: 1px dashed rgba(74, 103, 65, 0.6);
  }
`;

const ProfileAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #4A6741;
  color: white;
  font-size: 16px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 3px 12px rgba(74, 103, 65, 0.4);
  border: 3px solid white;
  transition: transform 0.3s ease;
  position: relative;
`;

const ProfileIndicator = styled.div`
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 14px;
  height: 14px;
  background: #2D5F4F;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 8px;
  color: white;
  border: 2px solid white;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
`;

const ProfileInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const ProfileHint = styled.div`
  font-size: 12px;
  color: #666666;
  font-weight: 500;
`;

const PageTitle = styled.div`
  font-size: 18px;
  color: #333333;
  font-weight: 600;
`;

const NotificationButton = styled.button`
  position: relative;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  background: rgba(74, 103, 65, 0.05);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid transparent;
  outline: none;
  
  &:hover {
    background: rgba(74, 103, 65, 0.15);
    transform: scale(1.1);
    border-color: rgba(74, 103, 65, 0.2);
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const NotificationIcon = styled.div`
  font-size: 24px;
  position: relative;
`;

const NotificationBadge = styled.div`
  position: absolute;
  top: 4px;
  right: 4px;
  background: #FF6B6B;
  color: white;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  font-size: 11px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #F5F3EF;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;