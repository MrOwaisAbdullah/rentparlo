// Simple script to test direct database queries
import { createClient } from '@supabase/supabase-js';

// Use the same Supabase URL and key as in your project
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_KEY';

if (supabaseUrl === 'YOUR_SUPABASE_URL' || supabaseKey === 'YOUR_SUPABASE_KEY') {
  console.log('⚠️  Please set your Supabase URL and key in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDirectQueries() {
  console.log('Testing direct database queries...');
  
  try {
    // Test seller ID - replace with an actual seller ID from your database
    const testSellerId = '00000000-0000-0000-0000-000000000000';
    
    console.log(`\nTesting analytics for seller ID: ${testSellerId}`);
    
    // Test 1: Direct count query
    console.log('\n1. Testing direct count query...');
    const { count: directCount, error: directCountError } = await supabase
      .from('analytics_events')
      .select('*', { count: 'exact' })
      .eq('event_type', 'view')
      .eq('user_id', testSellerId);
    
    if (directCountError) {
      console.error('❌ Direct count error:', directCountError);
    } else {
      console.log(`✅ Direct count result: ${directCount}`);
    }
    
    // Test 2: Check if any events exist at all
    console.log('\n2. Checking if any events exist for this seller...');
    const { data: eventData, error: eventError } = await supabase
      .from('analytics_events')
      .select('*')
      .eq('user_id', testSellerId)
      .limit(5);
    
    if (eventError) {
      console.error('❌ Event data error:', eventError);
    } else {
      console.log(`✅ Found ${eventData?.length || 0} events for this seller`);
      if (eventData && eventData.length > 0) {
        console.log('Sample events:', eventData.slice(0, 2));
      }
    }
    
    // Test 3: Test the RPC function
    console.log('\n3. Testing RPC function...');
    const { data: rpcData, error: rpcError } = await supabase
      .rpc('get_seller_analytics', { seller_id: testSellerId });
    
    if (rpcError) {
      console.error('❌ RPC function error:', rpcError);
    } else {
      console.log('✅ RPC function result:', rpcData);
    }
    
    console.log('\n🎉 Direct database test completed!');
    
  } catch (error) {
    console.error('❌ Error in testDirectQueries:', error);
  }
}

testDirectQueries();