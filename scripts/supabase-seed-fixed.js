/**
 * =====================================================
 * RentParlo.pk Supabase Database Seeding Script (Fixed)
 * =====================================================
 * This script properly creates users in auth.users before adding them to public.users
 * to avoid foreign key constraint violations.
 * 
 * Run this using: node scripts/supabase-seed-fixed.js
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

console.log('🔧 Loading environment variables...')

// Load environment variables
config({ path: '.env.local' })

console.log('🔧 Creating Supabase client...')

// Supabase client with service role key for admin access
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Service role key needed for auth admin operations
)

console.log('✅ Supabase client created')

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

// Create users in auth.users
async function createAuthUsers() {
  console.log('Creating users in auth.users...')
  
  for (const user of SAMPLE_USERS) {
    console.log(`🔄 Processing user: ${user.email}`)
    try {
      // Check if user already exists
      console.log(`🔍 Checking if user ${user.email} already exists...`)
      const { data: existingUser, error: fetchError } = await supabase.auth.admin.getUserById(user.id)
      
      if (existingUser?.user) {
        console.log(`⚠️  User ${user.email} already exists in auth.users`)
        continue
      }
      
      if (fetchError && fetchError.message !== 'User not found') {
        console.error(`❌ Error checking user ${user.email}:`, fetchError.message)
        continue
      }
      
      // Create user in auth.users
      console.log(`➕ Creating user in auth.users: ${user.email}`)
      const { data, error } = await supabase.auth.admin.createUser({
        id: user.id,
        email: user.email,
        password: user.password,
        email_confirm: true // Skip email confirmation for development
      })
      
      if (error) {
        console.error(`❌ Error creating user ${user.email}:`, error.message)
        continue
      }
      
      console.log(`✅ Created user in auth.users: ${user.email}`)
    } catch (error) {
      console.error(`❌ Error creating user ${user.email}:`, error.message)
    }
  }
}

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

// Insert subscription packages
async function insertSubscriptionPackages() {
  console.log('Inserting subscription packages...')
  
  const packages = [
    {
      name: 'Basic',
      price: 0,
      currency: 'PKR',
      max_listings: 3,
      max_featured_listings: 0,
      analytics_days: 30,
      features: {
        location_boost: false,
        priority_support: false,
        advanced_analytics: false,
        featured_listing: false,
        listing_priority: 1
      },
      billing_cycle: 'monthly',
      is_active: true,
      display_order: 1
    },
    {
      name: 'Pro',
      price: 799,
      currency: 'PKR',
      max_listings: 10,
      max_featured_listings: 2,
      analytics_days: 90,
      features: {
        location_boost: true,
        priority_support: false,
        advanced_analytics: true,
        featured_listing: true,
        listing_priority: 2
      },
      billing_cycle: 'monthly',
      is_active: true,
      display_order: 2
    },
    {
      name: 'Premium',
      price: 1799,
      currency: 'PKR',
      max_listings: 20,
      max_featured_listings: 5,
      analytics_days: 180,
      features: {
        location_boost: true,
        priority_support: true,
        advanced_analytics: true,
        featured_listing: true,
        listing_priority: 3
      },
      billing_cycle: 'monthly',
      is_active: true,
      display_order: 3
    },
    {
      name: 'Business',
      price: 2799,
      currency: 'PKR',
      max_listings: 60,
      max_featured_listings: 10,
      analytics_days: 365,
      features: {
        location_boost: true,
        priority_support: true,
        advanced_analytics: true,
        featured_listing: true,
        listing_priority: 4
      },
      billing_cycle: 'monthly',
      is_active: true,
      display_order: 4
    }
  ]
  
  for (const pkg of packages) {
    console.log(`🔄 Processing subscription package: ${pkg.name}`)
    try {
      const { error } = await supabase
        .from('subscription_packages')
        .upsert(pkg, {
          onConflict: 'name'
        })
      
      if (error) {
        console.error(`❌ Error inserting subscription package ${pkg.name}:`, error.message)
        continue
      }
      
      console.log(`✅ Inserted subscription package: ${pkg.name}`)
    } catch (error) {
      console.error(`❌ Error inserting subscription package ${pkg.name}:`, error.message)
    }
  }
}

// Insert user subscriptions
async function insertUserSubscriptions() {
  console.log('Inserting user subscriptions...')
  
  // First get package IDs
  console.log('🔍 Fetching subscription packages...')
  const { data: packages, error: packageError } = await supabase
    .from('subscription_packages')
    .select('id, name')
  
  if (packageError) {
    console.error('❌ Error fetching subscription packages:', packageError.message)
    return
  }
  
  const packageMap = {}
  packages.forEach(pkg => {
    packageMap[pkg.name] = pkg.id
  })
  
  const subscriptions = [
    // Ahmed Photography - Pro subscription
    {
      user_id: '22222222-2222-2222-2222-222222222222',
      package_id: packageMap['Pro'],
      start_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      end_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active'
    },
    // Ali Cars - Premium subscription  
    {
      user_id: '44444444-4444-4444-4444-444444444444',
      package_id: packageMap['Premium'],
      start_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      end_date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active'
    },
    // Sara Electronics - Basic subscription
    {
      user_id: '33333333-3333-3333-3333-333333333333',
      package_id: packageMap['Basic'],
      start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      end_date: new Date(Date.now() + 330 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active'
    }
  ]
  
  for (const subscription of subscriptions) {
    console.log(`🔄 Processing user subscription for user: ${subscription.user_id}`)
    try {
      const { error } = await supabase
        .from('user_subscriptions')
        .upsert(subscription, {
          onConflict: 'user_id, package_id'
        })
      
      if (error) {
        console.error(`❌ Error inserting user subscription:`, error.message)
        continue
      }
      
      console.log(`✅ Inserted user subscription`)
    } catch (error) {
      console.error(`❌ Error inserting user subscription:`, error.message)
    }
  }
}

// Insert sample analytics events
async function insertAnalyticsEvents() {
  console.log('Inserting sample analytics events...')
  
  const events = [
    // Camera listings analytics
    {
      listing_id: '1',
      event_type: 'view',
      user_id: '77777777-7777-7777-7777-777777777777',
      ip_address: '192.168.1.100',
      city: 'Karachi',
      device_type: 'mobile',
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    },
    {
      listing_id: '1',
      event_type: 'contact_click',
      user_id: '77777777-7777-7777-7777-777777777777',
      ip_address: '192.168.1.100',
      city: 'Karachi',
      device_type: 'mobile',
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    },
    {
      listing_id: '1',
      event_type: 'view',
      user_id: '88888888-8888-8888-8888-888888888888',
      ip_address: '192.168.1.101',
      city: 'Lahore',
      device_type: 'desktop',
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      listing_id: '1',
      event_type: 'WhatsApp_click',
      user_id: '88888888-8888-8888-8888-888888888888',
      ip_address: '192.168.1.101',
      city: 'Lahore',
      device_type: 'desktop',
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    // Car rental analytics
    {
      listing_id: '3',
      event_type: 'view',
      user_id: '99999999-9999-9999-9999-999999999999',
      ip_address: '192.168.1.102',
      city: 'Islamabad',
      device_type: 'tablet',
      created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
    },
    {
      listing_id: '3',
      event_type: 'contact_click',
      user_id: '99999999-9999-9999-9999-999999999999',
      ip_address: '192.168.1.102',
      city: 'Islamabad',
      device_type: 'tablet',
      created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
    },
    // Medical equipment analytics
    {
      listing_id: '5',
      event_type: 'view',
      user_id: '77777777-7777-7777-7777-777777777777',
      ip_address: '192.168.1.100',
      city: 'Karachi',
      device_type: 'mobile',
      created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
    }
  ]
  
  for (const event of events) {
    console.log(`🔄 Processing analytics event for listing: ${event.listing_id}`)
    try {
      const { error } = await supabase
        .from('analytics_events')
        .insert(event)
      
      if (error) {
        console.error(`❌ Error inserting analytics event:`, error.message)
        continue
      }
      
      console.log(`✅ Inserted analytics event`)
    } catch (error) {
      console.error(`❌ Error inserting analytics event:`, error.message)
    }
  }
}

// Insert support tickets
async function insertSupportTickets() {
  console.log('Inserting support tickets...')
  
  const tickets = [
    {
      user_id: '77777777-7777-7777-7777-777777777777',
      subject: 'Account Verification Issue',
      message: 'I am having trouble verifying my seller account. Please help.',
      category: 'verification',
      priority: 'medium',
      status: 'open',
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      user_id: '33333333-3333-3333-3333-333333333333',
      subject: 'Listing Not Appearing in Search',
      message: 'My electronics listings are not showing up in search results.',
      category: 'listing',
      priority: 'high',
      status: 'in_progress',
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
    },
    {
      user_id: '44444444-4444-4444-4444-444444444444',
      subject: 'Payment Processing Problem',
      message: 'Having issues with subscription payment processing.',
      category: 'billing',
      priority: 'urgent',
      status: 'resolved',
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      user_id: '88888888-8888-8888-8888-888888888888',
      subject: 'Website Loading Slowly',
      message: 'The website is loading very slowly on my mobile device.',
      category: 'technical',
      priority: 'low',
      status: 'closed',
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    }
  ]
  
  for (const ticket of tickets) {
    console.log(`🔄 Processing support ticket for user: ${ticket.user_id}`)
    try {
      const { error } = await supabase
        .from('support_tickets')
        .insert(ticket)
      
      if (error) {
        console.error(`❌ Error inserting support ticket:`, error.message)
        continue
      }
      
      console.log(`✅ Inserted support ticket`)
    } catch (error) {
      console.error(`❌ Error inserting support ticket:`, error.message)
    }
  }
}

// Update seller tier points
async function updateSellerTiers() {
  console.log('Updating seller tier points...')
  
  const tierUpdates = [
    {
      id: '22222222-2222-2222-2222-222222222222',
      tier_points: 1250,
      tier: 'gold'
    },
    {
      id: '44444444-4444-4444-4444-444444444444',
      tier_points: 2100,
      tier: 'platinum'
    },
    {
      id: '33333333-3333-3333-3333-333333333333',
      tier_points: 850,
      tier: 'silver'
    }
  ]
  
  for (const update of tierUpdates) {
    console.log(`🔄 Processing seller tier update for user: ${update.id}`)
    try {
      const { error } = await supabase
        .from('seller_profiles')
        .update({
          tier_points: update.tier_points,
          tier: update.tier,
          tier_last_updated: new Date().toISOString()
        })
        .eq('id', update.id)
      
      if (error) {
        console.error(`❌ Error updating seller tier for ${update.id}:`, error.message)
        continue
      }
      
      console.log(`✅ Updated seller tier: ${update.id}`)
    } catch (error) {
      console.error(`❌ Error updating seller tier for ${update.id}:`, error.message)
    }
  }
}

// Insert seller tier history
async function insertSellerTierHistory() {
  console.log('Inserting seller tier history...')
  
  const history = [
    {
      seller_id: '22222222-2222-2222-2222-222222222222',
      old_tier: 'silver',
      new_tier: 'gold',
      points_change: 200,
      reason: 'Increased customer engagement and positive reviews',
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      seller_id: '44444444-4444-4444-4444-444444444444',
      old_tier: 'gold',
      new_tier: 'platinum',
      points_change: 350,
      reason: 'Premium subscription and high performance metrics',
      created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      seller_id: '33333333-3333-3333-3333-333333333333',
      old_tier: 'bronze',
      new_tier: 'silver',
      points_change: 150,
      reason: 'Consistent listing activity and customer satisfaction',
      created_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString()
    }
  ]
  
  for (const record of history) {
    console.log(`🔄 Processing seller tier history for seller: ${record.seller_id}`)
    try {
      const { error } = await supabase
        .from('seller_tier_history')
        .insert(record)
      
      if (error) {
        console.error(`❌ Error inserting seller tier history:`, error.message)
        continue
      }
      
      console.log(`✅ Inserted seller tier history`)
    } catch (error) {
      console.error(`❌ Error inserting seller tier history:`, error.message)
    }
  }
}

// Main seeding function
async function seedDatabase() {
  console.log('🌱 Starting Supabase database seeding process...\n')
  
  try {
    // Create users in auth.users first
    console.log(' Phase 1: Creating users in auth.users')
    await createAuthUsers()
    
    // Wait a bit for auth.users to be fully created
    console.log('⏳ Waiting for auth.users to be fully created...')
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Insert users into public.users
    console.log('\n Phase 2: Inserting users into public.users')
    await insertPublicUsers()
    
    // Insert seller profiles
    console.log('\n Phase 3: Inserting seller profiles')
    await insertSellerProfiles()
    
    // Insert subscription packages
    console.log('\n Phase 4: Inserting subscription packages')
    await insertSubscriptionPackages()
    
    // Insert user subscriptions
    console.log('\n Phase 5: Inserting user subscriptions')
    await insertUserSubscriptions()
    
    // Insert analytics events
    console.log('\n Phase 6: Inserting analytics events')
    await insertAnalyticsEvents()
    
    // Insert support tickets
    console.log('\n Phase 7: Inserting support tickets')
    await insertSupportTickets()
    
    // Update seller tiers
    console.log('\n Phase 8: Updating seller tiers')
    await updateSellerTiers()
    
    // Insert seller tier history
    console.log('\n Phase 9: Inserting seller tier history')
    await insertSellerTierHistory()
    
    console.log('\n🎉 Supabase database seeding completed successfully!')
    
    // Verify data insertion
    console.log('\n📊 Verification:')
    const { count: userCount } = await supabase.from('users').select('*', { count: 'exact' })
    const { count: sellerCount } = await supabase.from('seller_profiles').select('*', { count: 'exact' })
    const { count: packageCount } = await supabase.from('subscription_packages').select('*', { count: 'exact' })
    const { count: subscriptionCount } = await supabase.from('user_subscriptions').select('*', { count: 'exact' })
    const { count: analyticsCount } = await supabase.from('analytics_events').select('*', { count: 'exact' })
    const { count: ticketCount } = await supabase.from('support_tickets').select('*', { count: 'exact' })
    
    console.log(`- Users: ${userCount || 0}`)
    console.log(`- Seller Profiles: ${sellerCount || 0}`)
    console.log(`- Subscription Packages: ${packageCount || 0}`)
    console.log(`- User Subscriptions: ${subscriptionCount || 0}`)
    console.log(`- Analytics Events: ${analyticsCount || 0}`)
    console.log(`- Support Tickets: ${ticketCount || 0}`)
    
  } catch (error) {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  }
}

// Run the seeding process
if (process.argv[1] === new URL(import.meta.url).pathname) {
  seedDatabase()
}

export { seedDatabase }