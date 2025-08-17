import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../../contexts/AuthContext';
import { generateUserProfileQR, getUserPoints, calculateUserTier } from '../../utils/qrGenerator';

const Container = styled.div`
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  max-width: 320px;
  margin: 0 auto;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 20px;
`;

const UserName = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: bold;
  color: #333;
`;

const UserId = styled.p`
  margin: 4px 0;
  font-size: 12px;
  color: #666;
`;

const QRContainer = styled.div`
  background: white;
  padding: 20px;
  border-radius: 12px;
  border: 2px solid #f0f0f0;
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const PointsSection = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 16px;
  color: white;
  margin-bottom: 16px;
`;

const PointsBalance = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const PointsLabel = styled.span`
  font-size: 14px;
  opacity: 0.9;
`;

const PointsValue = styled.span`
  font-size: 24px;
  font-weight: bold;
`;

const TierBadge = styled.div<{ tier: string }>`
  display: inline-block;
  background: ${({ tier }) => {
    switch (tier) {
      case 'platinum': return '#E5E4E2';
      case 'gold': return '#FFD700';
      case 'silver': return '#C0C0C0';
      default: return '#CD7F32';
    }
  }};
  color: ${({ tier }) => tier === 'gold' || tier === 'silver' ? '#333' : '#fff'};
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
  flex: 1;
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  color: #333;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #f8f8f8;
    border-color: #2fce98;
  }
`;

const Instructions = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 12px;
  margin-top: 16px;
`;

const InstructionText = styled.p`
  margin: 0;
  font-size: 12px;
  color: #666;
  line-height: 1.5;
`;

interface UserQRCodeProps {
  showInstructions?: boolean;
  size?: number;
}

export const UserQRCode: React.FC<UserQRCodeProps> = ({ 
  showInstructions = true,
  size = 200 
}) => {
  const { user } = useAuth();
  const [qrData, setQrData] = useState<string>('');
  const [points, setPoints] = useState<number>(0);
  const [tier, setTier] = useState<string>('bronze');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (user?.id) {
      // Generate unique QR for user
      const qrPayload = generateUserProfileQR(user.id);
      setQrData(qrPayload);
      
      // Get user points
      const userPoints = getUserPoints(user.id);
      setPoints(userPoints);
      
      // Calculate tier
      const userTier = calculateUserTier(userPoints);
      setTier(userTier);
      
      // Store QR in localStorage for persistence
      localStorage.setItem(`userQR_${user.id}`, qrPayload);
    }
  }, [user]);

  const handleDownload = () => {
    const svg = document.querySelector('#user-qr-code svg') as SVGElement;
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);
      const downloadLink = document.createElement('a');
      downloadLink.href = svgUrl;
      downloadLink.download = `BerseMuka-QR-${user?.username || 'user'}.svg`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My BerseMuka QR Code',
          text: `Scan my QR code to connect on BerseMuka! My ID: ${user?.membershipId || user?.id}`,
          url: window.location.origin
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy QR data
      navigator.clipboard.writeText(qrData);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Container>
      <Header>
        <UserName>{user.fullName || 'User'}</UserName>
        <UserId>ID: {user.membershipId || `BM-${user.id?.substring(0, 8)}`}</UserId>
      </Header>

      <PointsSection>
        <PointsBalance>
          <PointsLabel>BersePoints Balance</PointsLabel>
          <PointsValue>{points}</PointsValue>
        </PointsBalance>
        <TierBadge tier={tier}>{tier} Member</TierBadge>
      </PointsSection>

      <QRContainer id="user-qr-code">
        {qrData ? (
          <QRCodeSVG
            value={qrData}
            size={size}
            level="H"
            includeMargin={true}
          />
        ) : (
          <div style={{ 
            width: size, 
            height: size, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: '#999'
          }}>
            Generating QR...
          </div>
        )}
      </QRContainer>

      <ActionButtons>
        <ActionButton onClick={handleDownload}>
          💾 Download
        </ActionButton>
        <ActionButton onClick={handleShare}>
          {copied ? '✅ Copied!' : '📤 Share'}
        </ActionButton>
      </ActionButtons>

      {showInstructions && (
        <Instructions>
          <InstructionText>
            <strong>How to use:</strong><br />
            • Show this QR at events to check in<br />
            • Earn points for event attendance<br />
            • Redeem points for exclusive vouchers<br />
            • Your QR is unique and secure
          </InstructionText>
        </Instructions>
      )}
    </Container>
  );
};