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
  Chip,
  Rating,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemAvatar,
  Badge,
  Tab,
  Tabs,
  TextField,
  Collapse,
  Menu,
  MenuItem,
  Paper,
  Grid,
  Alert,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Slider,
} from '@mui/material';
import {
  Close,
  Share,
  Favorite,
  FavoriteBorder,
  ShoppingCart,
  Chat,
  LocationOn,
  Schedule,
  Verified,
  Star,
  LocalShipping,
  Security,
  Assignment,
  MoreVert,
  Report,
  ThumbUp,
  Reply,
  Send,
  LocalOffer,
  AttachMoney,
  Person,
  Store,
  CheckCircle,
  Warning,
  Info,
  ExpandMore,
  Phone,
  Email,
  WhatsApp,
  Facebook,
  Instagram,
  Storefront,
  Timeline,
} from '@mui/icons-material';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  sellerId: string;
  sellerName: string;
  sellerRating: number;
  sellerVerified?: boolean;
  condition: 'new' | 'like-new' | 'used';
  stock: number;
  location: string;
  views: number;
  likes: number;
  isHalal?: boolean;
  negotiable?: boolean;
  shippingOptions: {
    pickup: boolean;
    delivery: boolean;
    shipping: boolean;
    shippingCost?: number;
  };
  specifications?: Record<string, string>;
  warranty?: string;
  returnPolicy?: string;
  tags?: string[];
}

interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  images?: string[];
  createdAt: string;
  helpful: number;
  verified: boolean;
}

interface ProductDetailsModalProps {
  open: boolean;
  onClose: () => void;
  product: Product;
  onAddToCart: () => void;
  onBuyNow: () => void;
}

const StyledDialog = styled(Dialog)`
  .MuiDialog-paper {
    border-radius: 16px;
    max-width: 900px;
    width: 100%;
    max-height: 90vh;
  }
`;

const ImageCarousel = styled(Box)`
  position: relative;
  width: 100%;
  height: 400px;
  overflow: hidden;
  border-radius: 12px;
  background: #f5f5f5;
`;

const MainImage = styled(Box)`
  width: 100%;
  height: 100%;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ThumbnailContainer = styled(Box)`
  display: flex;
  gap: 8px;
  margin-top: 12px;
  overflow-x: auto;
  padding-bottom: 8px;
`;

const Thumbnail = styled(Box)<{ active?: boolean }>`
  min-width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid ${props => props.active ? '#2196f3' : 'transparent'};
  transition: border-color 0.3s ease;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  &:hover {
    border-color: #2196f3;
  }
`;

const SellerCard = styled(Card)`
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  margin-bottom: 16px;
`;

const ReviewCard = styled(Paper)`
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 12px;
  border: 1px solid #f0f0f0;
`;

const PriceSection = styled(Box)`
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  border-radius: 12px;
  padding: 16px;
  margin: 16px 0;
`;

const SpecificationItem = styled(Box)`
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
  }
`;

const MakeOfferDialog = styled(Dialog)`
  .MuiDialog-paper {
    border-radius: 16px;
    max-width: 400px;
    width: 100%;
  }
