import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { StatusBar } from '../components/StatusBar/StatusBar';
import { MainNav } from '../components/MainNav/MainNav';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #f5f5f5;
  max-width: 393px;
  margin: 0 auto;
`;

const Header = styled.div`
  background: linear-gradient(135deg, #2fce98, #4A90A4);
  color: white;
  padding: 20px;
  padding-top: 40px;
  position: relative;
`;

const BackButton = styled.button`
  position: absolute;
  top: 40px;
  left: 20px;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  color: white;
  padding: 8px 12px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateX(-2px);
  }
`;

const HeaderContent = styled.div`
  margin-left: 50px;
`;

const HeaderTitle = styled.h1`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 8px;
`;

const HeaderSubtitle = styled.p`
  font-size: 14px;
  opacity: 0.9;
`;


const Content = styled.div`
  flex: 1;
  padding: 16px;
  padding-bottom: 80px;
`;

// Community Management Styles
const CommunityCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e5e5;
`;

const CommunityHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

const CommunityInfo = styled.div`
  flex: 1;
`;

const CommunityName = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
`;

const CommunityStats = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 8px;
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
`;

const StatValue = styled.span`
  font-size: 18px;
  font-weight: bold;
  color: #2fce98;
`;

const StatLabel = styled.span`
  font-size: 11px;
  color: #666;
`;

const StatusBadge = styled.span<{ $status: 'active' | 'pending' | 'inactive' }>`
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  background: ${({ $status }) => 
    $status === 'active' ? '#e6f7e6' : 
    $status === 'pending' ? '#fff3cd' : 
    '#f5f5f5'
  };
  color: ${({ $status }) => 
    $status === 'active' ? '#2fce98' : 
    $status === 'pending' ? '#856404' : 
    '#666'
  };
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;
`;

const ActionButton = styled.button`
  flex: 1;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #e5e5e5;
  background: white;
  color: #333;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f9f9f9;
    border-color: #2fce98;
    color: #2fce98;
  }
`;

const PrimaryButton = styled(ActionButton)`
  background: #2fce98;
  color: white;
  border-color: #2fce98;
  
  &:hover {
    background: #1F4A3A;
    border-color: #1F4A3A;
    color: white;
  }
`;

// Request Community Section
const RequestCard = styled.div`
  background: linear-gradient(135deg, #e8f4f0, #d4e9e3);
  border: 2px dashed #2fce98;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(45, 95, 79, 0.2);
  }
`;

const RequestIcon = styled.div`
  font-size: 48px;
  margin-bottom: 12px;
`;

const RequestTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #2fce98;
  margin-bottom: 4px;
`;

const RequestSubtitle = styled.p`
  font-size: 12px;
  color: #666;
`;

// Dashboard Styles
const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 20px;
`;

const DashboardCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  text-align: center;
`;

const DashboardIcon = styled.div`
  font-size: 24px;
  margin-bottom: 8px;
`;

const DashboardValue = styled.div`
  font-size: 24px;
  font-weight: bold;
  color: #2fce98;
  margin-bottom: 4px;
`;

const DashboardLabel = styled.div`
  font-size: 11px;
  color: #666;
`;

// Member Request Section
const MemberRequestCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const MemberAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #2fce98, #4A90A4);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
`;

const MemberInfo = styled.div`
  flex: 1;
`;

const MemberName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #333;
`;

const MemberDetails = styled.div`
  font-size: 11px;
  color: #666;
`;

const RequestActions = styled.div`
  display: flex;
  gap: 8px;
`;

const ApproveButton = styled.button`
  padding: 6px 12px;
  border-radius: 6px;
  border: none;
  background: #e6f7e6;
  color: #2fce98;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  
  &:hover {
    background: #2fce98;
    color: white;
  }
`;

const RejectButton = styled.button`
  padding: 6px 12px;
  border-radius: 6px;
  border: none;
  background: #ffe5e5;
  color: #ff4444;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  
  &:hover {
    background: #ff4444;
    color: white;
  }
`;

// Event Section
const EventCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const EventHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

const EventTitle = styled.h4`
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
`;

const EventDate = styled.div`
  font-size: 11px;
  color: #666;
`;

const EventStats = styled.div`
  display: flex;
  gap: 16px;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 8px;
  margin-bottom: 12px;
`;

const EventActions = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
`;

