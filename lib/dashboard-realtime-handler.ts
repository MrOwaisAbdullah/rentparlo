/**
 * Real-time Dashboard Event Handler
 * Handles real-time updates and cache invalidation for dashboard data
 */

import { createClient } from "@/utils/supabase/server";
import { invalidateSellerCache, warmUpCache } from "./dashboard-cache";

/**
 * Handle analytics event creation/update
 * Invalidates relevant cache entries and optionally warms up new data
 */
export async function handleAnalyticsEventUpdate(payload: {
  eventType: "INSERT" | "UPDATE" | "DELETE";
  new?: any;
  old?: any;
}) {
  try {
    const { eventType, new: newRecord, old: oldRecord } = payload;

    // Determine which seller's cache to invalidate
    let sellerId: string | null = null;

    if (eventType === "INSERT" || eventType === "UPDATE") {
      sellerId = newRecord?.user_id;
    } else if (eventType === "DELETE") {
      sellerId = oldRecord?.user_id;
    }

    if (!sellerId) {
      console.warn("No seller ID found in analytics event payload");
      return;
    }

    console.log(
      `Invalidating cache for seller ${sellerId} due to ${eventType} event`
    );

    // Invalidate seller's cache
    await invalidateSellerCache(sellerId);

    // Optionally warm up cache with fresh data for active sellers
    if (eventType === "INSERT") {
      // Only warm up cache during business hours to avoid unnecessary load
      const hour = new Date().getHours();
      if (hour >= 8 && hour <= 22) {
        // 8 AM to 10 PM
        await warmUpCache(sellerId);
      }
    }
  } catch (error) {
    console.error("Error handling analytics event update:", error);
  }
}

/**
 * Handle seller profile updates
 * Invalidates performance-related cache entries
 */
export async function handleSellerProfileUpdate(payload: {
  eventType: "INSERT" | "UPDATE" | "DELETE";
  new?: any;
  old?: any;
}) {
  try {
    const { eventType, new: newRecord, old: oldRecord } = payload;

    let sellerId: string | null = null;

    if (eventType === "INSERT" || eventType === "UPDATE") {
      sellerId = newRecord?.id;
    } else if (eventType === "DELETE") {
      sellerId = oldRecord?.id;
    }

    if (!sellerId) {
      console.warn("No seller ID found in profile update payload");
      return;
    }

    console.log(
      `Invalidating performance cache for seller ${sellerId} due to profile ${eventType}`
    );

    // Invalidate performance-related cache only
    const { deleteCachedPattern, CacheKeys } = await import(
      "./dashboard-cache"
    );
    await deleteCachedPattern(`dashboard:performance:${sellerId}`);
    await deleteCachedPattern(`dashboard:insights:${sellerId}`);
  } catch (error) {
    console.error("Error handling seller profile update:", error);
  }
}

/**
 * Set up real-time subscriptions for dashboard updates
 */
export async function setupDashboardRealtimeSubscriptions() {
  const supabase = await createClient();

  try {
    // Subscribe to analytics events
    const analyticsChannel = supabase
      .channel("dashboard_analytics_updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "analytics_events",
        },
        handleAnalyticsEventUpdate
      )
      .subscribe();

    // Subscribe to seller profile updates
    const profileChannel = supabase
      .channel("dashboard_profile_updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "seller_profiles",
        },
        handleSellerProfileUpdate
      )
      .subscribe();

    console.log("Dashboard real-time subscriptions established");

    return {
      analyticsChannel,
      profileChannel,
      cleanup: () => {
        supabase.removeChannel(analyticsChannel);
        supabase.removeChannel(profileChannel);
      },
    };
  } catch (error) {
    console.error("Error setting up dashboard real-time subscriptions:", error);
    return null;
  }
}

/**
 * Batch process analytics events for performance
 * Groups multiple events and processes them together
 */
