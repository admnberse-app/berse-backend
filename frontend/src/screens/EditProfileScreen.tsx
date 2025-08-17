import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { StatusBar } from '../components/StatusBar/StatusBar';
import { MainNav } from '../components/MainNav';
import axios from 'axios';
import { API_BASE_URL } from '../config/services.config';
import { ImageCropper } from '../components/ImageCropper';

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

const ProfileCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const ProfileHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
`;

const ProfileAvatar = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  
  &:hover::after {
    content: '📷';
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const ProfileInfo = styled.div`
  flex: 1;
`;

const FormSection = styled.div`
  background: white;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #2fce98;
  margin: 0 0 16px 0;
`;

const FormField = styled.div`
  margin-bottom: 16px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const FieldLabel = styled.label`
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
`;

const FieldInput = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #E0E0E0;
  border-radius: 8px;
  font-size: 14px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  
  &:focus {
    outline: none;
    border-color: #2fce98;
  }
`;

const FieldTextarea = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 1px solid #E0E0E0;
  border-radius: 8px;
  font-size: 14px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #2fce98;
  }
`;

const FieldSelect = styled.select`
  width: 100%;
  padding: 12px;
  border: 1px solid #E0E0E0;
  border-radius: 8px;
  font-size: 14px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background: white;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #2fce98;
  }
`;

const InterestsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
`;

const InterestInput = styled.input`
  padding: 10px;
  border: 1px solid #E0E0E0;
  border-radius: 8px;
  font-size: 14px;
  text-align: center;
  
  &:focus {
    outline: none;
    border-color: #2fce98;
  }
  
  &::placeholder {
    color: #999;
  }
`;

const CommunityOption = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border: 1px solid #E0E0E0;
  border-radius: 8px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #F8F8F8;
    border-color: #2fce98;
  }
  
  input {
    margin: 0;
  }
`;

const RoleSelect = styled.select`
  width: 100%;
  padding: 12px;
  border: 1px solid #E0E0E0;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #2fce98;
  }
`;

const EventAttendance = styled.div`
  border: 1px solid #E0E0E0;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
`;

const TravelEntry = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
`;

const AddButton = styled.button`
  background: #2fce98;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  
  &:hover {
    background: #27b584;
  }
