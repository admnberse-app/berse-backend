import React, { useState } from 'react';
import styled from 'styled-components';

const Modal = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: ${({ $isOpen }) => $isOpen ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 20px;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
`;

const Header = styled.div`
  background: linear-gradient(135deg, #2fce98, #4A90A4);
  color: white;
  padding: 20px;
  border-radius: 20px 20px 0 0;
  position: relative;
`;

const Title = styled.h2`
  font-size: 20px;
  font-weight: bold;
  margin: 0 0 5px 0;
`;

const Subtitle = styled.p`
  font-size: 14px;
  opacity: 0.9;
  margin: 0;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 15px;
  right: 15px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const Body = styled.div`
  padding: 20px;
`;

const Section = styled.div`
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e5e5e5;
  
  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 12px 0;
`;

const EventDetails = styled.div`
  background: #f9f9f9;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
`;

const DetailRow = styled.div`
  display: flex;
  align-items: flex-start;
  margin-bottom: 12px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const DetailLabel = styled.span`
  font-size: 14px;
  color: #666;
  min-width: 100px;
  margin-right: 12px;
`;

const DetailValue = styled.span`
  font-size: 14px;
  color: #333;
  font-weight: 500;
  flex: 1;
`;

const PaymentMethods = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const PaymentOption = styled.button<{ $selected: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border: 2px solid ${props => props.$selected ? '#2fce98' : '#e5e5e5'};
  border-radius: 12px;
  background: ${props => props.$selected ? '#f0fdf7' : 'white'};
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: #2fce98;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(47, 206, 152, 0.2);
  }
`;

const PaymentInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const PaymentIcon = styled.span`
  font-size: 24px;
`;

const PaymentText = styled.div`
  text-align: left;
`;

const PaymentName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #333;
`;

const PaymentDesc = styled.div`
  font-size: 12px;
  color: #666;
  margin-top: 2px;
`;

const CheckIcon = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #2fce98;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
`;

const QRSection = styled.div`
  text-align: center;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 12px;
`;

const QRCode = styled.div`
  width: 200px;
  height: 200px;
  margin: 0 auto 16px;
  background: white;
  border: 2px solid #e5e5e5;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #999;
`;

const QRInstructions = styled.p`
  font-size: 13px;
  color: #666;
  margin: 0;
`;

const PriceBreakdown = styled.div`
  background: linear-gradient(135deg, #f8f9ff 0%, #e8efff 100%);
  border-radius: 12px;
  padding: 16px;
`;

const PriceRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  
  &:last-child {
    margin-bottom: 0;
    padding-top: 8px;
    border-top: 1px solid #d0d7ff;
    font-weight: 600;
    font-size: 16px;
  }
`;

const PriceLabel = styled.span`
  font-size: 14px;
  color: #333;
`;

const PriceValue = styled.span`
  font-size: 14px;
  color: #333;
`;

const TermsCheckbox = styled.label`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin: 20px 0;
  cursor: pointer;
  
  input {
    margin-top: 3px;
  }
  
  span {
    font-size: 13px;
    color: #666;
    line-height: 1.4;
  }
`;

const NotesSection = styled.div`
  margin-top: 16px;
`;

const NotesTextarea = styled.textarea`
  width: 100%;
  min-height: 80px;
  padding: 12px;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #2fce98;
  }
  
  &::placeholder {
    color: #999;
  }
`;

const LocationLink = styled.a`
  color: #2fce98;
  text-decoration: none;
  cursor: pointer;
  
  &:hover {
    text-decoration: underline;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 20px;
`;

const Button = styled.button`
  flex: 1;
  padding: 14px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PrimaryButton = styled(Button)`
  background: #2fce98;
  color: white;
  
  &:hover:not(:disabled) {
    background: #1F4A3A;
  }
`;

const SecondaryButton = styled(Button)`
  background: #f5f5f5;
  color: #666;
  border: 1px solid #e5e5e5;
  
  &:hover {
    background: #e5e5e5;
  }
`;

const SuccessMessage = styled.div`
  text-align: center;
  padding: 40px 20px;
`;

const SuccessIcon = styled.div`
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  background: #2fce98;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  color: white;
`;

const SuccessTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
`;

const SuccessText = styled.p`
  font-size: 14px;
  color: #666;
  margin: 0;
`;

interface Event {
  id: string;
  title: string;
  description?: string;
  date: string;
  time: string;
  endTime?: string;
  location: string;
  venue: string;
  organizer?: string;
  price: number;
  currency?: string;
  coverImage?: string;
  maxAttendees?: number;
  attendees?: number;
}

interface EventPaymentModalProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userEmail?: string;
  userName?: string;
  userPhone?: string;
}

export const EventPaymentModal: React.FC<EventPaymentModalProps> = ({
  event,
  isOpen,
  onClose,
  onSuccess,
  userEmail,
  userName,
  userPhone
}) => {
  const [selectedPayment, setSelectedPayment] = useState<'qr' | 'stripe' | ''>('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [step, setStep] = useState<'details' | 'payment' | 'success'>('details');
  const [notes, setNotes] = useState('');

  if (!event) return null;

  const isFreeEvent = event.price === 0;

  // Helper function to format time in 12-hour format with AM/PM
  const formatTime12Hour = (time: string): string => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const min = minutes || '00';
    
    if (hour === 0) {
      return `12:${min} AM`;
    } else if (hour < 12) {
      return `${hour}:${min} AM`;
    } else if (hour === 12) {
      return `12:${min} PM`;
    } else {
      return `${hour - 12}:${min} PM`;
    }
  };

  const formatTimeRange = (startTime: string, endTime?: string): string => {
    const start = formatTime12Hour(startTime);
    if (!endTime || endTime === startTime) {
      return start;
    }
    const end = formatTime12Hour(endTime);
    const startPeriod = start.slice(-2);
    const endPeriod = end.slice(-2);
    
    if (startPeriod === endPeriod) {
      return `${start.slice(0, -3)} - ${end}`;
    }
    return `${start} - ${end}`;
  };

  const handlePaymentConfirm = async () => {
    if (!agreeToTerms) return;
    
    setProcessing(true);
    
    // Save registration with notes
    const registrationData = {
      eventId: event.id,
      eventTitle: event.title,
      userName,
      userEmail,
      userPhone,
      notes,
      registeredAt: new Date().toISOString()
    };
    
    // Store in localStorage for now (could be sent to backend)
    const registrations = JSON.parse(localStorage.getItem('event_registrations') || '[]');
    registrations.push(registrationData);
    localStorage.setItem('event_registrations', JSON.stringify(registrations));
    
    // Simulate payment processing
    setTimeout(() => {
      setProcessing(false);
      setPaymentSuccess(true);
      setStep('success');
      
      // Call success callback after a short delay
      setTimeout(() => {
        onSuccess();
      }, 2000);
    }, 2000);
  };

  const handleContinue = () => {
    if (step === 'details') {
      if (isFreeEvent && agreeToTerms) {
        handlePaymentConfirm();
      } else {
        setStep('payment');
      }
    }
  };

  return (
    <Modal $isOpen={isOpen}>
      <ModalContent>
        <Header>
          <CloseButton onClick={onClose}>×</CloseButton>
          <Title>
            {step === 'success' ? '✅ Registration Complete!' :
             step === 'payment' ? '💳 Choose Payment Method' :
             '📋 Confirm Your Details'}
          </Title>
          <Subtitle>
            {step === 'success' ? 'You\'re all set!' :
             step === 'payment' ? 'Select how you\'d like to pay' :
             isFreeEvent ? 'Review and confirm your registration' :
             'Review details and proceed to payment'}
          </Subtitle>
        </Header>

        <Body>
          {step === 'success' ? (
            <SuccessMessage>
              <SuccessIcon>✓</SuccessIcon>
              <SuccessTitle>
                {isFreeEvent ? 'Successfully Registered!' : 'Payment Successful!'}
              </SuccessTitle>
              <SuccessText>
                You've successfully {isFreeEvent ? 'registered for' : 'paid and registered for'} {event.title}.
                Check your email for confirmation details.
              </SuccessText>
            </SuccessMessage>
          ) : step === 'payment' ? (
            <>
              <Section>
                <SectionTitle>Select Payment Method</SectionTitle>
                <PaymentMethods>
                  <PaymentOption
                    $selected={selectedPayment === 'qr'}
                    onClick={() => setSelectedPayment('qr')}
                  >
                    <PaymentInfo>
                      <PaymentIcon>📱</PaymentIcon>
                      <PaymentText>
                        <PaymentName>QR Code Payment</PaymentName>
                        <PaymentDesc>Scan QR code with banking app</PaymentDesc>
                      </PaymentText>
                    </PaymentInfo>
                    {selectedPayment === 'qr' && <CheckIcon>✓</CheckIcon>}
                  </PaymentOption>

                  <PaymentOption
                    $selected={selectedPayment === 'stripe'}
                    onClick={() => setSelectedPayment('stripe')}
                  >
                    <PaymentInfo>
                      <PaymentIcon>💳</PaymentIcon>
                      <PaymentText>
                        <PaymentName>Card Payment (Stripe)</PaymentName>
                        <PaymentDesc>Credit/Debit card via Stripe</PaymentDesc>
                      </PaymentText>
                    </PaymentInfo>
                    {selectedPayment === 'stripe' && <CheckIcon>✓</CheckIcon>}
                  </PaymentOption>
                </PaymentMethods>
              </Section>

              {selectedPayment === 'qr' && (
                <QRSection>
                  <QRCode>[QR Code Placeholder]</QRCode>
                  <QRInstructions>
                    <strong>Reference: EVT-{event.id.slice(-6).toUpperCase()}</strong><br/>
                    1. Scan this QR code with your banking app<br/>
                    2. Include the reference number in payment description<br/>
                    3. Send payment confirmation screenshot to organizer<br/>
                    <span style={{ fontSize: '11px', color: '#999', marginTop: '8px', display: 'block' }}>
                      Note: Organizer will verify payment within 24 hours
                    </span>
                  </QRInstructions>
                </QRSection>
              )}

              {selectedPayment === 'stripe' && (
                <Section>
                  <SectionTitle>Card Details</SectionTitle>
                  <p style={{ fontSize: '13px', color: '#666' }}>
                    You will be redirected to Stripe's secure payment page.
                  </p>
                </Section>
              )}

              <PriceBreakdown>
                <PriceRow>
                  <PriceLabel>Event Price</PriceLabel>
                  <PriceValue>{event.currency || 'RM'} {event.price.toFixed(2)}</PriceValue>
                </PriceRow>
                <PriceRow>
                  <PriceLabel>Processing Fee</PriceLabel>
                  <PriceValue>{event.currency || 'RM'} 0.00</PriceValue>
                </PriceRow>
                <PriceRow>
                  <PriceLabel>Total Amount</PriceLabel>
                  <PriceValue>{event.currency || 'RM'} {event.price.toFixed(2)}</PriceValue>
                </PriceRow>
              </PriceBreakdown>

              <ButtonGroup>
                <SecondaryButton onClick={() => setStep('details')}>
                  Back
                </SecondaryButton>
                <PrimaryButton 
                  onClick={handlePaymentConfirm}
                  disabled={!selectedPayment || processing}
                >
                  {processing ? 'Processing...' : 'Confirm Payment'}
                </PrimaryButton>
              </ButtonGroup>
            </>
          ) : (
            <>
              <Section>
                <SectionTitle>Event Details</SectionTitle>
                <EventDetails>
                  <DetailRow>
                    <DetailLabel>📅 Event</DetailLabel>
                    <DetailValue>{event.title}</DetailValue>
                  </DetailRow>
                  <DetailRow>
                    <DetailLabel>📆 Date</DetailLabel>
                    <DetailValue>{event.date}</DetailValue>
                  </DetailRow>
                  <DetailRow>
                    <DetailLabel>🕐 Time</DetailLabel>
                    <DetailValue>{formatTimeRange(event.time, event.endTime)}</DetailValue>
                  </DetailRow>
                  <DetailRow>
                    <DetailLabel>📍 Location</DetailLabel>
                    <DetailValue>
                      <LocationLink
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.venue + ', ' + event.location)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {event.venue}, {event.location} 🗺️
                      </LocationLink>
                    </DetailValue>
                  </DetailRow>
                  {event.organizer && (
                    <DetailRow>
                      <DetailLabel>👤 Organizer</DetailLabel>
                      <DetailValue>{event.organizer}</DetailValue>
                    </DetailRow>
                  )}
                  <DetailRow>
                    <DetailLabel>💰 Price</DetailLabel>
                    <DetailValue>
                      {isFreeEvent ? 'FREE' : `${event.currency || 'RM'} ${event.price.toFixed(2)}`}
                    </DetailValue>
                  </DetailRow>
                </EventDetails>
              </Section>

              <Section>
                <SectionTitle>Your Information</SectionTitle>
                <DetailRow>
                  <DetailLabel>Name</DetailLabel>
                  <DetailValue>{userName || 'Guest User'}</DetailValue>
                </DetailRow>
                <DetailRow>
                  <DetailLabel>Email</DetailLabel>
                  <DetailValue>{userEmail || 'Not provided'}</DetailValue>
                </DetailRow>
                <DetailRow>
                  <DetailLabel>Phone</DetailLabel>
                  <DetailValue>{userPhone || 'Not provided'}</DetailValue>
                </DetailRow>
                <NotesSection>
                  <DetailLabel style={{ marginBottom: '8px', display: 'block' }}>Notes (Optional)</DetailLabel>
                  <NotesTextarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any special requirements, dietary restrictions, or questions for the organizer..."
                    maxLength={500}
                  />
                  <div style={{ fontSize: '11px', color: '#999', marginTop: '4px', textAlign: 'right' }}>
                    {notes.length}/500 characters
                  </div>
                </NotesSection>
              </Section>

              <TermsCheckbox>
                <input
                  type="checkbox"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                />
                <span>
                  I agree to the event terms and conditions. I understand that 
                  {isFreeEvent ? ' my registration' : ' payment'} is 
                  {isFreeEvent ? ' confirmed upon submission' : ' required to secure my spot'}.
                </span>
              </TermsCheckbox>

              <ButtonGroup>
                <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
                <PrimaryButton 
                  onClick={handleContinue}
                  disabled={!agreeToTerms || processing}
                >
                  {processing ? 'Processing...' : 
                   isFreeEvent ? 'Confirm Registration' : 
                   'Continue to Payment'}
                </PrimaryButton>
              </ButtonGroup>
            </>
          )}
        </Body>
      </ModalContent>
    </Modal>
  );
};