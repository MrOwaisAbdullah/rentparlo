/**
 * Dashboard Cache Utility
 * Implements Redis caching for dashboard analytics data
 * Provides performance optimization for frequently accessed data
 */

import Redis from "ioredis";

// Redis client configuration
const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
  connectTimeout: 5000,
  lazyConnect: true,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
});

// Connection management
let isConnected = false;

async function connectRedis() {
  if (!isConnected) {
    try {
      // ioredis connects automatically, just check status
      if (redis.status === "ready") {
        isConnected = true;
      } else {
        await redis.connect();
        isConnected = true;
      }
      console.log("Redis connected for dashboard caching");
    } catch (error) {
      console.error("Redis connection failed:", error);
      isConnected = false;
    }
  }
}

// Graceful error handling for Redis operations
async function safeRedisOperation<T>(
  operation: () => Promise<T>,
  fallback: T
): Promise<T> {
  try {
    await connectRedis();
    if (isConnected) {
      return await operation();
    }
  } catch (error) {
    console.warn("Redis operation failed, using fallback:", error);
  }
  return fallback;
}

// Cache key generators
export const CacheKeys = {
  sellerAnalytics: (sellerId: string, timeRange: string) =>
    `dashboard:analytics:${sellerId}:${timeRange}`,
  sellerSummary: (sellerId: string) => `dashboard:summary:${sellerId}`,
  sellerPerformance: (sellerId: string) => `dashboard:performance:${sellerId}`,
  listingAnalytics: (listingId: string, timeRange: string) =>
    `dashboard:listing:${listingId}:${timeRange}`,
  geographicAnalytics: (sellerId: string, timeRange: string) =>
    `dashboard:geographic:${sellerId}:${timeRange}`,
  deviceAnalytics: (sellerId: string, timeRange: string) =>
    `dashboard:device:${sellerId}:${timeRange}`,
  insights: (sellerId: string) => `dashboard:insights:${sellerId}`,
};

// Cache TTL (Time To Live) in seconds
export const CacheTTL = {
  analytics: 300, // 5 minutes for analytics data
  summary: 180, // 3 minutes for summary data
  performance: 600, // 10 minutes for performance metrics
  insights: 1800, // 30 minutes for insights (less frequent updates)
  geographic: 900, // 15 minutes for geographic data
  device: 900, // 15 minutes for device data
  listing: 300, // 5 minutes for individual listing analytics
};

/**
 * Get cached data
 */
export async function getCachedData<T>(key: string): Promise<T | null> {
  return safeRedisOperation(async () => {
    const cached = await redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }, null);
}

/**
 * Set cached data with TTL
 */
export async function setCachedData<T>(
  key: string,
  data: T,
  ttl: number = CacheTTL.analytics
): Promise<boolean> {
  return safeRedisOperation(async () => {
    await redis.setex(key, ttl, JSON.stringify(data));
    return true;
  }, false);
}

/**
 * Delete cached data
 */
export async function deleteCachedData(key: string): Promise<boolean> {
  return safeRedisOperation(async () => {
    await redis.del(key);
    return true;
  }, false);
}

/**
 * Delete multiple cached keys (pattern-based)
 */
export async function deleteCachedPattern(pattern: string): Promise<boolean> {
  return safeRedisOperation(async () => {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(keys);
    }
    return true;
  }, false);
}

/**
 * Invalidate seller cache when analytics events are updated
 */
export async function invalidateSellerCache(sellerId: string): Promise<void> {
  const patterns = [
    `dashboard:analytics:${sellerId}:*`,
    `dashboard:summary:${sellerId}`,
    `dashboard:performance:${sellerId}`,
    `dashboard:geographic:${sellerId}:*`,
    `dashboard:device:${sellerId}:*`,
    `dashboard:insights:${sellerId}`,
  ];

  await Promise.all(patterns.map((pattern) => deleteCachedPattern(pattern)));
}

/**
 * Cached wrapper for analytics functions
 */
