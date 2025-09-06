/**
 * =====================================================
 * RentParlo.pk Browser-Compatible Data Integration Layer
 * =====================================================
 * This layer provides data access functions that can be used in Client Components
 * It only includes functions that don't require server-side functionality
 */

// Export only the Sanity query functions that don't require server client
export { 
  getCategories,
  getCategoryBySlug,
  getFeaturedListings,
  getListingsByCategory,
  searchListings,
  searchListingsCount,
  getBlogPosts,
  getBlogPostBySlug,
  getHomepageBanners,
  getListingReviews
} from './sanity-queries'

// Note: We're intentionally NOT exporting Supabase query functions that require server client
// This file is specifically for use in Client Components where server client is not available