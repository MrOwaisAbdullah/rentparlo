/**
 * =====================================================
 * RentParlo.pk Data Integration Layer
 * =====================================================
 * This layer combines data from Sanity CMS and Supabase database
 * to provide unified data access for the frontend
 */

export { getListingReviews, getSellerListingsCount } from './data-integration-missing';

import { Listing, Seller, SellerProfile, User, SearchParams, SearchResults, Category, BlogPost, EnhancedUserSubscription } from '@/types'
import {
  getListingBySlug,
  getListingsByCategory,
  searchListings,
  searchListingsCount,
  getCategories,
  getCategoryBySlug,
  getFeaturedListings,
  getSimilarListings as sanityGetSimilarListings,
  getBlogPosts,
  getBlogPostBySlug,
  getHomepageBanners,
  getListingReviews
} from './sanity-queries'
import {
  getUserById,
  getSellerProfile,
  getSellerProfileByUsername,
  getListingAnalytics,
  getSellerAnalytics,
  trackAnalyticsEvent,
  getTopSellers,
  getUserActiveSubscription
} from './supabase-queries'
import { cacheManager } from '@/lib/cache-redis';

// Define the banner interface matching the Sanity query result
interface Banner {
  _id: string;
  title: string;
  titleUrdu?: string;
  subtitle?: string;
  subtitleUrdu?: string;
  image: {
    asset: {
      url: string;
    };
  };
  mobileImage?: {
    asset: {
      url: string;
    };
  };
  link?: string;
  order: number;
  active: boolean;
}

// Define the homepage data interface
interface HomepageData {
  featuredListings: Listing[]
  categories: Category[]
  banners: Banner[]
  recentBlogs: BlogPost[]
  topSellers: SellerProfile[]
}

/**
 * =====================================================
 * CACHING CONFIGURATION
 * =====================================================
 */

// Cache key generators
const getCacheKey = {
  listing: (slug: string) => `listing:${slug}`,
  seller: (username: string) => `seller:${username}`,
  category: (slug: string) => `category:${slug}`,
  search: (params: SearchParams) => `search:${JSON.stringify(params)}`,
  homepage: () => 'homepage:data',
  analytics: (listingId: string) => `analytics:${listingId}`
}

// Enhanced TTL Configuration (in seconds)
const CACHE_TTL = {
  homepage: 300,        // 5 minutes
  category: 600,        // 10 minutes
  categoryListings: 300, // 5 minutes
  listing: 180,         // 3 minutes
  seller: 900,          // 15 minutes
  sellerListings: 300,  // 5 minutes
  search: 120,          // 2 minutes
  userSession: 86400,   // 24 hours
  analytics: 60,        // 1 minute
  blogPost: 3600,       // 1 hour
  blogList: 1800        // 30 minutes
}

/**
 * =====================================================
 * ENHANCED LISTING OPERATIONS
 * =====================================================
 */

// Get listing with seller information and analytics
export async function getEnhancedListingBySlug(slug: string, userId?: string): Promise<Listing | null> {
  try {
    // Try to get from cache first
    const cacheKey = getCacheKey.listing(slug);
    const cached: Listing | null = await cacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Get listing from Sanity
    const listing = await getListingBySlug(slug, userId)
    if (!listing) return null

    // Initialize seller as undefined
    let enhancedSeller: Seller | undefined = undefined;

    // Only try to get seller information if supabaseId exists
    if (listing.supabaseId) {
      try {
        // Get seller information from Supabase
        const seller = await getUserById(listing.supabaseId)
        console.log('Seller data for listing:', seller); // Debugging
        
        if (seller) {
          // Transform seller data to match expected structure
          enhancedSeller = {
            ...seller,
            // Map seller profile data if it exists
            ...(seller.seller_profiles?.[0] ? {
              seller_profile: seller.seller_profiles[0]
            } : {})
          };
        }
      } catch (error) {
        console.error('Error fetching seller data:', error);
        // Don't fail the whole listing if seller data is missing
      }
    }

    // Transform the listing data
    const enhancedListing: Listing = {
      ...listing,
      seller: enhancedSeller,
      // Add any other transformations needed
    };

    // Cache the result
    await cacheManager.set(cacheKey, enhancedListing, 300); // Cache for 5 minutes

    return enhancedListing;
  } catch (error) {
    console.error('Error in getEnhancedListingBySlug:', error);
    return null;
  }
}

