import { createClient } from '@/utils/supabase/server';
import { getCachedSellerInfo, cacheSellerInfo } from '@/lib/cache';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  
  if (!userId) {
    return Response.json({ error: 'User ID required' }, { status: 400 });
  }

  // Check cache first
  const cached = await getCachedSellerInfo(userId);
  if (cached) return Response.json(cached);

  // Fetch minimal data from Supabase
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('seller_profiles')
    .select('username, avatar_url, is_verified, tier')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching seller info:', error);
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
  
  await cacheSellerInfo(userId, sellerInfo, 60); // 60 seconds

  return Response.json(sellerInfo);
}