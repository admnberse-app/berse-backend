import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/Button';
import { TextField } from '../components/TextField';
import { StatusBar } from '../components/StatusBar/StatusBar';
import { ModeratorSelection } from '../components/ModeratorSelection/ModeratorSelection';
import { assignParticipantToModerator, getModeratorById } from '../data/berseMukhaModerators';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: linear-gradient(135deg, #F9F3E3 0%, #E8DCC0 100%);
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 24px;
  font-weight: bold;
  color: #2fce98;
`;

const EventBadge = styled.div`
  background: #2fce98;
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
`;

const Content = styled.div`
  flex: 1;
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
  max-width: 600px;
  width: 100%;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: bold;
  color: #2fce98;
  margin-bottom: 8px;
  text-align: center;
`;

const Subtitle = styled.p`
  font-size: 16px;
  color: #666;
  margin-bottom: 32px;
  text-align: center;
  line-height: 1.5;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormSection = styled.div`
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const GenderSelect = styled.div`
  display: flex;
  gap: 12px;
  margin: 12px 0;
`;

const GenderOption = styled.label<{ $selected: boolean }>`
  flex: 1;
  padding: 12px;
  border: 2px solid ${({ $selected }) => $selected ? '#2fce98' : '#e5e5e5'};
  background: ${({ $selected }) => $selected ? '#2fce98' : 'white'};
  color: ${({ $selected }) => $selected ? 'white' : '#333'};
  border-radius: 8px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  
  input {
    display: none;
  }
  
  &:hover {
    border-color: #2fce98;
    background: ${({ $selected }) => $selected ? '#1F4A3A' : '#f9f9f9'};
  }
`;

const AgeGroupSelect = styled.select`
  width: 100%;
  padding: 12px;
  border: 2px solid #e5e5e5;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  color: #333;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #2fce98;
    box-shadow: 0 0 0 3px rgba(45, 95, 79, 0.1);
  }
`;

const ErrorMessage = styled.div`
  background: #fee;
  color: #c00;
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  text-align: center;
  margin: 16px 0;
`;

const SuccessMessage = styled.div`
  background: #e6f7e6;
  color: #2fce98;
  padding: 16px;
  border-radius: 8px;
  text-align: center;
  margin: 16px 0;
  
  h4 {
    font-size: 18px;
    margin-bottom: 8px;
  }
  
  p {
    font-size: 14px;
    margin: 4px 0;
  }
