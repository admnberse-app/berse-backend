import React, { useState, useEffect } from 'react';
import {
  Paper,
  Box,
  Typography,
  LinearProgress,
  Chip,
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  EmojiEvents,
  Timer,
  TrendingUp,
  CheckCircle,
  Star,
  NavigateNext,
  Refresh,
  LocalFireDepartment,
} from '@mui/icons-material';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'special';
  progress: number;
  target: number;
  reward: number;
  expiresAt: Date;
  completed: boolean;
  icon?: string;
}

const ChallengeCard = styled(motion.div)<{ type: string }>`
  background: ${props => {
    switch (props.type) {
      case 'daily':
        return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
      case 'weekly':
        return 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
      case 'special':
        return 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)';
      default:
        return '#fff';
    }
  }};
  border-radius: 12px;
  padding: 16px;
  color: white;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.2);
  }
`;

const StreakBadge = styled(Badge)`
  .MuiBadge-badge {
    background: linear-gradient(135deg, #ff6b6b 0%, #feca57 100%);
    color: white;
    font-weight: bold;
  }
`;

const ChallengesWidget: React.FC = () => {
  const navigate = useNavigate();
  const [challenges, setChallenges] = useState<Challenge[]>([
    {
      id: '1',
      title: 'Daily Check-in',
      description: 'Open the app today',
      type: 'daily',
      progress: 1,
      target: 1,
      reward: 10,
      expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000),
      completed: true,
      icon: '📱',
    },
    {
      id: '2',
      title: 'Event Explorer',
      description: 'Attend 3 events this week',
      type: 'weekly',
      progress: 1,
      target: 3,
      reward: 100,
      expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      completed: false,
      icon: '🎯',
    },
    {
      id: '3',
      title: 'Social Butterfly',
      description: 'Connect with 5 new friends',
      type: 'weekly',
      progress: 2,
      target: 5,
      reward: 150,
      expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      completed: false,
      icon: '🦋',
    },
    {
      id: '4',
      title: 'Ramadan Special',
      description: 'Complete all daily prayers tracking',
      type: 'special',
      progress: 15,
      target: 30,
      reward: 500,
      expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      completed: false,
      icon: '🌙',
    },
  ]);

  const [streak, setStreak] = useState(7);
  const [totalPoints, setTotalPoints] = useState(0);

  useEffect(() => {
    calculateTotalRewards();
  }, [challenges]);

  const calculateTotalRewards = () => {
    const total = challenges
      .filter(c => !c.completed)
      .reduce((sum, c) => sum + c.reward, 0);
    setTotalPoints(total);
  };

  const getTimeRemaining = (expiresAt: Date): string => {
    const now = new Date();
    const diff = expiresAt.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d left`;
    if (hours > 0) return `${hours}h left`;
    return 'Expires soon';
  };

  const handleChallengeClick = (challenge: Challenge) => {
    if (challenge.completed) {
      // Show completion animation or modal
      console.log('Challenge already completed');
    } else {
      // Navigate to challenge details or update progress
      console.log('Update challenge progress');
    }
  };

  const handleViewAll = () => {
    navigate('/challenges');
  };

  const refreshChallenges = () => {
    // Refresh challenges from API
    console.log('Refreshing challenges...');
  };

  return (
    <Paper sx={{ p: 2, borderRadius: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box display="flex" alignItems="center" gap={1}>
          <EmojiEvents color="primary" />
          <Typography variant="h6" fontWeight="bold">
            Weekly Challenges
          </Typography>
          <StreakBadge badgeContent={`${streak} 🔥`}>
            <LocalFireDepartment sx={{ fontSize: 20, color: 'orange' }} />
          </StreakBadge>
        </Box>
        <Box display="flex" gap={1}>
          <IconButton size="small" onClick={refreshChallenges}>
            <Refresh />
          </IconButton>
          <Button
            endIcon={<NavigateNext />}
            onClick={handleViewAll}
            size="small"
          >
            View All
          </Button>
        </Box>
      </Box>

      {/* Summary Stats */}
      <Box display="flex" gap={2} mb={2}>
        <Chip
          icon={<Star />}
          label={`${totalPoints} points available`}
          size="small"
          color="primary"
        />
        <Chip
          icon={<CheckCircle />}
          label={`${challenges.filter(c => c.completed).length}/${challenges.length} completed`}
          size="small"
          color="success"
        />
      </Box>

      <Grid container spacing={2}>
        {challenges.map((challenge) => (
          <Grid item xs={12} sm={6} key={challenge.id}>
            <ChallengeCard
              type={challenge.type}
              onClick={() => handleChallengeClick(challenge)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Box display="flex" justifyContent="space-between" alignItems="start">
                <Box flex={1}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Typography variant="h4">{challenge.icon}</Typography>
                    <Box>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {challenge.title}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.9 }}>
                        {challenge.description}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <LinearProgress
                    variant="determinate"
                    value={(challenge.progress / challenge.target) * 100}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: 'rgba(255,255,255,0.3)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: 'white',
                      },
                    }}
                  />
                  
                  <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                    <Typography variant="caption">
                      {challenge.progress}/{challenge.target}
                    </Typography>
                    <Chip
                      label={`+${challenge.reward} pts`}
                      size="small"
                      sx={{
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        color: 'white',
                      }}
                    />
                  </Box>
                </Box>
                
                {challenge.completed && (
                  <CheckCircle sx={{ color: 'white', opacity: 0.9 }} />
                )}
              </Box>
              
              <Box display="flex" alignItems="center" gap={0.5} mt={1}>
                <Timer sx={{ fontSize: 14, opacity: 0.8 }} />
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  {getTimeRemaining(challenge.expiresAt)}
                </Typography>
              </Box>
            </ChallengeCard>
          </Grid>
        ))}
      </Grid>

      {/* Achievement Progress */}
      <Card sx={{ mt: 2, bgcolor: 'grey.50' }}>
        <CardContent>
          <Typography variant="subtitle2" gutterBottom>
            Next Achievement
          </Typography>
          <Box display="flex" alignItems="center" gap={2}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant="h6">🏆</Typography>
            </Box>
            <Box flex={1}>
              <Typography variant="body2" fontWeight="bold">
                Challenge Master
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Complete 10 weekly challenges
              </Typography>
              <LinearProgress
                variant="determinate"
                value={70}
                sx={{ mt: 1, height: 4, borderRadius: 2 }}
              />
            </Box>
            <Typography variant="caption" color="text.secondary">
              7/10
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Paper>
  );
};

export default ChallengesWidget;