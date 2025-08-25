// Debug script to check Sanity listings data
import { client } from '@/sanity/lib/client';

async function debugSanityListings() {
  try {
    console.log('Fetching listings from Sanity...');
    
    // Get listings with category information
    const listings = await client.fetch(`*[_type == "listing" && status == "active"]{
      _id,
      title,
      slug,
      price,
      "categoryTitle": category->title,
      category->{
        title,
        slug
      },
      featured,
      supabaseId
    }`);

    console.log(`Found ${listings.length} active listings`);
    
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
      
      // Check featured listings
      const featuredListings = listings.filter((listing: any) => listing.featured === true);
      console.log(`Found ${featuredListings.length} featured listings`);
    }
  } catch (error) {
    console.error('Error fetching listings:', error);
  }
}

debugSanityListings();