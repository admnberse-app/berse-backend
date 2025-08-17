import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { QRCodeGenerator } from './QRCode';
import { UserQRCode } from './QRCode/UserQRCode';
import { generateUserProfileQR, getUserPoints, calculateUserTier } from '../utils/qrGenerator';

interface DualQRModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ScanResult {
  type: 'berseuser' | 'event' | 'external';
  data: any;
}

// Styled Components
const ModalOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: ${({ $isOpen }) => $isOpen ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
`;

const ModalContainer = styled.div`
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 400px;
  max-height: 90vh;
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
`;

const ModalHeader = styled.div`
  padding: 20px 20px 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f0f0f0;
  background: white;
  position: sticky;
  top: 0;
  z-index: 10;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  color: #666;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: #f0f0f0;
  }
`;

const TabContainer = styled.div`
  display: flex;
  width: 100%;
  background: #f8f9fa;
  border-radius: 8px;
  padding: 4px;
  margin-bottom: 16px;
`;

const Tab = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 12px 16px;
  border: none;
  border-radius: 6px;
  background: ${({ $active }) => $active ? 'white' : 'transparent'};
  color: ${({ $active }) => $active ? '#2fce98' : '#666'};
  font-size: 14px;
  font-weight: ${({ $active }) => $active ? '600' : '500'};
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  
  &:hover {
    color: #2fce98;
  }
`;

const ModalContent = styled.div`
  padding: 0 20px 20px 20px;
  flex: 1;
  overflow-y: auto;
`;

const QRDisplayContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const QRCodeContainer = styled.div`
  background: white;
  padding: 20px;
  border-radius: 12px;
  border: 2px solid #f0f0f0;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const UserInfo = styled.div`
  margin-bottom: 20px;
`;

const UserName = styled.h3`
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: bold;
  color: #2fce98;
`;

const ValidityInfo = styled.p`
  margin: 0 0 4px 0;
  font-size: 14px;
  color: #666;
`;

const StatusBadge = styled.div<{ $status: string }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  background: ${({ $status }) => $status === 'active' ? '#e8f5e8' : '#fff3e0'};
  color: ${({ $status }) => $status === 'active' ? '#2fce98' : '#f57c00'};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
`;

const ActionButton = styled.button`
  padding: 8px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  color: #2fce98;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 4px;
  
  &:hover {
    background: #f8f9fa;
    border-color: #2fce98;
  }
`;

const CameraContainer = styled.div`
  position: relative;
  width: 100%;
  height: 300px;
  background: #000;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 16px;
`;

const CameraPreview = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const CameraPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  background: #f0f0f0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #666;
  font-size: 14px;
  text-align: center;
  gap: 12px;
`;

const ScanFrame = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 200px;
  height: 200px;
  border: 2px solid #2fce98;
  border-radius: 12px;
  
  &::before, &::after {
    content: '';
    position: absolute;
    width: 20px;
    height: 20px;
  }
  
  &::before {
    top: -2px;
    left: -2px;
    border-top: 4px solid #2fce98;
    border-left: 4px solid #2fce98;
    border-radius: 4px 0 0 0;
  }
  
  &::after {
    top: -2px;
    right: -2px;
    border-top: 4px solid #2fce98;
    border-right: 4px solid #2fce98;
    border-radius: 0 4px 0 0;
  }
`;

const ScanFrameCorners = styled.div`
  position: absolute;
  bottom: -2px;
  left: -2px;
  width: 20px;
  height: 20px;
  border-bottom: 4px solid #2fce98;
  border-left: 4px solid #2fce98;
  border-radius: 0 0 0 4px;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    right: -196px;
    width: 20px;
    height: 20px;
    border-bottom: 4px solid #2fce98;
    border-right: 4px solid #2fce98;
    border-radius: 0 0 4px 0;
  }
`;

const ScanInstruction = styled.p`
  text-align: center;
  color: #666;
  font-size: 14px;
  margin: 0 0 16px 0;
`;

