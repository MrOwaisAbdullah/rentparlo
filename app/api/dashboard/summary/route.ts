import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getSellerDashboardSummary } from "@/lib/supabase-queries";

/**
 * GET /api/dashboard/summary
 * Fetch dashboard summary data for seller overview page
 *
 * This endpoint provides:
 * - Key metrics overview
 * - Recent activity feed
 * - Notifications and alerts
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

    // Fetch dashboard summary data
    const summaryData = await getSellerDashboardSummary(user.id);

    return NextResponse.json({
      success: true,
      data: summaryData,
    });
  } catch (error) {
    console.error("Error fetching dashboard summary:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch dashboard summary",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
