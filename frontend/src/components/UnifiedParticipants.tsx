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

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: ${({ $isSports }: { $isSports: boolean }) => 
    $isSports ? '1fr 1fr 1fr' : '1fr'};
  gap: 12px;
  margin-bottom: 20px;
`;

const StatCard = styled.div`
  background: #f9f9f9;
  padding: 12px;
  border-radius: 8px;
  text-align: center;
`;

const StatNumber = styled.div`
  font-size: 20px;
  font-weight: bold;
  color: #2fce98;
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 11px;
  color: #666;
`;

const FilterTabs = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  padding: 4px;
  background: #f5f5f5;
  border-radius: 8px;
`;

const FilterTab = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 8px;
  border: none;
  border-radius: 6px;
  background: ${({ $active }) => $active ? 'white' : 'transparent'};
  color: ${({ $active }) => $active ? '#2fce98' : '#666'};
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: ${({ $active }) => $active ? '0 1px 3px rgba(0, 0, 0, 0.1)' : 'none'};
  
  &:hover {
    background: ${({ $active }) => $active ? 'white' : 'rgba(255, 255, 255, 0.5)'};
  }
`;

const ParticipantsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ParticipantCard = styled.div<{ $status?: string }>`
  background: white;
  border: 1px solid ${({ $status }) => 
    $status === 'confirmed' ? '#2fce98' : 
    $status === 'pending' ? '#ffc107' : '#e5e5e5'
  };
  border-radius: 8px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Avatar = styled.div<{ $status?: string }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${({ $status }) => 
    $status === 'confirmed' ? 'linear-gradient(135deg, #2fce98, #26b580)' : 
    $status === 'pending' ? 'linear-gradient(135deg, #ffc107, #ff9800)' : 
    'linear-gradient(135deg, #2fce98, #4A90A4)'
  };
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
  display: flex;
  gap: 8px;
  margin-top: 2px;
`;

const StatusBadge = styled.span<{ $status: string }>`
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
  background: ${({ $status }) => 
    $status === 'confirmed' ? '#e6f7e6' : 
    $status === 'pending' ? '#fff3cd' : '#f5f5f5'
  };
  color: ${({ $status }) => 
    $status === 'confirmed' ? '#2fce98' : 
    $status === 'pending' ? '#856404' : '#666'
  };
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

interface RegularParticipant {
  id: number;
  name: string;
  email: string;
  joinedAt: string;
  eventId: string;
  eventTitle: string;
}

interface SportsRegistration {
  id: string;
  eventId: string;
  name: string;
  phone: string;
  email: string;
  sessions: string;
  amount: number;
  receiptFileName?: string;
  timestamp: string;
  status: 'pending' | 'confirmed';
}

interface UnifiedParticipantsProps {
  eventId: string;
  eventTitle: string;
  isSportsEvent: boolean;
  isOpen: boolean;
  onClose: () => void;
}

