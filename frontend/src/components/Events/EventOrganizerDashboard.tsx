import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import { QRScanner } from '../QRCode/QRScanner';
import { QRScanResult } from '../../utils/qrGenerator';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
`;

const Header = styled.div`
  background: white;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const EventTitle = styled.h1`
  margin: 0 0 8px;
  font-size: 24px;
  font-weight: bold;
  color: #333;
`;

const EventInfo = styled.div`
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  margin-top: 16px;
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
`;

const InfoLabel = styled.span`
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
`;

const InfoValue = styled.span`
  font-size: 16px;
  font-weight: 600;
  color: #333;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 20px;
`;

const ActionButton = styled.button<{ primary?: boolean }>`
  padding: 12px 24px;
  background: ${({ primary }) => primary ? '#2fce98' : 'white'};
  color: ${({ primary }) => primary ? 'white' : '#333'};
  border: ${({ primary }) => primary ? 'none' : '1px solid #e0e0e0'};
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
`;

const StatCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`;

const StatValue = styled.div`
  font-size: 32px;
  font-weight: bold;
  color: #2fce98;
  margin-bottom: 8px;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: #666;
`;

const AttendeeList = styled.div`
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const AttendeeHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const AttendeeTitle = styled.h2`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
`;

const SearchInput = styled.input`
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  width: 200px;
  
  &:focus {
    outline: none;
    border-color: #2fce98;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.thead`
  background: #f8f9fa;
`;

const TableRow = styled.tr`
  border-bottom: 1px solid #e0e0e0;
  
  &:last-child {
    border-bottom: none;
  }
`;

const TableCell = styled.td`
  padding: 12px;
  font-size: 14px;
  color: #333;
`;

const TableHeaderCell = styled.th`
  padding: 12px;
  font-size: 12px;
  font-weight: 600;
  color: #666;
  text-align: left;
  text-transform: uppercase;
`;

const Badge = styled.span<{ type: 'success' | 'warning' | 'info' }>`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  background: ${({ type }) => 
    type === 'success' ? '#e8f5e9' : 
    type === 'warning' ? '#fff3e0' : 
    '#e3f2fd'
  };
  color: ${({ type }) => 
    type === 'success' ? '#2e7d32' : 
    type === 'warning' ? '#f57c00' : 
    '#1976d2'
  };
`;

const ExportButton = styled.button`
  padding: 8px 16px;
  background: #4285f4;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background: #357ae8;
  }
