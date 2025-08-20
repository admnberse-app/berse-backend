/**
 * Test API Configuration
 * Run this in browser console to verify API configuration is correct
 */

export function testApiConfiguration() {
  console.log('🔍 Testing API Configuration...\n');
  
  // Check hostname
  const hostname = window.location.hostname;
  console.log(`📍 Current hostname: ${hostname}`);
  console.log(`📍 Is localhost: ${hostname === 'localhost' || hostname === '127.0.0.1'}`);
  
  // Check environment variables
  const viteApiUrl = import.meta.env.VITE_API_URL;
  console.log(`\n🔧 VITE_API_URL: ${viteApiUrl || '(not set - using proxy)'}`);
  
  // Test auth endpoints
  const testUrls = {
    login: '',
    register: '',
    me: ''
  };
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    testUrls.login = '/api/v1/auth/login';
    testUrls.register = '/api/v1/auth/register';
    testUrls.me = '/api/auth/me';
  } else {
    testUrls.login = 'https://api.berse.app/api/v1/auth/login';
    testUrls.register = 'https://api.berse.app/api/v1/auth/register';
    testUrls.me = 'https://api.berse.app/api/auth/me';
  }
  
  console.log('\n🌐 Expected API URLs:');
  console.log(`  Login:    ${testUrls.login}`);
  console.log(`  Register: ${testUrls.register}`);
  console.log(`  Me:       ${testUrls.me}`);
  
  // Check for double /api issue
  const hasDoubleApi = Object.values(testUrls).some(url => url.includes('/api/api/'));
  if (hasDoubleApi) {
    console.error('\n❌ ERROR: Double /api detected in URLs!');
    console.error('Fix: Comment out VITE_API_URL in frontend/.env');
  } else {
    console.log('\n✅ No double /api issue detected');
  }
  
  // Test backend connectivity
  console.log('\n🔌 Testing backend connectivity...');
  fetch('/api/v1/health')
    .then(res => {
      if (res.ok) {
        console.log('✅ Backend is reachable');
      } else {
        console.error('❌ Backend returned status:', res.status);
      }
    })
    .catch(err => {
      console.error('❌ Cannot reach backend:', err.message);
      console.log('Make sure backend is running on port 3000');
    });
  
  return {
    hostname,
    isLocalhost: hostname === 'localhost' || hostname === '127.0.0.1',
    viteApiUrl,
    urls: testUrls,
    hasDoubleApi
  };
}

// Auto-run on import in development
if (import.meta.env.DEV) {
  console.log('💡 Run testApiConfig() in console to check API configuration');
  (window as any).testApiConfig = testApiConfiguration;
}