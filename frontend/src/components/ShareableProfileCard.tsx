import React, { useRef, useState } from 'react';
import styled from 'styled-components';
import html2canvas from 'html2canvas';
import QRCode from 'qrcode';

interface ShareableProfileCardProps {
  user: {
    id: string;
    fullName: string;
    username?: string;
    profilePicture?: string;
    bio?: string;
    shortBio?: string;
    currentLocation?: string;
    profession?: string;
    interests?: string[];
    age?: number;
    personalityType?: string;
    instagramHandle?: string;
    linkedinHandle?: string;
  };
  onClose?: () => void;
}

export const ShareableProfileCard: React.FC<ShareableProfileCardProps> = ({ user, onClose }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Generate QR code on mount
  React.useEffect(() => {
    const profileUrl = `${window.location.origin}/profile/${user.id}`;
    QRCode.toDataURL(profileUrl, {
      width: 120,
      margin: 1,
      color: {
        dark: '#2D5F4F',
        light: '#FFFFFF'
      }
    }).then(setQrCodeUrl);
  }, [user.id]);

  const handleDownloadCard = async () => {
    if (!cardRef.current) return;
    
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#F9F3E3',
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true
      });
      
      const link = document.createElement('a');
      link.download = `${user.fullName || user.username || 'profile'}-berse-card.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error('Error generating card:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = async () => {
    const profileUrl = `${window.location.origin}/profile/${user.id}`;
    const shareText = `Check out ${user.fullName || user.username}'s profile on Berse!`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Berse Profile',
          text: shareText,
          url: profileUrl
        });
      } catch (error) {
        console.log('Share cancelled or failed');
      }
    } else {
      // Fallback to copying link
      navigator.clipboard.writeText(profileUrl);
      alert('Profile link copied to clipboard!');
    }
  };

  const handleCopyLink = () => {
    const profileUrl = `${window.location.origin}/profile/${user.id}`;
    navigator.clipboard.writeText(profileUrl);
    alert('Profile link copied!');
  };

  return (
    <Overlay onClick={onClose}>
      <Container onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={onClose}>✕</CloseButton>
        
        <Card ref={cardRef}>
          <CardBackground />
          <CardPattern />
          
          <CardHeader>
            <BerseLogo>
              <LogoText>Berse</LogoText>
              <LogoTagline>Connect • Discover • Grow</LogoTagline>
            </BerseLogo>
          </CardHeader>

          <ProfileSection>
            <ProfileImageWrapper>
              {user.profilePicture ? (
                <ProfileImage src={user.profilePicture} alt={user.fullName} />
              ) : (
                <ProfilePlaceholder>
                  {(user.fullName || user.username || 'U')[0].toUpperCase()}
                </ProfilePlaceholder>
              )}
              <StatusBadge>Active</StatusBadge>
            </ProfileImageWrapper>

            <ProfileInfo>
              <Name>{user.fullName || user.username || 'Berse Member'}</Name>
              {user.profession && <Profession>{user.profession}</Profession>}
              {user.currentLocation && (
                <Location>📍 {user.currentLocation}</Location>
              )}
            </ProfileInfo>

            {(user.bio || user.shortBio) && (
              <BioSection>
                <BioText>
                  {user.shortBio || user.bio?.substring(0, 120)}
                  {(user.bio?.length || 0) > 120 && '...'}
                </BioText>
              </BioSection>
            )}

            {user.interests && user.interests.length > 0 && (
              <InterestsSection>
                <SectionTitle>Interests</SectionTitle>
                <InterestsList>
                  {user.interests.slice(0, 4).map((interest, index) => (
                    <InterestTag key={index}>{interest}</InterestTag>
                  ))}
                  {user.interests.length > 4 && (
                    <MoreTag>+{user.interests.length - 4} more</MoreTag>
                  )}
                </InterestsList>
              </InterestsSection>
            )}

            <DetailsGrid>
              {user.personalityType && (
                <DetailItem>
                  <DetailIcon>🧠</DetailIcon>
                  <DetailText>{user.personalityType}</DetailText>
                </DetailItem>
              )}
              {user.age && (
                <DetailItem>
                  <DetailIcon>🎂</DetailIcon>
                  <DetailText>{user.age} years</DetailText>
                </DetailItem>
              )}
            </DetailsGrid>

            <SocialSection>
              {user.instagramHandle && (
                <SocialLink>
                  <SocialIcon>📷</SocialIcon>
                  <SocialHandle>@{user.instagramHandle}</SocialHandle>
                </SocialLink>
              )}
              {user.linkedinHandle && (
                <SocialLink>
                  <SocialIcon>💼</SocialIcon>
                  <SocialHandle>{user.linkedinHandle}</SocialHandle>
                </SocialLink>
              )}
            </SocialSection>
          </ProfileSection>

          <QRSection>
            <QRCodeWrapper>
              {qrCodeUrl && <QRCodeImage src={qrCodeUrl} alt="Profile QR Code" />}
            </QRCodeWrapper>
            <QRText>Scan to view profile</QRText>
          </QRSection>

          <CardFooter>
            <FooterText>Join the Berse Community</FooterText>
            <WebsiteUrl>www.berse.app</WebsiteUrl>
          </CardFooter>
        </Card>

        <ActionButtons>
          <ActionButton onClick={handleDownloadCard} disabled={isGenerating}>
            {isGenerating ? '⏳ Generating...' : '📥 Download Card'}
          </ActionButton>
          <ActionButton onClick={handleShare} $primary>
            📤 Share Profile
          </ActionButton>
          <ActionButton onClick={handleCopyLink}>
            🔗 Copy Link
          </ActionButton>
        </ActionButtons>
      </Container>
    </Overlay>
  );
};