// Get listings with seller information
export async function getEnhancedListings(limit?: number): Promise<Listing[]> {
  try {
    const listings = await getFeaturedListings()
    
    // Enhance each listing with seller information
    const enhancedListings = await Promise.all(
      listings.slice(0, limit).map(async (listing) => {
        try {
          const seller = await getUserById(listing.supabaseId)
          if (!seller) return listing

          let sellerProfile: SellerProfile | null = null
          if (seller.role === 'seller') {
            sellerProfile = await getSellerProfile(seller.id)
          }

          const analytics = await getListingAnalytics(listing._id)

          return {
            ...listing,
            views: analytics.views,
            contactClicks: analytics.contactClicks,
            seller: sellerProfile ? {
              ...seller,
              guest_id: seller.guest_id || null,
              profile: sellerProfile
            } : undefined
          }
        } catch (error) {
          console.error(`Error enhancing listing ${listing._id}:`, error)
          return listing
        }
      })
    )

    return enhancedListings
  } catch (error) {
    console.error('Error getting enhanced listings:', error)
    return []
  }
}

// Search listings with enhanced data
export async function searchEnhancedListings(params: SearchParams): Promise<SearchResults> {
  try {
    // Try to get from cache first
    const cacheKey = getCacheKey.search(params);
    const cached: SearchResults | null = await cacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Get the total count of matching listings
    const total = await searchListingsCount({
      query: params.query,
      category: params.category,
      city: params.city,
      area: params.area,
      condition: params.condition,
      minPrice: params.minPrice,
      maxPrice: params.maxPrice
    });

    // Get the paginated results
    const paginatedListings = await searchListings({
      query: params.query,
      category: params.category,
      city: params.city,
      area: params.area,
      condition: params.condition,
      minPrice: params.minPrice,
      maxPrice: params.maxPrice,
      offset: params.offset || 0,
      limit: params.limit || 20
    });

    // Enhance listings with seller information (limit concurrent requests)
    const batchSize = 5;
    const enhancedListings: (Listing & { 
      hasSearchTopPlacement?: boolean; 
      hasGuaranteedTopPlacement?: boolean;
      hasEnhancedSearchVisibility?: boolean; // Add enhanced search visibility flag
      hasSearchPriority?: boolean; // Add search priority flag for Bronze tier
    })[] = [];

    for (let i = 0; i < paginatedListings.length; i += batchSize) {
      const batch = paginatedListings.slice(i, i + batchSize);
      const enhancedBatch = await Promise.all(
        batch.map(async (listing) => {
          try {
            const seller = await getUserById(listing.supabaseId);
            if (!seller) return { 
              ...listing, 
              hasSearchTopPlacement: false, 
              hasGuaranteedTopPlacement: false,
              hasEnhancedSearchVisibility: false,
              hasSearchPriority: false // Add default search priority flag
            };

            let sellerProfile: SellerProfile | null = null;
            if (seller.role === 'seller') {
              sellerProfile = await getSellerProfile(seller.id);
            }

            // Get seller's subscription to check for search top placement feature
            const subscription = await getUserActiveSubscription(seller.id);
            const hasSearchTopPlacement = subscription?.subscription_packages?.features?.search_top_placement === true;
            
            // Check for guaranteed top placement (from package features or seller tier features)
            let hasGuaranteedTopPlacement = false;
            if (subscription?.subscription_packages?.features?.guaranteed_top_placement === true) {
              hasGuaranteedTopPlacement = true;
            } else if (sellerProfile) {
              // Check seller tier features
              const tier = sellerProfile.tier;
              if (['platinum', 'diamond'].includes(tier)) {
                hasGuaranteedTopPlacement = true;
              }
            }
            
            // Check for enhanced search visibility (Silver tier feature)
            let hasEnhancedSearchVisibility = false;
            if (sellerProfile) {
              const tier = sellerProfile.tier;
              if (['silver', 'gold', 'platinum', 'diamond'].includes(tier)) {
                hasEnhancedSearchVisibility = true;
              }
            }
            
            // Check for search priority (Bronze tier feature)
            let hasSearchPriority = false;
            if (sellerProfile) {
              const tier = sellerProfile.tier;
              if (['bronze', 'silver', 'gold', 'platinum', 'diamond'].includes(tier)) {
                hasSearchPriority = true;
              }
            }

            return {
              ...listing,
              seller: sellerProfile ? {
                ...seller,
                guest_id: seller.guest_id || null,
                profile: sellerProfile
              } : undefined,
              hasSearchTopPlacement, // Add search top placement flag
              hasGuaranteedTopPlacement, // Add guaranteed top placement flag
              hasEnhancedSearchVisibility, // Add enhanced search visibility flag
              hasSearchPriority // Add search priority flag
            };
          } catch (error) {
            console.error(`Error enhancing listing ${listing._id}:`, error);
            return { 
              ...listing, 
              hasSearchTopPlacement: false, 
              hasGuaranteedTopPlacement: false,
              hasEnhancedSearchVisibility: false,
              hasSearchPriority: false // Add default search priority flag
            };
          }
        })
      );
      enhancedListings.push(...enhancedBatch);
    }

    // Sort listings to prioritize listings with guaranteed top placement, then search top placement, 
    // then enhanced search visibility, then search priority, then featured
    enhancedListings.sort((a, b) => {
      // First, prioritize listings with guaranteed top placement
      if (a.hasGuaranteedTopPlacement && !b.hasGuaranteedTopPlacement) return -1;
      if (!a.hasGuaranteedTopPlacement && b.hasGuaranteedTopPlacement) return 1;
      
      // Then, prioritize listings with search top placement
      if (a.hasSearchTopPlacement && !b.hasSearchTopPlacement) return -1;
      if (!a.hasSearchTopPlacement && b.hasSearchTopPlacement) return 1;
      
      // Then, prioritize listings with enhanced search visibility
      if (a.hasEnhancedSearchVisibility && !b.hasEnhancedSearchVisibility) return -1;
      if (!a.hasEnhancedSearchVisibility && b.hasEnhancedSearchVisibility) return 1;
      
      // Then, prioritize listings with search priority (Bronze tier feature)
      if (a.hasSearchPriority && !b.hasSearchPriority) return -1;
      if (!a.hasSearchPriority && b.hasSearchPriority) return 1;
      
      // Then, prioritize featured listings
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      
      // Finally, sort by creation date (newest first)
      return new Date(b._createdAt).getTime() - new Date(a._createdAt).getTime();
    });

    const result: SearchResults = {
      results: enhancedListings,
      filters: params,
      total: total
    };

    // Cache the result
    await cacheManager.set(cacheKey, result, { 
      ttl: CACHE_TTL.search,
      tags: ['search']
    });

    return result;
  } catch (error) {
    console.error('Error searching enhanced listings:', error);
    return {
      results: [],
      filters: params,
      total: 0
    };
  }
}

