import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getAnalyticsInsights } from "@/lib/supabase-queries";

/**
 * GET /api/dashboard/insights
 * Fetch AI-generated insights and recommendations for seller
 *
 * This endpoint provides:
 * - Performance insights
 * - Trend analysis
 * - Actionable recommendations
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

    // Fetch insights data
    const insights = await getAnalyticsInsights(user.id);

    return NextResponse.json({
      success: true,
      data: insights,
    });
  } catch (error) {
    console.error("Error fetching analytics insights:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch analytics insights",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
