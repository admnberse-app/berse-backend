import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

interface ProfileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileSidebar: React.FC<ProfileSidebarProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose(); // Close sidebar after navigation
  };

  return (
    <>
      {isOpen && <Overlay onClick={onClose} />}
      <SidebarContainer $isOpen={isOpen}>
        <SidebarHeader>
          <CloseButton onClick={onClose}>×</CloseButton>
          <HeaderTitle>Profile</HeaderTitle>
        </SidebarHeader>

        <ProfileCard>
          <ProfileSection>
            <ProfileAvatar>ZM</ProfileAvatar>
            <ProfileInfo>
              <ProfileName>Zayd Mahdaly</ProfileName>
              <ProfileRole>28 • Architect & Photographer</ProfileRole>
              <ProfileBadges>
                <LevelBadge>Lv.7</LevelBadge>
                <TypeBadge>ENFJ-A</TypeBadge>
              </ProfileBadges>
            </ProfileInfo>
            <ProfileRating>
              <RatingIcon>⭐</RatingIcon>
              <RatingScore>7.1</RatingScore>
            </ProfileRating>
          </ProfileSection>

          <TagsSection>
            <TagsRow>
              <InterestTag>Architecture</InterestTag>
              <InterestTag>Photography</InterestTag>
            </TagsRow>
            <TagsRow>
              <InterestTag>Coffee Culture</InterestTag>
              <InterestTag>Travel</InterestTag>
            </TagsRow>
          </TagsSection>

          <BioSection>
            <BioText>
              Architect and photographer exploring traditions and architecture worldwide. 
              Love discovering hidden gems and meeting new people over coffee.
            </BioText>
          </BioSection>

          <BadgesSection>
            <CommunityBadge>🏢 NAMA Foundation</CommunityBadge>
            <CommunityBadge>🏗️ Malaysian Architects</CommunityBadge>
            <CommunityBadge>📸 KL Photography Club</CommunityBadge>
          </BadgesSection>

          <EditButton>
            ✏️ Edit Profile
          </EditButton>
        </ProfileCard>

        <MenuSection>
          {/* 1. Private Messages */}
          <MenuItem onClick={() => handleNavigation('/messages')}>
            <MenuIcon>💬</MenuIcon>
            <MenuContent>
              <MenuTitle>Private Messages</MenuTitle>
            </MenuContent>
            <MenuBadge $color="#E74C3C">3</MenuBadge>
            <MenuArrow>→</MenuArrow>
          </MenuItem>

          {/* 2. Notifications */}
          <MenuItem onClick={() => handleNavigation('/notifications')}>
            <MenuIcon>🔔</MenuIcon>
            <MenuContent>
              <MenuTitle>Notifications</MenuTitle>
            </MenuContent>
            <MenuBadge $color="#E74C3C">5</MenuBadge>
            <MenuArrow>→</MenuArrow>
          </MenuItem>

          {/* 3. Explore Vouchers */}
          <MenuItem onClick={() => handleNavigation('/vouchers')}>
            <MenuIcon>🎫</MenuIcon>
            <MenuContent>
              <MenuTitle>Explore Vouchers</MenuTitle>
            </MenuContent>
            <MenuBadge $color="#FF9800">248 pts</MenuBadge>
            <MenuArrow>→</MenuArrow>
          </MenuItem>

          {/* 4. My Events */}
          <MenuItem onClick={() => handleNavigation('/my-events')}>
            <MenuIcon>📅</MenuIcon>
            <MenuContent>
              <MenuTitle>My Events</MenuTitle>
            </MenuContent>
            <MenuBadge $color="#666">4 events</MenuBadge>
            <MenuArrow>→</MenuArrow>
          </MenuItem>

          {/* 5. BerseCardGame */}
          <MenuItem onClick={() => handleNavigation('/bersecardgame')}>
            <MenuIcon>🃏</MenuIcon>
            <MenuContent>
              <MenuTitle>BerseCardGame</MenuTitle>
              <MenuSubtitle>Interactive conversation starter</MenuSubtitle>
            </MenuContent>
            <MenuArrow>→</MenuArrow>
          </MenuItem>

          {/* 6. Manage Events (Admin) */}
          <MenuItem onClick={() => handleNavigation('/manage-events')}>
            <MenuIcon>⚡</MenuIcon>
            <MenuContent>
              <MenuTitle>Manage Events (Admin)</MenuTitle>
            </MenuContent>
            <MenuBadge $color="#E74C3C">Admin</MenuBadge>
            <MenuArrow>→</MenuArrow>
          </MenuItem>

          {/* REMOVED: My Communities */}
        </MenuSection>
      </SidebarContainer>
    </>
  );
};

