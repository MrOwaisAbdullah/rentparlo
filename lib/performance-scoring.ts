/**
 * Performance Scoring Algorithm for Seller Dashboard
 * Calculates comprehensive performance scores based on multiple metrics
 */

import {
  SellerAnalytics,
  SellerProfile,
  ListingAnalytics,
} from "@/types/dashboard";

// Performance scoring weights and thresholds
export const PERFORMANCE_WEIGHTS = {
  responseRate: 0.25,
  conversionRate: 0.3,
  customerRating: 0.25,
  verification: 0.2,
} as const;

export const PERFORMANCE_THRESHOLDS = {
  conversionRate: {
    excellent: 5.0, // 5% conversion rate
    good: 3.0, // 3% conversion rate
    average: 1.5, // 1.5% conversion rate
    poor: 0.5, // 0.5% conversion rate
  },
  responseRate: {
    excellent: 95, // 95% response rate
    good: 85, // 85% response rate
    average: 70, // 70% response rate
    poor: 50, // 50% response rate
  },
  customerRating: {
    excellent: 4.5, // 4.5/5 stars
    good: 4.0, // 4.0/5 stars
    average: 3.5, // 3.5/5 stars
    poor: 3.0, // 3.0/5 stars
  },
} as const;

export interface PerformanceScore {
  overall: number;
  breakdown: {
    responseRate: number;
    conversionRate: number;
    customerRating: number;
    verification: number;
  };
  grade: "A+" | "A" | "B+" | "B" | "C+" | "C" | "D" | "F";
  category: "Excellent" | "Good" | "Average" | "Needs Improvement";
}

export interface PlatformBenchmarks {
  avgConversionRate: number;
  avgResponseRate: number;
  avgCustomerRating: number;
  avgViewsPerListing: number;
  topPerformingCategories: string[];
  medianPerformanceScore: number;
}

export interface PerformanceTrend {
  period: string;
  score: number;
  change: number;
  changePercentage: number;
}

/**
 * Calculate normalized score (0-100) for a metric
 */
function normalizeScore(
  value: number,
  thresholds: {
    excellent: number;
    good: number;
    average: number;
    poor: number;
  },
  isHigherBetter: boolean = true
): number {
  if (isHigherBetter) {
    if (value >= thresholds.excellent) return 100;
    if (value >= thresholds.good) return 85;
    if (value >= thresholds.average) return 70;
    if (value >= thresholds.poor) return 50;
    return Math.max(0, (value / thresholds.poor) * 50);
  } else {
    // For metrics where lower is better (not used in current implementation)
    if (value <= thresholds.excellent) return 100;
    if (value <= thresholds.good) return 85;
    if (value <= thresholds.average) return 70;
    if (value <= thresholds.poor) return 50;
    return Math.max(0, 50 - ((value - thresholds.poor) / thresholds.poor) * 50);
  }
}

/**
 * Calculate verification score based on verification status
 */
function calculateVerificationScore(profile: SellerProfile): number {
  const verificationStatus = profile.verificationStatus;
  let score = 0;

  // Base verification (email + phone)
  if (verificationStatus.emailVerified) score += 20;
  if (verificationStatus.phoneVerified) score += 20;

  // Identity verification
  if (verificationStatus.documentVerified) score += 30;

  // Business verification (highest value)
  if (verificationStatus.businessVerified) score += 30;

  return Math.min(score, 100);
}

/**
 * Calculate performance grade based on overall score
 */
function calculateGrade(score: number): PerformanceScore["grade"] {
  if (score >= 95) return "A+";
  if (score >= 90) return "A";
  if (score >= 85) return "B+";
  if (score >= 80) return "B";
  if (score >= 75) return "C+";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}

/**
 * Calculate performance category based on overall score
 */
function calculateCategory(score: number): PerformanceScore["category"] {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 55) return "Average";
  return "Needs Improvement";
}

/**
 * Main function to calculate comprehensive performance score
 */
