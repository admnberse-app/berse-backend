// Initialize user points if not set
export const initializeUserPoints = () => {
  const INITIAL_POINTS = '0';  // New users start with 0 points
  
  // Check if user_points exists in localStorage
  if (!localStorage.getItem('user_points')) {
    localStorage.setItem('user_points', INITIAL_POINTS);
    console.log('✅ User points initialized to', INITIAL_POINTS);
  }
  
  return parseInt(localStorage.getItem('user_points') || INITIAL_POINTS);
};

// Export for use in components
export const getUserPoints = () => {
  return parseInt(localStorage.getItem('user_points') || '0');
};

// Update points
export const updateUserPoints = (newPoints: number) => {
  localStorage.setItem('user_points', newPoints.toString());
  
  // Dispatch custom event for real-time updates
  window.dispatchEvent(new CustomEvent('pointsUpdated', { 
    detail: { points: newPoints } 
  }));
};

// Initialize on import - new users start with 0 points
// Don't force reset for existing users
if (!localStorage.getItem('user_points')) {
  localStorage.setItem('user_points', '0');
}
initializeUserPoints();