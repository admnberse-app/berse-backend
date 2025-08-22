import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { StatusBar } from '../components/StatusBar';
import { MainNav } from '../components/MainNav';
import { ProfileSidebar } from '../components/ProfileSidebar/ProfileSidebar';
import { useAuth } from '../contexts/AuthContext';

export const MessagesScreen: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [showProfileSidebar, setShowProfileSidebar] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      fetchMessages();
    }
  }, [isAuthenticated]);

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('bersemuka_token');
      if (!token) return;

      const response = await fetch(
        `${window.location.hostname === 'localhost' ? '' : 'https://api.berse.app'}/api/v1/messages/inbox`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setMessages(data.data.messages || []);
          setUnreadCount(data.data.unreadCount || 0);
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptFriendRequest = async (followerId: string) => {
    try {
      const token = localStorage.getItem('bersemuka_token');
      if (!token) return;

      const response = await fetch(
        `${window.location.hostname === 'localhost' ? '' : 'https://api.berse.app'}/api/v1/messages/accept-friend-request`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ followerId }),
        }
      );

      if (response.ok) {
        // Refresh messages
        fetchMessages();
        alert('Friend request accepted!');
      }
    } catch (error) {
      console.error('Error accepting friend request:', error);
    }
  };

  const handleDeclineFriendRequest = async (followerId: string) => {
    try {
      const token = localStorage.getItem('bersemuka_token');
      if (!token) return;

      const response = await fetch(
        `${window.location.hostname === 'localhost' ? '' : 'https://api.berse.app'}/api/v1/messages/decline-friend-request`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ followerId }),
        }
      );

      if (response.ok) {
        // Refresh messages
        fetchMessages();
        alert('Friend request declined');
      }
    } catch (error) {
      console.error('Error declining friend request:', error);
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      const token = localStorage.getItem('bersemuka_token');
      if (!token) return;

      await fetch(
        `${window.location.hostname === 'localhost' ? '' : 'https://api.berse.app'}/api/v1/messages/${messageId}/read`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  return (
    <Container>
      <StatusBar onProfileClick={() => setShowProfileSidebar(true)} />
      
      <Header>
        <BackButton onClick={() => navigate('/dashboard')}>←</BackButton>
        <HeaderTitle>
          💬 Private Messages 
          {unreadCount > 0 && <UnreadBadge>{unreadCount}</UnreadBadge>}
        </HeaderTitle>
      </Header>

      <Content>
        <MessagesList>
          {loading ? (
            <LoadingState>Loading messages...</LoadingState>
          ) : messages.length > 0 ? (
            messages.map((message) => (
              <MessageCard key={message.id} $unread={!message.isRead}>
                <MessageHeader>
                  <SenderInfo>
                    <SenderAvatar>
                      {message.sender?.profilePicture ? (
                        <img src={message.sender.profilePicture} alt="" />
                      ) : (
                        <DefaultAvatar>
                          {(message.sender?.fullName || message.sender?.username || 'U')[0].toUpperCase()}
                        </DefaultAvatar>
                      )}
                    </SenderAvatar>
                    <SenderDetails>
                      <SenderName>
                        {message.sender?.fullName || message.sender?.username || 'Unknown'}
                      </SenderName>
                      <MessageTimestamp>
                        {new Date(message.createdAt).toLocaleDateString()}
                      </MessageTimestamp>
                    </SenderDetails>
                  </SenderInfo>
                  {!message.isRead && <UnreadDot />}
                </MessageHeader>
                
                <MessageContent 
                  onClick={() => !message.isRead && markAsRead(message.id)}
                >
                  {message.content}
                </MessageContent>
                
                {message.content.includes('friend request') && (
                  <MessageActions>
                    <AcceptButton 
                      onClick={() => handleAcceptFriendRequest(message.senderId)}
                    >
                      ✓ Accept
                    </AcceptButton>
                    <DeclineButton 
                      onClick={() => handleDeclineFriendRequest(message.senderId)}
                    >
                      ✗ Decline
                    </DeclineButton>
                  </MessageActions>
                )}
              </MessageCard>
            ))
          ) : (
            <EmptyState>
              <EmptyStateIcon>💬</EmptyStateIcon>
              <EmptyStateTitle>No Messages Yet</EmptyStateTitle>
              <EmptyStateText>
                Connect with community members from events, matches, or the forum to start chatting!
              </EmptyStateText>
            </EmptyState>
          )}
        </MessagesList>
      </Content>

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

// Styled components for MessagesScreen
const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #F9F3E3;
  max-width: 393px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  padding: 16px 20px;
  background-color: #F5F3EF;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  color: #2fce98;
  cursor: pointer;
  margin-right: 12px;
  
  &:hover {
    transform: scale(1.1);
  }
`;

const HeaderTitle = styled.h1`
  font-size: 20px;
  font-weight: bold;
  color: #2fce98;
  margin: 0;
`;

const Content = styled.div`
  flex: 1;
  padding: 20px;
  padding-bottom: 100px; /* Added extra space for floating nav */
`;

const MessagesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const MessageItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #F8F9FA;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const MessageAvatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #2fce98;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 16px;
  box-shadow: 0 2px 6px rgba(45, 95, 79, 0.3);
`;

const MessageInfo = styled.div`
  flex: 1;
`;

const MessageName = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 4px 0;
`;

const MessagePreview = styled.p`
  font-size: 14px;
  color: #666;
  margin: 0 0 4px 0;
  line-height: 1.4;
`;

const MessageTime = styled.span`
  font-size: 12px;
  color: #999;
`;

const UnreadBadge = styled.span`
  background: #E74C3C;
  color: white;
  padding: 4px 8px;
  border-radius: 50%;
  font-size: 12px;
  font-weight: bold;
  min-width: 20px;
  text-align: center;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 40px 20px;
  margin-top: 20px;
`;

const EmptyStateIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.6;
`;

const EmptyStateTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #2fce98;
  margin: 0 0 8px 0;
`;

const EmptyStateText = styled.p`
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  margin: 0;
  max-width: 280px;
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #666;
  font-size: 14px;
`;

const MessageCard = styled.div<{ $unread?: boolean }>`
  background: ${props => props.$unread ? '#ffffff' : '#f9f9f9'};
  border: 1px solid ${props => props.$unread ? '#2fce98' : '#e0e0e0'};
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const MessageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

const SenderInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const SenderAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const DefaultAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #2fce98, #4A90A4);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 18px;
`;

const SenderDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const SenderName = styled.div`
  font-weight: 600;
  color: #333;
  font-size: 14px;
`;

const MessageTimestamp = styled.div`
  font-size: 12px;
  color: #999;
  margin-top: 2px;
`;

const UnreadDot = styled.div`
  width: 8px;
  height: 8px;
  background: #2fce98;
  border-radius: 50%;
`;

const MessageContent = styled.div`
  color: #666;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 12px;
`;

const MessageActions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;
`;

const AcceptButton = styled.button`
  flex: 1;
  padding: 8px 16px;
  background: #2fce98;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: #26b584;
  }
`;

const DeclineButton = styled.button`
  flex: 1;
  padding: 8px 16px;
  background: #f5f5f5;
  color: #666;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #e0e0e0;
  }
`;