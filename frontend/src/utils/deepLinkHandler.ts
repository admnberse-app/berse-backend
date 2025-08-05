// Deep Link Handler for BerseMukha Events
// Handles URLs like: https://bersemuka.app/event/{eventId}

import { NavigateFunction } from 'react-router-dom';

export interface EventContext {
  id: string;
  title: string;
  date: string;
  location: string;
  capacity: number;
  registeredCount: number;
  description: string;
  type: 'bersemukha' | 'berseconnect' | 'community';
}

// Mock event data for deep linking
const mockEventData: Record<string, EventContext> = {
  'bersemukha-nov-2024': {
    id: 'bersemukha-nov-2024',
    title: 'BerseMukha Social Networking - November 2024',
    date: 'November 25, 2024 • 4:00 PM',
    location: 'KLCC Convention Centre, KL',
    capacity: 105,
    registeredCount: 67,
    description: 'Join us for an evening of meaningful connections and diverse conversations. Experience our unique group rotation system designed to help you meet people from different backgrounds and professions.',
    type: 'bersemukha'
  },
  'bersemukha-dec-2024': {
    id: 'bersemukha-dec-2024',
    title: 'BerseMukha Year-End Celebration',
    date: 'December 15, 2024 • 6:00 PM',
    location: 'Pavilion KL, Rooftop Garden',
    capacity: 105,
    registeredCount: 23,
    description: 'End the year with new connections! Our signature diversity-based grouping ensures you meet people from all walks of life.',
    type: 'bersemukha'
  },
  'community-workshop-jan': {
    id: 'community-workshop-jan',
    title: 'Professional Networking Workshop',
    date: 'January 10, 2025 • 7:00 PM',
    location: 'Bangsar Village II, Meeting Room',
    capacity: 50,
    registeredCount: 31,
    description: 'Learn effective networking strategies while practicing with diverse groups of professionals.',
    type: 'community'
  }
};

export class DeepLinkHandler {
  private static instance: DeepLinkHandler;
  private navigate: NavigateFunction | null = null;

  static getInstance(): DeepLinkHandler {
    if (!DeepLinkHandler.instance) {
      DeepLinkHandler.instance = new DeepLinkHandler();
    }
    return DeepLinkHandler.instance;
  }

  setNavigate(navigate: NavigateFunction) {
    this.navigate = navigate;
  }

  // Handle incoming deep links for events
  handleEventDeepLink(eventId: string, user?: any): void {
    console.log(`🔗 Deep link triggered for event: ${eventId}`);
    
    const eventContext = this.getEventContext(eventId);
    if (!eventContext) {
      console.error(`❌ Event not found: ${eventId}`);
      this.navigate?.('/');
      return;
    }

    // Store event context in session storage
    sessionStorage.setItem('pendingEventContext', JSON.stringify(eventContext));

    // Check if user is authenticated
    if (!user?.isAuthenticated) {
      console.log(`👤 User not authenticated, redirecting to registration with event context`);
      // Redirect to registration with event context
      this.navigate?.(`/register?event=${eventId}&returnTo=/connect`);
    } else {
      console.log(`✅ User authenticated, navigating to BerseConnect with highlight`);
      // Navigate directly to BerseConnect with specific event highlighted
      this.navigate?.(`/connect?highlight=${eventId}`);
    }
  }

  // Get event context from event ID
  getEventContext(eventId: string): EventContext | null {
    return mockEventData[eventId] || null;
  }

