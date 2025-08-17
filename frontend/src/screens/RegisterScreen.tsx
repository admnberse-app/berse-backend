import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/Button';
import { TextField } from '../components/TextField';
import { StatusBar } from '../components/StatusBar/StatusBar';
import { deepLinkHandler, EventContext } from '../utils/deepLinkHandler';
import { countries, nationalities, getDefaultCountry } from '../data/countries';

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
  background-color: #F9F3E3;
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
  background: linear-gradient(135deg, #2fce98, #4A90A4);
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
      border-color: #2fce98;
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
  border: 1px solid ${({ $selected }) => $selected ? '#2fce98' : '#e5e5e5'};
  background: ${({ $selected }) => $selected ? '#2fce98' : 'white'};
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
  background: linear-gradient(135deg, #2fce98, #4A90A4);
  
  &:hover {
    background: linear-gradient(135deg, #1F4A3A, #357A8A);
  }
`;

const EyeIcon = styled.div`
  cursor: pointer;
  font-size: 20px;
  user-select: none;
  
  &:hover {
    opacity: 0.7;
  }
`;

const PhoneInputContainer = styled.div`
  display: flex;
  gap: 8px;
  align-items: flex-start;
`;

const CountryCodeSelect = styled.select`
  width: 120px;
  height: 40px;
  padding: 8px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  font-size: 14px;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #2fce98;
    box-shadow: 0 0 0 2px rgba(45, 95, 79, 0.1);
  }
`;

const PhoneNumberInput = styled.div`
  flex: 1;
`;

const SearchableSelect = styled.select`
  width: 100%;
  height: 40px;
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  font-size: 14px;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #2fce98;
    box-shadow: 0 0 0 2px rgba(45, 95, 79, 0.1);
  }
`;

const NationalityContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
`;

const LogoContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const Logo = styled.img`
  width: auto;
  height: 60px;
  object-fit: contain;
`;

export const RegisterScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { register } = useAuth();
  
  // Basic registration fields
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(getDefaultCountry());
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Event context and enhanced profile fields
  const [eventContext, setEventContext] = useState<EventContext | null>(null);
  const [nationality, setNationality] = useState('');
  const [countryOfResidence, setCountryOfResidence] = useState('');
  const [city, setCity] = useState('');
  const [gender, setGender] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [ageGroup, setAgeGroup] = useState('');
  const [profession, setProfession] = useState('');
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
    if (!fullName || !username || !email || !phoneNumber || !password || !nationality || !countryOfResidence || !city || !gender || !dateOfBirth) {
      setError('Please fill in all required fields');
      return;
    }
    
    // Validate phone number (must be digits only)
    if (!phoneNumber.match(/^\d+$/)) {
      setError('Phone number must contain only digits');
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
      // Combine country code with phone number
      const fullPhoneNumber = `${selectedCountry.dialCode}${phoneNumber}`;
      
      // Register with enhanced profile data
      await register(email, password, fullName, username, fullPhoneNumber, {
        nationality,
        countryOfResidence,
        city,
        gender,
        dateOfBirth,
        referralCode: referralCode || undefined,
        ageGroup,
        profession,
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
        alert('Registration successful! Welcome to Berse App!');
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
        
        <LogoContainer>
          <Logo src="/Berse App Horizontal words Logo.png" alt="Berse App" />
        </LogoContainer>
        <Title>{eventContext ? 'Create Your Berse App Account' : 'Join Berse App'}</Title>
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
            label="Username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username (displayed in the app)"
            required
            helperText="This is how your name will appear throughout the app"
          />
          
          <TextField
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />
          
          <div>
            <Label>Phone Number *</Label>
            <PhoneInputContainer>
              <CountryCodeSelect
                value={selectedCountry.code}
                onChange={(e) => {
                  const country = countries.find(c => c.code === e.target.value);
                  if (country) setSelectedCountry(country);
                }}
              >
                {countries.map(country => (
                  <option key={country.code} value={country.code}>
                    {country.flag} {country.dialCode}
                  </option>
                ))}
              </CountryCodeSelect>
              <PhoneNumberInput>
                <TextField
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter phone number"
                  required
                />
              </PhoneNumberInput>
            </PhoneInputContainer>
          </div>
          
          <TextField
            label="Password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a password (min 6 characters)"
            required
            endIcon={
              <EyeIcon onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </EyeIcon>
            }
          />
          
          <NationalityContainer>
            <Label>Nationality *</Label>
            <SearchableSelect
              value={nationality}
              onChange={(e) => setNationality(e.target.value)}
              required
            >
              <option value="">Select your nationality</option>
              {nationalities.map(nation => (
                <option key={nation} value={nation}>
                  {nation}
                </option>
              ))}
            </SearchableSelect>
          </NationalityContainer>
          
          <NationalityContainer>
            <Label>Current Country of Residence *</Label>
            <SearchableSelect
              value={countryOfResidence}
              onChange={(e) => setCountryOfResidence(e.target.value)}
              required
            >
              <option value="">Select country of residence</option>
              {nationalities.map(nation => (
                <option key={nation} value={nation}>
                  {nation}
                </option>
              ))}
            </SearchableSelect>
          </NationalityContainer>
          
          <TextField
            label="City of Residence"
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="e.g., Kuala Lumpur, Jakarta, Singapore"
            required
          />
          
          <SelectField>
            <label>Gender *</label>
            <select value={gender} onChange={(e) => setGender(e.target.value)} required>
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </SelectField>
          
          <TextField
            label="Date of Birth"
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            required
            max={new Date().toISOString().split('T')[0]}
          />
          
          <TextField
            label="Referral Code (Optional)"
            type="text"
            value={referralCode}
            onChange={(e) => setReferralCode(e.target.value)}
            placeholder="Enter referral code if you have one"
            helperText="If someone referred you, enter their referral code for bonus points"
          />
          
          {/* Enhanced Profile Information for Event Context */}
          {eventContext && (
            <FormSection>
              <SectionTitle>Additional Details (for event grouping)</SectionTitle>

              <TextField
                label="Profession/Field of Work"
                type="text"
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                placeholder="e.g., Software Engineer, Teacher, etc."
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