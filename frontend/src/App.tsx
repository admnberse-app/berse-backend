/** @jsxImportSource react */
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'styled-components';
import { AuthProvider } from './contexts/AuthContext';
import { MessagingProvider } from './contexts/MessagingContext';
import { ProtectedRoute } from './components/ProtectedRoute/ProtectedRoute';
import { OptionalProtectedRoute } from './components/OptionalProtectedRoute';
import { UnifiedMessagingModal } from './components/UnifiedMessagingModal';
import { GlobalStyles } from './theme/GlobalStyles';
import { theme } from './theme';
import { setupCsrfInterceptor } from './hooks/useCsrf';
import './utils/clearAuth'; // Import to make clearAuth available globally
import './utils/testAuth'; // Import to make testLogin available globally
import './utils/testVoucher'; // Import to make voucher test functions available globally
import './utils/initializePoints'; // Initialize points system

// Import screens
import { SplashScreen } from './screens/SplashScreen';
import { LoginScreen } from './screens/LoginScreen';
import { RegisterScreen } from './screens/RegisterScreen';
import { BerseMukhaAdminScreen } from './screens/BerseMukhaAdminScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { BerseConnectScreen } from './screens/BerseConnectScreen';
import { BerseMatchScreen } from './screens/BerseMatchScreen';
import { BerseMarketScreen } from './screens/BerseMarketScreen';
import { PointsDetailScreen } from './screens/PointsDetailScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { EventDetailsScreen } from './screens/EventDetailsScreen';
import { EditProfileScreen } from './screens/EditProfileScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { CreateEventScreen } from './screens/CreateEventScreen';
import { CreateCommunityScreen } from './screens/CreateCommunityScreen';
import { ForumScreen } from './screens/ForumScreen';
import { CreateForumPostScreen } from './screens/CreateForumPostScreen';
import { BookMeetupScreen } from './screens/BookMeetupScreen';
import { LeaderboardScreen } from './screens/LeaderboardScreen';
import { MyVouchersScreen } from './screens/MyVouchersScreen';
import { VouchersScreen } from './screens/VouchersScreen';
import { MessagesScreen } from './screens/MessagesScreen';
import { ChatScreen } from './screens/ChatScreen';
import { NotificationsScreen } from './screens/NotificationsScreen';
import { BerseCardGameScreen } from './screens/BerseCardGameScreen';
import { BerseMukhaEventScreen } from './screens/BerseMukhaEventScreen';
import { RewardsScreen } from './screens/RewardsScreen';
import { ActivitiesScreen } from './screens/ActivitiesScreen';
import { BerseMentorScreen } from './screens/BerseMentorScreen';
import { BerseBuddyScreen } from './screens/BerseBuddyScreen';
import { SocialEventsScreen } from './screens/SocialEventsScreen';
import { CafeMeetupsScreen } from './screens/CafeMeetupsScreen';
import { IlmInitiativeScreen } from './screens/IlmInitiativeScreen';
import { DonateScreen } from './screens/DonateScreen';
import { TripsScreen } from './screens/TripsScreen';
import { CommunitiesScreen } from './screens/CommunitiesScreen';
import { SukanSquadScreen } from './screens/SukanSquadScreen';
import { VolunteerScreen } from './screens/VolunteerScreen';
import { CommunityManagementScreen } from './screens/CommunityManagementScreen';
import { EditCommunityScreen } from './screens/EditCommunityScreen';
import { MyEventsScreen } from './screens/MyEventsScreen';
import { deepLinkHandler } from './utils/deepLinkHandler';
import { useAuth } from './contexts/AuthContext';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Event Deep Link Handler Component
const EventDeepLinkHandler: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (eventId) {
      console.log(`🔗 Processing deep link for event: ${eventId}`);
      deepLinkHandler.setNavigate(navigate);
      deepLinkHandler.trackDeepLinkEvent(eventId, 'direct');
      deepLinkHandler.handleEventDeepLink(eventId, user);
    }
  }, [eventId, navigate, user]);

  // Show loading state while processing
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: '#F5F5DC',
      padding: '20px'
    }}>
      <div style={{
        fontSize: '48px',
        marginBottom: '16px'
      }}>🎯</div>
      <h2 style={{
        color: '#2fce98',
        marginBottom: '8px',
        textAlign: 'center'
      }}>Loading BerseMukha Event...</h2>
      <p style={{
        color: '#666',
        textAlign: 'center',
        fontSize: '14px'
      }}>Preparing your event experience</p>
      <div style={{
        width: '200px',
        height: '4px',
        background: '#e9ecef',
        borderRadius: '2px',
        marginTop: '20px',
        overflow: 'hidden'
      }}>
        <div style={{
          width: '100%',
          height: '100%',
          background: 'linear-gradient(90deg, #2fce98, #4A90A4)',
          borderRadius: '2px',
          animation: 'loading 2s ease-in-out infinite'
        }} />
      </div>
      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

