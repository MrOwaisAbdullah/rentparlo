// lib/listings.ts
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
      images,
      location,
      availability,
      created_at,
      supabaseId,  // ONLY this connects to Supabase
      featured,
      priceWeekly,
      priceMonthly
    }`);

    // 2. Get MINIMAL seller info for display (cached API)
    return await Promise.all(listings.map(async (listing: any) => {
      const sellerInfo = await getMinimalSellerInfo(listing.supabaseId);
      return {
        ...listing,
        seller: sellerInfo
      };
    }));
  } catch (error) {
    console.error('Error fetching homepage listings:', error);
    return [];
  }
});

// 3. Minimal seller info API (cached)
async function getMinimalSellerInfo(supabaseId: string) {
  try {
    const response = await fetch(`/api/seller/minimal?userId=${supabaseId}`, {
      next: { revalidate: 60 } // Cache for 60 seconds
    });
    return await response.json();
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

