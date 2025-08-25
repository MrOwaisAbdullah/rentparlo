import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

// Supabase client with service role key for admin access
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Service role key needed for auth admin operations
)

async function testConnection() {
  console.log('Testing Supabase connection...')
  
  try {
    // Test a simple query
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .limit(1)
      
    if (error) {
      console.error('Error querying users table:', error.message)
      return
    }
    
    console.log('✅ Supabase connection successful!')
    console.log('Sample user IDs:', data)
  } catch (error) {
    console.error('❌ Error testing Supabase connection:', error.message)
  }
}

testConnection()