import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  IconButton,
  TextField,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  Chip,
  InputAdornment,
  CircularProgress,
  Alert,
  Divider,
  Tab,
  Tabs,
} from '@mui/material';
import {
  Close,
  LocationOn,
  MyLocation,
  Search,
  TrendingUp,
  Public,
  Explore,
  CheckCircle,
} from '@mui/icons-material';
import styled from 'styled-components';
import { motion } from 'framer-motion';

interface Location {
  city: string;
  state?: string;
  country: string;
  code: string;
  coordinates?: { lat: number; lng: number };
  distance?: number;
}

interface LocationSelectorModalProps {
  open: boolean;
  onClose: () => void;
  currentLocation: Location;
  onSelectLocation: (location: Location) => void;
}

const StyledDialog = styled(Dialog)`
  .MuiDialog-paper {
    border-radius: 16px;
    max-width: 500px;
    width: 100%;
    max-height: 80vh;
  }
`;

const LocationCard = styled(motion.div)<{ selected?: boolean }>`
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  background: ${props => props.selected ? '#e3f2fd' : 'transparent'};
  border: 1px solid ${props => props.selected ? '#2196f3' : '#e0e0e0'};
  margin-bottom: 8px;
  transition: all 0.3s ease;
  
  &:hover {
    background: #f5f5f5;
    transform: translateX(4px);
  }
`;

const TabPanel = styled(Box)`
  padding: 16px 0;
`;

