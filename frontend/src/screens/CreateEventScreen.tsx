import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { StatusBar } from '../components/StatusBar/StatusBar';
import { MainNav } from '../components/MainNav';
import { berseMukhaColors, BerseMukhaColor, BerseMukhaModerator } from '../data/berseMukhaColors';
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
  color: #2fce98;
`;

const PublishButton = styled.button<{ disabled?: boolean }>`
  background: ${({ disabled }) => disabled ? '#CCC' : '#2fce98'};
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
    border-color: #2fce98;
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
    border-color: #2fce98;
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
    border-color: #2fce98;
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
    border-color: #2fce98;
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
  border: 2px solid ${({ selected }) => selected ? '#2fce98' : '#E5E5E5'};
  border-radius: 12px;
  text-align: center;
  cursor: pointer;
  background-color: ${({ selected }) => selected ? '#E8F4F0' : 'white'};
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #2fce98;
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
  color: #2fce98;
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
  color: #2fce98;
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
  color: #2fce98;
  margin-bottom: 8px;
`;

const CharacterCount = styled.div`
  font-size: 12px;
  color: #999;
  text-align: right;
  margin-top: 4px;
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
`;

const Tag = styled.div`
  background: #E8F4F0;
  color: #2fce98;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const RemoveTagButton = styled.button`
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 0;
  font-size: 16px;
  line-height: 1;
  
  &:hover {
    color: #FF4444;
  }
`;

const TagInput = styled(Input)`
  margin-bottom: 8px;
`;

const SuggestedTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
`;

const SuggestedTag = styled.button`
  background: #F5F5F5;
  color: #666;
  border: 1px solid #E5E5E5;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  cursor: pointer;
  
  &:hover {
    background: #E8F4F0;
    border-color: #2fce98;
    color: #2fce98;
  }
`;

const CoHostCard = styled.div`
  background: #F8F9FA;
  border: 1px solid #E5E5E5;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  position: relative;
`;

const CoHostHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const CoHostTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #333;
`;

const RemoveCoHostButton = styled.button`
  background: #FFE5E5;
  color: #FF4444;
  border: none;
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 11px;
  cursor: pointer;
  
  &:hover {
    background: #FFD1D1;
  }
`;

const CoHostInputRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 8px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const CoHostInput = styled(Input)`
  font-size: 13px;
  padding: 10px 12px;
