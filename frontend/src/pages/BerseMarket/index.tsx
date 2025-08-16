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
  Rating,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  ArrowBack,
  ShoppingCart,
  Add,
  Search,
  FilterList,
  Share,
  Bookmark,
  BookmarkBorder,
  LocationOn,
  AttachMoney,
  Star,
  CheckCircle,
  ViewList,
  ViewModule,
  Sort,
  Favorite,
  FavoriteBorder,
  Chat,
  LocalOffer,
  TrendingUp,
  Storefront,
  Schedule,
  Verified,
  MoreVert,
  Report,
  Visibility,
  Person,
  Email,
  Phone,
  WhatsApp,
  Facebook,
  Instagram,
  Twitter,
  NavigateNext,
  FlashOn,
  LocalFireDepartment,
  CardGiftcard,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { debounce } from 'lodash';

// Lazy load heavy components
const CreateListingModal = lazy(() => import('./components/CreateListingModal'));
const CartModal = lazy(() => import('./components/CartModal'));
const ProductDetailsModal = lazy(() => import('./components/ProductDetailsModal'));
const FilterModal = lazy(() => import('./components/FilterModal'));
const SellerDashboardModal = lazy(() => import('./components/SellerDashboardModal'));

// Types
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
  isFeatured?: boolean;
  isFlashDeal?: boolean;
  flashDealPrice?: number;
  flashDealEndTime?: string;
  createdAt: string;
  userSaved?: boolean;
  negotiable?: boolean;
  shippingOptions: {
    pickup: boolean;
    delivery: boolean;
    shipping: boolean;
    shippingCost?: number;
  };
}

interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  price: number;
  selected: boolean;
}

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

// Styled Components
const MarketContainer = styled(Container)`
  padding-top: 16px;
  padding-bottom: 80px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
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
  background: ${props => props.active ? '#2196f3' : 'white'};
  color: ${props => props.active ? 'white' : 'inherit'};
  border: 1px solid ${props => props.active ? '#2196f3' : '#e0e0e0'};
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }
`;

const ProductCard = styled(motion.div)`
  cursor: pointer;
  height: 100%;
  
  .MuiCard-root {
    height: 100%;
    display: flex;
    flex-direction: column;
    border-radius: 12px;
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    }
  }
`;

const FlashDealCard = styled(Card)`
  position: relative;
  background: linear-gradient(135deg, #ff6b6b 0%, #feca57 100%);
  color: white;
  border-radius: 16px;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%);
    animation: shimmer 2s infinite;
  }
  
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
`;

const FlashDealTimer = styled(Box)`
  background: rgba(0,0,0,0.8);
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-weight: bold;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const SellerBadge = styled(Box)<{ verified?: boolean }>`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 12px;
  background: ${props => props.verified ? '#4caf50' : '#f5f5f5'};
  color: ${props => props.verified ? 'white' : 'text.secondary'};
  font-size: 0.75rem;