`;

const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  open,
  onClose,
  product,
  onAddToCart,
  onBuyNow
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerAmount, setOfferAmount] = useState(0);
  const [offerMessage, setOfferMessage] = useState('');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [sellerExpanded, setSellerExpanded] = useState(false);

  // Mock reviews data
  const mockReviews: Review[] = [
    {
      id: '1',
      userId: 'user1',
      userName: 'Ahmad Rahman',
      userAvatar: '/avatars/ahmad.jpg',
      rating: 5,
      comment: 'Excellent product! Exactly as described. Fast shipping and great packaging.',
      images: ['/reviews/review1.jpg'],
      createdAt: '2024-01-15T10:00:00Z',
      helpful: 12,
      verified: true
    },
    {
      id: '2',
      userId: 'user2',
      userName: 'Sarah Ali',
      rating: 4,
      comment: 'Good quality but delivery was a bit slow. Overall satisfied with the purchase.',
      createdAt: '2024-01-10T14:30:00Z',
      helpful: 8,
      verified: true
    },
    {
      id: '3',
      userId: 'user3',
      userName: 'Omar Hassan',
      rating: 5,
      comment: 'Amazing seller! Very responsive and helpful. Product is in perfect condition.',
      createdAt: '2024-01-08T09:15:00Z',
      helpful: 15,
      verified: false
    }
  ];

  useEffect(() => {
    if (open) {
      setReviews(mockReviews);
      setOfferAmount(Math.floor(product.price * 0.9)); // Suggest 10% less
    }
  }, [open, product.price]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };

  const handleMakeOffer = () => {
    if (!product.negotiable) {
      alert('This product is not open for negotiation');
      return;
    }
    setShowOfferModal(true);
  };

  const submitOffer = () => {
    if (offerAmount <= 0 || offerAmount >= product.price) {
      alert('Please enter a valid offer amount');
      return;
    }
    
    // Mock offer submission
    alert(`Offer of RM ${offerAmount} sent to seller!`);
    setShowOfferModal(false);
  };

  const handleWishlistToggle = () => {
    setIsWishlisted(!isWishlisted);
    // Mock wishlist update
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.title,
        text: product.description,
        url: window.location.href
      });
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Product link copied to clipboard!');
    }
  };

  const handleChatWithSeller = () => {
    // Mock chat functionality
    alert(`Starting chat with ${product.sellerName}...`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    return reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  };

  const renderOverviewTab = () => (
    <Box sx={{ py: 2 }}>
      <Typography variant="h6" gutterBottom>
        Product Description
      </Typography>
      <Typography variant="body1" paragraph>
        {product.description}
      </Typography>

      {product.specifications && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Specifications
          </Typography>
          <Paper sx={{ p: 2 }}>
            {Object.entries(product.specifications).map(([key, value]) => (
              <SpecificationItem key={key}>
                <Typography variant="body2" fontWeight="bold">
                  {key}:
                </Typography>
                <Typography variant="body2">
                  {value}
                </Typography>
              </SpecificationItem>
            ))}
          </Paper>
        </Box>
      )}

      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Shipping & Returns
        </Typography>
        <List>
          {product.shippingOptions.pickup && (
            <ListItem>
              <ListItemIcon>
                <Person color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Self Pickup Available"
                secondary="Free - Arrange with seller"
              />
            </ListItem>
          )}
          
          {product.shippingOptions.delivery && (
            <ListItem>
              <ListItemIcon>
                <LocalShipping color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="COD Delivery"
                secondary="Cash on delivery in local area"
              />
            </ListItem>
          )}
          
          {product.shippingOptions.shipping && (
            <ListItem>
              <ListItemIcon>
                <LocalShipping color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Nationwide Shipping"
                secondary={`RM ${product.shippingOptions.shippingCost || 'Free'} shipping cost`}
              />
            </ListItem>
          )}
          
          <ListItem>
            <ListItemIcon>
              <Security color="primary" />
            </ListItemIcon>
            <ListItemText
              primary={product.returnPolicy || '7 days return'}
              secondary="Return policy"
            />
          </ListItem>
          
          {product.warranty && (
            <ListItem>
              <ListItemIcon>
                <Assignment color="primary" />
              </ListItemIcon>
              <ListItemText
                primary={product.warranty}
                secondary="Warranty included"
              />
            </ListItem>
          )}
        </List>
      </Box>
    </Box>
  );

  const renderReviewsTab = () => (
    <Box sx={{ py: 2 }}>
      <Box display="flex" alignItems="center" justifyContent="between" mb={3}>
        <Box>
          <Typography variant="h6" gutterBottom>
            Customer Reviews ({reviews.length})
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <Rating value={calculateAverageRating()} readOnly precision={0.1} />
            <Typography variant="body2" color="text.secondary">
              {calculateAverageRating().toFixed(1)} out of 5
            </Typography>
          </Box>
        </Box>
      </Box>

      {reviews.map((review) => (
        <ReviewCard key={review.id} elevation={1}>
          <Box display="flex" gap={2}>
            <Avatar src={review.userAvatar}>
              {review.userName[0]}
            </Avatar>
            
            <Box flex={1}>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Typography variant="subtitle2" fontWeight="bold">
                  {review.userName}
                </Typography>
                {review.verified && (
                  <Chip
                    label="Verified Purchase"
                    size="small"
                    color="success"
                    icon={<CheckCircle />}
                  />
                )}
                <Typography variant="caption" color="text.secondary">
                  {formatDate(review.createdAt)}
                </Typography>
              </Box>
              
              <Rating value={review.rating} readOnly size="small" sx={{ mb: 1 }} />
              
              <Typography variant="body2" paragraph>
                {review.comment}
              </Typography>
              
              {review.images && (
                <Box display="flex" gap={1} mb={2}>
                  {review.images.map((image, index) => (
                    <Box
                      key={index}
                      component="img"
                      src={image}
                      alt={`Review ${index + 1}`}
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: 1,
                        objectFit: 'cover',
                        cursor: 'pointer'
                      }}
                    />
                  ))}
                </Box>
              )}
              
              <Box display="flex" alignItems="center" gap={2}>
                <Button
                  size="small"
                  startIcon={<ThumbUp />}
                  onClick={() => {
                    // Mock helpful vote
                    console.log('Helpful vote for review', review.id);
                  }}
                >
                  Helpful ({review.helpful})
                </Button>
                <Button size="small" startIcon={<Reply />}>
                  Reply
                </Button>
              </Box>
            </Box>
          </Box>
        </ReviewCard>
      ))}

      {reviews.length === 0 && (
        <Box textAlign="center" py={4}>
          <Star sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No reviews yet
          </Typography>
          <Typography color="text.secondary">
            Be the first to review this product!
          </Typography>
        </Box>
      )}
    </Box>
  );

  const renderSellerTab = () => (
    <Box sx={{ py: 2 }}>
      <SellerCard elevation={0}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <Avatar sx={{ width: 60, height: 60 }}>
              {product.sellerName[0]}
            </Avatar>
            
            <Box flex={1}>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Typography variant="h6" fontWeight="bold">
                  {product.sellerName}
                </Typography>
                {product.sellerVerified && (
                  <Verified sx={{ color: '#1976d2' }} />
                )}
              </Box>
              
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Rating value={product.sellerRating} readOnly size="small" />
                <Typography variant="body2" color="text.secondary">
                  {product.sellerRating} seller rating
                </Typography>
              </Box>
              
              <Typography variant="body2" color="text.secondary">
                Member since January 2023
              </Typography>
            </Box>
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Total Products
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                127
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Response Rate
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                98%
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Response Time
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                ~2 hours
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Followers
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                234
              </Typography>
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 2 }} />
          
          <Accordion expanded={sellerExpanded} onChange={() => setSellerExpanded(!sellerExpanded)}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="subtitle2">Seller Policies</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" paragraph>
                <strong>Return Policy:</strong> {product.returnPolicy || '7 days return policy'}
              </Typography>
              <Typography variant="body2" paragraph>
                <strong>Shipping:</strong> Ships nationwide. Local pickup available.
              </Typography>
              <Typography variant="body2">
                <strong>Payment:</strong> Accepts cash, online banking, and e-wallet payments.
              </Typography>
            </AccordionDetails>
          </Accordion>
          
          <Box display="flex" gap={1} mt={2}>
            <Button
              variant="contained"
              startIcon={<Chat />}
              onClick={handleChatWithSeller}
              fullWidth
            >
              Chat with Seller
            </Button>
            <Button
              variant="outlined"
              startIcon={<Storefront />}
              fullWidth
            >
              View Store
            </Button>
          </Box>
        </CardContent>
      </SellerCard>
    </Box>
  );

  return (
    <>
      <StyledDialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">Product Details</Typography>
            <Box display="flex" alignItems="center" gap={1}>
              <IconButton onClick={handleShare}>
                <Share />
              </IconButton>
              <IconButton onClick={handleWishlistToggle}>
                {isWishlisted ? <Favorite color="error" /> : <FavoriteBorder />}
              </IconButton>
              <IconButton
                onClick={(e) => setAnchorEl(e.currentTarget)}
              >
                <MoreVert />
              </IconButton>
              <IconButton onClick={onClose} size="small">
                <Close />
              </IconButton>
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ px: 3 }}>
          <Grid container spacing={3}>
            {/* Product Images */}
            <Grid item xs={12} md={6}>
              <ImageCarousel>
                <MainImage>
                  <img
                    src={product.images[selectedImageIndex] || '/placeholder-product.jpg'}
                    alt={product.title}
                  />
                </MainImage>
              </ImageCarousel>
              
              <ThumbnailContainer>
                {product.images.map((image, index) => (
                  <Thumbnail
                    key={index}
                    active={selectedImageIndex === index}
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <img src={image} alt={`Product ${index + 1}`} />
                  </Thumbnail>
                ))}
              </ThumbnailContainer>
            </Grid>

            {/* Product Info */}
            <Grid item xs={12} md={6}>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                {product.title}
              </Typography>
              
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <Chip label={product.category} size="small" color="primary" />
                <Chip label={product.condition} size="small" />
                {product.isHalal && (
                  <Chip label="Halal" size="small" color="success" />
                )}
                {product.negotiable && (
                  <Chip label="Negotiable" size="small" variant="outlined" />
                )}
              </Box>
              
              <PriceSection>
                {product.originalPrice && product.originalPrice > product.price ? (
                  <Box>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <Typography variant="h4" color="error" fontWeight="bold">
                        RM {product.price.toFixed(2)}
                      </Typography>
                      <Typography
                        variant="h6"
                        color="text.secondary"
                        sx={{ textDecoration: 'line-through' }}
                      >
                        RM {product.originalPrice.toFixed(2)}
                      </Typography>
                    </Box>
                    <Chip
                      label={`${Math.round((1 - product.price / product.originalPrice) * 100)}% OFF`}
                      color="error"
                      size="small"
                    />
                  </Box>
                ) : (
                  <Typography variant="h4" color="primary" fontWeight="bold">
                    RM {product.price.toFixed(2)}
                  </Typography>
                )}
              </PriceSection>
              
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Box display="flex" alignItems="center" gap={1}>
                  <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {product.location}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <Schedule sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {product.views} views
                  </Typography>
                </Box>
              </Box>
              
              {/* Stock Info */}
              <Alert severity={product.stock > 10 ? 'success' : product.stock > 0 ? 'warning' : 'error'}>
                {product.stock > 10 ? `${product.stock} units available` :
                 product.stock > 0 ? `Only ${product.stock} left in stock!` :
                 'Out of stock'}
              </Alert>
              
              {/* Quantity Selector */}
              {product.stock > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Quantity:
                  </Typography>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Button
                      size="small"
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                    >
                      -
                    </Button>
                    <Typography variant="h6" sx={{ minWidth: 30, textAlign: 'center' }}>
                      {quantity}
                    </Typography>
                    <Button
                      size="small"
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={quantity >= product.stock}
                    >
                      +
                    </Button>
                    <Typography variant="body2" color="text.secondary">
                      ({product.stock} available)
                    </Typography>
                  </Box>
                </Box>
              )}
              
              {/* Tags */}
              {product.tags && product.tags.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Tags:
                  </Typography>
                  <Box display="flex" gap={0.5} flexWrap="wrap">
                    {product.tags.map((tag) => (
                      <Chip key={tag} label={tag} size="small" variant="outlined" />
                    ))}
                  </Box>
                </Box>
              )}
            </Grid>
          </Grid>

          {/* Tabs */}
          <Box sx={{ mt: 3 }}>
            <Tabs value={activeTab} onChange={handleTabChange}>
              <Tab label="Overview" />
              <Tab label={`Reviews (${reviews.length})`} />
              <Tab label="Seller Info" />
            </Tabs>
            
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {activeTab === 0 && renderOverviewTab()}
                {activeTab === 1 && renderReviewsTab()}
                {activeTab === 2 && renderSellerTab()}
              </motion.div>
            </AnimatePresence>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, gap: 1 }}>
          {product.negotiable && (
            <Button
              variant="outlined"
              startIcon={<LocalOffer />}
              onClick={handleMakeOffer}
              disabled={product.stock === 0}
            >
              Make Offer
            </Button>
          )}
          
          <Button
            variant="outlined"
            startIcon={<Chat />}
            onClick={handleChatWithSeller}
          >
            Chat
          </Button>
          
          <Button
            variant="contained"
            startIcon={<ShoppingCart />}
            onClick={onAddToCart}
            disabled={product.stock === 0}
          >
            Add to Cart
          </Button>
          
          <Button
            variant="contained"
            color="secondary"
            onClick={onBuyNow}
            disabled={product.stock === 0}
            sx={{
              background: 'linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)',
              color: 'white'
            }}
          >
            Buy Now
          </Button>
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
            <ListItemText>Report Product</ListItemText>
          </MenuItem>
        </Menu>
      </StyledDialog>

      {/* Make Offer Modal */}
      <MakeOfferDialog open={showOfferModal} onClose={() => setShowOfferModal(false)}>
        <DialogTitle>Make an Offer</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" paragraph>
            Make an offer for: {product.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Asking price: RM {product.price.toFixed(2)}
          </Typography>
          
          <TextField
            fullWidth
            label="Your Offer (RM)"
            type="number"
            value={offerAmount}
            onChange={(e) => setOfferAmount(parseFloat(e.target.value) || 0)}
            margin="normal"
            InputProps={{
              startAdornment: <AttachMoney />
            }}
          />
          
          <TextField
            fullWidth
            label="Message to Seller (Optional)"
            multiline
            rows={3}
            value={offerMessage}
            onChange={(e) => setOfferMessage(e.target.value)}
            margin="normal"
            placeholder="Add a message to explain your offer..."
          />
          
          <Alert severity="info" sx={{ mt: 2 }}>
            Your offer will be sent to the seller. They can accept, counter, or decline.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowOfferModal(false)}>Cancel</Button>
          <Button onClick={submitOffer} variant="contained">
            Send Offer
          </Button>
        </DialogActions>
      </MakeOfferDialog>
    </>
  );
};

export default ProductDetailsModal;