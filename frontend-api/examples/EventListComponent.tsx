/**
 * Example React component showing event listing with RSVP functionality
 */

import { useState, useEffect } from 'react'
import { eventService } from '../services/index'
import { Event, EventType } from '../types'

export function EventListComponent() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<EventType | ''>('')
  const [rsvpingEventId, setRsvpingEventId] = useState<string | null>(null)
  
  useEffect(() => {
    loadEvents()
  }, [filter])
  
  const loadEvents = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const params = filter ? { type: filter } : undefined
      const response = await eventService.getUpcomingEvents(params)
      
      if (response.success && response.data) {
        setEvents(response.data)
      } else {
        setError(response.error || 'Failed to load events')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }
  
  const handleRsvp = async (eventId: string) => {
    setRsvpingEventId(eventId)
    
    try {
      const response = await eventService.rsvpEvent(eventId)
      
      if (response.success) {
        // Update the event in the list to show RSVP status
        setEvents(events.map(event => 
          event.id === eventId 
            ? { ...event, attendeeCount: (event.attendeeCount || 0) + 1 }
            : event
        ))
        alert('Successfully RSVP\'d to event!')
      } else {
        alert(response.error || 'Failed to RSVP')
      }
    } catch (err) {
      alert('Failed to RSVP to event')
    } finally {
      setRsvpingEventId(null)
    }
  }
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  if (loading && events.length === 0) {
    return <div className="loading">Loading events...</div>
  }
  
  return (
    <div className="events-container">
      <div className="events-header">
        <h2>Upcoming Events</h2>
        
        <select 
          value={filter} 
          onChange={(e) => setFilter(e.target.value as EventType | '')}
          className="event-filter"
        >
          <option value="">All Events</option>
          <option value="SOCIAL">Social</option>
          <option value="SPORTS">Sports</option>
          <option value="TRIP">Trip</option>
          <option value="ILM">Ilm</option>
          <option value="CAFE_MEETUP">Cafe Meetup</option>
          <option value="VOLUNTEER">Volunteer</option>
          <option value="MONTHLY_EVENT">Monthly Event</option>
          <option value="LOCAL_TRIP">Local Trip</option>
        </select>
      </div>
      
      {error && (
        <div className="error-message">{error}</div>
      )}
      
      <div className="events-grid">
        {events.map(event => (
          <div key={event.id} className="event-card">
            {event.coverImage && (
              <img 
                src={event.coverImage} 
                alt={event.title}
                className="event-cover"
              />
            )}
            
            <div className="event-content">
              <span className="event-type">{event.type.replace('_', ' ')}</span>
              <h3>{event.title}</h3>
              <p className="event-description">{event.description}</p>
              
              <div className="event-details">
                <div className="event-date">
                  📅 {formatDate(event.date)}
                </div>
                <div className="event-location">
                  📍 {event.location}
                </div>
                {event.maxAttendees && (
                  <div className="event-attendees">
                    👥 {event.attendeeCount || 0} / {event.maxAttendees} attending
                  </div>
                )}
              </div>
              
              <div className="event-actions">
                <button 
                  onClick={() => handleRsvp(event.id)}
                  disabled={rsvpingEventId === event.id}
                  className="rsvp-button"
                >
                  {rsvpingEventId === event.id ? 'Processing...' : 'RSVP'}
                </button>
                
                <a href={`/events/${event.id}`} className="view-details">
                  View Details →
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {events.length === 0 && !loading && (
        <div className="no-events">
          No upcoming events found.
        </div>
      )}
    </div>
  )
}