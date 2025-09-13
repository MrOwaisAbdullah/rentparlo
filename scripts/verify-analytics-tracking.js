#!/usr/bin/env node

/**
 * Analytics Tracking Verification Script
 * Tests that all analytics tracking components are working properly
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration - replace with your actual values
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing Supabase configuration. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function testGuestIdGeneration() {
  console.log('🧪 Testing Guest ID Generation...');
  
  // Test that we can generate a guest ID
  const guestId = `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  console.log(`✅ Generated guest ID: ${guestId}`);
  
  return guestId;
}

async function testUserCreationWithGuestId() {
  console.log('\n🔧 Testing User Creation with Guest ID...');
  
  const guestId = await testGuestIdGeneration();
  
  // Test creating a user profile with guest ID
  try {
    const testUserId = '00000000-0000-0000-0000-000000000001';
    
    const { error } = await supabase.rpc('create_user_profile_after_signup', {
      p_id: testUserId,
      p_email: 'test@example.com',
      p_name: 'Test User',
      p_phone: '+923001234567',
      p_role: 'user',
      p_city: 'Karachi',
      p_country: 'Pakistan',
      p_is_verified: false,
      p_email_verified: false,
      p_active: true,
      p_guest_id: guestId,
      p_notification_preferences: { email: true, sms: false, push: true },
      p_preferred_language: 'en'
    });
    
    if (error) {
      console.error('❌ Error creating user profile:', error.message);
      return false;
    }
    
    console.log('✅ User profile created successfully with guest ID');
    
    // Verify the user profile was created with the correct guest ID
    const { data, error: fetchError } = await supabase
      .from('users')
      .select('guest_id')
      .eq('id', testUserId)
      .single();
    
    if (fetchError) {
      console.error('❌ Error fetching user profile:', fetchError.message);
      return false;
    }
    
    if (data.guest_id !== guestId) {
      console.error(`❌ Guest ID mismatch. Expected: ${guestId}, Got: ${data.guest_id}`);
      return false;
    }
    
    console.log('✅ Guest ID correctly stored in user profile');
    
    // Clean up test user
    await supabase
      .from('users')
      .delete()
      .eq('id', testUserId);
    
    console.log('🧹 Cleaned up test user');
    return true;
    
  } catch (error) {
    console.error('❌ Error in user creation test:', error.message);
    return false;
  }
}

async function testAnalyticsEventTracking() {
  console.log('\n📊 Testing Analytics Event Tracking...');
  
  const guestId = await testGuestIdGeneration();
  
  try {
    // Test tracking a view event
    const { error } = await supabase
      .from('analytics_events')
      .insert({
        event_type: 'view',
        listing_id: 'test-listing-123',
        guest_id: guestId,
        metadata: { 
          test: true,
          source: 'verification_script'
        },
        created_at: new Date().toISOString()
      });
    
    if (error) {
      console.error('❌ Error tracking analytics event:', error.message);
      return false;
    }
    
    console.log('✅ Analytics event tracked successfully');
    
    // Verify the event was stored
    const { data, error: fetchError } = await supabase
      .from('analytics_events')
      .select('*')
      .eq('listing_id', 'test-listing-123')
      .eq('guest_id', guestId)
      .limit(1);
    
    if (fetchError) {
      console.error('❌ Error fetching analytics event:', fetchError.message);
      return false;
    }
    
    if (data.length === 0) {
      console.error('❌ Analytics event not found in database');
      return false;
    }
    
    console.log('✅ Analytics event correctly stored in database');
    
    // Clean up test event
    await supabase
      .from('analytics_events')
      .delete()
      .eq('listing_id', 'test-listing-123')
      .eq('guest_id', guestId);
    
    console.log('🧹 Cleaned up test analytics event');
    return true;
    
  } catch (error) {
    console.error('❌ Error in analytics tracking test:', error.message);
    return false;
  }
}

async function testDatabaseSchema() {
  console.log('\n📋 Testing Database Schema...');
  
  try {
    // Check that required tables exist
    const requiredTables = [
      'users',
      'analytics_events',
      'banner_impressions',
      'banner_clicks',
      'banner_performance_daily'
    ];
    
    for (const table of requiredTables) {
      const { error } = await supabase
        .from(table)
        .select('count(*)', { count: 'exact', head: true });
      
      if (error) {
        console.error(`❌ Required table '${table}' not found or inaccessible:`, error.message);
        return false;
      }
      
      console.log(`✅ Table '${table}' exists and is accessible`);
    }
    
    // Check that users table has guest_id column
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('guest_id')
      .limit(1);
    
    if (userError) {
      console.error('❌ Error accessing users table:', userError.message);
      return false;
    }
    
    console.log('✅ Users table has guest_id column');
    
    // Check that analytics_events table has metadata column
    const { data: analyticsData, error: analyticsError } = await supabase
      .from('analytics_events')
      .select('metadata')
      .limit(1);
    
    if (analyticsError) {
      console.error('❌ Error accessing analytics_events table:', analyticsError.message);
      return false;
    }
    
    console.log('✅ Analytics events table has metadata column');
    
    return true;
    
  } catch (error) {
    console.error('❌ Error in database schema test:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Starting Analytics Tracking Verification...\n');
  
  const tests = [
    {
      name: 'Database Schema',
      fn: testDatabaseSchema
    },
    {
      name: 'Guest ID Generation',
      fn: testGuestIdGeneration
    },
    {
      name: 'User Creation with Guest ID',
      fn: testUserCreationWithGuestId
    },
    {
      name: 'Analytics Event Tracking',
      fn: testAnalyticsEventTracking
    }
  ];
  
  let passedTests = 0;
  let totalTests = tests.length;
  
  for (const test of tests) {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`Running Test: ${test.name}`);
    console.log(`${'='.repeat(50)}`);
    
    try {
      const result = await test.fn();
      if (result) {
        console.log(`\n✅ ${test.name} PASSED`);
        passedTests++;
      } else {
        console.log(`\n❌ ${test.name} FAILED`);
      }
    } catch (error) {
      console.log(`\n❌ ${test.name} FAILED with error: ${error.message}`);
    }
  }
  
  console.log(`\n${'='.repeat(50)}`);
  console.log('📊 TEST RESULTS SUMMARY');
  console.log(`${'='.repeat(50)}`);
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${totalTests - passedTests}`);
  console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 All tests passed! Analytics tracking is working correctly.');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some tests failed. Please check the implementation.');
    process.exit(1);
  }
}

// Run the verification if this script is executed directly
if (require.main === module) {
  runAllTests().catch(error => {
    console.error('Unhandled error during verification:', error);
    process.exit(1);
  });
}

module.exports = {
  testGuestIdGeneration,
  testUserCreationWithGuestId,
  testAnalyticsEventTracking,
  testDatabaseSchema,
  runAllTests
};