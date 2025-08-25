import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

// Supabase client with service role key for admin access
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Service role key needed for auth admin operations
)

async function testUserCreation() {
  console.log('Testing user creation...')
  
  try {
    // Create a single test user
    const testUser = {
      id: '11111111-1111-1111-1111-111111111111',
      email: 'admin@rentparlo.pk',
      password: 'Admin123!',
      name: 'Admin User'
    }
    
    console.log(`Creating user: ${testUser.email}`)
    
    // Create user in auth.users
    const { data, error } = await supabase.auth.admin.createUser({
      id: testUser.id,
      email: testUser.email,
      password: testUser.password,
      email_confirm: true // Skip email confirmation for development
    })
    
    if (error) {
      console.error('Error creating user:', error.message)
      return
    }
    
    console.log('✅ User created successfully!')
    console.log('User data:', data)
    
    // Now try to insert into public.users
    console.log('Inserting user into public.users...')
    const { error: insertError } = await supabase
      .from('users')
      .upsert({
        id: testUser.id,
        email: testUser.email,
        name: testUser.name,
        role: 'admin',
        created_at: new Date().toISOString(),
        is_verified: true,
        city: 'Karachi',
        state: 'Sindh',
        country: 'Pakistan',
        active: true,
        email_verified: true,
        notification_preferences: {
          email: true,
          sms: true,
          push: true
        },
        preferred_language: 'en'
      }, {
        onConflict: 'id'
      })
    
    if (insertError) {
      console.error('Error inserting user into public.users:', insertError.message)
      return
    }
    
    console.log('✅ User inserted into public.users successfully!')
    
  } catch (error) {
    console.error('❌ Error testing user creation:', error.message)
  }
}

testUserCreation()