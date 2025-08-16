import React, { useState, Suspense } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Tabs, 
  Tab, 
  Card, 
  CardContent, 
  Button, 
  Grid,
  Paper,
  Avatar,
  Chip,
  CircularProgress
} from '@mui/material';
import {
  Group as FaUserFriends,
  Home as FaHome,
  School as FaChalkboardTeacher,
  Groups as FaUsers,
  Search as FaSearch,
  FilterList as FaFilter,
  EmojiEvents as FaTrophy,
  Hub as FaNetworkWired,
  SportsEsports as FaGamepad,
  AddCircle as FaPlusCircle,
  Close as FaTimes,
  Check as FaCheck,
  Star as FaStar,
  LocationOn as FaMapMarkerAlt,
  Language as FaLanguage,
  Schedule as FaClock,
} from '@mui/icons-material';
import styled from 'styled-components';
import { motion } from 'framer-motion';

// Styled Components
const StyledContainer = styled(Container)`
  padding: 20px;
  min-height: 100vh;
  background: #F9F3E3;
`;

const HeaderCard = styled(Card)`
  margin-bottom: 24px;
  background: linear-gradient(135deg, #2fce98 0%, #4A8B7C 100%);
  color: white;
`;

const ConnectionCard = styled(Card)`
  margin-bottom: 16px;
  cursor: pointer;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
  }
`;

const ModeButton = styled(Button)<{ active?: boolean }>`
  margin: 8px;
  background: ${props => props.active ? '#2fce98' : 'white'};
  color: ${props => props.active ? 'white' : '#2fce98'};
  border: 2px solid #2fce98;
  
  &:hover {
    background: ${props => props.active ? '#1e4039' : '#f5f5f5'};
  }
`;

// Mock Data
const connectionModes = [
  { id: 'guides', label: 'Local Guides', icon: FaMapMarkerAlt, description: 'Find local guides and city experts' },
  { id: 'homesurf', label: 'HomeSurf', icon: FaHome, description: 'Connect with homestay hosts' },
  { id: 'mentor', label: 'Mentors', icon: FaChalkboardTeacher, description: 'Find industry mentors' },
  { id: 'buddy', label: 'Study Buddy', icon: FaUserFriends, description: 'Connect with student buddies' },
];

const mockConnections = [
  {
    id: '1',
    name: 'Ahmad Rahman',
    location: 'Kuala Lumpur',
    match: 85,
    tags: ['Student', 'Tech', 'Travel'],
    bio: 'Computer Science student looking for travel companions and study groups'
  },
  {
    id: '2',
    name: 'Siti Nurhaliza',
    location: 'Selangor',
    match: 78,
    tags: ['Mentor', 'Business', 'Finance'],
    bio: 'Business mentor helping young entrepreneurs navigate startup challenges'
  },
  {
    id: '3',
    name: 'Omar Hassan',
    location: 'Penang',
    match: 92,
    tags: ['Local Guide', 'Food', 'Culture'],
    bio: 'Passionate local guide specializing in authentic Penang food tours'
  }
];

