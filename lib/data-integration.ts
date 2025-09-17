/**
 * =====================================================
 * RentParlo.pk Data Integration Layer
 * =====================================================
 * This layer combines data from Sanity CMS and Supabase database
 * to provide unified data access for the frontend
 */

export {
  getListingReviews,
  getSellerListingsCount,
} from "./data-integration-missing";

import {
  Listing,
  Seller,
  SellerProfile,
  User,
  SearchParams,
  SearchResults,
  Category,
  BlogPost,
  EnhancedUserSubscription,
} from "@/types";
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
  getListingReviews,
  getListingsBySellerId,
  getSellerListingCount,
} from "./sanity-queries";
import {
  getUserById,
  getSellerProfile,
  getSellerProfileByUsername,
  getListingAnalytics,
  getSellerAnalytics,
  trackAnalyticsEvent,
  getTopSellers,
  getUserActiveSubscription,
} from "./supabase-queries";
import { cacheManager } from "@/lib/cache-redis";

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
  featuredListings: Listing[];
  categories: Category[];
  banners: Banner[];
  recentBlogs: BlogPost[];
  topSellers: SellerProfile[];
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
  homepage: () => "homepage:data",
  analytics: (listingId: string) => `analytics:${listingId}`,
};

// Enhanced TTL Configuration (in seconds)
const CACHE_TTL = {
  homepage: 300, // 5 minutes
  category: 600, // 10 minutes
  categoryListings: 300, // 5 minutes
  listing: 180, // 3 minutes
  seller: 900, // 15 minutes
  sellerListings: 300, // 5 minutes
  search: 120, // 2 minutes
  userSession: 86400, // 24 hours
  analytics: 60, // 1 minute
  blogPost: 3600, // 1 hour
  blogList: 1800, // 30 minutes
};

/**
 * =====================================================
 * ENHANCED LISTING OPERATIONS
 * =====================================================
 */