`;

interface Attendee {
  id: string;
  name: string;
  email: string;
  checkInTime: string;
  pointsAwarded: number;
  tier: string;
  phone?: string;
}

interface EventOrganizerDashboardProps {
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  organizerName: string;
  eventPoints: number;
  isAhlUmranEvent?: boolean;
}

export const EventOrganizerDashboard: React.FC<EventOrganizerDashboardProps> = ({
  eventId,
  eventTitle,
  eventDate,
  eventLocation,
  organizerName,
  eventPoints,
  isAhlUmranEvent = false
}) => {
  const { user } = useAuth();
  const [showScanner, setShowScanner] = useState(false);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [totalCheckIns, setTotalCheckIns] = useState(0);
  const [totalPointsDistributed, setTotalPointsDistributed] = useState(0);
  const [exportingToSheets, setExportingToSheets] = useState(false);

  // Load attendees from localStorage
  useEffect(() => {
    loadAttendees();
  }, [eventId]);

  const loadAttendees = () => {
    const checkIns = JSON.parse(localStorage.getItem('eventCheckIns') || '[]');
    const eventCheckIns = checkIns.filter((c: any) => c.eventId === eventId);
    
    // Transform check-ins to attendee format
    const attendeeList: Attendee[] = eventCheckIns.map((checkIn: any) => ({
      id: checkIn.userId,
      name: 'User ' + checkIn.userId.substring(0, 6), // Mock name
      email: `user${checkIn.userId.substring(0, 6)}@example.com`, // Mock email
      checkInTime: checkIn.timestamp,
      pointsAwarded: checkIn.points,
      tier: 'bronze', // Mock tier
      phone: '+60123456789' // Mock phone
    }));
    
    setAttendees(attendeeList);
    setTotalCheckIns(attendeeList.length);
    setTotalPointsDistributed(attendeeList.reduce((sum, a) => sum + a.pointsAwarded, 0));
  };

  // Handle successful scan
  const handleScanSuccess = (result: QRScanResult) => {
    if (result.success && result.user) {
      const newAttendee: Attendee = {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        checkInTime: new Date().toISOString(),
        pointsAwarded: result.action?.pointsChanged || eventPoints,
        tier: result.user.tier,
        phone: '+60123456789' // Get from user data
      };
      
      setAttendees(prev => [newAttendee, ...prev]);
      setTotalCheckIns(prev => prev + 1);
      setTotalPointsDistributed(prev => prev + (newAttendee.pointsAwarded || 0));
      
      // Auto-sync to Google Sheets for Ahl Umran events
      if (isAhlUmranEvent) {
        syncToGoogleSheets([newAttendee]);
      }
    }
  };

  // Export to Google Sheets
  const exportToGoogleSheets = async () => {
    setExportingToSheets(true);
    
    try {
      // Create CSV data
      const csvHeaders = ['Name', 'Email', 'Phone', 'Check-in Time', 'Points Awarded', 'Tier'];
      const csvData = attendees.map(a => [
        a.name,
        a.email,
        a.phone || '',
        new Date(a.checkInTime).toLocaleString(),
        a.pointsAwarded.toString(),
        a.tier
      ]);
      
      // For Ahl Umran events, integrate with Google Sheets API
      if (isAhlUmranEvent) {
        await syncToGoogleSheets(attendees);
        alert('Data exported to Google Sheets successfully!');
      } else {
        // For other events, download as CSV
        downloadCSV(csvHeaders, csvData);
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export data');
    } finally {
      setExportingToSheets(false);
    }
  };

  // Sync to Google Sheets (for Ahl Umran Network)
  const syncToGoogleSheets = async (attendeesToSync: Attendee[]) => {
    // Google Sheets integration
    // This would connect to the Google Drive folder:
    // https://drive.google.com/drive/folders/1FKWBfZ4pKiqYYvDrg0vagoAWyke583s2
    
    const sheetData = {
      spreadsheetId: 'YOUR_SHEET_ID', // Replace with actual sheet ID
      range: 'Sheet1!A:F',
      values: attendeesToSync.map(a => [
        eventTitle,
        eventDate,
        a.name,
        a.email,
        a.phone,
        new Date(a.checkInTime).toLocaleString(),
        a.pointsAwarded,
        a.tier
      ])
    };
    
    // Mock API call (replace with actual Google Sheets API)
    console.log('Syncing to Google Sheets:', sheetData);
    
    // Store in localStorage for now
    const sheetsData = JSON.parse(localStorage.getItem('ahlUmranSheets') || '[]');
    sheetsData.push({
      eventId,
      eventTitle,
      timestamp: new Date().toISOString(),
      attendees: attendeesToSync
    });
    localStorage.setItem('ahlUmranSheets', JSON.stringify(sheetsData));
  };

  // Download as CSV
  const downloadCSV = (headers: string[], data: string[][]) => {
    const csv = [
      headers.join(','),
      ...data.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${eventTitle.replace(/\s+/g, '_')}_attendees_${Date.now()}.csv`;
    link.click();
  };

  // Filter attendees
  const filteredAttendees = attendees.filter(a => 
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Container>
      <Header>
        <EventTitle>{eventTitle}</EventTitle>
        {isAhlUmranEvent && (
          <Badge type="info">Ahl 'Umran Network Event</Badge>
        )}
        
        <EventInfo>
          <InfoItem>
            <InfoLabel>Date</InfoLabel>
            <InfoValue>{eventDate}</InfoValue>
          </InfoItem>
          <InfoItem>
            <InfoLabel>Location</InfoLabel>
            <InfoValue>{eventLocation}</InfoValue>
          </InfoItem>
          <InfoItem>
            <InfoLabel>Organizer</InfoLabel>
            <InfoValue>{organizerName}</InfoValue>
          </InfoItem>
          <InfoItem>
            <InfoLabel>Points per Check-in</InfoLabel>
            <InfoValue>{eventPoints} pts</InfoValue>
          </InfoItem>
        </EventInfo>

        <ActionButtons>
          <ActionButton primary onClick={() => setShowScanner(true)}>
            📷 Scan QR Check-in
          </ActionButton>
          <ActionButton onClick={() => loadAttendees()}>
            🔄 Refresh
          </ActionButton>
          <ExportButton onClick={exportToGoogleSheets} disabled={exportingToSheets}>
            {isAhlUmranEvent ? (
              <>📊 Sync to Google Sheets</>
            ) : (
              <>💾 Export CSV</>
            )}
          </ExportButton>
        </ActionButtons>
      </Header>

      <StatsGrid>
        <StatCard>
          <StatValue>{totalCheckIns}</StatValue>
          <StatLabel>Total Check-ins</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{totalPointsDistributed}</StatValue>
          <StatLabel>Points Distributed</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{attendees.length > 0 ? Math.round(totalPointsDistributed / attendees.length) : 0}</StatValue>
          <StatLabel>Avg Points/Person</StatLabel>
        </StatCard>
      </StatsGrid>

      <AttendeeList>
        <AttendeeHeader>
          <AttendeeTitle>Attendees ({filteredAttendees.length})</AttendeeTitle>
          <SearchInput
            type="text"
            placeholder="Search attendees..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </AttendeeHeader>

        {filteredAttendees.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHeaderCell>Name</TableHeaderCell>
                <TableHeaderCell>Email</TableHeaderCell>
                <TableHeaderCell>Check-in Time</TableHeaderCell>
                <TableHeaderCell>Points</TableHeaderCell>
                <TableHeaderCell>Tier</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <tbody>
              {filteredAttendees.map((attendee) => (
                <TableRow key={attendee.id}>
                  <TableCell>{attendee.name}</TableCell>
                  <TableCell>{attendee.email}</TableCell>
                  <TableCell>{new Date(attendee.checkInTime).toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge type="success">+{attendee.pointsAwarded}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge type="info">{attendee.tier.toUpperCase()}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            No attendees checked in yet. Start scanning QR codes!
          </div>
        )}
      </AttendeeList>

      {showScanner && (
        <QRScanner
          eventId={eventId}
          eventTitle={eventTitle}
          eventPoints={eventPoints}
          onClose={() => setShowScanner(false)}
          onScanSuccess={handleScanSuccess}
        />
      )}
    </Container>
  );
};