`;

const RegisterButton = styled(Button)`
  background: linear-gradient(135deg, #2fce98, #4A90A4);
  padding: 16px;
  font-size: 16px;
  font-weight: 600;
  
  &:hover {
    background: linear-gradient(135deg, #1F4A3A, #357A8A);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const InfoCard = styled.div`
  background: #fff9e6;
  border-left: 4px solid #f59e0b;
  padding: 12px;
  border-radius: 8px;
  margin: 16px 0;
  
  p {
    font-size: 13px;
    color: #666;
    margin: 0;
    line-height: 1.5;
  }
  
  strong {
    color: #333;
  }
`;

export const BerseMukhaRegisterScreen: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  // Simplified registration fields
  const [firstName, setFirstName] = useState('');
  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [gender, setGender] = useState('');
  const [ageGroup, setAgeGroup] = useState('');
  const [selectedModeratorId, setSelectedModeratorId] = useState<string>('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [assignedModerator, setAssignedModerator] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!firstName || !username || !phoneNumber || !gender || !ageGroup) {
      setError('Please fill in all required fields');
      return;
    }

    // Validate phone number
    if (!phoneNumber.match(/^\d{10,15}$/)) {
      setError('Please enter a valid phone number (10-15 digits)');
      return;
    }

    setIsLoading(true);

    try {
      // Auto-assign to a moderator if none selected
      let moderatorId = selectedModeratorId;
      if (!moderatorId) {
        // Find the moderator with least participants
        const availableModerators = Array.from({ length: 15 }, (_, i) => i + 1);
        const randomModeratorNumber = availableModerators[Math.floor(Math.random() * availableModerators.length)];
        moderatorId = `mod-${randomModeratorNumber}`;
      }

      // Assign participant to moderator
      const assigned = assignParticipantToModerator(moderatorId);
      if (!assigned) {
        setError('Selected group is full. Please choose another moderator.');
        setIsLoading(false);
        return;
      }

      const moderator = getModeratorById(moderatorId);
      setAssignedModerator(moderator);

      // Create simplified user account
      const email = `${username.toLowerCase()}@bersemukha.temp`;
      const password = phoneNumber; // Using phone as temporary password

      await register(email, password, firstName, username, phoneNumber, {
        gender,
        ageGroup,
        selectedModeratorId: moderatorId,
        registrationSource: 'bersemukha-event',
        isBerseMukhaParticipant: true,
        moderatorInfo: {
          id: moderator?.id,
          name: moderator?.name,
          number: moderator?.number,
          color: moderator?.color
        }
      });

      setRegistrationSuccess(true);
      
      // Redirect after success
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
      
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (registrationSuccess && assignedModerator) {
    return (
      <Container>
        <StatusBar />
        <Header>
          <Logo>🤝 BerseMukha</Logo>
          <EventBadge>Event Registration</EventBadge>
        </Header>
        <Content>
          <SuccessMessage>
            <h4>✅ Registration Successful!</h4>
            <p><strong>Welcome to BerseMukha, {firstName}!</strong></p>
            <p>You've been assigned to:</p>
            <p style={{ fontSize: '20px', fontWeight: 'bold', color: assignedModerator.colorCode }}>
              Group {assignedModerator.number} - {assignedModerator.color}
            </p>
            <p>Moderator: <strong>{assignedModerator.name}</strong></p>
            <p style={{ marginTop: '12px', fontSize: '12px' }}>Redirecting to dashboard...</p>
          </SuccessMessage>
        </Content>
      </Container>
    );
  }

  return (
    <Container>
      <StatusBar />
      <Header>
        <Logo>🤝 BerseMukha</Logo>
        <EventBadge>Event Registration</EventBadge>
      </Header>
      
      <Content>
        <Title>Join BerseMukha Event</Title>
        <Subtitle>
          Register to participate in facilitated group conversations
        </Subtitle>
        
        <Form onSubmit={handleSubmit}>
          <FormSection>
            <SectionTitle>
              👤 Basic Information
            </SectionTitle>
            <FieldGroup>
              <TextField
                label="First Name"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Enter your first name"
                required
              />
              
              <TextField
                label="Username (Display Name)"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a username"
                required
                helperText="This is how others will see you"
              />
              
              <TextField
                label="Phone Number"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter your phone number"
                required
                helperText="10-15 digits, no spaces or symbols"
              />
            </FieldGroup>
          </FormSection>

          <FormSection>
            <SectionTitle>
              👥 Group Assignment Info
            </SectionTitle>
            <FieldGroup>
              <div>
                <label style={{ fontSize: '14px', fontWeight: '500', color: '#333', marginBottom: '8px', display: 'block' }}>
                  Gender *
                </label>
                <GenderSelect>
                  <GenderOption $selected={gender === 'male'}>
                    <input
                      type="radio"
                      name="gender"
                      value="male"
                      checked={gender === 'male'}
                      onChange={(e) => setGender(e.target.value)}
                    />
                    Male
                  </GenderOption>
                  <GenderOption $selected={gender === 'female'}>
                    <input
                      type="radio"
                      name="gender"
                      value="female"
                      checked={gender === 'female'}
                      onChange={(e) => setGender(e.target.value)}
                    />
                    Female
                  </GenderOption>
                </GenderSelect>
              </div>
              
              <div>
                <label style={{ fontSize: '14px', fontWeight: '500', color: '#333', marginBottom: '8px', display: 'block' }}>
                  Age Group *
                </label>
                <AgeGroupSelect value={ageGroup} onChange={(e) => setAgeGroup(e.target.value)} required>
                  <option value="">Select Age Group</option>
                  <option value="18-25">18-25 years</option>
                  <option value="26-35">26-35 years</option>
                  <option value="36-45">36-45 years</option>
                  <option value="46-55">46-55 years</option>
                  <option value="56+">56+ years</option>
                </AgeGroupSelect>
              </div>
            </FieldGroup>
          </FormSection>
          
          <ModeratorSelection 
            selectedModerator={selectedModeratorId}
            onSelectModerator={setSelectedModeratorId}
            showSelection={true}
          />
          
          <InfoCard>
            <p>
              <strong>Note:</strong> If you don't select a moderator, you'll be automatically assigned to an available group. 
              Each group has 5-7 participants for optimal conversation flow.
            </p>
          </InfoCard>
          
          {error && <ErrorMessage>{error}</ErrorMessage>}
          
          <RegisterButton
            variant="primary"
            size="large"
            type="submit"
            disabled={isLoading}
            fullWidth
          >
            {isLoading ? 'Registering...' : 'Complete Registration'}
          </RegisterButton>
        </Form>
      </Content>
    </Container>
  );
};