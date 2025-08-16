import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Autocomplete,
  Chip,
  Box,
  Typography,
  Avatar,
  Grid,
  Card,
  CardContent,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  Alert,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  FormControlLabel,
  Checkbox,
  Radio,
  RadioGroup,
  Paper,
  Divider,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import {
  Close,
  Person,
  PersonAdd,
  Message,
  Send,
  CheckCircle,
  Info,
  Schedule,
  LocationOn,
  Interests,
  EmojiEmotions,
  AttachFile,
  PhotoCamera,
  Event,
  Groups,
  Handshake,
  AutoAwesome,
} from '@mui/icons-material';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

interface Friend {
  id: string;
  name: string;
  avatar: string;
  matchScore?: number;
  interests?: string[];
  location?: string;
}

interface IntroductionRequest {
  fromFriend: Friend;
  toFriend: Friend;
  message: string;
  reason: string;
  suggestedActivity?: string;
  suggestedTime?: string;
  commonInterests?: string[];
  introductionStyle: 'casual' | 'professional' | 'activity-based' | 'interest-based';
  includeContact: boolean;
  attachments?: File[];
}

interface ManualIntroductionModalProps {
  open: boolean;
  onClose: () => void;
  onSendIntroduction: (request: IntroductionRequest) => void;
  friends: Friend[];
  currentUser: Friend;
}

const StyledDialog = styled(Dialog)`
  .MuiDialog-paper {
    border-radius: 16px;
    max-width: 700px;
    width: 100%;
  }
`;

const FriendCard = styled(Card)<{ selected?: boolean }>`
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid ${props => props.selected ? '#667eea' : 'transparent'};
  background: ${props => props.selected 
    ? 'linear-gradient(135deg, #667eea10 0%, #764ba210 100%)'
    : 'white'};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const MessageTemplateChip = styled(Chip)`
  cursor: pointer;
  margin: 4px;
  
  &:hover {
    transform: scale(1.05);
  }
`;

const IntroStyleCard = styled(Paper)<{ selected?: boolean }>`
  padding: 16px;
  cursor: pointer;
  border: 2px solid ${props => props.selected ? '#667eea' : '#e0e0e0'};
  background: ${props => props.selected 
    ? 'linear-gradient(135deg, #667eea10 0%, #764ba210 100%)'
    : 'white'};
  transition: all 0.3s ease;

  &:hover {
    border-color: #667eea;
    transform: translateY(-2px);
  }
