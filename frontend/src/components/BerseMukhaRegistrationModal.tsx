import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { deepLinkHandler, EventContext } from '../utils/deepLinkHandler';

// Modal Components
const ModalOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: ${({ $isOpen }) => $isOpen ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
`;

const RegistrationModal = styled.div`
  background: white;
  border-radius: 20px;
  width: 100%;
  max-width: 400px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const ModalHeader = styled.div`
  background: linear-gradient(135deg, #2D5F4F, #4A90A4);
  color: white;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const BackButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  text-align: center;
  flex: 1;
`;

const TabNavigation = styled.div`
  display: flex;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
`;

const TabButton = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 12px 8px;
  border: none;
  background: ${({ $active }) => $active ? '#2D5F4F' : 'transparent'};
  color: ${({ $active }) => $active ? 'white' : '#666'};
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: ${({ $active }) => $active ? '2px solid #2D5F4F' : '2px solid transparent'};
  
  &:hover {
    background: ${({ $active }) => $active ? '#2D5F4F' : '#f0f0f0'};
  }
`;

const TabContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
`;

// Registration Tab Components
const RegistrationForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FormInput = styled.input`
  padding: 12px;
  border: 2px solid #e5e5e5;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #2D5F4F;
  }
`;

const SelectField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  
  label {
    font-size: 14px;
    font-weight: 500;
    color: #333;
  }
  
  select {
    padding: 12px;
    border: 2px solid #e5e5e5;
    border-radius: 8px;
    font-size: 14px;
    background: white;
    
    &:focus {
      outline: none;
      border-color: #2D5F4F;
    }
  }
`;

const InterestsSection = styled.div`
  label {
    display: block;
    font-size: 14px;
    font-weight: 500;
    color: #333;
    margin-bottom: 8px;
  }
`;

const InterestsGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const InterestChip = styled.button<{ $selected: boolean }>`
  padding: 6px 12px;
  border: 1px solid ${({ $selected }) => $selected ? '#2D5F4F' : '#e5e5e5'};
  background: ${({ $selected }) => $selected ? '#2D5F4F' : 'white'};
  color: ${({ $selected }) => $selected ? 'white' : '#666'};
  border-radius: 16px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ $selected }) => $selected ? '#1F4A3A' : '#f5f5f5'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const RegisterButton = styled.button`
  background: linear-gradient(135deg, #2D5F4F, #4A90A4);
  color: white;
  border: none;
  padding: 14px;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: linear-gradient(135deg, #1F4A3A, #357A8A);
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

// Check-in Tab Components
const QRCodeSection = styled.div`
  text-align: center;
  padding: 20px;
`;

const QRCodeContainer = styled.div`
  width: 200px;
  height: 200px;
  background: white;
  border: 2px solid #ddd;
  border-radius: 12px;
  margin: 20px auto;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

const QRCanvas = styled.canvas`
  max-width: 100%;
  max-height: 100%;
  border-radius: 8px;
`;

const QRInstructions = styled.div`
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  margin-top: 16px;
`;

// Groups Tab Components
const GroupsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const GroupCard = styled.div`
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 16px;
`;

const GroupHeader = styled.h4`
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: #2D5F4F;
`;

const GroupInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const GroupNumber = styled.div`
  font-size: 20px;
  font-weight: bold;
  color: #2D5F4F;
  text-align: center;
  background: white;
  border: 2px solid #2D5F4F;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
`;

const GroupColor = styled.div`
  font-size: 18px;
  font-weight: 600;
  text-align: center;
  padding: 12px;
  border-radius: 8px;
  background: linear-gradient(135deg, #FF6B6B, #FF8E8E);
  color: white;
  margin: 0 auto 12px;
  width: fit-content;
  min-width: 120px;
`;

const GroupMembers = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const MemberChip = styled.div`
  background: white;
  border: 1px solid #ddd;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  color: #666;
`;

// Feedback Tab Components
const FeedbackForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const RatingSection = styled.div`
  label {
    display: block;
    font-size: 14px;
    font-weight: 500;
    color: #333;
    margin-bottom: 8px;
  }
`;

