import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { StatusBar } from '../components/StatusBar/StatusBar';
import { BottomNav } from '../components/BottomNav';
import { userProfiles, getProfileById, UserProfile } from '../data/profiles';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.background.default};
  max-width: 393px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background-color: ${({ theme }) => theme.colors.background.default};
  border-bottom: 1px solid #f0f0f0;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary.main}, ${({ theme }) => theme.colors.deepGreen.secondary});
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 14px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const HeaderText = styled.div`
  h3 {
    margin: 0;
    font-size: 12px;
    color: ${({ theme }) => theme.colors.text.secondary};
    font-weight: normal;
  }
  h2 {
    margin: 0;
    font-size: 18px;
    color: ${({ theme }) => theme.colors.primary.main};
    font-weight: bold;
  }
`;

const NotificationBell = styled.div`
  position: relative;
  width: 32px;
  height: 32px;
  cursor: pointer;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  
  &::before {
    content: '🔔';
    font-size: 18px;
  }
  
  &::after {
    content: '2';
    position: absolute;
    top: -2px;
    right: -2px;
    width: 18px;
    height: 18px;
    background: #FF6B6B;
    color: white;
    border-radius: 50%;
    font-size: 10px;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid white;
  }
`;

const Content = styled.div`
  flex: 1;
  padding: 0 0 80px 0;
  overflow-y: auto;
`;

// Filter Section - Matching BerseConnect Design
const FilterSection = styled.div`
  padding: 16px 20px 12px 20px;
  border-bottom: 1px solid #f0f0f0;
`;

const FilterRow = styled.div`
  display: flex;
  gap: 12px;
`;

const FilterButton = styled.button<{ hasFilter?: boolean }>`
  flex: 1;
  padding: 12px 16px;
  border: 1px solid ${({ hasFilter }) => hasFilter ? '#2D5F4F' : '#E5E5E5'};
  border-radius: 8px;
  background: ${({ hasFilter }) => hasFilter ? '#F0F8F5' : 'white'};
  color: ${({ hasFilter }) => hasFilter ? '#2D5F4F' : '#333'};
  font-size: 14px;
  font-weight: ${({ hasFilter }) => hasFilter ? '600' : '400'};
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  &:hover {
    border-color: #2D5F4F;
    background-color: #F0F8F5;
  }
`;

const FilterIcon = styled.span`
  font-size: 12px;
  color: #666;
`;

// Filter Modals - Matching BerseMatch Style
const FilterModal = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: ${({ isOpen }) => isOpen ? 'flex' : 'none'};
  align-items: flex-end;
  justify-content: center;
  z-index: 1000;
`;

const FilterModalContent = styled.div`
  background: white;
  border-radius: 20px 20px 0 0;
  padding: 24px;
  width: 100%;
  max-width: 393px;
  max-height: 60vh;
  overflow-y: auto;
`;

const FilterModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const FilterModalTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
`;

const FilterModalClose = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  
  &:hover {
    background-color: #f0f0f0;
  }
`;

const FilterOption = styled.div<{ selected?: boolean }>`
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  
  &:hover {
    background-color: #f8f9fa;
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const FilterCheckbox = styled.div<{ checked?: boolean }>`
  width: 20px;
  height: 20px;
  border: 2px solid ${({ checked }) => checked ? '#2D5F4F' : '#ddd'};
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ checked }) => checked ? '#2D5F4F' : 'white'};
  
  &::after {
    content: '✓';
    color: white;
    font-size: 12px;
    display: ${({ checked }) => checked ? 'block' : 'none'};
  }
`;

const FilterOptionText = styled.span`
  flex: 1;
  font-size: 14px;
  color: #333;
`;

const FilterActions = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
`;

const FilterActionButton = styled.button<{ primary?: boolean }>`
  flex: 1;
  padding: 12px;
  border: ${({ primary }) => primary ? 'none' : '1px solid #ddd'};
  border-radius: 8px;
  background: ${({ primary }) => primary ? '#2D5F4F' : 'white'};
  color: ${({ primary }) => primary ? 'white' : '#333'};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    opacity: 0.9;
  }
`;

// Improved Share Button
const ShareSection = styled.div`
  padding: 8px 20px 16px 20px;
  border-bottom: 8px solid #f8f9fa;
`;

const CreatePostButton = styled.button`
  width: 100%;
  background: white;
  color: ${({ theme }) => theme.colors.primary.main};
  border: 1px solid #e0e0e0;
  border-radius: 24px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 15px;
  font-weight: 400;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f8f9fa;
    border-color: ${({ theme }) => theme.colors.primary.main};
  }
`;

const MessageIcon = styled.div`
  width: 20px;
  height: 20px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

// Twitter-style Flat Message Layout
const PostsContainer = styled.div`
  background: white;
`;

const PostItem = styled.div`
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.1s ease;
  
  &:hover {
    background-color: #fafafa;
  }
`;

