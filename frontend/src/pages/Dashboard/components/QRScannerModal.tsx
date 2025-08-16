import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  Alert,
  CircularProgress,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Close,
  QrCodeScanner,
  Person,
  Event,
  Payment,
  LocationOn,
  CheckCircle,
  Error,
  CameraAlt,
  FlashOn,
  FlashOff,
  CameraRear,
  CameraFront,
  PhotoLibrary,
} from '@mui/icons-material';
import { QrReader } from 'react-qr-reader';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

interface QRData {
  type: 'user_profile' | 'event_checkin' | 'points_transfer' | 'cafe_meetup' | 'merchant_payment';
  data: any;
}

interface QRScannerModalProps {
  open: boolean;
  onClose: () => void;
  onScan: (data: QRData) => void;
}

const ScannerContainer = styled(Box)`
  position: relative;
  width: 100%;
  height: 400px;
  background: black;
  border-radius: 12px;
  overflow: hidden;
`;

const ScanOverlay = styled(Box)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
`;

const ScanFrame = styled(Box)`
  width: 250px;
  height: 250px;
  border: 3px solid white;
  border-radius: 20px;
  position: relative;
  
  &::before,
  &::after {
    content: '';
    position: absolute;
    width: 30px;
    height: 30px;
    border: 4px solid #667eea;
  }
  
  &::before {
    top: -3px;
    left: -3px;
    border-right: none;
    border-bottom: none;
    border-top-left-radius: 20px;
  }
  
  &::after {
    bottom: -3px;
    right: -3px;
    border-left: none;
    border-top: none;
    border-bottom-right-radius: 20px;
  }
`;

const ScanLine = styled(motion.div)`
  position: absolute;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, transparent, #667eea, transparent);
  top: 0;
`;

const ControlsBar = styled(Box)`
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 16px;
  background: rgba(0, 0, 0, 0.5);
  padding: 8px 16px;
  border-radius: 24px;
  backdrop-filter: blur(10px);
`;

const ResultCard = styled(Paper)`
  padding: 24px;
  border-radius: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-align: center;
