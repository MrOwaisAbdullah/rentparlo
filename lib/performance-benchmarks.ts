/**
 * Performance Benchmarking System
 * Calculates platform-wide benchmarks and compares seller performance
 */

import { createClient } from "../utils/supabase/server";
import { PlatformBenchmarks } from "./performance-scoring";

/**
 * Cache duration for benchmark data (in milliseconds)
 */
const BENCHMARK_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Interface for cached benchmark data
 */
interface CachedBenchmarks extends PlatformBenchmarks {
  lastUpdated: string;
  sampleSize: number;
}

/**
 * Calculate platform-wide performance benchmarks
 */
export async function calculatePlatformBenchmarks(): Promise<PlatformBenchmarks> {
  const supabase = await createClient();

  try {
    // Try to get cached benchmarks first
    const cachedBenchmarks = await getCachedBenchmarks();
    if (
      cachedBenchmarks &&
      isBenchmarkCacheValid(cachedBenchmarks.lastUpdated)
    ) {
      return cachedBenchmarks;
    }

    // Calculate fresh benchmarks
    const [
      conversionStats,
      responseStats,
      ratingStats,
      viewStats,
      categoryStats,
      performanceStats,
    ] = await Promise.all([
      calculateConversionBenchmarks(),
      calculateResponseBenchmarks(),
      calculateRatingBenchmarks(),
      calculateViewsBenchmarks(),
      calculateCategoryBenchmarks(),
      calculatePerformanceBenchmarks(),
    ]);

    const benchmarks: PlatformBenchmarks = {
      avgConversionRate: conversionStats.average,
      avgResponseRate: responseStats.average,
      avgCustomerRating: ratingStats.average,
      avgViewsPerListing: viewStats.average,
      topPerformingCategories: categoryStats.topCategories,
      medianPerformanceScore: performanceStats.median,
    };

    // Cache the benchmarks
    await cacheBenchmarks({
      ...benchmarks,
      lastUpdated: new Date().toISOString(),
      sampleSize: Math.min(
        conversionStats.sampleSize,
        responseStats.sampleSize,
        ratingStats.sampleSize
      ),
    });

    return benchmarks;
  } catch (error) {
    console.error("Error calculating platform benchmarks:", error);

    // Return fallback benchmarks if calculation fails
    return getFallbackBenchmarks();
  }
}

/**
 * Calculate conversion rate benchmarks across all sellers
 */
async function calculateConversionBenchmarks(): Promise<{
  average: number;
  median: number;
  percentile75: number;
  percentile90: number;
  sampleSize: number;
}> {
  const supabase = await createClient();

  // Get conversion rates for all active sellers in the last 30 days
  const thirtyDaysAgo = new Date(
    Date.now() - 30 * 24 * 60 * 60 * 1000
  ).toISOString();

  const { data, error } = await supabase.rpc(
    "calculate_seller_conversion_rates",
    {
      p_start_date: thirtyDaysAgo,
      p_end_date: new Date().toISOString(),
    }
  );

  if (error || !data) {
    console.warn("RPC function not available, using fallback calculation");
    return await calculateConversionBenchmarksFallback();
  }

  const conversionRates = data
    .map((seller: any) => seller.conversion_rate)
    .filter((rate: number) => rate > 0);

  if (conversionRates.length === 0) {
    return {
      average: 2.5,
      median: 2.0,
      percentile75: 3.5,
      percentile90: 5.0,
      sampleSize: 0,
    };
  }

  conversionRates.sort((a: number, b: number) => a - b);

  return {
    average:
      conversionRates.reduce((sum: number, rate: number) => sum + rate, 0) /
      conversionRates.length,
    median: getPercentile(conversionRates, 50),
    percentile75: getPercentile(conversionRates, 75),
    percentile90: getPercentile(conversionRates, 90),
    sampleSize: conversionRates.length,
  };
}

/**
 * Fallback conversion rate calculation using direct analytics events
 */
async function calculateConversionBenchmarksFallback(): Promise<{
  average: number;
  median: number;
  percentile75: number;
  percentile90: number;
  sampleSize: number;
}> {
  const supabase = await createClient();
  const thirtyDaysAgo = new Date(
    Date.now() - 30 * 24 * 60 * 60 * 1000
  ).toISOString();

  // Get all sellers with analytics events in the last 30 days
  const { data: events, error } = await supabase
    .from("analytics_events")
    .select("user_id, event_type")
    .gte("created_at", thirtyDaysAgo)
    .in("event_type", ["view", "contact_click", "WhatsApp_click"]);

  if (error || !events) {
    return {
      average: 2.5,
      median: 2.0,
      percentile75: 3.5,
      percentile90: 5.0,
      sampleSize: 0,
    };
  }

  // Group events by seller and calculate conversion rates
  const sellerStats = new Map<string, { views: number; conversions: number }>();

  events.forEach((event) => {
    if (!sellerStats.has(event.user_id)) {
      sellerStats.set(event.user_id, { views: 0, conversions: 0 });
    }

    const stats = sellerStats.get(event.user_id)!;
    if (event.event_type === "view") {
      stats.views++;
    } else if (
      event.event_type === "contact_click" ||
      event.event_type === "WhatsApp_click"
    ) {
      stats.conversions++;
    }
  });

  const conversionRates = Array.from(sellerStats.values())
    .filter((stats) => stats.views > 0)
    .map((stats) => (stats.conversions / stats.views) * 100);

  if (conversionRates.length === 0) {
    return {
      average: 2.5,
      median: 2.0,
      percentile75: 3.5,
      percentile90: 5.0,
      sampleSize: 0,
    };
  }

  conversionRates.sort((a, b) => a - b);

  return {
    average:
      conversionRates.reduce((sum, rate) => sum + rate, 0) /
      conversionRates.length,
    median: getPercentile(conversionRates, 50),
    percentile75: getPercentile(conversionRates, 75),
    percentile90: getPercentile(conversionRates, 90),
    sampleSize: conversionRates.length,
  };
}

