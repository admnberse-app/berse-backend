import React from 'react';
import styled from 'styled-components';
import { BerseMukhaModerator, berseMukhaModerators } from '../../data/berseMukhaModerators';

const Container = styled.div`
  margin: 24px 0;
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 2px solid #f0f0f0;
`;

const SubTitle = styled.p`
  font-size: 14px;
  color: #666;
  margin-bottom: 16px;
`;

const ModeratorsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 20px;
  
  @media (max-width: 480px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const ModeratorCard = styled.div<{ $color: string; $selected?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  border-radius: 12px;
  border: 2px solid ${({ $selected, $color }) => $selected ? $color : '#e5e5e5'};
  background: ${({ $selected }) => $selected ? 'rgba(255, 255, 255, 0.95)' : 'white'};
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${({ $color }) => $color};
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-color: ${({ $color }) => $color};
  }
`;

const ModeratorNumber = styled.div<{ $color: string }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 18px;
  margin-bottom: 8px;
`;

const ModeratorName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
`;

const ModeratorColor = styled.div`
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
`;

const SlotInfo = styled.div`
  font-size: 11px;
  color: #999;
  margin-top: 4px;
`;

const InfoBox = styled.div`
  background: #f9f9f9;
  border-left: 4px solid #2fce98;
  padding: 12px;
  border-radius: 8px;
  margin-top: 16px;
`;

const InfoText = styled.p`
  font-size: 13px;
  color: #666;
  margin: 0;
  line-height: 1.5;
`;

interface ModeratorSelectionProps {
  selectedModerator?: string;
  onSelectModerator?: (moderatorId: string) => void;
  showSelection?: boolean;
}

export const ModeratorSelection: React.FC<ModeratorSelectionProps> = ({ 
  selectedModerator, 
  onSelectModerator,
  showSelection = false 
}) => {
  return (
    <Container>
      <SectionTitle>BerseMukha Event Moderators</SectionTitle>
      <SubTitle>
        {showSelection 
          ? 'Select your preferred moderator group (optional)' 
          : 'Our experienced moderators will facilitate group conversations'
        }
      </SubTitle>
      
      <ModeratorsGrid>
        {berseMukhaModerators.map((moderator) => (
          <ModeratorCard
            key={moderator.id}
            $color={moderator.colorCode}
            $selected={selectedModerator === moderator.id}
            onClick={() => showSelection && onSelectModerator?.(moderator.id)}
          >
            <ModeratorNumber $color={moderator.colorCode}>
              {moderator.number}
            </ModeratorNumber>
            <ModeratorName>{moderator.name}</ModeratorName>
            <ModeratorColor>{moderator.color} Group</ModeratorColor>
            <SlotInfo>
              {moderator.currentParticipants}/{moderator.maxParticipants} participants
            </SlotInfo>
          </ModeratorCard>
        ))}
      </ModeratorsGrid>
      
      <InfoBox>
        <InfoText>
          <strong>About BerseMukha Groups:</strong> Each moderator leads a small group of 5-7 participants 
          to ensure meaningful conversations. Groups are organized by color for easy identification during events.
        </InfoText>
      </InfoBox>
    </Container>
  );
};