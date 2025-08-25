/**
 * =====================================================
 * RentParlo.pk Complete Reset Script
 * =====================================================
 * This script completely resets both Supabase and Sanity data
 * and prepares for fresh seeding.
 * 
 * Run this using: node scripts/reset-all.js
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { execSync } from 'child_process'

// Load environment variables
config({ path: '.env.local' })

// Supabase client with service role key for admin access
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Service role key needed for auth admin operations
)

async function resetSupabase() {
  console.log('🗑️  Resetting Supabase data...')
  
  try {
    // Delete all data from tables in reverse order of dependencies
    const tables = [
      'seller_tier_history',
      'user_subscriptions',
      'support_tickets',
      'analytics_events',
      'auth_logs',
      'affiliate_referrals',
      'affiliate_codes',
      'affiliate_programs',
      'seller_profiles',
      'users',
      'subscription_packages',
      'cities',
      'event_sessions',
      'user_guest_tracking'
    ]
    
    for (const table of tables) {
      try {
        const { error } = await supabase
          .from(table)
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all records
        
        if (error) {
          console.log(`⚠️  Warning deleting from ${table}: ${error.message}`)
        } else {
          console.log(`✅ Cleared table: ${table}`)
        }
      } catch (error) {
        console.log(`⚠️  Error with table ${table}: ${error.message}`)
      }
    }
    
    console.log('✅ Supabase data reset complete')
  } catch (error) {
    console.error('❌ Error resetting Supabase:', error.message)
  }
}

async function resetSanity() {
  console.log('🗑️  Resetting Sanity data...')
  
  try {
    // Run the Sanity cleanup script
    execSync('npx sanity exec scripts/sanity-cleanup.js --with-user-token', { 
      stdio: 'inherit',
      cwd: process.cwd()
    })
    console.log('✅ Sanity data reset complete')
  } catch (error) {
    console.error('❌ Error resetting Sanity:', error.message)
  }
}

async function resetAll() {
  console.log('🔄 Starting complete reset process...\n')
  
  try {
    // Reset Supabase first
    await resetSupabase()
    
    console.log('') // Empty line for spacing
    
    // Reset Sanity
    await resetSanity()
    
    console.log('\n🎉 Complete reset finished!')
    console.log('\n💡 Next steps:')
    console.log('1. Run the fixed Supabase seeding script:')
    console.log('   node scripts/supabase-seed-fixed.js')
    console.log('2. Run the Sanity seeding script:')
    console.log('   npx sanity exec scripts/sanity-seed.js --with-user-token')
    
  } catch (error) {
    console.error('❌ Complete reset failed:', error.message)
    process.exit(1)
  }
}

// Run the reset process
if (process.argv[1] === new URL(import.meta.url).pathname) {
  resetAll()
}

export { resetAll }