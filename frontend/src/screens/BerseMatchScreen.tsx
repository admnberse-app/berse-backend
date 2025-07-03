import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { StatusBar } from '../components/StatusBar';
import { Header } from '../components/Header';
import { MainNav } from '../components/MainNav';
import { Button } from '../components/Button';
import matchingService from '@frontend-api/services/matching.service';
import { User } from '@frontend-api/types';

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

const MatchCard = styled.div`
  background-color: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borders.radius.large};
  padding: ${({ theme }) => theme.spacing.xl};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  box-shadow: ${({ theme }) => theme.effects.shadow.medium};
  text-align: center;
`;

const ProfileImage = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.primary.light};
  margin: 0 auto ${({ theme }) => theme.spacing.lg};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
`;

const UserName = styled.h2`
  font-size: ${({ theme }) => theme.typography.heading.h2.fontSize};
  font-weight: ${({ theme }) => theme.typography.heading.h2.fontWeight};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const UserBio = styled.p`
  font-size: ${({ theme }) => theme.typography.body.medium.fontSize};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const InterestsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
  justify-content: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const InterestTag = styled.span`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  background-color: ${({ theme }) => theme.colors.primary.light};
  color: ${({ theme }) => theme.colors.primary.main};
  border-radius: ${({ theme }) => theme.borders.radius.pill};
  font-size: ${({ theme }) => theme.typography.body.small.fontSize};
`;

const ActionButtons = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.md};
`;

const LoadingMessage = styled.div`
  text-align: center;
  color: ${({ theme }) => theme.colors.text.secondary};
  padding: ${({ theme }) => theme.spacing.xl};
`;

const EmptyMessage = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xxl};
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const EmptyText = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.body.medium.fontSize};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

export const BerseMatchScreen: React.FC = () => {
  const navigate = useNavigate();
  const [currentMatch, setCurrentMatch] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('match');

  useEffect(() => {
    loadNextMatch();
  }, []);

  const loadNextMatch = async () => {
    setIsLoading(true);
    try {
      const matches = await matchingService.getPotentialMatches();
      if (matches.length > 0) {
        setCurrentMatch(matches[0]);
      } else {
        setCurrentMatch(null);
      }
    } catch (error) {
      console.error('Failed to load matches:', error);
      setCurrentMatch(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigation = (tab: string) => {
    setActiveTab(tab);
    switch (tab) {
      case 'home':
        navigate('/dashboard');
        break;
      case 'connect':
        navigate('/connect');
        break;
      case 'profile':
        navigate('/profile');
        break;
      default:
        break;
    }
  };

  const handleAction = async (action: 'accept' | 'skip') => {
    if (!currentMatch) return;

    try {
      if (action === 'accept') {
        await matchingService.acceptMatch(currentMatch.id);
        alert('Match accepted! You can now connect.');
      } else {
        await matchingService.skipMatch(currentMatch.id);
      }
      // Load next match
      loadNextMatch();
    } catch (error) {
      console.error(`Failed to ${action} match:`, error);
      alert(`Failed to ${action} match`);
    }
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
        title="BerseMatch"
        showBack
        onBackPress={() => navigate('/dashboard')}
      />
      
      <Content>
        {isLoading ? (
          <LoadingMessage>Finding your next match...</LoadingMessage>
        ) : currentMatch ? (
          <MatchCard>
            <ProfileImage>
              {currentMatch.profilePicture ? (
                <img src={currentMatch.profilePicture} alt={currentMatch.fullName} />
              ) : (
                getInitials(currentMatch.fullName)
              )}
            </ProfileImage>
            
            <UserName>{currentMatch.fullName}</UserName>
            <UserBio>
              {currentMatch.bio || 'No bio available'}
            </UserBio>
            
            {currentMatch.interests && currentMatch.interests.length > 0 && (
              <InterestsList>
                {currentMatch.interests.map((interest: string, index: number) => (
                  <InterestTag key={index}>{interest}</InterestTag>
                ))}
              </InterestsList>
            )}
            
            <ActionButtons>
              <Button
                variant="outline"
                size="large"
                onClick={() => handleAction('skip')}
              >
                Skip
              </Button>
              <Button
                variant="primary"
                size="large"
                onClick={() => handleAction('accept')}
              >
                Connect
              </Button>
            </ActionButtons>
          </MatchCard>
        ) : (
          <EmptyMessage>
            <EmptyIcon>👥</EmptyIcon>
            <EmptyText>
              No more matches available right now.
              Check back later for new connections!
            </EmptyText>
            <Button
              variant="primary"
              onClick={loadNextMatch}
            >
              Refresh Matches
            </Button>
          </EmptyMessage>
        )}
      </Content>

      <MainNav
        activeTab={activeTab}
        onTabPress={handleNavigation}
      />
    </Container>
  );
};