`;

const AddCoHostButton = styled.button`
  width: 100%;
  background: #E8F4F0;
  color: #2fce98;
  border: 2px dashed #2fce98;
  border-radius: 12px;
  padding: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  &:hover {
    background: #D4E9E3;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const CommunitySelect = styled(Select)`
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%232D5F4F' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 36px;
`;

const ToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 48px;
  height: 24px;
  margin-right: 12px;
`;

const ToggleInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;
  
  &:checked + span {
    background-color: #2fce98;
  }
  
  &:checked + span:before {
    transform: translateX(24px);
  }
`;

const ToggleSlider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 24px;
  
  &:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: .4s;
    border-radius: 50%;
  }
`;

const ToggleLabel = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  font-size: 14px;
  color: #333;
  cursor: pointer;
`;

const SponsorCard = styled.div`
  background: #F8F9FA;
  border: 1px solid #E5E5E5;
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const SponsorInfo = styled.div`
  flex: 1;
`;

const SponsorTier = styled.select`
  padding: 6px;
  border: 1px solid #E5E5E5;
  border-radius: 6px;
  font-size: 12px;
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  
  input[type="checkbox"] {
    width: 18px;
    height: 18px;
    accent-color: #2fce98;
  }
`;

const RecurringTopicInput = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
`;

const TopicNumber = styled.div`
  background: #2fce98;
  color: white;
  width: 28px;
  height: 38px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
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
  background-color: #2fce98;
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

const GoogleCalendarPrompt = styled.div<{ $show: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: ${({ $show }) => $show ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const PromptCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 30px;
  max-width: 400px;
  width: 100%;
  text-align: center;
`;

const PromptIcon = styled.div`
  font-size: 48px;
  margin-bottom: 20px;
`;

const PromptTitle = styled.h3`
  color: #2fce98;
  margin-bottom: 10px;
  font-size: 20px;
`;

const PromptMessage = styled.p`
  color: #666;
  margin-bottom: 20px;
  font-size: 14px;
`;

const PromptButtons = styled.div`
  display: flex;
  gap: 10px;
  justify-content: center;
`;

const PromptButton = styled.button<{ $primary?: boolean }>`
  padding: 12px 24px;
  border-radius: 25px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  ${({ $primary }) => $primary ? `
    background: linear-gradient(135deg, #2fce98 0%, #4A90A4 100%);
    color: white;
    border: none;
    
    &:hover {
      transform: scale(1.05);
    }
  ` : `
    background: white;
    color: #666;
    border: 1px solid #E5E5E5;
    
    &:hover {
      background: #F8F9FA;
    }
  `}
`;

const CommunityRequiredModal = styled.div<{ $show: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: ${({ $show }) => $show ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
`;

const CommunityRequiredCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 30px;
  max-width: 450px;
  width: 100%;
`;

// BerseMukha Moderator Styles
const ModeratorSection = styled.div`
  margin-top: 20px;
  padding: 16px;
  background: #f9f9f9;
  border-radius: 12px;
  border: 2px solid #e5e5e5;
`;

const ModeratorInputCard = styled.div`
  background: white;
  border: 2px solid #e5e5e5;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #2fce98;
    box-shadow: 0 2px 8px rgba(45, 95, 79, 0.1);
  }
`;

const ModeratorHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
`;

const ModeratorNumber = styled.div`
  background: linear-gradient(135deg, #2fce98, #4A90A4);
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const ModeratorContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const NameSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const NameLabel = styled.label`
  font-size: 13px;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const ModeratorNameInput = styled(Input)`
  font-size: 14px;
  padding: 12px;
  border: 2px solid #e5e5e5;
  border-radius: 8px;
  
  &:focus {
    border-color: #2fce98;
    outline: none;
    box-shadow: 0 0 0 3px rgba(45, 95, 79, 0.1);
  }
`;

const SessionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SessionRow = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  background: #f9f9f9;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
`;

const SessionLabel = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: #2fce98;
  min-width: 80px;
`;

const SessionSelect = styled.select`
  flex: 1;
  padding: 10px 12px;
  border: 1px solid #e5e5e5;
  border-radius: 6px;
  font-size: 13px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #2fce98;
    box-shadow: 0 0 0 3px rgba(45, 95, 79, 0.1);
  }
  
  &:hover {
    border-color: #2fce98;
  }
`;

const ColorPreview = styled.div<{ $color: string }>`
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: ${({ $color }) => $color};
  border: 2px solid white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
`;

const AddModeratorButton = styled.button`
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #e8f4f0, #d4e9e3);
  color: #2fce98;
  border: 2px dashed #2fce98;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  &:hover {
    background: linear-gradient(135deg, #d4e9e3, #c0ded5);
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(45, 95, 79, 0.2);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const RemoveModeratorButton = styled.button`
  background: linear-gradient(135deg, #ffe5e5, #ffcccc);
  color: #ff4444;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: linear-gradient(135deg, #ffcccc, #ffb3b3);
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(255, 68, 68, 0.2);
  }
  text-align: center;
`;

const RequirementIcon = styled.div`
  font-size: 48px;
  margin-bottom: 20px;
`;

const RequirementTitle = styled.h3`
  color: #2fce98;
  margin-bottom: 16px;
  font-size: 22px;
`;

const RequirementMessage = styled.p`
  color: #666;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 24px;
`;

const RequirementList = styled.ul`
  text-align: left;
  margin: 20px 0;
  padding-left: 20px;
  
  li {
    color: #555;
    font-size: 14px;
    margin-bottom: 10px;
    line-height: 1.5;
  }
`;

const VerificationBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #E8F4F0;
  color: #2fce98;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  margin-left: 8px;
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
    maxParticipants: '',
    minParticipants: '',
    eventFee: '',
    eventType: 'in-person',
    registrationDeadline: '',
    groupLink: '',
    tags: [] as string[],
    pointsReward: 5,
    organizingCommunity: '',
    coHosts: [] as Array<{ name: string; role: string; contact: string }>,
    // BerseMukha Moderators
    isBerseMukhaEvent: false,
    berseMukhaModerators: [] as BerseMukhaModerator[],
    // Recurring events
    isRecurring: false,
    recurringType: 'weekly',
    recurringEndDate: '',
    recurringTopics: [] as string[],
    // Sponsors
    sponsors: [] as Array<{ name: string; logo: string; tier: string }>,
    // Early bird pricing
    earlyBirdEnabled: false,
    earlyBirdPrice: '',
    earlyBirdDeadline: '',
    // Accessibility
    wheelchairAccess: false,
    signLanguage: false,
    audioDescription: false,
    onlineOption: false,
    // Refund policy
    refundPolicy: 'standard',
    customRefundText: '',
    // Waitlist
    enableWaitlist: true,
    // Check-in
    generateQRCode: true,
    attendanceTracking: true
  });

  const [requirements, setRequirements] = useState(['']);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [showGoogleCalendarPrompt, setShowGoogleCalendarPrompt] = useState(false);
  const [syncToGoogleCalendar, setSyncToGoogleCalendar] = useState(false);
  const [userCommunities, setUserCommunities] = useState<any[]>([]);
  const [showCommunityRequired, setShowCommunityRequired] = useState(false);
  
  // Image cropper state
  const [tempImageSrc, setTempImageSrc] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);

  const categories = [
    { id: 'SOCIAL', name: 'Social', emoji: '👥' },
    { id: 'SPORTS', name: 'Sports', emoji: '⚽' },
    { id: 'VOLUNTEER', name: 'Volunteer', emoji: '🤝' },
    { id: 'DONATE', name: 'Donate', emoji: '❤️' },
    { id: 'TRIPS', name: 'Trips', emoji: '✈️' }
  ];

  // Mock data for user's verified communities - in production, fetch from API
  useEffect(() => {
    // Check if user is admin of any verified community
    const checkUserCommunities = async () => {
      // Mock data - replace with actual API call
      const mockUserCommunities = [
        {
          id: 'bersemuka-main',
          name: 'BerseMuka Community',
          isVerified: true,
          userRole: 'admin'
        },
        {
          id: 'digital-nomads-my',
          name: 'Digital Nomads Malaysia',
          isVerified: true,
          userRole: 'founder'
        }
      ];
      
      // Filter for communities where user is admin/founder and community is verified
      const verifiedAdminCommunities = mockUserCommunities.filter(
        c => c.isVerified && (c.userRole === 'admin' || c.userRole === 'founder')
      );
      
      setUserCommunities(verifiedAdminCommunities);
      
      // If user has no verified communities they admin, show the modal
      if (verifiedAdminCommunities.length === 0) {
        setShowCommunityRequired(true);
      }
    };
    
    checkUserCommunities();
  }, []);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // BerseMukha Moderator Functions
  const addBerseMukhaModerator = () => {
    if (formData.berseMukhaModerators.length >= 15) {
      alert('Maximum 15 moderators allowed');
      return;
    }
    
    const newModerator: BerseMukhaModerator = {
      id: `mod-${Date.now()}`,
      name: '',
      session1Number: undefined,
      session2Color: undefined,
      session2ColorCode: undefined
    };
    
    handleInputChange('berseMukhaModerators', [...formData.berseMukhaModerators, newModerator]);
  };

  const updateModerator = (index: number, field: string, value: any) => {
    const updatedModerators = [...formData.berseMukhaModerators];
    updatedModerators[index] = {
      ...updatedModerators[index],
      [field]: value
    };
    
    // If color is selected for session 2, also update the color code
    if (field === 'session2Color') {
      const color = berseMukhaColors.find(c => c.name === value);
      updatedModerators[index].session2ColorCode = color?.colorCode;
    }
    
    handleInputChange('berseMukhaModerators', updatedModerators);
  };

  const removeModerator = (index: number) => {
    const updatedModerators = formData.berseMukhaModerators.filter((_, i) => i !== index);
    handleInputChange('berseMukhaModerators', updatedModerators);
  };

  const getUsedNumbers = () => {
    return formData.berseMukhaModerators
      .map(m => m.session1Number)
      .filter(n => n !== undefined);
  };

  const getUsedColors = () => {
    return formData.berseMukhaModerators
      .map(m => m.session2Color)
      .filter(c => c !== undefined);
  };

  const addCoHost = () => {
    if (formData.coHosts.length < 5) {
      handleInputChange('coHosts', [...formData.coHosts, { name: '', role: 'Co-Host', contact: '' }]);
    }
  };

  const updateCoHost = (index: number, field: string, value: string) => {
    const newCoHosts = [...formData.coHosts];
    newCoHosts[index] = { ...newCoHosts[index], [field]: value };
    handleInputChange('coHosts', newCoHosts);
  };

  const removeCoHost = (index: number) => {
    handleInputChange('coHosts', formData.coHosts.filter((_, i) => i !== index));
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
        setTempImageSrc(e.target?.result as string);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (croppedImage: string) => {
    setImagePreview(croppedImage);
    setTempImageSrc(null);
    setShowCropper(false);
    // Here you would typically upload the cropped image to your server
    console.log('Cropped event image ready for upload:', croppedImage);
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

      // Validate participant limits
      const minPart = parseInt(formData.minParticipants) || 0;
      const maxPart = parseInt(formData.maxParticipants) || 0;
      
      if (minPart && maxPart && minPart > maxPart) {
        alert('Minimum participants cannot be greater than maximum participants');
        return;
      }

      if (maxPart && maxPart < 1) {
        alert('Maximum participants must be at least 1');
        return;
      }

      // Create event object
      const newEvent = {
        ...formData,
        id: Date.now().toString(),
        hostName: user?.fullName || 'Current User',
        hostInitials: user?.fullName?.split(' ').map(n => n[0]).join('') || 'CU',
        participantCount: 1,
        eventFee: parseFloat(formData.eventFee) || 0,
        minParticipants: minPart || 1,
        maxParticipants: maxPart || null,
        requirements: requirements.filter(req => req.trim() !== ''),
        organizingCommunity: formData.organizingCommunity || null,
        coHosts: formData.coHosts.filter(coHost => coHost.name && coHost.contact),
        sponsors: formData.sponsors.filter(sponsor => sponsor.name),
        earlyBirdPrice: formData.earlyBirdEnabled ? parseFloat(formData.earlyBirdPrice) || 0 : null,
        accessibility: {
          wheelchairAccess: formData.wheelchairAccess,
          signLanguage: formData.signLanguage,
          audioDescription: formData.audioDescription,
          onlineOption: formData.onlineOption
        },
        recurringSchedule: formData.isRecurring ? {
          type: formData.recurringType,
          endDate: formData.recurringEndDate,
          topics: formData.recurringTopics.filter(topic => topic)
        } : null,
        checkInSettings: {
          generateQRCode: formData.generateQRCode,
          attendanceTracking: formData.attendanceTracking
        },
        createdAt: new Date().toISOString()
      };

      console.log('Creating event:', newEvent);
      
      // Here you would make an API call to create the event
      // await eventService.createEvent(newEvent);

      // Check if user has Google Calendar connected
      const isGoogleCalendarConnected = localStorage.getItem('googleCalendarConnected') === 'true';
      
      if (!isGoogleCalendarConnected && !localStorage.getItem('googleCalendarPromptDismissed')) {
        setShowGoogleCalendarPrompt(true);
        // Store the event for later sync if user connects
        localStorage.setItem('pendingEventForCalendar', JSON.stringify(newEvent));
      } else if (isGoogleCalendarConnected && syncToGoogleCalendar) {
        // Sync to Google Calendar
        await syncEventToGoogleCalendar(newEvent);
      }
      
      // Don't navigate immediately if showing prompt
      if (!showGoogleCalendarPrompt) {
        // Navigate back to connect page with success message
        navigate('/connect', { state: { newEvent: newEvent } });
        // Show success message
        alert('Event created successfully!');
      }
    } catch (error) {
      console.error('Failed to create event:', error);
      alert('Failed to create event. Please try again.');
    }
  };

  const handleGoogleCalendarConnect = async () => {
    try {
      // Initialize Google Calendar service
      const { GoogleCalendarService } = await import('../services/googleCalendar');
      await GoogleCalendarService.init();
      await GoogleCalendarService.signIn();
      
      localStorage.setItem('googleCalendarConnected', 'true');
      setSyncToGoogleCalendar(true);
      
      // Sync the pending event if exists
      const pendingEvent = localStorage.getItem('pendingEventForCalendar');
      if (pendingEvent) {
        await syncEventToGoogleCalendar(JSON.parse(pendingEvent));
        localStorage.removeItem('pendingEventForCalendar');
      }
      
      setShowGoogleCalendarPrompt(false);
      navigate('/connect');
      alert('Event created and synced to Google Calendar!');
    } catch (error) {
      console.error('Failed to connect Google Calendar:', error);
      alert('Failed to connect Google Calendar. Event created without sync.');
      setShowGoogleCalendarPrompt(false);
      navigate('/connect');
    }
  };

  const syncEventToGoogleCalendar = async (event: any) => {
    try {
      const { GoogleCalendarService } = await import('../services/googleCalendar');
      
      const calendarEvent = {
        summary: event.title,
        description: event.description,
        location: event.location,
        start: {
          dateTime: new Date(`${event.date}T${event.time}`).toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        end: {
          dateTime: new Date(`${event.date}T${event.endTime || event.time}`).toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
      };
      
      await GoogleCalendarService.createEvent(calendarEvent);
      console.log('Event synced to Google Calendar');
    } catch (error) {
      console.error('Failed to sync to Google Calendar:', error);
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
          <ImageUploadSection onClick={handleImageUpload} style={{ position: 'relative', cursor: 'pointer' }}>
            {imagePreview ? (
              <>
                <img 
                  src={imagePreview} 
                  alt="Event preview" 
                  style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px' }}
                />
                <div style={{
                  position: 'absolute',
                  bottom: 8,
                  right: 8,
                  background: '#2fce98',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid white',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  fontSize: '16px'
                }}>
                  ✏️
                </div>
              </>
            ) : (
              <ImagePreview>
                {getCategoryEmoji(formData.category)}
              </ImagePreview>
            )}
            {!imagePreview && (
              <>
                <UploadText>Tap to add event photo</UploadText>
                <UploadHint>JPG, PNG up to 5MB</UploadHint>
              </>
            )}
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

          <FormGroup>
            <Label>Organizing Community *</Label>
            <CommunitySelect
              value={formData.organizingCommunity}
              onChange={(e) => handleInputChange('organizingCommunity', e.target.value)}
              required
            >
              <option value="">Select a community</option>
              {userCommunities.map((community) => (
                <option key={community.id} value={community.id}>
                  {community.name}
                  {community.isVerified && '✓'}
                </option>
              ))}
            </CommunitySelect>
            {userCommunities.length === 0 && (
              <p style={{ fontSize: '12px', color: '#FF6B6B', marginTop: '8px' }}>
                You must be an admin of a verified community to create events
              </p>
            )}
          </FormGroup>
        </FormSection>

        {/* Co-Hosts / Event Admins */}
        <FormSection>
          <SectionTitle>👥 Event Co-Hosts</SectionTitle>
          <p style={{ fontSize: '13px', color: '#666', marginBottom: '16px' }}>
            Add up to 5 co-hosts or admins who will help manage this event
          </p>
          
          {formData.coHosts.map((coHost, index) => (
            <CoHostCard key={index}>
              <CoHostHeader>
                <CoHostTitle>Co-Host {index + 1}</CoHostTitle>
                <RemoveCoHostButton onClick={() => removeCoHost(index)}>
                  Remove
                </RemoveCoHostButton>
              </CoHostHeader>
              
              <CoHostInputRow>
                <CoHostInput
                  value={coHost.name}
                  onChange={(e) => updateCoHost(index, 'name', e.target.value)}
                  placeholder="Full name"
                />
                <Select
                  value={coHost.role}
                  onChange={(e) => updateCoHost(index, 'role', e.target.value)}
                  style={{ fontSize: '13px', padding: '10px 12px' }}
                >
                  <option value="Co-Host">Co-Host</option>
                  <option value="Admin">Admin</option>
                  <option value="Moderator">Moderator</option>
                  <option value="Organizer">Organizer</option>
                </Select>
              </CoHostInputRow>
              
              <CoHostInput
                value={coHost.contact}
                onChange={(e) => updateCoHost(index, 'contact', e.target.value)}
                placeholder="Phone number or email"
                style={{ width: '100%' }}
              />
            </CoHostCard>
          ))}
          
          {formData.coHosts.length < 5 && (
            <AddCoHostButton 
              onClick={addCoHost}
              disabled={formData.coHosts.length >= 5}
            >
              + Add Co-Host ({formData.coHosts.length}/5)
            </AddCoHostButton>
          )}
        </FormSection>

        {/* BerseMukha Event Moderators */}
        <FormSection>
          <SectionTitle>👥 BerseMukha Event Moderators</SectionTitle>
          
          <ToggleLabel>
            <ToggleSwitch>
              <ToggleInput 
                type="checkbox"
                checked={formData.isBerseMukhaEvent}
                onChange={(e) => handleInputChange('isBerseMukhaEvent', e.target.checked)}
              />
              <ToggleSlider />
            </ToggleSwitch>
            <span style={{ marginLeft: '12px' }}>This is a BerseMukha facilitated event</span>
          </ToggleLabel>

          {formData.isBerseMukhaEvent && (
            <ModeratorSection>
              <p style={{ fontSize: '13px', color: '#666', marginBottom: '16px', lineHeight: '1.5' }}>
                Add moderator profiles and assign them unique numbers and colors for each session. 
                Each moderator will facilitate a group of 5-7 participants.
              </p>
              
              {formData.berseMukhaModerators.map((moderator, index) => (
                <ModeratorInputCard key={moderator.id}>
                  <ModeratorHeader>
                    <ModeratorNumber>{index + 1}</ModeratorNumber>
                    <RemoveModeratorButton 
                      type="button"
                      onClick={() => removeModerator(index)}
                    >
                      Remove
                    </RemoveModeratorButton>
                  </ModeratorHeader>
                  
                  <ModeratorContent>
                    <NameSection>
                      <NameLabel>
                        👤 Moderator Profile Name
                      </NameLabel>
                      <ModeratorNameInput
                        type="text"
                        placeholder="Enter moderator's full name"
                        value={moderator.name}
                        onChange={(e) => updateModerator(index, 'name', e.target.value)}
                      />
                    </NameSection>
                    
                    <SessionsContainer>
                      <SessionRow>
                        <SessionLabel>Session 1:</SessionLabel>
                        <SessionSelect
                          value={moderator.session1Number || ''}
                          onChange={(e) => updateModerator(index, 'session1Number', e.target.value ? parseInt(e.target.value) : undefined)}
                        >
                          <option value="">Select Number (1-15)</option>
                          {Array.from({ length: 15 }, (_, i) => i + 1)
                            .filter(n => !getUsedNumbers().includes(n) || n === moderator.session1Number)
                            .map(n => (
                              <option key={n} value={n}>Number {n}</option>
                            ))
                          }
                        </SessionSelect>
                      </SessionRow>
                      
                      <SessionRow>
                        <SessionLabel>Session 2:</SessionLabel>
                        <SessionSelect
                          value={moderator.session2Color || ''}
                          onChange={(e) => updateModerator(index, 'session2Color', e.target.value)}
                        >
                          <option value="">Select Color</option>
                          {berseMukhaColors
                            .filter(c => !getUsedColors().includes(c.name) || c.name === moderator.session2Color)
                            .map(color => (
                              <option key={color.name} value={color.name}>{color.name}</option>
                            ))
                          }
                        </SessionSelect>
                        {moderator.session2ColorCode && (
                          <ColorPreview $color={moderator.session2ColorCode} />
                        )}
                      </SessionRow>
                    </SessionsContainer>
                  </ModeratorContent>
                </ModeratorInputCard>
              ))}
              
              <AddModeratorButton 
                type="button"
                onClick={addBerseMukhaModerator}
                disabled={formData.berseMukhaModerators.length >= 15}
              >
                <span style={{ fontSize: '18px' }}>+</span>
                Add Moderator Profile ({formData.berseMukhaModerators.length}/15)
              </AddModeratorButton>

              <div style={{ 
                marginTop: '16px', 
                padding: '14px', 
                background: 'linear-gradient(135deg, #f0f9ff, #e6f4ff)', 
                borderRadius: '10px',
                fontSize: '12px',
                color: '#2fce98',
                border: '1px solid #d0e8f2'
              }}>
                <strong style={{ fontSize: '13px' }}>💡 Tip:</strong> Moderators can have different group assignments between sessions for variety. 
                Participants will be distributed among groups after registration.
              </div>
            </ModeratorSection>
          )}
        </FormSection>

        {/* Event Tags */}
        <FormSection>
          <SectionTitle>🏷️ Event Tags</SectionTitle>
          <p style={{ fontSize: '13px', color: '#666', marginBottom: '12px' }}>
            Add tags to help people discover your event
          </p>
          
          {formData.tags.length > 0 && (
            <TagsContainer>
              {formData.tags.map((tag, index) => (
                <Tag key={index}>
                  {tag}
                  <RemoveTagButton onClick={() => {
                    const newTags = formData.tags.filter((_, i) => i !== index);
                    handleInputChange('tags', newTags);
                  }}>
                    ×
                  </RemoveTagButton>
                </Tag>
              ))}
            </TagsContainer>
          )}
          
          <TagInput
            placeholder="Type a tag and press Enter"
            onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                const input = e.target as HTMLInputElement;
                const tag = input.value.trim();
                if (tag && !formData.tags.includes(tag) && formData.tags.length < 5) {
                  handleInputChange('tags', [...formData.tags, tag]);
                  input.value = '';
                }
              }
            }}
          />
          
          <SuggestedTags>
            <span style={{ fontSize: '12px', color: '#999', marginRight: '8px' }}>Suggested:</span>
            {['Networking', 'Casual', 'Professional', 'Beginner-Friendly', 'Advanced', 'Family-Friendly']
              .filter(tag => !formData.tags.includes(tag))
              .map(tag => (
                <SuggestedTag
                  key={tag}
                  onClick={() => {
                    if (formData.tags.length < 5) {
                      handleInputChange('tags', [...formData.tags, tag]);
                    }
                  }}
                >
                  {tag}
                </SuggestedTag>
              ))
            }
          </SuggestedTags>
          <CharacterCount>{formData.tags.length}/5 tags</CharacterCount>
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

        {/* Recurring Events */}
        <FormSection>
          <SectionTitle>🔄 Recurring Event</SectionTitle>
          
          <ToggleLabel>
            <ToggleSwitch>
              <ToggleInput 
                type="checkbox" 
                checked={formData.isRecurring}
                onChange={(e) => handleInputChange('isRecurring', e.target.checked)}
              />
              <ToggleSlider />
            </ToggleSwitch>
            Make this a recurring event
          </ToggleLabel>
          
          {formData.isRecurring && (
            <>
              <FormGroup>
                <Label>Recurrence Pattern</Label>
                <Select
                  value={formData.recurringType}
                  onChange={(e) => handleInputChange('recurringType', e.target.value)}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Bi-weekly</option>
                  <option value="monthly">Monthly</option>
                </Select>
              </FormGroup>
              
              <FormGroup>
                <Label>End Date for Recurrence</Label>
                <Input
                  type="date"
                  value={formData.recurringEndDate}
                  onChange={(e) => handleInputChange('recurringEndDate', e.target.value)}
                  min={formData.date || new Date().toISOString().split('T')[0]}
                />
              </FormGroup>
              
              <FormGroup>
                <Label>Topics for Each Session (Optional)</Label>
                <p style={{ fontSize: '12px', color: '#666', marginBottom: '12px' }}>
                  Add different topics for each occurrence
                </p>
                {[1, 2, 3, 4].map((num) => (
                  <RecurringTopicInput key={num}>
                    <TopicNumber>{num}</TopicNumber>
                    <Input
                      placeholder={`Week ${num} topic (optional)`}
                      value={formData.recurringTopics[num - 1] || ''}
                      onChange={(e) => {
                        const newTopics = [...formData.recurringTopics];
                        newTopics[num - 1] = e.target.value;
                        handleInputChange('recurringTopics', newTopics);
                      }}
                    />
                  </RecurringTopicInput>
                ))}
              </FormGroup>
            </>
          )}
        </FormSection>

        {/* Early Bird Pricing */}
        <FormSection>
          <SectionTitle>🐦 Early Bird Pricing</SectionTitle>
          
          <ToggleLabel>
            <ToggleSwitch>
              <ToggleInput 
                type="checkbox" 
                checked={formData.earlyBirdEnabled}
                onChange={(e) => handleInputChange('earlyBirdEnabled', e.target.checked)}
              />
              <ToggleSlider />
            </ToggleSwitch>
            Enable early bird pricing
          </ToggleLabel>
          
          {formData.earlyBirdEnabled && (
            <>
              <DateTimeRow>
                <FormGroup>
                  <Label>Early Bird Price (MYR)</Label>
                  <Input
                    type="number"
                    value={formData.earlyBirdPrice}
                    onChange={(e) => handleInputChange('earlyBirdPrice', e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Early Bird Deadline</Label>
                  <Input
                    type="datetime-local"
                    value={formData.earlyBirdDeadline}
                    onChange={(e) => handleInputChange('earlyBirdDeadline', e.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                    max={formData.date ? `${formData.date}T${formData.time || '00:00'}` : undefined}
                  />
                </FormGroup>
              </DateTimeRow>
            </>
          )}
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
              <MapButton 
                type="button" 
                onClick={() => {
                  const searchQuery = `${formData.location || ''} ${formData.address || ''}`.trim();
                  if (searchQuery) {
                    window.open(
                      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(searchQuery)}`,
                      '_blank'
                    );
                  } else {
                    alert('Please enter a venue name or address first');
                  }
                }}
                title="View on Google Maps"
              >
                📍
              </MapButton>
            </LocationInput>
            {(formData.location || formData.address) && (
              <div style={{ marginTop: '12px', padding: '12px', background: '#F0F9FF', borderRadius: '8px', border: '1px solid #BAE6FD' }}>
                <div style={{ marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: '#0369A1' }}>
                  📍 Event Location Preview
                </div>
                <div style={{ fontSize: '12px', color: '#475569', marginBottom: '8px' }}>
                  {formData.location && <div>Venue: {formData.location}</div>}
                  {formData.address && <div>Address: {formData.address}</div>}
                </div>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    `${formData.location || ''} ${formData.address || ''}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: 'white',
                    fontSize: '12px',
                    fontWeight: '600',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    background: 'linear-gradient(135deg, #2196F3, #1976D2)',
                    borderRadius: '6px',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 4px rgba(33, 150, 243, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(33, 150, 243, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(33, 150, 243, 0.3)';
                  }}
                >
                  🗺️ Open in Google Maps
                </a>
                <div style={{ marginTop: '8px', fontSize: '11px', color: '#64748B', fontStyle: 'italic' }}>
                  💡 Attendees will see this link to easily find your event location
                </div>
              </div>
            )}
          </FormGroup>
        </FormSection>

        {/* Accessibility Options */}
        <FormSection>
          <SectionTitle>♿ Accessibility</SectionTitle>
          <p style={{ fontSize: '13px', color: '#666', marginBottom: '16px' }}>
            Help attendees know about accessibility features
          </p>
          
          <CheckboxGroup>
            <CheckboxLabel>
              <input
                type="checkbox"
                checked={formData.wheelchairAccess}
                onChange={(e) => handleInputChange('wheelchairAccess', e.target.checked)}
              />
              Wheelchair accessible venue
            </CheckboxLabel>
            
            <CheckboxLabel>
              <input
                type="checkbox"
                checked={formData.signLanguage}
                onChange={(e) => handleInputChange('signLanguage', e.target.checked)}
              />
              Sign language interpreter available
            </CheckboxLabel>
            
            <CheckboxLabel>
              <input
                type="checkbox"
                checked={formData.audioDescription}
                onChange={(e) => handleInputChange('audioDescription', e.target.checked)}
              />
              Audio description provided
            </CheckboxLabel>
            
            <CheckboxLabel>
              <input
                type="checkbox"
                checked={formData.onlineOption}
                onChange={(e) => handleInputChange('onlineOption', e.target.checked)}
              />
              Online participation option
            </CheckboxLabel>
          </CheckboxGroup>
        </FormSection>

        {/* Event Settings */}
        <FormSection>
          <SectionTitle>⚙️ Event Settings</SectionTitle>
          
          <FormGroup>
            <Label>Event Type</Label>
            <Select
              value={formData.eventType}
              onChange={(e) => handleInputChange('eventType', e.target.value)}
            >
              <option value="in-person">In-Person</option>
              <option value="online">Online</option>
              <option value="hybrid">Hybrid</option>
            </Select>
          </FormGroup>

          <DateTimeRow>
            <FormGroup>
              <Label>Min Participants</Label>
              <Input
                type="number"
                value={formData.minParticipants}
                onChange={(e) => handleInputChange('minParticipants', e.target.value)}
                placeholder="e.g., 5"
                min="1"
              />
            </FormGroup>
            <FormGroup>
              <Label>Max Participants</Label>
              <Input
                type="number"
                value={formData.maxParticipants}
                onChange={(e) => handleInputChange('maxParticipants', e.target.value)}
                placeholder="e.g., 20"
                min="1"
              />
            </FormGroup>
          </DateTimeRow>

          <FormGroup>
            <Label>Event Fee (MYR)</Label>
            <Input
              type="number"
              value={formData.eventFee}
              onChange={(e) => handleInputChange('eventFee', e.target.value)}
              placeholder="0 for free events"
              min="0"
              step="0.01"
            />
          </FormGroup>

          <FormGroup>
            <Label>Registration Deadline</Label>
            <Input
              type="datetime-local"
              value={formData.registrationDeadline}
              onChange={(e) => handleInputChange('registrationDeadline', e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
            />
          </FormGroup>

          <FormGroup>
            <Label>WhatsApp/Telegram Group Link (Optional)</Label>
            <Input
              value={formData.groupLink}
              onChange={(e) => handleInputChange('groupLink', e.target.value)}
              placeholder="https://chat.whatsapp.com/..."
            />
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

          <FormGroup>
            <Label>Waitlist & Check-in</Label>
            <CheckboxGroup>
              <CheckboxLabel>
                <input
                  type="checkbox"
                  checked={formData.enableWaitlist}
                  onChange={(e) => handleInputChange('enableWaitlist', e.target.checked)}
                />
                Enable waitlist when event is full
              </CheckboxLabel>
              
              <CheckboxLabel>
                <input
                  type="checkbox"
                  checked={formData.generateQRCode}
                  onChange={(e) => handleInputChange('generateQRCode', e.target.checked)}
                />
                Generate QR code for check-in
              </CheckboxLabel>
              
              <CheckboxLabel>
                <input
                  type="checkbox"
                  checked={formData.attendanceTracking}
                  onChange={(e) => handleInputChange('attendanceTracking', e.target.checked)}
                />
                Track attendance & award points automatically
              </CheckboxLabel>
            </CheckboxGroup>
          </FormGroup>
        </FormSection>

        {/* Sponsors & Partners */}
        <FormSection>
          <SectionTitle>🤝 Sponsors & Partners</SectionTitle>
          <p style={{ fontSize: '13px', color: '#666', marginBottom: '16px' }}>
            Add organizations supporting your event
          </p>
          
          {formData.sponsors.map((sponsor, index) => (
            <SponsorCard key={index}>
              <SponsorInfo>
                <Input
                  value={sponsor.name}
                  onChange={(e) => {
                    const newSponsors = [...formData.sponsors];
                    newSponsors[index] = { ...newSponsors[index], name: e.target.value };
                    handleInputChange('sponsors', newSponsors);
                  }}
                  placeholder="Sponsor name"
                  style={{ marginBottom: '8px' }}
                />
                <SponsorTier
                  value={sponsor.tier}
                  onChange={(e) => {
                    const newSponsors = [...formData.sponsors];
                    newSponsors[index] = { ...newSponsors[index], tier: e.target.value };
                    handleInputChange('sponsors', newSponsors);
                  }}
                >
                  <option value="platinum">Platinum</option>
                  <option value="gold">Gold</option>
                  <option value="silver">Silver</option>
                  <option value="bronze">Bronze</option>
                  <option value="partner">Partner</option>
                </SponsorTier>
              </SponsorInfo>
              <RemoveButton onClick={() => {
                handleInputChange('sponsors', formData.sponsors.filter((_, i) => i !== index));
              }}>
                ✕
              </RemoveButton>
            </SponsorCard>
          ))}
          
          {formData.sponsors.length < 5 && (
            <AddRequirementButton onClick={() => {
              if (formData.sponsors.length < 5) {
                handleInputChange('sponsors', [...formData.sponsors, { name: '', logo: '', tier: 'bronze' }]);
              }
            }}>
              + Add Sponsor ({formData.sponsors.length}/5)
            </AddRequirementButton>
          )}
        </FormSection>

        {/* Refund Policy */}
        <FormSection>
          <SectionTitle>💳 Refund Policy</SectionTitle>
          
          <FormGroup>
            <Label>Policy Type</Label>
            <Select
              value={formData.refundPolicy}
              onChange={(e) => handleInputChange('refundPolicy', e.target.value)}
            >
              <option value="no-refund">No Refunds</option>
              <option value="standard">Standard (7 days before event)</option>
              <option value="flexible">Flexible (24 hours before event)</option>
              <option value="full">Full Refund Anytime</option>
              <option value="custom">Custom Policy</option>
            </Select>
          </FormGroup>
          
          {formData.refundPolicy === 'custom' && (
            <FormGroup>
              <Label>Custom Refund Policy</Label>
              <TextArea
                value={formData.customRefundText}
                onChange={(e) => handleInputChange('customRefundText', e.target.value)}
                placeholder="Describe your refund policy..."
                maxLength={200}
              />
              <CharacterCount>{formData.customRefundText.length}/200</CharacterCount>
            </FormGroup>
          )}
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

      <ImageCropper
        isOpen={showCropper}
        onClose={() => setShowCropper(false)}
        imageSrc={tempImageSrc || ''}
        onCropComplete={handleCropComplete}
        aspectRatio={16/9}
        shape="rect"
        title="Crop your event image"
      />

      <MainNav 
        activeTab="connect"
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

      {/* Google Calendar Integration Prompt */}
      <GoogleCalendarPrompt $show={showGoogleCalendarPrompt}>
        <PromptCard>
          <PromptIcon>📅</PromptIcon>
          <PromptTitle>Sync with Google Calendar?</PromptTitle>
          <PromptMessage>
            Connect your Google Calendar to automatically add this event and get reminders. 
            You can always connect later from Settings.
          </PromptMessage>
          <PromptButtons>
            <PromptButton 
              onClick={() => {
                setShowGoogleCalendarPrompt(false);
                localStorage.setItem('googleCalendarPromptDismissed', 'true');
                navigate('/connect');
                alert('Event created successfully!');
              }}
            >
              Skip for Now
            </PromptButton>
            <PromptButton $primary onClick={handleGoogleCalendarConnect}>
              Connect Calendar
            </PromptButton>
          </PromptButtons>
        </PromptCard>
      </GoogleCalendarPrompt>

      {/* Community Requirement Modal */}
      <CommunityRequiredModal $show={showCommunityRequired} onClick={() => setShowCommunityRequired(false)}>
        <CommunityRequiredCard onClick={(e) => e.stopPropagation()}>
          <RequirementIcon>🏛️</RequirementIcon>
          <RequirementTitle>Community Admin Access Required</RequirementTitle>
          <RequirementMessage>
            To maintain event quality and safety, only verified community admins can create events on BerseMuka.
          </RequirementMessage>
          
          <RequirementList>
            <li>Events must be organized by verified communities</li>
            <li>You need to be an admin or founder of a community</li>
            <li>Communities undergo verification for authenticity</li>
            <li>This ensures accountability and trust</li>
          </RequirementList>
          
          <RequirementMessage style={{ fontWeight: 600, color: '#2fce98' }}>
            How to create events:
          </RequirementMessage>
          
          <RequirementList>
            <li>Join an existing verified community as an admin</li>
            <li>Or create your own community and get verified</li>
            <li>Community founders can assign up to 10 admins</li>
          </RequirementList>
          
          <PromptButtons>
            <PromptButton onClick={() => navigate('/connect')}>
              Browse Events
            </PromptButton>
            <PromptButton $primary onClick={() => navigate('/communities/create')}>
              Create Community
            </PromptButton>
          </PromptButtons>
        </CommunityRequiredCard>
      </CommunityRequiredModal>
    </Container>
  );
};