import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  IconButton,
  Button,
  Avatar,
  Badge,
  Chip,
  Paper,
  LinearProgress,
  Skeleton,
  Fab,
  Tooltip,
  Alert,
  Snackbar,
  useTheme,
  useMediaQuery,
  Container,
  Stack,
  Divider,
} from '@mui/material';
import {
  Notifications,
  Settings,
  QrCodeScanner,
  Send,
  RequestPage,
  History,
  Star,
  TrendingUp,
  EmojiEvents,
  LocationOn,
  AccessTime,
  Group,
  Share,
  NavigateNext,
  Add,
  AccountBalanceWallet,
  Person,
  Refresh,
  Dashboard as DashboardIcon,
  Event,
  ShoppingBag,
  People,
  Handshake,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

// Lazy load heavy components
const QRScannerModal = lazy(() => import('./components/QRScannerModal'));
const SendPointsModal = lazy(() => import('./components/SendPointsModal'));
const RequestPointsModal = lazy(() => import('./components/RequestPointsModal'));
const NotificationPanel = lazy(() => import('./components/NotificationPanel'));
const SettingsMenu = lazy(() => import('./components/SettingsMenu'));
const EventCard = lazy(() => import('./components/EventCard'));
const ChallengesWidget = lazy(() => import('./components/ChallengesWidget'));
const LeaderboardWidget = lazy(() => import('./components/LeaderboardWidget'));

// Types
interface UserData {
  id: string;
  name: string;
  avatar: string;
  username: string;
  level: number;
  points: {
    current: number;
    pending: number;
    lifetime: number;
  };
  stats: {
    connections: number;
    events: number;
    achievements: number;
  };
}

interface NavigationCard {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  route: string;
  badge?: number;
  locked?: boolean;
  requiredLevel?: number;
}

interface DashboardEvent {
  id: string;
  title: string;
  time: string;
  location: string;
  category: string;
  spotsLeft: number;
  points: number;
  price?: number;
  joined: boolean;
  friends: string[];
  image?: string;
}

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

// Styled Components
const DashboardContainer = styled(Container)`
  padding-top: 24px;
  padding-bottom: 80px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
`;

const HeaderSection = styled(Paper)`
  padding: 20px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  margin-bottom: 24px;
`;

const PointsCard = styled(Card)`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 16px;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
    animation: pulse 4s ease-in-out infinite;
  }
  
  @keyframes pulse {
    0%, 100% { transform: scale(1); opacity: 0.5; }
    50% { transform: scale(1.1); opacity: 0.8; }
  }
`;

const QuickActionButton = styled(Button)`
  border-radius: 12px;
  padding: 12px;
  min-width: 80px;
  flex-direction: column;
  gap: 4px;
  text-transform: none;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const NavCard = styled(motion.div)<{ color: string; locked?: boolean }>`
  background: ${props => props.locked ? '#e0e0e0' : props.color};
  border-radius: 16px;
  padding: 20px;
  cursor: ${props => props.locked ? 'not-allowed' : 'pointer'};
  position: relative;
  overflow: hidden;
  opacity: ${props => props.locked ? 0.7 : 1};
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 100%);
  }
  
  &:hover {
    transform: ${props => props.locked ? 'none' : 'translateY(-4px)'};
    box-shadow: ${props => props.locked ? 'none' : '0 8px 24px rgba(0,0,0,0.2)'};
  }