const PostLayout = styled.div`
  display: flex;
  gap: 12px;
`;

const PostAvatar = styled.div<{ bgColor?: string; onClick?: () => void }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${({ bgColor }) => bgColor || 'linear-gradient(135deg, #4A90A4, #6BB6FF)'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
  font-weight: bold;
  flex-shrink: 0;
  cursor: ${({ onClick }) => onClick ? 'pointer' : 'default'};
  transition: opacity 0.2s ease;
  
  &:hover {
    opacity: ${({ onClick }) => onClick ? '0.8' : '1'};
  }
`;

const PostContent = styled.div`
  flex: 1;
  min-width: 0;
`;

// Compact Header Line
const PostHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
  flex-wrap: wrap;
`;

const AuthorName = styled.span<{ onClick?: () => void }>`
  font-weight: 600;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: ${({ onClick }) => onClick ? 'pointer' : 'default'};
  
  &:hover {
    text-decoration: ${({ onClick }) => onClick ? 'underline' : 'none'};
  }
`;

const VerifiedBadge = styled.span`
  color: #1d9bf0;
  font-size: 12px;
`;

const LocationText = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const TimeText = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const Separator = styled.span`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 12px;
`;

// Inline Tags and Badges
const TagsLine = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
  flex-wrap: wrap;
`;

const CategoryBadge = styled.span`
  background: ${({ theme }) => theme.colors.primary.main};
  color: white;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 600;
`;

const InlineTag = styled.span<{ type: 'location' | 'interest' | 'general' }>`
  background: ${({ type }) => 
    type === 'location' ? '#FFF3E0' : 
    type === 'interest' ? '#E8F5E8' : '#F3E5F5'
  };
  color: ${({ type }) => 
    type === 'location' ? '#F57C00' : 
    type === 'interest' ? '#2E7D32' : '#7B1FA2'
  };
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 500;
`;

const FeaturedBadge = styled.span`
  background: linear-gradient(45deg, #FF6B6B, #FFE66D);
  color: white;
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 600;
`;

// Compact Message Text
const MessageText = styled.div`
  font-size: 14px;
  line-height: 1.4;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 8px;
  word-wrap: break-word;
`;

const MessageTitle = styled.div`
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 2px;
  color: ${({ theme }) => theme.colors.text.primary};
`;

// Compact Action Buttons
const ActionsLine = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  margin-top: 4px;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 12px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 16px;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f0f0f0;
    color: ${({ theme }) => theme.colors.primary.main};
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

// Reply Components
const RepliesSection = styled.div<{ expanded: boolean }>`
  border-top: 1px solid #f0f0f0;
  margin-top: 8px;
  padding-top: ${({ expanded }) => expanded ? '12px' : '0'};
  max-height: ${({ expanded }) => expanded ? '1000px' : '0'};
  overflow: hidden;
  transition: all 0.3s ease;
`;

const ReplyItem = styled.div`
  padding: 8px 0;
  border-bottom: 1px solid #f8f9fa;
  
  &:last-child {
    border-bottom: none;
  }
`;

const ReplyLayout = styled.div`
  display: flex;
  gap: 8px;
`;

const ReplyAvatar = styled.div<{ bgColor?: string }>`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: ${({ bgColor }) => bgColor || 'linear-gradient(135deg, #4A90A4, #6BB6FF)'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 11px;
  font-weight: bold;
  flex-shrink: 0;
  cursor: pointer;
  
  &:hover {
    opacity: 0.8;
  }
`;

const ReplyContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const ReplyHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 2px;
`;

const ReplyAuthor = styled.span`
  font-weight: 600;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
  
  &:hover {
    text-decoration: underline;
  }
`;

const ReplyVerifiedBadge = styled.span`
  color: #1d9bf0;
  font-size: 10px;
`;

const ReplyTime = styled.span`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const ReplyText = styled.div`
  font-size: 13px;
  line-height: 1.3;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 4px;
`;

const ReplyActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ReplyActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 2px;
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 11px;
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 12px;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f0f0f0;
    color: ${({ theme }) => theme.colors.primary.main};
  }
`;

const ShowRepliesButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.primary.main};
  font-size: 12px;
  cursor: pointer;
  padding: 4px 0;
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
  
  &:hover {
    text-decoration: underline;
  }
`;

const ReplyInputSection = styled.div<{ visible: boolean }>`
  display: ${({ visible }) => visible ? 'block' : 'none'};
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #f0f0f0;
`;

const ReplyInput = styled.div`
  display: flex;
  gap: 8px;
  align-items: flex-start;
`;

const ReplyTextarea = styled.textarea`
  flex: 1;
  border: 1px solid #e0e0e0;
  border-radius: 16px;
  padding: 8px 12px;
  font-size: 13px;
  resize: none;
  outline: none;
  font-family: inherit;
  min-height: 32px;
  max-height: 100px;
  
  &:focus {
    border-color: ${({ theme }) => theme.colors.primary.main};
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.text.secondary};
  }
`;

const ReplySubmitButton = styled.button`
  background: ${({ theme }) => theme.colors.primary.main};
  color: white;
  border: none;
  border-radius: 16px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s ease;
  
  &:hover {
    opacity: 0.9;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

interface Reply {
  id: string;
  content: string;
  authorId: string;
  likes: number;
  createdAt: string;
}

interface ForumPost {
  id: string;
  title: string;
  content: string;
  authorId: string;
  category: string;
  tags: Array<{ text: string; type: 'location' | 'interest' | 'general' }>;
  likes: number;
  replies: Reply[];
  replyCount: number;
  isRecommended: boolean;
  createdAt: string;
}

const locationOptions = [
  'Damansara',
  'Shah Alam', 
  'Johor Bharu',
  'KL City Centre',
  'Penang',
  'Other'
];

const topicOptions = [
  'Questions',
  'Recommendations',
  'Events',
  'Introductions',
  'Service Offerings',
  'Help and Support',
  'Travel',
  'Places to Visit'
];

export const ForumScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({});
  const [showingReplyInput, setShowingReplyInput] = useState<Record<string, boolean>>({});
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [likedReplies, setLikedReplies] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadForumPosts();
  }, []);

  const loadForumPosts = async () => {
    setIsLoading(true);
    try {
      const realPosts: ForumPost[] = [
        {
          id: '1',
          title: 'Greetings from Bosnia and Herzegovina! 🇧🇦',
          content: 'Selam alejkum 😊 My name is Amina and I am from Bosnia and Herzegovina. I am an architect and photographer and I enjoy exploring architecture and traditions of different nations. If anyone ever considers visiting our beautiful country, feel free to contact me for some useful info, hidden gems in Sarajevo or even a sweet coffee and a meet up 😊',
          authorId: '1',
          category: 'Introductions',
          tags: [
            { text: 'Architecture', type: 'interest' },
            { text: 'Photography', type: 'interest' }
          ],
          likes: 24,
          replyCount: 8,
          replies: [
            {
              id: 'r1',
              content: 'Mashallah sister! Bosnia is such a beautiful country. I would love to visit Sarajevo someday.',
              authorId: '12',
              likes: 5,
              createdAt: '2025-01-29T11:00:00Z'
            },
            {
              id: 'r2',
              content: 'I have been to Mostar and it was incredible! The bridge is breathtaking.',
              authorId: '3',
              likes: 3,
              createdAt: '2025-01-29T11:30:00Z'
            },
            {
              id: 'r3',
              content: 'Architecture in the Balkans is fascinating! Would love to connect and share some photography tips.',
              authorId: '2',
              likes: 7,
              createdAt: '2025-01-29T12:15:00Z'
            },
            {
              id: 'r4',
              content: 'As an architect myself, I\'d love to learn about traditional Bosnian architecture!',
              authorId: '8',
              likes: 4,
              createdAt: '2025-01-29T13:45:00Z'
            }
          ],
          isRecommended: true,
          createdAt: '2025-01-29T10:30:00Z'
        },
        {
          id: '2',
          title: 'Indonesian in Istanbul - Looking for Fellow Muslims! 🕌',
          content: 'Salam everyone, Hafiz here, Indonesian based in Istanbul. I do photography, videography, and social media gig as a freelance right now. Feel free to let me know if anyone of you visit Istanbul, I would be happy to take you around this amazing city!',
          authorId: '2',
          category: 'Travel',
          tags: [
            { text: 'Photography', type: 'interest' },
            { text: 'Business', type: 'interest' }
          ],
          likes: 18,
          replyCount: 12,
          replies: [
            {
              id: 'r5',
              content: 'Brother, I am planning to visit Istanbul next month! Would love to connect.',
              authorId: '10',
              likes: 8,
              createdAt: '2025-01-29T08:45:00Z'
            },
            {
              id: 'r6',
              content: 'Istanbul is amazing! The food, the culture, the history. You\'re lucky to live there!',
              authorId: '6',
              likes: 6,
              createdAt: '2025-01-29T09:20:00Z'
            },
            {
              id: 'r7',
              content: 'Subhanallah, I\'ve always wanted to visit the Blue Mosque and Hagia Sophia!',
              authorId: '7',
              likes: 9,
              createdAt: '2025-01-29T10:10:00Z'
            }
          ],
          isRecommended: false,
          createdAt: '2025-01-29T08:15:00Z'
        },
        {
          id: '3',
          title: 'Welcome to Geneva! 🇨🇭',
          content: 'Salaam Everyone! Marwan here, Moroccan civil engineer based in Geneva. My wife Joanna is Chinese/Vietnamese and we have 2 boys and 1 girl. Happy to host you here in Geneva, Switzerland!',
          authorId: '3',
          category: 'Introductions',
          tags: [
            { text: 'Family', type: 'general' },
            { text: 'Engineering', type: 'interest' }
          ],
          likes: 15,
          replyCount: 6,
          replies: [
            {
              id: 'r8',
              content: 'Barakallahu feek brother! Switzerland sounds amazing.',
              authorId: '4',
              likes: 7,
              createdAt: '2025-01-28T17:00:00Z'
            },
            {
              id: 'r9',
              content: 'MashaAllah, multicultural families are beautiful! Geneva must be wonderful for raising kids.',
              authorId: '11',
              likes: 12,
              createdAt: '2025-01-28T18:30:00Z'
            }
          ],
          isRecommended: false,
          createdAt: '2025-01-28T16:45:00Z'
        },
        {
          id: '4',
          title: 'Malaysian in Yemen - Your Tarim Guide! 🇾🇪',
          content: 'Assalamualaikum guys! I am Ali Seggaf from Malaysia, currently studying in Tarim, Yemen. If you are ever planning to visit Tarim, hit me up....I can be your tour guide and show you around! 🤗',
          authorId: '4',
          category: 'Service Offerings',
          tags: [
            { text: 'Guide', type: 'general' }
          ],
          likes: 22,
          replyCount: 5,
          replies: [
            {
              id: 'r10',
              content: 'MashaAllah brother! Tarim is such a blessed place. The scholars there are incredible.',
              authorId: '12',
              likes: 8,
              createdAt: '2025-01-27T15:00:00Z'
            },
            {
              id: 'r11',
              content: 'I\'ve always wanted to visit Dar al-Mustafa! Is it possible to arrange visits?',
              authorId: '7',
              likes: 6,
              createdAt: '2025-01-27T16:20:00Z'
            }
          ],
          isRecommended: true,
          createdAt: '2025-01-27T14:20:00Z'
        },
        {
          id: '5',
          title: 'Looking for good halal restaurants in KL',
          content: 'Hey everyone! Just moved to Kuala Lumpur and looking for authentic halal restaurants. Any recommendations for good Malaysian food? Preferably around KLCC area. JazakAllahu khair!',
          authorId: '5',
          category: 'Questions',
          tags: [
            { text: 'Food', type: 'interest' },
            { text: 'Halal', type: 'general' }
          ],
          likes: 8,
          replyCount: 15,
          replies: [
            {
              id: 'r12',
              content: 'Try Suria KLCC food court! Lots of halal options and great Malaysian food.',
              authorId: '1',
              likes: 12,
              createdAt: '2025-01-29T12:45:00Z'
            },
            {
              id: 'r13',
              content: 'For authentic Malay food, try Village Park Restaurant. Their nasi lemak is legendary!',
              authorId: '4',
              likes: 15,
              createdAt: '2025-01-29T13:20:00Z'
            },
            {
              id: 'r14',
              content: 'Atmosphere 360 at KL Tower has halal fine dining with amazing city views!',
              authorId: '9',
              likes: 8,
              createdAt: '2025-01-29T14:00:00Z'
            },
            {
              id: 'r15',
              content: 'Don\'t miss Jalan Alor for street food! Most stalls are halal.',
              authorId: '6',
              likes: 10,
              createdAt: '2025-01-29T14:30:00Z'
            }
          ],
          isRecommended: false,
          createdAt: '2025-01-29T12:20:00Z'
        },
        {
          id: '6',
          title: 'Data Analyst from Turkey visiting Malaysia! 🇹🇷',
          content: 'Hey everyone, I am Beyza from Turkey. I work in Istanbul as a data analyst. I have visited Malaysia last year and had wonderful time thanks to its lovely people. Feel free to connect with me if you guys ever come to Turkey! 🙏🏽',
          authorId: '6',
          category: 'Travel',
          tags: [
            { text: 'Data Analysis', type: 'interest' }
          ],
          likes: 12,
          replyCount: 7,
          replies: [
            {
              id: 'r16',
              content: 'Welcome back sister! Turkey is on my travel bucket list. Istanbul looks incredible!',
              authorId: '7',
              likes: 5,
              createdAt: '2025-01-27T17:00:00Z'
            },
            {
              id: 'r17',
              content: 'As a fellow data analyst, would love to connect! The tech scene in Istanbul must be exciting.',
              authorId: '8',
              likes: 7,
              createdAt: '2025-01-27T18:15:00Z'
            }
          ],
          isRecommended: false,
          createdAt: '2025-01-27T16:20:00Z'
        },
        {
          id: '7',
          title: 'Medical Student seeking study group for USMLE',
          content: 'Assalamu alaikum everyone! I\'m Fatima, a medical student in Cairo preparing for USMLE. Looking for other Muslim medical students to form a virtual study group. We can support each other through this challenging journey!',
          authorId: '7',
          category: 'Help and Support',
          tags: [
            { text: 'Medicine', type: 'interest' },
            { text: 'USMLE', type: 'general' },
            { text: 'Study Group', type: 'general' }
          ],
          likes: 16,
          replyCount: 9,
          replies: [
            {
              id: 'r18',
              content: 'Sister, I\'m also preparing for USMLE! Would love to join your study group.',
              authorId: '11',
              likes: 8,
              createdAt: '2025-01-30T09:00:00Z'
            },
            {
              id: 'r19',
              content: 'Not medical, but I can help with study techniques and time management!',
              authorId: '9',
              likes: 4,
              createdAt: '2025-01-30T10:30:00Z'
            }
          ],
          isRecommended: false,
          createdAt: '2025-01-30T08:00:00Z'
        },
        {
          id: '8',
          title: 'Islamic Finance Workshop in Dubai - Who\'s interested?',
          content: 'Assalamu alaikum! I\'m organizing an Islamic finance workshop in Dubai next month. We\'ll cover Sharia-compliant investments, sukuk, and fintech innovations. Perfect for professionals and students. Who would be interested in joining?',
          authorId: '8',
          category: 'Events',
          tags: [
            { text: 'Islamic Finance', type: 'interest' },
            { text: 'Workshop', type: 'general' },
            { text: 'Dubai', type: 'location' }
          ],
          likes: 28,
          replyCount: 14,
          replies: [
            {
              id: 'r20',
              content: 'This sounds amazing! I\'m very interested in Islamic finance principles.',
              authorId: '9',
              likes: 6,
              createdAt: '2025-01-29T15:00:00Z'
            },
            {
              id: 'r21',
              content: 'Brother Ahmed, count me in! I\'ve been wanting to learn more about sukuk.',
              authorId: '3',
              likes: 8,
              createdAt: '2025-01-29T16:30:00Z'
            },
            {
              id: 'r22',
              content: 'Will this be suitable for beginners? I\'m new to Islamic finance.',
              authorId: '5',
              likes: 5,
              createdAt: '2025-01-29T17:15:00Z'
            }
          ],
          isRecommended: true,
          createdAt: '2025-01-29T14:00:00Z'
        },
        {
          id: '9',
          title: 'Modest Fashion Brand - Looking for feedback!',
          content: 'Assalamu alaikum sisters! I\'m Zara, founder of Modest Threads in London. We create sustainable modest fashion for Muslim women. I\'d love your feedback on our new collection and hear what styles you\'d like to see!',
          authorId: '9',
          category: 'Service Offerings',
          tags: [
            { text: 'Fashion', type: 'interest' },
            { text: 'Business', type: 'interest' },
            { text: 'Sustainability', type: 'general' }
          ],
          likes: 19,
          replyCount: 11,
          replies: [
            {
              id: 'r23',
              content: 'Sister Zara! I love what you\'re doing. Sustainable modest fashion is so needed!',
              authorId: '7',
              likes: 9,
              createdAt: '2025-01-28T10:00:00Z'
            },
            {
              id: 'r24',
              content: 'Do you ship internationally? I\'d love to support your business!',
              authorId: '11',
              likes: 6,
              createdAt: '2025-01-28T11:30:00Z'
            },
            {
              id: 'r25',
              content: 'As a fellow entrepreneur, I admire your mission. Keep up the great work!',
              authorId: '8',
              likes: 7,
              createdAt: '2025-01-28T12:45:00Z'
            }
          ],
          isRecommended: false,
          createdAt: '2025-01-28T09:30:00Z'
        },
        {
          id: '10',
          title: 'West African Cuisine Cooking Class in Paris',
          content: 'Bonjour and Assalamu alaikum! I\'m Ibrahim, chef at Teranga Restaurant in Paris. I\'m offering halal West African cooking classes on weekends. Learn to make thieboudienne, yassa, and more traditional dishes! Perfect for food enthusiasts.',
          authorId: '10',
          category: 'Events',
          tags: [
            { text: 'Cooking', type: 'interest' },
            { text: 'West African', type: 'location' },
            { text: 'Paris', type: 'location' }
          ],
          likes: 23,
          replyCount: 8,
          replies: [
            {
              id: 'r26',
              content: 'This sounds incredible! I love Senegalese food. When do classes start?',
              authorId: '6',
              likes: 7,
              createdAt: '2025-01-26T14:00:00Z'
            },
            {
              id: 'r27',
              content: 'Chef Ibrahim, I visited your restaurant last month. The food was exceptional!',
              authorId: '1',
              likes: 5,
              createdAt: '2025-01-26T15:30:00Z'
            }
          ],
          isRecommended: true,
          createdAt: '2025-01-26T13:00:00Z'
        }
      ];

      setPosts(realPosts);
    } catch (error) {
      console.error('Failed to load forum posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = (postId: string) => {
    const isLiked = likedPosts.has(postId);
    
    if (isLiked) {
      setLikedPosts(prev => {
        const newSet = new Set(prev);
        newSet.delete(postId);
        return newSet;
      });
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, likes: Math.max(0, post.likes - 1) }
          : post
      ));
    } else {
      setLikedPosts(prev => new Set(prev).add(postId));
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, likes: post.likes + 1 }
          : post
      ));
    }
  };

  const handleReplyLike = (postId: string, replyId: string) => {
    const replyKey = `${postId}-${replyId}`;
    const isLiked = likedReplies.has(replyKey);
    
    if (isLiked) {
      setLikedReplies(prev => {
        const newSet = new Set(prev);
        newSet.delete(replyKey);
        return newSet;
      });
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? {
              ...post,
              replies: post.replies.map(reply =>
                reply.id === replyId
                  ? { ...reply, likes: Math.max(0, reply.likes - 1) }
                  : reply
              )
            }
          : post
      ));
    } else {
      setLikedReplies(prev => new Set(prev).add(replyKey));
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? {
              ...post,
              replies: post.replies.map(reply =>
                reply.id === replyId
                  ? { ...reply, likes: reply.likes + 1 }
                  : reply
              )
            }
          : post
      ));
    }
  };

  const handleProfileClick = (authorId: string) => {
    const profile = getProfileById(authorId);
    if (profile) {
      // Navigate to BerseMatch with the selected profile
      navigate('/match', { state: { selectedProfile: profile } });
    }
  };

  const toggleReplies = (postId: string) => {
    setExpandedReplies(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const toggleReplyInput = (postId: string) => {
    setShowingReplyInput(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const handleReplyTextChange = (postId: string, text: string) => {
    setReplyTexts(prev => ({
      ...prev,
      [postId]: text
    }));
  };

  const handleSubmitReply = (postId: string) => {
    const replyText = replyTexts[postId]?.trim();
    if (!replyText || !user) return;

    const newReply: Reply = {
      id: `r${Date.now()}`,
      content: replyText,
      authorId: user.id || '1', // Use current user's ID
      likes: 0,
      createdAt: new Date().toISOString()
    };

    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            replies: [...post.replies, newReply],
            replyCount: post.replyCount + 1
          }
        : post
    ));

    // Clear the reply input
    setReplyTexts(prev => ({
      ...prev,
      [postId]: ''
    }));

    // Hide the reply input
    setShowingReplyInput(prev => ({
      ...prev,
      [postId]: false
    }));
  };

  // Filter Functions
  const handleLocationToggle = (location: string) => {
    setSelectedLocations(prev => {
      if (prev.includes(location)) {
        return prev.filter(l => l !== location);
      } else {
        return [...prev, location];
      }
    });
  };

  const handleTopicToggle = (topic: string) => {
    setSelectedTopics(prev => {
      if (prev.includes(topic)) {
        return prev.filter(t => t !== topic);
      } else {
        return [...prev, topic];
      }
    });
  };

  const clearAllFilters = () => {
    setSelectedLocations([]);
    setSelectedTopics([]);
  };

  const applyLocationFilters = () => {
    setShowLocationModal(false);
  };

  const applyTopicFilters = () => {
    setShowTopicModal(false);
  };

  // Share Function
  const handleShare = (post: ForumPost) => {
    const author = getProfileById(post.authorId);
    const shareText = `Check out this post by ${author?.fullName}: "${post.title}"`;
    
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: shareText,
        url: window.location.href
      });
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(`${shareText}\n\n${window.location.href}`);
      alert('Post link copied to clipboard!');
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'now';
    if (diffInHours < 24) return `${diffInHours}h`;
    return `${Math.floor(diffInHours / 24)}d`;
  };

  // Apply filters to posts
  const filteredPosts = posts.filter(post => {
    const author = getProfileById(post.authorId);
    
    // Location filter
    if (selectedLocations.length > 0) {
      const matchesLocation = selectedLocations.some(location => 
        author?.location.toLowerCase().includes(location.toLowerCase()) ||
        author?.country.toLowerCase().includes(location.toLowerCase()) ||
        post.tags.some(tag => 
          tag.type === 'location' && 
          tag.text.toLowerCase().includes(location.toLowerCase())
        )
      );
      if (!matchesLocation) return false;
    }
    
    // Topic filter
    if (selectedTopics.length > 0) {
      const matchesTopic = selectedTopics.some(topic => 
        post.category.toLowerCase().includes(topic.toLowerCase()) ||
        post.tags.some(tag => tag.text.toLowerCase().includes(topic.toLowerCase())) ||
        post.title.toLowerCase().includes(topic.toLowerCase()) ||
        post.content.toLowerCase().includes(topic.toLowerCase())
      );
      if (!matchesTopic) return false;
    }
    
    return true;
  });

  return (
    <Container>
      <StatusBar />
      
      {/* Standardized Header */}
      <div style={{
        background: '#F5F5DC',
        width: '100%',
        padding: '12px 16px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: '#4A6741',
              color: 'white',
              fontSize: '16px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {user?.fullName ? user.fullName.split(' ').map(n => n[0]).join('') : 'ZM'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <div style={{ fontSize: '12px', color: '#999999', fontWeight: 'normal' }}>Community Discussion</div>
              <div style={{ fontSize: '18px', color: '#333333', fontWeight: '600' }}>BerseForum</div>
            </div>
          </div>
          <div style={{
            background: '#FF6B6B',
            color: 'white',
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            fontSize: '12px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>2</div>
        </div>
      </div>

      <Content>
        {/* Filter Section - BerseConnect Style */}
        <FilterSection>
          <FilterRow>
            <FilterButton 
              hasFilter={selectedLocations.length > 0}
              onClick={() => setShowLocationModal(true)}
            >
              <span>
                {selectedLocations.length > 0 
                  ? `Location (${selectedLocations.length})`
                  : 'Location'
                }
              </span>
              <FilterIcon>▼</FilterIcon>
            </FilterButton>
            
            <FilterButton 
              hasFilter={selectedTopics.length > 0}
              onClick={() => setShowTopicModal(true)}
            >
              <span>
                {selectedTopics.length > 0 
                  ? `Topics (${selectedTopics.length})`
                  : 'Topic Categories'
                }
              </span>
              <FilterIcon>▼</FilterIcon>
            </FilterButton>
          </FilterRow>
          
          {(selectedLocations.length > 0 || selectedTopics.length > 0) && (
            <div style={{ marginTop: '12px' }}>
              <FilterButton onClick={clearAllFilters}>
                <span>Clear All Filters</span>
                <FilterIcon>✕</FilterIcon>
              </FilterButton>
            </div>
          )}
        </FilterSection>

        {/* Improved Share Button */}
        <ShareSection>
          <CreatePostButton onClick={() => navigate('/create-forum-post')}>
            <MessageIcon>
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14,2 14,8 20,8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10,9 9,9 8,9"></polyline>
              </svg>
            </MessageIcon>
            What's on your mind?
          </CreatePostButton>
        </ShareSection>

        {/* Twitter-style Posts */}
        <PostsContainer>
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              Loading forum posts...
            </div>
          ) : filteredPosts.length === 0 ? (
            <EmptyState>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>💭</div>
              <div>No posts found. Try adjusting your filters or be the first to start a discussion!</div>
            </EmptyState>
          ) : (
            filteredPosts.map((post) => {
              const author = getProfileById(post.authorId);
              if (!author) return null;

              return (
                <PostItem key={post.id}>
                  <PostLayout>
                    <PostAvatar 
                      bgColor={author.avatarColor}
                      onClick={() => handleProfileClick(post.authorId)}
                    >
                      {author.initials}
                    </PostAvatar>
                    
                    <PostContent>
                      {/* Compact Header Line */}
                      <PostHeader>
                        <AuthorName onClick={() => handleProfileClick(post.authorId)}>
                          {author.fullName}
                        </AuthorName>
                        {author.isVerified && <VerifiedBadge>✓</VerifiedBadge>}
                        <Separator>·</Separator>
                        <LocationText>📍 {author.location}</LocationText>
                        <Separator>·</Separator>
                        <TimeText>{formatTimeAgo(post.createdAt)}</TimeText>
                      </PostHeader>

                      {/* Inline Tags and Badges */}
                      <TagsLine>
                        <CategoryBadge>{post.category}</CategoryBadge>
                        {post.isRecommended && <FeaturedBadge>⭐ Featured</FeaturedBadge>}
                        {post.tags.map((tag, index) => (
                          <InlineTag key={index} type={tag.type}>
                            {tag.text}
                          </InlineTag>
                        ))}
                      </TagsLine>

                      {/* Message Content */}
                      <MessageTitle>{post.title}</MessageTitle>
                      <MessageText>{post.content}</MessageText>

                      {/* Compact Actions */}
                      <ActionsLine>
                        <ActionButton onClick={() => handleLike(post.id)}>
                          <span>❤️</span>
                          <span>{post.likes}</span>
                        </ActionButton>
                        <ActionButton onClick={() => toggleReplies(post.id)}>
                          <span>💬</span>
                          <span>{post.replyCount}</span>
                        </ActionButton>
                        <ActionButton onClick={() => toggleReplyInput(post.id)}>
                          <span>↩️</span>
                          <span>Reply</span>
                        </ActionButton>
                        <ActionButton onClick={() => handleShare(post)}>
                          <span>🔁</span>
                          <span>Share</span>
                        </ActionButton>
                      </ActionsLine>

                      {/* Reply Input Section */}
                      <ReplyInputSection visible={showingReplyInput[post.id] || false}>
                        <ReplyInput>
                          <PostAvatar 
                            bgColor="linear-gradient(135deg, #1C5B46, #4A90A4)"
                            style={{ width: '28px', height: '28px', fontSize: '11px' }}
                          >
                            {user?.fullName ? user.fullName.split(' ').map(n => n[0]).join('') : 'ZA'}
                          </PostAvatar>
                          <ReplyTextarea
                            placeholder="Write a reply..."
                            value={replyTexts[post.id] || ''}
                            onChange={(e) => handleReplyTextChange(post.id, e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmitReply(post.id);
                              }
                            }}
                          />
                          <ReplySubmitButton
                            onClick={() => handleSubmitReply(post.id)}
                            disabled={!replyTexts[post.id]?.trim()}
                          >
                            Reply
                          </ReplySubmitButton>
                        </ReplyInput>
                      </ReplyInputSection>

                      {/* Show Replies Button */}
                      {post.replyCount > 0 && (
                        <ShowRepliesButton onClick={() => toggleReplies(post.id)}>
                          {expandedReplies[post.id] ? '▼' : '▶'} 
                          Show {post.replyCount} {post.replyCount === 1 ? 'reply' : 'replies'}
                        </ShowRepliesButton>
                      )}

                      {/* Replies Section */}
                      <RepliesSection expanded={expandedReplies[post.id] || false}>
                        {post.replies.map((reply) => {
                          const replyAuthor = getProfileById(reply.authorId);
                          if (!replyAuthor) return null;

                          return (
                            <ReplyItem key={reply.id}>
                              <ReplyLayout>
                                <ReplyAvatar 
                                  bgColor={replyAuthor.avatarColor}
                                  onClick={() => handleProfileClick(reply.authorId)}
                                >
                                  {replyAuthor.initials}
                                </ReplyAvatar>
                                
                                <ReplyContent>
                                  <ReplyHeader>
                                    <ReplyAuthor onClick={() => handleProfileClick(reply.authorId)}>
                                      {replyAuthor.fullName}
                                    </ReplyAuthor>
                                    {replyAuthor.isVerified && <ReplyVerifiedBadge>✓</ReplyVerifiedBadge>}
                                    <Separator>·</Separator>
                                    <ReplyTime>{formatTimeAgo(reply.createdAt)}</ReplyTime>
                                  </ReplyHeader>
                                  
                                  <ReplyText>{reply.content}</ReplyText>
                                  
                                  <ReplyActions>
                                    <ReplyActionButton onClick={() => handleReplyLike(post.id, reply.id)}>
                                      <span>❤️</span>
                                      <span>{reply.likes}</span>
                                    </ReplyActionButton>
                                    <ReplyActionButton>
                                      <span>↩️</span>
                                      <span>Reply</span>
                                    </ReplyActionButton>
                                  </ReplyActions>
                                </ReplyContent>
                              </ReplyLayout>
                            </ReplyItem>
                          );
                        })}
                      </RepliesSection>
                    </PostContent>
                  </PostLayout>
                </PostItem>
              );
            })
          )}
        </PostsContainer>
      </Content>
      
      <BottomNav activeTab="forum" />

      {/* Location Filter Modal */}
      <FilterModal isOpen={showLocationModal}>
        <FilterModalContent>
          <FilterModalHeader>
            <FilterModalTitle>Filter by Location</FilterModalTitle>
            <FilterModalClose onClick={() => setShowLocationModal(false)}>
              ×
            </FilterModalClose>
          </FilterModalHeader>
          
          {locationOptions.map(location => (
            <FilterOption 
              key={location}
              onClick={() => handleLocationToggle(location)}
            >
              <FilterCheckbox checked={selectedLocations.includes(location)} />
              <FilterOptionText>{location}</FilterOptionText>
            </FilterOption>
          ))}
          
          <FilterActions>
            <FilterActionButton onClick={() => {
              setSelectedLocations([]);
              setShowLocationModal(false);
            }}>
              Clear
            </FilterActionButton>
            <FilterActionButton primary onClick={applyLocationFilters}>
              Apply
            </FilterActionButton>
          </FilterActions>
        </FilterModalContent>
      </FilterModal>

      {/* Topic Filter Modal */}
      <FilterModal isOpen={showTopicModal}>
        <FilterModalContent>
          <FilterModalHeader>
            <FilterModalTitle>Filter by Topics</FilterModalTitle>
            <FilterModalClose onClick={() => setShowTopicModal(false)}>
              ×
            </FilterModalClose>
          </FilterModalHeader>
          
          {topicOptions.map(topic => (
            <FilterOption 
              key={topic}
              onClick={() => handleTopicToggle(topic)}
            >
              <FilterCheckbox checked={selectedTopics.includes(topic)} />
              <FilterOptionText>{topic}</FilterOptionText>
            </FilterOption>
          ))}
          
          <FilterActions>
            <FilterActionButton onClick={() => {
              setSelectedTopics([]);
              setShowTopicModal(false);
            }}>
              Clear
            </FilterActionButton>
            <FilterActionButton primary onClick={applyTopicFilters}>
              Apply
            </FilterActionButton>
          </FilterActions>
        </FilterModalContent>
      </FilterModal>
    </Container>
  );
};