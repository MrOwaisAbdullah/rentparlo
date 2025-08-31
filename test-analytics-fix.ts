import { trackAnalyticsEvent, getSellerAnalytics } from './lib/supabase-queries.ts';

async function testAnalyticsTracking() {
  try {
    console.log('Testing analytics tracking...');
    
    // Test seller ID (using the one from the logs)
    const testSellerId = '66666666-6666-6666-6666-666666666666';
    
    // Track a few test events
    console.log('Tracking test events...');
    
    const trackResult1 = await trackAnalyticsEvent({
      event_type: 'view',
      user_id: testSellerId,
      listing_id: null,
      metadata: { page: 'seller_profile', username: 'hassan_tools' }
    });
    
    console.log('View tracking result:', trackResult1);
    
    const trackResult2 = await trackAnalyticsEvent({
      event_type: 'contact_click',
      user_id: testSellerId,
      listing_id: null,
      metadata: { contact_method: 'call_profile_view' }
    });
    
    console.log('Contact click tracking result:', trackResult2);
    
    const trackResult3 = await trackAnalyticsEvent({
      event_type: 'WhatsApp_click',
      user_id: testSellerId,
      listing_id: null,
      metadata: { contact_method: 'whatsapp_profile_view' }
    });
    
    console.log('WhatsApp click tracking result:', trackResult3);
    
    // Wait a moment for the events to be processed
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Get analytics data
    console.log('Fetching analytics data...');
    const analytics = await getSellerAnalytics(testSellerId);
    
    console.log('Analytics result:', analytics);
    
    // Verify the counts
    console.log('\nVerification:');
    console.log(`Total Views: ${analytics.totalViews} (expected: 1)`);
    console.log(`Total Contact Clicks: ${analytics.totalContactClicks} (expected: 1)`);
    console.log(`Total WhatsApp Clicks: ${analytics.totalWhatsAppClicks} (expected: 1)`);
    
    if (analytics.totalViews >= 1 && analytics.totalContactClicks >= 1 && analytics.totalWhatsAppClicks >= 1) {
      console.log('\n✅ All analytics tracking working correctly!');
    } else {
      console.log('\n❌ Analytics tracking not working as expected');
    }
  } catch (error) {
    console.error('Error in test:', error);
  }
}

testAnalyticsTracking();