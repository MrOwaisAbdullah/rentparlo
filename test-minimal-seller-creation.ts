import { getEnhancedListingBySlug } from './lib/data-integration';

async function testMinimalSellerCreation() {
  console.log('Testing minimal seller creation for listing with seller ID: 44444444-4444-4444-4444-444444444444');
  
  try {
    // Test with a specific listing slug that has the issue
    // Replace 'bmw-3-series-luxury-sedan-1756075631658' with the actual slug from your database
    const listing = await getEnhancedListingBySlug('bmw-3-series-luxury-sedan-1756075631658');
    
    if (listing) {
      console.log('Listing data retrieved successfully');
      console.log('Listing title:', listing.title);
      console.log('Seller info:', listing.seller ? 'Available' : 'Not available');
      
      if (listing.seller) {
        console.log('Seller ID:', listing.seller.id);
        console.log('Seller username:', listing.seller.profile?.username);
        console.log('Seller business name:', listing.seller.profile?.business_name);
        console.log('Seller tier:', listing.seller.profile?.tier);
        console.log('Seller verification status:', listing.seller.profile?.verification_status);
      }
    } else {
      console.log('No listing found with the provided slug');
    }
    
    console.log('Test completed successfully');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testMinimalSellerCreation();