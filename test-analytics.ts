import { trackAnalyticsEventClient } from './lib/supabase-queries-client';

async function testAnalytics() {
  try {
    // Test tracking a view event
    const result = await trackAnalyticsEventClient({
      event_type: 'view',
      user_id: 'test-user-id',
      listing_id: 'test-listing-id',
      metadata: { test: 'analytics tracking' }
    });
    
    console.log('Analytics tracking result:', result);
  } catch (error) {
    console.error('Error tracking analytics:', error);
  }
}

testAnalytics();