`;

const BerseMarketScreen: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // State Management
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'popular' | 'price_asc' | 'price_desc' | 'date' | 'rating'>('popular');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef<HTMLDivElement>(null);
  
  // Modal States
  const [showCartModal, setShowCartModal] = useState(false);
  const [showListingModal, setShowListingModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showSellerDashboard, setShowSellerDashboard] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Filter State
  const [filters, setFilters] = useState<FilterOptions>({
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
  });
  
  // Flash Deals State
  const [flashDeals, setFlashDeals] = useState<Product[]>([]);
  const [flashDealTimers, setFlashDealTimers] = useState<Record<string, number>>({});
  
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
    { id: 'All', name: 'All', icon: '🛍️' },
    { id: 'Electronics', name: 'Electronics', icon: '📱' },
    { id: 'Fashion', name: 'Fashion', icon: '👕' },
    { id: 'Books', name: 'Books & Islamic', icon: '📚' },
    { id: 'Food', name: 'Food & Beverages', icon: '🍯' },
    { id: 'Services', name: 'Services', icon: '⚙️' },
    { id: 'Tickets', name: 'Tickets & Vouchers', icon: '🎫' },
    { id: 'Home', name: 'Home & Living', icon: '🏠' },
  ];

  // Mock Data
  const mockProducts: Product[] = [
    {
      id: '1',
      title: 'iPhone 13 Pro Max 256GB',
      description: 'Like new condition, barely used. Comes with original box and charger.',
      price: 3500,
      originalPrice: 4200,
      images: ['/products/iphone13.jpg', '/products/iphone13-2.jpg'],
      category: 'Electronics',
      sellerId: 'seller1',
      sellerName: 'Ahmad Tech Store',
      sellerRating: 4.8,
      sellerVerified: true,
      condition: 'like-new',
      stock: 2,
      location: 'Kuala Lumpur',
      views: 245,
      likes: 32,
      isFeatured: true,
      createdAt: '2024-01-15T10:00:00Z',
      userSaved: false,
      negotiable: true,
      shippingOptions: {
        pickup: true,
        delivery: true,
        shipping: true,
        shippingCost: 15
      }
    },
    {
      id: '2',
      title: 'Halal Premium Honey 1kg',
      description: 'Pure raw honey from local beekeepers. JAKIM certified halal.',
      price: 45,
      images: ['/products/honey.jpg'],
      category: 'Food',
      sellerId: 'seller2',
      sellerName: 'Madu Asli Malaysia',
      sellerRating: 4.9,
      sellerVerified: true,
      condition: 'new',
      stock: 50,
      location: 'Melaka',
      views: 189,
      likes: 28,
      isHalal: true,
      isFeatured: true,
      createdAt: '2024-01-16T14:30:00Z',
      userSaved: true,
      shippingOptions: {
        pickup: false,
        delivery: false,
        shipping: true,
        shippingCost: 8
      }
    },
    {
      id: '3',
      title: 'Modern Hijab Collection',
      description: 'Premium chiffon hijabs in various colors. Perfect for daily wear.',
      price: 25,
      originalPrice: 35,
      images: ['/products/hijab.jpg', '/products/hijab-2.jpg'],
      category: 'Fashion',
      sellerId: 'seller3',
      sellerName: 'Muslimah Fashion',
      sellerRating: 4.7,
      sellerVerified: false,
      condition: 'new',
      stock: 15,
      location: 'Selangor',
      views: 156,
      likes: 45,
      isFlashDeal: true,
      flashDealPrice: 20,
      flashDealEndTime: '2024-01-20T23:59:59Z',
      createdAt: '2024-01-17T09:15:00Z',
      userSaved: false,
      shippingOptions: {
        pickup: true,
        delivery: true,
        shipping: true,
        shippingCost: 5
      }
    },
    {
      id: '4',
      title: 'Quran with English Translation',
      description: 'Beautiful hardcover Quran with side-by-side English translation.',
      price: 65,
      images: ['/products/quran.jpg'],
      category: 'Books',
      sellerId: 'seller4',
      sellerName: 'Islamic Bookstore',
      sellerRating: 4.9,
      sellerVerified: true,
      condition: 'new',
      stock: 8,
      location: 'Johor Bahru',
      views: 298,
      likes: 67,
      isFeatured: true,
      createdAt: '2024-01-18T11:20:00Z',
      userSaved: false,
      shippingOptions: {
        pickup: true,
        delivery: false,
        shipping: true,
        shippingCost: 10
      }
    },
    {
      id: '5',
      title: 'Home Cleaning Service',
      description: 'Professional cleaning service for your home. Trusted and reliable.',
      price: 80,
      images: ['/products/cleaning.jpg'],
      category: 'Services',
      sellerId: 'seller5',
      sellerName: 'CleanPro Services',
      sellerRating: 4.6,
      sellerVerified: true,
      condition: 'new',
      stock: 999,
      location: 'Petaling Jaya',
      views: 89,
      likes: 12,
      createdAt: '2024-01-19T16:45:00Z',
      userSaved: false,
      shippingOptions: {
        pickup: false,
        delivery: false,
        shipping: false
      }
    }
  ];

  // Load initial data
  useEffect(() => {
    loadProducts();
    loadFlashDeals();
    loadCart();
    loadWishlist();
  }, []);

  // Setup infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMoreProducts();
        }
      },
      { threshold: 0.1 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading]);

  // Filter products when dependencies change
  useEffect(() => {
    filterProducts();
  }, [searchQuery, selectedCategory, sortBy, products]);

  // Flash deal timers
  useEffect(() => {
    const timer = setInterval(() => {
      updateFlashDealTimers();
    }, 1000);

    return () => clearInterval(timer);
  }, [flashDeals]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProducts(mockProducts);
      setFilteredProducts(mockProducts);
    } catch (error) {
      showSnackbar('Failed to load products', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadMoreProducts = async () => {
    if (page >= 3) {
      setHasMore(false);
      return;
    }
    
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate loading more products
      const moreProducts = mockProducts.map(p => ({
        ...p,
        id: `${p.id}_page${page + 1}`,
        title: `${p.title} (Page ${page + 1})`,
      }));
      
      setProducts(prev => [...prev, ...moreProducts]);
      setPage(prev => prev + 1);
    } catch (error) {
      showSnackbar('Failed to load more products', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadFlashDeals = async () => {
    try {
      const flashDealProducts = mockProducts.filter(p => p.isFlashDeal);
      setFlashDeals(flashDealProducts);
    } catch (error) {
      showSnackbar('Failed to load flash deals', 'error');
    }
  };

  const updateFlashDealTimers = () => {
    const now = Date.now();
    const newTimers: Record<string, number> = {};
    
    flashDeals.forEach(deal => {
      if (deal.flashDealEndTime) {
        const remaining = new Date(deal.flashDealEndTime).getTime() - now;
        if (remaining > 0) {
          newTimers[deal.id] = remaining;
        }
      }
    });
    
    setFlashDealTimers(newTimers);
  };

  const formatFlashDealTimer = (ms: number): string => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const loadCart = async () => {
    try {
      const savedCart = localStorage.getItem('bersemarket_cart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error('Failed to load cart');
    }
  };

  const loadWishlist = async () => {
    try {
      const savedWishlist = localStorage.getItem('bersemarket_wishlist');
      if (savedWishlist) {
        setWishlist(JSON.parse(savedWishlist));
      }
    } catch (error) {
      console.error('Failed to load wishlist');
    }
  };

  // Debounced search
  const debouncedSearch = useMemo(
    () => debounce((query: string) => {
      setSearchQuery(query);
    }, 300),
    []
  );

  const handleSearch = (query: string) => {
    debouncedSearch(query);
  };

  const filterProducts = () => {
    let filtered = [...products];

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.sellerName.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price_asc':
          return a.price - b.price;
        case 'price_desc':
          return b.price - a.price;
        case 'date':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'rating':
          return b.sellerRating - a.sellerRating;
        case 'popular':
        default:
          return (b.views + b.likes) - (a.views + a.likes);
      }
    });

    setFilteredProducts(filtered);
  };

  // Product Actions
  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setShowProductModal(true);
    
    // Track view
    trackProductView(product.id);
  };

  const handleAddToCart = async (product: Product, quantity: number = 1) => {
    try {
      if (product.stock < quantity) {
        showSnackbar('Insufficient stock', 'error');
        return;
      }
      
      const existingItem = cart.find(item => item.productId === product.id);
      let updatedCart: CartItem[];
      
      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity > product.stock) {
          showSnackbar(`Only ${product.stock} items available`, 'error');
          return;
        }
        
        updatedCart = cart.map(item =>
          item.productId === product.id
            ? { ...item, quantity: newQuantity }
            : item
        );
      } else {
        const cartItem: CartItem = {
          id: `cart_${Date.now()}`,
          productId: product.id,
          product,
          quantity,
          price: product.flashDealPrice || product.price,
          selected: true
        };
        updatedCart = [...cart, cartItem];
      }
      
      setCart(updatedCart);
      localStorage.setItem('bersemarket_cart', JSON.stringify(updatedCart));
      
      showSnackbar('Added to cart!', 'success');
    } catch (error) {
      showSnackbar('Failed to add to cart', 'error');
    }
  };

  const handleBuyNow = async (product: Product) => {
    await handleAddToCart(product, 1);
    navigate('/checkout', {
      state: {
        items: [{
          ...product,
          quantity: 1,
          price: product.flashDealPrice || product.price
        }],
        source: 'buy_now'
      }
    });
  };

  const handleToggleWishlist = async (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      let updatedWishlist: string[];
      
      if (wishlist.includes(product.id)) {
        updatedWishlist = wishlist.filter(id => id !== product.id);
        showSnackbar('Removed from wishlist', 'info');
      } else {
        updatedWishlist = [...wishlist, product.id];
        showSnackbar('Added to wishlist', 'success');
      }
      
      setWishlist(updatedWishlist);
      localStorage.setItem('bersemarket_wishlist', JSON.stringify(updatedWishlist));
      
      // Update product state
      setProducts(prev => prev.map(p =>
        p.id === product.id ? { ...p, userSaved: !p.userSaved } : p
      ));
      
    } catch (error) {
      showSnackbar('Failed to update wishlist', 'error');
    }
  };

  const handleShareProduct = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (navigator.share) {
      navigator.share({
        title: product.title,
        text: product.description,
        url: `${window.location.origin}/market/product/${product.id}`
      });
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(`${window.location.origin}/market/product/${product.id}`);
      showSnackbar('Link copied to clipboard!', 'success');
    }
  };

  const trackProductView = (productId: string) => {
    // Track product view for analytics
    console.log(`Product viewed: ${productId}`);
  };

  // Navigation
  const handleBack = () => {
    navigate('/dashboard');
  };

  const handleSellClick = () => {
    setShowListingModal(true);
  };

  const handleCartClick = () => {
    setShowCartModal(true);
  };

  const handleFilterClick = () => {
    setShowFilterModal(true);
  };

  // Helper Functions
  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setSnackbar({ open: true, message, severity });
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const renderProductCard = (product: Product) => (
    <ProductCard
      key={product.id}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => handleProductClick(product)}
    >
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box position="relative">
          <CardMedia
            component="img"
            height="200"
            image={product.images[0] || '/placeholder-product.jpg'}
            alt={product.title}
          />
          
          {/* Badges */}
          <Box
            position="absolute"
            top={8}
            left={8}
            display="flex"
            flexDirection="column"
            gap={1}
          >
            {product.isFlashDeal && (
              <Chip
                icon={<FlashOn />}
                label="Flash Deal"
                size="small"
                sx={{
                  background: 'linear-gradient(45deg, #ff6b6b, #feca57)',
                  color: 'white',
                  fontWeight: 'bold'
                }}
              />
            )}
            {product.isFeatured && (
              <Chip
                icon={<Star />}
                label="Featured"
                size="small"
                color="primary"
              />
            )}
            {product.isHalal && (
              <Chip
                label="Halal"
                size="small"
                sx={{
                  background: '#4caf50',
                  color: 'white'
                }}
              />
            )}
            {product.condition === 'new' && (
              <Chip
                label="New"
                size="small"
                color="info"
              />
            )}
          </Box>
          
          {/* Action Buttons */}
          <Box
            position="absolute"
            top={8}
            right={8}
            display="flex"
            flexDirection="column"
            gap={1}
          >
            <IconButton
              size="small"
              onClick={(e) => handleToggleWishlist(product, e)}
              sx={{
                background: 'rgba(255,255,255,0.9)',
                '&:hover': { background: 'rgba(255,255,255,1)' }
              }}
            >
              {wishlist.includes(product.id) ? (
                <Favorite color="error" />
              ) : (
                <FavoriteBorder />
              )}
            </IconButton>
            <IconButton
              size="small"
              onClick={(e) => handleShareProduct(product, e)}
              sx={{
                background: 'rgba(255,255,255,0.9)',
                '&:hover': { background: 'rgba(255,255,255,1)' }
              }}
            >
              <Share />
            </IconButton>
          </Box>
          
          {/* Flash Deal Timer */}
          {product.isFlashDeal && product.flashDealEndTime && (
            <Box
              position="absolute"
              bottom={8}
              left={8}
            >
              <FlashDealTimer>
                <Schedule sx={{ fontSize: 16 }} />
                {formatFlashDealTimer(flashDealTimers[product.id] || 0)}
              </FlashDealTimer>
            </Box>
          )}
        </Box>
        
        <CardContent sx={{ flex: 1, pb: 1 }}>
          <Typography variant="h6" gutterBottom noWrap>
            {product.title}
          </Typography>
          
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <Avatar
              src={product.sellerName}
              sx={{ width: 24, height: 24 }}
            >
              {product.sellerName[0]}
            </Avatar>
            <Typography variant="body2" color="text.secondary" noWrap sx={{ flex: 1 }}>
              {product.sellerName}
            </Typography>
            {product.sellerVerified && (
              <Verified sx={{ fontSize: 16, color: '#1976d2' }} />
            )}
          </Box>
          
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <Rating value={product.sellerRating} readOnly size="small" precision={0.1} />
            <Typography variant="caption" color="text.secondary">
              ({product.sellerRating})
            </Typography>
          </Box>
          
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">
              {product.location}
            </Typography>
          </Box>
          
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <Box display="flex" alignItems="center" gap={1}>
              <Visibility sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                {product.views}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Favorite sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                {product.likes}
              </Typography>
            </Box>
          </Box>
          
          {/* Price */}
          <Box mb={2}>
            {product.originalPrice && product.originalPrice > product.price ? (
              <Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography
                    variant="h6"
                    color="error"
                    fontWeight="bold"
                  >
                    RM {product.flashDealPrice || product.price}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ textDecoration: 'line-through' }}
                  >
                    RM {product.originalPrice}
                  </Typography>
                </Box>
                <Chip
                  label={`${Math.round((1 - (product.flashDealPrice || product.price) / product.originalPrice) * 100)}% OFF`}
                  size="small"
                  color="error"
                  sx={{ mt: 0.5 }}
                />
              </Box>
            ) : (
              <Typography
                variant="h6"
                color="primary"
                fontWeight="bold"
              >
                RM {product.flashDealPrice || product.price}
              </Typography>
            )}
            {product.negotiable && (
              <Chip
                label="Negotiable"
                size="small"
                variant="outlined"
                sx={{ mt: 0.5 }}
              />
            )}
          </Box>
          
          {/* Stock Info */}
          <Box mb={2}>
            {product.stock > 0 ? (
              <Typography
                variant="body2"
                color={product.stock < 5 ? 'error' : 'success.main'}
              >
                {product.stock < 5 ? `Only ${product.stock} left!` : `${product.stock} available`}
              </Typography>
            ) : (
              <Typography variant="body2" color="error">
                Out of Stock
              </Typography>
            )}
          </Box>
          
          {/* Shipping Options */}
          <Box display="flex" gap={0.5} flexWrap="wrap">
            {product.shippingOptions.pickup && (
              <Chip label="Pickup" size="small" variant="outlined" />
            )}
            {product.shippingOptions.delivery && (
              <Chip label="COD" size="small" variant="outlined" />
            )}
            {product.shippingOptions.shipping && (
              <Chip 
                label={product.shippingOptions.shippingCost ? `Ship RM${product.shippingOptions.shippingCost}` : 'Free Ship'} 
                size="small" 
                variant="outlined" 
              />
            )}
          </Box>
        </CardContent>
        
        <CardActions sx={{ px: 2, pb: 2 }}>
          <Button
            fullWidth
            variant="outlined"
            onClick={(e) => {
              e.stopPropagation();
              handleAddToCart(product);
            }}
            disabled={product.stock === 0}
            startIcon={<ShoppingCart />}
          >
            Add to Cart
          </Button>
          <Button
            fullWidth
            variant="contained"
            onClick={(e) => {
              e.stopPropagation();
              handleBuyNow(product);
            }}
            disabled={product.stock === 0}
          >
            Buy Now
          </Button>
        </CardActions>
      </Card>
    </ProductCard>
  );

  return (
    <MarketContainer maxWidth="lg">
      {/* Header */}
      <HeaderSection elevation={0}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <IconButton onClick={handleBack} edge="start">
              <ArrowBack />
            </IconButton>
            <Typography variant="h6" fontWeight="bold">
              BerseMarket
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Badge badgeContent={getCartItemCount()} color="primary">
              <IconButton onClick={handleCartClick}>
                <ShoppingCart />
              </IconButton>
            </Badge>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleSellClick}
              sx={{
                borderRadius: 20,
                textTransform: 'none',
                background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
              }}
            >
              Sell
            </Button>
          </Box>
        </Box>

        {/* Search Bar */}
        <Box display="flex" gap={1} mb={2}>
          <SearchBar
            fullWidth
            placeholder="Search products, services, or sellers..."
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
              background: filters.categories.length > 0 ? '#2196f3' : '#f5f5f5',
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
              onClick={() => setSelectedCategory(category.id)}
              active={selectedCategory === category.id}
            />
          ))}
        </Box>

        {/* View Controls */}
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <IconButton
              onClick={() => setViewMode('grid')}
              color={viewMode === 'grid' ? 'primary' : 'default'}
            >
              <ViewModule />
            </IconButton>
            <IconButton
              onClick={() => setViewMode('list')}
              color={viewMode === 'list' ? 'primary' : 'default'}
            >
              <ViewList />
            </IconButton>
          </Box>
          
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="body2" color="text.secondary">
              Sort:
            </Typography>
            <Button
              size="small"
              variant="outlined"
              endIcon={<Sort />}
              onClick={(e) => {
                // Show sort menu (simplified for demo)
                const options = ['popular', 'price_asc', 'price_desc', 'date', 'rating'];
                const currentIndex = options.indexOf(sortBy);
                const nextIndex = (currentIndex + 1) % options.length;
                setSortBy(options[nextIndex] as any);
              }}
            >
              {sortBy === 'popular' && 'Popular'}
              {sortBy === 'price_asc' && 'Price ↑'}
              {sortBy === 'price_desc' && 'Price ↓'}
              {sortBy === 'date' && 'Latest'}
              {sortBy === 'rating' && 'Rating'}
            </Button>
          </Box>
        </Box>
      </HeaderSection>

      {/* Flash Deals Section */}
      {flashDeals.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Box display="flex" alignItems="center" justifyContent="between" mb={2}>
            <Box display="flex" alignItems="center" gap={1}>
              <LocalFireDepartment color="error" />
              <Typography variant="h6" fontWeight="bold">
                Flash Deals
              </Typography>
            </Box>
            <Button size="small" endIcon={<NavigateNext />}>
              View All
            </Button>
          </Box>
          
          <Box sx={{ overflowX: 'auto', display: 'flex', gap: 2, pb: 1 }}>
            {flashDeals.map(deal => (
              <FlashDealCard
                key={deal.id}
                onClick={() => handleProductClick(deal)}
                sx={{ minWidth: 280, cursor: 'pointer' }}
              >
                <CardMedia
                  component="img"
                  height="140"
                  image={deal.images[0]}
                  alt={deal.title}
                />
                <CardContent>
                  <Typography variant="h6" noWrap color="inherit">
                    {deal.title}
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Typography variant="h5" fontWeight="bold">
                      RM {deal.flashDealPrice}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ textDecoration: 'line-through', opacity: 0.7 }}
                    >
                      RM {deal.price}
                    </Typography>
                  </Box>
                  {flashDealTimers[deal.id] > 0 && (
                    <FlashDealTimer>
                      <FlashOn sx={{ fontSize: 16 }} />
                      Ends in {formatFlashDealTimer(flashDealTimers[deal.id])}
                    </FlashDealTimer>
                  )}
                </CardContent>
              </FlashDealCard>
            ))}
          </Box>
        </Box>
      )}

      {/* Products Grid */}
      <Grid container spacing={2}>
        {loading && filteredProducts.length === 0 ? (
          // Loading skeletons
          Array.from({ length: 8 }).map((_, i) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
              <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
            </Grid>
          ))
        ) : (
          filteredProducts.map((product) => (
            <Grid item xs={12} sm={6} md={viewMode === 'list' ? 12 : 4} lg={viewMode === 'list' ? 12 : 3} key={product.id}>
              {renderProductCard(product)}
            </Grid>
          ))
        )}
      </Grid>

      {/* Load More Indicator */}
      <Box ref={observerRef} sx={{ height: 100, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        {loading && hasMore && (
          <CircularProgress />
        )}
        {!hasMore && filteredProducts.length > 0 && (
          <Typography color="text.secondary">No more products</Typography>
        )}
      </Box>

      {/* Empty State */}
      {!loading && filteredProducts.length === 0 && (
        <Box textAlign="center" py={8}>
          <Storefront sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No products found
          </Typography>
          <Typography color="text.secondary" paragraph>
            Try adjusting your filters or search query
          </Typography>
          <Button
            variant="contained"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setFilters(prev => ({ ...prev, categories: [] }));
            }}
          >
            Clear Filters
          </Button>
        </Box>
      )}

      {/* Modals */}
      <Suspense fallback={null}>
        {showCartModal && (
          <CartModal
            open={showCartModal}
            onClose={() => setShowCartModal(false)}
            cart={cart}
            onUpdateCart={setCart}
            onCheckout={() => {
              setShowCartModal(false);
              navigate('/checkout');
            }}
          />
        )}

        {showListingModal && (
          <CreateListingModal
            open={showListingModal}
            onClose={() => setShowListingModal(false)}
            onCreateListing={(listingData) => {
              console.log('Creating listing:', listingData);
              showSnackbar('Product listed successfully!', 'success');
              setShowListingModal(false);
            }}
          />
        )}

        {showFilterModal && (
          <FilterModal
            open={showFilterModal}
            onClose={() => setShowFilterModal(false)}
            filters={filters}
            onApplyFilters={(newFilters) => {
              setFilters(newFilters);
              setShowFilterModal(false);
            }}
          />
        )}

        {showProductModal && selectedProduct && (
          <ProductDetailsModal
            open={showProductModal}
            onClose={() => setShowProductModal(false)}
            product={selectedProduct}
            onAddToCart={() => handleAddToCart(selectedProduct)}
            onBuyNow={() => handleBuyNow(selectedProduct)}
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
    </MarketContainer>
  );
};

export default BerseMarketScreen;