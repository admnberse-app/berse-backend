import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

// Google Forms Integration Component
const GoogleFormsContainer = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin: 16px 0;
  border: 2px solid #f0f0f0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const FormsHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
`;

const FormsIcon = styled.div`
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #4285F4, #34A853);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
`;

const FormsTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
`;

const FormsSubtitle = styled.p`
  margin: 0;
  font-size: 12px;
  color: #666;
`;

const FormStatusBadge = styled.div<{ $status: 'active' | 'draft' | 'completed' }>`
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  margin-left: auto;
  background: ${({ $status }) => {
    switch ($status) {
      case 'active': return '#E8F5E8';
      case 'draft': return '#FFF8E1';
      case 'completed': return '#F3E5F5';
      default: return '#F8F9FA';
    }
  }};
  color: ${({ $status }) => {
    switch ($status) {
      case 'active': return '#28A745';
      case 'draft': return '#FF8F00';
      case 'completed': return '#7B1FA2';
      default: return '#666';
    }
  }};
`;

const FormsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const FormCard = styled.div`
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 16px;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f1f3f4;
    border-color: #4285F4;
  }
`;

const FormCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
`;

const FormName = styled.h4`
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
`;

const FormUrl = styled.a`
  font-size: 11px;
  color: #4285F4;
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;

const FormStats = styled.div`
  display: flex;
  gap: 16px;
  margin: 8px 0;
`;

const FormStat = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const FormStatLabel = styled.div`
  font-size: 9px;
  color: #666;
  text-transform: uppercase;
  font-weight: 500;
`;

const FormStatValue = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: #333;
`;

const FormActions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;
`;

const FormActionButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 6px 12px;
  border: 1px solid ${({ $variant }) => $variant === 'primary' ? '#4285F4' : '#e9ecef'};
  background: ${({ $variant }) => $variant === 'primary' ? '#4285F4' : 'white'};
  color: ${({ $variant }) => $variant === 'primary' ? 'white' : '#666'};
  border-radius: 6px;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ $variant }) => $variant === 'primary' ? '#3367D6' : '#f8f9fa'};
  }
`;

const IntegrationSettings = styled.div`
  background: #e8f0fe;
  border-radius: 8px;
  padding: 16px;
  margin-top: 16px;
`;

const SettingsTitle = styled.h5`
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #1a73e8;
`;

const SettingItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid rgba(26, 115, 232, 0.1);
  
  &:last-child {
    border-bottom: none;
  }
`;

const SettingLabel = styled.div`
  font-size: 12px;
  color: #333;
  font-weight: 500;
`;

const SettingValue = styled.div`
  font-size: 11px;
  color: #1a73e8;
  font-weight: 600;
`;

const CreateFormButton = styled.button`
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #4285F4, #34A853);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 16px;
  
  &:hover {
    background: linear-gradient(135deg, #3367D6, #2E7D32);
    transform: translateY(-1px);
  }
`;

interface GoogleFormsIntegrationProps {
  eventId?: string;
  communityId?: string;
  onFormCreated?: (formData: any) => void;
}

