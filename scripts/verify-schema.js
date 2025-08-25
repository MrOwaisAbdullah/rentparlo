import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

// Supabase client with service role key for admin access
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Service role key needed for auth admin operations
)

async function verifySchema() {
  console.log('Verifying seller_profiles table schema...')
  
  try {
    // Try to insert a minimal record to test the schema
    const testRecord = {
      id: '88888888-8888-8888-8888-888888888888',
      username: 'schema_test',
      business_type: 'Test Type',
      country: 'Test Country'
    }
    
    console.log('Testing insert with new columns...')
    const { error } = await supabase
      .from('seller_profiles')
      .upsert(testRecord, {
        onConflict: 'id'
      })
    
    if (error) {
      console.error('❌ Schema verification failed:', error.message)
      return
    }
    
    console.log('✅ Schema verification successful - new columns exist')
    
    // Clean up test record
    await supabase
      .from('seller_profiles')
      .delete()
      .eq('id', '88888888-8888-8888-8888-888888888888')
    
    console.log('✅ Test record cleaned up')
    
  } catch (error) {
    console.error('❌ Error during schema verification:', error.message)
  }
}

verifySchema()