import axios from 'axios';

// Sync local-only events to backend when connection is available
export const syncLocalEventsToBackend = async (userEmail?: string, authToken?: string) => {
  if (!authToken || !userEmail) return;
  
  try {
    // Get all local events
    const localEvents = JSON.parse(localStorage.getItem('userCreatedEvents') || '[]');
    
    // Filter for local-only events created by current user
    const eventsToSync = localEvents.filter((event: any) => 
      event.syncStatus === 'local-only' && 
      event.creatorEmail === userEmail
    );
    
    if (eventsToSync.length === 0) return;
    
    const API_BASE_URL = window.location.hostname === 'berse.app' || window.location.hostname === 'www.berse.app'
      ? 'https://api.berse.app'
      : '';
    
    console.log(`Attempting to sync ${eventsToSync.length} local events to backend...`);
    
    // Try to sync each event
    for (const event of eventsToSync) {
      try {
        const response = await axios.post(
          `${API_BASE_URL}/api/v1/events`,
          {
            title: event.title,
            description: event.description,
            date: event.date,
            time: event.time,
            endTime: event.endTime,
            location: event.location,
            venue: event.venue,
            category: event.category,
            price: event.price,
            maxAttendees: event.maxAttendees,
            isOnline: event.isOnline,
            meetingLink: event.meetingLink,
            whatsappGroup: event.whatsappGroup,
            mapLink: event.mapLink,
            tags: event.tags,
            requirements: event.requirements,
            highlights: event.highlights,
            agenda: event.agenda,
            coverImage: event.coverImage,
            hosts: event.hosts,
            organizingCommunity: event.organizingCommunity,
            registrationDeadline: event.registrationDeadline
          },
          {
            headers: {
              'Authorization': `Bearer ${authToken}`
            }
          }
        );
        
        if (response.data.success) {
          console.log(`Event "${event.title}" synced successfully`);
          
          // Update the event's sync status in localStorage
          const updatedLocalEvents = localEvents.map((e: any) => {
            if (e.id === event.id) {
              return {
                ...e,
                syncStatus: 'synced',
                backendId: response.data.data.id
              };
            }
            return e;
          });
          
          localStorage.setItem('userCreatedEvents', JSON.stringify(updatedLocalEvents));
        }
      } catch (error) {
        console.error(`Failed to sync event "${event.title}":`, error);
      }
    }
    
    console.log('Event sync completed');
  } catch (error) {
    console.error('Error during event sync:', error);
  }
};

// Check if an event belongs to the current user
export const isUserEvent = (event: any, userEmail?: string, userId?: string): boolean => {
  if (!event) return false;
  
  // Check by creator email
  if (event.creatorEmail && userEmail) {
    return event.creatorEmail === userEmail;
  }
  
  // Check by creator ID
  if (event.creatorId && userId) {
    return event.creatorId === userId;
  }
  
  // Check by organizer name (fallback for old events)
  if (event.organizer && userEmail) {
    // This is less reliable but better than nothing
    return event.organizer.toLowerCase().includes(userEmail.split('@')[0].toLowerCase());
  }
  
  return false;
};

// Clean up old cached events that are no longer relevant
export const cleanupOldEvents = () => {
  try {
    const cachedEvents = localStorage.getItem('cached_events');
    if (cachedEvents) {
      const events = JSON.parse(cachedEvents);
      const today = new Date();
      
      // Remove events older than 30 days
      const recentEvents = events.filter((event: any) => {
        const eventDate = new Date(event.date);
        const daysDiff = Math.floor((today.getTime() - eventDate.getTime()) / (1000 * 60 * 60 * 24));
        return daysDiff <= 30;
      });
      
      if (recentEvents.length !== events.length) {
        localStorage.setItem('cached_events', JSON.stringify(recentEvents));
        console.log(`Cleaned up ${events.length - recentEvents.length} old events from cache`);
      }
    }
  } catch (error) {
    console.error('Error cleaning up old events:', error);
  }
};