const EventButton = styled.button`
  padding: 8px;
  border-radius: 6px;
  border: 1px solid #e5e5e5;
  background: white;
  color: #333;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  
  &:hover {
    background: #f9f9f9;
    border-color: #2fce98;
    color: #2fce98;
  }
`;

// QR Scanner Modal
const QRScannerModal = styled.div<{ $show: boolean }>`
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

const QRScannerContent = styled.div`
  background: white;
  border-radius: 20px;
  padding: 24px;
  max-width: 350px;
  width: 100%;
  text-align: center;
`;

const QRScannerTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
`;

const QRScannerBox = styled.div`
  width: 250px;
  height: 250px;
  margin: 0 auto 20px;
  border: 2px solid #2fce98;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f9f9f9;
`;

const CloseButton = styled.button`
  width: 100%;
  padding: 12px;
  background: #2fce98;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  
  &:hover {
    background: #1F4A3A;
  }
`;

// Add Community Modal
const AddCommunityModal = styled.div<{ $show: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: ${({ $show }) => $show ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const AddCommunityContent = styled.div`
  background: white;
  border-radius: 20px;
  padding: 24px;
  max-width: 350px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
`;

const ModalTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 20px;
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
  padding: 10px;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #2fce98;
    box-shadow: 0 0 0 3px rgba(45, 95, 79, 0.1);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 10px;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  font-size: 14px;
  min-height: 80px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #2fce98;
    box-shadow: 0 0 0 3px rgba(45, 95, 79, 0.1);
  }
`;

const ModalButtons = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 20px;
`;

const ModalButton = styled.button`
  flex: 1;
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
`;

const CancelButton = styled(ModalButton)`
  background: #f5f5f5;
  color: #666;
  border: 1px solid #e5e5e5;
  
  &:hover {
    background: #e5e5e5;
  }
`;

const SubmitButton = styled(ModalButton)`
  background: #2fce98;
  color: white;
  border: none;
  
  &:hover {
    background: #1F4A3A;
  }
`;

interface Community {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  eventCount: number;
  status: 'active' | 'pending' | 'inactive';
  admins: string[];
  whatsappLink?: string;
  chatGroupId?: string;
}

interface MemberRequest {
  id: string;
  name: string;
  username: string;
  requestDate: string;
}

interface Event {
  id: string;
  title: string;
  date: string;
  registrations: number;
  checkedIn: number;
  communityId: string;
}

// Modal Styles
const Modal = styled.div<{ $show: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: white;
  display: ${({ $show }) => $show ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 0;
  padding: 0;
  width: 100%;
  height: 100vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: linear-gradient(135deg, #2fce98, #4A90A4);
  color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const DashboardModalTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: white;
`;

const CloseModalButton = styled.button`
  background: none;
  border: none;
  font-size: 28px;
  color: white;
  cursor: pointer;
  padding: 0;
  
  &:hover {
    opacity: 0.8;
  }
`;

export const CommunityManagementScreen: React.FC = () => {
  const navigate = useNavigate();
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showAddCommunity, setShowAddCommunity] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showEvents, setShowEvents] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize with empty data
  const [communities] = useState<Community[]>([]);

  const [memberRequests] = useState<MemberRequest[]>([]);

  const [events] = useState<Event[]>([]);

  const handleExportToSheets = (eventId: string) => {
    // Export functionality
    alert(`Exporting event ${eventId} data to Google Sheets...`);
  };

  const handleScanQR = (eventId: string) => {
    setShowQRScanner(true);
  };

  const handleEditCommunity = (communityId: string) => {
    navigate(`/communities/edit/${communityId}`);
  };

  const handleConnectWhatsApp = (communityId: string) => {
    const whatsappLink = prompt('Enter WhatsApp group invite link:');
    if (whatsappLink) {
      alert(`WhatsApp group connected: ${whatsappLink}`);
    }
  };

  const handleCreateChatGroup = (communityId: string) => {
    alert(`Creating private chat group for community ${communityId}...`);
  };

  const handleOpenDashboard = (community: Community) => {
    setSelectedCommunity(community);
    setShowDashboard(true);
  };

  const handleOpenEvents = (community: Community) => {
    setSelectedCommunity(community);
    setShowEvents(true);
  };


  return (
    <Container>
      <StatusBar />
      
      <Header>
        <BackButton onClick={() => navigate(-1)}>
          ← Back
        </BackButton>
        <HeaderContent>
          <HeaderTitle>Community & Events</HeaderTitle>
          <HeaderSubtitle>Manage your communities and track events</HeaderSubtitle>
        </HeaderContent>
      </Header>

      <Content>
        <RequestCard onClick={() => setShowAddCommunity(true)}>
          <RequestIcon>➕</RequestIcon>
          <RequestTitle>Request New Community</RequestTitle>
          <RequestSubtitle>
            Create and manage your own community on BerseMatch
          </RequestSubtitle>
        </RequestCard>

        {communities.map(community => (
          <CommunityCard key={community.id}>
            <CommunityHeader>
              <CommunityInfo>
                <CommunityName>{community.name}</CommunityName>
                <CommunityStats>
                  <StatItem>
                    <StatValue>{community.memberCount}</StatValue>
                    <StatLabel>Members</StatLabel>
                  </StatItem>
                  <StatItem>
                    <StatValue>{community.eventCount}</StatValue>
                    <StatLabel>Events</StatLabel>
                  </StatItem>
                  <StatItem>
                    <StatValue>{community.admins.length}/5</StatValue>
                    <StatLabel>Admins</StatLabel>
                  </StatItem>
                </CommunityStats>
              </CommunityInfo>
              <StatusBadge $status={community.status}>
                {community.status === 'active' ? '✓ Active' : 
                 community.status === 'pending' ? '⏳ Pending' : 
                 '○ Inactive'}
              </StatusBadge>
            </CommunityHeader>
            
            {community.status === 'active' && (
              <ActionButtons>
                <ActionButton onClick={() => handleEditCommunity(community.id)}>
                  ✏️ Edit
                </ActionButton>
                <ActionButton onClick={() => handleOpenDashboard(community)}>
                  📊 Dashboard
                </ActionButton>
                <PrimaryButton onClick={() => handleOpenEvents(community)}>
                  📅 Events
                </PrimaryButton>
              </ActionButtons>
            )}
          </CommunityCard>
        ))}
      </Content>

      {/* Dashboard Modal - Full Screen */}
      <Modal $show={showDashboard}>
        <ModalContent>
          <ModalHeader>
            <DashboardModalTitle>{selectedCommunity?.name} Dashboard</DashboardModalTitle>
            <CloseModalButton onClick={() => setShowDashboard(false)}>×</CloseModalButton>
          </ModalHeader>
          
          <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
            {selectedCommunity && (
              <>
                <DashboardGrid>
                <DashboardCard>
                  <DashboardIcon>👥</DashboardIcon>
                  <DashboardValue>{selectedCommunity.memberCount}</DashboardValue>
                  <DashboardLabel>Total Members</DashboardLabel>
                </DashboardCard>
                <DashboardCard>
                  <DashboardIcon>📊</DashboardIcon>
                  <DashboardValue>+12%</DashboardValue>
                  <DashboardLabel>Growth Rate</DashboardLabel>
                </DashboardCard>
                <DashboardCard>
                  <DashboardIcon>📱</DashboardIcon>
                  <DashboardValue>{Math.floor(selectedCommunity.memberCount * 0.77)}</DashboardValue>
                  <DashboardLabel>Active Users</DashboardLabel>
                </DashboardCard>
                <DashboardCard>
                  <DashboardIcon>🎯</DashboardIcon>
                  <DashboardValue>87%</DashboardValue>
                  <DashboardLabel>Engagement</DashboardLabel>
                </DashboardCard>
              </DashboardGrid>

              <div style={{ marginTop: '20px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
                  Join Requests ({memberRequests.length})
                </h4>
                {memberRequests.map(request => (
                  <MemberRequestCard key={request.id}>
                    <MemberAvatar>{request.name.charAt(0)}</MemberAvatar>
                    <MemberInfo>
                      <MemberName>{request.name}</MemberName>
                      <MemberDetails>{request.username} • {request.requestDate}</MemberDetails>
                    </MemberInfo>
                    <RequestActions>
                      <ApproveButton>✓</ApproveButton>
                      <RejectButton>✗</RejectButton>
                    </RequestActions>
                  </MemberRequestCard>
                ))}
              </div>

              <div style={{ marginTop: '20px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
                  Community Groups
                </h4>
                <ActionButtons>
                  <PrimaryButton onClick={() => handleCreateChatGroup(selectedCommunity.id)}>
                    💬 Create Chat Group
                  </PrimaryButton>
                  <ActionButton onClick={() => handleConnectWhatsApp(selectedCommunity.id)}>
                    📱 Connect WhatsApp
                  </ActionButton>
                </ActionButtons>
              </div>
              </>
            )}
          </div>
        </ModalContent>
      </Modal>

      {/* Events Modal - Full Screen */}
      <Modal $show={showEvents}>
        <ModalContent>
          <ModalHeader>
            <DashboardModalTitle>{selectedCommunity?.name} Events</DashboardModalTitle>
            <CloseModalButton onClick={() => setShowEvents(false)}>×</CloseModalButton>
          </ModalHeader>
          
          <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
            {selectedCommunity && (
              <>
                {events
                .filter(event => event.communityId === selectedCommunity.id)
                .map(event => (
                  <EventCard key={event.id}>
                    <EventHeader>
                      <div>
                        <EventTitle>{event.title}</EventTitle>
                        <EventDate>📅 {event.date}</EventDate>
                      </div>
                      <StatusBadge $status="active">
                        {event.checkedIn > 0 ? 'Ongoing' : 'Upcoming'}
                      </StatusBadge>
                    </EventHeader>
                    
                    <EventStats>
                      <StatItem>
                        <StatValue>{event.registrations}</StatValue>
                        <StatLabel>Registered</StatLabel>
                      </StatItem>
                      <StatItem>
                        <StatValue>{event.checkedIn}</StatValue>
                        <StatLabel>Checked In</StatLabel>
                      </StatItem>
                      <StatItem>
                        <StatValue>{Math.round((event.checkedIn / event.registrations) * 100)}%</StatValue>
                        <StatLabel>Attendance</StatLabel>
                      </StatItem>
                    </EventStats>
                    
                    <EventActions>
                      <EventButton onClick={() => handleScanQR(event.id)}>
                        📷 Scan QR
                      </EventButton>
                      <EventButton onClick={() => handleExportToSheets(event.id)}>
                        📊 Export
                      </EventButton>
                      <EventButton onClick={() => navigate(`/events/${event.id}/manage`)}>
                        ⚙️ Manage
                      </EventButton>
                    </EventActions>
                  </EventCard>
                ))}
              
              {events.filter(e => e.communityId === selectedCommunity.id).length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>📅</div>
                  <p>No events yet</p>
                  <PrimaryButton 
                    style={{ marginTop: '16px' }} 
                    onClick={() => navigate('/event/create')}
                  >
                    Create First Event
                  </PrimaryButton>
                </div>
              )}
              </>
            )}
          </div>
        </ModalContent>
      </Modal>

      <QRScannerModal $show={showQRScanner}>
        <QRScannerContent>
          <QRScannerTitle>Scan Attendee QR Code</QRScannerTitle>
          <QRScannerBox>
            <div style={{ color: '#999' }}>📷 Camera View</div>
          </QRScannerBox>
          <CloseButton onClick={() => setShowQRScanner(false)}>
            Close Scanner
          </CloseButton>
        </QRScannerContent>
      </QRScannerModal>

      <AddCommunityModal $show={showAddCommunity}>
        <AddCommunityContent>
          <ModalTitle>Request New Community</ModalTitle>
          
          <FormGroup>
            <Label>Community Name *</Label>
            <Input type="text" placeholder="Enter community name" />
          </FormGroup>
          
          <FormGroup>
            <Label>Description *</Label>
            <TextArea placeholder="Describe your community's purpose and activities" />
          </FormGroup>
          
          <FormGroup>
            <Label>Category *</Label>
            <Input type="text" placeholder="e.g., Technology, Business, Arts" />
          </FormGroup>
          
          <FormGroup>
            <Label>Expected Members</Label>
            <Input type="number" placeholder="Estimated community size" />
          </FormGroup>
          
          <FormGroup>
            <Label>Admin Email (Up to 5)</Label>
            <Input type="email" placeholder="admin1@email.com" />
            <Input type="email" placeholder="admin2@email.com" style={{ marginTop: '8px' }} />
          </FormGroup>
          
          <ModalButtons>
            <CancelButton onClick={() => setShowAddCommunity(false)}>
              Cancel
            </CancelButton>
            <SubmitButton onClick={() => {
              alert('Community request submitted for approval!');
              setShowAddCommunity(false);
            }}>
              Submit Request
            </SubmitButton>
          </ModalButtons>
        </AddCommunityContent>
      </AddCommunityModal>

      <MainNav />
    </Container>
  );
};