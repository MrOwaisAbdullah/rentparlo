import { NextRequest } from 'next/server';
import { searchListings, searchListingsCount } from '@/lib/sanity-queries';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sellerId = searchParams.get('sellerId') || '';
  
  try {
    console.log('API route called with sellerId:', sellerId);
    
    // Test search listings with seller filter
    const listings = await searchListings({
      sellerId: sellerId
    });
    
    console.log(`Found ${listings.length} listings for seller ${sellerId}`);
    
    // Test count with seller filter
    const count = await searchListingsCount({
      sellerId: sellerId
    });
    
    console.log(`Total count for seller ${sellerId}: ${count}`);
    
    return new Response(JSON.stringify({
      success: true,
      listings: listings.length,
      count: count,
      sellerId: sellerId
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