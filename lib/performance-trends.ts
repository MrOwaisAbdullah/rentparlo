/**
 * Performance Trend Analysis
 * Analyzes historical performance data and identifies trends
 */

import { createClient } from "../utils/supabase/server";
import { SellerAnalytics, SellerProfile } from "@/types/dashboard";
import {
  calculatePerformanceScore,
  PerformanceScore,
} from "./performance-scoring";

export interface PerformanceTrendPoint {
  date: string;
  score: number;
  breakdown: {
    responseRate: number;
    conversionRate: number;
    customerRating: number;
    verification: number;
  };
  metrics: {
    totalViews: number;
    totalContacts: number;
    conversionRate: number;
    uniqueVisitors: number;
  };
}

export interface TrendAnalysis {
  direction: "improving" | "declining" | "stable";
  strength: "strong" | "moderate" | "weak";
  changePercentage: number;
  changePoints: number;
  periodDays: number;
  confidence: number; // 0-100
}

export interface PerformanceComparison {
  current: PerformanceTrendPoint;
  previous: PerformanceTrendPoint;
  change: {
    score: number;
    scorePercentage: number;
    views: number;
    viewsPercentage: number;
    contacts: number;
    contactsPercentage: number;
    conversionRate: number;
    conversionRatePercentage: number;
  };
  trend: TrendAnalysis;
}

/**
 * Get historical performance data for a seller
 */
export async function getSellerPerformanceHistory(
  sellerId: string,
  months: number = 6
): Promise<PerformanceTrendPoint[]> {
  const supabase = await createClient();

  try {
    const trends: PerformanceTrendPoint[] = [];
    const now = new Date();

    // Get data for each month
    for (let i = months - 1; i >= 0; i--) {
      const endDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 0); // Last day of month
      const startDate = new Date(now.getFullYear(), now.getMonth() - i, 1); // First day of month

      const monthData = await getSellerPerformanceForPeriod(
        sellerId,
        startDate.toISOString(),
        endDate.toISOString()
      );

      if (monthData) {
        trends.push({
          date: startDate.toISOString().substring(0, 7), // YYYY-MM format
          ...monthData,
        });
      }
    }

    return trends;
  } catch (error) {
    console.error("Error getting seller performance history:", error);
    return [];
  }
}

/**
 * Get seller performance data for a specific period
 */
async function getSellerPerformanceForPeriod(
  sellerId: string,
  startDate: string,
  endDate: string
): Promise<Omit<PerformanceTrendPoint, "date"> | null> {
  const supabase = await createClient();

  try {
    // Get analytics data for the period
    const { data: events, error: eventsError } = await supabase
      .from("analytics_events")
      .select("event_type, user_id, guest_id, listing_id, created_at")
      .eq("user_id", sellerId)
      .gte("created_at", startDate)
      .lte("created_at", endDate);

    if (eventsError) {
      console.error("Error fetching analytics events:", eventsError);
      return null;
    }

    // Get seller profile data (assuming it doesn't change much within a month)
    const { data: profile, error: profileError } = await supabase
      .from("seller_profiles")
      .select("*")
      .eq("id", sellerId)
      .single();

    if (profileError) {
      console.error("Error fetching seller profile:", profileError);
      return null;
    }

    // Get user data for additional profile information
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", sellerId)
      .single();

    if (userError) {
      console.error("Error fetching user data:", userError);
      return null;
    }

    // Process analytics events
    const analytics = processAnalyticsEvents(events || []);

    // Create seller profile object
    const sellerProfile: SellerProfile = {
      id: profile.id,
      name: user.name || "",
      email: user.email || "",
      phone: user.phone,
      avatar: user.avatar_url,
      tier: {
        name: profile.tier as any,
        level: getTierLevel(profile.tier),
        minPoints: getTierMinPoints(profile.tier),
        maxPoints: getTierMaxPoints(profile.tier),
        benefits: getTierBenefits(profile.tier),
      },
      tierPoints: profile.tier_points || 0,
      verificationStatus: {
        isVerified: profile.is_verified || false,
        phoneVerified: user.phone_verified || false,
        emailVerified: user.email_verified || false,
        documentVerified: profile.document_verified || false,
        businessVerified: profile.business_verified || false,
      },
      responseRate: profile.response_rate || 0,
      avgRating: profile.customer_rating || 0,
      totalRatings: profile.total_reviews || 0,
      joinedAt: user.created_at || "",
    };

    // Calculate performance score
    const performanceScore = calculatePerformanceScore(
      analytics,
      sellerProfile
    );

    return {
      score: performanceScore.overall,
      breakdown: performanceScore.breakdown,
      metrics: {
        totalViews: analytics.totalViews,
        totalContacts: analytics.totalContacts,
        conversionRate: analytics.conversionRate,
        uniqueVisitors: analytics.uniqueVisitors,
      },
    };
  } catch (error) {
    console.error("Error getting seller performance for period:", error);
    return null;
  }
}

