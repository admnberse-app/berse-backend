import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { StatusBar } from '../components/StatusBar/StatusBar';
import { MainNav } from '../components/MainNav';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #F9F3E3;
`;

// Header with BerseConnectScreen styling
const Header = styled.div`
  background: #F5F3EF;
  padding: 20px 16px 16px 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
`;

const HeaderTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ProfileIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #2D5F4F 0%, #4A8B7C 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(45, 95, 79, 0.2);
`;

const HeaderText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const HeaderSubtitle = styled.span`
  font-size: 12px;
  color: #999;
  font-weight: 400;
`;

const HeaderTitle = styled.h1`
  font-size: 20px;
  font-weight: 600;
  color: #2D5F4F;
  margin: 0;
  line-height: 1.2;
`;

const NotificationBadge = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #FF6B6B;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(255, 107, 107, 0.3);
`;

// Filter Bar - EXACT BerseConnectScreen Design
const FilterContainer = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const FilterDropdown = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px 12px;
  background: #FFFFFF;
  border: 1px solid #E5E5E5;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 400;
  color: #333333;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  position: relative;
  min-height: 36px;
  
  &:hover {
    border-color: #2D5F4F;
    background: #FAFAFA;
  }
  
  &:active {
    transform: scale(0.98);
  }
`;

const DropdownIcon = styled.div`
  font-size: 10px;
  color: #666;
  margin-left: 2px;
  transition: transform 0.2s ease;
  
  &:before {
    content: '▼';
  }
`;

// Search Bar - BerseConnectScreen Style
const SearchContainer = styled.div`
  flex: 1;
  position: relative;
  min-width: 0;
  max-width: 60px;
`;

const SearchButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: #FFFFFF;
  border: 1px solid #E5E5E5;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #2D5F4F;
    background: #FAFAFA;
  }
  
  &:active {
    transform: scale(0.98);
  }
`;

const SearchIcon = styled.div`
  font-size: 16px;
  color: #2D5F4F;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:before {
    content: '🔍';
  }
`;

// Expanded Search Bar (when clicked)
const ExpandedSearchBar = styled.div<{ $isExpanded: boolean }>`
  position: absolute;
  top: 0;
  right: 0;
  display: ${({ $isExpanded }) => $isExpanded ? 'flex' : 'none'};
  align-items: center;
  background: #FFFFFF;
  border: 1px solid #2D5F4F;
  border-radius: 20px;
  padding: 0 12px;
  height: 36px;
  width: 200px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 10;
`;

const SearchInput = styled.input`
  flex: 1;
  border: none;
  outline: none;
  font-size: 13px;
  color: #333;
  background: transparent;
  margin-left: 8px;
  
  &::placeholder {
    color: #999;
  }
`;

// Dropdown Menu
const DropdownMenu = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  background: white;
  border: 1px solid #E5E5E5;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  min-width: 150px;
  max-height: 280px;
  overflow-y: auto;
  display: ${({ $isOpen }) => $isOpen ? 'block' : 'none'};
  z-index: 100;
`;

const DropdownItem = styled.div`
  padding: 10px 14px;
  font-size: 13px;
  color: #333;
  cursor: pointer;
  transition: background 0.2s ease;
  
  &:hover {
    background: #F5F5F5;
  }
  
  &:first-child {
    border-radius: 12px 12px 0 0;
  }
  
  &:last-child {
    border-radius: 0 0 12px 12px;
  }
`;

// Content Area
const Content = styled.div`
  flex: 1;
  padding: 16px;
  padding-bottom: 100px;
  overflow-y: auto;
`;

// Create Post Button - Clean design matching BerseConnect cards
const CreatePostCard = styled.button`
  width: 100%;
  padding: 16px;
  background: #FFFFFF;
  border: 1px solid #F0F0F0;
  border-radius: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
  
  &:hover {
    border-color: #2D5F4F;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(45, 95, 79, 0.1);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const CreatePostAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #2D5F4F 0%, #4A8B7C 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 14px;
  flex-shrink: 0;
`;

const CreatePostText = styled.span`
  flex: 1;
  text-align: left;
  color: #999;
  font-size: 14px;
  font-weight: 400;
`;

