import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/utils/supabase/client";

interface DashboardRealtimeOptions {
  sellerId: string;
  updateInterval?: number; // in milliseconds, default 30 seconds
  enablePolling?: boolean;
  enableWebSocket?: boolean;
}

interface DashboardRealtimeData {
  analytics: any;
  summary: any;
  lastUpdated: string;
}

export function useDashboardRealtime({
  sellerId,
  updateInterval = 30000, // 30 seconds
  enablePolling = true,
  enableWebSocket = true,
}: DashboardRealtimeOptions) {
  const [data, setData] = useState<DashboardRealtimeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const supabaseRef = useRef(createClient());
  const channelRef = useRef<any>(null);

  // Fetch latest data from API
  const fetchData = useCallback(async () => {
    try {
      setError(null);

      // Fetch both analytics and summary data
      const [analyticsResponse, summaryResponse] = await Promise.all([
        fetch(
          "/api/dashboard/analytics?timeRange=today&includeComparison=false"
        ),
        fetch("/api/dashboard/summary"),
      ]);

      if (!analyticsResponse.ok || !summaryResponse.ok) {
        throw new Error("Failed to fetch dashboard data");
      }

      const [analyticsData, summaryData] = await Promise.all([
        analyticsResponse.json(),
        summaryResponse.json(),
      ]);

      if (!analyticsData.success || !summaryData.success) {
        throw new Error("API returned error response");
      }

      const newData: DashboardRealtimeData = {
        analytics: analyticsData.data,
        summary: summaryData.data,
        lastUpdated: new Date().toISOString(),
      };

      setData(newData);
      setIsLoading(false);
      setIsConnected(true);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
      setIsLoading(false);
      setIsConnected(false);
    }
  }, []);

  // Set up polling mechanism
  const startPolling = useCallback(() => {
    if (!enablePolling) return;

    // Clear existing interval
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    // Fetch initial data
    fetchData();

    // Set up polling interval
    pollingIntervalRef.current = setInterval(fetchData, updateInterval);
  }, [fetchData, updateInterval, enablePolling]);

  // Stop polling
  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  // Set up WebSocket connection for real-time updates
  const setupWebSocket = useCallback(() => {
    if (!enableWebSocket) return;

    const supabase = supabaseRef.current;

    // Subscribe to analytics events for this seller
    const channel = supabase
      .channel(`seller_dashboard_${sellerId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "analytics_events",
          filter: `user_id=eq.${sellerId}`,
        },
        (payload) => {
          console.log("Real-time analytics update:", payload);
          // Fetch fresh data when analytics events change
          fetchData();
        }
      )
      .subscribe((status) => {
        console.log("WebSocket subscription status:", status);
        setIsConnected(status === "SUBSCRIBED");
      });

    channelRef.current = channel;
  }, [sellerId, fetchData, enableWebSocket]);

  // Clean up WebSocket connection
  const cleanupWebSocket = useCallback(() => {
    if (channelRef.current) {
      supabaseRef.current.removeChannel(channelRef.current);
      channelRef.current = null;
    }
  }, []);

  // Manual refresh function
  const refresh = useCallback(() => {
    setIsLoading(true);
    fetchData();
  }, [fetchData]);

  // Pause/resume real-time updates
  const pause = useCallback(() => {
    stopPolling();
    cleanupWebSocket();
    setIsConnected(false);
  }, [stopPolling, cleanupWebSocket]);

  const resume = useCallback(() => {
    startPolling();
    setupWebSocket();
  }, [startPolling, setupWebSocket]);

  // Initialize on mount
  useEffect(() => {
    startPolling();
    setupWebSocket();

    // Cleanup on unmount
    return () => {
      stopPolling();
      cleanupWebSocket();
    };
  }, [startPolling, setupWebSocket, stopPolling, cleanupWebSocket]);

  // Handle visibility change to pause/resume updates when tab is not active
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        pause();
      } else {
        resume();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [pause, resume]);

  return {
    data,
    isLoading,
    error,
    isConnected,
    refresh,
    pause,
    resume,
    lastUpdated: data?.lastUpdated,
  };
}

// Hook for specific analytics data with caching
export function useAnalyticsRealtime(
  timeRange: string = "today",
  options: { updateInterval?: number; enableCache?: boolean } = {}
) {
  const { updateInterval = 60000, enableCache = true } = options; // 1 minute default for analytics
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const cacheKeyRef = useRef(`analytics_${timeRange}`);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setError(null);

      // Check cache first if enabled
      if (enableCache && typeof window !== "undefined") {
        const cached = localStorage.getItem(cacheKeyRef.current);
        if (cached) {
          const { data: cachedData, timestamp } = JSON.parse(cached);
          const cacheAge = Date.now() - timestamp;

          // Use cached data if less than 5 minutes old
          if (cacheAge < 5 * 60 * 1000) {
            setData(cachedData);
            setLastUpdated(new Date(timestamp).toISOString());
            setIsLoading(false);
            return;
          }
        }
      }

      const response = await fetch(
        `/api/dashboard/analytics?timeRange=${timeRange}&includeInsights=true`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch analytics data");
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "API returned error");
      }

      setData(result.data);
      setLastUpdated(new Date().toISOString());
      setIsLoading(false);

      // Cache the data if enabled
      if (enableCache && typeof window !== "undefined") {
        localStorage.setItem(
          cacheKeyRef.current,
          JSON.stringify({
            data: result.data,
            timestamp: Date.now(),
          })
        );
      }
    } catch (err) {
      console.error("Error fetching analytics:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
      setIsLoading(false);
    }
  }, [timeRange, enableCache]);

  // Start polling
  useEffect(() => {
    fetchAnalytics();

    pollingIntervalRef.current = setInterval(fetchAnalytics, updateInterval);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [fetchAnalytics, updateInterval]);

  const refresh = useCallback(() => {
    setIsLoading(true);
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    data,
    isLoading,
    error,
    lastUpdated,
    refresh,
  };
}
