import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { StatusBar } from '../components/StatusBar/StatusBar';
import { BerseMukhaModerator } from '../data/berseMukhaColors';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #f5f5f5;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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
  font-size: 20px;
  font-weight: bold;
  color: #2fce98;
  margin: 0;
`;

const SaveButton = styled.button`
  background: #2fce98;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  
  &:hover {
    background: #1F4A3A;
  }
`;

const Content = styled.div`
  flex: 1;
  padding: 20px;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
`;

const SessionTabs = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  background: white;
  padding: 12px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const SessionTab = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 12px;
  border-radius: 8px;
  border: 2px solid ${({ $active }) => $active ? '#2fce98' : '#e5e5e5'};
  background: ${({ $active }) => $active ? '#2fce98' : 'white'};
  color: ${({ $active }) => $active ? 'white' : '#333'};
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #2fce98;
  }
`;

const MainGrid = styled.div`
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ParticipantList = styled.div`
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  max-height: 600px;
  overflow-y: auto;
`;

const ListHeader = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid #f0f0f0;
`;

const ParticipantCard = styled.div<{ $dragging?: boolean }>`
  padding: 12px;
  margin-bottom: 8px;
  background: ${({ $dragging }) => $dragging ? '#e8f4f0' : '#f9f9f9'};
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  cursor: move;
  transition: all 0.2s ease;
  
  &:hover {
    background: #e8f4f0;
    transform: translateX(4px);
  }
`;

const ParticipantInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ParticipantName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #333;
`;

const ParticipantDetails = styled.div`
  font-size: 11px;
  color: #666;
  margin-top: 4px;
`;

const ModeratorGroups = styled.div`
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const ModeratorGroupsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
`;

const ModeratorGroupCard = styled.div<{ $color: string; $dragOver?: boolean }>`
  border: 2px solid ${({ $color }) => $color};
  border-radius: 12px;
  padding: 12px;
  background: ${({ $dragOver }) => $dragOver ? 'rgba(45, 95, 79, 0.05)' : 'white'};
  min-height: 200px;
  position: relative;
  transition: all 0.2s ease;
`;

const GroupHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
`;

const GroupBadge = styled.div<{ $color: string }>`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 16px;
`;

const GroupInfo = styled.div`
  flex: 1;
`;

const GroupName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #333;
`;

const GroupColor = styled.div`
  font-size: 11px;
  color: #666;
`;

const GroupCapacity = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  background: #f0f0f0;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  color: #666;
`;

const AssignedParticipant = styled.div`
  padding: 8px;
  margin-bottom: 6px;
  background: #f9f9f9;
  border-radius: 6px;
  font-size: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const RemoveButton = styled.button`
  background: #ffe5e5;
  color: #ff4444;
  border: none;
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 10px;
  cursor: pointer;
  
  &:hover {
    background: #ffcccc;
  }
