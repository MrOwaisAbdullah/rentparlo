import { client } from './lib/sanity';

async function testAllListings() {
  try {
    // Get all active listings with their categories and sellers
    const query = `*[_type == "listing" && status == "active" && published == true] {
      _id,
      title,
      supabaseId,
      category->{
        title,
        slug
      }
    } | order(_createdAt desc)`;
    
    const listings = await client.fetch(query);
    
    console.log(`Found ${listings.length} total active listings`);
    
    // Group by category
    const categories: Record<string, any[]> = {};
    listings.forEach((listing: any) => {
      const categorySlug = listing.category?.slug?.current || listing.category?.slug || 'uncategorized';
      if (!categories[categorySlug]) {
        categories[categorySlug] = [];
      }
      categories[categorySlug].push(listing);
    });
    
    console.log('\nListings by category:');
    Object.entries(categories).forEach(([categorySlug, categoryListings]) => {
      console.log(`\n${categorySlug}: ${categoryListings.length} listings`);
      
      // Group by seller within this category
      const sellers: Record<string, any[]> = {};
      categoryListings.forEach(listing => {
        const sellerId = listing.supabaseId || 'unknown';
        if (!sellers[sellerId]) {
          sellers[sellerId] = [];
        }
        sellers[sellerId].push(listing);
      });
      
      console.log(`  Sellers in this category:`);
      Object.entries(sellers).forEach(([sellerId, sellerListings]) => {
        console.log(`    Seller ${sellerId}: ${sellerListings.length} listings`);
        sellerListings.slice(0, 1).forEach(listing => {
          console.log(`      - ${listing.title}`);
        });
        if (sellerListings.length > 1) {
          console.log(`      ... and ${sellerListings.length - 1} more`);
        }
      });
    });
    
  } catch (error) {
    console.error('Error testing all listings:', error);
  }
}

testAllListings();