import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { DualQRModal } from '../DualQRModal';

interface ProfileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileSidebar: React.FC<ProfileSidebarProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [setelBalance, setSetelBalance] = useState(45.60);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [currentPoints, setCurrentPoints] = useState(245);
  const [isDualQRModalOpen, setIsDualQRModalOpen] = useState(false);
  const [isManagePassModalOpen, setIsManagePassModalOpen] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(true); // true = active/paid, false = not subscribed

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

        {/* BersePass Card */}
        <BersePassCard $isSubscribed={isSubscribed}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '16px' 
          }}>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: '600', 
              color: '#333', 
              margin: 0 
            }}>BersePass</h3>
            <div style={{
              background: isSubscribed ? '#00C851' : '#FF4444',
              color: 'white',
              padding: '4px 12px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <div style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: 'white'
              }}></div>
              {isSubscribed ? 'Active' : 'Expired'}
            </div>
          </div>
          
{isSubscribed ? (
            <>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start', 
                marginBottom: '20px' 
              }}>
                <div>
                  <div style={{ 
                    fontSize: '28px', 
                    fontWeight: 'bold', 
                    color: '#333', 
                    lineHeight: '1' 
                  }}>
                    RM {isLoadingBalance ? '...' : setelBalance.toFixed(2)}
                  </div>
                  <div style={{ 
                    fontSize: '11px', 
                    color: '#666', 
                    marginTop: '4px' 
                  }}>Current Balance</div>
                </div>
                
                <div style={{ textAlign: 'right', lineHeight: '1.3' }}>
                  <div style={{ fontSize: '12px', color: '#666' }}>RM 19.99/month</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Next: Dec 15</div>
                </div>
              </div>
              
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                gap: '8px' 
              }}>
                <button style={{
                  background: '#f8f9fa',
                  color: '#333',
                  border: '1px solid #e9ecef',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  textAlign: 'center',
                  flex: '1',
                  cursor: 'pointer',
                  transition: 'background 0.2s ease'
                }}>
                  Top-up in Setel
                </button>
                
                <button style={{
                  background: '#f8f9fa',
                  color: '#333',
                  border: '1px solid #e9ecef',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  textAlign: 'center',
                  flex: '1',
                  cursor: 'pointer',
                  transition: 'background 0.2s ease'
                }}>
                  Manage Pass
                </button>
              </div>
            </>
          ) : (
            <>
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                marginBottom: '20px',
                padding: '20px 0'
              }}>
                <div style={{ 
                  fontSize: '48px',
                  marginBottom: '12px'
                }}>⚠️</div>
                <div style={{ 
                  fontSize: '16px', 
                  fontWeight: '600', 
                  color: '#FF4444', 
                  marginBottom: '8px'
                }}>
                  Subscription Expired
                </div>
                <div style={{ 
                  fontSize: '12px', 
                  color: '#666',
                  lineHeight: '1.4'
                }}>
                  Renew your BersePass to enjoy premium benefits and exclusive features
                </div>
              </div>
              
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                gap: '8px' 
              }}>
                <button 
                  style={{
                    background: '#FF4444',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'background 0.2s ease'
                  }}
                  onClick={() => {
                    // In real app, this would redirect to subscription page
                    alert('Redirecting to subscription renewal...');
                  }}
                >
                  Renew Subscription
                </button>
              </div>
            </>
          )}
        </BersePassCard>

        {/* BersePoints Card */}
        <BersePointsCard>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '20px' 
          }}>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: '600', 
              color: '#333', 
              margin: 0 
            }}>BersePoints & Rewards</h3>
            <div style={{
              background: '#8E44AD',
              color: 'white',
              padding: '4px 12px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '500'
            }}>
              Level 3
            </div>
          </div>
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start', 
            marginBottom: '16px' 
          }}>
            <div style={{ flex: '1' }}>
              <div style={{ 
                fontSize: '28px', 
                fontWeight: 'bold', 
                color: '#FFA500', 
                lineHeight: '1' 
              }}>
                {currentPoints}
              </div>
              <div style={{ 
                fontSize: '11px', 
                color: '#666', 
                marginTop: '2px' 
              }}>points available</div>
            </div>
            
            <div style={{ 
              flex: '1', 
              display: 'flex', 
              flexDirection: 'row', 
              gap: '12px', 
              justifyContent: 'flex-end' 
            }}>
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center' 
              }}>
                <div style={{ 
                  fontSize: '16px', 
                  color: '#000', 
                  fontWeight: '600' 
                }}>RM 347</div>
                <div style={{ 
                  fontSize: '11px', 
                  color: '#666' 
                }}>Redeemed</div>
              </div>
              
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center' 
              }}>
                <div style={{ 
                  fontSize: '16px', 
                  color: '#000', 
                  fontWeight: '600' 
                }}>+15</div>
                <div style={{ 
                  fontSize: '11px', 
                  color: '#666' 
                }}>This week</div>
              </div>
            </div>
          </div>
          
          <div>
            <div style={{
              width: '100%',
              height: '8px',
              background: '#E0E0E0',
              borderRadius: '4px',
              overflow: 'hidden',
              marginBottom: '8px'
            }}>
              <div style={{
                width: '82%',
                height: '100%',
                background: '#FFA500',
                borderRadius: '4px'
              }}></div>
            </div>
            
            <div style={{ 
              fontSize: '12px', 
              color: '#666',
              fontStyle: 'italic',
              marginBottom: '12px'
            }}>
              {currentPoints}/300 to Level 4
            </div>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center' 
            }}>
              <button style={{
                background: '#FFA500',
                color: 'white',
                border: 'none',
                padding: '10px 12px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 6px rgba(255, 165, 0, 0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
              onClick={() => setIsDualQRModalOpen(true)}>
                <span>📱</span>
                QR
              </button>
              
              <button 
                onClick={() => navigate('/points')}
                style={{
                  background: '#FFA500',
                  color: 'white',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background 0.2s ease'
                }}
              >
                See All Rewards
              </button>
            </div>
          </div>
        </BersePointsCard>

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
      
      {/* DualQRModal for QR Code functionality */}
      <DualQRModal 
        isOpen={isDualQRModalOpen} 
        onClose={() => setIsDualQRModalOpen(false)} 
      />
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

const BersePassCard = styled.div<{ $isSubscribed: boolean }>`
  background: white;
  margin: 0 20px 20px 20px;
  border-radius: 12px;
  padding: 20px;
  border: 3px solid ${({ $isSubscribed }) => $isSubscribed ? '#00C851' : '#FF4444'};
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  font-family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
`;

const BersePointsCard = styled.div`
  background: white;
  margin: 0 20px 20px 20px;
  border-radius: 12px;
  padding: 20px;
  border: 3px solid #FFA500;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  font-family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
`;