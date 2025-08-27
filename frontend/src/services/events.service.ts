import axios from 'axios';

const API_BASE_URL = window.location.hostname === 'localhost' 
  ? '' 
  : 'https://api.berse.app';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  organizer: any;
  [key: string]: any;
}

class EventsService {
  /**
   * Get all events from backend and merge with local events
   */
  async getAllEvents(): Promise<Event[]> {
    try {
      const token = localStorage.getItem('bersemuka_token');
      const headers: any = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Try to fetch from backend
      try {
        const response = await axios.get(`${API_BASE_URL}/api/v1/events`, {
          headers,
          timeout: 5000 // 5 second timeout
        });

        if (response.data?.success && response.data?.data) {
          const backendEvents = response.data.data;
          
          // Save to localStorage for offline access
          localStorage.setItem('cached_backend_events', JSON.stringify(backendEvents));
          localStorage.setItem('last_events_sync', new Date().toISOString());
          
          // Merge with local events (remove duplicates)
          const localEvents = JSON.parse(localStorage.getItem('berseConnectEvents') || '[]');
          const userCreatedEvents = JSON.parse(localStorage.getItem('userCreatedEvents') || '[]');
          
          // Combine all events
          const allEvents = [...backendEvents, ...localEvents, ...userCreatedEvents];
          
          // Remove duplicates based on ID
          const uniqueEvents = allEvents.reduce((acc: Event[], event: Event) => {
            if (!acc.find(e => e.id === event.id)) {
              acc.push(event);
            }
            return acc;
          }, []);
          
          // Sort by date (most recent first)
          uniqueEvents.sort((a, b) => 
            new Date(b.date + ' ' + (b.time || '00:00')).getTime() - 
            new Date(a.date + ' ' + (a.time || '00:00')).getTime()
          );
          
          return uniqueEvents;
        }
      } catch (error) {
        console.error('Failed to fetch from backend, using cached data:', error);
      }

      // Fallback to cached data if backend fails
      const cachedBackendEvents = JSON.parse(localStorage.getItem('cached_backend_events') || '[]');
      const localEvents = JSON.parse(localStorage.getItem('berseConnectEvents') || '[]');
      const userCreatedEvents = JSON.parse(localStorage.getItem('userCreatedEvents') || '[]');
      
      const allEvents = [...cachedBackendEvents, ...localEvents, ...userCreatedEvents];
      
      // Remove duplicates
      const uniqueEvents = allEvents.reduce((acc: Event[], event: Event) => {
        if (!acc.find(e => e.id === event.id)) {
          acc.push(event);
        }
        return acc;
      }, []);
      
      return uniqueEvents;
      
    } catch (error) {
      console.error('Error fetching events:', error);
      
      // Last resort: return local events only
      const localEvents = JSON.parse(localStorage.getItem('berseConnectEvents') || '[]');
      const userCreatedEvents = JSON.parse(localStorage.getItem('userCreatedEvents') || '[]');
      return [...localEvents, ...userCreatedEvents];
    }
  }

  /**
   * Create a new event
   */
  async createEvent(eventData: Partial<Event>): Promise<Event> {
    try {
      const token = localStorage.getItem('bersemuka_token');
      
      if (token) {
        // Try to save to backend
        try {
          const response = await axios.post(
            `${API_BASE_URL}/api/v1/events`,
            eventData,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              timeout: 5000
            }
          );

          if (response.data?.success && response.data?.data) {
            const createdEvent = response.data.data;
            
            // Also save locally for immediate access
            const userEvents = JSON.parse(localStorage.getItem('userCreatedEvents') || '[]');
            userEvents.unshift(createdEvent);
            localStorage.setItem('userCreatedEvents', JSON.stringify(userEvents));
            
            return createdEvent;
          }
        } catch (error) {
          console.error('Failed to save to backend, saving locally:', error);
        }
      }

      // Fallback: Save locally with generated ID
      const localEvent = {
        ...eventData,
        id: eventData.id || `event-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Event;
      
      const userEvents = JSON.parse(localStorage.getItem('userCreatedEvents') || '[]');
      userEvents.unshift(localEvent);
      localStorage.setItem('userCreatedEvents', JSON.stringify(userEvents));
      
      // Mark for later sync
      const pendingSync = JSON.parse(localStorage.getItem('pending_event_sync') || '[]');
      pendingSync.push(localEvent.id);
      localStorage.setItem('pending_event_sync', JSON.stringify(pendingSync));
      
      return localEvent;
      
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }

  /**
   * Sync local events with backend
   */
  async syncEvents(): Promise<void> {
    try {
      const token = localStorage.getItem('bersemuka_token');
      if (!token) return;
      
      const pendingSync = JSON.parse(localStorage.getItem('pending_event_sync') || '[]');
      if (pendingSync.length === 0) return;
      
      const userEvents = JSON.parse(localStorage.getItem('userCreatedEvents') || '[]');
      const syncedIds: string[] = [];
      
      for (const eventId of pendingSync) {
        const event = userEvents.find((e: Event) => e.id === eventId);
        if (!event) continue;
        
        try {
          const response = await axios.post(
            `${API_BASE_URL}/api/v1/events`,
            event,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              timeout: 5000
            }
          );
          
          if (response.data?.success) {
            syncedIds.push(eventId);
            
            // Update local event with backend ID if different
            if (response.data.data?.id !== eventId) {
              const updatedEvents = userEvents.map((e: Event) => 
                e.id === eventId ? { ...e, id: response.data.data.id } : e
              );
              localStorage.setItem('userCreatedEvents', JSON.stringify(updatedEvents));
            }
          }
        } catch (error) {
          console.error(`Failed to sync event ${eventId}:`, error);
        }
      }
      
      // Remove synced events from pending list
      const remainingPending = pendingSync.filter((id: string) => !syncedIds.includes(id));
      localStorage.setItem('pending_event_sync', JSON.stringify(remainingPending));
      
      if (syncedIds.length > 0) {
        console.log(`Successfully synced ${syncedIds.length} events`);
      }
      
    } catch (error) {
      console.error('Error syncing events:', error);
    }
  }

  /**
   * Get events for a specific user
   */
  async getUserEvents(userId: string): Promise<Event[]> {
    try {
      const allEvents = await this.getAllEvents();
      return allEvents.filter(event => 
        event.organizer?.id === userId || 
        event.organizer?.userId === userId ||
        event.organizerId === userId
      );
    } catch (error) {
      console.error('Error getting user events:', error);
      return [];
    }
  }
}

export const eventsService = new EventsService();
export default eventsService;