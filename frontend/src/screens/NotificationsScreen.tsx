import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { StatusBar } from '../components/StatusBar';
import { MainNav } from '../components/MainNav';
import { ProfileSidebar } from '../components/ProfileSidebar/ProfileSidebar';
import { notificationService } from '../services/notification.service';
import { useAuth } from '../contexts/AuthContext';

export const NotificationsScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showProfileSidebar, setShowProfileSidebar] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'friend_request' | 'community' | 'event'>('all');

  // Load notifications on mount
  useEffect(() => {
    loadNotifications();
    
    // Request notification permission
    notificationService.requestPermission();
    
    // Listen for notification updates
    const handleNotificationUpdate = () => {
      loadNotifications();
    };
    
    window.addEventListener('notification-count-update', handleNotificationUpdate);
    return () => {
      window.removeEventListener('notification-count-update', handleNotificationUpdate);
    };
  }, []);

  const loadNotifications = () => {
    // Get stored notifications
    const storedNotifications = notificationService.getStoredNotifications();
    
    // Get friend requests
    const friendRequests = JSON.parse(localStorage.getItem('friend_requests') || '[]')
      .filter((req: any) => req.to === user?.id || req.from === user?.id)
      .map((req: any) => ({
        id: `fr-${req.timestamp}`,
        type: 'friend_request',
        title: req.from === user?.id ? 'Friend Request Sent' : 'New Friend Request',
        message: req.message,
        from: req.from === user?.id ? req.toName : req.fromName,
        timestamp: req.timestamp,
        read: req.read || false,
        eventId: req.eventId,
        status: req.status
      }));
    
    // Get community join requests
    const communityRequests = JSON.parse(localStorage.getItem('community_join_requests') || '[]')
      .filter((req: any) => req.userId === user?.id)
      .map((req: any) => ({
        id: `cr-${req.timestamp}`,
        type: 'community_request',
        title: 'Community Join Request',
        message: `You requested to join ${req.communityName}`,
        from: req.communityName,
        timestamp: req.timestamp,
        read: req.read || false,
        status: req.status
      }));
    
    // Combine all notifications
    const allNotifications = [
      ...storedNotifications,
      ...friendRequests,
      ...communityRequests
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    setNotifications(allNotifications);
  };

  const getFilteredNotifications = () => {
    switch (filter) {
      case 'unread':
        return notifications.filter(n => !n.read);
      case 'friend_request':
        return notifications.filter(n => n.type === 'friend_request');
      case 'community':
        return notifications.filter(n => n.type === 'community_request');
      case 'event':
        return notifications.filter(n => n.type === 'event' || n.type === 'event_reminder');
      default:
        return notifications;
    }
  };

  const handleNotificationClick = (notification: any) => {
    // Mark as read
    notificationService.markAsRead(notification.id);
    
    // Navigate based on type
    switch (notification.type) {
      case 'friend_request':
        navigate('/messages');
        break;
      case 'community_request':
        navigate('/communities');
        break;
      case 'event':
      case 'event_reminder':
        if (notification.eventId) {
          navigate(`/event/${notification.eventId}`);
        } else {
          navigate('/connect');
        }
        break;
      case 'message':
        navigate('/messages');
        break;
      default:
        // Just mark as read
        loadNotifications();
    }
  };

  const markAllAsRead = () => {
    notificationService.markAllAsRead();
    notifications.forEach(n => {
      n.read = true;
    });
    setNotifications([...notifications]);
  };

  const getTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 30) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'friend_request': return '🤝';
      case 'community_request': return '👥';
      case 'event': return '📅';
      case 'event_reminder': return '⏰';
      case 'message': return '💬';
      case 'points': return '🏆';
      case 'reward': return '🎁';
      default: return '🔔';
    }
  };

  const filteredNotifications = getFilteredNotifications();

  return (
    <Container>
      <StatusBar onProfileClick={() => setShowProfileSidebar(true)} />
      
      <Header>
        <BackButton onClick={() => navigate('/dashboard')}>←</BackButton>
        <HeaderTitle>🔔 Notifications</HeaderTitle>
        {notifications.filter(n => !n.read).length > 0 && (
          <MarkAllButton onClick={markAllAsRead}>Mark all read</MarkAllButton>
        )}
      </Header>

      {/* Filter Tabs */}
      <FilterTabs>
        <FilterTab $active={filter === 'all'} onClick={() => setFilter('all')}>All</FilterTab>
        <FilterTab $active={filter === 'unread'} onClick={() => setFilter('unread')}>
          Unread ({notifications.filter(n => !n.read).length})
        </FilterTab>
        <FilterTab $active={filter === 'friend_request'} onClick={() => setFilter('friend_request')}>🤝 Requests</FilterTab>
        <FilterTab $active={filter === 'community'} onClick={() => setFilter('community')}>👥 Communities</FilterTab>
        <FilterTab $active={filter === 'event'} onClick={() => setFilter('event')}>📅 Events</FilterTab>
      </FilterTabs>

      <Content>
        <NotificationsList>
          {filteredNotifications.length === 0 ? (
            <EmptyState>
              <EmptyIcon>{getNotificationIcon(filter)}</EmptyIcon>
              <EmptyTitle>No {filter === 'all' ? '' : filter.replace('_', ' ')} notifications</EmptyTitle>
              <EmptyText>
                {filter === 'friend_request' ? 'Friend requests will appear here' :
                 filter === 'community' ? 'Community updates will appear here' :
                 filter === 'event' ? 'Event reminders will appear here' :
                 filter === 'unread' ? 'All notifications have been read' :
                 'Your notifications will appear here'}
              </EmptyText>
            </EmptyState>
          ) : (
            filteredNotifications.map(notification => (
              <NotificationItem 
                key={notification.id}
                $unread={!notification.read}
                onClick={() => handleNotificationClick(notification)}
              >
                <NotificationIcon>{getNotificationIcon(notification.type)}</NotificationIcon>
                <NotificationContent>
                  <NotificationTitle>{notification.title}</NotificationTitle>
                  <NotificationText>
                    {notification.message || notification.body}
                  </NotificationText>
                  <NotificationMeta>
                    <NotificationTime>{getTimeAgo(notification.timestamp)}</NotificationTime>
                    {notification.status && (
                      <StatusBadge $status={notification.status}>
                        {notification.status}
                      </StatusBadge>
                    )}
                  </NotificationMeta>
                </NotificationContent>
                {notification.type === 'friend_request' && notification.status === 'pending' && (
                  <ActionButtons>
                    <AcceptButton onClick={(e) => {
                      e.stopPropagation();
                      // Handle accept
                      alert('Friend request accepted!');
                    }}>Accept</AcceptButton>
                    <DeclineButton onClick={(e) => {
                      e.stopPropagation();
                      // Handle decline
                      alert('Friend request declined');
                    }}>Decline</DeclineButton>
                  </ActionButtons>
                )}
              </NotificationItem>
            ))
          )}
        </NotificationsList>
      </Content>

      <MainNav 
        activeTab="home"
        onTabPress={(tab) => {
          switch (tab) {
            case 'home': navigate('/dashboard'); break;
            case 'connect': navigate('/connect'); break;
            case 'match': navigate('/match'); break;
            case 'forum': navigate('/forum'); break;
          }
        }}
      />

      <ProfileSidebar 
        isOpen={showProfileSidebar}
        onClose={() => setShowProfileSidebar(false)}
      />
    </Container>
  );
};

