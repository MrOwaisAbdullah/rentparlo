import { createClient } from './utils/supabase/server';

async function testDatabaseConnection() {
  console.log('Testing database connection and RLS policies...');
  
  try {
    const supabase = await createClient();
    
    // Test 1: Check if we can access the seller_profiles table
    console.log('Test 1: Checking access to seller_profiles table...');
    const { data: profiles, error: profilesError } = await supabase
      .from('seller_profiles')
      .select('*')
      .limit(1);
    
    if (profilesError) {
      console.error('Error accessing seller_profiles:', profilesError);
    } else {
      console.log('Successfully accessed seller_profiles table');
      console.log('Number of profiles found:', profiles?.length || 0);
    }
    
    // Test 2: Check if we can access the users table
    console.log('Test 2: Checking access to users table...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (usersError) {
      console.error('Error accessing users:', usersError);
    } else {
      console.log('Successfully accessed users table');
      console.log('Number of users found:', users?.length || 0);
    }
    
    // Test 3: Try to find the specific seller profile
    console.log('Test 3: Looking for seller profile with username "seller-66666666"...');
    const { data: sellerProfile, error: sellerError } = await supabase
      .from('seller_profiles')
      .select('*')
      .eq('username', 'seller-66666666')
      .single();
    
    if (sellerError) {
      if (sellerError.code === 'PGRST116') {
        console.log('Seller profile with username "seller-66666666" not found (this is expected if it does not exist)');
      } else {
        console.error('Error finding seller profile:', sellerError);
      }
    } else {
      console.log('Found seller profile:', sellerProfile?.username);
    }
    
    console.log('Database connection test completed');
  } catch (error) {
    console.error('Database connection test failed:', error);
  }
}

testDatabaseConnection();