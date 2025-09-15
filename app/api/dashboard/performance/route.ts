import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getSellerPerformanceMetrics } from "@/lib/supabase-queries";

/**
 * GET /api/dashboard/performance
 * Fetch seller performance metrics and benchmarks
 *
 * This endpoint provides:
 * - Performance score breakdown
 * - Tier progress information
 * - Platform benchmarks
 * - Performance ranking
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

    // Fetch performance metrics
    const performanceMetrics = await getSellerPerformanceMetrics(user.id);

    return NextResponse.json({
      success: true,
      data: performanceMetrics,
    });
  } catch (error) {
    console.error("Error fetching performance metrics:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch performance metrics",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
