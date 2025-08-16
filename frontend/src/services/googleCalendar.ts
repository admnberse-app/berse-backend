import { gapi } from 'gapi-script';

// Google Calendar API configuration
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_CLIENT_ID';
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || 'YOUR_API_KEY';
const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'];
const SCOPES = 'https://www.googleapis.com/auth/calendar';

interface CalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  location?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  attendees?: Array<{ email: string }>;
  reminders?: {
    useDefault: boolean;
    overrides?: Array<{
      method: string;
      minutes: number;
    }>;
  };
}

class GoogleCalendarService {
  private isInitialized = false;
  private isSignedIn = false;

  // Initialize the Google API client
  async initClient(): Promise<void> {
    if (this.isInitialized) return;

    return new Promise((resolve, reject) => {
      gapi.load('client:auth2', async () => {
        try {
          await gapi.client.init({
            apiKey: API_KEY,
            clientId: CLIENT_ID,
            discoveryDocs: DISCOVERY_DOCS,
            scope: SCOPES,
          });

          // Listen for sign-in state changes
          gapi.auth2.getAuthInstance().isSignedIn.listen((signedIn: boolean) => {
            this.isSignedIn = signedIn;
          });

          // Handle initial sign-in state
          this.isSignedIn = gapi.auth2.getAuthInstance().isSignedIn.get();
          this.isInitialized = true;
          resolve();
        } catch (error) {
          console.error('Error initializing Google Calendar client:', error);
          reject(error);
        }
      });
    });
  }

  // Sign in to Google
  async signIn(): Promise<void> {
    if (!this.isInitialized) {
      await this.initClient();
    }
    
    if (!this.isSignedIn) {
      await gapi.auth2.getAuthInstance().signIn();
      this.isSignedIn = true;
    }
  }

  // Sign out from Google
  async signOut(): Promise<void> {
    if (this.isSignedIn) {
      await gapi.auth2.getAuthInstance().signOut();
      this.isSignedIn = false;
    }
  }

  // Check if user is signed in
  isUserSignedIn(): boolean {
    return this.isSignedIn;
  }

  // Get upcoming events from Google Calendar
  async getUpcomingEvents(maxResults = 10): Promise<CalendarEvent[]> {
    if (!this.isSignedIn) {
      throw new Error('User must be signed in to fetch events');
    }

    try {
      const response = await gapi.client.calendar.events.list({
        calendarId: 'primary',
        timeMin: new Date().toISOString(),
        showDeleted: false,
        singleEvents: true,
        maxResults: maxResults,
        orderBy: 'startTime',
      });

      return response.result.items || [];
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  }

  // Get events for a specific date range
  async getEventsInRange(startDate: Date, endDate: Date): Promise<CalendarEvent[]> {
    if (!this.isSignedIn) {
      throw new Error('User must be signed in to fetch events');
    }

    try {
      const response = await gapi.client.calendar.events.list({
        calendarId: 'primary',
        timeMin: startDate.toISOString(),
        timeMax: endDate.toISOString(),
        showDeleted: false,
        singleEvents: true,
        orderBy: 'startTime',
      });

      return response.result.items || [];
    } catch (error) {
      console.error('Error fetching events in range:', error);
      throw error;
    }
  }

  // Create a new event in Google Calendar
  async createEvent(event: CalendarEvent): Promise<CalendarEvent> {
    if (!this.isSignedIn) {
      throw new Error('User must be signed in to create events');
    }

    try {
      const response = await gapi.client.calendar.events.insert({
        calendarId: 'primary',
        resource: event,
      });

      return response.result;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }

  // Update an existing event
  async updateEvent(eventId: string, event: CalendarEvent): Promise<CalendarEvent> {
    if (!this.isSignedIn) {
      throw new Error('User must be signed in to update events');
    }

    try {
      const response = await gapi.client.calendar.events.update({
        calendarId: 'primary',
        eventId: eventId,
        resource: event,
      });

      return response.result;
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  }

  // Delete an event from Google Calendar
  async deleteEvent(eventId: string): Promise<void> {
    if (!this.isSignedIn) {
      throw new Error('User must be signed in to delete events');
    }

    try {
      await gapi.client.calendar.events.delete({
        calendarId: 'primary',
        eventId: eventId,
      });
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  }

  // Convert app event to Google Calendar format
  formatEventForGoogle(appEvent: any): CalendarEvent {
    return {
      summary: appEvent.title,
      description: appEvent.description,
      location: appEvent.location,
      start: {
        dateTime: appEvent.startTime,
        timeZone: 'Asia/Kuala_Lumpur',
      },
      end: {
        dateTime: appEvent.endTime,
        timeZone: 'Asia/Kuala_Lumpur',
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'popup', minutes: 30 },
        ],
      },
    };
  }

  // Convert Google Calendar event to app format
  formatEventFromGoogle(googleEvent: CalendarEvent): any {
    return {
      id: googleEvent.id,
      title: googleEvent.summary,
      description: googleEvent.description || '',
      location: googleEvent.location || '',
      startTime: googleEvent.start.dateTime || googleEvent.start.date,
      endTime: googleEvent.end.dateTime || googleEvent.end.date,
      source: 'google',
      icon: '📅',
      color: '#4285F4', // Google blue
    };
  }
}

export const googleCalendarService = new GoogleCalendarService();