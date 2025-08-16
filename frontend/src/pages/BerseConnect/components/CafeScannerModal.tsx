import React, { useState, useRef, useEffect } from 'react';
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
  Avatar,
  Chip,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Badge,
  Fade,
  CircularProgress,
  Paper,
  LinearProgress,
} from '@mui/material';
import {
  Close,
  QrCodeScanner,
  LocationOn,
  Coffee,
  People,
  Star,
  CheckCircle,
  FlipCameraAndroid,
  FlashOn,
  FlashOff,
  Refresh,
  Send,
  Group,
  Schedule,
  LocalOffer,
} from '@mui/icons-material';
import { QrReader } from 'react-qr-reader';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

interface CafeInfo {
  id: string;
  name: string;
  address: string;
  rating: number;
  ambiance: string[];
  amenities: string[];
  coordinates: { lat: number; lng: number };
  currentVisitors: number;
  peakHours: string;
}

interface NearbyUser {
  id: string;
  name: string;
  avatar?: string;
  interests: string[];
  lookingFor: string;
  checkedInAt: string;
  points: number;
  mutualFriends?: string[];
}

interface CafeScannerModalProps {
  open: boolean;
  onClose: () => void;
  onScanComplete: (cafeData: CafeInfo) => void;
}

const StyledDialog = styled(Dialog)`
  .MuiDialog-paper {
    border-radius: 16px;
    max-width: 600px;
    width: 100%;
    max-height: 90vh;
    overflow: hidden;
  }
`;

const ScannerContainer = styled(Box)`
  position: relative;
  width: 100%;
  height: 300px;
  border-radius: 12px;
  overflow: hidden;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ScannerOverlay = styled(Box)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
`;

const ScannerFrame = styled(Box)`
  width: 200px;
  height: 200px;
  border: 2px solid #667eea;
  border-radius: 16px;
  position: relative;
  
  &::before,
  &::after {
    content: '';
    position: absolute;
    width: 20px;
    height: 20px;
    border: 3px solid #667eea;
  }
  
  &::before {
    top: -3px;
    left: -3px;
    border-right: none;
    border-bottom: none;
  }
  
  &::after {
    bottom: -3px;
    right: -3px;
    border-left: none;
    border-top: none;
  }
`;

const CameraControls = styled(Box)`
  position: absolute;
  top: 16px;
  right: 16px;
  display: flex;
  gap: 8px;
  z-index: 2;
`;

const CheckInCard = styled(motion.div)`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 24px;
  color: white;
  margin-bottom: 24px;
`;

const UserCard = styled(motion.div)`
  cursor: pointer;
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 8px;
  background: white;
  border: 1px solid #e0e0e0;
  
  &:hover {
    border-color: #667eea;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
  }
`;

