import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
// import { useAuth } from '../contexts/AuthContext';
import { StatusBar } from '../components/StatusBar/StatusBar';
import { MainNav } from '../components/MainNav';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #F9F3E3;
  max-width: 393px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background-color: #F5F3EF;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: #333;
  font-size: 16px;
  cursor: pointer;
`;

const HeaderTitle = styled.h1`
  margin: 0;
  font-size: 18px;
  font-weight: bold;
  color: #2D5F4F;
`;

const Content = styled.div`
  flex: 1;
  padding: 0 20px 100px 20px;
  overflow-y: auto;
`;

const IntroSection = styled.div`
  background: linear-gradient(135deg, #2D5F4F 0%, #4A90A4 100%);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 24px;
  color: white;
`;

const IntroTitle = styled.h2`
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: bold;
`;

const IntroText = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 1.4;
  opacity: 0.9;
`;

const SlotsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const SlotCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 2px solid transparent;
  
  &.booked {
    border-color: #4CAF50;
    background: #F8FFF8;
  }
`;

const SlotHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

const SlotDate = styled.div`
  font-size: 18px;
  font-weight: bold;
  color: #2D5F4F;
  margin-bottom: 4px;
`;

const SlotTime = styled.div`
  font-size: 14px;
  color: #666;
`;

const SlotStatus = styled.div<{ isBooked: boolean }>`
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  background-color: ${({ isBooked }) => isBooked ? '#4CAF50' : '#E8F4F0'};
  color: ${({ isBooked }) => isBooked ? 'white' : '#2D5F4F'};
`;

const LocationInfo = styled.div`
  margin-bottom: 12px;
`;

const LocationName = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
`;

const LocationDetails = styled.div`
  font-size: 14px;
  color: #666;
`;

const ParticipantInfo = styled.div`
  margin-bottom: 16px;
  padding: 12px;
  background: #F8F9FA;
  border-radius: 8px;
  text-align: center;
`;

const ParticipantCount = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #2D5F4F;
  margin-bottom: 4px;
`;

const ParticipantText = styled.div`
  font-size: 14px;
  color: #666;
`;

const BookButton = styled.button<{ isBooked: boolean }>`
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  
  ${({ isBooked }) => isBooked ? `
    background-color: #4CAF50;
    color: white;
  ` : `
    background-color: #2D5F4F;
    color: white;
    
    &:hover {
      background-color: #1F4A3A;
    }
  `}
`;

const ConfirmationModal = styled.div<{ show: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: ${({ show }) => show ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin: 20px;
  max-width: 320px;
  width: 100%;
`;

const ModalTitle = styled.h3`
  margin: 0 0 12px 0;
  font-size: 18px;
  font-weight: bold;
  color: #2D5F4F;
  text-align: center;
`;

const ModalText = styled.p`
  margin: 0 0 20px 0;
  font-size: 14px;
  color: #666;
  text-align: center;
  line-height: 1.4;
`;

const ModalButtons = styled.div`
  display: flex;
  gap: 12px;
`;

const ModalButton = styled.button<{ primary?: boolean }>`
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  
  ${({ primary }) => primary ? `
    background-color: #2D5F4F;
    color: white;
    
    &:hover {
      background-color: #1F4A3A;
    }
  ` : `
    background-color: #F8F9FA;
    color: #666;
    
    &:hover {
      background-color: #E9ECEF;
    }
  `}
`;

interface MeetupSlot {
  id: string;
  date: string;
  time: string;
  location: string;
  locationDetails: string;
  participantCount: number;
  maxParticipants: number;
  isBooked: boolean;
}

export const BookMeetupScreen: React.FC = () => {
  const navigate = useNavigate();
  // const { user } = useAuth();
  
  const [slots, setSlots] = useState<MeetupSlot[]>([
    {
      id: '1',
      date: 'Wednesday, July 23',
      time: '7:00 PM',
      location: 'CITY CENTER',
      locationDetails: 'Mesra Cafe, Level 3, Suria KLCC',
      participantCount: 5,
      maxParticipants: 15,
      isBooked: false
    },
    {
      id: '2',
      date: 'Wednesday, July 30',
      time: '7:00 PM',
      location: 'CITY CENTER',
      locationDetails: 'Mesra Cafe, Level 3, Suria KLCC',
      participantCount: 8,
      maxParticipants: 15,
      isBooked: false
    },
    {
      id: '3',
      date: 'Wednesday, August 6',
      time: '7:00 PM',
      location: 'CITY CENTER',
      locationDetails: 'Mesra Cafe, Level 3, Suria KLCC',
      participantCount: 3,
      maxParticipants: 15,
      isBooked: false
    }
  ]);

  const [selectedSlot, setSelectedSlot] = useState<MeetupSlot | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleBookSlot = (slot: MeetupSlot) => {
    if (slot.isBooked) return;
    setSelectedSlot(slot);
    setShowConfirmation(true);
  };

  const confirmBooking = () => {
    if (!selectedSlot) return;

    // Update the slot
    setSlots(prev => prev.map(slot => 
      slot.id === selectedSlot.id 
        ? { ...slot, isBooked: true, participantCount: slot.participantCount + 1 }
        : slot
    ));

    // Store booking in localStorage for now (would be API call in real app)
    const existingBookings = JSON.parse(localStorage.getItem('user_bookings') || '[]');
    const newBooking = {
      id: selectedSlot.id,
      type: 'cafe_meetup',
      title: `Cafe Meetup - ${selectedSlot.date}`,
      date: selectedSlot.date,
      time: selectedSlot.time,
      location: selectedSlot.location,
      locationDetails: selectedSlot.locationDetails,
      bookedAt: new Date().toISOString()
    };
    existingBookings.push(newBooking);
    localStorage.setItem('user_bookings', JSON.stringify(existingBookings));

    setShowConfirmation(false);
    setSelectedSlot(null);

    // Show success message
    setTimeout(() => {
      alert(`Successfully booked your slot for ${selectedSlot.date} at ${selectedSlot.time}! You'll receive a confirmation notification.`);
    }, 100);
  };

  const cancelBooking = () => {
    setShowConfirmation(false);
    setSelectedSlot(null);
  };

  return (
    <Container>
      <StatusBar />
      
      <Header>
        <BackButton onClick={() => navigate(-1)}>
          ← Back
        </BackButton>
        <HeaderTitle>Book Meetup Slots</HeaderTitle>
        <div style={{ width: '60px' }} />
      </Header>

      <Content>
        <IntroSection>
          <IntroTitle>☕ Cafe Meetups</IntroTitle>
          <IntroText>
            Join our weekly Wednesday meetups at cozy cafes around the city. 
            Connect with like-minded people, share experiences, and build meaningful friendships over great coffee!
          </IntroText>
        </IntroSection>

        <SlotsContainer>
          {slots.map((slot) => (
            <SlotCard key={slot.id} className={slot.isBooked ? 'booked' : ''}>
              <SlotHeader>
                <div>
                  <SlotDate>{slot.date}</SlotDate>
                  <SlotTime>{slot.time}</SlotTime>
                </div>
                <SlotStatus isBooked={slot.isBooked}>
                  {slot.isBooked ? '✓ Booked' : 'Available'}
                </SlotStatus>
              </SlotHeader>

              <LocationInfo>
                <LocationName>📍 {slot.location}</LocationName>
                <LocationDetails>{slot.locationDetails}</LocationDetails>
              </LocationInfo>

              <ParticipantInfo>
                <ParticipantCount>
                  {slot.participantCount}/{slot.maxParticipants} participants
                </ParticipantCount>
                <ParticipantText>
                  {slot.isBooked 
                    ? "You're registered for this meetup!"
                    : `${slot.maxParticipants - slot.participantCount} people waiting for you`
                  }
                </ParticipantText>
              </ParticipantInfo>

              <BookButton 
                isBooked={slot.isBooked}
                onClick={() => handleBookSlot(slot)}
                disabled={slot.isBooked}
              >
                {slot.isBooked ? '✓ Booked' : 'Book my slot'}
              </BookButton>
            </SlotCard>
          ))}
        </SlotsContainer>
      </Content>

      <ConfirmationModal show={showConfirmation}>
        <ModalContent>
          <ModalTitle>Confirm Booking</ModalTitle>
          <ModalText>
            Are you sure you want to book your slot for <strong>{selectedSlot?.date}</strong> at <strong>{selectedSlot?.time}</strong>?
            <br /><br />
            Location: {selectedSlot?.locationDetails}
          </ModalText>
          <ModalButtons>
            <ModalButton onClick={cancelBooking}>Cancel</ModalButton>
            <ModalButton primary onClick={confirmBooking}>Book Slot</ModalButton>
          </ModalButtons>
        </ModalContent>
      </ConfirmationModal>

      <MainNav 
        activeTab="connect"
        onTabPress={(tab) => {
          switch (tab) {
            case 'home':
              navigate('/dashboard');
              break;
            case 'connect':
              navigate('/connect');
              break;
            case 'match':
              navigate('/match');
              break;
            case 'forum':
              navigate('/forum');
              break;
          }
        }}
      />
    </Container>
  );
};