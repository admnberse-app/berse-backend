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
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  Slider,
  TextField,
  Select,
  MenuItem,
  Chip,
  Switch,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Badge,
  Paper,
  Grid,
  InputLabel,
  Alert,
  Autocomplete,
  Rating,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  Close,
  FilterList,
  Clear,
  CheckCircle,
  ExpandMore,
  LocationOn,
  AttachMoney,
  Star,
  Verified,
  LocalShipping,
  Category,
  Schedule,
  TrendingUp,
} from '@mui/icons-material';
import styled from 'styled-components';
import { motion } from 'framer-motion';

interface FilterOptions {
  categories: string[];
  priceRange: { min: number; max: number };
  condition: string[];
  location: string;
  distance: number;
  seller: {
    verified: boolean;
    rating: number;
  };
  shipping: string[];
  halal: boolean;
  sortBy: string;
}

interface FilterModalProps {
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
  background: ${props => props.active ? '#2196f3' : 'white'};
  color: ${props => props.active ? 'white' : 'inherit'};
  border: 1px solid ${props => props.active ? '#2196f3' : '#e0e0e0'};
  
  &:hover {
    background: ${props => props.active ? '#1976d2' : '#f5f5f5'};
  }
`;

const PriceInput = styled(TextField)`
  .MuiOutlinedInput-root {
    height: 40px;
  }
`;

const LocationChip = styled(Chip)<{ selected?: boolean }>`
  margin: 4px;
  cursor: pointer;
  background: ${props => props.selected ? '#e3f2fd' : 'white'};
  border: 1px solid ${props => props.selected ? '#2196f3' : '#e0e0e0'};
  
