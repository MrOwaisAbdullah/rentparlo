"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  SellerAnalytics,
  SellerProfile,
  Recommendation,
} from "@/types/dashboard";
import {
  Lightbulb,
  ArrowRight,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PerformanceRecommendationsCardProps {
  analytics: SellerAnalytics;
  sellerData: SellerProfile;
}

export function PerformanceRecommendationsCard({
  analytics,
  sellerData,
}: PerformanceRecommendationsCardProps) {

  // Generate recommendations based on performance data
  const generateRecommendations = (): Recommendation[] => {
    const recommendations: Recommendation[] = [];

    // Contact rate recommendations
    if (analytics.conversionRate < 2.0) {
      recommendations.push({
        id: "improve-contact",
        type: "improvement",
        priority: "high",
        title: "Improve Listing Contact Rate",
        description:
          "Your contact rate is below average. Consider improving your listing photos, descriptions, and pricing.",
        impact: "Could increase contacts by 25-40%",
        actionUrl: "/dashboard/listings",
        estimatedImprovement: 30,
        category: "Contact",
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
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-col gap-2">
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
  );
}
