import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

// Supabase client with service role key for admin access
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Service role key needed for auth admin operations
)

async function checkSeededData() {
  console.log('Checking seeded data...')
  
  try {
    // Check if seller profiles exist with the new columns
    console.log('Checking seller profiles...')
    const { data: profiles, error } = await supabase
      .from('seller_profiles')
      .select('id, username, business_type, country')
      .limit(5)
    
    if (error) {
      console.error('❌ Error fetching seller profiles:', error.message)
      return
    }
    
    console.log(`✅ Found ${profiles.length} seller profiles`)
    
    // Display the profiles to verify the new columns
    profiles.forEach(profile => {
      console.log(`- ${profile.username}: business_type="${profile.business_type}", country="${profile.country}"`)
    })
    
    // Check a specific profile
    console.log('\nChecking specific profile...')
    const { data: specificProfile, error: specificError } = await supabase
      .from('seller_profiles')
      .select('*')
      .eq('username', 'ahmed_photography')
      .single()
    
    if (specificError) {
      console.error('❌ Error fetching specific profile:', specificError.message)
      return
    }
    
    console.log(`✅ Profile found for ahmed_photography`)
    console.log(`  Business Type: ${specificProfile.business_type}`)
    console.log(`  Country: ${specificProfile.country}`)
    
  } catch (error) {
    console.error('❌ Error checking seeded data:', error.message)
  }
}

checkSeededData()