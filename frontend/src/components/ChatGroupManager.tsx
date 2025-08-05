import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

// Chat Group Management Components
const ChatManagerContainer = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin: 16px 0;
`;

const ManagerHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const ManagerTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const WhatsAppBadge = styled.div`
  background: #25D366;
  color: white;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
`;

const QuickActions = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  flex-wrap: wrap;
`;

const QuickActionButton = styled.button<{ $color?: string }>`
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  background: ${({ $color }) => $color || '#25D366'};
  color: white;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  
  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }
`;

const GroupsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
`;

const GroupCard = styled.div`
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 16px;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f1f3f4;
    border-color: #25D366;
  }
`;

const GroupHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

const GroupInfo = styled.div`
  flex: 1;
`;

const GroupName = styled.h4`
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
  color: #25D366;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const GroupMeta = styled.div`
  font-size: 11px;
  color: #666;
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
`;

const GroupDescription = styled.p`
  margin: 0;
  font-size: 12px;
  color: #333;
  line-height: 1.4;
`;

const GroupStatus = styled.div<{ $status: 'active' | 'pending' | 'archived' }>`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  background: ${({ $status }) => {
    switch ($status) {
      case 'active': return '#E8F5E8';
      case 'pending': return '#FFF8E1';
      case 'archived': return '#F3E5F5';
      default: return '#F8F9FA';
    }
  }};
  color: ${({ $status }) => {
    switch ($status) {
      case 'active': return '#28A745';
      case 'pending': return '#FF8F00';
      case 'archived': return '#7B1FA2';
      default: return '#666';
    }
  }};
`;

const GroupActions = styled.div`
  display: flex;
  gap: 6px;
  margin-top: 8px;
  flex-wrap: wrap;
`;

const GroupActionButton = styled.button<{ $variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: 4px 8px;
  border: 1px solid ${({ $variant }) => {
    switch ($variant) {
      case 'primary': return '#25D366';
      case 'danger': return '#DC3545';
      default: return '#e9ecef';
    }
  }};
  background: ${({ $variant }) => {
    switch ($variant) {
      case 'primary': return '#25D366';
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
  border-radius: 4px;
  font-size: 10px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    opacity: 0.9;
  }
`;

const TemplatesSection = styled.div`
  background: #e8f0fe;
  border-radius: 12px;
  padding: 16px;
  margin-top: 20px;
`;

const TemplatesTitle = styled.h5`
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #1a73e8;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const TemplatesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const TemplateCard = styled.div`
  background: white;
  border: 1px solid rgba(26, 115, 232, 0.2);
  border-radius: 8px;
  padding: 12px;
`;

const TemplateName = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: #1a73e8;
  margin-bottom: 4px;
`;

const TemplatePreview = styled.div`
  font-size: 11px;
  color: #666;
  font-style: italic;
  margin-bottom: 8px;
  padding: 8px;
  background: #f8f9fa;
  border-radius: 4px;
  border-left: 3px solid #1a73e8;
`;

const TemplateActions = styled.div`
  display: flex;
  gap: 6px;
`;

const TemplateButton = styled.button`
  padding: 4px 8px;
  border: 1px solid #1a73e8;
  background: white;
  color: #1a73e8;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #1a73e8;
    color: white;
  }
`;

const AutomationSettings = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  margin-top: 20px;
  border-left: 4px solid #28A745;
`;

const AutomationTitle = styled.h5`
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #28A745;
`;

const AutomationItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #e9ecef;
  
  &:last-child {
    border-bottom: none;
  }
`;

const AutomationLabel = styled.div`
  font-size: 12px;
  color: #333;
`;

const AutomationToggle = styled.div<{ $enabled: boolean }>`
  width: 40px;
  height: 20px;
  background: ${({ $enabled }) => $enabled ? '#28A745' : '#ccc'};
  border-radius: 10px;
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &::after {
    content: '';
    position: absolute;
    width: 16px;
    height: 16px;
    background: white;
    border-radius: 50%;
    top: 2px;
    left: ${({ $enabled }) => $enabled ? '22px' : '2px'};
    transition: all 0.2s ease;
  }
`;

interface ChatGroupManagerProps {
  eventId?: string;
  onGroupAction?: (action: string, groupId: string) => void;
}

