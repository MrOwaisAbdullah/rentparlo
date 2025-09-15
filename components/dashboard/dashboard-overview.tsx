"use client";

import React, { memo, useMemo, useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MetricsCard } from "./metrics-card";
import { QuickActions } from "./quick-actions";
import { UsageProgress } from "./usage-progress";
import { NotificationsPanel } from "./notifications-panel";
import { PerformanceInsights } from "./performance-insights";
import { MobileResponsiveWrapper } from "./mobile-responsive-wrapper";
import { QuickListingCreator } from "./quick-listing-creator";
import { CustomAnalyticsReports } from "./custom-analytics-reports";
import { DashboardOverviewProps, QuickAction } from "@/types/dashboard";
import { formatDate, calculatePerformanceScore } from "@/lib/dashboard-utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { dashboardQueryOptimizer } from "@/lib/dashboard-query-optimizer";
import {
  useMemoizedCalculations,
  useOptimizedDataFetching,
} from "@/lib/dashboard-performance-optimizer";
import { performanceTracker } from "@/lib/performance-metrics";
import {
  Eye,
  MessageCircle,
  Package,
  Star,
  TrendingUp,
  Plus,
  BarChart3,
  Settings,
  Bell,
  Clock,
  Edit,
} from "lucide-react";

// Memoized sub-components for better performance
const MemoizedMetricsCard = memo(MetricsCard);
const MemoizedQuickActions = memo(QuickActions);
const MemoizedUsageProgress = memo(UsageProgress);
const MemoizedNotificationsPanel = memo(NotificationsPanel);
const MemoizedPerformanceInsights = memo(PerformanceInsights);

// Optimized activity item component
const ActivityItem = memo(
  ({ activity, formatActivityDate, getActivityIcon }: any) => (
    <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50">
      <div className="mt-1">{getActivityIcon(activity.type)}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{activity.listingTitle}</p>
        <p className="text-xs text-muted-foreground">
          {activity.type === "view" && "New view"}
          {activity.type === "contact" && "New contact"}
          {activity.type === "whatsapp" && "WhatsApp click"}
          {activity.userLocation && ` from ${activity.userLocation}`}
        </p>
      </div>
      <div className="text-xs text-muted-foreground">
        {formatActivityDate(activity.timestamp)}
      </div>
    </div>
  )
);

// Optimized listing item component
const ListingItem = memo(({ listing, isMobile }: any) => (
  <div className="border rounded-lg p-4 space-y-2">
    <div className="flex items-start justify-between">
      <h4 className="font-medium text-sm truncate">{listing.title}</h4>
      <Badge
        variant={listing.status === "active" ? "default" : "secondary"}
        className="text-xs"
      >
        {listing.status}
      </Badge>
    </div>
    <p className="text-xs text-muted-foreground">
      {new Intl.NumberFormat("en-PK", {
        style: "currency",
        currency: "PKR",
        minimumFractionDigits: 0,
      }).format(listing.price)}
      /{listing.priceType}
    </p>
    <div className={`flex gap-1 ${isMobile ? "flex-col" : ""}`}>
      <Button
        asChild
        size={isMobile ? "sm" : "sm"}
        variant="outline"
        className="flex-1"
      >
        <Link href={`/listing/${listing.slug?.current}`}>
          <Eye className="h-3 w-3 mr-1" />
          View
        </Link>
      </Button>
      <Button
        asChild
        size={isMobile ? "sm" : "sm"}
        variant="outline"
        className="flex-1"
      >
        <Link href={`/dashboard/listings/edit/${listing._id}`}>
          <Edit className="h-3 w-3 mr-1" />
          Edit
        </Link>
      </Button>
    </div>
  </div>
));

