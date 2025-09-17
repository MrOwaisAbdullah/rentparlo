import { NextRequest } from 'next/server';
import { searchEnhancedListingsClient } from '@/lib/data-integration-client';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sellerId = searchParams.get('sellerId') || '';
  
  try {
    console.log('API test with sellerId:', sellerId);
    
    const searchResults = await searchEnhancedListingsClient({
      seller: sellerId,
      offset: 0,
      limit: 10
    });
    
    console.log('Search results:', searchResults);
    
    return new Response(JSON.stringify({
      success: true,
      results: searchResults.results.map((listing: any) => ({
        _id: listing._id,
        title: listing.title,
        supabaseId: listing.supabaseId
      })),
      count: searchResults.results.length,
      total: searchResults.total
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error testing seller search:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}