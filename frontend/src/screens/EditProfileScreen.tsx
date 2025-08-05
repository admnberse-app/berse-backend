import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { StatusBar } from '../components/StatusBar/StatusBar';
import { BottomNav } from '../components/BottomNav';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #F5F3EF;
  max-width: 393px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background-color: #F5F3EF;
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
  padding: 0 20px 100px 20px;
  overflow-y: auto;
`;

const ProfileImageSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 32px;
`;

const ProfileImageContainer = styled.div`
  position: relative;
  margin-bottom: 16px;
`;

const ProfileImage = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 60px;
  background: linear-gradient(45deg, #2D5F4F, #4A90A4);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 36px;
  font-weight: bold;
  position: relative;
  overflow: hidden;
`;

const ProfileImageInput = styled.input`
  display: none;
`;

const ChangePhotoButton = styled.button`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 36px;
  height: 36px;
  border-radius: 18px;
  background-color: #2D5F4F;
  border: 3px solid white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 16px;
  color: white;
`;

const ChangePhotoText = styled.button`
  background: none;
  border: none;
  color: #2D5F4F;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
`;

const FormSection = styled.div`
  background: white;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 16px 0;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #E5E5E5;
  border-radius: 8px;
  font-size: 14px;
  color: #333;
  background: #F8F9FA;
  
  &:focus {
    outline: none;
    border-color: #2D5F4F;
    background: white;
  }
  
  &::placeholder {
    color: #999;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #E5E5E5;
  border-radius: 8px;
  font-size: 14px;
  color: #333;
  background: #F8F9FA;
  min-height: 100px;
  resize: vertical;
  font-family: inherit;
  
  &:focus {
    outline: none;
    border-color: #2D5F4F;
    background: white;
  }
  
  &::placeholder {
    color: #999;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #E5E5E5;
  border-radius: 8px;
  font-size: 14px;
  color: #333;
  background: #F8F9FA;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #2D5F4F;
    background: white;
  }
`;

const InterestsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
`;

const InterestTag = styled.div<{ selected: boolean }>`
  padding: 8px 12px;
  border-radius: 20px;
  border: 1px solid ${({ selected }) => selected ? '#2D5F4F' : '#E5E5E5'};
  background-color: ${({ selected }) => selected ? '#2D5F4F' : 'white'};
  color: ${({ selected }) => selected ? 'white' : '#666'};
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #2D5F4F;
  }
`;

const SocialLinksContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SocialLinkRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const SocialIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background-color: #F0F0F0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
`;

const SocialInput = styled(Input)`
  flex: 1;
`;

const SaveChangesButton = styled.button`
  width: 100%;
  background-color: #2D5F4F;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 16px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 24px;
  
  &:hover {
    background-color: #1F4A3A;
  }
`;

const CharacterCount = styled.div`
  font-size: 12px;
  color: #999;
  text-align: right;
  margin-top: 4px;
`;

export const EditProfileScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Debug: Log when component loads
  useEffect(() => {
    console.log('EditProfileScreen loaded successfully');
  }, []);

  // Form state
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    ageRange: '',
    area: '',
    firstTimeEvent: '',
    whyJoinBerseMuka: '',
    profession: '',
    nationality: '',
    howConnect: '',
    howKnowBerseMuka: '',
    gender: '',
    bio: '',
    instagram: '',
    linkedin: '',
    twitter: '',
    website: ''
  });

  const [selectedInterests, setSelectedInterests] = useState([
    'Design', 'Coffee', 'Travel', 'Reading', 'Photography'
  ]);

  const availableInterests = [
    'Design', 'Coffee', 'Travel', 'Reading', 'Photography', 'Technology',
    'Sports', 'Music', 'Art', 'Cooking', 'Fitness', 'Movies', 'Gaming',
    'Nature', 'Fashion', 'Volunteer Work', 'Learning', 'Networking'
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleInterestToggle = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handlePhotoChange = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Handle file upload logic here
      console.log('Selected file:', file);
    }
  };

  const handleSave = async () => {
    try {
      // API call to save profile changes
      console.log('Saving profile:', { ...formData, interests: selectedInterests });
      
      // Show success message
      alert('Profile updated successfully!');
      
      // Navigate back to profile screen
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
        <ProfileImageSection>
          <ProfileImageContainer>
            <ProfileImage>
              {user?.fullName ? user.fullName.split(' ').map(n => n[0]).join('') : 'ZA'}
              <ChangePhotoButton onClick={handlePhotoChange}>
                📷
              </ChangePhotoButton>
            </ProfileImage>
            <ProfileImageInput
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
          </ProfileImageContainer>
          <ChangePhotoText onClick={handlePhotoChange}>
            Change Profile Photo
          </ChangePhotoText>
        </ProfileImageSection>

        <FormSection>
          <SectionTitle>Basic Information</SectionTitle>
          
          <FormGroup>
            <Label>Full Name</Label>
            <Input
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              placeholder="Enter your full name"
            />
          </FormGroup>

          <FormGroup>
            <Label>Email Address</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Enter your email"
            />
          </FormGroup>

          <FormGroup>
            <Label>Phone Number</Label>
            <Input
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="Enter your phone number"
            />
          </FormGroup>

          <FormGroup>
            <Label>Age Range</Label>
            <Select
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
            </Select>
          </FormGroup>

          <FormGroup>
            <Label>Which area do you come from?</Label>
            <Select
              value={formData.area}
              onChange={(e) => handleInputChange('area', e.target.value)}
            >
              <option value="">Select your area</option>
              <option value="Damansara">Damansara</option>
              <option value="Ampang">Ampang</option>
              <option value="Shah Alam">Shah Alam</option>
              <option value="Bangi">Bangi</option>
              <option value="Other">Other</option>
            </Select>
          </FormGroup>

          <FormGroup>
            <Label>Gender</Label>
            <Select
              value={formData.gender}
              onChange={(e) => handleInputChange('gender', e.target.value)}
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </Select>
          </FormGroup>
        </FormSection>

        <FormSection>
          <SectionTitle>BerseMuka Profile</SectionTitle>
          
          <FormGroup>
            <Label>First time attending this event?</Label>
            <Select
              value={formData.firstTimeEvent}
              onChange={(e) => handleInputChange('firstTimeEvent', e.target.value)}
            >
              <option value="">Select an option</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </Select>
          </FormGroup>

          <FormGroup>
            <Label>What made you want to join BerseMuka?</Label>
            <TextArea
              value={formData.whyJoinBerseMuka}
              onChange={(e) => handleInputChange('whyJoinBerseMuka', e.target.value)}
              placeholder="Tell us what motivated you to join BerseMuka..."
              maxLength={300}
            />
            <CharacterCount>{formData.whyJoinBerseMuka.length}/300</CharacterCount>
          </FormGroup>

          <FormGroup>
            <Label>Current Profession/Occupation/Studies</Label>
            <Input
              value={formData.profession}
              onChange={(e) => handleInputChange('profession', e.target.value)}
              placeholder="e.g., Software Engineer, Student, Marketing Manager"
            />
          </FormGroup>

          <FormGroup>
            <Label>Nationality</Label>
            <Input
              value={formData.nationality}
              onChange={(e) => handleInputChange('nationality', e.target.value)}
              placeholder="Enter your nationality"
            />
          </FormGroup>

          <FormGroup>
            <Label>How do we connect?</Label>
            <TextArea
              value={formData.howConnect}
              onChange={(e) => handleInputChange('howConnect', e.target.value)}
              placeholder="Tell us about your interests, hobbies, or what you'd like to connect about..."
              maxLength={200}
            />
            <CharacterCount>{formData.howConnect.length}/200</CharacterCount>
          </FormGroup>

          <FormGroup>
            <Label>How did you know about BerseMuka?</Label>
            <TextArea
              value={formData.howKnowBerseMuka}
              onChange={(e) => handleInputChange('howKnowBerseMuka', e.target.value)}
              placeholder="If from a person, kindly state their name"
              maxLength={200}
            />
            <CharacterCount>{formData.howKnowBerseMuka.length}/200</CharacterCount>
            <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
              * If from a person, kindly state their name
            </div>
          </FormGroup>
        </FormSection>

        <FormSection>
          <SectionTitle>About Me (Optional)</SectionTitle>
          
          <FormGroup>
            <Label>Bio</Label>
            <TextArea
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder="Tell others about yourself..."
              maxLength={300}
            />
            <CharacterCount>{formData.bio.length}/300</CharacterCount>
          </FormGroup>
        </FormSection>

        <FormSection>
          <SectionTitle>Interests</SectionTitle>
          <InterestsContainer>
            {availableInterests.map((interest) => (
              <InterestTag
                key={interest}
                selected={selectedInterests.includes(interest)}
                onClick={() => handleInterestToggle(interest)}
              >
                {interest}
              </InterestTag>
            ))}
          </InterestsContainer>
        </FormSection>

        <FormSection>
          <SectionTitle>Social Links (Optional)</SectionTitle>
          
          <SocialLinksContainer>
            <SocialLinkRow>
              <SocialIcon>📷</SocialIcon>
              <SocialInput
                value={formData.instagram}
                onChange={(e) => handleInputChange('instagram', e.target.value)}
                placeholder="Instagram username"
              />
            </SocialLinkRow>

            <SocialLinkRow>
              <SocialIcon>💼</SocialIcon>
              <SocialInput
                value={formData.linkedin}
                onChange={(e) => handleInputChange('linkedin', e.target.value)}
                placeholder="LinkedIn profile"
              />
            </SocialLinkRow>

            <SocialLinkRow>
              <SocialIcon>🐦</SocialIcon>
              <SocialInput
                value={formData.twitter}
                onChange={(e) => handleInputChange('twitter', e.target.value)}
                placeholder="Twitter handle"
              />
            </SocialLinkRow>

            <SocialLinkRow>
              <SocialIcon>🌐</SocialIcon>
              <SocialInput
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder="Personal website"
              />
            </SocialLinkRow>
          </SocialLinksContainer>
        </FormSection>

        <SaveChangesButton onClick={handleSave}>
          💾 Save Changes
        </SaveChangesButton>
      </Content>

      <BottomNav activeTab="profile" />
    </Container>
  );
};