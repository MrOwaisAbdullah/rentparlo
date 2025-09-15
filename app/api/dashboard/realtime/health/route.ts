import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { checkRealtimeHealth } from "@/lib/dashboard-realtime-handler";
import { getCacheStats } from "@/lib/dashboard-cache";

/**
 * GET /api/dashboard/realtime/health
 * Check the health of real-time dashboard systems
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user (optional for health check)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Get real-time system health
    const realtimeHealth = await checkRealtimeHealth();

    // Get cache statistics
    const cacheStats = await getCacheStats();

    // Get system metrics
    const systemMetrics = {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      nodeVersion: process.version,
    };

    return NextResponse.json({
      success: true,
      data: {
        realtime: realtimeHealth,
        cache: cacheStats,
        system: systemMetrics,
        authenticated: !!user,
      },
    });
  } catch (error) {
    console.error("Error checking real-time health:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to check real-time health",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
