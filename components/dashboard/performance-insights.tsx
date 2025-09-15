"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  SellerAnalytics,
  SellerProfile,
  Recommendation,
} from "@/types/dashboard";
import {
  TrendingUp,
  TrendingDown,
  Target,
  Lightbulb,
  ArrowRight,
  Star,
  MessageCircle,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { calculatePerformanceScore } from "@/lib/dashboard-utils";

interface PerformanceInsightsProps {
  analytics: SellerAnalytics;
  sellerData: SellerProfile;
}

export function PerformanceInsights({
  analytics,
  sellerData,
}: PerformanceInsightsProps) {
  const performanceScore = calculatePerformanceScore(analytics);

  // Generate recommendations based on performance data
  const generateRecommendations = (): Recommendation[] => {
    const recommendations: Recommendation[] = [];

    // Conversion rate recommendations
    if (analytics.conversionRate < 2.0) {
      recommendations.push({
        id: "improve-conversion",
        type: "improvement",
        priority: "high",
        title: "Improve Listing Conversion Rate",
        description:
          "Your conversion rate is below average. Consider improving your listing photos, descriptions, and pricing.",
        impact: "Could increase contacts by 25-40%",
        actionUrl: "/dashboard/listings",
        estimatedImprovement: 30,
        category: "Conversion",
      });
    }

    // Response rate recommendations
    if (sellerData.responseRate < 85) {
      recommendations.push({
        id: "improve-response-time",
        type: "improvement",
        priority: "high",
        title: "Respond Faster to Inquiries",
        description:
          "Quick responses improve customer satisfaction and boost your seller rating.",
        impact: "Could improve rating by 0.3-0.5 points",
        actionUrl: "/dashboard/profile",
        estimatedImprovement: 20,
        category: "Customer Service",
      });
    }

    // Photo quality recommendations
    if (analytics.avgSessionDuration < 120) {
      recommendations.push({
        id: "improve-photos",
        type: "optimization",
        priority: "medium",
        title: "Add High-Quality Photos",
        description:
          "Users spend less time viewing your listings. Better photos can increase engagement.",
        impact: "Could increase views by 15-25%",
        actionUrl: "/dashboard/listings",
        estimatedImprovement: 20,
        category: "Content Quality",
      });
    }

    // Verification recommendations
    if (!sellerData.verificationStatus.isVerified) {
      recommendations.push({
        id: "complete-verification",
        type: "feature",
        priority: "high",
        title: "Complete Account Verification",
        description:
          "Verified sellers get 40% more contacts and higher search rankings.",
        impact: "Could increase contacts by 40%",
        actionUrl: "/dashboard/profile?tab=verification",
        estimatedImprovement: 40,
        category: "Trust & Safety",
      });
    }

    // Pricing recommendations
    if (analytics.bounceRate > 60) {
      recommendations.push({
        id: "review-pricing",
        type: "optimization",
        priority: "medium",
        title: "Review Your Pricing Strategy",
        description:
          "High bounce rate might indicate pricing issues. Consider market research.",
        impact: "Could reduce bounce rate by 20%",
        actionUrl: "/dashboard/analytics",
        estimatedImprovement: 15,
        category: "Pricing",
      });
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  };

  const recommendations = generateRecommendations();

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Needs Improvement";
  };

  const getPriorityColor = (priority: Recommendation["priority"]) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-50 border-red-200";
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "low":
        return "text-green-600 bg-green-50 border-green-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Performance Score Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Performance Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div
                  className={cn(
                    "text-3xl font-bold",
                    getScoreColor(performanceScore)
                  )}
                >
                  {performanceScore}/100
                </div>
                <p className="text-sm text-muted-foreground">
                  {getScoreLabel(performanceScore)}
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-sm">
                  {performanceScore >= 75 ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                  <span className="text-muted-foreground">vs last month</span>
                </div>
              </div>
            </div>

            <Progress value={performanceScore} className="h-2" />

            <div className="grid grid-cols-3 gap-4 pt-2">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Views</span>
                </div>
                <div className="text-lg font-bold">
                  {analytics.totalViews.toLocaleString()}
                </div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <MessageCircle className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Contacts</span>
                </div>
                <div className="text-lg font-bold">
                  {analytics.totalContacts}
                </div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Star className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Rating</span>
                </div>
                <div className="text-lg font-bold">
                  {sellerData.avgRating.toFixed(1)}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Performance Recommendations
            </div>
            <Badge variant="secondary" className="text-xs">
              {recommendations.length} suggestions
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recommendations.length === 0 ? (
            <div className="text-center py-6">
              <Target className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                Great job! No immediate recommendations at this time.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {recommendations.slice(0, 3).map((recommendation) => (
                <div
                  key={recommendation.id}
                  className="p-4 border rounded-lg space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-medium">
                          {recommendation.title}
                        </h4>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs",
                            getPriorityColor(recommendation.priority)
                          )}
                        >
                          {recommendation.priority}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {recommendation.description}
                      </p>
                      <p className="text-xs font-medium text-green-600">
                        {recommendation.impact}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {recommendation.category}
                    </Badge>
                    {recommendation.actionUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                        asChild
                      >
                        <a
                          href={recommendation.actionUrl}
                          className="flex items-center gap-1"
                        >
                          Take Action
                          <ArrowRight className="h-3 w-3" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              ))}

              {recommendations.length > 3 && (
                <div className="text-center pt-2">
                  <Button variant="ghost" size="sm" className="text-xs">
                    View All Recommendations ({recommendations.length})
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