/**
 * =====================================================
 * SELLER OPERATIONS
 * =====================================================
 */

// Get complete seller information with listings and analytics
export async function getCompleteSellerProfile(username: string) {
  try {
    // Try to get from cache first
    const cacheKey = getCacheKey.seller(username);
    const cached: any = await cacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Get seller from Supabase
    const seller = await getSellerProfileByUsername(username);
    if (!seller) return null;

    // Get seller's listings from Sanity
    const listings = await searchListings({
      query: '',
      category: '',
      city: '',
      condition: '',
      minPrice: 0,
      maxPrice: 0,
      offset: 0,
      limit: 50
    });

    // Filter listings by seller
    const sellerListings = listings.filter(listing => listing.supabaseId === seller.id);

    // Get seller analytics
    const analytics = await getSellerAnalytics(seller.id);

    // Get active subscription
    const subscription: EnhancedUserSubscription | null = await getUserActiveSubscription(seller.id);

    const result = {
      seller,
      listings: sellerListings,
      analytics,
      subscription
    };

    // Cache the result
    await cacheManager.set(cacheKey, result, { 
      ttl: CACHE_TTL.seller,
      tags: [`seller:${username}`]
    });

    return result;
  } catch (error) {
    console.error('Error getting complete seller profile:', error);
    return null;
  }
}

