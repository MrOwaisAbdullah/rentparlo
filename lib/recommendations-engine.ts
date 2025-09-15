/**
 * Intelligent Recommendations Engine
 * Generates personalized recommendations based on performance data analysis
 */

import {
  SellerAnalytics,
  SellerProfile,
  ListingAnalytics,
  Recommendation,
} from "@/types/dashboard";
import { PerformanceScore, PlatformBenchmarks } from "./performance-scoring";
import { PerformanceTrendPoint, TrendAnalysis } from "./performance-trends";

export interface RecommendationContext {
  seller: SellerProfile;
  analytics: SellerAnalytics;
  performanceScore: PerformanceScore;
  benchmarks: PlatformBenchmarks;
  trends?: PerformanceTrendPoint[];
  trendAnalysis?: TrendAnalysis;
}

export interface RecommendationRule {
  id: string;
  name: string;
  condition: (context: RecommendationContext) => boolean;
  generator: (context: RecommendationContext) => Recommendation;
  priority: number; // Higher number = higher priority
}

/**
 * Main recommendations engine class
 */
export class RecommendationsEngine {
  private rules: RecommendationRule[] = [];

  constructor() {
    this.initializeRules();
  }

  /**
   * Generate recommendations for a seller
   */
  generateRecommendations(context: RecommendationContext): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // Apply all rules and collect recommendations
    for (const rule of this.rules) {
      try {
        if (rule.condition(context)) {
          const recommendation = rule.generator(context);
          recommendations.push(recommendation);
        }
      } catch (error) {
        console.error(`Error applying recommendation rule ${rule.id}:`, error);
      }
    }

