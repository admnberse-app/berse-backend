import React, { useState, useEffect, useMemo, useRef, lazy, Suspense } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  IconButton,
  TextField,
  Chip,
  Paper,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Avatar,
  AvatarGroup,
  Badge,
  Tab,
  Tabs,
  InputAdornment,
  Skeleton,
  Alert,
  Snackbar,
  Fab,
  Tooltip,
  useTheme,
  useMediaQuery,
  CircularProgress,
} from '@mui/material';
import {
  ArrowBack,
  LocationOn,
  Add,
  Search,
  FilterList,
  Share,
  Bookmark,
  BookmarkBorder,
  Group,
  AccessTime,
  TrendingUp,
  AttachMoney,
  QrCodeScanner,
  Event,
  SportsSoccer,
  Groups,
  Flight,
  MenuBook,
  VolunteerActivism,
  Coffee,
  LocalOffer,
  CheckCircle,
  Star,
  NavigateNext,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { debounce } from 'lodash';

// Lazy load heavy components
const LocationSelectorModal = lazy(() => import('./components/LocationSelectorModal'));
const CreateEventModal = lazy(() => import('./components/CreateEventModal'));
const AdvancedFilterModal = lazy(() => import('./components/AdvancedFilterModal'));
const CafeScannerModal = lazy(() => import('./components/CafeScannerModal'));
const PaymentModal = lazy(() => import('./components/PaymentModal'));
const ShareEventModal = lazy(() => import('./components/ShareEventModal'));
const EventDetailsModal = lazy(() => import('./components/EventDetailsModal'));

// Types
interface Location {
  city: string;
  state?: string;
  country: string;
  code: string;
  coordinates?: { lat: number; lng: number };
}

interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  dateTime: string;
  duration: number;
  location: string;
  address: string;
  coordinates?: { lat: number; lng: number };
  host: string;
  hostId: string;
  hostAvatar?: string;
  maxParticipants: number;
  currentParticipants: number;
  price: number;
  points: number;
  image?: string;
  tags: string[];
  trending?: boolean;
  userJoined?: boolean;
  userSaved?: boolean;
  friendsGoing?: string[];
  rating?: number;
  spotsLeft: number;
  requirements?: string;
  amenities?: string[];
}

interface FilterOptions {
  categories: string[];
  priceRange: { min: number; max: number };
  distance: number;
  dates: { start: string; end: string };
  time: string[];
  eventSize: string;
  hostType: string[];
  sortBy: string;
}

// Styled Components
const BerseConnectContainer = styled(Container)`
  padding-top: 16px;
  padding-bottom: 80px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
`;

const HeaderSection = styled(Paper)`
  padding: 16px;
  border-radius: 0 0 16px 16px;
  background: white;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const SearchBar = styled(TextField)`
  .MuiOutlinedInput-root {
    border-radius: 24px;
    background: #f5f5f5;
  }
`;

const CategoryChip = styled(Chip)<{ active?: boolean }>`
  margin: 4px;
  cursor: pointer;
  background: ${props => props.active ? '#667eea' : 'white'};
  color: ${props => props.active ? 'white' : 'inherit'};
  border: 1px solid ${props => props.active ? '#667eea' : '#e0e0e0'};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }
`;

const SmartTab = styled(Tab)`
  text-transform: none;
  min-width: auto;
  padding: 8px 16px;
`;

const EventCard = styled(motion.div)`
  cursor: pointer;
  border-radius: 12px;
  overflow: hidden;
  background: white;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }
`;

const QuickFilterChip = styled(Chip)<{ active?: boolean }>`
  margin: 4px;
  cursor: pointer;
  background: ${props => props.active 
    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
    : 'white'};
  color: ${props => props.active ? 'white' : 'inherit'};
  
  &:hover {
    transform: scale(1.05);
  }
