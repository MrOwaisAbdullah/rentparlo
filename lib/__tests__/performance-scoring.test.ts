import { describe, it, expect, beforeEach } from "vitest";
import {
  calculatePerformanceScore,
  calculatePerformanceTrends,
  compareAgainstBenchmarks,
  calculateListingPerformanceScores,
  generatePerformanceInsights,
  PERFORMANCE_WEIGHTS,
  PERFORMANCE_THRESHOLDS,
} from "../performance-scoring";
import {
  SellerAnalytics,
  SellerProfile,
  ListingAnalytics,
} from "@/types/dashboard";

describe("Performance Scoring", () => {
  const mockAnalytics: SellerAnalytics = {
    sellerId: "test-seller",
    totalViews: 1000,
    totalContacts: 50,
    totalWhatsAppClicks: 30,
    totalShares: 10,
    totalSaves: 5,
    uniqueVisitors: 800,
    conversionRate: 5.0,
    avgSessionDuration: 120,
    bounceRate: 35,
    topCities: [],
    topDevices: [],
    timeSeriesData: [],
    listingPerformance: [],
  };

  const mockProfile: SellerProfile = {
    id: "test-seller",
    email: "seller@example.com",
    fullName: "Test Seller",
    tier: {
      name: "Gold",
      points: 2500,
      benefits: [],
    },
    tierPoints: 2500,
    responseRate: 85,
    avgRating: 4.5,
    totalRatings: 50,
    verificationStatus: {
      emailVerified: true,
      phoneVerified: true,
      documentVerified: true,
      businessVerified: false,
    },
    createdAt: "2024-01-01T00:00:00Z",
    lastActive: "2024-01-15T12:00:00Z",
  };

  const mockBenchmarks = {
    avgConversionRate: 3.5,
    avgResponseRate: 80,
    avgCustomerRating: 4.2,
    avgViewsPerListing: 200,
    topPerformingCategories: ["Electronics", "Vehicles"],
    medianPerformanceScore: 75,
  };

  beforeEach(() => {
    // Reset any mocks if needed
  });

  describe("calculatePerformanceScore", () => {
    it("should calculate performance score with all components", () => {
      const score = calculatePerformanceScore(mockAnalytics, mockProfile);

      expect(score.overall).toBeGreaterThan(0);
      expect(score.overall).toBeLessThanOrEqual(100);
      expect(score.breakdown.conversionRate).toBeGreaterThan(0);
      expect(score.breakdown.responseRate).toBeGreaterThan(0);
      expect(score.breakdown.customerRating).toBeGreaterThan(0);
      expect(score.breakdown.verification).toBeGreaterThan(0);
    });

    it("should assign correct grade based on score", () => {
      const highPerformanceProfile = {
        ...mockProfile,
        responseRate: 95,
        avgRating: 4.8,
        verificationStatus: {
          ...mockProfile.verificationStatus,
          businessVerified: true,
        },
      };

      const score = calculatePerformanceScore(
        mockAnalytics,
        highPerformanceProfile
      );
      expect(["A+", "A", "B+"]).toContain(score.grade);
    });

    it("should assign correct category based on score", () => {
      const score = calculatePerformanceScore(mockAnalytics, mockProfile);
      expect(["Excellent", "Good", "Average", "Needs Improvement"]).toContain(
        score.category
      );
    });

    it("should handle low performance metrics", () => {
      const lowPerformanceAnalytics = {
        ...mockAnalytics,
        conversionRate: 0.5,
      };
      const lowPerformanceProfile = {
        ...mockProfile,
        responseRate: 40,
        avgRating: 3.0,
        verificationStatus: {
          emailVerified: false,
          phoneVerified: false,
          documentVerified: false,
          businessVerified: false,
        },
      };

      const score = calculatePerformanceScore(
        lowPerformanceAnalytics,
        lowPerformanceProfile
      );

      expect(score.overall).toBeLessThan(70);
      expect(score.category).toBe("Needs Improvement");
    });

    it("should calculate verification score correctly", () => {
      const partiallyVerifiedProfile = {
        ...mockProfile,
        verificationStatus: {
          emailVerified: true,
          phoneVerified: true,
          documentVerified: false,
          businessVerified: false,
        },
      };

      const score = calculatePerformanceScore(
        mockAnalytics,
        partiallyVerifiedProfile
      );
      expect(score.breakdown.verification).toBe(40); // 20 + 20 = 40
    });

    it("should handle maximum verification score", () => {
      const fullyVerifiedProfile = {
        ...mockProfile,
        verificationStatus: {
          emailVerified: true,
          phoneVerified: true,
          documentVerified: true,
          businessVerified: true,
        },
      };

      const score = calculatePerformanceScore(
        mockAnalytics,
        fullyVerifiedProfile
      );
      expect(score.breakdown.verification).toBe(100);
    });
  });

  describe("calculatePerformanceTrends", () => {
    it("should calculate trends with changes", () => {
      const historicalData = [
        {
          period: "2024-01",
          analytics: { ...mockAnalytics, conversionRate: 2.0 },
          profile: { ...mockProfile, responseRate: 60, avgRating: 3.5 },
        },
        {
          period: "2024-02",
          analytics: { ...mockAnalytics, conversionRate: 4.0 },
          profile: { ...mockProfile, responseRate: 80, avgRating: 4.2 },
        },
        {
          period: "2024-03",
          analytics: { ...mockAnalytics, conversionRate: 5.0 },
          profile: { ...mockProfile, responseRate: 85, avgRating: 4.5 },
        },
      ];

      const trends = calculatePerformanceTrends(historicalData);

      expect(trends).toHaveLength(3);
      expect(trends[0].change).toBe(0); // First period has no change
      expect(trends[1].change).toBeGreaterThan(0); // Improvement
      expect(trends[2].change).toBeGreaterThan(0); // Further improvement
    });

    it("should handle declining performance", () => {
      const historicalData = [
        {
          period: "2024-01",
          analytics: mockAnalytics,
          profile: mockProfile,
        },
        {
          period: "2024-02",
          analytics: { ...mockAnalytics, conversionRate: 3.0 },
          profile: { ...mockProfile, responseRate: 70 },
        },
      ];

      const trends = calculatePerformanceTrends(historicalData);

      expect(trends[1].change).toBeLessThan(0);
      expect(trends[1].changePercentage).toBeLessThan(0);
    });
  });

  describe("compareAgainstBenchmarks", () => {
    it("should compare performance against benchmarks", () => {
      const score = calculatePerformanceScore(mockAnalytics, mockProfile);
      const comparison = compareAgainstBenchmarks(
        score,
        mockAnalytics,
        mockProfile,
        mockBenchmarks
      );

      expect(comparison.overallRanking).toBeDefined();
      expect(["Top 10%", "Top 25%", "Top 50%", "Below Average"]).toContain(
        comparison.overallRanking
      );
      expect(typeof comparison.conversionVsBenchmark).toBe("number");
      expect(typeof comparison.responseVsBenchmark).toBe("number");
      expect(typeof comparison.ratingVsBenchmark).toBe("number");
      expect(Array.isArray(comparison.recommendations)).toBe(true);
    });

    it("should generate recommendations for poor performance", () => {
      const lowPerformanceAnalytics = {
        ...mockAnalytics,
        conversionRate: 1.0, // Below benchmark
      };
      const lowPerformanceProfile = {
        ...mockProfile,
        responseRate: 60, // Below benchmark
        avgRating: 3.5, // Below benchmark
        verificationStatus: {
          ...mockProfile.verificationStatus,
          businessVerified: false,
        },
      };

      const score = calculatePerformanceScore(
        lowPerformanceAnalytics,
        lowPerformanceProfile
      );
      const comparison = compareAgainstBenchmarks(
        score,
        lowPerformanceAnalytics,
        lowPerformanceProfile,
        mockBenchmarks
      );

      expect(comparison.recommendations.length).toBeGreaterThan(0);
      expect(comparison.overallRanking).toBe("Below Average");
    });

    it("should calculate percentage differences correctly", () => {
      const comparison = compareAgainstBenchmarks(
        calculatePerformanceScore(mockAnalytics, mockProfile),
        mockAnalytics,
        mockProfile,
        mockBenchmarks
      );

      // Conversion rate: 5.0 vs 3.5 benchmark = +42.86%
      expect(comparison.conversionVsBenchmark).toBeCloseTo(42.86, 1);

      // Response rate: 85 vs 80 benchmark = +6.25%
      expect(comparison.responseVsBenchmark).toBeCloseTo(6.25, 1);

      // Rating: 4.5 vs 4.2 benchmark = +7.14%
      expect(comparison.ratingVsBenchmark).toBeCloseTo(7.14, 1);
    });
  });

  describe("calculateListingPerformanceScores", () => {
    const mockListings: ListingAnalytics[] = [
      {
        listingId: "listing-1",
        title: "High Performer",
        views: 500,
        contacts: 25,
        whatsappClicks: 15,
        shares: 10,
        saves: 5,
        conversionRate: 5.0,
        avgTimeOnPage: 150,
        createdAt: "2024-01-01",
        lastActivity: "2024-01-15",
      },
      {
        listingId: "listing-2",
        title: "Low Performer",
        views: 50,
        contacts: 1,
        whatsappClicks: 0,
        shares: 0,
        saves: 0,
        conversionRate: 2.0,
        avgTimeOnPage: 60,
        createdAt: "2024-01-01",
        lastActivity: "2024-01-15",
      },
    ];

    it("should calculate performance scores for listings", () => {
      const scoredListings = calculateListingPerformanceScores(mockListings);

      expect(scoredListings).toHaveLength(2);
      expect(scoredListings[0].performanceScore).toBeGreaterThan(
        scoredListings[1].performanceScore
      );
      expect(scoredListings[0].category).toBe("High Performer");
      expect(scoredListings[1].category).toBe("Needs Attention");
    });

    it("should assign correct categories based on scores", () => {
      const listings = [
        {
          ...mockListings[0],
          views: 1000, // 30 points (max)
          conversionRate: 5.0, // 40 points (max)
          shares: 25,
          saves: 25, // 20 points (max)
          avgTimeOnPage: 120, // 10 points (max)
          // Total: 100 points = High Performer
        },
        {
          ...mockListings[0],
          views: 300, // 30 points (max)
          conversionRate: 3.0, // 24 points
          shares: 15,
          saves: 10, // 10 points
          avgTimeOnPage: 90, // 7.5 points
          // Total: ~71 points = Good Performer
        },
        {
          ...mockListings[0],
          views: 150, // 30 points (max)
          conversionRate: 1.0, // 8 points
          shares: 5,
          saves: 5, // 4 points
          avgTimeOnPage: 60, // 5 points
          // Total: ~47 points = Average Performer
        },
        {
          ...mockListings[0],
          views: 20, // 6 points
          conversionRate: 0.5, // 4 points
          shares: 0,
          saves: 0, // 0 points
          avgTimeOnPage: 30, // 2.5 points
          // Total: ~12 points = Needs Attention
        },
      ];

      const scoredListings = calculateListingPerformanceScores(listings);

      expect(scoredListings[0].category).toBe("High Performer");
      expect(scoredListings[1].category).toBe("Good Performer");
      expect(scoredListings[2].category).toBe("Average Performer");
      expect(scoredListings[3].category).toBe("Needs Attention");
    });
  });

  describe("generatePerformanceInsights", () => {
    it("should generate insights for excellent performance", () => {
      const excellentScore = {
        overall: 90,
        breakdown: {
          responseRate: 95,
          conversionRate: 90,
          customerRating: 85,
          verification: 100,
        },
        grade: "A" as const,
        category: "Excellent" as const,
      };

      const trends = [
        { period: "2024-01", score: 85, change: 0, changePercentage: 0 },
        { period: "2024-02", score: 90, change: 5, changePercentage: 5.88 },
      ];

      const benchmarkComparison = {
        overallRanking: "Top 10%" as const,
        conversionVsBenchmark: 25.0,
        responseVsBenchmark: 15.0,
        ratingVsBenchmark: 10.0,
        viewsVsBenchmark: 20.0,
        recommendations: [],
      };

      const insights = generatePerformanceInsights(
        excellentScore,
        trends,
        benchmarkComparison
      );

      expect(insights.length).toBeGreaterThan(0);
      expect(insights.some((insight) => insight.type === "positive")).toBe(
        true
      );
    });

    it("should generate insights for poor performance", () => {
      const poorScore = {
        overall: 45,
        breakdown: {
          responseRate: 40,
          conversionRate: 30,
          customerRating: 50,
          verification: 60,
        },
        grade: "F" as const,
        category: "Needs Improvement" as const,
      };

      const trends = [
        { period: "2024-01", score: 60, change: 0, changePercentage: 0 },
        { period: "2024-02", score: 45, change: -15, changePercentage: -25 },
      ];

      const benchmarkComparison = {
        overallRanking: "Below Average" as const,
        conversionVsBenchmark: -30.0,
        responseVsBenchmark: -25.0,
        ratingVsBenchmark: -15.0,
        viewsVsBenchmark: -40.0,
        recommendations: ["Improve response time", "Complete verification"],
      };

      const insights = generatePerformanceInsights(
        poorScore,
        trends,
        benchmarkComparison
      );

      expect(insights.length).toBeGreaterThan(0);
      expect(insights.some((insight) => insight.type === "negative")).toBe(
        true
      );
      expect(insights.some((insight) => insight.priority === "high")).toBe(
        true
      );
    });

    it("should identify declining trends", () => {
      const score = {
        overall: 70,
        breakdown: {
          responseRate: 70,
          conversionRate: 70,
          customerRating: 70,
          verification: 70,
        },
        grade: "C" as const,
        category: "Average" as const,
      };

      const decliningTrends = [
        { period: "2024-01", score: 80, change: 0, changePercentage: 0 },
        { period: "2024-02", score: 70, change: -10, changePercentage: -12.5 },
      ];

      const benchmarkComparison = {
        overallRanking: "Top 50%" as const,
        conversionVsBenchmark: 0,
        responseVsBenchmark: 0,
        ratingVsBenchmark: 0,
        viewsVsBenchmark: 0,
        recommendations: [],
      };

      const insights = generatePerformanceInsights(
        score,
        decliningTrends,
        benchmarkComparison
      );

      expect(
        insights.some((insight) => insight.title.includes("Declining"))
      ).toBe(true);
    });
  });

  describe("PERFORMANCE_WEIGHTS", () => {
    it("should have weights that sum to 1", () => {
      const totalWeight = Object.values(PERFORMANCE_WEIGHTS).reduce(
        (sum, weight) => sum + weight,
        0
      );
      expect(totalWeight).toBeCloseTo(1.0, 2);
    });
  });

  describe("PERFORMANCE_THRESHOLDS", () => {
    it("should have valid threshold values", () => {
      expect(PERFORMANCE_THRESHOLDS.conversionRate.excellent).toBeGreaterThan(
        PERFORMANCE_THRESHOLDS.conversionRate.good
      );
      expect(PERFORMANCE_THRESHOLDS.conversionRate.good).toBeGreaterThan(
        PERFORMANCE_THRESHOLDS.conversionRate.average
      );
      expect(PERFORMANCE_THRESHOLDS.conversionRate.average).toBeGreaterThan(
        PERFORMANCE_THRESHOLDS.conversionRate.poor
      );
    });
  });
});