const StarRating = styled.div`
  display: flex;
  gap: 4px;
  margin-bottom: 16px;
`;

const Star = styled.button<{ $filled: boolean }>`
  background: none;
  border: none;
  font-size: 24px;
  color: ${({ $filled }) => $filled ? '#FFD700' : '#ddd'};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    color: #FFD700;
    transform: scale(1.1);
  }
`;

const TextArea = styled.textarea`
  padding: 12px;
  border: 2px solid #e5e5e5;
  border-radius: 8px;
  font-size: 14px;
  min-height: 100px;
  resize: vertical;
  font-family: inherit;
  
  &:focus {
    outline: none;
    border-color: #2D5F4F;
  }
`;

const SubmitFeedbackButton = styled.button`
  background: linear-gradient(135deg, #28A745, #20C997);
  color: white;
  border: none;
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: linear-gradient(135deg, #218838, #1BA085);
  }
`;

interface BerseMukhaRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId?: string;
}

export const BerseMukhaRegistrationModal: React.FC<BerseMukhaRegistrationModalProps> = ({
  isOpen,
  onClose,
  eventId
}) => {
  const [activeTab, setActiveTab] = useState<'register' | 'checkin' | 'groups' | 'feedback'>('register');
  const [eventContext, setEventContext] = useState<EventContext | null>(null);
  
  // Registration form state
  const [registrationData, setRegistrationData] = useState({
    name: '',
    email: '',
    gender: '',
    ageGroup: '',
    profession: '',
    nationality: '',
    interests: [] as string[]
  });
  
  // Feedback state
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [hoveredStar, setHoveredStar] = useState(0);
  
  const interestOptions = [
    'Technology', 'Business', 'Arts & Culture', 'Sports', 'Travel',
    'Food & Dining', 'Music', 'Photography', 'Literature', 'Science',
    'Environment', 'Social Impact', 'Health & Wellness', 'Fashion',
    'Finance', 'Education', 'Media', 'Gaming', 'Fitness', 'Cooking'
  ];

  // Mock group data
  const mockGroupData = {
    session1Group: 7,
    session2Group: 'Red',
    session1Members: [
      { id: '1', name: 'Ahmad Hassan' },
      { id: '2', name: 'Sarah Lim' },
      { id: '3', name: 'Raj Kumar' },
      { id: '4', name: 'Fatima Ali' },
      { id: '5', name: 'Chen Wei' },
      { id: '6', name: 'Maya Patel' },
      { id: '7', name: 'You' }
    ],
    session2Members: [
      { id: '1', name: 'Omar Zainal' },
      { id: '2', name: 'Lisa Wong' },
      { id: '3', name: 'David Kumar' },
      { id: '4', name: 'Priya Singh' },
      { id: '5', name: 'Alex Tan' },
      { id: '6', name: 'Nina Ibrahim' },
      { id: '7', name: 'You' }
    ]
  };

  useEffect(() => {
    if (eventId && isOpen) {
      const context = deepLinkHandler.getEventContext(eventId);
      setEventContext(context);
    }
  }, [eventId, isOpen]);

  const toggleInterest = (interest: string) => {
    setRegistrationData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : prev.interests.length < 5
          ? [...prev.interests, interest]
          : prev.interests
    }));
  };

  const handleRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!registrationData.name || !registrationData.email || !registrationData.gender || !registrationData.ageGroup) {
      alert('Please fill in all required fields');
      return;
    }
    
    // Simulate registration
    alert(`✅ Registration Successful!

Event: ${eventContext?.title}
Name: ${registrationData.name}
Email: ${registrationData.email}

🎯 You'll receive:
• Event confirmation email
• WhatsApp group invitation
• QR code for check-in
• Group assignments (24h before event)

Thank you for registering! 🎉`);
    
    // Switch to check-in tab
    setActiveTab('checkin');
  };

  const generateQRCode = () => {
    // This is a mock QR code generator for demo purposes
    const canvas = document.getElementById('qr-canvas') as HTMLCanvasElement;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size
    canvas.width = 180;
    canvas.height = 180;
    
    // Draw mock QR code pattern
    ctx.fillStyle = '#2D5F4F';
    ctx.fillRect(0, 0, 180, 180);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(10, 10, 160, 160);
    
    // Draw QR pattern (simplified)
    ctx.fillStyle = '#2D5F4F';
    for (let i = 0; i < 15; i++) {
      for (let j = 0; j < 15; j++) {
        if ((i + j) % 3 === 0) {
          ctx.fillRect(20 + i * 10, 20 + j * 10, 8, 8);
        }
      }
    }
    
    // Add center logo area
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(70, 70, 40, 40);
    ctx.fillStyle = '#2D5F4F';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('BM', 90, 95);
  };

  useEffect(() => {
    if (activeTab === 'checkin' && isOpen) {
      setTimeout(generateQRCode, 100);
    }
  }, [activeTab, isOpen]);

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      alert('Please provide a rating');
      return;
    }
    
    alert(`🙏 Thank you for your feedback!

Rating: ${rating}/5 stars
Comments: ${feedback || 'No additional comments'}

Your feedback helps us improve future events. 
We appreciate your participation! ✨`);
    
    // Reset form
    setRating(0);
    setFeedback('');
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay $isOpen={isOpen} onClick={onClose}>
      <RegistrationModal onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <BackButton onClick={onClose}>
            ← BerseMukha
          </BackButton>
          <ModalTitle>{eventContext?.title || 'BerseMukha Event'}</ModalTitle>
          <div style={{ width: '100px' }} /> {/* Spacer for centering */}
        </ModalHeader>
        
        <TabNavigation>
          <TabButton $active={activeTab === 'register'} onClick={() => setActiveTab('register')}>
            Register
          </TabButton>
          <TabButton $active={activeTab === 'checkin'} onClick={() => setActiveTab('checkin')}>
            Check-in
          </TabButton>
          <TabButton $active={activeTab === 'groups'} onClick={() => setActiveTab('groups')}>
            Groups
          </TabButton>
          <TabButton $active={activeTab === 'feedback'} onClick={() => setActiveTab('feedback')}>
            Feedback
          </TabButton>
        </TabNavigation>

        <TabContent>
          {activeTab === 'register' && (
            <RegistrationForm onSubmit={handleRegistration}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#2D5F4F' }}>
                Event Registration
              </h3>
              
              <FormInput 
                placeholder="Full Name *"
                value={registrationData.name}
                onChange={(e) => setRegistrationData({...registrationData, name: e.target.value})}
                required
              />
              
              <FormInput 
                placeholder="Email Address *"
                type="email"
                value={registrationData.email}
                onChange={(e) => setRegistrationData({...registrationData, email: e.target.value})}
                required
              />
              
              <SelectField>
                <label>Gender *</label>
                <select 
                  value={registrationData.gender} 
                  onChange={(e) => setRegistrationData({...registrationData, gender: e.target.value})}
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="non-binary">Non-binary</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </SelectField>

              <SelectField>
                <label>Age Group *</label>
                <select 
                  value={registrationData.ageGroup} 
                  onChange={(e) => setRegistrationData({...registrationData, ageGroup: e.target.value})}
                  required
                >
                  <option value="">Select Age Group</option>
                  <option value="18-25">18-25</option>
                  <option value="26-35">26-35</option>
                  <option value="36-45">36-45</option>
                  <option value="46-55">46-55</option>
                  <option value="55+">55+</option>
                </select>
              </SelectField>

              <FormInput 
                placeholder="Profession/Field of Work"
                value={registrationData.profession}
                onChange={(e) => setRegistrationData({...registrationData, profession: e.target.value})}
              />

              <FormInput 
                placeholder="Nationality"
                value={registrationData.nationality}
                onChange={(e) => setRegistrationData({...registrationData, nationality: e.target.value})}
              />

              <InterestsSection>
                <label>Interests (Select up to 5)</label>
                <InterestsGrid>
                  {interestOptions.map((interest) => (
                    <InterestChip 
                      key={interest}
                      type="button"
                      $selected={registrationData.interests.includes(interest)}
                      onClick={() => toggleInterest(interest)}
                      disabled={!registrationData.interests.includes(interest) && registrationData.interests.length >= 5}
                    >
                      {interest}
                    </InterestChip>
                  ))}
                </InterestsGrid>
              </InterestsSection>

              <RegisterButton type="submit">
                Register for Event
              </RegisterButton>
            </RegistrationForm>
          )}

          {activeTab === 'checkin' && (
            <QRCodeSection>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#2D5F4F' }}>
                Event Check-in
              </h3>
              <QRCodeContainer>
                <QRCanvas id="qr-canvas" />
              </QRCodeContainer>
              <QRInstructions>
                <strong>Show this QR code to event staff for check-in</strong>
                <br /><br />
                📅 Valid for: {eventContext?.date}<br />
                📍 Location: {eventContext?.location}<br />
                🎯 Event: {eventContext?.title}
                <br /><br />
                <em>Screenshots are accepted. Make sure your screen brightness is at maximum for best scanning.</em>
              </QRInstructions>
            </QRCodeSection>
          )}

          {activeTab === 'groups' && (
            <GroupsContainer>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#2D5F4F' }}>
                👥 My Groups
              </h3>
              
              <GroupCard>
                <GroupHeader>Session 1 - Number Groups</GroupHeader>
                <GroupInfo>
                  <GroupNumber>{mockGroupData.session1Group}</GroupNumber>
                  <GroupMembers>
                    {mockGroupData.session1Members.map(member => (
                      <MemberChip key={member.id} style={{
                        background: member.name === 'You' ? '#2D5F4F' : 'white',
                        color: member.name === 'You' ? 'white' : '#666',
                        fontWeight: member.name === 'You' ? '600' : 'normal'
                      }}>
                        {member.name}
                      </MemberChip>
                    ))}
                  </GroupMembers>
                </GroupInfo>
              </GroupCard>
              
              <GroupCard>
                <GroupHeader>Session 2 - Color Groups</GroupHeader>
                <GroupInfo>
                  <GroupColor>{mockGroupData.session2Group} Team</GroupColor>
                  <GroupMembers>
                    {mockGroupData.session2Members.map(member => (
                      <MemberChip key={member.id} style={{
                        background: member.name === 'You' ? '#FF6B6B' : 'white',
                        color: member.name === 'You' ? 'white' : '#666',
                        fontWeight: member.name === 'You' ? '600' : 'normal'
                      }}>
                        {member.name}
                      </MemberChip>
                    ))}
                  </GroupMembers>
                </GroupInfo>
              </GroupCard>
              
              <div style={{
                background: '#e8f4fd',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '12px',
                color: '#666',
                textAlign: 'center',
                marginTop: '16px'
              }}>
                💡 Group assignments are designed for optimal diversity and meaningful connections.
                Groups will be finalized 24 hours before the event.
              </div>
            </GroupsContainer>
          )}

          {activeTab === 'feedback' && (
            <FeedbackForm onSubmit={handleFeedbackSubmit}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#2D5F4F' }}>
                ⭐ Event Feedback
              </h3>
              
              <RatingSection>
                <label>Overall Event Rating</label>
                <StarRating>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      type="button"
                      $filled={star <= (hoveredStar || rating)}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredStar(star)}
                      onMouseLeave={() => setHoveredStar(0)}
                    >
                      ★
                    </Star>
                  ))}
                </StarRating>
              </RatingSection>

              <TextArea
                placeholder="Share your thoughts about the event... What did you enjoy most? Any suggestions for improvement?"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />

              <SubmitFeedbackButton type="submit">
                Submit Feedback
              </SubmitFeedbackButton>
            </FeedbackForm>
          )}
        </TabContent>
      </RegistrationModal>
    </ModalOverlay>
  );
};

export default BerseMukhaRegistrationModal;