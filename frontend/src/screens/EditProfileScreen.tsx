import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { StatusBar } from '../components/StatusBar/StatusBar';
import { MainNav } from '../components/MainNav';
import axios from 'axios';
import { API_BASE_URL } from '../config/services.config';
import { ImageCropper } from '../components/ImageCropper';
import { makeAuthenticatedRequest, getAuthToken, clearAuthTokens } from '../utils/authUtils';
import { TravelLogbookModal } from '../components/TravelLogbookModal';
import { SearchableCommunities } from '../components/SearchableCommunities';
import { EventsAttended } from '../components/EventsAttended';

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

const OfferingSection = styled.div`
  margin-bottom: 24px;
  padding: 16px;
  background: #f9f9f9;
  border-radius: 12px;
`;

const OfferingToggle = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const ToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 48px;
  height: 24px;
  
  input {
    opacity: 0;
    width: 0;
    height: 0;
  }
  
  span {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    transition: .4s;
    border-radius: 34px;
    
    &:before {
      position: absolute;
      content: "";
      height: 16px;
      width: 16px;
      left: 4px;
      bottom: 4px;
      background-color: white;
      transition: .4s;
      border-radius: 50%;
    }
  }
  
  input:checked + span {
    background-color: #2fce98;
  }
  
  input:checked + span:before {
    transform: translateX(24px);
  }
`;

const ChipContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
`;

