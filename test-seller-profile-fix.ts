import { getSellerByUsername } from './lib/data-integration';

async function testSellerProfileFix() {
  console.log('Testing seller profile fix');
  
  try {
    // Test with a specific username (replace with an actual username from your database)
    const seller = await getSellerByUsername('test-username');
    
    if (seller) {
      console.log('Seller data retrieved successfully');
      console.log('Seller username:', seller.profile.username);
      console.log('Seller tier:', seller.profile.tier);
      console.log('Seller verification status:', seller.profile.verification_status);
    } else {
      console.log('No seller found with the provided username');
    }
    
    console.log('Test completed successfully');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testSellerProfileFix();