// Get seller dashboard data
export async function getSellerDashboardData(sellerId: string) {
  try {
    // Get seller profile
    const sellerProfile = await getSellerProfile(sellerId)
    if (!sellerProfile) return null

    // Get seller's listings
    const listings = await searchListings({
      query: '',
      category: '',
      city: '',
      condition: '',
      minPrice: 0,
      maxPrice: 0,
      offset: 0,
      limit: 100
    })

    const sellerListings = listings.filter(listing => listing.supabaseId === sellerId)

    // Get analytics for each listing
    const listingsWithAnalytics = await Promise.all(
      sellerListings.map(async (listing: any) => {
        try {
          const analytics = await getListingAnalytics(listing._id);
          return {
            ...listing,
            ...analytics
          };
        } catch (error) {
          console.error(`Error getting analytics for listing ${listing._id}:`, error);
          return listing;
        }
      })
    )

    // Get overall seller analytics
    const sellerAnalytics = await getSellerAnalytics(sellerId)

    // Get subscription information
    const subscription: EnhancedUserSubscription | null = await getUserActiveSubscription(sellerId)
    
    // Check if seller has custom analytics reports feature
    const hasCustomAnalyticsReports = subscription?.subscription_packages?.features?.custom_analytics_reports === true;

    return {
      profile: sellerProfile,
      listings: listingsWithAnalytics,
      analytics: sellerAnalytics,
      subscription,
      hasCustomAnalyticsReports // Add custom analytics reports flag
    }
  } catch (error) {
    console.error('Error getting seller dashboard data:', error)
    return null
  }
}

// Get seller by username with enhanced data
export async function getSellerByUsername(username: string) {
  try {
    const seller = await getSellerProfileByUsername(username);
    if (!seller) return null;

    return seller;
  } catch (error: any) {
    console.error('Error fetching seller by username:', {
      username,
      error: error.message || error,
      stack: error.stack
    });
    return null;
  }
}

// Get seller listings with enhanced data
export async function getSellerListings(
  sellerId: string, 
  options: { 
    limit?: number; 
    status?: string; 
    category?: string; 
    offset?: number;
  } = {}
) {
  try {
    const { limit = 20, status = 'active', category, offset = 0 } = options;
    
    // Get all listings and filter by seller
    const allListings = await searchListings({
      query: '',
      category: category || '',
      city: '',
      condition: '',
      minPrice: 0,
      maxPrice: 0,
      offset: 0,
      limit: 1000 // Get more to filter properly
    });
    
    // Filter by seller ID
    let sellerListings = allListings.filter(listing => listing.supabaseId === sellerId);
    
    // Apply status filter if provided
    if (status) {
      sellerListings = sellerListings.filter(listing => listing.status === status);
    }
    
    // Apply pagination
    sellerListings = sellerListings.slice(offset, offset + limit);

    // Enhance listings with analytics data
    const enhancedListings = await Promise.all(
      sellerListings.map(async (listing: any) => {
        try {
          const analytics = await getListingAnalytics(listing._id);
          return {
            ...listing,
            views: analytics.views,
            contactClicks: analytics.contactClicks,
            updatedAt: listing._updatedAt
          };
        } catch (error) {
          console.error(`Error getting analytics for listing ${listing._id}:`, error);
          return listing;
        }
      })
    );

    return enhancedListings;
  } catch (error) {
    console.error('Error fetching seller listings:', error);
    return [];
  }
}

/**
 * =====================================================
 * HOMEPAGE DATA
 * =====================================================
 */

// Get all homepage data in one request
export async function getHomepageData(): Promise<HomepageData> {
  try {
    // Try to get from cache first
    const cacheKey = getCacheKey.homepage();
    const cached: HomepageData | null = await cacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }

    const [
      featuredListings,
      categories,
      banners,
      recentBlogs,
      topSellers
    ] = await Promise.all([
      getEnhancedListings(12),
      getCategories(),
      getHomepageBanners(),
      getBlogPosts(),
      getTopSellers(6)
    ])

    // Ensure all category slugs are properly formatted
    const processedCategories = categories.slice(0, 8).map(category => ({
      ...category,
      // Ensure slug is always in the correct format
      slug: typeof category.slug === 'object' && category.slug !== null && 'current' in category.slug 
        ? category.slug.current 
        : category.slug
    }));

    const result: HomepageData = {
      featuredListings,
      categories: processedCategories, // Show top 8 categories with processed slugs
      banners,
      recentBlogs: recentBlogs.slice(0, 3), // Show 3 recent blogs
      topSellers
    };

    // Cache the result
    await cacheManager.set(cacheKey, result, { 
      ttl: CACHE_TTL.homepage,
      tags: ['homepage']
    });

    return result;
  } catch (error) {
    console.error('Error getting homepage data:', error)
    return {
      featuredListings: [],
      categories: [],
      banners: [],
      recentBlogs: [],
      topSellers: []
    }
  }
}

