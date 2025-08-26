import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { makeAuthenticatedRequest } from '../utils/authUtils';

const Container = styled.div`
  width: 100%;
`;

const SearchSection = styled.div`
  margin-bottom: 16px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #E0E0E0;
  border-radius: 8px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #2fce98;
  }
`;

const EventTypeFilters = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 8px;
  flex-wrap: wrap;
`;

const FilterChip = styled.button<{ active?: boolean }>`
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 12px;
  border: 1px solid ${({ active }) => active ? '#2fce98' : '#E0E0E0'};
  background: ${({ active }) => active ? '#E8FFF8' : 'white'};
  color: ${({ active }) => active ? '#2fce98' : '#666'};
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: #2fce98;
    background: ${({ active }) => active ? '#E8FFF8' : '#F8F8F8'};
  }
`;

const EventsList = styled.div`
  max-height: 250px;
  overflow-y: auto;
  border: 1px solid #E0E0E0;
  border-radius: 8px;
  background: white;
  margin-bottom: 12px;
`;

const EventItem = styled.div<{ selected?: boolean }>`
  padding: 12px;
  border-bottom: 1px solid #F0F0F0;
  cursor: pointer;
  transition: all 0.2s;
  background: ${({ selected }) => selected ? '#E8FFF8' : 'white'};
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background: ${({ selected }) => selected ? '#E8FFF8' : '#F8F8F8'};
  }
`;

const EventHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 4px;
`;

const EventName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #333;
`;

const EventDate = styled.div`
  font-size: 12px;
  color: #999;
  white-space: nowrap;
`;

const EventDetails = styled.div`
  font-size: 12px;
  color: #666;
  margin-top: 4px;
`;

const EventType = styled.span<{ type: string }>`
  display: inline-block;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 12px;
  margin-left: 8px;
  background: ${({ type }) => {
    switch(type) {
      case 'sports': return '#FFE4E1';
      case 'social': return '#E8FFF8';
      case 'volunteer': return '#FFF4E6';
      case 'educational': return '#E6F3FF';
      case 'networking': return '#F3E6FF';
      default: return '#F0F0F0';
    }
  }};
  color: ${({ type }) => {
    switch(type) {
      case 'sports': return '#DC143C';
      case 'social': return '#2fce98';
      case 'volunteer': return '#F59E0B';
      case 'educational': return '#3B82F6';
      case 'networking': return '#8B5CF6';
      default: return '#666';
    }
  }};
`;

const SelectedEvents = styled.div`
  margin-top: 16px;
`;

const SelectedEventCard = styled.div`
  background: white;
  border: 1px solid #E0E0E0;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
`;

const EventCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: #DC143C;
  cursor: pointer;
  font-size: 12px;
  padding: 4px 8px;
  
  &:hover {
    background: #FFE4E1;
    border-radius: 4px;
  }
`;

const PeopleMetSection = styled.div`
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #F0F0F0;
`;

const PeopleMetLabel = styled.div`
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
`;

const AddPersonButton = styled.button`
  font-size: 12px;
  padding: 4px 8px;
  background: #F0F0F0;
  border: none;
  border-radius: 4px;
  color: #666;
  cursor: pointer;
  
  &:hover {
    background: #E0E0E0;
  }
`;

const PersonBadge = styled.span`
  display: inline-block;
  padding: 4px 8px;
  background: #E8FFF8;
  border: 1px solid #2fce98;
  border-radius: 12px;
  font-size: 11px;
  margin-right: 6px;
  margin-bottom: 4px;
`;

const PersonSearchInput = styled.input`
  width: 100%;
  padding: 8px;
  border: 1px solid #E0E0E0;
  border-radius: 6px;
  font-size: 12px;
  margin-bottom: 8px;
  
  &:focus {
    outline: none;
    border-color: #2fce98;
  }
`;

const PersonList = styled.div`
  max-height: 120px;
  overflow-y: auto;
  border: 1px solid #E0E0E0;
  border-radius: 6px;
  margin-bottom: 8px;
`;

