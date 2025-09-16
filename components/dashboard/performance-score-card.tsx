"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  SellerAnalytics,
  SellerProfile,
} from "@/types/dashboard";
import {
  TrendingUp,
  TrendingDown,
  Target,
  Star,
  MessageCircle,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { calculatePerformanceScore } from "@/lib/dashboard-utils";

interface PerformanceScoreCardProps {
  analytics: SellerAnalytics;
  sellerData: SellerProfile;
}

export function PerformanceScoreCard({
  analytics,
  sellerData,
}: PerformanceScoreCardProps) {
  const performanceScore = calculatePerformanceScore(analytics);

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

  return (
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
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
  );
}