// Get listing with seller information and analytics
export async function getEnhancedListingBySlug(
  slug: string,
  userId?: string
): Promise<Listing | null> {
  try {
    // Try to get from cache first
    const cacheKey = getCacheKey.listing(slug);
    const cached: Listing | null = await cacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Get listing from Sanity
    const listing = await getListingBySlug(slug, userId);
    if (!listing) return null;

    // Initialize seller as undefined
    let enhancedSeller: Seller | undefined = undefined;

    // Only try to get seller information if supabaseId exists
    if (listing.supabaseId) {
      try {
        // Get seller information from Supabase
        const seller = await getUserById(listing.supabaseId);
        console.log("Seller data for listing:", seller); // Debugging

        if (seller) {
          // Always try to get seller profile, regardless of role
          let sellerProfile: SellerProfile | null = null;

          // Try to get seller profile first
          sellerProfile = await getSellerProfile(seller.id);
          console.log("Seller profile data:", sellerProfile); // Debugging

          // Get accurate listing count from Sanity
          const listingCounts = await getSellerListingCount(seller.id);
          console.log("Seller listing counts from Sanity:", listingCounts); // Debugging

          // Update existing seller profile with accurate listing count
          if (sellerProfile) {
            sellerProfile.listing_count = listingCounts.activeListings;
          }

          // If no seller profile exists, but user is a seller, create a minimal one
          if (!sellerProfile && seller.role === "seller") {
            console.log("Creating minimal seller profile for seller user");
            sellerProfile = {
              id: seller.id,
              username: seller.email
                ? seller.email.split("@")[0]
                : `user-${seller.id.substring(0, 8)}`,
              is_verified: seller.is_verified || false,
              tier: "basic",
              tier_points: 0,
              tier_last_updated: seller.created_at || new Date().toISOString(),
              verification_status: "pending",
              verification_documents: {
                cnic_front: null,
                cnic_back: null,
                business_license: null,
              },
              created_at: seller.created_at || new Date().toISOString(),
              updated_at: seller.created_at || new Date().toISOString(),
              listing_count: listingCounts.activeListings,
              is_top_seller: false,
            };
          }

          // If we still don't have a seller profile but have user data, create minimal profile
          if (!sellerProfile) {
            console.log("Creating minimal seller profile from user data");
            sellerProfile = {
              id: seller.id,
              username: seller.email
                ? seller.email.split("@")[0]
                : `user-${seller.id.substring(0, 8)}`,
              is_verified: seller.is_verified || false,
              tier: "basic",
              tier_points: 0,
              tier_last_updated: seller.created_at || new Date().toISOString(),
              verification_status: "pending",
              verification_documents: {
                cnic_front: null,
                cnic_back: null,
                business_license: null,
              },
              avatar_url: seller.profile_image_url || null, // Add avatar_url from user's profile_image_url
              created_at: seller.created_at || new Date().toISOString(),
              updated_at: seller.created_at || new Date().toISOString(),
              listing_count: listingCounts.activeListings,
              is_top_seller: false,
            };
          }

          // Combine data
          enhancedSeller = {
            ...seller,
            guest_id: null,
            profile: sellerProfile || {
              id: seller.id,
              username: seller.email,
              is_verified: false,
              tier: "basic",
              tier_points: 0,
              tier_last_updated: new Date().toISOString(),
              verification_status: "pending",
              verification_documents: {
                cnic_front: null,
                cnic_back: null,
                business_license: null,
              },
              avatar_url: null, // No profile image available for fallback
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              listing_count: listingCounts.activeListings,
              is_top_seller: false,
            },
          };
        } else {
          console.log(
            "No seller found for listing with supabaseId:",
            listing.supabaseId
          ); // Debugging
        }
      } catch (sellerError) {
        console.error("Error fetching seller data:", sellerError);
        // Try to create minimal seller profile from listing data if possible
        try {
          // Create a very minimal seller profile with just the ID
          enhancedSeller = {
            id: listing.supabaseId,
            email: "unknown@example.com",
            role: "seller",
            is_verified: false,
            guest_id: null,
            created_at: new Date().toISOString(),
            active: true,
            email_verified: false,
            country: "Pakistan",
            notification_preferences: { email: true, sms: false, push: true },
            preferred_language: "en",
            onboarding_completed: false, // Add missing required field
            profile: {
              id: listing.supabaseId,
              username: `user-${listing.supabaseId.substring(0, 8)}`,
              is_verified: false,
              tier: "basic",
              tier_points: 0,
              tier_last_updated: new Date().toISOString(),
              verification_status: "pending",
              verification_documents: {
                cnic_front: null,
                cnic_back: null,
                business_license: null,
              },
              avatar_url: null, // No profile image available for fallback
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              listing_count: 0, // Default value for error case
              is_top_seller: false,
            },
          };
        } catch (minimalProfileError) {
          console.error(
            "Error creating minimal seller profile:",
            minimalProfileError
          );
        }
      }
    }

    // Get listing analytics
    const analytics = await getListingAnalytics(listing._id);

    // Combine data
    const enhancedListing: Listing = {
      ...listing,
      views: analytics.views,
      contactClicks: analytics.contactClicks,
      seller: enhancedSeller,
    };

    console.log("Enhanced listing with seller:", enhancedListing); // Debugging

    // Cache the result
    await cacheManager.set(cacheKey, enhancedListing, {
      ttl: CACHE_TTL.listing,
      tags: [`listing:${slug}`],
    });

    return enhancedListing;
  } catch (error) {
    console.error("Error getting enhanced listing:", error);
    return null;
  }
}

// Get listings with seller information
export async function getEnhancedListings(limit?: number): Promise<Listing[]> {
  try {
    const listings = await getFeaturedListings();

    // Enhance each listing with seller information
    const enhancedListings = await Promise.all(
      listings.slice(0, limit).map(async (listing) => {
        try {
          const seller = await getUserById(listing.supabaseId);
          if (!seller) return listing;

          let sellerProfile: SellerProfile | null = null;
          if (seller.role === "seller") {
            sellerProfile = await getSellerProfile(seller.id);
          }

          const analytics = await getListingAnalytics(listing._id);

          return {
            ...listing,
            views: analytics.views,
            contactClicks: analytics.contactClicks,
            seller: sellerProfile
              ? {
                  ...seller,
                  guest_id: seller.guest_id || null,
                  profile: sellerProfile,
                }
              : undefined,
          };
        } catch (error) {
          console.error(`Error enhancing listing ${listing._id}:`, error);
          return listing;
        }
      })
    );

    return enhancedListings;
  } catch (error) {
    console.error("Error getting enhanced listings:", error);
    return [];
  }
}

