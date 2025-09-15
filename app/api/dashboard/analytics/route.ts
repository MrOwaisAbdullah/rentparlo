import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import {
  getEnhancedSellerAnalytics,
  getSellerPerformanceMetrics,
  getSellerAnalyticsComparison,
  getAnalyticsInsights,
  getSellerDashboardSummary,
} from "@/lib/supabase-queries";
import {
  withCache,
  CacheKeys,
  CacheTTL,
  invalidateSellerCache,
} from "@/lib/dashboard-cache";

/**
 * GET /api/dashboard/analytics
 * Fetch comprehensive seller analytics data
 *
 * Query Parameters:
 * - timeRange: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom'
 * - startDate: ISO string (for custom range)
 * - endDate: ISO string (for custom range)
 * - includeComparison: boolean (include previous period comparison)
 * - includeInsights: boolean (include AI-generated insights)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get("timeRange") || "month";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const includeComparison = searchParams.get("includeComparison") === "true";
    const includeInsights = searchParams.get("includeInsights") === "true";

    // Calculate time range
    let timeRangeObj: { start: string; end: string } | undefined;

    if (timeRange === "custom" && startDate && endDate) {
      timeRangeObj = { start: startDate, end: endDate };
    } else {
      const now = new Date();
      const end = now.toISOString();
      let start: Date;

      switch (timeRange) {
        case "today":
          start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case "week":
          start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "month":
          start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case "quarter":
          start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case "year":
          start = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }

      timeRangeObj = { start: start.toISOString(), end };
    }

    // Generate cache keys
    const analyticsKey = CacheKeys.sellerAnalytics(user.id, timeRange);
    const performanceKey = CacheKeys.sellerPerformance(user.id);

    // Fetch analytics data with caching
    const [analytics, performanceMetrics] = await Promise.all([
      withCache(analyticsKey, CacheTTL.analytics, () =>
        getEnhancedSellerAnalytics(user.id, timeRangeObj)
      ),
      withCache(performanceKey, CacheTTL.performance, () =>
        getSellerPerformanceMetrics(user.id)
      ),
    ]);

    let comparison = null;
    let insights = null;

    // Include comparison if requested
    if (includeComparison && timeRangeObj) {
      const periodDuration =
        new Date(timeRangeObj.end).getTime() -
        new Date(timeRangeObj.start).getTime();
      const previousPeriod = {
        start: new Date(
          new Date(timeRangeObj.start).getTime() - periodDuration
        ).toISOString(),
        end: timeRangeObj.start,
      };

      comparison = await getSellerAnalyticsComparison(
        user.id,
        timeRangeObj,
        previousPeriod
      );
    }

    // Include insights if requested
    if (includeInsights) {
      insights = await getAnalyticsInsights(user.id);
    }

    return NextResponse.json({
      success: true,
      data: {
        analytics,
        performanceMetrics,
        comparison,
        insights,
        timeRange: timeRangeObj,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard analytics:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch analytics data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
