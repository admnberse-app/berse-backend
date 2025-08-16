import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  Slider,
  Chip,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  TextField,
  Divider,
  Badge,
  Grid,
  ToggleButton,
  ToggleButtonGroup,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Close,
  FilterList,
  AttachMoney,
  LocationOn,
  Category,
  AccessTime,
  Group,
  Sort,
  ExpandMore,
  Clear,
  CheckCircle,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers';
import styled from 'styled-components';

interface FilterOptions {
  categories: string[];
  priceRange: { min: number; max: number };
  distance: number;
  dates: { start: string; end: string };
  time: string[];
  eventSize: string;
  hostType: string[];
  amenities: string[];
  accessibility: string[];
  sortBy: string;
}

interface AdvancedFilterModalProps {
  open: boolean;
  onClose: () => void;
  filters: FilterOptions;
  onApplyFilters: (filters: FilterOptions) => void;
}

const StyledDialog = styled(Dialog)`
  .MuiDialog-paper {
    border-radius: 16px;
    max-width: 600px;
    width: 100%;
    max-height: 90vh;
  }
`;

const FilterSection = styled(Box)`
  margin-bottom: 24px;
`;

const FilterChip = styled(Chip)<{ active?: boolean }>`
  margin: 4px;
  cursor: pointer;
  background: ${props => props.active ? '#667eea' : 'white'};
  color: ${props => props.active ? 'white' : 'inherit'};
  border: 1px solid ${props => props.active ? '#667eea' : '#e0e0e0'};
  
  &:hover {
    background: ${props => props.active ? '#5a6fd8' : '#f5f5f5'};
  }
`;

const PricePresetButton = styled(Button)`
  text-transform: none;
  margin: 4px;
`;

