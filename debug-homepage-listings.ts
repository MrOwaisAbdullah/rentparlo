// Debug script to check homepage listings data
import { getHomepageListings } from '@/lib/fetch/listings';

async function debugListings() {
  try {
    console.log('Fetching homepage listings...');
    const listings = await getHomepageListings();
    
    console.log(`Found ${listings.length} listings`);
    
    if (listings.length > 0) {
      console.log('First listing:', JSON.stringify(listings[0], null, 2));
      
      // Check category information
      const categories = listings.map((listing: any) => ({
        title: listing.title,
        categoryTitle: listing.categoryTitle,
        category: listing.category,
        featured: listing.featured
      }));
      
      console.log('Category information for first 5 listings:');
      console.log(JSON.stringify(categories.slice(0, 5), null, 2));
      
      // Check unique categories
      const uniqueCategories = [...new Set(listings.map((listing: any) => 
        listing.categoryTitle || listing.category?.title || 'Unknown'
      ))];
      
      console.log('Unique categories found:', uniqueCategories);
    }
  } catch (error) {
    console.error('Error fetching listings:', error);
  }
}

debugListings();