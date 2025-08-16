import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Chip,
  LinearProgress,
  Avatar,
  Badge,
  Tooltip,
  Fab,
  Zoom,
  Alert,
  Snackbar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Paper,
  Tab,
  Tabs,
} from '@mui/material';
import {
  Close,
  EmojiEvents,
  CheckCircle,
  Star,
  Celebration,
  AutoAwesome,
  LocalFireDepartment,
  Share,
  Refresh,
  Timer,
  Person,
  Groups,
  TrendingUp,
  CardGiftcard,
  Help,
  Info,
} from '@mui/icons-material';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

interface BingoChallenge {
  id: string;
  title: string;
  description: string;
  category: 'social' | 'activity' | 'personality' | 'interest' | 'achievement';
  points: number;
  completed: boolean;
  completedBy?: string;
  completedAt?: Date;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface BingoReward {
  id: string;
  name: string;
  description: string;
  pointsRequired: number;
  claimed: boolean;
  icon: string;
}

interface LeaderboardEntry {
  userId: string;
  name: string;
  avatar: string;
  score: number;
  completedChallenges: number;
  bingos: number;
}

interface BingoBoardProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  friendId?: string;
  friendName?: string;
}

const StyledDialog = styled(Dialog)`
  .MuiDialog-paper {
    border-radius: 16px;
    max-width: 1000px;
    width: 100%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }
`;

const BingoCell = styled(motion.div)<{ completed: boolean; category: string }>`
  aspect-ratio: 1;
  background: ${props => props.completed 
    ? 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)'
    : 'rgba(255, 255, 255, 0.95)'};
  border-radius: 12px;
  padding: 12px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  }

  .category-badge {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: ${props => {
      switch(props.category) {
        case 'social': return '#2196F3';
        case 'activity': return '#FF9800';
        case 'personality': return '#9C27B0';
        case 'interest': return '#F44336';
        case 'achievement': return '#FFD700';
        default: return '#757575';
      }
    }};
  }
`;

const RewardCard = styled(Card)<{ claimed: boolean }>`
  background: ${props => props.claimed 
    ? 'linear-gradient(135deg, #FFD700 0%, #FFA000 100%)'
    : 'white'};
  opacity: ${props => props.claimed ? 0.7 : 1};
  transition: all 0.3s ease;
  cursor: ${props => props.claimed ? 'default' : 'pointer'};

  &:hover {
    transform: ${props => props.claimed ? 'none' : 'scale(1.05)'};
  }
`;

const TabPanel = styled(Box)`
  padding: 24px 0;
`;

