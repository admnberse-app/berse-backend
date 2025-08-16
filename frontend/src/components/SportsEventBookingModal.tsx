import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';

const ModalOverlay = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: ${({ isOpen }) => isOpen ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
`;

const Modal = styled.div`
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 380px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
`;

const ModalHeader = styled.div`
  padding: 20px 20px 0 20px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 20px;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  font-size: 24px;
  color: #666;
  cursor: pointer;
  padding: 4px;
  
  &:hover {
    color: #333;
  }
`;

const EventTitle = styled.h2`
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: bold;
  color: #2fce98;
`;

const EventDetails = styled.div`
  margin-bottom: 20px;
`;

const DetailRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 14px;
  color: #666;
`;

const PriceSection = styled.div`
  background: linear-gradient(135deg, #FF6B6B, #FF8E8E);
  color: white;
  padding: 16px;
  border-radius: 12px;
  margin: 20px;
  text-align: center;
`;

const OriginalPrice = styled.div`
  font-size: 14px;
  text-decoration: line-through;
  opacity: 0.8;
  margin-bottom: 4px;
`;

const DiscountedPrice = styled.div`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 4px;
`;

const BersePassDiscount = styled.div`
  font-size: 12px;
  opacity: 0.9;
`;

const ParticipantsList = styled.div`
  margin: 20px;
`;

const ParticipantsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const ParticipantsTitle = styled.h4`
  margin: 0;
  font-size: 16px;
  color: #333;
`;

const ParticipantsCount = styled.span`
  font-size: 14px;
  color: #666;
`;

const ParticipantItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid #f5f5f5;
  
  &:last-child {
    border-bottom: none;
  }
`;

const ParticipantAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #2fce98, #1F4A3A);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
  font-weight: bold;
`;

const ParticipantInfo = styled.div`
  flex: 1;
`;

const ParticipantName = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #333;
`;

const ParticipantStatus = styled.div<{ status: 'paid' | 'pending' | 'new' }>`
  font-size: 12px;
  color: ${({ status }) => {
    switch (status) {
      case 'paid': return '#4CAF50';
      case 'pending': return '#FF9800';
      case 'new': return '#2196F3';
      default: return '#666';
    }
  }};
`;

const JoinNotification = styled.div`
  background: #E8F5E8;
  color: #4CAF50;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 12px;
  margin: 8px 20px;
  text-align: center;
  animation: fadeIn 0.3s ease;
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const SocialSection = styled.div`
  margin: 20px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
`;

const SocialTitle = styled.h4`
  margin: 0 0 12px 0;
  font-size: 16px;
  color: #333;
`;

const SocialButtons = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
`;

const SocialButton = styled.button<{ color: string }>`
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 8px;
  background: ${({ color }) => color};
  color: white;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  
  &:hover {
    opacity: 0.9;
  }
`;

const InstagramLink = styled.button`
  width: 100%;
  padding: 10px;
  border: 1px solid #E4405F;
  border-radius: 8px;
  background: white;
  color: #E4405F;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  
  &:hover {
    background: #fdf5f6;
  }
`;

const CancellationPolicy = styled.div`
  margin: 20px;
  padding: 16px;
  background: #FFF8E1;
  border-radius: 8px;
  border-left: 4px solid #FF9800;
`;

const PolicyTitle = styled.h5`
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #F57C00;
  font-weight: 600;
`;

const PolicyText = styled.div`
  font-size: 12px;
  color: #666;
  line-height: 1.4;
`;

const ActionButtons = styled.div`
  padding: 20px;
  display: flex;
  gap: 10px;
`;

const PayButton = styled.button`
  flex: 2;
  padding: 14px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, #FF6B6B, #FF8E8E);
  color: white;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  
  &:hover {
    background: linear-gradient(135deg, #FF5252, #FF6B6B);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const CancelButton = styled.button`
  flex: 1;
  padding: 14px;
  border: 1px solid #E5E5E5;
  border-radius: 10px;
  background: white;
  color: #666;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    background: #f5f5f5;
  }
`;

const QRSection = styled.div`
  margin: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  text-align: center;
`;

const QRCodeContainer = styled.div`
  width: 120px;
  height: 120px;
  background: white;
  border: 2px solid #ddd;
  border-radius: 8px;
  margin: 16px auto;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

const QRCanvas = styled.canvas`
  max-width: 100%;
  max-height: 100%;
  border-radius: 6px;
`;

const QRTitle = styled.h4`
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #2fce98;
`;

const QRInstructions = styled.div`
  font-size: 12px;
  color: #666;
  line-height: 1.4;
`;

interface SportsEventBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: any;
}

export const SportsEventBookingModal: React.FC<SportsEventBookingModalProps> = ({
  isOpen,
  onClose,
  event
}) => {
  console.log('🚨 SportsEventBookingModal render:', { 
    isOpen, 
    hasEvent: !!event, 
    eventTitle: event?.title 
  });
  
  const [bookingStep, setBookingStep] = useState<'details' | 'payment' | 'success'>('details');
  const [participants, setParticipants] = useState<any[]>([]);
  const [recentJoins, setRecentJoins] = useState<string[]>([]);
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  // Mock participants data
  useEffect(() => {
    if (isOpen && event) {
      setParticipants([
        { id: 1, name: 'Ahmad Hassan', status: 'paid', avatar: 'AH' },
        { id: 2, name: 'Sarah Lim', status: 'paid', avatar: 'SL' },
        { id: 3, name: 'Raj Kumar', status: 'paid', avatar: 'RK' },
        { id: 4, name: 'Fatima Ali', status: 'paid', avatar: 'FA' },
        { id: 5, name: 'Chen Wei', status: 'pending', avatar: 'CW' },
      ]);
    }
  }, [isOpen, event]);

  // Simulate real-time joins
  useEffect(() => {
    if (isOpen && bookingStep === 'details') {
      const timer = setTimeout(() => {
        const newJoiner = 'Maya just joined!';
        setRecentJoins(prev => [newJoiner, ...prev.slice(0, 2)]);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, bookingStep]);

  // Generate ticket display when booking is successful
  useEffect(() => {
    if (bookingStep === 'success' && qrCanvasRef.current && event) {
      const generateTicketDisplay = () => {
        const canvas = qrCanvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        // Set canvas dimensions
        canvas.width = 116;
        canvas.height = 116;
        
        // Create ticket data
        const ticketId = `BM-${Date.now().toString().slice(-6)}`;
        
        // Background
        ctx.fillStyle = '#2fce98';
        ctx.fillRect(0, 0, 116, 116);
        
        // White border
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(4, 4, 108, 108);
        
        // Logo/Brand area
        ctx.fillStyle = '#2fce98';
        ctx.fillRect(8, 8, 100, 20);
        
        // BerseMuka text
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('BERSEMUKA', 58, 21);
        
        // Ticket ID
        ctx.fillStyle = '#2fce98';
        ctx.font = 'bold 12px Arial';
        ctx.fillText(ticketId, 58, 45);
        
        // Event title (truncated)
        ctx.font = '9px Arial';
        const title = eventWithDefaults.title.length > 15 ? eventWithDefaults.title.substring(0, 15) + '...' : eventWithDefaults.title;
        ctx.fillText(title, 58, 60);
        
        // Price
        ctx.font = 'bold 10px Arial';
        ctx.fillText(`RM ${eventWithDefaults.discountedPrice || eventWithDefaults.price}`, 58, 75);
        
        // Instruction
        ctx.font = '8px Arial';
        ctx.fillStyle = '#666';
        ctx.fillText('Show to host', 58, 88);
        
        // Valid indicator
        ctx.fillStyle = '#4CAF50';
        ctx.font = 'bold 8px Arial';
        ctx.fillText('✓ VALID', 58, 102);
        
        // Create a simple pattern for "QR-like" appearance
        ctx.fillStyle = '#2fce98';
        for (let i = 0; i < 5; i++) {
          for (let j = 0; j < 5; j++) {
            if ((i + j) % 2 === 0) {
              ctx.fillRect(85 + i * 2, 35 + j * 2, 2, 2);
            }
          }
        }
      };
      
      generateTicketDisplay();
    }
  }, [bookingStep, event]);

  const handlePayment = () => {
    setBookingStep('payment');
    // Simulate payment processing
    setTimeout(() => {
      setBookingStep('success');
    }, 2000);
  };

  const handleSocialShare = (platform: 'whatsapp' | 'instagram' | 'copy') => {
    const shareText = `Join me for ${eventWithDefaults.title} at ${eventWithDefaults.location}! Book via BerseMuka app`;
    const shareUrl = `https://bersemuka.app/event/${eventWithDefaults.id}`;
    
    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`, '_blank');
        break;
      case 'instagram':
        // This would typically use Instagram's sharing API or deep link
        alert('Share to Instagram Story - would integrate with Instagram API');
        break;
      case 'copy':
        navigator.clipboard.writeText(shareText + ' ' + shareUrl);
        alert('Link copied to clipboard!');
        break;
    }
  };

  // Don't render if modal is closed
  if (!isOpen) {
    return null;
  }

  // Handle case where modal is open but no event provided
  if (!event) {
    console.log('🚨 MODAL WARNING: Modal open but no event provided');
    return (
      <ModalOverlay isOpen={isOpen} onClick={onClose}>
        <Modal onClick={(e) => e.stopPropagation()}>
          <div style={{ 
            padding: '40px', 
            textAlign: 'center',
            background: 'white',
            borderRadius: '12px'
          }}>
            <h2 style={{ color: '#FF6B6B', marginBottom: '16px' }}>⚠️ Event Data Missing</h2>
            <p style={{ marginBottom: '20px', color: '#666' }}>
              Unable to load event information.
            </p>
            <button 
              type="button"
              onClick={onClose}
              style={{
                padding: '12px 24px',
                background: '#FF6B6B',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Close
            </button>
          </div>
        </Modal>
      </ModalOverlay>
    );
  }

  console.log('🚨 MODAL SUCCESS: Rendering modal for:', event.title);
  
  // Ensure event has required properties with defaults
  const eventWithDefaults = {
    title: 'Sports Event',
    location: 'Sports Center',
    price: 15,
    discountedPrice: 12,
    ...event
  };

  return (
    <ModalOverlay isOpen={isOpen} onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={onClose}>×</CloseButton>
        
        <ModalHeader>
          <EventTitle>{eventWithDefaults.title}</EventTitle>
          <EventDetails>
            <DetailRow>
              <span>📅</span>
              <span>May 18, 2025 • 4:00 PM</span>
            </DetailRow>
            <DetailRow>
              <span>📍</span>
              <span>{eventWithDefaults.location}</span>
            </DetailRow>
            <DetailRow>
              <span>⏱️</span>
              <span>2 hours • Equipment included</span>
            </DetailRow>
            <DetailRow>
              <span>👨‍🏫</span>
              <span>Professional coaching included</span>
            </DetailRow>
          </EventDetails>
        </ModalHeader>

        {bookingStep === 'details' && (
          <>
            <PriceSection>
              <OriginalPrice>RM {eventWithDefaults.price}</OriginalPrice>
              <DiscountedPrice>RM {eventWithDefaults.discountedPrice}</DiscountedPrice>
              <BersePassDiscount>RM 3 discount for BersePass members</BersePassDiscount>
            </PriceSection>

            {recentJoins.map((join, index) => (
              <JoinNotification key={index}>
                🎉 {join}
              </JoinNotification>
            ))}

            <ParticipantsList>
              <ParticipantsHeader>
                <ParticipantsTitle>Participants</ParticipantsTitle>
                <ParticipantsCount>{participants.length}/20 joined</ParticipantsCount>
              </ParticipantsHeader>
              
              {participants.map((participant) => (
                <ParticipantItem key={participant.id}>
                  <ParticipantAvatar>{participant.avatar}</ParticipantAvatar>
                  <ParticipantInfo>
                    <ParticipantName>{participant.name}</ParticipantName>
                    <ParticipantStatus status={participant.status}>
                      {participant.status === 'paid' ? '✓ Paid' : 
                       participant.status === 'pending' ? '⏳ Payment pending' : 
                       '🆕 Just joined'}
                    </ParticipantStatus>
                  </ParticipantInfo>
                </ParticipantItem>
              ))}
            </ParticipantsList>

            <SocialSection>
              <SocialTitle>Share with friends</SocialTitle>
              <SocialButtons>
                <SocialButton 
                  color="#25D366" 
                  onClick={() => handleSocialShare('whatsapp')}
                >
                  📱 WhatsApp
                </SocialButton>
                <SocialButton 
                  color="#1DA1F2" 
                  onClick={() => handleSocialShare('copy')}
                >
                  🔗 Copy Link
                </SocialButton>
              </SocialButtons>
              <InstagramLink onClick={() => handleSocialShare('instagram')}>
                📷 View on Instagram
              </InstagramLink>
            </SocialSection>

            <CancellationPolicy>
              <PolicyTitle>Cancellation Policy</PolicyTitle>
              <PolicyText>
                • Cancel 24+ hours ahead: Full refund<br/>
                • Same-day cancellation: 50% fee applies<br/>
                • No-show: No refund available
              </PolicyText>
            </CancellationPolicy>

            <ActionButtons>
              <PayButton onClick={handlePayment}>
                💳 Pay RM {eventWithDefaults.discountedPrice}
              </PayButton>
              <CancelButton onClick={onClose}>
                Cancel
              </CancelButton>
            </ActionButtons>
          </>
        )}

        {bookingStep === 'payment' && (
          <div style={{ padding: '40px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>💳</div>
            <h3 style={{ color: '#2fce98', marginBottom: '8px' }}>Processing Payment...</h3>
            <p style={{ color: '#666', fontSize: '14px' }}>
              Connecting to Setel Wallet
            </p>
          </div>
        )}

        {bookingStep === 'success' && (
          <>
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
              <h3 style={{ color: '#2fce98', marginBottom: '8px' }}>Booking Confirmed!</h3>
              <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
                Payment successful. See you at the event!
              </p>
            </div>

            <QRSection>
              <QRTitle>Your Event Ticket</QRTitle>
              <QRCodeContainer>
                <QRCanvas ref={qrCanvasRef} />
              </QRCodeContainer>
              <QRInstructions>
                Show this ticket to the host for attendance check-in
              </QRInstructions>
            </QRSection>

            <ActionButtons>
              <PayButton onClick={onClose}>
                ✓ Done
              </PayButton>
            </ActionButtons>
          </>
        )}
      </Modal>
    </ModalOverlay>
  );
};