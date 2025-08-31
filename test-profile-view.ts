import { trackAnalyticsEvent } from './lib/supabase-queries';

async function testProfileViewTracking() {
  try {
    // Test tracking a profile view event
    const result = await trackAnalyticsEvent({
      event_type: 'view',
      user_id: '00000000-0000-0000-0000-000000000000', // Test seller ID
      listing_id: null,
      metadata: { page: 'seller_profile', username: 'testuser' }
    });
    
    console.log('Profile view tracking result:', result);
    
    if (result) {
      console.log('Profile view tracked successfully!');
    } else {
      console.log('Failed to track profile view');
    }
  } catch (error) {
    console.error('Error tracking profile view:', error);
  }
}

testProfileViewTracking();