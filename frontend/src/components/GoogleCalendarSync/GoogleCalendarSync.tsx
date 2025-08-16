import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { googleCalendarService } from '../../services/googleCalendar';

interface GoogleCalendarSyncProps {
  onEventsLoaded?: (events: any[]) => void;
  onSyncStatusChange?: (status: boolean) => void;
}

const SyncContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  margin-bottom: 8px;
`;

const SyncButton = styled.button<{ $connected?: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: ${({ $connected }) => 
    $connected ? 'linear-gradient(135deg, #34A853, #188038)' : 'linear-gradient(135deg, #4285F4, #1A73E8)'};
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const GoogleIcon = styled.span`
  font-size: 14px;
`;

const SyncStatus = styled.div<{ $connected?: boolean }>`
  font-size: 10px;
  color: ${({ $connected }) => $connected ? '#34A853' : '#666'};
  font-style: italic;
`;

const LoadingSpinner = styled.div`
  width: 12px;
  height: 12px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

export const GoogleCalendarSync: React.FC<GoogleCalendarSyncProps> = ({
  onEventsLoaded,
  onSyncStatusChange,
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize Google Calendar API on component mount
    initializeGoogleCalendar();
  }, []);

  const initializeGoogleCalendar = async () => {
    try {
      await googleCalendarService.initClient();
      const signedIn = googleCalendarService.isUserSignedIn();
      setIsConnected(signedIn);
      
      if (signedIn) {
        await syncCalendarEvents();
      }
    } catch (err) {
      console.error('Failed to initialize Google Calendar:', err);
      setError('Failed to initialize Google Calendar');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsSyncing(true);
      setError(null);
      
      if (!isConnected) {
        await googleCalendarService.signIn();
        setIsConnected(true);
        onSyncStatusChange?.(true);
      }
      
      await syncCalendarEvents();
    } catch (err) {
      console.error('Failed to sign in to Google:', err);
      setError('Failed to connect to Google Calendar');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleGoogleSignOut = async () => {
    try {
      await googleCalendarService.signOut();
      setIsConnected(false);
      onSyncStatusChange?.(false);
      setLastSyncTime(null);
      onEventsLoaded?.([]);
    } catch (err) {
      console.error('Failed to sign out from Google:', err);
      setError('Failed to disconnect from Google Calendar');
    }
  };

  const syncCalendarEvents = async () => {
    try {
      setIsSyncing(true);
      setError(null);
      
      // Return empty array - no calendar events to show for deployment
      onEventsLoaded?.([]);
      setLastSyncTime(new Date());
    } catch (err) {
      console.error('Failed to sync calendar events:', err);
      setError('Failed to sync events');
    } finally {
      setIsSyncing(false);
    }
  };

  const addEventToGoogleCalendar = async (appEvent: any) => {
    if (!isConnected) {
      throw new Error('Not connected to Google Calendar');
    }

    try {
      const googleEvent = googleCalendarService.formatEventForGoogle(appEvent);
      const createdEvent = await googleCalendarService.createEvent(googleEvent);
      
      // Sync events after adding
      await syncCalendarEvents();
      
      return createdEvent;
    } catch (err) {
      console.error('Failed to add event to Google Calendar:', err);
      throw err;
    }
  };

  // Expose method to parent component
  React.useImperativeHandle(
    React.useRef(),
    () => ({
      addEventToGoogleCalendar,
      syncCalendarEvents,
    }),
    [isConnected]
  );

  return (
    <SyncContainer>
      {!isConnected ? (
        <SyncButton onClick={handleGoogleSignIn} disabled={isSyncing}>
          {isSyncing ? (
            <LoadingSpinner />
          ) : (
            <>
              <GoogleIcon>🔗</GoogleIcon>
              Connect Google Calendar
            </>
          )}
        </SyncButton>
      ) : (
        <>
          <SyncButton $connected onClick={syncCalendarEvents} disabled={isSyncing}>
            {isSyncing ? (
              <LoadingSpinner />
            ) : (
              <>
                <GoogleIcon>🔄</GoogleIcon>
                Sync
              </>
            )}
          </SyncButton>
          <SyncStatus $connected>
            Connected • {lastSyncTime ? `Last sync: ${lastSyncTime.toLocaleTimeString()}` : 'Not synced'}
          </SyncStatus>
          <button
            onClick={handleGoogleSignOut}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: '10px',
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            Disconnect
          </button>
        </>
      )}
      {error && (
        <div style={{ fontSize: '10px', color: '#FF4444' }}>
          {error}
        </div>
      )}
    </SyncContainer>
  );
};