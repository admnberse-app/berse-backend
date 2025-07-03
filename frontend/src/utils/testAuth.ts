import authService from '@frontend-api/services/auth.service';

export const testLogin = async () => {
  console.log('Starting test login...');
  
  try {
    const response = await authService.login({
      email: 'test@example.com',
      password: 'Test123456'
    });
    
    console.log('Full response:', response);
    
    if (response.success && response.data) {
      console.log('Response data:', response.data);
      console.log('Token:', response.data.token);
      console.log('User:', response.data.user);
      
      // Check localStorage
      console.log('Checking localStorage after login:');
      console.log('Token in storage:', localStorage.getItem('bersemuka_auth_token'));
      console.log('User in storage:', localStorage.getItem('bersemuka_user'));
    }
  } catch (error) {
    console.error('Test login error:', error);
  }
};

// Make it available globally for testing
if (typeof window !== 'undefined') {
  (window as any).testLogin = testLogin;
}