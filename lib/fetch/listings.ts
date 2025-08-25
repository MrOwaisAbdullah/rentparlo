import { client } from '@/sanity/lib/client';
import { createClient as createSupabaseClient } from '@/utils/supabase/client';
import { cache } from 'react';

const supabase = createSupabaseClient();

// 1. Get listings with minimal seller references (Sanity only)
export const getHomepageListings = cache(async () => {
  try {
    // Get listings with ONLY the Supabase ID reference
    const listings = await client.fetch(`*[_type == "listing" && status == "active"]{
      _id,
      title,
      slug,
      price,
      pricePerHour,
      "categoryTitle": category->title,
      category->{
        title,
        slug
      },
      images[]{
        asset->{
          _id,
          url,
          metadata
        }
      },
      location,
      availability,
      created_at,
      supabaseId,  // ONLY this connects to Supabase
      featured,
      priceWeekly,
      priceMonthly,
      specifications,
      badges
    }`);

    // Extract unique seller IDs
    const sellerIds = [...new Set(listings.map((listing: any) => listing.supabaseId as string).filter(Boolean))] as string[];
    
    // Batch fetch seller info for all unique seller IDs
    const sellerInfoMap = await getBatchSellerInfo(sellerIds);

    // Attach seller info to listings
    return listings.map((listing: any) => {
      const sellerInfo = sellerInfoMap[listing.supabaseId] || {
        username: 'User',
        avatarUrl: null,
        is_verified: false,
        tier: 'basic'
      };
      
      return {
        ...listing,
        seller: {
          profile: {
            username: sellerInfo.username || 'User',
            avatar_url: sellerInfo.avatarUrl || null,
            is_verified: sellerInfo.is_verified || false
          }
        },
        categoryTitle: listing.categoryTitle // Keep both for compatibility
      };
    });
  } catch (error) {
    console.error('Error fetching homepage listings:', error);
    return [];
  }
});

// Batch fetch seller info for multiple seller IDs
async function getBatchSellerInfo(sellerIds: string[]) {
  if (sellerIds.length === 0) {
    return {};
  }

  try {
    // Create query string with all seller IDs
    const idsQuery = sellerIds.map(id => `userId=${encodeURIComponent(id)}`).join('&');
    
    // Use absolute URL for server-side fetch calls
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    
    // Add better error handling and timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    try {
      const response = await fetch(`${baseUrl}/api/seller/minimal/batch?${idsQuery}`, {
        next: { revalidate: 60 }, // Cache for 60 seconds
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      // Log detailed error information safely
      console.error('Fetch error details:', {
        url: `${baseUrl}/api/seller/minimal/batch?${idsQuery}`,
        error: fetchError instanceof Error ? fetchError.message : String(fetchError),
        timestamp: new Date().toISOString(),
        // Add more detailed error info if available
        ...(fetchError instanceof Error && 'cause' in fetchError ? { cause: fetchError.cause } : {}),
        stack: fetchError instanceof Error ? fetchError.stack : undefined
      });
      
      // If fetch fails, fall back to individual requests
      return await getIndividualSellerInfo(sellerIds);
    }
  } catch (error) {
    console.error('Error in getBatchSellerInfo:', error);
    // Return default values for all seller IDs
    return getDefaultSellerInfo(sellerIds);
  }
}

// Fallback function to get seller info individually
async function getIndividualSellerInfo(sellerIds: string[]) {
  try {
    const results: Record<string, any> = {};
    
    // Process IDs in smaller batches to avoid overwhelming the server
    const batchSize = 5;
    for (let i = 0; i < sellerIds.length; i += batchSize) {
      const batch = sellerIds.slice(i, i + batchSize);
      const batchPromises = batch.map(id => getMinimalSellerInfo(id));
      const batchResults = await Promise.all(batchPromises);
      
      batch.forEach((id, index) => {
        results[id] = batchResults[index];
      });
    }
    
    return results;
  } catch (error) {
    console.error('Error in getIndividualSellerInfo:', error);
    return getDefaultSellerInfo(sellerIds);
  }
}

// Helper function to create default seller info
function getDefaultSellerInfo(sellerIds: string[]) {
  const defaultInfo = {
    username: 'User',
    avatarUrl: null,
    is_verified: false,
    tier: 'basic'
  };
  
  const result: Record<string, any> = {};
  sellerIds.forEach(id => {
    result[id] = defaultInfo;
  });
  return result;
}

// 3. Minimal seller info API (cached) - kept for backward compatibility
async function getMinimalSellerInfo(supabaseId: string) {
  try {
    // Use absolute URL for server-side fetch calls
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    
    // Add timeout and better error handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    try {
      const response = await fetch(`${baseUrl}/api/seller/minimal?userId=${supabaseId}`, {
        next: { revalidate: 60 }, // Cache for 60 seconds
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      // Log detailed error information safely
      console.error('Fetch error in getMinimalSellerInfo:', {
        url: `${baseUrl}/api/seller/minimal?userId=${supabaseId}`,
        error: fetchError instanceof Error ? fetchError.message : String(fetchError),
        timestamp: new Date().toISOString()
      });
      
      // Return default values on fetch failure
      return { 
        username: 'User', 
        avatarUrl: null,
        is_verified: false,
        tier: 'basic' 
      };
    }
  } catch (error) {
    console.error('Error fetching seller info:', error);
    return { 
      username: 'User', 
      avatarUrl: null,
      is_verified: false,
      tier: 'basic' 
    };
  }
}