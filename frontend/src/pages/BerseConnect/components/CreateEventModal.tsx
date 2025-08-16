import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  InputAdornment,
  Switch,
  FormControlLabel,
  Alert,
  Grid,
  Slider,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Autocomplete,
} from '@mui/material';
import {
  Close,
  Event,
  LocationOn,
  AttachMoney,
  Group,
  AccessTime,
  Category,
  Tag,
  CheckCircle,
  Warning,
  AddPhotoAlternate,
  Repeat,
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

interface CreateEventData {
  title: string;
  description: string;
  category: string;
  dateTime: Date | null;
  duration: number;
  location: string;
  address: string;
  maxParticipants: number;
  price: number;
  requirements?: string;
  tags: string[];
  image?: File | null;
  recurring: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    endDate?: Date | null;
  };
  isPublic: boolean;
  requiresApproval: boolean;
}

interface CreateEventModalProps {
  open: boolean;
  onClose: () => void;
  onCreateEvent: (eventData: CreateEventData) => void;
  currentLocation: { city: string; country: string };
}

const StyledDialog = styled(Dialog)`
  .MuiDialog-paper {
    border-radius: 16px;
    max-width: 700px;
    width: 100%;
  }
`;

const StepContent = styled(Box)`
  min-height: 400px;
  padding: 24px 0;
`;

const ImageUploadBox = styled(Box)`
  border: 2px dashed #e0e0e0;
  border-radius: 12px;
  padding: 32px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #667eea;
    background: #f5f5f5;
  }
`;

const PreviewCard = styled(Paper)`
  padding: 20px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea10 0%, #764ba210 100%);
`;