// Post Card - Matching BerseConnect event cards
const PostCard = styled.div`
  background: #FFFFFF;
  border-radius: 16px;
  padding: 16px;
  border: 1px solid #F0F0F0;
  margin-bottom: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
`;

const PostHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
`;

const PostAuthorAvatar = styled.div<{ $bgColor?: string }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${({ $bgColor }) => $bgColor || '#E8F4E8'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  color: ${({ $bgColor }) => $bgColor ? 'white' : '#2D5F4F'};
  cursor: pointer;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: scale(1.05);
  }
`;

const PostAuthorInfo = styled.div`
  flex: 1;
`;

const PostAuthorName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #333;
  cursor: pointer;
  
  &:hover {
    color: #2D5F4F;
  }
`;

const PostMeta = styled.div`
  font-size: 12px;
  color: #999;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const PostCategory = styled.span<{ $bgColor?: string; $textColor?: string }>`
  display: inline-block;
  padding: 4px 10px;
  background: ${({ $bgColor }) => $bgColor || '#E8F4E8'};
  color: ${({ $textColor }) => $textColor || '#2D5F4F'};
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  margin-bottom: 8px;
`;

const PostContent = styled.div`
  font-size: 14px;
  color: #333;
  line-height: 1.5;
  margin-bottom: 12px;
`;

const PostActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 10px;
  border-top: 1px solid #F5F5F5;
`;

const ActionSequence = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const LeftActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const RightActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CompactPostCategory = styled.span<{ $bgColor?: string; $textColor?: string }>`
  display: inline-block;
  padding: 2px 6px;
  background: ${({ $bgColor }) => $bgColor || '#E8F4E8'};
  color: ${({ $textColor }) => $textColor || '#2D5F4F'};
  border-radius: 8px;
  font-size: 10px;
  font-weight: 600;
  margin-left: 4px;
`;

const RepliesDropdown = styled.div<{ $isOpen: boolean }>`
  display: ${({ $isOpen }) => $isOpen ? 'block' : 'none'};
  margin-top: 12px;
  padding: 12px;
  background: #FAFAFA;
  border-radius: 8px;
  border: 1px solid #E5E5E5;
`;

const ReplyItem = styled.div`
  display: flex;
  gap: 8px;
  padding: 8px 0;
  border-bottom: 1px solid #F0F0F0;
  
  &:last-child {
    border-bottom: none;
  }
`;

const ReplyAvatar = styled.div<{ $bgColor?: string }>`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${({ $bgColor }) => $bgColor || '#E8F4E8'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 600;
  color: white;
  flex-shrink: 0;
`;

const ReplyContent = styled.div`
  flex: 1;
`;

const ReplyAuthor = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: #333;
`;

const ReplyText = styled.p`
  font-size: 11px;
  color: #666;
  margin: 2px 0 0 0;
  line-height: 1.4;
`;

const ReplyTime = styled.span`
  font-size: 10px;
  color: #999;
  margin-left: 8px;
`;

const ReplyForm = styled.div`
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #F0F0F0;
`;

const ReplyInput = styled.textarea`
  width: 100%;
  padding: 6px 8px;
  border: 1px solid #E0E0E0;
  border-radius: 6px;
  font-size: 11px;
  resize: vertical;
  min-height: 50px;
  
  &:focus {
    outline: none;
    border-color: #2D5F4F;
  }
  
  &::placeholder {
    color: #999;
  }
`;

const ReplySubmit = styled.button`
  margin-top: 6px;
  padding: 4px 12px;
  background: #2D5F4F;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 11px;
  cursor: pointer;
  
  &:hover {
    background: #1A4C3A;
  }
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  color: #666;
  font-size: 12px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    background: #F5F5F5;
    color: #2D5F4F;
  }
