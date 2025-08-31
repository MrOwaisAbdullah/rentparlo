const { getSellerByUsername } = require('./lib/data-integration');

async function debugSellerFetch() {
  console.log('Debugging seller profile fetch');
  
  try {
    // Test with a specific username (replace with an actual username from your database)
    const seller = await getSellerByUsername('seller-66666666');
    
    if (seller) {
      console.log('Seller data retrieved successfully');
      console.log('Seller ID:', seller.id);
      console.log('Seller username:', seller.profile.username);
      console.log('Seller tier:', seller.profile.tier);
      console.log('Seller verification status:', seller.profile.verification_status);
    } else {
      console.log('No seller found with the provided username');
    }
    
    console.log('Debug completed successfully');
  } catch (error) {
    console.error('Debug failed:', error);
  }
}

debugSellerFetch();