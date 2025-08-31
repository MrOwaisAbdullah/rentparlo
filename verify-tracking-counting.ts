// Simple verification script to test tracking and counting
console.log('Testing tracking and counting...');

import('./lib/supabase-queries').then(async (module) => {
  console.log('✅ Loaded supabase-queries module');
  
  try {
    // Test tracking
    console.log('\n1. Testing event tracking...');
    const trackResult = await module.trackAnalyticsEvent({
      event_type: 'view',
      user_id: '00000000-0000-0000-0000-000000000000',
      listing_id: null,
      metadata: { test: true, purpose: 'verification' }
    });
    
    console.log('Tracking result:', trackResult);
    
    // Wait a moment for the event to be processed
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Test counting
    console.log('\n2. Testing analytics counting...');
    const analytics = await module.getSellerAnalytics('00000000-0000-0000-0000-000000000000');
    console.log('Analytics result:', analytics);
    
    console.log('\n🎉 Verification completed!');
  } catch (error) {
    console.error('❌ Error in verification:', error);
  }
}).catch(error => {
  console.error('❌ Error loading module:', error);
});