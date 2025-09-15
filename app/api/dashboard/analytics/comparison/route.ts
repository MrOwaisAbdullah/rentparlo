import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getSellerAnalyticsComparison } from "@/lib/supabase-queries";

/**
 * GET /api/dashboard/analytics/comparison
 * Fetch period-over-period analytics comparison
 *
 * Query Parameters:
 * - currentStart: ISO string (required)
 * - currentEnd: ISO string (required)
 * - previousStart: ISO string (required)
 * - previousEnd: ISO string (required)
 *
 * Or use predefined periods:
 * - period: 'week' | 'month' | 'quarter' | 'year'
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
    const currentStart = searchParams.get("currentStart");
    const currentEnd = searchParams.get("currentEnd");
    const previousStart = searchParams.get("previousStart");
    const previousEnd = searchParams.get("previousEnd");
    const period = searchParams.get("period");

    let currentPeriod: { start: string; end: string };
    let previousPeriod: { start: string; end: string };

    if (currentStart && currentEnd && previousStart && previousEnd) {
      // Use custom date ranges
      currentPeriod = { start: currentStart, end: currentEnd };
      previousPeriod = { start: previousStart, end: previousEnd };
    } else if (period) {
      // Use predefined periods
      const now = new Date();
      const currentEndDate = now.toISOString();
      let periodDuration: number;

      switch (period) {
        case "week":
          periodDuration = 7 * 24 * 60 * 60 * 1000;
          break;
        case "month":
          periodDuration = 30 * 24 * 60 * 60 * 1000;
          break;
        case "quarter":
          periodDuration = 90 * 24 * 60 * 60 * 1000;
          break;
        case "year":
          periodDuration = 365 * 24 * 60 * 60 * 1000;
          break;
        default:
          periodDuration = 30 * 24 * 60 * 60 * 1000; // Default to month
      }

      const currentStartDate = new Date(
        now.getTime() - periodDuration
      ).toISOString();
      const previousEndDate = currentStartDate;
      const previousStartDate = new Date(
        new Date(currentStartDate).getTime() - periodDuration
      ).toISOString();

      currentPeriod = { start: currentStartDate, end: currentEndDate };
      previousPeriod = { start: previousStartDate, end: previousEndDate };
    } else {
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing required parameters. Provide either custom date ranges or a predefined period.",
        },
        { status: 400 }
      );
    }

    // Fetch comparison data
    const comparison = await getSellerAnalyticsComparison(
      user.id,
      currentPeriod,
      previousPeriod
    );

    return NextResponse.json({
      success: true,
      data: comparison,
      periods: {
        current: currentPeriod,
        previous: previousPeriod,
      },
    });
  } catch (error) {
    console.error("Error fetching analytics comparison:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch analytics comparison",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