function App() {
  useEffect(() => {
    // Setup CSRF protection
    setupCsrfInterceptor();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <GlobalStyles />
        <Router>
          <AuthProvider>
            <MessagingProvider>
              <Routes>
              {/* Public routes */}
              <Route path="/" element={<SplashScreen />} />
              <Route path="/login" element={<LoginScreen />} />
              <Route path="/register" element={<RegisterScreen />} />
              
              {/* Protected routes */}
              <Route
                path="/bersemukha-admin/:eventId"
                element={
                  <ProtectedRoute>
                    <BerseMukhaAdminScreen />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={<DashboardScreen />}
              />
              <Route
                path="/connect"
                element={
                  <ProtectedRoute>
                    <BerseConnectScreen />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/match"
                element={
                  <OptionalProtectedRoute requireAuth={true} featureName="BerseMatch">
                    <BerseMatchScreen />
                  </OptionalProtectedRoute>
                }
              />
              <Route
                path="/market"
                element={
                  <OptionalProtectedRoute requireAuth={true} featureName="BerseMarket">
                    <BerseMarketScreen />
                  </OptionalProtectedRoute>
                }
              />
              <Route
                path="/manage-events"
                element={<CommunityManagementScreen />}
              />
              <Route
                path="/communities/edit/:communityId"
                element={<EditCommunityScreen />}
              />
              <Route
                path="/rewards"
                element={<RewardsScreen />}
              />
              <Route
                path="/points"
                element={<PointsDetailScreen />}
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <SettingsScreen />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/event/:eventId"
                element={<EventDetailsScreen />}
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfileScreen />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile/edit"
                element={
                  <ProtectedRoute>
                    <EditProfileScreen />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/edit-profile"
                element={
                  <ProtectedRoute>
                    <EditProfileScreen />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/event/create"
                element={
                  <ProtectedRoute>
                    <CreateEventScreen />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/communities/create"
                element={
                  <ProtectedRoute>
                    <CreateCommunityScreen />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/forum"
                element={<ForumScreen />}
              />
              <Route
                path="/create-forum-post"
                element={
                  <ProtectedRoute>
                    <CreateForumPostScreen />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/book-meetup"
                element={
                  <ProtectedRoute>
                    <BookMeetupScreen />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/leaderboard"
                element={<LeaderboardScreen />}
              />
              <Route
                path="/vouchers"
                element={
                  <ProtectedRoute>
                    <VouchersScreen />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-vouchers"
                element={
                  <ProtectedRoute>
                    <MyVouchersScreen />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/messages"
                element={
                  <ProtectedRoute>
                    <MessagesScreen />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/chat/:userId"
                element={
                  <ProtectedRoute>
                    <ChatScreen />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/notifications"
                element={
                  <ProtectedRoute>
                    <NotificationsScreen />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/card-game"
                element={
                  <ProtectedRoute>
                    <BerseCardGameScreen />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/bersecardgame"
                element={
                  <ProtectedRoute>
                    <BerseCardGameScreen />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-events"
                element={
                  <ProtectedRoute>
                    <MyEventsScreen />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/bersemukha-event"
                element={
                  <ProtectedRoute>
                    <BerseMukhaEventScreen />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/activities"
                element={
                  <ProtectedRoute>
                    <ActivitiesScreen />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/bersementor"
                element={
                  <ProtectedRoute>
                    <BerseMentorScreen />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/bersebuddy"
                element={
                  <ProtectedRoute>
                    <BerseBuddyScreen />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/social-events"
                element={
                  <ProtectedRoute>
                    <SocialEventsScreen />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cafe-meetups"
                element={
                  <ProtectedRoute>
                    <CafeMeetupsScreen />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ilm-initiative"
                element={
                  <ProtectedRoute>
                    <IlmInitiativeScreen />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/donate"
                element={
                  <ProtectedRoute>
                    <DonateScreen />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/trips"
                element={
                  <ProtectedRoute>
                    <TripsScreen />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/communities"
                element={
                  <ProtectedRoute>
                    <CommunitiesScreen />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/sukan-squad"
                element={
                  <ProtectedRoute>
                    <SukanSquadScreen />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/volunteer"
                element={
                  <ProtectedRoute>
                    <VolunteerScreen />
                  </ProtectedRoute>
                }
              />
              
              {/* Deep Link Route - different path to avoid conflict */}
              <Route
                path="/join-event/:eventId"
                element={<EventDeepLinkHandler />}
              />
              
              {/* Catch all - redirect to splash */}
              <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
              
              {/* Global Unified Messaging Modal */}
              <UnifiedMessagingModal />
            </MessagingProvider>
          </AuthProvider>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;