const CafeScannerModal: React.FC<CafeScannerModalProps> = ({
  open,
  onClose,
  onScanComplete,
}) => {
  const [scannerActive, setScannerActive] = useState(true);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [flashOn, setFlashOn] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);
  const [cafeInfo, setCafeInfo] = useState<CafeInfo | null>(null);
  const [nearbyUsers, setNearbyUsers] = useState<NearbyUser[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const qrReaderRef = useRef<any>(null);

  // Mock data for demonstration
  const mockCafeInfo: CafeInfo = {
    id: 'cafe_001',
    name: 'Artisan Coffee House',
    address: 'Jalan Sultan Ismail, Bukit Bintang, KL',
    rating: 4.6,
    ambiance: ['Quiet', 'Work-friendly', 'Modern'],
    amenities: ['Free WiFi', 'Power Outlets', 'Air Conditioning', 'Study Area'],
    coordinates: { lat: 3.1478, lng: 101.7086 },
    currentVisitors: 12,
    peakHours: '2 PM - 5 PM',
  };

  const mockNearbyUsers: NearbyUser[] = [
    {
      id: 'user1',
      name: 'Sarah Ahmad',
      avatar: '/avatars/sarah.jpg',
      interests: ['Reading', 'Technology', 'Photography'],
      lookingFor: 'Study buddy for programming',
      checkedInAt: '10 minutes ago',
      points: 850,
      mutualFriends: ['Ahmad', 'Fatima'],
    },
    {
      id: 'user2',
      name: 'Omar Hassan',
      avatar: '/avatars/omar.jpg',
      interests: ['Business', 'Startups', 'Coffee'],
      lookingFor: 'Networking and casual chat',
      checkedInAt: '5 minutes ago',
      points: 1200,
    },
    {
      id: 'user3',
      name: 'Aisyah Rahman',
      avatar: '/avatars/aisyah.jpg',
      interests: ['Design', 'Art', 'Freelancing'],
      lookingFor: 'Creative collaboration',
      checkedInAt: '15 minutes ago',
      points: 650,
      mutualFriends: ['Mariam'],
    },
  ];

  const handleScan = (result: any, error: any) => {
    if (result && !scanning) {
      setScanning(true);
      setError(null);
      
      try {
        const qrData = result.text;
        
        // Check if it's a valid cafe QR code
        if (qrData.startsWith('BERSE_CAFE:')) {
          const cafeId = qrData.split(':')[1];
          handleCafeCheckIn(cafeId);
        } else {
          setError('Invalid QR code. Please scan a BerseConnect cafe QR code.');
          setScanning(false);
        }
      } catch (err) {
        setError('Failed to process QR code. Please try again.');
        setScanning(false);
      }
    }

    if (error && error.name !== 'NotAllowedError') {
      setError('Camera error. Please check permissions and try again.');
    }
  };

  const handleCafeCheckIn = async (cafeId: string) => {
    try {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock successful check-in
      setCafeInfo(mockCafeInfo);
      setNearbyUsers(mockNearbyUsers);
      setCheckedIn(true);
      setScannerActive(false);
      
      onScanComplete(mockCafeInfo);
    } catch (error) {
      setError('Failed to check in. Please try again.');
    } finally {
      setLoading(false);
      setScanning(false);
    }
  };

  const handleFlipCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const handleToggleFlash = () => {
    setFlashOn(prev => !prev);
  };

  const handleRetry = () => {
    setScannerActive(true);
    setCheckedIn(false);
    setCafeInfo(null);
    setNearbyUsers([]);
    setError(null);
    setScanning(false);
  };

  const handleConnectUser = (user: NearbyUser) => {
    // Handle user connection logic
    alert(`Connecting with ${user.name}...`);
  };

  const handleSendMessage = (user: NearbyUser) => {
    // Handle message sending logic
    alert(`Sending message to ${user.name}...`);
  };

  return (
    <StyledDialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <Coffee color="primary" />
            <Typography variant="h6">Cafe Scanner</Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ px: 3, pb: 2 }}>
        <AnimatePresence mode="wait">
          {!checkedIn ? (
            <motion.div
              key="scanner"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Scanner Instructions */}
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  Point your camera at the QR code displayed at the cafe to check in and discover nearby users!
                </Typography>
              </Alert>

              {/* QR Scanner */}
              <ScannerContainer>
                {scannerActive && (
                  <>
                    <QrReader
                      ref={qrReaderRef}
                      onResult={handleScan}
                      constraints={{
                        facingMode: facingMode,
                        audio: false,
                      }}
                      scanDelay={300}
                      style={{ width: '100%', height: '100%' }}
                    />
                    <ScannerOverlay>
                      <ScannerFrame />
                    </ScannerOverlay>
                    <CameraControls>
                      <IconButton
                        onClick={handleFlipCamera}
                        sx={{ 
                          background: 'rgba(255,255,255,0.9)',
                          '&:hover': { background: 'rgba(255,255,255,1)' }
                        }}
                      >
                        <FlipCameraAndroid />
                      </IconButton>
                      <IconButton
                        onClick={handleToggleFlash}
                        sx={{
                          background: 'rgba(255,255,255,0.9)',
                          color: flashOn ? '#ff9800' : 'inherit',
                          '&:hover': { background: 'rgba(255,255,255,1)' }
                        }}
                      >
                        {flashOn ? <FlashOn /> : <FlashOff />}
                      </IconButton>
                    </CameraControls>
                  </>
                )}

                {scanning && (
                  <Box display="flex" flexDirection="column" alignItems="center" gap={2} color="white">
                    <CircularProgress sx={{ color: '#667eea' }} />
                    <Typography variant="body2">
                      {loading ? 'Checking you in...' : 'Processing QR code...'}
                    </Typography>
                  </Box>
                )}
              </ScannerContainer>

              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}

              {/* Manual Entry Option */}
              <Box textAlign="center" mt={3}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Can't scan? Enter cafe code manually
                </Typography>
                <Button variant="outlined" size="small">
                  Manual Entry
                </Button>
              </Box>
            </motion.div>
          ) : (
            <motion.div
              key="checkedin"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Check-in Success */}
              <CheckInCard
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <CheckCircle sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Welcome to {cafeInfo?.name}!
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      +25 points for checking in
                    </Typography>
                  </Box>
                </Box>

                <Box display="flex" gap={1} flexWrap="wrap">
                  {cafeInfo?.ambiance.map((item) => (
                    <Chip
                      key={item}
                      label={item}
                      size="small"
                      sx={{
                        background: 'rgba(255,255,255,0.2)',
                        color: 'white',
                      }}
                    />
                  ))}
                </Box>
              </CheckInCard>

              {/* Cafe Information */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <LocationOn color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {cafeInfo?.address}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <Star sx={{ color: '#ffc107', fontSize: 16 }} />
                      <Typography variant="body2">
                        {cafeInfo?.rating}
                      </Typography>
                    </Box>
                  </Box>

                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <People color="action" />
                      <Typography variant="body2">
                        {cafeInfo?.currentVisitors} people here
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Schedule color="action" />
                      <Typography variant="body2" color="text.secondary">
                        Peak: {cafeInfo?.peakHours}
                      </Typography>
                    </Box>
                  </Box>

                  <Typography variant="subtitle2" gutterBottom>
                    Amenities
                  </Typography>
                  <Box display="flex" gap={1} flexWrap="wrap">
                    {cafeInfo?.amenities.map((amenity) => (
                      <Chip
                        key={amenity}
                        label={amenity}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </CardContent>
              </Card>

              {/* Nearby Users */}
              <Typography variant="h6" gutterBottom>
                People Nearby ({nearbyUsers.length})
              </Typography>

              {nearbyUsers.length > 0 ? (
                <Box>
                  {nearbyUsers.map((user) => (
                    <UserCard
                      key={user.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Box display="flex" alignItems="center" gap={2}>
                        <Badge
                          overlap="circular"
                          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                          badgeContent={
                            <Box
                              sx={{
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                background: '#4caf50',
                                border: '2px solid white',
                              }}
                            />
                          }
                        >
                          <Avatar src={user.avatar} sx={{ width: 50, height: 50 }}>
                            {user.name[0]}
                          </Avatar>
                        </Badge>

                        <Box flex={1}>
                          <Box display="flex" alignItems="center" gap={1} mb={1}>
                            <Typography variant="subtitle2">
                              {user.name}
                            </Typography>
                            <Chip
                              label={`${user.points} pts`}
                              size="small"
                              color="primary"
                            />
                          </Box>

                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Looking for: {user.lookingFor}
                          </Typography>

                          <Box display="flex" gap={0.5} flexWrap="wrap" mb={1}>
                            {user.interests.slice(0, 3).map((interest) => (
                              <Chip
                                key={interest}
                                label={interest}
                                size="small"
                                sx={{ fontSize: '0.7rem' }}
                              />
                            ))}
                          </Box>

                          {user.mutualFriends && user.mutualFriends.length > 0 && (
                            <Typography variant="caption" color="primary">
                              {user.mutualFriends.length} mutual friend{user.mutualFriends.length > 1 ? 's' : ''}
                            </Typography>
                          )}

                          <Typography variant="caption" color="text.secondary" display="block">
                            Checked in {user.checkedInAt}
                          </Typography>
                        </Box>

                        <Box display="flex" flexDirection="column" gap={1}>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Group />}
                            onClick={() => handleConnectUser(user)}
                          >
                            Connect
                          </Button>
                          <Button
                            size="small"
                            variant="text"
                            startIcon={<Send />}
                            onClick={() => handleSendMessage(user)}
                          >
                            Message
                          </Button>
                        </Box>
                      </Box>
                    </UserCard>
                  ))}

                  <Alert severity="success" sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      Found {nearbyUsers.length} people who might be interested in connecting! 
                      Earn +10 points for each successful connection.
                    </Typography>
                  </Alert>
                </Box>
              ) : (
                <Box textAlign="center" py={4}>
                  <People sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="body1" gutterBottom>
                    No one else is here right now
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Be the first to start connecting when others arrive!
                  </Typography>
                </Box>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        {checkedIn ? (
          <>
            <Button onClick={handleRetry} startIcon={<Refresh />}>
              Scan Again
            </Button>
            <Button onClick={onClose} variant="contained">
              Done
            </Button>
          </>
        ) : (
          <Button onClick={onClose}>Cancel</Button>
        )}
      </DialogActions>
    </StyledDialog>
  );
};

export default CafeScannerModal;