/**
 * Event Service
 * Handles event management, RSVP, and check-ins
 */

import { API_CONFIG } from '../config/api.config'
import { api, uploadFile } from '../utils/api-client'
import { 
  Event,
  ApiResponse,
  GetEventsParams,
  CreateEventRequest,
  UpdateEventRequest,
  CheckInRequest,
  EventAttendee
} from '../types'

class EventService {
  /**
   * Get list of events
   */
  async getEvents(params?: GetEventsParams): Promise<ApiResponse<Event[]>> {
    try {
      return await api.get<Event[]>(API_CONFIG.ENDPOINTS.EVENTS.LIST, { params })
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch events',
      }
    }
  }
  
  /**
   * Get upcoming events
   */
  async getUpcomingEvents(params?: Omit<GetEventsParams, 'upcoming'>): Promise<ApiResponse<Event[]>> {
    return this.getEvents({ ...params, upcoming: true })
  }
  
  /**
   * Get event by ID
   */
  async getEventById(eventId: string): Promise<ApiResponse<Event>> {
    try {
      return await api.get<Event>(API_CONFIG.ENDPOINTS.EVENTS.GET_BY_ID(eventId))
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch event details',
      }
    }
  }
  
  /**
   * Create new event (Admin/Moderator only)
   */
  async createEvent(eventData: CreateEventRequest): Promise<ApiResponse<Event>> {
    try {
      return await api.post<Event>(API_CONFIG.ENDPOINTS.EVENTS.CREATE, eventData)
    } catch (error) {
      return {
        success: false,
        error: 'Failed to create event',
      }
    }
  }
  
  /**
   * Update event (Admin/Moderator only)
   */
  async updateEvent(eventId: string, eventData: UpdateEventRequest): Promise<ApiResponse<Event>> {
    try {
      return await api.put<Event>(
        API_CONFIG.ENDPOINTS.EVENTS.UPDATE(eventId),
        eventData
      )
    } catch (error) {
      return {
        success: false,
        error: 'Failed to update event',
      }
    }
  }
  
  /**
   * Upload event cover image
   */
  async uploadEventCover(eventId: string, file: File): Promise<ApiResponse<{ url: string }>> {
    try {
      return await uploadFile(
        `${API_CONFIG.ENDPOINTS.EVENTS.UPDATE(eventId)}/cover`,
        file,
        'coverImage'
      )
    } catch (error) {
      return {
        success: false,
        error: 'Failed to upload event cover',
      }
    }
  }
  
  /**
   * RSVP to event
   */
  async rsvpEvent(eventId: string): Promise<ApiResponse<EventAttendee>> {
    try {
      return await api.post<EventAttendee>(
        API_CONFIG.ENDPOINTS.EVENTS.RSVP(eventId)
      )
    } catch (error) {
      return {
        success: false,
        error: 'Failed to RSVP to event',
      }
    }
  }
  
  /**
   * Cancel RSVP
   */
  async cancelRsvp(eventId: string): Promise<ApiResponse<void>> {
    try {
      return await api.delete<void>(
        API_CONFIG.ENDPOINTS.EVENTS.RSVP(eventId)
      )
    } catch (error) {
      return {
        success: false,
        error: 'Failed to cancel RSVP',
      }
    }
  }
  
  /**
   * Check-in to event (with QR code data)
   */
  async checkInEvent(data: CheckInRequest): Promise<ApiResponse<{
    success: boolean
    points: number
    message: string
  }>> {
    try {
      return await api.post(API_CONFIG.ENDPOINTS.EVENTS.CHECKIN, data)
    } catch (error) {
      return {
        success: false,
        error: 'Failed to check-in to event',
      }
    }
  }
  
  /**
   * Get user's events (attending/attended)
   */
  async getUserEvents(userId?: string, filter?: 'upcoming' | 'past' | 'all'): Promise<ApiResponse<Event[]>> {
    try {
      const params = { userId, filter }
      return await api.get<Event[]>('/events/user', { params })
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch user events',
      }
    }
  }
  
  /**
   * Get event attendees
   */
  async getEventAttendees(eventId: string): Promise<ApiResponse<EventAttendee[]>> {
    try {
      return await api.get<EventAttendee[]>(`${API_CONFIG.ENDPOINTS.EVENTS.GET_BY_ID(eventId)}/attendees`)
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch attendees',
      }
    }
  }
  
  /**
   * Generate event QR code (for organizers)
   */
  async generateEventQRCode(eventId: string): Promise<ApiResponse<{ qrCode: string }>> {
    try {
      return await api.get(`${API_CONFIG.ENDPOINTS.EVENTS.GET_BY_ID(eventId)}/qrcode`)
    } catch (error) {
      return {
        success: false,
        error: 'Failed to generate QR code',
      }
    }
  }
  
  /**
   * Get event statistics (for organizers)
   */
  async getEventStats(eventId: string): Promise<ApiResponse<{
    totalRsvp: number
    checkedIn: number
    waitlisted: number
    cancelled: number
  }>> {
    try {
      return await api.get(`${API_CONFIG.ENDPOINTS.EVENTS.GET_BY_ID(eventId)}/stats`)
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch event statistics',
      }
    }
  }
  
  /**
   * Search events by keyword
   */
  async searchEvents(query: string, params?: GetEventsParams): Promise<ApiResponse<Event[]>> {
    try {
      return await api.get<Event[]>(API_CONFIG.ENDPOINTS.EVENTS.LIST, { 
        params: { ...params, q: query }
      })
    } catch (error) {
      return {
        success: false,
        error: 'Failed to search events',
      }
    }
  }
  
  /**
   * Get recommended events based on user interests
   */
  async getRecommendedEvents(): Promise<ApiResponse<Event[]>> {
    try {
      return await api.get<Event[]>('/events/recommended')
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch recommended events',
      }
    }
  }
}

// Create singleton instance
const eventService = new EventService()

export default eventService