/**
 * Process analytics events into aggregated metrics
 */
function processAnalyticsEvents(events: any[]): SellerAnalytics {
  const analytics = {
    totalViews: 0,
    totalContacts: 0,
    totalWhatsAppClicks: 0,
    totalShares: 0,
    totalSaves: 0,
    uniqueVisitors: new Set<string>(),
  };

  events.forEach((event) => {
    const visitorId = event.user_id || event.guest_id;
    if (visitorId) {
      analytics.uniqueVisitors.add(visitorId);
    }

    switch (event.event_type) {
      case "view":
        analytics.totalViews++;
        break;
      case "contact_click":
        analytics.totalContacts++;
        break;
      case "WhatsApp_click":
        analytics.totalWhatsAppClicks++;
        break;
      case "share":
        analytics.totalShares++;
        break;
      case "save":
        analytics.totalSaves++;
        break;
    }
  });

  const conversionRate =
    analytics.totalViews > 0
      ? ((analytics.totalContacts + analytics.totalWhatsAppClicks) /
          analytics.totalViews) *
        100
      : 0;

  return {
    sellerId: "",
    totalViews: analytics.totalViews,
    totalContacts: analytics.totalContacts,
    totalWhatsAppClicks: analytics.totalWhatsAppClicks,
    totalShares: analytics.totalShares,
    totalSaves: analytics.totalSaves,
    uniqueVisitors: analytics.uniqueVisitors.size,
    conversionRate,
    avgSessionDuration: 0,
    bounceRate: 0,
    topCities: [],
    topDevices: [],
    timeSeriesData: [],
    listingPerformance: [],
  };
}

/**
 * Analyze performance trends from historical data
 */
export function analyzePerformanceTrend(
  trendPoints: PerformanceTrendPoint[]
): TrendAnalysis {
  if (trendPoints.length < 2) {
    return {
      direction: "stable",
      strength: "weak",
      changePercentage: 0,
      changePoints: 0,
      periodDays: 0,
      confidence: 0,
    };
  }

  const firstPoint = trendPoints[0];
  const lastPoint = trendPoints[trendPoints.length - 1];

  const changePoints = lastPoint.score - firstPoint.score;
  const changePercentage =
    firstPoint.score > 0 ? (changePoints / firstPoint.score) * 100 : 0;

  // Calculate trend direction
  let direction: "improving" | "declining" | "stable";
  if (Math.abs(changePercentage) < 5) {
    direction = "stable";
  } else if (changePercentage > 0) {
    direction = "improving";
  } else {
    direction = "declining";
  }

  // Calculate trend strength
  let strength: "strong" | "moderate" | "weak";
  const absChangePercentage = Math.abs(changePercentage);
  if (absChangePercentage >= 20) {
    strength = "strong";
  } else if (absChangePercentage >= 10) {
    strength = "moderate";
  } else {
    strength = "weak";
  }

  // Calculate confidence based on data consistency
  const confidence = calculateTrendConfidence(trendPoints);

  // Calculate period in days
  const startDate = new Date(firstPoint.date);
  const endDate = new Date(lastPoint.date);
  const periodDays = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  return {
    direction,
    strength,
    changePercentage: Math.round(changePercentage * 100) / 100,
    changePoints: Math.round(changePoints * 100) / 100,
    periodDays,
    confidence,
  };
}

