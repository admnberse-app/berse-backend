// Admin utilities for BerseMuka app

const ADMIN_EMAILS = [
  'zaydmahdaly@ahlumran.org',
  // Add more admin emails here as needed
];

export const isUserAdmin = (email?: string): boolean => {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
};

export const checkAdminAccess = (user: any): boolean => {
  if (!user) return false;
  
  // Check if user has isAdmin flag
  if (user.isAdmin === true) return true;
  
  // Check if user email is in admin list
  if (user.email && isUserAdmin(user.email)) return true;
  
  // Check if user has ADMIN role
  if (user.role === 'ADMIN') return true;
  
  return false;
};