export const GoogleFormsIntegration: React.FC<GoogleFormsIntegrationProps> = ({
  eventId,
  communityId,
  onFormCreated
}) => {
  const [forms, setForms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Mock forms data
  useEffect(() => {
    setForms([
      {
        id: 'form-1',
        name: 'Event Registration Form',
        url: 'https://forms.google.com/event-registration',
        status: 'active',
        responses: 47,
        lastModified: '2 hours ago',
        autoPopulate: true,
        paymentIntegrated: true
      },
      {
        id: 'form-2',
        name: 'Dietary Requirements',
        url: 'https://forms.google.com/dietary-requirements',
        status: 'active',
        responses: 42,
        lastModified: '1 day ago',
        autoPopulate: false,
        paymentIntegrated: false
      },
      {
        id: 'form-3',
        name: 'Post-Event Feedback',
        url: 'https://forms.google.com/event-feedback',
        status: 'draft',
        responses: 0,
        lastModified: '3 days ago',
        autoPopulate: true,
        paymentIntegrated: false
      }
    ]);
  }, [eventId, communityId]);

  const handleCreateForm = () => {
    setIsLoading(true);
    // Simulate form creation
    setTimeout(() => {
      alert(`🚀 Google Forms Integration Setup

✨ Features Configured:
• Smart form template with community branding
• Auto-populated member profile data
• Custom registration fields
• Payment confirmation workflow
• Dietary/accessibility requirements
• Emergency contact collection
• Skills assessment questions

🔄 Automation Setup:
• Form responses → member database sync
• Auto-update payment status
• Generate confirmation emails
• Create WhatsApp groups
• Send calendar invites
• Attendance tracking integration

📊 Analytics Integration:
• Real-time response monitoring
• Registration conversion tracking
• Payment completion rates
• Demographics analysis
• Custom reporting dashboard

🔗 Generated Form URL:
https://forms.google.com/community-event-${Date.now()}

The form is now live and ready for registrations!`);
      
      setIsLoading(false);
      if (onFormCreated) {
        onFormCreated({
          id: `form-${Date.now()}`,
          name: 'New Event Registration',
          status: 'active'
        });
      }
    }, 2000);
  };

  const handleFormAction = (action: string, formId: string) => {
    switch (action) {
      case 'view-responses':
        alert(`📊 Google Forms Responses Dashboard

Form: ${forms.find(f => f.id === formId)?.name}

📈 Response Analytics:
• Total responses: ${forms.find(f => f.id === formId)?.responses || 0}
• Completion rate: 89.4%
• Average time: 3m 42s
• Drop-off point: Payment section (11%)

💾 Data Export Options:
• CSV/Excel spreadsheet
• Google Sheets integration
• JSON API format
• PDF summary report

🔄 Real-time Sync:
• Automatic profile updates
• Payment status tracking
• WhatsApp group additions
• Email confirmations sent`);
        break;
      case 'edit-form':
        alert(`✏️ Edit Google Form

🛠️ Available Modifications:
• Add/remove custom fields
• Update community branding
• Modify payment integration
• Adjust auto-population settings
• Configure confirmation messages
• Set up conditional logic

🎨 Customization Options:
• Community colors and logos
• Custom thank you messages
• Branded email templates
• Personalized notifications

⚙️ Advanced Settings:
• Response limits
• Deadline configurations
• Admin notification rules
• Data validation rules`);
        break;
      case 'duplicate':
        alert(`📋 Duplicate Form Template

✅ Creating copy with:
• All custom fields preserved
• Community branding maintained
• Payment integration ready
• Auto-population configured
• Analytics tracking enabled

🔧 Quick Customization:
• Update event-specific details
• Modify date/time fields
• Adjust capacity limits
• Configure new WhatsApp groups

New form will be created as draft for review.`);
        break;
      case 'archive':
        alert(`📦 Archive Form

⚠️ This will:
• Stop accepting new responses
• Preserve existing data
• Maintain analytics access
• Keep integration settings

✅ Archived forms can be:
• Restored if needed
• Used as templates
• Exported for records
• Referenced for analytics`);
        break;
    }
  };

  return (
    <GoogleFormsContainer>
      <FormsHeader>
        <FormsIcon>📋</FormsIcon>
        <div style={{ flex: 1 }}>
          <FormsTitle>Google Forms Integration</FormsTitle>
          <FormsSubtitle>Automated data collection with profile population</FormsSubtitle>
        </div>
        <FormStatusBadge $status="active">Connected</FormStatusBadge>
      </FormsHeader>

      <CreateFormButton onClick={handleCreateForm} disabled={isLoading}>
        {isLoading ? '⏳ Creating Form...' : '➕ Create New Registration Form'}
      </CreateFormButton>

      <FormsList>
        {forms.map((form) => (
          <FormCard key={form.id}>
            <FormCardHeader>
              <div>
                <FormName>{form.name}</FormName>
                <FormUrl href={form.url} target="_blank" rel="noopener noreferrer">
                  {form.url}
                </FormUrl>
              </div>
              <FormStatusBadge $status={form.status}>
                {form.status === 'active' ? '🟢 Active' : 
                 form.status === 'draft' ? '🟡 Draft' : '✅ Completed'}
              </FormStatusBadge>
            </FormCardHeader>

            <FormStats>
              <FormStat>
                <FormStatLabel>Responses</FormStatLabel>
                <FormStatValue>{form.responses}</FormStatValue>
              </FormStat>
              <FormStat>
                <FormStatLabel>Last Modified</FormStatLabel>
                <FormStatValue>{form.lastModified}</FormStatValue>
              </FormStat>
              <FormStat>
                <FormStatLabel>Auto-populate</FormStatLabel>
                <FormStatValue>{form.autoPopulate ? '✅ Yes' : '❌ No'}</FormStatValue>
              </FormStat>
              <FormStat>
                <FormStatLabel>Payment</FormStatLabel>
                <FormStatValue>{form.paymentIntegrated ? '💳 Yes' : '➖ No'}</FormStatValue>
              </FormStat>
            </FormStats>

            <FormActions>
              <FormActionButton $variant="primary" onClick={() => handleFormAction('view-responses', form.id)}>
                📊 Responses
              </FormActionButton>
              <FormActionButton $variant="secondary" onClick={() => handleFormAction('edit-form', form.id)}>
                ✏️ Edit
              </FormActionButton>
              <FormActionButton $variant="secondary" onClick={() => handleFormAction('duplicate', form.id)}>
                📋 Duplicate
              </FormActionButton>
              <FormActionButton $variant="secondary" onClick={() => handleFormAction('archive', form.id)}>
                📦 Archive
              </FormActionButton>
            </FormActions>
          </FormCard>
        ))}
      </FormsList>

      <IntegrationSettings>
        <SettingsTitle>🔧 Integration Configuration</SettingsTitle>
        <SettingItem>
          <SettingLabel>Auto-populate member profiles</SettingLabel>
          <SettingValue>✅ Enabled</SettingValue>
        </SettingItem>
        <SettingItem>
          <SettingLabel>Payment status sync</SettingLabel>
          <SettingValue>✅ Real-time</SettingValue>
        </SettingItem>
        <SettingItem>
          <SettingLabel>WhatsApp group creation</SettingLabel>
          <SettingValue>✅ Automatic</SettingValue>
        </SettingItem>
        <SettingItem>
          <SettingLabel>Email confirmations</SettingLabel>
          <SettingValue>✅ Instant</SettingValue>
        </SettingItem>
        <SettingItem>
          <SettingLabel>Analytics tracking</SettingLabel>
          <SettingValue>✅ Advanced</SettingValue>
        </SettingItem>
        <SettingItem>
          <SettingLabel>Data backup</SettingLabel>
          <SettingValue>🔄 Daily</SettingValue>
        </SettingItem>
      </IntegrationSettings>
    </GoogleFormsContainer>
  );
};

export default GoogleFormsIntegration;