const LocationSelectorModal: React.FC<LocationSelectorModalProps> = ({
  open,
  onClose,
  currentLocation,
  onSelectLocation,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Predefined locations
  const popularLocations: Location[] = [
    { city: 'Kuala Lumpur', country: 'Malaysia', code: 'KL' },
    { city: 'Petaling Jaya', state: 'Selangor', country: 'Malaysia', code: 'PJ' },
    { city: 'Shah Alam', state: 'Selangor', country: 'Malaysia', code: 'SA' },
    { city: 'Penang', country: 'Malaysia', code: 'PEN' },
    { city: 'Johor Bahru', country: 'Malaysia', code: 'JB' },
    { city: 'Ipoh', state: 'Perak', country: 'Malaysia', code: 'IPH' },
    { city: 'Malacca', country: 'Malaysia', code: 'MLK' },
    { city: 'Kota Kinabalu', state: 'Sabah', country: 'Malaysia', code: 'KK' },
  ];

  const internationalCities: Location[] = [
    { city: 'Singapore', country: 'Singapore', code: 'SG' },
    { city: 'Jakarta', country: 'Indonesia', code: 'JKT' },
    { city: 'Bangkok', country: 'Thailand', code: 'BKK' },
    { city: 'Dubai', country: 'UAE', code: 'DXB' },
    { city: 'London', country: 'United Kingdom', code: 'LON' },
    { city: 'Istanbul', country: 'Turkey', code: 'IST' },
    { city: 'Cairo', country: 'Egypt', code: 'CAI' },
    { city: 'Mecca', country: 'Saudi Arabia', code: 'MCA' },
  ];

  const [nearbyLocations, setNearbyLocations] = useState<Location[]>([]);

  useEffect(() => {
    if (searchQuery.length > 1) {
      searchLocations(searchQuery);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const searchLocations = (query: string) => {
    const q = query.toLowerCase();
    const allLocations = [...popularLocations, ...internationalCities];
    const results = allLocations.filter(loc =>
      loc.city.toLowerCase().includes(q) ||
      loc.country.toLowerCase().includes(q) ||
      (loc.state && loc.state.toLowerCase().includes(q))
    );
    setSearchResults(results);
  };

  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setGettingLocation(true);
    setError(null);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        });
      });

      const { latitude, longitude } = position.coords;

      // Simulate reverse geocoding
      const detectedLocation: Location = {
        city: 'Current Location',
        country: 'Malaysia',
        code: 'CUR',
        coordinates: { lat: latitude, lng: longitude },
      };

      // Find nearby cities
      const nearby = popularLocations.map(loc => ({
        ...loc,
        distance: calculateDistance(latitude, longitude, 
          loc.coordinates?.lat || 3.139, 
          loc.coordinates?.lng || 101.6869
        ),
      })).sort((a, b) => (a.distance || 0) - (b.distance || 0));

      setNearbyLocations(nearby.slice(0, 3));
      
      // Select the nearest city
      if (nearby.length > 0) {
        onSelectLocation(nearby[0]);
      }
    } catch (error: any) {
      if (error.code === 1) {
        setError('Location permission denied. Please enable location access.');
      } else if (error.code === 2) {
        setError('Location unavailable. Please try again.');
      } else if (error.code === 3) {
        setError('Location request timed out. Please try again.');
      } else {
        setError('Failed to get your location. Please try again.');
      }
    } finally {
      setGettingLocation(false);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return Math.round(d);
  };

  const deg2rad = (deg: number): number => {
    return deg * (Math.PI / 180);
  };

  const handleLocationSelect = (location: Location) => {
    onSelectLocation(location);
  };

  const formatLocation = (location: Location): string => {
    if (location.state) {
      return `${location.city}, ${location.state}, ${location.country}`;
    }
    return `${location.city}, ${location.country}`;
  };

  return (
    <StyledDialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <LocationOn color="primary" />
            <Typography variant="h6">Select Location</Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* Current Location Display */}
        <Box
          sx={{
            p: 2,
            mb: 2,
            borderRadius: 2,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
          }}
        >
          <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>
            Current Location
          </Typography>
          <Typography variant="h6">
            {formatLocation(currentLocation)}
          </Typography>
        </Box>

        {/* Get Current Location Button */}
        <Button
          fullWidth
          variant="outlined"
          startIcon={gettingLocation ? <CircularProgress size={20} /> : <MyLocation />}
          onClick={getCurrentLocation}
          disabled={gettingLocation}
          sx={{ mb: 2 }}
        >
          {gettingLocation ? 'Getting location...' : 'Use My Current Location'}
        </Button>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Search Bar */}
        <TextField
          fullWidth
          placeholder="Search city or country..."
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
        />

        {/* Location Tabs */}
        <Tabs
          value={activeTab}
          onChange={(e, v) => setActiveTab(v)}
          sx={{ mb: 2 }}
        >
          <Tab label="Popular" icon={<TrendingUp />} iconPosition="start" />
          <Tab label="International" icon={<Public />} iconPosition="start" />
          {nearbyLocations.length > 0 && (
            <Tab label="Nearby" icon={<Explore />} iconPosition="start" />
          )}
        </Tabs>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <TabPanel>
            <Typography variant="subtitle2" gutterBottom>
              Search Results
            </Typography>
            <List>
              {searchResults.map((location, index) => (
                <LocationCard
                  key={`${location.code}-${index}`}
                  selected={location.code === currentLocation.code}
                  onClick={() => handleLocationSelect(location)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box display="flex" alignItems="center" gap={2}>
                      <LocationOn color="action" />
                      <Box>
                        <Typography variant="subtitle2">
                          {location.city}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {location.state ? `${location.state}, ` : ''}{location.country}
                        </Typography>
                      </Box>
                    </Box>
                    {location.code === currentLocation.code && (
                      <CheckCircle color="primary" />
                    )}
                  </Box>
                </LocationCard>
              ))}
            </List>
          </TabPanel>
        )}

        {/* Tab Panels */}
        {searchResults.length === 0 && (
          <>
            {/* Popular Locations */}
            {activeTab === 0 && (
              <TabPanel>
                <List>
                  {popularLocations.map((location, index) => (
                    <LocationCard
                      key={`${location.code}-${index}`}
                      selected={location.code === currentLocation.code}
                      onClick={() => handleLocationSelect(location)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box display="flex" alignItems="center" gap={2}>
                          <LocationOn color="action" />
                          <Box>
                            <Typography variant="subtitle2">
                              {location.city}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {location.state ? `${location.state}, ` : ''}{location.country}
                            </Typography>
                          </Box>
                        </Box>
                        {location.code === currentLocation.code && (
                          <CheckCircle color="primary" />
                        )}
                      </Box>
                    </LocationCard>
                  ))}
                </List>
              </TabPanel>
            )}

            {/* International Cities */}
            {activeTab === 1 && (
              <TabPanel>
                <List>
                  {internationalCities.map((location, index) => (
                    <LocationCard
                      key={`${location.code}-${index}`}
                      selected={location.code === currentLocation.code}
                      onClick={() => handleLocationSelect(location)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box display="flex" alignItems="center" gap={2}>
                          <LocationOn color="action" />
                          <Box>
                            <Typography variant="subtitle2">
                              {location.city}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {location.country}
                            </Typography>
                          </Box>
                        </Box>
                        {location.code === currentLocation.code && (
                          <CheckCircle color="primary" />
                        )}
                      </Box>
                    </LocationCard>
                  ))}
                </List>
              </TabPanel>
            )}

            {/* Nearby Locations */}
            {activeTab === 2 && nearbyLocations.length > 0 && (
              <TabPanel>
                <Typography variant="subtitle2" gutterBottom>
                  Cities Near You
                </Typography>
                <List>
                  {nearbyLocations.map((location, index) => (
                    <LocationCard
                      key={`${location.code}-${index}`}
                      selected={location.code === currentLocation.code}
                      onClick={() => handleLocationSelect(location)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box display="flex" alignItems="center" gap={2}>
                          <LocationOn color="action" />
                          <Box>
                            <Typography variant="subtitle2">
                              {location.city}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {location.state ? `${location.state}, ` : ''}{location.country}
                            </Typography>
                          </Box>
                        </Box>
                        <Box display="flex" alignItems="center" gap={1}>
                          {location.distance && (
                            <Chip
                              label={`${location.distance} km`}
                              size="small"
                              variant="outlined"
                            />
                          )}
                          {location.code === currentLocation.code && (
                            <CheckCircle color="primary" />
                          )}
                        </Box>
                      </Box>
                    </LocationCard>
                  ))}
                </List>
              </TabPanel>
            )}
          </>
        )}
      </DialogContent>
    </StyledDialog>
  );
};

export default LocationSelectorModal;