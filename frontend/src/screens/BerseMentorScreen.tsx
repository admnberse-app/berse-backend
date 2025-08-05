import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { StatusBar } from '../components/StatusBar';
import { MainNav } from '../components/MainNav';

// TalentCorp & BrainsMingle Integration
interface TalentCorpUser {
  id: string;
  email: string;
  fullName: string;
  profession: string;
  experience: number;
  skills: string[];
  location: string;
  myHeartParticipant: boolean;
  myMahirCertifications: string[];
  mentorshipPreferences: {
    availableHours: number;
    specializations: string[];
    menteeLevel: 'junior' | 'mid' | 'senior';
  };
}

interface BrainsMingleSession {
  id: string;
  title: string;
  industry: string;
  country: string;
  date: string;
  time: string;
  participants: number;
  maxParticipants: number;
  type: 'mentor-matching' | 'industry-networking' | 'diaspora-connect';
}

export const BerseMentorScreen: React.FC = () => {
  const navigate = useNavigate();
  const [mentorshipType, setMentorshipType] = useState<'findMentor' | 'becomeMentor' | 'networking'>('findMentor');
  const [talentCorpConnected, setTalentCorpConnected] = useState(false);
  const [userProfile, setUserProfile] = useState<TalentCorpUser | null>(null);
  const [activeTab, setActiveTab] = useState<'local' | 'diaspora' | 'international'>('local');

  const mockNetworkingSessions: BrainsMingleSession[] = [
    {
      id: '1',
      title: 'Tech Mentorship Speed Networking',
      industry: 'Technology',
      country: 'Malaysia',
      date: '2025-01-15',
      time: '7:00 PM MYT',
      participants: 24,
      maxParticipants: 30,
      type: 'mentor-matching'
    },
    {
      id: '2',
      title: 'Malaysian Diaspora in Silicon Valley',
      industry: 'Technology',
      country: 'USA',
      date: '2025-01-16',
      time: '8:00 AM PST',
      participants: 18,
      maxParticipants: 25,
      type: 'diaspora-connect'
    },
    {
      id: '3',
      title: 'Finance Industry Mentors Network',
      industry: 'Finance',
      country: 'Singapore',
      date: '2025-01-17',
      time: '6:30 PM SGT',
      participants: 15,
      maxParticipants: 20,
      type: 'industry-networking'
    }
  ];

  const handleTalentCorpConnect = () => {
    // Simulate TalentCorp OAuth flow
    setTalentCorpConnected(true);
    setUserProfile({
      id: 'tc-123',
      email: 'user@example.com',
      fullName: 'Ahmad Rahman',
      profession: 'Software Engineer',
      experience: 5,
      skills: ['React', 'Node.js', 'Leadership'],
      location: 'Kuala Lumpur',
      myHeartParticipant: true,
      myMahirCertifications: ['Digital Leadership', 'Tech Innovation'],
      mentorshipPreferences: {
        availableHours: 10,
        specializations: ['Web Development', 'Career Growth'],
        menteeLevel: 'junior'
      }
    });
  };

  const joinBrainsMingleSession = async (sessionId: string) => {
    // Integration with BrainsMingle API
    console.log(`Joining BrainsMingle session: ${sessionId}`);
    // Redirect to BrainsMingle session
    window.open(`https://brainsmingle.com/session/${sessionId}?source=bersemuka`, '_blank');
  };

  return (
    <Container>
      <StatusBar />
      
      <Header>
        <BackButton onClick={() => navigate('/dashboard')}>←</BackButton>
        <HeaderContent>
          <HeaderTitle>👨‍🏫 BerseMentor</HeaderTitle>
          <HeaderSubtext>Professional mentorship powered by TalentCorp & BrainsMingle</HeaderSubtext>
        </HeaderContent>
      </Header>

      <ScrollContent>
        <TalentCorpSection>
          {!talentCorpConnected ? (
            <ConnectCard>
              <ConnectIcon>🔗</ConnectIcon>
              <ConnectContent>
                <ConnectTitle>Connect with TalentCorp</ConnectTitle>
                <ConnectDescription>
                  Sync your MyHeart and MyMahir profiles for better mentor matching
                </ConnectDescription>
                <FeatureList>
                  <FeatureItem>✓ Access MyHeart professional network</FeatureItem>
                  <FeatureItem>✓ Import MyMahir certifications</FeatureItem>
                  <FeatureItem>✓ Smart mentor-mentee matching</FeatureItem>
                  <FeatureItem>✓ Global Malaysian diaspora network</FeatureItem>
                </FeatureList>
              </ConnectContent>
              <ConnectButton onClick={handleTalentCorpConnect}>
                Connect TalentCorp Account
              </ConnectButton>
            </ConnectCard>
          ) : (
            <ConnectedCard>
              <ProfileSection>
                <ProfileAvatar>{userProfile?.fullName.charAt(0)}</ProfileAvatar>
                <ProfileInfo>
                  <ProfileName>{userProfile?.fullName}</ProfileName>
                  <ProfileRole>{userProfile?.profession}</ProfileRole>
                  <ProfileLocation>📍 {userProfile?.location}</ProfileLocation>
                </ProfileInfo>
                <VerificationBadges>
                  <Badge $type="myheart">MyHeart ✓</Badge>
                  <Badge $type="mymahir">MyMahir ✓</Badge>
                </VerificationBadges>
              </ProfileSection>
            </ConnectedCard>
          )}
        </TalentCorpSection>

        {talentCorpConnected && (
          <>
            <TypeSelector>
              <TypeButton 
                $active={mentorshipType === 'findMentor'}
                onClick={() => setMentorshipType('findMentor')}
              >
                🔍 Find Mentor
              </TypeButton>
              <TypeButton 
                $active={mentorshipType === 'becomeMentor'}
                onClick={() => setMentorshipType('becomeMentor')}
              >
                🎯 Be Mentor
              </TypeButton>
              <TypeButton 
                $active={mentorshipType === 'networking'}
                onClick={() => setMentorshipType('networking')}
              >
                🌐 Network
              </TypeButton>
            </TypeSelector>

            {mentorshipType === 'networking' && (
              <NetworkingSection>
                <SectionHeader>
                  <SectionTitle>🧠 BrainsMingle Speed Networking</SectionTitle>
                  <SectionSubtext>Join live mentorship networking sessions</SectionSubtext>
                </SectionHeader>

                <NetworkingTabs>
                  <TabButton $active={activeTab === 'local'} onClick={() => setActiveTab('local')}>
                    🇲🇾 Local
                  </TabButton>
                  <TabButton $active={activeTab === 'diaspora'} onClick={() => setActiveTab('diaspora')}>
                    🌍 Diaspora
                  </TabButton>
                  <TabButton $active={activeTab === 'international'} onClick={() => setActiveTab('international')}>
                    🌐 International
                  </TabButton>
                </NetworkingTabs>

                <SessionsList>
                  {mockNetworkingSessions
                    .filter(session => {
                      if (activeTab === 'local') return session.country === 'Malaysia';
                      if (activeTab === 'diaspora') return session.type === 'diaspora-connect';
                      return session.country !== 'Malaysia';
                    })
                    .map((session) => (
                      <SessionCard key={session.id}>
                        <SessionHeader>
                          <SessionTitle>{session.title}</SessionTitle>
                          <SessionType $type={session.type}>
                            {session.type === 'diaspora-connect' ? '🇲🇾' : 
                             session.type === 'mentor-matching' ? '🤝' : '🏢'}
                          </SessionType>
                        </SessionHeader>
                        
                        <SessionDetails>
                          <SessionMeta>
                            <MetaItem>🏢 {session.industry}</MetaItem>
                            <MetaItem>📍 {session.country}</MetaItem>
                          </SessionMeta>
                          <SessionMeta>
                            <MetaItem>📅 {session.date}</MetaItem>
                            <MetaItem>⏰ {session.time}</MetaItem>
                          </SessionMeta>
                        </SessionDetails>

                        <SessionParticipants>
                          <ParticipantsCount>
                            👥 {session.participants}/{session.maxParticipants} joined
                          </ParticipantsCount>
                          <ParticipantsBar>
                            <ParticipantsProgress 
                              $percentage={(session.participants / session.maxParticipants) * 100}
                            />
                          </ParticipantsBar>
                        </SessionParticipants>

                        <SessionActions>
                          <JoinButton 
                            onClick={() => joinBrainsMingleSession(session.id)}
                            $primary
                          >
                            🧠 Join on BrainsMingle
                          </JoinButton>
                          <LearnMoreButton>Learn More</LearnMoreButton>
                        </SessionActions>
                      </SessionCard>
                    ))}
                </SessionsList>
              </NetworkingSection>
            )}

            {mentorshipType === 'findMentor' && (
              <MentorListSection>
                <SectionHeader>
                  <SectionTitle>🔍 Available Mentors</SectionTitle>
                  <SectionSubtext>Connect with experienced professionals</SectionSubtext>
                </SectionHeader>
                
                <MentorGrid>
                  <MentorCard>
                    <MentorAvatar>DL</MentorAvatar>
                    <MentorInfo>
                      <MentorName>Dr. Lisa Wong</MentorName>
                      <MentorRole>Tech Lead @ Google</MentorRole>
                      <MentorSkills>React • Leadership • Career Growth</MentorSkills>
                      <MentorRating>⭐ 4.9 (15 reviews)</MentorRating>
                    </MentorInfo>
                    <MentorActions>
                      <ConnectMentorButton>Connect</ConnectMentorButton>
                    </MentorActions>
                  </MentorCard>
                </MentorGrid>
              </MentorListSection>
            )}
          </>
        )}
      </ScrollContent>

      <MainNav 
        activeTab="mentor"
        onTabPress={(tab) => {
          switch (tab) {
            case 'home': navigate('/dashboard'); break;
            case 'connect': navigate('/berseconnect'); break;
            case 'match': navigate('/match'); break;
            case 'profile': navigate('/profile'); break;
          }
        }}
      />
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #F5F3EF;
  max-width: 393px;
  margin: 0 auto;
`;

const Header = styled.div`
  padding: 16px 20px;
  background-color: #F5F3EF;
  position: relative;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  color: #2D5F4F;
  cursor: pointer;
  position: absolute;
  left: 20px;
  top: 16px;
`;

const HeaderTitle = styled.h1`
  font-size: 24px;
  font-weight: bold;
  color: #2D5F4F;
  margin: 0 0 8px 0;
  text-align: center;
`;

const PartnershipBadge = styled.div`
  background: #8E44AD;
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-align: center;
  margin: 0 auto;
  display: inline-block;
  position: relative;
  left: 50%;
  transform: translateX(-50%);
`;

const Content = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const ComingSoon = styled.div`
  text-align: center;
`;

const ComingSoonIcon = styled.div`
  font-size: 64px;
  margin-bottom: 16px;
`;

const ComingSoonTitle = styled.h2`
  font-size: 24px;
  color: #2D5F4F;
  margin: 0 0 8px 0;
`;

const ComingSoonText = styled.p`
  color: #666;
  font-size: 16px;
  margin-bottom: 12px;
`;

// Remove old unused styled components
const HeaderContent = styled.div`
  text-align: center;
`;

const HeaderSubtext = styled.p`
  color: #666;
  font-size: 14px;
  margin: 0;
  text-align: center;
`;

const ScrollContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0 20px 20px 20px;
`;

const TalentCorpSection = styled.div`
  margin-bottom: 24px;
`;

const ConnectCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  text-align: center;
`;

const ConnectIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
`;

const ConnectContent = styled.div`
  margin-bottom: 24px;
`;

const ConnectTitle = styled.h3`
  font-size: 20px;
  font-weight: bold;
  color: #2D5F4F;
  margin: 0 0 12px 0;
`;

const ConnectDescription = styled.p`
  color: #666;
  font-size: 14px;
  margin: 0 0 20px 0;
  line-height: 1.5;
`;

const FeatureList = styled.div`
  text-align: left;
  margin: 20px 0;
`;

const FeatureItem = styled.div`
  color: #2D5F4F;
  font-size: 14px;
  margin: 8px 0;
  display: flex;
  align-items: center;
`;

const ConnectButton = styled.button`
  background: linear-gradient(135deg, #2D5F4F, #4A90A4);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 16px 32px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(45, 95, 79, 0.3);
  }
`;

const ConnectedCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
`;

const ProfileSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const ProfileAvatar = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #2D5F4F, #4A90A4);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  font-weight: bold;
`;

const ProfileInfo = styled.div`
  flex: 1;
`;

const ProfileName = styled.h4`
  font-size: 18px;
  font-weight: bold;
  color: #2D5F4F;
  margin: 0 0 4px 0;
`;

const ProfileRole = styled.p`
  color: #666;
  font-size: 14px;
  margin: 0 0 4px 0;
`;

const ProfileLocation = styled.p`
  color: #666;
  font-size: 12px;
  margin: 0;
`;

const VerificationBadges = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Badge = styled.div<{ $type: string }>`
  background: ${props => props.$type === 'myheart' ? '#8E44AD' : '#FF6B35'};
  color: white;
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 600;
  text-align: center;
`;

const TypeSelector = styled.div`
  display: flex;
  background: white;
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
`;

const TypeButton = styled.button<{ $active: boolean }>`
  flex: 1;
  background: ${props => props.$active ? 'linear-gradient(135deg, #2D5F4F, #4A90A4)' : 'transparent'};
  color: ${props => props.$active ? 'white' : '#666'};
  border: none;
  border-radius: 8px;
  padding: 12px 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
`;

const NetworkingSection = styled.div`
  margin-bottom: 24px;
`;

const SectionHeader = styled.div`
  margin-bottom: 16px;
`;

const SectionTitle = styled.h3`
  font-size: 20px;
  font-weight: bold;
  color: #2D5F4F;
  margin: 0 0 8px 0;
`;

const SectionSubtext = styled.p`
  color: #666;
  font-size: 14px;
  margin: 0;
`;

const NetworkingTabs = styled.div`
  display: flex;
  background: white;
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
`;

const TabButton = styled.button<{ $active: boolean }>`
  flex: 1;
  background: ${props => props.$active ? 'linear-gradient(135deg, #2D5F4F, #4A90A4)' : 'transparent'};
  color: ${props => props.$active ? 'white' : '#666'};
  border: none;
  border-radius: 8px;
  padding: 10px 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
`;

const SessionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const SessionCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
`;

const SessionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
`;

const SessionTitle = styled.h4`
  font-size: 16px;
  font-weight: bold;
  color: #2D5F4F;
  margin: 0;
  flex: 1;
`;

const SessionType = styled.div<{ $type: string }>`
  background: ${props => 
    props.$type === 'diaspora-connect' ? '#8E44AD' :
    props.$type === 'mentor-matching' ? '#4A90A4' : '#FF6B35'
  };
  color: white;
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 12px;
  margin-left: 12px;
`;

const SessionDetails = styled.div`
  margin-bottom: 16px;
`;

const SessionMeta = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 8px;
`;

const MetaItem = styled.span`
  color: #666;
  font-size: 12px;
  display: flex;
  align-items: center;
`;

const SessionParticipants = styled.div`
  margin-bottom: 16px;
`;

const ParticipantsCount = styled.div`
  color: #666;
  font-size: 12px;
  margin-bottom: 8px;
`;

const ParticipantsBar = styled.div`
  width: 100%;
  height: 4px;
  background: #e9ecef;
  border-radius: 2px;
  overflow: hidden;
`;

const ParticipantsProgress = styled.div<{ $percentage: number }>`
  width: ${props => props.$percentage}%;
  height: 100%;
  background: linear-gradient(135deg, #2D5F4F, #4A90A4);
  border-radius: 2px;
  transition: width 0.3s ease;
`;

const SessionActions = styled.div`
  display: flex;
  gap: 12px;
`;

const JoinButton = styled.button<{ $primary?: boolean }>`
  background: ${props => props.$primary ? 
    'linear-gradient(135deg, #8E44AD, #4A90A4)' : 
    'transparent'
  };
  color: ${props => props.$primary ? 'white' : '#666'};
  border: ${props => props.$primary ? 'none' : '1px solid #ddd'};
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  flex: 1;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-1px);
  }
`;

const LearnMoreButton = styled.button`
  background: transparent;
  color: #666;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #f8f9fa;
  }
`;

const MentorListSection = styled.div`
  margin-bottom: 24px;
`;

const MentorGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const MentorCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  gap: 16px;
`;

const MentorAvatar = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #2D5F4F, #4A90A4);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
  font-weight: bold;
`;

const MentorInfo = styled.div`
  flex: 1;
`;

const MentorName = styled.h5`
  font-size: 16px;
  font-weight: bold;
  color: #2D5F4F;
  margin: 0 0 4px 0;
`;

const MentorRole = styled.p`
  color: #666;
  font-size: 13px;
  margin: 0 0 4px 0;
`;

const MentorSkills = styled.p`
  color: #666;
  font-size: 12px;
  margin: 0 0 4px 0;
`;

const MentorRating = styled.p`
  color: #666;
  font-size: 12px;
  margin: 0;
`;

const MentorActions = styled.div`
  display: flex;
  flex-direction: column;
`;

const ConnectMentorButton = styled.button`
  background: linear-gradient(135deg, #2D5F4F, #4A90A4);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(45, 95, 79, 0.3);
  }
`;