/**
 * =====================================================
 * ANALYTICS TRACKING
 * =====================================================
 */

// Track listing view with enhanced context
export async function trackListingView(
  listingId: string,
  userId?: string,
  additionalData?: {
    userAgent?: string
    referrer?: string
    city?: string
    deviceType?: 'mobile' | 'tablet' | 'desktop'
  }
) {
  try {
    await trackAnalyticsEvent({
      listing_id: listingId,
      event_type: 'view',
      user_id: userId,
      ip_address: additionalData?.referrer,
      user_agent: additionalData?.userAgent,
      city: additionalData?.city,
      device_type: additionalData?.deviceType,
      referrer: additionalData?.referrer
    })
  } catch (error) {
    console.error('Error tracking listing view:', error)
  }
}

// Track contact click
export async function trackContactClick(
  listingId: string,
  userId?: string,
  contactType: 'phone' | 'whatsapp' | 'email' = 'phone'
) {
  try {
    const eventType = contactType === 'whatsapp' ? 'WhatsApp_click' : 'contact_click'
    
    await trackAnalyticsEvent({
      listing_id: listingId,
      event_type: eventType,
      user_id: userId
    })
  } catch (error) {
    console.error('Error tracking contact click:', error)
  }
}

// Track search query
export async function trackSearchQuery(
  query: string,
  userId?: string,
  filters?: SearchParams
) {
  try {
    await trackAnalyticsEvent({
      listing_id: 'search', // Special identifier for search events
      event_type: 'search',
      user_id: userId,
      referrer: `query:${query}|filters:${JSON.stringify(filters)}`
    })
  } catch (error) {
    console.error('Error tracking search query:', error)
  }
}

/**
 * =====================================================
 * LISTING MANAGEMENT
 * =====================================================
 */

// Create new listing with Sanity and track in Supabase
export async function createNewListing(listingData: any, sellerId: string) {
  try {
    // Add seller ID to listing data
    const enhancedListingData = {
      ...listingData,
      supabaseId: sellerId,
      status: 'pending', // Start as pending for review
      published: false,
      _type: 'listing'
    }

    // Create listing in Sanity
    const { createListing } = await import('./sanity-queries')
    const newListing = await createListing(enhancedListingData)

    if (newListing) {
      // Track listing creation in analytics
      await trackAnalyticsEvent({
        listing_id: newListing._id,
        event_type: 'listing_click', // Using as listing creation event
        user_id: sellerId
      })
    }

    return newListing
  } catch (error) {
    console.error('Error creating new listing:', error)
    return null
  }
}

/**
 * =====================================================
 * SIMILAR LISTINGS
 * =====================================================
 */

// Get similar listings based on category and current listing
export async function getSimilarListings(
  listingId: string, 
  categoryTitle: string, 
  limit: number = 4
): Promise<Listing[]> {
  try {
    const similarListings = await sanityGetSimilarListings(listingId, categoryTitle);
    return similarListings.slice(0, limit);
  } catch (error) {
    console.error('Error fetching similar listings:', error);
    return [];
  }
}

/**
 * =====================================================
 * LISTING REVIEWS
 * =====================================================
 */

// Get enhanced listing reviews with user information
export async function getEnhancedListingReviews(listingId: string) {
  try {
    const reviews = await getListingReviews(listingId);
    
    // Enhance reviews with user information (limited for performance)
    const enhancedReviews = await Promise.all(
      reviews.slice(0, 20).map(async (review) => {
        try {
          if (review.supabaseUserId) {
            const user = await getUserById(review.supabaseUserId);
            if (user) {
              return {
                ...review,
                userName: user.email,
                userAvatar: null // User type doesn't have avatar_url, only SellerProfile does
              };
            }
          }
          return review;
        } catch (error) {
          console.error(`Error enhancing review ${review._id}:`, error);
          return review;
        }
      })
    );

    return enhancedReviews;
  } catch (error) {
    console.error('Error getting enhanced listing reviews:', error);
    return [];
  }
}

/**
 * =====================================================
 * ERROR HANDLING HELPERS
 * =====================================================
 */

// Graceful error handling for data fetching
export async function safeDataFetch<T>(
  operation: () => Promise<T>,
  fallback: T,
  errorMessage: string
): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    console.error(errorMessage, error)
    return fallback
  }
}

