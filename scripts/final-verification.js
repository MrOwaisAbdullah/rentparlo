import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

// Supabase client with service role key for admin access
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Service role key needed for auth admin operations
)

async function finalVerification() {
  console.log('🔍 Final verification of seeded data with new columns...')
  
  try {
    // Check all seller profiles have the new columns
    const { data: profiles, error } = await supabase
      .from('seller_profiles')
      .select('id, username, business_type, country')
    
    if (error) {
      console.error('❌ Error fetching seller profiles:', error.message)
      return
    }
    
    console.log(`✅ Found ${profiles.length} seller profiles`)
    
    // Verify each profile has values for the new columns
    let allValid = true
    profiles.forEach(profile => {
      if (!profile.country || !profile.business_type) {
        console.log(`❌ Profile ${profile.username} missing data: country="${profile.country}", business_type="${profile.business_type}"`)
        allValid = false
      }
    })
    
    if (allValid) {
      console.log('✅ All seller profiles have proper values for country and business_type columns')
      
      // Show sample data
      console.log('\n📋 Sample profiles:')
      profiles.slice(0, 3).forEach(profile => {
        console.log(`  ${profile.username}: ${profile.business_type} in ${profile.country}`)
      })
    } else {
      console.log('❌ Some profiles are missing data for the new columns')
    }
    
    // Verify specific expected values
    console.log('\n🔍 Verifying specific expected values...')
    const expectedProfiles = [
      { username: 'ahmed_photography', business_type: 'Photography Services', country: 'Pakistan' },
      { username: 'sara_electronics', business_type: 'Electronics Retail', country: 'Pakistan' },
      { username: 'ali_luxury_cars', business_type: 'Car Rental Services', country: 'Pakistan' }
    ]
    
    for (const expected of expectedProfiles) {
      const profile = profiles.find(p => p.username === expected.username)
      if (profile && profile.business_type === expected.business_type && profile.country === expected.country) {
        console.log(`✅ ${expected.username}: Correct values`)
      } else {
        console.log(`❌ ${expected.username}: Expected business_type="${expected.business_type}", country="${expected.country}" but got business_type="${profile?.business_type}", country="${profile?.country}"`)
      }
    }
    
    console.log('\n🎉 Final verification complete!')
    
  } catch (error) {
    console.error('❌ Error during final verification:', error.message)
  }
}

finalVerification()