// lib/cache-invalidation.ts
import { cacheManager } from './cache-redis';
import { getCacheKey, CACHE_TTL } from './data-integration';
import { getListingDetail } from './sanity-queries';

/**
 * Handle listing update event for cache invalidation
 */
export async function handleListingUpdate(listingId: string, categoryId: string) {
  try {
    // Invalidate specific listing cache
    const listingKey = getCacheKey.listing(listingId);
    await cacheManager.set(listingKey, null, { ttl: 0 }); // Setting ttl to 0 effectively removes it
    
    // Invalidate category cache
    await cacheManager.invalidateTags([`category:${categoryId}`]);
    
    // Invalidate search cache
    await cacheManager.invalidateTags(['search']);
    
    // Invalidate homepage if this was a featured listing
    const listing = await getListingDetail(listingId);
    if (listing && listing.featured) {
      await cacheManager.invalidateTags(['homepage']);
    }
  } catch (error) {
    console.error('Error in handleListingUpdate:', error);
  }
}

/**
 * Handle manual cache clearing
 */
export async function clearCache(tags: string[]) {
  try {
    await cacheManager.invalidateTags(tags);
  } catch (error) {
    console.error('Error in clearCache:', error);
  }
}

/**
 * Warm cache with homepage data
 */
export async function warmHomepageCache() {
  try {
    // Import the function to avoid circular dependencies
    const { getHomepageData } = await import('./data-integration');
    
    // Warm homepage cache
    const homepageData = await getHomepageData();
    await cacheManager.set(getCacheKey.homepage(), homepageData, {
      ttl: CACHE_TTL.homepage, // 5 minutes
      tags: ['homepage']
    });
  } catch (error) {
    console.error('Error warming homepage cache:', error);
  }
}

/**
 * Warm cache with top categories data
 */
export async function warmCategoryCache() {
  try {
    // Import the function to avoid circular dependencies
    const { getCategories } = await import('./sanity-queries');
    
    // Warm top category caches
    const categories = await getCategories();
    for (const category of categories.slice(0, 5)) { // Top 5 categories
      // Import the function to avoid circular dependencies
      const { getCategoryListings } = await import('./data-integration');
      
      const listings = await getCategoryListings(category.slug);
      const cacheKey = `category:${category.slug}:listings:1:20`;
      await cacheManager.set(cacheKey, listings, {
        ttl: CACHE_TTL.category, // 10 minutes
        tags: [`category:${category.slug}`]
      });
    }
  } catch (error) {
    console.error('Error warming category cache:', error);
  }
}

/**
 * Warm cache with top sellers data
 */
export async function warmSellerCache() {
  try {
    // Import the function to avoid circular dependencies
    const { getTopSellers } = await import('./supabase-queries');
    
    // Warm top seller caches
    const topSellers = await getTopSellers(10);
    for (const seller of topSellers) {
      // Import the function to avoid circular dependencies
      const { getSellerProfile } = await import('./supabase-queries');
      
      const profile = await getSellerProfile(seller.username);
      const cacheKey = getCacheKey.seller(seller.username);
      await cacheManager.set(cacheKey, profile, {
        ttl: CACHE_TTL.seller, // 15 minutes
        tags: [`seller:${seller.username}`]
      });
    }
  } catch (error) {
    console.error('Error warming seller cache:', error);
  }
}

/**
 * Warm all caches
 */
export async function warmAllCaches() {
  await Promise.all([
    warmHomepageCache(),
    warmCategoryCache(),
    warmSellerCache()
  ]);
}

/**
 * Scheduled cache warming function
 */
export async function scheduledCacheWarming() {
  try {
    console.log('Starting scheduled cache warming...');
    
    // Warm all caches
    await warmAllCaches();
    
    console.log('Scheduled cache warming completed successfully');
  } catch (error) {
    console.error('Error in scheduled cache warming:', error);
  }
}