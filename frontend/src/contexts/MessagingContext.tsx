import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Types for the messaging system
export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  recipientId: string;
  recipientName: string;
  content: string;
  timestamp: Date;
  type: 'direct' | 'group' | 'community';
  context?: {
    type: 'event' | 'service' | 'community' | 'profile';
    data?: any;
  };
  read: boolean;
}

export interface Conversation {
  id: string;
  type: 'direct' | 'group' | 'community';
  participantIds: string[];
  participantNames: string[];
  lastMessage?: Message;
  unreadCount: number;
  context?: {
    type: 'event' | 'service' | 'community' | 'profile';
    data?: any;
  };
}

export interface NotificationBadge {
  directMessages: number;
  groupMessages: number;
  communityMessages: number;
  total: number;
}

export interface MessagingContextType {
  // Conversations and messages
  conversations: Conversation[];
  messages: { [conversationId: string]: Message[] };
  
  // Notification badges
  notificationBadge: NotificationBadge;
  
  // Actions
  sendMessage: (
    recipientId: string,
    recipientName: string,
    content: string,
    context?: {
      type: 'event' | 'service' | 'community' | 'profile';
      data?: any;
    }
  ) => void;
  
  markAsRead: (conversationId: string) => void;
  getConversation: (participantId: string) => Conversation | undefined;
  getMessages: (conversationId: string) => Message[];
  
  // Modal state for unified messaging
  isMessagingModalOpen: boolean;
  selectedConversation: Conversation | null;
  openMessagingModal: (
    recipientId: string,
    recipientName: string,
    context?: {
      type: 'event' | 'service' | 'community' | 'profile';
      data?: any;
    }
  ) => void;
  closeMessagingModal: () => void;
}

const MessagingContext = createContext<MessagingContextType | undefined>(undefined);

// Mock data for initial conversations
const mockConversations: Conversation[] = [
  {
    id: 'conv-1',
    type: 'direct',
    participantIds: ['user-1', 'current-user'],
    participantNames: ['Ahmad Sumone', 'Current User'],
    unreadCount: 2,
    context: {
      type: 'event',
      data: { eventId: '1', eventTitle: 'Monday Meetups at Mesra Cafe KLCC' }
    }
  },
  {
    id: 'conv-2',
    type: 'direct',
    participantIds: ['user-2', 'current-user'],
    participantNames: ['Sukan Squad', 'Current User'],
    unreadCount: 1,
    context: {
      type: 'event',
      data: { eventId: '2', eventTitle: 'BerseMinton by Sukan Squad' }
    }
  },
  {
    id: 'conv-3',
    type: 'community',
    participantIds: ['community-1', 'current-user'],
    participantNames: ['UI/UX Designers Malaysia', 'Current User'],
    unreadCount: 5,
    context: {
      type: 'community',
      data: { communityId: 'community-1', communityName: 'UI/UX Designers Malaysia' }
    }
  }
];

const mockMessages: { [conversationId: string]: Message[] } = {
  'conv-1': [
    {
      id: 'msg-1',
      senderId: 'user-1',
      senderName: 'Ahmad Sumone',
      recipientId: 'current-user',
      recipientName: 'Current User',
      content: 'Hi! Thanks for your interest in the Monday Meetups. We have space available!',
      timestamp: new Date('2024-01-15T10:30:00'),
      type: 'direct',
      context: {
        type: 'event',
        data: { eventId: '1', eventTitle: 'Monday Meetups at Mesra Cafe KLCC' }
      },
      read: false
    },
    {
      id: 'msg-2',
      senderId: 'user-1',
      senderName: 'Ahmad Sumone',
      recipientId: 'current-user',
      recipientName: 'Current User',
      content: 'Just bring yourself and we\'ll provide coffee! Looking forward to meeting you.',
      timestamp: new Date('2024-01-15T10:32:00'),
      type: 'direct',
      context: {
        type: 'event',
        data: { eventId: '1', eventTitle: 'Monday Meetups at Mesra Cafe KLCC' }
      },
      read: false
    }
  ],
  'conv-2': [
    {
      id: 'msg-3',
      senderId: 'user-2',
      senderName: 'Sukan Squad',
      recipientId: 'current-user',
      recipientName: 'Current User',
      content: 'Welcome to BerseMinton! Please bring indoor shoes and we\'ll provide rackets.',
      timestamp: new Date('2024-01-15T14:20:00'),
      type: 'direct',
      context: {
        type: 'event',
        data: { eventId: '2', eventTitle: 'BerseMinton by Sukan Squad' }
      },
      read: false
    }
  ],
  'conv-3': [
    {
      id: 'msg-4',
      senderId: 'community-1',
      senderName: 'UI/UX Community',
      recipientId: 'current-user',
      recipientName: 'Current User',
      content: 'Welcome to our design community! We have a Figma workshop this weekend.',
      timestamp: new Date('2024-01-15T16:45:00'),
      type: 'community',
      context: {
        type: 'community',
        data: { communityId: 'community-1', communityName: 'UI/UX Designers Malaysia' }
      },
      read: false
    }
  ]
};

