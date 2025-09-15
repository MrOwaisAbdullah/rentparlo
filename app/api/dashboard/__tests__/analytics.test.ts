import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST } from "../analytics/route";
import { NextRequest } from "next/server";

// Mock Supabase client
const mockSupabaseClient = {
  auth: {
    getUser: vi.fn(),
  },
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
  })),
  rpc: vi.fn(),
};

vi.mock("@/utils/supabase/server", () => ({
  createClient: () => mockSupabaseClient,
}));

// Mock Redis client
const mockRedisClient = {
  get: vi.fn(),
  set: vi.fn(),
  del: vi.fn(),
};

vi.mock("@/lib/cache-redis", () => ({
  getRedisClient: () => mockRedisClient,
}));

const mockAnalyticsData = [
  {
    id: "1",
    seller_id: "test-seller-id",
    event_type: "view",
    listing_id: "listing-1",
    created_at: "2024-01-15T10:00:00Z",
    user_location: "Karachi",
    device_type: "mobile",
    session_id: "session-1",
  },
  {
    id: "2",
    seller_id: "test-seller-id",
    event_type: "contact",
    listing_id: "listing-1",
    created_at: "2024-01-15T11:00:00Z",
    user_location: "Karachi",
    device_type: "mobile",
    session_id: "session-1",
  },
];