/**
 * Calculate trend confidence based on data consistency
 */
function calculateTrendConfidence(
  trendPoints: PerformanceTrendPoint[]
): number {
  if (trendPoints.length < 3) return 50;

  // Calculate how consistent the trend is
  let consistentChanges = 0;
  let totalChanges = 0;

  for (let i = 1; i < trendPoints.length; i++) {
    const currentChange = trendPoints[i].score - trendPoints[i - 1].score;

    if (i > 1) {
      const previousChange =
        trendPoints[i - 1].score - trendPoints[i - 2].score;

      // Check if changes are in the same direction
      if (
        (currentChange > 0 && previousChange > 0) ||
        (currentChange < 0 && previousChange < 0) ||
        (Math.abs(currentChange) < 2 && Math.abs(previousChange) < 2)
      ) {
        consistentChanges++;
      }
      totalChanges++;
    }
  }

  const consistencyRatio =
    totalChanges > 0 ? consistentChanges / totalChanges : 0;
  return Math.round(consistencyRatio * 100);
}

/**
 * Compare current performance with previous period
 */
export function comparePerformancePeriods(
  currentPeriod: PerformanceTrendPoint,
  previousPeriod: PerformanceTrendPoint
): PerformanceComparison {
  const scoreChange = currentPeriod.score - previousPeriod.score;
  const scorePercentage =
    previousPeriod.score > 0 ? (scoreChange / previousPeriod.score) * 100 : 0;

  const viewsChange =
    currentPeriod.metrics.totalViews - previousPeriod.metrics.totalViews;
  const viewsPercentage =
    previousPeriod.metrics.totalViews > 0
      ? (viewsChange / previousPeriod.metrics.totalViews) * 100
      : 0;

  const contactsChange =
    currentPeriod.metrics.totalContacts - previousPeriod.metrics.totalContacts;
  const contactsPercentage =
    previousPeriod.metrics.totalContacts > 0
      ? (contactsChange / previousPeriod.metrics.totalContacts) * 100
      : 0;

  const conversionChange =
    currentPeriod.metrics.conversionRate -
    previousPeriod.metrics.conversionRate;
  const conversionPercentage =
    previousPeriod.metrics.conversionRate > 0
      ? (conversionChange / previousPeriod.metrics.conversionRate) * 100
      : 0;

  // Analyze trend from just these two points
  const trend = analyzePerformanceTrend([previousPeriod, currentPeriod]);

  return {
    current: currentPeriod,
    previous: previousPeriod,
    change: {
      score: Math.round(scoreChange * 100) / 100,
      scorePercentage: Math.round(scorePercentage * 100) / 100,
      views: viewsChange,
      viewsPercentage: Math.round(viewsPercentage * 100) / 100,
      contacts: contactsChange,
      contactsPercentage: Math.round(contactsPercentage * 100) / 100,
      conversionRate: Math.round(conversionChange * 100) / 100,
      conversionRatePercentage: Math.round(conversionPercentage * 100) / 100,
    },
    trend,
  };
}

/**
 * Get performance forecasting based on historical trends
 */
