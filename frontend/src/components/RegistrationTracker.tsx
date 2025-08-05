import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

// Registration Tracking Components
const TrackerContainer = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin: 16px 0;
`;

const TrackerHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const TrackerTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TrackerSubtitle = styled.p`
  margin: 0;
  font-size: 12px;
  color: #666;
`;

const StatsOverview = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
`;

const StatCard = styled.div<{ $color?: string }>`
  background: ${({ $color }) => $color || 'linear-gradient(135deg, #007BFF, #0056b3)'};
  color: white;
  padding: 16px;
  border-radius: 12px;
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 11px;
  opacity: 0.9;
  text-transform: uppercase;
  font-weight: 500;
`;

const FilterBar = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
`;

const FilterButton = styled.button<{ $active?: boolean }>`
  padding: 6px 12px;
  border: 1px solid ${({ $active }) => $active ? '#007BFF' : '#e9ecef'};
  background: ${({ $active }) => $active ? '#007BFF' : 'white'};
  color: ${({ $active }) => $active ? 'white' : '#666'};
  border-radius: 6px;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ $active }) => $active ? '#0056b3' : '#f8f9fa'};
  }
`;

const SearchBar = styled.input`
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  font-size: 12px;
  
  &:focus {
    outline: none;
    border-color: #007BFF;
  }
`;

const RegistrantsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 400px;
  overflow-y: auto;
`;

const RegistrantCard = styled.div`
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 12px;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f1f3f4;
    border-color: #007BFF;
  }
`;

const RegistrantHeader = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 8px;
`;

const RegistrantInfo = styled.div`
  flex: 1;
`;

const RegistrantName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 2px;
`;

const RegistrantEmail = styled.div`
  font-size: 11px;
  color: #666;
`;

const RegistrantMeta = styled.div`
  display: flex;
  gap: 12px;
  font-size: 10px;
  color: #999;
  margin-top: 4px;
`;

const PaymentStatus = styled.div<{ $status: 'paid' | 'pending' | 'failed' | 'refunded' }>`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  background: ${({ $status }) => {
    switch ($status) {
      case 'paid': return '#E8F5E8';
      case 'pending': return '#FFF8E1';
      case 'failed': return '#FFEBEE';
      case 'refunded': return '#F3E5F5';
      default: return '#F8F9FA';
    }
  }};
  color: ${({ $status }) => {
    switch ($status) {
      case 'paid': return '#28A745';
      case 'pending': return '#FF8F00';
      case 'failed': return '#DC3545';
      case 'refunded': return '#7B1FA2';
      default: return '#666';
    }
  }};
`;

const RegistrantActions = styled.div`
  display: flex;
  gap: 4px;
  margin-left: 8px;
`;

const ActionButton = styled.button`
  padding: 4px 8px;
  border: 1px solid #e9ecef;
  background: white;
  color: #666;
  border-radius: 4px;
  font-size: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f8f9fa;
    border-color: #007BFF;
    color: #007BFF;
  }
`;

const BulkActions = styled.div`
  display: flex;
  gap: 8px;
  margin: 16px 0;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
`;