// Styled components
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
  align-items: center;
  padding: 16px 20px;
  background-color: #F5F3EF;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  color: #2fce98;
  cursor: pointer;
  margin-right: 12px;
  
  &:hover {
    transform: scale(1.1);
  }
`;

const HeaderTitle = styled.h1`
  font-size: 20px;
  font-weight: bold;
  color: #2fce98;
  margin: 0;
`;

const Content = styled.div`
  flex: 1;
  padding: 20px;
  padding-bottom: 100px; /* Added extra space for floating nav */
`;

const NotificationsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const NotificationItem = styled.div<{ $unread?: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: ${({ $unread }) => $unread ? '#FFF9E6' : 'white'};
  border-radius: 12px;
  border-left: 4px solid ${({ $unread }) => $unread ? '#FF9800' : 'transparent'};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const NotificationIcon = styled.div`
  font-size: 24px;
  margin-top: 4px;
  min-width: 28px;
  text-align: center;
`;

const NotificationContent = styled.div`
  flex: 1;
`;

const NotificationTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 4px 0;
`;

const NotificationText = styled.p`
  font-size: 14px;
  color: #666;
  margin: 0 0 8px 0;
  line-height: 1.4;
`;

const NotificationTime = styled.span`
  font-size: 12px;
  color: #999;
  font-weight: 500;
`;

const MarkAllButton = styled.button`
  background: none;
  border: none;
  color: #2fce98;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  margin-left: auto;
  
  &:hover {
    text-decoration: underline;
  }
`;

const FilterTabs = styled.div`
  display: flex;
  gap: 8px;
  padding: 12px 20px;
  background: white;
  border-bottom: 1px solid #e5e5e5;
  overflow-x: auto;
  
  &::-webkit-scrollbar {
    display: none;
  }
`;

const FilterTab = styled.button<{ $active: boolean }>`
  padding: 8px 16px;
  border: none;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  
  ${props => props.$active ? `
    background: #2fce98;
    color: white;
  ` : `
    background: #f5f5f5;
    color: #666;
    
    &:hover {
      background: #e8e8e8;
    }
  `}
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
`;

const EmptyTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
`;

const EmptyText = styled.p`
  font-size: 14px;
  color: #999;
  margin: 0;
`;

const NotificationMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
`;

const StatusBadge = styled.span<{ $status: string }>`
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 600;
  
  ${props => {
    switch(props.$status) {
      case 'pending':
        return 'background: #fff3cd; color: #856404;';
      case 'accepted':
        return 'background: #d4edda; color: #155724;';
      case 'declined':
        return 'background: #f8d7da; color: #721c24;';
      default:
        return 'background: #e2e3e5; color: #383d41;';
    }
  }}
`;

const ActionButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-left: auto;
`;

const AcceptButton = styled.button`
  padding: 6px 12px;
  background: #2fce98;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  
  &:hover {
    background: #27b584;
  }
`;

const DeclineButton = styled.button`
  padding: 6px 12px;
  background: #f5f5f5;
  color: #666;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  
  &:hover {
    background: #e8e8e8;
  }
`;