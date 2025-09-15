import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  getSellerDashboardSummary,
  getSellerPerformanceMetrics,
  getSellerAnalytics,
} from "../supabase-queries";

// Mock Supabase client
const mockSupabaseClient = {
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn(),
  })),
  rpc: vi.fn(),
};

vi.mock("@/utils/supabase/server", () => ({
  createClient: () => mockSupabaseClient,
}));

describe("Supabase Queries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("getSellerDashboardSummary", () => {
    it("should fetch seller dashboard summary successfully", async () => {
      const mockSummaryData = {
        overview: {
          totalListings: 15,
          activeListings: 12,
          totalViews: 2500,
          totalContacts: 125,
          conversionRate: 5.0,
          uniqueVisitors: 2000,
          avgSessionDuration: 180,
          bounceRate: 35.5,
        },
        recentActivity: [
          {
            id: "1",
            type: "view",
            listing_title: "BMW 3 Series",
            timestamp: "2024-01-15T10:30:00Z",
            user_location: "Karachi",
          },
        ],
        notifications: [
          {
            id: "1",
            type: "verification",
            message: "Complete your profile verification",
            priority: "high",
            action_url: "/profile/verification",
          },
        ],
        performanceInsights: [
          {
            type: "positive",
            title: "Good Performance",
            description: "Your conversion rate is above average",
            priority: "medium",
          },
        ],
      };

      mockSupabaseClient.rpc.mockResolvedValue({
        data: mockSummaryData,
        error: null,
      });

      const result = await getSellerDashboardSummary("test-seller-id");

      expect(result).toEqual(mockSummaryData);
      expect(mockSupabaseClient.rpc).toHaveBeenCalledWith(
        "get_seller_dashboard_summary",
        { seller_id: "test-seller-id" }
      );
    });

    it("should handle database errors", async () => {
      mockSupabaseClient.rpc.mockResolvedValue({
        data: null,
        error: { message: "Database connection failed" },
      });

      await expect(getSellerDashboardSummary("test-seller-id")).rejects.toThrow(
        "Database connection failed"
      );
    });

    it("should handle missing seller data", async () => {
      mockSupabaseClient.rpc.mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await getSellerDashboardSummary("nonexistent-seller");
      expect(result).toBeNull();
    });

    it("should pass time range parameters", async () => {
      const mockSummaryData = {
        overview: {
          totalListings: 10,
          activeListings: 8,
          totalViews: 1200,
          totalContacts: 60,
          conversionRate: 5.0,
        },
      };

      mockSupabaseClient.rpc.mockResolvedValue({
        data: mockSummaryData,
        error: null,
      });

      const options = {
        timeRange: "week",
        includeInsights: true,
      };

      await getSellerDashboardSummary("test-seller-id", options);

      expect(mockSupabaseClient.rpc).toHaveBeenCalledWith(
        "get_seller_dashboard_summary",
        {
          seller_id: "test-seller-id",
          time_range: "week",
          include_insights: true,
        }
      );
    });
  });

  describe("getSellerPerformanceMetrics", () => {
    it("should fetch performance metrics successfully", async () => {
      const mockMetrics = {
        performanceScore: 78,
        grade: "B+",
        category: "Good",
        breakdown: {
          responseRate: 85,
          conversionRate: 75,
          customerRating: 80,
          verification: 70,
        },
        trends: [
          { period: "Week 1", score: 70 },
          { period: "Week 2", score: 75 },
          { period: "Week 3", score: 78 },
        ],
      };

      mockSupabaseClient.rpc.mockResolvedValue({
        data: mockMetrics,
        error: null,
      });

      const result = await getSellerPerformanceMetrics("test-seller-id");

      expect(result).toEqual(mockMetrics);
      expect(mockSupabaseClient.rpc).toHaveBeenCalledWith(
        "get_seller_performance_metrics",
        { seller_id: "test-seller-id" }
      );
    });

    it("should handle performance calculation errors", async () => {
      mockSupabaseClient.rpc.mockResolvedValue({
        data: null,
        error: { message: "Performance calculation failed" },
      });

      await expect(
        getSellerPerformanceMetrics("test-seller-id")
      ).rejects.toThrow("Performance calculation failed");
    });

    it("should return default metrics for new sellers", async () => {
      const defaultMetrics = {
        performanceScore: 0,
        grade: "N/A",
        category: "New Seller",
        breakdown: {
          responseRate: 0,
          conversionRate: 0,
          customerRating: 0,
          verification: 0,
        },
      };

      mockSupabaseClient.rpc.mockResolvedValue({
        data: defaultMetrics,
        error: null,
      });

      const result = await getSellerPerformanceMetrics("new-seller-id");
      expect(result.category).toBe("New Seller");
    });
  });

  describe("getSellerAnalytics", () => {
    it("should fetch seller analytics successfully", async () => {
      const mockAnalytics = {
        sellerId: "test-seller-id",
        totalViews: 1500,
        totalContacts: 75,
        totalWhatsAppClicks: 45,
        totalShares: 12,
        totalSaves: 8,
        uniqueVisitors: 1200,
        conversionRate: 5.0,
        avgSessionDuration: 180,
        bounceRate: 35.5,
        topCities: [
          { city: "Karachi", views: 800, contacts: 40 },
          { city: "Lahore", views: 700, contacts: 35 },
        ],
        topDevices: [
          { device: "mobile", views: 900, contacts: 45 },
          { device: "desktop", views: 600, contacts: 30 },
        ],
        timeSeriesData: [
          { date: "2024-01-01", views: 100, contacts: 5 },
          { date: "2024-01-02", views: 120, contacts: 8 },
        ],
        listingPerformance: [
          {
            listingId: "listing-1",
            title: "BMW 3 Series",
            views: 500,
            contacts: 25,
            conversionRate: 5.0,
          },
        ],
      };

      mockSupabaseClient.rpc.mockResolvedValue({
        data: mockAnalytics,
        error: null,
      });

      const result = await getSellerAnalytics("test-seller-id");

      expect(result).toEqual(mockAnalytics);
      expect(mockSupabaseClient.rpc).toHaveBeenCalledWith(
        "get_seller_analytics",
        { seller_id: "test-seller-id" }
      );
    });

    it("should handle time range filtering", async () => {
      const mockAnalytics = {
        sellerId: "test-seller-id",
        totalViews: 500,
        totalContacts: 25,
        conversionRate: 5.0,
      };

      mockSupabaseClient.rpc.mockResolvedValue({
        data: mockAnalytics,
        error: null,
      });

      const options = {
        timeRange: "week",
        startDate: "2024-01-01",
        endDate: "2024-01-07",
      };

      await getSellerAnalytics("test-seller-id", options);

      expect(mockSupabaseClient.rpc).toHaveBeenCalledWith(
        "get_seller_analytics",
        {
          seller_id: "test-seller-id",
          time_range: "week",
          start_date: "2024-01-01",
          end_date: "2024-01-07",
        }
      );
    });

    it("should handle analytics aggregation errors", async () => {
      mockSupabaseClient.rpc.mockResolvedValue({
        data: null,
        error: { message: "Analytics aggregation failed" },
      });

      await expect(getSellerAnalytics("test-seller-id")).rejects.toThrow(
        "Analytics aggregation failed"
      );
    });

    it("should return empty analytics for sellers with no data", async () => {
      const emptyAnalytics = {
        sellerId: "test-seller-id",
        totalViews: 0,
        totalContacts: 0,
        conversionRate: 0,
        listingPerformance: [],
      };

      mockSupabaseClient.rpc.mockResolvedValue({
        data: emptyAnalytics,
        error: null,
      });

      const result = await getSellerAnalytics("new-seller-id");
      expect(result.totalViews).toBe(0);
      expect(result.listingPerformance).toHaveLength(0);
    });
  });

  describe("Error Handling", () => {
    it("should handle network errors", async () => {
      mockSupabaseClient.rpc.mockRejectedValue(new Error("Network error"));

      await expect(getSellerDashboardSummary("test-seller-id")).rejects.toThrow(
        "Network error"
      );
    });

    it("should handle timeout errors", async () => {
      mockSupabaseClient.rpc.mockImplementation(
        () =>
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Request timeout")), 100)
          )
      );

      await expect(getSellerDashboardSummary("test-seller-id")).rejects.toThrow(
        "Request timeout"
      );
    });

    it("should handle malformed response data", async () => {
      mockSupabaseClient.rpc.mockResolvedValue({
        data: "invalid-json",
        error: null,
      });

      // Should handle gracefully without throwing
      const result = await getSellerDashboardSummary("test-seller-id");
      expect(result).toBe("invalid-json");
    });
  });

  describe("Caching and Performance", () => {
    it("should handle concurrent requests efficiently", async () => {
      const mockData = { overview: { totalViews: 1000 } };
      mockSupabaseClient.rpc.mockResolvedValue({
        data: mockData,
        error: null,
      });

      const promises = [
        getSellerDashboardSummary("test-seller-id"),
        getSellerDashboardSummary("test-seller-id"),
        getSellerDashboardSummary("test-seller-id"),
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      results.forEach((result) => expect(result).toEqual(mockData));
    });

    it("should handle large datasets efficiently", async () => {
      const largeDataset = {
        listingPerformance: Array.from({ length: 1000 }, (_, i) => ({
          listingId: `listing-${i}`,
          title: `Listing ${i}`,
          views: Math.floor(Math.random() * 1000),
          contacts: Math.floor(Math.random() * 50),
        })),
      };

      mockSupabaseClient.rpc.mockResolvedValue({
        data: largeDataset,
        error: null,
      });

      const startTime = Date.now();
      const result = await getSellerAnalytics("test-seller-id");
      const endTime = Date.now();

      expect(result.listingPerformance).toHaveLength(1000);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });
  });
});
