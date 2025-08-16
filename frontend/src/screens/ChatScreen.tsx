import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { StatusBar } from '../components/StatusBar/StatusBar';
import { MainNav } from '../components/MainNav';
import { ProfileSidebar } from '../components/ProfileSidebar/ProfileSidebar';

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  timestamp: Date;
  isOwn: boolean;
}

interface Contact {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
}

export const ChatScreen: React.FC = () => {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const [showProfileSidebar, setShowProfileSidebar] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hey! Are you joining the heritage tour?',
      senderId: 'ahmad-hassan',
      senderName: 'Ahmad Hassan',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      isOwn: false
    },
    {
      id: '2',
      content: 'Yes, I\'m planning to join! What time does it start?',
      senderId: 'current-user',
      senderName: 'You',
      timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000), // 1.5 hours ago
      isOwn: true
    },
    {
      id: '3',
      content: 'It starts at 2 PM at the KLCC park entrance. We\'ll be exploring the historical sites around the area.',
      senderId: 'ahmad-hassan',
      senderName: 'Ahmad Hassan',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      isOwn: false
    },
    {
      id: '4',
      content: 'Perfect! I\'ll bring my camera. This will be great for the photography walk segment too.',
      senderId: 'current-user',
      senderName: 'You',
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      isOwn: true
    }
  ]);

  // Sample contact info
  const contacts: Record<string, Contact> = {
    'ahmad-hassan': {
      id: 'ahmad-hassan',
      name: 'Ahmad Hassan',
      avatar: 'AH',
      isOnline: true
    },
    'sarah-chen': {
      id: 'sarah-chen',
      name: 'Sarah Chen',
      avatar: 'SC',
      isOnline: false
    },
    'raj-kumar': {
      id: 'raj-kumar',
      name: 'Raj Kumar',
      avatar: 'RK',
      isOnline: true
    }
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const currentContact = userId ? contacts[userId] : null;

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (messageText.trim() && userId) {
      const newMessage: Message = {
        id: Date.now().toString(),
        content: messageText.trim(),
        senderId: 'current-user',
        senderName: 'You',
        timestamp: new Date(),
        isOwn: true
      };

      setMessages(prev => [...prev, newMessage]);
      setMessageText('');
      
      // Auto-resize textarea
      if (textareaRef.current) {
        textareaRef.current.style.height = '44px';
      }

      // Simulate response (in real app, this would come from WebSocket/API)
      setTimeout(() => {
        const responses = [
          "That's great to hear!",
          "Looking forward to meeting you there!",
          "See you then!",
          "Thanks for letting me know!",
          "Sounds like a plan!"
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        const responseMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: randomResponse,
          senderId: userId,
          senderName: currentContact?.name || 'Contact',
          timestamp: new Date(),
          isOwn: false
        };
        
        setMessages(prev => [...prev, responseMessage]);
      }, 1000 + Math.random() * 2000); // Random delay 1-3 seconds
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageText(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = '44px';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (!currentContact) {
    return (
      <Container>
        <StatusBar onProfileClick={() => setShowProfileSidebar(true)} />
        <Header>
          <BackButton onClick={() => navigate('/messages')}>←</BackButton>
          <HeaderTitle>Chat not found</HeaderTitle>
        </Header>
        <Content style={{ justifyContent: 'center', alignItems: 'center' }}>
          <div>Contact not found</div>
        </Content>
      </Container>
    );
  }

  return (
    <Container>
      <StatusBar onProfileClick={() => setShowProfileSidebar(true)} />
      
      <Header>
        <BackButton onClick={() => navigate('/messages')}>←</BackButton>
        <ContactInfo>
          <ContactAvatar>{currentContact.avatar}</ContactAvatar>
          <ContactDetails>
            <ContactName>{currentContact.name}</ContactName>
            <ContactStatus $isOnline={currentContact.isOnline}>
              {currentContact.isOnline ? 'Online' : 'Last seen recently'}
            </ContactStatus>
          </ContactDetails>
        </ContactInfo>
        <CallButton>📞</CallButton>
      </Header>

      <MessagesContainer>
        <MessagesList>
          {messages.map((message) => (
            <MessageBubble key={message.id} $isOwn={message.isOwn}>
              <MessageContent $isOwn={message.isOwn}>
                {message.content}
              </MessageContent>
              <MessageTimestamp $isOwn={message.isOwn}>
                {formatTime(message.timestamp)}
              </MessageTimestamp>
            </MessageBubble>
          ))}
          <div ref={messagesEndRef} />
        </MessagesList>
      </MessagesContainer>

      <InputContainer>
        <MessageInput
          ref={textareaRef}
          value={messageText}
          onChange={handleTextareaChange}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          rows={1}
        />
        <SendButton onClick={handleSendMessage} disabled={!messageText.trim()}>
          📤
        </SendButton>
      </InputContainer>

      <MainNav 
        activeTab="home"
        onTabPress={(tab) => {
          switch (tab) {
            case 'home': navigate('/dashboard'); break;
            case 'connect': navigate('/connect'); break;
            case 'match': navigate('/match'); break;
            case 'forum': navigate('/forum'); break;
          }
        }}
      />

      <ProfileSidebar 
        isOpen={showProfileSidebar}
        onClose={() => setShowProfileSidebar(false)}
      />
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #F9F3E3;
  max-width: 393px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 20px;
  background-color: white;
  border-bottom: 1px solid #E0E0E0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const BackButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  color: #2fce98;
  cursor: pointer;
  margin-right: 12px;
  padding: 4px;
  
  &:hover {
    transform: scale(1.1);
  }
`;

const ContactInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
`;

const ContactAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #2fce98;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 16px;
`;

const ContactDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const ContactName = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #2fce98;
  margin: 0;
`;

const ContactStatus = styled.span<{ $isOnline: boolean }>`
  font-size: 12px;
  color: ${props => props.$isOnline ? '#4CAF50' : '#999'};
  margin: 2px 0 0 0;
`;

const CallButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  
  &:hover {
    background: #F0F0F0;
  }
`;

const HeaderTitle = styled.h1`
  font-size: 18px;
  font-weight: bold;
  color: #2fce98;
  margin: 0;
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  background: linear-gradient(135deg, #F9F3E3 0%, #F5F3EF 100%);
`;

const MessagesList = styled.div`
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-bottom: 100px;
`;

const MessageBubble = styled.div<{ $isOwn: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: ${props => props.$isOwn ? 'flex-end' : 'flex-start'};
  max-width: 80%;
  align-self: ${props => props.$isOwn ? 'flex-end' : 'flex-start'};
`;

const MessageContent = styled.div<{ $isOwn: boolean }>`
  background: ${props => props.$isOwn ? '#2fce98' : 'white'};
  color: ${props => props.$isOwn ? 'white' : '#333'};
  padding: 12px 16px;
  border-radius: 18px;
  border-top-${props => props.$isOwn ? 'right' : 'left'}-radius: 6px;
  font-size: 14px;
  line-height: 1.4;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  word-wrap: break-word;
  white-space: pre-wrap;
`;

const MessageTimestamp = styled.span<{ $isOwn: boolean }>`
  font-size: 11px;
  color: #999;
  margin-top: 4px;
  margin-${props => props.$isOwn ? 'right' : 'left'}: 8px;
`;

const InputContainer = styled.div`
  display: flex;
  align-items: end;
  padding: 16px 20px;
  background: white;
  border-top: 1px solid #E0E0E0;
  gap: 12px;
  margin-bottom: 70px; /* Space for MainNav */
`;

const MessageInput = styled.textarea`
  flex: 1;
  min-height: 44px;
  max-height: 120px;
  padding: 12px 16px;
  border: 1px solid #E0E0E0;
  border-radius: 22px;
  font-size: 14px;
  font-family: inherit;
  resize: none;
  outline: none;
  background: #F8F9FA;
  
  &:focus {
    border-color: #2fce98;
    background: white;
  }
  
  &::placeholder {
    color: #999;
  }
`;

const SendButton = styled.button`
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 50%;
  background: ${props => props.disabled ? '#CCC' : '#2fce98'};
  color: white;
  font-size: 18px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    background: #1E4039;
    transform: scale(1.05);
  }
  
  &:active:not(:disabled) {
    transform: scale(0.95);
  }
`;

const Content = styled.div`
  flex: 1;
  display: flex;
  padding: 20px;
  padding-bottom: 100px;
`;