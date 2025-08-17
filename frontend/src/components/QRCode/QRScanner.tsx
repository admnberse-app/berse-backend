import React, { useState, useRef, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import { 
  decodeQRPayload, 
  hasUserCheckedIn, 
  recordCheckIn,
  formatScanResult,
  getUserPoints,
  QRScanResult,
  UserQRData
} from '../../utils/qrGenerator';

const Container = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  z-index: 10000;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  background: #2fce98;
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ScanArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const VideoContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 400px;
  aspect-ratio: 1;
  background: black;
  border-radius: 16px;
  overflow: hidden;
`;

const Video = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const ScanFrame = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 250px;
  height: 250px;
  border: 3px solid #2fce98;
  border-radius: 16px;
  
  &::before, &::after {
    content: '';
    position: absolute;
    width: 30px;
    height: 30px;
  }
  
  &::before {
    top: -3px;
    left: -3px;
    border-top: 4px solid #2fce98;
    border-left: 4px solid #2fce98;
    border-radius: 8px 0 0 0;
  }
  
  &::after {
    top: -3px;
    right: -3px;
    border-top: 4px solid #2fce98;
    border-right: 4px solid #2fce98;
    border-radius: 0 8px 0 0;
  }
`;

const ScanFrameCorners = styled.div`
  position: absolute;
  bottom: -3px;
  left: -3px;
  width: 30px;
  height: 30px;
  border-bottom: 4px solid #2fce98;
  border-left: 4px solid #2fce98;
  border-radius: 0 0 0 8px;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    right: -220px;
    width: 30px;
    height: 30px;
    border-bottom: 4px solid #2fce98;
    border-right: 4px solid #2fce98;
    border-radius: 0 0 8px 0;
  }
`;

const Instructions = styled.p`
  color: white;
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
  opacity: 0.8;
`;

const ManualInput = styled.div`
  margin-top: 20px;
  display: flex;
  gap: 8px;
  width: 100%;
  max-width: 400px;
`;

const Input = styled.input`
  flex: 1;
  padding: 12px;
  border: 1px solid #333;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 14px;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
  
  &:focus {
    outline: none;
    border-color: #2fce98;
  }
`;

const ScanButton = styled.button`
  padding: 12px 24px;
  background: #2fce98;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  
  &:hover {
    background: #27b584;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ResultModal = styled.div<{ success: boolean }>`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  border-radius: 16px;
  padding: 24px;
  max-width: 320px;
  width: 90%;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  text-align: center;
`;

const ResultIcon = styled.div<{ success: boolean }>`
  width: 64px;
  height: 64px;
  margin: 0 auto 16px;
  border-radius: 50%;
  background: ${({ success }) => success ? '#2fce98' : '#FF4444'};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
`;

const ResultTitle = styled.h3`
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 600;
  color: #333;
`;

const ResultMessage = styled.p`
  margin: 0 0 16px;
  font-size: 14px;
  color: #666;
`;

const UserInfo = styled.div`
  background: #f8f9fa;
  border-radius: 12px;
  padding: 16px;
  margin: 16px 0;
  text-align: left;
`;

const UserDetail = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const Label = styled.span`
  color: #666;
`;

const Value = styled.span`
  color: #333;
  font-weight: 500;
`;

const PointsAwarded = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 12px;
  border-radius: 8px;
  font-size: 24px;
  font-weight: bold;
  margin: 16px 0;
`;

interface QRScannerProps {
  eventId: string;
  eventTitle: string;
  eventPoints: number;
  onClose: () => void;
  onScanSuccess?: (result: QRScanResult) => void;
}

export const QRScanner: React.FC<QRScannerProps> = ({
  eventId,
  eventTitle,
  eventPoints,
  onClose,
  onScanSuccess
}) => {
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [scanning, setScanning] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [scanResult, setScanResult] = useState<QRScanResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Start camera
  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setScanning(true);
        
        // Start scanning simulation (in production, use QR code library)
        simulateScanning();
      } catch (error) {
        console.error('Camera access denied:', error);
      }
    };

    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Simulate QR code scanning (replace with actual QR library)
  const simulateScanning = () => {
    // In production, use a library like qr-scanner or jsQR
    // This is just for demonstration
    setTimeout(() => {
      // Mock scan would happen here
    }, 2000);
  };

  // Process scanned QR code
  const processQRCode = async (qrCode: string) => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      // Decode QR payload
      const qrData = decodeQRPayload(qrCode);
      
      if (!qrData) {
        setScanResult({
          success: false,
          error: 'Invalid QR code format'
        });
        return;
      }

      // Check if already checked in
      const alreadyCheckedIn = await hasUserCheckedIn(qrData.userId, eventId);
      
      if (alreadyCheckedIn) {
        setScanResult({
          success: false,
          error: 'User already checked in to this event',
          data: qrData
        });
        return;
      }

      // Record check-in and award points
      await recordCheckIn(
        qrData.userId,
        eventId,
        eventPoints,
        user?.id || 'organizer'
      );

      // Get user data (mock - replace with actual API call)
      const userData = {
        id: qrData.userId,
        fullName: 'User Name', // Get from API
        email: 'user@example.com', // Get from API
        points: getUserPoints(qrData.userId)
      };

      // Format success result
      const result = formatScanResult(qrData, userData, eventPoints);
      setScanResult(result);
      
      if (onScanSuccess) {
        onScanSuccess(result);
      }
      
      // Play success sound
      playSound('success');
      
    } catch (error) {
      console.error('Error processing QR:', error);
      setScanResult({
        success: false,
        error: 'Failed to process QR code'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle manual QR input
  const handleManualScan = () => {
    if (manualCode.trim()) {
      processQRCode(manualCode.trim());
    }
  };

  // Play sound effect
  const playSound = (type: 'success' | 'error') => {
    // Add sound effects here
    if (type === 'success') {
      // Play success sound
    } else {
      // Play error sound
    }
  };

  // Close result modal
  const closeResult = () => {
    setScanResult(null);
    setManualCode('');
  };

  return (
    <Container>
      <Header>
        <Title>Check-in: {eventTitle}</Title>
        <CloseButton onClick={onClose}>×</CloseButton>
      </Header>

      <ScanArea>
        <VideoContainer>
          <Video
            ref={videoRef}
            autoPlay
            playsInline
            muted
          />
          <ScanFrame>
            <ScanFrameCorners />
          </ScanFrame>
        </VideoContainer>

        <Instructions>
          Position the QR code within the frame to scan
        </Instructions>

        <ManualInput>
          <Input
            type="text"
            placeholder="Or enter QR code manually"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleManualScan();
              }
            }}
          />
          <ScanButton 
            onClick={handleManualScan}
            disabled={!manualCode.trim() || isProcessing}
          >
            Check In
          </ScanButton>
        </ManualInput>

        {/* Test button for demo */}
        <ScanButton
          style={{ marginTop: '20px', background: '#666' }}
          onClick={() => {
            // Generate test QR for demo
            const testQR = btoa(JSON.stringify({
              id: `BM-test-${Date.now()}`,
              userId: 'test-user-123',
              type: 'profile',
              timestamp: Date.now()
            }));
            processQRCode(testQR);
          }}
        >
          Test Check-in (Demo)
        </ScanButton>
      </ScanArea>

      {scanResult && (
        <ResultModal success={scanResult.success}>
          <ResultIcon success={scanResult.success}>
            {scanResult.success ? '✓' : '✗'}
          </ResultIcon>
          
          <ResultTitle>
            {scanResult.success ? 'Check-in Successful!' : 'Check-in Failed'}
          </ResultTitle>
          
          <ResultMessage>
            {scanResult.error || scanResult.action?.message}
          </ResultMessage>

          {scanResult.success && scanResult.user && (
            <>
              <UserInfo>
                <UserDetail>
                  <Label>Name:</Label>
                  <Value>{scanResult.user.name}</Value>
                </UserDetail>
                <UserDetail>
                  <Label>Email:</Label>
                  <Value>{scanResult.user.email}</Value>
                </UserDetail>
                <UserDetail>
                  <Label>Current Points:</Label>
                  <Value>{scanResult.user.currentPoints}</Value>
                </UserDetail>
                <UserDetail>
                  <Label>Tier:</Label>
                  <Value>{scanResult.user.tier.toUpperCase()}</Value>
                </UserDetail>
              </UserInfo>

              <PointsAwarded>
                +{scanResult.action?.pointsChanged} Points
              </PointsAwarded>
            </>
          )}

          <ScanButton onClick={closeResult}>
            {scanResult.success ? 'Scan Next' : 'Try Again'}
          </ScanButton>
        </ResultModal>
      )}
    </Container>
  );
};