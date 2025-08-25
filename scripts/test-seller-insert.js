import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

// Supabase client with service role key for admin access
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Service role key needed for auth admin operations
)

async function testSellerInsert() {
  console.log('Testing seller profile insertion...')
  
  try {
    // Test inserting a seller profile without the new columns
    const testProfile = {
      id: '22222222-2222-2222-2222-222222222222',
      username: 'ahmed_photography_test',
      business_name: 'Ahmed Photography Studio',
      owner_name: 'Ahmed Khan',
      owner_cnic: '42101-1234567-1',
      address_line1: 'Plot 123, Block A, DHA Phase 2',
      city: 'Karachi',
      state: 'Sindh',
      phone: '+923001234568',
      email: 'ahmed@photography.com',
      is_verified: true,
      is_top_seller: true,
      tier: 'gold',
      tier_points: 1250,
      verification_status: 'approved'
    }
    
    console.log('Inserting test seller profile...')
    const { error } = await supabase
      .from('seller_profiles')
      .upsert(testProfile, {
        onConflict: 'id'
      })
    
    if (error) {
      console.error('❌ Error inserting test profile:', error.message)
      return
    }
    
    console.log('✅ Test profile inserted successfully')
    
    // Now try to insert with the new columns to see what happens
    const testProfileWithNewColumns = {
      id: '33333333-3333-3333-3333-333333333333',
      username: 'sara_electronics_test',
      business_name: 'Sara Electronics Store',
      owner_name: 'Sara Ahmed',
      owner_cnic: '35202-2345678-2',
      address_line1: 'Shop 45, Main Market, Gulberg',
      city: 'Lahore',
      state: 'Punjab',
      country: 'Pakistan',
      phone: '+923001234569',
      email: 'sara@electronics.com',
      is_verified: true,
      is_top_seller: false,
      tier: 'silver',
      tier_points: 850,
      verification_status: 'approved',
      business_type: 'Electronics Retail'
    }
    
    console.log('Inserting test seller profile with new columns...')
    const { error: error2 } = await supabase
      .from('seller_profiles')
      .upsert(testProfileWithNewColumns, {
        onConflict: 'id'
      })
    
    if (error2) {
      console.error('❌ Error inserting test profile with new columns:', error2.message)
    } else {
      console.log('✅ Test profile with new columns inserted successfully')
    }
    
  } catch (error) {
    console.error('❌ Error testing seller insertion:', error.message)
  }
}

testSellerInsert()