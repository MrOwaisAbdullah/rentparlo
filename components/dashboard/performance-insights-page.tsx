"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  TrendingUp,
  Award,
  Target,
  RefreshCw,
  Download,
  Settings,
} from "lucide-react";

// Import our performance components
import { PerformanceScoreDashboard } from "./performance-score-dashboard";
import { PerformanceTrendsChart } from "./performance-trends-chart";
import {
  AchievementSystem,
  generateSampleAchievements,
  generateSampleMilestones,
} from "./achievement-system";

// Import performance utilities
import {
  calculatePerformanceScore,
  compareAgainstBenchmarks,
  PerformanceScore,
  PlatformBenchmarks,
} from "@/lib/performance-scoring";
import {
  getSellerPerformanceHistory,
  analyzePerformanceTrend,
  comparePerformancePeriods,
  forecastPerformance,
  PerformanceTrendPoint,
  TrendAnalysis,
} from "@/lib/performance-trends";
import {
  generateSellerRecommendations,
  getRecommendationsByCategory,
  filterRecommendationsByPriority,
  getQuickWins,
  RecommendationContext,
} from "@/lib/recommendations-engine";

import {
  SellerProfile,
  SellerAnalytics,
  Recommendation,
} from "@/types/dashboard";

interface PerformanceInsightsPageProps {
  seller: SellerProfile;
  analytics: SellerAnalytics;
  benchmarks: PlatformBenchmarks;
  className?: string;
}

