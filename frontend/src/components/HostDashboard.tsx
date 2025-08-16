import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  max-width: 393px;
  margin: 0 auto;
  min-height: 100vh;
  background-color: #f8f9fa;
`;

const Header = styled.div`
  background: linear-gradient(135deg, #2fce98, #1F4A3A);
  color: white;
  padding: 20px;
  text-align: center;
`;

const HeaderTitle = styled.h1`
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: bold;
`;

const HeaderSubtitle = styled.div`
  font-size: 14px;
  opacity: 0.9;
`;

const TabNavigation = styled.div`
  display: flex;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Tab = styled.button<{ active: boolean }>`
  flex: 1;
  padding: 12px;
  border: none;
  background: ${({ active }) => active ? '#2fce98' : 'white'};
  color: ${({ active }) => active ? 'white' : '#666'};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border-bottom: ${({ active }) => active ? '2px solid #2fce98' : '2px solid transparent'};
  
  &:hover {
    background: ${({ active }) => active ? '#2fce98' : '#f5f5f5'};
  }
`;

const Content = styled.div`
  padding: 16px;
`;

const EventCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`;

const EventHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

const EventTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: bold;
  color: #333;
`;

const EventStatus = styled.div<{ status: 'upcoming' | 'live' | 'completed' }>`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  background: ${({ status }) => {
    switch (status) {
      case 'live': return '#E8F5E8';
      case 'upcoming': return '#FFF3E0';
      case 'completed': return '#F5F5F5';
      default: return '#F5F5F5';
    }
  }};
  color: ${({ status }) => {
    switch (status) {
      case 'live': return '#4CAF50';
      case 'upcoming': return '#FF9800';
      case 'completed': return '#666';
      default: return '#666';
    }
  }};
`;

const EventStats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 12px;
`;

const StatItem = styled.div`
  text-align: center;
  padding: 8px;
  background: #f8f9fa;
  border-radius: 8px;
`;

const StatValue = styled.div`
  font-size: 18px;
  font-weight: bold;
  color: #2fce98;
  margin-bottom: 2px;
`;

const StatLabel = styled.div`
  font-size: 11px;
  color: #666;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button<{ variant?: 'primary' | 'secondary' }>`
  flex: 1;
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  background: ${({ variant }) => variant === 'primary' ? '#2fce98' : '#f5f5f5'};
  color: ${({ variant }) => variant === 'primary' ? 'white' : '#666'};
  
  &:hover {
    opacity: 0.9;
  }
`;

const QRScanner = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  margin-bottom: 16px;
`;

const ScannerFrame = styled.div`
  width: 200px;
  height: 200px;
  border: 2px dashed #2fce98;
  border-radius: 8px;
  margin: 16px auto;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  position: relative;
`;

const ScannerIcon = styled.div`
  font-size: 48px;
  color: #2fce98;
`;

const ParticipantsList = styled.div`
  background: white;
  border-radius: 12px;
  padding: 16px;
`;

const ParticipantItem = styled.div<{ status: 'present' | 'absent' | 'paid' }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
  }
`;

const ParticipantInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ParticipantAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #2fce98, #1F4A3A);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
  font-weight: bold;
`;

const ParticipantDetails = styled.div``;

const ParticipantName = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #333;
`;

const ParticipantMeta = styled.div`
  font-size: 12px;
  color: #666;
`;

const AttendanceStatus = styled.div<{ status: 'present' | 'absent' | 'paid' }>`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  background: ${({ status }) => {
    switch (status) {
      case 'present': return '#E8F5E8';
      case 'absent': return '#FFEBEE';
      case 'paid': return '#FFF3E0';
      default: return '#F5F5F5';
    }
  }};
  color: ${({ status }) => {
    switch (status) {
      case 'present': return '#4CAF50';
      case 'absent': return '#F44336';
      case 'paid': return '#FF9800';
      default: return '#666';
    }
  }};
