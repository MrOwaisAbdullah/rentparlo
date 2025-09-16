import { trackAnalyticsEvent } from './lib/supabase-queries';

async function testAnalyticsTracking() {
  console.log("Testing analytics tracking...");
  
  try {
    const testData = {
      event_type: 'test_event',
      listing_id: 'test_listing_123',
      user_id: null,
      guest_id: 'test_guest_456',
      ip_address: '127.0.0.1',
      user_agent: 'Test Agent',
      referrer: 'https://test.example.com',
      city: 'Test City',
      device_type: 'desktop',
      os: 'Test OS',
      browser: 'Test Browser',
      session_id: 'test_session_789',
    };
    
    console.log("Sending test data:", testData);
    
    const result = await trackAnalyticsEvent(testData);
    
    console.log("Analytics tracking result:", result);
    
    if (result) {
      console.log("✓ Analytics tracking successful!");
    } else {
      console.log("✗ Analytics tracking failed!");
    }
  } catch (error) {
    console.error("Error during analytics tracking test:", error);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testAnalyticsTracking().catch(console.error);
}

export { testAnalyticsTracking };