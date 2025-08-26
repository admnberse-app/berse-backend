import React from 'react';
import { GoogleCalendarSync } from '../components/GoogleCalendarSync';

// This component shows how to integrate Google Calendar in the dashboard
// Add this to your existing DashboardScreen.tsx

export const GoogleCalendarIntegration = () => {
  const [googleEvents, setGoogleEvents] = React.useState<any[]>([]);
  const [isGoogleConnected, setIsGoogleConnected] = React.useState(false);

  return (
    <div>
      {/* Add this component inside your calendar widget */}
      <GoogleCalendarSync
        onEventsLoaded={(events) => {
          console.log('Google Calendar events loaded:', events);
          setGoogleEvents(events);
          // Merge with existing calendar events
        }}
        onSyncStatusChange={(connected) => {
          setIsGoogleConnected(connected);
        }}
      />
      
      {/* Display combined events */}
      <div>
        {googleEvents.map(event => (
          <div key={event.id}>
            {event.icon} {event.title} - {event.startTime}
          </div>
        ))}
      </div>
    </div>
  );
};