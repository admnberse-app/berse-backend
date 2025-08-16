import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { pushNotificationService } from '../../services/pushNotification.service';

const Container = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin: 16px 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
`;

const Icon = styled.div`
  font-size: 24px;
`;

const Title = styled.h3`
  margin: 0;
  color: #333;
  font-size: 18px;
  font-weight: 600;
`;

const Description = styled.p`
  margin: 0 0 16px 0;
  color: #666;
  font-size: 14px;
  line-height: 1.5;
`;

const SettingRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
  }
`;

const SettingInfo = styled.div`
  flex: 1;
`;

const SettingLabel = styled.div`
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
`;

const SettingDesc = styled.div`
  font-size: 12px;
  color: #666;
`;

const Toggle = styled.button<{ $enabled: boolean }>`
  width: 48px;
  height: 24px;
  border-radius: 12px;
  border: none;
  background: ${({ $enabled }) => $enabled ? '#2fce98' : '#ccc'};
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:after {
    content: '';
    position: absolute;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: white;
    top: 2px;
    left: ${({ $enabled }) => $enabled ? '26px' : '2px'};
    transition: all 0.2s ease;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const StatusBadge = styled.div<{ $status: 'granted' | 'denied' | 'default' }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  background: ${({ $status }) => 
    $status === 'granted' ? '#E8F5E9' : 
    $status === 'denied' ? '#FFEBEE' : '#FFF3E0'};
  color: ${({ $status }) => 
    $status === 'granted' ? '#2E7D32' : 
    $status === 'denied' ? '#C62828' : '#E65100'};
`;

const TestButton = styled.button`
  background: #2fce98;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #26b580;
    transform: translateY(-1px);
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
    transform: none;
  }
`;

const ErrorMessage = styled.div`
  background: #FFEBEE;
  color: #C62828;
  padding: 12px;
  border-radius: 8px;
  font-size: 12px;
  margin-top: 12px;
`;

export const NotificationSettings: React.FC = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    checkNotificationSupport();
    checkSubscriptionStatus();
  }, []);

  const checkNotificationSupport = () => {
    const supported = pushNotificationService.isSupported();
    setIsSupported(supported);
    
    if (supported) {
      const currentPermission = pushNotificationService.getPermissionStatus();
      setPermission(currentPermission);
    }
  };

  const checkSubscriptionStatus = async () => {
    try {
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
      }
    } catch (error) {
      console.error('Error checking subscription status:', error);
    }
  };

  const handleTogglePushNotifications = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      if (isSubscribed) {
        // Unsubscribe
        const success = await pushNotificationService.unsubscribeFromPush();
        if (success) {
          setIsSubscribed(false);
          setPermission('default');
        }
      } else {
        // Subscribe
        const subscription = await pushNotificationService.subscribeToPush();
        if (subscription) {
          setIsSubscribed(true);
          setPermission('granted');
        } else {
          setError('Failed to enable push notifications. Please check your browser settings.');
        }
      }
    } catch (error) {
      console.error('Error toggling push notifications:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestNotification = async () => {
    try {
      await pushNotificationService.showTestNotification();
    } catch (error) {
      console.error('Error sending test notification:', error);
      setError('Failed to send test notification');
    }
  };

  const getPermissionStatus = () => {
    switch (permission) {
      case 'granted':
        return { text: '✅ Enabled', status: 'granted' as const };
      case 'denied':
        return { text: '❌ Blocked', status: 'denied' as const };
      default:
        return { text: '⏳ Not Set', status: 'default' as const };
    }
  };

  if (!isSupported) {
    return (
      <Container>
        <Header>
          <Icon>🔔</Icon>
          <Title>Push Notifications</Title>
        </Header>
        <ErrorMessage>
          Push notifications are not supported in this browser. 
          Please use a modern browser like Chrome, Firefox, or Safari.
        </ErrorMessage>
      </Container>
    );
  }

  const permissionStatus = getPermissionStatus();

  return (
    <Container>
      <Header>
        <Icon>🔔</Icon>
        <Title>Push Notifications</Title>
        <StatusBadge $status={permissionStatus.status}>
          {permissionStatus.text}
        </StatusBadge>
      </Header>
      
      <Description>
        Get notified about new matches, event reminders, messages, and important updates 
        even when the app is closed.
      </Description>

      <SettingRow>
        <SettingInfo>
          <SettingLabel>Push Notifications</SettingLabel>
          <SettingDesc>
            {isSubscribed 
              ? 'You will receive push notifications' 
              : 'Enable to receive notifications when app is closed'}
          </SettingDesc>
        </SettingInfo>
        <Toggle
          $enabled={isSubscribed}
          onClick={handleTogglePushNotifications}
          disabled={isLoading || permission === 'denied'}
        />
      </SettingRow>

      {isSubscribed && (
        <SettingRow>
          <SettingInfo>
            <SettingLabel>Test Notification</SettingLabel>
            <SettingDesc>Send a test notification to verify it's working</SettingDesc>
          </SettingInfo>
          <TestButton onClick={handleTestNotification}>
            Send Test
          </TestButton>
        </SettingRow>
      )}

      {permission === 'denied' && (
        <ErrorMessage>
          Push notifications are blocked. To enable them:
          <br />• Click the lock icon in your browser's address bar
          <br />• Set notifications to "Allow"
          <br />• Refresh the page
        </ErrorMessage>
      )}

      {error && (
        <ErrorMessage>
          {error}
        </ErrorMessage>
      )}
    </Container>
  );
};