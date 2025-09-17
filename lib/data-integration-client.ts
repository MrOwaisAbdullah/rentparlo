/**
 * =====================================================
 * RentParlo.pk Data Integration Layer (Client-Side)
 * =====================================================
 * This layer provides client-side data access for the frontend
 * Avoids server-side dependencies that cause next/headers import issues
 */

import { Listing, Seller, SellerProfile, SearchParams, SearchResults, Category, BlogPost } from '@/types'
import {
  getListingBySlug,
  getListingsByCategory,
  searchListings,
  getCategories,
  getCategoryBySlug,
  getFeaturedListings,
  getSimilarListings as sanityGetSimilarListings,
  getBlogPosts,
  getBlogPostBySlug,
  getHomepageBanners,
  getListingReviews
} from './sanity-queries'
import { trackAnalyticsEventClient } from './supabase-queries-client'

/**
 * =====================================================
 * CLIENT-SIDE LISTING OPERATIONS
 * =====================================================
 */

// Search listings (client-side version)
export async function searchEnhancedListingsClient(params: SearchParams): Promise<SearchResults> {
  try {
    console.log('=== SEARCH ENHANCED LISTINGS CLIENT DEBUG ===');
    console.log('searchEnhancedListingsClient called with params:', params);
    console.log('Seller param in client:', params.seller);
    console.log('============================================');
    
    // Get the listings for the current page
    const listings = await searchListings({
      query: params.query,
      category: params.category,
      city: params.city,
      area: params.area,
      condition: params.condition,
      minPrice: params.minPrice,
      maxPrice: params.maxPrice,
      offset: params.offset || 0,
      limit: params.limit || 20,
      sellerId: params.seller || "", // Fix: map seller to sellerId
    })

    // Get the total count of matching listings
    const { searchListingsCount } = await import('./sanity-queries');
    const total = await searchListingsCount({
      query: params.query,
      category: params.category,
      city: params.city,
      area: params.area,
      condition: params.condition,
      minPrice: params.minPrice,
      maxPrice: params.maxPrice,
      sellerId: params.seller || "", // Fix: map seller to sellerId
    });

    // For client-side, we'll return listings without enhanced seller data
    // to avoid server-side dependencies
    const result: SearchResults = {
      results: listings,
      filters: params,
      total: total // Use the actual total count, not just the current page count
    };

    console.log(`searchEnhancedListingsClient returning ${listings.length} results out of ${total} total`);
    return result;
  } catch (error) {
    console.error('Error searching listings:', error)
    return {
      results: [],
      filters: params,
      total: 0
    }
  }
}

// Track search query (client-side version)
export async function trackSearchQueryClient(
  query: string,
  userId?: string,
  filters?: SearchParams
) {
  try {
    await trackAnalyticsEventClient({
      listing_id: 'search', // Special identifier for search events
      event_type: 'search',
      user_id: userId,
      referrer: `query:${query}|filters:${JSON.stringify(filters)}`
    })
  } catch (error) {
    console.error('Error tracking search query:', error)
  }
}