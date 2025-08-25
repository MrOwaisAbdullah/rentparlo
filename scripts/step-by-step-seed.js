import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

// Supabase client with service role key for admin access
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Service role key needed for auth admin operations
)

// Sample user data
const SAMPLE_USERS = [
  // Admin User
  {
    id: '11111111-1111-1111-1111-111111111111',
    email: 'admin@rentparlo.pk',
    password: 'Admin123!',
    name: 'Admin User',
    phone: '+923001234567',
    role: 'admin'
  },
  // Sample Sellers
  {
    id: '22222222-2222-2222-2222-222222222222',
    email: 'ahmed@photography.com',
    password: 'Seller123!',
    name: 'Ahmed Khan',
    phone: '+923001234568',
    role: 'seller'
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    email: 'sara@electronics.com',
    password: 'Seller123!',
    name: 'Sara Ahmed',
    phone: '+923001234569',
    role: 'seller'
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    email: 'ali@cars.com',
    password: 'Seller123!',
    name: 'Ali Hassan',
    phone: '+923001234570',
    role: 'seller'
  },
  {
    id: '55555555-5555-5555-5555-555555555555',
    email: 'fatima@medical.com',
    password: 'Seller123!',
    name: 'Fatima Sheikh',
    phone: '+923001234571',
    role: 'seller'
  },
  {
    id: '66666666-6666-6666-6666-666666666666',
    email: 'hassan@tools.com',
    password: 'Seller123!',
    name: 'Hassan Malik',
    phone: '+923001234572',
    role: 'seller'
  },
  // Sample Regular Users
  {
    id: '77777777-7777-7777-7777-777777777777',
    email: 'user1@example.com',
    password: 'User123!',
    name: 'Muhammad Raza',
    phone: '+923001234573',
    role: 'user'
  },
  {
    id: '88888888-8888-8888-8888-888888888888',
    email: 'user2@example.com',
    password: 'User123!',
    name: 'Ayesha Khan',
    phone: '+923001234574',
    role: 'user'
  },
  {
    id: '99999999-9999-9999-9999-999999999999',
    email: 'user3@example.com',
    password: 'User123!',
    name: 'Omar Sheikh',
    phone: '+923001234575',
    role: 'user'
  }
]

// Insert users into public.users table
async function insertPublicUsers() {
  console.log('Inserting users into public.users...')
  
  for (const user of SAMPLE_USERS) {
    console.log(`🔄 Processing user: ${user.email}`)
    try {
      const { error } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          role: user.role,
          created_at: new Date().toISOString(),
          is_verified: true,
          city: user.role === 'admin' ? 'Karachi' : 
                user.role === 'seller' ? (user.email.includes('karachi') || user.email.includes('medical') ? 'Karachi' : 
                user.email.includes('lahore') || user.email.includes('electronics') || user.email.includes('tools') ? 'Lahore' : 'Islamabad') : 
                'Karachi',
          state: user.role === 'admin' ? 'Sindh' : 
                user.role === 'seller' ? (user.email.includes('karachi') || user.email.includes('medical') ? 'Sindh' : 
                user.email.includes('lahore') || user.email.includes('electronics') || user.email.includes('tools') ? 'Punjab' : 'ICT') : 
                'Sindh',
          country: 'Pakistan',
          active: true,
          email_verified: true,
          notification_preferences: {
            email: true,
            sms: user.role !== 'seller' && !user.email.includes('user2'),
            push: !user.email.includes('ali')
          },
          preferred_language: user.email.includes('fatima') ? 'ur' : 
                            user.email.includes('user2') ? 'ur' : 'en'
        }, {
          onConflict: 'id'
        })
      
      if (error) {
        console.error(`❌ Error inserting user ${user.email} into public.users:`, error.message)
        continue
      }
      
      console.log(`✅ Inserted user into public.users: ${user.email}`)
    } catch (error) {
      console.error(`❌ Error inserting user ${user.email} into public.users:`, error.message)
    }
  }
}

// Insert seller profiles
async function insertSellerProfiles() {
  console.log('Inserting seller profiles...')
  
  const sellerProfiles = [
    {
      id: '22222222-2222-2222-2222-222222222222',
      username: 'ahmed_photography',
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
      verification_status: 'approved',
      business_type: 'Photography Services'
    },
    {
      id: '33333333-3333-3333-3333-333333333333',
      username: 'sara_electronics',
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
    },
    {
      id: '44444444-4444-4444-4444-444444444444',
      username: 'ali_luxury_cars',
      business_name: 'Ali Luxury Car Rentals',
      owner_name: 'Ali Hassan',
      owner_cnic: '37405-3456789-3',
      address_line1: 'Office 12, Blue Area',
      city: 'Islamabad',
      state: 'ICT',
      country: 'Pakistan',
      phone: '+923001234570',
      email: 'ali@cars.com',
      is_verified: true,
      is_top_seller: true,
      tier: 'platinum',
      tier_points: 2100,
      verification_status: 'approved',
      business_type: 'Car Rental Services'
    },
    {
      id: '55555555-5555-5555-5555-555555555555',
      username: 'fatima_medical',
      business_name: 'HealthFirst Medical Equipment',
      owner_name: 'Fatima Sheikh',
      owner_cnic: '42101-4567890-4',
      address_line1: 'Clinic 78, Gulshan-e-Iqbal',
      city: 'Karachi',
      state: 'Sindh',
      country: 'Pakistan',
      phone: '+923001234571',
      email: 'fatima@medical.com',
      is_verified: true,
      is_top_seller: false,
      tier: 'bronze',
      tier_points: 450,
      verification_status: 'approved',
      business_type: 'Medical Equipment'
    },
    {
      id: '66666666-6666-6666-6666-666666666666',
      username: 'hassan_tools',
      business_name: 'Hassan Construction Tools',
      owner_name: 'Hassan Malik',
      owner_cnic: '35202-5678901-5',
      address_line1: 'Warehouse 15, Industrial Area',
      city: 'Lahore',
      state: 'Punjab',
      country: 'Pakistan',
      phone: '+923001234572',
      email: 'hassan@tools.com',
      is_verified: true,
      is_top_seller: false,
      tier: 'silver',
      tier_points: 720,
      verification_status: 'approved',
      business_type: 'Construction Equipment'
    }
  ]
  
  for (const profile of sellerProfiles) {
    console.log(`🔄 Processing seller profile: ${profile.username}`)
    try {
      const { error } = await supabase
        .from('seller_profiles')
        .upsert(profile, {
          onConflict: 'id'
        })
      
      if (error) {
        console.error(`❌ Error inserting seller profile for ${profile.username}:`, error.message)
        continue
      }
      
      console.log(`✅ Inserted seller profile: ${profile.username}`)
    } catch (error) {
      console.error(`❌ Error inserting seller profile for ${profile.username}:`, error.message)
    }
  }
}

async function runStepByStep() {
  console.log('🌱 Starting step-by-step Supabase seeding...')
  
  try {
    console.log('\n--- Step 1: Inserting users into public.users ---')
    await insertPublicUsers()
    console.log('✅ Step 1 completed: Users inserted into public.users')
    
    console.log('\n--- Step 2: Inserting seller profiles ---')
    await insertSellerProfiles()
    console.log('✅ Step 2 completed: Seller profiles created')
    
    console.log('\n🎉 All steps completed successfully!')
  } catch (error) {
    console.error('❌ Error in seeding process:', error.message)
  }
}

runStepByStep()