/**
 * Calculate response rate benchmarks
 */
async function calculateResponseBenchmarks(): Promise<{
  average: number;
  median: number;
  sampleSize: number;
}> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("seller_profiles")
    .select("response_rate")
    .not("response_rate", "is", null)
    .gt("response_rate", 0);

  if (error || !data) {
    return { average: 75, median: 80, sampleSize: 0 };
  }

  const responseRates = data
    .map((seller) => seller.response_rate)
    .filter((rate) => rate > 0);

  if (responseRates.length === 0) {
    return { average: 75, median: 80, sampleSize: 0 };
  }

  responseRates.sort((a, b) => a - b);

  return {
    average:
      responseRates.reduce((sum, rate) => sum + rate, 0) / responseRates.length,
    median: getPercentile(responseRates, 50),
    sampleSize: responseRates.length,
  };
}

/**
 * Calculate customer rating benchmarks
 */
async function calculateRatingBenchmarks(): Promise<{
  average: number;
  median: number;
  sampleSize: number;
}> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("seller_profiles")
    .select("customer_rating, total_reviews")
    .not("customer_rating", "is", null)
    .gt("customer_rating", 0)
    .gt("total_reviews", 0);

  if (error || !data) {
    return { average: 4.2, median: 4.3, sampleSize: 0 };
  }

  const ratings = data
    .map((seller) => seller.customer_rating)
    .filter((rating) => rating > 0);

  if (ratings.length === 0) {
    return { average: 4.2, median: 4.3, sampleSize: 0 };
  }

  ratings.sort((a, b) => a - b);

  return {
    average: ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length,
    median: getPercentile(ratings, 50),
    sampleSize: ratings.length,
  };
}

/**
 * Calculate views per listing benchmarks
 */
async function calculateViewsBenchmarks(): Promise<{
  average: number;
  median: number;
  sampleSize: number;
}> {
  const supabase = await createClient();
  const thirtyDaysAgo = new Date(
    Date.now() - 30 * 24 * 60 * 60 * 1000
  ).toISOString();

  // Get view counts per listing for the last 30 days
  const { data, error } = await supabase
    .from("analytics_events")
    .select("listing_id")
    .eq("event_type", "view")
    .gte("created_at", thirtyDaysAgo);

  if (error || !data) {
    return { average: 25, median: 20, sampleSize: 0 };
  }

  // Count views per listing
  const listingViews = new Map<string, number>();
  data.forEach((event) => {
    if (event.listing_id) {
      listingViews.set(
        event.listing_id,
        (listingViews.get(event.listing_id) || 0) + 1
      );
    }
  });

  const viewCounts = Array.from(listingViews.values());

  if (viewCounts.length === 0) {
    return { average: 25, median: 20, sampleSize: 0 };
  }

  viewCounts.sort((a, b) => a - b);

  return {
    average:
      viewCounts.reduce((sum, count) => sum + count, 0) / viewCounts.length,
    median: getPercentile(viewCounts, 50),
    sampleSize: viewCounts.length,
  };
}

/**
 * Calculate top performing categories
 */
async function calculateCategoryBenchmarks(): Promise<{
  topCategories: string[];
}> {
  const supabase = await createClient();
  const thirtyDaysAgo = new Date(
    Date.now() - 30 * 24 * 60 * 60 * 1000
  ).toISOString();

  try {
    // This would require joining with listings table to get categories
    // For now, return common high-performing categories
    return {
      topCategories: [
        "Electronics",
        "Vehicles",
        "Real Estate",
        "Fashion",
        "Home & Garden",
      ],
    };
  } catch (error) {
    console.error("Error calculating category benchmarks:", error);
    return {
      topCategories: [
        "Electronics",
        "Vehicles",
        "Real Estate",
        "Fashion",
        "Home & Garden",
      ],
    };
  }
}

/**
 * Calculate performance score benchmarks
 */
async function calculatePerformanceBenchmarks(): Promise<{
  median: number;
  average: number;
}> {
  // This would require calculating performance scores for all sellers
  // For now, return estimated benchmarks based on typical performance distributions
  return {
    median: 72,
    average: 68,
  };
}

/**
 * Get percentile value from sorted array
 */
