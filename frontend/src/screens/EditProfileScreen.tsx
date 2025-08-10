import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { StatusBar } from '../components/StatusBar/StatusBar';
import { MainNav } from '../components/MainNav';

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
  color: #2D5F4F;
`;

const SaveButton = styled.button`
  background: none;
  border: none;
  color: #2D5F4F;
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
  color: #2D5F4F;
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

export const EditProfileScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    ageRange: '',
    area: '',
    gender: '',
    bio: '',
    profession: '',
    nationality: '',
    instagram: '',
    linkedin: '',
    twitter: '',
    website: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePhotoChange = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('Selected file:', file);
    }
  };

  const handleSave = async () => {
    try {
      console.log('Saving profile:', formData);
      alert('Profile updated successfully!');
      navigate('/profile');
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
                background: 'linear-gradient(135deg, #2D5F4F 0%, #4A8B7C 100%)'
              }}
              onClick={handlePhotoChange}
            >
              {user?.fullName ? user.fullName.split(' ').map(n => n[0]).join('') : 'ZA'}
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
            <FieldLabel>Age Range</FieldLabel>
            <FieldSelect
              value={formData.ageRange}
              onChange={(e) => handleInputChange('ageRange', e.target.value)}
            >
              <option value="">Select your age range</option>
              <option value="Below 20">Below 20</option>
              <option value="20-25">20-25</option>
              <option value="25-30">25-30</option>
              <option value="31-40">31-40</option>
              <option value="41-50">41-50</option>
              <option value="Above 50">Above 50</option>
            </FieldSelect>
          </FormField>

          <FormField>
            <FieldLabel>Location</FieldLabel>
            <FieldSelect
              value={formData.area}
              onChange={(e) => handleInputChange('area', e.target.value)}
            >
              <option value="">Select your area</option>
              <option value="Kuala Lumpur">Kuala Lumpur</option>
              <option value="Selangor">Selangor</option>
              <option value="Penang">Penang</option>
              <option value="Johor">Johor</option>
              <option value="Other">Other</option>
            </FieldSelect>
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
      </Content>

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