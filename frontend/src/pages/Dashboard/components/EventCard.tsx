import React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Box,
  Typography,
  Chip,
  Button,
  IconButton,
  Avatar,
  AvatarGroup,
  Tooltip,
} from '@mui/material';
import {
  AccessTime,
  LocationOn,
  Group,
  Share,
  Bookmark,
  BookmarkBorder,
  Star,
} from '@mui/icons-material';
import styled from 'styled-components';
import { motion } from 'framer-motion';

interface EventCardProps {
  event: {
    id: string;
    title: string;
    time: string;
    location: string;
    category: string;
    spotsLeft: number;
    points: number;
    price?: number;
    joined: boolean;
    saved?: boolean;
    friends: string[];
    image?: string;
    rating?: number;
    host?: string;
  };
  onJoin: (eventId: string, isPaid: boolean) => void;
  onShare: (event: any) => void;
  onSave?: (eventId: string) => void;
}

const StyledCard = styled(motion.div)`
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  }
`;

const CategoryChip = styled(Chip)<{ category: string }>`
  background: ${props => {
    switch (props.category.toLowerCase()) {
      case 'religious': return '#4CAF50';
      case 'social': return '#2196F3';
      case 'sports': return '#FF9800';
      case 'education': return '#9C27B0';
      default: return '#757575';
    }
  }};
  color: white;
  font-weight: bold;
`;

const EventCard: React.FC<EventCardProps> = ({
  event,
  onJoin,
  onShare,
  onSave,
}) => {
  const [saved, setSaved] = React.useState(event.saved || false);

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSaved(!saved);
    if (onSave) {
      onSave(event.id);
    }
  };

  const handleJoin = (e: React.MouseEvent) => {
    e.stopPropagation();
    onJoin(event.id, !!event.price);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    onShare(event);
  };

  return (
    <StyledCard whileHover={{ scale: 1.02 }}>
      <Card sx={{ borderRadius: 3 }}>
        {event.image && (
          <Box position="relative">
            <CardMedia
              component="img"
              height="140"
              image={event.image}
              alt={event.title}
            />
            <Box
              position="absolute"
              top={8}
              left={8}
              display="flex"
              gap={1}
            >
              <CategoryChip
                label={event.category}
                size="small"
                category={event.category}
              />
              {event.spotsLeft < 5 && (
                <Chip
                  label={`${event.spotsLeft} spots left`}
                  size="small"
                  color="error"
                  sx={{ bgcolor: 'error.main', color: 'white' }}
                />
              )}
            </Box>
            <IconButton
              size="small"
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                bgcolor: 'rgba(255,255,255,0.9)',
                '&:hover': { bgcolor: 'rgba(255,255,255,1)' },
              }}
              onClick={handleSave}
            >
              {saved ? <Bookmark color="primary" /> : <BookmarkBorder />}
            </IconButton>
          </Box>
        )}
        
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            {event.title}
          </Typography>
          
          {event.host && (
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Hosted by {event.host}
            </Typography>
          )}
          
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <Box display="flex" alignItems="center" gap={0.5}>
              <AccessTime sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                {event.time}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={0.5}>
              <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                {event.location}
              </Typography>
            </Box>
          </Box>

          {event.friends.length > 0 && (
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <AvatarGroup max={3} sx={{ '& .MuiAvatar-root': { width: 24, height: 24 } }}>
                {event.friends.map((friend, index) => (
                  <Avatar key={index} alt={friend} src={`/avatars/${index + 1}.jpg`} />
                ))}
              </AvatarGroup>
              <Typography variant="caption" color="text.secondary">
                {event.friends.length === 1
                  ? `${event.friends[0]} is going`
                  : event.friends.length === 2
                  ? `${event.friends.join(' and ')} are going`
                  : `${event.friends[0]}, ${event.friends[1]} and ${event.friends.length - 2} others are going`}
              </Typography>
            </Box>
          )}

          <Box display="flex" gap={1} mb={2}>
            <Chip
              icon={<Star />}
              label={`+${event.points} pts`}
              size="small"
              color="primary"
            />
            {event.price && (
              <Chip
                label={`$${event.price}`}
                size="small"
                color="secondary"
              />
            )}
            {event.rating && (
              <Chip
                icon={<Star />}
                label={event.rating.toFixed(1)}
                size="small"
              />
            )}
          </Box>

          <Box display="flex" gap={1}>
            <Button
              variant={event.joined ? 'outlined' : 'contained'}
              size="small"
              fullWidth
              onClick={handleJoin}
              disabled={event.joined || event.spotsLeft === 0}
            >
              {event.joined ? 'Joined' : event.spotsLeft === 0 ? 'Full' : 'Join'}
            </Button>
            <IconButton size="small" onClick={handleShare}>
              <Share />
            </IconButton>
          </Box>
        </CardContent>
      </Card>
    </StyledCard>
  );
};

export default EventCard;