export const MessagingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [messages, setMessages] = useState<{ [conversationId: string]: Message[] }>(mockMessages);
  const [isMessagingModalOpen, setIsMessagingModalOpen] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

  // Calculate notification badges
  const notificationBadge: NotificationBadge = {
    directMessages: conversations
      .filter(c => c.type === 'direct')
      .reduce((sum, c) => sum + c.unreadCount, 0),
    groupMessages: conversations
      .filter(c => c.type === 'group')
      .reduce((sum, c) => sum + c.unreadCount, 0),
    communityMessages: conversations
      .filter(c => c.type === 'community')
      .reduce((sum, c) => sum + c.unreadCount, 0),
    total: conversations.reduce((sum, c) => sum + c.unreadCount, 0)
  };

  const sendMessage = (
    recipientId: string,
    recipientName: string,
    content: string,
    context?: {
      type: 'event' | 'service' | 'community' | 'profile';
      data?: any;
    }
  ) => {
    // Find or create conversation
    let conversation = conversations.find(c => 
      c.participantIds.includes(recipientId) && c.participantIds.includes('current-user')
    );

    if (!conversation) {
      // Create new conversation
      const newConversationId = `conv-${Date.now()}`;
      conversation = {
        id: newConversationId,
        type: context?.type === 'community' ? 'community' : 'direct',
        participantIds: [recipientId, 'current-user'],
        participantNames: [recipientName, 'Current User'],
        unreadCount: 0,
        context
      };
      setConversations(prev => [...prev, conversation!]);
    }

    // Create new message
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      senderId: 'current-user',
      senderName: 'Current User',
      recipientId,
      recipientName,
      content,
      timestamp: new Date(),
      type: conversation.type,
      context,
      read: true // Messages sent by current user are automatically read
    };

    // Add message to conversation
    setMessages(prev => ({
      ...prev,
      [conversation!.id]: [...(prev[conversation!.id] || []), newMessage]
    }));

    // Update conversation's last message
    setConversations(prev => prev.map(c => 
      c.id === conversation!.id 
        ? { ...c, lastMessage: newMessage }
        : c
    ));

    // Award points for engagement
    const currentPoints = parseInt(localStorage.getItem('user_points') || '245');
    const newPoints = currentPoints + 2;
    localStorage.setItem('user_points', newPoints.toString());

    console.log(`📨 Message sent to ${recipientName}: ${content}`);
    
    // Close modal after sending
    closeMessagingModal();
    
    // Show success feedback
    alert('Message sent successfully! +2 BerseMuka Points');
  };

  const markAsRead = (conversationId: string) => {
    // Mark all messages in conversation as read
    setMessages(prev => ({
      ...prev,
      [conversationId]: (prev[conversationId] || []).map(msg => ({
        ...msg,
        read: true
      }))
    }));

    // Reset unread count for conversation
    setConversations(prev => prev.map(c => 
      c.id === conversationId 
        ? { ...c, unreadCount: 0 }
        : c
    ));
  };

  const getConversation = (participantId: string): Conversation | undefined => {
    return conversations.find(c => 
      c.participantIds.includes(participantId) && c.participantIds.includes('current-user')
    );
  };

  const getMessages = (conversationId: string): Message[] => {
    return messages[conversationId] || [];
  };

  const openMessagingModal = (
    recipientId: string,
    recipientName: string,
    context?: {
      type: 'event' | 'service' | 'community' | 'profile';
      data?: any;
    }
  ) => {
    // Find or create conversation for modal
    let conversation = getConversation(recipientId);
    
    if (!conversation) {
      // Create temporary conversation for modal
      conversation = {
        id: `temp-${recipientId}`,
        type: context?.type === 'community' ? 'community' : 'direct',
        participantIds: [recipientId, 'current-user'],
        participantNames: [recipientName, 'Current User'],
        unreadCount: 0,
        context
      };
    }

    setSelectedConversation(conversation);
    setIsMessagingModalOpen(true);
  };

  const closeMessagingModal = () => {
    setIsMessagingModalOpen(false);
    setSelectedConversation(null);
  };

  const contextValue: MessagingContextType = {
    conversations,
    messages,
    notificationBadge,
    sendMessage,
    markAsRead,
    getConversation,
    getMessages,
    isMessagingModalOpen,
    selectedConversation,
    openMessagingModal,
    closeMessagingModal
  };

  return (
    <MessagingContext.Provider value={contextValue}>
      {children}
    </MessagingContext.Provider>
  );
};

export const useMessaging = (): MessagingContextType => {
  const context = useContext(MessagingContext);
  if (!context) {
    throw new Error('useMessaging must be used within a MessagingProvider');
  }
  return context;
};