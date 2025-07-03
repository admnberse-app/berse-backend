/**
 * Utility to clear all authentication-related data from browser storage
 * Useful for debugging authentication issues
 */
export const clearAllAuthData = () => {
  // Clear all possible auth-related keys
  const authKeys = [
    'bersemuka_auth_token',
    'bersemuka_user',
    'authToken',
    'auth_token', 
    'token',
    'user',
    'undefined' // Clear any bad values
  ];

  authKeys.forEach(key => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });

  // Also check for and clean up any malformed values
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      const value = localStorage.getItem(key);
      if (value === 'undefined' || value === 'null') {
        localStorage.removeItem(key);
      }
    }
  }

  // Clear all cookies for the domain
  document.cookie.split(";").forEach((c) => {
    document.cookie = c
      .replace(/^ +/, "")
      .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
  });

  console.log('All authentication data cleared');
};

// Add to window for easy debugging
if (typeof window !== 'undefined') {
  (window as any).clearAuth = clearAllAuthData;
}