// Search listings with enhanced data
export async function searchEnhancedListings(
  params: SearchParams
): Promise<SearchResults> {
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
      maxPrice: params.maxPrice,
      sellerId: params.seller || "", // Add sellerId parameter
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
      limit: params.limit || 20,
      sellerId: params.seller || "", // Add sellerId parameter
    });

    // Enhance listings with seller information (limit concurrent requests)
    const batchSize = 5;
    const enhancedListings: Listing[] = [];

    for (let i = 0; i < paginatedListings.length; i += batchSize) {
      const batch = paginatedListings.slice(i, i + batchSize);
      const enhancedBatch = await Promise.all(
        batch.map(async (listing) => {
          try {
            const seller = await getUserById(listing.supabaseId);
            if (!seller) return listing;

            let sellerProfile: SellerProfile | null = null;
            if (seller.role === "seller") {
              sellerProfile = await getSellerProfile(seller.id);
            }

            return {
              ...listing,
              seller: sellerProfile
                ? {
                    ...seller,
                    guest_id: seller.guest_id || null,
                    profile: sellerProfile,
                  }
                : undefined,
            };
          } catch (error) {
            console.error(`Error enhancing listing ${listing._id}:`, error);
            return listing;
          }
        })
      );
      enhancedListings.push(...enhancedBatch);
    }

    const result: SearchResults = {
      results: enhancedListings,
      filters: params,
      total: total,
    };

    // Cache the result
    await cacheManager.set(cacheKey, result, {
      ttl: CACHE_TTL.search,
      tags: ["search"],
    });

    return result;
  } catch (error) {
    console.error("Error searching enhanced listings:", error);
    return {
      results: [],
      filters: params,
      total: 0,
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
    const sellerListings = await getListingsBySellerId(seller.id);
    console.log("Seller listings:", sellerListings);

    // Get seller analytics
    const analytics = await getSellerAnalytics(seller.id);

    // Get active subscription
    const subscription: EnhancedUserSubscription | null =
      await getUserActiveSubscription(seller.id);

    const result = {
      seller,
      listings: sellerListings,
      analytics,
      subscription,
    };

    // Cache the result
    await cacheManager.set(cacheKey, result, {
      ttl: CACHE_TTL.seller,
      tags: [`seller:${username}`],
    });

    return result;
  } catch (error) {
    console.error("Error getting complete seller profile:", error);
    return null;
  }
}

// Get seller dashboard data
export async function getSellerDashboardData(sellerId: string) {
  try {
    // Get seller profile
    const sellerProfile = await getSellerProfile(sellerId);
    if (!sellerProfile) return null;

    // Get seller's listings
    const listings = await searchListings({
      query: "",
      category: "",
      city: "",
      condition: "",
      minPrice: 0,
      maxPrice: 0,
      offset: 0,
      limit: 100,
    });

    const sellerListings = listings.filter(
      (listing) => listing.supabaseId === sellerId
    );

    // Get analytics for each listing
    const listingsWithAnalytics = await Promise.all(
      sellerListings.map(async (listing) => {
        const analytics = await getListingAnalytics(listing._id);
        return {
          ...listing,
          ...analytics,
        };
      })
    );

    // Get overall seller analytics
    const sellerAnalytics = await getSellerAnalytics(sellerId);

    // Get subscription information
    const subscription: EnhancedUserSubscription | null =
      await getUserActiveSubscription(sellerId);

    return {
      profile: sellerProfile,
      listings: listingsWithAnalytics,
      analytics: sellerAnalytics,
      subscription,
    };
  } catch (error) {
    console.error("Error getting seller dashboard data:", error);
    return null;
  }
}

// Get seller by username with enhanced data
export async function getSellerByUsername(username: string) {
  try {
    const seller = await getSellerProfileByUsername(username);
    if (!seller) return null;

    return seller;
  } catch (error: any) {
    console.error("Error fetching seller by username:", {
      username,
      error: error.message || error,
      stack: error.stack,
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
    const { limit = 20, status = "active", category, offset = 0 } = options;

    // Get all listings and filter by seller
    const allListings = await searchListings({
      query: "",
      category: category || "",
      city: "",
      condition: "",
      minPrice: 0,
      maxPrice: 0,
      offset: 0,
      limit: 1000, // Get more to filter properly
    });

    // Filter by seller ID
    let sellerListings = allListings.filter(
      (listing) => listing.supabaseId === sellerId
    );

    // Apply status filter if provided
    if (status) {
      sellerListings = sellerListings.filter(
        (listing) => listing.status === status
      );
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
            updatedAt: listing._updatedAt,
          };
        } catch (error) {
          console.error(
            `Error getting analytics for listing ${listing._id}:`,
            error
          );
          return listing;
        }
      })
    );

    return enhancedListings;
  } catch (error) {
    console.error("Error fetching seller listings:", error);
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

    const [featuredListings, categories, banners, recentBlogs, topSellers] =
      await Promise.all([
        getEnhancedListings(12),
        getCategories(),
        getHomepageBanners(),
        getBlogPosts(),
        getTopSellers(6),
      ]);

    // Ensure all category slugs are properly formatted
    const processedCategories = categories.slice(0, 8).map((category) => ({
      ...category,
      // Ensure slug is always in the correct format
      slug:
        typeof category.slug === "object" &&
        category.slug !== null &&
        "current" in category.slug
          ? category.slug.current
          : category.slug,
    }));

    const result: HomepageData = {
      featuredListings,
      categories: processedCategories, // Show top 8 categories with processed slugs
      banners,
      recentBlogs: recentBlogs.slice(0, 3), // Show 3 recent blogs
      topSellers,
    };

    // Cache the result
    await cacheManager.set(cacheKey, result, {
      ttl: CACHE_TTL.homepage,
      tags: ["homepage"],
    });

    return result;
  } catch (error) {
    console.error("Error getting homepage data:", error);
    return {
      featuredListings: [],
      categories: [],
      banners: [],
      recentBlogs: [],
      topSellers: [],
    };
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
    userAgent?: string;
    referrer?: string;
    city?: string;
    deviceType?: "mobile" | "tablet" | "desktop";
  }
) {
  try {
    await trackAnalyticsEvent({
      listing_id: listingId,
      event_type: "view",
      user_id: userId,
      ip_address: additionalData?.referrer,
      user_agent: additionalData?.userAgent,
      city: additionalData?.city,
      device_type: additionalData?.deviceType,
      referrer: additionalData?.referrer,
    });
  } catch (error) {
    console.error("Error tracking listing view:", error);
  }
}

