import { getEnhancedListingBySlug } from './lib/data-integration';

async function testSellerFix() {
  console.log('Testing seller data fix for listing with seller ID: 22222222-2222-2222-2222-222222222222');
  
  try {
    // Test with a specific listing slug that has the issue
    // Replace 'camera-item-1' with the actual slug from your database
    const listing = await getEnhancedListingBySlug('camera-item-1');
    
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

testSellerFix();