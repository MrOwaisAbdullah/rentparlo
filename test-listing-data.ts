// Test to check listing data and seller filtering
import { client } from './lib/sanity';

async function testListings() {
  try {
    // Get all listings with their supabaseId
    const query = `*[_type == "listing" && status == "active" && published == true] {
      _id,
      title,
      supabaseId,
      "sellerCount": count(*[_type == "listing" && supabaseId == ^.supabaseId])
    } | order(sellerCount desc)`;
    
    const listings = await client.fetch(query);
    
    console.log(`Found ${listings.length} active listings`);
    
    // Group by seller ID
    const sellerCounts = {};
    listings.forEach(listing => {
      const sellerId = listing.supabaseId || 'unknown';
      if (!sellerCounts[sellerId]) {
        sellerCounts[sellerId] = {
          count: 0,
          listings: []
        };
      }
      sellerCounts[sellerId].count++;
      sellerCounts[sellerId].listings.push({
        _id: listing._id,
        title: listing.title
      });
    });
    
    // Show sellers with the most listings
    console.log('\nTop sellers by listing count:');
    Object.entries(sellerCounts)
      .sort(([,a], [,b]) => b.count - a.count)
      .slice(0, 5)
      .forEach(([sellerId, data]) => {
        console.log(`Seller ${sellerId}: ${data.count} listings`);
      });
    
    // Test seller filter with the first seller that has listings
    const firstSellerWithListings = Object.entries(sellerCounts)
      .find(([, data]) => data.count > 0);
    
    if (firstSellerWithListings) {
      const [sellerId, data] = firstSellerWithListings;
      console.log(`\nTesting seller filter with seller ID: ${sellerId}`);
      
      // Test the actual search query
      const searchQuery = `*[_type == "listing" && status == "active" && published == true && supabaseId == $sellerId] {
        _id,
        title,
        supabaseId
      }`;
      
      const filteredListings = await client.fetch(searchQuery, { sellerId });
      console.log(`Found ${filteredListings.length} listings for seller ${sellerId}`);
      
      if (filteredListings.length > 0) {
        console.log('Sample filtered listings:');
        filteredListings.slice(0, 3).forEach(listing => {
          console.log(`  - ${listing.title} (${listing._id})`);
        });
      }
    } else {
      console.log('No sellers with listings found');
    }
    
  } catch (error) {
    console.error('Error testing listings:', error);
  }
}

testListings();