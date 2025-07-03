import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { StatusBar } from '../components/StatusBar';
import { Header } from '../components/Header';
import { MainNav } from '../components/MainNav';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Points } from '../components/Points';
import { TextField } from '../components/TextField';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.background.default};
`;

const Content = styled.div`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.md};
  padding-bottom: 80px; // Space for nav
  overflow-y: auto;
  max-width: 393px;
  width: 100%;
  margin: 0 auto;
`;

const ProfileSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const ProfileImage = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.primary.light};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  font-weight: ${({ theme }) => theme.typography.heading.h2.fontWeight};
  color: ${({ theme }) => theme.colors.primary.main};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const UserName = styled.h2`
  font-size: ${({ theme }) => theme.typography.heading.h2.fontSize};
  font-weight: ${({ theme }) => theme.typography.heading.h2.fontWeight};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const UserEmail = styled.p`
  font-size: ${({ theme }) => theme.typography.body.medium.fontSize};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const StatCard = styled(Card)`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.lg};
`;

const StatValue = styled.div`
  font-size: ${({ theme }) => theme.typography.heading.h1.fontSize};
  font-weight: ${({ theme }) => theme.typography.heading.h1.fontWeight};
  color: ${({ theme }) => theme.colors.primary.main};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const StatLabel = styled.div`
  font-size: ${({ theme }) => theme.typography.body.small.fontSize};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const Section = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const SectionTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.heading.h3.fontSize};
  font-weight: ${({ theme }) => theme.typography.heading.h3.fontWeight};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.md};
`;

export const ProfileScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [interests, setInterests] = useState(user?.interests?.join(', ') || '');

  const handleNavigation = (tab: string) => {
    setActiveTab(tab);
    switch (tab) {
      case 'home':
        navigate('/dashboard');
        break;
      case 'connect':
        navigate('/connect');
        break;
      case 'match':
        navigate('/match');
        break;
      default:
        break;
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement profile update API call
    alert('Profile updated successfully!');
    setIsEditing(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Container>
      <StatusBar />
      <Header
        title="Profile"
        showBack
        onBackPress={() => navigate('/dashboard')}
      />
      
      <Content>
        <ProfileSection>
          <ProfileImage>
            {user?.profilePicture ? (
              <img src={user.profilePicture} alt={user.fullName} />
            ) : (
              getInitials(user?.fullName || 'User')
            )}
          </ProfileImage>
          <UserName>{user?.fullName}</UserName>
          <UserEmail>{user?.email}</UserEmail>
          <Points points={user?.points || 0} size="medium" />
        </ProfileSection>

        <StatsGrid>
          <StatCard>
            <StatValue>12</StatValue>
            <StatLabel>Events Joined</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>8</StatValue>
            <StatLabel>Connections</StatLabel>
          </StatCard>
        </StatsGrid>

        <Section>
          <SectionTitle>About Me</SectionTitle>
          {isEditing ? (
            <Form onSubmit={handleSaveProfile}>
              <TextField
                label="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
              />
              <TextField
                label="Bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself"
              />
              <TextField
                label="Interests"
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                placeholder="Enter interests separated by commas"
                helperText="e.g., Volunteering, Sports, Reading"
              />
              <ButtonGroup>
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  type="button"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                >
                  Save Changes
                </Button>
              </ButtonGroup>
            </Form>
          ) : (
            <>
              <Card>
                <p>{user?.bio || 'No bio available'}</p>
                {user?.interests && user.interests.length > 0 && (
                  <p style={{ marginTop: '8px' }}>
                    <strong>Interests:</strong> {user.interests.join(', ')}
                  </p>
                )}
              </Card>
              <Button
                variant="outline"
                onClick={() => setIsEditing(true)}
                style={{ marginTop: '16px' }}
              >
                Edit Profile
              </Button>
            </>
          )}
        </Section>

        <Section>
          <SectionTitle>Settings</SectionTitle>
          <Button
            variant="outline"
            fullWidth
            onClick={() => alert('Notifications settings coming soon!')}
          >
            Notification Settings
          </Button>
          <Button
            variant="outline"
            fullWidth
            onClick={() => alert('Privacy settings coming soon!')}
            style={{ marginTop: '12px' }}
          >
            Privacy Settings
          </Button>
          <Button
            variant="danger"
            fullWidth
            onClick={handleLogout}
            style={{ marginTop: '12px' }}
          >
            Logout
          </Button>
        </Section>
      </Content>

      <MainNav
        activeTab={activeTab}
        onTabPress={handleNavigation}
      />
    </Container>
  );
};