// Styled Components
const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 998;
`;

const SidebarContainer = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  max-width: 393px;
  height: 100vh;
  background: #F5F3EF;
  z-index: 999;
  transform: ${({ $isOpen }) => $isOpen ? 'translateX(0)' : 'translateX(-100%)'};
  transition: transform 0.3s ease-in-out;
  overflow-y: auto;
`;

const SidebarHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 16px 20px;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  color: #2D5F4F;
  cursor: pointer;
  margin-right: 16px;
`;

const HeaderTitle = styled.h2`
  font-size: 20px;
  font-weight: bold;
  color: #2D5F4F;
  margin: 0;
`;

const ProfileCard = styled.div`
  background: white;
  margin: 20px;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const ProfileSection = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 16px;
`;

const ProfileAvatar = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #2D5F4F, #1F4A3A);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  box-shadow: 0 4px 12px rgba(45, 95, 79, 0.3);
`;

const ProfileInfo = styled.div`
  flex: 1;
`;

const ProfileName = styled.h3`
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin: 0 0 4px 0;
`;

const ProfileRole = styled.p`
  font-size: 14px;
  color: #666;
  margin: 0 0 8px 0;
`;

const ProfileBadges = styled.div`
  display: flex;
  gap: 8px;
`;

const LevelBadge = styled.span`
  background: #FFD700;
  color: #333;
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 600;
`;

const TypeBadge = styled.span`
  background: #8E44AD;
  color: white;
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 600;
`;

const ProfileRating = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const RatingIcon = styled.div`
  font-size: 16px;
`;

const RatingScore = styled.div`
  font-size: 16px;
  font-weight: bold;
  color: #FFD700;
`;

const TagsSection = styled.div`
  margin-bottom: 16px;
`;

const TagsRow = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
`;

const InterestTag = styled.span`
  background: #E8F4FD;
  color: #1976D2;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
`;

const BioSection = styled.div`
  margin-bottom: 16px;
`;

const BioText = styled.p`
  font-size: 13px;
  color: #333;
  line-height: 1.5;
  margin: 0;
`;

const BadgesSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
`;

const CommunityBadge = styled.div`
  background: #F0F0F0;
  color: #333;
  padding: 8px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
`;


const EditButton = styled.button`
  background: #007bff;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  margin-top: 4px;
  
  &:hover {
    background: #0056b3;
  }
`;

const MenuSection = styled.div`
  background: white;
  margin: 0 20px 20px 20px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;


const MenuIcon = styled.div`
  font-size: 24px;
  margin-right: 16px;
  width: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const MenuContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const MenuTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 2px 0;
`;

const MenuSubtitle = styled.p`
  font-size: 12px;
  color: #666;
  margin: 0;
  line-height: 1.3;
`;

const MenuBadge = styled.span<{ $color: string }>`
  background: ${({ $color }) => $color};
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  margin-right: 12px;
  
  ${({ $color }) => $color === '#666' && `
    background: #F0F0F0;
    color: #666;
  `}
  
  ${({ $color }) => $color === '#FF9800' && `
    background: #FF9800;
    color: white;
  `}
`;

const MenuArrow = styled.div`
  font-size: 16px;
  color: #CCC;
  font-weight: bold;
`;

const MenuItem = styled.div`
  display: flex;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #F0F0F0;
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background-color: #F8F9FA;
  }
  
  &:active {
    background-color: #E9ECEF;
  }
`;