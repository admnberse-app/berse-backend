import React, { useState } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Badge,
  Button,
  Chip,
  Divider,
  Tab,
  Tabs,
  Alert,
} from '@mui/material';
import {
  Close,
  Notifications,
  Event,
  Person,
  EmojiEvents,
  AccountBalanceWallet,
  Settings,
  Delete,
  DoneAll,
  FilterList,
} from '@mui/icons-material';
import styled from 'styled-components';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  type: 'event' | 'friend' | 'points' | 'achievement' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionType?: string;
  data?: any;
}

interface NotificationPanelProps {
  open: boolean;
  onClose: () => void;
  notifications: Notification[];
  onNotificationClick: (notification: Notification) => void;
  onMarkAllRead: () => void;
}

const NotificationItem = styled(ListItem)<{ unread?: boolean }>`
  background: ${props => props.unread ? '#f5f5f5' : 'transparent'};
  border-left: ${props => props.unread ? '4px solid #667eea' : 'none'};
  padding-left: ${props => props.unread ? '12px' : '16px'};
  cursor: pointer;
  
  &:hover {
    background: #f0f0f0;
  }
`;

const NotificationPanel: React.FC<NotificationPanelProps> = ({
  open,
  onClose,
  notifications,
  onNotificationClick,
  onMarkAllRead,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [filter, setFilter] = useState<string | null>(null);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'event':
        return <Event />;
      case 'friend':
        return <Person />;
      case 'points':
        return <AccountBalanceWallet />;
      case 'achievement':
        return <EmojiEvents />;
      case 'system':
        return <Settings />;
      default:
        return <Notifications />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'event':
        return '#4CAF50';
      case 'friend':
        return '#2196F3';
      case 'points':
        return '#FF9800';
      case 'achievement':
        return '#9C27B0';
      case 'system':
        return '#757575';
      default:
        return '#000';
    }
  };

  const filteredNotifications = filter
    ? notifications.filter(n => n.type === filter)
    : notifications;

  const unreadNotifications = filteredNotifications.filter(n => !n.read);
  const readNotifications = filteredNotifications.filter(n => n.read);

  const clearAll = () => {
    // Clear all notifications
    console.log('Clearing all notifications');
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: 400, maxWidth: '100%' }
      }}
    >
      <Box p={2}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <Notifications color="primary" />
            <Typography variant="h6">Notifications</Typography>
            {unreadNotifications.length > 0 && (
              <Chip
                label={unreadNotifications.length}
                size="small"
                color="error"
              />
            )}
          </Box>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>

        <Box display="flex" gap={1} mb={2}>
          <Button
            size="small"
            startIcon={<DoneAll />}
            onClick={onMarkAllRead}
            disabled={unreadNotifications.length === 0}
          >
            Mark all read
          </Button>
          <Button
            size="small"
            startIcon={<Delete />}
            onClick={clearAll}
            disabled={notifications.length === 0}
          >
            Clear all
          </Button>
        </Box>

        <Tabs
          value={activeTab}
          onChange={(e, v) => setActiveTab(v)}
          variant="fullWidth"
          sx={{ mb: 2 }}
        >
          <Tab label={`All (${notifications.length})`} />
          <Tab label={`Unread (${unreadNotifications.length})`} />
        </Tabs>

        {/* Filter Chips */}
        <Box display="flex" gap={1} mb={2} flexWrap="wrap">
          <Chip
            label="All"
            size="small"
            onClick={() => setFilter(null)}
            color={!filter ? 'primary' : 'default'}
          />
          {['event', 'friend', 'points', 'achievement', 'system'].map(type => (
            <Chip
              key={type}
              label={type.charAt(0).toUpperCase() + type.slice(1)}
              size="small"
              onClick={() => setFilter(type)}
              color={filter === type ? 'primary' : 'default'}
            />
          ))}
        </Box>

        <List>
          {activeTab === 0 ? (
            // All notifications
            filteredNotifications.length > 0 ? (
              filteredNotifications.map((notification) => (
                <React.Fragment key={notification.id}>
                  <NotificationItem
                    unread={!notification.read}
                    onClick={() => onNotificationClick(notification)}
                  >
                    <ListItemAvatar>
                      <Avatar
                        sx={{
                          bgcolor: getNotificationColor(notification.type),
                          width: 36,
                          height: 36
                        }}
                      >
                        {getNotificationIcon(notification.type)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle2" fontWeight={!notification.read ? 'bold' : 'normal'}>
                          {notification.title}
                        </Typography>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" color="text.secondary">
                            {notification.message}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                          </Typography>
                        </>
                      }
                    />
                  </NotificationItem>
                  <Divider component="li" />
                </React.Fragment>
              ))
            ) : (
              <Alert severity="info">No notifications</Alert>
            )
          ) : (
            // Unread only
            unreadNotifications.length > 0 ? (
              unreadNotifications.map((notification) => (
                <React.Fragment key={notification.id}>
                  <NotificationItem
                    unread
                    onClick={() => onNotificationClick(notification)}
                  >
                    <ListItemAvatar>
                      <Avatar
                        sx={{
                          bgcolor: getNotificationColor(notification.type),
                          width: 36,
                          height: 36
                        }}
                      >
                        {getNotificationIcon(notification.type)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle2" fontWeight="bold">
                          {notification.title}
                        </Typography>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" color="text.secondary">
                            {notification.message}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                          </Typography>
                        </>
                      }
                    />
                  </NotificationItem>
                  <Divider component="li" />
                </React.Fragment>
              ))
            ) : (
              <Alert severity="success">All caught up!</Alert>
            )
          )}
        </List>
      </Box>
    </Drawer>
  );
};

export default NotificationPanel;