export function calculatePerformanceScore(
  analytics: SellerAnalytics,
  profile: SellerProfile
): PerformanceScore {
  // Calculate individual component scores
  const conversionRateScore = normalizeScore(
    analytics.conversionRate,
    PERFORMANCE_THRESHOLDS.conversionRate
  );

  const responseRateScore = normalizeScore(
    profile.responseRate,
    PERFORMANCE_THRESHOLDS.responseRate
  );

  const customerRatingScore = normalizeScore(
    profile.avgRating,
    PERFORMANCE_THRESHOLDS.customerRating
  );

  const verificationScore = calculateVerificationScore(profile);

  // Calculate weighted overall score
  const overallScore = Math.round(
    conversionRateScore * PERFORMANCE_WEIGHTS.conversionRate +
      responseRateScore * PERFORMANCE_WEIGHTS.responseRate +
      customerRatingScore * PERFORMANCE_WEIGHTS.customerRating +
      verificationScore * PERFORMANCE_WEIGHTS.verification
  );

  return {
    overall: overallScore,
    breakdown: {
      responseRate: responseRateScore,
      conversionRate: conversionRateScore,
      customerRating: customerRatingScore,
      verification: verificationScore,
    },
    grade: calculateGrade(overallScore),
    category: calculateCategory(overallScore),
  };
}

/**
 * Calculate performance trends over time
 */
export function calculatePerformanceTrends(
  historicalData: Array<{
    period: string;
    analytics: SellerAnalytics;
    profile: SellerProfile;
  }>
): PerformanceTrend[] {
  const trends: PerformanceTrend[] = [];

  for (let i = 0; i < historicalData.length; i++) {
    const current = historicalData[i];
    const score = calculatePerformanceScore(
      current.analytics,
      current.profile
    ).overall;

    let change = 0;
    let changePercentage = 0;

    if (i > 0) {
      const previous = historicalData[i - 1];
      const previousScore = calculatePerformanceScore(
        previous.analytics,
        previous.profile
      ).overall;
      change = score - previousScore;
      changePercentage = previousScore > 0 ? (change / previousScore) * 100 : 0;
    }

    trends.push({
      period: current.period,
      score,
      change,
      changePercentage: Math.round(changePercentage * 100) / 100,
    });
  }

  return trends;
}

/**
 * Compare seller performance against platform benchmarks
 */
export function compareAgainstBenchmarks(
  sellerScore: PerformanceScore,
  analytics: SellerAnalytics,
  profile: SellerProfile,
  benchmarks: PlatformBenchmarks
): {
  overallRanking: "Top 10%" | "Top 25%" | "Top 50%" | "Below Average";
  conversionVsBenchmark: number;
  responseVsBenchmark: number;
  ratingVsBenchmark: number;
  viewsVsBenchmark: number;
  recommendations: string[];
} {
  // Calculate ranking based on overall score
  let overallRanking: "Top 10%" | "Top 25%" | "Top 50%" | "Below Average";
  if (sellerScore.overall >= benchmarks.medianPerformanceScore * 1.3) {
    overallRanking = "Top 10%";
  } else if (sellerScore.overall >= benchmarks.medianPerformanceScore * 1.15) {
    overallRanking = "Top 25%";
  } else if (sellerScore.overall >= benchmarks.medianPerformanceScore) {
    overallRanking = "Top 50%";
  } else {
    overallRanking = "Below Average";
  }

  // Calculate performance vs benchmarks (percentage difference)
  const conversionVsBenchmark =
    benchmarks.avgConversionRate > 0
      ? ((analytics.conversionRate - benchmarks.avgConversionRate) /
          benchmarks.avgConversionRate) *
        100
      : 0;

  const responseVsBenchmark =
    benchmarks.avgResponseRate > 0
      ? ((profile.responseRate - benchmarks.avgResponseRate) /
          benchmarks.avgResponseRate) *
        100
      : 0;

  const ratingVsBenchmark =
    benchmarks.avgCustomerRating > 0
      ? ((profile.avgRating - benchmarks.avgCustomerRating) /
          benchmarks.avgCustomerRating) *
        100
      : 0;

  const avgViewsPerListing =
    analytics.listingPerformance.length > 0
      ? analytics.totalViews / analytics.listingPerformance.length
      : 0;

  const viewsVsBenchmark =
    benchmarks.avgViewsPerListing > 0
      ? ((avgViewsPerListing - benchmarks.avgViewsPerListing) /
          benchmarks.avgViewsPerListing) *
        100
      : 0;

  // Generate recommendations based on performance gaps
  const recommendations: string[] = [];

  if (conversionVsBenchmark < -20) {
    recommendations.push(
      "Focus on improving listing quality and response time to increase conversion rate"
    );
  }
  if (responseVsBenchmark < -15) {
    recommendations.push(
      "Respond to inquiries faster to improve customer satisfaction"
    );
  }
  if (ratingVsBenchmark < -10) {
    recommendations.push(
      "Work on customer service to improve ratings and reviews"
    );
  }
  if (viewsVsBenchmark < -25) {
    recommendations.push(
      "Optimize listing titles and descriptions to increase visibility"
    );
  }
  if (!profile.verificationStatus.businessVerified) {
    recommendations.push(
      "Complete business verification to build trust with customers"
    );
  }

  return {
    overallRanking,
    conversionVsBenchmark: Math.round(conversionVsBenchmark * 100) / 100,
    responseVsBenchmark: Math.round(responseVsBenchmark * 100) / 100,
    ratingVsBenchmark: Math.round(ratingVsBenchmark * 100) / 100,
    viewsVsBenchmark: Math.round(viewsVsBenchmark * 100) / 100,
    recommendations,
  };
}

