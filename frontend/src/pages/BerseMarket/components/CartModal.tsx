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
  Checkbox,
  TextField,
  Chip,
  Divider,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  Badge,
  Tooltip,
  Collapse,
  Paper,
  Grid,
} from '@mui/material';
import {
  Close,
  ShoppingCart,
  Add,
  Remove,
  Delete,
  LocalOffer,
  CheckCircle,
  Error,
  ShoppingBag,
  Payment,
  LocalShipping,
  Storefront,
  ExpandMore,
  ExpandLess,
  AttachMoney,
  Star,
  Verified,
  Schedule,
  LocationOn,
} from '@mui/icons-material';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface Product {
  id: string;
  title: string;
  images: string[];
  sellerName: string;
  sellerRating: number;
  sellerVerified?: boolean;
  location: string;
}

interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  price: number;
  selected: boolean;
}

interface Voucher {
  code: string;
  type: 'percentage' | 'fixed' | 'shipping';
  value: number;
  minPurchase: number;
  description: string;
}

interface CartModalProps {
  open: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateCart: (cart: CartItem[]) => void;
  onCheckout: () => void;
}

const StyledDialog = styled(Dialog)`
  .MuiDialog-paper {
    border-radius: 16px;
    max-width: 600px;
    width: 100%;
    max-height: 90vh;
  }
`;

const CartItemCard = styled(motion.div)`
  background: white;
  border-radius: 12px;
  border: 1px solid #f0f0f0;
  margin-bottom: 12px;
  overflow: hidden;
  
  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

const QuantityButton = styled(IconButton)`
  width: 32px;
  height: 32px;
  border: 1px solid #e0e0e0;
  background: white;
  
  &:hover {
    background: #f5f5f5;
  }
  
  &:disabled {
    background: #f5f5f5;
    color: #bdbdbd;
  }
`;

const QuantityDisplay = styled(Box)`
  min-width: 40px;
  text-align: center;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const VoucherInput = styled(TextField)`
  .MuiOutlinedInput-root {
    border-radius: 8px;
  }
`;

const AppliedVoucher = styled(Box)`
  background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
`;

const SummaryRow = styled(Box)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  
  &.total {
    font-size: 1.1rem;
    font-weight: bold;
    color: #2196f3;
    padding-top: 8px;
    border-top: 1px solid #e0e0e0;
  }
  
  &.discount {
    color: #4caf50;
  }
`;

const EmptyCartBox = styled(Box)`
  text-align: center;
  padding: 48px 24px;
  
  svg {
    font-size: 64px;
    color: #bdbdbd;
    margin-bottom: 16px;
  }