const BulkActionButton = styled.button<{ $variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: 8px 16px;
  border: 1px solid ${({ $variant }) => {
    switch ($variant) {
      case 'primary': return '#007BFF';
      case 'danger': return '#DC3545';
      default: return '#e9ecef';
    }
  }};
  background: ${({ $variant }) => {
    switch ($variant) {
      case 'primary': return '#007BFF';
      case 'danger': return '#DC3545';
      default: return 'white';
    }
  }};
  color: ${({ $variant }) => {
    switch ($variant) {
      case 'primary': case 'danger': return 'white';
      default: return '#666';
    }
  }};
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    opacity: 0.9;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ExportSection = styled.div`
  margin-top: 20px;
  padding: 16px;
  background: #e8f4fd;
  border-radius: 8px;
  border-left: 4px solid #007BFF;
`;

const ExportTitle = styled.h5`
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
  color: #007BFF;
`;

const ExportOptions = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const ExportButton = styled.button`
  padding: 6px 12px;
  border: 1px solid #007BFF;
  background: white;
  color: #007BFF;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #007BFF;
    color: white;
  }
`;

interface RegistrationTrackerProps {
  eventId?: string;
  onRegistrantAction?: (action: string, registrantId: string) => void;
}

export const RegistrationTracker: React.FC<RegistrationTrackerProps> = ({
  eventId,
  onRegistrantAction
}) => {
  const [registrants, setRegistrants] = useState<any[]>([]);
  const [filteredRegistrants, setFilteredRegistrants] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedRegistrants, setSelectedRegistrants] = useState<string[]>([]);

  // Mock registrants data
  useEffect(() => {
    const mockRegistrants = [
      {
        id: 'reg-1',
        name: 'Ahmad Hassan bin Abdullah',
        email: 'ahmad.hassan@email.com',
        phone: '+60123456789',
        registeredAt: '2025-01-15T10:30:00Z',
        paymentStatus: 'paid',
        paymentAmount: 25.00,
        paymentMethod: 'Setel Wallet',
        checkInStatus: 'not-checked-in',
        dietaryRequirements: 'Halal',
        emergencyContact: 'Siti Hassan - +60198765432',
        community: 'Malaysian Heritage Society'
      },
      {
        id: 'reg-2',
        name: 'Sarah Lim Wei Ming',
        email: 'sarah.lim@email.com',
        phone: '+60129876543',
        registeredAt: '2025-01-15T14:22:00Z',
        paymentStatus: 'pending',
        paymentAmount: 25.00,
        paymentMethod: 'Bank Transfer',
        checkInStatus: 'not-checked-in',
        dietaryRequirements: 'Vegetarian',
        emergencyContact: 'John Lim - +60123123123',
        community: 'KL Photography Club'
      },
      {
        id: 'reg-3',
        name: 'Raj Kumar S/O Suresh',
        email: 'raj.kumar@email.com',
        phone: '+60187654321',
        registeredAt: '2025-01-16T09:15:00Z',
        paymentStatus: 'paid',
        paymentAmount: 25.00,
        paymentMethod: 'Credit Card',
        checkInStatus: 'not-checked-in',
        dietaryRequirements: 'None',
        emergencyContact: 'Priya Kumar - +60134567890',
        community: 'Malaysian Architects'
      },
      {
        id: 'reg-4',
        name: 'Fatima Al-Zahra',
        email: 'fatima.alzahra@email.com',
        phone: '+60156789012',
        registeredAt: '2025-01-16T16:45:00Z',
        paymentStatus: 'failed',
        paymentAmount: 25.00,
        paymentMethod: 'Setel Wallet',
        checkInStatus: 'not-checked-in',
        dietaryRequirements: 'Halal, No nuts',
        emergencyContact: 'Omar Al-Zahra - +60145678901',
        community: 'Muslim Professional Network'
      },
      {
        id: 'reg-5',
        name: 'Chen Wei Ming',
        email: 'chen.weiming@email.com',
        phone: '+60167890123',
        registeredAt: '2025-01-17T11:30:00Z',
        paymentStatus: 'paid',
        paymentAmount: 25.00,
        paymentMethod: 'Online Banking',
        checkInStatus: 'not-checked-in',
        dietaryRequirements: 'None',
        emergencyContact: 'Li Mei Chen - +60112345678',
        community: 'Chinese Business Association'
      }
    ];
    
    setRegistrants(mockRegistrants);
    setFilteredRegistrants(mockRegistrants);
  }, [eventId]);

  // Filter and search logic
  useEffect(() => {
    let filtered = registrants;
    
    // Apply status filter
    if (filter !== 'all') {
      filtered = filtered.filter(reg => reg.paymentStatus === filter);
    }
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(reg => 
        reg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.community.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredRegistrants(filtered);
  }, [registrants, filter, searchTerm]);

  const handleRegistrantAction = (action: string, registrantId: string) => {
    const registrant = registrants.find(r => r.id === registrantId);
    
    switch (action) {
      case 'view-details':
        alert(`👤 Registrant Details

📝 Personal Information:
• Name: ${registrant?.name}
• Email: ${registrant?.email}
• Phone: ${registrant?.phone}
• Community: ${registrant?.community}

💳 Payment Information:
• Status: ${registrant?.paymentStatus.toUpperCase()}
• Amount: RM ${registrant?.paymentAmount}
• Method: ${registrant?.paymentMethod}
• Date: ${new Date(registrant?.registeredAt).toLocaleDateString()}

🍽️ Requirements:
• Dietary: ${registrant?.dietaryRequirements}
• Emergency Contact: ${registrant?.emergencyContact}

✅ Check-in Status: ${registrant?.checkInStatus}`);
        break;
      case 'send-reminder':
        alert(`📧 Payment Reminder Sent

✉️ Reminder sent to: ${registrant?.email}

📄 Reminder includes:
• Payment link and instructions
• Event details and location
• Contact information for queries
• Payment deadline information

📱 Also sent via:
• SMS to ${registrant?.phone}
• WhatsApp notification
• Push notification (if app installed)`);
        break;
      case 'process-refund':
        alert(`💰 Process Refund

🔄 Refund Details:
• Registrant: ${registrant?.name}
• Original Payment: RM ${registrant?.paymentAmount}
• Method: ${registrant?.paymentMethod}
• Refund Amount: RM ${registrant?.paymentAmount}

⏱️ Processing Time:
• Setel Wallet: Instant
• Credit Card: 3-5 business days
• Bank Transfer: 1-2 business days

📧 Confirmation email will be sent automatically.`);
        break;
      case 'mark-checked-in':
        alert(`✅ Check-in Confirmed

🎉 Successfully checked in:
• ${registrant?.name}
• Time: ${new Date().toLocaleString()}
• Status updated in real-time

📊 Updated Analytics:
• Attendance rate calculated
• Payment reconciliation updated
• Community engagement tracked

📧 Confirmation sent to registrant.`);
        break;
    }
    
    if (onRegistrantAction) {
      onRegistrantAction(action, registrantId);
    }
  };

  const handleBulkAction = (action: string) => {
    if (selectedRegistrants.length === 0) {
      alert('Please select registrants first.');
      return;
    }
    
    switch (action) {
      case 'send-reminders':
        alert(`📧 Bulk Payment Reminders

📤 Sending reminders to ${selectedRegistrants.length} registrants:
• Email notifications
• SMS reminders  
• WhatsApp messages
• Push notifications

⏱️ Estimated completion: 2-3 minutes
📊 Delivery tracking enabled
✅ Automatic follow-up scheduled`);
        break;
      case 'export-selected':
        alert(`📊 Export Selected Registrants

📁 Exporting ${selectedRegistrants.length} registrants:
• Complete registration data
• Payment transaction details
• Contact information
• Dietary requirements
• Emergency contacts

📄 Available formats: CSV, Excel, PDF
🔒 Data encrypted for privacy compliance`);  
        break;
      case 'move-to-waitlist':
        alert(`📋 Move to Waitlist

🔄 Moving ${selectedRegistrants.length} registrants to waitlist:
• Payment refunds processed automatically
• Waitlist position assigned
• Notification emails sent
• Priority booking for future events

⚡ Automatic re-invitation if spots open up`);
        break;
    }
    
    setSelectedRegistrants([]);
  };

  const handleExport = (format: string) => {
    alert(`📊 Export Registration Data

📁 Exporting in ${format.toUpperCase()} format:
• ${filteredRegistrants.length} registrants included
• Complete payment records
• Contact information
• Registration timestamps
• Dietary requirements
• Emergency contacts

🔐 Export includes:
• Data encryption
• Privacy compliance headers
• Audit trail information
• Export timestamp

📧 Download link will be emailed to you.`);
  };

  const stats = {
    total: registrants.length,
    paid: registrants.filter(r => r.paymentStatus === 'paid').length,
    pending: registrants.filter(r => r.paymentStatus === 'pending').length,
    failed: registrants.filter(r => r.paymentStatus === 'failed').length,
    revenue: registrants.filter(r => r.paymentStatus === 'paid').reduce((sum, r) => sum + r.paymentAmount, 0)
  };

  return (
    <TrackerContainer>
      <TrackerHeader>
        <div>
          <TrackerTitle>
            📊 Registration Tracking
          </TrackerTitle>
          <TrackerSubtitle>Real-time payment and attendance monitoring</TrackerSubtitle>
        </div>
      </TrackerHeader>

      <StatsOverview>
        <StatCard $color="linear-gradient(135deg, #007BFF, #0056b3)">
          <StatValue>{stats.total}</StatValue>
          <StatLabel>Total Registered</StatLabel>
        </StatCard>
        <StatCard $color="linear-gradient(135deg, #28A745, #20C997)">
          <StatValue>{stats.paid}</StatValue>
          <StatLabel>Payments Confirmed</StatLabel>
        </StatCard>
        <StatCard $color="linear-gradient(135deg, #FF8F00, #FFA726)">
          <StatValue>{stats.pending}</StatValue>
          <StatLabel>Pending Payment</StatLabel>
        </StatCard>
        <StatCard $color="linear-gradient(135deg, #DC3545, #E57373)">
          <StatValue>{stats.failed}</StatValue>
          <StatLabel>Failed Payments</StatLabel>
        </StatCard>
        <StatCard $color="linear-gradient(135deg, #7B1FA2, #AB47BC)">
          <StatValue>RM {stats.revenue}</StatValue>
          <StatLabel>Revenue Collected</StatLabel>
        </StatCard>
      </StatsOverview>

      <FilterBar>
        <FilterButton $active={filter === 'all'} onClick={() => setFilter('all')}>
          All ({stats.total})
        </FilterButton>
        <FilterButton $active={filter === 'paid'} onClick={() => setFilter('paid')}>
          Paid ({stats.paid})
        </FilterButton>
        <FilterButton $active={filter === 'pending'} onClick={() => setFilter('pending')}>
          Pending ({stats.pending})
        </FilterButton>
        <FilterButton $active={filter === 'failed'} onClick={() => setFilter('failed')}>
          Failed ({stats.failed})
        </FilterButton>
        <SearchBar 
          placeholder="Search by name, email, or community..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </FilterBar>

      {selectedRegistrants.length > 0 && (
        <BulkActions>
          <span style={{ fontSize: '12px', color: '#666', alignSelf: 'center' }}>
            {selectedRegistrants.length} selected
          </span>
          <BulkActionButton $variant="primary" onClick={() => handleBulkAction('send-reminders')}>
            📧 Send Reminders
          </BulkActionButton>
          <BulkActionButton onClick={() => handleBulkAction('export-selected')}>
            📊 Export Selected
          </BulkActionButton>
          <BulkActionButton onClick={() => handleBulkAction('move-to-waitlist')}>
            📋 Move to Waitlist
          </BulkActionButton>
          <BulkActionButton onClick={() => setSelectedRegistrants([])}>
            ❌ Clear Selection
          </BulkActionButton>
        </BulkActions>
      )}

      <RegistrantsList>
        {filteredRegistrants.map((registrant) => (
          <RegistrantCard key={registrant.id}>
            <RegistrantHeader>
              <input 
                type="checkbox"
                checked={selectedRegistrants.includes(registrant.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedRegistrants([...selectedRegistrants, registrant.id]);
                  } else {
                    setSelectedRegistrants(selectedRegistrants.filter(id => id !== registrant.id));
                  }
                }}
                style={{ marginRight: '8px' }}
              />
              <RegistrantInfo>
                <RegistrantName>{registrant.name}</RegistrantName>
                <RegistrantEmail>{registrant.email}</RegistrantEmail>
                <RegistrantMeta>
                  <span>📅 {new Date(registrant.registeredAt).toLocaleString()}</span>
                  <span>🏘️ {registrant.community}</span>
                  <span>💳 {registrant.paymentMethod}</span>
                </RegistrantMeta>
              </RegistrantInfo>
              <PaymentStatus $status={registrant.paymentStatus}>
                {registrant.paymentStatus}
              </PaymentStatus>
              <RegistrantActions>
                <ActionButton onClick={() => handleRegistrantAction('view-details', registrant.id)}>
                  👁️ View
                </ActionButton>
                {registrant.paymentStatus === 'pending' && (
                  <ActionButton onClick={() => handleRegistrantAction('send-reminder', registrant.id)}>
                    📧 Remind
                  </ActionButton>
                )}
                {registrant.paymentStatus === 'paid' && (
                  <>
                    <ActionButton onClick={() => handleRegistrantAction('mark-checked-in', registrant.id)}>
                      ✅ Check-in
                    </ActionButton>
                    <ActionButton onClick={() => handleRegistrantAction('process-refund', registrant.id)}>
                      💰 Refund
                    </ActionButton>
                  </>
                )}
              </RegistrantActions>
            </RegistrantHeader>
          </RegistrantCard>
        ))}
      </RegistrantsList>

      <ExportSection>
        <ExportTitle>📊 Export Registration Data</ExportTitle>
        <ExportOptions>
          <ExportButton onClick={() => handleExport('csv')}>
            📄 CSV Spreadsheet
          </ExportButton>
          <ExportButton onClick={() => handleExport('excel')}>
            📊 Excel Workbook  
          </ExportButton>
          <ExportButton onClick={() => handleExport('pdf')}>
            📋 PDF Report
          </ExportButton>
          <ExportButton onClick={() => handleExport('json')}>
            🔧 JSON Data
          </ExportButton>
        </ExportOptions>
      </ExportSection>
    </TrackerContainer>
  );
};

export default RegistrationTracker;