const AdvancedFilterModal: React.FC<AdvancedFilterModalProps> = ({
  open,
  onClose,
  filters,
  onApplyFilters,
}) => {
  const [tempFilters, setTempFilters] = useState<FilterOptions>(filters);
  const [expandedSection, setExpandedSection] = useState<string | false>('categories');

  const categories = [
    { id: 'Sports', name: 'Sports', icon: '⚽' },
    { id: 'Social', name: 'Social', icon: '👥' },
    { id: 'Trips', name: 'Trips', icon: '✈️' },
    { id: 'Study', name: 'Study', icon: '📚' },
    { id: 'Donation', name: 'Donation', icon: '💝' },
    { id: 'Volunteer', name: 'Volunteer', icon: '🤝' },
    { id: 'Cafe', name: 'Cafe', icon: '☕' },
  ];

  const timeOfDay = [
    { id: 'Morning', label: 'Morning', time: '6 AM - 12 PM' },
    { id: 'Afternoon', label: 'Afternoon', time: '12 PM - 5 PM' },
    { id: 'Evening', label: 'Evening', time: '5 PM - 9 PM' },
    { id: 'Night', label: 'Night', time: '9 PM - 6 AM' },
  ];

  const eventSizes = [
    { id: 'small', label: 'Small (2-10)', range: [2, 10] },
    { id: 'medium', label: 'Medium (11-30)', range: [11, 30] },
    { id: 'large', label: 'Large (31-100)', range: [31, 100] },
    { id: 'xlarge', label: 'Extra Large (100+)', range: [100, 1000] },
  ];

  const hostTypes = [
    { id: 'verified', label: 'Verified Hosts' },
    { id: 'organizations', label: 'Organizations' },
    { id: 'individuals', label: 'Individuals' },
    { id: 'businesses', label: 'Businesses' },
  ];

  const amenitiesList = [
    { id: 'parking', label: 'Parking Available' },
    { id: 'food', label: 'Food Provided' },
    { id: 'equipment', label: 'Equipment Provided' },
    { id: 'wifi', label: 'WiFi Available' },
    { id: 'aircon', label: 'Air Conditioned' },
    { id: 'outdoor', label: 'Outdoor' },
    { id: 'indoor', label: 'Indoor' },
  ];

  const accessibilityOptions = [
    { id: 'wheelchair', label: 'Wheelchair Accessible' },
    { id: 'family', label: 'Family Friendly' },
    { id: 'petfriendly', label: 'Pet Friendly' },
    { id: 'beginners', label: 'Beginners Welcome' },
  ];

  const sortOptions = [
    { id: 'recommended', label: 'Recommended' },
    { id: 'date_asc', label: 'Date (Earliest First)' },
    { id: 'date_desc', label: 'Date (Latest First)' },
    { id: 'price_asc', label: 'Price (Low to High)' },
    { id: 'price_desc', label: 'Price (High to Low)' },
    { id: 'distance', label: 'Distance (Nearest First)' },
    { id: 'popular', label: 'Most Popular' },
  ];

  const handleCategoryToggle = (categoryId: string) => {
    setTempFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter(c => c !== categoryId)
        : [...prev.categories, categoryId]
    }));
  };

  const handleTimeToggle = (timeId: string) => {
    setTempFilters(prev => ({
      ...prev,
      time: prev.time.includes(timeId)
        ? prev.time.filter(t => t !== timeId)
        : [...prev.time, timeId]
    }));
  };

  const handleHostTypeToggle = (hostId: string) => {
    setTempFilters(prev => ({
      ...prev,
      hostType: prev.hostType.includes(hostId)
        ? prev.hostType.filter(h => h !== hostId)
        : [...prev.hostType, hostId]
    }));
  };

  const handleAmenityToggle = (amenityId: string) => {
    setTempFilters(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenityId)
        ? prev.amenities.filter(a => a !== amenityId)
        : [...prev.amenities, amenityId]
    }));
  };

  const handleAccessibilityToggle = (accessId: string) => {
    setTempFilters(prev => ({
      ...prev,
      accessibility: prev.accessibility.includes(accessId)
        ? prev.accessibility.filter(a => a !== accessId)
        : [...prev.accessibility, accessId]
    }));
  };

  const handlePriceChange = (event: Event, newValue: number | number[]) => {
    const values = newValue as number[];
    setTempFilters(prev => ({
      ...prev,
      priceRange: { min: values[0], max: values[1] }
    }));
  };

  const handleDistanceChange = (event: Event, newValue: number | number[]) => {
    setTempFilters(prev => ({
      ...prev,
      distance: newValue as number
    }));
  };

  const setPricePreset = (min: number, max: number) => {
    setTempFilters(prev => ({
      ...prev,
      priceRange: { min, max }
    }));
  };

  const setDatePreset = (preset: string) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const weekEnd = new Date(today);
    weekEnd.setDate(weekEnd.getDate() + 7);
    const monthEnd = new Date(today);
    monthEnd.setMonth(monthEnd.getMonth() + 1);

    switch (preset) {
      case 'today':
        setTempFilters(prev => ({
          ...prev,
          dates: {
            start: today.toISOString().split('T')[0],
            end: today.toISOString().split('T')[0]
          }
        }));
        break;
      case 'tomorrow':
        setTempFilters(prev => ({
          ...prev,
          dates: {
            start: tomorrow.toISOString().split('T')[0],
            end: tomorrow.toISOString().split('T')[0]
          }
        }));
        break;
      case 'week':
        setTempFilters(prev => ({
          ...prev,
          dates: {
            start: today.toISOString().split('T')[0],
            end: weekEnd.toISOString().split('T')[0]
          }
        }));
        break;
      case 'month':
        setTempFilters(prev => ({
          ...prev,
          dates: {
            start: today.toISOString().split('T')[0],
            end: monthEnd.toISOString().split('T')[0]
          }
        }));
        break;
    }
  };

  const clearAllFilters = () => {
    const defaultFilters: FilterOptions = {
      categories: [],
      priceRange: { min: 0, max: 1000 },
      distance: 50,
      dates: { start: '', end: '' },
      time: [],
      eventSize: 'any',
      hostType: [],
      amenities: [],
      accessibility: [],
      sortBy: 'recommended'
    };
    setTempFilters(defaultFilters);
  };

  const getActiveFilterCount = (): number => {
    let count = 0;
    if (tempFilters.categories.length > 0) count++;
    if (tempFilters.priceRange.min > 0 || tempFilters.priceRange.max < 1000) count++;
    if (tempFilters.distance < 50) count++;
    if (tempFilters.dates.start || tempFilters.dates.end) count++;
    if (tempFilters.time.length > 0) count++;
    if (tempFilters.eventSize !== 'any') count++;
    if (tempFilters.hostType.length > 0) count++;
    if (tempFilters.amenities.length > 0) count++;
    if (tempFilters.accessibility.length > 0) count++;
    if (tempFilters.sortBy !== 'recommended') count++;
    return count;
  };

  const handleApply = () => {
    onApplyFilters(tempFilters);
  };

  const handleAccordionChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedSection(isExpanded ? panel : false);
  };

  return (
    <StyledDialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <FilterList color="primary" />
            <Typography variant="h6">Filters</Typography>
            {getActiveFilterCount() > 0 && (
              <Badge badgeContent={getActiveFilterCount()} color="primary" />
            )}
          </Box>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ px: 3 }}>
        {/* Categories */}
        <Accordion expanded={expandedSection === 'categories'} onChange={handleAccordionChange('categories')}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box display="flex" alignItems="center" gap={1} width="100%">
              <Category />
              <Typography>Categories</Typography>
              {tempFilters.categories.length > 0 && (
                <Chip label={tempFilters.categories.length} size="small" sx={{ ml: 'auto', mr: 2 }} />
              )}
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box display="flex" flexWrap="wrap">
              {categories.map((category) => (
                <FilterChip
                  key={category.id}
                  label={`${category.icon} ${category.name}`}
                  onClick={() => handleCategoryToggle(category.id)}
                  active={tempFilters.categories.includes(category.id)}
                  onDelete={tempFilters.categories.includes(category.id) ? () => handleCategoryToggle(category.id) : undefined}
                />
              ))}
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Price Range */}
        <Accordion expanded={expandedSection === 'price'} onChange={handleAccordionChange('price')}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box display="flex" alignItems="center" gap={1}>
              <AttachMoney />
              <Typography>Price Range</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box>
              <Slider
                value={[tempFilters.priceRange.min, tempFilters.priceRange.max]}
                onChange={handlePriceChange}
                valueLabelDisplay="on"
                min={0}
                max={1000}
                marks={[
                  { value: 0, label: 'Free' },
                  { value: 250, label: 'RM 250' },
                  { value: 500, label: 'RM 500' },
                  { value: 1000, label: 'RM 1000+' },
                ]}
              />
              <Box display="flex" justifyContent="space-between" mt={2}>
                <Typography variant="body2">
                  RM {tempFilters.priceRange.min}
                </Typography>
                <Typography variant="body2">
                  RM {tempFilters.priceRange.max}+
                </Typography>
              </Box>
              <Box display="flex" flexWrap="wrap" mt={2}>
                <PricePresetButton size="small" onClick={() => setPricePreset(0, 0)}>
                  Free Only
                </PricePresetButton>
                <PricePresetButton size="small" onClick={() => setPricePreset(0, 50)}>
                  Under RM 50
                </PricePresetButton>
                <PricePresetButton size="small" onClick={() => setPricePreset(0, 100)}>
                  Under RM 100
                </PricePresetButton>
                <PricePresetButton size="small" onClick={() => setPricePreset(100, 1000)}>
                  RM 100+
                </PricePresetButton>
              </Box>
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Distance */}
        <Accordion expanded={expandedSection === 'distance'} onChange={handleAccordionChange('distance')}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box display="flex" alignItems="center" gap={1}>
              <LocationOn />
              <Typography>Distance</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box>
              <Slider
                value={tempFilters.distance}
                onChange={handleDistanceChange}
                valueLabelDisplay="on"
                min={1}
                max={100}
                marks={[
                  { value: 1, label: '1 km' },
                  { value: 25, label: '25 km' },
                  { value: 50, label: '50 km' },
                  { value: 100, label: '100 km' },
                ]}
              />
              <Typography variant="body2" textAlign="center" mt={2}>
                Within {tempFilters.distance} km from your location
              </Typography>
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Date */}
        <Accordion expanded={expandedSection === 'date'} onChange={handleAccordionChange('date')}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box display="flex" alignItems="center" gap={1}>
              <AccessTime />
              <Typography>Date & Time</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box>
              <Box display="flex" gap={1} mb={2}>
                <Button size="small" variant="outlined" onClick={() => setDatePreset('today')}>
                  Today
                </Button>
                <Button size="small" variant="outlined" onClick={() => setDatePreset('tomorrow')}>
                  Tomorrow
                </Button>
                <Button size="small" variant="outlined" onClick={() => setDatePreset('week')}>
                  This Week
                </Button>
                <Button size="small" variant="outlined" onClick={() => setDatePreset('month')}>
                  This Month
                </Button>
              </Box>
              
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <DatePicker
                      label="Start Date"
                      value={tempFilters.dates.start ? new Date(tempFilters.dates.start) : null}
                      onChange={(newValue) => {
                        setTempFilters(prev => ({
                          ...prev,
                          dates: {
                            ...prev.dates,
                            start: newValue ? newValue.toISOString().split('T')[0] : ''
                          }
                        }));
                      }}
                      sx={{ width: '100%' }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <DatePicker
                      label="End Date"
                      value={tempFilters.dates.end ? new Date(tempFilters.dates.end) : null}
                      onChange={(newValue) => {
                        setTempFilters(prev => ({
                          ...prev,
                          dates: {
                            ...prev.dates,
                            end: newValue ? newValue.toISOString().split('T')[0] : ''
                          }
                        }));
                      }}
                      sx={{ width: '100%' }}
                    />
                  </Grid>
                </Grid>
              </LocalizationProvider>

              <Box mt={3}>
                <Typography variant="subtitle2" gutterBottom>
                  Time of Day
                </Typography>
                <Box display="flex" flexWrap="wrap">
                  {timeOfDay.map((time) => (
                    <FilterChip
                      key={time.id}
                      label={time.label}
                      onClick={() => handleTimeToggle(time.id)}
                      active={tempFilters.time.includes(time.id)}
                      size="small"
                    />
                  ))}
                </Box>
              </Box>
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Event Size */}
        <Accordion expanded={expandedSection === 'size'} onChange={handleAccordionChange('size')}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box display="flex" alignItems="center" gap={1}>
              <Group />
              <Typography>Event Size</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <RadioGroup
              value={tempFilters.eventSize}
              onChange={(e) => setTempFilters(prev => ({ ...prev, eventSize: e.target.value }))}
            >
              <FormControlLabel value="any" control={<Radio />} label="Any size" />
              {eventSizes.map((size) => (
                <FormControlLabel
                  key={size.id}
                  value={size.id}
                  control={<Radio />}
                  label={size.label}
                />
              ))}
            </RadioGroup>
          </AccordionDetails>
        </Accordion>

        {/* Host Type */}
        <Accordion expanded={expandedSection === 'host'} onChange={handleAccordionChange('host')}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography>Host Type</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box>
              {hostTypes.map((host) => (
                <FormControlLabel
                  key={host.id}
                  control={
                    <Checkbox
                      checked={tempFilters.hostType.includes(host.id)}
                      onChange={() => handleHostTypeToggle(host.id)}
                    />
                  }
                  label={host.label}
                />
              ))}
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Amenities */}
        <Accordion expanded={expandedSection === 'amenities'} onChange={handleAccordionChange('amenities')}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography>Amenities</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box>
              {amenitiesList.map((amenity) => (
                <FormControlLabel
                  key={amenity.id}
                  control={
                    <Checkbox
                      checked={tempFilters.amenities.includes(amenity.id)}
                      onChange={() => handleAmenityToggle(amenity.id)}
                    />
                  }
                  label={amenity.label}
                />
              ))}
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Accessibility */}
        <Accordion expanded={expandedSection === 'accessibility'} onChange={handleAccordionChange('accessibility')}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography>Accessibility</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box>
              {accessibilityOptions.map((access) => (
                <FormControlLabel
                  key={access.id}
                  control={
                    <Checkbox
                      checked={tempFilters.accessibility.includes(access.id)}
                      onChange={() => handleAccessibilityToggle(access.id)}
                    />
                  }
                  label={access.label}
                />
              ))}
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Sort By */}
        <Accordion expanded={expandedSection === 'sort'} onChange={handleAccordionChange('sort')}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box display="flex" alignItems="center" gap={1}>
              <Sort />
              <Typography>Sort By</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <RadioGroup
              value={tempFilters.sortBy}
              onChange={(e) => setTempFilters(prev => ({ ...prev, sortBy: e.target.value }))}
            >
              {sortOptions.map((option) => (
                <FormControlLabel
                  key={option.id}
                  value={option.id}
                  control={<Radio />}
                  label={option.label}
                />
              ))}
            </RadioGroup>
          </AccordionDetails>
        </Accordion>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={clearAllFilters} startIcon={<Clear />}>
          Clear All
        </Button>
        <Box flex={1} />
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleApply} variant="contained" startIcon={<CheckCircle />}>
          Apply Filters ({getActiveFilterCount()})
        </Button>
      </DialogActions>
    </StyledDialog>
  );
};

export default AdvancedFilterModal;