// Track contact click
export async function trackContactClick(
  listingId: string,
  userId?: string,
  contactType: "phone" | "whatsapp" | "email" = "phone"
) {
  try {
    const eventType =
      contactType === "whatsapp" ? "WhatsApp_click" : "contact_click";

    await trackAnalyticsEvent({
      listing_id: listingId,
      event_type: eventType,
      user_id: userId,
    });
  } catch (error) {
    console.error("Error tracking contact click:", error);
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
      listing_id: "search", // Special identifier for search events
      event_type: "search",
      user_id: userId,
      referrer: `query:${query}|filters:${JSON.stringify(filters)}`,
    });
  } catch (error) {
    console.error("Error tracking search query:", error);
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
      status: "pending", // Start as pending for review
      published: false,
      _type: "listing",
    };

    // Create listing in Sanity
    const { createListing } = await import("./sanity-queries");
    const newListing = await createListing(enhancedListingData);

    if (newListing) {
      // Track listing creation in analytics
      await trackAnalyticsEvent({
        listing_id: newListing._id,
        event_type: "listing_click", // Using as listing creation event
        user_id: sellerId,
      });
    }

    return newListing;
  } catch (error) {
    console.error("Error creating new listing:", error);
    return null;
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
    const similarListings = await sanityGetSimilarListings(
      listingId,
      categoryTitle
    );
    return similarListings.slice(0, limit);
  } catch (error) {
    console.error("Error fetching similar listings:", error);
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
              // Get name from seller profile if available, otherwise use user name or email
              const sellerProfile = (user as any).seller_profiles?.[0];
              // Create a more user-friendly display name
              let userName =
                sellerProfile?.business_name ||
                sellerProfile?.username ||
                user.name;

              // If no proper name is available, create a friendly version from email
              if (!userName && user.email) {
                const emailName = user.email.split("@")[0];
                // Capitalize first letter and replace dots/underscores with spaces
                userName = emailName
                  .replace(/[._]/g, " ")
                  .split(" ")
                  .map(
                    (word) =>
                      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                  )
                  .join(" ");
              }

              // Final fallback to email if nothing else works
              if (!userName) {
                userName = user.email;
              }
              const userAvatar = sellerProfile?.avatar_url || null;

              // Debug logging
              console.log("Review user data:", {
                reviewId: review._id,
                userId: user.id,
                userName,
                userEmail: user.email,
                userDisplayName: user.name,
                sellerProfile: sellerProfile
                  ? {
                      business_name: sellerProfile.business_name,
                      username: sellerProfile.username,
                      avatar_url: sellerProfile.avatar_url,
                    }
                  : null,
              });

              return {
                ...review,
                userName,
                userAvatar,
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
    console.error("Error getting enhanced listing reviews:", error);
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
    return await operation();
  } catch (error) {
    console.error(errorMessage, error);
    return fallback;
  }
}

/**
 * =====================================================
 * VALIDATION HELPERS
 * =====================================================
 */

