import React, { useState } from 'react';
import styled from 'styled-components';

const ModalOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: ${({ $isOpen }) => $isOpen ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
  backdrop-filter: blur(2px);
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 20px;
  padding: 24px;
  max-width: 400px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  right: 20px;
  top: 20px;
  background: rgba(0, 0, 0, 0.1);
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  color: #333;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(0, 0, 0, 0.2);
    transform: scale(1.1);
  }
`;

const ModalTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
  padding-right: 40px;
`;

const ProfileInfo = styled.div`
  background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ProfileAvatar = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #2fce98, #4A90A4);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 18px;
`;

const ProfileDetails = styled.div`
  flex: 1;
`;

const ProfileName = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: #2fce98;
  margin-bottom: 4px;
`;

const ProfileBio = styled.p`
  font-size: 12px;
  color: #666;
  line-height: 1.4;
`;

const FormSection = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #2fce98;
    box-shadow: 0 0 0 3px rgba(47, 206, 152, 0.1);
  }
  
  &::placeholder {
    color: #999;
    font-style: italic;
  }
`;

const EventList = styled.div`
  max-height: 150px;
  overflow-y: auto;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  margin-top: 8px;
`;

const EventOption = styled.div<{ $selected: boolean }>`
  padding: 10px 12px;
  cursor: pointer;
  background: ${({ $selected }) => $selected ? '#e8f7f0' : 'white'};
  border-left: 3px solid ${({ $selected }) => $selected ? '#2fce98' : 'transparent'};
  transition: all 0.2s ease;
  
  &:hover {
    background: #f8f9fa;
  }
  
  &:not(:last-child) {
    border-bottom: 1px solid #f0f0f0;
  }
`;

const EventName = styled.div`
  font-size: 13px;
  font-weight: 500;
  color: #333;
  margin-bottom: 2px;
`;

const EventDate = styled.div`
  font-size: 11px;
  color: #999;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  font-size: 14px;
  min-height: 80px;
  resize: vertical;
  font-family: inherit;
  
  &:focus {
    outline: none;
    border-color: #2fce98;
    box-shadow: 0 0 0 3px rgba(47, 206, 152, 0.1);
  }
  
  &::placeholder {
    color: #999;
    font-style: italic;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
`;

const Button = styled.button`
  flex: 1;
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
`;

const CancelButton = styled(Button)`
  background: #f5f5f5;
  color: #666;
  border: 1px solid #e5e5e5;
  
  &:hover {
    background: #e5e5e5;
  }
`;

const SubmitButton = styled(Button)`
  background: #2fce98;
  color: white;
  border: none;
  
  &:hover {
    background: #26b580;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(47, 206, 152, 0.3);
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
    transform: none;
  }
`;

const NoEventOption = styled.div`
  padding: 10px 12px;
  font-size: 12px;
  color: #999;
  font-style: italic;
  text-align: center;
  cursor: pointer;
  
  &:hover {
    background: #f8f9fa;
  }
`;

interface Event {
  id: string;
  name: string;
  date: string;
}

interface FriendRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: {
    id: string | number;
    name: string;
    bio?: string;
  } | null;
  onSubmit: (eventId: string, note: string) => void;
}

export const FriendRequestModal: React.FC<FriendRequestModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSubmit
}) => {
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [note, setNote] = useState('');
  const [eventSearch, setEventSearch] = useState('');

  // Mock events - in real app, these would come from API
  const events: Event[] = [
    { id: 'bersemukha-july-2025', name: 'BerseMukha July 2025: Slow Down You\'re Doing Fine', date: '2025-07-12' },
    { id: 'badminton-weekly', name: 'Badminton @ KLCC Sports Complex', date: '2024-12-25' },
    { id: 'coffee-code', name: 'Coffee & Code Meetup', date: '2024-12-25' },
    { id: 'beach-cleanup', name: 'Beach Cleanup Drive', date: '2024-12-26' },
    { id: 'heritage-walk', name: 'Heritage Walk KL', date: '2024-12-28' },
    { id: 'photo-walk', name: 'Photography Workshop', date: '2024-12-30' },
  ];

  const filteredEvents = events.filter(event => 
    event.name.toLowerCase().includes(eventSearch.toLowerCase())
  );

  const handleSubmit = () => {
    if (selectedEvent || note.trim()) {
      onSubmit(selectedEvent, note.trim());
      setSelectedEvent('');
      setNote('');
      setEventSearch('');
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedEvent('');
    setNote('');
    setEventSearch('');
    onClose();
  };

  if (!profile) return null;

  return (
    <ModalOverlay $isOpen={isOpen} onClick={handleClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={handleClose}>×</CloseButton>
        
        <ModalTitle>Send Friend Request</ModalTitle>
        
        <ProfileInfo>
          <ProfileAvatar>
            {profile.name.charAt(0)}
          </ProfileAvatar>
          <ProfileDetails>
            <ProfileName>{profile.name}</ProfileName>
            {profile.bio && (
              <ProfileBio>{profile.bio}</ProfileBio>
            )}
          </ProfileDetails>
        </ProfileInfo>

        <FormSection>
          <Label>
            Where did you meet? (Optional)
          </Label>
          <SearchInput
            type="text"
            placeholder="Search for an event..."
            value={eventSearch}
            onChange={(e) => setEventSearch(e.target.value)}
          />
          <EventList>
            <NoEventOption onClick={() => setSelectedEvent('')}>
              <strong>We haven't met at an event</strong>
            </NoEventOption>
            {filteredEvents.map(event => (
              <EventOption
                key={event.id}
                $selected={selectedEvent === event.id}
                onClick={() => setSelectedEvent(event.id)}
              >
                <EventName>{event.name}</EventName>
                <EventDate>📅 {new Date(event.date).toLocaleDateString()}</EventDate>
              </EventOption>
            ))}
            {filteredEvents.length === 0 && eventSearch && (
              <NoEventOption>
                No events found matching "{eventSearch}"
              </NoEventOption>
            )}
          </EventList>
        </FormSection>

        <FormSection>
          <Label>
            Add a note (Optional)
          </Label>
          <TextArea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Say hi, remind them how you met, or share why you'd like to connect..."
          />
        </FormSection>

        <ButtonGroup>
          <CancelButton onClick={handleClose}>
            Cancel
          </CancelButton>
          <SubmitButton 
            onClick={handleSubmit}
            disabled={!selectedEvent && !note.trim()}
          >
            Send Request
          </SubmitButton>
        </ButtonGroup>
      </ModalContent>
    </ModalOverlay>
  );
};