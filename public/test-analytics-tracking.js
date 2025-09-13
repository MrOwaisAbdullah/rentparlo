/**
 * Browser Analytics Tracking Test
 * Simple script to test that analytics tracking functions work in the browser
 */

// Test that the tracking functions are available and working
console.log('🧪 Testing Analytics Tracking in Browser...');

// Test tracking function
async function testBrowserTracking() {
  try {
    // Import the tracking utility
    const { default: analytics } = await import('../lib/analytics-tracking');
    
    console.log('✅ Analytics tracking module loaded successfully');
    
    // Test tracking a simple event
    const result = await analytics.trackAnalyticsEvent({
      event_type: 'view',
      listing_id: 'test-listing-123',
      metadata: {
        test: true,
        source: 'browser_test'
      }
    });
    
    if (result) {
      console.log('✅ Analytics event tracked successfully');
    } else {
      console.log('❌ Failed to track analytics event');
      return false;
    }
    
    // Test specific tracking functions
    const listingViewResult = await analytics.trackListingView('test-listing-456');
    if (listingViewResult) {
      console.log('✅ Listing view tracked successfully');
    } else {
      console.log('❌ Failed to track listing view');
      return false;
    }
    
    const profileViewResult = await analytics.trackProfileView('test-seller-789');
    if (profileViewResult) {
      console.log('✅ Profile view tracked successfully');
    } else {
      console.log('❌ Failed to track profile view');
      return false;
    }
    
    console.log('\n🎉 All browser tracking tests passed!');
    return true;
    
  } catch (error) {
    console.error('❌ Error in browser tracking test:', error);
    return false;
  }
}

// Run the test if this script is loaded in the browser
if (typeof window !== 'undefined') {
  // Add to window for easy access in browser console
  window.testAnalyticsTracking = testBrowserTracking;
  
  // Run automatically when loaded
  testBrowserTracking();
}

export default testBrowserTracking;