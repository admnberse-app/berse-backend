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
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  Divider,
  Alert,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  InputAdornment,
  Tab,
  Tabs,
  Collapse,
  Grid,
} from '@mui/material';
import {
  Close,
  Payment,
  CreditCard,
  AccountBalance,
  Wallet,
  Security,
  CheckCircle,
  Error,
  Receipt,
  Info,
  Star,
  AttachMoney,
  Verified,
  Schedule,
  LocationOn,
  Person,
  Lock,
  ExpandMore,
  ExpandLess,
} from '@mui/icons-material';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

interface Event {
  id: string;
  title: string;
  description: string;
  dateTime: string;
  location: string;
  host: string;
  price: number;
  points: number;
  image?: string;
  maxParticipants: number;
  currentParticipants: number;
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank' | 'ewallet' | 'points';
  name: string;
  icon: string;
  details?: string;
  enabled: boolean;
  fee?: number;
  feeType?: 'fixed' | 'percentage';
}

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  event: Event;
  onPaymentSuccess: () => void;
}

const StyledDialog = styled(Dialog)`
  .MuiDialog-paper {
    border-radius: 16px;
    max-width: 600px;
    width: 100%;
    max-height: 90vh;
  }
`;

const PaymentCard = styled(motion.div)<{ selected?: boolean }>`
  cursor: pointer;
  border-radius: 12px;
  border: 2px solid ${props => props.selected ? '#667eea' : '#e0e0e0'};
  background: ${props => props.selected ? '#f3f4ff' : 'white'};
  transition: all 0.3s ease;
  margin-bottom: 12px;
  
  &:hover {
    border-color: #667eea;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
  }
`;

const PriceBreakdown = styled(Paper)`
  padding: 16px;
  border-radius: 12px;
  background: linear-gradient(135deg, #f8f9ff 0%, #e8efff 100%);
  margin: 16px 0;
`;

const SecurePayment = styled(Box)`
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  margin: 16px 0;
`;