export const ChatGroupManager: React.FC<ChatGroupManagerProps> = ({
  eventId,
  onGroupAction
}) => {
  const [groups, setGroups] = useState<any[]>([]);
  const [automationSettings, setAutomationSettings] = useState({
    autoAddMembers: true,
    sendWelcomeMessage: true,
    shareEventDetails: true,
    sendReminders: true,
    postEventFollowUp: true,
    photoSharing: true
  });

  // Mock groups data
  useEffect(() => {
    const mockGroups = [
      {
        id: 'group-1',
        name: 'Community Networking - Main Group',
        description: 'Primary event discussion and updates',
        members: 42,
        status: 'active',
        createdAt: '2025-01-15T10:00:00Z',
        lastActivity: '2025-01-17T14:30:00Z',
        whatsappLink: 'https://chat.whatsapp.com/invite-link',
        adminCount: 3,
        messageCount: 127
      },
      {
        id: 'group-2',
        name: 'Networking - Professionals',
        description: 'Professional networking and business connections',
        members: 23,
        status: 'active',
        createdAt: '2025-01-15T11:30:00Z',
        lastActivity: '2025-01-17T16:45:00Z',
        whatsappLink: 'https://chat.whatsapp.com/invite-link-2',
        adminCount: 2,
        messageCount: 89
      },
      {
        id: 'group-3',
        name: 'Event Coordination Team',
        description: 'Admin and volunteer coordination',
        members: 8,
        status: 'active',
        createdAt: '2025-01-15T09:00:00Z',
        lastActivity: '2025-01-17T18:20:00Z',
        whatsappLink: 'https://chat.whatsapp.com/admin-link',
        adminCount: 4,
        messageCount: 245
      },
      {
        id: 'group-4',
        name: 'Post-Event Follow-up',
        description: 'Continued connections and future opportunities',
        members: 0,
        status: 'pending',
        createdAt: null,
        lastActivity: null,
        whatsappLink: null,
        adminCount: 0,
        messageCount: 0
      }
    ];
    
    setGroups(mockGroups);
  }, [eventId]);

  const messageTemplates = [
    {
      id: 'welcome',
      name: 'Welcome Message',
      preview: '🎉 Welcome to our Community Networking event group! We\'re excited to have you join us. Event details and updates will be shared here.'
    },
    {
      id: 'reminder-24h',
      name: '24-Hour Reminder',
      preview: '⏰ Reminder: Our Community Networking event is tomorrow at 4:00 PM! Don\'t forget to bring your business cards and enthusiasm. See you there! 📍 Location: [Venue Address]'
    },
    {
      id: 'event-start',
      name: 'Event Starting',
      preview: '🚀 The event is starting now! Welcome everyone to the venue. Check-in is at the main entrance. Looking forward to meeting you all!'
    },
    {
      id: 'photo-sharing',
      name: 'Photo Sharing Request',
      preview: '📸 Please share your favorite moments from today\'s event! We\'d love to see your photos and create a memorable album together. #CommunityNetworking'
    },
    {
      id: 'follow-up',
      name: 'Post-Event Follow-up',
      preview: '🙏 Thank you for joining our Community Networking event! We hope you made valuable connections. Feel free to continue networking in this group and stay tuned for future events!'
    }
  ];

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'create-main-group':
        alert(`🆕 Create Main Event Group

✨ Setting up:
• Event-branded group name
• Welcome message template
• Group description and rules
• Admin permissions setup
• Auto-invite confirmed attendees
• Share event details and location

📱 WhatsApp group will be created with:
• Professional group icon
• Event-specific description
• Automated member additions
• Pre-scheduled announcements

⏱️ Estimated setup time: 2-3 minutes`);
        break;
      case 'invite-all':
        alert(`📧 Bulk Invite All Attendees

👥 Inviting 47 confirmed attendees to:
• Main event group
• Relevant sub-groups based on interests
• Admin coordination (if applicable)

📱 Invitation methods:
• WhatsApp group links
• SMS with join instructions
• Email with group details
• In-app notifications

⚡ Automated features:
• Welcome message upon joining
• Event details sharing
• Group rules explanation`);
        break;
      case 'send-announcement':
        alert(`📢 Send Group Announcement

📝 Compose and send to all groups:
• Event updates and changes
• Important reminders
• Schedule announcements
• Special instructions

🎯 Targeting options:
• All groups
• Specific groups only
• Admin groups
• Member groups

📊 Delivery tracking:
• Read receipts monitoring
• Engagement analytics
• Response rate tracking`);
        break;
      case 'export-contacts':
        alert(`📞 Export Contact Information

📋 Exporting group member data:
• Phone numbers (privacy compliant)
• Names and profiles
• Group participation stats
• Engagement metrics

📄 Available formats:
• CSV for spreadsheets
• vCard for contacts
• JSON for integration
• PDF directory

🔒 Privacy compliance:
• Consent verification
• GDPR compliant export
• Anonymization options`);
        break;
    }
  };

  const handleGroupAction = (action: string, groupId: string) => {
    const group = groups.find(g => g.id === groupId);
    
    switch (action) {
      case 'open-whatsapp':
        if (group?.whatsappLink) {
          window.open(group.whatsappLink, '_blank');
        } else {
          alert('WhatsApp group not yet created for this event.');
        }
        break;
      case 'manage-members':
        alert(`👥 Manage Group Members

Group: ${group?.name}
Current Members: ${group?.members}

🛠️ Member Management:
• Add new members individually
• Bulk invite from attendee list
• Remove inactive members
• Promote to admin/moderator
• View member activity stats

📊 Member Analytics:
• Join date and engagement
• Message participation rates
• Connection recommendations
• Activity patterns`);
        break;
      case 'send-message':
        alert(`💬 Send Group Message

Group: ${group?.name}
Members: ${group?.members}

📝 Message Options:
• Instant message to all members
• Scheduled announcement
• Template-based message
• Rich media sharing (photos, documents)

🎯 Advanced Features:
• Message scheduling
• Read receipt tracking
• Engagement analytics
• Auto-translation options`);
        break;
      case 'view-analytics':
        alert(`📊 Group Analytics Dashboard

Group: ${group?.name}

📈 Key Metrics:
• Total Messages: ${group?.messageCount}
• Active Members: ${Math.floor((group?.members || 0) * 0.7)}
• Admin Count: ${group?.adminCount}
• Engagement Rate: 73%
• Peak Activity: 6-8 PM
• Most Active Day: Thursday

💡 Insights:
• Top contributors
• Message sentiment analysis
• Network connections formed
• Event impact assessment`);
        break;
      case 'archive':
        alert(`📦 Archive Group

Group: ${group?.name}

⚠️ This will:
• Stop new messages
• Preserve message history
• Notify members of archival
• Maintain admin access
• Export final analytics

✅ Archived groups can be:
• Restored if needed
• Used for reference
• Exported for records
• Analyzed for insights`);
        break;
    }
    
    if (onGroupAction) {
      onGroupAction(action, groupId);
    }
  };

  const handleTemplateAction = (action: string, templateId: string) => {
    const template = messageTemplates.find(t => t.id === templateId);
    
    switch (action) {
      case 'send-now':
        alert(`📤 Send Template Message

Template: ${template?.name}

📱 Sending to all active groups:
• ${groups.filter(g => g.status === 'active').length} groups
• ${groups.reduce((sum, g) => sum + (g.members || 0), 0)} total members

⚡ Message will be delivered:
• Instantly to all members
• With read receipt tracking
• Including engagement analytics
• Auto-translated if needed

✅ Delivery confirmation in 2-3 minutes`);
        break;
      case 'schedule':
        alert(`⏰ Schedule Template Message

Template: ${template?.name}

📅 Scheduling Options:
• Specific date and time
• Relative to event (24h before, etc.)
• Recurring reminders
• Time zone awareness

🎯 Smart Scheduling:
• Optimal engagement times
• Member activity patterns
• Time zone distribution
• Weekend/holiday awareness

📊 Scheduled messages dashboard available`);
        break;
      case 'customize':
        alert(`✏️ Customize Template

Template: ${template?.name}

🛠️ Customization Options:
• Personalize with event details
• Add member-specific information
• Include dynamic content (weather, etc.)
• Multilingual versions
• Rich media attachments

💡 Smart Variables:
• {{event_name}}, {{date}}, {{location}}
• {{member_name}}, {{community}}
• {{weather}}, {{traffic_info}}
• Custom merge fields`);
        break;
    }
  };

  const toggleAutomation = (setting: string) => {
    setAutomationSettings(prev => ({
      ...prev,
      [setting]: !prev[setting as keyof typeof prev]
    }));
    
    alert(`🔄 Automation ${automationSettings[setting as keyof typeof automationSettings] ? 'Disabled' : 'Enabled'}

Setting: ${setting.replace(/([A-Z])/g, ' $1').toLowerCase()}

${!automationSettings[setting as keyof typeof automationSettings] ? 
  '✅ This automation is now active and will run automatically based on event triggers.' :
  '⏹️ This automation has been disabled and will not run automatically.'}

📊 All automation changes are logged and can be reviewed in the settings dashboard.`);
  };

  return (
    <ChatManagerContainer>
      <ManagerHeader>
        <div>
          <ManagerTitle>
            💬 Chat Group Management
          </ManagerTitle>
        </div>
        <WhatsAppBadge>WhatsApp Connected</WhatsAppBadge>
      </ManagerHeader>

      <QuickActions>
        <QuickActionButton onClick={() => handleQuickAction('create-main-group')}>
          ➕ Create Main Group
        </QuickActionButton>
        <QuickActionButton onClick={() => handleQuickAction('invite-all')} $color="#007BFF">
          📧 Invite All Attendees
        </QuickActionButton>
        <QuickActionButton onClick={() => handleQuickAction('send-announcement')} $color="#FF8F00">
          📢 Send Announcement
        </QuickActionButton>
        <QuickActionButton onClick={() => handleQuickAction('export-contacts')} $color="#7B1FA2">
          📞 Export Contacts
        </QuickActionButton>
      </QuickActions>

      <GroupsList>
        {groups.map((group) => (
          <GroupCard key={group.id}>
            <GroupHeader>
              <GroupInfo>
                <GroupName>
                  💬 {group.name}
                </GroupName>
                <GroupMeta>
                  <span>👥 {group.members} members</span>
                  <span>👨‍💼 {group.adminCount} admins</span>
                  {group.messageCount > 0 && <span>💬 {group.messageCount} messages</span>}
                  {group.lastActivity && (
                    <span>🕐 {new Date(group.lastActivity).toLocaleDateString()}</span>
                  )}
                </GroupMeta>
                <GroupDescription>{group.description}</GroupDescription>
              </GroupInfo>
              <GroupStatus $status={group.status}>
                {group.status}
              </GroupStatus>
            </GroupHeader>
            
            <GroupActions>
              {group.status === 'active' && (
                <>
                  <GroupActionButton $variant="primary" onClick={() => handleGroupAction('open-whatsapp', group.id)}>
                    💬 Open WhatsApp
                  </GroupActionButton>
                  <GroupActionButton onClick={() => handleGroupAction('manage-members', group.id)}>
                    👥 Members
                  </GroupActionButton>
                  <GroupActionButton onClick={() => handleGroupAction('send-message', group.id)}>
                    📤 Send Message
                  </GroupActionButton>
                  <GroupActionButton onClick={() => handleGroupAction('view-analytics', group.id)}>
                    📊 Analytics
                  </GroupActionButton>
                  <GroupActionButton onClick={() => handleGroupAction('archive', group.id)}>
                    📦 Archive
                  </GroupActionButton>
                </>
              )}
              {group.status === 'pending' && (
                <GroupActionButton $variant="primary" onClick={() => alert('Creating WhatsApp group...')}>
                  🚀 Create Group
                </GroupActionButton>
              )}
            </GroupActions>
          </GroupCard>
        ))}
      </GroupsList>

      <TemplatesSection>
        <TemplatesTitle>
          📝 Message Templates
        </TemplatesTitle>
        <TemplatesList>
          {messageTemplates.map((template) => (
            <TemplateCard key={template.id}>
              <TemplateName>{template.name}</TemplateName>
              <TemplatePreview>"{template.preview}"</TemplatePreview>
              <TemplateActions>
                <TemplateButton onClick={() => handleTemplateAction('send-now', template.id)}>
                  📤 Send Now
                </TemplateButton>
                <TemplateButton onClick={() => handleTemplateAction('schedule', template.id)}>
                  ⏰ Schedule
                </TemplateButton>
                <TemplateButton onClick={() => handleTemplateAction('customize', template.id)}>
                  ✏️ Customize
                </TemplateButton>
              </TemplateActions>
            </TemplateCard>
          ))}
        </TemplatesList>
      </TemplatesSection>

      <AutomationSettings>
        <AutomationTitle>🤖 Automation Settings</AutomationTitle>
        
        <AutomationItem>
          <AutomationLabel>Auto-add confirmed attendees to groups</AutomationLabel>
          <AutomationToggle 
            $enabled={automationSettings.autoAddMembers}
            onClick={() => toggleAutomation('autoAddMembers')}
          />
        </AutomationItem>
        
        <AutomationItem>
          <AutomationLabel>Send welcome message to new members</AutomationLabel>
          <AutomationToggle 
            $enabled={automationSettings.sendWelcomeMessage}
            onClick={() => toggleAutomation('sendWelcomeMessage')}
          />
        </AutomationItem>
        
        <AutomationItem>
          <AutomationLabel>Share event details automatically</AutomationLabel>
          <AutomationToggle 
            $enabled={automationSettings.shareEventDetails}
            onClick={() => toggleAutomation('shareEventDetails')}
          />
        </AutomationItem>
        
        <AutomationItem>
          <AutomationLabel>Send event reminders (24h, 1h before)</AutomationLabel>
          <AutomationToggle 
            $enabled={automationSettings.sendReminders}
            onClick={() => toggleAutomation('sendReminders')}
          />
        </AutomationItem>
        
        <AutomationItem>
          <AutomationLabel>Post-event follow-up and networking</AutomationLabel>
          <AutomationToggle 
            $enabled={automationSettings.postEventFollowUp}
            onClick={() => toggleAutomation('postEventFollowUp')}
          />
        </AutomationItem>
        
        <AutomationItem>
          <AutomationLabel>Enable photo sharing and albums</AutomationLabel>
          <AutomationToggle 
            $enabled={automationSettings.photoSharing}
            onClick={() => toggleAutomation('photoSharing')}
          />
        </AutomationItem>
      </AutomationSettings>
    </ChatManagerContainer>
  );
};

export default ChatGroupManager;