`;

const StatsCard = styled.div`
  background: linear-gradient(135deg, #2fce98, #4A90A4);
  color: white;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 12px;
  opacity: 0.9;
`;

// Mock data for participants
interface Participant {
  id: string;
  name: string;
  username: string;
  gender: string;
  ageGroup: string;
  phoneNumber: string;
  session1ModeratorId?: string;
  session2ModeratorId?: string;
}

const mockParticipants: Participant[] = [
  { id: '1', name: 'Ahmad Ali', username: 'ahmad_ali', gender: 'male', ageGroup: '26-35', phoneNumber: '0123456789' },
  { id: '2', name: 'Fatima Hassan', username: 'fatima_h', gender: 'female', ageGroup: '18-25', phoneNumber: '0123456790' },
  { id: '3', name: 'Omar Khan', username: 'omar_k', gender: 'male', ageGroup: '36-45', phoneNumber: '0123456791' },
  { id: '4', name: 'Aisha Ibrahim', username: 'aisha_i', gender: 'female', ageGroup: '26-35', phoneNumber: '0123456792' },
  { id: '5', name: 'Yusuf Ahmed', username: 'yusuf_a', gender: 'male', ageGroup: '18-25', phoneNumber: '0123456793' },
  { id: '6', name: 'Mariam Ali', username: 'mariam_a', gender: 'female', ageGroup: '46-55', phoneNumber: '0123456794' },
  { id: '7', name: 'Hassan Mohamed', username: 'hassan_m', gender: 'male', ageGroup: '26-35', phoneNumber: '0123456795' },
  { id: '8', name: 'Zahra Abdullah', username: 'zahra_a', gender: 'female', ageGroup: '18-25', phoneNumber: '0123456796' },
];

// Mock event moderators - in a real app, these would come from the event data
const mockEventModerators: BerseMukhaModerator[] = [
  { id: 'mod-1', name: 'Ahmad Ali', session1Number: 1, session2Color: 'Red', session2ColorCode: '#EF4444' },
  { id: 'mod-2', name: 'Fatima Hassan', session1Number: 2, session2Color: 'Blue', session2ColorCode: '#3B82F6' },
  { id: 'mod-3', name: 'Omar Khan', session1Number: 3, session2Color: 'Green', session2ColorCode: '#10B981' },
  { id: 'mod-4', name: 'Aisha Ibrahim', session1Number: 4, session2Color: 'Purple', session2ColorCode: '#8B5CF6' },
  { id: 'mod-5', name: 'Yusuf Ahmed', session1Number: 5, session2Color: 'Orange', session2ColorCode: '#F97316' },
];

export const BerseMukhaAdminScreen: React.FC = () => {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const [currentSession, setCurrentSession] = useState<'session1' | 'session2'>('session1');
  const [participants, setParticipants] = useState<Participant[]>(mockParticipants);
  const [draggedParticipant, setDraggedParticipant] = useState<Participant | null>(null);
  const [dragOverModeratorId, setDragOverModeratorId] = useState<string | null>(null);
  const [eventModerators, setEventModerators] = useState<BerseMukhaModerator[]>(mockEventModerators);

  useEffect(() => {
    // In a real app, fetch event data and moderators from backend
    // const eventData = await fetchEvent(eventId);
    // setEventModerators(eventData.berseMukhaModerators);
  }, [eventId]);

  const handleDragStart = (participant: Participant) => {
    setDraggedParticipant(participant);
  };

  const handleDragOver = (e: React.DragEvent, moderatorId: string) => {
    e.preventDefault();
    setDragOverModeratorId(moderatorId);
  };

  const handleDragLeave = () => {
    setDragOverModeratorId(null);
  };

  const handleDrop = (e: React.DragEvent, moderatorId: string) => {
    e.preventDefault();
    
    if (draggedParticipant) {
      const sessionKey = currentSession === 'session1' ? 'session1ModeratorId' : 'session2ModeratorId';
      
      // Check if moderator group is full (max 7 participants)
      const assignedCount = participants.filter(p => p[sessionKey] === moderatorId).length;
      if (assignedCount >= 7) {
        alert('This moderator group is full (max 7 participants)');
        setDragOverModeratorId(null);
        return;
      }
      
      // Update participant assignment
      setParticipants(prev => prev.map(p => 
        p.id === draggedParticipant.id 
          ? { ...p, [sessionKey]: moderatorId }
          : p
      ));
    }
    
    setDraggedParticipant(null);
    setDragOverModeratorId(null);
  };

  const removeParticipantFromGroup = (participantId: string) => {
    const sessionKey = currentSession === 'session1' ? 'session1ModeratorId' : 'session2ModeratorId';
    setParticipants(prev => prev.map(p => 
      p.id === participantId 
        ? { ...p, [sessionKey]: undefined }
        : p
    ));
  };

  const getUnassignedParticipants = () => {
    const sessionKey = currentSession === 'session1' ? 'session1ModeratorId' : 'session2ModeratorId';
    return participants.filter(p => !p[sessionKey]);
  };

  const getParticipantsByModerator = (moderatorId: string) => {
    const sessionKey = currentSession === 'session1' ? 'session1ModeratorId' : 'session2ModeratorId';
    return participants.filter(p => p[sessionKey] === moderatorId);
  };

  const getTotalAssigned = () => {
    const sessionKey = currentSession === 'session1' ? 'session1ModeratorId' : 'session2ModeratorId';
    return participants.filter(p => p[sessionKey]).length;
  };

  const handleSaveAssignments = () => {
    // Here you would save the assignments to your backend
    console.log('Saving participant assignments:', participants);
    alert('Participant assignments saved successfully!');
  };

  return (
    <Container>
      <StatusBar />
      <Header>
        <BackButton onClick={() => navigate(-1)}>
          ← Back
        </BackButton>
        <HeaderTitle>BerseMukha Event Management</HeaderTitle>
        <SaveButton onClick={handleSaveAssignments}>
          Save Assignments
        </SaveButton>
      </Header>
      
      <Content>
        <StatsCard>
          <StatsGrid>
            <StatItem>
              <StatValue>{participants.length}</StatValue>
              <StatLabel>Total Participants</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>{getTotalAssigned()}</StatValue>
              <StatLabel>Assigned ({currentSession})</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>{getUnassignedParticipants().length}</StatValue>
              <StatLabel>Unassigned</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>
                {eventModerators.filter(m => 
                  currentSession === 'session1' 
                    ? m.session1Number !== undefined 
                    : m.session2Color !== undefined
                ).length}
              </StatValue>
              <StatLabel>Moderators ({currentSession})</StatLabel>
            </StatItem>
          </StatsGrid>
        </StatsCard>

        <SessionTabs>
          <SessionTab 
            $active={currentSession === 'session1'}
            onClick={() => setCurrentSession('session1')}
          >
            Session 1 Assignments
          </SessionTab>
          <SessionTab 
            $active={currentSession === 'session2'}
            onClick={() => setCurrentSession('session2')}
          >
            Session 2 Assignments
          </SessionTab>
        </SessionTabs>

        <MainGrid>
          <ParticipantList>
            <ListHeader>
              Unassigned Participants ({getUnassignedParticipants().length})
            </ListHeader>
            {getUnassignedParticipants().map(participant => (
              <ParticipantCard
                key={participant.id}
                draggable
                onDragStart={() => handleDragStart(participant)}
                $dragging={draggedParticipant?.id === participant.id}
              >
                <ParticipantInfo>
                  <div>
                    <ParticipantName>{participant.name}</ParticipantName>
                    <ParticipantDetails>
                      @{participant.username} • {participant.gender} • {participant.ageGroup}
                    </ParticipantDetails>
                  </div>
                </ParticipantInfo>
              </ParticipantCard>
            ))}
          </ParticipantList>

          <ModeratorGroups>
            <ListHeader>
              Moderator Groups - {currentSession === 'session1' ? 'Session 1' : 'Session 2'}
            </ListHeader>
            <ModeratorGroupsGrid>
              {eventModerators
                .filter(moderator => {
                  // Only show moderators that have assignments for the current session
                  const hasAssignment = currentSession === 'session1' 
                    ? moderator.session1Number !== undefined 
                    : moderator.session2Color !== undefined;
                  return hasAssignment;
                })
                .sort((a, b) => {
                  // Sort by session 1 number for session 1, by name for session 2
                  if (currentSession === 'session1') {
                    return (a.session1Number || 0) - (b.session1Number || 0);
                  }
                  return a.name.localeCompare(b.name);
                })
                .map(moderator => {
                  const sessionNumber = currentSession === 'session1' ? moderator.session1Number : undefined;
                  const sessionColor = currentSession === 'session2' ? moderator.session2Color : undefined;
                  const sessionColorCode = currentSession === 'session2' ? moderator.session2ColorCode : '#e5e5e5';
                  const assignedParticipants = getParticipantsByModerator(moderator.id);
                  
                  return (
                    <ModeratorGroupCard
                      key={moderator.id}
                      $color={currentSession === 'session1' ? '#2fce98' : sessionColorCode}
                      $dragOver={dragOverModeratorId === moderator.id}
                      onDragOver={(e) => handleDragOver(e, moderator.id)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, moderator.id)}
                    >
                      <GroupCapacity>
                        {assignedParticipants.length}/7
                      </GroupCapacity>
                      <GroupHeader>
                        <GroupBadge $color={currentSession === 'session1' ? '#2fce98' : sessionColorCode}>
                          {currentSession === 'session1' ? sessionNumber : sessionColor?.charAt(0)}
                        </GroupBadge>
                        <GroupInfo>
                          <GroupName>{moderator.name}</GroupName>
                          <GroupColor>
                            {currentSession === 'session1' 
                              ? `Group ${sessionNumber}` 
                              : `${sessionColor} Group`}
                          </GroupColor>
                        </GroupInfo>
                      </GroupHeader>
                      
                      <div>
                        {assignedParticipants.map(participant => (
                          <AssignedParticipant key={participant.id}>
                            <div>
                              <div style={{ fontWeight: 600 }}>{participant.name}</div>
                              <div style={{ fontSize: '10px', color: '#666' }}>
                                {participant.gender} • {participant.ageGroup}
                              </div>
                            </div>
                            <RemoveButton onClick={() => removeParticipantFromGroup(participant.id)}>
                              ×
                            </RemoveButton>
                          </AssignedParticipant>
                        ))}
                      </div>
                    </ModeratorGroupCard>
                  );
                })}
            </ModeratorGroupsGrid>
          </ModeratorGroups>
        </MainGrid>
      </Content>
    </Container>
  );
};