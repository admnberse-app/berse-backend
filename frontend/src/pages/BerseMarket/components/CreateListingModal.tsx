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
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Switch,
  FormControlLabel,
  RadioGroup,
  Radio,
  Slider,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Grid,
  Paper,
  InputAdornment,
  Autocomplete,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Checkbox,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Close,
  Add,
  CloudUpload,
  Delete,
  DragIndicator,
  LocationOn,
  AttachMoney,
  LocalShipping,
  Inventory,
  Category,
  Info,
  Warning,
  CheckCircle,
  ExpandMore,
  CameraAlt,
  Verified,
  Schedule,
  Star,
} from '@mui/icons-material';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

interface ListingData {
  title: string;
  description: string;
  category: string;
  subcategory: string;
  condition: 'new' | 'like-new' | 'used';
  price: number;
  negotiable: boolean;
  images: File[];
  quantity: number;
  location: string;
  shippingOptions: {
    pickup: boolean;
    delivery: boolean;
    shipping: boolean;
    shippingCost?: number;
  };
  tags: string[];
  isHalal?: boolean;
  expiryDate?: string;
  warranty?: string;
  returnPolicy: string;
  specifications: Record<string, string>;
}

interface CreateListingModalProps {
  open: boolean;
  onClose: () => void;
  onCreateListing: (listingData: ListingData) => void;
}

const StyledDialog = styled(Dialog)`
  .MuiDialog-paper {
    border-radius: 16px;
    max-width: 800px;
    width: 100%;
    max-height: 90vh;
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
    border-color: #2196f3;
    background: #f5f5f5;
  }
`;

const ImagePreview = styled(Box)`
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  background: #f5f5f5;
  
  img {
    width: 100%;
    height: 100px;
    object-fit: cover;
  }
`;

const RemoveButton = styled(IconButton)`
  position: absolute;
  top: 4px;
  right: 4px;
  background: rgba(255,255,255,0.9);
  color: #f44336;
  
  &:hover {
    background: rgba(255,255,255,1);
  }
`;

const MainBadge = styled(Box)`
  position: absolute;
  bottom: 4px;
  left: 4px;
  background: #2196f3;
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: bold;
`;

const CategoryOption = styled(Paper)<{ selected?: boolean }>`
  padding: 16px;
  cursor: pointer;
  text-align: center;
  border: 2px solid ${props => props.selected ? '#2196f3' : 'transparent'};
  background: ${props => props.selected ? '#e3f2fd' : 'white'};
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const ConditionOption = styled(Box)<{ selected?: boolean }>`
  padding: 12px 16px;
  border: 2px solid ${props => props.selected ? '#2196f3' : '#e0e0e0'};
  border-radius: 8px;
  cursor: pointer;
  text-align: center;
  background: ${props => props.selected ? '#e3f2fd' : 'white'};
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #2196f3;
  }
