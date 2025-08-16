import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { StatusBar } from '../components/StatusBar/StatusBar';
import { MainNav } from '../components/MainNav';
import { generateBerseMukhaEvents } from '../data/bersemukhaEvents';
import axios from 'axios';
import { API_BASE_URL } from '../config/services.config';
import { ImageCropper } from '../components/ImageCropper';

// Interest options
const INTEREST_OPTIONS = [
  { icon: '🌍', label: 'Cultural Networking', value: 'cultural-networking' },
  { icon: '☕', label: 'Cafe Hopping', value: 'cafe-hopping' },
  { icon: '✈️', label: 'Travel Stories', value: 'travel-stories' },
  { icon: '🗣️', label: 'Language Exchange', value: 'language-exchange' },
  { icon: '🚀', label: 'Startup Networking', value: 'startup-networking' },
  { icon: '💚', label: 'Social Impact', value: 'social-impact' },
  { icon: '⚽', label: 'Sports Activities', value: 'sports-activities' },
  { icon: '🏸', label: 'Badminton Games', value: 'badminton-games' },
  { icon: '🥾', label: 'Hiking Trails', value: 'hiking-trails' },
  { icon: '🏛️', label: 'Heritage Walks', value: 'heritage-walks' },
  { icon: '🍜', label: 'Foodie Meetups', value: 'foodie-meetups' },
  { icon: '📚', label: 'Book Talks', value: 'book-talks' },
  { icon: '🎒', label: 'Weekend Trips', value: 'weekend-trips' },
  { icon: '📸', label: 'Photo Walks', value: 'photo-walks' },
  { icon: '🏖️', label: 'Beach Outings', value: 'beach-outings' }
];

// Personality types
const PERSONALITY_TYPES = [
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP'
];

// Initial communities (will be fetched from API)
const INITIAL_COMMUNITIES = [
  'NAMA Foundation',
  'Malaysian Architects',
  'KL Photography Club',
  'Istanbul Tour Guides',
  'Halal Tourism Turkey'
];

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
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background-color: #F9F3E3;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: #333;
  font-size: 16px;
  cursor: pointer;
`;

const HeaderTitle = styled.h1`
  margin: 0;
  font-size: 18px;
  font-weight: bold;
  color: #2fce98;
`;

const SaveButton = styled.button`
  background: none;
  border: none;
  color: #2fce98;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
`;

const Content = styled.div`
  flex: 1;
  padding: 16px 20px 100px 20px;
  overflow-y: auto;
`;

// BerseMatch-style Profile Card Components
const ProfileCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  border: 1px solid #e9ecef;
  position: relative;
`;

const ProfileHeader = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  position: relative;
`;

const ProfileAvatar = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 24px;
  position: relative;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 3px solid white;
  flex-shrink: 0;
  cursor: pointer;
  
  &:hover {
    &::after {
      content: '📷';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      font-size: 20px;
    }
  }
`;

const ProfileInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const ProfileName = styled.input`
  margin: 0;
  font-size: 17px;
  font-weight: bold;
  color: #333;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  border: none;
  background: transparent;
  outline: none;
  padding: 4px;
  border-radius: 4px;
  width: 100%;
  
  &:focus {
    background: rgba(0, 123, 255, 0.1);
  }
`;

const ProfileMeta = styled.input`
  margin: 4px 0 0 0;
  font-size: 13px;
  color: #666;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  border: none;
  background: transparent;
  outline: none;
  padding: 4px;
  border-radius: 4px;
  width: 100%;
  
  &:focus {
    background: rgba(0, 123, 255, 0.1);
  }
`;

const FormSection = styled.div`
  margin-bottom: 20px;
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #2fce98;
  margin: 0 0 12px 0;
  padding: 0 4px;
`;

const FormField = styled.div`
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  border: 1px solid #e9ecef;
`;

const FieldLabel = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
`;

const FieldHelperText = styled.div`
  font-size: 12px;
  color: #666;
  margin-top: 4px;
`;

const FieldInput = styled.input`
  width: 100%;
  border: none;
  outline: none;
  font-size: 14px;
  color: #333;
  background: transparent;
  padding: 4px;
  border-radius: 4px;
  
  &:focus {
    background: rgba(0, 123, 255, 0.05);
  }
  
  &::placeholder {
    color: #999;
  }
`;

const FieldSelect = styled.select`
  width: 100%;
  border: none;
  outline: none;
  font-size: 14px;
  color: #333;
  background: transparent;
  padding: 4px;
  border-radius: 4px;
  cursor: pointer;
  
  &:focus {
    background: rgba(0, 123, 255, 0.05);
  }
`;

const FieldTextArea = styled.textarea`
  width: 100%;
  border: none;
  outline: none;
  font-size: 14px;
  color: #333;
  background: transparent;
  padding: 4px;
  border-radius: 4px;
  resize: vertical;
  min-height: 60px;
  font-family: inherit;
  
  &:focus {
    background: rgba(0, 123, 255, 0.05);
  }
  
  &::placeholder {
    color: #999;
  }
`;

// New styled components for enhanced profile
const InterestsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
`;

const InterestCard = styled.div<{ $selected: boolean }>`
  background: ${props => props.$selected ? '#2fce98' : 'white'};
  color: ${props => props.$selected ? 'white' : '#333'};
  border: 1px solid ${props => props.$selected ? '#2fce98' : '#e9ecef'};
  border-radius: 12px;
  padding: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
  }
`;

const SubText = styled.p`
  font-size: 12px;
  color: #666;
  margin: -8px 0 12px 4px;
  font-style: italic;
`;

const EventsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
`;

const EventCard = styled.div<{ $selected: boolean }>`
  background: ${props => props.$selected ? '#F3E5F5' : 'white'};
  border: 1px solid ${props => props.$selected ? '#7B1FA2' : '#e9ecef'};
  border-radius: 12px;
  padding: 10px;
  cursor: pointer;
  text-align: center;
  position: relative;
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
`;

const EventMonth = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
`;

const EventTheme = styled.div`
  font-size: 10px;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const OfferingSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  border: 1px solid #e9ecef;
`;

const OfferingHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
`;

const OfferingToggle = styled.input`
  width: 20px;
  height: 20px;
  cursor: pointer;
`;

const OfferingTitle = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: #333;
  cursor: pointer;
  flex: 1;
`;

const OfferingDetails = styled.div`
  padding-left: 32px;
  border-left: 2px solid #E0E0E0;
  margin-left: 10px;
`;

// Searchable dropdown components
const SearchableDropdown = styled.div`
  position: relative;
  width: 100%;
`;

const SearchInput = styled.input`
  width: 100%;
  border: none;
  outline: none;
  font-size: 14px;
  color: #333;
  background: transparent;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #e9ecef;
  
  &:focus {
    background: rgba(0, 123, 255, 0.05);
    border-color: #2fce98;
  }
  
  &::placeholder {
    color: #999;
  }
`;

const DropdownList = styled.div<{ $show: boolean }>`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  margin-top: 4px;
  max-height: 200px;
  overflow-y: auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 100;
  display: ${props => props.$show ? 'block' : 'none'};
`;

const DropdownItem = styled.div<{ $selected?: boolean }>`
  padding: 10px 12px;
  cursor: pointer;
  font-size: 13px;
  background: ${props => props.$selected ? '#F0F7F4' : 'white'};
  color: ${props => props.$selected ? '#2fce98' : '#333'};
  border-bottom: 1px solid #f0f0f0;
  
  &:hover {
    background: #F8F8F8;
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const AddNewItem = styled(DropdownItem)`
  background: #FFF3E0;
  color: #E65100;
  font-weight: 600;
  
  &:hover {
    background: #FFE0B2;
  }
`;

const SelectedCommunities = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
`;

const SelectedTag = styled.span`
  background: #E8F5E9;
  color: #2E7D32;
  padding: 4px 10px;
  border-radius: 16px;
  font-size: 12px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  
  button {
    background: none;
    border: none;
    color: #2E7D32;
    cursor: pointer;
    font-weight: bold;
    padding: 0;
    margin-left: 4px;
    font-size: 14px;
    
    &:hover {
      color: #1B5E20;
    }
  }
`;

// Event-specific styled components
const SelectedEventsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 16px;
`;

const EventWithFriends = styled.div`
  background: #F8F8F8;
  border-radius: 12px;
  padding: 16px;
  border: 1px solid #E0E0E0;
`;

const EventHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const EventDateLabel = styled.div`
  font-weight: 600;
  color: #2fce98;
  font-size: 14px;
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: #FF4444;
  font-size: 20px;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: #FFF0F0;
    border-radius: 4px;
  }
`;

const FriendsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FriendsLabel = styled.label`
  font-size: 12px;
  color: #666;
  font-weight: 500;
`;

const FriendsDropdown = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const FriendsHint = styled.span`
  font-size: 11px;
  color: #999;
  font-style: italic;
`;

const SelectedFriendsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
`;

const FriendTag = styled.span`
  background: #E8F5E9;
  color: #2E7D32;
  padding: 4px 10px;
  border-radius: 16px;
  font-size: 11px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  
  button {
    background: none;
    border: none;
    color: #2E7D32;
    font-size: 14px;
    cursor: pointer;
    padding: 0;
    margin-left: 2px;
    
    &:hover {
      color: #1B5E20;
    }
  }
`;