const BingoBoard: React.FC<BingoBoardProps> = ({
  open,
  onClose,
  userId,
  friendId,
  friendName = 'Friend',
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [challenges, setChallenges] = useState<BingoChallenge[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<BingoChallenge | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [bingoCount, setBingoCount] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Mock data - replace with API calls
  const mockChallenges: BingoChallenge[] = [
    // Row 1
    { id: '1', title: 'Find Common Hobby', description: 'Discover a hobby you both enjoy', category: 'interest', points: 10, completed: false, difficulty: 'easy' },
    { id: '2', title: 'Share a Meal', description: 'Have lunch or dinner together', category: 'social', points: 15, completed: true, completedBy: 'You', difficulty: 'easy' },
    { id: '3', title: 'Exchange Book Recommendations', description: 'Share your favorite books', category: 'interest', points: 10, completed: false, difficulty: 'easy' },
    { id: '4', title: 'Attend Event Together', description: 'Go to a community event', category: 'activity', points: 20, completed: false, difficulty: 'medium' },
    { id: '5', title: 'Morning Walk', description: 'Take a morning walk together', category: 'activity', points: 15, completed: true, completedBy: friendName, difficulty: 'easy' },
    
    // Row 2
    { id: '6', title: 'Learn New Skill', description: 'Learn something new together', category: 'achievement', points: 25, completed: false, difficulty: 'hard' },
    { id: '7', title: 'Share Family Story', description: 'Tell a story about your family', category: 'personality', points: 10, completed: true, completedBy: 'You', difficulty: 'easy' },
    { id: '8', title: 'Cook Together', description: 'Prepare a meal together', category: 'activity', points: 20, completed: false, difficulty: 'medium' },
    { id: '9', title: 'Discover Music Taste', description: 'Share favorite songs/artists', category: 'interest', points: 10, completed: true, completedBy: friendName, difficulty: 'easy' },
    { id: '10', title: 'Volunteer Together', description: 'Do community service', category: 'achievement', points: 30, completed: false, difficulty: 'hard' },
    
    // Row 3
    { id: '11', title: 'Play Sport', description: 'Play any sport together', category: 'activity', points: 15, completed: false, difficulty: 'medium' },
    { id: '12', title: 'Share Childhood Memory', description: 'Exchange childhood stories', category: 'personality', points: 10, completed: true, completedBy: 'You', difficulty: 'easy' },
    { id: '13', title: 'FREE SPACE', description: 'Automatic completion!', category: 'social', points: 5, completed: true, completedBy: 'System', difficulty: 'easy' },
    { id: '14', title: 'Movie Night', description: 'Watch a movie together', category: 'social', points: 15, completed: false, difficulty: 'easy' },
    { id: '15', title: 'Share Travel Experience', description: 'Discuss travel stories', category: 'personality', points: 10, completed: false, difficulty: 'easy' },
    
    // Row 4
    { id: '16', title: 'Play Board Game', description: 'Enjoy a board game session', category: 'activity', points: 15, completed: true, completedBy: friendName, difficulty: 'easy' },
    { id: '17', title: 'Discuss Goals', description: 'Share personal goals', category: 'personality', points: 15, completed: false, difficulty: 'medium' },
    { id: '18', title: 'Coffee Chat', description: 'Have coffee together', category: 'social', points: 10, completed: true, completedBy: 'You', difficulty: 'easy' },
    { id: '19', title: 'Share Recipe', description: 'Exchange favorite recipes', category: 'interest', points: 10, completed: false, difficulty: 'easy' },
    { id: '20', title: 'Photo Adventure', description: 'Take photos together', category: 'activity', points: 20, completed: false, difficulty: 'medium' },
    
    // Row 5
    { id: '21', title: 'Study Session', description: 'Study or work together', category: 'achievement', points: 20, completed: false, difficulty: 'medium' },
    { id: '22', title: 'Share Playlist', description: 'Create shared music playlist', category: 'interest', points: 10, completed: true, completedBy: 'Both', difficulty: 'easy' },
    { id: '23', title: 'Discuss Dreams', description: 'Share aspirations', category: 'personality', points: 15, completed: false, difficulty: 'medium' },
    { id: '24', title: 'Group Activity', description: 'Join group with others', category: 'social', points: 25, completed: false, difficulty: 'hard' },
    { id: '25', title: 'Complete Challenge', description: 'Finish a challenge together', category: 'achievement', points: 30, completed: false, difficulty: 'hard' },
  ];

  const mockRewards: BingoReward[] = [
    { id: '1', name: 'Friendship Badge', description: 'Complete 5 challenges', pointsRequired: 50, claimed: true, icon: '🏅' },
    { id: '2', name: 'Social Butterfly', description: 'Complete all social challenges', pointsRequired: 75, claimed: false, icon: '🦋' },
    { id: '3', name: 'Adventure Seeker', description: 'Complete all activity challenges', pointsRequired: 100, claimed: false, icon: '🗺️' },
    { id: '4', name: 'Deep Connection', description: 'Complete all personality challenges', pointsRequired: 80, claimed: false, icon: '💝' },
    { id: '5', name: 'Bingo Master', description: 'Get 3 bingos', pointsRequired: 150, claimed: false, icon: '👑' },
    { id: '6', name: 'Ultimate Friend', description: 'Complete entire board', pointsRequired: 300, claimed: false, icon: '🏆' },
  ];

  const mockLeaderboard: LeaderboardEntry[] = [
    { userId: '1', name: 'Sarah Ahmad', avatar: '/avatars/1.jpg', score: 245, completedChallenges: 18, bingos: 3 },
    { userId: '2', name: 'Omar Hassan', avatar: '/avatars/2.jpg', score: 210, completedChallenges: 15, bingos: 2 },
    { userId: '3', name: 'Fatima Ali', avatar: '/avatars/3.jpg', score: 185, completedChallenges: 14, bingos: 2 },
    { userId: userId, name: 'You', avatar: '/avatars/user.jpg', score: 165, completedChallenges: 12, bingos: 1 },
    { userId: '4', name: 'Ibrahim Khan', avatar: '/avatars/4.jpg', score: 150, completedChallenges: 11, bingos: 1 },
  ];

  useEffect(() => {
    setChallenges(mockChallenges);
    calculateStats(mockChallenges);
  }, []);

  const calculateStats = (challengeList: BingoChallenge[]) => {
    const completed = challengeList.filter(c => c.completed);
    const points = completed.reduce((sum, c) => sum + c.points, 0);
    setTotalPoints(points);
    
    // Check for bingos (rows, columns, diagonals)
    const bingos = checkForBingos(challengeList);
    setBingoCount(bingos);
  };

  const checkForBingos = (challengeList: BingoChallenge[]): number => {
    let bingoCount = 0;
    const grid = challengeList.map(c => c.completed);
    
    // Check rows
    for (let i = 0; i < 5; i++) {
      if (grid.slice(i * 5, (i + 1) * 5).every(cell => cell)) {
        bingoCount++;
      }
    }
    
    // Check columns
    for (let i = 0; i < 5; i++) {
      const column = [0, 1, 2, 3, 4].map(row => grid[row * 5 + i]);
      if (column.every(cell => cell)) {
        bingoCount++;
      }
    }
    
    // Check diagonals
    const diagonal1 = [0, 6, 12, 18, 24].map(i => grid[i]);
    const diagonal2 = [4, 8, 12, 16, 20].map(i => grid[i]);
    
    if (diagonal1.every(cell => cell)) bingoCount++;
    if (diagonal2.every(cell => cell)) bingoCount++;
    
    return bingoCount;
  };

  const handleChallengeClick = (challenge: BingoChallenge) => {
    if (!challenge.completed && challenge.id !== '13') { // Don't allow clicking FREE SPACE
      setSelectedChallenge(challenge);
    }
  };

  const handleCompleteChallenge = () => {
    if (!selectedChallenge) return;
    
    const updatedChallenges = challenges.map(c => 
      c.id === selectedChallenge.id 
        ? { ...c, completed: true, completedBy: 'You', completedAt: new Date() }
        : c
    );
    
    setChallenges(updatedChallenges);
    calculateStats(updatedChallenges);
    
    // Check if this completion creates a bingo
    const newBingos = checkForBingos(updatedChallenges);
    if (newBingos > bingoCount) {
      triggerCelebration();
      setSnackbarMessage(`🎉 BINGO! You got ${newBingos} bingo${newBingos > 1 ? 's' : ''}!`);
    } else {
      setSnackbarMessage(`✅ Challenge completed! +${selectedChallenge.points} points`);
    }
    
    setShowSnackbar(true);
    setSelectedChallenge(null);
  };

  const triggerCelebration = () => {
    setShowCelebration(true);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    setTimeout(() => setShowCelebration(false), 3000);
  };

  const handleClaimReward = (reward: BingoReward) => {
    if (!reward.claimed && totalPoints >= reward.pointsRequired) {
      setSnackbarMessage(`🎁 Reward claimed: ${reward.name}!`);
      setShowSnackbar(true);
      triggerCelebration();
    }
  };

  const getCategoryIcon = (category: string) => {
    switch(category) {
      case 'social': return <Groups sx={{ fontSize: 16 }} />;
      case 'activity': return <LocalFireDepartment sx={{ fontSize: 16 }} />;
      case 'personality': return <Person sx={{ fontSize: 16 }} />;
      case 'interest': return <Star sx={{ fontSize: 16 }} />;
      case 'achievement': return <EmojiEvents sx={{ fontSize: 16 }} />;
      default: return null;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch(difficulty) {
      case 'easy': return '#4CAF50';
      case 'medium': return '#FF9800';
      case 'hard': return '#F44336';
      default: return '#757575';
    }
  };

  return (
    <StyledDialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ background: 'white', borderRadius: '16px 16px 0 0' }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={2}>
            <EmojiEvents sx={{ color: '#FFD700', fontSize: 32 }} />
            <Box>
              <Typography variant="h5" fontWeight="bold">
                Friend Bingo with {friendName}
              </Typography>
              <Box display="flex" alignItems="center" gap={2}>
                <Chip
                  icon={<Star />}
                  label={`${totalPoints} Points`}
                  color="primary"
                  size="small"
                />
                <Chip
                  icon={<EmojiEvents />}
                  label={`${bingoCount} Bingo${bingoCount !== 1 ? 's' : ''}`}
                  color="secondary"
                  size="small"
                />
                <Chip
                  icon={<LocalFireDepartment />}
                  label={`${streak} Day Streak`}
                  color="error"
                  size="small"
                />
              </Box>
            </Box>
          </Box>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ background: 'white', p: 3 }}>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 2 }}>
          <Tab label="Bingo Board" icon={<AutoAwesome />} />
          <Tab label="Rewards" icon={<CardGiftcard />} />
          <Tab label="Leaderboard" icon={<TrendingUp />} />
          <Tab label="How to Play" icon={<Help />} />
        </Tabs>

        <TabPanel hidden={activeTab !== 0}>
          <Grid container spacing={1}>
            {challenges.map((challenge, index) => (
              <Grid item xs={2.4} key={challenge.id}>
                <BingoCell
                  completed={challenge.completed}
                  category={challenge.category}
                  onClick={() => handleChallengeClick(challenge)}
                  whileHover={{ scale: challenge.completed ? 1 : 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {challenge.completed && (
                    <CheckCircle 
                      sx={{ 
                        position: 'absolute',
                        top: 8,
                        left: 8,
                        color: 'white',
                        fontSize: 20
                      }} 
                    />
                  )}
                  <div className="category-badge">
                    {getCategoryIcon(challenge.category)}
                  </div>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      fontWeight: 'bold',
                      fontSize: '0.7rem',
                      color: challenge.completed ? 'white' : 'text.primary',
                      mb: 0.5
                    }}
                  >
                    {challenge.title}
                  </Typography>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        fontSize: '0.6rem',
                        color: challenge.completed ? 'white' : getDifficultyColor(challenge.difficulty)
                      }}
                    >
                      {challenge.points} pts
                    </Typography>
                  </Box>
                  {challenge.completed && (
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        fontSize: '0.55rem',
                        color: 'rgba(255,255,255,0.8)',
                        position: 'absolute',
                        bottom: 4
                      }}
                    >
                      by {challenge.completedBy}
                    </Typography>
                  )}
                </BingoCell>
              </Grid>
            ))}
          </Grid>

          <Box mt={3} display="flex" justifyContent="center" gap={2}>
            <Button
              variant="contained"
              startIcon={<Refresh />}
              onClick={() => {
                setChallenges(mockChallenges.map(c => ({ ...c, completed: c.id === '13' })));
                calculateStats(mockChallenges);
              }}
            >
              Reset Board
            </Button>
            <Button
              variant="outlined"
              startIcon={<Share />}
            >
              Share Progress
            </Button>
          </Box>
        </TabPanel>

        <TabPanel hidden={activeTab !== 1}>
          <Grid container spacing={2}>
            {mockRewards.map((reward) => (
              <Grid item xs={12} sm={6} md={4} key={reward.id}>
                <RewardCard 
                  claimed={reward.claimed}
                  onClick={() => handleClaimReward(reward)}
                >
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Typography variant="h2">{reward.icon}</Typography>
                      <Box flex={1}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {reward.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {reward.description}
                        </Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={Math.min(100, (totalPoints / reward.pointsRequired) * 100)}
                          sx={{ mt: 1 }}
                        />
                        <Typography variant="caption">
                          {Math.min(totalPoints, reward.pointsRequired)} / {reward.pointsRequired} points
                        </Typography>
                      </Box>
                    </Box>
                    {reward.claimed && (
                      <Chip 
                        label="Claimed" 
                        size="small" 
                        color="success" 
                        sx={{ position: 'absolute', top: 8, right: 8 }}
                      />
                    )}
                  </CardContent>
                </RewardCard>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        <TabPanel hidden={activeTab !== 2}>
          <List>
            {mockLeaderboard.map((entry, index) => (
              <React.Fragment key={entry.userId}>
                <ListItem>
                  <ListItemAvatar>
                    <Badge
                      badgeContent={index + 1}
                      color={index === 0 ? 'error' : index === 1 ? 'primary' : index === 2 ? 'secondary' : 'default'}
                    >
                      <Avatar src={entry.avatar} alt={entry.name} />
                    </Badge>
                  </ListItemAvatar>
                  <ListItemText
                    primary={entry.name}
                    secondary={`${entry.completedChallenges} challenges • ${entry.bingos} bingos`}
                  />
                  <Box textAlign="right">
                    <Typography variant="h6" color="primary">
                      {entry.score}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      points
                    </Typography>
                  </Box>
                </ListItem>
                {index < mockLeaderboard.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </TabPanel>

        <TabPanel hidden={activeTab !== 3}>
          <Paper sx={{ p: 3, background: 'linear-gradient(135deg, #667eea10 0%, #764ba210 100%)' }}>
            <Typography variant="h6" gutterBottom>
              How to Play Friend Bingo
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="1. Complete Challenges"
                  secondary="Click on any uncompleted challenge to mark it as done when you complete it with your friend."
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="2. Get Bingos"
                  secondary="Complete 5 challenges in a row (horizontal, vertical, or diagonal) to get a bingo!"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="3. Earn Points"
                  secondary="Each challenge has different point values based on difficulty. Earn points to unlock rewards."
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="4. Claim Rewards"
                  secondary="Use your points to claim special badges and achievements in the Rewards tab."
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="5. Compete on Leaderboard"
                  secondary="See how you rank against other friends playing Friend Bingo."
                />
              </ListItem>
            </List>
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="caption">
                Tip: The more challenging activities give more points but take more effort. Mix easy and hard challenges for the best experience!
              </Typography>
            </Alert>
          </Paper>
        </TabPanel>
      </DialogContent>

      {/* Challenge Details Dialog */}
      <Dialog
        open={!!selectedChallenge}
        onClose={() => setSelectedChallenge(null)}
        maxWidth="sm"
        fullWidth
      >
        {selectedChallenge && (
          <>
            <DialogTitle>
              <Box display="flex" alignItems="center" gap={1}>
                {getCategoryIcon(selectedChallenge.category)}
                {selectedChallenge.title}
              </Box>
            </DialogTitle>
            <DialogContent>
              <Typography paragraph>{selectedChallenge.description}</Typography>
              <Box display="flex" gap={1} mb={2}>
                <Chip
                  label={`${selectedChallenge.points} points`}
                  color="primary"
                  size="small"
                />
                <Chip
                  label={selectedChallenge.difficulty}
                  size="small"
                  style={{ backgroundColor: getDifficultyColor(selectedChallenge.difficulty), color: 'white' }}
                />
                <Chip
                  label={selectedChallenge.category}
                  size="small"
                />
              </Box>
              <Alert severity="info">
                Mark this challenge as complete when you've done it with {friendName}!
              </Alert>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedChallenge(null)}>Cancel</Button>
              <Button
                variant="contained"
                onClick={handleCompleteChallenge}
                startIcon={<CheckCircle />}
              >
                Mark as Complete
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Celebration Animation */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 9999,
            }}
          >
            <Celebration sx={{ fontSize: 120, color: '#FFD700' }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Snackbar for notifications */}
      <Snackbar
        open={showSnackbar}
        autoHideDuration={3000}
        onClose={() => setShowSnackbar(false)}
        message={snackbarMessage}
      />
    </StyledDialog>
  );
};

export default BingoBoard;