// Styled Components
const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const Container = styled.div`
  background: white;
  border-radius: 20px;
  padding: 20px;
  max-width: 450px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  z-index: 10;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
  
  &:hover {
    background: #f0f0f0;
    color: #333;
  }
`;

const Card = styled.div`
  background: linear-gradient(135deg, #F9F3E3 0%, #F5EDD8 100%);
  border-radius: 16px;
  padding: 0;
  position: relative;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
`;

const CardBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 120px;
  background: linear-gradient(135deg, #2fce98 0%, #4A90A4 100%);
  opacity: 0.1;
`;

const CardPattern = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  width: 200px;
  height: 200px;
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%232fce98' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
`;

const CardHeader = styled.div`
  padding: 20px 24px 16px;
  position: relative;
`;

const BerseLogo = styled.div`
  text-align: center;
`;

const LogoText = styled.h2`
  font-size: 28px;
  font-weight: bold;
  color: #2fce98;
  margin: 0;
  letter-spacing: -0.5px;
`;

const LogoTagline = styled.p`
  font-size: 11px;
  color: #666;
  margin: 4px 0 0;
  letter-spacing: 1px;
  text-transform: uppercase;
`;

const ProfileSection = styled.div`
  padding: 0 24px 20px;
  position: relative;
`;

const ProfileImageWrapper = styled.div`
  position: relative;
  width: 100px;
  height: 100px;
  margin: 0 auto 16px;
`;

const ProfileImage = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
`;

const ProfilePlaceholder = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, #2fce98, #4A90A4);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 36px;
  font-weight: bold;
  border: 4px solid white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
`;

const StatusBadge = styled.div`
  position: absolute;
  bottom: 5px;
  right: 5px;
  background: #2fce98;
  color: white;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 600;
  border: 2px solid white;
`;

const ProfileInfo = styled.div`
  text-align: center;
  margin-bottom: 16px;
`;

const Name = styled.h3`
  font-size: 22px;
  font-weight: 700;
  color: #2D5F4F;
  margin: 0 0 4px;
`;

const Profession = styled.p`
  font-size: 14px;
  color: #666;
  margin: 0 0 6px;
  font-weight: 500;
`;

const Location = styled.p`
  font-size: 13px;
  color: #888;
  margin: 0;
`;

const BioSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 16px;
`;

const BioText = styled.p`
  font-size: 13px;
  color: #555;
  line-height: 1.5;
  margin: 0;
  text-align: center;
`;

const InterestsSection = styled.div`
  margin-bottom: 16px;
`;

const SectionTitle = styled.h4`
  font-size: 12px;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 8px;
  text-align: center;
`;

const InterestsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: center;
`;

const InterestTag = styled.span`
  background: #2fce98;
  color: white;
  padding: 4px 10px;
  border-radius: 14px;
  font-size: 12px;
  font-weight: 500;
`;

const MoreTag = styled.span`
  background: #e0e0e0;
  color: #666;
  padding: 4px 10px;
  border-radius: 14px;
  font-size: 12px;
  font-weight: 500;
`;

const DetailsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  margin-bottom: 16px;
`;

const DetailItem = styled.div`
  background: white;
  border-radius: 10px;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
`;

const DetailIcon = styled.span`
  font-size: 16px;
`;

const DetailText = styled.span`
  font-size: 12px;
  color: #555;
  font-weight: 500;
`;

const SocialSection = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-bottom: 16px;
`;

const SocialLink = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  background: white;
  padding: 6px 12px;
  border-radius: 8px;
`;

const SocialIcon = styled.span`
  font-size: 14px;
`;

const SocialHandle = styled.span`
  font-size: 11px;
  color: #555;
  font-weight: 500;
`;

const QRSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 16px;
  background: white;
  margin: 0 24px;
  border-radius: 12px;
`;

const QRCodeWrapper = styled.div`
  width: 80px;
  height: 80px;
  padding: 8px;
  background: white;
  border-radius: 8px;
`;

const QRCodeImage = styled.img`
  width: 100%;
  height: 100%;
`;

const QRText = styled.p`
  font-size: 12px;
  color: #666;
  margin: 0;
  font-weight: 500;
`;

const CardFooter = styled.div`
  padding: 16px 24px;
  text-align: center;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  margin-top: 16px;
`;

const FooterText = styled.p`
  font-size: 11px;
  color: #888;
  margin: 0 0 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const WebsiteUrl = styled.p`
  font-size: 13px;
  color: #2fce98;
  margin: 0;
  font-weight: 600;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 20px;
`;

const ActionButton = styled.button<{ $primary?: boolean }>`
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  background: ${props => props.$primary ? '#2fce98' : '#f0f0f0'};
  color: ${props => props.$primary ? 'white' : '#333'};
  
  &:hover {
    transform: translateY(-1px);
    background: ${props => props.$primary ? '#26b584' : '#e0e0e0'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;