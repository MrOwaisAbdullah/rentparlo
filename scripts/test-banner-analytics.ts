// Test script for banner analytics system
// This script can be run to verify that all banner components and tracking are working correctly

import { createClient } from '@supabase/supabase-js'

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function testBannerAnalytics() {
  console.log('=== BANNER ANALYTICS TEST ===\n')
  
  // Test 1: Check if banner tables exist
  console.log('1. Checking banner tables...')
  try {
    const { data: impressionsTable, error: impressionsError } = await supabase
      .from('banner_impressions')
      .select('count')
      .limit(1)
    
    if (impressionsError && impressionsError.message.includes('relation "banner_impressions" does not exist')) {
      console.log('   ❌ banner_impressions table does not exist')
    } else {
      console.log('   ✅ banner_impressions table exists')
    }
    
    const { data: clicksTable, error: clicksError } = await supabase
      .from('banner_clicks')
      .select('count')
      .limit(1)
    
    if (clicksError && clicksError.message.includes('relation "banner_clicks" does not exist')) {
      console.log('   ❌ banner_clicks table does not exist')
    } else {
      console.log('   ✅ banner_clicks table exists')
    }
    
    const { data: performanceTable, error: performanceError } = await supabase
      .from('banner_performance_daily')
      .select('count')
      .limit(1)
    
    if (performanceError && performanceError.message.includes('relation "banner_performance_daily" does not exist')) {
      console.log('   ❌ banner_performance_daily table does not exist')
    } else {
      console.log('   ✅ banner_performance_daily table exists')
    }
  } catch (error) {
    console.log('   ❌ Error checking tables:', error)
  }
  
  // Test 2: Check if banner functions exist
  console.log('\n2. Checking banner functions...')
  try {
    const { data: ctrFunction, error: ctrError } = await supabase
      .rpc('calculate_banner_ctr', { impressions: 1000, clicks: 50 })
    
    if (ctrError) {
      console.log('   ❌ calculate_banner_ctr function does not exist or has errors')
    } else {
      console.log('   ✅ calculate_banner_ctr function exists')
      console.log('   📊 CTR for 1000 impressions, 50 clicks:', ctrFunction)
    }
  } catch (error) {
    console.log('   ❌ Error checking calculate_banner_ctr function:', error)
  }
  
  // Test 3: Insert test data
  console.log('\n3. Inserting test banner data...')
  const testBannerId = 'test-banner-' + Date.now()
  const testPlacement = 'homepage-top'
  const testBannerSize = 'leaderboard'
  
  try {
    // Insert test impression
    const { data: impressionData, error: impressionError } = await supabase
      .from('banner_impressions')
      .insert([{
        banner_id: testBannerId,
        placement: testPlacement,
        banner_size: testBannerSize,
        user_id: null,
        guest_id: 'test-guest-id',
        session_ref: null,
        ip_address: '127.0.0.1',
        user_agent: 'Test Agent',
        referrer: 'https://test.com',
        city: 'Test City',
        device_type: 'desktop',
        browser: 'Test Browser',
        os: 'Test OS',
        screen_resolution: '1920x1080',
        viewport_size: '1200x800',
        page_url: 'https://test.com/page',
        page_title: 'Test Page',
        category_context: 'test-category',
        search_query: 'test search',
        created_at: new Date().toISOString()
      }])
    
    if (impressionError) {
      console.log('   ❌ Failed to insert test impression:', impressionError.message)
    } else {
      console.log('   ✅ Successfully inserted test impression')
    }
    
    // Insert test click
    const { data: clickData, error: clickError } = await supabase
      .from('banner_clicks')
      .insert([{
        banner_id: testBannerId,
        user_id: null,
        guest_id: 'test-guest-id',
        session_ref: null,
        location: 'Test City',
        device_type: 'desktop',
        placement: testPlacement,
        banner_size: testBannerSize,
        ip_address: '127.0.0.1',
        user_agent: 'Test Agent',
        referrer: 'https://test.com',
        city: 'Test City',
        browser: 'Test Browser',
        os: 'Test OS',
        page_url: 'https://test.com/page',
        page_title: 'Test Page',
        category_context: 'test-category',
        search_query: 'test search',
        target_url: 'https://target.com',
        time_on_page: 30,
        scroll_depth: 75,
        created_at: new Date().toISOString()
      }])
    
    if (clickError) {
      console.log('   ❌ Failed to insert test click:', clickError.message)
    } else {
      console.log('   ✅ Successfully inserted test click')
    }
  } catch (error) {
    console.log('   ❌ Error inserting test data:', error)
  }
  
  // Test 4: Query test data
  console.log('\n4. Querying test banner data...')
  try {
    // Query impressions
    const { data: impressionsData, error: impressionsQueryError } = await supabase
      .from('banner_impressions')
      .select('*')
      .eq('banner_id', testBannerId)
      .limit(1)
    
    if (impressionsQueryError) {
      console.log('   ❌ Failed to query impressions:', impressionsQueryError.message)
    } else if (impressionsData && impressionsData.length > 0) {
      console.log('   ✅ Successfully queried impressions')
      console.log('   📊 Impression data:', {
        banner_id: impressionsData[0].banner_id,
        placement: impressionsData[0].placement,
        device_type: impressionsData[0].device_type,
        city: impressionsData[0].city
      })
    } else {
      console.log('   ⚠️  No impressions found for test banner')
    }
    
    // Query clicks
    const { data: clicksData, error: clicksQueryError } = await supabase
      .from('banner_clicks')
      .select('*')
      .eq('banner_id', testBannerId)
      .limit(1)
    
    if (clicksQueryError) {
      console.log('   ❌ Failed to query clicks:', clicksQueryError.message)
    } else if (clicksData && clicksData.length > 0) {
      console.log('   ✅ Successfully queried clicks')
      console.log('   📊 Click data:', {
        banner_id: clicksData[0].banner_id,
        placement: clicksData[0].placement,
        target_url: clicksData[0].target_url,
        time_on_page: clicksData[0].time_on_page
      })
    } else {
      console.log('   ⚠️  No clicks found for test banner')
    }
  } catch (error) {
    console.log('   ❌ Error querying test data:', error)
  }
  
  // Test 5: Test analytics function
  console.log('\n5. Testing analytics functions...')
  try {
    const { data: analyticsData, error: analyticsError } = await supabase
      .rpc('get_banner_analytics_summary', {
        p_banner_id: testBannerId
      })
    
    if (analyticsError) {
      console.log('   ❌ Failed to call analytics function:', analyticsError.message)
    } else {
      console.log('   ✅ Successfully called analytics function')
      if (analyticsData) {
        console.log('   📊 Analytics summary:', analyticsData)
      }
    }
  } catch (error) {
    console.log('   ❌ Error testing analytics functions:', error)
  }
  
  // Test 6: Clean up test data
  console.log('\n6. Cleaning up test data...')
  try {
    // Delete test impressions
    const { error: deleteImpressionsError } = await supabase
      .from('banner_impressions')
      .delete()
      .eq('banner_id', testBannerId)
    
    if (deleteImpressionsError) {
      console.log('   ❌ Failed to delete test impressions:', deleteImpressionsError.message)
    } else {
      console.log('   ✅ Successfully deleted test impressions')
    }
    
    // Delete test clicks
    const { error: deleteClicksError } = await supabase
      .from('banner_clicks')
      .delete()
      .eq('banner_id', testBannerId)
    
    if (deleteClicksError) {
      console.log('   ❌ Failed to delete test clicks:', deleteClicksError.message)
    } else {
      console.log('   ✅ Successfully deleted test clicks')
    }
  } catch (error) {
    console.log('   ❌ Error cleaning up test data:', error)
  }
  
  console.log('\n=== TEST COMPLETE ===')
  console.log('If all tests passed, your banner analytics system is working correctly!')
}

// Run the test if this script is executed directly
if (require.main === module) {
  testBannerAnalytics().catch(console.error)
}

export default testBannerAnalytics