export const DashboardOverview = memo(function DashboardOverview({
  sellerData,
  analytics,
  subscription,
  recentActivity,
  listings = [],
  categories = [],
}: DashboardOverviewProps) {
  const isMobile = useIsMobile();
  const { calculateMetrics } = useMemoizedCalculations();
  const { fetchWithCache } = useOptimizedDataFetching();
  const [isLoading, setIsLoading] = useState(false);
  const [enhancedMetrics, setEnhancedMetrics] = useState(null);

  // Memoized calculations
  const metricsChanges = useMemo(
    () => ({
      views: 12.5,
      contacts: 8.3,
      listings: 0,
      tier: 5.2,
    }),
    []
  );

  const performanceScore = useMemo(
    () => calculatePerformanceScore(analytics),
    [analytics, calculateMetrics]
  );

  // Calculate contact rate (not conversion rate since we can't track actual conversions)
  // Contact Rate = (Contact Button Clicks / Total Views) × 100
  // This shows the percentage of viewers who showed interest by clicking contact buttons
  // We cannot track actual rentals since conversations happen on WhatsApp/phone calls
  const contactRate = useMemo(
    () =>
      analytics.totalViews > 0
        ? (analytics.totalContacts / analytics.totalViews) * 100
        : 0,
    [analytics.totalViews, analytics.totalContacts]
  );

  const quickActions: QuickAction[] = useMemo(
    () => [
      {
        label: "Create Listing",
        href: "/dashboard/create-listing",
        icon: Plus,
        description: "Add a new rental listing",
      },
      {
        label: "Manage Listings",
        href: "/dashboard/listings",
        icon: Package,
        description: "View and edit your listings",
      },
      {
        label: "View Analytics",
        href: "/dashboard/analytics",
        icon: BarChart3,
        description: "Detailed performance insights",
      },
      {
        label: "Manage Profile",
        href: "/dashboard/profile",
        icon: Settings,
        description: "Update your seller profile",
      },
    ],
    []
  );

  // Memoized utility functions
  const formatActivityDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, []);

  const getActivityIcon = useCallback((type: string) => {
    switch (type) {
      case "view":
        return <Eye className="h-4 w-4" />;
      case "contact":
        return <MessageCircle className="h-4 w-4" />;
      case "whatsapp":
        return <MessageCircle className="h-4 w-4 text-green-600" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  }, []);

  // Load enhanced metrics in background
  useEffect(() => {
    const loadEnhancedMetrics = async () => {
      if (!sellerData?.id) return;

      try {
        setIsLoading(true);
        const startTime = performance.now();

        const metrics = await fetchWithCache(
          `enhanced_metrics_${sellerData.id}`,
          () => dashboardQueryOptimizer.getSellerMetrics(sellerData.id),
          5 * 60 * 1000 // 5 minutes cache
        );

        setEnhancedMetrics(metrics);

        const duration = performance.now() - startTime;
        performanceTracker.recordResponseTime(duration);
      } catch (error) {
        console.error("Error loading enhanced metrics:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadEnhancedMetrics();
  }, [sellerData?.id, fetchWithCache]);

  // Memoized recent activity items
  const recentActivityItems = useMemo(
    () =>
      recentActivity
        .slice(0, 5)
        .map((activity) => (
          <ActivityItem
            key={activity.id}
            activity={activity}
            formatActivityDate={formatActivityDate}
            getActivityIcon={getActivityIcon}
          />
        )),
    [recentActivity, formatActivityDate, getActivityIcon]
  );

  // Memoized listing items
  const listingItems = useMemo(
    () =>
      listings
        .slice(0, 6)
        .map((listing) => (
          <ListingItem
            key={listing._id}
            listing={listing}
            isMobile={isMobile}
          />
        )),
    [listings, isMobile]
  );

  // Use enhanced metrics if available, fallback to props
  const displayMetrics = enhancedMetrics || analytics;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, {sellerData.name}!</h1>
            <p className="opacity-90">
              Here's what's happening with your listings today.
            </p>
          </div>
          <Button asChild variant="secondary">
            <Link href="/dashboard/create-listing">
              <Plus className="h-4 w-4 mr-2" />
              Create Listing
            </Link>
          </Button>
        </div>
      </div>

      {/* Metrics Overview */}
      <div
        className={`grid gap-6 ${isMobile ? "grid-cols-1" : "md:grid-cols-2 lg:grid-cols-4"}`}
      >
        <MemoizedMetricsCard
          title="Total Views"
          value={displayMetrics.totalViews}
          change={metricsChanges.views}
          icon={Eye}
          description="Total listing views"
        />
        <MemoizedMetricsCard
          title="Contact Clicks"
          value={displayMetrics.totalContacts}
          change={metricsChanges.contacts}
          icon={MessageCircle}
          description="Contact button clicks"
        />
        <MemoizedMetricsCard
          title="Active Listings"
          value={displayMetrics.activeListings}
          change={metricsChanges.listings}
          icon={Package}
          description="Currently active listings"
        />
        <MemoizedMetricsCard
          title="Performance Score"
          value={performanceScore}
          change={metricsChanges.tier}
          icon={Star}
          description="Based on activity and engagement"
          isPercentage={true}
        />
      </div>

      {/* Custom Analytics Reports */}
      <CustomAnalyticsReports 
        hasCustomAnalyticsReports={subscription.subscription_packages?.features?.custom_analytics_reports === true}
        subscriptionName={subscription.subscription_packages?.name || "Unknown"}
      />

      {/* Package Benefits and Recent Activity */}
      <div
        className={`grid gap-6 ${isMobile ? "grid-cols-1" : "lg:grid-cols-3"}`}
      >
        {/* Package Benefits */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Package Benefits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Your {subscription.subscription_packages?.name || "Pro"} package includes:
              </p>
              <ul className="space-y-2">
                {subscription.subscription_packages?.features?.location_boost && (
                  <li className="text-xs text-muted-foreground flex items-center gap-1">
                    <div className="w-1 h-1 bg-green-500 rounded-full" />
                    Location Boost
                  </li>
                )}
                {subscription.subscription_packages?.features?.priority_support && (
                  <li className="text-xs text-muted-foreground flex items-center gap-1">
                    <div className="w-1 h-1 bg-green-500 rounded-full" />
                    Priority Support
                  </li>
                )}
                {subscription.subscription_packages?.features?.advanced_analytics && (
                  <li className="text-xs text-muted-foreground flex items-center gap-1">
                    <div className="w-1 h-1 bg-green-500 rounded-full" />
                    Advanced Analytics
                  </li>
                )}
                {subscription.subscription_packages?.features?.featured_listing && (
                  <li className="text-xs text-muted-foreground flex items-center gap-1">
                    <div className="w-1 h-1 bg-green-500 rounded-full" />
                    Featured Listings
                  </li>
                )}
                {subscription.subscription_packages?.features?.category_priority_placement && (
                  <li className="text-xs text-muted-foreground flex items-center gap-1">
                    <div className="w-1 h-1 bg-green-500 rounded-full" />
                    Category Priority Placement
                  </li>
                )}
                {subscription.subscription_packages?.features?.search_top_placement && (
                  <li className="text-xs text-muted-foreground flex items-center gap-1">
                    <div className="w-1 h-1 bg-green-500 rounded-full" />
                    Search Top Placement
                  </li>
                )}
                {subscription.subscription_packages?.features?.guaranteed_top_placement && (
                  <li className="text-xs text-muted-foreground flex items-center gap-1">
                    <div className="w-1 h-1 bg-green-500 rounded-full" />
                    Guaranteed Top Placement
                  </li>
                )}
                {subscription.subscription_packages?.features?.custom_analytics_reports && (
                  <li className="text-xs text-muted-foreground flex items-center gap-1">
                    <div className="w-1 h-1 bg-green-500 rounded-full" />
                    Custom Analytics Reports
                  </li>
                )}
                {Array(5)
                  .fill(0)
                  .map((_, index) => (
                    <li
                      key={index}
                      className="text-xs text-muted-foreground flex items-center gap-1"
                    >
                      <div className="w-1 h-1 bg-green-500 rounded-full" />
                      {subscription.subscription_packages?.name === "Basic"
                        ? ["Basic support", "Standard analytics", "Up to 10 listings"][index]
                        : subscription.subscription_packages?.name === "Pro"
                        ? ["Priority support", "Enhanced analytics", "Up to 50 listings"][index]
                        : subscription.subscription_packages?.name === "Premium"
                        ? ["24/7 support", "Advanced analytics", "Unlimited listings"][index]
                        : "Premium benefits"}
                    </li>
                  ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className={isMobile ? "" : "lg:col-span-2"}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No recent activity
                </p>
              ) : (
                recentActivityItems
              )}
            </div>
          </CardContent>
        </Card>

        {/* Subscription Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Subscription Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Current Plan
                </span>
                <Badge
                  variant={
                    subscription.status === "active" ? "default" : "secondary"
                  }
                >
                  {subscription.subscription_packages?.name || "Unknown"} Package
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge
                  variant={
                    subscription.status === "active" ? "default" : "destructive"
                  }
                >
                  {subscription.status.charAt(0).toUpperCase() +
                    subscription.status.slice(1)}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Expires</span>
                <span className="text-sm font-medium">
                  {formatDate(subscription.endDate)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Auto Renew
                </span>
                <Badge variant={subscription.autoRenew ? "default" : "outline"}>
                  {subscription.autoRenew ? "On" : "Off"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Package Usage Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Package Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`grid gap-6 ${isMobile ? "grid-cols-1" : "md:grid-cols-3"}`}
          >
            <MemoizedUsageProgress
              label="Listings"
              used={displayMetrics.totalListings}
              limit={subscription.subscription_packages?.max_listings || 50}
              unit="listings"
            />
            <MemoizedUsageProgress
              label="Featured Listings"
              used={5}
              limit={subscription.subscription_packages?.max_featured_listings || 10}
              unit="featured"
            />
            <MemoizedUsageProgress
              label="Analytics Access"
              used={25}
              limit={subscription.subscription_packages?.analytics_days || 30}
              unit="days"
            />
          </div>
        </CardContent>
      </Card>

      {/* Quick Listing Creator */}
      <div
        className={`grid gap-6 ${isMobile ? "grid-cols-1" : "lg:grid-cols-3"}`}
      >
        <Card className={isMobile ? "" : "lg:col-span-1"}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <QuickListingCreator
              categories={categories}
              onListingCreated={() => {
                // Refresh listings or show success message
                window.location.reload();
              }}
            />
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard/listings">
                <Package className="h-4 w-4 mr-2" />
                Manage All Listings
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard/analytics">
                <BarChart3 className="h-4 w-4 mr-2" />
                View Full Analytics
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Notifications and Performance Insights */}
        <div
          className={`grid gap-6 ${isMobile ? "grid-cols-1" : "lg:grid-cols-2"}`}
        >
          <MemoizedNotificationsPanel
            sellerData={sellerData}
            subscription={subscription}
          />
          <MemoizedPerformanceInsights
            analytics={displayMetrics}
            sellerData={sellerData}
          />
        </div>
      </div>

      {/* Recent Listings Management */}
      {listings.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Recent Listings
              </CardTitle>
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard/listings">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div
              className={`grid gap-4 ${isMobile ? "grid-cols-1" : "md:grid-cols-2 lg:grid-cols-3"}`}
            >
              {listingItems}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading indicator for enhanced metrics */}
      {isLoading && (
        <div className="fixed bottom-4 right-4 bg-background border rounded-lg p-2 shadow-lg">
          <div className="flex items-center gap-2 text-sm">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            <span>Enhancing metrics...</span>
          </div>
        </div>
      )}
    </div>
  );
});
