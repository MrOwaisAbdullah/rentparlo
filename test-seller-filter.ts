import { searchListings, searchListingsCount } from './lib/sanity-queries.ts';

// Test the seller filter
async function testSellerFilter() {
  console.log('Testing seller filter...');
  
  // First, let's get all listings to see what data we have
  try {
    console.log('Fetching all listings...');
    const allListings = await searchListings({});
    console.log(`Found ${allListings.length} total listings`);
    
    if (allListings.length > 0) {
      console.log('First listing:', {
        _id: allListings[0]._id,
        title: allListings[0].title,
        supabaseId: allListings[0].supabaseId
      });
      
      // Use the supabaseId from the first listing to test the seller filter
      const testSellerId = allListings[0].supabaseId;
      console.log(`Testing with seller ID: ${testSellerId}`);
      
      // Test search listings with seller filter
      const listings = await searchListings({
        sellerId: testSellerId
      });
      
      console.log(`Found ${listings.length} listings for seller ${testSellerId}`);
      
      // Test count with seller filter
      const count = await searchListingsCount({
        sellerId: testSellerId
      });
      
      console.log(`Total count for seller ${testSellerId}: ${count}`);
      
      // Also test with an empty sellerId to make sure the query works
      const emptyListings = await searchListings({
        sellerId: ""
      });
      
      console.log(`Found ${emptyListings.length} listings with empty sellerId`);
    } else {
      console.log('No listings found in the database');
    }
    
    console.log('Seller filter test completed!');
  } catch (error) {
    console.error('Error testing seller filter:', error);
  }
}

testSellerFilter();