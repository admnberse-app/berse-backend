import React, { useState } from 'react';
import styled from 'styled-components';
import { useMessaging } from '../contexts/MessagingContext';

// Styled Components
const MessagingModalOverlay = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: ${({ isOpen }) => isOpen ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 2500;
  padding: 20px;
`;

const MessagingModalContent = styled.div`
  background: white;
  border-radius: 20px;
  width: 100%;
  max-width: 400px;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const MessagingModalHeader = styled.div`
  background: linear-gradient(135deg, #2D5F4F, #4A90A4);
  padding: 20px;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const MessagingModalTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
`;

const MessagingModalCloseButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  color: white;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const ContextBar = styled.div`
  padding: 12px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  font-size: 12px;
  color: #666;
`;

const ContextTitle = styled.div`
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
`;

const MessagingBody = styled.div`
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  max-height: 400px;
`;

const RecipientInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 12px;
  margin-bottom: 16px;
`;

const RecipientAvatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #2D5F4F, #4A90A4);
  color: white;
  font-size: 18px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const RecipientDetails = styled.div`
  flex: 1;
`;

const RecipientName = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
`;

const RecipientMeta = styled.div`
  font-size: 12px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 4px;
  
  &::before {
    content: '✓';
    color: #4CAF50;
    font-size: 10px;
  }
`;

const QuickActions = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
`;

const QuickActionButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  flex: 1;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  ${({ $variant = 'secondary' }) => 
    $variant === 'primary' 
      ? `
        background: #2D5F4F;
        color: white;
        border: 1px solid #2D5F4F;
        
        &:hover {
          background: #1F4A3A;
        }
      `
      : `
        background: white;
        color: #666;
        border: 1px solid #E5E5E5;
        
        &:hover {
          background: #f5f5f5;
          border-color: #d0d0d0;
        }
      `
  }
`;

const MessageTemplates = styled.div`
  margin-bottom: 16px;
`;

const TemplatesTitle = styled.h4`
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
`;

const TemplateButton = styled.button`
  background: #e8f4f0;
  color: #2D5F4F;
  border: 1px solid #2D5F4F22;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 12px;
  cursor: pointer;
  margin: 4px 8px 4px 0;
  transition: all 0.2s ease;
  
  &:hover {
    background: #d4f4e9;
    border-color: #2D5F4F44;
  }
`;

const MessageInput = styled.textarea`
  width: 100%;
  min-height: 80px;
  padding: 12px;
  border: 2px solid #e5e5e5;
  border-radius: 8px;
  font-size: 14px;
  resize: vertical;
  outline: none;
  transition: border-color 0.2s ease;
  margin-bottom: 16px;
  box-sizing: border-box;
  
  &:focus {
    border-color: #2D5F4F;
  }
  
  &::placeholder {
    color: #999;
  }
`;

const SendMessageButton = styled.button<{ $disabled?: boolean }>`
  background: ${({ $disabled }) => $disabled ? '#cccccc' : '#2D5F4F'};
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: ${({ $disabled }) => $disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ $disabled }) => $disabled ? '#cccccc' : '#1F4A3A'};
  }
`;

export const UnifiedMessagingModal: React.FC = () => {
  const { 
    isMessagingModalOpen, 
    selectedConversation, 
    closeMessagingModal, 
    sendMessage 
  } = useMessaging();
  
  const [messageText, setMessageText] = useState('');

  const handleMessageTemplateClick = (template: string) => {
    setMessageText(template);
  };

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedConversation) return;
    
    // Extract recipient info from conversation
    const recipientId = selectedConversation.participantIds.find(id => id !== 'current-user') || '';
    const recipientName = selectedConversation.participantNames.find(name => name !== 'Current User') || '';
    
    // Send message using the unified system
    sendMessage(
      recipientId,
      recipientName,
      messageText,
      selectedConversation.context
    );
    
    // Reset the message text
    setMessageText('');
  };

  const renderContextInfo = () => {
    if (!selectedConversation?.context) return null;
    
    const { type, data } = selectedConversation.context;
    
    switch (type) {
      case 'event':
        return (
          <>
            <ContextTitle>{data?.eventTitle || 'Event'}</ContextTitle>
            <div>📅 {data?.eventDate ? new Date(data.eventDate).toLocaleDateString() : ''} • 📍 {data?.eventLocation || ''}</div>
          </>
        );
      case 'profile':
        return (
          <>
            <ContextTitle>{data?.userFullName || 'User Profile'}</ContextTitle>
            <div>🎯 {data?.userProfession || ''} • 📍 {data?.userLocation || ''}</div>
          </>
        );
      case 'community':
        return (
          <>
            <ContextTitle>{data?.communityName || 'Community'}</ContextTitle>
            <div>🏘️ Community Discussion</div>
          </>
        );
      default:
        return null;
    }
  };

  const getModalTitle = () => {
    if (!selectedConversation?.context) return 'Send Message';
    
    switch (selectedConversation.context.type) {
      case 'event':
        return 'Message Organizer';
      case 'profile':
        return 'Send Message';
      case 'community':
        return 'Community Message';
      default:
        return 'Send Message';
    }
  };

  const getTemplates = () => {
    if (!selectedConversation?.context) return [];
    
    const { type, data } = selectedConversation.context;
    const recipientName = selectedConversation.participantNames.find(name => name !== 'Current User') || '';
    
    switch (type) {
      case 'event':
        return [
          { 
            label: 'Ask for Details', 
            text: `Hi! I'm interested in joining "${data?.eventTitle}". Could you please provide more details?` 
          },
          { 
            label: 'Confirm Attendance', 
            text: `Hello! I'd like to confirm my attendance for "${data?.eventTitle}". What should I bring?` 
          },
          { 
            label: 'Check Availability', 
            text: `Hi! Is there still space available for "${data?.eventTitle}"? I'd love to join!` 
          },
          { 
            label: 'Ask Question', 
            text: `Hello! I have a question about the event logistics. Could we discuss?` 
          }
        ];
      case 'profile':
        return [
          { 
            label: 'Connect Request', 
            text: `Hi ${recipientName}! I noticed we have similar interests. Would you like to connect?` 
          },
          { 
            label: 'Service Inquiry', 
            text: `Hello! I'm interested in your ${data?.userProfession} services. Could we discuss?` 
          },
          { 
            label: 'Local Meetup', 
            text: `Hi! I see you're also in ${data?.userLocation}. Would you like to meet up for coffee?` 
          },
          { 
            label: 'Professional Chat', 
            text: `Hello! I'd love to learn more about your professional experience. Could we chat?` 
          }
        ];
      case 'community':
        return [
          { 
            label: 'Welcome', 
            text: `Hi everyone! Excited to be part of the ${data?.communityName} community!` 
          },
          { 
            label: 'Ask Question', 
            text: `Hello! I have a question about the community activities. Could someone help?` 
          },
          { 
            label: 'Share Resource', 
            text: `Hi! I found a great resource that might be helpful for our community.` 
          }
        ];
      default:
        return [];
    }
  };

  if (!selectedConversation) return null;

  const recipientName = selectedConversation.participantNames.find(name => name !== 'Current User') || 'Recipient';
  const templates = getTemplates();

  return (
    <MessagingModalOverlay isOpen={isMessagingModalOpen} onClick={closeMessagingModal}>
      <MessagingModalContent onClick={(e) => e.stopPropagation()}>
        <MessagingModalHeader>
          <MessagingModalTitle>{getModalTitle()}</MessagingModalTitle>
          <MessagingModalCloseButton onClick={closeMessagingModal}>
            ×
          </MessagingModalCloseButton>
        </MessagingModalHeader>
        
        {selectedConversation.context && (
          <ContextBar>
            {renderContextInfo()}
          </ContextBar>
        )}
        
        <MessagingBody>
          <RecipientInfo>
            <RecipientAvatar>
              {recipientName[0]?.toUpperCase() || 'R'}
            </RecipientAvatar>
            <RecipientDetails>
              <RecipientName>{recipientName}</RecipientName>
              <RecipientMeta>
                {selectedConversation.context?.type === 'event' ? 'Verified Event Organizer' :
                 selectedConversation.context?.type === 'community' ? 'Community Member' :
                 'Verified BerseMuka Member'}
              </RecipientMeta>
            </RecipientDetails>
          </RecipientInfo>
          
          <QuickActions>
            <QuickActionButton $variant="secondary">
              📞 Call
            </QuickActionButton>
            <QuickActionButton $variant="secondary">
              📧 Email
            </QuickActionButton>
            <QuickActionButton $variant="primary">
              💬 Message
            </QuickActionButton>
          </QuickActions>
          
          {templates.length > 0 && (
            <MessageTemplates>
              <TemplatesTitle>Quick Messages</TemplatesTitle>
              {templates.map((template, index) => (
                <TemplateButton 
                  key={index}
                  onClick={() => handleMessageTemplateClick(template.text)}
                >
                  {template.label}
                </TemplateButton>
              ))}
            </MessageTemplates>
          )}
          
          <MessageInput
            placeholder="Type your message here..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
          />
          
          <SendMessageButton 
            onClick={handleSendMessage}
            $disabled={!messageText.trim()}
          >
            Send Message 📩
          </SendMessageButton>
        </MessagingBody>
      </MessagingModalContent>
    </MessagingModalOverlay>
  );
};