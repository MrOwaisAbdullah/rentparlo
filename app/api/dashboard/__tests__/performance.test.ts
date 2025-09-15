import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { GET } from "../performance/route";
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

// Mock performance scoring and recommendations
vi.mock("@/lib/performance-scoring", () => ({
  calculatePerformanceScore: vi.fn(),
  compareAgainstBenchmarks: vi.fn(),
  generatePerformanceInsights: vi.fn(),
}));

vi.mock("@/lib/recommendations-engine", () => ({
  generateSellerRecommendations: vi.fn(),
}));

vi.mock("@/lib/supabase-queries", () => ({
  getSellerAnalytics: vi.fn(),
  getSellerProfile: vi.fn(),
  getPlatformBenchmarks: vi.fn(),
}));

describe("Dashboard Performance API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should return performance data for authenticated user", async () => {
    const mockUser = {
      id: "test-user-id",
      email: "test@example.com",
    };

    const mockAnalytics = {
      sellerId: "test-user-id",
      totalViews: 1500,
      totalContacts: 75,
      conversionRate: 5.0,
      avgSessionDuration: 180,
      bounceRate: 35,
      listingPerformance: [],
    };

    const mockProfile = {
      id: "test-user-id",
      responseRate: 85,
      avgRating: 4.5,
      verificationStatus: {
        emailVerified: true,
        phoneVerified: true,
        documentVerified: true,
        businessVerified: false,
      },
    };

    const mockPerformanceScore = {
      overall: 78,
      breakdown: {
        responseRate: 85,
        conversionRate: 75,
        customerRating: 80,
        verification: 70,
      },
      grade: "B+",
      category: "Good",
    };

    const mockBenchmarks = {
      avgConversionRate: 4.0,
      avgResponseRate: 80,
      avgCustomerRating: 4.2,
      medianPerformanceScore: 70,
    };

    const mockComparison = {
      overallRanking: "Top 25%",
      conversionVsBenchmark: 25.0,
      responseVsBenchmark: 6.25,
      ratingVsBenchmark: 7.14,
      recommendations: ["Complete business verification"],
    };

    const mockInsights = [
      {
        type: "positive",
        title: "Good Performance",
        description: "Your performance is above average",
        priority: "medium",
      },
    ];

    const mockRecommendations = [
      {
        id: "verify-business",
        type: "improvement",
        priority: "high",
        title: "Complete Business Verification",
        description: "Verify your business to unlock premium features",
        impact: "Increases trust and conversion rate",
        estimatedImprovement: 15,
        category: "Trust & Safety",
      },
    ];

    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    const { getSellerAnalytics, getSellerProfile, getPlatformBenchmarks } =
      await import("@/lib/supabase-queries");

    const {
      calculatePerformanceScore,
      compareAgainstBenchmarks,
      generatePerformanceInsights,
    } = await import("@/lib/performance-scoring");

    const { generateSellerRecommendations } = await import(
      "@/lib/recommendations-engine"
    );

    vi.mocked(getSellerAnalytics).mockResolvedValue(mockAnalytics);
    vi.mocked(getSellerProfile).mockResolvedValue(mockProfile);
    vi.mocked(getPlatformBenchmarks).mockResolvedValue(mockBenchmarks);
    vi.mocked(calculatePerformanceScore).mockReturnValue(mockPerformanceScore);
    vi.mocked(compareAgainstBenchmarks).mockReturnValue(mockComparison);
    vi.mocked(generatePerformanceInsights).mockReturnValue(mockInsights);
    vi.mocked(generateSellerRecommendations).mockReturnValue(
      mockRecommendations
    );

    const request = new NextRequest(
      "http://localhost:3000/api/dashboard/performance"
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.performanceScore).toEqual(mockPerformanceScore);
    expect(data.benchmarkComparison).toEqual(mockComparison);
    expect(data.insights).toEqual(mockInsights);
    expect(data.recommendations).toEqual(mockRecommendations);
  });

  it("should return 401 for unauthenticated user", async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null,
    });

    const request = new NextRequest(
      "http://localhost:3000/api/dashboard/performance"
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
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

    const { getSellerAnalytics } = await import("@/lib/supabase-queries");
    vi.mocked(getSellerAnalytics).mockResolvedValue(null);

    const request = new NextRequest(
      "http://localhost:3000/api/dashboard/performance"
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("Seller data not found");
  });

  it("should handle database errors", async () => {
    const mockUser = {
      id: "test-user-id",
      email: "test@example.com",
    };

    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    const { getSellerAnalytics } = await import("@/lib/supabase-queries");
    vi.mocked(getSellerAnalytics).mockRejectedValue(
      new Error("Database connection failed")
    );

    const request = new NextRequest(
      "http://localhost:3000/api/dashboard/performance"
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Internal server error");
  });

  it("should handle time range parameter", async () => {
    const mockUser = {
      id: "test-user-id",
      email: "test@example.com",
    };

    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    const { getSellerAnalytics } = await import("@/lib/supabase-queries");
    vi.mocked(getSellerAnalytics).mockResolvedValue({
      sellerId: "test-user-id",
      totalViews: 500,
      totalContacts: 25,
      conversionRate: 5.0,
      listingPerformance: [],
    });

    const request = new NextRequest(
      "http://localhost:3000/api/dashboard/performance?timeRange=week"
    );
    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(getSellerAnalytics).toHaveBeenCalledWith(
      mockUser.id,
      expect.objectContaining({
        timeRange: "week",
      })
    );
  });

  it("should include detailed breakdown when requested", async () => {
    const mockUser = {
      id: "test-user-id",
      email: "test@example.com",
    };

    const mockAnalytics = {
      sellerId: "test-user-id",
      totalViews: 1500,
      totalContacts: 75,
      conversionRate: 5.0,
      listingPerformance: [
        {
          listingId: "listing-1",
          title: "Test Listing",
          views: 300,
          contacts: 15,
          conversionRate: 5.0,
        },
      ],
    };

    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    const { getSellerAnalytics, getSellerProfile, getPlatformBenchmarks } =
      await import("@/lib/supabase-queries");

    vi.mocked(getSellerAnalytics).mockResolvedValue(mockAnalytics);
    vi.mocked(getSellerProfile).mockResolvedValue({
      id: "test-user-id",
      responseRate: 85,
      avgRating: 4.5,
    });
    vi.mocked(getPlatformBenchmarks).mockResolvedValue({
      avgConversionRate: 4.0,
      medianPerformanceScore: 70,
    });

    const request = new NextRequest(
      "http://localhost:3000/api/dashboard/performance?includeListings=true"
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.listingPerformance).toBeDefined();
    expect(data.listingPerformance).toHaveLength(1);
  });

  it("should cache performance data appropriately", async () => {
    const mockUser = {
      id: "test-user-id",
      email: "test@example.com",
    };

    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    const { getSellerAnalytics, getSellerProfile, getPlatformBenchmarks } =
      await import("@/lib/supabase-queries");

    vi.mocked(getSellerAnalytics).mockResolvedValue({
      sellerId: "test-user-id",
      totalViews: 1500,
      totalContacts: 75,
      conversionRate: 5.0,
    });
    vi.mocked(getSellerProfile).mockResolvedValue({
      id: "test-user-id",
      responseRate: 85,
      avgRating: 4.5,
    });
    vi.mocked(getPlatformBenchmarks).mockResolvedValue({
      avgConversionRate: 4.0,
      medianPerformanceScore: 70,
    });

    const request = new NextRequest(
      "http://localhost:3000/api/dashboard/performance"
    );
    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe(
      "private, max-age=600, stale-while-revalidate=1200"
    );
  });

  it("should handle performance calculation errors gracefully", async () => {
    const mockUser = {
      id: "test-user-id",
      email: "test@example.com",
    };

    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    const { getSellerAnalytics, getSellerProfile } = await import(
      "@/lib/supabase-queries"
    );
    const { calculatePerformanceScore } = await import(
      "@/lib/performance-scoring"
    );

    vi.mocked(getSellerAnalytics).mockResolvedValue({
      sellerId: "test-user-id",
      totalViews: 1500,
      totalContacts: 75,
      conversionRate: 5.0,
    });
    vi.mocked(getSellerProfile).mockResolvedValue({
      id: "test-user-id",
      responseRate: 85,
      avgRating: 4.5,
    });
    vi.mocked(calculatePerformanceScore).mockImplementation(() => {
      throw new Error("Performance calculation failed");
    });

    const request = new NextRequest(
      "http://localhost:3000/api/dashboard/performance"
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Internal server error");
  });

  it("should validate query parameters", async () => {
    const mockUser = {
      id: "test-user-id",
      email: "test@example.com",
    };

    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    const request = new NextRequest(
      "http://localhost:3000/api/dashboard/performance?timeRange=invalid"
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid time range parameter");
  });

  it("should handle recommendations generation failure", async () => {
    const mockUser = {
      id: "test-user-id",
      email: "test@example.com",
    };

    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    const { getSellerAnalytics, getSellerProfile, getPlatformBenchmarks } =
      await import("@/lib/supabase-queries");
    const { generateSellerRecommendations } = await import(
      "@/lib/recommendations-engine"
    );

    vi.mocked(getSellerAnalytics).mockResolvedValue({
      sellerId: "test-user-id",
      totalViews: 1500,
      totalContacts: 75,
      conversionRate: 5.0,
    });
    vi.mocked(getSellerProfile).mockResolvedValue({
      id: "test-user-id",
      responseRate: 85,
      avgRating: 4.5,
    });
    vi.mocked(getPlatformBenchmarks).mockResolvedValue({
      avgConversionRate: 4.0,
      medianPerformanceScore: 70,
    });
    vi.mocked(generateSellerRecommendations).mockImplementation(() => {
      throw new Error("Recommendations generation failed");
    });

    const request = new NextRequest(
      "http://localhost:3000/api/dashboard/performance"
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.recommendations).toEqual([]); // Should fallback to empty array
  });
});
