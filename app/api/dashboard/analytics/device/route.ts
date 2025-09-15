import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getSellerDeviceAnalytics } from "@/lib/supabase-queries";

/**
 * GET /api/dashboard/analytics/device
 * Fetch device analytics data for seller
 *
 * Query Parameters:
 * - timeRange: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom'
 * - startDate: ISO string (for custom range)
 * - endDate: ISO string (for custom range)
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

    // Fetch device analytics data
    const deviceData = await getSellerDeviceAnalytics(user.id, timeRangeObj);

    return NextResponse.json({
      success: true,
      data: deviceData,
      timeRange: timeRangeObj,
    });
  } catch (error) {
    console.error("Error fetching device analytics:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch device analytics data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