const PersonItem = styled.div<{ selected?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  cursor: pointer;
  background: ${({ selected }) => selected ? '#E8FFF8' : 'white'};
  
  &:hover {
    background: ${({ selected }) => selected ? '#E8FFF8' : '#F8F8F8'};
  }
`;

const PersonAvatar = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 10px;
`;

interface Event {
  id: string;
  name: string;
  type: 'sports' | 'social' | 'volunteer' | 'educational' | 'networking';
  date: string;
  location?: string;
  organizer?: string;
}

interface Person {
  id: string;
  name: string;
  profilePicture?: string;
}

interface EventAttendance {
  event: Event;
  peopleMet: Person[];
}

interface EventsAttendedProps {
  selectedEvents: EventAttendance[];
  onChange: (events: EventAttendance[]) => void;
}

export const EventsAttended: React.FC<EventsAttendedProps> = ({
  selectedEvents,
  onChange
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // People search states
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [personSearchTerm, setPersonSearchTerm] = useState('');
  const [availablePeople, setAvailablePeople] = useState<Person[]>([]);

  // Load events from connect database
  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setIsLoading(true);
    try {
      const response = await makeAuthenticatedRequest(
        'GET',
        '/api/v1/events'
      );
      
      if (response.data.success) {
        setEvents(response.data.data || []);
      }
    } catch (error) {
      console.error('Failed to load events:', error);
      // Use mock data for demo
      setEvents([
        {
          id: '1',
          name: 'BerseMukha Coffee Meetup #12',
          type: 'social',
          date: '2024-03-15',
          location: 'Mukha Cafe, KL',
          organizer: 'Ahl Umran'
        },
        {
          id: '2',
          name: 'Badminton Tournament 2024',
          type: 'sports',
          date: '2024-03-10',
          location: 'Sports Arena, Shah Alam'
        },
        {
          id: '3',
          name: 'Community Service Day',
          type: 'volunteer',
          date: '2024-03-08',
          location: 'Various locations'
        },
        {
          id: '4',
          name: 'Tech Talk: AI & Future',
          type: 'educational',
          date: '2024-03-05',
          location: 'Innovation Hub, Cyberjaya'
        },
        {
          id: '5',
          name: 'Professional Networking Night',
          type: 'networking',
          date: '2024-03-01',
          location: 'Hilton KL'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Search people for events
  useEffect(() => {
    const searchPeople = async () => {
      if (personSearchTerm.length < 2) {
        setAvailablePeople([]);
        return;
      }

      try {
        const response = await makeAuthenticatedRequest(
          'GET',
          `/api/v1/matching/search?query=${encodeURIComponent(personSearchTerm)}`
        );
        
        if (response.data.success) {
          setAvailablePeople(response.data.data?.map((p: any) => ({
            id: p.id,
            name: p.fullName || p.username,
            profilePicture: p.profilePicture
          })) || []);
        }
      } catch (error) {
        console.error('Failed to search people:', error);
        // Mock data for demo
        setAvailablePeople([
          { id: '1', name: 'Ahmad Rahman' },
          { id: '2', name: 'Sarah Abdullah' },
          { id: '3', name: 'Mohammed Ali' }
        ]);
      }
    };

    const debounceTimer = setTimeout(searchPeople, 300);
    return () => clearTimeout(debounceTimer);
  }, [personSearchTerm]);

  const handleToggleEvent = (event: Event) => {
    const exists = selectedEvents.find(e => e.event.id === event.id);
    
    if (exists) {
      onChange(selectedEvents.filter(e => e.event.id !== event.id));
    } else {
      onChange([...selectedEvents, { event, peopleMet: [] }]);
    }
  };

  const handleRemoveEvent = (eventId: string) => {
    onChange(selectedEvents.filter(e => e.event.id !== eventId));
  };

  const handleTogglePerson = (eventId: string, person: Person) => {
    onChange(selectedEvents.map(e => {
      if (e.event.id === eventId) {
        const exists = e.peopleMet.find(p => p.id === person.id);
        if (exists) {
          return {
            ...e,
            peopleMet: e.peopleMet.filter(p => p.id !== person.id)
          };
        } else {
          return {
            ...e,
            peopleMet: [...e.peopleMet, person]
          };
        }
      }
      return e;
    }));
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          event.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilter === 'all' || event.type === activeFilter;
    
    return matchesSearch && matchesFilter;
  });

  const isEventSelected = (event: Event) => {
    return selectedEvents.some(e => e.event.id === event.id);
  };

  const isPersonSelected = (eventId: string, personId: string) => {
    const event = selectedEvents.find(e => e.event.id === eventId);
    return event?.peopleMet.some(p => p.id === personId) || false;
  };

  return (
    <Container>
      <SearchSection>
        <SearchInput
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search events..."
        />
        
        <EventTypeFilters>
          <FilterChip 
            active={activeFilter === 'all'}
            onClick={() => setActiveFilter('all')}
          >
            All Events
          </FilterChip>
          <FilterChip 
            active={activeFilter === 'social'}
            onClick={() => setActiveFilter('social')}
          >
            Social
          </FilterChip>
          <FilterChip 
            active={activeFilter === 'sports'}
            onClick={() => setActiveFilter('sports')}
          >
            Sports
          </FilterChip>
          <FilterChip 
            active={activeFilter === 'volunteer'}
            onClick={() => setActiveFilter('volunteer')}
          >
            Volunteer
          </FilterChip>
          <FilterChip 
            active={activeFilter === 'educational'}
            onClick={() => setActiveFilter('educational')}
          >
            Educational
          </FilterChip>
          <FilterChip 
            active={activeFilter === 'networking'}
            onClick={() => setActiveFilter('networking')}
          >
            Networking
          </FilterChip>
        </EventTypeFilters>
      </SearchSection>
      
      <EventsList>
        {isLoading ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
            Loading events...
          </div>
        ) : filteredEvents.length > 0 ? (
          filteredEvents.map(event => (
            <EventItem
              key={event.id}
              selected={isEventSelected(event)}
              onClick={() => handleToggleEvent(event)}
            >
              <EventHeader>
                <EventName>
                  {event.name}
                  <EventType type={event.type}>{event.type}</EventType>
                </EventName>
                <EventDate>{event.date}</EventDate>
              </EventHeader>
              <EventDetails>
                {event.location}
                {event.organizer && ` • ${event.organizer}`}
              </EventDetails>
            </EventItem>
          ))
        ) : (
          <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
            No events found
          </div>
        )}
      </EventsList>
      
      <SelectedEvents>
        {selectedEvents.map(({ event, peopleMet }) => (
          <SelectedEventCard key={event.id}>
            <EventCardHeader>
              <div>
                <EventName>
                  {event.name}
                  <EventType type={event.type}>{event.type}</EventType>
                </EventName>
                <EventDate>{event.date}</EventDate>
              </div>
              <RemoveButton onClick={() => handleRemoveEvent(event.id)}>
                Remove
              </RemoveButton>
            </EventCardHeader>
            
            <PeopleMetSection>
              <PeopleMetLabel>People met at this event:</PeopleMetLabel>
              
              {editingEventId === event.id ? (
                <div>
                  <PersonSearchInput
                    type="text"
                    value={personSearchTerm}
                    onChange={(e) => setPersonSearchTerm(e.target.value)}
                    placeholder="Search people by name..."
                    onClick={(e) => e.stopPropagation()}
                  />
                  
                  {availablePeople.length > 0 && (
                    <PersonList onClick={(e) => e.stopPropagation()}>
                      {availablePeople.map(person => (
                        <PersonItem
                          key={person.id}
                          selected={isPersonSelected(event.id, person.id)}
                          onClick={() => handleTogglePerson(event.id, person)}
                        >
                          <PersonAvatar>
                            {person.name.charAt(0)}
                          </PersonAvatar>
                          <span style={{ fontSize: '12px' }}>{person.name}</span>
                        </PersonItem>
                      ))}
                    </PersonList>
                  )}
                  
                  <AddPersonButton onClick={() => setEditingEventId(null)}>
                    Done
                  </AddPersonButton>
                </div>
              ) : (
                <div>
                  {peopleMet.map(person => (
                    <PersonBadge key={person.id}>
                      {person.name} ×
                    </PersonBadge>
                  ))}
                  <AddPersonButton onClick={(e) => {
                    e.stopPropagation();
                    setEditingEventId(event.id);
                    setPersonSearchTerm('');
                  }}>
                    + Add People
                  </AddPersonButton>
                </div>
              )}
            </PeopleMetSection>
          </SelectedEventCard>
        ))}
      </SelectedEvents>
    </Container>
  );
};