export const UnifiedParticipants: React.FC<UnifiedParticipantsProps> = ({ 
  eventId, 
  eventTitle, 
  isSportsEvent,
  isOpen, 
  onClose 
}) => {
  const [regularParticipants, setRegularParticipants] = useState<RegularParticipant[]>([]);
  const [sportsRegistrations, setSportsRegistrations] = useState<SportsRegistration[]>([]);
  const [filter, setFilter] = useState<'all' | 'confirmed' | 'pending'>('all');

  useEffect(() => {
    if (isOpen) {
      if (isSportsEvent) {
        // Load sports registrations from localStorage
        const allRegistrations = JSON.parse(localStorage.getItem('berseMintonRegistrations') || '[]');
        const eventRegistrations = allRegistrations.filter((reg: SportsRegistration) => reg.eventId === eventId);
        
        // Simulate some confirmed registrations (in real app, this would come from backend)
        const updatedRegistrations = eventRegistrations.map((reg: SportsRegistration, index: number) => ({
          ...reg,
          status: index % 3 === 0 ? 'confirmed' : 'pending' // Mock: every 3rd registration is confirmed
        }));
        
        setSportsRegistrations(updatedRegistrations);
      } else {
        // Load regular participants from localStorage
        const eventJoinsKey = `event_joins_${eventId}`;
        const storedParticipants = JSON.parse(localStorage.getItem(eventJoinsKey) || '[]');
        setRegularParticipants(storedParticipants);
      }
    }
  }, [isOpen, eventId, isSportsEvent]);

  const getFilteredRegistrations = () => {
    if (!isSportsEvent) return regularParticipants;
    if (filter === 'all') return sportsRegistrations;
    return sportsRegistrations.filter(reg => reg.status === filter);
  };

  const getSportsStats = () => {
    const confirmed = sportsRegistrations.filter(r => r.status === 'confirmed').length;
    const pending = sportsRegistrations.filter(r => r.status === 'pending').length;
    const totalRevenue = sportsRegistrations.reduce((sum, r) => sum + r.amount, 0);
    
    return { confirmed, pending, totalRevenue };
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-MY', { 
      day: 'numeric', 
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const stats = isSportsEvent ? getSportsStats() : null;
  const participants = getFilteredRegistrations();

  return (
    <Modal $show={isOpen}>
      <ModalContent>
        <Header>
          <CloseButton onClick={onClose}>×</CloseButton>
          <Title>{isSportsEvent ? '🏸' : '👥'} Participants List</Title>
          <Subtitle>{eventTitle}</Subtitle>
        </Header>

        <Body>
          <StatsGrid $isSports={isSportsEvent}>
            {isSportsEvent && stats ? (
              <>
                <StatCard>
                  <StatNumber>{stats.confirmed}</StatNumber>
                  <StatLabel>Confirmed</StatLabel>
                </StatCard>
                <StatCard>
                  <StatNumber>{stats.pending}</StatNumber>
                  <StatLabel>Pending</StatLabel>
                </StatCard>
                <StatCard>
                  <StatNumber>RM{stats.totalRevenue}</StatNumber>
                  <StatLabel>Revenue</StatLabel>
                </StatCard>
              </>
            ) : (
              <StatCard>
                <StatNumber>{regularParticipants.length}</StatNumber>
                <StatLabel>Total Participants</StatLabel>
              </StatCard>
            )}
          </StatsGrid>

          {isSportsEvent && (
            <FilterTabs>
              <FilterTab 
                $active={filter === 'all'} 
                onClick={() => setFilter('all')}
              >
                All ({sportsRegistrations.length})
              </FilterTab>
              <FilterTab 
                $active={filter === 'confirmed'} 
                onClick={() => setFilter('confirmed')}
              >
                Confirmed ({stats?.confirmed || 0})
              </FilterTab>
              <FilterTab 
                $active={filter === 'pending'} 
                onClick={() => setFilter('pending')}
              >
                Pending ({stats?.pending || 0})
              </FilterTab>
            </FilterTabs>
          )}

          {participants.length > 0 ? (
            <ParticipantsList>
              {isSportsEvent ? (
                // Sports event participants
                (participants as SportsRegistration[]).map((registration) => (
                  <ParticipantCard key={registration.id} $status={registration.status}>
                    <Avatar $status={registration.status}>
                      {registration.name.charAt(0).toUpperCase()}
                    </Avatar>
                    <ParticipantInfo>
                      <ParticipantName>{registration.name}</ParticipantName>
                      <ParticipantDetails>
                        <span>{registration.sessions} session(s)</span>
                        <span>•</span>
                        <span>RM{registration.amount}</span>
                        <span>•</span>
                        <span>{formatDate(registration.timestamp)}</span>
                      </ParticipantDetails>
                    </ParticipantInfo>
                    <StatusBadge $status={registration.status}>
                      {registration.status === 'confirmed' ? '✓ Confirmed' : '⏳ Pending'}
                    </StatusBadge>
                  </ParticipantCard>
                ))
              ) : (
                // Regular event participants
                (participants as RegularParticipant[]).map((participant) => (
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
                ))
              )}
            </ParticipantsList>
          ) : (
            <EmptyState>
              <EmptyIcon>👥</EmptyIcon>
              <EmptyText>
                {isSportsEvent && filter !== 'all' 
                  ? `No ${filter} registrations` 
                  : 'No participants yet'}
              </EmptyText>
            </EmptyState>
          )}
        </Body>
      </ModalContent>
    </Modal>
  );
};