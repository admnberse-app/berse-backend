import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { NotificationPanelProps } from './NotificationPanel.types';
import { useNavigate } from 'react-router-dom';
import notificationService from '../../services/notification.service';
import { Notification } from '../../types';

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

const PanelContainer = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  right: ${({ $isOpen }) => ($isOpen ? '0' : '-100%')};
  width: 320px;
  height: 100%;
  background-color: ${({ theme }) => theme.colors.background.paper};
  transition: right 0.3s ease-in-out;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  box-shadow: ${({ theme }) => theme.effects.shadows.medium};
  border-radius: 16px 0 0 16px;
`;

const Header = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  border-bottom: 1px solid ${({ theme }) => theme.colors.divider};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Title = styled.h2`
  font-size: ${({ theme }) => theme.typography.heading.h3.fontSize};
  font-weight: ${({ theme }) => theme.typography.heading.h3.fontWeight};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  padding: ${({ theme }) => theme.spacing.sm};
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text.secondary};
  transition: color 0.2s;

  &:hover {
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const NotificationsList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing.md} 0;
`;

const NotificationItem = styled.div<{ unread: boolean }>`
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  background-color: ${({ theme, unread }) =>
    unread ? theme.colors.background.hover : 'transparent'};
  cursor: pointer;
  transition: background-color 0.2s;
  position: relative;

  &:hover {
    background-color: ${({ theme }) => theme.colors.background.hover};
  }

  &::before {
    content: '';
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: ${({ theme }) => theme.colors.primary.main};
    display: ${({ unread }) => (unread ? 'block' : 'none')};
  }
`;

const NotificationContent = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  align-items: flex-start;
`;

const Avatar = styled.div<{ type: string }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${({ theme, type }) => {
    const colors: Record<string, string> = {
      EVENT: theme.colors.success.light,
      MATCH: theme.colors.primary.light,
      POINTS: theme.colors.warning.light,
      MESSAGE: theme.colors.info.light,
      SYSTEM: theme.colors.neutral[200],
    };
    return colors[type] || theme.colors.neutral[200];
  }};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const NotificationText = styled.div`
  flex: 1;
`;

const NotificationTitle = styled.h4`
  font-size: ${({ theme }) => theme.typography.body.medium.fontSize};
  font-weight: ${({ theme }) => theme.typography.body.medium.fontWeight};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 ${({ theme }) => theme.spacing.xs} 0;
`;

const NotificationMessage = styled.p`
  font-size: ${({ theme }) => theme.typography.body.small.fontSize};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0 0 ${({ theme }) => theme.spacing.xs} 0;
`;

const NotificationTime = styled.span`
  font-size: ${({ theme }) => theme.typography.body.small.fontSize};
  color: ${({ theme }) => theme.colors.text.disabled};
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: ${({ theme }) => theme.spacing.xl};
  text-align: center;
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const EmptyText = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.body.medium.fontSize};
`;

const ActionButtons = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  border-top: 1px solid ${({ theme }) => theme.colors.divider};
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const ActionButton = styled.button`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: none;
  border: 1px solid ${({ theme }) => theme.colors.divider};
  border-radius: ${({ theme }) => theme.borders.radius.md};
  cursor: pointer;
  font-size: ${({ theme }) => theme.typography.body.small.fontSize};
  color: ${({ theme }) => theme.colors.text.secondary};
  transition: all 0.2s;

  &:hover {
    background-color: ${({ theme }) => theme.colors.background.hover};
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      const response = await notificationService.getNotifications();
      setNotifications(response.notifications);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    const icons: Record<string, string> = {
      EVENT: '📅',
      MATCH: '💫',
      POINTS: '⭐',
      MESSAGE: '💬',
      SYSTEM: '🔔',
    };
    return icons[type] || '🔔';
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read
    if (!notification.isRead) {
      try {
        await notificationService.markAsRead(notification.id);
        setNotifications(prev =>
          prev.map(n => (n.id === notification.id ? { ...n, isRead: true } : n))
        );
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    }

    // Navigate based on type
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    } else {
      switch (notification.type) {
        case 'MATCH':
          navigate('/match');
          break;
        case 'EVENT':
          navigate('/events');
          break;
        case 'POINTS':
          navigate('/rewards');
          break;
        case 'MESSAGE':
          navigate('/messages');
          break;
      }
    }
    onClose();
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const clearAll = async () => {
    try {
      await notificationService.deleteAllNotifications();
      setNotifications([]);
    } catch (error) {
      console.error('Failed to clear notifications:', error);
    }
  };

  return (
    <>
      <Overlay $isOpen={isOpen} onClick={onClose} />
      <PanelContainer $isOpen={isOpen}>
        <Header>
          <Title>Notifications</Title>
          <CloseButton onClick={onClose}>✕</CloseButton>
        </Header>

        {isLoading ? (
          <EmptyState>
            <EmptyText>Loading notifications...</EmptyText>
          </EmptyState>
        ) : notifications.length > 0 ? (
          <>
            <NotificationsList>
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  unread={!notification.isRead}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <NotificationContent>
                    <Avatar type={notification.type}>
                      {getNotificationIcon(notification.type)}
                    </Avatar>
                    <NotificationText>
                      <NotificationTitle>{notification.title}</NotificationTitle>
                      <NotificationMessage>{notification.message}</NotificationMessage>
                      <NotificationTime>{formatTime(new Date(notification.createdAt))}</NotificationTime>
                    </NotificationText>
                  </NotificationContent>
                </NotificationItem>
              ))}
            </NotificationsList>
            <ActionButtons>
              <ActionButton onClick={markAllAsRead}>Mark all as read</ActionButton>
              <ActionButton onClick={clearAll}>Clear all</ActionButton>
            </ActionButtons>
          </>
        ) : (
          <EmptyState>
            <EmptyIcon>🔔</EmptyIcon>
            <EmptyText>No notifications yet</EmptyText>
          </EmptyState>
        )}
      </PanelContainer>
    </>
  );
};