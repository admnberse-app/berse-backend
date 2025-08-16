import React, { useState } from 'react';
import {
  Paper,
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  Badge,
} from '@mui/material';
import {
  TrendingUp,
  NavigateNext,
  EmojiEvents,
  KeyboardArrowUp,
  KeyboardArrowDown,
  Remove,
} from '@mui/icons-material';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  name: string;
  avatar: string;
  points: number;
  level: number;
  change: number;
}

const RankBadge = styled(Badge)<{ rank: number }>`
  .MuiBadge-badge {
    background: ${props => {
      if (props.rank === 1) return 'linear-gradient(135deg, #FFD700 0%, #FFA000 100%)';
      if (props.rank === 2) return 'linear-gradient(135deg, #C0C0C0 0%, #808080 100%)';
      if (props.rank === 3) return 'linear-gradient(135deg, #CD7F32 0%, #8B4513 100%)';
      return '#757575';
    }};
    color: white;
    font-weight: bold;
    width: 24px;
    height: 24px;
  }
`;

const LeaderboardWidget: React.FC = () => {
  const navigate = useNavigate();
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'alltime'>('weekly');
  
  const currentUserId = '4'; // Current user's ID
  
  const leaderboardData: LeaderboardEntry[] = [
    {
      rank: 1,
      userId: '1',
      username: 'sarah_a',
      name: 'Sarah Ahmad',
      avatar: '/avatars/1.jpg',
      points: 2450,
      level: 8,
      change: 0,
    },
    {
      rank: 2,
      userId: '2',
      username: 'omar_h',
      name: 'Omar Hassan',
      avatar: '/avatars/2.jpg',
      points: 2280,
      level: 7,
      change: 2,
    },
    {
      rank: 3,
      userId: '3',
      username: 'fatima_ali',
      name: 'Fatima Ali',
      avatar: '/avatars/3.jpg',
      points: 2150,
      level: 7,
      change: -1,
    },
    {
      rank: 4,
      userId: '4',
      username: 'ahmad_r',
      name: 'You',
      avatar: '/avatars/user.jpg',
      points: 1650,
      level: 4,
      change: 1,
    },
    {
      rank: 5,
      userId: '5',
      username: 'ibrahim_k',
      name: 'Ibrahim Khan',
      avatar: '/avatars/4.jpg',
      points: 1500,
      level: 4,
      change: -2,
    },
  ];

  const handleTimeframeChange = (event: React.MouseEvent<HTMLElement>, newTimeframe: string | null) => {
    if (newTimeframe !== null) {
      setTimeframe(newTimeframe as 'daily' | 'weekly' | 'alltime');
    }
  };

  const handleViewFullLeaderboard = () => {
    navigate('/leaderboard', { state: { defaultView: timeframe } });
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <KeyboardArrowUp sx={{ color: 'success.main', fontSize: 16 }} />;
    if (change < 0) return <KeyboardArrowDown sx={{ color: 'error.main', fontSize: 16 }} />;
    return <Remove sx={{ color: 'text.secondary', fontSize: 16 }} />;
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return null;
  };

  return (
    <Paper sx={{ p: 2, borderRadius: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box display="flex" alignItems="center" gap={1}>
          <TrendingUp color="primary" />
          <Typography variant="h6" fontWeight="bold">
            Leaderboard
          </Typography>
        </Box>
        <Button
          endIcon={<NavigateNext />}
          onClick={handleViewFullLeaderboard}
          size="small"
        >
          View All
        </Button>
      </Box>

      <ToggleButtonGroup
        value={timeframe}
        exclusive
        onChange={handleTimeframeChange}
        size="small"
        fullWidth
        sx={{ mb: 2 }}
      >
        <ToggleButton value="daily">Daily</ToggleButton>
        <ToggleButton value="weekly">Weekly</ToggleButton>
        <ToggleButton value="alltime">All Time</ToggleButton>
      </ToggleButtonGroup>

      <List>
        {leaderboardData.map((entry) => (
          <ListItem
            key={entry.userId}
            sx={{
              bgcolor: entry.userId === currentUserId ? 'action.selected' : 'transparent',
              borderRadius: 2,
              mb: 1,
            }}
          >
            <ListItemAvatar>
              <RankBadge
                badgeContent={entry.rank}
                rank={entry.rank}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
                }}
              >
                <Avatar src={entry.avatar} alt={entry.name} />
              </RankBadge>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    {entry.name}
                  </Typography>
                  {getRankIcon(entry.rank) && (
                    <Typography variant="body2">{getRankIcon(entry.rank)}</Typography>
                  )}
                  {entry.userId === currentUserId && (
                    <Chip label="You" size="small" color="primary" />
                  )}
                </Box>
              }
              secondary={
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="caption" color="text.secondary">
                    Level {entry.level} • @{entry.username}
                  </Typography>
                </Box>
              }
            />
            <Box display="flex" alignItems="center" gap={1}>
              <Box display="flex" alignItems="center">
                {getChangeIcon(entry.change)}
                {entry.change !== 0 && (
                  <Typography variant="caption" color="text.secondary">
                    {Math.abs(entry.change)}
                  </Typography>
                )}
              </Box>
              <Typography variant="subtitle1" fontWeight="bold">
                {entry.points.toLocaleString()}
              </Typography>
            </Box>
          </ListItem>
        ))}
      </List>

      {/* Your Position Summary */}
      <Box
        sx={{
          mt: 2,
          p: 2,
          bgcolor: 'primary.main',
          color: 'white',
          borderRadius: 2,
        }}
      >
        <Typography variant="subtitle2" gutterBottom>
          Your Position
        </Typography>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h5" fontWeight="bold">
              #4
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              {leaderboardData[0].points - leaderboardData[3].points} points to #1
            </Typography>
          </Box>
          <Box textAlign="right">
            <Typography variant="body2">
              Top {Math.round((4 / 100) * 100)}%
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              of all users
            </Typography>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default LeaderboardWidget;