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
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  ReferenceLine,
} from "recharts";
import { TrendingUp, TrendingDown, Calendar, Info, Target } from "lucide-react";
import { PerformanceTrendPoint, TrendAnalysis } from "@/lib/performance-trends";
import { formatDate } from "@/lib/dashboard-utils";

interface PerformanceTrendsChartProps {
  trendData: PerformanceTrendPoint[];
  trendAnalysis: TrendAnalysis;
  forecast?: Array<{
    date: string;
    predictedScore: number;
    confidence: number;
    range: { min: number; max: number };
  }>;
  timeRange?: "month" | "quarter" | "year";
  onTimeRangeChange?: (range: "month" | "quarter" | "year") => void;
}

export function PerformanceTrendsChart({
  trendData,
  trendAnalysis,
  forecast,
  timeRange = "quarter",
  onTimeRangeChange,
}: PerformanceTrendsChartProps) {
  // Prepare chart data
  const chartData = trendData.map((point) => ({
    date: point.date,
    score: point.score,
    views: point.metrics.totalViews,
    contacts: point.metrics.totalContacts,
    conversionRate: point.metrics.conversionRate,
    formattedDate: formatDate(point.date + "-01"),
  }));

  // Add forecast data if available
  const forecastData =
    forecast?.map((point) => ({
      date: point.date,
      predictedScore: point.predictedScore,
      minScore: point.range.min,
      maxScore: point.range.max,
      confidence: point.confidence,
      formattedDate: formatDate(point.date + "-01"),
      isForecast: true,
    })) || [];

  const combinedData = [...chartData, ...forecastData];

  const getTrendColor = () => {
    switch (trendAnalysis.direction) {
      case "improving":
        return "text-green-600 bg-green-50 border-green-200";
      case "declining":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getTrendIcon = () => {
    switch (trendAnalysis.direction) {
      case "improving":
        return <TrendingUp className="h-4 w-4" />;
      case "declining":
        return <TrendingDown className="h-4 w-4" />;
      default:
        return <Target className="h-4 w-4" />;
    }
  };

  const getStrengthBadge = () => {
    const colors = {
      strong: "bg-blue-100 text-blue-800",
      moderate: "bg-yellow-100 text-yellow-800",
      weak: "bg-gray-100 text-gray-800",
    };

    return (
      <Badge className={colors[trendAnalysis.strength]} variant="secondary">
        {trendAnalysis.strength} trend
      </Badge>
    );
  };

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isForecast = data.isForecast;

      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{data.formattedDate}</p>
          {isForecast ? (
            <div className="space-y-1">
              <p className="text-sm">
                <span className="text-blue-600">Predicted Score:</span>{" "}
                {data.predictedScore}
              </p>
              <p className="text-sm">
                <span className="text-gray-600">Range:</span> {data.minScore} -{" "}
                {data.maxScore}
              </p>
              <p className="text-sm">
                <span className="text-gray-600">Confidence:</span>{" "}
                {data.confidence}%
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-sm">
                <span className="text-blue-600">Score:</span> {data.score}
              </p>
              <p className="text-sm">
                <span className="text-gray-600">Views:</span>{" "}
                {data.views.toLocaleString()}
              </p>
              <p className="text-sm">
                <span className="text-gray-600">Contacts:</span>{" "}
                {data.contacts.toLocaleString()}
              </p>
              <p className="text-sm">
                <span className="text-gray-600">Conversion:</span>{" "}
                {data.conversionRate.toFixed(1)}%
              </p>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Trend Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Performance Trends
              </CardTitle>
              <CardDescription>
                Track your performance changes over time
              </CardDescription>
            </div>

            {onTimeRangeChange && (
              <div className="flex gap-2">
                {(["month", "quarter", "year"] as const).map((range) => (
                  <Button
                    key={range}
                    variant={timeRange === range ? "default" : "outline"}
                    size="sm"
                    onClick={() => onTimeRangeChange(range)}
                  >
                    {range === "month"
                      ? "3M"
                      : range === "quarter"
                        ? "6M"
                        : "1Y"}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {/* Trend Analysis Summary */}
          <div className="flex items-center gap-4 mb-6 p-4 rounded-lg border">
            <div className={`p-2 rounded-lg ${getTrendColor()}`}>
              {getTrendIcon()}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium capitalize">
                  {trendAnalysis.direction}
                </span>
                {getStrengthBadge()}
              </div>

              <div className="text-sm text-gray-600">
                {trendAnalysis.changePercentage > 0 ? "+" : ""}
                {trendAnalysis.changePercentage.toFixed(1)}% change over{" "}
                {trendAnalysis.periodDays} days
                {trendAnalysis.confidence > 0 && (
                  <span className="ml-2">
                    • {trendAnalysis.confidence}% confidence
                  </span>
                )}
              </div>
            </div>

            <div className="text-right">
              <div className="text-2xl font-bold">
                {trendAnalysis.changePoints > 0 ? "+" : ""}
                {trendAnalysis.changePoints.toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">points</div>
            </div>
          </div>

          {/* Performance Chart */}
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={combinedData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis
                  dataKey="formattedDate"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />

                {/* Reference lines for performance categories */}
                <ReferenceLine y={85} stroke="#10b981" strokeDasharray="2 2" />
                <ReferenceLine y={70} stroke="#3b82f6" strokeDasharray="2 2" />
                <ReferenceLine y={55} stroke="#f59e0b" strokeDasharray="2 2" />

                {/* Historical performance area */}
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.1}
                  strokeWidth={2}
                  dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                  connectNulls={false}
                />

                {/* Forecast area */}
                {forecast && forecast.length > 0 && (
                  <>
                    <Area
                      type="monotone"
                      dataKey="predictedScore"
                      stroke="#8b5cf6"
                      fill="#8b5cf6"
                      fillOpacity={0.1}
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 3 }}
                      connectNulls={false}
                    />
                    <Area
                      type="monotone"
                      dataKey="maxScore"
                      stroke="transparent"
                      fill="#8b5cf6"
                      fillOpacity={0.05}
                    />
                    <Area
                      type="monotone"
                      dataKey="minScore"
                      stroke="transparent"
                      fill="#ffffff"
                      fillOpacity={1}
                    />
                  </>
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Chart Legend */}
          <div className="flex items-center justify-center gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>Historical Performance</span>
            </div>
            {forecast && forecast.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded opacity-60"></div>
                <span>Forecast</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Info className="h-3 w-3 text-gray-400" />
              <span className="text-gray-600">
                Lines show performance thresholds
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Breakdown Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Component Trends</CardTitle>
          <CardDescription>
            See how individual performance components have changed
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis
                  dataKey="formattedDate"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                />
                <YAxis tick={{ fontSize: 12 }} tickLine={false} />
                <Tooltip />

                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  name="Overall Score"
                />
                <Line
                  type="monotone"
                  dataKey="conversionRate"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  name="Conversion Rate"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
