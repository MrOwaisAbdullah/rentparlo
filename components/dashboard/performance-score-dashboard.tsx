"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Award,
  Target,
  CheckCircle,
  AlertCircle,
  Info,
  ExternalLink,
} from "lucide-react";
import { PerformanceScore } from "@/lib/performance-scoring";
import { Recommendation } from "@/types/dashboard";

interface PerformanceScoreDashboardProps {
  performanceScore: PerformanceScore;
  recommendations: Recommendation[];
  ranking?: {
    percentile: number;
    ranking: string;
    totalSellers: number;
  };
  trends?: {
    direction: "improving" | "declining" | "stable";
    changePercentage: number;
  };
}

export function PerformanceScoreDashboard({
  performanceScore,
  recommendations,
  ranking,
  trends,
}: PerformanceScoreDashboardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-green-600 bg-green-50 border-green-200";
    if (score >= 70) return "text-blue-600 bg-blue-50 border-blue-200";
    if (score >= 55) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  const getGradeColor = (grade: string) => {
    if (grade.startsWith("A")) return "text-green-600 bg-green-100";
    if (grade.startsWith("B")) return "text-blue-600 bg-blue-100";
    if (grade.startsWith("C")) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const getTrendIcon = () => {
    if (!trends) return <Minus className="h-4 w-4" />;

    switch (trends.direction) {
      case "improving":
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "declining":
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const highPriorityRecommendations = recommendations
    .filter((r) => r.priority === "high")
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Overall Performance Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Performance Score
          </CardTitle>
          <CardDescription>
            Your overall performance based on conversion rate, response time,
            ratings, and verification
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div
                className={`text-4xl font-bold px-4 py-2 rounded-lg border ${getScoreColor(performanceScore.overall)}`}
              >
                {performanceScore.overall}
              </div>
              <div className="space-y-1">
                <Badge
                  className={getGradeColor(performanceScore.grade)}
                  variant="secondary"
                >
                  Grade {performanceScore.grade}
                </Badge>
                <p className="text-sm text-gray-600">
                  {performanceScore.category}
                </p>
              </div>
            </div>

            <div className="text-right space-y-2">
              {trends && (
                <div className="flex items-center gap-2">
                  {getTrendIcon()}
                  <span className="text-sm font-medium">
                    {trends.changePercentage > 0 ? "+" : ""}
                    {trends.changePercentage.toFixed(1)}%
                  </span>
                </div>
              )}
              {ranking && (
                <div className="text-sm text-gray-600">
                  {ranking.ranking} of sellers
                </div>
              )}
            </div>
          </div>

          {/* Performance Breakdown */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Response Rate</span>
                <span className="font-medium">
                  {performanceScore.breakdown.responseRate}/100
                </span>
              </div>
              <Progress
                value={performanceScore.breakdown.responseRate}
                className="h-2"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Conversion</span>
                <span className="font-medium">
                  {performanceScore.breakdown.conversionRate}/100
                </span>
              </div>
              <Progress
                value={performanceScore.breakdown.conversionRate}
                className="h-2"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Rating</span>
                <span className="font-medium">
                  {performanceScore.breakdown.customerRating}/100
                </span>
              </div>
              <Progress
                value={performanceScore.breakdown.customerRating}
                className="h-2"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Verification</span>
                <span className="font-medium">
                  {performanceScore.breakdown.verification}/100
                </span>
              </div>
              <Progress
                value={performanceScore.breakdown.verification}
                className="h-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions & Recommendations */}
      {highPriorityRecommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Priority Recommendations
            </CardTitle>
            <CardDescription>
              Take these actions to improve your performance score quickly
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {highPriorityRecommendations.map((recommendation) => (
                <div
                  key={recommendation.id}
                  className="flex items-start gap-3 p-4 border rounded-lg"
                >
                  <div className="flex-shrink-0 mt-1">
                    {recommendation.priority === "high" ? (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    ) : (
                      <Info className="h-5 w-5 text-blue-500" />
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{recommendation.title}</h4>
                      {recommendation.estimatedImprovement && (
                        <Badge variant="outline" className="text-green-600">
                          +{recommendation.estimatedImprovement} points
                        </Badge>
                      )}
                    </div>

                    <p className="text-sm text-gray-600">
                      {recommendation.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {recommendation.impact}
                      </span>
                      {recommendation.actionUrl && (
                        <Button size="sm" variant="outline" className="h-8">
                          Take Action
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Insights */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Strengths */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              Your Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(performanceScore.breakdown)
                .filter(([_, score]) => score >= 75)
                .map(([category, score]) => (
                  <div
                    key={category}
                    className="flex items-center justify-between"
                  >
                    <span className="capitalize text-sm">
                      {category.replace(/([A-Z])/g, " $1").trim()}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-green-600">
                        {score}/100
                      </span>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                  </div>
                ))}

              {Object.entries(performanceScore.breakdown).filter(
                ([_, score]) => score >= 75
              ).length === 0 && (
                <p className="text-sm text-gray-500">
                  Focus on improving your scores to see strengths here.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Areas for Improvement */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-600">
              <AlertCircle className="h-5 w-5" />
              Areas for Improvement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(performanceScore.breakdown)
                .filter(([_, score]) => score < 75)
                .sort(([, a], [, b]) => a - b)
                .map(([category, score]) => (
                  <div
                    key={category}
                    className="flex items-center justify-between"
                  >
                    <span className="capitalize text-sm">
                      {category.replace(/([A-Z])/g, " $1").trim()}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-orange-600">
                        {score}/100
                      </span>
                      <div className="w-16">
                        <Progress value={score} className="h-2" />
                      </div>
                    </div>
                  </div>
                ))}

              {Object.entries(performanceScore.breakdown).filter(
                ([_, score]) => score < 75
              ).length === 0 && (
                <p className="text-sm text-gray-500">
                  Great job! All your performance areas are strong.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
