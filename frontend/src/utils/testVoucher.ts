// Test voucher redemption flow
import { voucherService } from '../services/voucherService';

// Add test function to window for browser console testing
declare global {
  interface Window {
    testVoucherRedemption: () => void;
    validateVoucher: (code: string) => void;
    getVoucherStats: () => void;
  }
}

window.testVoucherRedemption = () => {
  // Simulate creating a voucher
  const mockReward = {
    id: 'test_1',
    brand: 'Tealive',
    title: 'RM 7 Boba Voucher',
    icon: '🧋',
    points: 7,
    value: 'RM 7'
  };
  
  const voucher = voucherService.createVoucher(mockReward, 'test_user_id');
  console.log('✅ Voucher created:', voucher);
  console.log('📋 Voucher code:', voucher.code);
  console.log('📅 Expires:', voucher.expiryDate.toLocaleDateString());
  
  // Show user's vouchers
  const userVouchers = voucherService.getUserVouchers('test_user_id');
  console.log('📊 User vouchers:', userVouchers);
};

window.validateVoucher = (code: string) => {
  const validation = voucherService.validateVoucher(code);
  
  if (validation.isValid) {
    console.log('✅ VALID VOUCHER');
    console.log('Brand:', validation.voucher?.brand);
    console.log('Value:', validation.voucher?.value);
    console.log('Expires:', validation.voucher?.expiryDate.toLocaleDateString());
  } else {
    console.log('❌ INVALID:', validation.error);
    console.log('Message:', validation.message);
  }
};

window.getVoucherStats = () => {
  const stats = voucherService.getVoucherStats('test_user_id');
  console.log('📊 Voucher Statistics:');
  console.log('Total redeemed:', stats.totalRedeemed);
  console.log('Total saved: RM', stats.totalSaved);
  console.log('Active vouchers:', stats.activeCount);
  console.log('This month:', stats.monthlyRedemptions);
};

// Add points testing functions
declare global {
  interface Window {
    setPoints: (points: number) => void;
    getPoints: () => void;
    testPointsSync: () => void;
    testRedemptionFlow: () => void;
  }
}

window.setPoints = (points: number) => {
  localStorage.setItem('user_points', points.toString());
  window.dispatchEvent(new CustomEvent('pointsUpdated', { 
    detail: { points } 
  }));
  console.log('✅ Points set to:', points);
};

window.getPoints = () => {
  const points = parseInt(localStorage.getItem('user_points') || '275');
  console.log('📊 Current points:', points);
  return points;
};

window.testPointsSync = () => {
  console.log('🔄 Testing points synchronization...');
  console.log('Initial points:', window.getPoints());
  
  setTimeout(() => {
    console.log('Setting points to 300...');
    window.setPoints(300);
  }, 1000);
  
  setTimeout(() => {
    console.log('Setting points to 150...');
    window.setPoints(150);
  }, 2000);
  
  setTimeout(() => {
    console.log('Resetting points to 245...');
    window.setPoints(245);
  }, 3000);
};

window.testRedemptionFlow = () => {
  console.log('🎫 Testing complete redemption flow...');
  
  // Check if we're on the rewards page
  if (window.location.pathname.includes('/points') || window.location.pathname.includes('/rewards')) {
    console.log('✅ On rewards page');
    console.log('💰 Current points:', window.getPoints());
    
    // Try to find a redeem button
    const redeemButtons = document.querySelectorAll('button');
    const redeemButton = Array.from(redeemButtons).find(btn => 
      btn.textContent?.includes('Redeem') && !btn.textContent?.includes('Not enough')
    );
    
    if (redeemButton) {
      console.log('✅ Found redeem button:', redeemButton.textContent);
      console.log('🔘 Clicking redeem button...');
      console.log('Expected flow:');
      console.log('1. Click Redeem → Confirmation modal appears');
      console.log('2. Click Confirm → Points deducted, voucher generated');
      console.log('3. Voucher modal shows with QR code and buttons');
      console.log('4. Save/Share/Done buttons available');
      console.log('5. Points updated in real-time across screens');
      
      redeemButton.click();
      
      setTimeout(() => {
        console.log('🔍 Checking for confirmation modal...');
        const confirmButtons = document.querySelectorAll('button');
        const confirmButton = Array.from(confirmButtons).find(btn => 
          btn.textContent?.includes('Confirm')
        );
        
        if (confirmButton) {
          console.log('✅ Confirmation modal found! Click "Confirm Redeem" to continue...');
        } else {
          console.log('❌ Confirmation modal not found');
        }
      }, 500);
    } else {
      console.log('❌ No redeem buttons found');
      console.log('Available buttons:', Array.from(redeemButtons).map(btn => btn.textContent));
      console.log('💡 Make sure you have sufficient points (245) and are on the rewards tab');
    }
  } else {
    console.log('❌ Not on rewards page. Navigate to /points or /rewards first.');
  }
};

console.log('🎫 Voucher test functions loaded!');
console.log('Available commands:');
console.log('- testVoucherRedemption() : Create a test voucher');
console.log('- validateVoucher("BM-XXX-XXXXX") : Validate a voucher code');
console.log('- getVoucherStats() : Get voucher statistics');
console.log('- setPoints(245) : Set user points');
console.log('- getPoints() : Get current points');
console.log('- testPointsSync() : Test real-time points synchronization');
console.log('- testRedemptionFlow() : Test clicking redeem button (must be on rewards page)');

export {};