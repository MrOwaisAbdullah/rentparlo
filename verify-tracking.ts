import { trackAnalyticsEvent } from './lib/supabase-queries';

async function verifyTracking() {
  console.log('Verifying analytics tracking functionality...');
  
  try {
    // Track a test profile view
    const result = await trackAnalyticsEvent({
      event_type: 'view',
      user_id: 'test-user-id',
      listing_id: null,
      metadata: { page: 'seller_profile', username: 'testuser', test: true }
    });
    
    if (result) {
      console.log('✅ Analytics tracking is working correctly!');
      console.log('✅ Profile view event tracked successfully');
    } else {
      console.log('❌ Failed to track profile view event');
    }
  } catch (error) {
    console.error('❌ Error tracking profile view:', error);
  }
  
  console.log('Verification complete.');
}

verifyTracking();