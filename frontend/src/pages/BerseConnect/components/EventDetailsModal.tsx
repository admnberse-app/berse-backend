import React, { useState, useEffect } from 'react';
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
  CardMedia,
  Avatar,
  AvatarGroup,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemAvatar,
  TextField,
  Badge,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Rating,
  LinearProgress,
  Paper,
  Grid,
  Tab,
  Tabs,
  Collapse,
  Tooltip,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Close,
  Share,
  Bookmark,
  BookmarkBorder,
  LocationOn,
  Schedule,
  AttachMoney,
  Group,
  Person,
  Star,
  CheckCircle,
  Warning,
  Info,
  Send,
  ExpandMore,
  MoreVert,
  Report,
  Edit,
  Delete,
  Verified,
  ChatBubble,
  Favorite,
  FavoriteBorder,
  Reply,
  ThumbUp,
  ThumbUpOutlined,
  Event,
  Phone,
  Email,
  Language,
  Instagram,
  Facebook,
  Twitter,
} from '@mui/icons-material';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

interface Event {
  id: string;
  title: string;
  description: string;
  dateTime: string;
  duration: number;
  location: string;
  address: string;
  host: string;
  hostId: string;
  hostAvatar?: string;
  hostRating?: number;
  hostVerified?: boolean;
  hostBio?: string;
  hostContact?: {
    phone?: string;
    email?: string;
    website?: string;
    social?: {
      instagram?: string;
      facebook?: string;
      twitter?: string;
    };
  };
  maxParticipants: number;
  currentParticipants: number;
  price: number;
  points: number;
  image?: string;
  images?: string[];
  tags: string[];
  requirements?: string;
  amenities?: string[];
  accessibility?: string[];
  rating?: number;
  spotsLeft: number;
  userJoined?: boolean;
  userSaved?: boolean;
  cancellationPolicy?: string;
  refundPolicy?: string;
  ageRestriction?: string;
  category: string;
}

interface Attendee {
  id: string;
  name: string;
  avatar?: string;
  joinedAt: string;
  isHost?: boolean;
  verified?: boolean;
  mutualFriends?: string[];
  points?: number;
}

interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  timestamp: string;
  likes: number;
  isLiked?: boolean;
  replies?: Comment[];
  isHost?: boolean;
}

interface EventDetailsModalProps {
  open: boolean;
  onClose: () => void;
  event: Event;
  onJoin: () => void;
  onShare: () => void;
}

const StyledDialog = styled(Dialog)`
  .MuiDialog-paper {
    border-radius: 16px;
    max-width: 800px;
    width: 100%;
    max-height: 90vh;
  }
`;

const EventImage = styled(Box)`
  position: relative;
  width: 100%;
  height: 250px;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 24px;
`;

const HostCard = styled(Card)`
  background: linear-gradient(135deg, #667eea10 0%, #764ba210 100%);
  border-radius: 12px;
  margin-bottom: 16px;
`;

const CommentCard = styled(Paper)`
  padding: 12px;
  border-radius: 12px;
  margin-bottom: 12px;
  border: 1px solid #f0f0f0;
`;

const AttendeeCard = styled(Box)`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #f5f5f5;
  }
`;