`;

const PushUpButton = styled.button<{ $isPushed?: boolean }>`
  display: flex;
  align-items: center;
  gap: 3px;
  background: ${({ $isPushed }) => $isPushed ? '#2D5F4F' : 'none'};
  border: 1px solid ${({ $isPushed }) => $isPushed ? '#2D5F4F' : '#E0E0E0'};
  color: ${({ $isPushed }) => $isPushed ? 'white' : '#666'};
  font-size: 12px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 12px;
  transition: all 0.3s ease;
  font-weight: ${({ $isPushed }) => $isPushed ? '600' : '400'};
  
  &:hover {
    background: ${({ $isPushed }) => $isPushed ? '#1A4C3A' : '#F5F5F5'};
    color: ${({ $isPushed }) => $isPushed ? 'white' : '#2D5F4F'};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(45, 95, 79, 0.2);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const CompactActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 3px;
  background: none;
  border: none;
  color: #666;
  font-size: 11px;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 6px;
  transition: all 0.2s ease;
  
  &:hover {
    background: #F5F5F5;
    color: #2D5F4F;
  }
`;

export const ForumScreen: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [selectedCountry, setSelectedCountry] = useState('Malaysia');
  const [selectedTopic, setSelectedTopic] = useState('Interests');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchExpanded, setSearchExpanded] = useState(false);
  
  // Dropdown states
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [topicDropdownOpen, setTopicDropdownOpen] = useState(false);
  
  // Push-up states (track which posts user has pushed up)
  const [pushedPosts, setPushedPosts] = useState<Set<number>>(new Set());
  const [pushUpCounts, setPushUpCounts] = useState<{[key: number]: number}>({
    1: 23, 2: 45, 3: 67, 4: 41, 5: 38, 6: 29, 7: 89, 8: 52, 9: 18, 10: 73
  });
  
  // Reply states
  const [openReplies, setOpenReplies] = useState<Set<number>>(new Set());
  const [replyTexts, setReplyTexts] = useState<{[key: number]: string}>({});
  const [replyCounts, setReplyCounts] = useState<{[key: number]: number}>({
    1: 15, 2: 8, 3: 32, 4: 28, 5: 19, 6: 12, 7: 24, 8: 16, 9: 21, 10: 35
  });
  const [replies, setReplies] = useState<{[key: number]: Array<{id: number, author: string, text: string, time: string, avatar: string}>}>({
    1: [
      { id: 1, author: "Sarah K.", text: "I'm interested! I'm also preparing for finals in December.", time: "1h ago", avatar: "#4CAF50" },
      { id: 2, author: "Mike R.", text: "Count me in! We could meet at the library on weekends.", time: "45m ago", avatar: "#FF9800" }
    ],
    2: [
      { id: 1, author: "Lisa M.", text: "Thank you for organizing this! Had such a great time.", time: "2h ago", avatar: "#E91E63" }
    ],
    3: [
      { id: 1, author: "John D.", text: "Try visiting Kota Kinabalu Park! Amazing biodiversity.", time: "3h ago", avatar: "#2196F3" },
      { id: 2, author: "Maya L.", text: "Highly recommend Sipadan Island for diving!", time: "2h ago", avatar: "#9C27B0" }
    ]
  });
  
  // Dropdown options
  const cities = ['All Cities', 'Kuala Lumpur', 'Penang', 'Johor Bahru', 'Ipoh', 'Kota Kinabalu', 'Melaka', 'Kuching'];
  const countries = ['Malaysia', 'Singapore', 'Indonesia', 'Thailand', 'Brunei', 'Philippines'];
  const topics = ['All Topics', 'Travel', 'Recommendations', 'Questions', 'Introductions', 'Events', 'Study', 'Career', 'Lifestyle'];

  // Mock user data
  const userInitials = 'ZM';
  const unreadCount = 3;

  // Close dropdowns when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => {
      setCityDropdownOpen(false);
      setCountryDropdownOpen(false);
      setTopicDropdownOpen(false);
      if (searchQuery === '') {
        setSearchExpanded(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [searchQuery]);

  const handleShare = (postId: number) => {
    if (navigator.share) {
      navigator.share({
        title: 'Forum Post',
        text: 'Check out this post',
        url: window.location.href + `/post/${postId}`
      });
    } else {
      navigator.clipboard.writeText(window.location.href + `/post/${postId}`);
    }
  };

  const handlePushUp = (postId: number) => {
    const newPushedPosts = new Set(pushedPosts);
    const newPushUpCounts = { ...pushUpCounts };
    
    if (pushedPosts.has(postId)) {
      // Un-push the post
      newPushedPosts.delete(postId);
      newPushUpCounts[postId] = Math.max(0, newPushUpCounts[postId] - 1);
    } else {
      // Push up the post
      newPushedPosts.add(postId);
      newPushUpCounts[postId] = (newPushUpCounts[postId] || 0) + 1;
    }
    
    setPushedPosts(newPushedPosts);
    setPushUpCounts(newPushUpCounts);
  };

  const handleToggleReplies = (postId: number) => {
    const newOpenReplies = new Set(openReplies);
    if (openReplies.has(postId)) {
      newOpenReplies.delete(postId);
    } else {
      newOpenReplies.add(postId);
    }
    setOpenReplies(newOpenReplies);
  };

  const handleReplyTextChange = (postId: number, text: string) => {
    setReplyTexts({ ...replyTexts, [postId]: text });
  };

  const handleSubmitReply = (postId: number) => {
    const replyText = replyTexts[postId]?.trim();
    if (!replyText) return;

    const newReply = {
      id: Date.now(),
      author: "You",
      text: replyText,
      time: "now",
      avatar: "#2D5F4F"
    };

    const newReplies = { ...replies };
    if (!newReplies[postId]) {
      newReplies[postId] = [];
    }
    newReplies[postId] = [...newReplies[postId], newReply];
    
    const newReplyCounts = { ...replyCounts };
    newReplyCounts[postId] = (newReplyCounts[postId] || 0) + 1;

    setReplies(newReplies);
    setReplyCounts(newReplyCounts);
    setReplyTexts({ ...replyTexts, [postId]: '' });
  };

  const handleProfileClick = (userId: string) => {
    navigate('/match', { state: { viewProfile: userId } });
  };

  return (
    <Container>
      <StatusBar />
      
      <Header>
        {/* Header Top Section */}
        <HeaderTop>
          <HeaderLeft>
            <ProfileIcon>{userInitials}</ProfileIcon>
            <HeaderText>
              <HeaderSubtitle>Build Communities & Friendship</HeaderSubtitle>
              <HeaderTitle>Forum</HeaderTitle>
            </HeaderText>
          </HeaderLeft>
          <NotificationBadge>{unreadCount}</NotificationBadge>
        </HeaderTop>
        
        {/* Filter Bar - BerseConnectScreen Style */}
        <FilterContainer>
          <div style={{ position: 'relative' }}>
            <FilterDropdown 
              onClick={(e) => {
                e.stopPropagation();
                setCityDropdownOpen(!cityDropdownOpen);
                setCountryDropdownOpen(false);
                setTopicDropdownOpen(false);
              }}
            >
              {selectedCity}
              <DropdownIcon />
            </FilterDropdown>
            <DropdownMenu $isOpen={cityDropdownOpen}>
              {cities.map(city => (
                <DropdownItem 
                  key={city}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedCity(city);
                    setCityDropdownOpen(false);
                  }}
                >
                  {city}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </div>
          
          <div style={{ position: 'relative' }}>
            <FilterDropdown 
              onClick={(e) => {
                e.stopPropagation();
                setCountryDropdownOpen(!countryDropdownOpen);
                setCityDropdownOpen(false);
                setTopicDropdownOpen(false);
              }}
            >
              {selectedCountry}
              <DropdownIcon />
            </FilterDropdown>
            <DropdownMenu $isOpen={countryDropdownOpen}>
              {countries.map(country => (
                <DropdownItem 
                  key={country}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedCountry(country);
                    setCountryDropdownOpen(false);
                  }}
                >
                  {country}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </div>
          
          <div style={{ position: 'relative' }}>
            <FilterDropdown 
              onClick={(e) => {
                e.stopPropagation();
                setTopicDropdownOpen(!topicDropdownOpen);
                setCityDropdownOpen(false);
                setCountryDropdownOpen(false);
              }}
            >
              {selectedTopic}
              <DropdownIcon />
            </FilterDropdown>
            <DropdownMenu $isOpen={topicDropdownOpen}>
              {topics.map(topic => (
                <DropdownItem 
                  key={topic}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTopic(topic);
                    setTopicDropdownOpen(false);
                  }}
                >
                  {topic}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </div>
          
          {/* Search Button - BerseConnectScreen Style */}
          <SearchContainer>
            <SearchButton 
              onClick={(e) => {
                e.stopPropagation();
                setSearchExpanded(true);
              }}
            >
              <SearchIcon />
            </SearchButton>
            
            <ExpandedSearchBar 
              $isExpanded={searchExpanded}
              onClick={(e) => e.stopPropagation()}
            >
              <SearchIcon />
              <SearchInput
                type="text"
                placeholder="Search forums..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                onBlur={() => {
                  if (searchQuery === '') {
                    setSearchExpanded(false);
                  }
                }}
              />
            </ExpandedSearchBar>
          </SearchContainer>
        </FilterContainer>
      </Header>

      <Content>
        {/* Create Post Button - Clean design */}
        <CreatePostCard onClick={() => navigate('/create-forum-post')}>
          <CreatePostAvatar>{userInitials}</CreatePostAvatar>
          <CreatePostText>What's on your mind?</CreatePostText>
        </CreatePostCard>

        {/* Forum Posts */}
        <PostCard>
          <PostHeader>
            <PostAuthorAvatar 
              onClick={() => handleProfileClick('user_1')}
              $bgColor="#4A90E2"
            >
              AM
            </PostAuthorAvatar>
            <PostAuthorInfo>
              <PostAuthorName onClick={() => handleProfileClick('user_1')}>
                Ahmad M.
              </PostAuthorName>
              <PostMeta>
                2 hours ago • Kuala Lumpur
              </PostMeta>
            </PostAuthorInfo>
          </PostHeader>
          <PostContent>
            Looking for study buddies for upcoming finals. Anyone interested in forming a study group?
          </PostContent>
          <PostActions>
            <ActionSequence>
              <CompactActionButton onClick={() => handleToggleReplies(1)}>
                💬 {replyCounts[1] || 0} replies
              </CompactActionButton>
              <PushUpButton 
                $isPushed={pushedPosts.has(1)}
                onClick={() => handlePushUp(1)}
              >
                ⬆️ {pushUpCounts[1] || 0}
              </PushUpButton>
              <CompactActionButton onClick={() => handleShare(1)}>
                📤 Share
              </CompactActionButton>
              <CompactPostCategory $bgColor="#F3E8FF" $textColor="#9C27B0">
                Questions
              </CompactPostCategory>
            </ActionSequence>
          </PostActions>
          
          <RepliesDropdown $isOpen={openReplies.has(1)}>
            {replies[1]?.map((reply) => (
              <ReplyItem key={reply.id}>
                <ReplyAvatar $bgColor={reply.avatar}>
                  {reply.author.charAt(0)}
                </ReplyAvatar>
                <ReplyContent>
                  <ReplyAuthor>{reply.author}</ReplyAuthor>
                  <ReplyTime>{reply.time}</ReplyTime>
                  <ReplyText>{reply.text}</ReplyText>
                </ReplyContent>
              </ReplyItem>
            ))}
            <ReplyForm>
              <ReplyInput
                placeholder="Write a reply..."
                value={replyTexts[1] || ''}
                onChange={(e) => handleReplyTextChange(1, e.target.value)}
              />
              <ReplySubmit onClick={() => handleSubmitReply(1)}>
                Reply
              </ReplySubmit>
            </ReplyForm>
          </RepliesDropdown>
        </PostCard>

        <PostCard>
          <PostHeader>
            <PostAuthorAvatar 
              onClick={() => handleProfileClick('user_2')}
              $bgColor="#FF9800"
            >
              SF
            </PostAuthorAvatar>
            <PostAuthorInfo>
              <PostAuthorName onClick={() => handleProfileClick('user_2')}>
                Siti F.
              </PostAuthorName>
              <PostMeta>
                5 hours ago • Penang
              </PostMeta>
            </PostAuthorInfo>
          </PostHeader>
          <PostContent>
            Great community event last weekend! Thanks to everyone who participated in the beach cleanup 🌊
          </PostContent>
          <PostActions>
            <ActionSequence>
              <CompactActionButton onClick={() => handleToggleReplies(2)}>
                💬 {replyCounts[2] || 0} replies
              </CompactActionButton>
              <PushUpButton 
                $isPushed={pushedPosts.has(2)}
                onClick={() => handlePushUp(2)}
              >
                ⬆️ {pushUpCounts[2] || 0}
              </PushUpButton>
              <CompactActionButton onClick={() => handleShare(2)}>
                📤 Share
              </CompactActionButton>
              <CompactPostCategory $bgColor="#FFE8E8" $textColor="#FF4444">
                Events
              </CompactPostCategory>
            </ActionSequence>
          </PostActions>
          
          <RepliesDropdown $isOpen={openReplies.has(2)}>
            {replies[2]?.map((reply) => (
              <ReplyItem key={reply.id}>
                <ReplyAvatar $bgColor={reply.avatar}>
                  {reply.author.charAt(0)}
                </ReplyAvatar>
                <ReplyContent>
                  <ReplyAuthor>{reply.author}</ReplyAuthor>
                  <ReplyTime>{reply.time}</ReplyTime>
                  <ReplyText>{reply.text}</ReplyText>
                </ReplyContent>
              </ReplyItem>
            ))}
            <ReplyForm>
              <ReplyInput
                placeholder="Write a reply..."
                value={replyTexts[2] || ''}
                onChange={(e) => handleReplyTextChange(2, e.target.value)}
              />
              <ReplySubmit onClick={() => handleSubmitReply(2)}>
                Reply
              </ReplySubmit>
            </ReplyForm>
          </RepliesDropdown>
        </PostCard>

        <PostCard>
          <PostHeader>
            <PostAuthorAvatar 
              onClick={() => handleProfileClick('user_3')}
              $bgColor="#00BCD4"
            >
              LW
            </PostAuthorAvatar>
            <PostAuthorInfo>
              <PostAuthorName onClick={() => handleProfileClick('user_3')}>
                Lim Wei
              </PostAuthorName>
              <PostMeta>
                1 day ago • Kuching
              </PostMeta>
            </PostAuthorInfo>
          </PostHeader>
          <PostContent>
            Just came back from an amazing trip to Langkawi! The sunset at Pantai Cenang was absolutely breathtaking 🌅 Any recommendations for hidden gems in Sabah for my next adventure?
          </PostContent>
          <PostActions>
            <LeftActions>
              <CompactActionButton>
                💬 32 replies
              </CompactActionButton>
              <PushUpButton 
                $isPushed={pushedPosts.has(3)}
                onClick={() => handlePushUp(3)}
              >
                ⬆️ Push up {pushUpCounts[3] || 0}
              </PushUpButton>
            </LeftActions>
            <RightActions>
              <CompactPostCategory $bgColor="#E8F5FF" $textColor="#0066CC">
                Travel
              </CompactPostCategory>
              <CompactActionButton onClick={() => handleShare(3)}>
                📤 Share
              </CompactActionButton>
            </RightActions>
          </PostActions>
        </PostCard>

        <PostCard>
          <PostHeader>
            <PostAuthorAvatar 
              onClick={() => handleProfileClick('user_4')}
              $bgColor="#E91E63"
            >
              NI
            </PostAuthorAvatar>
            <PostAuthorInfo>
              <PostAuthorName onClick={() => handleProfileClick('user_4')}>
                Nurul Iman
              </PostAuthorName>
              <PostMeta>
                3 hours ago • Johor Bahru
              </PostMeta>
            </PostAuthorInfo>
          </PostHeader>
          <PostContent>
            Looking for the best nasi lemak in JB! I've tried a few places but nothing beats my grandma's recipe yet 😅 Drop your favorite spots below!
          </PostContent>
          <PostActions>
            <LeftActions>
              <CompactActionButton>
                💬 28 replies
              </CompactActionButton>
              <PushUpButton 
                $isPushed={pushedPosts.has(4)}
                onClick={() => handlePushUp(4)}
              >
                ⬆️ Push up {pushUpCounts[4] || 0}
              </PushUpButton>
            </LeftActions>
            <RightActions>
              <CompactPostCategory $bgColor="#FFF3E0" $textColor="#FF9800">
                Recommendations
              </CompactPostCategory>
              <CompactActionButton onClick={() => handleShare(4)}>
                📤 Share
              </CompactActionButton>
            </RightActions>
          </PostActions>
        </PostCard>

        <PostCard>
          <PostHeader>
            <PostAuthorAvatar 
              onClick={() => handleProfileClick('user_5')}
              $bgColor="#4CAF50"
            >
              RK
            </PostAuthorAvatar>
            <PostAuthorInfo>
              <PostAuthorName onClick={() => handleProfileClick('user_5')}>
                Raj Kumar
              </PostAuthorName>
              <PostMeta>
                6 hours ago • Kuala Lumpur
              </PostMeta>
            </PostAuthorInfo>
          </PostHeader>
          <PostContent>
            Hi everyone! I'm new to KL, just moved here for work from Chennai. Excited to meet new people and explore this beautiful city! Any tips for a newcomer? 🇮🇳➡️🇲🇾
          </PostContent>
          <PostActions>
            <LeftActions>
              <CompactActionButton>
                💬 19 replies
              </CompactActionButton>
              <PushUpButton 
                $isPushed={pushedPosts.has(5)}
                onClick={() => handlePushUp(5)}
              >
                ⬆️ Push up {pushUpCounts[5] || 0}
              </PushUpButton>
            </LeftActions>
            <RightActions>
              <CompactPostCategory $bgColor="#E8F4E8" $textColor="#2D5F4F">
                Introductions
              </CompactPostCategory>
              <CompactActionButton onClick={() => handleShare(5)}>
                📤 Share
              </CompactActionButton>
            </RightActions>
          </PostActions>
        </PostCard>

        <PostCard>
          <PostHeader>
            <PostAuthorAvatar 
              onClick={() => handleProfileClick('user_6')}
              $bgColor="#673AB7"
            >
              MH
            </PostAuthorAvatar>
            <PostAuthorInfo>
              <PostAuthorName onClick={() => handleProfileClick('user_6')}>
                Maya Hassan
              </PostAuthorName>
              <PostMeta>
                4 hours ago • Shah Alam
              </PostMeta>
            </PostAuthorInfo>
          </PostHeader>
          <PostContent>
            Anyone else preparing for IELTS? I'm aiming for band 8 and looking for a study partner to practice speaking with. We can meet at cafes around UiTM! 📚
          </PostContent>
          <PostActions>
            <LeftActions>
              <CompactActionButton>
                💬 12 replies
              </CompactActionButton>
              <PushUpButton 
                $isPushed={pushedPosts.has(6)}
                onClick={() => handlePushUp(6)}
              >
                ⬆️ Push up {pushUpCounts[6] || 0}
              </PushUpButton>
            </LeftActions>
            <RightActions>
              <CompactPostCategory $bgColor="#F3E5F5" $textColor="#9C27B0">
                Study
              </CompactPostCategory>
              <CompactActionButton onClick={() => handleShare(6)}>
                📤 Share
              </CompactActionButton>
            </RightActions>
          </PostActions>
        </PostCard>

        <PostCard>
          <PostHeader>
            <PostAuthorAvatar 
              onClick={() => handleProfileClick('user_7')}
              $bgColor="#F44336"
            >
              DL
            </PostAuthorAvatar>
            <PostAuthorInfo>
              <PostAuthorName onClick={() => handleProfileClick('user_7')}>
                Danny Lim
              </PostAuthorName>
              <PostMeta>
                8 hours ago • Cyberjaya
              </PostMeta>
            </PostAuthorInfo>
          </PostHeader>
          <PostContent>
            Just landed my first job as a software developer! 🎉 Grateful for all the support from this community during my job search. Happy to share tips for fresh grads!
          </PostContent>
          <PostActions>
            <LeftActions>
              <CompactActionButton>
                💬 24 replies
              </CompactActionButton>
              <PushUpButton 
                $isPushed={pushedPosts.has(7)}
                onClick={() => handlePushUp(7)}
              >
                ⬆️ Push up {pushUpCounts[7] || 0}
              </PushUpButton>
            </LeftActions>
            <RightActions>
              <CompactPostCategory $bgColor="#FFEBEE" $textColor="#D32F2F">
                Career
              </CompactPostCategory>
              <CompactActionButton onClick={() => handleShare(7)}>
                📤 Share
              </CompactActionButton>
            </RightActions>
          </PostActions>
        </PostCard>

        <PostCard>
          <PostHeader>
            <PostAuthorAvatar 
              onClick={() => handleProfileClick('user_8')}
              $bgColor="#FF5722"
            >
              AS
            </PostAuthorAvatar>
            <PostAuthorInfo>
              <PostAuthorName onClick={() => handleProfileClick('user_8')}>
                Aisha Salleh
              </PostAuthorName>
              <PostMeta>
                12 hours ago • Ipoh
              </PostMeta>
            </PostAuthorInfo>
          </PostHeader>
          <PostContent>
            Started my morning yoga routine last month and it's been life-changing! 🧘‍♀️ Anyone interested in joining me for sunrise yoga at Kinta Riverfront Park?
          </PostContent>
          <PostActions>
            <LeftActions>
              <CompactActionButton>
                💬 16 replies
              </CompactActionButton>
              <PushUpButton 
                $isPushed={pushedPosts.has(8)}
                onClick={() => handlePushUp(8)}
              >
                ⬆️ Push up {pushUpCounts[8] || 0}
              </PushUpButton>
            </LeftActions>
            <RightActions>
              <CompactPostCategory $bgColor="#FFF0F5" $textColor="#C2185B">
                Lifestyle
              </CompactPostCategory>
              <CompactActionButton onClick={() => handleShare(8)}>
                📤 Share
              </CompactActionButton>
            </RightActions>
          </PostActions>
        </PostCard>

        <PostCard>
          <PostHeader>
            <PostAuthorAvatar 
              onClick={() => handleProfileClick('user_9')}
              $bgColor="#009688"
            >
              FZ
            </PostAuthorAvatar>
            <PostAuthorInfo>
              <PostAuthorName onClick={() => handleProfileClick('user_9')}>
                Farah Zainab
              </PostAuthorName>
              <PostMeta>
                1 day ago • Melaka
              </PostMeta>
            </PostAuthorInfo>
          </PostHeader>
          <PostContent>
            Does anyone know good affordable housing options near MMU Melaka? I'm starting my master's program next semester and looking for something within walking distance 🏠
          </PostContent>
          <PostActions>
            <LeftActions>
              <CompactActionButton>
                💬 21 replies
              </CompactActionButton>
              <PushUpButton 
                $isPushed={pushedPosts.has(9)}
                onClick={() => handlePushUp(9)}
              >
                ⬆️ Push up {pushUpCounts[9] || 0}
              </PushUpButton>
            </LeftActions>
            <RightActions>
              <CompactPostCategory $bgColor="#E0F2F1" $textColor="#00695C">
                Questions
              </CompactPostCategory>
              <CompactActionButton onClick={() => handleShare(9)}>
                📤 Share
              </CompactActionButton>
            </RightActions>
          </PostActions>
        </PostCard>

        <PostCard>
          <PostHeader>
            <PostAuthorAvatar 
              onClick={() => handleProfileClick('user_10')}
              $bgColor="#FFC107"
            >
              KB
            </PostAuthorAvatar>
            <PostAuthorInfo>
              <PostAuthorName onClick={() => handleProfileClick('user_10')}>
                Kevin Bong
              </PostAuthorName>
              <PostMeta>
                2 days ago • Kota Kinabalu
              </PostMeta>
            </PostAuthorInfo>
          </PostHeader>
          <PostContent>
            Planning a hiking trip to Mount Kinabalu next month! Looking for 2-3 more people to join our group. Experience level doesn't matter, we'll support each other! ⛰️
          </PostContent>
          <PostActions>
            <LeftActions>
              <CompactActionButton>
                💬 35 replies
              </CompactActionButton>
              <PushUpButton 
                $isPushed={pushedPosts.has(10)}
                onClick={() => handlePushUp(10)}
              >
                ⬆️ Push up {pushUpCounts[10] || 0}
              </PushUpButton>
            </LeftActions>
            <RightActions>
              <CompactPostCategory $bgColor="#FFFDE7" $textColor="#F57F17">
                Events
              </CompactPostCategory>
              <CompactActionButton onClick={() => handleShare(10)}>
                📤 Share
              </CompactActionButton>
            </RightActions>
          </PostActions>
        </PostCard>
      </Content>

      {/* Bottom Navigation */}
      <MainNav 
        activeTab="forum"
        onTabPress={(tab) => {
          switch (tab) {
            case 'home':
              navigate('/dashboard');
              break;
            case 'connect':
              navigate('/connect');
              break;
            case 'match':
              navigate('/match');
              break;
            case 'forum':
              navigate('/forum');
              break;
          }
        }}
      />
    </Container>
  );
};