describe("Analytics API Route", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default auth mock
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: "test-seller-id" } },
      error: null,
    });
  });

  describe("GET /api/dashboard/analytics", () => {
    it("should return analytics data for authenticated seller", async () => {
      // Mock database query
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
      };

      mockQuery.select.mockResolvedValue({
        data: mockAnalyticsData,
        error: null,
      });

      mockSupabaseClient.from.mockReturnValue(mockQuery);

      const request = new NextRequest(
        "http://localhost:3000/api/dashboard/analytics?start=2024-01-01&end=2024-01-31"
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty("overview");
      expect(data).toHaveProperty("trends");
      expect(data).toHaveProperty("listings");
      expect(data.overview.totalViews).toBe(1);
      expect(data.overview.totalContacts).toBe(1);
    });

    it("should return 401 for unauthenticated requests", async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error("Not authenticated"),
      });

      const request = new NextRequest(
        "http://localhost:3000/api/dashboard/analytics"
      );
      const response = await GET(request);

      expect(response.status).toBe(401);
    });

    it("should handle date range filtering", async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
      };

      mockQuery.select.mockResolvedValue({
        data: mockAnalyticsData,
        error: null,
      });

      mockSupabaseClient.from.mockReturnValue(mockQuery);

      const request = new NextRequest(
        "http://localhost:3000/api/dashboard/analytics?start=2024-01-01&end=2024-01-31"
      );
      await GET(request);

      expect(mockQuery.gte).toHaveBeenCalledWith("created_at", "2024-01-01");
      expect(mockQuery.lte).toHaveBeenCalledWith("created_at", "2024-01-31");
    });

    it("should use cached data when available", async () => {
      const cachedData = {
        overview: { totalViews: 100, totalContacts: 5 },
        trends: [],
        listings: [],
      };

      mockRedisClient.get.mockResolvedValue(JSON.stringify(cachedData));

      const request = new NextRequest(
        "http://localhost:3000/api/dashboard/analytics"
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(cachedData);
      expect(mockSupabaseClient.from).not.toHaveBeenCalled();
    });

    it("should handle database errors gracefully", async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
      };

      mockQuery.select.mockResolvedValue({
        data: null,
        error: new Error("Database connection failed"),
      });

      mockSupabaseClient.from.mockReturnValue(mockQuery);

      const request = new NextRequest(
        "http://localhost:3000/api/dashboard/analytics"
      );
      const response = await GET(request);

      expect(response.status).toBe(500);
    });

    it("should aggregate data by listing", async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
      };

      mockQuery.select.mockResolvedValue({
        data: mockAnalyticsData,
        error: null,
      });

      mockSupabaseClient.from.mockReturnValue(mockQuery);

      const request = new NextRequest(
        "http://localhost:3000/api/dashboard/analytics?groupBy=listing"
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.listings).toHaveLength(1);
      expect(data.listings[0].listingId).toBe("listing-1");
    });

    it("should filter by device type", async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
      };

      mockQuery.select.mockResolvedValue({
        data: mockAnalyticsData.filter((d) => d.device_type === "mobile"),
        error: null,
      });

      mockSupabaseClient.from.mockReturnValue(mockQuery);

      const request = new NextRequest(
        "http://localhost:3000/api/dashboard/analytics?device=mobile"
      );
      await GET(request);

      expect(mockQuery.eq).toHaveBeenCalledWith("device_type", "mobile");
    });

    it("should filter by location", async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
      };

      mockQuery.select.mockResolvedValue({
        data: mockAnalyticsData.filter((d) => d.user_location === "Karachi"),
        error: null,
      });

      mockSupabaseClient.from.mockReturnValue(mockQuery);

      const request = new NextRequest(
        "http://localhost:3000/api/dashboard/analytics?location=Karachi"
      );
      await GET(request);

      expect(mockQuery.eq).toHaveBeenCalledWith("user_location", "Karachi");
    });

    it("should cache results after successful query", async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
      };

      mockQuery.select.mockResolvedValue({
        data: mockAnalyticsData,
        error: null,
      });

      mockSupabaseClient.from.mockReturnValue(mockQuery);
      mockRedisClient.get.mockResolvedValue(null); // No cache

      const request = new NextRequest(
        "http://localhost:3000/api/dashboard/analytics"
      );
      await GET(request);

      expect(mockRedisClient.set).toHaveBeenCalled();
    });
  });

  describe("POST /api/dashboard/analytics", () => {
    it("should create new analytics event", async () => {
      const mockInsert = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
      };

      mockInsert.insert.mockResolvedValue({
        data: [{ id: "new-event-id" }],
        error: null,
      });

      mockSupabaseClient.from.mockReturnValue(mockInsert);

      const eventData = {
        event_type: "view",
        listing_id: "listing-1",
        user_location: "Lahore",
        device_type: "desktop",
      };

      const request = new NextRequest(
        "http://localhost:3000/api/dashboard/analytics",
        {
          method: "POST",
          body: JSON.stringify(eventData),
          headers: { "Content-Type": "application/json" },
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toHaveProperty("id");
      expect(mockInsert.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          seller_id: "test-seller-id",
          event_type: "view",
          listing_id: "listing-1",
        })
      );
    });

    it("should validate required fields", async () => {
      const invalidData = {
        event_type: "view",
        // Missing listing_id
      };

      const request = new NextRequest(
        "http://localhost:3000/api/dashboard/analytics",
        {
          method: "POST",
          body: JSON.stringify(invalidData),
          headers: { "Content-Type": "application/json" },
        }
      );

      const response = await POST(request);

      expect(response.status).toBe(400);
    });

    it("should handle database insert errors", async () => {
      const mockInsert = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
      };

      mockInsert.insert.mockResolvedValue({
        data: null,
        error: new Error("Insert failed"),
      });

      mockSupabaseClient.from.mockReturnValue(mockInsert);

      const eventData = {
        event_type: "view",
        listing_id: "listing-1",
      };

      const request = new NextRequest(
        "http://localhost:3000/api/dashboard/analytics",
        {
          method: "POST",
          body: JSON.stringify(eventData),
          headers: { "Content-Type": "application/json" },
        }
      );

      const response = await POST(request);

      expect(response.status).toBe(500);
    });

    it("should invalidate cache after creating event", async () => {
      const mockInsert = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
      };

      mockInsert.insert.mockResolvedValue({
        data: [{ id: "new-event-id" }],
        error: null,
      });

      mockSupabaseClient.from.mockReturnValue(mockInsert);

      const eventData = {
        event_type: "view",
        listing_id: "listing-1",
      };

      const request = new NextRequest(
        "http://localhost:3000/api/dashboard/analytics",
        {
          method: "POST",
          body: JSON.stringify(eventData),
          headers: { "Content-Type": "application/json" },
        }
      );

      await POST(request);

      expect(mockRedisClient.del).toHaveBeenCalledWith(
        expect.stringContaining("analytics:test-seller-id")
      );
    });
  });
});