const EventDetailsModal: React.FC<EventDetailsModalProps> = ({
  open,
  onClose,
  event,
  onJoin,
  onShare,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [showAllAttendees, setShowAllAttendees] = useState(false);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Mock data
  const mockAttendees: Attendee[] = [
    {
      id: 'host1',
      name: event.host,
      avatar: event.hostAvatar,
      joinedAt: '2024-01-15T10:00:00',
      isHost: true,
      verified: true,
      points: 1500,
    },
    {
      id: 'user1',
      name: 'Sarah Ahmad',
      avatar: '/avatars/sarah.jpg',
      joinedAt: '2024-01-16T14:30:00',
      mutualFriends: ['Ahmad', 'Fatima'],
      points: 850,
    },
    {
      id: 'user2',
      name: 'Omar Hassan',
      avatar: '/avatars/omar.jpg',
      joinedAt: '2024-01-17T09:15:00',
      verified: true,
      points: 1200,
    },
    {
      id: 'user3',
      name: 'Aisyah Rahman',
      avatar: '/avatars/aisyah.jpg',
      joinedAt: '2024-01-17T16:45:00',
      mutualFriends: ['Mariam'],
      points: 650,
    },
    {
      id: 'user4',
      name: 'Ahmad Zain',
      avatar: '/avatars/ahmad.jpg',
      joinedAt: '2024-01-18T11:20:00',
      points: 750,
    },
  ];

  const mockComments: Comment[] = [
    {
      id: 'comment1',
      userId: 'user1',
      userName: 'Sarah Ahmad',
      userAvatar: '/avatars/sarah.jpg',
      content: 'This looks amazing! Can\'t wait to join. Will there be equipment provided for beginners?',
      timestamp: '2024-01-17T10:30:00',
      likes: 5,
      isLiked: false,
      replies: [
        {
          id: 'reply1',
          userId: 'host1',
          userName: event.host,
          userAvatar: event.hostAvatar,
          content: 'Yes! We provide all equipment. Just bring yourself and comfortable clothes.',
          timestamp: '2024-01-17T11:00:00',
          likes: 3,
          isHost: true,
        },
      ],
    },
    {
      id: 'comment2',
      userId: 'user2',
      userName: 'Omar Hassan',
      userAvatar: '/avatars/omar.jpg',
      content: 'Great initiative! Looking forward to meeting everyone.',
      timestamp: '2024-01-17T15:20:00',
      likes: 2,
      isLiked: true,
    },
  ];

  useEffect(() => {
    if (open) {
      setComments(mockComments);
    }
  }, [open]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleSaveEvent = () => {
    // Toggle save status
    event.userSaved = !event.userSaved;
  };

  const handleCommentSubmit = () => {
    if (!comment.trim()) return;

    const newComment: Comment = {
      id: `comment_${Date.now()}`,
      userId: 'current_user',
      userName: 'You',
      content: comment,
      timestamp: new Date().toISOString(),
      likes: 0,
      isLiked: false,
    };

    if (replyingTo) {
      // Add as reply
      setComments(prev =>
        prev.map(c =>
          c.id === replyingTo
            ? { ...c, replies: [...(c.replies || []), newComment] }
            : c
        )
      );
      setReplyingTo(null);
    } else {
      // Add as new comment
      setComments(prev => [newComment, ...prev]);
    }

    setComment('');
  };

  const handleLikeComment = (commentId: string, isReply?: boolean, parentId?: string) => {
    if (isReply && parentId) {
      setComments(prev =>
        prev.map(c =>
          c.id === parentId
            ? {
                ...c,
                replies: c.replies?.map(r =>
                  r.id === commentId
                    ? {
                        ...r,
                        likes: r.isLiked ? r.likes - 1 : r.likes + 1,
                        isLiked: !r.isLiked,
                      }
                    : r
                ),
              }
            : c
        )
      );
    } else {
      setComments(prev =>
        prev.map(c =>
          c.id === commentId
            ? {
                ...c,
                likes: c.isLiked ? c.likes - 1 : c.likes + 1,
                isLiked: !c.isLiked,
              }
            : c
        )
      );
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  const renderOverviewTab = () => (
    <Box>
      {/* Event Images */}
      <EventImage>
        <CardMedia
          component="img"
          height="250"
          image={event.image || '/placeholder-event.jpg'}
          alt={event.title}
          sx={{ borderRadius: '12px' }}
        />
        <Box
          position="absolute"
          top={16}
          right={16}
          display="flex"
          gap={1}
        >
          <IconButton
            onClick={handleSaveEvent}
            sx={{
              background: 'rgba(255,255,255,0.9)',
              '&:hover': { background: 'rgba(255,255,255,1)' },
            }}
          >
            {event.userSaved ? (
              <Bookmark color="primary" />
            ) : (
              <BookmarkBorder />
            )}
          </IconButton>
          <IconButton
            onClick={() => setAnchorEl(document.getElementById('more-options'))}
            id="more-options"
            sx={{
              background: 'rgba(255,255,255,0.9)',
              '&:hover': { background: 'rgba(255,255,255,1)' },
            }}
          >
            <MoreVert />
          </IconButton>
        </Box>
        {event.rating && (
          <Box
            position="absolute"
            bottom={16}
            left={16}
            sx={{
              background: 'rgba(0,0,0,0.7)',
              color: 'white',
              padding: '4px 12px',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
            }}
          >
            <Star sx={{ fontSize: 16 }} />
            <Typography variant="body2">{event.rating}</Typography>
          </Box>
        )}
      </EventImage>

      {/* Event Info */}
      <Box mb={3}>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <Chip label={event.category} color="primary" size="small" />
          {event.spotsLeft <= 5 && (
            <Chip label={`${event.spotsLeft} spots left!`} color="error" size="small" />
          )}
          {event.tags.slice(0, 2).map((tag) => (
            <Chip key={tag} label={tag} size="small" variant="outlined" />
          ))}
        </Box>

        <Typography variant="h5" gutterBottom fontWeight="bold">
          {event.title}
        </Typography>

        <Typography variant="body1" paragraph color="text.secondary">
          {event.description}
        </Typography>
      </Box>

      {/* Event Details */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={6}>
          <List>
            <ListItem disablePadding sx={{ mb: 1 }}>
              <ListItemIcon>
                <Schedule color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Date & Time"
                secondary={formatDate(event.dateTime)}
              />
            </ListItem>
            <ListItem disablePadding sx={{ mb: 1 }}>
              <ListItemIcon>
                <LocationOn color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Location"
                secondary={`${event.location} - ${event.address}`}
              />
            </ListItem>
            <ListItem disablePadding sx={{ mb: 1 }}>
              <ListItemIcon>
                <Group color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Capacity"
                secondary={`${event.currentParticipants}/${event.maxParticipants} joined`}
              />
            </ListItem>
          </List>
        </Grid>
        <Grid item xs={12} md={6}>
          <List>
            <ListItem disablePadding sx={{ mb: 1 }}>
              <ListItemIcon>
                <AttachMoney color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Price"
                secondary={event.price > 0 ? `RM ${event.price}` : 'Free'}
              />
            </ListItem>
            <ListItem disablePadding sx={{ mb: 1 }}>
              <ListItemIcon>
                <Star color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Points Reward"
                secondary={`+${event.points} BersePoints`}
              />
            </ListItem>
            <ListItem disablePadding sx={{ mb: 1 }}>
              <ListItemIcon>
                <Event color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Duration"
                secondary={`${event.duration} minutes`}
              />
            </ListItem>
          </List>
        </Grid>
      </Grid>

      {/* Progress Bar */}
      <Box mb={3}>
        <Box display="flex" justifyContent="space-between" mb={1}>
          <Typography variant="body2">Event Capacity</Typography>
          <Typography variant="body2">
            {Math.round((event.currentParticipants / event.maxParticipants) * 100)}%
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={(event.currentParticipants / event.maxParticipants) * 100}
          sx={{ height: 8, borderRadius: 4 }}
        />
      </Box>

      {/* Requirements & Info */}
      {(event.requirements || event.amenities?.length || event.accessibility?.length) && (
        <Box mb={3}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="subtitle1">Additional Information</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {event.requirements && (
                <Box mb={2}>
                  <Typography variant="subtitle2" gutterBottom>
                    Requirements
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {event.requirements}
                  </Typography>
                </Box>
              )}
              
              {event.amenities?.length && (
                <Box mb={2}>
                  <Typography variant="subtitle2" gutterBottom>
                    Amenities
                  </Typography>
                  <Box display="flex" gap={1} flexWrap="wrap">
                    {event.amenities.map((amenity) => (
                      <Chip key={amenity} label={amenity} size="small" />
                    ))}
                  </Box>
                </Box>
              )}

              {event.accessibility?.length && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Accessibility
                  </Typography>
                  <Box display="flex" gap={1} flexWrap="wrap">
                    {event.accessibility.map((item) => (
                      <Chip key={item} label={item} size="small" color="success" />
                    ))}
                  </Box>
                </Box>
              )}
            </AccordionDetails>
          </Accordion>
        </Box>
      )}
    </Box>
  );

  const renderAttendeesTab = () => (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="between" mb={3}>
        <Typography variant="h6">
          Attendees ({mockAttendees.length})
        </Typography>
        <AvatarGroup max={6}>
          {mockAttendees.slice(0, 6).map((attendee) => (
            <Avatar
              key={attendee.id}
              src={attendee.avatar}
              alt={attendee.name}
              sx={{ width: 32, height: 32 }}
            >
              {attendee.name[0]}
            </Avatar>
          ))}
        </AvatarGroup>
      </Box>

      {mockAttendees
        .slice(0, showAllAttendees ? undefined : 5)
        .map((attendee) => (
          <AttendeeCard key={attendee.id}>
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={
                attendee.isHost ? (
                  <Chip
                    label="Host"
                    size="small"
                    color="primary"
                    sx={{ height: 16, fontSize: '0.6rem' }}
                  />
                ) : attendee.verified ? (
                  <Verified sx={{ fontSize: 16, color: '#1976d2' }} />
                ) : null
              }
            >
              <Avatar src={attendee.avatar} sx={{ width: 48, height: 48 }}>
                {attendee.name[0]}
              </Avatar>
            </Badge>

            <Box flex={1}>
              <Typography variant="subtitle2" fontWeight="bold">
                {attendee.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Joined {formatTimeAgo(attendee.joinedAt)}
              </Typography>
              {attendee.mutualFriends && attendee.mutualFriends.length > 0 && (
                <Typography variant="caption" color="primary" display="block">
                  {attendee.mutualFriends.length} mutual friend{attendee.mutualFriends.length > 1 ? 's' : ''}
                </Typography>
              )}
            </Box>

            <Box textAlign="right">
              <Chip
                label={`${attendee.points} pts`}
                size="small"
                color="primary"
                variant="outlined"
              />
            </Box>
          </AttendeeCard>
        ))}

      {mockAttendees.length > 5 && (
        <Button
          onClick={() => setShowAllAttendees(!showAllAttendees)}
          sx={{ mt: 2 }}
        >
          {showAllAttendees ? 'Show Less' : `Show All ${mockAttendees.length} Attendees`}
        </Button>
      )}
    </Box>
  );

  const renderHostTab = () => (
    <Box>
      <HostCard elevation={0}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={
                event.hostVerified ? (
                  <Verified sx={{ fontSize: 20, color: '#1976d2' }} />
                ) : null
              }
            >
              <Avatar
                src={event.hostAvatar}
                sx={{ width: 64, height: 64 }}
              >
                {event.host[0]}
              </Avatar>
            </Badge>

            <Box flex={1}>
              <Typography variant="h6" fontWeight="bold">
                {event.host}
              </Typography>
              {event.hostRating && (
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <Rating
                    value={event.hostRating}
                    readOnly
                    size="small"
                    precision={0.1}
                  />
                  <Typography variant="body2" color="text.secondary">
                    ({event.hostRating})
                  </Typography>
                </Box>
              )}
              <Chip
                label="Experienced Host"
                size="small"
                color="success"
                variant="outlined"
              />
            </Box>
          </Box>

          {event.hostBio && (
            <Typography variant="body2" paragraph color="text.secondary">
              {event.hostBio}
            </Typography>
          )}

          {event.hostContact && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Contact Information
              </Typography>
              <List dense>
                {event.hostContact.phone && (
                  <ListItem disablePadding>
                    <ListItemIcon>
                      <Phone fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={event.hostContact.phone} />
                  </ListItem>
                )}
                {event.hostContact.email && (
                  <ListItem disablePadding>
                    <ListItemIcon>
                      <Email fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={event.hostContact.email} />
                  </ListItem>
                )}
                {event.hostContact.website && (
                  <ListItem disablePadding>
                    <ListItemIcon>
                      <Language fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={event.hostContact.website} />
                  </ListItem>
                )}
              </List>

              {event.hostContact.social && (
                <Box display="flex" gap={1} mt={2}>
                  {event.hostContact.social.instagram && (
                    <IconButton size="small">
                      <Instagram />
                    </IconButton>
                  )}
                  {event.hostContact.social.facebook && (
                    <IconButton size="small">
                      <Facebook />
                    </IconButton>
                  )}
                  {event.hostContact.social.twitter && (
                    <IconButton size="small">
                      <Twitter />
                    </IconButton>
                  )}
                </Box>
              )}
            </Box>
          )}
        </CardContent>
      </HostCard>

      {/* Policies */}
      <Box mt={3}>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="subtitle1">Policies & Guidelines</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {event.cancellationPolicy && (
              <Box mb={2}>
                <Typography variant="subtitle2" gutterBottom>
                  Cancellation Policy
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {event.cancellationPolicy}
                </Typography>
              </Box>
            )}
            
            {event.refundPolicy && (
              <Box mb={2}>
                <Typography variant="subtitle2" gutterBottom>
                  Refund Policy
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {event.refundPolicy}
                </Typography>
              </Box>
            )}

            {event.ageRestriction && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Age Restriction
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {event.ageRestriction}
                </Typography>
              </Box>
            )}
          </AccordionDetails>
        </Accordion>
      </Box>
    </Box>
  );

  const renderCommentsTab = () => (
    <Box>
      {/* Comment Input */}
      <Box mb={3}>
        <TextField
          fullWidth
          multiline
          rows={3}
          placeholder={replyingTo ? "Write a reply..." : "Share your thoughts about this event..."}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          inputProps={{ maxLength: 500 }}
        />
        <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
          <Typography variant="caption" color="text.secondary">
            {comment.length}/500 characters
          </Typography>
          <Box>
            {replyingTo && (
              <Button onClick={() => setReplyingTo(null)} sx={{ mr: 1 }}>
                Cancel
              </Button>
            )}
            <Button
              onClick={handleCommentSubmit}
              variant="contained"
              disabled={!comment.trim()}
              startIcon={<Send />}
            >
              {replyingTo ? 'Reply' : 'Comment'}
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Comments List */}
      <Box>
        {comments.map((comment) => (
          <CommentCard key={comment.id} elevation={0}>
            <Box display="flex" gap={2}>
              <Avatar src={comment.userAvatar} sx={{ width: 40, height: 40 }}>
                {comment.userName[0]}
              </Avatar>
              
              <Box flex={1}>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    {comment.userName}
                  </Typography>
                  {comment.isHost && (
                    <Chip label="Host" size="small" color="primary" sx={{ height: 18 }} />
                  )}
                  <Typography variant="caption" color="text.secondary">
                    {formatTimeAgo(comment.timestamp)}
                  </Typography>
                </Box>
                
                <Typography variant="body2" paragraph>
                  {comment.content}
                </Typography>
                
                <Box display="flex" alignItems="center" gap={2}>
                  <Button
                    size="small"
                    startIcon={
                      comment.isLiked ? (
                        <ThumbUp sx={{ fontSize: 16 }} />
                      ) : (
                        <ThumbUpOutlined sx={{ fontSize: 16 }} />
                      )
                    }
                    onClick={() => handleLikeComment(comment.id)}
                    sx={{ minWidth: 'auto', p: 0.5 }}
                  >
                    {comment.likes > 0 ? comment.likes : ''}
                  </Button>
                  
                  <Button
                    size="small"
                    startIcon={<Reply sx={{ fontSize: 16 }} />}
                    onClick={() => {
                      setReplyingTo(comment.id);
                      setComment(`@${comment.userName} `);
                    }}
                    sx={{ minWidth: 'auto', p: 0.5 }}
                  >
                    Reply
                  </Button>
                </Box>

                {/* Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <Box mt={2} pl={2} borderLeft="2px solid #f0f0f0">
                    {comment.replies.map((reply) => (
                      <Box key={reply.id} display="flex" gap={1.5} mb={2}>
                        <Avatar src={reply.userAvatar} sx={{ width: 32, height: 32 }}>
                          {reply.userName[0]}
                        </Avatar>
                        
                        <Box flex={1}>
                          <Box display="flex" alignItems="center" gap={1} mb={1}>
                            <Typography variant="body2" fontWeight="bold">
                              {reply.userName}
                            </Typography>
                            {reply.isHost && (
                              <Chip label="Host" size="small" color="primary" sx={{ height: 16, fontSize: '0.6rem' }} />
                            )}
                            <Typography variant="caption" color="text.secondary">
                              {formatTimeAgo(reply.timestamp)}
                            </Typography>
                          </Box>
                          
                          <Typography variant="body2" mb={1}>
                            {reply.content}
                          </Typography>
                          
                          <Button
                            size="small"
                            startIcon={
                              reply.isLiked ? (
                                <ThumbUp sx={{ fontSize: 14 }} />
                              ) : (
                                <ThumbUpOutlined sx={{ fontSize: 14 }} />
                              )
                            }
                            onClick={() => handleLikeComment(reply.id, true, comment.id)}
                            sx={{ minWidth: 'auto', p: 0.5, fontSize: '0.75rem' }}
                          >
                            {reply.likes || ''}
                          </Button>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            </Box>
          </CommentCard>
        ))}

        {comments.length === 0 && (
          <Box textAlign="center" py={4}>
            <ChatBubble sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="body1" gutterBottom>
              No comments yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Be the first to share your thoughts about this event!
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );

  return (
    <StyledDialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">Event Details</Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <IconButton onClick={onShare}>
              <Share />
            </IconButton>
            <IconButton onClick={onClose} size="small">
              <Close />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ px: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
          <Tab label="Overview" />
          <Tab label={`Attendees (${mockAttendees.length})`} />
          <Tab label="Host" />
          <Tab label={`Comments (${comments.length})`} />
        </Tabs>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 0 && renderOverviewTab()}
            {activeTab === 1 && renderAttendeesTab()}
            {activeTab === 2 && renderHostTab()}
            {activeTab === 3 && renderCommentsTab()}
          </motion.div>
        </AnimatePresence>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Box width="100%" display="flex" gap={2}>
          <Button
            fullWidth
            variant={event.userJoined ? 'outlined' : 'contained'}
            onClick={onJoin}
            disabled={event.spotsLeft === 0 && !event.userJoined}
            startIcon={event.userJoined ? <CheckCircle /> : null}
            sx={{ borderRadius: 3 }}
          >
            {event.userJoined
              ? 'Joined'
              : event.spotsLeft === 0
              ? 'Full'
              : event.price > 0
              ? `Join - RM ${event.price}`
              : 'Join Event'}
          </Button>
          
          <Button
            variant="outlined"
            onClick={onShare}
            startIcon={<Share />}
            sx={{ borderRadius: 3, minWidth: 'auto' }}
          >
            Share
          </Button>
        </Box>
      </DialogActions>

      {/* More Options Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => setAnchorEl(null)}>
          <ListItemIcon>
            <Report fontSize="small" />
          </ListItemIcon>
          <ListItemText>Report Event</ListItemText>
        </MenuItem>
      </Menu>
    </StyledDialog>
  );
};

export default EventDetailsModal;