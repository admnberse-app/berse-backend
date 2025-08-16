import React, { useState } from 'react';
import styled from 'styled-components';

const ModalOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: ${({ $isOpen }) => $isOpen ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
  backdrop-filter: blur(2px);
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 20px;
  padding: 24px;
  max-width: 400px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  right: 20px;
  top: 20px;
  background: rgba(0, 0, 0, 0.1);
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  color: #333;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(0, 0, 0, 0.2);
    transform: scale(1.1);
  }
`;

const ModalTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
  padding-right: 40px;
`;

const CommunityInfo = styled.div`
  background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
`;

const CommunityName = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: #2fce98;
  margin-bottom: 4px;
`;

const CommunityStats = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 8px;
  font-size: 12px;
  color: #666;
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const FormSection = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  font-size: 14px;
  min-height: 100px;
  resize: vertical;
  font-family: inherit;
  
  &:focus {
    outline: none;
    border-color: #2fce98;
    box-shadow: 0 0 0 3px rgba(47, 206, 152, 0.1);
  }
  
  &::placeholder {
    color: #999;
    font-style: italic;
  }
`;

const CharCount = styled.div`
  text-align: right;
  font-size: 11px;
  color: #999;
  margin-top: 4px;
`;

const Guidelines = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 20px;
`;

const GuidelinesTitle = styled.h5`
  font-size: 12px;
  font-weight: 600;
  color: #666;
  margin-bottom: 8px;
`;

const GuidelinesList = styled.ul`
  margin: 0;
  padding-left: 20px;
  font-size: 11px;
  color: #666;
  line-height: 1.6;
  
  li {
    margin-bottom: 4px;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
`;

const Button = styled.button`
  flex: 1;
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
`;

const CancelButton = styled(Button)`
  background: #f5f5f5;
  color: #666;
  border: 1px solid #e5e5e5;
  
  &:hover {
    background: #e5e5e5;
  }
`;

const SubmitButton = styled(Button)`
  background: #2fce98;
  color: white;
  border: none;
  
  &:hover {
    background: #26b580;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(47, 206, 152, 0.3);
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
    transform: none;
  }
`;

interface JoinCommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  community: {
    id: string;
    name: string;
    memberCount: number;
    eventCount: number;
    description?: string;
    category?: string;
  } | null;
  onSubmit: (note: string) => void;
}

export const JoinCommunityModal: React.FC<JoinCommunityModalProps> = ({
  isOpen,
  onClose,
  community,
  onSubmit
}) => {
  const [note, setNote] = useState('');
  const maxLength = 500;

  const handleSubmit = () => {
    if (note.trim().length >= 20) {
      onSubmit(note.trim());
      setNote('');
      onClose();
    }
  };

  const handleClose = () => {
    setNote('');
    onClose();
  };

  if (!community) return null;

  return (
    <ModalOverlay $isOpen={isOpen} onClick={handleClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={handleClose}>×</CloseButton>
        
        <ModalTitle>Request to Join Community</ModalTitle>
        
        <CommunityInfo>
          <CommunityName>{community.name}</CommunityName>
          <CommunityStats>
            <StatItem>
              <span>👥</span>
              <span>{community.memberCount} members</span>
            </StatItem>
            <StatItem>
              <span>📅</span>
              <span>{community.eventCount} events</span>
            </StatItem>
            {community.category && (
              <StatItem>
                <span>🏷️</span>
                <span>{community.category}</span>
              </StatItem>
            )}
          </CommunityStats>
          {community.description && (
            <p style={{ 
              fontSize: '12px', 
              color: '#666', 
              marginTop: '8px',
              lineHeight: '1.4' 
            }}>
              {community.description}
            </p>
          )}
        </CommunityInfo>

        <FormSection>
          <Label>
            Why do you want to join this community? *
          </Label>
          <TextArea
            value={note}
            onChange={(e) => setNote(e.target.value.slice(0, maxLength))}
            placeholder="Share what interests you about this community, what you hope to contribute, and why you'd be a great member... (minimum 20 characters)"
            required
          />
          <CharCount>
            {note.length}/{maxLength} characters
            {note.length < 20 && note.length > 0 && (
              <span style={{ color: '#ff4444', marginLeft: '8px' }}>
                (minimum 20 characters required)
              </span>
            )}
          </CharCount>
        </FormSection>

        <Guidelines>
          <GuidelinesTitle>Community Guidelines</GuidelinesTitle>
          <GuidelinesList>
            <li>Be authentic and genuine in your request</li>
            <li>Respect community values and members</li>
            <li>Actively participate in events and discussions</li>
            <li>Contribute positively to the community</li>
          </GuidelinesList>
        </Guidelines>

        <ButtonGroup>
          <CancelButton onClick={handleClose}>
            Cancel
          </CancelButton>
          <SubmitButton 
            onClick={handleSubmit}
            disabled={note.trim().length < 20}
          >
            Send Request
          </SubmitButton>
        </ButtonGroup>
      </ModalContent>
    </ModalOverlay>
  );
};