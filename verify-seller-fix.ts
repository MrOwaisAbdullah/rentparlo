import { getSellerByUsername } from './lib/data-integration';

async function verifySellerFix() {
  console.log('Testing seller profile fix...');
  
  try {
    // Test with the username that should exist based on our seed data
    const seller = await getSellerByUsername('ali_luxury_cars');
    
    if (seller) {
      console.log('Seller data retrieved successfully');
      console.log('Seller ID:', seller.id);
      console.log('Seller username:', seller.profile?.username);
      console.log('Seller tier:', seller.profile?.tier);
      console.log('Seller verification status:', seller.profile?.verification_status);
      console.log('Seller business name:', seller.profile?.business_name);
      console.log('Seller is verified:', seller.is_verified);
      
      // Check if the structure is correct
      if (seller.profile) {
        console.log('✓ Seller has profile property');
      } else {
        console.log('✗ Seller missing profile property');
      }
    } else {
      console.log('No seller found with username: ali_luxury_cars');
      
      // Try another known seller
      const seller2 = await getSellerByUsername('ahmed_photography');
      if (seller2) {
        console.log('Alternative seller data retrieved successfully');
        console.log('Seller ID:', seller2.id);
        console.log('Seller username:', seller2.profile?.username);
        console.log('Seller tier:', seller2.profile?.tier);
      } else {
        console.log('No seller found with username: ahmed_photography');
      }
    }
    
    console.log('Test completed successfully');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

verifySellerFix();