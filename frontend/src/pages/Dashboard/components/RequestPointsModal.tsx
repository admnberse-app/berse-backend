import React, { useState } from 'react';
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
  Autocomplete,
  InputAdornment,
  Paper,
} from '@mui/material';
import {
  Close,
  RequestPage,
  Person,
  AttachMoney,
  Message,
} from '@mui/icons-material';
import styled from 'styled-components';

interface Friend {
  id: string;
  name: string;
  username: string;
  avatar: string;
}

interface RequestPointsModalProps {
  open: boolean;
  onClose: () => void;
  onRequest: (from: string, amount: number, reason: string) => void;
}

const RequestCard = styled(Paper)`
  padding: 16px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea10 0%, #764ba210 100%);
  margin-bottom: 16px;
`;

const RequestPointsModal: React.FC<RequestPointsModalProps> = ({
  open,
  onClose,
  onRequest,
}) => {
  const [requestFrom, setRequestFrom] = useState<Friend | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  const friends: Friend[] = [
    { id: '1', name: 'Sarah Ahmad', username: 'sarah_a', avatar: '/avatars/1.jpg' },
    { id: '2', name: 'Omar Hassan', username: 'omar_h', avatar: '/avatars/2.jpg' },
    { id: '3', name: 'Fatima Ali', username: 'fatima_ali', avatar: '/avatars/3.jpg' },
  ];

  const quickReasons = [
    'Emergency expense',
    'Event ticket',
    'Group purchase',
    'Borrowed earlier',
    'Shared meal',
  ];

  const handleSubmitRequest = () => {
    if (!requestFrom) {
      setError('Please select who to request from');
      return;
    }
    if (amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    if (!reason) {
      setError('Please provide a reason for the request');
      return;
    }

    onRequest(requestFrom.name, amount, reason);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <RequestPage color="primary" />
            <Typography variant="h6">Request Points</Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Alert severity="info" sx={{ mb: 2 }}>
          Request points from your friends. They'll receive a notification to approve or decline.
        </Alert>

        {/* Request From */}
        <Autocomplete
          options={friends}
          getOptionLabel={(option) => `${option.name} (@${option.username})`}
          value={requestFrom}
          onChange={(e, value) => setRequestFrom(value)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Request from"
              placeholder="Select a friend"
              InputProps={{
                ...params.InputProps,
                startAdornment: <Person sx={{ mr: 1, color: 'action.active' }} />,
              }}
            />
          )}
          renderOption={(props, option) => (
            <Box component="li" {...props}>
              <Avatar src={option.avatar} sx={{ mr: 2, width: 32, height: 32 }} />
              <Box>
                <Typography variant="body2">{option.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  @{option.username}
                </Typography>
              </Box>
            </Box>
          )}
          sx={{ mb: 2 }}
        />

        {/* Amount */}
        <TextField
          fullWidth
          type="number"
          label="Amount"
          value={amount || ''}
          onChange={(e) => setAmount(Number(e.target.value))}
          InputProps={{
            startAdornment: <InputAdornment position="start">🪙</InputAdornment>,
            endAdornment: <InputAdornment position="end">points</InputAdornment>,
          }}
          sx={{ mb: 2 }}
        />

        {/* Reason */}
        <TextField
          fullWidth
          label="Reason for request"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          multiline
          rows={3}
          placeholder="Explain why you need these points..."
          sx={{ mb: 2 }}
        />

        {/* Quick Reasons */}
        <Typography variant="subtitle2" gutterBottom>
          Quick reasons:
        </Typography>
        <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
          {quickReasons.map((quickReason) => (
            <Chip
              key={quickReason}
              label={quickReason}
              onClick={() => setReason(quickReason)}
              variant={reason === quickReason ? 'filled' : 'outlined'}
              size="small"
            />
          ))}
        </Box>

        {/* Preview */}
        {requestFrom && amount > 0 && reason && (
          <RequestCard elevation={0}>
            <Typography variant="subtitle2" gutterBottom>
              Request Preview
            </Typography>
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar src={requestFrom.avatar} />
              <Box flex={1}>
                <Typography variant="body2">
                  Requesting <strong>{amount} points</strong> from{' '}
                  <strong>{requestFrom.name}</strong>
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Reason: {reason}
                </Typography>
              </Box>
            </Box>
          </RequestCard>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmitRequest}
          variant="contained"
          disabled={!requestFrom || amount <= 0 || !reason}
          startIcon={<RequestPage />}
        >
          Send Request
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RequestPointsModal;