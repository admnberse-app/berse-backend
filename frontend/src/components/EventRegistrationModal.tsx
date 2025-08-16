import React, { useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { TermsModal } from './TermsModal';

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  included: string[];
  spotsLeft: number;
  totalSpots: number;
  price: number;
  image: string;
}

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event | null;
}

interface RegistrationData {
  name: string;
  phone: string;
  emergencyName: string;
  emergencyPhone: string;
  dietaryRestrictions: string;
  agreeToTerms: boolean;
}

// Styled Components
const ModalOverlay = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: ${({ isOpen }) => isOpen ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
`;

const ModalContainer = styled.div`
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 400px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
`;

const ModalHeader = styled.div`
  padding: 20px 20px 0 20px;
  border-bottom: 1px solid #f0f0f0;
  position: sticky;
  top: 0;
  background: white;
  z-index: 10;
`;

const ProgressContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const StepIndicator = styled.div`
  font-size: 14px;
  color: #666;
  font-weight: 500;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  color: #666;
  cursor: pointer;
  padding: 0;
  
  &:hover {
    color: #333;
  }
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 4px;
  background: #f0f0f0;
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 16px;
`;

const ProgressFill = styled.div<{ progress: number }>`
  width: ${({ progress }) => progress}%;
  height: 100%;
  background: linear-gradient(135deg, #2fce98, #4A90A4);
  transition: width 0.3s ease;
`;

const ModalContent = styled.div`
  padding: 20px;
`;

const StepTitle = styled.h2`
  margin: 0 0 16px 0;
  font-size: 20px;
  font-weight: bold;
  color: #333;
`;

const EventCard = styled.div`
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
  background: #f8f9fa;
`;

const EventImage = styled.img`
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 12px;
`;

const EventTitle = styled.h3`
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: bold;
  color: #333;
`;

const EventDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 14px;
  color: #666;
`;

const EventDetail = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const IncludedList = styled.ul`
  margin: 8px 0 0 0;
  padding-left: 20px;
  font-size: 14px;
  color: #666;
`;

const PricingCard = styled.div`
  border: 2px solid #2fce98;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
  background: #f0f8f5;
`;

const PricingRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  
  &:last-child {
    margin-bottom: 0;
    padding-top: 8px;
    border-top: 1px solid #2fce98;
    font-weight: bold;
  }
`;

const DiscountBadge = styled.span`
  background: #FF6B6B;
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  margin-left: 8px;
`;

const BersePassUpgrade = styled.div`
  background: linear-gradient(135deg, #FFD700, #FFA500);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 20px;
  text-align: center;
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #333;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #2fce98;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  resize: vertical;
  min-height: 60px;
  
  &:focus {
    outline: none;
    border-color: #2fce98;
  }
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 20px;
`;

const Checkbox = styled.input`
  margin-top: 2px;
`;

const CheckboxLabel = styled.label`
  font-size: 14px;
  color: #333;
  line-height: 1.4;
`;

const PaymentMethod = styled.div<{ selected: boolean }>`
  border: 2px solid ${({ selected }) => selected ? '#2fce98' : '#e0e0e0'};
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #2fce98;
  }
`;

const PaymentMethodHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
`;

const PaymentMethodName = styled.div`
  font-weight: 500;
  color: #333;
`;

const PaymentMethodBalance = styled.div`
  font-size: 12px;
  color: #666;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  flex: 1;
  padding: 12px;
  border: ${({ variant }) => variant === 'primary' ? 'none' : '1px solid #e0e0e0'};
  border-radius: 8px;
  background: ${({ variant }) => variant === 'primary' ? '#2fce98' : 'white'};
  color: ${({ variant }) => variant === 'primary' ? 'white' : '#333'};
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    opacity: 0.9;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SuccessContainer = styled.div`
  text-align: center;
  padding: 40px 20px;
`;

const SuccessIcon = styled.div`
  width: 80px;
  height: 80px;
  background: #4CAF50;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  font-size: 40px;
  color: white;
`;

const QRCode = styled.div`
  width: 120px;
  height: 120px;
  background: #f0f0f0;
  border: 2px solid #2fce98;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 20px auto;
  font-size: 12px;
  color: #666;
  text-align: center;
`;

const PointsNotification = styled.div`
  background: linear-gradient(135deg, #FFD700, #FFA500);
  border-radius: 8px;
  padding: 12px;
  margin: 16px 0;
  text-align: center;
  font-weight: 500;
`;

// Missing Info Modal Components
const MissingInfoModal = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: ${({ isOpen }) => isOpen ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 2200;
  padding: 20px;
`;

const MissingInfoContent = styled.div`
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 400px;
  max-height: 80vh;
  overflow-y: auto;
`;

const MissingInfoHeader = styled.div`
  padding: 20px 20px 0 20px;
  border-bottom: 1px solid #f0f0f0;
  text-align: center;
`;

const MissingInfoTitle = styled.h3`
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: bold;
  color: #333;
`;

const MissingInfoSubtitle = styled.p`
  margin: 0 0 16px 0;
  font-size: 14px;
  color: #666;
  line-height: 1.4;
`;

const MissingInfoBody = styled.div`
  padding: 20px;
`;

export const EventRegistrationModal: React.FC<RegistrationModalProps> = ({
  isOpen,
  onClose,
  event
}) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [registrationData, setRegistrationData] = useState<RegistrationData>({
    name: user?.fullName || '',
    phone: user?.phone || '',
    emergencyName: user?.emergencyContactName || '',
    emergencyPhone: user?.emergencyContactPhone || '',
    dietaryRestrictions: '',
    agreeToTerms: false
  });
  const [selectedPayment, setSelectedPayment] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showMissingInfoModal, setShowMissingInfoModal] = useState(false);
  const [missingFields, setMissingFields] = useState<string[]>([]);

  const totalSteps = 7;
  const progress = (currentStep / totalSteps) * 100;

  // Mock user data for BersePass
  const hasBersePass = true; // Mock data
  const setelBalance = 45.50; // Mock balance
  const bersePassBalance = 25.30; // Mock balance

  if (!event) return null;

  const originalPrice = event.price;
  const discountedPrice = hasBersePass ? originalPrice * 0.8 : originalPrice;
  const serviceFee = 0.50;
  const totalPrice = discountedPrice + serviceFee;

  // Check for missing required information
  const checkMissingInfo = () => {
    const missing = [];
    if (!user?.phone) missing.push('phone');
    if (!user?.emergencyContactName) missing.push('emergencyContactName');
    if (!user?.emergencyContactPhone) missing.push('emergencyContactPhone');
    return missing;
  };

  const hasAllRequiredInfo = () => {
    return user?.phone && user?.emergencyContactName && user?.emergencyContactPhone;
  };

  const handleInputChange = (field: keyof RegistrationData, value: string | boolean) => {
    setRegistrationData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNext = () => {
    if (currentStep === 1) {
      // Check if we have all required info
      if (hasAllRequiredInfo()) {
        // Show auto-filled registration preview (step 2)
        setCurrentStep(2);
      } else {
        // Show missing info popup first
        const missing = checkMissingInfo();
        setMissingFields(missing);
        setShowMissingInfoModal(true);
      }
    } else if (currentStep === 2) {
      // From registration preview, go to pricing (step 3)
      setCurrentStep(3);
    } else if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setCurrentStep(7); // Go to success step
      
      // Award points
      const currentPoints = parseInt(localStorage.getItem('user_points') || '245');
      const newPoints = currentPoints + 10;
      localStorage.setItem('user_points', newPoints.toString());
      
    }, 2000);
  };

  const handleMissingInfoComplete = () => {
    setShowMissingInfoModal(false);
    // Go to form step (4) to fill missing information
    setCurrentStep(4);
  };

  const handleMissingInfoCancel = () => {
    setShowMissingInfoModal(false);
    // Stay on step 1
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: // Event Details Confirmation
        return (
          <>
            <StepTitle>Event Details</StepTitle>
            <EventCard>
              <EventImage src={event.image} alt={event.title} />
              <EventTitle>{event.title}</EventTitle>
              <EventDetails>
                <EventDetail>
                  <span>📅</span>
                  <span>{event.date} • {event.time}</span>
                </EventDetail>
                <EventDetail>
                  <span>📍</span>
                  <span>{event.location}</span>
                </EventDetail>
                <EventDetail>
                  <span>👥</span>
                  <span>{event.totalSpots - event.spotsLeft}/{event.totalSpots} spots taken</span>
                </EventDetail>
              </EventDetails>
              <div style={{ marginTop: '12px' }}>
                <strong>What's included:</strong>
                <IncludedList>
                  {event.included.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </IncludedList>
              </div>
            </EventCard>
          </>
        );

      case 2: // Auto-filled Registration Preview
        return (
          <>
            <StepTitle>Registration Preview</StepTitle>
            <div style={{ 
              background: '#f0f8f5', 
              border: '1px solid #2fce98', 
              borderRadius: '8px', 
              padding: '16px', 
              marginBottom: '20px' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <span style={{ fontSize: '20px' }}>✅</span>
                <span style={{ fontWeight: 'bold', color: '#2fce98' }}>
                  Registration details auto-filled from your profile
                </span>
              </div>
              <div style={{ fontSize: '14px', color: '#666' }}>
                We've automatically filled your registration using your profile information.
              </div>
            </div>

            <div style={{ 
              background: 'white', 
              border: '1px solid #e0e0e0', 
              borderRadius: '8px', 
              padding: '16px',
              marginBottom: '20px'
            }}>
              <h4 style={{ margin: '0 0 12px 0', color: '#333' }}>Your Registration Details:</h4>
              
              <div style={{ display: 'grid', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#666' }}>Full Name:</span>
                  <strong>{user?.fullName}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#666' }}>Phone:</span>
                  <strong>{user?.phone}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#666' }}>Emergency Contact:</span>
                  <strong>{user?.emergencyContactName}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#666' }}>Emergency Phone:</span>
                  <strong>{user?.emergencyContactPhone}</strong>
                </div>
              </div>
            </div>

            <div style={{ 
              background: '#fff3e0', 
              border: '1px solid #FF9800', 
              borderRadius: '8px', 
              padding: '12px',
              fontSize: '14px',
              color: '#666'
            }}>
              💡 <strong>Need to update your profile?</strong> You can edit your contact information 
              in your profile settings after registration.
            </div>
          </>
        );

      case 3: // Pricing Display
        return (
          <>
            <StepTitle>Pricing</StepTitle>
            {!hasBersePass && (
              <BersePassUpgrade>
                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                  🌟 Upgrade to BersePass & Save!
                </div>
                <div style={{ fontSize: '14px' }}>
                  Get 20% off this event + exclusive benefits
                </div>
              </BersePassUpgrade>
            )}
            <PricingCard>
              <PricingRow>
                <span>Event Fee</span>
                <span>
                  RM {discountedPrice.toFixed(2)}
                  {hasBersePass && (
                    <>
                      <DiscountBadge>20% OFF</DiscountBadge>
                      <div style={{ fontSize: '12px', color: '#666', textDecoration: 'line-through' }}>
                        RM {originalPrice.toFixed(2)}
                      </div>
                    </>
                  )}
                </span>
              </PricingRow>
              <PricingRow>
                <span>Service Fee</span>
                <span>RM {serviceFee.toFixed(2)}</span>
              </PricingRow>
              <PricingRow>
                <span>Total</span>
                <span>RM {totalPrice.toFixed(2)}</span>
              </PricingRow>
            </PricingCard>
            {hasBersePass && (
              <div style={{ textAlign: 'center', color: '#2fce98', fontWeight: '500' }}>
                💰 You're saving RM {(originalPrice - discountedPrice).toFixed(2)} with BersePass!
              </div>
            )}
          </>
        );

      case 4: // Registration Form (only for missing info)
        return (
          <>
            <StepTitle>Registration Details</StepTitle>
            <FormGroup>
              <Label>Full Name *</Label>
              <Input
                type="text"
                value={registrationData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter your full name"
              />
            </FormGroup>
            <FormGroup>
              <Label>Phone Number *</Label>
              <Input
                type="tel"
                value={registrationData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Enter your phone number"
              />
            </FormGroup>
            <FormGroup>
              <Label>Emergency Contact Name *</Label>
              <Input
                type="text"
                value={registrationData.emergencyName}
                onChange={(e) => handleInputChange('emergencyName', e.target.value)}
                placeholder="Emergency contact name"
              />
            </FormGroup>
            <FormGroup>
              <Label>Emergency Contact Phone *</Label>
              <Input
                type="tel"
                value={registrationData.emergencyPhone}
                onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                placeholder="Emergency contact phone"
              />
            </FormGroup>
            <FormGroup>
              <Label>Dietary Restrictions (Optional)</Label>
              <TextArea
                value={registrationData.dietaryRestrictions}
                onChange={(e) => handleInputChange('dietaryRestrictions', e.target.value)}
                placeholder="Any dietary restrictions or allergies we should know about?"
              />
            </FormGroup>
            <CheckboxContainer>
              <Checkbox
                type="checkbox"
                id="terms"
                checked={registrationData.agreeToTerms}
                onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
              />
              <CheckboxLabel htmlFor="terms">
                I agree to the{' '}
                <span 
                  onClick={() => setShowTermsModal(true)}
                  style={{ 
                    color: '#2fce98', 
                    textDecoration: 'underline', 
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  terms & conditions
                </span>
                {' '}and{' '}
                <span 
                  onClick={() => setShowTermsModal(true)}
                  style={{ 
                    color: '#2fce98', 
                    textDecoration: 'underline', 
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  cancellation policy
                </span>
              </CheckboxLabel>
            </CheckboxContainer>
          </>
        );

      case 5: // Payment Method Selection
        return (
          <>
            <StepTitle>Payment Method</StepTitle>
            <PaymentMethod
              selected={selectedPayment === 'setel'}
              onClick={() => setSelectedPayment('setel')}
            >
              <PaymentMethodHeader>
                <PaymentMethodName>🚗 Setel Wallet</PaymentMethodName>
                <PaymentMethodBalance>Balance: RM {setelBalance.toFixed(2)}</PaymentMethodBalance>
              </PaymentMethodHeader>
              {setelBalance < totalPrice && (
                <div style={{ fontSize: '12px', color: '#FF6B6B' }}>
                  Insufficient balance. Top up required.
                </div>
              )}
            </PaymentMethod>
            
            {hasBersePass && (
              <PaymentMethod
                selected={selectedPayment === 'bersepass'}
                onClick={() => setSelectedPayment('bersepass')}
              >
                <PaymentMethodHeader>
                  <PaymentMethodName>⭐ BersePass Balance</PaymentMethodName>
                  <PaymentMethodBalance>Balance: RM {bersePassBalance.toFixed(2)}</PaymentMethodBalance>
                </PaymentMethodHeader>
                {bersePassBalance < totalPrice && (
                  <div style={{ fontSize: '12px', color: '#FF6B6B' }}>
                    Insufficient balance. Choose another method.
                  </div>
                )}
              </PaymentMethod>
            )}
            
            <PaymentMethod
              selected={selectedPayment === 'other'}
              onClick={() => setSelectedPayment('other')}
            >
              <PaymentMethodHeader>
                <PaymentMethodName>💳 Other Payment Methods</PaymentMethodName>
              </PaymentMethodHeader>
              <PaymentMethodBalance>FPX, Credit Card, GrabPay, etc.</PaymentMethodBalance>
            </PaymentMethod>
          </>
        );

      case 6: // Payment Confirmation
        return (
          <>
            <StepTitle>Confirm Payment</StepTitle>
            <EventCard>
              <EventTitle>{event.title}</EventTitle>
              <EventDetails>
                <EventDetail>
                  <span>📅</span>
                  <span>{event.date} • {event.time}</span>
                </EventDetail>
                <EventDetail>
                  <span>👤</span>
                  <span>{registrationData.name}</span>
                </EventDetail>
                <EventDetail>
                  <span>📱</span>
                  <span>{registrationData.phone}</span>
                </EventDetail>
              </EventDetails>
            </EventCard>
            
            <PricingCard>
              <PricingRow>
                <span>Total Amount</span>
                <span>RM {totalPrice.toFixed(2)}</span>
              </PricingRow>
              <PricingRow>
                <span>Payment Method</span>
                <span>
                  {selectedPayment === 'setel' && '🚗 Setel Wallet'}
                  {selectedPayment === 'bersepass' && '⭐ BersePass Balance'}
                  {selectedPayment === 'other' && '💳 Other Methods'}
                </span>
              </PricingRow>
            </PricingCard>
            
            <div style={{ textAlign: 'center', margin: '20px 0' }}>
              <Button
                variant="primary"
                onClick={handlePayment}
                disabled={isProcessing}
                style={{ width: '100%' }}
              >
                {isProcessing ? 'Processing Payment...' : `Confirm & Pay RM ${totalPrice.toFixed(2)}`}
              </Button>
            </div>
          </>
        );

      case 7: // Success & Ticket
        return (
          <SuccessContainer>
            <SuccessIcon>✓</SuccessIcon>
            <StepTitle>Registration Successful!</StepTitle>
            <p style={{ color: '#666', marginBottom: '20px' }}>
              You're all set for {event.title}! Your ticket is ready.
            </p>
            
            <QRCode>
              <div>
                <div style={{ marginBottom: '8px' }}>🎫</div>
                <div>QR Ticket</div>
                <div>#{Math.random().toString(36).substr(2, 9).toUpperCase()}</div>
              </div>
            </QRCode>
            
            <PointsNotification>
              🎉 +10 BersePass Points Earned!
            </PointsNotification>
            
            <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
              <Button 
                variant="secondary" 
                onClick={() => alert('Event added to calendar!')}
              >
                📅 Add to Calendar
              </Button>
              <Button 
                variant="secondary"
                onClick={() => alert('Sharing options opened!')}
              >
                📤 Share
              </Button>
            </div>
          </SuccessContainer>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 4: // Registration form (only shown for missing info)
        return (
          registrationData.name &&
          registrationData.phone &&
          registrationData.emergencyName &&
          registrationData.emergencyPhone &&
          registrationData.agreeToTerms
        );
      case 5: // Payment method selection
        return selectedPayment !== '';
      default:
        return true;
    }
  };

  return (
    <ModalOverlay isOpen={isOpen} onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ProgressContainer>
            <StepIndicator>Step {currentStep} of {totalSteps}</StepIndicator>
            <CloseButton onClick={onClose}>×</CloseButton>
          </ProgressContainer>
          <ProgressBar>
            <ProgressFill progress={progress} />
          </ProgressBar>
        </ModalHeader>
        
        <ModalContent>
          {renderStepContent()}
          
          {currentStep < 7 && (
            <ButtonContainer>
              {currentStep > 1 && (
                <Button variant="secondary" onClick={handleBack}>
                  Back
                </Button>
              )}
              {currentStep < 6 && (
                <Button
                  variant="primary"
                  onClick={handleNext}
                  disabled={!canProceed()}
                >
                  Next
                </Button>
              )}
            </ButtonContainer>
          )}
          
          {currentStep === 7 && (
            <Button
              variant="primary"
              onClick={onClose}
              style={{ width: '100%', marginTop: '20px' }}
            >
              Done
            </Button>
          )}
        </ModalContent>
      </ModalContainer>

      <TermsModal 
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
      />

      {/* Missing Info Modal */}
      <MissingInfoModal isOpen={showMissingInfoModal}>
        <MissingInfoContent onClick={(e) => e.stopPropagation()}>
          <MissingInfoHeader>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📝</div>
            <MissingInfoTitle>Complete Your Profile</MissingInfoTitle>
            <MissingInfoSubtitle>
              We need a few more details to complete your event registration
            </MissingInfoSubtitle>
          </MissingInfoHeader>
          
          <MissingInfoBody>
            <div style={{ 
              background: '#fff3e0', 
              border: '1px solid #FF9800', 
              borderRadius: '8px', 
              padding: '16px',
              marginBottom: '20px'
            }}>
              <h4 style={{ margin: '0 0 8px 0', color: '#E65100' }}>Missing Information:</h4>
              <ul style={{ margin: '0', paddingLeft: '20px', color: '#666' }}>
                {missingFields.includes('phone') && <li>Phone number</li>}
                {missingFields.includes('emergencyContactName') && <li>Emergency contact name</li>}
                {missingFields.includes('emergencyContactPhone') && <li>Emergency contact phone</li>}
              </ul>
            </div>

            <div style={{ 
              background: '#f0f8f5', 
              border: '1px solid #2fce98', 
              borderRadius: '8px', 
              padding: '16px',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span>⚡</span>
                <strong style={{ color: '#2fce98' }}>Quick & Secure</strong>
              </div>
              <p style={{ margin: '0', fontSize: '14px', color: '#666' }}>
                This information is used only for event safety and will be kept confidential. 
                It helps us contact you or your emergency contact if needed during the event.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <Button 
                variant="secondary" 
                onClick={handleMissingInfoCancel}
                style={{ flex: 1 }}
              >
                Cancel
              </Button>
              <Button 
                variant="primary" 
                onClick={handleMissingInfoComplete}
                style={{ flex: 1 }}
              >
                Continue
              </Button>
            </div>
          </MissingInfoBody>
        </MissingInfoContent>
      </MissingInfoModal>
    </ModalOverlay>
  );
};