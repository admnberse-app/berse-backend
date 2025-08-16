import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Chip,
  Alert,
  Slider,
  InputAdornment,
  CircularProgress,
  Autocomplete,
  Tab,
  Tabs,
  Paper,
  Divider,
} from '@mui/material';
import {
  Close,
  Send,
  Search,
  AccountBalanceWallet,
  Person,
  History,
  Star,
  TrendingUp,
  QrCode,
  CheckCircle,
  Warning,
} from '@mui/icons-material';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

interface Friend {
  id: string;
  name: string;
  username: string;
  avatar: string;
  lastTransaction?: Date;
  trustScore?: number;
}

interface SendPointsModalProps {
  open: boolean;
  onClose: () => void;
  currentBalance: number;
  onSend: (recipient: string, amount: number, message?: string) => void;
}

const BalanceCard = styled(Paper)`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
`;

const QuickAmountChip = styled(Chip)`
  margin: 4px;
  cursor: pointer;
  
  &:hover {
    transform: scale(1.05);
  }
`;

const RecipientCard = styled(Paper)`
  padding: 12px;
  border-radius: 8px;
  background: #f5f5f5;
  margin-bottom: 16px;
`;

const SuccessAnimation = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
`;

const SendPointsModal: React.FC<SendPointsModalProps> = ({
  open,
  onClose,
  currentBalance,
  onSend,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [recipient, setRecipient] = useState('');
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Mock data
  const recentFriends: Friend[] = [
    {
      id: '1',
      name: 'Sarah Ahmad',
      username: 'sarah_a',
      avatar: '/avatars/1.jpg',
      lastTransaction: new Date('2024-01-15'),
      trustScore: 95,
    },
    {
      id: '2',
      name: 'Omar Hassan',
      username: 'omar_h',
      avatar: '/avatars/2.jpg',
      lastTransaction: new Date('2024-01-10'),
      trustScore: 88,
    },
    {
      id: '3',
      name: 'Fatima Ali',
      username: 'fatima_ali',
      avatar: '/avatars/3.jpg',
      lastTransaction: new Date('2024-01-05'),
      trustScore: 92,
    },
  ];

  const quickAmounts = [10, 25, 50, 100, 250, 500];

  useEffect(() => {
    if (searchQuery) {
      searchFriends(searchQuery);
    } else {
      setSearchResults(recentFriends);
    }
  }, [searchQuery]);

  const searchFriends = async (query: string) => {
    setLoading(true);
    try {
      // Simulate API search
      await new Promise(resolve => setTimeout(resolve, 500));
      const filtered = recentFriends.filter(
        friend =>
          friend.name.toLowerCase().includes(query.toLowerCase()) ||
          friend.username.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(filtered);
    } catch (err) {
      setError('Failed to search friends');
    } finally {
      setLoading(false);
    }
  };

  const validateTransfer = (): boolean => {
    setValidationError(null);

    if (!selectedFriend && !recipient) {
      setValidationError('Please select a recipient');
      return false;
    }

    if (amount <= 0) {
      setValidationError('Please enter a valid amount');
      return false;
    }

    if (amount < 10) {
      setValidationError('Minimum transfer amount is 10 points');
      return false;
    }

    if (amount > currentBalance) {
      setValidationError('Insufficient balance');
      return false;
    }

    if (amount > 1000) {
      setValidationError('Maximum transfer amount is 1000 points per transaction');
      return false;
    }

    return true;
  };

  const handleSendPoints = async () => {
    if (!validateTransfer()) return;

    setLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      const recipientName = selectedFriend ? selectedFriend.name : recipient;
      onSend(recipientName, amount, message);

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        handleReset();
        onClose();
      }, 2000);
    } catch (err) {
      setError('Transfer failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setRecipient('');
    setSelectedFriend(null);
    setAmount(0);
    setMessage('');
    setSearchQuery('');
    setError(null);
    setValidationError(null);
    setActiveTab(0);
  };

  const handleQuickAmount = (value: number) => {
    setAmount(value);
  };

  const handleSliderChange = (event: Event, value: number | number[]) => {
    setAmount(value as number);
  };

  const handleFriendSelect = (friend: Friend) => {
    setSelectedFriend(friend);
    setRecipient(friend.username);
  };

  const calculateFee = (amount: number): number => {
    if (amount <= 100) return 0;
    if (amount <= 500) return 1;
    return 2;
  };

  const getMaxTransferAmount = (): number => {
    return Math.min(currentBalance, 1000);
  };

  if (showSuccess) {
    return (
      <Dialog open={open} maxWidth="sm" fullWidth>
        <DialogContent>
          <SuccessAnimation
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Points Sent Successfully!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {amount} points sent to {selectedFriend?.name || recipient}
            </Typography>
          </SuccessAnimation>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3 }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <Send color="primary" />
            <Typography variant="h6">Send Points</Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* Balance Display */}
        <BalanceCard elevation={0}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>
                Available Balance
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                {currentBalance.toLocaleString()}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                points
              </Typography>
            </Box>
            <AccountBalanceWallet sx={{ fontSize: 48, opacity: 0.5 }} />
          </Box>
        </BalanceCard>

        {/* Tabs for recipient selection */}
        <Tabs
          value={activeTab}
          onChange={(e, v) => setActiveTab(v)}
          sx={{ mb: 2 }}
        >
          <Tab label="Recent" icon={<History />} iconPosition="start" />
          <Tab label="Search" icon={<Search />} iconPosition="start" />
          <Tab label="QR Code" icon={<QrCode />} iconPosition="start" />
        </Tabs>

        {/* Recent Friends Tab */}
        {activeTab === 0 && (
          <Box>
            <List>
              {recentFriends.map((friend) => (
                <ListItem
                  key={friend.id}
                  button
                  selected={selectedFriend?.id === friend.id}
                  onClick={() => handleFriendSelect(friend)}
                  sx={{
                    borderRadius: 2,
                    mb: 1,
                    bgcolor: selectedFriend?.id === friend.id ? 'action.selected' : 'transparent',
                  }}
                >
                  <ListItemAvatar>
                    <Avatar src={friend.avatar} alt={friend.name} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={friend.name}
                    secondary={`@${friend.username}`}
                  />
                  {friend.trustScore && (
                    <Chip
                      icon={<Star />}
                      label={`${friend.trustScore}%`}
                      size="small"
                      color={friend.trustScore > 90 ? 'success' : 'default'}
                    />
                  )}
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {/* Search Tab */}
        {activeTab === 1 && (
          <Box>
            <Autocomplete
              options={searchResults}
              getOptionLabel={(option) => `${option.name} (@${option.username})`}
              value={selectedFriend}
              onChange={(e, value) => {
                setSelectedFriend(value);
                if (value) setRecipient(value.username);
              }}
              loading={loading}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search friends"
                  placeholder="Name or username"
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />,
                    endAdornment: (
                      <>
                        {loading ? <CircularProgress size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
              renderOption={(props, option) => (
                <Box component="li" {...props}>
                  <Avatar src={option.avatar} sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="body2">{option.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      @{option.username}
                    </Typography>
                  </Box>
                </Box>
              )}
            />
          </Box>
        )}

        {/* QR Code Tab */}
        {activeTab === 2 && (
          <Box textAlign="center" py={4}>
            <QrCode sx={{ fontSize: 80, color: 'action.active', mb: 2 }} />
            <Typography variant="body1" color="text.secondary">
              Ask recipient to show their QR code
            </Typography>
            <Button
              variant="outlined"
              startIcon={<QrCode />}
              sx={{ mt: 2 }}
              onClick={() => {
                // This would open the QR scanner
                console.log('Open QR scanner for recipient');
              }}
            >
              Scan QR Code
            </Button>
          </Box>
        )}

        {/* Selected Recipient Display */}
        {selectedFriend && (
          <RecipientCard elevation={0}>
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar src={selectedFriend.avatar} />
              <Box flex={1}>
                <Typography variant="subtitle2">Sending to</Typography>
                <Typography variant="body1" fontWeight="bold">
                  {selectedFriend.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  @{selectedFriend.username}
                </Typography>
              </Box>
              <IconButton size="small" onClick={() => setSelectedFriend(null)}>
                <Close />
              </IconButton>
            </Box>
          </RecipientCard>
        )}

        {/* Amount Input */}
        <Box mt={3}>
          <Typography variant="subtitle2" gutterBottom>
            Amount
          </Typography>
          <TextField
            fullWidth
            type="number"
            value={amount || ''}
            onChange={(e) => setAmount(Number(e.target.value))}
            InputProps={{
              startAdornment: <InputAdornment position="start">🪙</InputAdornment>,
              endAdornment: <InputAdornment position="end">points</InputAdornment>,
            }}
            error={!!validationError && amount > currentBalance}
            helperText={
              amount > 0 && calculateFee(amount) > 0
                ? `Transaction fee: ${calculateFee(amount)} points`
                : 'No transaction fee'
            }
          />

          {/* Quick Amount Buttons */}
          <Box display="flex" flexWrap="wrap" mt={2}>
            {quickAmounts.map((value) => (
              <QuickAmountChip
                key={value}
                label={value}
                onClick={() => handleQuickAmount(value)}
                color={amount === value ? 'primary' : 'default'}
                variant={amount === value ? 'filled' : 'outlined'}
                disabled={value > currentBalance}
              />
            ))}
          </Box>

          {/* Amount Slider */}
          <Box mt={3}>
            <Slider
              value={amount}
              onChange={handleSliderChange}
              min={0}
              max={getMaxTransferAmount()}
              step={10}
              marks={[
                { value: 0, label: '0' },
                { value: getMaxTransferAmount() / 2, label: `${getMaxTransferAmount() / 2}` },
                { value: getMaxTransferAmount(), label: `${getMaxTransferAmount()}` },
              ]}
              valueLabelDisplay="on"
            />
          </Box>
        </Box>

        {/* Message (Optional) */}
        <Box mt={3}>
          <TextField
            fullWidth
            label="Message (Optional)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            multiline
            rows={2}
            placeholder="Add a note to your transfer"
          />
        </Box>

        {/* Error Messages */}
        {validationError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {validationError}
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {/* Summary */}
        {amount > 0 && selectedFriend && (
          <Paper sx={{ p: 2, mt: 2, bgcolor: 'grey.50' }}>
            <Typography variant="subtitle2" gutterBottom>
              Transaction Summary
            </Typography>
            <Divider sx={{ my: 1 }} />
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="body2">Amount</Typography>
              <Typography variant="body2" fontWeight="bold">
                {amount} points
              </Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="body2">Transaction Fee</Typography>
              <Typography variant="body2">
                {calculateFee(amount)} points
              </Typography>
            </Box>
            <Divider sx={{ my: 1 }} />
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2" fontWeight="bold">
                Total Deduction
              </Typography>
              <Typography variant="body2" fontWeight="bold" color="primary">
                {amount + calculateFee(amount)} points
              </Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" mt={1}>
              <Typography variant="caption" color="text.secondary">
                Remaining Balance
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {currentBalance - amount - calculateFee(amount)} points
              </Typography>
            </Box>
          </Paper>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleReset} disabled={loading}>
          Reset
        </Button>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSendPoints}
          variant="contained"
          disabled={!selectedFriend || amount <= 0 || loading}
          startIcon={loading ? <CircularProgress size={20} /> : <Send />}
        >
          {loading ? 'Sending...' : `Send ${amount} Points`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SendPointsModal;