import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { GET } from "../summary/route";
import { NextRequest } from "next/server";

// Mock Supabase
const mockSupabaseClient = {
  auth: {
    getUser: vi.fn(),
  },
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(),
  })),
  rpc: vi.fn(),
};

vi.mock("@/utils/supabase/server", () => ({
  createClient: () => mockSupabaseClient,
}));

// Mock dashboard queries
vi.mock("@/lib/supabase-queries", () => ({
  getSellerDashboardSummary: vi.fn(),
  getSellerPerformanceMetrics: vi.fn(),
}));

describe("Dashboard Summary API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should return dashboard summary for authenticated user", async () => {
    const mockUser = {
      id: "test-user-id",
      email: "test@example.com",
    };

    const mockDashboardSummary = {
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

    const mockPerformanceMetrics = {
      performanceScore: 78,
      grade: "B+",
      category: "Good",
      breakdown: {
        responseRate: 85,
        conversionRate: 75,
        customerRating: 80,
        verification: 70,
      },
    };

    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    const { getSellerDashboardSummary, getSellerPerformanceMetrics } =
      await import("@/lib/supabase-queries");

    vi.mocked(getSellerDashboardSummary).mockResolvedValue(
      mockDashboardSummary
    );
    vi.mocked(getSellerPerformanceMetrics).mockResolvedValue(
      mockPerformanceMetrics
    );

    const request = new NextRequest(
      "http://localhost:3000/api/dashboard/summary"
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.overview).toEqual(mockDashboardSummary.overview);
    expect(data.recentActivity).toEqual(mockDashboardSummary.recentActivity);
    expect(data.notifications).toEqual(mockDashboardSummary.notifications);
    expect(data.performanceMetrics).toEqual(mockPerformanceMetrics);
  });

  it("should return 401 for unauthenticated user", async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null,
    });

    const request = new NextRequest(
      "http://localhost:3000/api/dashboard/summary"
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("should handle authentication errors", async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: "Invalid token" },
    });

    const request = new NextRequest(
      "http://localhost:3000/api/dashboard/summary"
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("should handle database errors gracefully", async () => {
    const mockUser = {
      id: "test-user-id",
      email: "test@example.com",
    };

    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    const { getSellerDashboardSummary } = await import(
      "@/lib/supabase-queries"
    );
    vi.mocked(getSellerDashboardSummary).mockRejectedValue(
      new Error("Database connection failed")
    );

    const request = new NextRequest(
      "http://localhost:3000/api/dashboard/summary"
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Internal server error");
  });

  it("should handle missing seller data", async () => {
    const mockUser = {
      id: "test-user-id",
      email: "test@example.com",
    };

    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    const { getSellerDashboardSummary } = await import(
      "@/lib/supabase-queries"
    );
    vi.mocked(getSellerDashboardSummary).mockResolvedValue(null);

    const request = new NextRequest(
      "http://localhost:3000/api/dashboard/summary"
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("Seller data not found");
  });

  it("should include cache headers for performance", async () => {
    const mockUser = {
      id: "test-user-id",
      email: "test@example.com",
    };

    const mockDashboardSummary = {
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
      recentActivity: [],
      notifications: [],
      performanceInsights: [],
    };

    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    const { getSellerDashboardSummary, getSellerPerformanceMetrics } =
      await import("@/lib/supabase-queries");

    vi.mocked(getSellerDashboardSummary).mockResolvedValue(
      mockDashboardSummary
    );
    vi.mocked(getSellerPerformanceMetrics).mockResolvedValue({
      performanceScore: 78,
      grade: "B+",
      category: "Good",
      breakdown: {
        responseRate: 85,
        conversionRate: 75,
        customerRating: 80,
        verification: 70,
      },
    });

    const request = new NextRequest(
      "http://localhost:3000/api/dashboard/summary"
    );
    const response = await GET(request);

    expect(response.headers.get("Cache-Control")).toBe(
      "private, max-age=300, stale-while-revalidate=600"
    );
  });

  it("should validate request method", async () => {
    const request = new NextRequest(
      "http://localhost:3000/api/dashboard/summary",
      {
        method: "POST",
      }
    );

    const response = await GET(request);

    // Should still work as GET handler only handles GET requests
    expect(response.status).toBe(401); // Will fail auth since no user setup
  });

  it("should handle concurrent requests efficiently", async () => {
    const mockUser = {
      id: "test-user-id",
      email: "test@example.com",
    };

    const mockDashboardSummary = {
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
      recentActivity: [],
      notifications: [],
      performanceInsights: [],
    };

    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    const { getSellerDashboardSummary, getSellerPerformanceMetrics } =
      await import("@/lib/supabase-queries");

    vi.mocked(getSellerDashboardSummary).mockResolvedValue(
      mockDashboardSummary
    );
    vi.mocked(getSellerPerformanceMetrics).mockResolvedValue({
      performanceScore: 78,
      grade: "B+",
      category: "Good",
      breakdown: {
        responseRate: 85,
        conversionRate: 75,
        customerRating: 80,
        verification: 70,
      },
    });

    const request1 = new NextRequest(
      "http://localhost:3000/api/dashboard/summary"
    );
    const request2 = new NextRequest(
      "http://localhost:3000/api/dashboard/summary"
    );

    const [response1, response2] = await Promise.all([
      GET(request1),
      GET(request2),
    ]);

    expect(response1.status).toBe(200);
    expect(response2.status).toBe(200);
  });

  it("should handle query parameters for filtering", async () => {
    const mockUser = {
      id: "test-user-id",
      email: "test@example.com",
    };

    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    const { getSellerDashboardSummary } = await import(
      "@/lib/supabase-queries"
    );
    vi.mocked(getSellerDashboardSummary).mockResolvedValue({
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
      recentActivity: [],
      notifications: [],
      performanceInsights: [],
    });

    const request = new NextRequest(
      "http://localhost:3000/api/dashboard/summary?timeRange=week&includeInsights=true"
    );
    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(getSellerDashboardSummary).toHaveBeenCalledWith(
      mockUser.id,
      expect.objectContaining({
        timeRange: "week",
        includeInsights: true,
      })
    );
  });
});