`;

export const EditProfileScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Image cropper state
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(user?.profilePicture || null);

  // Form state
  const [formData, setFormData] = useState({
    // Basic Info
    profilePicture: user?.profilePicture || '',
    username: user?.username || '',
    fullName: user?.fullName || '',
    shortBio: '', // New field for profession/studies
    
    // Location & Background
    currentLocation: user?.city || 'Kuala Lumpur, Malaysia',
    originallyFrom: '',
    
    // Interests (4 custom fields)
    interests: ['', '', '', ''],
    
    // Bio
    fullBio: user?.bio || '',
    personalityType: '',
    
    // Communities
    communities: [],
    role: 'member',
    
    // Events
    eventsAttended: [],
    
    // Contact Information
    email: user?.email || '',
    phone: user?.phone || '',
    
    // Personal Information
    age: '',
    languages: '',
    gender: user?.gender || '',
    profession: '',
    nationality: user?.nationality || '',
    
    // Social Media
    instagram: user?.instagramHandle || '',
    linkedin: user?.linkedinHandle || '',
    website: '',
    
    // Travel Logbook
    travelHistory: []
  });

  const [eventsSearch, setEventsSearch] = useState('');
  const [availableProfiles, setAvailableProfiles] = useState<any[]>([]);

  // Handle file upload
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

  // Handle crop complete
  const handleCropComplete = async (croppedImage: string) => {
    setProfileImage(croppedImage);
    setSelectedImage(null);
    setShowCropper(false);
    
    // Upload to server
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await axios.post(
          `${API_BASE_URL}/api/v1/users/upload-avatar`,
          { image: croppedImage },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (response.data.success) {
          // Update local state
          setFormData(prev => ({ ...prev, profilePicture: response.data.data.profilePicture }));
          // Update auth context
          if (user) {
            updateUser({ ...user, profilePicture: response.data.data.profilePicture });
          }
        }
      }
    } catch (error) {
      console.error('Failed to upload profile picture:', error);
    }
  };

  // Handle input changes
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle interest change
  const handleInterestChange = (index: number, value: string) => {
    const newInterests = [...formData.interests];
    // Limit to one word
    const oneWord = value.split(' ')[0];
    newInterests[index] = oneWord;
    setFormData(prev => ({ ...prev, interests: newInterests }));
  };

  // Handle community selection
  const handleCommunityToggle = (community: string) => {
    setFormData(prev => ({
      ...prev,
      communities: prev.communities.includes(community)
        ? prev.communities.filter(c => c !== community)
        : [...prev.communities, community]
    }));
  };

  // Add travel entry
  const addTravelEntry = (country: string, cities: string, date: string, friends: string[]) => {
    setFormData(prev => ({
      ...prev,
      travelHistory: [...prev.travelHistory, { country, cities, date, friends }]
    }));
  };

  // Save profile
  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to save your profile');
        return;
      }

      // Prepare data for API
      const profileData = {
        ...formData,
        topInterests: formData.interests.filter(i => i !== ''),
      };

      const response = await axios.put(
        `${API_BASE_URL}/api/v1/users/profile`,
        profileData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        // Update auth context
        if (user) {
          updateUser({ ...user, ...profileData });
        }
        
        // Store in localStorage for persistence
        localStorage.setItem('userProfile', JSON.stringify(profileData));
        
        alert('Profile updated successfully!');
        navigate('/profile');
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
      alert('Failed to save profile. Please try again.');
    }
  };

  // Load saved profile data
  useEffect(() => {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        setFormData(prev => ({ ...prev, ...parsed }));
        if (parsed.profilePicture) {
          setProfileImage(parsed.profilePicture);
        }
      } catch (e) {
        console.error('Failed to load saved profile:', e);
      }
    }
  }, []);

  return (
    <Container>
      <StatusBar />
      
      <Header>
        <BackButton onClick={() => navigate(-1)}>
          ← Back
        </BackButton>
        <HeaderTitle>Edit Profile</HeaderTitle>
        <SaveButton onClick={handleSave}>Save</SaveButton>
      </Header>

      <Content>
        {/* Profile Photo & Basic Info */}
        <ProfileCard>
          <ProfileHeader>
            <ProfileAvatar
              onClick={() => fileInputRef.current?.click()}
              style={{
                background: profileImage 
                  ? `url(${profileImage}) center/cover no-repeat`
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              }}
            >
              {!profileImage && '👤'}
            </ProfileAvatar>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <ProfileInfo>
              <FieldInput
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                placeholder="Username"
                style={{ marginBottom: '8px' }}
              />
              <FieldInput
                value={formData.shortBio}
                onChange={(e) => handleInputChange('shortBio', e.target.value)}
                placeholder="Profession/Studies (e.g., Architect | Student)"
                style={{ fontSize: '13px' }}
              />
            </ProfileInfo>
          </ProfileHeader>
        </ProfileCard>

        {/* Location & Background */}
        <FormSection>
          <SectionTitle>📍 Location & Background</SectionTitle>
          <FormField>
            <FieldLabel>Current Location</FieldLabel>
            <FieldInput
              value={formData.currentLocation}
              onChange={(e) => handleInputChange('currentLocation', e.target.value)}
              placeholder="City, Country"
            />
          </FormField>
          <FormField>
            <FieldLabel>Originally From</FieldLabel>
            <FieldInput
              value={formData.originallyFrom}
              onChange={(e) => handleInputChange('originallyFrom', e.target.value)}
              placeholder="City, Country"
            />
          </FormField>
        </FormSection>

        {/* Top 4 Interests */}
        <FormSection>
          <SectionTitle>⭐ Top 4 Interests</SectionTitle>
          <p style={{ fontSize: '12px', color: '#666', marginBottom: '12px' }}>
            Enter your top interests (1 word each)
          </p>
          <InterestsGrid>
            {[0, 1, 2, 3].map(index => (
              <InterestInput
                key={index}
                value={formData.interests[index]}
                onChange={(e) => handleInterestChange(index, e.target.value)}
                placeholder={`Interest ${index + 1}`}
                maxLength={20}
              />
            ))}
          </InterestsGrid>
        </FormSection>

        {/* Full Bio */}
        <FormSection>
          <SectionTitle>✍️ About Me</SectionTitle>
          <FormField>
            <FieldTextarea
              value={formData.fullBio}
              onChange={(e) => handleInputChange('fullBio', e.target.value)}
              placeholder="Tell us about yourself, your passions, and what you're looking for in the community..."
              rows={4}
              maxLength={500}
            />
          </FormField>
          <FormField>
            <FieldLabel>Personality Type (Optional)</FieldLabel>
            <FieldSelect
              value={formData.personalityType}
              onChange={(e) => handleInputChange('personalityType', e.target.value)}
            >
              <option value="">Select personality type</option>
              {['INTJ', 'INTP', 'ENTJ', 'ENTP', 'INFJ', 'INFP', 'ENFJ', 'ENFP', 
                'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP'].map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </FieldSelect>
          </FormField>
        </FormSection>

        {/* Communities */}
        <FormSection>
          <SectionTitle>👥 Communities</SectionTitle>
          <p style={{ fontSize: '12px', color: '#666', marginBottom: '12px' }}>
            Request to join communities (Admin approval required)
          </p>
          <CommunityOption>
            <input
              type="checkbox"
              checked={formData.communities.includes("Ahl 'Umran Network")}
              onChange={() => handleCommunityToggle("Ahl 'Umran Network")}
            />
            <span>Ahl 'Umran Network</span>
          </CommunityOption>
          <CommunityOption>
            <input
              type="checkbox"
              checked={formData.communities.includes('PeaceMeal MY')}
              onChange={() => handleCommunityToggle('PeaceMeal MY')}
            />
            <span>PeaceMeal MY</span>
          </CommunityOption>
          
          <FormField style={{ marginTop: '16px' }}>
            <FieldLabel>Your Role</FieldLabel>
            <RoleSelect
              value={formData.role}
              onChange={(e) => handleInputChange('role', e.target.value)}
            >
              <option value="member">Member</option>
              <option value="committee">Committee</option>
              <option value="moderator">Moderator</option>
              <option value="volunteer">Volunteer</option>
            </RoleSelect>
          </FormField>
        </FormSection>

        {/* BerseMukha Events */}
        <FormSection>
          <SectionTitle>🎉 BerseMukha Events Attended</SectionTitle>
          <p style={{ fontSize: '12px', color: '#666', marginBottom: '12px' }}>
            Search for profiles you met at events
          </p>
          <FormField>
            <FieldInput
              value={eventsSearch}
              onChange={(e) => setEventsSearch(e.target.value)}
              placeholder="Search profiles by name..."
            />
          </FormField>
          {formData.eventsAttended.length === 0 && (
            <p style={{ fontSize: '13px', color: '#999', textAlign: 'center', padding: '20px' }}>
              No events added yet
            </p>
          )}
        </FormSection>

        {/* Contact Information */}
        <FormSection>
          <SectionTitle>📞 Contact Information</SectionTitle>
          <FormField>
            <FieldLabel>Email Address</FieldLabel>
            <FieldInput
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="your@email.com"
            />
          </FormField>
          <FormField>
            <FieldLabel>Phone Number</FieldLabel>
            <FieldInput
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="+60123456789"
            />
          </FormField>
        </FormSection>

        {/* Personal Information */}
        <FormSection>
          <SectionTitle>👤 Personal Information</SectionTitle>
          <FormField>
            <FieldLabel>Age</FieldLabel>
            <FieldInput
              type="number"
              value={formData.age}
              onChange={(e) => handleInputChange('age', e.target.value)}
              placeholder="28"
            />
          </FormField>
          <FormField>
            <FieldLabel>Languages (comma separated)</FieldLabel>
            <FieldInput
              value={formData.languages}
              onChange={(e) => handleInputChange('languages', e.target.value)}
              placeholder="English, Malay, Arabic"
            />
          </FormField>
          <FormField>
            <FieldLabel>Gender</FieldLabel>
            <FieldSelect
              value={formData.gender}
              onChange={(e) => handleInputChange('gender', e.target.value)}
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </FieldSelect>
          </FormField>
          <FormField>
            <FieldLabel>Profession</FieldLabel>
            <FieldInput
              value={formData.profession}
              onChange={(e) => handleInputChange('profession', e.target.value)}
              placeholder="Architect & Photographer"
            />
          </FormField>
          <FormField>
            <FieldLabel>Nationality</FieldLabel>
            <FieldInput
              value={formData.nationality}
              onChange={(e) => handleInputChange('nationality', e.target.value)}
              placeholder="Malaysian"
            />
          </FormField>
        </FormSection>

        {/* Social Media */}
        <FormSection>
          <SectionTitle>📱 Social Media (Optional)</SectionTitle>
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
              placeholder="yourwebsite.com"
            />
          </FormField>
        </FormSection>

        {/* Travel Logbook */}
        <FormSection>
          <SectionTitle>✈️ Travel Logbook</SectionTitle>
          <p style={{ fontSize: '12px', color: '#666', marginBottom: '12px' }}>
            Track your travels and connections around the world
          </p>
          {formData.travelHistory.length === 0 && (
            <p style={{ fontSize: '13px', color: '#999', textAlign: 'center', padding: '20px' }}>
              No travel history added yet
            </p>
          )}
          <AddButton onClick={() => {
            // This would open a modal to add travel entry
            console.log('Add travel entry');
          }}>
            + Add Travel Entry
          </AddButton>
        </FormSection>
      </Content>

      {/* Image Cropper Modal */}
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