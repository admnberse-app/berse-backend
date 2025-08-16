import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Avatar,
  Chip,
  Box,
  Typography,
  IconButton,
  Card,
  CardContent,
  LinearProgress,
  Alert,
  Autocomplete,
  ToggleButton,
  ToggleButtonGroup,
  Stepper,
  Step,
  StepLabel,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Fab,
  Tooltip,
} from '@mui/material';
import {
  Close,
  Add,
  Remove,
  Group,
  LocationOn,
  Event,
  Category,
  Share,
  CheckCircle,
  Diversity3,
  EmojiEvents,
  AutoAwesome,
  PersonAdd,
  Settings,
  Shuffle,
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

interface Friend {
  id: string;
  name: string;
  avatar: string;
  interests: string[];
  availability: 'available' | 'busy' | 'maybe';
  matchScore: number;
}

interface Squad {
  id?: string;
  name: string;
  description: string;
  members: Friend[];
  activity: string;
  location?: string;
  dateTime?: Date;
  maxMembers: number;
  tags: string[];
  isPrivate: boolean;
  requiresApproval: boolean;
  minMatchScore?: number;
}

interface SquadBuilderProps {
  open: boolean;
  onClose: () => void;
  onCreateSquad: (squad: Squad) => void;
  currentUser: { id: string; name: string; avatar: string };
  friends: Friend[];
}

const StyledDialog = styled(Dialog)`
  .MuiDialog-paper {
    border-radius: 16px;
    max-width: 900px;
    width: 100%;
  }
`;

const SquadCard = styled(Card)`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  margin-bottom: 16px;
  border-radius: 12px;
`;

const MemberCard = styled(motion.div)`
  background: white;
  border-radius: 12px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &.selected {
    border: 2px solid #667eea;
    background: linear-gradient(135deg, #667eea10 0%, #764ba210 100%);
  }
`;

const ActivityChip = styled(Chip)`
  margin: 4px;
  cursor: pointer;
  
  &:hover {
    transform: scale(1.05);
  }
`;

const SquadBuilder: React.FC<SquadBuilderProps> = ({
  open,
  onClose,
  onCreateSquad,
  currentUser,
  friends = [],
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [squad, setSquad] = useState<Squad>({
    name: '',
    description: '',
    members: [],
    activity: '',
    location: '',
    dateTime: new Date(),
    maxMembers: 5,
    tags: [],
    isPrivate: false,
    requiresApproval: false,
    minMatchScore: 60,
  });

  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [filterAvailability, setFilterAvailability] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [autoMatch, setAutoMatch] = useState(false);
  const [squadTemplate, setSquadTemplate] = useState<string>('');

  const steps = ['Squad Details', 'Select Members', 'Activity & Location', 'Review & Create'];

  const squadTemplates = [
    { id: 'sports', name: 'Sports Squad', activity: 'Sports', maxMembers: 10, tags: ['active', 'outdoor'] },
    { id: 'study', name: 'Study Group', activity: 'Study Session', maxMembers: 6, tags: ['education', 'focus'] },
    { id: 'social', name: 'Social Hangout', activity: 'Casual Meetup', maxMembers: 8, tags: ['social', 'fun'] },
    { id: 'gaming', name: 'Gaming Team', activity: 'Gaming', maxMembers: 5, tags: ['gaming', 'competitive'] },
    { id: 'dining', name: 'Foodie Squad', activity: 'Dining Out', maxMembers: 6, tags: ['food', 'social'] },
  ];

  const popularActivities = [
    'Coffee Meetup',
    'Sports Game',
    'Study Session',
    'Movie Night',
    'Board Games',
    'Hiking',
    'Beach Day',
    'Dinner Party',
    'Book Club',
    'Art Workshop',
    'Volunteer Work',
    'Gaming Session',
  ];

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      handleCreateSquad();
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleFriendToggle = (friendId: string) => {
    setSelectedFriends((prev) =>
      prev.includes(friendId)
        ? prev.filter((id) => id !== friendId)
        : [...prev, friendId]
    );
  };

  const handleAutoMatch = () => {
    if (!autoMatch) {
      // Find best matching friends based on activity and availability
      const matchedFriends = friends
        .filter((f) => f.availability === 'available' && f.matchScore >= (squad.minMatchScore || 60))
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, squad.maxMembers - 1)
        .map((f) => f.id);
      
      setSelectedFriends(matchedFriends);
      setAutoMatch(true);
    } else {
      setSelectedFriends([]);
      setAutoMatch(false);
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = squadTemplates.find((t) => t.id === templateId);
    if (template) {
      setSquad((prev) => ({
        ...prev,
        name: template.name,
        activity: template.activity,
        maxMembers: template.maxMembers,
        tags: template.tags,
      }));
      setSquadTemplate(templateId);
    }
  };

  const handleCreateSquad = () => {
    const selectedMembers = friends.filter((f) => selectedFriends.includes(f.id));
    const finalSquad: Squad = {
      ...squad,
      members: [{ ...currentUser, interests: [], availability: 'available', matchScore: 100 }, ...selectedMembers],
    };
    onCreateSquad(finalSquad);
    onClose();
  };

  const getFilteredFriends = () => {
    return friends.filter((friend) => {
      const matchesSearch = friend.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesAvailability =
        filterAvailability === 'all' || friend.availability === filterAvailability;
      return matchesSearch && matchesAvailability;
    });
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Choose a Squad Template (Optional)
            </Typography>
            <Grid container spacing={2} mb={3}>
              {squadTemplates.map((template) => (
                <Grid item xs={6} sm={4} key={template.id}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      border: squadTemplate === template.id ? '2px solid #667eea' : 'none',
                      '&:hover': { boxShadow: 3 },
                    }}
                    onClick={() => handleTemplateSelect(template.id)}
                  >
                    <CardContent>
                      <Typography variant="subtitle1">{template.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {template.activity}
                      </Typography>
                      <Box mt={1}>
                        {template.tags.map((tag) => (
                          <Chip key={tag} label={tag} size="small" sx={{ mr: 0.5 }} />
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            <TextField
              fullWidth
              label="Squad Name"
              value={squad.name}
              onChange={(e) => setSquad({ ...squad, name: e.target.value })}
              margin="normal"
              required
              variant="outlined"
            />
            <TextField
              fullWidth
              label="Description"
              value={squad.description}
              onChange={(e) => setSquad({ ...squad, description: e.target.value })}
              margin="normal"
              multiline
              rows={3}
              variant="outlined"
            />
            <Grid container spacing={2} mt={1}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Max Members"
                  value={squad.maxMembers}
                  onChange={(e) => setSquad({ ...squad, maxMembers: parseInt(e.target.value) })}
                  InputProps={{ inputProps: { min: 2, max: 20 } }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Min Match Score"
                  value={squad.minMatchScore}
                  onChange={(e) => setSquad({ ...squad, minMatchScore: parseInt(e.target.value) })}
                  InputProps={{ inputProps: { min: 0, max: 100 } }}
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                Select Squad Members ({selectedFriends.length}/{squad.maxMembers - 1})
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AutoAwesome />}
                onClick={handleAutoMatch}
                color={autoMatch ? 'secondary' : 'primary'}
              >
                {autoMatch ? 'Clear Auto-Match' : 'Auto-Match Friends'}
              </Button>
            </Box>

            <Box display="flex" gap={2} mb={2}>
              <TextField
                fullWidth
                placeholder="Search friends..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                size="small"
              />
              <ToggleButtonGroup
                value={filterAvailability}
                exclusive
                onChange={(e, value) => setFilterAvailability(value || 'all')}
                size="small"
              >
                <ToggleButton value="all">All</ToggleButton>
                <ToggleButton value="available">Available</ToggleButton>
                <ToggleButton value="maybe">Maybe</ToggleButton>
              </ToggleButtonGroup>
            </Box>

            <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
              <Grid container spacing={2}>
                {getFilteredFriends().map((friend) => (
                  <Grid item xs={12} sm={6} key={friend.id}>
                    <MemberCard
                      className={selectedFriends.includes(friend.id) ? 'selected' : ''}
                      onClick={() => handleFriendToggle(friend.id)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Avatar src={friend.avatar} alt={friend.name} />
                      <Box flex={1}>
                        <Typography variant="subtitle2">{friend.name}</Typography>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Chip
                            label={friend.availability}
                            size="small"
                            color={
                              friend.availability === 'available'
                                ? 'success'
                                : friend.availability === 'maybe'
                                ? 'warning'
                                : 'default'
                            }
                          />
                          <Typography variant="caption" color="text.secondary">
                            Match: {friend.matchScore}%
                          </Typography>
                        </Box>
                      </Box>
                      <IconButton size="small">
                        {selectedFriends.includes(friend.id) ? (
                          <CheckCircle color="primary" />
                        ) : (
                          <Add />
                        )}
                      </IconButton>
                    </MemberCard>
                  </Grid>
                ))}
              </Grid>
            </Box>

            {selectedFriends.length >= squad.maxMembers - 1 && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Squad is full! Maximum {squad.maxMembers} members allowed.
              </Alert>
            )}
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Activity & Location
            </Typography>

            <Typography variant="subtitle2" gutterBottom>
              Popular Activities
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1} mb={3}>
              {popularActivities.map((activity) => (
                <ActivityChip
                  key={activity}
                  label={activity}
                  onClick={() => setSquad({ ...squad, activity })}
                  color={squad.activity === activity ? 'primary' : 'default'}
                  variant={squad.activity === activity ? 'filled' : 'outlined'}
                />
              ))}
            </Box>

            <TextField
              fullWidth
              label="Activity"
              value={squad.activity}
              onChange={(e) => setSquad({ ...squad, activity: e.target.value })}
              margin="normal"
              required
              InputProps={{
                startAdornment: <Category sx={{ mr: 1, color: 'action.active' }} />,
              }}
            />

            <TextField
              fullWidth
              label="Location"
              value={squad.location}
              onChange={(e) => setSquad({ ...squad, location: e.target.value })}
              margin="normal"
              InputProps={{
                startAdornment: <LocationOn sx={{ mr: 1, color: 'action.active' }} />,
              }}
            />

            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateTimePicker
                label="Date & Time"
                value={squad.dateTime}
                onChange={(newValue) => setSquad({ ...squad, dateTime: newValue || new Date() })}
                sx={{ width: '100%', mt: 2 }}
              />
            </LocalizationProvider>

            <Autocomplete
              multiple
              options={['fun', 'casual', 'competitive', 'educational', 'outdoor', 'indoor', 'social']}
              value={squad.tags}
              onChange={(e, value) => setSquad({ ...squad, tags: value })}
              renderInput={(params) => (
                <TextField {...params} label="Tags" margin="normal" placeholder="Add tags" />
              )}
              sx={{ mt: 2 }}
            />

            <Box mt={3}>
              <Typography variant="subtitle2" gutterBottom>
                Privacy Settings
              </Typography>
              <ToggleButtonGroup
                value={squad.isPrivate ? 'private' : 'public'}
                exclusive
                onChange={(e, value) => setSquad({ ...squad, isPrivate: value === 'private' })}
                fullWidth
              >
                <ToggleButton value="public">
                  <Group sx={{ mr: 1 }} />
                  Public Squad
                </ToggleButton>
                <ToggleButton value="private">
                  <Settings sx={{ mr: 1 }} />
                  Private Squad
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
          </Box>
        );

      case 3:
        const selectedMembers = friends.filter((f) => selectedFriends.includes(f.id));
        return (
          <Box>
            <SquadCard>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  {squad.name || 'Unnamed Squad'}
                </Typography>
                <Typography variant="body1" paragraph>
                  {squad.description || 'No description provided'}
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Activity:</Typography>
                    <Typography variant="body2">{squad.activity || 'Not specified'}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Location:</Typography>
                    <Typography variant="body2">{squad.location || 'Not specified'}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Date & Time:</Typography>
                    <Typography variant="body2">
                      {squad.dateTime?.toLocaleString() || 'Not specified'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Max Members:</Typography>
                    <Typography variant="body2">{squad.maxMembers}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </SquadCard>

            <Typography variant="h6" gutterBottom>
              Squad Members ({selectedMembers.length + 1})
            </Typography>
            <List>
              <ListItem>
                <ListItemAvatar>
                  <Avatar src={currentUser.avatar} />
                </ListItemAvatar>
                <ListItemText
                  primary={currentUser.name}
                  secondary="Squad Leader"
                />
                <ListItemSecondaryAction>
                  <Chip label="You" color="primary" size="small" />
                </ListItemSecondaryAction>
              </ListItem>
              {selectedMembers.map((member) => (
                <ListItem key={member.id}>
                  <ListItemAvatar>
                    <Avatar src={member.avatar} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={member.name}
                    secondary={`Match: ${member.matchScore}%`}
                  />
                  <ListItemSecondaryAction>
                    <Chip
                      label={member.availability}
                      size="small"
                      color={member.availability === 'available' ? 'success' : 'default'}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>

            {squad.tags.length > 0 && (
              <Box mt={2}>
                <Typography variant="subtitle2" gutterBottom>
                  Tags
                </Typography>
                <Box display="flex" gap={1}>
                  {squad.tags.map((tag) => (
                    <Chip key={tag} label={tag} size="small" />
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <StyledDialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <Diversity3 color="primary" />
            <Typography variant="h6">Squad Builder</Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {getStepContent(activeStep)}
          </motion.div>
        </AnimatePresence>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button
          onClick={handleBack}
          disabled={activeStep === 0}
          sx={{ mr: 1 }}
        >
          Back
        </Button>
        <Box flex={1} />
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleNext}
          variant="contained"
          disabled={
            (activeStep === 0 && !squad.name) ||
            (activeStep === 1 && selectedFriends.length === 0) ||
            (activeStep === 2 && !squad.activity)
          }
        >
          {activeStep === steps.length - 1 ? 'Create Squad' : 'Next'}
        </Button>
      </DialogActions>
    </StyledDialog>
  );
};

export default SquadBuilder;