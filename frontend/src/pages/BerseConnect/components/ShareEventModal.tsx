import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  Card,
  CardContent,
  TextField,
  Chip,
  Avatar,
  AvatarGroup,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  Alert,
  Tab,
  Tabs,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Paper,
  Grid,
  Tooltip,
  Badge,
  Snackbar,
} from '@mui/material';
import {
  Close,
  Share,
  ContentCopy,
  QrCode,
  Send,
  Search,
  Facebook,
  Twitter,
  Instagram,
  WhatsApp,
  Telegram,
  Email,
  Link as LinkIcon,
  CheckCircle,
  Group,
  Public,
  Lock,
  Star,
  LocationOn,
  Schedule,
  Person,
  Add,
  PersonAdd,
} from '@mui/icons-material';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

interface Event {
  id: string;
  title: string;
  description: string;
  dateTime: string;
  location: string;
  host: string;
  price: number;
  points: number;
  image?: string;
  maxParticipants: number;
  currentParticipants: number;
}

interface Friend {
  id: string;
  name: string;
  avatar?: string;
  mutualFriends?: number;
  isOnline?: boolean;
  interests?: string[];
}

interface SharePlatform {
  id: string;
  name: string;
  icon: React.ElementType;
  color: string;
  enabled: boolean;
  description: string;
}

interface ShareEventModalProps {
  open: boolean;
  onClose: () => void;
  event: Event;
  onShare: (platform: string) => void;
}

const StyledDialog = styled(Dialog)`
  .MuiDialog-paper {
    border-radius: 16px;
    max-width: 600px;
    width: 100%;
    max-height: 90vh;
  }
`;

const ShareCard = styled(motion.div)`
  cursor: pointer;
  border-radius: 12px;
  border: 1px solid #e0e0e0;
  margin-bottom: 8px;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #667eea;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
  }
`;

const EventPreview = styled(Card)`
  background: linear-gradient(135deg, #667eea10 0%, #764ba210 100%);
  border-radius: 16px;
  margin-bottom: 24px;
`;

const QRContainer = styled(Box)`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24px;
  background: white;
  border-radius: 12px;
  border: 2px solid #e0e0e0;
`;

const FriendCard = styled(motion.div)<{ selected?: boolean }>`
  cursor: pointer;
  border-radius: 8px;
  border: 1px solid ${props => props.selected ? '#667eea' : '#e0e0e0'};
  background: ${props => props.selected ? '#f3f4ff' : 'white'};
  margin-bottom: 8px;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #667eea;
  }
`;

