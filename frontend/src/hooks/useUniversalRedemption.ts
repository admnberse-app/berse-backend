// Universal Redemption Hook - Reusable across all components
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { universalRedemptionService, UniversalReward } from '../services/universalRedemptionService';
import { getUserPoints } from '../utils/initializePoints';

export interface UseUniversalRedemptionReturn {
  // State
  selectedReward: UniversalReward | null;
  showConfirmModal: boolean;
  showVoucherModal: boolean;
  generatedVoucher: any | null;
  toast: {
    show: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
  };
  currentPoints: number;
  
  // Actions
  handleRedeemClick: (reward: any) => void;
  handleConfirmRedeem: () => void;
  closeConfirmModal: () => void;
  closeVoucherModal: () => void;
  navigateToVouchers: () => void;
  closeToast: () => void;
  
  // Utilities
  canAfford: (points: number) => boolean;
  getButtonProps: (reward: any) => {
    text: string;
    disabled: boolean;
    style: any;
  };
}

export const useUniversalRedemption = (): UseUniversalRedemptionReturn => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State management
  const [selectedReward, setSelectedReward] = useState<UniversalReward | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [generatedVoucher, setGeneratedVoucher] = useState<any>(null);
  const [currentPoints, setCurrentPoints] = useState(getUserPoints());
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
  }>({
    show: false,
    message: '',
    type: 'success'
  });

  // Listen for points updates (this should be called in components using useEffect)
  const updatePoints = () => {
    setCurrentPoints(getUserPoints());
  };

  // Check if user can afford reward
  const canAfford = (points: number): boolean => {
    return universalRedemptionService.canAfford(points);
  };

  // Get button properties for any reward
  const getButtonProps = (reward: any) => {
    const normalizedReward = universalRedemptionService.normalizeReward(reward);
    return universalRedemptionService.getButtonProps(normalizedReward);
  };

  // Handle redeem button click for any reward
  const handleRedeemClick = (reward: any) => {
    console.log('🎫 Universal redeem clicked for:', reward.brand || reward.title);
    
    const normalizedReward = universalRedemptionService.normalizeReward(reward);
    
    // Check if user has sufficient points
    if (!universalRedemptionService.canAfford(normalizedReward.points)) {
      const errorMessage = universalRedemptionService.getPointsNeededMessage(normalizedReward);
      alert(errorMessage);
      return;
    }
    
    setSelectedReward(normalizedReward);
    setShowConfirmModal(true);
  };

  // Handle confirmation of redemption
  const handleConfirmRedeem = async () => {
    console.log('✅ Universal confirm redeem called');
    
    if (!selectedReward || !user) {
      setToast({
        show: true,
        message: 'Redemption Error: Please try again.',
        type: 'error'
      });
      setShowConfirmModal(false);
      return;
    }

    try {
      const oldPoints = getUserPoints();
      const result = await universalRedemptionService.redeemReward(selectedReward, user.id);
      
      if (result.success && result.voucher) {
        // Update local state
        setCurrentPoints(result.newBalance || 0);
        setGeneratedVoucher(result.voucher);
        
        // Close confirm modal and show voucher modal
        setShowConfirmModal(false);
        setShowVoucherModal(true);
        
        // Show success toast
        const successMessage = universalRedemptionService.getSuccessMessage(
          selectedReward,
          oldPoints,
          result.newBalance || 0
        );
        
        setToast({
          show: true,
          message: successMessage,
          type: 'success'
        });
        
        console.log('✅ Universal redemption successful!');
      } else {
        // Handle redemption failure
        setToast({
          show: true,
          message: result.error || 'Redemption failed. Please try again.',
          type: 'error'
        });
        setShowConfirmModal(false);
      }
      
    } catch (error) {
      console.error('❌ Universal redemption error:', error);
      
      setToast({
        show: true,
        message: 'Redemption failed! Please try again.',
        type: 'error'
      });
      
      setShowConfirmModal(false);
    }
  };

  // Close confirmation modal
  const closeConfirmModal = () => {
    setShowConfirmModal(false);
    setSelectedReward(null);
  };

  // Close voucher modal
  const closeVoucherModal = () => {
    setShowVoucherModal(false);
    setGeneratedVoucher(null);
  };

  // Navigate to vouchers page
  const navigateToVouchers = () => {
    navigate('/vouchers');
  };

  // Close toast notification
  const closeToast = () => {
    setToast({ ...toast, show: false });
  };

  return {
    // State
    selectedReward,
    showConfirmModal,
    showVoucherModal,
    generatedVoucher,
    toast,
    currentPoints,
    
    // Actions
    handleRedeemClick,
    handleConfirmRedeem,
    closeConfirmModal,
    closeVoucherModal,
    navigateToVouchers,
    closeToast,
    
    // Utilities
    canAfford,
    getButtonProps
  };
};