/**
 * Calculate listing-level performance scores
 */
export function calculateListingPerformanceScores(
  listings: ListingAnalytics[]
): Array<ListingAnalytics & { performanceScore: number; category: string }> {
  return listings.map((listing) => {
    // Calculate listing performance score based on engagement metrics
    const viewsScore = Math.min(listing.views / 100, 1) * 30; // Max 30 points for views
    const conversionScore = Math.min(listing.conversionRate / 5, 1) * 40; // Max 40 points for conversion
    const engagementScore =
      Math.min((listing.shares + listing.saves) / 50, 1) * 20; // Max 20 points for engagement
    const timeScore = Math.min(listing.avgTimeOnPage / 120, 1) * 10; // Max 10 points for time on page

    const performanceScore = Math.round(
      viewsScore + conversionScore + engagementScore + timeScore
    );

    let category: string;
    if (performanceScore >= 80) category = "High Performer";
    else if (performanceScore >= 60) category = "Good Performer";
    else if (performanceScore >= 40) category = "Average Performer";
    else category = "Needs Attention";

    return {
      ...listing,
      performanceScore,
      category,
    };
  });
}

/**
 * Generate performance insights based on score analysis
 */
export function generatePerformanceInsights(
  score: PerformanceScore,
  trends: PerformanceTrend[],
  benchmarkComparison: ReturnType<typeof compareAgainstBenchmarks>
): Array<{
  type: "positive" | "negative" | "neutral";
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
}> {
  const insights: Array<{
    type: "positive" | "negative" | "neutral";
    title: string;
    description: string;
    priority: "high" | "medium" | "low";
  }> = [];

  // Overall performance insights
  if (score.overall >= 85) {
    insights.push({
      type: "positive",
      title: "Excellent Performance",
      description: `Your overall performance score of ${score.overall} puts you in the top tier of sellers.`,
      priority: "low",
    });
  } else if (score.overall < 60) {
    insights.push({
      type: "negative",
      title: "Performance Needs Improvement",
      description: `Your performance score of ${score.overall} is below average. Focus on the recommendations to improve.`,
      priority: "high",
    });
  }

  // Trend analysis
  const latestTrend = trends[trends.length - 1];
  if (latestTrend && latestTrend.changePercentage > 10) {
    insights.push({
      type: "positive",
      title: "Improving Performance",
      description: `Your performance has improved by ${latestTrend.changePercentage.toFixed(1)}% in the latest period.`,
      priority: "medium",
    });
  } else if (latestTrend && latestTrend.changePercentage < -10) {
    insights.push({
      type: "negative",
      title: "Declining Performance",
      description: `Your performance has declined by ${Math.abs(latestTrend.changePercentage).toFixed(1)}% in the latest period.`,
      priority: "high",
    });
  }

  // Component-specific insights
  if (score.breakdown.verification < 70) {
    insights.push({
      type: "negative",
      title: "Verification Incomplete",
      description:
        "Complete your profile verification to build trust and improve your score.",
      priority: "high",
    });
  }

  if (score.breakdown.conversionRate < 50) {
    insights.push({
      type: "negative",
      title: "Low Conversion Rate",
      description:
        "Your conversion rate is below average. Consider improving your listing quality and response time.",
      priority: "high",
    });
  }

  if (score.breakdown.customerRating < 60) {
    insights.push({
      type: "negative",
      title: "Customer Rating Needs Attention",
      description:
        "Focus on customer service to improve your ratings and reviews.",
      priority: "medium",
    });
  }

  // Benchmark comparison insights
  if (benchmarkComparison.overallRanking === "Top 10%") {
    insights.push({
      type: "positive",
      title: "Top Performer",
      description:
        "You are performing better than 90% of sellers on the platform.",
      priority: "low",
    });
  }

  return insights;
}
