// Test RLS policies
import { createClient } from './utils/supabase/server';

async function testRLSPolicies() {
  console.log('Testing RLS policies...');
  
  try {
    const supabase = await createClient();
    
    // Test public read access to seller_profiles
    console.log('Testing public read access to seller_profiles...');
    const { data: profiles, error: profilesError } = await supabase
      .from('seller_profiles')
      .select('username, id')
      .limit(5);
    
    if (profilesError) {
      console.error('RLS Error accessing seller_profiles:', profilesError);
    } else {
      console.log('Successfully accessed seller_profiles with RLS');
      console.log('Profiles found:', profiles?.length || 0);
      if (profiles && profiles.length > 0) {
        profiles.forEach(profile => {
          console.log(`- ${profile.username} (${profile.id})`);
        });
      }
    }
    
    // Test public read access to users
    console.log('Testing public read access to users...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email')
      .limit(5);
    
    if (usersError) {
      console.error('RLS Error accessing users:', usersError);
    } else {
      console.log('Successfully accessed users with RLS');
      console.log('Users found:', users?.length || 0);
      if (users && users.length > 0) {
        users.forEach(user => {
          console.log(`- ${user.email} (${user.id})`);
        });
      }
    }
    
    console.log('RLS policy test completed');
  } catch (error) {
    console.error('RLS policy test failed:', error);
  }
}

testRLSPolicies();