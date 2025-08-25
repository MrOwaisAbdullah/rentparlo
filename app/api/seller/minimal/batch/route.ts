import { createClient } from '@/utils/supabase/server';
import { getCachedSellerInfo, cacheSellerInfo } from '@/lib/cache';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userIds = searchParams.getAll('userId');
    
    if (!userIds || userIds.length === 0) {
      return Response.json({ error: 'User IDs required' }, { status: 400 });
    }

    // Log the incoming request for debugging
    console.log(`Processing batch request for ${userIds.length} users`);

    // Check cache for each user ID and collect results
    const results: Record<string, any> = {};
    const uncachedIds: string[] = [];

    // Check cache first for all user IDs
    for (const userId of userIds) {
      try {
        const cached = await getCachedSellerInfo(userId);
        if (cached) {
          results[userId] = cached;
        } else {
          uncachedIds.push(userId);
        }
      } catch (cacheError) {
        console.error(`Cache error for user ${userId}:`, {
          error: cacheError instanceof Error ? cacheError.message : String(cacheError),
          stack: cacheError instanceof Error ? cacheError.stack : undefined
        });
        uncachedIds.push(userId);
      }
    }

    // Fetch uncached data from Supabase
    if (uncachedIds.length > 0) {
      console.log(`Fetching ${uncachedIds.length} users from Supabase`);
      
      try {
        const supabase = await createClient();
        
        // Fetch all seller profiles in a single query
        const { data, error } = await supabase
          .from('seller_profiles')
          .select('id, username, avatar_url, is_verified, tier')
          .in('id', uncachedIds);

        if (error) {
          console.error('Error fetching seller info from Supabase:', {
            error: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint
          });
          // Provide default values for uncached IDs that failed
          for (const userId of uncachedIds) {
            if (!results[userId]) {
              results[userId] = {
                username: 'User',
                avatarUrl: null,
                is_verified: false,
                tier: 'basic'
              };
            }
          }
        } else {
          // Process fetched data
          if (data) {
            console.log(`Successfully fetched ${data.length} users from Supabase`);
            
            for (const seller of data) {
              const sellerInfo = {
                username: seller.username || 'User',
                avatarUrl: seller.avatar_url,
                is_verified: seller.is_verified || false,
                tier: seller.tier || 'basic'
              };
              
              results[seller.id] = sellerInfo;
              
              // Cache the result
              try {
                await cacheSellerInfo(seller.id, sellerInfo, 60); // 60 seconds
              } catch (cacheError) {
                console.error(`Failed to cache seller info for ${seller.id}:`, {
                  error: cacheError instanceof Error ? cacheError.message : String(cacheError),
                  stack: cacheError instanceof Error ? cacheError.stack : undefined
                });
              }
            }
          }
          
          // Handle any remaining IDs that weren't found
          for (const userId of uncachedIds) {
            if (!results[userId]) {
              results[userId] = {
                username: 'User',
                avatarUrl: null,
                is_verified: false,
                tier: 'basic'
              };
            }
          }
        }
      } catch (supabaseError) {
        console.error('Supabase connection error:', {
          error: supabaseError instanceof Error ? supabaseError.message : String(supabaseError),
          stack: supabaseError instanceof Error ? supabaseError.stack : undefined
        });
        // Provide default values for all uncached IDs
        for (const userId of uncachedIds) {
          if (!results[userId]) {
            results[userId] = {
              username: 'User',
              avatarUrl: null,
              is_verified: false,
              tier: 'basic'
            };
          }
        }
      }
    }

    console.log(`Returning results for ${Object.keys(results).length} users`);
    return Response.json(results);
  } catch (error) {
    console.error('Unexpected error in batch seller info API:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}