`;

const Dashboard: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // State Management
  const [userData, setUserData] = useState<UserData>({
    id: '1',
    name: 'Ahmad Rahman',
    avatar: '/avatars/user.jpg',
    username: 'ahmad_r',
    level: 4,
    points: {
      current: 1250,
      pending: 50,
      lifetime: 5420,
    },
    stats: {
      connections: 127,
      events: 45,
      achievements: 23,
    },
  });

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(3);
  const [todayEvents, setTodayEvents] = useState<DashboardEvent[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal States
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showSendPoints, setShowSendPoints] = useState(false);
  const [showRequestPoints, setShowRequestPoints] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Snackbar State
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Navigation Cards Configuration
  const navigationCards: NavigationCard[] = [
    {
      id: 'connect',
      title: 'BerseConnect',
      subtitle: 'Join events & activities',
      icon: <Event sx={{ fontSize: 40, color: 'white' }} />,
      color: '#4CAF50',
      route: '/connect',
      badge: 3,
    },
    {
      id: 'match',
      title: 'BerseMatch',
      subtitle: 'Find friends & mentors',
      icon: <Handshake sx={{ fontSize: 40, color: 'white' }} />,
      color: '#2196F3',
      route: '/match',
      badge: 5,
    },
    {
      id: 'market',
      title: 'BerseMarket',
      subtitle: 'Buy, sell & trade',
      icon: <ShoppingBag sx={{ fontSize: 40, color: 'white' }} />,
      color: '#FF9800',
      route: '/market',
      locked: userData.level < 3,
      requiredLevel: 3,
    },
    {
      id: 'mukha',
      title: 'BerseMukha',
      subtitle: 'Community hub',
      icon: <People sx={{ fontSize: 40, color: 'white' }} />,
      color: '#9C27B0',
      route: '/mukha',
    },
  ];

  // Mock Events Data
  const mockEvents: DashboardEvent[] = [
    {
      id: '1',
      title: 'Friday Prayer & Lunch',
      time: '12:30 PM',
      location: 'Masjid Al-Hikmah',
      category: 'Religious',
      spotsLeft: 5,
      points: 20,
      joined: false,
      friends: ['Omar', 'Hassan'],
      image: '/events/prayer.jpg',
    },
    {
      id: '2',
      title: 'Tech Talk: AI in Islam',
      time: '3:00 PM',
      location: 'Community Center',
      category: 'Education',
      spotsLeft: 12,
      points: 30,
      price: 10,
      joined: true,
      friends: ['Sarah', 'Fatima', 'Aisha'],
      image: '/events/tech.jpg',
    },
    {
      id: '3',
      title: 'Soccer Friendly Match',
      time: '5:30 PM',
      location: 'Sports Complex',
      category: 'Sports',
      spotsLeft: 2,
      points: 15,
      joined: false,
      friends: ['Ibrahim'],
      image: '/events/soccer.jpg',
    },
  ];

  // Load Initial Data
  useEffect(() => {
    loadDashboardData();
    setupRealtimeUpdates();
    checkDailyReward();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTodayEvents(mockEvents);
      loadNotifications();
    } catch (error) {
      showSnackbar('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadNotifications = () => {
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'friend',
        title: 'New Friend Request',
        message: 'Sarah wants to connect with you',
        timestamp: new Date(),
        read: false,
        actionType: 'friend_request',
      },
      {
        id: '2',
        type: 'event',
        title: 'Event Starting Soon',
        message: 'Tech Talk starts in 30 minutes',
        timestamp: new Date(),
        read: false,
        actionUrl: '/events/2',
      },
      {
        id: '3',
        type: 'points',
        title: 'Points Received',
        message: 'You received 50 points from Omar',
        timestamp: new Date(),
        read: true,
      },
    ];
    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.read).length);
  };

  const setupRealtimeUpdates = () => {
    // WebSocket connection for real-time updates
    // This would connect to your backend WebSocket server
    console.log('Setting up real-time updates...');
  };

  const checkDailyReward = async () => {
    const lastClaim = localStorage.getItem('lastDailyReward');
    const today = new Date().toDateString();
    
    if (lastClaim !== today) {
      // Show daily reward available
      showSnackbar('Daily reward available! Claim your 10 points', 'info');
    }
  };

  // Navigation Handlers
  const handleNavigate = (route: string) => {
    navigate(route);
  };

  const handleCardClick = (card: NavigationCard) => {
    if (card.locked) {
      showSnackbar(
        `Reach Level ${card.requiredLevel} to unlock ${card.title}`,
        'warning'
      );
      return;
    }
    
    // Haptic feedback
    if (window.navigator.vibrate) {
      window.navigator.vibrate(10);
    }
    
    navigate(card.route);
  };

  // Quick Action Handlers
  const handleScanQR = () => {
    setShowQRScanner(true);
  };

  const handleSendPoints = () => {
    setShowSendPoints(true);
  };

  const handleRequestPoints = () => {
    setShowRequestPoints(true);
  };

  const handleViewHistory = () => {
    navigate('/transactions');
  };

  // Event Handlers
  const handleQuickJoin = async (eventId: string, isPaid: boolean) => {
    try {
      if (isPaid) {
        // Show payment modal
        showSnackbar('Opening payment...', 'info');
        return;
      }
      
      // Update UI optimistically
      setTodayEvents(prev =>
        prev.map(event =>
          event.id === eventId
            ? { ...event, joined: true, spotsLeft: event.spotsLeft - 1 }
            : event
        )
      );
      
      showSnackbar('Joined event successfully! +10 points', 'success');
      
      // Update points
      setUserData(prev => ({
        ...prev,
        points: {
          ...prev.points,
          current: prev.points.current + 10,
        },
      }));
    } catch (error) {
      showSnackbar('Failed to join event', 'error');
    }
  };

  const handleShareEvent = async (event: DashboardEvent) => {
    const shareData = {
      title: event.title,
      text: `Join me at ${event.title}!`,
      url: `https://berseapp.com/events/${event.id}`,
    };
    
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback to copy link
        await navigator.clipboard.writeText(shareData.url);
        showSnackbar('Link copied to clipboard!', 'success');
      }
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  // Profile & Settings Handlers
  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handleNotificationsClick = () => {
    setShowNotifications(true);
  };

  const handleSettingsClick = () => {
    setShowSettings(true);
  };

  const handleRefreshDashboard = async () => {
    await loadDashboardData();
    showSnackbar('Dashboard refreshed', 'success');
  };

  // Daily Reward Handler
  const claimDailyReward = async () => {
    try {
      const today = new Date().toDateString();
      localStorage.setItem('lastDailyReward', today);
      
      setUserData(prev => ({
        ...prev,
        points: {
          ...prev.points,
          current: prev.points.current + 10,
        },
      }));
      
      showSnackbar('Claimed 10 daily points!', 'success');
    } catch (error) {
      showSnackbar('Failed to claim daily reward', 'error');
    }
  };

  // Helper Functions
  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setSnackbar({ open: true, message, severity });
  };

  const formatPoints = (points: number): string => {
    return points.toLocaleString();
  };

  const getProgressToNextLevel = (): number => {
    const pointsForNextLevel = (userData.level + 1) * 500;
    const progress = (userData.points.lifetime % 500) / 5;
    return Math.min(progress, 100);
  };

  return (
    <DashboardContainer maxWidth="lg">
      {/* Header Section */}
      <HeaderSection elevation={0}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={2}>
            <Tooltip title="View Profile">
              <IconButton onClick={handleProfileClick}>
                <Avatar
                  src={userData.avatar}
                  alt={userData.name}
                  sx={{ width: 48, height: 48 }}
                />
              </IconButton>
            </Tooltip>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                Welcome back, {userData.name.split(' ')[0]}!
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Level {userData.level} • {formatPoints(userData.points.lifetime)} lifetime points
              </Typography>
            </Box>
          </Box>
          
          <Box display="flex" gap={1}>
            <Tooltip title="Refresh">
              <IconButton onClick={handleRefreshDashboard}>
                <Refresh />
              </IconButton>
            </Tooltip>
            <Tooltip title="Notifications">
              <IconButton onClick={handleNotificationsClick}>
                <Badge badgeContent={unreadCount} color="error">
                  <Notifications />
                </Badge>
              </IconButton>
            </Tooltip>
            <Tooltip title="Settings">
              <IconButton onClick={handleSettingsClick}>
                <Settings />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </HeaderSection>

      {/* Points Card */}
      <PointsCard elevation={3}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Box>
              <Typography variant="h3" fontWeight="bold">
                {formatPoints(userData.points.current)}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Current Points
              </Typography>
              {userData.points.pending > 0 && (
                <Chip
                  label={`+${userData.points.pending} pending`}
                  size="small"
                  sx={{ mt: 1, backgroundColor: 'rgba(255,255,255,0.2)' }}
                />
              )}
            </Box>
            <AccountBalanceWallet sx={{ fontSize: 48, opacity: 0.7 }} />
          </Box>
          
          <LinearProgress
            variant="determinate"
            value={getProgressToNextLevel()}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: 'rgba(255,255,255,0.2)',
              '& .MuiLinearProgress-bar': {
                backgroundColor: 'white',
              },
            }}
          />
          <Typography variant="caption" sx={{ mt: 1, display: 'block', opacity: 0.9 }}>
            {500 - (userData.points.lifetime % 500)} points to Level {userData.level + 1}
          </Typography>
        </CardContent>
      </PointsCard>

      {/* Quick Actions */}
      <Box my={3}>
        <Grid container spacing={2}>
          <Grid item xs={3}>
            <QuickActionButton
              fullWidth
              variant="contained"
              onClick={handleScanQR}
              startIcon={<QrCodeScanner />}
            >
              Scan QR
            </QuickActionButton>
          </Grid>
          <Grid item xs={3}>
            <QuickActionButton
              fullWidth
              variant="contained"
              onClick={handleSendPoints}
              startIcon={<Send />}
            >
              Send
            </QuickActionButton>
          </Grid>
          <Grid item xs={3}>
            <QuickActionButton
              fullWidth
              variant="contained"
              onClick={handleRequestPoints}
              startIcon={<RequestPage />}
            >
              Request
            </QuickActionButton>
          </Grid>
          <Grid item xs={3}>
            <QuickActionButton
              fullWidth
              variant="contained"
              onClick={handleViewHistory}
              startIcon={<History />}
            >
              History
            </QuickActionButton>
          </Grid>
        </Grid>
      </Box>

      {/* Navigation Cards */}
      <Box mb={3}>
        <Typography variant="h6" fontWeight="bold" mb={2}>
          Explore
        </Typography>
        <Grid container spacing={2}>
          {navigationCards.map((card) => (
            <Grid item xs={6} sm={3} key={card.id}>
              <NavCard
                color={card.color}
                locked={card.locked}
                onClick={() => handleCardClick(card)}
                whileHover={{ scale: card.locked ? 1 : 1.05 }}
                whileTap={{ scale: card.locked ? 1 : 0.95 }}
              >
                <Badge
                  badgeContent={card.badge}
                  color="error"
                  sx={{ width: '100%' }}
                >
                  <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    textAlign="center"
                    sx={{ width: '100%' }}
                  >
                    {card.locked && (
                      <Box
                        position="absolute"
                        top={8}
                        right={8}
                        sx={{ color: 'rgba(0,0,0,0.5)' }}
                      >
                        🔒
                      </Box>
                    )}
                    {card.icon}
                    <Typography
                      variant="subtitle1"
                      fontWeight="bold"
                      color="white"
                      mt={1}
                    >
                      {card.title}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.9, color: 'white' }}>
                      {card.subtitle}
                    </Typography>
                  </Box>
                </Badge>
              </NavCard>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Today's Events */}
      <Paper sx={{ p: 2, borderRadius: 2, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" fontWeight="bold">
            Today's Events
          </Typography>
          <Button
            endIcon={<NavigateNext />}
            onClick={() => navigate('/events')}
            size="small"
          >
            View All
          </Button>
        </Box>
        
        {loading ? (
          <Box>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} height={120} sx={{ mb: 2 }} />
            ))}
          </Box>
        ) : (
          <Stack spacing={2}>
            {todayEvents.map((event) => (
              <Card key={event.id} sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between">
                    <Box flex={1}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {event.title}
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1} mt={1}>
                        <AccessTime sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          {event.time}
                        </Typography>
                        <LocationOn sx={{ fontSize: 16, color: 'text.secondary', ml: 1 }} />
                        <Typography variant="caption" color="text.secondary">
                          {event.location}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1} mt={1}>
                        <Chip
                          label={`${event.spotsLeft} spots left`}
                          size="small"
                          color={event.spotsLeft < 5 ? 'error' : 'default'}
                        />
                        <Chip
                          label={`+${event.points} pts`}
                          size="small"
                          color="primary"
                        />
                        {event.price && (
                          <Chip
                            label={`$${event.price}`}
                            size="small"
                            color="secondary"
                          />
                        )}
                      </Box>
                      {event.friends.length > 0 && (
                        <Box display="flex" alignItems="center" gap={1} mt={1}>
                          <Group sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">
                            {event.friends.join(', ')} {event.friends.length > 2 ? 'and others' : ''} are going
                          </Typography>
                        </Box>
                      )}
                    </Box>
                    <Box display="flex" flexDirection="column" gap={1}>
                      <Button
                        variant={event.joined ? 'outlined' : 'contained'}
                        size="small"
                        onClick={() => handleQuickJoin(event.id, !!event.price)}
                        disabled={event.joined || event.spotsLeft === 0}
                      >
                        {event.joined ? 'Joined' : 'Join'}
                      </Button>
                      <IconButton
                        size="small"
                        onClick={() => handleShareEvent(event)}
                      >
                        <Share />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
      </Paper>

      {/* Weekly Challenges Widget */}
      <Suspense fallback={<Skeleton height={200} />}>
        <ChallengesWidget />
      </Suspense>

      {/* Leaderboard Widget */}
      <Box mt={3}>
        <Suspense fallback={<Skeleton height={200} />}>
          <LeaderboardWidget />
        </Suspense>
      </Box>

      {/* Floating Action Button for Daily Reward */}
      <Fab
        color="secondary"
        sx={{
          position: 'fixed',
          bottom: 80,
          right: 16,
        }}
        onClick={claimDailyReward}
      >
        <EmojiEvents />
      </Fab>

      {/* Modals */}
      <Suspense fallback={null}>
        {showQRScanner && (
          <QRScannerModal
            open={showQRScanner}
            onClose={() => setShowQRScanner(false)}
            onScan={(data) => {
              console.log('Scanned:', data);
              setShowQRScanner(false);
            }}
          />
        )}
        
        {showSendPoints && (
          <SendPointsModal
            open={showSendPoints}
            onClose={() => setShowSendPoints(false)}
            currentBalance={userData.points.current}
            onSend={(recipient, amount) => {
              setUserData(prev => ({
                ...prev,
                points: {
                  ...prev.points,
                  current: prev.points.current - amount,
                },
              }));
              showSnackbar(`Sent ${amount} points to ${recipient}`, 'success');
              setShowSendPoints(false);
            }}
          />
        )}
        
        {showRequestPoints && (
          <RequestPointsModal
            open={showRequestPoints}
            onClose={() => setShowRequestPoints(false)}
            onRequest={(from, amount, reason) => {
              showSnackbar(`Requested ${amount} points from ${from}`, 'success');
              setShowRequestPoints(false);
            }}
          />
        )}
        
        {showNotifications && (
          <NotificationPanel
            open={showNotifications}
            onClose={() => setShowNotifications(false)}
            notifications={notifications}
            onNotificationClick={(notification) => {
              if (notification.actionUrl) {
                navigate(notification.actionUrl);
              }
              setShowNotifications(false);
            }}
            onMarkAllRead={() => {
              setNotifications(prev => prev.map(n => ({ ...n, read: true })));
              setUnreadCount(0);
            }}
          />
        )}
        
        {showSettings && (
          <SettingsMenu
            open={showSettings}
            onClose={() => setShowSettings(false)}
            onNavigate={(path) => {
              navigate(path);
              setShowSettings(false);
            }}
          />
        )}
      </Suspense>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </DashboardContainer>
  );
};

export default Dashboard;