// Debug script to check category listings
import { client } from './sanity/lib/client.js';

async function debugCategoryListings() {
  try {
    console.log('Fetching all categories...');
    const categories = await client.fetch(`*[_type == "category"]{
      _id,
      title,
      "slug": slug.current,
      "parent": parent->{title, "slug": slug.current}
    }`);
    console.log(`Found ${categories.length} categories.`);
    console.log('\n--- All Categories ---');
    categories.forEach(cat => {
      console.log(`- ${cat.title} (slug: ${cat.slug})${cat.parent ? ` - Parent: ${cat.parent.title} (${cat.parent.slug})` : ''}`);
    });
    console.log('----------------------\n');

    console.log('Fetching active listings...');
    const listings = await client.fetch(`*[_type == "listing" && status == "active"]{
      _id,
      title,
      "category": category->{title, "slug": slug.current}
    }`);
    console.log(`Found ${listings.length} active listings.`);

    // Group listings by category
    const listingsByCategory = listings.reduce((acc, listing) => {
      const categoryTitle = listing.category?.title || 'Uncategorized';
      if (!acc[categoryTitle]) {
        acc[categoryTitle] = [];
      }
      acc[categoryTitle].push(listing.title);
      return acc;
    }, {});

    console.log('\n--- Listings by Category ---');
    for (const category in listingsByCategory) {
      console.log(`${category} (${listingsByCategory[category].length} listings):`);
    }
    console.log('--------------------------\n');


    // Get all category listing counts
    console.log('\n--- Category Listing Counts ---');
    const categoryCounts = await client.fetch(`*[_type == "category"]{
      _id,
      title,
      "slug": slug.current,
      "count": count(*[_type == "listing" && references(^._id) && status == "active"])
    }`);
    
    categoryCounts.forEach(cat => {
      console.log(`${cat.title} (${cat.slug}): ${cat.count} listings`);
    });
    console.log('-----------------------------');


  } catch (error) {
    console.error('Error debugging category listings:', error);
  }
}

debugCategoryListings();