const PaymentModal: React.FC<PaymentModalProps> = ({
  open,
  onClose,
  event,
  onPaymentSuccess,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [paymentDetails, setPaymentDetails] = useState<any>({});
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [usePoints, setUsePoints] = useState(false);
  const [availablePoints] = useState(850);
  const [activeTab, setActiveTab] = useState(0);

  const steps = ['Payment Method', 'Payment Details', 'Confirmation'];

  // Platform fee configuration
  const platformFeePercentage = 5;
  const platformFeeFixed = 2; // RM 2 minimum fee

  // Payment methods
  const paymentMethods: PaymentMethod[] = [
    {
      id: 'fpx',
      type: 'bank',
      name: 'FPX Online Banking',
      icon: '🏦',
      enabled: true,
      fee: 0,
      feeType: 'fixed',
    },
    {
      id: 'card',
      type: 'card',
      name: 'Credit/Debit Card',
      icon: '💳',
      enabled: true,
      fee: 2.5,
      feeType: 'percentage',
    },
    {
      id: 'grabpay',
      type: 'ewallet',
      name: 'GrabPay',
      icon: '🟢',
      enabled: true,
      fee: 1,
      feeType: 'fixed',
    },
    {
      id: 'tng',
      type: 'ewallet',
      name: 'Touch n Go eWallet',
      icon: '🔵',
      enabled: true,
      fee: 0,
      feeType: 'fixed',
    },
    {
      id: 'boost',
      type: 'ewallet',
      name: 'Boost',
      icon: '🟠',
      enabled: true,
      fee: 0,
      feeType: 'fixed',
    },
    {
      id: 'points',
      type: 'points',
      name: 'BersePoints',
      icon: '⭐',
      enabled: true,
      fee: 0,
      feeType: 'fixed',
    },
  ];

  const calculateFees = () => {
    const selectedMethod = paymentMethods.find(m => m.id === selectedPaymentMethod);
    const basePrice = event.price;
    
    let platformFee = Math.max((basePrice * platformFeePercentage) / 100, platformFeeFixed);
    let paymentFee = 0;

    if (selectedMethod?.fee) {
      if (selectedMethod.feeType === 'percentage') {
        paymentFee = (basePrice * selectedMethod.fee) / 100;
      } else {
        paymentFee = selectedMethod.fee;
      }
    }

    const pointsDiscount = usePoints ? Math.min(availablePoints * 0.01, basePrice * 0.2) : 0;
    const total = basePrice + platformFee + paymentFee - pointsDiscount;

    return {
      basePrice,
      platformFee,
      paymentFee,
      pointsDiscount,
      total: Math.max(total, 0),
      pointsUsed: usePoints ? Math.min(availablePoints, Math.floor(pointsDiscount * 100)) : 0,
    };
  };

  const handlePaymentMethodSelect = (methodId: string) => {
    setSelectedPaymentMethod(methodId);
    setError(null);
  };

  const handleNext = () => {
    if (activeStep === 0 && !selectedPaymentMethod) {
      setError('Please select a payment method');
      return;
    }
    
    if (activeStep === 1) {
      const isValid = validatePaymentDetails();
      if (!isValid) return;
    }

    if (activeStep === 2 && !agreeToTerms) {
      setError('Please agree to the terms and conditions');
      return;
    }

    setActiveStep(prev => Math.min(prev + 1, steps.length - 1));
    setError(null);
  };

  const handleBack = () => {
    setActiveStep(prev => Math.max(prev - 1, 0));
    setError(null);
  };

  const validatePaymentDetails = (): boolean => {
    const method = paymentMethods.find(m => m.id === selectedPaymentMethod);
    
    if (method?.type === 'card') {
      if (!paymentDetails.cardNumber || !paymentDetails.expiryDate || !paymentDetails.cvv) {
        setError('Please fill in all card details');
        return false;
      }
    }
    
    if (method?.type === 'bank' && !paymentDetails.bank) {
      setError('Please select your bank');
      return false;
    }

    return true;
  };

  const handlePayment = async () => {
    try {
      setProcessing(true);
      setError(null);

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Mock random success/failure for demo
      const success = Math.random() > 0.1; // 90% success rate

      if (success) {
        onPaymentSuccess();
        setActiveStep(steps.length); // Move to success state
      } else {
        throw new Error('Payment failed. Please try again.');
      }
    } catch (error: any) {
      setError(error.message || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const renderPaymentMethodStep = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Choose Payment Method
      </Typography>
      
      <Tabs
        value={activeTab}
        onChange={(e, v) => setActiveTab(v)}
        sx={{ mb: 3 }}
      >
        <Tab label="Digital Payments" />
        <Tab label="Points & Credits" />
      </Tabs>

      {activeTab === 0 && (
        <Box>
          {paymentMethods.filter(m => m.type !== 'points').map((method) => (
            <PaymentCard
              key={method.id}
              selected={selectedPaymentMethod === method.id}
              onClick={() => handlePaymentMethodSelect(method.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <Typography variant="h4">{method.icon}</Typography>
                  <Box flex={1}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {method.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {method.fee === 0 
                        ? 'No additional fees'
                        : method.feeType === 'percentage'
                        ? `${method.fee}% processing fee`
                        : `RM ${method.fee} processing fee`
                      }
                    </Typography>
                  </Box>
                  {selectedPaymentMethod === method.id && (
                    <CheckCircle color="primary" />
                  )}
                </Box>
              </CardContent>
            </PaymentCard>
          ))}
        </Box>
      )}

      {activeTab === 1 && (
        <Box>
          <PaymentCard
            selected={selectedPaymentMethod === 'points'}
            onClick={() => handlePaymentMethodSelect('points')}
          >
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Typography variant="h4">⭐</Typography>
                <Box flex={1}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    BersePoints
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Available: {availablePoints} points (RM {(availablePoints * 0.01).toFixed(2)} value)
                  </Typography>
                </Box>
                {selectedPaymentMethod === 'points' && (
                  <CheckCircle color="primary" />
                )}
              </Box>
            </CardContent>
          </PaymentCard>

          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              Points can cover up to 20% of the event price. Remaining balance will be charged to your default payment method.
            </Typography>
          </Alert>
        </Box>
      )}

      {selectedPaymentMethod && selectedPaymentMethod !== 'points' && (
        <FormControlLabel
          control={
            <Checkbox
              checked={usePoints}
              onChange={(e) => setUsePoints(e.target.checked)}
            />
          }
          label={`Use ${availablePoints} BersePoints for discount`}
          sx={{ mt: 2 }}
        />
      )}
    </Box>
  );

  const renderPaymentDetailsStep = () => {
    const method = paymentMethods.find(m => m.id === selectedPaymentMethod);

    if (method?.type === 'points') {
      const calculations = calculateFees();
      const pointsNeeded = Math.ceil(calculations.total * 100);

      if (availablePoints < pointsNeeded) {
        return (
          <Box>
            <Alert severity="error" sx={{ mb: 2 }}>
              Insufficient points. You need {pointsNeeded} points but only have {availablePoints} points available.
            </Alert>
            <Button onClick={handleBack}>Choose Another Payment Method</Button>
          </Box>
        );
      }

      return (
        <Box textAlign="center" py={4}>
          <Star sx={{ fontSize: 64, color: '#667eea', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Pay with BersePoints
          </Typography>
          <Typography variant="body1" paragraph>
            {pointsNeeded} points will be deducted from your account
          </Typography>
          <Chip
            label={`${availablePoints - pointsNeeded} points remaining`}
            color="primary"
          />
        </Box>
      );
    }

    if (method?.type === 'card') {
      return (
        <Box>
          <Typography variant="h6" gutterBottom>
            Card Information
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Card Number"
                placeholder="1234 5678 9012 3456"
                value={paymentDetails.cardNumber || ''}
                onChange={(e) => setPaymentDetails(prev => ({
                  ...prev,
                  cardNumber: e.target.value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ')
                }))}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CreditCard />
                    </InputAdornment>
                  ),
                  inputProps: { maxLength: 19 }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Expiry Date"
                placeholder="MM/YY"
                value={paymentDetails.expiryDate || ''}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  const formatted = value.replace(/(\d{2})(\d{0,2})/, '$1/$2').slice(0, 5);
                  setPaymentDetails(prev => ({ ...prev, expiryDate: formatted }));
                }}
                inputProps={{ maxLength: 5 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="CVV"
                type="password"
                placeholder="123"
                value={paymentDetails.cvv || ''}
                onChange={(e) => setPaymentDetails(prev => ({
                  ...prev,
                  cvv: e.target.value.replace(/\D/g, '')
                }))}
                inputProps={{ maxLength: 4 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Cardholder Name"
                value={paymentDetails.cardholderName || ''}
                onChange={(e) => setPaymentDetails(prev => ({
                  ...prev,
                  cardholderName: e.target.value
                }))}
              />
            </Grid>
          </Grid>

          <SecurePayment>
            <Lock />
            <Typography variant="body2">
              Your payment is secured with 256-bit SSL encryption
            </Typography>
          </SecurePayment>
        </Box>
      );
    }

    if (method?.type === 'bank') {
      const banks = [
        'Maybank', 'CIMB Bank', 'Public Bank', 'RHB Bank',
        'Hong Leong Bank', 'AmBank', 'UOB Malaysia', 'OCBC Bank'
      ];

      return (
        <Box>
          <Typography variant="h6" gutterBottom>
            Select Your Bank
          </Typography>
          
          <FormControl fullWidth>
            <FormLabel component="legend">Choose your bank</FormLabel>
            <RadioGroup
              value={paymentDetails.bank || ''}
              onChange={(e) => setPaymentDetails(prev => ({
                ...prev,
                bank: e.target.value
              }))}
            >
              {banks.map((bank) => (
                <FormControlLabel
                  key={bank}
                  value={bank}
                  control={<Radio />}
                  label={bank}
                />
              ))}
            </RadioGroup>
          </FormControl>

          <Alert severity="info" sx={{ mt: 2 }}>
            You will be redirected to your bank's secure login page to complete the payment.
          </Alert>
        </Box>
      );
    }

    if (method?.type === 'ewallet') {
      return (
        <Box textAlign="center" py={4}>
          <Typography variant="h4" gutterBottom>
            {method.icon}
          </Typography>
          <Typography variant="h6" gutterBottom>
            {method.name}
          </Typography>
          <Typography variant="body1" paragraph>
            You will be redirected to {method.name} to complete your payment
          </Typography>
          <Alert severity="info">
            Make sure you have the {method.name} app installed on your device
          </Alert>
        </Box>
      );
    }

    return null;
  };

  const renderConfirmationStep = () => {
    const calculations = calculateFees();
    const method = paymentMethods.find(m => m.id === selectedPaymentMethod);

    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Confirm Payment
        </Typography>

        {/* Event Summary */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box display="flex" gap={2}>
              {event.image && (
                <Box
                  component="img"
                  src={event.image}
                  alt={event.title}
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: 2,
                    objectFit: 'cover',
                  }}
                />
              )}
              <Box flex={1}>
                <Typography variant="h6" gutterBottom>
                  {event.title}
                </Typography>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <Schedule sx={{ fontSize: 16 }} />
                  <Typography variant="body2" color="text.secondary">
                    {new Date(event.dateTime).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <LocationOn sx={{ fontSize: 16 }} />
                  <Typography variant="body2" color="text.secondary">
                    {event.location}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <Person sx={{ fontSize: 16 }} />
                  <Typography variant="body2" color="text.secondary">
                    Hosted by {event.host}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Price Breakdown */}
        <PriceBreakdown>
          <Box display="flex" justifyContent="space-between" mb={2}>
            <Typography variant="h6">Price Breakdown</Typography>
            <Button
              size="small"
              onClick={() => setShowBreakdown(!showBreakdown)}
              endIcon={showBreakdown ? <ExpandLess /> : <ExpandMore />}
            >
              {showBreakdown ? 'Hide' : 'Show'} Details
            </Button>
          </Box>

          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography>Event Price</Typography>
            <Typography>RM {calculations.basePrice.toFixed(2)}</Typography>
          </Box>

          <Collapse in={showBreakdown}>
            <Box>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2" color="text.secondary">
                  Platform Fee ({platformFeePercentage}%)
                </Typography>
                <Typography variant="body2">
                  RM {calculations.platformFee.toFixed(2)}
                </Typography>
              </Box>

              {calculations.paymentFee > 0 && (
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2" color="text.secondary">
                    Payment Processing Fee
                  </Typography>
                  <Typography variant="body2">
                    RM {calculations.paymentFee.toFixed(2)}
                  </Typography>
                </Box>
              )}

              {calculations.pointsDiscount > 0 && (
                <Box display="flex" justifyContent="space-between" mb={1} color="success.main">
                  <Typography variant="body2">
                    Points Discount ({calculations.pointsUsed} points)
                  </Typography>
                  <Typography variant="body2">
                    -RM {calculations.pointsDiscount.toFixed(2)}
                  </Typography>
                </Box>
              )}

              <Divider sx={{ my: 1 }} />
            </Box>
          </Collapse>

          <Box display="flex" justifyContent="space-between" fontWeight="bold">
            <Typography variant="h6">Total</Typography>
            <Typography variant="h6" color="primary">
              RM {calculations.total.toFixed(2)}
            </Typography>
          </Box>
        </PriceBreakdown>

        {/* Payment Method Summary */}
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <Typography variant="h4">{method?.icon}</Typography>
          <Box>
            <Typography variant="subtitle1">
              Paying with {method?.name}
            </Typography>
            {method?.type === 'points' && (
              <Typography variant="body2" color="text.secondary">
                {Math.ceil(calculations.total * 100)} points will be deducted
              </Typography>
            )}
          </Box>
        </Box>

        {/* Terms Agreement */}
        <FormControlLabel
          control={
            <Checkbox
              checked={agreeToTerms}
              onChange={(e) => setAgreeToTerms(e.target.checked)}
            />
          }
          label="I agree to the Terms of Service and Refund Policy"
        />

        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            You'll earn +{event.points} BersePoints after attending this event!
          </Typography>
        </Alert>
      </Box>
    );
  };

  const renderSuccessStep = () => (
    <Box textAlign="center" py={4}>
      <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
      <Typography variant="h5" gutterBottom>
        Payment Successful!
      </Typography>
      <Typography variant="body1" paragraph>
        You've successfully registered for {event.title}
      </Typography>
      
      <Box display="flex" gap={1} justifyContent="center" mb={3}>
        <Chip
          icon={<Star />}
          label={`+${event.points} Points Earned`}
          color="primary"
        />
        <Chip
          icon={<Receipt />}
          label="Receipt Sent"
          color="success"
        />
      </Box>

      <Typography variant="body2" color="text.secondary">
        A confirmation email has been sent to your registered email address.
        You can view your ticket in the "My Events" section.
      </Typography>
    </Box>
  );

  return (
    <StyledDialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <Payment color="primary" />
            <Typography variant="h6">
              {activeStep >= steps.length ? 'Payment Complete' : 'Secure Payment'}
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ px: 3 }}>
        {activeStep < steps.length && (
          <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeStep === 0 && renderPaymentMethodStep()}
            {activeStep === 1 && renderPaymentDetailsStep()}
            {activeStep === 2 && renderConfirmationStep()}
            {activeStep >= steps.length && renderSuccessStep()}
          </motion.div>
        </AnimatePresence>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        {activeStep >= steps.length ? (
          <Button onClick={onClose} variant="contained" fullWidth>
            Done
          </Button>
        ) : (
          <>
            <Button
              onClick={handleBack}
              disabled={activeStep === 0 || processing}
            >
              Back
            </Button>
            <Box flex={1} />
            <Button onClick={onClose} disabled={processing}>
              Cancel
            </Button>
            {activeStep === steps.length - 1 ? (
              <Button
                onClick={handlePayment}
                variant="contained"
                disabled={processing || !agreeToTerms}
                startIcon={processing ? <CircularProgress size={20} /> : <Lock />}
              >
                {processing ? 'Processing...' : `Pay RM ${calculateFees().total.toFixed(2)}`}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                variant="contained"
                disabled={processing}
              >
                Next
              </Button>
            )}
          </>
        )}
      </DialogActions>
    </StyledDialog>
  );
};

export default PaymentModal;