// Validate listing data before creation
export function validateListingData(data: any): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!data.title || data.title.length < 10) {
    errors.push("Title must be at least 10 characters long");
  }

  if (!data.description || data.description.length < 50) {
    errors.push("Description must be at least 50 characters long");
  }

  if (!data.price || data.price <= 0) {
    errors.push("Price must be greater than 0");
  }

  if (!data.category) {
    errors.push("Category is required");
  }

  if (!data.location || !data.location.city) {
    errors.push("Location city is required");
  }

  if (!data.condition) {
    errors.push("Condition is required");
  }

  if (!data.images || data.images.length === 0) {
    errors.push("At least one image is required");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * =====================================================
 * BULK OPERATIONS
 * =====================================================
 */

// Get multiple listings by IDs
export async function getListingsByIds(
  listingIds: string[]
): Promise<Listing[]> {
  try {
    const listings = await Promise.all(
      listingIds.map((id) => getListingBySlug(id).catch(() => null))
    );

    return listings.filter((listing): listing is Listing => listing !== null);
  } catch (error) {
    console.error("Error getting listings by IDs:", error);
    return [];
  }
}

// Batch update analytics
export async function batchTrackAnalytics(
  events: Array<{
    listingId: string;
    eventType: string;
    userId?: string;
    additionalData?: any;
  }>
) {
  try {
    await Promise.all(
      events.map((event) =>
        trackAnalyticsEvent({
          listing_id: event.listingId,
          event_type: event.eventType as any,
          user_id: event.userId,
          ...event.additionalData,
        })
      )
    );
  } catch (error) {
    console.error("Error batch tracking analytics:", error);
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
        subcategories: [],
      };
    }

    // Get listings for this category with filters using search function
    // Only include non-empty parameters to avoid filtering out results
    const searchParams: any = {
      category: slug, // Always include category slug
      offset: filters.offset || 0,
      limit: filters.limit || 20,
      sellerId: filters.sellerId || "", // Add sellerId parameter
    };

    // Only add filters if they have actual values
    if (filters.q && filters.q.trim()) searchParams.query = filters.q.trim();
    if (filters.location && filters.location.trim())
      searchParams.city = filters.location.trim();
    if (filters.area && filters.area.trim())
      searchParams.area = filters.area.trim();
    if (filters.condition && filters.condition.trim())
      searchParams.condition = filters.condition.trim();
    if (filters.minPrice && parseInt(String(filters.minPrice)) > 0)
      searchParams.minPrice = parseInt(String(filters.minPrice));
    if (filters.maxPrice && parseInt(String(filters.maxPrice)) > 0)
      searchParams.maxPrice = parseInt(String(filters.maxPrice));

    // Use searchListings which properly filters by category slug
    const listings = await searchListings(searchParams);

    // Get total count for pagination
    const totalCount = await searchListingsCount({
      query: searchParams.query,
      category: slug,
      city: searchParams.city,
      area: searchParams.area,
      condition: searchParams.condition,
      minPrice: searchParams.minPrice,
      maxPrice: searchParams.maxPrice,
      sellerId: searchParams.sellerId || "", // Add sellerId parameter
    });

    // Get subcategories (if any)
    const subcategories = await getCategories();
    const categorySubcategories = subcategories.filter(
      (sub) => sub.parent && sub.parent._ref === category._id
    );

    // Enhance listings with seller information (limited batch processing)
    const enhancedListings = await Promise.all(
      listings.map(async (listing) => {
        try {
          const seller = await getUserById(listing.supabaseId);
          if (!seller) return listing;

          let sellerProfile = null;
          if (seller.role === "seller") {
            sellerProfile = await getSellerProfile(seller.id);
          }

          return {
            ...listing,
            seller: {
              id: seller.id,
              username: sellerProfile?.username || seller.email,
              tier: sellerProfile?.tier || "basic",
              isVerified: seller.is_verified || false,
              rating: undefined, // SellerProfile doesn't have a rating field
              is_top_seller: sellerProfile?.is_top_seller || false,
            },
          };
        } catch (error) {
          console.error(`Error enhancing listing ${listing._id}:`, error);
          return listing;
        }
      })
    );

    const result = {
      category,
      listings: enhancedListings,
      totalCount: totalCount,
      subcategories: categorySubcategories.map((sub) => ({
        _id: sub._id,
        title: sub.title,
        slug:
          typeof sub.slug === "object" &&
          sub.slug !== null &&
          "current" in sub.slug
            ? sub.slug.current
            : sub.slug,
        itemCount: Math.floor(Math.random() * 50) + 1, // Mock count for now
      })),
    };

    // Cache the result
    await cacheManager.set(cacheKey, result, {
      ttl: CACHE_TTL.category,
      tags: [`category:${slug}`],
    });

    return result;
  } catch (error) {
    console.error("Error getting category with listings:", error);
    return {
      category: null,
      listings: [],
      totalCount: 0,
      subcategories: [],
    };
  }
}
