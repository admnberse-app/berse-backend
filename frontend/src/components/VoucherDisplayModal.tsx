import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { mukhaCafeVoucher } from '../assets/images';

interface VoucherDisplayModalProps {
  isOpen: boolean;
  onClose: () => void;
  voucher: {
    code: string;
    brand: string;
    title: string;
    icon: string;
    value: string;
    expiryDate: Date;
    terms?: string[];
  };
  onNavigateToVouchers?: () => void;
}

// Styled Components
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
  z-index: 2000;
  padding: 20px;
`;

const ModalContainer = styled.div`
  background: white;
  border-radius: 20px;
  width: 100%;
  max-width: 400px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
`;

const SuccessHeader = styled.div`
  background: linear-gradient(135deg, #10B981, #059669);
  padding: 24px;
  text-align: center;
  color: white;
`;

const SuccessIcon = styled.div`
  font-size: 64px;
  margin-bottom: 12px;
  animation: bounce 0.5s ease-out;
  
  @keyframes bounce {
    0% { transform: scale(0.3); opacity: 0; }
    50% { transform: scale(1.05); }
    70% { transform: scale(0.9); }
    100% { transform: scale(1); opacity: 1; }
  }
`;

const SuccessTitle = styled.h2`
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: bold;
`;

const SuccessSubtitle = styled.p`
  margin: 0;
  font-size: 16px;
  opacity: 0.9;
`;

const VoucherContent = styled.div`
  padding: 24px;
`;

const VoucherCard = styled.div`
  background: linear-gradient(135deg, #F5F3EF, #E8F4F0);
  border: 2px dashed #2fce98;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
  text-align: center;
`;

const VoucherBrand = styled.div`
  font-size: 20px;
  font-weight: bold;
  color: #2fce98;
  margin-bottom: 8px;
`;

const VoucherTitle = styled.div`
  font-size: 16px;
  color: #333;
  margin-bottom: 16px;
`;

const VoucherValue = styled.div`
  font-size: 32px;
  font-weight: bold;
  color: #2fce98;
  margin-bottom: 20px;
`;

const QRCodeContainer = styled.div`
  background: white;
  padding: 16px;
  border-radius: 12px;
  display: inline-block;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: zoom-in;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: scale(1.02);
  }
`;

const ZoomModalOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: ${({ $isOpen }) => $isOpen ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 3000;
  padding: 20px;
`;

const ZoomContainer = styled.div`
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ZoomedImage = styled.img`
  max-width: 100%;
  max-height: 100%;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
`;

const ZoomCloseButton = styled.button`
  position: absolute;
  top: -40px;
  right: 0;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  color: #333;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;
  
  &:hover {
    background: white;
  }
`;

const QRCodeImage = styled.img`
  width: 180px;
  height: 180px;
  display: block;
`;

const VoucherCode = styled.div`
  background: #2fce98;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 18px;
  font-weight: bold;
  font-family: 'Courier New', monospace;
  letter-spacing: 2px;
  margin-bottom: 16px;
`;

const ExpiryInfo = styled.div`
  background: #FEF3C7;
  border: 1px solid #F59E0B;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 20px;
  text-align: center;
`;

const ExpiryIcon = styled.span`
  color: #F59E0B;
  font-size: 16px;
  margin-right: 8px;
`;

const ExpiryText = styled.span`
  color: #92400E;
  font-size: 14px;
  font-weight: 500;
`;

const InstructionsSection = styled.div`
  background: #f8f9fa;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
`;

const InstructionsTitle = styled.h3`
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
`;

const InstructionsList = styled.ol`
  margin: 0;
  padding-left: 20px;
  color: #666;
  font-size: 14px;
  line-height: 1.6;
`;

const TermsSection = styled.div`
  margin-bottom: 20px;
`;

const TermsTitle = styled.h4`
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
  color: #666;
`;

const TermsList = styled.ul`
  margin: 0;
  padding-left: 20px;
  color: #999;
  font-size: 12px;
  line-height: 1.5;
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 12px;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'success' }>`
  flex: 1;
  padding: 14px 20px;
  border: ${({ variant }) => 
    variant === 'primary' ? 'none' : 
    variant === 'success' ? 'none' :
    '1px solid #e0e0e0'};
  border-radius: 12px;
  background: ${({ variant }) => 
    variant === 'primary' ? '#2fce98' : 
    variant === 'success' ? '#10B981' :
    'white'};
  color: ${({ variant }) => 
    variant === 'primary' || variant === 'success' ? 'white' : '#333'};
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const FullWidthButton = styled(Button)`
  width: 100%;
`;

const CloseButton = styled.button`
  position: absolute;
  right: 16px;
  top: 16px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  color: white;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