`;

const QRScannerModal: React.FC<QRScannerModalProps> = ({
  open,
  onClose,
  onScan,
}) => {
  const [scanning, setScanning] = useState(true);
  const [result, setResult] = useState<QRData | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [flashOn, setFlashOn] = useState(false);
  const [recentScans, setRecentScans] = useState<QRData[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load recent scans from localStorage
    const saved = localStorage.getItem('recentQRScans');
    if (saved) {
      setRecentScans(JSON.parse(saved).slice(0, 5));
    }
  }, []);

  const handleScan = async (scanResult: any) => {
    if (!scanResult || processing) return;
    
    try {
      setProcessing(true);
      setError(null);
      
      const text = scanResult.getText ? scanResult.getText() : scanResult;
      const qrData = parseQRCode(text);
      
      if (!qrData) {
        throw new Error('Invalid QR code format');
      }
      
      setResult(qrData);
      
      // Save to recent scans
      const updatedScans = [qrData, ...recentScans].slice(0, 5);
      setRecentScans(updatedScans);
      localStorage.setItem('recentQRScans', JSON.stringify(updatedScans));
      
      // Vibrate on successful scan
      if (window.navigator.vibrate) {
        window.navigator.vibrate(200);
      }
      
      // Process the QR code
      await processQRCode(qrData);
      
    } catch (err) {
      setError(err.message || 'Failed to process QR code');
    } finally {
      setProcessing(false);
      setScanning(false);
    }
  };

  const parseQRCode = (text: string): QRData | null => {
    try {
      const data = JSON.parse(text);
      
      // Validate QR code structure
      if (!data.type || !data.data) {
        return null;
      }
      
      return data as QRData;
    } catch {
      // Try to parse as URL
      if (text.startsWith('http')) {
        const url = new URL(text);
        if (url.hostname === 'berseapp.com') {
          const pathParts = url.pathname.split('/');
          
          if (pathParts[1] === 'user') {
            return {
              type: 'user_profile',
              data: { userId: pathParts[2] },
            };
          } else if (pathParts[1] === 'event') {
            return {
              type: 'event_checkin',
              data: { eventId: pathParts[2] },
            };
          }
        }
      }
      
      return null;
    }
  };

  const processQRCode = async (qrData: QRData) => {
    switch (qrData.type) {
      case 'user_profile':
        await handleUserProfile(qrData.data);
        break;
      case 'event_checkin':
        await handleEventCheckIn(qrData.data);
        break;
      case 'points_transfer':
        await handlePointsTransfer(qrData.data);
        break;
      case 'cafe_meetup':
        await handleCafeMeetup(qrData.data);
        break;
      case 'merchant_payment':
        await handleMerchantPayment(qrData.data);
        break;
      default:
        throw new Error('Unknown QR code type');
    }
  };

  const handleUserProfile = async (data: any) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    onScan({ type: 'user_profile', data });
  };

  const handleEventCheckIn = async (data: any) => {
    // Simulate event check-in
    await new Promise(resolve => setTimeout(resolve, 1000));
    onScan({ type: 'event_checkin', data });
  };

  const handlePointsTransfer = async (data: any) => {
    // Process points transfer
    await new Promise(resolve => setTimeout(resolve, 1000));
    onScan({ type: 'points_transfer', data });
  };

  const handleCafeMeetup = async (data: any) => {
    // Handle cafe meetup
    await new Promise(resolve => setTimeout(resolve, 1000));
    onScan({ type: 'cafe_meetup', data });
  };

  const handleMerchantPayment = async (data: any) => {
    // Process merchant payment
    await new Promise(resolve => setTimeout(resolve, 1000));
    onScan({ type: 'merchant_payment', data });
  };

  const handleError = (err: any) => {
    console.error('QR Scanner error:', err);
    setError('Camera access denied or not available');
  };

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  };

  const toggleFlash = () => {
    setFlashOn(prev => !prev);
    // Note: Flash control requires additional implementation with camera API
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      // This would require a QR code decoder library like jsQR
      // For now, we'll show a message
      setError('File upload QR scanning coming soon!');
    };
    reader.readAsDataURL(file);
  };

  const handleRetry = () => {
    setScanning(true);
    setResult(null);
    setError(null);
  };

  const getQRTypeIcon = (type: string) => {
    switch (type) {
      case 'user_profile':
        return <Person />;
      case 'event_checkin':
        return <Event />;
      case 'points_transfer':
        return <Payment />;
      case 'cafe_meetup':
        return <LocationOn />;
      case 'merchant_payment':
        return <Payment />;
      default:
        return <QrCodeScanner />;
    }
  };

  const getQRTypeLabel = (type: string) => {
    switch (type) {
      case 'user_profile':
        return 'User Profile';
      case 'event_checkin':
        return 'Event Check-in';
      case 'points_transfer':
        return 'Points Transfer';
      case 'cafe_meetup':
        return 'Cafe Meetup';
      case 'merchant_payment':
        return 'Merchant Payment';
      default:
        return 'Unknown';
    }
  };

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
            <QrCodeScanner color="primary" />
            <Typography variant="h6">Scan QR Code</Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {scanning && !result && (
          <ScannerContainer>
            <QrReader
              onResult={(result, error) => {
                if (result) handleScan(result);
                if (error) handleError(error);
              }}
              constraints={{
                facingMode,
              }}
              containerStyle={{
                width: '100%',
                height: '100%',
              }}
              videoContainerStyle={{
                width: '100%',
                height: '100%',
              }}
              videoStyle={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
            
            <ScanOverlay>
              <ScanFrame>
                <ScanLine
                  animate={{ y: [0, 250, 0] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                />
              </ScanFrame>
            </ScanOverlay>
            
            <ControlsBar>
              <IconButton
                size="small"
                sx={{ color: 'white' }}
                onClick={toggleCamera}
              >
                {facingMode === 'environment' ? <CameraRear /> : <CameraFront />}
              </IconButton>
              <IconButton
                size="small"
                sx={{ color: 'white' }}
                onClick={toggleFlash}
              >
                {flashOn ? <FlashOn /> : <FlashOff />}
              </IconButton>
              <IconButton
                size="small"
                sx={{ color: 'white' }}
                onClick={() => fileInputRef.current?.click()}
              >
                <PhotoLibrary />
              </IconButton>
            </ControlsBar>
          </ScannerContainer>
        )}

        {processing && (
          <Box display="flex" flexDirection="column" alignItems="center" py={4}>
            <CircularProgress size={60} />
            <Typography variant="h6" mt={2}>
              Processing QR Code...
            </Typography>
          </Box>
        )}

        {result && !processing && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <ResultCard elevation={3}>
                <CheckCircle sx={{ fontSize: 60, mb: 2 }} />
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  QR Code Scanned!
                </Typography>
                <Box display="flex" alignItems="center" justifyContent="center" gap={1} mt={2}>
                  {getQRTypeIcon(result.type)}
                  <Typography variant="subtitle1">
                    {getQRTypeLabel(result.type)}
                  </Typography>
                </Box>
                {result.data && (
                  <Box mt={2} p={2} bgcolor="rgba(255,255,255,0.1)" borderRadius={2}>
                    <Typography variant="body2">
                      {JSON.stringify(result.data, null, 2)}
                    </Typography>
                  </Box>
                )}
              </ResultCard>
            </motion.div>
          </AnimatePresence>
        )}

        {error && (
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={handleRetry}>
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        {recentScans.length > 0 && !scanning && !result && (
          <Box mt={2}>
            <Typography variant="subtitle2" gutterBottom>
              Recent Scans
            </Typography>
            <List>
              {recentScans.map((scan, index) => (
                <ListItem
                  key={index}
                  button
                  onClick={() => {
                    setResult(scan);
                    processQRCode(scan);
                  }}
                >
                  <ListItemIcon>
                    {getQRTypeIcon(scan.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={getQRTypeLabel(scan.type)}
                    secondary={new Date().toLocaleString()}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        <Typography variant="caption" color="text.secondary" display="block" textAlign="center" mt={2}>
          Point your camera at a QR code to scan
        </Typography>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileUpload}
        />
      </DialogContent>

      <DialogActions>
        {result && (
          <Button onClick={handleRetry} startIcon={<QrCodeScanner />}>
            Scan Another
          </Button>
        )}
        <Button onClick={onClose} variant={result ? 'contained' : 'text'}>
          {result ? 'Done' : 'Cancel'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default QRScannerModal;