const ShareEventModal: React.FC<ShareEventModalProps> = ({
  open,
  onClose,
  event,
  onShare,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [customMessage, setCustomMessage] = useState('');
  const [shareUrl, setShareUrl] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [privacy, setPrivacy] = useState<'public' | 'friends' | 'private'>('public');
  const [allowComments, setAllowComments] = useState(true);
  const [trackReferrals, setTrackReferrals] = useState(true);

  const shareUrlRef = useRef<HTMLInputElement>(null);

  // Mock friends data
  const friends: Friend[] = [
    {
      id: 'friend1',
      name: 'Sarah Ahmad',
      avatar: '/avatars/sarah.jpg',
      mutualFriends: 5,
      isOnline: true,
      interests: ['Sports', 'Social'],
    },
    {
      id: 'friend2',
      name: 'Omar Hassan',
      avatar: '/avatars/omar.jpg',
      mutualFriends: 3,
      isOnline: false,
      interests: ['Study', 'Professional'],
    },
    {
      id: 'friend3',
      name: 'Aisyah Rahman',
      avatar: '/avatars/aisyah.jpg',
      mutualFriends: 8,
      isOnline: true,
      interests: ['Arts', 'Creative'],
    },
    {
      id: 'friend4',
      name: 'Ahmad Zain',
      avatar: '/avatars/ahmad.jpg',
      mutualFriends: 2,
      isOnline: true,
      interests: ['Technology', 'Innovation'],
    },
    {
      id: 'friend5',
      name: 'Fatima Ali',
      avatar: '/avatars/fatima.jpg',
      mutualFriends: 6,
      isOnline: false,
      interests: ['Business', 'Entrepreneurship'],
    },
  ];

  const sharePlatforms: SharePlatform[] = [
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: WhatsApp,
      color: '#25D366',
      enabled: true,
      description: 'Share with contacts',
    },
    {
      id: 'telegram',
      name: 'Telegram',
      icon: Telegram,
      color: '#0088cc',
      enabled: true,
      description: 'Share in groups or channels',
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: Facebook,
      color: '#1877f2',
      enabled: true,
      description: 'Post to timeline or groups',
    },
    {
      id: 'instagram',
      name: 'Instagram',
      icon: Instagram,
      color: '#E4405F',
      enabled: true,
      description: 'Share to story or feed',
    },
    {
      id: 'twitter',
      name: 'Twitter',
      icon: Twitter,
      color: '#1DA1F2',
      enabled: true,
      description: 'Tweet to followers',
    },
    {
      id: 'email',
      name: 'Email',
      icon: Email,
      color: '#EA4335',
      enabled: true,
      description: 'Send via email',
    },
  ];

  useEffect(() => {
    if (open) {
      generateShareUrl();
      generateQRCode();
      setCustomMessage(getDefaultMessage());
    }
  }, [open, event]);

  const generateShareUrl = () => {
    const baseUrl = window.location.origin;
    const eventUrl = `${baseUrl}/events/${event.id}?ref=share`;
    setShareUrl(eventUrl);
  };

  const generateQRCode = () => {
    // In a real app, you would generate an actual QR code
    // For now, we'll use a placeholder
    setQrCode('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y5ZjlmOSIvPgogIDx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM2NjciIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5RUiBDb2RlPC90ZXh0Pgo8L3N2Zz4K');
  };

  const getDefaultMessage = (): string => {
    const eventDate = new Date(event.dateTime).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
    
    return `Hey! I found this amazing event: "${event.title}" happening on ${eventDate} at ${event.location}. ${event.price === 0 ? "It's free!" : `Only RM ${event.price}`} Want to join me?`;
  };

  const filteredFriends = friends.filter(friend =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.interests?.some(interest => 
      interest.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleFriendSelect = (friendId: string) => {
    setSelectedFriends(prev =>
      prev.includes(friendId)
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    );
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      // Fallback for older browsers
      if (shareUrlRef.current) {
        shareUrlRef.current.select();
        document.execCommand('copy');
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      }
    }
  };

  const handlePlatformShare = (platform: SharePlatform) => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedText = encodeURIComponent(customMessage);
    
    let shareLink = '';
    
    switch (platform.id) {
      case 'whatsapp':
        shareLink = `https://wa.me/?text=${encodedText}%20${encodedUrl}`;
        break;
      case 'telegram':
        shareLink = `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
        break;
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
        break;
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
        break;
      case 'instagram':
        // Instagram doesn't support direct URL sharing, so we copy to clipboard
        navigator.clipboard.writeText(`${customMessage} ${shareUrl}`);
        alert('Link copied! Paste it in your Instagram post or story.');
        break;
      case 'email':
        shareLink = `mailto:?subject=${encodeURIComponent(event.title)}&body=${encodedText}%20${encodedUrl}`;
        break;
    }
    
    if (shareLink) {
      window.open(shareLink, '_blank');
    }
    
    onShare(platform.id);
  };

  const handleDirectShare = () => {
    if (selectedFriends.length === 0) {
      alert('Please select at least one friend to share with.');
      return;
    }
    
    // In a real app, this would send notifications to selected friends
    const friendNames = friends
      .filter(f => selectedFriends.includes(f.id))
      .map(f => f.name)
      .join(', ');
    
    alert(`Event shared with ${friendNames}!`);
    onShare('direct');
  };

  const renderFriendsTab = () => (
    <Box>
      <TextField
        fullWidth
        placeholder="Search friends..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 2 }}
        size="small"
      />

      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="subtitle2">
          Select Friends ({selectedFriends.length} selected)
        </Typography>
        {selectedFriends.length > 0 && (
          <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 24, height: 24 } }}>
            {friends
              .filter(f => selectedFriends.includes(f.id))
              .slice(0, 4)
              .map(friend => (
                <Avatar key={friend.id} src={friend.avatar} sx={{ width: 24, height: 24 }}>
                  {friend.name[0]}
                </Avatar>
              ))}
          </AvatarGroup>
        )}
      </Box>

      <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
        {filteredFriends.map((friend) => (
          <FriendCard
            key={friend.id}
            selected={selectedFriends.includes(friend.id)}
            onClick={() => handleFriendSelect(friend.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ListItem>
              <ListItemIcon>
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  badgeContent={
                    friend.isOnline ? (
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          background: '#4caf50',
                          border: '2px solid white',
                        }}
                      />
                    ) : null
                  }
                >
                  <Avatar src={friend.avatar} sx={{ width: 40, height: 40 }}>
                    {friend.name[0]}
                  </Avatar>
                </Badge>
              </ListItemIcon>
              <ListItemText
                primary={friend.name}
                secondary={
                  <Box>
                    {friend.mutualFriends && (
                      <Typography variant="caption" color="text.secondary" display="block">
                        {friend.mutualFriends} mutual friends
                      </Typography>
                    )}
                    {friend.interests && (
                      <Box display="flex" gap={0.5} flexWrap="wrap" mt={0.5}>
                        {friend.interests.slice(0, 2).map((interest) => (
                          <Chip
                            key={interest}
                            label={interest}
                            size="small"
                            sx={{ fontSize: '0.7rem', height: 20 }}
                          />
                        ))}
                      </Box>
                    )}
                  </Box>
                }
              />
              {selectedFriends.includes(friend.id) && (
                <CheckCircle color="primary" />
              )}
            </ListItem>
          </FriendCard>
        ))}
      </Box>

      <TextField
        fullWidth
        multiline
        rows={3}
        label="Custom Message"
        value={customMessage}
        onChange={(e) => setCustomMessage(e.target.value)}
        sx={{ mt: 2 }}
        inputProps={{ maxLength: 500 }}
        helperText={`${customMessage.length}/500 characters`}
      />

      <Box display="flex" gap={2} mt={2}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Privacy</InputLabel>
          <Select
            value={privacy}
            onChange={(e) => setPrivacy(e.target.value as any)}
            label="Privacy"
          >
            <MenuItem value="public">
              <Box display="flex" alignItems="center" gap={1}>
                <Public fontSize="small" />
                Public
              </Box>
            </MenuItem>
            <MenuItem value="friends">
              <Box display="flex" alignItems="center" gap={1}>
                <Group fontSize="small" />
                Friends
              </Box>
            </MenuItem>
            <MenuItem value="private">
              <Box display="flex" alignItems="center" gap={1}>
                <Lock fontSize="small" />
                Private
              </Box>
            </MenuItem>
          </Select>
        </FormControl>
        
        <Box display="flex" flexDirection="column" gap={1}>
          <FormControlLabel
            control={
              <Switch
                checked={allowComments}
                onChange={(e) => setAllowComments(e.target.checked)}
                size="small"
              />
            }
            label="Allow comments"
          />
          <FormControlLabel
            control={
              <Switch
                checked={trackReferrals}
                onChange={(e) => setTrackReferrals(e.target.checked)}
                size="small"
              />
            }
            label="Track referrals"
          />
        </Box>
      </Box>
    </Box>
  );

  const renderSocialTab = () => (
    <Box>
      <Typography variant="subtitle1" gutterBottom>
        Share on Social Media
      </Typography>
      
      <Grid container spacing={2}>
        {sharePlatforms.map((platform) => (
          <Grid item xs={6} key={platform.id}>
            <ShareCard
              onClick={() => handlePlatformShare(platform)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <CardContent sx={{ textAlign: 'center', p: 2 }}>
                <platform.icon sx={{ fontSize: 40, color: platform.color, mb: 1 }} />
                <Typography variant="subtitle2" gutterBottom>
                  {platform.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {platform.description}
                </Typography>
              </CardContent>
            </ShareCard>
          </Grid>
        ))}
      </Grid>

      <Divider sx={{ my: 3 }} />

      <Typography variant="subtitle2" gutterBottom>
        Custom Message
      </Typography>
      <TextField
        fullWidth
        multiline
        rows={4}
        value={customMessage}
        onChange={(e) => setCustomMessage(e.target.value)}
        placeholder="Add a personal message..."
        inputProps={{ maxLength: 500 }}
        helperText={`${customMessage.length}/500 characters`}
      />
    </Box>
  );

  const renderLinkTab = () => (
    <Box>
      <Typography variant="subtitle1" gutterBottom>
        Share Link
      </Typography>
      
      <TextField
        fullWidth
        value={shareUrl}
        InputProps={{
          readOnly: true,
          endAdornment: (
            <InputAdornment position="end">
              <Tooltip title={copySuccess ? 'Copied!' : 'Copy link'}>
                <IconButton onClick={handleCopyUrl} edge="end">
                  {copySuccess ? <CheckCircle color="success" /> : <ContentCopy />}
                </IconButton>
              </Tooltip>
            </InputAdornment>
          ),
        }}
        sx={{ mb: 3 }}
        ref={shareUrlRef}
      />

      <Typography variant="subtitle2" gutterBottom>
        QR Code
      </Typography>
      <QRContainer>
        {qrCode ? (
          <Box textAlign="center">
            <img src={qrCode} alt="QR Code" style={{ width: 150, height: 150 }} />
            <Typography variant="caption" display="block" mt={1}>
              Scan to view event
            </Typography>
          </Box>
        ) : (
          <Box textAlign="center" p={4}>
            <QrCode sx={{ fontSize: 60, color: 'text.secondary', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              Generating QR code...
            </Typography>
          </Box>
        )}
      </QRContainer>

      <Alert severity="info" sx={{ mt: 2 }}>
        <Typography variant="body2">
          Share this link or QR code with anyone you want to invite to this event. 
          {trackReferrals && " You'll earn points for successful referrals!"}
        </Typography>
      </Alert>
    </Box>
  );

  return (
    <StyledDialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <Share color="primary" />
            <Typography variant="h6">Share Event</Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ px: 3 }}>
        {/* Event Preview */}
        <EventPreview elevation={0}>
          <CardContent>
            <Box display="flex" gap={2} mb={2}>
              {event.image && (
                <Box
                  component="img"
                  src={event.image}
                  alt={event.title}
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: 2,
                    objectFit: 'cover',
                  }}
                />
              )}
              <Box flex={1}>
                <Typography variant="h6" gutterBottom noWrap>
                  {event.title}
                </Typography>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <Schedule sx={{ fontSize: 16 }} />
                  <Typography variant="caption" color="text.secondary">
                    {new Date(event.dateTime).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <LocationOn sx={{ fontSize: 16 }} />
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {event.location}
                  </Typography>
                </Box>
              </Box>
            </Box>
            
            <Box display="flex" gap={1}>
              <Chip
                label={event.price > 0 ? `RM ${event.price}` : 'Free'}
                size="small"
                color={event.price > 0 ? 'secondary' : 'success'}
              />
              <Chip
                icon={<Star />}
                label={`+${event.points} pts`}
                size="small"
                color="primary"
              />
            </Box>
          </CardContent>
        </EventPreview>

        {/* Share Tabs */}
        <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
          <Tab label="Friends" />
          <Tab label="Social Media" />
          <Tab label="Link & QR" />
        </Tabs>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 0 && renderFriendsTab()}
            {activeTab === 1 && renderSocialTab()}
            {activeTab === 2 && renderLinkTab()}
          </motion.div>
        </AnimatePresence>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>Close</Button>
        {activeTab === 0 && (
          <Button
            onClick={handleDirectShare}
            variant="contained"
            startIcon={<Send />}
            disabled={selectedFriends.length === 0}
          >
            Share with {selectedFriends.length || ''} Friend{selectedFriends.length !== 1 ? 's' : ''}
          </Button>
        )}
      </DialogActions>

      <Snackbar
        open={copySuccess}
        autoHideDuration={2000}
        onClose={() => setCopySuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        message="Link copied to clipboard!"
      />
    </StyledDialog>
  );
};

export default ShareEventModal;