  // Get pending event context from session storage
  getPendingEventContext(): EventContext | null {
    const stored = sessionStorage.getItem('pendingEventContext');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.error('Failed to parse pending event context:', error);
        sessionStorage.removeItem('pendingEventContext');
      }
    }
    return null;
  }

  // Clear pending event context
  clearPendingEventContext(): void {
    sessionStorage.removeItem('pendingEventContext');
  }

  // Handle URL parameters for event highlighting
  handleEventHighlight(location: Location): string | null {
    const urlParams = new URLSearchParams(location.search);
    const highlightEventId = urlParams.get('highlight');
    
    if (highlightEventId) {
      console.log(`✨ Highlighting event: ${highlightEventId}`);
      return highlightEventId;
    }
    
    return null;
  }

  // Generate shareable event URL
  generateEventURL(eventId: string, baseURL = 'https://bersemuka.app'): string {
    return `${baseURL}/event/${eventId}`;
  }

  // Handle social media sharing
  generateSocialShareContent(eventId: string): {
    whatsapp: string;
    instagram: string;
    facebook: string;
    twitter: string;
  } {
    const eventContext = this.getEventContext(eventId);
    if (!eventContext) {
      throw new Error(`Event not found: ${eventId}`);
    }

    const eventURL = this.generateEventURL(eventId);
    const baseMessage = `🎯 Join me at ${eventContext.title}!\\n\\n📅 ${eventContext.date}\\n📍 ${eventContext.location}\\n\\n${eventContext.description}\\n\\nRegister now:`;

    return {
      whatsapp: `${baseMessage} ${eventURL}`,
      instagram: `Join me at ${eventContext.title} on ${eventContext.date}! Link in bio 🔗 #BerseMukha #Networking #KL`,
      facebook: `${baseMessage} ${eventURL}`,
      twitter: `🎯 Exciting networking event coming up! ${eventContext.title} on ${eventContext.date}. Register: ${eventURL} #BerseMukha #Networking`
    };
  }

  // Analytics tracking for deep links
  trackDeepLinkEvent(eventId: string, source: 'instagram' | 'whatsapp' | 'facebook' | 'twitter' | 'direct' = 'direct'): void {
    // Track analytics
    console.log(`📊 Deep link analytics:`, {
      eventId,
      source,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    });

    // Store in localStorage for analytics
    const analyticsData = JSON.parse(localStorage.getItem('deepLinkAnalytics') || '[]');
    analyticsData.push({
      eventId,
      source,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('deepLinkAnalytics', JSON.stringify(analyticsData.slice(-100))); // Keep last 100 entries
  }

  // Get all available events for listings
  getAllEvents(): EventContext[] {
    return Object.values(mockEventData);
  }

  // Search events by criteria
  searchEvents(query: string): EventContext[] {
    const lowercaseQuery = query.toLowerCase();
    return Object.values(mockEventData).filter(event => 
      event.title.toLowerCase().includes(lowercaseQuery) ||
      event.description.toLowerCase().includes(lowercaseQuery) ||
      event.location.toLowerCase().includes(lowercaseQuery)
    );
  }

  // Check if event is full
  isEventFull(eventId: string): boolean {
    const event = this.getEventContext(eventId);
    return event ? event.registeredCount >= event.capacity : false;
  }

  // Get event registration status
  getEventRegistrationStatus(eventId: string): {
    available: number;
    percentage: number;
    status: 'open' | 'filling-fast' | 'almost-full' | 'full';
  } {
    const event = this.getEventContext(eventId);
    if (!event) {
      return { available: 0, percentage: 0, status: 'full' };
    }

    const available = event.capacity - event.registeredCount;
    const percentage = (event.registeredCount / event.capacity) * 100;

    let status: 'open' | 'filling-fast' | 'almost-full' | 'full' = 'open';
    if (percentage >= 100) status = 'full';
    else if (percentage >= 90) status = 'almost-full';
    else if (percentage >= 70) status = 'filling-fast';

    return { available, percentage, status };
  }
}

// Export singleton instance
export const deepLinkHandler = DeepLinkHandler.getInstance();

// Utility functions for components
export const getEventFromURL = (): EventContext | null => {
  return deepLinkHandler.getPendingEventContext();
};

export const handleEventDeepLink = (eventId: string, navigate: NavigateFunction, user?: any) => {
  deepLinkHandler.setNavigate(navigate);
  deepLinkHandler.handleEventDeepLink(eventId, user);
};

export const generateEventShareContent = (eventId: string) => {
  return deepLinkHandler.generateSocialShareContent(eventId);
};

export default deepLinkHandler;