`;

const RevenueCard = styled.div`
  background: linear-gradient(135deg, #FF6B6B, #FF8E8E);
  color: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
`;

const RevenueTitle = styled.h3`
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: bold;
`;

const RevenueAmount = styled.div`
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 8px;
`;

const RevenueBreakdown = styled.div`
  font-size: 12px;
  opacity: 0.9;
`;

const ScanSuccess = styled.div`
  background: #E8F5E8;
  color: #4CAF50;
  padding: 12px;
  border-radius: 8px;
  text-align: center;
  margin-bottom: 16px;
  font-size: 14px;
  font-weight: 500;
`;

interface HostDashboardProps {
  eventId?: string;
}

export const HostDashboard: React.FC<HostDashboardProps> = () => {
  const [activeTab, setActiveTab] = useState<'events' | 'scanner' | 'revenue'>('events');
  const [participants, setParticipants] = useState<any[]>([]);
  const [scanResult, setScanResult] = useState<string>('');

  // Mock data
  useEffect(() => {
    setParticipants([
      { 
        id: 1, 
        name: 'Ahmad Hassan', 
        avatar: 'AH', 
        status: 'present', 
        paidAmount: 12,
        scanTime: '4:15 PM'
      },
      { 
        id: 2, 
        name: 'Sarah Lim', 
        avatar: 'SL', 
        status: 'present', 
        paidAmount: 12,
        scanTime: '4:18 PM'
      },
      { 
        id: 3, 
        name: 'Raj Kumar', 
        avatar: 'RK', 
        status: 'paid', 
        paidAmount: 12,
        scanTime: null
      },
      { 
        id: 4, 
        name: 'Fatima Ali', 
        avatar: 'FA', 
        status: 'absent', 
        paidAmount: 12,
        scanTime: null
      },
    ]);
  }, []);

  const processTicketScan = (ticketData?: string) => {
    try {
      // In real implementation, ticketData would come from camera scan or manual entry
      // For simulation, we'll use mock ticket ID that matches our ticket format (BM-XXXXXX)
      const mockTicketId = ticketData || `BM-${Date.now().toString().slice(-6)}`;
      
      // Validate ticket ID format
      if (!mockTicketId.startsWith('BM-') || mockTicketId.length !== 9) {
        setScanResult('❌ Invalid ticket format');
        setTimeout(() => setScanResult(''), 3000);
        return;
      }
      
      // Find participant to check in (first non-present participant)
      const participantToUpdate = participants.find(p => 
        p.status !== 'present'
      );
      
      if (participantToUpdate) {
        setScanResult(`✓ ${participantToUpdate.name} checked in successfully!`);
        setTimeout(() => setScanResult(''), 3000);
        
        // Update participant status
        setParticipants(prev => prev.map(p => 
          p.id === participantToUpdate.id
            ? { 
                ...p, 
                status: 'present', 
                scanTime: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
                ticketId: mockTicketId
              }
            : p
        ));
      } else {
        setScanResult('ℹ️ All participants already checked in');
        setTimeout(() => setScanResult(''), 3000);
      }
      
    } catch (error) {
      setScanResult('❌ Invalid ticket data');
      setTimeout(() => setScanResult(''), 3000);
    }
  };

  const handleTicketScan = () => {
    processTicketScan();
  };

  const presentCount = participants.filter(p => p.status === 'present').length;
  const totalRevenue = participants.filter(p => p.status === 'present').reduce((sum, p) => sum + p.paidAmount, 0);
  const hostEarnings = totalRevenue * 0.7; // 70% to host

  return (
    <Container>
      <Header>
        <HeaderTitle>Host Dashboard</HeaderTitle>
        <HeaderSubtitle>BerseMinton Session</HeaderSubtitle>
      </Header>

      <TabNavigation>
        <Tab active={activeTab === 'events'} onClick={() => setActiveTab('events')}>
          Events
        </Tab>
        <Tab active={activeTab === 'scanner'} onClick={() => setActiveTab('scanner')}>
          Ticket Scanner
        </Tab>
        <Tab active={activeTab === 'revenue'} onClick={() => setActiveTab('revenue')}>
          Revenue
        </Tab>
      </TabNavigation>

      <Content>
        {activeTab === 'events' && (
          <>
            <EventCard>
              <EventHeader>
                <EventTitle>BerseMinton Session</EventTitle>
                <EventStatus status="live">Live</EventStatus>
              </EventHeader>
              
              <EventStats>
                <StatItem>
                  <StatValue>{presentCount}</StatValue>
                  <StatLabel>Present</StatLabel>
                </StatItem>
                <StatItem>
                  <StatValue>{participants.length}</StatValue>
                  <StatLabel>Total Paid</StatLabel>
                </StatItem>
                <StatItem>
                  <StatValue>20</StatValue>
                  <StatLabel>Max Spots</StatLabel>
                </StatItem>
              </EventStats>

              <ActionButtons>
                <ActionButton variant="primary" onClick={() => setActiveTab('scanner')}>
                  🎫 Scan Ticket
                </ActionButton>
                <ActionButton onClick={() => setActiveTab('revenue')}>
                  💰 Revenue
                </ActionButton>
              </ActionButtons>
            </EventCard>

            <ParticipantsList>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#333' }}>
                Participants ({participants.length})
              </h4>
              
              {participants.map((participant) => (
                <ParticipantItem key={participant.id} status={participant.status}>
                  <ParticipantInfo>
                    <ParticipantAvatar>{participant.avatar}</ParticipantAvatar>
                    <ParticipantDetails>
                      <ParticipantName>{participant.name}</ParticipantName>
                      <ParticipantMeta>
                        Paid RM {participant.paidAmount}
                        {participant.scanTime && ` • Checked in ${participant.scanTime}`}
                      </ParticipantMeta>
                    </ParticipantDetails>
                  </ParticipantInfo>
                  <AttendanceStatus status={participant.status}>
                    {participant.status === 'present' ? '✓ Present' : 
                     participant.status === 'absent' ? '✗ Absent' : 
                     '💳 Paid'}
                  </AttendanceStatus>
                </ParticipantItem>
              ))}
            </ParticipantsList>
          </>
        )}

        {activeTab === 'scanner' && (
          <>
            {scanResult && <ScanSuccess>{scanResult}</ScanSuccess>}
            
            <QRScanner>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#2fce98' }}>
                Ticket Scanner
              </h3>
              <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#666' }}>
                Ask participants to show their BerseMuka tickets
              </p>
              
              <ScannerFrame onClick={handleTicketScan}>
                <ScannerIcon>🎫</ScannerIcon>
              </ScannerFrame>
              
              <ActionButton variant="primary" onClick={handleTicketScan}>
                🔍 Simulate Scan
              </ActionButton>
            </QRScanner>

            <ParticipantsList>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#333' }}>
                Quick Actions
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                <ActionButton>Mark All Present</ActionButton>
                <ActionButton>Export List</ActionButton>
                <ActionButton>Send Reminder</ActionButton>
                <ActionButton>End Session</ActionButton>
              </div>
            </ParticipantsList>
          </>
        )}

        {activeTab === 'revenue' && (
          <>
            <RevenueCard>
              <RevenueTitle>Your Earnings</RevenueTitle>
              <RevenueAmount>RM {hostEarnings.toFixed(2)}</RevenueAmount>
              <RevenueBreakdown>
                From {presentCount} attendees • 70% host share
              </RevenueBreakdown>
            </RevenueCard>

            <EventCard>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#333' }}>
                Revenue Breakdown
              </h4>
              
              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '14px', color: '#666' }}>Total Collected</span>
                  <span style={{ fontSize: '14px', fontWeight: '500' }}>RM {totalRevenue.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '14px', color: '#666' }}>Platform Fee (30%)</span>
                  <span style={{ fontSize: '14px', color: '#666' }}>RM {(totalRevenue * 0.3).toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid #f0f0f0' }}>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#2fce98' }}>Your Share (70%)</span>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#2fce98' }}>RM {hostEarnings.toFixed(2)}</span>
                </div>
              </div>

              <ActionButtons>
                <ActionButton variant="primary">
                  💳 Request Payout
                </ActionButton>
                <ActionButton>
                  📊 View History
                </ActionButton>
              </ActionButtons>
            </EventCard>

            <EventCard>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#333' }}>
                Payment Status
              </h4>
              <div style={{ fontSize: '12px', color: '#666', lineHeight: '1.4' }}>
                • Earnings will be transferred within 24 hours after event completion<br/>
                • Present participants: {presentCount}/{participants.length}<br/>
                • Refunds for no-shows processed automatically
              </div>
            </EventCard>
          </>
        )}
      </Content>
    </Container>
  );
};