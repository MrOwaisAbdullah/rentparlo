import { createClient } from '@/utils/supabase/server';
import { getCachedSellerInfo, cacheSellerInfo } from '@/lib/cache';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return Response.json({ error: 'User ID required' }, { status: 400 });
    }

    // Check cache first
    const cached = await getCachedSellerInfo(userId);
    if (cached) {
      console.log(`Returning cached data for user ${userId}`);
      return Response.json(cached);
    }

    // Fetch minimal data from Supabase
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('seller_profiles')
      .select('username, avatar_url, is_verified, tier')
      .eq('id', userId)
      .maybeSingle(); // Changed from .single() to .maybeSingle() to handle 0 rows

    if (error) {
      console.error('Error fetching seller info:', {
        userId,
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      return Response.json({ 
        username: 'User',
        avatarUrl: null,
        is_verified: false,
        tier: 'basic'
      });
    }

    // Handle case when no data is found
    if (!data) {
      console.log(`No seller profile found for user ${userId}`);
      return Response.json({ 
        username: 'User',
        avatarUrl: null,
        is_verified: false,
        tier: 'basic'
      });
    }

    // Cache the result
    const sellerInfo = {
      username: data.username,
      avatarUrl: data.avatar_url,
      is_verified: data.is_verified,
      tier: data.tier
    };
    
    try {
      await cacheSellerInfo(userId, sellerInfo, 60); // 60 seconds
    } catch (cacheError) {
      console.error('Failed to cache seller info:', {
        userId,
        error: cacheError instanceof Error ? cacheError.message : String(cacheError),
        stack: cacheError instanceof Error ? cacheError.stack : undefined
      });
    }

    console.log(`Returning fresh data for user ${userId}`);
    return Response.json(sellerInfo);
  } catch (error) {
    console.error('Unexpected error in seller info API:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}