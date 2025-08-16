import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

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
  max-width: 400px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
`;

const Header = styled.div`
  background: linear-gradient(135deg, #2fce98, #4A90A4);
  color: white;
  padding: 20px;
  border-radius: 20px 20px 0 0;
  position: sticky;
  top: 0;
  z-index: 1;
`;

const Title = styled.h2`
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 4px;
`;

const Subtitle = styled.p`
  font-size: 13px;
  opacity: 0.9;
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

const ParticipantsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ParticipantCard = styled.div`
  background: white;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #2fce98, #26b580);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
`;

const ParticipantInfo = styled.div`
  flex: 1;
`;

const ParticipantName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #333;
`;

const ParticipantDetails = styled.div`
  font-size: 11px;
  color: #666;
  margin-top: 2px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #999;
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 12px;
`;

const EmptyText = styled.p`
  font-size: 13px;
`;

const StatCard = styled.div`
  background: #f9f9f9;
  padding: 12px;
  border-radius: 8px;
  text-align: center;
  margin-bottom: 20px;
`;

const StatNumber = styled.div`
  font-size: 24px;
  font-weight: bold;
  color: #2fce98;
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: #666;
`;

interface Participant {
  id: number;
  name: string;
  email: string;
  joinedAt: string;
  eventId: string;
  eventTitle: string;
}

interface EventParticipantsProps {
  eventId: string;
  eventTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

export const EventParticipants: React.FC<EventParticipantsProps> = ({ 
  eventId, 
  eventTitle, 
  isOpen, 
  onClose 
}) => {
  const [participants, setParticipants] = useState<Participant[]>([]);

  useEffect(() => {
    if (isOpen) {
      // Load participants from localStorage
      const eventJoinsKey = `event_joins_${eventId}`;
      const storedParticipants = JSON.parse(localStorage.getItem(eventJoinsKey) || '[]');
      setParticipants(storedParticipants);
    }
  }, [isOpen, eventId]);

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-MY', { 
      day: 'numeric', 
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Modal $show={isOpen}>
      <ModalContent>
        <Header>
          <CloseButton onClick={onClose}>×</CloseButton>
          <Title>👥 Event Participants</Title>
          <Subtitle>{eventTitle}</Subtitle>
        </Header>

        <Body>
          <StatCard>
            <StatNumber>{participants.length}</StatNumber>
            <StatLabel>Total Participants</StatLabel>
          </StatCard>

          {participants.length > 0 ? (
            <ParticipantsList>
              {participants.map((participant) => (
                <ParticipantCard key={participant.id}>
                  <Avatar>
                    {participant.name.charAt(0).toUpperCase()}
                  </Avatar>
                  <ParticipantInfo>
                    <ParticipantName>{participant.name}</ParticipantName>
                    <ParticipantDetails>
                      Joined {formatDate(participant.joinedAt)}
                    </ParticipantDetails>
                  </ParticipantInfo>
                </ParticipantCard>
              ))}
            </ParticipantsList>
          ) : (
            <EmptyState>
              <EmptyIcon>👥</EmptyIcon>
              <EmptyText>No participants yet</EmptyText>
            </EmptyState>
          )}
        </Body>
      </ModalContent>
    </Modal>
  );
};