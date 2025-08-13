import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { DualQRModal } from '../DualQRModal';
import { berseHorizontalLogo } from '../../assets/images';

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-3px); }
`;

const HeaderContainer = styled.header`
  position: sticky;
  top: 4px;
  z-index: 1000;
  margin: 4px 8px;
  background: #FFFFFF;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  animation: ${float} 3s ease-in-out infinite;
  border: none;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  }
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  max-width: 100%;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    bottom: 0;
    left: 20px;
    right: 20px;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(45, 95, 79, 0.1), transparent);
  }
`;

const LogoHorizontal = styled.img`
  height: 42px;
  width: auto;
  margin-left: 8px;
  cursor: pointer;
  transition: transform 0.2s ease;
  filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.15));
  
  &:hover {
    transform: scale(1.05);
    filter: drop-shadow(0 3px 8px rgba(0, 0, 0, 0.2));
  }
  
  @media (max-width: 480px) {
    height: 36px;
    margin-left: 6px;
    filter: drop-shadow(0 1px 4px rgba(0, 0, 0, 0.12));
  }
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 0 0 auto;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  
  @media (max-width: 480px) {
    display: none;
  }
`;

const UserName = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: #2D5F4F;
  line-height: 1;
`;

const Tagline = styled.span`
  font-size: 9px;
  font-style: italic;
  color: #666;
  opacity: 0.7;
  line-height: 1;
`;

const LogoButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.8;
  }

  &:active {
    transform: scale(0.98);
  }
`;

const LogoDot = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, #2D5F4F 0%, #4A8B7C 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(45, 95, 79, 0.2);
`;

const LogoText = styled.span`
  font-size: 14px;
  font-weight: 700;
  color: #2D5F4F;
  letter-spacing: -0.5px;
  text-shadow: 0 1px 2px rgba(45, 95, 79, 0.1);
  transition: all 0.3s ease;
  
  &:hover {
    color: #1E4039;
    transform: scale(1.02);
  }
  
  @media (max-width: 480px) {
    display: none;
  }
`;


const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 0 0 auto;
`;

const IconButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #F8F9FA;
  border: 1px solid rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  font-size: 14px;

  &:hover {
    background: #2D5F4F;
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(45, 95, 79, 0.3);
    border-color: #2D5F4F;
  }

  &:active {
    transform: translateY(-1px);
  }
`;

const NotificationBadge = styled.div`
  position: absolute;
  top: 2px;
  right: 2px;
  width: 6px;
  height: 6px;
  background: #FF4444;
  border-radius: 50%;
  border: 1px solid white;
`;

const ProfileButton = styled(IconButton)`
  background: linear-gradient(135deg, #2D5F4F 0%, #4A8B7C 100%);
  border: none;
  color: white;
  font-size: 10px;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(45, 95, 79, 0.2);

  &:hover {
    background: linear-gradient(135deg, #1E4039 0%, #3A7A6B 100%);
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(45, 95, 79, 0.4);
  }
`;

const BalanceButton = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  background: #F8F9FA;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 6px;
  padding: 4px 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 60px;

  &:hover {
    background: #2D5F4F;
    color: white;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(45, 95, 79, 0.2);
    border-color: #2D5F4F;
  }

  &:active {
    transform: translateY(0px);
  }
`;

const BalanceLabel = styled.span`
  font-size: 8px;
  font-style: italic;
  color: #666;
  opacity: 0.7;
  line-height: 1;
  
  ${BalanceButton}:hover & {
    color: white;
    opacity: 0.9;
  }
`;

const BalanceAmount = styled.span`
  font-size: 9px;
  font-weight: 700;
  color: #2D5F4F;
  line-height: 1;
  
  ${BalanceButton}:hover & {
    color: white;
  }
`;

// Modal Components
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
  z-index: 9999;
  padding: 20px;
  backdrop-filter: blur(2px);
  
  @media (max-width: 480px) {
    padding: 16px;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  right: 20px;
  top: 20px;
  background: rgba(0, 0, 0, 0.1);
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
  transition: all 0.2s ease;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  &:hover {
    background: rgba(0, 0, 0, 0.2);
    transform: scale(1.1);
  }
`;

interface CompactHeaderProps {
  onMenuClick?: () => void;
}

