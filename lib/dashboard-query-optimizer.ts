/**
 * Dashboard Query Optimizer
 * Implements efficient database queries and caching strategies for dashboard data
 */

import { createClient } from "@/utils/supabase/client";
import { cacheManager } from "@/lib/cache-redis";
import { performanceTracker } from "@/lib/performance-metrics";

interface QueryOptions {
  useCache?: boolean;
  cacheTTL?: number;
  enablePagination?: boolean;
  pageSize?: number;
  enableAggregation?: boolean;
}

interface DashboardMetrics {
  totalListings: number;
  activeListings: number;
  totalViews: number;
  totalContacts: number;
  conversionRate: number;
  responseRate: number;
  avgRating: number;
  tierPoints: number;
}

interface AnalyticsTimeSeriesData {
  date: string;
  views: number;
  contacts: number;
  whatsappClicks: number;
  shares: number;
  saves: number;
}

export class DashboardQueryOptimizer {
  private supabase;
  private cache;

  constructor() {
    this.supabase = createClient();
    this.cache = cacheManager;
  }

  /**
   * Optimized seller metrics query with caching
   */
  async getSellerMetrics(sellerId: string, options: QueryOptions = {}): Promise<DashboardMetrics> {
    const {
      useCache = true,
      cacheTTL = 5 * 60 * 1000, // 5 minutes
    } = options;

    const cacheKey = `seller_metrics:${sellerId}`;

    // Validate sellerId is a proper UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(sellerId)) {
      console.warn("Invalid sellerId format (not a UUID):", sellerId);
      // Return empty metrics for invalid UUIDs to avoid database errors
      return {
        totalListings: 0,
        activeListings: 0,
        totalViews: 0,
        totalContacts: 0,
        conversionRate: 0,
        responseRate: 0,
        avgRating: 0,
        tierPoints: 0,
      };
    }

