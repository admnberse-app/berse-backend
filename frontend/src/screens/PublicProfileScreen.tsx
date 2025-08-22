import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';

interface PublicProfile {
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
  eventsAttended?: number;
  communityRole?: string;
}

export const PublicProfileScreen: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      fetchPublicProfile(userId);
    }
  }, [userId]);

  const fetchPublicProfile = async (id: string) => {
    try {
      const response = await fetch(
        `${window.location.hostname === 'localhost' ? '' : 'https://api.berse.app'}/api/v1/users/${id}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setProfile(data.data);
        } else {
          setError('Profile not found');
        }
      } else {
        setError('Failed to load profile');
      }
    } catch (error) {
      console.error('Error fetching public profile:', error);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = () => {
    // If user is not logged in, redirect to login
    const token = localStorage.getItem('bersemuka_token');
    if (!token) {
      navigate('/login', { state: { from: `/profile/${userId}` } });
    } else {
      // Send friend request
      sendFriendRequest();
    }
  };

  const sendFriendRequest = async () => {
    try {
      const token = localStorage.getItem('bersemuka_token');
      const response = await fetch(
        `${window.location.hostname === 'localhost' ? '' : 'https://api.berse.app'}/api/v1/users/follow/${userId}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        alert('Friend request sent!');
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
      alert('Failed to send friend request');
    }
  };

  const handleJoinBerse = () => {
    navigate('/register');
  };

  if (loading) {
    return (
      <Container>
        <LoadingState>Loading profile...</LoadingState>
      </Container>
    );
  }

  if (error || !profile) {
    return (
      <Container>
        <ErrorState>
          <ErrorIcon>😔</ErrorIcon>
          <ErrorTitle>Profile Not Found</ErrorTitle>
          <ErrorText>{error || 'This profile does not exist'}</ErrorText>
          <BackButton onClick={() => navigate('/')}>Go to Homepage</BackButton>
        </ErrorState>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <BerseLogo onClick={() => navigate('/')}>
          <LogoText>Berse</LogoText>
          <LogoTagline>Connect • Discover • Grow</LogoTagline>
        </BerseLogo>
      </Header>

      <ProfileCard>
        <CoverSection />
        
        <ProfileContent>
          <ProfileImageWrapper>
            {profile.profilePicture ? (
              <ProfileImage src={profile.profilePicture} alt={profile.fullName} />
            ) : (
              <ProfilePlaceholder>
                {(profile.fullName || profile.username || 'U')[0].toUpperCase()}
              </ProfilePlaceholder>
            )}
          </ProfileImageWrapper>

          <ProfileInfo>
            <Name>{profile.fullName || profile.username || 'Berse Member'}</Name>
            {profile.profession && <Profession>{profile.profession}</Profession>}
            {profile.currentLocation && (
              <Location>📍 {profile.currentLocation}</Location>
            )}
          </ProfileInfo>

          {(profile.bio || profile.shortBio) && (
            <BioSection>
              <SectionTitle>About</SectionTitle>
              <BioText>{profile.bio || profile.shortBio}</BioText>
            </BioSection>
          )}

          {profile.interests && profile.interests.length > 0 && (
            <InterestsSection>
              <SectionTitle>Interests</SectionTitle>
              <InterestsList>
                {profile.interests.map((interest, index) => (
                  <InterestTag key={index}>{interest}</InterestTag>
                ))}
              </InterestsList>
            </InterestsSection>
          )}

          <DetailsSection>
            {profile.personalityType && (
              <DetailItem>
                <DetailIcon>🧠</DetailIcon>
                <DetailLabel>Personality</DetailLabel>
                <DetailValue>{profile.personalityType}</DetailValue>
              </DetailItem>
            )}
            {profile.age && (
              <DetailItem>
                <DetailIcon>🎂</DetailIcon>
                <DetailLabel>Age</DetailLabel>
                <DetailValue>{profile.age} years</DetailValue>
              </DetailItem>
            )}
            {profile.eventsAttended && profile.eventsAttended > 0 && (
              <DetailItem>
                <DetailIcon>🎪</DetailIcon>
                <DetailLabel>Events</DetailLabel>
                <DetailValue>{profile.eventsAttended} attended</DetailValue>
              </DetailItem>
            )}
            {profile.communityRole && (
              <DetailItem>
                <DetailIcon>👥</DetailIcon>
                <DetailLabel>Role</DetailLabel>
                <DetailValue>{profile.communityRole}</DetailValue>
              </DetailItem>
            )}
          </DetailsSection>

          {(profile.instagramHandle || profile.linkedinHandle) && (
            <SocialSection>
              <SectionTitle>Connect on Social</SectionTitle>
              <SocialLinks>
                {profile.instagramHandle && (
                  <SocialLink 
                    href={`https://instagram.com/${profile.instagramHandle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <SocialIcon>📷</SocialIcon>
                    @{profile.instagramHandle}
                  </SocialLink>
                )}
                {profile.linkedinHandle && (
                  <SocialLink 
                    href={`https://linkedin.com/in/${profile.linkedinHandle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <SocialIcon>💼</SocialIcon>
                    {profile.linkedinHandle}
                  </SocialLink>
                )}
              </SocialLinks>
            </SocialSection>
          )}

          <ActionButtons>
            <ConnectButton onClick={handleConnect}>
              🤝 Connect with {profile.fullName?.split(' ')[0] || 'Member'}
            </ConnectButton>
            <JoinButton onClick={handleJoinBerse}>
              🌟 Join Berse Community
            </JoinButton>
          </ActionButtons>
        </ProfileContent>
      </ProfileCard>

      <Footer>
        <FooterText>Part of the Berse Community</FooterText>
        <FooterLink href="https://berse.app" target="_blank">www.berse.app</FooterLink>
      </Footer>
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #F9F3E3 0%, #F5EDD8 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
`;

const Header = styled.header`
  width: 100%;
  max-width: 600px;
  padding: 20px 0;
  text-align: center;
`;

const BerseLogo = styled.div`
  cursor: pointer;
  transition: transform 0.2s;
  
  &:hover {
    transform: scale(1.05);
  }
`;

const LogoText = styled.h1`
  font-size: 36px;
  font-weight: bold;
  color: #2fce98;
  margin: 0;
  letter-spacing: -1px;
`;

const LogoTagline = styled.p`
  font-size: 12px;
  color: #666;
  margin: 4px 0 0;
  letter-spacing: 2px;
  text-transform: uppercase;
`;

const ProfileCard = styled.div`
  width: 100%;
  max-width: 600px;
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  margin-bottom: 40px;
`;

const CoverSection = styled.div`
  height: 150px;
  background: linear-gradient(135deg, #2fce98 0%, #4A90A4 100%);
  position: relative;
`;

const ProfileContent = styled.div`
  padding: 0 30px 30px;
  position: relative;
`;

const ProfileImageWrapper = styled.div`
  width: 120px;
  height: 120px;
  margin: -60px auto 20px;
  position: relative;
`;

const ProfileImage = styled.img`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 5px solid white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
`;

const ProfilePlaceholder = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, #2fce98, #4A90A4);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 48px;
  font-weight: bold;
  border: 5px solid white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
`;

const ProfileInfo = styled.div`
  text-align: center;
  margin-bottom: 30px;
`;

const Name = styled.h2`
  font-size: 28px;
  font-weight: 700;
  color: #2D5F4F;
  margin: 0 0 8px;
`;

const Profession = styled.p`
  font-size: 16px;
  color: #666;
  margin: 0 0 8px;
  font-weight: 500;
`;

const Location = styled.p`
  font-size: 14px;
  color: #888;
  margin: 0;
`;

const BioSection = styled.div`
  margin-bottom: 30px;
`;

const SectionTitle = styled.h3`
  font-size: 14px;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 0 0 12px;
  font-weight: 600;
`;

const BioText = styled.p`
  font-size: 15px;
  color: #444;
  line-height: 1.6;
  margin: 0;
`;

const InterestsSection = styled.div`
  margin-bottom: 30px;
`;

const InterestsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const InterestTag = styled.span`
  background: #2fce98;
  color: white;
  padding: 6px 14px;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 500;
`;

const DetailsSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 16px;
  margin-bottom: 30px;
`;

const DetailItem = styled.div`
  background: #f8f9fa;
  border-radius: 12px;
  padding: 12px;
  text-align: center;
`;

const DetailIcon = styled.div`
  font-size: 24px;
  margin-bottom: 4px;
`;

const DetailLabel = styled.div`
  font-size: 11px;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
`;

const DetailValue = styled.div`
  font-size: 14px;
  color: #333;
  font-weight: 600;
`;

const SocialSection = styled.div`
  margin-bottom: 30px;
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 12px;
`;

const SocialLink = styled.a`
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  border: 1px solid #e0e0e0;
  padding: 8px 16px;
  border-radius: 10px;
  text-decoration: none;
  color: #333;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  
  &:hover {
    background: #f8f9fa;
    border-color: #2fce98;
    transform: translateY(-1px);
  }
`;

const SocialIcon = styled.span`
  font-size: 18px;
`;

const ActionButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ConnectButton = styled.button`
  background: #2fce98;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 14px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #26b584;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(47, 206, 152, 0.3);
  }
`;

const JoinButton = styled.button`
  background: white;
  color: #2fce98;
  border: 2px solid #2fce98;
  border-radius: 12px;
  padding: 14px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #2fce98;
    color: white;
    transform: translateY(-1px);
  }
`;

const Footer = styled.footer`
  text-align: center;
  padding: 20px;
`;

const FooterText = styled.p`
  font-size: 12px;
  color: #888;
  margin: 0 0 4px;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const FooterLink = styled.a`
  font-size: 14px;
  color: #2fce98;
  text-decoration: none;
  font-weight: 600;
  
  &:hover {
    text-decoration: underline;
  }
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #666;
  font-size: 16px;
`;

const ErrorState = styled.div`
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 20px;
  max-width: 400px;
  margin-top: 100px;
`;

const ErrorIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
`;

const ErrorTitle = styled.h2`
  font-size: 24px;
  color: #333;
  margin: 0 0 8px;
`;

const ErrorText = styled.p`
  font-size: 14px;
  color: #666;
  margin: 0 0 24px;
`;

const BackButton = styled.button`
  background: #2fce98;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  
  &:hover {
    background: #26b584;
  }
`;