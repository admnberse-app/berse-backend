import React, { useState, useRef } from 'react';
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

const PublishButton = styled.button<{ disabled?: boolean }>`
  background: ${({ disabled }) => disabled ? '#CCC' : '#2D5F4F'};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'pointer'};
`;

const Content = styled.div`
  flex: 1;
  padding: 0 20px 100px 20px;
  overflow-y: auto;
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
  display: flex;
  align-items: center;
  gap: 8px;
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

const ImageUploadSection = styled.div`
  border: 2px dashed #E5E5E5;
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.2s ease;
  
  &:hover {
    border-color: #2D5F4F;
  }
`;

const ImageUploadInput = styled.input`
  display: none;
`;

const ImagePreview = styled.div`
  width: 100%;
  height: 120px;
  background: linear-gradient(45deg, #E8F4F0, #D4E9E3);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  margin-bottom: 12px;
`;

const UploadText = styled.div`
  color: #666;
  font-size: 14px;
`;

const UploadHint = styled.div`
  color: #999;
  font-size: 12px;
  margin-top: 4px;
`;

const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
`;

const CategoryOption = styled.div<{ selected: boolean }>`
  padding: 16px 12px;
  border: 2px solid ${({ selected }) => selected ? '#2D5F4F' : '#E5E5E5'};
  border-radius: 12px;
  text-align: center;
  cursor: pointer;
  background-color: ${({ selected }) => selected ? '#E8F4F0' : 'white'};
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #2D5F4F;
  }
`;

const CategoryEmoji = styled.div`
  font-size: 24px;
  margin-bottom: 8px;
`;

const CategoryName = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: #333;
`;

const DateTimeRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
`;

const LocationInput = styled.div`
  position: relative;
`;

const MapButton = styled.button`
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #2D5F4F;
  font-size: 16px;
  cursor: pointer;
  padding: 4px;
`;

const RequirementsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const RequirementInput = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const RequirementText = styled(Input)`
  flex: 1;
`;

const AddRequirementButton = styled.button`
  background: #E8F4F0;
  color: #2D5F4F;
  border: none;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  
  &:hover {
    background-color: #D4E9E3;
  }
`;

const RemoveButton = styled.button`
  background: #FFE5E5;
  color: #FF4444;
  border: none;
  border-radius: 6px;
  padding: 8px;
  font-size: 12px;
  cursor: pointer;
  
  &:hover {
    background-color: #FFD1D1;
  }
`;

const PointsSlider = styled.input`
  width: 100%;
  margin: 16px 0;
`;

const PointsDisplay = styled.div`
  text-align: center;
  font-size: 18px;
  font-weight: bold;
  color: #2D5F4F;
  margin-bottom: 8px;
`;

const CharacterCount = styled.div`
  font-size: 12px;
  color: #999;
  text-align: right;
  margin-top: 4px;
`;

const PreviewButton = styled.button`
  width: 100%;
  background: #F8F9FA;
  color: #333;
  border: 1px solid #E5E5E5;
  border-radius: 12px;
  padding: 16px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 16px;
  
  &:hover {
    background-color: #f0f0f0;
  }
`;

const CreateButton = styled.button`
  width: 100%;
  background-color: #2D5F4F;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 16px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  
  &:hover {
    background-color: #1F4A3A;
  }
`;

export const CreateEventScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'SOCIAL',
    date: '',
    time: '',
    endTime: '',
    location: '',
    address: '',
    maxParticipants: '20',
    pointsReward: 5
  });

  const [requirements, setRequirements] = useState(['']);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  const categories = [
    { id: 'SOCIAL', name: 'Social', emoji: '👥' },
    { id: 'CAFE_MEETUP', name: 'Cafe', emoji: '☕' },
    { id: 'SPORTS', name: 'Sports', emoji: '🏃‍♂️' },
    { id: 'VOLUNTEER', name: 'Volunteer', emoji: '🌱' },
    { id: 'TRIP', name: 'Trip', emoji: '🏝️' },
    { id: 'LOCAL_GUIDE', name: 'Guide', emoji: '🗺️' },
    { id: 'ILM', name: 'Learning', emoji: '📚' },
    { id: 'FOOD', name: 'Food', emoji: '🍔' },
    { id: 'GAMING', name: 'Gaming', emoji: '🎮' }
  ];

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = () => {
    imageInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addRequirement = () => {
    setRequirements([...requirements, '']);
  };

  const updateRequirement = (index: number, value: string) => {
    const newRequirements = [...requirements];
    newRequirements[index] = value;
    setRequirements(newRequirements);
  };

  const removeRequirement = (index: number) => {
    if (requirements.length > 1) {
      setRequirements(requirements.filter((_, i) => i !== index));
    }
  };

  const handleCreateEvent = async () => {
    try {
      // Validate required fields
      if (!formData.title || !formData.description || !formData.date || !formData.location) {
        alert('Please fill in all required fields');
        return;
      }

      // Create event object
      const newEvent = {
        ...formData,
        id: Date.now().toString(),
        hostName: user?.fullName || 'Current User',
        hostInitials: user?.fullName?.split(' ').map(n => n[0]).join('') || 'CU',
        participantCount: 1,
        requirements: requirements.filter(req => req.trim() !== ''),
        createdAt: new Date().toISOString()
      };

      console.log('Creating event:', newEvent);
      
      // Here you would make an API call to create the event
      // await eventService.createEvent(newEvent);

      // Navigate back to connect page with success message
      navigate('/connect', { state: { newEvent: newEvent } });
      
      // Show success message
      alert('Event created successfully!');
    } catch (error) {
      console.error('Failed to create event:', error);
      alert('Failed to create event. Please try again.');
    }
  };

  const handlePreview = () => {
    // Navigate to a preview of the event
    const previewData = {
      ...formData,
      hostName: user?.fullName || 'Current User',
      hostInitials: user?.fullName?.split(' ').map(n => n[0]).join('') || 'CU',
      participantCount: 1,
      requirements: requirements.filter(req => req.trim() !== ''),
      preview: true
    };
    navigate('/event/preview', { state: { eventData: previewData } });
  };

  const getCategoryEmoji = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId)?.emoji || '📅';
  };

  const isFormValid = formData.title && formData.description && formData.date && formData.location;

  return (
    <Container>
      <StatusBar />
      
      <Header>
        <BackButton onClick={() => navigate(-1)}>
          ← Cancel
        </BackButton>
        <HeaderTitle>Create Event</HeaderTitle>
        <PublishButton disabled={!isFormValid} onClick={handleCreateEvent}>
          Publish
        </PublishButton>
      </Header>

      <Content>
        {/* Event Image */}
        <FormSection>
          <SectionTitle>📸 Event Image</SectionTitle>
          <ImageUploadSection onClick={handleImageUpload}>
            {imagePreview ? (
              <img 
                src={imagePreview} 
                alt="Event preview" 
                style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px' }}
              />
            ) : (
              <ImagePreview>
                {getCategoryEmoji(formData.category)}
              </ImagePreview>
            )}
            <UploadText>Tap to add event photo</UploadText>
            <UploadHint>JPG, PNG up to 5MB</UploadHint>
            <ImageUploadInput
              ref={imageInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
          </ImageUploadSection>
        </FormSection>

        {/* Basic Information */}
        <FormSection>
          <SectionTitle>📝 Basic Information</SectionTitle>
          
          <FormGroup>
            <Label>Event Title *</Label>
            <Input
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter event title"
              maxLength={60}
            />
            <CharacterCount>{formData.title.length}/60</CharacterCount>
          </FormGroup>

          <FormGroup>
            <Label>Description *</Label>
            <TextArea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe your event, what to expect, and why people should join..."
              maxLength={500}
            />
            <CharacterCount>{formData.description.length}/500</CharacterCount>
          </FormGroup>

          <FormGroup>
            <Label>Category *</Label>
            <CategoryGrid>
              {categories.map((category) => (
                <CategoryOption
                  key={category.id}
                  selected={formData.category === category.id}
                  onClick={() => handleInputChange('category', category.id)}
                >
                  <CategoryEmoji>{category.emoji}</CategoryEmoji>
                  <CategoryName>{category.name}</CategoryName>
                </CategoryOption>
              ))}
            </CategoryGrid>
          </FormGroup>
        </FormSection>

        {/* Date & Time */}
        <FormSection>
          <SectionTitle>📅 Date & Time</SectionTitle>
          
          <FormGroup>
            <Label>Event Date *</Label>
            <Input
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </FormGroup>

          <DateTimeRow>
            <FormGroup>
              <Label>Start Time *</Label>
              <Input
                type="time"
                value={formData.time}
                onChange={(e) => handleInputChange('time', e.target.value)}
              />
            </FormGroup>
            <FormGroup>
              <Label>End Time</Label>
              <Input
                type="time"
                value={formData.endTime}
                onChange={(e) => handleInputChange('endTime', e.target.value)}
              />
            </FormGroup>
          </DateTimeRow>
        </FormSection>

        {/* Location */}
        <FormSection>
          <SectionTitle>📍 Location</SectionTitle>
          
          <FormGroup>
            <Label>Venue Name *</Label>
            <Input
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="e.g., Mesra Cafe KLCC"
            />
          </FormGroup>

          <FormGroup>
            <Label>Full Address</Label>
            <LocationInput>
              <Input
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Enter full address"
              />
              <MapButton type="button" onClick={() => alert('Map picker feature coming soon!')}>
                📍
              </MapButton>
            </LocationInput>
          </FormGroup>
        </FormSection>

        {/* Event Settings */}
        <FormSection>
          <SectionTitle>⚙️ Event Settings</SectionTitle>
          
          <FormGroup>
            <Label>Maximum Participants</Label>
            <Select
              value={formData.maxParticipants}
              onChange={(e) => handleInputChange('maxParticipants', e.target.value)}
            >
              <option value="10">10 people</option>
              <option value="15">15 people</option>
              <option value="20">20 people</option>
              <option value="30">30 people</option>
              <option value="50">50 people</option>
              <option value="100">100 people</option>
              <option value="unlimited">Unlimited</option>
            </Select>
          </FormGroup>

          <FormGroup>
            <Label>Points Reward</Label>
            <PointsDisplay>{formData.pointsReward} points</PointsDisplay>
            <PointsSlider
              type="range"
              min="1"
              max="10"
              value={formData.pointsReward}
              onChange={(e) => handleInputChange('pointsReward', parseInt(e.target.value))}
            />
          </FormGroup>
        </FormSection>

        {/* Requirements */}
        <FormSection>
          <SectionTitle>✅ Requirements & Guidelines</SectionTitle>
          
          <RequirementsList>
            {requirements.map((requirement, index) => (
              <RequirementInput key={index}>
                <RequirementText
                  value={requirement}
                  onChange={(e) => updateRequirement(index, e.target.value)}
                  placeholder="Enter requirement or guideline"
                />
                {requirements.length > 1 && (
                  <RemoveButton onClick={() => removeRequirement(index)}>
                    ✕
                  </RemoveButton>
                )}
              </RequirementInput>
            ))}
            <AddRequirementButton onClick={addRequirement}>
              + Add Requirement
            </AddRequirementButton>
          </RequirementsList>
        </FormSection>

        {/* Action Buttons */}
        <PreviewButton onClick={handlePreview}>
          👁️ Preview Event
        </PreviewButton>

        <CreateButton onClick={handleCreateEvent}>
          🎉 Create Event
        </CreateButton>
      </Content>

      <BottomNav activeTab="connect" />
    </Container>
  );
};