export function forecastPerformance(
  trendPoints: PerformanceTrendPoint[],
  periodsAhead: number = 3
): Array<{
  date: string;
  predictedScore: number;
  confidence: number;
  range: { min: number; max: number };
}> {
  if (trendPoints.length < 3) {
    return [];
  }

  const trend = analyzePerformanceTrend(trendPoints);
  const lastPoint = trendPoints[trendPoints.length - 1];
  const avgMonthlyChange = trend.changePoints / (trendPoints.length - 1);

  const forecasts = [];

  for (let i = 1; i <= periodsAhead; i++) {
    const forecastDate = new Date(lastPoint.date);
    forecastDate.setMonth(forecastDate.getMonth() + i);

    const predictedScore = Math.max(
      0,
      Math.min(100, lastPoint.score + avgMonthlyChange * i)
    );

    // Confidence decreases with distance into future
    const confidence = Math.max(20, trend.confidence - i * 15);

    // Calculate prediction range based on confidence
    const range = (confidence / 100) * 10; // ±10 points at 100% confidence

    forecasts.push({
      date: forecastDate.toISOString().substring(0, 7),
      predictedScore: Math.round(predictedScore * 100) / 100,
      confidence: Math.round(confidence),
      range: {
        min: Math.max(0, Math.round((predictedScore - range) * 100) / 100),
        max: Math.min(100, Math.round((predictedScore + range) * 100) / 100),
      },
    });
  }

  return forecasts;
}

/**
 * Identify performance anomalies in trend data
 */
export function identifyPerformanceAnomalies(
  trendPoints: PerformanceTrendPoint[]
): Array<{
  date: string;
  type: "spike" | "drop" | "unusual";
  severity: "high" | "medium" | "low";
  description: string;
  impact: number;
}> {
  if (trendPoints.length < 3) {
    return [];
  }

  const anomalies = [];

  // Calculate moving average and standard deviation
  const scores = trendPoints.map((point) => point.score);
  const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  const stdDev = Math.sqrt(
    scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) /
      scores.length
  );

  for (let i = 1; i < trendPoints.length - 1; i++) {
    const current = trendPoints[i];
    const previous = trendPoints[i - 1];
    const next = trendPoints[i + 1];

    const changeFromPrevious = current.score - previous.score;
    const changeToNext = next.score - current.score;

    // Check for significant deviations
    const deviationFromMean = Math.abs(current.score - mean);

    if (deviationFromMean > stdDev * 2) {
      let type: "spike" | "drop" | "unusual";
      let severity: "high" | "medium" | "low";

      if (current.score > mean + stdDev * 2) {
        type = "spike";
      } else if (current.score < mean - stdDev * 2) {
        type = "drop";
      } else {
        type = "unusual";
      }

      if (deviationFromMean > stdDev * 3) {
        severity = "high";
      } else if (deviationFromMean > stdDev * 2.5) {
        severity = "medium";
      } else {
        severity = "low";
      }

      anomalies.push({
        date: current.date,
        type,
        severity,
        description: `Performance ${type} detected with ${deviationFromMean.toFixed(1)} point deviation from average`,
        impact: Math.round(deviationFromMean * 100) / 100,
      });
    }
  }

  return anomalies;
}

// Helper functions for tier information
function getTierLevel(tier: string): number {
  const levels = {
    basic: 1,
    bronze: 2,
    silver: 3,
    gold: 4,
    platinum: 5,
    diamond: 6,
  };
  return levels[tier.toLowerCase() as keyof typeof levels] || 1;
}

function getTierMinPoints(tier: string): number {
  const points = {
    basic: 0,
    bronze: 100,
    silver: 500,
    gold: 1500,
    platinum: 5000,
    diamond: 15000,
  };
  return points[tier.toLowerCase() as keyof typeof points] || 0;
}

function getTierMaxPoints(tier: string): number {
  const points = {
    basic: 99,
    bronze: 499,
    silver: 1499,
    gold: 4999,
    platinum: 14999,
    diamond: 50000,
  };
  return points[tier.toLowerCase() as keyof typeof points] || 99;
}

function getTierBenefits(tier: string): string[] {
  const benefits = {
    basic: ["Basic listing features"],
    bronze: ["Priority support", "Enhanced visibility"],
    silver: ["Advanced analytics", "Featured listings"],
    gold: ["Premium placement", "Marketing tools"],
    platinum: ["VIP support", "Custom branding"],
    diamond: ["Dedicated account manager", "API access"],
  };
  return (
    benefits[tier.toLowerCase() as keyof typeof benefits] || [
      "Basic listing features",
    ]
  );
}