class AnalyticsEventBatcher {
  private batchQueue: Map<string, any[]> = new Map();
  private batchTimeout: NodeJS.Timeout | null = null;
  private readonly BATCH_SIZE = 10;
  private readonly BATCH_DELAY = 5000; // 5 seconds

  addEvent(sellerId: string, event: any) {
    if (!this.batchQueue.has(sellerId)) {
      this.batchQueue.set(sellerId, []);
    }

    this.batchQueue.get(sellerId)!.push(event);

    // Process batch if it reaches the size limit
    if (this.batchQueue.get(sellerId)!.length >= this.BATCH_SIZE) {
      this.processBatch(sellerId);
    } else {
      // Set timeout to process batch after delay
      this.scheduleBatchProcessing();
    }
  }

  private scheduleBatchProcessing() {
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
    }

    this.batchTimeout = setTimeout(() => {
      this.processAllBatches();
    }, this.BATCH_DELAY);
  }

  private async processBatch(sellerId: string) {
    const events = this.batchQueue.get(sellerId);
    if (!events || events.length === 0) return;

    console.log(
      `Processing batch of ${events.length} events for seller ${sellerId}`
    );

    try {
      // Invalidate cache once for all events
      await invalidateSellerCache(sellerId);

      // Clear the batch
      this.batchQueue.delete(sellerId);
    } catch (error) {
      console.error("Error processing event batch:", error);
    }
  }

  private async processAllBatches() {
    const sellerIds = Array.from(this.batchQueue.keys());

    await Promise.all(sellerIds.map((sellerId) => this.processBatch(sellerId)));

    this.batchTimeout = null;
  }
}

// Global batcher instance
const eventBatcher = new AnalyticsEventBatcher();

/**
 * Optimized analytics event handler with batching
 */
export async function handleAnalyticsEventUpdateBatched(payload: {
  eventType: "INSERT" | "UPDATE" | "DELETE";
  new?: any;
  old?: any;
}) {
  const { eventType, new: newRecord, old: oldRecord } = payload;

  let sellerId: string | null = null;

  if (eventType === "INSERT" || eventType === "UPDATE") {
    sellerId = newRecord?.user_id;
  } else if (eventType === "DELETE") {
    sellerId = oldRecord?.user_id;
  }

  if (sellerId) {
    eventBatcher.addEvent(sellerId, payload);
  }
}

/**
 * Health check for real-time system
 */
export async function checkRealtimeHealth(): Promise<{
  status: "healthy" | "degraded" | "unhealthy";
  details: {
    supabaseConnection: boolean;
    cacheConnection: boolean;
    subscriptions: number;
  };
}> {
  try {
    const supabase = await createClient();

    // Check Supabase connection
    const { error: supabaseError } = await supabase
      .from("analytics_events")
      .select("count")
      .limit(1);

    const supabaseConnection = !supabaseError;

    // Check cache connection
    const { getCacheStats } = await import("./dashboard-cache");
    const cacheStats = await getCacheStats();
    const cacheConnection = cacheStats.connected;

    // Determine overall health
    let status: "healthy" | "degraded" | "unhealthy";

    if (supabaseConnection && cacheConnection) {
      status = "healthy";
    } else if (supabaseConnection || cacheConnection) {
      status = "degraded";
    } else {
      status = "unhealthy";
    }

    return {
      status,
      details: {
        supabaseConnection,
        cacheConnection,
        subscriptions: 2, // Analytics and profile subscriptions
      },
    };
  } catch (error) {
    console.error("Real-time health check failed:", error);
    return {
      status: "unhealthy",
      details: {
        supabaseConnection: false,
        cacheConnection: false,
        subscriptions: 0,
      },
    };
  }
}

export default {
  handleAnalyticsEventUpdate,
  handleSellerProfileUpdate,
  setupDashboardRealtimeSubscriptions,
  handleAnalyticsEventUpdateBatched,
  checkRealtimeHealth,
};