    // Sort by priority and return top recommendations
    return recommendations
      .sort(
        (a, b) =>
          this.getPriorityScore(b.priority) - this.getPriorityScore(a.priority)
      )
      .slice(0, 10); // Limit to top 10 recommendations
  }

  /**
   * Initialize all recommendation rules
   */
  private initializeRules(): void {
    this.rules = [
      // Verification recommendations
      this.createVerificationRule(),
      this.createBusinessVerificationRule(),
      this.createDocumentVerificationRule(),

      // Performance improvement recommendations
      this.createLowConversionRule(),
      this.createLowResponseRateRule(),
      this.createLowRatingRule(),

      // Listing optimization recommendations
      this.createUnderperformingListingsRule(),
      this.createListingQualityRule(),
      this.createPhotoOptimizationRule(),

      // Engagement recommendations
      this.createLowEngagementRule(),
      this.createSocialSharingRule(),
      this.createContactOptimizationRule(),

      // Tier progression recommendations
      this.createTierProgressionRule(),
      this.createPointsOptimizationRule(),

      // Market opportunity recommendations
      this.createMarketOpportunityRule(),
      this.createCategoryExpansionRule(),
      this.createPricingOptimizationRule(),

      // Trend-based recommendations
      this.createTrendDeclineRule(),
      this.createSeasonalOptimizationRule(),

      // Competitive recommendations
      this.createBenchmarkImprovementRule(),
      this.createTopPerformerRule(),
    ];
  }

  /**
   * Convert priority string to numeric score
   */
  private getPriorityScore(priority: "high" | "medium" | "low"): number {
    switch (priority) {
      case "high":
        return 3;
      case "medium":
        return 2;
      case "low":
        return 1;
      default:
        return 1;
    }
  }

  // Verification Rules
  private createVerificationRule(): RecommendationRule {
    return {
      id: "basic-verification",
      name: "Basic Verification",
      priority: 10,
      condition: (context) =>
        !context.seller.verificationStatus.emailVerified ||
        !context.seller.verificationStatus.phoneVerified,
      generator: (context) => ({
        id: "verify-basic",
        type: "improvement",
        priority: "high",
        title: "Complete Basic Verification",
        description:
          "Verify your email and phone number to build trust with customers and improve your performance score.",
        impact:
          "Increases trust score by up to 40 points and improves customer confidence",
        actionUrl: "/dashboard/profile/verification",
        estimatedImprovement: 15,
        category: "Trust & Safety",
      }),
    };
  }

  private createBusinessVerificationRule(): RecommendationRule {
    return {
      id: "business-verification",
      name: "Business Verification",
      priority: 8,
      condition: (context) =>
        context.seller.verificationStatus.emailVerified &&
        context.seller.verificationStatus.phoneVerified &&
        !context.seller.verificationStatus.businessVerified,
      generator: (context) => ({
        id: "verify-business",
        type: "improvement",
        priority: "high",
        title: "Get Business Verified",
        description:
          "Complete business verification to unlock premium features and gain customer trust.",
        impact:
          "Unlocks premium features and increases conversion rate by 25-40%",
        actionUrl: "/dashboard/profile/business-verification",
        estimatedImprovement: 20,
        category: "Trust & Safety",
      }),
    };
  }

  private createDocumentVerificationRule(): RecommendationRule {
    return {
      id: "document-verification",
      name: "Document Verification",
      priority: 7,
      condition: (context) =>
        context.seller.verificationStatus.phoneVerified &&
        !context.seller.verificationStatus.documentVerified,
      generator: (context) => ({
        id: "verify-documents",
        type: "improvement",
        priority: "medium",
        title: "Verify Your Identity",
        description:
          "Upload identity documents to complete your verification and build customer trust.",
        impact: "Increases profile credibility and improves search ranking",
        actionUrl: "/dashboard/profile/document-verification",
        estimatedImprovement: 12,
        category: "Trust & Safety",
      }),
    };
  }

  // Performance Improvement Rules
  private createLowConversionRule(): RecommendationRule {
    return {
      id: "low-conversion",
      name: "Low Conversion Rate",
      priority: 9,
      condition: (context) =>
        context.analytics.conversionRate <
        context.benchmarks.avgConversionRate * 0.7,
      generator: (context) => {
        const improvement =
          (context.benchmarks.avgConversionRate -
            context.analytics.conversionRate) *
          0.8;
        return {
          id: "improve-conversion",
          type: "optimization",
          priority: "high",
          title: "Improve Conversion Rate",
          description:
            "Your conversion rate is below average. Focus on faster responses and better listing quality.",
          impact: `Could increase contacts by ${Math.round((improvement * context.analytics.totalViews) / 100)} per month`,
          actionUrl: "/dashboard/analytics/conversion-tips",
          estimatedImprovement: Math.round(improvement * 10),
          category: "Performance",
        };
      },
    };
  }

  private createLowResponseRateRule(): RecommendationRule {
    return {
      id: "low-response-rate",
      name: "Low Response Rate",
      priority: 8,
      condition: (context) =>
        context.seller.responseRate < context.benchmarks.avgResponseRate * 0.8,
      generator: (context) => ({
        id: "improve-response-rate",
        type: "improvement",
        priority: "high",
        title: "Respond Faster to Inquiries",
        description:
          "Your response rate is below average. Aim to respond within 1 hour to improve customer satisfaction.",
        impact: "Faster responses can improve conversion rate by 15-30%",
        actionUrl: "/dashboard/messages",
        estimatedImprovement: 18,
        category: "Customer Service",
      }),
    };
  }

  private createLowRatingRule(): RecommendationRule {
    return {
      id: "low-rating",
      name: "Low Customer Rating",
      priority: 7,
      condition: (context) =>
        context.seller.avgRating < context.benchmarks.avgCustomerRating * 0.9 &&
        context.seller.totalRatings > 0,
      generator: (context) => ({
        id: "improve-rating",
        type: "improvement",
        priority: "medium",
        title: "Improve Customer Satisfaction",
        description:
          "Focus on customer service quality to improve your ratings and attract more customers.",
        impact: "Higher ratings increase trust and can boost conversion by 20%",
        actionUrl: "/dashboard/reviews",
        estimatedImprovement: 15,
        category: "Customer Service",
      }),
    };
  }

  // Listing Optimization Rules
  private createUnderperformingListingsRule(): RecommendationRule {
    return {
      id: "underperforming-listings",
      name: "Underperforming Listings",
      priority: 6,
      condition: (context) => {
        const avgViews =
          context.analytics.totalViews /
          Math.max(context.analytics.listingPerformance.length, 1);
        const underperforming = context.analytics.listingPerformance.filter(
          (listing) => listing.views < avgViews * 0.5
        );
        return underperforming.length > 0;
      },
      generator: (context) => {
        const avgViews =
          context.analytics.totalViews /
          Math.max(context.analytics.listingPerformance.length, 1);
        const underperforming = context.analytics.listingPerformance.filter(
          (listing) => listing.views < avgViews * 0.5
        );

        return {
          id: "optimize-listings",
          type: "optimization",
          priority: "medium",
          title: "Optimize Underperforming Listings",
          description: `${underperforming.length} of your listings are getting below-average views. Consider updating titles, descriptions, or photos.`,
          impact: "Optimizing listings can increase views by 40-60%",
          actionUrl: "/dashboard/listings?filter=underperforming",
          estimatedImprovement: 12,
          category: "Listing Quality",
        };
      },
    };
  }

  private createListingQualityRule(): RecommendationRule {
    return {
      id: "listing-quality",
      name: "Listing Quality",
      priority: 5,
      condition: (context) => context.analytics.avgSessionDuration < 60, // Less than 1 minute average
      generator: (context) => ({
        id: "improve-listing-quality",
        type: "optimization",
        priority: "medium",
        title: "Improve Listing Descriptions",
        description:
          "Visitors spend less time on your listings. Add more detailed descriptions and better photos.",
        impact: "Better descriptions can increase engagement by 25%",
        actionUrl: "/dashboard/listings/quality-tips",
        estimatedImprovement: 10,
        category: "Listing Quality",
      }),
    };
  }

  private createPhotoOptimizationRule(): RecommendationRule {
    return {
      id: "photo-optimization",
      name: "Photo Optimization",
      priority: 4,
      condition: (context) => context.analytics.bounceRate > 70, // High bounce rate suggests poor visuals
      generator: (context) => ({
        id: "optimize-photos",
        type: "optimization",
        priority: "medium",
        title: "Add High-Quality Photos",
        description:
          "High bounce rate suggests visitors are not engaged. Add more high-quality photos to your listings.",
        impact: "Quality photos can reduce bounce rate by 30%",
        actionUrl: "/dashboard/listings/photo-tips",
        estimatedImprovement: 8,
        category: "Listing Quality",
      }),
    };
  }

  // Engagement Rules
  private createLowEngagementRule(): RecommendationRule {
    return {
      id: "low-engagement",
      name: "Low Engagement",
      priority: 5,
      condition: (context) => {
        const engagementRate =
          (context.analytics.totalShares + context.analytics.totalSaves) /
          Math.max(context.analytics.totalViews, 1);
        return engagementRate < 0.02; // Less than 2% engagement
      },
      generator: (context) => ({
        id: "increase-engagement",
        type: "optimization",
        priority: "medium",
        title: "Increase Listing Engagement",
        description:
          "Your listings have low share and save rates. Consider adding compelling calls-to-action.",
        impact: "Higher engagement improves search visibility",
        actionUrl: "/dashboard/engagement-tips",
        estimatedImprovement: 8,
        category: "Engagement",
      }),
    };
  }

  private createSocialSharingRule(): RecommendationRule {
    return {
      id: "social-sharing",
      name: "Social Sharing",
      priority: 3,
      condition: (context) =>
        context.analytics.totalShares < context.analytics.totalViews * 0.01,
      generator: (context) => ({
        id: "promote-sharing",
        type: "feature",
        priority: "low",
        title: "Encourage Social Sharing",
        description:
          "Add social sharing buttons and encourage customers to share your listings.",
        impact: "Social sharing can increase organic reach by 50%",
        actionUrl: "/dashboard/social-tools",
        estimatedImprovement: 5,
        category: "Marketing",
      }),
    };
  }

  private createContactOptimizationRule(): RecommendationRule {
    return {
      id: "contact-optimization",
      name: "Contact Optimization",
      priority: 6,
      condition: (context) =>
        context.analytics.totalWhatsAppClicks >
        context.analytics.totalContacts * 2,
      generator: (context) => ({
        id: "optimize-contact-methods",
        type: "optimization",
        priority: "medium",
        title: "Optimize Contact Methods",
        description:
          "Customers prefer WhatsApp over other contact methods. Make WhatsApp more prominent.",
        impact: "Optimizing contact flow can increase conversions by 15%",
        actionUrl: "/dashboard/contact-settings",
        estimatedImprovement: 7,
        category: "User Experience",
      }),
    };
  }

  // Tier Progression Rules
  private createTierProgressionRule(): RecommendationRule {
    return {
      id: "tier-progression",
      name: "Tier Progression",
      priority: 4,
      condition: (context) => {
        const nextTierPoints = this.getNextTierPoints(context.seller.tier.name);
        const pointsNeeded = nextTierPoints - context.seller.tierPoints;
        return pointsNeeded > 0 && pointsNeeded <= nextTierPoints * 0.3; // Within 30% of next tier
      },
      generator: (context) => {
        const nextTierPoints = this.getNextTierPoints(context.seller.tier.name);
        const pointsNeeded = nextTierPoints - context.seller.tierPoints;

        return {
          id: "tier-progression",
          type: "feature",
          priority: "medium",
          title: "Reach Next Tier Level",
          description: `You're only ${pointsNeeded} points away from ${this.getNextTierName(context.seller.tier.name)} tier. Focus on customer satisfaction to earn more points.`,
          impact: "Higher tiers unlock premium features and better visibility",
          actionUrl: "/dashboard/tier-progress",
          estimatedImprovement: 10,
          category: "Growth",
        };
      },
    };
  }

  private createPointsOptimizationRule(): RecommendationRule {
    return {
      id: "points-optimization",
      name: "Points Optimization",
      priority: 3,
      condition: (context) => context.seller.tierPoints < 100, // New sellers
      generator: (context) => ({
        id: "earn-points",
        type: "feature",
        priority: "low",
        title: "Earn Your First Tier Points",
        description:
          "Complete your profile, get verified, and receive positive reviews to earn tier points.",
        impact: "Tier points unlock better features and visibility",
        actionUrl: "/dashboard/points-guide",
        estimatedImprovement: 5,
        category: "Getting Started",
      }),
    };
  }

  // Market Opportunity Rules
  private createMarketOpportunityRule(): RecommendationRule {
    return {
      id: "market-opportunity",
      name: "Market Opportunity",
      priority: 4,
      condition: (context) => {
        // Check if seller is in a top-performing category
        const sellerCategories = this.getSellerCategories(
          context.analytics.listingPerformance
        );
        return !sellerCategories.some((cat) =>
          context.benchmarks.topPerformingCategories.includes(cat)
        );
      },
      generator: (context) => ({
        id: "explore-categories",
        type: "feature",
        priority: "medium",
        title: "Explore High-Performing Categories",
        description: `Consider expanding into ${context.benchmarks.topPerformingCategories.slice(0, 2).join(" or ")} - these categories show strong performance.`,
        impact: "Diversifying into popular categories can increase visibility",
        actionUrl: "/dashboard/market-insights",
        estimatedImprovement: 12,
        category: "Growth",
      }),
    };
  }

  private createCategoryExpansionRule(): RecommendationRule {
    return {
      id: "category-expansion",
      name: "Category Expansion",
      priority: 3,
      condition: (context) =>
        context.analytics.listingPerformance.length >= 5 &&
        context.analytics.conversionRate > context.benchmarks.avgConversionRate,
      generator: (context) => ({
        id: "expand-categories",
        type: "feature",
        priority: "low",
        title: "Expand to New Categories",
        description:
          "Your performance is above average. Consider expanding to related categories to grow your business.",
        impact: "Category expansion can increase total revenue by 30%",
        actionUrl: "/dashboard/category-suggestions",
        estimatedImprovement: 8,
        category: "Growth",
      }),
    };
  }

  private createPricingOptimizationRule(): RecommendationRule {
    return {
      id: "pricing-optimization",
      name: "Pricing Optimization",
      priority: 5,
      condition: (context) =>
        context.analytics.totalViews > 100 &&
        context.analytics.conversionRate < 1,
      generator: (context) => ({
        id: "optimize-pricing",
        type: "optimization",
        priority: "medium",
        title: "Review Your Pricing Strategy",
        description:
          "High views but low conversion suggests pricing might be too high. Consider market research.",
        impact: "Competitive pricing can improve conversion by 25%",
        actionUrl: "/dashboard/pricing-insights",
        estimatedImprovement: 10,
        category: "Pricing",
      }),
    };
  }

  // Trend-based Rules
  private createTrendDeclineRule(): RecommendationRule {
    return {
      id: "trend-decline",
      name: "Performance Decline",
      priority: 9,
      condition: (context) =>
        context.trendAnalysis?.direction === "declining" &&
        context.trendAnalysis?.strength === "strong",
      generator: (context) => ({
        id: "address-decline",
        type: "improvement",
        priority: "high",
        title: "Address Performance Decline",
        description: `Your performance has declined by ${Math.abs(context.trendAnalysis?.changePercentage || 0).toFixed(1)}%. Review recent changes and customer feedback.`,
        impact: "Quick action can prevent further decline",
        actionUrl: "/dashboard/performance-analysis",
        estimatedImprovement: 15,
        category: "Performance",
      }),
    };
  }

  private createSeasonalOptimizationRule(): RecommendationRule {
    return {
      id: "seasonal-optimization",
      name: "Seasonal Optimization",
      priority: 4,
      condition: (context) => this.isSeasonalPeriod(),
      generator: (context) => ({
        id: "seasonal-tips",
        type: "feature",
        priority: "medium",
        title: "Optimize for Current Season",
        description:
          "Adjust your listings and pricing for seasonal demand patterns.",
        impact: "Seasonal optimization can boost performance by 20%",
        actionUrl: "/dashboard/seasonal-guide",
        estimatedImprovement: 8,
        category: "Seasonal",
      }),
    };
  }

  // Competitive Rules
  private createBenchmarkImprovementRule(): RecommendationRule {
    return {
      id: "benchmark-improvement",
      name: "Benchmark Improvement",
      priority: 6,
      condition: (context) => context.performanceScore.overall < 70,
      generator: (context) => ({
        id: "improve-benchmarks",
        type: "improvement",
        priority: "medium",
        title: "Improve Against Platform Average",
        description:
          "Your performance is below platform average. Focus on the areas highlighted in your performance breakdown.",
        impact:
          "Reaching average performance can increase visibility significantly",
        actionUrl: "/dashboard/benchmark-comparison",
        estimatedImprovement: 12,
        category: "Performance",
      }),
    };
  }

  private createTopPerformerRule(): RecommendationRule {
    return {
      id: "top-performer",
      name: "Top Performer",
      priority: 2,
      condition: (context) => context.performanceScore.overall >= 85,
      generator: (context) => ({
        id: "maintain-excellence",
        type: "feature",
        priority: "low",
        title: "Maintain Your Excellence",
        description:
          "You're performing excellently! Consider mentoring other sellers or exploring premium features.",
        impact: "Continued excellence builds long-term success",
        actionUrl: "/dashboard/premium-features",
        estimatedImprovement: 3,
        category: "Excellence",
      }),
    };
  }

  // Helper methods
  private getNextTierPoints(currentTier: string): number {
    const tierPoints = {
      Bronze: 500,
      Silver: 1500,
      Gold: 5000,
      Platinum: 15000,
    };
    return tierPoints[currentTier as keyof typeof tierPoints] || 500;
  }

  private getNextTierName(currentTier: string): string {
    const nextTiers = {
      Bronze: "Silver",
      Silver: "Gold",
      Gold: "Platinum",
      Platinum: "Diamond",
    };
    return nextTiers[currentTier as keyof typeof nextTiers] || "Silver";
  }

  private getSellerCategories(listings: ListingAnalytics[]): string[] {
    // This would extract categories from listing data
    // For now, return empty array as we don't have category data in the interface
    return [];
  }

  private isSeasonalPeriod(): boolean {
    const month = new Date().getMonth();
    // Consider Nov-Dec and Mar-Apr as seasonal periods
    return month >= 10 || month <= 3;
  }
}

/**
 * Generate recommendations for a seller
 */
export function generateSellerRecommendations(
  context: RecommendationContext
): Recommendation[] {
  const engine = new RecommendationsEngine();
  return engine.generateRecommendations(context);
}

/**
 * Get recommendations by category
 */
export function getRecommendationsByCategory(
  recommendations: Recommendation[]
): Record<string, Recommendation[]> {
  const categorized: Record<string, Recommendation[]> = {};

  recommendations.forEach((rec) => {
    if (!categorized[rec.category]) {
      categorized[rec.category] = [];
    }
    categorized[rec.category].push(rec);
  });

  return categorized;
}

/**
 * Filter recommendations by priority
 */
export function filterRecommendationsByPriority(
  recommendations: Recommendation[],
  priority: "high" | "medium" | "low"
): Recommendation[] {
  return recommendations.filter((rec) => rec.priority === priority);
}

/**
 * Get quick wins (high impact, easy to implement recommendations)
 */
export function getQuickWins(
  recommendations: Recommendation[]
): Recommendation[] {
  const quickWinIds = [
    "verify-basic",
    "verify-business",
    "improve-response-rate",
    "optimize-contact-methods",
  ];

  return recommendations.filter((rec) => quickWinIds.includes(rec.id));
}