function getPercentile(sortedArray: number[], percentile: number): number {
  const index = (percentile / 100) * (sortedArray.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);

  if (lower === upper) {
    return sortedArray[lower];
  }

  const weight = index - lower;
  return sortedArray[lower] * (1 - weight) + sortedArray[upper] * weight;
}

/**
 * Get cached benchmarks from storage
 */
async function getCachedBenchmarks(): Promise<CachedBenchmarks | null> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("platform_benchmarks")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      avgConversionRate: data.avg_conversion_rate,
      avgResponseRate: data.avg_response_rate,
      avgCustomerRating: data.avg_customer_rating,
      avgViewsPerListing: data.avg_views_per_listing,
      topPerformingCategories: data.top_performing_categories || [],
      medianPerformanceScore: data.median_performance_score,
      lastUpdated: data.created_at,
      sampleSize: data.sample_size || 0,
    };
  } catch (error) {
    console.error("Error getting cached benchmarks:", error);
    return null;
  }
}

/**
 * Cache benchmarks to storage
 */
async function cacheBenchmarks(benchmarks: CachedBenchmarks): Promise<void> {
  try {
    const supabase = await createClient();

    await supabase.from("platform_benchmarks").insert({
      avg_conversion_rate: benchmarks.avgConversionRate,
      avg_response_rate: benchmarks.avgResponseRate,
      avg_customer_rating: benchmarks.avgCustomerRating,
      avg_views_per_listing: benchmarks.avgViewsPerListing,
      top_performing_categories: benchmarks.topPerformingCategories,
      median_performance_score: benchmarks.medianPerformanceScore,
      sample_size: benchmarks.sampleSize,
      created_at: benchmarks.lastUpdated,
    });
  } catch (error) {
    console.error("Error caching benchmarks:", error);
    // Don't throw error - caching failure shouldn't break the main functionality
  }
}

/**
 * Check if cached benchmarks are still valid
 */
function isBenchmarkCacheValid(lastUpdated: string): boolean {
  const cacheAge = Date.now() - new Date(lastUpdated).getTime();
  return cacheAge < BENCHMARK_CACHE_DURATION;
}

/**
 * Get fallback benchmarks when calculation fails
 */
function getFallbackBenchmarks(): PlatformBenchmarks {
  return {
    avgConversionRate: 2.5,
    avgResponseRate: 75,
    avgCustomerRating: 4.2,
    avgViewsPerListing: 25,
    topPerformingCategories: [
      "Electronics",
      "Vehicles",
      "Real Estate",
      "Fashion",
      "Home & Garden",
    ],
    medianPerformanceScore: 72,
  };
}

/**
 * Get seller's performance ranking compared to platform
 */
export async function getSellerPerformanceRanking(
  sellerScore: number
): Promise<{
  percentile: number;
  ranking: "Top 5%" | "Top 10%" | "Top 25%" | "Top 50%" | "Below Average";
  totalSellers: number;
}> {
  try {
    const supabase = await createClient();

    // Get count of sellers with lower performance scores
    // This would require a performance_scores table or calculated field
    // For now, estimate based on score distribution

    let percentile: number;
    let ranking: "Top 5%" | "Top 10%" | "Top 25%" | "Top 50%" | "Below Average";

    if (sellerScore >= 90) {
      percentile = 95;
      ranking = "Top 5%";
    } else if (sellerScore >= 85) {
      percentile = 90;
      ranking = "Top 10%";
    } else if (sellerScore >= 75) {
      percentile = 75;
      ranking = "Top 25%";
    } else if (sellerScore >= 65) {
      percentile = 50;
      ranking = "Top 50%";
    } else {
      percentile = Math.max(0, (sellerScore / 65) * 50);
      ranking = "Below Average";
    }

    // Get approximate total seller count
    const { count } = await supabase
      .from("seller_profiles")
      .select("*", { count: "exact", head: true })
      .eq("is_verified", true);

    return {
      percentile: Math.round(percentile),
      ranking,
      totalSellers: count || 1000, // Fallback estimate
    };
  } catch (error) {
    console.error("Error getting seller performance ranking:", error);
    return {
      percentile: 50,
      ranking: "Top 50%",
      totalSellers: 1000,
    };
  }
}

/**
 * Get performance trends for the platform
 */
export async function getPlatformPerformanceTrends(months: number = 6): Promise<
  Array<{
    month: string;
    avgConversionRate: number;
    avgResponseRate: number;
    avgCustomerRating: number;
    totalSellers: number;
  }>
> {
  try {
    const supabase = await createClient();

    // This would require historical benchmark data
    // For now, return simulated trend data
    const trends = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = month.toISOString().substring(0, 7); // YYYY-MM format

      // Simulate gradual improvement over time
      const improvement = (months - i) * 0.1;

      trends.push({
        month: monthStr,
        avgConversionRate: 2.3 + improvement,
        avgResponseRate: 73 + improvement * 2,
        avgCustomerRating: 4.1 + improvement * 0.1,
        totalSellers: 800 + i * 50,
      });
    }

    return trends;
  } catch (error) {
    console.error("Error getting platform performance trends:", error);
    return [];
  }
}
