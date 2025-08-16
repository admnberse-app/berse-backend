import React, { useState } from 'react';
import styled from 'styled-components';

const ModalOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: ${({ $isOpen }) => $isOpen ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
  backdrop-filter: blur(2px);
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 20px;
  padding: 24px;
  max-width: 400px;
  width: 100%;
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  right: 20px;
  top: 20px;
  background: rgba(0, 0, 0, 0.1);
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  color: #333;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(0, 0, 0, 0.2);
    transform: scale(1.1);
  }
`;

const ModalTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-bottom: 20px;
  padding-right: 40px;
  text-align: center;
`;

const ShareOptions = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 20px;
`;

const ShareOption = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px 8px;
  background: #f8f9fa;
  border: 1px solid #e5e5e5;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #e8f7f0;
    border-color: #2fce98;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
`;

const ShareIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-bottom: 8px;
  background: ${({ color }: { color?: string }) => color || '#f0f0f0'};
`;

const ShareLabel = styled.span`
  font-size: 12px;
  font-weight: 500;
  color: #333;
`;

const LinkSection = styled.div`
  background: #f8f9fa;
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 16px;
`;

const LinkLabel = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: #666;
  margin-bottom: 8px;
`;

const LinkContainer = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const LinkInput = styled.input`
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #e5e5e5;
  border-radius: 6px;
  font-size: 12px;
  background: white;
  color: #666;
  
  &:focus {
    outline: none;
    border-color: #2fce98;
  }
`;

const CopyButton = styled.button`
  padding: 8px 16px;
  background: #2fce98;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  
  &:hover {
    background: #26b580;
  }
  
  &.copied {
    background: #4caf50;
  }
`;

const PreviewSection = styled.div`
  background: #fafafa;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
  max-height: 120px;
  overflow-y: auto;
`;

const PreviewText = styled.p`
  font-size: 11px;
  color: #666;
  line-height: 1.5;
  margin: 0;
  white-space: pre-wrap;
`;

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareData: {
    title: string;
    text: string;
    url?: string;
  } | null;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  shareData
}) => {
  const [copied, setCopied] = useState(false);

  if (!shareData) return null;

  const shareUrl = shareData.url || window.location.href;
  const shareText = `${shareData.text}\n\n${shareUrl}`;

  const handleWhatsApp = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(whatsappUrl, '_blank');
    onClose();
  };

  const handleInstagram = () => {
    // Instagram doesn't support direct sharing via URL
    // Copy to clipboard and show instruction
    handleCopyLink();
    alert('Link copied! Open Instagram and paste in your story or bio.');
    onClose();
  };

  const handleTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareData.text)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank');
    onClose();
  };

  const handleFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(facebookUrl, '_blank');
    onClose();
  };

  const handleTelegram = () => {
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareData.text)}`;
    window.open(telegramUrl, '_blank');
    onClose();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleWebShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareData.title,
          text: shareData.text,
          url: shareUrl
        });
        onClose();
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <ModalOverlay $isOpen={isOpen} onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={onClose}>×</CloseButton>
        
        <ModalTitle>Share {shareData.title}</ModalTitle>

        <PreviewSection>
          <PreviewText>{shareData.text}</PreviewText>
        </PreviewSection>
        
        <ShareOptions>
          <ShareOption onClick={handleWhatsApp}>
            <ShareIcon color="linear-gradient(135deg, #25D366, #128C7E)">
              📱
            </ShareIcon>
            <ShareLabel>WhatsApp</ShareLabel>
          </ShareOption>
          
          <ShareOption onClick={handleInstagram}>
            <ShareIcon color="linear-gradient(135deg, #E1306C, #C13584, #833AB4, #5851DB, #405DE6)">
              📷
            </ShareIcon>
            <ShareLabel>Instagram</ShareLabel>
          </ShareOption>
          
          <ShareOption onClick={handleTwitter}>
            <ShareIcon color="linear-gradient(135deg, #1DA1F2, #0d8bd9)">
              🐦
            </ShareIcon>
            <ShareLabel>Twitter</ShareLabel>
          </ShareOption>
          
          <ShareOption onClick={handleFacebook}>
            <ShareIcon color="linear-gradient(135deg, #1877F2, #0e65d9)">
              👍
            </ShareIcon>
            <ShareLabel>Facebook</ShareLabel>
          </ShareOption>
          
          <ShareOption onClick={handleTelegram}>
            <ShareIcon color="linear-gradient(135deg, #0088cc, #0077b3)">
              ✈️
            </ShareIcon>
            <ShareLabel>Telegram</ShareLabel>
          </ShareOption>
          
          <ShareOption onClick={handleWebShare}>
            <ShareIcon color="linear-gradient(135deg, #2fce98, #26b580)">
              🔗
            </ShareIcon>
            <ShareLabel>More</ShareLabel>
          </ShareOption>
        </ShareOptions>
        
        <LinkSection>
          <LinkLabel>Or copy link</LinkLabel>
          <LinkContainer>
            <LinkInput 
              type="text" 
              value={shareUrl} 
              readOnly 
            />
            <CopyButton 
              onClick={handleCopyLink}
              className={copied ? 'copied' : ''}
            >
              {copied ? 'Copied!' : 'Copy'}
            </CopyButton>
          </LinkContainer>
        </LinkSection>
      </ModalContent>
    </ModalOverlay>
  );
};