  &:hover {
    background: #f5f5f5;
  }
`;

const FilterModal: React.FC<FilterModalProps> = ({
  open,
  onClose,
  filters,
  onApplyFilters
}) => {
  const [tempFilters, setTempFilters] = useState<FilterOptions>(filters);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    categories: true,
    price: true,
    condition: false,
    location: false,
    seller: false,
    shipping: false,
    other: false
  });

  const categories = [
    { id: 'Electronics', name: 'Electronics', icon: '📱' },
    { id: 'Fashion', name: 'Fashion', icon: '👕' },
    { id: 'Books', name: 'Books & Islamic', icon: '📚' },
    { id: 'Food', name: 'Food & Beverages', icon: '🍯' },
    { id: 'Services', name: 'Services', icon: '⚙️' },
    { id: 'Tickets', name: 'Tickets & Vouchers', icon: '🎫' },
    { id: 'Home', name: 'Home & Living', icon: '🏠' },
  ];

  const conditions = [
    { id: 'new', label: 'New', description: 'Brand new, unused' },
    { id: 'like-new', label: 'Like New', description: 'Used once or twice' },
    { id: 'used', label: 'Used', description: 'Used with normal wear' }
  ];

  const locations = [
    'Kuala Lumpur', 'Selangor', 'Penang', 'Johor', 'Melaka',
    'Perak', 'Kedah', 'Kelantan', 'Terengganu', 'Pahang',
    'Negeri Sembilan', 'Perlis', 'Sabah', 'Sarawak'
  ];

  const shippingOptions = [
    { id: 'pickup', label: 'Self Pickup', icon: '👤' },
    { id: 'delivery', label: 'COD Delivery', icon: '🚗' },
    { id: 'shipping', label: 'Nationwide Shipping', icon: '📦' }
  ];

  const sortOptions = [
    { id: 'popular', label: 'Most Popular' },
    { id: 'price_asc', label: 'Price: Low to High' },
    { id: 'price_desc', label: 'Price: High to Low' },
    { id: 'date', label: 'Latest First' },
    { id: 'rating', label: 'Highest Rated' },
    { id: 'distance', label: 'Nearest First' }
  ];

  useEffect(() => {
    setTempFilters(filters);
  }, [filters, open]);

  const handleSectionToggle = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleCategoryToggle = (categoryId: string) => {
    setTempFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter(c => c !== categoryId)
        : [...prev.categories, categoryId]
    }));
  };

  const handleConditionToggle = (conditionId: string) => {
    setTempFilters(prev => ({
      ...prev,
      condition: prev.condition.includes(conditionId)
        ? prev.condition.filter(c => c !== conditionId)
        : [...prev.condition, conditionId]
    }));
  };

  const handleShippingToggle = (shippingId: string) => {
    setTempFilters(prev => ({
      ...prev,
      shipping: prev.shipping.includes(shippingId)
        ? prev.shipping.filter(s => s !== shippingId)
        : [...prev.shipping, shippingId]
    }));
  };

  const handlePriceRangeChange = (event: Event, newValue: number | number[]) => {
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

  const handleClearAllFilters = () => {
    const defaultFilters: FilterOptions = {
      categories: [],
      priceRange: { min: 0, max: 10000 },
      condition: [],
      location: '',
      distance: 50,
      seller: {
        verified: false,
        rating: 0
      },
      shipping: [],
      halal: false,
      sortBy: 'popular'
    };
    setTempFilters(defaultFilters);
  };

  const getActiveFilterCount = (): number => {
    let count = 0;
    if (tempFilters.categories.length > 0) count++;
    if (tempFilters.priceRange.min > 0 || tempFilters.priceRange.max < 10000) count++;
    if (tempFilters.condition.length > 0) count++;
    if (tempFilters.location) count++;
    if (tempFilters.distance < 50) count++;
    if (tempFilters.seller.verified) count++;
    if (tempFilters.seller.rating > 0) count++;
    if (tempFilters.shipping.length > 0) count++;
    if (tempFilters.halal) count++;
    if (tempFilters.sortBy !== 'popular') count++;
    return count;
  };

  const handleApplyFilters = () => {
    onApplyFilters(tempFilters);
    onClose();
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
        <Accordion 
          expanded={expandedSections.categories} 
          onChange={() => handleSectionToggle('categories')}
        >
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
        <Accordion 
          expanded={expandedSections.price} 
          onChange={() => handleSectionToggle('price')}
        >
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
                onChange={handlePriceRangeChange}
                valueLabelDisplay="on"
                min={0}
                max={10000}
                step={10}
                marks={[
                  { value: 0, label: 'RM 0' },
                  { value: 2500, label: 'RM 2.5K' },
                  { value: 5000, label: 'RM 5K' },
                  { value: 10000, label: 'RM 10K+' },
                ]}
              />
              
              <Box display="flex" gap={2} mt={2}>
                <PriceInput
                  label="Min"
                  type="number"
                  value={tempFilters.priceRange.min}
                  onChange={(e) => setTempFilters(prev => ({
                    ...prev,
                    priceRange: { ...prev.priceRange, min: Math.max(0, parseInt(e.target.value) || 0) }
                  }))}
                  InputProps={{
                    startAdornment: 'RM'
                  }}
                />
                <PriceInput
                  label="Max"
                  type="number"
                  value={tempFilters.priceRange.max}
                  onChange={(e) => setTempFilters(prev => ({
                    ...prev,
                    priceRange: { ...prev.priceRange, max: Math.max(prev.priceRange.min, parseInt(e.target.value) || 10000) }
                  }))}
                  InputProps={{
                    startAdornment: 'RM'
                  }}
                />
              </Box>
              
              <Box display="flex" gap={1} mt={2} flexWrap="wrap">
                <Button size="small" onClick={() => setTempFilters(prev => ({ ...prev, priceRange: { min: 0, max: 50 } }))}>
                  Under RM 50
                </Button>
                <Button size="small" onClick={() => setTempFilters(prev => ({ ...prev, priceRange: { min: 0, max: 100 } }))}>
                  Under RM 100
                </Button>
                <Button size="small" onClick={() => setTempFilters(prev => ({ ...prev, priceRange: { min: 100, max: 500 } }))}>
                  RM 100 - 500
                </Button>
                <Button size="small" onClick={() => setTempFilters(prev => ({ ...prev, priceRange: { min: 500, max: 10000 } }))}>
                  Above RM 500
                </Button>
              </Box>
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Condition */}
        <Accordion 
          expanded={expandedSections.condition} 
          onChange={() => handleSectionToggle('condition')}
        >
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box display="flex" alignItems="center" gap={1}>
              <CheckCircle />
              <Typography>Condition</Typography>
              {tempFilters.condition.length > 0 && (
                <Chip label={tempFilters.condition.length} size="small" sx={{ ml: 'auto', mr: 2 }} />
              )}
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box>
              {conditions.map((condition) => (
                <FormControlLabel
                  key={condition.id}
                  control={
                    <Checkbox
                      checked={tempFilters.condition.includes(condition.id)}
                      onChange={() => handleConditionToggle(condition.id)}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {condition.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {condition.description}
                      </Typography>
                    </Box>
                  }
                  sx={{ display: 'block', mb: 1 }}
                />
              ))}
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Location */}
        <Accordion 
          expanded={expandedSections.location} 
          onChange={() => handleSectionToggle('location')}
        >
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box display="flex" alignItems="center" gap={1}>
              <LocationOn />
              <Typography>Location</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box>
              <Autocomplete
                value={tempFilters.location}
                onChange={(e, value) => setTempFilters(prev => ({ ...prev, location: value || '' }))}
                options={locations}
                renderInput={(params) => (
                  <TextField {...params} label="Select Location" />
                )}
                sx={{ mb: 2 }}
              />
              
              <Typography variant="body2" gutterBottom>
                Distance: {tempFilters.distance} km
              </Typography>
              <Slider
                value={tempFilters.distance}
                onChange={handleDistanceChange}
                min={1}
                max={100}
                valueLabelDisplay="auto"
                marks={[
                  { value: 5, label: '5km' },
                  { value: 25, label: '25km' },
                  { value: 50, label: '50km' },
                  { value: 100, label: '100km' },
                ]}
              />
              
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                Show products within {tempFilters.distance}km of selected location
              </Typography>
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Seller */}
        <Accordion 
          expanded={expandedSections.seller} 
          onChange={() => handleSectionToggle('seller')}
        >
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box display="flex" alignItems="center" gap={1}>
              <Star />
              <Typography>Seller</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={tempFilters.seller.verified}
                    onChange={(e) => setTempFilters(prev => ({
                      ...prev,
                      seller: { ...prev.seller, verified: e.target.checked }
                    }))}
                  />
                }
                label={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Verified sx={{ color: '#1976d2' }} />
                    <Typography>Verified Sellers Only</Typography>
                  </Box>
                }
                sx={{ mb: 2 }}
              />
              
              <Typography variant="body2" gutterBottom>
                Minimum Seller Rating: {tempFilters.seller.rating} star{tempFilters.seller.rating !== 1 ? 's' : ''}
              </Typography>
              <Rating
                value={tempFilters.seller.rating}
                onChange={(e, value) => setTempFilters(prev => ({
                  ...prev,
                  seller: { ...prev.seller, rating: value || 0 }
                }))}
                sx={{ mb: 1 }}
              />
              
              <Box display="flex" gap={1}>
                <Button 
                  size="small" 
                  onClick={() => setTempFilters(prev => ({ ...prev, seller: { ...prev.seller, rating: 0 } }))}
                >
                  Any Rating
                </Button>
                <Button 
                  size="small" 
                  onClick={() => setTempFilters(prev => ({ ...prev, seller: { ...prev.seller, rating: 4 } }))}
                >
                  4+ Stars
                </Button>
              </Box>
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Shipping Options */}
        <Accordion 
          expanded={expandedSections.shipping} 
          onChange={() => handleSectionToggle('shipping')}
        >
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box display="flex" alignItems="center" gap={1}>
              <LocalShipping />
              <Typography>Delivery Options</Typography>
              {tempFilters.shipping.length > 0 && (
                <Chip label={tempFilters.shipping.length} size="small" sx={{ ml: 'auto', mr: 2 }} />
              )}
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box>
              {shippingOptions.map((option) => (
                <FormControlLabel
                  key={option.id}
                  control={
                    <Checkbox
                      checked={tempFilters.shipping.includes(option.id)}
                      onChange={() => handleShippingToggle(option.id)}
                    />
                  }
                  label={
                    <Box display="flex" alignItems="center" gap={1}>
                      <span>{option.icon}</span>
                      <Typography>{option.label}</Typography>
                    </Box>
                  }
                  sx={{ display: 'block', mb: 1 }}
                />
              ))}
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Other Options */}
        <Accordion 
          expanded={expandedSections.other} 
          onChange={() => handleSectionToggle('other')}
        >
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography>Other Options</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={tempFilters.halal}
                    onChange={(e) => setTempFilters(prev => ({ ...prev, halal: e.target.checked }))}
                  />
                }
                label="Halal Certified Only"
                sx={{ mb: 2 }}
              />
              
              <FormControl fullWidth>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={tempFilters.sortBy}
                  onChange={(e) => setTempFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                  label="Sort By"
                >
                  {sortOptions.map((option) => (
                    <MenuItem key={option.id} value={option.id}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </AccordionDetails>
        </Accordion>

        {getActiveFilterCount() > 0 && (
          <Alert severity="info" sx={{ mt: 2 }}>
            {getActiveFilterCount()} filter{getActiveFilterCount() > 1 ? 's' : ''} applied
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClearAllFilters} startIcon={<Clear />}>
          Clear All
        </Button>
        <Box flex={1} />
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleApplyFilters} variant="contained" startIcon={<CheckCircle />}>
          Apply Filters ({getActiveFilterCount()})
        </Button>
      </DialogActions>
    </StyledDialog>
  );
};

export default FilterModal;