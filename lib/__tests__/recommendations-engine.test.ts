import { describe, it, expect, beforeEach } from "vitest";
import {
  RecommendationsEngine,
  generateSellerRecommendations,
  getRecommendationsByCategory,
  filterRecommendationsByPriority,
  getQuickWins,
} from "../recommendations-engine";
import { SellerAnalytics, SellerProfile } from "@/types/dashboard";
import { PerformanceScore, PlatformBenchmarks } from "../performance-scoring";

describe("Recommendations Engine", () => {
  const mockAnalytics: SellerAnalytics = {
    sellerId: "test-seller",
    totalViews: 1000,
    totalContacts: 50,
    totalWhatsAppClicks: 30,
    totalShares: 10,
    totalSaves: 5,
    uniqueVisitors: 800,
    conversionRate: 3.0,
    avgSessionDuration: 120,
    bounceRate: 45,
    topCities: [],
    topDevices: [],
    timeSeriesData: [],
    listingPerformance: [
      {
        listingId: "listing-1",
        title: "Test Listing",
        views: 200,
        contacts: 10,
        whatsappClicks: 5,
        shares: 2,
        saves: 1,
        conversionRate: 5.0,
        avgTimeOnPage: 90,
        createdAt: "2024-01-01",
        lastActivity: "2024-01-15",
      },
    ],
  };

  const mockProfile: SellerProfile = {
    id: "test-seller",
    email: "seller@example.com",
    fullName: "Test Seller",
    tier: {
      name: "Silver",
      points: 750,
      benefits: [],
    },
    tierPoints: 750,
    responseRate: 75,
    avgRating: 4.2,
    totalRatings: 25,
    verificationStatus: {
      emailVerified: true,
      phoneVerified: false,
      documentVerified: false,
      businessVerified: false,
    },
    createdAt: "2024-01-01T00:00:00Z",
    lastActive: "2024-01-15T12:00:00Z",
  };

  const mockPerformanceScore: PerformanceScore = {
    overall: 65,
    breakdown: {
      responseRate: 60,
      conversionRate: 70,
      customerRating: 75,
      verification: 40,
    },
    grade: "C",
    category: "Average",
  };

  const mockBenchmarks: PlatformBenchmarks = {
    avgConversionRate: 4.0,
    avgResponseRate: 85,
    avgCustomerRating: 4.3,
    avgViewsPerListing: 250,
    topPerformingCategories: ["Electronics", "Vehicles", "Fashion"],
    medianPerformanceScore: 70,
  };

  const mockContext = {
    seller: mockProfile,
    analytics: mockAnalytics,
    performanceScore: mockPerformanceScore,
    benchmarks: mockBenchmarks,
  };

  let engine: RecommendationsEngine;

  beforeEach(() => {
    engine = new RecommendationsEngine();
  });

  describe("RecommendationsEngine", () => {
    it("should generate recommendations", () => {
      const recommendations = engine.generateRecommendations(mockContext);

      expect(Array.isArray(recommendations)).toBe(true);
      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations.length).toBeLessThanOrEqual(10);
    });

    it("should prioritize high-priority recommendations", () => {
      const recommendations = engine.generateRecommendations(mockContext);

      // Should have high priority recommendations first
      const highPriorityCount = recommendations.filter(
        (rec) => rec.priority === "high"
      ).length;
      expect(highPriorityCount).toBeGreaterThan(0);
    });

    it("should generate verification recommendations for unverified seller", () => {
      const unverifiedContext = {
        ...mockContext,
        seller: {
          ...mockProfile,
          verificationStatus: {
            emailVerified: false,
            phoneVerified: false,
            documentVerified: false,
            businessVerified: false,
          },
        },
      };

      const recommendations = engine.generateRecommendations(unverifiedContext);

      expect(recommendations.some((rec) => rec.id === "verify-basic")).toBe(
        true
      );
    });

    it("should generate business verification recommendation", () => {
      const partiallyVerifiedContext = {
        ...mockContext,
        seller: {
          ...mockProfile,
          verificationStatus: {
            emailVerified: true,
            phoneVerified: true,
            documentVerified: false,
            businessVerified: false,
          },
        },
      };

      const recommendations = engine.generateRecommendations(
        partiallyVerifiedContext
      );

      expect(recommendations.some((rec) => rec.id === "verify-business")).toBe(
        true
      );
    });

    it("should generate low conversion rate recommendation", () => {
      const lowConversionContext = {
        ...mockContext,
        analytics: {
          ...mockAnalytics,
          conversionRate: 1.5, // Below benchmark of 4.0 * 0.7 = 2.8
        },
      };

      const recommendations =
        engine.generateRecommendations(lowConversionContext);

      expect(
        recommendations.some((rec) => rec.id === "improve-conversion")
      ).toBe(true);
    });

    it("should generate response rate improvement recommendation", () => {
      const lowResponseContext = {
        ...mockContext,
        seller: {
          ...mockProfile,
          responseRate: 60, // Below benchmark of 85 * 0.8 = 68
        },
      };

      const recommendations =
        engine.generateRecommendations(lowResponseContext);

      expect(
        recommendations.some((rec) => rec.id === "improve-response-rate")
      ).toBe(true);
    });

    it("should generate underperforming listings recommendation", () => {
      const underperformingContext = {
        ...mockContext,
        analytics: {
          ...mockAnalytics,
          listingPerformance: [
            {
              listingId: "listing-1",
              title: "Low Performer",
              views: 50, // Much lower than average
              contacts: 1,
              whatsappClicks: 0,
              shares: 0,
              saves: 0,
              conversionRate: 2.0,
              avgTimeOnPage: 30,
              createdAt: "2024-01-01",
              lastActivity: "2024-01-15",
            },
            {
              listingId: "listing-2",
              title: "Another Low Performer",
              views: 30,
              contacts: 0,
              whatsappClicks: 0,
              shares: 0,
              saves: 0,
              conversionRate: 0,
              avgTimeOnPage: 20,
              createdAt: "2024-01-01",
              lastActivity: "2024-01-15",
            },
          ],
        },
      };

      const recommendations = engine.generateRecommendations(
        underperformingContext
      );

      expect(
        recommendations.some((rec) => rec.id === "optimize-listings")
      ).toBe(true);
    });

    it("should generate tier progression recommendation", () => {
      const nearNextTierContext = {
        ...mockContext,
        seller: {
          ...mockProfile,
          tier: { name: "Silver", points: 1200, benefits: [] },
          tierPoints: 1200, // Close to Gold tier (1500)
        },
      };

      const recommendations =
        engine.generateRecommendations(nearNextTierContext);

      expect(recommendations.some((rec) => rec.id === "tier-progression")).toBe(
        true
      );
    });

    it("should generate top performer recommendation for excellent sellers", () => {
      const excellentContext = {
        ...mockContext,
        performanceScore: {
          ...mockPerformanceScore,
          overall: 90,
          category: "Excellent" as const,
        },
      };

      const recommendations = engine.generateRecommendations(excellentContext);

      expect(
        recommendations.some((rec) => rec.id === "maintain-excellence")
      ).toBe(true);
    });

    it("should handle errors gracefully", () => {
      // Create a context that might cause errors
      const problematicContext = {
        ...mockContext,
        analytics: null as any, // This should cause errors but be handled
      };

      expect(() => {
        const recommendations =
          engine.generateRecommendations(problematicContext);
        expect(Array.isArray(recommendations)).toBe(true);
      }).not.toThrow();
    });
  });

  describe("generateSellerRecommendations", () => {
    it("should generate recommendations using the engine", () => {
      const recommendations = generateSellerRecommendations(mockContext);

      expect(Array.isArray(recommendations)).toBe(true);
      expect(recommendations.length).toBeGreaterThan(0);
    });
  });

  describe("getRecommendationsByCategory", () => {
    it("should categorize recommendations correctly", () => {
      const recommendations = generateSellerRecommendations(mockContext);
      const categorized = getRecommendationsByCategory(recommendations);

      expect(typeof categorized).toBe("object");

      // Check that categories exist and contain arrays
      Object.values(categorized).forEach((categoryRecs) => {
        expect(Array.isArray(categoryRecs)).toBe(true);
        expect(categoryRecs.length).toBeGreaterThan(0);
      });

      // Check that all recommendations are categorized
      const totalCategorized = Object.values(categorized).reduce(
        (sum, categoryRecs) => sum + categoryRecs.length,
        0
      );
      expect(totalCategorized).toBe(recommendations.length);
    });

    it("should group recommendations by category", () => {
      const testRecommendations = [
        {
          id: "test-1",
          type: "improvement" as const,
          priority: "high" as const,
          title: "Test 1",
          description: "Test description 1",
          impact: "Test impact 1",
          estimatedImprovement: 10,
          category: "Trust & Safety",
        },
        {
          id: "test-2",
          type: "optimization" as const,
          priority: "medium" as const,
          title: "Test 2",
          description: "Test description 2",
          impact: "Test impact 2",
          estimatedImprovement: 5,
          category: "Trust & Safety",
        },
        {
          id: "test-3",
          type: "feature" as const,
          priority: "low" as const,
          title: "Test 3",
          description: "Test description 3",
          impact: "Test impact 3",
          estimatedImprovement: 3,
          category: "Performance",
        },
      ];

      const categorized = getRecommendationsByCategory(testRecommendations);

      expect(categorized["Trust & Safety"]).toHaveLength(2);
      expect(categorized["Performance"]).toHaveLength(1);
    });
  });

  describe("filterRecommendationsByPriority", () => {
    it("should filter recommendations by priority", () => {
      const recommendations = generateSellerRecommendations(mockContext);

      const highPriority = filterRecommendationsByPriority(
        recommendations,
        "high"
      );
      const mediumPriority = filterRecommendationsByPriority(
        recommendations,
        "medium"
      );
      const lowPriority = filterRecommendationsByPriority(
        recommendations,
        "low"
      );

      highPriority.forEach((rec) => expect(rec.priority).toBe("high"));
      mediumPriority.forEach((rec) => expect(rec.priority).toBe("medium"));
      lowPriority.forEach((rec) => expect(rec.priority).toBe("low"));
    });

    it("should return empty array if no recommendations match priority", () => {
      const testRecommendations = [
        {
          id: "test-1",
          type: "improvement" as const,
          priority: "low" as const,
          title: "Test 1",
          description: "Test description 1",
          impact: "Test impact 1",
          estimatedImprovement: 10,
          category: "Test",
        },
      ];

      const highPriority = filterRecommendationsByPriority(
        testRecommendations,
        "high"
      );
      expect(highPriority).toHaveLength(0);
    });
  });

  describe("getQuickWins", () => {
    it("should return quick win recommendations", () => {
      const testRecommendations = [
        {
          id: "verify-basic",
          type: "improvement" as const,
          priority: "high" as const,
          title: "Verify Basic",
          description: "Basic verification",
          impact: "High impact",
          estimatedImprovement: 15,
          category: "Trust & Safety",
        },
        {
          id: "improve-response-rate",
          type: "improvement" as const,
          priority: "high" as const,
          title: "Improve Response Rate",
          description: "Respond faster",
          impact: "Better conversion",
          estimatedImprovement: 18,
          category: "Customer Service",
        },
        {
          id: "some-other-recommendation",
          type: "feature" as const,
          priority: "low" as const,
          title: "Other Rec",
          description: "Other description",
          impact: "Low impact",
          estimatedImprovement: 3,
          category: "Other",
        },
      ];

      const quickWins = getQuickWins(testRecommendations);

      expect(quickWins).toHaveLength(2);
      expect(quickWins[0].id).toBe("verify-basic");
      expect(quickWins[1].id).toBe("improve-response-rate");
    });

    it("should return empty array if no quick wins available", () => {
      const testRecommendations = [
        {
          id: "complex-recommendation",
          type: "feature" as const,
          priority: "low" as const,
          title: "Complex Rec",
          description: "Complex description",
          impact: "Low impact",
          estimatedImprovement: 3,
          category: "Other",
        },
      ];

      const quickWins = getQuickWins(testRecommendations);
      expect(quickWins).toHaveLength(0);
    });
  });

  describe("Recommendation Rules", () => {
    it("should generate photo optimization recommendation for high bounce rate", () => {
      const highBounceContext = {
        ...mockContext,
        analytics: {
          ...mockAnalytics,
          bounceRate: 75, // High bounce rate
        },
      };

      const recommendations = engine.generateRecommendations(highBounceContext);

      expect(recommendations.some((rec) => rec.id === "optimize-photos")).toBe(
        true
      );
    });

    it("should generate engagement recommendation for low engagement", () => {
      const lowEngagementContext = {
        ...mockContext,
        analytics: {
          ...mockAnalytics,
          totalShares: 1,
          totalSaves: 1,
          totalViews: 1000, // Engagement rate < 2%
        },
      };

      const recommendations =
        engine.generateRecommendations(lowEngagementContext);

      expect(
        recommendations.some((rec) => rec.id === "increase-engagement")
      ).toBe(true);
    });

    it("should generate pricing optimization recommendation", () => {
      const highViewsLowConversionContext = {
        ...mockContext,
        analytics: {
          ...mockAnalytics,
          totalViews: 2000,
          conversionRate: 0.5, // High views but very low conversion
        },
      };

      const recommendations = engine.generateRecommendations(
        highViewsLowConversionContext
      );

      expect(recommendations.some((rec) => rec.id === "optimize-pricing")).toBe(
        true
      );
    });

    it("should generate points optimization for new sellers", () => {
      const newSellerContext = {
        ...mockContext,
        seller: {
          ...mockProfile,
          tierPoints: 50, // Very low points
        },
      };

      const recommendations = engine.generateRecommendations(newSellerContext);

      expect(recommendations.some((rec) => rec.id === "earn-points")).toBe(
        true
      );
    });
  });

  describe("Seasonal and Trend Recommendations", () => {
    it("should generate seasonal optimization during seasonal periods", () => {
      // Mock date to be in November (seasonal period)
      const originalDate = Date;
      global.Date = class extends Date {
        constructor(...args: any[]) {
          if (args.length === 0) {
            super(2024, 10, 15); // November 15, 2024
          } else {
            super(...args);
          }
        }
        getMonth() {
          return 10; // November
        }
      } as any;

      const recommendations = engine.generateRecommendations(mockContext);

      expect(recommendations.some((rec) => rec.id === "seasonal-tips")).toBe(
        true
      );

      global.Date = originalDate;
    });

    it("should generate decline recommendation for declining trends", () => {
      const decliningContext = {
        ...mockContext,
        trendAnalysis: {
          direction: "declining" as const,
          strength: "strong" as const,
          changePercentage: -15,
        },
      };

      const recommendations = engine.generateRecommendations(decliningContext);

      expect(recommendations.some((rec) => rec.id === "address-decline")).toBe(
        true
      );
    });
  });
});
