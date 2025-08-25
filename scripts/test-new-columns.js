import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

// Supabase client with service role key for admin access
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Service role key needed for auth admin operations
)

async function testNewColumns() {
  console.log('Testing new schema columns...')
  
  try {
    // Test inserting a seller profile with the new columns
    const testProfile = {
      id: '77777777-7777-7777-7777-777777777777',
      username: 'test_seller_with_new_columns',
      business_name: 'Test Business',
      owner_name: 'Test Owner',
      owner_cnic: '12345-6789012-3',
      address_line1: 'Test Address',
      city: 'Test City',
      state: 'Test State',
      country: 'Test Country',
      phone: '+923000000000',
      email: 'test@example.com',
      is_verified: true,
      is_top_seller: false,
      tier: 'basic',
      tier_points: 0,
      verification_status: 'pending',
      business_type: 'Test Business Type'
    }
    
    console.log('Inserting test seller profile with new columns...')
    const { error } = await supabase
      .from('seller_profiles')
      .upsert(testProfile, {
        onConflict: 'id'
      })
    
    if (error) {
      console.error('❌ Error inserting test profile with new columns:', error.message)
      return
    }
    
    console.log('✅ Test profile with new columns inserted successfully')
    
    // Now retrieve the data to verify it was stored correctly
    console.log('Retrieving test seller profile...')
    const { data, error: fetchError } = await supabase
      .from('seller_profiles')
      .select('*')
      .eq('id', '77777777-7777-7777-7777-777777777777')
      .single()
    
    if (fetchError) {
      console.error('❌ Error retrieving test profile:', fetchError.message)
      return
    }
    
    console.log('✅ Test profile retrieved successfully')
    console.log('Country:', data.country)
    console.log('Business Type:', data.business_type)
    
    // Clean up the test data
    console.log('Cleaning up test data...')
    const { error: deleteError } = await supabase
      .from('seller_profiles')
      .delete()
      .eq('id', '77777777-7777-7777-7777-777777777777')
    
    if (deleteError) {
      console.error('❌ Error cleaning up test data:', deleteError.message)
    } else {
      console.log('✅ Test data cleaned up successfully')
    }
    
  } catch (error) {
    console.error('❌ Error testing new columns:', error.message)
  }
}

testNewColumns()