// Main Component
const BerseMatch: React.FC = () => {
  const [activeMode, setActiveMode] = useState('guides');
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const renderDiscoverTab = () => (
    <Box sx={{ py: 3 }}>
      {/* Connection Modes */}
      <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
        🎯 Choose Your Connection Mode
      </Typography>
      
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {connectionModes.map((mode) => {
          const IconComponent = mode.icon;
          return (
            <Grid item xs={6} sm={3} key={mode.id}>
              <ModeButton
                fullWidth
                active={activeMode === mode.id}
                onClick={() => setActiveMode(mode.id)}
                startIcon={<IconComponent />}
              >
                {mode.label}
              </ModeButton>
            </Grid>
          );
        })}
      </Grid>

      {/* Active Mode Description */}
      <Paper sx={{ p: 2, mb: 3, bgcolor: '#e3f2fd' }}>
        <Typography variant="body1">
          {connectionModes.find(mode => mode.id === activeMode)?.description}
        </Typography>
      </Paper>

      {/* Connections List */}
      <Typography variant="h6" gutterBottom>
        🤝 Recommended Connections
      </Typography>
      
      {mockConnections.map((connection) => (
        <motion.div
          key={connection.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <ConnectionCard>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Avatar sx={{ width: 56, height: 56, bgcolor: '#2fce98' }}>
                  {connection.name[0]}
                </Avatar>
                <Box flex={1}>
                  <Typography variant="h6" fontWeight="bold">
                    {connection.name}
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <FaMapMarkerAlt fontSize="small" />
                    <Typography variant="body2" color="text.secondary">
                      {connection.location}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="body2" fontWeight="bold" color="primary">
                      {connection.match}% Match
                    </Typography>
                    <Box display="flex" gap={0.5}>
                      {[1,2,3,4,5].map(i => (
                        <FaStar 
                          key={i} 
                          fontSize="small" 
                          style={{ color: i <= Math.floor(connection.match/20) ? '#ffd700' : '#e0e0e0' }}
                        />
                      ))}
                    </Box>
                  </Box>
                </Box>
              </Box>
              
              <Typography variant="body2" paragraph>
                {connection.bio}
              </Typography>
              
              <Box display="flex" gap={1} mb={2} flexWrap="wrap">
                {connection.tags.map((tag) => (
                  <Chip key={tag} label={tag} size="small" color="primary" variant="outlined" />
                ))}
              </Box>
              
              <Box display="flex" gap={2}>
                <Button 
                  variant="outlined" 
                  startIcon={<FaUserFriends />}
                  size="small"
                >
                  Connect
                </Button>
                <Button 
                  variant="contained" 
                  startIcon={<FaPlusCircle />}
                  size="small"
                >
                  Introduce
                </Button>
              </Box>
            </CardContent>
          </ConnectionCard>
        </motion.div>
      ))}
    </Box>
  );

  const renderConnectorTab = () => (
    <Box sx={{ py: 3, textAlign: 'center' }}>
      <FaNetworkWired style={{ fontSize: '64px', color: '#2fce98', marginBottom: '16px' }} />
      <Typography variant="h5" gutterBottom>
        🎮 Networking Games
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Interactive networking challenges and bingo games coming soon!
      </Typography>
      <Button variant="contained" startIcon={<FaGamepad />} size="large">
        Start Networking Challenge
      </Button>
    </Box>
  );

  const renderMyWebTab = () => (
    <Box sx={{ py: 3, textAlign: 'center' }}>
      <FaUsers style={{ fontSize: '64px', color: '#2fce98', marginBottom: '16px' }} />
      <Typography variant="h5" gutterBottom>
        🕸️ Your Network
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Visualize and manage your connections network.
      </Typography>
      <Button variant="contained" startIcon={<FaNetworkWired />} size="large">
        View Network Map
      </Button>
    </Box>
  );

  return (
    <StyledContainer maxWidth="md">
      {/* Header */}
      <HeaderCard>
        <CardContent sx={{ textAlign: 'center', py: 3 }}>
          <Typography variant="h4" gutterBottom fontWeight="bold">
            🤝 BerseMatch
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9 }}>
            Connect • Network • Grow Together
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8, mt: 1 }}>
            Build meaningful connections in the Malaysian Muslim community
          </Typography>
        </CardContent>
      </HeaderCard>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h5" fontWeight="bold" color="primary">
              127
            </Typography>
            <Typography variant="caption">Connections</Typography>
          </Paper>
        </Grid>
        <Grid item xs={4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h5" fontWeight="bold" color="success.main">
              1,250
            </Typography>
            <Typography variant="caption">Points</Typography>
          </Paper>
        </Grid>
        <Grid item xs={4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h5" fontWeight="bold" color="warning.main">
              Level 3
            </Typography>
            <Typography variant="caption">Networker</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Navigation Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          variant="fullWidth"
          indicatorColor="primary"
        >
          <Tab label="🔍 DISCOVER" />
          <Tab label="🎮 CONNECTOR" />
          <Tab label="🕸️ MY WEB" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <Suspense fallback={<CircularProgress />}>
        {activeTab === 0 && renderDiscoverTab()}
        {activeTab === 1 && renderConnectorTab()}
        {activeTab === 2 && renderMyWebTab()}
      </Suspense>
    </StyledContainer>
  );
};

export default BerseMatch;