"use client";

import { useState, useEffect } from "react";
import { AnalyticsDashboard } from "@/components/dashboard/analytics-dashboard";
import { TimeRange, AnalyticsData } from "@/types/dashboard";
import { createMockAnalyticsData } from "@/lib/dashboard-mock-data";

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    end: new Date().toISOString().split("T")[0],
    preset: "month",
  });

  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call to fetch analytics data
    const fetchAnalyticsData = async () => {
      setLoading(true);
      try {
        // In a real app, this would be an API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const mockData = createMockAnalyticsData(timeRange);
        setAnalyticsData(mockData);
      } catch (error) {
        console.error("Failed to fetch analytics data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [timeRange]);

  const handleTimeRangeChange = (newRange: TimeRange) => {
    setTimeRange(newRange);
  };

  if (!analyticsData && !loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Failed to load analytics data</p>
      </div>
    );
  }

  return (
    <AnalyticsDashboard
      timeRange={timeRange}
      onTimeRangeChange={handleTimeRangeChange}
      data={analyticsData}
      loading={loading}
    />
  );
}