export const VoucherDisplayModal: React.FC<VoucherDisplayModalProps> = ({
  isOpen,
  onClose,
  voucher,
  onNavigateToVouchers
}) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isImageZoomed, setIsImageZoomed] = useState(false);

  useEffect(() => {
    if (isOpen && voucher) {
      // Temporary placeholder - QR code generation will be added later
      setQrCodeUrl('placeholder');
    }
  }, [isOpen, voucher]);

  const handleImageClick = () => {
    if (voucher.brand === 'Mukha Cafe') {
      setIsImageZoomed(true);
    }
  };

  const closeZoom = () => {
    setIsImageZoomed(false);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleNavigateToVouchers = () => {
    onClose();
    if (onNavigateToVouchers) {
      onNavigateToVouchers();
    }
  };

  // Auto-save notification (voucher is already saved when generated)
  const showAutoSaveMessage = () => {
    alert('✅ Voucher automatically saved to My Vouchers!\n\nYou can access your vouchers anytime from your Profile.');
  };

  const handleShare = () => {
    // Create share text
    const shareText = `🎉 I just redeemed a ${voucher.brand} voucher on BerseMuka!\n\n${voucher.title}\nCode: ${voucher.code}\nValid until: ${formatDate(voucher.expiryDate)}\n\nDownload BerseMuka app to earn points and get rewards!`;
    
    if (navigator.share) {
      // Use native sharing if available
      navigator.share({
        title: 'BerseMuka Voucher',
        text: shareText,
        url: window.location.origin
      }).catch(console.error);
    } else {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(shareText).then(() => {
        alert('📋 Voucher details copied to clipboard!\n\nYou can now paste and share with friends.');
      }).catch(() => {
        // Final fallback - show share text in prompt
        prompt('Copy this text to share your voucher:', shareText);
      });
    }
  };

  return (
    <ModalOverlay $isOpen={isOpen} onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <SuccessHeader>
          <CloseButton onClick={onClose}>×</CloseButton>
          <SuccessIcon>🎉</SuccessIcon>
          <SuccessTitle>Voucher Redeemed!</SuccessTitle>
          <SuccessSubtitle>Your voucher is ready to use</SuccessSubtitle>
        </SuccessHeader>
        
        <VoucherContent>
          <VoucherCard>
            <VoucherBrand>{voucher.icon} {voucher.brand}</VoucherBrand>
            <VoucherTitle>{voucher.title}</VoucherTitle>
            <VoucherValue>{voucher.value}</VoucherValue>
            
            {voucher.brand === 'Mukha Cafe' ? (
              <QRCodeContainer onClick={handleImageClick}>
                <img 
                  src={mukhaCafeVoucher} 
                  alt="Mukha Cafe Voucher" 
                  style={{
                    width: '300px',
                    height: 'auto',
                    borderRadius: '8px',
                    maxWidth: '100%'
                  }}
                />
                <div style={{
                  textAlign: 'center',
                  marginTop: '8px',
                  fontSize: '12px',
                  color: '#666'
                }}>
                  Tap to zoom
                </div>
              </QRCodeContainer>
            ) : qrCodeUrl && (
              <QRCodeContainer>
                <div style={{
                  width: '180px',
                  height: '180px',
                  background: '#f0f0f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '48px',
                  borderRadius: '8px'
                }}>
                  📱
                </div>
                <div style={{
                  textAlign: 'center',
                  marginTop: '8px',
                  fontSize: '12px',
                  color: '#666'
                }}>
                  QR Code Coming Soon
                </div>
              </QRCodeContainer>
            )}
            
            <VoucherCode>{voucher.code}</VoucherCode>
          </VoucherCard>
          
          <ExpiryInfo>
            <ExpiryIcon>⏰</ExpiryIcon>
            <ExpiryText>
              {voucher.brand === 'Mukha Cafe' 
                ? 'Valid only on the day of peaceful event (24 hours only)' 
                : `Valid until ${formatDate(voucher.expiryDate)}`
              }
            </ExpiryText>
          </ExpiryInfo>
          
          <InstructionsSection>
            <InstructionsTitle>How to use:</InstructionsTitle>
            <InstructionsList>
              <li>Show this voucher at any {voucher.brand} outlet</li>
              <li>Let the staff scan the QR code or enter the code manually</li>
              <li>Enjoy your discount!</li>
            </InstructionsList>
          </InstructionsSection>
          
          {voucher.terms && voucher.terms.length > 0 && (
            <TermsSection>
              <TermsTitle>Terms & Conditions:</TermsTitle>
              <TermsList>
                {voucher.terms.map((term, index) => (
                  <li key={index}>{term}</li>
                ))}
              </TermsList>
            </TermsSection>
          )}
          
          <ButtonContainer>
            <div style={{
              background: '#10B981',
              color: 'white',
              padding: '12px 16px',
              borderRadius: '8px',
              textAlign: 'center',
              marginBottom: '16px',
              fontSize: '14px',
              fontWeight: '600'
            }}>
              ✅ Voucher automatically saved to My Vouchers!
            </div>
            
            <ButtonRow>
              <Button variant="secondary" onClick={handleShare}>
                📤 Share
              </Button>
              <Button variant="primary" onClick={onClose}>
                ✅ Done
              </Button>
            </ButtonRow>
          </ButtonContainer>
        </VoucherContent>
      </ModalContainer>
      
      {/* Zoom Modal for Mukha Cafe Voucher */}
      <ZoomModalOverlay $isOpen={isImageZoomed} onClick={closeZoom}>
        <ZoomContainer onClick={(e) => e.stopPropagation()}>
          <ZoomCloseButton onClick={closeZoom}>×</ZoomCloseButton>
          <ZoomedImage 
            src={mukhaCafeVoucher} 
            alt="Mukha Cafe Voucher - Zoomed"
          />
        </ZoomContainer>
      </ZoomModalOverlay>
    </ModalOverlay>
  );
};