import { getSellerProfileByUsername } from './lib/supabase-queries';
import { getSellerByUsername } from './lib/data-integration';

async function checkSellerProfile() {
  console.log('Checking seller profile for user ID: 44444444-4444-4444-4444-444444444444');
  
  try {
    // First, let's try to get the seller by username
    // Based on the seed data, this should be 'ali_luxury_cars'
    const sellerByUsername = await getSellerByUsername('ali_luxury_cars');
    console.log('Seller by username result:', sellerByUsername);
    
    if (sellerByUsername) {
      console.log('Seller username:', sellerByUsername.profile.username);
      console.log('Seller tier:', sellerByUsername.profile.tier);
      console.log('Seller verification status:', sellerByUsername.profile.verification_status);
    } else {
      console.log('No seller found with username: ali_luxury_cars');
    }
    
    // Now let's try to get the seller profile directly
    const sellerProfile = await getSellerProfileByUsername('ali_luxury_cars');
    console.log('Direct seller profile result:', sellerProfile);
    
  } catch (error) {
    console.error('Error checking seller profile:', error);
  }
  
  console.log('\nChecking seller profile for user ID: 22222222-2222-2222-2222-222222222222');
  
  try {
    // Let's also check another seller that should exist
    const sellerByUsername = await getSellerByUsername('ahmed_photography');
    console.log('Seller by username result:', sellerByUsername);
    
    if (sellerByUsername) {
      console.log('Seller username:', sellerByUsername.profile.username);
      console.log('Seller tier:', sellerByUsername.profile.tier);
      console.log('Seller verification status:', sellerByUsername.profile.verification_status);
    } else {
      console.log('No seller found with username: ahmed_photography');
    }
  } catch (error) {
    console.error('Error checking seller profile:', error);
  }
}

checkSellerProfile();