    // Try cache first
    if (useCache) {
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        return cached;
      }
    }

    const startTime = performance.now();

    try {
      console.log("Fetching enhanced_seller_analytics...");
      const { data: analytics, error: analyticsError } = await this.supabase
        .from("enhanced_seller_analytics")
        .select("*")
        .eq("seller_id", sellerId)
        .single();
      console.log("enhanced_seller_analytics data:", analytics);
      console.log("enhanced_seller_analytics error:", analyticsError);
      if (analyticsError) throw analyticsError;

      console.log("Fetching get_seller_listing_counts...");
      const { data: listingCounts, error: listingError } =
        await this.supabase.rpc("get_seller_listing_counts", {
          seller_id: sellerId,
        });
      console.log("get_seller_listing_counts data:", listingCounts);
      console.log("get_seller_listing_counts error:", listingError);
      if (listingError) throw listingError;

      console.log("Fetching seller_profiles...");
      const { data: profile, error: profileError } = await this.supabase
        .from("seller_profiles")
        .select("tier_points, avg_rating, response_rate")
        .eq("id", sellerId)
        .single();
      console.log("seller_profiles data:", profile);
      console.log("seller_profiles error:", profileError);
      if (profileError) throw profileError;

      const metrics: DashboardMetrics = {
        totalListings: listingCounts?.total_listings || 0,
        activeListings: listingCounts?.active_listings || 0,
        totalViews: analytics?.total_views || 0,
        totalContacts: analytics?.total_contacts || 0,
        conversionRate: analytics?.conversion_rate || 0,
        responseRate: profile?.response_rate || 0,
        avgRating: profile?.avg_rating || 0,
        tierPoints: profile?.tier_points || 0,
      };

      // Cache the result
      if (useCache) {
        await this.cache.set(cacheKey, metrics, cacheTTL);
      }

      // Record performance
      const duration = performance.now() - startTime;
      performanceTracker.recordResponseTime(duration);

      return metrics;
    } catch (error) {
      console.error("Error in getSellerMetrics:", JSON.stringify(error, null, 2));
      throw error;
    }
  }

  /**
   * Optimized analytics time series data with aggregation
   */
  async getAnalyticsTimeSeries(
    sellerId: string,
    startDate: string,
    endDate: string,
    granularity: "hour" | "day" | "week" | "month" = "day",
    options: QueryOptions = {}
  ): Promise<AnalyticsTimeSeriesData[]> {
    const {
      useCache = true,
      cacheTTL = 10 * 60 * 1000, // 10 minutes
    } = options;

    const cacheKey = `analytics_timeseries:${sellerId}:${startDate}:${endDate}:${granularity}`;

    // Try cache first
    if (useCache) {
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        return cached;
      }
    }

    const startTime = performance.now();

    try {
      // Use optimized RPC function for time series aggregation
      const { data, error } = await this.supabase.rpc(
        "get_analytics_timeseries",
        {
          seller_id: sellerId,
          start_date: startDate,
          end_date: endDate,
          granularity: granularity,
        }
      );

      if (error) throw error;

      const timeSeriesData: AnalyticsTimeSeriesData[] = data || [];

      // Cache the result
      if (useCache) {
        await this.cache.set(cacheKey, timeSeriesData, cacheTTL);
      }

      // Record performance
      const duration = performance.now() - startTime;
      performanceTracker.recordResponseTime(duration);

      return timeSeriesData;
    } catch (error) {
      console.error("Error fetching analytics time series:", error);
      throw error;
    }
  }

  /**
   * Optimized listing performance data with pagination
   */
  async getListingPerformance(
    sellerId: string,
    options: QueryOptions & {
      sortBy?: "views" | "contacts" | "conversion_rate" | "created_at";
      sortOrder?: "asc" | "desc";
      page?: number;
    } = {}
  ) {
    const {
      useCache = true,
      cacheTTL = 5 * 60 * 1000,
      enablePagination = true,
      pageSize = 20,
      sortBy = "views",
      sortOrder = "desc",
      page = 1,
    } = options;

    const cacheKey = `listing_performance:${sellerId}:${sortBy}:${sortOrder}:${page}:${pageSize}`;

    // Try cache first
    if (useCache) {
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        return cached;
      }
    }

    const startTime = performance.now();

    try {
      let query = this.supabase
        .from("listing_analytics_view")
        .select("*", { count: "exact" })
        .eq("seller_id", sellerId)
        .order(sortBy, { ascending: sortOrder === "asc" });

      if (enablePagination) {
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;
        query = query.range(from, to);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      const result = {
        data: data || [],
        totalCount: count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize),
      };

      // Cache the result
      if (useCache) {
        await this.cache.set(cacheKey, result, cacheTTL);
      }

      // Record performance
      const duration = performance.now() - startTime;
      performanceTracker.recordResponseTime(duration);

      return result;
    } catch (error) {
      console.error("Error fetching listing performance:", error);
      throw error;
    }
  }

  /**
   * Optimized geographic analytics
   */
  async getGeographicAnalytics(sellerId: string, options: QueryOptions = {}) {
    const {
      useCache = true,
      cacheTTL = 15 * 60 * 1000, // 15 minutes
    } = options;

    const cacheKey = `geographic_analytics:${sellerId}`;

    // Try cache first
    if (useCache) {
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        return cached;
      }
    }

    const startTime = performance.now();

    try {
      // Use optimized RPC for geographic aggregation
      const { data, error } = await this.supabase.rpc(
        "get_geographic_analytics",
        {
          seller_id: sellerId,
          limit_results: 20,
        }
      );

      if (error) throw error;

      const geographicData = data || [];

      // Cache the result
      if (useCache) {
        await this.cache.set(cacheKey, geographicData, cacheTTL);
      }

      // Record performance
      const duration = performance.now() - startTime;
      performanceTracker.recordResponseTime(duration);

      return geographicData;
    } catch (error) {
      console.error("Error fetching geographic analytics:", error);
      throw error;
    }
  }

  /**
   * Optimized device analytics
   */
  async getDeviceAnalytics(sellerId: string, options: QueryOptions = {}) {
    const { useCache = true, cacheTTL = 15 * 60 * 1000 } = options;

    const cacheKey = `device_analytics:${sellerId}`;

    // Try cache first
    if (useCache) {
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        return cached;
      }
    }

    const startTime = performance.now();

    try {
      // Use optimized query for device analytics
      const { data, error } = await this.supabase
        .from("analytics_events")
        .select(
          "device_type, COUNT(*) as count, AVG(session_duration) as avg_duration"
        )
        .eq("user_id", sellerId)
        .not("device_type", "is", null)
        .gte(
          "created_at",
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        )
        .group("device_type")
        .order("count", { ascending: false });

      if (error) throw error;

      const deviceData = data || [];

      // Cache the result
      if (useCache) {
        await this.cache.set(cacheKey, deviceData, cacheTTL);
      }

      // Record performance
      const duration = performance.now() - startTime;
      performanceTracker.recordResponseTime(duration);

      return deviceData;
    } catch (error) {
      console.error("Error fetching device analytics:", error);
      throw error;
    }
  }

  /**
   * Batch fetch multiple dashboard data points
   */
  async batchFetchDashboardData(sellerId: string) {
    const startTime = performance.now();

    try {
      // Execute multiple queries in parallel
      const [
        metrics,
        recentAnalytics,
        topListings,
        geographicData,
        deviceData,
      ] = await Promise.all([
        this.getSellerMetrics(sellerId),
        this.getAnalyticsTimeSeries(
          sellerId,
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          new Date().toISOString(),
          "day"
        ),
        this.getListingPerformance(sellerId, { pageSize: 5 }),
        this.getGeographicAnalytics(sellerId),
        this.getDeviceAnalytics(sellerId),
      ]);

      // Record performance
      const duration = performance.now() - startTime;
      performanceTracker.recordResponseTime(duration);

      return {
        metrics,
        recentAnalytics,
        topListings,
        geographicData,
        deviceData,
        loadTime: duration,
      };
    } catch (error) {
      console.error("Error in batch fetch:", error);
      throw error;
    }
  }

  /**
   * Invalidate cache for seller
   */
  async invalidateSellerCache(sellerId: string) {
    const patterns = [
      `seller_metrics:${sellerId}`,
      `analytics_timeseries:${sellerId}:*`,
      `listing_performance:${sellerId}:*`,
      `geographic_analytics:${sellerId}`,
      `device_analytics:${sellerId}`,
    ];

    for (const pattern of patterns) {
      await this.cache.del(pattern);
    }
  }

  /**
   * Preload dashboard data for faster access
   */
  async preloadDashboardData(sellerId: string) {
    // Preload common data in background
    Promise.all([
      this.getSellerMetrics(sellerId),
      this.getAnalyticsTimeSeries(
        sellerId,
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        new Date().toISOString()
      ),
      this.getListingPerformance(sellerId, { pageSize: 10 }),
    ]).catch((error) => {
      console.error("Error preloading dashboard data:", error);
    });
  }
}

// Create and export singleton instance
export const dashboardQueryOptimizer = new DashboardQueryOptimizer();

// Utility functions for query optimization
export function optimizeQuery(baseQuery: any, options: QueryOptions = {}) {
  const { enablePagination = false, pageSize = 20 } = options;

  let query = baseQuery;

  if (enablePagination) {
    query = query.range(0, pageSize - 1);
  }

  return query;
}

export function buildCacheKey(
  prefix: string,
  params: Record<string, any>
): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${key}:${params[key]}`)
    .join(":");

  return `${prefix}:${sortedParams}`;
}

export default dashboardQueryOptimizer;