`;

const ManualIntroductionModal: React.FC<ManualIntroductionModalProps> = ({
  open,
  onClose,
  onSendIntroduction,
  friends = [],
  currentUser,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [fromFriend, setFromFriend] = useState<Friend | null>(null);
  const [toFriend, setToFriend] = useState<Friend | null>(null);
  const [message, setMessage] = useState('');
  const [reason, setReason] = useState('');
  const [suggestedActivity, setSuggestedActivity] = useState('');
  const [suggestedTime, setSuggestedTime] = useState('');
  const [introductionStyle, setIntroductionStyle] = useState<IntroductionRequest['introductionStyle']>('casual');
  const [includeContact, setIncludeContact] = useState(false);
  const [useTemplate, setUseTemplate] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);

  const steps = ['Select Friends', 'Introduction Style', 'Compose Message', 'Review & Send'];

  const messageTemplates = [
    "I think you two would really get along! You both share an interest in",
    "Meet my friend! They're amazing at",
    "You both mentioned wanting to",
    "I've been meaning to introduce you two because",
    "You'll love meeting them! They also enjoy",
  ];

  const commonActivities = [
    'Coffee meetup',
    'Study session',
    'Sports activity',
    'Book club',
    'Volunteer work',
    'Tech meetup',
    'Art workshop',
    'Language exchange',
    'Cooking together',
    'Hiking trip',
  ];

  const introStyles = [
    {
      type: 'casual' as const,
      title: 'Casual Introduction',
      description: 'Friendly and relaxed introduction for social connection',
      icon: <EmojiEmotions />,
    },
    {
      type: 'professional' as const,
      title: 'Professional Introduction',
      description: 'Formal introduction for networking or career purposes',
      icon: <Groups />,
    },
    {
      type: 'activity-based' as const,
      title: 'Activity-Based Introduction',
      description: 'Introduction centered around a shared activity or event',
      icon: <Event />,
    },
    {
      type: 'interest-based' as const,
      title: 'Interest-Based Introduction',
      description: 'Introduction focused on common interests and hobbies',
      icon: <Interests />,
    },
  ];

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      handleSendIntroduction();
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSendIntroduction = () => {
    if (!fromFriend || !toFriend) return;

    const request: IntroductionRequest = {
      fromFriend,
      toFriend,
      message,
      reason,
      suggestedActivity,
      suggestedTime,
      commonInterests: getCommonInterests(),
      introductionStyle,
      includeContact,
      attachments,
    };

    onSendIntroduction(request);
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setActiveStep(0);
    setFromFriend(null);
    setToFriend(null);
    setMessage('');
    setReason('');
    setSuggestedActivity('');
    setSuggestedTime('');
    setIntroductionStyle('casual');
    setIncludeContact(false);
    setAttachments([]);
  };

  const getCommonInterests = (): string[] => {
    if (!fromFriend?.interests || !toFriend?.interests) return [];
    return fromFriend.interests.filter(interest => 
      toFriend.interests?.includes(interest)
    );
  };

  const generateMessage = () => {
    const template = messageTemplates[Math.floor(Math.random() * messageTemplates.length)];
    const commonInterests = getCommonInterests();
    
    let generatedMessage = `Hi ${toFriend?.name}! ${template}`;
    
    if (commonInterests.length > 0) {
      generatedMessage += ` ${commonInterests[0]}`;
    }
    
    if (fromFriend) {
      generatedMessage += `. ${fromFriend.name} is `;
      
      switch (introductionStyle) {
        case 'professional':
          generatedMessage += `a talented professional who could be a great connection for you.`;
          break;
        case 'activity-based':
          generatedMessage += `looking for someone to ${suggestedActivity || 'hang out'} with.`;
          break;
        case 'interest-based':
          generatedMessage += `passionate about the same things you are!`;
          break;
        default:
          generatedMessage += `someone I think you'd really enjoy meeting!`;
      }
    }
    
    if (suggestedActivity) {
      generatedMessage += ` Maybe you could ${suggestedActivity} together?`;
    }
    
    if (suggestedTime) {
      generatedMessage += ` They're usually free ${suggestedTime}.`;
    }
    
    generatedMessage += ` Let me know if you'd like me to make an introduction!`;
    
    setMessage(generatedMessage);
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Who would you like to introduce?
            </Typography>
            
            <Box mb={3}>
              <Typography variant="subtitle2" gutterBottom>
                Friend 1: Who do you want to introduce?
              </Typography>
              <Autocomplete
                options={friends}
                getOptionLabel={(option) => option.name}
                value={fromFriend}
                onChange={(e, value) => setFromFriend(value)}
                renderInput={(params) => (
                  <TextField {...params} placeholder="Select first friend" />
                )}
                renderOption={(props, option) => (
                  <Box component="li" {...props}>
                    <Avatar src={option.avatar} sx={{ mr: 2, width: 32, height: 32 }} />
                    <Box>
                      <Typography variant="body2">{option.name}</Typography>
                      {option.location && (
                        <Typography variant="caption" color="text.secondary">
                          {option.location}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                )}
              />
            </Box>

            <Box mb={3}>
              <Typography variant="subtitle2" gutterBottom>
                Friend 2: Who should they meet?
              </Typography>
              <Autocomplete
                options={friends.filter(f => f.id !== fromFriend?.id)}
                getOptionLabel={(option) => option.name}
                value={toFriend}
                onChange={(e, value) => setToFriend(value)}
                renderInput={(params) => (
                  <TextField {...params} placeholder="Select second friend" />
                )}
                renderOption={(props, option) => (
                  <Box component="li" {...props}>
                    <Avatar src={option.avatar} sx={{ mr: 2, width: 32, height: 32 }} />
                    <Box>
                      <Typography variant="body2">{option.name}</Typography>
                      {option.location && (
                        <Typography variant="caption" color="text.secondary">
                          {option.location}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                )}
              />
            </Box>

            {fromFriend && toFriend && (
              <Alert severity="info" icon={<Handshake />}>
                <Typography variant="body2">
                  Great choice! {fromFriend.name} and {toFriend.name} 
                  {getCommonInterests().length > 0 && 
                    ` have ${getCommonInterests().length} common interests`}
                </Typography>
              </Alert>
            )}
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Choose Introduction Style
            </Typography>
            
            <Grid container spacing={2}>
              {introStyles.map((style) => (
                <Grid item xs={12} sm={6} key={style.type}>
                  <IntroStyleCard
                    selected={introductionStyle === style.type}
                    onClick={() => setIntroductionStyle(style.type)}
                  >
                    <Box display="flex" alignItems="center" gap={2}>
                      {style.icon}
                      <Box>
                        <Typography variant="subtitle2">{style.title}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {style.description}
                        </Typography>
                      </Box>
                    </Box>
                  </IntroStyleCard>
                </Grid>
              ))}
            </Grid>

            <Box mt={3}>
              <Typography variant="subtitle2" gutterBottom>
                Additional Options
              </Typography>
              
              <FormControlLabel
                control={
                  <Checkbox
                    checked={includeContact}
                    onChange={(e) => setIncludeContact(e.target.checked)}
                  />
                }
                label="Share contact information"
              />
              
              <TextField
                fullWidth
                label="Reason for introduction"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                margin="normal"
                multiline
                rows={2}
                placeholder="Why do you think they should meet?"
              />
            </Box>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                Compose Your Introduction
              </Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<AutoAwesome />}
                onClick={generateMessage}
              >
                Generate Message
              </Button>
            </Box>

            <Box mb={2}>
              <Typography variant="subtitle2" gutterBottom>
                Quick Templates
              </Typography>
              <Box display="flex" flexWrap="wrap">
                {messageTemplates.map((template, index) => (
                  <MessageTemplateChip
                    key={index}
                    label={template.substring(0, 30) + '...'}
                    onClick={() => setMessage(template)}
                    size="small"
                  />
                ))}
              </Box>
            </Box>

            <TextField
              fullWidth
              label="Introduction Message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              multiline
              rows={4}
              margin="normal"
              placeholder="Write a warm introduction message..."
            />

            <Grid container spacing={2} mt={1}>
              <Grid item xs={12} sm={6}>
                <Autocomplete
                  options={commonActivities}
                  value={suggestedActivity}
                  onChange={(e, value) => setSuggestedActivity(value || '')}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Suggest an activity"
                      placeholder="Optional"
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: <Event sx={{ mr: 1, color: 'action.active' }} />,
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Suggested meeting time"
                  value={suggestedTime}
                  onChange={(e) => setSuggestedTime(e.target.value)}
                  placeholder="e.g., weekends, evenings"
                  InputProps={{
                    startAdornment: <Schedule sx={{ mr: 1, color: 'action.active' }} />,
                  }}
                />
              </Grid>
            </Grid>

            <Box mt={2}>
              <Button
                variant="outlined"
                startIcon={<AttachFile />}
                component="label"
              >
                Attach Files
                <input
                  type="file"
                  hidden
                  multiple
                  onChange={(e) => setAttachments(Array.from(e.target.files || []))}
                />
              </Button>
              {attachments.length > 0 && (
                <Typography variant="caption" sx={{ ml: 2 }}>
                  {attachments.length} file(s) attached
                </Typography>
              )}
            </Box>
          </Box>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Review Your Introduction
            </Typography>

            <Paper sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Avatar src={fromFriend?.avatar} sx={{ width: 48, height: 48 }} />
                    <Box>
                      <Typography variant="subtitle2">{fromFriend?.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Friend to introduce
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Avatar src={toFriend?.avatar} sx={{ width: 48, height: 48 }} />
                    <Box>
                      <Typography variant="subtitle2">{toFriend?.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Introducing to
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Introduction Style
              </Typography>
              <Chip
                label={introStyles.find(s => s.type === introductionStyle)?.title}
                color="primary"
                size="small"
              />
            </Paper>

            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Your Message
              </Typography>
              <Typography variant="body2" paragraph>
                {message || 'No message provided'}
              </Typography>
              
              {reason && (
                <>
                  <Typography variant="subtitle2" gutterBottom>
                    Reason for Introduction
                  </Typography>
                  <Typography variant="body2" paragraph>
                    {reason}
                  </Typography>
                </>
              )}

              {(suggestedActivity || suggestedTime) && (
                <Box display="flex" gap={2} mt={2}>
                  {suggestedActivity && (
                    <Chip
                      icon={<Event />}
                      label={suggestedActivity}
                      size="small"
                    />
                  )}
                  {suggestedTime && (
                    <Chip
                      icon={<Schedule />}
                      label={suggestedTime}
                      size="small"
                    />
                  )}
                </Box>
              )}
            </Paper>

            {getCommonInterests().length > 0 && (
              <Alert severity="success" icon={<Interests />}>
                <Typography variant="body2">
                  Common interests: {getCommonInterests().join(', ')}
                </Typography>
              </Alert>
            )}
          </Box>
        );

      default:
        return null;
    }
  };

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 0:
        return !!fromFriend && !!toFriend && fromFriend.id !== toFriend.id;
      case 1:
        return !!introductionStyle;
      case 2:
        return !!message;
      case 3:
        return true;
      default:
        return false;
    }
  };

  return (
    <StyledDialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <PersonAdd color="primary" />
            <Typography variant="h6">Manual Introduction</Typography>
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
          disabled={!isStepValid(activeStep)}
          startIcon={activeStep === steps.length - 1 ? <Send /> : null}
        >
          {activeStep === steps.length - 1 ? 'Send Introduction' : 'Next'}
        </Button>
      </DialogActions>
    </StyledDialog>
  );
};

export default ManualIntroductionModal;