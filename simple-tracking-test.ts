// Simple test to verify tracking is working
console.log('Testing if tracking function is accessible...');

// Import and test the tracking function
import('./lib/supabase-queries').then(module => {
  console.log('✅ supabase-queries module loaded successfully');
  console.log('Available functions:', Object.keys(module));
  
  if (typeof module.trackAnalyticsEvent === 'function') {
    console.log('✅ trackAnalyticsEvent function is available');
  } else {
    console.log('❌ trackAnalyticsEvent function is NOT available');
  }
  
  if (typeof module.getSellerAnalytics === 'function') {
    console.log('✅ getSellerAnalytics function is available');
  } else {
    console.log('❌ getSellerAnalytics function is NOT available');
  }
}).catch(error => {
  console.error('❌ Error loading supabase-queries module:', error);
});

console.log('Test completed.');