import { trackAnalyticsEvent } from './lib/supabase-queries';
import { createClient } from '@/utils/supabase/server';

async function debugAnalytics() {
  console.log('Testing analytics tracking and retrieval...');
  
  try {
    // Test tracking a profile view event
    console.log('Tracking a profile view event...');
    const trackResult = await trackAnalyticsEvent({
      event_type: 'view',
      user_id: '00000000-0000-0000-0000-000000000000', // Test seller ID
      listing_id: null,
      metadata: { page: 'seller_profile', username: 'testuser', debug: true }
    });
    
    console.log('Tracking result:', trackResult);
    
    if (trackResult) {
      console.log('✅ Profile view tracked successfully!');
    } else {
      console.log('❌ Failed to track profile view');
      return;
    }
    
    // Wait a moment for the event to be processed
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if the event was inserted
    console.log('\nChecking if event was inserted...');
    const supabase = await createClient();
    
    const { data: events, error: eventsError } = await supabase
      .from('analytics_events')
      .select('*')
      .eq('user_id', '00000000-0000-0000-0000-000000000000')
      .eq('event_type', 'view')
      .limit(5);
    
    if (eventsError) {
      console.error('Error fetching events:', eventsError);
      return;
    }
    
    console.log('Recent events for test user:', events);
    
    // Test the RPC function
    console.log('\nTesting RPC function...');
    const { data: rpcData, error: rpcError } = await supabase
      .rpc('get_seller_analytics', { seller_id: '00000000-0000-0000-0000-000000000000' });
    
    if (rpcError) {
      console.error('RPC function error:', rpcError);
    } else {
      console.log('RPC function result:', rpcData);
    }
    
    // Test the fallback queries
    console.log('\nTesting fallback queries...');
    
    // Get total views
    const { count: totalViews, error: viewsError } = await supabase
      .from('analytics_events')
      .select('*', { count: 'exact' })
      .eq('event_type', 'view')
      .eq('user_id', '00000000-0000-0000-0000-000000000000');

    if (viewsError) {
      console.error('Views query error:', viewsError);
    } else {
      console.log('Total views count:', totalViews);
    }
    
    console.log('\n✅ Debug complete!');
    
  } catch (error) {
    console.error('Error in debugAnalytics:', error);
  }
}

debugAnalytics();