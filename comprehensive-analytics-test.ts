import { trackAnalyticsEvent, getSellerAnalytics } from './lib/supabase-queries';

async function comprehensiveAnalyticsTest() {
  try {
    console.log('=== Comprehensive Analytics Tracking Test ===\n');
    
    // Test seller ID (using the one from your logs)
    const testSellerId = '66666666-6666-6666-6666-666666666666';
    const testUsername = 'hassan_tools';
    
    console.log(`Testing analytics for seller: ${testSellerId} (${testUsername})\n`);
    
    // 1. Get initial analytics data
    console.log('1. Getting initial analytics data...');
    const initialAnalytics = await getSellerAnalytics(testSellerId);
    console.log('Initial analytics:', initialAnalytics);
    
    // 2. Track a profile view
    console.log('\n2. Tracking a profile view...');
    const viewResult = await trackAnalyticsEvent({
      event_type: 'view',
      user_id: testSellerId,
      listing_id: null,
      metadata: { page: 'seller_profile', username: testUsername }
    });
    console.log('View tracking result:', viewResult);
    
    // 3. Track a contact click
    console.log('\n3. Tracking a contact click...');
    const contactResult = await trackAnalyticsEvent({
      event_type: 'contact_click',
      user_id: testSellerId,
      listing_id: null,
      metadata: { contact_method: 'call_profile_view' }
    });
    console.log('Contact click tracking result:', contactResult);
    
    // 4. Track a WhatsApp click
    console.log('\n4. Tracking a WhatsApp click...');
    const whatsappResult = await trackAnalyticsEvent({
      event_type: 'WhatsApp_click',
      user_id: testSellerId,
      listing_id: null,
      metadata: { contact_method: 'whatsapp_profile_view' }
    });
    console.log('WhatsApp click tracking result:', whatsappResult);
    
    // 5. Wait a moment for the events to be processed
    console.log('\n5. Waiting for events to be processed...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 6. Get updated analytics data
    console.log('\n6. Getting updated analytics data...');
    const updatedAnalytics = await getSellerAnalytics(testSellerId);
    console.log('Updated analytics:', updatedAnalytics);
    
    // 7. Compare results
    console.log('\n7. Comparing results...');
    console.log(`Initial views: ${initialAnalytics.totalViews}`);
    console.log(`Updated views: ${updatedAnalytics.totalViews}`);
    console.log(`View increase: ${updatedAnalytics.totalViews - initialAnalytics.totalViews}`);
    
    console.log(`Initial contact clicks: ${initialAnalytics.totalContactClicks}`);
    console.log(`Updated contact clicks: ${updatedAnalytics.totalContactClicks}`);
    console.log(`Contact click increase: ${updatedAnalytics.totalContactClicks - initialAnalytics.totalContactClicks}`);
    
    console.log(`Initial WhatsApp clicks: ${initialAnalytics.totalWhatsAppClicks}`);
    console.log(`Updated WhatsApp clicks: ${updatedAnalytics.totalWhatsAppClicks}`);
    console.log(`WhatsApp click increase: ${updatedAnalytics.totalWhatsAppClicks - initialAnalytics.totalWhatsAppClicks}`);
    
    // 8. Verification
    console.log('\n8. Verification Results:');
    if (updatedAnalytics.totalViews > initialAnalytics.totalViews) {
      console.log('✅ Profile views are increasing correctly!');
    } else {
      console.log('❌ Profile views are NOT increasing');
    }
    
    if (updatedAnalytics.totalContactClicks > initialAnalytics.totalContactClicks) {
      console.log('✅ Contact clicks are increasing correctly!');
    } else {
      console.log('❌ Contact clicks are NOT increasing');
    }
    
    if (updatedAnalytics.totalWhatsAppClicks > initialAnalytics.totalWhatsAppClicks) {
      console.log('✅ WhatsApp clicks are increasing correctly!');
    } else {
      console.log('❌ WhatsApp clicks are NOT increasing');
    }
    
    // 9. Test RPC function directly
    console.log('\n9. Testing RPC function directly...');
    try {
      const { createClient } = await import('./utils/supabase/server');
      const supabase = await createClient();
      const rpcResult = await supabase.rpc('get_seller_analytics', { seller_id: testSellerId });
      console.log('RPC function result:', rpcResult);
      
      if (rpcResult.data && rpcResult.data.length > 0) {
        console.log('✅ RPC function is working correctly!');
        console.log('RPC total views:', rpcResult.data[0].total_views);
        console.log('RPC total contact clicks:', rpcResult.data[0].total_contact_clicks);
        console.log('RPC total WhatsApp clicks:', rpcResult.data[0].total_whatsapp_clicks);
      } else {
        console.log('❌ RPC function returned no data');
      }
    } catch (rpcError) {
      console.log('❌ RPC function test failed:', rpcError);
    }
    
    console.log('\n=== Test Complete ===');
    
  } catch (error) {
    console.error('Error in comprehensive test:', error);
  }
}

// Run the test
comprehensiveAnalyticsTest();