export const CompactHeader: React.FC<CompactHeaderProps> = ({ 
  onMenuClick
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [hasNotifications, setHasNotifications] = useState(true);
  const [bersePassBalance, setBersePassBalance] = useState(250);
  const [bersePointsBalance, setBersePointsBalance] = useState(1850);
  const [showBersePassModal, setShowBersePassModal] = useState(false);
  const [showBersePointsModal, setShowBersePointsModal] = useState(false);
  
  // Dashboard card variables
  const [setelBalance, setSetelBalance] = useState(23.45);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [currentPoints, setCurrentPoints] = useState(245);
  const [isSetelConnected, setIsSetelConnected] = useState(true);
  const [showSetelOnboarding, setShowSetelOnboarding] = useState(false);
  const [isDualQRModalOpen, setIsDualQRModalOpen] = useState(false);
  const [isManagePassModalOpen, setIsManagePassModalOpen] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(true); // true = active/paid, false = not subscribed

  const handleLogoClick = () => {
    navigate('/dashboard');
  };

  const handleNotificationClick = () => {
    setHasNotifications(false);
    navigate('/notifications');
  };

  const handleProfileClick = () => {
    if (onMenuClick) {
      onMenuClick();
    }
  };

  const handleBersePassClick = () => {
    setShowBersePassModal(true);
  };

  const handleBersePointsClick = () => {
    setShowBersePointsModal(true);
  };

  const closeBersePassModal = () => {
    setShowBersePassModal(false);
  };

  const closeBersePointsModal = () => {
    setShowBersePointsModal(false);
  };

  const displayName = user?.username || user?.fullName || 'User';
  const userInitials = displayName
    ? displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const userName = displayName;


  return (
    <React.Fragment>
      <HeaderContainer>
        <HeaderContent>
          <LeftSection>
            <ProfileButton onClick={handleProfileClick}>
              {userInitials}
            </ProfileButton>
            
            <UserInfo>
              <UserName>{userName}</UserName>
              <Tagline>Welcome Back!</Tagline>
            </UserInfo>
            
            <LogoHorizontal 
              src={berseHorizontalLogo} 
              alt="Berse" 
              onClick={handleLogoClick}
            />
          </LeftSection>

          <RightSection>
            <BalanceButton 
              onClick={handleBersePassClick}
              style={{
                border: isSubscribed ? '1px solid #00C851' : '1px solid #FF4444',
                boxShadow: isSubscribed ? '0 0 0 1px rgba(0, 200, 81, 0.1)' : '0 0 0 1px rgba(255, 68, 68, 0.1)'
              }}
            >
              <BalanceAmount>RM {bersePassBalance}</BalanceAmount>
              <BalanceLabel>BersePass</BalanceLabel>
            </BalanceButton>
            
            <BalanceButton 
              onClick={handleBersePointsClick}
              style={{
                border: '1px solid #FFA500',
                boxShadow: '0 0 0 1px rgba(255, 165, 0, 0.1)'
              }}
            >
              <BalanceAmount>{bersePointsBalance.toLocaleString()}</BalanceAmount>
              <BalanceLabel>BersePoints</BalanceLabel>
            </BalanceButton>
            
            <IconButton onClick={handleNotificationClick}>
              🔔
              {hasNotifications && <NotificationBadge />}
            </IconButton>
          </RightSection>
        </HeaderContent>
      </HeaderContainer>
      
      {/* BersePass Modal - Outside HeaderContainer for full screen centering */}
      <ModalOverlay $isOpen={showBersePassModal} onClick={closeBersePassModal}>
        <div 
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%'
          }}
        >
          <CloseButton onClick={closeBersePassModal}>×</CloseButton>
          {/* Exact BersePass Card from Dashboard */}
          <div style={{
            maxWidth: '400px',
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            padding: '16px',
            border: `3px solid ${isSubscribed ? '#00C851' : '#FF4444'}`,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          }}>
            {/* Header Section */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '16px' 
            }}>
              <h3 style={{ 
                fontSize: '14px', 
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
                {/* Balance Section */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-start', 
                  marginBottom: '20px' 
                }}>
                  {/* Left Column */}
                  <div>
                    <div style={{ 
                      fontSize: '20px', 
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
                  
                  {/* Right Column */}
                  <div style={{ textAlign: 'right', lineHeight: '1.3' }}>
                    <div style={{ fontSize: '12px', color: '#666' }}>RM 19.99/month</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>Next: Dec 15</div>
                  </div>
                </div>
                
                {/* Buttons Section */}
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
                    textDecoration: 'none',
                    cursor: 'pointer',
                    transition: 'background 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#e9ecef'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#f8f9fa'}
                  onClick={() => {
                    if (isSetelConnected) {
                      alert('Opening Setel app for top-up...');
                    } else {
                      setShowSetelOnboarding(true);
                    }
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
                    textDecoration: 'none',
                    cursor: 'pointer',
                    transition: 'background 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#e9ecef'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#f8f9fa'}
                  onClick={() => setIsManagePassModalOpen(true)}>
                    Manage Pass
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Expired Subscription Content */}
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  marginBottom: '20px',
                  padding: '20px 0'
                }}>
                  <div style={{ 
                    fontSize: '32px',
                    marginBottom: '12px'
                  }}>⚠️</div>
                  <div style={{ 
                    fontSize: '12px', 
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
                
                {/* Renewal Button */}
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
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontSize: '10px',
                      fontWeight: '600',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'background 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#CC3333'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#FF4444'}
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
          </div>
        </div>
      </ModalOverlay>
      
      {/* BersePoints Modal */}
      <ModalOverlay $isOpen={showBersePointsModal} onClick={closeBersePointsModal}>
        <div 
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%'
          }}
        >
          <CloseButton onClick={closeBersePointsModal}>×</CloseButton>
          {/* Exact BersePoints Card from Dashboard */}
          <div style={{
            maxWidth: '400px',
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            padding: '16px',
            border: '3px solid #FFA500',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          }}>
            {/* Header Section */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '20px' 
            }}>
              <h3 style={{ 
                fontSize: '14px', 
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
            
            {/* Stats Section */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'flex-start', 
              marginBottom: '16px' 
            }}>
              {/* Left Column */}
              <div style={{ flex: '1' }}>
                <div style={{ 
                  fontSize: '20px', 
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
              
              {/* Right Section */}
              <div style={{ 
                flex: '1', 
                display: 'flex', 
                flexDirection: 'row', 
                gap: '12px', 
                justifyContent: 'flex-end' 
              }}>
                {/* Redeemed Stat */}
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center' 
                }}>
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#000', 
                    fontWeight: '600' 
                  }}>RM 347</div>
                  <div style={{ 
                    fontSize: '11px', 
                    color: '#666' 
                  }}>Redeemed</div>
                </div>
                
                {/* Weekly Stat */}
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center' 
                }}>
                  <div style={{ 
                    fontSize: '12px', 
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
            
            {/* Progress Section */}
            <div>
              {/* Progress Bar */}
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
              
              {/* Level Progress Text */}
              <div style={{ 
                fontSize: '12px', 
                color: '#666',
                fontStyle: 'italic',
                marginBottom: '12px'
              }}>
                {currentPoints}/300 to Level 4
              </div>
              
              {/* Bottom Row */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                gap: '8px'
              }}>
                
                <button style={{
                  background: '#FFA500',
                  color: 'white',
                  border: 'none',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  fontSize: '10px',
                  fontWeight: '600',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 4px rgba(255, 165, 0, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  whiteSpace: 'nowrap',
                  minWidth: 'fit-content'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#FF8C00';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(255, 140, 0, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#FFA500';
                  e.currentTarget.style.transform = 'translateY(0px)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(255, 165, 0, 0.2)';
                }}
                onClick={() => setIsDualQRModalOpen(true)}>
                  <span style={{ fontSize: '12px' }}>📱</span>
                  QR
                </button>
                
                <button 
                  onClick={() => navigate('/my-vouchers')}
                  style={{
                    background: '#FFA500',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '10px',
                    fontWeight: '500',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'background 0.2s ease',
                    whiteSpace: 'nowrap',
                    minWidth: 'fit-content'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#FF8C00'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#FFA500'}
                >
                  My Vouchers
                </button>
                
                <button 
                  onClick={() => navigate('/points')}
                  style={{
                    background: '#FFA500',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '10px',
                    fontWeight: '500',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'background 0.2s ease',
                    whiteSpace: 'nowrap',
                    minWidth: 'fit-content'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#FF8C00'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#FFA500'}
                >
                  All Rewards
                </button>
              </div>
            </div>
          </div>
        </div>
      </ModalOverlay>
      
      {/* DualQRModal for QR Code functionality */}
      <DualQRModal 
        isOpen={isDualQRModalOpen} 
        onClose={() => setIsDualQRModalOpen(false)} 
      />
    </React.Fragment>
  );
};