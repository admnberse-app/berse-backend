import React, { useState } from 'react';
import styled from 'styled-components';

interface SendFriendRequestButtonProps {
  userId: string;
  userName?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  showIcon?: boolean;
}

export const SendFriendRequestButton: React.FC<SendFriendRequestButtonProps> = ({
  userId,
  userName = 'this user',
  onSuccess,
  onError,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  showIcon = true
}) => {
  const [loading, setLoading] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  const handleSendFriendRequest = async () => {
    if (requestSent) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('bersemuka_token');
      
      if (!token) {
        const error = 'Please login to send friend requests';
        onError?.(error);
        alert(error);
        return;
      }

      const response = await fetch(
        `${window.location.hostname === 'localhost' ? '' : 'https://api.berse.app'}/api/v1/users/follow/${userId}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        setRequestSent(true);
        const successMessage = `Friend request sent to ${userName}! They will receive a message notification.`;
        onSuccess?.();
        alert(successMessage);
      } else if (response.status === 400) {
        const error = await response.json();
        if (error.message?.includes('Already following')) {
          const errorMessage = 'You have already sent a friend request to this user.';
          onError?.(errorMessage);
          alert(errorMessage);
          setRequestSent(true);
        } else if (error.message?.includes('Cannot follow yourself')) {
          const errorMessage = 'You cannot send a friend request to yourself.';
          onError?.(errorMessage);
          alert(errorMessage);
        } else {
          throw new Error('Failed to send friend request');
        }
      } else {
        throw new Error('Failed to send friend request');
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
      const errorMessage = 'Failed to send friend request. Please try again.';
      onError?.(errorMessage);
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <StyledButton
      onClick={handleSendFriendRequest}
      disabled={loading || requestSent}
      $variant={variant}
      $size={size}
      $fullWidth={fullWidth}
      $requestSent={requestSent}
    >
      {loading ? (
        <>⏳ Sending...</>
      ) : requestSent ? (
        <>✅ Request Sent</>
      ) : (
        <>{showIcon && '🤝 '}Send Friend Request</>
      )}
    </StyledButton>
  );
};

const StyledButton = styled.button<{
  $variant: 'primary' | 'secondary';
  $size: 'small' | 'medium' | 'large';
  $fullWidth: boolean;
  $requestSent: boolean;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: ${props => props.$fullWidth ? '100%' : 'auto'};
  padding: ${props => {
    switch (props.$size) {
      case 'small': return '6px 12px';
      case 'large': return '14px 24px';
      default: return '10px 18px';
    }
  }};
  font-size: ${props => {
    switch (props.$size) {
      case 'small': return '13px';
      case 'large': return '16px';
      default: return '14px';
    }
  }};
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: ${props => props.$requestSent ? 'default' : 'pointer'};
  transition: all 0.2s ease;
  
  background: ${props => {
    if (props.$requestSent) return '#28a745';
    return props.$variant === 'primary' ? '#2fce98' : '#f0f0f0';
  }};
  
  color: ${props => {
    if (props.$requestSent) return 'white';
    return props.$variant === 'primary' ? 'white' : '#333';
  }};
  
  &:hover:not(:disabled) {
    ${props => !props.$requestSent && `
      transform: translateY(-1px);
      background: ${props.$variant === 'primary' ? '#26b584' : '#e0e0e0'};
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    `}
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: ${props => props.$requestSent ? 1 : 0.6};
    cursor: ${props => props.$requestSent ? 'default' : 'not-allowed'};
  }
`;

// Export a compact version for use in cards
export const CompactFriendRequestButton = styled(SendFriendRequestButton)`
  padding: 8px 14px;
  font-size: 13px;
`;