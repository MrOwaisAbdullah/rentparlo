// Script to ensure subscription packages are properly inserted into the database
const { createClient } = require('@supabase/supabase-js');

// Replace with your Supabase URL and service role key (for admin access)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing Supabase environment variables');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// Define the subscription packages
const subscriptionPackages = [
  {
    id: '11111111-1111-1111-1111-111111111111',
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
      listing_priority: 1,
      category_priority_placement: false,
      search_top_placement: false,
      guaranteed_top_placement: false,
      custom_analytics_reports: false
    },
    billing_cycle: 'monthly',
    is_active: true,
    display_order: 1
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
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
      listing_priority: 2,
      category_priority_placement: true,
      search_top_placement: false,
      guaranteed_top_placement: false,
      custom_analytics_reports: false
    },
    billing_cycle: 'monthly',
    is_active: true,
    display_order: 2
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
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
      listing_priority: 3,
      category_priority_placement: true,
      search_top_placement: true,
      guaranteed_top_placement: true,
      custom_analytics_reports: true
    },
    billing_cycle: 'monthly',
    is_active: true,
    display_order: 3
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
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
      listing_priority: 4,
      category_priority_placement: true,
      search_top_placement: true,
      guaranteed_top_placement: true,
      custom_analytics_reports: true
    },
    billing_cycle: 'monthly',
    is_active: true,
    display_order: 4
  }
];

async function ensureSubscriptionPackages() {
  try {
    console.log('Ensuring subscription packages are properly inserted...');
    
    // Check what packages currently exist
    const { data: existingPackages, error: fetchError } = await supabase
      .from('subscription_packages')
      .select('*');

    if (fetchError) {
      console.error('Error fetching existing packages:', fetchError);
      return;
    }

    console.log(`Found ${existingPackages.length} existing packages`);

    // Insert or update each package
    for (const pkg of subscriptionPackages) {
      console.log(`Processing package: ${pkg.name}`);
      
      const { error } = await supabase
        .from('subscription_packages')
        .upsert(pkg, { onConflict: 'name' });

      if (error) {
        console.error(`Error inserting/updating package ${pkg.name}:`, error);
      } else {
        console.log(`Successfully processed package: ${pkg.name}`);
      }
    }

    // Verify the packages were inserted
    const { data: finalPackages, error: verifyError } = await supabase
      .from('subscription_packages')
      .select('*')
      .order('display_order');

    if (verifyError) {
      console.error('Error verifying packages:', verifyError);
      return;
    }

    console.log('Final packages in database:');
    finalPackages.forEach(pkg => {
      console.log(`- ${pkg.name} (${pkg.id}) - Price: ${pkg.price} ${pkg.currency}`);
    });
    
    // Test specific query for Basic package
    const { data: basicPackage, error: basicError } = await supabase
      .from('subscription_packages')
      .select('*')
      .eq('name', 'Basic')
      .eq('is_active', true)
      .single();

    if (basicError) {
      console.error('Error fetching Basic package:', basicError);
    } else {
      console.log('Basic package verified:', basicPackage);
    }
    
    console.log('Subscription packages setup completed successfully!');
    
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

ensureSubscriptionPackages();