/**
 * =====================================================
 * VALIDATION HELPERS
 * =====================================================
 */

// Validate listing data before creation
export function validateListingData(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!data.title || data.title.length < 10) {
    errors.push('Title must be at least 10 characters long')
  }
  
  if (!data.description || data.description.length < 50) {
    errors.push('Description must be at least 50 characters long')
  }
  
  if (!data.price || data.price <= 0) {
    errors.push('Price must be greater than 0')
  }
  
  if (!data.category) {
    errors.push('Category is required')
  }
  
  if (!data.location || !data.location.city) {
    errors.push('Location city is required')
  }
  
  if (!data.condition) {
    errors.push('Condition is required')
  }
  
  if (!data.images || data.images.length === 0) {
    errors.push('At least one image is required')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * =====================================================
 * BULK OPERATIONS
 * =====================================================
 */

// Get multiple listings by IDs
export async function getListingsByIds(listingIds: string[]): Promise<Listing[]> {
  try {
    const listings = await Promise.all(
      listingIds.map(id => getListingBySlug(id).catch(() => null))
    )
    
    return listings.filter((listing): listing is Listing => listing !== null)
  } catch (error) {
    console.error('Error getting listings by IDs:', error)
    return []
  }
}

// Batch update analytics
export async function batchTrackAnalytics(events: Array<{
  listingId: string
  eventType: string
  userId?: string
  additionalData?: any
}>) {
  try {
    await Promise.all(
      events.map(event => 
        trackAnalyticsEvent({
          listing_id: event.listingId,
          event_type: event.eventType as any,
          user_id: event.userId,
          ...event.additionalData
        })
      )
    )
  } catch (error) {
    console.error('Error batch tracking analytics:', error)
  }
}

/**
 * =====================================================
 * CATEGORY OPERATIONS
 * =====================================================
 */

// Get category with listings and filtering
export async function getCategoryWithListings(slug: string, filters: any) {
  try {
    // Try to get from cache first
    const cacheKey = `category:${slug}:filters:${JSON.stringify(filters)}`;
    const cached: any = await cacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Get category data from Sanity
    const category = await getCategoryBySlug(slug);
    if (!category) {
      return {
        category: null,
        listings: [],
        totalCount: 0,
        subcategories: []
      }
    }

    // Get listings for this category with filters using search function
    // Only include non-empty parameters to avoid filtering out results
    const searchParams: any = {
      category: category._id, // Use category ID instead of slug for proper filtering
      offset: filters.offset || 0,
      limit: filters.limit || 20
    };
    
    // Only add filters if they have actual values
    if (filters.q && filters.q.trim()) searchParams.query = filters.q.trim();
    if (filters.location && filters.location.trim()) searchParams.city = filters.location.trim();
    if (filters.area && filters.area.trim()) searchParams.area = filters.area.trim();
    if (filters.condition && filters.condition.trim()) searchParams.condition = filters.condition.trim();
    if (filters.minPrice && parseInt(String(filters.minPrice)) > 0) searchParams.minPrice = parseInt(String(filters.minPrice));
    if (filters.maxPrice && parseInt(String(filters.maxPrice)) > 0) searchParams.maxPrice = parseInt(String(filters.maxPrice));

    // Use searchListings which properly filters by category ID
    const listings = await searchListings(searchParams);
    
    // Get total count for pagination
    const countParams: any = { category: category._id }; // Use category ID
    
    // Only add filters if they have actual values
    if (filters.q && filters.q.trim()) countParams.query = filters.q.trim();
    if (filters.location && filters.location.trim()) countParams.city = filters.location.trim();
    if (filters.area && filters.area.trim()) countParams.area = filters.area.trim();
    if (filters.condition && filters.condition.trim()) countParams.condition = filters.condition.trim();
    if (filters.minPrice && parseInt(String(filters.minPrice)) > 0) countParams.minPrice = parseInt(String(filters.minPrice));
    if (filters.maxPrice && parseInt(String(filters.maxPrice)) > 0) countParams.maxPrice = parseInt(String(filters.maxPrice));
    
    const totalCount = await searchListingsCount(countParams);
    
    // Get subcategories (if any)
    const subcategories = await getCategories()
    const categorySubcategories = subcategories.filter(sub => 
      sub.parent && sub.parent._ref === category._id
    );

    // Enhance listings with seller information (limited batch processing)
    const enhancedListings = await Promise.all(
      listings.map(async (listing) => {
        try {
          const seller = await getUserById(listing.supabaseId)
          if (!seller) return listing

          let sellerProfile = null
          if (seller.role === 'seller') {
            sellerProfile = await getSellerProfile(seller.id)
          }

          // Get seller's subscription to check for priority placement feature
          const subscription = await getUserActiveSubscription(seller.id);
          const hasPriorityPlacement = subscription?.subscription_packages?.features?.category_priority_placement === true;
          
          // Check for guaranteed top placement (from package features or seller tier features)
          let hasGuaranteedTopPlacement = false;
          if (subscription?.subscription_packages?.features?.guaranteed_top_placement === true) {
            hasGuaranteedTopPlacement = true;
          } else if (sellerProfile) {
            // Check seller tier features
            const tier = sellerProfile.tier;
            if (['platinum', 'diamond'].includes(tier)) {
              hasGuaranteedTopPlacement = true;
            }
          }
          
          // Check for search priority (Bronze tier feature)
          let hasSearchPriority = false;
          if (sellerProfile) {
            const tier = sellerProfile.tier;
            if (['bronze', 'silver', 'gold', 'platinum', 'diamond'].includes(tier)) {
              hasSearchPriority = true;
            }
          }
          
          // Check for category top placement (Gold tier feature)
          let hasCategoryTopPlacement = false;
          if (sellerProfile) {
            const tier = sellerProfile.tier;
            if (['gold', 'platinum', 'diamond'].includes(tier)) {
              hasCategoryTopPlacement = true;
            }
          }

          return {
            ...listing,
            seller: {
              id: seller.id,
              username: sellerProfile?.username || seller.email,
              tier: sellerProfile?.tier || 'basic',
              isVerified: seller.is_verified || false,
              is_top_seller: sellerProfile?.is_top_seller || false
            },
            hasPriorityPlacement, // Add priority placement flag
            hasGuaranteedTopPlacement, // Add guaranteed top placement flag
            hasSearchPriority, // Add search priority flag
            hasCategoryTopPlacement // Add category top placement flag for Gold tier
          }
        } catch (error) {
          console.error(`Error enhancing listing ${listing._id}:`, error)
          return listing
        }
      })
    )

    // Sort listings to prioritize listings with guaranteed top placement, then priority placement, 
    // then category top placement, then search priority, then featured
    enhancedListings.sort((a, b) => {
      // First, prioritize listings with guaranteed top placement
      if (a.hasGuaranteedTopPlacement && !b.hasGuaranteedTopPlacement) return -1;
      if (!a.hasGuaranteedTopPlacement && b.hasGuaranteedTopPlacement) return 1;
      
      // Then, prioritize listings with category priority placement
      if (a.hasPriorityPlacement && !b.hasPriorityPlacement) return -1;
      if (!a.hasPriorityPlacement && b.hasPriorityPlacement) return 1;
      
      // Then, prioritize listings with category top placement (Gold tier feature)
      if (a.hasCategoryTopPlacement && !b.hasCategoryTopPlacement) return -1;
      if (!a.hasCategoryTopPlacement && b.hasCategoryTopPlacement) return 1;
      
      // Then, prioritize listings with search priority (Bronze tier feature)
      if (a.hasSearchPriority && !b.hasSearchPriority) return -1;
      if (!a.hasSearchPriority && b.hasSearchPriority) return 1;
      
      // Then, prioritize featured listings
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      
      // Finally, sort by creation date (newest first)
      return new Date(b._createdAt).getTime() - new Date(a._createdAt).getTime();
    });

    const result = {
      category,
      listings: enhancedListings,
      totalCount: totalCount,
      subcategories: categorySubcategories.map(sub => ({
        _id: sub._id,
        title: sub.title,
        slug: typeof sub.slug === 'object' && sub.slug !== null && 'current' in sub.slug 
          ? sub.slug.current 
          : sub.slug,
        itemCount: Math.floor(Math.random() * 50) + 1 // Mock count for now
      }))
    };

    // Cache the result
    await cacheManager.set(cacheKey, result, { 
      ttl: CACHE_TTL.category,
      tags: [`category:${slug}`]
    });

    return result;
  } catch (error) {
    console.error('Error getting category with listings:', error);
    return {
      category: null,
      listings: [],
      totalCount: 0,
      subcategories: []
    }
  }
}