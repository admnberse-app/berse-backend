import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/Button';
import { TextField } from '../components/TextField';
import { StatusBar } from '../components/StatusBar/StatusBar';
import { deepLinkHandler, EventContext } from '../utils/deepLinkHandler';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #F9F3E3;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  padding: 16px 20px;
  background-color: #F5F3EF;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Content = styled.div`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.xl};
  display: flex;
  flex-direction: column;
  justify-content: center;
  max-width: 393px;
  width: 100%;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.typography.heading.h1.fontSize};
  font-weight: ${({ theme }) => theme.typography.heading.h1.fontWeight};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  text-align: center;
`;

const Subtitle = styled.p`
  font-size: ${({ theme }) => theme.typography.body.large.fontSize};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing.xxl};
  text-align: center;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const ErrorMessage = styled.div`
  color: ${({ theme }) => theme.colors.status.error};
  font-size: ${({ theme }) => theme.typography.body.small.fontSize};
  text-align: center;
  margin-top: ${({ theme }) => theme.spacing.sm};
`;

const LoginLink = styled.div`
  text-align: center;
  margin-top: ${({ theme }) => theme.spacing.xl};
  font-size: ${({ theme }) => theme.typography.body.medium.fontSize};
  color: ${({ theme }) => theme.colors.text.secondary};

  a {
    color: ${({ theme }) => theme.colors.primary.main};
    text-decoration: none;
    font-weight: ${({ theme }) => theme.typography.body.medium.fontWeight};

    &:hover {
      text-decoration: underline;
    }
  }
`;

// Event Context Banner Components
const EventContextBanner = styled.div`
  background: linear-gradient(135deg, #2D5F4F, #4A90A4);
  color: white;
  padding: 20px;
  margin: -20px -20px 20px -20px;
  border-radius: 0 0 16px 16px;
`;

const EventBanner = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const EventIcon = styled.div`
  font-size: 24px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const EventInfo = styled.div`
  flex: 1;
`;

const EventTitle = styled.div`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
`;

const EventDate = styled.div`
  font-size: 12px;
  opacity: 0.9;
`;

// Enhanced Form Components
const FormSection = styled.div`
  margin-bottom: 24px;
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid #f0f0f0;
`;

const SelectField = styled.div`
  margin-bottom: 16px;
  
  label {
    display: block;
    font-size: 14px;
    font-weight: 500;
    color: #333;
    margin-bottom: 8px;
  }
  
  select {
    width: 100%;
    padding: 12px;
    border: 2px solid #e5e5e5;
    border-radius: 8px;
    font-size: 14px;
    background: white;
    color: #333;
    
    &:focus {
      outline: none;
      border-color: #2D5F4F;
    }
  }
`;

const InterestsSection = styled.div`
  margin-bottom: 16px;
  
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

const CreateAccountButton = styled(Button)`
  background: linear-gradient(135deg, #2D5F4F, #4A90A4);
  
  &:hover {
    background: linear-gradient(135deg, #1F4A3A, #357A8A);
  }
`;

