import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';

const Modal = styled.div<{ $show: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: ${({ $show }) => $show ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 20px;
  max-width: 500px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
`;

const Header = styled.div`
  background: linear-gradient(135deg, #2fce98, #4A90A4);
  color: white;
  padding: 20px;
  border-radius: 20px 20px 0 0;
  position: relative;
`;

const Title = styled.h2`
  font-size: 20px;
  font-weight: bold;
  margin: 0;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 15px;
  right: 15px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const Body = styled.div`
  padding: 20px;
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #2fce98;
    box-shadow: 0 0 0 3px rgba(47, 206, 152, 0.1);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  font-size: 14px;
  min-height: 100px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #2fce98;
    box-shadow: 0 0 0 3px rgba(47, 206, 152, 0.1);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  
  &:focus {
    outline: none;
    border-color: #2fce98;
    box-shadow: 0 0 0 3px rgba(47, 206, 152, 0.1);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 20px;
`;

const Button = styled.button`
  flex: 1;
  padding: 14px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
`;

const PrimaryButton = styled(Button)`
  background: #2fce98;
  color: white;
  
  &:hover {
    background: #1F4A3A;
  }
`;

const SecondaryButton = styled(Button)`
  background: #f5f5f5;
  color: #666;
  border: 1px solid #e5e5e5;
  
  &:hover {
    background: #e5e5e5;
  }
`;

const DangerButton = styled(Button)`
  background: #ff4444;
  color: white;
  
  &:hover {
    background: #cc0000;
  }
`;

const Note = styled.p`
  font-size: 12px;
  color: #666;
  font-style: italic;
  margin-bottom: 16px;
  padding: 8px;
  background: #f9f9f9;
  border-radius: 6px;
`;

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  venue: string;
  category: string;
  price: number;
  maxAttendees: number;
  whatsappGroup?: string;
  mapLink?: string;
}

interface EditEventModalProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedEvent: Event) => void;
  onDelete?: (eventId: string) => void;
}

export const EditEventModal: React.FC<EditEventModalProps> = ({ 
  event, 
  isOpen, 
  onClose, 
  onSave,
  onDelete 
}) => {
  const { user } = useAuth();
  const isAdmin = user?.email === 'zaydmahdaly@ahlumran.org';
  const [formData, setFormData] = useState<Event>({
    id: '',
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    venue: '',
    category: 'social',
    price: 0,
    maxAttendees: 50,
    whatsappGroup: '',
    mapLink: ''
  });

  useEffect(() => {
    if (event) {
      setFormData(event);
    }
  }, [event]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'maxAttendees' ? Number(value) : value
    }));
  };

  const handleSubmit = () => {
    // Update the event in localStorage
    const userEvents = JSON.parse(localStorage.getItem('userCreatedEvents') || '[]');
    const updatedEvents = userEvents.map((e: Event) => 
      e.id === formData.id ? formData : e
    );
    localStorage.setItem('userCreatedEvents', JSON.stringify(updatedEvents));
    
    onSave(formData);
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      const userEvents = JSON.parse(localStorage.getItem('userCreatedEvents') || '[]');
      const updatedEvents = userEvents.filter((e: Event) => e.id !== formData.id);
      localStorage.setItem('userCreatedEvents', JSON.stringify(updatedEvents));
      
      if (onDelete) {
        onDelete(formData.id);
      }
      onClose();
    }
  };

  return (
    <Modal $show={isOpen}>
      <ModalContent>
        <Header>
          <CloseButton onClick={onClose}>×</CloseButton>
          <Title>✏️ Edit Event</Title>
        </Header>

        <Body>
          <Note>
            Note: You can only add or update information. Existing data cannot be deleted to preserve event integrity.
          </Note>

          <FormGroup>
            <Label>Event Title</Label>
            <Input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter event title"
            />
          </FormGroup>

          <FormGroup>
            <Label>Description</Label>
            <TextArea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your event"
            />
          </FormGroup>

          <FormGroup>
            <Label>Date</Label>
            <Input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
            />
          </FormGroup>

          <FormGroup>
            <Label>Time</Label>
            <Input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
            />
          </FormGroup>

          <FormGroup>
            <Label>Location</Label>
            <Input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="City or area"
            />
          </FormGroup>

          <FormGroup>
            <Label>Venue</Label>
            <Input
              type="text"
              name="venue"
              value={formData.venue}
              onChange={handleChange}
              placeholder="Specific venue name"
            />
          </FormGroup>

          <FormGroup>
            <Label>Category</Label>
            <Select
              name="category"
              value={formData.category}
              onChange={handleChange}
            >
              <option value="social">Social</option>
              <option value="sports">Sports</option>
              <option value="volunteer">Volunteer</option>
              <option value="donate">Donate</option>
              <option value="trips">Trips</option>
            </Select>
          </FormGroup>

          <FormGroup>
            <Label>Price (RM)</Label>
            <Input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              min="0"
              step="0.01"
            />
          </FormGroup>

          <FormGroup>
            <Label>Max Attendees</Label>
            <Input
              type="number"
              name="maxAttendees"
              value={formData.maxAttendees}
              onChange={handleChange}
              min="1"
            />
          </FormGroup>

          <FormGroup>
            <Label>WhatsApp Group Link (Optional)</Label>
            <Input
              type="url"
              name="whatsappGroup"
              value={formData.whatsappGroup || ''}
              onChange={handleChange}
              placeholder="https://chat.whatsapp.com/..."
            />
          </FormGroup>

          <FormGroup>
            <Label>Google Maps Link (Optional)</Label>
            <Input
              type="url"
              name="mapLink"
              value={formData.mapLink || ''}
              onChange={handleChange}
              placeholder="https://maps.google.com/..."
            />
          </FormGroup>

          <ButtonGroup>
            {isAdmin && onDelete && (
              <DangerButton onClick={handleDelete}>🗑️ Delete Event</DangerButton>
            )}
            <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
            <PrimaryButton onClick={handleSubmit}>Save Changes</PrimaryButton>
          </ButtonGroup>
        </Body>
      </ModalContent>
    </Modal>
  );
};