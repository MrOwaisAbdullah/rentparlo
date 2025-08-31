// Direct Supabase test without Next.js imports
import { createClient } from '@supabase/supabase-js';

async function testSellerProfile() {
  console.log('Testing direct Supabase client...');
  
  try {
    // Create a direct Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    // Try to fetch the seller profile directly from the database
    console.log('Fetching seller profile for user ID: 44444444-4444-4444-4444-444444444444');
    
    const { data, error } = await supabase
      .from('seller_profiles')
      .select('*')
      .eq('id', '44444444-4444-4444-4444-444444444444')
      .single();
    
    if (error) {
      console.error('Error fetching seller profile:', error);
    } else {
      console.log('Seller profile data:', data);
    }
    
    // Also try by username
    console.log('\nFetching seller profile by username: ali_luxury_cars');
    
    const { data: dataByUsername, error: errorByUsername } = await supabase
      .from('seller_profiles')
      .select('*')
      .eq('username', 'ali_luxury_cars')
      .single();
    
    if (errorByUsername) {
      console.error('Error fetching seller profile by username:', errorByUsername);
    } else {
      console.log('Seller profile data by username:', dataByUsername);
    }
    
    // Check if the user exists in the users table
    console.log('\nChecking if user exists in users table');
    
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', '44444444-4444-4444-4444-444444444444')
      .single();
    
    if (userError) {
      console.error('Error fetching user data:', userError);
    } else {
      console.log('User data:', userData);
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

testSellerProfile();