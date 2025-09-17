import { client } from '@/lib/sanity';

export async function testConstructionEquipmentSellers() {
  try {
    // Get all construction equipment listings grouped by seller
    const query = `*[_type == "listing" && status == "active" && published == true && category->slug.current == "construction-equipment"] {
      _id,
      title,
      supabaseId,
      category->{
        title,
        slug
      }
    }`;
    
    const listings = await client.fetch(query);
    
    console.log(`Found ${listings.length} construction equipment listings`);
    
    // Group by seller ID
    const sellers: Record<string, any[]> = {};
    listings.forEach((listing: any) => {
      const sellerId = listing.supabaseId || 'unknown';
      if (!sellers[sellerId]) {
        sellers[sellerId] = [];
      }
      sellers[sellerId].push(listing);
    });
    
    console.log('Sellers with construction equipment listings:');
    Object.entries(sellers).forEach(([sellerId, sellerListings]) => {
      console.log(`Seller ${sellerId}: ${sellerListings.length} listings`);
      sellerListings.slice(0, 2).forEach(listing => {
        console.log(`  - ${listing.title}`);
      });
      if (sellerListings.length > 2) {
        console.log(`  ... and ${sellerListings.length - 2} more`);
      }
    });
    
    return sellers;
  } catch (error) {
    console.error('Error testing construction equipment sellers:', error);
  }
}