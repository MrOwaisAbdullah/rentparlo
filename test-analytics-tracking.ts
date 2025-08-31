import { trackAnalyticsEvent, getSellerAnalytics } from './lib/supabase-queries';

async function testAnalyticsTracking() {
  try {
    console.log('Testing analytics tracking...');
    
    // Test seller ID (using a test seller ID)
    const testSellerId = '66666666-6666-6666-6666-666666666666'; // This should be a valid seller ID
    
    // Track a few test events
    console.log('Tracking test events...');
    
    // Track a view event
    const trackResult1 = await trackAnalyticsEvent({
      event_type: 'view',
      user_id: testSellerId,
      listing_id: null,
      metadata: { page: 'seller_profile', username: 'test_seller' }
    });
    
    console.log('View tracking result:', trackResult1);
    
    // Track a contact click event
    const trackResult2 = await trackAnalyticsEvent({
      event_type: 'contact_click',
      user_id: testSellerId,
      listing_id: null,
      metadata: { contact_method: 'call_profile_view' }
    });
    
    console.log('Contact click tracking result:', trackResult2);
    
    // Track a WhatsApp click event
    const trackResult3 = await trackAnalyticsEvent({
      event_type: 'WhatsApp_click',
      user_id: testSellerId,
      listing_id: null,
      metadata: { contact_method: 'whatsapp_profile_view' }
    });
    
    console.log('WhatsApp click tracking result:', trackResult3);
    
    // Wait a moment for the events to be processed
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Get analytics data
    console.log('Fetching analytics data...');
    const analytics = await getSellerAnalytics(testSellerId);
    
    console.log('Analytics result:', analytics);
    
    // Verify the counts
    console.log('\nVerification:');
    console.log(`Total Views: ${analytics.totalViews}`);
    console.log(`Total Contact Clicks: ${analytics.totalContactClicks}`);
    console.log(`Total WhatsApp Clicks: ${analytics.totalWhatsAppClicks}`);
    
    // Check if the counts have increased
    if (analytics.totalViews > 0) {
      console.log('\n✅ Profile views are being tracked correctly!');
    } else {
      console.log('\n❌ Profile views are not being tracked');
    }
    
    if (analytics.totalContactClicks > 0) {
      console.log('✅ Contact clicks are being tracked correctly!');
    } else {
      console.log('❌ Contact clicks are not being tracked');
    }
    
    if (analytics.totalWhatsAppClicks > 0) {
      console.log('✅ WhatsApp clicks are being tracked correctly!');
    } else {
      console.log('❌ WhatsApp clicks are not being tracked');
    }
    
  } catch (error) {
    console.error('Error in test:', error);
  }
}

// Run the test
testAnalyticsTracking();