const CreateEventModal: React.FC<CreateEventModalProps> = ({
  open,
  onClose,
  onCreateEvent,
  currentLocation,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [eventData, setEventData] = useState<CreateEventData>({
    title: '',
    description: '',
    category: 'Social',
    dateTime: null,
    duration: 120,
    location: '',
    address: '',
    maxParticipants: 20,
    price: 0,
    requirements: '',
    tags: [],
    image: null,
    recurring: {
      enabled: false,
      frequency: 'weekly',
      endDate: null,
    },
    isPublic: true,
    requiresApproval: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const steps = ['Basic Info', 'Date & Location', 'Details', 'Review'];

  const categories = [
    { id: 'Sports', name: 'Sports', icon: '⚽' },
    { id: 'Social', name: 'Social', icon: '👥' },
    { id: 'Trips', name: 'Trips', icon: '✈️' },
    { id: 'Study', name: 'Study', icon: '📚' },
    { id: 'Donation', name: 'Donation', icon: '💝' },
    { id: 'Volunteer', name: 'Volunteer', icon: '🤝' },
    { id: 'Cafe', name: 'Cafe', icon: '☕' },
  ];

  const popularTags = [
    'Beginner Friendly',
    'Professional',
    'Casual',
    'Competitive',
    'Family Friendly',
    'Ladies Only',
    'Men Only',
    'Mixed',
    'Outdoor',
    'Indoor',
  ];

  const durationOptions = [
    { value: 60, label: '1 hour' },
    { value: 90, label: '1.5 hours' },
    { value: 120, label: '2 hours' },
    { value: 180, label: '3 hours' },
    { value: 240, label: '4 hours' },
    { value: 300, label: '5 hours' },
    { value: 360, label: '6 hours' },
    { value: 720, label: 'Full day' },
  ];

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 0: // Basic Info
        if (!eventData.title || eventData.title.length < 5) {
          newErrors.title = 'Event title must be at least 5 characters';
        }
        if (!eventData.description || eventData.description.length < 20) {
          newErrors.description = 'Please provide a detailed description (min 20 characters)';
        }
        if (!eventData.category) {
          newErrors.category = 'Please select a category';
        }
        break;

      case 1: // Date & Location
        if (!eventData.dateTime) {
          newErrors.dateTime = 'Please select date and time';
        } else if (eventData.dateTime < new Date()) {
          newErrors.dateTime = 'Event cannot be in the past';
        }
        if (!eventData.location) {
          newErrors.location = 'Please specify a location';
        }
        if (!eventData.address) {
          newErrors.address = 'Please provide an address';
        }
        break;

      case 2: // Details
        if (eventData.maxParticipants < 2) {
          newErrors.maxParticipants = 'Event must allow at least 2 participants';
        }
        if (eventData.price < 0) {
          newErrors.price = 'Price cannot be negative';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  const handleCreate = () => {
    if (validateStep(activeStep)) {
      onCreateEvent(eventData);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, image: 'Image size must be less than 5MB' });
        return;
      }
      setEventData({ ...eventData, image: file });
      setErrors({ ...errors, image: '' });
    }
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0: // Basic Info
        return (
          <StepContent>
            <TextField
              fullWidth
              label="Event Title"
              value={eventData.title}
              onChange={(e) => setEventData({ ...eventData, title: e.target.value })}
              error={!!errors.title}
              helperText={errors.title || 'Give your event a catchy title'}
              margin="normal"
              required
              inputProps={{ maxLength: 50 }}
            />

            <TextField
              fullWidth
              label="Description"
              value={eventData.description}
              onChange={(e) => setEventData({ ...eventData, description: e.target.value })}
              error={!!errors.description}
              helperText={errors.description || 'Describe what participants can expect'}
              margin="normal"
              multiline
              rows={4}
              required
              inputProps={{ maxLength: 500 }}
            />

            <FormControl fullWidth margin="normal" required>
              <InputLabel>Category</InputLabel>
              <Select
                value={eventData.category}
                onChange={(e) => setEventData({ ...eventData, category: e.target.value })}
                label="Category"
              >
                {categories.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <span>{cat.icon}</span>
                      <span>{cat.name}</span>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box mt={2}>
              <Typography variant="subtitle2" gutterBottom>
                Tags (Optional)
              </Typography>
              <Autocomplete
                multiple
                options={popularTags}
                value={eventData.tags}
                onChange={(e, value) => setEventData({ ...eventData, tags: value })}
                renderInput={(params) => (
                  <TextField {...params} placeholder="Add tags" />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      label={option}
                      {...getTagProps({ index })}
                      size="small"
                      sx={{ m: 0.5 }}
                    />
                  ))
                }
              />
            </Box>

            <Box mt={3}>
              <Typography variant="subtitle2" gutterBottom>
                Event Image (Optional)
              </Typography>
              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                id="image-upload"
                onChange={handleImageUpload}
              />
              <label htmlFor="image-upload">
                <ImageUploadBox>
                  <AddPhotoAlternate sx={{ fontSize: 48, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary" mt={1}>
                    {eventData.image ? eventData.image.name : 'Click to upload image'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Max size: 5MB
                  </Typography>
                </ImageUploadBox>
              </label>
              {errors.image && (
                <Alert severity="error" sx={{ mt: 1 }}>
                  {errors.image}
                </Alert>
              )}
            </Box>
          </StepContent>
        );

      case 1: // Date & Location
        return (
          <StepContent>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateTimePicker
                label="Event Date & Time"
                value={eventData.dateTime}
                onChange={(newValue) => setEventData({ ...eventData, dateTime: newValue })}
                sx={{ width: '100%', mb: 2 }}
                minDateTime={new Date()}
              />
            </LocalizationProvider>
            {errors.dateTime && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errors.dateTime}
              </Alert>
            )}

            <FormControl fullWidth margin="normal">
              <InputLabel>Duration</InputLabel>
              <Select
                value={eventData.duration}
                onChange={(e) => setEventData({ ...eventData, duration: Number(e.target.value) })}
                label="Duration"
              >
                {durationOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Location Name"
              value={eventData.location}
              onChange={(e) => setEventData({ ...eventData, location: e.target.value })}
              error={!!errors.location}
              helperText={errors.location || 'e.g., KLCC Park, Starbucks Pavilion'}
              margin="normal"
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationOn />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Full Address"
              value={eventData.address}
              onChange={(e) => setEventData({ ...eventData, address: e.target.value })}
              error={!!errors.address}
              helperText={errors.address || 'Enter the complete address'}
              margin="normal"
              multiline
              rows={2}
              required
            />

            <Box mt={3}>
              <FormControlLabel
                control={
                  <Switch
                    checked={eventData.recurring.enabled}
                    onChange={(e) => setEventData({
                      ...eventData,
                      recurring: { ...eventData.recurring, enabled: e.target.checked }
                    })}
                  />
                }
                label="Recurring Event"
              />
              {eventData.recurring.enabled && (
                <Box mt={2}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Frequency</InputLabel>
                    <Select
                      value={eventData.recurring.frequency}
                      onChange={(e) => setEventData({
                        ...eventData,
                        recurring: {
                          ...eventData.recurring,
                          frequency: e.target.value as 'daily' | 'weekly' | 'monthly'
                        }
                      })}
                      label="Frequency"
                    >
                      <MenuItem value="daily">Daily</MenuItem>
                      <MenuItem value="weekly">Weekly</MenuItem>
                      <MenuItem value="monthly">Monthly</MenuItem>
                    </Select>
                  </FormControl>

                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DateTimePicker
                      label="End Date (Optional)"
                      value={eventData.recurring.endDate}
                      onChange={(newValue) => setEventData({
                        ...eventData,
                        recurring: { ...eventData.recurring, endDate: newValue }
                      })}
                      sx={{ width: '100%', mt: 2 }}
                      minDateTime={eventData.dateTime || new Date()}
                    />
                  </LocalizationProvider>
                </Box>
              )}
            </Box>
          </StepContent>
        );

      case 2: // Details
        return (
          <StepContent>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Maximum Participants"
                  value={eventData.maxParticipants}
                  onChange={(e) => setEventData({ ...eventData, maxParticipants: Number(e.target.value) })}
                  error={!!errors.maxParticipants}
                  helperText={errors.maxParticipants}
                  InputProps={{
                    inputProps: { min: 2, max: 200 },
                    startAdornment: (
                      <InputAdornment position="start">
                        <Group />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Price (RM)"
                  value={eventData.price}
                  onChange={(e) => setEventData({ ...eventData, price: Number(e.target.value) })}
                  error={!!errors.price}
                  helperText={errors.price || 'Set to 0 for free events'}
                  InputProps={{
                    inputProps: { min: 0, max: 1000 },
                    startAdornment: (
                      <InputAdornment position="start">
                        <AttachMoney />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>

            {eventData.price > 0 && (
              <Alert severity="info" sx={{ mt: 2 }}>
                A 5% platform fee will be added to the ticket price
              </Alert>
            )}

            <TextField
              fullWidth
              label="Requirements/Instructions (Optional)"
              value={eventData.requirements}
              onChange={(e) => setEventData({ ...eventData, requirements: e.target.value })}
              margin="normal"
              multiline
              rows={3}
              placeholder="e.g., Bring your own racket, Wear comfortable shoes"
              inputProps={{ maxLength: 200 }}
            />

            <Box mt={3}>
              <Typography variant="subtitle2" gutterBottom>
                Privacy Settings
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={eventData.isPublic}
                    onChange={(e) => setEventData({ ...eventData, isPublic: e.target.checked })}
                  />
                }
                label="Public Event (visible to everyone)"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={eventData.requiresApproval}
                    onChange={(e) => setEventData({ ...eventData, requiresApproval: e.target.checked })}
                  />
                }
                label="Require approval to join"
              />
            </Box>

            <Alert severity="info" sx={{ mt: 3 }}>
              <Typography variant="body2">
                You'll earn 50 points for creating this event!
              </Typography>
            </Alert>
          </StepContent>
        );

      case 3: // Review
        return (
          <StepContent>
            <PreviewCard elevation={0}>
              <Typography variant="h5" gutterBottom>
                {eventData.title || 'Untitled Event'}
              </Typography>
              
              <Chip
                label={eventData.category}
                size="small"
                sx={{ mb: 2 }}
                color="primary"
              />

              <Typography variant="body1" paragraph>
                {eventData.description || 'No description provided'}
              </Typography>

              <List>
                <ListItem>
                  <ListItemIcon>
                    <AccessTime />
                  </ListItemIcon>
                  <ListItemText
                    primary="Date & Time"
                    secondary={eventData.dateTime?.toLocaleString() || 'Not set'}
                  />
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <LocationOn />
                  </ListItemIcon>
                  <ListItemText
                    primary="Location"
                    secondary={`${eventData.location || 'Not set'} - ${eventData.address || 'No address'}`}
                  />
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <Group />
                  </ListItemIcon>
                  <ListItemText
                    primary="Capacity"
                    secondary={`${eventData.maxParticipants} participants`}
                  />
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <AttachMoney />
                  </ListItemIcon>
                  <ListItemText
                    primary="Price"
                    secondary={eventData.price > 0 ? `RM ${eventData.price}` : 'Free'}
                  />
                </ListItem>
              </List>

              {eventData.tags.length > 0 && (
                <Box mt={2}>
                  <Typography variant="subtitle2" gutterBottom>
                    Tags
                  </Typography>
                  <Box display="flex" gap={1} flexWrap="wrap">
                    {eventData.tags.map((tag) => (
                      <Chip key={tag} label={tag} size="small" />
                    ))}
                  </Box>
                </Box>
              )}

              <Box mt={3} display="flex" gap={2}>
                {eventData.isPublic && (
                  <Chip
                    icon={<CheckCircle />}
                    label="Public Event"
                    color="success"
                    size="small"
                  />
                )}
                {eventData.requiresApproval && (
                  <Chip
                    icon={<Warning />}
                    label="Requires Approval"
                    color="warning"
                    size="small"
                  />
                )}
                {eventData.recurring.enabled && (
                  <Chip
                    icon={<Repeat />}
                    label={`Recurring ${eventData.recurring.frequency}`}
                    color="info"
                    size="small"
                  />
                )}
              </Box>
            </PreviewCard>

            <Alert severity="success" sx={{ mt: 3 }}>
              <Typography variant="body2">
                Your event is ready to be published! It will be visible to users in {currentLocation.city}.
              </Typography>
            </Alert>
          </StepContent>
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
            <Event color="primary" />
            <Typography variant="h6">Create Event</Typography>
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
        {activeStep === steps.length - 1 ? (
          <Button onClick={handleCreate} variant="contained">
            Create Event
          </Button>
        ) : (
          <Button onClick={handleNext} variant="contained">
            Next
          </Button>
        )}
      </DialogActions>
    </StyledDialog>
  );
};

export default CreateEventModal;