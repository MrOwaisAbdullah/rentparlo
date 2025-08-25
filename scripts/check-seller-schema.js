import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

// Supabase client with service role key for admin access
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Service role key needed for auth admin operations
)

async function checkSellerSchema() {
  console.log('Checking seller_profiles table schema...')
  
  try {
    // Get table info
    const { data, error } = await supabase
      .from('seller_profiles')
      .select('*')
      .limit(1)
      
    if (error) {
      console.error('Error querying seller_profiles:', error.message)
      return
    }
    
    console.log('✅ Successfully queried seller_profiles table')
    console.log('Sample data:', data)
    
    // Let's also try to describe the table structure
    console.log('\nTrying to get table structure...')
    
    // Insert a test profile without business_type to see what works
    const testProfile = {
      id: '22222222-2222-2222-2222-222222222222',
      username: 'ahmed_photography_test',
      business_name: 'Ahmed Photography Studio',
      owner_name: 'Ahmed Khan',
      owner_cnic: '42101-1234567-1',
      address_line1: 'Plot 123, Block A, DHA Phase 2',
      city: 'Karachi',
      state: 'Sindh',
      country: 'Pakistan',
      phone: '+923001234568',
      email: 'ahmed@photography.com',
      is_verified: true,
      is_top_seller: true,
      tier: 'gold',
      tier_points: 1250,
      verification_status: 'approved'
    }
    
    console.log('Testing insert without business_type...')
    const { error: insertError } = await supabase
      .from('seller_profiles')
      .upsert(testProfile, {
        onConflict: 'id'
      })
    
    if (insertError) {
      console.error('Error inserting test profile:', insertError.message)
    } else {
      console.log('✅ Test profile inserted successfully')
    }
    
  } catch (error) {
    console.error('❌ Error checking seller schema:', error.message)
  }
}

checkSellerSchema()