const ComingSoonBadge = styled.span`
  background: #FFA726;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
  margin-left: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const EditProfileScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Image cropper state
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    age: '28',
    currentLocation: 'Kuala Lumpur, Malaysia',
    originLocation: 'Penang, Malaysia',
    gender: '',
    bio: 'Architect and photographer passionate about cultural heritage. Love discovering hidden gems, connecting with creative minds over coffee, and documenting stories through my lens. Always seeking meaningful conversations and authentic experiences.',
    shortBio: 'Architect | Photographer | Coffee Explorer | Heritage Enthusiast',
    profession: 'Architect & Photographer',
    nationality: 'Malaysian',
    personalityType: 'ENFJ-A',
    languages: ['English', 'Malay', 'Arabic'],
    topInterests: ['cultural-networking', 'cafe-hopping', 'heritage-walks', 'photo-walks'],
    communities: [],
    pendingCommunities: [],
    eventsAttended: [],
    instagram: '',
    linkedin: '',
    twitter: '',
    website: '',
    // Moderators
    moderators: [] as Array<{ name: string; role: string; email: string }>,
    // Offerings
    offerBerseGuide: false,
    berseGuidePrice: 'RM50-80/day',
    berseGuideLocations: [],
    berseGuideSpecialties: [],
    offerHomeSurf: false,
    homeSurfCity: '',
    homeSurfMaxDays: '3',
    homeSurfAmenities: [],
    homeSurfNotes: '',
    offerBerseBuddy: false,
    berseBuddyActivities: [],
    offerBerseMentor: false,
    berseMentorExpertise: [],
    berseMentorRate: '100 BersePoints/hour',
    otherServices: '',
    // New fields for trust chain and travel
    countriesVisited: 15,
    citiesExplored: 42,
    displayName: '',
    tagline: '',
    visibility: 'public'
  });

  const [selectedInterests, setSelectedInterests] = useState<string[]>(formData.topInterests);
  const [selectedCommunities, setSelectedCommunities] = useState<string[]>(formData.communities);
  const [selectedEvents, setSelectedEvents] = useState<{eventId: string, friendsMade: string[]}[]>([]);
  const [allBerseMukhaEvents] = useState(generateBerseMukhaEvents());
  const [communitySearch, setCommunitySearch] = useState('');
  const [showCommunityDropdown, setShowCommunityDropdown] = useState(false);
  const [availableCommunities, setAvailableCommunities] = useState<string[]>(INITIAL_COMMUNITIES);
  const [isLoadingCommunities, setIsLoadingCommunities] = useState(false);
  const [eventSearch, setEventSearch] = useState('');
  const [showEventDropdown, setShowEventDropdown] = useState(false);
  const eventDropdownRef = useRef<HTMLDivElement>(null);
  
  // Sample friends list for each event
  const sampleFriends = [
    'Ahmad Razak - Software Engineer',
    'Sarah Lim - UX Designer',
    'Mehmet Yilmaz - Business Analyst',
    'Priya Sharma - Marketing Manager',
    'John Tan - Photographer',
    'Aisha Mohamed - Product Manager',
    'Wei Chen - Data Scientist',
    'Farah Ibrahim - Architect',
    'Raj Kumar - Startup Founder',
    'Lisa Wong - Content Creator',
    'Hassan Ali - Financial Advisor',
    'Maria Santos - Teacher',
    'David Lee - Graphic Designer',
    'Nurul Aina - Doctor',
    'James Ng - Consultant'
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Fetch communities from API
  useEffect(() => {
    const fetchCommunities = async () => {
      setIsLoadingCommunities(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/api/v1/communities`);
        if (response.data.success && response.data.data) {
          const communityNames = response.data.data.map((c: any) => c.name);
          setAvailableCommunities(communityNames);
        }
      } catch (error) {
        console.error('Failed to fetch communities:', error);
        // Keep using initial communities on error
      } finally {
        setIsLoadingCommunities(false);
      }
    };

    fetchCommunities();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowCommunityDropdown(false);
      }
      if (eventDropdownRef.current && !eventDropdownRef.current.contains(event.target as Node)) {
        setShowEventDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handlePhotoChange = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (croppedImage: string) => {
    setProfileImage(croppedImage);
    setSelectedImage(null);
    setShowCropper(false);
    // Here you would typically upload the cropped image to your server
    console.log('Cropped image ready for upload:', croppedImage);
  };

  const handleSave = async () => {
    try {
      // Prepare complete profile data
      const profileData = {
        ...formData,
        topInterests: selectedInterests,
        communities: selectedCommunities,
        eventsAttended: selectedEvents
      };
      
      console.log('Saving profile:', profileData);
      
      // Update user in AuthContext with the new profile data
      updateUser({
        fullName: profileData.fullName,
        email: profileData.email,
        phone: profileData.phone,
        age: parseInt(profileData.age) || undefined,
        currentLocation: profileData.currentLocation,
        originLocation: profileData.originLocation,
        profession: profileData.profession,
        bio: profileData.bio,
        personalityType: profileData.personalityType,
        languages: profileData.languages.join(', '),
        topInterests: selectedInterests,
        communities: selectedCommunities,
        eventsAttended: selectedEvents,
        offerings: {
          berseGuide: profileData.offerBerseGuide,
          homeSurf: profileData.offerHomeSurf,
          berseBuddy: profileData.offerBerseBuddy,
          berseMentor: profileData.offerBerseMentor
        }
      });
      
      // Count total friends made across all events
      const totalFriends = selectedEvents.reduce((sum, event) => sum + event.friendsMade.length, 0);
      
      // Show confirmation with details
      const confirmMessage = `
Profile Updated Successfully!

✅ Location: ${profileData.currentLocation}
✅ Interests: ${selectedInterests.length} selected
✅ Communities: ${selectedCommunities.length} (pending approval)
✅ Events: ${selectedEvents.length} attended (${totalFriends} friends made)
✅ Offerings: ${
        [
          formData.offerBerseGuide && 'BerseGuide',
          formData.offerHomeSurf && 'HomeSurf',
          formData.offerBerseBuddy && 'BerseBuddy',
          formData.offerBerseMentor && 'BerseMentor'
        ].filter(Boolean).join(', ') || 'None'
      }
      `.trim();
      
      alert(confirmMessage);
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to save profile:', error);
      alert('Failed to save profile. Please try again.');
    }
  };

  return (
    <Container>
      <StatusBar />
      
      <Header>
        <BackButton onClick={() => navigate(-1)}>
          ← Cancel
        </BackButton>
        <HeaderTitle>Edit Profile</HeaderTitle>
        <SaveButton onClick={handleSave}>Save</SaveButton>
      </Header>

      <Content>
        {/* Profile Header Card */}
        <ProfileCard>
          <ProfileHeader>
            <ProfileAvatar
              style={{
                background: profileImage 
                  ? `url(${profileImage}) center/cover no-repeat`
                  : 'linear-gradient(135deg, #2fce98 0%, #4A8B7C 100%)',
                cursor: 'pointer',
                position: 'relative'
              }}
              onClick={handlePhotoChange}
            >
              {!profileImage && (user?.fullName ? user.fullName.split(' ').map(n => n[0]).join('') : 'ZA')}
              <div style={{
                position: 'absolute',
                bottom: -5,
                right: -5,
                background: '#2fce98',
                borderRadius: '50%',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid white',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                fontSize: '14px'
              }}>
                📷
              </div>
            </ProfileAvatar>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <ProfileInfo>
              <ProfileName
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                placeholder="Enter your full name"
              />
              <ProfileMeta
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Add a bio about yourself"
              />
            </ProfileInfo>
          </ProfileHeader>
        </ProfileCard>

        {/* Location & Origin */}
        <FormSection>
          <SectionTitle>Location & Background</SectionTitle>
          
          <FormField>
            <FieldLabel>Current Location</FieldLabel>
            <FieldInput
              value={formData.currentLocation}
              onChange={(e) => handleInputChange('currentLocation', e.target.value)}
              placeholder="e.g., Kuala Lumpur, Malaysia"
            />
          </FormField>

          <FormField>
            <FieldLabel>Originally From</FieldLabel>
            <FieldInput
              value={formData.originLocation}
              onChange={(e) => handleInputChange('originLocation', e.target.value)}
              placeholder="e.g., Penang, Malaysia"
            />
          </FormField>
        </FormSection>

        {/* Top Interests */}
        <FormSection>
          <SectionTitle>Top 4 Interests</SectionTitle>
          <SubText>Select your top 4 interests from the dropdowns below</SubText>
          
          {[0, 1, 2, 3].map((index) => (
            <FormField key={index}>
              <FieldLabel>Interest #{index + 1}</FieldLabel>
              <FieldSelect
                value={selectedInterests[index] || ''}
                onChange={(e) => {
                  const newInterests = [...selectedInterests];
                  if (e.target.value) {
                    // Check if this interest is already selected in another dropdown
                    const existingIndex = newInterests.indexOf(e.target.value);
                    if (existingIndex !== -1 && existingIndex !== index) {
                      alert('This interest is already selected. Please choose a different one.');
                      return;
                    }
                    newInterests[index] = e.target.value;
                  } else {
                    // Remove the interest if empty option is selected
                    newInterests.splice(index, 1);
                  }
                  setSelectedInterests(newInterests);
                }}
              >
                <option value="">Select an interest</option>
                {INTEREST_OPTIONS.map(interest => (
                  <option 
                    key={interest.value} 
                    value={interest.value}
                    disabled={selectedInterests.includes(interest.value) && selectedInterests[index] !== interest.value}
                  >
                    {interest.label}
                  </option>
                ))}
              </FieldSelect>
            </FormField>
          ))}
        </FormSection>

        {/* Bio & Professional Summary */}
        <FormSection>
          <SectionTitle>Bio & Professional Summary</SectionTitle>
          
          <FormField>
            <FieldLabel>Short Bio (LinkedIn-style)</FieldLabel>
            <FieldInput
              value={formData.shortBio}
              onChange={(e) => handleInputChange('shortBio', e.target.value)}
              placeholder="e.g., Architect | Photographer | Coffee Explorer"
              maxLength={100}
            />
          </FormField>

          <FormField>
            <FieldLabel>
              Full Bio 
              <span style={{ 
                float: 'right', 
                fontSize: '11px', 
                color: formData.bio.split(' ').filter(w => w).length > 50 ? '#FF4444' : '#666' 
              }}>
                {formData.bio.split(' ').filter(w => w).length}/50 words
              </span>
            </FieldLabel>
            <FieldTextArea
              value={formData.bio}
              onChange={(e) => {
                const words = e.target.value.split(' ').filter(w => w).length;
                if (words <= 50) {
                  handleInputChange('bio', e.target.value);
                } else {
                  alert('Bio is limited to 50 words maximum');
                }
              }}
              placeholder="Tell us about yourself, your passions, and what you're looking for in the community... (max 50 words)"
              rows={3}
              maxLength={350}
            />
            <div style={{ 
              fontSize: '11px', 
              color: '#666', 
              marginTop: '4px',
              fontStyle: 'italic' 
            }}>
              Keep it concise - about 2 sentences describing who you are and what you're passionate about.
            </div>
          </FormField>

          <FormField>
            <FieldLabel>Personality Type</FieldLabel>
            <FieldSelect
              value={formData.personalityType}
              onChange={(e) => handleInputChange('personalityType', e.target.value)}
            >
              <option value="">Select your personality type</option>
              {PERSONALITY_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
              {PERSONALITY_TYPES.map(type => (
                <option key={`${type}-A`} value={`${type}-A`}>{type}-A (Assertive)</option>
              ))}
              {PERSONALITY_TYPES.map(type => (
                <option key={`${type}-T`} value={`${type}-T`}>{type}-T (Turbulent)</option>
              ))}
            </FieldSelect>
          </FormField>
        </FormSection>

        {/* Communities */}
        <FormSection>
          <SectionTitle>Communities (Request to Join)</SectionTitle>
          <SubText>Search and select communities to request membership. Admin approval required.</SubText>
          
          <FormField>
            <SearchableDropdown ref={dropdownRef}>
              <SearchInput
                value={communitySearch}
                onChange={(e) => setCommunitySearch(e.target.value)}
                onFocus={() => setShowCommunityDropdown(true)}
                placeholder="Type to search communities..."
              />
              
              <DropdownList $show={showCommunityDropdown}>
                {/* Filter communities based on search */}
                {availableCommunities
                  .filter(community => 
                    community.toLowerCase().includes(communitySearch.toLowerCase()) &&
                    !selectedCommunities.includes(community)
                  )
                  .map((community) => (
                    <DropdownItem
                      key={community}
                      onClick={() => {
                        setSelectedCommunities(prev => [...prev, community]);
                        setCommunitySearch('');
                        setShowCommunityDropdown(false);
                      }}
                    >
                      {community}
                    </DropdownItem>
                  ))}
                
                {/* Add new community option if search doesn't match */}
                {communitySearch && 
                 !availableCommunities.some(c => 
                   c.toLowerCase() === communitySearch.toLowerCase()
                 ) && (
                  <AddNewItem
                    onClick={async () => {
                      const newCommunity = communitySearch;
                      try {
                        // Try to create the community in the database
                        const token = localStorage.getItem('token');
                        if (token) {
                          const response = await axios.post(
                            `${API_BASE_URL}/api/v1/communities`,
                            { 
                              name: newCommunity,
                              description: `Community created by user`,
                              category: 'General'
                            },
                            {
                              headers: {
                                'Authorization': `Bearer ${token}`
                              }
                            }
                          );
                          
                          if (response.data.success) {
                            setAvailableCommunities(prev => [...prev, newCommunity]);
                            setSelectedCommunities(prev => [...prev, newCommunity]);
                            setCommunitySearch('');
                            setShowCommunityDropdown(false);
                            alert(`Successfully created community: ${newCommunity}`);
                          }
                        } else {
                          // If not logged in, just add locally
                          setAvailableCommunities(prev => [...prev, newCommunity]);
                          setSelectedCommunities(prev => [...prev, newCommunity]);
                          setCommunitySearch('');
                          setShowCommunityDropdown(false);
                          alert(`Added new community: ${newCommunity} (Login required to save to database)`);
                        }
                      } catch (error: any) {
                        if (error.response?.status === 409) {
                          // Community already exists, just add to selected
                          setSelectedCommunities(prev => [...prev, newCommunity]);
                          setCommunitySearch('');
                          setShowCommunityDropdown(false);
                          alert(`Community "${newCommunity}" already exists. Added to your profile.`);
                        } else {
                          console.error('Failed to create community:', error);
                          // Still add locally even if API fails
                          setAvailableCommunities(prev => [...prev, newCommunity]);
                          setSelectedCommunities(prev => [...prev, newCommunity]);
                          setCommunitySearch('');
                          setShowCommunityDropdown(false);
                          alert(`Added new community locally: ${newCommunity}`);
                        }
                      }
                    }}
                  >
                    + Create "{communitySearch}" (New Community)
                  </AddNewItem>
                )}
                
                {availableCommunities
                  .filter(community => 
                    community.toLowerCase().includes(communitySearch.toLowerCase()) &&
                    !selectedCommunities.includes(community)
                  ).length === 0 && !communitySearch && (
                  <DropdownItem style={{ color: '#999', cursor: 'default' }}>
                    No communities available
                  </DropdownItem>
                )}
              </DropdownList>
            </SearchableDropdown>
            
            {/* Selected communities */}
            {selectedCommunities.length > 0 && (
              <SelectedCommunities>
                {selectedCommunities.map((community) => (
                  <SelectedTag key={community}>
                    {community}
                    <button onClick={() => {
                      setSelectedCommunities(prev => prev.filter(c => c !== community));
                    }}>
                      ×
                    </button>
                  </SelectedTag>
                ))}
              </SelectedCommunities>
            )}
          </FormField>
        </FormSection>

        {/* BerseMukha Events */}
        <FormSection>
          <SectionTitle>BerseMukha Events Attended</SectionTitle>
          <SubText>Select events and friends you made at each</SubText>
          
          <FormField>
            <FieldLabel>Search Events by Date</FieldLabel>
            <SearchableDropdown ref={eventDropdownRef}>
              <SearchInput
                value={eventSearch}
                onChange={(e) => setEventSearch(e.target.value)}
                onFocus={() => setShowEventDropdown(true)}
                placeholder="Search events (e.g., Jan 2024)..."
              />
              <DropdownList $show={showEventDropdown}>
                {allBerseMukhaEvents
                  .filter(event => {
                    const eventLabel = `${event.month} ${event.year}`;
                    return eventLabel.toLowerCase().includes(eventSearch.toLowerCase()) &&
                           !selectedEvents.some(e => e.eventId === event.id);
                  })
                  .slice(0, 10)
                  .map((event) => (
                    <DropdownItem
                      key={event.id}
                      onClick={() => {
                        setSelectedEvents(prev => [...prev, { eventId: event.id, friendsMade: [] }]);
                        setEventSearch('');
                        setShowEventDropdown(false);
                      }}
                    >
                      📅 {event.month} {event.year}
                    </DropdownItem>
                  ))}
                
                {allBerseMukhaEvents
                  .filter(event => {
                    const eventLabel = `${event.month} ${event.year}`;
                    return eventLabel.toLowerCase().includes(eventSearch.toLowerCase()) &&
                           !selectedEvents.some(e => e.eventId === event.id);
                  }).length === 0 && (
                  <DropdownItem style={{ color: '#999', cursor: 'default' }}>
                    No matching events found
                  </DropdownItem>
                )}
              </DropdownList>
            </SearchableDropdown>
          </FormField>
          
          {/* Selected events with friends selection */}
          {selectedEvents.length > 0 && (
            <SelectedEventsContainer>
              {selectedEvents.map((selectedEvent) => {
                const event = allBerseMukhaEvents.find(e => e.id === selectedEvent.eventId);
                if (!event) return null;
                
                return (
                  <EventWithFriends key={selectedEvent.eventId}>
                    <EventHeader>
                      <EventDateLabel>📅 {event.month} {event.year}</EventDateLabel>
                      <RemoveButton onClick={() => {
                        setSelectedEvents(prev => prev.filter(e => e.eventId !== selectedEvent.eventId));
                      }}>×</RemoveButton>
                    </EventHeader>
                    
                    <FriendsSection>
                      <FriendsLabel>Friends made at this event:</FriendsLabel>
                      <FriendsDropdown>
                        <select
                          multiple
                          value={selectedEvent.friendsMade}
                          onChange={(e) => {
                            const selected = Array.from(e.target.selectedOptions, option => option.value);
                            setSelectedEvents(prev => prev.map(ev => 
                              ev.eventId === selectedEvent.eventId 
                                ? { ...ev, friendsMade: selected }
                                : ev
                            ));
                          }}
                          style={{
                            width: '100%',
                            minHeight: '80px',
                            padding: '8px',
                            border: '1px solid #E0E0E0',
                            borderRadius: '8px',
                            fontSize: '12px'
                          }}
                        >
                          {sampleFriends.map((friend) => (
                            <option key={friend} value={friend}>
                              {friend}
                            </option>
                          ))}
                        </select>
                        <FriendsHint>Hold Ctrl/Cmd to select multiple friends</FriendsHint>
                      </FriendsDropdown>
                      
                      {selectedEvent.friendsMade.length > 0 && (
                        <SelectedFriendsList>
                          {selectedEvent.friendsMade.map((friend) => (
                            <FriendTag key={friend}>
                              {friend.split(' - ')[0]}
                              <button onClick={() => {
                                setSelectedEvents(prev => prev.map(ev => 
                                  ev.eventId === selectedEvent.eventId 
                                    ? { ...ev, friendsMade: ev.friendsMade.filter(f => f !== friend) }
                                    : ev
                                ));
                              }}>×</button>
                            </FriendTag>
                          ))}
                        </SelectedFriendsList>
                      )}
                    </FriendsSection>
                  </EventWithFriends>
                );
              })}
            </SelectedEventsContainer>
          )}
        </FormSection>

        {/* Offerings Section */}
        <FormSection>
          <SectionTitle>Services & Offerings</SectionTitle>
          
          {/* BerseGuide */}
          <OfferingSection>
            <OfferingHeader>
              <OfferingToggle
                type="checkbox"
                checked={formData.offerBerseGuide}
                onChange={(e) => handleInputChange('offerBerseGuide', e.target.checked.toString())}
              />
              <OfferingTitle>🗺️ Offer BerseGuide Services (Local Guides)</OfferingTitle>
            </OfferingHeader>
            {formData.offerBerseGuide && (
              <OfferingDetails>
                <FormField>
                  <FieldLabel>Price Range & Payment Options</FieldLabel>
                  <FieldInput
                    value={formData.berseGuidePrice}
                    onChange={(e) => handleInputChange('berseGuidePrice', e.target.value)}
                    placeholder="e.g., RM50-80/day, 500 BersePoints/day, or mix of both"
                  />
                  <SubText>Accept cash, BersePoints, or combination payments</SubText>
                </FormField>
                <FormField>
                  <FieldLabel>Locations (comma separated)</FieldLabel>
                  <FieldInput
                    value={formData.berseGuideLocations.join(', ')}
                    onChange={(e) => {
                      const locations = e.target.value.split(',').map(l => l.trim()).filter(l => l);
                      setFormData(prev => ({ ...prev, berseGuideLocations: locations }));
                    }}
                    placeholder="e.g., KL, Penang, Langkawi"
                  />
                </FormField>
                <FormField>
                  <FieldLabel>Specialties (comma separated)</FieldLabel>
                  <FieldInput
                    value={formData.berseGuideSpecialties.join(', ')}
                    onChange={(e) => {
                      const specialties = e.target.value.split(',').map(s => s.trim()).filter(s => s);
                      setFormData(prev => ({ ...prev, berseGuideSpecialties: specialties }));
                    }}
                    placeholder="e.g., Food Tours, Historical Sites, Hidden Gems, Photography Spots"
                  />
                </FormField>
              </OfferingDetails>
            )}
          </OfferingSection>

          {/* HomeSurf */}
          <OfferingSection>
            <OfferingHeader>
              <OfferingToggle
                type="checkbox"
                checked={formData.offerHomeSurf}
                onChange={(e) => handleInputChange('offerHomeSurf', e.target.checked.toString())}
              />
              <OfferingTitle>🏠 Offer HomeSurf (Accommodation)</OfferingTitle>
            </OfferingHeader>
            {formData.offerHomeSurf && (
              <OfferingDetails>
                <FormField>
                  <FieldLabel>City/Location</FieldLabel>
                  <FieldInput
                    value={formData.homeSurfCity || ''}
                    onChange={(e) => handleInputChange('homeSurfCity', e.target.value)}
                    placeholder="e.g., Kuala Lumpur, Petaling Jaya"
                  />
                </FormField>
                <FormField>
                  <FieldLabel>Maximum Days</FieldLabel>
                  <FieldInput
                    value={formData.homeSurfMaxDays}
                    onChange={(e) => handleInputChange('homeSurfMaxDays', e.target.value)}
                    placeholder="e.g., 3 nights"
                  />
                </FormField>
                <FormField>
                  <FieldLabel>Amenities (comma separated)</FieldLabel>
                  <FieldInput
                    value={formData.homeSurfAmenities.join(', ')}
                    onChange={(e) => {
                      const amenities = e.target.value.split(',').map(a => a.trim()).filter(a => a);
                      setFormData(prev => ({ ...prev, homeSurfAmenities: amenities }));
                    }}
                    placeholder="e.g., WiFi, Kitchen, Private Room, Laundry"
                  />
                </FormField>
                <FormField>
                  <FieldLabel>Additional Notes</FieldLabel>
                  <FieldTextArea
                    value={formData.homeSurfNotes || ''}
                    onChange={(e) => handleInputChange('homeSurfNotes', e.target.value)}
                    placeholder="Any house rules, preferences, or additional information guests should know..."
                    rows={3}
                  />
                </FormField>
              </OfferingDetails>
            )}
          </OfferingSection>

          {/* BerseBuddy - Coming Soon */}
          <OfferingSection>
            <OfferingHeader>
              <OfferingToggle
                type="checkbox"
                checked={false}
                disabled={true}
                style={{ opacity: 0.5, cursor: 'not-allowed' }}
              />
              <OfferingTitle style={{ color: '#999' }}>
                👫 BerseBuddy (Student Buddy) 
                <ComingSoonBadge>Coming Soon</ComingSoonBadge>
              </OfferingTitle>
            </OfferingHeader>
            <SubText style={{ color: '#999', fontSize: '12px' }}>
              Connect with fellow students for companionship and activities
            </SubText>
          </OfferingSection>

          {/* BerseMentor - Coming Soon */}
          <OfferingSection>
            <OfferingHeader>
              <OfferingToggle
                type="checkbox"
                checked={false}
                disabled={true}
                style={{ opacity: 0.5, cursor: 'not-allowed' }}
              />
              <OfferingTitle style={{ color: '#999' }}>
                🎓 BerseMentor (Mentorship) 
                <ComingSoonBadge>Coming Soon</ComingSoonBadge>
              </OfferingTitle>
            </OfferingHeader>
            <SubText style={{ color: '#999', fontSize: '12px' }}>
              Share your expertise and mentor community members
            </SubText>
          </OfferingSection>

          {/* Other Services */}
          <FormField>
            <FieldLabel>Other Services/Freelancing</FieldLabel>
            <FieldTextArea
              value={formData.otherServices}
              onChange={(e) => handleInputChange('otherServices', e.target.value)}
              placeholder="Describe any other services you offer (e.g., Web Development, Graphic Design, Consulting...)"
              rows={3}
            />
          </FormField>
        </FormSection>

        {/* Basic Information */}
        <FormSection>
          <SectionTitle>Contact Information</SectionTitle>
          
          <FormField>
            <FieldLabel>Email Address</FieldLabel>
            <FieldInput
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Enter your email"
            />
          </FormField>

          <FormField>
            <FieldLabel>Phone Number</FieldLabel>
            <FieldInput
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="Enter your phone number"
            />
          </FormField>
        </FormSection>

        {/* Personal Information */}
        <FormSection>
          <SectionTitle>Personal Information</SectionTitle>

          <FormField>
            <FieldLabel>Age</FieldLabel>
            <FieldInput
              type="number"
              value={formData.age}
              onChange={(e) => handleInputChange('age', e.target.value)}
              placeholder="Your age"
              min="18"
              max="100"
            />
          </FormField>

          <FormField>
            <FieldLabel>Languages (comma separated)</FieldLabel>
            <FieldInput
              value={formData.languages.join(', ')}
              onChange={(e) => {
                const langs = e.target.value.split(',').map(l => l.trim()).filter(l => l);
                setFormData(prev => ({ ...prev, languages: langs }));
              }}
              placeholder="e.g., English, Malay, Arabic"
            />
          </FormField>

          <FormField>
            <FieldLabel>Gender</FieldLabel>
            <FieldSelect
              value={formData.gender}
              onChange={(e) => handleInputChange('gender', e.target.value)}
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </FieldSelect>
          </FormField>

          <FormField>
            <FieldLabel>Profession</FieldLabel>
            <FieldInput
              value={formData.profession}
              onChange={(e) => handleInputChange('profession', e.target.value)}
              placeholder="What do you do for work?"
            />
          </FormField>

          <FormField>
            <FieldLabel>Nationality</FieldLabel>
            <FieldInput
              value={formData.nationality}
              onChange={(e) => handleInputChange('nationality', e.target.value)}
              placeholder="Your nationality"
            />
          </FormField>
        </FormSection>

        {/* Social Links */}
        <FormSection>
          <SectionTitle>Social Media (Optional)</SectionTitle>

          <FormField>
            <FieldLabel>Instagram</FieldLabel>
            <FieldInput
              value={formData.instagram}
              onChange={(e) => handleInputChange('instagram', e.target.value)}
              placeholder="@yourusername"
            />
          </FormField>

          <FormField>
            <FieldLabel>LinkedIn</FieldLabel>
            <FieldInput
              value={formData.linkedin}
              onChange={(e) => handleInputChange('linkedin', e.target.value)}
              placeholder="linkedin.com/in/yourprofile"
            />
          </FormField>

          <FormField>
            <FieldLabel>Website</FieldLabel>
            <FieldInput
              value={formData.website}
              onChange={(e) => handleInputChange('website', e.target.value)}
              placeholder="https://yourwebsite.com"
            />
          </FormField>
        </FormSection>

        {/* Trust Chain & Reviews */}
        <FormSection>
          <SectionTitle>Trust Chain & Reviews</SectionTitle>
          <SubText>Build your reputation through connections and feedback</SubText>
          
          <FormField>
            <FieldLabel>Request Feedback From</FieldLabel>
            <FieldInput
              placeholder="Enter email or username to request feedback"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  const input = e.currentTarget;
                  alert(`Feedback request sent to ${input.value}`);
                  input.value = '';
                }
              }}
            />
            <FieldHelperText>Press Enter to send feedback request</FieldHelperText>
          </FormField>

          <FormField>
            <FieldLabel>Your Trust Score</FieldLabel>
            <div style={{
              background: '#F8F9FA',
              padding: '16px',
              borderRadius: '12px',
              display: 'flex',
              justifyContent: 'space-around'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2fce98' }}>4.8</div>
                <div style={{ fontSize: '12px', color: '#666' }}>Rating</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2fce98' }}>23</div>
                <div style={{ fontSize: '12px', color: '#666' }}>Reviews</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2fce98' }}>156</div>
                <div style={{ fontSize: '12px', color: '#666' }}>Connections</div>
              </div>
            </div>
          </FormField>

          <FormField>
            <FieldLabel>Recent Reviews</FieldLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{
                background: 'white',
                border: '1px solid #E0E0E0',
                borderRadius: '8px',
                padding: '12px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <strong style={{ fontSize: '13px' }}>Ahmad Ali</strong>
                  <span style={{ fontSize: '12px', color: '#FFA500' }}>⭐ 5.0</span>
                </div>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                  Met at BerseMukha Dec 2024
                </div>
                <div style={{ fontSize: '13px', fontStyle: 'italic' }}>
                  "Great conversation partner, very knowledgeable!"
                </div>
              </div>
            </div>
          </FormField>
        </FormSection>

        {/* Travel Logbook */}
        <FormSection>
          <SectionTitle>Travel Logbook</SectionTitle>
          <SubText>Track your travels and connections around the world</SubText>
          
          <FormField>
            <FieldLabel>Countries Visited</FieldLabel>
            <FieldInput
              type="number"
              value={formData.countriesVisited || 15}
              onChange={(e) => setFormData(prev => ({ ...prev, countriesVisited: parseInt(e.target.value) }))}
              placeholder="Number of countries"
            />
          </FormField>

          <FormField>
            <FieldLabel>Cities Explored</FieldLabel>
            <FieldInput
              type="number"
              value={formData.citiesExplored || 42}
              onChange={(e) => setFormData(prev => ({ ...prev, citiesExplored: parseInt(e.target.value) }))}
              placeholder="Number of cities"
            />
          </FormField>

          <FormField>
            <FieldLabel>Travel History</FieldLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{
                display: 'flex',
                gap: '8px',
                alignItems: 'center'
              }}>
                <FieldInput
                  placeholder="Country (e.g., Malaysia)"
                  style={{ flex: 1 }}
                />
                <FieldInput
                  placeholder="Cities (e.g., KL, Penang)"
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  style={{
                    padding: '8px 16px',
                    background: '#2fce98',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  Add
                </button>
              </div>
              
              <div style={{
                background: '#F8F9FA',
                borderRadius: '8px',
                padding: '12px'
              }}>
                <div style={{ fontSize: '13px', marginBottom: '8px' }}>
                  <strong>🇲🇾 Malaysia</strong> - KL, Penang, Langkawi (45 friends)
                </div>
                <div style={{ fontSize: '13px', marginBottom: '8px' }}>
                  <strong>🇹🇷 Turkey</strong> - Istanbul, Ankara, Izmir (28 friends)
                </div>
                <div style={{ fontSize: '13px' }}>
                  <strong>🇮🇩 Indonesia</strong> - Jakarta, Bali, Yogyakarta (22 friends)
                </div>
              </div>
            </div>
          </FormField>
        </FormSection>

        {/* Profile Display Name */}
        <FormSection>
          <SectionTitle>Profile Display Settings</SectionTitle>
          <SubText>Customize how your profile appears to others</SubText>
          
          <FormField>
            <FieldLabel>Display Name</FieldLabel>
            <FieldInput
              value={formData.displayName || formData.fullName}
              onChange={(e) => handleInputChange('displayName', e.target.value)}
              placeholder="How you want to be known"
            />
          </FormField>

          <FormField>
            <FieldLabel>Profile Tagline</FieldLabel>
            <FieldInput
              value={formData.tagline || ''}
              onChange={(e) => handleInputChange('tagline', e.target.value)}
              placeholder="A short catchy phrase about you"
              maxLength={60}
            />
            <FieldHelperText>{formData.tagline?.length || 0}/60 characters</FieldHelperText>
          </FormField>

          <FormField>
            <FieldLabel>Profile Visibility</FieldLabel>
            <FieldSelect
              value={formData.visibility || 'public'}
              onChange={(e) => handleInputChange('visibility', e.target.value)}
            >
              <option value="public">Public - Anyone can view</option>
              <option value="friends">Friends Only</option>
              <option value="private">Private - Only you</option>
            </FieldSelect>
          </FormField>
        </FormSection>
      </Content>

      <ImageCropper
        isOpen={showCropper}
        onClose={() => setShowCropper(false)}
        imageSrc={selectedImage || ''}
        onCropComplete={handleCropComplete}
        aspectRatio={1}
        shape="round"
        title="Crop your profile photo"
      />

      <MainNav 
        activeTab="home"
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