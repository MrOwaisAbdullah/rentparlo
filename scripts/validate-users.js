/**
 * =====================================================
 * RentParlo.pk User Validation Script
 * =====================================================
 * This script checks if the required users exist in auth.users
 * before running the seeding scripts.
 * 
 * Run this using: node scripts/validate-users.js
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

// Supabase client with service role key for admin access
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Service role key needed for auth admin operations
)

// Required user IDs
const REQUIRED_USER_IDS = [
  '11111111-1111-1111-1111-111111111111', // Admin User
  '22222222-2222-2222-2222-222222222222', // Ahmed Photography
  '33333333-3333-3333-3333-333333333333', // Sara Electronics  
  '44444444-4444-4444-4444-444444444444', // Ali Cars
  '55555555-5555-5555-5555-555555555555', // Fatima Medical
  '66666666-6666-6666-6666-666666666666', // Hassan Tools
  '77777777-7777-7777-7777-777777777777', // Muhammad Raza
  '88888888-8888-8888-8888-888888888888', // Ayesha Khan
  '99999999-9999-9999-9999-999999999999'  // Omar Sheikh
]

async function validateUsers() {
  console.log('🔍 Validating required users in auth.users...\n')
  
  let allUsersExist = true
  
  for (const userId of REQUIRED_USER_IDS) {
    try {
      const { data: user, error } = await supabase.auth.admin.getUserById(userId)
      
      if (error) {
        console.log(`❌ User ${userId} not found: ${error.message}`)
        allUsersExist = false
        continue
      }
      
      if (user?.user) {
        console.log(`✅ User ${userId} exists: ${user.user.email}`)
      } else {
        console.log(`❌ User ${userId} not found`)
        allUsersExist = false
      }
    } catch (error) {
      console.log(`❌ Error checking user ${userId}: ${error.message}`)
      allUsersExist = false
    }
  }
  
  console.log('\n' + '='.repeat(50))
  
  if (allUsersExist) {
    console.log('🎉 All required users exist in auth.users')
    console.log('✅ You can now run the seeding scripts')
  } else {
    console.log('⚠️  Some required users are missing from auth.users')
    console.log('💡 Run the fixed seeding script to create them:')
    console.log('   node scripts/supabase-seed-fixed.js')
  }
  
  console.log('='.repeat(50))
}

// Run the validation
validateUsers()

export { validateUsers }