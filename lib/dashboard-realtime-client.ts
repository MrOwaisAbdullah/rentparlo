/**
 * Client-side Real-time Dashboard Utilities
 * Manages WebSocket connections and real-time updates for dashboard components
 */

import { createClient } from "@/utils/supabase/client";

export interface RealtimeConnectionOptions {
  sellerId: string;
  onAnalyticsUpdate?: (payload: any) => void;
  onProfileUpdate?: (payload: any) => void;
  onConnectionChange?: (connected: boolean) => void;
  enableAnalytics?: boolean;
  enableProfile?: boolean;
}

export class DashboardRealtimeManager {
  private supabase = createClient();
  private channels: Map<string, any> = new Map();
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second
  private options: RealtimeConnectionOptions;

  constructor(options: RealtimeConnectionOptions) {
    this.options = options;
  }

  /**
   * Start real-time connections
   */
  async connect(): Promise<boolean> {
    try {
      // Clean up existing connections
      this.disconnect();

      const {
        sellerId,
        enableAnalytics = true,
        enableProfile = true,
      } = this.options;

      // Subscribe to analytics events if enabled
      if (enableAnalytics) {
        const analyticsChannel = this.supabase
          .channel(`seller_analytics_${sellerId}`)
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
              this.options.onAnalyticsUpdate?.(payload);
            }
          )
          .subscribe((status) => {
            console.log("Analytics subscription status:", status);
            this.handleConnectionStatus(status);
          });

        this.channels.set("analytics", analyticsChannel);
      }

      // Subscribe to profile updates if enabled
      if (enableProfile) {
        const profileChannel = this.supabase
          .channel(`seller_profile_${sellerId}`)
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "seller_profiles",
              filter: `id=eq.${sellerId}`,
            },
            (payload) => {
              console.log("Real-time profile update:", payload);
              this.options.onProfileUpdate?.(payload);
            }
          )
          .subscribe((status) => {
            console.log("Profile subscription status:", status);
            this.handleConnectionStatus(status);
          });

        this.channels.set("profile", profileChannel);
      }

      return true;
    } catch (error) {
      console.error("Error connecting to real-time:", error);
      this.handleReconnect();
      return false;
    }
  }

  /**
   * Disconnect all real-time connections
   */
  disconnect(): void {
    this.channels.forEach((channel, key) => {
      this.supabase.removeChannel(channel);
      console.log(`Disconnected ${key} channel`);
    });

    this.channels.clear();
    this.isConnected = false;
    this.options.onConnectionChange?.(false);
  }

  /**
   * Handle connection status changes
   */
  private handleConnectionStatus(status: string): void {
    const wasConnected = this.isConnected;
    this.isConnected = status === "SUBSCRIBED";

    if (this.isConnected && !wasConnected) {
      console.log("Real-time connection established");
      this.reconnectAttempts = 0;
      this.reconnectDelay = 1000;
      this.options.onConnectionChange?.(true);
    } else if (!this.isConnected && wasConnected) {
      console.log("Real-time connection lost");
      this.options.onConnectionChange?.(false);
      this.handleReconnect();
    }
  }

  /**
   * Handle reconnection with exponential backoff
   */
  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("Max reconnection attempts reached");
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(
      `Attempting reconnection ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`
    );

    setTimeout(() => {
      this.connect();
    }, delay);
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): {
    connected: boolean;
    channels: string[];
    reconnectAttempts: number;
  } {
    return {
      connected: this.isConnected,
      channels: Array.from(this.channels.keys()),
      reconnectAttempts: this.reconnectAttempts,
    };
  }

  /**
   * Force reconnection
   */
  forceReconnect(): void {
    this.reconnectAttempts = 0;
    this.connect();
  }
}

/**
 * React hook for dashboard real-time connections
 */
import { useState, useEffect } from "react";

export function useDashboardRealtime(options: RealtimeConnectionOptions) {
  const [manager] = useState(() => new DashboardRealtimeManager(options));
  const [connectionStatus, setConnectionStatus] = useState({
    connected: false,
    channels: [] as string[],
    reconnectAttempts: 0,
  });

  useEffect(() => {
    // Update connection status callback
    const originalOnConnectionChange = options.onConnectionChange;
    options.onConnectionChange = (connected: boolean) => {
      setConnectionStatus(manager.getConnectionStatus());
      originalOnConnectionChange?.(connected);
    };

    // Connect on mount
    manager.connect();

    // Update status periodically
    const statusInterval = setInterval(() => {
      setConnectionStatus(manager.getConnectionStatus());
    }, 5000);

    // Cleanup on unmount
    return () => {
      clearInterval(statusInterval);
      manager.disconnect();
    };
  }, [manager, options]);

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is hidden, disconnect to save resources
        manager.disconnect();
      } else {
        // Page is visible, reconnect
        manager.connect();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [manager]);

  return {
    connectionStatus,
    forceReconnect: () => manager.forceReconnect(),
    disconnect: () => manager.disconnect(),
    connect: () => manager.connect(),
  };
}

/**
 * Utility function to check real-time system health
 */
export async function checkRealtimeSystemHealth(): Promise<{
  status: "healthy" | "degraded" | "unhealthy";
  details: any;
}> {
  try {
    const response = await fetch("/api/dashboard/realtime/health");
    const result = await response.json();

    if (result.success) {
      return result.data.realtime;
    } else {
      return {
        status: "unhealthy",
        details: { error: result.error },
      };
    }
  } catch (error) {
    return {
      status: "unhealthy",
      details: {
        error: error instanceof Error ? error.message : "Unknown error",
      },
    };
  }
}

/**
 * Utility function to manage cache
 */
export async function manageDashboardCache(
  action: string,
  params?: any
): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    const response = await fetch("/api/dashboard/cache", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action, ...params }),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export default {
  DashboardRealtimeManager,
  useDashboardRealtime,
  checkRealtimeSystemHealth,
  manageDashboardCache,
};