`;

const PriceSuggestion = styled(Box)`
  background: #e8f5e8;
  border: 1px solid #4caf50;
  border-radius: 8px;
  padding: 12px;
  margin-top: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const CreateListingModal: React.FC<CreateListingModalProps> = ({
  open,
  onClose,
  onCreateListing,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [listingData, setListingData] = useState<ListingData>({
    title: '',
    description: '',
    category: '',
    subcategory: '',
    condition: 'new',
    price: 0,
    negotiable: false,
    images: [],
    quantity: 1,
    location: 'Kuala Lumpur',
    shippingOptions: {
      pickup: true,
      delivery: false,
      shipping: false
    },
    tags: [],
    returnPolicy: '7 days return',
    specifications: {}
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [suggestedPrice, setSuggestedPrice] = useState(0);
  const [publishing, setPublishing] = useState(false);

  const steps = ['Product Details', 'Images', 'Pricing & Shipping', 'Review'];

  const categories = [
    { id: 'Electronics', name: 'Electronics', icon: '📱', subcategories: ['Phones', 'Laptops', 'Accessories', 'Gaming'] },
    { id: 'Fashion', name: 'Fashion', icon: '👕', subcategories: ['Clothing', 'Shoes', 'Accessories', 'Bags'] },
    { id: 'Books', name: 'Books & Islamic', icon: '📚', subcategories: ['Quran', 'Islamic Books', 'Educational', 'Children'] },
    { id: 'Food', name: 'Food & Beverages', icon: '🍯', subcategories: ['Halal Food', 'Beverages', 'Snacks', 'Honey'] },
    { id: 'Services', name: 'Services', icon: '⚙️', subcategories: ['Cleaning', 'Repair', 'Teaching', 'Consultation'] },
    { id: 'Tickets', name: 'Tickets & Vouchers', icon: '🎫', subcategories: ['Event Tickets', 'Vouchers', 'Gift Cards'] },
    { id: 'Home', name: 'Home & Living', icon: '🏠', subcategories: ['Furniture', 'Appliances', 'Decoration', 'Kitchen'] },
  ];

  const popularTags = [
    'Brand New', 'Genuine', 'Original', 'Warranty', 'Fast Delivery',
    'Negotiable', 'Urgent Sale', 'Good Condition', 'Rarely Used',
    'Premium Quality', 'Authentic', 'Limited Edition', 'Collector Item'
  ];

  const locations = [
    'Kuala Lumpur', 'Selangor', 'Penang', 'Johor', 'Melaka',
    'Perak', 'Kedah', 'Kelantan', 'Terengganu', 'Pahang',
    'Negeri Sembilan', 'Perlis', 'Sabah', 'Sarawak', 'Labuan'
  ];

  useEffect(() => {
    if (listingData.category && listingData.title) {
      getSuggestedPrice();
    }
  }, [listingData.category, listingData.title, listingData.condition]);

  const getSuggestedPrice = async () => {
    try {
      // Simulate price suggestion API
      const basePrice = Math.floor(Math.random() * 1000) + 50;
      const conditionMultiplier = {
        'new': 1.0,
        'like-new': 0.8,
        'used': 0.6
      };
      
      const suggested = Math.round(basePrice * conditionMultiplier[listingData.condition]);
      setSuggestedPrice(suggested);
    } catch (error) {
      console.error('Failed to get price suggestion');
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 0: // Product Details
        if (!listingData.title || listingData.title.length < 5) {
          newErrors.title = 'Product title must be at least 5 characters';
        }
        if (!listingData.description || listingData.description.length < 20) {
          newErrors.description = 'Please provide a detailed description (min 20 characters)';
        }
        if (!listingData.category) {
          newErrors.category = 'Please select a category';
        }
        if (!listingData.subcategory) {
          newErrors.subcategory = 'Please select a subcategory';
        }
        break;

      case 1: // Images
        if (listingData.images.length === 0) {
          newErrors.images = 'Please add at least one image';
        }
        break;

      case 2: // Pricing & Shipping
        if (listingData.price <= 0) {
          newErrors.price = 'Please enter a valid price';
        }
        if (listingData.quantity < 1) {
          newErrors.quantity = 'Quantity must be at least 1';
        }
        if (!listingData.shippingOptions.pickup && 
            !listingData.shippingOptions.delivery && 
            !listingData.shippingOptions.shipping) {
          newErrors.shipping = 'Please select at least one delivery option';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handleBack = () => {
    setActiveStep(prev => Math.max(prev - 1, 0));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (files.length + listingData.images.length > 10) {
      setErrors({ ...errors, images: 'Maximum 10 images allowed' });
      return;
    }

    // Validate file sizes
    const maxSize = 5 * 1024 * 1024; // 5MB
    const oversized = files.filter(file => file.size > maxSize);
    
    if (oversized.length > 0) {
      setErrors({ ...errors, images: 'Images must be less than 5MB each' });
      return;
    }

    // Create previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });

    setListingData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));

    setErrors({ ...errors, images: '' });
  };

  const removeImage = (index: number) => {
    setListingData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const reorderImages = (dragIndex: number, hoverIndex: number) => {
    const newImages = [...listingData.images];
    const newPreviews = [...imagePreviews];
    
    [newImages[dragIndex], newImages[hoverIndex]] = [newImages[hoverIndex], newImages[dragIndex]];
    [newPreviews[dragIndex], newPreviews[hoverIndex]] = [newPreviews[hoverIndex], newPreviews[dragIndex]];
    
    setListingData(prev => ({ ...prev, images: newImages }));
    setImagePreviews(newPreviews);
  };

  const publishListing = async () => {
    if (!validateStep(activeStep)) return;
    
    setPublishing(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      onCreateListing(listingData);
    } catch (error) {
      setErrors({ publish: 'Failed to create listing. Please try again.' });
    } finally {
      setPublishing(false);
    }
  };

  const renderStep1 = () => (
    <StepContent>
      <TextField
        fullWidth
        label="Product Title*"
        value={listingData.title}
        onChange={(e) => setListingData({ ...listingData, title: e.target.value })}
        error={!!errors.title}
        helperText={errors.title || 'Give your product a clear, descriptive title'}
        margin="normal"
        inputProps={{ maxLength: 80 }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Typography variant="caption" color="text.secondary">
                {listingData.title.length}/80
              </Typography>
            </InputAdornment>
          )
        }}
      />

      <TextField
        fullWidth
        label="Description*"
        value={listingData.description}
        onChange={(e) => setListingData({ ...listingData, description: e.target.value })}
        error={!!errors.description}
        helperText={errors.description || 'Describe your product in detail to attract buyers'}
        margin="normal"
        multiline
        rows={4}
        inputProps={{ maxLength: 1000 }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Typography variant="caption" color="text.secondary">
                {listingData.description.length}/1000
              </Typography>
            </InputAdornment>
          )
        }}
      />

      <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>
        Category*
      </Typography>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {categories.map(cat => (
          <Grid item xs={6} sm={4} key={cat.id}>
            <CategoryOption
              selected={listingData.category === cat.id}
              onClick={() => setListingData({
                ...listingData,
                category: cat.id,
                subcategory: ''
              })}
              elevation={listingData.category === cat.id ? 4 : 1}
            >
              <Typography variant="h4" sx={{ mb: 1 }}>
                {cat.icon}
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                {cat.name}
              </Typography>
            </CategoryOption>
          </Grid>
        ))}
      </Grid>
      {errors.category && (
        <Typography color="error" variant="caption">
          {errors.category}
        </Typography>
      )}

      {listingData.category && (
        <FormControl fullWidth margin="normal" error={!!errors.subcategory}>
          <InputLabel>Subcategory*</InputLabel>
          <Select
            value={listingData.subcategory}
            onChange={(e) => setListingData({ ...listingData, subcategory: e.target.value })}
            label="Subcategory*"
          >
            {categories
              .find(cat => cat.id === listingData.category)
              ?.subcategories.map(sub => (
                <MenuItem key={sub} value={sub}>{sub}</MenuItem>
              ))
            }
          </Select>
          {errors.subcategory && (
            <Typography color="error" variant="caption">
              {errors.subcategory}
            </Typography>
          )}
        </FormControl>
      )}

      <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>
        Condition*
      </Typography>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {[
          { value: 'new', label: 'New', desc: 'Brand new, unused' },
          { value: 'like-new', label: 'Like New', desc: 'Used once or twice' },
          { value: 'used', label: 'Used', desc: 'Used with normal wear' }
        ].map(condition => (
          <Grid item xs={4} key={condition.value}>
            <ConditionOption
              selected={listingData.condition === condition.value}
              onClick={() => setListingData({ ...listingData, condition: condition.value as any })}
            >
              <Typography variant="subtitle2" fontWeight="bold">
                {condition.label}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {condition.desc}
              </Typography>
            </ConditionOption>
          </Grid>
        ))}
      </Grid>

      {listingData.category === 'Food' && (
        <FormControlLabel
          control={
            <Switch
              checked={listingData.isHalal || false}
              onChange={(e) => setListingData({ ...listingData, isHalal: e.target.checked })}
            />
          }
          label="Halal Certified"
          sx={{ mt: 2 }}
        />
      )}

      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Tags (Optional)
        </Typography>
        <Autocomplete
          multiple
          options={popularTags}
          value={listingData.tags}
          onChange={(e, value) => setListingData({ ...listingData, tags: value })}
          renderInput={(params) => (
            <TextField {...params} placeholder="Add tags to help buyers find your product" />
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
    </StepContent>
  );

  const renderStep2 = () => (
    <StepContent>
      <Typography variant="h6" gutterBottom>
        Product Images*
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Add up to 10 photos. The first photo will be your main image.
      </Typography>

      <input
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        id="image-upload"
        onChange={handleImageUpload}
      />
      <label htmlFor="image-upload">
        <ImageUploadBox>
          <CameraAlt sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
          <Typography variant="h6" gutterBottom>
            Add Photos
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Drag & drop images here or click to browse
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Maximum 10 images, 5MB each
          </Typography>
        </ImageUploadBox>
      </label>

      {imagePreviews.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Images ({imagePreviews.length}/10)
          </Typography>
          <Grid container spacing={2}>
            {imagePreviews.map((preview, index) => (
              <Grid item xs={4} sm={3} md={2} key={index}>
                <ImagePreview>
                  <img src={preview} alt={`Preview ${index + 1}`} />
                  {index === 0 && <MainBadge>Main</MainBadge>}
                  <RemoveButton
                    size="small"
                    onClick={() => removeImage(index)}
                  >
                    <Close />
                  </RemoveButton>
                </ImagePreview>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {errors.images && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {errors.images}
        </Alert>
      )}

      <Box sx={{ mt: 3 }}>
        <Alert severity="info">
          <Typography variant="subtitle2" gutterBottom>
            Photo Tips:
          </Typography>
          <Typography variant="body2" component="div">
            • Use good lighting and take clear photos<br />
            • Show the item from multiple angles<br />
            • Include close-ups of important details<br />
            • Show any defects or wear honestly<br />
            • First image should be your best shot
          </Typography>
        </Alert>
      </Box>
    </StepContent>
  );

  const renderStep3 = () => (
    <StepContent>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Price (RM)*"
            type="number"
            value={listingData.price}
            onChange={(e) => setListingData({ ...listingData, price: parseFloat(e.target.value) || 0 })}
            error={!!errors.price}
            helperText={errors.price}
            InputProps={{
              startAdornment: <InputAdornment position="start">RM</InputAdornment>,
              inputProps: { min: 0, step: 0.01 }
            }}
          />

          {suggestedPrice > 0 && (
            <PriceSuggestion>
              <Box>
                <Typography variant="body2" fontWeight="bold">
                  Suggested: RM {suggestedPrice}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Based on similar items
                </Typography>
              </Box>
              <Button
                size="small"
                onClick={() => setListingData({ ...listingData, price: suggestedPrice })}
              >
                Use This
              </Button>
            </PriceSuggestion>
          )}

          <FormControlLabel
            control={
              <Switch
                checked={listingData.negotiable}
                onChange={(e) => setListingData({ ...listingData, negotiable: e.target.checked })}
              />
            }
            label="Price is negotiable"
            sx={{ mt: 2 }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Quantity Available*"
            type="number"
            value={listingData.quantity}
            onChange={(e) => setListingData({ ...listingData, quantity: parseInt(e.target.value) || 1 })}
            error={!!errors.quantity}
            helperText={errors.quantity || 'How many items do you have?'}
            InputProps={{
              startAdornment: <InputAdornment position="start"><Inventory /></InputAdornment>,
              inputProps: { min: 1 }
            }}
          />
        </Grid>
      </Grid>

      <FormControl fullWidth margin="normal">
        <InputLabel>Location*</InputLabel>
        <Select
          value={listingData.location}
          onChange={(e) => setListingData({ ...listingData, location: e.target.value })}
          label="Location*"
        >
          {locations.map(location => (
            <MenuItem key={location} value={location}>{location}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>
        Delivery Options*
      </Typography>
      <Box sx={{ pl: 2 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={listingData.shippingOptions.pickup}
              onChange={(e) => setListingData({
                ...listingData,
                shippingOptions: { ...listingData.shippingOptions, pickup: e.target.checked }
              })}
            />
          }
          label="Self Pickup"
        />
        <Typography variant="caption" color="text.secondary" display="block">
          Buyer can collect from your location
        </Typography>

        <FormControlLabel
          control={
            <Checkbox
              checked={listingData.shippingOptions.delivery}
              onChange={(e) => setListingData({
                ...listingData,
                shippingOptions: { ...listingData.shippingOptions, delivery: e.target.checked }
              })}
            />
          }
          label="COD Delivery"
        />
        <Typography variant="caption" color="text.secondary" display="block">
          Cash on delivery within your area
        </Typography>

        <FormControlLabel
          control={
            <Checkbox
              checked={listingData.shippingOptions.shipping}
              onChange={(e) => setListingData({
                ...listingData,
                shippingOptions: { ...listingData.shippingOptions, shipping: e.target.checked }
              })}
            />
          }
          label="Nationwide Shipping"
        />
        <Typography variant="caption" color="text.secondary" display="block">
          Ship anywhere in Malaysia
        </Typography>

        {listingData.shippingOptions.shipping && (
          <TextField
            fullWidth
            label="Shipping Cost (RM)"
            type="number"
            value={listingData.shippingOptions.shippingCost || ''}
            onChange={(e) => setListingData({
              ...listingData,
              shippingOptions: {
                ...listingData.shippingOptions,
                shippingCost: parseFloat(e.target.value) || 0
              }
            })}
            sx={{ mt: 2 }}
            InputProps={{
              startAdornment: <InputAdornment position="start">RM</InputAdornment>
            }}
          />
        )}
      </Box>

      {errors.shipping && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {errors.shipping}
        </Alert>
      )}

      <Accordion sx={{ mt: 3 }}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography>Additional Information (Optional)</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <TextField
            fullWidth
            label="Warranty Information"
            value={listingData.warranty || ''}
            onChange={(e) => setListingData({ ...listingData, warranty: e.target.value })}
            margin="normal"
            placeholder="e.g., 1 year manufacturer warranty"
          />

          {listingData.category === 'Food' && (
            <TextField
              fullWidth
              label="Expiry Date"
              type="date"
              value={listingData.expiryDate || ''}
              onChange={(e) => setListingData({ ...listingData, expiryDate: e.target.value })}
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
          )}

          <FormControl fullWidth margin="normal">
            <InputLabel>Return Policy</InputLabel>
            <Select
              value={listingData.returnPolicy}
              onChange={(e) => setListingData({ ...listingData, returnPolicy: e.target.value })}
              label="Return Policy"
            >
              <MenuItem value="No returns">No returns</MenuItem>
              <MenuItem value="3 days return">3 days return</MenuItem>
              <MenuItem value="7 days return">7 days return</MenuItem>
              <MenuItem value="14 days return">14 days return</MenuItem>
              <MenuItem value="30 days return">30 days return</MenuItem>
            </Select>
          </FormControl>
        </AccordionDetails>
      </Accordion>
    </StepContent>
  );

  const renderStep4 = () => (
    <StepContent>
      <Typography variant="h6" gutterBottom>
        Review Your Listing
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Please review all information before publishing your listing.
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            {imagePreviews[0] ? (
              <img
                src={imagePreviews[0]}
                alt="Main product"
                style={{
                  width: '100%',
                  height: 200,
                  objectFit: 'cover',
                  borderRadius: 8
                }}
              />
            ) : (
              <Box
                sx={{
                  width: '100%',
                  height: 200,
                  background: '#f5f5f5',
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Typography color="text.secondary">No image</Typography>
              </Box>
            )}
          </Grid>

          <Grid item xs={12} md={8}>
            <Typography variant="h5" gutterBottom>
              {listingData.title || 'Untitled Product'}
            </Typography>

            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <Chip label={listingData.category} size="small" color="primary" />
              <Chip label={listingData.subcategory} size="small" variant="outlined" />
              <Chip label={listingData.condition} size="small" />
              {listingData.isHalal && (
                <Chip label="Halal" size="small" color="success" />
              )}
            </Box>

            <Typography variant="h4" color="primary" fontWeight="bold" gutterBottom>
              RM {listingData.price.toFixed(2)}
              {listingData.negotiable && (
                <Chip label="Negotiable" size="small" sx={{ ml: 1 }} />
              )}
            </Typography>

            <Typography variant="body1" paragraph>
              {listingData.description || 'No description provided'}
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  <LocationOn sx={{ fontSize: 16, mr: 0.5 }} />
                  {listingData.location}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  <Inventory sx={{ fontSize: 16, mr: 0.5 }} />
                  {listingData.quantity} available
                </Typography>
              </Grid>
            </Grid>

            <Box mt={2}>
              <Typography variant="body2" color="text.secondary">
                Delivery Options:
              </Typography>
              <Box display="flex" gap={1} mt={1}>
                {listingData.shippingOptions.pickup && (
                  <Chip label="Pickup" size="small" variant="outlined" />
                )}
                {listingData.shippingOptions.delivery && (
                  <Chip label="COD" size="small" variant="outlined" />
                )}
                {listingData.shippingOptions.shipping && (
                  <Chip 
                    label={`Shipping ${listingData.shippingOptions.shippingCost ? `RM${listingData.shippingOptions.shippingCost}` : ''}`}
                    size="small" 
                    variant="outlined" 
                  />
                )}
              </Box>
            </Box>

            {listingData.tags.length > 0 && (
              <Box mt={2}>
                <Typography variant="body2" color="text.secondary">Tags:</Typography>
                <Box display="flex" gap={0.5} flexWrap="wrap" mt={1}>
                  {listingData.tags.map(tag => (
                    <Chip key={tag} label={tag} size="small" />
                  ))}
                </Box>
              </Box>
            )}
          </Grid>
        </Grid>
      </Paper>

      <Alert severity="success" sx={{ mb: 2 }}>
        <Typography variant="body2">
          🎉 Great! You'll earn 20 BersePoints for creating this listing!
        </Typography>
      </Alert>

      <Alert severity="info">
        <Typography variant="body2">
          Your listing will be reviewed and published within 24 hours. You'll receive a notification once it's live.
        </Typography>
      </Alert>

      {errors.publish && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {errors.publish}
        </Alert>
      )}
    </StepContent>
  );

  return (
    <StyledDialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <Add color="primary" />
            <Typography variant="h6">Create Listing</Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ px: 3 }}>
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
            {activeStep === 0 && renderStep1()}
            {activeStep === 1 && renderStep2()}
            {activeStep === 2 && renderStep3()}
            {activeStep === 3 && renderStep4()}
          </motion.div>
        </AnimatePresence>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button
          onClick={handleBack}
          disabled={activeStep === 0 || publishing}
        >
          Back
        </Button>
        <Box flex={1} />
        <Button onClick={onClose} disabled={publishing}>
          Cancel
        </Button>
        {activeStep === steps.length - 1 ? (
          <Button
            onClick={publishListing}
            variant="contained"
            disabled={publishing}
            startIcon={publishing ? <CircularProgress size={20} /> : <CheckCircle />}
          >
            {publishing ? 'Publishing...' : 'Publish Listing'}
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            variant="contained"
          >
            Next
          </Button>
        )}
      </DialogActions>
    </StyledDialog>
  );
};

export default CreateListingModal;