const Chip = styled.div`
  padding: 6px 12px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 16px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  
  button {
    background: none;
    border: none;
    color: #999;
    cursor: pointer;
    padding: 0;
    margin-left: 4px;
    font-size: 14px;
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

  // Modal states
  const [showTravelModal, setShowTravelModal] = useState(false);

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
    communities: [] as any[],
    role: 'member',
    
    // Events
    eventsAttended: [] as any[],
    
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
    travelHistory: [] as any[],
    
    // Offerings
    offerings: {
      berseGuide: {
        enabled: false,
        price: '',
        duration: 'Half day',
        locations: [] as string[],
        specialties: [] as string[]
      },
      homeSurf: {
        enabled: false,
        maxDays: 3,
        amenities: [] as string[]
      },
      berseBuddy: {
        enabled: false,
        activities: [] as string[],
        availability: 'Weekends'
      },
      berseMentor: {
        enabled: false,
        expertise: [] as string[],
        rate: '',
        format: [] as string[]
      }
    }
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
      const token = localStorage.getItem('bersemuka_token') || localStorage.getItem('auth_token');
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

  // Handle community selection - removed as now handled by SearchableCommunities component

  // Add travel entry
  const addTravelEntry = (entry: any) => {
    setFormData(prev => ({
      ...prev,
      travelHistory: [...prev.travelHistory, entry]
    }));
  };

  // Save profile
  const handleSave = async () => {
    try {
      // Check if user is authenticated
      const token = getAuthToken();
      if (!token) {
        alert('Your session has expired. Please login again.');
        navigate('/login');
        return;
      }

      // Prepare data for API
      const profileData = {
        ...formData,
        topInterests: formData.interests.filter(i => i !== ''),
        dateOfBirth: formData.dateOfBirth || user?.dateOfBirth,
      };

      console.log('Saving profile data:', profileData);
      
      // Use the authenticated request helper that handles token refresh
      const response = await makeAuthenticatedRequest(
        'PUT',
        '/api/v1/users/profile',
        profileData
      );

      console.log('Profile update response:', response.data);
      
      if (response.data.success) {
        // Update auth context with the returned data
        if (user && response.data.data) {
          updateUser({ ...user, ...response.data.data });
        }
        
        // Store in localStorage for persistence
        localStorage.setItem('userProfile', JSON.stringify(response.data.data || profileData));
        
        alert('Profile updated successfully!');
        navigate('/profile');
      } else {
        console.error('Profile update failed:', response.data);
        alert(response.data.message || 'Failed to update profile');
      }
    } catch (error: any) {
      console.error('Failed to save profile:', error);
      
      // Handle specific error cases
      if (error.message?.includes('Session expired') || error.message?.includes('Please login')) {
        clearAuthTokens();
        alert(error.message);
        navigate('/login');
      } else if (error.response?.status === 401) {
        clearAuthTokens();
        alert('Your session has expired. Please login again.');
        navigate('/login');
      } else if (error.response) {
        console.error('Error response:', error.response.data);
        alert(error.response.data?.message || 'Failed to save profile. Please try again.');
      } else {
        alert('Failed to save profile. Please check your connection and try again.');
      }
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
            Search and request to join communities (Admin approval required)
          </p>
          <SearchableCommunities
            selectedCommunities={formData.communities}
            onChange={(communities) => handleInputChange('communities', communities)}
          />
          
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

        {/* Events Attended */}
        <FormSection>
          <SectionTitle>🎉 Events Attended</SectionTitle>
          <p style={{ fontSize: '12px', color: '#666', marginBottom: '12px' }}>
            Search events from all categories (sports, socials, volunteers, etc.) and add people you met
          </p>
          <EventsAttended
            selectedEvents={formData.eventsAttended}
            onChange={(events) => handleInputChange('eventsAttended', events)}
          />
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
          
          {formData.travelHistory.length > 0 ? (
            <div style={{ marginBottom: '12px' }}>
              {formData.travelHistory.map((entry, index) => (
                <TravelEntry key={index}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '14px' }}>
                      {entry.country}
                    </div>
                    {entry.cities && (
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {entry.cities}
                      </div>
                    )}
                    <div style={{ fontSize: '12px', color: '#999' }}>
                      {entry.date}
                    </div>
                    {entry.peopleMet?.length > 0 && (
                      <div style={{ fontSize: '12px', color: '#2fce98', marginTop: '4px' }}>
                        Met {entry.peopleMet.length} {entry.peopleMet.length === 1 ? 'person' : 'people'}
                      </div>
                    )}
                  </div>
                  <button
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#DC143C',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        travelHistory: prev.travelHistory.filter((_, i) => i !== index)
                      }));
                    }}
                  >
                    Remove
                  </button>
                </TravelEntry>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: '13px', color: '#999', textAlign: 'center', padding: '20px' }}>
              No travel history added yet
            </p>
          )}
          
          <AddButton onClick={() => setShowTravelModal(true)}>
            + Add Travel Entry
          </AddButton>
        </FormSection>

        {/* Offerings Section */}
        <FormSection>
          <SectionTitle>💼 My Offerings</SectionTitle>
          <p style={{ fontSize: '12px', color: '#666', marginBottom: '16px' }}>
            Share your skills and services with the community
          </p>

          {/* BerseGuide */}
          <OfferingSection>
            <OfferingToggle>
              <div>
                <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
                  🗺️ BerseGuide
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  Offer local guide services
                </div>
              </div>
              <ToggleSwitch>
                <input
                  type="checkbox"
                  checked={formData.offerings.berseGuide.enabled}
                  onChange={(e) => handleInputChange('offerings', {
                    ...formData.offerings,
                    berseGuide: { ...formData.offerings.berseGuide, enabled: e.target.checked }
                  })}
                />
                <span></span>
              </ToggleSwitch>
            </OfferingToggle>
            
            {formData.offerings.berseGuide.enabled && (
              <div>
                <FormField>
                  <FieldLabel>Price</FieldLabel>
                  <FieldInput
                    value={formData.offerings.berseGuide.price}
                    onChange={(e) => handleInputChange('offerings', {
                      ...formData.offerings,
                      berseGuide: { ...formData.offerings.berseGuide, price: e.target.value }
                    })}
                    placeholder="e.g., RM50-80/day or skill trade"
                  />
                </FormField>
                
                <FormField>
                  <FieldLabel>Duration</FieldLabel>
                  <FieldSelect
                    value={formData.offerings.berseGuide.duration}
                    onChange={(e) => handleInputChange('offerings', {
                      ...formData.offerings,
                      berseGuide: { ...formData.offerings.berseGuide, duration: e.target.value }
                    })}
                  >
                    <option value="Half day">Half day</option>
                    <option value="Full day">Full day</option>
                    <option value="Multiple days">Multiple days</option>
                  </FieldSelect>
                </FormField>
                
                <FormField>
                  <FieldLabel>Locations (press Enter to add)</FieldLabel>
                  <FieldInput
                    placeholder="e.g., KL, Penang, Langkawi"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const value = (e.target as HTMLInputElement).value.trim();
                        if (value) {
                          handleInputChange('offerings', {
                            ...formData.offerings,
                            berseGuide: {
                              ...formData.offerings.berseGuide,
                              locations: [...formData.offerings.berseGuide.locations, value]
                            }
                          });
                          (e.target as HTMLInputElement).value = '';
                        }
                      }
                    }}
                  />
                  <ChipContainer>
                    {formData.offerings.berseGuide.locations.map((loc, i) => (
                      <Chip key={i}>
                        {loc}
                        <button onClick={() => {
                          handleInputChange('offerings', {
                            ...formData.offerings,
                            berseGuide: {
                              ...formData.offerings.berseGuide,
                              locations: formData.offerings.berseGuide.locations.filter((_, idx) => idx !== i)
                            }
                          });
                        }}>×</button>
                      </Chip>
                    ))}
                  </ChipContainer>
                </FormField>
              </div>
            )}
          </OfferingSection>

          {/* HomeSurf */}
          <OfferingSection>
            <OfferingToggle>
              <div>
                <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
                  🏠 HomeSurf
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  Host travelers at your place
                </div>
              </div>
              <ToggleSwitch>
                <input
                  type="checkbox"
                  checked={formData.offerings.homeSurf.enabled}
                  onChange={(e) => handleInputChange('offerings', {
                    ...formData.offerings,
                    homeSurf: { ...formData.offerings.homeSurf, enabled: e.target.checked }
                  })}
                />
                <span></span>
              </ToggleSwitch>
            </OfferingToggle>
            
            {formData.offerings.homeSurf.enabled && (
              <div>
                <FormField>
                  <FieldLabel>Max Days</FieldLabel>
                  <FieldInput
                    type="number"
                    value={formData.offerings.homeSurf.maxDays}
                    onChange={(e) => handleInputChange('offerings', {
                      ...formData.offerings,
                      homeSurf: { ...formData.offerings.homeSurf, maxDays: parseInt(e.target.value) }
                    })}
                    min="1"
                    max="30"
                  />
                </FormField>
                
                <FormField>
                  <FieldLabel>Amenities (press Enter to add)</FieldLabel>
                  <FieldInput
                    placeholder="e.g., WiFi, Kitchen, Private Room"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const value = (e.target as HTMLInputElement).value.trim();
                        if (value) {
                          handleInputChange('offerings', {
                            ...formData.offerings,
                            homeSurf: {
                              ...formData.offerings.homeSurf,
                              amenities: [...formData.offerings.homeSurf.amenities, value]
                            }
                          });
                          (e.target as HTMLInputElement).value = '';
                        }
                      }
                    }}
                  />
                  <ChipContainer>
                    {formData.offerings.homeSurf.amenities.map((amenity, i) => (
                      <Chip key={i}>
                        {amenity}
                        <button onClick={() => {
                          handleInputChange('offerings', {
                            ...formData.offerings,
                            homeSurf: {
                              ...formData.offerings.homeSurf,
                              amenities: formData.offerings.homeSurf.amenities.filter((_, idx) => idx !== i)
                            }
                          });
                        }}>×</button>
                      </Chip>
                    ))}
                  </ChipContainer>
                </FormField>
              </div>
            )}
          </OfferingSection>

          {/* BerseBuddy */}
          <OfferingSection>
            <OfferingToggle>
              <div>
                <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
                  👫 BerseBuddy
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  Be a local friend and companion
                </div>
              </div>
              <ToggleSwitch>
                <input
                  type="checkbox"
                  checked={formData.offerings.berseBuddy.enabled}
                  onChange={(e) => handleInputChange('offerings', {
                    ...formData.offerings,
                    berseBuddy: { ...formData.offerings.berseBuddy, enabled: e.target.checked }
                  })}
                />
                <span></span>
              </ToggleSwitch>
            </OfferingToggle>
            
            {formData.offerings.berseBuddy.enabled && (
              <div>
                <FormField>
                  <FieldLabel>Availability</FieldLabel>
                  <FieldSelect
                    value={formData.offerings.berseBuddy.availability}
                    onChange={(e) => handleInputChange('offerings', {
                      ...formData.offerings,
                      berseBuddy: { ...formData.offerings.berseBuddy, availability: e.target.value }
                    })}
                  >
                    <option value="Weekends">Weekends</option>
                    <option value="Weekdays">Weekdays</option>
                    <option value="Evenings">Evenings</option>
                    <option value="Flexible">Flexible</option>
                  </FieldSelect>
                </FormField>
                
                <FormField>
                  <FieldLabel>Activities (press Enter to add)</FieldLabel>
                  <FieldInput
                    placeholder="e.g., Coffee Meetups, Weekend Trips"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const value = (e.target as HTMLInputElement).value.trim();
                        if (value) {
                          handleInputChange('offerings', {
                            ...formData.offerings,
                            berseBuddy: {
                              ...formData.offerings.berseBuddy,
                              activities: [...formData.offerings.berseBuddy.activities, value]
                            }
                          });
                          (e.target as HTMLInputElement).value = '';
                        }
                      }
                    }}
                  />
                  <ChipContainer>
                    {formData.offerings.berseBuddy.activities.map((activity, i) => (
                      <Chip key={i}>
                        {activity}
                        <button onClick={() => {
                          handleInputChange('offerings', {
                            ...formData.offerings,
                            berseBuddy: {
                              ...formData.offerings.berseBuddy,
                              activities: formData.offerings.berseBuddy.activities.filter((_, idx) => idx !== i)
                            }
                          });
                        }}>×</button>
                      </Chip>
                    ))}
                  </ChipContainer>
                </FormField>
              </div>
            )}
          </OfferingSection>

          {/* BerseMentor */}
          <OfferingSection>
            <OfferingToggle>
              <div>
                <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
                  🎓 BerseMentor
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  Share your expertise as a mentor
                </div>
              </div>
              <ToggleSwitch>
                <input
                  type="checkbox"
                  checked={formData.offerings.berseMentor.enabled}
                  onChange={(e) => handleInputChange('offerings', {
                    ...formData.offerings,
                    berseMentor: { ...formData.offerings.berseMentor, enabled: e.target.checked }
                  })}
                />
                <span></span>
              </ToggleSwitch>
            </OfferingToggle>
            
            {formData.offerings.berseMentor.enabled && (
              <div>
                <FormField>
                  <FieldLabel>Rate</FieldLabel>
                  <FieldInput
                    value={formData.offerings.berseMentor.rate}
                    onChange={(e) => handleInputChange('offerings', {
                      ...formData.offerings,
                      berseMentor: { ...formData.offerings.berseMentor, rate: e.target.value }
                    })}
                    placeholder="e.g., 100 BersePoints/hour or RM50/session"
                  />
                </FormField>
                
                <FormField>
                  <FieldLabel>Expertise (press Enter to add)</FieldLabel>
                  <FieldInput
                    placeholder="e.g., Architecture, Photography"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const value = (e.target as HTMLInputElement).value.trim();
                        if (value) {
                          handleInputChange('offerings', {
                            ...formData.offerings,
                            berseMentor: {
                              ...formData.offerings.berseMentor,
                              expertise: [...formData.offerings.berseMentor.expertise, value]
                            }
                          });
                          (e.target as HTMLInputElement).value = '';
                        }
                      }
                    }}
                  />
                  <ChipContainer>
                    {formData.offerings.berseMentor.expertise.map((exp, i) => (
                      <Chip key={i}>
                        {exp}
                        <button onClick={() => {
                          handleInputChange('offerings', {
                            ...formData.offerings,
                            berseMentor: {
                              ...formData.offerings.berseMentor,
                              expertise: formData.offerings.berseMentor.expertise.filter((_, idx) => idx !== i)
                            }
                          });
                        }}>×</button>
                      </Chip>
                    ))}
                  </ChipContainer>
                </FormField>
              </div>
            )}
          </OfferingSection>
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
      
      {/* Travel Logbook Modal */}
      <TravelLogbookModal
        isOpen={showTravelModal}
        onClose={() => setShowTravelModal(false)}
        onAdd={addTravelEntry}
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