const CameraControls = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
`;

const ControlButton = styled.button`
  padding: 10px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  color: #2fce98;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  
  &:hover {
    background: #f8f9fa;
    border-color: #2fce98;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ScanResult = styled.div`
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 16px;
  margin-top: 16px;
`;

const ResultHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
`;

const ResultIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #2fce98;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
`;

const ResultInfo = styled.div`
  flex: 1;
`;

const ResultName = styled.div`
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
`;

const ResultDetails = styled.div`
  font-size: 12px;
  color: #666;
`;

const ResultActions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;
`;

export const DualQRModal: React.FC<DualQRModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'show' | 'scan'>('show');
  const [isScanning, setIsScanning] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate unique QR code data for the user
  const generateQRData = () => {
    if (user?.id) {
      return generateUserProfileQR(user.id);
    }
    return '';
  };

  // Start camera for scanning
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsScanning(true);
    } catch (error) {
      console.error('Camera access denied:', error);
      alert('Camera access is required for QR scanning. Please allow camera permission.');
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setIsScanning(false);
  };

  // Toggle flashlight (for mobile devices)
  const toggleFlashlight = async () => {
    if (cameraStream) {
      const track = cameraStream.getVideoTracks()[0];
      const capabilities = track.getCapabilities();
      if ('torch' in capabilities) {
        try {
          await track.applyConstraints({
            advanced: [{ torch: !flashEnabled } as any]
          });
          setFlashEnabled(!flashEnabled);
        } catch (error) {
          console.error('Flashlight not supported:', error);
        }
      }
    }
  };

  // Handle file upload for QR scanning
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // In production, you would use a QR code detection library here
      // For demo purposes, we'll simulate a scan result
      setTimeout(() => {
        const mockResult: ScanResult = {
          type: 'berseuser',
          data: {
            userId: 'user_456',
            userName: 'Ahmad Hassan',
            bersePassStatus: 'ACTIVE',
            profileLink: 'https://bersemuka.com/profile/user_456'
          }
        };
        setScanResult(mockResult);
      }, 1000);
    }
  };

  // Mock QR scan detection (in production, use a QR detection library)
  const simulateScan = () => {
    const mockResults = [
      {
        type: 'berseuser' as const,
        data: {
          userId: 'user_789',
          userName: 'Sarah Abdullah',
          bersePassStatus: 'ACTIVE',
          profileLink: 'https://bersemuka.com/profile/user_789',
          phone: '+60123456789'
        }
      },
      {
        type: 'event' as const,
        data: {
          eventId: 'event_123',
          eventName: 'Cameron Highlands Hiking Trip',
          checkInTime: new Date().toISOString()
        }
      },
      {
        type: 'external' as const,
        data: {
          url: 'https://example.com',
          title: 'External Website'
        }
      }
    ];
    
    const randomResult = mockResults[Math.floor(Math.random() * mockResults.length)];
    setScanResult(randomResult);
  };

  // Share QR code
  const shareQR = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${user?.fullName || 'User'}'s BersePass QR`,
          text: 'Connect with me on BerseMuka!',
          url: `https://bersemuka.com/profile/${user?.id || 'user_123'}`
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      copyQRLink();
    }
  };

  // Save QR to photos (simulate)
  const saveToPhotos = () => {
    // In production, you would convert the QR code to image and trigger download
    alert('QR code saved to photos! (Demo functionality)');
  };

  // Copy QR link
  const copyQRLink = async () => {
    const link = `https://bersemuka.com/profile/${user?.id || 'user_123'}`;
    try {
      await navigator.clipboard.writeText(link);
      alert('Profile link copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy link:', error);
      alert('Failed to copy link');
    }
  };

  // Handle scan result actions
  const handleScanAction = (action: string) => {
    if (!scanResult) return;

    switch (action) {
      case 'connect':
        if (scanResult.type === 'berseuser') {
          alert(`Connection request sent to ${scanResult.data.userName}!`);
          setScanResult(null);
        }
        break;
      case 'checkin':
        if (scanResult.type === 'event') {
          alert(`Checked into ${scanResult.data.eventName}!`);
          setScanResult(null);
        }
        break;
      case 'open':
        if (scanResult.type === 'external') {
          window.open(scanResult.data.url, '_blank');
          setScanResult(null);
        }
        break;
    }
  };

  // Cleanup camera on unmount or close
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setScanResult(null);
      setActiveTab('show');
    }
  }, [isOpen]);

  const renderShowQRTab = () => (
    <div style={{ padding: '20px' }}>
      <UserQRCode showInstructions={true} size={200} />
    </div>
  );

  const renderScanQRTab = () => (
    <div>
      <ScanInstruction>
        Point camera at QR code to scan
      </ScanInstruction>

      <CameraContainer>
        {isScanning ? (
          <>
            <CameraPreview
              ref={videoRef}
              autoPlay
              playsInline
              muted
            />
            <ScanFrame>
              <ScanFrameCorners />
            </ScanFrame>
          </>
        ) : (
          <CameraPlaceholder>
            <div style={{ fontSize: '48px', marginBottom: '8px' }}>📷</div>
            <div>Camera not active</div>
            <div style={{ fontSize: '12px', opacity: 0.7 }}>
              Click "Start Camera" to begin scanning
            </div>
          </CameraPlaceholder>
        )}
      </CameraContainer>

      <CameraControls>
        {!isScanning ? (
          <ControlButton onClick={startCamera}>
            📷 Start Camera
          </ControlButton>
        ) : (
          <>
            <ControlButton onClick={stopCamera}>
              ⏹️ Stop Camera
            </ControlButton>
            <ControlButton onClick={toggleFlashlight}>
              {flashEnabled ? '🔦' : '💡'} Flash
            </ControlButton>
            <ControlButton onClick={simulateScan}>
              🎯 Simulate Scan
            </ControlButton>
          </>
        )}
        
        <ControlButton onClick={() => fileInputRef.current?.click()}>
          📁 Upload from Gallery
        </ControlButton>
      </CameraControls>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileUpload}
      />

      {scanResult && (
        <ScanResult>
          <ResultHeader>
            <ResultIcon>
              {scanResult.type === 'berseuser' && '👤'}
              {scanResult.type === 'event' && '🎫'}
              {scanResult.type === 'external' && '🔗'}
            </ResultIcon>
            <ResultInfo>
              <ResultName>
                {scanResult.type === 'berseuser' && scanResult.data.userName}
                {scanResult.type === 'event' && scanResult.data.eventName}
                {scanResult.type === 'external' && scanResult.data.title}
              </ResultName>
              <ResultDetails>
                {scanResult.type === 'berseuser' && `BersePass User • ${scanResult.data.bersePassStatus}`}
                {scanResult.type === 'event' && 'Event Check-in Available'}
                {scanResult.type === 'external' && 'External Link Detected'}
              </ResultDetails>
            </ResultInfo>
          </ResultHeader>
          
          <ResultActions>
            {scanResult.type === 'berseuser' && (
              <ControlButton onClick={() => handleScanAction('connect')}>
                ➕ Add Connection
              </ControlButton>
            )}
            {scanResult.type === 'event' && (
              <ControlButton onClick={() => handleScanAction('checkin')}>
                ✅ Check Into Event
              </ControlButton>
            )}
            {scanResult.type === 'external' && (
              <ControlButton onClick={() => handleScanAction('open')}>
                🔗 Open Link
              </ControlButton>
            )}
            <ControlButton onClick={() => setScanResult(null)}>
              ❌ Dismiss
            </ControlButton>
          </ResultActions>
        </ScanResult>
      )}
    </div>
  );

  return (
    <ModalOverlay $isOpen={isOpen} onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <TabContainer>
            <Tab
              $active={activeTab === 'show'}
              onClick={() => setActiveTab('show')}
            >
              👁️ Show My QR
            </Tab>
            <Tab
              $active={activeTab === 'scan'}
              onClick={() => setActiveTab('scan')}
            >
              📷 Scan QR
            </Tab>
          </TabContainer>
          <CloseButton onClick={onClose}>×</CloseButton>
        </ModalHeader>
        
        <ModalContent>
          {activeTab === 'show' ? renderShowQRTab() : renderScanQRTab()}
        </ModalContent>
      </ModalContainer>
    </ModalOverlay>
  );
};