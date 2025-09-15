import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import {
  invalidateSellerCache,
  warmUpCache,
  getCacheStats,
  deleteCachedPattern,
} from "@/lib/dashboard-cache";

/**
 * GET /api/dashboard/cache
 * Get cache statistics and status
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

    // Get cache statistics
    const cacheStats = await getCacheStats();

    return NextResponse.json({
      success: true,
      data: cacheStats,
    });
  } catch (error) {
    console.error("Error fetching cache stats:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch cache statistics",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/dashboard/cache
 * Manage cache operations (invalidate, warm up, etc.)
 */
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { action, sellerId, pattern } = body;

    let result: any = {};

    switch (action) {
      case "invalidate":
        if (sellerId) {
          await invalidateSellerCache(sellerId);
          result.message = `Cache invalidated for seller ${sellerId}`;
        } else {
          return NextResponse.json(
            {
              success: false,
              error: "sellerId required for invalidate action",
            },
            { status: 400 }
          );
        }
        break;

      case "warmup":
        if (sellerId) {
          await warmUpCache(sellerId);
          result.message = `Cache warmed up for seller ${sellerId}`;
        } else {
          return NextResponse.json(
            { success: false, error: "sellerId required for warmup action" },
            { status: 400 }
          );
        }
        break;

      case "clear_pattern":
        if (pattern) {
          await deleteCachedPattern(pattern);
          result.message = `Cache cleared for pattern: ${pattern}`;
        } else {
          return NextResponse.json(
            {
              success: false,
              error: "pattern required for clear_pattern action",
            },
            { status: 400 }
          );
        }
        break;

      case "invalidate_self":
        // Allow users to invalidate their own cache
        await invalidateSellerCache(user.id);
        result.message = "Your cache has been invalidated";
        break;

      case "warmup_self":
        // Allow users to warm up their own cache
        await warmUpCache(user.id);
        result.message = "Your cache has been warmed up";
        break;

      default:
        return NextResponse.json(
          {
            success: false,
            error:
              "Invalid action. Supported actions: invalidate, warmup, clear_pattern, invalidate_self, warmup_self",
          },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error managing cache:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to manage cache",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
