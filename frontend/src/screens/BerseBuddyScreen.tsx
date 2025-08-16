import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { StatusBar } from '../components/StatusBar';
import { MainNav } from '../components/MainNav';
import { ProfileSidebar } from '../components/ProfileSidebar';

// EMGS & BrainsMingle Integration
interface EMGSStudent {
  id: string;
  email: string;
  fullName: string;
  program: string;
  year: number;
  university: string;
  country: string;
  visa_status: 'approved' | 'pending' | 'expired';
  academic_level: 'foundation' | 'diploma' | 'bachelor' | 'master' | 'phd';
  interests: string[];
  study_preferences: {
    study_style: 'group' | 'individual' | 'mixed';
    subjects: string[];
    availability: string[];
  };
}

interface StudySession {
  id: string;
  title: string;
  subject: string;
  level: string;
  location: string;
  date: string;
  time: string;
  participants: number;
  maxParticipants: number;
  type: 'study-group' | 'exam-prep' | 'project-collab' | 'language-exchange';
}

export const BerseBuddyScreen: React.FC = () => {
  const navigate = useNavigate();
  const [showProfileSidebar, setShowProfileSidebar] = useState(false);
  const [buddyType, setBuddyType] = useState<'findBuddy' | 'becomeBuddy' | 'studyGroups'>('findBuddy');
  const [emgsConnected, setEmgsConnected] = useState(false);
  const [studentProfile, setStudentProfile] = useState<EMGSStudent | null>(null);
  const [activeTab, setActiveTab] = useState<'local' | 'international' | 'online'>('local');

  const mockStudySessions: StudySession[] = [
    {
      id: '1',
      title: 'Engineering Mathematics Study Circle',
      subject: 'Mathematics',
      level: 'Bachelor',
      location: 'University Malaya',
      date: '2025-01-15',
      time: '2:00 PM MYT',
      participants: 8,
      maxParticipants: 12,
      type: 'study-group'
    },
    {
      id: '2',
      title: 'IELTS Speaking Practice Session',
      subject: 'English',
      level: 'All Levels',
      location: 'Online',
      date: '2025-01-16',
      time: '7:00 PM MYT',
      participants: 15,
      maxParticipants: 20,
      type: 'language-exchange'
    },
    {
      id: '3',
      title: 'Computer Science Final Exam Prep',
      subject: 'Computer Science',
      level: 'Bachelor',
      location: 'Taylor\'s University',
      date: '2025-01-17',
      time: '10:00 AM MYT',
      participants: 12,
      maxParticipants: 15,
      type: 'exam-prep'
    }
  ];

  const handleEmgsConnect = () => {
    // Simulate EMGS OAuth flow
    setEmgsConnected(true);
    setStudentProfile({
      id: 'emgs-456',
      email: 'student@example.com',
      fullName: 'Sarah Chen',
      program: 'Computer Science',
      year: 2,
      university: 'University of Malaya',
      country: 'Singapore',
      visa_status: 'approved',
      academic_level: 'bachelor',
      interests: ['Programming', 'AI/ML', 'Mobile Development'],
      study_preferences: {
        study_style: 'group',
        subjects: ['Mathematics', 'Programming', 'Data Structures'],
        availability: ['weekends', 'evenings']
      }
    });
  };

  const joinStudySession = async (sessionId: string) => {
    // Integration with BrainsMingle API for study groups
    console.log(`Joining study session: ${sessionId}`);
    // Redirect to BrainsMingle study session
    window.open(`https://brainsmingle.com/study/${sessionId}?source=bersebuddy`, '_blank');
  };

  return (
    <Container>
      <StatusBar />
      
      <Header>
        <BackButton onClick={() => navigate('/dashboard')}>←</BackButton>
        <HeaderContent>
          <HeaderTitle>🤝 BerseBuddy</HeaderTitle>
          <HeaderSubtext>Student networking powered by EMGS & BrainsMingle</HeaderSubtext>
        </HeaderContent>
      </Header>

      <ScrollContent>
        <EmgsSection>
          {!emgsConnected ? (
            <ConnectCard>
              <ConnectIcon>🎓</ConnectIcon>
              <ConnectContent>
                <ConnectTitle>Connect with EMGS</ConnectTitle>
                <ConnectDescription>
                  Verify your student status and connect with fellow international students
                </ConnectDescription>
                <FeatureList>
                  <FeatureItem>✓ Verify your student visa status</FeatureItem>
                  <FeatureItem>✓ Access EMGS student network</FeatureItem>
                  <FeatureItem>✓ Smart study buddy matching</FeatureItem>
                  <FeatureItem>✓ Academic support groups</FeatureItem>
                </FeatureList>
              </ConnectContent>
              <ConnectButton onClick={handleEmgsConnect}>
                Connect EMGS Account
              </ConnectButton>
            </ConnectCard>
          ) : (
            <ConnectedCard>
              <ProfileSection>
                <ProfileAvatar>{studentProfile?.fullName.charAt(0)}</ProfileAvatar>
                <ProfileInfo>
                  <ProfileName>{studentProfile?.fullName}</ProfileName>
                  <ProfileRole>{studentProfile?.program} • Year {studentProfile?.year}</ProfileRole>
                  <ProfileLocation>🏫 {studentProfile?.university}</ProfileLocation>
                  <ProfileLocation>🌍 {studentProfile?.country}</ProfileLocation>
                </ProfileInfo>
                <VerificationBadges>
                  <Badge $type="emgs">EMGS ✓</Badge>
                  <Badge $type="visa" $status={studentProfile?.visa_status || 'approved'}>
                    Visa ✓
                  </Badge>
                </VerificationBadges>
              </ProfileSection>
            </ConnectedCard>
          )}
        </EmgsSection>

        {emgsConnected && (
          <>
            <TypeSelector>
              <TypeButton 
                $active={buddyType === 'findBuddy'}
                onClick={() => setBuddyType('findBuddy')}
              >
                🔍 Find Buddy
              </TypeButton>
              <TypeButton 
                $active={buddyType === 'becomeBuddy'}
                onClick={() => setBuddyType('becomeBuddy')}
              >
                🤝 Be Buddy
              </TypeButton>
              <TypeButton 
                $active={buddyType === 'studyGroups'}
                onClick={() => setBuddyType('studyGroups')}
              >
                📚 Study Groups
              </TypeButton>
            </TypeSelector>

            {buddyType === 'studyGroups' && (
              <StudyGroupsSection>
                <SectionHeader>
                  <SectionTitle>📚 BrainsMingle Study Sessions</SectionTitle>
                  <SectionSubtext>Join collaborative learning sessions</SectionSubtext>
                </SectionHeader>

                <StudyTabs>
                  <TabButton $active={activeTab === 'local'} onClick={() => setActiveTab('local')}>
                    🏫 Local
                  </TabButton>
                  <TabButton $active={activeTab === 'international'} onClick={() => setActiveTab('international')}>
                    🌍 International
                  </TabButton>
                  <TabButton $active={activeTab === 'online'} onClick={() => setActiveTab('online')}>
                    💻 Online
                  </TabButton>
                </StudyTabs>

                <SessionsList>
                  {mockStudySessions
                    .filter(session => {
                      if (activeTab === 'local') return session.location !== 'Online' && session.location.includes('University');
                      if (activeTab === 'online') return session.location === 'Online';
                      return session.location !== 'Online';
                    })
                    .map((session) => (
                      <SessionCard key={session.id}>
                        <SessionHeader>
                          <SessionTitle>{session.title}</SessionTitle>
                          <SessionType $type={session.type}>
                            {session.type === 'study-group' ? '📚' : 
                             session.type === 'exam-prep' ? '📝' : 
                             session.type === 'language-exchange' ? '🗣️' : '🤝'}
                          </SessionType>
                        </SessionHeader>
                        
                        <SessionDetails>
                          <SessionMeta>
                            <MetaItem>📖 {session.subject}</MetaItem>
                            <MetaItem>🎓 {session.level}</MetaItem>
                          </SessionMeta>
                          <SessionMeta>
                            <MetaItem>📍 {session.location}</MetaItem>
                          </SessionMeta>
                          <SessionMeta>
                            <MetaItem>📅 {session.date}</MetaItem>
                            <MetaItem>⏰ {session.time}</MetaItem>
                          </SessionMeta>
                        </SessionDetails>

                        <SessionParticipants>
                          <ParticipantsCount>
                            👥 {session.participants}/{session.maxParticipants} students joined
                          </ParticipantsCount>
                          <ParticipantsBar>
                            <ParticipantsProgress 
                              $percentage={(session.participants / session.maxParticipants) * 100}
                            />
                          </ParticipantsBar>
                        </SessionParticipants>

                        <SessionActions>
                          <JoinButton 
                            onClick={() => joinStudySession(session.id)}
                            $primary
                          >
                            🧠 Join Study Session
                          </JoinButton>
                          <LearnMoreButton>Details</LearnMoreButton>
                        </SessionActions>
                      </SessionCard>
                    ))}
                </SessionsList>
              </StudyGroupsSection>
            )}

            {buddyType === 'findBuddy' && (
              <BuddyListSection>
                <SectionHeader>
                  <SectionTitle>🔍 Available Study Buddies</SectionTitle>
                  <SectionSubtext>Connect with fellow students</SectionSubtext>
                </SectionHeader>
                
                <BuddyGrid>
                  <BuddyCard>
                    <BuddyAvatar>AW</BuddyAvatar>
                    <BuddyInfo>
                      <BuddyName>Ahmad Wafi</BuddyName>
                      <BuddyRole>Engineering • Year 3</BuddyRole>
                      <BuddySkills>Mathematics • Physics • Programming</BuddySkills>
                      <BuddyRating>⭐ 4.8 (12 study sessions)</BuddyRating>
                    </BuddyInfo>
                    <BuddyActions>
                      <ConnectBuddyButton>Connect</ConnectBuddyButton>
                    </BuddyActions>
                  </BuddyCard>
                  
                  <BuddyCard>
                    <BuddyAvatar>LT</BuddyAvatar>
                    <BuddyInfo>
                      <BuddyName>Li Ting</BuddyName>
                      <BuddyRole>Business • Year 2</BuddyRole>
                      <BuddySkills>Accounting • Statistics • Research</BuddySkills>
                      <BuddyRating>⭐ 4.9 (8 study sessions)</BuddyRating>
                    </BuddyInfo>
                    <BuddyActions>
                      <ConnectBuddyButton>Connect</ConnectBuddyButton>
                    </BuddyActions>
                  </BuddyCard>
                </BuddyGrid>
              </BuddyListSection>
            )}
          </>
        )}
      </ScrollContent>

      <MainNav 
        activeTab="home"
        onTabPress={(tab) => {
          switch (tab) {
            case 'home': navigate('/dashboard'); break;
            case 'connect': navigate('/connect'); break;
            case 'match': navigate('/match'); break;
            case 'forum': navigate('/forum'); break;
          }
        }}
      />
      
      <ProfileSidebar 
        isOpen={showProfileSidebar}
        onClose={() => setShowProfileSidebar(false)}
      />
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #F9F3E3;
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
  color: #2fce98;
  cursor: pointer;
  position: absolute;
  left: 20px;
  top: 16px;
`;

const HeaderContent = styled.div`
  text-align: center;
`;

const HeaderTitle = styled.h1`
  font-size: 24px;
  font-weight: bold;
  color: #2fce98;
  margin: 0 0 8px 0;
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
  padding: 0 20px 100px 20px; /* Added extra space for floating nav */
`;

const EmgsSection = styled.div`
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
  color: #2fce98;
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
  color: #2fce98;
  font-size: 14px;
  margin: 8px 0;
  display: flex;
  align-items: center;
`;

const ConnectButton = styled.button`
  background: linear-gradient(135deg, #E67E22, #F39C12);
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
    box-shadow: 0 4px 12px rgba(230, 126, 34, 0.3);
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
  background: linear-gradient(135deg, #E67E22, #F39C12);
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
  color: #2fce98;
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
  margin: 0 0 2px 0;
`;

const VerificationBadges = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Badge = styled.div<{ $type: string; $status?: string }>`
  background: ${props => 
    props.$type === 'emgs' ? '#E67E22' : 
    props.$status === 'approved' ? '#27AE60' : 
    props.$status === 'pending' ? '#F39C12' : '#E74C3C'
  };
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
  background: ${props => props.$active ? 'linear-gradient(135deg, #E67E22, #F39C12)' : 'transparent'};
  color: ${props => props.$active ? 'white' : '#666'};
  border: none;
  border-radius: 8px;
  padding: 12px 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
`;

const StudyGroupsSection = styled.div`
  margin-bottom: 24px;
`;

const SectionHeader = styled.div`
  margin-bottom: 16px;
`;

const SectionTitle = styled.h3`
  font-size: 20px;
  font-weight: bold;
  color: #2fce98;
  margin: 0 0 8px 0;
`;

const SectionSubtext = styled.p`
  color: #666;
  font-size: 14px;
  margin: 0;
`;

const StudyTabs = styled.div`
  display: flex;
  background: white;
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
`;

const TabButton = styled.button<{ $active: boolean }>`
  flex: 1;
  background: ${props => props.$active ? 'linear-gradient(135deg, #E67E22, #F39C12)' : 'transparent'};
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
  color: #2fce98;
  margin: 0;
  flex: 1;
`;

const SessionType = styled.div<{ $type: string }>`
  background: ${props => 
    props.$type === 'study-group' ? '#3498DB' :
    props.$type === 'exam-prep' ? '#E74C3C' :
    props.$type === 'language-exchange' ? '#9B59B6' : '#F39C12'
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
  background: linear-gradient(135deg, #E67E22, #F39C12);
  border-radius: 2px;
  transition: width 0.3s ease;
`;

const SessionActions = styled.div`
  display: flex;
  gap: 12px;
`;

const JoinButton = styled.button<{ $primary?: boolean }>`
  background: ${props => props.$primary ? 
    'linear-gradient(135deg, #E67E22, #F39C12)' : 
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

const BuddyListSection = styled.div`
  margin-bottom: 24px;
`;

const BuddyGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const BuddyCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  gap: 16px;
`;

const BuddyAvatar = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #E67E22, #F39C12);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
  font-weight: bold;
`;

const BuddyInfo = styled.div`
  flex: 1;
`;

const BuddyName = styled.h5`
  font-size: 16px;
  font-weight: bold;
  color: #2fce98;
  margin: 0 0 4px 0;
`;

const BuddyRole = styled.p`
  color: #666;
  font-size: 13px;
  margin: 0 0 4px 0;
`;

const BuddySkills = styled.p`
  color: #666;
  font-size: 12px;
  margin: 0 0 4px 0;
`;

const BuddyRating = styled.p`
  color: #666;
  font-size: 12px;
  margin: 0;
`;

const BuddyActions = styled.div`
  display: flex;
  flex-direction: column;
`;

const ConnectBuddyButton = styled.button`
  background: linear-gradient(135deg, #E67E22, #F39C12);
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
    box-shadow: 0 4px 12px rgba(230, 126, 34, 0.3);
  }
`;