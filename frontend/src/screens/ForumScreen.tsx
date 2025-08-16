import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { StatusBar } from '../components/StatusBar/StatusBar';
import { MainNav } from '../components/MainNav/index';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #F9F3E3;
`;

// Header with BerseConnectScreen styling
const Header = styled.div`
  background: #F9F3E3;
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
  background: linear-gradient(135deg, #2fce98 0%, #4A8B7C 100%);
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
  color: #2fce98;
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
    border-color: #2fce98;
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
    border-color: #2fce98;
    background: #FAFAFA;
  }
  
  &:active {
    transform: scale(0.98);
  }
`;

const SearchIcon = styled.div`
  font-size: 16px;
  color: #2fce98;
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
  border: 1px solid #2fce98;
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
    border-color: #2fce98;
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
  background: linear-gradient(135deg, #2fce98 0%, #4A8B7C 100%);
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
  color: ${({ $bgColor }) => $bgColor ? 'white' : '#2fce98'};
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
    color: #2fce98;
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
  color: ${({ $textColor }) => $textColor || '#2fce98'};
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
  color: ${({ $textColor }) => $textColor || '#2fce98'};
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
    border-color: #2fce98;
  }
  
  &::placeholder {
    color: #999;
  }
`;

const ReplySubmit = styled.button`
  margin-top: 6px;
  padding: 4px 12px;
  background: #2fce98;
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
    color: #2fce98;
  }
`;

const PushUpButton = styled.button<{ $isPushed?: boolean }>`
  display: flex;
  align-items: center;
  gap: 3px;
  background: ${({ $isPushed }) => $isPushed ? '#2fce98' : 'none'};
  border: 1px solid ${({ $isPushed }) => $isPushed ? '#2fce98' : '#E0E0E0'};
  color: ${({ $isPushed }) => $isPushed ? 'white' : '#666'};
  font-size: 12px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 12px;
  transition: all 0.3s ease;
  font-weight: ${({ $isPushed }) => $isPushed ? '600' : '400'};
  
  &:hover {
    background: ${({ $isPushed }) => $isPushed ? '#1A4C3A' : '#F5F5F5'};
    color: ${({ $isPushed }) => $isPushed ? 'white' : '#2fce98'};
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
    color: #2fce98;
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
  const [pushUpCounts, setPushUpCounts] = useState<{[key: number]: number}>({});
  
  // Reply states
  const [openReplies, setOpenReplies] = useState<Set<number>>(new Set());
  const [replyTexts, setReplyTexts] = useState<{[key: number]: string}>({});
  const [replyCounts, setReplyCounts] = useState<{[key: number]: number}>({});
  const [replies, setReplies] = useState<{[key: number]: Array<{id: number, author: string, text: string, time: string, avatar: string}>}>({});
  
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
      avatar: "#2fce98"
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

        {/* Forum Posts - Clean start for user generated content */}
        {/* Posts will appear here when users create them */}
      </Content>

      {/* Bottom Navigation */}
      <MainNav 
        activeTab={'home' as 'home' | 'connect' | 'match' | 'market'}
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
            case 'market':
              navigate('/market');
              break;
          }
        }}
      />
    </Container>
  );
};