export function PerformanceInsightsPage({
  seller,
  analytics,
  benchmarks,
  className,
}: PerformanceInsightsPageProps) {
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState<"month" | "quarter" | "year">(
    "quarter"
  );
  const [performanceScore, setPerformanceScore] =
    useState<PerformanceScore | null>(null);
  const [trendData, setTrendData] = useState<PerformanceTrendPoint[]>([]);
  const [trendAnalysis, setTrendAnalysis] = useState<TrendAnalysis | null>(
    null
  );
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [forecast, setForecast] = useState<any[]>([]);
  const [ranking, setRanking] = useState<any>(null);

  // Calculate performance data
  useEffect(() => {
    const calculatePerformanceData = async () => {
      setLoading(true);

      try {
        // Calculate performance score
        const score = calculatePerformanceScore(analytics, seller);
        setPerformanceScore(score);

        // Generate sample trend data (in real app, this would come from API)
        const sampleTrends = generateSampleTrendData(seller.id, timeRange);
        setTrendData(sampleTrends);

        // Analyze trends
        const analysis = analyzePerformanceTrend(sampleTrends);
        setTrendAnalysis(analysis);

        // Generate forecast
        const forecastData = forecastPerformance(sampleTrends, 3);
        setForecast(forecastData);

        // Compare against benchmarks
        const benchmarkComparison = compareAgainstBenchmarks(
          score,
          analytics,
          seller,
          benchmarks
        );

        // Generate sample ranking
        setRanking({
          percentile: 75,
          ranking: "Top 25%",
          totalSellers: 1250,
        });

        // Generate recommendations
        const context: RecommendationContext = {
          seller,
          analytics,
          performanceScore: score,
          benchmarks,
          trends: sampleTrends,
          trendAnalysis: analysis,
        };

        const recs = generateSellerRecommendations(context);
        setRecommendations(recs);
      } catch (error) {
        console.error("Error calculating performance data:", error);
      } finally {
        setLoading(false);
      }
    };

    calculatePerformanceData();
  }, [seller, analytics, benchmarks, timeRange]);

  const handleRefresh = () => {
    // Trigger data refresh
    window.location.reload();
  };

  const handleExport = () => {
    // Export performance report
    console.log("Exporting performance report...");
  };

  const quickWins = getQuickWins(recommendations);
  const highPriorityRecs = filterRecommendationsByPriority(
    recommendations,
    "high"
  );
  const categorizedRecs = getRecommendationsByCategory(recommendations);

  // Generate sample achievements and milestones
  const achievements = generateSampleAchievements(seller, analytics);
  const milestones = generateSampleMilestones(seller, analytics);

  if (!performanceScore) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Performance Insights</h1>
          <p className="text-gray-600 mt-1">
            Comprehensive analysis of your seller performance and growth
            opportunities
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">
                  {performanceScore.overall}
                </div>
                <div className="text-sm text-gray-600">Performance Score</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold">
                  {ranking?.ranking || "N/A"}
                </div>
                <div className="text-sm text-gray-600">Platform Ranking</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">
                  {achievements.filter((a) => a.unlocked).length}
                </div>
                <div className="text-sm text-gray-600">Achievements</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-orange-600" />
              <div>
                <div className="text-2xl font-bold">{quickWins.length}</div>
                <div className="text-sm text-gray-600">Quick Wins</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm">Overview</TabsTrigger>
          <TabsTrigger value="trends" className="data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm">Trends</TabsTrigger>
          <TabsTrigger value="achievements" className="data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm">Achievements</TabsTrigger>
          <TabsTrigger value="recommendations" className="data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm">Recommendations</TabsTrigger>
        </TabsList>

        {/* Performance Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <PerformanceScoreDashboard
            performanceScore={performanceScore}
            recommendations={highPriorityRecs}
            ranking={ranking}
            trends={
              trendAnalysis
                ? {
                    direction: trendAnalysis.direction,
                    changePercentage: trendAnalysis.changePercentage,
                  }
                : undefined
            }
          />
        </TabsContent>

        {/* Performance Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <PerformanceTrendsChart
            trendData={trendData}
            trendAnalysis={trendAnalysis!}
            forecast={forecast}
            timeRange={timeRange}
            onTimeRangeChange={setTimeRange}
          />
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-6">
          <AchievementSystem
            seller={seller}
            analytics={analytics}
            achievements={achievements}
            milestones={milestones}
          />
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-6">
          <div className="grid gap-6">
            {/* Quick Wins */}
            {quickWins.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Quick Wins
                  </CardTitle>
                  <CardDescription>
                    High-impact actions you can take right now
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {quickWins.map((rec) => (
                      <div key={rec.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{rec.title}</h4>
                          <Badge variant="outline" className="text-green-600">
                            +{rec.estimatedImprovement} points
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          {rec.description}
                        </p>
                        <Button size="sm" className="w-full">
                          Take Action
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Categorized Recommendations */}
            {Object.entries(categorizedRecs).map(([category, recs]) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="capitalize">
                    {category} Recommendations
                  </CardTitle>
                  <CardDescription>
                    {recs.length} recommendation{recs.length !== 1 ? "s" : ""}{" "}
                    to improve your {category.toLowerCase()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recs.slice(0, 3).map((rec) => (
                      <div
                        key={rec.id}
                        className="flex items-start gap-3 p-4 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{rec.title}</h4>
                            <Badge
                              variant={
                                rec.priority === "high"
                                  ? "destructive"
                                  : rec.priority === "medium"
                                    ? "default"
                                    : "secondary"
                              }
                            >
                              {rec.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {rec.description}
                          </p>
                          <p className="text-xs text-gray-500">{rec.impact}</p>
                        </div>
                        {rec.estimatedImprovement && (
                          <Badge variant="outline" className="text-green-600">
                            +{rec.estimatedImprovement}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper function to generate sample trend data
function generateSampleTrendData(
  sellerId: string,
  timeRange: "month" | "quarter" | "year"
): PerformanceTrendPoint[] {
  const months = timeRange === "month" ? 3 : timeRange === "quarter" ? 6 : 12;
  const trends: PerformanceTrendPoint[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);

    // Generate sample data with some variation
    const baseScore = 70 + Math.random() * 20;
    const views = Math.floor(50 + Math.random() * 200);
    const contacts = Math.floor(views * (0.02 + Math.random() * 0.03));
    const conversionRate = contacts > 0 ? (contacts / views) * 100 : 0;

    trends.push({
      date: date.toISOString().substring(0, 7),
      score: Math.round(baseScore),
      breakdown: {
        responseRate: Math.round(75 + Math.random() * 20),
        conversionRate: Math.round(baseScore * 0.8),
        customerRating: Math.round(80 + Math.random() * 15),
        verification: Math.round(60 + Math.random() * 30),
      },
      metrics: {
        totalViews: views,
        totalContacts: contacts,
        conversionRate: Math.round(conversionRate * 100) / 100,
        uniqueVisitors: Math.floor(views * 0.7),
      },
    });
  }

  return trends;
}
