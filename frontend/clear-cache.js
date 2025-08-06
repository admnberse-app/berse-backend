#!/usr/bin/env node

console.log('🧹 Clearing development cache and service worker...');

// Clear service worker registration in development
const clearScript = `
// Clear service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister();
    }
  });
}

// Clear all caches
if ('caches' in window) {
  caches.keys().then(function(keyList) {
    return Promise.all(keyList.map(function(key) {
      return caches.delete(key);
    }));
  });
}

// Clear localStorage and sessionStorage
localStorage.clear();
sessionStorage.clear();

console.log('✅ Cache cleared! Please refresh the page.');
`;

console.log('📝 Service worker cache clearing script ready.');
console.log('💡 To clear cache in browser:');
console.log('   1. Open DevTools (F12)');
console.log('   2. Go to Console');
console.log('   3. Paste and run the following:');
console.log('');
console.log(clearScript);
console.log('');
console.log('🔄 Or visit: http://localhost:5173/clear-sw.html');