export async function withCache<T>(
  key: string,
  ttl: number,
  fetchFunction: () => Promise<T>
): Promise<T> {
  // Try to get from cache first
  const cached = await getCachedData<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Fetch fresh data
  const data = await fetchFunction();

  // Cache the result
  await setCachedData(key, data, ttl);

  return data;
}

/**
 * Batch cache operations for multiple keys
 */
export async function batchGetCached<T>(keys: string[]): Promise<(T | null)[]> {
  return safeRedisOperation(
    async () => {
      const pipeline = redis.multi();
      keys.forEach((key) => pipeline.get(key));
      const results = await pipeline.exec();

      return (
        results?.map((result) => {
          if (result && result[1]) {
            try {
              return JSON.parse(result[1] as string);
            } catch {
              return null;
            }
          }
          return null;
        }) || keys.map(() => null)
      );
    },
    keys.map(() => null)
  );
}

/**
 * Batch set cache operations
 */
export async function batchSetCached<T>(
  items: Array<{ key: string; data: T; ttl?: number }>
): Promise<boolean> {
  return safeRedisOperation(async () => {
    const pipeline = redis.multi();
    items.forEach(({ key, data, ttl = CacheTTL.analytics }) => {
      pipeline.setex(key, ttl, JSON.stringify(data));
    });
    await pipeline.exec();
    return true;
  }, false);
}

/**
 * Get cache statistics
 */
export async function getCacheStats(): Promise<{
  totalKeys: number;
  dashboardKeys: number;
  memoryUsage: string;
  connected: boolean;
}> {
  return safeRedisOperation(
    async () => {
      const info = await redis.info("memory");
      const allKeys = await redis.keys("*");
      const dashboardKeys = await redis.keys("dashboard:*");

      const memoryMatch = info.match(/used_memory_human:(.+)/);
      const memoryUsage = memoryMatch ? memoryMatch[1].trim() : "Unknown";

      return {
        totalKeys: allKeys.length,
        dashboardKeys: dashboardKeys.length,
        memoryUsage,
        connected: isConnected,
      };
    },
    {
      totalKeys: 0,
      dashboardKeys: 0,
      memoryUsage: "Unknown",
      connected: false,
    }
  );
}

/**
 * Warm up cache with frequently accessed data
 */
export async function warmUpCache(sellerId: string): Promise<void> {
  try {
    // Import analytics functions dynamically to avoid circular dependencies
    const {
      getEnhancedSellerAnalytics,
      getSellerDashboardSummary,
      getSellerPerformanceMetrics,
    } = await import("./supabase-queries");

    // Warm up with current month data
    const timeRange = {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      end: new Date().toISOString(),
    };

    // Fetch and cache key data
    await Promise.all([
      withCache(
        CacheKeys.sellerAnalytics(sellerId, "month"),
        CacheTTL.analytics,
        () => getEnhancedSellerAnalytics(sellerId, timeRange)
      ),
      withCache(CacheKeys.sellerSummary(sellerId), CacheTTL.summary, () =>
        getSellerDashboardSummary(sellerId)
      ),
      withCache(
        CacheKeys.sellerPerformance(sellerId),
        CacheTTL.performance,
        () => getSellerPerformanceMetrics(sellerId)
      ),
    ]);

    console.log(`Cache warmed up for seller ${sellerId}`);
  } catch (error) {
    console.error("Cache warm-up failed:", error);
  }
}

/**
 * Cleanup expired cache entries
 */
export async function cleanupExpiredCache(): Promise<void> {
  // Redis automatically handles TTL expiration, but we can add custom cleanup logic here
  console.log("Cache cleanup completed");
}

// Graceful shutdown
process.on("SIGINT", async () => {
  if (isConnected) {
    await redis.disconnect();
    console.log("Redis connection closed");
  }
});

export default {
  getCachedData,
  setCachedData,
  deleteCachedData,
  deleteCachedPattern,
  invalidateSellerCache,
  withCache,
  batchGetCached,
  batchSetCached,
  getCacheStats,
  warmUpCache,
  cleanupExpiredCache,
  CacheKeys,
  CacheTTL,
};