export const RegisterScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { register } = useAuth();
  
  // Basic registration fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Event context and enhanced profile fields
  const [eventContext, setEventContext] = useState<EventContext | null>(null);
  const [gender, setGender] = useState('');
  const [ageGroup, setAgeGroup] = useState('');
  const [profession, setProfession] = useState('');
  const [nationality, setNationality] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  
  // Interest options for BerseMukha events
  const interestOptions = [
    'Technology', 'Business', 'Arts & Culture', 'Sports', 'Travel',
    'Food & Dining', 'Music', 'Photography', 'Literature', 'Science',
    'Environment', 'Social Impact', 'Health & Wellness', 'Fashion',
    'Finance', 'Education', 'Media', 'Gaming', 'Fitness', 'Cooking'
  ];
  
  // Check for event context on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const eventId = urlParams.get('event');
    
    if (eventId) {
      const context = deepLinkHandler.getEventContext(eventId);
      if (context) {
        setEventContext(context);
        console.log(`🎯 Event context found for registration:`, context);
      }
    }
    
    // Also check session storage for pending event context
    const pendingContext = deepLinkHandler.getPendingEventContext();
    if (pendingContext && !eventContext) {
      setEventContext(pendingContext);
    }
  }, [location, eventContext]);

  const toggleInterest = (interest: string) => {
    setInterests(prev => {
      if (prev.includes(interest)) {
        return prev.filter(i => i !== interest);
      } else if (prev.length < 5) {
        return [...prev, interest];
      }
      return prev;
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!fullName || !email || !phoneNumber || !password) {
      setError('Please fill in all required fields');
      return;
    }

    // Enhanced validation for event registration
    if (eventContext && (!gender || !ageGroup)) {
      setError('Please complete your profile information for event grouping');
      return;
    }

    // Validate password strength
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);

    try {
      // Register with enhanced profile data
      await register(email, password, fullName, phoneNumber, {
        gender,
        ageGroup,
        profession,
        nationality,
        interests,
        registrationSource: eventContext ? 'event-deeplink' : 'direct',
        eventContext: eventContext ? {
          eventId: eventContext.id,
          eventTitle: eventContext.title,
          registrationTimestamp: new Date().toISOString()
        } : undefined
      });
      
      // Clear pending event context
      deepLinkHandler.clearPendingEventContext();
      
      // Show success message
      if (eventContext) {
        alert(`✅ Registration successful!\n\nYou're now registered for:\n${eventContext.title}\n\nWe'll redirect you to the event page.`);
        // Navigate to BerseConnect with event highlighted
        navigate(`/connect?highlight=${eventContext.id}`);
      } else {
        alert('Registration successful! Welcome to BerseMuka!');
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to register. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <StatusBar />
      <Header>
        <BackButton onClick={() => navigate('/')}>
          ← Back
        </BackButton>
      </Header>
      <Content>
        {eventContext && (
          <EventContextBanner>
            <EventBanner>
              <EventIcon>🎯</EventIcon>
              <EventInfo>
                <EventTitle>You're registering for: {eventContext.title}</EventTitle>
                <EventDate>📅 {eventContext.date} • 📍 {eventContext.location}</EventDate>
              </EventInfo>
            </EventBanner>
          </EventContextBanner>
        )}
        
        <Title>{eventContext ? 'Create Your BerseMukha Account' : 'Join BerseMuka'}</Title>
        <Subtitle>
          {eventContext 
            ? 'Fill in your details to join the community and register for the event'
            : 'Create your account and start connecting'
          }
        </Subtitle>
        
        <Form onSubmit={handleSubmit}>
          <TextField
            label="Full Name"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Enter your full name"
            required
          />
          
          <TextField
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />
          
          <TextField
            label="Phone Number"
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Enter your phone number"
            required
          />
          
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a password (min 6 characters)"
            required
          />
          
          {/* Enhanced Profile Information for Event Context */}
          {eventContext && (
            <FormSection>
              <SectionTitle>Profile Details (for event grouping)</SectionTitle>
              
              <SelectField>
                <label>Gender *</label>
                <select value={gender} onChange={(e) => setGender(e.target.value)} required>
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="non-binary">Non-binary</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </SelectField>

              <SelectField>
                <label>Age Group *</label>
                <select value={ageGroup} onChange={(e) => setAgeGroup(e.target.value)} required>
                  <option value="">Select Age Group</option>
                  <option value="18-25">18-25</option>
                  <option value="26-35">26-35</option>
                  <option value="36-45">36-45</option>
                  <option value="46-55">46-55</option>
                  <option value="55+">55+</option>
                </select>
              </SelectField>

              <TextField
                label="Profession/Field of Work"
                type="text"
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                placeholder="e.g., Software Engineer, Teacher, etc."
              />

              <TextField
                label="Nationality"
                type="text"
                value={nationality}
                onChange={(e) => setNationality(e.target.value)}
                placeholder="e.g., Malaysian, Singaporean, etc."
              />

              <InterestsSection>
                <label>Interests (Select up to 5)</label>
                <InterestsGrid>
                  {interestOptions.map((interest) => (
                    <InterestChip 
                      key={interest}
                      type="button"
                      $selected={interests.includes(interest)}
                      onClick={() => toggleInterest(interest)}
                      disabled={!interests.includes(interest) && interests.length >= 5}
                    >
                      {interest}
                    </InterestChip>
                  ))}
                </InterestsGrid>
              </InterestsSection>
            </FormSection>
          )}
          
          {error && <ErrorMessage>{error}</ErrorMessage>}
          
          <CreateAccountButton
            variant="primary"
            size="large"
            type="submit"
            disabled={isLoading}
            fullWidth
          >
            {isLoading 
              ? 'Creating account...' 
              : eventContext 
                ? `Create Account & Register for ${eventContext.title}` 
                : 'Register'
            }
          </CreateAccountButton>
        </Form>
        
        <LoginLink>
          Already have an account? <Link to="/login">Login here</Link>
        </LoginLink>
      </Content>
    </Container>
  );
};