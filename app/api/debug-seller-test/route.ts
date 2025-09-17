import { NextRequest } from 'next/server';
import { client } from '@/lib/sanity';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sellerId = searchParams.get('sellerId') || '';
  
  try {
    console.log('Testing Sanity query with sellerId:', sellerId);
    
    // Test the actual search query that's used in the application
    const query = `*[_type == "listing" && status == "active" && published == true && ($sellerId == "" || supabaseId == $sellerId)] | order(_createdAt desc) [0...10] {
      _id,
      title,
      supabaseId,
      price,
      "imageUrl": images[0].asset->url
    }`;
    
    const params = { sellerId };
    console.log('Executing query:', query);
    console.log('With params:', params);
    
    const listings = await client.fetch(query, params);
    
    console.log(`Found ${listings.length} listings`);
    
    // Also test without any filters to see what's in the database
    const allListingsQuery = `*[_type == "listing" && status == "active" && published == true] | order(_createdAt desc) [0...5] {
      _id,
      title,
      supabaseId,
      price
    }`;
    
    const allListings = await client.fetch(allListingsQuery);
    console.log(`Total active listings: ${allListings.length}`);
    
    // Group by seller ID
    const sellerCounts: Record<string, number> = {};
    allListings.forEach((listing: any) => {
      const id = listing.supabaseId || 'unknown';
      sellerCounts[id] = (sellerCounts[id] || 0) + 1;
    });
    
    console.log('Seller counts:', sellerCounts);
    
    return new Response(JSON.stringify({
      success: true,
      listings,
      count: listings.length,
      sellerId,
      allListings: allListings.length,
      sellerCounts
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error testing seller filter:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}