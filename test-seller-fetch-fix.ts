import { getHomepageListings } from './lib/fetch/listings';

async function testSellerFetch() {
  console.log('Testing seller fetch functionality...');
  
  try {
    const listings = await getHomepageListings();
    console.log(`Successfully fetched ${listings.length} listings`);
    
    // Log first few listings to verify seller info is attached
    listings.slice(0, 3).forEach((listing: any) => {
      console.log(`Listing: ${listing.title}`);
      console.log(`Seller: ${listing.seller?.profile?.username || 'No seller info'}`);
    });
    
    console.log('Test completed successfully');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testSellerFetch();