`;

const CartModal: React.FC<CartModalProps> = ({
  open,
  onClose,
  cart,
  onUpdateCart,
  onCheckout
}) => {
  const navigate = useNavigate();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<Voucher | null>(null);
  const [showVoucherError, setShowVoucherError] = useState('');
  const [expandedSellers, setExpandedSellers] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);

  // Initialize selected items when cart changes
  useEffect(() => {
    if (cart.length > 0) {
      setSelectedItems(cart.filter(item => item.selected).map(item => item.id));
    }
  }, [cart]);

  const groupedCart = cart.reduce((acc, item) => {
    const sellerId = item.product.sellerName;
    if (!acc[sellerId]) {
      acc[sellerId] = [];
    }
    acc[sellerId].push(item);
    return acc;
  }, {} as Record<string, CartItem[]>);

  const calculateSubtotal = (): number => {
    return cart
      .filter(item => selectedItems.includes(item.id))
      .reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateShipping = (): number => {
    // Mock shipping calculation
    const uniqueSellers = new Set(
      cart
        .filter(item => selectedItems.includes(item.id))
        .map(item => item.product.sellerName)
    );
    
    return uniqueSellers.size * 5; // RM 5 per seller
  };

  const calculateDiscount = (): number => {
    if (!appliedVoucher) return 0;
    
    const subtotal = calculateSubtotal();
    
    if (subtotal < appliedVoucher.minPurchase) return 0;
    
    switch (appliedVoucher.type) {
      case 'percentage':
        return (subtotal * appliedVoucher.value) / 100;
      case 'fixed':
        return Math.min(appliedVoucher.value, subtotal);
      case 'shipping':
        return calculateShipping();
      default:
        return 0;
    }
  };

  const calculateTotal = (): number => {
    return calculateSubtotal() + calculateShipping() - calculateDiscount();
  };

  const handleSelectItem = (itemId: string) => {
    const newSelected = selectedItems.includes(itemId)
      ? selectedItems.filter(id => id !== itemId)
      : [...selectedItems, itemId];
    
    setSelectedItems(newSelected);
    
    // Update cart item selected state
    const updatedCart = cart.map(item => ({
      ...item,
      selected: newSelected.includes(item.id)
    }));
    onUpdateCart(updatedCart);
  };

  const handleSelectAll = () => {
    if (selectedItems.length === cart.length) {
      setSelectedItems([]);
      onUpdateCart(cart.map(item => ({ ...item, selected: false })));
    } else {
      const allIds = cart.map(item => item.id);
      setSelectedItems(allIds);
      onUpdateCart(cart.map(item => ({ ...item, selected: true })));
    }
  };

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    const updatedCart = cart.map(item =>
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    );
    
    onUpdateCart(updatedCart);
    localStorage.setItem('bersemarket_cart', JSON.stringify(updatedCart));
  };

  const handleRemoveItem = (itemId: string) => {
    const updatedCart = cart.filter(item => item.id !== itemId);
    setSelectedItems(prev => prev.filter(id => id !== itemId));
    onUpdateCart(updatedCart);
    localStorage.setItem('bersemarket_cart', JSON.stringify(updatedCart));
  };

  const handleClearCart = () => {
    if (window.confirm('Remove all items from cart?')) {
      onUpdateCart([]);
      setSelectedItems([]);
      localStorage.setItem('bersemarket_cart', JSON.stringify([]));
    }
  };

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) {
      setShowVoucherError('Please enter a voucher code');
      return;
    }

    setLoading(true);
    
    try {
      // Mock voucher validation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockVouchers: Record<string, Voucher> = {
        'SAVE10': {
          code: 'SAVE10',
          type: 'percentage',
          value: 10,
          minPurchase: 50,
          description: '10% off orders above RM 50'
        },
        'FREE20': {
          code: 'FREE20',
          type: 'fixed',
          value: 20,
          minPurchase: 100,
          description: 'RM 20 off orders above RM 100'
        },
        'FREESHIP': {
          code: 'FREESHIP',
          type: 'shipping',
          value: 0,
          minPurchase: 0,
          description: 'Free shipping on all orders'
        }
      };

      const voucher = mockVouchers[voucherCode.toUpperCase()];
      
      if (!voucher) {
        setShowVoucherError('Invalid voucher code');
        return;
      }
      
      const subtotal = calculateSubtotal();
      if (subtotal < voucher.minPurchase) {
        setShowVoucherError(`Minimum purchase of RM ${voucher.minPurchase} required`);
        return;
      }
      
      setAppliedVoucher(voucher);
      setShowVoucherError('');
      setVoucherCode('');
      
    } catch (error) {
      setShowVoucherError('Failed to apply voucher');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
  };

  const toggleSellerExpansion = (sellerName: string) => {
    setExpandedSellers(prev => ({
      ...prev,
      [sellerName]: !prev[sellerName]
    }));
  };

  const handleProceedToCheckout = () => {
    if (selectedItems.length === 0) {
      alert('Please select items to checkout');
      return;
    }
    
    const checkoutItems = cart.filter(item => selectedItems.includes(item.id));
    
    // Save checkout session
    const checkoutData = {
      items: checkoutItems,
      voucher: appliedVoucher,
      subtotal: calculateSubtotal(),
      shipping: calculateShipping(),
      discount: calculateDiscount(),
      total: calculateTotal()
    };
    
    localStorage.setItem('bersemarket_checkout', JSON.stringify(checkoutData));
    
    onClose();
    onCheckout();
  };

  const renderCartItem = (item: CartItem) => (
    <CartItemCard
      key={item.id}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.3 }}
    >
      <CardContent sx={{ p: 2 }}>
        <Box display="flex" gap={2}>
          <Checkbox
            checked={selectedItems.includes(item.id)}
            onChange={() => handleSelectItem(item.id)}
          />
          
          <Box
            component="img"
            src={item.product.images[0] || '/placeholder-product.jpg'}
            alt={item.product.title}
            sx={{
              width: 80,
              height: 80,
              borderRadius: 2,
              objectFit: 'cover'
            }}
          />
          
          <Box flex={1}>
            <Typography variant="subtitle1" fontWeight="bold" noWrap>
              {item.product.title}
            </Typography>
            
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <Avatar sx={{ width: 20, height: 20 }}>
                {item.product.sellerName[0]}
              </Avatar>
              <Typography variant="body2" color="text.secondary">
                {item.product.sellerName}
              </Typography>
              {item.product.sellerVerified && (
                <Verified sx={{ fontSize: 14, color: '#1976d2' }} />
              )}
            </Box>
            
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <LocationOn sx={{ fontSize: 14, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                {item.product.location}
              </Typography>
            </Box>
            
            <Typography variant="h6" color="primary" fontWeight="bold">
              RM {item.price.toFixed(2)}
            </Typography>
          </Box>
          
          <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
            <Box display="flex" alignItems="center" gap={1}>
              <QuantityButton
                size="small"
                onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                disabled={item.quantity <= 1}
              >
                <Remove fontSize="small" />
              </QuantityButton>
              
              <QuantityDisplay>
                {item.quantity}
              </QuantityDisplay>
              
              <QuantityButton
                size="small"
                onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
              >
                <Add fontSize="small" />
              </QuantityButton>
            </Box>
            
            <Typography variant="body2" color="text.secondary">
              Total: RM {(item.price * item.quantity).toFixed(2)}
            </Typography>
            
            <IconButton
              size="small"
              color="error"
              onClick={() => handleRemoveItem(item.id)}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </CardContent>
    </CartItemCard>
  );

  const renderGroupedCart = () => (
    <Box>
      {Object.entries(groupedCart).map(([sellerName, items]) => (
        <Paper key={sellerName} sx={{ mb: 2, overflow: 'hidden' }}>
          <Box
            sx={{
              p: 2,
              background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
              cursor: 'pointer'
            }}
            onClick={() => toggleSellerExpansion(sellerName)}
          >
            <Box display="flex" alignItems="center" justifyContent="between">
              <Box display="flex" alignItems="center" gap={1}>
                <Storefront color="primary" />
                <Typography variant="subtitle1" fontWeight="bold">
                  {sellerName}
                </Typography>
                <Badge badgeContent={items.length} color="primary" />
              </Box>
              
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="body2" color="text.secondary">
                  RM {items.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2)}
                </Typography>
                {expandedSellers[sellerName] ? <ExpandLess /> : <ExpandMore />}
              </Box>
            </Box>
          </Box>
          
          <Collapse in={expandedSellers[sellerName] !== false}>
            <Box sx={{ p: 1 }}>
              {items.map(renderCartItem)}
            </Box>
          </Collapse>
        </Paper>
      ))}
    </Box>
  );

  if (cart.length === 0) {
    return (
      <StyledDialog open={open} onClose={onClose} fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={1}>
              <ShoppingCart color="primary" />
              <Typography variant="h6">Shopping Cart</Typography>
            </Box>
            <IconButton onClick={onClose} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          <EmptyCartBox>
            <ShoppingBag />
            <Typography variant="h6" gutterBottom>
              Your cart is empty
            </Typography>
            <Typography color="text.secondary" paragraph>
              Browse our marketplace and add items to your cart
            </Typography>
            <Button
              variant="contained"
              onClick={onClose}
              sx={{ borderRadius: 20 }}
            >
              Continue Shopping
            </Button>
          </EmptyCartBox>
        </DialogContent>
      </StyledDialog>
    );
  }

  return (
    <StyledDialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <ShoppingCart color="primary" />
            <Typography variant="h6">Shopping Cart</Typography>
            <Badge badgeContent={cart.length} color="primary" />
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Button
              size="small"
              color="error"
              onClick={handleClearCart}
              startIcon={<Delete />}
            >
              Clear All
            </Button>
            <IconButton onClick={onClose} size="small">
              <Close />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ px: 3, maxHeight: '60vh', overflowY: 'auto' }}>
        {/* Select All */}
        <Box display="flex" alignItems="center" justifyContent="between" mb={2}>
          <FormControlLabel
            control={
              <Checkbox
                checked={selectedItems.length === cart.length && cart.length > 0}
                indeterminate={selectedItems.length > 0 && selectedItems.length < cart.length}
                onChange={handleSelectAll}
              />
            }
            label={`Select All (${selectedItems.length}/${cart.length})`}
          />
          
          <Button
            size="small"
            variant="outlined"
            onClick={() => setExpandedSellers({})}
          >
            Collapse All
          </Button>
        </Box>

        {/* Cart Items */}
        <AnimatePresence>
          {renderGroupedCart()}
        </AnimatePresence>

        {/* Voucher Section */}
        <Paper sx={{ p: 2, mt: 2, background: '#f8f9fa' }}>
          <Typography variant="subtitle2" gutterBottom>
            Voucher Code
          </Typography>
          
          <Box display="flex" gap={1}>
            <VoucherInput
              fullWidth
              size="small"
              placeholder="Enter voucher code"
              value={voucherCode}
              onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
              error={!!showVoucherError}
              helperText={showVoucherError}
              InputProps={{
                startAdornment: <LocalOffer color="action" sx={{ mr: 1 }} />
              }}
            />
            <Button
              variant="outlined"
              onClick={handleApplyVoucher}
              disabled={loading || !voucherCode.trim()}
            >
              {loading ? 'Applying...' : 'Apply'}
            </Button>
          </Box>

          {appliedVoucher && (
            <AppliedVoucher>
              <Box>
                <Typography variant="subtitle2">
                  {appliedVoucher.code}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  {appliedVoucher.description}
                </Typography>
              </Box>
              
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="subtitle2">
                  -RM {calculateDiscount().toFixed(2)}
                </Typography>
                <IconButton
                  size="small"
                  sx={{ color: 'inherit' }}
                  onClick={handleRemoveVoucher}
                >
                  <Close fontSize="small" />
                </IconButton>
              </Box>
            </AppliedVoucher>
          )}

          {/* Sample Vouchers */}
          <Box mt={2}>
            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
              Available vouchers: SAVE10, FREE20, FREESHIP
            </Typography>
          </Box>
        </Paper>
      </DialogContent>

      {/* Order Summary */}
      <Box sx={{ px: 3, py: 2, background: '#f8f9fa', borderTop: '1px solid #e0e0e0' }}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Order Summary
        </Typography>
        
        <SummaryRow>
          <Typography variant="body2">
            Subtotal ({selectedItems.length} items):
          </Typography>
          <Typography variant="body2">
            RM {calculateSubtotal().toFixed(2)}
          </Typography>
        </SummaryRow>
        
        <SummaryRow>
          <Typography variant="body2">Shipping:</Typography>
          <Typography variant="body2">
            RM {calculateShipping().toFixed(2)}
          </Typography>
        </SummaryRow>
        
        {appliedVoucher && calculateDiscount() > 0 && (
          <SummaryRow className="discount">
            <Typography variant="body2">
              Discount ({appliedVoucher.code}):
            </Typography>
            <Typography variant="body2">
              -RM {calculateDiscount().toFixed(2)}
            </Typography>
          </SummaryRow>
        )}
        
        <Divider sx={{ my: 1 }} />
        
        <SummaryRow className="total">
          <Typography>Total:</Typography>
          <Typography>RM {calculateTotal().toFixed(2)}</Typography>
        </SummaryRow>
      </Box>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose}>Continue Shopping</Button>
        <Button
          variant="contained"
          onClick={handleProceedToCheckout}
          disabled={selectedItems.length === 0}
          startIcon={<Payment />}
          sx={{
            borderRadius: 20,
            px: 3,
            background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)'
          }}
        >
          Checkout ({selectedItems.length})
        </Button>
      </DialogActions>
    </StyledDialog>
  );
};

export default CartModal;