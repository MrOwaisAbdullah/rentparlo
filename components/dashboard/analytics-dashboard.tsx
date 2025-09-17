"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  TrendingUp,
  Users,
  Eye,
  MessageCircle,
  Smartphone,
  MapPin,
  BarChart3,
  LineChart,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileResponsiveWrapper } from "./mobile-responsive-wrapper";
import { MobileChartWrapper } from "./mobile-chart-wrapper";
import { AnalyticsDashboardProps, TimeRange } from "@/types/dashboard";
import { MetricsCard } from "./metrics-card";
import { ExportButton } from "./export-button";
import { AnalyticsExport } from "./analytics-export";
import { ListingPerformance } from "./listing-performance";
import {
  TrendChart,
  ConversionFunnel,
  DeviceBreakdown,
} from "./advanced-charts";
import { Skeleton } from "@/components/ui/skeleton";

export function AnalyticsDashboard({
  timeRange,
  onTimeRangeChange,
  data,
  loading,
}: AnalyticsDashboardProps) {
  const isMobile = useIsMobile();
  const [activeView, setActiveView] = useState<
    "overview" | "listings" | "devices"
  >("overview");

  const handleTimeRangePresetChange = (preset: string) => {
    const now = new Date();
    let start: Date;

    switch (preset) {
      case "today":
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case "week":
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "quarter":
        start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case "year":
        start = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        return;
    }

    onTimeRangeChange({
      start: start.toISOString().split("T")[0],
      end: now.toISOString().split("T")[0],
      preset: preset as TimeRange["preset"],
    });
  };

  if (loading) {
    return <AnalyticsLoadingSkeleton />;
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No analytics data available</p>
      </div>
    );
  }

  return (
    <MobileResponsiveWrapper
      className="space-y-6"
      mobileClassName="space-y-4 px-2"
      desktopClassName="space-y-6"
    >
      {/* Header with Time Range Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1
            className={`font-bold tracking-tight ${isMobile ? "text-2xl" : "text-3xl"}`}
            role="heading"
            aria-level={1}
            id="dashboard-title"
          >
            Analytics Dashboard
          </h1>
          <p
            className={`text-muted-foreground ${isMobile ? "text-sm" : ""}`}
            id="dashboard-description"
          >
            Comprehensive insights into your listing performance and seller
            metrics
          </p>
        </div>

        <div className={`flex gap-2 ${isMobile ? "flex-col" : "items-center"}`}>
          <Select
            value={timeRange.preset}
            onValueChange={handleTimeRangePresetChange}
          >
            <SelectTrigger
              className={isMobile ? "w-full" : "w-[180px]"}
              aria-label="Select time range for analytics data"
              aria-describedby="time-range-help"
            >
              <Calendar className="h-4 w-4 mr-2" aria-hidden="true" />
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent role="listbox" aria-label="Time range options">
              <SelectItem value="today" role="option">
                Today
              </SelectItem>
              <SelectItem value="week" role="option">
                Last 7 days
              </SelectItem>
              <SelectItem value="month" role="option">
                Last 30 days
              </SelectItem>
              <SelectItem value="quarter" role="option">
                Last 90 days
              </SelectItem>
              <SelectItem value="year" role="option">
                Last year
              </SelectItem>
            </SelectContent>
          </Select>
          <div id="time-range-help" className="sr-only">
            Choose a time period to filter your analytics data
          </div>

          <div className={`flex gap-2 ${isMobile ? "w-full" : "items-center"}`}>
            <ExportButton
              data={[data]}
              filename={`analytics-${timeRange.start}-${timeRange.end}`}
              format="csv"
              exportType="analytics"
              timeRange={timeRange}
              aria-label="Export analytics data as CSV file"
            />
            <AnalyticsExport
              analyticsData={data}
              timeRange={timeRange}
              aria-label="Export detailed analytics report"
            />
          </div>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div
        className={`grid gap-4 ${isMobile ? "grid-cols-1 sm:grid-cols-2" : "md:grid-cols-2 lg:grid-cols-4"}`}
        role="region"
        aria-label="Key performance metrics"
      >
        <MetricsCard
          title="Total Views"
          value={data.overview.totalViews.toLocaleString()}
          change={12.5}
          changeType="increase"
          icon={Eye}
          aria-label={`Total views: ${data.overview.totalViews.toLocaleString()}, increased by 12.5%`}
          trend={data.trends.slice(-7).map(t => t.views)}
        />
        <MetricsCard
          title="Total Contacts"
          value={data.overview.totalContacts.toLocaleString()}
          change={8.2}
          changeType="increase"
          icon={MessageCircle}
          aria-label={`Total contacts: ${data.overview.totalContacts.toLocaleString()}, increased by 8.2%`}
          trend={data.trends.slice(-7).map(t => t.contacts)}
        />
        <MetricsCard
          title="Contact Rate"
          icon={MessageCircle}
          value={`${data.overview.conversionRate.toFixed(1)}%`}
          aria-label={`Contact rate: ${data.overview.conversionRate.toFixed(1)}%, decreased by 2.1%`}
          trend={data.trends.slice(-7).map(t => t.contacts > 0 ? (t.contacts / Math.max(t.views, 1)) * 100 : 0)}
        />
        <MetricsCard
          title="Unique Visitors"
          value={data.overview.uniqueVisitors.toLocaleString()}
          change={15.3}
          changeType="increase"
          icon={Users}
          aria-label={`Unique visitors: ${data.overview.uniqueVisitors.toLocaleString()}, increased by 15.3%`}
          trend={data.trends.slice(-7).map(t => Math.floor(t.views * 0.7) + Math.floor(Math.random() * 100))}
        />
      </div>

      {/* Navigation Tabs */} 
      <Tabs
        value={activeView}
        onValueChange={(value) => setActiveView(value as typeof activeView)}
        className="w-full"
        aria-labelledby="dashboard-title"
        aria-describedby="dashboard-description"
      >
        <TabsList
          className={`grid w-full ${isMobile ? "grid-cols-2" : "grid-cols-3"}`}
          role="tablist"
          aria-label="Analytics dashboard sections"
        >
          <TabsTrigger
            value="overview"
            className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm"
            role="tab"
            aria-controls="overview-panel"
            aria-selected={activeView === "overview"}
            id="overview-tab"
          >
            <BarChart3 className="h-4 w-4" aria-hidden="true" />
            <span className={isMobile ? "text-xs" : "hidden sm:inline"}>
              Overview
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="listings"
            className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm"
            role="tab"
            aria-controls="listings-panel"
            aria-selected={activeView === "listings"}
            id="listings-tab"
          >
            <LineChart className="h-4 w-4" aria-hidden="true" />
            <span className={isMobile ? "text-xs" : "hidden sm:inline"}>
              Listings
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="devices"
            className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm"
            role="tab"
            aria-controls="devices-panel"
            aria-selected={activeView === "devices"}
            id="devices-tab"
          >
            <Smartphone className="h-4 w-4" aria-hidden="true" />
            <span className={isMobile ? "text-xs" : "hidden sm:inline"}>
              Devices
            </span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent
          value="overview"
          className={isMobile ? "space-y-4" : "space-y-6"}
          role="tabpanel"
          id="overview-panel"
          aria-labelledby="overview-tab"
        >
          <div
            className={`grid gap-6 ${isMobile ? "grid-cols-1" : "lg:grid-cols-2"}`}
          >
            {/* Performance Trends Chart - Only the chart should zoom/pan, not the entire card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Performance Trends
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Views and contacts over time
                </p>
              </CardHeader>
              <CardContent>
                <MobileChartWrapper
                  enableZoom={true}
                  enablePan={true}
                  enableFullscreen={true}
                  disableCardWrapper={true} // Disable card wrapper so only the chart zooms/pan
                >
                  <TrendChart
                    data={data.trends}
                    height={isMobile ? 250 : 350}
                    showBrush={!isMobile}
                    showZoom={!isMobile}
                  />
                </MobileChartWrapper>
              </CardContent>
            </Card>

            {/* Contact Funnel */}
            <MobileChartWrapper
              title="Contact Funnel"
              subtitle="User journey from views to contacts"
              enableZoom={false}
              enablePan={false}
              enableFullscreen={true}
            >
              <ConversionFunnel
                data={{
                  views: data.overview.totalViews,
                  contacts: data.overview.totalContacts,
                  conversions: data.overview.totalContacts, // Using contacts as conversions since that's what we're tracking
                }}
                height={isMobile ? 250 : 350}
              />
            </MobileChartWrapper>
          </div>

          {/* Additional Metrics */}
          <div
            className={`grid gap-4 ${isMobile ? "grid-cols-1 sm:grid-cols-2" : "md:grid-cols-3"}`}
            role="region"
            aria-label="Additional performance metrics"
          >
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Avg. Session Duration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`font-bold ${isMobile ? "text-xl" : "text-2xl"}`}
                  aria-label={`Average session duration: ${Math.floor(data.overview.avgSessionDuration / 60)} minutes ${data.overview.avgSessionDuration % 60} seconds`}
                >
                  {Math.floor(data.overview.avgSessionDuration / 60)}m{" "}
                  {data.overview.avgSessionDuration % 60}s
                </div>
                <p className="text-xs text-muted-foreground">
                  +5.2% from last period
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Bounce Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`font-bold ${isMobile ? "text-xl" : "text-2xl"}`}
                  aria-label={`Bounce rate: ${data.overview.bounceRate.toFixed(1)} percent`}
                >
                  {data.overview.bounceRate.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  -2.1% from last period
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Return Visitors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`font-bold ${isMobile ? "text-xl" : "text-2xl"}`}
                  aria-label={`Return visitors: ${Math.round((data.overview.uniqueVisitors / data.overview.totalViews) * 100)} percent`}
                >
                  {Math.round(
                    (data.overview.uniqueVisitors / data.overview.totalViews) *
                      100
                  )}
                  %
                </div>
                <p className="text-xs text-muted-foreground">
                  +8.3% from last period
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Listings Performance Tab */}
        <TabsContent
          value="listings"
          className={isMobile ? "space-y-4" : "space-y-6"}
          role="tabpanel"
          id="listings-panel"
          aria-labelledby="listings-tab"
        >
          <div className="flex justify-end mb-4">
            <ExportButton
              data={data.listings}
              filename={`listing-performance-${timeRange.start}-${timeRange.end}`}
              format="csv"
              exportType="listings"
              timeRange={timeRange}
              aria-label="Export listing performance data"
            />
          </div>
          <ListingPerformance listings={data.listings} loading={loading} />
        </TabsContent>

        {/* Device Analytics Tab */}
        <TabsContent
          value="devices"
          className={isMobile ? "space-y-4" : "space-y-6"}
          role="tabpanel"
          id="devices-panel"
          aria-labelledby="devices-tab"
        >
          <DeviceBreakdown
            data={data.devices}
            height={isMobile ? 250 : 300}
          />
        </TabsContent>
      </Tabs>
    </MobileResponsiveWrapper>
  );
}

function AnalyticsLoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>

      {/* Metrics Cards Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
