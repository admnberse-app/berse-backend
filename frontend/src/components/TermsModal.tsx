import React from 'react';
import styled from 'styled-components';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

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
  z-index: 2100;
  padding: 20px;
`;

const ModalContainer = styled.div`
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  padding: 20px 20px 0 20px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 18px;
  font-weight: bold;
  color: #333;
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

const ModalContent = styled.div`
  padding: 20px;
`;

const Section = styled.div`
  margin-bottom: 24px;
`;

const SectionTitle = styled.h3`
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: #2D5F4F;
`;

const SectionContent = styled.div`
  font-size: 14px;
  line-height: 1.6;
  color: #333;
  
  ul {
    padding-left: 20px;
    margin: 8px 0;
  }
  
  li {
    margin-bottom: 4px;
  }
`;

const HighlightBox = styled.div`
  background: #f0f8f5;
  border: 1px solid #2D5F4F;
  border-radius: 8px;
  padding: 12px;
  margin: 12px 0;
`;

export const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose }) => {
  return (
    <ModalOverlay isOpen={isOpen} onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Terms & Conditions</ModalTitle>
          <CloseButton onClick={onClose}>×</CloseButton>
        </ModalHeader>
        
        <ModalContent>
          <Section>
            <SectionTitle>🏃‍♂️ Event Participation</SectionTitle>
            <SectionContent>
              <p>By registering for Sukan Squad events, you agree to:</p>
              <ul>
                <li>Participate at your own risk and maintain appropriate fitness levels</li>
                <li>Follow all safety guidelines provided by event organizers</li>
                <li>Respect fellow participants and maintain Islamic values</li>
                <li>Arrive on time and bring required equipment if specified</li>
              </ul>
            </SectionContent>
          </Section>

          <Section>
            <SectionTitle>💰 Payment & Cancellation Policy</SectionTitle>
            <HighlightBox>
              <strong>Cancellation Terms:</strong>
              <ul>
                <li><strong>Free cancellation:</strong> Within 24 hours of booking</li>
                <li><strong>50% refund:</strong> 24-48 hours before event</li>
                <li><strong>No refund:</strong> Less than 48 hours before event</li>
                <li><strong>Medical emergency:</strong> Full refund with documentation</li>
              </ul>
            </HighlightBox>
          </Section>

          <Section>
            <SectionTitle>🏥 Health & Safety</SectionTitle>
            <SectionContent>
              <ul>
                <li>You must be in good health to participate in sports activities</li>
                <li>Inform organizers of any medical conditions or injuries</li>
                <li>Emergency contact information is required and will be kept confidential</li>
                <li>Basic first aid will be available at all events</li>
              </ul>
            </SectionContent>
          </Section>

          <Section>
            <SectionTitle>🤝 Community Standards</SectionTitle>
            <SectionContent>
              <p>BerseMuka maintains high community standards:</p>
              <ul>
                <li>Respectful behavior towards all participants</li>
                <li>No harassment, discrimination, or inappropriate conduct</li>
                <li>Islamic values and modest behavior expected</li>
                <li>Violation may result in removal from event and platform</li>
              </ul>
            </SectionContent>
          </Section>

          <Section>
            <SectionTitle>📱 BersePass Benefits</SectionTitle>
            <SectionContent>
              <ul>
                <li>20% discount on all Sukan Squad events</li>
                <li>Priority booking for popular events</li>
                <li>Exclusive access to premium coaching sessions</li>
                <li>Earn additional BersePass points for each event</li>
              </ul>
            </SectionContent>
          </Section>

          <Section>
            <SectionTitle>⚖️ Liability</SectionTitle>
            <SectionContent>
              <p>
                Participants acknowledge that sports activities involve inherent risks. 
                BerseMuka and event organizers are not liable for injuries, accidents, 
                or personal property loss during events. Insurance coverage is recommended.
              </p>
            </SectionContent>
          </Section>

          <div style={{ textAlign: 'center', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #f0f0f0' }}>
            <button
              onClick={onClose}
              style={{
                padding: '12px 24px',
                background: '#2D5F4F',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              I Understand
            </button>
          </div>
        </ModalContent>
      </ModalContainer>
    </ModalOverlay>
  );
};