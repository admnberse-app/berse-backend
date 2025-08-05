// Quick Authentication Script for BerseMuka
// Copy and paste this into your browser console when on http://localhost:5173

console.log('🎯 BerseMuka Quick Auth Script');

// Method 1: Direct localStorage setup (fastest)
function quickAuth() {
    const testUser = {
        id: "1",
        email: "test@example.com",
        fullName: "Test User",
        firstName: "Test",
        lastName: "User",
        phone: "+60123456789",
        bio: "A test user for development",
        profession: "Software Developer",
        age: 28,
        location: "Kuala Lumpur, Malaysia",
        interests: ["Technology", "Coffee", "Travel"],
        points: 245,
        isVerified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    const testToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwicm9sZSI6IlVTRVIiLCJpYXQiOjE3MjI3NjA4MDAwMDAsImV4cCI6MTcyMzM2NTYwMDAwMH0.mock-signature";

    localStorage.setItem('bersemuka_user', JSON.stringify(testUser));
    localStorage.setItem('bersemuka_auth_token', testToken);
    
    console.log('✅ Authentication set up successfully!');
    console.log('🔄 Reloading page...');
    location.reload();
}

// Method 2: Using the mock auth service (if available)
function authWithMockService() {
    if (typeof window !== 'undefined' && window.mockAuthService) {
        window.mockAuthService.login('test@example.com', 'password')
            .then((response) => {
                if (response.success) {
                    console.log('✅ Mock auth login successful!');
                    location.reload();
                } else {
                    console.error('❌ Mock auth failed:', response.error);
                }
            })
            .catch((error) => {
                console.error('❌ Mock auth error:', error);
            });
    } else {
        console.log('⚠️ Mock auth service not available, using direct method...');
        quickAuth();
    }
}

// Method 3: Clear authentication
function clearAuth() {
    localStorage.removeItem('bersemuka_user');
    localStorage.removeItem('bersemuka_auth_token');
    // Clean up any old keys
    const oldKeys = ['authToken', 'auth_token', 'token', 'user'];
    oldKeys.forEach(key => localStorage.removeItem(key));
    
    console.log('🗑️ Authentication cleared!');
    console.log('🔄 Reloading page...');
    location.reload();
}

// Method 4: Check current auth status
function checkAuth() {
    const user = localStorage.getItem('bersemuka_user');
    const token = localStorage.getItem('bersemuka_auth_token');
    
    console.log('🔍 Current Authentication Status:');
    console.log('User:', user ? JSON.parse(user) : 'None');
    console.log('Token:', token ? token.substring(0, 50) + '...' : 'None');
    console.log('Authenticated:', !!(user && token));
    
    return {
        user: user ? JSON.parse(user) : null,
        token,
        isAuthenticated: !!(user && token)
    };
}

// Export functions to global scope
window.quickAuth = quickAuth;
window.authWithMockService = authWithMockService;
window.clearAuth = clearAuth;
window.checkAuth = checkAuth;

console.log('📋 Available functions:');
console.log('• quickAuth() - Set up test authentication (fastest)');
console.log('• authWithMockService() - Use mock service authentication');
console.log('• clearAuth() - Clear all authentication');
console.log('• checkAuth() - Check current authentication status');
console.log('');
console.log('🚀 Quick start: Run quickAuth() then visit /connect or /profile');