`;

const BerseConnectScreen: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // State Management
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeTab, setActiveTab] = useState(0);
  const [quickFilters, setQuickFilters] = useState<string[]>([]);
  const [currentLocation, setCurrentLocation] = useState<Location>({
    city: 'Kuala Lumpur',
    country: 'Malaysia',
    code: 'KL',
  });
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef<HTMLDivElement>(null);
  
  // Modal States
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showCafeScanner, setShowCafeScanner] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  
  // Filter State
  const [filters, setFilters] = useState<FilterOptions>({
    categories: [],
    priceRange: { min: 0, max: 1000 },
    distance: 50,
    dates: { start: '', end: '' },
    time: [],
    eventSize: 'any',
    hostType: [],
    sortBy: 'recommended',
  });
  
  // Snackbar State
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Categories
  const categories = [
    { id: 'All', name: 'All', icon: '🎯' },
    { id: 'Sports', name: 'Sports', icon: '⚽' },
    { id: 'Social', name: 'Social', icon: '👥' },
    { id: 'Trips', name: 'Trips', icon: '✈️' },
    { id: 'Study', name: 'Study', icon: '📚' },
    { id: 'Donation', name: 'Donation', icon: '💝' },
    { id: 'Volunteer', name: 'Volunteer', icon: '🤝' },
    { id: 'Cafe', name: 'Cafe', icon: '☕' },
  ];

  // Smart Tabs
  const smartTabs = ['For You', 'Today', 'This Week', 'Free'];

  // Mock Events Data
  const mockEvents: Event[] = [
    {
      id: '1',
      title: 'Weekend Badminton Session',
      description: 'Join us for a friendly badminton game this weekend!',
      category: 'Sports',
      dateTime: '2024-01-20T10:00:00',
      duration: 120,
      location: 'KLCC Sports Complex',
      address: 'Jalan Ampang, Kuala Lumpur',
      coordinates: { lat: 3.1578, lng: 101.7123 },
      host: 'Ahmad Rahman',
      hostId: 'host1',
      hostAvatar: '/avatars/host1.jpg',
      maxParticipants: 12,
      currentParticipants: 8,
      price: 25,
      points: 20,
      image: '/events/badminton.jpg',
      tags: ['Beginner Friendly', 'Equipment Provided'],
      trending: true,
      userJoined: false,
      userSaved: false,
      friendsGoing: ['Sarah', 'Omar'],
      rating: 4.8,
      spotsLeft: 4,
    },
    {
      id: '2',
      title: 'Islamic Finance Workshop',
      description: 'Learn about halal investment and financial planning',
      category: 'Study',
      dateTime: '2024-01-21T14:00:00',
      duration: 180,
      location: 'Islamic Banking Institute',
      address: 'Jalan Sultan Ismail, KL',
      host: 'Dr. Fatima Ali',
      hostId: 'host2',
      maxParticipants: 30,
      currentParticipants: 22,
      price: 0,
      points: 30,
      image: '/events/workshop.jpg',
      tags: ['Professional', 'Certificate'],
      userJoined: true,
      friendsGoing: ['Hassan', 'Aisha', 'Ibrahim'],
      rating: 4.9,
      spotsLeft: 8,
    },
    {
      id: '3',
      title: 'Cameron Highlands Day Trip',
      description: 'Escape the city heat with a refreshing trip to Cameron Highlands',
      category: 'Trips',
      dateTime: '2024-01-25T06:00:00',
      duration: 720,
      location: 'Cameron Highlands',
      address: 'Meeting Point: KL Sentral',
      host: 'Adventure Club Malaysia',
      hostId: 'host3',
      maxParticipants: 20,
      currentParticipants: 15,
      price: 150,
      points: 50,
      image: '/events/cameron.jpg',
      tags: ['Nature', 'Photography', 'Breakfast Included'],
      trending: true,
      friendsGoing: ['Mariam'],
      rating: 4.7,
      spotsLeft: 5,
    },
  ];

  // Load initial data
  useEffect(() => {
    loadEvents();
  }, [currentLocation, filters]);

  // Setup infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMoreEvents();
        }
      },
      { threshold: 0.1 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading]);

  // Filter events when dependencies change
  useEffect(() => {
    filterEvents();
  }, [searchQuery, activeCategory, activeTab, quickFilters, events]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setEvents(mockEvents);
      setFilteredEvents(mockEvents);
    } catch (error) {
      showSnackbar('Failed to load events', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadMoreEvents = async () => {
    if (page >= 3) {
      setHasMore(false);
      return;
    }
    
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate loading more events
      const moreEvents = mockEvents.map(e => ({
        ...e,
        id: `${e.id}_page${page + 1}`,
        title: `${e.title} (Page ${page + 1})`,
      }));
      
      setEvents(prev => [...prev, ...moreEvents]);
      setPage(prev => prev + 1);
    } catch (error) {
      showSnackbar('Failed to load more events', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Debounced search
  const debouncedSearch = useMemo(
    () => debounce((query: string) => {
      const filtered = events.filter(event =>
        event.title.toLowerCase().includes(query.toLowerCase()) ||
        event.description.toLowerCase().includes(query.toLowerCase()) ||
        event.location.toLowerCase().includes(query.toLowerCase()) ||
        event.host.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredEvents(filtered);
    }, 300),
    [events]
  );

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    debouncedSearch(query);
  };

  const handleCategorySelect = (category: string) => {
    setActiveCategory(category);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const toggleQuickFilter = (filter: string) => {
    setQuickFilters(prev =>
      prev.includes(filter)
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  const filterEvents = () => {
    let filtered = [...events];

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(query) ||
        event.description.toLowerCase().includes(query) ||
        event.location.toLowerCase().includes(query)
      );
    }

    // Apply category
    if (activeCategory !== 'All') {
      filtered = filtered.filter(event => event.category === activeCategory);
    }

    // Apply smart tab
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekEnd = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    switch (smartTabs[activeTab]) {
      case 'Today':
        filtered = filtered.filter(event => {
          const eventDate = new Date(event.dateTime);
          return eventDate.toDateString() === today.toDateString();
        });
        break;
      case 'This Week':
        filtered = filtered.filter(event => {
          const eventDate = new Date(event.dateTime);
          return eventDate >= today && eventDate <= weekEnd;
        });
        break;
      case 'Free':
        filtered = filtered.filter(event => event.price === 0);
        break;
      case 'For You':
        // Sort by recommendation score (mock)
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
    }

    // Apply quick filters
    if (quickFilters.includes('Friends Going')) {
      filtered = filtered.filter(event => event.friendsGoing && event.friendsGoing.length > 0);
    }
    if (quickFilters.includes('Trending')) {
      filtered = filtered.filter(event => event.trending === true);
    }
    if (quickFilters.includes('Free')) {
      filtered = filtered.filter(event => event.price === 0);
    }

    setFilteredEvents(filtered);
  };

  // Event Actions
  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setShowEventDetails(true);
  };

  const handleShareEvent = (event: Event, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedEvent(event);
    setShowShareModal(true);
  };

  const handleJoinEvent = async (event: Event, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (event.userJoined) {
      // Handle cancel
      handleCancelEvent(event);
      return;
    }

    if (event.price > 0) {
      // Show payment modal
      setSelectedEvent(event);
      setShowPaymentModal(true);
    } else {
      // Join free event
      try {
        setEvents(prev => prev.map(e =>
          e.id === event.id
            ? { ...e, userJoined: true, currentParticipants: e.currentParticipants + 1 }
            : e
        ));
        showSnackbar('Successfully joined event! +10 points', 'success');
      } catch (error) {
        showSnackbar('Failed to join event', 'error');
      }
    }
  };

  const handleCancelEvent = async (event: Event) => {
    // Show confirmation
    if (window.confirm('Are you sure you want to cancel your registration?')) {
      setEvents(prev => prev.map(e =>
        e.id === event.id
          ? { ...e, userJoined: false, currentParticipants: e.currentParticipants - 1 }
          : e
      ));
      showSnackbar('Event registration cancelled', 'info');
    }
  };

  const handleSaveEvent = (event: Event, e: React.MouseEvent) => {
    e.stopPropagation();
    setEvents(prev => prev.map(e =>
      e.id === event.id
        ? { ...e, userSaved: !e.userSaved }
        : e
    ));
    showSnackbar(
      event.userSaved ? 'Event removed from saved' : 'Event saved!',
      'success'
    );
  };

  // Navigation
  const handleBack = () => {
    navigate('/dashboard');
  };

  const handleLocationClick = () => {
    setShowLocationModal(true);
  };

  const handleCreateClick = () => {
    setShowCreateModal(true);
  };

  const handleFilterClick = () => {
    setShowFilterModal(true);
  };

  const handleCafeScanClick = () => {
    setShowCafeScanner(true);
  };

  // Helper Functions
  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setSnackbar({ open: true, message, severity });
  };

  const formatEventTime = (dateTime: string) => {
    const date = new Date(dateTime);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return `Today, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
    }
  };

  return (
    <BerseConnectContainer maxWidth="lg">
      {/* Header */}
      <HeaderSection elevation={0}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <IconButton onClick={handleBack} edge="start">
              <ArrowBack />
            </IconButton>
            <Typography variant="h6" fontWeight="bold">
              BerseConnect
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Chip
              icon={<LocationOn />}
              label={currentLocation.code}
              onClick={handleLocationClick}
              clickable
            />
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleCreateClick}
              sx={{
                borderRadius: 20,
                textTransform: 'none',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              }}
            >
              Create
            </Button>
          </Box>
        </Box>

        {/* Search Bar */}
        <Box display="flex" gap={1} mb={2}>
          <SearchBar
            fullWidth
            placeholder="Search events, activities, trips..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            size="small"
          />
          <IconButton
            onClick={handleFilterClick}
            sx={{
              background: filters.categories.length > 0 ? '#667eea' : '#f5f5f5',
              color: filters.categories.length > 0 ? 'white' : 'inherit',
            }}
          >
            <Badge badgeContent={filters.categories.length} color="error">
              <FilterList />
            </Badge>
          </IconButton>
        </Box>

        {/* Categories */}
        <Box sx={{ overflowX: 'auto', display: 'flex', gap: 1, mb: 2 }}>
          {categories.map((category) => (
            <CategoryChip
              key={category.id}
              label={`${category.icon} ${category.name}`}
              onClick={() => handleCategorySelect(category.id)}
              active={activeCategory === category.id}
            />
          ))}
        </Box>

        {/* Smart Tabs */}
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ mb: 2 }}
        >
          {smartTabs.map((tab) => (
            <SmartTab key={tab} label={tab} />
          ))}
        </Tabs>

        {/* Quick Filters */}
        <Box display="flex" gap={1} flexWrap="wrap">
          <QuickFilterChip
            icon={<Group />}
            label="Friends Going"
            onClick={() => toggleQuickFilter('Friends Going')}
            active={quickFilters.includes('Friends Going')}
          />
          <QuickFilterChip
            icon={<TrendingUp />}
            label="Trending"
            onClick={() => toggleQuickFilter('Trending')}
            active={quickFilters.includes('Trending')}
          />
          <QuickFilterChip
            icon={<LocalOffer />}
            label="Free"
            onClick={() => toggleQuickFilter('Free')}
            active={quickFilters.includes('Free')}
          />
        </Box>
      </HeaderSection>

      {/* Events Grid */}
      <Grid container spacing={2} sx={{ mt: 2 }}>
        {loading && filteredEvents.length === 0 ? (
          // Loading skeletons
          [1, 2, 3, 4].map((i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
            </Grid>
          ))
        ) : (
          filteredEvents.map((event) => (
            <Grid item xs={12} sm={6} md={4} key={event.id}>
              <EventCard
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleEventClick(event)}
              >
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  {event.image && (
                    <Box position="relative">
                      <CardMedia
                        component="img"
                        height="160"
                        image={event.image}
                        alt={event.title}
                      />
                      {event.trending && (
                        <Chip
                          label="Trending"
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 8,
                            left: 8,
                            background: 'linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)',
                            color: 'white',
                          }}
                        />
                      )}
                      <IconButton
                        size="small"
                        onClick={(e) => handleSaveEvent(event, e)}
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          background: 'rgba(255,255,255,0.9)',
                        }}
                      >
                        {event.userSaved ? (
                          <Bookmark color="primary" />
                        ) : (
                          <BookmarkBorder />
                        )}
                      </IconButton>
                    </Box>
                  )}
                  
                  <CardContent sx={{ flex: 1 }}>
                    <Typography variant="h6" gutterBottom noWrap>
                      {event.title}
                    </Typography>
                    
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <AccessTime sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary">
                        {formatEventTime(event.dateTime)}
                      </Typography>
                    </Box>
                    
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {event.location}
                      </Typography>
                    </Box>

                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <Avatar src={event.hostAvatar} sx={{ width: 24, height: 24 }} />
                      <Typography variant="caption" color="text.secondary">
                        by {event.host}
                      </Typography>
                    </Box>

                    {event.friendsGoing && event.friendsGoing.length > 0 && (
                      <Box display="flex" alignItems="center" gap={1} mb={2}>
                        <AvatarGroup max={3} sx={{ '& .MuiAvatar-root': { width: 20, height: 20 } }}>
                          {event.friendsGoing.map((friend, idx) => (
                            <Avatar key={idx} sx={{ width: 20, height: 20 }}>
                              {friend[0]}
                            </Avatar>
                          ))}
                        </AvatarGroup>
                        <Typography variant="caption" color="text.secondary">
                          {event.friendsGoing.join(', ')} going
                        </Typography>
                      </Box>
                    )}

                    <Box display="flex" gap={1} flexWrap="wrap">
                      <Chip
                        label={`${event.spotsLeft} spots left`}
                        size="small"
                        color={event.spotsLeft < 5 ? 'error' : 'default'}
                      />
                      {event.price > 0 ? (
                        <Chip
                          icon={<AttachMoney />}
                          label={`RM ${event.price}`}
                          size="small"
                          color="secondary"
                        />
                      ) : (
                        <Chip
                          label="Free"
                          size="small"
                          color="success"
                        />
                      )}
                      <Chip
                        icon={<Star />}
                        label={`+${event.points} pts`}
                        size="small"
                        color="primary"
                      />
                    </Box>
                  </CardContent>
                  
                  <CardActions sx={{ px: 2, pb: 2 }}>
                    <Button
                      fullWidth
                      variant={event.userJoined ? 'outlined' : 'contained'}
                      onClick={(e) => handleJoinEvent(event, e)}
                      disabled={event.spotsLeft === 0 && !event.userJoined}
                      startIcon={event.userJoined ? <CheckCircle /> : null}
                    >
                      {event.userJoined
                        ? 'Joined'
                        : event.spotsLeft === 0
                        ? 'Full'
                        : event.price > 0
                        ? `Pay RM ${event.price}`
                        : 'Join'}
                    </Button>
                    <IconButton onClick={(e) => handleShareEvent(event, e)}>
                      <Share />
                    </IconButton>
                  </CardActions>
                </Card>
              </EventCard>
            </Grid>
          ))
        )}
      </Grid>

      {/* Load More Indicator */}
      <Box ref={observerRef} sx={{ height: 100, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        {loading && hasMore && (
          <CircularProgress />
        )}
        {!hasMore && filteredEvents.length > 0 && (
          <Typography color="text.secondary">No more events</Typography>
        )}
      </Box>

      {/* Empty State */}
      {!loading && filteredEvents.length === 0 && (
        <Box textAlign="center" py={8}>
          <Event sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No events found
          </Typography>
          <Typography color="text.secondary" paragraph>
            Try adjusting your filters or search query
          </Typography>
          <Button
            variant="contained"
            onClick={() => {
              setSearchQuery('');
              setActiveCategory('All');
              setQuickFilters([]);
            }}
          >
            Clear Filters
          </Button>
        </Box>
      )}

      {/* Floating Cafe Scanner Button */}
      {activeCategory === 'Cafe' && (
        <Fab
          color="primary"
          sx={{
            position: 'fixed',
            bottom: 80,
            right: 16,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          }}
          onClick={handleCafeScanClick}
        >
          <QrCodeScanner />
        </Fab>
      )}

      {/* Modals */}
      <Suspense fallback={null}>
        {showLocationModal && (
          <LocationSelectorModal
            open={showLocationModal}
            onClose={() => setShowLocationModal(false)}
            currentLocation={currentLocation}
            onSelectLocation={(location) => {
              setCurrentLocation(location);
              setShowLocationModal(false);
              loadEvents();
              showSnackbar(`Location changed to ${location.city}`, 'success');
            }}
          />
        )}

        {showCreateModal && (
          <CreateEventModal
            open={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onCreateEvent={(eventData) => {
              // Handle event creation
              showSnackbar('Event created successfully!', 'success');
              setShowCreateModal(false);
            }}
            currentLocation={currentLocation}
          />
        )}

        {showFilterModal && (
          <AdvancedFilterModal
            open={showFilterModal}
            onClose={() => setShowFilterModal(false)}
            filters={filters}
            onApplyFilters={(newFilters) => {
              setFilters(newFilters);
              setShowFilterModal(false);
              filterEvents();
            }}
          />
        )}

        {showCafeScanner && (
          <CafeScannerModal
            open={showCafeScanner}
            onClose={() => setShowCafeScanner(false)}
            onScanComplete={(cafeData) => {
              // Handle cafe scan
              showSnackbar('Cafe check-in successful!', 'success');
              setShowCafeScanner(false);
            }}
          />
        )}

        {showPaymentModal && selectedEvent && (
          <PaymentModal
            open={showPaymentModal}
            onClose={() => setShowPaymentModal(false)}
            event={selectedEvent}
            onPaymentSuccess={() => {
              setEvents(prev => prev.map(e =>
                e.id === selectedEvent.id
                  ? { ...e, userJoined: true, currentParticipants: e.currentParticipants + 1 }
                  : e
              ));
              showSnackbar('Payment successful! You\'re registered for the event.', 'success');
              setShowPaymentModal(false);
            }}
          />
        )}

        {showShareModal && selectedEvent && (
          <ShareEventModal
            open={showShareModal}
            onClose={() => setShowShareModal(false)}
            event={selectedEvent}
            onShare={(platform) => {
              showSnackbar(`Event shared to ${platform}!`, 'success');
              setShowShareModal(false);
            }}
          />
        )}

        {showEventDetails && selectedEvent && (
          <EventDetailsModal
            open={showEventDetails}
            onClose={() => setShowEventDetails(false)}
            event={selectedEvent}
            onJoin={() => handleJoinEvent(selectedEvent, {} as React.MouseEvent)}
            onShare={() => setShowShareModal(true)}
          />
        )}
      </Suspense>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </BerseConnectContainer>
  );
};

export default BerseConnectScreen;